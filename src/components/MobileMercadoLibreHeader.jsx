import React from 'react';
import { 
  Search, 
  X, 
  ShoppingBag, 
  MapPin, 
  Menu
} from 'lucide-react';

export default function MobileMercadoLibreHeader({
  searchQuery = '',
  onSearchChange,
  onClearSearch,
  activeWorld = 'all',
  onSelectWorld,
  onOpenCart,
  cartCount = 0,
  onToggleSidebar,
  settings
}) {
  const areas = [
    { id: 'all', label: 'Todo' },
    { id: 'flash', label: 'En Oferta' },
    { id: 'personalizados', label: 'Personalizados' },
    { id: 'hogar', label: 'Hogar' },
    { id: 'negocios', label: 'Negocios' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'juguetes', label: 'Juguetes' },
    { id: 'industria', label: 'Industria' },
    { id: 'paquetes-servicios', label: 'Paquetes' },
    { id: 'publicidad-desarrollo', label: 'Publicidad & Web' }
  ];

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[#17251E] text-white shadow-md select-none">
      {/* 1. FILA PRINCIPAL: Botón Menú Lateral (Hamburguesa) + Buscador Blanco + Carrito */}
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2">
        {/* Botón Menú Hamburguesa (Abre la barra lateral deslizable con Cotizador, Arcade, Catálogo, etc.) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 cursor-pointer"
          title="Abrir menú de herramientas"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-5 h-5 text-white" />
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
              className="absolute right-2.5 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botón Carrito / Cotizador con Badge */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center active:scale-95 transition-all text-white cursor-pointer"
          title="Ver Carrito y Cotización"
          aria-label="Ver carrito"
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

      {/* 3. FILA DE ÁREAS DESLIZABLE (Category Chips) */}
      <nav className="flex items-center gap-1.5 overflow-x-auto px-2 py-1.5 scrollbar-none bg-[#17251E]">
        {areas.map(area => {
          const isSelected = activeWorld === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => {
                if (onSelectWorld) onSelectWorld(area.id);
              }}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all relative cursor-pointer ${
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
    </header>
  );
}
