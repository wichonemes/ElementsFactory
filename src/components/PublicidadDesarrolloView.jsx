import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Globe,
  Box,
  Printer,
  Film,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Send,
  Zap,
  ArrowRight,
  Maximize2,
  Monitor,
  Layout,
  Briefcase,
  Sliders,
  DollarSign,
  HelpCircle,
  Eye
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  const [activeTab, setActiveTab] = useState('servicios'); // 'servicios' | 'portafolio' | 'cotizador' | 'visor'
  const [portfolioFilter, setPortfolioFilter] = useState('all'); // 'all' | 'identidad' | 'impresos' | 'interfaces' | 'modelado'
  const [selectedProject, setSelectedProject] = useState(null);

  // Estado del cotizador rápido de proyectos digitales y publicidad
  const [quoteService, setQuoteService] = useState('branding');
  const [quoteScope, setQuoteScope] = useState('estandar');
  const [quoteUrgency, setQuoteUrgency] = useState('normal');
  const [quoteNotes, setQuoteNotes] = useState('');

  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // 1. Catálogo de Servicios de Publicidad y Desarrollo
  const servicesList = [
    {
      id: 'branding',
      icon: Palette,
      color: 'amber',
      tag: 'Identidad Visual',
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
      color: 'rose',
      tag: 'Gran Formato & Rotulación',
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
      color: 'emerald',
      tag: 'E-Commerce & Digital',
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
      color: 'blue',
      tag: 'Prototipado & 3D',
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
      color: 'purple',
      tag: 'Contenido & Editorial',
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

  // 2. Proyectos Reales Extraídos del Portafolio de Wicho Nemes
  const portfolioProjects = [
    {
      id: 'artesano-digital',
      name: 'Artesano Digital',
      category: 'interfaces',
      discipline: 'Identidad · Web · E-Commerce · Taller 3D',
      image: '/maquetado-inicio-wicho-v2/assets/artesano-areas.webp',
      description: 'Sistema integral de identidad de marca, catálogo e-commerce interactivo, cotizador multi-material y manufactura física.',
      behanceUrl: 'https://www.behance.net/gallery/123034311/ARTESANO-DIGITAL'
    },
    {
      id: 'homie-studio',
      name: 'Homie Studio',
      category: 'identidad',
      discipline: 'Identidad Corporativa · Branding',
      image: '/portfolio/identidad/proyecto-01.png',
      description: 'Identidad de estudio creativo con aplicaciones sobrias, tipografía sólida y manual de marca corporativo.',
      behanceUrl: 'https://www.behance.net/gallery/123043173/Homie-studio'
    },
    {
      id: 'civil-armory',
      name: 'Civil Armory',
      category: 'impresos',
      discipline: 'Marca · Indumentaria · Medios Impresos',
      image: '/maquetado-inicio-wicho-v2/assets/civil-shirts.webp',
      description: 'Línea de indumentaria táctica para uso civil: serigrafía, vinil textil, etiquetas y producción impresa en taller.',
      behanceUrl: 'https://www.behance.net/gallery/123056627/Civil-aAmory'
    },
    {
      id: 'cafe-san-luis',
      name: 'Café San Luis',
      category: 'identidad',
      discipline: 'Identidad de Producto · Empaque',
      image: '/portfolio/identidad/proyecto-31.jpg',
      description: 'Diseño de identidad y etiquetas para café artesanal de especialidad en San Luis Potosí.',
      behanceUrl: 'https://www.behance.net/gallery/123058295/Cafe-San-Luis'
    },
    {
      id: 'papi-pizza',
      name: 'Papi Pizza',
      category: 'identidad',
      discipline: 'Branding Gastronómico · Publicidad',
      image: '/portfolio/identidad/proyecto-02.png',
      description: 'Identidad comercial fresca y llamativa para restaurante de pizzas artesanales, empaques y señalética de local.',
      behanceUrl: 'https://www.behance.net/gallery/174083511/PAPIZZA'
    },
    {
      id: 'popol-vuh',
      name: 'Popol Vuh',
      category: 'impresos',
      discipline: 'Diseño Editorial · Ilustración',
      image: '/maquetado-inicio-wicho-v2/assets/popol-spread.webp',
      description: 'Proyecto editorial ilustrado de alta fidelidad basado en el libro sagrado maya con maquetación de retícula editorial.',
      behanceUrl: 'https://www.behance.net/gallery/123358563/Popol-vuh'
    },
    {
      id: 'sistema-talentos',
      name: 'Sistema de Talentos',
      category: 'interfaces',
      discipline: 'Diseño UI/UX · Plataforma Digital',
      image: '/maquetado-inicio-wicho-v2/assets/talentos-proposal.webp',
      description: 'Arquitectura de información y diseño de pantallas intuitivas para sistema de gestión de habilidades y evaluación.',
      behanceUrl: 'https://www.behance.net/gallery/123058503/Sistema-de-talentos'
    },
    {
      id: 'el-aguijon',
      name: 'El Aguijón',
      category: 'identidad',
      discipline: 'Identidad Visual · Emblema',
      image: '/portfolio/identidad/proyecto-03.png',
      description: 'Creación de isotipo y sistema visual dinámico con estética contemporánea.',
      behanceUrl: 'https://www.behance.net/gallery/163418171/El-Aguijon'
    },
    {
      id: 'natrull',
      name: 'Natrull',
      category: 'identidad',
      discipline: 'Identidad Orgánica · Productos Naturales',
      image: '/portfolio/identidad/proyecto-04.png',
      description: 'Branding para línea de productos saludables con paleta botánica y trazado tipográfico limpio.',
      behanceUrl: 'https://www.behance.net/gallery/179396771/NATRULL'
    },
    {
      id: 'carrera-videojuegos',
      name: 'Soy Developer · U. Cuauhtémoc',
      category: 'modelado',
      discipline: 'Modelado 3D · Campaña & Gamificación',
      image: '/portfolio/identidad/proyecto-07.png',
      description: 'Modelado 3D, renders y dirección de arte para la carrera de Videojuegos de la Universidad Cuauhtémoc SLP.',
      behanceUrl: 'https://www.behance.net/gallery/123411519/Universidad-Cuauhtmoc-Carrera-Videojuegos'
    },
    {
      id: 'the-homies-barber',
      name: 'The Homies Barber Shop',
      category: 'identidad',
      discipline: 'Identidad Comercial · Fachada & Rotulación',
      image: '/portfolio/identidad/proyecto-26.png',
      description: 'Identidad para barbería clásica urbana, logotipos en corte de vinil y señalética física para fachada.',
      behanceUrl: 'https://www.behance.net/gallery/123037589/THE-HOMIES-BARBER-SHOP'
    },
    {
      id: 'mmg-mexico',
      name: 'Mexico Milsim Group (MMG)',
      category: 'identidad',
      discipline: 'Heráldica Moderna · Parches & Identidad',
      image: '/portfolio/identidad/proyecto-14.jpg',
      description: 'Diseño de escudos vectoriales, parches tácticos sublimados y en PVC para comunidad táctica deportiva.',
      behanceUrl: 'https://www.behance.net/gallery/179049225/MMG-MEXICO-MILSIM-GROUP'
    }
  ];

  const filteredProjects = useMemo(() => {
    if (portfolioFilter === 'all') return portfolioProjects;
    return portfolioProjects.filter(p => p.category === portfolioFilter);
  }, [portfolioFilter]);

  // Cálculo estimativo del cotizador
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

📌 *Servicio:* ${serviceNameMap[quoteService] || quoteService}
📦 *Alcance:* ${scopeMap[quoteScope] || quoteScope}
⏱️ *Plazo:* ${urgencyMap[quoteUrgency]}
💰 *Estimado orientativo:* $${quoteEstimate.base.toLocaleString('es-MX')} MXN
${quoteNotes ? `📝 *Detalles de mi idea:* ${quoteNotes}\n` : ''}
¿Podríamos platicar sobre este proyecto?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#FAF9F5] text-stone-900 min-h-screen">
      
      {/* 1. HERO INSTITUCIONAL: WICHO NEMES & ARTESANO DIGITAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#101215] via-[#171a1f] to-[#1F2421] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        
        {/* Glows y atmósfera decorativa */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#e8b84f]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Tag de Encabezado */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#e8b84f] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
            <span>División de Servicios Digitales, Publicidad &amp; Marca</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Columna Izquierda: Mensaje y Filosofía */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.08]">
                Publicidad &amp; <br />
                <span className="text-[#e8b84f]">Desarrollo Digital</span>
              </h1>
              
              <p className="text-base sm:text-lg text-stone-300 font-normal leading-relaxed max-w-2xl">
                Unimos la estrategia de identidad, la rotulación comercial de gran formato, el desarrollo web interactivo y la manufactura física de taller en un solo flujo continuo.
              </p>

              {/* Puntos Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[#e8b84f] font-bold text-sm">01. Branding</div>
                  <div className="text-xs text-stone-400 mt-0.5">Marcas con sistema y voz</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-rose-400 font-bold text-sm">02. Gran Formato</div>
                  <div className="text-xs text-stone-400 mt-0.5">Lonas, vinil y rotulación</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-emerald-400 font-bold text-sm">03. Web &amp; 3D</div>
                  <div className="text-xs text-stone-400 mt-0.5">Pantallas y prototipos</div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('cotizador')}
                  className="px-6 py-3.5 rounded-2xl bg-[#e8b84f] hover:bg-[#d9a83e] text-[#121519] font-black text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-[#121519]" />
                  <span>Cotizar Proyecto a Medida</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('portafolio')}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Trabajos Realizados</span>
                </button>

                <a
                  href="/maquetado-inicio-wicho-v2/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3.5 rounded-2xl bg-transparent hover:bg-white/5 text-stone-400 hover:text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Abrir Portafolio UX (v2)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta de Wicho Nemes */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1d2228] to-[#14171b] border border-stone-700/60 p-6 sm:p-7 shadow-2xl">
                
                {/* Header de la tarjeta */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
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
                      <div className="font-heading font-black text-white text-base tracking-tight">Wicho Nemes</div>
                      <div className="text-[11px] text-[#e8b84f] font-bold">Diseñador Gráfico &amp; Digital</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    Taller Abierto
                  </span>
                </div>

                {/* Retrato y Presentación */}
                <div className="py-5 flex items-center gap-5">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 shrink-0 rounded-2xl bg-gradient-to-b from-[#252b33] to-[#121519] border border-white/15 overflow-hidden shadow-lg">
                    <img
                      src="/maquetado-inicio-wicho-v2/assets/perfil-sin-fondo.png"
                      alt="Wicho Nemes"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.src = '/brand/artesano_isotipo_transparente.png';
                      }}
                    />
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 leading-relaxed font-normal">
                    <p className="italic text-stone-200">
                      "Ideas claras. Diseño con intención. Cada pieza visual debe resolver un propósito comercial real."
                    </p>
                    <div className="text-[11px] text-stone-400">
                      📍 San Luis Potosí, SLP · Servicio local y nacional.
                    </div>
                  </div>
                </div>

                {/* Atajos Rápidos */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                  <span>8 Disciplinas Integradas</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('visor')}
                    className="text-[#e8b84f] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explorar maqueta UX</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 2. BARRA DE PESTAÑAS INTERNAS DE LA VISTA */}
      <div className="sticky top-20 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 overflow-x-auto py-2.5 scrollbar-none">
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
              onClick={() => setActiveTab('portafolio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'portafolio'
                  ? 'bg-[#17251E] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Portafolio de Proyectos</span>
              <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 text-[10px]">
                {portfolioProjects.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cotizador')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'cotizador'
                  ? 'bg-[#D4A359] text-[#17251E] shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Cotizador Rápido</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('visor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'visor'
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Visor Portafolio Completo</span>
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

      {/* 3. CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ================= PESTAÑA: SERVICIOS ================= */}
        {activeTab === 'servicios' && (
          <div className="space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                Lo que hacemos en el taller
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-stone-900 tracking-tight">
                Cinco disciplinas para impulsar tu negocio
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Desde diseñar tu logotipo o rotular tu fachada, hasta programar tu tienda web e imprimir piezas en 3D.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {servicesList.map((srv) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.id}
                    className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group"
                  >
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 group-hover:scale-105 transition-transform">
                          <Icon className="w-6 h-6 text-[#2D4F3E]" />
                        </div>
                        <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                          {srv.tag}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-stone-900 font-heading">
                          {srv.title}
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed font-normal">
                          {srv.summary}
                        </p>
                      </div>

                      {/* Lista de entregables */}
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Entregables incluidos:
                        </div>
                        <ul className="space-y-1.5">
                          {srv.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 font-normal">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-stone-100 space-y-3">
                      <div className="text-[11px] text-stone-500 italic bg-[#F7F4EC] p-2.5 rounded-xl border border-stone-200/60">
                        <strong>Ideal para:</strong> {srv.idealFor}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setQuoteService(srv.id === 'audiovisual' ? 'branding' : srv.id);
                          setActiveTab('cotizador');
                        }}
                        className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-[#2D4F3E] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Cotizar este servicio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Banner de Sinergia Físico + Digital */}
            <div className="rounded-3xl bg-gradient-to-r from-[#17251E] via-[#243B2F] to-[#1F2421] text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                  La ventaja única de Artesano Digital
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
                  ¿Por qué contratar diseño con quien también fabrica en taller?
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                  Los diseñadores de escritorio suelen diseñar cosas imposibles de imprimir o fabricar. En Artesano Digital diseñamos conociendo el gramaje del papel, las tolerancias del láser, las densidades de la lona y la retracción del plástico 3D. Tu proyecto saldrá perfecto a la primera.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('cotizador')}
                className="shrink-0 px-6 py-3.5 rounded-2xl bg-[#D4A359] hover:bg-[#c39247] text-[#17251E] font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Solicitar Asesoría de Taller
              </button>
            </div>

          </div>
        )}

        {/* ================= PESTAÑA: PORTAFOLIO ================= */}
        {activeTab === 'portafolio' && (
          <div className="space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                  Archivo de Trabajos Seleccionados
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900 tracking-tight">
                  Proyectos reales que cuentan historias
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-normal">
                  Marcas, empaques, productos físicos e interfaces creadas por Wicho Nemes.
                </p>
              </div>

              {/* Filtros de Categoría de Portafolio */}
              <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'identidad', label: 'Identidad & Marcas' },
                  { id: 'impresos', label: 'Impresos & Publicidad' },
                  { id: 'interfaces', label: 'Web & UI/UX' },
                  { id: 'modelado', label: '3D & Campañas' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPortfolioFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      portfolioFilter === f.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Proyectos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="relative h-56 bg-stone-100 overflow-hidden">
                    <img
                      src={proj.image}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/brand/og_artesano_preview.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {proj.discipline}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-black text-lg text-stone-900">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-normal">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <a
                        href={proj.behanceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#2D4F3E] hover:text-[#17251E] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Ver proyecto completo en Behance</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Acceso a las 8 áreas completas de OpenCode */}
            <div className="bg-stone-100 rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-stone-200">
              <h3 className="font-heading font-bold text-lg text-stone-900">
                ¿Quieres explorar el portafolio en su interfaz original de 8 áreas?
              </h3>
              <p className="text-xs text-stone-600 max-w-xl mx-auto font-normal">
                Identidad corporativa, Audiovisual, Animación, Ilustración, Modelado 3D, Diseño de interfaces, Medios impresos y Diseño editorial con editor interactivo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('visor')}
                  className="px-5 py-2.5 rounded-xl bg-[#17251E] text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Ver Visor Embebido Aquí
                </button>
                <a
                  href="/maquetado-inicio-wicho-v2/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center gap-1.5"
                >
                  <span>Abrir en Pestaña Independiente</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ================= PESTAÑA: COTIZADOR ================= */}
        {activeTab === 'cotizador' && (
          <div className="max-w-3xl mx-auto space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                Cotizador Interactivo de Publicidad &amp; Desarrollo
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900 tracking-tight">
                Configura tu proyecto y recíbelo por WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-normal">
                Selecciona la especialidad, el nivel de alcance y los plazos para obtener un estimado orientativo en tiempo real.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Paso 1: Tipo de Servicio */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-stone-500">
                  1. Selecciona la especialidad principal:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'branding', title: 'Diseño Gráfico & Branding', desc: 'Logo, identidad y manual' },
                    { id: 'publicidad', title: 'Publicidad, Lonas & Gran Formato', desc: 'Lonas, vinil y escaparates' },
                    { id: 'web', title: 'Desarrollo Web & Tienda Online', desc: 'Páginas web y catálogos' },
                    { id: 'modelado', title: 'Modelado 3D & Render', desc: 'Prototipado CAD y piezas' },
                    { id: 'combo', title: 'Paquete Integral Todo-en-Uno', desc: 'Marca + Web + Rotulación física' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setQuoteService(s.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        quoteService === s.id
                          ? 'border-[#2D4F3E] bg-[#2D4F3E]/5 ring-2 ring-[#2D4F3E]/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900">{s.title}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paso 2: Alcance / Nivel */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-stone-500">
                  2. Alcance o tamaño del proyecto:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'inicio', title: 'Inicio / Emprendedor', desc: 'Lo indispensable para arrancar bien' },
                    { id: 'estandar', title: 'Estándar Profesional', desc: 'El más completo y recomendado' },
                    { id: 'completo', title: 'Edición Integral VIP', desc: 'Máximo alcance y todo incluido' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setQuoteScope(lvl.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        quoteScope === lvl.id
                          ? 'border-[#D4A359] bg-[#D4A359]/10 ring-2 ring-[#D4A359]/30'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900">{lvl.title}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paso 3: Urgencia / Tiempo de Entrega */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-stone-500">
                  3. Plazo de entrega requerido:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQuoteUrgency('normal')}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                      quoteUrgency === 'normal'
                        ? 'border-[#2D4F3E] bg-[#2D4F3E] text-white'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    Plazo Estándar de Taller
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteUrgency('express')}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                      quoteUrgency === 'express'
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    ⚡ Entrega Prioritaria / Express
                  </button>
                </div>
              </div>

              {/* Paso 4: Notas o detalles opcionales */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-stone-500">
                  4. Cuéntanos brevemente tu idea (opcional):
                </label>
                <textarea
                  rows="3"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Ej: Necesito una lona de 3x2 metros para la fachada de mi cafetería y diseñar el logotipo con café y hojas..."
                  className="w-full p-3 rounded-2xl border border-stone-300 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2D4F3E]"
                />
              </div>

              {/* Resumen del Costo Estimado */}
              <div className="p-5 rounded-2xl bg-[#F7F4EC] border border-[#E8E4DA] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Inversión Estimada Orientativa
                    </div>
                    <div className="text-2xl font-black font-heading text-[#17251E]">
                      ${quoteEstimate.base.toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                  <span className="text-xs text-stone-500 font-medium text-right max-w-[180px]">
                    Sujeto a especificaciones finales y medidas exactas
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 leading-tight">
                  Incluye asesoría técnica de taller, pruebas de color o retícula previa y archivos vectoriales/maestros.
                </p>
              </div>

              {/* Botón de Envío al WhatsApp */}
              <button
                type="button"
                onClick={handleSendWhatsAppQuote}
                className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Enviar Especificaciones por WhatsApp a Wicho</span>
              </button>

            </div>

          </div>
        )}

        {/* ================= PESTAÑA: VISOR EMBEBIDO ================= */}
        {activeTab === 'visor' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-stone-900">
                  Visor Interactivo del Portafolio UX de Wicho Nemes (v2)
                </div>
                <div className="text-[11px] text-stone-500">
                  Explora las 8 áreas completas, el editor visual y los proyectos en su maqueta original.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/maquetado-inicio-wicho-v2/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-[#2D4F3E] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Pantalla Completa</span>
                </a>
              </div>
            </div>

            {/* Iframe que carga el servidor local o producción */}
            <div className="rounded-3xl border border-stone-300 overflow-hidden shadow-2xl bg-[#101215] h-[800px] w-full">
              <iframe
                src="/maquetado-inicio-wicho-v2/"
                title="Portafolio UX Wicho Nemes"
                className="w-full h-full border-0"
              />
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
