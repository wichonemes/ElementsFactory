// Página "Nosotros" con metadatos propios (SEO + vista previa al compartir).
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
    res.status(503).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Sitio temporalmente no disponible. Intenta de nuevo en unos segundos.');
    return;
  }

  const title = 'Nosotros — Taller de diseño y fabricación digital | Artesano Digital';
  const description =
    'Somos un taller mexicano de diseño y fabricación digital en San Luis Potosí: impresión 3D, corte láser, sublimación, vinil y NFC para empresas, hogares y eventos.';
  const canonical = `${site}/nosotros`;
  const image = `${site}/brand/og_artesano_preview.jpg`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Nosotros — Artesano Digital',
    url: canonical,
    description,
    about: {
      '@type': 'Organization',
      name: 'Artesano Digital',
      url: `${site}/`,
      logo: `${site}/brand/logo_icon_19.png`,
      address: { '@type': 'PostalAddress', addressLocality: 'San Luis Potosí', addressCountry: 'MX' },
      areaServed: 'México'
    }
  };

  const tags = [
    `<base href="/" />`,
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
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
  ].join('\n    ');

  const html = shell
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
    .replace(/<\/head>/i, `    ${tags}\n  </head>`);

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  res.end(html);
}
