import React from 'react';
import { 
  Search, 
  X, 
  MessageCircle, 
  ShoppingBag, 
  MapPin, 
  ChevronRight,
  Flame,
  FileText,
  Calculator,
  Gamepad2,
  Gift,
  Sparkles,
  Home,
  Briefcase,
  CalendarHeart
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function MobileMercadoLibreHeader({
  searchQuery = '',
  onSearchChange,
  onClearSearch,
  activeWorld = 'all',
  onSelectWorld,
  onOpenCart,
  cartCount = 0,
  onOpenWhatsApp,
  onOpenCalculator,
  onOpenArcade,
  onOpenFlashDeals,
  settings
}) {
  const areas = [
    { id: 'all', label: 'Todo' },
    { id: 'hogar', label: 'Hogar' },
    { id: 'negocios', label: 'Negocios' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'paquetes-servicios', label: 'Paquetes' },
    { id: 'flash', label: '⚡ Ofertas' }
  ];

  const catalogPdfUrl = settings?.mobileCatalogConfig?.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf';
  const catalogPdfName = settings?.mobileCatalogConfig?.fileName || 'Catalogo_Movil_Artesano_Digital.pdf';
  const isCatalogEnabled = settings?.mobileCatalogConfig?.enabled !== false;

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[#17251E] text-white shadow-md select-none">
      {/* 1. FILA PRINCIPAL: Logo Isotipo + Buscador Estilo Mercado Libre + Carrito / WhatsApp */}
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2">
        {/* Logo / Isotipo Artesano Digital */}
        <button
          type="button"
          onClick={() => {
            if (onSelectWorld) onSelectWorld('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 p-1 active:scale-95 transition-transform"
          title="Ir al inicio"
        >
          <img
            src="/brand/artesano_isotipo_transparente.png"
            alt="Artesano Digital"
            className="w-full h-full object-contain"
          />
        </button>

        {/* Barra de Búsqueda estilo Mercado Libre (Píldora blanca) */}
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar en Artesano Digital..."
            className="w-full pl-9 pr-8 py-2 rounded-full bg-white text-gray-900 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A359] shadow-inner font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2.5 text-gray-400 hover:text-gray-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botón Carrito / Cotizador con Badge */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center active:scale-95 transition-all"
          title="Ver Carrito y Cotización"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D4A359] text-[#17251E] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. FILA DE COBERTURA / UBICACIÓN ESTILO MERCADO LIBRE */}
      <div className="px-3 py-1 bg-black/25 flex items-center justify-between text-[11px] text-stone-200 border-t border-b border-white/5">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3 h-3 text-[#D4A359] shrink-0" />
          <span className="truncate">
            {settings?.serviceStatus?.isPaused ? (
              <span className="text-amber-300 font-bold">Taller en receso · Cotizaciones abiertas</span>
            ) : (
              <span>San Luis Potosí · Envíos a todo México</span>
            )}
          </span>
        </div>
        <span className="text-[10px] text-stone-400 shrink-0 font-medium ml-1">DHL / Fedex &gt;</span>
      </div>

      {/* 3. FILA DE ÁREAS DESLIZABLE (Mercado Libre Category Tabs) */}
      <nav className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 scrollbar-none border-b border-white/5 bg-[#17251E]">
        {areas.map(area => {
          const isSelected = activeWorld === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => {
                if (area.id === 'flash') {
                  if (onOpenFlashDeals) onOpenFlashDeals();
                } else {
                  if (onSelectWorld) onSelectWorld(area.id);
                }
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-[#D4A359] text-[#17251E] shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{area.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 4. FILA DE ACCESOS RÁPIDOS CIRCULARES (Shortcuts estilo Mercado Libre) */}
      <div className="grid grid-cols-5 gap-1 px-2 py-2.5 bg-[#FAF9F5] border-b border-[#E8E4DA] text-center text-gray-800">
        {/* Atajo 1: Ofertas Flash */}
        <button
          type="button"
          onClick={onOpenFlashDeals}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 truncate w-full">Ofertas</span>
        </button>

        {/* Atajo 2: Catálogo Móvil PDF */}
        {isCatalogEnabled ? (
          <a
            href={catalogPdfUrl}
            download={catalogPdfName}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-800 truncate w-full">Catálogo</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onSelectWorld('paquetes-servicios')}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-800 truncate w-full">Paquetes</span>
          </button>
        )}

        {/* Atajo 3: Cotizador / Calculadora */}
        <button
          type="button"
          onClick={onOpenCalculator}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 truncate w-full">Cotizador</span>
        </button>

        {/* Atajo 4: Arcade & Cupones */}
        <button
          type="button"
          onClick={onOpenArcade}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 truncate w-full">Arcade</span>
        </button>

        {/* Atajo 5: WhatsApp Directo */}
        <button
          type="button"
          onClick={onOpenWhatsApp}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <MessageCircle className="w-5 h-5 fill-white" />
          </div>
          <span className="text-[10px] font-bold text-gray-800 truncate w-full">WhatsApp</span>
        </button>
      </div>
    </header>
  );
}
