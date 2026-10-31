import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function checkDetails() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;
  await client.end();

  console.log('Total products:', prods.length);
  for (const p of prods) {
    const g = p.gallery || [];
    console.log(`${p.code} (${p.name}):`);
    console.log(`  0 (context): ${g[0]}`);
    console.log(`  1 (white):   ${g[1]}`);
    console.log(`  2 (detail):  ${g[2]}`);
    console.log(`  3 (scale):   ${g[3]}`);
  }
}
checkDetails();
