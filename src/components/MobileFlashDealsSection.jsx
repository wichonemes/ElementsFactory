import React from 'react';
import { Flame, Clock, Plus, Zap, ShieldCheck } from 'lucide-react';

export default function MobileFlashDealsSection({
  products = [],
  flashDeal,
  onSelectProduct,
  onAddToCart
}) {
  const flashProducts = products.filter(p => flashDeal?.isProductOnFlashDeal?.(p.id) || p.flashDealConfig?.discountPercent > 0).slice(0, 4);

  if (!flashProducts || flashProducts.length === 0) return null;

  const featured = flashProducts[0];
  const sideProducts = flashProducts.slice(1, 4);

  const getDiscountedPrice = (prod) => {
    const original = prod.price || 150;
    const discount = prod.flashDealConfig?.discountPercent || 25;
    return Math.round(original * (1 - discount / 100));
  };

  return (
    <section className="md:hidden px-3 py-2 select-none">
      {/* Contenedor en 2 Columnas idéntico a Mercado Libre (Captura 4) */}
      <div className="grid grid-cols-2 gap-2.5 items-stretch">
        
        {/* COLUMNA IZQUIERDA: Tarjeta Amarilla con Título, Reloj y 3 Mini Ofertas */}
        <div className="bg-[#FFE600] rounded-2xl p-2.5 flex flex-col justify-between border border-amber-300 shadow-xs">
          {/* Header de la tarjeta amarilla */}
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <div className="flex items-center gap-1 text-stone-900">
                <Flame className="w-3.5 h-3.5 fill-orange-600 text-orange-600 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-tight leading-none">
                  OFERTAS
                </span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-tight text-stone-900 leading-tight">
                RELÁMPAGO
              </div>
            </div>

            {/* Reloj Digital Retro */}
            <div className="shrink-0 flex items-center gap-0.5 bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[9px] font-black shadow-xs">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              <span>05:10:03</span>
            </div>
          </div>

          {/* Mini Lista de 2 o 3 productos con foto y % OFF */}
          <div className="space-y-2 flex-1 flex flex-col justify-around">
            {sideProducts.map(p => {
              const discPrice = getDiscountedPrice(p);
              const discPercent = p.flashDealConfig?.discountPercent || 25;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct && onSelectProduct(p)}
                  className="bg-white/90 hover:bg-white rounded-xl p-1.5 flex items-center gap-1.5 cursor-pointer active:scale-98 transition-transform border border-amber-200/60 shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={p.primaryImage || './uploads/img_001.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <span className="inline-block px-1 py-0.2 bg-amber-100 text-amber-900 font-extrabold text-[8px] rounded">
                      {discPercent}% OFF
                    </span>
                    <div className="text-[9px] text-gray-400 line-through">
                      ${p.price}
                    </div>
                    <div className="text-[11px] font-black text-gray-900">
                      ${discPrice}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: Tarjeta Blanca Destacada con Foto Grande */}
        {featured && (
          <div
            onClick={() => onSelectProduct && onSelectProduct(featured)}
            className="bg-white rounded-2xl p-2.5 flex flex-col justify-between border border-stone-200/80 shadow-xs cursor-pointer active:scale-98 transition-transform relative"
          >
            {/* Foto grande con badge de relámpago y temporizador */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-1.5 border border-gray-100">
              <img
                src={featured.primaryImage || './uploads/img_001.jpg'}
                alt={featured.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-[#FFE600] text-stone-900 font-black text-[9px] px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-stone-900 text-stone-900" />
                <span className="font-mono">05:10:03</span>
              </span>
            </div>

            {/* Información de producto */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1 leading-snug">
                {featured.name}
              </h4>
              
              <div className="flex items-center gap-1 mt-1">
                <span className="px-1 py-0.2 bg-emerald-100 text-emerald-800 font-black text-[9px] rounded">
                  {featured.flashDealConfig?.discountPercent || 25}% OFF
                </span>
                <span className="text-[10px] text-gray-400 line-through">
                  ${featured.price}
                </span>
              </div>

              <div className="text-sm font-black text-gray-900 leading-tight mt-0.5">
                ${getDiscountedPrice(featured)}
              </div>

              <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5 mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Taller San Luis Potosí</span>
              </div>
            </div>

            {/* Botón flotante para agregar rápido con pulgar */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) {
                  onAddToCart({
                    product: featured,
                    quantity: 1,
                    selectedVariants: {},
                    customText: ''
                  });
                }
              }}
              className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
              title="Agregar al carrito"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
