const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/OEM/.gemini/antigravity/scratch/artesano-digital';
const targetRoot = 'C:/Users/OEM/Downloads/catalogo/productos pagina';

// Cargar base de datos
const dbPath = path.join(baseDir, 'server/data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Iniciando exportación de productos hacia:', targetRoot);
console.log('Total de productos registrados:', db.products.length);

// Carpetas de destino en C:\Users\OEM\Downloads\catalogo\productos pagina
const categoryMap = {
  juguetes: path.join(targetRoot, 'juguetes'),
  industra: path.join(targetRoot, 'industra'),
  hogar: path.join(targetRoot, 'hogar'),
  negocios: path.join(targetRoot, 'negocios'),
  eventos: path.join(targetRoot, 'eventos'),
  personalizados: path.join(targetRoot, 'personalizados'),
  servicios: path.join(targetRoot, 'servicios')
};

// Asegurar que las carpetas base existan
for (const dir of Object.values(categoryMap)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Función auxiliar para sanitizar nombres de carpetas
function sanitizeFolderName(str) {
  return str
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60);
}

// Función para determinar el destino de cada producto
function getProductTargetFolder(p) {
  const code = p.code || '';
  const worlds = p.worlds || [];

  // Juguetes
  if (code === 'J2') {
    // Si la carpeta "zorrito" ya existe, usarla
    const zorritoPath = path.join(categoryMap.juguetes, 'zorrito');
    return zorritoPath;
  }
  if (code === 'J1' || worlds.includes('juguetes')) {
    return path.join(categoryMap.juguetes, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // Industria
  if (code.startsWith('IND') || worlds.includes('industria')) {
    return path.join(categoryMap.industra, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // Personalizados
  if (code.startsWith('CUST-') || worlds.includes('personalizados')) {
    return path.join(categoryMap.personalizados, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // Eventos
  if (code.startsWith('EV-') || code.startsWith('PROMO-EV-') || (worlds.includes('eventos') && !worlds.includes('hogar'))) {
    return path.join(categoryMap.eventos, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // Negocios
  if (
    code.startsWith('PROMO-BIZ-') ||
    ['T16', 'T33', 'T39', 'T17', 'T25', 'T32', 'T18', 'T27', 'L4'].includes(code) ||
    (worlds.includes('negocios') && !worlds.includes('hogar'))
  ) {
    return path.join(categoryMap.negocios, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // Hogar por defecto
  return path.join(categoryMap.hogar, `${code}_${sanitizeFolderName(p.name)}`);
}

// Estadísticas
let copiedImagesCount = 0;
let productFoldersCreated = 0;
const masterCatalogLines = [];

masterCatalogLines.push('================================================================================');
masterCatalogLines.push('ARTESANO DIGITAL — CATÁLOGO MAESTRO DE PRODUCTOS, COSTOS Y MAKERWORLD');
masterCatalogLines.push('Carpeta de control local: C:\\Users\\OEM\\Downloads\\catalogo\\productos pagina');
masterCatalogLines.push(`Fecha de exportación: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
masterCatalogLines.push('================================================================================\n');

for (const p of db.products) {
  const prodFolder = getProductTargetFolder(p);
  if (!fs.existsSync(prodFolder)) {
    fs.mkdirSync(prodFolder, { recursive: true });
  }
  productFoldersCreated++;

  // Copiar todas las imágenes del producto
  const rawImages = [
    p.primaryImage,
    p.whiteBgImage,
    p.detailImage,
    p.measureImage || p.dimensionsImage,
    ...(p.gallery || [])
  ].filter(Boolean);

  // Eliminar duplicados
  const uniqueImages = Array.from(new Set(rawImages));

  uniqueImages.forEach((imgUrl, idx) => {
    const cleanUrl = imgUrl.startsWith('/') ? imgUrl.slice(1) : imgUrl;
    const srcDisk = path.join(baseDir, 'public', cleanUrl);
    
    if (fs.existsSync(srcDisk)) {
      const ext = path.extname(srcDisk) || '.webp';
      const baseName = path.basename(srcDisk, ext);
      
      // Nombre descriptivo ordenado
      let destName;
      if (idx === 0) destName = `01_contexto_${baseName}${ext}`;
      else if (idx === 1) destName = `02_base_blanca_${baseName}${ext}`;
      else if (idx === 2) destName = `03_detalle_${baseName}${ext}`;
      else if (idx === 3) destName = `04_escala_${baseName}${ext}`;
      else destName = `0${idx + 1}_${baseName}${ext}`;

      const destDisk = path.join(prodFolder, destName);
      try {
        fs.copyFileSync(srcDisk, destDisk);
        copiedImagesCount++;
      } catch (err) {
        console.error(`Error copiando ${srcDisk}:`, err.message);
      }
    }
  });

  // Extraer datos técnicos
  const mwUrl = p.repository?.makerworldUrl || p.makerworldUrl || p.makerWorldModel || (p.techniques?.includes('3d') ? `https://makerworld.com/en/search/models?keyword=${encodeURIComponent(p.name)}` : 'Diseño Exclusivo Artesano Digital / Taller Propio');
  const mwAuthor = p.repository?.author || p.makerWorldAuthor || 'Artesano Digital';
  const mwId = p.repository?.makerworldModelId || p.makerWorldProfileId || (mwUrl.match(/models\/(\d+)/)?.[1] || 'N/A');

  const mfg = p.manufacturingTimes || {};
  const cost = p.costBreakdown || {};
  const priceFormatted = p.price !== null && p.price !== undefined ? `$${p.price} MXN` : 'A cotizar por proyecto';
  const costFormatted = p.costPrice ? `$${p.costPrice} MXN` : 'En cálculo / receta base';
  const marginEst = (p.price && p.costPrice) ? `${Math.round(((p.price - p.costPrice) / p.price) * 100)}% de margen` : 'Margen estándar taller (45% - 60%)';

  const machineTimeStr = (mfg.machineHours !== undefined || mfg.machineMinutes !== undefined)
    ? `${mfg.machineHours || 0} h ${mfg.machineMinutes || 0} min`
    : '45 min - 2 h (según altura de capa)';
  const postProcStr = mfg.postProcessingMinutes ? `${mfg.postProcessingMinutes} minutos` : '10 a 15 minutos';

  // Redactar Block de Notas individual por producto
  const noteLines = [];
  noteLines.push('======================================================================');
  noteLines.push(`ARTESANO DIGITAL — FICHA TÉCNICA Y CONTROL DE PRODUCTO`);
  noteLines.push('======================================================================');
  noteLines.push(`CÓDIGO: ${p.code}`);
  noteLines.push(`SKU OFICIAL: ${p.sku || 'N/A'}`);
  noteLines.push(`NOMBRE: ${p.name}`);
  noteLines.push(`ÁREA: ${(p.worlds || []).join(', ').toUpperCase()}`);
  noteLines.push(`TÉCNICA(S): ${(p.techniques || []).join(', ').toUpperCase()}`);
  noteLines.push(`ESTADO EN TIENDA: ${p.status === 'published' ? 'Activo en Catálogo' : 'Borrador'}`);
  noteLines.push('');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push('1. PRECIOS Y COSTOS DESGLOSADOS');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push(`• Precio de Venta al Público (PVP): ${priceFormatted} (${p.priceUnit || 'pieza'})`);
  noteLines.push(`• Costo Total de Producción Aterrizado: ${costFormatted}`);
  noteLines.push(`• Margen de Ganancia Estimado: ${marginEst}`);
  if (cost.plaGrams || cost.machineHours || cost.packagingCost) {
    noteLines.push('• Desglose de Costo:');
    if (cost.plaGrams) noteLines.push(`   - Filamento PLA/PETG: ${cost.plaGrams} g (aprox. $${(cost.plaGrams * 0.35).toFixed(2)} MXN)`);
    if (cost.machineHours) noteLines.push(`   - Tiempo Máquina y Luz CFE: ${cost.machineHours} h (aprox. $${(cost.machineHours * 6.5).toFixed(2)} MXN)`);
    if (cost.manualWorkMin) noteLines.push(`   - Mano de Obra / Acabado: ${cost.manualWorkMin} min (aprox. $${(cost.manualWorkMin * 1.5).toFixed(2)} MXN)`);
    if (cost.packagingCost) noteLines.push(`   - Embalaje y Presentación: $${cost.packagingCost} MXN`);
  }
  noteLines.push('');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push('2. TIEMPOS DE PRODUCCIÓN Y REPOSITORIO MAKERWORLD');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push(`• Tiempo de Impresión 3D en Máquina: ${machineTimeStr}`);
  noteLines.push(`• Tiempo de Limpieza / Post-procesamiento: ${postProcStr}`);
  noteLines.push(`• Plazo de Entrega al Cliente: ${mfg.leadTimeDays || p.specifications?.estimatedLeadTime || '1 a 3 días hábiles'}`);
  noteLines.push(`• Enlace MakerWorld / Repositorio: ${mwUrl}`);
  noteLines.push(`• Modelo ID MakerWorld: ${mwId}`);
  noteLines.push(`• Autor / Creador: ${mwAuthor}`);
  if (p.repository?.slicerNotes) {
    noteLines.push(`• Notas de Slicer / Laminador: ${p.repository.slicerNotes}`);
  }
  noteLines.push('');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push('3. ESPECIFICACIONES Y CARACTERÍSTICAS');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push(`• Descripción Corta: ${p.shortDescription || 'Sin descripción corta'}`);
  noteLines.push(`• Descripción Detallada: ${p.fullDescription || 'Sin descripción completa'}`);
  if (p.specifications) {
    noteLines.push(`• Dimensiones: ${p.specifications.dimensions || 'Ver escala fotográfica'}`);
    noteLines.push(`• Materiales de Manufactura: ${p.specifications.material || 'Filamento termoplástico de grado ingeniería / PLA / Madera'}`);
    noteLines.push(`• Acabado Superficial: ${p.specifications.finish || 'Textura limpia FDM / Lijado y barnizado artesanal'}`);
    noteLines.push(`• Incluye: ${p.specifications.includes || 'Empaque protector de taller'}`);
    if (p.specifications.careNotes) {
      noteLines.push(`• Cuidados: ${p.specifications.careNotes}`);
    }
  }
  if (p.variants && p.variants.length > 0) {
    noteLines.push('• Variantes y Colores Disponibles:');
    p.variants.forEach(v => {
      noteLines.push(`   - ${v.name}: ${(v.options || []).join(' | ')}`);
    });
  }
  noteLines.push('');
  noteLines.push('======================================================================');
  noteLines.push('Archivo generado para control de catálogo local — Artesano Digital');
  noteLines.push('======================================================================\n');

  fs.writeFileSync(path.join(prodFolder, 'DETALLES_Y_TIEMPOS.txt'), noteLines.join('\n'), 'utf8');

  // Agregar al catálogo maestro
  masterCatalogLines.push(`[${p.code}] ${p.name}`);
  masterCatalogLines.push(`   Área: ${(p.worlds || []).join(', ')} | Técnica: ${(p.techniques || []).join(', ')}`);
  masterCatalogLines.push(`   Precio Público: ${priceFormatted} | Costo Estimado: ${costFormatted} | Margen: ${marginEst}`);
  masterCatalogLines.push(`   Tiempo Impresión: ${machineTimeStr} | Entrega: ${mfg.leadTimeDays || '1 a 3 días'}`);
  masterCatalogLines.push(`   MakerWorld: ${mwUrl}`);
  masterCatalogLines.push(`   Carpeta Local: ${path.relative(targetRoot, prodFolder)}`);
  masterCatalogLines.push('--------------------------------------------------------------------------------');
}

// -----------------------------------------------------------------------------
// Agregar desglose para los 6 Productos Personalizados en carpeta 'personalizados'
// -----------------------------------------------------------------------------
const customProductsMeta = [
  {
    folder: '01_Funko_Mascotas',
    name: 'Figura Funko Custom — Mascotas',
    tag: 'Tu perrito, gatito o animal de compañía en figura 3D',
    price: '$650 MXN',
    cost: '$180 MXN (Filamento, impresión, caja ventana, pintura y ensamble)',
    time: '4 h 30 min de impresión 3D + 45 min de acabado manual',
    lead: '3 a 5 días hábiles',
    url: 'https://makerworld.com/en/search/models?keyword=funko+custom+pet',
    imgSrc: path.join(baseDir, 'public/uploads/personalizados-figuras-funko.jpg')
  },
  {
    folder: '02_Funko_Parejas',
    name: 'Figura Funko Custom — Parejas',
    tag: 'Set de 2 figuras personalizadas para novios, aniversarios o bodas',
    price: '$1,250 MXN (Set Doble)',
    cost: '$320 MXN (2 figuras 3D, caja doble o individual de colección, pintura)',
    time: '8 h 15 min de impresión 3D + 1 h 20 min de acabado y caja',
    lead: '4 a 6 días hábiles',
    url: 'https://makerworld.com/en/search/models?keyword=funko+custom+couple',
    imgSrc: path.join(baseDir, 'public/uploads/personalizados-figuras-funko.jpg')
  },
  {
    folder: '03_Funko_Profesiones',
    name: 'Figura Funko Custom — Profesiones & Graduaciones',
    tag: 'Médicos, ingenieros, enfermeros, maestros, abogados con uniforme y herramientas',
    price: '$680 MXN',
    cost: '$190 MXN (Figura 3D, accesorios profesionales modelados, caja POP! Custom)',
    time: '4 h 45 min de impresión 3D + 50 min de detallado de uniforme',
    lead: '3 a 5 días hábiles',
    url: 'https://makerworld.com/en/search/models?keyword=funko+custom+profession',
    imgSrc: path.join(baseDir, 'public/uploads/personalizados-figuras-funko.jpg')
  },
  {
    folder: '04_Funko_Amigos',
    name: 'Figura Funko Custom — Amigos & Cumpleaños',
    tag: 'Mejores amigos, anécdotas, vestimentas icónicas y hobbies',
    price: '$650 MXN',
    cost: '$180 MXN (Modelado digital a partir de fotos, impresión 3D y caja)',
    time: '4 h 20 min de impresión 3D + 40 min de acabado',
    lead: '3 a 5 días hábiles',
    url: 'https://makerworld.com/en/search/models?keyword=funko+custom+friend',
    imgSrc: path.join(baseDir, 'public/uploads/personalizados-figuras-funko.jpg')
  },
  {
    folder: '05_Funko_Familia',
    name: 'Figura Funko Custom — Familia & Abuelitos',
    tag: 'El detalle más conmovedor para el Día del Padre, Día de la Madre o abuelitos',
    price: '$680 MXN',
    cost: '$190 MXN (Figura 3D con rasgos distintivos, lentes, peinados y caja)',
    time: '4 h 40 min de impresión 3D + 45 min de acabado',
    lead: '3 a 5 días hábiles',
    url: 'https://makerworld.com/en/search/models?keyword=funko+custom+family',
    imgSrc: path.join(baseDir, 'public/uploads/personalizados-figuras-funko.jpg')
  },
  {
    folder: '06_De_Dibujo_Infantil_a_Figura_3D',
    name: 'Crea tu Personaje 3D desde un Dibujo Infantil',
    tag: 'El dibujo o boceto de tu pequeño en volumen 3D real',
    price: '$580 MXN (básico) a $850 MXN (con pintura multicapa)',
    cost: '$140 MXN - $210 MXN (Digitalización 3D, filamento alta tenacidad, acabados)',
    time: '2 h a 4 h de digitalización 3D + 3 h a 6 h de impresión 3D',
    lead: '3 a 6 días hábiles',
    url: 'https://makerworld.com/en/search/models?keyword=drawing+to+3d+dragon',
    imgSrc: path.join(baseDir, 'public/uploads/personalizados-dibujo-figura-3d.jpg')
  }
];

for (const cp of customProductsMeta) {
  const targetDir = path.join(categoryMap.personalizados, cp.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copiar imagen
  if (fs.existsSync(cp.imgSrc)) {
    const ext = path.extname(cp.imgSrc);
    fs.copyFileSync(cp.imgSrc, path.join(targetDir, `01_poster_oficial${ext}`));
    copiedImagesCount++;
  }

  const cpNote = [
    '======================================================================',
    'ARTESANO DIGITAL — PRODUCTO PERSONALIZADO',
    '======================================================================',
    `NOMBRE: ${cp.name}`,
    `CONCEPTO: ${cp.tag}`,
    `PRECIO ORIENTATIVO: ${cp.price}`,
    `COSTO ESTIMADO DE TALLER: ${cp.cost}`,
    `TIEMPO DE IMPRESIÓN Y DIGITALIZACIÓN: ${cp.time}`,
    `PLAZO DE ELABORACIÓN: ${cp.lead}`,
    `REFERENCIA MAKERWORLD / BÚSQUEDA: ${cp.url}`,
    '----------------------------------------------------------------------',
    'CARACTERÍSTICAS:',
    '• Modelado 3D desde cero a partir de fotografías o bocetos enviados por el cliente.',
    '• Incluye muestra digital previa enviada por WhatsApp antes de pasar a manufactura.',
    '• Empaque personalizado exclusivo de colección con ventana transparente.',
    '• Garantía de satisfacción de taller: Cero sorpresas en dimensiones y acabados.',
    '======================================================================\n'
  ].join('\n');

  fs.writeFileSync(path.join(targetDir, 'DETALLES_Y_TIEMPOS.txt'), cpNote, 'utf8');
}

// -----------------------------------------------------------------------------
// Agregar desglose para la carpeta 'servicios'
// -----------------------------------------------------------------------------
const servicesMeta = [
  {
    folder: '01_Branding_e_Identidad_Visual',
    name: 'Branding & Identidad Visual de Marca',
    price: '$1,800 MXN base (Inicial) / $3,400 MXN (Estándar Pro) / $5,800 MXN (VIP)',
    desc: 'Diseño de logotipo, isotipo, paleta de colores, tipografías corporativas, manual de identidad y aplicaciones para corte láser y packaging.',
    lead: '4 a 7 días hábiles'
  },
  {
    folder: '02_Diseno_y_Desarrollo_Web',
    name: 'Diseño & Desarrollo Web / Tienda Online',
    price: '$2,900 MXN base (Landing Page) / $5,200 MXN (Sitio Pro) / $8,900 MXN (Tienda Completa)',
    desc: 'Sitios web modernos, rápidos, adaptados a celular (Mobile-First), con catálogo, integración de WhatsApp y panel de administración.',
    lead: '7 a 14 días hábiles'
  },
  {
    folder: '03_Publicidad_y_Campanas_Trafico',
    name: 'Publicidad & Campañas de Tráfico Digital',
    price: '$1,500 MXN base (Gestión mensual) / $3,200 MXN (Campaña integral)',
    desc: 'Estrategias de pauta publicitaria en Meta Ads (Facebook e Instagram) y Google Ads para atraer clientes potenciales directos a WhatsApp.',
    lead: 'Configuración en 3 días hábiles + seguimiento continuo'
  },
  {
    folder: '04_Modelado_3D_y_Renders',
    name: 'Modelado 3D & Renders Comerciales',
    price: '$850 MXN base (Pieza sencilla) / $1,800 MXN (Ensamble complejo)',
    desc: 'Diseño paramétrico en CAD, modelado poligonal de figuras orgánicas y preparación de archivos .3MF / .STL listos para imprimir.',
    lead: '2 a 4 días hábiles'
  },
  {
    folder: '05_Servicio_Patch_Bar_en_Vivo',
    name: 'Servicio Patch Bar en Vivo para Eventos',
    price: 'Desde $4,800 MXN (50 personas) / $7,490 MXN (100 personas) / $12,900 MXN (VIP)',
    desc: 'Estación de madera artesanal con prensa térmica industrial y charolas de parches para gorras trucker y tote bags planchadas en vivo en menos de 45 segundos.',
    lead: 'Reserva con 1 a 4 semanas de anticipación'
  }
];

for (const s of servicesMeta) {
  const targetDir = path.join(categoryMap.servicios, s.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const sNote = [
    '======================================================================',
    'ARTESANO DIGITAL — SERVICIO PROFESIONAL',
    '======================================================================',
    `SERVICIO: ${s.name}`,
    `PRECIOS ORIENTATIVOS: ${s.price}`,
    `PLAZO DE ENTREGA: ${s.lead}`,
    '----------------------------------------------------------------------',
    'ALCANCE:',
    s.desc,
    '======================================================================\n'
  ].join('\n');

  fs.writeFileSync(path.join(targetDir, 'DETALLES_Y_TIEMPOS.txt'), sNote, 'utf8');
}

// Guardar archivo maestro en la raíz
fs.writeFileSync(
  path.join(targetRoot, '00_CATALOGO_GENERAL_PRECIOS_Y_MAKERWORLD.txt'),
  masterCatalogLines.join('\n'),
  'utf8'
);

// Guardar README explicativo para el usuario
const readmeText = [
  '======================================================================',
  'CONTROL DE PRODUCTOS Y FOTOGRAFÍAS — ARTESANO DIGITAL',
  '======================================================================',
  '',
  'Esta carpeta contiene todo el material fotográfico y técnico del catálogo oficial de la tienda:',
  '',
  'CARPETAS INCLUIDAS:',
  '1. \\hogar          -> Lámparas, macetas, cuadros, colgadores, tazas, termos, organizadores.',
  '2. \\negocios       -> Soportes QR/NFC, señalética, placas de madera, identificadores.',
  '3. \\eventos        -> Recuerdos de boda, centros de mesa, copas, abanicos, Patch Bar.',
  '4. \\juguetes       -> Zorrito articulado (con tus fotos originales + oficiales) y Leopardo bobble head.',
  '5. \\industra       -> Toberas automotrices técnicas, galgas de tornillería.',
  '6. \\personalizados -> 6 categorías separadas (Mascotas, Parejas, Profesiones, Amigos, Familia, Dibujo a 3D).',
  '7. \\servicios      -> Branding, Desarrollo Web, Campañas, Modelado 3D y Patch Bar.',
  '',
  'QUÉ ENCONTRARÁS DENTRO DE CADA PRODUCTO:',
  '• Fotos oficiales en alta resolución (contexto, base blanca, detalle y escala con medidas).',
  '• Archivo "DETALLES_Y_TIEMPOS.txt" con:',
  '   - Características y especificaciones completas',
  '   - Precios al público y costos desglosados de producción',
  '   - Tiempos de impresión 3D en máquina y mano de obra',
  '   - Enlace directo a la página del modelo en MakerWorld',
  '',
  'ARCHIVO GENERAL:',
  '• "00_CATALOGO_GENERAL_PRECIOS_Y_MAKERWORLD.txt" contiene el resumen completo de todos los productos en una sola vista.',
  '',
  'Puedes agregar nuevas fotos aquí y utilizaremos estas carpetas como fuente central de control.',
  '======================================================================\n'
].join('\n');

fs.writeFileSync(path.join(targetRoot, 'README_CONTROL_DE_PRODUCTOS.txt'), readmeText, 'utf8');

console.log('--- EXPORTACIÓN COMPLETADA CON ÉXITO ---');
console.log(`Carpetas de productos creadas: ${productFoldersCreated}`);
console.log(`Imágenes copiadas: ${copiedImagesCount}`);
console.log(`Catálogo maestro generado en: ${path.join(targetRoot, '00_CATALOGO_GENERAL_PRECIOS_Y_MAKERWORLD.txt')}`);
