import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X, Check, ShoppingBag, MessageCircle, Share2, Clock, Ruler,
  ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Maximize2,
  Package, Eye, Layers, Calculator, Calendar, AlertTriangle, Truck, MapPin,
  Gamepad2, Gift, Trophy, Star, ArrowRight, FileText, ZoomIn, Crown, Ticket, Repeat, Coins, Zap
} from 'lucide-react';
import TemuUrgencyModule from './TemuUrgencyModule';
import WorkshopArcadeModal from './WorkshopArcadeModal';
import { useArcadeSession } from '../hooks/useArcadeSession';
import { formatServiceDate } from '../utils/serviceStatus';
import { getFilamentColor, isDarkColor, DARK_COLOR_PRESETS, WORKSHOP_COLOR_PALETTES, ALL_WORKSHOP_COLORS } from '../utils/colorUtils';
import { playCoinSound, playMarioPowerDownSound } from '../utils/soundEffects';
import { getBundleTiers } from './PackagesAndServicesView';

export default function ProductDetailModal({
  product,
  allProducts = [],
  onSelectProduct,
  settings = null,
  isFlashDeal = false,
  flashDeal = null,
  onClose,
  onAddToCart,
  onOpenArcade,
  onDirectWhatsAppQuote,
  onOpenCalculator
}) {
  if (!product) return null;

  // Build clean unified gallery list strictly following the 4-photo standard
  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.primaryImage];

  const defaultMeta = product.isBundle
    ? [
        { label: '1. En contexto', shortLabel: '1. En contexto', type: 'lifestyle' },
        { label: '2. Fondo blanco', shortLabel: '2. Fondo blanco', type: 'white_angle' },
        { label: '3. Detalle macro', shortLabel: '3. Detalle', type: 'detail' },
        { label: '4. Contenido del paquete', shortLabel: '4. Contenido', type: 'bundle_content' }
      ]
    : [
        { label: '1. En contexto', shortLabel: '1. En contexto', type: 'lifestyle' },
        { label: '2. Fondo blanco', shortLabel: '2. Fondo blanco', type: 'white_angle' },
        { label: '3. Detalle macro', shortLabel: '3. Detalle', type: 'detail' },
        { label: '4. Medidas y escala', shortLabel: '4. Medidas', type: 'measures' }
      ];

  const galleryMeta = product.galleryMeta || defaultMeta;

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const init = {};
    (product.variants || []).forEach(v => {
      const filtered = isFlashDeal
        ? v.options.filter(opt => !opt.toLowerCase().includes('personalizad'))
        : v.options;
      init[v.name] = (filtered.length > 0 ? filtered[0] : v.options[0]);
    });
    return init;
  });
  const [customText, setCustomText] = useState('');
  const [showPersonalizationInput, setShowPersonalizationInput] = useState(false);
  const [isPaletteExpanded, setIsPaletteExpanded] = useState(false);
  const [activePaletteGroup, setActivePaletteGroup] = useState('todos');
  const [quantity, setQuantity] = useState(product.specifications?.minQuantity || 1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const modalScrollRef = useRef(null);

  // Protección anti-salida accidental en móviles:
  // Al deslizar el dedo en el celular hacia atrás, solo se cierra el modal sin salirse de la tienda
  useEffect(() => {
    if (!product) return;
    const modalKey = 'artesano_modal_' + (product.id || 'detail');
    window.history.pushState({ modal: modalKey }, '', window.location.href);

    const onPopState = () => {
      if (onClose) onClose();
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [product?.id]);

  const handleSafeClose = () => {
    if (window.history.state?.modal?.startsWith('artesano_modal_')) {
      window.history.back();
    } else {
      if (onClose) onClose();
    }
  };

  // Sugerencias continuas al scrolear hasta abajo para nunca quedarse sin productos
  const suggestedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const others = allProducts.filter(p => p.id !== product.id && p.status !== 'draft');
    if (others.length === 0) return [];

    const sameArea = others.filter(p => p.worlds?.some(w => product.worlds?.includes(w)));
    const remaining = others.filter(p => !sameArea.some(sa => sa.id === p.id));
    return [...sameArea, ...remaining];
  }, [allProducts, product]);

  // Arcade & Gamificación con hook unificado en sesión
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [activeArcadeGame, setActiveArcadeGame] = useState('dino');
  const [arcadeTab, setArcadeTab] = useState('play');
  const {
    credits: arcadeCredits,
    coins: arcadeCoins,
    activeCoupon,
    refillTimeFormatted,
    exchangeCoinsForCredits
  } = useArcadeSession();

  const handleArcadeClose = () => {
    setIsArcadeOpen(false);
  };

  const activeImage = gallery[activeIdx] || product.primaryImage;
  const currentMeta = galleryMeta[activeIdx] || {
    label: `${activeIdx + 1}. Fotografía adicional`,
    shortLabel: `Foto ${activeIdx + 1}`,
    type: 'detail'
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleVariantChange = (variantName, option) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }));
  };

  const handleShare = async () => {
    const origin = window.location.origin;
    const prodParam = product.code || product.sku || product.id;
    const url = `${origin}/?prod=${encodeURIComponent(prodParam)}`;
    const shareData = {
      title: `${product.name} — Artesano Digital`,
      text: `Mira este producto en Artesano Digital: ${product.name}`,
      url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback al portapapeles si cancela el diálogo nativo
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const productTime = (flashDeal?.getTimeForProduct && product?.id)
    ? flashDeal.getTimeForProduct(product.id)
    : null;
  const currentDiscount = product.flashDealConfig?.discountPercent || productTime?.discountPercent || flashDeal?.discountPercent || 20;

  // Soporte de los 3 paquetes / niveles de taller para bundles y promociones
  const bundleTiers = useMemo(() => {
    if (!product) return [];
    if (product.tiers && product.tiers.length > 0) return product.tiers;
    if (product.isBundle || product.code?.startsWith('PROMO-')) {
      return getBundleTiers(product);
    }
    return [];
  }, [product]);

  const [selectedTierId, setSelectedTierId] = useState(() => {
    if (bundleTiers.length > 0) {
      const rec = bundleTiers.find(t => t.isPopular || t.id === 'pro');
      return rec ? rec.id : bundleTiers[0].id;
    }
    return 'pro';
  });

  const activeTier = useMemo(() => {
    if (bundleTiers.length === 0) return null;
    return bundleTiers.find(t => t.id === selectedTierId) || bundleTiers[0];
  }, [bundleTiers, selectedTierId]);

  const basePrice = activeTier ? activeTier.price : product.price;
  const regularPrice = activeTier ? (activeTier.regularPrice || Math.round(activeTier.price * 1.25)) : product.regularPrice;
  const savings = activeTier ? (activeTier.savings || (regularPrice - basePrice)) : product.savings;

  const effectivePrice = (isFlashDeal && basePrice)
    ? Math.round(basePrice * (1 - currentDiscount / 100))
    : basePrice;

  const handleAdd = () => {
    playCoinSound();
    const couponToUse = activeCoupon || localStorage.getItem('artesano_active_coupon');
    const selectedLevelVariant = activeTier ? { 'Nivel': activeTier.name } : {};
    onAddToCart({
      product: {
        ...product,
        price: effectivePrice,
        regularPrice: regularPrice,
        savings: savings,
        flashDealApplied: isFlashDeal
      },
      quantity,
      selectedVariants: { ...selectedVariants, ...selectedLevelVariant },
      customText: [
        customText,
        activeTier ? `Nivel: ${activeTier.name}` : null,
        isFlashDeal ? `Aprovechó ${productTime?.durationLabel || 'Oferta Flash'} (-${currentDiscount}%)` : null,
        couponToUse ? `Cupón Arcade: ${couponToUse}` : null
      ].filter(Boolean).join(' | ')
    });
  };

  const handleDirectWhatsApp = () => {
    playCoinSound();
    const couponToUse = activeCoupon || localStorage.getItem('artesano_active_coupon');
    const selectedLevelVariant = activeTier ? { 'Nivel': activeTier.name } : {};
    onDirectWhatsAppQuote({
      product: {
        ...product,
        price: effectivePrice,
        regularPrice: regularPrice,
        savings: savings
      },
      quantity,
      selectedVariants: { ...selectedVariants, ...selectedLevelVariant },
      customText: [
        customText,
        activeTier ? `Nivel seleccionado: ${activeTier.name}` : null,
        isFlashDeal ? `Precio especial ${productTime?.durationLabel || 'Oferta Flash'}: $${effectivePrice} MXN` : null,
        couponToUse ? `Cupón de Descuento Arcade aplicado: [${couponToUse}]` : null
      ].filter(Boolean).join(' | ')
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fade-in overscroll-contain touch-pan-y"
      onClick={handleSafeClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-t sm:border border-[#E8E4DA] sm:my-auto max-h-[92vh] sm:max-h-[94vh] flex flex-col overscroll-contain touch-pan-y"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#FBF9F5]">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-gray-100 bg-[#FBF9F5] shrink-0">
          <div className="flex items-center gap-2.5">
            {/* SKU de Taller oculto al cliente final por requerimiento pero accesible en sistema interno */}
            <span className="hidden" data-sku={product.sku || product.code} title={product.sku ? `SKU de Taller: ${product.sku}` : `Código: ${product.code}`}>
              {product.sku || product.code}
            </span>
            <span className="text-xs text-gray-500 font-medium capitalize">
              Área {product.worlds?.join(' / ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-[#1F2421] hover:bg-white rounded-full transition-colors text-xs flex items-center gap-1.5 border border-transparent hover:border-gray-200"
              title="Compartir producto"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? '¡Enlace copiado!' : 'Compartir'}</span>
            </button>
            <button
              onClick={handleSafeClose}
              className="p-2 text-gray-400 hover:text-[#1F2421] hover:bg-white rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={modalScrollRef} className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overscroll-contain touch-pan-y">
          {/* Oferta Flash 2h Banner */}
          {isFlashDeal && (
            <TemuUrgencyModule
              product={product}
              flashDeal={flashDeal}
              variant="modal"
              onAction={() => onOpenCalculator ? onOpenCalculator(product) : handleDirectWhatsApp()}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Gallery Column (6 cols on lg) — Mercado Libre Style */}
            <div className="lg:col-span-6 space-y-3.5">
              
              {/* Main Photo Container */}
              <div 
                onContextMenu={(e) => e.preventDefault()}
                className="relative rounded-2xl overflow-hidden bg-white border border-[#E8E4DA] aspect-square shadow-xs group flex items-center justify-center select-none"
              >
                
                {/* Active Main Image con Protección Anti-Piratería */}
                <img
                  src={activeImage}
                  alt={`${product.name} - ${currentMeta.label}`}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`w-full h-full transition-all duration-300 select-none ${
                    activeIdx === 0 
                      ? 'object-cover' 
                      : 'object-contain p-2.5 sm:p-4 bg-white'
                  } ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                {/* Marca de Agua Sutil de Taller para Protección de Imagen */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-900/40 backdrop-blur-xs text-[9px] font-medium text-white/85 pointer-events-none select-none tracking-wide border border-white/10 shadow-xs">
                  <span className="text-[#D4A359]">✦</span>
                  <span>Artesano Digital</span>
                </div>

                {/* Top Right: Zoom / Expand button */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition-all active:scale-95"
                  title={isZoomed ? "Reducir zoom" : "Ampliar vista"}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Carousel Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 hover:bg-white text-[#1F2421] shadow-lg border border-gray-200 transition-all hover:scale-105 active:scale-95"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/85 hover:bg-white text-[#1F2421] shadow-lg border border-gray-200 transition-all hover:scale-105 active:scale-95"
                      aria-label="Siguiente foto"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Bottom Dot Indicators */}
                {gallery.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                    {gallery.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          activeIdx === i ? 'w-5 bg-[#2D4F3E]' : 'w-1.5 bg-black/25'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 4 Miniaturas con Iconos Sobrios y Discretos (Hoja en blanco para Fondo Blanco) */}
              {gallery.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gallery.map((imgUrl, idx) => {
                    const isSelected = activeIdx === idx;
                    const getSlotBadge = (i) => {
                      if (i === 0) return { label: '1. En contexto', Icon: Eye };
                      if (i === 1) return { label: '2. Fondo blanco', Icon: FileText };
                      if (i === 2) return { label: '3. Detalle', Icon: ZoomIn };
                      if (i === 3) return { label: product.isBundle ? '4. Combo' : '4. Medidas', Icon: product.isBundle ? Layers : Ruler };
                      return { label: `Foto ${i + 1}`, Icon: FileText };
                    };
                    const slotInfo = getSlotBadge(idx);
                    const SlotIcon = slotInfo.Icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveIdx(idx);
                          setIsZoomed(false);
                        }}
                        className={`p-1.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-left ${
                          isSelected
                            ? 'border-[#2D4F3E] bg-[#F4F0E8] ring-1 ring-[#2D4F3E]'
                            : 'border-[#E8E4DA] bg-white hover:border-gray-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div 
                          onContextMenu={(e) => e.preventDefault()}
                          className="w-full h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-gray-100 select-none"
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            className={`w-full h-full select-none pointer-events-none ${idx === 0 ? 'object-cover' : 'object-contain p-1'}`}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-1.5 w-full px-0.5">
                          <SlotIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#2D4F3E]' : 'text-gray-400'}`} />
                          <span className={`text-[10px] font-bold truncate ${
                            isSelected ? 'text-[#2D4F3E]' : 'text-gray-600'
                          }`}>
                            {slotInfo.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Guarantees Box & Realistic Craftsmanship Expectation */}
              <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E8E4DA] space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-[#2D4F3E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1F2421]">Fotografías y vistas 3D de referencia artesanal</span>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Las imágenes y modelos son aproximaciones visuales. Debido a la naturaleza de los materiales (vetas de madera, filamentos y acabados) y la iluminación de pantalla, los tonos y texturas finales pueden presentar sutiles variaciones únicas.
                    </p>
                  </div>
                </div>
                {product.specifications?.estimatedLeadTime && (
                  <div className="flex items-center gap-2 text-gray-700 pt-2 border-t border-[#E8E4DA]/80">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Tiempo de producción: <strong>{product.specifications.estimatedLeadTime}</strong></span>
                  </div>
                )}
              </div>


            </div>

            {/* Product Details & Actions Column (6 cols on lg) */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                  {product.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {product.fullDescription || product.shortDescription}
                </p>
              </div>

              {/* LEYENDA DISTINTIVA: Todo puede ser PERSONALIZABLE · Si lo piensas, se hace */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#F4F0E8] via-[#FAF7F0] to-[#EAE4D7] border border-[#D4A359]/40 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2D4F3E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#D4A359]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#1F2421]">
                      Todo puede ser <span className="text-[#9E472A] bg-amber-100/80 px-1.5 py-0.5 rounded-md font-black">PERSONALIZABLE</span>
                    </span>
                  </div>
                  <p className="text-[10.5px] sm:text-[11.5px] text-[#2D4F3E] font-bold italic tracking-tight mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D4A359] inline" />
                    <span>Si lo piensas, se hace</span>
                    <span className="text-gray-400 font-normal not-italic text-[10px] hidden sm:inline">· Taller de Fabricación Artesano</span>
                  </p>
                </div>
              </div>

              {/* Price Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isFlashDeal 
                  ? 'bg-gradient-to-r from-[#FAF7F0] to-[#FFF8F5] border-[#D4A359] ring-2 ring-[#D4A359]/20' 
                  : 'bg-[#F4F0E8] border-[#E8E4DA]'
              }`}>
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
                    {isFlashDeal ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#9E472A] text-white text-[10px] font-black flex items-center gap-1 animate-pulse">
                        <Zap className="w-3 h-3 text-white inline" />
                        <span>PRECIO {productTime?.durationLabel || 'FLASH'}</span>
                      </span>
                    ) : (
                      <span>{product.priceType === 'quote' ? 'Modalidad' : product.priceType === 'starting_at' ? 'Precio base desde' : 'Precio del paquete'}</span>
                    )}

                    {isFlashDeal ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E5D7B7] text-[#9E472A] text-[10px] font-black">
                        -{flashDeal?.discountPercent || 20}% DE DESCUENTO
                      </span>
                    ) : product.savings ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#D82B6E] text-white text-[10px] font-black">
                        Ahorro de ${product.savings} MXN
                      </span>
                    ) : null}
                  </div>

                  {(isFlashDeal || product.regularPrice) && (
                    <div className="text-xs text-gray-400 line-through font-semibold mt-0.5">
                      Precio regular: ${isFlashDeal ? product.price : product.regularPrice} MXN
                    </div>
                  )}

                  <div className={`text-2xl sm:text-3xl font-black font-heading mt-0.5 ${isFlashDeal ? 'text-[#9E472A]' : 'text-[#1F2421]'}`}>
                    {product.priceType === 'quote' || product.price === null ? (
                      <span className="text-[#2D4F3E]">A cotizar por proyecto</span>
                    ) : (
                      <>
                        ${effectivePrice} <span className="text-xs font-normal text-gray-500">MXN {product.priceUnit && `(${product.priceUnit})`}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    isFlashDeal 
                      ? 'bg-[#FAF7F0] border border-[#D4A359] text-[#9E472A] font-bold' 
                      : 'bg-white border border-[#E8E4DA] text-gray-700'
                  }`}>
                    {isFlashDeal ? 'Oferta flash activa' : product.isBundle ? 'Paquete en promoción' : product.availability === 'in_stock' ? 'En existencia' : 'Bajo pedido personalizado'}
                  </span>
                </div>
              </div>

              {/* Despliegue de los 3 Paquetes / Niveles de Taller en Ventana Emergente */}
              {bundleTiers.length > 0 ? (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FAF8F4] to-[#F5ECE0] border-2 border-[#D4A359]/70 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#7A4B1D]">
                      <Layers className="w-4 h-4 text-[#D4A359]" />
                      <span>Elige tu Nivel de Paquete:</span>
                    </div>
                    <span className="text-[10.5px] font-bold text-stone-600 bg-white/80 px-2 py-0.5 rounded-full border border-[#D4A359]/30">
                      3 opciones de taller
                    </span>
                  </div>

                  {/* Selector interactivo de los 3 niveles con estética de Combo Comercial */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {bundleTiers.map(tier => {
                      const isSelected = activeTier?.id === tier.id;
                      const isPro = tier.id === 'pro';
                      const isMaestra = tier.id === 'maestra';
                      const priceDiff = tier.price - (bundleTiers[0]?.price || tier.price);

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            playCoinSound();
                            setSelectedTierId(tier.id);
                          }}
                          className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? isPro
                                ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                                : isMaestra
                                ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                                : 'bg-white border-stone-800 ring-2 ring-stone-800/20 shadow-md'
                              : 'bg-white/80 hover:bg-white border-stone-200'
                          }`}
                        >
                          {/* Badge superior distintivo de cada nivel sin medallas emoji */}
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isPro
                                ? 'bg-[#2D4F3E] text-white shadow-2xs'
                                : isMaestra
                                ? 'bg-amber-700 text-white shadow-2xs'
                                : 'bg-stone-200 text-stone-700'
                            }`}>
                              {isPro ? 'Más Conveniente' : isMaestra ? 'Todo Incluido' : 'Kit Base'}
                            </span>

                            {priceDiff > 0 && (
                              <span className="text-[9.5px] font-bold text-emerald-700 font-mono">
                                +${priceDiff}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="text-xs font-black text-[#1F2421] leading-tight mt-0.5">
                              {tier.name.replace('Nivel ', '')}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                              {tier.summary}
                            </p>
                          </div>

                          <div className="mt-2.5 pt-1.5 border-t border-gray-100 flex items-baseline justify-between">
                            <span className="text-sm font-black text-[#1F2421] font-mono">
                              ${tier.price} <span className="text-[9px] font-normal text-gray-400">MXN</span>
                            </span>
                            {tier.savings ? (
                              <span className="text-[9.5px] text-emerald-800 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                Ahorro ${tier.savings}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalle y desglose de piezas del combo seleccionado */}
                  {activeTier && activeTier.includedItems && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#E8DFC8] space-y-3 shadow-xs">
                      {/* Banner de conveniencia según el nivel */}
                      {activeTier.id === 'pro' ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-950 shadow-2xs">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Combo Recomendado: ¡Incluye el kit base más piezas adicionales!</span>
                          </span>
                          <span className="bg-emerald-700 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                            Mejor Valor
                          </span>
                        </div>
                      ) : activeTier.id === 'maestra' ? (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs font-bold text-amber-950 shadow-2xs">
                          <span className="flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Paquete Completo VIP: Máximo ahorro y acabados artesanales de lujo</span>
                          </span>
                          <span className="bg-amber-700 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                            Todo Incluido
                          </span>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#7A4B1D]">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#D4A359]" />
                          <span>Piezas incluidas en {activeTier.name}:</span>
                        </div>
                        {activeTier.includedItems.some(i => i.startsWith('+')) && (
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            + Piezas extra destacadas en verde
                          </span>
                        )}
                      </div>

                      <ul className="space-y-1.5 text-xs">
                        {activeTier.includedItems.map((item, idx) => {
                          const isAdded = item.startsWith('+');
                          return (
                            <li
                              key={idx}
                              className={`flex items-start gap-2 rounded-xl p-2 transition-colors ${
                                isAdded
                                  ? 'bg-emerald-50/90 border border-emerald-200 text-emerald-950 font-bold shadow-2xs'
                                  : 'text-gray-700 bg-stone-50/60 border border-stone-100'
                              }`}
                            >
                              {isAdded ? (
                                <span className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                  +
                                </span>
                              ) : (
                                <Check className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <span className="leading-snug block">{item.replace(/^\+\s*/, '')}</span>
                                {isAdded && (
                                  <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                                    Pieza adicional agregada a este paquete
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      {activeTier.extraBenefits && activeTier.extraBenefits.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                          {activeTier.extraBenefits.map((b, i) => (
                            <span key={i} className="text-[10px] font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (product.includedItems && product.includedItems.length > 0) ? (
                <div className="p-4 rounded-2xl bg-[#FFF9FB] border border-[#F4D6E2] space-y-2">
                  <div className="flex items-center gap-2 text-[#D82B6E] font-bold text-xs uppercase tracking-wider">
                    <Package className="w-4 h-4" />
                    <span>Piezas incluidas en esta promoción:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {product.includedItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3.5 pt-1">
                  {product.variants.map(variant => {
                    const isColorVariant = /color|acento|tono/i.test(variant.name);
                    const availableOptions = isFlashDeal 
                      ? variant.options.filter(opt => !opt.toLowerCase().includes('personalizad'))
                      : variant.options;
                    const finalOptions = availableOptions.length > 0 ? availableOptions : variant.options;

                    return (
                      <div key={variant.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{variant.name}:</span>
                            {isColorVariant && selectedVariants[variant.name] && (
                              <span className="text-[#2D4F3E] font-black normal-case text-xs bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                {selectedVariants[variant.name]}
                              </span>
                            )}
                          </label>
                          {isColorVariant && (
                            <span className="text-[10.5px] text-gray-400 font-medium">
                              {finalOptions.length} {finalOptions.length === 1 ? 'opción' : 'opciones'}
                            </span>
                          )}
                        </div>

                        {/* Circulitos de color para variantes de color */}
                        {isColorVariant ? (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {finalOptions.map(opt => {
                              const isSelected = selectedVariants[variant.name] === opt;
                              const swatch = getFilamentColor(opt);
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleVariantChange(variant.name, opt)}
                                  className={`group/c relative p-0.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                                    isSelected
                                      ? 'ring-2 ring-[#2D4F3E] ring-offset-2 scale-110 shadow-xs'
                                      : 'hover:scale-110 hover:ring-2 hover:ring-gray-300'
                                  }`}
                                  title={opt}
                                >
                                  <span
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/20 shadow-2xs flex items-center justify-center transition-transform"
                                    style={{
                                      background: swatch?.css || '#D1D5DB',
                                      borderColor: swatch?.border || '#9CA3AF',
                                      boxShadow: swatch?.glow ? '0 0 8px rgba(110, 231, 183, 0.9)' : undefined
                                    }}
                                  >
                                    {isSelected && (
                                      <span className={`text-[11px] font-black ${
                                        isDarkColor(swatch)
                                          ? 'text-white drop-shadow-sm'
                                          : 'text-gray-900'
                                      }`}>
                                        ✓
                                      </span>
                                    )}
                                  </span>
                                  {/* Tooltip con nombre de color */}
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/c:block z-30 px-2 py-0.5 text-[10px] font-bold text-white bg-black/90 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                                    {opt}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Botones tipo pill para otras variantes (medida, drenaje, etc.) */
                          <div className="flex flex-wrap gap-2">
                            {finalOptions.map(opt => {
                              const isSelected = selectedVariants[variant.name] === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleVariantChange(variant.name, opt)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-xs'
                                      : 'bg-white text-gray-700 border-[#E8E4DA] hover:bg-gray-50'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {product.techniques?.includes('3d') && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2D4F3E]/5 border border-[#2D4F3E]/15 text-[11.5px] text-[#2D4F3E]">
                      <Sparkles className="w-4 h-4 text-[#2D4F3E] shrink-0" />
                      <span>
                        <strong>Gama abierta de filamentos 3D:</strong> Contamos con amplia variedad de colores (mate, seda, madera o translúcido). Si requieres un tono personalizado, elígelo en la lista o indícalo en tu pedido.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Personalización Opcional Secundaria (Plegable para agilizar la compra) */}
              {!isFlashDeal ? (
                <div className="pt-0.5">
                  {!showPersonalizationInput && !customText ? (
                    <button
                      type="button"
                      onClick={() => setShowPersonalizationInput(true)}
                      className="text-xs font-semibold text-[#2D4F3E] hover:text-[#20392C] flex items-center justify-between py-2 px-3.5 rounded-xl border border-dashed border-[#2D4F3E]/40 hover:bg-emerald-50/50 transition-all cursor-pointer w-full bg-[#FAF9F5]/60"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>¿Deseas personalizar esta pieza con grabado o logo? (Opcional)</span>
                      </span>
                      <span className="text-[11px] text-[#2D4F3E] font-black">+ Agregar</span>
                    </button>
                  ) : (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                          <span>Detalles de personalización (opcional):</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPersonalizationInput(false);
                            setCustomText('');
                          }}
                          className="text-[10.5px] text-gray-400 hover:text-rose-600 cursor-pointer"
                        >
                          Quitar personalización
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Ej: Grabar nombre 'Familia Pérez', fecha 24-Octubre o tono especial..."
                        value={customText}
                        onChange={e => setCustomText(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#2D4F3E] focus:outline-none bg-white"
                        autoFocus
                      />

                      {/* Selector de Paletas de Taller (Más de 30 variedades con pestañita para contraer/mostrar más) */}
                      <div className="pt-2 border-t border-gray-200/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-700 font-semibold">
                          <span className="flex items-center gap-1.5 text-[#1F2421]">
                            <span>Tonos oscuros de taller y acabados especiales:</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black">
                              {ALL_WORKSHOP_COLORS.length} colores
                            </span>
                          </span>
                          
                          {/* Pestañita para contraer o mostrar más colores */}
                          <button
                            type="button"
                            onClick={() => setIsPaletteExpanded(prev => !prev)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-[#2D4F3E] bg-[#E8EFEA] hover:bg-[#D5E3DA] transition-colors cursor-pointer border border-[#2D4F3E]/20"
                          >
                            <span>{isPaletteExpanded ? '▲ Contraer' : '▼ Mostrar más colores'}</span>
                          </button>
                        </div>

                        {/* Barra de pestañitas por categoría si está expandido */}
                        {isPaletteExpanded && (
                          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
                            <button
                              type="button"
                              onClick={() => setActivePaletteGroup('todos')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                activePaletteGroup === 'todos'
                                  ? 'bg-white text-gray-900 shadow-2xs font-black'
                                  : 'text-gray-500 hover:text-gray-800'
                              }`}
                            >
                              Todos ({ALL_WORKSHOP_COLORS.length})
                            </button>
                            {WORKSHOP_COLOR_PALETTES.map(group => (
                              <button
                                key={group.id}
                                type="button"
                                onClick={() => setActivePaletteGroup(group.id)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  activePaletteGroup === group.id
                                    ? 'bg-white text-gray-900 shadow-2xs font-black'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                              >
                                {group.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Cuadrícula de colores: Si está contraído muestra los primeros 8 esenciales, si está expandido muestra el grupo activo */}
                        {(() => {
                          const displayColors = isPaletteExpanded
                            ? (activePaletteGroup === 'todos'
                                ? ALL_WORKSHOP_COLORS
                                : (WORKSHOP_COLOR_PALETTES.find(g => g.id === activePaletteGroup)?.colors || ALL_WORKSHOP_COLORS))
                            : ALL_WORKSHOP_COLORS.slice(0, 8);

                          return (
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                                {displayColors.map(colorName => {
                                  const swatch = getFilamentColor(colorName);
                                  const isIncluded = customText.includes(colorName);
                                  const isDark = isDarkColor(swatch);
                                  return (
                                    <button
                                      key={colorName}
                                      type="button"
                                      onClick={() => {
                                        if (isIncluded) {
                                          setCustomText(customText.replace(new RegExp(`(,\\s*)?Color preferido: ${colorName}`, 'g'), '').trim());
                                        } else {
                                          const prefix = customText.trim() ? `${customText.trim()} | ` : '';
                                          setCustomText(`${prefix}Color preferido: ${colorName}`);
                                        }
                                      }}
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                        isIncluded
                                          ? 'bg-[#1F2421] text-amber-200 border-[#D4A359] shadow-xs ring-1 ring-[#D4A359]/50'
                                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                      }`}
                                      title={`Aplicar acabado ${colorName}`}
                                    >
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0 shadow-2xs"
                                        style={{ background: swatch?.css || '#1F2421' }}
                                      />
                                      <span>{colorName}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {!isPaletteExpanded && (
                                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                                  <span>Mostrando 8 esenciales de taller</span>
                                  <button
                                    type="button"
                                    onClick={() => setIsPaletteExpanded(true)}
                                    className="text-[#2D4F3E] font-bold hover:underline cursor-pointer"
                                  >
                                    Ver los {ALL_WORKSHOP_COLORS.length - 8} colores restantes →
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E8E4DA] flex items-start gap-3 text-xs text-gray-600 select-none shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-[#9E472A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-[#9E472A]" />
                  </span>
                  <div>
                    <span className="font-bold text-[#1F2421] block">
                      Personalización desactivada para Ofertas Flash
                    </span>
                    <span className="text-[11.5px] text-gray-500 leading-relaxed block mt-0.5">
                      Las piezas con precio especial flash corresponden a lotes estándar de entrega inmediata de taller, por lo que no admiten grabado ni modificaciones personalizadas.
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Cantidad:
                </label>
                <div className="flex items-center border border-[#E8E4DA] rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      const min = product.specifications?.minQuantity || 1;
                      if (quantity > min) {
                        playMarioPowerDownSound();
                        setQuantity(q => q - 1);
                      }
                    }}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-sm transition-colors cursor-pointer"
                    title="Disminuir cantidad"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-[#1F2421] min-w-[36px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playCoinSound();
                      setQuantity(q => q + 1);
                    }}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-sm transition-colors cursor-pointer"
                    title="Aumentar cantidad"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
                {product.specifications?.minQuantity > 1 && (
                  <span className="text-[11px] text-gray-500 italic">
                    (Mínimo {product.specifications.minQuantity} piezas)
                  </span>
                )}
              </div>

              {/* Brand Scarcity & Demand Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF7F0] to-[#F5ECE0] border border-[#E5D7B7] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#9E472A]">
                    <span className="w-2 h-2 rounded-full bg-[#9E472A] animate-ping"></span>
                    <span>LOTE CON PRECIO PREFERENCIAL</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#8C3B1E] bg-[#EFE6D5] px-2 py-0.5 rounded-full">
                    Solo quedan {((product.id.charCodeAt(0) * 3) % 4) + 2} disponibles
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span>88% de la capacidad de producción asignada</span>
                  <span className="font-bold text-[#1F2421]">4 personas viendo ahora</span>
                </div>

                <div className="w-full bg-[#EFE6D5] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#D4A359] via-[#C28E38] to-[#9E472A] h-1.5 rounded-full" 
                    style={{ width: '88%' }}
                  ></div>
                </div>
              </div>

              {/* Taller en Pausa / Aviso de Cobertura */}
              {settings?.serviceStatus?.isPaused && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1 shadow-2xs">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Taller en receso hasta el {formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso'}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {settings.serviceStatus.pausedCustomMessage || 'Reanudamos servicio en esa fecha. Puedes cotizar tu pieza hoy mismo y quedará agendada con prioridad.'}
                  </p>
                </div>
              )}

              {!settings?.serviceStatus?.isPaused && (settings?.serviceStatus?.localService === false || settings?.serviceStatus?.nationalService === false) && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    {settings.serviceStatus.localService && !settings.serviceStatus.nationalService
                      ? 'Servicio activo solo para entregas locales y taller en SLP. Envíos nacionales en pausa.'
                      : !settings.serviceStatus.localService && settings.serviceStatus.nationalService
                      ? 'Envíos nacionales activos a toda la República. Entregas locales temporalmente no disponibles.'
                      : 'Entregas en pausa temporalmente.'}
                  </span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Cotizar a la izquierda con color verde oliva */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCalculator) {
                      onOpenCalculator(product);
                    } else {
                      handleDirectWhatsApp();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#2D4F3E] text-white text-sm font-bold hover:bg-[#20392C] active:scale-98 transition-all shadow-md cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Cotizar</span>
                </button>

                {/* Hacer pedido a la derecha con color verde normal */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] active:scale-98 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Hacer pedido</span>
                </button>
              </div>

              {/* Acceso Discreto a Mini-Juego de Taller (Ubicado después de la decisión de compra) */}
              {(settings?.arcadeConfig?.enabled !== false) && (
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold text-[#1F2421] block leading-none">
                          Mini-Juegos de Taller
                        </span>
                        <span className="text-[10.5px] text-gray-500 leading-tight">
                          Juega mientras cotizamos y gana cupones de descuento
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-mono font-bold" title="Fichas de juego disponibles">
                        <Gamepad2 className="w-3 h-3 text-emerald-700" />
                        <span>{arcadeCredits}/5</span>
                        {arcadeCredits < 5 && (
                          <span className="font-normal ml-0.5 text-[9.5px]">({refillTimeFormatted})</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10.5px] font-mono font-bold" title="Puntos ganados">
                        <Coins className="w-3 h-3 text-amber-700" />
                        <span>{arcadeCoins}</span>
                      </span>
                    </div>
                  </div>

                  {/* Cupón activo si ya lo canjeó */}
                  {activeCoupon && (
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-100/70 border border-emerald-300 text-[10.5px] text-emerald-900 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Cupón aplicado: <strong>{activeCoupon}</strong></span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-normal">Se enviará en tu pedido</span>
                    </div>
                  )}

                  {/* Botones de Acción Sutiles */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {arcadeCredits === 0 && arcadeCoins >= 2 && (
                      <button
                        type="button"
                        onClick={() => exchangeCoinsForCredits(2, 1)}
                        className="py-1.5 px-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-all cursor-pointer border border-amber-300 shrink-0 flex items-center gap-1"
                        title="Canjear 2 puntos por 1 ficha al instante"
                      >
                        <Repeat className="w-3 h-3 text-amber-800" /> Canjear 2 pts por 1 ficha
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenArcade) {
                          onOpenArcade('play');
                        } else {
                          setActiveArcadeGame('dino');
                          setArcadeTab('play');
                          setIsArcadeOpen(true);
                        }
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Jugar (1 ficha)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenArcade) {
                          onOpenArcade('rewards');
                        } else {
                          setArcadeTab('rewards');
                          setIsArcadeOpen(true);
                        }
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>Canjear Cupones</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Technical Specifications Accordion / Grid */}
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-stone-500" />
                  <span>Ficha técnica y especificaciones:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA]/80">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">SKU de Taller</span>
                    <span className="font-mono font-bold text-stone-800">{product.sku || product.code}</span>
                  </div>
                  {product.specifications?.dimensions && (
                    <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA]/80">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Medidas / Dimensiones</span>
                      <span className="font-semibold text-stone-800">{product.specifications.dimensions}</span>
                    </div>
                  )}
                  {product.specifications?.material && (
                    <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA]/80">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Material</span>
                      <span className="font-semibold text-stone-800">{product.specifications.material}</span>
                    </div>
                  )}
                  {product.specifications?.finish && (
                    <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA]/80">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Acabado</span>
                      <span className="font-semibold text-stone-800">{product.specifications.finish}</span>
                    </div>
                  )}
                  {product.specifications?.includes && (
                    <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA]/80">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Qué incluye</span>
                      <span className="font-semibold text-stone-800">{product.specifications.includes}</span>
                    </div>
                  )}
                  {product.specifications?.careNotes && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-[#F8F7F4] border border-[#E8E4DA]/80">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Cuidados recomendados</span>
                      <span className="text-stone-700">{product.specifications.careNotes}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Más productos que te pueden gustar (Sugerencias continuas al scrolear hasta abajo) */}
          {suggestedProducts.length > 0 && (
            <div className="pt-8 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1F2421] font-heading flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-stone-500" />
                    <span>Más creaciones del taller que te pueden interesar</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Continúa explorando piezas de taller sin salirte de la tienda
                  </p>
                </div>
                <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                  {suggestedProducts.length} productos
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {suggestedProducts.slice(0, 8).map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(rel);
                      }
                      setActiveIdx(0);
                      modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="cursor-pointer group p-2.5 sm:p-3 rounded-2xl border border-gray-200 hover:border-[#2D4F3E] transition-all bg-white hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-2.5">
                        <img
                          src={rel.primaryImage}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{rel.code}</div>
                      <div className="text-xs font-bold text-gray-800 line-clamp-2 mt-0.5 leading-snug group-hover:text-[#2D4F3E] transition-colors">{rel.name}</div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-[#1F2421] font-mono">
                        {rel.price ? `$${rel.price} MXN` : 'A cotizar'}
                      </span>
                      <span className="text-[10.5px] font-bold text-[#2D4F3E] group-hover:underline">
                        Ver →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Mobile Sticky Bottom Action Bar (Thumb-friendly CTA like Mercado Libre) */}
        <div className="sm:hidden border-t border-gray-200 bg-white/98 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-lg z-20">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">
              {product.priceType === 'quote' ? 'Modalidad' : 'Precio'}
            </span>
            <span className="text-base font-black text-[#1F2421] font-heading mt-0.5">
              {product.priceType === 'quote' || product.price === null ? (
                <span className="text-[#2D4F3E] text-xs">A cotizar</span>
              ) : (
                `$${effectivePrice} MXN`
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenCalculator) {
                  onOpenCalculator(product);
                } else {
                  handleDirectWhatsApp();
                }
              }}
              className="px-3.5 py-2.5 rounded-full bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Cotizar</span>
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2.5 rounded-full bg-[#16A34A] text-white text-xs font-black hover:bg-[#15803D] active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pedir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Arcade de Juegos y Canje de Monedas */}
      {isArcadeOpen && (
        <WorkshopArcadeModal
          isOpen={isArcadeOpen}
          onClose={handleArcadeClose}
          initialGame={activeArcadeGame}
          initialTab={arcadeTab}
          arcadeConfig={settings?.arcadeConfig}
          activeTheme={settings?.arcadeConfig?.activeTheme || 'clasico'}
        />
      )}
    </div>
  );
}
