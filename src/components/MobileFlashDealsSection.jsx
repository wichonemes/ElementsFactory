import React from 'react';
import { Flame, Clock, Plus, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MobileFlashDealsSection({
  products = [],
  flashDeal,
  onSelectProduct,
  onAddToCart
}) {
  const flashProducts = products.filter(p => flashDeal?.isProductOnFlashDeal?.(p.id) || p.flashDealConfig?.discountPercent > 0).slice(0, 4);

  if (!flashProducts || flashProducts.length === 0) return null;

  const featured = flashProducts[0];
  const sideProducts = flashProducts.slice(1, 3);

  const getDiscountedPrice = (prod) => {
    const original = prod.price || 150;
    const discount = prod.flashDealConfig?.discountPercent || 25;
    return Math.round(original * (1 - discount / 100));
  };

  return (
    <section className="md:hidden px-3 py-2 space-y-2 select-none">
      {/* Encabezado amarillo estilo Mercado Libre */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-2xl p-3 border border-amber-500/30 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
            <h3 className="text-xs font-black tracking-tight text-stone-900 uppercase">
              OFERTAS RELÁMPAGO
            </h3>
          </div>

          {/* Reloj Digital Retro estilo Mercado Libre */}
          <div className="flex items-center gap-1 bg-stone-900 text-amber-300 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shadow-inner">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>05 : 10 : 03</span>
          </div>
        </div>

        {/* Contenido en 2 Columnas Estilo Mercado Libre (Captura 4) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Columna Izquierda: Mini lista de productos */}
          <div className="bg-white/95 rounded-xl p-2 space-y-2 flex flex-col justify-between border border-amber-200 shadow-2xs">
            {sideProducts.map(p => {
              const discPrice = getDiscountedPrice(p);
              const discPercent = p.flashDealConfig?.discountPercent || 25;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct && onSelectProduct(p)}
                  className="flex items-center gap-2 cursor-pointer group active:scale-98 transition-transform"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={p.primaryImage || '/uploads/img_001.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-1 py-0.2 bg-amber-100 text-amber-900 font-extrabold text-[9px] rounded">
                      {discPercent}% OFF
                    </span>
                    <div className="text-[10px] text-gray-400 line-through leading-tight">
                      ${p.price}
                    </div>
                    <div className="text-xs font-black text-gray-900 leading-tight">
                      ${discPrice}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Columna Derecha: Tarjeta de Producto Destacado */}
          {featured && (
            <div
              onClick={() => onSelectProduct && onSelectProduct(featured)}
              className="bg-white/95 rounded-xl p-2.5 flex flex-col justify-between border border-amber-200 shadow-2xs cursor-pointer active:scale-98 transition-transform relative"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5 border border-gray-200">
                <img
                  src={featured.primaryImage || '/uploads/img_001.jpg'}
                  alt={featured.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 bg-amber-400 text-stone-900 font-black text-[9px] px-1.5 py-0.2 rounded shadow-2xs flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  <span>FLASH</span>
                </span>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1 leading-snug">
                  {featured.name}
                </h4>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-black text-gray-900">
                    ${getDiscountedPrice(featured)}
                  </span>
                  <span className="text-[10px] text-gray-400 line-through">
                    ${featured.price}
                  </span>
                </div>
                <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Taller San Luis Potosí</span>
                </div>
              </div>

              {/* Botón flotante para agregar rápido */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddToCart) onAddToCart(featured, 1);
                }}
                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                title="Agregar a la cotización"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
