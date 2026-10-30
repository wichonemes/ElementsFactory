// Áreas comerciales a las que pertenece un paquete o combo.
// Los paquetes viven solo en el área "Paquetes" del catálogo, pero conservan
// su área comercial (Hogar, Negocios o Eventos) para filtros y escaparates.
export const PACKAGE_AREAS = ['hogar', 'negocios', 'eventos'];

export function packageAreas(product) {
  if (!product) return [];
  const explicit = Array.isArray(product.bundleAreas)
    ? product.bundleAreas.filter(area => PACKAGE_AREAS.includes(area))
    : [];
  if (explicit.length > 0) return explicit;
  if (product.bundleArea && PACKAGE_AREAS.includes(product.bundleArea)) {
    return [product.bundleArea];
  }
  return (product.worlds || []).filter(area => PACKAGE_AREAS.includes(area));
}

export function packageAreaLabel(product) {
  const areas = packageAreas(product);
  if (areas.length === 0) return 'Paquete';
  return areas
    .map(area => ({ hogar: 'Hogar', negocios: 'Negocios', eventos: 'Eventos' }[area]))
    .join(' + ');
}
