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
  MapPin,
  Share2,
  Copy,
  Check,
  Mail,
  Building2,
  Sliders,
  X,
  Plus
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  const [activeTab, setActiveTab] = useState('servicios');
  const [expandedService, setExpandedService] = useState('branding');
  
  // Alcance del Proyecto: Selección modular de productos con desglose en tiempo real
  const [selectedItemIds, setSelectedItemIds] = useState(['lona_2x1']);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('todas');
  const [quoteNotes, setQuoteNotes] = useState('');
  
  const alcanceRef = useRef(null);
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Estado de feedback al copiar enlace
  const [copiedLink, setCopiedLink] = useState(false);

  // URL canónica para compartir el portal de diseño y publicidad
  const sharePortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?world=servicios&tab=diseno`
    : 'https://artesano-digital.onrender.com/?world=servicios&tab=diseno';

  const sharePortalText = `Diseño gráfico, desarrollo web y gran formato por Wicho Nemes en Artesano Digital: identidad visual, tiendas online, lonas y modelado 3D: ${sharePortalUrl}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(sharePortalText)}`, '_blank');
  };

  const handleCopyShareLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sharePortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Diseño Gráfico, Web & Publicidad // Wicho Nemes',
        text: 'Soluciones visuales y digitales completas: branding, sitios web interactivos, gran formato y modelado 3D en San Luis Potosí.',
        url: sharePortalUrl
      }).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  const mailToClient = `mailto:?subject=${encodeURIComponent('Recomendación: Portafolio de Diseño y Publicidad de Wicho Nemes')}&body=${encodeURIComponent(
    `Hola:\n\nTe comparto el enlace al portafolio y servicios de diseño gráfico, desarrollo web, lonas y publicidad comercial de Wicho Nemes en Artesano Digital:\n\n${sharePortalUrl}\n\nSaludos.`
  )}`;

  // Catálogo de Servicios con Estructura de Color Profesional en Modo Oscuro (Formato Apps Unificado)
  const servicesList = [
    {
      id: 'branding',
      code: 'BRAND-01',
      icon: Palette,
      tag: 'Identidad Visual',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/30',
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
      code: 'LONAS-02',
      icon: Printer,
      tag: 'Gran Formato & Rotulación',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      activeBorder: 'border-rose-400 ring-2 ring-rose-400/30',
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
      code: 'WEB-03',
      icon: Globe,
      tag: 'E-Commerce & Digital',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/30',
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
      id: 'audiovisual',
      code: 'MEDIA-04',
      icon: Film,
      tag: 'Contenido & Editorial',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeBorder: 'border-purple-400 ring-2 ring-purple-400/30',
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

  const curService = servicesList.find(s => s.id === expandedService);

  // Catálogo detallado de productos y servicios para el Alcance del Proyecto
  const projectItemsCatalog = [
    // --- IDENTIDAD & BRANDING ---
    {
      id: 'logo_solo',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Diseño o Rediseño de Logotipo',
      subtitle: 'Solo logotipo principal',
      desc: 'Logo vectorial maestro (.AI, .PDF, .SVG) y versiones en alta resolución (.PNG transparente).',
      price: 1200,
      badge: 'Solo Logo'
    },
    {
      id: 'identidad_completa',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Identidad Visual & Branding Completo',
      subtitle: 'Sistema visual comercial',
      desc: 'Logotipo principal + isotipo + paleta de color oficial + tipografías + mini manual de marca.',
      price: 2500,
      badge: 'Marca Completa'
    },
    {
      id: 'vectorizado_logo',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Vectorización / Limpieza de Logo',
      subtitle: 'De foto o boceto a vectores',
      desc: 'Trazado y limpieza en curvas de un logotipo existente para que no se pixelee al imprimir.',
      price: 450,
      badge: 'Vectorizado'
    },
    {
      id: 'papeleria_redes',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Diseño de Papelería & Redes Sociales',
      subtitle: 'Tarjetas, membrete y avatares',
      desc: 'Diseño de tarjeta comercial, hoja membretada digital y kit de portadas/perfil para tus redes.',
      price: 750,
      badge: 'Papelería'
    },

    // --- PUBLICIDAD, LONAS & GRAN FORMATO ---
    {
      id: 'lona_1x1',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 1.0 × 1.0 m',
      subtitle: '1 m² lista para instalar',
      desc: 'Impresión en lona frontlite 13oz de alta resolución con bastilla perimetral reforzada y ojillos metálicos.',
      price: 260,
      badge: '1.0 × 1.0 m'
    },
    {
      id: 'lona_2x1',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 2.0 × 1.0 m',
      subtitle: '2 m² estándar de fachada',
      desc: 'El tamaño más solicitado para avisos de fachada, negocios y locales. Impresión HD con ojillos perimetrales.',
      price: 480,
      badge: '2.0 × 1.0 m · Popular'
    },
    {
      id: 'lona_3x1_5',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Gran Formato 3.0 × 1.5 m',
      subtitle: '4.5 m² alta visibilidad exterior',
      desc: 'Ideal para marquesinas comerciales, inauguraciones y muros de alto tráfico visual. Máxima durabilidad.',
      price: 950,
      badge: '3.0 × 1.5 m'
    },
    {
      id: 'lona_medida_especial',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona a Medida Especial (por m²)',
      subtitle: 'Cualquier dimensión que requieras',
      desc: 'Base por metro cuadrado para toldos, estructuras grandes o medidas específicas para tu local.',
      price: 190,
      badge: 'Estimado / m²'
    },
    {
      id: 'vinil_rotulacion',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Vinil Adhesivo o Microperforado',
      subtitle: 'Para cristales, muros o autos',
      desc: 'Vinil microperforado para aparadores (permite ver hacia afuera) o vinil opaco para corte y rotulación.',
      price: 380,
      badge: 'Estimado / m²'
    },

    // --- EDITORIAL, MENÚS & CATÁLOGOS ---
    {
      id: 'catalogo_digital',
      category: 'editorial',
      categoryLabel: 'Catálogos & Editorial',
      title: 'Catálogo de Productos Digital (PDF)',
      subtitle: 'Con enlaces de compra / WhatsApp',
      desc: 'Diseño y diagramación de tus productos con fotos, descripciones, precios y botones directos a WhatsApp.',
      price: 1600,
      badge: 'Catálogo PDF'
    },
    {
      id: 'menu_restaurante',
      category: 'editorial',
      categoryLabel: 'Catálogos & Editorial',
      title: 'Diseño de Menú / Carta para Restaurante',
      subtitle: 'Formato digital (QR) o impreso',
      desc: 'Estructuración clara de platillos, bebidas y promociones con tipografía legible y presentación atractiva.',
      price: 850,
      badge: 'Menú / QR'
    },
    {
      id: 'folleto_triptico',
      category: 'editorial',
      categoryLabel: 'Catálogos & Editorial',
      title: 'Folleto Publicitario Díptico o Tríptico',
      subtitle: 'Diseño listo para imprenta',
      desc: 'Folleto informativo de tus servicios con jerarquía visual cuidada y archivos en alta resolución.',
      price: 650,
      badge: 'Díptico / Tríptico'
    },
    {
      id: 'tarjetas_millar',
      category: 'editorial',
      categoryLabel: 'Catálogos & Editorial',
      title: 'Tarjetas de Presentación (Diseño + Millar)',
      subtitle: '1,000 pzas impresas a color',
      desc: 'Diseño profesional personalizado + impresión de 1,000 tarjetas frente y vuelta con laminado mate o brillante.',
      price: 620,
      badge: '1,000 tarjetas'
    },

    // --- DESARROLLO WEB & DIGITAL ---
    {
      id: 'landing_comercial',
      category: 'web',
      categoryLabel: 'Web & Digital',
      title: 'Landing Page Comercial (Una Página)',
      subtitle: 'Página de venta y captación',
      desc: 'Sitio de una sola página optimizado para conversiones rápidas, promociones y pedidos directos a WhatsApp.',
      price: 2800,
      badge: 'Landing Page'
    },
    {
      id: 'sitio_catalogo',
      category: 'web',
      categoryLabel: 'Web & Digital',
      title: 'Sitio Web Completo / Catálogo Multi-sección',
      subtitle: 'Plataforma empresarial moderna',
      desc: 'Sitio con múltiples secciones (Inicio, Catálogo, Servicios, Contacto, Mapa) ultra rápido y responsivo.',
      price: 5800,
      badge: 'Sitio Multi-página'
    },
    {
      id: 'pack_redes',
      category: 'web',
      categoryLabel: 'Web & Digital',
      title: 'Pack de Plantillas para Redes Sociales',
      subtitle: 'Banners y promociones',
      desc: 'Diseño de 6 a 8 piezas gráficas optimizadas para anuncios y publicaciones de Facebook e Instagram.',
      price: 950,
      badge: 'Pack Redes'
    }
  ];

  // Alternar selección de un producto con clic
  const toggleItem = (itemId) => {
    setSelectedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const filteredCatalog = useMemo(() => {
    if (activeCategoryFilter === 'todas') return projectItemsCatalog;
    return projectItemsCatalog.filter((item) => item.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  const selectedItems = useMemo(() => {
    return projectItemsCatalog.filter((item) => selectedItemIds.includes(item.id));
  }, [selectedItemIds]);

  const totalEstimate = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price, 0);
  }, [selectedItems]);

  const handleOpenAlcance = (serviceCategory) => {
    if (serviceCategory) {
      const catMap = {
        branding: 'branding',
        publicidad: 'publicidad',
        web: 'web',
        audiovisual: 'editorial'
      };
      if (catMap[serviceCategory]) {
        setActiveCategoryFilter(catMap[serviceCategory]);
      }
    }
    setTimeout(() => {
      const el = document.getElementById('alcance-proyecto') || alcanceRef.current;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleSendWhatsAppScope = () => {
    const itemsListText = selectedItems.length > 0
      ? selectedItems.map((i) => `• ${i.title} (${i.badge}) — $${i.price.toLocaleString('es-MX')} MXN`).join('\n')
      : '• Proyecto a la medida (por definir)';

    const text = `Hola Wicho / Artesano Digital,
Armé el *Alcance de mi Proyecto* en tu portal:

${itemsListText}

*Inversión Total Desglosada:* $${totalEstimate.toLocaleString('es-MX')} MXN
${quoteNotes.trim() ? `\n*Detalles / Medidas:* ${quoteNotes.trim()}\n` : ''}
¿Podemos platicar sobre este proyecto para confirmar tiempos de entrega?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#0B0D11] text-stone-100 min-h-screen selection:bg-[#e8b84f] selection:text-[#0B0D11]">
      
      {/* 1. HERO INSTITUCIONAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080A0D] via-[#101319] to-[#0D1015] text-white pt-6 pb-10 sm:pt-10 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80">
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.08]">
            Diseño &amp; <br />
            <span className="text-[#e8b84f]">Publicidad</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-xl">
            Estrategia de identidad, lonas de gran formato, rotulación en vinil, desarrollo web interactivo y producción publicitaria.
          </p>

          {/* Botón de Acción Principal Directo al Alcance del Proyecto */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleOpenAlcance()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#d4a359] hover:to-[#c29235] text-[#0B0D11] font-black text-xs sm:text-sm transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Armar Alcance del Proyecto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

      {/* 2. CONTENIDO PRINCIPAL FLUIDO Y COMPACTO (SIN BARRAS REDUNDANTES) */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">

        {/* ================= SECCIÓN 1: ESPECIALIDADES & APLICACIONES (ESTRUCTURA UNIFICADA APP-GRID) ================= */}
        <section id="especialidades-creativas" className="space-y-6 animate-fadeIn">

          {/* Encabezado con Código de Área y Subtítulo */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#e8b84f] flex items-center gap-2">
                  <span className="w-5 h-px bg-[#e8b84f]" />
                  <span>01 / Especialidades &amp; Portafolio Creativo</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Soluciones de Identidad, Gran Formato y Web
                </h2>
              </div>
              <p className="text-xs text-stone-400 font-mono hidden md:block text-right">
                Haz clic en cualquier aplicación para desplegar entregables, especificaciones y cotización.
              </p>
            </div>

            {/* Cuadrícula Adaptativa de Tarjetas Cuadradas tipo Apps (4 Especialidades Oficiales) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {servicesList.map(srv => {
                const isSelected = expandedService === srv.id;
                const IconComp = srv.icon;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setExpandedService(isSelected ? '' : srv.id)}
                    className={`rounded-2xl border transition-all duration-200 p-3 sm:p-4 cursor-pointer select-none flex flex-col justify-between hover:-translate-y-0.5 ${
                      isSelected
                        ? `${srv.activeBorder} bg-[#141822] shadow-xl`
                        : 'border-stone-800 bg-[#0E1218] hover:border-stone-700 active:scale-[0.98]'
                    }`}
                  >
                    {/* Fila superior: Código de aplicación y Acción */}
                    <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] pb-2 border-b border-white/5">
                      <span className={`font-bold ${isSelected ? 'text-white' : 'text-stone-400'}`}>
                        {srv.code}
                      </span>
                      <span className="text-[8.5px] sm:text-[9.5px] font-sans font-medium flex items-center gap-0.5 text-stone-400">
                        <span>{isSelected ? 'Cerrar' : 'Ver ficha'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
                      </span>
                    </div>

                    {/* Contenido: Icono en cuadro con su código de color correspondiente */}
                    <div className="pt-3 space-y-2.5">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${srv.iconBg} ${
                        isSelected ? 'scale-105 shadow-md' : ''
                      }`}>
                        <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <div>
                        {/* Etiqueta encerrada en su recuadro estructurado */}
                        <span className={`inline-block text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${srv.badgeColor}`}>
                          {srv.tag}
                        </span>

                        <h3 className="text-xs sm:text-sm font-extrabold text-white mt-1 leading-snug line-clamp-2">
                          {srv.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ficha Técnica / Creativa Desplegada Hasta Abajo (Estilo Industrial Unificado) */}
            {curService && (() => {
              const IconComp = curService.icon;

              return (
                <div className={`rounded-2xl border ${curService.activeBorder} bg-[#0D1016] p-4 sm:p-6 shadow-2xl relative overflow-hidden animate-fadeIn space-y-4`}>
                  
                  {/* Cabecera de la Ficha Técnica */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${curService.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-stone-400">
                            {curService.code}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${curService.badgeColor}`}>
                            {curService.tag}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-xl font-black text-white mt-0.5">
                          {curService.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setExpandedService('')}
                        className="px-2.5 py-1 rounded-lg text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer transition-colors"
                      >
                        ✕ Cerrar detalle
                      </button>
                    </div>
                  </div>

                  {/* Resumen / Descripción */}
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                    {curService.summary}
                  </p>

                  {/* Entregables incluidos en recuadros estructurados oscuros */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                      Servicios y entregables incluidos:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                      {curService.deliverables.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#141822] border border-stone-800/80 flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${curService.checkColor}`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-stone-200 text-xs font-sans leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cuadro: Ideal para */}
                  <div className="p-3 rounded-xl bg-[#10141C] border border-stone-800/80 text-xs text-stone-300 flex items-start gap-2">
                    <strong className="text-white shrink-0">Ideal para:</strong>
                    <span>{curService.idealFor}</span>
                  </div>

                  {/* Pie de la Ficha Técnica (Sin botones redundantes) */}
                  <div className="pt-2 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-stone-400 font-mono">
                      Especialidad técnica · Entregables garantizados por Wicho Nemes
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenAlcance(curService.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#f0c765] hover:to-[#e8b84f] text-[#0A0D11] font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Elegir productos en Alcance del Proyecto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })()}

        </section>

        {/* ================= SECCIÓN 2: ALCANCE DEL PROYECTO (SELECCIÓN MODULAR CON DESGLOSE) ================= */}
        <section id="alcance-proyecto" ref={alcanceRef} className="space-y-6 pt-6 border-t border-stone-800 animate-fadeIn">
          
          {/* Encabezado del Alcance del Proyecto */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-800/80 pb-3">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#e8b84f] flex items-center gap-2">
                <span className="w-5 h-px bg-[#e8b84f]" />
                <span>02 / Alcance del Proyecto</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Elige con un Clic los Productos que Necesitas
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                Selecciona solo lo que requieres (ej. solo tu logo, solo una lona o solo un catálogo). Combina a tu gusto y revisa el desglose con precios estimados en tiempo real.
              </p>
            </div>
            <span className="text-xs text-stone-400 font-mono hidden sm:inline self-end">
              {selectedItems.length} {selectedItems.length === 1 ? 'producto elegido' : 'productos elegidos'}
            </span>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'todas', label: 'Todos los productos' },
              { id: 'publicidad', label: 'Lonas & Gran Formato' },
              { id: 'branding', label: 'Identidad & Marca' },
              { id: 'editorial', label: 'Catálogos & Menús' },
              { id: 'web', label: 'Web & Digital' }
            ].map((tab) => {
              const isActive = activeCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#e8b84f] text-[#0B0D11] border-[#e8b84f] shadow-md'
                      : 'bg-[#141822] text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Cuadrícula de Productos Seleccionables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredCatalog.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between gap-2.5 relative hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-[#e8b84f] bg-[#1a1c22] shadow-xl ring-2 ring-[#e8b84f]/25'
                      : 'border-stone-800/90 bg-[#0F1218] hover:border-stone-700 hover:bg-[#141820]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-[#e8b84f]/20 text-[#e8b84f] border-[#e8b84f]/40'
                          : 'bg-stone-800/60 text-stone-400 border-stone-700/50'
                      }`}>
                        {item.badge}
                      </span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-[#e8b84f] text-[#0B0D11] border-[#e8b84f]'
                          : 'border-stone-700 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-white leading-snug pt-0.5">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {item.categoryLabel}
                    </span>
                    <span className="text-xs font-black font-mono text-[#e8b84f]">
                      ${item.price.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESGLOSE Y RESUMEN DEL ALCANCE CON PRECIOS */}
          <div className="bg-[#10131A] rounded-3xl border border-stone-800 p-4 sm:p-6 shadow-2xl space-y-4 text-white">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#e8b84f]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Resumen de tu Alcance ({selectedItems.length} {selectedItems.length === 1 ? 'ítem' : 'ítems'})
                </h3>
              </div>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedItemIds([])}
                  className="text-[10px] text-stone-400 hover:text-rose-400 font-mono underline cursor-pointer"
                >
                  Limpiar selección
                </button>
              )}
            </div>

            {/* Lista Desglosada */}
            {selectedItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/30 border border-dashed border-stone-800 text-center space-y-1">
                <p className="text-xs text-stone-300 font-medium">
                  Aún no has seleccionado ningún producto.
                </p>
                <p className="text-[11px] text-stone-500">
                  Haz clic en las tarjetas de arriba para añadir tu lona, logotipo, catálogo o sitio web a la cotización.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#141822] border border-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="w-4 h-4 rounded-full bg-[#e8b84f]/20 text-[#e8b84f] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-stone-100 font-bold truncate">{item.title}</span>
                      <span className="text-[10px] text-stone-400 font-mono hidden sm:inline shrink-0">
                        ({item.badge})
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[#e8b84f] font-mono font-bold">
                        ${item.price.toLocaleString('es-MX')} MXN
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
                        className="text-stone-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                        title="Quitar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TARJETA DESTACADA DE INVERSIÓN TOTAL ESTIMADA Y BOTÓN DIRECTO DE WHATSAPP */}
            <div className="pt-2 border-t border-stone-800/80 space-y-3">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141820] to-[#1C2532] text-white shadow-2xl border border-[#e8b84f]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#e8b84f] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Inversión Total Desglosada:</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-[#e8b84f] tracking-tight">
                    ${totalEstimate.toLocaleString('es-MX')} <span className="text-xs font-normal text-stone-300">MXN</span>
                  </div>
                  <div className="text-[11px] text-stone-300">
                    {selectedItems.length > 0
                      ? `${selectedItems.length} ${selectedItems.length === 1 ? 'servicio / producto seleccionado' : 'servicios / productos seleccionados'}`
                      : 'Selección vacía'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsAppScope}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Cotizar este Alcance por WhatsApp</span>
                </button>
              </div>

              {/* CAMPO DE NOTAS / MEDIDAS ESPECIALES */}
              <div className="p-3.5 rounded-2xl bg-[#080A0E] border border-stone-800 space-y-1.5">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
                  <span>¿Tienes medidas especiales o especificaciones adicionales? (opcional):</span>
                </label>
                <textarea
                  rows="2"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Ej. La lona la requiero para una estructura de 4.2 × 1.8 metros, o requiero que el menú incluya 3 secciones..."
                  className="w-full p-2.5 rounded-xl border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#e8b84f] bg-[#141820]"
                />
                <p className="text-[10px] text-stone-400">
                  Tus especificaciones y los productos seleccionados se adjuntarán automáticamente en tu mensaje de WhatsApp.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ================= SECCIÓN PORTAFOLIO PERSONAL DE WICHO NEMES (AL FINAL) ================= */}
        <div className="pt-8 sm:pt-10 border-t border-stone-800/80 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#e8b84f]">
              Portafolio &amp; Diseñador
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-heading">
              ¿Quieres revisar proyectos anteriores antes de cotizar?
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Conoce el trabajo de Wicho Nemes y las soluciones creadas para otros negocios y marcas.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
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

        {/* ========================================================
            SECCIÓN: COMPARTIR ESTE PORTAL DE DISEÑO Y PUBLICIDAD
            ======================================================== */}
        <section className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-stone-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="rounded-2xl border border-[#e8b84f]/35 bg-[#0E1218] p-4 sm:p-7 shadow-2xl relative overflow-hidden">
              
              {/* Rejilla sutil de fondo */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              <div className="relative space-y-5">
                
                {/* Encabezado */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#e8b84f]">
                    <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
                    <span>Diseño Gráfico, Web &amp; Gran Formato</span>
                  </div>
                  
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    ¿Conoces a un emprendedor o negocio que necesite identidad, web o publicidad?
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
                    Comparte este portafolio con tu equipo, socios o colegas. Soluciones visuales completas desde San Luis Potosí: tiendas en línea, logotipos comerciales, lonas de gran formato, rotulación y modelado 3D por Wicho Nemes.
                  </p>
                </div>

                {/* Ficha Visual de Vista Previa del Enlace */}
                <div className="p-3 sm:p-4 rounded-xl bg-[#070A0E] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono overflow-hidden">
                  <div className="space-y-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-[#e8b84f] text-[9.5px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e8b84f]" />
                      <span>ARTESANO DIGITAL · DISEÑO &amp; PUBLICIDAD</span>
                    </div>
                    <div className="text-white font-sans font-semibold text-xs sm:text-sm truncate">
                      Portafolio y Servicios Creativos por Wicho Nemes
                    </div>
                    <div className="text-gray-400 text-[10.5px] truncate font-mono">
                      {sharePortalUrl}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-[#e8b84f]/15 text-[#e8b84f] border border-[#e8b84f]/30 text-[9.5px] shrink-0 font-bold self-start sm:self-auto">
                    Atención Directa · San Luis Potosí
                  </span>
                </div>

                {/* Botones de Acción para Compartir */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
                  
                  {/* 1. Compartir por WhatsApp */}
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-black text-transparent" />
                    <span>Compartir por WhatsApp</span>
                  </button>

                  {/* 2. Copiar Enlace Directo con feedback */}
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className={`w-full py-2.5 sm:py-3 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                      copiedLink
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/10'
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>¡Enlace copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#e8b84f]" />
                        <span>Copiar enlace directo</span>
                      </>
                    )}
                  </button>

                  {/* 3. Compartir en Celular (Nativo) o Enviar por Correo */}
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-[#e8b84f] hover:bg-[#d4a359] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg sm:hidden"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir desde tu celular</span>
                  </button>

                  <a
                    href={mailToClient}
                    className="hidden sm:inline-flex w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-bold items-center justify-center gap-2 transition-all cursor-pointer text-center"
                  >
                    <Mail className="w-4 h-4 text-[#e8b84f]" />
                    <span>Recomendar por Correo</span>
                  </a>

                </div>

                {/* Mensaje de cortesía */}
                <div className="text-[10px] sm:text-[10.5px] text-gray-400 font-mono text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-1 pt-2 border-t border-white/5">
                  <span>Trato directo con el diseñador y cotizaciones de proyecto a medida.</span>
                  <span className="text-[#e8b84f] font-bold">San Luis Potosí · Envíos nacionales</span>
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
