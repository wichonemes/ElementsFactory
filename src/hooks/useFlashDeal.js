import { useState, useEffect, useMemo } from 'react';

// Base epoch for continuous deterministic timelines
const BASE_EPOCH = 1700000000000;

// Varied duration pools between standard minimum of 3 hours (10,800s) and maximum of 18 hours (64,800s),
// with occasional 15-minute (900s) blitz lightning deals:
// - Standard minimum duration: 3 hours (10,800s)
// - Standard maximum duration: 18 hours (64,800s)
// - Eventual blitz deal: 15 minutes (900s)
const SLOT_DURATION_CONFIGS = [
  // Slot 0: 3h a 18h variado con eventual blitz de 15 min (6h, 12h, 3h, 15m blitz, 18h, 8h, 14h)
  [21600, 43200, 10800, 900, 64800, 28800, 50400],
  // Slot 1: 3h a 18h con oferta eventual relámpago de 15 min (15m blitz, 10h, 4h, 3h, 15m, 16h)
  [900, 36000, 14400, 10800, 900, 57600],
  // Slot 2: 3h a 18h con oferta eventual relámpago de 15 min (8h, 15m, 5h, 18h, 12h, 3h)
  [28800, 10800, 64800, 900, 18000, 43200],
  // Slot 3: 3h a 18h variado con 15 min (5h, 18h, 3h, 15m, 10h, 6h)
  [18000, 64800, 10800, 900, 36000, 21600],
  // Slot 4: 3h a 18h variado (12h, 4h, 18h, 900, 28800, 50400, 36000)
  [43200, 14400, 64800, 900, 28800, 50400, 36000],
  // Slot 5: 3h a 18h variado (16h, 900, 21600, 39600, 64800, 10800, 54000)
  [57600, 900, 21600, 39600, 64800, 10800, 54000]
];

export function useFlashDeal(products = [], settings = null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashDealsStatus = settings?.flashDealsStatus || null;
  const isGloballyPaused = Boolean(flashDealsStatus?.isGloballyPaused);
  const pausedAreas = useMemo(() => flashDealsStatus?.pausedAreas || {}, [flashDealsStatus]);
  const flashDealsLimits = useMemo(() => {
    return settings?.flashDealsLimits || {
      hogar: 3,
      negocios: 3,
      eventos: 5,
      paquetes: 1
    };
  }, [settings?.flashDealsLimits]);

  const resetEpoch = useMemo(() => {
    if (flashDealsStatus?.lastResetAt) {
      const parsed = new Date(flashDealsStatus.lastResetAt).getTime();
      return isNaN(parsed) ? BASE_EPOCH : parsed;
    }
    return BASE_EPOCH;
  }, [flashDealsStatus?.lastResetAt]);

  // Filter products eligible for flash deals (published, non-bundle, with valid price, unless manually disabled)
  const eligibleProducts = useMemo(() => {
    if (isGloballyPaused) return [];
    if (!products || products.length === 0) return [];
    return products.filter(p => {
      if (p.status !== 'published' || !p.price || p.price <= 0) return false;
      if (p.flashDealConfig && p.flashDealConfig.enabled === false) return false;
      return !p.isBundle;
    });
  }, [products, isGloballyPaused]);

  // Compute active slots and per-product timers
  const { activeFlashProducts, activeFlashProductIds, slotsMap } = useMemo(() => {
    if (isGloballyPaused) {
      return { activeFlashProducts: [], activeFlashProductIds: [], slotsMap: {} };
    }

    const sections = ['hogar', 'negocios', 'eventos'];
    const activeProds = [];
    const activeIds = [];
    const map = {};
    const globalPickedIds = new Set();

    const targetLimits = {
      hogar: Math.max(1, Number(flashDealsLimits.hogar) || 3),
      negocios: Math.max(1, Number(flashDealsLimits.negocios) || 3),
      eventos: Math.max(1, Number(flashDealsLimits.eventos) || 5),
      paquetes: Math.max(1, Number(flashDealsLimits.paquetes) || 1)
    };

    // Conteo estricto por área en tiempo real para evitar cualquier desborde cruzado
    const areaCounts = { hogar: 0, negocios: 0, eventos: 0, paquetes: 0 };

    // 1. First, register any products manually configured & enabled by the administrator
    (products || []).forEach(product => {
      if (!product || product.status !== 'published' || !product.flashDealConfig?.enabled) return;

      const config = product.flashDealConfig;

      // Skip expired manual flash deals
      if (config.expiresAt && config.expiresAt <= now) {
        return;
      }

      // Si alguna de las áreas asignadas al producto está pausada, no se activa la oferta
      if (product.worlds && product.worlds.length > 0 && product.worlds.some(w => pausedAreas[w])) {
        return;
      }
      if ((product.isBundle || product.category === 'paquetes' || product.worlds?.includes('paquetes')) && pausedAreas.paquetes) {
        return;
      }

      const prodAreas = (product.worlds || []).filter(w => targetLimits[w]);
      if (product.isBundle || product.category === 'paquetes' || product.worlds?.includes('paquetes')) {
        if (!prodAreas.includes('paquetes')) prodAreas.push('paquetes');
      }

      // Debe caber en TODAS sus áreas asignadas sin exceder el tope de ninguna
      const canFit = prodAreas.length === 0 || prodAreas.every(w => (areaCounts[w] || 0) < targetLimits[w]);
      if (!canFit) {
        return;
      }

      prodAreas.forEach(w => {
        areaCounts[w] = (areaCounts[w] || 0) + 1;
      });

      const durationMin = config.durationMinutes || 120;
      const durationSec = durationMin * 60;

      let secondsRemaining = durationSec;
      if (config.expiresAt) {
        const diff = Math.floor((config.expiresAt - now) / 1000);
        secondsRemaining = Math.max(1, diff);
      }

      const isOriginalBlitz = durationMin <= 15 || durationSec <= 900;
      const isUrgentLessThan15m = secondsRemaining <= 900;
      const isBlitz = isOriginalBlitz || isUrgentLessThan15m;
      const hours = Math.floor(secondsRemaining / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      const seconds = secondsRemaining % 60;
      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');

      const durationHours = Math.round(durationSec / 3600);
      const durationMinutes = Math.round(durationSec / 60);
      let durationLabel;
      if (isOriginalBlitz) {
        durationLabel = 'FLASH 15M';
      } else if (isUrgentLessThan15m) {
        durationLabel = 'ÚLTIMOS 15M';
      } else {
        durationLabel = durationMinutes < 60 ? `FLASH ${durationMinutes}M` : `FLASH ${durationHours}H`;
      }

      const elapsedRatio = Math.max(0, Math.min(1, 1 - (secondsRemaining / durationSec)));
      const baseUnits = durationSec <= 1800 ? 2 : 3;
      const unitsLeft = Math.max(1, Math.floor(baseUnits - elapsedRatio * (baseUnits - 1)));
      const blitzPercentRemaining = Math.max(4, Math.min(100, Math.round((secondsRemaining / Math.min(durationSec, 900)) * 100)));

      globalPickedIds.add(product.id);
      activeProds.push(product);
      activeIds.push(product.id);

      map[product.id] = {
        product,
        cycleDuration: durationSec,
        isBlitz,
        isOriginalBlitz,
        isUrgentLessThan15m,
        durationLabel,
        discountPercent: Math.min(15, config.discountPercent || 15),
        secondsRemaining,
        percentRemaining: Math.max(4, Math.min(100, Math.round((secondsRemaining / durationSec) * 100))),
        blitzPercentRemaining,
        timeFormatted: {
          hours: hh,
          minutes: mm,
          seconds: ss,
          fullText: `${hh}:${mm}:${ss}`
        },
        scarcityMetrics: {
          unitsLeft,
          percent: Math.min(95, Math.floor(78 + elapsedRatio * 16))
        }
      };
    });

    if (eligibleProducts.length === 0 && activeProds.length === 0) {
      return { activeFlashProducts: [], activeFlashProductIds: [], slotsMap: {} };
    }

    // 2. Next, generate deterministic cyclical flash deals for each section respecting strict caps
    sections.forEach((sec, secIndex) => {
      if (pausedAreas[sec]) return; // Skip generating cyclical offers for paused area

      // Filtrar productos elegibles de la sección que NO pertenezcan a ninguna área pausada
      const secProducts = eligibleProducts.filter(p => {
        if (!p.worlds?.includes(sec)) return false;
        if (p.worlds.some(w => pausedAreas[w])) return false;
        return true;
      });
      // Relación proporcional estricta por defecto y topes configurables:
      const defaultSlots = sec === 'hogar'
        ? Math.round(secProducts.length * (2.5 / 13)) || 3
        : sec === 'negocios'
        ? Math.round(secProducts.length * (2.5 / 10)) || 3
        : sec === 'eventos'
        ? Math.min(5, Math.round(secProducts.length * (4.5 / 13)) || 5)
        : 3;

      const targetSlots = targetLimits[sec] !== undefined ? targetLimits[sec] : defaultSlots;

      // Descontar ofertas que ya estén activas en esta área
      const secPickedIds = new Set();
      const existingInSec = activeProds.filter(p => p.worlds?.includes(sec));
      existingInSec.forEach(p => secPickedIds.add(p.id));

      const slotsNeeded = Math.max(0, targetSlots - (areaCounts[sec] || 0));

      for (let slotIndex = 0; slotIndex < slotsNeeded; slotIndex++) {
        const durations = SLOT_DURATION_CONFIGS[slotIndex % SLOT_DURATION_CONFIGS.length];
        const totalSeqDuration = durations.reduce((a, b) => a + b, 0);

        // Desynchronize sections and slots using distinct prime offsets
        const secOffset = (secIndex + 1) * 4919;
        const slotOffset = (slotIndex + 1) * 17389 + (slotIndex === 1 && secIndex === 0 ? 92273 : 0);
        const elapsedSeconds = Math.max(0, Math.floor((now - resetEpoch) / 1000)) + secOffset + slotOffset;

        const seqElapsed = ((elapsedSeconds % totalSeqDuration) + totalSeqDuration) % totalSeqDuration;
        const totalCycles = Math.floor(elapsedSeconds / totalSeqDuration) * durations.length;

        let accumulated = 0;
        let activeCycleInSeq = 0;
        let cycleDuration = durations[0];
        let cycleElapsed = 0;

        for (let i = 0; i < durations.length; i++) {
          if (seqElapsed < accumulated + durations[i]) {
            activeCycleInSeq = i;
            cycleDuration = durations[i];
            cycleElapsed = seqElapsed - accumulated;
            break;
          }
          accumulated += durations[i];
        }

        const cycleIndex = totalCycles + activeCycleInSeq;
        const secondsRemaining = Math.max(1, cycleDuration - cycleElapsed);

        // Deterministic product rotation: elegir únicamente productos que quepan en TODAS sus áreas sin exceder el cupo
        let prodIdx = (cycleIndex * (slotIndex + 1) + slotIndex * 3) % secProducts.length;
        let foundProduct = null;

        for (let attempts = 0; attempts < secProducts.length; attempts++) {
          const candidate = secProducts[(prodIdx + attempts) % secProducts.length];
          if (!candidate || globalPickedIds.has(candidate.id)) continue;

          const candWorlds = (candidate.worlds || []).filter(w => targetLimits[w]);
          const fitsAllWorlds = candWorlds.every(w => (areaCounts[w] || 0) < targetLimits[w]);

          if (fitsAllWorlds) {
            foundProduct = candidate;
            break;
          }
        }

        if (!foundProduct) break; // Ya no hay productos que quepan sin romper los topes

        // Asignar producto y sumar a todas sus áreas
        const candWorlds = (foundProduct.worlds || []).filter(w => targetLimits[w]);
        candWorlds.forEach(w => {
          areaCounts[w] = (areaCounts[w] || 0) + 1;
        });

        globalPickedIds.add(foundProduct.id);
        if (!activeIds.includes(foundProduct.id)) {
          activeProds.push(foundProduct);
          activeIds.push(foundProduct.id);
        }

        const hours = Math.floor(secondsRemaining / 3600);
        const minutes = Math.floor((secondsRemaining % 3600) / 60);
        const seconds = secondsRemaining % 60;
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');

        const isOriginalBlitz = cycleDuration <= 900;
        const isUrgentLessThan15m = secondsRemaining <= 900;
        const isBlitz = isOriginalBlitz || isUrgentLessThan15m;
        const durationHours = Math.round(cycleDuration / 3600);
        const durationMinutes = Math.round(cycleDuration / 60);
        let durationLabel;
        if (isOriginalBlitz) {
          durationLabel = 'FLASH 15M';
        } else if (isUrgentLessThan15m) {
          durationLabel = 'ÚLTIMOS 15M';
        } else {
          durationLabel = durationMinutes < 60 ? `FLASH ${durationMinutes}M` : `FLASH ${durationHours}H`;
        }

        const elapsedRatio = 1 - (secondsRemaining / cycleDuration);
        const hash = String(foundProduct.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseUnits = cycleDuration <= 1800 ? 2 : (3 + (hash % 2));
        const unitsLeft = Math.max(1, Math.floor(baseUnits - elapsedRatio * (baseUnits - 1)));
        const blitzPercentRemaining = Math.max(4, Math.min(100, Math.round((secondsRemaining / Math.min(cycleDuration, 900)) * 100)));

        map[foundProduct.id] = {
          product: foundProduct,
          cycleDuration,
          isBlitz,
          isOriginalBlitz,
          isUrgentLessThan15m,
          durationLabel,
          secondsRemaining,
          percentRemaining: Math.max(4, Math.min(100, Math.round((secondsRemaining / cycleDuration) * 100))),
          blitzPercentRemaining,
          timeFormatted: {
            hours: hh,
            minutes: mm,
            seconds: ss,
            fullText: `${hh}:${mm}:${ss}`
          },
          scarcityMetrics: {
            unitsLeft,
            percent: Math.min(95, Math.floor(78 + elapsedRatio * 16))
          }
        };
      }
    });

    return {
      activeFlashProducts: activeProds,
      activeFlashProductIds: activeIds,
      slotsMap: map
    };
  }, [eligibleProducts, now, isGloballyPaused, pausedAreas, resetEpoch, flashDealsLimits]);

  // Primary active flash product (for default fallback / modals)
  const activeFlashProduct = activeFlashProducts[0] || null;
  const primarySlot = activeFlashProduct ? slotsMap[activeFlashProduct.id] : null;

  // Product-specific timer details
  const getTimeForProduct = (productId) => {
    if (productId && slotsMap[productId]) {
      return slotsMap[productId];
    }
    return {
      cycleDuration: 7200,
      durationLabel: 'FLASH 2H',
      secondsRemaining: primarySlot?.secondsRemaining || 7200,
      percentRemaining: primarySlot?.percentRemaining || 100,
      timeFormatted: primarySlot?.timeFormatted || {
        hours: '02',
        minutes: '00',
        seconds: '00',
        fullText: '02:00:00'
      }
    };
  };

  // Scarcity metrics per product
  const getScarcityForProduct = (productId) => {
    if (productId && slotsMap[productId]) {
      return slotsMap[productId].scarcityMetrics;
    }
    return primarySlot?.scarcityMetrics || {
      percent: 86,
      unitsLeft: 3
    };
  };

  // Descuento automático oficial del taller: tope máximo del 15%
  const discountPercent = 15;

  // Active Blitz deal (if any slot is currently running an occasional <= 15 min deal OR any offer has <= 15 min remaining)
  const activeBlitzDeal = useMemo(() => {
    let candidate = null;
    let minSeconds = Infinity;

    for (const prodId of activeFlashProductIds) {
      const slot = slotsMap[prodId];
      if (!slot) continue;

      // Condition: any active offer where secondsRemaining <= 900 (less than 15 min) or isBlitz
      if (slot.secondsRemaining > 0 && (slot.isBlitz || slot.secondsRemaining <= 900)) {
        if (slot.secondsRemaining < minSeconds) {
          minSeconds = slot.secondsRemaining;
          candidate = slot;
        }
      }
    }
    return candidate;
  }, [activeFlashProductIds, slotsMap]);

  const getAreaLimitsInfo = () => {
    const hogarProds = eligibleProducts.filter(p => p.worlds?.includes('hogar'));
    const negociosProds = eligibleProducts.filter(p => p.worlds?.includes('negocios'));
    const eventosProds = eligibleProducts.filter(p => p.worlds?.includes('eventos'));

    const targetLimits = {
      hogar: Math.max(1, Number(flashDealsLimits.hogar) || 3),
      negocios: Math.max(1, Number(flashDealsLimits.negocios) || 3),
      eventos: Math.max(1, Number(flashDealsLimits.eventos) || 5),
      paquetes: Math.max(1, Number(flashDealsLimits.paquetes) || 1)
    };

    const hogarTarget = Math.min(hogarProds.length, targetLimits.hogar);
    const negociosTarget = Math.min(negociosProds.length, targetLimits.negocios);
    const eventosTarget = Math.min(eventosProds.length, targetLimits.eventos);

    const hogarActive = activeFlashProducts.filter(p => p.worlds?.includes('hogar')).length;
    const negociosActive = activeFlashProducts.filter(p => p.worlds?.includes('negocios')).length;
    const eventosActive = activeFlashProducts.filter(p => p.worlds?.includes('eventos')).length;

    return {
      hogar: {
        id: 'hogar',
        name: 'Hogar & Decoración',
        totalProducts: hogarProds.length,
        activeFlash: hogarActive,
        targetLimit: hogarTarget,
        rule: `Tope máximo configurado: ${hogarTarget} ofertas flash activas`
      },
      negocios: {
        id: 'negocios',
        name: 'Negocios & Marca',
        totalProducts: negociosProds.length,
        activeFlash: negociosActive,
        targetLimit: negociosTarget,
        rule: `Tope máximo configurado: ${negociosTarget} ofertas flash activas`
      },
      eventos: {
        id: 'eventos',
        name: 'Eventos Especiales',
        totalProducts: eventosProds.length,
        activeFlash: eventosActive,
        targetLimit: eventosTarget,
        rule: `Tope máximo configurado: ${eventosTarget} ofertas flash activas`
      }
    };
  };

  const getFlashProductsForWorld = (worldId) => {
    if (isGloballyPaused) return [];
    if (worldId && pausedAreas[worldId]) return [];
    if (!worldId || worldId === 'all') {
      return activeFlashProducts.filter(p => !p.worlds?.some(w => pausedAreas[w]));
    }
    return activeFlashProducts.filter(p => p.worlds?.includes(worldId) && !pausedAreas[worldId]);
  };

  return {
    activeFlashProductId: activeFlashProduct?.id || null,
    activeFlashProduct,
    activeFlashProducts,
    activeFlashProductIds,
    activeBlitzDeal,
    secondsRemaining: primarySlot?.secondsRemaining || 7200,
    timeFormatted: primarySlot?.timeFormatted || {
      hours: '02',
      minutes: '00',
      seconds: '00',
      fullText: '02:00:00'
    },
    scarcityMetrics: getScarcityForProduct(activeFlashProduct?.id),
    getTimeForProduct,
    getScarcityForProduct,
    discountPercent,
    isProductOnFlashDeal: (productId, worldContext = null) => {
      if (isGloballyPaused) return false;
      if (!productId || !activeFlashProductIds.includes(productId)) return false;
      if (worldContext && pausedAreas[worldContext]) return false;
      const slot = slotsMap[productId];
      const prod = slot?.product;
      if (prod && prod.worlds?.some(w => pausedAreas[w])) return false;
      return true;
    },
    getAreaLimitsInfo,
    getFlashProductsForWorld,
    areaLimits: getAreaLimitsInfo(),
    isGloballyPaused,
    pausedAreas,
    isAreaPaused: (areaKey) => Boolean(isGloballyPaused || pausedAreas[areaKey])
  };
}
