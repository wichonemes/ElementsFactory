import fs from 'node:fs';

const BASE = process.env.ADMIN_BASE || 'https://artesano-digital.vercel.app';
const USERNAME = process.env.ADMIN_USER || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD;
const APPLY = process.argv.includes('--apply');

if (!PASSWORD) {
  console.error('Falta ADMIN_PASSWORD.');
  process.exit(1);
}

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const money = (value) => Math.round((Number(value) || 0) * 100) / 100;

function areaFor(material) {
  const text = normalize(`${material.name} ${material.category}`);
  const category = String(material.category || '').toLowerCase();
  if (category === '3d' || /filamento|\bpla\b|\btpu\b|\bpetg\b|\basa\b|\babs\b/.test(text)) return '3d';
  if (category === 'laser' || /madera|triplay|mdf|acrilico|pino|nogal/.test(text)) return 'laser';
  if (category === 'sublimation' || /sublimacion|taza|termo|tarro|papel transfer/.test(text)) return 'sublimation';
  if (category === 'vinyl' || /vinil|puf|textil|transfer/.test(text)) return 'vinyl';
  if (category === 'print' || /impresion laser|tinta|papel bond|invitacion/.test(text)) return 'print';
  if (category === 'assembly' || /herraje|tornillo|clavo|iman|argolla|led|broche|switch/.test(text)) return 'assembly';
  if (category === 'packaging' || /caja|bolsa|empaque|etiqueta|kraft|celofan/.test(text)) return 'packaging';
  if (category === 'spare_parts' || /boquilla|nozzle|hotend|refaccion|repuesto|correa/.test(text)) return 'spare_parts';
  if (category === 'consumables' || /barniz|tinte|pintura|pegamento|lija|cinta|guante|estopa|limpieza/.test(text)) return 'consumables';
  return 'other';
}

function groupFor(material) {
  const text = normalize(`${material.name} ${material.category}`);
  const category = String(material.category || '').toLowerCase();
  if (/papel.*sublim|hoja.*sublim|tinta.*sublim|cinta.*sublim|cinta.*termica|kapton/.test(text)) return 'indirect';
  if (category === 'packaging' || /caja|bolsa|empaque|etiqueta|kraft|celofan|viruta/.test(text)) return 'packaging';
  if (/barniz|tinte|pintura|sellador|laca|esmalte|acabado/.test(text)) return 'finish';
  if (/diseno|licencia|archivo|modelo digital|arte digital|render/.test(text)) return 'intangible';
  if (/servicio|maquila|corte externo|grabado externo|instalacion/.test(text)) return 'production';
  if (/tornillo|clavo|tuerca|argolla|iman|led|interruptor|switch|herraje|broche|cierre|remache/.test(text)) return 'complementary';
  if (/guante|estopa|limpieza|proteccion|mascarilla|bata/.test(text)) return 'indirect';
  if (/pegamento|resistol|cianocrilato|lija|cinta|brocha|pincel|alcohol|diluyente/.test(text) || category === 'consumables') return 'micro';
  return 'direct';
}

const DEFAULT_SUPPLIES = [
  // Impresión 3D
  { area: '3d', group: 'intangible', name: 'Modelado y diseño 3D personalizado', category: '3d', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 150, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Modelado, reparación de malla y preparación de archivo para impresión.' },
  { area: '3d', group: 'micro', name: 'Lija fina 220 para pulido 3D', category: '3d', materialType: 'Consumible de acabado', unit: 'pliego', costPerUnit: 15, currentStock: 20, minStockAlert: 5, supplier: 'Ferretería del Taller', notes: 'Lijado de soportes, marcas y uniones.' },
  { area: '3d', group: 'production', name: 'Maquila de impresión 3D externa', category: '3d', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 80, currentStock: 999, minStockAlert: 0, supplier: 'Proveedor externo de impresión 3D', notes: 'Impresión subcontratada para piezas grandes o excedentes de capacidad.' },

  // Láser
  { area: 'laser', group: 'intangible', name: 'Diseño vectorial para corte láser', category: 'laser', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 120, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Trazos, acomodo de piezas y preparación de archivo SVG/DXF.' },
  { area: 'laser', group: 'indirect', name: 'Guantes y protección para corte láser', category: 'laser', materialType: 'Seguridad', unit: 'paquete', costPerUnit: 120, currentStock: 8, minStockAlert: 2, supplier: 'Ferretería del Taller', notes: 'Guantes, lentes y protección para manejo de piezas calientes.' },
  { area: 'laser', group: 'production', name: 'Maquila de corte y grabado láser externo', category: 'laser', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 60, currentStock: 999, minStockAlert: 0, supplier: 'Proveedor externo de corte láser', notes: 'Corte o grabado subcontratado para materiales o volúmenes especiales.' },

  // Sublimación
  { area: 'sublimation', group: 'intangible', name: 'Diseño de arte para sublimación', category: 'sublimation', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 100, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Preparación de arte, mockup y archivo listo para transfer.' },
  { area: 'sublimation', group: 'micro', name: 'Cinta de precisión para prensa', category: 'sublimation', materialType: 'Consumible de prensa', unit: 'rollo', costPerUnit: 35, currentStock: 6, minStockAlert: 2, supplier: 'Sublimax Mayorista Cerámica & Textil', notes: 'Fijación de detalles pequeños y protección de zonas.' },
  { area: 'sublimation', group: 'finish', name: 'Acabado protector mate para sublimación', category: 'sublimation', materialType: 'Acabado', unit: 'frasco', costPerUnit: 180, currentStock: 4, minStockAlert: 1, supplier: 'Sublimax Mayorista Cerámica & Textil', notes: 'Protección mate para piezas sublimadas de uso intensivo.' },
  { area: 'sublimation', group: 'production', name: 'Maquila de sublimación externa', category: 'sublimation', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 40, currentStock: 999, minStockAlert: 0, supplier: 'Proveedor externo de sublimación', notes: 'Producción subcontratada para piezas o volúmenes especiales.' },

  // Vinil
  { area: 'vinyl', group: 'complementary', name: 'Argollas y broches para vinil textil', category: 'vinyl', materialType: 'Herrajes', unit: 'paquete', costPerUnit: 95, currentStock: 5, minStockAlert: 1, supplier: 'Herrajes & Ensamble San Luis', notes: 'Argollas, broches y remaches para prendas y accesorios.' },
  { area: 'vinyl', group: 'intangible', name: 'Diseño vectorial para vinil textil', category: 'vinyl', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 100, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Separación de colores y preparación de archivo de corte.' },
  { area: 'vinyl', group: 'micro', name: 'Cinta de transferencia para vinil', category: 'vinyl', materialType: 'Consumible de aplicación', unit: 'rollo', costPerUnit: 120, currentStock: 6, minStockAlert: 2, supplier: 'VinilTech México & Textil', notes: 'Transferencia y aplicación de vinil de corte.' },
  { area: 'vinyl', group: 'finish', name: 'Acabado fijador textil', category: 'vinyl', materialType: 'Acabado', unit: 'frasco', costPerUnit: 160, currentStock: 4, minStockAlert: 1, supplier: 'VinilTech México & Textil', notes: 'Fijado y protección de vinil textil después del planchado.' },
  { area: 'vinyl', group: 'indirect', name: 'Guantes y limpieza para vinil', category: 'vinyl', materialType: 'Seguridad y limpieza', unit: 'paquete', costPerUnit: 90, currentStock: 8, minStockAlert: 2, supplier: 'VinilTech México & Textil', notes: 'Guantes, paños y limpieza de plancha y superficies.' },

  // Impresión
  { area: 'print', group: 'direct', name: 'Papel couché brillante 300g A4', category: 'print', materialType: 'Papel de impresión', unit: 'paquete (100 hojas)', costPerUnit: 160, currentStock: 10, minStockAlert: 2, supplier: 'Imprenta & Papelería del Centro', notes: 'Invitaciones, tarjetas y piezas de alta presentación.' },
  { area: 'print', group: 'direct', name: 'Cartulina opalina 180g A4', category: 'print', materialType: 'Papel de impresión', unit: 'paquete (50 hojas)', costPerUnit: 120, currentStock: 8, minStockAlert: 2, supplier: 'Imprenta & Papelería del Centro', notes: 'Papelería fina, menús y tarjetas.' },
  { area: 'print', group: 'direct', name: 'Papel bond 75g carta', category: 'print', materialType: 'Papel de impresión', unit: 'paquete (500 hojas)', costPerUnit: 180, currentStock: 6, minStockAlert: 2, supplier: 'Imprenta & Papelería del Centro', notes: 'Impresión de documentos, pruebas y papelería general.' },
  { area: 'print', group: 'complementary', name: 'Argollas y elásticos para papelería', category: 'print', materialType: 'Herrajes de papelería', unit: 'paquete', costPerUnit: 75, currentStock: 10, minStockAlert: 2, supplier: 'Imprenta & Papelería del Centro', notes: 'Argollas, elásticos y sujetadores para libretas y tarjetas.' },
  { area: 'print', group: 'intangible', name: 'Diseño editorial para impresión', category: 'print', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 150, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Diagramación, tipografía y preparación para imprenta.' },
  { area: 'print', group: 'micro', name: 'Cinta doble cara para papelería', category: 'print', materialType: 'Consumible de armado', unit: 'rollo', costPerUnit: 45, currentStock: 10, minStockAlert: 2, supplier: 'Imprenta & Papelería del Centro', notes: 'Armado de tarjetas, invitaciones y empaques.' },
  { area: 'print', group: 'finish', name: 'Acabado laminado mate para impresión', category: 'print', materialType: 'Acabado', unit: 'servicio', costPerUnit: 35, currentStock: 999, minStockAlert: 0, supplier: 'Imprenta & Papelería del Centro', notes: 'Laminado mate o brillante por pieza.' },
  { area: 'print', group: 'indirect', name: 'Guantes y limpieza para impresión', category: 'print', materialType: 'Seguridad y limpieza', unit: 'paquete', costPerUnit: 80, currentStock: 6, minStockAlert: 2, supplier: 'Imprenta & Papelería del Centro', notes: 'Guantes, paños y limpieza de equipos.' },
  { area: 'print', group: 'production', name: 'Maquila de impresión offset y láser', category: 'print', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 50, currentStock: 999, minStockAlert: 0, supplier: 'Imprenta externa', notes: 'Impresión subcontratada para tirajes y formatos especiales.' },

  // Ensamble
  { area: 'assembly', group: 'intangible', name: 'Plano de ensamble y diseño técnico', category: 'assembly', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 80, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Plano de armado, secuencia y ficha técnica.' },
  { area: 'assembly', group: 'indirect', name: 'Guantes y limpieza para ensamble', category: 'assembly', materialType: 'Seguridad y limpieza', unit: 'paquete', costPerUnit: 90, currentStock: 6, minStockAlert: 2, supplier: 'Herrajes & Ensamble San Luis', notes: 'Guantes, paños y limpieza de piezas.' },
  { area: 'assembly', group: 'production', name: 'Servicio externo de ensamble', category: 'assembly', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 60, currentStock: 999, minStockAlert: 0, supplier: 'Proveedor externo de ensamble', notes: 'Armado subcontratado para lotes.' },

  // Empaques
  { area: 'packaging', group: 'intangible', name: 'Diseño gráfico de marca', category: 'packaging', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 120, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Etiquetas, sellos y presentación de marca.' },
  { area: 'packaging', group: 'micro', name: 'Cinta adhesiva para sellado', category: 'packaging', materialType: 'Consumible de empaque', unit: 'rollo', costPerUnit: 35, currentStock: 10, minStockAlert: 2, supplier: 'Empaques & Cajas Cartón México', notes: 'Sellado y refuerzo de cajas.' },
  { area: 'packaging', group: 'finish', name: 'Acabado protector para presentación', category: 'packaging', materialType: 'Acabado', unit: 'servicio', costPerUnit: 20, currentStock: 999, minStockAlert: 0, supplier: 'Empaques & Cajas Cartón México', notes: 'Protección y presentación final del empaque.' },
  { area: 'packaging', group: 'production', name: 'Maquila de impresión externa', category: 'packaging', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 45, currentStock: 999, minStockAlert: 0, supplier: 'Imprenta externa', notes: 'Impresión de empaques y etiquetas.' },

  // Refacciones
  { area: 'spare_parts', group: 'complementary', name: 'Tornillos y herramienta de ajuste', category: 'spare_parts', materialType: 'Herramienta', unit: 'set', costPerUnit: 140, currentStock: 4, minStockAlert: 1, supplier: 'Ferretería del Taller', notes: 'Llaves, tornillos y herramienta para calibración.' },
  { area: 'spare_parts', group: 'intangible', name: 'Diseño técnico de refacción', category: 'spare_parts', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 100, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Modelado y plano de refacción.' },
  { area: 'spare_parts', group: 'finish', name: 'Acabado y lubricante para mecanismos', category: 'spare_parts', materialType: 'Acabado', unit: 'kit', costPerUnit: 120, currentStock: 4, minStockAlert: 1, supplier: 'Ferretería del Taller', notes: 'Lubricación y protección de mecanismos.' },
  { area: 'spare_parts', group: 'indirect', name: 'Guantes y limpieza para refacciones', category: 'spare_parts', materialType: 'Seguridad y limpieza', unit: 'paquete', costPerUnit: 90, currentStock: 6, minStockAlert: 2, supplier: 'Ferretería del Taller', notes: 'Guantes y limpieza de componentes.' },
  { area: 'spare_parts', group: 'production', name: 'Servicio técnico externo', category: 'spare_parts', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 180, currentStock: 999, minStockAlert: 0, supplier: 'Servicio técnico externo', notes: 'Diagnóstico y reparación especializada.' },

  // Consumibles
  { area: 'consumables', group: 'intangible', name: 'Diseño de guía de aplicación', category: 'consumables', materialType: 'Servicio digital', unit: 'servicio', costPerUnit: 60, currentStock: 999, minStockAlert: 0, supplier: 'Diseño interno / colaborador', notes: 'Instructivo de uso y aplicación.' },
  { area: 'consumables', group: 'indirect', name: 'Guantes y estopa para aplicación', category: 'consumables', materialType: 'Seguridad y limpieza', unit: 'paquete', costPerUnit: 85, currentStock: 8, minStockAlert: 2, supplier: 'Ferretería del Taller', notes: 'Guantes, estopa y limpieza.' },
  { area: 'consumables', group: 'production', name: 'Servicio externo de aplicación', category: 'consumables', materialType: 'Servicio externo', unit: 'servicio', costPerUnit: 70, currentStock: 999, minStockAlert: 0, supplier: 'Proveedor externo', notes: 'Aplicación o acabado subcontratado.' }
];

function specificComponentName(product) {
  const text = normalize(product.name);
  if (/llavero/.test(text)) return 'Argolla metálica y herrajes de llavero';
  if (/iman|magnet/.test(text)) return 'Imanes de neodimio y herrajes';
  if (/lampara|luz|led/.test(text)) return 'Módulo LED, cable e interruptor';
  if (/portabolsas|bolsa/.test(text)) return 'Broche y argolla para portabolsas';
  if (/soporte|base|escritorio|celular/.test(text)) return 'Insertos antideslizantes y herrajes de soporte';
  if (/organizador|bandeja|charola/.test(text)) return 'Insertos y herrajes de ensamble';
  if (/maceta|planta/.test(text)) return 'Plato de drenaje y ensamble';
  if (/figura|funko|retrato/.test(text)) return 'Insertos y base para figura';
  if (/starter|pack|combo|kit/.test(text)) return 'Componentes de ensamble del kit';
  return 'Herrajes e insertos de ensamble';
}

const loginResponse = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: USERNAME, password: PASSWORD })
});
if (!loginResponse.ok) {
  console.error('No se pudo iniciar sesión:', loginResponse.status);
  process.exit(1);
}
const { token } = await loginResponse.json();
const headers = { Authorization: `Bearer ${token}` };
const [materials, products] = await Promise.all([
  fetch(`${BASE}/api/admin/raw-materials`, { headers }).then(r => r.json()),
  fetch(`${BASE}/api/admin/products`, { headers }).then(r => r.json())
]);

const occupied = new Set(materials.map(material => `${areaFor(material)}|${groupFor(material)}`));
const suppliesToAdd = DEFAULT_SUPPLIES.filter(supply => {
  if (occupied.has(`${supply.area}|${supply.group}`)) return false;
  if (materials.some(material => normalize(material.name) === normalize(supply.name))) return false;
  return true;
});

const productChanges = [];
for (const product of products) {
  let next = product;
  const recipeItems = product.manufacturingRecipe?.items || [];
  const nextItems = recipeItems.map(item => {
    if (/herrajes e insertos de ensamble|componentes especificos del producto/.test(normalize(item.name))) {
      return { ...item, name: specificComponentName(product) };
    }
    return item;
  });

  const specifications = { ...(product.specifications || {}) };
  let nextSpecifications = specifications;
  if (!specifications.careNotes) {
    nextSpecifications = { ...specifications, careNotes: 'Limpieza con paño seco. Evitar humedad y golpes.' };
  }

  const nextFields = {};
  if (!product.detailImage) nextFields.detailImage = product.whiteBgImage || product.primaryImage || '';
  if (!product.measureImage) nextFields.measureImage = product.whiteBgImage || product.primaryImage || '';
  if (!product.availability) nextFields.availability = 'in_stock';
  if (product.stockQuantity === undefined || product.stockQuantity === null || product.stockQuantity === '') {
    nextFields.stockQuantity = 0;
    nextFields.availability = 'made_to_order';
  }

  const itemsChanged = JSON.stringify(nextItems) !== JSON.stringify(recipeItems);
  const specsChanged = JSON.stringify(nextSpecifications) !== JSON.stringify(specifications);
  if (itemsChanged || specsChanged || Object.keys(nextFields).length) {
    next = {
      ...product,
      ...nextFields,
      specifications: nextSpecifications,
      manufacturingRecipe: itemsChanged
        ? { ...product.manufacturingRecipe, items: nextItems }
        : product.manufacturingRecipe,
      updatedAt: new Date().toISOString()
    };
    productChanges.push(next);
  }
}

console.log(APPLY ? 'APLICANDO DATOS FALTANTES' : 'SIMULACIÓN (usa --apply para guardar)');
console.log(`Insumos por agregar: ${suppliesToAdd.length}`);
for (const supply of suppliesToAdd) console.log(`  + [${supply.area}/${supply.group}] ${supply.name} · $${supply.costPerUnit}`);
console.log(`Productos por completar: ${productChanges.length}`);
for (const product of productChanges.slice(0, 20)) {
  console.log(`  · ${product.code || product.id} · ${product.name}`);
}

if (APPLY) {
  const backupPath = `fill-data-backup-${Date.now()}.json`;
  fs.writeFileSync(backupPath, JSON.stringify({ materials, products }, null, 2), 'utf8');
  console.log(`Respaldo: ${backupPath}`);

  let added = 0;
  for (const supply of suppliesToAdd) {
    const payload = {
      name: supply.name,
      category: supply.category,
      materialType: supply.materialType,
      color: 'N/A',
      finish: 'N/A',
      unit: supply.unit,
      packageQuantity: 1,
      packageMeasurement: 'pieza',
      currentStock: supply.currentStock,
      minStockAlert: supply.minStockAlert,
      costPerUnit: money(supply.costPerUnit),
      supplier: supply.supplier,
      supplierId: '',
      notes: supply.notes
    };
    const response = await fetch(`${BASE}/api/admin/raw-materials`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      added += 1;
      console.log(`Insumo agregado: ${supply.name}`);
    } else {
      console.error(`Error agregando ${supply.name}: ${response.status}`);
    }
  }

  let saved = 0;
  for (const product of productChanges) {
    const response = await fetch(`${BASE}/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (response.ok) {
      saved += 1;
      console.log(`Producto completado: ${product.code || product.id}`);
    } else {
      console.error(`Error actualizando ${product.code || product.id}: ${response.status}`);
    }
  }
  console.log(`Insumos agregados: ${added}`);
  console.log(`Productos actualizados: ${saved}`);
}
