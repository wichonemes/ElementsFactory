import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function check() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;
  await client.end();

  const issues = [];
  for (const p of prods) {
    const g = p.gallery || [];
    const missingSlots = [];
    for (let i = 0; i < 4; i++) {
      if (!g[i]) missingSlots.push(i);
    }
    if (missingSlots.length > 0) {
      issues.push({ code: p.code, name: p.name, galleryLen: g.length, missingSlots, gallery: g });
    }
  }
  console.log('Products with fewer than 4 gallery slots:', issues.length);
  console.log(JSON.stringify(issues, null, 2));
}
check();
