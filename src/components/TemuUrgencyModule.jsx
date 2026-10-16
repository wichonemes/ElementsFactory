import React from 'react';
import { Zap, Flame, Clock } from 'lucide-react';

export default function TemuUrgencyModule({
  product,
  flashDeal,
  variant = 'modal',
  onOpenCalculator,
  onAction
}) {
  const productTime = (flashDeal?.getTimeForProduct && product?.id)
    ? flashDeal.getTimeForProduct(product.id)
    : null;

  const timeFormatted = productTime?.timeFormatted || flashDeal?.timeFormatted || {
    hours: '01',
    minutes: '59',
    seconds: '59',
    fullText: '01:59:59'
  };

  const durationLabel = productTime?.durationLabel || 'Oferta Flash';

  const scarcityMetrics = flashDeal?.getScarcityForProduct && product?.id
    ? flashDeal.getScarcityForProduct(product.id)
    : (flashDeal?.scarcityMetrics || {
        percent: 86,
        unitsLeft: 3
      });

  const discountPercent = flashDeal?.discountPercent || 20;

  // Minimalist version for ProductCard with refined UX design
  if (variant === 'card') {
    return (
      <div className="rounded-xl bg-[#183124] border border-[#2D4F3E]/70 text-white px-3 py-1.5 flex items-center justify-between shadow-2xs transition-all select-none">
        {/* Left: Clean fire icon & unified scarcity copy */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-amber-400 shrink-0">
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
          </span>
          <span className="text-xs text-emerald-100/90 font-medium truncate">
            Solo <strong className="font-bold text-white">{scarcityMetrics.unitsLeft} pzas</strong> disponibles
          </span>
        </div>

        {/* Right: Clean, stylized flash discount pill */}
        <span className="text-[10.5px] font-black text-[#E5C378] bg-black/35 border border-[#E5C378]/25 px-2 py-0.5 rounded-full shrink-0 tracking-wide font-mono">
          -20% FLASH
        </span>
      </div>
    );
  }

  // Full Horizontal Banner (Exact replica of the user reference image)
  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#17251E] via-[#22362A] to-[#17251E] text-white p-3.5 sm:p-5 border border-[#D4A359]/40 shadow-xl animate-fade-in">
      
      {/* Background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#D4A359]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#2D4F3E]/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Flame badge & Title */}
        <div className="flex items-center gap-3 text-center sm:text-left w-full lg:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E5C378] via-[#C28E38] to-[#9E472A] flex items-center justify-center text-white shadow-lg shrink-0">
            <Zap className="w-6 h-6 fill-white stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#9E472A] text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs">
                <Flame className="w-3 h-3 fill-amber-200" />
                LOTE PREFERENCIAL DE TALLER
              </span>
              <span className="hidden sm:inline text-xs text-[#E5C378] font-bold">
                ¡Precios de fábrica directos!
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold font-heading text-white tracking-tight mt-0.5">
              {product ? `${durationLabel}: -${discountPercent}% en ${product.name}` : 'Capacidad limitada de producción para esta semana'}
            </h3>
          </div>
        </div>

        {/* Center: Countdown Clock (00 hrs : 00 min : 00 seg) */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#E5C378]" />
            <span>TERMINA EN:</span>
          </span>

          <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-black">
            <div className="px-2 py-1 rounded-xl bg-black/60 border border-white/20 text-white shadow-inner text-center min-w-[38px]">
              {timeFormatted.hours}
              <span className="text-[8px] block font-sans text-gray-400 font-normal -mt-1">hrs</span>
            </div>
            <span className="text-[#D4A359] font-bold text-base animate-pulse">:</span>

            <div className="px-2 py-1 rounded-xl bg-black/60 border border-white/20 text-white shadow-inner text-center min-w-[38px]">
              {timeFormatted.minutes}
              <span className="text-[8px] block font-sans text-gray-400 font-normal -mt-1">min</span>
            </div>
            <span className="text-[#D4A359] font-bold text-base animate-pulse">:</span>

            <div className="px-2 py-1 rounded-xl bg-[#9E472A] border border-[#E5C378]/60 text-white shadow-inner text-center min-w-[38px] animate-pulse">
              {timeFormatted.seconds}
              <span className="text-[8px] block font-sans text-amber-200 font-normal -mt-1">seg</span>
            </div>
          </div>
        </div>

        {/* Right: Scarcity Progress & CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 justify-end">
          
          <div className="w-full sm:w-40 space-y-1">
            <div className="flex items-center justify-between text-[10.5px] font-bold">
              <span className="text-[#E5C378] flex items-center gap-1">
                🔥 {scarcityMetrics.percent}% apartado
              </span>
              <span className="text-amber-200 text-[10px]">
                Solo {scarcityMetrics.unitsLeft} lugares
              </span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-[#E5C378] via-[#C28E38] to-[#9E472A] h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${scarcityMetrics.percent}%` }}
              ></div>
            </div>
          </div>

          {onAction && (
            <button
              onClick={onAction}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A359] via-[#C28E38] to-[#9E472A] hover:brightness-110 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Cotizar con precio flash</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
