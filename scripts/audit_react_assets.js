import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');
const distDir = path.resolve('dist');

function getSourceFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getSourceFiles(srcDir);
let totalChecked = 0;
let missing = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Match src="..." or image: '...' or bgImage: '...' or url: '...'
  const regex = /(?:src|image|bgImage|img|photo)\s*[:=]\s*["'`]([^"'`]+)["'`]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const uri = match[1];
    if (
      uri.startsWith('http://') ||
      uri.startsWith('https://') ||
      uri.startsWith('data:') ||
      uri.includes('${') ||
      uri.includes('+') ||
      !uri.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|pdf)$/i)
    ) {
      continue;
    }

    const cleanUri = uri.replace(/^\.\//, '').replace(/^\//, '');
    const distPath = path.join(distDir, cleanUri);

    totalChecked++;
    if (!fs.existsSync(distPath)) {
      missing.push({
        sourceFile: path.relative(srcDir, file),
        uri,
        resolvedPath: distPath
      });
    }
  }
}

console.log('Total React component assets checked:', totalChecked);
console.log('Missing React assets count:', missing.length);
if (missing.length > 0) {
  console.log('Missing items:', JSON.stringify(missing, null, 2));
} else {
  console.log('All images and assets in React components are 100% valid!');
}
