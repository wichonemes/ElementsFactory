import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function scanAllImageFields() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;
  await client.end();

  const foundRelative = [];
  for (const p of prods) {
    const fields = ['primaryImage', 'whiteBgImage', 'detailImage', 'measureImage', 'dimensionsImage'];
    for (const f of fields) {
      if (typeof p[f] === 'string' && p[f].startsWith('./')) {
        foundRelative.push({ id: p.id, code: p.code, field: f, val: p[f] });
      }
    }
    if (Array.isArray(p.gallery)) {
      p.gallery.forEach((g, idx) => {
        if (typeof g === 'string' && g.startsWith('./')) {
          foundRelative.push({ id: p.id, code: p.code, field: `gallery[${idx}]`, val: g });
        }
      });
    }
  }

  console.log('Total relative paths in Postgres:', foundRelative.length);
  console.log(JSON.stringify(foundRelative, null, 2));
}
scanAllImageFields();
