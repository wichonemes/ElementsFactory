// arcadeCreditsManager.js - Gestor de Fichas (Créditos), Monedas y Cupones en Sesión
export const ARCADE_CONFIG = {
  MAX_CREDITS: 5,
  INITIAL_CREDITS: 5,
  REFILL_INTERVAL_SECONDS: 900, // 15 minutos exactos (900s) dentro de la página para recargar +1 moneda/ficha de juego
  COIN_TO_CREDIT_COST: 2,       // 2 monedas ganadas para canjear por 1 ficha al instante
  CREDITS_PER_EXCHANGE: 1,      // 1 ficha otorgada por canje de 2 monedas
  COST_PER_GAME: 1,             // Costo exacto: 1 moneda de juego por partida
  SESSION_DURATION_SECONDS: 3600 // 1 hora de sesión (3600s): las monedas se restablecen tras 1 hora
};

const STORAGE_KEYS = {
  CREDITS: 'artesano_arcade_credits',
  LAST_REFILL: 'artesano_arcade_last_refill',
  COINS: 'artesano_coins',
  COUPON: 'artesano_active_coupon',
  SESSION_START: 'artesano_coins_session_start'
};

const dispatchUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('artesano_arcade_update', {
      detail: getArcadeStatus()
    }));
  }
};

export const getArcadeStatus = () => {
  if (typeof window === 'undefined') {
    return {
      credits: ARCADE_CONFIG.INITIAL_CREDITS,
      coins: 0,
      activeCoupon: '',
      secondsUntilRefill: ARCADE_CONFIG.REFILL_INTERVAL_SECONDS,
      maxCredits: ARCADE_CONFIG.MAX_CREDITS,
      costPerGame: ARCADE_CONFIG.COST_PER_GAME
    };
  }

  const now = Date.now();

  // 0. Control de Sesión de 1 Hora (Pérdida/Restablecimiento de Monedas tras 1 hora en la página)
  let sessionStart = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_START) || '0', 10);
  if (!sessionStart || isNaN(sessionStart)) {
    sessionStart = now;
    localStorage.setItem(STORAGE_KEYS.SESSION_START, sessionStart.toString());
  }

  const elapsedSessionSeconds = Math.floor((now - sessionStart) / 1000);
  let sessionExpired = false;

  if (elapsedSessionSeconds >= ARCADE_CONFIG.SESSION_DURATION_SECONDS) {
    sessionExpired = true;
    localStorage.setItem(STORAGE_KEYS.COINS, '0');
    sessionStart = now;
    localStorage.setItem(STORAGE_KEYS.SESSION_START, sessionStart.toString());
  }

  const sessionRemainingSeconds = Math.max(0, ARCADE_CONFIG.SESSION_DURATION_SECONDS - Math.floor((now - sessionStart) / 1000));

  // 1. Obtener o inicializar créditos
  const storedCredits = localStorage.getItem(STORAGE_KEYS.CREDITS);
  let credits = storedCredits !== null ? parseInt(storedCredits, 10) : ARCADE_CONFIG.INITIAL_CREDITS;
  if (isNaN(credits) || credits < 0) credits = ARCADE_CONFIG.INITIAL_CREDITS;

  // 2. Obtener monedas
  let coins = parseInt(localStorage.getItem(STORAGE_KEYS.COINS) || '0', 10);
  if (isNaN(coins) || coins < 0 || sessionExpired) coins = 0;

  // 3. Obtener cupón activo
  const activeCoupon = localStorage.getItem(STORAGE_KEYS.COUPON) || '';

  // 4. Calcular recarga pasiva por tiempo en pantalla
  let lastRefill = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_REFILL) || '0', 10);
  if (!lastRefill || isNaN(lastRefill)) {
    lastRefill = now;
    localStorage.setItem(STORAGE_KEYS.LAST_REFILL, lastRefill.toString());
  }

  const elapsedSeconds = Math.floor((now - lastRefill) / 1000);

  if (credits < ARCADE_CONFIG.MAX_CREDITS) {
    if (elapsedSeconds >= ARCADE_CONFIG.REFILL_INTERVAL_SECONDS) {
      const refillsEarned = Math.floor(elapsedSeconds / ARCADE_CONFIG.REFILL_INTERVAL_SECONDS);
      credits = Math.min(ARCADE_CONFIG.MAX_CREDITS, credits + refillsEarned);
      localStorage.setItem(STORAGE_KEYS.CREDITS, credits.toString());
      
      // Ajustar último refill para no perder remanente
      const remainder = elapsedSeconds % ARCADE_CONFIG.REFILL_INTERVAL_SECONDS;
      lastRefill = now - (remainder * 1000);
      localStorage.setItem(STORAGE_KEYS.LAST_REFILL, lastRefill.toString());
    }
  } else {
    // Ya está al tope
    lastRefill = now;
    localStorage.setItem(STORAGE_KEYS.LAST_REFILL, now.toString());
  }

  let secondsUntilRefill = ARCADE_CONFIG.REFILL_INTERVAL_SECONDS;
  if (credits < ARCADE_CONFIG.MAX_CREDITS) {
    const currentElapsed = Math.floor((Date.now() - lastRefill) / 1000);
    secondsUntilRefill = Math.max(0, ARCADE_CONFIG.REFILL_INTERVAL_SECONDS - currentElapsed);
  }

  return {
    credits,
    coins,
    activeCoupon,
    secondsUntilRefill,
    maxCredits: ARCADE_CONFIG.MAX_CREDITS,
    costPerGame: ARCADE_CONFIG.COST_PER_GAME,
    sessionRemainingSeconds,
    sessionExpired
  };
};

/**
 * Restablece las monedas de sesión a 0 de forma inmediata sin esperar la hora de expiración
 */
export const resetAllCoinsInstantly = (resetTimestamp = Date.now()) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.COINS, '0');
  localStorage.setItem(STORAGE_KEYS.SESSION_START, resetTimestamp.toString());
  localStorage.setItem('artesano_last_server_reset', resetTimestamp.toString());
  dispatchUpdateEvent();
};

/**
 * Gasta créditos de juego para iniciar una partida (costo configurable)
 */
export const spendArcadeCredit = (cost = ARCADE_CONFIG.COST_PER_GAME) => {
  const current = getArcadeStatus();
  const requiredCredits = Math.max(1, Number(cost) || 1);
  if (current.credits < requiredCredits) {
    return {
      success: false,
      reason: 'no_credits',
      secondsUntilRefill: current.secondsUntilRefill,
      coins: current.coins
    };
  }

  const newCredits = current.credits - requiredCredits;
  localStorage.setItem(STORAGE_KEYS.CREDITS, newCredits.toString());

  // Si bajó del máximo y no estaba corriendo el refill, arrancar temporizador
  if (current.credits === ARCADE_CONFIG.MAX_CREDITS) {
    localStorage.setItem(STORAGE_KEYS.LAST_REFILL, Date.now().toString());
  }

  dispatchUpdateEvent();
  return {
    success: true,
    credits: newCredits,
    coins: current.coins
  };
};

/**
 * Permite cambiar monedas por créditos al instante en sesión sin salirse del navegador
 */
export const exchangeCoinsForCredits = (
  cost = ARCADE_CONFIG.COIN_TO_CREDIT_COST,
  gain = ARCADE_CONFIG.CREDITS_PER_EXCHANGE
) => {
  const current = getArcadeStatus();
  if (current.coins < cost) {
    return {
      success: false,
      reason: 'insufficient_coins',
      coins: current.coins,
      cost
    };
  }

  const newCoins = current.coins - cost;
  const newCredits = Math.min(ARCADE_CONFIG.MAX_CREDITS + 5, current.credits + gain); // Puede acumular un poco más de bonus

  localStorage.setItem(STORAGE_KEYS.COINS, newCoins.toString());
  localStorage.setItem(STORAGE_KEYS.CREDITS, newCredits.toString());

  dispatchUpdateEvent();
  return {
    success: true,
    coins: newCoins,
    credits: newCredits
  };
};

/**
 * Agrega monedas ganadas al monedero del usuario
 */
export const addArcadeCoins = (amount) => {
  if (amount <= 0) return getArcadeStatus().coins;
  const current = getArcadeStatus();
  const newCoins = current.coins + amount;
  localStorage.setItem(STORAGE_KEYS.COINS, newCoins.toString());
  dispatchUpdateEvent();
  return newCoins;
};

/**
 * Canjea un cupón de descuento descontando monedas
 */
export const redeemArcadeCoupon = (couponCode, coinsCost) => {
  const current = getArcadeStatus();
  if (current.coins < coinsCost) {
    return { success: false, reason: 'insufficient_coins' };
  }

  const newCoins = current.coins - coinsCost;
  localStorage.setItem(STORAGE_KEYS.COINS, newCoins.toString());
  localStorage.setItem(STORAGE_KEYS.COUPON, couponCode);

  dispatchUpdateEvent();
  return {
    success: true,
    coupon: couponCode,
    coins: newCoins
  };
};

/**
 * Formatea segundos a mm:ss
 */
export const formatRefillTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Formatea segundos restantes de sesión a mm:ss
 */
export const formatSessionTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
