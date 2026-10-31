import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();
const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
const prods = res.rows[0]?.value;

const shortGalleries = [];
for (const p of prods) {
  const g = p.gallery || [];
  if (g.length < 4) {
    shortGalleries.push({
      id: p.id,
      name: p.name,
      galleryLength: g.length,
      gallery: g,
      primaryImage: p.primaryImage,
      whiteBgImage: p.whiteBgImage,
      detailImage: p.detailImage,
      measureImage: p.measureImage,
      dimensionsImage: p.dimensionsImage
    });
  }
}

console.log('Products with gallery < 4:', shortGalleries.length);
console.log(JSON.stringify(shortGalleries, null, 2));
await client.end();
