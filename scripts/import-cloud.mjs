import 'dotenv/config';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { createPool } from '../server/cloud-db.js';

// Run locally once. The private catalog is sent directly to Postgres, never Git.
const source = process.argv[2];
if (!source || !process.env.DATABASE_URL) throw new Error('Indica el archivo db.json y configura DATABASE_URL.');
const data = JSON.parse(await fs.readFile(source, 'utf8'));
if (!Array.isArray(data.products) || !data.users?.length) throw new Error('Catálogo no válido.');
if (data.users.some(user => bcrypt.compareSync('Artesano2026!', user.passwordHash))) {
  throw new Error('Cambia primero la contraseña predeterminada desde el administrador local.');
}
const pool = createPool();
const client = await pool.connect();
try {
  const schema = await fs.readFile(fileURLToPath(new URL('../deploy/schema.sql', import.meta.url)), 'utf8');
  await client.query(schema);
  await client.query('BEGIN');
  await client.query('SELECT revision FROM artisan_private.revision WHERE id = 1 FOR UPDATE');
  const existing = await client.query('SELECT key FROM artisan_private.state LIMIT 1');
  if (existing.rows.length) throw new Error('Supabase ya contiene datos. La importación inicial no los sobrescribe.');
  for (const [key, value] of Object.entries(data)) {
    await client.query('INSERT INTO artisan_private.state (key, value) VALUES ($1, $2::jsonb)', [key, JSON.stringify(value)]);
  }
  await client.query('UPDATE artisan_private.revision SET revision = revision + 1 WHERE id = 1');
  await client.query('COMMIT');
  console.log(`Importación completada: ${data.products.length} productos. Datos privados enviados únicamente a tu base de datos.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  throw error;
} finally { client.release(); await pool.end(); }
