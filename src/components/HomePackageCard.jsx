import React from 'react';
import { Plus, CheckCircle2, Percent, Layers, Sparkles } from 'lucide-react';
import { getOptimizedSrcSet, PRODUCT_CARD_SIZES } from '../utils/imageOptimization';

export default function HomePackageCard({
  packageItem,
  onSelectProduct,
  onAddToCart,
  onOpenCalculator
}) {
  if (!packageItem) return null;

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onSelectProduct === 'function') {
      onSelectProduct(packageItem);
    }
  };

  const imageSrc = packageItem.whiteBgImage || packageItem.primaryImage || (packageItem.gallery && packageItem.gallery[0]);
  const savings = packageItem.savings || (packageItem.regularPrice && packageItem.price ? packageItem.regularPrice - packageItem.price : null);
  const discountPct = packageItem.discountPercent || (packageItem.regularPrice && packageItem.price ? Math.round(((packageItem.regularPrice - packageItem.price) / packageItem.regularPrice) * 100) : null);

  const included = Array.isArray(packageItem.includedItems) ? packageItem.includedItems.slice(0, 3) : [];

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-[#E8E4DA] hover:border-[#2D4F3E]/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer select-none"
    >
      {/* 1. Imagen del Paquete */}
      <div className="relative h-48 sm:h-56 bg-[#FAF9F5] overflow-hidden flex items-center justify-center p-3 sm:p-4">
        <img
          src={imageSrc}
          srcSet={getOptimizedSrcSet(imageSrc)}
          sizes={PRODUCT_CARD_SIZES}
          alt={packageItem.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/uploads/img_002.jpg';
          }}
        />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {savings ? (
            <span className="px-2.5 py-1 rounded-full bg-[#D82B6E] text-white text-[10px] sm:text-[11px] font-black shadow-xs flex items-center gap-1">
              <Percent className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
              <span>Ahorras ${savings} MXN</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-[#2D4F3E] text-white text-[10px] sm:text-[11px] font-black shadow-xs">
              PAQUETE
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs">
            {packageItem.badge || 'COMBO AHORRO'}
          </span>
        </div>

        {/* Badges inferiores */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-emerald-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{packageItem.availability === 'in_stock' ? 'Stock' : 'Pedido'}</span>
          </span>

          {/* Marca de agua */}
          <div className="flex items-center gap-1 px-1.5 py-[2px] rounded-full bg-black/20 backdrop-blur-2xs text-[7px] font-medium text-white/80 tracking-tight border border-white/5 shadow-2xs">
            <img
              src="/brand/artesano_isotipo_transparente-64.webp"
              alt=""
              width="16"
              height="16"
              loading="lazy"
              decoding="async"
              className="w-2 h-2 object-contain shrink-0 opacity-80"
            />
            <span>Artesano Digital</span>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo y Detalles */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-heading font-extrabold text-[#1F2421] text-sm sm:text-base line-clamp-2 group-hover:text-[#2D4F3E] transition-colors leading-snug">
            {packageItem.name}
          </h3>

          <div className="flex items-center gap-1 text-[10.5px] font-bold select-none">
            <span className="text-[#9E472A]">Personalizable</span>
            <span className="text-gray-400 font-medium text-[10px]">· Con grabado o logo</span>
          </div>

          {packageItem.shortDescription && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed pt-0.5">
              {packageItem.shortDescription}
            </p>
          )}

          {/* Desglose de piezas incluidas */}
          {included.length > 0 && (
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200/70 space-y-1 mt-1">
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                ✦ Incluye en este combo:
              </span>
              <ul className="space-y-0.5">
                {included.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-700 line-clamp-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.replace(/^\+\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3. Fila de Precio y Botón '+' */}
        <div className="pt-2 border-t border-[#E8E4DA]/60 space-y-1">
          <div className="flex items-center justify-between gap-2 min-h-[34px]">
            <div className="min-w-0 flex-1">
              {packageItem.regularPrice && (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs text-gray-400 line-through font-semibold">
                    ${Number(packageItem.regularPrice).toLocaleString('es-MX')} MXN
                  </span>
                  {discountPct && (
                    <span className="text-[10px] font-black text-[#D82B6E] bg-[#FFF0F5] px-1.5 py-0.2 rounded shrink-0">
                      -{discountPct}%
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-baseline gap-1 truncate">
                <span className="text-xs text-stone-500 font-medium shrink-0">Combo</span>
                <span className="text-base sm:text-lg font-black text-[#1F2421] font-heading">
                  ${Number(packageItem.price).toLocaleString('es-MX')}
                </span>
                <span className="text-xs text-stone-400 font-normal">MXN</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClick}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EBF5EE] border border-[#2D4F3E]/30 text-[#2D4F3E] hover:bg-[#2D4F3E] hover:text-white shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn shrink-0"
              title="Ver paquete completo y personalizar"
              aria-label="Ver paquete"
            >
              <Plus className="w-4 h-4 stroke-[2.8] text-[#2D4F3E] group-hover/btn:text-white transition-all duration-200 group-hover/btn:rotate-90" />
            </button>
          </div>

          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">Taller SLP · Envío Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}

