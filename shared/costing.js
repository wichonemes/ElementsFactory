/**
 * shared/costing.js
 * Fuente única de verdad para costos de producción, recetas y descuentos.
 * Se usa tanto en el panel administrativo (React/Vite) como en el servidor (Node).
 * No contiene dependencias de React ni APIs del navegador.
 */

export const MAX_DISCOUNT_PERCENT = 15;

export const DEFAULT_WORKSHOP_PARAMS = {
  plaPerKg: 500,
  tpuPerKg: 700,
  electricityPerHour: 1.04,
  wearPerHour: 3.0,
  laborPerHour: 60,
  filamentWastePercent: 15,
  targetMarginPercent: 40,
  reservePercent: 10,
  failureReservePercent: 3,
  fixedOverheadPerUnit: 0,
  kwhCost: 3.5,
  ivaPercent: 16,
  includeIvaInCost: true,
  cardFeePercent: 4.1,
  rateStatus: 'Estimadas'
};

export const TECHNIQUE_MACHINE_PROFILE = {
  '3d': { watts: 250, minutes: 120, laborMinutes: 8 },
  laser: { watts: 450, minutes: 20, laborMinutes: 12 },
  sublimation: { watts: 1800, minutes: 6, laborMinutes: 6 },
  impresion_laser: { watts: 900, minutes: 5, laborMinutes: 7 },
  print: { watts: 900, minutes: 5, laborMinutes: 7 },
  dtf: { watts: 1800, minutes: 12, laborMinutes: 10 },
  vinyl: { watts: 60, minutes: 12, laborMinutes: 12 },
  nfc: { watts: 250, minutes: 30, laborMinutes: 10 },
  assembly: { watts: 0, minutes: 15, laborMinutes: 15 }
};

export function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function round2(value) {
  return Math.round((num(value) + Number.EPSILON) * 100) / 100;
}

export function round4(value) {
  return Math.round((num(value) + Number.EPSILON) * 10000) / 10000;
}

export function clampDiscountPercent(value, max = MAX_DISCOUNT_PERCENT) {
  return Math.max(0, Math.min(max, num(value)));
}

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeMeasure(value) {
  const m = normalizeText(value);
  if (['g', 'gr', 'gramo', 'gramos'].includes(m)) return 'g';
  if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(m)) return 'kg';
  if (['ml', 'mililitro', 'mililitros'].includes(m)) return 'ml';
  if (['l', 'lt', 'litro', 'litros'].includes(m)) return 'l';
  if (['cm', 'centimetro', 'centimetros'].includes(m)) return 'cm';
  if (['m', 'metro', 'metros', 'metro lineal'].includes(m)) return 'm';
  if (['cm2', 'cm²'].includes(m)) return 'cm2';
  if (['pza', 'pzas', 'pieza', 'piezas'].includes(m)) return 'pza';
  return m;
}

export function materialUnitCost(material, requestedUnit = '') {
  if (!material) return 0;
  const packageCost = num(material.costPerUnit ?? material.unitCost ?? material.cost, 0);
  if (packageCost <= 0) return 0;

  const rawUnit = String(material.unit || material.packageMeasurement || '');
  let packageQty = num(material.packageQuantity, 0);
  let packageMeasure = normalizeMeasure(material.packageMeasurement || '');

  if (!packageMeasure) {
    if (/kg|kilo/i.test(rawUnit)) packageMeasure = 'kg';
    else if (/litro|lt\b/i.test(rawUnit)) packageMeasure = 'l';
    else if (/ml\b/i.test(rawUnit)) packageMeasure = 'ml';
    else if (/cm²|cm2/i.test(rawUnit)) packageMeasure = 'cm2';
    else if (/cm\b/i.test(rawUnit)) packageMeasure = 'cm';
    else if (/m\b|metro/i.test(rawUnit)) packageMeasure = 'm';
    else if (/pza|pieza|paquete|bolsa|caja|set|placa|lamina|lámina|rollo|bote|frasco|lata|botella/i.test(rawUnit)) packageMeasure = 'pza';
    else packageMeasure = normalizeMeasure(rawUnit) || 'pza';
  }

  if (packageQty <= 0) {
    const numbers = rawUnit.match(/(\d+(?:\.\d+)?)/g);
    if (numbers && numbers.length) {
      const last = Number(numbers[numbers.length - 1]);
      if (Number.isFinite(last) && last > 0) packageQty = last;
    }
  }
  if (packageQty <= 0) packageQty = 1;

  let targetMeasure = normalizeMeasure(requestedUnit || packageMeasure);
  if (targetMeasure === 'pza' && packageMeasure === 'pza') {
    return packageCost / packageQty;
  }

  // Convertir la cantidad del paquete a la unidad solicitada.
  let qtyInTarget = packageQty;
  if (packageMeasure === 'kg' && targetMeasure === 'g') qtyInTarget = packageQty * 1000;
  else if (packageMeasure === 'g' && targetMeasure === 'kg') qtyInTarget = packageQty / 1000;
  else if (packageMeasure === 'l' && targetMeasure === 'ml') qtyInTarget = packageQty * 1000;
  else if (packageMeasure === 'ml' && targetMeasure === 'l') qtyInTarget = packageQty / 1000;
  else if (packageMeasure === 'm' && targetMeasure === 'cm') qtyInTarget = packageQty * 100;
  else if (packageMeasure === 'cm' && targetMeasure === 'm') qtyInTarget = packageQty / 100;
  else if (packageMeasure !== targetMeasure && packageMeasure !== 'pza') {
    // Si no hay conversión conocida, conservamos el paquete completo.
    qtyInTarget = packageQty;
  }

  return qtyInTarget > 0 ? packageCost / qtyInTarget : packageCost;
}

function findMaterial(rawMaterials = [], item = {}) {
  if (!Array.isArray(rawMaterials) || rawMaterials.length === 0) return null;
  if (item.materialId) {
    const exact = rawMaterials.find(m => m.id === item.materialId);
    if (exact) return exact;
  }
  const itemName = normalizeText(item.name);
  if (!itemName) return null;
  return rawMaterials.find(m => {
    const matName = normalizeText(m.name);
    return matName === itemName || matName.includes(itemName) || itemName.includes(matName);
  }) || null;
}

function findMaterialByQuery(rawMaterials = [], queries = [], category = null) {
  const list = Array.isArray(rawMaterials) ? rawMaterials : [];
  for (const query of queries) {
    const q = normalizeText(query);
    const found = list.find(m => {
      if (category && m.category !== category) return false;
      return normalizeText(m.name).includes(q);
    });
    if (found) return found;
  }
  return null;
}

export function normalizeRecipeItems(items = [], rawMaterials = []) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const material = findMaterial(rawMaterials, item);
    const netQuantity = num(item.netQuantity ?? item.quantity, 0);
    const wasteQuantity = num(item.wasteQuantity, 0);
    const totalQuantity = num(item.totalQuantity, netQuantity + wasteQuantity);
    let unitCost = num(item.unitCost, 0);
    if (unitCost <= 0 && material) {
      unitCost = materialUnitCost(material, item.unit);
    }
    return {
      ...item,
      id: item.id || `item-${index + 1}`,
      materialId: material?.id || item.materialId || '',
      category: item.category || material?.category || 'materials',
      supplyType: item.supplyType || (item.category === 'consumables' || /lija|cinta|estopa|sierra|brocha|guante/i.test(item.name || '') ? 'indirect' : 'direct'),
      netQuantity,
      wasteQuantity,
      totalQuantity: round2(totalQuantity),
      unitCost: round4(unitCost),
      totalCost: round2(totalQuantity * unitCost)
    };
  });
}

const SUPPLY_TYPES = new Set([
  'direct', 'complementary', 'intangible', 'micro',
  'finish', 'indirect', 'production', 'component'
]);

/**
 * Clasifica un insumo en el grupo de receta correcto cuando el dato viejo
 * venía como "direct" por defecto. Respeta los movimientos manuales.
 */
export function inferSupplyType(item = {}) {
  const current = item.supplyType;
  if (item.manualGroup && current) return current;
  if (current === 'component' || item.linkedProductId) return 'component';

  const text = normalizeText(`${item.name || ''} ${item.category || ''}`);

  // Consumibles propios de sublimación: papel, tinta, hoja y cinta térmica.
  if (/papel.*sublim|hoja.*sublim|tinta.*sublim|cinta.*sublim|cinta.*termica|kapton/.test(text)) return 'indirect';
  if (/empaque|caja|bolsa|etiqueta|celofan|viruta|burbuja|esquinero|tissue|kraft/.test(text)) return 'indirect';
  if (/\b(servicio|maquila|corte externo|grabado externo|impresion externa|instalacion)\b/.test(text)) return 'production';
  if (/diseno|licencia|archivo|modelo digital|arte digital|render|plantilla/.test(text)) return 'intangible';
  if (/barniz|tinte|pintura|sellador|laca|acabado|esmalte/.test(text)) return 'finish';
  if (/guante|estopa|limpieza|proteccion|desechable|solvente|alcohol|bata|mascarilla/.test(text)) return 'indirect';
  if (/iman|magnet|led|luz|argolla|herraje|tornillo|clavo|inserto|mecanismo|switch|interruptor|mosqueton|broche|cierre|remache/.test(text)) return 'complementary';
  if (/lija|cinta|pegamento|resistol|cianocrilato|silicon|adhesivo|brocha|pincel|diluyente/.test(text)) return 'micro';
  return current && SUPPLY_TYPES.has(current) ? current : 'direct';
}

/**
 * Completa la información de cada renglón de receta con los datos reales
 * del almacén: material vinculado, categoría, unidad, costo, proveedor y grupo.
 */
export function enrichRecipeItems(items = [], rawMaterials = []) {
  return normalizeRecipeItems(items, rawMaterials).map(item => {
    const material = findMaterial(rawMaterials, item);
    const category = material?.category || item.category || 'general';
    const supplyType = inferSupplyType({ ...item, category });
    const unit = item.unit || material?.packageMeasurement || material?.unit || 'pieza';
    const unitCost = num(item.unitCost, 0) > 0
      ? num(item.unitCost, 0)
      : (material ? materialUnitCost(material, unit) : 0);
    const totalQuantity = num(item.totalQuantity, num(item.netQuantity, 0) + num(item.wasteQuantity, 0));
    return {
      ...item,
      materialId: material?.id || item.materialId || '',
      category,
      supplyType,
      unit,
      unitCost: round4(unitCost),
      totalQuantity: round2(totalQuantity),
      totalCost: round2(totalQuantity * unitCost),
      supplier: item.supplier || material?.supplier || '',
      notes: item.notes || (material?.supplier ? `Proveedor: ${material.supplier}` : '')
    };
  });
}

function isPackagingItem(item) {
  return item?.category === 'packaging' || /empaque|caja|bolsa|etiqueta|viruta|burbuja|esquinero|tissue|celofan|celofán/i.test(item?.name || '');
}

function isFilamentItem(item) {
  return item?.category === '3d' || /filamento|\bpla\b|\btpu\b|\bpetg\b/i.test(item?.name || '');
}

export function computeRecipeCost(recipe = {}, product = null, rawMaterials = [], workshopParams = DEFAULT_WORKSHOP_PARAMS) {
  const params = { ...DEFAULT_WORKSHOP_PARAMS, ...(workshopParams || {}) };
  const items = normalizeRecipeItems(recipe.items || [], rawMaterials);

  const directCost = round2(items.filter(it => it.supplyType === 'direct').reduce((sum, it) => sum + it.totalCost, 0));
  const finishCost = round2(items.filter(it => it.supplyType === 'finish').reduce((sum, it) => sum + it.totalCost, 0));
  const indirectCost = round2(items.filter(it => it.supplyType === 'indirect').reduce((sum, it) => sum + it.totalCost, 0));
  const materialCost = round2(items.reduce((sum, it) => sum + it.totalCost, 0));
  const packagingFromItems = round2(items.filter(isPackagingItem).reduce((sum, it) => sum + it.totalCost, 0));
  const filamentCost = round2(items.filter(isFilamentItem).reduce((sum, it) => sum + it.totalCost, 0));
  const nonPackagingMaterialCost = round2(Math.max(0, materialCost - packagingFromItems));

  const machineMinutes = num(recipe.manufacturingTimeMinutes, 0);
  const machineWatts = num(recipe.machinePowerWatts, 0);
  const kwhCost = num(recipe.kwhCost, num(params.kwhCost, 3.5));
  const energyCost = round2((machineWatts / 1000) * (machineMinutes / 60) * kwhCost);

  const wearPerHour = num(params.wearPerHour, 3);
  const wearCost = machineMinutes > 0
    ? round2((machineMinutes / 60) * wearPerHour)
    : round2(num(recipe.wearCost, 0));

  const laborMinutes = num(recipe.laborTimeMinutes, 0);
  const laborRatePerHour = num(recipe.laborRatePerHour, num(params.laborPerHour, 60));
  const laborCost = round2((laborMinutes / 60) * laborRatePerHour);

  const pkg = recipe.packagingAndShipping || {};
  const pkgBase = pkg.enabled === false ? 0 : num(pkg.packagingCost, 0);
  const extraPackagingCost = round2(Math.max(0, pkgBase - packagingFromItems));
  const packagingCost = round2(packagingFromItems + extraPackagingCost);
  const shippingCost = (pkg.enabled !== false && (pkg.shippingIncludedInPrice || pkg.includeShippingInPrice))
    ? round2(num(pkg.shippingCost ?? pkg.shippingNationwideEstimated, 0))
    : 0;

  const failureBase = round2(nonPackagingMaterialCost + energyCost + wearCost + laborCost);
  const failurePercent = num(recipe.failureReservePercent, num(params.failureReservePercent, 3));
  const fixedFailureReserve = num(recipe.failureReserveCost, 0);
  const failureReserveCost = failurePercent === 0 && fixedFailureReserve > 0
    ? round2(fixedFailureReserve)
    : round2(failureBase * (failurePercent / 100));
  const fixedOverheadCost = round2(num(recipe.fixedOverheadCost, num(product?.costBreakdown?.fixedOverheadCost, num(params.fixedOverheadPerUnit, 0))));

  const totalBeforeIva = round2(
    materialCost +
    energyCost +
    wearCost +
    laborCost +
    extraPackagingCost +
    shippingCost +
    failureReserveCost +
    fixedOverheadCost
  );

  const ivaPercent = num(recipe.ivaPercent, num(params.ivaPercent, 16));
  const includeIvaInCost = recipe.includeIvaInCost !== undefined
    ? Boolean(recipe.includeIvaInCost)
    : params.includeIvaInCost !== false;
  const ivaCost = includeIvaInCost ? round2(totalBeforeIva * (ivaPercent / 100)) : 0;
  const totalCost = round2(totalBeforeIva + ivaCost);

  const totalWasteCost = round2(items.reduce((sum, it) => sum + (it.wasteQuantity * it.unitCost), 0));
  const wastePercentAverage = materialCost > 0 ? Math.round((totalWasteCost / materialCost) * 1000) / 10 : 0;

  return {
    items,
    directCost,
    finishCost,
    indirectCost,
    materialCost,
    filamentCost,
    packagingFromItems,
    packagingCost,
    extraPackagingCost,
    shippingCost,
    nonPackagingMaterialCost,
    energyCost,
    wearCost,
    laborCost,
    failurePercent,
    failureReserveCost,
    fixedOverheadCost,
    totalBeforeIva,
    ivaPercent,
    includeIvaInCost,
    ivaCost,
    totalCost,
    totalMaterialCost: materialCost,
    totalWasteCost,
    wastePercentAverage,
    machineMinutes,
    machineWatts,
    kwhCost,
    laborMinutes,
    laborRatePerHour,
    unitCost: totalCost
  };
}

export function applySummaryToRecipe(recipe = {}, summary) {
  return {
    ...recipe,
    items: summary.items,
    totalMaterialCost: summary.materialCost,
    totalWasteCost: summary.totalWasteCost,
    wastePercentAverage: summary.wastePercentAverage,
    energyCost: summary.energyCost,
    wearCost: summary.wearCost,
    laborCost: summary.laborCost,
    failureReserveCost: summary.failureReserveCost,
    fixedOverheadCost: summary.fixedOverheadCost,
    totalBeforeIva: summary.totalBeforeIva,
    ivaPercent: summary.ivaPercent,
    includeIvaInCost: summary.includeIvaInCost,
    ivaCost: summary.ivaCost
  };
}

export function buildCostBreakdownFromSummary(summary, recipe = {}, previous = {}) {
  const nonFilamentMaterials = round2(Math.max(0, summary.materialCost - summary.filamentCost - summary.packagingFromItems));
  return {
    ...previous,
    plaGrams: round2(summary.items.filter(it => /filamento|\bpla\b/i.test(it.name || '') || it.materialId === 'mat-pla-olivo' || it.materialId === 'mat-pla-blanco' || it.materialId === 'mat-pla-negro').reduce((sum, it) => sum + it.totalQuantity, 0)),
    tpuGrams: round2(summary.items.filter(it => /\btpu\b/i.test(it.name || '') || String(it.materialId || '').includes('tpu')).reduce((sum, it) => sum + it.totalQuantity, 0)),
    otherMaterialsCost: nonFilamentMaterials,
    machineHours: round2(num(recipe.manufacturingTimeMinutes, 0) / 60),
    otherEquipCost: 0,
    manualWorkMin: round2(num(recipe.laborTimeMinutes, 0)),
    prepCost: 0,
    packagingCost: summary.packagingCost,
    additionalFailuresCost: summary.failureReserveCost,
    fixedOverheadCost: summary.fixedOverheadCost,
    shippingCost: summary.shippingCost,
    totalWasteCost: summary.totalWasteCost,
    wastePercentAverage: summary.wastePercentAverage,
    totalBeforeIva: summary.totalBeforeIva,
    ivaPercent: summary.ivaPercent,
    ivaCost: summary.ivaCost,
    costStatus: 'Calculado de Taller'
  };
}

function defaultTechnique(product) {
  const techs = Array.isArray(product?.techniques) ? product.techniques : [];
  const name = normalizeText(product?.name);
  if (/servicio|patch bar|combo fiesta|bar en vivo/.test(name)) return 'assembly';
  if (/lampara|luminaria|clicker|fidget/.test(name)) return '3d';
  if (/nfc|chip/.test(name)) return 'nfc';
  if (/taza|playera|tote|termo|sublimacion|sublimado/.test(name) && (techs.includes('sublimation') || techs.includes('sublimacion'))) return 'sublimation';
  if (/vinil|vinilo/.test(name) && (techs.includes('vinyl') || techs.includes('vinil'))) return 'vinyl';
  if (techs.includes('laser') && /llavero|chapita|marcacopas|letrero|colgador|soporte|organizador|base|placa|repisa|perchero|estante|madera|fotoiman/.test(name)) return 'laser';
  if (techs.includes('3d')) return '3d';
  if (techs.includes('laser')) return 'laser';
  if (techs.includes('sublimation') || techs.includes('sublimacion')) return 'sublimation';
  if (techs.includes('vinyl') || techs.includes('vinil')) return 'vinyl';
  if (techs.includes('nfc')) return 'nfc';
  if (techs.includes('assembly') || techs.includes('ensamble')) return 'assembly';
  return techs[0] || '3d';
}

function makeItem({ material, name, category, supplyType = 'direct', netQuantity = 1, wasteQuantity = 0, unit = 'pieza', unitCost = null, wasteType = 'none', estimated = false }) {
  const resolvedUnit = unit || material?.packageMeasurement || 'pieza';
  const resolvedCost = unitCost !== null ? num(unitCost, 0) : materialUnitCost(material, resolvedUnit);
  const totalQuantity = round2(num(netQuantity) + num(wasteQuantity));
  return {
    id: `item-${normalizeText(material?.id || name || 'insumo').replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`,
    materialId: material?.id || '',
    name: name || material?.name || 'Insumo',
    category: category || material?.category || 'materials',
    supplyType,
    estimated: estimated === true || !material?.id,
    netQuantity: round2(netQuantity),
    wasteQuantity: round2(wasteQuantity),
    wasteType,
    totalQuantity,
    unit: resolvedUnit,
    unitCost: round4(resolvedCost),
    totalCost: round2(totalQuantity * resolvedCost)
  };
}

export function ensureProductSupplies(product, recipe, rawMaterials = []) {
  const name = normalizeText(product?.name);
  const tech = defaultTechnique(product);
  const items = [...(recipe.items || [])];
  const has = (pattern) => items.some(it => pattern.test(normalizeText(it.name || '')));

  const addMaterial = (queries, category, opts = {}) => {
    const material = findMaterialByQuery(rawMaterials, queries, category || null);
    if (!material) return;
    const exists = items.some(it => it.materialId === material.id || normalizeText(it.name || '').includes(normalizeText(material.name)));
    if (exists) return;
    items.push(makeItem({
      material,
      name: opts.name || material.name,
      category: opts.category || material.category,
      supplyType: opts.supplyType || 'direct',
      netQuantity: opts.netQuantity ?? 1,
      wasteQuantity: opts.wasteQuantity ?? 0,
      unit: opts.unit || material.packageMeasurement || 'pieza',
      unitCost: opts.unitCost ?? null,
      wasteType: opts.wasteType || 'none'
    }));
  };

  if (/lampara|luminaria|luz|light/.test(name) && !has(/led|iluminacion|luz/)) {
    addMaterial(['kit iluminacion led', 'kit luz led'], 'assembly', { name: 'Kit de luz LED USB 5V con interruptor y cable', unit: 'kit' });
  }
  if (/clicker|fidget|switch/.test(name) && !has(/switch|interruptor mecanico/)) {
    addMaterial(['interruptores mecanicos', 'switch'], 'assembly', { name: 'Switch mecánico clicker de 3 pines', unit: 'pieza' });
  }
  if (/llavero|llaveros|chapita|marcacopas/.test(name) && !has(/argolla/)) {
    addMaterial(['argollas metalicas', 'argollas para llavero'], 'assembly', { name: 'Argolla metálica para llavero', unit: 'pieza' });
  }
  if (/iman|imán|magnetico|magnético/.test(name) && !has(/iman|imán/)) {
    addMaterial(['imanes de neodimio'], 'assembly', { name: 'Imán de neodimio', unit: 'pieza' });
  }
  if (/nfc/.test(name) && !has(/nfc|chip/)) {
    addMaterial(['chips nfc', 'monedas nfc'], 'assembly', { name: 'Chip NFC adhesivo', unit: 'pieza' });
  }

  if (tech === 'laser') {
    if (!has(/resistol|pegamento|adhesivo/)) {
      addMaterial(['resistol 850', 'pegamento blanco'], 'assembly', { name: 'Resistol 850 para ensamble de madera', supplyType: 'indirect', netQuantity: 1, unit: 'aplicacion', unitCost: 0.05, wasteType: 'manual' });
    }
    if (!has(/lija/)) {
      addMaterial(['lija de madera fina', 'lija'], 'consumables', { name: 'Lija fina 220 para pulido de cantos', supplyType: 'indirect', netQuantity: 0.08, wasteQuantity: 0.02, unit: 'pliego', wasteType: 'manual' });
    }
    if (!has(/cinta/)) {
      addMaterial(['cinta de enmascarar'], 'consumables', { name: 'Cinta de enmascarar para protección láser', supplyType: 'indirect', netQuantity: 0.2, unit: 'm' });
    }
    if (/letrero|colgador|soporte|base|placa|organizador/.test(name) && !has(/clavo|tornillo/)) {
      addMaterial(['clavos de acero', 'clavos'], 'assembly', { name: 'Clavos de acero para fijación', supplyType: 'indirect', netQuantity: 2, unit: 'pieza' });
    }
  }

  if (tech === '3d' && !has(/cianocrilato|pegamento|adhesivo|pegaloca/)) {
    addMaterial(['pegamento instantaneo', 'pegamento cianocrilato', 'cianocrilato'], 'assembly', { name: 'Pegaloca / cianoacrilato para ensamble', supplyType: 'indirect', netQuantity: 1, unit: 'aplicacion', unitCost: 0.7 });
  }

  if (tech === 'sublimation' && !has(/cinta termica|kapton/)) {
    addMaterial(['cinta termica kapton'], 'consumables', { name: 'Cinta térmica Kapton para prensa', supplyType: 'indirect', netQuantity: 0.15, unit: 'm', unitCost: 0.91 });
  }

  // Todo producto debe llevar empaque. Si la receta no lo trae, se agrega el empaque
  // básico y se usa el costo declarado para no duplicarlo en la fórmula.
  const hasPackagingItem = items.some(isPackagingItem);
  if (!hasPackagingItem) {
    const isSmall = /llavero|clicker|chapita|marcacopas|iman|fotoboton|pin|tarjetero/.test(name);
    const packagingMaterial = isSmall
      ? findMaterialByQuery(rawMaterials, ['bolsas celofan', 'bolsas kraft con ventana', 'bolsa kraft'], 'packaging')
      : findMaterialByQuery(rawMaterials, ['cajas de carton kraft', 'caja kraft', 'empaque'], 'packaging');
    const declaredPackaging = num(recipe?.packagingAndShipping?.packagingCost, 0);
    const basicPackagingCost = packagingMaterial ? materialUnitCost(packagingMaterial, 'pieza') : (isSmall ? 0.45 : 12);
    const packagingUnitCost = declaredPackaging > 0 ? declaredPackaging : basicPackagingCost;
    items.push(makeItem({
      material: packagingMaterial,
      name: packagingMaterial ? packagingMaterial.name + ' (empaque)' : (isSmall ? 'Bolsa kraft con ventana y etiqueta' : 'Caja kraft y protección para envío'),
      category: 'packaging',
      supplyType: 'indirect',
      netQuantity: 1,
      unit: 'pieza',
      unitCost: packagingUnitCost
    }));
  }

  return { ...recipe, items };
}

function buildOtherCostItems(product, tech, otherCost, rawMaterials = []) {
  const total = round2(otherCost);
  if (total <= 0) return [];
  const name = normalizeText(product?.name);
  const specs = [];
  const add = (label, category, share, supplyType = 'direct') => {
    if (share > 0) specs.push({ label, category, share, supplyType });
  };

  if (/servicio|patch bar|combo fiesta|bar en vivo/.test(name)) {
    add('Materiales del servicio (prendas, vinil textil, parches, tintas)', 'assembly', 0.70);
    add('Insumos de montaje y operación (cinta, sujetadores, señalización)', 'assembly', 0.20);
    add('Consumibles y protección del evento', 'consumables', 0.10);
  } else if (tech === 'laser') {
    if (/llavero|chapita|marcacopas|placa/.test(name)) {
      add('Madera, triplay o acrílico base del producto', 'laser', 0.55);
      add('Argollas, mosquetones y sujetadores metálicos', 'assembly', 0.15);
      add('Pegamento para ensamble de madera', 'assembly', 0.10);
      add('Lijas, cinta de enmascarar y acabados', 'consumables', 0.10);
      add('Barniz, tinte o sellador protector', 'laser', 0.10);
    } else if (/colgador|letrero|soporte|organizador|base|placa|repisa|perchero|estante/.test(name)) {
      add('Madera, triplay, MDF o acrílico base del producto', 'laser', 0.58);
      add('Clavos, tornillos y taquetes de instalación', 'assembly', 0.15);
      add('Pegamento para ensamble de madera', 'assembly', 0.10);
      add('Lijas, cinta de enmascarar y consumibles de corte', 'consumables', 0.10);
      add('Barniz, tinte o sellador protector', 'laser', 0.07);
    } else {
      add('Madera, triplay, MDF o acrílico base del producto', 'laser', 0.65);
      add('Pegamento para ensamble de madera', 'assembly', 0.10);
      add('Clavos, tornillos y sujetadores', 'assembly', 0.10);
      add('Lijas, cinta de enmascarar y consumibles de corte', 'consumables', 0.08);
      add('Barniz, tinte o sellador protector', 'laser', 0.07);
    }
  } else if (tech === 'sublimation') {
    add('Artículo base sublimable (taza, playera, tote, termo o llavero)', 'sublimation', 0.70);
    add('Tinta, papel y consumibles de sublimación', 'sublimation', 0.20);
    add('Cinta térmica Kapton y protección de prensa', 'consumables', 0.10);
  } else if (tech === 'vinyl') {
    add('Vinil textil o adhesivo y papel de transferencia', 'vinyl', 0.70);
    add('Consumibles de corte, prensado y limpieza', 'consumables', 0.20);
    add('Acabados y sujetadores del producto', 'assembly', 0.10);
  } else if (tech === 'assembly') {
    add('Herrajes, insertos, mecanismos y componentes del producto', 'assembly', 0.65);
    add('Pegamento, adhesivo o pegaloca para ensamble', 'assembly', 0.20);
    add('Sujetadores, lijas y acabados', 'consumables', 0.15);
  } else if (/lampara|luminaria|luz|light/.test(name)) {
    add('Kit LED, interruptor y cable de alimentación', 'assembly', 0.45);
    add('Tornillos, tuercas y sujetadores de instalación', 'assembly', 0.15);
    add('Pegaloca / cianoacrilato y sellador', 'assembly', 0.15);
    add('Lijas, acabados y consumibles de ensamble', 'consumables', 0.25);
  } else if (/clicker|fidget|switch/.test(name)) {
    add('Switch mecánico clicker de 3 pines', 'assembly', 0.40);
    add('Argolla y sujetadores metálicos', 'assembly', 0.20);
    add('Pegaloca / cianoacrilato para ensamble', 'assembly', 0.15);
    add('Lijas, acabados y consumibles de ensamble', 'consumables', 0.25);
  } else if (tech === 'nfc' || /nfc|chip/.test(name)) {
    add('Base de madera, acrílico o impresión 3D para el módulo NFC', 'laser', 0.30);
    add('Chip o moneda NFC y componentes electrónicos', 'assembly', 0.40);
    add('Pegamento, sellador y aislamiento', 'assembly', 0.15);
    add('Sujetadores, lijas y acabados', 'consumables', 0.15);
  } else if (/nfc|chip/.test(name)) {
    add('Chip o moneda NFC y componentes electrónicos', 'assembly', 0.50);
    add('Pegamento, sellador y aislamiento', 'assembly', 0.20);
    add('Sujetadores, lijas y acabados', 'consumables', 0.30);
  } else if (/llavero|llaveros|chapita|marcacopas/.test(name)) {
    add('Argollas, mosquetones y sujetadores metálicos', 'assembly', 0.25);
    add('Pegaloca / cianoacrilato para ensamble', 'assembly', 0.20);
    add('Lijas, acabados y consumibles de ensamble', 'consumables', 0.55);
  } else if (/iman|magnetico/.test(name)) {
    add('Imanes de neodimio y componentes magnéticos', 'assembly', 0.45);
    add('Pegaloca / cianoacrilato para ensamble', 'assembly', 0.20);
    add('Lijas, acabados y sujetadores', 'consumables', 0.35);
  } else {
    add('Componentes específicos del producto (insertos, herrajes o mecanismos)', 'assembly', 0.55);
    add('Pegaloca / cianoacrilato y adhesivos', 'assembly', 0.20);
    add('Lijas, acabados y consumibles de ensamble', 'consumables', 0.25);
  }

  const items = [];
  let allocated = 0;
  specs.forEach((spec, index) => {
    const isLast = index === specs.length - 1;
    const amount = isLast ? round2(total - allocated) : round2(total * spec.share);
    allocated = round2(allocated + amount);
    if (amount <= 0) return;
    items.push(makeItem({
      material: null,
      name: spec.label,
      category: spec.category,
      supplyType: spec.supplyType,
      netQuantity: 1,
      unit: 'lote',
      unitCost: amount,
      wasteType: 'manual',
      estimated: true
    }));
  });
  return items;
}

export function buildRecipeFromProduct(product, rawMaterials = [], workshopParams = DEFAULT_WORKSHOP_PARAMS) {
  const params = { ...DEFAULT_WORKSHOP_PARAMS, ...(workshopParams || {}) };
  if (Array.isArray(product?.manufacturingRecipe?.items) && product.manufacturingRecipe.items.length > 0) {
    const ensured = ensureProductSupplies(product, product.manufacturingRecipe, rawMaterials);
    if (!ensured.technique) ensured.technique = defaultTechnique(product);
    return ensured;
  }

  const cb = product?.costBreakdown || {};
  const tech = defaultTechnique(product);
  const profile = TECHNIQUE_MACHINE_PROFILE[tech] || TECHNIQUE_MACHINE_PROFILE['3d'];
  const items = [];

  const plaGrams = num(cb.plaGrams, tech === '3d' ? 50 : 0);
  const tpuGrams = num(cb.tpuGrams, 0);
  if (plaGrams > 0) {
    const pla = findMaterialByQuery(rawMaterials, ['filamento pla', 'pla'], '3d');
    items.push(makeItem({
      material: pla,
      name: 'Filamento PLA (1.75mm)',
      category: '3d',
      supplyType: 'direct',
      netQuantity: plaGrams,
      wasteQuantity: Math.round(plaGrams * (num(params.filamentWastePercent, 15) / 100) * 100) / 100,
      unit: 'g',
      unitCost: pla ? materialUnitCost(pla, 'g') : num(params.plaPerKg, 500) / 1000,
      wasteType: 'supports_and_purge',
      estimated: !pla?.id
    }));
  }
  if (tpuGrams > 0) {
    const tpu = findMaterialByQuery(rawMaterials, ['filamento tpu', 'tpu'], '3d');
    items.push(makeItem({
      material: tpu,
      name: 'Filamento TPU Flexible 95A (1.75mm)',
      category: '3d',
      supplyType: 'direct',
      netQuantity: tpuGrams,
      wasteQuantity: Math.round(tpuGrams * (num(params.filamentWastePercent, 15) / 100) * 100) / 100,
      unit: 'g',
      unitCost: tpu ? materialUnitCost(tpu, 'g') : num(params.tpuPerKg, 700) / 1000,
      wasteType: 'supports_and_purge',
      estimated: !tpu?.id
    }));
  }

  const otherCost = num(cb.otherMaterialsCost, 0);
  items.push(...buildOtherCostItems(product, tech, otherCost, rawMaterials));

  const packagingCost = num(cb.packagingCost, 0);
  if (packagingCost > 0) {
    const box = findMaterialByQuery(rawMaterials, ['cajas de carton kraft', 'bolsas celofan', 'empaque'], 'packaging');
    items.push(makeItem({
      material: box,
      name: box ? `${box.name} + protección para envío` : 'Empaque y protección para envío',
      category: 'packaging',
      supplyType: 'indirect',
      netQuantity: 1,
      unit: 'pieza',
      unitCost: packagingCost,
      estimated: !box?.id
    }));
  }

  const machineHours = num(cb.machineHours, 0);
  const manufacturingTimeMinutes = machineHours > 0 ? Math.round(machineHours * 60) : profile.minutes;
  const laborTimeMinutes = num(cb.manualWorkMin, profile.laborMinutes);

  let recipe = {
    yieldUnits: 1,
    technique: tech,
    notes: 'Receta generada desde la ficha de costos del producto. Revisa cantidades y proveedores antes de fabricar.',
    lastUpdated: new Date().toISOString(),
    machinePowerWatts: profile.watts || 250,
    manufacturingTimeMinutes,
    kwhCost: num(params.kwhCost, 3.5),
    laborTimeMinutes,
    laborRatePerHour: num(params.laborPerHour, 60),
    failureReservePercent: num(cb.additionalFailuresCost, 0) > 0 ? 0 : num(params.failureReservePercent, 3),
    fixedOverheadCost: num(cb.fixedOverheadCost, 0),
    items,
    packagingAndShipping: {
      enabled: packagingCost > 0,
      packagingType: 'caja_kraft',
      packagingCost,
      shippingIncludedInPrice: false,
      shippingCost: num(cb.shippingCost, 0),
      notes: 'El envío se cotiza por separado salvo que se indique lo contrario.'
    }
  };

  // Si la ficha traía una reserva fija de fallas, se conserva como cargo fijo.
  if (num(cb.additionalFailuresCost, 0) > 0) {
    const base = computeRecipeCost(recipe, product, rawMaterials, params);
    recipe.failureReserveCost = round2(num(cb.additionalFailuresCost, 0));
    recipe.failureReservePercent = 0;
    recipe = applySummaryToRecipe(recipe, { ...base, failureReserveCost: recipe.failureReserveCost });
  }

  return ensureProductSupplies(product, recipe, rawMaterials);
}

export function repairProductCosts(product, rawMaterials = [], workshopParams = DEFAULT_WORKSHOP_PARAMS) {
  const params = { ...DEFAULT_WORKSHOP_PARAMS, ...(workshopParams || {}) };
  const genericItems = (product?.manufacturingRecipe?.items || []).filter(item =>
    /insumos especificos|materiales especificos|consumibles menores/.test(normalizeText(item?.name))
  );
  const genericTotal = round2(genericItems.reduce((sum, item) => sum + num(item?.totalCost, 0), 0));
  const hasGenericSupplies = genericItems.length > 0;
  const productForBuild = hasGenericSupplies
    ? {
        ...product,
        manufacturingRecipe: null,
        costBreakdown: {
          ...(product.costBreakdown || {}),
          otherMaterialsCost: genericTotal > 0 ? genericTotal : num(product?.costBreakdown?.otherMaterialsCost, 0)
        }
      }
    : product;
  const baseRecipe = buildRecipeFromProduct(productForBuild, rawMaterials, params);
  const summary = computeRecipeCost(baseRecipe, product, rawMaterials, params);
  const recipe = applySummaryToRecipe(baseRecipe, summary);
  const costBreakdown = buildCostBreakdownFromSummary(summary, recipe, product.costBreakdown || {});

  return {
    ...product,
    manufacturingRecipe: recipe,
    costPrice: summary.totalCost,
    costBreakdown
  };
}

export function auditProductCost(product, rawMaterials = [], workshopParams = DEFAULT_WORKSHOP_PARAMS) {
  const recipe = buildRecipeFromProduct(product, rawMaterials, workshopParams);
  const summary = computeRecipeCost(recipe, product, rawMaterials, workshopParams);
  const warnings = [];
  if (!recipe.items.length) warnings.push('Sin requerimientos de materiales.');
  if (summary.materialCost <= 0) warnings.push('Costo de materiales en cero.');
  if (summary.directCost <= 0) warnings.push('Sin materiales directos identificados.');
  if (summary.packagingCost <= 0) warnings.push('Sin empaque registrado.');
  if (summary.energyCost <= 0 && summary.machineMinutes > 0) warnings.push('Sin consumo eléctrico calculado.');
  if (summary.laborCost <= 0) warnings.push('Sin mano de obra calculada.');
  const saved = num(product?.costPrice, 0);
  if (saved > 0 && Math.abs(saved - summary.totalCost) > 1) {
    warnings.push(`El costo guardado ($${saved.toFixed(2)}) no coincide con la receta ($${summary.totalCost.toFixed(2)}).`);
  }
  const missingMaterialIds = (recipe.items || []).filter(it => it.materialId && !rawMaterials.some(m => m.id === it.materialId));
  if (missingMaterialIds.length) warnings.push(`${missingMaterialIds.length} insumo(s) con proveedor/material no vinculado.`);
  return { recipe, summary, warnings, ok: warnings.length === 0 };
}
