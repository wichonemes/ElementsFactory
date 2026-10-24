import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Palette,
  Globe,
  Box,
  Printer,
  Film,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Send,
  Zap,
  ArrowRight,
  Briefcase,
  Sliders,
  DollarSign,
  Clock,
  Eye,
  Check
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  const [activeTab, setActiveTab] = useState('servicios'); // 'servicios' | 'cotizador'
  const [expandedService, setExpandedService] = useState('branding');
  
  // Estado del configurador en 3 pasos
  const [quoteService, setQuoteService] = useState('branding');
  const [quoteScope, setQuoteScope] = useState('estandar');
  const [quoteUrgency, setQuoteUrgency] = useState('normal');
  const [quoteNotes, setQuoteNotes] = useState('');
  
  const cotizadorRef = useRef(null);
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // 1. Catálogo con Estructura de Color Única por Especialidad
  const servicesList = [
    {
      id: 'branding',
      icon: Palette,
      colorName: 'amber',
      tag: 'Identidad Visual',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/25',
      accentBar: 'bg-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-600',
      checkColor: 'text-amber-600 bg-amber-50',
      title: 'Diseño Gráfico & Branding Corporativo',
      summary: 'Construcción de marcas memorables con voz propia, manual de identidad y aplicaciones comerciales completas.',
      deliverables: [
        'Logotipo principal, versiones alternativas e isotipo',
        'Manual de identidad de marca (paleta de color, tipografía y retícula)',
        'Papelería comercial: tarjetas, membretes y firmas de correo',
        'Diseño de empaques, etiquetas y sellos de producto',
        'Archivos vectoriales maestros (.AI, .PDF, .SVG, .PNG transparentes)'
      ],
      idealFor: 'Negocios nuevos, franquicias, pymes que buscan profesionalizar su imagen o rediseño de marca.'
    },
    {
      id: 'publicidad',
      icon: Printer,
      colorName: 'rose',
      tag: 'Gran Formato & Rotulación',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      activeBorder: 'border-rose-400 ring-2 ring-rose-400/25',
      accentBar: 'bg-rose-400',
      iconBg: 'bg-rose-500/15 text-rose-600',
      checkColor: 'text-rose-600 bg-rose-50',
      title: 'Publicidad Comercial, Lonas & Vinil',
      summary: 'Impacto visual físico para tu local o negocio: lonas de alta resistencia, rotulación en vinil y señalética arquitectónica.',
      deliverables: [
        'Lonas frontlite de 13oz con acabado perimetral y ojillos reforzados',
        'Lona mesh microperforada para exteriores de alto viento',
        'Vinil microperforado para cristales, aparadores y fachadas',
        'Corte de vinil automotriz y comercial (rotulación vehicular)',
        'Señalética en Trovicel y Acrílico con corte y grabado láser'
      ],
      idealFor: 'Comercios locales, oficinas, talleres, eventos y publicidad exterior de alto tráfico.'
    },
    {
      id: 'web',
      icon: Globe,
      colorName: 'emerald',
      tag: 'E-Commerce & Digital',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/25',
      accentBar: 'bg-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-600',
      checkColor: 'text-emerald-600 bg-emerald-50',
      title: 'Desarrollo Web & Tiendas Online',
      summary: 'Plataformas interactivas rápidas, responsivas y optimizadas para convertir visitantes en clientes reales.',
      deliverables: [
        'Sitios web corporativos modernos y ultra responsivos (móvil y PC)',
        'Catálogos digitales dinámicos con pedidos directos a WhatsApp',
        'Tiendas en línea completas con carrito y cálculo de envíos',
        'Páginas de aterrizaje (Landing Pages) de alta conversión',
        'Integración con redes sociales, SEO local y Google Maps'
      ],
      idealFor: 'Marcas que necesitan vender por internet, mostrar su catálogo 24/7 o automatizar sus cotizaciones.'
    },
    {
      id: 'modelado',
      icon: Box,
      colorName: 'sky',
      tag: 'Prototipado & 3D',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      activeBorder: 'border-sky-400 ring-2 ring-sky-400/25',
      accentBar: 'bg-sky-400',
      iconBg: 'bg-sky-500/15 text-sky-600',
      checkColor: 'text-sky-600 bg-sky-50',
      title: 'Modelado 3D & Renderizado Técnico',
      summary: 'De la idea al render fotorrealista y a la manufactura física mediante impresión 3D aditiva FDM.',
      deliverables: [
        'Diseño CAD paramétrico y modelado orgánico/técnico',
        'Renders fotorrealistas de producto para catálogos y publicidad',
        'Prototipos funcionales y piezas mecánicas a medida',
        'Carcasas y gabinetes para electrónica y proyectos especiales',
        'Producción en serie corta en filamentos técnicos (PLA, PETG, ABS)'
      ],
      idealFor: 'Emprendedores de producto físico, ingenieros, inventores y fabricantes de piezas personalizadas.'
    },
    {
      id: 'audiovisual',
      icon: Film,
      colorName: 'purple',
      tag: 'Contenido & Editorial',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      activeBorder: 'border-purple-400 ring-2 ring-purple-400/25',
      accentBar: 'bg-purple-400',
      iconBg: 'bg-purple-500/15 text-purple-600',
      checkColor: 'text-purple-600 bg-purple-50',
      title: 'Producción Audiovisual & Editorial',
      summary: 'Animación en movimiento, fotografía comercial de producto y maquetación editorial de catálogos y folletos.',
      deliverables: [
        'Fotografía de producto en estudio con iluminación profesional',
        'Motion graphics y animación 2D/3D para reels, TikTok y anuncios',
        'Maquetación editorial de catálogos de producto para impresión y PDF',
        'Folletos trípticos, dípticos y manuales de usuario ilustrados'
      ],
      idealFor: 'Campañas de lanzamiento, catálogos de temporada y presencia visual en redes.'
    }
  ];

  // Cálculo estimativo en tiempo real del cotizador
  const quoteEstimate = useMemo(() => {
    let base = 1500;
    let label = 'Paquete Base';

    if (quoteService === 'branding') {
      base = quoteScope === 'inicio' ? 1800 : quoteScope === 'estandar' ? 3200 : 5500;
      label = 'Branding & Identidad';
    } else if (quoteService === 'publicidad') {
      base = quoteScope === 'inicio' ? 850 : quoteScope === 'estandar' ? 2400 : 4900;
      label = 'Lonas, Vinil & Rotulación';
    } else if (quoteService === 'web') {
      base = quoteScope === 'inicio' ? 2900 : quoteScope === 'estandar' ? 5800 : 11500;
      label = 'Desarrollo Web & Tienda';
    } else if (quoteService === 'modelado') {
      base = quoteScope === 'inicio' ? 1200 : quoteScope === 'estandar' ? 2800 : 6000;
      label = 'Modelado 3D & Render';
    } else if (quoteService === 'combo') {
      base = quoteScope === 'inicio' ? 4500 : quoteScope === 'estandar' ? 8500 : 15000;
      label = 'Paquete Integral (Marca + Web + Físico)';
    }

    if (quoteUrgency === 'express') base = Math.round(base * 1.25);

    return { base, label };
  }, [quoteService, quoteScope, quoteUrgency]);

  const handleOpenCotizador = (serviceId) => {
    if (serviceId) setQuoteService(serviceId);
    setActiveTab('cotizador');
    setTimeout(() => {
      cotizadorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleSendWhatsAppQuote = () => {
    const serviceNameMap = {
      branding: 'Diseño Gráfico & Branding',
      publicidad: 'Publicidad Comercial, Lonas & Gran Formato',
      web: 'Desarrollo Web & Catálogo / Tienda Online',
      modelado: 'Modelado 3D & Renders Técnicos',
      combo: 'Paquete Integral (Marca + Web + Publicidad)'
    };

    const scopeMap = {
      inicio: 'Nivel Inicial / Emprendedor',
      estandar: 'Nivel Profesional / Más Completo',
      completo: 'Nivel Máximo / Todo Incluido'
    };

    const urgencyMap = {
      normal: 'Plazo habitual de taller',
      express: 'Entrega prioritaria / Express'
    };

    const text = `Hola Wicho / Artesano Digital! 🚀
Me interesa una cotización de *Publicidad & Desarrollo Digital*:

📌 *1. Especialidad:* ${serviceNameMap[quoteService] || quoteService}
📦 *2. Alcance:* ${scopeMap[quoteScope] || quoteScope}
⏱️ *3. Plazo:* ${urgencyMap[quoteUrgency]}
💰 *Estimado orientativo:* $${quoteEstimate.base.toLocaleString('es-MX')} MXN

${quoteNotes.trim() ? `💡 *Mi idea:* ${quoteNotes.trim()}\n` : ''}¿Podemos platicar sobre este proyecto?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#FAF9F5] text-stone-900 min-h-screen">
      
      {/* 1. HERO INSTITUCIONAL: WICHO NEMES & ARTESANO DIGITAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#101215] via-[#171a1f] to-[#1F2421] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        
        {/* Glows y atmósfera decorativa */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#e8b84f]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Tag de Encabezado */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#e8b84f] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
            <span>División de Servicios Digitales, Publicidad &amp; Marca</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Mensaje y Filosofía */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.08]">
                Publicidad &amp; <br />
                <span className="text-[#e8b84f]">Desarrollo Digital</span>
              </h1>
              
              <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed max-w-2xl">
                Unimos la estrategia de identidad, la rotulación comercial de gran formato, el desarrollo web interactivo y la manufactura física de taller en un solo flujo continuo.
              </p>

              {/* Puntos Clave con Estructura de Color */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                  <div className="text-amber-400 font-black text-xs sm:text-sm">01. Branding</div>
                  <div className="text-[10px] sm:text-xs text-stone-300 mt-0.5 leading-tight">Marcas con sistema</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                  <div className="text-rose-400 font-black text-xs sm:text-sm">02. Publicidad</div>
                  <div className="text-[10px] sm:text-xs text-stone-300 mt-0.5 leading-tight">Lonas y gran formato</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-emerald-400 font-black text-xs sm:text-sm">03. Web &amp; 3D</div>
                  <div className="text-[10px] sm:text-xs text-stone-300 mt-0.5 leading-tight">Pantallas y prototipos</div>
                </div>
              </div>

              {/* Botón de Acción Principal Directo al Cotizador Inmediato */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenCotizador('branding')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#d4a359] hover:to-[#c29235] text-[#121519] font-black text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sliders className="w-4 h-4 fill-[#121519]" />
                  <span>Cotizar Proyecto a Medida (3 Pasos)</span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Wicho Nemes */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1d2228] to-[#14171b] border border-stone-700/60 p-4 sm:p-6 shadow-2xl">
                
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border border-[#e8b84f]/40 bg-[#101215] flex items-center justify-center p-1.5 shadow-inner">
                      <img
                        src="/maquetado-inicio-wicho-v2/assets/marca-wicho.png"
                        alt="Wicho Nemes Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div className="font-heading font-black text-white text-sm sm:text-base tracking-tight">Wicho Nemes</div>
                      <div className="text-[11px] text-[#e8b84f] font-bold">Diseñador Gráfico &amp; Digital</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    Taller Abierto
                  </span>
                </div>

                {/* Retrato y Presentación */}
                <div className="py-3.5 flex items-center gap-3.5 sm:gap-4">
                  <div className="w-18 h-22 sm:w-22 sm:h-26 shrink-0 rounded-2xl bg-gradient-to-b from-[#252b33] to-[#121519] border border-white/15 overflow-hidden shadow-lg">
                    <img
                      src="/maquetado-inicio-wicho-v2/assets/perfil-sin-fondo.png"
                      alt="Wicho Nemes"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.src = '/brand/artesano_isotipo_transparente.png';
                      }}
                    />
                  </div>

                  <div className="space-y-1 text-xs text-stone-300 leading-relaxed font-normal">
                    <p className="italic text-stone-200 line-clamp-2">
                      "Ideas claras. Diseño con intención. Cada pieza visual debe resolver un propósito comercial real."
                    </p>
                    <div className="text-[11px] text-stone-400">
                      📍 San Luis Potosí, SLP · Servicio local y nacional.
                    </div>
                  </div>
                </div>

                {/* Botón Activo: Ver Trabajos (redirige directo al portafolio) */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-stone-400 text-xs font-medium">Portafolio personal:</span>
                  <a
                    href="/maquetado-inicio-wicho-v2/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#f0c765] hover:to-[#e8b84f] text-[#121519] font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    title="Abrir portafolio interactivo de Wicho Nemes"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Trabajos</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 2. BARRA DE NAVEGACIÓN COMPACTA (MÓVIL PRIMERO) */}
      <div className="sticky top-20 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 py-2">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'servicios'
                  ? 'bg-[#17251E] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Servicios &amp; Especialidades</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCotizador(quoteService)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cotizador'
                  ? 'bg-[#D4A359] text-[#17251E] shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Cotizador Inmediato</span>
            </button>
          </div>

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs text-stone-500 hover:text-stone-900 font-medium shrink-0 ml-auto cursor-pointer"
            >
              ← Volver a la Tienda
            </button>
          )}

        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* ================= SECCIÓN 1: SERVICIOS Y ESPECIALIDADES CON ESTRUCTURA DE COLOR ================= */}
        {activeTab === 'servicios' && (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                Especialidades de Taller
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-stone-900 tracking-tight">
                Elige una disciplina para ver lo que incluye
              </h2>
              <p className="text-xs text-stone-600 font-normal">
                Toca cada tarjeta para desplegar sus entregables y cotizarla de inmediato.
              </p>
            </div>

            {/* Píldoras de Selección Rápida en Móvil con Acentos de Color */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {servicesList.map(srv => {
                const isSelected = expandedService === srv.id;
                const Icon = srv.icon;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setExpandedService(srv.id)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#17251E] text-white shadow-md ring-2 ring-[#D4A359]/70'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{srv.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Acordeón de Servicios con Estructura de Color Personalizada */}
            <div className="space-y-3">
              {servicesList.map(srv => {
                const isExpanded = expandedService === srv.id;
                const Icon = srv.icon;

                return (
                  <div
                    key={srv.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? `bg-white ${srv.activeBorder} shadow-lg`
                        : 'bg-white/90 border-stone-200 hover:border-stone-300 shadow-xs'
                    }`}
                  >
                    {/* Barra Superior con Acento de Color si está desplegado */}
                    {isExpanded && <div className={`h-1.5 w-full ${srv.accentBar}`} />}

                    {/* Cabecera Tocable */}
                    <button
                      type="button"
                      onClick={() => setExpandedService(isExpanded ? '' : srv.id)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-stone-50/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${srv.iconBg} ${
                          isExpanded ? 'scale-105' : ''
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${srv.badgeColor}`}>
                              {srv.tag}
                            </span>
                            {isExpanded && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                Abierto
                              </span>
                            )}
                          </div>
                          <h3 className="font-heading font-black text-sm text-stone-900 mt-0.5 truncate">
                            {srv.title}
                          </h3>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-500 hidden sm:inline">
                          {isExpanded ? 'Ocultar' : 'Ver detalle'}
                        </span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-transform ${
                          isExpanded ? 'bg-[#17251E] text-white rotate-180 border-[#17251E]' : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>

                    {/* Contenido Desplegable Completo del Paquete */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 border-t border-stone-100 space-y-4 animate-fadeIn">
                        
                        <p className="text-xs text-stone-700 leading-relaxed font-normal">
                          {srv.summary}
                        </p>

                        {/* Entregables incluidos en el paquete */}
                        <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-xl border border-stone-200/80 space-y-2.5">
                          <div className="text-[10px] font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lo que incluye cada paquete de {srv.title.split('&')[0].trim()}:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                            {srv.deliverables.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 font-normal">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${srv.checkColor}`}>
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ideal para + Botón Directo para Cotizar este Paquete */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="text-[11px] text-stone-600 italic">
                            <strong>Ideal para:</strong> {srv.idealFor}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenCotizador(srv.id === 'audiovisual' ? 'branding' : srv.id)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#17251E] hover:bg-[#2D4F3E] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shrink-0"
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#e8b84f]" />
                            <span>Configurar y cotizar este servicio</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Banner Compacto de Cotización */}
            <div className="rounded-2xl bg-gradient-to-r from-[#17251E] via-[#243B2F] to-[#1F2421] text-white p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-bold text-[#D4A359]">¿Tienes un proyecto especial o medidas específicas?</div>
                <div className="text-xs text-stone-200">Cotiza en 3 pasos con cálculo de costo al instante.</div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCotizador('branding')}
                className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-[#D4A359] hover:bg-[#c39247] text-[#17251E] font-black text-xs transition-all shadow-md cursor-pointer"
              >
                Abrir Cotizador Inmediato
              </button>
            </div>

          </div>
        )}

        {/* ================= SECCIÓN 2: COTIZADOR INTERACTIVO EN 3 PASOS (MÓVIL PRIMERO) ================= */}
        {activeTab === 'cotizador' && (
          <div ref={cotizadorRef} className="space-y-6 animate-fadeIn">
            
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                Cotizador Rápido en 3 Pasos
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-stone-900 tracking-tight">
                Elige tus opciones y ve el costo a la primera
              </h2>
              <p className="text-xs text-stone-600 font-normal">
                Sin escroleo innecesario: selecciona especialidad, alcance y plazos para calcular el estimado en tiempo real.
              </p>
            </div>

            {/* TARJETA DESTACADA DEL COSTO ORIENTATIVO (VISIBLE A LA PRIMERA) */}
            <div className="sticky top-32 z-20 p-4 rounded-2xl bg-gradient-to-r from-[#17251E] to-[#2D4F3E] text-white shadow-xl border border-[#D4A359]/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4A359] flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Inversión Estimada Orientativa:</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                  ${quoteEstimate.base.toLocaleString('es-MX')} <span className="text-xs font-normal text-stone-300">MXN</span>
                </div>
                <div className="text-[10px] text-stone-300 truncate max-w-[240px] sm:max-w-md">
                  {quoteEstimate.label} · {quoteScope === 'inicio' ? 'Básico' : quoteScope === 'estandar' ? 'Profesional' : 'VIP Todo Incluido'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendWhatsAppQuote}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">Cotizar por WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>
            </div>

            {/* CONTENEDOR DE LOS 3 PASOS */}
            <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-6">
              
              {/* PASO 1: ESPECIALIDAD O SERVICIO */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#17251E] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>Especialidad o Servicio:</span>
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">Toca una opción</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'branding', title: 'Diseño Gráfico & Branding', desc: 'Logotipo, identidad visual y manual', price: 'Desde $1,800' },
                    { id: 'publicidad', title: 'Publicidad Comercial & Lonas', desc: 'Gran formato, vinil y rotulación', price: 'Desde $850' },
                    { id: 'web', title: 'Desarrollo Web & Tienda', desc: 'Sitio responsivo y catálogo WhatsApp', price: 'Desde $2,900' },
                    { id: 'modelado', title: 'Modelado 3D & Renders', desc: 'CAD paramétrico y prototipado FDM', price: 'Desde $1,200' },
                    { id: 'combo', title: 'Paquete Integral Todo-en-Uno', desc: 'Marca + Web + Rotulación física', price: 'Desde $4,500' }
                  ].map((s) => {
                    const isSelected = quoteService === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setQuoteService(s.id)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-[#2D4F3E] bg-[#2D4F3E]/8 ring-2 ring-[#2D4F3E]/20 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                            <span>{s.title}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">{s.desc}</div>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {s.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 2: ALCANCE DE PROYECTO */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#17251E] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Alcance del Proyecto:</span>
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">Nivel de profundidad</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'inicio', title: 'Inicio / Emprendedor', desc: 'Esencial para arrancar bien' },
                    { id: 'estandar', title: 'Estándar Profesional', desc: 'El más completo y recomendado' },
                    { id: 'completo', title: 'Edición Integral VIP', desc: 'Máximo alcance y todo incluido' }
                  ].map((lvl) => {
                    const isSelected = quoteScope === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setQuoteScope(lvl.id)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#D4A359] bg-[#D4A359]/12 ring-2 ring-[#D4A359]/30 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="font-black text-xs text-stone-900">{lvl.title}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">{lvl.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 3: PLAZOS DE ENTREGA */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#17251E] text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>Plazos de Entrega:</span>
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">Tiempo de taller</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteUrgency('normal')}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      quoteUrgency === 'normal'
                        ? 'border-[#2D4F3E] bg-[#2D4F3E] text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Plazo Normal de Taller</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuoteUrgency('express')}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      quoteUrgency === 'express'
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Entrega Express (+25%)</span>
                  </button>
                </div>
              </div>

              {/* SECCIÓN FINAL: CUÉNTANOS TU IDEA Y COTIZAR POR WHATSAPP */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>Cuéntanos tu idea:</span>
                  </label>
                  <textarea
                    rows="2"
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Escribe brevemente tu proyecto: Ej. Requiero lona para inauguración de 2x1 metros y diseño de logotipo..."
                    className="w-full p-3 rounded-2xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E] bg-[#FAF9F5]"
                  />
                </div>

                {/* BOTÓN PROMINENTE DE COTIZAR POR WHATSAPP */}
                <button
                  type="button"
                  onClick={handleSendWhatsAppQuote}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Cotizar por WhatsApp con Wicho (${quoteEstimate.base.toLocaleString('es-MX')} MXN)</span>
                </button>

                <p className="text-[11px] text-stone-500 text-center">
                  Te responderemos directamente por WhatsApp para afinar medidas, archivos y muestra visual previa.
                </p>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}