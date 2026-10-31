import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CloudDatabase, durableHandler } from '../server/cloud-db.js';

const fixture = () => ({ users: [{ id: 'test-admin', username: 'admin', email: 'admin@example.test', role: 'superadmin', passwordHash: bcrypt.hashSync('Only-for-isolated-tests!', 4) }],
  products: [{ id: 'public', name: 'Producto de prueba', status: 'published', costPrice: 10, privateNotes: 'INTERNAL', costBreakdown: { material: 10 } }, { id: 'draft', status: 'draft' }],
  categories: [], worlds: [{ id: 'hogar', name: 'Hogar' }], rawMaterials: [{ id: 'test-material' }],
  settings: { businessName: 'Prueba', whatsappNumber: '0000000000', workshopParams: { laborPerHour: 80 }, workshopWorkers: [{ name: 'Private' }] },
  analytics: { pageViews: 0, events: [] }, orders: [], publications: [], pubTracking: [] });

function poolFor(database) {
  let tail = Promise.resolve();
  return { async connect() {
    const before = tail;
    let unlock;
    tail = new Promise(resolve => { unlock = resolve; });
    await before;
    return { query: (sql, args) => database.query(sql, args), release: unlock };
  } };
}

async function removeTestDir(directory) {
  const resolved = path.resolve(directory);
  assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
  assert.ok(path.basename(resolved).startsWith('artesano-hosting-test-'));
  await fs.rm(resolved, { recursive: true, force: true });
}

test('Postgres: persistencia, concurrencia, recuperación y respuestas fiables', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'artesano-hosting-test-'));
  let database = new PGlite(directory);
  let store;
  try {
    await database.exec(await fs.readFile(new URL('../deploy/schema.sql', import.meta.url), 'utf8'));
    for (const [key, value] of Object.entries(fixture())) {
      await database.query('INSERT INTO artisan_private.state VALUES ($1, $2::jsonb)', [key, JSON.stringify(value)]);
    }
    store = new CloudDatabase(poolFor(database));
    await t.test('actualizaciones concurrentes no pierden contadores', async () => {
      await Promise.all(Array.from({ length: 12 }, () => store.transaction(async () => {
        const data = store.read();
        data.analytics.pageViews++;
        await Promise.resolve();
        store.save(data);
      })));
      await store.transaction(() => assert.equal(store.read().analytics.pageViews, 12));
    });
    await t.test('un error cancela la operación completa', async () => {
      await assert.rejects(store.transaction(() => { const data = store.read(); data.products = []; store.save(data); throw new Error('test failure'); }));
      await store.transaction(() => assert.equal(store.read().products.length, 2));
    });
    await t.test('respaldo, edición y restauración en la nube', async () => {
      let backup;
      await store.transaction(async () => { backup = await store.createBackup('test'); });
      await store.transaction(() => { const data = store.read(); data.products[0].name = 'Editado'; store.save(data); });
      await store.transaction(async () => { assert.equal((await store.listBackups()).length, 1); await store.restoreBackup(backup.filename); });
      await store.transaction(() => assert.equal(store.read().products[0].name, 'Producto de prueba'));
      await store.transaction(async () => assert.equal((await store.listBackups()).length, 2));
    });
    await t.test('otra instancia detecta cambios mediante la revisión', async () => {
      const other = new CloudDatabase(poolFor(database));
      await other.transaction(() => assert.equal(other.read().analytics.pageViews, 12));
      await store.transaction(() => { const data = store.read(); data.analytics.pageViews = 23; store.save(data); });
      await other.transaction(() => assert.equal(other.read().analytics.pageViews, 23));
    });
    await t.test('los datos y respaldos sobreviven al cierre y reapertura', async () => {
      await database.close();
      database = new PGlite(directory);
      store = new CloudDatabase(poolFor(database));
      await store.transaction(async () => { assert.equal(store.read().analytics.pageViews, 23); assert.equal((await store.listBackups()).length, 2); });
    });
    await t.test('si COMMIT falla, la API no confirma que se guardó', async () => {
      const actualPool = poolFor(database);
      const failureStore = new CloudDatabase({ async connect() {
        const client = await actualPool.connect();
        return { release: client.release, async query(sql, args) { if (sql === 'COMMIT') throw new Error('Simulated commit failure'); return client.query(sql, args); } };
      } });
      const app = express();
      app.post('/test', durableHandler(failureStore, (_req, res) => { const data = failureStore.read(); data.analytics.pageViews = 999; failureStore.save(data); res.json({ ok: true }); }));
      const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
      try { const response = await fetch(`http://127.0.0.1:${server.address().port}/test`, { method: 'POST' }); assert.equal(response.status, 503); assert.ok((await response.json()).error); }
      finally { await new Promise(resolve => server.close(resolve)); }
      await store.transaction(() => assert.equal(store.read().analytics.pageViews, 23));
    });
    await t.test('errores de validación descartan los cambios parciales', async () => {
      await store.transaction(() => { const data = store.read(); data.products = []; store.save(data); }, () => false);
      await store.transaction(() => assert.equal(store.read().products.length, 2));
    });
    await t.test('ante cuota de Postgres excedida (53000) o desconexión, activa respaldo autónomo sin 503', async () => {
      const quotaStore = new CloudDatabase({
        connect() {
          const quotaErr = new Error('Your account or project has exceeded the quota. Upgrade your plan to increase limits.');
          quotaErr.code = '53000';
          return Promise.reject(quotaErr);
        }
      });
      quotaStore.fallbackData = fixture();
      const app = express();
      app.get('/test-quota-get', durableHandler(quotaStore, (_req, res) => {
        const data = quotaStore.read();
        res.json({ count: data.products.length });
      }));
      app.post('/test-quota-post', durableHandler(quotaStore, (_req, res) => {
        const data = quotaStore.read();
        data.products.push({ id: 'nuevo-en-contingencia', name: 'Nuevo', status: 'published' });
        quotaStore.save(data);
        res.json({ ok: true, count: data.products.length });
      }));
      const server = app.listen(0, '127.0.0.1');
      await once(server, 'listening');
      try {
        const getRes = await fetch(`http://127.0.0.1:${server.address().port}/test-quota-get`);
        assert.equal(getRes.status, 200);
        const getData = await getRes.json();
        assert.equal(getData.count, 2);

        const postRes = await fetch(`http://127.0.0.1:${server.address().port}/test-quota-post`, { method: 'POST' });
        assert.equal(postRes.status, 200);
        const postData = await postRes.json();
        assert.equal(postData.count, 3);
      } finally {
        await new Promise(resolve => server.close(resolve));
      }
    });
  } finally { await database.close(); await removeTestDir(directory); }
});

test('API real: catálogo público y administrador protegido', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'artesano-hosting-test-'));
  const dbPath = path.join(directory, 'db.json');
  await fs.writeFile(dbPath, JSON.stringify(fixture()));
  const secret = randomBytes(48).toString('hex');
  const proc = spawn(process.execPath, ['server/index.js'], { cwd: new URL('..', import.meta.url), windowsHide: true,
    env: { ...process.env, NODE_ENV: 'test', PORT: '0', DATABASE_URL: '', LOCAL_DB_PATH: dbPath, JWT_SECRET: secret } });
  let logs = '';
  proc.stderr.on('data', bytes => { logs += bytes; });
  const ready = new Promise((resolve, reject) => {
    proc.stdout.on('data', bytes => { const match = String(bytes).match(/http:\/\/localhost:(\d+)/); if (match) resolve(Number(match[1])); });
    proc.on('exit', code => reject(new Error(`Server exited ${code}: ${logs}`)));
  });
  let timer;
  try {
    const port = await Promise.race([ready, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Startup timeout: ' + logs)), 20000); })]);
    clearTimeout(timer);
    const base = `http://127.0.0.1:${port}`;
    await t.test('no permite editar banners sin iniciar sesión', async () => {
      for (const method of ['PUT', 'POST']) assert.equal((await fetch(base + '/api/worlds/hogar', { method, headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
    });
    await t.test('no publica borradores, costos ni notas privadas', async () => {
      const data = await (await fetch(base + '/api/products?status=all')).json();
      assert.equal(data.length, 1);
      for (const key of ['privateNotes', 'costPrice', 'costBreakdown']) assert.equal(key in data[0], false);
      assert.equal((await fetch(base + '/api/products/draft')).status, 404);
      const settings = await (await fetch(base + '/api/settings')).json();
      assert.equal('workshopParams' in settings, false); assert.equal('workshopWorkers' in settings, false);
    });
    await t.test('el administrador conserva datos privados y edición', async () => {
      const token = jwt.sign({ id: 'test-admin', role: 'superadmin' }, secret, { expiresIn: '5m' });
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const admin = await (await fetch(base + '/api/admin/products', { headers })).json();
      assert.equal(admin.length, 2); assert.equal(admin[0].privateNotes, 'INTERNAL');
      const settings = await (await fetch(base + '/api/admin/settings', { headers })).json();
      assert.equal(settings.workshopParams.laborPerHour, 80);
      const response = await fetch(base + '/api/worlds/hogar', { method: 'PUT', headers, body: JSON.stringify({ tagline: 'Guardado' }) });
      assert.equal(response.status, 200);
      assert.equal(JSON.parse(await fs.readFile(dbPath, 'utf8')).worlds[0].tagline, 'Guardado');
    });
    await t.test('login válido, rol incorrecto y ruta inexistente', async () => {
      const response = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'Only-for-isolated-tests!' }) });
      assert.equal(response.status, 200); assert.ok((await response.json()).token);
      const token = jwt.sign({ role: 'viewer' }, secret);
      assert.equal((await fetch(base + '/api/admin/products', { headers: { Authorization: `Bearer ${token}` } })).status, 403);
      assert.equal((await fetch(base + '/api/not-found')).status, 404);
    });
  } finally { clearTimeout(timer); const exited = once(proc, 'exit'); proc.kill(); await exited; await removeTestDir(directory); }
});
