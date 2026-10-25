import React, { useState, useEffect } from 'react';
import {
  Gamepad2, Trophy, Star, Clock, Zap, Check,
  AlertTriangle, RefreshCw, Sparkles, Layers, ShieldCheck,
  Eye, EyeOff, RotateCw, DollarSign, Percent, Plus, Trash2, Bookmark, Coins
} from 'lucide-react';
import { GAMES } from './WorkshopArcadeModal';
import AdminConfirmSaveModal from './AdminConfirmSaveModal';
import { resetAllCoinsInstantly } from '../utils/arcadeCreditsManager';

export default function ArcadeAdminSection({ token }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);

  // Estados para Restablecimiento Inmediato de Monedas
  const [isResettingCoins, setIsResettingCoins] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Estados para Guardado de Presets por Temporadas
  const [showNewPresetModal, setShowNewPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetIcon, setNewPresetIcon] = useState('🎄');
  const [newPresetSeason, setNewPresetSeason] = useState('navidad');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  // Estado del Arcade & Mini-Juegos
  const [arcadeConfig, setArcadeConfig] = useState({
    enabled: true,
    selectionMode: 'daily_random',
    activeGameIds: ['dino', 'stacker'],
    activeTheme: 'clasico',
    timeLimitSeconds: 300,
    showInProductModal: true,
    showFloatingEasterEgg: true,
    coinsEarnRateMinutes: 15, // 1 moneda cada 15 min en tienda
    maxCoinsCap: 5,           // Tope máximo de 5 monedas
    costPerGame: 1,           // Costo por partida: 1 crédito
    coinToCreditCost: 2,      // 2 monedas acumuladas = 1 crédito
    lastResetTimestamp: 0,
    seasonPresets: [],
    discountTiers: [
      { id: 'tier-5', coinsRequired: 50, code: 'TALLER5', label: '5% de Descuento', description: 'Válido en cualquier compra o paquete (Mínimo $100 MXN)', discountPercent: 5, discountAmount: 0, minPurchase: 100 },
      { id: 'tier-10', coinsRequired: 100, code: 'TALLER10', label: '10% de Descuento', description: 'Válido en productos o paquetes coordinados (Mínimo $250 MXN)', discountPercent: 10, discountAmount: 0, minPurchase: 250 },
      { id: 'tier-15', coinsRequired: 250, code: 'TALLER15', label: '15% de Descuento', description: 'Descuento del 15% en tu pedido (Mínimo $350 MXN)', discountPercent: 15, discountAmount: 0, minPurchase: 350 },
      { id: 'tier-20', coinsRequired: 580, code: 'TALLER20', label: '20% de Descuento VIP', description: 'Descuento VIP máximo del taller (Mínimo $500 MXN)', discountPercent: 20, discountAmount: 0, minPurchase: 500 }
    ]
  });

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/arcade/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setArcadeConfig(prev => ({
          ...prev,
          ...data,
          coinsEarnRateMinutes: data.coinsEarnRateMinutes || 15,
          maxCoinsCap: data.maxCoinsCap || 5,
          costPerGame: data.costPerGame || 1,
          coinToCreditCost: data.coinToCreditCost || 2,
          lastResetTimestamp: data.lastResetTimestamp || 0,
          seasonPresets: Array.isArray(data.seasonPresets) && data.seasonPresets.length > 0 ? data.seasonPresets : (prev.seasonPresets || []),
          discountTiers: Array.isArray(data.discountTiers) && data.discountTiers.length > 0
            ? data.discountTiers
            : prev.discountTiers
        }));
      }
    } catch (err) {
      console.error('Error cargando configuración de Arcade:', err);
      setMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadConfig();
  }, [token]);

  // Restablecer monedas de todos los clientes inmediatamente a 0
  const handleResetCoins = async () => {
    setIsResettingCoins(true);
    try {
      const res = await fetch('/api/admin/arcade/reset-coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setArcadeConfig(prev => ({ ...prev, lastResetTimestamp: data.lastResetTimestamp }));
        resetAllCoinsInstantly(data.lastResetTimestamp);
        setMessage({
          text: '⚡ ¡Monedas restablecidas a 0 para todos los clientes en la tienda inmediatamente!',
          type: 'success'
        });
        setShowResetConfirmModal(false);
      } else {
        setMessage({ text: 'Error al restablecer las monedas en el servidor', type: 'error' });
      }
    } catch (err) {
      console.error('Error al restablecer monedas:', err);
      setMessage({ text: 'Error de conexión al restablecer monedas', type: 'error' });
    } finally {
      setIsResettingCoins(false);
    }
  };

  // Cargar un preset de temporada en el formulario
  const handleApplyPreset = (preset) => {
    if (!preset || !preset.config) return;
    const cfg = preset.config;
    setArcadeConfig(prev => ({
      ...prev,
      activeTheme: cfg.activeTheme || prev.activeTheme,
      selectionMode: cfg.selectionMode || prev.selectionMode,
      activeGameIds: Array.isArray(cfg.activeGameIds) ? cfg.activeGameIds : prev.activeGameIds,
      coinsEarnRateMinutes: cfg.coinsEarnRateMinutes || prev.coinsEarnRateMinutes,
      maxCoinsCap: cfg.maxCoinsCap || prev.maxCoinsCap,
      costPerGame: cfg.costPerGame || prev.costPerGame || 1,
      coinToCreditCost: cfg.coinToCreditCost || prev.coinToCreditCost || 2,
      timeLimitSeconds: cfg.timeLimitSeconds || prev.timeLimitSeconds,
      discountTiers: Array.isArray(cfg.discountTiers) ? cfg.discountTiers : prev.discountTiers
    }));
    setMessage({
      text: `✨ Preset "${preset.name}" cargado en el formulario. Haz clic en "Guardar Configuración" para activarlo en la tienda.`,
      type: 'success'
    });
  };

  // Guardar configuración actual como nuevo preset de temporada
  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      setMessage({ text: 'Por favor asigna un nombre a tu preset de temporada', type: 'error' });
      return;
    }
    const newPreset = {
      id: `preset-custom-${Date.now()}`,
      name: newPresetName.trim(),
      season: newPresetSeason || 'personalizado',
      icon: newPresetIcon || '🎮',
      description: newPresetDescription.trim() || 'Configuración personalizada del taller',
      isCustom: true,
      config: {
        activeTheme: arcadeConfig.activeTheme,
        selectionMode: arcadeConfig.selectionMode,
        activeGameIds: arcadeConfig.activeGameIds,
        coinsEarnRateMinutes: arcadeConfig.coinsEarnRateMinutes,
        maxCoinsCap: arcadeConfig.maxCoinsCap,
        costPerGame: arcadeConfig.costPerGame,
        coinToCreditCost: arcadeConfig.coinToCreditCost,
        timeLimitSeconds: arcadeConfig.timeLimitSeconds,
        discountTiers: arcadeConfig.discountTiers
      }
    };
    const updatedPresets = [...(arcadeConfig.seasonPresets || []), newPreset];
    setArcadeConfig(prev => ({ ...prev, seasonPresets: updatedPresets }));
    setShowNewPresetModal(false);
    setNewPresetName('');
    setNewPresetDescription('');
    setMessage({
      text: `💾 Nuevo preset "${newPreset.name}" guardado en la lista. Guarda la configuración para confirmarlo en la base de datos.`,
      type: 'success'
    });
  };

  // Eliminar preset personalizado
  const handleDeletePreset = (presetId) => {
    const updated = (arcadeConfig.seasonPresets || []).filter(p => p.id !== presetId);
    setArcadeConfig(prev => ({ ...prev, seasonPresets: updated }));
    setMessage({ text: 'Preset eliminado de la lista.', type: 'success' });
  };

  const handleRequestSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeCount = (arcadeConfig.activeGameIds || []).length;
    const activeGameNames = GAMES.filter(g => (arcadeConfig.activeGameIds || []).includes(g.id)).map(g => g.name);

    const changes = [
      {
        icon: '🕹️',
        label: 'Estado del Arcade',
        detail: arcadeConfig.enabled
          ? 'El Arcade estará activo y accesible para todos los clientes en la tienda.'
          : 'El Arcade estará pausado temporalmente para los clientes.',
        badge: arcadeConfig.enabled ? 'Activo en Tienda' : 'Pausado',
        badgeClass: arcadeConfig.enabled
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          : 'bg-rose-100 text-rose-800 border border-rose-300'
      },
      {
        icon: '🎲',
        label: 'Modo de Selección & Rotación',
        detail: arcadeConfig.selectionMode === 'manual'
          ? 'Selección manual fija administrada desde el catálogo.'
          : 'Rotación aleatoria automática de 2 juegos diferentes cada medianoche.',
        badge: arcadeConfig.selectionMode === 'manual' ? 'Manual' : 'Rotación Diaria'
      },
      {
        icon: '🎮',
        label: 'Mini-Juegos Habilitados',
        detail: activeCount === GAMES.length
          ? 'Todos los 10 juegos están activos para jugar.'
          : `${activeCount} de ${GAMES.length} juegos activos (${activeGameNames.join(', ') || 'Ninguno'}).`,
        badge: `${activeCount}/${GAMES.length} Activos`
      },
      {
        icon: '🎨',
        label: 'Temática Visual y Estilo Retro',
        detail: `Gabinete configurado con estilo: ${arcadeConfig.activeTheme || 'clasico'}.`,
        badge: arcadeConfig.activeTheme || 'clasico'
      },
      {
        icon: '🪙',
        label: 'Economía de Monedas & Tiempo',
        detail: `Generación de +1 moneda gratis cada ${arcadeConfig.coinsEarnRateMinutes || 15} min (Tope: ${arcadeConfig.maxCoinsCap || 5} monedas) · Límite por partida: ${arcadeConfig.timeLimitSeconds || 180} segundos.`
      },
      {
        icon: '🎟️',
        label: 'Cupones de Descuento Protegidos',
        detail: `${(arcadeConfig.discountTiers || []).length} niveles de cupones con códigos secretos configurados.`
      }
    ];

    setPendingChanges(changes);
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await performSave();
  };

  const performSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/admin/arcade/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(arcadeConfig)
      });

      if (res.ok) {
        const updated = await res.json();
        setArcadeConfig(prev => ({ ...prev, ...updated }));
        setMessage({ text: '¡Configuración del Arcade del Taller guardada exitosamente!', type: 'success' });
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Error al guardar la configuración', type: 'error' });
      }
    } catch (err) {
      console.error('Error guardando arcade:', err);
      setMessage({ text: 'Error de red al guardar la configuración', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 text-xs">
        Cargando módulo de Arcade del Taller...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs max-w-6xl mx-auto">

      {/* Encabezado y Barra de Acción */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-700 font-bold border border-amber-500/20 text-lg">
              🕹️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-[#1F2421]">
                  Arcade del Taller &amp; Mini-Juegos (Módulo Independiente)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  arcadeConfig.enabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {arcadeConfig.enabled ? '🟢 Activo en Tienda' : 'Pausado'}
                </span>
              </div>
              <p className="text-gray-500 text-xs max-w-2xl leading-relaxed mt-0.5">
                Administra los 10 mini-juegos de taller, rotación aleatoria de 2 juegos diarios, monedas por partida, acumulación automática (1 moneda cada 15 min, tope de 5) y cupones de canje con códigos secretos para ganadores.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {/* Switch Activo / Desactivado */}
          <button
            type="button"
            onClick={() => setArcadeConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              arcadeConfig.enabled
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{arcadeConfig.enabled ? 'Pausar Arcade' : 'Activar Arcade'}</span>
          </button>

          <button
            type="button"
            onClick={handleRequestSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensajes de Estado */}
      {message.text && (
        <div className={`p-4 rounded-2xl font-bold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* BLOQUE 1: REGLAS DE MONEDAS, COSTES & RESTABLECIMIENTO INMEDIATO */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold">
              🪙
            </span>
            <div>
              <h4 className="font-heading font-bold text-sm text-[#1F2421]">
                1. Economía de Monedas, Costes &amp; Restablecimiento Inmediato
              </h4>
              <p className="text-gray-500 text-[11.5px]">
                Configura cuánto cuesta cada partida, tasa de acumulación pasiva y vacía los monederos cuando lo necesites.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-extrabold text-[11px] border border-amber-200 self-start sm:self-auto">
            Regla: 1 moneda / {arcadeConfig.coinsEarnRateMinutes || 15} min (Tope: {arcadeConfig.maxCoinsCap || 5})
          </span>
        </div>

        {/* Banner de Restablecimiento Inmediato de Monedas */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-700" />
                <span>Restablecimiento Inmediato de Monedas (Vaciar Monederos)</span>
              </span>
              {arcadeConfig.lastResetTimestamp > 0 && (
                <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-mono font-medium">
                  Último reset: {new Date(arcadeConfig.lastResetTimestamp).toLocaleString('es-MX')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-900/80 max-w-2xl leading-relaxed">
              Fuerza a que todos los visitantes y clientes en la tienda pierdan sus monedas inmediatamente a 0, sin tener que esperar que venza la hora de sesión.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            disabled={isResettingCoins}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResettingCoins ? 'animate-spin' : ''}`} />
            <span>{isResettingCoins ? 'Restableciendo...' : 'Restablecer Monedas Ahora'}</span>
          </button>
        </div>

        {/* Campos de Costes y Parámetros de Monedas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Costo por Partida:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="5"
                value={arcadeConfig.costPerGame || 1}
                onChange={(e) => setArcadeConfig(prev => ({ ...prev, costPerGame: Math.max(1, Number(e.target.value)) }))}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
              />
              <span className="text-gray-600 font-semibold text-xs">crédito / ficha</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Normalmente 1 ficha de juego por partida.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Canje de Monedas por Ficha:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={arcadeConfig.coinToCreditCost || 2}
                onChange={(e) => setArcadeConfig(prev => ({ ...prev, coinToCreditCost: Math.max(1, Number(e.target.value)) }))}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
              />
              <span className="text-gray-600 font-semibold text-xs">monedas = +1 ficha</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Costo para comprar vidas o fichas extra.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Generar 1 Moneda Gratis:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={arcadeConfig.coinsEarnRateMinutes || 15}
                onChange={(e) => setArcadeConfig(prev => ({ ...prev, coinsEarnRateMinutes: Number(e.target.value) }))}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
              />
              <span className="text-gray-600 font-semibold text-xs">minutos en tienda</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Por defecto: 15 min continuos de navegación.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Tope Máximo por Sesión:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="25"
                value={arcadeConfig.maxCoinsCap || 5}
                onChange={(e) => setArcadeConfig(prev => ({ ...prev, maxCoinsCap: Number(e.target.value) }))}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
              />
              <span className="text-gray-600 font-semibold text-xs">monedas tope</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Tope sugerido: 5 monedas para jugar.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Tiempo por Partida:
            </label>
            <select
              value={arcadeConfig.timeLimitSeconds || 300}
              onChange={(e) => setArcadeConfig(prev => ({ ...prev, timeLimitSeconds: Number(e.target.value) }))}
              className="w-full text-xs font-semibold p-1.5 rounded-xl border border-gray-300 bg-white"
            >
              <option value={60}>⏱️ 1 Min (Blitz)</option>
              <option value={120}>⏱️ 2 Min (Rápida)</option>
              <option value={180}>⏱️ 3 Min (Clásica)</option>
              <option value={300}>⏱️ 5 Min (Estándar 5m)</option>
              <option value={420}>⏱️ 7 Min (Intermedia 7m)</option>
              <option value={600}>⏱️ 10 Min (Extendida 10m)</option>
              <option value={900}>⏱️ 15 Min (Maratón 15m)</option>
            </select>
            <p className="text-[10px] text-gray-400">
              Tiempo para acumular puntos por partida y alcanzar las metas de monedas.
            </p>
          </div>
        </div>
      </div>

      {/* BLOQUE: PRESETS DE TEMPORADA & CONFIGURACIONES GUARDADAS */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-900 font-bold">
              📦
            </span>
            <div>
              <h4 className="font-heading font-bold text-sm text-[#1F2421]">
                Presets de Temporada &amp; Configuraciones Guardadas
              </h4>
              <p className="text-gray-500 text-[11.5px]">
                Guarda y carga combinaciones completas para Navidad, Halloween, San Valentín, Buen Fin o eventos especiales con un solo clic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewPresetModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Guardar Configuración Actual como Preset</span>
          </button>
        </div>

        {/* Tarjetas de Presets Disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(arcadeConfig.seasonPresets || []).map((preset) => {
            const isCurrentActive = arcadeConfig.activeTheme === preset.config?.activeTheme;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 relative flex flex-col justify-between ${
                  isCurrentActive
                    ? 'border-[#2D4F3E] bg-[#F4F0E8]/50 ring-1 ring-[#2D4F3E]/30 shadow-xs'
                    : 'border-gray-200 bg-[#FAF9F5] hover:border-gray-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{preset.icon || '🎮'}</span>
                      <strong className="text-xs text-gray-900 font-bold">{preset.name}</strong>
                    </div>
                    {isCurrentActive && (
                      <span className="text-[10px] bg-[#2D4F3E] text-white font-extrabold px-2 py-0.5 rounded-full">
                        En uso
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-500 leading-snug">
                    {preset.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                      Tema: <strong>{preset.config?.activeTheme || 'clasico'}</strong>
                    </span>
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                      1🪙 / {preset.config?.coinsEarnRateMinutes || 15}m
                    </span>
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                      Tope: {preset.config?.maxCoinsCap || 5}🪙
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 mt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-[#2D4F3E] border border-[#2D4F3E]/40 font-bold text-xs transition-all shadow-2xs hover:border-[#2D4F3E] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Aplicar Preset</span>
                  </button>

                  {preset.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar preset personalizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOQUE: TEMÁTICA DE ÉPOCA & ESTÉTICA DEL ARCADE */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Temática de Época del Arcade</span>
            </h4>
            <p className="text-gray-500 text-[11.5px]">
              Elige el estilo visual del gabinete retro y los efectos de sonido de la máquina.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-900 font-extrabold text-[11px] border border-purple-200">
            Estilo: {arcadeConfig.activeTheme || 'clasico'}
          </span>
        </div>

        {/* Selector de Temáticas: 4 Tech/Retro Preservadas + 12 Épocas del Año */}
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🕹️</span>
              <span>Temáticas Clásicas &amp; Retro Tech (4 Estilos Preservados):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'clasico', name: 'Taller 1980', icon: '🪵', desc: 'Madera cálida y latón artesanal' },
                { id: 'neon', name: 'Synthwave 80s', icon: '🌆', desc: 'Neón magenta y cian retro' },
                { id: 'pixel', name: 'Pixel Arcade', icon: '👾', desc: 'Consola retro 16-bits dorada' },
                { id: 'cyber', name: 'Cyber Taller', icon: '⚡', desc: 'Futurismo tecnológico verde esmeralda' }
              ].map(th => {
                const isSel = (arcadeConfig.activeTheme || 'clasico') === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setArcadeConfig(prev => ({ ...prev, activeTheme: th.id }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 shadow-xs'
                        : 'bg-[#FAF9F5] border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xl mb-1">{th.icon}</div>
                    <div className="font-bold text-xs text-gray-800">{th.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{th.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📅</span>
              <span>12 Temáticas por las Épocas del Año (Enero a Diciembre):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[
                { id: 'enero', name: 'Año Nuevo & Oro Blanco', month: 'Enero', icon: '❄️', desc: 'Escarcha invernal y oro nórdico' },
                { id: 'febrero', name: 'San Valentín & Amor', month: 'Febrero', icon: '💖', desc: 'Rosa fucsia y corazones de acrílico' },
                { id: 'marzo', name: 'Primavera Botánica', month: 'Marzo', icon: '🌸', desc: 'Brotes verdes y flores artesanales' },
                { id: 'abril', name: 'Pascua & Pastel', month: 'Abril', icon: '🐣', desc: 'Colores pastel y espíritu infantil' },
                { id: 'mayo', name: 'Día de las Madres', month: 'Mayo', icon: '💐', desc: 'Oro rosado y jardín cálido' },
                { id: 'junio', name: 'Día del Padre & Roble', month: 'Junio', icon: '👔', desc: 'Nogal, cuero café e ingeniería' },
                { id: 'julio', name: 'Verano & Neón Tropical', month: 'Julio', icon: '☀️', desc: 'Turquesa caribeño y sol de taller' },
                { id: 'agosto', name: 'Regreso a Clases', month: 'Agosto', icon: '🎒', desc: 'Azul libreta, reglas y etiquetas' },
                { id: 'septiembre', name: 'Fiestas Patrias', month: 'Septiembre', icon: '🇲🇽', desc: 'Tricolor mexicano verde y rojo' },
                { id: 'octubre', name: 'Otoño & Brujas', month: 'Octubre', icon: '🎃', desc: 'Calabaza vibrante y hojas secas' },
                { id: 'noviembre', name: 'Día de Muertos', month: 'Noviembre', icon: '💀', desc: 'Cempasúchil y papel picado' },
                { id: 'diciembre', name: 'Navidad de Taller', month: 'Diciembre', icon: '🎄', desc: 'Pino nevado y bastón de caramelo' }
              ].map(th => {
                const isSel = (arcadeConfig.activeTheme || 'clasico') === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setArcadeConfig(prev => ({ ...prev, activeTheme: th.id }))}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 shadow-xs'
                        : 'bg-[#FAF9F5] border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-lg">{th.icon}</span>
                      <span className="text-[9px] uppercase font-mono font-bold text-gray-400 bg-white/80 px-1.5 py-0.2 rounded-md">
                        {th.month}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-gray-800 truncate">{th.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{th.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: MODO DE SELECCIÓN DE JUEGOS EN TIENDA */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>2. Modo de Rotación de Mini-Juegos en Tienda</span>
            </h4>
            <p className="text-gray-500 text-[11.5px]">
              Elige si el sistema rota automáticamente 2 juegos distintos cada día o si prefieres activarlos manualmente.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
            {arcadeConfig.selectionMode === 'manual' ? 'Modo Manual' : 'Rotación Diaria (2 juegos)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => setArcadeConfig(prev => ({ ...prev, selectionMode: 'daily_random' }))}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              arcadeConfig.selectionMode !== 'manual'
                ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-300/40 shadow-xs'
                : 'bg-[#FAF9F5] border-gray-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#1F2421]">
              <span className="text-xl">🎲</span>
              <span>Rotación Aleatoria Automática (2 juegos por día)</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              El sistema selecciona 2 juegos diferentes de los 10 disponibles cada medianoche. Mantiene la tienda dinámica y despierta la curiosidad de los clientes en cada visita.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setArcadeConfig(prev => ({ ...prev, selectionMode: 'manual' }))}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              arcadeConfig.selectionMode === 'manual'
                ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-300/40 shadow-xs'
                : 'bg-[#FAF9F5] border-gray-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-[#1F2421]">
              <span className="text-xl">⚙️</span>
              <span>Selección Manual Fija</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              Tú decides exactamente cuáles de los 10 juegos permanecen activos en la tienda marcando sus casillas en el catálogo a continuación.
            </p>
          </button>
        </div>
      </div>

      {/* BLOQUE 3: CATÁLOGO DE LOS 10 MINI-JUEGOS */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span>3. Catálogo de los 10 Mini-Juegos del Taller &amp; Monedas Requeridas</span>
            </h4>
            <p className="text-gray-500 text-[11.5px]">
              Cada juego muestra su icono, género y costo de entrada por partida. Todos están optimizados para operar sin bugs.
            </p>
          </div>
          <span className="text-[11px] font-bold text-stone-600">
            Total disponibles: 10 juegos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {GAMES.map(game => {
            const isSelected = (arcadeConfig.activeGameIds || []).includes(game.id);
            return (
              <div
                key={game.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-white border-[#2D4F3E] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                    : 'bg-[#FAF9F5] border-gray-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{game.icon}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                      🪙 {game.coinsCost || 1} {game.coinsCost === 1 ? 'moneda' : 'monedas'}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-gray-900 mt-2">
                    {game.name}
                  </div>
                  <div className="text-[10.5px] text-gray-500 line-clamp-2 mt-0.5">
                    {game.description}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setArcadeConfig(prev => {
                        const current = prev.activeGameIds || [];
                        const updated = isSelected
                          ? current.filter(id => id !== game.id)
                          : [...current, game.id];
                        return {
                          ...prev,
                          selectionMode: 'manual',
                          activeGameIds: updated
                        };
                      });
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                    title={isSelected ? 'Hacer clic para desactivar este juego' : 'Hacer clic para activar este juego'}
                  >
                    <span>{isSelected ? '🟢 Activo en Tienda' : '🚫 Desactivado'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 4: CUPONES DE CANJE & CÓDIGOS SECRETOS PARA GANADORES */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>4. Cupones de Canje con Monedas &amp; Protección de Códigos Secretos</span>
            </h4>
            <p className="text-gray-500 text-[11.5px]">
              Los códigos de cupón permanecen <strong>ocultos</strong> para los clientes y solo se revelan mediante animación triunfal cuando alcanzan la meta de monedas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setArcadeConfig(prev => ({
                ...prev,
                discountTiers: [
                  { id: 'tier-5', coinsRequired: 50, code: 'TALLER5', label: '5% de Descuento', description: 'Válido en cualquier compra o paquete (Mínimo $100 MXN)', discountPercent: 5, discountAmount: 0, minPurchase: 100 },
                  { id: 'tier-10', coinsRequired: 100, code: 'TALLER10', label: '10% de Descuento', description: 'Válido en productos o paquetes coordinados (Mínimo $250 MXN)', discountPercent: 10, discountAmount: 0, minPurchase: 250 },
                  { id: 'tier-15', coinsRequired: 250, code: 'TALLER15', label: '15% de Descuento', description: 'Descuento del 15% en tu pedido (Mínimo $350 MXN)', discountPercent: 15, discountAmount: 0, minPurchase: 350 },
                  { id: 'tier-20', coinsRequired: 580, code: 'TALLER20', label: '20% de Descuento VIP', description: 'Descuento VIP máximo del taller (Mínimo $500 MXN)', discountPercent: 20, discountAmount: 0, minPurchase: 500 }
                ]
              }));
            }}
            className="text-[11px] text-[#2D4F3E] hover:underline font-bold cursor-pointer self-start sm:self-auto"
          >
            Restablecer cupones sugeridos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(arcadeConfig.discountTiers || []).map((tier, idx) => (
            <div key={tier.id || idx} className="p-4 rounded-2xl bg-[#FAF9F5] border border-gray-200 space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-gray-800 border-b border-gray-200/60 pb-2">
                <span>Nivel {idx + 1}</span>
                <span className="text-[10px] text-amber-700 font-mono px-2 py-0.5 rounded-full bg-amber-100">
                  🪙 {tier.coinsRequired} monedas
                </span>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-1 font-bold">Monedas Requeridas:</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  value={tier.coinsRequired}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setArcadeConfig(prev => {
                      const copy = [...(prev.discountTiers || [])];
                      copy[idx] = { ...copy[idx], coinsRequired: val };
                      return { ...prev, discountTiers: copy };
                    });
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-1 font-bold">Código de Cupón (Secreto):</label>
                <input
                  type="text"
                  value={tier.code}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setArcadeConfig(prev => {
                      const copy = [...(prev.discountTiers || [])];
                      copy[idx] = { ...copy[idx], code: val };
                      return { ...prev, discountTiers: copy };
                    });
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs uppercase font-bold text-[#2D4F3E]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-1 font-bold">Descuento Otorgado:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tier.discountPercent || tier.discountAmount || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setArcadeConfig(prev => {
                        const copy = [...(prev.discountTiers || [])];
                        if (copy[idx].discountAmount > 0) {
                          copy[idx] = { ...copy[idx], discountAmount: val };
                        } else {
                          copy[idx] = { ...copy[idx], discountPercent: val };
                        }
                        return { ...prev, discountTiers: copy };
                      });
                    }}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
                  />
                  <select
                    value={tier.discountAmount > 0 ? 'fixed' : 'percent'}
                    onChange={(e) => {
                      const isFixed = e.target.value === 'fixed';
                      setArcadeConfig(prev => {
                        const copy = [...(prev.discountTiers || [])];
                        const curVal = copy[idx].discountPercent || copy[idx].discountAmount || 10;
                        copy[idx] = {
                          ...copy[idx],
                          discountPercent: isFixed ? 0 : curVal,
                          discountAmount: isFixed ? curVal : 0,
                          label: isFixed ? `$${curVal} MXN de Descuento` : `${curVal}% de Descuento`
                        };
                        return { ...prev, discountTiers: copy };
                      });
                    }}
                    className="flex-1 px-2 py-1.5 rounded-xl border border-gray-300 bg-white text-[11px] font-semibold"
                  >
                    <option value="percent">% Porcentaje</option>
                    <option value="fixed">$ MXN Fijo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block mb-1 font-bold">Compra Mínima Requerida (MXN):</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={tier.minPurchase ?? (tier.discountAmount ? 200 : 0)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setArcadeConfig(prev => {
                        const copy = [...(prev.discountTiers || [])];
                        copy[idx] = { ...copy[idx], minPurchase: val };
                        return { ...prev, discountTiers: copy };
                      });
                    }}
                    placeholder="Ej: 200"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white font-mono text-xs font-bold"
                  />
                  <span className="text-gray-500 text-[10px]">MXN</span>
                </div>
                <p className="text-[9.5px] text-emerald-800 font-medium mt-0.5">
                  Protege ganancias: evita pedidos en $0 MXN.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Confirmar Restablecimiento Inmediato de Monedas */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E8E4DA] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-amber-100 text-amber-900 text-2xl font-bold">
                ⚠️
              </span>
              <div>
                <h4 className="font-heading font-black text-base text-[#1F2421]">
                  ¿Restablecer Monedas de Clientes Ahora?
                </h4>
                <p className="text-xs text-gray-500">
                  Acción administrativa inmediata
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Todos los clientes y visitantes en la tienda que tengan monedas acumuladas en su monedero pasarán <strong>inmediatamente a 0 monedas</strong>, sin esperar el vencimiento normal de 1 hora de sesión.
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
              ✓ Útil al iniciar nuevas temporadas, cambiar promociones o evitar acumulación excesiva de monedas gratuitas.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                disabled={isResettingCoins}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetCoins}
                disabled={isResettingCoins}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isResettingCoins ? 'animate-spin' : ''}`} />
                <span>{isResettingCoins ? 'Restableciendo...' : 'Sí, Vaciar Monederos'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Guardar Configuración Actual como Nuevo Preset de Temporada */}
      {showNewPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E8E4DA] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-purple-100 text-purple-900 text-2xl font-bold">
                💾
              </span>
              <div>
                <h4 className="font-heading font-black text-base text-[#1F2421]">
                  Guardar como Nuevo Preset de Temporada
                </h4>
                <p className="text-xs text-gray-500">
                  Guarda la configuración actual para reutilizarla cuando vuelva esta temporada.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre del Preset / Temporada:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Navidad & Reyes Magos 2026, Quincena Gamer, etc."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ícono / Emoji:
                  </label>
                  <input
                    type="text"
                    value={newPresetIcon}
                    onChange={(e) => setNewPresetIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-center"
                    placeholder="🎄, 🎃, 💘, ⚡, 🌸"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Época / Tipo:
                  </label>
                  <select
                    value={newPresetSeason}
                    onChange={(e) => setNewPresetSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold"
                  >
                    <option value="navidad">🎄 Navidad & Fin de Año</option>
                    <option value="halloween">🎃 Halloween / Catrinas</option>
                    <option value="sanvalentin">💘 San Valentín / Amor</option>
                    <option value="buenfin">⚡ Buen Fin / Flash</option>
                    <option value="verano">☀️ Verano</option>
                    <option value="primavera">🌸 Primavera</option>
                    <option value="personalizado">🎮 Especial Personalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Descripción breve:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Monedas aceleradas cada 10 min, temática navideña con nieve y cupones de regalo para fin de año."
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900 text-[11px] font-medium leading-relaxed">
                Este preset capturará: Tema <strong>{arcadeConfig.activeTheme}</strong>, {arcadeConfig.activeGameIds?.length || 2} juegos activos, tasa de 1🪙/{arcadeConfig.coinsEarnRateMinutes || 15}m, tope de {arcadeConfig.maxCoinsCap || 5}🪙 y los {arcadeConfig.discountTiers?.length || 4} cupones actuales.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPresetModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Guardar Preset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación y Desglose de Cambios */}
      <AdminConfirmSaveModal
        isOpen={showConfirmModal}
        title="Confirmar Cambios en Arcade del Taller"
        subtitle="Revisa el desglose detallado de modificaciones antes de aplicarlas en la tienda."
        changes={pendingChanges}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Confirmar y Guardar"
        cancelText="Cancelar / Seguir Editando"
        isSaving={saving}
        badge="Arcade Taller"
      />

    </div>
  );
}
