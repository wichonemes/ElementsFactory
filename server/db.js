
// Lista negra de productos eliminados permanentemente del catálogo
const DELETED_PRODUCTS_BLOCKLIST = [
  'galga-calibradora-roscas-ind2',
  'tobera-ventilacion-automotriz-ind1'
];
import { cloudDb } from './cloud-db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { MAX_DISCOUNT_PERCENT } from '../shared/costing.js';
import { packageUnitsForQuantity, normalizeUnit } from '../shared/units.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, 'data', 'db.json');

// Los paquetes y combos viven solo en el área "Paquetes" del catálogo.
// Su área comercial (Hogar, Negocios, Eventos) se guarda aparte para los filtros.
const PACKAGE_AREA_IDS = ['hogar', 'negocios', 'eventos'];

function normalizeProductAreaAssignment(product) {
  if (!product || typeof product !== 'object') return product;
  const worlds = Array.isArray(product.worlds) ? product.worlds.filter(Boolean) : [];
  const isBundle = Boolean(product.isBundle || product.category === 'paquetes' || product.category === 'servicios');
  if (isBundle) {
    const bundleAreas = Array.isArray(product.bundleAreas)
      ? product.bundleAreas.filter(area => PACKAGE_AREA_IDS.includes(area))
      : (PACKAGE_AREA_IDS.includes(product.bundleArea)
        ? [product.bundleArea]
        : worlds.filter(area => PACKAGE_AREA_IDS.includes(area)));
    return { ...product, isBundle: true, worlds: ['paquetes'], bundleAreas };
  }
  return { ...product, isBundle: false, worlds: worlds.filter(world => world !== 'paquetes') };
}

// Initial Worlds definition
const initialWorlds = [
  {
    id: 'hogar',
    name: 'Hogar',
    tagline: 'Objetos útiles, decoración y detalles personales para la vida cotidiana',
    image: '/uploads/img_002.jpg',
    description: 'Piezas diseñadas para transformar tus espacios cotidianos: organización que ahorra tiempo, decoración con personalidad propia y recuerdos que perduran.'
  },
  {
    id: 'negocios',
    name: 'Negocios',
    tagline: 'Presenta tu marca, organiza tus espacios y conecta con tus clientes',
    image: '/uploads/img_016.jpg',
    description: 'Soluciones comerciales por giro: señalética inteligente, soportes QR/NFC, organizadores para estaciones de trabajo y detalles de identidad para tus clientes.'
  },
  {
    id: 'personalizados',
    name: 'Personalizados',
    tagline: 'Tus momentos, fotos y dibujos convertidos en figuras 3D únicas',
    image: '/uploads/personalizados-figuras-funko.jpg',
    description: 'Figuras estilo Funko Pop personalizadas a partir de tus fotos con caja POP! Custom y esculturas 3D reales a partir de los dibujos de tus pequeños.'
  },
  {
    id: 'eventos',
    name: 'Eventos',
    tagline: 'Recuerdos y detalles que celebran los momentos más importantes',
    image: '/uploads/img_014.jpg',
    description: 'Elementos personalizados para bodas, bautizos, XV años, graduaciones y fechas conmemorativas. Diseñados para sorprender y ser conservados.'
  },
  {
    id: 'servicios',
    name: 'Servicios',
    tagline: 'Diseño gráfico, desarrollo web, gran formato y manufactura técnica industrial',
    image: '/uploads/brand_artesano_digital_og.jpg',
    description: 'Portafolio integral de soluciones profesionales: identidad de marca, lonas y corte de vinil por Wicho Nemes, y manufactura aditiva técnica, refacciones bajo demanda y utillaje B2B.'
  }
];

// Initial Categories Taxonomy (Empty ones remain hidden to public until products are assigned!)
const initialCategories = [
  {
    "id": "hogar-organizacion",
    "worldId": "hogar",
    "name": "Organización y almacenamiento",
    "order": 1
  },
  {
    "id": "hogar-decoracion",
    "worldId": "hogar",
    "name": "Decoración y espacios",
    "order": 2
  },
  {
    "id": "hogar-mascotas",
    "worldId": "hogar",
    "name": "Mascotas",
    "order": 3
  },
  {
    "id": "hogar-infantil",
    "worldId": "hogar",
    "name": "Juguetes y actividades infantiles",
    "order": 4
  },
  {
    "id": "hogar-estudio",
    "worldId": "hogar",
    "name": "Estudio, escritorio y home office",
    "order": 5
  },
  {
    "id": "hogar-cocina",
    "worldId": "hogar",
    "name": "Cocina y mesa",
    "order": 6
  },
  {
    "id": "hogar-regalos",
    "worldId": "hogar",
    "name": "Regalos y detalles personales",
    "order": 7
  },
  {
    "id": "hogar-hobbies",
    "worldId": "hogar",
    "name": "Hobbies y colecciones",
    "order": 8
  },
  {
    "id": "negocios-restaurantes",
    "worldId": "negocios",
    "name": "Restaurantes, cafeterías y reposterías",
    "order": 1
  },
  {
    "id": "negocios-barberias",
    "worldId": "negocios",
    "name": "Barberías, salones de belleza y uñas",
    "order": 2
  },
  {
    "id": "negocios-tiendas",
    "worldId": "negocios",
    "name": "Tiendas, boutiques y comercios",
    "order": 3
  },
  {
    "id": "negocios-joyerias",
    "worldId": "negocios",
    "name": "Joyerías y accesorios",
    "order": 4
  },
  {
    "id": "negocios-arte",
    "worldId": "negocios",
    "name": "Arte, diseño y fotografía",
    "order": 5,
    "isHidden": false
  },
  {
    "id": "negocios-veterinarias",
    "worldId": "negocios",
    "name": "Veterinarias y estéticas caninas",
    "order": 6
  },
  {
    "id": "negocios-gym",
    "worldId": "negocios",
    "name": "Gimnasios y centros deportivos",
    "order": 7
  },
  {
    "id": "negocios-oficinas",
    "worldId": "negocios",
    "name": "Oficinas, profesionales y coworking",
    "order": 8
  },
  {
    "id": "negocios-escuelas",
    "worldId": "negocios",
    "name": "Escuelas y centros de aprendizaje",
    "order": 9
  },
  {
    "id": "negocios-consultorios",
    "worldId": "negocios",
    "name": "Consultorios y bienestar",
    "order": 10
  },
  {
    "id": "negocios-hoteles",
    "worldId": "negocios",
    "name": "Hoteles, alojamientos y turismo",
    "order": 11
  },
  {
    "id": "negocios-emprendedores",
    "worldId": "negocios",
    "name": "Emprendedores, ferias y exposiciones",
    "order": 12
  },
  {
    "id": "eventos-cumpleanos",
    "worldId": "eventos",
    "name": "Cumpleaños",
    "order": 1
  },
  {
    "id": "eventos-bautizos",
    "worldId": "eventos",
    "name": "Bautizos",
    "order": 2
  },
  {
    "id": "eventos-comunion",
    "worldId": "eventos",
    "name": "Primera comunión y confirmación",
    "order": 3
  },
  {
    "id": "eventos-xvanos",
    "worldId": "eventos",
    "name": "XV años",
    "order": 4
  },
  {
    "id": "eventos-bodas",
    "worldId": "eventos",
    "name": "Bodas y aniversarios",
    "order": 5
  },
  {
    "id": "eventos-babyshower",
    "worldId": "eventos",
    "name": "Baby shower y bienvenida",
    "order": 6
  },
  {
    "id": "eventos-graduaciones",
    "worldId": "eventos",
    "name": "Graduaciones",
    "order": 7
  },
  {
    "id": "eventos-temporada",
    "worldId": "eventos",
    "name": "Celebraciones de temporada",
    "order": 8
  },
  {
    "id": "eventos-empresariales",
    "worldId": "eventos",
    "name": "Eventos empresariales",
    "order": 9
  },
  {
    "id": "eventos-otras",
    "worldId": "eventos",
    "name": "Otras celebraciones",
    "order": 10
  },
  {
    "id": "juguetes-movimiento",
    "worldId": "hogar",
    "name": "Juguetes con movimiento mecánico y acción",
    "order": 1
  },
  {
    "id": "juguetes-articulados",
    "worldId": "hogar",
    "name": "Juguetes articulados print-in-place",
    "order": 2
  },
  {
    "id": "juguetes-fidget",
    "worldId": "hogar",
    "name": "Fidget toys y rompecabezas de destreza",
    "order": 3
  },
  {
    "id": "juguetes-vehiculos",
    "worldId": "hogar",
    "name": "Autos y vehículos miniatura",
    "order": 4
  },
  {
    "id": "servicios-diseno-publicidad",
    "worldId": "servicios",
    "name": "Diseño gráfico, branding y lonas",
    "order": 1
  },
  {
    "id": "servicios-web-digital",
    "worldId": "servicios",
    "name": "Desarrollo web y modelado 3D",
    "order": 2
  },
  {
    "id": "industria-automotriz",
    "worldId": "servicios",
    "name": "Refacciones y componentes automotrices",
    "order": 3
  },
  {
    "id": "industria-calibracion",
    "worldId": "servicios",
    "name": "Herramientas de taller y galgas",
    "order": 4
  },
  {
    "id": "industria-utillaje",
    "worldId": "servicios",
    "name": "Utillaje y plantillas de ensamble",
    "order": 5
  },
  {
    "id": "industria-gabinetes",
    "worldId": "servicios",
    "name": "Prototipos 3D e ingeniería",
    "order": 6
  },
  {
    "id": "personalizados-individual",
    "worldId": "personalizados",
    "name": "Retrato Individual",
    "order": 1
  },
  {
    "id": "personalizados-mascotas",
    "worldId": "personalizados",
    "name": "Mascotas",
    "order": 2
  },
  {
    "id": "personalizados-parejas",
    "worldId": "personalizados",
    "name": "Parejas & Aniversario",
    "order": 3
  },
  {
    "id": "personalizados-profesiones",
    "worldId": "personalizados",
    "name": "Profesiones & Graduaciones",
    "order": 4
  },
  {
    "id": "personalizados-amigos",
    "worldId": "personalizados",
    "name": "Amigos & Cumpleaños",
    "order": 5
  },
  {
    "id": "personalizados-familia",
    "worldId": "personalizados",
    "name": "Pack Familiar",
    "order": 6
  },
  {
    "id": "personalizados-abuelitos",
    "worldId": "personalizados",
    "name": "Homenaje a los Abuelitos",
    "order": 7
  },
  {
    "id": "personalizados-dibujo",
    "worldId": "personalizados",
    "name": "De Dibujo a 3D",
    "order": 8
  },
  {
  "id": "clicker-mecanico-fidget-t42",
  "code": "T42",
  "name": "Clicker Mecánico Antiestrés (Fidget con Switch de Teclado)",
  "priceType": "fixed",
  "price": 89,
  "priceUnit": "pieza",
  "status": "published",
  "featured": true,
  "worlds": [
    "juegos",
    "oficina",
    "hogar"
  ],
  "categories": [
    "juguetes-fidget",
    "oficina-accesorios"
  ],
  "techniques": [
    "3d",
    "assembly"
  ],
  "primaryImage": "/uploads/t42_clicker_mecanico_contexto.webp",
  "gallery": [
    "/uploads/t42_clicker_mecanico_contexto.webp",
    "/uploads/t42_clicker_mecanico_estudio.webp"
  ],
  "shortDescription": "Juguete antiestrés clicker con switch mecánico de 3 pines tipo Outemu Blue con sonido táctil clicky y keycap impreso en 3D.",
  "fullDescription": "El juguete sensorial definitivo para oficina o setup gamer: combina un switch mecánico de teclado de 3 pines de alta durabilidad (más de 50 millones de pulsaciones) con carcasa y keycap impresos en 3D. Incorpora argolla de llavero para llevarlo a todas partes. Alivia la ansiedad y el estrés mientras trabajas o juegas.",
  "specifications": {
    "dimensions": "3.2 x 2.4 x 2.8 cm",
    "material": "PLA de alta tenacidad y switch mecánico de teclado 3 pines (Outemu Blue táctil sonoro)",
    "finish": "Textura mate ergonómica y keycap intercambiable",
    "includes": "Carcasa 3D + switch mecánico instalado + keycap decorativo + argolla metálica reforzada",
    "minQuantity": 1,
    "estimatedLeadTime": "1 a 2 días hábiles"
  },
  "variants": [
    {
      "name": "Color de carcasa",
      "options": [
        "Negro Carbón",
        "Blanco Nieve",
        "Verde Olivo Taller",
        "Azul Zafiro",
        "Terracota"
      ]
    },
    {
      "name": "Tipo de sonido / Switch",
      "options": [
        "Clicky Sonoro (Outemu Blue)",
        "Lineal Silencioso (Outemu Red)"
      ]
    }
  ],
  "stockQuantity": 25,
  "costPrice": 32,
  "costBreakdown": {
    "plaGrams": 18,
    "tpuGrams": 0,
    "otherMaterialsCost": 9.7,
    "machineHours": 0.75,
    "otherEquipCost": 0,
    "manualWorkMin": 5,
    "prepCost": 0,
    "packagingCost": 3.5,
    "additionalFailuresCost": 1.55,
    "fixedOverheadCost": 0,
    "shippingCost": 0,
    "costStatus": "Verificado Taller"
  },
  "sku": "JUG-3D-SWI-MAT-042",
  "createdAt": "2026-10-25T19:18:35.313Z",
  "updatedAt": "2026-10-25T19:18:35.313Z",
  "whiteBgImage": "/uploads/t42_clicker_mecanico_estudio.webp",
  "galleryMeta": [
    {
      "label": "1. Vista de contexto en setup gamer / escritorio",
      "shortLabel": "Contexto",
      "type": "context",
      "materialInfo": "Carcasa PLA verde olivo mate con switch mecánico táctil y keycap crema"
    },
    {
      "label": "2. Foto de estudio fondo blanco estilo Mercado Libre",
      "shortLabel": "Fondo Blanco",
      "type": "white_angle",
      "materialInfo": "Vista isométrica 45° con switch Outemu y argolla metálica reforzada"
    }
  ],
  "manufacturingRecipe": {
    "yieldUnits": 1,
    "technique": "3d",
    "notes": "Carcasa y keycap impresos en Bambu Lab A1 Mini en filamento PLA verde olivo mate y crema con switch mecánico táctil Outemu Blue de Mercado Libre y argolla metálica.",
    "lastUpdated": "2026-10-27T21:11:17.876Z",
    "machinePowerWatts": 120,
    "manufacturingTimeMinutes": 45,
    "kwhCost": 3.5,
    "energyCost": 0.78,
    "wearCost": 2.25,
    "laborTimeMinutes": 5,
    "laborRatePerHour": 60,
    "laborCost": 5,
    "items": [
      {
        "id": "item-t42-pla",
        "materialId": "mat-pla-verde-olivo",
        "name": "Filamento PLA Verde Olivo Mate y Crema Taller (PrintLab / 3D Market)",
        "category": "3d",
        "supplyType": "direct",
        "netQuantity": 18,
        "wasteQuantity": 2.7,
        "wasteType": "supports_and_purge",
        "totalQuantity": 20.7,
        "unit": "g",
        "unitCost": 0.5,
        "totalCost": 10.35
      },
      {
        "id": "item-t42-switch",
        "materialId": "mat-switches-clicker-mecanico",
        "name": "Switch Mecánico de Teclado 3 Pines Outemu Blue (Mercado Libre México MLM2097835304 con flete e importación)",
        "category": "assembly",
        "supplyType": "direct",
        "netQuantity": 1,
        "wasteQuantity": 0,
        "wasteType": "none",
        "totalQuantity": 1,
        "unit": "pieza",
        "unitCost": 7.2,
        "totalCost": 7.2
      },
      {
        "id": "item-t42-argolla",
        "materialId": "mat-argollas-llavero",
        "name": "Argolla Metálica Reforzada para Llavero con Cadena (El Rey del Tornillo)",
        "category": "assembly",
        "supplyType": "direct",
        "netQuantity": 1,
        "wasteQuantity": 0,
        "wasteType": "none",
        "totalQuantity": 1,
        "unit": "pieza",
        "unitCost": 2.5,
        "totalCost": 2.5
      },
      {
        "id": "item-t42-empaque",
        "materialId": "mat-empaque-bolsa-kraft",
        "name": "Bolsa Kraft con Ventana y Etiqueta Térmica con Código de Barras (CartoEmpaques)",
        "category": "consumables",
        "supplyType": "indirect",
        "netQuantity": 1,
        "wasteQuantity": 0,
        "wasteType": "none",
        "totalQuantity": 1,
        "unit": "pieza",
        "unitCost": 3.5,
        "totalCost": 3.5
      }
    ],
    "totalMaterialCost": 23.55,
    "totalWasteCost": 1.35,
    "packagingAndShipping": {
      "enabled": true,
      "packagingType": "bolsa_kraft",
      "packagingCost": 3.5,
      "packagingDetails": "Bolsita kraft con ventana transparente + etiqueta térmica de producto con SKU JUG-3D-SWI-MAT-042",
      "marketplaceFeeEstimated": 39.24,
      "notes": "En Mercado Libre se descuenta 16% de comisión (.24) + .00 de cargo fijo por unidad."
    }
  }
}
];

// Initial Confirmed Products from approved catalog
const initialProducts = [
  {
    "id": "leopardo-bobble-head-j1",
    "code": "J1",
    "name": "Leopardo Bobble Head con Movimiento Print-in-Place",
    "priceType": "starting_at",
    "price": 149,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": ["hogar", "juguetes"],
    "categories": [
      "juguetes-movimiento",
      "juguetes-articulados"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-j1-context-oficial.webp",
    "gallery": [
      "/uploads/catalog-v2-j1-context-oficial.webp",
      "/uploads/catalog-v2-j1-base-oficial.webp",
      "/uploads/catalog-v2-j1-detail-oficial.webp",
      "/uploads/catalog-v2-j1-scale-oficial.webp"
    ],
    "shortDescription": "Figura lúdica articulada de leopardo con cabeza oscilante sobre péndulo mecánico interno, impresa en una sola pieza sin partes desprendibles.",
    "fullDescription": "Juguete dinámico y coleccionable diseñado para cautivar tanto a niños como a amantes de los animales. Su estructura interna articulada print-in-place permite que la cabeza oscile de forma fluida y divertida con el más mínimo toque o vibración, sin requerir baterías, resortes metálicos ni pegamento. Fabricado en filamento PLA ecológico no tóxico con esquinas redondeadas para máxima seguridad infantil.",
    "specifications": {
      "dimensions": "9.5 cm de largo x 6.2 cm de ancho x 7.8 cm de alto",
      "material": "PLA Premium biodegradable no tóxico (apto para niños)",
      "finish": "Mate satinado suave al tacto con rosetas características en relieve",
      "includes": "Figura de leopardo con mecanismo pendular integrado listo para jugar",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Limpieza con paño seco o ligeramente húmedo. No sumergir en agua hirviendo ni exponer a fuego directo."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Amarillo Miel Silvestre",
          "Blanco Leopardo de las Nieves",
          "Rosa Pastel",
          "Verde Jade"
        ]
      }
    ],
    "customizationOptions": [
      "Grabado de nombre en la base (bajo pedido)",
      "Escala personalizada (mini / estándar)"
    ],
    "availability": "in_stock",
    "privateNotes": "Tiempo de impresión 2h 30m. Licencia comercial CC BY-ND autorizada por 3D_Design_Lab en MakerWorld #2906625.",
    "createdAt": "2026-10-24T12:00:00.000Z",
    "whiteBgImage": "/uploads/catalog-v2-j1-base-oficial.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-j1-detail-oficial.webp",
    "measureImage": "/uploads/catalog-v2-j1-scale-oficial.webp",
    "dimensionsImage": "/uploads/catalog-v2-j1-scale-oficial.webp",
    "stockQuantity": 12,
    "costPrice": 42.5,
    "costBreakdown": {
      "plaGrams": 67,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 2.5,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-24T12:00:00.000Z",
    "sku": "JUG-3D-PLA-MAT-001",
    "skuBreakdown": {
      "standardSku": "JUG-3D-PLA-MAT-001",
      "legacyCode": "J1",
      "area": "JUG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🧸 Juguetes & Niños",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA ecológico no tóxico",
        "acabadoTaller": "✨ Barniz / Textura Mate tersa",
        "lote": "#001"
      }
    },
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/2906625-bobble-animal-leopard#profileId-3250148",
      "makerworldModelId": "2906625",
      "author": "3D_Design_Lab",
      "license": "CC BY-ND (Commercial Use Allowed)",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\J1_Leopardo_Bobble\\leopard_bobble.3mf",
      "cloudUrl": "",
      "slicerNotes": "Capa 0.20mm, 2 paredes, 15% infill giroide, sin soportes.",
      "additionalLinks": []
    },
    "manufacturingTimes": {
      "machineHours": 2,
      "machineMinutes": 30,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 150,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "zorro-articulado-flexible-j2",
    "code": "J2",
    "name": "Zorrito Articulado Flexible Multifunción (Llavero / Imán)",
    "priceType": "starting_at",
    "price": 89,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": ["hogar", "juguetes"],
    "categories": [
      "juguetes-articulados",
      "juguetes-fidget"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-j2-context-oficial.webp",
    "gallery": [
      "/uploads/catalog-v2-j2-context-oficial.webp",
      "/uploads/catalog-v2-j2-base-oficial.webp",
      "/uploads/catalog-v2-j2-detail-oficial.webp",
      "/uploads/catalog-v2-j2-scale-oficial.webp"
    ],
    "shortDescription": "Mascota de bolsillo articulada en eslabones continuos con ranura para imán de neodimio y ojillo reforzado para llavero.",
    "fullDescription": "El accesorio infantil y juvenil más popular de manufactura aditiva. Su columna segmentada mediante rótulas integradas de una sola pieza ofrece un movimiento fluido ultra relajante (fidget toy). Diseñado con doble funcionalidad: úsalo como llavero para mochila escolar o coloca su imán en el refrigerador, pizarrón magnético o gaveta metálica.",
    "specifications": {
      "dimensions": "10.2 cm de largo x 4.5 cm de ancho x 2.2 cm de grosor",
      "material": "PLA de alta tenacidad no tóxico",
      "finish": "Bicolor satinado con detalles definidos en cola y hocico",
      "includes": "Zorrito flexible + argolla metálica reforzada de llavero + imán de neodimio N52 instalado",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Apto para uso diario en mochilas. Evitar tirones mecánicos extremos."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Naranja Zorro Tradicional",
          "Blanco Ártico Glaciar",
          "Rojo Rubí",
          "Gris Lobo Grafito"
        ]
      },
      {
        "name": "Montura",
        "options": [
          "Con argolla de llavero",
          "Con imán de neodimio",
          "Ambos (Llavero + Imán) (+ $15 MXN)"
        ]
      }
    ],
    "customizationOptions": [
      "Color personalizado a convenir"
    ],
    "availability": "in_stock",
    "privateNotes": "Tiempo de impresión 45 min. MakerWorld #552097.",
    "createdAt": "2026-10-24T12:00:00.000Z",
    "whiteBgImage": "/uploads/catalog-v2-j2-base-oficial.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-j2-detail-oficial.webp",
    "measureImage": "/uploads/catalog-v2-j2-scale-oficial.webp",
    "dimensionsImage": "/uploads/catalog-v2-j2-scale-oficial.webp",
    "stockQuantity": 20,
    "costPrice": 24.8,
    "costBreakdown": {
      "plaGrams": 28,
      "tpuGrams": 0,
      "otherMaterialsCost": 4.5,
      "machineHours": 0.8,
      "otherEquipCost": 0,
      "manualWorkMin": 3,
      "prepCost": 0,
      "packagingCost": 3,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-24T12:00:00.000Z",
    "sku": "JUG-3D-PLA-MAT-002",
    "skuBreakdown": {
      "standardSku": "JUG-3D-PLA-MAT-002",
      "legacyCode": "J2",
      "area": "JUG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "002",
      "instructionsForStaff": {
        "destino": "🧸 Juguetes & Niños",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA no tóxico",
        "acabadoTaller": "✨ Acabado Mate",
        "lote": "#002"
      }
    },
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/552097-cute-flexi-pets-fox-keychain-magnet#profileId-470570",
      "makerworldModelId": "552097",
      "author": "Valeria Momo & Mattia3D",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\J2_Zorro_Flexi\\fox_flexi.3mf",
      "cloudUrl": "",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill.",
      "additionalLinks": []
    },
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 48,
      "postProcessingMinutes": 3,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 48,
    "postProcessingTimeMinutes": 3
  },
  {
    "id": "colgador-llaves-l14",
    "code": "L14",
    "name": "Colgador de llaves Bienvenidos",
    "priceType": "fixed",
    "price": 143,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-organizacion",
      "hogar-decoracion"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-l14-context-eed2b244ab.webp",
    "gallery": [
      "/uploads/catalog-v2-l14-context-eed2b244ab.webp",
      "/uploads/catalog-v2-l14-base-421cc8218a.webp",
      "/uploads/catalog-v2-l14-detail-761d32f180.webp",
      "/uploads/catalog-v2-l14-scale-d9a15f5c0a.webp"
    ],
    "shortDescription": "Colgador de llaves en madera natural sólida con grabado láser botánico y percheros torneados.",
    "fullDescription": "Mantén organizadas tus llaves desde que entras a casa. Fabricado en madera natural sólida y triplay de pino estufado (100% libre de MDF) con grabado láser botánico de alta definición y capa protectora de barniz transparente satinado. Incluye 3 perchas torneadas resistentes y orificios discretos para montaje en pared.",
    "specifications": {
      "dimensions": "25 cm de largo x 10 cm de alto x 1.5 cm de espesor",
      "material": "Madera natural sólida y triplay de pino estufado 5.5mm (libre de MDF)",
      "finish": "Capa de barniz transparente satinado protector contra humedad y grasa",
      "includes": "3 percheros de madera y cinta de montaje alta adherencia",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 3 días hábiles",
      "careNotes": "Limpiar con paño seco o ligeramente húmedo. Madera tratada y sellada contra humedad."
    },
    "variants": [
      {
        "name": "Grabado",
        "options": [
          "\"Bienvenidos\"",
          "Apellido familiar",
          "Personalizado con nombres"
        ]
      },
      {
        "name": "Tono de Barniz",
        "options": [
          "Barniz Natural Transparente",
          "Nogal Americano",
          "Caoba Clásico",
          "Roble Claro Nórdico"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre o apellido grabado",
      "Diseño de hojas o minimalista"
    ],
    "availability": "in_stock",
    "privateNotes": "Corte y grabado en pino estufado 5.5mm. Lijado fino grano 220, capa uniforme de barniz transparente sellador contra humedad, instalación a presión de percheros torneados con gota de Resistol 850.",
    "createdAt": "2026-10-14T14:44:43.574Z",
    "whiteBgImage": "/uploads/catalog-v2-l14-base-421cc8218a.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-l14-detail-761d32f180.webp",
    "measureImage": "/uploads/catalog-v2-l14-scale-d9a15f5c0a.webp",
    "isBundle": false,
    "flashDealConfig": {
      "enabled": false,
      "durationMinutes": 120,
      "discountPercent": 15,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-16T05:47:53.103Z",
    "stockQuantity": 25,
    "costPrice": 85.5,
    "costBreakdown": {
      "plaGrams": 80,
      "tpuGrams": 0,
      "otherMaterialsCost": 15,
      "machineHours": 3.5,
      "manualWorkMin": 12,
      "packagingCost": 5,
      "costStatus": "Verificado"
    },
    "sku": "HOG-LAS-PIN-GRA-014",
    "skuBreakdown": {
      "standardSku": "HOG-LAS-PIN-GRA-014",
      "legacyCode": "L14",
      "area": "HOG",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "014",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Organización",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Pino Estufado 5.5mm (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Protector Satinado & Pulido 220",
        "lote": "#014"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-l14-scale-d9a15f5c0a.webp",
    "previousImagesBackup": null,
    "manufacturingRecipe": {
      "yieldUnits": 1,
      "technique": "laser",
      "notes": "Placa de pino estufado 5.5mm pulida con lija 220, cortada a láser con 3 percheros torneados fijados con Resistol 850 y barniz sellador.",
      "lastUpdated": "2026-10-17T15:12:59.644Z",
      "machinePowerWatts": 450,
      "manufacturingTimeMinutes": 210,
      "kwhCost": 3.5,
      "energyCost": 0.66,
      "laborTimeMinutes": 12,
      "laborRatePerHour": 75,
      "laborCost": 18.75,
      "items": [
        {
          "id": "item-l14-pino5",
          "materialId": "mat-triplay-pino-5mm",
          "name": "Madera Triplay Pino 5.5mm para Estructuras Rígidas (60x40 cm)",
          "category": "laser",
          "supplyType": "direct",
          "netQuantity": 260,
          "wasteQuantity": 60,
          "wasteType": "cut_remnants",
          "totalQuantity": 320,
          "unit": "cm²",
          "unitCost": 0.0271,
          "totalCost": 8.67
        },
        {
          "id": "item-l14-perchas",
          "materialId": "mat-percheros-madera",
          "name": "Percheros Cilíndricos Torneados de Madera Pino con Perno",
          "category": "laser",
          "supplyType": "direct",
          "netQuantity": 3,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 3,
          "unit": "pieza",
          "unitCost": 12,
          "totalCost": 36
        },
        {
          "id": "item-l14-barniz",
          "materialId": "mat-barniz-poliuretano-spray",
          "name": "Barniz Poliuretano Transparente Satinado en Spray (400 ml)",
          "category": "laser",
          "supplyType": "direct",
          "netQuantity": 5,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 5,
          "unit": "ml",
          "unitCost": 0.3375,
          "totalCost": 1.69
        },
        {
          "id": "item-l14-resistol",
          "materialId": "mat-pegamento-resistol-850",
          "name": "Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)",
          "category": "ensamble",
          "supplyType": "direct",
          "netQuantity": 6,
          "wasteQuantity": 1,
          "wasteType": "manual",
          "totalQuantity": 7,
          "unit": "gotas",
          "unitCost": 0.0085,
          "totalCost": 0.06
        },
        {
          "id": "item-l14-lija",
          "materialId": "mat-lija-madera-fina-220",
          "name": "Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)",
          "category": "consumables",
          "supplyType": "indirect",
          "netQuantity": 0.08,
          "wasteQuantity": 0.02,
          "wasteType": "manual",
          "totalQuantity": 0.1,
          "unit": "pliego",
          "unitCost": 14,
          "totalCost": 1.4
        },
        {
          "id": "item-l14-sierra",
          "materialId": "mat-desgaste-corte-sierra-laser",
          "name": "Consumible Indirecto de Corte (Desgaste Hoja Sierra / Tubo Láser CO2)",
          "category": "consumables",
          "supplyType": "indirect",
          "netQuantity": 1,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 1,
          "unit": "corte",
          "unitCost": 1.5,
          "totalCost": 1.5
        },
        {
          "id": "item-l14-estopa",
          "materialId": "mat-estopa-limpieza-taller",
          "name": "Estopa de Algodón Fino y Paños para Barnizado y Limpieza (1 kg)",
          "category": "consumables",
          "supplyType": "indirect",
          "netQuantity": 1,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 1,
          "unit": "paño",
          "unitCost": 0.8,
          "totalCost": 0.8
        },
        {
          "id": "item-l14-cinta",
          "materialId": "mat-cinta-enmascarar-laser",
          "name": "Cinta de Enmascarar Crepé Grado Láser 50mm x 50m (Protección Anti-Ahumado)",
          "category": "consumables",
          "supplyType": "indirect",
          "netQuantity": 1.5,
          "wasteQuantity": 0.2,
          "wasteType": "trimming",
          "totalQuantity": 1.7,
          "unit": "m",
          "unitCost": 0.96,
          "totalCost": 1.63
        }
      ],
      "totalMaterialCost": 51.75,
      "totalWasteCost": 2.15,
      "wastePercentAverage": 4.2,
      "packagingAndShipping": {
        "enabled": true,
        "packagingType": "caja_kraft",
        "packagingCost": 12,
        "packagingDetails": "Caja microcorrugado 30x15x6 cm + poliburbuja protectora + viruta kraft + etiqueta térmica",
        "shippingNationwideEstimated": 149,
        "shippingIncludedInPrice": false,
        "notes": "Envío estándar a cualquier parte de la República Mexicana por FedEx / Estafeta / DHL"
      }
    },
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\L14\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\L14\\",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 30,
      "postProcessingMinutes": 12,
      "leadTimeDays": "2 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 210,
    "postProcessingTimeMinutes": 12
  },
  {
    "id": "lampara-mesa-t38",
    "code": "T38",
    "name": "Lámpara de mesa moderna",
    "priceType": "fixed",
    "price": 449,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-decoracion"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/t38_vista1_contexto.webp",
    "gallery": [
      "/uploads/t38_vista1_contexto.webp",
      "/uploads/t38_vista2_fondo_blanco.webp",
      "/uploads/t38_vista3_detalle.webp",
      "/uploads/t38_vista4_medidas.webp"
    ],
    "shortDescription": "Lámpara ambiental con estructura continua en C de polímero tipo madera y pantalla cónica difusora.",
    "fullDescription": "Pieza de iluminación ambiental que combina manufactura aditiva y diseño contemporáneo. Su estructura continua en forma de C sostiene una pantalla cónica difusora que proyecta una luz cálida suave sobre escritorios, burós o credenzas.",
    "specifications": {
      "dimensions": "26 cm de altura x 18 cm de base",
      "material": "Polímero biodegradable PLA Plus de alta densidad",
      "finish": "Textura mate texturizada",
      "includes": "Socket tipo candelabro, cable trenzado de 1.5m e interruptor de paso",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 4 días hábiles",
      "careNotes": "Utilizar exclusivamente focos LED (máximo 7W) para evitar calor excesivo."
    },
    "variants": [
      {
        "name": "Color de estructura",
        "options": [
          "Arena / Nogal claro",
          "Grafito carbón",
          "Blanco tiza",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Color de cable",
      "Altura personalizada"
    ],
    "availability": "in_stock",
    "privateNotes": "Impresión en boquilla 0.6mm a 0.28 altura de capa para acabado sedoso.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/t38_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t38_vista3_detalle.webp",
    "measureImage": "/uploads/t38_vista4_medidas.webp",
    "stockQuantity": 10,
    "costPrice": 245,
    "costBreakdown": {
      "plaGrams": 140,
      "tpuGrams": 0,
      "otherMaterialsCost": 85,
      "machineHours": 7.5,
      "otherEquipCost": 0,
      "manualWorkMin": 20,
      "prepCost": 0,
      "packagingCost": 12,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "updatedAt": "2026-10-15T01:16:39.479Z",
    "flashDealConfig": {
      "enabled": false,
      "durationMinutes": 120,
      "discountPercent": 15,
      "startedAt": null,
      "expiresAt": null
    },
    "sku": "HOG-3D-PLA-MAT-038",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-038",
      "legacyCode": "T38",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "038",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#038"
      }
    },
    "dimensionsImage": "/uploads/t38_vista4_medidas.webp",
    "makerWorldModel": "https://makerworld.com/es/models/1804162-modern-lamp#profileId-1924098",
    "makerWorldAuthor": "Mesmar",
    "makerWorldProfileId": "1924098",
    "makerWorldStatus": "elegido",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/1804162-modern-lamp#profileId-1924098",
      "makerworldModelId": "1804162",
      "author": "Mesmar",
      "license": "Standard Digital File License (Comercial)",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T38_Lampara_Mesmar\\Mesmar_v2.3mf",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm, relleno 15% giroide, sin soportes.",
      "additionalLinks": []
    },
    "makerworldUrl": "https://makerworld.com/es/models/1804162-modern-lamp#profileId-1924098",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T38_Lampara_Mesmar\\Mesmar_v2.3mf",
    "manufacturingTimes": {
      "machineHours": 7,
      "machineMinutes": 30,
      "postProcessingMinutes": 20,
      "leadTimeDays": "2 a 4 días hábiles"
    },
    "manufacturingTimeMinutes": 450,
    "postProcessingTimeMinutes": 20
  },
  {
    "id": "maceta-espiral-t6",
    "code": "T6",
    "name": "Maceta espiral geométrica",
    "priceType": "starting_at",
    "price": 149,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-decoracion"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t6-context-e32a64d15d.webp",
    "gallery": [
      "/uploads/catalog-v2-t6-context-e32a64d15d.webp",
      "/uploads/catalog-v2-t6-base-144a148bde.webp",
      "/uploads/catalog-v2-t6-detail-9e43f64db8.webp",
      "/uploads/catalog-v2-t6-scale-2f06d20c1a.webp"
    ],
    "shortDescription": "Maceta decorativa con ondas en torsión espiral y orificio de drenaje opcional.",
    "fullDescription": "Maceta contemporánea de geometría helicoidal. Su diseño facetado crea juegos de sombra y luz en cualquier espacio con plantas vivas, suculentas o plantas artificiales.",
    "specifications": {
      "dimensions": "12 cm de diámetro x 11 cm de alto (para maceta 4 pulgadas)",
      "material": "PLA Premium biodegradable",
      "finish": "Satinado sedoso en tono verde salvia o terracota",
      "includes": "Platillo base a juego",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Apta para interior. Evitar exposición directa a rayos UV intensos prolongados."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Verde Salvia",
          "Blanco Mármol",
          "Grafito Mate",
          "Terracota",
          "🎨 Otro color a elegir (a convenir)"
        ]
      },
      {
        "name": "Drenaje",
        "options": [
          "Con orificio de drenaje",
          "Cubre-maceta cerrado"
        ]
      }
    ],
    "customizationOptions": [
      "Tamaño a medida (chica, mediana, grande)"
    ],
    "availability": "in_stock",
    "privateNotes": "Tiempo de impresión 4h 30m.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t6-base-144a148bde.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t6-detail-9e43f64db8.webp",
    "measureImage": "/uploads/catalog-v2-t6-scale-2f06d20c1a.webp",
    "stockQuantity": 9,
    "costPrice": 75.7,
    "costBreakdown": {
      "plaGrams": 95,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 3.75,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:38.914Z",
    "sku": "HOG-3D-PLA-MAT-006",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-006",
      "legacyCode": "T6",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "006",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#006"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t6-scale-2f06d20c1a.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/1067062",
      "makerworldModelId": "1067062",
      "author": "CrazyModding",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T6_Maceta_Espiral\\spiral_planter.3mf",
      "cloudUrl": "",
      "slicerNotes": "Pared triple (3 perímetros) para evitar fugas de agua.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/1067062",
    "makerworldUrl": "https://makerworld.com/es/models/1067062",
    "makerWorldAuthor": "CrazyModding",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T6_Maceta_Espiral\\spiral_planter.3mf",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 45,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 225,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "bandeja-vaciabolsillos-t29",
    "code": "T29",
    "name": "Bandeja vaciabolsillos ovalada",
    "priceType": "starting_at",
    "price": 149,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-organizacion",
      "negocios-joyerias"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/bandeja_vaciabolsillos_ovalada_contexto.jpg",
    "gallery": [
      "/uploads/bandeja_vaciabolsillos_ovalada_contexto.jpg",
      "/uploads/bandeja_vaciabolsillos_ovalada_white.jpg",
      "/uploads/catalog-v2-t29-detail-a425b5e774.webp",
      "/uploads/catalog-v2-t29-scale-dd0637e08b.webp"
    ],
    "shortDescription": "Bandeja con borde curvo suave para llaves, monedas, relojes o exhibición de joyería.",
    "fullDescription": "Bandeja multiusos de superficie tersa y bordes elevados. Diseñada para mantener en orden las pertenencias cotidianas en la entrada de casa, en el buró o como charola de presentación para joyería en mostradores comerciales.",
    "specifications": {
      "dimensions": "22 cm de largo x 13 cm de ancho x 2.2 cm de profundidad",
      "material": "Polímero compuesto con textura cerámica",
      "finish": "Mate suave con gomitas protectoras en la base",
      "includes": "Bandeja con base acolchada",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Limpieza con trapo suave."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Blanco hueso",
          "Verde olivo",
          "Negro carbón",
          "🎨 Otro color a elegir (a convenir)"
        ]
      },
      {
        "name": "Forma",
        "options": [
          "Ovalada",
          "Flor / Cuadrifolio"
        ]
      }
    ],
    "customizationOptions": [
      "Grabado de iniciales en el fondo"
    ],
    "availability": "in_stock",
    "privateNotes": "Utilizar relleno concéntrico al 20%.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/bandeja_vaciabolsillos_ovalada_white.jpg",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t29-detail-a425b5e774.webp",
    "measureImage": "/uploads/catalog-v2-t29-scale-dd0637e08b.webp",
    "stockQuantity": 9,
    "costPrice": 68,
    "costBreakdown": {
      "plaGrams": 80,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 3.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-3D-CER-MAT-029",
    "skuBreakdown": {
      "standardSku": "HOG-3D-CER-MAT-029",
      "legacyCode": "T29",
      "area": "HOG",
      "technique": "3D",
      "material": "CER",
      "finish": "MAT",
      "sequence": "029",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Cerámica / Vidrio - Inorgánicos",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#029"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t29-scale-dd0637e08b.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/2145890",
      "makerworldModelId": "2145890",
      "author": "Taller Propio Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T29_Bandeja_Ovalada\\tray_oval.3mf",
      "cloudUrl": "",
      "slicerNotes": "Acabado planchado superior (ironing) en la base cóncava.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/2145890",
    "makerworldUrl": "https://makerworld.com/es/models/2145890",
    "makerWorldAuthor": "Taller Propio Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T29_Bandeja_Ovalada\\tray_oval.3mf",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 195,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "marcos-imantados-3d-t2",
    "code": "T2",
    "name": "Marcos imantados para refrigerador",
    "priceType": "starting_at",
    "price": 79,
    "priceUnit": "c/u",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar",
      "eventos"
    ],
    "categories": [
      "hogar-decoracion",
      "hogar-regalos"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t2-context-b3bfb45271.webp",
    "gallery": [
      "/uploads/catalog-v2-t2-context-b3bfb45271.webp",
      "/uploads/catalog-v2-t2-base-8b6fa72344.webp",
      "/uploads/catalog-v2-t2-detail-25e3f42d09.webp",
      "/uploads/catalog-v2-t2-scale-851dae3290.webp"
    ],
    "shortDescription": "Marcos tridimensionales con potente imán de neodimio para fotos instantáneas y recuerdos.",
    "fullDescription": "Viste tu refrigerador o mampara magnética con recuerdos familiares. Su diseño biselado da profundidad visual tipo galería y permite intercambiar las fotografías fácilmente sin dañarlas.",
    "specifications": {
      "dimensions": "Para fotos tamaño Polaroid o mini prints (6.5 x 6.5 cm o 7 x 9 cm)",
      "material": "Estructura rígida en PLA con imán oculto",
      "finish": "Bicolor o monocromático mate",
      "includes": "Marco con imán y mica transparente protectora",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Evitar caídas sobre superficies duras."
    },
    "variants": [
      {
        "name": "Color de marco",
        "options": [
          "Verde bosque",
          "Blanco nórdico",
          "Grafito",
          "Dorado",
          "🎨 Otro color a elegir (a convenir)"
        ]
      },
      {
        "name": "Formato",
        "options": [
          "Cuadrado (6.5 x 6.5)",
          "Rectangular (7 x 9 cm)"
        ]
      }
    ],
    "customizationOptions": [
      "Incluye fotografía impresa si se envía en la cotización"
    ],
    "availability": "in_stock",
    "privateNotes": "Usa imán de neodimio 10x2mm.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t2-base-8b6fa72344.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t2-detail-25e3f42d09.webp",
    "measureImage": "/uploads/catalog-v2-t2-scale-851dae3290.webp",
    "stockQuantity": 12,
    "costPrice": 32,
    "costBreakdown": {
      "plaGrams": 25,
      "tpuGrams": 0,
      "otherMaterialsCost": 8,
      "machineHours": 1.2,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 3,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-3D-TEX-MAT-002",
    "skuBreakdown": {
      "standardSku": "HOG-3D-TEX-MAT-002",
      "legacyCode": "T2",
      "area": "HOG",
      "technique": "3D",
      "material": "TEX",
      "finish": "MAT",
      "sequence": "002",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#002"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t2-scale-851dae3290.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T2\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T2\\",
    "manufacturingTimes": {
      "machineHours": 1,
      "machineMinutes": 12,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 72,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "fotoboton-acrilico-s10",
    "code": "S10",
    "name": "Fotobotón acrílico con imán",
    "priceType": "starting_at",
    "price": 39,
    "priceUnit": "c/u",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "eventos"
    ],
    "categories": [
      "hogar-regalos",
      "eventos-cumpleanos"
    ],
    "techniques": [
      "sublimation",
      "sublimacion"
    ],
    "primaryImage": "/uploads/catalog-v2-s10-context-485eaf3642.webp",
    "gallery": [
      "/uploads/catalog-v2-s10-context-485eaf3642.webp",
      "/uploads/catalog-v2-s10-base-a9f0d23d3d.webp",
      "/uploads/catalog-v2-s10-detail-12ca9401e4.webp",
      "/uploads/catalog-v2-s10-scale-58977e7af8.webp"
    ],
    "shortDescription": "Botón con foto nítida encapsulada en acrílico de alto brillo con respaldo magnético.",
    "fullDescription": "Detalle económico, resistente y luminoso para recuerdos familiares, mascotas o eventos. Fotografía impresa con tintas de alta fidelidad protegidas por una cápsula de acrílico cristalino.",
    "specifications": {
      "dimensions": "5.5 cm de diámetro",
      "material": "Acrílico inyectado y disco magnético posterior",
      "finish": "Brillante ultratransparente",
      "includes": "Imán adherido listo para colocar",
      "minQuantity": 3,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "No rayar con objetos metálicos."
    },
    "variants": [
      {
        "name": "Forma",
        "options": [
          "Circular",
          "Cuadrado"
        ]
      }
    ],
    "customizationOptions": [
      "Foto proporcionada por el cliente",
      "Texto breve o fecha"
    ],
    "availability": "in_stock",
    "privateNotes": "Impresión en papel fotográfico glossy 180g.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-s10-base-a9f0d23d3d.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-s10-detail-12ca9401e4.webp",
    "measureImage": "/uploads/catalog-v2-s10-scale-58977e7af8.webp",
    "stockQuantity": 10,
    "costPrice": 16,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 13,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 2,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-15T16:11:07.555Z",
    "sku": "HOG-SUB-ACR-BRI-010",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-ACR-BRI-010",
      "legacyCode": "S10",
      "area": "HOG",
      "technique": "SUB",
      "material": "ACR",
      "finish": "BRI",
      "sequence": "010",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "☕ Sublimación Térmica (Prensa de Tazas / Plancha Térmica)",
        "materiaPrima": "🪵 Acrílico Cristal / Color - Termoplásticos",
        "acabadoTaller": "✨ Sellador Brillante / Resina - Efecto cristal brillante",
        "lote": "#010"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-s10-scale-58977e7af8.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\S10\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\S10\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "fotoiman-madera-l8",
    "code": "L8",
    "name": "Fotoimán de madera natural grabado",
    "priceType": "starting_at",
    "price": 79,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "eventos"
    ],
    "categories": [
      "hogar-decoracion",
      "hogar-regalos"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-l8-context-78caa3dc01.webp",
    "gallery": [
      "/uploads/catalog-v2-l8-context-78caa3dc01.webp",
      "/uploads/catalog-v2-l8-base-843e429d93.webp",
      "/uploads/catalog-v2-l8-detail-8fdec0405d.webp",
      "/uploads/catalog-v2-l8-scale-c92f64e638.webp"
    ],
    "shortDescription": "Retrato familiar o conmemorativo grabado a láser sobre madera natural de abedul con imán posterior.",
    "fullDescription": "Un recuerdo rústico y cálido. Tu fotografía favorita montada sobre madera natural clara de abedul (sin MDF) con esquinas redondeadas, sellada con una capa de barniz transparente satinado y grabado láser inferior para dedicatorias o nombres de la familia.",
    "specifications": {
      "dimensions": "7.5 x 7.5 cm x 4 mm de espesor",
      "material": "Madera natural de abedul / pino estufado de 3mm (sin MDF)",
      "finish": "Capa de barniz transparente protector satinado y sellado de poro",
      "includes": "Imán posterior de neodimio de alta adherencia",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Madera tratada con barniz protector contra humedad ambiental."
    },
    "variants": [
      {
        "name": "Tono de Barniz",
        "options": [
          "Barniz Natural Transparente",
          "Nogal Americano",
          "Caoba Clásico",
          "Verde Bosque Rústico"
        ]
      },
      {
        "name": "Grabado inferior",
        "options": [
          "Con dedicatoria o fecha familiar",
          "Solo fotografía grabada"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de familia",
      "Fecha conmemorativa"
    ],
    "availability": "in_stock",
    "privateNotes": "Tramado fotográfico a 300 DPI sobre madera clara de abedul/pino estufado. Capa selladora de barniz transparente para fijar tonalidad y colocación de imán de neodimio N52 al reverso.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-l8-base-843e429d93.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-l8-detail-8fdec0405d.webp",
    "measureImage": "/uploads/catalog-v2-l8-scale-c92f64e638.webp",
    "stockQuantity": 10,
    "costPrice": 25,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 16,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-15T16:11:09.163Z",
    "sku": "HOG-LAS-PIN-GRA-008",
    "skuBreakdown": {
      "standardSku": "HOG-LAS-PIN-GRA-008",
      "legacyCode": "L8",
      "area": "HOG",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "008",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Recuerdos",
        "maquinaria": "⚡ Grabado Láser CO2 (Fotográfico)",
        "materiaPrima": "🪵 Madera Natural Abedul / Pino 3mm (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Protector Satinado",
        "lote": "#008"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-l8-scale-c92f64e638.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\L8\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\L8\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "llavero-camarita-l9",
    "code": "L9",
    "name": "Llavero Camarita de madera con foto y borla",
    "priceType": "fixed",
    "price": 100,
    "priceUnit": "c/u",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar",
      "eventos"
    ],
    "categories": [
      "hogar-regalos",
      "eventos-cumpleanos",
      "eventos-bodas"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-l9-context-fcbd753172.webp",
    "gallery": [
      "/uploads/catalog-v2-l9-context-fcbd753172.webp",
      "/uploads/catalog-v2-l9-base-ef65055ee0.webp",
      "/uploads/catalog-v2-l9-detail-58334a3c01.webp",
      "/uploads/catalog-v2-l9-scale-6760c3ae5c.webp"
    ],
    "shortDescription": "Llavero artesanal en madera natural con forma de cámara retro, foto personalizada en visor y borla sedosa.",
    "fullDescription": "Nuestra pieza icónica para regalar: fabricada artesanalmente en madera natural de abedul y pino estufado (sin MDF) con corte y grabado láser fino, protegida con barniz transparente hidrófugo y tintes para madera en tonos vintage (Nogal Americano, Verde Bosque, Azul Colonial o Caoba). Lleva tu fotografía miniatura protegida en el visor y una borla decorativa sedosa. Paquete especial de 3 camaritas por $200.",
    "specifications": {
      "dimensions": "4.5 x 3.5 cm x 6 mm de espesor",
      "material": "Madera natural de abedul y pino estufado de 3mm (100% libre de MDF)",
      "finish": "Capa protectora de barniz transparente sellador repelente a humedad y tintes para madera",
      "includes": "Argolla metálica reforzada con cadena, fotografía mini en visor y borla sedosa artesanal",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Limpiar con paño seco. Acabado hidrófugo resistente a salpicaduras."
    },
    "variants": [
      {
        "name": "Tono de Barniz y Acabado",
        "options": [
          "Barniz Natural Transparente",
          "Nogal Americano",
          "Verde Bosque Rústico",
          "Azul Colonial Vintage",
          "Caoba Clásico"
        ]
      },
      {
        "name": "Promoción",
        "options": [
          "Individual ($100)",
          "Paquete 3 Camaritas ($200)"
        ]
      }
    ],
    "customizationOptions": [
      "Fotografía del cliente en visor",
      "Color de borla a elegir"
    ],
    "availability": "in_stock",
    "privateNotes": "Madera de abedul/pino selecta 3mm. Lijado suave grano 220, grabado nítido sin quemaduras. Aplicar capa de barniz protector transparente o tinte de madera elegido. Montar argolla metálica reforzada con eslabón y borla sedosa.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-l9-base-ef65055ee0.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-l9-detail-58334a3c01.webp",
    "measureImage": "/uploads/catalog-v2-l9-scale-6760c3ae5c.webp",
    "stockQuantity": 10,
    "costPrice": 29,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 16,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 3,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-15T16:11:11.859Z",
    "sku": "HOG-LAS-PIN-GRA-009",
    "skuBreakdown": {
      "standardSku": "HOG-LAS-PIN-GRA-009",
      "legacyCode": "L9",
      "area": "HOG",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "009",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Regalos Personales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Pino / Abedul 3mm (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Sellador & Tintes de Madera",
        "lote": "#009"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-l9-scale-6760c3ae5c.webp",
    "manufacturingRecipe": {
      "yieldUnits": 1,
      "notes": "Madera natural selecta 3mm cortada a láser, barniz transparente protector y argolla metálica con borla",
      "lastUpdated": "2026-10-17T05:15:23.781Z",
      "items": [
        {
          "id": "item-l9-madera",
          "materialId": "mat-madera-abedul-3mm",
          "name": "Madera Abedul / Pino Calidad Láser Selecta 3mm (60x40 cm)",
          "category": "laser",
          "netQuantity": 65,
          "wasteQuantity": 15,
          "wasteType": "cut_remnants",
          "totalQuantity": 80,
          "unit": "cm²",
          "unitCost": 0.0242,
          "totalCost": 1.94
        },
        {
          "id": "item-l9-barniz",
          "materialId": "mat-barniz-poliuretano-spray",
          "name": "Barniz Poliuretano Transparente Satinado en Spray (400 ml)",
          "category": "laser",
          "netQuantity": 2,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 2,
          "unit": "ml",
          "unitCost": 0.3375,
          "totalCost": 0.68
        },
        {
          "id": "item-l9-argolla",
          "materialId": "mat-argollas-llavero",
          "name": "Argollas Metálicas Niqueladas con Cadena y Eslabón (100 pzas)",
          "category": "laser",
          "netQuantity": 1,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 1,
          "unit": "pza",
          "unitCost": 1.2,
          "totalCost": 1.2
        },
        {
          "id": "item-l9-resistol",
          "materialId": "mat-pegamento-resistol-850",
          "name": "Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)",
          "category": "ensamble",
          "netQuantity": 4,
          "wasteQuantity": 0,
          "wasteType": "none",
          "totalQuantity": 4,
          "unit": "gotas",
          "unitCost": 0.0085,
          "totalCost": 0.03
        }
      ],
      "totalMaterialCost": 3.85,
      "manufacturingTimeMinutes": 20,
      "laborTimeMinutes": 15
    },
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\L9\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\L9\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "organizador-modular-t37",
    "code": "T37",
    "name": "Organizador modular de escritorio",
    "priceType": "quote",
    "price": null,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar",
      "negocios"
    ],
    "categories": [
      "hogar-estudio",
      "negocios-oficinas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t37-context-dcaee39493.webp",
    "gallery": [
      "/uploads/catalog-v2-t37-context-dcaee39493.webp",
      "/uploads/catalog-v2-t37-base-693a2ab526.webp",
      "/uploads/catalog-v2-t37-detail-4d0b5d7675.webp",
      "/uploads/catalog-v2-t37-scale-7611b67469.webp"
    ],
    "shortDescription": "Estación de organización con soporte para celular, ranuras de plumas, clips y cables.",
    "fullDescription": "Despeja tu mesa de trabajo con este organizador de líneas limpias. Cuenta con inclinación frontal para ver notificaciones en el celular mientras se carga, compartimentos escalonados para bolígrafos y charola frontal para notas y clips.",
    "specifications": {
      "dimensions": "20 cm de ancho x 12 cm de profundidad x 9 cm de alto",
      "material": "Polímero técnico texturizado",
      "finish": "Verde oliva mate o grafito",
      "includes": "Bases de goma antideslizantes",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 4 días hábiles",
      "careNotes": "Limpiar con microfibra."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Verde Olivo",
          "Grafito Carbón",
          "Gris Perla",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo en bajorrelieve",
      "Iniciales grabadas"
    ],
    "availability": "in_stock",
    "privateNotes": "Configuración modular en 2 partes encajables.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t37-base-693a2ab526.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t37-detail-4d0b5d7675.webp",
    "measureImage": "/uploads/catalog-v2-t37-scale-7611b67469.webp",
    "stockQuantity": 10,
    "costPrice": 140,
    "costBreakdown": {
      "plaGrams": 160,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 5.5,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 10,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-3D-PLA-MAT-037",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-037",
      "legacyCode": "T37",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "037",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#037"
      }
    },
    "updatedAt": "2026-10-15T16:11:14.163Z",
    "dimensionsImage": "/uploads/catalog-v2-t37-scale-7611b67469.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/2087519",
      "makerworldModelId": "2087519",
      "author": "Meyui",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T37_Organizador_Meyui\\modular_desk_organizer.3mf",
      "cloudUrl": "",
      "slicerNotes": "Set de 4 módulos ensamblables sobre charola base.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/2087519",
    "makerworldUrl": "https://makerworld.com/es/models/2087519",
    "makerWorldAuthor": "Meyui",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T37_Organizador_Meyui\\modular_desk_organizer.3mf",
    "manufacturingTimes": {
      "machineHours": 5,
      "machineMinutes": 30,
      "postProcessingMinutes": 15,
      "leadTimeDays": "2 a 4 días hábiles"
    },
    "manufacturingTimeMinutes": 330,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "sujetacables-escritorio-t12",
    "code": "T12",
    "name": "Sujetacables minimalistas para escritorio",
    "priceType": "starting_at",
    "price": 59,
    "priceUnit": "c/u",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios"
    ],
    "categories": [
      "hogar-estudio",
      "negocios-oficinas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t12-context-2d2b4e982f.webp",
    "gallery": [
      "/uploads/catalog-v2-t12-context-2d2b4e982f.webp",
      "/uploads/catalog-v2-t12-base-af70cc5462.webp",
      "/uploads/catalog-v2-t12-detail-c0d042f128.webp",
      "/uploads/catalog-v2-t12-scale-097fdf5ecc.webp"
    ],
    "shortDescription": "Bloques pasacables para sujetar cables USB, cargadores y HDMI en el borde de tu mesa.",
    "fullDescription": "Evita que los cargadores caigan detrás del escritorio al desconectar tus dispositivos. Diseño con guía elástica que sujeta cables gruesos y delgados firmemente.",
    "specifications": {
      "dimensions": "2.5 x 2.5 x 2 cm",
      "material": "PLA de alta flexibilidad / dureza",
      "finish": "Mate con grabado de isotipo opcional",
      "includes": "Adhesivo desmontable 3M extrafuerte",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Adherir sobre superficies lisas y limpias."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Blanco hueso",
          "Verde olivo",
          "Negro",
          "Madera",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo corporativo grabado",
      "Paquetes de 2, 4 o 6 piezas"
    ],
    "availability": "in_stock",
    "privateNotes": "Venta por unidad o blister institucional.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t12-base-af70cc5462.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t12-detail-c0d042f128.webp",
    "measureImage": "/uploads/catalog-v2-t12-scale-097fdf5ecc.webp",
    "stockQuantity": 13,
    "costPrice": 24,
    "costBreakdown": {
      "plaGrams": 20,
      "tpuGrams": 0,
      "otherMaterialsCost": 4,
      "machineHours": 0.83,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 3,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:39.059Z",
    "sku": "HOG-3D-PLA-GRA-012",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-GRA-012",
      "legacyCode": "T12",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "GRA",
      "sequence": "012",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#012"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t12-scale-097fdf5ecc.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/1810947",
      "makerworldModelId": "1810947",
      "author": "m@",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T12_Sujetacables\\cable_holder_faceted.3mf",
      "cloudUrl": "",
      "slicerNotes": "Relleno 20% para rigidez en ranuras de cable.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/1810947",
    "makerworldUrl": "https://makerworld.com/es/models/1810947",
    "makerWorldAuthor": "m@",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T12_Sujetacables\\cable_holder_faceted.3mf",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 50,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 50,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "identificador-escritorio-l4",
    "code": "L4",
    "name": "Nombre de escritorio en madera maciza",
    "priceType": "fixed",
    "price": 108,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "negocios",
      "hogar",
      "eventos"
    ],
    "categories": [
      "negocios-oficinas",
      "hogar-estudio"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-l4-context-277d324e3e.webp",
    "gallery": [
      "/uploads/catalog-v2-l4-context-277d324e3e.webp",
      "/uploads/catalog-v2-l4-base-3f8725aa08.webp",
      "/uploads/catalog-v2-l4-detail-38817792c1.webp",
      "/uploads/catalog-v2-l4-scale-43c3f7ca9a.webp"
    ],
    "shortDescription": "Bloque prismático de madera biselada con nombre, profesión y logotipo grabados.",
    "fullDescription": "El detalle de distinción para oficinas, recepciones, directivos y profesionistas independientes. Fabricado en bloque macizo cepillado con cantos biselados y grabado láser profundo.",
    "specifications": {
      "dimensions": "18 cm de largo x 4.5 cm de alto x 4 cm de base triangular",
      "material": "Madera natural maciza de pino estufado o nogal americano (sin MDF)",
      "finish": "Capa de barniz transparente satinado y aceite sellador de grano fino",
      "includes": "Grabado personalizado en una o dos líneas",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Nutrir la madera una vez al año con aceite mineral."
    },
    "variants": [
      {
        "name": "Tono de Barniz y Madera",
        "options": [
          "Barniz Natural Pino Claro",
          "Nogal Americano Cálido",
          "Caoba Clásico",
          "Roble Claro Nórdico"
        ]
      },
      {
        "name": "Tipografía",
        "options": [
          "Moderna sin serifa",
          "Elegante cursiva",
          "Institucional mayúsculas"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre del profesionista",
      "Cargo o especialidad",
      "Logotipo vectorial"
    ],
    "availability": "made_to_order",
    "privateNotes": "Corte y biselado en madera maciza. Grabado láser de precisión y acabado satinado con barniz transparente.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-l4-base-3f8725aa08.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-l4-detail-38817792c1.webp",
    "measureImage": "/uploads/catalog-v2-l4-scale-43c3f7ca9a.webp",
    "stockQuantity": 0,
    "costPrice": 65,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 42,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "updatedAt": "2026-10-14T23:56:58.023Z",
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "sku": "HOG-LAS-PIN-GRA-004",
    "skuBreakdown": {
      "standardSku": "HOG-LAS-PIN-GRA-004",
      "legacyCode": "L4",
      "area": "HOG",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "004",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Maciza Pino / Nogal (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Satinado",
        "lote": "#004"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-l4-scale-43c3f7ca9a.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\L4\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\L4\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "soporte-celular-t10",
    "code": "T10",
    "name": "Soporte vertical para celular",
    "priceType": "fixed",
    "price": 99,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios"
    ],
    "categories": [
      "hogar-estudio",
      "negocios-oficinas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/t10_vista1_contexto.webp",
    "gallery": [
      "/uploads/t10_vista1_contexto.webp",
      "/uploads/t10_vista2_fondo_blanco.webp",
      "/uploads/t10_vista3_detalle.webp",
      "/uploads/t10_vista4_medidas.webp"
    ],
    "shortDescription": "Base vertical con ángulo óptimo de lectura y ranura de paso de cable inferior.",
    "fullDescription": "Soporte estilizado compatible con cualquier teléfono con o sin funda. Permite mantener la pantalla a la vista para videollamadas, reloj de mesa o seguimiento de notificaciones mientras se carga el dispositivo.",
    "specifications": {
      "dimensions": "10 cm de alto x 7 cm de base x 8 cm de profundidad",
      "material": "PLA técnico de alta rigidez",
      "finish": "Grafito carbón o verde con textura rayada sutil",
      "includes": "Gomas antiderrapantes en la base",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "No exponer a fuentes de calor directo como estufas."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Negro Grafito",
          "Verde Olivo",
          "Blanco Ártico",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Iniciales grabadas en el respaldo"
    ],
    "availability": "in_stock",
    "privateNotes": "Pieza rápida de reposición continua.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/t10_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t10_vista3_detalle.webp",
    "measureImage": "/uploads/t10_vista4_medidas.webp",
    "stockQuantity": 15,
    "costPrice": 48.6,
    "costBreakdown": {
      "plaGrams": 60,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 0.92,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:52.818Z",
    "sku": "HOG-3D-PLA-MAT-010",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-010",
      "legacyCode": "T10",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "010",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#010"
      }
    },
    "dimensionsImage": "/uploads/t10_vista4_medidas.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/1087279",
      "makerworldModelId": "1087279",
      "author": "mgm86",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T10_Soporte_mgm86\\phone_stand_print_in_place.3mf",
      "cloudUrl": "",
      "slicerNotes": "Print-in-place, tolerancia 0.3mm, sin soportes.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/1087279",
    "makerworldUrl": "https://makerworld.com/es/models/1087279",
    "makerWorldAuthor": "mgm86",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T10_Soporte_mgm86\\phone_stand_print_in_place.3mf",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 55,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 55,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "portalapices-facetado-t11",
    "code": "T11",
    "name": "Portalápices facetado geométrico",
    "priceType": "fixed",
    "price": 100,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios"
    ],
    "categories": [
      "hogar-estudio",
      "negocios-oficinas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t11-context-0bc4bb00dd.webp",
    "gallery": [
      "/uploads/catalog-v2-t11-context-0bc4bb00dd.webp",
      "/uploads/catalog-v2-t11-base-b83c485fcd.webp",
      "/uploads/catalog-v2-t11-detail-033ea519c7.webp",
      "/uploads/catalog-v2-t11-scale-6b24250991.webp"
    ],
    "shortDescription": "Vaso portalápices con diseño poligonal facetado que juega con las luces de la oficina.",
    "fullDescription": "Portalápices y organizador de tijeras o pinceles con estructura de caras poliédricas. Su centro de gravedad bajo y boca amplia garantizan estabilidad y fácil acceso a tus herramientas de trabajo.",
    "specifications": {
      "dimensions": "9 cm de diámetro x 10 cm de altura",
      "material": "PLA de alta definición",
      "finish": "Blanco perla mate / Mármol",
      "includes": "Base sólida pesada",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar con agua fría si se mancha con tinta."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Blanco Mármol",
          "Verde Jade",
          "Grafito Mate",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Tamaño estándar o maxi"
    ],
    "availability": "in_stock",
    "privateNotes": "Infill al 15% grid.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t11-base-b83c485fcd.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t11-detail-033ea519c7.webp",
    "measureImage": "/uploads/catalog-v2-t11-scale-6b24250991.webp",
    "stockQuantity": 12,
    "costPrice": 60.2,
    "costBreakdown": {
      "plaGrams": 75,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 3,
      "otherEquipCost": 0,
      "manualWorkMin": 4,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "updatedAt": "2026-10-15T01:16:34.503Z",
    "sku": "HOG-3D-PLA-MAT-011",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-011",
      "legacyCode": "T11",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "011",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#011"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t11-scale-6b24250991.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T11\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T11\\",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 0,
      "postProcessingMinutes": 4,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 180,
    "postProcessingTimeMinutes": 4
  },
  {
    "id": "panel-nfc-inteligente-t39",
    "code": "T39",
    "name": "Panel NFC inteligente para escritorio o negocio",
    "priceType": "quote",
    "price": null,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar",
      "negocios"
    ],
    "categories": [
      "hogar-estudio",
      "negocios-oficinas",
      "negocios-emprendedores"
    ],
    "techniques": [
      "nfc",
      "3d"
    ],
    "primaryImage": "/uploads/kit_home_office_gamer_contexto.jpg",
    "gallery": [
      "/uploads/kit_home_office_gamer_contexto.jpg",
      "/uploads/catalog-v2-t39-base-ea2a67514c.webp",
      "/uploads/catalog-v2-t39-detail-aa6679e7ee.webp",
      "/uploads/catalog-v2-t39-scale-3e82285bdd.webp"
    ],
    "shortDescription": "Base de botones inteligentes con chips NFC para automatizaciones: música, luz, contacto o WiFi.",
    "fullDescription": "Lleva la tecnología NFC a tu espacio. Con solo acercar tu celular a cada botón iconográfico, se dispara una acción automática: abrir una playlist de Spotify, activar el modo concentración, encender luces inteligentes o abrir el enlace de cobro y contacto de tu marca.",
    "specifications": {
      "dimensions": "22 cm de largo x 6 cm de profundidad x 4 cm de altura",
      "material": "Cuerpo compuesto de base oscura con teclas de colores intercambiables",
      "finish": "Iconos en bajorrelieve y chips NTAG215 reescribibles",
      "includes": "5 botones NFC preconfigurados o libres para programar",
      "minQuantity": 1,
      "estimatedLeadTime": "4 a 6 días hábiles",
      "careNotes": "Los chips NFC no requieren batería ni mantenimiento."
    },
    "variants": [
      {
        "name": "Configuración de teclas",
        "options": [
          "Oficina (Música, Luz, Audio, Pausa, Concentración)",
          "Negocio (Menú, Contacto, Reseñas, Pago, Redes)",
          "Personalizada"
        ]
      }
    ],
    "customizationOptions": [
      "Grabado de marca en la base",
      "Enlaces URLs precargados en cada botón"
    ],
    "availability": "in_stock",
    "privateNotes": "Verificar lectura con app NFC Tools en iOS y Android antes del envío.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t39-base-ea2a67514c.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t39-detail-aa6679e7ee.webp",
    "measureImage": "/uploads/catalog-v2-t39-scale-3e82285bdd.webp",
    "stockQuantity": 10,
    "costPrice": 185,
    "costBreakdown": {
      "plaGrams": 120,
      "tpuGrams": 0,
      "otherMaterialsCost": 80,
      "machineHours": 4.5,
      "otherEquipCost": 0,
      "manualWorkMin": 20,
      "prepCost": 0,
      "packagingCost": 15,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-NFC-PLA-NFC-039",
    "skuBreakdown": {
      "standardSku": "HOG-NFC-PLA-NFC-039",
      "legacyCode": "T39",
      "area": "HOG",
      "technique": "NFC",
      "material": "PLA",
      "finish": "NFC",
      "sequence": "039",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "📶 Tecnología NFC Programada (Estación de Codificación NFC)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Chip NFC Integrado & Enlace - Programado con URL o contacto",
        "lote": "#039"
      }
    },
    "updatedAt": "2026-10-15T16:11:17.279Z",
    "dimensionsImage": "/uploads/catalog-v2-t39-scale-3e82285bdd.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T39\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T39\\",
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 30,
      "postProcessingMinutes": 20,
      "leadTimeDays": "4 a 6 días hábiles"
    },
    "manufacturingTimeMinutes": 270,
    "postProcessingTimeMinutes": 20
  },
  {
    "id": "soporte-gamer-t7",
    "code": "T7",
    "name": "Soporte gamer para audífonos y mando",
    "priceType": "starting_at",
    "price": 199,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-hobbies",
      "hogar-estudio"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t7-context-cff93667c7.webp",
    "gallery": [
      "/uploads/catalog-v2-t7-context-cff93667c7.webp",
      "/uploads/catalog-v2-t7-base-af05fc0d64.webp",
      "/uploads/catalog-v2-t7-detail-4284fc71a1.webp",
      "/uploads/catalog-v2-t7-scale-c7ede558e5.webp"
    ],
    "shortDescription": "Torre de descanso para auriculares over-ear y soporte frontal para control de consola o PC.",
    "fullDescription": "Organiza tu set-up de videojuegos o trabajo. Mantiene los audífonos libres de presión innecesaria en las almohadillas y tu mando favorito siempre en posición lista para jugar.",
    "specifications": {
      "dimensions": "25 cm de altura x 14 cm de base",
      "material": "PLA técnico con nervaduras internas reforzadas",
      "finish": "Negro mate con acento de color a elección",
      "includes": "Base lastrada con gomas para evitar volcaduras",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 4 días hábiles",
      "careNotes": "Apto para mandos de Xbox, PlayStation, Switch Pro y genéricos."
    },
    "variants": [
      {
        "name": "Color de acento",
        "options": [
          "Negro total",
          "Acento Verde",
          "Acento Magenta",
          "Acento Blanco",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Gamertag o apodo grabado en la base"
    ],
    "availability": "made_to_order",
    "privateNotes": "Diseño estructural con refuerzo en el gancho superior.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t7-base-af05fc0d64.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t7-detail-4284fc71a1.webp",
    "measureImage": "/uploads/catalog-v2-t7-scale-c7ede558e5.webp",
    "stockQuantity": 0,
    "costPrice": 103,
    "costBreakdown": {
      "plaGrams": 130,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 5.5,
      "otherEquipCost": 0,
      "manualWorkMin": 8,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-3D-PLA-MAT-007",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-007",
      "legacyCode": "T7",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "007",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#007"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t7-scale-c7ede558e5.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T7\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T7\\",
    "manufacturingTimes": {
      "machineHours": 5,
      "machineMinutes": 30,
      "postProcessingMinutes": 8,
      "leadTimeDays": "3 a 4 días hábiles"
    },
    "manufacturingTimeMinutes": 330,
    "postProcessingTimeMinutes": 8
  },
  {
    "id": "soporte-qr-t16",
    "code": "T16",
    "name": "Soporte de mostrador para código QR comercial",
    "priceType": "starting_at",
    "price": 199,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-restaurantes",
      "negocios-barberias",
      "negocios-tiendas",
      "negocios-emprendedores"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/t16_vista1_contexto.webp",
    "gallery": [
      "/uploads/t16_vista1_contexto.webp",
      "/uploads/t16_vista2_fondo_blanco.webp",
      "/uploads/t16_vista3_detalle.webp",
      "/uploads/t16_vista4_medidas.webp"
    ],
    "shortDescription": "Placa vertical con código QR de alto relieve bi-tono y logotipo corporativo de tu negocio.",
    "fullDescription": "Permite a tus clientes consultar el menú digital, dejar reseñas en Google, transferir por SPEI o seguir tus redes sociales con un simple escaneo. El código QR está modelado tridimensionalmente en contraste óptico perfecto para una lectura veloz con cualquier cámara.",
    "specifications": {
      "dimensions": "14 cm de alto x 9 cm de ancho x 5 cm de base",
      "material": "Doble capa de PLA en contraste mate",
      "finish": "Biselado con logotipo personalizado en la base",
      "includes": "Placa grabada y código QR vectorizado de tu enlace",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Resistente a salpicaduras. Limpiar con paño húmedo."
    },
    "variants": [
      {
        "name": "Color de base",
        "options": [
          "Verde bosque",
          "Negro carbón",
          "Madera nogal",
          "Blanco",
          "🎨 Otro color a elegir (a convenir)"
        ]
      },
      {
        "name": "Función principal",
        "options": [
          "Menú digital",
          "Pago / Transferencia",
          "Reseñas de Google",
          "Redes sociales"
        ]
      }
    ],
    "customizationOptions": [
      "Generación del código QR con tu URL",
      "Logotipo de tu marca al frente"
    ],
    "availability": "made_to_order",
    "privateNotes": "Validar lectura del QR a 30 cm de distancia antes de embalar.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/t16_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t16_vista3_detalle.webp",
    "measureImage": "/uploads/t16_vista4_medidas.webp",
    "stockQuantity": 0,
    "costPrice": 96.9,
    "costBreakdown": {
      "plaGrams": 90,
      "tpuGrams": 0,
      "otherMaterialsCost": 25,
      "machineHours": 1.5,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "NEG-3D-PLA-MAT-016",
    "skuBreakdown": {
      "standardSku": "NEG-3D-PLA-MAT-016",
      "legacyCode": "T16",
      "area": "NEG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "016",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#016"
      }
    },
    "dimensionsImage": "/uploads/t16_vista4_medidas.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/2401859",
      "makerworldModelId": "2401859",
      "author": "PhantomCommit",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T16_Cartel_QR_PhantomCommit\\qr_stand_dual_color.3mf",
      "cloudUrl": "",
      "slicerNotes": "Cambio de color en capa 14 para contraste negro/blanco.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/2401859",
    "makerworldUrl": "https://makerworld.com/es/models/2401859",
    "makerWorldAuthor": "PhantomCommit",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T16_Cartel_QR_PhantomCommit\\qr_stand_dual_color.3mf",
    "manufacturingTimes": {
      "machineHours": 1,
      "machineMinutes": 30,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 90,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "servilletero-botanico-t26",
    "code": "T26",
    "name": "Servilletero de diseño botánico para mesa",
    "priceType": "starting_at",
    "price": 169,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-cocina",
      "negocios-restaurantes"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t26-context-4612689eba.webp",
    "gallery": [
      "/uploads/catalog-v2-t26-context-4612689eba.webp",
      "/uploads/catalog-v2-t26-base-85b806edfd.webp",
      "/uploads/catalog-v2-t26-detail-d1b53a8f75.webp",
      "/uploads/catalog-v2-t26-scale-fd71a1e6b8.webp"
    ],
    "shortDescription": "Servilletero estilizado con calado botánico para mesas de cafetería o comedor.",
    "fullDescription": "Elegancia funcional para restaurantes, cafeterías o el comedor familiar. Mantiene las servilletas firmes y verticales gracias a sus paredes con silueta de follaje estilizado.",
    "specifications": {
      "dimensions": "13 cm de largo x 5 cm de ancho x 9 cm de alto",
      "material": "PLA rígido apto para contacto alimentario indirecto",
      "finish": "Blanco hueso mate o verde olivo",
      "includes": "Servilletero completo con base antideslizante",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 3 días hábiles",
      "careNotes": "Lavar a mano con esponja suave."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Blanco Hueso",
          "Verde Olivo",
          "Negro Mate",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo del restaurante en la base"
    ],
    "availability": "in_stock",
    "privateNotes": "Ideal para cafeterías con estilo natural.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t26-base-85b806edfd.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t26-detail-d1b53a8f75.webp",
    "measureImage": "/uploads/catalog-v2-t26-scale-fd71a1e6b8.webp",
    "stockQuantity": 10,
    "costPrice": 86.4,
    "costBreakdown": {
      "plaGrams": 110,
      "tpuGrams": 0,
      "otherMaterialsCost": 0,
      "machineHours": 4.5,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:17:12.636Z",
    "sku": "HOG-3D-PLA-MAT-026",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-026",
      "legacyCode": "T26",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "026",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#026"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t26-scale-fd71a1e6b8.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T26\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T26\\",
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 30,
      "postProcessingMinutes": 5,
      "leadTimeDays": "2 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 270,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "numero-mesa-t25",
    "code": "T25",
    "name": "Número de mesa tridimensional con base",
    "priceType": "starting_at",
    "price": 129,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "negocios",
      "eventos"
    ],
    "categories": [
      "negocios-restaurantes",
      "eventos-bodas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t25-context-5774c0072b.webp",
    "gallery": [
      "/uploads/catalog-v2-t25-context-5774c0072b.webp",
      "/uploads/catalog-v2-t25-base-3ffc446e6b.webp",
      "/uploads/catalog-v2-t25-detail-93cbff8d4b.webp",
      "/uploads/catalog-v2-t25-scale-eeadbf2eb7.webp"
    ],
    "shortDescription": "Número en relieve 3D sobre peana independiente para restaurantes o mesas de boda.",
    "fullDescription": "Indispensable para identificar mesas con buen gusto en banquetes de boda, aniversarios o salones de restaurante. Tipografía voluminosa en dos tonos con excelente visibilidad a distancia.",
    "specifications": {
      "dimensions": "12 cm de alto total con base",
      "material": "Polímero bicolor de alta precisión",
      "finish": "Números en relieve claro sobre pedestal verde oliva o madera",
      "includes": "Número y base encastrable",
      "minQuantity": 5,
      "estimatedLeadTime": "3 a 5 días hábiles según cantidad de mesas",
      "careNotes": "Fácilmente desmontable para almacenar plano."
    },
    "variants": [
      {
        "name": "Combinación de colores",
        "options": [
          "Blanco sobre Verde Olivo",
          "Blanco sobre Negro",
          "Dorado sobre Crema",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Numeración corrida (ej. 01 al 20)",
      "Detalle de nombres de novios o logo"
    ],
    "availability": "made_to_order",
    "privateNotes": "Producción por lotes de 10 piezas.",
    "createdAt": "2026-10-14T14:44:43.575Z",
    "whiteBgImage": "/uploads/catalog-v2-t25-base-3ffc446e6b.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t25-detail-93cbff8d4b.webp",
    "measureImage": "/uploads/catalog-v2-t25-scale-eeadbf2eb7.webp",
    "stockQuantity": 0,
    "costPrice": 52,
    "costBreakdown": {
      "plaGrams": 55,
      "tpuGrams": 0,
      "otherMaterialsCost": 5,
      "machineHours": 2.2,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "durationMinutes": 15,
      "discountPercent": 10,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:52.698Z",
    "sku": "NEG-3D-PLA-MAT-025",
    "skuBreakdown": {
      "standardSku": "NEG-3D-PLA-MAT-025",
      "legacyCode": "T25",
      "area": "NEG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "025",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#025"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t25-scale-eeadbf2eb7.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T25\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T25\\",
    "manufacturingTimes": {
      "machineHours": 2,
      "machineMinutes": 12,
      "postProcessingMinutes": 5,
      "leadTimeDays": "3 a 5 días hábiles según cantidad de mesas"
    },
    "manufacturingTimeMinutes": 132,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "taza-personalizada-s1",
    "code": "S1",
    "name": "Taza personalizada con logotipo o nombre",
    "priceType": "fixed",
    "price": 72,
    "priceUnit": "c/u",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-cocina",
      "negocios-restaurantes",
      "eventos-bodas",
      "negocios-oficinas"
    ],
    "techniques": [
      "sublimation",
      "sublimacion"
    ],
    "primaryImage": "/uploads/sublimacion_taza_tarro_contexto.jpg",
    "gallery": [
      "/uploads/sublimacion_taza_tarro_contexto.jpg",
      "/uploads/catalog-v2-s1-base-4fc107e773.webp",
      "/uploads/catalog-v2-s1-detail-918981c0b0.webp",
      "/uploads/catalog-v2-s1-scale-406d68f108.webp"
    ],
    "shortDescription": "Taza / tarro de polímero térmico de 11 oz con diseño corporativo, monograma o detalle botánico.",
    "fullDescription": "Taza clásica para café o té con impresión de alta durabilidad y colores vivos. Ideal para kits de bienvenida en oficinas, cafeterías, regalos para parejas o recuerdos de boda.",
    "specifications": {
      "dimensions": "11 onzas (325 ml)",
      "material": "Polímero térmico resistente libre de BPA",
      "finish": "Brillante o satinado",
      "includes": "Cajita individual blanca protectora",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Apta para bebidas frías y calientes."
    },
    "variants": [
      {
        "name": "Estilo",
        "options": [
          "Logotipo empresarial",
          "Nombres de pareja con follaje",
          "Foto familiar"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de cada colaborador",
      "Impresión a 1 o 2 caras"
    ],
    "availability": "in_stock",
    "privateNotes": "Planchado a 180°C por 180 segundos.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-s1-base-4fc107e773.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-s1-detail-918981c0b0.webp",
    "measureImage": "/uploads/catalog-v2-s1-scale-406d68f108.webp",
    "stockQuantity": 6,
    "costPrice": 43,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 35,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:57:03.459Z",
    "sku": "HOG-SUB-CER-BRI-001",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-CER-BRI-001",
      "legacyCode": "S1",
      "area": "HOG",
      "technique": "SUB",
      "material": "CER",
      "finish": "BRI",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "☕ Sublimación Térmica (Prensa de Tazas / Plancha Térmica)",
        "materiaPrima": "🪵 Cerámica / Vidrio - Inorgánicos",
        "acabadoTaller": "✨ Sellador Brillante / Resina - Efecto cristal brillante",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-s1-scale-406d68f108.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\S1\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\S1\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "posavasos-madera-l15",
    "code": "L15",
    "name": "Posavasos de madera natural grabado con láser",
    "priceType": "starting_at",
    "price": 49,
    "priceUnit": "c/u",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-cocina",
      "negocios-restaurantes"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-l15-context-3b6b41e502.webp",
    "gallery": [
      "/uploads/catalog-v2-l15-context-3b6b41e502.webp",
      "/uploads/catalog-v2-l15-base-a7c4b5d3f5.webp",
      "/uploads/catalog-v2-l15-detail-c27a2576e2.webp",
      "/uploads/catalog-v2-l15-scale-a42156e5d0.webp"
    ],
    "shortDescription": "Set de posavasos en madera natural con patrones botánicos o logotipo grabado a láser y base de corcho.",
    "fullDescription": "Protege las mesas con calidez artesanal. Fabricados en madera natural selecta de 5mm (sin MDF) con grabado láser de alta precisión y triple sellado de barniz transparente poliuretano que repele agua, café y alcohol. Con base de corcho natural antideslizante que protege superficies delicadas.",
    "specifications": {
      "dimensions": "9 cm de diámetro x 5 mm de espesor",
      "material": "Madera natural sólida seleccionada de pino / haya 5mm con base de corcho natural (sin MDF)",
      "finish": "Triple capa de barniz transparente sellador poliuretano hidrófugo grado mesa",
      "includes": "Tope de corcho inferior antideslizante",
      "minQuantity": 4,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Secar con un trapo tras usar. Protección hidrófuga contra líquidos y calor."
    },
    "variants": [
      {
        "name": "Tono de Barniz",
        "options": [
          "Barniz Natural Transparente",
          "Nogal Americano",
          "Caoba Clásico",
          "Roble Claro Nórdico"
        ]
      },
      {
        "name": "Forma",
        "options": [
          "Circular (9 cm)",
          "Cuadrado con cantos redondeados (9 cm)"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo de cafetería",
      "Iniciales de evento"
    ],
    "availability": "made_to_order",
    "privateNotes": "Corte y grabado en pino selecto 5mm. Aplicación de triple capa de barniz transparente poliuretano hidrófugo por ambas caras y pegado de corcho base. Se entrega atado con cordel de yute en paquetes de 4 o 6.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-l15-base-a7c4b5d3f5.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-l15-detail-c27a2576e2.webp",
    "measureImage": "/uploads/catalog-v2-l15-scale-a42156e5d0.webp",
    "stockQuantity": 0,
    "costPrice": 16,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 10,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 2,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:39.012Z",
    "sku": "HOG-LAS-PIN-GRA-015",
    "skuBreakdown": {
      "standardSku": "HOG-LAS-PIN-GRA-015",
      "legacyCode": "L15",
      "area": "HOG",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "015",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Mesa",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Pino / Haya 5mm (Sin MDF)",
        "acabadoTaller": "✨ Triple Barniz Transparente Hidrófugo",
        "lote": "#015"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-l15-scale-a42156e5d0.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\L15\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\L15\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "chapita-mascota-t20",
    "code": "T20",
    "name": "Chapita de identificación para mascotas con o sin NFC",
    "priceType": "starting_at",
    "price": 69,
    "priceUnit": "c/u",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar",
      "negocios"
    ],
    "categories": [
      "hogar-mascotas",
      "negocios-veterinarias"
    ],
    "techniques": [
      "3d",
      "nfc",
      "laser"
    ],
    "primaryImage": "/uploads/t20_vista1_contexto.webp",
    "gallery": [
      "/uploads/t20_vista1_contexto.webp",
      "/uploads/t20_vista2_fondo_blanco.webp",
      "/uploads/t20_vista3_detalle.webp",
      "/uploads/t20_vista4_medidas.webp"
    ],
    "shortDescription": "Placa ultraligera en forma de huesito o huella con nombre en relieve y opción de chip NFC.",
    "fullDescription": "La tranquilidad de saber que tu peludo está identificado. Fabricada en relieve 3D ligero para no molestar el cuello de tu perro o gato. Disponible en versión básica con teléfono grabado al reverso o en versión inteligente con chip NFC ($350) que abre tu contacto de WhatsApp o ficha médica al acercar cualquier celular.",
    "specifications": {
      "dimensions": "Chica (3 cm para gatos/perros mini) o Mediana (4 cm para perros medianos/grandes)",
      "material": "PLA de grado no tóxico y argolla metálica reforzada",
      "finish": "Bicolor con contraste visible",
      "includes": "Argolla doble reforzada para el collar",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "No remojar en solventes. Resistente a lluvia y paseos normales."
    },
    "variants": [
      {
        "name": "Modelo",
        "options": [
          "Huellita 3D ($69)",
          "Huesito 3D ($69)",
          "Madera natural selecta L10 ($69)",
          "Placa recubierta metal L7 ($79)",
          "Inteligente 3D con NFC ($350)"
        ]
      },
      {
        "name": "Color",
        "options": [
          "Verde Olivo y Blanco",
          "Negro y Blanco",
          "Azul Marino",
          "Rojo",
          "Rosa Pastel",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de la mascota al frente",
      "1 o 2 números de teléfono al reverso",
      "Dirección o frase corta"
    ],
    "availability": "made_to_order",
    "privateNotes": "La versión NFC lleva chip sellado herméticamente al interior.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/t20_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t20_vista3_detalle.webp",
    "measureImage": "/uploads/t20_vista4_medidas.webp",
    "stockQuantity": 0,
    "costPrice": 20.3,
    "costBreakdown": {
      "plaGrams": 12,
      "tpuGrams": 0,
      "otherMaterialsCost": 5,
      "machineHours": 0.42,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 2,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": true,
      "isBlitz": true,
      "durationMinutes": 15,
      "discountPercent": 15,
      "startedAt": 1792123047288,
      "expiresAt": 1792123887288
    },
    "updatedAt": "2026-10-14T23:16:52.793Z",
    "sku": "HOG-HYB-PLA-NFC-020",
    "skuBreakdown": {
      "standardSku": "HOG-HYB-PLA-NFC-020",
      "legacyCode": "T20",
      "area": "HOG",
      "technique": "HYB",
      "material": "PLA",
      "finish": "NFC",
      "sequence": "020",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Chip NFC Integrado & Enlace - Programado con URL o contacto",
        "lote": "#020"
      }
    },
    "dimensionsImage": "/uploads/t20_vista4_medidas.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/3138490",
      "makerworldModelId": "3138490",
      "author": "Ryno_man",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T20_Chapita_Ryno_man\\bone_dog_tag.3mf",
      "cloudUrl": "",
      "slicerNotes": "Pausa para inserción o cambio de color en letras en relieve.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/3138490",
    "makerworldUrl": "https://makerworld.com/es/models/3138490",
    "makerWorldAuthor": "Ryno_man",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T20_Chapita_Ryno_man\\bone_dog_tag.3mf",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 25,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 25,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "portabolsas-paseo-t21",
    "code": "T21",
    "name": "Portabolsas sanitario para paseo de mascotas",
    "priceType": "starting_at",
    "price": 139,
    "priceUnit": "c/u",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-mascotas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t21-context-6b58d43678.webp",
    "gallery": [
      "/uploads/catalog-v2-t21-context-6b58d43678.webp",
      "/uploads/catalog-v2-t21-base-6abf5860db.webp",
      "/uploads/catalog-v2-t21-detail-2e76c2b71e.webp",
      "/uploads/catalog-v2-t21-scale-b72e3fcb99.webp"
    ],
    "shortDescription": "Cápsula dispensadora de rollos sanitarios con ventana de huellita y mosquetón.",
    "fullDescription": "Haz tus paseos más cómodos y ordenados. Dispensador resistente con tapa de rosca rápida y ranura frontal con silueta de huella para extraer bolsas fácilmente sin atascos.",
    "specifications": {
      "dimensions": "8.5 cm de largo x 4 cm de diámetro",
      "material": "Polímero resistente a caídas",
      "finish": "Verde salvia mate o arena",
      "includes": "Mosquetón metálico negro y 1 rollo de bolsas biodegradable de cortesía",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Apto para cualquier rollo de bolsas estándar de 15 piezas."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Verde Salvia",
          "Arena / Crema",
          "Grafito",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de tu mascota grabado en relieve"
    ],
    "availability": "in_stock",
    "privateNotes": "Tapa con rosca métrica de fácil ensamble.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-t21-base-6abf5860db.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t21-detail-2e76c2b71e.webp",
    "measureImage": "/uploads/catalog-v2-t21-scale-b72e3fcb99.webp",
    "stockQuantity": 16,
    "costPrice": 58,
    "costBreakdown": {
      "plaGrams": 65,
      "tpuGrams": 0,
      "otherMaterialsCost": 8,
      "machineHours": 2.8,
      "otherEquipCost": 0,
      "manualWorkMin": 6,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:59.002Z",
    "sku": "HOG-3D-PLA-MAT-021",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-021",
      "legacyCode": "T21",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "021",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#021"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t21-scale-b72e3fcb99.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T21\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T21\\",
    "manufacturingTimes": {
      "machineHours": 2,
      "machineMinutes": 48,
      "postProcessingMinutes": 6,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 168,
    "postProcessingTimeMinutes": 6
  },
  {
    "id": "paquete-zorrito-t35",
    "code": "T35",
    "name": "Paquete Zorrito Colección (Figura + Llavero + Stickers)",
    "priceType": "fixed",
    "price": 249,
    "priceUnit": "paquete",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-decoracion",
      "hogar-infantil",
      "hogar-hobbies"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/t35_vista1_contexto.webp",
    "gallery": [
      "/uploads/t35_vista1_contexto.webp",
      "/uploads/t35_vista2_fondo_blanco.webp",
      "/uploads/t35_vista3_detalle.webp",
      "/uploads/t35_vista4_medidas.webp"
    ],
    "shortDescription": "Set de colección: Figura low-poly de zorrito, llavero miniatura a juego y 2 stickers.",
    "fullDescription": "Nuestra simpática mascota zorrito en un paquete de colección especial. Incluye una figura decorativa facetada de 10 cm con acabado terracota y blanco, llavero miniatura de cabeza de zorrito con herraje metálico y 2 stickers vinílicos resistentes a la intemperie. Precio del paquete $249 (precio individual $278).",
    "specifications": {
      "dimensions": "Figura: 10 cm de altura; Llavero: 3.5 cm; Stickers: 6 cm",
      "material": "PLA premium multicolor y vinil laminado brillante",
      "finish": "Facetado poliédrico mate con ojos brillantes",
      "includes": "1 figura T35 + 1 llavero + 2 stickers D5 en empaque especial",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Pieza decorativa de colección."
    },
    "variants": [
      {
        "name": "Presentación",
        "options": [
          "Paquete Completo ($249)",
          "Solo Figura T35 ($179)",
          "Solo Llavero ($42)"
        ]
      }
    ],
    "customizationOptions": [
      "Dedicatoria en la base de la figura"
    ],
    "availability": "in_stock",
    "privateNotes": "Producto estrella de temporada.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/t35_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t35_vista3_detalle.webp",
    "measureImage": "/uploads/t35_vista4_medidas.webp",
    "stockQuantity": 14,
    "costPrice": 102,
    "costBreakdown": {
      "plaGrams": 80,
      "tpuGrams": 0,
      "otherMaterialsCost": 25,
      "machineHours": 2.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 15,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-3D-PLA-BRI-035",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-BRI-035",
      "legacyCode": "T35",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "BRI",
      "sequence": "035",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Sellador Brillante / Resina - Efecto cristal brillante",
        "lote": "#035"
      }
    },
    "dimensionsImage": "/uploads/t35_vista4_medidas.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/2387852",
      "makerworldModelId": "2387852",
      "author": "MrGravity",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T35_CuteFox_MrGravity\\cute_fox_pair.3mf",
      "cloudUrl": "",
      "slicerNotes": "Multicolor AMS o capas alternadas blanco/naranja.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/2387852",
    "makerworldUrl": "https://makerworld.com/es/models/2387852",
    "makerWorldAuthor": "MrGravity",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T35_CuteFox_MrGravity\\cute_fox_pair.3mf",
    "manufacturingTimes": {
      "machineHours": 2,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 135,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "letrero-boda-l2",
    "code": "L2",
    "name": "Letrero de bienvenida o presidencia para boda y eventos",
    "priceType": "starting_at",
    "price": 249,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos",
      "negocios"
    ],
    "categories": [
      "eventos-bodas",
      "negocios-oficinas"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-l2-context-71f389541b.webp",
    "gallery": [
      "/uploads/catalog-v2-l2-context-71f389541b.webp",
      "/uploads/catalog-v2-l2-base-1f573d901e.webp",
      "/uploads/catalog-v2-l2-detail-28fc8cd38d.webp",
      "/uploads/catalog-v2-l2-scale-1d8cf493d0.webp"
    ],
    "shortDescription": "Placa en silueta de arco en madera natural selecta o acrílico con nombres caligráficos y fecha grabada.",
    "fullDescription": "La pieza que da la bienvenida a tus invitados y enmarca las fotos del día más especial. Corte en arco contemporáneo en madera natural seleccionada (100% libre de MDF) con tipografía elegante y motivos botánicos grabados a láser, sellado con capa de barniz transparente satinado que protege la madera sin alterar su textura.",
    "specifications": {
      "dimensions": "Desde 30 x 20 cm hasta 60 x 40 cm según el uso (mesa o caballete)",
      "material": "Madera natural sólida de haya / pino estufado de 6 mm o acrílico cristal (sin MDF)",
      "finish": "Capa protectora de barniz transparente satinado y bordes pulidos",
      "includes": "Base de madera independiente o ranuras para caballete",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Empaque especial acolchado para traslado."
    },
    "variants": [
      {
        "name": "Acabado y Barniz",
        "options": [
          "Barniz Natural Transparente Pino Nórdico",
          "Nogal Americano Clásico",
          "Caoba Elegante",
          "Acrílico Blanco Esmerilado"
        ]
      },
      {
        "name": "Tamaño",
        "options": [
          "Mesa de dulces / firmas (30 x 20 cm)",
          "Entrada al salón (50 x 35 cm) (+ $220 MXN)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres de los novios o festejados",
      "Fecha del evento",
      "Frase personalizada"
    ],
    "availability": "made_to_order",
    "privateNotes": "Corte limpio en arco sobre madera natural de haya/pino 6mm. Grabado de nombres y sellado con barniz transparente satinado. Base ranurada ajustada a medida.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-l2-base-1f573d901e.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-l2-detail-28fc8cd38d.webp",
    "measureImage": "/uploads/catalog-v2-l2-scale-1d8cf493d0.webp",
    "stockQuantity": 0,
    "costPrice": 83,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 53,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 12,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:17:12.610Z",
    "sku": "EVE-LAS-PIN-GRA-002",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-PIN-GRA-002",
      "legacyCode": "L2",
      "area": "EVE",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "002",
      "instructionsForStaff": {
        "destino": "🎉 Eventos & Bodas",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Haya / Pino 6mm (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Protector Satinado",
        "lote": "#002"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-l2-scale-1d8cf493d0.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\L2\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\L2\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "llavero-nombre-t1",
    "code": "T1",
    "name": "Llavero con nombre en relieve y silueta botánica",
    "priceType": "starting_at",
    "price": 49,
    "priceUnit": "c/u",
    "status": "published",
    "featured": false,
    "worlds": [
      "hogar",
      "eventos",
      "negocios"
    ],
    "categories": [
      "hogar-regalos",
      "eventos-bodas",
      "eventos-cumpleanos",
      "negocios-tiendas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/t1_vista1_contexto.webp",
    "gallery": [
      "/uploads/t1_vista1_contexto.webp",
      "/uploads/t1_vista2_fondo_blanco.webp",
      "/uploads/t1_vista3_detalle.webp",
      "/uploads/t1_vista4_medidas.webp"
    ],
    "shortDescription": "Llavero personalizado con el nombre de cada invitado en relieve tridimensional.",
    "fullDescription": "El recuerdo favorito para bodas, graduaciones y XV años. Cada invitado recibe su propio llavero personalizado con su nombre en relieve sobre una base estilizada con forma de hoja u ovalada. Descuento por volumen para eventos.",
    "specifications": {
      "dimensions": "6 a 8 cm de largo según la longitud del nombre x 2.5 cm de ancho",
      "material": "PLA bicolor de alta tenacidad",
      "finish": "Letras en alto relieve con contraste visible",
      "includes": "Argolla metálica reforzada con cadena",
      "minQuantity": 5,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Ligero y resistente para llevar en las llaves diarias."
    },
    "variants": [
      {
        "name": "Combinación",
        "options": [
          "Verde olivo con letras crema",
          "Gris carbón con letras blancas",
          "Terracota con letras arena"
        ]
      }
    ],
    "customizationOptions": [
      "Lista de nombres enviada en Excel o mensaje",
      "Fecha o iniciales al reverso"
    ],
    "availability": "made_to_order",
    "privateNotes": "Generador de stl por lote.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/t1_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t1_vista3_detalle.webp",
    "measureImage": "/uploads/t1_vista4_medidas.webp",
    "stockQuantity": 0,
    "costPrice": 21,
    "costBreakdown": {
      "plaGrams": 18,
      "tpuGrams": 0,
      "otherMaterialsCost": 2.5,
      "machineHours": 0.58,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 2,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "HOG-3D-PLA-MAT-001",
    "skuBreakdown": {
      "standardSku": "HOG-3D-PLA-MAT-001",
      "legacyCode": "T1",
      "area": "HOG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/t1_vista4_medidas.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/1759237",
      "makerworldModelId": "1759237",
      "author": "Haledesigns3d",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T1_Llavero_Haledesigns3d\\keychain_custom_name.3mf",
      "cloudUrl": "",
      "slicerNotes": "Bicolor base oscura y texto blanco con planchado superficial.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/1759237",
    "makerworldUrl": "https://makerworld.com/es/models/1759237",
    "makerWorldAuthor": "Haledesigns3d",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T1_Llavero_Haledesigns3d\\keychain_custom_name.3mf",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 35,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 35,
    "postProcessingTimeMinutes": 5
  },
  {
    "id": "taza-magica-s8",
    "code": "S8",
    "name": "Taza mágica térmica con revelado fotográfico",
    "priceType": "fixed",
    "price": 150,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "hogar",
      "eventos"
    ],
    "categories": [
      "hogar-regalos",
      "eventos-cumpleanos",
      "eventos-temporada"
    ],
    "techniques": [
      "sublimation",
      "sublimacion"
    ],
    "primaryImage": "/uploads/catalog-v2-s8-context-cccc31c006.webp",
    "gallery": [
      "/uploads/catalog-v2-s8-context-cccc31c006.webp",
      "/uploads/catalog-v2-s8-base-165fccc9a7.webp",
      "/uploads/catalog-v2-s8-detail-b17aab8fed.webp",
      "/uploads/catalog-v2-s8-scale-24ae10f387.webp"
    ],
    "shortDescription": "Taza mágica térmica negra mate que al verter café o té caliente revela tu fotografía oculta.",
    "fullDescription": "Una sorpresa cada mañana. En frío se ve como una elegante taza negra mate; en cuanto sirves tu bebida caliente preferida, el recubrimiento térmico se vuelve transparente de abajo hacia arriba revelando la fotografía, mensaje o diseño a todo color. Precio individual $150, 10+ piezas a $140 c/u, o promoción especial de 2 tazas por $270.",
    "specifications": {
      "dimensions": "11 onzas (325 ml)",
      "material": "Polímero térmico con acabado termocrómico sensible al calor",
      "finish": "Negro mate en frío / Blanco fotográfico en caliente",
      "includes": "Caja protectora individual",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar a mano con esponja suave. No usar fibras abrasivas."
    },
    "variants": [
      {
        "name": "Promoción",
        "options": [
          "1 Pieza ($150)",
          "Paquete Magia 2 Tazas ($270)",
          "Mayoreo 10+ piezas ($140 c/u)"
        ]
      }
    ],
    "customizationOptions": [
      "Fotografía para el revelado",
      "Dedicatoria para mamá, papá o pareja"
    ],
    "availability": "in_stock",
    "privateNotes": "Revisar uniformidad del pigmento negro antes de empacar.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-s8-base-165fccc9a7.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-s8-detail-b17aab8fed.webp",
    "measureImage": "/uploads/catalog-v2-s8-scale-24ae10f387.webp",
    "stockQuantity": 14,
    "costPrice": 68,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 58,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:58.968Z",
    "sku": "HOG-SUB-CER-MAT-008",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-CER-MAT-008",
      "legacyCode": "S8",
      "area": "HOG",
      "technique": "SUB",
      "material": "CER",
      "finish": "MAT",
      "sequence": "008",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "☕ Sublimación Térmica (Prensa de Tazas / Plancha Térmica)",
        "materiaPrima": "🪵 Cerámica / Vidrio - Inorgánicos",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#008"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-s8-scale-24ae10f387.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\S8\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\S8\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "soporte-contacto-nfc-inteligente",
    "code": "T33",
    "name": "Soporte de contacto inteligente NFC",
    "priceType": "starting_at",
    "price": 299,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-oficinas",
      "negocios-emprendedores",
      "negocios-restaurantes",
      "negocios-tiendas"
    ],
    "techniques": [
      "nfc",
      "3d"
    ],
    "primaryImage": "/uploads/t33_vista1_contexto.webp",
    "gallery": [
      "/uploads/t33_vista1_contexto.webp",
      "/uploads/t33_vista2_fondo_blanco.webp",
      "/uploads/t33_vista3_detalle.webp",
      "/uploads/t33_vista4_medidas.webp"
    ],
    "shortDescription": "Acerca tu celular y comparte al instante tu catálogo, redes, WhatsApp o cobro.",
    "fullDescription": "Elimina las tarjetas de papel obsoletas. Este tótem de mostrador permite a tus clientes acercar cualquier celular (iPhone o Android) para abrir tu menú, ficha de contacto vCard, catálogo de productos o enlace de pago en menos de un segundo.",
    "specifications": {
      "dimensions": "13 cm de alto x 9 cm de ancho x 5 cm de base",
      "material": "PLA técnico con chip NTAG de alta sensibilidad encapsulado",
      "finish": "Frontal con serigrafía o relieve \"Acerca tu celular\"",
      "includes": "Configuración y prueba del enlace web antes de la entrega",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "No requiere pilas ni conexión eléctrica."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Verde Salvia",
          "Grafito Carbón",
          "Blanco Minimal",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo de tu marca al frente",
      "Enlace preprogramado a tu elección"
    ],
    "availability": "made_to_order",
    "privateNotes": "Compatible con el 99% de smartphones modernos con NFC.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/t33_vista2_fondo_blanco.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/t33_vista3_detalle.webp",
    "measureImage": "/uploads/t33_vista4_medidas.webp",
    "stockQuantity": 0,
    "costPrice": 125.4,
    "costBreakdown": {
      "plaGrams": 110,
      "tpuGrams": 0,
      "otherMaterialsCost": 40,
      "machineHours": 1.5,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:17:12.540Z",
    "sku": "NEG-NFC-PLA-NFC-033",
    "skuBreakdown": {
      "standardSku": "NEG-NFC-PLA-NFC-033",
      "legacyCode": "T33",
      "area": "NEG",
      "technique": "NFC",
      "material": "PLA",
      "finish": "NFC",
      "sequence": "033",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "📶 Tecnología NFC Programada (Estación de Codificación NFC)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Chip NFC Integrado & Enlace - Programado con URL o contacto",
        "lote": "#033"
      }
    },
    "dimensionsImage": "/uploads/t33_vista4_medidas.webp",
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/2401859",
      "makerworldModelId": "2401859",
      "author": "PhantomCommit",
      "license": "Standard Digital File License",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T33_Soporte_NFC\\nfc_smart_stand.3mf",
      "cloudUrl": "",
      "slicerNotes": "Ranura interna para chip NFC NTAG213/215 adhesivo de 25mm.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/2401859",
    "makerworldUrl": "https://makerworld.com/es/models/2401859",
    "makerWorldAuthor": "PhantomCommit",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T33_Soporte_NFC\\nfc_smart_stand.3mf",
    "manufacturingTimes": {
      "machineHours": 1,
      "machineMinutes": 30,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 90,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "starter-pack-gym-t32",
    "code": "T32",
    "name": "Starter Pack GYM y Centros Deportivos",
    "priceType": "starting_at",
    "price": 490,
    "regularPrice": 620,
    "priceUnit": "paquete",
    "status": "published",
    "featured": true,
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-gym"
    ],
    "techniques": [
      "3d",
      "nfc",
      "laser",
      "vinyl",
      "vinil"
    ],
    "primaryImage": "/uploads/catalog-v2-t32-context-6aef39410e.webp",
    "gallery": [
      "/uploads/catalog-v2-t32-context-6aef39410e.webp",
      "/uploads/catalog-v2-t32-base-0cd1628b22.webp",
      "/uploads/catalog-v2-t32-detail-654a48c225.webp",
      "/uploads/catalog-v2-t32-scale-fbb59a194e.webp"
    ],
    "shortDescription": "Kit de imagen y control para gimnasios: Placa QR+NFC, medalla de retos, llaveros y termo.",
    "fullDescription": "Todo lo necesario para proyectar una imagen profesional y moderna en tu centro de entrenamiento. Incluye placa de mostrador QR + NFC para registro rápido de entrada o cobro, medalla tridimensional personalizada para torneos o retos, llavero soporte para celular de vestidores y playera con marca.",
    "specifications": {
      "dimensions": "Paquete con 5 elementos coordinados",
      "material": "PLA de alto impacto, herrajes metálicos reforzados y madera grabada",
      "finish": "Colores corporativos de tu gimnasio",
      "includes": "Placa QR+NFC, medalla conmemorativa, llaveros disco y termo grabado opcional",
      "minQuantity": 1,
      "estimatedLeadTime": "4 a 6 días hábiles",
      "careNotes": "Piezas resistentes a uso rudo."
    },
    "variants": [
      {
        "name": "Configuración",
        "options": [
          "Kit Esencial (Placa + Llaveros + Medalla)",
          "Kit Completo (con Termo y Playera V1) (+ $280 MXN)"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo del gimnasio",
      "Enlaces de registro o redes en QR/NFC"
    ],
    "availability": "made_to_order",
    "privateNotes": "Se cotizan adiciones por volumen de membresías.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-t32-base-0cd1628b22.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t32-detail-654a48c225.webp",
    "measureImage": "/uploads/catalog-v2-t32-scale-fbb59a194e.webp",
    "stockQuantity": 0,
    "costPrice": 128,
    "costBreakdown": {
      "plaGrams": 150,
      "tpuGrams": 0,
      "otherMaterialsCost": 18,
      "machineHours": 5.5,
      "otherEquipCost": 0,
      "manualWorkMin": 12,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:17:12.578Z",
    "sku": "NEG-HYB-PLA-NFC-032",
    "skuBreakdown": {
      "standardSku": "NEG-HYB-PLA-NFC-032",
      "legacyCode": "T32",
      "area": "NEG",
      "technique": "HYB",
      "material": "PLA",
      "finish": "NFC",
      "sequence": "032",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Chip NFC Integrado & Enlace - Programado con URL o contacto",
        "lote": "#032"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t32-scale-fbb59a194e.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T32\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T32\\",
    "manufacturingTimes": {
      "machineHours": 5,
      "machineMinutes": 30,
      "postProcessingMinutes": 12,
      "leadTimeDays": "4 a 6 días hábiles"
    },
    "manufacturingTimeMinutes": 330,
    "postProcessingTimeMinutes": 12
  },
  {
    "id": "starter-pack-barberia-t18",
    "code": "T18",
    "name": "Starter Pack Barbería y Salón de Belleza",
    "priceType": "starting_at",
    "price": 480,
    "regularPrice": 590,
    "priceUnit": "paquete",
    "status": "published",
    "featured": true,
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-barberias"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-t18-context-d75b6efc45.webp",
    "gallery": [
      "/uploads/catalog-v2-t18-context-d75b6efc45.webp",
      "/uploads/catalog-v2-t18-base-9469d2ce9b.webp",
      "/uploads/catalog-v2-t18-detail-dd7ea8cd5c.webp",
      "/uploads/catalog-v2-t18-scale-8108f2560e.webp"
    ],
    "shortDescription": "Set de estación de corte: Soporte QR para citas/reseñas, portatijeras vertical y organizador de peines.",
    "fullDescription": "Optimiza el espacio y la estética de tus estaciones de barbería. Mantén tus peines guías de máquina alineados, tus tijeras protegidas verticalmente y facilita a tus clientes calificar tu servicio o agendar su siguiente cita con el tótem QR.",
    "specifications": {
      "dimensions": "Organizador peines: 24 x 6 cm; Portatijeras: 9 x 5 cm; Soporte QR: 13 x 8 cm",
      "material": "PLA rígido texturizado resistente a productos capilares",
      "finish": "Negro carbón mate y acentos verde/blanco",
      "includes": "Organizador de 8 peines guía, base para tijeras y soporte QR de mostrador",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Fácilmente lavable con agua tibia y jabón neutro."
    },
    "variants": [
      {
        "name": "Color principal",
        "options": [
          "Negro Barber Clásico",
          "Gris Carbón",
          "Verde Olivo",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de la barbería en cada pieza",
      "Enlace a citas o Instagram en QR"
    ],
    "availability": "made_to_order",
    "privateNotes": "Espaciado calibrado para peines Wahl, Andis y Babyliss.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-t18-base-9469d2ce9b.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t18-detail-dd7ea8cd5c.webp",
    "measureImage": "/uploads/catalog-v2-t18-scale-8108f2560e.webp",
    "stockQuantity": 0,
    "costPrice": 98,
    "costBreakdown": {
      "plaGrams": 110,
      "tpuGrams": 0,
      "otherMaterialsCost": 15,
      "machineHours": 4,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "NEG-3D-PLA-MAT-018",
    "skuBreakdown": {
      "standardSku": "NEG-3D-PLA-MAT-018",
      "legacyCode": "T18",
      "area": "NEG",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "018",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#018"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t18-scale-8108f2560e.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T18\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T18\\",
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 0,
      "postProcessingMinutes": 10,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "manufacturingTimeMinutes": 240,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "starter-pack-joyeria-t27",
    "code": "T27",
    "name": "Starter Pack Joyería y Boutique de Accesorios",
    "priceType": "starting_at",
    "price": 540,
    "regularPrice": 680,
    "priceUnit": "paquete",
    "status": "published",
    "featured": true,
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-joyerias",
      "negocios-tiendas"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-t27-context-541d21ddd3.webp",
    "gallery": [
      "/uploads/catalog-v2-t27-context-541d21ddd3.webp",
      "/uploads/catalog-v2-t27-base-848060235a.webp",
      "/uploads/catalog-v2-t27-detail-159392852e.webp",
      "/uploads/catalog-v2-t27-scale-33b7bb81ef.webp"
    ],
    "shortDescription": "Exhibición de lujo para vitrinas: Conos de anillos, soporte de aretes nube, bandeja y portaprecios.",
    "fullDescription": "Eleva el valor percibido de tus joyas y accesorios artesanales. El juego incluye exhibidor múltiple de anillos con conos cónicos, soporte vertical de aretes con silueta de arco/nube, bandeja con forma de flor para collares o pulseras, mini letrero de marca en madera y portaprecios de mostrador.",
    "specifications": {
      "dimensions": "Exhibidor de anillos: 18 x 5 cm; Soporte aretes: 14 x 10 cm; Bandeja: 14 cm de diámetro",
      "material": "Polímeros con acabado cerámico sedoso y madera fina",
      "finish": "Verde salvia mate y marfil texturizado",
      "includes": "5 piezas de exhibición comercial para mostrador o fotografía de catálogo",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Superficie no abrasiva para proteger metales preciosos."
    },
    "variants": [
      {
        "name": "Combinación",
        "options": [
          "Verde Salvia y Marfil",
          "Rosa Blush y Blanco",
          "Negro Mate de Lujo"
        ]
      }
    ],
    "customizationOptions": [
      "Letrero de madera con logotipo de tu marca",
      "Portaprecios con tu tipografía"
    ],
    "availability": "made_to_order",
    "privateNotes": "Fotografiado en el catálogo oficial página 23.",
    "createdAt": "2026-10-14T14:44:43.576Z",
    "whiteBgImage": "/uploads/catalog-v2-t27-base-848060235a.webp",
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "detailImage": "/uploads/catalog-v2-t27-detail-159392852e.webp",
    "measureImage": "/uploads/catalog-v2-t27-scale-33b7bb81ef.webp",
    "stockQuantity": 0,
    "costPrice": 105,
    "costBreakdown": {
      "plaGrams": 120,
      "tpuGrams": 0,
      "otherMaterialsCost": 15,
      "machineHours": 4.8,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "NEG-HYB-PLA-MAT-027",
    "skuBreakdown": {
      "standardSku": "NEG-HYB-PLA-MAT-027",
      "legacyCode": "T27",
      "area": "NEG",
      "technique": "HYB",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "027",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#027"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-t27-scale-33b7bb81ef.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\T27\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\T27\\",
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 48,
      "postProcessingMinutes": 10,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "manufacturingTimeMinutes": 288,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "servicio-patch-bar-en-vivo",
    "code": "EV-PATCHBAR",
    "name": "Servicio Patch Bar en Vivo (Gorras & Totes)",
    "priceType": "starting_at",
    "price": 6500,
    "priceUnit": "evento (50 invitados)",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos",
      "negocios"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos",
      "eventos-cumpleanos",
      "eventos-empresariales",
      "eventos-graduaciones"
    ],
    "techniques": [
      "sublimacion",
      "vinil",
      "laser",
      "vinyl",
      "sublimation"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-patchbar-context-8546dd9248.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-patchbar-base-10d9832b42.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-patchbar-context-8546dd9248.webp",
      "/uploads/catalog-v2-ev-patchbar-base-10d9832b42.webp",
      "/uploads/catalog-v2-ev-patchbar-detail-10076432c6.webp",
      "/uploads/catalog-v2-ev-patchbar-scale-d63f586482.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Estación móvil interactiva para eventos: tus invitados eligen gorra o tote bag, escogen sus parches y los planchamos al instante.",
    "fullDescription": "La experiencia más atractiva y recordada para bodas, XV años, cumpleaños y activaciones de marca corporativas. Montamos nuestro stand artesanal en madera con gorras trucker o bolsas tote de manta, charolas exhibidoras con parches temáticos y nuestra prensa de calor industrial de alta velocidad. En menos de 45 segundos por pieza, cada invitado personaliza su recuerdo y se lo lleva puesto.",
    "specifications": {
      "dimensions": "Estación de servicio: 160 x 80 cm · Altura 190 cm",
      "material": "Gorras trucker poliéster/malla o Totes manta 100% algodón · Parches bordados/térmicos HD",
      "finish": "Fijación térmica industrial de alta presión permanente, lavable y durable",
      "includes": "Mobiliario de madera, exhibidores, prensa de calor, operador calificado (3 hrs) e insumos para invitados",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Prendas lavables a mano o ciclo delicado con agua fría."
    },
    "variants": [
      {
        "name": "Base a personalizar",
        "options": [
          "Gorras Trucker",
          "Tote Bags de Manta",
          "Mixto (Gorras + Totes)"
        ]
      },
      {
        "name": "Número de Invitados",
        "options": [
          "Paquete Básico (50 pzas)",
          "Paquete Medio (100 pzas)",
          "Paquete Grande (150+ pzas)"
        ]
      }
    ],
    "customizationOptions": [
      "Parches con iniciales de novios o festejado",
      "Frases divertidas de fiesta / stickers textiles",
      "Logotipo empresarial para eventos corporativos"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T15:49:23.583Z",
    "detailImage": "/uploads/catalog-v2-ev-patchbar-detail-10076432c6.webp",
    "measureImage": "/uploads/catalog-v2-ev-patchbar-scale-d63f586482.webp",
    "stockQuantity": 0,
    "costPrice": 2400,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 1900,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 150,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": true,
      "durationMinutes": 120,
      "discountPercent": 15,
      "startedAt": 1792031887134,
      "expiresAt": 1792039087134
    },
    "updatedAt": "2026-10-15T00:56:23.870Z",
    "sku": "NEG-LAS-TEX-GRA-001",
    "skuBreakdown": {
      "standardSku": "NEG-LAS-TEX-GRA-001",
      "legacyCode": "EV-PATCHBAR",
      "area": "NEG",
      "technique": "LAS",
      "material": "TEX",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "💼 Negocios & Marca",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-patchbar-scale-d63f586482.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-PATCHBAR\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-PATCHBAR\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "set-suite-nupcial-novia-novio",
    "code": "EV-SUITE",
    "name": "Set Suite Nupcial Novia & Novio (6 piezas)",
    "priceType": "starting_at",
    "price": 890,
    "priceUnit": "set completo",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas"
    ],
    "techniques": [
      "laser",
      "vinil",
      "vinyl"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-suite-context-762c11d0f0.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-suite-base-b000c78e8a.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-suite-context-762c11d0f0.webp",
      "/uploads/catalog-v2-ev-suite-base-b000c78e8a.webp",
      "/uploads/catalog-v2-ev-suite-detail-0d1bdfdaa8.webp",
      "/uploads/catalog-v2-ev-suite-scale-0742a13507.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Kit exclusivo para la preparación y fotos de los novios: ganchos de madera grabados, alhajero con terciopelo, cosmetiquera y termos.",
    "fullDescription": "El conjunto imprescindible para la sesión de fotos de la preparación nupcial ('getting ready'). Incluye 2 ganchos de madera maciza grabados con 'Novia' y 'Novio' más fecha conmemorativa, alhajero de madera con interior en terciopelo esmeralda para anillos/arras, cosmetiquera de manta con cremallera dorada y 2 vasos térmicos skinny grabados.",
    "specifications": {
      "dimensions": "Ganchos: 44 cm ancho · Alhajero: 10 x 6 x 4 cm · Cosmetiquera: 22 x 15 cm · Vasos: 20 oz",
      "material": "Madera maciza de haya, terciopelo esmeralda, manta de algodón y vasos térmicos de polímero con vinil",
      "finish": "Grabado láser de alta precisión y vinil satinado indeleble",
      "includes": "2 ganchos grabados, 1 alhajero con terciopelo, 1 cosmetiquera nupcial, 2 vasos térmicos",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Ganchos y alhajero: limpiar con paño seco. Cosmetiquera lavable con agua fría."
    },
    "variants": [
      {
        "name": "Tono de Madera de Ganchos",
        "options": [
          "Madera Natural Clara",
          "Nogal Oscuro Clásico",
          "Blanco Satinado"
        ]
      },
      {
        "name": "Color de Vasos Térmicos",
        "options": [
          "Blanco perla & Negro mate",
          "Blanco & Oro rosado",
          "Verde Olivo & Blanco"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres de los novios y fecha de boda",
      "Color de terciopelo interior (Esmeralda, Negro o Rosa)"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T15:49:23.585Z",
    "detailImage": "/uploads/catalog-v2-ev-suite-detail-0d1bdfdaa8.webp",
    "measureImage": "/uploads/catalog-v2-ev-suite-scale-0742a13507.webp",
    "stockQuantity": 0,
    "costPrice": 320,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 250,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 25,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-PIN-GRA-001",
      "legacyCode": "EV-SUITE",
      "area": "EVE",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Maciza / Pino Natural - Maderas Naturales",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-suite-scale-0742a13507.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-SUITE\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-SUITE\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "set-bienvenida-ceremonia-nupcial",
    "code": "EV-CEREMONIA",
    "name": "Set de Bienvenida & Ceremonia Nupcial (Letrero, Conos & QR)",
    "priceType": "starting_at",
    "price": 1450,
    "priceUnit": "set ceremonial",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas"
    ],
    "techniques": [
      "laser",
      "3d",
      "vinil",
      "vinyl"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-ceremonia-context-f0ff2fe35c.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-ceremonia-base-68f9e6eda9.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-ceremonia-context-f0ff2fe35c.webp",
      "/uploads/catalog-v2-ev-ceremonia-base-68f9e6eda9.webp",
      "/uploads/catalog-v2-ev-ceremonia-detail-42a1ba517b.webp",
      "/uploads/catalog-v2-ev-ceremonia-scale-e08a0d52ea.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Kit ceremonial para entrada: letrero para caballete, canastilla con conos de pétalos, letreros de sillas de honor y tótem QR.",
    "fullDescription": "Crea una primera impresión inolvidable al llegar a la ceremonia. Incluye letrero de bienvenida silueta arco para caballete, canastilla artesanal con 25 conos de papel kraft para pétalos ('Lágrimas de Felicidad'), 2 letreros de madera colgantes para lugares de honor reservados y tótem con código QR para que los invitados descarguen el programa digital o itinerario.",
    "specifications": {
      "dimensions": "Letrero principal: 60 x 80 cm · Tótem QR: 15 x 20 cm · Conos: 18 cm largo",
      "material": "Madera natural de 6 mm (sin MDF), acrílico esmerilado, cordón de yute y papel artesanal kraft",
      "finish": "Grabado láser profundo, corte CNC limpio y sellado mate resistente a exteriores",
      "includes": "1 letrero para caballete, 25 conos armados, canastilla, 2 letreros de sillas, 1 tótem QR",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Proteger de lluvia directa. Apto para ceremonias en jardín, salón o playa."
    },
    "variants": [
      {
        "name": "Estilo del Letrero Principal",
        "options": [
          "Silueta Arco Madera Natural Barniz Transparente",
          "Madera Nogal Americano Rústico",
          "Acrílico Esmerilado"
        ]
      },
      {
        "name": "Cantidad de Conos para Pétalos",
        "options": [
          "25 conos incluidos",
          "50 conos (+ $250)",
          "100 conos (+ $500)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres completos de los novios y fecha",
      "Enlace QR a itinerario o mesa de regalos",
      "Frase de bienvenida personalizada"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T15:49:23.585Z",
    "detailImage": "/uploads/catalog-v2-ev-ceremonia-detail-42a1ba517b.webp",
    "measureImage": "/uploads/catalog-v2-ev-ceremonia-scale-e08a0d52ea.webp",
    "stockQuantity": 0,
    "costPrice": 520,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 420,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 40,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-HYB-ACR-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-HYB-ACR-GRA-001",
      "legacyCode": "EV-CEREMONIA",
      "area": "EVE",
      "technique": "HYB",
      "material": "ACR",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Acrílico Cristal / Color - Termoplásticos",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-ceremonia-scale-e08a0d52ea.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CEREMONIA\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CEREMONIA\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "centro-mesa-presidencial-3d-copas",
    "code": "EV-PRESIDENCIAL",
    "name": "Centro de Mesa Presidencial 3D & Copas Grabadas",
    "priceType": "starting_at",
    "price": 680,
    "priceUnit": "set presidencial",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-presidencial-context-ff09182fe6.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-presidencial-base-fe12db69a1.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-presidencial-context-ff09182fe6.webp",
      "/uploads/catalog-v2-ev-presidencial-base-fe12db69a1.webp",
      "/uploads/catalog-v2-ev-presidencial-detail-d5501f753a.webp",
      "/uploads/catalog-v2-ev-presidencial-scale-d717e16ef3.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Nombres en relieve 3D sobre base de nogal con fecha, acompañados de 2 portavasos botánicos de madera grabados al láser para el brindis.",
    "fullDescription": "El elemento protagónico para la mesa de honor de los recién casados. Las letras 3D volumétricas con los nombres de la pareja y la fecha descansan sobre una base biselada de madera de nogal. Incluye set de portavasos de madera de alta definición grabados al láser con monograma o 'Sr. & Sra.' para el brindis principal.",
    "specifications": {
      "dimensions": "Letras 3D con base: 35 cm largo x 12 cm alto x 4 cm fondo · Portavasos: 10 cm diámetro",
      "material": "PLA premium mate de alta densidad y base de madera tratada con grabado láser",
      "finish": "Letras satinadas suaves al tacto y grabado láser nítido en madera",
      "includes": "1 letrero 3D con base de madera, 2 portavasos de madera grabados y estuche protector",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar letras con paño de microfibra suave. No sumergir la madera en agua."
    },
    "variants": [
      {
        "name": "Color de Letras 3D",
        "options": [
          "Blanco Marfil Mate",
          "Verde Olivo Artesano",
          "Grafito Antracita",
          "Dorado Perlado",
          "🎨 Otro color a elegir (a convenir)"
        ]
      },
      {
        "name": "Grabado en Copas",
        "options": [
          "Monograma con Iniciales",
          "\"Sr. & Sra.\" + Apellido",
          "Nombres caligráficos"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres de la pareja",
      "Fecha del enlace matrimonial",
      "Dedicatoria corta en la base de madera"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T15:49:23.585Z",
    "detailImage": "/uploads/catalog-v2-ev-presidencial-detail-d5501f753a.webp",
    "measureImage": "/uploads/catalog-v2-ev-presidencial-scale-d717e16ef3.webp",
    "stockQuantity": 0,
    "costPrice": 245,
    "costBreakdown": {
      "plaGrams": 90,
      "tpuGrams": 0,
      "otherMaterialsCost": 140,
      "machineHours": 3.5,
      "otherEquipCost": 0,
      "manualWorkMin": 30,
      "prepCost": 0,
      "packagingCost": 20,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-HYB-PLA-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-HYB-PLA-GRA-001",
      "legacyCode": "EV-PRESIDENCIAL",
      "area": "EVE",
      "technique": "HYB",
      "material": "PLA",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-presidencial-scale-d717e16ef3.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-PRESIDENCIAL\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-PRESIDENCIAL\\",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 30,
      "postProcessingMinutes": 30,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "manufacturingTimeMinutes": 210,
    "postProcessingTimeMinutes": 30
  },
  {
    "id": "kit-anticruda-manta-llaveros",
    "code": "EV-ANTICRUDA",
    "name": "Kit Anticruda en Manta con Llaveros de Madera",
    "priceType": "starting_at",
    "price": 45,
    "priceUnit": "pieza (mín. 25 pzas)",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos",
      "eventos-cumpleanos",
      "eventos-otras"
    ],
    "techniques": [
      "sublimacion",
      "laser",
      "sublimation"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-anticruda-context-9a92fcbe06.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-anticruda-base-8f0205fbda.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-anticruda-context-9a92fcbe06.webp",
      "/uploads/catalog-v2-ev-anticruda-base-8f0205fbda.webp",
      "/uploads/catalog-v2-ev-anticruda-detail-8feed7eac7.webp",
      "/uploads/catalog-v2-ev-anticruda-scale-8f3ed9c922.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Morralitos de manta 100% algodón con jareta y frases divertidas, más llaveros de madera grabados con la fecha del evento.",
    "fullDescription": "El detalle más agradecido por los invitados al día siguiente de la fiesta. Morralitos de manta de algodón natural con jareta corrediza, serigrafiados con frases como 'Para que la fiesta no pare' o diseño personalizado del evento. Cada kit incluye un llavero de madera grabado con láser con la fecha del festejo.",
    "specifications": {
      "dimensions": "Morralito: 15 cm x 20 cm · Llavero: 5.5 x 2.8 cm x 4 mm espesor",
      "material": "Manta 100% algodón crudo de alto gramaje, cordón de algodón y llaveros de madera natural sólida de haya con argolla metálica (sin MDF)",
      "finish": "Estampado DTF textil de alta fijación y grabado láser en madera con capa de barniz transparente sellador",
      "includes": "Morralito de manta personalizado + llavero de madera con argolla (se entrega listo para rellenar)",
      "minQuantity": 25,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Morralitos lavables con agua fría. No planchar directo sobre el estampado."
    },
    "variants": [
      {
        "name": "Frase del Morralito",
        "options": [
          "\"Para que la fiesta no pare (Kit Anticruda)\"",
          "\"Sobreviví a la boda de los novios\"",
          "\"Diseño personalizado con nuestros nombres\""
        ]
      },
      {
        "name": "Tono de Barniz de Llaveros",
        "options": [
          "Barniz Natural Transparente",
          "Nogal Americano",
          "Caoba Clásico"
        ]
      },
      {
        "name": "Cantidad de Kits",
        "options": [
          "Paquete 25 piezas ($1,125)",
          "Paquete 50 piezas ($2,100)",
          "Paquete 100 piezas ($3,900)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres del evento o de la pareja",
      "Fecha y lugar conmemorativo",
      "Diseño gráfico especial para corporativo o cumpleaños"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T15:49:23.585Z",
    "detailImage": "/uploads/catalog-v2-ev-anticruda-detail-8feed7eac7.webp",
    "measureImage": "/uploads/catalog-v2-ev-anticruda-scale-8f3ed9c922.webp",
    "stockQuantity": 0,
    "costPrice": 18,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 14,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 2,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-TEX-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-TEX-GRA-001",
      "legacyCode": "EV-ANTICRUDA",
      "area": "EVE",
      "technique": "LAS",
      "material": "TEX",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-anticruda-scale-8f3ed9c922.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-ANTICRUDA\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-ANTICRUDA\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "combo-hogar-recibidor-calido",
    "code": "PROMO-HOG-1",
    "name": "Combo Hogar & Recibidor Cálido (4 piezas)",
    "priceType": "exact",
    "price": 449,
    "regularPrice": 548,
    "savings": 99,
    "discountPercent": 15,
    "priceUnit": "combo completo",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "COMBO RECOMENDADO",
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-organizacion",
      "hogar-decoracion",
      "hogar-regalos"
    ],
    "techniques": [
      "laser",
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-promo-hog-1-context-04a2e25cdd.webp",
    "whiteBgImage": "/uploads/catalog-v2-promo-hog-1-base-4b30853eea.webp",
    "gallery": [
      "/uploads/catalog-v2-promo-hog-1-context-04a2e25cdd.webp",
      "/uploads/catalog-v2-promo-hog-1-base-4b30853eea.webp",
      "/uploads/catalog-v2-promo-hog-1-detail-5c907bdc2b.webp",
      "/uploads/catalog-v2-promo-hog-1-scale-a202394984.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "El trío perfecto para tu entrada: colgador de llaves en madera Bienvenidos, bandeja vaciabolsillos y 2 llaveros familiares polaroid.",
    "fullDescription": "Transforma el acceso a tu casa con este paquete coordinado en madera natural y detalles artesanales. Incluye el colgador de llaves 'Bienvenidos' con percheros torneados de madera, la bandeja vaciabolsillos para monedas y cartera, más 2 llaveros de madera en capas estilo Polaroid con foto grabada y borla de gamuza.",
    "includedItems": [
      "1 Colgador de llaves Bienvenidos en madera natural (25 x 10 cm)",
      "1 Bandeja vaciabolsillos curva ergonómica (18 x 12 cm)",
      "2 Llaveros familiares Polaroid con foto grabada a láser y borla"
    ],
    "specifications": {
      "dimensions": "Colgador: 25 x 10 cm · Bandeja: 18 x 12 cm · Llaveros: 6 x 5 cm",
      "material": "Madera natural de pino/haya tratada y PLA satinado",
      "finish": "Sellador satinado protector de humedad y grabado láser HD",
      "includes": "4 piezas completas listas para colocar con cinta de montaje incluida",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 3 días hábiles",
      "careNotes": "Limpiar con paño ligeramente húmedo o seco."
    },
    "variants": [
      {
        "name": "Tono de Madera",
        "options": [
          "Madera Natural Clara",
          "Nogal Clásico Cálido"
        ]
      },
      {
        "name": "Texto del Colgador",
        "options": [
          "\"Bienvenidos\"",
          "Apellido Familiar (ej. Fam. García)",
          "Nombre Personalizado"
        ]
      }
    ],
    "customizationOptions": [
      "Foto y dedicatoria para los llaveros Polaroid",
      "Apellido o texto grabado en el colgador"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.946Z",
    "detailImage": "/uploads/catalog-v2-promo-hog-1-detail-5c907bdc2b.webp",
    "measureImage": "/uploads/catalog-v2-promo-hog-1-scale-a202394984.webp",
    "stockQuantity": 0,
    "costPrice": 168,
    "costBreakdown": {
      "plaGrams": 40,
      "tpuGrams": 0,
      "otherMaterialsCost": 120,
      "machineHours": 1.5,
      "otherEquipCost": 0,
      "manualWorkMin": 25,
      "prepCost": 0,
      "packagingCost": 18,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-HYB-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "PAQ-HYB-PIN-GRA-001",
      "legacyCode": "PROMO-HOG-1",
      "area": "PAQ",
      "technique": "HYB",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Madera Maciza / Pino Natural - Maderas Naturales",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-hog-1-scale-a202394984.webp",
    "updatedAt": "2026-10-15T16:40:53.987Z",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-HOG-1\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-HOG-1\\",
    "manufacturingTimes": {
      "machineHours": 1,
      "machineMinutes": 30,
      "postProcessingMinutes": 25,
      "leadTimeDays": "2 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 90,
    "postProcessingTimeMinutes": 25
  },
  {
    "id": "kit-home-office-gamer-pro",
    "code": "PROMO-HOG-2",
    "name": "Kit Home Office & Gamer Pro (4 piezas)",
    "priceType": "exact",
    "price": 520,
    "regularPrice": 647,
    "savings": 127,
    "discountPercent": 15,
    "priceUnit": "kit completo",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "MÁS VENDIDO ESCRITORIO",
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-estudio",
      "hogar-organizacion",
      "hogar-hobbies"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/kit_home_office_gamer_contexto.jpg",
    "whiteBgImage": "/uploads/catalog-v2-promo-hog-2-base-d97c3d97d4.webp",
    "gallery": [
      "/uploads/kit_home_office_gamer_contexto.jpg",
      "/uploads/catalog-v2-promo-hog-2-base-d97c3d97d4.webp",
      "/uploads/catalog-v2-promo-hog-2-detail-239a9c3dda.webp",
      "/uploads/catalog-v2-promo-hog-2-scale-1c5a412a91.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Organización total para tu escritorio: soporte gamer para audífonos y mando, organizador modular, portalápices y base de celular.",
    "fullDescription": "Diseñado para quienes pasan horas frente a la computadora trabajando o jugando. Este kit en relieve 3D limpia tu mesa de cables y desorden: soporte vertical dual para diadema y control, organizador modular de accesorios, portalápices geométrico y soporte ergonómico para celular con ranura de carga.",
    "includedItems": [
      "1 Soporte gamer dual para audífonos de diadema y mando de videojuegos",
      "1 Organizador modular de accesorios y memorias USB",
      "1 Portalápices geométrico facetado de alta estabilidad",
      "1 Soporte vertical para celular con ranura para cable de carga"
    ],
    "specifications": {
      "dimensions": "Soporte gamer: 22 x 12 x 14 cm · Portalápices: 10 x 8 cm · Base cel: 9 x 8 x 8 cm",
      "material": "PLA premium de alta densidad con base antideslizante",
      "finish": "Textura mate anti-reflejante suave al tacto",
      "includes": "4 piezas de organización con gomas de silicón antivibración",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 4 días hábiles",
      "careNotes": "No exponer a temperaturas superiores a 60°C. Limpiar en seco."
    },
    "variants": [
      {
        "name": "Combinación de Color",
        "options": [
          "Negro Grafito & Verde Olivo",
          "Negro Grafito & Magenta Neón",
          "Blanco Marfil Minimalista",
          "Gris Ceniza & Naranja",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Gamertag o iniciales grabadas en relieve en el soporte",
      "Color personalizado de acento"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-hog-2-detail-239a9c3dda.webp",
    "measureImage": "/uploads/catalog-v2-promo-hog-2-scale-1c5a412a91.webp",
    "stockQuantity": 0,
    "costPrice": 205,
    "costBreakdown": {
      "plaGrams": 220,
      "tpuGrams": 0,
      "otherMaterialsCost": 10,
      "machineHours": 9,
      "otherEquipCost": 0,
      "manualWorkMin": 20,
      "prepCost": 0,
      "packagingCost": 18,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-3D-PLA-ENS-002",
    "skuBreakdown": {
      "standardSku": "PAQ-3D-PLA-ENS-002",
      "legacyCode": "PROMO-HOG-2",
      "area": "PAQ",
      "technique": "3D",
      "material": "PLA",
      "finish": "ENS",
      "sequence": "002",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Ensamblado Artesanal - Pegado multicapa y curado",
        "lote": "#002"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-hog-2-scale-1c5a412a91.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-HOG-2\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-HOG-2\\",
    "manufacturingTimes": {
      "machineHours": 9,
      "machineMinutes": 0,
      "postProcessingMinutes": 20,
      "leadTimeDays": "2 a 4 días hábiles"
    },
    "manufacturingTimeMinutes": 540,
    "postProcessingTimeMinutes": 20
  },
  {
    "id": "pack-consentido-peludo-mascotas",
    "code": "PROMO-HOG-3",
    "name": "Pack Consentido Peludo (Mascotas - 4 piezas)",
    "priceType": "exact",
    "price": 299,
    "regularPrice": 366,
    "savings": 67,
    "discountPercent": 15,
    "priceUnit": "pack completo",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "PET FRIENDLY",
    "worlds": [
      "hogar"
    ],
    "categories": [
      "hogar-mascotas",
      "hogar-regalos",
      "hogar-decoracion"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-promo-hog-3-context-0f40182f71.webp",
    "whiteBgImage": "/uploads/catalog-v2-promo-hog-3-base-89f91a601c.webp",
    "gallery": [
      "/uploads/catalog-v2-promo-hog-3-context-0f40182f71.webp",
      "/uploads/catalog-v2-promo-hog-3-base-89f91a601c.webp",
      "/uploads/catalog-v2-promo-hog-3-detail-05fb365d65.webp",
      "/uploads/catalog-v2-promo-hog-3-scale-6a0903aae4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Identificación y paseo seguro: chapita personalizada 3D con teléfono, portabolsas sanitario para correa, marco imantado y fotoimán.",
    "fullDescription": "Todo lo que necesitas para tu perrito o gatito en un solo paquete consentidor: placa de identificación ligera en relieve con nombre y número de contacto, dispensador portátil de bolsitas para sujetar a la correa, un marco 3D para la foto favorita y un imán de madera con su silueta para el refrigerador.",
    "includedItems": [
      "1 Chapita de identificación ligera con nombre al frente y teléfono grabado",
      "1 Portabolsas sanitario cilíndrico con mosquetón para correa de paseo",
      "1 Marco imantado 3D para foto en refrigerador (6 x 6 cm)",
      "1 Fotoimán de madera con grabado láser"
    ],
    "specifications": {
      "dimensions": "Placa: 3.5 x 3.5 cm (ultraligera 8g) · Portabolsas: 8 x 4 cm · Marco: 6 x 6 cm",
      "material": "Polímero 3D no tóxico, argolla metálica reforzada y madera natural",
      "finish": "Bordes redondeados para no lastimar el pelaje y grabado indeleble",
      "includes": "Argolla metálica reforzada, mosquetón para correa y rollito de bolsitas de regalo",
      "minQuantity": 1,
      "estimatedLeadTime": "2 a 3 días hábiles",
      "careNotes": "Lavable con agua tibia y jabón neutro."
    },
    "variants": [
      {
        "name": "Silueta de la Chapita",
        "options": [
          "Huellita canina/felina",
          "Huesito clásico",
          "Círculo minimalista",
          "Gatito con orejitas"
        ]
      },
      {
        "name": "Color de la Chapita",
        "options": [
          "Verde Olivo Artesano",
          "Magenta Vibrante",
          "Grafito Antracita",
          "Azul Pastel",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de la mascota (frente)",
      "Hasta 2 teléfonos de contacto (reverso)",
      "Fotografía para el marco e imán"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-hog-3-detail-05fb365d65.webp",
    "measureImage": "/uploads/catalog-v2-promo-hog-3-scale-6a0903aae4.webp",
    "stockQuantity": 0,
    "costPrice": 118,
    "costBreakdown": {
      "plaGrams": 75,
      "tpuGrams": 0,
      "otherMaterialsCost": 40,
      "machineHours": 3,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 12,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-HYB-PLA-GRA-003",
    "skuBreakdown": {
      "standardSku": "PAQ-HYB-PLA-GRA-003",
      "legacyCode": "PROMO-HOG-3",
      "area": "PAQ",
      "technique": "HYB",
      "material": "PLA",
      "finish": "GRA",
      "sequence": "003",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#003"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-hog-3-scale-6a0903aae4.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-HOG-3\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-HOG-3\\",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 0,
      "postProcessingMinutes": 15,
      "leadTimeDays": "2 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 180,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "pack-apertura-restaurante-cafe",
    "code": "PROMO-BIZ-1",
    "name": "Súper Pack Restaurante & Cafetería (16 piezas)",
    "priceType": "exact",
    "price": 1890,
    "regularPrice": 2364,
    "savings": 474,
    "discountPercent": 15,
    "priceUnit": "pack comercial",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "MÁS POPULAR RESTAURANTES",
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-restaurantes"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-promo-biz-1-context-0771c723a1.webp",
    "whiteBgImage": "/uploads/catalog-v2-promo-biz-1-base-9af86dadec.webp",
    "gallery": [
      "/uploads/catalog-v2-promo-biz-1-context-0771c723a1.webp",
      "/uploads/catalog-v2-promo-biz-1-base-9af86dadec.webp",
      "/uploads/catalog-v2-promo-biz-1-detail-2803b7aefa.webp",
      "/uploads/catalog-v2-promo-biz-1-scale-8d57b77857.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "La presentación completa para tus comensales: 10 números de mesa 3D, 4 servilleteros botánicos y 2 soportes QR de mostrador.",
    "fullDescription": "El paquete integral para cafeterías, reposterías, bares y restaurantes que buscan una imagen moderna y profesional. Incluye 10 números de mesa volumétricos con base estable, 4 servilleteros botánicos o calados y 2 soportes para código QR de menú digital o pago en caja con el logo de tu negocio grabado sin costo adicional.",
    "includedItems": [
      "10 Números de mesa 3D con base rectangular biselada (del 01 al 10)",
      "4 Servilleteros de mesa modernos con diseño calado de alta capacidad",
      "2 Soportes de mostrador con placa grabada para código QR (menú o cobro)"
    ],
    "specifications": {
      "dimensions": "Números 3D: 10 x 8 x 4 cm · Servilleteros: 14 x 10 x 5 cm · Soportes QR: 15 x 10 cm",
      "material": "PLA de grado alimentario lavable y acrílico de alto impacto",
      "finish": "Textura mate satinada antimanchas y grabado láser indeleble",
      "includes": "16 piezas con numeración correlativa y generación de códigos QR vectoriales",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Lavables con agua y jabón común. No meter a lavavajillas a altas temperaturas."
    },
    "variants": [
      {
        "name": "Tono de Números 3D",
        "options": [
          "Verde Olivo Artesano",
          "Negro Grafito Elegante",
          "Blanco Marfil Nórdico",
          "Terracota Cálido"
        ]
      },
      {
        "name": "Rango de Numeración",
        "options": [
          "Mesas del 01 al 10",
          "Mesas del 11 al 20",
          "Numeración personalizada"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo de tu restaurante grabado en soportes QR",
      "Enlaces a tu menú digital, redes o cobro CoDi/MercadoPago"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-biz-1-detail-2803b7aefa.webp",
    "measureImage": "/uploads/catalog-v2-promo-biz-1-scale-8d57b77857.webp",
    "stockQuantity": 0,
    "costPrice": 710,
    "costBreakdown": {
      "plaGrams": 650,
      "tpuGrams": 0,
      "otherMaterialsCost": 80,
      "machineHours": 25,
      "otherEquipCost": 0,
      "manualWorkMin": 50,
      "prepCost": 0,
      "packagingCost": 40,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-HYB-ACR-GRA-001",
    "skuBreakdown": {
      "standardSku": "PAQ-HYB-ACR-GRA-001",
      "legacyCode": "PROMO-BIZ-1",
      "area": "PAQ",
      "technique": "HYB",
      "material": "ACR",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Acrílico Cristal / Color - Termoplásticos",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-biz-1-scale-8d57b77857.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-BIZ-1\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-BIZ-1\\",
    "manufacturingTimes": {
      "machineHours": 25,
      "machineMinutes": 0,
      "postProcessingMinutes": 50,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "manufacturingTimeMinutes": 1500,
    "postProcessingTimeMinutes": 50
  },
  {
    "id": "kit-mostrador-smart-nfc-identidad",
    "code": "PROMO-BIZ-2",
    "name": "Kit Mostrador Smart NFC & Identidad (10 piezas)",
    "priceType": "exact",
    "price": 780,
    "regularPrice": 932,
    "savings": 152,
    "discountPercent": 15,
    "priceUnit": "kit comercial",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "CONECTIVIDAD SMART",
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-oficinas",
      "negocios-tiendas",
      "negocios-consultorios"
    ],
    "techniques": [
      "nfc",
      "laser",
      "sublimacion",
      "sublimation"
    ],
    "primaryImage": "/uploads/pack_gym_fitness_marca_contexto.jpg",
    "whiteBgImage": "/uploads/catalog-v2-promo-biz-2-base-9ef8a299d1.webp",
    "gallery": [
      "/uploads/pack_gym_fitness_marca_contexto.jpg",
      "/uploads/catalog-v2-promo-biz-2-base-9ef8a299d1.webp",
      "/uploads/catalog-v2-promo-biz-2-detail-8feaf311de.webp",
      "/uploads/catalog-v2-promo-biz-2-scale-7310c244c1.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Comparte tu catálogo o redes al instante: soporte piramidal con chip NFC, soporte QR vertical, 6 posavasos de madera y 2 tazas de marca.",
    "fullDescription": "Convierte cada visita en un cliente conectado. Tus clientes solo acercan su teléfono (sin escanear ni descargar apps) y se abre tu WhatsApp de pedidos, reseña de Google Maps o enlace de catálogo. Complementado con soporte QR tradicional, posavasos de madera natural grabados y tazas con la identidad de tu empresa.",
    "includedItems": [
      "1 Soporte piramidal de contacto inteligente con chip NFC programado",
      "1 Soporte QR de acrílico y madera para mostrador de caja",
      "6 Posavasos de madera natural de haya grabados al láser con tu logo",
      "2 Tazas de cerámica brillante con logotipo empresarial full color"
    ],
    "specifications": {
      "dimensions": "Soporte NFC: 11 x 9 x 8 cm · Soporte QR: 15 x 10 cm · Posavasos: 9.5 cm diámetro",
      "material": "PLA técnico, chip NFC NTAG213/215, madera de haya y cerámica",
      "finish": "Grabado láser de alta definición e impresión térmica indeleble",
      "includes": "Programación inicial del chip NFC con tu enlace y pruebas de compatibilidad",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 4 días hábiles",
      "careNotes": "Chip NFC pasivo (no requiere pilas ni recarga). Resistente al agua."
    },
    "variants": [
      {
        "name": "Función del Chip NFC",
        "options": [
          "Reseñas en Google Maps",
          "Menú Digital / Catálogo",
          "WhatsApp directo de atención",
          "Tarjeta de presentación digital vCard"
        ]
      },
      {
        "name": "Tono del Soporte NFC",
        "options": [
          "Verde Olivo Corporativo",
          "Negro Grafito Mate",
          "Blanco Satinado"
        ]
      }
    ],
    "customizationOptions": [
      "Enlace web a programar en el chip NFC",
      "Logotipo vectorizado para tazas y posavasos"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-biz-2-detail-8feaf311de.webp",
    "measureImage": "/uploads/catalog-v2-promo-biz-2-scale-7310c244c1.webp",
    "stockQuantity": 0,
    "costPrice": 295,
    "costBreakdown": {
      "plaGrams": 200,
      "tpuGrams": 0,
      "otherMaterialsCost": 120,
      "machineHours": 7.5,
      "otherEquipCost": 0,
      "manualWorkMin": 30,
      "prepCost": 0,
      "packagingCost": 20,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-LAS-CER-NFC-002",
    "skuBreakdown": {
      "standardSku": "PAQ-LAS-CER-NFC-002",
      "legacyCode": "PROMO-BIZ-2",
      "area": "PAQ",
      "technique": "LAS",
      "material": "CER",
      "finish": "NFC",
      "sequence": "002",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Cerámica / Vidrio - Inorgánicos",
        "acabadoTaller": "✨ Chip NFC Integrado & Enlace - Programado con URL o contacto",
        "lote": "#002"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-biz-2-scale-7310c244c1.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-BIZ-2\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-BIZ-2\\",
    "manufacturingTimes": {
      "machineHours": 7,
      "machineMinutes": 30,
      "postProcessingMinutes": 30,
      "leadTimeDays": "3 a 4 días hábiles"
    },
    "manufacturingTimeMinutes": 450,
    "postProcessingTimeMinutes": 30
  },
  {
    "id": "starter-pack-barberia-salon-boutique",
    "code": "PROMO-BIZ-3",
    "name": "Starter Pack Barbería & Boutique (27 piezas)",
    "priceType": "exact",
    "price": 890,
    "regularPrice": 1098,
    "savings": 208,
    "discountPercent": 15,
    "priceUnit": "pack comercial",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "FIDELIZACIÓN CLIENTES",
    "worlds": [
      "negocios"
    ],
    "categories": [
      "negocios-barberias",
      "negocios-tiendas",
      "negocios-joyerias"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/pack_barberia_boutique_contexto.jpg",
    "whiteBgImage": "/uploads/catalog-v2-promo-biz-3-base-ab3c6c6ff8.webp",
    "gallery": [
      "/uploads/pack_barberia_boutique_contexto.jpg",
      "/uploads/catalog-v2-promo-biz-3-base-ab3c6c6ff8.webp",
      "/uploads/catalog-v2-promo-biz-3-detail-04a190d0f1.webp",
      "/uploads/catalog-v2-promo-biz-3-scale-00d81fef57.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Fideliza clientes y equipa tu estación: 1 tótem QR para citas/Instagram, 1 bandeja organizadora y 25 llaveros con tu marca grabada.",
    "fullDescription": "Ideal para estéticas, barberías, estudios de tatuaje o tiendas de accesorios. Cuenta con un tótem de código QR para que tus clientes agenden su próxima cita o te sigan en redes, una bandeja organizadora para herramientas de estación de trabajo y 25 llaveros de madera grabados con tu logotipo para obsequiar en compras o servicios premium.",
    "includedItems": [
      "1 Tótem QR para citas, catálogo o perfil de Instagram",
      "1 Bandeja organizadora para peines, tijeras, tarjetas o accesorios",
      "25 Llaveros promocionales de madera con grabado láser de tu marca"
    ],
    "specifications": {
      "dimensions": "Tótem QR: 15 x 10 cm · Bandeja: 20 x 14 x 4 cm · Llaveros: 5.5 x 2.8 cm",
      "material": "Madera tratada, acrílico rígido y argollas metálicas niqueladas",
      "finish": "Grabado láser indeleble y pulido fino en madera natural",
      "includes": "27 piezas completas con argollas montadas listas para entrega a clientes",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Madera sellada contra salpicaduras y polvo."
    },
    "variants": [
      {
        "name": "Forma de los Llaveros Promocionales",
        "options": [
          "Rectangular clásico",
          "Cilindro moneda",
          "Silueta personalizada con forma de tu logo"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo de tu marca vectorizado",
      "Enlace QR a agenda, Instagram o Google Reviews"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-biz-3-detail-04a190d0f1.webp",
    "measureImage": "/uploads/catalog-v2-promo-biz-3-scale-00d81fef57.webp",
    "stockQuantity": 0,
    "costPrice": 320,
    "costBreakdown": {
      "plaGrams": 90,
      "tpuGrams": 0,
      "otherMaterialsCost": 180,
      "machineHours": 3.5,
      "otherEquipCost": 0,
      "manualWorkMin": 40,
      "prepCost": 0,
      "packagingCost": 25,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-HYB-ACR-GRA-003",
    "skuBreakdown": {
      "standardSku": "PAQ-HYB-ACR-GRA-003",
      "legacyCode": "PROMO-BIZ-3",
      "area": "PAQ",
      "technique": "HYB",
      "material": "ACR",
      "finish": "GRA",
      "sequence": "003",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Acrílico Cristal / Color - Termoplásticos",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#003"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-biz-3-scale-00d81fef57.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-BIZ-3\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-BIZ-3\\",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 30,
      "postProcessingMinutes": 40,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "manufacturingTimeMinutes": 210,
    "postProcessingTimeMinutes": 40
  },
  {
    "id": "paquete-boda-de-ensueno-todo-incluido",
    "code": "PROMO-EV-1",
    "name": "Paquete Boda de Ensueño (Todo Incluido - 3 Sets)",
    "priceType": "exact",
    "price": 2490,
    "regularPrice": 3020,
    "savings": 530,
    "discountPercent": 15,
    "priceUnit": "paquete nupcial",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "PAQUETE BODA TOTAL",
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas"
    ],
    "techniques": [
      "laser",
      "3d",
      "vinil",
      "vinyl"
    ],
    "primaryImage": "/uploads/catalog-v2-promo-ev-1-context-1aabc7517d.webp",
    "whiteBgImage": "/uploads/catalog-v2-promo-ev-1-base-215d657be0.webp",
    "gallery": [
      "/uploads/catalog-v2-promo-ev-1-context-1aabc7517d.webp",
      "/uploads/catalog-v2-promo-ev-1-base-215d657be0.webp",
      "/uploads/catalog-v2-promo-ev-1-detail-0d5351b213.webp",
      "/uploads/catalog-v2-promo-ev-1-scale-7c45b34c88.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "La ambientación nupcial completa: Set Suite para fotos de preparación, Set Bienvenida ceremonial y Centro 3D de mesa con portavasos grabados.",
    "fullDescription": "El paquete integral más solicitado por parejas: reúne la Suite Nupcial (ganchos Novia/Novio, alhajero con terciopelo, cosmetiquera y termos con vinil), el Set de Bienvenida y Ceremonia (letrero de arco para caballete, 25 conos de pétalos, letreros de sillas y QR) más el Centro de Mesa Presidencial 3D sobre nogal y el set de portavasos nupciales grabados al láser para el brindis.",
    "includedItems": [
      "Set Suite Nupcial (2 ganchos grabados, 1 alhajero con terciopelo, 1 cosmetiquera, 2 termos con vinil)",
      "Set Bienvenida Ceremonia (Letrero caballete 60x80 cm, 25 conos armados, canastilla, letreros sillas, QR)",
      "Centro Presidencial 3D sobre madera de nogal con nombres y fecha + 2 Portavasos de madera grabados"
    ],
    "specifications": {
      "dimensions": "Letrero: 60 x 80 cm · Letras 3D: 35 x 12 cm · Ganchos: 44 cm · Portavasos: 10 cm",
      "material": "Madera maciza tratada, acrílico esmerilado, PLA mate, terciopelo y papel fino",
      "finish": "Grabado láser de alta precisión, sellado mate exterior y corte volumétrico 3D",
      "includes": "Los 3 sets completos empacados de forma individual para protección",
      "minQuantity": 1,
      "estimatedLeadTime": "5 a 8 días hábiles",
      "careNotes": "Proteger madera de lluvia torrencial. Limpiar piezas con paño seco y suave."
    },
    "variants": [
      {
        "name": "Estilo del Letrero de Bienvenida",
        "options": [
          "Silueta Arco Madera Natural",
          "Rectangular Rústico",
          "Acrílico Esmerilado Moderno"
        ]
      },
      {
        "name": "Color de las Letras 3D Presidenciales",
        "options": [
          "Blanco Marfil Mate",
          "Verde Olivo Artesano",
          "Grafito Antracita",
          "Dorado Perlado",
          "🎨 Otro color a elegir (a convenir)"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres completos de los novios y fecha del enlace",
      "Dedicatoria para la base de madera de presidencia",
      "Código QR para fotos del evento o mesa de regalos"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-ev-1-detail-0d5351b213.webp",
    "measureImage": "/uploads/catalog-v2-promo-ev-1-scale-7c45b34c88.webp",
    "stockQuantity": 0,
    "costPrice": 890,
    "costBreakdown": {
      "plaGrams": 90,
      "tpuGrams": 0,
      "otherMaterialsCost": 680,
      "machineHours": 3.5,
      "otherEquipCost": 0,
      "manualWorkMin": 90,
      "prepCost": 0,
      "packagingCost": 50,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-HYB-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "PAQ-HYB-PIN-GRA-001",
      "legacyCode": "PROMO-EV-1",
      "area": "PAQ",
      "technique": "HYB",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Madera Maciza / Pino Natural - Maderas Naturales",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-ev-1-scale-7c45b34c88.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-EV-1\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-EV-1\\",
    "manufacturingTimes": {
      "machineHours": 3,
      "machineMinutes": 30,
      "postProcessingMinutes": 90,
      "leadTimeDays": "5 a 8 días hábiles"
    },
    "manufacturingTimeMinutes": 210,
    "postProcessingTimeMinutes": 90
  },
  {
    "id": "combo-fiesta-recuerdos-patch-bar-anticruda",
    "code": "PROMO-EV-2",
    "name": "Combo Fiesta Total: Patch Bar + 50 Kits Anticruda",
    "priceType": "exact",
    "price": 7490,
    "regularPrice": 8600,
    "savings": 1110,
    "discountPercent": 13,
    "priceUnit": "combo experiencia",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "EXPERIENCIA ESTRELLA",
    "worlds": [
      "eventos",
      "negocios"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos",
      "eventos-cumpleanos",
      "eventos-empresariales"
    ],
    "techniques": [
      "sublimacion",
      "vinil",
      "laser",
      "vinyl",
      "sublimation"
    ],
    "primaryImage": "/uploads/catalog-v2-promo-ev-2-context-032d61f829.webp",
    "whiteBgImage": "/uploads/catalog-v2-promo-ev-2-base-156e9889c5.webp",
    "gallery": [
      "/uploads/catalog-v2-promo-ev-2-context-032d61f829.webp",
      "/uploads/catalog-v2-promo-ev-2-base-156e9889c5.webp",
      "/uploads/catalog-v2-promo-ev-2-detail-90b0dd966a.webp",
      "/uploads/catalog-v2-promo-ev-2-scale-6fc7e58b74.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "La experiencia de fiesta más recordada: Servicio Patch Bar en vivo durante el evento + 50 morralitos Kit Anticruda con llaveros.",
    "fullDescription": "Combina la diversión en vivo durante la celebración con el recuerdo más agradecido al amanecer: 3 horas de servicio de Patch Bar interactivo (los invitados personalizan sus gorras trucker o bolsas tote con parches al instante) más 50 morralitos de manta 100% algodón serigrafiados con frases divertidas y llaveros de madera grabados para la mesa de amenidades.",
    "includedItems": [
      "Servicio Patch Bar en Vivo durante 3 horas con stand de madera y prensa térmica profesional",
      "50 Prendas a elegir (Gorras trucker transpirables o Tote bags de manta 100% algodón)",
      "Muestrarios de parches y stickers temáticos exclusivos con planchado ilimitado en vivo",
      "50 Morralitos Kit Anticruda en manta serigrafiados con frases de fiesta + 50 llaveros de madera grabados"
    ],
    "specifications": {
      "dimensions": "Estación Patch Bar: 160 x 80 cm · Morralitos: 15 x 20 cm · Llaveros: 5.5 x 2.8 cm",
      "material": "Manta 100% algodón, poliéster de gorras, madera natural y parches térmicos HD",
      "finish": "Termofijación permanente lavable y serigrafía textil de alto anclaje",
      "includes": "Operador calificado de Patch Bar, mobiliario, prensa de calor y 50 kits anticruda armados",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Prendas lavables en agua fría. Llaveros resistentes de madera natural."
    },
    "variants": [
      {
        "name": "Base de Patch Bar a Personalizar",
        "options": [
          "Gorras Trucker Variados Colores",
          "Tote Bags de Manta Cruda",
          "Mixto (25 Gorras + 25 Totes)"
        ]
      },
      {
        "name": "Frase de los Morralitos Anticruda",
        "options": [
          "\"Para que la fiesta no pare (Kit Anticruda)\"",
          "\"Sobreviví a la mejor boda\"",
          "\"Personalizado con nuestros nombres\""
        ]
      }
    ],
    "customizationOptions": [
      "Diseño de parches con iniciales de la pareja o festejado",
      "Nombres y fecha grabados en los 50 llaveros de madera",
      "Adaptación con logotipo corporativo para eventos de empresa"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-ev-2-detail-90b0dd966a.webp",
    "measureImage": "/uploads/catalog-v2-promo-ev-2-scale-6fc7e58b74.webp",
    "stockQuantity": 0,
    "costPrice": 2950,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 2400,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 180,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-LAS-TEX-GRA-002",
    "skuBreakdown": {
      "standardSku": "PAQ-LAS-TEX-GRA-002",
      "legacyCode": "PROMO-EV-2",
      "area": "PAQ",
      "technique": "LAS",
      "material": "TEX",
      "finish": "GRA",
      "sequence": "002",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#002"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-ev-2-scale-6fc7e58b74.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-EV-2\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-EV-2\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "set-xv-anos-graduaciones-inolvidables",
    "code": "PROMO-EV-3",
    "name": "Set XV Años & Graduaciones (37 piezas)",
    "priceType": "exact",
    "price": 1750,
    "regularPrice": 2163,
    "savings": 413,
    "discountPercent": 15,
    "priceUnit": "set celebración",
    "isBundle": true,
    "status": "published",
    "featured": true,
    "badge": "FIESTAS & GRADUACIONES",
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-xvanos",
      "eventos-graduaciones",
      "eventos-cumpleanos"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-promo-ev-3-context-917c77e7a6.webp",
    "whiteBgImage": "/uploads/catalog-v2-promo-ev-3-base-80f44d12d5.webp",
    "gallery": [
      "/uploads/catalog-v2-promo-ev-3-context-917c77e7a6.webp",
      "/uploads/catalog-v2-promo-ev-3-base-80f44d12d5.webp",
      "/uploads/catalog-v2-promo-ev-3-detail-bc71d859c5.webp",
      "/uploads/catalog-v2-promo-ev-3-scale-c8a6e4b916.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Recuerdos únicos para tus amigos y familia: 1 letrero silueta arco para caballete, 35 llaveros en relieve 3D con nombre y 1 tótem QR de fotos.",
    "fullDescription": "La bienvenida y el recuerdo más bonito para una quinceañera o graduado(a). Incluye el letrero de recepción para caballete en silueta arco de madera o acrílico, 35 llaveros con nombres personalizados en relieve 3D botánico (con argolla metálica reforzada) y un tótem QR de mesa para que los invitados suban y descarguen las fotos del festejo.",
    "includedItems": [
      "1 Letrero de bienvenida silueta arco para caballete (50 x 70 cm)",
      "35 Llaveros en relieve 3D botánico personalizados con nombre individual",
      "1 Tótem QR para compartir álbum de Google Fotos o Instagram"
    ],
    "specifications": {
      "dimensions": "Letrero arco: 50 x 70 cm · Llaveros 3D: 6.5 x 2.2 cm · Tótem QR: 15 x 10 cm",
      "material": "Madera natural selecta de 6 mm (sin MDF), acrílico y PLA de alta resolución",
      "finish": "Grabado láser profundo, pulido fino y relieve táctil 3D",
      "includes": "37 piezas listas para el día del evento con argollas montadas",
      "minQuantity": 1,
      "estimatedLeadTime": "4 a 6 días hábiles",
      "careNotes": "Llaveros resistentes a caídas y uso diario en llaves o mochilas."
    },
    "variants": [
      {
        "name": "Combinación de Color de Llaveros 3D",
        "options": [
          "Verde Olivo & Blanco Marfil",
          "Rosa Pastel & Blanco",
          "Grafito & Oro Perlado",
          "Lavanda & Blanco",
          "🎨 Otro color a elegir (a convenir)"
        ]
      },
      {
        "name": "Material del Letrero de Bienvenida",
        "options": [
          "Madera Natural Haya Barniz Transparente",
          "Madera Tinte Nogal Americano",
          "Acrílico Esmerilado Blanco"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre de la quinceañera / festejado(a) o generación",
      "Fecha del festejo",
      "Lista de nombres para los 35 llaveros individuales"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T16:07:55.947Z",
    "detailImage": "/uploads/catalog-v2-promo-ev-3-detail-bc71d859c5.webp",
    "measureImage": "/uploads/catalog-v2-promo-ev-3-scale-c8a6e4b916.webp",
    "stockQuantity": 0,
    "costPrice": 620,
    "costBreakdown": {
      "plaGrams": 350,
      "tpuGrams": 0,
      "otherMaterialsCost": 320,
      "machineHours": 14,
      "otherEquipCost": 0,
      "manualWorkMin": 50,
      "prepCost": 0,
      "packagingCost": 35,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "PAQ-HYB-ACR-GRA-003",
    "skuBreakdown": {
      "standardSku": "PAQ-HYB-ACR-GRA-003",
      "legacyCode": "PROMO-EV-3",
      "area": "PAQ",
      "technique": "HYB",
      "material": "ACR",
      "finish": "GRA",
      "sequence": "003",
      "instructionsForStaff": {
        "destino": "🎁 Paquetes & Combos",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Acrílico Cristal / Color - Termoplásticos",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#003"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-promo-ev-3-scale-c8a6e4b916.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-EV-3\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\PROMO-EV-3\\",
    "manufacturingTimes": {
      "machineHours": 14,
      "machineMinutes": 0,
      "postProcessingMinutes": 50,
      "leadTimeDays": "4 a 6 días hábiles"
    },
    "manufacturingTimeMinutes": 840,
    "postProcessingTimeMinutes": 50
  },
  {
    "id": "bolsa-tote-bag-manta-vinil-textil",
    "code": "VN-TOTE-01",
    "name": "Bolsa Tote Bag de Manta con Vinil Textil / Sublimación",
    "priceType": "starting_at",
    "price": 120,
    "regularPrice": 150,
    "priceUnit": "pieza (desde $85 mayoreo)",
    "status": "published",
    "featured": true,
    "badge": "TEXTIL FAVORITO",
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-regalos",
      "negocios-tiendas",
      "eventos-bodas",
      "eventos-empresariales"
    ],
    "techniques": [
      "vinil",
      "vinyl",
      "sublimacion",
      "sublimation"
    ],
    "primaryImage": "/uploads/catalog-v2-vn-tote-01-context-1029da08c6.webp",
    "whiteBgImage": "/uploads/catalog-v2-vn-tote-01-base-51998bdc2a.webp",
    "gallery": [
      "/uploads/catalog-v2-vn-tote-01-context-1029da08c6.webp",
      "/uploads/catalog-v2-vn-tote-01-base-51998bdc2a.webp",
      "/uploads/catalog-v2-vn-tote-01-detail-0c36441473.webp",
      "/uploads/catalog-v2-vn-tote-01-scale-77b996cf91.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Tote bag ecológica en manta 100% algodón crudo (38x42 cm) con asas reforzadas, personalizada con vinil textil HD o sublimación a todo color.",
    "fullDescription": "Bolsa reutilizable fabricada en manta natural de alto gramaje con costuras reforzadas en X en las asas. Ideal para recuerdos de bodas, kit de bienvenida en convenciones empresariales, empaque ecológico para tiendas boutique o uso diario. Personalizable con vinil textil de alta adhesión (mate, metálico, glitter) o sublimación a todo color.",
    "specifications": {
      "dimensions": "38 cm ancho x 42 cm alto · Asas de 60 cm al hombro",
      "material": "Manta 100% algodón crudo 240g sin blanquear",
      "finish": "Fijación térmica de vinil textil de alta elasticidad y resistencia al lavado",
      "includes": "1 Tote bag lista para usar empacada individualmente",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar al revés con agua fría. No planchar directo sobre el estampado."
    },
    "variants": [
      {
        "name": "Tipo de Personalización",
        "options": [
          "Vinil Textil 1 Color (Negro/Blanco/Dorado)",
          "Vinil Textil Bicolor",
          "Sublimación Full Color"
        ]
      },
      {
        "name": "Acabado del Vinil",
        "options": [
          "Mate Premium",
          "Metálico Oro / Plata",
          "Efecto Glitter"
        ]
      }
    ],
    "customizationOptions": [
      "Logotipo vectorial de empresa o negocio",
      "Monograma o nombres para eventos y bodas",
      "Ilustración o frase personalizada"
    ],
    "availability": "in_stock",
    "sourceCrop": "white_kit_anticruda.jpg",
    "detailImage": "/uploads/catalog-v2-vn-tote-01-detail-0c36441473.webp",
    "measureImage": "/uploads/catalog-v2-vn-tote-01-scale-77b996cf91.webp",
    "stockQuantity": 6,
    "costPrice": 58,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 50,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:38.861Z",
    "sku": "HOG-SUB-TEX-MAT-001",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-TEX-MAT-001",
      "legacyCode": "VN-TOTE-01",
      "area": "HOG",
      "technique": "SUB",
      "material": "TEX",
      "finish": "MAT",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "☕ Sublimación Térmica (Prensa de Tazas / Plancha Térmica)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-vn-tote-01-scale-77b996cf91.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\VN-TOTE-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\VN-TOTE-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "gorra-trucker-personalizada-vinil-parche",
    "code": "VN-GORRA-01",
    "name": "Gorra Trucker Ajustable con Vinil Textil & Parche",
    "priceType": "starting_at",
    "price": 145,
    "regularPrice": 180,
    "priceUnit": "pieza (desde $99 mayoreo)",
    "status": "published",
    "featured": true,
    "badge": "MÁS VENDIDO",
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "negocios-emprendedores",
      "eventos-graduaciones",
      "eventos-cumpleanos",
      "hogar-regalos"
    ],
    "techniques": [
      "vinil",
      "vinyl"
    ],
    "primaryImage": "/uploads/catalog-v2-vn-gorra-01-context-8e05d0e774.webp",
    "whiteBgImage": "/uploads/catalog-v2-vn-gorra-01-base-f7a573d623.webp",
    "gallery": [
      "/uploads/catalog-v2-vn-gorra-01-context-8e05d0e774.webp",
      "/uploads/catalog-v2-vn-gorra-01-base-f7a573d623.webp",
      "/uploads/catalog-v2-vn-gorra-01-detail-bdfe928286.webp",
      "/uploads/catalog-v2-vn-gorra-01-scale-6cb8facc19.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Gorra clásica trucker de 5 paneles con frente acolchado y malla transpirable, personalizada con vinil textil termotransferible o parche.",
    "fullDescription": "La gorra favorita para celebraciones de despedidas de soltera, bodas, aniversarios, graduaciones y uniformes de personal. Frente de poliéster de alta densidad que permite estampados nítidos sin deformaciones. Broche ajustable tipo snapback de doble hilera.",
    "specifications": {
      "dimensions": "Circunferencia ajustable 54 a 60 cm · Visera curva 7 cm",
      "material": "Frente de poliéster acolchado y laterales/malla de ventilación",
      "finish": "Vinil textil termo-adherido a 160°C o parche bordado de alta definición",
      "includes": "1 Gorra trucker personalizada lista para usar",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Limpiar con cepillo suave o paño húmedo. No usar secadora."
    },
    "variants": [
      {
        "name": "Color de Gorra",
        "options": [
          "Negro Total",
          "Negro con Frente Blanco",
          "Verde Olivo",
          "Rosa Pastel",
          "Azul Marino"
        ]
      },
      {
        "name": "Tipo de Estampado",
        "options": [
          "Vinil Textil Mate",
          "Vinil Textil Glitter (+ $25 MXN)",
          "Parche Estilo Patch Bar (+ $35 MXN)"
        ]
      }
    ],
    "customizationOptions": [
      "Iniciales, monograma o apodo",
      "Frases de fiesta (\"Groom Squad\", \"Team Bride\", etc.)",
      "Logotipo de tu negocio o gimnasio"
    ],
    "availability": "in_stock",
    "sourceCrop": "white_patch_bar.jpg",
    "detailImage": "/uploads/catalog-v2-vn-gorra-01-detail-bdfe928286.webp",
    "measureImage": "/uploads/catalog-v2-vn-gorra-01-scale-6cb8facc19.webp",
    "stockQuantity": 7,
    "costPrice": 70,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 62,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:59.067Z",
    "sku": "HOG-VIN-TEX-TER-001",
    "skuBreakdown": {
      "standardSku": "HOG-VIN-TEX-TER-001",
      "legacyCode": "VN-GORRA-01",
      "area": "HOG",
      "technique": "VIN",
      "material": "TEX",
      "finish": "TER",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "✂️ Vinil Adhesivo / Textil (Plotter de Corte)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Termofijado Textil - Sellado con presión y calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-vn-gorra-01-scale-6cb8facc19.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\VN-GORRA-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\VN-GORRA-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "playera-algodon-personalizada-vinil-textil",
    "code": "VN-PLAYERA-01",
    "name": "Playera 100% Algodón Peinado con Vinil Textil HD",
    "priceType": "starting_at",
    "price": 185,
    "regularPrice": 230,
    "priceUnit": "pieza (desde $135 mayoreo)",
    "status": "published",
    "featured": true,
    "badge": "CALIDAD PREMIUM",
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-regalos",
      "negocios-emprendedores",
      "eventos-graduaciones",
      "eventos-empresariales"
    ],
    "techniques": [
      "vinil",
      "vinyl",
      "sublimacion",
      "sublimation"
    ],
    "primaryImage": "/uploads/catalog-v2-vn-playera-01-context-32b52e9fc4.webp",
    "whiteBgImage": "/uploads/catalog-v2-vn-playera-01-base-d397470269.webp",
    "gallery": [
      "/uploads/catalog-v2-vn-playera-01-context-32b52e9fc4.webp",
      "/uploads/catalog-v2-vn-playera-01-base-d397470269.webp",
      "/uploads/catalog-v2-vn-playera-01-detail-4c183e34fb.webp",
      "/uploads/catalog-v2-vn-playera-01-scale-5b114e25f4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Playera de algodón peinado de tacto ultrasuave (corte unisex o dama) personalizada con vinil textil elástico sin sensación plástica gruesa.",
    "fullDescription": "Confeccionada con algodón de hilo peinado de 180g que no encoge ni pierde color. Aplicamos vinil textil importado de microgrosor (menos de 90 micras) que se integra con el tejido sin acartonar la prenda. Excelente para playeras de cumpleaños familiares, playeras de pareja, uniformes y eventos deportivos.",
    "specifications": {
      "dimensions": "Tallas disponibles: Juvenil, CH, M, G, XG, 2XG",
      "material": "100% Algodón peinado premium (tapa-costura en cuello)",
      "finish": "Vinil textil elástico microfino resistente a más de 50 lavadas",
      "includes": "1 Playera empacada individualmente",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar con agua fría al revés. Planchar por la parte trasera."
    },
    "variants": [
      {
        "name": "Talla",
        "options": [
          "CH (Chica)",
          "M (Mediana)",
          "G (Grande)",
          "XG (Extra Grande) (+ $35 MXN)"
        ]
      },
      {
        "name": "Corte",
        "options": [
          "Corte Regular Unisex",
          "Corte Silueta Dama"
        ]
      },
      {
        "name": "Color de Prenda",
        "options": [
          "Negro Intenso",
          "Blanco Puro",
          "Verde Olivo Artesano",
          "Gris Jaspe"
        ]
      }
    ],
    "customizationOptions": [
      "Texto en pecho, espalda o manga",
      "Ilustración o número estilo jersey deportivo",
      "Logotipo de empresa o taller"
    ],
    "availability": "in_stock",
    "sourceCrop": "white_kit_anticruda.jpg",
    "detailImage": "/uploads/catalog-v2-vn-playera-01-detail-4c183e34fb.webp",
    "measureImage": "/uploads/catalog-v2-vn-playera-01-scale-5b114e25f4.webp",
    "stockQuantity": 14,
    "costPrice": 99,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 90,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 4,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:52.767Z",
    "sku": "HOG-SUB-TEX-MAT-001",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-TEX-MAT-001",
      "legacyCode": "VN-PLAYERA-01",
      "area": "HOG",
      "technique": "SUB",
      "material": "TEX",
      "finish": "MAT",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "☕ Sublimación Térmica (Prensa de Tazas / Plancha Térmica)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-vn-playera-01-scale-5b114e25f4.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\VN-PLAYERA-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\VN-PLAYERA-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "taza-magica-termica-sublimada",
    "code": "SB-TAZA-01",
    "name": "Taza Mágica Térmica Reveladora / Cerámica Sublimada",
    "priceType": "starting_at",
    "price": 140,
    "regularPrice": 175,
    "priceUnit": "pieza (desde $95 mayoreo)",
    "status": "published",
    "featured": true,
    "badge": "EFECTO MÁGICO",
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-cocina",
      "hogar-regalos",
      "negocios-oficinas",
      "eventos-bodas"
    ],
    "techniques": [
      "sublimacion",
      "sublimation"
    ],
    "primaryImage": "/uploads/sublimacion_taza_tarro_contexto.jpg",
    "whiteBgImage": "/uploads/catalog-v2-sb-taza-01-base-165fccc9a7.webp",
    "gallery": [
      "/uploads/sublimacion_taza_tarro_contexto.jpg",
      "/uploads/catalog-v2-sb-taza-01-base-165fccc9a7.webp",
      "/uploads/catalog-v2-sb-taza-01-detail-b17aab8fed.webp",
      "/uploads/catalog-v2-sb-taza-01-scale-473238632a.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Taza de cerámica de 11 oz con polímero termosensible: en frío es negro mate elegante y al verter café o té caliente revela tu diseño a color.",
    "fullDescription": "El regalo sorpresa por excelencia. La taza negra mate oculta completamente la imagen hasta que entra en contacto con líquido caliente (+45°C), revelando fotografías de alta resolución, dedicatorias o logotipos corporativos con colores vibrantes y acabado brillante.",
    "specifications": {
      "dimensions": "Capacidad 11 oz (325 ml) · Altura 9.5 cm · Diámetro 8.2 cm",
      "material": "Cerámica de grado alimenticio AAA con recubrimiento térmico",
      "finish": "Sublimación de alta definición fotográfica integrada al esmalte",
      "includes": "1 Taza en caja blanca protectora individual para regalo",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar a mano con esponja suave para proteger el recubrimiento termosensible. No microondas prolongado."
    },
    "variants": [
      {
        "name": "Tipo de Taza",
        "options": [
          "Taza Mágica Negro Mate (Revela con calor)",
          "Taza Cerámica Blanca Clásica (Color permanente)"
        ]
      }
    ],
    "customizationOptions": [
      "Foto familiar, de pareja o mascota",
      "Dedicatoria para mamá, papá, maestros o amigos",
      "Logotipo de empresa para obsequio a colaboradores"
    ],
    "availability": "in_stock",
    "sourceCrop": "white_s8_taza_magica.jpg",
    "detailImage": "/uploads/catalog-v2-sb-taza-01-detail-b17aab8fed.webp",
    "measureImage": "/uploads/catalog-v2-sb-taza-01-scale-473238632a.webp",
    "stockQuantity": 16,
    "costPrice": 68,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 58,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "durationMinutes": 60,
      "discountPercent": 15,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:38.825Z",
    "sku": "HOG-SUB-CER-BRI-001",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-CER-BRI-001",
      "legacyCode": "SB-TAZA-01",
      "area": "HOG",
      "technique": "SUB",
      "material": "CER",
      "finish": "BRI",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Decoración",
        "maquinaria": "☕ Sublimación Térmica (Prensa de Tazas / Plancha Térmica)",
        "materiaPrima": "🪵 Cerámica / Vidrio - Inorgánicos",
        "acabadoTaller": "✨ Sellador Brillante / Resina - Efecto cristal brillante",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-sb-taza-01-scale-473238632a.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\SB-TAZA-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\SB-TAZA-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "termo-metalico-termico-20oz-personalizado",
    "code": "SB-TERMO-01",
    "name": "Termo Metálico Térmico 20 oz con Vinil Permanente / Grabado",
    "priceType": "starting_at",
    "price": 230,
    "regularPrice": 280,
    "priceUnit": "pieza (desde $165 mayoreo)",
    "status": "published",
    "featured": true,
    "badge": "DOBLE CAPA INOX",
    "worlds": [
      "hogar",
      "negocios",
      "eventos"
    ],
    "categories": [
      "hogar-estudio",
      "hogar-regalos",
      "negocios-gym",
      "eventos-bodas"
    ],
    "techniques": [
      "vinil",
      "vinyl",
      "laser",
      "sublimacion",
      "sublimation"
    ],
    "primaryImage": "/uploads/pack_gym_fitness_marca_contexto.jpg",
    "whiteBgImage": "/uploads/catalog-v2-sb-termo-01-base-d0fc82c7af.webp",
    "gallery": [
      "/uploads/pack_gym_fitness_marca_contexto.jpg",
      "/uploads/catalog-v2-sb-termo-01-base-d0fc82c7af.webp",
      "/uploads/catalog-v2-sb-termo-01-detail-15c4eb91f2.webp",
      "/uploads/catalog-v2-sb-termo-01-scale-3899286d90.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Vaso térmico 'Skinny Tumbler' de 20 oz de doble pared libre de BPA: conserva bebidas frescas y cuenta con vinil de corte de alta adherencia.",
    "fullDescription": "Vaso ergonómico libre de BPA con tapa acrílica antiderrame y popote reutilizable. Personalizado con vinil permanente de grado automotriz cortado con alta precisión en Silhouette Cameo según el diseño solicitado.",
    "specifications": {
      "dimensions": "Capacidad 20 oz (590 ml) · Altura 21 cm · Diámetro 7 cm",
      "material": "Polímero térmico libre de BPA de doble pared con tapa acrílica",
      "finish": "Acabado mate antideslizante con vinil de alta adhesión",
      "includes": "1 Vaso térmico + Tapa hermética acrílica + Popote reutilizable",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar a mano con agua tibia y jabón neutro. No usar fibras metálicas."
    },
    "variants": [
      {
        "name": "Color del Termo",
        "options": [
          "Blanco Nácar Mate",
          "Negro Mate Antracita",
          "Rosa Pastel Satinado",
          "Verde Olivo"
        ]
      },
      {
        "name": "Técnica de Personalización",
        "options": [
          "Vinil Holográfico / Tornasol",
          "Vinil Oro Rosa Metálico",
          "Grabado Láser de Precisión"
        ]
      }
    ],
    "customizationOptions": [
      "Nombre en tipografía caligráfica elegante",
      "Monograma Novia / Novio / Dama de Honor",
      "Logotipo de estudio o clínica"
    ],
    "availability": "in_stock",
    "sourceCrop": "white_suite_nupcial.jpg",
    "detailImage": "/uploads/catalog-v2-sb-termo-01-detail-15c4eb91f2.webp",
    "measureImage": "/uploads/catalog-v2-sb-termo-01-scale-3899286d90.webp",
    "stockQuantity": 8,
    "costPrice": 111,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 95,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "flashDealConfig": {
      "enabled": false,
      "startedAt": null,
      "expiresAt": null
    },
    "updatedAt": "2026-10-14T23:16:52.730Z",
    "sku": "HOG-SUB-MET-MAT-001",
    "skuBreakdown": {
      "standardSku": "HOG-SUB-MET-MAT-001",
      "legacyCode": "SB-TERMO-01",
      "area": "HOG",
      "technique": "SUB",
      "material": "MET",
      "finish": "MAT",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🏠 Hogar & Bebidas Térmicas",
        "maquinaria": "☕ Sublimación Térmica / Láser / Vinil",
        "materiaPrima": "🥤 Termo Acero Inoxidable Doble Pared 20 oz",
        "acabadoTaller": "✨ Vinil Permanente / Grabado Láser",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-sb-termo-01-scale-3899286d90.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\SB-TERMO-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\SB-TERMO-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "topper-pastel-boda-ev-topper",
    "code": "EV-TOPPER-01",
    "name": "Cake Topper para Pastel en Madera Calada & Acrílico Espejo",
    "priceType": "fixed",
    "price": 149,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-topper-01-context-08531cc210.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-topper-01-base-8def7494bf.webp",
    "detailImage": "/uploads/catalog-v2-ev-topper-01-detail-e2b8084fe6.webp",
    "measureImage": "/uploads/catalog-v2-ev-topper-01-scale-a04d8b9223.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-topper-01-context-08531cc210.webp",
      "/uploads/catalog-v2-ev-topper-01-base-8def7494bf.webp",
      "/uploads/catalog-v2-ev-topper-01-detail-e2b8084fe6.webp",
      "/uploads/catalog-v2-ev-topper-01-scale-a04d8b9223.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Topper con caligrafía fluida y silueta botánica calada a láser en madera o acrílico.",
    "fullDescription": "La corona ideal para el pastel de bodas, XV años o aniversario. Diseñado con tipografía fina resistente con corte láser Sculpfun S9 y vástago integrado para inserción firme sin dañar el decorado.",
    "specifications": {
      "dimensions": "18 cm de ancho x 22 cm de alto (incluye 6 cm de vástago)",
      "material": "Madera natural selecta de 4 mm o acrílico espejo grado alimenticio (sin MDF)",
      "finish": "Capa de barniz transparente sellador no tóxico en estructura y vástago apto para repostería",
      "includes": "1 Cake Topper con base protectora para conservación posterior",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Limpiar con paño suave seco; guardar como recuerdo en su caja."
    },
    "variants": [
      {
        "name": "Material y Tono de Barniz",
        "options": [
          "Madera Natural Barniz Transparente",
          "Madera Tinte Nogal Americano",
          "Acrílico Espejo Dorado",
          "Acrílico Espejo Plata"
        ]
      },
      {
        "name": "Motivo",
        "options": [
          "\"Nuestra Boda\" con silueta de olivo",
          "\"Mis XV Años\"",
          "Nombres entrelazados"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres de los festejados",
      "Fecha del evento",
      "Silueta complementaria"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.883Z",
    "stockQuantity": 10,
    "costPrice": 46,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 32,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-PIN-GRA-001",
      "legacyCode": "EV-TOPPER-01",
      "area": "EVE",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Selecta 4mm (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Grado Repostería",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-topper-01-scale-a04d8b9223.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-TOPPER-01\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-TOPPER-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "place-cards-hexagonales-ev-place",
    "code": "EV-PLACE-01",
    "name": "Identificadores de Asiento / Place Cards Hexagonales (Set 10 pzas)",
    "priceType": "fixed",
    "price": 179,
    "priceUnit": "set",
    "status": "published",
    "featured": false,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-empresariales"
    ],
    "techniques": [
      "laser",
      "vinyl"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-place-01-context-26ae56aec3.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-place-01-base-7894ac7661.webp",
    "detailImage": "/uploads/catalog-v2-ev-place-01-detail-78e4e6cecf.webp",
    "measureImage": "/uploads/catalog-v2-ev-place-01-scale-6b1bd49a2b.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-place-01-context-26ae56aec3.webp",
      "/uploads/catalog-v2-ev-place-01-base-7894ac7661.webp",
      "/uploads/catalog-v2-ev-place-01-detail-78e4e6cecf.webp",
      "/uploads/catalog-v2-ev-place-01-scale-6b1bd49a2b.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Plaquitas geométricas para asignar asientos a los invitados con grabado o vinil dorado.",
    "fullDescription": "Elegancia pura en la vajilla de cada invitado. Tarjetas hexagonales en madera natural o acrílico traslúcido con el nombre de cada invitado para orientar el banquete nupcial o cena de gala.",
    "specifications": {
      "dimensions": "8 x 7 cm cada hexágono, espesor 3 mm",
      "material": "Madera fina de abedul o acrílico cristal",
      "finish": "Grabado láser Sculpfun S9 o vinil metalizado Silhouette Cameo",
      "includes": "Set de 10 identificadores personalizados individualmente",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Los invitados los conservan como recuerdo personal."
    },
    "variants": [
      {
        "name": "Formato",
        "options": [
          "Madera grabado láser",
          "Acrílico con letras doradas",
          "Acrílico esmerilado con blanco"
        ]
      }
    ],
    "customizationOptions": [
      "Lista de nombres de los invitados",
      "Número de mesa"
    ],
    "availability": "made_to_order",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 0,
    "costPrice": 64,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 48,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-ACR-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-ACR-GRA-001",
      "legacyCode": "EV-PLACE-01",
      "area": "EVE",
      "technique": "LAS",
      "material": "ACR",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Acrílico Cristal / Color - Termoplásticos",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-place-01-scale-6b1bd49a2b.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-PLACE-01\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-PLACE-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "libro-firmas-rustico-madera-ev-guest",
    "code": "EV-GUEST-01",
    "name": "Libro de Firmas Rústico con Portada de Madera Grabada",
    "priceType": "fixed",
    "price": 349,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-guest-01-context-624c0572b5.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-guest-01-base-833cfff915.webp",
    "detailImage": "/uploads/catalog-v2-ev-guest-01-detail-ef051863f2.webp",
    "measureImage": "/uploads/catalog-v2-ev-guest-01-scale-d57c627388.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-guest-01-context-624c0572b5.webp",
      "/uploads/catalog-v2-ev-guest-01-base-833cfff915.webp",
      "/uploads/catalog-v2-ev-guest-01-detail-ef051863f2.webp",
      "/uploads/catalog-v2-ev-guest-01-scale-d57c627388.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Álbum con pastas de madera natural grabada, arillos rústicos y hojas opalina para dedicatorias.",
    "fullDescription": "Guarda los mejores deseos de tus seres queridos para siempre. Portada rígida de madera natural contrachapada grabada a láser con diseño botánico, encuadernación metálica oculta y 35 hojas gruesas de cartulina opalina color crema.",
    "specifications": {
      "dimensions": "28 x 21 cm (Formato apaisado / horizontal)",
      "material": "Tapas de madera natural sólida / abedul fino de 4 mm (sin MDF), hojas de cartulina opalina de 180 g",
      "finish": "Capa protectora de barniz transparente satinado y tintes para madera",
      "includes": "Libro completo con 35 hojas (70 páginas útiles) + bolígrafo de madera a juego",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Conservar en ambiente seco alejado de luz solar directa."
    },
    "variants": [
      {
        "name": "Tono de Barniz de Portada",
        "options": [
          "Barniz Natural Transparente Pino Nórdico",
          "Nogal Americano Cálido",
          "Caoba Clásico",
          "Roble Claro"
        ]
      },
      {
        "name": "Estilo de carátula",
        "options": [
          "Monograma con ramas de olivo",
          "Texto caligráfico de nombres y fecha"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres y fecha grabados",
      "Frase conmemorativa en contraportada"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 10,
    "costPrice": 128,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 95,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 15,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-PIN-GRA-001",
      "legacyCode": "EV-GUEST-01",
      "area": "EVE",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Abedul 4mm (Sin MDF)",
        "acabadoTaller": "✨ Barniz Transparente Protector Satinado",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-guest-01-scale-d57c627388.webp",
    "privateNotes": "Madera natural de abedul 4mm. Grabado profundo de carátula, capa uniforme de barniz transparente sellador y encuadernado artesanal con herrajes.",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-GUEST-01\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-GUEST-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "cajitas-souvenir-botanicas-ev-cajitas",
    "code": "EV-CAJITAS-01",
    "name": "Cajitas Souvenir de Recuerdo con Calado Botánico (Set 12 pzas)",
    "priceType": "fixed",
    "price": 199,
    "priceUnit": "set",
    "status": "published",
    "featured": false,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-bautizos"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-cajitas-01-context-bd0d133482.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-cajitas-01-base-c8207603ba.webp",
    "detailImage": "/uploads/catalog-v2-ev-cajitas-01-detail-373d619672.webp",
    "measureImage": "/uploads/catalog-v2-ev-cajitas-01-scale-c2a7f3aa8c.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-cajitas-01-context-bd0d133482.webp",
      "/uploads/catalog-v2-ev-cajitas-01-base-c8207603ba.webp",
      "/uploads/catalog-v2-ev-cajitas-01-detail-373d619672.webp",
      "/uploads/catalog-v2-ev-cajitas-01-scale-c2a7f3aa8c.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Mini cajas para almendras confitadas o dulces finos con filigrana botánica calada.",
    "fullDescription": "El agradecimiento perfecto para cada mesa. Cajitas armables con corte láser de alta definición en cartulina rígida kraft o madera natural calada de 3 mm (sin MDF), con listón de satín para anudar.",
    "specifications": {
      "dimensions": "6.5 x 6.5 x 6.5 cm cada cajita",
      "material": "Madera natural calada de 3mm o cartulina kraft gruesa artesanal (sin MDF)",
      "finish": "Corte limpio sin quemaduras visibles, barniz transparente y listón de seda",
      "includes": "Set de 12 cajitas armadas con sus listones",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Aptas para dulces envueltos, bombones o joyería de recuerdo."
    },
    "variants": [
      {
        "name": "Material y Tono",
        "options": [
          "Madera Natural Barniz Transparente",
          "Madera Tinte Nogal Americano",
          "Cartulina Kraft Artesanal",
          "Blanco Marfil Aperlado"
        ]
      }
    ],
    "customizationOptions": [
      "Iniciales grabadas en la tapa",
      "Color de listón"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 6,
    "costPrice": 72,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 55,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-PIN-GRA-001",
      "legacyCode": "EV-CAJITAS-01",
      "area": "EVE",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural Calada 3mm o Kraft Artesanal (Sin MDF)",
        "acabadoTaller": "✨ Calado Láser Limpio & Barniz Transparente",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-cajitas-01-scale-c2a7f3aa8c.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CAJITAS-01\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CAJITAS-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "abanicos-jardin-grabados-ev-abanico",
    "code": "EV-ABANICO-01",
    "name": "Abanicos de Mano Grabados para Ceremonias de Jardín (Set 6 pzas)",
    "priceType": "fixed",
    "price": 219,
    "priceUnit": "set",
    "status": "published",
    "featured": false,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-temporada"
    ],
    "techniques": [
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-abanico-01-context-5005b0a926.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-abanico-01-base-fcdb34ca9d.webp",
    "detailImage": "/uploads/catalog-v2-ev-abanico-01-detail-e11c776d78.webp",
    "measureImage": "/uploads/catalog-v2-ev-abanico-01-scale-2fcc7e991d.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-abanico-01-context-5005b0a926.webp",
      "/uploads/catalog-v2-ev-abanico-01-base-fcdb34ca9d.webp",
      "/uploads/catalog-v2-ev-abanico-01-detail-e11c776d78.webp",
      "/uploads/catalog-v2-ev-abanico-01-scale-2fcc7e991d.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Abanicos de madera fina con varillaje grabado a láser con los nombres y fecha del evento.",
    "fullDescription": "Confort y frescura con estilo para ceremonias civiles, religiosas o recepciones en jardines y haciendas. Varillas de madera suave con grabado láser de alta precisión y tela ligera blanca o crema.",
    "specifications": {
      "dimensions": "21 cm cerrado, apertura de 38 cm",
      "material": "Varillaje de madera natural de abedul pulida (sin MDF) y tela poliéster transpirable",
      "finish": "Grabado láser nítido en varilla principal con capa de barniz transparente sellador",
      "includes": "Set de 6 abanicos en bolsita individual de celofán",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Evitar mojar la madera."
    },
    "variants": [
      {
        "name": "Color de tela",
        "options": [
          "Blanco puro ceremonial",
          "Crema marfil",
          "Rosa pálido"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres y fecha grabados en varilla"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 8,
    "costPrice": 82,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 65,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-LAS-PIN-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-LAS-PIN-GRA-001",
      "legacyCode": "EV-ABANICO-01",
      "area": "EVE",
      "technique": "LAS",
      "material": "PIN",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "⚡ Corte / Grabado Láser CO2 (Láser CO2 / Diodo)",
        "materiaPrima": "🪵 Madera Natural de Abedul Pulida (Sin MDF)",
        "acabadoTaller": "✨ Grabado Láser Fino & Barniz Sellador",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-abanico-01-scale-2fcc7e991d.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-ABANICO-01\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-ABANICO-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "copas-brindis-vinil-metalico-ev-copas",
    "code": "EV-COPAS-01",
    "name": "Par de Copas de Brindis con Vinil Permanente Dorado / Blanco",
    "priceType": "fixed",
    "price": 229,
    "priceUnit": "set",
    "status": "published",
    "featured": true,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos"
    ],
    "techniques": [
      "vinyl"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-copas-01-context-5240efee53.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-copas-01-base-40a29f4357.webp",
    "detailImage": "/uploads/catalog-v2-ev-copas-01-detail-d9f7395a3f.webp",
    "measureImage": "/uploads/catalog-v2-ev-copas-01-scale-9850945541.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-copas-01-context-5240efee53.webp",
      "/uploads/catalog-v2-ev-copas-01-base-40a29f4357.webp",
      "/uploads/catalog-v2-ev-copas-01-detail-d9f7395a3f.webp",
      "/uploads/catalog-v2-ev-copas-01-scale-9850945541.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Dúo de copas estilizadas tipo flauta para el brindis de honor de los novios o festejada.",
    "fullDescription": "El momento cumbre del brindis merece piezas memorables. Dos copas tipo flauta de vidrio de fiesta decoradas con vinil adhesivo permanente de grado profesional cortado en Silhouette Cameo.",
    "specifications": {
      "dimensions": "22 cm de alto, capacidad 190 ml",
      "material": "Vidrio transparente cristalino y vinil adhesivo permanente Oracal 651",
      "finish": "Acabado brillante oro metalizado o blanco esmerilado",
      "includes": "2 copas personalizadas en caja de seguridad acolchada",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Lavar a mano suavemente con esponja; no tallar sobre el vinil."
    },
    "variants": [
      {
        "name": "Tono de vinil",
        "options": [
          "Oro metalizado brillante",
          "Blanco tiza mate",
          "Plata espejo"
        ]
      },
      {
        "name": "Diseño",
        "options": [
          "\"Sr. & Sra.\" con fecha",
          "Nombres de pila con corazón",
          "\"Mis XV\" con corona"
        ]
      }
    ],
    "customizationOptions": [
      "Nombres de los homenajeados",
      "Fecha del brindis"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 8,
    "costPrice": 88,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 70,
      "machineHours": 0.25,
      "otherEquipCost": 0,
      "manualWorkMin": 10,
      "prepCost": 0,
      "packagingCost": 10,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-VIN-TEX-BRI-001",
    "skuBreakdown": {
      "standardSku": "EVE-VIN-TEX-BRI-001",
      "legacyCode": "EV-COPAS-01",
      "area": "EVE",
      "technique": "VIN",
      "material": "TEX",
      "finish": "BRI",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "✂️ Vinil Adhesivo / Textil (Plotter de Corte)",
        "materiaPrima": "🪵 Textil / Manta de Algodón - Telas & Confección",
        "acabadoTaller": "✨ Sellador Brillante / Resina - Efecto cristal brillante",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-copas-01-scale-9850945541.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-COPAS-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-COPAS-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 15,
      "postProcessingMinutes": 10,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 15,
    "postProcessingTimeMinutes": 10
  },
  {
    "id": "charms-marcacopas-botanicos-ev-charms",
    "code": "EV-CHARMS-01",
    "name": "Marcacopas / Charms Botánicos para Invitados (Set 12 pzas)",
    "priceType": "fixed",
    "price": 129,
    "priceUnit": "set",
    "status": "published",
    "featured": false,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-empresariales"
    ],
    "techniques": [
      "3d",
      "laser"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-charms-01-context-ba2b75a544.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-charms-01-base-8ff4040282.webp",
    "detailImage": "/uploads/catalog-v2-ev-charms-01-detail-49a316c101.webp",
    "measureImage": "/uploads/catalog-v2-ev-charms-01-scale-e94b9ebbe4.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-charms-01-context-ba2b75a544.webp",
      "/uploads/catalog-v2-ev-charms-01-base-8ff4040282.webp",
      "/uploads/catalog-v2-ev-charms-01-detail-49a316c101.webp",
      "/uploads/catalog-v2-ev-charms-01-scale-e94b9ebbe4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Anillos con dije botánico o inicial para el tallo de las copas en cocteles y banquetes.",
    "fullDescription": "Evita confusiones en la barra de bebidas y da un toque de distinción a cada copa. Argollas flexibles con mini dijes de madera o PLA botánico en relieve para colocar en el tallo de cada copa.",
    "specifications": {
      "dimensions": "Argolla 2.5 cm diámetro, dije 2 x 2 cm",
      "material": "Argolla metálica con dije de madera fina o PLA biodegradable",
      "finish": "Grabado nítido con siluetas florales y letras",
      "includes": "Set de 12 marcacopas surtidos",
      "minQuantity": 1,
      "estimatedLeadTime": "2 días hábiles",
      "careNotes": "Reutilizables y lavables."
    },
    "variants": [
      {
        "name": "Material del dije",
        "options": [
          "Madera natural grabada",
          "PLA verde olivo botánico",
          "Acrílico traslúcido"
        ]
      }
    ],
    "customizationOptions": [
      "Iniciales individuales o siluetas botánicas"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 10,
    "costPrice": 48,
    "costBreakdown": {
      "plaGrams": 40,
      "tpuGrams": 0,
      "otherMaterialsCost": 15,
      "machineHours": 1.8,
      "otherEquipCost": 0,
      "manualWorkMin": 8,
      "prepCost": 0,
      "packagingCost": 5,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-HYB-PLA-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-HYB-PLA-GRA-001",
      "legacyCode": "EV-CHARMS-01",
      "area": "EVE",
      "technique": "HYB",
      "material": "PLA",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-charms-01-scale-e94b9ebbe4.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Diseño 3D",
      "license": "Comercial Autorizado",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CHARMS-01\\",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm estándar FDM.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Diseño 3D",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CHARMS-01\\",
    "manufacturingTimes": {
      "machineHours": 1,
      "machineMinutes": 48,
      "postProcessingMinutes": 8,
      "leadTimeDays": "2 días hábiles"
    },
    "manufacturingTimeMinutes": 108,
    "postProcessingTimeMinutes": 8
  },
  {
    "id": "mini-letrero-qr-candybar-ev-candy",
    "code": "EV-CANDY-01",
    "name": "Mini Letrero de Estación con Código QR (Candy Bar / Fotos)",
    "priceType": "fixed",
    "price": 169,
    "priceUnit": "pieza",
    "status": "published",
    "featured": false,
    "worlds": [
      "eventos"
    ],
    "categories": [
      "eventos-bodas",
      "eventos-xvanos"
    ],
    "techniques": [
      "laser",
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-ev-candy-01-context-302c2af2a0.webp",
    "whiteBgImage": "/uploads/catalog-v2-ev-candy-01-base-6662c610ab.webp",
    "detailImage": "/uploads/catalog-v2-ev-candy-01-detail-9e12396cdf.webp",
    "measureImage": "/uploads/catalog-v2-ev-candy-01-scale-f2621c7555.webp",
    "gallery": [
      "/uploads/catalog-v2-ev-candy-01-context-302c2af2a0.webp",
      "/uploads/catalog-v2-ev-candy-01-base-6662c610ab.webp",
      "/uploads/catalog-v2-ev-candy-01-detail-9e12396cdf.webp",
      "/uploads/catalog-v2-ev-candy-01-scale-f2621c7555.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Producto en ambiente real (referencia)",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Producto completo sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento de la foto sobre fondo blanco",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Medidas y referencia de tamaño",
        "shortLabel": "Medidas y escala",
        "type": "measures"
      }
    ],
    "shortDescription": "Placa con peana de madera para guiar a los invitados: \"Mesa de Dulces\", \"Audio Guestbook\" o \"Comparte tus fotos\".",
    "fullDescription": "Señalización estética para las mesas clave del evento. Código QR grabado que enlaza directo al álbum de Google Fotos o Instagram para recopilar las fotos tomadas por los asistentes en tiempo real.",
    "specifications": {
      "dimensions": "18 x 13 cm con peana de apoyo",
      "material": "Madera fina de abedul de 4 mm con base ranurada sólida",
      "finish": "Corte láser biselado y barniz mate",
      "includes": "1 placa grabada con QR + 1 base de apoyo",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 3 días hábiles",
      "careNotes": "Colocar en superficie plana."
    },
    "variants": [
      {
        "name": "Función",
        "options": [
          "\"Comparte tus fotos\" (QR)",
          "\"Mesa de Dulces / Disfruten\"",
          "\"Libro de Firmas / Dedícanos unas palabras\""
        ]
      }
    ],
    "customizationOptions": [
      "Enlace web o QR a codificar",
      "Nombres de los anfitriones"
    ],
    "availability": "in_stock",
    "createdAt": "2026-10-14T19:14:22.886Z",
    "stockQuantity": 5,
    "costPrice": 62,
    "costBreakdown": {
      "plaGrams": 0,
      "tpuGrams": 0,
      "otherMaterialsCost": 45,
      "machineHours": 0.33,
      "otherEquipCost": 0,
      "manualWorkMin": 15,
      "prepCost": 0,
      "packagingCost": 6,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Estimado"
    },
    "sku": "EVE-HYB-PLA-GRA-001",
    "skuBreakdown": {
      "standardSku": "EVE-HYB-PLA-GRA-001",
      "legacyCode": "EV-CANDY-01",
      "area": "EVE",
      "technique": "HYB",
      "material": "PLA",
      "finish": "GRA",
      "sequence": "001",
      "instructionsForStaff": {
        "destino": "🎉 Eventos Especiales",
        "maquinaria": "🔄 Híbrido (Láser + Impresión 3D) (Láser + Impresión 3D)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Grabado Láser Profundo - Bajo relieve oscurecido por calor",
        "lote": "#001"
      }
    },
    "dimensionsImage": "/uploads/catalog-v2-ev-candy-01-scale-f2621c7555.webp",
    "repository": {
      "platform": "local",
      "makerworldUrl": "",
      "makerworldModelId": "",
      "author": "Taller Artesano",
      "license": "Diseño Exclusivo Artesano Digital",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CANDY-01\\",
      "cloudUrl": "",
      "slicerNotes": "Corte MDF/Acrílico 3mm a 65% potencia, grabado 300mm/s.",
      "additionalLinks": []
    },
    "makerWorldAuthor": "Taller Artesano",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\EV-CANDY-01\\",
    "manufacturingTimes": {
      "machineHours": 0,
      "machineMinutes": 20,
      "postProcessingMinutes": 15,
      "leadTimeDays": "1 a 3 días hábiles"
    },
    "manufacturingTimeMinutes": 20,
    "postProcessingTimeMinutes": 15
  },
  {
    "id": "tarjetero-negocios-t17",
    "code": "T17",
    "name": "Tarjetero de Negocios Minimalista",
    "sku": "BIZ-3D-PLA-MAT-017",
    "skuBreakdown": {
      "standardSku": "BIZ-3D-PLA-MAT-017",
      "legacyCode": "T17",
      "area": "BIZ",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT",
      "sequence": "017",
      "instructionsForStaff": {
        "destino": "💼 Negocios, Marcas & Emprendedores",
        "maquinaria": "🧊 Impresión 3D (FDM / Filamento) (Granja 3D FDM)",
        "materiaPrima": "🪵 Filamento PLA - Polímeros 3D",
        "acabadoTaller": "✨ Barniz / Textura Mate - Terso sin reflejos, elegante",
        "lote": "#017"
      }
    },
    "priceType": "starting_at",
    "price": 149,
    "regularPrice": 189,
    "savings": 40,
    "priceUnit": "pieza",
    "status": "published",
    "featured": true,
    "worlds": [
      "negocios",
      "hogar"
    ],
    "categories": [
      "negocios-oficinas",
      "negocios-tiendas",
      "hogar-decoracion"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/tarjetero_vista1_contexto.webp",
    "whiteBgImage": "/uploads/tarjetero_vista2_fondo_blanco.webp",
    "detailImage": "/uploads/tarjetero_vista3_detalle.webp",
    "measureImage": "/uploads/tarjetero_vista4_medidas.webp",
    "dimensionsImage": "/uploads/tarjetero_vista4_medidas.webp",
    "gallery": [
      "/uploads/tarjetero_vista1_contexto.webp",
      "/uploads/tarjetero_vista2_fondo_blanco.webp",
      "/uploads/tarjetero_vista3_detalle.webp",
      "/uploads/tarjetero_vista4_medidas.webp"
    ],
    "shortDescription": "Soporte exhibidor minimalista de escritorio para tarjetas de presentación de negocios impreso en 3D.",
    "fullDescription": "Elegante soporte exhibidor de sobremesa con diseño biselado y ranura inclinada ergonómica. Diseñado para sostener paquetes de tarjetas de visita estándar de forma ordenada y profesional en mostradores, recepciones o escritorios de trabajo.",
    "specifications": {
      "dimensions": "9,5 cm ancho × 6,0 cm fondo × 4,5 cm alto",
      "material": "Polímero biodegradable PLA Grafito / Negro carbón",
      "finish": "Satinado mate con textura sutil de impresión 3D FDM",
      "includes": "Soporte para tarjetas de presentación (capacidad ~40 tarjetas estándar)",
      "minQuantity": 1,
      "estimatedLeadTime": "1 a 2 días hábiles",
      "careNotes": "Limpieza suave con paño de microfibra seco. No exponer a temperaturas mayores a 50°C."
    },
    "variants": [
      {
        "name": "Color",
        "options": [
          "Grafito carbón",
          "Negro mate",
          "Blanco marfil",
          "Verde olivo",
          "Madera natural"
        ]
      }
    ],
    "customizationOptions": [
      "Grabado de logotipo en frontal",
      "Color corporativo a medida"
    ],
    "availability": "in_stock",
    "stockQuantity": 15,
    "costPrice": 42,
    "costBreakdown": {
      "plaGrams": 45,
      "tpuGrams": 0,
      "otherMaterialsCost": 5,
      "machineHours": 1.75,
      "otherEquipCost": 0,
      "manualWorkMin": 5,
      "prepCost": 0,
      "packagingCost": 8,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 0,
      "shippingCost": 0,
      "costStatus": "Confirmado"
    },
    "manufacturingTimes": {
      "machineHours": 1,
      "machineMinutes": 45,
      "postProcessingMinutes": 5,
      "leadTimeDays": "1 a 2 días hábiles"
    },
    "manufacturingTimeMinutes": 105,
    "postProcessingTimeMinutes": 5,
    "repository": {
      "platform": "makerworld",
      "makerworldUrl": "https://makerworld.com/es/models/1067062",
      "makerworldModelId": "1067062",
      "author": "CrazyModding",
      "license": "Standard Digital File License (Comercial)",
      "localPath": "C:\\Users\\OEM\\Modelos3D\\Tarjetero_CrazyModding\\business_card_stand.3mf",
      "cloudUrl": "",
      "slicerNotes": "Boquilla 0.4mm, capa 0.20mm, 15% giroide, sin soportes.",
      "additionalLinks": []
    },
    "makerWorldModel": "https://makerworld.com/es/models/1067062",
    "makerWorldAuthor": "CrazyModding",
    "localPath": "C:\\Users\\OEM\\Modelos3D\\Tarjetero_CrazyModding\\business_card_stand.3mf"
  }
,
  {
    "id": "figuras-funko-personalizadas",
    "code": "CUST-FUNKO",
    "name": "Figura Estilo Funko Custom — Retrato Individual & Estilo Libre",
    "priceType": "fixed",
    "price": 690,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-individual",
      "hogar-regalos"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-casual-1.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-casual-1.webp",
      "/uploads/catalog-v2-cust-casual-2.webp",
      "/uploads/catalog-v2-cust-casual-3.webp",
      "/uploads/catalog-v2-cust-casual-4.webp"
    ],
    "shortDescription": "Convierte a tu persona favorita en una figura 3D coleccionable estilo Funko con caja POP! Custom con su nombre.",
    "fullDescription": "¡De una foto... a tu Funko! Diseñamos e imprimimos en 3D tu figura coleccionable personalizada a partir de tus fotos reales. Incluye modelado digital previo, impresión aditiva de alta resolución, acabados a todo color y caja de colección POP! CUSTOM con nombre personalizado.",
    "specifications": {
      "dimensions": "Figura de 10 a 11 cm de altura · Caja de 16 x 11.5 x 9 cm",
      "material": "Filamentos PLA+ y resina de alta definición con caja en cartón sulfatado y ventana de acetato",
      "finish": "Pintura y acabado detallado a mano con sellado protector mate",
      "includes": "Figura 3D personalizada + caja coleccionable POP! Custom con diseño exclusivo",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Pieza coleccionable de exhibición. Limpiar el polvo con brocha suave o paño seco."
    },
    "variants": [
      {
        "name": "Estilo",
        "options": [
          "Individual (1 Persona)",
          "Mascota Adicional (+ $250 MXN)"
        ]
      }
    ],
    "whiteBgImage": "/uploads/catalog-v2-cust-casual-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-casual-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-casual-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-casual-4.webp",
    "galleryMeta": [
      {
        "label": "1. Figura en ambiente de exhibición",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Detalle de rostro, cabello y vestimenta",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja POP! Custom de colección",
        "shortLabel": "Caja y medidas",
        "type": "measures"
      }
    ],
    "costPrice": 194.5,
    "costBreakdown": {
      "plaGrams": 75,
      "tpuGrams": 0,
      "otherMaterialsCost": 46,
      "machineHours": 4.5,
      "otherEquipCost": 0,
      "manualWorkMin": 45,
      "prepCost": 0,
      "packagingCost": 28,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 8,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 30,
      "postProcessingMinutes": 45,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "sku": "CUST-3D-CASUAL-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-CASUAL-001",
      "legacyCode": "CUST-FUNKO",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 paredes, 15% infill."
    },
    "category": "personalizados-individual",
    "regularPrice": 790,
    "savings": 100
  },
  {
    "id": "de-dibujo-a-figura-3d",
    "code": "CUST-DIBUJO-DRAGON",
    "createdAt": "2026-10-24T19:29:00.000Z",
    "updatedAt": "2026-10-24T19:29:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Dragón Mágico)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-1.webp",
      "/uploads/catalog-v2-cust-dibujo-2.webp",
      "/uploads/catalog-v2-cust-dibujo-3.webp",
      "/uploads/catalog-v2-cust-dibujo-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Tienes un dibujo de tu pequeño? Nosotros lo convertimos en una escultura 3D real a todo volumen respetando cada trazo.",
    "fullDescription": "¡El dibujo de tu pequeño, ahora en volumen! Convertimos los dibujos hechos a mano de tus hijos en esculturas 3D reales. Nuestro equipo digitaliza cada trazo, respeta la esencia y colores del dibujo, y lo imprime en tecnología aditiva 3D de alta precisión. Incluye base peana grabada con el nombre del niño y la fecha.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-001",
      "legacyCode": "CUST-DIBUJO-DRAGON",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "de-dibujo-a-figura-3d-ajolote",
    "code": "CUST-DIBUJO-AJOLOTE",
    "createdAt": "2026-10-24T19:30:00.000Z",
    "updatedAt": "2026-10-24T19:30:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Ajolote)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-ajolote-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-ajolote-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-ajolote-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-ajolote-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-ajolote-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-ajolote-1.webp",
      "/uploads/catalog-v2-cust-dibujo-ajolote-2.webp",
      "/uploads/catalog-v2-cust-dibujo-ajolote-3.webp",
      "/uploads/catalog-v2-cust-dibujo-ajolote-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Tienes un dibujo de un tierno ajolote hecho por tu pequeña? Lo convertimos en una figura 3D real respetando sus branquias, carita y colores originales.",
    "fullDescription": "¡El dibujo del ajolote de tu pequeña, ahora en volumen! Convertimos sus trazos en una figura tridimensional adorable con peana personalizada.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-AJOLOTE",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-AJOLOTE",
      "legacyCode": "CUST-DIBUJO-AJOLOTE",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "de-dibujo-a-figura-3d-dinosaurio",
    "code": "CUST-DIBUJO-DINO",
    "createdAt": "2026-10-24T19:31:00.000Z",
    "updatedAt": "2026-10-24T19:31:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Dinosaurio / T-Rex)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-dino-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-dino-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-dino-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-dino-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-dino-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-dino-1.webp",
      "/uploads/catalog-v2-cust-dibujo-dino-2.webp",
      "/uploads/catalog-v2-cust-dibujo-dino-3.webp",
      "/uploads/catalog-v2-cust-dibujo-dino-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Tienes un dibujo de un dinosaurio o T-Rex hecho por tu pequeño? Lo convertimos en una escultura 3D real respetando cada diente, púa y trazo.",
    "fullDescription": "¡El dibujo de dinosaurio de tu hijo hecho realidad! Digitalizamos el T-Rex infantil y lo modelamos en relieve 3D a todo detalle con base grabada.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-DINO",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-DINO",
      "legacyCode": "CUST-DIBUJO-DINO",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "de-dibujo-a-figura-3d-cohete",
    "code": "CUST-DIBUJO-COHETE",
    "createdAt": "2026-10-24T19:32:00.000Z",
    "updatedAt": "2026-10-24T19:32:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Cohete Espacial)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-cohete-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-cohete-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-cohete-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-cohete-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-cohete-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-cohete-1.webp",
      "/uploads/catalog-v2-cust-dibujo-cohete-2.webp",
      "/uploads/catalog-v2-cust-dibujo-cohete-3.webp",
      "/uploads/catalog-v2-cust-dibujo-cohete-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Tu pequeño dibujó un cohete espacial hacia la luna? Lo transformamos en una escultura 3D real con flamas y propulsores a todo volumen.",
    "fullDescription": "¡Despegue tridimensional! Convertimos el dibujo del cohete espacial infantil en una pieza 3D vibrante con llamarada de soporte.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-COHETE",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-COHETE",
      "legacyCode": "CUST-DIBUJO-COHETE",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "de-dibujo-a-figura-3d-coche",
    "code": "CUST-DIBUJO-COCHE",
    "createdAt": "2026-10-24T19:33:00.000Z",
    "updatedAt": "2026-10-24T19:33:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Coche de Carreras)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-coche-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-coche-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-coche-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-coche-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-coche-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-coche-1.webp",
      "/uploads/catalog-v2-cust-dibujo-coche-2.webp",
      "/uploads/catalog-v2-cust-dibujo-coche-3.webp",
      "/uploads/catalog-v2-cust-dibujo-coche-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Tu hijo dibujó un coche de carreras con escape y alerón? Lo convertimos en un auto 3D real con su número y detalles auténticos.",
    "fullDescription": "¡A toda velocidad! Llevamos el coche de carreras dibujado por tu pequeño a un modelo 3D con alerón, ruedas anchas y humo de propulsión.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-COCHE",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-COCHE",
      "legacyCode": "CUST-DIBUJO-COCHE",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "de-dibujo-a-figura-3d-monstruo",
    "code": "CUST-DIBUJO-MONSTRUO",
    "createdAt": "2026-10-24T19:34:00.000Z",
    "updatedAt": "2026-10-24T19:34:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Monstruo Divertido)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-monstruo-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-monstruo-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-monstruo-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-monstruo-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-monstruo-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-monstruo-1.webp",
      "/uploads/catalog-v2-cust-dibujo-monstruo-2.webp",
      "/uploads/catalog-v2-cust-dibujo-monstruo-3.webp",
      "/uploads/catalog-v2-cust-dibujo-monstruo-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Un monstruo divertido de muchos ojos y picos creado por tu niño? Lo convertimos en una figura 3D simpática y colorida que cobrará vida en su repisa.",
    "fullDescription": "¡Monstruos con personalidad! Esculpimos en 3D el monstruo que dibujó tu niño con sus múltiples ojos, picos y sonrisa simpática.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-MONSTRUO",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-MONSTRUO",
      "legacyCode": "CUST-DIBUJO-MONSTRUO",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "de-dibujo-a-figura-3d-castillo",
    "code": "CUST-DIBUJO-CASTILLO",
    "createdAt": "2026-10-24T19:35:00.000Z",
    "updatedAt": "2026-10-24T19:35:00.000Z",
    "name": "De Dibujo a Figura 3D Real (Edición Castillo Medieval)",
    "priceType": "fixed",
    "price": 680,
    "regularPrice": 790,
    "savings": 110,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-dibujo",
      "hogar-infantil"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-dibujo-castillo-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-dibujo-castillo-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-dibujo-castillo-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-dibujo-castillo-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-dibujo-castillo-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-dibujo-castillo-1.webp",
      "/uploads/catalog-v2-cust-dibujo-castillo-2.webp",
      "/uploads/catalog-v2-cust-dibujo-castillo-3.webp",
      "/uploads/catalog-v2-cust-dibujo-castillo-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Comparativa dibujo infantil y figura 3D física",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura 3D terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_bg"
      },
      {
        "label": "3. Acercamiento y detalle fino de modelado y textura",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Cotas de escala y medidas con referencia real",
        "shortLabel": "Medidas",
        "type": "measure"
      }
    ],
    "shortDescription": "¿Un castillo de torres, banderas y murallas dibujado por tus hijos? Lo modelamos en 3D respetando cada torre y puerta medieval.",
    "fullDescription": "¡Reino de fantasía en 3D! Modelamos el castillo dibujado a mano por tus hijos con murallas almenadas, torres con tejados y bandera de cumbre.",
    "specifications": {
      "dimensions": "Escala entre 10 y 15 cm de alto según proporción del dibujo",
      "material": "Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica",
      "finish": "Modelado orgánico tridimensional fiel a los trazos originales del dibujo infantil",
      "includes": "Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos."
    },
    "variants": [
      {
        "name": "Tamaño",
        "options": [
          "Escultura Mediana (10-12 cm)",
          "Escultura Grande (15 cm) (+ $180 MXN)",
          "Con Base Grabada en Madera/PLA (+ $120 MXN)"
        ]
      }
    ],
    "sku": "CUST-3D-DRAW-CASTILLO",
    "skuBreakdown": {
      "standardSku": "CUST-3D-DRAW-CASTILLO",
      "legacyCode": "CUST-DIBUJO-CASTILLO",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.16 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-dibujo"
  },
  {
    "id": "figuras-funko-mascotas",
    "code": "CUST-FUNKO-PETS",
    "createdAt": "2026-10-24T15:00:00.000Z",
    "updatedAt": "2026-10-24T15:00:00.000Z",
    "name": "Figura Estilo Funko Custom — Mascotas (Perros, Gatos y Compañeros)",
    "priceType": "fixed",
    "price": 650,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-mascotas",
      "hogar-mascotas"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-pets-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-pets-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-pets-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-pets-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-pets-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-pets-1.webp",
      "/uploads/catalog-v2-cust-pets-2.webp",
      "/uploads/catalog-v2-cust-pets-3.webp",
      "/uploads/catalog-v2-cust-pets-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Mascota en ambiente real",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura terminada sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Detalle de manchas, fisionomía y collar",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja POP! Custom de colección con ventana",
        "shortLabel": "Caja y empaque",
        "type": "measures"
      }
    ],
    "shortDescription": "Inmortalizamos a tu perrito, gatito o mascota en figura 3D estilo Funko con rasgos fieles y caja POP! Custom con su nombre.",
    "fullDescription": "Convierte a tu mejor amigo de cuatro patas en una figura coleccionable única de 10 cm. Diseñado a partir de fotos reales de tu mascota: recreamos la forma de sus orejas, manchas en el pelaje, postura y collar con placa. Incluye caja protectora de colección POP! CUSTOM con ventana frontal transparente y el nombre de tu mascota.",
    "specifications": {
      "dimensions": "Figura de 9 a 10 cm de alto · Caja de 16 x 11.5 x 9 cm",
      "material": "Filamento PLA+ biodegradable de alta tenacidad / Resina UV técnica",
      "finish": "Pintura y detallado fino a mano con sellador mate protector UV",
      "includes": "Figura 3D personalizada de mascota + Caja POP! Custom coleccionable con ventana",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Pieza de exhibición coleccionable. Limpiar polvo con brocha suave o paño seco."
    },
    "variants": [
      {
        "name": "Tipo de Mascota",
        "options": [
          "Perrito",
          "Gatito",
          "Conejo / Hurón",
          "Otra especie"
        ]
      },
      {
        "name": "Caja POP! Custom",
        "options": [
          "Con nombre estándar",
          "Con dedicatoria y número de edición"
        ]
      }
    ],
    "costPrice": 194.5,
    "costBreakdown": {
      "plaGrams": 75,
      "tpuGrams": 0,
      "otherMaterialsCost": 46,
      "machineHours": 4.5,
      "otherEquipCost": 0,
      "manualWorkMin": 45,
      "prepCost": 0,
      "packagingCost": 28,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 8,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 30,
      "postProcessingMinutes": 45,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "sku": "CUST-3D-PETS-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-PETS-001",
      "legacyCode": "CUST-FUNKO-PETS",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 paredes, 15% infill, soportes tipo árbol ligeros."
    },
    "category": "personalizados-mascotas",
    "regularPrice": 750,
    "savings": 100
  },
  {
    "id": "figuras-funko-parejas",
    "code": "CUST-FUNKO-PAREJAS",
    "createdAt": "2026-10-24T15:01:00.000Z",
    "updatedAt": "2026-10-24T15:01:00.000Z",
    "name": "Figura Estilo Funko Custom — Parejas (Set Dúo Novios, Esposos o Aniversario)",
    "priceType": "fixed",
    "price": 1290,
    "priceUnit": "set",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-parejas",
      "hogar-regalos"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-parejas-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-parejas-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-parejas-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-parejas-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-parejas-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-parejas-1.webp",
      "/uploads/catalog-v2-cust-parejas-2.webp",
      "/uploads/catalog-v2-cust-parejas-3.webp",
      "/uploads/catalog-v2-cust-parejas-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Pareja en ambiente real",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Set de 2 figuras sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Detalle de vestimenta, peinado y rostros",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja doble POP! con nombres y fecha",
        "shortLabel": "Caja conmemorativa",
        "type": "measures"
      }
    ],
    "shortDescription": "Set de figuras personalizadas para novios, bodas o aniversarios. Recreamos sus outfits favoritos, poses cómplices y caja doble conmemorativa.",
    "fullDescription": "El regalo más romántico y memorable para parejas. Fabricamos dos figuras Funko 3D personalizadas a partir de fotografías de ambos. Recreamos la ropa de su cita especial, boda o atuendos cotidianos, junto con peinados y accesorios. Empacadas en caja doble coleccionable con sus nombres, fecha de aniversario o dedicatoria de amor.",
    "specifications": {
      "dimensions": "Dos figuras de 10 a 11 cm de alto · Caja doble de 20 x 16 x 9 cm",
      "material": "Filamento PLA+ de grado ingeniería / Resina de alta definición",
      "finish": "Pintura fina a mano de textiles y facciones, sellado mate protector",
      "includes": "2 figuras 3D personalizadas + Caja doble POP! Custom conmemorativa con ventana",
      "minQuantity": 1,
      "estimatedLeadTime": "4 a 6 días hábiles",
      "careNotes": "Colección de exhibición. Evitar caídas y calor superior a 50°C."
    },
    "variants": [
      {
        "name": "Ocasión",
        "options": [
          "Aniversario / Novios",
          "Boda / Matrimonio",
          "San Valentín / Cumpleaños"
        ]
      },
      {
        "name": "Formato de Caja",
        "options": [
          "Caja Doble Conmemorativa",
          "Dos Cajas Individuales Separadas"
        ]
      }
    ],
    "costPrice": 347,
    "costBreakdown": {
      "plaGrams": 150,
      "tpuGrams": 0,
      "otherMaterialsCost": 74,
      "machineHours": 8.5,
      "otherEquipCost": 0,
      "manualWorkMin": 80,
      "prepCost": 0,
      "packagingCost": 42,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 15,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 8,
      "machineMinutes": 30,
      "postProcessingMinutes": 80,
      "leadTimeDays": "4 a 6 días hábiles"
    },
    "sku": "CUST-3D-COUPLE-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-COUPLE-001",
      "legacyCode": "CUST-FUNKO-PAREJAS",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 perímetros, 15% infill, soportes árbol."
    },
    "category": "personalizados-parejas",
    "regularPrice": 1490,
    "savings": 200
  },
  {
    "id": "figuras-funko-profesiones",
    "code": "CUST-FUNKO-PROF",
    "createdAt": "2026-10-24T15:02:00.000Z",
    "updatedAt": "2026-10-24T15:02:00.000Z",
    "name": "Figura Estilo Funko Custom — Profesiones & Graduaciones",
    "priceType": "fixed",
    "price": 750,
    "priceUnit": "figura",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-profesiones",
      "hogar-regalos"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-prof-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-prof-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-prof-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-prof-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-prof-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-prof-1.webp",
      "/uploads/catalog-v2-cust-prof-2.webp",
      "/uploads/catalog-v2-cust-prof-3.webp",
      "/uploads/catalog-v2-cust-prof-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Figura profesional en contexto",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura con uniforme sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Detalle de herramientas, bata y accesorios",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja POP! Custom con título profesional",
        "shortLabel": "Caja de título",
        "type": "measures"
      }
    ],
    "shortDescription": "Médicos con bata y estetoscopio, ingenieros con casco, abogados, maestros o chefs con uniforme oficial y caja con título conmemorativo.",
    "fullDescription": "Celebra años de esfuerzo, graduaciones universitarias o ascensos profesionales. Diseñamos la figura con el uniforme característico de la profesión y sus herramientas icónicas (estetoscopios, birretes, planos, libros, instrumental de cocina, etc.). La caja POP! Custom incluye su nombre completo y el título universitario o especialidad.",
    "specifications": {
      "dimensions": "Figura de 10 a 11 cm de alto · Caja de 16 x 11.5 x 9 cm",
      "material": "Filamento PLA+ de alta resistencia con accesorios en resina técnica",
      "finish": "Detallado a mano con sellado mate protector",
      "includes": "Figura 3D personalizada con accesorios de profesión + Caja POP! Custom con título profesional",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Ideal para escritorio, consultorio u oficina."
    },
    "variants": [
      {
        "name": "Área Profesional",
        "options": [
          "Salud (Médico/Enfermera/Odonto)",
          "Ingeniería / Arquitectura",
          "Leyes / Docencia",
          "Gastronomía / Arte"
        ]
      },
      {
        "name": "Accesorio Principal",
        "options": [
          "Estetoscopio / Instrumental",
          "Casco / Planos de obra",
          "Birrete / Título",
          "Herramienta de oficio"
        ]
      }
    ],
    "costPrice": 215.5,
    "costBreakdown": {
      "plaGrams": 85,
      "tpuGrams": 0,
      "otherMaterialsCost": 50,
      "machineHours": 5,
      "otherEquipCost": 0,
      "manualWorkMin": 50,
      "prepCost": 0,
      "packagingCost": 28,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 10,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 5,
      "machineMinutes": 0,
      "postProcessingMinutes": 50,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "sku": "CUST-3D-PROF-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-PROF-001",
      "legacyCode": "CUST-FUNKO-PROF",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 paredes, 15% infill giroide."
    },
    "category": "personalizados-profesiones",
    "regularPrice": 850,
    "savings": 100
  },
  {
    "id": "figuras-funko-amigos",
    "code": "CUST-FUNKO-AMIGOS",
    "createdAt": "2026-10-24T15:03:00.000Z",
    "updatedAt": "2026-10-24T15:03:00.000Z",
    "name": "Figura Estilo Funko Custom — Set Dúo Amigos & Cumpleaños (2 Figuras)",
    "priceType": "fixed",
    "price": 1250,
    "priceUnit": "set",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-amigos",
      "hogar-regalos"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-amigos-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-amigos-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-amigos-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-amigos-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-amigos-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-amigos-1.webp",
      "/uploads/catalog-v2-cust-amigos-2.webp",
      "/uploads/catalog-v2-cust-amigos-3.webp",
      "/uploads/catalog-v2-cust-amigos-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Figura de amigo en contexto",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Figura sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento a ropa y accesorios",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja POP! Custom con apodo y dedicatoria",
        "shortLabel": "Caja y empaque",
        "type": "measures"
      }
    ],
    "shortDescription": "Set de 2 figuras personalizadas de mejores amigos(as) o compas. Recreamos anécdotas, vestimentas icónicas y caja conmemorativa doble.",
    "fullDescription": "El regalo definitivo para tu mejor amigo o amiga en su cumpleaños o despedida. Recreamos su vestimenta favorita, gorra, guitarra, audífonos o elementos de su pasatiempo preferido. Entregado en su caja POP! Custom con apodos, frases de amistad y número de edición especial.",
    "specifications": {
      "dimensions": "Figura de 10 a 11 cm de alto · Caja de 16 x 11.5 x 9 cm",
      "material": "Filamento PLA+ biodegradable de alta calidad",
      "finish": "Pintura y sellado mate protector",
      "includes": "Figura 3D con vestimenta y hobby personalizado + Caja POP! Custom",
      "minQuantity": 1,
      "estimatedLeadTime": "3 a 5 días hábiles",
      "careNotes": "Conservar en su caja de colección o vitrina."
    },
    "variants": [
      {
        "name": "Cantidad de Figuras",
        "options": [
          "Individual (1 Amigo) (- $560 MXN)",
          "Dúo de Mejores Amigos",
          "Trío de Amigos (+ $550 MXN)"
        ]
      }
    ],
    "costPrice": 347,
    "costBreakdown": {
      "plaGrams": 150,
      "tpuGrams": 0,
      "otherMaterialsCost": 74,
      "machineHours": 8.5,
      "otherEquipCost": 0,
      "manualWorkMin": 80,
      "prepCost": 0,
      "packagingCost": 42,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 15,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 4,
      "machineMinutes": 30,
      "postProcessingMinutes": 45,
      "leadTimeDays": "3 a 5 días hábiles"
    },
    "sku": "CUST-3D-FRIEND-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-FRIEND-001",
      "legacyCode": "CUST-FUNKO-AMIGOS",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 paredes, 15% infill."
    },
    "category": "personalizados-amigos",
    "regularPrice": 1450,
    "savings": 200
  },
  {
    "id": "figuras-funko-familia",
    "code": "CUST-FUNKO-FAMILIA",
    "createdAt": "2026-10-24T15:04:00.000Z",
    "updatedAt": "2026-10-24T15:04:00.000Z",
    "name": "Figura Estilo Funko Custom — Pack Familiar (3 Figuras: Papá, Mamá e Hijos)",
    "priceType": "fixed",
    "price": 1790,
    "priceUnit": "pack",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-familia",
      "hogar-decoracion"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-familia-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-familia-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-familia-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-familia-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-familia-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-familia-1.webp",
      "/uploads/catalog-v2-cust-familia-2.webp",
      "/uploads/catalog-v2-cust-familia-3.webp",
      "/uploads/catalog-v2-cust-familia-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Familia completa en contexto",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Pack de 3 figuras sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento a detalles de cada integrante",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja panorámica coleccionable familiar",
        "shortLabel": "Caja familiar",
        "type": "measures"
      }
    ],
    "shortDescription": "Pack familiar completo de 3 figuras (Papá, Mamá e Hijo/Hija) en caja panorámica coleccionable con apellido familiar o dedicatoria.",
    "fullDescription": "El retrato de familia más innovador y tierno. Diseñamos e imprimimos en 3D a la familia completa a partir de sus fotos reales. Cada miembro refleja su altura proporcional, peinado, ropa y sonrisa. Incluye caja panorámica POP! Custom Family Edition con el apellido de la familia grabado al frente.",
    "specifications": {
      "dimensions": "Figuras de 7 a 11 cm según edad · Caja panorámica de 28 x 16 x 9 cm",
      "material": "Filamento PLA+ de alta densidad y durabilidad",
      "finish": "Pintura artesanal detallada con sellado protector mate",
      "includes": "Pack de 3 figuras personalizadas + Caja panorámica POP! Custom Familiar",
      "minQuantity": 1,
      "estimatedLeadTime": "5 a 7 días hábiles",
      "careNotes": "Ideal como centro de mesa o decoración en sala de estar."
    },
    "variants": [
      {
        "name": "Integrantes",
        "options": [
          "Papá, Mamá y 1 Hijo/Bebé (3 Figuras)",
          "Familia de 4 Figuras (+ $450 MXN)",
          "Familia + Mascota (+ $350 MXN)"
        ]
      }
    ],
    "costPrice": 479,
    "costBreakdown": {
      "plaGrams": 210,
      "tpuGrams": 0,
      "otherMaterialsCost": 100,
      "machineHours": 12,
      "otherEquipCost": 0,
      "manualWorkMin": 110,
      "prepCost": 0,
      "packagingCost": 55,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 20,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 12,
      "machineMinutes": 0,
      "postProcessingMinutes": 110,
      "leadTimeDays": "5 a 7 días hábiles"
    },
    "sku": "CUST-3D-FAM-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-FAM-001",
      "legacyCode": "CUST-FUNKO-FAMILIA",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 perímetros, 15% infill."
    },
    "category": "personalizados-familia",
    "regularPrice": 2050,
    "savings": 260
  },
  {
    "id": "figuras-funko-abuelitos",
    "code": "CUST-FUNKO-ABUELITOS",
    "createdAt": "2026-10-24T15:05:00.000Z",
    "updatedAt": "2026-10-24T15:05:00.000Z",
    "name": "Figura Estilo Funko Custom — Abuelitos (Set Dúo Homenaje a los Abuelos)",
    "priceType": "fixed",
    "price": 1290,
    "priceUnit": "set",
    "status": "published",
    "featured": true,
    "worlds": [
      "personalizados",
      "hogar"
    ],
    "categories": [
      "personalizados-abuelitos",
      "hogar-regalos"
    ],
    "techniques": [
      "3d"
    ],
    "primaryImage": "/uploads/catalog-v2-cust-abuelitos-1.webp",
    "whiteBgImage": "/uploads/catalog-v2-cust-abuelitos-2.webp",
    "detailImage": "/uploads/catalog-v2-cust-abuelitos-3.webp",
    "measureImage": "/uploads/catalog-v2-cust-abuelitos-4.webp",
    "dimensionsImage": "/uploads/catalog-v2-cust-abuelitos-4.webp",
    "gallery": [
      "/uploads/catalog-v2-cust-abuelitos-1.webp",
      "/uploads/catalog-v2-cust-abuelitos-2.webp",
      "/uploads/catalog-v2-cust-abuelitos-3.webp",
      "/uploads/catalog-v2-cust-abuelitos-4.webp"
    ],
    "galleryMeta": [
      {
        "label": "1. Abuelitos en ambiente cálido de hogar",
        "shortLabel": "En contexto",
        "type": "lifestyle"
      },
      {
        "label": "2. Set de abuelitos sobre fondo blanco",
        "shortLabel": "Fondo blanco",
        "type": "white_angle"
      },
      {
        "label": "3. Acercamiento a cabello cano, lentes y suéter",
        "shortLabel": "Detalle",
        "type": "detail"
      },
      {
        "label": "4. Caja conmemorativa Los Mejores Abuelos",
        "shortLabel": "Caja conmemorativa",
        "type": "measures"
      }
    ],
    "shortDescription": "El homenaje más tierno y conmovedor para los abuelos. Capturamos sus lentes, cabello cano, ropa favorita y caja conmemorativa con dedicatoria.",
    "fullDescription": "Los abuelos son el corazón del hogar. Diseñamos este tributo en 3D recreando con máxima ternura sus lentes, peinados canosos, suéteres tejidos y sonrisas entrañables. Presentado en caja conmemorativa especial con ventana, dedicatoria de los nietos y acabado resistente de colección.",
    "specifications": {
      "dimensions": "Dos figuras de 10 a 11 cm de alto · Caja doble de 20 x 16 x 9 cm",
      "material": "Filamento PLA+ de alta calidad y lentes en resina translúcida/técnica",
      "finish": "Detallado a mano con sellador mate protector UV",
      "includes": "Set de 2 figuras de abuelitos + Caja conmemorativa con ventana y dedicatoria",
      "minQuantity": 1,
      "estimatedLeadTime": "4 a 6 días hábiles",
      "careNotes": "Tesoro familiar para exhibición en vitrina o librero."
    },
    "variants": [
      {
        "name": "Presentación",
        "options": [
          "Set Dúo (Abuelo y Abuela)",
          "Abuelito Individual (- $570 MXN)",
          "Abuelita Individual (- $570 MXN)"
        ]
      }
    ],
    "costPrice": 360,
    "costBreakdown": {
      "plaGrams": 150,
      "tpuGrams": 0,
      "otherMaterialsCost": 77,
      "machineHours": 8.5,
      "otherEquipCost": 0,
      "manualWorkMin": 85,
      "prepCost": 0,
      "packagingCost": 42,
      "additionalFailuresCost": 0,
      "fixedOverheadCost": 15,
      "shippingCost": 0,
      "costStatus": "Calculado de Taller"
    },
    "manufacturingTimes": {
      "machineHours": 8,
      "machineMinutes": 30,
      "postProcessingMinutes": 85,
      "leadTimeDays": "4 a 6 días hábiles"
    },
    "sku": "CUST-3D-GRAND-001",
    "skuBreakdown": {
      "standardSku": "CUST-3D-GRAND-001",
      "legacyCode": "CUST-FUNKO-ABUELITOS",
      "area": "CUST",
      "technique": "3D",
      "material": "PLA+",
      "finish": "MAT"
    },
    "repository": {
      "platform": "taller",
      "makerworldUrl": "https://makerworld.com/es",
      "author": "Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)",
      "license": "Diseño Exclusivo / Propietario Artesano Digital",
      "slicerNotes": "Capa 0.12 mm, 3 paredes, 15% infill."
    },
    "category": "personalizados-abuelitos",
    "regularPrice": 1490,
    "savings": 200
  }
];

// Initial Admin User (password will be hashed)
const initialWorkshopMachines = [
  {
    id: 'mach-creator-5',
    code: '3D-01',
    name: 'FlashForge Creator 5',
    alias: 'la creator 5',
    category: '3d',
    categoryName: 'Impresión 3D',
    icon: '🖨️',
    powerWatts: 550,
    kwhRate: 3.20,
    powerCostPerHour: 1.76,
    wearCostPerHour: 4.50,
    maintenanceCostPerHour: 2.50,
    totalHourlyRate: 8.76,
    unitMetric: 'cm3',
    unitMetricLabel: 'cm³ (milímetro/cm cúbico)',
    unitCost: 0.48,
    specs: 'Doble extrusor independiente (IDEX), volumen 500x500x500 mm, boquilla hasta 350°C, cama caliente hasta 120°C',
    status: 'active',
    amortizedHours: 1850,
    hourlyDepreciationCost: 3.00,
    speedFactorMmSec: 150,
    speedEfficiency: 100,
    sizeCategory: 'Industrial',
    compatibleMaterials: ["PLA","PETG","ABS","TPU","Nylon","PVA Soluble"],
    notes: 'Impresora industrial de gran volumen para piezas estructurales, piezas con soporte soluble (PVA) y doble color.'
  },
  {
    id: 'mach-bambu-a1-mini',
    code: '3D-02',
    name: 'Bambu Lab A1 Mini',
    alias: 'la bambu lab mini',
    category: '3d',
    categoryName: 'Impresión 3D',
    icon: '⚡',
    powerWatts: 150,
    kwhRate: 3.20,
    powerCostPerHour: 0.48,
    wearCostPerHour: 2.20,
    maintenanceCostPerHour: 1.20,
    totalHourlyRate: 3.88,
    unitMetric: 'cm3',
    unitMetricLabel: 'cm³ (milímetro/cm cúbico)',
    unitCost: 0.38,
    specs: 'Volumen 180x180x180 mm, aceleración activa de 500 mm/s, calibración totalmente automática',
    status: 'active',
    amortizedHours: 620,
    hourlyDepreciationCost: 1.80,
    speedFactorMmSec: 500,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["PLA","PETG","TPU"],
    notes: 'Impresora de alta velocidad y máxima precisión para piezas de alta rotación, llaveros y organizadores compactos.'
  },
  {
    id: 'mach-bambu-a1',
    code: '3D-03',
    name: 'Bambu Lab A1 (A2L Multicolor)',
    alias: 'la bambu lab a2l',
    category: '3d',
    categoryName: 'Impresión 3D',
    icon: '🎨',
    powerWatts: 250,
    kwhRate: 3.20,
    powerCostPerHour: 0.80,
    wearCostPerHour: 3.10,
    maintenanceCostPerHour: 1.60,
    totalHourlyRate: 5.50,
    unitMetric: 'cm3',
    unitMetricLabel: 'cm³ (milímetro/cm cúbico)',
    unitCost: 0.44,
    specs: 'Volumen 256x256x256 mm, sistema multicolor AMS Lite 4 carretes, sensor de tensión de correa',
    status: 'active',
    amortizedHours: 940,
    hourlyDepreciationCost: 2.40,
    speedFactorMmSec: 500,
    speedEfficiency: 100,
    sizeCategory: 'Mediana',
    compatibleMaterials: ["PLA Multicolor (AMS)","PETG","TPU"],
    notes: 'Impresión multicolor sin desperdicio excesivo para figuras decorativas, letreros con capas de color y trofeos.'
  },
  {
    id: 'mach-cameo',
    code: 'PLT-01',
    name: 'Silhouette Cameo',
    alias: 'la shiluete cameo',
    category: 'vinyl',
    categoryName: 'Plotters & Vinil',
    icon: '✂️',
    powerWatts: 80,
    kwhRate: 3.20,
    powerCostPerHour: 0.26,
    wearCostPerHour: 2.80,
    maintenanceCostPerHour: 1.00,
    totalHourlyRate: 4.06,
    unitMetric: 'metro_lineal',
    unitMetricLabel: 'Metro Lineal (o cm²)',
    unitCost: 3.20,
    specs: 'Ancho de corte 30.5 cm (12 pulgadas), hasta 3 metros de largo continuo, fuerza de corte 5000g',
    status: 'active',
    amortizedHours: 780,
    hourlyDepreciationCost: 1.50,
    speedFactorMmSec: 300,
    speedEfficiency: 100,
    sizeCategory: 'Mediana',
    compatibleMaterials: ["Vinil textil puff","Vinil adhesivo","Cartulina kraft","Mylar"],
    notes: 'Plotter principal para vinil textil puff, vinil adhesivo mate/brillante y cartulinas pesadas de empaque.'
  },
  {
    id: 'mach-portrait-2',
    code: 'PLT-02',
    name: 'Silhouette Portrait 2',
    alias: 'portrait2',
    category: 'vinyl',
    categoryName: 'Plotters & Vinil',
    icon: '📐',
    powerWatts: 50,
    kwhRate: 3.20,
    powerCostPerHour: 0.16,
    wearCostPerHour: 2.10,
    maintenanceCostPerHour: 0.80,
    totalHourlyRate: 3.06,
    unitMetric: 'metro_lineal',
    unitMetricLabel: 'Metro Lineal (o cm²)',
    unitCost: 2.80,
    specs: 'Ancho de corte 20.3 cm (8 pulgadas) tamaño carta/A4, cuchilla AutoBlade, Bluetooth integrado',
    status: 'active',
    amortizedHours: 410,
    hourlyDepreciationCost: 1.20,
    speedFactorMmSec: 250,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Vinil adhesivo","Stickers troquelados","Cartulina 180g"],
    notes: 'Plotter secundario para etiquetas en tirajes cortos, calcomanías die-cut y detalles de stickers troquelados.'
  },
  {
    id: 'mach-twotrees-ts1',
    code: 'LSR-01',
    name: 'TwoTrees Mini TS1',
    alias: 'la cortadora laser twootrees mini ts1',
    category: 'laser',
    categoryName: 'Corte & Grabado Láser',
    icon: '🔥',
    powerWatts: 45,
    kwhRate: 3.20,
    powerCostPerHour: 0.14,
    wearCostPerHour: 3.50,
    maintenanceCostPerHour: 1.80,
    totalHourlyRate: 5.44,
    unitMetric: 'cm2',
    unitMetricLabel: 'cm² grabado / cortado',
    unitCost: 0.0040,
    specs: 'Área de grabado 180x180 mm, diodo láser focalizado de 5.5W ópticos, precisión de 0.08mm',
    status: 'active',
    amortizedHours: 320,
    hourlyDepreciationCost: 1.60,
    speedFactorMmSec: 100,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Madera pino","MDF 3mm","Acrílico negro","Cuero vacuno"],
    notes: 'Grabado preciso de llaveros de madera, placas de cuero para carteras y piezas compactas de acrílico.'
  },
  {
    id: 'mach-acmer-mini',
    code: 'LSR-02',
    name: 'ACMER Mini Láser Diodo',
    alias: 'la acmer mini',
    category: 'laser',
    categoryName: 'Corte & Grabado Láser',
    icon: '🎯',
    powerWatts: 60,
    kwhRate: 3.20,
    powerCostPerHour: 0.19,
    wearCostPerHour: 4.20,
    maintenanceCostPerHour: 2.10,
    totalHourlyRate: 6.49,
    unitMetric: 'cm2',
    unitMetricLabel: 'cm² grabado / cortado',
    unitCost: 0.0050,
    specs: 'Área de trabajo 300x300 mm, diodo 10W ópticos con asistencia de aire Air Assist y lente colimada',
    status: 'active',
    amortizedHours: 510,
    hourlyDepreciationCost: 2.20,
    speedFactorMmSec: 160,
    speedEfficiency: 100,
    sizeCategory: 'Mediana',
    compatibleMaterials: ["Triplay 3mm/5mm","MDF 3mm","Acrílico opaco","Madera pino"],
    notes: 'Corte limpio de triplay de 3mm y 5mm, MDF de soporte y acrílico opaco sin carbonización excesiva.'
  },
  {
    id: 'mach-sculpfun-s9',
    code: 'LSR-03',
    name: 'Sculpfun S9 (Extensión 90x60 cm)',
    alias: 'la sculfun s9 de 90x60 cm',
    category: 'laser',
    categoryName: 'Corte & Grabado Láser',
    icon: '⚡',
    powerWatts: 90,
    kwhRate: 3.20,
    powerCostPerHour: 0.29,
    wearCostPerHour: 5.80,
    maintenanceCostPerHour: 2.90,
    totalHourlyRate: 8.99,
    unitMetric: 'cm2',
    unitMetricLabel: 'cm² grabado / cortado',
    unitCost: 0.0062,
    specs: 'Área de corte extendida gigante de 900x600 mm (0.54 m²), haz láser ultrafino de 0.06mm',
    status: 'active',
    amortizedHours: 890,
    hourlyDepreciationCost: 3.20,
    speedFactorMmSec: 180,
    speedEfficiency: 100,
    sizeCategory: 'Grande',
    compatibleMaterials: ["Planchas MDF 90x60","Triplay 3mm/5mm","Madera pino","Acrílico"],
    notes: 'Producción de letreros monumentales para bodas y negocios, cuadros botánicos calados y planchas completas.'
  },
  {
    id: 'mach-pc-diseno',
    code: 'OFC-01',
    name: 'Computadora de Diseño & Control de Taller',
    alias: 'mi computadora',
    category: 'print_pc',
    categoryName: 'Computadora & Papelería',
    icon: '💻',
    powerWatts: 350,
    kwhRate: 3.20,
    powerCostPerHour: 1.12,
    wearCostPerHour: 2.00,
    maintenanceCostPerHour: 1.00,
    totalHourlyRate: 4.12,
    unitMetric: 'hora',
    unitMetricLabel: 'Hora de diseño / laminado',
    unitCost: 4.12,
    specs: 'Workstation Core i7 / GPU RTX, doble monitor calibrado, licencias CAD, LightBurn, Bambu Studio y Cura',
    status: 'active',
    amortizedHours: 2400,
    hourlyDepreciationCost: 2.50,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Estándar',
    compatibleMaterials: ["Modelos CAD/STL","G-Code","Vectores SVG/DXF"],
    notes: 'Computadora central para modelado 3D, preparación de archivos G-Code, vectorizado de logotipos y control.'
  },
  {
    id: 'mach-impresora-normal',
    code: 'OFC-02',
    name: 'Impresora de Inyección Normal',
    alias: 'la impresora normal',
    category: 'print_pc',
    categoryName: 'Computadora & Papelería',
    icon: '📄',
    powerWatts: 25,
    kwhRate: 3.20,
    powerCostPerHour: 0.08,
    wearCostPerHour: 0.60,
    maintenanceCostPerHour: 0.40,
    totalHourlyRate: 1.08,
    unitMetric: 'hoja',
    unitMetricLabel: 'Hoja estándar impresa',
    unitCost: 0.45,
    specs: 'Inyección de tinta estándar para documentos, notas de entrega, guías de envío y muestras de prueba',
    status: 'active',
    amortizedHours: 350,
    hourlyDepreciationCost: 0.50,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Papel bond","Papel autocopiante","Guías de envío"],
    notes: 'Impresión rápida de albaranes de entrega para clientes y hojas de trabajo interno de taller.'
  },
  {
    id: 'mach-hp-laserjet-m276',
    code: 'OFC-03',
    name: 'HP LaserJet Pro MFP M276 (Láser Color)',
    alias: 'la impresora laser hp laser jet mfp md276',
    category: 'print_pc',
    categoryName: 'Computadora & Papelería',
    icon: '🖨️',
    powerWatts: 300,
    kwhRate: 3.20,
    powerCostPerHour: 0.96,
    wearCostPerHour: 1.80,
    maintenanceCostPerHour: 0.90,
    totalHourlyRate: 3.66,
    unitMetric: 'hoja',
    unitMetricLabel: 'Hoja láser color (tóner)',
    unitCost: 1.25,
    specs: 'Láser color multifuncional de tóner electrostático hasta 600x600 dpi, alimentador ADF y escáner plano',
    status: 'active',
    amortizedHours: 1100,
    hourlyDepreciationCost: 1.50,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Mediana',
    compatibleMaterials: ["Papel opalina","Cartulina sulfatada","Papel transfer láser"],
    notes: 'Impresión nítida e indeleble en papel opalina, sulfatada, tarjetas de presentación y certificados de autenticidad.'
  },
  {
    id: 'mach-epson-120',
    code: 'SUB-01',
    name: 'Epson EcoTank L120 (Tintas Sublimación)',
    alias: 'la epson 120 para sublimacion',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '💧',
    powerWatts: 15,
    kwhRate: 3.20,
    powerCostPerHour: 0.05,
    wearCostPerHour: 1.50,
    maintenanceCostPerHour: 1.00,
    totalHourlyRate: 2.55,
    unitMetric: 'hoja',
    unitMetricLabel: 'Hoja transfer sublimación A4',
    unitCost: 1.10,
    specs: 'Cabezal piezoeléctrico de 4 canales adaptado con tintas coreanas de sublimación de alta gama cromática',
    status: 'active',
    amortizedHours: 1450,
    hourlyDepreciationCost: 1.00,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Papel sublimación A4","Tintas coreanas sublimación"],
    notes: 'Dedicada exclusivamente a impresión de transfer para sublimar en tazas, termos, playeras y madera tratada.'
  },
  {
    id: 'mach-plancha-playeras',
    code: 'SUB-02',
    name: 'Plancha Plana de Sublimación para Playeras (38x38 cm)',
    alias: 'las planchas de sublilmacion de playeras 1',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '👕',
    powerWatts: 1800,
    kwhRate: 3.20,
    powerCostPerHour: 5.76,
    wearCostPerHour: 2.50,
    maintenanceCostPerHour: 1.20,
    totalHourlyRate: 9.46,
    unitMetric: 'bajada_ciclo',
    unitMetricLabel: 'Bajada / ciclo de prensado',
    unitCost: 0.65,
    specs: 'Plancha plana térmica basculante 38x38 cm, control de tiempo digital y temperatura hasta 250°C, teflonada',
    status: 'active',
    amortizedHours: 1600,
    hourlyDepreciationCost: 2.00,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Grande',
    compatibleMaterials: ["Playeras poliéster","Bolsas tote manta","Fundas cojín","Mousepads"],
    notes: 'Transferencia térmica para textiles, playeras poliéster/dry-fit, fundas de cojín, bolsas tote y mousepads.'
  },
  {
    id: 'mach-plancha-tazas-1',
    code: 'SUB-03',
    name: 'Prensa Térmica para Tazas #1 (Cilíndrica 11oz)',
    alias: '3 de tazas - prensa 1',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '☕',
    powerWatts: 350,
    kwhRate: 3.20,
    powerCostPerHour: 1.12,
    wearCostPerHour: 2.80,
    maintenanceCostPerHour: 0.80,
    totalHourlyRate: 4.72,
    unitMetric: 'bajada_ciclo',
    unitMetricLabel: 'Bajada / ciclo de prensado',
    unitCost: 0.35,
    specs: 'Resistencia cilíndrica de silicón para tazas estándar de 11oz y 15oz, horneado uniforme a 180-200°C',
    status: 'active',
    amortizedHours: 1320,
    hourlyDepreciationCost: 1.20,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Tazas cerámicas 11oz","Tazas mágicas termosensibles","Tazas peltre"],
    notes: 'Línea de producción continua #1 para tazas cerámicas blancas y tazas mágicas termosensibles.'
  },
  {
    id: 'mach-plancha-tazas-2',
    code: 'SUB-04',
    name: 'Prensa Térmica para Tazas #2 (Cónica & Tarros)',
    alias: '3 de tazas - prensa 2',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '☕',
    powerWatts: 350,
    kwhRate: 3.20,
    powerCostPerHour: 1.12,
    wearCostPerHour: 2.80,
    maintenanceCostPerHour: 0.80,
    totalHourlyRate: 4.72,
    unitMetric: 'bajada_ciclo',
    unitMetricLabel: 'Bajada / ciclo de prensado',
    unitCost: 0.35,
    specs: 'Resistencia intercambiable para tazas cónicas de 12oz, tarros cerveceros satinados y tazas cónicas latte',
    status: 'active',
    amortizedHours: 980,
    hourlyDepreciationCost: 1.20,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Tazas cónicas 12oz","Tarros cerveceros","Tazas latte"],
    notes: 'Línea de producción continua #2 para formatos especiales de tazas y tarros.'
  },
  {
    id: 'mach-plancha-tazas-3',
    code: 'SUB-05',
    name: 'Prensa Térmica para Tazas #3 (Termos Skinny & Botellas)',
    alias: '3 de tazas - prensa 3',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '🥤',
    powerWatts: 350,
    kwhRate: 3.20,
    powerCostPerHour: 1.12,
    wearCostPerHour: 2.80,
    maintenanceCostPerHour: 0.80,
    totalHourlyRate: 4.72,
    unitMetric: 'bajada_ciclo',
    unitMetricLabel: 'Bajada / ciclo de prensado',
    unitCost: 0.35,
    specs: 'Resistencia extralarga para botellas de aluminio y termos de acero inoxidable skinny de 20oz a 30oz',
    status: 'active',
    amortizedHours: 640,
    hourlyDepreciationCost: 1.20,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Mediana',
    compatibleMaterials: ["Termos skinny 20oz/30oz","Botellas aluminio","Vasos viajeros"],
    notes: 'Línea de producción continua #3 especializada en termos térmicos y botellas cilíndricas altas.'
  },
  {
    id: 'mach-plancha-lapiceros',
    code: 'SUB-06',
    name: 'Plancha Térmica para Lapiceros / Bolígrafos',
    alias: 'una de lapiceros',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '🖊️',
    powerWatts: 450,
    kwhRate: 3.20,
    powerCostPerHour: 1.44,
    wearCostPerHour: 2.20,
    maintenanceCostPerHour: 0.90,
    totalHourlyRate: 4.54,
    unitMetric: 'pieza',
    unitMetricLabel: 'Pieza de bolígrafo transferida',
    unitCost: 0.18,
    specs: 'Ranurado cuádruple simultáneo para termofijado de hasta 6 bolígrafos por bajada de calor',
    status: 'active',
    amortizedHours: 480,
    hourlyDepreciationCost: 1.00,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Bolígrafos plásticos para transfer","Lápices ecológicos"],
    notes: 'Plancha especializada para sublimación y transfer de bolígrafos promocionales en tirajes de volumen.'
  },
  {
    id: 'mach-mini-plancha',
    code: 'SUB-07',
    name: 'Mini Prensa Térmica para Estampados Pequeños & Parches',
    alias: 'una mini para estampados pequeños',
    category: 'sublimation',
    categoryName: 'Sublimación & Transfer',
    icon: '🏷️',
    powerWatts: 250,
    kwhRate: 3.20,
    powerCostPerHour: 0.80,
    wearCostPerHour: 1.20,
    maintenanceCostPerHour: 0.50,
    totalHourlyRate: 2.50,
    unitMetric: 'bajada_ciclo',
    unitMetricLabel: 'Bajada / ciclo de prensado',
    unitCost: 0.20,
    specs: 'Suela compacta de precisión de 6.2 x 10.6 cm con 3 niveles térmicos regulables (140°C, 165°C, 205°C)',
    status: 'active',
    amortizedHours: 390,
    hourlyDepreciationCost: 0.80,
    speedFactorMmSec: 0,
    speedEfficiency: 100,
    sizeCategory: 'Chica',
    compatibleMaterials: ["Parches bordados","Cuellos y mangas","Calzado de lona"],
    notes: 'Ideal para parches bordados, esquinas de bolsas, mangas, cuellos, calzado de tela y vinil textil de detalle.'
  }
];

const initialWorkshopWorkers = [
  {
    id: 'op-juan',
    name: 'Juan (Técnico Especialista CNC / 3D)',
    role: 'Técnico Especialista CNC / 3D',
    salaryPeriod: 'monthly',
    salary: 14000,
    hoursPerDay: 8,
    daysPerWeek: 5,
    efficiency: 90,
    hourlyRate: 300,
    hourlyRateManual: false,
    desc: 'Laminado, nivelación de cama, G-Code y operación de alta precisión',
    notes: 'Operador senior. Puede operar hasta 4 impresoras 3D y 2 lásers en simultáneo.'
  },
  {
    id: 'op-pedro',
    name: 'Pedro (Operador Estándar de Taller)',
    role: 'Operador Estándar de Taller',
    salaryPeriod: 'monthly',
    salary: 9500,
    hoursPerDay: 8,
    daysPerWeek: 5,
    efficiency: 85,
    hourlyRate: 200,
    hourlyRateManual: false,
    desc: 'Retiro de piezas, cambio de filamento, supervisión de tirajes',
    notes: 'Operador de piso. Carga materiales, supervisa impresiones y opera prensas de calor.'
  },
  {
    id: 'op-auxiliar',
    name: 'Auxiliar de Acabados & Ensamblaje',
    role: 'Auxiliar de Acabados & Ensamblaje',
    salaryPeriod: 'weekly',
    salary: 2000,
    hoursPerDay: 7,
    daysPerWeek: 5,
    efficiency: 80,
    hourlyRate: 120,
    hourlyRateManual: false,
    desc: 'Desgranado de soportes, lijado artesanal, empaque y limpieza',
    notes: 'Post-proceso manual, limpieza fina, ensamble de herrajes y empaque para envío.'
  },
  {
    id: 'op-dueno',
    name: 'Dueño / Dirección Creativa & Control',
    role: 'Dueño / Dirección Creativa & Control',
    salaryPeriod: 'monthly',
    salary: 18000,
    hoursPerDay: 8,
    daysPerWeek: 6,
    efficiency: 95,
    hourlyRate: 250,
    hourlyRateManual: false,
    desc: 'Costeo, revisión de tolerancias, control de calidad y empaque premium',
    notes: 'Dirección de taller, cotizaciones a clientes, control de calidad y logística mayorista.'
  }
];

// Default Seasonal Campaigns Configuration
const defaultCampaignsConfig = {
  activeSeasonId: 'invierno',
  title: 'Especial Navideño & Fin de Año: Paquetes y Regalos Corporativos',
  subtitle: 'Ahorra hasta un 15% llevando kits coordinados en ensamble artesanal, listos para obsequiar con grabado láser personalizado sin costo.',
  bannerBadge: '🎄 Temporada Navideña Activa',
  bannerImage: '/uploads/bundle_promo_hogar_1.jpg',
  promoNotice: '🎁 Envío gratis a todo México en paquetes superiores a $800 + grabado láser de cortesía.',
  highlightedBundleId: 'kit-home-office-gamer-pro',
  accentTheme: 'navidad',
  textColorMode: 'auto', // 'auto' | 'black' | 'white'
  seasonalEffect: 'snow', // 'none' | 'snow' | 'autumn_leaves' | 'day_of_dead' | 'spring_blossom' | 'summer_sun' | 'confetti' | 'valentines'
  monthlyEvents: {
    baseEventMode: 'major', // 'major' | 'mid' — o es uno o es otro para el evento base mensual
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
      discountText: '15% OFF',
      couponCode: 'FLASHFINDE15',
      startDate: '2026-10-17',
      endDate: '2026-10-19',
      progressPercent: 92,
      benefitType: 'liquidation',
      benefitText: 'Promociones Relámpago + Liquidación de Taller + Envío Express'
    }
  },
  seasons: [
    {
      id: 'invierno',
      name: 'Invierno & Navidad',
      icon: '❄️',
      badge: '🎄 Edición Especial Navideña',
      title: 'Especial de Navidad & Año Nuevo: Regalos y Paquetes Corporativos',
      subtitle: 'Kits coordinados en madera, grabado láser y piezas 3D con hasta 15% de ahorro para empresas y familias.',
      bannerImage: '/uploads/bundle_promo_hogar_1.jpg',
      promoNotice: '🎁 Envoltura de regalo de cortesía y grabado de nombres sin costo en pedidos de temporada.',
      themeColor: 'rose',
      seasonalEffect: 'snow',
      suggestedBundles: ['kit-home-office-gamer-pro', 'set-suite-nupcial-novia-novio', 'PROMO-HOG-1']
    },
    {
      id: 'otono',
      name: 'Otoño & Día de Muertos',
      icon: '🍂',
      badge: '🍁 Edición Especial de Otoño',
      title: 'Colección Otoño & Tradición: Maderas Cálidas y Piezas de Taller',
      subtitle: 'Detalles artesanales conmemorativos, bandejas vaciabolsillos y porta-velas en maderas nobles.',
      bannerImage: '/uploads/bundle_promo_biz_1.jpg',
      promoNotice: '🍂 15% de descuento adicional en paquetes de madera natural tratada.',
      themeColor: 'amber',
      seasonalEffect: 'day_of_dead',
      suggestedBundles: ['PROMO-HOG-1', 'PROMO-HOG-3', 'starter-pack-barberia-t18']
    },
    {
      id: 'verano',
      name: 'Verano & Vacaciones',
      icon: '☀️',
      badge: '🏖️ Especial de Verano',
      title: 'Temporada de Verano: Gorras, Termos y Accesorios de Viaje',
      subtitle: 'Paquetes playeros, gorras trucker personalizadas con parche y termos térmicos para tus escapadas.',
      bannerImage: '/uploads/bundle_promo_ev_1.jpg',
      promoNotice: '☀️ Llévate 2 llaveros de viaje de cortesía al adquirir cualquier paquete de verano.',
      themeColor: 'blue',
      seasonalEffect: 'summer_sun',
      suggestedBundles: ['pack-consentido-peludo-mascotas', 'gorra-trucker-personalizada-vinil-parche', 'termo-metalico-termico-20oz-personalizado']
    },
    {
      id: 'primavera',
      name: 'Primavera, Amor & Madres',
      icon: '🌸',
      badge: '💝 Especial San Valentín & Día de las Madres',
      title: 'Especial de Primavera: Recuerdos Inolvidables para Mamá y Parejas',
      subtitle: 'Llaveros familiares Polaroid, tazas mágicas reveladoras y detalles con grabado botánico.',
      bannerImage: '/uploads/bundle_promo_hogar_2.jpg',
      promoNotice: '🌸 Caja kraft decorada y tarjeta con dedicatoria personalizada incluida.',
      themeColor: 'emerald',
      seasonalEffect: 'spring_blossom',
      suggestedBundles: ['PROMO-HOG-1', 'PROMO-HOG-2', 'llavero-camarita-l9']
    },
    {
      id: 'bodas',
      name: 'Bodas, XV Años & Graduaciones',
      icon: '🎓',
      badge: '💍 Temporada de Celebraciones',
      title: 'Suite Nupcial & Eventos: Paquetes Todo Incluido para Tu Fiesta',
      subtitle: 'Letreros de bienvenida, copas de brindis, números de mesa 3D y servicio Patch Bar en vivo.',
      bannerImage: '/uploads/bienvenida_ceremonia_boda.jpg',
      promoNotice: '💍 Reserva con 15 días de anticipación y recibe 10 marcacopas de cortesía.',
      themeColor: 'amber',
      seasonalEffect: 'confetti',
      suggestedBundles: ['set-suite-nupcial-novia-novio', 'centro-mesa-presidencial-3d-copas', 'paquete-boda-de-ensueno-todo-incluido']
    },
    {
      id: 'custom',
      name: 'Especial del Mes Personalizado',
      icon: '⭐',
      badge: '⭐ Promoción del Mes de Taller',
      title: 'Especial del Mes: Combos Destacados de Artesano Digital',
      subtitle: 'Nuestros paquetes más vendidos combinados con precios de fábrica y entrega prioritaria.',
      bannerImage: '/uploads/bundle_promo_biz_2.jpg',
      promoNotice: '⭐ Personalización gratuita de logotipo y tipografía en cualquier paquete seleccionado.',
      themeColor: 'emerald',
      seasonalEffect: 'confetti',
      suggestedBundles: ['kit-home-office-gamer-pro', 'starter-pack-barberia-t18']
    }
  ]
};

// Presets de Temporada Preconfigurados para el Arcade del Taller
const defaultSeasonPresets = [
  {
    id: 'preset-navidad',
    name: 'Navidad & Fin de Año',
    season: 'navidad',
    icon: '🎄',
    description: 'Ambiente navideño con nieve retro, 1 moneda cada 10 min, tope de 8 monedas y cupones festivos.',
    config: {
      activeTheme: 'navidad',
      selectionMode: 'manual',
      activeGameIds: ['stacker', 'runner', 'dino'],
      coinsEarnRateMinutes: 10,
      maxCoinsCap: 8,
      costPerGame: 1,
      coinToCreditCost: 2,
      timeLimitSeconds: 180,
      discountTiers: [
        { id: 'tier-5', coinsRequired: 25, code: 'NAVIDAD5', label: '5% Descuento Navideño', description: 'Válido en cualquier regalo o paquete', discountPercent: 5, discountAmount: 0, minPurchase: 0 },
        { id: 'tier-10', coinsRequired: 50, code: 'NAVIDAD10', label: '10% Descuento Taller Navideño', description: 'Válido en compras mínimas de $250', discountPercent: 10, discountAmount: 0, minPurchase: 250 },
        { id: 'tier-50', coinsRequired: 80, code: 'REGALO50', label: '$50 MXN Bono Navideño', description: 'Ahorro directo en órdenes mayores a $200 MXN', discountPercent: 0, discountAmount: 50, minPurchase: 200 },
        { id: 'tier-vip', coinsRequired: 120, code: 'VIPNAVIDAD', label: '15% Descuento VIP + Adorno Navideño', description: '15% de descuento + esfera navideña 3D de regalo', discountPercent: 15, discountAmount: 0, minPurchase: 300 }
      ]
    }
  },
  {
    id: 'preset-halloween',
    name: 'Halloween & Día de Muertos',
    season: 'halloween',
    icon: '🎃',
    description: 'Estilo catrina y misterio con recompensas especiales para eventos temáticos.',
    config: {
      activeTheme: 'catrina',
      selectionMode: 'daily_random',
      activeGameIds: ['dino', 'pacman', 'spaceinvaders'],
      coinsEarnRateMinutes: 12,
      maxCoinsCap: 6,
      costPerGame: 1,
      coinToCreditCost: 2,
      timeLimitSeconds: 180,
      discountTiers: [
        { id: 'tier-5', coinsRequired: 30, code: 'MUERTOS5', label: '5% Especial Día de Muertos', description: 'Válido en toda la tienda', discountPercent: 5, discountAmount: 0, minPurchase: 0 },
        { id: 'tier-10', coinsRequired: 60, code: 'CATRINA10', label: '10% Ofrenda Creativa', description: 'Descuento en compras mínimas de $250', discountPercent: 10, discountAmount: 0, minPurchase: 250 },
        { id: 'tier-50', coinsRequired: 90, code: 'CALAVERA50', label: '$50 MXN Descuento Místico', description: 'Ahorro en órdenes mayores a $200 MXN', discountPercent: 0, discountAmount: 50, minPurchase: 200 },
        { id: 'tier-vip', coinsRequired: 140, code: 'VIPMUERTOS', label: '15% Catrina VIP + Llavero Calaverita', description: '15% + llavero 3D de calaverita artesanal', discountPercent: 15, discountAmount: 0, minPurchase: 300 }
      ]
    }
  },
  {
    id: 'preset-sanvalentin',
    name: 'San Valentín & Amor y Amistad',
    season: 'sanvalentin',
    icon: '💘',
    description: 'Colores cálidos, combos románticos de pareja y premios para regalos personalizados.',
    config: {
      activeTheme: 'vaporwave',
      selectionMode: 'manual',
      activeGameIds: ['pong', 'stacker', 'tetris'],
      coinsEarnRateMinutes: 12,
      maxCoinsCap: 6,
      costPerGame: 1,
      coinToCreditCost: 2,
      timeLimitSeconds: 180,
      discountTiers: [
        { id: 'tier-5', coinsRequired: 25, code: 'AMOR5', label: '5% Detalle de Amor', description: 'Válido en cualquier regalo coordinado', discountPercent: 5, discountAmount: 0, minPurchase: 0 },
        { id: 'tier-10', coinsRequired: 50, code: 'AMOR10', label: '10% Parejas y Amistad', description: 'Válido en pedidos desde $200 MXN', discountPercent: 10, discountAmount: 0, minPurchase: 200 },
        { id: 'tier-50', coinsRequired: 80, code: 'CUPIDO50', label: '$50 MXN Bono Cupido', description: 'Descuento en compras mayores a $200 MXN', discountPercent: 0, discountAmount: 50, minPurchase: 200 },
        { id: 'tier-vip', coinsRequired: 130, code: 'VIPAMOR', label: '15% Love VIP + Portafoto Grabado', description: '15% + marco mini polaroid personalizado', discountPercent: 15, discountAmount: 0, minPurchase: 300 }
      ]
    }
  },
  {
    id: 'preset-buenfin',
    name: 'Buen Fin & Liquidaciones Flash',
    season: 'buenfin',
    icon: '⚡',
    description: 'Monedas aceleradas cada 8 min, tope de 10 monedas y descuentos de alta conversión.',
    config: {
      activeTheme: 'neon',
      selectionMode: 'daily_random',
      activeGameIds: ['stacker', 'flappy', 'runner', 'dino'],
      coinsEarnRateMinutes: 8,
      maxCoinsCap: 10,
      costPerGame: 1,
      coinToCreditCost: 2,
      timeLimitSeconds: 120,
      discountTiers: [
        { id: 'tier-5', coinsRequired: 20, code: 'FLASH5', label: '5% Flash Buen Fin', description: 'Válido en cualquier compra', discountPercent: 5, discountAmount: 0, minPurchase: 0 },
        { id: 'tier-10', coinsRequired: 40, code: 'FLASH10', label: '10% Ahorro Inmediato', description: 'Válido desde $200 MXN', discountPercent: 10, discountAmount: 0, minPurchase: 200 },
        { id: 'tier-50', coinsRequired: 70, code: 'BUENFIN50', label: '$50 MXN Descuento Relámpago', description: 'Descuento directo en compras mayores a $200 MXN', discountPercent: 0, discountAmount: 50, minPurchase: 200 },
        { id: 'tier-vip', coinsRequired: 110, code: 'VIPBUENFIN', label: '15% Descuento Master Buen Fin', description: '15% VIP con compra mínima de $350 MXN', discountPercent: 15, discountAmount: 0, minPurchase: 350 }
      ]
    }
  },
  {
    id: 'preset-estandar',
    name: 'Taller Diario (Estándar)',
    season: 'clasico',
    icon: '🌿',
    description: 'Configuración equilibrada para todo el año: 1 moneda/15 min, tope 5 monedas y rotación diaria.',
    config: {
      activeTheme: 'clasico',
      selectionMode: 'daily_random',
      activeGameIds: ['dino', 'stacker'],
      coinsEarnRateMinutes: 15,
      maxCoinsCap: 5,
      costPerGame: 1,
      coinToCreditCost: 2,
      timeLimitSeconds: 180,
      discountTiers: [
        { id: 'tier-5', coinsRequired: 30, code: 'TALLER5', label: '5% de Descuento', description: 'Válido en cualquier compra o paquete', discountPercent: 5, discountAmount: 0, minPurchase: 0 },
        { id: 'tier-10', coinsRequired: 60, code: 'TALLER10', label: '10% de Descuento', description: 'Válido en productos o paquetes coordinados', discountPercent: 10, discountAmount: 0, minPurchase: 200 },
        { id: 'tier-50', coinsRequired: 100, code: 'MAESTRO50', label: '$50 MXN de Descuento', description: 'Ahorro directo en órdenes desde $200 MXN', discountPercent: 0, discountAmount: 50, minPurchase: 200 },
        { id: 'tier-vip', coinsRequired: 150, code: 'VIPARTESANO', label: '15% de Descuento + Detalle', description: 'Descuento VIP + sorpresa de taller', discountPercent: 15, discountAmount: 0, minPurchase: 300 }
      ]
    }
  }
];

// Arcade & Mini-Juegos Config
const defaultArcadeConfig = {
  enabled: true,
  selectionMode: 'daily_random', // 'daily_random' (2 al azar por día determinista) | 'manual' (elegidos por admin)
  activeGameIds: ['dino', 'stacker'],
  activeTheme: 'clasico', // 'clasico' | 'navidad' | 'otono' | 'sanvalentin' | 'primavera' | 'verano' | 'buenfin'
  timeLimitSeconds: 300, // 5 minutos por defecto
  showInProductModal: true,
  showFloatingEasterEgg: true,
  rewardRateMultiplier: 1.0,
  coinsEarnRateMinutes: 15,
  maxCoinsCap: 5,
  costPerGame: 1,
  coinToCreditCost: 2,
  lastResetTimestamp: 0,
  seasonPresets: defaultSeasonPresets,
  discountTiers: [
    {
      id: 'tier-5',
      coinsRequired: 50,
      code: 'TALLER5',
      label: '5% de Descuento',
      description: 'Válido en cualquier compra o paquete (Mínimo $100 MXN)',
      discountPercent: 5,
      discountAmount: 0,
      minPurchase: 100
    },
    {
      id: 'tier-10',
      coinsRequired: 100,
      code: 'TALLER10',
      label: '10% de Descuento',
      description: 'Válido en productos o paquetes coordinados (Mínimo $250 MXN)',
      discountPercent: 10,
      discountAmount: 0,
      minPurchase: 250
    },
    {
      id: 'tier-15',
      coinsRequired: 250,
      code: 'TALLER15',
      label: '15% de Descuento',
      description: 'Descuento del 15% en tu pedido (Mínimo $350 MXN)',
      discountPercent: 15,
      discountAmount: 0,
      minPurchase: 350
    },
    {
      id: 'tier-20',
      coinsRequired: 580,
      code: 'TALLER15VIP',
      label: '15% de Descuento VIP',
      description: 'Descuento VIP máximo del taller (Mínimo $500 MXN)',
      discountPercent: 15,
      discountAmount: 0,
      minPurchase: 500
    }
  ]
};

// Default Mobile Catalog Config (9:16 vertical PDF with MakerWorld links, customizable)
export const defaultMobileCatalogConfig = {
  enabled: true,
  title: 'Catálogo Móvil Artesano Digital (9:16)',
  subtitle: 'Piezas en 3D, Corte Láser, Sublimación y Vinil con enlaces a MakerWorld',
  buttonText: '📱 Catálogo Móvil PDF',
  fileName: 'Catalogo_Movil_Artesano_Digital.pdf',
  fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
  fileSize: '1,312 KB',
  fileType: 'application/pdf',
  updatedAt: new Date().toISOString(),
  showInNavbar: true,
  showInDrawer: true,
  showInFooter: true
};

// Initial Settings
const initialSettings = {
  workshopMachines: initialWorkshopMachines,
  campaignsConfig: defaultCampaignsConfig,
  arcadeConfig: defaultArcadeConfig,
  mobileCatalogConfig: defaultMobileCatalogConfig,
  businessName: 'Artesano Digital',
  tagline: 'Si lo piensas, se hace.',
  subtagline: 'Productos y detalles personalizados · Impresión 3D · Láser · Sublimación · Vinil',
  whatsappNumber: '524442818795', // San Luis Potosí, México
  businessEmail: 'contactoartesanodigital@gmail.com',
  serviceZone: 'Toda la República Mexicana (Envíos nacionales) y entregas locales',
  businessHours: 'Lunes a Viernes de 9:00 a 18:00 hrs · Sábados de 10:00 a 14:00 hrs',
  quoteNoteDefault: 'Precios en MXN. Los tiempos de producción inician tras confirmar el diseño y anticipo.',
  freeShippingNotice: 'Cotizamos envíos a toda la República con paqueterías seguras (DHL, FedEx, Estafeta).',
  serviceStatus: {
    localService: true,
    localDetails: 'Entregas en taller y zona metropolitana de San Luis Potosí',
    nationalService: true,
    nationalDetails: 'Envíos a toda la República Mexicana por paquetería (DHL, FedEx, Estafeta)',
    isPaused: false,
    pausedUntilDate: '',
    pausedReason: 'Mantenimiento preventivo y surtido de taller',
    pausedCustomMessage: 'Taller en periodo de mantenimiento y descanso técnico. Reanudamos producción de pedidos el próximo día hábil. Las cotizaciones recibidas se responderán por orden de llegada.'
  },
  flashDealsStatus: {
    isGloballyPaused: false,
    pausedAreas: {
      hogar: false,
      negocios: false,
      eventos: false,
      paquetes: false
    },
    lastResetAt: new Date().toISOString()
  },
  flashDealsLimits: {
    hogar: 3,
    negocios: 3,
    eventos: 5,
    paquetes: 1
  }
};

// Initial Admin User (password will be hashed)

/**
 * Garantiza que ningún SKU se repita (trazabilidad de inventario y reportes).
 * Devuelve cuántos SKUs fueron corregidos.
 */
function ensureUniqueProductSkus(products) {
  if (!Array.isArray(products)) return 0;
  const seen = new Map();
  let fixed = 0;
  for (const prod of products) {
    if (!prod || !prod.sku) continue;
    const skuKey = String(prod.sku).toUpperCase();
    if (!seen.has(skuKey)) {
      seen.set(skuKey, prod.id);
      continue;
    }
    const skuBase = skuKey.replace(/-\d{3}$/, '');
    let seq = 2;
    let candidate;
    do {
      candidate = `${skuBase}-${String(seq).padStart(3, '0')}`;
      seq += 1;
    } while (seen.has(candidate));
    prod.sku = candidate;
    seen.set(candidate, prod.id);
    fixed += 1;
  }
  return fixed;
}

const createInitialDb = () => {
  const salt = bcrypt.genSaltSync(10);
  const initialAdminPassword = (process.env.ADMIN_INITIAL_PASSWORD && process.env.ADMIN_INITIAL_PASSWORD.length >= 12)
    ? process.env.ADMIN_INITIAL_PASSWORD
    : 'AD-ePnzAHpUid8Z';
  const hashedPassword = bcrypt.hashSync(initialAdminPassword, salt);
  const initialProductsCopyWithUniqueSkus = initialProducts.map(p => ({ ...p }));
  ensureUniqueProductSkus(initialProductsCopyWithUniqueSkus);

  return {
    users: [
      {
        id: 'admin-1',
        username: 'admin',
        email: 'contactoartesanodigital@gmail.com',
        passwordHash: hashedPassword,
        name: 'Administrador Artesano Digital',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      }
    ],
    settings: initialSettings,
    worlds: initialWorlds,
    categories: initialCategories,
    products: initialProductsCopyWithUniqueSkus,
    analytics: {
      pageViews: 142,
      productViews: {
        'colgador-llaves-l14': 28,
        'llavero-camarita-l9': 45,
        'paquete-zorrito-t35': 38,
        'soporte-qr-t16': 31,
        'chapita-mascota-t20': 29,
        'starter-pack-barberia-t18': 22
      },
      whatsappClicks: 19,
      quotesStarted: 34,
      events: []
    },
    rawMaterials: initialRawMaterials,
    suppliers: initialSuppliers,
    publications: [],
    orders: [],
    pubTracking: [],
    coupons: initialCoupons
  };
};

const initialCoupons = [
  // ==========================================
  // 1. CUPONES GANADOS CON MONEDAS DE JUEGO (ARCADE)
  // ==========================================
  {
    id: 'cup-arcade-5',
    code: 'ARCADE5',
    name: '5% de Descuento Arcade',
    category: 'arcade',
    type: 'percent',
    value: 5,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    coinsRequired: 30,
    description: 'Canjeado con 30 monedas en el Taller Arcade. Válido en cualquier compra.'
  },
  {
    id: 'cup-arcade-10',
    code: 'ARCADE10',
    name: '10% de Descuento Arcade',
    category: 'arcade',
    type: 'percent',
    value: 10,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    coinsRequired: 60,
    description: 'Canjeado con 60 monedas en el Taller Arcade. Descuento en catálogo completo.'
  },
  {
    id: 'cup-arcade-50',
    code: 'TALLER50',
    name: '$50 MXN de Descuento Taller',
    category: 'arcade',
    type: 'fixed',
    value: 50,
    minPurchase: 200,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    coinsRequired: 100,
    description: 'Canjeado con 100 monedas en el Taller Arcade. Ahorro directo en compras mayores a $200 MXN.'
  },
  {
    id: 'cup-arcade-vip',
    code: 'VIP15',
    name: '15% de Descuento VIP + Sorpresa',
    category: 'arcade',
    type: 'percent',
    value: 15,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    coinsRequired: 150,
    description: 'Canjeado con 150 monedas en el Taller Arcade. Nivel Maestro con detalle de taller sorpresa.'
  },
  {
    id: 'cup-arcade-maestro',
    code: 'MAESTRO50',
    name: '$50 MXN de Descuento Taller Maestro',
    category: 'arcade',
    type: 'fixed',
    value: 50,
    minPurchase: 200,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    coinsRequired: 100,
    description: 'Bono directo de taller para artesanos destacados.'
  },

  // ==========================================
  // 2. CUPONES DE CÓDIGO ESPECIAL Y DE TIENDA
  // ==========================================
  {
    id: 'cup-store-bienvenido',
    code: 'BIENVENIDO',
    name: '10% de Bienvenida al Taller',
    category: 'store',
    type: 'percent',
    value: 10,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    description: 'Código especial de bienvenida para primeros clientes de la tienda online.'
  },
  {
    id: 'cup-store-artesano10',
    code: 'ARTESANO10',
    name: '10% de Descuento Especial',
    category: 'store',
    type: 'percent',
    value: 10,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    description: 'Descuento general para promociones y campañas en redes sociales.'
  },
  {
    id: 'cup-store-frecuente',
    code: 'CLIENTEFRECUENTE',
    name: '15% de Cliente Frecuente',
    category: 'store',
    type: 'percent',
    value: 15,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    description: 'Premio especial para clientes recurrentes y compras consecutivas.'
  },
  {
    id: 'cup-store-promo20',
    code: 'PROMO15',
    name: '15% de Descuento en Pedidos Mayores',
    category: 'store',
    type: 'percent',
    value: 15,
    minPurchase: 500,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    description: 'Descuento del 15% aplicable en compras a partir de $500 MXN.'
  },
  {
    id: 'cup-store-enviogratis',
    code: 'ENVIOGRATIS',
    name: 'Bono de $150 MXN para Envío',
    category: 'store',
    type: 'fixed',
    value: 150,
    minPurchase: 400,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    description: 'Subsidio directo para el envío en compras mayores a $400 MXN.'
  },
  {
    id: 'cup-store-buenfin',
    code: 'BUENFIN',
    name: '15% de Descuento Buen Fin',
    category: 'store',
    type: 'percent',
    value: 15,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-11-30T23:59:59.000Z',
    active: true,
    description: 'Campaña especial de fin de temporada y ofertas comerciales.'
  },
  {
    id: 'cup-store-flashfinde',
    code: 'FLASHFINDE15',
    name: '15% Especial Oferta Relámpago',
    category: 'store',
    type: 'percent',
    value: 15,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: '2026-12-31T23:59:59.000Z',
    active: true,
    description: 'Código relámpago exclusivo para fines de semana.'
  }
];

// Initial Suppliers Directory (Proveedores de Materiales Reales en México)
const initialSuppliers = [
  {
    id: 'sup-3d-market',
    name: '3D Market México',
    category: '3d',
    contactName: 'Atención a Talleres y Mayoreo',
    phone: '33 1895 2400',
    whatsapp: '523318952400',
    email: 'contacto@3dmarket.mx',
    website: 'https://3dmarket.mx',
    address: 'Av. Niños Héroes 2280, Col. Arcos Vallarta, Guadalajara, Jal. / Sucursales CDMX y Mty',
    leadTimeDays: '24 a 48 hrs hábiles',
    minOrder: 'Envío gratis a partir de $1,299 MXN',
    notes: 'Distribuidor oficial Bambu Lab, Polymaker, Creality, Anycubic y eSun en México. Filamento PLA Polymaker ($480-$550 MXN/kg), PLA Bambu ($520 MXN/kg), PETG y repuestos originales de extrusores.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-mercadolibre-componentes',
    name: 'Mercado Libre México (Componentes 3D & Mecanismos)',
    category: 'assembly',
    contactName: 'Tiendas Oficiales Mercado Envíos Full',
    phone: '800 105 5000',
    whatsapp: '525584321100',
    email: 'ayuda@mercadolibre.com.mx',
    website: 'https://www.mercadolibre.com.mx',
    address: 'Centros de Distribución Full (CDMX, Guadalajara, Monterrey, Tepotzotlán)',
    leadTimeDays: '24 a 48 hrs (Full) / 7 a 12 días (Internacional)',
    minOrder: 'Envío gratis en compras desde $299 MXN con Meli+',
    notes: 'Insumos de mecanismos para piezas 3D: Kits de luz LED USB 5V con interruptor para lámparas ($85 MXN con flete/impuestos), switches mecánicos clicker de 3 pines Outemu/Gateron ($6.00 MXN c/u / $60 MXN set 10) para fidgets (MLM2097835304), baleros cerámicos e imanes de neodimio.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-triplay-market',
    name: 'Triplay Market & Maderas Finas México',
    category: 'laser',
    contactName: 'Ing. Rodrigo Salinas / Mostrador Maderas',
    phone: '55 5368 4500',
    whatsapp: '525553684500',
    email: 'cotizaciones@triplaymarket.com',
    website: 'https://triplaymarket.com',
    address: 'Calzada Vallejo #1120, Gustavo A. Madero, CDMX / Envíos consolidados a toda la República',
    leadTimeDays: '2 a 4 días hábiles',
    minOrder: 'Medio tablero o cortes a medida para corte láser',
    notes: 'Tableros de Triplay de Abedul Ruso (Birch) 3mm y 6mm grado láser libre de huecos internos y parches. Tablones cepillados de madera fina sólida de Nogal Americano ($185-$220 MXN), Tzalam, Parota y Encino.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-maderas-san-luis',
    name: 'Maderas y Molduras San Luis',
    category: 'laser',
    contactName: 'Lic. Fernando Loredo',
    phone: '444 824 1500',
    whatsapp: '524448241500',
    email: 'ventas@maderassanluis.com.mx',
    website: 'https://maderassanluis.com.mx',
    address: 'Eje 120 #310, Zona Industrial, San Luis Potosí, S.L.P.',
    leadTimeDays: 'Mismo día en retiro de taller / 24 hrs en flete local',
    minOrder: '$500 MXN para entrega en taller sin costo',
    notes: 'Proveedor local clave: Madera sólida de pino estufado nacional de 1a calidad ($55-$65 MXN tabla), MDF calibrado 3mm para maquetas y cortes limpios ($35 MXN), listones de madera dura cepillados a 4 caras.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-sayer-lack',
    name: 'Sayer Lack México',
    category: 'laser',
    contactName: 'Asesoría Técnica en Barnices y Tintes',
    phone: '55 5804 1100',
    whatsapp: '525558041100',
    email: 'atencionclientes@sayerlack.com.mx',
    website: 'https://sayerlack.com.mx',
    address: 'Red Nacional de Tiendas de Fábrica (San Luis Potosí, CDMX, Guadalajara, Puebla)',
    leadTimeDays: 'Inmediata en mostrador / 24 hrs envío',
    minOrder: 'Sin mínimo',
    notes: 'Tintes para madera base aceite y alcohol serie HI-0100 (Nogal Americano, Caoba, Roble, Nogal Clásico). Barniz PolyLack de poliuretano base agua ecológico hidrófugo sin olor químico para piezas de interior y juguetes.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-comex-polyform',
    name: 'Comex México (Polyform Maderas)',
    category: 'laser',
    contactName: 'Atención Profesional y Carpintería',
    phone: '800 712 6639',
    whatsapp: '525545552200',
    email: 'contacto@comex.com.mx',
    website: 'https://www.comex.com.mx',
    address: 'Sucursales en toda la República Mexicana',
    leadTimeDays: 'Mismo día (mostrador)',
    minOrder: 'Sin mínimo',
    notes: 'Barnices Polyform transparente brillante, mate y satinado ($140-$260 MXN/litro). Tintes para madera Maderol base solvente, sellador concentrado 48% sólidos y ceras protectoras naturales.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-atp-mexico',
    name: 'Avance y TecnoLogía en Plásticos (ATP México)',
    category: 'laser',
    contactName: 'Dpto. de Ventas Láser y Rotulación',
    phone: '614 432 6100',
    whatsapp: '526144326100',
    email: 'ventas@avanceytec.com.mx',
    website: 'https://avanceytec.com.mx',
    address: '32 sucursales en México (CDMX, Guadalajara, Monterrey, SLP, Querétaro, León)',
    leadTimeDays: '24 a 48 hrs hábiles',
    minOrder: '$800 MXN para envío / Sin mínimo en mostrador',
    notes: 'Láminas de Acrílico Cast (colado) 3mm transparente, blanco lechoso difusor, negro espejo y dorado reflectivo para corte láser. Vinil textil termotransferible y vinil adhesivo Oracal 651 calandrado.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-colormake',
    name: 'Color Make México',
    category: 'vinyl',
    contactName: 'Ventas Mayoreo Sublimación & Textil',
    phone: '55 5390 9988',
    whatsapp: '525553909988',
    email: 'ventas@colormake.com',
    website: 'https://colormake.com',
    address: 'Vía Gustavo Baz #281, Tlalnepantla, Estado de México / Envíos a todo México',
    leadTimeDays: '2 a 3 días hábiles',
    minOrder: 'Caja máster de 36 tazas ($28-$32 MXN c/u) o pedido de consumibles',
    notes: 'Tazas de cerámica 11oz blanco puro AAA con recubrimiento Orca, termos de acero inoxidable para sublimar, gorras de poliéster y algodón lisas, tintas de alta densidad para transferencia por calor.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-cartoempaques',
    name: 'CartoEmpaques de México (Cajas Microcorrugadas)',
    category: 'packaging',
    contactName: 'Ing. Gabriela Morán / Empaque E-commerce',
    phone: '33 3619 8899',
    whatsapp: '523336198899',
    email: 'ventas@cartoempaques.com.mx',
    website: 'https://cartoempaques.com.mx',
    address: 'Área Metropolitana de Guadalajara / Envíos nacionales por consolidado',
    leadTimeDays: '2 a 4 días hábiles',
    minOrder: 'Paquetes de 25 o 50 cajas autoensamble',
    notes: 'Cajas de cartón microcorrugado flauta E kraft automontables para e-commerce (Chica 20x15x8cm a $12-$14 MXN, Mediana a $16-$19 MXN). Rollos de poliburbuja de 50 metros, viruta kraft y cinta selladora reforzada.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-herrajes-llaveros',
    name: 'El Rey del Tornillo & Herrajes Metálicos',
    category: 'assembly',
    contactName: 'Ventas de Mostrador e Importación',
    phone: '55 5522 7890',
    whatsapp: '525555227890',
    email: 'herrajes@elreydeltornillo.com.mx',
    website: 'https://elreydeltornillo.com.mx',
    address: 'Calle Corregidora #88, Centro Histórico, CDMX / Envíos por Paquetexpress',
    leadTimeDays: '24 a 72 hrs hábiles',
    minOrder: '$500 MXN (Bolsas de 100 o millar de piezas)',
    notes: 'Argollas sin fin de 25mm con cadena niquelada de 4 eslabones ($0.85 MXN c/u al mayoreo), borlas decorativas de 12cm con casquillo metálico, imanes de neodimio N35/N52 para cajas de madera y tornillería allen M3 para soportes 3D.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-skydropx-fletes',
    name: 'Skydropx & Envíoclick (Agregador de Envíos y Fletes)',
    category: 'packaging',
    contactName: 'Mesa de Ayuda Logística & Convenios',
    phone: '55 8526 2110',
    whatsapp: '525585262110',
    email: 'hola@skydropx.com',
    website: 'https://www.skydropx.com',
    address: 'Plataforma nacional con recolección a domicilio en el taller (SLP y todo México)',
    leadTimeDays: 'Guías digitales instantáneas (1 a 3 días entrega)',
    minOrder: 'Recargas de saldo desde $300 MXN',
    notes: 'Convenios con descuento hasta 60% en guías prepago de FedEx, Estafeta, RedPack, Paquetexpress y DHL. Tarifas desde $115 MXN para sobres y $139 MXN para paquetes de hasta 2 kg con recolección incluida.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sup-printlab',
    name: 'PrintLab México 3D',
    category: '3d',
    contactName: 'Ing. Carlos Mendoza',
    phone: '444 820 1199',
    whatsapp: '524448201199',
    email: 'ventas@printlab3d.mx',
    website: 'https://printlab3d.mx',
    address: 'Av. Salvador Nava 1420, San Luis Potosí, S.L.P.',
    leadTimeDays: '1 a 2 días hábiles',
    minOrder: '$500 MXN',
    notes: 'Distribuidor oficial de filamentos Polymaker, eSun, Creality y Bambu Lab en San Luis Potosí. Filamento PLA verde olivo, terracota, negro mate y madera woodfill.',
    updatedAt: new Date().toISOString()
  }
];

// Helper para desglosar el contenido de un empaque o bobina en cantidad numérica y unidad base
export function parseMaterialPackage(mat) {
  if (mat && mat.packageQuantity !== undefined && mat.packageQuantity !== null && mat.packageMeasurement) {
    return {
      packageQuantity: Number(mat.packageQuantity) || 1,
      packageMeasurement: String(mat.packageMeasurement).trim().toLowerCase()
    };
  }
  const unit = (((mat && mat.unit) || '') + ' ' + ((mat && mat.name) || '')).toLowerCase().trim();

  if (unit.includes('1 kg') || unit.includes('1kg') || unit.includes('kilo')) return { packageQuantity: 1000, packageMeasurement: 'g' };
  if (unit.includes('500g') || unit.includes('500 g') || unit.includes('500 ml') || unit.includes('500ml')) {
    const meas = unit.includes('ml') ? 'ml' : 'g';
    return { packageQuantity: 500, packageMeasurement: meas };
  }
  if (unit.includes('250g') || unit.includes('250 g')) return { packageQuantity: 250, packageMeasurement: 'g' };
  if (unit.includes('50g') || unit.includes('50 g')) return { packageQuantity: 50, packageMeasurement: 'g' };

  if (unit.includes('1 litro') || unit.includes('1l') || unit.includes('1 l')) return { packageQuantity: 1000, packageMeasurement: 'ml' };
  if (unit.includes('400 ml') || unit.includes('400ml')) return { packageQuantity: 400, packageMeasurement: 'ml' };
  if (unit.includes('250 ml') || unit.includes('250ml')) return { packageQuantity: 250, packageMeasurement: 'ml' };
  const mlMatch = unit.match(/(\d+)\s*ml/);
  if (mlMatch) return { packageQuantity: Number(mlMatch[1]), packageMeasurement: 'ml' };

  if (unit.includes('60x40') || unit.includes('60 x 40')) return { packageQuantity: 2400, packageMeasurement: 'cm²' };
  if (unit.includes('40x40') || unit.includes('40 x 40')) return { packageQuantity: 1600, packageMeasurement: 'cm²' };
  if (unit.includes('30x40') || unit.includes('30 x 40')) return { packageQuantity: 1200, packageMeasurement: 'cm²' };

  // DTF y Rollos Continuos
  if (unit.includes('100m') || unit.includes('100 m') || unit.includes('100 metros')) return { packageQuantity: 10000, packageMeasurement: 'cm' };
  if (unit.includes('15m') || unit.includes('15 m') || unit.includes('15 metros')) return { packageQuantity: 1500, packageMeasurement: 'cm' };

  // Cinta Térmica Kapton y rollos (3 rollos de 33m = 99m = 9900 cm)
  if (unit.includes('3 rollos') && (unit.includes('33m') || unit.includes('33 m'))) return { packageQuantity: 9900, packageMeasurement: 'cm' };
  if (unit.includes('33m') || unit.includes('33 m')) return { packageQuantity: 3300, packageMeasurement: 'cm' };
  if (unit.includes('10 m') || unit.includes('10m') || unit.includes('10 metros')) return { packageQuantity: 1000, packageMeasurement: 'cm' };
  if (unit.includes('20 m') || unit.includes('20m') || unit.includes('20 metros')) return { packageQuantity: 2000, packageMeasurement: 'cm' };
  if (unit.includes('50m') || unit.includes('50 m')) return { packageQuantity: 5000, packageMeasurement: 'cm' };

  if (unit.includes('500 pzas') || unit.includes('500')) return { packageQuantity: 500, packageMeasurement: 'pza' };
  if (unit.includes('200 pzas') || unit.includes('200')) return { packageQuantity: 200, packageMeasurement: 'pza' };
  if (unit.includes('100 pzas') || unit.includes('100 hojas') || unit.includes('100 pliegos') || unit.includes('100')) {
    const meas = unit.includes('hoja') || unit.includes('pliego') ? 'hoja' : 'pza';
    return { packageQuantity: 100, packageMeasurement: meas };
  }
  if (unit.includes('50 pzas') || unit.includes('50 pares') || unit.includes('50')) return { packageQuantity: 50, packageMeasurement: 'pza' };
  if (unit.includes('36 tazas') || unit.includes('36')) return { packageQuantity: 36, packageMeasurement: 'pza' };
  if (unit.includes('25 pzas') || unit.includes('25')) return { packageQuantity: 25, packageMeasurement: 'pza' };
  if (unit.includes('20 pzas') || unit.includes('20')) return { packageQuantity: 20, packageMeasurement: 'pza' };
  if (unit.includes('6 rollos') || unit.includes('6')) return { packageQuantity: 6, packageMeasurement: 'pza' };
  if (unit.includes('5 pzas') || unit.includes('5')) return { packageQuantity: 5, packageMeasurement: 'pza' };
  if (unit.includes('4 botellas') || unit.includes('4')) return { packageQuantity: 4, packageMeasurement: 'pza' };
  if (unit.includes('3 rollos') || unit.includes('3 pzas') || unit.includes('3')) return { packageQuantity: 3, packageMeasurement: 'pza' };
  if (unit.includes('2 pzas') || unit.includes('2 piezas') || unit.includes('2')) return { packageQuantity: 2, packageMeasurement: 'pza' };

  return { packageQuantity: 1, packageMeasurement: 'pza' };
}

// Convierte la cantidad requerida en la unidad del stock del almacén de taller
export function calculateMaterialStockDeduction(material, requiredQuantity, requiredUnit) {
  const reqUnit = normalizeUnit(requiredUnit || 'pza');
  const qty = Number(requiredQuantity) || 0;
  const pkg = parseMaterialPackage(material);
  const pkgMeas = normalizeUnit(pkg.packageMeasurement || 'pza');
  const pkgQty = Number(pkg.packageQuantity) || 1;

  if ((reqUnit === 'gota' || reqUnit === 'gotas') && (pkgMeas === 'ml' || pkgMeas === 'g')) {
    return Math.round(((qty * 0.05) / pkgQty) * 10000) / 10000;
  }
  if ((reqUnit === 'disparo' || reqUnit === 'disparos' || reqUnit === 'spray') && pkgMeas === 'ml') {
    return Math.round(((qty * 2) / pkgQty) * 10000) / 10000;
  }
  return Math.round(packageUnitsForQuantity(material, qty, requiredUnit) * 10000) / 10000;
}

const initialRawMaterials = [
  {
    "id": "mat-madera-nogal-fina",
    "name": "Madera Sólida Nogal Americano Calidad Selecta (30x40 cm x 1/2 pulgada)",
    "category": "laser",
    "materialType": "Madera Nogal",
    "color": "Nogal Americano",
    "finish": "Natural / Madera Noble",
    "unit": "tabla (30x40 cm)",
    "packageQuantity": 1200,
    "packageMeasurement": "cm²",
    "currentStock": 8,
    "minStockAlert": 3,
    "costPerUnit": 185,
    "supplierId": "sup-triplay-market",
    "supplier": "Triplay Market & Maderas Finas México",
    "notes": "Madera noble maciza de nogal oscuro con veta profunda premium. No es lo mismo que pino o MDF; se utiliza para bases presidenciales, alhajeros de lujo y cuadros de reconocimiento."
  },
  {
    "id": "mat-madera-pino-selecto",
    "name": "Madera Sólida Pino Selecto Estufado Primera (30x40 cm x 1/2 pulgada)",
    "category": "laser",
    "materialType": "Madera Pino",
    "color": "Pino Natural",
    "finish": "Natural / Estufado",
    "unit": "tabla (30x40 cm)",
    "packageQuantity": 1200,
    "packageMeasurement": "cm²",
    "currentStock": 15,
    "minStockAlert": 5,
    "costPerUnit": 65,
    "supplierId": "sup-maderas-san-luis",
    "supplier": "Maderas y Molduras San Luis",
    "notes": "Pino nacional estufado seco al horno sin humedad ni curvatura. Excelente relación costo/acabado para bases de letreros, llaveros y juguetes didácticos."
  },
  {
    "id": "mat-mdf-calibrado-3mm",
    "name": "Tablero MDF Calibrado Grado Láser 3mm (60x40 cm)",
    "category": "laser",
    "materialType": "MDF Calibrado",
    "color": "MDF Ocre",
    "finish": "Liso / Sin Astillas",
    "unit": "placa (60x40 cm)",
    "packageQuantity": 2400,
    "packageMeasurement": "cm²",
    "currentStock": 25,
    "minStockAlert": 10,
    "costPerUnit": 35,
    "supplierId": "sup-maderas-san-luis",
    "supplier": "Maderas y Molduras San Luis",
    "notes": "MDF de densidad media uniforme sin resinas tóxicas excesivas. Ideal para maquetas de arquitectura, cajas organizadoras y plantillas de taller."
  },
  {
    "id": "mat-kit-luz-led-3d",
    "name": "Kit Iluminación LED USB 5V Cálida con Interruptor para Lámparas 3D",
    "category": "assembly",
    "materialType": "Electrónica & Iluminación",
    "color": "Blanco Cálido 3000K",
    "finish": "Módulo Ensamblado",
    "unit": "kit (luz + cable 1.5m + switch)",
    "packageQuantity": 1,
    "packageMeasurement": "pza",
    "currentStock": 12,
    "minStockAlert": 5,
    "costPerUnit": 85,
    "supplierId": "sup-mercadolibre-componentes",
    "supplier": "Mercado Libre México (Componentes 3D & Electrónica)",
    "notes": "Módulo LED COB difuso de 5V seguro (no calienta el plástico PLA). Incluye cable trenzado USB con interruptor basculante integrado. Costo puesto en México considerando flete e impuestos de importación."
  },
  {
    "id": "mat-switches-clicker-mecanico",
    "name": "Interruptores Mecánicos de Teclado Clicker 3 Pines (Outemu Blue)",
    "category": "assembly",
    "materialType": "Mecanismos & Switches",
    "color": "Azul Clicky / Transparente",
    "finish": "Táctil Sonoro",
    "unit": "pack (10 piezas)",
    "packageQuantity": 10,
    "packageMeasurement": "pza",
    "currentStock": 8,
    "minStockAlert": 3,
    "costPerUnit": 60,
    "supplierId": "sup-mercadolibre-componentes",
    "supplier": "Mercado Libre México (Componentes 3D & Electrónica)",
    "notes": "Switches mecánicos de 3 pines (Mercado Libre MLM2097835304) para juguetes antiestrés clicker, tecladitos macropad e interactivos 3D. Costo unitario real puesto en taller ~$6.00 MXN c/u con flete e IVA prorrateado."
  },
  {
    "id": "mat-pla-olivo",
    "name": "Filamento PLA Verde Olivo Mate (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Verde Olivo",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 3.5,
    "minStockAlert": 2,
    "costPerUnit": 500,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Color institucional distintivo de Artesano Digital. Acabado mate sedoso sin brillo plástico."
  },
  {
    "id": "mat-pla-blanco",
    "name": "Filamento PLA Blanco Marfil / Crema (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 500,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Tono cálido orgánico para lámparas, macetas y letras en relieve."
  },
  {
    "id": "mat-pla-negro",
    "name": "Filamento PLA Negro Carbón Mate (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 2.2,
    "minStockAlert": 2,
    "costPerUnit": 500,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Base universal de alto contraste para soportes gamer, Smart Decks y organizadores."
  },
  {
    "id": "mat-pla-terracota",
    "name": "Filamento PLA Terracota Cálido / Arcilla (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Terracota",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 1.5,
    "minStockAlert": 1.5,
    "costPerUnit": 520,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Tono cálido ideal para macetas de interior, figuras botánicas y colección hogar."
  },
  {
    "id": "mat-pla-mostaza",
    "name": "Filamento PLA Amarillo Mostaza / Dorado Mate (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Mostaza Colonial",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 1.8,
    "minStockAlert": 1.5,
    "costPerUnit": 520,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Tono cálido colonial mexicano para piezas de diseño y acentos decorativos."
  },
  {
    "id": "mat-pla-madera",
    "name": "Filamento PLA Woodfill Madera Natural (1.75mm)",
    "category": "3d",
    "materialType": "Woodfill",
    "color": "Madera Woodfill",
    "finish": "Natural / Madera",
    "unit": "bobina (1 kg)",
    "currentStock": 1.2,
    "minStockAlert": 1,
    "costPerUnit": 680,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Compuesto con 20% fibras de pino reciclado. Se puede lijar, teñir y huele a madera al imprimir."
  },
  {
    "id": "mat-pla-seda-cobre",
    "name": "Filamento PLA Seda Bronce / Cobre Puro (1.75mm)",
    "category": "3d",
    "materialType": "Seda / Silk",
    "color": "Seda Bronce",
    "finish": "Seda / Satinado",
    "unit": "bobina (1 kg)",
    "currentStock": 1,
    "minStockAlert": 1,
    "costPerUnit": 560,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Acabado metálico satinado ultrabrillante para trofeos, placas y números de mesa."
  },
  {
    "id": "mat-pla-seda-oro",
    "name": "Filamento PLA Seda Oro Champagne Metalizado (1.75mm)",
    "category": "3d",
    "materialType": "Seda / Silk",
    "color": "Seda Oro",
    "finish": "Seda / Satinado",
    "unit": "bobina (1 kg)",
    "currentStock": 1.5,
    "minStockAlert": 1,
    "costPerUnit": 560,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Especial para eventos VIP, bodas y aniversarios de negocios."
  },
  {
    "id": "mat-pla-marmol",
    "name": "Filamento PLA Mármol Granulado Mineral (1.75mm)",
    "category": "3d",
    "materialType": "Mármol",
    "color": "Mármol Granulado",
    "finish": "Texturizado / Mármol",
    "unit": "bobina (1 kg)",
    "currentStock": 0.9,
    "minStockAlert": 1,
    "costPerUnit": 540,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Base blanca con partículas oscuras que ocultan completamente las líneas de capa."
  },
  {
    "id": "mat-pla-glow",
    "name": "Filamento PLA Glow in the Dark Fotoluminiscente (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Glow Neón",
    "finish": "Glow / Neón",
    "unit": "bobina (1 kg)",
    "currentStock": 0.5,
    "minStockAlert": 1,
    "costPerUnit": 620,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Brilla en color verde esmeralda tras exponerse a luz natural o UV. Requiere boquilla hardened steel."
  },
  {
    "id": "mat-pla-bicolor",
    "name": "Filamento PLA Bicolor Seda Coextrusión Verde/Oro (1.75mm)",
    "category": "3d",
    "materialType": "Bicolor",
    "color": "Bicolor Verde/Oro",
    "finish": "Seda / Satinado",
    "unit": "bobina (1 kg)",
    "currentStock": 1.1,
    "minStockAlert": 1,
    "costPerUnit": 640,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Doble tono con cambio de color al rotar la pieza frente a la luz."
  },
  {
    "id": "mat-pla-gris",
    "name": "Filamento PLA Gris Concreto Arquitectónico (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Gris Concreto",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 2,
    "minStockAlert": 1.5,
    "costPerUnit": 500,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Tono neutro sobrio para prototipos técnicos, maquetas y organizadores de escritorio."
  },
  {
    "id": "mat-pla-rojo",
    "name": "Filamento PLA Rojo Carmesí Mate (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Rojo Carmesí",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 1.4,
    "minStockAlert": 1,
    "costPerUnit": 520,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Color vibrante para logotipos corporativos y distintivos de eventos."
  },
  {
    "id": "mat-pla-azul",
    "name": "Filamento PLA Azul Zafiro Profundo (1.75mm)",
    "category": "3d",
    "materialType": "PLA",
    "color": "Azul Zafiro",
    "finish": "Seda / Satinado",
    "unit": "bobina (1 kg)",
    "currentStock": 1.6,
    "minStockAlert": 1,
    "costPerUnit": 530,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Acabado sedoso para premios y accesorios tecnológicos."
  },
  {
    "id": "mat-tpu-olivo",
    "name": "Filamento TPU Flexible 95A Verde Olivo (1.75mm)",
    "category": "3d",
    "materialType": "TPU Flexible",
    "color": "Verde Olivo",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 0.6,
    "minStockAlert": 1,
    "costPerUnit": 700,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Material gomoso de alta amortiguación para protectores de esquinas y sellos."
  },
  {
    "id": "mat-tpu-negro",
    "name": "Filamento TPU Flexible 95A Negro Elastomérico (1.75mm)",
    "category": "3d",
    "materialType": "TPU Flexible",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "bobina (1 kg)",
    "currentStock": 1.2,
    "minStockAlert": 1,
    "costPerUnit": 700,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Topes antideslizantes para bases de códigos QR, soportes de audífonos y protectores."
  },
  {
    "id": "mat-tpu-trans",
    "name": "Filamento TPU Flexible 95A Translúcido Cristalino (1.75mm)",
    "category": "3d",
    "materialType": "TPU Flexible",
    "color": "Translúcido Cristal",
    "finish": "Translúcido",
    "unit": "bobina (1 kg)",
    "currentStock": 0.8,
    "minStockAlert": 1,
    "costPerUnit": 720,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Paredes flexibles difusoras de luz LED para lámparas personalizadas."
  },
  {
    "id": "mat-petg-trans",
    "name": "Filamento PETG Translúcido Difusor Cristal (1.75mm)",
    "category": "3d",
    "materialType": "PETG",
    "color": "Translúcido Cristal",
    "finish": "Translúcido",
    "unit": "bobina (1 kg)",
    "currentStock": 1.5,
    "minStockAlert": 1,
    "costPerUnit": 550,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Resistente al impacto y rayos UV exterior. Excelente difusor para iluminación LED cálida."
  },
  {
    "id": "mat-petg-negro",
    "name": "Filamento PETG Negro Alta Resistencia Térmica (1.75mm)",
    "category": "3d",
    "materialType": "PETG",
    "color": "Negro Carbón",
    "finish": "Brillante / Glossy",
    "unit": "bobina (1 kg)",
    "currentStock": 2.1,
    "minStockAlert": 1.5,
    "costPerUnit": 550,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Soporta hasta 75°C sin deformación. Ideal para piezas de automóviles y expositores bajo sol."
  },
  {
    "id": "mat-spray-3dlac",
    "name": "Adhesivo Fijador de Cama Caliente 3DLac (Spray 400ml)",
    "category": "3d",
    "materialType": "Consumibles 3D",
    "color": "N/A",
    "finish": "Estándar",
    "unit": "lata (400 ml)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 290,
    "supplierId": "sup-printlab",
    "supplier": "PrintLab México 3D",
    "notes": "Elimina el warping en piezas grandes de PLA, PETG y TPU sobre base PEI texturizada."
  },
  {
    "id": "mat-tazas-magicas",
    "name": "Tazas Cerámica Negras Mágicas Revelado Térmico (11 oz)",
    "category": "sublimation",
    "materialType": "Taza Mágica",
    "color": "Negro Carbón",
    "finish": "Mágico Térmico",
    "unit": "pieza",
    "currentStock": 18,
    "minStockAlert": 12,
    "costPerUnit": 68,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Taza con polímero termosensible negro que al verter agua caliente revela el diseño a color."
  },
  {
    "id": "mat-tazas-blancas-11oz",
    "name": "Tazas Cerámica Blanco Puro Grado A+ Sublimable (11 oz)",
    "category": "sublimation",
    "materialType": "Taza Cerámica",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 48,
    "minStockAlert": 36,
    "costPerUnit": 28,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Taza cerámica de máxima blancura y barniz parejo Grado A+. Insumo de mayor volumen del taller."
  },
  {
    "id": "mat-tazas-bicolor-olivo",
    "name": "Tazas Cerámica Bicolor Interior y Asa Verde Olivo (11 oz)",
    "category": "sublimation",
    "materialType": "Taza Cerámica",
    "color": "Verde Olivo",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 14,
    "minStockAlert": 12,
    "costPerUnit": 34,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Cuerpo blanco exterior para sublimación con asa e interior verde olivo a tono con Artesano Digital."
  },
  {
    "id": "mat-tazas-bicolor-mostaza",
    "name": "Tazas Cerámica Bicolor Interior y Asa Amarillo Mostaza (11 oz)",
    "category": "sublimation",
    "materialType": "Taza Cerámica",
    "color": "Mostaza Colonial",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 16,
    "minStockAlert": 12,
    "costPerUnit": 34,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Interior y asa amarillo mostaza cálido colonial. Excelente contraste con diseños botánicos."
  },
  {
    "id": "mat-tazas-bicolor-negro",
    "name": "Tazas Cerámica Bicolor Interior y Asa Negro Carbón (11 oz)",
    "category": "sublimation",
    "materialType": "Taza Cerámica",
    "color": "Negro Carbón",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 20,
    "minStockAlert": 12,
    "costPerUnit": 34,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Interior y asa negra brillante para marcas de café, barberías y estudios de diseño."
  },
  {
    "id": "mat-tazas-bicolor-rojo",
    "name": "Tazas Cerámica Bicolor Interior y Asa Rojo Carmesí (11 oz)",
    "category": "sublimation",
    "materialType": "Taza Cerámica",
    "color": "Rojo Carmesí",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 12,
    "minStockAlert": 12,
    "costPerUnit": 34,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Ideal para temporada de San Valentín, Navidad y aniversarios."
  },
  {
    "id": "mat-tazas-peltre-vintage",
    "name": "Tazas Peltre / Enamel Esmaltado Estilo Vintage Borde Plata (10 oz)",
    "category": "sublimation",
    "materialType": "Taza Peltre Vintage",
    "color": "Blanco Marfil",
    "finish": "Esmaltado / Peltre",
    "unit": "pieza",
    "currentStock": 24,
    "minStockAlert": 12,
    "costPerUnit": 48,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Taza de acero esmaltado estilo campirano con reborde plateado. Muy cotizada para cafeterías rústicas."
  },
  {
    "id": "mat-tazas-conicas-latte",
    "name": "Tazas Cónicas de Cerámica para Café Latte (12 oz)",
    "category": "sublimation",
    "materialType": "Taza Conica",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 15,
    "minStockAlert": 10,
    "costPerUnit": 42,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Forma cónica moderna. Requiere almohadilla cónica especial en la prensa de tazas."
  },
  {
    "id": "mat-tazas-cristal-esmerilado",
    "name": "Tazas de Cristal Esmerilado / Pavonado Sublimable (11 oz)",
    "category": "sublimation",
    "materialType": "Taza / Tarro Cristal",
    "color": "Translúcido Cristal",
    "finish": "Esmerilado / Pavonado",
    "unit": "pieza",
    "currentStock": 18,
    "minStockAlert": 10,
    "costPerUnit": 45,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Cristal translúcido con textura mate sedosa al tacto. Da apariencia elegante a monogramas."
  },
  {
    "id": "mat-tarro-cervecero-satinado",
    "name": "Tarros Cerveceros de Cristal Satinado Esmerilado (16 oz)",
    "category": "sublimation",
    "materialType": "Taza / Tarro Cristal",
    "color": "Translúcido Cristal",
    "finish": "Esmerilado / Pavonado",
    "unit": "pieza",
    "currentStock": 22,
    "minStockAlert": 12,
    "costPerUnit": 65,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Capacidad de medio litro. Muy pedido para cumpleaños de adultos, despedidas y eventos deportivos."
  },
  {
    "id": "mat-termos-blancos-500ml",
    "name": "Termos Metálicos Acero Inoxidable Blanco Sublimable (500 ml)",
    "category": "sublimation",
    "materialType": "Termo Metálico",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 16,
    "minStockAlert": 10,
    "costPerUnit": 120,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Doble pared térmica al vacío. Mantiene bebidas frías 12 hrs o calientes 8 hrs."
  },
  {
    "id": "mat-termos-plata-500ml",
    "name": "Termos Metálicos Acero Inoxidable Plata Espejo (500 ml)",
    "category": "sublimation",
    "materialType": "Termo Metálico",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "pieza",
    "currentStock": 12,
    "minStockAlert": 8,
    "costPerUnit": 125,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Cuerpo metálico plateado. Los colores impresos adquieren brillo metalizado reflectivo."
  },
  {
    "id": "mat-tumbler-skinny-20oz",
    "name": "Vasos Skinny Tumbler Térmicos Rectos con Tapa y Popote (20 oz)",
    "category": "sublimation",
    "materialType": "Skinny Tumbler",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 18,
    "minStockAlert": 12,
    "costPerUnit": 135,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Cilindro perfectamente recto de 20 oz. Permite sublimación continua 360° sin bordes."
  },
  {
    "id": "mat-tumbler-glitter-20oz",
    "name": "Vasos Skinny Tumbler con Brillo Glitter Sublimable (20 oz)",
    "category": "sublimation",
    "materialType": "Skinny Tumbler",
    "color": "Glitter Oro",
    "finish": "Glitter / Diamantado",
    "unit": "pieza",
    "currentStock": 10,
    "minStockAlert": 8,
    "costPerUnit": 155,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Recubrimiento polimérico con microescarchado brillante. Ideal para graduaciones y bodas."
  },
  {
    "id": "mat-latas-aluminio-500ml",
    "name": "Latas Térmicas de Aluminio Sublimables con Popote Retráctil (500 ml)",
    "category": "sublimation",
    "materialType": "Lata Aluminio",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 14,
    "minStockAlert": 8,
    "costPerUnit": 98,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Forma idéntica a lata de refresco con boquilla de silicón retráctil hermética."
  },
  {
    "id": "mat-botellas-deportivas-aluminio",
    "name": "Botellas Deportivas de Aluminio con Mosquetón (600 ml)",
    "category": "sublimation",
    "materialType": "Botella Deportiva",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 20,
    "minStockAlert": 12,
    "costPerUnit": 72,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Liviana y resistente para kits de gimnasio, senderismo y eventos de ciclismo."
  },
  {
    "id": "mat-playera-poliester-blanca",
    "name": "Playeras Blancas Tacto Algodón Spun Poliéster Cuello Redondo",
    "category": "sublimation",
    "materialType": "Textil / Playera / Gorra",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "pieza",
    "currentStock": 30,
    "minStockAlert": 20,
    "costPerUnit": 65,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Tejido suave tipo algodón peinado. La tinta penetra la fibra y no se desgasta con lavadas."
  },
  {
    "id": "mat-gorras-sublimables-malla",
    "name": "Gorras Trucker Frente Blanco Acolchado con Malla Trasera",
    "category": "sublimation",
    "materialType": "Textil / Playera / Gorra",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "pieza",
    "currentStock": 25,
    "minStockAlert": 15,
    "costPerUnit": 35,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Broche de plástico ajustable. Frente de esponja rígida listo para plancha de gorras."
  },
  {
    "id": "mat-cojines-cuadrados-40x40",
    "name": "Cojines Decorativos Sublimables con Cierre Oculto (40x40 cm)",
    "category": "sublimation",
    "materialType": "Textil / Playera / Gorra",
    "color": "Blanco Marfil",
    "finish": "Seda / Satinado",
    "unit": "pieza",
    "currentStock": 16,
    "minStockAlert": 10,
    "costPerUnit": 75,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Funda de lino sintético de tacto fino lavable en lavadora. Incluye relleno de delcrón."
  },
  {
    "id": "mat-tote-bag-sublimable",
    "name": "Bolsas Tote Bag Ecológicas de Poliéster Lienzo Sublimable",
    "category": "sublimation",
    "materialType": "Textil / Playera / Gorra",
    "color": "Blanco Marfil",
    "finish": "Natural / Textil",
    "unit": "pieza",
    "currentStock": 35,
    "minStockAlert": 20,
    "costPerUnit": 38,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Asas reforzadas de 60 cm. Excelente producto para marcas ecológicas y librerías."
  },
  {
    "id": "mat-rompecabezas-a4",
    "name": "Rompecabezas Sublimables Cartón Rígido Brillante A4 (120 piezas)",
    "category": "sublimation",
    "materialType": "Mousepad & Rompecabezas",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 15,
    "minStockAlert": 10,
    "costPerUnit": 45,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Corte troquelado de alta precisión. Recubrimiento brillante para fotos familiares."
  },
  {
    "id": "mat-mousepad-ergonomico",
    "name": "Mouse Pads Sublimables con Base de Neopreno Antideslizante (22x18 cm)",
    "category": "sublimation",
    "materialType": "Mousepad & Rompecabezas",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "pieza",
    "currentStock": 25,
    "minStockAlert": 15,
    "costPerUnit": 25,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Espuma de caucho negro de 3mm con tela de poliéster prensada de alta durabilidad."
  },
  {
    "id": "mat-llaveros-mdf-sublimable",
    "name": "Llaveros Sublimables MDF Doble Cara con Argolla (50 pzas)",
    "category": "sublimation",
    "materialType": "Mousepad & Rompecabezas",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "paquete (50 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 220,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "MDF de 3mm con barniz de sublimación por ambos lados y película plástica protectora."
  },
  {
    "id": "mat-tintas-sublimacion-cmyk",
    "name": "Tintas de Sublimación Alta Definición Anti-Tapado CMYK (Set 4x100ml)",
    "category": "sublimation",
    "materialType": "Papel, Tintas & Consumibles",
    "color": "Multicolor / CMYK",
    "finish": "Estándar",
    "unit": "set (4 botellas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 480,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Fórmula de dispersión microscópica para cabezales piezoeléctricos Epson sin obstrucciones."
  },
  {
    "id": "mat-papel-sublimacion",
    "name": "Papel Sublimación de Secado Rápido A4 Premium (Paquete 100 hojas)",
    "category": "sublimation",
    "materialType": "Papel, Tintas & Consumibles",
    "color": "Blanco Marfil",
    "finish": "Estándar",
    "unit": "paquete (100 hojas)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 180,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Transferencia del 98% de la tinta a la superficie receptora con secado instantáneo."
  },
  {
    "id": "mat-cartulina-opalina",
    "name": "Cartulina Opalina Holandesa 250g A4 (Paquete 100 hojas)",
    "category": "sublimation",
    "materialType": "Papel, Tintas & Consumibles",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "paquete (100 hojas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 140,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Papelería fina de presentación, tarjetas de cuidados para envíos y certificados de taller."
  },
  {
    "id": "mat-cinta-termica-kapton",
    "name": "Cinta Térmica Kapton Alta Resistencia al Calor 10mm x 33m (3 rollos)",
    "category": "sublimation",
    "materialType": "Papel, Tintas & Consumibles",
    "color": "Mostaza Colonial",
    "finish": "Translúcido",
    "unit": "paquete (3 rollos)",
    "currentStock": 5,
    "minStockAlert": 2,
    "costPerUnit": 90,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Poliamida dorada resistente hasta 260°C sin dejar residuos de pegamento en la cerámica."
  },
  {
    "id": "mat-hojas-teflon-prensa",
    "name": "Láminas Protectoras de Teflón para Prensa Plana 40x50 cm (2 pzas)",
    "category": "sublimation",
    "materialType": "Papel, Tintas & Consumibles",
    "color": "Café Caramelo",
    "finish": "Satinado",
    "unit": "paquete (2 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 160,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Evita que el exceso de tinta o vinil se queme y manche la plancha superior."
  },
  {
    "id": "mat-madera-triplay-3mm",
    "name": "Madera Natural Pino / Triplay Selecto 3mm Calidad Láser (60x40 cm)",
    "category": "laser",
    "materialType": "Triplay Pino",
    "color": "Madera Natural",
    "finish": "Natural / Madera",
    "unit": "placa (60x40 cm)",
    "currentStock": 18,
    "minStockAlert": 10,
    "costPerUnit": 45,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Madera natural de pino calibrada para corte láser limpio y grabado nítido (100% libre de MDF)."
  },
  {
    "id": "mat-triplay-caobilla-3mm",
    "name": "Madera Triplay Caobilla / Okume 3mm Acabado Rojizo (60x40 cm)",
    "category": "laser",
    "materialType": "Triplay Caobilla",
    "color": "Terracota",
    "finish": "Natural / Madera",
    "unit": "placa (60x40 cm)",
    "currentStock": 12,
    "minStockAlert": 8,
    "costPerUnit": 52,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Veta fina de caoba africana. Muy elegante para portarretratos y cajas de joyería."
  },
  {
    "id": "mat-triplay-pino-5mm",
    "name": "Madera Triplay Pino 5.5mm para Estructuras Rígidas (60x40 cm)",
    "category": "laser",
    "materialType": "Triplay Pino",
    "color": "Madera Natural",
    "finish": "Natural / Madera",
    "unit": "placa (60x40 cm)",
    "currentStock": 10,
    "minStockAlert": 6,
    "costPerUnit": 65,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Espesor robusto para letreros de boda, cajas ensamblables y soportes de mostrador."
  },
  {
    "id": "mat-mdf-3mm",
    "name": "Placas MDF Natural Calibrado 3mm (60x40 cm)",
    "category": "laser",
    "materialType": "MDF Natural",
    "color": "Café Claro",
    "finish": "Mate",
    "unit": "placa (60x40 cm)",
    "currentStock": 35,
    "minStockAlert": 20,
    "costPerUnit": 35,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Densidad homogénea para plantillas de corte, maquetas y letreros para pintar."
  },
  {
    "id": "mat-mdf-5mm",
    "name": "Placas MDF Calibrado 5.5mm para Letreros 3D (60x40 cm)",
    "category": "laser",
    "materialType": "MDF Natural",
    "color": "Café Claro",
    "finish": "Mate",
    "unit": "placa (60x40 cm)",
    "currentStock": 18,
    "minStockAlert": 10,
    "costPerUnit": 55,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Da volumen tridimensional a letras corpóreas para pared de negocios."
  },
  {
    "id": "mat-mdf-melamina-blanca",
    "name": "Placas MDF Melamina Blanca 1 Cara 3mm (60x40 cm)",
    "category": "laser",
    "materialType": "MDF Melamina",
    "color": "Blanco Marfil",
    "finish": "Satinado",
    "unit": "placa (60x40 cm)",
    "currentStock": 14,
    "minStockAlert": 8,
    "costPerUnit": 48,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Frente blanco liso fácil de limpiar con grabado láser que deja ver el núcleo café."
  },
  {
    "id": "mat-acrilico-cristal",
    "name": "Placas Acrílico Transparente Cristal Óptico 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Cristal",
    "color": "Translúcido Cristal",
    "finish": "Brillante / Glossy",
    "unit": "placa (40x40 cm)",
    "currentStock": 15,
    "minStockAlert": 8,
    "costPerUnit": 90,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Transparencia del 93%. Base para placas QR de mesa y protectores de mostrador."
  },
  {
    "id": "mat-acrilico-negro",
    "name": "Placas Acrílico Óptico Negro Brillante 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Color",
    "color": "Negro Carbón",
    "finish": "Brillante / Glossy",
    "unit": "placa (40x40 cm)",
    "currentStock": 12,
    "minStockAlert": 8,
    "costPerUnit": 95,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Acabado piano ultrabrillante para placas ejecutivas y logotipos corporativos."
  },
  {
    "id": "mat-acrilico-negro-mate",
    "name": "Placas Acrílico Negro Satinado Mate 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Color",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "placa (40x40 cm)",
    "currentStock": 8,
    "minStockAlert": 6,
    "costPerUnit": 105,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Textura mate antihuellas muy solicitada en gastronomía y bares modernos."
  },
  {
    "id": "mat-acrilico-blanco",
    "name": "Placas Acrílico Blanco Lechoso Difusor 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Color",
    "color": "Blanco Marfil",
    "finish": "Satinado",
    "unit": "placa (40x40 cm)",
    "currentStock": 14,
    "minStockAlert": 8,
    "costPerUnit": 95,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Difunde uniformemente la luz de tiras LED sin mostrar los puntos individuales."
  },
  {
    "id": "mat-acrilico-espejo-oro",
    "name": "Placas Acrílico Espejo Dorado Reflectivo 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Espejo",
    "color": "Seda Oro",
    "finish": "Espejo Reflectivo",
    "unit": "placa (40x40 cm)",
    "currentStock": 7,
    "minStockAlert": 5,
    "costPerUnit": 135,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Reflejo idéntico a espejo de vidrio pero irrompible. Letras para letreros de boda."
  },
  {
    "id": "mat-acrilico-espejo-plata",
    "name": "Placas Acrílico Espejo Plata Reflectivo 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Espejo",
    "color": "Plata Metálico",
    "finish": "Espejo Reflectivo",
    "unit": "placa (40x40 cm)",
    "currentStock": 6,
    "minStockAlert": 5,
    "costPerUnit": 130,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Detalles brillantes tipo cromo para logotipos de barbería y joyería."
  },
  {
    "id": "mat-acrilico-humo",
    "name": "Placas Acrílico Humo Translúcido 3mm (40x40 cm)",
    "category": "laser",
    "materialType": "Acrílico Color",
    "color": "Gris Concreto",
    "finish": "Translúcido",
    "unit": "placa (40x40 cm)",
    "currentStock": 6,
    "minStockAlert": 4,
    "costPerUnit": 105,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Tono gris ahumado oscuro semitransparente para tableros de control y cajas de audio."
  },
  {
    "id": "mat-cuero-curpiel",
    "name": "Piel / Cuero Sintético Curpiel Grabable Negro/Dorado (30x40 cm)",
    "category": "laser",
    "materialType": "Piel Sintética Curpiel",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "lámina (30x40 cm)",
    "currentStock": 14,
    "minStockAlert": 8,
    "costPerUnit": 85,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Bicapa grabable: al pasar el láser quema la capa negra y revela dorado metálico nítido."
  },
  {
    "id": "mat-cuero-curpiel-caramelo",
    "name": "Piel Sintética Curpiel Bicapa Café Caramelo para Parches (30x40 cm)",
    "category": "laser",
    "materialType": "Piel Sintética Curpiel",
    "color": "Madera Natural",
    "finish": "Natural / Cuero",
    "unit": "lámina (30x40 cm)",
    "currentStock": 12,
    "minStockAlert": 8,
    "costPerUnit": 85,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Insumo principal para los parches grabados a láser del Servicio Patch Bar en Vivo."
  },
  {
    "id": "mat-laca-spray",
    "name": "Laca Protectora Selladora Mate en Spray (400 ml)",
    "category": "laser",
    "materialType": "Acabados & Laca",
    "color": "Translúcido Cristal",
    "finish": "Mate",
    "unit": "lata (400 ml)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 120,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Sella el poro de la madera y fija el hollín del grabado láser para que no manche."
  },
  {
    "id": "mat-cera-madera",
    "name": "Cera de Abeja Natural & Aceite de Linaza para Curado (250g)",
    "category": "laser",
    "materialType": "Acabados & Laca",
    "color": "Amarillo Cera",
    "finish": "Satinado",
    "unit": "frasco (250g)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 150,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Tratamiento no tóxico grado alimenticio para tablas de queso y letreros artesanales."
  },
  {
    "id": "mat-barniz-poliuretano-spray",
    "name": "Barniz Poliuretano Transparente Satinado en Spray (400 ml)",
    "category": "laser",
    "materialType": "Acabados & Laca",
    "color": "Translúcido Cristal",
    "finish": "Seda / Satinado",
    "unit": "lata (400 ml)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 135,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Protección hidrófuga extrema contra salpicaduras de agua y humedad ambiental."
  },
  {
    "id": "mat-madera-abedul-3mm",
    "name": "Madera Abedul / Pino Calidad Láser Selecta 3mm (60x40 cm)",
    "category": "laser",
    "materialType": "Madera Natural",
    "color": "Madera Clara Natural",
    "finish": "Natural / Madera",
    "unit": "placa (60x40 cm)",
    "packageQuantity": 2400,
    "packageMeasurement": "cm²",
    "currentStock": 20,
    "minStockAlert": 10,
    "costPerUnit": 58,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Madera natural sólida estufada libre de nudos y sin MDF, corte limpio y borde tostado claro uniforme."
  },
  {
    "id": "mat-barniz-poliuretano-transparente",
    "name": "Barniz Poliuretano Transparente Protector Sellador (500 ml)",
    "category": "laser",
    "materialType": "Barniz Transparente",
    "color": "Cristal Transparente",
    "finish": "Satinado / Cristal",
    "unit": "bote (500 ml)",
    "packageQuantity": 500,
    "packageMeasurement": "ml",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 140,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Capa protectora selladora transparente repelente a humedad, agua y polvo para llaveros y piezas de madera."
  },
  {
    "id": "mat-tinte-nogal-americano",
    "name": "Tinte y Barniz Nogal Americano Base Aceite para Madera (250 ml)",
    "category": "laser",
    "materialType": "Tinte Madera",
    "color": "Nogal Americano",
    "finish": "Satinado Cálido",
    "unit": "frasco (250 ml)",
    "packageQuantity": 250,
    "packageMeasurement": "ml",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 115,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Tono nogal clásico cálido y profundo que resalta las vetas de la madera en llaveros y letreros."
  },
  {
    "id": "mat-tinte-verde-bosque",
    "name": "Tinte para Madera Verde Bosque / Rústico Artesanal (250 ml)",
    "category": "laser",
    "materialType": "Tinte Madera",
    "color": "Verde Bosque Rústico",
    "finish": "Mate Satinado",
    "unit": "frasco (250 ml)",
    "packageQuantity": 250,
    "packageMeasurement": "ml",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 120,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Tinte vegetal traslúcido verde bosque que deja ver la veta orgánica para piezas vintage y llaveros botánicos."
  },
  {
    "id": "mat-tinte-azul-colonial",
    "name": "Tinte para Madera Azul Colonial Vintage (250 ml)",
    "category": "laser",
    "materialType": "Tinte Madera",
    "color": "Azul Colonial Vintage",
    "finish": "Mate Satinado",
    "unit": "frasco (250 ml)",
    "packageQuantity": 250,
    "packageMeasurement": "ml",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 120,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Tinte artesanal azul añejo traslúcido para camaritas de madera retro y detalles coloniales."
  },
  {
    "id": "mat-tinte-caoba",
    "name": "Tinte y Barniz Caoba Clásico Rojizo para Madera (250 ml)",
    "category": "laser",
    "materialType": "Tinte Madera",
    "color": "Caoba Clásico",
    "finish": "Satinado Elegante",
    "unit": "frasco (250 ml)",
    "packageQuantity": 250,
    "packageMeasurement": "ml",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 115,
    "supplierId": "sup-maderas-bajio",
    "supplier": "Maderas & Láser del Bajío",
    "notes": "Tinte cálido rojizo de estilo artesanal para letreros de eventos, libros de firmas y recuerdos finos."
  },
  {
    "id": "mat-vinil-textil-blanco",
    "name": "Vinil Textil Térmico HTV Básico Blanco (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Textil HTV",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 12,
    "minStockAlert": 5,
    "costPerUnit": 130,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Poliuretano ultrafino elástico con soporte adhesivo para depilado rápido de detalles pequeños."
  },
  {
    "id": "mat-vinil-textil-negro",
    "name": "Vinil Textil Térmico HTV Básico Negro Siser EasyWeed (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Textil HTV",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 10,
    "minStockAlert": 5,
    "costPerUnit": 130,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Se aplica a 150°C durante 10-15 segundos. Se retira en caliente o frío sin despegarse."
  },
  {
    "id": "mat-vinil-textil-olivo",
    "name": "Vinil Textil Térmico HTV Verde Olivo Taller (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Textil HTV",
    "color": "Verde Olivo",
    "finish": "Mate",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 8,
    "minStockAlert": 4,
    "costPerUnit": 140,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Tono verde olivo coordinado con la identidad corporativa de Artesano Digital."
  },
  {
    "id": "mat-vinil-textil-mostaza",
    "name": "Vinil Textil Térmico HTV Amarillo Mostaza Colonial (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Textil HTV",
    "color": "Mostaza Colonial",
    "finish": "Mate",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 6,
    "minStockAlert": 3,
    "costPerUnit": 140,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Color cálido muy llamativo para uniformes de cafeterías y delantales de baristas."
  },
  {
    "id": "mat-vinil-textil-rojo",
    "name": "Vinil Textil Térmico HTV Rojo Carmesí (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Textil HTV",
    "color": "Rojo Carmesí",
    "finish": "Mate",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 5,
    "minStockAlert": 3,
    "costPerUnit": 135,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Gran adherencia en telas de algodón 100%, poliéster y mezclas spandex."
  },
  {
    "id": "mat-vinil-puff-blanco",
    "name": "Vinil Textil PUFF 3D Relieve Inflable Blanco (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil PUFF 3D",
    "color": "Blanco Marfil",
    "finish": "Puff 3D (Relieve Inflable)",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 6,
    "minStockAlert": 3,
    "costPerUnit": 195,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Al recibir calor en la prensa se infla creando un relieve tridimensional de hasta 1.5mm."
  },
  {
    "id": "mat-vinil-puff-negro",
    "name": "Vinil Textil PUFF 3D Relieve Inflable Negro (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil PUFF 3D",
    "color": "Negro Carbón",
    "finish": "Puff 3D (Relieve Inflable)",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 5,
    "minStockAlert": 3,
    "costPerUnit": 195,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Efecto acolchado tipo serigrafía inflable para sudaderas streetwear y gorras."
  },
  {
    "id": "mat-vinil-puff-olivo",
    "name": "Vinil Textil PUFF 3D Relieve Inflable Verde Olivo (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil PUFF 3D",
    "color": "Verde Olivo",
    "finish": "Puff 3D (Relieve Inflable)",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 4,
    "minStockAlert": 3,
    "costPerUnit": 210,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Color exclusivo de taller con volumen texturizado mate de alta gama."
  },
  {
    "id": "mat-vinil-puff-terracota",
    "name": "Vinil Textil PUFF 3D Relieve Inflable Terracota Cálido (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil PUFF 3D",
    "color": "Terracota",
    "finish": "Puff 3D (Relieve Inflable)",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 210,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Tono arcilla con volumen inflado para colecciones de autor y hoodies."
  },
  {
    "id": "mat-vinil-textil-glitter-oro",
    "name": "Vinil Textil Glitter Diamantado Oro Champagne (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Glitter",
    "color": "Seda Oro",
    "finish": "Glitter / Diamantado",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 5,
    "minStockAlert": 3,
    "costPerUnit": 175,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Micropartículas de brillo selladas que no desprenden diamantina en las lavadas."
  },
  {
    "id": "mat-vinil-textil-glitter-plata",
    "name": "Vinil Textil Glitter Diamantado Plata Radiante (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Glitter",
    "color": "Plata Metálico",
    "finish": "Glitter / Diamantado",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 175,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Brillo plateado intenso para batas de quinceañeras y playeras de despedida de soltera."
  },
  {
    "id": "mat-vinil-textil-holografico",
    "name": "Vinil Textil Holográfico Tornasol Arcoíris (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Holográfico",
    "color": "Tornasol",
    "finish": "Brillante / Glossy",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 185,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Refleja destellos multicolores prisma según el ángulo de incidencia de la luz."
  },
  {
    "id": "mat-vinil-textil-reflectivo",
    "name": "Vinil Textil Reflectivo Seguridad Gris Plata 3M (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Reflectivo",
    "color": "Gris Concreto",
    "finish": "Reflejante",
    "unit": "metro lineal (50 cm ancho)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 165,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Rebota la luz de los faros de automóviles. Certificado para ropa de ciclistas y seguridad."
  },
  {
    "id": "mat-vinil-negro",
    "name": "Vinil Adhesivo Permanente Oracal 651 Negro Mate (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Adhesivo Oracal",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "metro lineal (61 cm ancho)",
    "currentStock": 15,
    "minStockAlert": 8,
    "costPerUnit": 85,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Adhesivo base solvente durabilidad 6 años exterior para rotulación en letreros y cristales."
  },
  {
    "id": "mat-vinil-blanco",
    "name": "Vinil Adhesivo Blanco Brillante Oracal 651 (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Adhesivo Oracal",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "metro lineal (61 cm ancho)",
    "currentStock": 18,
    "minStockAlert": 8,
    "costPerUnit": 85,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Blanco puro reflectivo para rotulación de horarios comerciales y frases de bienvenida."
  },
  {
    "id": "mat-vinil-olivo-adhesivo",
    "name": "Vinil Adhesivo Permanente Oracal 651 Verde Olivo Mate (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Adhesivo Oracal",
    "color": "Verde Olivo",
    "finish": "Mate",
    "unit": "metro lineal (61 cm ancho)",
    "currentStock": 8,
    "minStockAlert": 4,
    "costPerUnit": 90,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Color distintivo para stickers institucionales de taller y señalética."
  },
  {
    "id": "mat-vinil-oro",
    "name": "Vinil Adhesivo Metálico Oro Artesano Satinado (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Adhesivo Oracal",
    "color": "Seda Oro",
    "finish": "Seda / Satinado",
    "unit": "metro lineal (61 cm ancho)",
    "currentStock": 7,
    "minStockAlert": 4,
    "costPerUnit": 110,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Tono oro cepillado para numeración de mesas VIP y monogramas de boda."
  },
  {
    "id": "mat-vinil-esmerilado-vidrio",
    "name": "Vinil Adhesivo Esmerilado / Sandblast Grabado Vidrio (Metro lineal)",
    "category": "vinyl",
    "materialType": "Vinil Adhesivo Oracal",
    "color": "Translúcido Cristal",
    "finish": "Esmerilado / Pavonado",
    "unit": "metro lineal (61 cm ancho)",
    "currentStock": 8,
    "minStockAlert": 4,
    "costPerUnit": 95,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Simula grabado al ácido sobre mamparas de baño, ventanas y puertas de oficina."
  },
  {
    "id": "mat-papel-transfer",
    "name": "Cinta Transportadora Transfer con Cuadrícula Guía (10m)",
    "category": "vinyl",
    "materialType": "Herramientas & Transfer",
    "color": "Translúcido Cristal",
    "finish": "Estándar",
    "unit": "rollo (30 cm x 10 m)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 160,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Adherencia media que no deja goma y permite alinear con precisión las letras recortadas."
  },
  {
    "id": "mat-herramientas-weeder",
    "name": "Ganchos Depiladores / Weeder de Precisión Ergonómico (Set 2 pzas)",
    "category": "vinyl",
    "materialType": "Herramientas & Transfer",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "set (2 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 75,
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech México & Textil",
    "notes": "Punta curva de acero templado para retirar interiores de letras minúsculas rápidamente."
  },
  {
    "id": "mat-argollas-llavero",
    "name": "Argollas Metálicas Niqueladas con Cadena y Eslabón (100 pzas)",
    "category": "assembly",
    "materialType": "Argollas & Cadenas",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "paquete (100 pzas)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 120,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Argolla plana reforzada de 25mm con cadena de 4 eslabones y armella soldada."
  },
  {
    "id": "mat-argollas-bronce",
    "name": "Argollas Metálicas Acabado Bronce Antiguo Vintage (100 pzas)",
    "category": "assembly",
    "materialType": "Argollas & Cadenas",
    "color": "Seda Bronce",
    "finish": "Satinado",
    "unit": "paquete (100 pzas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 135,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Tono rústico envejecido para llaveros de madera grabada y cuero artesanal."
  },
  {
    "id": "mat-broches-perico-mosqueton",
    "name": "Broches Perico / Mosquetones Giratorios Metálicos (50 pzas)",
    "category": "assembly",
    "materialType": "Herrajes & Mosquetones",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "paquete (50 pzas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 115,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Cierre de resorte para enganchar llaveros a mochilas, bolsas y cinturones."
  },
  {
    "id": "mat-borlas-gamuza",
    "name": "Borlas Colgantes de Gamuza Tonos Artesanales Cálidos (50 pzas)",
    "category": "assembly",
    "materialType": "Herrajes & Mosquetones",
    "color": "Terracota",
    "finish": "Natural / Textil",
    "unit": "paquete (50 pzas)",
    "currentStock": 2,
    "minStockAlert": 2,
    "costPerUnit": 110,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Flecos de microgamuza suave con capuchón plateado para llaveros y adornos."
  },
  {
    "id": "mat-percheros-madera",
    "name": "Percheros Cilíndricos Torneados de Madera Pino con Perno",
    "category": "assembly",
    "materialType": "Percheros de Madera",
    "color": "Madera Natural",
    "finish": "Natural / Madera",
    "unit": "pieza",
    "currentStock": 28,
    "minStockAlert": 15,
    "costPerUnit": 12,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Diámetro 25mm x 50mm largo con tornillo de doble rosca para montaje en pared o placa."
  },
  {
    "id": "mat-percheros-nogal",
    "name": "Percheros Torneados de Madera Nogal Oscuro con Inserto Metálico",
    "category": "assembly",
    "materialType": "Percheros de Madera",
    "color": "Madera Woodfill",
    "finish": "Satinado",
    "unit": "pieza",
    "currentStock": 18,
    "minStockAlert": 10,
    "costPerUnit": 18,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Madera noble de nogal con veta oscura profunda para colgadores edición de lujo."
  },
  {
    "id": "mat-chips-nfc",
    "name": "Chips NFC Adhesivos NTAG213 Resistentes (50 pzas)",
    "category": "assembly",
    "materialType": "Chips NFC",
    "color": "Blanco Marfil",
    "finish": "Estándar",
    "unit": "paquete (50 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 250,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Chips regrabables 144 bytes compatibles con iPhone y Android para enlace a WhatsApp y menú."
  },
  {
    "id": "mat-monedas-nfc-antimetal",
    "name": "Monedas NFC Epóxicas NTAG215 Anti-Metal para Mostrador (20 pzas)",
    "category": "assembly",
    "materialType": "Chips NFC",
    "color": "Negro Carbón",
    "finish": "Brillante / Glossy",
    "unit": "paquete (20 pzas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 220,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Blindadas con capa de ferrita que permite funcionar sobre bases metálicas sin interferencias."
  },
  {
    "id": "mat-imanes-neodimio-n52",
    "name": "Imanes de Neodimio N52 Extra Fuertes 10x2 mm (50 pzas)",
    "category": "assembly",
    "materialType": "Imanes de Neodimio",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "paquete (50 pzas)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 130,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Fuerza de atracción de 1.8 kg. Para tapas de cajas artesanales y cierres invisibles."
  },
  {
    "id": "mat-cadena-bolitas-10cm",
    "name": "Cadena de Bolitas Metálica 10 cm con Cierre para Placas (100 pzas)",
    "category": "assembly",
    "materialType": "Argollas & Cadenas",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "paquete (100 pzas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 80,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Largo 10 cm, diámetro 2.4 mm. Para chapitas de mascotas y placas de maleta."
  },
  {
    "id": "mat-remaches-ojillos",
    "name": "Remaches y Ojillos Metálicos Niquelados para Cuero (100 pzas)",
    "category": "assembly",
    "materialType": "Herrajes & Mosquetones",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "paquete (100 pzas)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 65,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Doble cabeza para unión permanente de cintas de piel y parches textiles."
  },
  {
    "id": "mat-tornillos-chicago",
    "name": "Tornillos Decorativos Tipo Chicago de Latón Dorado (50 pzas)",
    "category": "assembly",
    "materialType": "Herrajes & Mosquetones",
    "color": "Seda Oro",
    "finish": "Satinado",
    "unit": "paquete (50 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 95,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Poste roscado desarmable de 8mm para álbumes de boda y carpetas de piel."
  },
  {
    "id": "mat-cinta-3m-vhb",
    "name": "Cinta Doble Cara Extra Fuerte 3M VHB de Espuma para Letreros (5m)",
    "category": "assembly",
    "materialType": "Fijación & Pegamento",
    "color": "Gris Concreto",
    "finish": "Estándar",
    "unit": "rollo (19mm x 5m)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 145,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Poder de fijación industrial. Permite colocar letreros de pared sin perforar con taladro."
  },
  {
    "id": "mat-cajas-kraft-chica",
    "name": "Cajas de Cartón Kraft Automontables Chicas 12x12x6 cm",
    "category": "packaging",
    "materialType": "Cajas Kraft",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "pieza",
    "currentStock": 65,
    "minStockAlert": 30,
    "costPerUnit": 12,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Tamaño justo para llaveros personalizados, chapitas de mascotas y figuras 3D pequeñas."
  },
  {
    "id": "mat-cajas-kraft-mediana",
    "name": "Cajas de Cartón Kraft Automontables Medianas 20x15x8 cm",
    "category": "packaging",
    "materialType": "Cajas Kraft",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "pieza",
    "currentStock": 45,
    "minStockAlert": 25,
    "costPerUnit": 16,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Microcorrugado flauta E resistente. Se envían plegadas planas para ahorrar espacio."
  },
  {
    "id": "mat-cajas-kraft-grande",
    "name": "Cajas de Cartón Kraft Automontables Grandes 32x22x10 cm",
    "category": "packaging",
    "materialType": "Cajas Kraft",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "pieza",
    "currentStock": 25,
    "minStockAlert": 15,
    "costPerUnit": 26,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Capacidad para letreros de bienvenida, lámparas curvas y paquetes combo del taller."
  },
  {
    "id": "mat-cajas-taza-individual",
    "name": "Cajas de Cartón Blanco para Taza Individual con Ventana de Acetato",
    "category": "packaging",
    "materialType": "Cajas para Taza",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "pieza",
    "currentStock": 40,
    "minStockAlert": 20,
    "costPerUnit": 14,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Permite apreciar el diseño sublimado de la taza sin necesidad de abrir la caja."
  },
  {
    "id": "mat-papel-tissue-impreso",
    "name": "Papel Tissue / China Ecológico Estampado Artesanal (100 pliegos)",
    "category": "packaging",
    "materialType": "Papel Tissue / China",
    "color": "Verde Olivo",
    "finish": "Seda / Satinado",
    "unit": "paquete (100 pliegos)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 95,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Papel de 22g suave para envolver cada producto antes de colocarlo dentro de la caja kraft."
  },
  {
    "id": "mat-viruta-kraft",
    "name": "Viruta de Papel Kraft / Relleno Protector Ecológico (Bolsa 1 kg)",
    "category": "packaging",
    "materialType": "Viruta & Relleno",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "bolsa (1 kg)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 85,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Tiras en zigzag biodegradables que protegen las piezas de cerámica contra caídas."
  },
  {
    "id": "mat-cinta-engomada",
    "name": "Cinta Adhesiva Kraft Engomada Reforzada con Hilos (50m)",
    "category": "packaging",
    "materialType": "Cintas de Empaque",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "rollo (70mm x 50m)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 115,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Pegamento activado con agua con trama de fibra de vidrio inviolable para paquetería."
  },
  {
    "id": "mat-cinta-canela-silenciosa",
    "name": "Cinta de Empaque Transparente Silenciosa 48mm x 50m (6 rollos)",
    "category": "packaging",
    "materialType": "Cintas de Empaque",
    "color": "Translúcido Cristal",
    "finish": "Brillante / Glossy",
    "unit": "paquete (6 rollos)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 160,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Adhesivo acrílico de alto agarre sobre cajas de cartón corrugado."
  },
  {
    "id": "mat-bolsas-celofan-llavero",
    "name": "Bolsas Celofán con Tira Autoadhesiva 8x15 cm para Llaveros (100 pzas)",
    "category": "packaging",
    "materialType": "Bolsas Celofán & Kraft",
    "color": "Translúcido Cristal",
    "finish": "Brillante / Glossy",
    "unit": "paquete (100 pzas)",
    "currentStock": 5,
    "minStockAlert": 2,
    "costPerUnit": 45,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Presentación limpia libre de polvo para entregas en masa de eventos y bodas."
  },
  {
    "id": "mat-bolsas-kraft-asa",
    "name": "Bolsas Kraft con Asas Torneadas para Entrega de Mostrador (25 pzas)",
    "category": "packaging",
    "materialType": "Bolsas Celofán & Kraft",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "paquete (25 pzas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 125,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Resistencia de hasta 4 kg. Ideales para entrega directa a clientes en el taller."
  },
  {
    "id": "mat-stickers-garantia-kraft",
    "name": "Stickers Kraft Circulares de Garantía & Sello de Taller (100 pzas)",
    "category": "packaging",
    "materialType": "Stickers & Sellos",
    "color": "Verde Olivo",
    "finish": "Mate",
    "unit": "paquete (100 pzas)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 75,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Sello circular de 4 cm que cierra la caja con el grabado de Artesano Digital."
  },
  {
    "id": "mat-plastico-burbuja-rollo",
    "name": "Plástico Burbuja de Alta Resistencia para Envíos Nacionales (20m)",
    "category": "packaging",
    "materialType": "Protección Envíos",
    "color": "Translúcido Cristal",
    "finish": "Translúcido",
    "unit": "rollo (50 cm x 20 m)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 160,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Burbuja de 3/16 sellada hermética. Obligatoria para envíos foráneos de cerámica."
  },
  {
    "id": "mat-esquineros-carton",
    "name": "Esquineros de Cartón Rígido para Cuadros y Letreros (50 pzas)",
    "category": "packaging",
    "materialType": "Protección Envíos",
    "color": "Madera Natural",
    "finish": "Natural / Cartón",
    "unit": "paquete (50 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 65,
    "supplierId": "sup-empaques-nacional",
    "supplier": "Empaques & Cajas Cartón México",
    "notes": "Protege las cuatro esquinas de letreros acrílicos y marcos de madera contra impactos."
  },
  {
    "id": "mat-ref-boquilla-04",
    "name": "Boquillas Hardened Steel 0.4mm (Repuesto Hotend Bambu/V6)",
    "category": "spare_parts",
    "materialType": "Boquillas",
    "color": "Negro Carbón",
    "finish": "Metálico",
    "unit": "pieza",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 145,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Acero templado a 55 HRC. Indispensable para filamentos abrasivos como Woodfill y Glow."
  },
  {
    "id": "mat-ref-boquilla-04-brass",
    "name": "Boquillas Latón Brass Estándar 0.4mm Alta Conductividad Térmica",
    "category": "spare_parts",
    "materialType": "Boquillas",
    "color": "Seda Oro",
    "finish": "Metálico",
    "unit": "pieza",
    "currentStock": 6,
    "minStockAlert": 3,
    "costPerUnit": 65,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Máxima transferencia de calor para filamento PLA estándar a altas velocidades."
  },
  {
    "id": "mat-ref-boquilla-06",
    "name": "Boquillas Latón Brass 0.6mm Alta Velocidad para Piezas Voluminosas",
    "category": "spare_parts",
    "materialType": "Boquillas",
    "color": "Seda Oro",
    "finish": "Metálico",
    "unit": "pieza",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 85,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Reduce el tiempo de impresión en 40% en macetas grandes y letras tridimensionales."
  },
  {
    "id": "mat-ref-boquilla-08",
    "name": "Boquillas Latón Brass 0.8mm para Prototipos de Flujo Rápido",
    "category": "spare_parts",
    "materialType": "Boquillas",
    "color": "Seda Oro",
    "finish": "Metálico",
    "unit": "pieza",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 95,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Imprime capas gruesas de 0.4mm con gran resistencia estructural mecánica."
  },
  {
    "id": "mat-ref-bloque-calefactor",
    "name": "Bloque Calefactor de Cobre Niquelado Alta Temperatura (300°C)",
    "category": "spare_parts",
    "materialType": "Hotends & Calefactores",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "pieza",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 160,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Tratamiento niquelado que reduce la adherencia de plástico fundido quemado."
  },
  {
    "id": "mat-ref-ptfe",
    "name": "Tubo PTFE Capricorn Bowden 1.75mm de Baja Fricción (1 metro)",
    "category": "spare_parts",
    "materialType": "PTFE & Tubos",
    "color": "Azul Zafiro",
    "finish": "Estándar",
    "unit": "metro",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 120,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Diámetro interno calibrado a 1.9mm (+- 0.05mm). Evita atascos con filamento TPU flexible."
  },
  {
    "id": "mat-ref-termistor",
    "name": "Termistores NTC 100K con Cable Siliconado Blindado 24V",
    "category": "spare_parts",
    "materialType": "Hotends & Calefactores",
    "color": "Blanco Marfil",
    "finish": "Estándar",
    "unit": "pieza",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 65,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Sensor de temperatura de cartucho metálico compatible con Bambu, Creality y Prusa."
  },
  {
    "id": "mat-ref-cartucho",
    "name": "Cartucho Calefactor Cerámico 24V 50W de Calentamiento Rápido",
    "category": "spare_parts",
    "materialType": "Hotends & Calefactores",
    "color": "Rojo Carmesí",
    "finish": "Estándar",
    "unit": "pieza",
    "currentStock": 2,
    "minStockAlert": 2,
    "costPerUnit": 95,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Llega de temperatura ambiente a 200°C en menos de 45 segundos."
  },
  {
    "id": "mat-ref-lamina-pei",
    "name": "Lámina PEI Magnética Texturizada Doble Cara (256x256mm)",
    "category": "spare_parts",
    "materialType": "Láminas PEI",
    "color": "Seda Oro",
    "finish": "Texturizado / Mármol",
    "unit": "pieza",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 480,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Acabado rugoso mate en la base de las piezas. Al enfriarse la pieza se despega sola."
  },
  {
    "id": "mat-ref-calcetin",
    "name": "Calcetines de Silicona Térmica para Bloque Calefactor (Set 3 pzas)",
    "category": "spare_parts",
    "materialType": "Hotends & Calefactores",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "paquete (3 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 110,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Mantiene la temperatura estable frente al flujo de aire del ventilador de capa."
  },
  {
    "id": "mat-ref-ventilador",
    "name": "Ventilador de Capa Turbina 5015 24V con Rodamiento Dual Ball",
    "category": "spare_parts",
    "materialType": "Ventiladores",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "pieza",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 130,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Enfriamiento violento e instantáneo para puentes limpios y voladizos sin soportes."
  },
  {
    "id": "mat-ref-ventilador-4010",
    "name": "Ventilador Silencioso 4010 24V para Disipador de Hotend",
    "category": "spare_parts",
    "materialType": "Ventiladores",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "pieza",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 95,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Previene el heat creep (atasco por calor subiendo por el disipador)."
  },
  {
    "id": "mat-ref-correa-gt2",
    "name": "Correa Dentada GT2 de 6mm Reforzada con Fibra de Vidrio (5m)",
    "category": "spare_parts",
    "materialType": "Correas & Poleas",
    "color": "Negro Carbón",
    "finish": "Mate",
    "unit": "rollo (5 metros)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 75,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Paso de 2mm. No se estira bajo tensión constante en ejes X e Y de impresoras y láser."
  },
  {
    "id": "mat-ref-cuchillas-plotter",
    "name": "Cuchillas de Repuesto 45° de Carburo para Plotter Vinil (5 pzas)",
    "category": "spare_parts",
    "materialType": "Cuchillas de Plotter",
    "color": "Plata Metálico",
    "finish": "Metálico",
    "unit": "caja (5 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 160,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Filo estándar universal para vinil adhesivo Oracal y vinil textil HTV básico."
  },
  {
    "id": "mat-ref-cuchillas-plotter-60",
    "name": "Cuchillas de Repuesto 60° Ángulo Profundo para Vinil PUFF y Flocado",
    "category": "spare_parts",
    "materialType": "Cuchillas de Plotter",
    "color": "Azul Zafiro",
    "finish": "Metálico",
    "unit": "caja (5 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 175,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Corta materiales gruesos de vinil puff, reflejante y piel sin morder las esquinas."
  },
  {
    "id": "mat-ref-teflon-prensa",
    "name": "Láminas de Teflón Protector para Prensa Térmica 40x50 cm (2 pzas)",
    "category": "spare_parts",
    "materialType": "Consumibles Prensa",
    "color": "Café Caramelo",
    "finish": "Satinado",
    "unit": "paquete (2 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 180,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Repuesto térmico para evitar que el calor directo queme las prendas o tazas."
  },
  {
    "id": "mat-ref-pad-silicon-tazas",
    "name": "Pad de Silicón Térmico de Repuesto para Prensa de Tazas 11oz",
    "category": "spare_parts",
    "materialType": "Consumibles Prensa",
    "color": "Rojo Carmesí",
    "finish": "Mate",
    "unit": "pieza",
    "currentStock": 1,
    "minStockAlert": 1,
    "costPerUnit": 240,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Resistencia eléctrica recubierta de silicón de alta densidad para presión uniforme."
  },
  {
    "id": "mat-ref-alcohol-isopropilico",
    "name": "Alcohol Isopropílico 99.9% Puro para Limpieza de Camas PEI (1 Litro)",
    "category": "spare_parts",
    "materialType": "Herramientas de Mantenimiento",
    "color": "Translúcido Cristal",
    "finish": "Translúcido",
    "unit": "botella (1 Litro)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 110,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Desengrasa al 100% las camas magnéticas y los espejos de la máquina láser."
  }
,
  {
    "id": "mat-ens-argolla-estrella",
    "name": "Argollas para Llavero Forma Estrella Níquel (50 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Plata Níquel",
    "finish": "Brillante",
    "unit": "bolsa (50 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 125,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Argolla con silueta de estrella de 30mm con cadenita y eslabón para llaveros temáticos."
  },
  {
    "id": "mat-ens-argolla-corazon",
    "name": "Argollas para Llavero Forma Corazón Oro Rosado (50 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Oro Rosado",
    "finish": "Satinado",
    "unit": "bolsa (50 pzas)",
    "currentStock": 4,
    "minStockAlert": 1,
    "costPerUnit": 140,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Ideal para detalles de bodas, aniversarios y recuerdos de San Valentín."
  },
  {
    "id": "mat-ens-cadena-bolitas-negra",
    "name": "Cadena de Bolitas Metálica Negra Mate 15 cm con Conector (100 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Negro",
    "finish": "Mate",
    "unit": "paquete (100 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 160,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Para placas de identificación militar, llaveros y etiquetas acrílicas."
  },
  {
    "id": "mat-ens-cadena-bolitas-bronce",
    "name": "Cadena de Bolitas Metálica Bronce Antiguo Vintage 15 cm (100 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Bronce",
    "finish": "Vintage",
    "unit": "paquete (100 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 175,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Estilo retro para piezas de madera grabadas en láser."
  },
  {
    "id": "mat-ens-mosqueton-mini",
    "name": "Mini Mosquetón Giratorio Plata Níquel 12x32 mm (100 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Plata Níquel",
    "finish": "Brillante",
    "unit": "bolsa (100 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 180,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Gatillo suave y argolla giratoria 360 grados para charms y llaveros compactos."
  },
  {
    "id": "mat-ens-mosqueton-dorado",
    "name": "Mosquetón Giratorio Dorado Elegante con Argolla Plana 14x35 mm (50 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Dorado",
    "finish": "Espejo",
    "unit": "bolsa (50 pzas)",
    "currentStock": 1,
    "minStockAlert": 2,
    "costPerUnit": 135,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Baño electrostático de alta durabilidad para souvenirs premium."
  },
  {
    "id": "mat-ens-broche-magnetico-14",
    "name": "Broche Magnético Ultra Plano para Estuches y Cajas 14 mm Níquel (50 pares)",
    "category": "assembly",
    "materialType": "Broches & Imanes",
    "color": "Plata Níquel",
    "finish": "Metálico",
    "unit": "caja (50 pares)",
    "currentStock": 1,
    "minStockAlert": 1,
    "costPerUnit": 190,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Cierre magnético ocultable en madera cortada en láser y piezas 3D."
  },
  {
    "id": "mat-ens-broche-iman-18",
    "name": "Broche de Imán Extra Fuerte con Pestañas de Remache 18 mm Oro Viejo (50 pares)",
    "category": "assembly",
    "materialType": "Broches & Imanes",
    "color": "Bronce",
    "finish": "Vintage",
    "unit": "caja (50 pares)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 220,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Para monederos, cubiertas de libretas y estuches de cuero."
  },
  {
    "id": "mat-ens-tornillo-chicago-negro",
    "name": "Tornillos Encuadernadores Chicago Negro Mate M5 x 6 mm (100 pzas)",
    "category": "assembly",
    "materialType": "Tornillería & Fijaciones",
    "color": "Negro",
    "finish": "Mate",
    "unit": "caja (100 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 170,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Para muestrarios, llaveros multicapa y menús de restaurante."
  },
  {
    "id": "mat-ens-tornillo-chicago-laton",
    "name": "Tornillos Chicago de Latón Pulido Dorado M5 x 10 mm (100 pzas)",
    "category": "assembly",
    "materialType": "Tornillería & Fijaciones",
    "color": "Dorado",
    "finish": "Pulido",
    "unit": "caja (100 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 195,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Para carpetas ejecutivas de madera, cuero y acrílico."
  },
  {
    "id": "mat-ens-remache-doble-vista",
    "name": "Remaches Tubulares Doble Vista Níquel 8x8 mm (200 pzas)",
    "category": "assembly",
    "materialType": "Tornillería & Fijaciones",
    "color": "Plata Níquel",
    "finish": "Metálico",
    "unit": "bolsa (200 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 145,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Acabado limpio por ambos lados para llaveros de vinil y cuero sintético."
  },
  {
    "id": "mat-ens-base-pin-mariposa",
    "name": "Bases Metálicas para Pin de Solapa con Broche Mariposa 10 mm Níquel (100 pzas)",
    "category": "assembly",
    "materialType": "Pines & Gafetes",
    "color": "Plata Níquel",
    "finish": "Brillante",
    "unit": "bolsa (100 pzas)",
    "currentStock": 4,
    "minStockAlert": 1,
    "costPerUnit": 130,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Para pines coleccionables impresos en 3D o cortados en madera/acrílico."
  },
  {
    "id": "mat-ens-base-pin-goma",
    "name": "Broches de Goma Siliconada Negra para Pines de Solapa (100 pzas)",
    "category": "assembly",
    "materialType": "Pines & Gafetes",
    "color": "Negro",
    "finish": "Mate",
    "unit": "bolsa (100 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 85,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Mayor agarre y no lastima la ropa ni la piel."
  },
  {
    "id": "mat-ens-gancho-caiman-gafete",
    "name": "Clips Caimán Giratorios con Correa de PVC Transparente para Gafetes (100 pzas)",
    "category": "assembly",
    "materialType": "Pines & Gafetes",
    "color": "Translúcido Cristal",
    "finish": "Translúcido",
    "unit": "paquete (100 pzas)",
    "currentStock": 1,
    "minStockAlert": 2,
    "costPerUnit": 165,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Para credenciales y gafetes corporativos para empresas y eventos."
  },
  {
    "id": "mat-ens-iman-neodimio-disco-10",
    "name": "Imanes de Neodimio Disco Delgado N35 10x2 mm (100 pzas)",
    "category": "assembly",
    "materialType": "Broches & Imanes",
    "color": "Plata Níquel",
    "finish": "Brillante",
    "unit": "caja (100 pzas)",
    "currentStock": 0,
    "minStockAlert": 2,
    "costPerUnit": 210,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Agotado en taller: Se usa para figuras 3D articuladas y souvenirs magnéticos."
  },
  {
    "id": "mat-ens-iman-neodimio-disco-15",
    "name": "Imanes de Neodimio N52 con Avellanado para Tornillo M3 15x3 mm (20 pzas)",
    "category": "assembly",
    "materialType": "Broches & Imanes",
    "color": "Plata Níquel",
    "finish": "Metálico",
    "unit": "caja (20 pzas)",
    "currentStock": 1,
    "minStockAlert": 2,
    "costPerUnit": 180,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Fijación extrema atornillable para tableros de herramientas y letreros desmontables."
  },
  {
    "id": "mat-ens-inserto-roscado-m3",
    "name": "Insertos Roscados de Latón Moleteado para Termofijado M3 x 4 mm (100 pzas)",
    "category": "assembly",
    "materialType": "Tornillería & Fijaciones",
    "color": "Dorado",
    "finish": "Moleteado",
    "unit": "caja (100 pzas)",
    "currentStock": 1,
    "minStockAlert": 2,
    "costPerUnit": 155,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Se insertan con calor en piezas 3D para lograr uniones atornilladas indestructibles."
  },
  {
    "id": "mat-ens-tornillo-m3-hex",
    "name": "Tornillos Allen Cilíndricos M3 x 12 mm Acero Grado 10.9 Negro (100 pzas)",
    "category": "assembly",
    "materialType": "Tornillería & Fijaciones",
    "color": "Negro",
    "finish": "Pavonado",
    "unit": "caja (100 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 95,
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Especiales para ensambles estructurales de 3D y sujeción de placas."
  },
  {
    "id": "mat-ens-pegamento-cianocrilato-activador",
    "name": "Adhesivo Cianoacrilato Rápido 50g con Spray Activador Acelerador 200ml",
    "category": "assembly",
    "materialType": "Pegamentos & Adhesivos",
    "color": "Translúcido Cristal",
    "finish": "Incoloro",
    "unit": "kit (2 piezas)",
    "currentStock": 1,
    "minStockAlert": 2,
    "costPerUnit": 230,
    "supplierId": "sup-herrajes-mx",
    "supplier": "Herrajes & Insumos Creativos MX",
    "notes": "Pega madera MDF, PLA y acrílico en menos de 5 segundos con el activador."
  },
  {
    "id": "mat-ens-silicon-frio",
    "name": "Silicón Líquido Frío Adhesivo Especial para Manualidades y Fieltro (250 ml)",
    "category": "assembly",
    "materialType": "Pegamentos & Adhesivos",
    "color": "Translúcido Cristal",
    "finish": "Flexible",
    "unit": "botella (250 ml)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 68,
    "supplierId": "sup-papeleria-lumen",
    "supplier": "Lumen Papelería & Materiales de Arte",
    "notes": "Para detalles textiles, cartulina y uniones elásticas sin quemar materiales."
  },
  {
    "id": "mat-ens-tachas-hotfix-doradas",
    "name": "Tachas Metálicas Termoadhesivas Pirámide Hot-Fix Doradas 6 mm (500 pzas)",
    "category": "assembly",
    "materialType": "Herrajes Metálicos",
    "color": "Dorado",
    "finish": "Brillante",
    "unit": "paquete (500 pzas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 140,
    "supplierId": "sup-textiles-mex",
    "supplier": "Textiles e Insumos del Centro",
    "notes": "Se activan con la mini prensa térmica en playeras, gorras y mezclilla."
  },
  {
    "id": "mat-pegamento-resistol-850",
    "name": "Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)",
    "category": "assembly",
    "materialType": "Pegamentos & Adhesivos",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "bote (500 ml)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 85,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Adhesivo PVA base agua para uniones de madera, triplay y MDF. Secado transparente de alta resistencia (en ml o gotas)."
  },
  {
    "id": "mat-pegamento-cianocrilato-gotas",
    "name": "Pegamento Instantáneo Cianocrilato Grado Taller con Activador (50g)",
    "category": "assembly",
    "materialType": "Pegamentos & Adhesivos",
    "color": "Translúcido Cristal",
    "finish": "Brillante / Glossy",
    "unit": "frasco (50g)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 110,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Fraguado en 3 segundos con acelerador. Para pegar acrílico con madera, PLA y uniones de precisión (gotas)."
  },
  {
    "id": "mat-silicon-caliente-barras",
    "name": "Barras de Silicón Caliente Gruesas 11mm Alta Resistencia (1 kg)",
    "category": "assembly",
    "materialType": "Pegamentos & Adhesivos",
    "color": "Translúcido Cristal",
    "finish": "Estándar",
    "unit": "paquete (1 kg)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 120,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Para fijación de cables internos en lámparas 3D y forrado de empaques."
  },
  {
    "id": "mat-lija-madera-fina-220",
    "name": "Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)",
    "category": "consumables",
    "materialType": "Lijas & Consumibles de Taller",
    "color": "Gris / Óxido de Aluminio",
    "finish": "Fino",
    "unit": "pliego",
    "currentStock": 25,
    "minStockAlert": 5,
    "costPerUnit": 14,
    "packageQuantity": 1,
    "packageMeasurement": "pliego",
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Pliego de lija de grano fino 220 para desbarbado suave y acabado sedoso antes del barnizado (rinde ~10 piezas de madera)."
  },
  {
    "id": "mat-lija-madera-media-150",
    "name": "Lija de Madera Grano Medio 150 para Nivelación y Desbaste (Pliego)",
    "category": "consumables",
    "materialType": "Lijas & Consumibles de Taller",
    "color": "Rojo Óxido",
    "finish": "Medio",
    "unit": "pliego",
    "currentStock": 20,
    "minStockAlert": 5,
    "costPerUnit": 12,
    "packageQuantity": 1,
    "packageMeasurement": "pliego",
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Para eliminar bordes ásperos y rebabas de corte con sierra o láser."
  },
  {
    "id": "mat-desgaste-corte-sierra-laser",
    "name": "Consumible Indirecto de Corte (Desgaste Hoja Sierra / Tubo Láser CO2)",
    "category": "consumables",
    "materialType": "Desgaste de Herramientas",
    "color": "Metálico",
    "finish": "Industrial",
    "unit": "corte",
    "currentStock": 500,
    "minStockAlert": 50,
    "costPerUnit": 1.5,
    "packageQuantity": 1,
    "packageMeasurement": "corte",
    "supplierId": "sup-refacciones-cnc",
    "supplier": "Refacciones CNC 3D & Láser México",
    "notes": "Amortización de filo de sierra circular y vida útil de tubo láser CO2 por ciclo de corte."
  },
  {
    "id": "mat-estopa-limpieza-taller",
    "name": "Estopa de Algodón Fino y Paños para Barnizado y Limpieza (1 kg)",
    "category": "consumables",
    "materialType": "Limpieza & Aplicación",
    "color": "Blanco / Crudo",
    "finish": "Suave",
    "unit": "paquete",
    "currentStock": 10,
    "minStockAlert": 2,
    "costPerUnit": 45,
    "packageQuantity": 50,
    "packageMeasurement": "paño",
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Paños suaves de algodón para aplicar tinte, retirar exceso de barniz y limpiar piezas terminadas."
  },
  {
    "id": "mat-cinta-enmascarar-laser",
    "name": "Cinta de Enmascarar Crepé Grado Láser 50mm x 50m (Protección Anti-Ahumado)",
    "category": "consumables",
    "materialType": "Protección & Acabado",
    "color": "Beige Crepé",
    "finish": "Semi-mate",
    "unit": "rollo (50m)",
    "currentStock": 12,
    "minStockAlert": 3,
    "costPerUnit": 48,
    "packageQuantity": 50,
    "packageMeasurement": "m",
    "supplierId": "sup-viniltech",
    "supplier": "VinilTech Mayorista de Rotulación",
    "notes": "Cinta de baja adherencia que protege la madera de quemaduras y humo de láser durante el corte."
  },
  {
    "id": "mat-dtf-film-pet",
    "name": "Film PET Transfer DTF Rollo Continuo 30cm x 100m",
    "category": "vinyl",
    "materialType": "DTF Textil",
    "color": "Translúcido Cristal",
    "finish": "Mate",
    "unit": "rollo (30cm x 100m)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 1650,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Película PET tratada de desprendimiento en frío/caliente para impresión DTF textil."
  },
  {
    "id": "mat-dtf-tinta-cmykw",
    "name": "Tintas Textiles DTF Base Agua CMYK + Blanco (Set 5 botellas)",
    "category": "vinyl",
    "materialType": "DTF Textil",
    "color": "Multicolor / CMYK",
    "finish": "Estándar",
    "unit": "set (5 botellas)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 1250,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Pigmentos especiales de alta elasticidad para impresión sobre film DTF y curado en horno."
  },
  {
    "id": "mat-dtf-poliamida-polvo",
    "name": "Polvo Poliamida Termofusible Hot-Melt DTF Extra Fino (Bolsa 1 kg)",
    "category": "vinyl",
    "materialType": "DTF Textil",
    "color": "Blanco Marfil",
    "finish": "Mate",
    "unit": "bolsa (1 kg)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 450,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Polvo adhesivo de poliuretano termofusible que se adhiere a la tinta húmeda del transfer."
  },
  {
    "id": "mat-papel-couche-300g",
    "name": "Papel Couché Brillante 300g Calidad Imprenta A4 (100 hojas)",
    "category": "sublimation",
    "materialType": "Papelería & Impresión Láser",
    "color": "Blanco Marfil",
    "finish": "Brillante / Glossy",
    "unit": "paquete (100 hojas)",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 160,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Gramaje grueso para invitaciones de boda, postales y portadas de catálogos."
  },
  {
    "id": "mat-papel-sulfatada-12pts",
    "name": "Cartulina Sulfatada 1 Cara 12 Puntos A4 (100 hojas)",
    "category": "sublimation",
    "materialType": "Papelería & Impresión Láser",
    "color": "Blanco Marfil",
    "finish": "Satinado",
    "unit": "paquete (100 hojas)",
    "currentStock": 3,
    "minStockAlert": 2,
    "costPerUnit": 175,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Cuerpo rígido con reverso blanco mate para cajas automontables y tarjetas de agradecimiento."
  },
  {
    "id": "mat-toner-click-laser",
    "name": "Tóner Láser Digital Color Alta Definición (Paquete 500 impresiones)",
    "category": "sublimation",
    "materialType": "Papelería & Impresión Láser",
    "color": "Multicolor / CMYK",
    "finish": "Brillante / Glossy",
    "unit": "paquete (500 pzas)",
    "currentStock": 3,
    "minStockAlert": 1,
    "costPerUnit": 450,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Costo por click de tóner láser color microfino para invitaciones y papelería corporativa."
  },
  {
    "id": "mat-foil-reactivo-oro",
    "name": "Foil Reactivo al Tóner Láser Oro Metalizado (Rollo 30cm x 15m)",
    "category": "sublimation",
    "materialType": "Papelería & Impresión Láser",
    "color": "Seda Oro",
    "finish": "Espejo Reflectivo",
    "unit": "rollo (30cm x 15m)",
    "currentStock": 2,
    "minStockAlert": 1,
    "costPerUnit": 220,
    "supplierId": "sup-sublimax",
    "supplier": "Sublimax Mayorista Cerámica & Textil",
    "notes": "Se aplica con calor sobre tóner láser negro para crear letras doradas metalizadas en invitaciones."
  },
  {
    "id": "mat-clavos-acero",
    "name": "Clavos de Acero Galvanizado 1\" para Madera (100 pzas)",
    "category": "assembly",
    "materialType": "Fijación & Pegamento",
    "color": "Acero Galvanizado",
    "finish": "Natural",
    "unit": "paquete (100 pzas)",
    "packageQuantity": 100,
    "packageMeasurement": "pza",
    "currentStock": 8,
    "minStockAlert": 2,
    "costPerUnit": 35,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Clavos pequeños para fijar bases, respaldos y ensambles de madera. Se cobran por pieza en la receta."
  },
  {
    "id": "mat-tornillos-madera",
    "name": "Tornillos para Madera 8x1\" Cabeza Plana (100 pzas)",
    "category": "assembly",
    "materialType": "Fijación & Pegamento",
    "color": "Acero Negro",
    "finish": "Fosfatado",
    "unit": "paquete (100 pzas)",
    "packageQuantity": 100,
    "packageMeasurement": "pza",
    "currentStock": 6,
    "minStockAlert": 2,
    "costPerUnit": 55,
    "supplierId": "sup-empaques-slp",
    "supplier": "Herrajes & Ensamble San Luis",
    "notes": "Tornillo para madera con punta y rosca gruesa. Para soportes, placas y ensambles que requieren desmontaje."
  },
  {
    "id": "mat-bolsas-kraft-ventana",
    "name": "Bolsas Kraft con Ventana y Etiqueta para Producto (100 pzas)",
    "category": "packaging",
    "materialType": "Empaque & Presentación",
    "color": "Kraft Natural",
    "finish": "Ventana Transparente",
    "unit": "paquete (100 pzas)",
    "packageQuantity": 100,
    "packageMeasurement": "pza",
    "currentStock": 4,
    "minStockAlert": 2,
    "costPerUnit": 350,
    "supplierId": "sup-empaques-slp",
    "supplier": "Empaques y Embalajes SLP",
    "notes": "Bolsa kraft con ventana para llaveros, clickers y piezas pequeñas. Incluye etiqueta térmica con SKU."
  }
];

class Database {
  constructor() {
    if (!cloudDb.enabled) this.init();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      const data = createInitialDb();
      this.save(data);
      console.log('Database initialized with seed data at', DB_PATH);
    }
  }

  read() {
    if (cloudDb.enabled) return cloudDb.read();
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      const data = JSON.parse(content);
      if (!data.publications) data.publications = [];
      if (!data.orders) data.orders = [];
      if (!data.pubTracking) data.pubTracking = [];
      if (!data.suppliers || data.suppliers.length === 0) {
        data.suppliers = [...initialSuppliers];
        this.save(data);
      } else {
        let addedNewSup = false;
        initialSuppliers.forEach(seedSup => {
          if (!data.suppliers.some(s => s.id === seedSup.id)) {
            data.suppliers.push({ ...seedSup });
            addedNewSup = true;
          }
        });
        if (addedNewSup) {
          this.save(data);
        }
      }
      if (!data.productionLogs) data.productionLogs = [];
      if (!data.coupons || data.coupons.length === 0) {
        data.coupons = [...initialCoupons];
        this.save(data);
      }
      if (!data.rawMaterials || data.rawMaterials.length === 0) {
        data.rawMaterials = [...initialRawMaterials];
        this.save(data);
      } else {
        let addedNewMat = false;
        initialRawMaterials.forEach(seedMat => {
          if (!data.rawMaterials.some(m => m.id === seedMat.id)) {
            data.rawMaterials.push({ ...seedMat });
            addedNewMat = true;
          }
        });
        if (addedNewMat) {
          this.save(data);
        }
      }

      // Auto-migración para productos de madera natural, barnices y corrección de MDF
      if (Array.isArray(data.products)) {
        let changedProducts = false;
        data.products.forEach(p => {
          if (p.id === 'llavero-camarita-l9' || p.code === 'L9') {
            if ((p.specifications?.material || '').includes('multicapa') || (p.variants?.[0]?.name || '').includes('Color de cámara') || p.sku?.includes('MDF')) {
              p.shortDescription = 'Llavero artesanal en madera natural con forma de cámara retro, foto personalizada en visor y borla sedosa.';
              p.fullDescription = 'Nuestra pieza icónica para regalar: fabricada artesanalmente en madera natural de abedul y pino estufado (sin MDF) con corte y grabado láser fino, protegida con barniz transparente hidrófugo y tintes para madera en tonos vintage (Nogal Americano, Verde Bosque, Azul Colonial o Caoba). Lleva tu fotografía miniatura protegida en el visor y una borla decorativa sedosa. Paquete especial de 3 camaritas por $200.';
              p.specifications = {
                ...(p.specifications || {}),
                dimensions: '4.5 x 3.5 cm x 6 mm de espesor',
                material: 'Madera natural de abedul y pino estufado de 3mm (100% libre de MDF)',
                finish: 'Capa protectora de barniz transparente sellador repelente a humedad y tintes para madera',
                includes: 'Argolla metálica reforzada con cadena, fotografía mini en visor y borla sedosa artesanal',
                minQuantity: 1,
                estimatedLeadTime: '2 a 4 días hábiles',
                careNotes: 'Limpiar con paño seco. Acabado hidrófugo resistente a salpicaduras.'
              };
              p.variants = [
                { name: 'Tono de Barniz y Acabado', options: ['Barniz Natural Transparente', 'Nogal Americano', 'Verde Bosque Rústico', 'Azul Colonial Vintage', 'Caoba Clásico'] },
                { name: 'Promoción', options: ['Individual ($100)', 'Paquete 3 Camaritas ($200)'] }
              ];
              p.privateNotes = 'Madera de abedul/pino selecta 3mm. Lijado suave grano 220, grabado nítido sin quemaduras. Aplicar capa de barniz protector transparente o tinte de madera elegido. Montar argolla metálica reforzada con eslabón y borla sedosa.';
              p.sku = 'HOG-LAS-PIN-GRA-009';
              if (p.skuBreakdown) {
                p.skuBreakdown.standardSku = 'HOG-LAS-PIN-GRA-009';
                p.skuBreakdown.material = 'PIN';
                if (p.skuBreakdown.instructionsForStaff) {
                  p.skuBreakdown.instructionsForStaff.materiaPrima = '🪵 Madera Natural Pino / Abedul 3mm (Sin MDF)';
                  p.skuBreakdown.instructionsForStaff.acabadoTaller = '✨ Barniz Transparente Sellador & Tintes de Madera';
                }
              }
              changedProducts = true;
            }
          }
          if (p.id === 'colgador-llaves-l14' || p.code === 'L14') {
            p.specifications = {
              ...(p.specifications || {}),
              material: 'Madera natural sólida y triplay de pino estufado 5.5mm (libre de MDF)',
              finish: 'Capa de barniz transparente satinado protector contra humedad y grasa'
            };
            p.variants = [
              { name: 'Grabado', options: ['"Bienvenidos"', 'Apellido familiar', 'Personalizado con nombres'] },
              { name: 'Tono de Barniz', options: ['Barniz Natural Transparente', 'Nogal Americano', 'Caoba Clásico', 'Roble Claro Nórdico'] }
            ];
            p.privateNotes = 'Corte y grabado en pino estufado 5.5mm. Lijado fino grano 220, capa uniforme de barniz transparente sellador contra humedad, instalación a presión de percheros torneados con gota de Resistol 850.';
            p.sku = 'HOG-LAS-PIN-GRA-014';
            if (p.skuBreakdown) {
              p.skuBreakdown.standardSku = 'HOG-LAS-PIN-GRA-014';
              p.skuBreakdown.material = 'PIN';
              if (p.skuBreakdown.instructionsForStaff) {
                p.skuBreakdown.instructionsForStaff.materiaPrima = '🪵 Madera Natural Pino Estufado 5.5mm (Sin MDF)';
                p.skuBreakdown.instructionsForStaff.acabadoTaller = '✨ Barniz Transparente Protector Satinado & Pulido 220';
              }
            }
            if (!Array.isArray(p.manufacturingRecipe?.items) || p.manufacturingRecipe.items.length === 0) {
              p.manufacturingRecipe = {
              yieldUnits: 1,
              technique: 'laser',
              notes: 'Placa de pino estufado 5.5mm pulida con lija 220, cortada a láser con 3 percheros torneados fijados con Resistol 850 y barniz sellador.',
              lastUpdated: new Date().toISOString(),
              machinePowerWatts: 450,
              manufacturingTimeMinutes: 25,
              kwhCost: 3.50,
              energyCost: 0.66,
              laborTimeMinutes: 15,
              laborRatePerHour: 75,
              laborCost: 18.75,
              items: [
                {
                  id: 'item-l14-pino5',
                  materialId: 'mat-triplay-pino-5mm',
                  name: 'Madera Triplay Pino 5.5mm para Estructuras Rígidas (60x40 cm)',
                  category: 'laser',
                  supplyType: 'direct',
                  netQuantity: 260,
                  wasteQuantity: 60,
                  wasteType: 'cut_remnants',
                  totalQuantity: 320,
                  unit: 'cm²',
                  unitCost: 0.0271,
                  totalCost: 8.67
                },
                {
                  id: 'item-l14-perchas',
                  materialId: 'mat-percheros-madera',
                  name: 'Percheros Cilíndricos Torneados de Madera Pino con Perno',
                  category: 'laser',
                  supplyType: 'direct',
                  netQuantity: 3,
                  wasteQuantity: 0,
                  wasteType: 'none',
                  totalQuantity: 3,
                  unit: 'pieza',
                  unitCost: 12,
                  totalCost: 36
                },
                {
                  id: 'item-l14-barniz',
                  materialId: 'mat-barniz-poliuretano-spray',
                  name: 'Barniz Poliuretano Transparente Satinado en Spray (400 ml)',
                  category: 'laser',
                  supplyType: 'finish',
                  netQuantity: 5,
                  wasteQuantity: 0,
                  wasteType: 'none',
                  totalQuantity: 5,
                  unit: 'ml',
                  unitCost: 0.3375,
                  totalCost: 1.69
                },
                {
                  id: 'item-l14-resistol',
                  materialId: 'mat-pegamento-resistol-850',
                  name: 'Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)',
                  category: 'ensamble',
                  supplyType: 'indirect',
                  netQuantity: 6,
                  wasteQuantity: 1,
                  wasteType: 'manual',
                  totalQuantity: 7,
                  unit: 'gotas',
                  unitCost: 0.0085,
                  totalCost: 0.06
                },
                {
                  id: 'item-l14-lija',
                  materialId: 'mat-lija-madera-fina-220',
                  name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)',
                  category: 'consumables',
                  supplyType: 'indirect',
                  netQuantity: 0.08,
                  wasteQuantity: 0.02,
                  wasteType: 'manual',
                  totalQuantity: 0.1,
                  unit: 'pliego',
                  unitCost: 14,
                  totalCost: 1.40
                },
                {
                  id: 'item-l14-sierra',
                  materialId: 'mat-desgaste-corte-sierra-laser',
                  name: 'Consumible Indirecto de Corte (Desgaste Hoja Sierra / Tubo Láser CO2)',
                  category: 'consumables',
                  supplyType: 'indirect',
                  netQuantity: 1,
                  wasteQuantity: 0,
                  wasteType: 'none',
                  totalQuantity: 1,
                  unit: 'corte',
                  unitCost: 1.5,
                  totalCost: 1.50
                },
                {
                  id: 'item-l14-estopa',
                  materialId: 'mat-estopa-limpieza-taller',
                  name: 'Estopa de Algodón Fino y Paños para Barnizado y Limpieza (1 kg)',
                  category: 'consumables',
                  supplyType: 'indirect',
                  netQuantity: 1,
                  wasteQuantity: 0,
                  wasteType: 'none',
                  totalQuantity: 1,
                  unit: 'paño',
                  unitCost: 0.8,
                  totalCost: 0.80
                },
                {
                  id: 'item-l14-cinta',
                  materialId: 'mat-cinta-enmascarar-laser',
                  name: 'Cinta de Enmascarar Crepé Grado Láser 50mm x 50m (Protección Anti-Ahumado)',
                  category: 'consumables',
                  supplyType: 'indirect',
                  netQuantity: 1.5,
                  wasteQuantity: 0.2,
                  wasteType: 'trimming',
                  totalQuantity: 1.7,
                  unit: 'm',
                  unitCost: 0.96,
                  totalCost: 1.63
                }
              ],
              totalMaterialCost: 51.75,
              totalWasteCost: 2.15,
              wastePercentAverage: 4.2,
              packagingAndShipping: {
                enabled: true,
                packagingType: 'caja_kraft',
                packagingCost: 12.00,
                packagingDetails: 'Caja microcorrugado 30x15x6 cm + poliburbuja protectora + viruta kraft + etiqueta térmica',
                shippingNationwideEstimated: 149.00,
                shippingIncludedInPrice: false,
                notes: 'Envío estándar a cualquier parte de la República Mexicana por FedEx / Estafeta / DHL'
              }
            };
              p.costPrice = 85.5;
            }
            changedProducts = true;
          }
          if (p.id === 'fotoiman-madera-l8' || p.code === 'L8') {
            if ((p.specifications?.material || '').includes('contrachapado') || p.sku?.includes('MDF')) {
              p.specifications = {
                ...(p.specifications || {}),
                material: 'Madera natural de abedul / pino estufado de 3mm (sin MDF)',
                finish: 'Capa de barniz transparente protector satinado y sellado de poro'
              };
              p.variants = [
                { name: 'Tono de Barniz', options: ['Barniz Natural Transparente', 'Nogal Americano', 'Caoba Clásico', 'Verde Bosque Rústico'] },
                { name: 'Grabado inferior', options: ['Con dedicatoria o fecha familiar', 'Solo fotografía grabada'] }
              ];
              p.sku = 'HOG-LAS-PIN-GRA-008';
              if (p.skuBreakdown) {
                p.skuBreakdown.standardSku = 'HOG-LAS-PIN-GRA-008';
                p.skuBreakdown.material = 'PIN';
                if (p.skuBreakdown.instructionsForStaff) {
                  p.skuBreakdown.instructionsForStaff.materiaPrima = '🪵 Madera Natural Abedul / Pino 3mm (Sin MDF)';
                }
              }
              changedProducts = true;
            }
          }
          if (p.id === 'posavasos-madera-l15' || p.code === 'L15') {
            if (!(p.variants || []).some(v => v.name.includes('Barniz')) || p.sku?.includes('MDF')) {
              p.specifications = {
                ...(p.specifications || {}),
                material: 'Madera natural sólida seleccionada de pino / haya 5mm con base de corcho natural (sin MDF)',
                finish: 'Triple capa de barniz transparente sellador poliuretano hidrófugo grado mesa'
              };
              p.variants = [
                { name: 'Tono de Barniz', options: ['Barniz Natural Transparente', 'Nogal Americano', 'Caoba Clásico', 'Roble Claro Nórdico'] },
                { name: 'Forma', options: ['Circular (9 cm)', 'Cuadrado con cantos redondeados (9 cm)'] }
              ];
              p.sku = 'HOG-LAS-PIN-GRA-015';
              if (p.skuBreakdown) {
                p.skuBreakdown.standardSku = 'HOG-LAS-PIN-GRA-015';
                p.skuBreakdown.material = 'PIN';
              }
              changedProducts = true;
            }
          }
          if (p.id === 'letrero-boda-l2' || p.code === 'L2') {
            if ((p.specifications?.material || '').includes('contrachapada')) {
              p.specifications = {
                ...(p.specifications || {}),
                material: 'Madera natural sólida de haya / pino estufado de 6 mm o acrílico cristal (sin MDF)',
                finish: 'Capa protectora de barniz transparente satinado y bordes pulidos'
              };
              p.variants = [
                { name: 'Acabado y Barniz', options: ['Barniz Natural Transparente Pino Nórdico', 'Nogal Americano Clásico', 'Caoba Elegante', 'Acrílico Blanco Esmerilado'] },
                { name: 'Tamaño', options: ['Mesa de dulces / firmas (30 x 20 cm)', 'Entrada al salón (50 x 35 cm)'] }
              ];
              p.sku = 'EVE-LAS-PIN-GRA-002';
              if (p.skuBreakdown) {
                p.skuBreakdown.standardSku = 'EVE-LAS-PIN-GRA-002';
                p.skuBreakdown.material = 'PIN';
              }
              changedProducts = true;
            }
          }
          if (p.code === 'EV-GUEST-01' || p.code === 'EV-TOPPER-01' || p.code === 'EV-CAJITAS-01' || p.code === 'EV-ABANICO-01') {
            if (p.sku?.includes('MDF') || (p.skuBreakdown?.instructionsForStaff?.materiaPrima || '').includes('MDF (3mm')) {
              p.sku = 'EVE-LAS-PIN-GRA-001';
              if (p.skuBreakdown) {
                p.skuBreakdown.standardSku = 'EVE-LAS-PIN-GRA-001';
                p.skuBreakdown.material = 'PIN';
                if (p.skuBreakdown.instructionsForStaff) {
                  p.skuBreakdown.instructionsForStaff.materiaPrima = '🪵 Madera Natural Calidad Láser (Sin MDF)';
                }
              }
              changedProducts = true;
            }
          }
          if (p.code === 'SB-TERMO-01' && p.sku?.includes('MDF')) {
            p.sku = 'HOG-SUB-MET-MAT-001';
            if (p.skuBreakdown) {
              p.skuBreakdown.standardSku = 'HOG-SUB-MET-MAT-001';
              p.skuBreakdown.material = 'MET';
              if (p.skuBreakdown.instructionsForStaff) {
                p.skuBreakdown.instructionsForStaff.materiaPrima = '🥤 Termo Acero Inoxidable Doble Pared 20 oz';
              }
            }
            changedProducts = true;
          }
        });
        if (changedProducts) {
          this.save(data);
        }
      }

      return data;
    } catch (err) {
      console.error('Error reading db.json:', err);
      const data = createInitialDb();
      data.publications = [];
      data.orders = [];
      data.pubTracking = [];
      data.suppliers = [];
      data.productionLogs = [];
      data.coupons = [...initialCoupons];
      data.rawMaterials = [...initialRawMaterials];
      return data;
    }
  }

  save(data) {
    if (cloudDb.enabled) return cloudDb.save(data);
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
  }

  syncCatalogWithCodebase() {
    const data = this.read();
    let changed = false;

    // 1. Sincronizar Worlds
    if (!Array.isArray(data.worlds)) data.worlds = [];
    for (const w of initialWorlds) {
      const wIdx = data.worlds.findIndex(item => item.id === w.id);
      if (wIdx === -1) {
        data.worlds.push(w);
        changed = true;
      } else {
        if (
          data.worlds[wIdx].image !== w.image ||
          data.worlds[wIdx].name !== w.name ||
          data.worlds[wIdx].tagline !== w.tagline ||
          data.worlds[wIdx].description !== w.description
        ) {
          data.worlds[wIdx] = { ...data.worlds[wIdx], ...w };
          changed = true;
        }
      }
    }

    // 2. Sincronizar Categories
    if (!Array.isArray(data.categories)) data.categories = [];
    for (const c of initialCategories) {
      const cIdx = data.categories.findIndex(item => item.id === c.id);
      if (cIdx === -1) {
        data.categories.push(c);
        changed = true;
      }
    }

    // 3. Sincronizar Products
    if (!Array.isArray(data.products)) data.products = [];
    // Purgar productos bloqueados o de industria en tienda comercial
    data.products = data.products.filter(p => !DELETED_PRODUCTS_BLOCKLIST.includes(p.id) && !(p.worlds && p.worlds.length === 1 && p.worlds[0] === 'industria'));
    
    for (const p of initialProducts) {
      const pIdx = data.products.findIndex(item => item.id === p.id);
      if (pIdx === -1) {
        data.products.push(p);
        changed = true;
      } else {
        const cur = data.products[pIdx];
        const pWorlds = JSON.stringify(p.worlds || []);
        const curWorlds = JSON.stringify(cur.worlds || []);
        const missingCreatedAt = !cur.createdAt && p.createdAt;
        const missingUpdatedAt = !cur.updatedAt && p.updatedAt;
        if (
          missingCreatedAt ||
          missingUpdatedAt ||
          pWorlds !== curWorlds ||
          (p.worlds && p.worlds.includes('personalizados') && cur.price !== p.price) ||
          (cur.image !== p.image && p.image && p.image.startsWith('/uploads/'))
        ) {
          data.products[pIdx] = { ...cur, ...p, createdAt: cur.createdAt || p.createdAt, updatedAt: cur.updatedAt || p.updatedAt };
          changed = true;
        }
      }
    }

    // 3.1 Garantizar unicidad de SKU (trazabilidad de inventario y reportes)
    if (ensureUniqueProductSkus(data.products) > 0) changed = true;

    if (changed) {
      this.save(data);
      console.log(`[CATALOG SYNC] Catálogo sincronizado con éxito. Total productos: ${data.products.length}, Mundos: ${data.worlds.length}, Categorías: ${data.categories.length}`);
    }

    return { changed, totalProducts: data.products.length, totalWorlds: data.worlds.length, totalCategories: data.categories.length };
  }

  // --- Helpers ---
  getProducts(filters = {}) {
    const db = this.read();
    let items = db.products || [];

    // Purgar productos eliminados de la tienda (galga, tobera y lista negra)
    items = items.filter(p => !DELETED_PRODUCTS_BLOCKLIST.includes(p.id) && !(p.worlds && p.worlds.length === 1 && p.worlds[0] === 'industria'));

    // Actualizar precios de Starter Packs si aún tienen los precios antiguos no rentables
    items = items.map(p => {
      if (p.id === 'starter-pack-joyeria-t27' && p.price < 540) {
        return { ...p, price: 540, regularPrice: 680 };
      }
      if (p.id === 'starter-pack-gym-t32' && p.price < 490) {
        return { ...p, price: 490, regularPrice: 620 };
      }
      if (p.id === 'starter-pack-barberia-t18' && p.price < 480) {
        return { ...p, price: 480, regularPrice: 590 };
      }
      return p;
    });

    // Filter by status: public only sees published; admin can request all or specific
    if (filters.status && filters.status !== 'all') {
      items = items.filter(p => p.status === filters.status);
    } else if (!filters.status) {
      items = items.filter(p => p.status === 'published');
    }

    if (filters.world) {
      items = items.filter(p => p.worlds && p.worlds.includes(filters.world));
    }

    if (filters.category) {
      items = items.filter(p => p.categories && p.categories.includes(filters.category));
    }

    if (filters.technique) {
      items = items.filter(p => p.techniques && p.techniques.includes(filters.technique));
    }

    if (filters.featured === 'true' || filters.featured === true) {
      items = items.filter(p => p.featured === true);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.fullDescription && p.fullDescription.toLowerCase().includes(q))
      );
    }

    return items;
  }

  getProductById(id) {
    const db = this.read();
    return db.products.find(p => p.id === id || p.code?.toLowerCase() === id.toLowerCase() || p.sku?.toLowerCase() === id.toLowerCase());
  }

  createProduct(productData) {
    const db = this.read();
    const newProduct = normalizeProductAreaAssignment({
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      status: productData.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    db.products.push(newProduct);
    this.save(db);
    return newProduct;
  }

  updateProduct(id, productData) {
    const db = this.read();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    db.products[index] = normalizeProductAreaAssignment({
      ...db.products[index],
      ...productData,
      id: db.products[index].id, // preserve ID
      updatedAt: new Date().toISOString()
    });
    this.save(db);
    return db.products[index];
  }

  duplicateProduct(id) {
    const db = this.read();
    const original = db.products.find(p => p.id === id);
    if (!original) return null;

    const copy = normalizeProductAreaAssignment({
      ...original,
      id: `prod-${Date.now()}`,
      code: `${original.code}-COP`,
      name: `${original.name} (Copia)`,
      status: 'draft',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    db.products.push(copy);
    this.save(db);
    return copy;
  }

  deleteProduct(id) {
    const db = this.read();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    if (!Array.isArray(db.deletedProductIds)) db.deletedProductIds = [];
    if (!db.deletedProductIds.includes(id)) db.deletedProductIds.push(id);
    this.save(db);
    return true;
  }

  getWorlds(publicOnly = true) {
    const db = this.read();
    const worlds = db.worlds || initialWorlds;
    const categories = this.getCategories(publicOnly);

    return worlds.map(w => ({
      ...w,
      categories: categories.filter(c => c.worldId === w.id)
    }));
  }

  updateWorld(worldId, updateData) {
    const db = this.read();
    if (!db.worlds) db.worlds = JSON.parse(JSON.stringify(initialWorlds));
    const idx = db.worlds.findIndex(w => w.id === worldId);
    if (idx === -1) {
      throw new Error(`Área con id "${worldId}" no encontrada`);
    }
    db.worlds[idx] = {
      ...db.worlds[idx],
      ...updateData
    };
    this.save(db);
    return db.worlds[idx];
  }

  getCategories(publicOnly = true) {
    const db = this.read();
    let categories = db.categories || [];
    const publishedProducts = db.products.filter(p => p.status === 'published');

    return categories.map(cat => {
      const count = publishedProducts.filter(p => p.categories && p.categories.includes(cat.id)).length;
      return {
        ...cat,
        productCount: count
      };
    }).filter(cat => {
      if (!publicOnly) return true;
      // Per instructions: "las categorías vacías deben permanecer ocultas al público"
      return cat.productCount > 0 && !cat.isHidden;
    });
  }

  updateCategory(id, data) {
    const db = this.read();
    const idx = db.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.categories[idx] = { ...db.categories[idx], ...data };
    this.save(db);
    return db.categories[idx];
  }

  createCategory(data) {
    const db = this.read();
    const newCat = {
      id: data.id || `cat-${Date.now()}`,
      worldId: data.worldId,
      name: data.name,
      order: data.order || db.categories.length + 1,
      isHidden: !!data.isHidden
    };
    db.categories.push(newCat);
    this.save(db);
    return newCat;
  }

  getSettings() {
    const db = this.read();
    const settings = db.settings ? { ...db.settings } : { ...initialSettings };
    if (!settings.arcadeConfig) {
      settings.arcadeConfig = { ...defaultArcadeConfig };
    } else {
      settings.arcadeConfig = {
        ...defaultArcadeConfig,
        ...settings.arcadeConfig,
        activeGameIds: Array.isArray(settings.arcadeConfig.activeGameIds) && settings.arcadeConfig.activeGameIds.length > 0
          ? settings.arcadeConfig.activeGameIds
          : defaultArcadeConfig.activeGameIds,
        discountTiers: Array.isArray(settings.arcadeConfig.discountTiers) && settings.arcadeConfig.discountTiers.length > 0
          ? settings.arcadeConfig.discountTiers
          : defaultArcadeConfig.discountTiers
      };
    }
    if (!settings.mobileCatalogConfig) {
      settings.mobileCatalogConfig = { ...defaultMobileCatalogConfig };
    } else {
      settings.mobileCatalogConfig = {
        ...defaultMobileCatalogConfig,
        ...settings.mobileCatalogConfig
      };
    }
    return settings;
  }

  updateSettings(newSettings) {
    const db = this.read();
    db.settings = { ...db.settings, ...newSettings };
    this.save(db);
    return db.settings;
  }

  getMobileCatalogConfig() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.mobileCatalogConfig) {
      db.settings.mobileCatalogConfig = { ...defaultMobileCatalogConfig };
      this.save(db);
    } else {
      if (!Array.isArray(db.settings.mobileCatalogConfig.catalogs) || db.settings.mobileCatalogConfig.catalogs.length === 0) {
        db.settings.mobileCatalogConfig.catalogs = [
          {
            id: 'cat-general-oficial',
            name: db.settings.mobileCatalogConfig.title || 'Catálogo Móvil Oficial (9:16)',
            season: 'Todo el año',
            badge: 'Colección General',
            description: db.settings.mobileCatalogConfig.subtitle || 'Llaveros, macetas, letreros, tazas y piezas 3D con enlaces directos MakerWorld.',
            fileName: db.settings.mobileCatalogConfig.fileName || 'Catalogo_Movil_Artesano_Digital.pdf',
            fileUrl: db.settings.mobileCatalogConfig.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf',
            fileSize: db.settings.mobileCatalogConfig.fileSize || '1,312 KB',
            fileType: db.settings.mobileCatalogConfig.fileType || 'application/pdf',
            enabled: db.settings.mobileCatalogConfig.enabled !== false,
            isPrimary: true,
            uploadedAt: db.settings.mobileCatalogConfig.updatedAt || new Date().toISOString()
          }
        ];
        this.save(db);
      }
    }
    return db.settings.mobileCatalogConfig;
  }

  updateMobileCatalogConfig(partialConfig) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    const current = this.getMobileCatalogConfig();
    db.settings.mobileCatalogConfig = {
      ...current,
      ...partialConfig,
      updatedAt: new Date().toISOString()
    };
    this.save(db);
    return db.settings.mobileCatalogConfig;
  }

  addMobileCatalogItem(item) {
    const db = this.read();
    const config = this.getMobileCatalogConfig();
    config.catalogs = config.catalogs || [];
    const newItem = {
      id: item.id || `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: item.name || 'Nuevo Catálogo',
      season: item.season || '',
      badge: item.badge || '',
      description: item.description || '',
      fileName: item.fileName || 'catalogo.pdf',
      fileUrl: item.fileUrl || '/downloads/catalogo.pdf',
      fileSize: item.fileSize || '',
      fileType: item.fileType || 'application/pdf',
      enabled: item.enabled !== false,
      isPrimary: Boolean(item.isPrimary),
      uploadedAt: new Date().toISOString()
    };
    if (newItem.isPrimary || config.catalogs.length === 0) {
      config.catalogs.forEach(c => { c.isPrimary = false; });
      newItem.isPrimary = true;
      config.fileUrl = newItem.fileUrl;
      config.fileName = newItem.fileName;
    }
    config.catalogs.push(newItem);
    config.updatedAt = new Date().toISOString();
    db.settings.mobileCatalogConfig = config;
    this.save(db);
    return newItem;
  }

  updateMobileCatalogItem(id, data) {
    const db = this.read();
    const config = this.getMobileCatalogConfig();
    config.catalogs = config.catalogs || [];
    const idx = config.catalogs.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const current = config.catalogs[idx];
    if (data.isPrimary) {
      config.catalogs.forEach(c => { c.isPrimary = false; });
      config.fileUrl = data.fileUrl || current.fileUrl;
      config.fileName = data.fileName || current.fileName;
    }
    config.catalogs[idx] = {
      ...current,
      ...data,
      id: current.id,
      updatedAt: new Date().toISOString()
    };
    config.updatedAt = new Date().toISOString();
    db.settings.mobileCatalogConfig = config;
    this.save(db);
    return config.catalogs[idx];
  }

  deleteMobileCatalogItem(id) {
    const db = this.read();
    const config = this.getMobileCatalogConfig();
    config.catalogs = config.catalogs || [];
    const idx = config.catalogs.findIndex(c => c.id === id);
    if (idx === -1) return false;
    config.catalogs.splice(idx, 1);
    if (config.catalogs.length > 0 && !config.catalogs.some(c => c.isPrimary)) {
      config.catalogs[0].isPrimary = true;
      config.fileUrl = config.catalogs[0].fileUrl;
      config.fileName = config.catalogs[0].fileName;
    }
    config.updatedAt = new Date().toISOString();
    db.settings.mobileCatalogConfig = config;
    this.save(db);
    return true;
  }

  resetMobileCatalogConfig() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    db.settings.mobileCatalogConfig = {
      ...defaultMobileCatalogConfig,
      updatedAt: new Date().toISOString()
    };
    this.save(db);
    return db.settings.mobileCatalogConfig;
  }

  getCampaignsConfig() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.campaignsConfig) {
      db.settings.campaignsConfig = { ...defaultCampaignsConfig };
      this.save(db);
    } else {
      let needsSave = false;
      if (!db.settings.campaignsConfig.seasonalEffect) {
        db.settings.campaignsConfig.seasonalEffect = defaultCampaignsConfig.seasonalEffect;
        needsSave = true;
      }
      if (!db.settings.campaignsConfig.monthlyEvents) {
        db.settings.campaignsConfig.monthlyEvents = defaultCampaignsConfig.monthlyEvents;
        needsSave = true;
      } else {
        if (!db.settings.campaignsConfig.monthlyEvents.flashSpecial) {
          db.settings.campaignsConfig.monthlyEvents.flashSpecial = defaultCampaignsConfig.monthlyEvents.flashSpecial;
          needsSave = true;
        }
        if (!db.settings.campaignsConfig.monthlyEvents.baseEventMode) {
          db.settings.campaignsConfig.monthlyEvents.baseEventMode = 'major';
          needsSave = true;
        }
      }
      if (needsSave) {
        this.save(db);
      }
    }
    return db.settings.campaignsConfig;
  }

  updateCampaignsConfig(newConfig) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    db.settings.campaignsConfig = {
      ...(db.settings.campaignsConfig || defaultCampaignsConfig),
      ...newConfig
    };
    this.save(db);
    return db.settings.campaignsConfig;
  }

  getArcadeConfig() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.arcadeConfig) {
      db.settings.arcadeConfig = { ...defaultArcadeConfig };
      this.save(db);
    } else {
      let changed = false;
      if (!db.settings.arcadeConfig.selectionMode) {
        db.settings.arcadeConfig.selectionMode = 'daily_random';
        changed = true;
      }
      if (!Array.isArray(db.settings.arcadeConfig.activeGameIds) || db.settings.arcadeConfig.activeGameIds.length === 0) {
        db.settings.arcadeConfig.activeGameIds = ['dino', 'stacker'];
        changed = true;
      }
      if (!Array.isArray(db.settings.arcadeConfig.discountTiers) || db.settings.arcadeConfig.discountTiers.length === 0) {
        db.settings.arcadeConfig.discountTiers = [...defaultArcadeConfig.discountTiers];
        changed = true;
      }
      if (!db.settings.arcadeConfig.activeTheme) {
        db.settings.arcadeConfig.activeTheme = 'clasico';
        changed = true;
      }
      if (!db.settings.arcadeConfig.costPerGame) {
        db.settings.arcadeConfig.costPerGame = 1;
        changed = true;
      }
      if (!db.settings.arcadeConfig.coinToCreditCost) {
        db.settings.arcadeConfig.coinToCreditCost = 2;
        changed = true;
      }
      if (db.settings.arcadeConfig.lastResetTimestamp === undefined) {
        db.settings.arcadeConfig.lastResetTimestamp = 0;
        changed = true;
      }
      if (!Array.isArray(db.settings.arcadeConfig.seasonPresets) || db.settings.arcadeConfig.seasonPresets.length === 0) {
        db.settings.arcadeConfig.seasonPresets = [...defaultSeasonPresets];
        changed = true;
      }
      if (changed) {
        this.save(db);
      }
    }
    return db.settings.arcadeConfig;
  }

  updateArcadeConfig(newConfig) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    db.settings.arcadeConfig = {
      ...(db.settings.arcadeConfig || defaultArcadeConfig),
      ...newConfig
    };
    this.save(db);
    return db.settings.arcadeConfig;
  }

  resetArcadeCoins() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.arcadeConfig) db.settings.arcadeConfig = { ...defaultArcadeConfig };
    const timestamp = Date.now();
    db.settings.arcadeConfig.lastResetTimestamp = timestamp;
    this.save(db);
    return {
      success: true,
      lastResetTimestamp: timestamp,
      message: 'Monedas de todos los clientes restablecidas a 0 exitosamente'
    };
  }

  getWorkshopMachines() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.workshopMachines || db.settings.workshopMachines.length === 0) {
      db.settings.workshopMachines = [...initialWorkshopMachines];
      this.save(db);
    } else {
      let changed = false;
      db.settings.workshopMachines = db.settings.workshopMachines.map(m => {
        const initM = initialWorkshopMachines.find(im => im.id === m.id) || {};
        let updated = { ...m };
        if (updated.speedEfficiency === undefined) {
          updated.speedEfficiency = initM.speedEfficiency || 100;
          changed = true;
        }
        if (!updated.sizeCategory) {
          updated.sizeCategory = initM.sizeCategory || 'Mediana';
          changed = true;
        }
        if (!Array.isArray(updated.compatibleMaterials) || updated.compatibleMaterials.length === 0) {
          updated.compatibleMaterials = initM.compatibleMaterials || ['Material estándar'];
          changed = true;
        }
        return updated;
      });
      if (changed) {
        this.save(db);
      }
    }
    return db.settings.workshopMachines;
  }

  updateWorkshopMachines(machines) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    db.settings.workshopMachines = Array.isArray(machines) ? machines : [];
    this.save(db);
    return db.settings.workshopMachines;
  }

  updateWorkshopMachineById(id, updates) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.workshopMachines) {
      db.settings.workshopMachines = [...initialWorkshopMachines];
    }
    const idx = db.settings.workshopMachines.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const current = db.settings.workshopMachines[idx];
    const updated = { ...current, ...updates };

    if (updated.powerWatts !== undefined && updated.kwhRate !== undefined) {
      updated.powerCostPerHour = Number(((Number(updated.powerWatts) / 1000) * Number(updated.kwhRate)).toFixed(2));
    }
    const power = Number(updated.powerCostPerHour) || 0;
    const wear = Number(updated.wearCostPerHour) || 0;
    const maint = Number(updated.maintenanceCostPerHour) || 0;
    updated.totalHourlyRate = Number((power + wear + maint).toFixed(2));

    db.settings.workshopMachines[idx] = updated;
    this.save(db);
    return updated;
  }



  getWorkshopWorkers() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.workshopWorkers || db.settings.workshopWorkers.length === 0) {
      db.settings.workshopWorkers = [...initialWorkshopWorkers];
      this.save(db);
    }
    return db.settings.workshopWorkers;
  }

  updateWorkshopWorkers(workers) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    db.settings.workshopWorkers = Array.isArray(workers) ? workers : [];
    this.save(db);
    return db.settings.workshopWorkers;
  }

  updateWorkshopWorkerById(id, updates) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.workshopWorkers) {
      db.settings.workshopWorkers = [...initialWorkshopWorkers];
    }
    const idx = db.settings.workshopWorkers.findIndex(w => w.id === id);
    if (idx === -1) return null;
    const current = db.settings.workshopWorkers[idx];
    const updated = { ...current, ...updates };

    if (updated.salary && updated.hoursPerDay && updated.daysPerWeek) {
      const hoursPerWeek = (Number(updated.hoursPerDay) || 8) * (Number(updated.daysPerWeek) || 5);
      const hoursPerMonth = updated.salaryPeriod === 'weekly' ? hoursPerWeek : (hoursPerWeek * 4.33);
      const effectiveHours = Math.max(1, hoursPerMonth * ((Number(updated.efficiency) || 100) / 100));
      const calculatedRate = Math.round(Number(updated.salary) / effectiveHours);
      if (!updates.hourlyRateManual) {
        updated.hourlyRate = calculatedRate;
      }
    }

    db.settings.workshopWorkers[idx] = updated;
    this.save(db);
    return updated;
  }

  getFlashDealsLimits() {
    const db = this.read();
    if (!db.settings) db.settings = {};
    if (!db.settings.flashDealsLimits) {
      db.settings.flashDealsLimits = {
        hogar: 3,
        negocios: 3,
        eventos: 5,
        paquetes: 1
      };
      this.save(db);
    }
    return db.settings.flashDealsLimits;
  }

  updateFlashDealsLimits(newLimits) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    const current = db.settings.flashDealsLimits || {
      hogar: 3,
      negocios: 3,
      eventos: 5,
      paquetes: 1
    };

    const updated = {
      hogar: Math.max(1, Number(newLimits.hogar) || current.hogar || 3),
      negocios: Math.max(1, Number(newLimits.negocios) || current.negocios || 3),
      eventos: Math.max(1, Number(newLimits.eventos) || current.eventos || 5),
      paquetes: Math.max(1, Number(newLimits.paquetes) || current.paquetes || 1)
    };

    db.settings.flashDealsLimits = updated;
    const trimmedCount = this.enforceFlashDealsCaps(db);
    this.save(db);
    return {
      ok: true,
      limits: updated,
      trimmedCount,
      settings: db.settings
    };
  }

  enforceFlashDealsCaps(db) {
    if (!db || !db.products) return 0;
    const limits = db.settings?.flashDealsLimits || {
      hogar: 3,
      negocios: 3,
      eventos: 5,
      paquetes: 1
    };

    const isProductInArea = (p, area) => {
      if (!p) return false;
      if (area === 'paquetes') {
        return Boolean(p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes'));
      }
      return Boolean(p.worlds?.includes(area));
    };

    const areas = ['hogar', 'negocios', 'eventos', 'paquetes'];
    const pausedAreas = db.settings?.flashDealsStatus?.pausedAreas || {};
    const isGloballyPaused = Boolean(db.settings?.flashDealsStatus?.isGloballyPaused);

    const activeProducts = db.products.filter(p => p.status === 'published' && p.flashDealConfig?.enabled);

    const areaCounts = { hogar: 0, negocios: 0, eventos: 0, paquetes: 0 };
    let trimmedCount = 0;

    // Sort active products: prioritize ones that have future expiresAt
    activeProducts.sort((a, b) => {
      const expA = a.flashDealConfig?.expiresAt || 0;
      const expB = b.flashDealConfig?.expiresAt || 0;
      return expB - expA;
    });

    for (const prod of activeProducts) {
      if (isGloballyPaused) {
        prod.flashDealConfig = {
          ...prod.flashDealConfig,
          enabled: false,
          startedAt: null,
          expiresAt: null
        };
        trimmedCount++;
        continue;
      }

      const prodAreas = areas.filter(a => isProductInArea(prod, a));
      const hasPausedArea = prodAreas.some(a => pausedAreas[a]);
      // Debe caber en todas las áreas a las que pertenece sin violar el tope de ninguna y sin estar pausada
      const canFit = !hasPausedArea && (prodAreas.length === 0 || prodAreas.every(a => (areaCounts[a] || 0) < (limits[a] || 1)));

      if (canFit) {
        prodAreas.forEach(a => {
          areaCounts[a] = (areaCounts[a] || 0) + 1;
        });
      } else {
        prod.flashDealConfig = {
          ...prod.flashDealConfig,
          enabled: false,
          startedAt: null,
          expiresAt: null
        };
        trimmedCount++;
      }
    }

    return trimmedCount;
  }

  controlFlashDeals({ action, area = 'all' }) {
    const db = this.read();
    if (!db.settings) {
      db.settings = initialSettings;
    }
    if (!db.settings.flashDealsStatus) {
      db.settings.flashDealsStatus = {
        isGloballyPaused: false,
        pausedAreas: {
          hogar: false,
          negocios: false,
          eventos: false,
          paquetes: false
        },
        lastResetAt: new Date().toISOString()
      };
    }
    if (!db.settings.flashDealsLimits) {
      db.settings.flashDealsLimits = {
        hogar: 3,
        negocios: 3,
        eventos: 5,
        paquetes: 1
      };
    }

    const status = db.settings.flashDealsStatus;
    let message = '';
    let updatedProductsCount = 0;

    const areaNames = {
      hogar: 'Hogar & Decoración',
      negocios: 'Negocios & Marca',
      eventos: 'Eventos Especiales',
      paquetes: 'Paquetes & Servicios',
      all: 'todas las áreas'
    };

    if (action === 'pause_all') {
      status.isGloballyPaused = true;
      status.pausedAreas = {
        hogar: true,
        negocios: true,
        eventos: true,
        paquetes: true
      };
      status.lastResetAt = new Date().toISOString();

      (db.products || []).forEach(p => {
        if (p.flashDealConfig?.enabled) {
          p.flashDealConfig = {
            ...p.flashDealConfig,
            enabled: false,
            pausedByAdmin: true,
            startedAt: null,
            expiresAt: null
          };
          updatedProductsCount++;
        }
      });
      message = 'Se pausaron las ofertas flash en todas las áreas del taller.';

    } else if (action === 'resume_all' || action === 'unpause_all') {
      status.isGloballyPaused = false;
      status.pausedAreas = {
        hogar: false,
        negocios: false,
        eventos: false,
        paquetes: false
      };
      status.lastResetAt = new Date().toISOString();

      (db.products || []).forEach(p => {
        if (p.flashDealConfig && p.flashDealConfig.pausedByAdmin) {
          delete p.flashDealConfig.pausedByAdmin;
          p.flashDealConfig = {
            ...p.flashDealConfig,
            enabled: true,
            startedAt: Date.now(),
            expiresAt: Date.now() + (p.flashDealConfig.durationMinutes || 120) * 60 * 1000
          };
          updatedProductsCount++;
        }
      });
      this.enforceFlashDealsCaps(db);
      message = 'Se reanudaron y despausaron las ofertas flash en todas las áreas respetando los topes.';

    } else if (action === 'pause_area') {
      if (area && status.pausedAreas.hasOwnProperty(area)) {
        status.pausedAreas[area] = true;
        const allPaused = ['hogar', 'negocios', 'eventos', 'paquetes'].every(k => status.pausedAreas[k]);
        if (allPaused) status.isGloballyPaused = true;

        (db.products || []).forEach(p => {
          const inArea = area === 'paquetes'
            ? (p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.worlds?.includes('paquetes'))
            : p.worlds?.includes(area);

          if (inArea && p.flashDealConfig?.enabled) {
            p.flashDealConfig = {
              ...p.flashDealConfig,
              enabled: false,
              pausedByAdmin: true,
              startedAt: null,
              expiresAt: null
            };
            updatedProductsCount++;
          }
        });
        this.enforceFlashDealsCaps(db);
        message = `Se pausaron las ofertas flash en el área de ${areaNames[area] || area}.`;
      }

    } else if (action === 'resume_area' || action === 'unpause_area') {
      if (area && status.pausedAreas.hasOwnProperty(area)) {
        status.pausedAreas[area] = false;
        status.isGloballyPaused = false;

        (db.products || []).forEach(p => {
          const inArea = area === 'paquetes'
            ? (p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.worlds?.includes('paquetes'))
            : p.worlds?.includes(area);

          if (inArea && p.flashDealConfig && p.flashDealConfig.pausedByAdmin) {
            delete p.flashDealConfig.pausedByAdmin;
            p.flashDealConfig = {
              ...p.flashDealConfig,
              enabled: true,
              startedAt: Date.now(),
              expiresAt: Date.now() + (p.flashDealConfig.durationMinutes || 120) * 60 * 1000
            };
            updatedProductsCount++;
          }
        });
        this.enforceFlashDealsCaps(db);
        message = `Se reanudó y despausó el área de ${areaNames[area] || area}.`;
      }

    } else if (action === 'reset_cycle') {
      status.lastResetAt = new Date().toISOString();
      if (area === 'all') {
        status.isGloballyPaused = false;
        status.pausedAreas = {
          hogar: false,
          negocios: false,
          eventos: false,
          paquetes: false
        };
        (db.products || []).forEach(p => {
          if (p.flashDealConfig && p.flashDealConfig.enabled) {
            delete p.flashDealConfig.pausedByAdmin;
            const dur = p.flashDealConfig.durationMinutes || 120;
            p.flashDealConfig.startedAt = Date.now();
            p.flashDealConfig.expiresAt = Date.now() + dur * 60 * 1000;
            updatedProductsCount++;
          }
        });
        this.enforceFlashDealsCaps(db);
        message = 'Ciclo de ofertas flash y cronómetros reestablecidos para todas las áreas.';
      } else {
        if (status.pausedAreas.hasOwnProperty(area)) {
          status.pausedAreas[area] = false;
          status.isGloballyPaused = false;
        }
        (db.products || []).forEach(p => {
          const inArea = area === 'paquetes'
            ? (p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.worlds?.includes('paquetes'))
            : p.worlds?.includes(area);

          if (inArea && p.flashDealConfig && p.flashDealConfig.enabled) {
            delete p.flashDealConfig.pausedByAdmin;
            const dur = p.flashDealConfig.durationMinutes || 120;
            p.flashDealConfig.startedAt = Date.now();
            p.flashDealConfig.expiresAt = Date.now() + dur * 60 * 1000;
            updatedProductsCount++;
          }
        });
        this.enforceFlashDealsCaps(db);
        message = `Ciclo de ofertas y cronómetros reestablecidos para ${areaNames[area] || area}.`;
      }
    } else if (action === 'trim_to_limits') {
      const trimmed = this.enforceFlashDealsCaps(db);
      message = `Se ajustaron las ofertas activas a los topes máximos autorizados (desactivadas ${trimmed} excedentes).`;
    }

    this.save(db);
    return {
      ok: true,
      flashDealsStatus: status,
      flashDealsLimits: db.settings.flashDealsLimits,
      message,
      updatedProductsCount,
      settings: db.settings
    };
  }

  recordEvent(eventType, payload = {}) {
    const db = this.read();
    if (!db.analytics) {
      db.analytics = { pageViews: 0, productViews: {}, whatsappClicks: 0, quotesStarted: 0, events: [] };
    }

    if (eventType === 'page_view') {
      db.analytics.pageViews = (db.analytics.pageViews || 0) + 1;
    } else if (eventType === 'product_view' && payload.productId) {
      db.analytics.productViews = db.analytics.productViews || {};
      db.analytics.productViews[payload.productId] = (db.analytics.productViews[payload.productId] || 0) + 1;
    } else if (eventType === 'whatsapp_click') {
      db.analytics.whatsappClicks = (db.analytics.whatsappClicks || 0) + 1;
    } else if (eventType === 'quote_started') {
      db.analytics.quotesStarted = (db.analytics.quotesStarted || 0) + 1;
    }

    // Keep last 100 recent events
    db.analytics.events = db.analytics.events || [];
    db.analytics.events.unshift({
      id: `ev-${Date.now()}`,
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    });
    if (db.analytics.events.length > 100) {
      db.analytics.events = db.analytics.events.slice(0, 100);
    }

    this.save(db);
  }

  getAnalytics() {
    const db = this.read();
    return db.analytics || {};
  }

  // ==========================================
  // PUBLICATIONS (MARKETING CAMPAIGNS)
  // ==========================================
  getPublications() {
    const db = this.read();
    return db.publications || [];
  }

  getPublicationById(id) {
    const db = this.read();
    return (db.publications || []).find(p => p.id === id || p.code === id);
  }

  createPublication(data) {
    const db = this.read();
    db.publications = db.publications || [];

    // Clean code or auto-generate
    let code = (data.code || '').trim().toUpperCase();
    if (!code) {
      const netPrefix = (data.socialNetwork || 'PUB').substring(0, 3).toUpperCase();
      const seq = String(db.publications.length + 1).padStart(3, '0');
      code = `PUB-${netPrefix}-${seq}`;
    }

    // Verify code uniqueness
    if (db.publications.some(p => p.code === code)) {
      throw new Error(`El código de publicación "${code}" ya existe. Por favor especifica un código único.`);
    }

    const newPub = {
      id: `pub-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      code,
      name: data.name?.trim() || 'Publicación sin título',
      date: data.date || new Date().toISOString().split('T')[0],
      socialNetwork: (data.socialNetwork || 'instagram').toLowerCase(),
      postUrl: data.postUrl?.trim() || '',
      productId: data.productId || 'general',
      productName: data.productName?.trim() || 'General / Catálogo',
      adSpend: Math.max(0, Number(data.adSpend) || 0),
      utmSource: (data.socialNetwork || 'instagram').toLowerCase(),
      utmMedium: data.utmMedium || 'social',
      utmCampaign: data.utmCampaign || `pub_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      utmContent: code,
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.publications.push(newPub);
    this.save(db);
    return newPub;
  }

  updatePublication(id, data) {
    const db = this.read();
    db.publications = db.publications || [];
    const idx = db.publications.findIndex(p => p.id === id);
    if (idx === -1) return null;

    if (data.code && data.code.trim().toUpperCase() !== db.publications[idx].code) {
      const newCode = data.code.trim().toUpperCase();
      if (db.publications.some(p => p.id !== id && p.code === newCode)) {
        throw new Error(`El código "${newCode}" ya está en uso por otra publicación.`);
      }
      data.code = newCode;
    }

    const current = db.publications[idx];
    db.publications[idx] = {
      ...current,
      ...data,
      id: current.id,
      code: data.code ? data.code.trim().toUpperCase() : current.code,
      adSpend: data.adSpend !== undefined ? Math.max(0, Number(data.adSpend) || 0) : current.adSpend,
      updatedAt: new Date().toISOString()
    };

    this.save(db);
    return db.publications[idx];
  }

  deletePublication(id) {
    const db = this.read();
    db.publications = db.publications || [];
    const idx = db.publications.findIndex(p => p.id === id);
    if (idx === -1) return false;
    db.publications.splice(idx, 1);
    this.save(db);
    return true;
  }

  // ==========================================
  // ORDERS & WORKSHOP SALES
  // ==========================================
  getOrders(filters = {}) {
    const db = this.read();
    let orders = db.orders || [];

    if (filters.status && filters.status !== 'all') {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters.pubCode && filters.pubCode !== 'all') {
      orders = orders.filter(o => o.pubCode === filters.pubCode);
    }
    if (filters.productId && filters.productId !== 'all') {
      orders = orders.filter(o => o.productId === filters.productId);
    }
    if (filters.startDate) {
      orders = orders.filter(o => (o.date || o.createdAt?.split('T')[0]) >= filters.startDate);
    }
    if (filters.endDate) {
      orders = orders.filter(o => (o.date || o.createdAt?.split('T')[0]) <= filters.endDate);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(o =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.productName && o.productName.toLowerCase().includes(q)) ||
        (o.pubCode && o.pubCode.toLowerCase().includes(q)) ||
        (o.customerCode && o.customerCode.toLowerCase().includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    return orders.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }

  getOrderById(id) {
    const db = this.read();
    return (db.orders || []).find(o => o.id === id || o.orderNumber === id);
  }

  createOrder(data) {
    const db = this.read();
    db.orders = db.orders || [];

    // Order number
    let orderNumber = (data.orderNumber || '').trim().toUpperCase();
    if (!orderNumber) {
      // Se toma el número más alto usado (no el conteo): evita repetir folios si se borran pedidos
      const year = new Date().getFullYear();
      const maxSeq = db.orders.reduce((max, o) => {
        const m = /^PED-(\d{4})-(\d+)$/.exec(String(o.orderNumber || ''));
        return m && Number(m[1]) === year ? Math.max(max, Number(m[2])) : max;
      }, 0);
      orderNumber = `PED-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
    }

    // Customer code & recurrence (anonymized/masked, protecting personal data)
    let rawCustomer = (data.customerCode || '').trim();
    let customerCode = rawCustomer;
    if (!customerCode) {
      customerCode = `CLI-${Math.round(Math.random() * 8999 + 1000)}`;
    } else {
      const cleanDigits = customerCode.replace(/\D/g, '');
      if (cleanDigits.length >= 7) {
        customerCode = `CLI-${cleanDigits.slice(-4)}`;
      } else if (!customerCode.toUpperCase().startsWith('CLI-')) {
        customerCode = `CLI-${customerCode.substring(0, 4).toUpperCase()}`;
      }
    }

    // Determine recurrence and preserve firstTouchPubCode
    const prevOrders = db.orders.filter(o => o.customerCode === customerCode);
    const isRecurringCustomer = prevOrders.length > 0;
    const firstTouchPubCode = prevOrders.length > 0 
      ? (prevOrders[0].firstTouchPubCode || prevOrders[0].pubCode) 
      : (data.pubCode || 'desconocido');

    // Immutable cost breakdown snapshot
    const cb = data.costBreakdown || {};
    const materialsCost = Math.max(0, Number(cb.materialsCost) || 0);
    const laborCost = Math.max(0, Number(cb.laborCost) || 0);
    const equipmentCost = Math.max(0, Number(cb.equipmentCost) || 0);
    const packagingCost = Math.max(0, Number(cb.packagingCost) || 0);
    const commissionsCost = Math.max(0, Number(cb.commissionsCost) || 0);
    const absorbedShippingCost = Math.max(0, Number(cb.absorbedShippingCost) || 0);
    const costStatus = cb.costStatus === 'comprobado' ? 'comprobado' : 'estimado';

    const hasCosts = data.hasCosts !== false && (
      materialsCost > 0 || laborCost > 0 || equipmentCost > 0 ||
      packagingCost > 0 || commissionsCost > 0 || absorbedShippingCost > 0 ||
      cb.hasCosts === true
    );
    const totalCost = hasCosts
      ? Math.round((materialsCost + laborCost + equipmentCost + packagingCost + commissionsCost + absorbedShippingCost) * 100) / 100
      : null;

    const newOrder = {
      id: `ord-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      orderNumber,
      date: data.date || new Date().toISOString().split('T')[0],
      pubCode: data.pubCode || 'desconocido',
      firstTouchPubCode,
      customerCode,
      isRecurringCustomer,
      productId: data.productId || 'personalizado',
      productName: data.productName?.trim() || 'Proyecto a la medida',
      quantity: Math.max(1, Number(data.quantity) || 1),
      unitPrice: Math.max(0, Number(data.unitPrice) || (Number(data.amount) > 0 && Number(data.quantity) > 0
        ? Math.round((Number(data.amount) / Math.max(1, Number(data.quantity))) * 100) / 100
        : 0)),
      amount: Math.max(0, Number(data.amount) || 0),
      deliveryDate: data.deliveryDate || null,
      deliveryStatus: data.deliveryStatus === 'entregado' ? 'entregado' : 'pendiente',
      deliveredAt: data.deliveredAt || null,
      advancePaid: Boolean(data.advancePaid),
      advanceReceived: Math.max(0, Number(data.advanceReceived) || 0),
      amountPaid: Math.max(0, Number(data.amountPaid) || 0),
      terminalSurcharge: Math.max(0, Number(data.terminalSurcharge) || 0),
      payments: Array.isArray(data.payments) ? data.payments : [],
      advanceAt: data.advanceAt || null,
      paidAt: data.paidAt || null,
      materialsDeducted: false,
      status: data.status || 'consulta', // 'consulta' | 'cotizado' | 'confirmado' | 'pagado' | 'cancelado'
      costBreakdown: {
        materialsCost,
        laborCost,
        equipmentCost,
        packagingCost,
        commissionsCost,
        absorbedShippingCost,
        costStatus
      },
      hasCosts: Boolean(hasCosts),
      totalCost,
      couponCode: data.couponCode ? data.couponCode.trim().toUpperCase() : (data.coupon ? String(data.coupon).trim().toUpperCase() : null),
      couponCategory: data.couponCategory || (data.couponCode && (data.couponCode.toUpperCase().startsWith('ARCADE') || data.couponCode.toUpperCase().startsWith('TALLER50') || data.couponCode.toUpperCase().startsWith('VIP15') || data.couponCode.toUpperCase().startsWith('MAESTRO')) ? 'arcade' : (data.couponCode ? 'store' : null)),
      couponDiscount: Math.max(0, Number(data.couponDiscount) || 0),
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    this.save(db);

    // Auto-record coupon usage if order included a valid coupon
    if (newOrder.couponCode) {
      try {
        this.recordCouponUse(newOrder.couponCode, {
          orderNumber: newOrder.orderNumber,
          amount: newOrder.amount,
          discount: newOrder.couponDiscount
        });
      } catch (e) {
        console.warn('Aviso: cupón no encontrado para registrar uso:', e.message);
      }
    }

    return newOrder;
  }

  updateOrder(id, data) {
    const db = this.read();
    db.orders = db.orders || [];
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;

    const current = db.orders[idx];

    let rawCustomer = data.customerCode !== undefined ? data.customerCode.trim() : current.customerCode;
    let customerCode = rawCustomer;
    if (customerCode) {
      const cleanDigits = customerCode.replace(/\D/g, '');
      if (cleanDigits.length >= 7) {
        customerCode = `CLI-${cleanDigits.slice(-4)}`;
      } else if (!customerCode.toUpperCase().startsWith('CLI-')) {
        customerCode = `CLI-${customerCode.substring(0, 4).toUpperCase()}`;
      }
    }

    const prevOrders = db.orders.filter(o => o.id !== id && o.customerCode === customerCode);
    const isRecurringCustomer = prevOrders.length > 0;
    const firstTouchPubCode = prevOrders.length > 0
      ? (prevOrders[0].firstTouchPubCode || prevOrders[0].pubCode)
      : (data.firstTouchPubCode || current.firstTouchPubCode || data.pubCode || current.pubCode);

    let costBreakdown = current.costBreakdown || {};
    let totalCost = current.totalCost;
    let hasCosts = current.hasCosts;

    if (data.costBreakdown !== undefined) {
      const cb = data.costBreakdown;
      const materialsCost = Math.max(0, Number(cb.materialsCost) || 0);
      const laborCost = Math.max(0, Number(cb.laborCost) || 0);
      const equipmentCost = Math.max(0, Number(cb.equipmentCost) || 0);
      const packagingCost = Math.max(0, Number(cb.packagingCost) || 0);
      const commissionsCost = Math.max(0, Number(cb.commissionsCost) || 0);
      const absorbedShippingCost = Math.max(0, Number(cb.absorbedShippingCost) || 0);
      const costStatus = cb.costStatus === 'comprobado' ? 'comprobado' : 'estimado';

      hasCosts = data.hasCosts !== false && (
        materialsCost > 0 || laborCost > 0 || equipmentCost > 0 ||
        packagingCost > 0 || commissionsCost > 0 || absorbedShippingCost > 0 ||
        cb.hasCosts === true
      );
      totalCost = hasCosts
        ? Math.round((materialsCost + laborCost + equipmentCost + packagingCost + commissionsCost + absorbedShippingCost) * 100) / 100
        : null;

      costBreakdown = {
        materialsCost,
        laborCost,
        equipmentCost,
        packagingCost,
        commissionsCost,
        absorbedShippingCost,
        costStatus
      };
    }

    const {
      revertStock: _revertStock,
      consumeStock: _consumeStock,
      ...payload
    } = data;

    db.orders[idx] = {
      ...current,
      ...payload,
      id: current.id,
      customerCode,
      isRecurringCustomer,
      firstTouchPubCode,
      costBreakdown,
      hasCosts: Boolean(hasCosts),
      amount: data.amount !== undefined ? Math.max(0, Number(data.amount) || 0) : current.amount,
      quantity: data.quantity !== undefined ? Math.max(1, Number(data.quantity) || 1) : current.quantity,
      unitPrice: data.unitPrice !== undefined
        ? Math.max(0, Math.round((Number(data.unitPrice) || 0) * 100) / 100)
        : (Number(current.unitPrice) || 0),
      advanceReceived: data.advanceReceived !== undefined
        ? Math.max(0, Math.round((Number(data.advanceReceived) || 0) * 100) / 100)
        : (Number(current.advanceReceived) || 0),
      amountPaid: data.amountPaid !== undefined
        ? Math.max(0, Math.round((Number(data.amountPaid) || 0) * 100) / 100)
        : (Number(current.amountPaid) || 0),
      terminalSurcharge: data.terminalSurcharge !== undefined
        ? Math.max(0, Math.round((Number(data.terminalSurcharge) || 0) * 100) / 100)
        : (Number(current.terminalSurcharge) || 0),
      payments: Array.isArray(data.payments) ? data.payments : (Array.isArray(current.payments) ? current.payments : []),
      deliveryStatus: data.deliveryStatus !== undefined
        ? (data.deliveryStatus === 'entregado' ? 'entregado' : 'pendiente')
        : (current.deliveryStatus || 'pendiente'),
      couponCode: data.couponCode !== undefined ? (data.couponCode ? data.couponCode.trim().toUpperCase() : null) : (current.couponCode || null),
      couponCategory: data.couponCategory !== undefined ? data.couponCategory : (current.couponCategory || null),
      couponDiscount: data.couponDiscount !== undefined ? Math.max(0, Number(data.couponDiscount) || 0) : (current.couponDiscount || 0),
      updatedAt: new Date().toISOString()
    };

    this.save(db);
    return db.orders[idx];
  }

  deleteOrder(id) {
    const db = this.read();
    db.orders = db.orders || [];
    const idx = db.orders.findIndex(o => o.id === id);
    if (idx === -1) return false;
    db.orders.splice(idx, 1);
    this.save(db);
    return true;
  }

  // ==========================================
  // TRACKING EVENTS (VISITS & WHATSAPP CLICKS)
  // ==========================================
  recordPubTracking(pubCode, eventType, metadata = {}) {
    const db = this.read();
    db.pubTracking = db.pubTracking || [];

    const event = {
      id: `trk-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      pubCode: (pubCode || 'desconocido').trim().toUpperCase(),
      type: eventType, // 'visit' | 'whatsapp_click'
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    db.pubTracking.push(event);
    if (db.pubTracking.length > 5000) {
      db.pubTracking = db.pubTracking.slice(-5000);
    }
    this.save(db);
    return event;
  }

  // ==========================================
  // SALES & PUBLICATIONS MARKETING REPORT
  // ==========================================
  getSalesReport(filters = {}) {
    const db = this.read();
    const publications = db.publications || [];
    const orders = db.orders || [];
    const tracking = db.pubTracking || [];

    // Filter publications
    let filteredPubs = [...publications];
    if (filters.socialNetwork && filters.socialNetwork !== 'all') {
      filteredPubs = filteredPubs.filter(p => p.socialNetwork === filters.socialNetwork);
    }
    if (filters.productId && filters.productId !== 'all') {
      filteredPubs = filteredPubs.filter(p => p.productId === filters.productId);
    }
    if (filters.startDate) {
      filteredPubs = filteredPubs.filter(p => p.date >= filters.startDate);
    }
    if (filters.endDate) {
      filteredPubs = filteredPubs.filter(p => p.date <= filters.endDate);
    }

    // Filter tracking events by date range
    let filteredTracking = [...tracking];
    if (filters.startDate) {
      filteredTracking = filteredTracking.filter(t => t.timestamp.split('T')[0] >= filters.startDate);
    }
    if (filters.endDate) {
      filteredTracking = filteredTracking.filter(t => t.timestamp.split('T')[0] <= filters.endDate);
    }

    // Filter orders by date & product
    let filteredOrders = [...orders];
    if (filters.startDate) {
      filteredOrders = filteredOrders.filter(o => (o.date || o.createdAt.split('T')[0]) >= filters.startDate);
    }
    if (filters.endDate) {
      filteredOrders = filteredOrders.filter(o => (o.date || o.createdAt.split('T')[0]) <= filters.endDate);
    }
    if (filters.productId && filters.productId !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.productId === filters.productId);
    }

    // Per publication rows
    const pubRows = filteredPubs.map(pub => {
      const codeUpper = pub.code.toUpperCase();
      const pubTracking = filteredTracking.filter(t => t.pubCode === codeUpper);
      const visits = pubTracking.filter(t => t.type === 'visit').length;
      const whatsappClicks = pubTracking.filter(t => t.type === 'whatsapp_click').length;

      // Primary attribution: 1 order belongs to 1 publication
      const pubOrders = filteredOrders.filter(o => (o.pubCode || '').toUpperCase() === codeUpper);

      const inquiries = pubOrders.filter(o => o.status === 'consulta').length;
      const quotes = pubOrders.filter(o => o.status === 'cotizado').length;
      const confirmed = pubOrders.filter(o => o.status === 'confirmado').length;
      const paidOrdersList = pubOrders.filter(o => o.status === 'pagado');
      const paidOrders = paidOrdersList.length;
      const canceled = pubOrders.filter(o => o.status === 'cancelado').length;

      const revenue = paidOrdersList.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);

      // Costs & Profit calculation
      const hasMissingCosts = paidOrdersList.some(o => !o.hasCosts || o.totalCost === null || o.totalCost === undefined);
      let totalProductionCost = 0;
      let netProfit = null;

      if (!hasMissingCosts) {
        totalProductionCost = paidOrdersList.reduce((acc, o) => acc + (Number(o.totalCost) || 0), 0);
        netProfit = Math.round((revenue - totalProductionCost - (pub.adSpend || 0)) * 100) / 100;
      }

      // Conversion rate: visitas a pedidos pagados
      const conversionRate = visits > 0 ? Math.round((paidOrders / visits) * 1000) / 10 : 0;

      // CPA (Costo publicitario por pedido)
      let cpa = null;
      let cpaLabel = 'No disponible';
      if (paidOrders > 0) {
        if (pub.adSpend === 0) {
          cpa = 0;
          cpaLabel = '$0.00 (Orgánico)';
        } else {
          cpa = Math.round((pub.adSpend / paidOrders) * 100) / 100;
          cpaLabel = `$${cpa.toFixed(2)}`;
        }
      }

      // Customer recurrence analysis (without PII)
      const recurringOrders = paidOrdersList.filter(o => o.isRecurringCustomer).length;
      const newCustomerOrders = paidOrdersList.filter(o => !o.isRecurringCustomer).length;

      return {
        id: pub.id,
        code: pub.code,
        name: pub.name,
        date: pub.date,
        socialNetwork: pub.socialNetwork,
        postUrl: pub.postUrl,
        productId: pub.productId,
        productName: pub.productName,
        adSpend: pub.adSpend || 0,
        utmSource: pub.utmSource,
        utmMedium: pub.utmMedium,
        utmCampaign: pub.utmCampaign,
        utmContent: pub.utmContent,
        visits,
        whatsappClicks,
        inquiries,
        quotes,
        confirmed,
        paidOrders,
        canceled,
        totalOrders: pubOrders.length,
        revenue: Math.round(revenue * 100) / 100,
        totalProductionCost: Math.round(totalProductionCost * 100) / 100,
        hasMissingCosts,
        netProfit,
        conversionRate,
        cpa,
        cpaLabel,
        recurringOrders,
        newCustomerOrders
      };
    });

    // Also account for Orders with "Desconocido" or unassigned publications
    const knownPubCodes = new Set(publications.map(p => p.code.toUpperCase()));
    const unassignedOrders = filteredOrders.filter(o => !o.pubCode || o.pubCode === 'desconocido' || !knownPubCodes.has(o.pubCode.toUpperCase()));
    const unassignedTracking = filteredTracking.filter(t => !t.pubCode || t.pubCode === 'DESCONOCIDO' || !knownPubCodes.has(t.pubCode));

    const unassignedVisits = unassignedTracking.filter(t => t.type === 'visit').length;
    const unassignedWaClicks = unassignedTracking.filter(t => t.type === 'whatsapp_click').length;
    const unassignedPaidList = unassignedOrders.filter(o => o.status === 'pagado');
    const unassignedPaid = unassignedPaidList.length;
    const unassignedRevenue = unassignedPaidList.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    const unassignedMissingCosts = unassignedPaidList.some(o => !o.hasCosts || o.totalCost === null || o.totalCost === undefined);
    let unassignedProdCost = 0;
    let unassignedNetProfit = null;
    if (!unassignedMissingCosts) {
      unassignedProdCost = unassignedPaidList.reduce((acc, o) => acc + (Number(o.totalCost) || 0), 0);
      unassignedNetProfit = Math.round((unassignedRevenue - unassignedProdCost) * 100) / 100;
    }

    const unassignedRow = {
      id: 'pub-unassigned',
      code: 'DESCONOCIDO',
      name: 'Venta Directa / Taller / Tráfico Orgánico',
      date: '-',
      socialNetwork: 'directo',
      postUrl: '',
      productId: 'general',
      productName: 'Varios',
      adSpend: 0,
      visits: unassignedVisits,
      whatsappClicks: unassignedWaClicks,
      inquiries: unassignedOrders.filter(o => o.status === 'consulta').length,
      quotes: unassignedOrders.filter(o => o.status === 'cotizado').length,
      confirmed: unassignedOrders.filter(o => o.status === 'confirmado').length,
      paidOrders: unassignedPaid,
      canceled: unassignedOrders.filter(o => o.status === 'cancelado').length,
      totalOrders: unassignedOrders.length,
      revenue: Math.round(unassignedRevenue * 100) / 100,
      totalProductionCost: Math.round(unassignedProdCost * 100) / 100,
      hasMissingCosts: unassignedMissingCosts,
      netProfit: unassignedNetProfit,
      conversionRate: unassignedVisits > 0 ? Math.round((unassignedPaid / unassignedVisits) * 1000) / 10 : 0,
      cpa: null,
      cpaLabel: 'No disponible',
      recurringOrders: unassignedPaidList.filter(o => o.isRecurringCustomer).length,
      newCustomerOrders: unassignedPaidList.filter(o => !o.isRecurringCustomer).length,
      isUnassigned: true
    };

    // Global totals
    const allRows = [...pubRows];
    if (unassignedOrders.length > 0 || unassignedVisits > 0 || unassignedWaClicks > 0) {
      allRows.push(unassignedRow);
    }

    const totalVisits = allRows.reduce((sum, r) => sum + r.visits, 0);
    const totalWhatsAppClicks = allRows.reduce((sum, r) => sum + r.whatsappClicks, 0);
    const totalInquiries = allRows.reduce((sum, r) => sum + r.inquiries, 0);
    const totalQuotes = allRows.reduce((sum, r) => sum + r.quotes, 0);
    const totalConfirmed = allRows.reduce((sum, r) => sum + r.confirmed, 0);
    const totalPaidOrders = allRows.reduce((sum, r) => sum + r.paidOrders, 0);
    const totalCanceled = allRows.reduce((sum, r) => sum + r.canceled, 0);
    const totalRevenue = allRows.reduce((sum, r) => sum + r.revenue, 0);
    const totalAdSpend = pubRows.reduce((sum, r) => sum + r.adSpend, 0);
    const anyMissingCost = allRows.some(r => r.paidOrders > 0 && r.hasMissingCosts);
    const totalProductionCost = allRows.reduce((sum, r) => sum + (r.totalProductionCost || 0), 0);
    const totalNetProfit = anyMissingCost ? null : Math.round((totalRevenue - totalProductionCost - totalAdSpend) * 100) / 100;
    const globalConversionRate = totalVisits > 0 ? Math.round((totalPaidOrders / totalVisits) * 1000) / 10 : 0;
    const totalRecurringOrders = allRows.reduce((sum, r) => sum + r.recurringOrders, 0);
    const totalNewCustomerOrders = allRows.reduce((sum, r) => sum + r.newCustomerOrders, 0);

    return {
      rows: pubRows,
      unassignedRow,
      summary: {
        totalPublications: publications.length,
        filteredPublications: pubRows.length,
        totalVisits,
        totalWhatsAppClicks,
        totalInquiries,
        totalQuotes,
        totalConfirmed,
        totalPaidOrders,
        totalCanceled,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalAdSpend: Math.round(totalAdSpend * 100) / 100,
        totalProductionCost: Math.round(totalProductionCost * 100) / 100,
        totalNetProfit,
        anyMissingCost,
        globalConversionRate,
        totalRecurringOrders,
        totalNewCustomerOrders,
        globalCpa: totalPaidOrders > 0 ? (Math.round((totalAdSpend / totalPaidOrders) * 100) / 100) : null
      }
    };
  }

  // ==========================================
  // RAW MATERIALS & WORKSHOP OPERATIONAL COSTS
  // ==========================================
  getRawMaterials() {
    const db = this.read();
    return db.rawMaterials || [];
  }

  getRawMaterialById(id) {
    const db = this.read();
    return (db.rawMaterials || []).find(m => m.id === id);
  }

  createRawMaterial(data) {
    const db = this.read();
    db.rawMaterials = db.rawMaterials || [];

    const newMaterial = {
      id: `mat-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      name: data.name?.trim() || 'Nueva Materia Prima',
      category: data.category || '3d',
      materialType: data.materialType?.trim() || 'General',
      color: data.color?.trim() || 'N/A',
      finish: data.finish?.trim() || 'Estándar',
      unit: data.unit || 'pieza',
      packageQuantity: data.packageQuantity !== undefined && data.packageQuantity !== '' ? Math.max(0.001, Number(data.packageQuantity) || 1) : 1,
      packageMeasurement: data.packageMeasurement?.trim() || 'pza',
      currentStock: Math.max(0, Number(data.currentStock) || 0),
      minStockAlert: Math.max(0, Number(data.minStockAlert) || 1),
      costPerUnit: Math.max(0, Number(data.costPerUnit) || 0),
      supplierId: data.supplierId?.trim() || '',
      supplier: data.supplier?.trim() || '',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.rawMaterials.push(newMaterial);
    this.save(db);
    return newMaterial;
  }

  updateRawMaterial(id, data) {
    const db = this.read();
    db.rawMaterials = db.rawMaterials || [];
    const idx = db.rawMaterials.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const current = db.rawMaterials[idx];
    db.rawMaterials[idx] = {
      ...current,
      ...data,
      id: current.id,
      packageQuantity: data.packageQuantity !== undefined && data.packageQuantity !== '' ? Math.max(0.001, Number(data.packageQuantity) || 1) : current.packageQuantity,
      packageMeasurement: data.packageMeasurement !== undefined ? String(data.packageMeasurement).trim() : current.packageMeasurement,
      currentStock: data.currentStock !== undefined ? Math.max(0, Number(data.currentStock) || 0) : current.currentStock,
      minStockAlert: data.minStockAlert !== undefined ? Math.max(0, Number(data.minStockAlert) || 0) : current.minStockAlert,
      costPerUnit: data.costPerUnit !== undefined ? Math.max(0, Number(data.costPerUnit) || 0) : current.costPerUnit,
      updatedAt: new Date().toISOString()
    };

    this.save(db);
    return db.rawMaterials[idx];
  }

  updateRawMaterialStock(id, newStock) {
    const db = this.read();
    db.rawMaterials = db.rawMaterials || [];
    const idx = db.rawMaterials.findIndex(m => m.id === id);
    if (idx === -1) return null;

    db.rawMaterials[idx].currentStock = Math.max(0, Math.round(Number(newStock) * 100) / 100);
    db.rawMaterials[idx].updatedAt = new Date().toISOString();

    this.save(db);
    return db.rawMaterials[idx];
  }

  deleteRawMaterial(id) {
    const db = this.read();
    db.rawMaterials = db.rawMaterials || [];
    const idx = db.rawMaterials.findIndex(m => m.id === id);
    if (idx === -1) return false;
    db.rawMaterials.splice(idx, 1);
    this.save(db);
    return true;
  }

  // ==========================================
  // MANUFACTURING RECIPES & STOCK DEDUCTION
  // ==========================================
  getProductionLogs(limit = 100) {
    const db = this.read();
    const logs = db.productionLogs || [];
    return logs.slice(-limit).reverse();
  }

  simulateRecipeProduction(productId, units = 1, customRecipe = null) {
    const db = this.read();
    const product = db.products.find(p => p.id === productId || p.code === productId);
    const rawRecipe = customRecipe || product?.manufacturingRecipe || product?.costBreakdown?.manufacturingRecipe;
    const recipeItems = Array.isArray(rawRecipe) ? rawRecipe : (rawRecipe?.items || []);

    if (!Array.isArray(recipeItems) || recipeItems.length === 0) {
      return {
        feasible: false,
        hasRecipe: false,
        message: 'El producto no tiene una receta de manufactura configurada.',
        items: []
      };
    }

    const multiplier = Math.max(1, Number(units) || 1);
    const itemsEvaluation = [];
    let allSufficient = true;
    let maxPossibleUnits = Infinity;
    let totalEstimatedCost = 0;
    let totalNetCost = 0;
    let totalWasteCost = 0;

    for (const item of recipeItems) {
      const mat = (db.rawMaterials || []).find(m => m.id === item.materialId || m.id === item.rawMaterialId || (item.name && m.name.toLowerCase().trim() === item.name.toLowerCase().trim()));
      const netQty = Number(item.netQuantity) || 0;
      const wasteQty = Number(item.wasteQuantity) || 0;
      const totalPerUnit = (netQty + wasteQty) || Number(item.totalQuantity) || Number(item.quantity) || 0;
      const totalRequired = totalPerUnit * multiplier;

      const pkgInfo = mat ? parseMaterialPackage(mat) : { packageQuantity: 1, packageMeasurement: item.unit || 'pza' };
      const computedUnitCost = mat && Number(mat.costPerUnit) > 0 ? (Number(mat.costPerUnit) / (pkgInfo.packageQuantity || 1)) : (Number(item.unitCost) || 0);
      const unitCost = Number(item.unitCost) > 0 ? Number(item.unitCost) : computedUnitCost;

      const lineTotalCost = totalRequired * unitCost;
      const lineNetCost = (netQty * multiplier) * unitCost;
      const lineWasteCost = (wasteQty * multiplier) * unitCost;

      totalEstimatedCost += lineTotalCost;
      totalNetCost += lineNetCost;
      totalWasteCost += lineWasteCost;

      if (!mat) {
        itemsEvaluation.push({
          materialId: item.materialId || '',
          name: item.name || 'Insumo no catalogado',
          category: item.category || 'general',
          netQuantity: netQty,
          wasteQuantity: wasteQty,
          wasteType: item.wasteType || 'standard',
          totalPerUnit,
          totalRequired,
          unit: item.unit || 'pza',
          unitCost,
          lineCost: Math.round(lineTotalCost * 100) / 100,
          currentStock: 0,
          stockUnit: item.unit || 'pza',
          stockDeductionPerUnit: 0,
          totalStockDeduction: 0,
          sufficient: false,
          missingStock: totalRequired,
          maxUnits: 0,
          untracked: true
        });
        allSufficient = false;
        maxPossibleUnits = 0;
        continue;
      }

      const deductionPerUnit = calculateMaterialStockDeduction(mat, totalPerUnit, item.unit);
      const totalStockDeduction = deductionPerUnit * multiplier;
      const currentStock = Number(mat.currentStock) || 0;
      const sufficient = currentStock >= totalStockDeduction;
      const possibleUnitsWithMat = deductionPerUnit > 0 ? Math.floor(currentStock / deductionPerUnit) : 9999;
      if (possibleUnitsWithMat < maxPossibleUnits) maxPossibleUnits = possibleUnitsWithMat;
      if (!sufficient) allSufficient = false;

      itemsEvaluation.push({
        materialId: mat.id,
        name: mat.name,
        category: mat.category,
        color: mat.color,
        netQuantity: netQty,
        wasteQuantity: wasteQty,
        wasteType: item.wasteType || 'standard',
        totalPerUnit,
        totalRequired,
        unit: item.unit || 'pza',
        unitCost,
        lineCost: Math.round(lineTotalCost * 100) / 100,
        currentStock,
        stockUnit: mat.unit,
        stockDeductionPerUnit: Math.round(deductionPerUnit * 10000) / 10000,
        totalStockDeduction: Math.round(totalStockDeduction * 10000) / 10000,
        remainingStock: Math.max(0, Math.round((currentStock - totalStockDeduction) * 10000) / 10000),
        sufficient,
        missingStock: sufficient ? 0 : Math.round((totalStockDeduction - currentStock) * 10000) / 10000,
        maxUnits: possibleUnitsWithMat
      });
    }

    const machineMinutes = Number(rawRecipe.manufacturingTimeMinutes) || 0;
    const machineWatts = Number(rawRecipe.machinePowerWatts) || 0;
    const kwhCost = Number(rawRecipe.kwhCost) > 0 ? Number(rawRecipe.kwhCost) : 3.50;
    const energyCostPerUnit = (machineWatts > 0 && machineMinutes > 0)
      ? Math.round(((machineWatts / 1000) * (machineMinutes / 60) * kwhCost) * 100) / 100
      : (Number(rawRecipe.energyCost) || 0);
    const totalEnergyCost = Math.round(energyCostPerUnit * multiplier * 100) / 100;

    const laborMinutes = Number(rawRecipe.laborTimeMinutes) || 0;
    const laborRate = Number(rawRecipe.laborRatePerHour) || 0;
    const laborCostPerUnit = (laborRate > 0 && laborMinutes > 0)
      ? Math.round(((laborMinutes / 60) * laborRate) * 100) / 100
      : (Number(rawRecipe.laborCost) || 0);
    const totalLaborCost = Math.round(laborCostPerUnit * multiplier * 100) / 100;

    const grandTotalCost = Math.round((totalEstimatedCost + totalEnergyCost + totalLaborCost) * 100) / 100;
    const grandUnitCost = Math.round((grandTotalCost / multiplier) * 100) / 100;

    return {
      feasible: allSufficient,
      hasRecipe: true,
      requestedUnits: multiplier,
      maxPossibleUnits: maxPossibleUnits === Infinity ? 0 : maxPossibleUnits,
      totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
      totalNetCost: Math.round(totalNetCost * 100) / 100,
      totalWasteCost: Math.round(totalWasteCost * 100) / 100,
      wastePercentAverage: totalEstimatedCost > 0 ? Math.round((totalWasteCost / totalEstimatedCost) * 1000) / 10 : 0,
      unitCost: Math.round((totalEstimatedCost / multiplier) * 100) / 100,
      manufacturingTimeMinutes: machineMinutes,
      machinePowerWatts: machineWatts,
      kwhCost,
      energyCostPerUnit,
      totalEnergyCost,
      laborTimeMinutes: laborMinutes,
      laborRatePerHour: laborRate,
      laborCostPerUnit,
      totalLaborCost,
      grandTotalCost,
      grandUnitCost,
      packagingAndShipping: rawRecipe.packagingAndShipping || { enabled: false, packagingType: '', packagingCost: 0, shippingCost: 0 },
      items: itemsEvaluation
    };
  }

  deductRecipeMaterials(productId, units = 1, options = {}) {
    const db = this.read();
    db.rawMaterials = db.rawMaterials || [];
    db.productionLogs = db.productionLogs || [];

    const product = db.products.find(p => p.id === productId || p.code === productId);
    const rawRecipe = options.customRecipe || product?.manufacturingRecipe || product?.costBreakdown?.manufacturingRecipe;
    const recipeItems = Array.isArray(rawRecipe) ? rawRecipe : (rawRecipe?.items || []);

    if (!Array.isArray(recipeItems) || recipeItems.length === 0) {
      return {
        success: false,
        error: 'El producto no tiene una receta de manufactura configurada.'
      };
    }

    const multiplier = Math.max(1, Number(units) || 1);
    const deductions = [];
    const now = new Date().toISOString();

    // Paso 1: validar TODO antes de escribir. Si un insumo no existe, no se descuenta nada.
    // Los renglones generados desde presupuestos agregados (lotes) llegan con `estimated: true`
    // y NO representan un insumo real de almacén; se registran como estimados y no bloquean la producción.
    const sameName = (a, b) => String(a || '').toLowerCase().trim() === String(b || '').toLowerCase().trim();
    const plan = [];
    const missing = [];
    const estimatedSkipped = [];
    for (const item of recipeItems) {
      const idx = db.rawMaterials.findIndex(m =>
        (item.materialId && m.id === item.materialId) ||
        (item.rawMaterialId && m.id === item.rawMaterialId) ||
        (!item.materialId && !item.rawMaterialId && item.name && sameName(m.name, item.name))
      );
      if (idx === -1) {
        const isEstimatedLine = item.estimated === true || item.isEstimated === true;
        if (isEstimatedLine) {
          estimatedSkipped.push(item);
          continue;
        }
        missing.push(item.name || item.materialId || 'insumo sin nombre');
      } else {
        plan.push({ item, idx });
      }
    }
    if (missing.length > 0) {
      return {
        success: false,
        error: `No se descontó nada: estos insumos de la receta ya no existen en almacén: ${missing.join(', ')}. Corrige la receta antes de producir.`,
        missing
      };
    }

    for (const { item, idx } of plan) {
      const mat = db.rawMaterials[idx];
      const netQty = Number(item.netQuantity) || 0;
      const wasteQty = Number(item.wasteQuantity) || 0;
      const totalPerUnit = (netQty + wasteQty) || Number(item.totalQuantity) || Number(item.quantity) || 0;
      const totalRequired = totalPerUnit * multiplier;
      const deductionAmount = calculateMaterialStockDeduction(mat, totalPerUnit, item.unit) * multiplier;
      const prevStock = Number(mat.currentStock) || 0;
      const newStock = Math.max(0, Math.round((prevStock - deductionAmount) * 10000) / 10000);

      db.rawMaterials[idx].currentStock = newStock;
      db.rawMaterials[idx].updatedAt = now;

      const record = {
        materialId: mat.id,
        materialName: mat.name,
        category: mat.category,
        consumedAmount: totalRequired,
        consumedUnit: item.unit,
        netConsumed: netQty * multiplier,
        wasteConsumed: wasteQty * multiplier,
        wasteType: item.wasteType || 'standard',
        stockDeducted: Math.round(deductionAmount * 10000) / 10000,
        stockUnit: mat.unit,
        previousStock: prevStock,
        newStock
      };

      deductions.push(record);

      db.productionLogs.push({
        id: `prod-log-${Date.now()}-${Math.round(Math.random() * 10000)}`,
        timestamp: now,
        action: 'deduct',
        productId: product?.id || productId,
        productName: product?.name || options.productName || 'Producto',
        productCode: product?.code || options.productCode || '',
        orderId: options.orderId || null,
        orderNumber: options.orderNumber || null,
        quantityProduced: multiplier,
        reason: options.reason || 'Consumo por orden de fabricación en taller',
        deduction: record
      });
    }

    this.save(db);

    const skipped = estimatedSkipped.map(i => ({
      name: i.name,
      category: i.category || '',
      totalQuantity: i.totalQuantity,
      unitCost: i.unitCost,
      totalCost: i.totalCost,
      reason: 'Renglón presupuestario (lote) sin insumo físico vinculado; el costo ya se incluye en la receta.'
    }));

    return {
      success: true,
      productId: product?.id || productId,
      productName: product?.name || 'Producto',
      unitsProduced: multiplier,
      deductions,
      skippedEstimated: skipped,
      estimatedCount: skipped.length,
      updatedRawMaterials: db.rawMaterials,
      timestamp: now
    };
  }

  revertRecipeDeduction(orderId) {
    const db = this.read();
    db.rawMaterials = db.rawMaterials || [];
    db.productionLogs = db.productionLogs || [];

    const orderLogs = db.productionLogs.filter(l => l.orderId === orderId && l.action === 'deduct' && !l.revertedAt);
    if (orderLogs.length === 0) {
      return { success: false, message: 'No hay consumos pendientes de revertir en este pedido.' };
    }

    const restoredItems = [];
    const now = new Date().toISOString();

    for (const log of orderLogs) {
      const matIdx = db.rawMaterials.findIndex(m => m.id === log.deduction?.materialId);
      if (matIdx !== -1 && log.deduction?.stockDeducted > 0) {
        const curStock = Number(db.rawMaterials[matIdx].currentStock) || 0;
        const restoredStock = Math.round((curStock + log.deduction.stockDeducted) * 10000) / 10000;
        db.rawMaterials[matIdx].currentStock = restoredStock;
        db.rawMaterials[matIdx].updatedAt = now;
        restoredItems.push({
          materialId: log.deduction.materialId,
          name: log.deduction.materialName,
          restoredAmount: log.deduction.stockDeducted,
          newStock: restoredStock
        });
      }
      log.revertedAt = now;
    }

    db.productionLogs.push({
      id: `prod-revert-${Date.now()}`,
      timestamp: now,
      action: 'revert',
      orderId,
      reason: 'Reversión de consumo por cancelación o modificación de pedido',
      restoredItems
    });

    this.save(db);
    return { success: true, restoredItems, updatedRawMaterials: db.rawMaterials };
  }

  // ==========================================
  // SUPPLIERS METHODS
  // ==========================================
  getSuppliers() {
    const db = this.read();
    return db.suppliers || [];
  }

  getSupplierById(id) {
    const db = this.read();
    if (!id) return null;
    return (db.suppliers || []).find(s => s.id === id || s.name?.toLowerCase().trim() === id?.toLowerCase().trim());
  }

  createSupplier(data) {
    const db = this.read();
    db.suppliers = db.suppliers || [];
    const newSupplier = {
      id: data.id || `sup-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      name: data.name?.trim() || 'Nuevo Proveedor',
      category: data.category || 'general',
      contactName: data.contactName?.trim() || '',
      phone: data.phone?.trim() || '',
      whatsapp: data.whatsapp?.trim() || '',
      email: data.email?.trim() || '',
      website: data.website?.trim() || '',
      address: data.address?.trim() || '',
      leadTimeDays: data.leadTimeDays || '1 a 2 días hábiles',
      minOrder: data.minOrder || '',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.suppliers.push(newSupplier);
    this.save(db);
    return newSupplier;
  }

  updateSupplier(id, data) {
    const db = this.read();
    db.suppliers = db.suppliers || [];
    let idx = db.suppliers.findIndex(s => s.id === id);
    if (idx === -1) {
      idx = db.suppliers.findIndex(s => s.name?.toLowerCase().trim() === id?.toLowerCase().trim());
    }

    if (idx === -1) {
      // Si no existe, crearlo automáticamente con los datos recibidos
      return this.createSupplier({ ...data, id });
    }

    const oldName = db.suppliers[idx].name;
    const supId = db.suppliers[idx].id;

    db.suppliers[idx] = {
      ...db.suppliers[idx],
      ...data,
      id: supId,
      updatedAt: new Date().toISOString()
    };

    // Si el nombre del proveedor cambió, sincronizar materias primas asociadas
    if (data.name && data.name.trim() && data.name.trim() !== oldName) {
      const newName = data.name.trim();
      db.rawMaterials = (db.rawMaterials || []).map(m => {
        if (m.supplierId === supId || (m.supplier && m.supplier.toLowerCase().trim() === oldName.toLowerCase().trim())) {
          return { ...m, supplier: newName, supplierId: supId };
        }
        return m;
      });
    }

    this.save(db);
    return db.suppliers[idx];
  }

  deleteSupplier(id) {
    const db = this.read();
    db.suppliers = db.suppliers || [];
    const idx = db.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return false;
    db.suppliers.splice(idx, 1);

    // Desvincular supplierId en materias primas preservando nombre
    db.rawMaterials = (db.rawMaterials || []).map(m => {
      if (m.supplierId === id) {
        return { ...m, supplierId: '' };
      }
      return m;
    });

    this.save(db);
    return true;
  }

  // ==========================================
  // CUPONES & CÓDIGOS DE DESCUENTO (ARCADE & TIENDA)
  // ==========================================
  getCoupons(filters = {}) {
    const db = this.read();
    let coupons = db.coupons || [];
    const now = new Date().getTime();

    // Filtro por categoría: 'all' | 'arcade' | 'store'
    if (filters.category && filters.category !== 'all') {
      coupons = coupons.filter(c => c.category === filters.category);
    }

    // Filtro por estatus de vigencia: 'all' | 'active' | 'expired' | 'paused'
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        coupons = coupons.filter(c => c.active !== false && (!c.expiresAt || new Date(c.expiresAt).getTime() >= now));
      } else if (filters.status === 'expired') {
        coupons = coupons.filter(c => c.expiresAt && new Date(c.expiresAt).getTime() < now);
      } else if (filters.status === 'paused') {
        coupons = coupons.filter(c => c.active === false);
      }
    }

    // Filtro de búsqueda por texto (código, nombre, descripción)
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      coupons = coupons.filter(c =>
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Métricas globales de cupones
    const all = db.coupons || [];
    const activeList = all.filter(c => c.active !== false && (!c.expiresAt || new Date(c.expiresAt).getTime() >= now));
    const stats = {
      total: all.length,
      activeCount: activeList.length,
      arcadeCount: all.filter(c => c.category === 'arcade').length,
      storeCount: all.filter(c => c.category === 'store').length,
      totalUses: all.reduce((acc, c) => acc + (Number(c.usedCount) || 0), 0),
      totalDiscountGiven: (db.orders || []).reduce((acc, o) => acc + (Number(o.couponDiscount) || 0), 0)
    };

    return {
      coupons: coupons.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
      stats
    };
  }

  getCouponById(id) {
    const db = this.read();
    if (!id) return null;
    return (db.coupons || []).find(c => c.id === id || c.code?.toUpperCase() === id?.toUpperCase());
  }

  getCouponByCode(code) {
    const db = this.read();
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return (db.coupons || []).find(c => c.code?.toUpperCase() === clean);
  }

  createCoupon(data) {
    const db = this.read();
    db.coupons = db.coupons || [];

    const cleanCode = (data.code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('El código del cupón es obligatorio');

    const exists = db.coupons.some(c => c.code.toUpperCase() === cleanCode);
    if (exists) throw new Error(`El código "${cleanCode}" ya existe. Elige uno diferente.`);

    const newCoupon = {
      id: data.id || `cup-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      code: cleanCode,
      name: data.name?.trim() || `Cupón ${cleanCode}`,
      category: data.category === 'arcade' ? 'arcade' : 'store',
      type: data.type === 'fixed' ? 'fixed' : 'percent',
      value: (data.type === 'fixed' ? Math.max(1, Number(data.value) || 10) : Math.min(MAX_DISCOUNT_PERCENT, Math.max(1, Number(data.value) || 10))),
      minPurchase: Math.max(0, Number(data.minPurchase) || 0),
      maxUses: (data.maxUses !== undefined && data.maxUses !== null && data.maxUses !== '') ? Number(data.maxUses) : null,
      usedCount: 0,
      expiresAt: data.expiresAt || null,
      active: data.active !== false,
      coinsRequired: data.category === 'arcade' ? Number(data.coinsRequired || 50) : null,
      description: data.description?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.coupons.unshift(newCoupon);
    this.save(db);
    return newCoupon;
  }

  updateCoupon(id, data) {
    const db = this.read();
    db.coupons = db.coupons || [];
    const idx = db.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const current = db.coupons[idx];

    // Si cambia el código, verificar que no colisione con otro
    if (data.code && data.code.trim().toUpperCase() !== current.code.toUpperCase()) {
      const cleanCode = data.code.trim().toUpperCase();
      const conflict = db.coupons.some(c => c.id !== id && c.code.toUpperCase() === cleanCode);
      if (conflict) throw new Error(`El código "${cleanCode}" ya está registrado por otro cupón`);
      current.code = cleanCode;
    }

    db.coupons[idx] = {
      ...current,
      ...data,
      id: current.id,
      code: data.code ? data.code.trim().toUpperCase() : current.code,
      name: data.name !== undefined ? data.name.trim() : current.name,
      category: data.category !== undefined ? data.category : current.category,
      type: data.type !== undefined ? data.type : current.type,
      value: data.value !== undefined
        ? ((data.type || current.type) === 'fixed' ? Math.max(1, Number(data.value) || 1) : Math.min(MAX_DISCOUNT_PERCENT, Math.max(1, Number(data.value) || 1)))
        : current.value,
      minPurchase: data.minPurchase !== undefined ? Number(data.minPurchase) : current.minPurchase,
      maxUses: (data.maxUses !== undefined && data.maxUses !== null && data.maxUses !== '') ? Number(data.maxUses) : (data.maxUses === null ? null : current.maxUses),
      expiresAt: data.expiresAt !== undefined ? data.expiresAt : current.expiresAt,
      active: data.active !== undefined ? Boolean(data.active) : current.active,
      description: data.description !== undefined ? data.description.trim() : current.description,
      coinsRequired: data.category === 'arcade' ? (data.coinsRequired !== undefined ? Number(data.coinsRequired) : current.coinsRequired) : null,
      updatedAt: new Date().toISOString()
    };

    this.save(db);
    return db.coupons[idx];
  }

  deleteCoupon(id) {
    const db = this.read();
    db.coupons = db.coupons || [];
    const idx = db.coupons.findIndex(c => c.id === id);
    if (idx === -1) return false;
    db.coupons.splice(idx, 1);
    this.save(db);
    return true;
  }

  recordCouponUse(code, meta = {}) {
    const db = this.read();
    db.coupons = db.coupons || [];
    const clean = (code || '').trim().toUpperCase();
    const idx = db.coupons.findIndex(c => c.code.toUpperCase() === clean);

    if (idx === -1) {
      // Cupón rotativo diario de Arcade o evento dinámico externo
      return { success: true, recognized: false, message: 'Cupón diario o externo' };
    }

    const coupon = db.coupons[idx];
    coupon.usedCount = (Number(coupon.usedCount) || 0) + 1;
    coupon.lastUsedAt = new Date().toISOString();

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      coupon.exhausted = true;
    }

    this.save(db);
    return { success: true, recognized: true, coupon };
  }

  // ==========================================
  // RESPALDOS DE SEGURIDAD (BACKUPS DEL SISTEMA)
  // ==========================================

  ensureBackupsDir() {
    const backupsDir = path.join(__dirname, 'data', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    return backupsDir;
  }

  createBackup(label = 'manual') {
    const backupsDir = this.ensureBackupsDir();
    const data = this.read();
    const cleanLabel = (label || 'manual').replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}-${cleanLabel}.json`;
    const targetPath = path.join(backupsDir, filename);

    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');

    // Política de retención: mantener los 20 más recientes
    try {
      const files = fs.readdirSync(backupsDir)
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .map(f => ({
          filename: f,
          path: path.join(backupsDir, f),
          time: fs.statSync(path.join(backupsDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 20) {
        files.slice(20).forEach(file => {
          try { fs.unlinkSync(file.path); } catch {}
        });
      }
    } catch (e) {
      console.warn('Advertencia en rotación de respaldos:', e.message);
    }

    const stats = fs.statSync(targetPath);
    return {
      filename,
      sizeBytes: stats.size,
      sizeKb: Math.round(stats.size / 1024),
      createdAt: new Date().toISOString(),
      label: cleanLabel
    };
  }

  listBackups() {
    const backupsDir = this.ensureBackupsDir();
    if (!fs.existsSync(backupsDir)) return [];

    return fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .map(filename => {
        const filePath = path.join(backupsDir, filename);
        const stats = fs.statSync(filePath);
        const parts = filename.replace('backup-', '').replace('.json', '').split('-');
        const label = parts.length > 3 ? parts.slice(3).join('-') : 'auto';

        return {
          filename,
          sizeBytes: stats.size,
          sizeKb: Math.round(stats.size / 1024),
          createdAt: stats.mtime.toISOString(),
          label
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getBackupPath(filename) {
    const safeName = path.basename(filename);
    const backupsDir = this.ensureBackupsDir();
    const filePath = path.join(backupsDir, safeName);
    if (!fs.existsSync(filePath)) return null;
    return filePath;
  }

  restoreBackup(filename) {
    const filePath = this.getBackupPath(filename);
    if (!filePath) {
      throw new Error(`Respaldo ${filename} no encontrado en el servidor`);
    }

    // 1. Crear respaldo preventivo antes de sobrescribir
    this.createBackup('pre-restoration');

    // 2. Leer y validar estructura
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.products || !Array.isArray(parsed.products)) {
      throw new Error('El archivo de respaldo no tiene una estructura de catálogo válida');
    }

    // 3. Escribir como base de datos activa
    this.save(parsed);
    return {
      success: true,
      restoredFile: filename,
      productsCount: parsed.products.length,
      timestamp: new Date().toISOString()
    };
  }
}

export const db = new Database();
