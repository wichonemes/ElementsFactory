import { removeBackground } from '@imgly/background-removal';

const CANVAS_SIZE = 1000;
const PRODUCT_SCALE = 0.86;

export async function whiteStudioFile(file) {
  const cutout = await removeBackground(file, { output: { format: 'image/png' } });
  const bitmap = await createImageBitmap(cutout);
  const scale = Math.min((CANVAS_SIZE * PRODUCT_SCALE) / bitmap.width, (CANVAS_SIZE * PRODUCT_SCALE) / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, (CANVAS_SIZE - w) / 2, (CANVAS_SIZE - h) / 2, w, h);
  bitmap.close?.();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('No se pudo crear la imagen'))), 'image/jpeg', 0.92);
  });
  const baseName = String(file.name || 'producto').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'producto';
  return new File([blob], `${baseName}-fondo-blanco.jpg`, { type: 'image/jpeg' });
}
