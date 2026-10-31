import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function testSlots2and3() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;
  await client.end();

  console.log(`Checking slots 2 and 3 for ${prods.length} products...`);
  const failed = [];

  for (const p of prods) {
    const g = p.gallery || [];
    for (const slot of [2, 3]) {
      const urlRaw = g[slot];
      const slotName = slot === 2 ? 'Detalle' : 'Medidas';
      if (!urlRaw) {
        failed.push({ code: p.code, name: p.name, slot: slotName, reason: 'UNDEFINED/EMPTY' });
        continue;
      }
      const cleanPath = urlRaw.replace(/^\.?\/+/, '');
      const fullUrl = urlRaw.startsWith('http') ? urlRaw : 'https://artesano-digital.vercel.app/' + cleanPath;
      try {
        const resp = await fetch(fullUrl);
        if (!resp.ok) {
          failed.push({ code: p.code, name: p.name, slot: slotName, url: urlRaw, status: resp.status });
        } else {
          const ct = resp.headers.get('content-type') || '';
          if (!ct.startsWith('image/')) {
            failed.push({ code: p.code, name: p.name, slot: slotName, url: urlRaw, reason: `Not an image: ${ct}` });
          }
        }
      } catch (err) {
        failed.push({ code: p.code, name: p.name, slot: slotName, url: urlRaw, reason: err.message });
      }
    }
  }

  console.log('Failed slots 2/3 count:', failed.length);
  if (failed.length > 0) {
    console.log(JSON.stringify(failed, null, 2));
  }
}
testSlots2and3();
