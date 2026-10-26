const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '..', 'server', 'db.js');
let content = fs.readFileSync(dbFile, 'utf8');

// 1. Reemplazar starter-pack-joyeria-t27 price 249 -> 540 y regularPrice 680
content = content.replace(
  /("id":\s*"starter-pack-joyeria-t27"[\s\S]*?"price":\s*)249/,
  '$1540,\n    "regularPrice": 680'
);

// 2. Reemplazar starter-pack-gym-t32 price 299 -> 490 y regularPrice 620
content = content.replace(
  /("id":\s*"starter-pack-gym-t32"[\s\S]*?"price":\s*)299/,
  '$1490,\n    "regularPrice": 620'
);

// 3. Reemplazar starter-pack-barberia-t18 price 199 -> 480 y regularPrice 590
content = content.replace(
  /("id":\s*"starter-pack-barberia-t18"[\s\S]*?"price":\s*)199/,
  '$1480,\n    "regularPrice": 590'
);

// 4. Agregar lógica de deletedProductIds y purga permanente de productos industriales
if (!content.includes('DELETED_PRODUCTS_BLOCKLIST')) {
  const blocklistCode = `
// Lista negra de productos eliminados permanentemente del catálogo
const DELETED_PRODUCTS_BLOCKLIST = [
  'galga-calibradora-roscas-ind2',
  'tobera-ventilacion-automotriz-ind1'
];
`;
  content = blocklistCode + content;

  // En ensureInitialData(), filtrar cualquier producto que esté en DELETED_PRODUCTS_BLOCKLIST
  // o que pertenezca exclusivamente al mundo 'industria' (la industria se atiende en el portal dedicado)
  content = content.replace(
    /if\s*\(!Array\.isArray\(data\.products\)\)\s*data\.products\s*=\s*\[\];/,
    `if (!Array.isArray(data.products)) data.products = [];
    // Purgar productos bloqueados o de industria en tienda comercial
    data.products = data.products.filter(p => !DELETED_PRODUCTS_BLOCKLIST.includes(p.id) && !(p.worlds && p.worlds.length === 1 && p.worlds[0] === 'industria'));
    `
  );

  // Asegurar que al eliminar un producto se persista y se filtre
  content = content.replace(
    /deleteProduct\(id\)\s*\{[\s\S]*?db\.products\.splice\(index,\s*1\);[\s\S]*?this\.save\(db\);[\s\S]*?return true;[\s\S]*?\}/,
    `deleteProduct(id) {
    const db = this.read();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    if (!Array.isArray(db.deletedProductIds)) db.deletedProductIds = [];
    if (!db.deletedProductIds.includes(id)) db.deletedProductIds.push(id);
    this.save(db);
    return true;
  }`
  );
}

fs.writeFileSync(dbFile, content, 'utf8');
console.log('server/db.js updated successfully!');
