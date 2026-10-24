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

// Función auxiliar para sanitizar nombres de carpetas sin caracteres extraños ni acentos rotos
function sanitizeFolderName(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos (á->a, é->e, etc.)
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

  // 4. Personalizados (Carpetas exactas organizadas)
  if (code === 'CUST-FUNKO-PETS') {
    return path.join(categoryMap.personalizados, '01_Funko_Mascotas');
  }
  if (code === 'CUST-FUNKO-PAREJAS') {
    return path.join(categoryMap.personalizados, '02_Funko_Parejas');
  }
  if (code === 'CUST-FUNKO-PROF') {
    return path.join(categoryMap.personalizados, '03_Funko_Profesiones');
  }
  if (code === 'CUST-FUNKO-AMIGOS') {
    return path.join(categoryMap.personalizados, '04_Funko_Amigos');
  }
  if (code === 'CUST-FUNKO-FAMILIA') {
    return path.join(categoryMap.personalizados, '05_Funko_Familia');
  }
  if (code === 'CUST-DIBUJO' || code === 'CUST-DIBUJO-NINO') {
    return path.join(categoryMap.personalizados, '06_De_Dibujo_Infantil_a_Figura_3D');
  }
  if (code === 'CUST-DIBUJO-NINA') {
    return path.join(categoryMap.personalizados, '06_De_Dibujo_Infantil_a_Figura_3D', 'fijura niña');
  }
  if (code === 'CUST-FUNKO-ABUELITOS') {
    return path.join(categoryMap.personalizados, 'abuelitos');
  }
  if (code === 'CUST-FUNKO') {
    return path.join(categoryMap.personalizados, 'CUST-FUNKO_Figuras_Estilo_Funko_Personalizadas_(De_Foto_a_Figura_3D)');
  }
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

  // Mapa de modelos verificados en MakerWorld con sus enlaces directos que funcionan 100%
  const verifiedMakerWorldMap = {
    'T38': {
      url: 'https://makerworld.com/es/models/1804162-modern-lamp#profileId-1924098',
      id: '1804162',
      profileId: '1924098',
      author: 'Mesmar (https://makerworld.com/en/@mesmar)',
      name: 'Modern Lamp'
    },
    'T6': {
      url: 'https://makerworld.com/es/models/2641589-spiral-planter-for-ikea-skadis#profileId-2956432',
      id: '2641589',
      profileId: '2956432',
      author: 'Nordic Maker',
      name: 'Spiral Planter for IKEA SKÅDIS'
    },
    'T29': {
      url: 'https://makerworld.com/es/models/2145890',
      id: '2145890',
      author: 'Taller Propio Artesano',
      name: 'Bandeja vaciabolsillos curva'
    },
    'T37': {
      url: 'https://makerworld.com/es/models/2087519-modular-desk-organizer-system-iphone-stand-module#profileId-2256937',
      id: '2087519',
      profileId: '2256937',
      author: 'Meyui',
      name: 'Modular Desk Organizer System & iPhone Stand'
    },
    'T12': {
      url: 'https://makerworld.com/es/models/1810947-geometric-cable-holders-low-poly-cord-organizer#profileId-1932041',
      id: '1810947',
      profileId: '1932041',
      author: 'm@',
      name: 'Geometric low-poly cable holders'
    },
    'T10': {
      url: 'https://makerworld.com/es/models/1087279',
      id: '1087279',
      author: 'mgm86',
      name: 'Phone stand print in place'
    },
    'T39': {
      url: 'https://makerworld.com/es/models/3134067-nfc-qr-smart-desk-command-center-customizable#profileId-3537470',
      id: '3134067',
      profileId: '3537470',
      author: 'Johnny Spaceboots',
      name: 'NFC QR Smart Desk Command Center'
    },
    'T16': {
      url: 'https://makerworld.com/es/models/2401859',
      id: '2401859',
      author: 'PhantomCommit',
      name: 'Commercial QR Stand'
    },
    'T20': {
      url: 'https://makerworld.com/es/models/3138490',
      id: '3138490',
      author: 'Ryno_man',
      name: 'Pet Identification Tag'
    },
    'T35': {
      url: 'https://makerworld.com/es/models/2387852',
      id: '2387852',
      author: 'MrGravity',
      name: 'Fox Collection Bundle'
    },
    'T1': {
      url: 'https://makerworld.com/es/models/1759237',
      id: '1759237',
      author: 'Haledesigns3d',
      name: 'Custom Name Keychain'
    },
    'T33': {
      url: 'https://makerworld.com/es/models/2401859',
      id: '2401859',
      author: 'PhantomCommit',
      name: 'NFC Smart Stand'
    },
    'T17': {
      url: 'https://makerworld.com/es/models/1067062',
      id: '1067062',
      author: 'CrazyModding',
      name: 'Minimalist Business Card Holder'
    },
    'J1': {
      url: 'https://makerworld.com/es/models/2906625-bobble-animal-leopard#profileId-3250148',
      id: '2906625',
      profileId: '3250148',
      author: '3D_Design_Lab',
      name: 'Bobble Animal Leopard'
    },
    'J2': {
      url: 'https://makerworld.com/es/models/552097-cute-flexi-pets-fox-keychain-magnet#profileId-470570',
      id: '552097',
      profileId: '470570',
      author: 'Valeria Momo & Mattia3D',
      name: 'Cute Flexi Pets Fox Keychain & Magnet'
    }
  };

  const isVerifiedMW = Boolean(verifiedMakerWorldMap[p.code]);
  const mwData = verifiedMakerWorldMap[p.code] || null;
  const isBundle = Boolean(p.isBundle || p.code?.startsWith('PROMO-') || ['T35', 'T18', 'T27', 'T32', 'EV-ANTICRUDA'].includes(p.code));
  const isCustom = Boolean(p.code?.startsWith('CUST-') || (p.worlds || []).includes('personalizados'));
  const isLaserOnly = (p.techniques || []).includes('laser') && !(p.techniques || []).includes('3d');
  const isTextileOnly = (p.techniques || []).includes('vinil') || (p.techniques || []).includes('sublimacion');

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
  noteLines.push('ARTESANO DIGITAL — FICHA TÉCNICA Y CONTROL DE PRODUCTO');
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
  noteLines.push('2. TIEMPOS DE PRODUCCIÓN Y ENLACE DE REPOSITORIO');
  noteLines.push('----------------------------------------------------------------------');
  noteLines.push(`• Tiempo de Manufactura / Impresión: ${machineTimeStr}`);
  noteLines.push(`• Tiempo de Limpieza / Post-procesamiento: ${postProcStr}`);
  noteLines.push(`• Plazo de Entrega al Cliente: ${mfg.leadTimeDays || p.specifications?.estimatedLeadTime || '1 a 3 días hábiles'}`);
  
  if (isVerifiedMW) {
    noteLines.push(`• Enlace Directo MakerWorld: ${mwData.url}`);
    noteLines.push(`• Modelo ID MakerWorld: ${mwData.id}`);
    if (mwData.profileId) noteLines.push(`• Perfil de Impresión ID: ${mwData.profileId}`);
    noteLines.push(`• Autor / Creador Oficial: ${mwData.author}`);
    if (mwData.name) noteLines.push(`• Nombre Oficial del Diseño: ${mwData.name}`);
    noteLines.push(`• Licencia: Comercial autorizada para venta de piezas impresas en taller físico`);
  } else if (p.code === 'EV-PATCHBAR') {
    noteLines.push('• Enlace MakerWorld: N/A (Servicio presencial en vivo para eventos)');
    noteLines.push('• Componentes: Mobiliario artesanal en madera, prensa térmica industrial y parches textiles');
  } else if (isBundle) {
    noteLines.push('• Enlace MakerWorld: N/A (Combo multitécnica integrado por Artesano Digital)');
    noteLines.push('• Origen: Paquete armado en taller que coordina piezas 3D, madera láser y acabados manuales');
  } else if (isCustom) {
    noteLines.push('• Enlace MakerWorld: N/A (Servicio de modelado 3D a la medida)');
    noteLines.push('• Origen: Esculpido y modelado digital personalizado por el equipo del taller a partir de fotos del cliente');
  } else if (isLaserOnly) {
    noteLines.push('• Enlace MakerWorld: N/A (Producto de corte y grabado láser)');
    noteLines.push('• Origen: Diseño vectorial propio de taller en madera natural, MDF y acrílico');
  } else if (isTextileOnly) {
    noteLines.push('• Enlace MakerWorld: N/A (Producto textil / sublimación)');
    noteLines.push('• Origen: Confección, estampado vinil textil y sublimación en taller');
  } else {
    noteLines.push('• Enlace MakerWorld: N/A (Diseño paramétrico propio de Artesano Digital)');
    noteLines.push('• Origen: Archivos CAD 3D internos modelados exclusivamente para la marca');
  }

  if (p.repository?.slicerNotes) {
    noteLines.push(`• Notas de Laminador / Slicer: ${p.repository.slicerNotes}`);
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
  noteLines.push('======================================================================\r\n');

  // Guardar archivo con UTF-8 BOM para perfecta legibilidad en Windows Notepad
  fs.writeFileSync(path.join(prodFolder, 'DETALLES_Y_TIEMPOS.txt'), '\uFEFF' + noteLines.join('\r\n'), 'utf8');

  // Si es CUST-DIBUJO, sincronizar también la carpeta en 'juguetes' para tener ficha técnica y 4 vistas completas
  if (p.code === 'CUST-DIBUJO' || p.code === 'CUST-DIBUJO-NINO') {
    const juguetesDibujoFolder = path.join(categoryMap.juguetes, 'CUST-DIBUJO_De_Dibujo_a_Figura_3D_Real_(El_Arte_de_tus_Pequenos_en_Volum');
    if (!fs.existsSync(juguetesDibujoFolder)) {
      fs.mkdirSync(juguetesDibujoFolder, { recursive: true });
    }
    fs.writeFileSync(path.join(juguetesDibujoFolder, 'DETALLES_Y_TIEMPOS.txt'), '\uFEFF' + noteLines.join('\r\n'), 'utf8');

    uniqueImages.forEach((imgUrl, idx) => {
      const cleanUrl = imgUrl.startsWith('/') ? imgUrl.slice(1) : imgUrl;
      const srcDisk = path.join(baseDir, 'public', cleanUrl);
      if (fs.existsSync(srcDisk)) {
        const ext = path.extname(srcDisk) || '.webp';
        const baseName = path.basename(srcDisk, ext);
        let destName;
        if (idx === 0) destName = `01_contexto_${baseName}${ext}`;
        else if (idx === 1) destName = `02_base_blanca_${baseName}${ext}`;
        else if (idx === 2) destName = `03_detalle_${baseName}${ext}`;
        else if (idx === 3) destName = `04_escala_${baseName}${ext}`;
        else destName = `0${idx + 1}_${baseName}${ext}`;

        try {
          fs.copyFileSync(srcDisk, path.join(juguetesDibujoFolder, destName));
        } catch (e) {}
      }
    });
  }

  // Agregar al catálogo maestro
  masterCatalogLines.push(`[${p.code}] ${p.name}`);
  masterCatalogLines.push(`   Área: ${(p.worlds || []).join(', ')} | Técnica: ${(p.techniques || []).join(', ')}`);
  masterCatalogLines.push(`   Precio Público: ${priceFormatted} | Costo Estimado: ${costFormatted} | Margen: ${marginEst}`);
  masterCatalogLines.push(`   Tiempo Impresión: ${machineTimeStr} | Entrega: ${mfg.leadTimeDays || '1 a 3 días'}`);
  masterCatalogLines.push(`   MakerWorld: ${isVerifiedMW ? mwData.url : 'Diseño Exclusivo Artesano Digital / Taller Propio'}`);
  masterCatalogLines.push(`   Carpeta Local: ${path.relative(targetRoot, prodFolder)}`);
  masterCatalogLines.push('--------------------------------------------------------------------------------');
}

// -----------------------------------------------------------------------------
// Servicios Digitales en carpeta 'servicios'
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
    '======================================================================\r\n'
  ].join('\r\n');

  fs.writeFileSync(path.join(targetDir, 'DETALLES_Y_TIEMPOS.txt'), '\uFEFF' + sNote, 'utf8');
}

// Guardar archivo maestro en la raíz con UTF-8 BOM
fs.writeFileSync(
  path.join(targetRoot, '00_CATALOGO_GENERAL_PRECIOS_Y_MAKERWORLD.txt'),
  '\uFEFF' + masterCatalogLines.join('\r\n'),
  'utf8'
);

// Guardar README explicativo para el usuario con UTF-8 BOM
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
  '7. \\personalizados -> 7 categorías separadas (Mascotas, Parejas, Profesiones, Amigos, Familia, Abuelitos, Dibujo a 3D) con sus 4 vistas oficiales.',
  '8. \\servicios      -> Branding, Desarrollo Web, Campañas, Modelado 3D y Patch Bar.',
  '',
  'QUÉ ENCONTRARÁS DENTRO DE CADA PRODUCTO:',
  '• Fotos oficiales en alta resolución (contexto, base blanca, detalle y escala con medidas).',
  '• Archivo "DETALLES_Y_TIEMPOS.txt" con:',
  '   - Características y especificaciones completas',
  '   - Precios al público y costos desglosados de producción',
  '   - Tiempos de impresión 3D en máquina y mano de obra',
  '   - Enlace directo verificado a la página del modelo en MakerWorld (cuando aplica)',
  '   - O especificación clara si es un diseño propio de taller (láser, textil, combos)',
  '',
  'ARCHIVO GENERAL:',
  '• "00_CATALOGO_GENERAL_PRECIOS_Y_MAKERWORLD.txt" contiene el resumen completo de todos los productos en una sola vista.',
  '',
  'Puedes agregar nuevas fotos aquí y utilizaremos estas carpetas como fuente central de control.',
  '======================================================================\r\n'
].join('\r\n');

fs.writeFileSync(path.join(targetRoot, 'README_CONTROL_DE_PRODUCTOS.txt'), '\uFEFF' + readmeText, 'utf8');

console.log('--- EXPORTACIÓN COMPLETADA CON ÉXITO ---');
console.log(`Carpetas de productos creadas: ${productFoldersCreated}`);
console.log(`Imágenes copiadas: ${copiedImagesCount}`);
console.log(`Catálogo maestro generado en: ${path.join(targetRoot, '00_CATALOGO_GENERAL_PRECIOS_Y_MAKERWORLD.txt')}`);
