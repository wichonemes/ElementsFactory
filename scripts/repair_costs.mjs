import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_WORKSHOP_PARAMS,
  MAX_DISCOUNT_PERCENT,
  clampDiscountPercent,
  computeRecipeCost,
  applySummaryToRecipe,
  buildCostBreakdownFromSummary,
  repairProductCosts
} from '../shared/costing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dbPath = path.join(rootDir, 'server', 'data', 'db.json');
const reportPath = path.join(rootDir, 'scratch', 'cost-audit-report.json');
const backupDir = path.join(rootDir, 'server', 'data', 'backups');

const NEW_MATERIALS = [
  {
    id: 'mat-clavos-acero',
    name: 'Clavos de Acero Galvanizado 1" para Madera (100 pzas)',
    category: 'assembly',
    materialType: 'Fijación & Pegamento',
    color: 'Acero Galvanizado',
    finish: 'Natural',
    unit: 'paquete (100 pzas)',
    packageQuantity: 100,
    packageMeasurement: 'pza',
    currentStock: 8,
    minStockAlert: 2,
    costPerUnit: 35,
    supplierId: 'sup-empaques-slp',
    supplier: 'Herrajes & Ensamble San Luis',
    notes: 'Clavos pequeños para fijar bases, respaldos y ensambles de madera. Se cobran por pieza en la receta.'
  },
  {
    id: 'mat-tornillos-madera',
    name: 'Tornillos para Madera 8x1" Cabeza Plana (100 pzas)',
    category: 'assembly',
    materialType: 'Fijación & Pegamento',
    color: 'Acero Negro',
    finish: 'Fosfatado',
    unit: 'paquete (100 pzas)',
    packageQuantity: 100,
    packageMeasurement: 'pza',
    currentStock: 6,
    minStockAlert: 2,
    costPerUnit: 55,
    supplierId: 'sup-empaques-slp',
    supplier: 'Herrajes & Ensamble San Luis',
    notes: 'Tornillo para madera con punta y rosca gruesa. Para soportes, placas y ensambles que requieren desmontaje.'
  },
  {
    id: 'mat-bolsas-kraft-ventana',
    name: 'Bolsas Kraft con Ventana y Etiqueta para Producto (100 pzas)',
    category: 'packaging',
    materialType: 'Empaque & Presentación',
    color: 'Kraft Natural',
    finish: 'Ventana Transparente',
    unit: 'paquete (100 pzas)',
    packageQuantity: 100,
    packageMeasurement: 'pza',
    currentStock: 4,
    minStockAlert: 2,
    costPerUnit: 350,
    supplierId: 'sup-empaques-slp',
    supplier: 'Empaques y Embalajes SLP',
    notes: 'Bolsa kraft con ventana para llaveros, clickers y piezas pequeñas. Incluye etiqueta térmica con SKU.'
  }
];

function ensureNewMaterials(db) {
  db.rawMaterials = Array.isArray(db.rawMaterials) ? db.rawMaterials : [];
  const added = [];
  for (const material of NEW_MATERIALS) {
    if (!db.rawMaterials.some(m => m.id === material.id)) {
      db.rawMaterials.push({ ...material });
      added.push(material.id);
    }
  }
  return added;
}

function capCoupons(db) {
  const changed = [];
  for (const coupon of db.coupons || []) {
    if (coupon.type === 'percent' || coupon.discountPercent !== undefined) {
      const previous = Number(coupon.value ?? coupon.discountPercent ?? 0);
      const capped = clampDiscountPercent(previous);
      if (capped !== previous) {
        coupon.value = capped;
        coupon.discountPercent = capped;
        if (coupon.code === 'PROMO20') coupon.label = '15% de Descuento Especial';
        if (coupon.code === 'FLASHFINDE30') coupon.label = '15% Especial Oferta Relámpago de Fin de Semana';
        changed.push({ code: coupon.code, from: previous, to: capped });
      }
    }
  }
  return changed;
}

function capArcade(db) {
  const tiers = db.settings?.arcadeConfig?.discountTiers || [];
  const changed = [];
  for (const tier of tiers) {
    if (tier.discountPercent !== undefined) {
      const previous = Number(tier.discountPercent) || 0;
      const capped = clampDiscountPercent(previous);
      if (capped !== previous) {
        tier.discountPercent = capped;
        if (tier.code === 'TALLER20') {
          tier.label = '15% de Descuento VIP';
          tier.description = 'Descuento VIP máximo del taller, limitado al 15% (Mínimo $500 MXN)';
        }
        changed.push({ code: tier.code, from: previous, to: capped });
      }
    }
  }
  return changed;
}

function capDiscountFields(node) {
  let changed = 0;
  if (Array.isArray(node)) {
    node.forEach(item => { changed += capDiscountFields(item); });
    return changed;
  }
  if (!node || typeof node !== 'object') return changed;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'discountPercent' && Number(value) > MAX_DISCOUNT_PERCENT) {
      node[key] = MAX_DISCOUNT_PERCENT;
      changed += 1;
    } else if (/discountText|discountLabel/i.test(key) && typeof value === 'string') {
      const next = value.replace(/(\d+)%/, (match, pct) => Math.min(MAX_DISCOUNT_PERCENT, Number(pct)) + '%');
      if (next !== value) {
        node[key] = next;
        changed += 1;
      }
    } else if (value && typeof value === 'object') {
      changed += capDiscountFields(value);
    }
  }
  return changed;
}

function capDiscountCopy(db) {
  let changed = 0;
  const replacements = [
    ['hasta un 25%', 'hasta un 15%'],
    ['con hasta 25% de ahorro', 'con hasta 15% de ahorro'],
    ['Descuento del 20% aplicable', 'Descuento del 15% aplicable'],
    ['Descuento del 25% aplicable', 'Descuento del 15% aplicable'],
    ['Descuento del 30% aplicable', 'Descuento del 15% aplicable'],
    ['20% de Descuento en Pedidos Mayores', '15% de Descuento en Pedidos Mayores'],
    ['30% Especial Oferta Relámpago', '15% Especial Oferta Relámpago'],
    ['PROMO20', 'PROMO15'],
    ['FLASHFINDE30', 'FLASHFINDE15']
  ];
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') {
        let next = value;
        replacements.forEach(([from, to]) => { next = next.split(from).join(to); });
        if (next !== value) { node[key] = next; changed += 1; }
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    }
  };
  walk(db);
  return changed;
}

function main() {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`No se encontró ${dbPath}`);
  }
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(dbPath, path.join(backupDir, `db-before-cost-repair-${stamp}.json`));

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const addedMaterials = ensureNewMaterials(db);

  db.settings = db.settings || {};
  db.settings.workshopParams = {
    ...DEFAULT_WORKSHOP_PARAMS,
    ...(db.settings.workshopParams || {})
  };

  const products = [];
  for (const product of db.products || []) {
    const previousCost = Number(product.costPrice) || 0;
    const repaired = repairProductCosts(product, db.rawMaterials, db.settings.workshopParams);

    // Los servicios en vivo incluyen montaje, traslado y operación, no solo materiales.
    if (['servicio-patch-bar-en-vivo', 'combo-fiesta-recuerdos-patch-bar-anticruda'].includes(product.id)) {
      const existingItems = repaired.manufacturingRecipe?.items || [];
      const existingLogistics = existingItems.find(it => /Montaje, traslado y operaci/i.test(it.name || ''));
      const itemsWithoutLogistics = existingItems.filter(it => !/Montaje, traslado y operaci/i.test(it.name || ''));
      const logisticsItem = existingLogistics || {
        id: 'item-servicio-operacion',
        materialId: '',
        name: 'Montaje, traslado y operación del evento (personal y logística)',
        category: 'assembly',
        supplyType: 'indirect',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'servicio',
        unitCost: 300,
        totalCost: 300
      };
      const recipe = {
        ...repaired.manufacturingRecipe,
        items: [...itemsWithoutLogistics, logisticsItem]
      };
      const summary = computeRecipeCost(recipe, repaired, db.rawMaterials, db.settings.workshopParams);
      repaired.manufacturingRecipe = applySummaryToRecipe(recipe, summary);
      repaired.costPrice = summary.totalCost;
      repaired.costBreakdown = buildCostBreakdownFromSummary(summary, repaired.manufacturingRecipe, repaired.costBreakdown);
    }

    products.push({
      id: product.id,
      name: product.name,
      technique: repaired.manufacturingRecipe?.technique,
      items: repaired.manufacturingRecipe?.items?.length || 0,
      previousCost,
      newCost: repaired.costPrice,
      delta: Math.round((repaired.costPrice - previousCost) * 100) / 100,
      totalMaterialCost: repaired.manufacturingRecipe?.totalMaterialCost || 0,
      energyCost: repaired.manufacturingRecipe?.energyCost || 0,
      wearCost: repaired.manufacturingRecipe?.wearCost || 0,
      laborCost: repaired.manufacturingRecipe?.laborCost || 0,
      failureReserveCost: repaired.manufacturingRecipe?.failureReserveCost || 0,
      notes: (repaired.manufacturingRecipe?.items || []).map(it => `${it.name} (${it.totalQuantity} ${it.unit})`).slice(0, 9)
    });
    Object.assign(product, repaired);
  }

  const couponChanges = capCoupons(db);
  const arcadeChanges = capArcade(db);
  const discountFieldChanges = capDiscountFields(db);
  const discountCopyChanges = capDiscountCopy(db);

  db.meta = {
    ...(db.meta || {}),
    costRepairAt: new Date().toISOString(),
    costRepairVersion: 1,
    maxDiscountPercent: MAX_DISCOUNT_PERCENT
  };

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    repairedAt: new Date().toISOString(),
    addedMaterials,
    couponChanges,
    arcadeChanges,
    discountFieldChanges,
    discountCopyChanges,
    products
  }, null, 2), 'utf8');

  const changedCosts = products.filter(p => Math.abs(p.delta) >= 0.01);
  const noItems = products.filter(p => p.items === 0);
  console.log(`[COST REPAIR] ${products.length} productos reparados.`);
  console.log(`[COST REPAIR] ${changedCosts.length} costos ajustados. ${noItems.length} productos sin insumos.`);
  console.log(`[COST REPAIR] Materiales nuevos: ${addedMaterials.join(', ') || 'ninguno'}`);
  console.log(`[COST REPAIR] Cupones ajustados: ${couponChanges.length}. Tiers arcade ajustados: ${arcadeChanges.length}. Descuentos normalizados: ${discountFieldChanges}. Textos ajustados: ${discountCopyChanges}.`);
  console.log(`[COST REPAIR] Reporte: ${reportPath}`);
}

main();
