const productFields = new Set(`id code sku name priceType price priceUnit status featured worlds categories techniques primaryImage gallery shortDescription fullDescription specifications variants customizationOptions availability createdAt updatedAt whiteBgImage detailImage measureImage dimensionsImage isBundle flashDealConfig stockQuantity badge discountPercent includedItems regularPrice savings`.split(' '));
const settingsFields = new Set(`businessName tagline subtagline whatsappNumber businessEmail serviceZone businessHours quoteNoteDefault freeShippingNotice serviceStatus flashDealsStatus flashDealsLimits campaignsConfig arcadeConfig mobileCatalogConfig`.split(' '));
export const publicProduct = product => Object.fromEntries(Object.entries(product).filter(([key]) => productFields.has(key)));
export const publicSettings = settings => Object.fromEntries(Object.entries(settings).filter(([key]) => settingsFields.has(key)));

export function rateLimit({ limit, windowMs }) {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    if (clients.size > 10000) for (const [id, value] of clients) if (value.until <= now) clients.delete(id);
    let value = clients.get(key);
    if (!value || value.until <= now) {
      if (clients.size > 10000) return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta más tarde.' });
      value = { until: now + windowMs, count: 0 };
      clients.set(key, value);
    }
    if (++value.count > limit) {
      res.set('Retry-After', String(Math.ceil((value.until - now) / 1000)));
      return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' });
    }
    next();
  };
}
