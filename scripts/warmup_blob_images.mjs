import fs from 'fs';
import path from 'path';

// Load all active referenced images
const { db } = await import('../server/db.js');
const prods = db.getProducts({ status: 'all' });
const assets = new Set();

for (const p of prods) {
  if (p.image) assets.add(p.image.replace(/^\/+/, ''));
  if (Array.isArray(p.gallery)) {
    for (const g of p.gallery) {
      if (g) assets.add(g.replace(/^\/+/, ''));
    }
  }
}

const settings = db.getSettings();
if (settings) {
  const str = JSON.stringify(settings);
  const m = str.match(/"\/(uploads|brand|portafolio|portfolio|interfaces|products|downloads)[^"]+"/g);
  if (m) {
    for (const x of m) assets.add(x.replace(/^"\/+/, '').replace(/"$/, ''));
  }
}

// Brand images & main showcase
const brandAssets = [
  'brand/og_artesano_preview.jpg',
  'brand/artesano_banner_principal.webp',
  'brand/artesano-logo.png',
  'brand/artesano_icon_512.png',
  'brand/artesano_taller_foto.webp'
];
brandAssets.forEach(b => assets.add(b));

const list = Array.from(assets).filter(x => !x.includes('...') && !x.includes('tu_foto'));
console.log(`=== INICIANDO CALENTAMIENTO Y MIGRACION DE ${list.length} ASSETS A VERCEL BLOB ===\n`);

let ok = 0;
let fail = 0;
let hits = 0;
let misses = 0;
const failedList = [];

async function checkAsset(item) {
  const url = `https://artesano-digital.vercel.app/${item}`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const cache = res.headers.get('x-vercel-cache') || 'NONE';
    if (res.status === 200) {
      ok++;
      if (cache === 'HIT') hits++;
      else misses++;
    } else {
      fail++;
      failedList.push({ item, status: res.status });
    }
  } catch (err) {
    fail++;
    failedList.push({ item, error: err.message });
  }
}

// Concurrency pool of 6
const CONCURRENCY = 6;
let idx = 0;
async function worker() {
  while (idx < list.length) {
    const current = list[idx++];
    await checkAsset(current);
    if ((ok + fail) % 25 === 0 || ok + fail === list.length) {
      process.stdout.write(`Progreso: ${ok + fail}/${list.length} (${ok} exitosos, ${fail} fallidos, ${hits} hits CDN)\r`);
    }
  }
}

const startTime = Date.now();
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

console.log(`\n\n=== REPORTE DE MIGRACION A VERCEL BLOB ===`);
console.log(`Tiempo total: ${elapsed}s`);
console.log(`Total procesados: ${list.length}`);
console.log(`Exitosos (200 OK en Blob/CDN): ${ok} (${((ok / list.length) * 100).toFixed(1)}%)`);
console.log(`Cache Edge Hits directos: ${hits}`);
console.log(`Migrados / descargados en este pase: ${misses}`);
console.log(`Fallidos: ${fail}`);
if (failedList.length > 0) {
  console.log(`Detalle de fallidos (primeros 15):`, failedList.slice(0, 15));
}
