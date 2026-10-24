// Utilería centralizada de colores para Artesano Digital
// Mapea nombres de colores, filamentos y combinaciones a estilos CSS reales con bordes y efectos

const COLOR_MAP = [
  // 1. Verdes
  { keys: ['verde bosque profundo', 'bosque profundo', 'verde oscuro', 'verde taller'], name: 'Verde Bosque Profundo', css: '#162B1D', border: '#0E1B12', isDark: true },
  { keys: ['verde táctico', 'verde militar oscuro', 'olivo oscuro'], name: 'Verde Olivo Táctico', css: '#2F3821', border: '#1E2415', isDark: true },
  { keys: ['verde olivo', 'olivo', 'verde artesano'], name: 'Verde Olivo', css: '#556B2F', border: '#3E4F22', isDark: true },
  { keys: ['verde salvia', 'salvia'], name: 'Verde Salvia', css: '#8A9A86', border: '#6E7E6A' },
  { keys: ['verde bosque', 'bosque'], name: 'Verde Bosque', css: '#2D4F3E', border: '#1F382C', isDark: true },
  { keys: ['verde jade', 'jade'], name: 'Verde Jade', css: '#00A86B', border: '#007A4D' },
  { keys: ['verde menta', 'menta'], name: 'Verde Menta', css: '#A7F3D0', border: '#6EE7B7' },
  { keys: ['verde militar'], name: 'Verde Militar', css: '#4B5320', border: '#373D17', isDark: true },
  { keys: ['verde'], name: 'Verde', css: '#10B981', border: '#059669' },

  // 2. Blancos y Cremas
  { keys: ['blanco marfil', 'marfil'], name: 'Blanco Marfil', css: '#FDFBF7', border: '#D6D3CD', isLight: true },
  { keys: ['blanco nórdico', 'blanco tiza', 'blanco puro', 'blanco ártico', 'blanco'], name: 'Blanco Puro', css: '#FFFFFF', border: '#D1D5DB', isLight: true },
  { keys: ['blanco hueso', 'hueso'], name: 'Blanco Hueso', css: '#F5F5DC', border: '#DCDCC0', isLight: true },
  { keys: ['crema', 'arena', 'beige'], name: 'Arena / Crema', css: '#E8D8C8', border: '#D2BEAC', isLight: true },
  { keys: ['blanco nácar', 'nácar', 'perla'], name: 'Blanco Nácar', css: '#F0EFEA', border: '#D8D6CE', isLight: true },

  // 3. Gama Oscura Especializada (Negros, Grafitos, Medianoche y Profundos)
  { keys: ['negro ónix', 'negro onix', 'ónix', 'onix', 'azabache', 'negro mate'], name: 'Negro Ónix Mate', css: '#111215', border: '#050507', isDark: true },
  { keys: ['negro carbón', 'carbón', 'carbon', 'negro total', 'negro intenso', 'negro barber', 'negro'], name: 'Negro Carbón', css: '#1C1917', border: '#0C0A09', isDark: true },
  { keys: ['grafito ahumado', 'ahumado', 'grafito mate', 'grafito carbón', 'grafito antracita', 'antracita', 'grafito'], name: 'Grafito Ahumado', css: '#2D3139', border: '#1C1E23', isDark: true },
  { keys: ['gris plomo', 'plomo', 'gris titán', 'titanio oscuro', 'acero oscuro'], name: 'Gris Plomo Titán', css: '#334155', border: '#1E293B', isDark: true },
  { keys: ['azul medianoche', 'medianoche', 'azul marino profundo', 'noche profunda', 'azul noche'], name: 'Azul Marino Medianoche', css: '#0C192E', border: '#060D18', isDark: true },
  { keys: ['azul petróleo', 'azul petroleo', 'petróleo', 'petroleo', 'azul acero'], name: 'Azul Petróleo Oscuro', css: '#152934', border: '#0C1920', isDark: true },
  { keys: ['vino tinto', 'vino', 'borgoña', 'borgoña imperial', 'burgundy', 'granate'], name: 'Vino Tinto Borgoña', css: '#4A0E17', border: '#2E080E', isDark: true },
  { keys: ['café cacao', 'chocolate espresso', 'cacao', 'espresso', 'café oscuro', 'cafe oscuro', 'café profundo', 'cafe profundo'], name: 'Chocolate Espresso', css: '#2B1810', border: '#190E09', isDark: true },
  { keys: ['morado medianoche', 'morado oscuro', 'púrpura nocturno', 'purpura nocturno', 'purpura oscuro', 'berenjena'], name: 'Morado Medianoche', css: '#261131', border: '#15091C', isDark: true },

  // 4. Terracotas y Cálidos
  { keys: ['terracota', 'ladrillo', 'arcilla'], name: 'Terracota', css: '#C2593F', border: '#9E472A' },
  { keys: ['naranja', 'coral'], name: 'Naranja Cálido', css: '#F97316', border: '#EA580C' },
  { keys: ['mostaza colonial', 'mostaza', 'amarillo mostaza', 'amarillo', 'cera'], name: 'Mostaza Colonial', css: '#D4A359', border: '#B8863A' },

  // 5. Maderas y Barnices Artesanales
  { keys: ['barniz natural transparente', 'barniz transparente', 'transparente cristal', 'barniz cristal', 'sellador transparente', 'acabado natural', 'barniz natural'], name: 'Barniz Natural Transparente', css: 'linear-gradient(135deg, #F5EBD7, #DCC3A0)', border: '#C4A47C', isLight: true },
  { keys: ['nogal americano', 'tinte nogal americano', 'nogal oscuro', 'nogal calido', 'nogal clásico', 'nogal'], name: 'Nogal Americano', css: '#4E3524', border: '#332014', isDark: true },
  { keys: ['verde bosque rústico', 'verde bosque rustico', 'verde rústico', 'verde rustico', 'tinte verde', 'verde vintage', 'verde teñido'], name: 'Verde Bosque Rústico', css: '#2E4A35', border: '#1D3223', isDark: true },
  { keys: ['azul colonial vintage', 'azul colonial', 'azul vintage', 'tinte azul', 'azul añejo', 'azul teñido'], name: 'Azul Colonial Vintage', css: '#2A4B63', border: '#183042', isDark: true },
  { keys: ['caoba clásico', 'caoba clasico', 'caoba', 'tinte caoba', 'caoba rojizo', 'caoba elegante'], name: 'Caoba Clásico', css: '#662418', border: '#43130B', isDark: true },
  { keys: ['roble claro nórdico', 'roble claro nordico', 'roble claro', 'roble nordico', 'pino claro', 'roble suave', 'pino nórdico'], name: 'Roble Claro Nórdico', css: '#C8A272', border: '#9B784E' },
  { keys: ['madera woodfill', 'woodfill'], name: 'Madera Woodfill', css: '#A07855', border: '#785536' },
  { keys: ['madera roble natural', 'roble natural', 'madera natural', 'madera', 'roble', 'café', 'caramelo', 'chocolate'], name: 'Madera Roble Natural', css: '#A27B5C', border: '#79583F' },

  // 6. Metalizados y Sedas
  { keys: ['oro rosado', 'rose gold'], name: 'Oro Rosado', css: 'linear-gradient(135deg, #ECC5C0, #B76E79)', border: '#B76E79' },
  { keys: ['seda oro champagne', 'oro champagne', 'oro perlado', 'dorado', 'oro'], name: 'Seda Oro Champagne', css: 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA771C)', border: '#AA771C' },
  { keys: ['seda bronce', 'bronce', 'cobre seda', 'cobre'], name: 'Seda Bronce / Cobre', css: 'linear-gradient(135deg, #CD7F32, #B87333, #8C4A1E)', border: '#8C4A1E' },
  { keys: ['plata metálico', 'plateado', 'plata', 'níquel', 'cromo', 'aluminio'], name: 'Plata Metálico', css: 'linear-gradient(135deg, #F1F5F9, #94A3B8)', border: '#64748B' },

  // 7. Texturas y Efectos
  { keys: ['mármol granulado', 'mármol', 'marmol'], name: 'Mármol Granulado', css: 'radial-gradient(circle, #F3F4F6 30%, #9CA3AF 31%, #F3F4F6 70%)', border: '#9CA3AF' },
  { keys: ['glow neón', 'glow', 'fotoluminiscente'], name: 'Glow Neón', css: '#6EE7B7', border: '#34D399', glow: true },
  { keys: ['glitter diamantado', 'glitter'], name: 'Glitter Diamantado', css: 'linear-gradient(135deg, #FDE68A, #F59E0B, #FEF08A)', border: '#D97706' },
  { keys: ['translúcido cristal', 'translúcido', 'transparente', 'cristal'], name: 'Translúcido Cristal', css: 'rgba(224, 242, 254, 0.75)', border: '#93C5FD' },

  // 8. Grises
  { keys: ['gris perla', 'gris espacial', 'gris ceniza', 'gris jaspe', 'gris concreto', 'concreto', 'gris', 'humo'], name: 'Gris Perla', css: '#6B7280', border: '#4B5563' },

  // 9. Azules
  { keys: ['azul cobalto', 'azul zafiro', 'zafiro'], name: 'Azul Zafiro', css: '#2563EB', border: '#1D4ED8' },
  { keys: ['azul marino'], name: 'Azul Marino', css: '#1E3A8A', border: '#172554', isDark: true },
  { keys: ['azul cielo', 'azul pastel'], name: 'Azul Cielo', css: '#93C5FD', border: '#60A5FA', isLight: true },
  { keys: ['azul'], name: 'Azul', css: '#3B82F6', border: '#1D4ED8' },

  // 10. Rojos y Rosas
  { keys: ['rojo carmesí', 'rojo escarlata', 'rojo'], name: 'Rojo Carmesí', css: '#DC2626', border: '#991B1B' },
  { keys: ['rosa pastel', 'rosa pálido', 'rosa'], name: 'Rosa Pastel', css: '#F472B6', border: '#DB2777', isLight: true },
  { keys: ['magenta neón', 'magenta vibrante', 'magenta', 'fucsia'], name: 'Magenta Vibrante', css: '#EC4899', border: '#BE185D' },
  { keys: ['lavanda', 'morado', 'violeta', 'púrpura', 'lila'], name: 'Lavanda / Violeta', css: '#A78BFA', border: '#7C3AED' },

  // 11. Especiales / Multicolor / Otro a convenir
  { keys: ['otro color', 'a convenir', 'personalizad', 'abierto'], name: 'Otro a convenir', css: 'conic-gradient(from 180deg at 50% 50%, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899, #EF4444)', border: '#8B5CF6', isMulti: true },
  { keys: ['tornasol', 'arcoíris', 'holográfico'], name: 'Tornasol Arcoíris', css: 'linear-gradient(135deg, #EC4899, #8B5CF6, #3B82F6, #10B981)', border: '#8B5CF6', isMulti: true }
];

/**
 * Resuelve una cadena o clave de color a su representación visual CSS
 */
export function getFilamentColor(rawInput = '') {
  if (!rawInput) return null;
  const inputStr = typeof rawInput === 'string'
    ? rawInput.trim()
    : (rawInput.color || rawInput.name || '').trim();

  if (!inputStr) return null;
  const lower = inputStr.toLowerCase();

  // 1. Detección de opción abierta o arcoíris
  if (lower.includes('otro color') || lower.includes('a convenir') || lower.includes('personalizad')) {
    return {
      name: 'Otro a convenir',
      css: 'conic-gradient(from 180deg at 50% 50%, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899, #EF4444)',
      border: '#8B5CF6',
      isMulti: true
    };
  }

  // 2. Detección de combinaciones bicolores (ej. "Verde Olivo & Blanco", "Blanco sobre Negro", "Negro con Frente Blanco")
  const splitKeywords = [' & ', ' y ', ' sobre ', ' con ', ' / '];
  for (const sep of splitKeywords) {
    if (lower.includes(sep)) {
      const parts = inputStr.split(new RegExp(sep, 'i')).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const c1 = findDirectColor(parts[0]);
        const c2 = findDirectColor(parts[1]);
        if (c1 && c2) {
          const bg1 = c1.css.startsWith('linear') ? '#556B2F' : c1.css;
          const bg2 = c2.css.startsWith('linear') ? '#D4AF37' : c2.css;
          return {
            name: `${c1.name} + ${c2.name}`,
            css: `linear-gradient(135deg, ${bg1} 50%, ${bg2} 50%)`,
            border: c1.border || '#4B5563',
            isDual: true
          };
        }
      }
    }
  }

  // 3. Búsqueda directa individual
  return findDirectColor(inputStr);
}

function findDirectColor(str) {
  const lower = str.toLowerCase();
  for (const item of COLOR_MAP) {
    for (const key of item.keys) {
      if (lower.includes(key)) {
        return item;
      }
    }
  }
  // Color neutro estilizado si no coincide exactamente
  return {
    name: str,
    css: '#E2E8F0',
    border: '#CBD5E1'
  };
}

/**
 * Extrae la lista de colores configurados en las variantes de un producto
 */
export function getProductColorOptions(product) {
  if (!product || !Array.isArray(product.variants)) return [];
  const colorVar = product.variants.find(v => {
    const n = (v.name || '').toLowerCase();
    return n.includes('color') || n.includes('acento') || n.includes('tono');
  });
  return colorVar?.options || [];
}

/**
 * Determina si un objeto de color o cadena CSS corresponde a un tono oscuro
 * que requiere tipografía o icono contrastante blanco.
 */
export function isDarkColor(swatchOrCss) {
  if (!swatchOrCss) return false;
  if (typeof swatchOrCss === 'object' && swatchOrCss.isDark !== undefined) {
    return Boolean(swatchOrCss.isDark);
  }
  const css = typeof swatchOrCss === 'string' ? swatchOrCss : (swatchOrCss.css || '');
  if (!css.startsWith('#')) return false;
  const hex = css.replace('#', '');
  if (hex.length < 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Fórmula estándar de luminancia perceptual
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}

/**
 * Catálogo de colores oscuros destacados de taller para personalizaciones premium
 */
export const DARK_COLOR_PRESETS = [
  'Negro Ónix Mate',
  'Negro Carbón',
  'Grafito Ahumado',
  'Gris Plomo Titán',
  'Azul Marino Medianoche',
  'Azul Petróleo Oscuro',
  'Verde Bosque Profundo',
  'Verde Olivo Táctico',
  'Vino Tinto Borgoña',
  'Chocolate Espresso',
  'Morado Medianoche'
];

/**
 * Catálogo ampliado de paletas de taller clasificadas por gama cromática
 * Ofrece más de 30 variedades reales para personalización (oscuros, maderas, botánicos y claros)
 */
export const WORKSHOP_COLOR_PALETTES = [
  {
    id: 'oscuros',
    label: 'Oscuros & Medianoche',
    shortLabel: 'Oscuros (11)',
    colors: [
      'Negro Ónix Mate',
      'Negro Carbón',
      'Grafito Ahumado',
      'Gris Plomo Titán',
      'Azul Marino Medianoche',
      'Azul Petróleo Oscuro',
      'Verde Bosque Profundo',
      'Verde Olivo Táctico',
      'Vino Tinto Borgoña',
      'Chocolate Espresso',
      'Morado Medianoche'
    ]
  },
  {
    id: 'barnices_madera',
    label: 'Tintes & Barnices para Madera (Láser y Carpintería)',
    shortLabel: 'Barnices y Tintes (6)',
    colors: [
      'Barniz Natural Transparente',
      'Nogal Americano',
      'Verde Bosque Rústico',
      'Azul Colonial Vintage',
      'Caoba Clásico',
      'Roble Claro Nórdico'
    ]
  },
  {
    id: 'maderas_metales',
    label: 'Maderas Nobles & Sedas Metálicas',
    shortLabel: 'Maderas & Sedas (6)',
    colors: [
      'Madera Roble Natural',
      'Madera Woodfill',
      'Seda Oro Champagne',
      'Seda Bronce / Cobre',
      'Plata Metálico',
      'Oro Rosado'
    ]
  },
  {
    id: 'botanicos_tierra',
    label: 'Botánicos & Tierra',
    shortLabel: 'Botánicos & Tierra (8)',
    colors: [
      'Verde Olivo',
      'Verde Jade',
      'Terracota',
      'Mostaza Colonial',
      'Naranja Cálido',
      'Rojo Carmesí',
      'Azul Zafiro',
      'Magenta Vibrante'
    ]
  },
  {
    id: 'claros_pasteles',
    label: 'Claros & Pasteles',
    shortLabel: 'Claros & Pasteles (8)',
    colors: [
      'Verde Salvia',
      'Verde Menta',
      'Arena / Crema',
      'Azul Cielo',
      'Lavanda / Violeta',
      'Rosa Pastel',
      'Blanco Marfil',
      'Blanco Puro'
    ]
  }
];

export const ALL_WORKSHOP_COLORS = WORKSHOP_COLOR_PALETTES.flatMap(group => group.colors);


