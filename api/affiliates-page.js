// Página "Revendedores & Afiliados" con metadatos propios (SEO + vista previa al compartir).
let shellCache = { html: '', at: 0 };

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

async function loadShell(site) {
  const now = Date.now();
  if (shellCache.html && now - shellCache.at < 5 * 60 * 1000) return shellCache.html;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${site}/index.html`, { signal: controller.signal });
    if (response.ok) shellCache = { html: await response.text(), at: now };
  } catch {
    /* usa el shell en caché si existe */
  } finally {
    clearTimeout(timer);
  }
  return shellCache.html || null;
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'artesano-digital.vercel.app';
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const site = `${proto}://${String(host).split(',')[0]}`;
  const shell = await loadShell(site);

  if (!shell) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Sitio temporalmente no disponible. Intenta de nuevo en unos segundos.');
    return;
  }

  const title = 'Programa de Revendedores & Afiliados — Artesano Digital';
  const description =
    'Gana comisiones del 10% recomendando productos personalizados de nuestro taller o compra desde 12 piezas con 15% de descuento para reventa directa.';
  const canonical = `${site}/afiliados`;
  const image = `${site}/brand/og_artesano_preview.jpg`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonical,
    description
  };

  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Artesano Digital" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  ].join('\n    ');

  let html = shell
    .replace(/<base\s+href="[^"]*"\s*\/?>/gi, '')
    .replace(/<head>/i, '<head>\n    <base href="/" />')
    .replace(/(src|href)="\.\/(assets|brand)\//g, '$1="/$2/');
  html = html.replace(/<title>[^<]*<\/title>/i, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, '');
  html = html.replace(/<meta\s+name="description"[^>]*>/i, '');
  html = html.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '');
  html = html.replace('</head>', `    ${tags}\n  </head>`);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(html);
}
