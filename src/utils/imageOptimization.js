/**
 * Devuelve un srcSet con variantes WebP ligeras para las imágenes locales.
 * Las variantes se generan con scripts/optimize_responsive_images.mjs.
 *
 * Se usa el original como src de respaldo, por lo que si una variante no
 * existe el navegador puede seguir mostrando la imagen original.
 */
export function getOptimizedSrcSet(src) {
  if (!src || typeof src !== 'string') return undefined;
  const normalized = src.trim().replace(/^\.\//, '/');
  if (/^(data:|blob:|https?:)/i.test(normalized)) return undefined;
  if (/\.svg(?:[?#]|$)/i.test(normalized)) return undefined;

  const clean = normalized.split(/[?#]/, 1)[0];
  const match = clean.match(/^(.*\/)?([^/]+)\.(jpe?g|png|webp)$/i);
  if (!match) return undefined;

  const dir = match[1] || '';
  const base = match[2];
  if (base.endsWith('-card') || base.endsWith('-medium')) return undefined;

  return [
    `${dir}${base}-card.webp 480w`,
    `${dir}${base}-medium.webp 960w`
  ].join(', ');
}

/** Tamaños sugeridos para tarjetas de producto en cuadrícula. */
export const PRODUCT_CARD_SIZES =
  '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 320px';

/** Tamaños sugeridos para banners y portadas a ancho completo. */
export const HERO_IMAGE_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px';
