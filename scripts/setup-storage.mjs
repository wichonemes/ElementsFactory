import 'dotenv/config';
const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'catalog';
if (!url || !key) throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const current = await fetch(`${url}/storage/v1/bucket/${encodeURIComponent(bucket)}`, { headers, signal: AbortSignal.timeout(20000) });
if (current.ok) {
  const existing = await current.json();
  if (!existing.public) throw new Error('El bucket existente es privado; no se cambiarán sus permisos automáticamente.');
  console.log('El bucket público de imágenes ya existe.');
} else {
  const response = await fetch(`${url}/storage/v1/bucket`, { method: 'POST', headers,
    body: JSON.stringify({ id: bucket, name: bucket, public: true, file_size_limit: 15728640, allowed_mime_types: ['image/webp'] }), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`No se pudo crear el bucket (HTTP ${response.status}).`);
  console.log('Bucket de fotos creado. Las subidas requieren la clave privada del servidor.');
}
