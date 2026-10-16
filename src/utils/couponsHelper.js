// couponsHelper.js - Validador y Calculador de Cupones y Códigos de Descuento

export const DEFAULT_COUPONS = [
  // Cupones de Arcade (Ganados con Monedas de Juego)
  { code: 'TALLER5', category: 'arcade', type: 'percent', value: 5, label: '5% de Descuento Arcade', minPurchase: 0 },
  { code: 'TALLER10', category: 'arcade', type: 'percent', value: 10, label: '10% de Descuento Arcade', minPurchase: 0 },
  { code: 'MAESTRO50', category: 'arcade', type: 'fixed', value: 50, label: '$50 MXN de Descuento Taller', minPurchase: 200 },
  { code: 'VIPARTESANO', category: 'arcade', type: 'percent', value: 15, label: '15% de Descuento VIP + Sorpresa', minPurchase: 0 },

  // Cupones Promocionales & Clientes (Códigos Especiales y de Tienda)
  { code: 'BIENVENIDO', category: 'store', type: 'percent', value: 10, label: '10% de Bienvenida al Taller', minPurchase: 0 },
  { code: 'ARTESANO10', category: 'store', type: 'percent', value: 10, label: '10% de Descuento Especial', minPurchase: 0 },
  { code: 'CLIENTEFRECUENTE', category: 'store', type: 'percent', value: 15, label: '15% de Cliente Frecuente', minPurchase: 0 },
  { code: 'PROMO20', category: 'store', type: 'percent', value: 20, label: '20% de Descuento Especial', minPurchase: 500 },
  { code: 'ENVIOGRATIS', category: 'store', type: 'fixed', value: 150, label: 'Bono de $150 MXN para Envío', minPurchase: 400 },
  { code: 'BUENFIN', category: 'store', type: 'percent', value: 15, label: '15% de Descuento de Temporada', minPurchase: 0 },
  { code: 'NAVIDAD', category: 'store', type: 'percent', value: 15, label: '15% de Temporada Navideña', minPurchase: 0 },

  // Cupones de Eventos Mensuales de Taller (Eventos Grandes y Quincenas)
  { code: 'GRANMES15', category: 'store', type: 'percent', value: 15, label: '15% de Evento Grande del Mes', minPurchase: 0 },
  { code: 'GRANMES20', category: 'store', type: 'percent', value: 20, label: '20% de Gran Bazar del Mes', minPurchase: 400 },
  { code: 'QUINCENA10', category: 'store', type: 'percent', value: 10, label: '10% de Quincena Relámpago Flash', minPurchase: 0 },
  { code: 'MUERTOS15', category: 'store', type: 'percent', value: 15, label: '15% Festival Día de Muertos', minPurchase: 0 },
  { code: 'CATRINA10', category: 'store', type: 'percent', value: 10, label: '10% Quincena Catrinas', minPurchase: 0 },
  { code: 'AMOR15', category: 'store', type: 'percent', value: 15, label: '15% Gran Bazar del Amor', minPurchase: 0 },
  { code: 'MAMA20', category: 'store', type: 'percent', value: 20, label: '20% Especial Día de las Madres', minPurchase: 0 },

  // Cupones de Oferta Relámpago Especial (Fines de Semana & Liquidaciones)
  { code: 'FLASHFINDE30', category: 'store', type: 'percent', value: 30, label: '30% Especial Oferta Relámpago de Fin de Semana', minPurchase: 0 },
  { code: 'FLASHFINDE', category: 'store', type: 'percent', value: 30, label: '30% Venta Flash de Fin de Semana', minPurchase: 0 },
  { code: 'LIQUIDACION', category: 'store', type: 'percent', value: 35, label: '35% Liquidación de Taller', minPurchase: 0 },
  { code: 'FINDE30', category: 'store', type: 'percent', value: 30, label: '30% Flash Fin de Semana', minPurchase: 0 }
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
    ? '🎮 Ganado con Monedas de Juego (Arcade)'
    : '🏷️ Código Especial de Tienda';
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
      coinsRequired: 30,
      code: `ARCADE5-${suffix}`,
      type: 'percent',
      value: 5,
      discountPercent: 5,
      label: '5% de Descuento Arcade Diario',
      description: 'Válido hoy en cualquier compra o paquete',
      minPurchase: 0
    },
    {
      id: 'tier-10',
      category: 'arcade',
      coinsRequired: 60,
      code: `ARCADE10-${suffix}`,
      type: 'percent',
      value: 10,
      discountPercent: 10,
      label: '10% de Descuento Arcade Diario',
      description: 'Válido hoy en productos o paquetes coordinados',
      minPurchase: 0
    },
    {
      id: 'tier-50',
      category: 'arcade',
      coinsRequired: 100,
      code: `TALLER50-${suffix}`,
      type: 'fixed',
      value: 50,
      discountAmount: 50,
      label: '$50 MXN de Descuento Taller Diario',
      description: 'Ahorro directo en efectivo en tu pedido de hoy',
      minPurchase: 200
    },
    {
      id: 'tier-vip',
      category: 'arcade',
      coinsRequired: 150,
      code: `VIP15-${suffix}`,
      type: 'percent',
      value: 15,
      discountPercent: 15,
      label: '15% de Descuento VIP + Sorpresa',
      description: 'Descuento VIP del día + detalle de taller sorpresa',
      minPurchase: 0
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
  if (coupon.type === 'percent') {
    const percent = coupon.value || coupon.discountPercent || 0;
    discountAmount = Math.round((subtotal * percent) / 100);
  } else if (coupon.type === 'fixed') {
    const fixedVal = coupon.value || coupon.discountAmount || 0;
    discountAmount = Math.min(fixedVal, subtotal);
  }

  // Regla comercial de protección de taller:
  // 1. El descuento no puede superar el 35% del subtotal en pedidos regulares
  const maxAllowedDiscount = Math.round(subtotal * 0.35);
  if (coupon.type === 'fixed' && discountAmount > maxAllowedDiscount && subtotal < ((coupon.value || 50) * 3)) {
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
