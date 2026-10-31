import fs from 'fs';
import path from 'path';

const referenced = new Set();

// 1. From db.js
const { db } = await import('../server/db.js');
const prods = db.getProducts({ status: 'all' });
for (const p of prods) {
  if (p.image) referenced.add(p.image.replace(/^\/+/, ''));
  if (Array.isArray(p.gallery)) {
    for (const g of p.gallery) {
      if (g) referenced.add(g.replace(/^\/+/, ''));
    }
  }
}

const settings = db.getSettings();
if (settings) {
  const str = JSON.stringify(settings);
  const m = str.match(/"\/(uploads|brand|portafolio|portfolio|interfaces|products|downloads)[^"]+"/g);
  if (m) {
    for (const x of m) {
      referenced.add(x.replace(/^"\/+/, '').replace(/"$/, ''));
    }
  }
}

// 2. Scan src/
function scanDir(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      scanDir(full);
    } else if (/\.(jsx?|tsx?|html|json)$/.test(f.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /(?:\/)(uploads|brand|portafolio|portfolio|interfaces|products|downloads|animacion|audiovisual|editorial|fotografia|identidad-corporativa|ilustracion|impresos|maquetado-inicio-wicho-v2|mi-portafolio|modelado-3d|optimized)\/([a-zA-Z0-9_\-\.\/]+)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        // clean any trailing quote or parenthesis
        const asset = (match[1] + '/' + match[2]).replace(/['")\s].*$/, '');
        referenced.add(asset);
      }
    }
  }
}
scanDir('src');

console.log('Total referenced assets across active site:', referenced.size);
const arr = Array.from(referenced);
console.log('Sample (first 10):', arr.slice(0, 10));

// Check how many actually exist in public/
let foundLocally = 0;
let missingLocally = [];
for (const item of arr) {
  if (fs.existsSync(path.join('public', item))) {
    foundLocally++;
  } else {
    missingLocally.push(item);
  }
}
console.log(`Found locally in public/: ${foundLocally}/${arr.length}`);
if (missingLocally.length > 0) {
  console.log('Missing locally (sample):', missingLocally.slice(0, 5));
}
