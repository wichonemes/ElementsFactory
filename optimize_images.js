// optimize_images.js
// Node script that compresses JPEG/PNG images in the public folder using sharp.
// It resizes images to a max width of 1200px (maintaining aspect ratio) and
// re‑encodes JPEGs with quality 85, PNGs with compression level 9.
// It also creates a WebP version (quality 80).

const path = require('path');
const fs = require('fs');
const globby = require('globby');
const sharp = require('sharp');

const PUBLIC_ROOT = path.join(__dirname, 'public');
const DEST_ROOT = path.join(PUBLIC_ROOT, 'optimized');

(async () => {
  // Find all image files
  const files = await globby(['**/*.{jpg,jpeg,png}'], { cwd: PUBLIC_ROOT, absolute: true });
  console.log(`Found ${files.length} images to optimize.`);

  for (const file of files) {
    const rel = path.relative(PUBLIC_ROOT, file);
    const outDir = path.join(DEST_ROOT, path.dirname(rel));
    fs.mkdirSync(outDir, { recursive: true });
    const baseName = path.parse(rel).name;
    const ext = path.parse(rel).ext.toLowerCase();
    const outJpg = path.join(outDir, `${baseName}${ext}`);
    const outWebp = path.join(outDir, `${baseName}.webp`);

    try {
      const image = sharp(file);
      const metadata = await image.metadata();
      // Resize if width > 1200
      const width = metadata.width > 1200 ? 1200 : undefined;

      // JPEG or PNG processing
      let pipeline = image.clone();
      if (width) pipeline = pipeline.resize({ width });

      if (ext === '.jpg' || ext === '.jpeg') {
        await pipeline.jpeg({ quality: 85 }).toFile(outJpg);
      } else if (ext === '.png') {
        await pipeline.png({ compressionLevel: 9 }).toFile(outJpg);
      }

      // Create WebP version
      let webpPipe = image.clone();
      if (width) webpPipe = webpPipe.resize({ width });
      await webpPipe.webp({ quality: 80 }).toFile(outWebp);

      console.log(`Optimized: ${rel}`);
    } catch (err) {
      console.error(`Error processing ${rel}:`, err);
    }
  }
  console.log('Optimization complete.');
})();
