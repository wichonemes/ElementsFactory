import app from '../server/index.js';
import { db } from '../server/db.js';
import { cloudDb } from '../server/cloud-db.js';

// Sincronización única por proceso para garantizar SKUs únicos y catálogo al día
// también en el entorno serverless de Vercel (donde el bloque de arranque no corre).
// En Postgres hay que abrir una transacción con commit: las lecturas normales se revierten.
let catalogReady = null;
function ensureCatalog() {
  if (!catalogReady) {
    catalogReady = (async () => {
      try {
        if (cloudDb.enabled) {
          await cloudDb.transaction(async () => {
            db.dedupeProductSkus();
            db.applyPriceReview2026();
          }, () => true, { lock: true });
        } else {
          db.dedupeProductSkus();
          db.applyPriceReview2026();
        }
      } catch (err) {
        console.error('[CATALOG] No se pudo sincronizar el catálogo:', err.message);
        catalogReady = null;
      }
    })();
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
