// replace_imgs2.cjs
// Recursively replace <img> tags with <ImageOptimized> and ensure import.

const fs = require('fs').promises;
const path = require('path');

const SRC_ROOT = path.join(__dirname, 'src');
const IMPORT_LINE = "import ImageOptimized from './ImageOptimized';";

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      await processFile(fullPath);
    }
  }
}

async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  if (!content.includes('<img')) return;

  // Add import if missing
  if (!content.includes('ImageOptimized')) {
    const lines = content.split('\n');
    let insertIdx = lines.findIndex(l => l.startsWith('import'));
    if (insertIdx === -1) insertIdx = 0;
    while (insertIdx + 1 < lines.length && lines[insertIdx + 1].startsWith('import')) {
      insertIdx++;
    }
    lines.splice(insertIdx + 1, 0, IMPORT_LINE);
    content = lines.join('\n');
  }

  const replaced = content.replace(/<img(\s+[^>]*?)\/>/g, '<ImageOptimized$1/>');
  if (replaced !== content) {
    await fs.writeFile(filePath, replaced, 'utf8');
    console.log('Updated', path.relative(SRC_ROOT, filePath));
  }
}

(async () => {
  await walk(SRC_ROOT);
  console.log('All img tags replaced.');
})();