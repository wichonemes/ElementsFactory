import React, { useState, useMemo } from 'react';
import {
  Search, X, Sparkles, Flame, Boxes, ArrowRight, Tag,
  ShoppingBag, Check, Star, TrendingUp, SlidersHorizontal,
  Home, Briefcase, CalendarHeart, Gift
} from 'lucide-react';
import ProductCard from './ProductCard';

export default function HomeRelevantShowcase({
  products = [],
  flashDeal = null,
  onSelectProduct,
  onAddToCart,
  onOpenCalculator,
  onSelectWorld,
  searchQuery = '',
  onSearchChange
}) {
  const [internalSearch, setInternalSearch] = useState(searchQuery || '');
  const [activeTab, setActiveTab] = useState('relevant'); // 'relevant' | 'flash' | 'stock' | 'hogar' | 'negocios' | 'eventos'

  // Quick popular search suggestions
  const SUGGESTIONS = [
    { label: 'Soportes QR & NFC', query: 'QR' },
    { label: 'Llaveros Personalizados', query: 'llavero' },
    { label: 'Mascotas & Chapitas', query: 'mascota' },
    { label: 'Recuerdos para Boda', query: 'boda' },
    { label: 'Macetas Geométricas', query: 'maceta' },
    { label: 'Tazas Sublimadas', query: 'taza' },
    { label: 'Impresión 3D', query: '3d' },
    { label: 'Corte Láser', query: 'láser' },
    { label: 'Patch Bar & Gorras', query: 'patch' },
    { label: 'Smart Deck', query: 'deck' }
  ];

  const handleApplySuggestion = (query) => {
    setInternalSearch(query);
    if (onSearchChange) onSearchChange(query);
  };

  const handleClearSearch = () => {
    setInternalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  // Filtered products calculation
  const displayedProducts = useMemo(() => {
    const q = (internalSearch || searchQuery || '').toLowerCase().trim();

    // 1. If searching, return matching products across entire catalog
    if (q) {
      return products.filter(p => {
        const name = (p.name || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const desc = (p.shortDescription || '').toLowerCase();
        const fullDesc = (p.fullDescription || '').toLowerCase();
        const mat = (p.specifications?.material || '').toLowerCase();
        const techs = (p.techniques || []).join(' ').toLowerCase();
        return name.includes(q) || code.includes(q) || desc.includes(q) || fullDesc.includes(q) || mat.includes(q) || techs.includes(q);
      });
    }

    // 2. Tab filters for curated home showcase
    const nonBundle = products.filter(p => !p.isBundle);

    if (activeTab === 'flash') {
      const flashIds = flashDeal?.activeFlashProductIds || [];
      const flashItems = nonBundle.filter(p => flashIds.includes(p.id) || p.flashDealConfig?.enabled);
      return flashItems.length > 0 ? flashItems : nonBundle.slice(0, 8);
    }

    if (activeTab === 'stock') {
      const stockItems = nonBundle.filter(p => p.availability === 'in_stock');
      return stockItems.length > 0 ? stockItems : nonBundle.slice(0, 8);
    }

    if (activeTab === 'hogar') {
      return nonBundle.filter(p => p.worlds?.includes('hogar')).slice(0, 8);
    }

    if (activeTab === 'negocios') {
      return nonBundle.filter(p => p.worlds?.includes('negocios')).slice(0, 8);
    }

    if (activeTab === 'eventos') {
      return nonBundle.filter(p => p.worlds?.includes('eventos')).slice(0, 8);
    }

    if (activeTab === 'paquetes') {
      const pkgItems = products.filter(p => p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes'));
      return pkgItems.slice(0, 8);
    }

    // 'relevant' default: balanced selection of flash deals, featured and top items from all 3 areas
    const flashIds = flashDeal?.activeFlashProductIds || [];
    const flashList = nonBundle.filter(p => flashIds.includes(p.id));
    const featuredList = nonBundle.filter(p => p.featured && !flashIds.includes(p.id));
    const inStockList = nonBundle.filter(p => p.availability === 'in_stock' && !flashIds.includes(p.id) && !p.featured);
    const restList = nonBundle.filter(p => !flashIds.includes(p.id) && !p.featured && p.availability !== 'in_stock');

    const combined = [...flashList, ...featuredList, ...inStockList, ...restList];
    // Return top 8 curated relevant products for the home screen
    return combined.slice(0, 8);
  }, [products, internalSearch, searchQuery, activeTab, flashDeal]);

  const isSearching = Boolean((internalSearch || searchQuery || '').trim());

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24 border-t border-[#E8E4DA]/60">
      
      {/* Header with Title & Context */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-[#2D4F3E] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Explorador Rápido de Taller</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-heading">
          {isSearching ? 'Resultados de Búsqueda' : 'Opciones Relevantes de Productos'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          {isSearching
            ? `Mostrando piezas que coinciden con tu búsqueda en el catálogo de Artesano Digital.`
            : `Selección curada con piezas emblemáticas, ofertas flash y productos listos en taller.`}
        </p>
      </div>

      {/* Search Bar with Lupita (Magnifying Glass) */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-[#E8E4DA] hover:border-[#2D4F3E]/60 focus-within:border-[#2D4F3E] focus-within:ring-4 focus-within:ring-[#2D4F3E]/10 transition-all shadow-sm">
          <div className="pl-4 pr-2 text-gray-400">
            <Search className="w-5 h-5 text-[#2D4F3E]" />
          </div>
          <input
            type="text"
            value={internalSearch}
            onChange={handleInputChange}
            placeholder="¿Qué estás buscando? Ej: Soportes QR, llaveros, macetas, bodas..."
            className="w-full py-3 pr-10 text-xs sm:text-sm bg-transparent text-[#1F2421] placeholder-gray-400 focus:outline-none font-medium"
          />
          {internalSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              title="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Chips along with Search */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-emerald-700" /> Sugerencias:
          </span>
          {SUGGESTIONS.map(s => {
            const isSelected = internalSearch.toLowerCase().trim() === s.query.toLowerCase().trim();
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => handleApplySuggestion(s.query)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2D4F3E] text-white shadow-2xs scale-102'
                    : 'bg-[#F4F0E8] text-gray-700 hover:bg-[#EBE5D9] hover:text-[#1F2421]'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Relevancy Filter Tabs (When not actively searching) */}
      {!isSearching && (
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-4 scrollbar-none mb-6">
          <div className="bg-white p-1 rounded-2xl border border-[#E8E4DA] shadow-xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('relevant')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'relevant'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Más Relevantes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flash')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'flash'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Ofertas Flash</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'stock'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>En Existencia Inmediata</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hogar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hogar'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hogar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('negocios')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'negocios'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Negocios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('eventos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'eventos'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <CalendarHeart className="w-3.5 h-3.5" />
              <span>Eventos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paquetes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'paquetes'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Paquetes & Servicios</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Header when Searching */}
      {isSearching && (
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto mb-4 px-2">
          <span className="text-xs font-bold text-gray-600">
            {displayedProducts.length} {displayedProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </span>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Ver sugerencias relevantes</span>
          </button>
        </div>
      )}

      {/* Grid of Relevant Products */}
      {displayedProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#E8E4DA] p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F4F0E8] text-[#2D4F3E] flex items-center justify-center mx-auto">
            <Search className="w-5 h-5 opacity-60" />
          </div>
          <h4 className="text-sm font-bold text-[#1F2421]">No encontramos coincidencias para "{internalSearch}"</h4>
          <p className="text-xs text-gray-500">
            Prueba con términos como "llavero", "soporte", "boda" o selecciona una de las sugerencias arriba.
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-colors cursor-pointer"
          >
            Restablecer opciones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isFlashDeal={flashDeal?.isProductOnFlashDeal ? flashDeal.isProductOnFlashDeal(product.id) : false}
              flashDeal={flashDeal}
              onOpenDetail={onSelectProduct}
              onQuickAdd={onSelectProduct}
              onOpenCalculator={onOpenCalculator}
            />
          ))}
        </div>
      )}

      {/* Bottom Exploration CTAs to Full Catalogs of the 3 Areas */}
      <div className="mt-12 pt-8 border-t border-[#E8E4DA] grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div
          onClick={() => onSelectWorld && onSelectWorld('hogar')}
          className="p-5 rounded-2xl bg-white border border-[#E8E4DA] hover:border-[#2D4F3E] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Área de Hogar
            </span>
            <h4 className="text-sm font-bold text-[#1F2421] group-hover:text-[#2D4F3E] transition-colors">
              Explorar Catálogo de Hogar
            </h4>
            <p className="text-xs text-gray-500">31 piezas y organización</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#2D4F3E] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onSelectWorld && onSelectWorld('negocios')}
          className="p-5 rounded-2xl bg-white border border-[#E8E4DA] hover:border-[#2D4F3E] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Área de Negocios
            </span>
            <h4 className="text-sm font-bold text-[#1F2421] group-hover:text-[#2D4F3E] transition-colors">
              Explorar Catálogo Comercial
            </h4>
            <p className="text-xs text-gray-500">29 soluciones de marca</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#2D4F3E] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onSelectWorld && onSelectWorld('eventos')}
          className="p-5 rounded-2xl bg-white border border-[#E8E4DA] hover:border-[#2D4F3E] hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <CalendarHeart className="w-3.5 h-3.5" /> Eventos Especiales
            </span>
            <h4 className="text-sm font-bold text-[#1F2421] group-hover:text-[#2D4F3E] transition-colors">
              Explorar Recuerdos &amp; Bodas
            </h4>
            <p className="text-xs text-gray-500">34 detalles memorables</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#2D4F3E] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>

    </section>
  );
}
