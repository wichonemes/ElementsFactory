import React, { useState, useMemo, useRef } from 'react';
import {
  Palette,
  Globe,
  Box,
  Printer,
  Film,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  DollarSign,
  Eye,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  const [activeTab, setActiveTab] = useState('servicios'); // 'servicios' | 'cotizador'
  const [expandedService, setExpandedService] = useState('branding');
  
  // Cotizador en 2 pasos
  const [quoteService, setQuoteService] = useState('branding');
  const [quoteScope, setQuoteScope] = useState('estandar');
  const [quoteNotes, setQuoteNotes] = useState('');
  
  const cotizadorRef = useRef(null);
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Catálogo de Servicios con Estructura de Color Profesional en Modo Oscuro
  const servicesList = [
    {
      id: 'branding',
      icon: Palette,
      tag: 'Identidad Visual',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      activeBorder: 'border-amber-400/80 ring-2 ring-amber-400/25',
      accentBar: 'bg-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      checkColor: 'text-amber-400 bg-amber-500/20',
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
      tag: 'Gran Formato & Rotulación',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      activeBorder: 'border-rose-400/80 ring-2 ring-rose-400/25',
      accentBar: 'bg-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      checkColor: 'text-rose-400 bg-rose-500/20',
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
      tag: 'E-Commerce & Digital',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeBorder: 'border-emerald-400/80 ring-2 ring-emerald-400/25',
      accentBar: 'bg-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      checkColor: 'text-emerald-400 bg-emerald-500/20',
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
      tag: 'Prototipado & 3D',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      activeBorder: 'border-sky-400/80 ring-2 ring-sky-400/25',
      accentBar: 'bg-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      checkColor: 'text-sky-400 bg-sky-500/20',
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
      tag: 'Contenido & Editorial',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeBorder: 'border-purple-400/80 ring-2 ring-purple-400/25',
      accentBar: 'bg-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      checkColor: 'text-purple-400 bg-purple-500/20',
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

  // Cálculo estimativo en tiempo real del cotizador (en 2 pasos)
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

    return { base, label };
  }, [quoteService, quoteScope]);

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
      inicio: 'Inicial / Emprendedor',
      estandar: 'Estándar Profesional',
      completo: 'Edición VIP Todo Incluido'
    };

    const text = `Hola Wicho / Artesano Digital,
Me interesa una cotización de *Publicidad & Desarrollo Digital*:

• *1. Especialidad:* ${serviceNameMap[quoteService] || quoteService}
• *2. Alcance:* ${scopeMap[quoteScope] || quoteScope}
• *Estimado orientativo:* $${quoteEstimate.base.toLocaleString('es-MX')} MXN
${quoteNotes.trim() ? `\n• *Idea del proyecto:* ${quoteNotes.trim()}\n` : ''}
¿Podemos platicar sobre este proyecto?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#0B0D11] text-stone-100 min-h-screen selection:bg-[#e8b84f] selection:text-[#0B0D11]">
      
      {/* 1. HERO INSTITUCIONAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080A0D] via-[#101319] to-[#0D1015] text-white pt-6 pb-10 sm:pt-10 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80">
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Columna Izquierda: Mensaje Directo y Botón */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.08]">
                Publicidad &amp; <br />
                <span className="text-[#e8b84f]">Desarrollo Digital</span>
              </h1>
              
              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-xl">
                Estrategia de identidad, lonas de gran formato, rotulación en vinil, desarrollo web interactivo y modelado 3D de taller.
              </p>

              {/* Botón de Acción Principal Directo al Cotizador en 2 Pasos */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenCotizador('branding')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#d4a359] hover:to-[#c29235] text-[#0B0D11] font-black text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Cotizar Proyecto (2 Pasos)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Wicho Nemes */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#151921] to-[#0F1218] border border-stone-700/60 p-4 sm:p-5 shadow-2xl">
                
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl border border-[#e8b84f]/40 bg-[#0B0D11] flex items-center justify-center p-1.5 shadow-inner">
                      <img
                        src="/maquetado-inicio-wicho-v2/assets/marca-wicho.png"
                        alt="Wicho Nemes Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div className="font-heading font-black text-white text-sm tracking-tight">Wicho Nemes</div>
                      <div className="text-[10px] text-[#e8b84f] font-bold">Diseñador Gráfico &amp; Digital</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    Taller Abierto
                  </span>
                </div>

                {/* Retrato y Presentación */}
                <div className="py-3 flex items-center gap-3">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-2xl bg-gradient-to-b from-[#202631] to-[#0E1116] border border-white/15 overflow-hidden shadow-lg">
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
                    <p className="italic text-stone-200 text-[11px] line-clamp-2">
                      "Ideas claras. Diseño con intención. Cada pieza visual debe resolver un propósito comercial real."
                    </p>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#e8b84f] shrink-0" />
                      <span>San Luis Potosí, SLP · Envíos nacionales.</span>
                    </div>
                  </div>
                </div>

                {/* Botón Activo: Ver Trabajos */}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-stone-400 text-[11px] font-medium">Portafolio personal:</span>
                  <a
                    href="/maquetado-inicio-wicho-v2/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#f0c765] hover:to-[#e8b84f] text-[#0B0D11] font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    title="Abrir portafolio de Wicho Nemes"
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

      {/* 2. BARRA DE NAVEGACIÓN LIMPIA Y COMPACTA (TEMA OSCURO) */}
      <div className="sticky top-20 z-30 bg-[#0B0D11]/95 backdrop-blur-md border-b border-stone-800/80 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 py-2.5">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'servicios'
                  ? 'bg-[#e8b84f] text-[#0B0D11] shadow-md'
                  : 'bg-[#151921] text-stone-300 hover:text-white hover:bg-[#1E232E] border border-stone-800'
              }`}
            >
              <span>Servicios &amp; Paquetes</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenCotizador(quoteService)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'cotizador'
                  ? 'bg-[#e8b84f] text-[#0B0D11] shadow-md'
                  : 'bg-[#151921] text-stone-300 hover:text-white hover:bg-[#1E232E] border border-stone-800'
              }`}
            >
              <span>Cotizador Rápido</span>
            </button>
          </div>

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs text-stone-400 hover:text-[#e8b84f] font-bold shrink-0 ml-auto cursor-pointer transition-colors"
            >
              ← Tienda
            </button>
          )}

        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL EN COLOR NEGRO */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

        {/* ================= SECCIÓN 1: SERVICIOS DIRECTOS (TOTALMENTE EN NEGRO) ================= */}
        {activeTab === 'servicios' && (
          <div className="space-y-4 animate-fadeIn">

            {/* Acordeón de Servicios Directo sin duplicar opciones */}
            <div className="space-y-3">
              {servicesList.map(srv => {
                const isExpanded = expandedService === srv.id;
                const Icon = srv.icon;

                return (
                  <div
                    key={srv.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? `bg-[#12161D] ${srv.activeBorder} shadow-2xl ring-1 ring-white/10`
                        : 'bg-[#0F1218] border-stone-800 hover:border-stone-700 shadow-md'
                    }`}
                  >
                    {/* Barra Superior con Acento de Color si está desplegado */}
                    {isExpanded && <div className={`h-1.5 w-full ${srv.accentBar}`} />}

                    {/* Cabecera Tocable */}
                    <button
                      type="button"
                      onClick={() => setExpandedService(isExpanded ? '' : srv.id)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-white/5"
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
                          </div>
                          <h3 className="font-heading font-black text-sm text-white mt-0.5 truncate">
                            {srv.title}
                          </h3>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-400 hidden sm:inline">
                          {isExpanded ? 'Ocultar' : 'Ver lo que incluye'}
                        </span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-transform ${
                          isExpanded ? 'bg-[#e8b84f] text-[#0B0D11] rotate-180 border-[#e8b84f]' : 'bg-[#181D26] text-stone-300 border-stone-700'
                        }`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>

                    {/* Contenido Desplegable Completo del Paquete */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 border-t border-stone-800/80 space-y-3.5 animate-fadeIn">
                        
                        <p className="text-xs text-stone-300 leading-relaxed font-normal">
                          {srv.summary}
                        </p>

                        {/* Entregables incluidos en el paquete (Bloque en color negro para diferenciar que son servicios) */}
                        <div className="bg-[#080A0E] p-3.5 sm:p-4 rounded-2xl border border-stone-800 space-y-2.5 shadow-inner">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#e8b84f] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e8b84f]" />
                            <span>Servicios y entregables incluidos:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                            {srv.deliverables.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-stone-200 font-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e8b84f] mt-1.5 shrink-0" />
                                <span className="leading-snug">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botón Directo para Cotizar este Servicio */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="text-[11px] text-stone-400 italic">
                            <strong className="text-stone-200">Ideal para:</strong> {srv.idealFor}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenCotizador(srv.id === 'audiovisual' ? 'branding' : srv.id)}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#d4a359] hover:to-[#c29235] text-[#0B0D11] font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shrink-0"
                          >
                            <span>Cotizar este servicio</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#0B0D11]" />
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Banner Compacto de Cotización */}
            <div className="rounded-2xl bg-gradient-to-r from-[#141820] via-[#1A212B] to-[#11141A] text-white p-4 shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs font-bold text-[#e8b84f]">¿Tienes un proyecto especial con medidas específicas?</div>
                <div className="text-xs text-stone-300">Cotiza en 2 pasos con cálculo de costo al instante.</div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCotizador('branding')}
                className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-[#e8b84f] hover:bg-[#d4a359] text-[#0B0D11] font-black text-xs transition-all shadow-md cursor-pointer"
              >
                Abrir Cotizador
              </button>
            </div>

          </div>
        )}

        {/* ================= SECCIÓN 2: COTIZADOR INTERACTIVO EN 2 PASOS (TOTALMENTE EN NEGRO) ================= */}
        {activeTab === 'cotizador' && (
          <div ref={cotizadorRef} className="space-y-5 animate-fadeIn">
            
            {/* TARJETA DESTACADA DEL COSTO ORIENTATIVO */}
            <div className="sticky top-32 z-20 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#141820] to-[#1C2532] text-white shadow-2xl border border-[#e8b84f]/40 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#e8b84f] flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Inversión Estimada:</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-heading text-[#e8b84f] tracking-tight">
                  ${quoteEstimate.base.toLocaleString('es-MX')} <span className="text-xs font-normal text-stone-300">MXN</span>
                </div>
                <div className="text-[10px] text-stone-300 truncate max-w-[220px] sm:max-w-md">
                  {quoteEstimate.label} · {quoteScope === 'inicio' ? 'Básico' : quoteScope === 'estandar' ? 'Profesional' : 'VIP Todo Incluido'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendWhatsAppQuote}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* CONTENEDOR DE LOS 2 PASOS EN NEGRO */}
            <div className="bg-[#10131A] rounded-3xl border border-stone-800 p-4 sm:p-6 shadow-2xl space-y-5 text-white">
              
              {/* PASO 1: ESPECIALIDAD O SERVICIO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#e8b84f] text-[#0B0D11] text-[11px] flex items-center justify-center font-black">1</span>
                    <span>Especialidad o Servicio:</span>
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">Toca una opción</span>
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
                            ? 'border-[#e8b84f] bg-[#e8b84f]/15 ring-2 ring-[#e8b84f]/30 shadow-md'
                            : 'border-stone-800 hover:border-stone-700 bg-[#161B23]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-black text-xs text-white truncate">
                            {s.title}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate">{s.desc}</div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#e8b84f] text-[#0B0D11]' : 'bg-[#202633] text-stone-300'
                        }`}>
                          {s.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 2: ALCANCE DE PROYECTO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#e8b84f] text-[#0B0D11] text-[11px] flex items-center justify-center font-black">2</span>
                    <span>Alcance del Proyecto:</span>
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">Nivel de profundidad</span>
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
                            ? 'border-[#e8b84f] bg-[#e8b84f]/15 ring-2 ring-[#e8b84f]/30 shadow-md'
                            : 'border-stone-800 hover:border-stone-700 bg-[#161B23]'
                        }`}
                      >
                        <div className="font-black text-xs text-white">{lvl.title}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5 leading-tight">{lvl.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACCIÓN PRINCIPAL: BOTÓN DE COTIZAR POR WHATSAPP */}
              <div className="pt-3 border-t border-stone-800/80 space-y-4">
                
                <button
                  type="button"
                  onClick={handleSendWhatsAppQuote}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Cotizar por WhatsApp con Wicho (${quoteEstimate.base.toLocaleString('es-MX')} MXN)</span>
                </button>

                {/* CUÉNTANOS TU IDEA: UBICADO ABAJO DEL BOTÓN DE COTIZAR */}
                <div className="p-3.5 rounded-2xl bg-[#080A0E] border border-stone-800 space-y-1.5">
                  <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
                    <span>Cuéntanos tu idea (opcional):</span>
                  </label>
                  <textarea
                    rows="2"
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Escribe brevemente tu idea si deseas añadir medidas o detalles (ej. Lona de 3x2m para inauguración y diseño de logo)..."
                    className="w-full p-2.5 rounded-xl border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#e8b84f] bg-[#141820]"
                  />
                  <p className="text-[10px] text-stone-400">
                    Si escribes detalles aquí, se incluirán automáticamente en tu mensaje de WhatsApp al pulsar el botón de arriba.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
