import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag, Plus, Edit, Trash2, Copy, Check, RefreshCw, Calendar, Clock,
  Filter, Search, AlertCircle, CheckCircle2, DollarSign, Percent,
  Sparkles, Gamepad2, ShoppingBag, Eye, Power, AlertTriangle, ArrowRight,
  TrendingUp, Users, ChevronDown, ChevronUp, Layers, HelpCircle
} from 'lucide-react';
import { generateUniqueCouponCode } from '../utils/couponsHelper';

export default function CouponsAdminSection({ token }) {
  // Datos y Estados Principales
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activeCount: 0,
    arcadeCount: 0,
    storeCount: 0,
    totalUses: 0,
    totalDiscountGiven: 0
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  const [copiedCode, setCopiedCode] = useState('');

  // Filtros
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'arcade' | 'store'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'expiring_soon' | 'expired' | 'paused'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de Crear / Editar Cupón
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'store', // 'store' | 'arcade'
    type: 'percent',   // 'percent' | 'fixed'
    value: 10,
    minPurchase: 0,
    maxUses: '',       // '' = ilimitado, o número
    expiresAt: '',     // YYYY-MM-DD
    active: true,
    coinsRequired: 30,
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Auto-limpieza de mensajes
  useEffect(() => {
    if (actionMessage.text) {
      const timer = setTimeout(() => setActionMessage({ text: '', type: '' }), 4500);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Cargar cupones desde la API
  const loadCoupons = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/admin/coupons', { headers });
      if (!res.ok) throw new Error('Error al consultar cupones');
      const data = await res.json();
      setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Error al cargar cupones:', err);
      setActionMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [token]);

  // Manejador para copiar código
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Abrir modal para crear nuevo cupón
  const handleOpenCreateModal = (category = 'store') => {
    setEditingCoupon(null);
    setFormError('');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const dateStr = defaultDate.toISOString().split('T')[0];

    const initialCode = category === 'arcade'
      ? generateUniqueCouponCode('ARCADE')
      : generateUniqueCouponCode('TIENDA');

    setForm({
      code: initialCode,
      name: category === 'arcade' ? 'Cupón de Juego Arcade' : 'Descuento Especial de Tienda',
      category: category,
      type: 'percent',
      value: 10,
      minPurchase: 0,
      maxUses: '',
      expiresAt: dateStr,
      active: true,
      coinsRequired: 50,
      description: category === 'arcade'
        ? 'Canjeado con monedas ganadas jugando en el Arcade del taller'
        : 'Código especial de promoción y fidelidad para compras online'
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar cupón existente
  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormError('');
    let dateStr = '';
    if (coupon.expiresAt) {
      try {
        dateStr = new Date(coupon.expiresAt).toISOString().split('T')[0];
      } catch {}
    }

    setForm({
      code: coupon.code || '',
      name: coupon.name || '',
      category: coupon.category || 'store',
      type: coupon.type || 'percent',
      value: coupon.value || 10,
      minPurchase: coupon.minPurchase || 0,
      maxUses: (coupon.maxUses !== null && coupon.maxUses !== undefined) ? String(coupon.maxUses) : '',
      expiresAt: dateStr,
      active: coupon.active !== false,
      coinsRequired: coupon.coinsRequired || 50,
      description: coupon.description || ''
    });
    setIsModalOpen(true);
  };

  // Generar código aleatorio en el formulario
  const handleGenerateRandomCode = () => {
    const prefix = form.category === 'arcade' ? 'ARCADE' : (form.type === 'percent' ? `DESC${form.value || 10}` : 'PROMO');
    const newCode = generateUniqueCouponCode(prefix);
    setForm(prev => ({ ...prev, code: newCode }));
  };

  // Accesos rápidos de fecha de expiración
  const setExpiryDays = (days) => {
    if (days === null) {
      setForm(prev => ({ ...prev, expiresAt: '' }));
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    setForm(prev => ({ ...prev, expiresAt: d.toISOString().split('T')[0] }));
  };

  const setExpiryEndOfMonth = () => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    setForm(prev => ({ ...prev, expiresAt: lastDay.toISOString().split('T')[0] }));
  };

  // Guardar cupón (Crear o Editar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.code.trim()) {
      setFormError('El código del cupón es obligatorio');
      return;
    }

    if (!form.value || Number(form.value) <= 0) {
      setFormError('Ingresa un valor de descuento mayor a 0');
      return;
    }

    setSaving(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim() || `Cupón ${form.code.trim().toUpperCase()}`,
        category: form.category,
        type: form.type,
        value: Number(form.value),
        minPurchase: Number(form.minPurchase) || 0,
        maxUses: form.maxUses !== '' ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59.000Z` : null,
        active: Boolean(form.active),
        coinsRequired: form.category === 'arcade' ? Number(form.coinsRequired || 50) : null,
        description: form.description.trim()
      };

      let res;
      if (editingCoupon) {
        res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el cupón');

      setActionMessage({
        text: editingCoupon ? `Cupón ${payload.code} actualizado correctamente` : `¡Cupón ${payload.code} creado con éxito!`,
        type: 'success'
      });
      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle rápido de Activar / Pausar
  const handleToggleActive = async (coupon) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ active: !coupon.active })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      setActionMessage({
        text: coupon.active ? `Cupón ${coupon.code} pausado` : `Cupón ${coupon.code} activado`,
        type: 'success'
      });
      loadCoupons();
    } catch (err) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  // Eliminar cupón
  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`¿Estás seguro de eliminar el cupón "${coupon.code}"? Esta acción no se puede deshacer.`)) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Error al eliminar cupón');
      setActionMessage({ text: `Cupón ${coupon.code} eliminado correctamente`, type: 'success' });
      loadCoupons();
    } catch (err) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  // Lista filtrada para la vista
  const filteredCoupons = useMemo(() => {
    const now = Date.now();
    return coupons.filter(c => {
      // Filtro de categoría
      if (filterCategory !== 'all' && c.category !== filterCategory) return false;

      // Filtro de estatus
      if (filterStatus === 'active') {
        if (c.active === false) return false;
        if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return false;
        if (c.maxUses && c.usedCount >= c.maxUses) return false;
      } else if (filterStatus === 'expiring_soon') {
        if (!c.expiresAt) return false;
        const diffDays = (new Date(c.expiresAt).getTime() - now) / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 7) return false;
      } else if (filterStatus === 'expired') {
        const isExp = c.expiresAt && new Date(c.expiresAt).getTime() < now;
        const isExh = c.maxUses && c.usedCount >= c.maxUses;
        if (!isExp && !isExh) return false;
      } else if (filterStatus === 'paused') {
        if (c.active !== false) return false;
      }

      // Buscador
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [coupons, filterCategory, filterStatus, searchQuery]);

  // Auxiliar para calcular estado visual de vigencia
  const getCouponStatusBadge = (coupon) => {
    if (coupon.active === false) {
      return { text: 'Pausado', color: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-400' };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { text: 'Agotado (Límite alcanzado)', color: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' };
    }
    if (coupon.expiresAt) {
      const now = Date.now();
      const expTime = new Date(coupon.expiresAt).getTime();
      const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        return { text: 'Caducado', color: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' };
      }
      if (diffDays <= 7) {
        return { text: `Vence en ${diffDays} día(s)`, color: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500 animate-pulse' };
      }
      return { text: `Vigente (${diffDays} días)`, color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
    }
    return { text: 'Permanente (Sin caducidad)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage.text && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all animate-in fade-in ${
          actionMessage.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#2D4F3E] text-white'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage({ text: '', type: '' })}
            className="text-white/80 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Métricas Principales */}
      <div className="bg-white rounded-3xl border border-[#E8E4DA] p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                🎟️
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1F2421] font-heading leading-tight">
                  Gestión y Monitoreo de Cupones
                </h3>
                <p className="text-xs text-gray-500">
                  Control de cupones de Arcade (juego) y códigos de tienda con fechas de vigencia y seguimiento de pedidos
                </p>
              </div>
            </div>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenCreateModal('arcade')}
              className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>+ Cupón Arcade</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal('store')}
              className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white hover:bg-[#20392C] transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Código de Tienda</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Ejecutivas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎟️</span>
              <span>Total Cupones</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              {stats.total || coupons.length}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
              {stats.activeCount || coupons.filter(c => c.active !== false).length} activos
            </div>
          </div>

          <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/70">
            <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎮</span>
              <span>Monedas Arcade</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-950 mt-1">
              {stats.arcadeCount || coupons.filter(c => c.category === 'arcade').length}
            </div>
            <div className="text-[10px] text-purple-700 font-medium mt-0.5">
              Canjeados con juego
            </div>
          </div>

          <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200/70">
            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏷️</span>
              <span>Códigos de Tienda</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-950 mt-1">
              {stats.storeCount || coupons.filter(c => c.category === 'store').length}
            </div>
            <div className="text-[10px] text-blue-700 font-medium mt-0.5">
              Campañas y clientes
            </div>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>📊</span>
              <span>Usos Registrados</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
              {stats.totalUses || coupons.reduce((acc, c) => acc + (Number(c.usedCount) || 0), 0)}
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">
              En pedidos completados
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 col-span-2 lg:col-span-1">
            <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>💰</span>
              <span>Ahorro a Clientes</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
              ${(stats.totalDiscountGiven || 0).toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              Descuentos otorgados
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Selector de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-[#2D4F3E] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({coupons.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('store')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
              filterCategory === 'store'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <span>🏷️ Tienda &amp; Especial</span>
            <span className="text-[10px] opacity-80">({coupons.filter(c => c.category === 'store').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('arcade')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
              filterCategory === 'arcade'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <span>🎮 Monedas Arcade</span>
            <span className="text-[10px] opacity-80">({coupons.filter(c => c.category === 'arcade').length})</span>
          </button>
        </div>

        {/* Filtro de Vigencia y Buscador */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E] shrink-0"
          >
            <option value="all">Cualquier estado</option>
            <option value="active">🟢 Vigentes / Activos</option>
            <option value="expiring_soon">🟡 Por vencer (&lt; 7 días)</option>
            <option value="expired">🔴 Caducados o Agotados</option>
            <option value="paused">⏸️ Pausados</option>
          </select>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cupón..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-[#2D4F3E]"
            />
          </div>

          <button
            onClick={loadCoupons}
            className="p-1.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
            title="Recargar cupones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2D4F3E]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lista de Cupones */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E4DA] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center text-xl">
            🎟️
          </div>
          <h4 className="text-sm font-bold text-gray-800 font-heading">
            No se encontraron cupones con estos filtros
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Puedes cambiar tus criterios de búsqueda o crear un nuevo cupón personalizado o de juego.
          </p>
          <button
            onClick={() => handleOpenCreateModal('store')}
            className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Primer Cupón</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map(coupon => {
            const isArcade = coupon.category === 'arcade';
            const badge = getCouponStatusBadge(coupon);
            const discountLabel = coupon.type === 'percent'
              ? `${coupon.value}% OFF`
              : `$${coupon.value} MXN`;

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between gap-3 relative overflow-hidden group hover:shadow-md ${
                  coupon.active === false
                    ? 'border-gray-200 opacity-75'
                    : (isArcade ? 'border-purple-200/80 hover:border-purple-300' : 'border-[#E8E4DA] hover:border-[#2D4F3E]/40')
                }`}
              >
                {/* Header de la tarjeta */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isArcade ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        <span>{isArcade ? '🎮 Monedas Arcade' : '🏷️ Tienda / Especial'}</span>
                      </span>

                      {coupon.coinsRequired && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          🪙 {coupon.coinsRequired} monedas
                        </span>
                      )}
                    </div>

                    {/* Switch Rápido Activo / Pausado */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors cursor-pointer ${
                        coupon.active !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      }`}
                      title={coupon.active !== false ? 'Clic para pausar cupón' : 'Clic para activar cupón'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${coupon.active !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span>{coupon.active !== false ? 'Activo' : 'Pausado'}</span>
                    </button>
                  </div>

                  {/* Código y Botón Copiar */}
                  <div className="mt-3 flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-mono font-black text-sm text-gray-900 tracking-wider truncate select-all">
                        {coupon.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        copiedCode === coupon.code
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs'
                      }`}
                      title="Copiar código al portapapeles"
                    >
                      {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === coupon.code ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Beneficio y Descripción */}
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900 truncate" title={coupon.name}>
                        {coupon.name}
                      </span>
                      <span className="text-base font-black text-[#2D4F3E] shrink-0 font-heading">
                        {discountLabel}
                      </span>
                    </div>

                    {coupon.description && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Parámetros de Monitoreo: Usos, Compra Mínima y Caducidad */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {/* Fila: Compra Mínima & Usos */}
                  <div className="flex items-center justify-between text-[11px] text-gray-600">
                    <div>
                      <span className="text-gray-400">Mínimo: </span>
                      <strong className="text-gray-800">
                        {coupon.minPurchase > 0 ? `$${coupon.minPurchase} MXN` : 'Sin mínimo'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-gray-400">Usos: </span>
                      <strong className="text-[#2D4F3E]">
                        {coupon.usedCount || 0}
                      </strong>
                      <span className="text-gray-400">
                        {coupon.maxUses ? ` / ${coupon.maxUses}` : ' (Ilimitado)'}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso de usos si tiene maxUses */}
                  {coupon.maxUses && (
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2D4F3E] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.maxUses) * 100))}%` }}
                      />
                    </div>
                  )}

                  {/* Badge de Vigencia & Caducidad */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${badge.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                      <span>{badge.text}</span>
                    </div>

                    {coupon.expiresAt && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(coupon.expiresAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Botones de Editar y Eliminar */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(coupon)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-600 hover:text-[#2D4F3E] hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon)}
                      className="px-2 py-1 rounded-lg text-xs font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar cupón"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREAR / GENERAR O EDITAR CUPÓN                     */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#E8E4DA] my-8 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base">
                  🎟️
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900 font-heading leading-tight">
                    {editingCoupon ? `Editar Cupón: ${editingCoupon.code}` : 'Crear Nuevo Cupón o Código'}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {editingCoupon ? 'Actualiza vigencia, usos o condiciones' : 'Genera cupones únicos o códigos de campaña'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Error en el formulario */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* 1. Selector de Tipo de Cupón (Arcade vs Tienda) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tipo / Origen del Cupón:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: 'store' }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.category === 'store'
                        ? 'border-[#2D4F3E] bg-emerald-50/60 ring-2 ring-[#2D4F3E]/20 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <span>🏷️</span>
                      <span>Código de Tienda</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Promocional, campaña o código único para cliente
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: 'arcade' }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      form.category === 'arcade'
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-purple-950">
                      <span>🎮</span>
                      <span>Monedas Arcade</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Canjeado por jugar y ganar monedas en el taller
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Código del Cupón con Generador Único */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    Código del Cupón (Mayúsculas):
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] text-[#2D4F3E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>🎲 Generar Código Único</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                    placeholder="Ej. BUENFIN2026 o ART-9X4K"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-sm text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
                <span className="text-[10px] text-gray-400">
                  Sin espacios. Puedes escribir tu código personalizado o usar el botón de generar código único.
                </span>
              </div>

              {/* 3. Nombre / Etiqueta del Cupón */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre descriptivo:
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. 15% de Descuento Cliente VIP"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                />
              </div>

              {/* 4. Tipo de Descuento y Valor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tipo de Descuento:
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  >
                    <option value="percent">Porcentaje (% OFF)</option>
                    <option value="fixed">Monto Fijo ($ MXN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Valor: {form.type === 'percent' ? '(%)' : '($ MXN)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={form.type === 'percent' ? 70 : 5000}
                    value={form.value}
                    onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
              </div>

              {/* 5. Si es de Arcade: Monedas requeridas */}
              {form.category === 'arcade' && (
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200">
                  <label className="block text-xs font-bold text-purple-950 mb-1">
                    🪙 Monedas requeridas en el Arcade para canjear:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={form.coinsRequired}
                      onChange={e => setForm(prev => ({ ...prev, coinsRequired: e.target.value }))}
                      className="w-32 px-3 py-1.5 rounded-xl border border-purple-300 text-xs font-bold text-purple-900 bg-white"
                    />
                    <div className="flex items-center gap-1">
                      {[30, 60, 100, 150].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, coinsRequired: amt }))}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white text-purple-800 border border-purple-300 hover:bg-purple-100"
                        >
                          {amt}🪙
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Compra Mínima Requerida & Límite de Usos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Compra mínima ($ MXN):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={form.minPurchase}
                    onChange={e => setForm(prev => ({ ...prev, minPurchase: e.target.value }))}
                    placeholder="0 = Sin mínimo"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                  <div className="flex gap-1 mt-1">
                    {[0, 200, 350, 500].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, minPurchase: val }))}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Límite de usos:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={e => setForm(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="Vacío = Ilimitado"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, maxUses: 1 }))}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      title="1 solo uso para código único"
                    >
                      1 uso (Único)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, maxUses: '' }))}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Ilimitado
                    </button>
                  </div>
                </div>
              </div>

              {/* 7. Fecha de Caducidad / Vigencia */}
              <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>Fecha de Caducidad:</span>
                  </label>
                  {form.expiresAt ? (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Vence: {form.expiresAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold">
                      Sin caducidad (Permanente)
                    </span>
                  )}
                </div>

                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                />

                {/* Accesos rápidos de vigencia */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setExpiryDays(7)}
                    className="text-[10px] px-2 py-0.8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-gray-700 cursor-pointer"
                  >
                    +7 días
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryDays(15)}
                    className="text-[10px] px-2 py-0.8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-gray-700 cursor-pointer"
                  >
                    +15 días
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryDays(30)}
                    className="text-[10px] px-2 py-0.8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-gray-700 cursor-pointer"
                  >
                    +30 días
                  </button>
                  <button
                    type="button"
                    onClick={setExpiryEndOfMonth}
                    className="text-[10px] px-2 py-0.8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-gray-700 cursor-pointer"
                  >
                    Fin de Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpiryDays(null)}
                    className="text-[10px] px-2 py-0.8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-gray-500 cursor-pointer"
                  >
                    Sin fecha
                  </button>
                </div>
              </div>

              {/* 8. Descripción y Notas */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notas o descripción de la campaña:
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej. Cupón para dinámica de historias de Instagram..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                />
              </div>

              {/* 9. Switch Activo */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">
                    Estado del Cupón
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {form.active ? 'El cupón estará activo y listo para ser usado' : 'El cupón estará pausado y no aplicará descuento'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    form.active ? 'bg-[#2D4F3E]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      form.active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
