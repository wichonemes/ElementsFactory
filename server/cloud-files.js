import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export async function storeImage(buffer) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Falta configurar el almacenamiento de imágenes.');
  const image = await sharp(buffer, { limitInputPixels: 40000000 }).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'catalog';
  const filename = `${randomUUID()}.webp`;
  const response = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${filename}`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'image/webp', 'x-upsert': 'false' },
    body: image, signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) throw new Error('No fue posible guardar la imagen en Supabase.');
  return { url: `${url.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${filename}`, filename, size: image.length };
}

export async function storeFile(buffer, originalFilename = 'catalogo.pdf', contentType = 'application/pdf') {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Falta configurar el almacenamiento.');
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'catalog';
  const cleanExt = (originalFilename && originalFilename.includes('.')) ? originalFilename.split('.').pop().toLowerCase() : 'pdf';
  const cleanBase = originalFilename ? originalFilename.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) : 'catalogo';
  const filename = `${cleanBase}_${Date.now()}.${cleanExt}`;
  const response = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${filename}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: buffer,
    signal: AbortSignal.timeout(35000)
  });
  if (!response.ok) throw new Error('No fue posible guardar el archivo en Supabase.');
  return {
    url: `${url.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${filename}`,
    filename,
    size: buffer.length
  };
}

