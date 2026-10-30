import sharp from 'sharp';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1';

export function aiPhotoEnabled() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
}

function findLastImageData(node) {
  if (!node || typeof node !== 'object') return null;
  if (typeof node.output_image?.data === 'string') return node.output_image.data;
  let found = null;
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'image' && typeof value.data === 'string' && value.data.length > 100) found = value.data;
    for (const child of Object.values(value)) visit(child);
  };
  visit(node);
  return found;
}

async function callGemini(parts, { timeoutMs = 55000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        model: MODEL,
        input: parts,
        response_format: { type: 'image', aspect_ratio: '1:1', image_size: '1K' }
      }),
      signal: controller.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || `La IA respondió ${res.status}`);
    const base64 = findLastImageData(data);
    if (!base64) throw new Error('La IA no devolvió una imagen');
    return Buffer.from(base64, 'base64');
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('La IA tardó demasiado en responder');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const imagePart = (buffer) => ({
  type: 'image',
  mime_type: 'image/jpeg',
  data: buffer.toString('base64')
});

const WHITE_PROMPT = (name) => [
  `Professional e-commerce product photo of "${name}".`,
  'Keep this exact product unchanged: same shape, colors, materials, textures, text and proportions. Do not redraw or invent details.',
  'Remove the whole background and replace it with a seamless pure white (#FFFFFF) studio backdrop.',
  'Center the complete product, soft even studio lighting and a subtle natural contact shadow beneath it.',
  'No hands, no props, no people, no watermark, no added text. Square composition.'
].join(' ');

const CONTEXT_PROMPT = (name) => [
  `Lifestyle photo of this exact product: "${name}".`,
  'Place the product unchanged (same shape, colors and details) on a realistic, warm and tasteful surface or setting where it would naturally be used.',
  'Natural soft light, shallow depth of field, editorial style.',
  'Do not add text, logos, watermarks or people. Square composition.'
].join(' ');

async function toSquare(buffer, background) {
  return sharp(buffer)
    .rotate()
    .resize(1000, 1000, { fit: 'contain', background })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();
}

export async function generateAiWhiteStudio(inputBuffer, productName = 'producto') {
  const raw = await callGemini([
    { type: 'text', text: WHITE_PROMPT(productName) },
    imagePart(inputBuffer)
  ]);
  return toSquare(raw, { r: 255, g: 255, b: 255, alpha: 1 });
}

export async function generateAiContextImage(whiteBuffer, productName = 'producto') {
  const raw = await callGemini([
    { type: 'text', text: CONTEXT_PROMPT(productName) },
    imagePart(whiteBuffer)
  ]);
  return toSquare(raw, { r: 255, g: 255, b: 255, alpha: 1 });
}
