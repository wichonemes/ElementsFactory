const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'server', 'db.js');
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const idx = lines.findIndex(l => l.includes('getProducts(filters = {}) {'));
console.log('Found getProducts at line:', idx);

if (idx !== -1) {
  // lines[idx + 1] is "const db = this.read();"
  // lines[idx + 2] is "let items = db.products || [];"
  const insertion = [
    '',
    '    // Purgar productos eliminados de la tienda (galga, tobera y lista negra)',
    '    items = items.filter(p => !DELETED_PRODUCTS_BLOCKLIST.includes(p.id) && !(p.worlds && p.worlds.length === 1 && p.worlds[0] === \'industria\'));',
    '',
    '    // Actualizar precios de Starter Packs si aún tienen los precios antiguos no rentables',
    '    items = items.map(p => {',
    '      if (p.id === \'starter-pack-joyeria-t27\' && p.price < 540) {',
    '        return { ...p, price: 540, regularPrice: 680 };',
    '      }',
    '      if (p.id === \'starter-pack-gym-t32\' && p.price < 490) {',
    '        return { ...p, price: 490, regularPrice: 620 };',
    '      }',
    '      if (p.id === \'starter-pack-barberia-t18\' && p.price < 480) {',
    '        return { ...p, price: 480, regularPrice: 590 };',
    '      }',
    '      return p;',
    '    });'
  ];

  lines.splice(idx + 3, 0, ...insertion);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Lines inserted successfully!');
}
