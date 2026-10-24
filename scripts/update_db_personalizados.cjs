const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../server/data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const updatedPersonalizadosAndToys = [
  {
    id: 'figuras-funko-mascotas',
    code: 'CUST-FUNKO-PETS',
    name: 'Figura Estilo Funko Custom — Mascotas (Perros, Gatos y Compañeros)',
    priceType: 'fixed',
    price: 650,
    priceUnit: 'figura',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'hogar', 'eventos'],
    categories: ['personalizados-funko', 'hogar-mascotas'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-pets-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-pets-2.webp',
    detailImage: '/uploads/catalog-v2-cust-pets-3.webp',
    measureImage: '/uploads/catalog-v2-cust-pets-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-pets-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-pets-1.webp',
      '/uploads/catalog-v2-cust-pets-2.webp',
      '/uploads/catalog-v2-cust-pets-3.webp',
      '/uploads/catalog-v2-cust-pets-4.webp'
    ],
    galleryMeta: [
      { label: '1. Mascota en ambiente real', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Figura terminada sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Detalle de manchas, fisionomía y collar', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja POP! Custom de colección con ventana', shortLabel: 'Caja y empaque', type: 'measures' }
    ],
    shortDescription: 'Inmortalizamos a tu perrito, gatito o mascota en figura 3D estilo Funko con rasgos fieles y caja POP! Custom con su nombre.',
    fullDescription: 'Convierte a tu mejor amigo de cuatro patas en una figura coleccionable única de 10 cm. Diseñado a partir de fotos reales de tu mascota: recreamos la forma de sus orejas, manchas en el pelaje, postura y collar con placa. Incluye caja protectora de colección POP! CUSTOM con ventana frontal transparente y el nombre de tu mascota.',
    specifications: {
      dimensions: 'Figura de 9 a 10 cm de alto · Caja de 16 x 11.5 x 9 cm',
      material: 'Filamento PLA+ biodegradable de alta tenacidad / Resina UV técnica',
      finish: 'Pintura y detallado fino a mano con sellador mate protector UV',
      includes: 'Figura 3D personalizada de mascota + Caja POP! Custom coleccionable con ventana',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Pieza de exhibición coleccionable. Limpiar polvo con brocha suave o paño seco.'
    },
    variants: [
      { name: 'Tipo de Mascota', options: ['Perrito', 'Gatito', 'Conejo / Hurón', 'Otra especie'] },
      { name: 'Caja POP! Custom', options: ['Con nombre estándar', 'Con dedicatoria y número de edición'] }
    ],
    costPrice: 194.50,
    costBreakdown: {
      plaGrams: 75,
      tpuGrams: 0,
      otherMaterialsCost: 46.00,
      machineHours: 4.5,
      otherEquipCost: 0,
      manualWorkMin: 45,
      prepCost: 0,
      packagingCost: 28.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 8.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 4,
      machineMinutes: 30,
      postProcessingMinutes: 45,
      leadTimeDays: '3 a 5 días hábiles'
    },
    sku: 'CUST-3D-PETS-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-PETS-001',
      legacyCode: 'CUST-FUNKO-PETS',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 paredes, 15% infill, soportes tipo árbol ligeros.'
    }
  },
  {
    id: 'figuras-funko-parejas',
    code: 'CUST-FUNKO-PAREJAS',
    name: 'Figura Estilo Funko Custom — Parejas (Set Dúo Novios, Esposos o Aniversario)',
    priceType: 'fixed',
    price: 1250,
    priceUnit: 'set',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'eventos', 'hogar'],
    categories: ['personalizados-funko', 'eventos-bodas'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-parejas-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-parejas-2.webp',
    detailImage: '/uploads/catalog-v2-cust-parejas-3.webp',
    measureImage: '/uploads/catalog-v2-cust-parejas-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-parejas-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-parejas-1.webp',
      '/uploads/catalog-v2-cust-parejas-2.webp',
      '/uploads/catalog-v2-cust-parejas-3.webp',
      '/uploads/catalog-v2-cust-parejas-4.webp'
    ],
    galleryMeta: [
      { label: '1. Pareja en ambiente real', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Set de 2 figuras sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Detalle de vestimenta, peinado y rostros', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja doble POP! con nombres y fecha', shortLabel: 'Caja conmemorativa', type: 'measures' }
    ],
    shortDescription: 'Set de figuras personalizadas para novios, bodas o aniversarios. Recreamos sus outfits favoritos, poses cómplices y caja doble conmemorativa.',
    fullDescription: 'El regalo más romántico y memorable para parejas. Fabricamos dos figuras Funko 3D personalizadas a partir de fotografías de ambos. Recreamos la ropa de su cita especial, boda o atuendos cotidianos, junto con peinados y accesorios. Empacadas en caja doble coleccionable con sus nombres, fecha de aniversario o dedicatoria de amor.',
    specifications: {
      dimensions: 'Dos figuras de 10 a 11 cm de alto · Caja doble de 20 x 16 x 9 cm',
      material: 'Filamento PLA+ de grado ingeniería / Resina de alta definición',
      finish: 'Pintura fina a mano de textiles y facciones, sellado mate protector',
      includes: '2 figuras 3D personalizadas + Caja doble POP! Custom conmemorativa con ventana',
      minQuantity: 1,
      estimatedLeadTime: '4 a 6 días hábiles',
      careNotes: 'Colección de exhibición. Evitar caídas y calor superior a 50°C.'
    },
    variants: [
      { name: 'Ocasión', options: ['Aniversario / Novios', 'Boda / Matrimonio', 'San Valentín / Cumpleaños'] },
      { name: 'Formato de Caja', options: ['Caja Doble Conmemorativa', 'Dos Cajas Individuales Separadas'] }
    ],
    costPrice: 347.00,
    costBreakdown: {
      plaGrams: 150,
      tpuGrams: 0,
      otherMaterialsCost: 74.00,
      machineHours: 8.5,
      otherEquipCost: 0,
      manualWorkMin: 80,
      prepCost: 0,
      packagingCost: 42.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 15.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 8,
      machineMinutes: 30,
      postProcessingMinutes: 80,
      leadTimeDays: '4 a 6 días hábiles'
    },
    sku: 'CUST-3D-COUPLE-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-COUPLE-001',
      legacyCode: 'CUST-FUNKO-PAREJAS',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 perímetros, 15% infill, soportes árbol.'
    }
  },
  {
    id: 'figuras-funko-profesiones',
    code: 'CUST-FUNKO-PROF',
    name: 'Figura Estilo Funko Custom — Profesiones & Graduaciones',
    priceType: 'fixed',
    price: 680,
    priceUnit: 'figura',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'negocios', 'eventos'],
    categories: ['personalizados-funko', 'negocios-oficinas'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-prof-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-prof-2.webp',
    detailImage: '/uploads/catalog-v2-cust-prof-3.webp',
    measureImage: '/uploads/catalog-v2-cust-prof-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-prof-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-prof-1.webp',
      '/uploads/catalog-v2-cust-prof-2.webp',
      '/uploads/catalog-v2-cust-prof-3.webp',
      '/uploads/catalog-v2-cust-prof-4.webp'
    ],
    galleryMeta: [
      { label: '1. Figura profesional en contexto', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Figura con uniforme sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Detalle de herramientas, bata y accesorios', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja POP! Custom con título profesional', shortLabel: 'Caja de título', type: 'measures' }
    ],
    shortDescription: 'Médicos con bata y estetoscopio, ingenieros con casco, abogados, maestros o chefs con uniforme oficial y caja con título conmemorativo.',
    fullDescription: 'Celebra años de esfuerzo, graduaciones universitarias o ascensos profesionales. Diseñamos la figura con el uniforme característico de la profesión y sus herramientas icónicas (estetoscopios, birretes, planos, libros, instrumental de cocina, etc.). La caja POP! Custom incluye su nombre completo y el título universitario o especialidad.',
    specifications: {
      dimensions: 'Figura de 10 a 11 cm de alto · Caja de 16 x 11.5 x 9 cm',
      material: 'Filamento PLA+ de alta resistencia con accesorios en resina técnica',
      finish: 'Detallado a mano con sellado mate protector',
      includes: 'Figura 3D personalizada con accesorios de profesión + Caja POP! Custom con título profesional',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Ideal para escritorio, consultorio u oficina.'
    },
    variants: [
      { name: 'Área Profesional', options: ['Salud (Médico/Enfermera/Odonto)', 'Ingeniería / Arquitectura', 'Leyes / Docencia', 'Gastronomía / Arte'] },
      { name: 'Accesorio Principal', options: ['Estetoscopio / Instrumental', 'Casco / Planos de obra', 'Birrete / Título', 'Herramienta de oficio'] }
    ],
    costPrice: 215.50,
    costBreakdown: {
      plaGrams: 85,
      tpuGrams: 0,
      otherMaterialsCost: 50.00,
      machineHours: 5.0,
      otherEquipCost: 0,
      manualWorkMin: 50,
      prepCost: 0,
      packagingCost: 28.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 10.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 5,
      machineMinutes: 0,
      postProcessingMinutes: 50,
      leadTimeDays: '3 a 5 días hábiles'
    },
    sku: 'CUST-3D-PROF-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-PROF-001',
      legacyCode: 'CUST-FUNKO-PROF',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 paredes, 15% infill giroide.'
    }
  },
  {
    id: 'figuras-funko-amigos',
    code: 'CUST-FUNKO-AMIGOS',
    name: 'Figura Estilo Funko Custom — Amigos & Cumpleaños',
    priceType: 'fixed',
    price: 650,
    priceUnit: 'figura',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'eventos', 'hogar'],
    categories: ['personalizados-funko', 'eventos-cumpleanos'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-amigos-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-amigos-2.webp',
    detailImage: '/uploads/catalog-v2-cust-amigos-3.webp',
    measureImage: '/uploads/catalog-v2-cust-amigos-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-amigos-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-amigos-1.webp',
      '/uploads/catalog-v2-cust-amigos-2.webp',
      '/uploads/catalog-v2-cust-amigos-3.webp',
      '/uploads/catalog-v2-cust-amigos-4.webp'
    ],
    galleryMeta: [
      { label: '1. Figura de amigo en contexto', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Figura sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Acercamiento a ropa y accesorios', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja POP! Custom con apodo y dedicatoria', shortLabel: 'Caja y empaque', type: 'measures' }
    ],
    shortDescription: 'Inmortaliza anécdotas, vestimentas icónicas, gustos musicales o pasatiempos de tu mejor amigo(a). Un regalo entrañable e irrepetible.',
    fullDescription: 'El regalo definitivo para tu mejor amigo o amiga en su cumpleaños o despedida. Recreamos su vestimenta favorita, gorra, guitarra, audífonos o elementos de su pasatiempo preferido. Entregado en su caja POP! Custom con apodos, frases de amistad y número de edición especial.',
    specifications: {
      dimensions: 'Figura de 10 a 11 cm de alto · Caja de 16 x 11.5 x 9 cm',
      material: 'Filamento PLA+ biodegradable de alta calidad',
      finish: 'Pintura y sellado mate protector',
      includes: 'Figura 3D con vestimenta y hobby personalizado + Caja POP! Custom',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Conservar en su caja de colección o vitrina.'
    },
    variants: [
      { name: 'Cantidad de Figuras', options: ['Individual (1 Amigo)', 'Dúo de Mejores Amigos', 'Trío de Amigos'] }
    ],
    costPrice: 194.50,
    costBreakdown: {
      plaGrams: 75,
      tpuGrams: 0,
      otherMaterialsCost: 46.00,
      machineHours: 4.5,
      otherEquipCost: 0,
      manualWorkMin: 45,
      prepCost: 0,
      packagingCost: 28.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 8.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 4,
      machineMinutes: 30,
      postProcessingMinutes: 45,
      leadTimeDays: '3 a 5 días hábiles'
    },
    sku: 'CUST-3D-FRIEND-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-FRIEND-001',
      legacyCode: 'CUST-FUNKO-AMIGOS',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 paredes, 15% infill.'
    }
  },
  {
    id: 'figuras-funko-familia',
    code: 'CUST-FUNKO-FAMILIA',
    name: 'Figura Estilo Funko Custom — Pack Familiar (Papá, Mamá e Hijos)',
    priceType: 'fixed',
    price: 1550,
    priceUnit: 'pack',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'hogar', 'eventos'],
    categories: ['personalizados-funko', 'hogar-decoracion'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-familia-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-familia-2.webp',
    detailImage: '/uploads/catalog-v2-cust-familia-3.webp',
    measureImage: '/uploads/catalog-v2-cust-familia-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-familia-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-familia-1.webp',
      '/uploads/catalog-v2-cust-familia-2.webp',
      '/uploads/catalog-v2-cust-familia-3.webp',
      '/uploads/catalog-v2-cust-familia-4.webp'
    ],
    galleryMeta: [
      { label: '1. Familia completa en contexto', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Pack de 3 figuras sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Acercamiento a detalles de cada integrante', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja panorámica coleccionable familiar', shortLabel: 'Caja familiar', type: 'measures' }
    ],
    shortDescription: 'Pack familiar completo de 3 figuras (Papá, Mamá e Hijo/Hija) en caja panorámica coleccionable con apellido familiar o dedicatoria.',
    fullDescription: 'El retrato de familia más innovador y tierno. Diseñamos e imprimimos en 3D a la familia completa a partir de sus fotos reales. Cada miembro refleja su altura proporcional, peinado, ropa y sonrisa. Incluye caja panorámica POP! Custom Family Edition con el apellido de la familia grabado al frente.',
    specifications: {
      dimensions: 'Figuras de 7 a 11 cm según edad · Caja panorámica de 28 x 16 x 9 cm',
      material: 'Filamento PLA+ de alta densidad y durabilidad',
      finish: 'Pintura artesanal detallada con sellado protector mate',
      includes: 'Pack de 3 figuras personalizadas + Caja panorámica POP! Custom Familiar',
      minQuantity: 1,
      estimatedLeadTime: '5 a 7 días hábiles',
      careNotes: 'Ideal como centro de mesa o decoración en sala de estar.'
    },
    variants: [
      { name: 'Integrantes', options: ['Papá, Mamá y 1 Hijo/Bebé (3 Figuras)', 'Familia de 4 Figuras (+ $450 MXN)', 'Familia + Mascota (+ $350 MXN)'] }
    ],
    costPrice: 479.00,
    costBreakdown: {
      plaGrams: 210,
      tpuGrams: 0,
      otherMaterialsCost: 100.00,
      machineHours: 12.0,
      otherEquipCost: 0,
      manualWorkMin: 110,
      prepCost: 0,
      packagingCost: 55.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 20.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 12,
      machineMinutes: 0,
      postProcessingMinutes: 110,
      leadTimeDays: '5 a 7 días hábiles'
    },
    sku: 'CUST-3D-FAM-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-FAM-001',
      legacyCode: 'CUST-FUNKO-FAMILIA',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 perímetros, 15% infill.'
    }
  },
  {
    id: 'figuras-funko-abuelitos',
    code: 'CUST-FUNKO-ABUELITOS',
    name: 'Figura Estilo Funko Custom — Abuelitos (Homenaje a los Abuelos)',
    priceType: 'fixed',
    price: 1250,
    priceUnit: 'set',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'hogar', 'eventos'],
    categories: ['personalizados-funko', 'hogar-regalos'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-abuelitos-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-abuelitos-2.webp',
    detailImage: '/uploads/catalog-v2-cust-abuelitos-3.webp',
    measureImage: '/uploads/catalog-v2-cust-abuelitos-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-abuelitos-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-abuelitos-1.webp',
      '/uploads/catalog-v2-cust-abuelitos-2.webp',
      '/uploads/catalog-v2-cust-abuelitos-3.webp',
      '/uploads/catalog-v2-cust-abuelitos-4.webp'
    ],
    galleryMeta: [
      { label: '1. Abuelitos en ambiente cálido de hogar', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Set de abuelitos sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Acercamiento a cabello cano, lentes y suéter', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja conmemorativa Los Mejores Abuelos', shortLabel: 'Caja conmemorativa', type: 'measures' }
    ],
    shortDescription: 'El homenaje más tierno y conmovedor para los abuelos. Capturamos sus lentes, cabello cano, ropa favorita y caja conmemorativa con dedicatoria.',
    fullDescription: 'Los abuelos son el corazón del hogar. Diseñamos este tributo en 3D recreando con máxima ternura sus lentes, peinados canosos, suéteres tejidos y sonrisas entrañables. Presentado en caja conmemorativa especial con ventana, dedicatoria de los nietos y acabado resistente de colección.',
    specifications: {
      dimensions: 'Dos figuras de 10 a 11 cm de alto · Caja doble de 20 x 16 x 9 cm',
      material: 'Filamento PLA+ de alta calidad y lentes en resina translúcida/técnica',
      finish: 'Detallado a mano con sellador mate protector UV',
      includes: 'Set de 2 figuras de abuelitos + Caja conmemorativa con ventana y dedicatoria',
      minQuantity: 1,
      estimatedLeadTime: '4 a 6 días hábiles',
      careNotes: 'Tesoro familiar para exhibición en vitrina o librero.'
    },
    variants: [
      { name: 'Presentación', options: ['Set Dúo (Abuelo y Abuela)', 'Abuelito Individual ($680 MXN)', 'Abuelita Individual ($680 MXN)'] }
    ],
    costPrice: 360.00,
    costBreakdown: {
      plaGrams: 150,
      tpuGrams: 0,
      otherMaterialsCost: 77.00,
      machineHours: 8.5,
      otherEquipCost: 0,
      manualWorkMin: 85,
      prepCost: 0,
      packagingCost: 42.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 15.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 8,
      machineMinutes: 30,
      postProcessingMinutes: 85,
      leadTimeDays: '4 a 6 días hábiles'
    },
    sku: 'CUST-3D-GRAND-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-GRAND-001',
      legacyCode: 'CUST-FUNKO-ABUELITOS',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 paredes, 15% infill.'
    }
  },
  {
    id: 'de-dibujo-a-figura-3d',
    code: 'CUST-DIBUJO',
    name: 'De Dibujo a Figura 3D Real (El Arte de tus Pequeños en Volumen)',
    priceType: 'fixed',
    price: 580,
    priceUnit: 'figura',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'juguetes', 'hogar'],
    categories: ['personalizados-dibujo', 'hogar-infantil'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-dibujo-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-dibujo-2.webp',
    detailImage: '/uploads/catalog-v2-cust-dibujo-3.webp',
    measureImage: '/uploads/catalog-v2-cust-dibujo-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-dibujo-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-dibujo-1.webp',
      '/uploads/catalog-v2-cust-dibujo-2.webp',
      '/uploads/catalog-v2-cust-dibujo-3.webp',
      '/uploads/catalog-v2-cust-dibujo-4.webp'
    ],
    galleryMeta: [
      { label: '1. Comparativa dibujo infantil y figura 3D física', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Figura terminada sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Acercamiento a trazos y texturas 3D', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Escala y peana grabada con nombre del pequeño', shortLabel: 'Medidas y peana', type: 'measures' }
    ],
    shortDescription: '¿Tienes un dibujo de tu pequeño? Nosotros lo convertimos en una escultura 3D real a todo volumen respetando cada trazo.',
    fullDescription: '¡El dibujo de tu pequeño, ahora en volumen! Convertimos los dibujos hechos a mano de tus hijos en esculturas 3D reales. Nuestro equipo digitaliza cada trazo, respeta la esencia y colores del dibujo, y lo imprime en tecnología aditiva 3D de alta precisión. Incluye base peana grabada con el nombre del niño y la fecha.',
    specifications: {
      dimensions: 'Escala entre 10 y 15 cm de alto según proporción del dibujo',
      material: 'Filamento PLA biodegradable no tóxico de alta resistencia o resina técnica',
      finish: 'Modelado orgánico tridimensional fiel a los trazos originales del dibujo',
      includes: 'Figura 3D terminada + Base pedestal con nombre y año grabado + Caja de presentación',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Limpiar con paño seco. No exponer a fuego directo ni solventes abrasivos.'
    },
    variants: [
      { name: 'Tamaño', options: ['Escultura Mediana (10-12 cm)', 'Escultura Grande (15 cm)', 'Con Base Grabada en Madera/PLA'] }
    ],
    costPrice: 236.50,
    costBreakdown: {
      plaGrams: 95,
      tpuGrams: 0,
      otherMaterialsCost: 40.00,
      machineHours: 6.0,
      otherEquipCost: 0,
      manualWorkMin: 60,
      prepCost: 0,
      packagingCost: 22.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 10.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 6,
      machineMinutes: 0,
      postProcessingMinutes: 30,
      leadTimeDays: '3 a 5 días hábiles'
    },
    sku: 'CUST-3D-DRAW-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-DRAW-001',
      legacyCode: 'CUST-DIBUJO',
      area: 'CUST',
      technique: '3D',
      material: 'PLA',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Boceto)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.16 mm, 3 paredes, 15% infill giroide.'
    }
  },
  {
    id: 'figuras-funko-personalizadas',
    code: 'CUST-FUNKO',
    name: 'Figura Estilo Funko Custom — Retrato Individual & Estilo Libre',
    priceType: 'fixed',
    price: 650,
    priceUnit: 'figura',
    status: 'published',
    featured: true,
    worlds: ['personalizados', 'eventos', 'hogar'],
    categories: ['personalizados-funko', 'hogar-regalos'],
    techniques: ['3d'],
    primaryImage: '/uploads/catalog-v2-cust-casual-1.webp',
    whiteBgImage: '/uploads/catalog-v2-cust-casual-2.webp',
    detailImage: '/uploads/catalog-v2-cust-casual-3.webp',
    measureImage: '/uploads/catalog-v2-cust-casual-4.webp',
    dimensionsImage: '/uploads/catalog-v2-cust-casual-4.webp',
    gallery: [
      '/uploads/catalog-v2-cust-casual-1.webp',
      '/uploads/catalog-v2-cust-casual-2.webp',
      '/uploads/catalog-v2-cust-casual-3.webp',
      '/uploads/catalog-v2-cust-casual-4.webp'
    ],
    galleryMeta: [
      { label: '1. Figura en ambiente de exhibición', shortLabel: 'En contexto', type: 'lifestyle' },
      { label: '2. Figura sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
      { label: '3. Detalle de rostro, cabello y vestimenta', shortLabel: 'Detalle', type: 'detail' },
      { label: '4. Caja POP! Custom de colección', shortLabel: 'Caja y medidas', type: 'measures' }
    ],
    shortDescription: 'Convierte a tu persona favorita en una figura 3D coleccionable estilo Funko con caja POP! Custom con su nombre.',
    fullDescription: '¡De una foto... a tu Funko! Diseñamos e imprimimos en 3D tu figura coleccionable personalizada a partir de tus fotos reales. Incluye modelado digital previo, impresión aditiva de alta resolución, acabados a todo color y caja de colección POP! CUSTOM con nombre personalizado.',
    specifications: {
      dimensions: 'Figura de 10 a 11 cm de altura · Caja de 16 x 11.5 x 9 cm',
      material: 'Filamentos PLA+ y resina de alta definición con caja en cartón sulfatado y ventana de acetato',
      finish: 'Pintura y acabado detallado a mano con sellado protector mate',
      includes: 'Figura 3D personalizada + caja coleccionable POP! Custom con diseño exclusivo',
      minQuantity: 1,
      estimatedLeadTime: '3 a 5 días hábiles',
      careNotes: 'Pieza coleccionable de exhibición. Limpiar el polvo con brocha suave o paño seco.'
    },
    variants: [
      { name: 'Estilo', options: ['Individual (1 Persona)', 'Mascota Adicional (+ $250 MXN)'] }
    ],
    costPrice: 194.50,
    costBreakdown: {
      plaGrams: 75,
      tpuGrams: 0,
      otherMaterialsCost: 46.00,
      machineHours: 4.5,
      otherEquipCost: 0,
      manualWorkMin: 45,
      prepCost: 0,
      packagingCost: 28.00,
      additionalFailuresCost: 0,
      fixedOverheadCost: 8.00,
      shippingCost: 0,
      costStatus: 'Calculado de Taller'
    },
    manufacturingTimes: {
      machineHours: 4,
      machineMinutes: 30,
      postProcessingMinutes: 45,
      leadTimeDays: '3 a 5 días hábiles'
    },
    sku: 'CUST-3D-CASUAL-001',
    skuBreakdown: {
      standardSku: 'CUST-3D-CASUAL-001',
      legacyCode: 'CUST-FUNKO',
      area: 'CUST',
      technique: '3D',
      material: 'PLA+',
      finish: 'MAT'
    },
    repository: {
      platform: 'taller',
      makerworldUrl: 'https://makerworld.com/es',
      author: 'Taller Propio Artesano Digital (Modelado 3D Exclusivo de Fotos)',
      license: 'Diseño Exclusivo / Propietario Artesano Digital',
      slicerNotes: 'Capa 0.12 mm, 3 paredes, 15% infill.'
    }
  }
];

// Reemplazar o insertar en db.products
const newProducts = [...db.products];

for (const updated of updatedPersonalizadosAndToys) {
  const idx = newProducts.findIndex(p => p.id === updated.id || p.code === updated.code);
  if (idx >= 0) {
    console.log('Actualizando producto existente:', updated.code, updated.id);
    newProducts[idx] = { ...newProducts[idx], ...updated };
  } else {
    console.log('Agregando nuevo producto:', updated.code, updated.id);
    newProducts.push(updated);
  }
}

db.products = newProducts;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('db.json actualizado exitosamente con', db.products.length, 'productos en total.');
