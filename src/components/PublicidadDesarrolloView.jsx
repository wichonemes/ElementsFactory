import React, { useState, useMemo, useRef } from 'react';
import {
  Palette,
  Globe,
  Printer,
  Film,
  Sparkles,
  MessageCircle,
  ExternalLink,
  DollarSign,
  Eye,
  MapPin,
  Share2,
  Copy,
  Check,
  X,
  Info,
  Building2,
  Package
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  // Alcance del Proyecto: Selección modular de productos por área con desglose en tiempo real
  const [selectedItemIds, setSelectedItemIds] = useState(['logo_solo']);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('branding');
  const [expandedInfoIds, setExpandedInfoIds] = useState([]);
  const [quoteNotes, setQuoteNotes] = useState('');
  
  const alcanceRef = useRef(null);
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Estado de feedback al copiar enlace
  const [copiedLink, setCopiedLink] = useState(false);

  // URL canónica para compartir el portal de diseño y publicidad
  const sharePortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')}/?world=servicios&tab=diseno`
    : 'https://wichonemes.github.io/artesano/?world=servicios&tab=diseno';

  const sharePortalText = `Diseño gráfico, desarrollo web y gran formato en Artesano Digital: identidad visual, tiendas online, lonas y producción publicitaria: ${sharePortalUrl}`;

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
        title: 'Diseño Gráfico, Web & Publicidad // Artesano Digital',
        text: 'Soluciones visuales y digitales completas: branding, sitios web interactivos, gran formato y publicidad en San Luis Potosí.',
        url: sharePortalUrl
      }).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  // Helper para leer configuración individual de cada tarjeta (url y si está activada o desactivada)
  const parseCardBg = (cardVal, fallbackUrl) => {
    if (!cardVal) return { url: fallbackUrl, enabled: false };
    if (typeof cardVal === 'string') return { url: cardVal, enabled: false };
    return {
      url: cardVal.url || fallbackUrl,
      enabled: Boolean(cardVal.enabled)
    };
  };

  const brandingBg = parseCardBg(settings?.categoryBackgroundPhotos?.diseno?.branding, './portafolio/assets/artesano-cover.webp');
  const publicidadBg = parseCardBg(settings?.categoryBackgroundPhotos?.diseno?.publicidad, './portafolio/assets/civil-shirts.webp');
  const webBg = parseCardBg(settings?.categoryBackgroundPhotos?.diseno?.web, './interfaces/assets/ui-01.jpg');
  const editorialBg = parseCardBg(settings?.categoryBackgroundPhotos?.diseno?.editorial, './portafolio/assets/popol-spread.webp');

  // Paleta oficial de temas y estilos para las 4 áreas principales
  const categoryTheme = {
    branding: {
      id: 'branding',
      label: 'Identidad & Marca',
      code: 'BRAND-01',
      tag: 'Identidad Visual',
      desc: 'Logotipos vectoriales, paleta de color y manual de marca para tu negocio.',
      bgImage: brandingBg.url,
      showPhoto: brandingBg.enabled,
      icon: Palette,
      activeCardClass: 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30 text-white',
      glowBorderClass: 'border-[#e8b84f] ring-2 ring-[#e8b84f]/40 shadow-[0_0_20px_rgba(232,184,79,0.25)]',
      underlineClass: 'bg-[#e8b84f]',
      neonPillClass: 'bg-[#e8b84f] text-[#0B0D11]',
      iconBoxActive: 'bg-[#e8b84f]/20 border-[#e8b84f]/60 text-[#e8b84f]',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dotColor: 'bg-amber-400',
      activeRowClass: 'border-amber-400/90 bg-amber-500/15 ring-1 ring-amber-400/30',
      checkClass: 'bg-[#e8b84f] text-[#0B0D11] border-[#e8b84f]',
      priceClass: 'text-amber-200',
      chipClass: 'border-amber-500/40 bg-amber-500/10 text-amber-200'
    },
    publicidad: {
      id: 'publicidad',
      label: 'Lonas & Gran Formato',
      code: 'PRINT-02',
      tag: 'Gran Formato',
      desc: 'Lonas de alta densidad, vinil cortado y microperforado para fachada o cancel.',
      bgImage: publicidadBg.url,
      showPhoto: publicidadBg.enabled,
      icon: Printer,
      activeCardClass: 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-400/30 text-white',
      glowBorderClass: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      underlineClass: 'bg-emerald-400',
      neonPillClass: 'bg-emerald-400 text-[#0B0D11]',
      iconBoxActive: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dotColor: 'bg-emerald-400',
      activeRowClass: 'border-emerald-400/90 bg-emerald-500/15 ring-1 ring-emerald-400/30',
      checkClass: 'bg-emerald-400 text-[#0B0D11] border-emerald-400',
      priceClass: 'text-emerald-200',
      chipClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    },
    web: {
      id: 'web',
      label: 'Web & Tienda',
      code: 'DEV-03',
      tag: 'Desarrollo Web',
      desc: 'Sitios web responsivos, catálogos online y tiendas rápidas optimizadas.',
      bgImage: webBg.url,
      showPhoto: webBg.enabled,
      icon: Globe,
      activeCardClass: 'border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/30 text-white',
      glowBorderClass: 'border-sky-400 ring-2 ring-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]',
      underlineClass: 'bg-sky-400',
      neonPillClass: 'bg-sky-400 text-[#0B0D11]',
      iconBoxActive: 'bg-sky-500/20 border-sky-400/60 text-sky-300',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      dotColor: 'bg-cyan-400',
      activeRowClass: 'border-cyan-400/90 bg-cyan-500/15 ring-1 ring-cyan-400/30',
      checkClass: 'bg-cyan-400 text-[#0B0D11] border-cyan-400',
      priceClass: 'text-cyan-200',
      chipClass: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
    },
    editorial: {
      id: 'editorial',
      label: 'Catálogos & Redes',
      code: 'EDIT-04',
      tag: 'Contenido & Impresos',
      desc: 'Menús digitales, catálogos en PDF y contenido gráfico para historias y posts.',
      bgImage: editorialBg.url,
      showPhoto: editorialBg.enabled,
      icon: Film,
      activeCardClass: 'border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/30 text-white',
      glowBorderClass: 'border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(192,132,252,0.25)]',
      underlineClass: 'bg-purple-400',
      neonPillClass: 'bg-purple-400 text-[#0B0D11]',
      iconBoxActive: 'bg-purple-500/20 border-purple-400/60 text-purple-300',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      dotColor: 'bg-purple-400',
      activeRowClass: 'border-purple-400/90 bg-purple-500/15 ring-1 ring-purple-400/30',
      checkClass: 'bg-purple-400 text-[#0B0D11] border-purple-400',
      priceClass: 'text-purple-200',
      chipClass: 'border-purple-500/40 bg-purple-500/10 text-purple-200'
    }
  };

  // Lista de las 4 áreas principales para los botones superiores (2x2 en celular, 4 en desktop)
  const categoriesList = [
    categoryTheme.branding,
    categoryTheme.publicidad,
    categoryTheme.web,
    categoryTheme.editorial
  ];

  // Catálogo completo de productos organizados por área con información detallada de entregables
  const projectItemsCatalog = [
    // --- 1. IDENTIDAD & BRANDING (ÁMBAR) ---
    {
      id: 'logo_solo',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Diseño de Logotipo Principal',
      subtitle: 'Solo logotipo vectorial maestro',
      desc: 'Entrega de archivos maestros de identidad para uso comercial y publicidad.',
      whatIncludes: [
        'Propuesta de logotipo profesional diseñada con intención comercial.',
        'Archivos vectoriales maestros editables (.AI de Illustrator, .PDF, .SVG).',
        'Imágenes en alta resolución (.PNG transparente y .JPG para avatares).',
        'Cesión completa de derechos de autor para uso de tu marca.'
      ],
      price: 1200
    },
    {
      id: 'identidad_completa',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Identidad Visual & Branding Completo',
      subtitle: 'Logo + Isotipo + Paleta + Manual de Marca',
      desc: 'Sistema visual integral para posicionar tu negocio como marca sólida.',
      whatIncludes: [
        'Logotipo principal, versiones responsivas e isotipo / icono de marca.',
        'Paleta de colores oficial con códigos HEX, RGB y CMYK para imprenta.',
        'Selección y jerarquía tipográfica institucional.',
        'Manual de identidad visual en PDF con normas de uso y aplicaciones correctas.',
        'Kit completo de archivos vectoriales y transparentes en alta definición.'
      ],
      price: 2500
    },
    {
      id: 'vectorizado_logo',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Vectorización / Limpieza de Logo',
      subtitle: 'De foto o boceto a curvas nítidas',
      desc: 'Trazado técnico profesional para que tu logo nunca se pixelee.',
      whatIncludes: [
        'Redibujo técnico en curvas vectoriales de logotipo existente o boceto.',
        'Eliminación de pixelado para que se pueda imprimir a cualquier tamaño.',
        'Entrega en vectores (.AI, .SVG, .PDF) y PNG con fondo transparente.'
      ],
      price: 450
    },
    {
      id: 'membretes_firmas',
      category: 'branding',
      categoryLabel: 'Identidad & Marca',
      title: 'Papelería Digital & Firmas de Correo',
      subtitle: 'Hoja membretada institucional y kit de perfiles',
      desc: 'Aplicación institucional de marca para comunicación comercial formal.',
      whatIncludes: [
        'Hoja membretada digital editable en Word y plantilla PDF.',
        'Diseño de firma digital para correos electrónicos corporativos.',
        'Kit de portadas y avatares institucionales para redes comerciales.'
      ],
      price: 550
    },

    // --- 2. PUBLICIDAD, LONAS & GRAN FORMATO (ESMERALDA) ---
    {
      id: 'lona_1x1',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 1.0 × 1.0 m',
      subtitle: '1 m² lista para colgar · Bastilla y ojillos',
      desc: 'Lona comercial compacta de alta durabilidad para exteriores.',
      whatIncludes: [
        'Lona frontlite de 13 oz resistente al sol, viento y lluvia.',
        'Impresión digital a todo color en alta definición.',
        'Bastilla perimetral termosellada con refuerzo para evitar desgarres.',
        'Ojillos metálicos galvanizados en las 4 esquinas.',
        'Nota de taller: No incluye diseño gráfico (requiere archivo en curvas o alta resolución).'
      ],
      price: 260,
      isPrint: true
    },
    {
      id: 'lona_2x1',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 2.0 × 1.0 m',
      subtitle: '2 m² comercial · Medida más solicitada',
      desc: 'Medida estándar más común para fachadas comerciales y promociones.',
      whatIncludes: [
        'Dimensiones: 2 metros de ancho por 1 metro de alto (2 m²).',
        'Lona frontlite 13 oz de uso rudo para exteriores.',
        'Bastilla perimetral reforzada y ojillos metálicos cada metro.',
        'Acabado listo para montar con cinchos o cuerda.',
        'Nota de taller: No incluye diseño gráfico.'
      ],
      price: 490,
      isPrint: true
    },
    {
      id: 'lona_3x2',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Lona Publicitaria 3.0 × 2.0 m',
      subtitle: '6 m² gran visibilidad exterior',
      desc: 'Formato amplio para marquesinas, bardas y espectaculares ligeros.',
      whatIncludes: [
        '6 metros cuadrados de alto impacto visual para tu negocio.',
        'Lona frontlite 13 oz para exteriores con tintas UV duraderas.',
        'Bastilla perimetral de refuerzo y ojillos metálicos cada 80 cm.',
        'Nota de taller: No incluye diseño gráfico.'
      ],
      price: 1350,
      isPrint: true
    },
    {
      id: 'rotulacion_vinil',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Rotulación en Vinil Adhesivo m²',
      subtitle: 'Por metro cuadrado para cristal o vehículo',
      desc: 'Vinil comercial de alta adherencia para cristales, muros o vehículos.',
      whatIncludes: [
        'Vinil de corte o impreso en alta definición por metro cuadrado.',
        'Adhesivo resistente para cristales, vitrinas, acrílico o carrocerías.',
        'Acabado brillante o mate a elección.',
        'Nota: No incluye diseño gráfico ni instalación en sitio.'
      ],
      price: 380,
      isPrint: true
    },
    {
      id: 'microperforado',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Vinil Microperforado para Cristales m²',
      subtitle: 'Privacidad interior con visión hacia afuera',
      desc: 'Publicidad visible desde la calle permitiendo entrar la luz natural.',
      whatIncludes: [
        'Vinil microperforado especial para ventanales y medallones de autos.',
        'Muestra tu publicidad al exterior y permite ver hacia afuera desde dentro.',
        'Protección solar ligera y reducción de deslumbramiento.',
        'Nota: No incluye diseño gráfico.'
      ],
      price: 420,
      isPrint: true
    },
    {
      id: 'banner_roll_up',
      category: 'publicidad',
      categoryLabel: 'Lonas & Gran Formato',
      title: 'Banner Roll-Up Retráctil 0.85 × 2.0 m',
      subtitle: 'Estructura de aluminio + lona impresa',
      desc: 'Exhibidor portátil y ligero para expos, ferias y puntos de venta.',
      whatIncludes: [
        'Estructura retráctil portátil de aluminio de 0.85 × 2.0 m.',
        'Lona impresa en calidad fotográfica montada lista para desenrollar.',
        'Maletín de lona para fácil transportación.',
        'Armado en menos de 1 minuto sin necesidad de herramientas.',
        'Nota: No incluye diseño gráfico.'
      ],
      price: 1150,
      isPrint: true
    },

    // --- 3. DESARROLLO WEB & DIGITAL (CIAN) ---
    {
      id: 'landing_web',
      category: 'web',
      categoryLabel: 'Web & Tienda',
      title: 'Sitio Web / Landing Page Comercial',
      subtitle: '1 página responsiva adaptada a celular',
      desc: 'Presencia profesional en internet con llamada directa a la acción.',
      whatIncludes: [
        'Diseño web moderno 100% responsivo y adaptado a celulares y tablets.',
        'Secciones: Portada, Servicios, Beneficios, Galería, Ubicación y Preguntas.',
        'Botones directos de contacto a WhatsApp y llamada telefónica.',
        'Optimización de velocidad de carga y alta en motores de búsqueda.',
        'Configuración de dominio y hosting con certificado SSL seguro.'
      ],
      price: 2900
    },
    {
      id: 'tienda_catalogo',
      category: 'web',
      categoryLabel: 'Web & Tienda',
      title: 'Tienda Online / Catálogo WhatsApp',
      subtitle: 'Con carrito de compras y pedidos directos',
      desc: 'Plataforma para mostrar productos y recibir pedidos estructurados por WhatsApp.',
      whatIncludes: [
        'Catálogo interactivo con buscador en vivo y filtros por categoría.',
        'Carrito de compras integrado con resumen de pedido automático.',
        'Panel de administración protegido para editar productos y precios.',
        'Carga inicial de catálogo y configuración técnica en la nube.',
        'Dominio propio, hosting seguro con SSL y soporte de arranque.'
      ],
      price: 5800
    },

    // --- 4. CONTENIDO EDITORIAL, TARJETAS & MENÚS (MORADO) ---
    {
      id: 'tarjetas_presentacion',
      category: 'editorial',
      categoryLabel: 'Catálogos & Redes',
      title: 'Diseño de Tarjetas de Presentación',
      subtitle: 'Frente y vuelta · Lista para imprenta',
      desc: 'Diseño comercial profesional de tarjeta de presentación con acabados listos para imprimir.',
      whatIncludes: [
        'Diseño gráfico personalizado frente y vuelta con tu logotipo y datos de contacto.',
        'Formato estándar comercial (9 × 5 cm) con guías de corte, sangría y modo CMYK.',
        'Entrega en archivo PDF de prensa de alta resolución para imprimir.',
        'Versión digital optimizada para compartir por WhatsApp como tarjeta virtual.'
      ],
      price: 350
    },
    {
      id: 'catalogo_pdf',
      category: 'editorial',
      categoryLabel: 'Catálogos & Redes',
      title: 'Catálogo Digital PDF Interactivo',
      subtitle: 'Para celular con enlaces a WhatsApp',
      desc: 'Documento comercial en PDF con botones directos para cotizar.',
      whatIncludes: [
        'Diseño editorial estructurado de productos, descripciones y precios.',
        'Botones interactivos que abren WhatsApp con el producto elegido.',
        'Optimizado para envío ligero por WhatsApp y correo sin perder nitidez.',
        'Entrega en PDF interactivo y versión apta para imprimir.'
      ],
      price: 850
    },
    {
      id: 'menu_digital',
      category: 'editorial',
      categoryLabel: 'Catálogos & Redes',
      title: 'Menú Digital para Restaurante o Bar',
      subtitle: 'Para lectura en móvil o código QR',
      desc: 'Menú visual y apetecible para restaurantes, cafeterías o bares.',
      whatIncludes: [
        'Diseño estructurado por secciones (bebidas, entradas, platos fuertes, combos).',
        'Formato vertical para lectura rápida y cómoda en pantalla de celular.',
        'Diseño de código QR institucional listo para imprimir y colocar en mesas.',
        'Entrega en PDF de alta resolución y formatos de imagen.'
      ],
      price: 750
    },
    {
      id: 'pack_flyers_6',
      category: 'editorial',
      categoryLabel: 'Catálogos & Redes',
      title: 'Paquete 6 Diseños para Redes Sociales',
      subtitle: 'Posts o historias promocionales',
      desc: 'Contenido visual consistente con tu marca para promociones del mes.',
      whatIncludes: [
        '6 piezas gráficas con tu logotipo, colores de marca y mensajes de venta.',
        'Formatos a elegir: Cuadrado para feed (1080×1080) o historias (1080×1920).',
        'Textos publicitarios claros y llamados a la acción comerciales.',
        'Entrega en JPG y PNG optimizados para no perder calidad en redes.'
      ],
      price: 600
    },
    {
      id: 'volante_impreso',
      category: 'editorial',
      categoryLabel: 'Catálogos & Redes',
      title: 'Diseño de Volante / Flyer Publicitario',
      subtitle: '1 o 2 caras listo para imprenta',
      desc: 'Diseño publicitario comercial con medidas estándar para imprenta.',
      whatIncludes: [
        'Diseño publicitario comercial (media carta o cuarto de carta).',
        'Estructura visual: gancho principal, oferta, beneficios y contacto.',
        'Entrega en archivo PDF de prensa con guías de corte, sangría y modo CMYK.'
      ],
      price: 450
    }
  ];

  // Paquetes & Servicios para Empresas (Ubicados debajo del portafolio)
  const corporatePackages = [
    {
      id: 'pack_apertura',
      badge: 'Más Solicitado para Negocios',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      title: 'Paquete Apertura Comercial / Local Nuevo',
      subtitle: 'Logo + Lona 2.0 × 1.0 m + Tarjetas + Volantes',
      priceText: '$2,250 MXN',
      idealFor: 'Negocios nuevos, locales comerciales y puntos de venta en inauguración.',
      includes: [
        'Diseño de logotipo vectorial maestro (.AI, .PDF, .PNG transparente).',
        'Lona publicitaria de 2.0 × 1.0 m impresa en 13 oz con bastilla y ojillos lista para colgar.',
        'Diseño de tarjetas de presentación comerciales frente y vuelta lista para imprenta.',
        'Diseño de volante publicitario para promoción de apertura.'
      ]
    },
    {
      id: 'pack_digital_360',
      badge: 'Solución Digital Completa',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      title: 'Paquete Digital & Ventas 360°',
      subtitle: 'Identidad Completa + Sitio Web + Catálogo WhatsApp',
      priceText: '$7,200 MXN',
      idealFor: 'Marcas y empresas que buscan vender por internet y proyectar autoridad.',
      includes: [
        'Identidad visual completa (logo principal, isotipo, manual de marca y paleta oficial).',
        'Sitio web responsivo de alto rendimiento adaptado a celulares y con botones directos.',
        'Catálogo digital interactivo en PDF con botones directos para pedidos en WhatsApp.',
        'Pack de 6 artes publicitarios para redes sociales.'
      ]
    },
    {
      id: 'pack_poliza_mensual',
      badge: 'Póliza Mensual para Empresas',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      title: 'Maquila de Diseño & Soporte Comercial Continuo',
      subtitle: 'Diseñador dedicado para tu negocio (redes, catálogos e impresos)',
      priceText: '$3,200 MXN / mes',
      idealFor: 'Restaurantes, franquicias y pymes con promociones y cambios semanales.',
      includes: [
        '15 piezas gráficas mensuales (posts, historias promocionales, flyers o banners).',
        'Actualización continua de menús digitales o listas de precios.',
        'Adaptación rápida de artes para lonas y promociones de temporada.',
        'Atención prioritaria directa por WhatsApp con entregas ágiles.'
      ]
    },
    {
      id: 'pack_medida_corporativo',
      badge: 'Proyecto a la Medida',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      title: 'Proyecto Especial Corporativo / Gran Escala',
      subtitle: 'Lonas de gran dimensión, rotulación de flotillas o plataformas a medida',
      priceText: 'Cotización Personalizada',
      idealFor: 'Empresas, constructoras, eventos masivos y requerimientos industriales.',
      includes: [
        'Levantamiento de especificaciones técnicas y medidas no estándar.',
        'Asesoría en materiales de uso rudo para exteriores de gran formato.',
        'Cotización formal y factura fiscal para tu empresa.',
        'Atención personalizada directa por WhatsApp.'
      ]
    }
  ];

  // Alternar selección de un ítem para la cotización
  const toggleItem = (itemId) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Alternar extensión de información de lo que contiene cada producto
  const toggleInfo = (itemId) => {
    setExpandedInfoIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Filtrado estricto por área: solo muestra los productos del área activa
  const filteredCatalog = useMemo(() => {
    return projectItemsCatalog.filter(item => item.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Lista de ítems seleccionados (conserva la selección global acumulada de todas las áreas)
  const selectedItems = useMemo(() => {
    return projectItemsCatalog.filter(item => selectedItemIds.includes(item.id));
  }, [selectedItemIds]);

  // Total acumulado estimado
  const totalEstimate = useMemo(() => {
    return selectedItems.reduce((acc, cur) => acc + cur.price, 0);
  }, [selectedItems]);

  // Tema activo del área seleccionada
  const activeTheme = categoryTheme[activeCategoryFilter] || categoryTheme.branding;

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

    const text = `Hola Artesano Digital, me interesa cotizar los siguientes productos de su portal de *Diseño & Publicidad*:

${itemsListText}

*Inversión Total Estimada:* $${totalEstimate.toLocaleString('es-MX')} MXN
${hasPrintItems ? `_(Nota: Los precios de impresión no incluyen diseño gráfico)_\n` : ''}${quoteNotes.trim() ? `\n• *Detalles / Medidas:* ${quoteNotes.trim()}\n` : ''}
¿Podemos platicar sobre este proyecto?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Cotizar un paquete empresarial específico directamente por WhatsApp
  const handleQuoteCorporatePackage = (pkg) => {
    const text = `Hola Artesano Digital, me interesa cotizar el *${pkg.title}* (${pkg.priceText}) que vi en su sección de empresas de *Diseño & Publicidad*.

¿Podemos platicar sobre los detalles para mi negocio?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#0B0D11] text-stone-100 min-h-screen selection:bg-[#e8b84f] selection:text-[#0B0D11]">
      
      {/* 1. HERO INSTITUCIONAL LIMPIO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080A0D] via-[#101319] to-[#0D1015] text-white pt-4 pb-5 sm:pt-7 sm:pb-8 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80">
        <div className="max-w-4xl mx-auto relative z-10 space-y-1 sm:space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-[1.1]">
            Diseño &amp; <span className="text-[#e8b84f]">Publicidad</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-xl">
            Identidad visual, lonas de gran formato, rotulación en vinil, desarrollo web interactivo y producción publicitaria.
          </p>
        </div>
      </section>

      {/* 2. MÓDULO PRINCIPAL FUSIONADO: SELECCIONA ÁREA Y ELIGE PRODUCTOS CON DETALLE DESPLEGABLE */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-7">

        {/* ================= CATÁLOGO Y ALCANCE DE PROYECTO (4 ÁREAS PRINCIPALES) ================= */}
        <section id="alcance-proyecto" ref={alcanceRef} className="space-y-3.5 animate-fadeIn">
          
          {/* Cabecera unificada */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-stone-800 pb-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b84f] flex items-center gap-1.5">
                <span className="w-4 h-px bg-[#e8b84f]" />
                <span>Servicios &amp; Alcance del Proyecto</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Selecciona tu Área y Elige tus Productos
              </h2>
            </div>
            <span className="text-xs text-stone-400 font-mono self-end">
              {selectedItems.length} {selectedItems.length === 1 ? 'producto elegido' : 'productos elegidos'}
            </span>
          </div>

          {/* Selectores de Área (4 Áreas estilo tarjeta con foto desenfocada de referencia) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {categoriesList.map(cat => {
              const isSelected = activeCategoryFilter === cat.id;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 p-3 sm:p-4 text-left flex flex-col justify-between cursor-pointer active:scale-[0.97] touch-manipulation select-none min-h-[165px] sm:min-h-[185px] ${
                    isSelected
                      ? `${cat.glowBorderClass} bg-[#080B10]`
                      : 'border-stone-800/90 bg-[#0E1218] hover:border-stone-700/80 shadow-md'
                  }`}
                >
                  {/* Foto desenfocada de fondo con opacidad visible (individualmente activable o desactivable) */}
                  {cat.showPhoto && (
                    <>
                      <img
                        src={cat.bgImage}
                        alt=""
                        aria-hidden="true"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 filter blur-[0.6px] pointer-events-none select-none scale-105 group-hover:scale-110 ${
                          isSelected ? 'opacity-65' : 'opacity-45 group-hover:opacity-60'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/70 to-[#080B10]/25 pointer-events-none" />
                    </>
                  )}

                  {/* Fila superior: Código con línea decorativa estilo referencia y Estado */}
                  <div className="relative z-10 flex items-start justify-between w-full">
                    <div>
                      <span className="font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-white drop-shadow-sm">
                        {cat.code}
                      </span>
                      {/* Línea decorativa como en la imagen de referencia */}
                      <div className={`w-7 h-0.5 mt-1 rounded-full ${cat.underlineClass}`} />
                    </div>

                    <span
                      className={`text-[8.5px] sm:text-[9.5px] font-heading font-black px-2 sm:px-2.5 py-0.5 rounded-full transition-all tracking-wider uppercase flex items-center gap-1 ${
                        isSelected
                          ? `${cat.neonPillClass} shadow-md`
                          : 'text-stone-300 bg-black/60 border border-white/15'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                          <span>Activa</span>
                        </>
                      ) : (
                        <span>Elegir</span>
                      )}
                    </span>
                  </div>

                  {/* Sección inferior: Icono en caja redondeada, Tag neón, Título Futura y Descripción */}
                  <div className="relative z-10 pt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform ${
                          isSelected
                            ? `${cat.iconBoxActive} scale-105 shadow-md`
                            : 'bg-black/60 border-white/15 text-stone-300'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>

                      <span
                        className={`inline-block text-[7.5px] sm:text-[8.5px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? cat.badgeColor
                            : 'bg-black/50 text-stone-300 border-white/10'
                        }`}
                      >
                        {cat.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-white text-xs sm:text-sm md:text-base leading-snug tracking-tight">
                        {cat.label}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-stone-300/90 leading-tight mt-0.5 line-clamp-2 font-normal">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contenedor de Productos del Área Activa */}
          <div className="bg-[#10131A] rounded-2xl sm:rounded-3xl border border-stone-800 p-3 sm:p-4 shadow-2xl space-y-3 text-white">
            
            {/* Encabezado del área activa */}
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeTheme.dotColor}`} />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Productos de {activeTheme.label}
                </h3>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                {filteredCatalog.length} opciones disponibles
              </span>
            </div>

            {/* AVISO DE TALLER PARA IMPRESIÓN (SOLO EN LONAS & GRAN FORMATO) */}
            {activeCategoryFilter === 'publicidad' && (
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-[11px] sm:text-xs flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>
                  <strong>Nota de Impresión:</strong> Los precios de lonas y vinil <strong>no incluyen diseño gráfico</strong>.
                </span>
              </div>
            )}

            {/* LISTA EXCLUSIVA DE PRODUCTOS CON PESTAÑA DESPLEGABLE DE INFORMACIÓN */}
            <div className="space-y-2">
              {filteredCatalog.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isInfoOpen = expandedInfoIds.includes(item.id);
                const itemTheme = categoryTheme[item.category] || activeTheme;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all select-none ${
                      isSelected
                        ? itemTheme.activeRowClass
                        : 'border-stone-800/80 bg-[#141822] hover:border-stone-700'
                    }`}
                  >
                    {/* Fila principal cliqueable para seleccionar */}
                    <div
                      onClick={() => toggleItem(item.id)}
                      className="flex items-center justify-between gap-3 cursor-pointer touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? itemTheme.checkClass
                            : 'border-stone-600 bg-stone-900/60 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                            <span>{item.title}</span>
                            {item.isPrint && (
                              <span className="text-[9px] font-normal text-emerald-400 shrink-0 hidden xs:inline">
                                · Sin diseño
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-stone-300 truncate leading-tight">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="shrink-0 text-right">
                        <span className={`font-mono text-xs sm:text-sm font-bold ${
                          isSelected ? itemTheme.priceClass : 'text-stone-200'
                        }`}>
                          ${item.price.toLocaleString('es-MX')}
                          <span className="text-[9px] text-stone-400 font-normal ml-0.5">MXN</span>
                        </span>
                      </div>
                    </div>

                    {/* Pestaña / Botón para extender la información de lo que contiene el producto */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleInfo(item.id);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold text-stone-400 hover:text-white transition-colors cursor-pointer touch-manipulation py-0.5"
                      >
                        <Info className="w-3 h-3 text-[#e8b84f]" />
                        <span>{isInfoOpen ? 'Ocultar qué incluye ▴' : '¿Qué incluye este producto? ▾'}</span>
                      </button>

                      <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'text-white/80' : 'text-stone-400'
                      }`}>
                        {isSelected ? '✓ Seleccionado' : 'Toca para agregar'}
                      </span>
                    </div>

                    {/* Información extendida desplegable */}
                    {isInfoOpen && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-[#0E1218] border border-white/10 space-y-1.5 animate-fadeIn">
                        <div className="text-[9.5px] font-mono uppercase tracking-wider text-[#e8b84f] font-bold">
                          Especificaciones y entregables incluidos:
                        </div>
                        <ul className="space-y-1 text-[11px] text-stone-300">
                          {item.whatIncludes?.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-snug">
                              <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        {item.desc && (
                          <p className="text-[10px] text-stone-400 pt-1 border-t border-white/5 font-sans leading-relaxed">
                            {item.desc}
                          </p>
                        )}
                      </div>
                    )}

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
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Cotizar por WhatsApp</span>
                </button>
              </div>

              {/* Chips de selección acumulada con código de color */}
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-stone-400 font-mono">Selección:</span>
                  {selectedItems.map((item) => {
                    const itemTheme = categoryTheme[item.category] || categoryTheme.branding;

                    return (
                      <span
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10.5px] cursor-pointer hover:border-rose-400 hover:text-rose-300 transition-colors active:scale-95 touch-manipulation ${itemTheme.chipClass}`}
                        title="Clic para remover"
                      >
                        <span>{item.title}</span>
                        <X className="w-3 h-3 text-stone-400 hover:text-rose-400 shrink-0" />
                      </span>
                    );
                  })}
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
                  className="w-full p-2.5 rounded-xl border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#e8b84f] bg-[#141820]"
                />
                <p className="text-[9.5px] text-stone-400">
                  Tus detalles se adjuntarán automáticamente al mensaje de WhatsApp.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ================= SECCIÓN PORTAFOLIO OFICIAL ARTESANO DIGITAL ================= */}
        <div className="pt-4 border-t border-stone-800/80 space-y-3">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#e8b84f]">
              Portafolio Oficial
            </span>
            <h3 className="text-base font-black text-white font-heading">
              ¿Quieres revisar proyectos anteriores antes de cotizar?
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Conoce el portafolio de Artesano Digital y las soluciones creadas para marcas y negocios.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#151921] to-[#0F1218] border border-stone-700/60 p-3.5 sm:p-4 shadow-xl">
              
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-[#e8b84f]/40 bg-[#0B0D11] flex items-center justify-center p-1 shadow-inner">
                    <img
                      src="./brand/artesano_isotipo_transparente.png"
                      alt="Artesano Digital Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="font-heading font-black text-white text-xs sm:text-sm tracking-tight">Artesano Digital</div>
                    <div className="text-[9.5px] text-[#e8b84f] font-bold">Estudio Creativo &amp; Portafolio</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9.5px] font-bold">
                  Taller Abierto
                </span>
              </div>

              <div className="py-2.5 flex items-center gap-3">
                <div className="w-14 h-18 sm:w-16 sm:h-20 shrink-0 rounded-xl bg-gradient-to-b from-[#202631] to-[#0E1116] border border-white/15 overflow-hidden shadow-md flex items-center justify-center p-2">
                  <img
                    src="./brand/artesano_digital_icono.svg"
                    alt="Artesano Digital"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = './brand/artesano_isotipo_transparente.png';
                    }}
                  />
                </div>

                <div className="space-y-1 text-xs text-stone-300 leading-relaxed font-normal">
                  <p className="italic text-stone-200 text-[11px] line-clamp-2">
                    "Si lo piensas, se hace. Cada pieza visual y publicitaria resuelve un propósito comercial real."
                  </p>
                  <div className="text-[10px] text-stone-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#e8b84f] shrink-0" />
                    <span>San Luis Potosí, SLP · Envíos nacionales.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-stone-400 text-[10.5px] font-medium">Portafolio oficial:</span>
                <a
                  href="./portafolio/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#f0c765] hover:to-[#e8b84f] text-[#0B0D11] font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer touch-manipulation"
                  title="Abrir portafolio de Artesano Digital"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Portafolio</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>

            </div>
          </div>
        </div>

        {/* ================= OTROS & SERVICIOS PARA EMPRESAS (UBICADO DEBAJO DEL PORTAFOLIO) ================= */}
        <section className="pt-4 border-t border-stone-800/80 space-y-3.5 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-stone-800 pb-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e8b84f] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#e8b84f]" />
                <span>Otros &amp; Soluciones Especiales</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Paquetes Comerciales &amp; Servicios para Empresas
              </h2>
            </div>
            <p className="text-[11px] text-stone-400 font-mono hidden md:block">
              Propuestas integrales para inauguraciones, franquicias y soporte continuo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {corporatePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl border border-stone-800 bg-[#0E1218] hover:border-stone-700 p-4 flex flex-col justify-between space-y-3.5 transition-all shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${pkg.badgeColor}`}>
                      {pkg.badge}
                    </span>
                    <span className="font-mono text-xs font-black text-white">
                      {pkg.priceText}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white leading-snug">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {pkg.subtitle}
                    </p>
                  </div>

                  {/* Entregables incluidos en el paquete */}
                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <div className="text-[9.5px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                      ¿Qué contiene este paquete?
                    </div>
                    <ul className="space-y-1 text-xs text-stone-300">
                      {pkg.includes.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2 rounded-lg bg-white/5 text-[10.5px] text-stone-300">
                    <strong className="text-white">Ideal para: </strong>
                    <span>{pkg.idealFor}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuoteCorporatePackage(pkg)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#e8b84f] to-[#d4a359] hover:from-[#f0c765] hover:to-[#e8b84f] active:scale-95 text-[#0B0D11] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer touch-manipulation"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-[#0B0D11]" />
                  <span>Cotizar este paquete por WhatsApp</span>
                </button>
              </div>
            ))}
          </div>

        </section>

        {/* ================= SECCIÓN COMPARTIR PORTAL ================= */}
        <section className="pt-4 border-t border-stone-800">
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
                  Comparte este portal con tu equipo o socios. Soluciones visuales completas desde San Luis Potosí por Artesano Digital.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer touch-manipulation"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-black" />
                  <span>Compartir por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1A222E] hover:bg-[#222C3C] text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 transition-all cursor-pointer active:scale-95 touch-manipulation"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#e8b84f]" />
                  <span>Compartir Enlace</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#141822] hover:bg-[#1A202E] text-stone-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 border border-stone-800 transition-all cursor-pointer active:scale-95 touch-manipulation"
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
