import React from 'react';

/**
 * ImageOptimized – Renderiza una imagen usando <picture> para servir WebP
 * cuando el navegador lo soporta, y fallar al formato original (jpg/png).
 * Recibe los mismos props que un <img> estándar.
 */
export default function ImageOptimized({ src, alt = '', ...rest }) {
  // Construye la ruta .webp reemplazando la extensión actual
  const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      {/* El fallback usa la ruta original */}
      <img src={src} alt={alt} {...rest} />
    </picture>
  );
}
