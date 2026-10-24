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
  paquetes: path.join(targetRoot, 'paquetes'),
  personalizados: path.join(targetRoot, 'personalizados'),
  servicios: path.join(targetRoot, 'servicios')
};

// Asegurar que las carpetas base existan
for (const dir of Object.values(categoryMap)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Limpiar paquetes de carpetas individuales para que queden centralizados en \paquetes
const packageCodes = [
  'PROMO-HOG-1', 'PROMO-HOG-2', 'PROMO-HOG-3',
  'PROMO-BIZ-1', 'PROMO-BIZ-2', 'PROMO-BIZ-3',
  'PROMO-EV-1', 'PROMO-EV-2', 'PROMO-EV-3',
  'T35', 'T18', 'T27', 'T32', 'EV-ANTICRUDA'
];

for (const cat of ['hogar', 'negocios', 'eventos']) {
  const catDir = categoryMap[cat];
  if (fs.existsSync(catDir)) {
    for (const sub of fs.readdirSync(catDir)) {
      if (packageCodes.some(c => sub.startsWith(c))) {
        const oldPath = path.join(catDir, sub);
        try {
          fs.rmSync(oldPath, { recursive: true, force: true });
          console.log(`Relocalizando paquete ${sub} hacia /paquetes...`);
        } catch (e) {}
      }
    }
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

  // 1. Paquetes y Combos (Mover a la carpeta 'paquetes')
  const isPackage =
    code.startsWith('PROMO-') ||
    ['T35', 'T18', 'T27', 'T32', 'EV-ANTICRUDA'].includes(code) ||
    worlds.includes('paquetes') ||
    worlds.includes('paquetes-servicios');

  if (isPackage) {
    return path.join(categoryMap.paquetes, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // 2. Juguetes
  if (code === 'J2') {
    return path.join(categoryMap.juguetes, 'zorrito');
  }
  if (code === 'J1' || worlds.includes('juguetes')) {
    return path.join(categoryMap.juguetes, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // 3. Industria
  if (code.startsWith('IND') || worlds.includes('industria')) {
    return path.join(categoryMap.industra, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // 4. Personalizados
  if (code.startsWith('CUST-') || worlds.includes('personalizados')) {
    return path.join(categoryMap.personalizados, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // 5. Eventos
  if (code.startsWith('EV-') || (worlds.includes('eventos') && !worlds.includes('hogar'))) {
    return path.join(categoryMap.eventos, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // 6. Negocios
  if (
    ['T16', 'T33', 'T39', 'T17', 'T25', 'L4'].includes(code) ||
    (worlds.includes('negocios') && !worlds.includes('hogar'))
  ) {
    return path.join(categoryMap.negocios, `${code}_${sanitizeFolderName(p.name)}`);
  }

  // 7. Hogar por defecto
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
  let mwUrl = p.repository?.makerworldUrl || p.makerworldUrl || p.makerWorldModel;
  let mwAuthor = p.repository?.author || p.makerWorldAuthor || 'Artesano Digital';
  let mwId = p.repository?.makerworldModelId || p.makerWorldProfileId || (mwUrl ? mwUrl.match(/models\/(\d+)/)?.[1] : null) || 'N/A';

  // Asegurar enlace completo para T38
  if (p.code === 'T38') {
    mwUrl = 'https://makerworld.com/es/models/1804162-modern-lamp#profileId-1924098';
    mwAuthor = 'Mesmar';
    mwId = '1804162';
  } else if (!mwUrl) {
    mwUrl = p.techniques?.includes('3d')
      ? `https://makerworld.com/en/search/models?keyword=${encodeURIComponent(p.name)}`
      : 'Diseño Exclusivo Artesano Digital / Taller Propio';
  }

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
  
  if (p.code === 'T38') {
    noteLines.push(`• Enlace Directo MakerWorld (Español): https://makerworld.com/es/models/1804162-modern-lamp#profileId-1924098`);
    noteLines.push(`• Enlace Directo MakerWorld (Inglés): https://makerworld.com/en/models/1804162-modern-lamp#profileId-1924098`);
    noteLines.push(`• Modelo ID MakerWorld: 1804162`);
    noteLines.push(`• Perfil de Impresión ID: 1924098`);
    noteLines.push(`• Autor / Creador: Mesmar (https://makerworld.com/en/@mesmar)`);
    noteLines.push(`• Nombre Oficial del Diseño: Modern Lamp`);
    noteLines.push(`• Compatibilidad Eléctrica: Compatible con Bambu LED Lamp Kit 001 o Socket Candelabro rosca E12/E14.`);
  } else {
    noteLines.push(`• Enlace MakerWorld / Repositorio: ${mwUrl}`);
    noteLines.push(`• Modelo ID MakerWorld: ${mwId}`);
    noteLines.push(`• Autor / Creador: ${mwAuthor}`);
  }

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
    lead: '2 a 3 días hábiles',
    desc: 'Figura 3D personalizada modelada a partir de fotos de tu mascota. Incluye caja protectora de colección con ventana transparente de acetato.'
  },
  {
    folder: '02_Funko_Parejas',
    name: 'Figura Funko Custom — Parejas',
    tag: 'Tú y tu pareja con ropa icónica, pose especial y detalles',
    price: '$1,190 MXN (Dúo)',
    cost: '$320 MXN (2 figuras completas + caja doble de exhibición)',
    lead: '3 a 4 días hábiles',
    desc: 'Set de 2 figuras Funko Pop personalizadas para aniversarios, bodas o regalos de San Valentín. Diseñado a partir de fotos de ambos.'
  },
  {
    folder: '03_Funko_Profesiones',
    name: 'Figura Funko Custom — Profesiones',
    tag: 'Médicos, ingenieros, chefs, licenciados con sus herramientas',
    price: '$690 MXN',
    cost: '$190 MXN (Figura + accesorios de profesión + caja personalizada)',
    lead: '2 a 3 días hábiles',
    desc: 'Figura con indumentaria profesional y accesorios de trabajo (estetoscopio, plano, espátula, laptop, etc.). Excelente para graduaciones.'
  },
  {
    folder: '04_Funko_Amigos',
    name: 'Figura Funko Custom — Amigos & Squad',
    tag: 'Para el grupo de mejores amigos o roomies inseparables',
    price: 'Desde $620 MXN c/u (Descuento en pack de 3 o más)',
    cost: '$170 MXN por figura en lote',
    lead: '3 a 5 días hábiles',
    desc: 'Figuras personalizadas con atuendos coordinados o recuerdos de viaje para grupos de amigos.'
  },
  {
    folder: '05_Funko_Familia',
    name: 'Figura Funko Custom — Familia Completa',
    tag: 'Papá, mamá, hijos y mascotas juntos en su vitrina familiar',
    price: 'Desde $1,450 MXN (Pack Familiar de 3 a 5 integrantes)',
    cost: '$420 MXN lote completo con repisa base de exhibición',
    lead: '4 a 6 días hábiles',
    desc: 'Retablo tridimensional familiar con caja panorámica grabada con apellido o dedicatoria.'
  },
  {
    folder: '06_De_Dibujo_Infantil_a_Figura_3D',
    name: 'De Dibujo Infantil a Figura 3D Real',
    tag: 'El trazo o garabato de tu niño convertido en escultura física coleccionable',
    price: '$480 MXN (Figura 10-12 cm con peana de madera grabada)',
    cost: '$135 MXN (Modelado CAD orgánico, filamento PLA multicromático y peana láser)',
    lead: '2 a 3 días hábiles',
    desc: 'Subes la foto del dibujo hecho en papel por tu hijo/a y en el taller lo modelamos en relieve 3D respetando fielmente sus proporciones, colores y ternura original.'
  }
];

for (const c of customProductsMeta) {
  const targetDir = path.join(categoryMap.personalizados, c.folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const cNote = [
    '======================================================================',
    'ARTESANO DIGITAL — PRODUCTO PERSONALIZADO BAJO DEMANDA',
    '======================================================================',
    `PRODUCTO: ${c.name}`,
    `CONCEPTO: ${c.tag}`,
    `PRECIO AL PÚBLICO: ${c.price}`,
    `COSTO DE PRODUCCIÓN: ${c.cost}`,
    `PLAZO DE ENTREGA: ${c.lead}`,
    '----------------------------------------------------------------------',
    'DESCRIPCIÓN Y DETALLES:',
    c.desc,
    '----------------------------------------------------------------------',
    'REPOSITORIO / MODELADO: Modelado digital propio en taller a partir de foto enviada por WhatsApp.',
    'TECNOLOGÍA: Modelado CAD + Impresión 3D FDM alta resolución + Pintado y caja ventana.',
    '======================================================================\n'
  ].join('\n');

  fs.writeFileSync(path.join(targetDir, 'DETALLES_Y_TIEMPOS.txt'), cNote, 'utf8');
}

// -----------------------------------------------------------------------------
// Agregar desglose para los 5 Servicios Digitales en carpeta 'servicios'
// -----------------------------------------------------------------------------
const servicesMeta = [
  {
    folder: '01_Branding_e_Identidad_Visual',
    name: 'Diseño Gráfico & Branding Corporativo',
    price: 'Desde $1,800 MXN (Básico) hasta $5,500 MXN (Manual Completo)',
    lead: '3 a 7 días hábiles',
    desc: 'Logotipo maestro, versiones vectoriales, paleta cromática, manual de marca, papelería y aplicaciones para rotulación comercial.'
  },
  {
    folder: '02_Diseno_y_Desarrollo_Web',
    name: 'Desarrollo Web & Tiendas Online Interactivas',
    price: 'Desde $2,900 MXN (Landing / Catálogo WhatsApp) hasta $11,500 MXN (E-Commerce Completo)',
    lead: '5 a 12 días hábiles',
    desc: 'Sitios web responsivos de alto rendimiento, optimizados para celular, catálogo de productos dinámico y conexión directa a WhatsApp.'
  },
  {
    folder: '03_Publicidad_y_Campanas_Trafico',
    name: 'Publicidad Comercial, Lonas & Gran Formato',
    price: 'Desde $850 MXN (Lona 2x1m reforzada) hasta $4,900 MXN (Rotulación Integral)',
    lead: '1 a 3 días hábiles',
    desc: 'Lonas frontlite 13oz con ojillos reforzados, lona microperforada mesh, vinil autoadhesivo para cristales y rotulación de vehículos.'
  },
  {
    folder: '04_Modelado_3D_y_Renders',
    name: 'Modelado 3D CAD & Renders Técnicos Fotorrealistas',
    price: 'Desde $1,200 MXN (Pieza técnica) hasta $6,000 MXN (Prototipo funcional + ensamble)',
    lead: '2 a 5 días hábiles',
    desc: 'Diseño paramétrico en Fusion 360, generación de archivos .STEP / .STL / .3MF, renders para catálogo comercial y pruebas físicas de ajuste.'
  },
  {
    folder: '05_Servicio_Patch_Bar_en_Vivo',
    name: 'Patch Bar — Estación de Personalización en Vivo para Eventos',
    price: 'Desde $4,500 MXN (50 parches termo-adheribles + prensa en vivo en tu evento)',
    lead: 'Apartar con 10 días de anticipación',
    desc: 'Llevamos la prensa térmica y estación móvil a tu boda, fiesta de graduación o activación de marca para que tus invitados elijan parches y personalicen sus gorras o tote bags al instante.'
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
  '3. \\eventos        -> Recuerdos de boda, centros de mesa, copas, abanicos.',
  '4. \\paquetes       -> Combos coordinados, kits promocionales, Starter Packs de negocio y eventos.',
  '5. \\juguetes       -> Zorrito articulado (con tus fotos originales + oficiales) y Leopardo bobble head.',
  '6. \\industra       -> Toberas automotrices técnicas, galgas de tornillería.',
  '7. \\personalizados -> 6 categorías separadas (Mascotas, Parejas, Profesiones, Amigos, Familia, Dibujo a 3D).',
  '8. \\servicios      -> Branding, Desarrollo Web, Campañas, Modelado 3D y Patch Bar.',
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
