import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOTS = [
  'public/uploads',
  'public/products/repository',
  'public/portfolio/modelado-3d',
  'public/brand'
];
const EXT = /\.(jpe?g|png|webp)$/i;
const CARD_WIDTH = 480;
const MEDIUM_WIDTH = 960;
const QUALITY = 82;
const CONCURRENCY = 4;

const jobs = [];
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const file of fs.readdirSync(root)) {
    if (!EXT.test(file)) continue;
    const base = path.parse(file).name;
    if (base.endsWith('-card') || base.endsWith('-medium')) continue;
    const src = path.join(root, file);
    jobs.push({ src, dir: root, base });
  }
}

let done = 0;
let skipped = 0;
let errors = 0;
const started = Date.now();

async function renderOne(job) {
  const cardPath = path.join(job.dir, `${job.base}-card.webp`);
  const mediumPath = path.join(job.dir, `${job.base}-medium.webp`);
  const stat = fs.statSync(job.src);
  let needs = false;
  for (const out of [cardPath, mediumPath]) {
    if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < stat.mtimeMs) needs = true;
  }
  if (!needs) {
    skipped++;
    return;
  }
  const input = sharp(job.src).rotate();
  await input
    .clone()
    .resize({ width: CARD_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(cardPath);
  await input
    .clone()
    .resize({ width: MEDIUM_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(mediumPath);
}

async function worker() {
  while (jobs.length) {
    const job = jobs.pop();
    try {
      await renderOne(job);
    } catch (err) {
      errors++;
      console.error('ERROR', job.src, err.message);
    } finally {
      done++;
      if (done % 25 === 0 || done === total) {
        console.log(`[optimize] ${done}/${total} (${Math.round((Date.now() - started) / 1000)}s) errors=${errors}`);
      }
    }
  }
}

const total = jobs.length;
console.log(`[optimize] ${total} source images -> card ${CARD_WIDTH}px / medium ${MEDIUM_WIDTH}px`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`[optimize] done in ${Math.round((Date.now() - started) / 1000)}s; skipped=${skipped}; errors=${errors}`);
