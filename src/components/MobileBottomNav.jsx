import React from 'react';
import { Home, LayoutGrid, ShoppingBag, Menu } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'home', // 'home' | 'categories' | 'cart' | 'menu'
  onSelectTab,
  cartCount = 0
}) {
  return (
    <nav 
      aria-label="Navegación inferior móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-200 h-14 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] select-none"
    >
      {/* 1. Inicio */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
          activeTab === 'home' ? 'text-[#2D4F3E]' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'home' ? 'text-[#2D4F3E]' : 'text-gray-500'}`}>
          Inicio
        </span>
      </button>

      {/* 2. Categorías (Master-Detail) */}
      <button
        type="button"
        onClick={() => onSelectTab('categories')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
          activeTab === 'categories' ? 'text-[#2D4F3E]' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <LayoutGrid className={`w-5 h-5 ${activeTab === 'categories' ? 'stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'categories' ? 'text-[#2D4F3E]' : 'text-gray-500'}`}>
          Categorías
        </span>
      </button>

      {/* 3. Carrito con Badge numérico */}
      <button
        type="button"
        onClick={() => onSelectTab('cart')}
        className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all cursor-pointer ${
          activeTab === 'cart' ? 'text-[#2D4F3E]' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : ''}`} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-[#D4A359] text-[#17251E] font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'cart' ? 'text-[#2D4F3E]' : 'text-gray-500'}`}>
          Carrito
        </span>
      </button>

      {/* 4. Menú de Taller (Abre la barra lateral con Cotizador, Arcade, Catálogo, WhatsApp, Admin) */}
      <button
        type="button"
        onClick={() => onSelectTab('menu')}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
          activeTab === 'menu' ? 'text-[#2D4F3E]' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Menu className={`w-5 h-5 ${activeTab === 'menu' ? 'stroke-[2.5]' : ''}`} />
        <span className={`text-[10px] font-bold mt-0.5 ${activeTab === 'menu' ? 'text-[#2D4F3E]' : 'text-gray-500'}`}>
          Menú
        </span>
      </button>
    </nav>
  );
}
