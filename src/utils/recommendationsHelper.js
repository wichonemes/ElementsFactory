/**
 * recommendationsHelper.js - Taller Artesano Digital
 * Motor de recomendación inteligente de productos afines por sector (Eventos/Fiestas, Negocios/Oficina, Hogar/Decoración, Personalizados 3D, Juguetes/Gaming)
 */

export const SECTOR_RECOMMENDATION_METADATA = {
  eventos: {
    id: 'eventos',
    sectorName: 'Eventos y Fiestas',
    badge: 'Colección Eventos & Fiestas',
    title: 'Más creaciones para tu evento o celebración',
    subtitle: 'Complementa con paquetes de fiesta, copas, recuerdos y detalles coordinados para tus invitados'
  },
  negocios: {
    id: 'negocios',
    sectorName: 'Negocios y Oficinas',
    badge: 'Línea Comercial & Marca',
    title: 'Más soluciones para tu negocio o marca',
    subtitle: 'Impulsa tu presencia con tazas con logotipo, señalética QR/NFC, tarjeteros y detalles para tus clientes'
  },
  hogar: {
    id: 'hogar',
    sectorName: 'Hogar y Decoración',
    badge: 'Espacios & Vida Cotidiana',
    title: 'Más piezas y diseño para tu hogar',
    subtitle: 'Explora lámparas de diseño, macetas geométricas, colgadores y organizadores para tus espacios'
  },
  personalizados: {
    id: 'personalizados',
    sectorName: 'Personalizados 3D',
    badge: 'Modelado 3D a Medida',
    title: 'Más creaciones personalizadas y figuras 3D',
    subtitle: 'Figuras estilo Funko Pop personalizadas y esculturas 3D modeladas a partir de fotos o dibujos'
  },
  juguetes: {
    id: 'juguetes',
    sectorName: 'Juegos y Juguetes',
    badge: 'Juegos & Sensorial',
    title: 'Más juguetes, fidgets y piezas táctiles',
    subtitle: 'Figuras articuladas print-in-place y clickers mecánicos antiestrés de taller'
  },
  industria: {
    id: 'industria',
    sectorName: 'Industria e Ingeniería',
    badge: 'Polímeros Técnicos',
    title: 'Más piezas técnicas y manufactura bajo demanda',
    subtitle: 'Refacciones automotrices, utillaje y prototipado rápido en materiales de alta resistencia'
  }
};

/**
 * Detecta con alta precisión el sector o ámbito principal de un producto
 */
export function detectProductSector(product, activeWorldContext = null) {
  if (!product) return 'hogar';

  const code = (product.code || '').toUpperCase();
  const id = (product.id || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const worlds = product.worlds || [];
  const area = product.skuBreakdown?.area || '';

  // 1. Respetar contexto de navegación activo si el producto pertenece a ese mundo
  if (activeWorldContext && activeWorldContext !== 'all' && activeWorldContext !== 'flash' && worlds.includes(activeWorldContext)) {
    return activeWorldContext;
  }

  // 2. Personalizados (Funkos, dibujos a 3D, esculturas de retrato)
  if (
    code.startsWith('CUST-') ||
    area === 'CUST' ||
    area === 'PER' ||
    id.includes('funko') ||
    id.includes('dibujo') ||
    worlds.includes('personalizados')
  ) {
    return 'personalizados';
  }

  // 3. Industria (piezas técnicas automotrices, utillaje, prototipos)
  if (
    code.startsWith('IND-') ||
    area === 'IND' ||
    id.includes('tobera') ||
    id.includes('utillaje') ||
    worlds.includes('industria')
  ) {
    return 'industria';
  }

  // 4. Eventos / Fiestas / Bodas / XV Años / Celebraciones
  if (
    code.startsWith('EV-') ||
    code.startsWith('PROMO-EV') ||
    area === 'EVE' ||
    id.includes('boda') ||
    id.includes('ceremonia') ||
    id.includes('copas') ||
    id.includes('patchbar') ||
    id.includes('anticruda') ||
    id.includes('topper') ||
    id.includes('charms') ||
    id.includes('place-card') ||
    id.includes('candy-bar') ||
    (worlds.includes('eventos') && !worlds.includes('negocios') && !worlds.includes('hogar'))
  ) {
    return 'eventos';
  }

  // 5. Negocios / Empresas / Branding / Mostradores
  if (
    code.startsWith('PROMO-BIZ') ||
    area === 'NEG' ||
    area === 'BIZ' ||
    id.includes('tarjetero') ||
    id.includes('qr-comercial') ||
    id.includes('contacto-inteligente') ||
    id.includes('starter-pack') ||
    id.includes('mostrador') ||
    (worlds.includes('negocios') && !worlds.includes('hogar'))
  ) {
    return 'negocios';
  }

  // 6. Juguetes / Fidget / Gaming
  if (
    area === 'JUG' ||
    worlds.includes('juguetes') ||
    worlds.includes('juegos') ||
    id.includes('clicker') ||
    id.includes('fidget')
  ) {
    return 'juguetes';
  }

  // 7. Productos con mundos combinados: desambiguar por nombre o aplicación
  if (worlds.includes('eventos') && (
    name.includes('boda') ||
    name.includes('letrero') ||
    name.includes('copa') ||
    name.includes('invitados') ||
    name.includes('souvenir') ||
    name.includes('fiesta') ||
    name.includes('xv') ||
    name.includes('nupcial')
  )) {
    return 'eventos';
  }

  if (worlds.includes('negocios') && (
    name.includes('escritorio') ||
    name.includes('nfc') ||
    name.includes('logotipo') ||
    name.includes('qr') ||
    name.includes('negocio') ||
    name.includes('mostrador') ||
    name.includes('tarjetero') ||
    name.includes('oficina')
  )) {
    return 'negocios';
  }

  if (worlds.includes('hogar')) {
    return 'hogar';
  }

  return worlds[0] || 'hogar';
}

/**
 * Obtiene los productos recomendados del mismo sector o complementarios al producto activo
 */
export function getRecommendedSectorProducts(currentProduct, allProducts = [], activeWorldContext = null, limit = 8) {
  if (!currentProduct || !Array.isArray(allProducts) || allProducts.length === 0) return [];

  const targetSector = detectProductSector(currentProduct, activeWorldContext);
  const candidates = allProducts.filter(p => p.id !== currentProduct.id && p.status !== 'draft');

  const scored = candidates.map(p => {
    let score = 0;
    const pSector = detectProductSector(p, activeWorldContext);

    // Mismo sector estricto
    if (pSector === targetSector) {
      score += 100;
    } else if (p.worlds?.includes(targetSector)) {
      score += 40;
    }

    // Afinidad en categorías
    const curCats = p.categories || [p.category].filter(Boolean);
    const targetCats = currentProduct.categories || [currentProduct.category].filter(Boolean);
    const sharedCategory = curCats.some(c => targetCats.includes(c));
    if (sharedCategory) score += 30;

    // Bono para paquetes / combos del mismo sector
    if (p.isBundle && (pSector === targetSector || p.worlds?.includes(targetSector))) {
      score += 25;
    }

    // Priorizaciones especializadas solicitadas por el usuario:
    if (targetSector === 'eventos') {
      const isEventParty = p.code?.startsWith('EV-') || p.code?.startsWith('PROMO-EV');
      if (isEventParty) score += 30;
      const lower = (p.name || '').toLowerCase();
      if (lower.includes('copa') || lower.includes('topper') || lower.includes('invitados') || lower.includes('recuerdo') || lower.includes('fiesta')) {
        score += 15;
      }
    } else if (targetSector === 'negocios') {
      const lower = (p.name || '').toLowerCase();
      const isBizItem = lower.includes('taza') || lower.includes('llavero') || lower.includes('nfc') || lower.includes('qr') || lower.includes('tarjetero') || p.code?.startsWith('PROMO-BIZ');
      if (isBizItem) score += 30;
    } else if (targetSector === 'hogar') {
      const lower = (p.name || '').toLowerCase();
      const isHomeItem = lower.includes('lámpara') || lower.includes('lampara') || lower.includes('maceta') || lower.includes('llaves') || lower.includes('posavasos') || p.code?.startsWith('PROMO-HOG');
      if (isHomeItem) score += 25;
    }

    return { product: p, score, pSector };
  });

  // 1. Filtrar primero los que pertenezcan al mismo sector
  const primarySectorMatches = scored
    .filter(item => item.pSector === targetSector || item.product.worlds?.includes(targetSector))
    .sort((a, b) => b.score - a.score);

  // 2. Elementos de respaldo solo si el sector tiene muy pocos productos (ej. juguetes)
  const fallbackMatches = scored
    .filter(item => item.pSector !== targetSector && !item.product.worlds?.includes(targetSector))
    .sort((a, b) => b.score - a.score);

  const combined = [...primarySectorMatches, ...fallbackMatches];
  return combined.slice(0, limit).map(item => item.product);
}
