import fs from 'fs';

const filePath = 'server/index.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Variant fallback in resolveImageFromBlob
const oldCacheSet = `  if (entry) {
    IMAGE_BLOB_CACHE.set(pathname, { at: Date.now(), ...entry });
  }
  return entry;
}`;

const newCacheSet = `  // 5. RESPALDO INTELIGENTE DE VARIANTES: Si se pidió una variante optimizada (-card o -medium)
  // y no existe como archivo separado, servir la imagen base original para que nunca se rompa.
  if (!entry) {
    const variantMatch = pathname.match(/^(.*)-(card|medium)\\.([a-z0-9]+)$/i);
    if (variantMatch) {
      const baseStem = variantMatch[1];
      const ext = variantMatch[3];
      entry = await resolveImageFromBlob(\`\${baseStem}.\${ext}\`);
      if (!entry) {
        for (const candidateExt of ['webp', 'jpg', 'jpeg', 'png']) {
          if (candidateExt !== ext.toLowerCase()) {
            entry = await resolveImageFromBlob(\`\${baseStem}.\${candidateExt}\`);
            if (entry) break;
          }
        }
      }
    }
  }

  if (entry) {
    IMAGE_BLOB_CACHE.set(pathname, { at: Date.now(), ...entry });
  }
  return entry;
}`;

// 2. Move app.get outside if (fs.existsSync(distIndex))
const oldRouteBlock = `// Fallback for SPA routing if dist exists con soporte para Open Graph dinámico en WhatsApp
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
  app.get(/^\\/((?:uploads|brand|portafolio|portfolio|interfaces|products|downloads|animacion|audiovisual|editorial|fotografia|identidad-corporativa|ilustracion|impresos|maquetado-inicio-wicho-v2|mi-portafolio|modelado-3d|optimized)\\/.+)$/, async (req, res) => {
  try {
    const pathname = decodeURIComponent(String(req.params[0] || '')).replace(/^\\/+/, '');
    const image = await resolveImageFromBlob(pathname);
    if (!image) return res.status(404).json({ error: 'Imagen no encontrada.' });
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).end(image.buffer);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Error al servir la imagen.' });
  }
});

app.use((req, res) => {`;

const newRouteBlock = `// Endpoint global para servir imágenes de uploads, brand y portafolio con fallback resiliente
app.get(/^\\/((?:uploads|brand|portafolio|portfolio|interfaces|products|downloads|animacion|audiovisual|editorial|fotografia|identidad-corporativa|ilustracion|impresos|maquetado-inicio-wicho-v2|mi-portafolio|modelado-3d|optimized)\\/.+)$/, async (req, res) => {
  try {
    const pathname = decodeURIComponent(String(req.params[0] || '')).replace(/^\\/+/, '');
    const image = await resolveImageFromBlob(pathname);
    if (!image) return res.status(404).json({ error: 'Imagen no encontrada.' });
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).end(image.buffer);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Error al servir la imagen.' });
  }
});

// Fallback for SPA routing if dist exists con soporte para Open Graph dinámico en WhatsApp
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
  app.use((req, res) => {`;

let norm = content.replace(/\r\n/g, '\n');

if (!norm.includes(oldCacheSet.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldCacheSet in server/index.js');
  process.exit(1);
}
norm = norm.replace(oldCacheSet.replace(/\r\n/g, '\n'), newCacheSet.replace(/\r\n/g, '\n'));

if (!norm.includes(oldRouteBlock.replace(/\r\n/g, '\n'))) {
  console.error('Failed to match oldRouteBlock in server/index.js');
  process.exit(1);
}
norm = norm.replace(oldRouteBlock.replace(/\r\n/g, '\n'), newRouteBlock.replace(/\r\n/g, '\n'));

if (content.includes('\r\n')) {
  norm = norm.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, norm, 'utf8');
console.log('Successfully patched server/index.js');
