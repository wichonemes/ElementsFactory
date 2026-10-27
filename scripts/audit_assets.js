import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('dist');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(baseDir);
console.log('Total HTML files found:', htmlFiles.length);

let totalChecked = 0;
let missing = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);

  const regex = /(?:src|href)=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const uri = match[1];
    if (
      uri.startsWith('http://') ||
      uri.startsWith('https://') ||
      uri.startsWith('//') ||
      uri.startsWith('mailto:') ||
      uri.startsWith('tel:') ||
      uri.startsWith('javascript:') ||
      uri.startsWith('#') ||
      uri.startsWith('data:')
    ) {
      continue;
    }

    const cleanUri = uri.split('?')[0].split('#')[0];
    if (!cleanUri) continue;

    let targetPath;
    if (cleanUri.startsWith('/')) {
      targetPath = path.join(baseDir, cleanUri);
    } else {
      targetPath = path.resolve(fileDir, cleanUri);
    }

    totalChecked++;
    if (!fs.existsSync(targetPath)) {
      if (fs.existsSync(path.join(targetPath, 'index.html'))) {
        continue;
      }
      missing.push({
        htmlFile: path.relative(baseDir, file),
        uri,
        resolvedPath: targetPath
      });
    }
  }
}

console.log('Total links/sources checked:', totalChecked);
console.log('Missing items count:', missing.length);
if (missing.length > 0) {
  console.log('Missing items:', JSON.stringify(missing, null, 2));
} else {
  console.log('All links and assets in all HTML files are 100% valid!');
}
