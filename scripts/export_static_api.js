import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicApiDir = path.join(rootDir, 'public', 'api');
const srcDataDir = path.join(rootDir, 'src', 'data');
const localDbPath = path.join(rootDir, 'server', 'data', 'db.json');

// Helper to make root-relative URLs relative so they work anywhere (GitHub Pages subfolders, etc.)
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (/^(https?:|data:|blob:|\/\/)/.test(url)) return url;
  if (url.startsWith('/')) return '.' + url;
  return url;
}

function normalizeProductUrls(product) {
  return {
    ...product,
    primaryImage: normalizeUrl(product.primaryImage),
    whiteBgImage: normalizeUrl(product.whiteBgImage),
    detailImage: normalizeUrl(product.detailImage),
    measureImage: normalizeUrl(product.measureImage),
    dimensionsImage: normalizeUrl(product.dimensionsImage),
    gallery: Array.isArray(product.gallery) ? product.gallery.map(normalizeUrl) : []
  };
}

function normalizeWorldUrls(world) {
  return {
    ...world,
    image: normalizeUrl(world.image),
    bannerImage: normalizeUrl(world.bannerImage),
    icon: normalizeUrl(world.icon)
  };
}

function normalizeSettingsUrls(settings) {
  if (!settings) return settings;
  const copy = JSON.parse(JSON.stringify(settings));
  if (copy.campaignsConfig) {
    if (copy.campaignsConfig.bannerImage) {
      copy.campaignsConfig.bannerImage = normalizeUrl(copy.campaignsConfig.bannerImage);
    }
    if (Array.isArray(copy.campaignsConfig.seasons)) {
      copy.campaignsConfig.seasons = copy.campaignsConfig.seasons.map(s => ({
        ...s,
        bannerImage: normalizeUrl(s.bannerImage)
      }));
    }
    if (copy.campaignsConfig.monthlyEvents?.showcaseSlides) {
      copy.campaignsConfig.monthlyEvents.showcaseSlides = copy.campaignsConfig.monthlyEvents.showcaseSlides.map(sl => ({
        ...sl,
        image: normalizeUrl(sl.image)
      }));
    }
  }
  return copy;
}

async function exportStaticApi() {
  console.log('[EXPORT_STATIC_API] Verificando fuente de datos para catálogo estático...');

  // Ensure directories exist
  if (!fs.existsSync(publicApiDir)) fs.mkdirSync(publicApiDir, { recursive: true });
  if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });

  // If running in CI / GitHub Actions where server/data/db.json is gitignored:
  if (!fs.existsSync(localDbPath)) {
    const fallbackPath = path.join(srcDataDir, 'catalogFallback.json');
    const productsJsonPath = path.join(publicApiDir, 'products.json');

    if (fs.existsSync(fallbackPath) && fs.existsSync(productsJsonPath)) {
      console.log('[EXPORT_STATIC_API] Modo CI detectado: server/data/db.json no está en el repo, pero public/api y src/data/catalogFallback.json ya están precompilados. Continuando.');
      return;
    }
    console.warn('[EXPORT_STATIC_API] Advertencia: db.json no encontrado y los respaldos no están completos.');
    return;
  }

  // Ensure server/data dir exists
  fs.mkdirSync(path.dirname(localDbPath), { recursive: true });

  // Dynamically import db modules only when db.json exists
  const { db } = await import('../server/db.js');
  const { publicProduct, publicSettings } = await import('../server/public-data.js');

  const rawProducts = db.getProducts({ status: 'published' }).map(publicProduct);
  const products = rawProducts.map(normalizeProductUrls);
  const worlds = db.getWorlds(true).map(normalizeWorldUrls);
  const categories = db.getCategories(true);
  const settings = normalizeSettingsUrls(publicSettings(db.getSettings()));
  const campaigns = normalizeSettingsUrls({ campaignsConfig: db.getCampaignsConfig() }).campaignsConfig;
  const { coupons } = db.getCoupons({ status: 'active' });
  const arcade = db.getArcadeConfig();

  // 1. Write individual JSON files for public/api/
  fs.writeFileSync(path.join(publicApiDir, 'products.json'), JSON.stringify(products, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicApiDir, 'worlds.json'), JSON.stringify(worlds, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicApiDir, 'categories.json'), JSON.stringify(categories, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicApiDir, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicApiDir, 'campaigns.json'), JSON.stringify(campaigns, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicApiDir, 'coupons.json'), JSON.stringify(coupons, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicApiDir, 'arcade.json'), JSON.stringify(arcade, null, 2), 'utf-8');

  // 2. Write bundled fallback data for src/data/catalogFallback.json
  const bundle = {
    worlds,
    categories,
    products,
    settings,
    campaigns,
    coupons,
    arcade,
    exportedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(srcDataDir, 'catalogFallback.json'), JSON.stringify(bundle, null, 2), 'utf-8');

  console.log(`[EXPORT_STATIC_API] Generación exitosa:
  - ${products.length} productos publicados
  - ${worlds.length} mundos
  - ${categories.length} categorías
  - Configuración y campañas listas`);
}

exportStaticApi().catch(err => {
  console.error('[EXPORT_STATIC_API] Error durante la exportación:', err);
  process.exit(1);
});
