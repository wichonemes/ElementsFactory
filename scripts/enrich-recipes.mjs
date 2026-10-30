import fs from 'node:fs';
import {
  computeRecipeCost,
  applySummaryToRecipe,
  DEFAULT_WORKSHOP_PARAMS
} from '../shared/costing.js';

const BASE = process.env.ADMIN_BASE || 'https://artesano-digital.vercel.app';
const USERNAME = process.env.ADMIN_USER || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD;
const APPLY = process.argv.includes('--apply');

if (!PASSWORD) {
  console.error('Falta ADMIN_PASSWORD. Ejemplo: $env:ADMIN_PASSWORD="..." ; node scripts/enrich-recipes.mjs');
  process.exit(1);
}

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const money = (value) => Math.round((Number(value) || 0) * 100) / 100;

function substrateFor(product) {
  const text = normalize(`${product.name} ${(product.categories || []).join(' ')}`);
  if (/tote|bolsa/.test(text)) return 'Bolsa Tote de poliéster 100% para sublimación';
  if (/taza|tarro/.test(text)) return 'Taza de cerámica blanca 11 oz para sublimación';
  if (/termo/.test(text)) return 'Termo de acero inoxidable para sublimación';
  if (/playera|camiseta|textil/.test(text)) return 'Playera de poliéster para sublimación';
  if (/fotoboton|boton|botón/.test(text)) return 'Fotobotón acrílico para sublimación';
  if (/llavero/.test(text)) return 'Llavero sublimable de poliéster/MDF';
  return 'Artículo base de poliéster o cerámica para sublimación';
}

function componentFor(product) {
  const text = normalize(`${product.name} ${(product.categories || []).join(' ')}`);
  if (/clicker|fidget|switch|teclado/.test(text)) return 'Switch mecánico de teclado y herrajes de ensamble';
  if (/llavero|argolla/.test(text)) return 'Argolla metálica y herrajes de llavero';
  if (/lampara|luz|led/.test(text)) return 'Módulo LED, cable e interruptor';
  if (/organizador|bandeja|soporte|base/.test(text)) return 'Insertos y herrajes de ensamble';
  return 'Herrajes e insertos de ensamble';
}

function materialById(rawMaterials, id) {
  return rawMaterials.find(material => material.id === id) || null;
}

function substrateMaterialFor(product, rawMaterials) {
  const text = normalize(`${product.name} ${(product.categories || []).join(' ')}`);
  if (/tote|bolsa/.test(text)) return materialById(rawMaterials, 'mat-tote-bag-sublimable');
  if (/taza|tarro/.test(text)) return materialById(rawMaterials, 'mat-tazas-blancas-11oz');
  if (/termo/.test(text)) return materialById(rawMaterials, 'mat-termos-blancos-500ml');
  return null;
}

function item({ name, supplyType, unit, quantity, unitCost, category, materialId = '', supplier = '', notes = '' }) {
  const qty = Number(quantity) || 1;
  const cost = Number(unitCost) || 0;
  return {
    id: `item-enriched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    materialId,
    name,
    category: category || 'general',
    supplyType,
    manualGroup: true,
    netQuantity: qty,
    wasteQuantity: 0,
    totalQuantity: qty,
    unit: unit || 'pieza',
    unitCost: Math.round(cost * 10000) / 10000,
    totalCost: money(qty * cost),
    supplier,
    notes
  };
}

function hasItem(items, pattern) {
  return items.some(entry => pattern.test(normalize(entry.name)));
}

function enrichProduct(product, rawMaterials = []) {
  const originalItems = Array.isArray(product.manufacturingRecipe?.items)
    ? product.manufacturingRecipe.items
    : [];
  if (originalItems.length === 0) return null;

  const productText = normalize(`${product.name} ${(product.techniques || []).join(' ')} ${(product.categories || []).join(' ')}`);
  const isSublimation = /sublim|tote|taza|termo|playera|fotoboton|llavero sublimable/.test(productText);
  const isClicker = /clicker|fidget|switch|teclado/.test(productText);
  const isKeychain = /llavero|argolla/.test(productText);
  const isDtf = /dtf|transfer textil/.test(productText);

  let items = originalItems.map(entry => {
    const name = normalize(entry.name);
    let nextName = entry.name;
    let supplyType = entry.supplyType;
    let category = entry.category;
    let nextMaterialId = entry.materialId;
    let nextUnit = entry.unit;
    let nextUnitCost = entry.unitCost;
    let nextSupplier = entry.supplier;
    let changed = false;

    if (/articulo base sublimable/.test(name)) {
      const substrate = substrateMaterialFor(product, rawMaterials);
      nextName = substrate?.name || substrateFor(product);
      supplyType = 'direct';
      category = substrate?.category || 'sublimation';
      nextMaterialId = substrate?.id || entry.materialId;
      nextUnit = substrate?.unit || 'pieza';
      nextUnitCost = Number(substrate?.costPerUnit) > 0 ? Number(substrate.costPerUnit) : entry.unitCost;
      nextSupplier = substrate?.supplier || entry.supplier;
      changed = true;
    } else if (/componentes especificos del producto/.test(name)) {
      nextName = componentFor(product);
      supplyType = 'complementary';
      category = 'assembly';
      changed = true;
    } else if (/pegaloca|cianoacrilato y adhesivos/.test(name)) {
      nextName = 'Pegamento cianoacrilato para ensamble';
      supplyType = 'micro';
      category = 'consumables';
      changed = true;
    } else if (/lijas, acabados/.test(name)) {
      nextName = 'Lijas y consumibles de acabado';
      supplyType = 'finish';
      category = 'consumables';
      changed = true;
    } else if (/cajas de carton kraft/.test(name)) {
      nextName = 'Caja kraft + protección para envío';
      supplyType = 'indirect';
      category = 'packaging';
      changed = true;
    } else if (/cinta termica kapton/.test(name)) {
      supplyType = 'indirect';
      category = 'consumables';
      changed = true;
    } else if (/iman de neodimio/.test(name)) {
      supplyType = 'complementary';
      category = 'assembly';
      changed = true;
    }

    return changed
      ? {
          ...entry,
          name: nextName,
          supplyType,
          category,
          materialId: nextMaterialId,
          unit: nextUnit,
          unitCost: nextUnitCost,
          supplier: nextSupplier
        }
      : entry;
  });

  // Sustituye el renglón genérico de sublimación por papel, tinta y cinta.
  const genericConsumable = items.find(entry => /tinta, papel y consumibles de sublimacion/.test(normalize(entry.name)));
  const paperMat = materialById(rawMaterials, 'mat-papel-sublimacion');
  const inkMat = materialById(rawMaterials, 'mat-tintas-sublimacion-cmyk');
  const tapeMat = materialById(rawMaterials, 'mat-cinta-termica-kapton');

  if (genericConsumable) {
    items = items.filter(entry => entry !== genericConsumable);
    items.push(
      item({
        name: 'Papel de sublimación A4 (transfer)',
        supplyType: 'indirect',
        unit: 'hoja',
        quantity: 1,
        unitCost: paperMat ? 1.8 : 2.5,
        category: 'consumables',
        materialId: paperMat?.id || '',
        supplier: paperMat?.supplier || ''
      }),
      item({
        name: 'Tinta de sublimación CMYK',
        supplyType: 'indirect',
        unit: 'ml',
        quantity: 5,
        unitCost: inkMat ? 1.2 : 1.2,
        category: 'consumables',
        materialId: inkMat?.id || '',
        supplier: inkMat?.supplier || ''
      }),
      item({
        name: 'Cinta térmica para fijar el transfer',
        supplyType: 'indirect',
        unit: 'm',
        quantity: 1,
        unitCost: tapeMat ? 0.91 : 2,
        category: 'consumables',
        materialId: tapeMat?.id || '',
        supplier: tapeMat?.supplier || ''
      })
    );
  } else if (isSublimation && !hasItem(items, /papel de sublimacion|tinta de sublimacion|cinta termica/)) {
    items.push(
      item({
        name: 'Papel de sublimación A4 (transfer)',
        supplyType: 'indirect',
        unit: 'hoja',
        quantity: 1,
        unitCost: paperMat ? 1.8 : 2.5,
        category: 'consumables',
        materialId: paperMat?.id || '',
        supplier: paperMat?.supplier || ''
      }),
      item({
        name: 'Tinta de sublimación CMYK',
        supplyType: 'indirect',
        unit: 'ml',
        quantity: 5,
        unitCost: inkMat ? 1.2 : 1.2,
        category: 'consumables',
        materialId: inkMat?.id || '',
        supplier: inkMat?.supplier || ''
      }),
      item({
        name: 'Cinta térmica para fijar el transfer',
        supplyType: 'indirect',
        unit: 'm',
        quantity: 1,
        unitCost: tapeMat ? 0.91 : 2,
        category: 'consumables',
        materialId: tapeMat?.id || '',
        supplier: tapeMat?.supplier || ''
      })
    );
  }

  const switchMat = materialById(rawMaterials, 'mat-switches-clicker-mecanico');
  const ringMat = materialById(rawMaterials, 'mat-argollas-llavero');

  if (isClicker && !hasItem(items, /switch|teclado|interruptor/)) {
    items.push(item({
      name: switchMat?.name || 'Switch mecánico de teclado 3 pines Outemu Blue',
      supplyType: 'complementary',
      unit: 'pieza',
      quantity: 1,
      unitCost: switchMat ? Number(switchMat.costPerUnit) / 10 : 7.2,
      category: 'assembly',
      materialId: switchMat?.id || '',
      supplier: switchMat?.supplier || ''
    }));
  }

  if (isClicker && !hasItem(items, /argolla|llavero/)) {
    items.push(item({
      name: ringMat?.name || 'Argolla metálica reforzada para llavero',
      supplyType: 'complementary',
      unit: 'pieza',
      quantity: 1,
      unitCost: ringMat ? Number(ringMat.costPerUnit) / 100 : 2.5,
      category: 'assembly',
      materialId: ringMat?.id || '',
      supplier: ringMat?.supplier || ''
    }));
  }

  if (isDtf && !items.some(entry => entry.supplyType === 'production' || /maquila|impresion dtf|servicio/.test(normalize(entry.name)))) {
    items.push(item({
      name: 'Maquila de impresión DTF',
      supplyType: 'production',
      unit: 'servicio',
      quantity: 1,
      unitCost: 25,
      category: 'services',
      notes: 'Servicio externo de impresión y transfer DTF'
    }));
  }

  if (JSON.stringify(items) === JSON.stringify(originalItems)) return null;

  const nextRecipe = { ...product.manufacturingRecipe, items };
  const summary = computeRecipeCost(nextRecipe, product, [], DEFAULT_WORKSHOP_PARAMS);
  const recipe = applySummaryToRecipe(nextRecipe, summary);
  return {
    ...product,
    manufacturingRecipe: recipe,
    costPrice: summary.totalCost,
    updatedAt: new Date().toISOString()
  };
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
const [products, rawMaterials, settings] = await Promise.all([
  fetch(`${BASE}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => response.json()),
  fetch(`${BASE}/api/admin/raw-materials`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => response.json()),
  fetch(`${BASE}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => response.json()).catch(() => ({}))
]);

const workshopParams = settings?.workshopParams || DEFAULT_WORKSHOP_PARAMS;
const changes = [];
for (const original of products) {
  let product = enrichProduct(original, rawMaterials) || original;
  const recipe = product.manufacturingRecipe;
  if (recipe?.items?.length) {
    const summary = computeRecipeCost(recipe, product, rawMaterials, workshopParams);
    const nextRecipe = applySummaryToRecipe(recipe, summary);
    const costChanged = Math.abs(Number(product.costPrice || 0) - Number(summary.totalCost || 0)) > 0.01;
    const recipeChanged = JSON.stringify(nextRecipe) !== JSON.stringify(recipe);
    if (costChanged || recipeChanged) {
      product = {
        ...product,
        manufacturingRecipe: nextRecipe,
        costPrice: summary.totalCost,
        updatedAt: new Date().toISOString()
      };
    }
  }
  if (product !== original) changes.push(product);
}

console.log(APPLY ? 'APLICANDO CAMBIOS' : 'SIMULACIÓN (usa --apply para guardar)');
console.log(`Productos revisados: ${products.length}`);
console.log(`Productos con mejoras: ${changes.length}`);
for (const product of changes.slice(0, 12)) {
  const before = new Set((product.manufacturingRecipe?.items || []).map(entry => normalize(entry.name)));
  console.log(`- ${product.code || product.sku || product.id} · ${product.name}`);
  console.log(`  costo: $${money(product.costPrice)} · renglones: ${product.manufacturingRecipe.items.length}`);
  product.manufacturingRecipe.items
    .filter(entry => !before.has(normalize(entry.name)) || /sublimacion|switch|maquila|componente/.test(normalize(entry.name)))
    .slice(0, 6)
    .forEach(entry => console.log(`    · ${entry.name} (${entry.supplyType}) $${money(entry.totalCost)}`));
}

if (APPLY) {
  const backupPath = `enrich-recipes-backup-${Date.now()}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`Respaldo local: ${backupPath}`);

  let saved = 0;
  for (const product of changes) {
    const response = await fetch(`${BASE}/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      console.error(`Error guardando ${product.code || product.id}: ${response.status}`);
      continue;
    }
    saved += 1;
    console.log(`Guardado ${product.code || product.id}`);
  }
  console.log(`Productos guardados: ${saved}`);
}
