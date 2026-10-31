import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

async function updateDb() {
  const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const res = await client.query("SELECT value FROM artisan_private.state WHERE key = 'products'");
  const prods = res.rows[0]?.value;

  if (!Array.isArray(prods)) {
    console.error('Products is not an array!');
    await client.end();
    return;
  }

  let modifiedCount = 0;
  for (const p of prods) {
    let changed = false;
    const clean = (str) => typeof str === 'string' ? str.replace(/^\.\//, '/') : str;

    ['primaryImage', 'whiteBgImage', 'detailImage', 'measureImage', 'dimensionsImage'].forEach(f => {
      if (typeof p[f] === 'string' && p[f].startsWith('./')) {
        p[f] = clean(p[f]);
        changed = true;
      }
    });

    if (Array.isArray(p.gallery)) {
      p.gallery = p.gallery.map(g => {
        if (typeof g === 'string' && g.startsWith('./')) {
          changed = true;
          return clean(g);
        }
        return g;
      });
    }

    if (p.code === 'T42' || p.id === 'clicker-mecanico-fidget-t42') {
      const contexto = '/uploads/t42_clicker_mecanico_contexto.webp';
      const estudio = '/uploads/t42_clicker_mecanico_estudio.webp';
      p.primaryImage = contexto;
      p.whiteBgImage = estudio;
      p.detailImage = estudio;
      p.measureImage = estudio;
      p.gallery = [contexto, estudio, estudio, estudio];
      p.galleryMeta = [
        { label: '1. Vista de contexto en setup gamer / escritorio', shortLabel: 'Contexto', type: 'lifestyle' },
        { label: '2. Vista de estudio sobre fondo blanco', shortLabel: 'Fondo blanco', type: 'white_angle' },
        { label: '3. Detalle macro de switch y keycap', shortLabel: 'Detalle', type: 'detail' },
        { label: '4. Dimensiones y escala en mano', shortLabel: 'Medidas', type: 'measures' }
      ];
      changed = true;
    }

    if (changed) modifiedCount++;
  }

  console.log(`Updated ${modifiedCount} products in array. Saving to Postgres...`);
  await client.query("UPDATE artisan_private.state SET value = $1 WHERE key = 'products'", [JSON.stringify(prods)]);
  console.log('Postgres update complete!');
  await client.end();
}
updateDb();
