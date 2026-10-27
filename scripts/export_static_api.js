import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db.js';
import { publicProduct, publicSettings } from '../server/public-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicApiDir = path.join(rootDir, 'public', 'api');
const srcDataDir = path.join(rootDir, 'src', 'data');

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

function exportStaticApi() {
  console.log('[EXPORT_STATIC_API] Iniciando generación de datos estáticos para despliegue sin servidor...');

  // Ensure directories exist
  if (!fs.existsSync(publicApiDir)) fs.mkdirSync(publicApiDir, { recursive: true });
  if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });

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

  console.log(`[EXPORT_STATIC_API] Exito:
  - ${products.length} productos publicados
  - ${worlds.length} mundos
  - ${categories.length} categorías
  - Configuración y campañas listas
  - Archivos creados en public/api/ y src/data/catalogFallback.json`);
}

exportStaticApi();
