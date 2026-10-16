import { cloudDb } from './cloud-db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, 'data', 'db.json');

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
    id: 'eventos',
    name: 'Eventos Especiales',
    tagline: 'Recuerdos y detalles que celebran los momentos más importantes',
    image: '/uploads/img_014.jpg',
    description: 'Elementos personalizados para bodas, bautizos, XV años, graduaciones y fechas conmemorativas. Diseñados para sorprender y ser conservados.'
  }
];

// Initial Categories Taxonomy (Empty ones remain hidden to public until products are assigned!)
const initialCategories = [
  // HOGAR
  { id: 'hogar-organizacion', worldId: 'hogar', name: 'Organización y almacenamiento', order: 1 },
  { id: 'hogar-decoracion', worldId: 'hogar', name: 'Decoración y espacios', order: 2 },
  { id: 'hogar-mascotas', worldId: 'hogar', name: 'Mascotas', order: 3 },
  { id: 'hogar-infantil', worldId: 'hogar', name: 'Juguetes y actividades infantiles', order: 4 },
  { id: 'hogar-estudio', worldId: 'hogar', name: 'Estudio, escritorio y home office', order: 5 },
  { id: 'hogar-cocina', worldId: 'hogar', name: 'Cocina y mesa', order: 6 },
  { id: 'hogar-regalos', worldId: 'hogar', name: 'Regalos y detalles personales', order: 7 },
  { id: 'hogar-hobbies', worldId: 'hogar', name: 'Hobbies y colecciones', order: 8 },

  // NEGOCIOS
  { id: 'negocios-restaurantes', worldId: 'negocios', name: 'Restaurantes, cafeterías y reposterías', order: 1 },
  { id: 'negocios-barberias', worldId: 'negocios', name: 'Barberías, salones de belleza y uñas', order: 2 },
  { id: 'negocios-tiendas', worldId: 'negocios', name: 'Tiendas, boutiques y comercios', order: 3 },
  { id: 'negocios-joyerias', worldId: 'negocios', name: 'Joyerías y accesorios', order: 4 },
  { id: 'negocios-arte', worldId: 'negocios', name: 'Arte, diseño y fotografía', order: 5 },
  { id: 'negocios-veterinarias', worldId: 'negocios', name: 'Veterinarias y estéticas caninas', order: 6 },
  { id: 'negocios-gym', worldId: 'negocios', name: 'Gimnasios y centros deportivos', order: 7 },
  { id: 'negocios-oficinas', worldId: 'negocios', name: 'Oficinas, profesionales y coworking', order: 8 },
  { id: 'negocios-escuelas', worldId: 'negocios', name: 'Escuelas y centros de aprendizaje', order: 9 },
  { id: 'negocios-consultorios', worldId: 'negocios', name: 'Consultorios y bienestar', order: 10 },
  { id: 'negocios-hoteles', worldId: 'negocios', name: 'Hoteles, alojamientos y turismo', order: 11 },
  { id: 'negocios-emprendedores', worldId: 'negocios', name: 'Emprendedores, ferias y exposiciones', order: 12 },

  // EVENTOS ESPECIALES
  { id: 'eventos-cumpleanos', worldId: 'eventos', name: 'Cumpleaños', order: 1 },
  { id: 'eventos-bautizos', worldId: 'eventos', name: 'Bautizos', order: 2 },
  { id: 'eventos-comunion', worldId: 'eventos', name: 'Primera comunión y confirmación', order: 3 },
  { id: 'eventos-xvanos', worldId: 'eventos', name: 'XV años', order: 4 },
  { id: 'eventos-bodas', worldId: 'eventos', name: 'Bodas y aniversarios', order: 5 },
  { id: 'eventos-babyshower', worldId: 'eventos', name: 'Baby shower y bienvenida', order: 6 },
  { id: 'eventos-graduaciones', worldId: 'eventos', name: 'Graduaciones', order: 7 },
  { id: 'eventos-temporada', worldId: 'eventos', name: 'Celebraciones de temporada', order: 8 },
  { id: 'eventos-empresariales', worldId: 'eventos', name: 'Eventos empresariales', order: 9 },
  { id: 'eventos-otras', worldId: 'eventos', name: 'Otras celebraciones', order: 10 }
];

// Initial Confirmed Products from approved catalog
const initialProducts = [
  {
    id: 'colgador-llaves-l14',
    code: 'L14',
    name: 'Colgador de llaves Bienvenidos',
    priceType: 'starting_at',
    price: 199,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['hogar'],
    categories: ['hogar-organizacion', 'hogar-decoracion'],
    techniques: ['laser'],
    primaryImage: '/uploads/img_002.jpg',
    gallery: ['/uploads/img_002.jpg', '/uploads/img_001.jpg'],
    shortDescription: 'Colgador de llaves en madera natural con grabado láser botánico y percheros torneados.',
    fullDescription: 'Mantén organizadas tus llaves desde que entras a casa. Fabricado con corte y grabado láser en madera natural con acabado satinado protector. Incluye perchas cilíndricas resistentes y orificios discretos para montaje en pared.',
    specifications: {
      dimensions: '25 cm de largo x 10 cm de alto x 1.5 cm de espesor',
      material: 'Madera natural contrachapada tratada',
      finish: 'Sellador mate protector contra humedad',
      includes: '3 percheros de madera y cinta de montaje alta adherencia',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Limpiar con paño seco o ligeramente húmedo. No sumergir.'
    },
    variants: [
      { name: 'Grabado', options: ['"Bienvenidos"', 'Apellido familiar', 'Personalizado con nombre'] },
      { name: 'Tono de madera', options: ['Natural claro', 'Nogal clásico'] }
    ],
    customizationOptions: ['Nombre o apellido grabado', 'Diseño de hojas o minimalista'],
    availability: 'made_to_order',
    privateNotes: 'Archivo DXF en carpeta laser/hogar/L14_colgador_v2.dxf',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lampara-mesa-t38',
    code: 'T38',
    name: 'Lámpara de mesa moderna',
    priceType: 'quote',
    price: null,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['hogar'],
    categories: ['hogar-decoracion'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_002.jpg',
    gallery: ['/uploads/img_002.jpg', '/uploads/img_001.jpg'],
    shortDescription: 'Lámpara ambiental con estructura curva tridimensional y pantalla difusora de luz cálida.',
    fullDescription: 'Pieza de iluminación ambiental que combina manufactura aditiva y diseño nórdico. Su estructura arqueada sostiene una pantalla cónica translúcida que proyecta una luz suave y acogedora sobre credenzas, burós o repisas.',
    specifications: {
      dimensions: '30 cm de altura x 16 cm de base',
      material: 'Polímero biodegradable PLA Plus de alta densidad',
      finish: 'Textura mate texturizada',
      includes: 'Socket tipo candelabro, cable trenzado de 1.5m e interruptor de paso',
      minQuantity: 1,
      estimatedLeadTime: '4 a 6 días hábiles',
      careNotes: 'Utilizar exclusivamente focos LED (máximo 7W) para evitar calor excesivo.'
    },
    variants: [
      { name: 'Color de estructura', options: ['Arena / Nogal claro', 'Grafito carbón', 'Blanco tiza'] }
    ],
    customizationOptions: ['Color de cable', 'Altura personalizada'],
    availability: 'made_to_order',
    privateNotes: 'Impresión en boquilla 0.6mm a 0.28 altura de capa para acabado sedoso.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'maceta-espiral-t6',
    code: 'T6',
    name: 'Maceta espiral geométrica',
    priceType: 'starting_at',
    price: 149,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar'],
    categories: ['hogar-decoracion'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_002.jpg',
    gallery: ['/uploads/img_002.jpg'],
    shortDescription: 'Maceta decorativa con ondas en torsión espiral y orificio de drenaje opcional.',
    fullDescription: 'Maceta contemporánea de geometría helicoidal. Su diseño facetado crea juegos de sombra y luz en cualquier espacio con plantas vivas, suculentas o plantas artificiales.',
    specifications: {
      dimensions: '12 cm de diámetro x 11 cm de alto (para maceta 4 pulgadas)',
      material: 'PLA Premium biodegradable',
      finish: 'Satinado sedoso en tono verde salvia o terracota',
      includes: 'Platillo base a juego',
      minQuantity: 1,
      estimatedLeadTime: '2 días hábiles',
      careNotes: 'Apta para interior. Evitar exposición directa a rayos UV intensos prolongados.'
    },
    variants: [
      { name: 'Color', options: ['Verde Salvia', 'Blanco Mármol', 'Grafito Mate', 'Terracota'] },
      { name: 'Drenaje', options: ['Con orificio de drenaje', 'Cubre-maceta cerrado'] }
    ],
    customizationOptions: ['Tamaño a medida (chica, mediana, grande)'],
    availability: 'in_stock',
    privateNotes: 'Tiempo de impresión 4h 30m.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bandeja-vaciabolsillos-t29',
    code: 'T29',
    name: 'Bandeja vaciabolsillos ovalada',
    priceType: 'starting_at',
    price: 149,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-organizacion', 'negocios-joyerias'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_002.jpg',
    gallery: ['/uploads/img_002.jpg', '/uploads/img_022.jpg'],
    shortDescription: 'Bandeja con borde curvo suave para llaves, monedas, relojes o exhibición de joyería.',
    fullDescription: 'Bandeja multiusos de superficie tersa y bordes elevados. Diseñada para mantener en orden las pertenencias cotidianas en la entrada de casa, en el buró o como charola de presentación para joyería en mostradores comerciales.',
    specifications: {
      dimensions: '22 cm de largo x 13 cm de ancho x 2.2 cm de profundidad',
      material: 'Polímero compuesto con textura cerámica',
      finish: 'Mate suave con gomitas protectoras en la base',
      includes: 'Bandeja con base acolchada',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Limpieza con trapo suave.'
    },
    variants: [
      { name: 'Color', options: ['Blanco hueso', 'Verde olivo', 'Negro carbón'] },
      { name: 'Forma', options: ['Ovalada', 'Flor / Cuadrifolio'] }
    ],
    customizationOptions: ['Grabado de iniciales en el fondo'],
    availability: 'in_stock',
    privateNotes: 'Utilizar relleno concéntrico al 20%.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'marcos-imantados-3d-t2',
    code: 'T2',
    name: 'Marcos imantados para refrigerador',
    priceType: 'starting_at',
    price: 79,
    priceUnit: 'c/u',
    status: 'published',
    featured: true,
    worlds: ['hogar'],
    categories: ['hogar-decoracion', 'hogar-regalos'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_005.jpg',
    gallery: ['/uploads/img_005.jpg', '/uploads/img_003.jpg'],
    shortDescription: 'Marcos tridimensionales con potente imán de neodimio para fotos instantáneas y recuerdos.',
    fullDescription: 'Viste tu refrigerador o mampara magnética con recuerdos familiares. Su diseño biselado da profundidad visual tipo galería y permite intercambiar las fotografías fácilmente sin dañarlas.',
    specifications: {
      dimensions: 'Para fotos tamaño Polaroid o mini prints (6.5 x 6.5 cm o 7 x 9 cm)',
      material: 'Estructura rígida en PLA con imán oculto',
      finish: 'Bicolor o monocromático mate',
      includes: 'Marco con imán y mica transparente protectora',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'Evitar caídas sobre superficies duras.'
    },
    variants: [
      { name: 'Color de marco', options: ['Verde bosque', 'Blanco nórdico', 'Grafito', 'Dorado'] },
      { name: 'Formato', options: ['Cuadrado (6.5 x 6.5)', 'Rectangular (7 x 9 cm)'] }
    ],
    customizationOptions: ['Incluye fotografía impresa si se envía en la cotización'],
    availability: 'in_stock',
    privateNotes: 'Usa imán de neodimio 10x2mm.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fotoboton-acrilico-s10',
    code: 'S10',
    name: 'Fotobotón acrílico con imán',
    priceType: 'starting_at',
    price: 39,
    priceUnit: 'c/u',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'eventos'],
    categories: ['hogar-regalos', 'eventos-cumpleanos'],
    techniques: ['sublimation'],
    primaryImage: '/uploads/img_003.jpg',
    gallery: ['/uploads/img_003.jpg', '/uploads/img_005.jpg'],
    shortDescription: 'Botón con foto nítida encapsulada en acrílico de alto brillo con respaldo magnético.',
    fullDescription: 'Detalle económico, resistente y luminoso para recuerdos familiares, mascotas o eventos. Fotografía impresa con tintas de alta fidelidad protegidas por una cápsula de acrílico transparente de alta óptica.',
    specifications: {
      dimensions: '5.5 cm de diámetro',
      material: 'Acrílico inyectado y disco magnético posterior',
      finish: 'Brillante ultratransparente',
      includes: 'Imán adherido listo para colocar',
      minQuantity: 3,
      estimatedLeadTime: '1 a 3 días hábiles según volumen',
      careNotes: 'No rayar con objetos metálicos.'
    },
    variants: [
      { name: 'Forma', options: ['Circular', 'Cuadrado'] }
    ],
    customizationOptions: ['Foto proporcionada por el cliente', 'Texto breve o fecha'],
    availability: 'made_to_order',
    privateNotes: 'Impresión en papel fotográfico glossy 180g.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fotoiman-madera-l8',
    code: 'L8',
    name: 'Fotoimán de madera natural grabado',
    priceType: 'starting_at',
    price: 79,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar'],
    categories: ['hogar-decoracion', 'hogar-regalos'],
    techniques: ['laser'],
    primaryImage: '/uploads/img_005.jpg',
    gallery: ['/uploads/img_005.jpg', '/uploads/img_003.jpg'],
    shortDescription: 'Fotografía con veta visible de madera y grabado láser de nombres o fecha familiar.',
    fullDescription: 'Un recuerdo rústico y cálido. Tu fotografía favorita montada sobre madera natural con esquinas redondeadas y grabado láser inferior para dedicatorias o nombres de la familia.',
    specifications: {
      dimensions: '7.5 x 7.5 cm x 4 mm de espesor',
      material: 'Madera de abedul o contrachapado fino',
      finish: 'Sellado cera natural',
      includes: 'Imán posterior de alta fuerza',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Mantener en ambiente seco.'
    },
    variants: [
      { name: 'Grabado inferior', options: ['Con texto familiar', 'Solo fotografía'] }
    ],
    customizationOptions: ['Nombre de familia', 'Fecha conmemorativa'],
    availability: 'made_to_order',
    privateNotes: 'Corte a 18mm/s potencia 65%.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'llavero-camarita-l9',
    code: 'L9',
    name: 'Llavero Camarita de madera con foto y borla',
    priceType: 'fixed',
    price: 100,
    priceUnit: 'c/u',
    status: 'published',
    featured: true,
    worlds: ['hogar', 'eventos'],
    categories: ['hogar-regalos', 'eventos-cumpleanos', 'eventos-bodas'],
    techniques: ['laser'],
    primaryImage: '/uploads/img_004.jpg',
    gallery: ['/uploads/img_004.jpg', '/uploads/img_003.jpg'],
    shortDescription: 'Llavero en capas de madera con forma de cámara retro, foto personalizada y borla de color.',
    fullDescription: 'Nuestra pieza icónica para regalar: fabricada artesanalmente en capas de contrachapado con grabado láser y pintura a mano en tonos vintage. Lleva tu fotografía miniatura enmarcada en el visor y una borla decorativa artesanal. Paquete especial de 3 camaritas por $200.',
    specifications: {
      dimensions: '4.5 x 3.5 cm x 6 mm de espesor',
      material: 'Madera multicapa grabada y herrajes metálicos reforzados',
      finish: 'Detalles en acuarela/acrílico y sellador',
      includes: 'Argolla giratoria de llavero y borla de hilo sedoso',
      minQuantity: 1,
      estimatedLeadTime: '2 a 4 días hábiles',
      careNotes: 'No sumergir en agua.'
    },
    variants: [
      { name: 'Color de cámara', options: ['Verde menta vintage', 'Azul cielo', 'Rosa pastel', 'Madera natural'] },
      { name: 'Promoción', options: ['Individual ($100)', 'Paquete 3 Camaritas ($200)'] }
    ],
    customizationOptions: ['Fotografía del cliente en visor', 'Color de borla a elegir'],
    availability: 'made_to_order',
    privateNotes: 'Empaque individual en bolsita kraft.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'organizador-modular-t37',
    code: 'T37',
    name: 'Organizador modular de escritorio',
    priceType: 'quote',
    price: null,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-estudio', 'negocios-oficinas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_006.jpg',
    gallery: ['/uploads/img_006.jpg'],
    shortDescription: 'Estación de organización con soporte para celular, ranuras de plumas, clips y cables.',
    fullDescription: 'Despeja tu mesa de trabajo con este organizador de líneas limpias. Cuenta con inclinación frontal para ver notificaciones en el celular mientras se carga, compartimentos escalonados para bolígrafos y charola frontal para notas y clips.',
    specifications: {
      dimensions: '20 cm de ancho x 12 cm de profundidad x 9 cm de alto',
      material: 'Polímero técnico texturizado',
      finish: 'Verde oliva mate o grafito',
      includes: 'Bases de goma antideslizantes',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Limpiar con microfibra.'
    },
    variants: [
      { name: 'Color', options: ['Verde Olivo', 'Grafito Carbón', 'Gris Perla'] }
    ],
    customizationOptions: ['Logotipo en bajorrelieve', 'Iniciales grabadas'],
    availability: 'made_to_order',
    privateNotes: 'Configuración modular en 2 partes encajables.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sujetacables-escritorio-t12',
    code: 'T12',
    name: 'Sujetacables minimalistas para escritorio',
    priceType: 'starting_at',
    price: 59,
    priceUnit: 'c/u',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-estudio', 'negocios-oficinas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_006.jpg',
    gallery: ['/uploads/img_006.jpg', '/uploads/img_008.jpg'],
    shortDescription: 'Bloques pasacables para sujetar cables USB, cargadores y HDMI en el borde de tu mesa.',
    fullDescription: 'Evita que los cargadores caigan detrás del escritorio al desconectar tus dispositivos. Diseño con guía elástica que sujeta cables gruesos y delgados firmemente.',
    specifications: {
      dimensions: '2.5 x 2.5 x 2 cm',
      material: 'PLA de alta flexibilidad / dureza',
      finish: 'Mate con grabado de isotipo opcional',
      includes: 'Adhesivo desmontable 3M extrafuerte',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'Adherir sobre superficies lisas y limpias.'
    },
    variants: [
      { name: 'Color', options: ['Blanco hueso', 'Verde olivo', 'Negro', 'Madera'] }
    ],
    customizationOptions: ['Logotipo corporativo grabado', 'Paquetes de 2, 4 o 6 piezas'],
    availability: 'in_stock',
    privateNotes: 'Venta por unidad o blister institucional.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'identificador-escritorio-l4',
    code: 'L4',
    name: 'Nombre de escritorio en madera maciza',
    priceType: 'starting_at',
    price: 179,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['negocios', 'hogar'],
    categories: ['negocios-oficinas', 'hogar-estudio'],
    techniques: ['laser'],
    primaryImage: '/uploads/img_006.jpg',
    gallery: ['/uploads/img_006.jpg', '/uploads/img_008.jpg'],
    shortDescription: 'Bloque prismático de madera biselada con nombre, profesión y logotipo grabados.',
    fullDescription: 'El detalle de distinción para oficinas, recepciones, directivos y profesionistas independientes. Fabricado en bloque macizo cepillado con cantos biselados y grabado láser profundo.',
    specifications: {
      dimensions: '18 cm de largo x 4.5 cm de alto x 4 cm de base triangular',
      material: 'Madera de pino o nogal estufado',
      finish: 'Sellado con ceras vegetales y aceite de linaza',
      includes: 'Grabado personalizado en una o dos líneas',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Nutrir la madera una vez al año con aceite mineral.'
    },
    variants: [
      { name: 'Tipo de madera', options: ['Pino claro', 'Nogal oscuro'] },
      { name: 'Tipografía', options: ['Moderna sin serifa', 'Elegante cursiva', 'Institucional mayúsculas'] }
    ],
    customizationOptions: ['Nombre del profesionista', 'Cargo o especialidad', 'Logotipo vectorial'],
    availability: 'made_to_order',
    privateNotes: 'Enviar muestra digital antes de grabar.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'soporte-celular-t10',
    code: 'T10',
    name: 'Soporte vertical para celular',
    priceType: 'fixed',
    price: 99,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-estudio', 'negocios-oficinas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_007.jpg',
    gallery: ['/uploads/img_007.jpg'],
    shortDescription: 'Base vertical con ángulo óptimo de lectura y ranura de paso de cable inferior.',
    fullDescription: 'Soporte estilizado compatible con cualquier teléfono con o sin funda. Permite mantener la pantalla a la vista para videollamadas, reloj de mesa o seguimiento de notificaciones mientras se carga el dispositivo.',
    specifications: {
      dimensions: '10 cm de alto x 7 cm de base x 8 cm de profundidad',
      material: 'PLA técnico de alta rigidez',
      finish: 'Grafito carbón o verde con textura rayada sutil',
      includes: 'Gomas antiderrapantes en la base',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'No exponer a fuentes de calor directo como estufas.'
    },
    variants: [
      { name: 'Color', options: ['Negro Grafito', 'Verde Olivo', 'Blanco Ártico'] }
    ],
    customizationOptions: ['Iniciales grabadas en el respaldo'],
    availability: 'in_stock',
    privateNotes: 'Pieza rápida de reposición continua.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'portalapices-facetado-t11',
    code: 'T11',
    name: 'Portalápices facetado geométrico',
    priceType: 'fixed',
    price: 129,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-estudio', 'negocios-oficinas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_007.jpg',
    gallery: ['/uploads/img_007.jpg'],
    shortDescription: 'Vaso portalápices con diseño poligonal facetado que juega con las luces de la oficina.',
    fullDescription: 'Portalápices y organizador de tijeras o pinceles con estructura de caras poliédricas. Su centro de gravedad bajo y boca amplia garantizan estabilidad y fácil acceso a tus herramientas de trabajo.',
    specifications: {
      dimensions: '9 cm de diámetro x 10 cm de altura',
      material: 'PLA de alta definición',
      finish: 'Blanco perla mate / Mármol',
      includes: 'Base sólida pesada',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'Lavar con agua fría si se mancha con tinta.'
    },
    variants: [
      { name: 'Color', options: ['Blanco Mármol', 'Verde Jade', 'Grafito Mate'] }
    ],
    customizationOptions: ['Tamaño estándar o maxi'],
    availability: 'in_stock',
    privateNotes: 'Infill al 15% grid.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'panel-nfc-inteligente-t39',
    code: 'T39',
    name: 'Panel NFC inteligente para escritorio o negocio',
    priceType: 'quote',
    price: null,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-estudio', 'negocios-oficinas', 'negocios-emprendedores'],
    techniques: ['nfc', '3d'],
    primaryImage: '/uploads/img_007.jpg',
    gallery: ['/uploads/img_007.jpg', '/uploads/img_008.jpg', '/uploads/img_018.jpg'],
    shortDescription: 'Base de botones inteligentes con chips NFC para automatizaciones: música, luz, contacto o WiFi.',
    fullDescription: 'Lleva la tecnología NFC a tu espacio. Con solo acercar tu celular a cada botón iconográfico, se dispara una acción automática: abrir una playlist de Spotify, activar el modo concentración, encender luces inteligentes o abrir el enlace de cobro y contacto de tu marca.',
    specifications: {
      dimensions: '22 cm de largo x 6 cm de profundidad x 4 cm de altura',
      material: 'Cuerpo compuesto de base oscura con teclas de colores intercambiables',
      finish: 'Iconos en bajorrelieve y chips NTAG215 reescribibles',
      includes: '5 botones NFC preconfigurados o libres para programar',
      minQuantity: 1,
      estimatedLeadTime: '4 a 6 días hábiles',
      careNotes: 'Los chips NFC no requieren batería ni mantenimiento.'
    },
    variants: [
      { name: 'Configuración de teclas', options: ['Oficina (Música, Luz, Audio, Pausa, Concentración)', 'Negocio (Menú, Contacto, Reseñas, Pago, Redes)', 'Personalizada'] }
    ],
    customizationOptions: ['Grabado de marca en la base', 'Enlaces URLs precargados en cada botón'],
    availability: 'made_to_order',
    privateNotes: 'Verificar lectura con app NFC Tools en iOS y Android antes del envío.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'soporte-gamer-t7',
    code: 'T7',
    name: 'Soporte gamer para audífonos y mando',
    priceType: 'starting_at',
    price: 199,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar'],
    categories: ['hogar-hobbies', 'hogar-estudio'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_008.jpg',
    gallery: ['/uploads/img_008.jpg'],
    shortDescription: 'Torre de descanso para auriculares over-ear y soporte frontal para control de consola o PC.',
    fullDescription: 'Organiza tu set-up de videojuegos o trabajo. Mantiene los audífonos libres de presión innecesaria en las almohadillas y tu mando favorito siempre en posición lista para jugar.',
    specifications: {
      dimensions: '25 cm de altura x 14 cm de base',
      material: 'PLA técnico con nervaduras internas reforzadas',
      finish: 'Negro mate con acento de color a elección',
      includes: 'Base lastrada con gomas para evitar volcaduras',
      minQuantity: 1,
      estimatedLeadTime: '3 a 4 días hábiles',
      careNotes: 'Apto para mandos de Xbox, PlayStation, Switch Pro y genéricos.'
    },
    variants: [
      { name: 'Color de acento', options: ['Negro total', 'Acento Verde', 'Acento Magenta', 'Acento Blanco'] }
    ],
    customizationOptions: ['Gamertag o apodo grabado en la base'],
    availability: 'made_to_order',
    privateNotes: 'Diseño estructural con refuerzo en el gancho superior.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'soporte-qr-t16',
    code: 'T16',
    name: 'Soporte de mostrador para código QR comercial',
    priceType: 'starting_at',
    price: 199,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['negocios'],
    categories: ['negocios-restaurantes', 'negocios-barberias', 'negocios-tiendas', 'negocios-emprendedores'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_009.jpg',
    gallery: ['/uploads/img_009.jpg', '/uploads/img_016.jpg', '/uploads/img_021.jpg'],
    shortDescription: 'Placa vertical con código QR de alto relieve bi-tono y logotipo corporativo de tu negocio.',
    fullDescription: 'Permite a tus clientes consultar el menú digital, dejar reseñas en Google, transferir por SPEI o seguir tus redes sociales con un simple escaneo. El código QR está modelado tridimensionalmente en contraste óptico perfecto para una lectura veloz con cualquier cámara.',
    specifications: {
      dimensions: '14 cm de alto x 9 cm de ancho x 5 cm de base',
      material: 'Doble capa de PLA en contraste mate',
      finish: 'Biselado con logotipo personalizado en la base',
      includes: 'Placa grabada y código QR vectorizado de tu enlace',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Resistente a salpicaduras. Limpiar con paño húmedo.'
    },
    variants: [
      { name: 'Color de base', options: ['Verde bosque', 'Negro carbón', 'Madera nogal', 'Blanco'] },
      { name: 'Función principal', options: ['Menú digital', 'Pago / Transferencia', 'Reseñas de Google', 'Redes sociales'] }
    ],
    customizationOptions: ['Generación del código QR con tu URL', 'Logotipo de tu marca al frente'],
    availability: 'made_to_order',
    privateNotes: 'Validar lectura del QR a 30 cm de distancia antes de embalar.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'servilletero-botanico-t26',
    code: 'T26',
    name: 'Servilletero de diseño botánico para mesa',
    priceType: 'starting_at',
    price: 169,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-cocina', 'negocios-restaurantes'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_009.jpg',
    gallery: ['/uploads/img_009.jpg'],
    shortDescription: 'Servilletero estilizado con calado botánico para mesas de cafetería o comedor.',
    fullDescription: 'Elegancia funcional para restaurantes, cafeterías o el comedor familiar. Mantiene las servilletas firmes y verticales gracias a sus paredes con silueta de follaje estilizado.',
    specifications: {
      dimensions: '13 cm de largo x 5 cm de ancho x 9 cm de alto',
      material: 'PLA rígido apto para contacto alimentario indirecto',
      finish: 'Blanco hueso mate o verde olivo',
      includes: 'Servilletero completo con base antideslizante',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Lavar a mano con esponja suave.'
    },
    variants: [
      { name: 'Color', options: ['Blanco Hueso', 'Verde Olivo', 'Negro Mate'] }
    ],
    customizationOptions: ['Logotipo del restaurante en la base'],
    availability: 'in_stock',
    privateNotes: 'Ideal para cafeterías con estilo natural.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'numero-mesa-t25',
    code: 'T25',
    name: 'Número de mesa tridimensional con base',
    priceType: 'starting_at',
    price: 129,
    priceUnit: 'pieza',
    status: 'published',
    featured: false,
    worlds: ['negocios', 'eventos'],
    categories: ['negocios-restaurantes', 'eventos-bodas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_009.jpg',
    gallery: ['/uploads/img_009.jpg', '/uploads/img_014.jpg'],
    shortDescription: 'Número en relieve 3D sobre peana independiente para restaurantes o mesas de boda.',
    fullDescription: 'Indispensable para identificar mesas con buen gusto en banquetes de boda, aniversarios o salones de restaurante. Tipografía voluminosa en dos tonos con excelente visibilidad a distancia.',
    specifications: {
      dimensions: '12 cm de alto total con base',
      material: 'Polímero bicolor de alta precisión',
      finish: 'Números en relieve claro sobre pedestal verde oliva o madera',
      includes: 'Número y base encastrable',
      minQuantity: 5,
      estimatedLeadTime: '3 a 5 días hábiles según cantidad de mesas',
      careNotes: 'Fácilmente desmontable para almacenar plano.'
    },
    variants: [
      { name: 'Combinación de colores', options: ['Blanco sobre Verde Olivo', 'Blanco sobre Negro', 'Dorado sobre Crema'] }
    ],
    customizationOptions: ['Numeración corrida (ej. 01 al 20)', 'Detalle de nombres de novios o logo'],
    availability: 'made_to_order',
    privateNotes: 'Producción por lotes de 10 piezas.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'taza-personalizada-s1',
    code: 'S1',
    name: 'Taza personalizada con logotipo o nombre',
    priceType: 'starting_at',
    price: 70,
    priceUnit: 'c/u',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios', 'eventos'],
    categories: ['hogar-cocina', 'negocios-restaurantes', 'eventos-bodas', 'negocios-oficinas'],
    techniques: ['sublimation'],
    primaryImage: '/uploads/img_009.jpg',
    gallery: ['/uploads/img_009.jpg', '/uploads/img_013.jpg'],
    shortDescription: 'Taza de cerámica de 11 oz con diseño corporativo, monograma o detalle botánico.',
    fullDescription: 'Taza clásica para café o té con impresión sublimada de alta durabilidad y colores vivos. Ideal para kits de bienvenida en oficinas, cafeterías, regalos para parejas o recuerdos de boda.',
    specifications: {
      dimensions: '11 onzas (325 ml)',
      material: 'Cerámica blanca de alta temperatura con recubrimiento de polímero',
      finish: 'Brillante o satinado',
      includes: 'Cajita individual blanca protectora',
      minQuantity: 1,
      estimatedLeadTime: '1 a 3 días hábiles',
      careNotes: 'Apta para lavavajillas y horno de microondas.'
    },
    variants: [
      { name: 'Estilo', options: ['Logotipo empresarial', 'Nombres de pareja con follaje', 'Foto familiar'] }
    ],
    customizationOptions: ['Nombre de cada colaborador', 'Impresión a 1 o 2 caras'],
    availability: 'in_stock',
    privateNotes: 'Planchado a 180°C por 180 segundos.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'posavasos-madera-l15',
    code: 'L15',
    name: 'Posavasos de madera natural grabado con láser',
    priceType: 'starting_at',
    price: 49,
    priceUnit: 'c/u',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-cocina', 'negocios-restaurantes'],
    techniques: ['laser'],
    primaryImage: '/uploads/img_009.jpg',
    gallery: ['/uploads/img_009.jpg'],
    shortDescription: 'Disco de madera natural con grabado láser de isotipo, nombre o motivo botánico.',
    fullDescription: 'Protege las mesas con un accesorio noble y natural. Cada posavasos es cortado y grabado con láser de alta precisión y tratado con sellador hidrófugo para resistir la condensación de bebidas frías o el calor de tazas.',
    specifications: {
      dimensions: '9 cm de diámetro x 5 mm de espesor',
      material: 'Madera natural seleccionada con veta',
      finish: 'Sellado repelente de líquidos mate',
      includes: 'Tope de corcho inferior antideslizante',
      minQuantity: 4,
      estimatedLeadTime: '2 a 4 días hábiles',
      careNotes: 'Secar con un trapo tras usar. No dejar en remojo.'
    },
    variants: [
      { name: 'Forma', options: ['Circular', 'Cuadrado con cantos redondeados'] }
    ],
    customizationOptions: ['Logotipo de cafetería', 'Iniciales de evento'],
    availability: 'made_to_order',
    privateNotes: 'Se entrega atado con cordel de yute en paquetes de 4 o 6.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'chapita-mascota-t20',
    code: 'T20',
    name: 'Chapita de identificación para mascotas con o sin NFC',
    priceType: 'starting_at',
    price: 69,
    priceUnit: 'c/u',
    status: 'published',
    featured: true,
    worlds: ['hogar', 'negocios'],
    categories: ['hogar-mascotas', 'negocios-veterinarias'],
    techniques: ['3d', 'nfc', 'laser'],
    primaryImage: '/uploads/img_010.jpg',
    gallery: ['/uploads/img_010.jpg', '/uploads/img_011.jpg'],
    shortDescription: 'Placa ultraligera en forma de huesito o huella con nombre en relieve y opción de chip NFC.',
    fullDescription: 'La tranquilidad de saber que tu peludo está identificado. Fabricada en relieve 3D ligero para no molestar el cuello de tu perro o gato. Disponible en versión básica con teléfono grabado al reverso o en versión inteligente con chip NFC ($350) que abre tu contacto de WhatsApp o ficha médica al acercar cualquier celular.',
    specifications: {
      dimensions: 'Chica (3 cm para gatos/perros mini) o Mediana (4 cm para perros medianos/grandes)',
      material: 'PLA de grado no tóxico y argolla metálica reforzada',
      finish: 'Bicolor con contraste visible',
      includes: 'Argolla doble reforzada para el collar',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'No remojar en solventes. Resistente a lluvia y paseos normales.'
    },
    variants: [
      { name: 'Modelo', options: ['Huellita 3D ($69)', 'Huesito 3D ($69)', 'Madera contrachapado L10 ($69)', 'Placa recubierta metal L7 ($79)', 'Inteligente 3D con NFC ($350)'] },
      { name: 'Color', options: ['Verde Olivo y Blanco', 'Negro y Blanco', 'Azul Marino', 'Rojo', 'Rosa Pastel'] }
    ],
    customizationOptions: ['Nombre de la mascota al frente', '1 o 2 números de teléfono al reverso', 'Dirección o frase corta'],
    availability: 'made_to_order',
    privateNotes: 'La versión NFC lleva chip sellado herméticamente al interior.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'portabolsas-paseo-t21',
    code: 'T21',
    name: 'Portabolsas sanitario para paseo de mascotas',
    priceType: 'starting_at',
    price: 139,
    priceUnit: 'c/u',
    status: 'published',
    featured: false,
    worlds: ['hogar'],
    categories: ['hogar-mascotas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_010.jpg',
    gallery: ['/uploads/img_010.jpg'],
    shortDescription: 'Cápsula dispensadora de rollos sanitarios con ventana de huellita y mosquetón.',
    fullDescription: 'Haz tus paseos más cómodos y ordenados. Dispensador resistente con tapa de rosca rápida y ranura frontal con silueta de huella para extraer bolsas fácilmente sin atascos.',
    specifications: {
      dimensions: '8.5 cm de largo x 4 cm de diámetro',
      material: 'Polímero resistente a caídas',
      finish: 'Verde salvia mate o arena',
      includes: 'Mosquetón metálico negro y 1 rollo de bolsas biodegradable de cortesía',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'Apto para cualquier rollo de bolsas estándar de 15 piezas.'
    },
    variants: [
      { name: 'Color', options: ['Verde Salvia', 'Arena / Crema', 'Grafito'] }
    ],
    customizationOptions: ['Nombre de tu mascota grabado en relieve'],
    availability: 'in_stock',
    privateNotes: 'Tapa con rosca métrica de fácil ensamble.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'paquete-zorrito-t35',
    code: 'T35',
    name: 'Paquete Zorrito Colección (Figura + Llavero + Stickers)',
    priceType: 'fixed',
    price: 249,
    priceUnit: 'paquete',
    status: 'published',
    featured: true,
    worlds: ['hogar'],
    categories: ['hogar-decoracion', 'hogar-infantil', 'hogar-hobbies'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_012.jpg',
    gallery: ['/uploads/img_012.jpg'],
    shortDescription: 'Set de colección: Figura low-poly de zorrito, llavero miniatura a juego y 2 stickers.',
    fullDescription: 'Nuestra simpática mascota zorrito en un paquete de colección especial. Incluye una figura decorativa facetada de 10 cm con acabado terracota y blanco, llavero miniatura de cabeza de zorrito con herraje metálico y 2 stickers vinílicos resistentes a la intemperie. Precio del paquete $249 (precio individual $278).',
    specifications: {
      dimensions: 'Figura: 10 cm de altura; Llavero: 3.5 cm; Stickers: 6 cm',
      material: 'PLA premium multicolor y vinil laminado brillante',
      finish: 'Facetado poliédrico mate con ojos brillantes',
      includes: '1 figura T35 + 1 llavero + 2 stickers D5 en empaque especial',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'Pieza decorativa de colección.'
    },
    variants: [
      { name: 'Presentación', options: ['Paquete Completo ($249)', 'Solo Figura T35 ($179)', 'Solo Llavero ($42)'] }
    ],
    customizationOptions: ['Dedicatoria en la base de la figura'],
    availability: 'in_stock',
    privateNotes: 'Producto estrella de temporada.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'letrero-boda-l2',
    code: 'L2',
    name: 'Letrero de bienvenida o presidencia para boda y eventos',
    priceType: 'starting_at',
    price: 249,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['eventos', 'negocios'],
    categories: ['eventos-bodas', 'negocios-oficinas'],
    techniques: ['laser'],
    primaryImage: '/uploads/img_014.jpg',
    gallery: ['/uploads/img_014.jpg', '/uploads/img_015.jpg'],
    shortDescription: 'Placa en arco de madera o acrílico con nombres caligráficos y fecha de celebración.',
    fullDescription: 'La pieza que da la bienvenida a tus invitados y enmarca las fotos del día más especial. Corte en arco superior contemporáneo con tipografía elegante y motivos de olivo grabados con láser.',
    specifications: {
      dimensions: 'Desde 30 x 20 cm hasta 60 x 40 cm según el uso (mesa o caballete)',
      material: 'Madera fina contrachapada de 6 mm o acrílico',
      finish: 'Bordes pulidos con sellado satinado',
      includes: 'Base de madera independiente o ranuras para caballete',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Empaque especial acolchado para traslado.'
    },
    variants: [
      { name: 'Tamaño', options: ['Mesa de dulces / firmas (30 x 20 cm)', 'Entrada al salón (50 x 35 cm)'] },
      { name: 'Estilo', options: ['Madera natural nórdica', 'Fondo oscuro con grabado claro'] }
    ],
    customizationOptions: ['Nombres de los novios o festejados', 'Fecha del evento', 'Frase personalizada'],
    availability: 'made_to_order',
    privateNotes: 'Se entrega con film de protección en los acabados.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'llavero-nombre-t1',
    code: 'T1',
    name: 'Llavero con nombre en relieve y silueta botánica',
    priceType: 'starting_at',
    price: 49,
    priceUnit: 'c/u',
    status: 'published',
    featured: false,
    worlds: ['hogar', 'eventos', 'negocios'],
    categories: ['hogar-regalos', 'eventos-bodas', 'eventos-cumpleanos', 'negocios-tiendas'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_014.jpg',
    gallery: ['/uploads/img_014.jpg', '/uploads/img_013.jpg'],
    shortDescription: 'Llavero personalizado con el nombre de cada invitado en relieve tridimensional.',
    fullDescription: 'El recuerdo favorito para bodas, graduaciones y XV años. Cada invitado recibe su propio llavero personalizado con su nombre en relieve sobre una base estilizada con forma de hoja u ovalada. Descuento por volumen para eventos.',
    specifications: {
      dimensions: '6 a 8 cm de largo según la longitud del nombre x 2.5 cm de ancho',
      material: 'PLA bicolor de alta tenacidad',
      finish: 'Letras en alto relieve con contraste visible',
      includes: 'Argolla metálica reforzada con cadena',
      minQuantity: 5,
      estimatedLeadTime: '3 a 6 días hábiles según volumen de lista de nombres',
      careNotes: 'Ligero y resistente para llevar en las llaves diarias.'
    },
    variants: [
      { name: 'Combinación', options: ['Verde olivo con letras crema', 'Gris carbón con letras blancas', 'Terracota con letras arena'] }
    ],
    customizationOptions: ['Lista de nombres enviada en Excel o mensaje', 'Fecha o iniciales al reverso'],
    availability: 'made_to_order',
    privateNotes: 'Generador de stl por lote.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'taza-magica-s8',
    code: 'S8',
    name: 'Taza mágica térmica con revelado fotográfico',
    priceType: 'fixed',
    price: 150,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['hogar', 'eventos'],
    categories: ['hogar-regalos', 'eventos-cumpleanos', 'eventos-temporada'],
    techniques: ['sublimation'],
    primaryImage: '/uploads/img_017.jpg',
    gallery: ['/uploads/img_017.jpg'],
    shortDescription: 'Taza negra mate que al verter café o té caliente revela tu fotografía oculta.',
    fullDescription: 'Una sorpresa cada mañana. En frío se ve como una elegante taza negra mate; en cuanto sirves tu bebida caliente preferida, el recubrimiento térmico se vuelve transparente de abajo hacia arriba revelando la fotografía, mensaje o diseño a todo color. Precio individual $150, 10+ piezas a $140 c/u, o promoción especial de 2 tazas por $270.',
    specifications: {
      dimensions: '11 onzas (325 ml)',
      material: 'Cerámica con pintura termocrómica sensible al calor',
      finish: 'Negro mate en frío / Blanco fotográfico en caliente',
      includes: 'Caja protectora individual',
      minQuantity: 1,
      estimatedLeadTime: '1 a 2 días hábiles',
      careNotes: 'Lavar a mano con esponja suave. No apta para microondas continuado ni lavavajillas fuerte.'
    },
    variants: [
      { name: 'Promoción', options: ['1 Pieza ($150)', 'Paquete Magia 2 Tazas ($270)', 'Mayoreo 10+ piezas ($140 c/u)'] }
    ],
    customizationOptions: ['Fotografía para el revelado', 'Dedicatoria para mamá, papá o pareja'],
    availability: 'in_stock',
    privateNotes: 'Revisar uniformidad del pigmento negro antes de empacar.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'soporte-contacto-nfc-inteligente',
    code: 'T33',
    name: 'Soporte de contacto inteligente NFC',
    priceType: 'starting_at',
    price: 299,
    priceUnit: 'pieza',
    status: 'published',
    featured: true,
    worlds: ['negocios'],
    categories: ['negocios-oficinas', 'negocios-emprendedores', 'negocios-restaurantes', 'negocios-tiendas'],
    techniques: ['nfc', '3d'],
    primaryImage: '/uploads/img_018.jpg',
    gallery: ['/uploads/img_018.jpg', '/uploads/img_019.jpg'],
    shortDescription: 'Acerca tu celular y comparte al instante tu catálogo, redes, WhatsApp o cobro.',
    fullDescription: 'Elimina las tarjetas de papel obsoletas. Este tótem de mostrador permite a tus clientes acercar cualquier celular (iPhone o Android) para abrir tu menú, ficha de contacto vCard, catálogo de productos o enlace de pago en menos de un segundo.',
    specifications: {
      dimensions: '13 cm de alto x 9 cm de ancho x 5 cm de base',
      material: 'PLA técnico con chip NTAG de alta sensibilidad encapsulado',
      finish: 'Frontal con serigrafía o relieve "Acerca tu celular"',
      includes: 'Configuración y prueba del enlace web antes de la entrega',
      minQuantity: 1,
      estimatedLeadTime: '2 a 3 días hábiles',
      careNotes: 'No requiere pilas ni conexión eléctrica.'
    },
    variants: [
      { name: 'Color', options: ['Verde Salvia', 'Grafito Carbón', 'Blanco Minimal'] }
    ],
    customizationOptions: ['Logotipo de tu marca al frente', 'Enlace preprogramado a tu elección'],
    availability: 'made_to_order',
    privateNotes: 'Compatible con el 99% de smartphones modernos con NFC.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter-pack-gym-t32',
    code: 'T32',
    name: 'Starter Pack GYM y Centros Deportivos',
    priceType: 'starting_at',
    price: 299,
    priceUnit: 'paquete',
    status: 'published',
    featured: true,
    worlds: ['negocios'],
    categories: ['negocios-gym'],
    techniques: ['3d', 'nfc', 'laser', 'vinyl'],
    primaryImage: '/uploads/img_020.jpg',
    gallery: ['/uploads/img_020.jpg'],
    shortDescription: 'Kit de imagen y control para gimnasios: Placa QR+NFC, medalla de retos, llaveros y termo.',
    fullDescription: 'Todo lo necesario para proyectar una imagen profesional y moderna en tu centro de entrenamiento. Incluye placa de mostrador QR + NFC para registro rápido de entrada o cobro, medalla tridimensional personalizada para torneos o retos, llavero soporte para celular de vestidores y playera con marca.',
    specifications: {
      dimensions: 'Paquete con 5 elementos coordinados',
      material: 'PLA de alto impacto, herrajes metálicos reforzados y madera grabada',
      finish: 'Colores corporativos de tu gimnasio',
      includes: 'Placa QR+NFC, medalla conmemorativa, llaveros disco y termo grabado opcional',
      minQuantity: 1,
      estimatedLeadTime: '4 a 6 días hábiles',
      careNotes: 'Piezas resistentes a uso rudo.'
    },
    variants: [
      { name: 'Configuración', options: ['Kit Esencial (Placa + Llaveros + Medalla)', 'Kit Completo (con Termo y Playera V1)'] }
    ],
    customizationOptions: ['Logotipo del gimnasio', 'Enlaces de registro o redes en QR/NFC'],
    availability: 'made_to_order',
    privateNotes: 'Se cotizan adiciones por volumen de membresías.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter-pack-barberia-t18',
    code: 'T18',
    name: 'Starter Pack Barbería y Salón de Belleza',
    priceType: 'starting_at',
    price: 199,
    priceUnit: 'paquete',
    status: 'published',
    featured: true,
    worlds: ['negocios'],
    categories: ['negocios-barberias'],
    techniques: ['3d'],
    primaryImage: '/uploads/img_021.jpg',
    gallery: ['/uploads/img_021.jpg'],
    shortDescription: 'Set de estación de corte: Soporte QR para citas/reseñas, portatijeras vertical y organizador de peines.',
    fullDescription: 'Optimiza el espacio y la estética de tus estaciones de barbería. Mantén tus peines guías de máquina alineados, tus tijeras protegidas verticalmente y facilita a tus clientes calificar tu servicio o agendar su siguiente cita con el tótem QR.',
    specifications: {
      dimensions: 'Organizador peines: 24 x 6 cm; Portatijeras: 9 x 5 cm; Soporte QR: 13 x 8 cm',
      material: 'PLA rígido texturizado resistente a productos capilares',
      finish: 'Negro carbón mate y acentos verde/blanco',
      includes: 'Organizador de 8 peines guía, base para tijeras y soporte QR de mostrador',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Fácilmente lavable con agua tibia y jabón neutro.'
    },
    variants: [
      { name: 'Color principal', options: ['Negro Barber Clásico', 'Gris Carbón', 'Verde Olivo'] }
    ],
    customizationOptions: ['Nombre de la barbería en cada pieza', 'Enlace a citas o Instagram en QR'],
    availability: 'made_to_order',
    privateNotes: 'Espaciado calibrado para peines Wahl, Andis y Babyliss.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter-pack-joyeria-t27',
    code: 'T27',
    name: 'Starter Pack Joyería y Boutique de Accesorios',
    priceType: 'starting_at',
    price: 249,
    priceUnit: 'paquete',
    status: 'published',
    featured: true,
    worlds: ['negocios'],
    categories: ['negocios-joyerias', 'negocios-tiendas'],
    techniques: ['3d', 'laser'],
    primaryImage: '/uploads/img_022.jpg',
    gallery: ['/uploads/img_022.jpg'],
    shortDescription: 'Exhibición de lujo para vitrinas: Conos de anillos, soporte de aretes nube, bandeja y portaprecios.',
    fullDescription: 'Eleva el valor percibido de tus joyas y accesorios artesanales. El juego incluye exhibidor múltiple de anillos con conos cónicos, soporte vertical de aretes con silueta de arco/nube, bandeja con forma de flor para collares o pulseras, mini letrero de marca en madera y portaprecios de mostrador.',
    specifications: {
      dimensions: 'Exhibidor de anillos: 18 x 5 cm; Soporte aretes: 14 x 10 cm; Bandeja: 14 cm de diámetro',
      material: 'Polímeros con acabado cerámico sedoso y madera fina',
      finish: 'Verde salvia mate y marfil texturizado',
      includes: '5 piezas de exhibición comercial para mostrador o fotografía de catálogo',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Superficie no abrasiva para proteger metales preciosos.'
    },
    variants: [
      { name: 'Combinación', options: ['Verde Salvia y Marfil', 'Rosa Blush y Blanco', 'Negro Mate de Lujo'] }
    ],
    customizationOptions: ['Letrero de madera con logotipo de tu marca', 'Portaprecios con tu tipografía'],
    availability: 'made_to_order',
    privateNotes: 'Fotografiado en el catálogo oficial página 23.',
    createdAt: new Date().toISOString()
  }
];

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
  subtitle: 'Ahorra hasta un 25% llevando kits coordinados en ensamble artesanal, listos para obsequiar con grabado láser personalizado sin costo.',
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
      discountText: '30% OFF',
      couponCode: 'FLASHFINDE30',
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
      subtitle: 'Kits coordinados en madera, grabado láser y piezas 3D con hasta 25% de ahorro para empresas y familias.',
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
  timeLimitSeconds: 180, // 3 minutos
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
      coinsRequired: 30,
      code: 'TALLER5',
      label: '5% de Descuento',
      description: 'Válido en cualquier compra o paquete del taller',
      discountPercent: 5,
      discountAmount: 0,
      minPurchase: 0
    },
    {
      id: 'tier-10',
      coinsRequired: 60,
      code: 'TALLER10',
      label: '10% de Descuento',
      description: 'Válido en productos o paquetes coordinados',
      discountPercent: 10,
      discountAmount: 0,
      minPurchase: 200
    },
    {
      id: 'tier-50',
      coinsRequired: 100,
      code: 'MAESTRO50',
      label: '$50 MXN de Descuento',
      description: 'Ahorro directo en efectivo en tu pedido (Mínimo $200 MXN)',
      discountPercent: 0,
      discountAmount: 50,
      minPurchase: 200
    },
    {
      id: 'tier-vip',
      coinsRequired: 150,
      code: 'VIPARTESANO',
      label: '15% de Descuento + Detalle',
      description: 'Descuento VIP + sorpresa de taller en tu paquete',
      discountPercent: 15,
      discountAmount: 0,
      minPurchase: 300
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
const createInitialDb = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('Artesano2026!', salt);

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
    products: initialProducts,
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
    publications: [],
    orders: [],
    pubTracking: []
  };
};

const initialRawMaterials = [
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
    "name": "Madera Triplay / Contrachapada Pino 3mm Calidad Láser (60x40 cm)",
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
    "notes": "Caras libres de parches y resinas pesadas. Corte limpio con borde tostado uniforme."
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
      if (!data.suppliers) data.suppliers = [];
      if (!data.rawMaterials || data.rawMaterials.length === 0) {
        data.rawMaterials = [...initialRawMaterials];
        this.save(data);
      }
      return data;
    } catch (err) {
      console.error('Error reading db.json:', err);
      const data = createInitialDb();
      data.publications = [];
      data.orders = [];
      data.pubTracking = [];
      data.suppliers = [];
      data.rawMaterials = [...initialRawMaterials];
      return data;
    }
  }

  save(data) {
    if (cloudDb.enabled) return cloudDb.save(data);
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
  }

  // --- Helpers ---
  getProducts(filters = {}) {
    const db = this.read();
    let items = db.products || [];

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
    const newProduct = {
      ...productData,
      id: productData.id || `prod-${Date.now()}`,
      status: productData.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    this.save(db);
    return newProduct;
  }

  updateProduct(id, productData) {
    const db = this.read();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    db.products[index] = {
      ...db.products[index],
      ...productData,
      id: db.products[index].id, // preserve ID
      updatedAt: new Date().toISOString()
    };
    this.save(db);
    return db.products[index];
  }

  duplicateProduct(id) {
    const db = this.read();
    const original = db.products.find(p => p.id === id);
    if (!original) return null;

    const copy = {
      ...original,
      id: `prod-${Date.now()}`,
      code: `${original.code}-COP`,
      name: `${original.name} (Copia)`,
      status: 'draft',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.products.push(copy);
    this.save(db);
    return copy;
  }

  deleteProduct(id) {
    const db = this.read();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
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
    }
    return db.settings.mobileCatalogConfig;
  }

  updateMobileCatalogConfig(partialConfig) {
    const db = this.read();
    if (!db.settings) db.settings = {};
    const current = db.settings.mobileCatalogConfig || defaultMobileCatalogConfig;
    db.settings.mobileCatalogConfig = {
      ...current,
      ...partialConfig,
      updatedAt: new Date().toISOString()
    };
    this.save(db);
    return db.settings.mobileCatalogConfig;
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
      const seq = String(db.orders.length + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      orderNumber = `PED-${year}-${seq}`;
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
      amount: Math.max(0, Number(data.amount) || 0),
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
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    this.save(db);
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

    db.orders[idx] = {
      ...current,
      ...data,
      id: current.id,
      customerCode,
      isRecurringCustomer,
      firstTouchPubCode,
      costBreakdown,
      hasCosts: Boolean(hasCosts),
      totalCost,
      amount: data.amount !== undefined ? Math.max(0, Number(data.amount) || 0) : current.amount,
      quantity: data.quantity !== undefined ? Math.max(1, Number(data.quantity) || 1) : current.quantity,
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
