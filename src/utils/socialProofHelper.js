/**
 * Generador de prueba social discreta, formal y artesanal por producto.
 * Como el taller va empezando, muestra métricas creíbles y humildes:
 * - 6 a 24 piezas elaboradas (no números inflados de +100).
 * - 2 a 4 opiniones variadas (4.6 a 5.0★).
 * - Consistencia por código o SKU de cada producto.
 */

export function getProductSocialProof(product) {
  if (!product) {
    return {
      rating: '4.8',
      numericRating: 4.8,
      reviewCount: 3,
      craftedCount: 14,
      craftedLabel: '+14 hechos en taller',
      shortCraftedLabel: '+14 hechos'
    };
  }

  const idStr = String(product.code || product.sku || product.id || 'P1').toUpperCase();
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Calificación sutil y variada (4.6 a 5.0)
  const ratings = [4.8, 4.9, 4.7, 5.0, 4.8, 4.9, 4.6, 4.8, 4.9, 4.7];
  const numericRating = ratings[posHash % ratings.length];

  // Cantidad de piezas elaboradas humilde para taller en crecimiento: entre 6 y 22 piezas
  const craftedCount = 6 + (posHash % 17); // 6 a 22 piezas
  const shortCraftedLabel = `+${craftedCount} hechos`;
  const craftedLabel = `+${craftedCount} elaborados en taller`;

  // Cantidad de opiniones: 2, 3 o 4 opiniones
  const reviewCount = 2 + (posHash % 3);

  return {
    rating: numericRating.toFixed(1),
    numericRating,
    reviewCount,
    craftedCount,
    craftedLabel,
    shortCraftedLabel
  };
}
