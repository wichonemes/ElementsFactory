import React, { useState, useMemo, useEffect } from 'react';
import {
  Gift, Home, Briefcase, CalendarHeart, Sparkles, Percent,
  CheckCircle2, ArrowRight, ShoppingBag, Calculator, MessageCircle,
  Layers, Package, Flame, Clock, Star, ShieldCheck, Plus,
  ChevronDown, ChevronUp, Check, Award, Crown,
  QrCode, Store, Building2, TrendingUp, BarChart2, Zap,
  CheckCheck, Coffee, Scissors, Smartphone, BadgePercent, Tag
} from 'lucide-react';
import PatchBarShowcase from './PatchBarShowcase';
import SeasonalAtmosphere from './SeasonalAtmosphere';
import MonthlyEventBanner from './MonthlyEventBanner';
import { formatServiceDate } from '../utils/serviceStatus';

/**
 * Generador de las 3 opciones de nivel para cada paquete de taller:
 * - Nivel Esencial (Económico / Inicio)
 * - Nivel Artesano Pro (Balanceado / Recomendado / Más Vendido)
 * - Nivel Edición Maestra (Completo / VIP / Acabados de Lujo)
 */
export const getBundleTiers = (promo) => {
  if (!promo) return [];
  const basePrice = Number(promo.price) || 500;
  const baseRegular = Number(promo.regularPrice) || Math.round(basePrice * 1.25);
  const code = promo.code || '';

  if (code === 'PROMO-HOG-1') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Inicio & Práctico',
        tag: 'Básico Accesible',
        icon: '🥉',
        price: 320,
        regularPrice: 395,
        savings: 75,
        discountPercent: 19,
        summary: 'Lo indispensable para organizar llaves y monedas en la entrada con calidez.',
        includedItems: [
          '1 Colgador de llaves Bienvenidos en madera natural tratada (20 x 8 cm)',
          '1 Llavero familiar Polaroid con foto grabada a láser y borla'
        ],
        extraBenefits: [
          'Madera natural de pino sellada',
          'Listo para colocar en pared',
          'Grabado láser de alta resolución'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Recomendado de Taller',
        icon: '🥈',
        isPopular: true,
        price: 449,
        regularPrice: 548,
        savings: 99,
        discountPercent: 18,
        summary: 'El kit coordinado completo para recibidor más solicitado por nuestros clientes.',
        includedItems: [
          '1 Colgador de llaves Bienvenidos en madera natural (25 x 10 cm)',
          '1 Bandeja vaciabolsillos curva ergonómica (18 x 12 cm)',
          '2 Llaveros familiares Polaroid con foto grabada a láser y borla de gamuza'
        ],
        extraBenefits: [
          'Acabado en laca poliuretano satinada',
          'Colores y tipografía a elegir',
          'Empaque protegido listo para regalo'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Acabados de Lujo',
        tag: 'Kit VIP de Colección',
        icon: '🥇',
        price: 620,
        regularPrice: 775,
        savings: 155,
        discountPercent: 20,
        summary: 'Máxima capacidad, madera noble de nogal y detalles personalizados para toda la familia.',
        includedItems: [
          '1 Colgador de llaves Bienvenidos XL en madera de nogal con 5 ganchos metálicos (35 x 12 cm)',
          '1 Bandeja vaciabolsillos curva con inserto en piel vegetal grabada',
          '4 Llaveros familiares Polaroid personalizados con fotos distintas y herrajes premium',
          'Kit de instalación oculta con taquetes y nivelador de burbuja'
        ],
        extraBenefits: [
          'Madera noble de nogal con veta destacada',
          'Personalización de apellido familiar en relieve',
          'Garantía extendida de taller'
        ]
      }
    ];
  }

  if (code === 'PROMO-HOG-2') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Home Office Básico',
        tag: 'Básico Funcional',
        icon: '🥉',
        price: 370,
        regularPrice: 460,
        savings: 90,
        discountPercent: 20,
        summary: 'Equipamiento básico para tener limpio y despejado el escritorio.',
        includedItems: [
          '1 Soporte gamer vertical para audífonos de diadema',
          '1 Soporte vertical para celular con ranura para cable de carga rápida'
        ],
        extraBenefits: [
          'Impresión 3D de alta densidad',
          'Diseño ergonómico compacto',
          'Color a elegir'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Recomendado Pro',
        icon: '🥈',
        isPopular: true,
        price: 520,
        regularPrice: 647,
        savings: 127,
        discountPercent: 20,
        summary: 'Estación completa de trabajo y videojuegos con organizador multifunción.',
        includedItems: [
          '1 Soporte gamer dual para audífonos de diadema y mando de videojuegos',
          '1 Organizador modular de accesorios y memorias USB',
          '1 Portalápices geométrico facetado de alta estabilidad',
          '1 Soporte vertical para celular con ranura para cable de carga'
        ],
        extraBenefits: [
          'Bases con pads antideslizantes',
          'Filamento mate anti-huellas',
          'Gestión integrada de cables'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Setup Gamer VIP',
        tag: 'Máximo Rendimiento',
        icon: '🥇',
        price: 720,
        regularPrice: 910,
        savings: 190,
        discountPercent: 21,
        summary: 'El setup definitivo con acabados grafito texturizado, soporte para tablet y accesorios dobles.',
        includedItems: [
          '1 Soporte gamer dual premium en acabado grafito/bronce con doble brazo reforzado',
          '1 Organizador modular XL con bahías para cables magnéticos y tarjetas SD',
          '1 Portalápices geométrico facetado + 1 Maceta geométrica para suculenta a juego',
          '1 Soporte articulado multi-ángulo para tablet o iPad',
          '1 Placa conmemorativa con tu Gamertag / Nombre grabada al láser'
        ],
        extraBenefits: [
          'Acabados de filamento con fibra texturizada',
          'Grip de silicón en puntos de apoyo',
          'Personalización total de Gamertag'
        ]
      }
    ];
  }

  if (code === 'PROMO-HOG-3') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Kit Paseo Básico',
        tag: 'Básico Diario',
        icon: '🥉',
        price: 219,
        regularPrice: 275,
        savings: 56,
        discountPercent: 20,
        summary: 'Identificación segura para tu consentido y recuerdo imantado para casa.',
        includedItems: [
          '1 Chapita de identificación ligera con nombre al frente y teléfono grabado al reverso',
          '1 Fotoimán de madera natural con grabado láser de su retrato'
        ],
        extraBenefits: [
          'Placa ultraligera que no pesa al cuello',
          'Grabado indeleble que no se borra',
          'Argolla de acero reforzada'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Favorito de Mascotas',
        icon: '🥈',
        isPopular: true,
        price: 299,
        regularPrice: 366,
        savings: 67,
        discountPercent: 18,
        summary: 'El kit consentido con portabolsas para paseo, chapita y marco con relieve.',
        includedItems: [
          '1 Chapita de identificación ligera con silueta y datos grabados',
          '1 Portabolsas sanitario cilíndrico con mosquetón para correa de paseo',
          '1 Marco imantado 3D para foto en refrigerador (6 x 6 cm)',
          '1 Fotoimán de madera con grabado láser'
        ],
        extraBenefits: [
          'Portabolsas con rosca antiderrames',
          'Colores vivos combinables con la correa',
          'Material impermeable apto para intemperie'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Colección VIP Peluda',
        tag: 'Kit Consentido Total',
        icon: '🥇',
        price: 420,
        regularPrice: 530,
        savings: 110,
        discountPercent: 21,
        summary: 'Edición de lujo con doble chapita de repuesto, gancho de pared para su correa y portabolsas cargado.',
        includedItems: [
          '2 Chapitas de identificación (1 en relieve 3D bicapa + 1 en madera grabada de repuesto)',
          '1 Portabolsas sanitario cilíndrico + 2 rollos de bolsas biodegradables de regalo',
          '2 Marcos imantados 3D personalizados con foto de tu peludo',
          '1 Gancho de pared personalizado con silueta de patita o huesito para colgar su correa'
        ],
        extraBenefits: [
          'Gancho para pared con nombre de tu mascota',
          'Empaque con dedicatoria personalizada',
          'Resistencia total a tirones'
        ]
      }
    ];
  }

  if (code === 'PROMO-BIZ-1') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Para 6 Mesas',
        tag: 'Básico Restaurante',
        icon: '🥉',
        price: 1350,
        regularPrice: 1690,
        savings: 340,
        discountPercent: 20,
        summary: 'Ideal para cafeterías pequeñas, food trucks y bistrós que arrancan.',
        includedItems: [
          '6 Números de mesa 3D con base rectangular biselada (del 01 al 06)',
          '2 Servilleteros de mesa modernos con diseño calado',
          '1 Soporte de mostrador con placa grabada para código QR (menú digital o cobro)'
        ],
        extraBenefits: [
          'Diseño lavable y resistente a manchas',
          'Colores a tono con la paleta de tu local',
          'Estabilidad anti-caídas'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Recomendado Comercial',
        icon: '🥈',
        isPopular: true,
        price: 1890,
        regularPrice: 2364,
        savings: 474,
        discountPercent: 20,
        summary: 'El pack más completo para restaurantes y bares medianos con 10 mesas y doble QR.',
        includedItems: [
          '10 Números de mesa 3D con base rectangular biselada (del 01 al 10)',
          '4 Servilleteros de mesa modernos con diseño calado de alta capacidad',
          '2 Soportes de mostrador con placa grabada para código QR (menú y propinas)'
        ],
        extraBenefits: [
          'Tipografía en relieve de alta visibilidad',
          'Grabado de logotipo en soportes QR',
          'Entrega con archivo digital de QR respaldado'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Para 15 Mesas + Barra VIP',
        tag: 'Pack Restaurante Integral',
        icon: '🥇',
        price: 2590,
        regularPrice: 3280,
        savings: 690,
        discountPercent: 21,
        summary: 'Capacidad para 15 mesas, letrero de barra, servilleteros ampliados y QR de acrílico doble vista.',
        includedItems: [
          '15 Números de mesa 3D con base biselada y logotipo de tu restaurante grabado (01 al 15)',
          '6 Servilleteros de mesa modernos de alta capacidad con ranura para salero/azúcar',
          '3 Soportes QR de mostrador en acrílico cristal y base de madera noble',
          '1 Letrero de barra personalizado "Bienvenidos / Horarios & Menú Digital" (20 x 15 cm)'
        ],
        extraBenefits: [
          'Logotipo calado en cada servilletero',
          'Bases con peso extra para terrazas con viento',
          'Reposición de piezas individuales con descuento'
        ]
      }
    ];
  }

  if (code === 'PROMO-BIZ-2') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Mostrador Ágil',
        tag: 'Básico Digital',
        icon: '🥉',
        price: 560,
        regularPrice: 700,
        savings: 140,
        discountPercent: 20,
        summary: 'Moderniza tu cobro y redes con chip NFC y soporte QR sin complicaciones.',
        includedItems: [
          '1 Soporte piramidal de contacto inteligente con chip NFC programado',
          '1 Soporte QR de acrílico y madera para mostrador de caja',
          '2 Posavasos de madera natural de haya grabados al láser con tu logo'
        ],
        extraBenefits: [
          'NFC preprogramado listo para usar',
          'Madera de haya natural curada',
          'Compatible con iPhone y Android'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Identidad Completa',
        icon: '🥈',
        isPopular: true,
        price: 780,
        regularPrice: 932,
        savings: 152,
        discountPercent: 16,
        summary: 'El paquete de mostrador preferido para boutiques, consultorios y agencias.',
        includedItems: [
          '1 Soporte piramidal de contacto inteligente con chip NFC programado',
          '1 Soporte QR de acrílico y madera para mostrador de caja',
          '6 Posavasos de madera natural de haya grabados al láser con tu logo',
          '2 Tazas de cerámica brillante con logotipo empresarial full color'
        ],
        extraBenefits: [
          'Tazas de cerámica sublimadas calidad AA+',
          'Posavasos con barniz hidrófugo',
          'NFC reescribible si cambias de enlace'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Corporativo VIP',
        tag: 'Kit Ejecutivo Doble',
        icon: '🥇',
        price: 1090,
        regularPrice: 1390,
        savings: 300,
        discountPercent: 22,
        summary: 'Doble estación NFC para caja y recepción, 12 posavasos y vajilla ejecutiva completa.',
        includedItems: [
          '2 Soportes piramidales con chip NFC (1 para mostrador de cobro + 1 para recepción/redes)',
          '2 Soportes QR premium en acrílico cristal y madera con doble placa intercambiable',
          '12 Posavasos de madera de haya con grabado láser de alta definición + Base organizadora',
          '4 Tazas ejecutivas de cerámica con logotipo empresarial a todo color'
        ],
        extraBenefits: [
          'Base organizadora de madera para posavasos incluida',
          'Programación de chips NFC con enlaces dinámicos',
          'Acabado en caja rígida de presentación'
        ]
      }
    ];
  }

  if (code === 'PROMO-BIZ-3') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Inicio Boutique',
        tag: 'Básico Local',
        icon: '🥉',
        price: 640,
        regularPrice: 790,
        savings: 150,
        discountPercent: 19,
        summary: 'Lo necesario para recibir a tus clientes y regalar un detalle con tu marca.',
        includedItems: [
          '1 Tótem QR para citas, catálogo o perfil de Instagram',
          '1 Bandeja organizadora para peines, tijeras o tarjetas de presentación',
          '12 Llaveros promocionales de madera con grabado láser de tu marca'
        ],
        extraBenefits: [
          'Madera natural con acabado cera protectora',
          'Grabado de logotipo nítido',
          'Argollas metálicas reforzadas'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Recomendado Comercial',
        icon: '🥈',
        isPopular: true,
        price: 890,
        regularPrice: 1098,
        savings: 208,
        discountPercent: 19,
        summary: 'El pack más elegido por barberías, estéticas y tiendas boutique para fidelizar clientes.',
        includedItems: [
          '1 Tótem QR para citas, catálogo o perfil de Instagram',
          '1 Bandeja organizadora para peines, tijeras, tarjetas o accesorios',
          '25 Llaveros promocionales de madera con grabado láser de tu marca'
        ],
        extraBenefits: [
          'Bandeja con divisiones a la medida',
          'Llaveros listos en bolsita individual',
          'Tótem con base estable antideslizante'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Fidelización VIP',
        tag: 'Boutique Pro 50 Pzas',
        icon: '🥇',
        price: 1250,
        regularPrice: 1590,
        savings: 340,
        discountPercent: 21,
        summary: 'Doble tótem de mostrador, doble bandeja organizadora y 50 llaveros para tus mejores clientes.',
        includedItems: [
          '2 Tótems QR (1 para citas/Instagram + 1 para cobro con transferencia/tarjeta)',
          '2 Bandejas organizadoras de mostrador con acabado mate hidrorrepelente',
          '50 Llaveros promocionales de madera con grabado láser en ambas caras (logo + redes/teléfono)',
          '1 Placa de mostrador con horarios y redes en relieve 3D'
        ],
        extraBenefits: [
          'Grabado a doble cara en los 50 llaveros sin costo extra',
          'Placa de pared u mostrador con logotipo 3D',
          'Empaque institucional'
        ]
      }
    ];
  }

  if (code === 'PROMO-EV-1') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Nupcial Íntimo',
        tag: 'Básico Bodas',
        icon: '🥉',
        price: 1790,
        regularPrice: 2240,
        savings: 450,
        discountPercent: 20,
        summary: 'Para bodas civiles o celebraciones íntimas con los detalles más emotivos.',
        includedItems: [
          'Set Suite Nupcial (2 ganchos de madera grabados con nombres + 1 alhajero de madera grabado + 2 termos grabados)',
          'Letrero de bienvenida en arco de madera natural para caballete (50 x 70 cm) con nombres y fecha'
        ],
        extraBenefits: [
          'Madera natural lijada a mano',
          'Tipografía caligráfica personalizada',
          'Listo para sesión fotográfica matutina'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'El Favorito de Novios',
        icon: '🥈',
        isPopular: true,
        price: 2490,
        regularPrice: 3020,
        savings: 530,
        discountPercent: 18,
        summary: 'El paquete nupcial insignia con Suite Nupcial, Recepción de Ceremonia y Mesa Presidencial.',
        includedItems: [
          'Set Suite Nupcial (2 ganchos grabados, 1 alhajero con interior de terciopelo, 1 cosmetiquera nupcial, 2 termos con vinil)',
          'Set Bienvenida Ceremonia (Letrero caballete 60x80 cm, 25 conos armados para pétalos, canastilla, letreros para sillas novios, QR de fotos)',
          'Centro Presidencial 3D sobre madera de nogal con nombres y fecha + 2 Portavasos de madera grabados para mesa de novios'
        ],
        extraBenefits: [
          'Coordinación exacta de paleta de colores del evento',
          'Acabado en madera curada y barnizada',
          'Conos armados listos para rellenar'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Boda Magna VIP',
        tag: 'Experiencia Total Todo Incluido',
        icon: '🥇',
        price: 3490,
        regularPrice: 4350,
        savings: 860,
        discountPercent: 20,
        summary: 'La suite nupcial más completa con 50 conos, recuerdos de padrinos y centro 3D con luz LED.',
        includedItems: [
          'Set Suite Nupcial VIP (Ganchos, alhajero con terciopelo, 2 cosmetiqueras, batas bordadas y termos térmicos de acero)',
          'Set Bienvenida Ceremonia XL (Letrero 60x90 cm, 50 conos armados para pétalos, 2 canastillas, 4 letreros de sillas y tótem QR)',
          'Centro Presidencial 3D en madera noble con relieve bicapa e iluminación LED cálida integrada + 4 portavasos',
          '20 Recuerdos de madera botánicos grabados con nombres para padrinos y cortejo'
        ],
        extraBenefits: [
          'Iluminación LED autónoma con pilas ocultas',
          '20 recuerdos exclusivos para familiares clave',
          'Asesoría de diseño previa con muestras'
        ]
      }
    ];
  }

  if (code === 'PROMO-EV-2') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: '30 Invitados (2 Horas)',
        tag: 'Fiesta Íntima',
        icon: '🥉',
        price: 5490,
        regularPrice: 6600,
        savings: 1110,
        discountPercent: 17,
        summary: 'Estación de Patch Bar en vivo durante 2 horas con 30 prendas y 30 kits anticruda.',
        includedItems: [
          'Servicio Patch Bar en Vivo durante 2 horas continuas con prensa térmica profesional y operador',
          '30 Prendas a elegir (Gorras trucker transpirables o Tote bags de manta 100% algodón)',
          'Muestrarios con más de 30 diseños de parches bordados con aplicación ilimitada al momento',
          '30 Morralitos Kit Anticruda en manta serigrafiados + 30 llaveros de madera grabados'
        ],
        extraBenefits: [
          'Montaje de stand de madera artesanal',
          'Operador calificado durante todo el servicio',
          'Tiempo de planchado de solo 45s por pieza'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'Combo Fiesta Favorito',
        icon: '🥈',
        isPopular: true,
        price: 7490,
        regularPrice: 8600,
        savings: 1110,
        discountPercent: 13,
        summary: 'El combo fiesta más cotizado para bodas y graduaciones: 3 horas, 50 prendas y 50 kits anticruda.',
        includedItems: [
          'Servicio Patch Bar en Vivo durante 3 horas con stand de madera y prensa térmica industrial',
          '50 Prendas a elegir (Gorras trucker o Tote bags de manta 100% algodón)',
          'Muestrarios de parches y stickers temáticos exclusivos con planchado ilimitado en vivo',
          '50 Morralitos Kit Anticruda en manta serigrafiados con frases de fiesta + 50 llaveros de madera grabados'
        ],
        extraBenefits: [
          'Charolas de exhibición de madera artesanal',
          'Variedad de parches divertidos, florales y coquetos',
          'Entrega inmediata en mano a cada invitado'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Fiesta Magna (80 Invitados)',
        tag: 'Máxima Experiencia VIP',
        icon: '🥇',
        price: 9990,
        regularPrice: 12400,
        savings: 2410,
        discountPercent: 19,
        summary: 'Doble prensa térmica, 4 horas continuas, 80 prendas con parche conmemorativo exclusivo del evento.',
        includedItems: [
          'Servicio Patch Bar en Vivo durante 4 horas continuas con 2 prensas térmicas y 2 operadores',
          '80 Prendas a elegir (Gorras trucker, Tote bags y Bucket hats de algodón)',
          '1 Parche conmemorativo exclusivo bordado con el monograma o logotipo del evento para todos los invitados',
          '80 Morralitos Kit Anticruda serigrafiados + 80 llaveros de madera grabados con dedicatoria',
          'Bolsa kraft individual de cortesía para cada invitado'
        ],
        extraBenefits: [
          '2 Operadores para evitar filas y agilizar la fiesta',
          'Diseño de parche bordado exclusivo sin costo de matriz',
          'Bolsa kraft individual para llevar a casa'
        ]
      }
    ];
  }

  if (code === 'PROMO-EV-3') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Para 20 Invitados',
        tag: 'Básico XV / Graduación',
        icon: '🥉',
        price: 1250,
        regularPrice: 1580,
        savings: 330,
        discountPercent: 21,
        summary: 'Letrero de bienvenida compacto y 20 llaveros botánicos personalizados para familia cercana.',
        includedItems: [
          '1 Letrero de bienvenida silueta arco para caballete (40 x 60 cm) con nombre y fecha',
          '20 Llaveros en relieve 3D botánico personalizados con nombre individual de cada invitado',
          '1 Tótem QR para compartir enlace de fotos del evento'
        ],
        extraBenefits: [
          'Llaveros con nombres personalizados sin costo adicional',
          'Madera ligera y resistente',
          'Colores temáticos a tono con el vestido/fiesta'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Vendido',
        tag: 'El Set Más Pedido',
        icon: '🥈',
        isPopular: true,
        price: 1750,
        regularPrice: 2163,
        savings: 413,
        discountPercent: 19,
        summary: 'El balance ideal para la recepción de tus XV años o graduación con 35 llaveros y letrero de arco.',
        includedItems: [
          '1 Letrero de bienvenida silueta arco para caballete (50 x 70 cm)',
          '35 Llaveros en relieve 3D botánico personalizados con nombre individual',
          '1 Tótem QR para compartir álbum de Google Fotos o Instagram'
        ],
        extraBenefits: [
          'Letrero con base de ranura para caballete o mesa',
          'Argollas metálicas de alta resistencia',
          'Empaque clasificado en orden alfabético'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Gala VIP (55 Invitados)',
        tag: 'Set de Gran Celebración',
        icon: '🥇',
        price: 2450,
        regularPrice: 3080,
        savings: 630,
        discountPercent: 20,
        summary: 'Letrero XL de 60x85 cm, 55 llaveros empacados individualmente, doble QR y cuadro de firmas.',
        includedItems: [
          '1 Letrero de bienvenida silueta arco XL para caballete (60 x 85 cm) con soporte reforzado',
          '55 Llaveros en relieve 3D botánicos personalizados con nombre individual y bolsita de organza',
          '2 Tótems QR (1 para álbum colaborativo de fotos + 1 para playlist o dedicatorias)',
          '1 Cuadro conmemorativo de firmas en madera grabada con base de exhibición'
        ],
        extraBenefits: [
          'Cuadro de firmas listo para colgar de recuerdo en recámara',
          'Bolsita de organza individual en cada llavero',
          'Acabado en laca satinada anti-manchas'
        ]
      }
    ];
  }

  if (code === 'EV-PATCHBAR') {
    return [
      {
        id: 'esencial',
        name: 'Nivel Esencial',
        badge: 'Hasta 50 Personas',
        tag: 'Estación Compacta',
        icon: '🥉',
        price: 4800,
        regularPrice: 5900,
        savings: 1100,
        discountPercent: 19,
        summary: 'Estación de 2 horas con operador y prensa térmica para reuniones y fiestas de tamaño íntimo.',
        includedItems: [
          '2 Horas de servicio continuo en vivo con operador calificado',
          '1 Prensa térmica industrial de apertura rápida (45 segundos por prenda)',
          'Stand compacto de madera artesanal con charolas de exhibición',
          'Gorras o totes básicas con muestrario clásico de 30+ parches bordados'
        ],
        extraBenefits: [
          'Planchado al instante para los invitados',
          'Ideal para cumpleaños y aniversarios',
          'Montaje y desmontaje incluido'
        ]
      },
      {
        id: 'pro',
        name: 'Nivel Artesano Pro',
        badge: '★ Más Solicitado',
        tag: 'Estación Estándar Bodas',
        icon: '🥈',
        isPopular: true,
        price: 6500,
        regularPrice: 7900,
        savings: 1400,
        discountPercent: 18,
        summary: 'Estación completa de 3 horas para 50 a 100 personas. El servicio estrella para bodas y graduaciones.',
        includedItems: [
          '3 Horas de servicio continuo en vivo con stand completo de taller',
          'Mobiliario rústico de madera, percheros y charolas organizadoras',
          'Prensa térmica industrial de alta presión y operador profesional',
          'Gorras trucker transpirables y Tote bags 100% algodón de alta resistencia',
          'Catálogo de más de 50 diseños de parches bordados, transfers y chenille'
        ],
        extraBenefits: [
          'Diseños florales, divertidos y conmemorativos',
          'Asesoría para los invitados al crear su combinación',
          'Transporte y viáticos en zona conurbada incluidos'
        ]
      },
      {
        id: 'maestra',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Magna Experiencia VIP',
        tag: 'Doble Prensa & Parche Exclusivo',
        icon: '🥇',
        price: 9500,
        regularPrice: 11800,
        savings: 2300,
        discountPercent: 19,
        summary: 'Para 100 a 200+ personas. 4 horas, 2 operadores, 2 prensas simultáneas y parche bordado personalizado con el logo de tu evento.',
        includedItems: [
          '4 Horas de servicio continuo en vivo con 2 prensas térmicas simultáneas y 2 operadores',
          'Stand extendido con doble mostrador de selección para flujo rápido de invitados sin filas',
          '1 Diseño de parche bordado personalizado con el monograma o escudo de la boda/marca',
          'Prendas premium: Gorras trucker, Tote bags gruesas y Bucket hats',
          'Empaque individual de regalo en bolsa kraft con sello para cada invitado'
        ],
        extraBenefits: [
          'Cero filas gracias al flujo doble de planchado',
          'Diseño de parche de recuerdo único que nadie más tendrá',
          'Álbum fotográfico digital de los invitados con sus prendas'
        ]
      }
    ];
  }

  // Generación estándar para cualquier otro combo futuro
  return [
    {
      id: 'esencial',
      name: 'Nivel Esencial',
      badge: 'Inicio & Práctico',
      tag: 'Básico Accesible',
      icon: '🥉',
      price: Math.round(basePrice * 0.72),
      regularPrice: Math.round(baseRegular * 0.72),
      savings: Math.round((baseRegular - basePrice) * 0.72) || 80,
      discountPercent: promo.discountPercent || 15,
      summary: 'Configuración esencial y accesible con las piezas clave para arrancar con excelente costo.',
      includedItems: promo.includedItems?.slice(0, Math.max(1, Math.ceil((promo.includedItems?.length || 2) / 2))) || ['Piezas clave del paquete'],
      extraBenefits: [
        'Fabricación artesanal con materiales de primera calidad',
        'Empaque seguro y garantía de satisfacción'
      ]
    },
    {
      id: 'pro',
      name: 'Nivel Artesano Pro',
      badge: '★ Más Vendido',
      tag: 'Recomendado de Taller',
      icon: '🥈',
      isPopular: true,
      price: basePrice,
      regularPrice: baseRegular,
      savings: promo.savings || Math.round(baseRegular - basePrice),
      discountPercent: promo.discountPercent || 20,
      summary: 'El kit completo coordinado estándar con todas las piezas y el mejor balance de valor.',
      includedItems: promo.includedItems || ['Kit completo de piezas coordinadas'],
      extraBenefits: [
        'Personalización estándar incluida',
        'Acabado en laca protectora',
        'Asesoría directa del artesano'
      ]
    },
    {
      id: 'maestra',
      name: 'Nivel Edición Maestra',
      badge: '⭐ Acabados de Lujo',
      tag: 'Kit Premium VIP',
      icon: '🥇',
      price: Math.round(basePrice * 1.38),
      regularPrice: Math.round(baseRegular * 1.38),
      savings: Math.round((baseRegular - basePrice) * 1.5) || 200,
      discountPercent: (promo.discountPercent || 20) + 2,
      summary: 'Máximo volumen, piezas de repuesto, personalización especial y acabados de lujo.',
      includedItems: [
        ...(promo.includedItems || ['Kit completo']),
        'Piezas ampliadas o de repuesto para mayor durabilidad',
        'Empaque de regalo premium con dedicatoria artesanal'
      ],
      extraBenefits: [
        'Personalización avanzada sin costo extra',
        'Tratamiento hidrófugo y sellado reforzado',
        'Garantía prioritaria de reposición'
      ]
    }
  ];
};

export default function PackagesAndServicesView({
  products = [],
  onSelectProduct,
  onAddToCart,
  onOpenCalculator,
  settings,
  initialAreaFilter = 'all',
  searchQuery = '',
  onClearSearch
}) {
  const [activeAreaFilter, setActiveAreaFilter] = useState(initialAreaFilter || 'all');
  const [packagesSeed, setPackagesSeed] = useState(() => Date.now());

  // Configuración de Campañas & Especial de Temporada
  const [campaignConfig, setCampaignConfig] = useState(() => settings?.campaignsConfig || null);

  useEffect(() => {
    if (settings?.campaignsConfig) {
      setCampaignConfig(settings.campaignsConfig);
    } else {
      fetch('/api/campaigns')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCampaignConfig(data);
        })
        .catch(err => console.error('Error cargando campañas en vista:', err));
    }
  }, [settings?.campaignsConfig]);

  // Control de apertura vertical y nivel seleccionado por cada paquete
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const [selectedTierByPackage, setSelectedTierByPackage] = useState({});
  const [showComparisonByPackage, setShowComparisonByPackage] = useState({});

  useEffect(() => {
    if (initialAreaFilter) {
      setActiveAreaFilter(initialAreaFilter);
      setPackagesSeed(Date.now());
    }
  }, [initialAreaFilter]);

  const whatsappNumber = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');

  const shuffleArray = (arr, seedOffset = 0) => {
    if (!arr || arr.length <= 1) return arr;
    let s = ((packagesSeed + seedOffset) * 9301 + 49297) % 233280;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const res = [...arr];
    let m = res.length, t, i;
    while (m) {
      i = Math.floor(rnd() * m--);
      t = res[m];
      res[m] = res[i];
      res[i] = t;
    }
    return res;
  };

  const filterBySearch = (list) => {
    if (!searchQuery || !searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.shortDescription?.toLowerCase().includes(q) ||
      p.fullDescription?.toLowerCase().includes(q) ||
      (p.categories || []).some(c => c.toLowerCase().includes(q))
    );
  };

  // Separación de paquetes por Área con rotación dinámica al navegar
  const allBundles = useMemo(() => {
    const list = filterBySearch(products.filter(p => p.isBundle));
    return shuffleArray(list, 101);
  }, [products, packagesSeed, searchQuery]);

  const hogarBundles = useMemo(() => {
    const list = filterBySearch(products.filter(p => p.isBundle && p.worlds?.includes('hogar')));
    return shuffleArray(list, 202);
  }, [products, packagesSeed, searchQuery]);

  const negociosBundles = useMemo(() => {
    const list = filterBySearch(products.filter(p => p.isBundle && p.worlds?.includes('negocios') && !p.code?.includes('EV')));
    return shuffleArray(list, 303);
  }, [products, packagesSeed, searchQuery]);

  const eventosBundles = useMemo(() => {
    const list = filterBySearch(products.filter(p => p.isBundle && p.worlds?.includes('eventos')));
    return shuffleArray(list, 404);
  }, [products, packagesSeed, searchQuery]);

  // Temporada Activa de Campaña
  const activeSeason = useMemo(() => {
    if (!campaignConfig) return null;
    const seasons = campaignConfig.seasons || [];
    return seasons.find(s => s.id === campaignConfig.activeSeasonId) || null;
  }, [campaignConfig]);

  // Paquetes destacados de la temporada actual y Paquete Estrella
  const especialBundles = useMemo(() => {
    const suggested = activeSeason?.suggestedBundles || [];
    const starredId = campaignConfig?.highlightedBundleId;
    const matches = allBundles.filter(p =>
      (starredId && (p.id === starredId || p.code === starredId)) ||
      suggested.includes(p.id) ||
      suggested.includes(p.code)
    );
    if (matches.length === 0) return allBundles.slice(0, 3);
    return [...matches].sort((a, b) => {
      const aStarred = (a.id === starredId || a.code === starredId);
      const bStarred = (b.id === starredId || b.code === starredId);
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      return 0;
    });
  }, [allBundles, activeSeason, campaignConfig]);

  // Producto de servicio Patch Bar
  const patchBarProduct = useMemo(() => products.find(p => p.code === 'EV-PATCHBAR'), [products]);

  // Evento Comercial del Mes Activo (Temu / ML / AliExpress)
  const activeMonthlyEvent = useMemo(() => {
    const major = campaignConfig?.monthlyEvents?.majorEvent;
    const mid = campaignConfig?.monthlyEvents?.midMonthEvent;
    if (major && major.active !== false) return { ...major, eventType: 'major' };
    if (mid && mid.active !== false) return { ...mid, eventType: 'mid' };
    return null;
  }, [campaignConfig?.monthlyEvents]);

  const eventDiscountPct = useMemo(() => {
    if (!activeMonthlyEvent?.discountText) return 0;
    const match = activeMonthlyEvent.discountText.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  }, [activeMonthlyEvent]);

  const handleWhatsAppQuote = (promo, tier = null) => {
    const chosenTier = tier || (selectedTierByPackage[promo.id] ? getBundleTiers(promo).find(t => t.id === selectedTierByPackage[promo.id]) : null);
    const basePrice = chosenTier ? chosenTier.price : promo.price;
    const savings = chosenTier ? chosenTier.savings : (promo.savings || 100);
    const tierName = chosenTier ? chosenTier.name : 'Paquete Estándar';
    const items = chosenTier ? chosenTier.includedItems : promo.includedItems;

    const hasCoupon = Boolean(activeMonthlyEvent && eventDiscountPct > 0);
    const discountedPrice = hasCoupon ? Math.round(basePrice * (1 - eventDiscountPct / 100)) : basePrice;

    let msg = `*COTIZACIÓN DE PAQUETE PROMOCIONAL — ARTESANO DIGITAL*\n`;
    msg += `==================================================\n`;
    msg += `Hola Artesano Digital, me interesa contratar el siguiente paquete:\n\n`;
    msg += `• *[${promo.code}] ${promo.name}*\n`;
    msg += `• Configuración elegida: *${tierName}*\n`;
    msg += `• Inversión regular del paquete: *$${basePrice} MXN* (Ahorro regular de $${savings} MXN)\n`;

    if (hasCoupon) {
      msg += `• 🎁 *Cupón de Evento:* [${activeMonthlyEvent.couponCode}] (${activeMonthlyEvent.discountText || `${eventDiscountPct}% OFF`})\n`;
      msg += `• 🔥 *Precio Especial con Cupón:* *$${discountedPrice} MXN* (Ahorro extra de $${basePrice - discountedPrice} MXN)\n`;
    }

    if (items && items.length > 0) {
      msg += `• Piezas y detalles incluidos:\n  - ${items.join('\n  - ')}\n`;
    }
    if (settings?.serviceStatus?.isPaused) {
      const resumeStr = formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso';
      msg += `\n⏸️ *Nota:* Taller reanuda servicio el ${resumeStr}.\n`;
    }
    msg += `\n_¿Tienen disponibilidad de taller para producción y tiempos de entrega?_`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  /**
   * Renderiza una tarjeta de paquete en formato HORIZONTAL con despliegue VERTICAL:
   * 1. Fila horizontal apaisada (foto a la izquierda, detalles y botón "Abrir y Ver 3 Opciones" a la derecha).
   * 2. Al hacer clic en "Abrir", se despliega verticalmente el panel con las 3 opciones (Nivel Esencial, Artesano Pro, Edición Maestra).
   * 3. Al hacer clic en uno de los 3 paquetes, aparece la tarjeta completa del producto con su descripción y todo lo que incluye.
   */
  /**
   * Paletas de color distintivas por módulo / área de catálogo:
   * - Hogar: Verde Esmeralda / Taller (#2D4F3E, emerald)
   * - Negocios: Ámbar Cálido / Dorado Comercial (#8F6517, #B47820, amber)
   * - Eventos: Rosa Festejo / Bugambilia / Rubí (#D82B6E, #C23363, rose)
   * - Especial: Dorado Corona de Temporada (#D4A359, amber-400 ring)
   */
  const getModuleTheme = (promo, explicitArea) => {
    const isStarred = Boolean(
      campaignConfig?.highlightedBundleId && (
        promo.id === campaignConfig.highlightedBundleId ||
        promo.code === campaignConfig.highlightedBundleId
      )
    );

    if (isStarred) {
      return {
        area: 'especial',
        label: 'Especial del Mes',
        icon: '👑',
        cardBorder: 'border-amber-400 ring-2 ring-amber-400/50 shadow-md',
        cardHover: 'hover:border-amber-500 hover:shadow-amber-400/20 hover:shadow-xl',
        bgBadge: 'bg-amber-100 text-amber-950 border-amber-300',
        priceColor: 'text-[#1F2421]',
        savingsPill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        bulletDot: 'text-amber-500',
        btnPrimary: 'bg-[#D4A359] hover:bg-[#c28e38] text-[#17251E]',
        btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300',
        accentRing: 'ring-amber-400/40'
      };
    }

    const area = explicitArea || (
      promo.worlds?.includes('negocios') && !promo.code?.includes('EV') ? 'negocios' :
      promo.worlds?.includes('eventos') || promo.code?.includes('EV') || promo.code?.includes('PATCH') ? 'eventos' :
      'hogar'
    );

    if (area === 'negocios') {
      return {
        area: 'negocios',
        label: 'Empresarial & Negocios',
        icon: '💼',
        cardBorder: 'border-amber-200 hover:border-amber-400',
        cardHover: 'hover:border-amber-400 hover:shadow-amber-900/10 hover:shadow-lg',
        bgBadge: 'bg-amber-50 text-amber-900 border-amber-200',
        priceColor: 'text-amber-950',
        savingsPill: 'bg-amber-100 text-amber-900 border-amber-300',
        bulletDot: 'text-amber-600',
        btnPrimary: 'bg-[#B47820] hover:bg-[#925F14] text-white',
        btnSecondary: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200',
        accentRing: 'ring-amber-400/40'
      };
    }

    if (area === 'eventos') {
      return {
        area: 'eventos',
        label: 'Eventos & Fiestas',
        icon: '🎉',
        cardBorder: 'border-rose-200 hover:border-rose-400',
        cardHover: 'hover:border-rose-400 hover:shadow-rose-900/10 hover:shadow-lg',
        bgBadge: 'bg-rose-50 text-rose-800 border-rose-200',
        priceColor: 'text-rose-950',
        savingsPill: 'bg-rose-100 text-rose-900 border-rose-300',
        bulletDot: 'text-rose-600',
        btnPrimary: 'bg-[#C23363] hover:bg-[#A3234E] text-white',
        btnSecondary: 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200',
        accentRing: 'ring-rose-400/40'
      };
    }

    // Default 'hogar'
    return {
      area: 'hogar',
      label: 'Hogar & Espacios',
      icon: '🏡',
      cardBorder: 'border-emerald-200 hover:border-emerald-400',
      cardHover: 'hover:border-emerald-400 hover:shadow-emerald-900/10 hover:shadow-lg',
      bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      priceColor: 'text-[#2D4F3E]',
      savingsPill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      bulletDot: 'text-emerald-600',
      btnPrimary: 'bg-[#2D4F3E] hover:bg-[#20392C] text-white',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-[#2D4F3E] border-emerald-200',
      accentRing: 'ring-emerald-400/40'
    };
  };

  /**
   * Tarjetas cuadradas, compactas ("más lite") y altamente cliclables
   * inspiradas en el gestor de paquetes de catálogo del panel de control.
   */
  const renderBundleCard = (promo, explicitArea = null) => {
    const tiers = getBundleTiers(promo);
    const isExpanded = expandedPackageId === promo.id;
    const activeTierId = selectedTierByPackage[promo.id] || tiers[1]?.id || tiers[0]?.id || 'pro';
    const activeTier = tiers.find(t => t.id === activeTierId) || tiers[1] || tiers[0];
    const isStarred = Boolean(
      campaignConfig?.highlightedBundleId && (
        promo.id === campaignConfig.highlightedBundleId ||
        promo.code === campaignConfig.highlightedBundleId
      )
    );
    const theme = getModuleTheme(promo, explicitArea);

    const savings = promo.savings || (promo.regularPrice ? promo.regularPrice - promo.price : 100);
    const regularPrice = promo.regularPrice || Math.round(promo.price * 1.25);
    const discountPercent = promo.discountPercent || Math.round((savings / regularPrice) * 100);

    // Cálculos de beneficio de Evento Comercial del Mes (Temu / ML / AliExpress)
    const hasEventCoupon = Boolean(activeMonthlyEvent && eventDiscountPct > 0);
    const eventPrice = hasEventCoupon ? Math.round(promo.price * (1 - eventDiscountPct / 100)) : promo.price;
    const eventExtraSavings = promo.price - eventPrice;
    const totalSavings = hasEventCoupon ? (regularPrice - eventPrice) : savings;
    const totalDiscountPercent = Math.round((totalSavings / regularPrice) * 100);

    return (
      <div
        key={promo.code === 'EV-PATCHBAR' ? 'patch-bar-event-card' : (promo.id || promo.code)}
        id={promo.code === 'EV-PATCHBAR' ? 'patch-bar-event-card' : `bundle-card-${promo.id || promo.code}`}
        className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-xs hover:shadow-xl ${
          isStarred
            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
            : isExpanded
            ? 'border-[#D4A359] ring-2 ring-[#D4A359]/30 shadow-lg'
            : 'border-[#E5D7C3] hover:border-[#D4A359]'
        }`}
      >
        {/* Cinta de Paquete Estrella del Mes si aplica */}
        {isStarred && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
              <span>👑 Paquete Estrella del Mes</span>
            </div>
            <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.2 rounded-full font-bold">
              Beneficio Exclusivo
            </span>
          </div>
        )}

        {/* Ribbon de Evento Comercial Activo afectando la promoción */}
        {hasEventCoupon && (
          <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border-b border-amber-300/60 px-3.5 py-1 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#1F2421] flex items-center gap-1.5 truncate">
              <Flame className="w-3.5 h-3.5 text-[#9E472A] fill-[#9E472A] shrink-0" />
              <span className="truncate">{activeMonthlyEvent.title || 'Evento Especial de Taller'}</span>
            </span>
            <span className="font-black text-[#9E472A] bg-amber-100/90 border border-amber-300 px-2 py-0.2 rounded-full shrink-0 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>{activeMonthlyEvent.couponCode} (-{eventDiscountPct}%)</span>
            </span>
          </div>
        )}

        {/* Contenido Principal con Estética de Placa Artesanal Patch Bar */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#FDFCF9] via-white to-white">
          
          {/* Fila Superior: Miniatura Cuadrada en Marco Artesanal + SKU Placa + Título */}
          <div className="flex items-start gap-3">
            <div
              onClick={() => onSelectProduct(promo)}
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#FAF9F5] border-2 border-[#E8DFC8] shrink-0 cursor-pointer group/thumb shadow-xs"
              title="Clic para ver fotos de estudio del paquete"
            >
              <img
                src={promo.primaryImage || promo.gallery?.[0] || promo.whiteBgImage}
                alt={promo.name}
                className="w-full h-full object-cover group-hover/thumb:scale-108 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/25 transition-colors flex items-center justify-center">
                <Layers className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow-md" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Placa de SKU estilo Taller Patch Bar (Oculto al cliente por requerimiento interno) */}
                <span className="hidden font-mono font-bold text-[10px] text-[#F3E5AB] bg-[#1F2421] border border-[#D4A359]/40 px-2 py-0.5 rounded-md shadow-2xs">
                  {promo.code}
                </span>

                {isStarred ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <Star className="w-2.5 h-2.5 fill-stone-950" />
                    <span>Especial del Mes</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold border border-dashed border-[#D4A359]/60 bg-[#FAF7F0] text-[#7A4B1D]">
                    {theme.icon} {theme.label}
                  </span>
                )}
              </div>

              <h4
                onClick={() => onSelectProduct(promo)}
                className="font-extrabold text-sm sm:text-base text-[#1F2421] hover:text-[#9E472A] leading-snug line-clamp-2 transition-colors cursor-pointer font-heading mt-1"
                title={promo.name}
              >
                {promo.name}
              </h4>

              <div className="text-[11px] text-gray-500 capitalize truncate mt-0.5">
                {promo.worlds?.join(', ')}
              </div>
            </div>
          </div>

          {/* Bloque de Precios y Ahorro estilo Escaparate Patch Bar */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FAF8F2] via-[#F5ECE0] to-[#FAF8F2] border border-[#E8DEC7] space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 line-through mr-1.5 font-mono">${regularPrice}</span>
                <span className={`font-black text-base sm:text-lg font-mono ${hasEventCoupon ? 'text-gray-400 line-through text-xs' : 'text-[#1F2421]'}`}>
                  ${promo.price} <span className="text-[10px] font-normal text-gray-500">MXN</span>
                </span>
                {hasEventCoupon && (
                  <span className="font-black text-base sm:text-lg font-mono ml-1.5 text-[#2D4F3E]">
                    ${eventPrice} <span className="text-[10px] font-normal text-gray-500">MXN</span>
                  </span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black border border-[#D4A359]/60 bg-[#D4A359]/15 text-[#855E42] shadow-2xs">
                Ahorro ${totalSavings} (-{totalDiscountPercent}%)
              </span>
            </div>

            {hasEventCoupon && (
              <div className="flex items-center justify-between text-[10.5px] bg-amber-50/90 border border-amber-300/80 px-2 py-0.5 rounded-xl font-bold text-amber-900">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
                  <span>Con cupón <strong>{activeMonthlyEvent.couponCode}</strong>:</span>
                </span>
                <span className="text-emerald-700 font-black">
                  -${eventExtraSavings} MXN extra
                </span>
              </div>
            )}
          </div>

          {/* Lista "Incluye:" con íconos de check táctiles estilo Patch Bar */}
          {promo.includedItems && promo.includedItems.length > 0 && (
            <div className="space-y-1 text-xs">
              <div className="font-bold text-[11px] text-[#7A4B1D] uppercase tracking-wider flex items-center gap-1">
                <span>✦ Incluye en tu paquete:</span>
              </div>
              <ul className="space-y-1.5 text-gray-700">
                {promo.includedItems.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11.5px] line-clamp-1 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4F3E] shrink-0 mt-0.5" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
              {promo.includedItems.length > 2 && (
                <div className="text-[10.5px] text-[#855E42] font-semibold pl-5">
                  +{promo.includedItems.length - 2} piezas y acabados más...
                </div>
              )}
            </div>
          )}

          {/* Micro-pastillas de 3 Niveles estilo Parches Coleccionables */}
          <div className="flex items-center gap-1.5 pt-0.5 text-[10px] font-bold text-gray-500 flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-[#FAF8F2] text-stone-700 border border-[#E8DEC7]">🥉 Esencial</span>
            <span className="px-2 py-0.5 rounded-lg bg-[#D4A359]/15 text-[#855E42] border border-[#D4A359]/50">🥈 Pro (Recomendado)</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300">🥇 Edición VIP</span>
          </div>

        </div>

        {/* Barra de Acciones Cliclables con botón de símbolo '+' como en los productos */}
        <div className="p-3 sm:p-4 bg-gradient-to-b from-[#FAF8F4] to-[#F3ECE1] border-t border-[#E8DFC8] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectProduct(promo)}
            className="flex-1 py-2 px-3 rounded-xl border border-[#D4A359]/50 bg-white hover:bg-amber-50/50 text-[#1F2421] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Ver los 3 paquetes y detalles en ventana emergente"
          >
            <span>Ver 3 Paquetes &amp; Opciones</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4A359]" />
          </button>

          <button
            type="button"
            onClick={() => handleWhatsAppQuote(promo)}
            className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white transition-all cursor-pointer shadow-2xs shrink-0"
            title="Cotizar paquete por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
          </button>

          {/* Botón con símbolo de más '+' como en el de los productos */}
          <button
            type="button"
            onClick={() => onSelectProduct(promo)}
            className="w-9 h-9 rounded-full bg-[#EBF5EE] border border-[#2D4F3E]/30 text-[#2D4F3E] hover:bg-[#2D4F3E] hover:text-white shadow-2xs hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn shrink-0"
            title="Ver los 3 paquetes en ventana emergente"
            aria-label="Ver 3 paquetes en ventana emergente"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.8] text-[#2D4F3E] group-hover/btn:text-white transition-all duration-200 group-hover/btn:rotate-90" />
          </button>
        </div>

        {/* Despliegue de los 3 Niveles cuando está Expandido */}
        {isExpanded && (
          <div className="p-4 bg-[#FAF9F5] border-t border-gray-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#1F2421]">
                Selecciona tu nivel:
              </span>
              <span className="text-[10px] text-gray-400 font-normal">
                3 opciones de taller
              </span>
            </div>

            {/* Selector de Nivel en 3 Pastillas */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/70 rounded-2xl">
              {tiers.map(tier => {
                const isSelected = activeTier.id === tier.id;
                const tierEventPrice = hasEventCoupon ? Math.round(tier.price * (1 - eventDiscountPct / 100)) : tier.price;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierByPackage(prev => ({ ...prev, [promo.id]: tier.id }))}
                    className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-gray-900 font-black shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 font-semibold text-[11px]'
                    }`}
                  >
                    <span className="text-xs block">{tier.icon}</span>
                    <span className="text-[10px] block leading-tight truncate">{tier.name.replace('Nivel ', '')}</span>
                    <span className="text-[10px] font-bold text-[#2D4F3E] block mt-0.5">
                      ${hasEventCoupon ? tierEventPrice : tier.price}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ficha del Nivel Activo */}
            {(() => {
              const activeTierEventPrice = hasEventCoupon ? Math.round(activeTier.price * (1 - eventDiscountPct / 100)) : activeTier.price;
              const activeTierExtraSavings = activeTier.price - activeTierEventPrice;
              const activeTierTotalSavings = hasEventCoupon ? (activeTier.regularPrice - activeTierEventPrice) : activeTier.savings;

              return (
                <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-gray-900 text-xs block">{activeTier.name}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{activeTier.badge}</span>
                    </div>
                    <div className="text-right">
                      {hasEventCoupon ? (
                        <>
                          <span className="font-black text-sm text-[#2D4F3E] block">${activeTierEventPrice} MXN</span>
                          <span className="text-[10px] text-gray-400 line-through mr-1">${activeTier.regularPrice}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">Ahorras ${activeTierTotalSavings}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-black text-sm text-[#2D4F3E] block">${activeTier.price} MXN</span>
                          <span className="text-[10px] text-gray-400 line-through mr-1">${activeTier.regularPrice}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">Ahorras ${activeTier.savings}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {hasEventCoupon && (
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/70 text-[10px] font-bold text-amber-900 flex items-center justify-between">
                      <span>Cupón {activeMonthlyEvent.couponCode} aplicado:</span>
                      <span className="text-emerald-700">-${activeTierExtraSavings} MXN extra</span>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-600 italic">
                    &ldquo;{activeTier.summary}&rdquo;
                  </p>

                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Componentes incluidos:
                    </span>
                    <ul className="text-[11px] text-gray-700 space-y-1">
                      {activeTier.includedItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botones para Agregar y Cotizar el Nivel Seleccionado */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart && onAddToCart({
                          product: {
                            ...promo,
                            id: `${promo.id}-${activeTier.id}`,
                            name: `${promo.name} (${activeTier.name})`,
                            price: activeTierEventPrice,
                            regularPrice: activeTier.regularPrice,
                            savings: activeTierTotalSavings,
                            appliedCoupon: hasEventCoupon ? activeMonthlyEvent.couponCode : null
                          },
                          quantity: 1,
                          selectedVariants: { Nivel: activeTier.name },
                          customText: ''
                        });
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-white border border-[#2D4F3E] text-[#2D4F3E] hover:bg-emerald-50 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Al Carrito</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppQuote(promo, activeTier)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Cotizar por WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#FBF9F5] min-h-screen">
      
      {/* CABECERA COMPACTA MÓVIL ESTILO MERCADO LIBRE: Directa a los paquetes sin scroll innecesario */}
      <div className="md:hidden bg-[#17251E] text-white px-4 pt-3 pb-3 border-b border-[#D4A359]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#D4A359]">
              Kits &amp; Combos con Ahorro
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {allBundles.length} Paquetes
          </span>
        </div>
        <h1 className="text-xl font-black font-heading text-white mt-1">
          Paquetes del Taller
        </h1>
        <p className="text-[11px] text-gray-300 mt-0.5">
          Combos listos para Hogar, Negocios, Eventos y el servicio estrella Patch Bar.
        </p>

        {/* Chips de Categorías Rápidas Deslizables en Móvil */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-none pb-1 select-none">
          {[
            { id: 'all', label: '✨ Todos los Paquetes', count: allBundles.length },
            { id: 'servicios', label: '🧵 Patch Bar en Vivo', count: 1, highlight: true },
            { id: 'hogar', label: '🏠 Hogar', count: hogarBundles.length },
            { id: 'negocios', label: '💼 Negocios', count: negociosBundles.length },
            { id: 'eventos', label: '🎉 Eventos', count: eventosBundles.length }
          ].map(tab => {
            const isSelected = activeAreaFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveAreaFilter(tab.id);
                  setPackagesSeed(Date.now());
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#D4A359] text-[#17251E] font-black shadow-sm'
                    : tab.highlight
                    ? 'bg-[#D82B6E]/30 text-rose-200 border border-[#D82B6E]/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-black/20 text-[#17251E]' : 'bg-white/10 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Cover Dinámico de Paquetes y Temporadas (Solo Desktop / Pantallas Grandes) */}
      <div className="hidden md:flex relative bg-[#17251E] text-white overflow-hidden py-12 sm:py-16 border-b border-[#D4A359]/40 min-h-[380px] items-center">
        {/* Atmósfera y Animación Estacional de Temporada */}
        <SeasonalAtmosphere
          effect={campaignConfig?.seasonalEffect || activeSeason?.seasonalEffect || 'snow'}
          showToggle={true}
        />

        {/* Imagen de Portada de Temporada / Campaña Activa */}
        {campaignConfig?.bannerImage && (
          <img
            src={campaignConfig.bannerImage}
            alt="Portada de Temporada"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-65 contrast-105 scale-105 transition-all duration-700"
          />
        )}
        
        {/* Degradado para máxima legibilidad tipográfica */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#17251E]/95 via-[#17251E]/80 to-[#17251E]/60 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D4A359_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 w-full">
          {/* Badge de Temporada o Especial */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-xs font-bold text-amber-300 shadow-sm">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>{campaignConfig?.bannerBadge || '✨ Especial de Temporada de Taller'}</span>
            </div>
            {activeSeason && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gray-200 font-medium">
                {activeSeason.icon} {activeSeason.name}
              </span>
            )}
          </div>

          {/* Título de Campaña / Paquetes */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight max-w-3xl drop-shadow-sm">
            {campaignConfig?.title || 'Paquetes y Servicios de Taller'}
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed drop-shadow-sm font-normal">
            {campaignConfig?.subtitle || 'Ahorra adquiriendo kits completos por área de fabricación o contrata servicios especiales como nuestra barra de parches en vivo Patch Bar. Elige entre 3 niveles de personalización para cada paquete.'}
          </p>

          {/* Gancho Promocional / Beneficio de Temporada */}
          {campaignConfig?.promoNotice && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-white font-semibold shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{campaignConfig.promoNotice}</span>
            </div>
          )}

          {/* Botones de acción rápida en Hero */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveAreaFilter('especial');
                setPackagesSeed(Date.now());
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#D4A359] hover:bg-[#c28e38] text-[#17251E] font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4 fill-[#17251E]" />
              <span>Ver Selección de Temporada</span>
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola Artesano Digital, me interesa cotizar un paquete personalizado de taller.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Preguntar por WhatsApp</span>
            </a>
          </div>

          {/* Selector de Áreas dentro de Paquetes y Servicios */}
          <div className="pt-2 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos los Paquetes', icon: Gift, count: allBundles.length },
              { id: 'especial', label: '⭐ Especial de Temporada', icon: Star, count: especialBundles.length },
              { id: 'hogar', label: 'Hogar & Recibidor', icon: Home, count: hogarBundles.length },
              { id: 'negocios', label: 'Negocios & Marcas', icon: Briefcase, count: negociosBundles.length },
              { id: 'eventos', label: 'Eventos & Fiestas', icon: CalendarHeart, count: eventosBundles.length + 1 },
              { id: 'servicios', label: 'Patch Bar en Vivo', icon: Sparkles, count: 1 }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeAreaFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveAreaFilter(tab.id);
                    setPackagesSeed(Date.now());
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-[#D4A359] text-[#17251E] ring-2 ring-white/30 font-black shadow-md scale-102'
                      : 'bg-black/35 hover:bg-black/50 text-white border border-white/15 backdrop-blur-md'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-black/20 text-[#17251E]' : 'bg-white/20 text-white'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barra de Valor: ¿Por qué comprar en paquete? (Solo Desktop / Pantallas Grandes) */}
      <div className="hidden md:block bg-[#FAF9F5] border-b border-[#E8E4DA] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 font-black text-sm border border-emerald-200">
                💰
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1F2421]">Ahorro de hasta 25%</h4>
                <p className="text-[11px] text-gray-500">Más barato que por pieza separada</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 font-black text-sm border border-amber-200">
                📦
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1F2421]">Kits Coordinados</h4>
                <p className="text-[11px] text-gray-500">Acabados con armonía visual</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center shrink-0 font-black text-sm border border-rose-200">
                ⭐
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1F2421]">3 Opciones de Nivel</h4>
                <p className="text-[11px] text-gray-500">Esencial, Artesano Pro o VIP</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E4DA] shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 font-black text-sm border border-blue-200">
                ✨
              </div>
              <div>
                <h4 className="text-xs font-black text-[#1F2421]">Grabado Láser Listo</h4>
                <p className="text-[11px] text-gray-500">Personalizado para tu marca o casa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12 space-y-6 sm:space-y-12">
        
        {/* Banner de Eventos Comerciales del Mes (Solo en Escritorio / Desktop) */}
        {campaignConfig?.monthlyEvents && (
          <div className="hidden md:block">
            <MonthlyEventBanner
              eventsConfig={campaignConfig.monthlyEvents}
              seasonalEffect={campaignConfig?.seasonalEffect}
              activeTheme={campaignConfig?.accentTheme || campaignConfig?.seasonalEffect || 'clasico'}
              textColorMode={campaignConfig?.textColorMode || 'auto'}
              showcaseSlides={campaignConfig?.monthlyEvents?.showcaseSlides || campaignConfig?.showcaseSlides}
              onExploreClick={() => {
                const el = document.getElementById('paquetes-especial') || document.getElementById('paquetes-hogar') || document.getElementById('servicios-patchbar-top');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* SECCIÓN ESPECIAL: TEMPORADA ACTIVA & SELECCIÓN DEL MES */}
        {activeAreaFilter === 'especial' && (
          <section id="paquetes-especial" className="space-y-6">
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#17251E] via-[#243B2E] to-[#1F2421] text-white border-2 border-amber-400/50 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-sm">
                    <Crown className="w-4 h-4 text-stone-950 fill-stone-950" />
                    <span>{campaignConfig?.bannerBadge || '⭐ Selección Especial de Temporada'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                    {activeSeason?.title || campaignConfig?.title || 'Kits Destacados de Taller'}
                  </h2>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {campaignConfig?.promoNotice || 'Paquetes seleccionados con beneficios exclusivos de temporada, personalización express y máxima compatibilidad de manufactura.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                    👑 Selección Recomendada
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {especialBundles.map(bundle => renderBundleCard(bundle, "especial"))}
            </div>
          </section>
        )}

        {/* VIP BANNER DESTACADO: SERVICIO PATCH BAR EN VIVO (Visible en 'all', 'eventos' y 'servicios') */}
        {(activeAreaFilter === 'all' || activeAreaFilter === 'eventos' || activeAreaFilter === 'servicios') && (
          <section id="servicios-patchbar-top" className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#17251E] via-[#243B2E] to-[#1F2421] text-white p-5 sm:p-8 border-2 border-[#D4A359]/60 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4A359]/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Imagen / Foto de la Estación Patch Bar */}
              <div className="w-full md:w-56 h-48 md:h-52 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md relative group">
                <img
                  src="/uploads/patch_bar_servicio_en_vivo.jpg"
                  alt="Servicio Patch Bar en Vivo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Estación móvil de madera
                  </span>
                </div>
              </div>

              {/* Contenido e información de Patch Bar */}
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D82B6E] text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  <Flame className="w-3.5 h-3.5" />
                  <span>★ Servicio Estrella para Bodas y Fiestas</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white leading-tight">
                  Servicio Patch Bar en Vivo (Gorras &amp; Totes)
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Llevamos nuestro stand de madera artesanal y prensa térmica industrial a tu evento. Tus invitados eligen sus parches favoritos y personalizan su recuerdo en vivo en solo 45 segundos.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-lg sm:text-2xl font-black text-[#E5C378] font-heading">
                    Desde $4,800 <span className="text-xs text-gray-300 font-normal">MXN</span>
                  </span>
                  <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-emerald-300 border border-emerald-400/20 font-bold">
                    ✓ Incluye mobiliario, prensa y operador
                  </span>
                  <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-amber-300 border border-amber-400/20 font-bold">
                    📍 San Luis Potosí y alrededores
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¡Hola Artesano Digital! Me interesa cotizar el Servicio de Patch Bar en Vivo para mi evento.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Cotizar por WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (patchBarProduct) {
                        onSelectProduct(patchBarProduct);
                      } else {
                        const el = document.getElementById('servicios-taller');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#D4A359] hover:bg-[#c28e38] text-[#17251E] font-black text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ver fotos &amp; detalles</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 1: PAQUETES DE HOGAR */}
        {(activeAreaFilter === 'all' || activeAreaFilter === 'hogar') && hogarBundles.length > 0 && (
          <section id="paquetes-hogar" className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D4F3E] uppercase tracking-wider">
                  <Home className="w-4 h-4" />
                  <span>Área Hogar &amp; Decoración</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-heading">
                  Paquetes para el Hogar
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Combos de recibidor, estaciones gamer/home office y kits consentidos para mascotas en 3 niveles de personalización.
                </p>
              </div>

              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E5D7B7] text-[#9E472A] text-xs font-black">
                {hogarBundles.length} combos con descuento
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {hogarBundles.map(bundle => renderBundleCard(bundle, "hogar"))}
            </div>
          </section>
        )}

        {/* SECCIÓN 2: PAQUETES DE NEGOCIOS */}
        {(activeAreaFilter === 'all' || activeAreaFilter === 'negocios') && negociosBundles.length > 0 && (
          <section id="paquetes-negocios" className="space-y-6">
            
            {/* Cabecera Móvil Limpia de Negocios */}
            <div className="md:hidden flex items-center justify-between pb-2 border-b border-[#E8E4DA]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D4F3E] uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Área Negocios &amp; Marcas</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#1F2421] font-heading">
                  Paquetes para Negocios
                </h2>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#FAF7F0] border border-[#E5D7B7] text-[#9E472A]">
                {negociosBundles.length} combos
              </span>
            </div>

            {/* Banner Comercial Atractivo con Recursos Gráficos Sutiles (Solo Desktop) */}
            <div className="hidden md:block relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FAF7F0] via-[#F4EFE6] to-[#FAF7F0] border-2 border-[#E5D7B7] shadow-sm overflow-hidden space-y-5">
              
              {/* Decoración gráfica sutil de fondo */}
              <div className="absolute -right-6 -bottom-8 opacity-[0.04] pointer-events-none text-[#2D4F3E]">
                <Building2 className="w-64 h-64" />
              </div>
              <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#D4A359]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4F3E] text-white text-[11px] font-black uppercase tracking-wider shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>Equipamiento Comercial &amp; Marca Propia</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2421] font-heading tracking-tight">
                    Paquetes de Negocios &amp; Comercios
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                    Starter packs de señalética, soportes QR para menú o cobro, placas inteligentes NFC y merchandising grabado a láser con la identidad de tu empresa o local.
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#2D4F3E] text-[#F3EEDD] text-xs font-black shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>{negociosBundles.length} combos con descuento</span>
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">Precios de mayoreo desde 1 kit</span>
                </div>
              </div>

              {/* Pastillas de Giros Comerciales con Recursos Gráficos Sutiles */}
              <div className="relative z-10 flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5D7B7]/80">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
                  <span>Especializados para:</span>
                </span>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E5D7B7] text-[#1F2421] text-xs font-bold shadow-2xs">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  <span>Cafeterías &amp; Restaurantes</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E5D7B7] text-[#1F2421] text-xs font-bold shadow-2xs">
                  <Scissors className="w-3.5 h-3.5 text-[#2D4F3E]" />
                  <span>Barberías, Estéticas &amp; Boutiques</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E5D7B7] text-[#1F2421] text-xs font-bold shadow-2xs">
                  <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                  <span>Mostrador Smart NFC &amp; Cobro Ágil</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E5D7B7] text-[#1F2421] text-xs font-bold shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Consultorios, Oficinas &amp; Agencias</span>
                </span>
              </div>

              {/* 3 Garantías Comerciales de Taller */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/80 border border-[#E8E4DA] text-xs text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1F2421] font-bold">Uso Rudo Comercial</strong>
                    <span className="text-[11px] text-gray-500">Maderas curadas hidrófugas y polímeros de alto impacto.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/80 border border-[#E8E4DA] text-xs text-gray-700">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1F2421] font-bold">NFC &amp; QR Preprogramados</strong>
                    <span className="text-[11px] text-gray-500">Listos para operar de inmediato sin instalar apps externas.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/80 border border-[#E8E4DA] text-xs text-gray-700">
                  <CheckCheck className="w-4 h-4 text-[#2D4F3E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1F2421] font-bold">Logotipo en Alta Definición</strong>
                    <span className="text-[11px] text-gray-500">Grabado láser de precisión y calibración exacta de color.</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {negociosBundles.map(bundle => renderBundleCard(bundle, "negocios"))}
            </div>
          </section>
        )}

        {/* SECCIÓN 3: PAQUETES DE EVENTOS ESPECIALES */}
        {(activeAreaFilter === 'all' || activeAreaFilter === 'eventos') && eventosBundles.length > 0 && (
          <section id="paquetes-eventos" className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D4F3E] uppercase tracking-wider">
                  <CalendarHeart className="w-4 h-4" />
                  <span>Área Eventos Especiales</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-heading">
                  Paquetes de Eventos
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Kits nupciales, bodas, quince años, graduaciones y recuerdos coordinados todo incluido.
                </p>
              </div>

              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E5D7B7] text-[#9E472A] text-xs font-black">
                {eventosBundles.length + (patchBarProduct ? 1 : 0)} paquetes para fiestas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {eventosBundles.map(bundle => renderBundleCard(bundle, "eventos"))}
              {patchBarProduct && renderBundleCard(patchBarProduct, "eventos")}
            </div>
          </section>
        )}

        {/* SECCIÓN 4: SERVICIOS EN VIVO (PATCH BAR SHOWCASE) */}
        {(activeAreaFilter === 'all' || activeAreaFilter === 'eventos' || activeAreaFilter === 'servicios') && (
          <section id="servicios-taller" className="space-y-6 pt-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#9E472A] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Servicio Estrella para Eventos</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-heading">
                  Servicio Patch Bar en Vivo &amp; Taller
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Instalamos una estación de personalización en vivo para tus invitados en bodas, graduaciones o activaciones corporativas.
                </p>
              </div>
            </div>

            <PatchBarShowcase
              onOpenPatchBarProduct={() => {
                if (patchBarProduct) onSelectProduct(patchBarProduct);
              }}
              settings={settings}
            />
          </section>
        )}

      </main>

    </div>
  );
}
