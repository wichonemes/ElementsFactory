import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');

function normalizeAssets(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      normalizeAssets(full);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      let content = fs.readFileSync(full, 'utf8');
      const original = content;

      // Replace './brand/' with '/brand/'
      content = content.replace(/(['"])\.\/brand\//g, '$1/brand/');
      // Replace './uploads/' with '/uploads/'
      content = content.replace(/(['"])\.\/uploads\//g, '$1/uploads/');
      // Replace './interfaces/' with '/interfaces/'
      content = content.replace(/(['"])\.\/interfaces\//g, '$1/interfaces/');
      // Replace './portafolio/' with '/portafolio/'
      content = content.replace(/(['"])\.\/portafolio\//g, '$1/portafolio/');
      // Replace './downloads/' with '/downloads/'
      content = content.replace(/(['"])\.\/downloads\//g, '$1/downloads/');

      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log(`Normalized asset paths in: ${path.relative(SRC_DIR, full)}`);
      }
    }
  }
}

normalizeAssets(SRC_DIR);
console.log('Asset path normalization complete.');
