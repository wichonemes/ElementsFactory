import React from 'react';
import { Home, Calculator, ShoppingBag } from 'lucide-react';

/**
 * FloatingSideNav - Dock flotante lateral derecho
 * Configurado estrictamente con los 4 accesos esenciales solicitados:
 * 1. Casita (Home): Regresa inmediatamente al inicio de la página.
 * 2. Logo Artesano Digital: Desplaza y abre la sección de catálogos de producto.
 * 3. Calculadora Cotizadora: Abre la calculadora de presupuestos multimaterial.
 * 4. Carrito de Compras: Abre la gaveta de presupuesto / checkout con contador de piezas.
 */
export default function FloatingSideNav({
  onGoHome,
  onGoToCatalog,
  onGoToAreas,
  onOpenCalculator,
  onOpenCart,
  cartCount = 0
}) {
  const handleGoToCatalog = () => {
    if (onGoToCatalog) {
      onGoToCatalog();
    } else if (onGoToAreas) {
      onGoToAreas();
    } else {
      const el = document.getElementById('areas-section') || document.getElementById('catalogo-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside 
      aria-label="Navegación rápida de cabecera y cotización"
      className="hidden md:flex fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#E8E4DA] p-2 rounded-2xl shadow-xl flex flex-col gap-2 transition-all duration-300 hover:shadow-2xl hover:border-[#2D4F3E]/40">
        
        {/* 1. Botón Inicio (Casita) */}
        <div className="relative group">
          <button
            onClick={handleGoHome}
            aria-label="Ir al inicio de la página"
            className="w-11 h-11 rounded-xl bg-[#F4F0E8] hover:bg-[#2D4F3E] text-[#2D4F3E] hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer"
          >
            <Home className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          </button>
          {/* Tooltip a la izquierda */}
          <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-[#1F2421] text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
            Ir al Inicio
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1F2421]"></div>
          </div>
        </div>

        {/* 2. Logo Artesano Digital -> Removido en versión escritorio (pedido del usuario) */}
        {/* El logo duplicaba acceso ya disponible en navbar y confundía junto a la calculadora */}

        {/* 3. Botón Calculadora de Cotización */}
        {onOpenCalculator && (
          <div className="relative group">
            <button
              onClick={() => onOpenCalculator(null)}
              aria-label="Abrir calculadora de cotización"
              className="w-11 h-11 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </button>
            {/* Tooltip a la izquierda */}
            <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-[#1F2421] text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              Calculadora Cotizadora
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1F2421]"></div>
            </div>
          </div>
        )}

        {/* 4. Botón Carrito de Compras con Contador de Piezas */}
        {onOpenCart && (
          <div className="relative group">
            <button
              onClick={onOpenCart}
              aria-label="Abrir carrito de compras"
              className="w-11 h-11 rounded-xl bg-[#F4F0E8] hover:bg-[#2D4F3E] text-[#2D4F3E] hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer relative"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#D82B6E] text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Tooltip a la izquierda */}
            <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-[#1F2421] text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              Carrito {cartCount > 0 ? `(${cartCount})` : ''}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1F2421]"></div>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
