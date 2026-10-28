import React, { useState } from 'react';
import { Clock, Zap, Flame, ArrowRight, X, Sparkles, Percent } from 'lucide-react';

export default function BlitzClockWidget({
  blitzDeal,
  onSelectProduct,
  isArcadeOpen = false,
  onDismissedChange = null
}) {
  const [dismissed, setDismissed] = useState(false);
  const [lastProductId, setLastProductId] = useState(blitzDeal?.product?.id);

  if (isArcadeOpen) return null;

  const updateDismissed = (val) => {
    setDismissed(val);
    if (onDismissedChange) onDismissedChange(val);
  };

  if (blitzDeal?.product?.id && blitzDeal.product.id !== lastProductId) {
    setLastProductId(blitzDeal.product.id);
    updateDismissed(false);
  }

  if (!blitzDeal || !blitzDeal.product) return null;

  const { product, timeFormatted, durationLabel, secondsRemaining, cycleDuration, percentRemaining, blitzPercentRemaining, isUrgentLessThan15m, isOriginalBlitz } = blitzDeal;
  const regularPrice = product.regularPrice || Math.round(product.price * 1.25);
  const flashPrice = Math.round(product.price * 0.85);

  const isFinal15m = isUrgentLessThan15m || (secondsRemaining <= 900 && cycleDuration > 900);
  const badgeTitle = isFinal15m ? '¡ÚLTIMOS 15 MINUTOS!' : 'OFERTA RELÁMPAGO 15 MIN';
  const pillTitle = isFinal15m ? '⚡ Menos de 15 min' : '⚡ 15 min Blitz';
  const progressPercent = blitzPercentRemaining ?? (
    secondsRemaining <= 900
      ? Math.max(4, Math.min(100, Math.round((secondsRemaining / 900) * 100)))
      : percentRemaining
  );

  // If user minimized the widget, show a sleek floating pill
  if (dismissed) {
    return (
      <aside aria-label="Oferta relámpago" className="fixed bottom-20 sm:bottom-5 right-4 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => updateDismissed(false)}
          className="bg-[#121E17]/95 backdrop-blur-md border-2 border-[#E5C378] text-white px-3.5 py-2 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Ver oferta con menos de 15 min restantes"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <Clock className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span className="text-xs font-black text-amber-200 font-mono tracking-wider">
            {timeFormatted.minutes}:{timeFormatted.seconds}
          </span>
          <span className="text-[11px] font-bold text-gray-300 hidden sm:inline">
            {pillTitle}
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Reloj de oferta relámpago"
      className="fixed bottom-20 sm:bottom-5 left-3 right-3 sm:left-auto sm:right-6 z-40 sm:max-w-[400px] sm:w-[calc(100vw-2.5rem)] animate-fade-in select-none"
    >
      {/* VERSIÓN MÓVIL DISCRETA: Pastilla delgada y compacta que no obstruye la pantalla */}
      <div className="sm:hidden flex items-center justify-between gap-2 bg-[#121E17]/95 backdrop-blur-md text-white border border-[#E5C378]/80 shadow-[0_8px_24px_rgba(0,0,0,0.6)] rounded-full px-2.5 py-1.5 w-full max-w-sm mx-auto">
        <div
          onClick={() => onSelectProduct && onSelectProduct(product)}
          className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          <img
            src={product.primaryImage || product.whiteBgImage}
            alt={product.name}
            className="w-7 h-7 rounded-full object-cover border border-amber-300/40 bg-white shrink-0"
          />

          <div className="flex items-center gap-1.5 min-w-0 text-xs">
            <span className="font-mono font-black text-amber-300 tracking-tight shrink-0">
              {timeFormatted.minutes}:{timeFormatted.seconds}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#9E472A] text-white text-[9.5px] font-black shrink-0">
              -15%
            </span>
            <span className="font-bold text-gray-200 truncate max-w-[110px] text-[11px]">
              {product.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onSelectProduct && onSelectProduct(product)}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D4A359] to-[#c28e38] text-[#121E17] font-black text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
          >
            <span>Ver</span>
            <ArrowRight className="w-3 h-3 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={() => updateDismissed(true)}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar oferta flash"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VERSIÓN ESCRITORIO: Tarjeta completa detallada con reloj digital y barra de progreso */}
      <div className="hidden sm:block relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121E17] via-[#1B2F24] to-[#121E17] text-white border-2 border-[#E5C378] shadow-[0_12px_40px_rgba(0,0,0,0.6)] ring-4 ring-[#E5C378]/20 p-4 sm:p-5 space-y-3.5">
        
        {/* Subtle background glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar with close button */}
        <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10.5px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm animate-pulse">
              <Zap className="w-3 h-3 fill-white" />
              <span>{badgeTitle}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => updateDismissed(true)}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Minimizar reloj"
            aria-label="Minimizar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Digital Countdown Clock */}
        <div className="relative z-10 flex items-center justify-between gap-3 bg-black/40 rounded-2xl p-3 border border-amber-400/25">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90 block">
                Tiempo Restante
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-wider flex items-center gap-1 leading-none mt-0.5">
                <span>{timeFormatted.minutes}</span>
                <span className="text-amber-400 animate-pulse">:</span>
                <span>{timeFormatted.seconds}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-medium">Ahorras</span>
            <span className="px-2 py-0.5 rounded-md bg-[#9E472A] text-white text-xs font-black">
              -15% FLASH
            </span>
          </div>
        </div>

        {/* Progress bar of 15m window */}
        <div className="relative z-10 w-full bg-black/50 rounded-full h-1.5 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-red-500 via-amber-400 to-[#E5C378] h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Product Snapshot & Quick CTA */}
        <div className="relative z-10 flex items-center justify-between gap-3 pt-0.5">
          <div
            onClick={() => onSelectProduct && onSelectProduct(product)}
            className="flex items-center gap-3 cursor-pointer group/prod min-w-0"
          >
            <img
              src={product.primaryImage || product.whiteBgImage}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-amber-300/30 group-hover/prod:scale-105 transition-transform bg-white shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-200 font-bold">
                <span>{product.code}</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate max-w-[150px] group-hover/prod:text-amber-200 transition-colors">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-gray-400 line-through">${regularPrice}</span>
                <span className="text-xs font-black text-amber-300">${flashPrice} MXN</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectProduct && onSelectProduct(product)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#c28e38] hover:from-[#c28e38] hover:to-[#a97728] text-[#121E17] font-black text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            title="Aprovechar oferta de 15 minutos"
          >
            <span>Ver oferta</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

      </div>
    </aside>
  );
}
