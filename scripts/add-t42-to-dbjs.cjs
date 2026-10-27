const fs = require('fs');
const dbPath = 'server/data/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const t42 = db.products.find(p => p.id === 'clicker-mecanico-fidget-t42');

let js = fs.readFileSync('server/db.js', 'utf8');
if (!js.includes('clicker-mecanico-fidget-t42')) {
  const marker = '"personalizados-abuelitos"';
  const idx = js.indexOf(marker);
  if (idx !== -1) {
    const closeBracketIdx = js.indexOf('];', idx);
    if (closeBracketIdx !== -1) {
      const before = js.slice(0, closeBracketIdx);
      const after = js.slice(closeBracketIdx);
      const isCRLF = js.includes('\r\n');
      const nl = isCRLF ? '\r\n' : '\n';
      const toInsert = '  },' + nl + JSON.stringify(t42, null, 2) + nl;
      // Replace the trailing "  }" before ];
      const lastBraceIdx = before.lastIndexOf('}');
      const finalBefore = before.slice(0, lastBraceIdx) + '}' + ',' + nl + '  ' + JSON.stringify(t42, null, 2) + nl;
      js = finalBefore + after;
      fs.writeFileSync('server/db.js', js, 'utf8');
      console.log('✓ server/db.js successfully updated with T42');
    }
  }
} else {
  console.log('T42 already present in server/db.js');
}
