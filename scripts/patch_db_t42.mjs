import fs from 'fs';

const filePath = 'server/db.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldGallery = `  "gallery": [
    "/uploads/t42_clicker_mecanico_contexto.webp",
    "/uploads/t42_clicker_mecanico_estudio.webp"
  ],`;

const newGallery = `  "gallery": [
    "/uploads/t42_clicker_mecanico_contexto.webp",
    "/uploads/t42_clicker_mecanico_estudio.webp",
    "/uploads/t42_clicker_mecanico_estudio.webp",
    "/uploads/t42_clicker_mecanico_estudio.webp"
  ],`;

const oldMeta = `  "whiteBgImage": "/uploads/t42_clicker_mecanico_estudio.webp",
  "galleryMeta": [
    {
      "label": "1. Vista de contexto en setup gamer / escritorio",
      "shortLabel": "Contexto",
      "type": "context",
      "materialInfo": "Carcasa PLA verde olivo mate con switch mecánico táctil y keycap crema"
    },
    {
      "label": "2. Foto de estudio fondo blanco estilo Mercado Libre",
      "shortLabel": "Fondo Blanco",
      "type": "white_angle",
      "materialInfo": "Vista isométrica 45° con switch Outemu y argolla metálica reforzada"
    }
  ],`;

const newMeta = `  "whiteBgImage": "/uploads/t42_clicker_mecanico_estudio.webp",
  "detailImage": "/uploads/t42_clicker_mecanico_estudio.webp",
  "measureImage": "/uploads/t42_clicker_mecanico_estudio.webp",
  "galleryMeta": [
    {
      "label": "1. Vista de contexto en setup gamer / escritorio",
      "shortLabel": "Contexto",
      "type": "lifestyle",
      "materialInfo": "Carcasa PLA verde olivo mate con switch mecánico táctil y keycap crema"
    },
    {
      "label": "2. Foto de estudio fondo blanco estilo Mercado Libre",
      "shortLabel": "Fondo Blanco",
      "type": "white_angle",
      "materialInfo": "Vista isométrica 45° con switch Outemu y argolla metálica reforzada"
    },
    {
      "label": "3. Detalle macro de switch mecánico y keycap",
      "shortLabel": "Detalle",
      "type": "detail",
      "materialInfo": "Switch tipo Outemu con clic táctil y keycap desmontable"
    },
    {
      "label": "4. Medidas y proporciones en mano",
      "shortLabel": "Medidas",
      "type": "measures",
      "materialInfo": "3.2 x 2.4 x 2.8 cm, formato compacto para llavero de bolsillo"
    }
  ],`;

const normContent = content.replace(/\r\n/g, '\n');
const normOldGallery = oldGallery.replace(/\r\n/g, '\n');
const normNewGallery = newGallery.replace(/\r\n/g, '\n');
const normOldMeta = oldMeta.replace(/\r\n/g, '\n');
const normNewMeta = newMeta.replace(/\r\n/g, '\n');

if (!normContent.includes(normOldGallery)) {
  console.error('Could not find old gallery in server/db.js');
} else {
  let updated = normContent.replace(normOldGallery, normNewGallery);
  if (!updated.includes(normOldMeta)) {
    console.error('Could not find old meta in server/db.js');
  } else {
    updated = updated.replace(normOldMeta, normNewMeta);
    // restore CRLF if original had CRLF
    if (content.includes('\r\n')) {
      updated = updated.replace(/\n/g, '\r\n');
    }
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Successfully updated server/db.js');
  }
}
