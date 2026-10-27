import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const productsPath = path.join(distDir, 'api/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

let total = 0;
let missing = [];

for (const p of products) {
  const images = [p.image, ...(p.images || []), ...(p.gallery || [])].filter(Boolean);
  for (const img of images) {
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      continue;
    }
    total++;
    const clean = img.replace(/^\.\//, '').replace(/^\//, '');
    const full = path.join(distDir, clean);
    if (!fs.existsSync(full)) {
      missing.push({
        productId: p.id,
        productName: p.name,
        image: img,
        full
      });
    }
  }
}

console.log(`Audited ${products.length} products with ${total} total image references.`);
console.log(`Missing product images: ${missing.length}`);
if (missing.length > 0) {
  console.log('Missing items:', JSON.stringify(missing.slice(0, 10), null, 2));
} else {
  console.log('100% of product images exist in dist!');
}
