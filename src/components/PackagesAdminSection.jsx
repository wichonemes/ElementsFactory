import React, { useState, useMemo, useEffect } from 'react';
import {
  Package, Boxes, Plus, Edit, Star, Search, Filter,
  Layers, Check, DollarSign, Sparkles, Tag, ArrowRight,
  RefreshCw, Crown, AlertTriangle, ExternalLink
} from 'lucide-react';
import { getBundleTiers } from './PackagesAndServicesView';

export default function PackagesAdminSection({
  token,
  products = [],
  onEditProduct = null,
  onOpenCreateProduct = null,
  onRefreshCatalog = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('all'); // 'all' | 'hogar' | 'negocios' | 'eventos'
  const [campaignConfig, setCampaignConfig] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingStar, setSavingStar] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Cargar configuración de campaña para saber qué paquete está fijado como estrella
  const loadCampaignConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/campaigns/config');
      if (res.ok) {
        const data = await res.json();
        setCampaignConfig(data || {});
      }
    } catch (e) {
      console.warn('Error cargando config de campañas:', e);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadCampaignConfig();
  }, []);

  // Filtrar productos que son paquetes
  const allBundles = useMemo(() => {
    return products.filter(p => p.isBundle);
  }, [products]);

  // Filtrar según búsqueda y área
  const filteredBundles = useMemo(() => {
    return allBundles.filter(p => {
      if (areaFilter !== 'all' && !p.worlds?.includes(areaFilter)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCode = p.code?.toLowerCase().includes(q);
        const matchesDesc = p.shortDescription?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [allBundles, areaFilter, searchQuery]);

  // Fijar o alternar Paquete Estrella del Mes
  const handleToggleStarred = async (bundleId) => {
    setSavingStar(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const isAlreadyStarred = campaignConfig.highlightedBundleId === bundleId;
      const newHighlightedId = isAlreadyStarred ? '' : bundleId;

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/campaigns/config', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          highlightedBundleId: newHighlightedId
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setCampaignConfig(prev => ({ ...prev, highlightedBundleId: newHighlightedId }));
        setStatusMsg({
          type: 'success',
          text: isAlreadyStarred
            ? 'Paquete estrella removido de la cabecera.'
            : '¡Paquete estrella del mes fijado exitosamente!'
        });
      } else {
        throw new Error('Error al guardar en servidor');
      }
    } catch (err) {
      console.error('Error fijando paquete estrella:', err);
      setStatusMsg({ type: 'error', text: 'No se pudo actualizar el paquete estrella.' });
    } finally {
      setSavingStar(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2D4F3E]">
            <Package className="w-4 h-4 text-[#D4A359]" />
            <span>Catálogo Especializado</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-[#1F2421]">
            Paquetes & Combos de Taller ({allBundles.length})
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl">
            Administra los kits coordinados, define el Paquete Estrella del Mes y ajusta los 3 niveles de personalización (Esencial, Pro, VIP) con precios y componentes de taller.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenCreateProduct && (
            <button
              type="button"
              onClick={() => onOpenCreateProduct({ isBundle: true, worlds: ['paquetes'] })}
              className="px-4 py-2.5 rounded-2xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear Nuevo Paquete</span>
            </button>
          )}

          {onRefreshCatalog && (
            <button
              type="button"
              onClick={onRefreshCatalog}
              className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer shadow-2xs"
              title="Refrescar catálogo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notificación de estado */}
      {statusMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-in fade-in ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Barra de Filtros por Área y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
        
        {/* Selector de Área */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos los Paquetes', count: allBundles.length },
            { id: 'hogar', label: '🏡 Hogar', count: allBundles.filter(b => b.worlds?.includes('hogar')).length },
            { id: 'negocios', label: '💼 Negocios', count: allBundles.filter(b => b.worlds?.includes('negocios')).length },
            { id: 'eventos', label: '🎉 Eventos', count: allBundles.filter(b => b.worlds?.includes('eventos')).length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAreaFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                areaFilter === tab.id
                  ? 'bg-[#17251E] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                areaFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador de Paquetes */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por SKU o nombre..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
          />
        </div>
      </div>

      {/* Grid de Paquetes */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E8E4DA] space-y-3">
          <Boxes className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-800">
            No se encontraron paquetes con los filtros aplicados
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Intenta cambiar los términos de búsqueda o crear un nuevo paquete para tu catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBundles.map(p => {
            const isHighlighted = campaignConfig.highlightedBundleId === p.id || campaignConfig.highlightedBundleId === p.code;
            const savings = p.savings || (p.regularPrice ? p.regularPrice - p.price : 100);
            const regularPrice = p.regularPrice || Math.round(p.price * 1.25);
            const discountPercent = p.discountPercent || Math.round((savings / regularPrice) * 100);
            const tiers = getBundleTiers(p);

            return (
              <div
                key={p.id}
                className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md relative bg-white ${
                  isHighlighted
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                    : 'border-[#E8E4DA] hover:border-gray-400'
                }`}
              >
                {/* Cinta de Estrella del Mes */}
                {isHighlighted && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                      <span>👑 Paquete Estrella del Mes</span>
                    </div>
                    <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.2 rounded-full font-bold">
                      Activo
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-3.5">
                  
                  {/* Encabezado: Foto, SKU y Nombre */}
                  <div className="flex items-start gap-3">
                    <img
                      src={p.primaryImage || p.gallery?.[0] || p.whiteBgImage}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          {p.code}
                        </span>
                        {p.worlds?.map(w => (
                          <span
                            key={w}
                            className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 text-[9.5px] font-bold border border-emerald-200 capitalize"
                          >
                            {w}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-[#1F2421] truncate mt-1" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {p.shortDescription || 'Sin descripción corta.'}
                      </p>
                    </div>
                  </div>

                  {/* Precios y Ahorro */}
                  <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 line-through mr-1.5 font-mono">${regularPrice}</span>
                      <span className="font-black text-sm sm:text-base text-[#2D4F3E] font-mono">
                        ${p.price} <span className="text-[10px] font-normal text-gray-500">MXN</span>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                      Ahorro ${savings} (-{discountPercent}%)
                    </span>
                  </div>

                  {/* Componentes incluidos */}
                  {p.includedItems && p.includedItems.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-[10.5px] text-gray-700 uppercase tracking-wider">
                        Incluye en el combo:
                      </div>
                      <ul className="space-y-0.5 text-gray-600 text-[11px]">
                        {p.includedItems.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex items-start gap-1 truncate">
                            <span className="text-[#2D4F3E] font-black leading-none">•</span>
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                      {p.includedItems.length > 3 && (
                        <div className="text-[10px] text-gray-400 font-semibold pl-2">
                          +{p.includedItems.length - 3} piezas adicionales...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Niveles Disponibles */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="font-bold">Opciones de nivel:</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-gray-700">
                      <span>🥉 ${tiers[0]?.price || p.price}</span>
                      <span>•</span>
                      <span className="text-[#2D4F3E]">🥈 ${tiers[1]?.price || p.price}</span>
                      <span>•</span>
                      <span className="text-amber-800">🥇 ${tiers[2]?.price || Math.round(p.price * 1.35)}</span>
                    </div>
                  </div>

                </div>

                {/* Barra de Acciones */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStarred(p.id)}
                    disabled={savingStar}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                      isHighlighted
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isHighlighted ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                    <span>{isHighlighted ? 'Es el Especial' : 'Fijar Estrella'}</span>
                  </button>

                  {onEditProduct && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(p);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
