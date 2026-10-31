import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function checkVariants2and3() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;
  await client.end();

  console.log(`Checking -card.webp and -medium.webp for slots 2 and 3...`);
  const missingVariants = [];

  for (const p of prods) {
    const g = p.gallery || [];
    for (const slot of [2, 3]) {
      const urlRaw = g[slot];
      if (!urlRaw) continue;
      const cleanPath = urlRaw.replace(/^\.?\/+/, '');
      const m = cleanPath.match(/^(.*\/)?([^/]+)\.(jpe?g|png|webp)$/i);
      if (!m) continue;
      const baseDir = m[1] || '';
      const baseName = m[2];
      if (baseName.endsWith('-card') || baseName.endsWith('-medium')) continue;

      const cardPath = `${baseDir}${baseName}-card.webp`;
      const mediumPath = `${baseDir}${baseName}-medium.webp`;

      for (const variant of [cardPath, mediumPath]) {
        try {
          const resp = await fetch('https://artesano-digital.vercel.app/' + variant, { method: 'HEAD' });
          if (!resp.ok) {
            missingVariants.push({ code: p.code, slot, variant, status: resp.status });
          }
        } catch (e) {
          missingVariants.push({ code: p.code, slot, variant, error: e.message });
        }
      }
    }
  }

  console.log('Total missing variants:', missingVariants.length);
  if (missingVariants.length > 0) {
    console.log('Sample missing variants:', JSON.stringify(missingVariants.slice(0, 20), null, 2));
  }
}
checkVariants2and3();
