import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();
const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
const prods = res.rows[0]?.value;
console.log('Total products in Cloud Postgres:', Array.isArray(prods) ? prods.length : 'not array');

if (Array.isArray(prods)) {
  const allGalleryUrls = [];
  for (const p of prods) {
    const g = p.gallery || [];
    g.forEach((img, idx) => {
      if (img) allGalleryUrls.push({ productId: p.id, name: p.name, idx, url: img });
    });
  }
  console.log('Total gallery URLs in Cloud Postgres:', allGalleryUrls.length);

  // Check how many start with ./ or http or /
  let relativeCount = 0;
  let oldRenderCount = 0;
  let oldGithubCount = 0;
  let weird = [];

  for (const item of allGalleryUrls) {
    if (item.url.startsWith('./')) relativeCount++;
    if (item.url.includes('onrender.com')) oldRenderCount++;
    if (item.url.includes('github.io')) oldGithubCount++;
    if (item.url.includes('undefined') || item.url.includes('null') || !item.url.startsWith('/')) {
      weird.push(item);
    }
  }
  console.log({ relativeCount, oldRenderCount, oldGithubCount, weirdCount: weird.length });
  if (weird.length > 0) {
    console.log('Weird URLs:', weird.slice(0, 10));
  }
}
await client.end();
