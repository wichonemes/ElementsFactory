// Página pública de producto con metadatos propios (SEO + vista previa en WhatsApp).
// Sirve el mismo shell de la SPA, pero con <title>, description, canonical, Open Graph,
// Twitter Card y datos estructurados (schema.org/Product) del producto solicitado.

const PRODUCT_FALLBACK_TIMEOUT = 8000;
let shellCache = { html: '', at: 0 };
let productsCache = { list: [], at: 0 };

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const plainText = (value = '') =>
  String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const absoluteUrl = (site, pathOrUrl = '') => {
  if (!pathOrUrl) return `${site}/brand/og_artesano_preview.jpg`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${site}/${String(pathOrUrl).replace(/^\.?\//, '')}`;
};

const slugOf = product => String(product.slug || product.id || product.code || '').trim();

const findProduct = (list, slug) => {
  const needle = decodeURIComponent(String(slug || '')).trim().toLowerCase();
  if (!needle) return null;
  return (
    list.find(p => String(p.slug || '').toLowerCase() === needle) ||
    list.find(p => String(p.id || '').toLowerCase() === needle) ||
    list.find(p => String(p.code || '').toLowerCase() === needle) ||
    null
  );
};

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: '*/*' } });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadShell(site) {
  const now = Date.now();
  if (shellCache.html && now - shellCache.at < 5 * 60 * 1000) return shellCache.html;
  const html = await fetchWithTimeout(`${site}/index.html`, PRODUCT_FALLBACK_TIMEOUT);
  if (html) shellCache = { html, at: now };
  return shellCache.html || null;
}

async function loadProducts(site) {
  const now = Date.now();
  if (productsCache.list.length && now - productsCache.at < 60 * 1000) return productsCache.list;
  const raw = await fetchWithTimeout(`${site}/api/products`, PRODUCT_FALLBACK_TIMEOUT);
  if (!raw) return productsCache.list;
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.products || [];
    productsCache = { list, at: now };
    return list;
  } catch {
    return productsCache.list;
  }
}

function buildMetaTags(site, product, canonical) {
  const name = escapeHtml(product.name);
  const description = escapeHtml(
    plainText(product.shortDescription || product.fullDescription || '').slice(0, 300) ||
      `Producto personalizado de Artesano Digital: ${product.name}`
  );
  const image = escapeHtml(absoluteUrl(site, product.primaryImage || (product.gallery || [])[0]));
  const price = Number(product.price || 0);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: plainText(product.shortDescription || product.fullDescription || '').slice(0, 500),
    image: [image.replace(/&amp;/g, '&')],
    sku: product.sku || product.code || undefined,
    brand: { '@type': 'Brand', name: 'Artesano Digital' },
    ...(price > 0
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'MXN',
            price: price.toFixed(2),
            availability: 'https://schema.org/InStock',
            url: canonical
          }
        }
      : {})
  };

  const tags = [
    `<base href="/" />`,
    `<title>${name} | Artesano Digital</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="Artesano Digital" />`,
    `<meta property="og:title" content="${name} | Artesano Digital" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:secure_url" content="${image}" />`,
    `<meta property="og:image:alt" content="${name}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${name} | Artesano Digital" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    price > 0 ? `<meta property="product:price:amount" content="${price.toFixed(2)}" />` : '',
    price > 0 ? `<meta property="product:price:currency" content="MXN" />` : '',
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
    `<script>window.__ARTESANO_PRODUCT__=${JSON.stringify(slugOf(product)).replace(/</g, '\\u003c')};</script>`
  ].filter(Boolean);

  return tags.join('\n    ');
}

function injectIntoSite(html, tags) {
  const withoutOld = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="product:[^"]*"[^>]*>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  return withoutOld.replace(/<\/head>/i, `    ${tags}\n  </head>`);
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'artesano-digital.vercel.app';
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const site = `${proto}://${String(host).split(',')[0]}`;
  const url = new URL(req.url || '/', site);
  const slug = url.searchParams.get('slug') || url.searchParams.get('__slug') || url.pathname.split('/').filter(Boolean).pop();

  const [shell, products] = await Promise.all([loadShell(site), loadProducts(site)]);
  const product = findProduct(products, slug);

  if (!shell) {
    res.status(503).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Sitio temporalmente no disponible. Intenta de nuevo en unos segundos.');
    return;
  }

  if (!product) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(shell);
    return;
  }

  const canonical = `${site}/producto/${encodeURIComponent(slugOf(product))}`;
  const html = injectIntoSite(shell, buildMetaTags(site, product, canonical));

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
  res.end(html);
}
