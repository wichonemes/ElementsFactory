import React, { useState, useMemo, useEffect } from 'react';
import {
  Gift, Home, Briefcase, CalendarHeart, Sparkles, Percent,
  CheckCircle2, ArrowRight, ShoppingBag, Calculator, MessageCircle,
  Layers, Package, Flame, Clock, Star, ShieldCheck, Plus,
  ChevronDown, ChevronUp, Check, Award, Crown,
  QrCode, Store, Building2, TrendingUp, BarChart2, Zap,
  CheckCheck, Coffee, Scissors, Smartphone, BadgePercent, Tag, DollarSign, MapPin
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit Base',
        tag: 'Básico Individual',
        tierBadge: 'Kit Base',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Recomendado del Taller',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+2 piezas extra por solo +$129 MXN)',
        isPopular: true,
        price: 449,
        regularPrice: 548,
        savings: 99,
        discountPercent: 18,
        summary: 'El combo completo para recibidor: incluye todo lo del básico más bandeja y segundo llavero.',
        includedItems: [
          '1 Colgador de llaves Bienvenidos ampliado en madera natural (25 x 10 cm)',
          '1 Llavero familiar Polaroid con foto grabada a láser',
          '+ 1 Bandeja vaciabolsillos curva ergonómica (18 x 12 cm)',
          '+ 1 Llavero familiar adicional (2 en total con borla de gamuza)'
        ],
        extraBenefits: [
          'Acabado en laca poliuretano satinada',
          'Colores y tipografía a elegir',
          'Empaque protegido listo para regalo'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Kit VIP de Colección',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Máxima capacidad, madera de nogal y llaveros para toda la familia',
        price: 620,
        regularPrice: 775,
        savings: 155,
        discountPercent: 20,
        summary: 'Máxima capacidad en madera noble de nogal con 4 llaveros y kit de instalación oculta.',
        includedItems: [
          '1 Colgador de llaves Bienvenidos XL en madera de nogal con 5 ganchos metálicos (35 x 12 cm)',
          '1 Bandeja vaciabolsillos curva ergonómica',
          '+ Inserto en piel vegetal grabada para la bandeja',
          '+ 2 Llaveros familiares Polaroid extra (4 llaveros en total para toda la familia)',
          '+ Kit de instalación oculta con taquetes y nivelador de burbuja'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit Base',
        tag: 'Básico Funcional',
        tierBadge: 'Kit Base',
        accentColor: 'stone',
        price: 370,
        regularPrice: 460,
        savings: 90,
        discountPercent: 20,
        summary: 'Equipamiento básico para tener limpio y despejado el escritorio.',
        includedItems: [
          '1 Soporte vertical para audífonos de diadema',
          '1 Soporte vertical para celular con ranura para cable de carga'
        ],
        extraBenefits: [
          'Impresión 3D de alta densidad',
          'Diseño ergonómico compacto',
          'Color a elegir'
        ]
      },
      {
        id: 'pro',
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Recomendado Pro',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+3 organizadores adicionales por solo +$150 MXN)',
        isPopular: true,
        price: 520,
        regularPrice: 647,
        savings: 127,
        discountPercent: 20,
        summary: 'Estación completa: soporte dual audífonos + control, organizador de memorias y portalápices facetado.',
        includedItems: [
          '1 Soporte vertical para celular con ranura para cable de carga',
          '+ 1 Soporte gamer dual mejorado para audífonos y mando de videojuegos',
          '+ 1 Organizador modular de accesorios y memorias USB',
          '+ 1 Portalápices geométrico facetado de alta estabilidad'
        ],
        extraBenefits: [
          'Bases con pads antideslizantes',
          'Filamento mate anti-huellas',
          'Gestión integrada de cables'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Máximo Rendimiento',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Setup definitivo con acabados grafito texturizado, soporte tablet y placa personalizada',
        price: 720,
        regularPrice: 910,
        savings: 190,
        discountPercent: 21,
        summary: 'El setup definitivo con acabados grafito texturizado, soporte para tablet y placa con Gamertag.',
        includedItems: [
          '1 Soporte gamer dual premium en acabado grafito/bronce con doble brazo reforzado',
          '1 Organizador modular XL con bahías para cables magnéticos y tarjetas SD',
          '1 Portalápices geométrico facetado',
          '+ 1 Soporte articulado multi-ángulo para tablet o iPad',
          '+ 1 Maceta geométrica para suculenta a juego',
          '+ 1 Placa personalizada con tu Gamertag / Nombre grabada al láser'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit Base',
        tag: 'Básico Diario',
        tierBadge: 'Kit Base',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Favorito de Mascotas',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+Portabolsas de paseo y marco 3D por solo +$80 MXN)',
        isPopular: true,
        price: 299,
        regularPrice: 366,
        savings: 67,
        discountPercent: 18,
        summary: 'El kit consentido con portabolsas para paseo, chapita y marco con relieve.',
        includedItems: [
          '1 Chapita de identificación ligera con silueta y datos grabados',
          '1 Fotoimán de madera con grabado láser',
          '+ 1 Portabolsas sanitario cilíndrico con mosquetón para correa de paseo',
          '+ 1 Marco imantado 3D para foto en refrigerador (6 x 6 cm)'
        ],
        extraBenefits: [
          'Portabolsas con rosca antiderrames',
          'Colores vivos combinables con la correa',
          'Material impermeable apto para intemperie'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Kit Consentido Total',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Kit completo con gancho para correa, doble chapita y bolsitas de regalo',
        price: 420,
        regularPrice: 530,
        savings: 110,
        discountPercent: 21,
        summary: 'Edición de lujo con doble chapita de repuesto, gancho de pared para su correa y portabolsas cargado.',
        includedItems: [
          '1 Chapita de identificación en relieve 3D bicapa',
          '1 Portabolsas sanitario cilíndrico con mosquetón',
          '+ 1 Chapita grabada de repuesto en madera natural',
          '+ 2 Rollos de bolsas biodegradables de regalo',
          '+ 2 Marcos imantados 3D personalizados con foto de tu peludo',
          '+ 1 Gancho de pared personalizado con silueta y nombre para colgar su correa'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit 6 Mesas',
        tag: 'Básico Restaurante',
        tierBadge: 'Kit 6 Mesas',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Recomendado Comercial',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+4 números de mesa, +2 servilleteros y +1 QR por solo +$540 MXN)',
        isPopular: true,
        price: 1890,
        regularPrice: 2364,
        savings: 474,
        discountPercent: 20,
        summary: 'El pack más completo para restaurantes y bares: 10 mesas, 4 servilleteros y doble QR.',
        includedItems: [
          '6 Números de mesa 3D con base rectangular biselada',
          '2 Servilleteros de mesa modernos con diseño calado',
          '1 Soporte de mostrador con placa grabada para código QR',
          '+ 4 Números de mesa 3D adicionales (10 mesas en total, del 01 al 10)',
          '+ 2 Servilleteros de mesa extra de alta capacidad (4 en total)',
          '+ 1 Soporte de mostrador QR adicional para barra o propinas (2 en total)'
        ],
        extraBenefits: [
          'Tipografía en relieve de alta visibilidad',
          'Grabado de logotipo en soportes QR',
          'Entrega con archivo digital de QR respaldado'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Pack Restaurante Integral',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Capacidad para 15 mesas con logo grabado, 6 servilleteros, 3 QR y letrero de barra',
        price: 2590,
        regularPrice: 3280,
        savings: 690,
        discountPercent: 21,
        summary: 'Capacidad para 15 mesas con logo, letrero de barra, servilleteros ampliados y QR de acrílico doble vista.',
        includedItems: [
          '10 Números de mesa 3D biselados con logotipo grabado',
          '4 Servilleteros de mesa modernos de alta capacidad',
          '2 Soportes QR de mostrador',
          '+ 5 Números de mesa 3D extra con logo (15 mesas en total, del 01 al 15)',
          '+ 2 Servilleteros XL extra con ranura para salero y azúcar (6 en total)',
          '+ 1 Soporte QR adicional en acrílico cristal de lujo (3 en total)',
          '+ 1 Letrero de barra personalizado "Bienvenidos / Menú Digital" (20 x 15 cm)'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit Base',
        tag: 'Básico Digital',
        tierBadge: 'Kit Base',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Identidad Completa',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+4 posavasos con logo y +2 tazas full color por solo +$220 MXN)',
        isPopular: true,
        price: 780,
        regularPrice: 932,
        savings: 152,
        discountPercent: 16,
        summary: 'El paquete de mostrador preferido: NFC, soporte QR, 6 posavasos y 2 tazas institucionales.',
        includedItems: [
          '1 Soporte piramidal de contacto inteligente con chip NFC programado',
          '1 Soporte QR de acrílico y madera para mostrador de caja',
          '2 Posavasos de madera natural de haya grabados con tu logo',
          '+ 4 Posavasos de madera de haya adicionales (6 en total con tu logo)',
          '+ 2 Tazas de cerámica brillante con logotipo empresarial full color'
        ],
        extraBenefits: [
          'Tazas de cerámica sublimadas calidad AA+',
          'Posavasos con barniz hidrófugo',
          'NFC reescribible si cambias de enlace'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Kit Ejecutivo Doble',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Doble estación NFC para caja y recepción, 12 posavasos y vajilla ejecutiva completa',
        price: 1090,
        regularPrice: 1390,
        savings: 300,
        discountPercent: 22,
        summary: 'Doble estación NFC para caja y recepción, 12 posavasos y vajilla ejecutiva completa.',
        includedItems: [
          '1 Soporte piramidal con chip NFC para mostrador de cobro',
          '1 Soporte QR premium en acrílico cristal y madera',
          '6 Posavasos de madera de haya con grabado láser',
          '2 Tazas ejecutivas de cerámica con logotipo empresarial',
          '+ 1 Segundo soporte piramidal con chip NFC para recepción o redes (2 en total)',
          '+ 1 Segundo soporte QR con doble placa intercambiable (2 en total)',
          '+ 6 Posavasos extra (12 en total) + 1 Base organizadora de madera para posavasos',
          '+ 2 Tazas ejecutivas adicionales a todo color (4 en total)'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit Base',
        tag: 'Básico Local',
        tierBadge: 'Kit Base',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Recomendado Comercial',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+13 llaveros promocionales extra por solo +$250 MXN)',
        isPopular: true,
        price: 890,
        regularPrice: 1098,
        savings: 208,
        discountPercent: 19,
        summary: 'El pack más elegido por barberías, estéticas y boutiques: 25 llaveros, tótem y bandeja.',
        includedItems: [
          '1 Tótem QR para citas, catálogo o perfil de Instagram',
          '1 Bandeja organizadora para peines, tijeras, tarjetas o accesorios',
          '12 Llaveros promocionales de madera con grabado de tu marca',
          '+ 13 Llaveros promocionales de madera adicionales (25 llaveros en total)'
        ],
        extraBenefits: [
          'Bandeja con divisiones a la medida',
          'Llaveros listos en bolsita individual',
          'Tótem con base estable antideslizante'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Boutique Pro 50 Pzas',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Doble tótem, doble bandeja organizadora, 50 llaveros grabados a doble cara y placa 3D',
        price: 1250,
        regularPrice: 1590,
        savings: 340,
        discountPercent: 21,
        summary: 'Doble tótem de mostrador, doble bandeja organizadora y 50 llaveros para tus mejores clientes.',
        includedItems: [
          '1 Tótem QR para citas y redes',
          '1 Bandeja organizadora de mostrador',
          '25 Llaveros promocionales de madera',
          '+ 1 Segundo tótem QR para cobro con transferencia/tarjeta (2 en total)',
          '+ 1 Segunda bandeja organizadora para estación de trabajo (2 en total)',
          '+ 25 Llaveros promocionales adicionales (50 en total con grabado a doble cara)',
          '+ 1 Placa de mostrador con horarios y redes en relieve 3D'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Kit Nupcial Íntimo',
        tag: 'Básico Bodas',
        tierBadge: 'Kit Nupcial Íntimo',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'El Favorito de Novios',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+Recepción de ceremonia, 25 conos de pétalos y centro presidencial por solo +$700 MXN)',
        isPopular: true,
        price: 2490,
        regularPrice: 3020,
        savings: 530,
        discountPercent: 18,
        summary: 'El paquete nupcial insignia: Suite nupcial, bienvenida a ceremonia con conos de pétalos y centro presidencial.',
        includedItems: [
          'Set Suite Nupcial (2 ganchos grabados, 1 alhajero con terciopelo, 2 termos con vinil)',
          'Letrero de bienvenida en arco de madera natural para caballete (60 x 80 cm)',
          '+ 1 Cosmetiquera nupcial para retoque',
          '+ 25 Conos armados para pétalos + Canastilla de madera artesanal',
          '+ 2 Letreros de madera para sillas de los novios ("El Novio" / "La Novia")',
          '+ 1 Tótem QR para compartir fotos del evento',
          '+ 1 Centro Presidencial 3D sobre madera de nogal con nombres y fecha + 2 Portavasos'
        ],
        extraBenefits: [
          'Coordinación exacta de paleta de colores del evento',
          'Acabado en madera curada y barnizada',
          'Conos armados listos para rellenar'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Experiencia Total Todo Incluido',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'La suite más completa: 50 conos, centro 3D con luz LED y 20 recuerdos para padrinos',
        price: 3490,
        regularPrice: 4350,
        savings: 860,
        discountPercent: 20,
        summary: 'La suite nupcial más completa con 50 conos, recuerdos de padrinos y centro 3D con luz LED.',
        includedItems: [
          'Set Suite Nupcial VIP (Ganchos, alhajero con terciopelo, 2 cosmetiqueras y termos térmicos de acero)',
          'Letrero de bienvenida XL (60 x 90 cm)',
          'Centro Presidencial 3D en madera noble con relieve bicapa',
          '+ Iluminación LED cálida autónoma integrada para el centro de mesa',
          '+ 25 Conos de pétalos extra (50 en total) + 2da Canastilla de madera',
          '+ 4 Letreros para sillas (Novios + Padrinos)',
          '+ 20 Recuerdos de madera botánicos grabados para padrinos y cortejo'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: '30 Invitados (2 Horas)',
        tag: 'Fiesta Íntima',
        tierBadge: '30 Invitados',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Combo Fiesta Favorito',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+1 hora extra, +20 prendas y +20 kits anticruda por solo +$2,000 MXN)',
        isPopular: true,
        price: 7490,
        regularPrice: 8600,
        savings: 1110,
        discountPercent: 13,
        summary: 'El combo fiesta más cotizado para bodas y graduaciones: 3 horas, 50 prendas y 50 kits anticruda.',
        includedItems: [
          'Servicio Patch Bar en Vivo con stand de madera y prensa térmica industrial',
          '30 Prendas base + 30 Morralitos Kit Anticruda',
          '+ 1 Hora de servicio en vivo adicional (3 horas en total)',
          '+ 20 Prendas a elegir adicionales (50 prendas en total: gorras trucker o tote bags)',
          '+ 20 Morralitos Kit Anticruda adicionales (50 kits en total con frases de fiesta)',
          '+ 20 Llaveros de madera grabados adicionales (50 en total)'
        ],
        extraBenefits: [
          'Charolas de exhibición de madera artesanal',
          'Variedad de parches divertidos, florales y coquetos',
          'Entrega inmediata en mano a cada invitado'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Máxima Experiencia VIP (80 Invitados)',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Doble prensa, 4 horas continuas, 80 prendas con parche conmemorativo exclusivo del evento',
        price: 9990,
        regularPrice: 12400,
        savings: 2410,
        discountPercent: 19,
        summary: 'Doble prensa térmica, 4 horas continuas, 80 prendas con parche conmemorativo exclusivo del evento.',
        includedItems: [
          'Servicio Patch Bar en Vivo',
          '50 Prendas y 50 Morralitos Kit Anticruda',
          '+ Doble prensa térmica simultánea y 2 operadores (cero filas)',
          '+ 4 Horas de servicio continuo en vivo (1 hora extra)',
          '+ 30 Prendas adicionales (80 en total: Gorras, Totes y Bucket hats)',
          '+ 1 Diseño de parche bordado exclusivo personalizado con el monograma o logo del evento',
          '+ 30 Morralitos Kit Anticruda extra (80 en total) + 30 llaveros extra (80 en total)',
          '+ Bolsa kraft individual de cortesía para cada invitado'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Para 20 Invitados',
        tag: 'Básico XV / Graduación',
        tierBadge: 'Para 20 Invitados',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'El Set Más Pedido',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+15 llaveros con nombre y letrero ampliado por solo +$500 MXN)',
        isPopular: true,
        price: 1750,
        regularPrice: 2163,
        savings: 413,
        discountPercent: 19,
        summary: 'El balance ideal para la recepción de tus XV años o graduación con 35 llaveros y letrero de arco.',
        includedItems: [
          '1 Letrero de bienvenida silueta arco ampliado para caballete (50 x 70 cm)',
          '20 Llaveros en relieve 3D botánico personalizados',
          '1 Tótem QR para compartir álbum de Google Fotos o Instagram',
          '+ 15 Llaveros en relieve 3D botánicos adicionales (35 llaveros en total con nombres individuales)'
        ],
        extraBenefits: [
          'Letrero con base de ranura para caballete o mesa',
          'Argollas metálicas de alta resistencia',
          'Empaque clasificado en orden alfabético'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Set de Gran Celebración',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: '55 llaveros con bolsita de organza, letrero XL, doble QR y cuadro de firmas de madera',
        price: 2450,
        regularPrice: 3080,
        savings: 630,
        discountPercent: 20,
        summary: 'Letrero XL de 60x85 cm, 55 llaveros empacados individualmente, doble QR y cuadro de firmas.',
        includedItems: [
          '1 Letrero de bienvenida silueta arco XL para caballete (60 x 85 cm) con soporte reforzado',
          '35 Llaveros en relieve 3D botánicos',
          '1 Tótem QR para álbum de fotos',
          '+ 20 Llaveros en relieve 3D botánicos extra (55 llaveros en total con nombres)',
          '+ Bolsitas de organza individuales para los 55 llaveros',
          '+ 1 Segundo tótem QR para playlist o dedicatorias de invitados (2 en total)',
          '+ 1 Cuadro conmemorativo de firmas en madera grabada con base de exhibición'
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
        tierType: 'basic',
        name: 'Nivel Esencial',
        badge: 'Hasta 50 Personas',
        tag: 'Estación Compacta',
        tierBadge: 'Hasta 50 Personas',
        accentColor: 'stone',
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
        tierType: 'recommended',
        name: 'Nivel Artesano Pro',
        badge: 'Más Conveniente',
        tag: 'Estación Estándar Bodas',
        tierBadge: 'Más Conveniente',
        accentColor: 'emerald',
        valueCallout: '¡Te conviene más! (+1 hora extra, percheros rústicos y 50+ diseños por solo +$1,700 MXN)',
        isPopular: true,
        price: 6500,
        regularPrice: 7900,
        savings: 1400,
        discountPercent: 18,
        summary: 'Estación completa de 3 horas para 50 a 100 personas. El servicio estrella para bodas y graduaciones.',
        includedItems: [
          'Servicio en vivo con prensa térmica industrial y operador profesional',
          'Gorras trucker transpirables y Tote bags 100% algodón',
          '+ 1 Hora de servicio en vivo adicional (3 horas en total)',
          '+ Mobiliario rústico de madera completo, percheros y charolas organizadoras',
          '+ Catálogo ampliado de más de 50 diseños de parches bordados, transfers y chenille'
        ],
        extraBenefits: [
          'Diseños florales, divertidos y conmemorativos',
          'Asesoría para los invitados al crear su combinación',
          'Transporte y viáticos en zona conurbada incluidos'
        ]
      },
      {
        id: 'maestra',
        tierType: 'deluxe',
        name: 'Nivel Edición Maestra',
        badge: '⭐ Todo Incluido VIP',
        tag: 'Doble Prensa & Parche Exclusivo',
        tierBadge: '⭐ Todo Incluido',
        accentColor: 'amber',
        valueCallout: 'Doble prensa simultánea (cero filas), 4 horas, 2 operadores y parche personalizado exclusivo',
        price: 9500,
        regularPrice: 11800,
        savings: 2300,
        discountPercent: 19,
        summary: 'Para 100 a 200+ personas. 4 horas, 2 operadores, 2 prensas simultáneas y parche bordado personalizado con el logo de tu evento.',
        includedItems: [
          'Servicio Patch Bar en Vivo para gran evento',
          'Prendas premium: Gorras trucker, Tote bags gruesas y Bucket hats',
          '+ Doble prensa térmica simultánea y 2 operadores profesionales (cero filas)',
          '+ 4 Horas de servicio continuo en vivo (1 hora extra)',
          '+ Stand extendido con doble mostrador de selección para flujo rápido',
          '+ 1 Diseño de parche bordado personalizado exclusivo con el monograma o escudo del evento',
          '+ Empaque individual de regalo en bolsa kraft con sello para cada invitado'
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
      tierType: 'basic',
      name: 'Nivel Esencial',
      badge: 'Kit Base',
      tag: 'Básico Accesible',
      tierBadge: 'Kit Base',
      accentColor: 'stone',
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
      tierType: 'recommended',
      name: 'Nivel Artesano Pro',
      badge: 'Más Conveniente',
      tag: 'Recomendado del Taller',
      tierBadge: 'Más Conveniente',
      accentColor: 'emerald',
      valueCallout: '¡Te conviene más! (+Todas las piezas completas y acabados coordinados)',
      isPopular: true,
      price: basePrice,
      regularPrice: baseRegular,
      savings: promo.savings || Math.round(baseRegular - basePrice),
      discountPercent: promo.discountPercent || 20,
      summary: 'El kit completo coordinado estándar con todas las piezas y el mejor balance de valor.',
      includedItems: (promo.includedItems || ['Kit completo de piezas coordinadas']).map((item, i) => i > 0 ? `+ ${item.replace(/^\+\s*/, '')}` : item),
      extraBenefits: [
        'Personalización estándar incluida',
        'Acabado en laca protectora',
        'Asesoría directa del artesano'
      ]
    },
    {
      id: 'maestra',
      tierType: 'deluxe',
      name: 'Nivel Edición Maestra',
      badge: '⭐ Todo Incluido VIP',
      tag: 'Kit Premium VIP',
      tierBadge: '⭐ Todo Incluido',
      accentColor: 'amber',
      valueCallout: 'Máximo volumen, piezas de repuesto, empaque de regalo y acabados de lujo',
      price: Math.round(basePrice * 1.38),
      regularPrice: Math.round(baseRegular * 1.38),
      savings: Math.round((baseRegular - basePrice) * 1.5) || 200,
      discountPercent: (promo.discountPercent || 20) + 2,
      summary: 'Máximo volumen, piezas de repuesto, personalización especial y acabados de lujo.',
      includedItems: [
        ...(promo.includedItems || ['Kit completo']),
        '+ Piezas ampliadas o de repuesto para mayor durabilidad',
        '+ Empaque de regalo premium con dedicatoria artesanal'
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
      msg += `• *Cupón de Evento:* [${activeMonthlyEvent.couponCode}] (${activeMonthlyEvent.discountText || `${eventDiscountPct}% OFF`})\n`;
      msg += `• *Precio Especial con Cupón:* *$${discountedPrice} MXN* (Ahorro extra de $${basePrice - discountedPrice} MXN)\n`;
    }

    if (items && items.length > 0) {
      msg += `• Piezas y detalles incluidos:\n  - ${items.join('\n  - ')}\n`;
    }
    if (settings?.serviceStatus?.isPaused) {
      const resumeStr = formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso';
      msg += `\n*Nota de taller:* Taller reanuda servicio el ${resumeStr}.\n`;
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
  /**
   * Paletas de color distintivas por módulo / área de catálogo con alto contraste en fondo oscuro:
   * - Patch Bar: Neón Magenta / Rosa Festejo vibrante (#D82B6E, #FF2D78)
   * - Negocios: Esmeralda Eléctrico & Cian (#10B981, #06B6D4)
   * - Eventos: Fucsia & Púrpura Vibrante (#D946EF, #A855F7)
   * - Hogar: Ámbar Cálido & Naranja Sunset (#F59E0B, #F97316)
   * - Especial: Oro Cibernético / Corona (#FACC15, #EAB308)
   */
  const getModuleTheme = (promo, explicitArea) => {
    const isPatchBar = promo.code === 'EV-PATCHBAR' || promo.code?.includes('PATCH');
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
        icon: Crown,
        cardBorder: 'border-yellow-400/80 ring-2 ring-yellow-400/40 shadow-xl shadow-yellow-500/10',
        cardHover: 'hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]',
        bgBadge: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 font-black',
        priceColor: 'text-yellow-400',
        savingsPill: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50',
        bulletDot: 'text-yellow-400',
        btnPrimary: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-stone-950 font-black shadow-lg shadow-yellow-500/25',
        btnSecondary: 'bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40',
        accentRing: 'ring-yellow-400/40',
        glowBg: 'from-yellow-500/15 via-transparent to-transparent'
      };
    }

    if (isPatchBar) {
      return {
        area: 'patchbar',
        label: 'Patch Bar en Vivo',
        icon: Flame,
        cardBorder: 'border-pink-500/80 ring-2 ring-pink-500/40 shadow-xl shadow-pink-500/20',
        cardHover: 'hover:border-pink-400 hover:shadow-[0_0_35px_rgba(216,43,110,0.4)]',
        bgBadge: 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-black',
        priceColor: 'text-pink-400',
        savingsPill: 'bg-pink-500/20 text-pink-300 border border-pink-500/50',
        bulletDot: 'text-pink-400',
        btnPrimary: 'bg-gradient-to-r from-[#D82B6E] via-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black shadow-lg shadow-pink-500/35',
        btnSecondary: 'bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/40',
        accentRing: 'ring-pink-500/50',
        glowBg: 'from-pink-500/20 via-rose-500/10 to-transparent'
      };
    }

    const area = explicitArea || (
      promo.worlds?.includes('negocios') && !promo.code?.includes('EV') ? 'negocios' :
      promo.worlds?.includes('eventos') || promo.code?.includes('EV') ? 'eventos' :
      'hogar'
    );

    if (area === 'negocios') {
      return {
        area: 'negocios',
        label: 'Negocios & Marcas',
        icon: Briefcase,
        cardBorder: 'border-emerald-500/60 hover:border-emerald-400 shadow-lg shadow-emerald-500/10',
        cardHover: 'hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]',
        bgBadge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-black',
        priceColor: 'text-emerald-400',
        savingsPill: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
        bulletDot: 'text-emerald-400',
        btnPrimary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-500/25',
        btnSecondary: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40',
        accentRing: 'ring-emerald-400/40',
        glowBg: 'from-emerald-500/15 via-transparent to-transparent'
      };
    }

    if (area === 'eventos') {
      return {
        area: 'eventos',
        label: 'Eventos & Fiestas',
        icon: CalendarHeart,
        cardBorder: 'border-fuchsia-500/60 hover:border-fuchsia-400 shadow-lg shadow-fuchsia-500/10',
        cardHover: 'hover:border-fuchsia-400 hover:shadow-[0_0_30px_rgba(217,70,239,0.35)]',
        bgBadge: 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 text-white font-black',
        priceColor: 'text-fuchsia-400',
        savingsPill: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50',
        bulletDot: 'text-fuchsia-400',
        btnPrimary: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black shadow-lg shadow-fuchsia-500/25',
        btnSecondary: 'bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/40',
        accentRing: 'ring-fuchsia-400/40',
        glowBg: 'from-fuchsia-500/15 via-transparent to-transparent'
      };
    }

    // Default 'hogar'
    return {
      area: 'hogar',
      label: 'Hogar & Espacios',
      icon: Home,
      cardBorder: 'border-amber-500/60 hover:border-amber-400 shadow-lg shadow-amber-500/10',
      cardHover: 'hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]',
      bgBadge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black',
      priceColor: 'text-amber-400',
      savingsPill: 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
      bulletDot: 'text-amber-400',
      btnPrimary: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black shadow-lg shadow-amber-500/25',
      btnSecondary: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40',
      accentRing: 'ring-amber-400/40',
      glowBg: 'from-amber-500/15 via-transparent to-transparent'
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
        className={`bg-[#121622] rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-lg ${
          isStarred
            ? theme.cardBorder
            : isExpanded
            ? `${theme.cardBorder} ring-2 ring-white/30`
            : `${theme.cardBorder} ${theme.cardHover}`
        }`}
      >
        {/* Cinta de Paquete Estrella del Mes si aplica */}
        {isStarred && (
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-stone-950 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
              <span>Paquete Estrella del Mes</span>
            </div>
            <span className="text-[10px] bg-stone-950 text-yellow-300 px-2 py-0.2 rounded-full font-bold">
              Beneficio Exclusivo
            </span>
          </div>
        )}

        {/* Ribbon de Evento Comercial Activo afectando la promoción */}
        {hasEventCoupon && (
          <div className="bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-amber-500/20 border-b border-amber-400/30 px-3.5 py-1 flex items-center justify-between text-[11px]">
            <span className="font-bold text-stone-200 flex items-center gap-1.5 truncate">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span className="truncate">{activeMonthlyEvent.title || 'Evento Especial de Taller'}</span>
            </span>
            <span className="font-black text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.2 rounded-full shrink-0 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>{activeMonthlyEvent.couponCode} (-{eventDiscountPct}%)</span>
            </span>
          </div>
        )}

        {/* Contenido Principal con Estética de Placa Artesanal Patch Bar en Fondo Oscuro */}
        <div className="p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#181D2A] via-[#121622] to-[#121622]">
          
          {/* Fila Superior: Miniatura Cuadrada en Marco Artesanal + SKU Placa + Título */}
          <div className="flex items-start gap-3">
            <div
              onClick={() => onSelectProduct(promo)}
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#0D1017] border border-white/15 shrink-0 cursor-pointer group/thumb shadow-inner"
              title="Clic para ver fotos de estudio del paquete"
            >
              <img
                src={promo.primaryImage || promo.gallery?.[0] || promo.whiteBgImage}
                alt={promo.name}
                className="w-full h-full object-cover group-hover/thumb:scale-108 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                <Layers className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow-md" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] uppercase tracking-wider flex items-center gap-1 shadow-xs ${theme.bgBadge}`}>
                  {theme.icon && typeof theme.icon !== 'string' && <theme.icon className="w-3 h-3" />}
                  <span>{theme.label}</span>
                </span>
              </div>

              <h4
                onClick={() => onSelectProduct(promo)}
                className="font-extrabold text-sm sm:text-base text-white hover:text-amber-300 leading-snug line-clamp-2 transition-colors cursor-pointer font-heading mt-1"
                title={promo.name}
              >
                {promo.name}
              </h4>

              <div className="text-[11px] text-stone-400 capitalize truncate mt-0.5">
                {promo.worlds?.join(', ')}
              </div>
            </div>
          </div>

          {/* Bloque de Precios y Ahorro estilo Escaparate Patch Bar */}
          <div className="p-3 rounded-2xl bg-[#181D2A] border border-white/10 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 line-through mr-1.5 font-mono">${regularPrice}</span>
                <span className={`font-black text-base sm:text-lg font-mono ${hasEventCoupon ? 'text-stone-500 line-through text-xs' : theme.priceColor}`}>
                  ${promo.price} <span className="text-[10px] font-normal text-stone-400">MXN</span>
                </span>
                {hasEventCoupon && (
                  <span className={`font-black text-base sm:text-lg font-mono ml-1.5 ${theme.priceColor}`}>
                    ${eventPrice} <span className="text-[10px] font-normal text-stone-400">MXN</span>
                  </span>
                )}
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${theme.savingsPill}`}>
                Ahorro ${totalSavings} (-{totalDiscountPercent}%)
              </span>
            </div>

            {hasEventCoupon && (
              <div className="flex items-center justify-between text-[10.5px] bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-xl font-bold text-amber-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Con cupón <strong>{activeMonthlyEvent.couponCode}</strong>:</span>
                </span>
                <span className="text-emerald-400 font-black">
                  -${eventExtraSavings} MXN extra
                </span>
              </div>
            )}
          </div>

          {/* Lista "Incluye:" con badges para piezas adicionales estilo Combo */}
          {promo.includedItems && promo.includedItems.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-[11px] text-stone-300 uppercase tracking-wider flex items-center justify-between">
                <span>✦ Incluye en tu paquete:</span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Combo de Taller
                </span>
              </div>
              <ul className="space-y-1.5 text-stone-300">
                {promo.includedItems.slice(0, 3).map((item, idx) => {
                  const isAdded = item.startsWith('+');
                  return (
                    <li
                      key={idx}
                      className={`flex items-start gap-1.5 text-[11.5px] leading-snug rounded-lg p-1 ${
                        isAdded 
                          ? 'bg-emerald-500/15 text-emerald-200 font-bold border border-emerald-500/30 shadow-2xs' 
                          : 'text-stone-300'
                      }`}
                    >
                      {isAdded ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          +
                        </span>
                      ) : (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${theme.bulletDot} shrink-0 mt-0.5`} />
                      )}
                      <span className="truncate">{item.replace(/^\+\s*/, '')}</span>
                    </li>
                  );
                })}
              </ul>
              {promo.includedItems.length > 3 && (
                <div className="text-[10.5px] text-stone-400 font-semibold pl-1 flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black flex items-center justify-center">+</span>
                  <span>{promo.includedItems.length - 3} piezas y extras más en los paquetes superiores...</span>
                </div>
              )}
            </div>
          )}

          {/* Pastillas de 3 Niveles estilo Combo (Básico / Más Conveniente / Todo Incluido) */}
          <div className="flex items-center gap-1.5 pt-0.5 text-[10px] font-bold flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 border border-stone-700">
              Kit Base
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-black flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 text-stone-950 text-[8px] flex items-center justify-center font-black">+</span>
              <span>Pro (Más Conveniente)</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/40 font-black flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 text-stone-950 text-[8px] flex items-center justify-center font-black">+</span>
              <span>VIP (Todo Incluido)</span>
            </span>
          </div>

        </div>

        {/* Barra de Acciones Cliclables con botón de símbolo '+' como en los productos */}
        <div className="p-3 sm:p-4 bg-[#0D1017] border-t border-white/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectProduct(promo)}
            className={`flex-1 py-2 px-3 rounded-xl ${theme.btnPrimary} font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md`}
            title="Ver los 3 paquetes y detalles en ventana emergente"
          >
            <span>Ver 3 Paquetes &amp; Opciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleWhatsAppQuote(promo)}
            className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white transition-all cursor-pointer shadow-md shrink-0 hover:shadow-green-500/25"
            title="Cotizar paquete por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
          </button>

          {/* Botón con símbolo de más '+' como en el de los productos */}
          <button
            type="button"
            onClick={() => onSelectProduct(promo)}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-stone-200 hover:bg-white/20 hover:text-white shadow-xs hover:shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group/btn shrink-0"
            title="Ver los 3 paquetes en ventana emergente"
            aria-label="Ver 3 paquetes en ventana emergente"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.8] text-stone-200 group-hover/btn:text-white transition-all duration-200 group-hover/btn:rotate-90" />
          </button>
        </div>

        {/* Despliegue de los 3 Niveles cuando está Expandido */}
        {isExpanded && (
          <div className="p-4 bg-[#0D1017] border-t border-white/10 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-stone-200">
                Selecciona tu nivel:
              </span>
              <span className="text-[10px] text-stone-500 font-normal">
                3 opciones de taller
              </span>
            </div>

            {/* Selector de Nivel en 3 Pastillas estilo Combo */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-900 rounded-2xl border border-white/10">
              {tiers.map(tier => {
                const isSelected = activeTier.id === tier.id;
                const tierEventPrice = hasEventCoupon ? Math.round(tier.price * (1 - eventDiscountPct / 100)) : tier.price;
                const isPro = tier.id === 'pro';
                const isMaestra = tier.id === 'maestra';
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierByPackage(prev => ({ ...prev, [promo.id]: tier.id }))}
                    className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer relative ${
                      isSelected
                        ? isPro
                          ? 'bg-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-500/40'
                          : isMaestra
                          ? 'bg-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400/40'
                          : 'bg-stone-700 text-white font-black shadow-md'
                        : 'text-stone-400 hover:text-white font-semibold text-[11px]'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider block font-black opacity-90 truncate">
                      {isPro ? 'Conveniente' : isMaestra ? 'VIP' : 'Kit Base'}
                    </span>
                    <span className="text-[10px] block leading-tight truncate">{tier.name.replace('Nivel ', '')}</span>
                    <span className={`text-[10.5px] font-black block mt-0.5 font-mono ${isSelected ? (isMaestra ? 'text-stone-950' : 'text-white') : 'text-amber-400'}`}>
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
                <div className="p-3 rounded-2xl bg-[#151924] border border-white/10 space-y-2.5 text-xs text-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-white text-xs block">{activeTier.name}</span>
                      <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 inline-block mt-0.5">
                        {activeTier.tierBadge || activeTier.badge}
                      </span>
                    </div>
                    <div className="text-right">
                      {hasEventCoupon ? (
                        <>
                          <span className="font-black text-sm text-emerald-400 block font-mono">${activeTierEventPrice} MXN</span>
                          <span className="text-[10px] text-stone-500 line-through mr-1 font-mono">${activeTier.regularPrice}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Ahorras ${activeTierTotalSavings}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-black text-sm text-emerald-400 block font-mono">${activeTier.price} MXN</span>
                          <span className="text-[10px] text-stone-500 line-through mr-1 font-mono">${activeTier.regularPrice}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Ahorras ${activeTier.savings}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {activeTier.valueCallout && (
                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-200 flex items-center gap-1.5 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{activeTier.valueCallout}</span>
                    </div>
                  )}

                  {hasEventCoupon && (
                    <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-[10px] font-bold text-amber-300 flex items-center justify-between">
                      <span>Cupón {activeMonthlyEvent.couponCode} aplicado:</span>
                      <span className="text-emerald-400 font-black">-${activeTierExtraSavings} MXN extra</span>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-300 italic">
                    &ldquo;{activeTier.summary}&rdquo;
                  </p>

                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      ✦ Componentes incluidos en este nivel:
                    </span>
                    <ul className="text-[11px] space-y-1.5">
                      {activeTier.includedItems.map((item, idx) => {
                        const isAdded = item.startsWith('+');
                        return (
                          <li
                            key={idx}
                            className={`flex items-start gap-1.5 p-1 rounded-lg ${
                              isAdded
                                ? 'bg-emerald-500/15 text-emerald-200 font-bold border border-emerald-500/30 shadow-2xs'
                                : 'text-stone-300'
                            }`}
                          >
                            {isAdded ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                +
                              </span>
                            ) : (
                              <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                            )}
                            <span className="leading-snug">{item.replace(/^\+\s*/, '')}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Botones para Agregar y Cotizar el Nivel Seleccionado */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
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
                      className="flex-1 py-2 px-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Al Carrito</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppQuote(promo, activeTier)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
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
    <div className="bg-[#0B0D11] text-stone-100 min-h-screen">
      
      {/* CABECERA COMPACTA EN MODO OSCURO: Cero banners gigantes, directa a los productos sin scroll */}
      <div className="sticky top-0 z-30 bg-[#0B0D11]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D82B6E] animate-pulse"></span>
                <span className="text-[11px] font-black uppercase tracking-wider text-pink-400">
                  Kits &amp; Combos con Ahorro
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                  {allBundles.length} Paquetes
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight mt-0.5">
                Paquetes del Taller
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setPackagesSeed(Date.now())}
              className="md:hidden text-xs text-amber-400 font-bold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
              title="Girar rotación de paquetes"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Girar</span>
            </button>
          </div>

          {/* Chips de Categorías Rápidas Deslizables */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 select-none">
            {[
              { id: 'all', label: 'Todos los Paquetes', count: allBundles.length },
              { id: 'especial', label: '⭐ Selección Especial', count: especialBundles.length },
              { id: 'hogar', label: 'Hogar', count: hogarBundles.length },
              { id: 'negocios', label: 'Negocios', count: negociosBundles.length },
              { id: 'eventos', label: 'Eventos', count: eventosBundles.length },
              { id: 'servicios', label: 'Patch Bar en Vivo', count: 1, isPatchBar: true }
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? tab.isPatchBar
                        ? 'bg-gradient-to-r from-[#D82B6E] to-[#FF2D78] text-white font-black shadow-lg shadow-pink-500/30 scale-102'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20 scale-102'
                      : tab.isPatchBar
                      ? 'bg-pink-500/15 text-pink-300 border border-pink-500/40 hover:bg-pink-500/25'
                      : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected 
                      ? 'bg-black/25 text-inherit' 
                      : 'bg-white/10 text-stone-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8">

        {/* VISTA 1: TODOS LOS PAQUETES CON ROTACIÓN DINÁMICA (INCLUYE PATCH BAR) */}
        {activeAreaFilter === 'all' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <p className="text-xs sm:text-sm text-stone-400">
                Combos coordinados con descuento directo de taller. Todos los paquetes rotan dinámicamente con Patch Bar en vivo.
              </p>
              <button
                type="button"
                onClick={() => setPackagesSeed(Date.now())}
                className="hidden md:flex text-xs text-amber-400 hover:text-amber-300 font-bold items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all shadow-xs"
                title="Girar ruleta de rotación de paquetes"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Girar rotación</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {allBundles.map(bundle => renderBundleCard(bundle))}
            </div>
          </section>
        )}

        {/* SECCIÓN ESPECIAL: TEMPORADA ACTIVA & SELECCIÓN DEL MES */}
        {activeAreaFilter === 'especial' && (
          <section id="paquetes-especial" className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  <Crown className="w-4 h-4" />
                  <span>Selección Especial de Temporada</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  Paquetes Destacados del Mes
                </h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-300">
                {especialBundles.length} seleccionados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {especialBundles.map(bundle => renderBundleCard(bundle, 'especial'))}
            </div>
          </section>
        )}

        {/* SECCIÓN 1: PAQUETES DE HOGAR */}
        {activeAreaFilter === 'hogar' && (
          <section id="paquetes-hogar" className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Home className="w-4 h-4" />
                  <span>Área Hogar &amp; Decoración</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  Paquetes para el Hogar
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  Combos de recibidor, estaciones gamer/home office y kits consentidos para mascotas.
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                {hogarBundles.length} combos con descuento
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {hogarBundles.map(bundle => renderBundleCard(bundle, 'hogar'))}
            </div>
          </section>
        )}

        {/* SECCIÓN 2: PAQUETES DE NEGOCIOS */}
        {activeAreaFilter === 'negocios' && (
          <section id="paquetes-negocios" className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  <span>Área Negocios &amp; Marcas</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  Paquetes para Negocios &amp; Comercios
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  Starter packs de señalética, soportes QR para menú o cobro, placas inteligentes NFC y merchandising grabado a láser.
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                {negociosBundles.length} combos con descuento
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {negociosBundles.map(bundle => renderBundleCard(bundle, 'negocios'))}
            </div>
          </section>
        )}

        {/* SECCIÓN 3: PAQUETES DE EVENTOS ESPECIALES */}
        {activeAreaFilter === 'eventos' && (
          <section id="paquetes-eventos" className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
                  <CalendarHeart className="w-4 h-4" />
                  <span>Área Eventos Especiales</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  Paquetes de Eventos &amp; Fiestas
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  Kits nupciales, bodas, quince años, graduaciones y recuerdos coordinados todo incluido.
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300">
                {eventosBundles.length} paquetes para fiestas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {eventosBundles.map(bundle => renderBundleCard(bundle, 'eventos'))}
            </div>
          </section>
        )}

        {/* SECCIÓN 4: PATCH BAR EN VIVO DEDICADA */}
        {activeAreaFilter === 'servicios' && (
          <section id="servicios-patchbar-area" className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Servicio Estrella para Bodas y Fiestas</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  Servicio Patch Bar en Vivo (Gorras &amp; Totes)
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  Llevamos nuestro stand de madera artesanal y prensa térmica a tu evento para que tus invitados personalicen su recuerdo al momento.
                </p>
              </div>
            </div>

            {patchBarProduct && (
              <div className="max-w-md">
                {renderBundleCard(patchBarProduct, 'patchbar')}
              </div>
            )}

            <PatchBarShowcase
              onOpenPatchBarProduct={() => {
                if (patchBarProduct) onSelectProduct(patchBarProduct);
              }}
              settings={settings}
            />
          </section>
        )}

        {/* SECCIÓN INFORMATIVA DE PATCH BAR AL FINAL DE 'ALL' PARA QUIENES DESEEN EXPLORAR EL MOBILIARIO COMPLETO */}
        {activeAreaFilter === 'all' && (
          <section id="servicios-taller" className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Experiencia en Vivo para Fiestas &amp; Bodas</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                  ¿Cómo funciona el servicio de Patch Bar?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAreaFilter('servicios')}
                className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver módulo completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
