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

const STOP_WORDS = new Set([
  'para', 'con', 'por', 'del', 'las', 'los', 'una', 'uno', 'este', 'esta',
  'tipo', 'grado', 'calidad', 'color', 'pieza', 'piezas', 'paquete', 'pack',
  'bolsa', 'caja', 'sobre', 'lineal', 'aproximado', 'aprox', 'marca',
  'taller', 'artesano', 'digital', 'mexico', 'mexicano', 'mercado', 'libre',
  'envio', 'flete', 'importacion', 'proveedor', 'mayoreo', 'menudeo',
  'alta', 'alto', 'baja', 'bajo', 'nuevo', 'nueva', 'premium', 'especial'
]);

function tokens(value) {
  return [...new Set(normalize(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(word => word.length > 2 && !STOP_WORDS.has(word)))];
}

function scoreMaterial(item, material) {
  const itemTokens = tokens(item.name);
  const materialTokens = tokens(material.name);
  if (itemTokens.length === 0 || materialTokens.length === 0) return 0;
  const materialSet = new Set(materialTokens);
  const overlap = itemTokens.filter(token => materialSet.has(token));
  const ratio = overlap.length / Math.max(1, Math.min(itemTokens.length, materialTokens.length));
  const sameCategory = String(item.category || '') === String(material.category || '');
  const distinctive = overlap.some(token => token.length >= 9);
  let score = ratio + (sameCategory ? 0.2 : 0);
  if (overlap.length >= 3) score += 0.15;
  if (distinctive && overlap.length >= 1) score += 0.1;
  const itemName = normalize(item.name);
  const materialName = normalize(material.name);
  if (itemName === materialName) score += 1;
  else if (itemName.includes(materialName) || materialName.includes(itemName)) score += 0.45;
  return { score, overlap: overlap.length, sameCategory };
}

const KEYWORD_RULES = [
  { test: /filamento|\bpla\b|\bpetg\b|\btpu\b|\babs\b|\basa\b/, query: /filamento|pla|petg|tpu|abs|asa/i, category: '3d' },
  { test: /switch|interruptor|teclado/, query: /interruptor|switch/i, category: 'assembly' },
  { test: /argolla|llavero/, query: /argolla/i, category: 'assembly' },
  { test: /iman|magnet/, query: /iman/i, category: 'assembly' },
  { test: /\bled\b|luz|iluminacion/, query: /led|iluminacion/i, category: 'assembly' },
  { test: /pegamento|cianocrilato|adhesivo|resistol/, query: /pegamento|cianocrilato|resistol|adhesivo/i, category: null },
  { test: /lija|pulido/, query: /lija/i, category: null },
  { test: /barniz|tinte|sellador|pintura|laca/, query: /barniz|tinte|sellador|pintura|laca/i, category: null },
  { test: /tornillo|clavo|sujetador/, query: /tornillo|clavo|sujetador/i, category: 'assembly' },
  { test: /cinta.*termica|kapton/, query: /cinta.*termica|kapton/i, category: 'sublimation' },
  { test: /papel.*sublim/, query: /papel.*sublim/i, category: 'sublimation' },
  { test: /tinta.*sublim/, query: /tinta.*sublim/i, category: 'sublimation' },
  { test: /tote/, query: /tote/i, category: 'sublimation' },
  { test: /taza|tarro/, query: /taza|tarro/i, category: 'sublimation' },
  { test: /termo/, query: /termo/i, category: 'sublimation' },
  { test: /playera|camiseta/, query: /playera|camiseta/i, category: 'sublimation' },
  { test: /caja.*kraft|empaque.*kraft|bolsa.*kraft/, query: /caja.*kraft|bolsa.*kraft/i, category: 'packaging' },
  { test: /^madera, triplay|^base de madera/, query: /^madera|^triplay|^mdf/i, category: 'laser' },
  { test: /vinil textil|papel de transferencia/, query: /vinil textil|transfer/i, category: 'vinyl' },
  { test: /vinil|vinyl/, query: /vinil|vinyl/i, category: 'vinyl' },
  { test: /nfc/, query: /nfc/i, category: 'assembly' },
  { test: /prensa|teflon/, query: /prensa|teflon/i, category: 'sublimation' },
  { test: /guante|estopa|limpieza|proteccion/, query: /guante|estopa|limpieza|proteccion/i, category: null },
  { test: /maquila|servicio externo/, query: /maquila/i, category: null },
  { test: /diseno|modelado/, query: /diseno|modelado/i, category: null }
];

function bestMaterial(item, materials) {
  const itemText = normalize(item.name);
  for (const rule of KEYWORD_RULES) {
    if (!rule.test.test(itemText)) continue;
    const candidates = materials.filter(material => {
      if (rule.category && material.category !== rule.category) return false;
      return rule.query.test(normalize(material.name));
    });
    if (candidates.length === 0) continue;
    let best = null;
    for (const material of candidates) {
      const result = scoreMaterial(item, material);
      if (!best || result.score > best.score) best = { ...result, material };
    }
    return best;
  }

  // Último recurso: coincidencia muy alta de nombre, no una simple palabra genérica.
  let best = null;
  for (const material of materials) {
    const result = scoreMaterial(item, material);
    if (!best || result.score > best.score) best = { ...result, material };
  }
  if (!best) return null;
  return best.score >= 1.1 && best.overlap >= 4 ? best : null;
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
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const [materials, products] = await Promise.all([
  fetch(`${BASE}/api/admin/raw-materials`, { headers }).then(r => r.json()),
  fetch(`${BASE}/api/admin/products`, { headers }).then(r => r.json())
]);

const materialIds = new Set(materials.map(material => material.id));
const changes = [];
const unresolved = [];
for (const product of products) {
  const items = product.manufacturingRecipe?.items || [];
  let changed = false;
  const nextItems = items.map(item => {
    const existing = item.materialId && materialIds.has(item.materialId)
      ? materials.find(material => material.id === item.materialId)
      : null;
    if (existing) return item;
    const unit = normalize(item.unit);
    if (['lote', 'servicio', 'aplicacion'].includes(unit)) {
      unresolved.push({ product: product.code || product.id, item: item.name, unit: item.unit });
      return item;
    }
    const best = bestMaterial(item, materials);
    if (!best) {
      unresolved.push({ product: product.code || product.id, item: item.name, unit: item.unit });
      return item;
    }
    changed = true;
    return {
      ...item,
      materialId: best.material.id,
      supplier: item.supplier || best.material.supplier || '',
      category: item.category || best.material.category || ''
    };
  });
  if (changed) {
    changes.push({
      ...product,
      manufacturingRecipe: { ...product.manufacturingRecipe, items: nextItems },
      updatedAt: new Date().toISOString()
    });
  }
}

console.log(APPLY ? 'APLICANDO VINCULACIÓN' : 'SIMULACIÓN (usa --apply para guardar)');
console.log(`Productos con recetas por vincular: ${changes.length}`);
console.log(`Renglones sin coincidencia: ${unresolved.length}`);
for (const product of changes.slice(0, 15)) {
  console.log(`\n${product.code || product.id} · ${product.name}`);
  const before = products.find(p => p.id === product.id)?.manufacturingRecipe?.items || [];
  product.manufacturingRecipe.items.forEach((item, index) => {
    if (item.materialId !== before[index]?.materialId) {
      console.log(`  · ${item.name} -> ${item.materialId}`);
    }
  });
}
if (unresolved.length) {
  console.log('\nSin coincidencia:');
  unresolved.slice(0, 25).forEach(row => console.log(`  [${row.product}] ${row.item} (${row.unit})`));
}

if (APPLY) {
  const backupPath = `link-materials-backup-${Date.now()}.json`;
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
