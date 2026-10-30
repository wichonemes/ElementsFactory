import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cloudDb } from './cloud-db.js';
import { storeImage } from './cloud-files.js';
import { aiPhotoEnabled, generateAiWhiteStudio, generateAiContextImage } from './ai-photo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'artesano-uploads')
  : path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Guarda un buffer WebP en almacenamiento persistente:
 * - Si cloudDb está activo (Render en producción), usa storeImage() en Supabase.
 * - Si local / disco, lo escribe en public/uploads/ y retorna la URL pública /uploads/...
 */
export async function persistProcessedImage(buffer, filename) {
  // En Vercel no hay disco persistente servible: si guardáramos en /tmp la URL
  // quedaría rota (404) y el estudio parecería "no generar" las fotos.
  const mustUseCloud = cloudDb.enabled || Boolean(process.env.VERCEL);
  if (mustUseCloud) {
    try {
      const stored = await storeImage(buffer);
      return stored.url;
    } catch (err) {
      console.warn('Fallo al subir la imagen al almacenamiento en la nube:', err.message);
      if (process.env.VERCEL) {
        throw new Error(`No se pudo guardar la imagen generada en el almacenamiento (${err.message}). Revisa la configuración de Vercel Blob.`);
      }
    }
  }

  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

/**
 * Extrae dimensiones numéricas en cm a partir de texto o ficha técnica
 */
export function parseDimensions(dimText = '') {
  const text = String(dimText || '').trim();
  // Buscar patrones como 22 x 14 x 3.5 cm o 20 x 15 cm o 25cm
  const matches = text.match(/(\d+(?:[.,]\d+)?)\s*(?:x|×|por|\*)\s*(\d+(?:[.,]\d+)?)(?:\s*(?:x|×|por|\*)\s*(\d+(?:[.,]\d+)?))?/i);
  
  if (matches) {
    const w = parseFloat(matches[1].replace(',', '.'));
    const h = parseFloat(matches[2].replace(',', '.'));
    const d = matches[3] ? parseFloat(matches[3].replace(',', '.')) : null;
    return {
      widthCm: w,
      heightCm: h,
      depthCm: d,
      raw: text,
      formatted: d ? `${w} × ${h} × ${d} cm` : `${w} × ${h} cm`
    };
  }

  // Si solo hay un número
  const single = text.match(/(\d+(?:[.,]\d+)?)\s*(?:cm|cms|centímetros)/i);
  if (single) {
    const val = parseFloat(single[1].replace(',', '.'));
    return {
      widthCm: val,
      heightCm: val,
      depthCm: null,
      raw: text,
      formatted: `${val} cm`
    };
  }

  return {
    widthCm: 20,
    heightCm: 15,
    depthCm: null,
    raw: text || 'Dimensiones estándar de taller',
    formatted: text || '20 × 15 cm aprox.'
  };
}

/**
 * TOMA 2: FONDO BLANCO PURO (#FFFFFF)
 * Procesa la foto original: orienta, centra, elimina distracciones de fondo,
 * ajusta exposición y genera sombra de contacto suave sobre lienzo blanco 1000x1000.
 */
export async function generateWhiteBackgroundImage(inputBuffer) {
  // 1. Cargar imagen original y auto-rotar según metadatos EXIF
  const basePipeline = sharp(inputBuffer).rotate();
  const metadata = await basePipeline.metadata();

  // 2. Redimensionar producto para encajar en caja de 820x820 centrada
  const productResized = await sharp(inputBuffer)
    .rotate()
    .resize(820, 820, {
      fit: 'inside',
      withoutEnlargement: false
    })
    .modulate({
      brightness: 1.04,
      saturation: 1.06
    })
    .toBuffer();

  const resizedMeta = await sharp(productResized).metadata();
  const pWidth = resizedMeta.width || 800;
  const pHeight = resizedMeta.height || 800;
  const leftPos = Math.round((1000 - pWidth) / 2);
  const topPos = Math.round((1000 - pHeight) / 2);

  // 3. Sombra de contacto difusa SVG en la base del producto
  const shadowSvg = Buffer.from(`
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.25"/>
          <stop offset="60%" stop-color="#000000" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="500" cy="${Math.min(960, topPos + pHeight - 10)}" rx="${Math.round(pWidth * 0.42)}" ry="${Math.round(pHeight * 0.06)}" fill="url(#shadowGrad)"/>
    </svg>
  `);

  // 4. Componer sobre lienzo blanco 1000x1000 puro
  const finalBuffer = await sharp({
    create: {
      width: 1000,
      height: 1000,
      channels: 4,
      background: '#FFFFFF'
    }
  })
  .composite([
    { input: shadowSvg, top: 0, left: 0 },
    { input: productResized, top: topPos, left: leftPos }
  ])
  .webp({ quality: 90, effort: 4 })
  .toBuffer();

  return finalBuffer;
}

/**
 * TOMA 3: DETALLE MACRO Y ACERCAMIENTO REAL
 * Recorta una sección real de la Imagen 2 (Fondo Blanco) y la amplía a 1000x1000
 * aplicando realce de nitidez sin alterar ni redibujar nada del producto.
 */
export async function generateDetailMacroImage(whiteImageBuffer, options = {}) {
  const {
    cropPosition = 'center', // 'center' | 'top' | 'bottom' | 'left' | 'right'
    zoom = 2.2 // factor de acercamiento
  } = options;

  const meta = await sharp(whiteImageBuffer).metadata();
  const width = meta.width || 1000;
  const height = meta.height || 1000;

  // Tamaño de la caja de recorte según zoom (ej. zoom 2.2 -> 450x450 de 1000)
  const cropSize = Math.max(300, Math.min(800, Math.round(width / zoom)));

  let cropLeft = Math.round((width - cropSize) / 2);
  let cropTop = Math.round((height - cropSize) / 2);

  if (cropPosition === 'top') {
    cropTop = Math.round(height * 0.18);
  } else if (cropPosition === 'bottom') {
    cropTop = Math.round(height * 0.52);
  } else if (cropPosition === 'left') {
    cropLeft = Math.round(width * 0.18);
  } else if (cropPosition === 'right') {
    cropLeft = Math.round(width * 0.52);
  }

  // Asegurar límites dentro de la imagen
  cropLeft = Math.max(0, Math.min(width - cropSize, cropLeft));
  cropTop = Math.max(0, Math.min(height - cropSize, cropTop));

  // Recorte real y ampliación con filtro sharpen
  const cropped = await sharp(whiteImageBuffer)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropSize,
      height: cropSize
    })
    .resize(1000, 1000, {
      kernel: sharp.kernel.lanczos3
    })
    .sharpen({
      sigma: 1.2,
      m1: 1.0,
      m2: 2.0
    })
    .toBuffer();

  // Overlay sutil de lupa y macro en la esquina inferior izquierda
  const macroBadgeSvg = Buffer.from(`
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <g filter="url(#badgeShadow)">
        <rect x="36" y="910" width="370" height="54" rx="27" fill="#1F2421" fill-opacity="0.92"/>
        <circle cx="68" cy="937" r="15" fill="#D4A359"/>
        <text x="68" y="942" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" fill="#1F2421" text-anchor="middle" font-weight="bold">🔍</text>
        <text x="96" y="943" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">ACERCAMIENTO MACRO REAL (${zoom.toFixed(1)}x)</text>
      </g>
    </svg>
  `);

  return sharp(cropped)
    .composite([{ input: macroBadgeSvg, top: 0, left: 0 }])
    .webp({ quality: 92, effort: 4 })
    .toBuffer();
}

/**
 * TOMA 4: TAMAÑO Y MEDIDAS CON TARJETA A ESCALA
 * Sobre la Imagen 2, compone cotas métricas vectoriales y la tarjeta de referencia
 * (8.6 x 5.4 cm) con la leyenda obligatoria "Referencia de tamaño · No incluido".
 */
export async function generateDimensionsImage(whiteImageBuffer, specifications = {}, productData = {}) {
  const dimInfo = parseDimensions(specifications.dimensions || productData.dimensions || '');
  const wCm = dimInfo.widthCm;
  const hCm = dimInfo.heightCm;
  const dCm = dimInfo.depthCm;
  const includesText = specifications.includes || productData.includes || '1 pieza terminada';

  // Coordenadas calculadas para las cotas sobre el lienzo 1000x1000
  const boxLeft = 140;
  const boxRight = 860;
  const boxTop = 150;
  const boxBottom = 820;

  const overlaySvg = Buffer.from(`
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Filtro de sombra suave para textos y tarjeta -->
        <filter id="cotaShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#2D4F3E"/>
        </marker>
        <marker id="arrowLeft" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#2D4F3E"/>
        </marker>
      </defs>

      <!-- ENCABEZADO SUPERIOR: FICHA TÉCNICA Y DIMENSIONES -->
      <g filter="url(#cotaShadow)">
        <rect x="40" y="30" width="920" height="74" rx="20" fill="#FAF9F5" stroke="#E8E4DA" stroke-width="2"/>
        <rect x="52" y="42" width="40" height="50" rx="12" fill="#2D4F3E"/>
        <text x="72" y="73" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" fill="#FFFFFF" text-anchor="middle" font-weight="bold">📐</text>
        <text x="106" y="60" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#1F2421">GUÍA DE TAMAÑO &amp; DIMENSIONES OFICIALES</text>
        <text x="106" y="82" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#6B7280">Medidas: <tspan font-weight="bold" fill="#2D4F3E">${dimInfo.formatted}</tspan> · Incluye: ${includesText}</text>
      </g>

      <!-- COTA HORIZONTAL INFERIOR (ANCHO) -->
      <g stroke="#2D4F3E" stroke-width="2.5" fill="none">
        <line x1="${boxLeft}" y1="${boxBottom + 30}" x2="${boxRight}" y2="${boxBottom + 30}"/>
        <line x1="${boxLeft}" y1="${boxBottom + 18}" x2="${boxLeft}" y2="${boxBottom + 42}"/>
        <line x1="${boxRight}" y1="${boxBottom + 18}" x2="${boxRight}" y2="${boxBottom + 42}"/>
      </g>
      <g filter="url(#cotaShadow)">
        <rect x="410" y="${boxBottom + 14}" width="180" height="32" rx="10" fill="#2D4F3E"/>
        <text x="500" y="${boxBottom + 35}" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
          ↔ ANCHO: ${wCm} cm
        </text>
      </g>

      <!-- COTA VERTICAL LATERAL DERECHA (ALTO) -->
      <g stroke="#2D4F3E" stroke-width="2.5" fill="none">
        <line x1="${boxRight + 30}" y1="${boxTop}" x2="${boxRight + 30}" y2="${boxBottom}"/>
        <line x1="${boxRight + 18}" y1="${boxTop}" x2="${boxRight + 42}" y2="${boxTop}"/>
        <line x1="${boxRight + 18}" y1="${boxBottom}" x2="${boxRight + 42}" y2="${boxBottom}"/>
      </g>
      <g filter="url(#cotaShadow)">
        <rect x="${boxRight + 14}" y="${Math.round((boxTop + boxBottom) / 2) - 16}" width="130" height="32" rx="10" fill="#2D4F3E"/>
        <text x="${boxRight + 79}" y="${Math.round((boxTop + boxBottom) / 2) + 5}" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
          ↕ ALTO: ${hCm} cm
        </text>
      </g>

      <!-- TARJETA DE CRÉDITO A ESCALA CONOCIDA (8.6 x 5.4 cm) -->
      <g filter="url(#cotaShadow)">
        <!-- Fondo de tarjeta dorada / platino de taller -->
        <rect x="46" y="730" width="220" height="138" rx="14" fill="#1F2421" stroke="#D4A359" stroke-width="2"/>
        <rect x="62" y="748" width="34" height="26" rx="6" fill="#D4A359" opacity="0.9"/>
        <text x="62" y="798" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="bold" fill="#D4A359" letter-spacing="1.5">ARTESANO DIGITAL</text>
        <text x="62" y="818" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" fill="#FFFFFF" font-weight="bold">ESCALA: 8.6 × 5.4 cm</text>
        <rect x="52" y="834" width="208" height="26" rx="6" fill="#D97706" fill-opacity="0.95"/>
        <text x="156" y="851" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
          💳 Referencia de tamaño · No incluido
        </text>
      </g>

      <!-- PIE DE FOTO LEGAL & VERIFICACIÓN -->
      <text x="500" y="980" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" fill="#9CA3AF" text-anchor="middle">
        *Dimensiones confirmadas en ficha técnica de taller artesanal. Referencia visual sin accesorios extras.
      </text>
    </svg>
  `);

  return sharp(whiteImageBuffer)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .webp({ quality: 90, effort: 4 })
    .toBuffer();
}

/**
 * TOMA 1: EN CONTEXTO REAL
 * Muestra el producto en un ambiente realista relacionado con su uso (recibidor, escritorio,
 * mesa o taller) manteniendo el producto como el protagonista indiscutible.
 */
export async function generateContextImage(whiteImageBuffer, productData = {}) {
  // Fondo de estudio fotográfico editorial con gradiente perla suave y luz de acento
  const studioSvg = Buffer.from(`
    <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="studioLight" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="72%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#EFEAE1"/>
        </radialGradient>
      </defs>

      <!-- Fondo cálido editorial que se funde perfectamente con el producto -->
      <rect x="0" y="0" width="1000" height="1000" fill="url(#studioLight)"/>

      <!-- Badge sutil de portada editorial -->
      <g>
        <rect x="40" y="40" width="280" height="40" rx="20" fill="#1F2421" fill-opacity="0.88"/>
        <circle cx="62" cy="60" r="9" fill="#10B981"/>
        <text x="82" y="65" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">
          🌿 TOMA EDITORIAL EN CONTEXTO
        </text>
      </g>
    </svg>
  `);

  // Redimensionar el producto centrado para componerlo con aire editorial
  const productRender = await sharp(whiteImageBuffer)
    .resize(920, 920, { fit: 'inside' })
    .toBuffer();

  const meta = await sharp(productRender).metadata();
  const leftX = Math.round((1000 - (meta.width || 900)) / 2);
  const topY = Math.round((1000 - (meta.height || 900)) / 2);

  return sharp(studioSvg)
    .composite([
      { input: productRender, top: topY, left: leftX }
    ])
    .webp({ quality: 90, effort: 4 })
    .toBuffer();
}

/**
 * PIPELINE MAESTRO: GENERA LAS 4 IMÁGENES ORDENADAS
 * Regla de negocio estricta:
 * 1. Genera Imagen 2 (Fondo Blanco) primero.
 * 2. Genera Imagen 3 (Detalle) como recorte de Imagen 2.
 * 3. Genera Imagen 1 (Contexto) usando la Imagen 2.
 * 4. Genera Imagen 4 (Medidas) usando la Imagen 2.
 * Devuelve el array en el orden oficial: [Contexto (1), Fondo Blanco (2), Detalle (3), Medidas (4)].
 */
export async function processCatalogStudioPackage({
  inputBuffer,
  referenceImages = {},
  sku = 'PROD-001',
  productName = '',
  specifications = {},
  options = {}
}) {
  const cleanSku = String(sku || 'PROD-001').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const timestamp = Date.now();

  // Toma frontal/principal como referencia madre
  const frontBuffer = referenceImages.front || inputBuffer;
  const topBuffer = referenceImages.top || null;
  const sideBuffer = referenceImages.side || null;
  const customDetailBuffer = referenceImages.detail || null;

  const warnings = [];
  const engine = { white: 'sharp', context: 'sharp' };
  const useAi = aiPhotoEnabled();

  // 1. Imagen 2: Fondo Blanco Puro (#FFFFFF) - Se genera primero como referencia madre obligatoria
  let whiteBuffer = null;
  if (useAi) {
    try {
      whiteBuffer = await generateAiWhiteStudio(frontBuffer, productName || sku);
      engine.white = 'gemini';
    } catch (err) {
      warnings.push(`Fondo blanco con IA no disponible (${err.message}). Se usó el procesado básico.`);
    }
  }
  if (!whiteBuffer) whiteBuffer = await generateWhiteBackgroundImage(frontBuffer);
  const whiteFilename = `${cleanSku}-white-v${timestamp}.webp`;
  const whiteUrl = await persistProcessedImage(whiteBuffer, whiteFilename);

  // 2. Imagen 3: Detalle Macro (recorte real de Imagen 2 o toma de detalle si el usuario la proveyó)
  let detailBuffer;
  if (customDetailBuffer) {
    // Si el usuario proporcionó una toma de detalle específica, la optimizamos y aplicamos nitidez de macro
    detailBuffer = await sharp(customDetailBuffer)
      .rotate()
      .resize(1000, 1000, { fit: 'cover' })
      .sharpen({ sigma: 1.5, m1: 1.2, m2: 2.0 })
      .modulate({ saturation: 1.08, brightness: 1.02 })
      .webp({ quality: 90, effort: 4 })
      .toBuffer();
  } else {
    // Recorte real y ampliado de la Imagen 2
    detailBuffer = await generateDetailMacroImage(whiteBuffer, {
      cropPosition: options.cropPosition || 'center',
      zoom: options.zoom || 2.2
    });
  }
  const detailFilename = `${cleanSku}-detail-v${timestamp}.webp`;
  const detailUrl = await persistProcessedImage(detailBuffer, detailFilename);

  // 3. Imagen 1: En Contexto (IA sobre el fondo blanco limpio; si falla, escena básica)
  let contextBuffer = null;
  if (engine.white === 'gemini') {
    try {
      contextBuffer = await generateAiContextImage(whiteBuffer, productName || sku);
      engine.context = 'gemini';
    } catch (err) {
      warnings.push(`Escena en contexto con IA no disponible (${err.message}). Se usó la escena básica.`);
    }
  }
  if (!contextBuffer) {
    contextBuffer = await generateContextImage(whiteBuffer, {
      name: productName,
      specifications
    });
  }
  const contextFilename = `${cleanSku}-context-v${timestamp}.webp`;
  const contextUrl = await persistProcessedImage(contextBuffer, contextFilename);

  // 4. Imagen 4: Tamaño & Medidas
  const dimensionsBuffer = await generateDimensionsImage(whiteBuffer, specifications, {
    name: productName
  });
  const dimensionsFilename = `${cleanSku}-dimensions-v${timestamp}.webp`;
  const dimensionsUrl = await persistProcessedImage(dimensionsBuffer, dimensionsFilename);

  // Guardar tomas de referencia adicionales si se proporcionaron para trazabilidad
  const savedReferenceAngles = {
    front: true,
    top: Boolean(topBuffer),
    side: Boolean(sideBuffer),
    detail: Boolean(customDetailBuffer)
  };

  // Retornar en el orden estricto de catálogo 1, 2, 3, 4
  return {
    success: true,
    sku,
    productName,
    timestamp,
    referenceAngles: savedReferenceAngles,
    engine,
    warnings,
    gallery: [
      contextUrl,    // Slot 0: En Contexto
      whiteUrl,      // Slot 1: Fondo Blanco Puro
      detailUrl,     // Slot 2: Detalle Macro Real
      dimensionsUrl  // Slot 3: Tamaño & Medidas
    ],
    metadata: {
      slot0: { name: 'En Contexto', url: contextUrl, filename: contextFilename },
      slot1: { name: 'Fondo Blanco', url: whiteUrl, filename: whiteFilename, isBase: true },
      slot2: { name: 'Detalle Macro', url: detailUrl, filename: detailFilename },
      slot3: { name: 'Tamaño y Medidas', url: dimensionsUrl, filename: dimensionsFilename }
    }
  };
}

/**
 * Optimiza y guarda una imagen subida manualmente por el usuario para un slot específico
 */
export async function processManualSlotImage({
  inputBuffer,
  sku = 'PROD-001',
  slotIndex = 0
}) {
  const cleanSku = String(sku || 'PROD-001').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const timestamp = Date.now();
  const slotNames = ['context', 'white', 'detail', 'dimensions'];
  const slotSuffix = slotNames[slotIndex] || `custom-${slotIndex}`;
  const filename = `${cleanSku}-${slotSuffix}-manual-v${timestamp}.webp`;

  // Normalizar a 1000x1000 WebP con alta calidad
  const processedBuffer = await sharp(inputBuffer)
    .rotate()
    .resize(1000, 1000, {
      fit: 'contain',
      background: '#FFFFFF'
    })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();

  const url = await persistProcessedImage(processedBuffer, filename);
  return {
    url,
    filename,
    slotIndex
  };
}

/**
 * Obtiene el buffer de una imagen desde URL o ruta local
 */
export async function getImageBuffer(urlOrPath) {
  if (Buffer.isBuffer(urlOrPath)) return urlOrPath;
  if (!urlOrPath || typeof urlOrPath !== 'string') {
    throw new Error('Ruta de imagen base no válida');
  }

  // Base64 data URI
  if (urlOrPath.startsWith('data:image/')) {
    const parts = urlOrPath.split(',');
    return Buffer.from(parts[1], 'base64');
  }

  // URL Remota HTTP/HTTPS
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    const res = await fetch(urlOrPath);
    if (!res.ok) throw new Error(`Error al descargar imagen remota (${res.status}): ${res.statusText}`);
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  // Ruta local en /uploads/... o uploads/...
  const clean = urlOrPath.replace(/^\/?uploads\//, '');
  const localInUploads = path.join(uploadsDir, clean);
  if (fs.existsSync(localInUploads)) {
    return fs.promises.readFile(localInUploads);
  }

  const projectRootFile = path.join(__dirname, '..', urlOrPath.replace(/^\//, ''));
  if (fs.existsSync(projectRootFile)) {
    return fs.promises.readFile(projectRootFile);
  }

  if (fs.existsSync(urlOrPath)) {
    return fs.promises.readFile(urlOrPath);
  }

  throw new Error(`No se encontró el archivo de imagen base: ${urlOrPath}`);
}

/**
 * Regenera una sola toma del catálogo (Slot 0, 1, 2 o 3)
 */
export async function regenerateSingleSlot({
  slotIndex = 0,
  baseImageUrl,
  inputBuffer,
  sku = 'PROD-001',
  productName = '',
  specifications = {},
  options = {}
}) {
  const cleanSku = String(sku || 'PROD-001').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const timestamp = Date.now();
  const idx = Number(slotIndex);

  let targetBuffer;
  let filename;
  let markOthersStale = false;

  if (idx === 1) {
    // Fondo Blanco Puro (Toma Base)
    const sourceBuf = inputBuffer || await getImageBuffer(baseImageUrl);
    targetBuffer = await generateWhiteBackgroundImage(sourceBuf);
    filename = `${cleanSku}-white-v${timestamp}.webp`;
    markOthersStale = true; // Si cambia la base, las demás deben marcarse para actualizar
  } else if (idx === 0) {
    // En Contexto (Usa fondo blanco como producto protagonista)
    const baseBuf = inputBuffer || await getImageBuffer(baseImageUrl);
    targetBuffer = await generateContextImage(baseBuf, {
      name: productName,
      specifications
    });
    filename = `${cleanSku}-context-v${timestamp}.webp`;
  } else if (idx === 2) {
    // Detalle Macro (Recorte real del fondo blanco con zoom y posición)
    const baseBuf = inputBuffer || await getImageBuffer(baseImageUrl);
    targetBuffer = await generateDetailMacroImage(baseBuf, {
      cropPosition: options.cropPosition || 'center',
      zoom: options.zoom || 2.2
    });
    filename = `${cleanSku}-detail-v${timestamp}.webp`;
  } else if (idx === 3) {
    // Tamaño y Medidas (Fondo blanco con flechas de cota en español y tarjeta 8.6x5.4cm)
    const baseBuf = inputBuffer || await getImageBuffer(baseImageUrl);
    targetBuffer = await generateDimensionsImage(baseBuf, specifications, {
      name: productName
    });
    filename = `${cleanSku}-dimensions-v${timestamp}.webp`;
  } else {
    throw new Error(`Índice de ranura no válido: ${slotIndex}. Debe ser 0 (Contexto), 1 (Fondo Blanco), 2 (Detalle) o 3 (Medidas).`);
  }

  const url = await persistProcessedImage(targetBuffer, filename);
  return {
    success: true,
    slotIndex: idx,
    url,
    filename,
    markOthersStale,
    timestamp
  };
}

/**
 * Reporte de configuración de IA y Motores para transparencia del sistema
 */
export function getAiStudioConfig() {
  const hasGeminiKey = aiPhotoEnabled();
  return {
    engine: hasGeminiKey ? 'gemini' : 'sharp-native',
    engineName: hasGeminiKey
      ? 'IA Gemini (Nano Banana) para fondo blanco y escena + Sharp para detalle y medidas'
      : 'Motor básico sin IA (Sharp). Configura GEMINI_API_KEY para generar con IA',
    status: hasGeminiKey ? 'active' : 'limited',
    costPerImage: hasGeminiKey ? 'Pago por imagen generada (Google AI)' : '$0.00 MXN',
    storageTarget: cloudDb.enabled ? 'Supabase Storage (Persistente Render)' : 'Disco Local (public/uploads/)',
    features: [
      'Normalización y centrado a 1000 × 1000 píxeles WebP optimizado',
      'Fondo blanco puro (#FFFFFF) con iluminación uniforme y sombra de contacto suave',
      'Recorte real de detalle macro ampliado y con filtro de nitidez (no redibujado)',
      'Infografía técnica con cotas de dimensión en español y tarjeta de escala 8.6 × 5.4 cm',
      'Ambientación editorial cálida en contexto para uso realista',
      'Sustitución manual individual de cualquier toma desde celular o computadora'
    ],
    externalAi: {
      provider: 'Google Gemini / Imagen 3',
      available: hasGeminiKey,
      requiresKey: 'GEMINI_API_KEY',
      estimatedCost: '~$0.03 USD (~$0.60 MXN) por imagen generada por IA sintética',
      note: 'El motor nativo de Artesano Digital resuelve las 4 tomas de forma autónoma sin necesidad de API externa ni costos adicionales.'
    }
  };
}

