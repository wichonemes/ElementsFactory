import app from '../server/index.js';
import { db } from '../server/db.js';

// Sincronización única por proceso para garantizar SKUs únicos y catálogo al día
// también en el entorno serverless de Vercel (donde el bloque de arranque no corre).
let catalogReady = null;
function ensureCatalog() {
  if (!catalogReady) {
    catalogReady = Promise.resolve().then(() => {
      try {
        db.syncCatalogWithCodebase();
      } catch (err) {
        console.error('[CATALOG] No se pudo sincronizar el catálogo:', err.message);
      }
    });
  }
  return catalogReady;
}

export default async function handler(req, res) {
  await ensureCatalog();
  const url = req.url || '/api';
  const [pathname, search = ''] = url.split('?');
  const params = new URLSearchParams(search);
  params.delete('__path');
  const query = params.toString();
  req.url = pathname + (query ? `?${query}` : '');
  return app(req, res);
}
