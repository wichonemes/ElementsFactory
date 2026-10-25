/**
 * skuHelper.js - Sistema Estandarizado de Generación y Desglose de SKU para Taller Artesano Digital
 * Estructura Oficial: [ÁREA]-[TÉCNICA(S)]-[MATERIAL]-[ACABADO]-[CORRELATIVO]
 * Diseñado para que el personal interno y operadores sepan al instante qué máquina, material y acabado aplicar.
 */

export const SKU_AREAS = {
  HOG: { code: 'HOG', label: 'Hogar', short: 'Hogar', icon: '🏠', worldId: 'hogar', desc: 'Lámparas, macetas, cuadros, vaciabolsillos y recuerdos' },
  NEG: { code: 'NEG', label: 'Negocios', short: 'Negocios', icon: '💼', worldId: 'negocios', desc: 'Señalética, soportes QR/NFC, placas y branding' },
  JUG: { code: 'JUG', label: 'Juguetes', short: 'Juguetes', icon: '🧸', worldId: 'juguetes', desc: 'Juguetes, figuras y piezas para niños' },
  PER: { code: 'PER', label: 'Personalizados', short: 'Personalizados', icon: '✨', worldId: 'personalizados', desc: 'Modelos personalizados únicos' },
  EVE: { code: 'EVE', label: 'Eventos', short: 'Eventos', icon: '🎉', worldId: 'eventos', desc: 'Bodas, XV años, centros de mesa y recuerdos' },
  PAQ: { code: 'PAQ', label: 'Paquetes', short: 'Paquetes', icon: '🎁', worldId: 'paquetes', desc: 'Sets multitécnica, combos y kits promocionales' },
  IND: { code: 'IND', label: 'Industria', short: 'Industria', icon: '⚙️', worldId: 'industria', desc: 'Industria técnica, piezas y prototipos' },
  PUB: { code: 'PUB', label: 'Publicidad', short: 'Publicidad', icon: '🎨', worldId: 'publicidad-desarrollo', desc: 'Diseño publicitario y producción' },
  TLL: { code: 'TLL', label: 'Taller', short: 'Taller', icon: '🛠️', worldId: 'taller', desc: 'Producción interna y piezas especiales bajo pedido' }
};

export const SKU_TECHNIQUES = {
  '3D': { code: '3D', label: 'Impresión 3D (FDM / Filamento)', short: 'Impresión 3D', machine: 'Granja 3D FDM' },
  'LAS': { code: 'LAS', label: 'Corte / Grabado Láser CO2', short: 'Corte Láser', machine: 'Láser CO2 / Diodo' },
  'HYB': { code: 'HYB', label: 'Híbrido (Láser + Impresión 3D)', short: 'Híbrido Láser + 3D', machine: 'Láser + Impresión 3D' },
  'SUB': { code: 'SUB', label: 'Sublimación Térmica', short: 'Sublimación', machine: 'Prensa de Tazas / Plancha Térmica' },
  'VIN': { code: 'VIN', label: 'Vinil Adhesivo / Textil', short: 'Vinil', machine: 'Plotter de Corte' },
  'DTF': { code: 'DTF', label: 'Impresión DTF Textil HD', short: 'DTF Textil', machine: 'Impresora DTF + Horno' },
  'NFC': { code: 'NFC', label: 'Tecnología NFC Programada', short: 'Chip NFC', machine: 'Estación de Codificación NFC' },
  'CNC': { code: 'CNC', label: 'Router CNC / Tallado', short: 'Router CNC', machine: 'Router CNC de Madera' }
};

export const SKU_MATERIALS = {
  PLA: { code: 'PLA', label: 'Filamento PLA', family: 'Polímeros 3D', note: 'Biodegradable, gran acabado superficial' },
  PET: { code: 'PET', label: 'Filamento PETG / TPU', family: 'Polímeros Técnicos', note: 'Flexible o resistente a impacto' },
  RES: { code: 'RES', label: 'Resina Fotosensible', family: 'Resinas UV', note: 'Ultra alta definición y detalles finos' },
  MDF: { code: 'MDF', label: 'Madera MDF / Fibras de Madera', family: 'Fibras de Madera', note: 'Económico para plantillas y letreros para pintar' },
  PIN: { code: 'PIN', label: 'Madera Natural Selecta (Pino/Abedul/Haya/Nogal)', family: 'Maderas Naturales', note: 'Madera natural estufada sin MDF, veta fina y cálida' },
  ACR: { code: 'ACR', label: 'Acrílico Cristal / Color', family: 'Termoplásticos', note: 'Brillante, translúcido o espejo' },
  CER: { code: 'CER', label: 'Cerámica / Vidrio', family: 'Inorgánicos', note: 'Apto para termo-transferencia' },
  TEX: { code: 'TEX', label: 'Textil / Manta de Algodón', family: 'Telas & Confección', note: 'Prendas, tote bags o gorras' },
  MET: { code: 'MET', label: 'Aluminio / Acero / Herrajes', family: 'Metales', note: 'Resistente a intemperie' },
  HYB: { code: 'HYB', label: 'Compuesto Madera + PLA', family: 'Multimaterial', note: 'Combinación artesanal de dos sustratos' }
};

export const SKU_FINISHES = {
  MAT: { code: 'MAT', label: 'Barniz / Textura Mate', desc: 'Terso sin reflejos, elegante' },
  BRI: { code: 'BRI', label: 'Sellador Brillante / Resina', desc: 'Efecto cristal brillante' },
  GRA: { code: 'GRA', label: 'Grabado Láser Profundo', desc: 'Bajo relieve oscurecido por calor' },
  COR: { code: 'COR', label: 'Corte Limpio / Biselado', desc: 'Bordes pulidos sin rebabas' },
  PIN: { code: 'PIN', label: 'Pintura Artesanal a Mano', desc: 'Detallado a pincel o aerógrafo' },
  NFC: { code: 'NFC', label: 'Chip NFC Integrado & Enlace', desc: 'Programado con URL o contacto' },
  TER: { code: 'TER', label: 'Termofijado Textil', desc: 'Sellado con presión y calor' },
  ENS: { code: 'ENS', label: 'Ensamblado Artesanal', desc: 'Pegado multicapa y curado' },
  ESP: { code: 'ESP', label: 'Acrílico Espejo / Reflejante', desc: 'Acabado dorado o plateado' }
};

/**
 * Genera un SKU estandarizado a partir de las cualidades seleccionadas.
 */
export function buildSku({ area = 'HOG', technique = '3D', material = 'PLA', finish = 'MAT', sequence = '001' }) {
  const cleanArea = (area || 'HOG').toUpperCase().slice(0, 3);
  const cleanTech = (technique || '3D').toUpperCase().slice(0, 4);
  const cleanMat = (material || 'PLA').toUpperCase().slice(0, 4);
  const cleanFinish = (finish || 'MAT').toUpperCase().slice(0, 3);
  
  // Normalizar correlativo a mínimo 3 dígitos
  const seqNum = String(sequence || '001').replace(/\D/g, '');
  const cleanSeq = seqNum.padStart(3, '0').slice(-4);

  return `${cleanArea}-${cleanTech}-${cleanMat}-${cleanFinish}-${cleanSeq}`;
}

/**
 * Desglosa e interpreta un SKU para el personal de taller y producción.
 */
export function parseSku(skuString = '') {
  if (!skuString || typeof skuString !== 'string') {
    return { isValid: false, raw: skuString, parts: [] };
  }

  const parts = skuString.trim().toUpperCase().split('-');
  
  // Si coincide con el formato oficial de 5 partes: [ÁREA]-[TÉCNICA]-[MATERIAL]-[ACABADO]-[CORRELATIVO]
  if (parts.length >= 4) {
    const areaKey = parts[0];
    const techKey = parts[1];
    const matKey = parts[2];
    const finKey = parts[3];
    const seq = parts.slice(4).join('-') || '';

    const area = SKU_AREAS[areaKey] || { code: areaKey, label: `Área: ${areaKey}` };
    const tech = SKU_TECHNIQUES[techKey] || { code: techKey, label: `Técnica: ${techKey}`, machine: 'Taller' };
    const mat = SKU_MATERIALS[matKey] || { code: matKey, label: `Material: ${matKey}`, family: 'General' };
    const fin = SKU_FINISHES[finKey] || { code: finKey, label: `Acabado: ${finKey}`, desc: 'Estándar' };

    return {
      isValid: true,
      isStandard: true,
      raw: skuString,
      area,
      tech,
      mat,
      fin,
      sequence: seq,
      explanation: {
        destino: area.label,
        maquinaria: `${tech.label} (${tech.machine || 'Equipo de taller'})`,
        materiaPrima: `${mat.label} - ${mat.family || ''}`,
        acabadoTaller: `${fin.label} - ${fin.desc || ''}`,
        lote: `#${seq}`
      }
    };
  }

  // Compatibilidad con códigos cortos legacy (ej. L14, T38, S1, PROMO-HOG-1)
  return {
    isValid: true,
    isStandard: false,
    raw: skuString,
    legacyCode: skuString,
    explanation: {
      destino: 'Código de taller abreviado',
      maquinaria: skuString.startsWith('L') ? 'Corte / Grabado Láser' :
                  skuString.startsWith('T') ? 'Impresión 3D' :
                  skuString.startsWith('S') ? 'Sublimación' :
                  skuString.startsWith('VN') ? 'Vinil Textil' :
                  skuString.startsWith('EV') ? 'Eventos Especiales' : 'Taller Multitécnica',
      materiaPrima: 'Ver especificaciones del producto',
      acabadoTaller: 'Ver detalles de manufactura',
      lote: skuString
    }
  };
}

/**
 * Sugiere automáticamente el mejor SKU para un producto basado en sus datos actuales.
 */
export function suggestSkuForProduct(product = {}, existingProducts = []) {
  if (!product) return 'HOG-3D-PLA-MAT-001';

  // 1. Deducir Área
  let area = 'HOG';
  const worlds = product.worlds || [];
  if (product.isBundle || worlds.includes('paquetes')) area = 'PAQ';
  else if (worlds.includes('negocios') && !worlds.includes('hogar')) area = 'NEG';
  else if (worlds.includes('eventos') && !worlds.includes('hogar')) area = 'EVE';
  else if (worlds.includes('hogar')) area = 'HOG';

  // 2. Deducir Técnica(s)
  let technique = '3D';
  const techs = product.techniques || [];
  if (techs.includes('laser') && (techs.includes('3d') || techs.includes('hybrid'))) {
    technique = 'HYB';
  } else if (techs.includes('laser')) {
    technique = 'LAS';
  } else if (techs.includes('sublimation') || techs.includes('sublimacion')) {
    technique = 'SUB';
  } else if (techs.includes('vinyl') || techs.includes('vinil')) {
    technique = 'VIN';
  } else if (techs.includes('dtf')) {
    technique = 'DTF';
  } else if (techs.includes('nfc')) {
    technique = 'NFC';
  } else if (techs.includes('3d')) {
    technique = '3D';
  }

  // 3. Deducir Material
  let material = 'PLA';
  const matText = ((product.specifications?.material || '') + ' ' + (product.name || '') + ' ' + (product.shortDescription || '')).toLowerCase();
  if (matText.includes('termo') || matText.includes('aluminio') || matText.includes('acero') || matText.includes('metal')) material = 'MET';
  else if (matText.includes('madera') || matText.includes('pino') || matText.includes('abedul') || matText.includes('haya') || matText.includes('roble') || matText.includes('nogal') || matText.includes('camarita') || matText.includes('triplay') || matText.includes('contrachapad') || matText.includes('llavero')) material = 'PIN';
  else if (matText.includes('mdf') || matText.includes('fibrofacil')) material = 'MDF';
  else if (matText.includes('acrílico') || matText.includes('acrilico')) material = 'ACR';
  else if (matText.includes('cerámica') || matText.includes('ceramica') || matText.includes('taza')) material = 'CER';
  else if (matText.includes('manta') || matText.includes('algodón') || matText.includes('textil') || matText.includes('playera') || matText.includes('gorra')) material = 'TEX';
  else if (matText.includes('petg') || matText.includes('tpu') || matText.includes('flexible')) material = 'PET';
  else if (matText.includes('resina')) material = 'RES';
  else if (technique === 'LAS') material = 'PIN';
  else if (technique === 'SUB') material = 'CER';
  else if (technique === 'VIN') material = 'TEX';
  else material = 'PLA';

  // 4. Deducir Acabado
  let finish = 'MAT';
  const finText = ((product.specifications?.finish || '') + ' ' + (product.fullDescription || '')).toLowerCase();
  if (finText.includes('nfc') || matText.includes('nfc')) finish = 'NFC';
  else if (finText.includes('grabado') || technique === 'LAS') finish = 'GRA';
  else if (finText.includes('brillante') || finText.includes('resina')) finish = 'BRI';
  else if (finText.includes('espejo')) finish = 'ESP';
  else if (finText.includes('pintura') || finText.includes('a mano')) finish = 'PIN';
  else if (finText.includes('termofijado') || technique === 'VIN' || technique === 'DTF') finish = 'TER';
  else if (finText.includes('ensamble') || product.isBundle) finish = 'ENS';
  else finish = 'MAT';

  // 5. Correlativo numérico extraído o secuencial
  let sequence = '001';
  if (product.code) {
    const digits = product.code.match(/\d+/);
    if (digits) {
      sequence = digits[0].padStart(3, '0');
    }
  } else if (existingProducts && existingProducts.length > 0) {
    sequence = String(existingProducts.length + 1).padStart(3, '0');
  }

  return buildSku({ area, technique, material, finish, sequence });
}
