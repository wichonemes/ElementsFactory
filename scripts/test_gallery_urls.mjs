import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function run() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;
  await client.end();

  console.log(`Testing images for ${prods.length} products...`);
  const failed = [];
  const ok = [];

  for (const p of prods) {
    const gallery = p.gallery || [];
    for (let i = 0; i < gallery.length; i++) {
      const urlRaw = gallery[i];
      if (!urlRaw) continue;
      const cleanPath = urlRaw.replace(/^\.?\/+/, '');
      const fullUrl = urlRaw.startsWith('http') ? urlRaw : 'https://artesano-digital.vercel.app/' + cleanPath;
      try {
        const resp = await fetch(fullUrl, { method: 'HEAD' });
        if (!resp.ok) {
          failed.push({ code: p.code, name: p.name, slot: i, url: urlRaw, fullUrl, status: resp.status });
        } else {
          ok.push(urlRaw);
        }
      } catch (err) {
        failed.push({ code: p.code, name: p.name, slot: i, url: urlRaw, fullUrl, error: err.message });
      }
    }
  }

  console.log('OK count:', ok.length);
  console.log('FAILED count:', failed.length);
  if (failed.length > 0) {
    console.log('Failed images:', JSON.stringify(failed, null, 2));
  }
}
run();
