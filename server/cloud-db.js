import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

// Keep the existing business rules, but commit every request atomically in Postgres.
// The revision lock also protects overlapping deployments from lost updates.
export class CloudDatabase {
  constructor(pool) {
    this.pool = pool;
    this.enabled = Boolean(pool);
    this.context = new AsyncLocalStorage();
    this.cachedRevision = null;
    this.cachedData = null;
  }

  current() {
    const context = this.context.getStore();
    if (!context) throw new Error('La base de datos requiere una transacción.');
    return context;
  }

  read() { return structuredClone(this.current().data); }
  save(data) { this.current().data = structuredClone(data); }

  async transaction(action, shouldCommit = () => true, options = {}) {
    if (!this.enabled) return action();
    const { lock = true } = options;
    const client = await this.pool.connect();
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
      const context = { client, data: structuredClone(initial) };
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
    await client.query('INSERT INTO artisan_private.backups (filename, label, data, size_bytes) VALUES ($1, $2, $3::jsonb, $4)', [filename, safeLabel, raw, Buffer.byteLength(raw)]);
    await client.query('DELETE FROM artisan_private.backups WHERE filename IN (SELECT filename FROM artisan_private.backups ORDER BY created_at DESC, filename DESC OFFSET 20)');
    return { filename, label: safeLabel, sizeBytes: Buffer.byteLength(raw), sizeKb: Math.round(Buffer.byteLength(raw) / 1024), createdAt: new Date().toISOString() };
  }

  async listBackups() {
    const { rows } = await this.current().client.query('SELECT filename, label, size_bytes, created_at FROM artisan_private.backups ORDER BY created_at DESC, filename DESC');
    return rows.map(row => ({ filename: row.filename, label: row.label, sizeBytes: row.size_bytes, sizeKb: Math.round(row.size_bytes / 1024), createdAt: row.created_at }));
  }

  async getBackup(filename) {
    const { rows } = await this.current().client.query('SELECT data FROM artisan_private.backups WHERE filename = $1', [filename]);
    return rows[0]?.data || null;
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
    } catch {
      res.end = originalEnd;
      for (const name of ['Content-Length', 'ETag', 'Content-Disposition']) res.removeHeader(name);
      res.status(503).json({ error: 'No se pudo guardar o consultar la información. Intenta nuevamente.' });
    }
  };
}
