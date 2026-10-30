const DIRECT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DIRECT_MAX_BYTES = 1.2 * 1024 * 1024;
const MAX_SIDE = 2000;

function encodeCanvas(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('No se pudo preparar la imagen.'));
    }, 'image/webp', 0.86);
  }).then(blob => {
    if (blob.type === 'image/webp') return { blob, ext: 'webp' };
    return new Promise((resolve, reject) => {
      canvas.toBlob(jpeg => {
        if (jpeg) resolve({ blob: jpeg, ext: 'jpg' });
        else reject(new Error('No se pudo preparar la imagen.'));
      }, 'image/jpeg', 0.88);
    });
  });
}

export async function prepareImageForUpload(file) {
  if (DIRECT_TYPES.has(file.type) && file.size <= DIRECT_MAX_BYTES) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Este formato de imagen no se puede leer. Usa JPG, PNG o WebP (en iPhone: Ajustes > Cámara > Formatos > Más compatible).');
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const { blob, ext } = await encodeCanvas(canvas);
  const baseName = String(file.name || 'imagen').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'imagen';
  return new File([blob], `${baseName}.${ext}`, { type: blob.type });
}

export async function uploadImageFile(file, token) {
  if (!file) throw new Error('No se seleccionó ninguna imagen.');
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Selecciona un archivo de imagen (JPG, PNG, WebP o foto del celular).');
  }

  const prepared = await prepareImageForUpload(file);
  const formData = new FormData();
  formData.append('image', prepared, prepared.name);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let response;
  try {
    response = await fetch('/api/upload', { method: 'POST', headers, body: formData });
  } catch {
    throw new Error('Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.');
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 413) {
    throw new Error('La imagen sigue siendo muy pesada. Intenta con otra foto.');
  }
  if (!response.ok || !data.url) {
    throw new Error(data.error || `No se pudo subir la imagen (${response.status}).`);
  }
  return data.url;
}
