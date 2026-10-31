import React, { useState } from 'react';
import { Eye, Plus, MessageCircle, Sparkles, Layers, Image as ImageIcon, Calculator, ShoppingBag, Flame, Clock, Zap, Star } from 'lucide-react';
import { getOptimizedSrcSet, PRODUCT_CARD_SIZES } from '../utils/imageOptimization';

export default function ProductCard({
  product,
  isFlashDeal = false,
  flashDeal = null,
  onOpenDetail,
  onSelectProduct,
  onQuickAdd,
  onAddToCart,
  onOpenCalculator
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenDetailModal = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    } else if (typeof onOpenDetail === 'function') {
      onOpenDetail(product);
    } else if (typeof onQuickAdd === 'function') {
      onQuickAdd(product);
    }
  };

  // Per-product asynchronous timer and duration details
  const productTime = (isFlashDeal && flashDeal?.getTimeForProduct && product?.id)
    ? flashDeal.getTimeForProduct(product.id)
    : {
        durationLabel: 'FLASH 2H',
        timeFormatted: flashDeal?.timeFormatted || { fullText: '02:00:00' },
        percentRemaining: 100
      };

  const techniqueLabels = {
    '3d': { label: 'ImpresiÃ³n 3D', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    'laser': { label: 'LÃ¡ser', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    'sublimation': { label: 'SublimaciÃ³n', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    'vinyl': { label: 'Vinil', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    'print': { label: 'ImpresiÃ³n', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    'impresion_laser': { label: 'ImpresiÃ³n', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    'nfc': { label: 'NFC', color: 'bg-teal-50 text-teal-800 border-teal-200' }
  };

  const formatPrice = () => {
    if (product.priceType === 'quote' || product.price === null) {
      return (
        <span className="text-xs sm:text-sm font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2 py-0.5 rounded-md inline-block">
          A cotizar
        </span>
      );
    }

    if ((isFlashDeal || product.flashDealConfig?.discountPercent > 0) && product.price) {
      const rawDiscount = product.flashDealConfig?.discountPercent || productTime?.discountPercent || flashDeal?.discountPercent || 15;
      const discountPercent = Math.min(15, rawDiscount);
      const flashPrice = Math.round(product.price * (1 - discountPercent / 100));
      return (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-white bg-emerald-600 px-1.5 py-0.2 rounded shadow-2xs">
              {discountPercent}% OFF
            </span>
            <span className="text-xs text-gray-400 line-through font-semibold">${product.price}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5 truncate">
            <span className="text-base sm:text-lg font-black text-stone-900 font-heading">
              ${Number(flashPrice).toLocaleString('es-MX')}
            </span>
            <span className="text-xs text-gray-500 font-medium">MXN</span>
          </div>
        </div>
      );
    }

    const formattedAmount = `$${Number(product.price).toLocaleString('es-MX')}`;
    const prefix = product.priceType === 'starting_at' ? 'Desde ' : '';

    // Clean, short unit (e.g. "pieza", "set", "c/u", "combo")
    let cleanUnit = '';
    if (product.priceUnit) {
      let u = product.priceUnit.replace(/\s*\(.*?\)/g, '').trim();
      if (u.toLowerCase().startsWith('set')) u = 'set';
      else if (u.toLowerCase().startsWith('pieza')) u = 'pieza';
      else if (u.toLowerCase().startsWith('combo')) u = 'combo';
      cleanUnit = ` ${u}`;
    }

    return (
      <div className="flex flex-col min-w-0">
        {product.regularPrice && (
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs text-gray-400 line-through font-semibold">
              ${Number(product.regularPrice).toLocaleString('es-MX')} MXN
            </span>
            {product.savings && (
              <span className="text-[10px] font-black text-[#D82B6E] bg-[#FFF0F5] px-1.5 py-0.2 rounded shrink-0">
                Ahorras ${product.savings}
              </span>
            )}
          </div>
        )}
        <div className="flex items-baseline gap-1 truncate">
          {prefix && <span className="text-xs text-gray-500 font-medium shrink-0">{prefix}</span>}
          <span className="text-base sm:text-lg font-extrabold text-[#1F2421] font-heading">{formattedAmount}</span>
          {cleanUnit && <span className="text-xs text-gray-500 font-normal truncate">{cleanUnit}</span>}
        </div>
      </div>
    );
  };

  const primaryTech = product.techniques?.[0] || '3d';
  const techBadge = techniqueLabels[primaryTech] || { label: primaryTech, color: 'bg-gray-100 text-gray-800' };

  // Photo display: Resting shows real warm context lifestyle photo; hover shows pure white background angle of the same item
  const basePhoto = product.primaryImage || product.gallery?.[0] || product.whiteBgImage;
  const hoverPhoto = product.whiteBgImage || (product.gallery && product.gallery[1]) || basePhoto;
  const currentPhoto = isHovered ? hoverPhoto : basePhoto;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group bg-white rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        isFlashDeal 
          ? 'border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.32)] ring-2 ring-amber-400/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]' 
          : 'border-[#E8E4DA] hover:border-[#2D4F3E]/40 hover:shadow-xl'
      }`}
    >
      
      {/* Photo Container con ProtecciÃ³n Anti-PiraterÃ­a (Bloqueo de Arrastre, Clic Derecho y Marca de Agua) */}
      <div
        onClick={handleOpenDetailModal}
        onContextMenu={(e) => e.preventDefault()}
        className="relative aspect-square sm:aspect-auto sm:h-72 overflow-hidden bg-white cursor-pointer select-none flex items-center justify-center p-2 sm:p-4"
      >
        <img
          src={currentPhoto}
          srcSet={getOptimizedSrcSet(currentPhoto)}
          sizes={PRODUCT_CARD_SIZES}
          alt={product.name}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full h-full transition-all duration-300 group-hover:scale-105 pointer-events-none select-none ${
            !isHovered && !currentPhoto.includes('white_')
              ? 'object-cover rounded-xl'
              : 'object-contain p-1.5 sm:p-2 bg-white'
          }`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.srcset = '';
            e.currentTarget.src = '/uploads/img_002.jpg';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Left: Flash Deal or Combo Badge */}
          <div>
            {isFlashDeal ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 rounded-md bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-[8.5px] sm:text-[9.5px] font-black shadow-md border border-amber-300/80 animate-pulse">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-200 text-amber-100 drop-shadow-[0_0_8px_rgba(255,255,255,1)] shrink-0 animate-bounce" />
                <span className="tracking-tight text-white font-black drop-shadow-xs">FLASH 2H</span>
              </span>
            ) : product.isBundle ? (
              <span className="px-1.5 py-0.5 sm:px-2 rounded-md text-[8.5px] sm:text-[9.5px] font-black shadow-xs bg-[#D82B6E] text-white">
                COMBO
              </span>
            ) : null}
          </div>

          {/* Right: Technique Badge (3D, LÃ¡ser, SublimaciÃ³n, Vinil, NFC) */}
          <span className={`px-1.5 py-0.5 sm:px-2 rounded-md text-[8.5px] sm:text-[9.5px] font-bold border backdrop-blur-md shadow-xs ${techBadge.color}`}>
            {techBadge.label}
          </span>
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between pointer-events-none z-10">
          {/* Availability: Stock / Pedido */}
          <div>
            {product.availability === 'in_stock' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-emerald-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Stock</span>
              </span>
            ) : product.availability === 'made_to_order' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-amber-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Pedido</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-gray-600 shadow-xs">
                Agotado
              </span>
            )}
          </div>

          {/* Marca de Agua Sutil de Taller */}
          <div className="flex items-center gap-1 px-1.5 py-[2px] rounded-full bg-black/20 backdrop-blur-2xs text-[7px] font-medium text-white/80 select-none tracking-tight border border-white/5 shadow-2xs">
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

        {/* Quick View Overlay on Desktop */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1F2421] text-xs font-bold shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-all">
            <Eye className="w-3.5 h-3.5 text-[#2D4F3E]" />
            <span>Ver detalles &amp; cotizar</span>
          </span>
        </div>
      </div>

      {/* Content & Actions */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5">
        <div className="space-y-1">
          <h3
            onClick={handleOpenDetailModal}
            className="font-semibold text-stone-900 text-xs sm:text-[14px] line-clamp-2 hover:text-[#2D4F3E] cursor-pointer transition-colors leading-tight sm:leading-snug tracking-normal"
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] pt-0.5 select-none">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
              <span className="text-stone-800 font-bold text-[11px]">4.9</span>
            </div>
            <span className="text-stone-300">·</span>
            <span className="text-stone-400 text-[10px] font-medium">+100 hechos</span>
          </div>
          <div className="flex items-center gap-1 text-[10.5px] font-bold select-none pt-0.5">
            <span className="text-[#9E472A]">Personalizable</span>
          </div>
        </div>

        {/* Price & Circular '+' Action */}
        <div className="pt-2 border-t border-[#E8E4DA]/60 space-y-1">
          <div className="flex items-center justify-between gap-1.5 min-h-[32px]">
            <div className="min-w-0 flex-1 overflow-hidden">
              {formatPrice()}
            </div>

            <button
              type="button"
              onClick={handleOpenDetailModal}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EBF5EE] border border-[#2D4F3E]/30 text-[#2D4F3E] hover:bg-[#2D4F3E] hover:text-white shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn shrink-0"
              title="Ver detalles & personalizar"
              aria-label="Ver detalles"
            >
              <Plus className="w-4 h-4 stroke-[2.8] text-[#2D4F3E] group-hover/btn:text-white transition-all duration-200 group-hover/btn:rotate-90" />
            </button>
          </div>

          {/* Sello de Taller & EnvÃ­o Seguro estilo Mercado Libre */}
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">Taller SLP Â· EnvÃ­o Seguro</span>
          </div>
        </div>
      </div>

    </div>
  );
}

