// optimize_images.cjs
// Node script (CommonJS) that compresses JPEG/PNG images in the public folder using sharp.
// It resizes images to a maximum width of 1200px (keeping aspect ratio) and
// re‑encodes JPEGs with quality 85, PNGs with compression level 9.
// The original files are overwritten with the optimized version.

const path = require('path');
const fs = require('fs');
const globby = require('globby');
const sharp = require('sharp');

const PUBLIC_ROOT = path.join(__dirname, 'public');

(async () => {
  const files = await globby(['**/*.{jpg,jpeg,png}'], { cwd: PUBLIC_ROOT, absolute: true });
  console.log(`Found ${files.length} images to optimize.`);

  for (const file of files) {
    try {
      const rel = path.relative(PUBLIC_ROOT, file);
      const image = sharp(file);
      const metadata = await image.metadata();
      const width = metadata.width > 1200 ? 1200 : undefined;
      let pipeline = image.clone();
      if (width) pipeline = pipeline.resize({ width });

      if (metadata.format === 'jpeg') {
        await pipeline.jpeg({ quality: 85 }).toFile(file + '.tmp');
      } else if (metadata.format === 'png') {
        await pipeline.png({ compressionLevel: 9 }).toFile(file + '.tmp');
      }
      // Replace original with optimized file
      fs.renameSync(file + '.tmp', file);
      console.log(`Optimized: ${rel}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  console.log('All images optimized.');
})();
