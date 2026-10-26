import React, { useState, useMemo, useRef } from 'react';
import {
  Palette,
  Globe,
  Printer,
  Film,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  DollarSign,
  Eye,
  Sparkles,
  MapPin,
  Share2,
  Copy,
  Check,
  Mail,
  Sliders,
  X,
  Info
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  const [expandedService, setExpandedService] = useState('branding');
  
  // Alcance del Proyecto: Selección modular de productos con desglose en tiempo real
  const [selectedItemIds, setSelectedItemIds] = useState(['lona_2x1']);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('publicidad');
  const [quoteNotes, setQuoteNotes] = useState('');
  
  const alcanceRef = useRef(null);
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Estado de feedback al copiar enlace
  const [copiedLink, setCopiedLink] = useState(false);

  // URL canónica para compartir el portal de diseño y publicidad
  const sharePortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?world=servicios&tab=diseno`
    : 'https://artesano-digital.onrender.com/?world=servicios&tab=diseno';

  const sharePortalText = `Diseño gráfico, desarrollo web y gran formato por Wicho Nemes en Artesano Digital: identidad visual, tiendas online, lonas y producción publicitaria: ${sharePortalUrl}`;

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
        text: 'Soluciones visuales y digitales completas: branding, sitios web interactivos, gran formato y publicidad en San Luis Potosí.',
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
      code: 'PRINT-02',
      icon: Printer,
      tag: 'Lonas & Gran Formato',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/30',
      accentBar: 'bg-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      checkColor: 'text-emerald-400 bg-emerald-500/20',
      title: 'Lonas, Vinil & Rotulación Comercial',
      summary: 'Impresión digital de alta resolución para fachadas, eventos, exposiciones y puntos de venta.',
      deliverables: [
        'Lonas frontlite 13oz con bastilla perimetral y ojillos reforzados',
        'Rotulación en vinil de corte e impreso para cristales y vehículos',
        'Microperforado con protección UV para locales comerciales',
        'Banners roll-up portátiles con estructura metálica y maletín',
        'Señalética industrial, cuadros decorativos y placas de acrílico'
      ],
      idealFor: 'Comercios que requieren visibilidad exterior, inauguraciones, promociones y rotulación física.'
    },
    {
      id: 'web',
      code: 'DEV-03',
      icon: Globe,
      tag: 'Desarrollo Web',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/30',
      accentBar: 'bg-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      checkColor: 'text-cyan-400 bg-cyan-500/20',
      title: 'Desarrollo Web, Catálogos & Tiendas Online',
      summary: 'Sitios web modernos, veloces y adaptados a celulares, con catálogo interactivo y cotizador directo por WhatsApp.',
      deliverables: [
        'Sitios web responsivos y optimizados para celular',
        'Catálogo digital interactivo con buscador y filtro por áreas',
        'Integración de checkout directo a WhatsApp con resumen de pedido',
        'Panel de administración local para gestionar productos y precios',
        'Dominio, hosting seguro con SSL y alta en Google'
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
      title: 'Diseño Editorial, Menús & Contenido Digital',
      summary: 'Producción de piezas para redes sociales, catálogos en PDF, menús digitales y diseño para imprenta.',
      deliverables: [
        'Catálogos digitales en PDF con botones interactivos a WhatsApp',
        'Menús digitales para restaurantes y cafeterías',
        'Packs de plantillas y gráficos promocionales para redes sociales',
        'Flyers, folletos trípticos y volantes listos para imprenta',
        'Presentaciones corporativas y material comercial de ventas'
      ],
      idealFor: 'Restaurantes, prestadores de servicios y marcas que promocionan sus productos en redes.'
    }
  ];

  const curService = servicesList.find(s => s.id === expandedService);

  // Catálogo detallado de productos y servicios con precios pequeños y discretos
  const projectItemsCatalog = [
    // --- PUBLICIDAD, LONAS & GRAN FORMATO ---
    {
      id: 'lona_1x1',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 1.0 × 1.0 m',
      subtitle: '1 m² lista para colgar · Bastilla y ojillos',
      desc: 'Impresión en lona frontlite 13oz de alta resolución. Bastilla perimetral y ojillos metálicos.',
      price: 260,
      badge: '1.0 × 1.0 m',
      isPrint: true
    },
    {
      id: 'lona_2x1',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 2.0 × 1.0 m',
      subtitle: '2 m² comercial · La medida más solicitada',
      desc: 'Medida ideal para fachadas de negocios, promociones y eventos. Bastilla y ojillos cada metro.',
      price: 490,
      badge: '2.0 × 1.0 m',
      isPrint: true
    },
    {
      id: 'lona_3x2',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 3.0 × 2.0 m',
      subtitle: '6 m² gran visibilidad exterior',
      desc: 'Gran formato para eventos, espectaculares ligeros o marquesinas comerciales.',
      price: 1350,
      badge: '3.0 × 2.0 m',
      isPrint: true
    },
    {
      id: 'rotulacion_vinil',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Rotulación en Vinil Adhesivo m²',
      subtitle: 'Por metro cuadrado instalado o para aplicar',
      desc: 'Vinil de corte o impreso en alta resolución para cristales, muros lisos o vehículos.',
      price: 380,
      badge: 'Vinil m²',
      isPrint: true
    },
    {
      id: 'microperforado',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Vinil Microperforado para Cristales m²',
      subtitle: 'Privacidad interior con visión hacia afuera',
      desc: 'Deja pasar la luz y muestra tu publicidad al exterior. Ideal para fachadas y medallones.',
      price: 420,
      badge: 'Microperforado',
      isPrint: true
    },
    {
      id: 'banner_roll_up',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Banner Roll-Up Retráctil 0.85 × 2.0 m',
      subtitle: 'Estructura de aluminio + lona impresa',
      desc: 'Portátil y ligero. Incluye base de aluminio retráctil, lona impresa y bolsa de transporte.',
      price: 1150,
      badge: 'Roll-Up',
      isPrint: true
    },

    // --- IDENTIDAD & BRANDING ---
    {
      id: 'logo_solo',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Diseño de Logotipo Principal',
      subtitle: 'Solo logotipo vectorial maestro',
      desc: 'Logo vectorial (.AI, .PDF, .SVG) y versiones en alta resolución (.PNG transparente).',
      price: 1200,
      badge: 'Solo Logo'
    },
    {
      id: 'identidad_completa',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Identidad Visual & Branding Completo',
      subtitle: 'Logo + Isotipo + Paleta + Manual de Marca',
      desc: 'Logotipo principal + isotipo + paleta de color oficial + tipografías + guía de aplicación.',
      price: 2500,
      badge: 'Marca Completa'
    },
    {
      id: 'vectorizado_logo',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Vectorización / Limpieza de Logo',
      subtitle: 'De foto o boceto a curvas nítidas',
      desc: 'Trazado profesional en curvas de un logotipo existente para que no se pixelee al imprimir.',
      price: 450,
      badge: 'Vectorizado'
    },
    {
      id: 'papeleria_redes',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Diseño de Papelería & Redes Sociales',
      subtitle: 'Tarjetas comerciales, membrete y avatares',
      desc: 'Diseño de tarjeta comercial, hoja membretada digital y kit de portadas/perfil para tus redes.',
      price: 750,
      badge: 'Papelería'
    },

    // --- DESARROLLO WEB & DIGITAL ---
    {
      id: 'landing_web',
      category: 'web',
      categoryLabel: 'Web & Digital',
      title: 'Sitio Web / Landing Page Comercial',
      subtitle: '1 página responsiva adaptada a celular',
      desc: 'Página web moderna, rápida y con botón de WhatsApp. Muestra tus servicios y ubicación.',
      price: 2900,
      badge: 'Landing Web'
    },
    {
      id: 'tienda_catalogo',
      category: 'web',
      categoryLabel: 'Web & Digital',
      title: 'Tienda Online / Catálogo WhatsApp',
      subtitle: 'Con carrito de compras y pedidos directos',
      desc: 'Plataforma con catálogo interactivo, buscador, carrito y recepción de pedidos por WhatsApp.',
      price: 5800,
      badge: 'Tienda Online'
    },

    // --- CONTENIDO EDITORIAL & MENÚS ---
    {
      id: 'catalogo_pdf',
      category: 'editorial',
      categoryLabel: 'Editorial & Redes',
      title: 'Catálogo Digital PDF Interactivo',
      subtitle: 'Para celular con enlaces a WhatsApp',
      desc: 'Documento PDF diseñado para compartir por WhatsApp con botones directos de compra o consulta.',
      price: 850,
      badge: 'Catálogo PDF'
    },
    {
      id: 'menu_digital',
      category: 'editorial',
      categoryLabel: 'Editorial & Redes',
      title: 'Menú Digital para Restaurante o Bar',
      subtitle: 'Para lectura en móvil o código QR',
      desc: 'Diseño claro y apetecible con fotos, precios y categorías para restaurantes y cafeterías.',
      price: 750,
      badge: 'Menú Digital'
    },
    {
      id: 'pack_flyers_6',
      category: 'editorial',
      categoryLabel: 'Editorial & Redes',
      title: 'Paquete 6 Diseños para Redes Sociales',
      subtitle: 'Posts o historias promocionales',
      desc: '6 piezas gráficas con la identidad de tu marca para promocionar tus productos del mes.',
      price: 600,
      badge: '6 Posts Redes'
    },
    {
      id: 'volante_impreso',
      category: 'editorial',
      categoryLabel: 'Editorial & Redes',
      title: 'Diseño de Volante / Flyer Publicitario',
      subtitle: '1 o 2 caras listo para imprenta',
      desc: 'Diseño publicitario con jerarquía visual y texto comercial listo para impresión masiva.',
      price: 450,
      badge: 'Flyer'
    }
  ];

  // Alternar selección de un ítem
  const toggleItem = (itemId) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Filtrado de productos por categoría
  const filteredCatalog = useMemo(() => {
    if (activeCategoryFilter === 'todas') return projectItemsCatalog;
    return projectItemsCatalog.filter(item => item.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Lista de ítems seleccionados
  const selectedItems = useMemo(() => {
    return projectItemsCatalog.filter(item => selectedItemIds.includes(item.id));
  }, [selectedItemIds]);

  // Total acumulado estimado
  const totalEstimate = useMemo(() => {
    return selectedItems.reduce((acc, cur) => acc + cur.price, 0);
  }, [selectedItems]);

  // Envío a WhatsApp con el desglose exacto
  const handleSendWhatsAppScope = () => {
    if (selectedItems.length === 0) {
      alert('Por favor selecciona al menos un producto o servicio para cotizar.');
      return;
    }

    const itemsListText = selectedItems
      .map(item => `• *${item.title}* (${item.subtitle}): $${item.price.toLocaleString('es-MX')} MXN`)
      .join('\n');

    const hasPrintItems = selectedItems.some(i => i.isPrint);

    const text = `Hola Wicho, me interesa cotizar los siguientes productos de tu portal de *Diseño & Publicidad*:

${itemsListText}

*Inversión Total Estimada:* $${totalEstimate.toLocaleString('es-MX')} MXN
${hasPrintItems ? `_(Nota: Los precios de impresión no incluyen diseño gráfico)_\n` : ''}${quoteNotes.trim() ? `\n• *Detalles / Medidas:* ${quoteNotes.trim()}\n` : ''}
¿Podemos platicar sobre este proyecto?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#0B0D11] text-stone-100 min-h-screen selection:bg-[#e8b84f] selection:text-[#0B0D11]">
      
      {/* 1. HERO INSTITUCIONAL LIMPIO (SIN BOTONES REDUNDANTES) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080A0D] via-[#101319] to-[#0D1015] text-white pt-5 pb-6 sm:pt-8 sm:pb-9 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80">
        <div className="max-w-4xl mx-auto relative z-10 space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight leading-[1.1]">
            Diseño &amp; <span className="text-[#e8b84f]">Publicidad</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-xl">
            Identidad visual, lonas de gran formato, rotulación en vinil, desarrollo web interactivo y producción publicitaria.
          </p>
        </div>
      </section>

      {/* 2. CONTENIDO PRINCIPAL COMPACTO Y SIN SCROLL EXCESIVO */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-8 sm:space-y-10">

        {/* ================= SECCIÓN 1: ESPECIALIDADES & APLICACIONES (4 APPS CUADRADAS) ================= */}
        <section id="especialidades-creativas" className="space-y-4 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-stone-800 pb-2.5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b84f] flex items-center gap-1.5">
                <span className="w-4 h-px bg-[#e8b84f]" />
                <span>01 / Especialidades &amp; Portafolio</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Soluciones de Identidad, Gran Formato y Web
              </h2>
            </div>
            <p className="text-[11px] text-stone-400 font-mono hidden md:block">
              Toca una especialidad para ver detalles y entregables.
            </p>
          </div>

          {/* Cuadrícula de 4 Especialidades tipo Apps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3.5">
            {servicesList.map(srv => {
              const isSelected = expandedService === srv.id;
              const IconComp = srv.icon;

              return (
                <div
                  key={srv.id}
                  onClick={() => setExpandedService(isSelected ? '' : srv.id)}
                  className={`rounded-2xl border transition-all duration-200 p-2.5 sm:p-3.5 cursor-pointer select-none flex flex-col justify-between hover:-translate-y-0.5 ${
                    isSelected
                      ? `${srv.activeBorder} bg-[#141822] shadow-xl`
                      : 'border-stone-800 bg-[#0E1218] hover:border-stone-700 active:scale-[0.98]'
                  }`}
                >
                  {/* Fila superior: Código de aplicación y Acción */}
                  <div className="flex items-center justify-between font-mono text-[8.5px] sm:text-[9.5px] pb-1.5 border-b border-white/5">
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-stone-400'}`}>
                      {srv.code}
                    </span>
                    <span className="text-[8.5px] font-sans font-medium flex items-center gap-0.5 text-stone-400">
                      <span>{isSelected ? 'Cerrar' : 'Ver'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
                    </span>
                  </div>

                  {/* Contenido: Icono en cuadro con su código de color */}
                  <div className="pt-2 sm:pt-2.5 space-y-2">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${srv.iconBg} ${
                      isSelected ? 'scale-105 shadow-md' : ''
                    }`}>
                      <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <div>
                      <span className={`inline-block text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${srv.badgeColor}`}>
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

          {/* Ficha Técnica Desplegada (Limpia, sin botones redundantes de cotizar) */}
          {curService && (() => {
            const IconComp = curService.icon;

            return (
              <div className={`rounded-2xl border ${curService.activeBorder} bg-[#0D1016] p-3.5 sm:p-5 shadow-2xl relative overflow-hidden animate-fadeIn space-y-3.5`}>
                
                {/* Cabecera de la Ficha Técnica */}
                <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl ${curService.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-stone-400">
                          {curService.code}
                        </span>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${curService.badgeColor}`}>
                          {curService.tag}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                        {curService.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedService('')}
                    className="px-2 py-1 rounded-lg text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer transition-colors shrink-0"
                  >
                    ✕ Cerrar
                  </button>
                </div>

                {/* Resumen */}
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  {curService.summary}
                </p>

                {/* Entregables incluidos en recuadros estructurados */}
                <div className="space-y-1.5">
                  <div className="text-[9.5px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                    Entregables y especificaciones incluidas:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                    {curService.deliverables.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-[#141822] border border-stone-800/80 flex items-start gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${curService.checkColor}`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-stone-200 text-xs font-sans leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ideal para */}
                <div className="p-2.5 rounded-xl bg-[#10141C] border border-stone-800/80 text-xs text-stone-300 flex items-start gap-2">
                  <strong className="text-white shrink-0">Ideal para:</strong>
                  <span>{curService.idealFor}</span>
                </div>

                {/* Pie discreto: Sin botones redundantes */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10.5px] text-stone-400 font-mono">
                  <span>Especialidad técnica oficial · San Luis Potosí</span>
                  <span className="text-stone-500">Selecciona tus productos abajo ↓</span>
                </div>

              </div>
            );
          })()}

        </section>

        {/* ================= SECCIÓN 2: ALCANCE DEL PROYECTO (COMPACTO, ENFOCADO A CELULAR, SIN SCROLL) ================= */}
        <section id="alcance-proyecto" ref={alcanceRef} className="space-y-4 pt-4 border-t border-stone-800 animate-fadeIn">
          
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-stone-800/80 pb-2.5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b84f] flex items-center gap-1.5">
                <span className="w-4 h-px bg-[#e8b84f]" />
                <span>02 / Alcance del Proyecto &amp; Costos</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Selecciona con un Clic los Productos que Necesitas
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Elige exactamente lo que buscas (solo tu logo, una lona o tu sitio web) y revisa el desglose con precios en tiempo real.
              </p>
            </div>
            <span className="text-xs text-stone-400 font-mono hidden sm:inline self-end">
              {selectedItems.length} {selectedItems.length === 1 ? 'elegido' : 'elegidos'}
            </span>
          </div>

          {/* CONTENEDOR MODULAR ULTRA COMPACTO PARA CELULAR */}
          <div className="bg-[#10131A] rounded-2xl sm:rounded-3xl border border-stone-800 p-3.5 sm:p-5 shadow-2xl space-y-4 text-white">
            
            {/* Pestañas de Categoría Compactas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'publicidad', label: 'Lonas & Gran Formato' },
                { id: 'branding', label: 'Identidad & Marca' },
                { id: 'web', label: 'Web & Tienda' },
                { id: 'editorial', label: 'Catálogos & Redes' },
                { id: 'todas', label: 'Ver Todos' }
              ].map((tab) => {
                const isActive = activeCategoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#e8b84f] text-[#0B0D11] border-[#e8b84f] shadow-md font-black'
                        : 'bg-[#141822] text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* AVISO DE TALLER PARA IMPRESIÓN (SOLICITADO: NO INCLUYE DISEÑO) */}
            {(activeCategoryFilter === 'publicidad' || activeCategoryFilter === 'todas') && (
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] sm:text-xs flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 shrink-0 text-[#e8b84f]" />
                <span>
                  <strong>Nota de Impresión:</strong> Los precios de lonas y vinil <strong>no incluyen diseño gráfico</strong> (el cliente proporciona archivo listo o se cotiza el diseño por separado).
                </span>
              </div>
            )}

            {/* LISTA COMPACTA DE PRODUCTOS TIPO TOUCH-ROW (SIN SCROLL EXCESIVO) */}
            <div className="space-y-1.5">
              {filteredCatalog.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isSelected
                        ? 'border-[#e8b84f] bg-[#e8b84f]/10 shadow-sm ring-1 ring-[#e8b84f]/30'
                        : 'border-stone-800/80 bg-[#141822] hover:border-stone-700 hover:bg-[#181d28]'
                    }`}
                  >
                    {/* Checkbox y Título */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-[#e8b84f] text-[#0B0D11] border-[#e8b84f]'
                          : 'border-stone-600 bg-stone-900/60 text-transparent'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {item.isPrint && (
                            <span className="text-[9px] font-normal text-amber-400/90 shrink-0 hidden xs:inline">
                              · Sin diseño
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate leading-tight">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Precio Pequeño y Discreto */}
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-[11px] sm:text-xs text-stone-200 font-bold">
                        ${item.price.toLocaleString('es-MX')}
                        <span className="text-[9px] text-stone-400 font-normal ml-0.5">MXN</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RESUMEN DEL ALCANCE & BOTÓN DIRECTO DE WHATSAPP */}
            <div className="pt-3 border-t border-stone-800 space-y-3">
              
              {/* Tarjeta de Total */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#141820] to-[#1C2532] text-white shadow-xl border border-[#e8b84f]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#e8b84f] flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Inversión Estimada:</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-heading text-[#e8b84f] tracking-tight">
                    ${totalEstimate.toLocaleString('es-MX')} <span className="text-xs font-normal text-stone-300">MXN</span>
                  </div>
                  <div className="text-[10.5px] text-stone-300">
                    {selectedItems.length > 0
                      ? `${selectedItems.length} ${selectedItems.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}`
                      : 'Ningún producto seleccionado'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWhatsAppScope}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Cotizar por WhatsApp</span>
                </button>
              </div>

              {/* Chips de lo seleccionado */}
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-400 font-mono">Selección:</span>
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181d28] border border-stone-700 text-[10px] text-stone-200 cursor-pointer hover:border-rose-400 hover:text-rose-300 transition-colors"
                      title="Clic para remover"
                    >
                      <span>{item.title}</span>
                      <X className="w-3 h-3 text-stone-400 hover:text-rose-400" />
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedItemIds([])}
                    className="text-[10px] text-stone-400 hover:text-rose-400 underline font-mono ml-1 cursor-pointer"
                  >
                    Limpiar
                  </button>
                </div>
              )}

              {/* Campo para Medidas Específicas / Detalles del Proyecto */}
              <div className="p-3 rounded-xl bg-[#080A0E] border border-stone-800 space-y-1">
                <label className="text-[11px] font-bold text-stone-200 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#e8b84f]" />
                  <span>¿Medidas específicas o detalles de tu proyecto? (opcional):</span>
                </label>
                <textarea
                  rows="2"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Ej. Medidas especiales de lona (3.5 × 1.8 m), acabados requeridos o fecha límite..."
                  className="w-full p-2 rounded-xl border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#e8b84f] bg-[#141820]"
                />
                <p className="text-[9.5px] text-stone-400">
                  Tus detalles se adjuntarán automáticamente al mensaje de WhatsApp.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ================= SECCIÓN PORTAFOLIO PERSONAL DE WICHO NEMES ================= */}
        <div className="pt-6 border-t border-stone-800/80 space-y-3">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#e8b84f]">
              Portafolio &amp; Diseñador
            </span>
            <h3 className="text-base font-black text-white font-heading">
              ¿Quieres revisar proyectos anteriores antes de cotizar?
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Conoce el trabajo de Wicho Nemes y las soluciones creadas para otros negocios y marcas.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#151921] to-[#0F1218] border border-stone-700/60 p-3.5 sm:p-4 shadow-xl">
              
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-[#e8b84f]/40 bg-[#0B0D11] flex items-center justify-center p-1 shadow-inner">
                    <img
                      src="/maquetado-inicio-wicho-v2/assets/marca-wicho.png"
                      alt="Wicho Nemes Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="font-heading font-black text-white text-xs sm:text-sm tracking-tight">Wicho Nemes</div>
                    <div className="text-[9.5px] text-[#e8b84f] font-bold">Diseñador Gráfico &amp; Digital</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-bold">
                  Taller Abierto
                </span>
              </div>

              <div className="py-2.5 flex items-center gap-3">
                <div className="w-14 h-18 sm:w-16 sm:h-20 shrink-0 rounded-xl bg-gradient-to-b from-[#202631] to-[#0E1116] border border-white/15 overflow-hidden shadow-md">
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

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-stone-400 text-[10.5px] font-medium">Portafolio personal:</span>
                <a
                  href="/maquetado-inicio-wicho-v2/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#f0c765] hover:to-[#e8b84f] text-[#0B0D11] font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
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

        {/* ================= SECCIÓN COMPARTIR PORTAL ================= */}
        <section className="pt-6 border-t border-stone-800">
          <div className="rounded-2xl border border-[#e8b84f]/30 bg-[#0E1218] p-3.5 sm:p-5 shadow-xl relative overflow-hidden">
            <div className="relative space-y-3">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#e8b84f]">
                  <Sparkles className="w-3 h-3 text-[#e8b84f]" />
                  <span>Diseño Gráfico, Web &amp; Gran Formato</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  ¿Conoces a un negocio que necesite identidad, web o lonas?
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
                  Comparte este portal con tu equipo o socios. Soluciones visuales completas desde San Luis Potosí por Wicho Nemes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-black" />
                  <span>Compartir por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2 px-3 rounded-xl bg-[#1A222E] hover:bg-[#222C3C] text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#e8b84f]" />
                  <span>Compartir Enlace</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full py-2 px-3 rounded-xl bg-[#141822] hover:bg-[#1A202E] text-stone-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 border border-stone-800 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
