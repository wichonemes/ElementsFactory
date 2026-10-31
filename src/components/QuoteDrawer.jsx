import React, { useState, useEffect } from 'react';
import {
  X, Trash2, MessageCircle, Copy, Check, ShoppingBag, ArrowRight,
  Info, Calendar, MapPin, User, Truck, AlertTriangle, Zap, Tag, Sparkles, RotateCcw,
  Paintbrush, FileText, Gift, Ticket, Coins, Download, Loader2, Mail, Phone, Eye
} from 'lucide-react';
import { formatServiceDate } from '../utils/serviceStatus';
import { findCoupon, calculateCouponDiscount, getCouponCategory, getCouponCategoryLabel, isCouponExpired } from '../utils/couponsHelper';
import { playCoinSound, playRandomOrderCelebrationSound, playMarioPowerDownSound } from '../utils/soundEffects';
import { buildQuoteFolio, downloadQuotePdf, formatQuoteMoney } from '../utils/quotePdf';

export default function QuoteDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  onTrackWhatsApp,
  onOpenArcade,
  onSelectProduct
}) {
  if (!isOpen) return null;

  // Modo de Compra: 'direct' (Compra Directa Inmediata) | 'quote' (Cotización Personalizada)
  const [checkoutMode, setCheckoutMode] = useState('direct');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cityZip, setCityZip] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [taxMode, setTaxMode] = useState('included');
  const [quoteFolio, setQuoteFolio] = useState(() => buildQuoteFolio());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [copied, setCopied] = useState(false);

  // Cada nuevo carrito recibe un folio nuevo para la cotización.
  useEffect(() => {
    if (items.length === 0) setQuoteFolio(buildQuoteFolio());
  }, [items.length]);

  // Cupones activos cargados desde el servidor con fallback estático
  const [serverCoupons, setServerCoupons] = useState([]);
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await fetch('/api/coupons');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return setServerCoupons(data);
        }
      } catch (_) {}
      try {
        const res = await fetch('./api/coupons.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return setServerCoupons(data);
        }
      } catch (_) {}
    };
    loadCoupons();
  }, []);

  // Cupón y Código de Descuento
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(() => {
    try {
      return localStorage.getItem('artesano_active_coupon') || '';
    } catch {
      return '';
    }
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [isChangingCoupon, setIsChangingCoupon] = useState(false);
  const [isJustApplied, setIsJustApplied] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState([]);

  // Campaña o referencia
  const [campaignRef] = useState(() => {
    try {
      return localStorage.getItem('artesano_active_pub') || '';
    } catch {
      return '';
    }
  });

  // Sintetizador Web Audio para sonido retro de monedita de Mario (B5 -> E6)
  const playMarioCoinSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5 (987.77 Hz)
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6 (1318.51 Hz)
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  };

  // Manejador interactivo estilo monedita de Mario al cliquear el cupón en el carrito
  const handleCouponCardClick = (e) => {
    playMarioCoinSound();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const newCoin = {
      id: Date.now() + Math.random(),
      x: Math.max(20, Math.min(rect.width - 20, clickX)),
      text: '+1'
    };
    setFloatingCoins(prev => [...prev, newCoin]);
    setTimeout(() => {
      setFloatingCoins(prev => prev.filter(c => c.id !== newCoin.id));
    }, 900);
  };

  // Cálculo de Subtotales
  let hasPendingQuotes = false;
  let subtotal = 0;

  items.forEach(item => {
    if (item.product.priceType === 'quote' || item.product.price === null) {
      hasPendingQuotes = true;
    } else {
      subtotal += (item.product.price || 0) * item.quantity;
    }
  });

  // Lista combinada de cupones incluyendo los cupones del backend, cupones personalizados y los tiers de arcade
  const combinedCustomCoupons = [
    ...(serverCoupons || []),
    ...(settings?.discountCoupons || []),
    ...(settings?.arcadeConfig?.discountTiers?.map(t => ({
      code: t.code,
      category: 'arcade',
      type: t.discountPercent ? 'percent' : (t.discountAmount ? 'fixed' : 'percent'),
      value: t.discountPercent || t.discountAmount || 0,
      label: t.label,
      minPurchase: (t.minPurchase !== undefined && t.minPurchase !== null && t.minPurchase > 0)
        ? t.minPurchase
        : (t.discountAmount ? Math.max(200, Math.round(t.discountAmount * 3.5)) : (t.discountPercent >= 20 ? 350 : 0))
    })) || [])
  ];

  // Validar cupón activo contra la lista de cupones
  const activeCouponObj = appliedCouponCode ? findCoupon(appliedCouponCode, combinedCustomCoupons) : null;
  const couponCalculation = activeCouponObj ? calculateCouponDiscount(activeCouponObj, subtotal) : null;

  const discountAmount = couponCalculation?.isValid ? couponCalculation.discountAmount : 0;
  // Piso comercial: ningún total con productos puede quedar en $0 MXN
  const finalTotal = subtotal > 0
    ? (couponCalculation?.isValid ? couponCalculation.finalTotal : subtotal)
    : 0;

  // Desglose fiscal para la cotización. Por defecto los precios del catálogo ya incluyen IVA.
  const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const netBeforeDiscount = taxMode === 'included'
    ? roundMoney(subtotal / 1.16)
    : roundMoney(subtotal);
  const netDiscount = taxMode === 'included'
    ? roundMoney(discountAmount / 1.16)
    : roundMoney(discountAmount);
  const baseSubtotal = roundMoney(netBeforeDiscount - netDiscount);
  const ivaAmount = taxMode === 'included'
    ? roundMoney(finalTotal - baseSubtotal)
    : roundMoney(baseSubtotal * 0.16);
  const billableTotal = taxMode === 'included'
    ? roundMoney(finalTotal)
    : roundMoney(baseSubtotal + ivaAmount);
  const advanceAmount = roundMoney(billableTotal * 0.5);

  // Manejador para aplicar un nuevo código de descuento
  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    setCouponError('');
    setCouponSuccessMsg('');

    if (!couponInput.trim()) {
      setCouponError('Ingresa un código de descuento');
      return;
    }

    const found = findCoupon(couponInput, combinedCustomCoupons);
    if (!found) {
      setCouponError('Código no válido. Verifica que esté bien escrito o consulta con nosotros en WhatsApp.');
      return;
    }

    const calc = calculateCouponDiscount(found, subtotal);
    if (!calc.isValid) {
      setCouponError(calc.reason || 'Este código no aplica para el monto actual');
      return;
    }

    // Aplicar con éxito y disparar animación y sonido retro
    setAppliedCouponCode(found.code);
    setIsJustApplied(true);
    playMarioCoinSound();
    setTimeout(() => setIsJustApplied(false), 3500);

    try {
      localStorage.setItem('artesano_active_coupon', found.code);
    } catch {}
    setCouponSuccessMsg(`¡Código ${found.code} aplicado con éxito!`);
    setIsChangingCoupon(false);
    setCouponInput('');
  };

  // Manejador para quitar o cambiar el cupón
  const handleRemoveCoupon = () => {
    setAppliedCouponCode('');
    try {
      localStorage.removeItem('artesano_active_coupon');
    } catch {}
    setCouponError('');
    setCouponSuccessMsg('');
    setIsChangingCoupon(false);
    setIsJustApplied(false);
  };

  // Construcción del mensaje estructurado para WhatsApp con enlaces directos
  const buildWhatsAppMessage = () => {
    const isDirect = checkoutMode === 'direct';
    const cleanPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') : '';
    const baseUrl = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}${cleanPath}`
      : 'https://wichonemes.github.io/artesano';

    let msg = isDirect
      ? `*PEDIDO DIRECTO INMEDIATO — ARTESANO DIGITAL*\n`
      : `*SOLICITUD DE COTIZACIÓN — ARTESANO DIGITAL*\n`;

    msg += `--------------------------------------\n`;

    if (customerName.trim()) {
      msg += `• *Cliente:* ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      msg += `• *Teléfono / WhatsApp:* ${customerPhone.trim()}\n`;
    }
    if (customerEmail.trim()) {
      msg += `• *Correo:* ${customerEmail.trim()}\n`;
    }
    if (cityZip.trim()) {
      msg += `• *Ciudad / C.P. para entrega:* ${cityZip.trim()}\n`;
    }
    msg += `• *Folio de cotización:* ${quoteFolio}\n`;
    if (campaignRef.trim()) {
      msg += `• *Referencia:* ${campaignRef.trim()}\n`;
    }

    msg += `--------------------------------------\n`;
    msg += isDirect ? `*PRODUCTOS A COMPRAR (ESTÁNDAR):*\n\n` : `*PRODUCTOS A COTIZAR:*\n\n`;

    items.forEach((item, index) => {
      const p = item.product;
      const prodUrl = `${baseUrl}/?prod=${encodeURIComponent(p.code || p.id)}`;

      msg += `${index + 1}. *[${p.code}] ${p.name}*\n`;
      msg += `   • Cantidad: *${item.quantity} ${p.priceUnit || 'pza'}*\n`;

      if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
        const variantsStr = Object.entries(item.selectedVariants)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        msg += `   • Opciones: ${variantsStr}\n`;
      }

      if (item.customText && item.customText.trim()) {
        msg += `   • Personalización: "${item.customText.trim()}"\n`;
      } else if (isDirect) {
        msg += `   • Acabado: Estándar de taller (sin grabado)\n`;
      }

      if (p.priceType === 'quote' || p.price === null) {
        msg += `   • Precio: A convenir por proyecto\n`;
      } else {
        const lineTotal = p.price * item.quantity;
        msg += `   • Precio: $${p.price} c/u (Subtotal: $${lineTotal} MXN)\n`;
      }

      // Enlace directo a la pieza en tienda
      msg += `   • *Ver pieza:* ${prodUrl}\n`;

      // Enlace al modelo 3D en MakerWorld si es pieza 3D
      const is3D = p.techniques?.some(t => t === '3d' || t === 'impresion_3d' || t === '3d_printing') ||
                   p.worlds?.includes('3d') ||
                   (p.categories && p.categories.some(c => c.includes('3d') || c.includes('gamer') || c.includes('escritorio')));
      if (is3D) {
        const makerUrl = p.makerWorldUrl || `https://makerworld.com/en/search/models?keyword=${encodeURIComponent(p.name.replace(/[^a-zA-Z0-9 ]/g, ''))}`;
        msg += `   • *Modelo 3D MakerWorld:* ${makerUrl}\n`;
      }

      msg += `\n`;
    });

    msg += `--------------------------------------\n`;
    msg += `*Subtotal (sin IVA):* ${formatQuoteMoney(netBeforeDiscount)} MXN\n`;

    if (appliedCouponCode && discountAmount > 0) {
      const categoryLabel = activeCouponObj ? getCouponCategoryLabel(activeCouponObj) : 'Código Especial de Tienda';
      const benefitLabel = activeCouponObj?.label || activeCouponObj?.name || 'Descuento especial';
      msg += `*CUPÓN APLICADO:* ${appliedCouponCode}\n`;
      msg += `   • *Tipo:* ${categoryLabel}\n`;
      msg += `   • *Beneficio:* ${benefitLabel}\n`;
      msg += `   • *Ahorro otorgado:* -${formatQuoteMoney(discountAmount)} MXN\n`;
      msg += `*Subtotal con descuento:* ${formatQuoteMoney(baseSubtotal)} MXN\n`;
    }

    msg += `*${taxMode === 'included' ? 'IVA 16% incluido' : 'IVA 16%'}:* ${formatQuoteMoney(ivaAmount)} MXN\n`;
    msg += `*TOTAL:* ${formatQuoteMoney(billableTotal)} MXN\n`;
    msg += `*Anticipo 50%:* ${formatQuoteMoney(advanceAmount)} MXN\n`;
    msg += `*Saldo al entregar:* ${formatQuoteMoney(billableTotal - advanceAmount)} MXN\n`;

    if (hasPendingQuotes) {
      msg += `*(Piezas sin precio fijo se confirmarán en este chat)*\n`;
    }

    if (deliveryNotes.trim()) {
      msg += `\n*Notas de entrega:* ${deliveryNotes.trim()}\n`;
    }
    if (quoteNotes.trim()) {
      msg += `*Notas del proyecto:* ${quoteNotes.trim()}\n`;
    }

    if (isDirect) {
      msg += `\n_Modalidad: Compra directa rápida. Solicito cuenta para transferencia/pago y fecha de entrega._`;
    } else {
      msg += `\n_Solicito cotización detallada con tiempos de elaboración._`;
    }

    return msg;
  };

  const handleSendWhatsApp = () => {
    if (items.length === 0) return;
    playCoinSound();
    playRandomOrderCelebrationSound();

    // Monitoreo: Registrar uso de cupón en la base de datos del taller
    if (appliedCouponCode && discountAmount > 0) {
      try {
        fetch('/api/coupons/record-use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: appliedCouponCode,
            orderTotal: billableTotal,
            discountAmount,
            customerName: customerName.trim()
          })
        }).catch(() => {});
      } catch (e) {}
    }

    const text = buildWhatsAppMessage();
    const phone = (settings?.whatsappNumber || '5215500000000').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    if (onTrackWhatsApp) {
      onTrackWhatsApp({
        itemCount: items.length,
        subtotal: billableTotal,
        hasPendingQuotes,
        customerName: customerName.trim(),
        mode: checkoutMode,
        coupon: appliedCouponCode || null,
        couponCategory: activeCouponObj ? getCouponCategory(activeCouponObj) : 'store',
        discountAmount,
        taxMode,
        folio: quoteFolio
      });
    }

    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const text = buildWhatsAppMessage();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQuote = async () => {
    if (items.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfError('');
    playCoinSound();
    try {
      await downloadQuotePdf({
        items,
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          city: cityZip,
          notes: quoteNotes,
          deliveryNotes
        },
        settings,
        folio: quoteFolio,
        date: new Date(),
        taxMode,
        subtotal,
        baseSubtotal,
        discount: discountAmount,
        discountCode: appliedCouponCode,
        iva: ivaAmount,
        total: billableTotal,
        advance: advanceAmount,
        notes: quoteNotes
      });

      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote_pdf_downloaded',
          payload: {
            folio: quoteFolio,
            itemCount: items.length,
            total: billableTotal,
            taxMode
          }
        })
      }).catch(() => {});
    } catch (error) {
      console.error('No se pudo generar la cotización PDF', error);
      setPdfError('No se pudo generar el PDF. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E8E4DA]"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Top Grab Indicator */}
        <div className="sm:hidden pt-2.5 pb-0.5 flex justify-center bg-[#FBF9F5]">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header del Carrito */}
        <div className="p-4 sm:p-5 border-b border-[#E8E4DA] bg-[#FBF9F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2D4F3E] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1F2421] font-heading leading-tight">
                Mi Carrito de Compra
              </h3>
              <span className="text-[11px] text-gray-500">
                {items.length} {items.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  playMarioPowerDownSound();
                  onClearCart();
                }}
                className="text-xs text-gray-400 hover:text-rose-600 transition-colors p-1"
                title="Vaciar carrito"
              >
                Vaciar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector de Modalidad: Compra Directa vs Cotización */}
        {items.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200/80 shrink-0">
            <div className="grid grid-cols-2 p-1 bg-gray-200/80 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setCheckoutMode('direct')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  checkoutMode === 'direct'
                    ? 'bg-white text-[#2D4F3E] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Compra Directa (Rápido)</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckoutMode('quote')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  checkoutMode === 'quote'
                    ? 'bg-white text-[#2D4F3E] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5 text-[#2D4F3E]" />
                <span>Cotizar con Grabado</span>
              </button>
            </div>
          </div>
        )}

        {/* Contenido Desplazable del Carrito */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F4F0E8] text-[#2D4F3E] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800">Tu carrito está vacío</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  Agrega piezas de Hogar, Negocios o Eventos para pedir directamente o cotizar.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D4F3E] text-white text-xs font-semibold hover:bg-[#20392C] cursor-pointer"
                >
                  <span>Explorar productos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {settings?.mobileCatalogConfig?.enabled !== false && settings?.mobileCatalogConfig?.showInDrawer !== false && (
                  <a
                    href={`/api/catalog-pdf/download/primary?download=1`}
                    download={settings?.mobileCatalogConfig?.fileName || 'Catalogo_Movil_Artesano_Digital.pdf'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF9F5] text-[#2D4F3E] border border-[#2D4F3E]/20 text-xs font-bold hover:bg-[#2D4F3E]/10 cursor-pointer transition-all"
                    title={settings?.mobileCatalogConfig?.title || 'Descargar catálogo 9:16 para celular con enlaces MakerWorld'}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>{settings?.mobileCatalogConfig?.buttonText || 'Catálogo PDF Móvil'}</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Aviso cuando el taller está en receso */}
              {settings?.serviceStatus?.isPaused && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Taller en receso hasta el {formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso'}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Puedes confirmar tu pedido hoy y quedará programado con prioridad de entrega al reanudar.
                  </p>
                </div>
              )}

              {/* Mensaje de Compra Directa */}
              {checkoutMode === 'direct' && (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-2xs">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11.5px] font-medium leading-tight">
                    <strong>Modo Express:</strong> Piezas terminadas con diseño de taller listas para envío.
                  </span>
                </div>
              )}

              {/* Lista de Artículos */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Artículos en orden ({items.length}):
                </div>

                {items.map((item, idx) => {
                  const p = item.product;
                  const itemPrice = p.price ? p.price * item.quantity : null;

                  return (
                    <div
                      key={`${p.id}-${idx}`}
                      className="p-3 rounded-2xl border border-[#E8E4DA] bg-white flex gap-3 relative group shadow-2xs"
                    >
                      {/* Miniatura Cuadrada Clickeable */}
                      <button
                        type="button"
                        onClick={() => onSelectProduct && onSelectProduct(p)}
                        className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 cursor-pointer hover:ring-2 hover:ring-[#2D4F3E] transition-all relative group/thumb"
                        title={`Ver detalles de ${p.name}`}
                      >
                        <img loading="lazy"
                          src={(p.primaryImage || '').replace(/^\.\//, '/')}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/brand/artesano_digital_icono.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>

                      {/* Info del Producto */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-mono font-bold text-gray-500">
                            [{p.code}]
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playMarioPowerDownSound();
                              onRemoveItem(idx);
                            }}
                            className="text-gray-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar del carrito"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectProduct && onSelectProduct(p)}
                          className="text-left block w-full group/title cursor-pointer"
                          title={`Ver detalles de ${p.name}`}
                        >
                          <h5 className="text-xs font-bold text-[#1F2421] group-hover/title:text-[#2D4F3E] transition-colors truncate">
                            {p.name}
                          </h5>
                          <span className="text-[10px] text-[#2D4F3E] hover:underline flex items-center gap-1 mt-0.5 font-medium">
                            <Eye className="w-3 h-3 inline shrink-0" />
                            <span>Ver detalles y medidas</span>
                          </span>
                        </button>

                        {/* Variantes seleccionadas */}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="text-[10.5px] text-gray-500 truncate">
                            {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                          </div>
                        )}

                        {/* Personalización secundaria */}
                        {item.customText ? (
                          <div className="text-[10px] text-[#2D4F3E] bg-[#F4F0E8] px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                            Personalizado: {item.customText}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic block">
                            Acabado estándar de taller
                          </span>
                        )}

                        {/* Stepper y Precio */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                const newQ = Math.max(1, item.quantity - 1);
                                if (newQ < item.quantity) {
                                  playMarioPowerDownSound();
                                }
                                onUpdateQuantity(idx, newQ);
                              }}
                              className="px-2.5 py-0.5 hover:bg-gray-200 font-bold cursor-pointer"
                              title="Disminuir cantidad"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                playCoinSound();
                                onUpdateQuantity(idx, item.quantity + 1);
                              }}
                              className="px-2.5 py-0.5 hover:bg-gray-200 font-bold cursor-pointer"
                              title="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-xs font-black text-[#1F2421]">
                            {itemPrice !== null ? `$${itemPrice} MXN` : <span className="text-gray-400 font-normal">A convenir</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* APARTADO DE CÓDIGOS DE DESCUENTO Y CUPONES */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5D7B7] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-700">
                    <Tag className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>¿Tienes un código de descuento?</span>
                  </div>
                  {appliedCouponCode && !isChangingCoupon && (
                    <button
                      type="button"
                      onClick={() => setIsChangingCoupon(true)}
                      className="text-[11px] text-[#2D4F3E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Cambiar código</span>
                    </button>
                  )}
                </div>

                {/* Aviso claro de que los cupones no son acumulables */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200/90 text-[11px] text-amber-900 leading-tight">
                  <span className="text-amber-600 text-sm shrink-0">ℹ️</span>
                  <span><strong>Nota:</strong> Los cupones de descuento no son acumulables entre sí (máximo 1 cupón por pedido).</span>
                </div>

                {/* Enlace directo para canjear cupones con monedas del Arcade */}
                {onOpenArcade && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenArcade('rewards');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-300/80 hover:border-amber-400 text-xs text-amber-900 font-bold transition-all cursor-pointer shadow-2xs group"
                  >
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-700 group-hover:rotate-12 transition-transform" />
                      <span>¿Quieres cupones? Canjea monedas en Arcade</span>
                    </span>
                    <span className="text-[11px] text-amber-700 underline font-semibold">
                      Canjear &rarr;
                    </span>
                  </button>
                )}

                {/* Si ya hay un cupón activo y no se está cambiando */}
                {appliedCouponCode && !isChangingCoupon ? (
                  <div className="space-y-2">
                    {/* Banner de animación al recién aplicar */}
                    {isJustApplied && (
                      <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#2D4F3E] text-white text-[11px] font-bold flex items-center justify-between shadow-md animate-bounce">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>¡Cupón agregado al carrito de compras con éxito!</span>
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    {/* Tarjeta de Cupón Resplandeciente e interactiva al estilo monedita de Mario */}
                    <div
                      onClick={handleCouponCardClick}
                      className={`relative overflow-hidden p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50/70 to-emerald-50 border-2 border-emerald-400 flex items-center justify-between gap-2 shadow-md shadow-emerald-500/20 coupon-glow-active transition-all cursor-pointer select-none active:scale-95 group ${
                        isJustApplied ? 'animate-coupon-fly-in ring-2 ring-emerald-500' : ''
                      }`}
                      title="¡Haz clic aquí para interactuar con tu cupón!"
                    >
                      {/* Efecto de barrido resplandeciente continuo */}
                      <div className="absolute inset-0 pointer-events-none shimmer-sweep opacity-30" />

                      {/* Moneditas flotantes al hacer clic (efecto Mario Coin) */}
                      {floatingCoins.map(coin => (
                        <div
                          key={coin.id}
                          style={{ left: `${coin.x}px`, top: '8px' }}
                          className="absolute pointer-events-none animate-mario-coin z-30 font-black text-amber-500 text-sm drop-shadow-md select-none flex items-center gap-0.5"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs text-amber-600 font-black">+¡Ting!</span>
                        </div>
                      ))}

                      <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                          <Ticket className="w-4 h-4 text-emerald-800" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-black text-emerald-950 text-xs tracking-wider">
                              {appliedCouponCode}
                            </span>
                            <span className="text-[10px] font-black text-white bg-emerald-700 px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              Activo
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              (activeCouponObj && getCouponCategory(activeCouponObj) === 'arcade')
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}>
                              {activeCouponObj && getCouponCategory(activeCouponObj) === 'arcade' ? 'Descuento Arcade' : 'Cupón de Tienda'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                              Interactivo
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-900 font-medium truncate mt-0.5">
                            {activeCouponObj?.label || activeCouponObj?.name || 'Descuento aplicado'} · Ahorro: <strong className="text-emerald-700">-${discountAmount} MXN</strong>
                          </p>
                          {activeCouponObj?.expiresAt && (
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400 inline" /> Válido hasta: {new Date(activeCouponObj.expiresAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCoupon();
                        }}
                        className="relative z-20 text-[11px] text-red-600 hover:text-red-800 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50/80 cursor-pointer shrink-0 border border-transparent hover:border-red-200 transition-colors"
                        title="Quitar cupón"
                      >
                        Quitar
                      </button>
                    </div>

                    {/* Alerta si el carrito está por debajo del mínimo de compra para este cupón */}
                    {couponCalculation && !couponCalculation.isValid && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{couponCalculation.reason || 'Cupón en pausa: no alcanza el mínimo de compra'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Formulario para ingresar o cambiar el código */
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ingresa tu código (ej: BIENVENIDO, TALLER10...)"
                        value={couponInput}
                        onChange={e => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 bg-white font-mono uppercase text-base sm:text-xs focus:outline-none focus:border-[#2D4F3E]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        Aplicar
                      </button>
                      {isChangingCoupon && (
                        <button
                          type="button"
                          onClick={() => setIsChangingCoupon(false)}
                          className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-800"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" /> {couponError}
                      </p>
                    )}

                    {couponSuccessMsg && (
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" /> {couponSuccessMsg}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Datos para la cotización automática */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] space-y-3 text-xs shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>Datos para tu cotización</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#2D4F3E] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                    {quoteFolio}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Nombre o razón social:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sofía Martínez"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none bg-white text-base sm:text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Teléfono / WhatsApp:
                    </label>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="Ej: 444 123 4567"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none bg-white text-base sm:text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Correo electrónico:
                    </label>
                    <div className="relative">
                      <Mail className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="Ej: cliente@correo.com"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none bg-white text-base sm:text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Ciudad o C.P.:
                    </label>
                    <div className="relative">
                      <MapPin className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ej: SLP / CDMX"
                        value={cityZip}
                        onChange={e => setCityZip(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none bg-white text-base sm:text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-gray-600 mb-1">
                    Tratamiento del IVA en el documento:
                  </div>
                  <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setTaxMode('included')}
                      className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        taxMode === 'included'
                          ? 'bg-white text-[#2D4F3E] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Precios ya incluyen IVA
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxMode('added')}
                      className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        taxMode === 'added'
                          ? 'bg-white text-[#2D4F3E] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Agregar IVA 16%
                    </button>
                  </div>
                  <p className="text-[9.5px] text-gray-500 mt-1 leading-snug">
                    {taxMode === 'included'
                      ? `El total de ${formatQuoteMoney(billableTotal)} ya incluye ${formatQuoteMoney(ivaAmount)} de IVA.`
                      : `Se agregarán ${formatQuoteMoney(ivaAmount)} de IVA al subtotal.`}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                    Notas para la cotización:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: entrega en San Luis Potosí, fecha requerida, referencias del proyecto..."
                    value={quoteNotes}
                    onChange={e => setQuoteNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none bg-white text-base sm:text-xs"
                  />
                </div>

                {checkoutMode === 'quote' && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                      Detalles de grabado o personalización requerida:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Indica nombres, fechas, colores específicos o adjunta link de tu logo..."
                      value={deliveryNotes}
                      onChange={e => setDeliveryNotes(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none bg-white text-base sm:text-xs"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-gray-500 bg-[#FAF9F5] border border-[#E8E4DA] rounded-lg px-2 py-1.5">
                  <span className="font-bold text-gray-600">Vigencia 15 días</span>
                  <span>·</span>
                  <span>Anticipo 50%</span>
                  <span>·</span>
                  <span>PDF con desglose de IVA</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Acciones del Footer del Carrito */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8E4DA] bg-[#FBF9F5] space-y-3 shrink-0">
            {/* Resumen de Total */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Subtotal sin IVA:</span>
                <span className="font-bold text-gray-900">{formatQuoteMoney(netBeforeDiscount)} MXN</span>
              </div>

              {discountAmount > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                    <span>Descuento ({appliedCouponCode}):</span>
                    <span>-{formatQuoteMoney(netDiscount)} MXN</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Subtotal con descuento:</span>
                    <span>{formatQuoteMoney(baseSubtotal)} MXN</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{taxMode === 'included' ? 'IVA 16% incluido:' : 'IVA 16%:'}</span>
                <span className="font-bold text-gray-900">{formatQuoteMoney(ivaAmount)} MXN</span>
              </div>

              <div className="flex items-center justify-between text-base font-extrabold text-[#1F2421] pt-1 border-t border-gray-200/60 font-heading">
                <span>Total:</span>
                <span className="text-lg font-black text-[#2D4F3E]">{formatQuoteMoney(billableTotal)} MXN</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8A6A2F] font-bold">
                <span>Anticipo 50% para iniciar:</span>
                <span>{formatQuoteMoney(advanceAmount)} MXN</span>
              </div>

              <div className="text-[10px] text-gray-400">
                * Folio {quoteFolio}. Confirmas dirección exacta y método de pago por WhatsApp.
              </div>
            </div>

            {/* Acciones del documento y del pedido */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadQuote}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-[#2D4F3E] hover:bg-[#20392C] disabled:opacity-70 disabled:cursor-wait text-white text-sm font-black transition-all shadow-md cursor-pointer active:scale-98"
              >
                {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span>{isGeneratingPdf ? 'Generando PDF…' : 'Descargar reporte de cotización estimado'}</span>
              </button>

              {pdfError && (
                <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> {pdfError}
                </p>
              )}

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full text-white text-sm font-black transition-all shadow-md cursor-pointer active:scale-98 ${
                  checkoutMode === 'direct'
                    ? 'bg-[#16A34A] hover:bg-[#15803D] shadow-emerald-500/20'
                    : 'bg-[#25D366] hover:bg-[#1EBE5D] shadow-emerald-500/20'
                }`}
              >
                {checkoutMode === 'direct' ? <Zap className="w-5 h-5 fill-white" /> : <MessageCircle className="w-5 h-5" />}
                <span>
                  {checkoutMode === 'direct'
                    ? `Enviar pedido por WhatsApp (${formatQuoteMoney(billableTotal)} MXN)`
                    : 'Enviar Cotización por WhatsApp'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-white text-gray-700 border border-[#E8E4DA] text-xs font-semibold hover:bg-gray-50 active:scale-98 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                <span>{copied ? '¡Resumen copiado al portapapeles!' : 'Copiar resumen de orden'}</span>
              </button>

              {settings?.mobileCatalogConfig?.enabled !== false && settings?.mobileCatalogConfig?.showInDrawer !== false && (
                <a
                  href={`/api/catalog-pdf/download/primary?download=1`}
                  download={settings?.mobileCatalogConfig?.fileName || 'Catalogo_Movil_Artesano_Digital.pdf'}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 active:scale-98 transition-all cursor-pointer text-center"
                  title={settings?.mobileCatalogConfig?.title || 'Descargar catálogo vertical 9:16 para celular con enlaces MakerWorld'}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  <span>{settings?.mobileCatalogConfig?.buttonText ? `Descargar ${settings.mobileCatalogConfig.buttonText}` : 'Descargar Catálogo PDF Móvil (9:16)'}</span>
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

