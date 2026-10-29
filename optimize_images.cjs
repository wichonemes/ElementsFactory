/* Node script that compresses JPEG/PNG images in the public folder using sharp. */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const PUBLIC_ROOT = path.join(__dirname, 'public');

(async () => {
  // Recursive function to gather image files
  async function collectFiles(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        files.push(...await collectFiles(full));
      } else if (e.isFile() && /\.(jpe?g|png)$/i.test(e.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const files = await collectFiles(PUBLIC_ROOT);
  console.log(`Found ${files.length} images to optimize.`);

  for (const file of files) {
    try {
      const rel = path.relative(PUBLIC_ROOT, file);
      const image = sharp(file);
      const metadata = await image.metadata();
      const width = metadata.width > 1200 ? 1200 : undefined;

      // Optimize original (overwrite)
      let pipeline = image.clone();
      if (width) pipeline = pipeline.resize({ width });
      if (metadata.format === 'jpeg') {
        await pipeline.jpeg({ quality: 85 }).toFile(file + '.tmp');
      } else if (metadata.format === 'png') {
        await pipeline.png({ compressionLevel: 9 }).toFile(file + '.tmp');
      }
      fs.renameSync(file + '.tmp', file);

      // Create WebP version alongside original (same name with .webp)
      let webpPipe = image.clone();
      if (width) webpPipe = webpPipe.resize({ width });
      await webpPipe.webp({ quality: 80 }).toFile(file.replace(/\.(jpe?g|png)$/i, '.webp'));

      console.log(`Optimized: ${rel}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  console.log('All images optimized.');
})();