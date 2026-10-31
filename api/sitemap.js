// Sitemap dinámico: incluye las secciones fijas y todos los productos publicados.
let productsCache = { list: [], at: 0 };

const escapeXml = (value = '') =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const slugOf = product => String(product.slug || product.id || product.code || '').trim();

async function loadProducts(site) {
  const now = Date.now();
  if (productsCache.list.length && now - productsCache.at < 5 * 60 * 1000) return productsCache.list;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${site}/api/products`, { signal: controller.signal });
    if (!response.ok) return productsCache.list;
    const parsed = await response.json();
    const list = Array.isArray(parsed) ? parsed : parsed.products || [];
    productsCache = { list, at: now };
    return list;
  } catch {
    return productsCache.list;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'artesano-digital.vercel.app';
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const site = `${proto}://${String(host).split(',')[0]}`;
  const today = new Date().toISOString().slice(0, 10);

  const staticPages = [
    { loc: `${site}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${site}/nosotros`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${site}/?area=hogar`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${site}/?area=negocios`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${site}/?area=eventos`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${site}/?area=personalizados`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${site}/?area=paquetes-servicios`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${site}/?area=servicios`, priority: '0.8', changefreq: 'monthly' }
  ];

  const products = await loadProducts(site);
  const productPages = products
    .filter(p => p && (p.status === 'published' || !p.status))
    .map(p => ({
      loc: `${site}/producto/${encodeURIComponent(slugOf(p))}`,
      lastmod: (p.updatedAt || p.createdAt || '').slice(0, 10) || today,
      priority: '0.8',
      changefreq: 'monthly'
    }))
    .filter(p => p.loc !== `${site}/producto/`);

  const entries = [...staticPages.map(p => ({ ...p, lastmod: today })), ...productPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    entry => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  res.status(200);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.end(xml);
}
