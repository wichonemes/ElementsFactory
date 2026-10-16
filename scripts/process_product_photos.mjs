import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const uploadsDir = path.join(rootDir, 'public', 'uploads');
const dbPath = path.join(rootDir, 'server', 'data', 'db.json');

/**
 * Procesa y optimiza una imagen a formato WebP cuadrado 1:1 con compresión de alta fidelidad
 * @param {string} inputPath - Ruta de la imagen origen
 * @param {string} outputFilename - Nombre del archivo destino en /uploads/
 * @param {number} size - Dimensión cuadrada en píxeles (default 1000x1000)
 */
export async function optimizeSquarePhoto(inputPath, outputFilename, size = 1000) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Archivo origen no encontrado: ${inputPath}`);
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const outputPath = path.join(uploadsDir, outputFilename);

  // Redimensionar a cuadrado 1:1 con recorte 'cover' y compresión WebP al 88% de calidad
  await sharp(inputPath)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 88, effort: 4 })
    .toFile(outputPath);

  return `/uploads/${outputFilename}`;
}

/**
 * Pipeline integral para asignar los 4 slots de fotografía a un producto de catálogo
 * @param {string} productCodeOrId - Código (ej. 'L14', 'T6') o ID del producto
 * @param {Object} photos - { slot1, slot2, slot3, slot4 } con rutas a los archivos
 */
export async function assignProductPhotoSlots(productCodeOrId, photos = {}) {
  if (!fs.existsSync(dbPath)) {
    throw new Error('Base de datos no encontrada');
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const prod = db.products.find(p => p.id === productCodeOrId || p.code === productCodeOrId);

  if (!prod) {
    throw new Error(`Producto ${productCodeOrId} no encontrado en catálogo`);
  }

  const codeSlug = (prod.code || prod.id).toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const timestamp = Date.now();
  const assigned = {};

  // Slot 1: Portada en Contexto Real
  if (photos.slot1 && fs.existsSync(photos.slot1)) {
    const fn = `prod_${codeSlug}_slot1_context_${timestamp}.webp`;
    assigned.primaryImage = await optimizeSquarePhoto(photos.slot1, fn);
  }

  // Slot 2: Fondo Blanco Puro
  if (photos.slot2 && fs.existsSync(photos.slot2)) {
    const fn = `prod_${codeSlug}_slot2_whitebg_${timestamp}.webp`;
    assigned.whiteBgImage = await optimizeSquarePhoto(photos.slot2, fn);
  }

  // Slot 3: Detalle de Cualidades y Textura
  if (photos.slot3 && fs.existsSync(photos.slot3)) {
    const fn = `prod_${codeSlug}_slot3_detail_${timestamp}.webp`;
    assigned.detailImage = await optimizeSquarePhoto(photos.slot3, fn);
  }

  // Slot 4: Medidas y Escala Física
  if (photos.slot4 && fs.existsSync(photos.slot4)) {
    const fn = `prod_${codeSlug}_slot4_scale_${timestamp}.webp`;
    assigned.dimensionsImage = await optimizeSquarePhoto(photos.slot4, fn);
  }

  // Actualizar objeto producto en base de datos
  Object.assign(prod, assigned);

  // Mantener sincronizada la galería
  const galleryItems = [
    prod.primaryImage,
    prod.whiteBgImage,
    prod.detailImage,
    prod.dimensionsImage
  ].filter(Boolean);

  if (galleryItems.length > 0) {
    prod.gallery = galleryItems;
  }

  // Guardar en db.json
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

  return {
    productCode: prod.code,
    name: prod.name,
    assigned
  };
}
