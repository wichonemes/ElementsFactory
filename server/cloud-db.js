import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_SEED_PATH = path.join(__dirname, 'data', 'db.json');
const TMP_BACKUP_PATH = path.join(os.tmpdir(), 'artesano-cloud-fallback.json');

// Mantiene las reglas de negocio transaccionales en Postgres con atomicidad,
// pero añade un sistema de contingencia y alta disponibilidad autónomo:
// Si la base en la nube excede su cuota (ej. Neon error 53000 a fin de mes)
// o se desconecta, el sistema conmuta instantáneamente al respaldo local/memoria
// garantizando que el catálogo, recetas, SKUs, insumos y reseñas sigan funcionando sin interrupciones.
export class CloudDatabase {
  constructor(pool) {
    this.pool = pool;
    this.enabled = Boolean(pool);
    this.context = new AsyncLocalStorage();
    this.cachedRevision = null;
    this.cachedData = null;
    this.fallbackData = null;
    this.fallbackBackups = new Map();
    this.connectionFailedUntil = 0;
  }

  getFallbackData() {
    if (this.fallbackData && Array.isArray(this.fallbackData.products) && this.fallbackData.products.length > 0) {
      return this.fallbackData;
    }

    // 0. Si se especificó una ruta explícita (ej. en tests de integración), usarla primero
    if (process.env.LOCAL_DB_PATH) {
      try {
        if (fs.existsSync(process.env.LOCAL_DB_PATH)) {
          const raw = fs.readFileSync(process.env.LOCAL_DB_PATH, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.products)) {
            this.fallbackData = parsed;
            return this.fallbackData;
          }
        }
      } catch {}
    }

    // 1. Intenta leer del archivo temporal si hubo escrituras recientes en este proceso
    try {
      if (fs.existsSync(TMP_BACKUP_PATH)) {
        const raw = fs.readFileSync(TMP_BACKUP_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.products) && parsed.products.length > 0) {
          this.fallbackData = parsed;
          return this.fallbackData;
        }
      }
    } catch {}

    // 2. Intenta leer de las posibles ubicaciones de db.json en local y Vercel
    const candidatePaths = [
      DEFAULT_SEED_PATH,
      path.join(process.cwd(), 'server', 'data', 'db.json'),
      path.join(__dirname, '..', 'server', 'data', 'db.json'),
      path.join(__dirname, 'data', 'db.json')
    ].filter(Boolean);

    for (const dbPath of candidatePaths) {
      try {
        if (fs.existsSync(dbPath)) {
          const raw = fs.readFileSync(dbPath, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.products) && parsed.products.length > 0) {
            this.fallbackData = parsed;
            return this.fallbackData;
          }
        }
      } catch {}
    }

    // 3. Intenta con el generador compilado en memoria (createInitialDb de db.js)
    if (typeof this.fallbackSupplier === 'function') {
      try {
        const seed = this.fallbackSupplier();
        if (Array.isArray(seed?.products) && seed.products.length > 0) {
          this.fallbackData = seed;
          return this.fallbackData;
        }
      } catch (err) {
        console.warn('[CLOUD-DB] Advertencia al generar datos de contingencia con fallbackSupplier:', err.message);
      }
    }

    if (this.cachedData && Array.isArray(this.cachedData.products) && this.cachedData.products.length > 0) {
      this.fallbackData = structuredClone(this.cachedData);
      return this.fallbackData;
    }

    this.fallbackData = { products: [], rawMaterials: [], users: [], categories: [], worlds: [], coupons: [], reviews: [], settings: {} };
    return this.fallbackData;
  }

  persistFallbackData(data) {
    if (!data || typeof data !== 'object') return;
    this.fallbackData = structuredClone(data);
    try {
      fs.writeFileSync(TMP_BACKUP_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch {}
    if (process.env.LOCAL_DB_PATH) {
      try {
        fs.writeFileSync(process.env.LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
      } catch {}
    }
  }

  current() {
    const context = this.context.getStore();
    if (!context) {
      return { client: null, data: this.getFallbackData(), isFallback: true };
    }
    return context;
  }

  read() {
    const context = this.context.getStore();
    if (context && context.data) {
      return structuredClone(context.data);
    }
    return structuredClone(this.getFallbackData());
  }

  save(data) {
    const context = this.context.getStore();
    if (context) {
      context.data = structuredClone(data);
    } else {
      this.persistFallbackData(data);
    }
  }

  async runFallbackTransaction(action, shouldCommit = () => true) {
    const initial = this.getFallbackData();
    const context = { client: null, data: structuredClone(initial), isFallback: true };
    const result = await this.context.run(context, action);
    if (shouldCommit()) {
      this.persistFallbackData(context.data);
    }
    return result;
  }

  async transaction(action, shouldCommit = () => true, options = {}) {
    if (!this.enabled) {
      return this.runFallbackTransaction(action, shouldCommit);
    }

    // Si Postgres falló recientemente (ej. cuota excedida en Neon), usar contingencia directa sin penalizar latencia
    if (this.connectionFailedUntil && Date.now() < this.connectionFailedUntil) {
      return this.runFallbackTransaction(action, shouldCommit);
    }

    const { lock = true } = options;
    let client;
    try {
      client = await this.pool.connect();
    } catch (connError) {
      const isQuota = connError.code === '53000' || String(connError.message || '').includes('quota');
      console.warn(`[CLOUD-DB] Postgres no disponible (${connError.code || connError.message}). Modo de alta disponibilidad y contingencia activo.`);
      // Enfriamiento de 60 segundos si la cuota mensual se excedió, 20 segundos para otras fallas
      this.connectionFailedUntil = Date.now() + (isQuota ? 60000 : 20000);
      return this.runFallbackTransaction(action, shouldCommit);
    }

    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL lock_timeout = '8s'");
      await client.query("SET LOCAL statement_timeout = '20s'");
      await client.query("SET LOCAL idle_in_transaction_session_timeout = '15s'");
      const revisionQuery = lock
        ? 'SELECT revision FROM artisan_private.revision WHERE id = 1 FOR UPDATE'
        : 'SELECT revision FROM artisan_private.revision WHERE id = 1';
      const locked = await client.query(revisionQuery);
      if (!locked.rows.length) throw new Error('Falta importar el catálogo en Supabase.');
      const revision = String(locked.rows[0].revision);
      let initial = this.cachedData;
      if (revision !== this.cachedRevision || !initial) {
        const state = await client.query('SELECT key, value FROM artisan_private.state');
        initial = Object.fromEntries(state.rows.map(row => [row.key, row.value]));
      }
      if (!Array.isArray(initial.products) || !initial.users?.length) {
        throw new Error('Falta importar el catálogo y el administrador en Supabase.');
      }
      const context = { client, data: structuredClone(initial), isFallback: false };
      const result = await this.context.run(context, action);
      if (!shouldCommit()) {
        await client.query('ROLLBACK');
        return result;
      }
      let changed = false;
      for (const key of new Set([...Object.keys(initial), ...Object.keys(context.data)])) {
        if (JSON.stringify(initial[key]) === JSON.stringify(context.data[key])) continue;
        changed = true;
        if (!(key in context.data)) {
          await client.query('DELETE FROM artisan_private.state WHERE key = $1', [key]);
        } else {
          await client.query('INSERT INTO artisan_private.state (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, JSON.stringify(context.data[key])]);
        }
      }
      let nextRevision = revision;
      if (changed) {
        const updated = await client.query('UPDATE artisan_private.revision SET revision = revision + 1 WHERE id = 1 RETURNING revision');
        nextRevision = String(updated.rows[0].revision);
      }
      await client.query('COMMIT');
      this.cachedRevision = nextRevision;
      this.cachedData = structuredClone(context.data);
      this.fallbackData = structuredClone(context.data);
      this.connectionFailedUntil = 0;
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      this.cachedRevision = null;
      this.cachedData = null;
      throw error;
    } finally {
      client.release();
    }
  }

  async createBackup(label = 'manual') {
    const { client, data } = this.current();
    const safeLabel = String(label || 'manual').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}-${safeLabel}.json`;
    const raw = JSON.stringify(data);
    const sizeBytes = Buffer.byteLength(raw);
    const sizeKb = Math.round(sizeBytes / 1024);
    const createdAt = new Date().toISOString();

    if (client) {
      await client.query('INSERT INTO artisan_private.backups (filename, label, data, size_bytes) VALUES ($1, $2, $3::jsonb, $4)', [filename, safeLabel, raw, sizeBytes]);
      await client.query('DELETE FROM artisan_private.backups WHERE filename IN (SELECT filename FROM artisan_private.backups ORDER BY created_at DESC, filename DESC OFFSET 20)');
    } else {
      if (!this.fallbackBackups) this.fallbackBackups = new Map();
      this.fallbackBackups.set(filename, { filename, label: safeLabel, data: raw, sizeBytes, sizeKb, createdAt });
      try {
        const backupDir = path.join(os.tmpdir(), 'artesano-backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        fs.writeFileSync(path.join(backupDir, filename), raw, 'utf8');
      } catch {}
    }
    return { filename, label: safeLabel, sizeBytes, sizeKb, createdAt };
  }

  async listBackups() {
    const { client } = this.current();
    if (client) {
      const { rows } = await client.query('SELECT filename, label, size_bytes, created_at FROM artisan_private.backups ORDER BY created_at DESC, filename DESC');
      return rows.map(row => ({ filename: row.filename, label: row.label, sizeBytes: row.size_bytes, sizeKb: Math.round(row.size_bytes / 1024), createdAt: row.created_at }));
    }
    if (!this.fallbackBackups) this.fallbackBackups = new Map();
    return Array.from(this.fallbackBackups.values())
      .map(b => ({ filename: b.filename, label: b.label, sizeBytes: b.sizeBytes, sizeKb: b.sizeKb, createdAt: b.createdAt }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getBackup(filename) {
    const { client } = this.current();
    if (client) {
      const { rows } = await client.query('SELECT data FROM artisan_private.backups WHERE filename = $1', [filename]);
      return rows[0]?.data || null;
    }
    if (!this.fallbackBackups) this.fallbackBackups = new Map();
    const item = this.fallbackBackups.get(filename);
    if (item) return JSON.parse(item.data);
    try {
      const filePath = path.join(os.tmpdir(), 'artesano-backups', filename);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch {}
    return null;
  }

  async restoreBackup(filename) {
    const data = await this.getBackup(filename);
    if (!data || !Array.isArray(data.products) || !data.users?.length) throw new Error('Respaldo no válido o no encontrado.');
    await this.createBackup('pre-restoration');
    this.save(data);
    return { success: true, restoredFile: filename, productsCount: data.products.length, timestamp: new Date().toISOString() };
  }
}

export function createPool(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) return null;
  const url = new URL(connectionString);
  // Verify TLS certificates. A provider CA can be supplied when required.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  return new pg.Pool({ connectionString: url.toString(), max: 3, connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : {}) } });
}

export const cloudDb = new CloudDatabase(createPool());

// Delay sending JSON until COMMIT succeeds, so a failed write never looks saved.
export function durableHandler(store, handler) {
  if (!store.enabled) return handler;
  return async (req, res, next) => {
    const originalEnd = res.end;
    let pending;
    res.end = function (...args) { pending = args; return this; };
    const readOnly = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
    try {
      await store.transaction(async () => {
        await handler(req, res, next);
        if (!pending) throw new Error('La ruta no produjo una respuesta.');
      }, () => !readOnly && res.statusCode < 400, { lock: !readOnly });
      res.end = originalEnd;
      originalEnd.apply(res, pending);
    } catch (err) {
      res.end = originalEnd;
      for (const name of ['Content-Length', 'ETag', 'Content-Disposition']) res.removeHeader(name);
      res.status(503).json({ error: 'No se pudo guardar o consultar la información. Intenta nuevamente.' });
    }
  };
}
