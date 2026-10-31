// couponsHelper.js - Validador y Calculador de Cupones y Códigos de Descuento

export const DEFAULT_COUPONS = [
  // Cupones de Arcade (Ganados con Monedas de Juego)
  { code: 'TALLER5', category: 'arcade', type: 'percent', value: 5, label: '5% de Descuento Arcade', minPurchase: 100 },
  { code: 'TALLER10', category: 'arcade', type: 'percent', value: 10, label: '10% de Descuento Arcade', minPurchase: 250 },
  { code: 'TALLER15', category: 'arcade', type: 'percent', value: 15, label: '15% de Descuento Arcade', minPurchase: 350 },
  { code: 'TALLER15VIP', category: 'arcade', type: 'percent', value: 15, label: '15% de Descuento VIP Arcade', minPurchase: 500 },
  { code: 'MAESTRO50', category: 'arcade', type: 'fixed', value: 50, label: '$50 MXN de Descuento Taller', minPurchase: 200 },
  { code: 'VIPARTESANO', category: 'arcade', type: 'percent', value: 15, label: '15% de Descuento VIP + Sorpresa', minPurchase: 300 },

  // Cupones Promocionales & Clientes (Códigos Especiales y de Tienda)
  { code: 'BIENVENIDO', category: 'store', type: 'percent', value: 10, label: '10% de Bienvenida al Taller', minPurchase: 350 },
  { code: 'ARTESANO10', category: 'store', type: 'percent', value: 10, label: '10% de Descuento Especial', minPurchase: 300 },
  { code: 'CLIENTEFRECUENTE', category: 'store', type: 'percent', value: 15, label: '15% de Cliente Frecuente', minPurchase: 450 },
  { code: 'PROMO15', category: 'store', type: 'percent', value: 15, label: '15% de Descuento Especial', minPurchase: 500 },
  { code: 'ENVIOGRATIS', category: 'store', type: 'fixed', value: 150, label: 'Bono de  MXN para Envío', minPurchase: 400 },
  { code: 'BUENFIN', category: 'store', type: 'percent', value: 15, label: '15% de Descuento de Temporada', minPurchase: 350 },
  { code: 'NAVIDAD', category: 'store', type: 'percent', value: 15, label: '15% de Temporada Navideña', minPurchase: 350 },

  // Cupones de Eventos Mensuales de Taller (Eventos Grandes y Quincenas)
  { code: 'GRANMES15', category: 'store', type: 'percent', value: 15, label: '15% de Gran Bazar del Mes', minPurchase: 400 },
  { code: 'QUINCENA10', category: 'store', type: 'percent', value: 10, label: '10% de Quincena Relámpago Flash', minPurchase: 300 },
  { code: 'MUERTOS15', category: 'store', type: 'percent', value: 15, label: '15% Festival Día de Muertos', minPurchase: 350 },
  { code: 'CATRINA10', category: 'store', type: 'percent', value: 10, label: '10% Quincena Catrinas', minPurchase: 300 },
  { code: 'AMOR15', category: 'store', type: 'percent', value: 15, label: '15% Gran Bazar del Amor', minPurchase: 350 },
  { code: 'MAMA15', category: 'store', type: 'percent', value: 15, label: '15% Especial Día de las Madres', minPurchase: 350 },

  // Cupones de Reseñas y Redes Sociales
  { code: 'RESENA5', category: 'store', type: 'percent', value: 5, label: '5% por Dejar Reseña en Tienda', minPurchase: 150 },
  { code: 'RESEÑA5', category: 'store', type: 'percent', value: 5, label: '5% por Dejar Reseña en Tienda', minPurchase: 150 },
  { code: 'FOTOREDES', category: 'store', type: 'percent', value: 10, label: 'Premio Foto en Redes (No acumulable)', minPurchase: 250 },
  { code: 'FOTOREDES10', category: 'store', type: 'percent', value: 10, label: 'Premio Foto en Redes (No acumulable)', minPurchase: 250 },
  { code: 'FOTOREDES5', category: 'store', type: 'percent', value: 5, label: '5% por Foto en Redes (No acumulable)', minPurchase: 150 },

  // Cupones de Oferta Relámpago Especial (Fines de Semana & Liquidaciones)
  { code: 'FLASHFINDE15', category: 'store', type: 'percent', value: 15, label: '15% Especial Oferta Relámpago de Fin de Semana', minPurchase: 350 },
  { code: 'FLASHFINDE', category: 'store', type: 'percent', value: 15, label: '15% Venta Flash de Fin de Semana', minPurchase: 350 },
  { code: 'LIQUIDACION', category: 'store', type: 'percent', value: 15, label: '15% Liquidación de Taller', minPurchase: 350 },
  { code: 'FINDE15', category: 'store', type: 'percent', value: 15, label: '15% Flash Fin de Semana', minPurchase: 350 }
];

/**
 * Identifica la categoría de un cupón ('arcade' | 'store')
 */
export function getCouponCategory(coupon) {
  if (!coupon) return 'store';
  if (coupon.category) return coupon.category;
  const code = (coupon.code || '').toUpperCase();
  if (code.startsWith('ARCADE') || code.startsWith('TALLER50') || code.startsWith('VIP15') || code.startsWith('MAESTRO') || code.startsWith('TALLER5') || code.startsWith('TALLER10')) {
    return 'arcade';
  }
  return 'store';
}

/**
 * Retorna la etiqueta legible en español de la categoría del cupón
 */
export function getCouponCategoryLabel(coupon) {
  const cat = getCouponCategory(coupon);
  return cat === 'arcade'
    ? 'Ganado con Monedas de Juego (Arcade)'
    : 'Código Especial de Tienda';
}

/**
 * Verifica si un cupón tiene fecha de caducidad y si ya ha vencido
 */
export function isCouponExpired(coupon) {
  if (!coupon || !coupon.expiresAt) return false;
  return new Date(coupon.expiresAt).getTime() < Date.now();
}

/**
 * Genera un código aleatorio único y limpio (ej. 'TIENDA-7F2A' o 'ART-9K42')
 */
export function generateUniqueCouponCode(prefix = 'TIENDA') {
  const cleanPrefix = (prefix || 'TIENDA').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${cleanPrefix}-${rand}`;
}

/**
 * Genera un sufijo rotativo determinista único para cada día (ej. 'K7M2')
 * Cambia automáticamente cada día a las 00:00 hrs.
 */
export function getDailyCouponSuffix(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const seed = `${y}${m}${d}_artesano_arcade_salt`;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  let n = Math.abs(hash);
  for (let i = 0; i < 4; i++) {
    suffix += chars[n % chars.length];
    n = Math.floor(n / chars.length) + (i * 13);
  }
  return suffix;
}

/**
 * Retorna los 4 niveles de cupones arcade del día con sus códigos dinámicos
 */
export function getDailyArcadeCoupons(date = new Date()) {
  const suffix = getDailyCouponSuffix(date);
  return [
    {
      id: 'tier-5',
      category: 'arcade',
      coinsRequired: 50,
      code: `ARCADE5-${suffix}`,
      type: 'percent',
      value: 5,
      discountPercent: 5,
      label: '5% de Descuento Arcade Diario',
      description: 'Válido hoy en cualquier compra o paquete (Mínimo $100 MXN)',
      minPurchase: 100
    },
    {
      id: 'tier-10',
      category: 'arcade',
      coinsRequired: 100,
      code: `ARCADE10-${suffix}`,
      type: 'percent',
      value: 10,
      discountPercent: 10,
      label: '10% de Descuento Arcade Diario',
      description: 'Válido hoy en productos o paquetes coordinados (Mínimo $250 MXN)',
      minPurchase: 250
    },
    {
      id: 'tier-15',
      category: 'arcade',
      coinsRequired: 250,
      code: `ARCADE15-${suffix}`,
      type: 'percent',
      value: 15,
      discountPercent: 15,
      label: '15% de Descuento Arcade Diario',
      description: 'Descuento del 15% en tu pedido de hoy (Mínimo $350 MXN)',
      minPurchase: 350
    },
    {
      id: 'tier-20',
      category: 'arcade',
      coinsRequired: 580,
      code: `VIP20-${suffix}`,
      type: 'percent',
      value: 15,
      discountPercent: 15,
      label: '15% de Descuento VIP Diario',
      description: 'Descuento VIP máximo de hoy, limitado al 15% (Mínimo $500 MXN)',
      minPurchase: 500
    }
  ];
}

/**
 * Valida un código de cupón contra la lista interna y configuración de taller
 * @param {string} inputCode - Código ingresado por el usuario
 * @param {Array} customCoupons - Cupones adicionales del backend/settings
 * @returns {Object|null}
 */
export function findCoupon(inputCode, customCoupons = []) {
  if (!inputCode || typeof inputCode !== 'string') return null;
  const clean = inputCode.trim().toUpperCase();

  // 1. Cupones de arcade del día de hoy
  const todayArcade = getDailyArcadeCoupons(new Date());
  const foundToday = todayArcade.find(c => c.code.toUpperCase() === clean);
  if (foundToday) return foundToday;

  // 2. Cupones de arcade de ayer (ventana de gracia para medianoche)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayArcade = getDailyArcadeCoupons(yesterday);
  const foundYesterday = yesterdayArcade.find(c => c.code.toUpperCase() === clean);
  if (foundYesterday) return foundYesterday;

  // 3. Cupones adicionales de configuración y cupones por defecto
  const allCoupons = [...(customCoupons || []), ...DEFAULT_COUPONS];
  return allCoupons.find(c => c.code.toUpperCase() === clean) || null;
}

/**
 * Calcula el monto a descontar según el subtotal protegiendo costos de taller y evitando órdenes en $0 MXN
 * @param {Object} coupon - Objeto de cupón
 * @param {number} subtotal - Subtotal de la orden en MXN
 * @returns {Object} { discountAmount, finalTotal, isValid, reason }
 */
export function calculateCouponDiscount(coupon, subtotal = 0) {
  if (!coupon) {
    return { discountAmount: 0, finalTotal: subtotal, isValid: false, reason: 'Cupón inexistente' };
  }

  if (coupon.active === false) {
    return { discountAmount: 0, finalTotal: subtotal, isValid: false, reason: 'Este cupón se encuentra inactivo o pausado por el taller' };
  }

  if (isCouponExpired(coupon)) {
    return { discountAmount: 0, finalTotal: subtotal, isValid: false, reason: 'Este cupón ha caducado (fecha de vigencia vencida)' };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { discountAmount: 0, finalTotal: subtotal, isValid: false, reason: 'Este cupón ya alcanzó el límite máximo de canjes permitidos' };
  }

  if (subtotal <= 0) {
    return { discountAmount: 0, finalTotal: 0, isValid: true, label: coupon.label || coupon.name };
  }

  // Protección de taller: compra mínima efectiva obligatoria para cupones
  // Si no está definida en el cupón, se aplica regla comercial automática:
  // - Para cupones fijos (ej. $50, $150): al menos 3.5x su valor o mínimo $200 MXN
  // - Para cupones porcentuales agresivos (>= 20%): mínimo $350 MXN
  const effectiveMinPurchase = (coupon.minPurchase !== undefined && coupon.minPurchase !== null && coupon.minPurchase > 0)
    ? coupon.minPurchase
    : (coupon.type === 'fixed'
        ? Math.max(200, Math.round((coupon.value || coupon.discountAmount || 50) * 3.5))
        : ((coupon.value || coupon.discountPercent || 0) >= 20 ? 350 : 0));

  if (effectiveMinPurchase > 0 && subtotal < effectiveMinPurchase) {
    const missing = Math.round(effectiveMinPurchase - subtotal);
    return {
      discountAmount: 0,
      finalTotal: subtotal,
      isValid: false,
      reason: `Requiere una compra mínima de $${effectiveMinPurchase} MXN (agrega $${missing} MXN más al carrito)`
    };
  }

  let discountAmount = 0;
  const cleanCode = (coupon.code || '').toUpperCase();
  // Regla comercial de taller: Foto en redes otorga 10% hasta $300 MXN y 5% arriba de $300 MXN
  if (cleanCode.startsWith('FOTOREDES')) {
    const percent = subtotal <= 300 ? 10 : 5;
    discountAmount = Math.round((subtotal * percent) / 100);
    coupon.label = `${percent}% por Foto en Redes (No acumulable)`;
  } else if (coupon.type === 'percent') {
    const percent = Math.min(15, coupon.value || coupon.discountPercent || 0);
    discountAmount = Math.round((subtotal * percent) / 100);
  } else if (coupon.type === 'fixed') {
    const fixedVal = coupon.value || coupon.discountAmount || 0;
    discountAmount = Math.min(fixedVal, subtotal);
  }

  // Regla comercial de protección de taller:
  // 1. El descuento nunca puede superar el 15% del subtotal, ni siquiera en cupones fijos o promociones.
  const maxAllowedDiscount = Math.round(subtotal * 0.15);
  if (discountAmount > maxAllowedDiscount) {
    discountAmount = maxAllowedDiscount;
  }

  // 2. Piso mínimo absoluto: NINGÚN pedido comercial con productos puede quedar en $0 MXN
  // Cubre insumos básicos, embalaje y taller (piso mínimo de $49 MXN o al menos el 50% del subtotal)
  const MIN_ORDER_FLOOR = subtotal >= 49 ? 49 : Math.round(subtotal * 0.5);
  if (subtotal - discountAmount < MIN_ORDER_FLOOR) {
    discountAmount = Math.max(0, subtotal - MIN_ORDER_FLOOR);
  }

  const finalTotal = Math.max(MIN_ORDER_FLOOR, subtotal - discountAmount);

  return {
    discountAmount,
    finalTotal,
    isValid: true,
    label: coupon.label
  };
}
