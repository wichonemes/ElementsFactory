// replace_imgs.cjs
// Script to replace all <img> tags with <ImageOptimized> component
// and add the import statement in each file that uses it.

const fs = require('fs').promises;
const path = require('path');
// Resolve globby import safely for both ESM and CJS
let globbyImport = require('globby');
const globby = globbyImport.default || globbyImport;
console.log('globby type:', typeof globby);

const SRC_ROOT = path.join(__dirname, 'src');
const IMPORT_LINE = "import ImageOptimized from './ImageOptimized';";

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  if (!content.includes('<img')) return; // no img tags

  // Add import if missing (after the first import line)
  if (!content.includes('ImageOptimized')) {
    const lines = content.split('\n');
    let insertIdx = lines.findIndex(l => l.startsWith('import'));
    if (insertIdx === -1) insertIdx = 0;
    // Insert after the last consecutive import block
    while (insertIdx + 1 < lines.length && lines[insertIdx + 1].startsWith('import')) {
      insertIdx++;
    }
    lines.splice(insertIdx + 1, 0, IMPORT_LINE);
    content = lines.join('\n');
  }

  // Replace <img .../> with <ImageOptimized .../>
  const replaced = content.replace(/<img(\s+[^>]*?)\/>/g, '<ImageOptimized$1/>');
  if (replaced !== content) {
    await fs.writeFile(filePath, replaced, 'utf8');
    console.log(`Updated ${path.relative(SRC_ROOT, filePath)}`);
  }
}

(async () => {
  const files = await globby(['**/*.{js,jsx}'], { cwd: SRC_ROOT, absolute: true });
  for (const file of files) {
    await processFile(file);
  }
  console.log('All image tags replaced with ImageOptimized.');
})();