import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { put } from '@vercel/blob';

function hasVercelBlob() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

export async function storeImage(buffer) {
  const image = await sharp(buffer, { limitInputPixels: 40000000 }).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  const filename = `${randomUUID()}.webp`;

  if (hasVercelBlob()) {
    const blob = await put(`catalog/${filename}`, image, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
      multipart: false
    });
    return { url: blob.url, filename: blob.pathname || `catalog/${filename}`, size: image.length };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Falta configurar el almacenamiento de imágenes.');
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'catalog';
  const response = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${filename}`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'image/webp', 'x-upsert': 'false' },
    body: image, signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) throw new Error('No fue posible guardar la imagen en Supabase.');
  return { url: `${url.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${filename}`, filename, size: image.length };
}

export async function storeFile(buffer, originalFilename = 'catalogo.pdf', contentType = 'application/pdf') {
  const cleanExt = (originalFilename && originalFilename.includes('.')) ? originalFilename.split('.').pop().toLowerCase() : 'pdf';
  const cleanBase = originalFilename ? originalFilename.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) : 'catalogo';
  const filename = `${cleanBase}_${Date.now()}.${cleanExt}`;

  if (hasVercelBlob()) {
    const blob = await put(`catalog/${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      multipart: buffer.length > 8 * 1024 * 1024
    });
    return { url: blob.url, filename: blob.pathname || `catalog/${filename}`, size: buffer.length };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Falta configurar el almacenamiento.');
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'catalog';
  const response = await fetch(`${url.replace(/\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${filename}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': contentType,
      'Content-Length': String(buffer.length),
      'x-upsert': 'true'
    },
    body: buffer,
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.warn(`[STORAGE] Supabase Storage respondió con error ${response.status}: ${errorText}`);
    throw new Error(`No fue posible guardar el archivo en Supabase (${response.status}).`);
  }
  return {
    url: `${url.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${filename}`,
    filename,
    size: buffer.length
  };
}

