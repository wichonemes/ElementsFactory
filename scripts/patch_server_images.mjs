import fs from 'fs';
import path from 'path';

const file = path.resolve('server/index.js');
let content = fs.readFileSync(file, 'utf8');

const targetOld = `// Imágenes servidas desde Vercel Blob (con migración automática desde el origen anterior).
const IMAGE_BLOB_CACHE = new Map();
const IMAGE_BLOB_CACHE_MS = 10 * 60 * 1000;

async function resolveImageFromBlob(pathname) {
  const cached = IMAGE_BLOB_CACHE.get(pathname);
  if (cached && Date.now() - cached.at < IMAGE_BLOB_CACHE_MS) {
    return { contentType: cached.contentType, buffer: cached.buffer };
  }
  let result = null;
  try {
    result = (await getBlob(pathname, { access: 'public' })) || null;
  } catch {
    result = null;
  }
  if ((!result || result.statusCode !== 200) && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await putFromUrl(pathname, \`https://wichonemes.github.io/artesano/\${pathname}\`, { access: 'public' });
      result = (await getBlob(pathname, { access: 'public' })) || null;
    } catch (err) {
      console.warn(\`[IMAGES] No se pudo migrar la imagen \${pathname} a Vercel Blob:\`, err?.message || err);
    }
  }
  const ok = Boolean(result && result.statusCode === 200);
  const entry = ok
    ? { contentType: result.blob.contentType || 'image/webp', buffer: Buffer.from(await new Response(result.stream).arrayBuffer()) }
    : null;
  if (entry) IMAGE_BLOB_CACHE.set(pathname, { at: Date.now(), ...entry });
  return entry;
}`;

const newBlock = `// Imágenes servidas desde Vercel Blob (con migración automática desde el origen anterior y respaldo directo).
const IMAGE_BLOB_CACHE = new Map();
const IMAGE_BLOB_CACHE_MS = 10 * 60 * 1000;

const MIME_MAP = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

async function resolveImageFromBlob(pathname) {
  const cached = IMAGE_BLOB_CACHE.get(pathname);
  if (cached && Date.now() - cached.at < IMAGE_BLOB_CACHE_MS) {
    return { contentType: cached.contentType, buffer: cached.buffer };
  }

  // 1. Revisar si el archivo existe en disco local (public/ o dist/)
  const localCandidates = [
    path.join(__dirname, '..', 'public', pathname),
    path.join(__dirname, '..', 'dist', pathname)
  ];
  for (const localPath of localCandidates) {
    if (fs.existsSync(localPath)) {
      try {
        const stat = fs.statSync(localPath);
        if (stat.isFile()) {
          const buffer = fs.readFileSync(localPath);
          const ext = path.extname(localPath).toLowerCase();
          const contentType = MIME_MAP[ext] || 'application/octet-stream';
          const entry = { contentType, buffer };
          IMAGE_BLOB_CACHE.set(pathname, { at: Date.now(), ...entry });
          return entry;
        }
      } catch {}
    }
  }

  // 2. Revisar si ya está guardado en Vercel Blob
  let result = null;
  try {
    result = (await getBlob(pathname, { access: 'public' })) || null;
  } catch {
    result = null;
  }

  // 3. Si no está en Blob y existe token de escritura, intentar migrarlo
  if ((!result || result.statusCode !== 200) && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await putFromUrl(pathname, \`https://wichonemes.github.io/artesano/\${pathname}\`, { access: 'public' });
      result = (await getBlob(pathname, { access: 'public' })) || null;
    } catch (err) {
      console.warn(\`[IMAGES] No se pudo migrar la imagen \${pathname} a Vercel Blob:\`, err?.message || err);
    }
  }

  let entry = null;
  if (result && result.statusCode === 200 && result.stream) {
    try {
      const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
      const ext = path.extname(pathname).toLowerCase();
      const contentType = result.blob?.contentType || MIME_MAP[ext] || 'image/webp';
      entry = { contentType, buffer };
    } catch (err) {
      console.warn(\`[IMAGES] Error al leer stream de Blob para \${pathname}:\`, err?.message || err);
    }
  }

  // 4. RESPALDO CRÍTICO: Si Blob no la tiene o falló la migración (p. ej. SVGs o límites), pedirla al origen directo
  if (!entry) {
    try {
      const originRes = await fetch(\`https://wichonemes.github.io/artesano/\${pathname}\`);
      if (originRes.ok) {
        const buffer = Buffer.from(await originRes.arrayBuffer());
        const ext = path.extname(pathname).toLowerCase();
        const contentType = originRes.headers.get('content-type') || MIME_MAP[ext] || 'image/webp';
        entry = { contentType, buffer };
      }
    } catch (err) {
      console.warn(\`[IMAGES] Fallback a origen falló para \${pathname}:\`, err?.message || err);
    }
  }

  if (entry) {
    IMAGE_BLOB_CACHE.set(pathname, { at: Date.now(), ...entry });
  }
  return entry;
}`;

// Normalize line endings for replacement
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetOld.replace(/\r\n/g, '\n');
const normNew = newBlock.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
  console.error('Target not found!');
  process.exit(1);
}

const replaced = normContent.replace(normTarget, normNew);
fs.writeFileSync(file, replaced, 'utf8');
console.log('Successfully updated server/index.js!');
