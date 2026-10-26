import React from 'react';
import { Home, LayoutGrid, ShoppingBag, Menu } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'home', // 'home' | 'categories' | 'cart' | 'menu'
  onSelectTab,
  cartCount = 0,
  activeWorld = 'all'
}) {
  const isIndustria = activeWorld === 'industria';
  const isPublicidad = activeWorld === 'publicidad-desarrollo';
  const isDark = isIndustria || isPublicidad;

  // Clases dinámicas de la barra según el área activa
  const navBg = isIndustria
    ? 'bg-[#0A0E11]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-2px_15px_rgba(0,0,0,0.7)]'
    : isPublicidad
    ? 'bg-[#0D1410]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-2px_15px_rgba(0,0,0,0.7)]'
    : 'bg-white/98 backdrop-blur-md border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]';

  const activeColor = isIndustria
    ? 'text-[#5BB8FF]'
    : isPublicidad
    ? 'text-[#D4A359]'
    : 'text-[#2D4F3E]';

  const inactiveColor = isDark
    ? 'text-gray-400 hover:text-gray-200'
    : 'text-gray-400 hover:text-gray-600';

  const inactiveTextColor = isDark ? 'text-gray-400' : 'text-gray-500';

  const badgeBg = isIndustria
    ? 'bg-[#5BB8FF] text-[#0A0E11]'
    : 'bg-[#D4A359] text-[#17251E]';

  return (
    <nav 
      aria-label="Navegación inferior móvil"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center justify-around px-2 select-none transition-colors duration-200 ${navBg}`}
    >
      {/* 1. Inicio / Tienda */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
          activeTab === 'home' && !isDark ? activeColor : inactiveColor
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' && !isDark ? 'stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'home' && !isDark ? activeColor : inactiveTextColor}`}>
          {isDark ? 'Tienda' : 'Inicio'}
        </span>
      </button>

      {/* 2. Categorías (Master-Detail) */}
      <button
        type="button"
        onClick={() => onSelectTab('categories')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
          activeTab === 'categories' ? activeColor : inactiveColor
        }`}
      >
        <LayoutGrid className={`w-5 h-5 ${activeTab === 'categories' ? 'stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'categories' ? activeColor : inactiveTextColor}`}>
          Categorías
        </span>
      </button>

      {/* 3. Carrito con Badge numérico */}
      <button
        type="button"
        onClick={() => onSelectTab('cart')}
        className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all cursor-pointer ${
          activeTab === 'cart' ? activeColor : inactiveColor
        }`}
      >
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : ''}`} />
          {cartCount > 0 && (
            <span className={`absolute -top-1.5 -right-2.5 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs ${badgeBg}`}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'cart' ? activeColor : inactiveTextColor}`}>
          Carrito
        </span>
      </button>

      {/* 4. Menú de Taller */}
      <button
        type="button"
        onClick={() => onSelectTab('menu')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
          activeTab === 'menu' ? activeColor : inactiveColor
        }`}
      >
        <Menu className={`w-5 h-5 ${activeTab === 'menu' ? 'stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'menu' ? activeColor : inactiveTextColor}`}>
          Menú
        </span>
      </button>
    </nav>
  );
}
