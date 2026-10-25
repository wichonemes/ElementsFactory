// Utilería centralizada de colores para Artesano Digital
// Mapea nombres de colores, filamentos, barnices, telas, viniles y combinaciones a estilos CSS reales con bordes y efectos

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
  { keys: ['verde esmeralda'], name: 'Verde Esmeralda', css: '#059669', border: '#047857' },
  { keys: ['verde'], name: 'Verde', css: '#10B981', border: '#059669' },

  // 2. Blancos y Cremas
  { keys: ['blanco marfil', 'marfil'], name: 'Blanco Marfil', css: '#FDFBF7', border: '#D6D3CD', isLight: true },
  { keys: ['blanco nórdico', 'blanco tiza', 'blanco puro', 'blanco ártico', 'blanco óptico', 'blanco nieve', 'blanco', 'blancas', 'blancos'], name: 'Blanco Puro', css: '#FFFFFF', border: '#D1D5DB', isLight: true },
  { keys: ['blanco hueso', 'hueso'], name: 'Blanco Hueso', css: '#F5F5DC', border: '#DCDCC0', isLight: true },
  { keys: ['crema', 'arena', 'beige', 'cremas'], name: 'Arena / Crema', css: '#E8D8C8', border: '#D2BEAC', isLight: true },
  { keys: ['blanco nácar', 'nácar', 'perla'], name: 'Blanco Nácar', css: '#F0EFEA', border: '#D8D6CE', isLight: true },
  { keys: ['manta cruda', 'manta algodón', 'manta de algodón', 'manta'], name: 'Manta Cruda 100% Algodón', css: '#F5EBE1', border: '#D6C8BC', isLight: true },

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
  { keys: ['wengué', 'wengue', 'ébano', 'ebano', 'madera negra'], name: 'Tinte Wengué / Ébano', css: '#1A110B', border: '#0A0604', isDark: true },

  // 4. Terracotas y Cálidos
  { keys: ['terracota', 'ladrillo', 'arcilla'], name: 'Terracota', css: '#C2593F', border: '#9E472A' },
  { keys: ['naranja', 'coral'], name: 'Naranja Cálido', css: '#F97316', border: '#EA580C' },
  { keys: ['mostaza colonial', 'mostaza', 'amarillo mostaza', 'amarillo', 'cera'], name: 'Mostaza Colonial', css: '#D4A359', border: '#B8863A' },

  // 5. Maderas, Barnices & Tintes Artesanales
  { keys: ['barniz natural transparente', 'barniz transparente', 'transparente cristal', 'barniz cristal', 'sellador transparente', 'acabado natural', 'barniz natural'], name: 'Barniz Natural Transparente', css: 'linear-gradient(135deg, #F5EBD7, #DCC3A0)', border: '#C4A47C', isLight: true },
  { keys: ['barniz mate hidrófugo', 'barniz mate', 'sellador mate'], name: 'Barniz Mate Hidrófugo', css: 'linear-gradient(135deg, #E6D7C3, #C8B295)', border: '#A89275' },
  { keys: ['barniz brillante polylack', 'barniz brillante', 'polylack'], name: 'Barniz Brillante PolyLack', css: 'linear-gradient(135deg, #FFFFFF 15%, #EAD7BA 65%, #C6A778 100%)', border: '#C4A47C' },
  { keys: ['cera de abeja natural', 'cera de abeja', 'cera natural'], name: 'Cera de Abeja Natural', css: '#F4E0A5', border: '#D4B86A' },
  { keys: ['nogal americano', 'tinte nogal americano', 'nogal oscuro', 'nogal calido', 'nogal clásico', 'nogal'], name: 'Nogal Americano', css: '#4E3524', border: '#332014', isDark: true },
  { keys: ['verde bosque rústico', 'verde bosque rustico', 'verde rústico', 'verde rustico', 'tinte verde', 'verde vintage', 'verde teñido'], name: 'Verde Bosque Rústico', css: '#2E4A35', border: '#1D3223', isDark: true },
  { keys: ['azul colonial vintage', 'azul colonial', 'azul vintage', 'tinte azul', 'azul añejo', 'azul teñido'], name: 'Azul Colonial Vintage', css: '#2A4B63', border: '#183042', isDark: true },
  { keys: ['caoba clásico', 'caoba clasico', 'caoba', 'tinte caoba', 'caoba rojizo', 'caoba elegante'], name: 'Caoba Clásico', css: '#662418', border: '#43130B', isDark: true },
  { keys: ['roble claro nórdico', 'roble claro nordico', 'roble claro', 'roble nordico', 'roble suave', 'pino nórdico'], name: 'Roble Claro Nórdico', css: '#C8A272', border: '#9B784E' },
  { keys: ['pino rústico', 'pino rustico', 'pino natural', 'pino selecto', 'pino'], name: 'Pino Rústico Natural', css: '#D8B17A', border: '#B8905A' },
  { keys: ['madera woodfill', 'woodfill'], name: 'Madera Woodfill', css: '#A07855', border: '#785536' },
  { keys: ['madera roble natural', 'roble natural', 'madera natural', 'madera', 'roble', 'café', 'caramelo', 'chocolate'], name: 'Madera Roble Natural', css: '#A27B5C', border: '#79583F' },

  // 6. Metalizados y Sedas
  { keys: ['oro rosado', 'rose gold'], name: 'Oro Rosado', css: 'linear-gradient(135deg, #ECC5C0, #B76E79)', border: '#B76E79' },
  { keys: ['seda oro champagne', 'oro champagne', 'oro perlado', 'dorado metálico', 'dorado metalico', 'dorado', 'oro'], name: 'Seda Oro Champagne', css: 'linear-gradient(135deg, #F3E5AB, #D4AF37, #AA771C)', border: '#AA771C' },
  { keys: ['seda bronce', 'bronce', 'cobre seda', 'cobre'], name: 'Seda Bronce / Cobre', css: 'linear-gradient(135deg, #CD7F32, #B87333, #8C4A1E)', border: '#8C4A1E' },
  { keys: ['plata metálico', 'plateado cromo', 'plateado', 'plata', 'níquel', 'cromo', 'aluminio'], name: 'Plata Metálico', css: 'linear-gradient(135deg, #F1F5F9, #94A3B8)', border: '#64748B' },

  // 7. Texturas y Efectos Especiales
  { keys: ['mármol granulado', 'mármol', 'marmol'], name: 'Mármol Granulado', css: 'radial-gradient(circle, #F3F4F6 30%, #9CA3AF 31%, #F3F4F6 70%)', border: '#9CA3AF' },
  { keys: ['glow neón', 'glow neon', 'glow', 'fotoluminiscente', 'brilla en la oscuridad'], name: 'Glow Neón', css: '#6EE7B7', border: '#34D399', glow: true },
  { keys: ['glitter diamantado', 'glitter'], name: 'Glitter Diamantado', css: 'linear-gradient(135deg, #FDE68A, #F59E0B, #FEF08A)', border: '#D97706' },
  { keys: ['translúcido cristal', 'translúcido', 'translucido', 'transparente', 'cristal'], name: 'Translúcido Cristal', css: 'rgba(224, 242, 254, 0.75)', border: '#93C5FD' },

  // 8. Grises y Mezclilla
  { keys: ['gris perla', 'gris espacial', 'gris ceniza', 'gris jaspe', 'gris concreto', 'concreto', 'gris', 'humo'], name: 'Gris Perla', css: '#6B7280', border: '#4B5563' },
  { keys: ['mezclilla azul', 'mezclilla', 'denim'], name: 'Mezclilla Azul', css: '#2B4C7E', border: '#1B3459', isDark: true },

  // 9. Azules
  { keys: ['azul cobalto', 'azul zafiro', 'zafiro', 'azul eléctrico', 'azul electrico'], name: 'Azul Zafiro / Eléctrico', css: '#2563EB', border: '#1D4ED8' },
  { keys: ['azul marino'], name: 'Azul Marino', css: '#1E3A8A', border: '#172554', isDark: true },
  { keys: ['azul cielo', 'azul pastel'], name: 'Azul Cielo', css: '#93C5FD', border: '#60A5FA', isLight: true },
  { keys: ['azul'], name: 'Azul', css: '#3B82F6', border: '#1D4ED8' },

  // 10. Rojos y Rosas
  { keys: ['rojo carmesí', 'rojo carmesi', 'rojo escarlata', 'rojo carmín', 'rojo carmin', 'rojo'], name: 'Rojo Carmesí', css: '#DC2626', border: '#991B1B' },
  { keys: ['rosa palo empolvado', 'rosa palo', 'palo de rosa', 'rosa empolvado'], name: 'Rosa Palo Empolvado', css: '#E8B4B8', border: '#C79397' },
  { keys: ['rosa pastel', 'rosa pálido', 'rosa'], name: 'Rosa Pastel', css: '#F472B6', border: '#DB2777', isLight: true },
  { keys: ['magenta neón', 'magenta vibrante', 'magenta', 'fucsia'], name: 'Magenta Vibrante', css: '#EC4899', border: '#BE185D' },
  { keys: ['lavanda', 'morado', 'violeta', 'púrpura', 'lila'], name: 'Lavanda / Violeta', css: '#A78BFA', border: '#7C3AED' },

  // 11. Acrílicos Cast Especiales
  { keys: ['acrílico negro', 'acrilico negro'], name: 'Acrílico Negro Ónix', css: '#0F0F11', border: '#000000', isDark: true },
  { keys: ['acrílico rojo', 'acrilico rojo'], name: 'Acrílico Rojo Translúcido', css: 'rgba(220, 38, 38, 0.85)', border: '#B91C1C' },
  { keys: ['acrílico azul', 'acrilico azul'], name: 'Acrílico Azul Eléctrico', css: 'rgba(37, 99, 235, 0.85)', border: '#1D4ED8' },
  { keys: ['acrílico verde', 'acrilico verde'], name: 'Acrílico Verde Esmeralda', css: 'rgba(16, 185, 129, 0.85)', border: '#047857' },
  { keys: ['acrílico amarillo', 'acrilico amarillo', 'amarillo neón', 'amarillo neon'], name: 'Acrílico Amarillo Neón', css: 'rgba(250, 204, 21, 0.85)', border: '#CA8A04' },
  { keys: ['acrílico espejo oro', 'espejo oro'], name: 'Acrílico Espejo Oro', css: 'linear-gradient(135deg, #FFE894, #D4AF37, #996515)', border: '#AA771C' },
  { keys: ['acrílico espejo plata', 'espejo plata'], name: 'Acrílico Espejo Plata', css: 'linear-gradient(135deg, #FFFFFF, #CBD5E1, #94A3B8)', border: '#64748B' },
  { keys: ['acrílico cristal transparente', 'acrilico cristal'], name: 'Acrílico Cristal Transparente', css: 'rgba(224, 242, 254, 0.45)', border: '#93C5FD' },
  { keys: ['acrílico blanco difusor', 'acrilico blanco'], name: 'Acrílico Blanco Difusor', css: '#F8FAFC', border: '#CBD5E1' },

  // 12. Sublimación y Bases
  { keys: ['base blanca brillante', 'base blanca', 'full color'], name: 'Base Blanca Brillante (Full Color)', css: '#FFFFFF', border: '#D1D5DB' },
  { keys: ['base plata satinado', 'plata satinado'], name: 'Base Plata Satinado Metálico', css: 'linear-gradient(135deg, #F1F5F9, #CBD5E1, #94A3B8)', border: '#64748B' },
  { keys: ['base oro satinado', 'oro satinado'], name: 'Base Oro Satinado Metálico', css: 'linear-gradient(135deg, #FEF3C7, #FDE68A, #D4AF37)', border: '#B45309' },
  { keys: ['taza cerámica', 'taza con interior', 'taza borde'], name: 'Taza Borde de Color', css: 'radial-gradient(circle, #FFFFFF 55%, #1F2421 56%)', border: '#4B5563' },

  // 13. Vinil Rotulación & Textil
  { keys: ['puff 3d', 'vinil puff'], name: 'Vinil Puff 3D en Relieve', css: 'linear-gradient(135deg, #374151, #111827)', border: '#030712', isDark: true },
  { keys: ['oro foil', 'foil'], name: 'Vinil Textil Oro Foil', css: 'linear-gradient(135deg, #FFF7ED, #FBBF24, #B45309)', border: '#92400E' },
  { keys: ['vinil rotulación', 'oracal'], name: 'Vinil Rotulación Oracal', css: '#111827', border: '#030712', isDark: true },

  // 14. Especiales / Multicolor / Otro a convenir
  { keys: ['otro color', 'otro acabado', 'a convenir', 'personalizad', 'abierto'], name: 'Otro a convenir', css: 'conic-gradient(from 180deg at 50% 50%, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899, #EF4444)', border: '#8B5CF6', isMulti: true },
  { keys: ['tornasol', 'arcoíris', 'arcoiris', 'holográfico', 'holografico'], name: 'Tornasol Arcoíris', css: 'linear-gradient(135deg, #EC4899, #8B5CF6, #3B82F6, #10B981)', border: '#8B5CF6', isMulti: true }
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
  if (lower.includes('otro color') || lower.includes('otro acabado') || lower.includes('a convenir') || lower.includes('personalizad')) {
    return {
      name: 'Otro a convenir',
      css: 'conic-gradient(from 180deg at 50% 50%, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6, #EC4899, #EF4444)',
      border: '#8B5CF6',
      isMulti: true
    };
  }

  // 2. Detección de combinaciones bicolores (ej. "Verde olivo con letras crema", "Gris carbón con letras blancas", "Blanco sobre Negro")
  const splitKeywords = [' & ', ' y ', ' sobre ', ' con ', ' / '];
  for (const sep of splitKeywords) {
    if (lower.includes(sep)) {
      const parts = inputStr.split(new RegExp(sep, 'i')).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        // Limpiar prefijos comunes como "letras", "texto", "frente", "base", "marco"
        const cleanPart0 = parts[0].replace(/^(letras|texto|fondo|base|marco|frente)\s+/i, '');
        const cleanPart1 = parts[1].replace(/^(letras|texto|fondo|base|marco|frente)\s+/i, '');
        const c1 = findDirectColor(cleanPart0);
        const c2 = findDirectColor(cleanPart1);
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
 * Determina si una variante del producto corresponde a selección de color o acabado
 */
export function checkIfColorVariant(variant) {
  if (!variant) return false;
  const name = (variant.name || '').toLowerCase();
  if (/color|acento|tono|combinaci|barniz|acabado|gama/i.test(name)) return true;
  
  // Detección por el contenido de sus opciones
  const colorKeywords = [
    'negro', 'blanco', 'verde', 'azul', 'rojo', 'rosa', 'gris', 'nogal',
    'caoba', 'pino', 'roble', 'barniz', 'seda', 'dorado', 'plata', 'oro',
    'terracota', 'mostaza', 'olivo', 'crema', 'arena', 'marmol', 'mármol',
    'grafito', 'glow', 'translúcido', 'cera', 'manta', 'wengué', 'ébano'
  ];
  const matched = (variant.options || []).filter(opt => {
    const l = (opt || '').toLowerCase();
    return colorKeywords.some(k => l.includes(k));
  });
  return matched.length >= 2;
}

/**
 * Extrae la lista de colores configurados en las variantes de un producto
 */
export function getProductColorOptions(product) {
  if (!product || !Array.isArray(product.variants)) return [];
  const colorVar = product.variants.find(v => checkIfColorVariant(v));
  return colorVar?.options || [];
}

/**
 * Determina si un objeto de color o cadena CSS corresponde a un tono oscuro
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
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}

/**
 * Catálogo de colores oscuros destacados de taller
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
 * PALETAS DE TALLER CLASIFICADAS POR MATERIAL Y TÉCNICA
 * Homologadas para desplegar en las pestañas contextuales del producto
 */
export const WORKSHOP_PALETTES_BY_CATEGORY = {
  wood: {
    id: 'wood',
    label: 'Barnices Madera',
    title: 'Tintes & Barnices para Madera (Láser y Carpintería)',
    techniqueName: 'Corte Láser & Carpintería',
    badge: 'Madera & Tableros',
    note: 'Acabados aplicados a mano en taller con ceras orgánicas, tintes al aceite y selladores hidrófugos de alta durabilidad.',
    colors: [
      { name: 'Barniz Natural Transparente', desc: 'Sella y protege respetando el tono y veta natural', tag: 'Natural' },
      { name: 'Barniz Mate Hidrófugo', desc: 'Acabado sedoso antirreflejos repelente a humedad', tag: 'Mate' },
      { name: 'Barniz Brillante PolyLack', desc: 'Brillo cristal tipo automotriz de alta resistencia', tag: 'Brillante' },
      { name: 'Tinte Nogal Americano', desc: 'Tono obscuro elegante que resalta la veta profunda', tag: 'Madera noble' },
      { name: 'Tinte Caoba Clásico', desc: 'Rojizo tradicional cálido con gran personalidad', tag: 'Rojizo' },
      { name: 'Tinte Roble Claro Nórdico', desc: 'Estilo escandinavo suave, luminoso y moderno', tag: 'Nórdico' },
      { name: 'Tinte Wengué / Ébano Oscuro', desc: 'Casi negro carbón con vetas café profundas', tag: 'Oscuro' },
      { name: 'Tinte Verde Bosque Rústico', desc: 'Tono botánico artesanal envejecido al aceite', tag: 'Vintage' },
      { name: 'Tinte Azul Colonial Vintage', desc: 'Azul añejo rústico estilo hacienda mexicana', tag: 'Vintage' },
      { name: 'Cera de Abeja Natural', desc: 'Protección 100% orgánica suave y perfumada', tag: 'Ecológico' }
    ]
  },
  pla: {
    id: 'pla',
    label: 'Filamentos 3D',
    title: 'Filamentos PLA & PETG de Alta Resolución',
    techniqueName: 'Impresión 3D FDM',
    badge: 'PLA & PETG',
    note: 'Filamentos biodegradables calibrados en taller con boquillas de alta precisión (0.12 a 0.20 mm).',
    subGroups: [
      { id: 'todos', label: 'Todos' },
      { id: 'mate', label: 'Mate & Oscuros' },
      { id: 'sedas', label: 'Sedas & Metales' },
      { id: 'especiales', label: 'Especiales' },
      { id: 'claros', label: 'Claros & Pasteles' }
    ],
    colors: [
      // Mate & Oscuros
      { name: 'Negro Ónix Mate', group: 'mate', desc: 'Acabado mate profundo sin brillos plásticos', tag: 'Mate' },
      { name: 'Blanco Marfil', group: 'mate', desc: 'Blanco suave cálido de alta cobertura', tag: 'Mate' },
      { name: 'Verde Bosque Profundo', group: 'mate', desc: 'Verde sobrio del taller Artesano Digital', tag: 'Taller' },
      { name: 'Verde Olivo Táctico', group: 'mate', desc: 'Tono militar orgánico mate muy popular', tag: 'Mate' },
      { name: 'Terracota', group: 'mate', desc: 'Arcilla cálida mexicana cocida al sol', tag: 'Cálido' },
      { name: 'Mostaza Colonial', group: 'mate', desc: 'Amarillo ocre colonial cálido', tag: 'Cálido' },
      { name: 'Azul Marino Medianoche', group: 'mate', desc: 'Azul muy oscuro elegante y corporativo', tag: 'Oscuro' },
      { name: 'Gris Plomo Titán', group: 'mate', desc: 'Gris carbón neutro industrial', tag: 'Neutro' },
      { name: 'Vino Tinto Borgoña', group: 'mate', desc: 'Rojo obscuro cereza imperial', tag: 'Elegante' },
      { name: 'Chocolate Espresso', group: 'mate', desc: 'Café tostado mate intenso', tag: 'Cálido' },
      { name: 'Morado Medianoche', group: 'mate', desc: 'Púrpura nocturno profundo', tag: 'Oscuro' },
      { name: 'Rojo Carmesí', group: 'mate', desc: 'Rojo vivo brillante de alta saturación', tag: 'Vibrante' },
      // Sedas & Metales
      { name: 'Seda Oro Champagne', group: 'sedas', desc: 'Brillo metálico satinado oro 24K', tag: 'Seda' },
      { name: 'Seda Bronce / Cobre', group: 'sedas', desc: 'Destello cobrizo cálido metalizado', tag: 'Seda' },
      { name: 'Plata Metálico', group: 'sedas', desc: 'Reflejo níquel aluminio brillante', tag: 'Metálico' },
      { name: 'Oro Rosado', group: 'sedas', desc: 'Tono rose gold metalizado de lujo', tag: 'Seda' },
      // Especiales
      { name: 'Madera Woodfill', group: 'especiales', desc: 'Filamento con 20% fibra de madera real', tag: 'Madera real' },
      { name: 'Mármol Granulado', group: 'especiales', desc: 'Textura mineral moteada arquitectónica', tag: 'Piedra' },
      { name: 'Glow Neón', group: 'especiales', desc: 'Recarga con luz y brilla en la oscuridad', tag: 'Nocturno' },
      { name: 'Translúcido Cristal', group: 'especiales', desc: 'Polímero semitransparente difusor', tag: 'Translúcido' },
      { name: 'Tornasol Arcoíris', group: 'especiales', desc: 'Gradiente continuo multicolor', tag: 'Multicolor' },
      // Claros & Pasteles
      { name: 'Verde Salvia', group: 'claros', desc: 'Tono botánico claro relajante', tag: 'Pastel' },
      { name: 'Verde Menta', group: 'claros', desc: 'Menta refrescante suave', tag: 'Pastel' },
      { name: 'Arena / Crema', group: 'claros', desc: 'Neutro cálido beige tipo cerámica', tag: 'Neutro' },
      { name: 'Azul Cielo', group: 'claros', desc: 'Azul pastel claro muy limpio', tag: 'Pastel' },
      { name: 'Rosa Pastel', group: 'claros', desc: 'Rosa suave aterciopelado', tag: 'Pastel' },
      { name: 'Lavanda / Violeta', group: 'claros', desc: 'Lila floral aromático claro', tag: 'Pastel' }
    ]
  },
  textile: {
    id: 'textile',
    label: 'Telas & Gorras',
    title: 'Colores de Telas, Prendas y Gorras',
    techniqueName: 'Confección & Vinil Textil',
    badge: 'Algodón & Gabardina',
    note: 'Telas seleccionadas en 100% algodón crudo, gabardina estructurada para gorras y lonetas de alta resistencia.',
    colors: [
      { name: 'Manta Cruda 100% Algodón', desc: 'Tejido artesanal crudo con motas naturales sin blanquear', tag: '100% Algodón' },
      { name: 'Negro Carbón', desc: 'Teñido reactivo profundo que no destiñe', tag: 'Básico' },
      { name: 'Blanco Óptico', desc: 'Blanco puro brillante para máxima nitidez', tag: 'Básico' },
      { name: 'Gris Jaspe', desc: 'Hilado bicolor texturizado melange muy suave', tag: 'Melange' },
      { name: 'Azul Marino', desc: 'Azul institucional oscuro clásico', tag: 'Clásico' },
      { name: 'Verde Militar', desc: 'Verde oliva estructurado de uso rudo', tag: 'Táctico' },
      { name: 'Rojo Carmesí', desc: 'Rojo escarlata intenso y llamativo', tag: 'Vibrante' },
      { name: 'Beige Arena', desc: 'Tono arena cálido elegante para playa o eventos', tag: 'Neutro' },
      { name: 'Rosa Palo Empolvado', desc: 'Rosa suave vintage muy solicitado en bodas y bautizos', tag: 'Pastel' },
      { name: 'Mezclilla Azul', desc: 'Tejido pesado tipo denim azul añil resistente', tag: 'Denim' }
    ]
  },
  sublimation: {
    id: 'sublimation',
    label: 'Sublimación Full Color',
    title: 'Bases de Sublimación & Impresión Fotográfica',
    techniqueName: 'Sublimación Fotográfica HD',
    badge: 'Full Color HD',
    isSublimationNotice: true,
    note: '📸 En sublimación no hay límite de colores: Puedes estampar fotografías, logotipos, degradados y dedicatorias a todo color con resolución fotográfica HD y fijación permanente.',
    colors: [
      { name: 'Base Blanca Brillante (Full Color)', desc: 'Base blanca con barniz polimérico para fotografía nítida a todo color', tag: 'Recomendado' },
      { name: 'Base Plata Satinado Metálico', desc: 'Fondo aluminio plata satinado: los colores adoptan brillo metálico', tag: 'Metálico' },
      { name: 'Base Oro Satinado Metálico', desc: 'Fondo dorado champagne de lujo con destellos tornasol', tag: 'Metálico' },
      { name: 'Taza Cerámica con Interior y Asa Negra', desc: 'Cuerpo exterior blanco para tu foto + interior y asa negro azabache', tag: 'Bicolor' },
      { name: 'Taza Cerámica con Interior y Asa Roja', desc: 'Cuerpo exterior blanco para tu foto + interior y asa rojo carmín', tag: 'Bicolor' },
      { name: 'Taza Cerámica con Interior y Asa Azul', desc: 'Cuerpo exterior blanco para tu foto + interior y asa azul marino', tag: 'Bicolor' },
      { name: 'Taza Cerámica con Interior y Asa Verde', desc: 'Cuerpo exterior blanco para tu foto + interior y asa verde bosque', tag: 'Bicolor' },
      { name: 'Taza Cerámica con Interior y Asa Rosa', desc: 'Cuerpo exterior blanco para tu foto + interior y asa rosa pastel', tag: 'Bicolor' }
    ]
  },
  vinyl: {
    id: 'vinyl',
    label: 'Vinil de Taller',
    title: 'Vinil de Rotulación Exterior & Vinil Textil',
    techniqueName: 'Corte Plotter & Estampado',
    badge: 'Oracal & Siser',
    note: 'Vinil alemán Oracal 651 de 5+ años de durabilidad exterior y Vinil Textil Siser italiano con termo-fijación indeleble.',
    colors: [
      { name: 'Vinil Rotulación Negro Brillante', desc: 'Oracal 651 calandrado para ventanas, autos y muros', tag: 'Rotulación' },
      { name: 'Vinil Rotulación Blanco Mate', desc: 'Oracal 651 blanco no reflejante de máxima visibilidad', tag: 'Rotulación' },
      { name: 'Vinil Dorado Metálico', desc: 'Oro brillante espejo para detalles y logotipos finos', tag: 'Metálico' },
      { name: 'Vinil Plateado Cromo', desc: 'Plata cromado espejo de alto impacto visual', tag: 'Cromo' },
      { name: 'Vinil Holográfico Tornasol', desc: 'Prismático arcoíris que cambia de color según la luz', tag: 'Holográfico' },
      { name: 'Vinil Textil Negro Mate Siser', desc: 'Termotransferible elástico suave al tacto en prendas', tag: 'Textil' },
      { name: 'Vinil Textil Blanco Nieve', desc: 'Blanco opaco para prendas claras u oscuras', tag: 'Textil' },
      { name: 'Vinil Textil Oro Foil Espejo', desc: 'Brillo reflectivo oro metálico que no se cuartea', tag: 'Textil' },
      { name: 'Vinil Textil Puff 3D en Relieve (Negro)', desc: 'Efecto inflado tridimensional espumado al calor', tag: 'Puff 3D' },
      { name: 'Vinil Textil Puff 3D en Relieve (Blanco)', desc: 'Efecto inflado 3D blanco nieve en relieve alto', tag: 'Puff 3D' },
      { name: 'Vinil Neón Flúor', desc: 'Amarillo/Verde neón fluorescente de alta visibilidad', tag: 'Neón' }
    ]
  },
  acrylic: {
    id: 'acrylic',
    label: 'Acrílico Cast',
    title: 'Acrílico Cast 3mm (Láser y Maquila CNC)',
    techniqueName: 'Corte & Grabado Láser / CNC',
    badge: 'Acrílico 3mm',
    isAcrylicNotice: true,
    note: '⚠️ Nota técnica sobre láser diodo: El haz de luz de 455 nm corta directamente acrílicos oscuros y espejo. Los acrílicos transparentes y blancos se maquilan con fresadora CNC o CO2.',
    colors: [
      { name: 'Acrílico Negro Ónix 3mm', desc: 'Corte directo en láser diodo con cantos pulidos espejo', tag: 'Corte diodo' },
      { name: 'Acrílico Rojo Translúcido', desc: 'Corte directo en láser diodo, pasa luz roja brillante', tag: 'Corte diodo' },
      { name: 'Acrílico Azul Eléctrico', desc: 'Corte directo en láser diodo, tonalidad zafiro vivo', tag: 'Corte diodo' },
      { name: 'Acrílico Verde Esmeralda', desc: 'Corte directo en láser diodo, verde translúcido joya', tag: 'Corte diodo' },
      { name: 'Acrílico Amarillo Neón', desc: 'Corte directo en láser diodo con bordes luminosos', tag: 'Corte diodo' },
      { name: 'Acrílico Espejo Oro', desc: 'Grabado reverso y corte diodo con reflejo espejo oro', tag: 'Espejo' },
      { name: 'Acrílico Espejo Plata', desc: 'Grabado reverso con reflejo plata cromo idéntico al vidrio', tag: 'Espejo' },
      { name: 'Acrílico Cristal Transparente', desc: '100% transparente: maquila en fresadora CNC o láser CO2', tag: 'CNC / CO2' },
      { name: 'Acrílico Blanco Difusor', desc: 'Blanco lechoso para lámparas: maquila CNC o láser CO2', tag: 'CNC / CO2' }
    ]
  }
};

/**
 * Detecta qué categoría de material y técnica le corresponde al producto
 */
export function detectProductMaterialCategory(product) {
  if (!product) return 'pla';
  const techs = product.techniques || [];
  const mat = (product.specifications?.material || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();

  if (
    techs.includes('laser') ||
    mat.includes('madera') ||
    mat.includes('pino') ||
    mat.includes('nogal') ||
    mat.includes('abedul') ||
    mat.includes('haya') ||
    mat.includes('triplay') ||
    mat.includes('mdf') ||
    name.includes('madera') ||
    name.includes('posavasos') ||
    name.includes('camarita') ||
    name.includes('colgador')
  ) {
    return 'wood';
  }

  if (
    techs.includes('sublimation') ||
    techs.includes('sublimacion') ||
    name.includes('sublimac') ||
    name.includes('fotobotón') ||
    name.includes('fotoboton') ||
    mat.includes('sublim')
  ) {
    return 'sublimation';
  }

  if (
    techs.includes('textil') ||
    cat.includes('textil') ||
    cat.includes('gorras') ||
    name.includes('gorra') ||
    name.includes('playera') ||
    name.includes('manta') ||
    name.includes('bolsa tote')
  ) {
    return 'textile';
  }

  if (
    techs.includes('vinyl') ||
    techs.includes('vinil') ||
    mat.includes('vinil') ||
    name.includes('vinil') ||
    name.includes('calcoman')
  ) {
    return 'vinyl';
  }

  if (
    mat.includes('acrilic') ||
    mat.includes('acrílic') ||
    name.includes('acrilic') ||
    name.includes('acrílic')
  ) {
    return 'acrylic';
  }

  return 'pla';
}

/**
 * Retorna las 5-6 opciones de color iniciales por defecto según el material del producto
 */
export function getDefaultOptionsForCategory(cat) {
  switch (cat) {
    case 'wood':
      return [
        'Barniz Natural Transparente',
        'Nogal Americano',
        'Caoba Clásico',
        'Roble Claro Nórdico',
        'Tinte Wengué / Ébano Oscuro',
        '🎨 Otro acabado a convenir'
      ];
    case 'sublimation':
      return [
        'Base Blanca Brillante (Full Color)',
        'Base Plata Satinado Metálico',
        'Base Oro Satinado Metálico',
        'Taza Cerámica con Interior y Asa Negra'
      ];
    case 'textile':
      return [
        'Manta Cruda 100% Algodón',
        'Negro Carbón',
        'Blanco Óptico',
        'Azul Marino',
        'Verde Militar',
        '🎨 Otro color a elegir'
      ];
    case 'vinyl':
      return [
        'Vinil Rotulación Negro Brillante',
        'Vinil Rotulación Blanco Mate',
        'Vinil Dorado Metálico',
        'Vinil Holográfico Tornasol',
        'Vinil Textil Negro Mate Siser'
      ];
    case 'acrylic':
      return [
        'Acrílico Negro Ónix 3mm',
        'Acrílico Rojo Translúcido',
        'Acrílico Azul Eléctrico',
        'Acrílico Espejo Oro',
        '🎨 Otro color a convenir'
      ];
    case 'pla':
    default:
      return [
        'Verde Olivo Táctico',
        'Negro Ónix Mate',
        'Blanco Marfil',
        'Terracota',
        'Seda Oro Champagne',
        '🎨 Otro color a elegir (a convenir)'
      ];
  }
}

/**
 * Paletas agrupadas clásicas para compatibilidad
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
    shortLabel: 'Barnices y Tintes (10)',
    colors: WORKSHOP_PALETTES_BY_CATEGORY.wood.colors.map(c => c.name)
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
      'Azul Zafiro / Eléctrico',
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

export const ALL_WORKSHOP_COLORS = Array.from(new Set([
  ...WORKSHOP_COLOR_PALETTES.flatMap(group => group.colors),
  ...Object.values(WORKSHOP_PALETTES_BY_CATEGORY).flatMap(cat => cat.colors.map(c => c.name))
]));
