import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame, Clock, Zap, Percent, Search, RefreshCw, AlertTriangle,
  CheckCircle2, Sparkles, Filter, ChevronRight, Edit, X, ArrowUpRight,
  TrendingUp, BarChart3, Package, ShieldAlert, Sliders, Check,
  Play, Pause, RotateCcw, Power, PlayCircle, PauseCircle,
  Plus, Minus, Save, SlidersHorizontal, Settings2
} from 'lucide-react';

export default function FlashDealsControlSection({
  products = [],
  settings = null,
  flashDeal = null,
  token = '',
  onRefreshCatalog,
  onEditProduct
}) {
  // Filtro por área: 'all' | 'hogar' | 'negocios' | 'eventos' | 'paquetes'
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDuration, setFilterDuration] = useState('all'); // 'all' | 'blitz' | 'short' | 'long'
  
  // Estado para modal / panel de activación rápida de producto
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddProductId, setQuickAddProductId] = useState('');
  const [quickAddDuration, setQuickAddDuration] = useState(120); // 2h default
  const [quickAddDiscount, setQuickAddDiscount] = useState(15); // 15% max default
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Estado consolidado y reactivo de pausas de ofertas flash
  const [localPausedAreas, setLocalPausedAreas] = useState(null);
  const [localIsGloballyPaused, setLocalIsGloballyPaused] = useState(null);

  const flashDealsStatus = useMemo(() => {
    if (settings?.flashDealsStatus) return settings.flashDealsStatus;
    if (flashDeal?.isGloballyPaused !== undefined) {
      return {
        isGloballyPaused: flashDeal.isGloballyPaused,
        pausedAreas: flashDeal.pausedAreas || {}
      };
    }
    return {
      isGloballyPaused: false,
      pausedAreas: { hogar: false, negocios: false, eventos: false, paquetes: false }
    };
  }, [settings, flashDeal]);

  // Sincronizar estado local cuando el servidor o hook actualice
  useEffect(() => {
    if (settings?.flashDealsStatus?.pausedAreas) {
      setLocalPausedAreas(settings.flashDealsStatus.pausedAreas);
    }
    if (settings?.flashDealsStatus?.isGloballyPaused !== undefined) {
      setLocalIsGloballyPaused(settings.flashDealsStatus.isGloballyPaused);
    }
  }, [settings?.flashDealsStatus]);

  const isGloballyPaused = Boolean(localIsGloballyPaused !== null ? localIsGloballyPaused : flashDealsStatus.isGloballyPaused);
  const pausedAreas = useMemo(() => {
    return localPausedAreas || flashDealsStatus.pausedAreas || {};
  }, [localPausedAreas, flashDealsStatus]);

  // Topes configurados por área (provenientes de settings o defaults autorizados)
  const flashDealsLimits = useMemo(() => {
    return settings?.flashDealsLimits || {
      hogar: 3,
      negocios: 3,
      eventos: 5,
      paquetes: 1
    };
  }, [settings?.flashDealsLimits]);

  // Estado editable para el formulario del modificador de topes
  const [limitsForm, setLimitsForm] = useState({
    hogar: settings?.flashDealsLimits?.hogar ?? 3,
    negocios: settings?.flashDealsLimits?.negocios ?? 3,
    eventos: settings?.flashDealsLimits?.eventos ?? 5,
    paquetes: settings?.flashDealsLimits?.paquetes ?? 1
  });

  const [savingLimits, setSavingLimits] = useState(false);

  useEffect(() => {
    if (settings?.flashDealsLimits) {
      setLimitsForm({
        hogar: settings.flashDealsLimits.hogar ?? 3,
        negocios: settings.flashDealsLimits.negocios ?? 3,
        eventos: settings.flashDealsLimits.eventos ?? 5,
        paquetes: settings.flashDealsLimits.paquetes ?? 1
      });
    }
  }, [settings?.flashDealsLimits]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Guardar topes máximos por área en el servidor
  const handleSaveLimits = async (customToSave = limitsForm) => {
    try {
      setSavingLimits(true);
      const res = await fetch('/api/admin/flash-deals/limits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ limits: customToSave })
      });
      if (res.ok) {
        const data = await res.json();
        const tot = Number(data.limits.hogar) + Number(data.limits.negocios) + Number(data.limits.eventos) + Number(data.limits.paquetes);
        showNotification(
          `Topes guardados con éxito: Hogar (${data.limits.hogar}), Negocios (${data.limits.negocios}), Eventos (${data.limits.eventos}), Paquetes (${data.limits.paquetes}). Total autorizado: ${tot}`,
          'success'
        );
        if (onRefreshCatalog) await onRefreshCatalog();
      } else {
        showNotification('No se pudo guardar la configuración de topes', 'error');
      }
    } catch (err) {
      console.error('Error saving limits:', err);
      showNotification('Error de conexión al guardar topes', 'error');
    } finally {
      setSavingLimits(false);
    }
  };

  // Ajuste rápido con botones +/- en cada área
  const handleQuickAdjustLimit = async (areaKey, delta) => {
    const currentVal = Number(limitsForm[areaKey]) || 1;
    const newVal = Math.max(1, Math.min(30, currentVal + delta));
    const nextForm = { ...limitsForm, [areaKey]: newVal };
    setLimitsForm(nextForm);
    await handleSaveLimits(nextForm);
  };

  // Helper para clasificar productos por área
  const isProductInArea = (prod, areaKey) => {
    if (!prod) return false;
    if (areaKey === 'all') return true;
    if (areaKey === 'hogar') {
      return prod.worlds?.includes('hogar');
    }
    if (areaKey === 'negocios') {
      return prod.worlds?.includes('negocios');
    }
    if (areaKey === 'eventos') {
      return prod.worlds?.includes('eventos');
    }
    if (areaKey === 'paquetes') {
      return prod.isBundle ||
        prod.category === 'paquetes' ||
        prod.category === 'servicios' ||
        prod.code?.startsWith('PROMO') ||
        prod.code?.includes('PATCH') ||
        prod.worlds?.includes('paquetes');
    }
    return false;
  };

  // Lista unificada de ofertas flash verdaderamente activas (respetando topes configurados y caducidad)
  const activeFlashList = useMemo(() => {
    if (isGloballyPaused) return [];

    // Si el hook useFlashDeal tiene sus productos calculados (que respetan los topes y no duplican ni reactivan expirados):
    if (flashDeal?.activeFlashProducts && flashDeal.activeFlashProducts.length > 0) {
      const valid = flashDeal.activeFlashProducts.filter(p => {
        if (!p) return false;
        if (p.worlds?.some(w => pausedAreas[w])) return false;
        if ((p.isBundle || p.category === 'paquetes' || p.worlds?.includes('paquetes')) && pausedAreas.paquetes) return false;
        return true;
      });

      return valid.map(p => {
        const timerInfo = flashDeal?.getTimeForProduct ? flashDeal.getTimeForProduct(p.id) : null;
        return {
          product: p,
          isManual: Boolean(p.flashDealConfig?.enabled),
          durationMinutes: timerInfo?.cycleDuration ? Math.round(timerInfo.cycleDuration / 60) : (p.flashDealConfig?.durationMinutes || 120),
          discountPercent: Math.min(15, p.flashDealConfig?.discountPercent || timerInfo?.discountPercent || 15),
          timerInfo
        };
      });
    }

    // Fallback reactivo si el hook no está listo:
    const list = [];
    const seenIds = new Set();
    const areaCounts = { hogar: 0, negocios: 0, eventos: 0, paquetes: 0 };

    products.forEach(p => {
      if (!p.flashDealConfig?.enabled) return;
      if (p.flashDealConfig.expiresAt && p.flashDealConfig.expiresAt <= Date.now()) return;

      if (p.worlds?.some(w => pausedAreas[w])) return;
      if ((p.isBundle || p.category === 'paquetes' || p.worlds?.includes('paquetes')) && pausedAreas.paquetes) return;

      const pAreas = (p.worlds || []).filter(w => flashDealsLimits[w]);
      if (p.isBundle || p.category === 'paquetes' || p.worlds?.includes('paquetes')) {
        if (!pAreas.includes('paquetes')) pAreas.push('paquetes');
      }

      const fits = pAreas.length === 0 || pAreas.every(w => (areaCounts[w] || 0) < (flashDealsLimits[w] || 1));
      if (!fits) return;

      pAreas.forEach(w => {
        areaCounts[w] = (areaCounts[w] || 0) + 1;
      });

      seenIds.add(p.id);
      list.push({
        product: p,
        isManual: true,
        durationMinutes: p.flashDealConfig.durationMinutes || 120,
        discountPercent: Math.min(15, p.flashDealConfig.discountPercent || 15),
        timerInfo: null
      });
    });

    return list;
  }, [products, flashDeal, flashDealsLimits, isGloballyPaused, pausedAreas]);

  // Estadísticas y delimitadores de cupos estrictos por área
  const areaLimitsStats = useMemo(() => {
    const hogarProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('hogar'));
    const negociosProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('negocios'));
    const eventosProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('eventos'));
    const paquetesProds = products.filter(p => p.status === 'published' && (
      p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes')
    ));

    const isHogarPaused = Boolean(isGloballyPaused || pausedAreas.hogar);
    const isNegociosPaused = Boolean(isGloballyPaused || pausedAreas.negocios);
    const isEventosPaused = Boolean(isGloballyPaused || pausedAreas.eventos);
    const isPaquetesPaused = Boolean(isGloballyPaused || pausedAreas.paquetes);

    // Contar productos activos asegurando que nunca excedan su target ni cuenten en áreas pausadas
    const rawHogar = activeFlashList.filter(item => item.product.worlds?.includes('hogar')).length;
    const rawNegocios = activeFlashList.filter(item => item.product.worlds?.includes('negocios')).length;
    const rawEventos = activeFlashList.filter(item => item.product.worlds?.includes('eventos')).length;
    const rawPaquetes = activeFlashList.filter(item => {
      const p = item.product;
      return p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes');
    }).length;

    // Topes dinámicos configurables por el usuario (o sugeridos por defecto)
    const hogarTarget = Math.max(1, Number(flashDealsLimits.hogar) || 3);
    const negociosTarget = Math.max(1, Number(flashDealsLimits.negocios) || 3);
    const eventosTarget = Math.max(1, Number(flashDealsLimits.eventos) || 5);
    const paquetesTarget = Math.max(1, Number(flashDealsLimits.paquetes) || 1);

    const hogarActive = isHogarPaused ? 0 : Math.min(rawHogar, hogarTarget);
    const negociosActive = isNegociosPaused ? 0 : Math.min(rawNegocios, negociosTarget);
    const eventosActive = isEventosPaused ? 0 : Math.min(rawEventos, eventosTarget);
    const paquetesActive = isPaquetesPaused ? 0 : Math.min(rawPaquetes, paquetesTarget);

    return {
      hogar: {
        id: 'hogar',
        name: 'Hogar & Decoración',
        icon: '🏠',
        rule: `Tope configurable: máximo ${hogarTarget} ofertas flash activas`,
        shortRule: `Tope: ${hogarTarget} ofertas`,
        min: 1,
        max: hogarTarget,
        target: hogarTarget,
        total: hogarProds.length,
        active: hogarActive,
        isOverLimit: !isHogarPaused && rawHogar > hogarTarget,
        isAtLimit: !isHogarPaused && hogarActive === hogarTarget,
        isOptimal: isHogarPaused || hogarActive <= hogarTarget,
        isPaused: isHogarPaused
      },
      negocios: {
        id: 'negocios',
        name: 'Negocios & Marca',
        icon: '💼',
        rule: `Tope configurable: máximo ${negociosTarget} ofertas flash activas`,
        shortRule: `Tope: ${negociosTarget} ofertas`,
        min: 1,
        max: negociosTarget,
        target: negociosTarget,
        total: negociosProds.length,
        active: negociosActive,
        isOverLimit: !isNegociosPaused && rawNegocios > negociosTarget,
        isAtLimit: !isNegociosPaused && negociosActive === negociosTarget,
        isOptimal: isNegociosPaused || negociosActive <= negociosTarget,
        isPaused: isNegociosPaused
      },
      eventos: {
        id: 'eventos',
        name: 'Eventos Especiales',
        icon: '🎉',
        rule: `Tope configurable: máximo ${eventosTarget} ofertas flash activas`,
        shortRule: `Tope: ${eventosTarget} ofertas`,
        min: 1,
        max: eventosTarget,
        target: eventosTarget,
        total: eventosProds.length,
        active: eventosActive,
        isOverLimit: !isEventosPaused && rawEventos > eventosTarget,
        isAtLimit: !isEventosPaused && eventosActive === eventosTarget,
        isOptimal: isEventosPaused || eventosActive <= eventosTarget,
        isPaused: isEventosPaused
      },
      paquetes: {
        id: 'paquetes',
        name: 'Paquetes & Servicios',
        icon: '🎁',
        rule: `Tope configurable: máximo ${paquetesTarget} ofertas promocionales`,
        shortRule: `Tope: ${paquetesTarget} ofertas`,
        min: 1,
        max: paquetesTarget,
        target: paquetesTarget,
        total: paquetesProds.length,
        active: paquetesActive,
        isOverLimit: !isPaquetesPaused && rawPaquetes > paquetesTarget,
        isAtLimit: !isPaquetesPaused && paquetesActive === paquetesTarget,
        isOptimal: isPaquetesPaused || paquetesActive <= paquetesTarget,
        isPaused: isPaquetesPaused
      }
    };
  }, [products, activeFlashList, isGloballyPaused, pausedAreas, flashDealsLimits]);

  // Análisis comparativo: Identificar en dónde hay más ofertas
  const areasVolumeAnalysis = useMemo(() => {
    const list = [
      areaLimitsStats.hogar,
      areaLimitsStats.negocios,
      areaLimitsStats.eventos,
      areaLimitsStats.paquetes
    ];

    const maxActive = Math.max(...list.map(a => a.active));
    const leaders = maxActive > 0 ? list.filter(a => a.active === maxActive) : [];
    const totalActiveCount = activeFlashList.length;

    return {
      list,
      maxActive,
      leaders,
      hasLeader: leaders.length === 1 && maxActive > 0,
      hasTie: leaders.length > 1 && maxActive > 0,
      isEmpty: maxActive === 0,
      totalActiveCount
    };
  }, [areaLimitsStats, activeFlashList]);

  // Filtrado de la lista del monitor
  const filteredFlashList = useMemo(() => {
    return activeFlashList.filter(item => {
      const p = item.product;

      // Filtro por área
      if (selectedArea !== 'all' && !isProductInArea(p, selectedArea)) {
        return false;
      }

      // Filtro por texto de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCode = p.code?.toLowerCase().includes(q);
        const matchesCat = p.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCat) return false;
      }

      // Filtro por duración
      if (filterDuration === 'blitz' && item.durationMinutes > 15) return false;
      if (filterDuration === 'short' && (item.durationMinutes <= 15 || item.durationMinutes > 180)) return false;
      if (filterDuration === 'long' && item.durationMinutes <= 180) return false;

      return true;
    });
  }, [activeFlashList, selectedArea, searchQuery, filterDuration]);

  // Productos disponibles en el área seleccionada que NO tienen oferta flash activa
  const eligibleProductsForQuickAdd = useMemo(() => {
    const targetArea = selectedArea === 'all' ? null : selectedArea;
    const activeIds = new Set(activeFlashList.map(item => item.product.id));

    return products.filter(p => {
      if (p.status !== 'published') return false;
      if (activeIds.has(p.id)) return false;
      if (targetArea && !isProductInArea(p, targetArea)) return false;
      return true;
    });
  }, [products, activeFlashList, selectedArea]);

  // Handler: Activar o Apagar oferta flash en un producto
  const handleToggleFlash = async (prod, forceEnable = null) => {
    try {
      setActionLoading(true);
      const currentConfig = prod.flashDealConfig || { enabled: false, durationMinutes: 120, discountPercent: 15 };
      const newEnabled = forceEnable !== null ? forceEnable : !currentConfig.enabled;
      const durationMin = currentConfig.durationMinutes || 120;

      const updatedConfig = {
        ...currentConfig,
        enabled: newEnabled,
        durationMinutes: durationMin,
        discountPercent: Math.min(15, currentConfig.discountPercent || 15),
        startedAt: newEnabled ? Date.now() : null,
        expiresAt: newEnabled ? Date.now() + durationMin * 60 * 1000 : null
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: updatedConfig
        })
      });

      if (res.ok) {
        showNotification(
          newEnabled ? `Oferta Flash activada en [${prod.code}] ${prod.name}` : `Oferta Flash apagada en [${prod.code}] ${prod.name}`,
          'success'
        );
        if (onRefreshCatalog) onRefreshCatalog();
      } else {
        showNotification('No se pudo actualizar la oferta en el servidor', 'error');
      }
    } catch (err) {
      console.error('Error toggling flash:', err);
      showNotification('Error al conectar con el servidor', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Cambiar duración y descuento de un producto
  const handleUpdateDurationAndDiscount = async (prod, durationMinutes, discountPercent) => {
    try {
      setActionLoading(true);
      const currentConfig = prod.flashDealConfig || {};
      const safeDiscount = Math.max(0, Math.min(15, Number(discountPercent) || 0));
      const updatedConfig = {
        ...currentConfig,
        enabled: true,
        durationMinutes: Number(durationMinutes),
        discountPercent: safeDiscount,
        startedAt: Date.now(),
        expiresAt: Date.now() + Number(durationMinutes) * 60 * 1000
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: updatedConfig
        })
      });

      if (res.ok) {
        showNotification(`Oferta actualizada: ${durationMinutes} min con -${safeDiscount}% de descuento`, 'success');
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error updating flash duration/discount:', err);
      showNotification('Error al actualizar oferta', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Activación rápida de producto seleccionado
  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickAddProductId) return;

    const prod = products.find(p => p.id === quickAddProductId);
    if (!prod) return;

    // Verificar si sobrepasará el cupo de alguna de sus áreas
    const targetAreas = prod.worlds || [];
    const willExceed = targetAreas.some(w => {
      const stats = areaLimitsStats[w];
      return stats && stats.active >= stats.target;
    });

    if (willExceed) {
      const proceed = window.confirm(
        `Atención: Este producto pertenece a un área que ya está en su cupo máximo estricto. ¿Deseas activarlo de todas formas en oferta flash?`
      );
      if (!proceed) return;
    }

    await handleUpdateDurationAndDiscount(prod, quickAddDuration, quickAddDiscount);
    setQuickAddProductId('');
    setIsQuickAddOpen(false);
  };

  // Handler maestro: Pausar, Reanudar / Despausar o Reestablecer ofertas flash por área o global
  const handleControlFlash = async (action, areaKey = 'all') => {
    const areaName = areaKey === 'all' ? 'todas las áreas' : (areaLimitsStats[areaKey]?.name || areaKey);

    // Estado optimista previo para revertir en caso de error
    const prevPaused = localPausedAreas || pausedAreas;
    const prevGloballyPaused = isGloballyPaused;

    // Actualización inmediata en UI sin esperar round-trip de red
    if (action === 'pause_area' && areaKey !== 'all') {
      setLocalPausedAreas({ ...prevPaused, [areaKey]: true });
    } else if ((action === 'resume_area' || action === 'unpause_area') && areaKey !== 'all') {
      setLocalPausedAreas({ ...prevPaused, [areaKey]: false });
      setLocalIsGloballyPaused(false);
    } else if (action === 'pause_all') {
      setLocalIsGloballyPaused(true);
      setLocalPausedAreas({ hogar: true, negocios: true, eventos: true, paquetes: true });
    } else if (action === 'resume_all' || action === 'unpause_all') {
      setLocalIsGloballyPaused(false);
      setLocalPausedAreas({ hogar: false, negocios: false, eventos: false, paquetes: false });
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/flash-deals/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, area: areaKey })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.flashDealsStatus?.pausedAreas) {
          setLocalPausedAreas(data.flashDealsStatus.pausedAreas);
        }
        if (data.flashDealsStatus?.isGloballyPaused !== undefined) {
          setLocalIsGloballyPaused(data.flashDealsStatus.isGloballyPaused);
        }
        showNotification(data.message || `Operación completada en ${areaName}`, 'success');
        if (onRefreshCatalog) await onRefreshCatalog();
      } else {
        if (action === 'pause_area' || action === 'pause_all') {
          await fallbackPause(areaKey);
        } else {
          setLocalPausedAreas(prevPaused);
          setLocalIsGloballyPaused(prevGloballyPaused);
          showNotification('No se pudo actualizar el estado de las ofertas flash', 'error');
        }
      }
    } catch (err) {
      console.error('Error controlling flash deals:', err);
      setLocalPausedAreas(prevPaused);
      setLocalIsGloballyPaused(prevGloballyPaused);
      if (action === 'pause_area' || action === 'pause_all') {
        await fallbackPause(areaKey);
      } else {
        showNotification('Error de conexión al gestionar ofertas flash', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const fallbackPause = async (areaKey) => {
    const prodsToPause = activeFlashList.filter(item => isProductInArea(item.product, areaKey));
    for (const item of prodsToPause) {
      const prod = item.product;
      const currentConfig = prod.flashDealConfig || {};
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: {
            ...currentConfig,
            enabled: false,
            startedAt: null,
            expiresAt: null
          }
        })
      });
    }
    showNotification(`Se pausaron las ofertas en ${areaKey === 'all' ? 'todas las áreas' : areaKey}`, 'success');
    if (onRefreshCatalog) onRefreshCatalog();
  };

  // Handler: Pausar todas las ofertas de un área específica (compatibilidad)
  const handlePauseAllInArea = async (areaKey) => {
    return handleControlFlash('pause_area', areaKey);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 transition-all animate-bounce ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : notification.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ENCABEZADO PRINCIPAL */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E5C378] via-[#C28E38] to-[#9E472A] flex items-center justify-center text-white shadow-xs">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#1F2421] font-heading">
                  Control &amp; Delimitadores de Ofertas Flash por Área
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Gestión Estricta de Cupos
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitor en tiempo real de productos en oferta, delimitadores por área y control de cupos en vivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {isGloballyPaused || activeFlashList.length === 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-bold flex items-center gap-1.5">
                <PauseCircle className="w-4 h-4 text-red-600" />
                <span>Ofertas Pausadas</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{activeFlashList.length} ofertas activas</span>
              </span>
            )}

            {/* Acciones Maestras Globales */}
            {isGloballyPaused || activeFlashList.length === 0 ? (
              <button
                onClick={() => handleControlFlash('resume_all', 'all')}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                title="Reanudar y despausar ofertas flash en todas las áreas"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Reanudar Todas</span>
              </button>
            ) : (
              <button
                onClick={() => handleControlFlash('pause_all', 'all')}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Pausar todas las ofertas flash en el taller"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar Todas</span>
              </button>
            )}

            <button
              onClick={() => handleControlFlash('reset_cycle', 'all')}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Reestablecer y reiniciar ciclo de ofertas flash y cronómetros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reestablecer Ciclo</span>
            </button>

            {onRefreshCatalog && (
              <button
                onClick={onRefreshCatalog}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#2D4F3E] transition-colors cursor-pointer"
                title="Actualizar catálogo en tiempo real"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* BANNER DE PAUSA GLOBAL O POR ÁREA */}
        {isGloballyPaused ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PauseCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                  <span>Ofertas Flash Pausadas en Todas las Áreas</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">Taller en Pausa</span>
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  La tienda no está mostrando ofertas flash temporales en ninguna sección. Puedes reanudarlas o reiniciar el ciclo cuando desees para restaurar los cupos automáticamente.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => handleControlFlash('resume_all', 'all')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>▶️ Reanudar / Despausar Todas</span>
              </button>
              <button
                onClick={() => handleControlFlash('reset_cycle', 'all')}
                disabled={actionLoading}
                className="px-3 py-2 rounded-xl border border-amber-300 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reestablecer Ciclo</span>
              </button>
            </div>
          </div>
        ) : Object.keys(pausedAreas).some(k => pausedAreas[k]) ? (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Áreas actualmente pausadas: {Object.keys(pausedAreas).filter(k => pausedAreas[k]).map(k => areaLimitsStats[k]?.name || k).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleControlFlash('resume_all', 'all')}
                disabled={actionLoading}
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-emerald-800" />
                <span>Despausar Todas las Áreas</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* ANÁLISIS DINÁMICO: ¿EN DÓNDE HAY MÁS OFERTAS? */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FAF7F0] via-[#F4EDE0] to-[#FAF7F0] border border-[#E5D7B7] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1F2421]">
              <TrendingUp className="w-4 h-4 text-[#C28E38]" />
              <span>Diagnóstico de Volumen: ¿En dónde hay más ofertas activas?</span>
            </div>

            {/* Badge de área líder */}
            <div>
              {areasVolumeAnalysis.isEmpty ? (
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  Sin ofertas flash activas actualmente
                </span>
              ) : areasVolumeAnalysis.hasLeader ? (
                <span className="px-3 py-1 rounded-full bg-[#9E472A] text-white text-xs font-black shadow-xs flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>Área líder: {areasVolumeAnalysis.leaders[0].icon} {areasVolumeAnalysis.leaders[0].name} ({areasVolumeAnalysis.leaders[0].active} ofertas)</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#C28E38] text-white text-xs font-black shadow-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>Empate en cabeza: {areasVolumeAnalysis.leaders.map(l => `${l.icon} ${l.name}`).join(' y ')} ({areasVolumeAnalysis.maxActive} ofertas c/u)</span>
                </span>
              )}
            </div>
          </div>

          {/* Barras comparativas de distribución por área */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {areasVolumeAnalysis.list.map(area => {
              const isLeader = areasVolumeAnalysis.maxActive > 0 && area.active === areasVolumeAnalysis.maxActive;
              const percentOfTotal = activeFlashList.length > 0
                ? Math.round((area.active / activeFlashList.length) * 100)
                : 0;

              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedArea === area.id
                      ? 'bg-white border-[#2D4F3E] shadow-xs ring-1 ring-[#2D4F3E]'
                      : 'bg-white/70 border-[#E8E4DA] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <span>{area.icon}</span>
                      <span>{area.name}</span>
                    </span>
                    <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${
                      isLeader ? 'bg-[#9E472A] text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {area.active} {area.active === 1 ? 'oferta' : 'ofertas'}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>Cupo: {area.active}/{area.target}</span>
                    <span>{percentOfTotal}% del total</span>
                  </div>

                  {/* Micro barra comparativa */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLeader ? 'bg-[#9E472A]' : 'bg-[#2D4F3E]'
                      }`}
                      style={{ width: `${Math.min(100, (area.active / Math.max(1, area.target)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODIFICADOR DE TOPE MÁXIMO POR ÁREA (REGULADOR DE CUPOS EN VIVO) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2D4F3E]/10 flex items-center justify-center text-[#2D4F3E] shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-[#1F2421] font-heading">
                    Modificador de Tope Máximo por Área
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Regulador de Cupos Flash
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Ajusta libremente cuántas ofertas flash simultáneas se permiten como tope máximo en cada área del taller.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-[#C28E38] fill-[#C28E38]" />
                <span>Tope Total Autorizado: {Number(limitsForm.hogar || 0) + Number(limitsForm.negocios || 0) + Number(limitsForm.eventos || 0) + Number(limitsForm.paquetes || 0)} ofertas</span>
              </div>
            </div>
          </div>

          {/* Steppers por Área */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: 'hogar', name: 'Hogar & Decoración', icon: '🏠', baseDefault: 3 },
              { id: 'negocios', name: 'Negocios & Marca', icon: '💼', baseDefault: 3 },
              { id: 'eventos', name: 'Eventos Especiales', icon: '🎉', baseDefault: 5 },
              { id: 'paquetes', name: 'Paquetes & Servicios', icon: '🎁', baseDefault: 1 }
            ].map(item => {
              const currentVal = Number(limitsForm[item.id]) || item.baseDefault;
              const stats = areaLimitsStats[item.id];
              const isOver = stats && stats.active > currentVal;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOver
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-[#FAF7F0] border-[#E8E4DA]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[10.5px] text-gray-500 font-normal">
                      Sugerido: {item.baseDefault}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-600 font-medium">
                      Tope máximo:
                    </span>
                    {/* Stepper numérico */}
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-2xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjustLimit(item.id, -1)}
                        disabled={savingLimits || currentVal <= 1}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer transition-colors"
                        title="Disminuir tope en 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={currentVal}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
                          setLimitsForm(prev => ({ ...prev, [item.id]: val }));
                        }}
                        className="w-10 h-7 text-center font-bold text-xs text-gray-900 border-x border-gray-200 bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickAdjustLimit(item.id, 1)}
                        disabled={savingLimits || currentVal >= 30}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer transition-colors"
                        title="Aumentar tope en 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Micro estatus de ocupación vs tope */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>Activas ahora: {stats ? stats.active : 0}</span>
                    <span className={isOver ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {isOver ? 'Excedido' : `${Math.max(0, currentVal - (stats?.active || 0))} cupos libres`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones de acción del modificador */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-gray-100">
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Los topes se sincronizan al instante en el backend y respetan la rotación de 2 horas.</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => {
                  const defaultLimits = { hogar: 3, negocios: 3, eventos: 5, paquetes: 1 };
                  setLimitsForm(defaultLimits);
                  handleSaveLimits(defaultLimits);
                }}
                disabled={savingLimits}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Restablecer a topes recomendados (3, 3, 5, 1)"
              >
                <RotateCcw className="w-3 h-3 text-gray-500" />
                <span>Restaurar Sugeridos (3, 3, 5, 1)</span>
              </button>

              <button
                type="button"
                onClick={() => handleControlFlash('trim_to_limits', 'all')}
                disabled={actionLoading || savingLimits}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Apagar automáticamente ofertas manuales sobrantes que excedan el tope"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Ajustar al Tope (Limpiar Excedentes)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveLimits(limitsForm)}
                disabled={savingLimits}
                className="px-4 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#1e3529] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {savingLimits ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Guardar Topes</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 DELIMITADORES DE CUPOS ESTRICTOS (TARJETAS GRANDES CON CONTROLES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(areaLimitsStats).map(area => {
            const isSelected = selectedArea === area.id;
            const pct = Math.min(100, Math.round((area.active / Math.max(1, area.target)) * 100));
            const isLeader = areasVolumeAnalysis.maxActive > 0 && area.active === areasVolumeAnalysis.maxActive;

            return (
              <div
                key={area.id}
                onClick={() => setSelectedArea(area.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-50/40 border-[#2D4F3E] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                    : area.isOverLimit
                    ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                    : area.isAtLimit
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                    : 'bg-gray-50/70 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Badge de más ofertas */}
                {isLeader && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#9E472A] text-white text-[9.5px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 fill-white" />
                    <span>Más Ofertas</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span className="text-lg">{area.icon}</span>
                    <span>{area.name}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Mini Stepper de ajuste rápido */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center bg-white border border-gray-200 rounded-md shadow-2xs overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdjustLimit(area.id, -1);
                        }}
                        disabled={savingLimits || (limitsForm[area.id] || area.target) <= 1}
                        className="px-1.5 py-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer font-bold text-[10px]"
                        title="Reducir tope"
                      >
                        -
                      </button>
                      <span className="px-1.5 py-0.5 text-[10px] font-black text-gray-700 font-mono">
                        Tope: {limitsForm[area.id] ?? area.target}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAdjustLimit(area.id, 1);
                        }}
                        disabled={savingLimits || (limitsForm[area.id] || area.target) >= 30}
                        className="px-1.5 py-0.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 cursor-pointer font-bold text-[10px]"
                        title="Aumentar tope"
                      >
                        +
                      </button>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        area.isPaused
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : area.isOverLimit
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : area.isAtLimit
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : area.isOptimal
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {area.isPaused ? '⏸️ Pausada (0 activas)' : `${area.active} / ${area.target} activas`}
                    </span>
                  </div>
                </div>

                {/* Regla y Delimitador */}
                <div className="mt-2 text-[11px] text-gray-700 font-medium">
                  <strong>Delimitador estricto:</strong>
                  <div className="text-[10.5px] text-gray-500 mt-0.5 leading-tight">{area.rule}</div>
                </div>

                <div className="mt-2 text-[10.5px] text-gray-400">
                  {area.total} productos totales en catálogo
                </div>

                {/* Barra de progreso de cupo */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>Ocupación de cupo</span>
                    <span className="font-bold">{area.isPaused ? '0%' : `${pct}%`}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        area.isPaused
                          ? 'bg-gray-300'
                          : area.isOverLimit
                          ? 'bg-red-600'
                          : area.isAtLimit
                          ? 'bg-amber-500'
                          : 'bg-[#2D4F3E]'
                      }`}
                      style={{ width: `${area.isPaused ? 0 : pct}%` }}
                    />
                  </div>
                </div>

                {/* Estatus semáforo y controles por área */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-500">
                    {area.isPaused ? (
                      <span className="text-red-700 flex items-center gap-1 font-extrabold">
                        <PauseCircle className="w-3 h-3 text-red-600" /> Pausada (Sin ofertas)
                      </span>
                    ) : area.isOverLimit ? (
                      <span className="text-red-600 flex items-center gap-1 font-extrabold">
                        <AlertTriangle className="w-3 h-3" /> Excede cupo
                      </span>
                    ) : area.isAtLimit ? (
                      <span className="text-amber-700 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-amber-600" /> Cupo lleno
                      </span>
                    ) : area.isOptimal ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Cupo óptimo
                      </span>
                    ) : (
                      <span className="text-gray-400">Cupo disponible</span>
                    )}
                  </span>

                  {/* Acciones directas por cada área */}
                  <div className="flex items-center gap-1">
                    {area.isPaused ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControlFlash('resume_area', area.id);
                        }}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10.5px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        title={`Reanudar y despausar ofertas de ${area.name}`}
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>Reanudar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleControlFlash('pause_area', area.id);
                        }}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded-lg border border-red-300 bg-red-50/60 text-red-700 hover:bg-red-100 font-bold text-[10.5px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                        title={`Pausar ofertas de ${area.name}`}
                      >
                        <Pause className="w-2.5 h-2.5" />
                        <span>Pausar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleControlFlash('reset_cycle', area.id);
                      }}
                      disabled={actionLoading}
                      className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:text-[#2D4F3E] hover:bg-gray-100 transition-all cursor-pointer"
                      title={`Reestablecer cronómetros y cupo de ${area.name}`}
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BARRA DE FILTROS POR ÁREA & HERRAMIENTAS DE CONTROL */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-4">
        {/* Pestañas de filtro por área */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#2D4F3E]" />
              <span>Filtrar por Área:</span>
            </span>

            {/* Todas */}
            <button
              onClick={() => setSelectedArea('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedArea === 'all'
                  ? 'bg-[#2D4F3E] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🌐 Todas las Áreas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedArea === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {activeFlashList.length}
              </span>
            </button>

            {/* Hogar */}
            <button
              onClick={() => setSelectedArea('hogar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedArea === 'hogar'
                  ? 'bg-[#2D4F3E] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🏠 Hogar</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedArea === 'hogar' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {areaLimitsStats.hogar.active}/{areaLimitsStats.hogar.target}
              </span>
              {areaLimitsStats.hogar.isPaused && (
                <span className="text-[9px] bg-red-100 text-red-800 border border-red-300 px-1 rounded font-black">PAUSA</span>
              )}
              {areasVolumeAnalysis.maxActive > 0 && areaLimitsStats.hogar.active === areasVolumeAnalysis.maxActive && !areaLimitsStats.hogar.isPaused && (
                <span className="text-[9px] bg-[#9E472A] text-white px-1 rounded font-black">LÍDER</span>
              )}
            </button>

            {/* Negocios */}
            <button
              onClick={() => setSelectedArea('negocios')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedArea === 'negocios'
                  ? 'bg-[#2D4F3E] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>💼 Negocios</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedArea === 'negocios' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {areaLimitsStats.negocios.active}/{areaLimitsStats.negocios.target}
              </span>
              {areaLimitsStats.negocios.isPaused && (
                <span className="text-[9px] bg-red-100 text-red-800 border border-red-300 px-1 rounded font-black">PAUSA</span>
              )}
              {areasVolumeAnalysis.maxActive > 0 && areaLimitsStats.negocios.active === areasVolumeAnalysis.maxActive && !areaLimitsStats.negocios.isPaused && (
                <span className="text-[9px] bg-[#9E472A] text-white px-1 rounded font-black">LÍDER</span>
              )}
            </button>

            {/* Eventos */}
            <button
              onClick={() => setSelectedArea('eventos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedArea === 'eventos'
                  ? 'bg-[#2D4F3E] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🎉 Eventos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedArea === 'eventos' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {areaLimitsStats.eventos.active}/{areaLimitsStats.eventos.target}
              </span>
              {areaLimitsStats.eventos.isPaused && (
                <span className="text-[9px] bg-red-100 text-red-800 border border-red-300 px-1 rounded font-black">PAUSA</span>
              )}
              {areasVolumeAnalysis.maxActive > 0 && areaLimitsStats.eventos.active === areasVolumeAnalysis.maxActive && !areaLimitsStats.eventos.isPaused && (
                <span className="text-[9px] bg-[#9E472A] text-white px-1 rounded font-black">LÍDER</span>
              )}
            </button>

            {/* Paquetes */}
            <button
              onClick={() => setSelectedArea('paquetes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedArea === 'paquetes'
                  ? 'bg-[#2D4F3E] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🎁 Paquetes &amp; Servicios</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                selectedArea === 'paquetes' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {areaLimitsStats.paquetes.active}/{areaLimitsStats.paquetes.target}
              </span>
              {areaLimitsStats.paquetes.isPaused && (
                <span className="text-[9px] bg-red-100 text-red-800 border border-red-300 px-1 rounded font-black">PAUSA</span>
              )}
              {areasVolumeAnalysis.maxActive > 0 && areaLimitsStats.paquetes.active === areasVolumeAnalysis.maxActive && !areaLimitsStats.paquetes.isPaused && (
                <span className="text-[9px] bg-[#9E472A] text-white px-1 rounded font-black">LÍDER</span>
              )}
            </button>
          </div>

          {/* Botones de acción rápida: Activar producto, Pausar/Reanudar área & Reestablecer */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedArea === 'all' ? (
              <>
                {isGloballyPaused || activeFlashList.length === 0 ? (
                  <button
                    onClick={() => handleControlFlash('resume_all', 'all')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    title="Reanudar y despausar todas las ofertas flash"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>▶️ Reanudar Todas</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleControlFlash('pause_all', 'all')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Pausar todas las ofertas flash del taller"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>⏸️ Pausar Todas</span>
                  </button>
                )}

                <button
                  onClick={() => handleControlFlash('reset_cycle', 'all')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Reestablecer ciclo de ofertas y cronómetros de todas las áreas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reestablecer Ciclo</span>
                </button>
              </>
            ) : (
              <>
                {areaLimitsStats[selectedArea]?.isPaused ? (
                  <button
                    onClick={() => handleControlFlash('resume_area', selectedArea)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    title={`Reanudar y despausar área de ${areaLimitsStats[selectedArea]?.name}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>▶️ Reanudar Área</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleControlFlash('pause_area', selectedArea)}
                    disabled={actionLoading || areaLimitsStats[selectedArea]?.active === 0}
                    className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={`Pausar ofertas de ${areaLimitsStats[selectedArea]?.name}`}
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>⏸️ Pausar Área</span>
                  </button>
                )}

                <button
                  onClick={() => handleControlFlash('reset_cycle', selectedArea)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title={`Reestablecer cronómetros y cupo de ${areaLimitsStats[selectedArea]?.name}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reestablecer</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="px-3 py-1.5 rounded-xl bg-[#2D4F3E] text-white hover:bg-[#233F32] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {selectedArea === 'all'
                  ? '⚡ Poner Producto en Flash'
                  : `⚡ Poner Producto en Flash (${(areaLimitsStats[selectedArea]?.name || '').split(' ')[0]})`}
              </span>
            </button>
          </div>
        </div>

        {/* PANEL DESPLEGABLE: ACTIVAR NUEVA OFERTA FLASH EN PRODUCTO DEL ÁREA */}
        {isQuickAddOpen && (
          <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E5D7B7] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5D7B7]/60 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#9E472A]" />
                <span className="text-xs font-bold text-[#1F2421]">
                  Activar Producto en Oferta Flash{' '}
                  {selectedArea !== 'all' && (
                    <span className="text-[#2D4F3E]">({areaLimitsStats[selectedArea]?.name})</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Selecciona el producto a promocionar:
                </label>
                <select
                  value={quickAddProductId}
                  onChange={(e) => setQuickAddProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white font-medium focus:ring-1 focus:ring-[#2D4F3E]"
                  required
                >
                  <option value="">-- Elige un producto elegible ({eligibleProductsForQuickAdd.length} disponibles) --</option>
                  {eligibleProductsForQuickAdd.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} — ${p.price} MXN {p.worlds ? `(${p.worlds.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  % Descuento Flash (Máx 15%):
                </label>
                <select
                  value={quickAddDiscount}
                  onChange={(e) => setQuickAddDiscount(Math.min(15, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white font-bold text-[#9E472A] focus:ring-1 focus:ring-[#2D4F3E]"
                >
                  <option value={5}>-5% Descuento</option>
                  <option value={10}>-10% Descuento</option>
                  <option value={15}>-15% Descuento (Tope Máximo Taller)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Duración de la Oferta:
                </label>
                <select
                  value={quickAddDuration}
                  onChange={(e) => setQuickAddDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white font-medium focus:ring-1 focus:ring-[#2D4F3E]"
                >
                  <option value={15}>⚡ 15 minutos (Blitz Relámpago)</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas (Recomendado)</option>
                  <option value={180}>3 horas</option>
                  <option value={360}>6 horas</option>
                  <option value={720}>12 horas</option>
                  <option value={1440}>24 horas (Día Completo)</option>
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-500">
                  {selectedArea !== 'all' && areaLimitsStats[selectedArea]?.isAtLimit && (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Aviso: El área {areaLimitsStats[selectedArea]?.name} ya alcanzó su cupo de {areaLimitsStats[selectedArea]?.target} ofertas.
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!quickAddProductId || actionLoading}
                    className="px-4 py-1.5 rounded-lg bg-[#2D4F3E] text-white hover:bg-[#233F32] font-black flex items-center gap-1.5 disabled:opacity-40 shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Lanzar Oferta Flash Ahora</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* BUSCADOR DE PRODUCTOS Y FILTRO DE TIEMPO DENTRO DEL MONITOR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, nombre o categoría en oferta..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium">Duración:</span>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white font-medium"
            >
              <option value="all">Cualquier duración</option>
              <option value="blitz">Solo Blitz (≤ 15 min)</option>
              <option value="short">Cortas (15m a 3h)</option>
              <option value="long">Largas (&gt; 3h)</option>
            </select>
          </div>
        </div>
      </div>

      {/* MONITOR EN TIEMPO REAL: TABLA DE PRODUCTOS EN OFERTA FLASH */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9E472A]" />
            <h4 className="text-sm font-bold text-[#1F2421] font-heading">
              Monitor de Productos en Oferta Flash ({filteredFlashList.length})
            </h4>
            {selectedArea !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                Área: {areaLimitsStats[selectedArea]?.name}
              </span>
            )}
          </div>

          <span className="text-[11px] text-gray-400 font-medium">
            Especificación en vivo: porcentaje de descuento, cronómetro y control por producto
          </span>
        </div>

        {filteredFlashList.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <Flame className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-600">
              No hay ofertas flash activas que coincidan con los filtros seleccionados.
            </p>
            <p className="text-[11px] text-gray-400 max-w-md mx-auto">
              Puedes cambiar el área seleccionada, limpiar la búsqueda o usar el botón &ldquo;⚡ Poner Producto en Flash&rdquo; para activar una oferta de inmediato.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E8E4DA]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Foto &amp; Código</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Áreas Asignadas</th>
                  <th className="py-2.5 px-3">Descuento &amp; Precios</th>
                  <th className="py-2.5 px-3">Tiempo en Oferta / Restante</th>
                  <th className="py-2.5 px-3 text-right">Control Rápido de Oferta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFlashList.map(item => {
                  const p = item.product;
                  const originalPrice = p.price || 0;
                  const flashPrice = Math.round(originalPrice * (1 - Math.min(15, (item.discountPercent || 15)) / 100));
                  const timer = item.timerInfo;
                  const remainingText = timer?.timeFormatted?.fullText || (timer?.secondsRemaining ? `${Math.floor(timer.secondsRemaining / 60)}m` : `${item.durationMinutes}m`);
                  const isUrgent = timer?.isUrgentLessThan15m || (timer?.secondsRemaining && timer.secondsRemaining <= 900);
                  const isBlitz = timer?.isBlitz || (item.durationMinutes <= 15);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Foto y Código */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.primaryImage || p.whiteBgImage || '/placeholder.png'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                          />
                          <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                            {p.code}
                          </span>
                        </div>
                      </td>

                      {/* Nombre y Tipo de oferta */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#1F2421] leading-snug">{p.name}</div>
                        <div className="text-[10.5px] text-gray-400 mt-0.5 flex items-center gap-1">
                          {item.isManual ? (
                            <span className="text-emerald-700 font-semibold">● Manual (Admin)</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">● Rotación Automática</span>
                          )}
                          <span>• {p.category || 'General'}</span>
                        </div>
                      </td>

                      {/* Áreas Asignadas */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {p.worlds && p.worlds.length > 0 ? (
                            p.worlds.map(w => (
                              <span
                                key={w}
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold capitalize flex items-center gap-1 ${
                                  selectedArea === w
                                    ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                <span>{w === 'hogar' ? '🏠' : w === 'negocios' ? '💼' : '🎉'}</span>
                                <span>{w}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-400">Sin área asignada</span>
                          )}

                          {(p.isBundle || p.category === 'paquetes' || p.category === 'servicios') && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold flex items-center gap-1">
                              <span>🎁</span>
                              <span>Paquete</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Descuento y Precios con Dropdown de Ajuste Directo */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 line-through font-semibold">${originalPrice}</span>
                            
                            {/* Selector rápido de descuento */}
                            <select
                              value={Math.min(15, item.discountPercent || 15)}
                              onChange={(e) => handleUpdateDurationAndDiscount(p, item.durationMinutes, Math.min(15, Number(e.target.value)))}
                              disabled={actionLoading}
                              className="text-[10px] font-black text-[#9E472A] bg-amber-50 border border-amber-300 rounded px-1 py-0.2 cursor-pointer"
                              title="Cambiar % de descuento al instante (tope 15%)"
                            >
                              <option value={5}>-5%</option>
                              <option value={10}>-10%</option>
                              <option value={15}>-15% (Tope)</option>
                            </select>
                          </div>

                          <span className="font-black text-[#9E472A] text-sm">
                            ${flashPrice} MXN
                          </span>
                        </div>
                      </td>

                      {/* Tiempo Restante y Temporizador */}
                      <td className="py-2.5 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                              isUrgent
                                ? 'bg-red-600 text-white animate-pulse'
                                : isBlitz
                                ? 'bg-amber-500 text-white'
                                : 'bg-black/80 text-amber-200'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{timer?.durationLabel || `FLASH ${item.durationMinutes}M`}</span>
                            </span>

                            <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                              {remainingText}
                            </span>
                          </div>

                          {isUrgent && (
                            <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
                              <Zap className="w-3 h-3 fill-red-600" />
                              <span>¡Activa en reloj flotante de tienda!</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Control Rápido de Oferta: Duración, Apagar, Editar */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Selector directo de duración */}
                          <select
                            value={item.durationMinutes}
                            onChange={(e) => handleUpdateDurationAndDiscount(p, Number(e.target.value), item.discountPercent)}
                            disabled={actionLoading}
                            className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 bg-white font-medium cursor-pointer"
                            title="Cambiar tiempo de oferta"
                          >
                            <option value={15}>15m (Blitz)</option>
                            <option value={30}>30m</option>
                            <option value={60}>1h</option>
                            <option value={120}>2h</option>
                            <option value={180}>3h</option>
                            <option value={360}>6h</option>
                            <option value={720}>12h</option>
                            <option value={1440}>24h</option>
                          </select>

                          {/* Botón Apagar Oferta */}
                          <button
                            onClick={() => handleToggleFlash(p, false)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
                            title="Desactivar oferta flash inmediatamente"
                          >
                            Apagar
                          </button>

                          {/* Botón Editar Producto */}
                          {onEditProduct && (
                            <button
                              onClick={() => onEditProduct(p)}
                              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              title="Editar producto y áreas completas"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* BANNER INFORMATIVO: COMPARTICIÓN ENTRE ÁREAS */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E5D7B7] text-xs text-[#2D4F3E] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#C28E38] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#1F2421] block">
              🔄 Compartición Automática entre Áreas &amp; Preservación de Márgenes
            </span>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Cuando un producto pertenece a múltiples áreas (ej. Hogar + Eventos), su oferta flash, descuento y temporizador se reflejan de forma sincronizada en ambas áreas de la tienda sin alterar los costos base de taller ni duplicar inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
