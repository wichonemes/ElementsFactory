import React, { useState, useEffect } from 'react';
import {
  Gift, Sparkles, Upload, Image as ImageIcon, Check,
  AlertTriangle, Star, Flame, Eye, Edit, Plus, Calendar,
  Tag, ArrowRight, Layers, DollarSign, Award, ChevronRight,
  Package, Boxes, Sparkle, Zap, Clock, TrendingUp, Percent,
  Copy, ShieldCheck, Heart, Sun, Moon, Palette, Save, Send,
  Trash2
} from 'lucide-react';
import SeasonalAtmosphere, { SEASONAL_EFFECTS_META } from './SeasonalAtmosphere';
import MonthlyEventBanner, { EVENT_THEMES, DEFAULT_SEASONAL_SLIDES } from './MonthlyEventBanner';
import AdminConfirmSaveModal from './AdminConfirmSaveModal';

const SUGGESTED_BANNER_IMAGES = [
  { label: 'Navidad / Hogar Cálido', url: '/uploads/bundle_promo_hogar_1.jpg' },
  { label: 'Branding / Negocios', url: '/uploads/bundle_promo_biz_1.jpg' },
  { label: 'Bodas / Ceremonias', url: '/uploads/bienvenida_ceremonia_boda.jpg' },
  { label: 'Eventos / Fiestas', url: '/uploads/bundle_promo_ev_1.jpg' },
  { label: 'Gamer / Home Office', url: '/uploads/kit_home_office_gamer_contexto.jpg' },
  { label: 'Sublimación / Tazas', url: '/uploads/sublimacion_taza_tarro_contexto.jpg' },
  { label: 'Barbería / Salón', url: '/uploads/pack_barberia_boutique_contexto.jpg' },
  { label: 'Mascotas / Familia', url: '/uploads/bundle_promo_hogar_2.jpg' }
];

export const MONTHLY_EVENT_TEMPLATES = [
  {
    monthName: 'Enero',
    label: 'Enero: Arranque & Reyes',
    major: {
      title: 'Mega Arranque de Año Artesanal',
      subtitle: 'Inicia el año equipando tu casa o negocio con paquetes en madera noble y piezas 3D con hasta 20% de ahorro.',
      badge: '🔥 MEGA ARRANQUE DE AÑO',
      discountText: '15% OFF',
      couponCode: 'ARRANQUE15',
      benefitText: 'Envío prioritario + Grabado de nombres gratis'
    },
    mid: {
      title: 'Quincena de Reyes & Propósitos',
      subtitle: 'Detalles coordinados para regalar en Reyes con entrega express y 2X monedas para arcade.',
      badge: '⚡ QUINCENA DE REYES',
      discountText: '10% OFF',
      couponCode: 'REYES10',
      benefitText: '2X Monedas para el Arcade + 10% Directo'
    }
  },
  {
    monthName: 'Febrero',
    label: 'Febrero: San Valentín & Amor',
    major: {
      title: 'Gran Bazar del Amor & la Amistad',
      subtitle: 'Paquetes coordinados para parejas y amigos: llaveros Polaroid, tazas mágicas y lámparas en madera cálida.',
      badge: '💖 ESPECIAL SAN VALENTÍN',
      discountText: '15% OFF',
      couponCode: 'AMOR15',
      benefitText: 'Caja de regalo kraft + Tarjeta con dedicatoria'
    },
    mid: {
      title: 'Quincena Love Drop Sorpresa',
      subtitle: 'Kits express listos para regalar el 14 de febrero con grabado láser personalizado incluido.',
      badge: '⚡ QUINCENA FLASH LOVE',
      discountText: '10% OFF',
      couponCode: 'LOVE10',
      benefitText: 'Grabado de nombres y fecha sin costo adicional'
    }
  },
  {
    monthName: 'Marzo',
    label: 'Marzo: Expo Primavera',
    major: {
      title: 'Gran Expo Artesanal de Primavera',
      subtitle: 'Renueva tus espacios con organizadores botánicos, macetas estriadas en 3D y bandejas de taller.',
      badge: '🌸 EXPO PRIMAVERA',
      discountText: '15% OFF',
      couponCode: 'PRIMAVERA15',
      benefitText: 'Detalle botánico de taller incluido'
    },
    mid: {
      title: 'Quincena de Espacios Frescos',
      subtitle: 'Paquetes para recibidor y home office con descuento quincenal inmediato.',
      badge: '⚡ QUINCENA ESPACIOS',
      discountText: '10% OFF',
      couponCode: 'HOGAR10',
      benefitText: '10% de ahorro directo en paquetes de hogar'
    }
  },
  {
    monthName: 'Abril',
    label: 'Abril: Día del Niño & Creatividad',
    major: {
      title: 'Festival del Día del Niño & Creatividad',
      subtitle: 'Kits familiares y figuras geométricas coleccionables en impresión 3D para consentir a los pequeños.',
      badge: '🚀 DÍA DEL NIÑO ARTESANO',
      discountText: '15% OFF',
      couponCode: 'KIDS15',
      benefitText: 'Figura miniatura 3D sorpresa de regalo'
    },
    mid: {
      title: 'Quincena Juguetes & Colecciones',
      subtitle: 'Zorros low-poly, portalápices temáticos y 2X créditos para el Arcade del Taller.',
      badge: '⚡ QUINCENA CREATIVA',
      discountText: '10% OFF',
      couponCode: 'CREA10',
      benefitText: '2X Monedas para el Arcade + 10% Directo'
    }
  },
  {
    monthName: 'Mayo',
    label: 'Mayo: Día de las Madres',
    major: {
      title: 'Gran Homenaje a Mamá: Recuerdos Inolvidables',
      subtitle: 'Llaveros familiares con fotos, tazas mágicas botánicas y letreros en relieve con amor.',
      badge: '💐 ESPECIAL DÍA DE LAS MADRES',
      discountText: '20% OFF',
      couponCode: 'MAMA20',
      benefitText: 'Caja decorada kraft + Tarjeta floral personalizada'
    },
    mid: {
      title: 'Quincena Exclusiva para Mamá',
      subtitle: 'Anticípate y asegura el regalo perfecto de taller con entrega prioritaria garantizada.',
      badge: '⚡ QUINCENA MAMÁ EXPRESS',
      discountText: '10% OFF',
      couponCode: 'MAMA10',
      benefitText: 'Grabado de dedicatoria de cortesía'
    }
  },
  {
    monthName: 'Junio',
    label: 'Junio: Día del Padre & Maestros',
    major: {
      title: 'Especial Papá & Maestros Artesanos',
      subtitle: 'Kits para asador, destapadores grabados, organizadores de escritorio y soportes gamer.',
      badge: '👔 ESPECIAL DÍA DEL PADRE',
      discountText: '15% OFF',
      couponCode: 'PAPA15',
      benefitText: 'Llavero destapador grabado de regalo'
    },
    mid: {
      title: 'Quincena del Taller de Papá',
      subtitle: 'Detalles útiles para su oficina, setup o taller con descuento directo de quincena.',
      badge: '⚡ QUINCENA PAPÁ FLASH',
      discountText: '10% OFF',
      couponCode: 'PAPA10',
      benefitText: '10% Directo en accesorios de escritorio'
    }
  },
  {
    monthName: 'Julio / Agosto',
    label: 'Julio/Agosto: Vacaciones & Graduaciones',
    major: {
      title: 'Festival de Verano, Viajes & Graduaciones',
      subtitle: 'Termos térmicos grabados, gorras con parche de vinil y placas conmemorativas.',
      badge: '☀️ ESPECIAL VERANO & GRADUACIONES',
      discountText: '15% OFF',
      couponCode: 'VERANO15',
      benefitText: '2 Llaveros acrílicos o madera de regalo en cada paquete'
    },
    mid: {
      title: 'Quincena Playera & Accesorios',
      subtitle: 'Paquetes de viaje y accesorios personalizados para salir de vacaciones.',
      badge: '⚡ QUINCENA PLAYERA FLASH',
      discountText: '10% OFF',
      couponCode: 'PLAYA10',
      benefitText: 'Envío express prioritario nacional'
    }
  },
  {
    monthName: 'Septiembre',
    label: 'Septiembre: Fiestas Patrias',
    major: {
      title: 'Gran Fiesta Mexicana de Manufactura Artesanal',
      subtitle: 'Celebra lo hecho en México con piezas auténticas creadas en nuestro taller con manos mexicanas.',
      badge: '🇲🇽 GRAN BAZAR PATRIO',
      discountText: '15% OFF',
      couponCode: 'VIVAMEXICO15',
      benefitText: 'Detalle patrio artesanal sorpresa incluido'
    },
    mid: {
      title: 'Quincena Viva México en Taller',
      subtitle: 'Descuento patriótico en paquetes decorativos y combos para eventos familiares.',
      badge: '⚡ QUINCENA TRADICIÓN FLASH',
      discountText: '10% OFF',
      couponCode: 'PATRIA10',
      benefitText: 'Grabado conmemorativo patrio gratis'
    }
  },
  {
    monthName: 'Octubre / Noviembre',
    label: 'Octubre/Noviembre: Halloween & Día de Muertos',
    major: {
      title: 'Festival de Tradición: Día de Muertos & Otoño',
      subtitle: 'Porta-velas con calado botánico, lámparas cálidas, catrinas geométricas y bandejas de taller.',
      badge: '💀 FESTIVAL DÍA DE MUERTOS',
      discountText: '15% OFF',
      couponCode: 'TRADICION15',
      benefitText: 'Mini calaverita geométrica 3D de cortesía'
    },
    mid: {
      title: 'Quincena Mágica de Otoño',
      subtitle: 'Ediciones limitadas de temporada listas para decorar tu hogar y altar.',
      badge: '⚡ QUINCENA OTOÑO MÁGICO',
      discountText: '10% OFF',
      couponCode: 'CATRINA10',
      benefitText: '2X Monedas para el Arcade + 10% Directo'
    }
  },
  {
    monthName: 'Noviembre (Fin)',
    label: 'Noviembre: Buen Fin',
    major: {
      title: 'Buen Fin Artesanal de Fábrica',
      subtitle: 'Los mayores descuentos del año directamente desde nuestro taller de manufactura.',
      badge: '🔥 EL BUEN FIN ARTESANAL',
      discountText: '20% OFF',
      couponCode: 'BUENFIN20',
      benefitText: 'Envío Gratis a todo México + Grabado sin costo'
    },
    mid: {
      title: 'Quincena Anticipada del Buen Fin',
      subtitle: 'Adelántate a las aglomeraciones y asegura tus paquetes con precio promocional.',
      badge: '⚡ ANTICIPO BUEN FIN',
      discountText: '10% OFF',
      couponCode: 'ANTICIPO10',
      benefitText: 'Aparta tu paquete con precio protegido'
    }
  },
  {
    monthName: 'Diciembre',
    label: 'Diciembre: Navidad & Fin de Año',
    major: {
      title: 'Gran Bazar Navideño & Fin de Año',
      subtitle: 'Regalos corporativos y familiares coordinados con envoltura de gala y entrega prioritaria garantizada.',
      badge: '🎄 GRAN BAZAR NAVIDEÑO',
      discountText: '20% OFF',
      couponCode: 'NAVIDAD20',
      benefitText: 'Envoltura de regalo de gala + Grabado láser de cortesía'
    },
    mid: {
      title: 'Quincena Santa Express de Regalos',
      subtitle: '¡No te quedes sin regalos! Kits express listos para entregar en Navidad.',
      badge: '⚡ QUINCENA SANTA EXPRESS',
      discountText: '10% OFF',
      couponCode: 'SANTA10',
      benefitText: 'Entrega prioritaria express garantizada'
    }
  }
];

// Opciones de Paletas de Color para Temporadas
export const COLOR_PALETTES = [
  // PALETAS CLARAS DE ALTA SATURACIÓN Y BRILLO CALIBRADO (Sin blancos lechosos)
  {
    id: 'arena_lino',
    group: 'light',
    name: 'Arena Dorada & Lino',
    desc: 'Ocre tostado, cálida y artesanal',
    previewBg: 'bg-[#C99447]',
    previewBorder: 'border-amber-700',
    accentBg: 'bg-[#A8722B]',
    primaryColor: '#241A0E'
  },
  {
    id: 'salvia_menta',
    group: 'light',
    name: 'Verde Salvia Matcha & Menta',
    desc: 'Botánica viva, fresca y vegetal',
    previewBg: 'bg-[#54A576]',
    previewBorder: 'border-emerald-700',
    accentBg: 'bg-[#135431]',
    primaryColor: '#0F2417'
  },
  {
    id: 'terracota_claro',
    group: 'light',
    name: 'Terracota Vivo & Arcilla',
    desc: 'Cálida, arcillosa y vibrante',
    previewBg: 'bg-[#C86445]',
    previewBorder: 'border-orange-800',
    accentBg: 'bg-[#8C3317]',
    primaryColor: '#2B130B'
  },
  {
    id: 'marfil_oro',
    group: 'light',
    name: 'Oro Artesanal Radiante',
    desc: 'Mostaza ambarina y festiva',
    previewBg: 'bg-[#D4A532]',
    previewBorder: 'border-amber-700',
    accentBg: 'bg-[#B88719]',
    primaryColor: '#1A1913'
  },
  {
    id: 'cielo_verano',
    group: 'light',
    name: 'Azul Brisa Marina',
    desc: 'Celeste oceánico saturado y vivo',
    previewBg: 'bg-[#3594D1]',
    previewBorder: 'border-sky-700',
    accentBg: 'bg-[#0369A1]',
    primaryColor: '#091D2C'
  },
  {
    id: 'cempasuchil_sol',
    group: 'light',
    name: 'Cempasúchil & Sol de Taller',
    desc: 'Amarillo flor brillante y mandarina',
    previewBg: 'bg-[#D97706]',
    previewBorder: 'border-amber-800',
    accentBg: 'bg-[#78350F]',
    primaryColor: '#78350F'
  },
  {
    id: 'lavanda_lila',
    group: 'light',
    name: 'Lavanda Aromática & Amatista',
    desc: 'Floral violeta rico y primaveral',
    previewBg: 'bg-[#8B5CF6]',
    previewBorder: 'border-purple-800',
    accentBg: 'bg-[#4C1D95]',
    primaryColor: '#4C1D95'
  },
  {
    id: 'durazno_coral',
    group: 'light',
    name: 'Durazno Dulce & Coral Floral',
    desc: 'Frutal cálido y acogedor',
    previewBg: 'bg-[#EA580C]',
    previewBorder: 'border-orange-800',
    accentBg: 'bg-[#7C2D12]',
    primaryColor: '#7C2D12'
  },
  {
    id: 'menta_glaciar',
    group: 'light',
    name: 'Menta Glaciar & Turquesa',
    desc: 'Aromática, energizante y fresca',
    previewBg: 'bg-[#0D9488]',
    previewBorder: 'border-teal-800',
    accentBg: 'bg-[#042F2E]',
    primaryColor: '#042F2E'
  },
  {
    id: 'canela_caramelo',
    group: 'light',
    name: 'Canela Tostada & Miel',
    desc: 'Cálida, maderosa y hogareña',
    previewBg: 'bg-[#A66735]',
    previewBorder: 'border-amber-900',
    accentBg: 'bg-[#3D1E0B]',
    primaryColor: '#3D1E0B'
  },

  // PALETAS OSCURAS, NOCTURNAS Y TEMÁTICAS
  {
    id: 'clasico',
    group: 'dark',
    name: 'Verde Bosque & Oro Clásico',
    desc: 'Taller noble tradicional',
    previewBg: 'bg-[#17251E]',
    previewBorder: 'border-[#D4A359]',
    accentBg: 'bg-[#D4A359]',
    primaryColor: '#D4A359'
  },
  {
    id: 'navidad',
    group: 'dark',
    name: 'Navidad Festiva',
    desc: 'Rojo borgoña & verde pino',
    previewBg: 'bg-[#2B0E14]',
    previewBorder: 'border-red-500',
    accentBg: 'bg-red-500',
    primaryColor: '#EF4444'
  },
  {
    id: 'otono',
    group: 'dark',
    name: 'Otoño Cosecha & Ámbar',
    desc: 'Naranja tostado & madera',
    previewBg: 'bg-[#2D1608]',
    previewBorder: 'border-orange-500',
    accentBg: 'bg-orange-500',
    primaryColor: '#F97316'
  },
  {
    id: 'sanvalentin',
    group: 'dark',
    name: 'San Valentín Rubí',
    desc: 'Rosa profundo & romance',
    previewBg: 'bg-[#2D0F1B]',
    previewBorder: 'border-rose-400',
    accentBg: 'bg-rose-500',
    primaryColor: '#F43F5E'
  },
  {
    id: 'primavera',
    group: 'dark',
    name: 'Primavera Selva Nocturna',
    desc: 'Esmeralda profundo & lima',
    previewBg: 'bg-[#12281A]',
    previewBorder: 'border-emerald-400',
    accentBg: 'bg-emerald-500',
    primaryColor: '#10B981'
  },
  {
    id: 'verano',
    group: 'dark',
    name: 'Verano Cálido & Océano',
    desc: 'Azul abisal & cian brillante',
    previewBg: 'bg-[#0F2834]',
    previewBorder: 'border-cyan-400',
    accentBg: 'bg-cyan-500',
    primaryColor: '#06B6D4'
  },
  {
    id: 'buenfin',
    group: 'dark',
    name: 'Buen Fin Dorado & Ónix',
    desc: 'Negro mate & acentos dorados',
    previewBg: 'bg-[#1A1412]',
    previewBorder: 'border-amber-400',
    accentBg: 'bg-amber-400',
    primaryColor: '#FBBF24'
  },
  {
    id: 'cyber_neon',
    group: 'dark',
    name: 'Cyber Taller & Neón',
    desc: 'Ciberpunk turquesa sobre ónix',
    previewBg: 'bg-[#0B132B]',
    previewBorder: 'border-cyan-400',
    accentBg: 'bg-cyan-400',
    primaryColor: '#22D3EE'
  },
  {
    id: 'retro_arcade',
    group: 'dark',
    name: 'Retro Arcade Neón 80s',
    desc: 'Púrpura eléctrico & fucsia arcade',
    previewBg: 'bg-[#1E0528]',
    previewBorder: 'border-fuchsia-500',
    accentBg: 'bg-fuchsia-500',
    primaryColor: '#E879F9'
  },
  {
    id: 'chocolate_cafe',
    group: 'dark',
    name: 'Espresso & Madera Nogal',
    desc: 'Cálida, robusta y artesanal',
    previewBg: 'bg-[#1F130E]',
    previewBorder: 'border-amber-600',
    accentBg: 'bg-amber-600',
    primaryColor: '#D97706'
  },
  {
    id: 'medianoche_zafiro',
    group: 'dark',
    name: 'Zafiro Real & Medianoche',
    desc: 'Azul marino galáctico profundo',
    previewBg: 'bg-[#061226]',
    previewBorder: 'border-blue-400',
    accentBg: 'bg-blue-500',
    primaryColor: '#3B82F6'
  },
  {
    id: 'carbon_minimal',
    group: 'dark',
    name: 'Grafito Titán & Cobre',
    desc: 'Industrial minimalista & cobre',
    previewBg: 'bg-[#121417]',
    previewBorder: 'border-stone-400',
    accentBg: 'bg-orange-500',
    primaryColor: '#F97316'
  },
  {
    id: 'vino_borgona',
    group: 'dark',
    name: 'Vino Borgoña & Oro Real',
    desc: 'Elegancia nocturna solemne',
    previewBg: 'bg-[#26050C]',
    previewBorder: 'border-rose-500',
    accentBg: 'bg-rose-600',
    primaryColor: '#E11D48'
  }
];

// Sugerencias de paletas automáticas según estación
const SEASON_PALETTE_MAP = {
  invierno: 'navidad',
  otono: 'terracota_claro',
  verano: 'cielo_verano',
  primavera: 'salvia_menta',
  bodas: 'marfil_oro'
};

export default function CampaignsAdminSection({
  token,
  products = [],
  onEditProduct,
  onOpenCreateProduct,
  onRefreshCatalog
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeBannerTab, setActiveBannerTab] = useState('themes'); // 'themes' | 'major' | 'mid' | 'flash' | 'showcase'
  const [effectFilterQuarter, setEffectFilterQuarter] = useState('all');
  const [paletteGroupFilter, setPaletteGroupFilter] = useState('light'); // 'light' | 'dark'
  const [isPalettesExpanded, setIsPalettesExpanded] = useState(false);
  const [isSeasonsCollapsed, setIsSeasonsCollapsed] = useState(false);
  const [isPalettesCollapsed, setIsPalettesCollapsed] = useState(false);
  const [isEffectsCollapsed, setIsEffectsCollapsed] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    subtitle: '',
    badge: '',
    confirmText: '',
    changes: [],
    action: null
  });

  // Estado del formulario de campañas
  const [campaignConfig, setCampaignConfig] = useState({
    activeSeasonId: 'invierno',
    title: '',
    subtitle: '',
    bannerBadge: '',
    bannerImage: '/uploads/bundle_promo_hogar_1.jpg',
    promoNotice: '',
    highlightedBundleId: '',
    accentTheme: 'salvia_menta',
    textColorMode: 'auto', // 'auto' | 'black' | 'white'
    seasonalEffect: 'snow',
    isDraft: false,
    lastPublishedAt: null,
    monthlyEvents: {
      baseEventMode: 'major',
      showcaseSlides: DEFAULT_SEASONAL_SLIDES,
      majorEvent: {
        id: 'major-event',
        active: true,
        title: 'Gran Bazar Artesanal de Fin de Mes',
        subtitle: 'Descuento especial en paquetes de taller + envoltura de cortesía y grabado láser de nombres sin costo.',
        badge: '🔥 EVENTO GRANDE DEL MES',
        discountText: '15% OFF',
        couponCode: 'GRANMES15',
        startDate: '2026-10-24',
        endDate: '2026-10-31',
        progressPercent: 84,
        benefitType: 'free_gift',
        benefitText: 'Envío Prioritario + Detalle Grabado de Cortesía'
      },
      midMonthEvent: {
        id: 'mid-month-event',
        active: false,
        title: 'Quincena Relámpago Artesanal',
        subtitle: '¡Llegó la quincena! Llévate kits coordinados para hogar o negocio con precio de taller y 2X monedas arcade.',
        badge: '⚡ QUINCENA ARTESANAL FLASH',
        discountText: '10% OFF',
        couponCode: 'QUINCENA10',
        startDate: '2026-10-12',
        endDate: '2026-10-18',
        progressPercent: 68,
        benefitType: 'double_coins',
        benefitText: '2X Monedas para Juegos + 10% Directo'
      },
      flashSpecial: {
        id: 'flash-special-event',
        active: false,
        title: 'Venta Relámpago de Fin de Semana & Liquidación',
        subtitle: '¡Especial de Fin de Semana! Promociones relámpago, últimas piezas y liquidaciones de taller con cupón exclusivo.',
        badge: '⚡ OFERTA RELÁMPAGO DE FIN DE SEMANA',
        discountText: '30% OFF',
        couponCode: 'FLASHFINDE30',
        startDate: '2026-10-17',
        endDate: '2026-10-19',
        progressPercent: 92,
        benefitType: 'liquidation',
        benefitText: 'Promociones Relámpago + Liquidación de Taller + Envío Express'
      }
    },
    seasons: []
  });

  // Filtro de efectos de partículas
  const filteredSeasonalEffects = React.useMemo(() => {
    const all = Object.entries(SEASONAL_EFFECTS_META);
    if (effectFilterQuarter === 'all') return all;

    const q1Months = ['Enero', 'Febrero', 'Marzo'];
    const q2Months = ['Abril', 'Mayo', 'Junio'];
    const q3Months = ['Julio', 'Agosto', 'Septiembre'];
    const q4Months = ['Octubre', 'Noviembre', 'Diciembre'];

    let targetMonths = [];
    if (effectFilterQuarter === 'q1') targetMonths = q1Months;
    if (effectFilterQuarter === 'q2') targetMonths = q2Months;
    if (effectFilterQuarter === 'q3') targetMonths = q3Months;
    if (effectFilterQuarter === 'q4') targetMonths = q4Months;

    return all.filter(([key, meta]) => {
      if (key === 'none' || meta.month === 'Todos' || meta.month === 'Todo el año') return true;
      return targetMonths.includes(meta.month);
    });
  }, [effectFilterQuarter]);

  // Cargar configuración de campañas
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const resCamp = await fetch('/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resCamp.ok) {
        const data = await resCamp.json();
        setCampaignConfig(prev => ({
          ...prev,
          ...data,
          accentTheme: data.accentTheme || prev.accentTheme || 'salvia_menta',
          textColorMode: data.textColorMode || prev.textColorMode || 'auto',
          seasonalEffect: data.seasonalEffect || prev.seasonalEffect || 'snow',
          monthlyEvents: {
            baseEventMode: data.monthlyEvents?.baseEventMode || 'major',
            showcaseSlides: data.monthlyEvents?.showcaseSlides || data.showcaseSlides || prev.monthlyEvents?.showcaseSlides || DEFAULT_SEASONAL_SLIDES,
            majorEvent: { ...(prev.monthlyEvents?.majorEvent || {}), ...(data.monthlyEvents?.majorEvent || {}) },
            midMonthEvent: { ...(prev.monthlyEvents?.midMonthEvent || {}), ...(data.monthlyEvents?.midMonthEvent || {}) },
            flashSpecial: { ...(prev.monthlyEvents?.flashSpecial || {}), ...(data.monthlyEvents?.flashSpecial || {}) }
          }
        }));
      }
    } catch (err) {
      console.error('Error cargando campañas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCampaigns();
  }, [token]);

  // Selección de Temporada: actualiza textos, animación y asigna la paleta de color recomendada
  const handleSelectSeason = (seasonId) => {
    const season = campaignConfig.seasons?.find(s => s.id === seasonId);
    if (!season) return;

    const suggestedPalette = SEASON_PALETTE_MAP[seasonId] || 'salvia_menta';
    const isLightPalette = !['clasico', 'navidad', 'otono', 'sanvalentin', 'buenfin'].includes(suggestedPalette);
    setPaletteGroupFilter(isLightPalette ? 'light' : 'dark');

    setCampaignConfig(prev => ({
      ...prev,
      activeSeasonId: seasonId,
      title: season.title || prev.title,
      subtitle: season.subtitle || prev.subtitle,
      bannerBadge: season.badge || prev.bannerBadge,
      bannerImage: season.bannerImage || prev.bannerImage,
      promoNotice: season.promoNotice || prev.promoNotice,
      accentTheme: suggestedPalette,
      seasonalEffect: season.seasonalEffect || prev.seasonalEffect || 'snow',
      highlightedBundleId: season.suggestedBundles?.[0] || prev.highlightedBundleId,
      isDraft: true // Marcamos borrador pendiente
    }));

    setMessage({
      text: `Se aplicó la temporada "${season.name}" con la paleta "${suggestedPalette}". Puedes cambiar colores o efectos libremente antes de publicar.`,
      type: 'info'
    });
  };

  const updateField = (field, value) => {
    setCampaignConfig(prev => {
      const activeId = prev.activeSeasonId;
      const updatedSeasons = (prev.seasons || []).map(s => {
        if (s.id === activeId) {
          if (field === 'bannerBadge') return { ...s, badge: value };
          if (field === 'seasonalEffect') return { ...s, seasonalEffect: value };
          if (field === 'highlightedBundleId') return { ...s, suggestedBundles: value ? [value] : [] };
          return { ...s, [field]: value };
        }
        return s;
      });
      return {
        ...prev,
        [field]: value,
        seasons: updatedSeasons,
        isDraft: true // Modificación activa en borrador
      };
    });
  };

  const updateMonthlyEvent = (eventType, field, value) => {
    setCampaignConfig(prev => {
      const currentEvents = prev.monthlyEvents || {};
      const targetEvent = currentEvents[eventType] || {};
      return {
        ...prev,
        isDraft: true,
        monthlyEvents: {
          ...currentEvents,
          [eventType]: {
            ...targetEvent,
            [field]: value
          }
        }
      };
    });
  };

  // Alternar el evento base activo (O Evento Grande O Quincena Relámpago)
  const handleSelectBaseEventMode = (mode) => {
    setCampaignConfig(prev => {
      const currentEvents = prev.monthlyEvents || {};
      return {
        ...prev,
        isDraft: true,
        monthlyEvents: {
          ...currentEvents,
          baseEventMode: mode,
          majorEvent: {
            ...(currentEvents.majorEvent || {}),
            active: mode === 'major'
          },
          midMonthEvent: {
            ...(currentEvents.midMonthEvent || {}),
            active: mode === 'mid'
          }
        }
      };
    });
  };

  // Helper para calcular si una fecha de inicio es a futuro
  const calcUpcomingDays = (startDate) => {
    if (!startDate) return { isUpcoming: false, days: 0 };
    const now = new Date();
    const start = new Date(`${startDate}T00:00:00`);
    if (now.getTime() < start.getTime()) {
      const diff = start.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return { isUpcoming: true, days };
    }
    return { isUpcoming: false, days: 0 };
  };

  const handleApplyMonthTemplate = (template) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    setCampaignConfig(prev => {
      const existing = prev.monthlyEvents || {};
      return {
        ...prev,
        isDraft: true,
        monthlyEvents: {
          ...existing,
          majorEvent: {
            id: 'major-event',
            active: true,
            title: template.major.title,
            subtitle: template.major.subtitle,
            badge: template.major.badge,
            discountText: template.major.discountText,
            couponCode: template.major.couponCode,
            startDate: `${year}-${month}-20`,
            endDate: `${year}-${month}-31`,
            progressPercent: existing.majorEvent?.progressPercent || 84,
            benefitType: 'free_gift',
            benefitText: template.major.benefitText
          },
          midMonthEvent: {
            id: 'mid-month-event',
            active: true,
            title: template.mid.title,
            subtitle: template.mid.subtitle,
            badge: template.mid.badge,
            discountText: template.mid.discountText,
            couponCode: template.mid.couponCode,
            startDate: `${year}-${month}-10`,
            endDate: `${year}-${month}-18`,
            progressPercent: existing.midMonthEvent?.progressPercent || 68,
            benefitType: 'double_coins',
            benefitText: template.mid.benefitText
          }
        }
      };
    });
    setMessage({
      text: `Plantilla comercial aplicada para ${template.monthName}. Revisa tus fechas y guarda borrador o publica.`,
      type: 'success'
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        updateField('bannerImage', data.url);
        setMessage({ text: 'Imagen de portada subida con éxito', type: 'success' });
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Error al subir imagen', type: 'error' });
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setMessage({ text: 'Error de red al subir imagen', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper para actualizar campos de una diapositiva específica de la carátula de novedades
  const updateShowcaseSlide = (index, field, value) => {
    setCampaignConfig(prev => {
      const currentEvents = prev.monthlyEvents || {};
      const currentSlides = currentEvents.showcaseSlides || DEFAULT_SEASONAL_SLIDES;
      const updatedSlides = currentSlides.map((slide, idx) => {
        if (idx === index) {
          return { ...slide, [field]: value };
        }
        return slide;
      });
      return {
        ...prev,
        isDraft: true,
        monthlyEvents: {
          ...currentEvents,
          showcaseSlides: updatedSlides
        }
      };
    });
  };

  // Helper para subir imagen específica para una diapositiva de la carátula
  const handleSlideImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingSlideIdx(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        updateShowcaseSlide(index, 'image', data.url);
        setMessage({ text: `Fotografía actualizada para la diapositiva ${index + 1} de la carátula`, type: 'success' });
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Error al subir imagen', type: 'error' });
      }
    } catch (err) {
      console.error('Error subiendo imagen para diapositiva:', err);
      setMessage({ text: 'Error de red al subir imagen', type: 'error' });
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  const buildCampaignChanges = (isPublish) => {
    const events = campaignConfig.monthlyEvents || {};
    const baseMode = events.baseEventMode || 'major';
    const activeEventDesc = baseMode === 'mid'
      ? `Quincena Relámpago (${events.midMonthEvent?.title || 'Quincena Flash'})`
      : `Evento Grande del Mes (${events.majorEvent?.title || 'Gran Evento'})`;

    const seasonName = campaignConfig.seasons?.find(s => s.id === campaignConfig.activeSeasonId)?.name || campaignConfig.activeSeasonId || 'Personalizada';

    const changes = [
      {
        icon: '🗓️',
        label: 'Campaña / Temporada Activa',
        detail: `Temporada activa: ${seasonName}. Efecto ambiental: ${campaignConfig.seasonalEffect || 'snow'}.`,
        badge: seasonName
      },
      {
        icon: '🎨',
        label: 'Paleta de Color y Tema',
        detail: `Tema de acento aplicado en la tienda: ${campaignConfig.accentTheme || 'salvia_menta'}.`,
        badge: campaignConfig.accentTheme || 'salvia_menta'
      },
      {
        icon: '📢',
        label: 'Banner Principal de Tienda',
        detail: `Título: "${campaignConfig.title || 'Sin título'}". Insignia: ${campaignConfig.bannerBadge || 'Promoción Especial'}.`,
        badge: isPublish ? 'Publicado en Vivo' : 'Borrador Guardado'
      },
      {
        icon: '⚡',
        label: 'Eventos del Mes & Ofertas Relámpago',
        detail: `Modo Base: ${activeEventDesc}. Oferta Relámpago de Fin de Semana: ${events.flashSpecial?.active ? '🟢 Activa' : 'Pausada'}.`,
        badge: events.flashSpecial?.active ? 'Flash Activo' : 'Base Activo'
      }
    ];

    if (campaignConfig.promoNotice) {
      changes.push({
        icon: '🏷️',
        label: 'Aviso de Barra Superior',
        detail: `Texto: "${campaignConfig.promoNotice}".`
      });
    }

    return changes;
  };

  // Solicitar confirmación antes de guardar borrador
  const handleSaveDraft = () => {
    const changes = buildCampaignChanges(false);
    setConfirmModalConfig({
      title: 'Confirmar Guardar Borrador',
      subtitle: 'Tus modificaciones se guardarán como borrador sin alterar la tienda pública de inmediato.',
      badge: 'Borrador',
      confirmText: 'Sí, Guardar Borrador',
      changes,
      action: executeSaveDraft
    });
    setShowConfirmModal(true);
  };

  // Solicitar confirmación antes de publicar en vivo
  const handlePublishLive = () => {
    const changes = buildCampaignChanges(true);
    setConfirmModalConfig({
      title: 'Confirmar Publicación en Tienda en Vivo',
      subtitle: '¡Atención! Estos cambios se publicarán inmediatamente en vivo para todos los clientes.',
      badge: 'Publicación en Vivo',
      confirmText: 'Sí, Publicar en Tienda',
      changes,
      action: executePublishLive
    });
    setShowConfirmModal(true);
  };

  // 1. Guardar Borrador (Guarda sin activar de inmediato si se desea continuar editando)
  const executeSaveDraft = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const draftPayload = {
        ...campaignConfig,
        isDraft: true
      };

      const res = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(draftPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setCampaignConfig(data);
        setMessage({
          text: '💾 Borrador guardado exitosamente. Tus cambios están protegidos y listos para cuando decidas publicarlos.',
          type: 'info'
        });
      } else {
        setMessage({ text: 'Error al guardar el borrador', type: 'error' });
      }
    } catch (err) {
      console.error('Error guardando borrador:', err);
      setMessage({ text: 'Error de red al guardar borrador', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // 2. Publicar Cambios en Tienda (Aplica en vivo a todos los clientes)
  const executePublishLive = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const publishPayload = {
        ...campaignConfig,
        isDraft: false,
        lastPublishedAt: new Date().toISOString()
      };

      const res = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(publishPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setCampaignConfig(data);
        setMessage({
          text: '🚀 ¡Campaña y Temporada PUBLICADAS EN VIVO en la tienda! Los clientes ya pueden ver los nuevos colores, banner y promociones.',
          type: 'success'
        });
        if (onRefreshCatalog) onRefreshCatalog();
      } else {
        setMessage({ text: 'Error al publicar en la tienda', type: 'error' });
      }
    } catch (err) {
      console.error('Error publicando campaña:', err);
      setMessage({ text: 'Error de red al publicar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const bundleProducts = products.filter(p =>
    p.isBundle ||
    p.category === 'paquetes' ||
    p.category === 'servicios' ||
    p.code?.startsWith('PROMO') ||
    p.code?.includes('PATCH') ||
    p.worlds?.includes('paquetes') ||
    p.worlds?.includes('paquetes-servicios')
  );

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 text-xs">
        Cargando configuración de temporadas y efectos...
      </div>
    );
  }

  const activeSeason = campaignConfig.seasons?.find(s => s.id === campaignConfig.activeSeasonId) || {
    name: 'Temporada Personalizada',
    icon: '⭐'
  };

  const currentThemeMeta = COLOR_PALETTES.find(p => p.id === campaignConfig.accentTheme) || COLOR_PALETTES[0];

  return (
    <div className="space-y-6 animate-fade-in text-xs max-w-6xl mx-auto">

      {/* Encabezado y Barra de Acción con Guardar Borrador vs Publicar en Tienda */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-purple-100 text-purple-800 font-bold text-lg">
              🌸
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-[#1F2421]">
                  Temporadas, Paletas de Color &amp; Eventos del Mes
                </h3>
                {campaignConfig.isDraft ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <span>🟡</span> Borrador Pendiente de Publicar
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span>🟢</span> En Vivo en Tienda
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs max-w-2xl leading-relaxed mt-0.5">
                Configura la temporada activa, elige entre paletas claras/cálidas u oscuras, partículas estacionales y programa tus eventos base y relámpago con opción de guardar cambios antes de publicarlos.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Doble Acción: Guardar Borrador vs Publicar en Tienda */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2.5 rounded-2xl bg-[#FAF9F5] hover:bg-stone-100 text-[#1F2421] border border-stone-300 font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Guarda tus cambios como borrador sin alterar la tienda pública"
          >
            <Save className="w-4 h-4 text-stone-600" />
            <span>Guardar Borrador</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLive}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Publicar inmediatamente todos los cambios en la tienda en vivo para los clientes"
          >
            {saving ? (
              <span>Publicando...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publicar en Tienda</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensajes de Estado */}
      {message.text && (
        <div className={`p-4 rounded-2xl font-bold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : message.type === 'info'
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.type === 'success' ? '✓' : message.type === 'info' ? 'ℹ' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. PREVISUALIZACIÓN EN VIVO DEL BANNER DE EVENTOS Y CARÁTULA (HASTA ARRIBA DEL TODO) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <label className="text-xs sm:text-sm font-black font-heading text-[#1F2421] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D4A359]" />
              <span>Previsualización en vivo del banner de eventos y carátula para tus clientes:</span>
            </label>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Así verán tus clientes el banner animado en la tienda principal según tu configuración activa. Los cambios que hagas abajo se reflejan aquí al instante.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-bold text-[11px] border border-stone-200">
              Letra: {campaignConfig.textColorMode === 'white' ? 'Blanca' : campaignConfig.textColorMode === 'black' ? 'Negra' : 'Auto'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
              Tema: {currentThemeMeta.name}
            </span>
          </div>
        </div>
        <MonthlyEventBanner
          eventsConfig={campaignConfig.monthlyEvents}
          seasonalEffect={campaignConfig.seasonalEffect}
          activeTheme={campaignConfig?.accentTheme || 'salvia_menta'}
          textColorMode={campaignConfig?.textColorMode || 'auto'}
          showcaseSlides={campaignConfig.monthlyEvents?.showcaseSlides || campaignConfig.showcaseSlides || DEFAULT_SEASONAL_SLIDES}
        />
      </div>

      {/* 2. SELECTOR DE SECCIONES EN PESTAÑAS MINIMALISTAS (ESTILO ÁREAS) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: 'themes', label: 'Colores & Letra', icon: Palette, desc: 'Paletas, letra y partículas' },
          { id: 'major', label: 'Evento Grande', icon: Calendar, desc: 'Evento mensual principal' },
          { id: 'mid', label: 'Quincena Relámpago', icon: Zap, desc: '2X arcade y combos' },
          { id: 'flash', label: 'Finde Flash', icon: Flame, desc: 'Ofertas relámpago de fin' },
          { id: 'showcase', label: 'Carátula & Fotos', icon: ImageIcon, desc: '5 fotos de novedades' }
        ].map(tab => {
          const isSelected = activeBannerTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBannerTab(tab.id)}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 shadow-2xs ${
                isSelected
                  ? 'bg-[#17251E] text-white border-[#D4A359] ring-2 ring-[#D4A359]/40 shadow-md'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-[#E8E4DA]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-[#D4A359] text-black' : 'bg-gray-100 text-gray-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {tab.id === 'themes' && campaignConfig.textColorMode && (
                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-black uppercase ${
                    isSelected ? 'bg-white/20 text-[#D4A359]' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {campaignConfig.textColorMode === 'white' ? 'Letra B' : campaignConfig.textColorMode === 'black' ? 'Letra N' : 'Auto'}
                  </span>
                )}
                {tab.id === 'flash' && campaignConfig.monthlyEvents?.flashSpecial?.active && (
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded font-black uppercase bg-orange-500 text-white animate-pulse">
                    Activo
                  </span>
                )}
              </div>
              <div>
                <div className="font-heading font-black text-xs leading-tight">{tab.label}</div>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. CONTENIDO DE LA PESTAÑA SELECCIONADA */}

      {/* PESTAÑA 1: COLORES, LETRA, ESTACIONES Y PARTÍCULAS */}
      {activeBannerTab === 'themes' && (
        <div className="space-y-5 animate-fade-in">
          {/* Selector de Letra Blanca o Negra para Tienda y Banners */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Color de Letra para la Tienda y Banners</span>
                </h4>
                <p className="text-gray-500 text-[11.5px]">
                  Elige si prefieres que los textos y títulos de la tienda y de los banners se muestren en color blanco, negro o ajustados automáticamente según la paleta activa.
                </p>
              </div>
              <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => updateField('textColorMode', 'auto')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    (campaignConfig.textColorMode || 'auto') === 'auto'
                      ? 'bg-[#2D4F3E] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>Auto (Recomendado)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('textColorMode', 'black')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    campaignConfig.textColorMode === 'black'
                      ? 'bg-[#1F2421] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-stone-400" />
                  <span>Letra Negra</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('textColorMode', 'white')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    campaignConfig.textColorMode === 'white'
                      ? 'bg-stone-900 text-white shadow-xs ring-1 ring-amber-400'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-400" />
                  <span>Letra Blanca</span>
                </button>
              </div>
            </div>
          </div>

          {/* Selector de Estación del Año & Paletas */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A359]" />
                  <span>1. Seleccionar Estación del Año &amp; Paleta de Colores de Tienda</span>
                </h4>
                <p className="text-gray-500 text-[11.5px]">
                  Al elegir una estación se cargan sus textos y paleta sugerida. Puedes cambiar la combinación de colores libremente entre tonos claros y oscuros.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
                  Estación: {activeSeason.icon} {activeSeason.name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSeasonsCollapsed(prev => !prev)}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  {isSeasonsCollapsed ? '▼ Mostrar estaciones' : '▲ Contraer'}
                </button>
              </div>
            </div>

            {/* Tarjetas de Estaciones */}
            {!isSeasonsCollapsed && (
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-2 uppercase tracking-wider">
                  A) Elige la Estación del Año o Campaña Temática:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(campaignConfig.seasons || []).map(s => {
                    const isSelected = campaignConfig.activeSeasonId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSeason(s.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#1F2421] text-white border-[#1F2421] shadow-md ring-2 ring-[#D4A359]'
                            : 'bg-[#FBF9F5] text-gray-700 border-[#E8E4DA] hover:border-gray-400 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{s.icon}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-[#D4A359] text-[#17251E] text-[9px] font-black uppercase">
                              Activa
                            </span>
                          )}
                        </div>
                        <div>
                          <div className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {s.name}
                          </div>
                          <div className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                            {s.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personalizar Paleta de Colores */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5 text-purple-600" />
                    <span>B) Personalizar Paleta de Colores de la Tienda &amp; Banners:</span>
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Selecciona si prefieres una paleta <strong>Clara y Cálida</strong> (ideal para día, arena, salvia o marfil) o una <strong>Profunda y Nocturna</strong> (verde bosque, navidad o noche).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPaletteGroupFilter('light')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        paletteGroupFilter === 'light'
                          ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>☀️ Claras Saturadas (10)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaletteGroupFilter('dark')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        paletteGroupFilter === 'dark'
                          ? 'bg-[#1F2421] text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>🌙 Oscuras &amp; Temáticas (12)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPalettesCollapsed(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2D4F3E] bg-[#E8EFEA] hover:bg-[#D5E3DA] transition-colors cursor-pointer border border-[#2D4F3E]/20"
                  >
                    <span>{isPalettesCollapsed ? '▼ Mostrar paletas' : '▲ Contraer sección'}</span>
                  </button>
                </div>
              </div>

              {!isPalettesCollapsed && (() => {
                const filtered = COLOR_PALETTES.filter(p => p.group === paletteGroupFilter);
                const displayPalettes = isPalettesExpanded ? filtered : filtered.slice(0, 5);

                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                      {displayPalettes.map(palette => {
                        const isSelected = campaignConfig.accentTheme === palette.id;
                        return (
                          <button
                            key={palette.id}
                            type="button"
                            onClick={() => updateField('accentTheme', palette.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-white border-[#2D4F3E] ring-2 ring-[#2D4F3E] shadow-sm'
                                : 'bg-[#FAF9F5] border-gray-200 hover:border-gray-400 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-5 h-5 rounded-full border shadow-2xs ${palette.previewBg} ${palette.previewBorder}`} />
                                <span className={`w-3.5 h-3.5 rounded-full shadow-2xs ${palette.accentBg}`} />
                              </div>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-[#2D4F3E] text-white text-[9px] font-black uppercase">
                                  Seleccionada
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="font-bold text-xs text-gray-900">
                                {palette.name}
                              </div>
                              <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                {palette.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>Mostrando {displayPalettes.length} de {filtered.length} paletas de este grupo</span>
                      <button
                        type="button"
                        onClick={() => setIsPalettesExpanded(prev => !prev)}
                        className="text-[#2D4F3E] font-bold hover:underline cursor-pointer"
                      >
                        {isPalettesExpanded ? '▲ Mostrar solo 5 recomendadas' : `Ver las ${filtered.length - 5} restantes →`}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Atmósfera y Partículas Estacionales */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                  <Sparkle className="w-4 h-4 text-amber-500" />
                  <span>2. Animación y Atmósfera de Temporada en Tienda (24+ Efectos)</span>
                </h4>
                <p className="text-gray-500 text-[11.5px]">
                  Selecciona el efecto visual flotante (nieve, hojas de otoño, flores de sakura, destellos dorados o burbujas) para envolver tu tienda.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-extrabold text-[11px] border border-amber-200 self-start sm:self-auto">
                  Activo: {SEASONAL_EFFECTS_META[campaignConfig.seasonalEffect || 'snow']?.icon} {SEASONAL_EFFECTS_META[campaignConfig.seasonalEffect || 'snow']?.label}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEffectsCollapsed(prev => !prev)}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  {isEffectsCollapsed ? '▼ Mostrar efectos' : '▲ Contraer'}
                </button>
              </div>
            </div>

            {!isEffectsCollapsed && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'Todos (24+ Efectos)' },
                    { id: 'q1', label: 'Q1: Ene - Mar' },
                    { id: 'q2', label: 'Q2: Abr - Jun' },
                    { id: 'q3', label: 'Q3: Jul - Sep' },
                    { id: 'q4', label: 'Q4: Oct - Dic' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEffectFilterQuarter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        effectFilterQuarter === f.id
                          ? 'bg-[#2D4F3E] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto p-1 border border-gray-100 rounded-2xl">
                  {filteredSeasonalEffects.map(([key, meta]) => {
                    const isSelected = campaignConfig.seasonalEffect === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateField('seasonalEffect', key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{meta.icon}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {meta.month}
                          </span>
                        </div>
                        <div>
                          <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {meta.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Portada Principal, Textos de Campaña & Paquete Estrella */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-5">
            <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2 border-b border-gray-100 pb-3">
              <Edit className="w-4 h-4 text-[#2D4F3E]" />
              <span>3. Portada Principal, Textos de Campaña &amp; Paquete Estrella</span>
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Imagen de Portada / Banner de Temporada:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={campaignConfig.bannerImage || ''}
                      onChange={e => updateField('bannerImage', e.target.value)}
                      placeholder="/uploads/tu_foto.jpg o https://..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                    />
                    <label className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingImage ? 'Subiendo...' : 'Subir'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-bold text-gray-600 block">
                    Galería sugerida de portadas de taller (haz clic para aplicar):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SUGGESTED_BANNER_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('bannerImage', img.url)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-video group ${
                          campaignConfig.bannerImage === img.url
                            ? 'border-[#2D4F3E] ring-2 ring-[#2D4F3E]'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        title={img.label}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1 text-[8.5px] font-bold text-white line-clamp-1">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Paquete Estrella Destacado del Mes:</span>
                  </label>
                  <select
                    value={campaignConfig.highlightedBundleId || ''}
                    onChange={e => updateField('highlightedBundleId', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                  >
                    <option value="">-- Ninguno (sin destacar) --</option>
                    {bundleProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name} - ${p.price} MXN (Ahorras ${p.savings || 100})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Distintivo Superior (Badge):
                  </label>
                  <input
                    type="text"
                    value={campaignConfig.bannerBadge || ''}
                    onChange={e => updateField('bannerBadge', e.target.value)}
                    placeholder="Ej: 🌸 Especial de Primavera"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-1 focus:ring-[#2D4F3E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Título Principal de la Campaña:
                  </label>
                  <input
                    type="text"
                    value={campaignConfig.title || ''}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder="Ej: Especial de Primavera: Paquetes y Recuerdos de Taller"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-1 focus:ring-[#2D4F3E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Subtítulo / Gancho Comercial:
                  </label>
                  <textarea
                    rows={2}
                    value={campaignConfig.subtitle || ''}
                    onChange={e => updateField('subtitle', e.target.value)}
                    placeholder="Ej: Kits coordinados en madera, grabado láser y piezas 3D con hasta 25% de ahorro."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Beneficio / Regalo de Temporada (Texto Destacado):
                  </label>
                  <input
                    type="text"
                    value={campaignConfig.promoNotice || ''}
                    onChange={e => updateField('promoNotice', e.target.value)}
                    placeholder="Ej: 🎁 Envío gratis a todo México en compras mayores a $800 + grabado de cortesía"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-emerald-800 font-semibold bg-emerald-50/50 focus:ring-1 focus:ring-[#2D4F3E]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: EVENTO GRANDE DEL MES */}
      {activeBannerTab === 'major' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Eventos Promocionales del Mes (Estilo Temu / Mercado Libre / AliExpress)</span>
              </h4>
              <p className="text-gray-500 text-[11.5px] max-w-3xl leading-relaxed">
                Configura el evento comercial base del mes (regla: <strong>o es uno o es otro</strong> entre Evento Grande y Quincena Relámpago).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                campaignConfig.monthlyEvents?.baseEventMode !== 'mid'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 text-stone-600'
              }`}>
                {campaignConfig.monthlyEvents?.baseEventMode !== 'mid' ? '🟢 Activo como Evento Base' : 'Pausado (Quincena Activa)'}
              </span>
            </div>
          </div>

          {/* Plantillas Rápidas de Eventos por Mes */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Plantillas Rápidas del Calendario Comercial (1 Clic para autocompletar):</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MONTHLY_EVENT_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyMonthTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-400 text-gray-700 hover:text-amber-900 font-bold text-[10.5px] transition-all cursor-pointer shadow-2xs"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modalidad de Evento Base de Tienda */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DA] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-[#17251E] uppercase tracking-wide flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Modalidad de Evento Base de Tienda (O uno u otro):</span>
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Por regla de tienda solo se muestra uno a la vez en el encabezado. Selecciona si deseas activar el Evento Grande o la Quincena.
                </p>
              </div>
              <div className="inline-flex p-1 rounded-xl bg-white border border-[#E8E4DA] shadow-xs shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectBaseEventMode('major')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    campaignConfig.monthlyEvents?.baseEventMode !== 'mid'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>1. Evento Grande del Mes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectBaseEventMode('mid')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    campaignConfig.monthlyEvents?.baseEventMode === 'mid'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>2. Quincena Relámpago</span>
                </button>
              </div>
            </div>
          </div>

          {/* Formulario del Evento Grande */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/40 to-white border-2 border-amber-400 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500 text-white font-black text-xs">
                  <Flame className="w-4 h-4 fill-white" />
                </span>
                <div>
                  <h5 className="font-heading font-black text-xs text-amber-950 uppercase tracking-wider">
                    Evento Grande Principal del Mes
                  </h5>
                  <span className="text-[10px] text-gray-500">Fin de mes / Arranque de temporada</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[11px] font-bold text-gray-700">
                  {campaignConfig.monthlyEvents?.baseEventMode !== 'mid' ? '🟢 Activo en Tienda' : 'Pausado'}
                </span>
                <input
                  type="checkbox"
                  checked={campaignConfig.monthlyEvents?.baseEventMode !== 'mid'}
                  onChange={(e) => handleSelectBaseEventMode(e.target.checked ? 'major' : 'mid')}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nombre / Título del Evento:</label>
                <input
                  type="text"
                  value={campaignConfig.monthlyEvents?.majorEvent?.title || ''}
                  onChange={e => updateMonthlyEvent('majorEvent', 'title', e.target.value)}
                  placeholder="Ej: Gran Bazar Artesanal de Fin de Mes"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Slogan / Subtítulo:</label>
                <textarea
                  rows={2}
                  value={campaignConfig.monthlyEvents?.majorEvent?.subtitle || ''}
                  onChange={e => updateMonthlyEvent('majorEvent', 'subtitle', e.target.value)}
                  placeholder="Ej: Descuento especial en paquetes de taller + envoltura de cortesía."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Descuento Destacado:</label>
                  <input
                    type="text"
                    value={campaignConfig.monthlyEvents?.majorEvent?.discountText || ''}
                    onChange={e => updateMonthlyEvent('majorEvent', 'discountText', e.target.value)}
                    placeholder="15% OFF"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-amber-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Código de Cupón:</label>
                  <input
                    type="text"
                    value={campaignConfig.monthlyEvents?.majorEvent?.couponCode || ''}
                    onChange={e => updateMonthlyEvent('majorEvent', 'couponCode', e.target.value.toUpperCase())}
                    placeholder="GRANMES15"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={campaignConfig.monthlyEvents?.majorEvent?.startDate || ''}
                    onChange={e => updateMonthlyEvent('majorEvent', 'startDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fecha de Fin:</label>
                  <input
                    type="date"
                    value={campaignConfig.monthlyEvents?.majorEvent?.endDate || ''}
                    onChange={e => updateMonthlyEvent('majorEvent', 'endDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                  />
                </div>
              </div>

              {(() => {
                const { isUpcoming, days } = calcUpcomingDays(campaignConfig.monthlyEvents?.majorEvent?.startDate);
                if (!isUpcoming) return null;
                return (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
                    <span className="text-sm">⏳</span>
                    <span>PRÓXIMAMENTE (Faltan {days} {days === 1 ? 'día' : 'días'} para su inicio oficial)</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: QUINCENA RELÁMPAGO */}
      {activeBannerTab === 'mid' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-600" />
                <span>Quincena Relámpago Artesanal (Evento Quincenal)</span>
              </h4>
              <p className="text-gray-500 text-[11.5px] max-w-3xl leading-relaxed">
                Diseñado para mitades de mes. Ofrece 2X monedas para el Arcade del Taller y descuentos en paquetes clave.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectBaseEventMode('mid')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  campaignConfig.monthlyEvents?.baseEventMode === 'mid'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {campaignConfig.monthlyEvents?.baseEventMode === 'mid' ? '✓ Activa como Evento Base' : 'Activar como Evento Base'}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-50/40 to-white border-2 border-cyan-500 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-cyan-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-600 text-white font-black text-xs">
                  <Zap className="w-4 h-4 fill-white" />
                </span>
                <div>
                  <h5 className="font-heading font-black text-xs text-cyan-950 uppercase tracking-wider">
                    Detalles de la Quincena Relámpago
                  </h5>
                  <span className="text-[10px] text-gray-500">Mitad de mes / Salto de quincena</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[11px] font-bold text-gray-700">
                  {campaignConfig.monthlyEvents?.baseEventMode === 'mid' ? '🟢 Activo en Tienda' : 'Pausado'}
                </span>
                <input
                  type="checkbox"
                  checked={campaignConfig.monthlyEvents?.baseEventMode === 'mid'}
                  onChange={(e) => handleSelectBaseEventMode(e.target.checked ? 'mid' : 'major')}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nombre / Título de la Quincena:</label>
                <input
                  type="text"
                  value={campaignConfig.monthlyEvents?.midMonthEvent?.title || ''}
                  onChange={e => updateMonthlyEvent('midMonthEvent', 'title', e.target.value)}
                  placeholder="Ej: Quincena Relámpago Artesanal"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Slogan / Subtítulo:</label>
                <textarea
                  rows={2}
                  value={campaignConfig.monthlyEvents?.midMonthEvent?.subtitle || ''}
                  onChange={e => updateMonthlyEvent('midMonthEvent', 'subtitle', e.target.value)}
                  placeholder="Ej: ¡Llegó la quincena! Kits coordinados con precio directo de taller."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Descuento Destacado:</label>
                  <input
                    type="text"
                    value={campaignConfig.monthlyEvents?.midMonthEvent?.discountText || ''}
                    onChange={e => updateMonthlyEvent('midMonthEvent', 'discountText', e.target.value)}
                    placeholder="10% OFF"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-cyan-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Código de Cupón:</label>
                  <input
                    type="text"
                    value={campaignConfig.monthlyEvents?.midMonthEvent?.couponCode || ''}
                    onChange={e => updateMonthlyEvent('midMonthEvent', 'couponCode', e.target.value.toUpperCase())}
                    placeholder="QUINCENA10"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Beneficio Destacado:</label>
                <input
                  type="text"
                  value={campaignConfig.monthlyEvents?.midMonthEvent?.benefitText || ''}
                  onChange={e => updateMonthlyEvent('midMonthEvent', 'benefitText', e.target.value)}
                  placeholder="2X Monedas para el Arcade + 10% Directo"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={campaignConfig.monthlyEvents?.midMonthEvent?.startDate || ''}
                    onChange={e => updateMonthlyEvent('midMonthEvent', 'startDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fecha de Fin:</label>
                  <input
                    type="date"
                    value={campaignConfig.monthlyEvents?.midMonthEvent?.endDate || ''}
                    onChange={e => updateMonthlyEvent('midMonthEvent', 'endDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                  />
                </div>
              </div>

              {(() => {
                const { isUpcoming, days } = calcUpcomingDays(campaignConfig.monthlyEvents?.midMonthEvent?.startDate);
                if (!isUpcoming) return null;
                return (
                  <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs font-bold flex items-center gap-2">
                    <span className="text-sm">⏳</span>
                    <span>PRÓXIMAMENTE (Faltan {days} {days === 1 ? 'día' : 'días'} para su inicio oficial)</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: FINDE FLASH */}
      {activeBannerTab === 'flash' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Especial: Oferta Relámpago de Fin de Semana &amp; Liquidaciones</span>
              </h4>
              <p className="text-gray-500 text-[11.5px] max-w-3xl leading-relaxed">
                Pestaña especial flash de fin de semana con reloj de urgencia y cupón de liquidación agresiva.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <span className="text-xs font-bold text-gray-700">
                  {campaignConfig.monthlyEvents?.flashSpecial?.active ? '🟢 Activo en Tienda' : 'Pausado'}
                </span>
                <input
                  type="checkbox"
                  checked={campaignConfig.monthlyEvents?.flashSpecial?.active || false}
                  onChange={e => updateMonthlyEvent('flashSpecial', 'active', e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className={`p-5 rounded-2xl bg-gradient-to-b from-orange-50/50 via-amber-50/20 to-white border-2 space-y-4 shadow-sm transition-all ${
            campaignConfig.monthlyEvents?.flashSpecial?.active
              ? 'border-orange-500 ring-2 ring-orange-400/20'
              : 'border-gray-200'
          }`}>
            <div className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nombre / Título de la Oferta Relámpago:</label>
                <input
                  type="text"
                  value={campaignConfig.monthlyEvents?.flashSpecial?.title || ''}
                  onChange={e => updateMonthlyEvent('flashSpecial', 'title', e.target.value)}
                  placeholder="Venta Relámpago de Fin de Semana & Liquidación"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-orange-950 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Slogan / Subtítulo Flash:</label>
                <textarea
                  rows={2}
                  value={campaignConfig.monthlyEvents?.flashSpecial?.subtitle || ''}
                  onChange={e => updateMonthlyEvent('flashSpecial', 'subtitle', e.target.value)}
                  placeholder="¡Especial de Fin de Semana! Promociones relámpago, últimas piezas y liquidaciones de taller con cupón exclusivo."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Descuento Destacado:</label>
                  <input
                    type="text"
                    value={campaignConfig.monthlyEvents?.flashSpecial?.discountText || ''}
                    onChange={e => updateMonthlyEvent('flashSpecial', 'discountText', e.target.value)}
                    placeholder="30% OFF"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-black text-orange-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Código de Cupón Relámpago:</label>
                  <input
                    type="text"
                    value={campaignConfig.monthlyEvents?.flashSpecial?.couponCode || ''}
                    onChange={e => updateMonthlyEvent('flashSpecial', 'couponCode', e.target.value.toUpperCase())}
                    placeholder="FLASHFINDE30"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-mono font-bold text-orange-700 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1 text-xs">Beneficio / Texto de Liquidación:</label>
                <input
                  type="text"
                  value={campaignConfig.monthlyEvents?.flashSpecial?.benefitText || ''}
                  onChange={e => updateMonthlyEvent('flashSpecial', 'benefitText', e.target.value)}
                  placeholder="Promociones Relámpago + Liquidación de Taller + Envío Express"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={campaignConfig.monthlyEvents?.flashSpecial?.startDate || ''}
                    onChange={e => updateMonthlyEvent('flashSpecial', 'startDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1 text-xs">Fecha de Fin:</label>
                  <input
                    type="date"
                    value={campaignConfig.monthlyEvents?.flashSpecial?.endDate || ''}
                    onChange={e => updateMonthlyEvent('flashSpecial', 'endDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                  />
                </div>
              </div>

              {(() => {
                const { isUpcoming, days } = calcUpcomingDays(campaignConfig.monthlyEvents?.flashSpecial?.startDate);
                if (!isUpcoming) return null;
                return (
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-300 text-orange-900 text-xs font-bold flex items-center gap-2">
                    <span className="text-sm">⏳</span>
                    <span>PRÓXIMAMENTE (Faltan {days} {days === 1 ? 'día' : 'días'} para su inicio oficial)</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 5: CARÁTULA DE NOVEDADES & FOTOS */}
      {activeBannerTab === 'showcase' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-[#1F2421] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#D4A359]" />
                <span>Carátula de Novedades de Vitrina &amp; Galería de Fotos</span>
              </h4>
              <p className="text-gray-500 text-[11.5px] max-w-3xl leading-relaxed">
                Edita las 5 fotografías principales, títulos, lemas y etiquetas que rotan automáticamente en la carátula de novedades de la tienda.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200 shrink-0 self-start sm:self-auto">
              5 Diapositivas Activas
            </span>
          </div>

          {/* Lista de las 5 Diapositivas */}
          <div className="space-y-5">
            {((campaignConfig.monthlyEvents?.showcaseSlides || campaignConfig.showcaseSlides) || DEFAULT_SEASONAL_SLIDES).map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-gray-200 hover:border-gray-300 transition-all space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#17251E] text-white flex items-center justify-center font-black text-xs">
                      {idx + 1}
                    </span>
                    <h5 className="font-heading font-black text-xs text-stone-900 uppercase tracking-wider">
                      Diapositiva {idx + 1}: {slide.title || 'Sin título'}
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                    {slide.categoryTag || 'Colección'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Foto con Preview y Controles de Subida */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-gray-300 bg-white aspect-video shadow-xs group flex items-center justify-center">
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3 text-gray-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                          <span className="text-[10px]">Sin imagen asignada</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-3 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingSlideIdx === idx ? 'Subiendo...' : 'Subir foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleSlideImageUpload(idx, e.target.files?.[0])}
                          disabled={uploadingSlideIdx === idx}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={slide.image || ''}
                        onChange={e => updateShowcaseSlide(idx, 'image', e.target.value)}
                        placeholder="/uploads/foto.jpg"
                        className="flex-1 px-2.5 py-1.5 rounded-xl border border-gray-300 text-[11px] font-mono bg-white"
                      />
                    </div>

                    {/* Miniaturas Rápidas Sugeridas */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[9.5px] font-bold text-gray-500 uppercase tracking-wider block">
                        Fotos sugeridas para esta diapositiva:
                      </span>
                      <div className="grid grid-cols-4 gap-1">
                        {SUGGESTED_BANNER_IMAGES.slice(0, 4).map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => updateShowcaseSlide(idx, 'image', sug.url)}
                            className={`rounded-lg overflow-hidden border aspect-video cursor-pointer transition-all ${
                              slide.image === sug.url ? 'border-amber-500 ring-2 ring-amber-400' : 'border-gray-200 opacity-70 hover:opacity-100'
                            }`}
                            title={sug.label}
                          >
                            <img src={sug.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Campos de Texto de la Diapositiva */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-xs">Título de la Colección:</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={e => updateShowcaseSlide(idx, 'title', e.target.value)}
                          placeholder="Colección Hogar y Estilo"
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-xs">Insignia / Badge:</label>
                        <input
                          type="text"
                          value={slide.badge || ''}
                          onChange={e => updateShowcaseSlide(idx, 'badge', e.target.value)}
                          placeholder="Novedad de Temporada"
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1 text-xs">Descripción / Productos que incluye:</label>
                      <textarea
                        rows={2}
                        value={slide.description || ''}
                        onChange={e => updateShowcaseSlide(idx, 'description', e.target.value)}
                        placeholder="Lámpara moderna T38 · Maceta espiral T6 · Colgador Bienvenidos L14"
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-xs">Etiqueta de Categoría (Tag):</label>
                        <input
                          type="text"
                          value={slide.categoryTag || ''}
                          onChange={e => updateShowcaseSlide(idx, 'categoryTag', e.target.value)}
                          placeholder="Hogar & Estilo"
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-xs">ID de Área / Mundo:</label>
                        <select
                          value={slide.worldId || 'hogar'}
                          onChange={e => updateShowcaseSlide(idx, 'worldId', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs bg-white font-medium"
                        >
                          <option value="hogar">Hogar &amp; Espacios</option>
                          <option value="negocios">Negocios &amp; Marcas</option>
                          <option value="eventos">Eventos Especiales</option>
                          <option value="paquetes-servicios">Paquetes &amp; Servicios</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmación y Desglose de Cambios */}
      <AdminConfirmSaveModal
        isOpen={showConfirmModal}
        title={confirmModalConfig.title}
        subtitle={confirmModalConfig.subtitle}
        badge={confirmModalConfig.badge}
        confirmText={confirmModalConfig.confirmText}
        changes={confirmModalConfig.changes}
        onConfirm={() => {
          if (confirmModalConfig.action) confirmModalConfig.action();
          setShowConfirmModal(false);
        }}
        onCancel={() => setShowConfirmModal(false)}
        isSaving={saving}
      />

    </div>
  );
}
