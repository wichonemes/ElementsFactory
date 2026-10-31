import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
import fs from 'fs';

function cleanItemName(name = '') {
  if (typeof name !== 'string') return name;
  if (/^Filamento PLA\b/i.test(name)) {
    return 'Filamento PLA (1.75mm)';
  }
  if (/^Filamento TPU\b/i.test(name)) {
    return 'Filamento TPU Flexible 95A (1.75mm)';
  }
  if (/^Filamento PETG\b/i.test(name)) {
    return 'Filamento PETG (1.75mm)';
  }
  return name;
}

async function run() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;

  let totalCleaned = 0;
  for (const p of prods) {
    if (p.manufacturingRecipe?.items && Array.isArray(p.manufacturingRecipe.items)) {
      for (const it of p.manufacturingRecipe.items) {
        const prev = it.name;
        const next = cleanItemName(prev);
        if (prev !== next) {
          it.name = next;
          totalCleaned++;
        }
      }
    }
  }

  console.log(`Cleaned ${totalCleaned} recipe items in Cloud Postgres.`);
  await client.query("UPDATE artisan_private.state SET value = $1 WHERE key = 'products'", [JSON.stringify(prods)]);
  console.log('Postgres updated successfully.');
  await client.end();

  // Also clean in server/db.js initial products
  let dbJs = fs.readFileSync('server/db.js', 'utf8');
  const countBefore = (dbJs.match(/Filamento PLA Verde Olivo/g) || []).length;
  dbJs = dbJs.replace(/Filamento PLA Verde Olivo Mate \(1\.75mm\)/g, 'Filamento PLA (1.75mm)');
  dbJs = dbJs.replace(/Filamento PLA Verde Olivo Mate y Crema Taller[^"]*/g, 'Filamento PLA (1.75mm)');
  dbJs = dbJs.replace(/Filamento PLA Blanco Difusor y Base[^"]*/g, 'Filamento PLA (1.75mm)');
  dbJs = dbJs.replace(/Filamento TPU Flexible 95A Verde Olivo \(1\.75mm\)/g, 'Filamento TPU Flexible 95A (1.75mm)');
  fs.writeFileSync('server/db.js', dbJs, 'utf8');
  console.log(`Cleaned server/db.js. Replaced occurrences of Verde Olivo / specific colors.`);
}
run();
