import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw, ChevronLeft, ChevronRight, LayoutGrid, Sparkles,
  ArrowRight, Repeat, Flame, Boxes, Layers
} from 'lucide-react';
import ProductCard from './ProductCard';

export default function AreaLoopShowcase({
  products = [],
  world,
  flashDeal = null,
  onSelectProduct,
  onAddToCart,
  onOpenCalculator,
  onSelectOtherWorld
}) {
  const [viewStyle, setViewStyle] = useState('carousel'); // 'carousel' | 'grid'
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(1);
  const trackRef = useRef(null);

  const total = products.length;

  if (total === 0) return null;

  // Next product in infinite loop
  const handleNextLoop = () => {
    setCarouselIndex(prev => {
      const next = (prev + 1) % total;
      if (next === 0) setLoopCount(c => c + 1);
      return next;
    });
  };

  // Prev product in infinite loop
  const handlePrevLoop = () => {
    setCarouselIndex(prev => {
      const next = (prev - 1 + total) % total;
      return next;
    });
  };

  // Loop back to start from bottom banner
  const handleRestartLoop = () => {
    setCarouselIndex(0);
    setLoopCount(c => c + 1);
    const el = document.getElementById('catalogo-section') || document.getElementById('area-loop-container');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Visible window for carousel: shows 4 products in continuous loop
  const visibleCarouselProducts = [];
  for (let i = 0; i < Math.min(total, 4); i++) {
    const idx = (carouselIndex + i) % total;
    visibleCarouselProducts.push({
      item: products[idx],
      indexInArea: idx
    });
  }

  return (
    <div id="area-loop-container" className="space-y-6">
      
      {/* Control Bar: Loop Mode Switcher & Loop Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-6 rounded-2xl border border-[#E8E4DA] shadow-xs">
        
        {/* Left: Loop Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-[#2D4F3E] flex items-center justify-center shrink-0">
            <Repeat className="w-4 h-4 text-emerald-800" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1F2421] flex items-center gap-1.5">
              <span>Bucle de {world?.name || 'Área'}</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-[#2D4F3E] text-[10px] font-black uppercase">
                {viewStyle === 'carousel' ? `Carrusel continuo • Vuelta ${loopCount}` : 'Cuadrícula con ciclo'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Desplázate sin fin por los {total} productos exclusivos de esta área.
            </p>
          </div>
        </div>

        {/* Right: Switcher between Infinite Carousel Loop and Grid View */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#F4F0E8] p-1 rounded-xl border border-[#E8E4DA]">
            <button
              type="button"
              onClick={() => setViewStyle('carousel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewStyle === 'carousel'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421]'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Riel en Bucle</span>
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewStyle === 'grid'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-[#1F2421]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
          </div>
        </div>

      </div>

      {/* VIEW 1: Infinite Carousel Loop (Riel Continuo) */}
      {viewStyle === 'carousel' && (
        <div className="space-y-4">
          
          {/* Carousel Navigation Header */}
          <div className="flex items-center justify-between px-2">
            <div className="text-xs text-gray-500 font-medium">
              Viendo posición <strong className="text-[#1F2421] font-mono font-bold">{carouselIndex + 1}</strong> a <strong className="text-[#1F2421] font-mono font-bold">{Math.min(carouselIndex + 4, total)}</strong> de <span className="font-mono font-bold text-emerald-800">{total}</span> en ciclo
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevLoop}
                className="p-2 rounded-xl bg-white border border-[#E8E4DA] text-gray-700 hover:bg-[#2D4F3E] hover:text-white hover:border-[#2D4F3E] transition-all shadow-xs cursor-pointer"
                title="Producto anterior en bucle"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextLoop}
                className="p-2 rounded-xl bg-white border border-[#E8E4DA] text-gray-700 hover:bg-[#2D4F3E] hover:text-white hover:border-[#2D4F3E] transition-all shadow-xs cursor-pointer"
                title="Siguiente producto en bucle"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards Track */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleCarouselProducts.map(({ item, indexInArea }) => (
              <div key={`${item.id}-${indexInArea}`} className="relative">
                <ProductCard
                  product={item}
                  isFlashDeal={flashDeal?.isProductOnFlashDeal ? flashDeal.isProductOnFlashDeal(item.id) : false}
                  flashDeal={flashDeal}
                  onOpenDetail={onSelectProduct}
                  onQuickAdd={onSelectProduct}
                  onOpenCalculator={onOpenCalculator}
                />
                <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-mono font-bold backdrop-blur-xs">
                  #{indexInArea + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Progress dots bar */}
          <div className="pt-2 flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-none py-2">
            {products.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCarouselIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === carouselIndex
                    ? 'w-6 h-2 bg-[#2D4F3E]'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Ir al producto #${idx + 1}`}
              />
            ))}
          </div>

        </div>
      )}

      {/* VIEW 2: Complete Grid with Bottom Loop Banner */}
      {viewStyle === 'grid' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <div key={product.id} className="relative">
                <ProductCard
                  product={product}
                  isFlashDeal={flashDeal?.isProductOnFlashDeal ? flashDeal.isProductOnFlashDeal(product.id) : false}
                  flashDeal={flashDeal}
                  onOpenDetail={onSelectProduct}
                  onQuickAdd={onSelectProduct}
                  onOpenCalculator={onOpenCalculator}
                />
              </div>
            ))}
          </div>

          {/* Bottom Loop Wrap Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1F2421] via-[#2A3B30] to-[#1F2421] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-white/10">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <RotateCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-bold font-heading text-white">
                  ¡Has recorrido los {total} modelos de {world?.name || 'esta área'}!
                </h4>
                <p className="text-xs text-gray-300">
                  Estás en modo bucle continuo. Puedes reiniciar el recorrido o explorar otra área de fabricación.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRestartLoop}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Reiniciar bucle de {world?.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
