import fs from 'node:fs';
import {
  computeRecipeCost,
  applySummaryToRecipe,
  buildCostBreakdownFromSummary,
  DEFAULT_WORKSHOP_PARAMS
} from '../shared/costing.js';
import { materialUnitCostFor } from '../shared/units.js';

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
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const RULES = [
  { test: /^madera, triplay, mdf/, materialId: 'mat-madera-triplay-3mm', unit: 'placa', quantity: 0.25 },
  { test: /^madera, triplay o acrilico/, materialId: 'mat-madera-triplay-3mm', unit: 'placa', quantity: 0.25 },
  { test: /^base de madera, acrilico/, materialId: 'mat-madera-triplay-3mm', unit: 'placa', quantity: 0.25 },
  { test: /^vinil textil o adhesivo/, materialId: 'mat-vinil-blanco', unit: 'm', quantity: 0.5 },
  { test: /^pegamento para ensamble de madera/, materialId: 'mat-pegamento-resistol-850', unit: 'ml', quantity: 5 },
  { test: /^pegamento cianoacrilato para ensamble/, materialId: 'mat-pegamento-cianocrilato-gotas', unit: 'g', quantity: 0.5 },
  { test: /^pegamento, sellador y aislamiento/, materialId: 'mat-pegamento-resistol-850', unit: 'ml', quantity: 5 },
  { test: /^clavos, tornillos/, materialId: 'mat-clavos-acero', unit: 'pieza', quantity: 4 },
  { test: /^lijas, cinta de enmascarar/, materialId: 'mat-lija-madera-fina-220', unit: 'pliego', quantity: 0.1 },
  { test: /^lijas y consumibles de acabado/, materialId: 'mat-lija-madera-fina-220', unit: 'pliego', quantity: 0.1 },
  { test: /^barniz, tinte o sellador/, materialId: 'mat-barniz-poliuretano-transparente', unit: 'ml', quantity: 20 },
  { test: /^imanes de neodimio/, materialId: 'mat-imanes-neodimio-n52', unit: 'pieza', quantity: 2 },
  { test: /^insertos antideslizantes y herrajes/, materialId: 'mat-ens-tornillo-m3-hex', unit: 'pieza', quantity: 4 },
  { test: /^insertos y herrajes de ensamble/, materialId: 'mat-ens-tornillo-m3-hex', unit: 'pieza', quantity: 4 },
  { test: /^componentes de ensamble del kit/, materialId: 'mat-ens-tornillo-m3-hex', unit: 'pieza', quantity: 8 },
  { test: /^herrajes e insertos de ensamble/, materialId: 'mat-ens-tornillo-m3-hex', unit: 'pieza', quantity: 4 },
  { test: /^broche y argolla para portabolsas/, materialId: 'mat-broches-perico-mosqueton', unit: 'pieza', quantity: 1 },
  { test: /^argollas, mosquetones/, materialId: 'mat-argollas-llavero', unit: 'pieza', quantity: 2 },
  { test: /^sujetadores, lijas y acabados/, materialId: 'mat-lija-madera-fina-220', unit: 'pliego', quantity: 0.1 },
  { test: /^chip o moneda nfc/, materialId: 'mat-chips-nfc', unit: 'pieza', quantity: 1 },
  { test: /^proteccion de prensa y consumibles/, materialId: 'mat-cinta-termica-kapton', unit: 'm', quantity: 0.5 }
];

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
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const [materials, products, settings] = await Promise.all([
  fetch(`${BASE}/api/admin/raw-materials`, { headers }).then(r => r.json()),
  fetch(`${BASE}/api/admin/products`, { headers }).then(r => r.json()),
  fetch(`${BASE}/api/admin/settings`, { headers }).then(r => r.json()).catch(() => ({}))
]);
const workshopParams = settings?.workshopParams || DEFAULT_WORKSHOP_PARAMS;
const materialMap = new Map(materials.map(material => [material.id, material]));

const changes = [];
for (const product of products) {
  const originalItems = product.manufacturingRecipe?.items || [];
  let changed = false;
  const items = originalItems.map(item => {
    if (!['lote', 'aplicacion'].includes(normalize(item.unit))) return item;
    const name = normalize(item.name);
    const rule = RULES.find(entry => entry.test.test(name));
    if (!rule) return item;
    const material = materialMap.get(rule.materialId);
    if (!material) return item;
    const unitCost = Math.round(materialUnitCostFor(material, rule.unit) * 10000) / 10000;
    const totalCost = Math.round(rule.quantity * unitCost * 100) / 100;
    changed = true;
    return {
      ...item,
      materialId: material.id,
      category: material.category || item.category,
      supplier: material.supplier || item.supplier || '',
      unit: rule.unit,
      netQuantity: rule.quantity,
      wasteQuantity: 0,
      totalQuantity: rule.quantity,
      unitCost,
      totalCost,
      notes: item.notes || `Vinculado a almacén: ${material.name}`
    };
  });

  if (!changed) continue;
  const nextRecipe = { ...product.manufacturingRecipe, items };
  const summary = computeRecipeCost(nextRecipe, product, materials, workshopParams);
  const recipe = applySummaryToRecipe(nextRecipe, summary);
  changes.push({
    ...product,
    manufacturingRecipe: recipe,
    costPrice: summary.totalCost,
    costBreakdown: buildCostBreakdownFromSummary(summary, recipe, product.costBreakdown || {}),
    updatedAt: new Date().toISOString()
  });
}

console.log(APPLY ? 'APLICANDO NORMALIZACIÓN' : 'SIMULACIÓN (usa --apply para guardar)');
console.log(`Productos con renglones genéricos por normalizar: ${changes.length}`);
for (const product of changes.slice(0, 18)) {
  const before = products.find(p => p.id === product.id);
  console.log(`\n${product.code || product.id} · ${product.name}`);
  console.log(`  costo ${before?.costPrice ?? '—'} -> ${product.costPrice}`);
  product.manufacturingRecipe.items.forEach((item, index) => {
    const previous = before?.manufacturingRecipe?.items?.[index];
    if (previous && (item.unit !== previous.unit || item.materialId !== previous.materialId)) {
      console.log(`  · ${item.name}: ${previous.unit} -> ${item.unit} ${item.totalQuantity} (${item.materialId}) $${item.totalCost}`);
    }
  });
}

if (APPLY) {
  const backupPath = `normalize-items-backup-${Date.now()}.json`;
  fs.writeFileSync(backupPath, JSON.stringify({ products }, null, 2), 'utf8');
  console.log(`Respaldo: ${backupPath}`);
  let saved = 0;
  for (const product of changes) {
    const response = await fetch(`${BASE}/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(product)
    });
    if (response.ok) saved += 1;
    else console.error(`Error guardando ${product.code || product.id}: ${response.status}`);
  }
  console.log(`Productos actualizados: ${saved}`);
}
