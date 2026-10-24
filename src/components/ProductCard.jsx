import React, { useState } from 'react';
import { Eye, ArrowUpRight, Plus, MessageCircle, Sparkles, Layers, Image as ImageIcon, Calculator, ShoppingBag, Flame, Clock, Zap } from 'lucide-react';
import TemuUrgencyModule from './TemuUrgencyModule';
import { getFilamentColor, getProductColorOptions } from '../utils/colorUtils';

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
    '3d': { label: 'Impresión 3D', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    'laser': { label: 'Láser', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    'sublimation': { label: 'Sublimación', color: 'bg-rose-50 text-rose-800 border-rose-200' },
    'vinyl': { label: 'Vinil', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    'nfc': { label: 'NFC', color: 'bg-teal-50 text-teal-800 border-teal-200' }
  };

  const formatPrice = () => {
    if (product.priceType === 'quote' || product.price === null) {
      return (
        <span className="text-sm font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-1 rounded-md">
          A cotizar
        </span>
      );
    }

    if ((isFlashDeal || product.flashDealConfig?.discountPercent > 0) && product.price) {
      const discountPercent = product.flashDealConfig?.discountPercent || productTime?.discountPercent || flashDeal?.discountPercent || 20;
      const flashPrice = Math.round(product.price * (1 - discountPercent / 100));
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black text-white bg-emerald-600 px-1.5 py-0.2 rounded shadow-2xs">
              {discountPercent}% OFF
            </span>
            <span className="text-xs text-gray-400 line-through font-semibold">${product.price}</span>
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              <span>Flash</span>
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-stone-900 font-heading">${flashPrice}</span>
            <span className="text-xs text-gray-500 font-medium">MXN</span>
          </div>
        </div>
      );
    }

    const amount = `$${product.price}`;
    const prefix = product.priceType === 'starting_at' ? 'Desde ' : '';
    const unit = product.priceUnit ? ` ${product.priceUnit}` : '';

    return (
      <div className="flex flex-col">
        {product.regularPrice && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 line-through font-semibold">${product.regularPrice} MXN</span>
            {product.savings && (
              <span className="text-[10px] font-black text-[#D82B6E] bg-[#FFF0F5] px-1.5 py-0.2 rounded">
                Ahorras ${product.savings}
              </span>
            )}
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-500 font-medium">{prefix}</span>
          <span className="text-base sm:text-lg font-extrabold text-[#1F2421] font-heading">{amount}</span>
          {unit && <span className="text-xs text-gray-400 font-normal">{unit}</span>}
        </div>
      </div>
    );
  };

  const primaryTech = product.techniques?.[0] || '3d';
  const techBadge = techniqueLabels[primaryTech] || { label: primaryTech, color: 'bg-gray-100 text-gray-800' };
  const colorOptions = getProductColorOptions(product);

  const isPackageOrTiered = 
    Boolean(product.isBundle) || 
    Boolean(product.priceTiers && product.priceTiers.length > 1) || 
    Boolean(product.code?.startsWith('PROMO-')) || 
    Boolean(product.worlds?.includes('paquetes-servicios')) ||
    Boolean(product.worlds?.includes('personalizados')) ||
    Boolean(product.customizationTiers && product.customizationTiers.length > 1) ||
    Boolean(product.priceType === 'starting_at');

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
          ? 'border-[#D4A359] shadow-lg ring-2 ring-[#D4A359]/30' 
          : 'border-[#E8E4DA] hover:border-[#2D4F3E]/40 hover:shadow-xl'
      }`}
    >
      
      {/* Photo Container con Protección Anti-Piratería (Bloqueo de Arrastre, Clic Derecho y Marca de Agua) */}
      <div
        onClick={handleOpenDetailModal}
        onContextMenu={(e) => e.preventDefault()}
        className="relative aspect-square sm:aspect-auto sm:h-72 overflow-hidden bg-white cursor-pointer select-none flex items-center justify-center p-2 sm:p-4"
      >
        <img
          src={currentPhoto}
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
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/uploads/img_002.jpg';
          }}
        />

        {/* Marca de Agua Sutil de Taller para Protección de Imagen con Logotipo Oficial */}
        <div className="absolute bottom-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-[2px] rounded-full bg-black/15 backdrop-blur-2xs text-[7px] font-medium text-white/60 pointer-events-none select-none tracking-tight border border-white/5 shadow-2xs">
          <img
            src="/brand/artesano_isotipo_transparente.png"
            alt=""
            className="w-2 h-2 object-contain shrink-0 opacity-75"
          />
          <span>Artesano Digital</span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between pointer-events-none">
          {/* Product Code Badge (Oculto al cliente por requerimiento, preservado para control interno) */}
          <span className="hidden" data-sku={product.sku || product.code} title={product.sku ? `SKU: ${product.sku}` : `Código: ${product.code}`}>
            {product.sku || product.code}
          </span>

          {/* Technique, Promo or Flash Deal Badge */}
          {isFlashDeal ? (
            <div className="ml-auto relative px-1.5 py-0.5 sm:px-2 rounded-lg border border-amber-300/40 backdrop-blur-md badge-flame-effect text-white flex flex-col gap-0.5 max-w-[96px] sm:max-w-[108px] overflow-hidden select-none shadow-xs">
              <div className="relative z-10 flex items-center justify-between gap-1 text-[8.5px] sm:text-[9px] font-black leading-tight">
                <span className="flex items-center gap-0.5 text-amber-100 truncate">
                  {productTime.isBlitz ? (
                    <Clock className="w-2.5 h-2.5 text-amber-300 animate-spin-slow shrink-0" />
                  ) : (
                    <Flame className="w-2.5 h-2.5 fill-amber-300 text-amber-200 icon-flame-flicker shrink-0" />
                  )}
                  <span className="tracking-tight truncate">{productTime.durationLabel || 'FLASH'}</span>
                </span>
                {productTime?.timeFormatted?.fullText && (
                  <span className="font-mono bg-black/40 px-1 py-0.2 rounded text-[7.5px] sm:text-[8.5px] text-white tracking-tight border border-white/10 shrink-0">
                    {productTime.isBlitz ? `${productTime.timeFormatted.minutes}:${productTime.timeFormatted.seconds}` : productTime.timeFormatted.fullText}
                  </span>
                )}
              </div>
              {/* Barrita discreta de cuánto tiempo queda */}
              <div className="relative z-10 w-full bg-black/40 rounded-full h-0.5 overflow-hidden border border-white/10" title="Tiempo restante de oferta">
                <div
                  className="bg-gradient-to-r from-amber-300 to-amber-500 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${productTime.blitzPercentRemaining ?? productTime.percentRemaining ?? 100}%`
                  }}
                />
              </div>
            </div>
          ) : product.isBundle ? (
            <span className="ml-auto px-1.5 py-0.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-black border backdrop-blur-md shadow-xs bg-[#D82B6E] text-white border-[#D82B6E]">
              COMBO
            </span>
          ) : (
            <span className={`ml-auto px-1.5 py-0.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] font-bold border backdrop-blur-md shadow-xs ${techBadge.color}`}>
              {techBadge.label}
            </span>
          )}
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none">
          {/* Availability */}
          <div>
            {product.availability === 'in_stock' ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-emerald-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="hidden xs:inline">En existencia</span>
                <span className="xs:hidden">Stock</span>
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

          {/* Multi-photo indicator pill */}
          <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-white shadow-xs">
            <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{product.gallery?.length || 4} fotos</span>
          </span>
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
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-3">
        <div className="space-y-1">
          <h3
            onClick={handleOpenDetailModal}
            className="font-semibold text-stone-900 text-xs sm:text-[15px] line-clamp-2 hover:text-[#2D4F3E] cursor-pointer transition-colors leading-tight sm:leading-snug tracking-normal"
          >
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-[#2D4F3E] font-bold select-none">
            <span className="text-[#9E472A]">Personalizable</span>
            <span className="text-gray-400 font-medium hidden sm:inline">· Si lo piensas, se hace</span>
          </div>
        </div>

        {/* Circulitos de color disponibles */}
        {colorOptions.length > 0 && (
          <div 
            onClick={handleOpenDetailModal}
            className="flex items-center gap-1.5 pt-0.5 cursor-pointer select-none group/colors"
            title={`${colorOptions.length} colores disponibles: ${colorOptions.join(', ')}`}
          >
            <div className="flex items-center gap-1">
              {colorOptions.slice(0, 5).map((colorName, idx) => {
                const swatch = getFilamentColor(colorName);
                return (
                  <span
                    key={idx}
                    className="group/swatch relative inline-flex items-center justify-center"
                  >
                    <span
                      className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full border border-black/20 shadow-2xs inline-block shrink-0 transition-transform duration-150 group-hover/swatch:scale-125 group-hover/swatch:z-10"
                      style={{
                        background: swatch?.css || '#D1D5DB',
                        borderColor: swatch?.border || '#9CA3AF',
                        boxShadow: swatch?.glow ? '0 0 6px rgba(110, 231, 183, 0.9)' : undefined
                      }}
                    />
                    {/* Tooltip flotante con nombre del color */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/swatch:block z-30 px-2 py-0.5 text-[10px] font-bold text-white bg-black/85 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                      {colorName}
                    </span>
                  </span>
                );
              })}
            </div>
            {colorOptions.length > 5 && (
              <span className="text-[9px] sm:text-[9.5px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-full">
                +{colorOptions.length - 5}
              </span>
            )}
            <span className="text-[9.5px] sm:text-[10.5px] text-gray-400 font-medium group-hover/colors:text-[#2D4F3E] transition-colors ml-0.5">
              {colorOptions.length} {colorOptions.length === 1 ? 'color' : 'colores'}
            </span>
          </div>
        )}

        {/* Oferta Flash Rotativa de 2 Horas */}
        {isFlashDeal && (
          <TemuUrgencyModule
            product={product}
            flashDeal={flashDeal}
            variant="card"
          />
        )}

        {/* Price & Circular '+' Action */}
        <div className="pt-2 border-t border-[#E8E4DA]/60 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              {formatPrice()}
            </div>

            {isPackageOrTiered ? (
              <button
                type="button"
                onClick={handleOpenDetailModal}
                className="h-7 sm:h-9 px-2.5 sm:px-3 rounded-full bg-[#EBF5EE] border border-[#2D4F3E]/30 text-[#2D4F3E] hover:bg-[#2D4F3E] hover:text-white shadow-2xs hover:shadow-md flex items-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer shrink-0 font-bold text-[11px] sm:text-xs"
                title="Ver opciones y configurar"
                aria-label="Ver opciones y configurar"
              >
                <span>Opciones</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddToCart) {
                    onAddToCart({
                      product,
                      quantity: 1,
                      selectedVariants: {},
                      customText: ''
                    });
                  } else {
                    handleOpenDetailModal(e);
                  }
                }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#EBF5EE] border border-[#2D4F3E]/30 text-[#2D4F3E] hover:bg-[#2D4F3E] hover:text-white shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn shrink-0"
                title="Agregar a cotización"
                aria-label="Agregar a cotización"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 stroke-[2.8] text-[#2D4F3E] group-hover/btn:text-white transition-all duration-200 group-hover/btn:rotate-90" />
              </button>
            )}
          </div>

          {/* Sello de Taller & Envío Seguro estilo Mercado Libre */}
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">Taller SLP · Envío Seguro</span>
          </div>
        </div>
      </div>

    </div>
  );
}
