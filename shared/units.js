export const UNIT_OPTIONS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (L)' },
  { value: 'pieza', label: 'Pieza' },
  { value: 'pliego', label: 'Pliego' },
  { value: 'hoja', label: 'Hoja' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'cm', label: 'Centímetro (cm)' },
  { value: 'm2', label: 'Metro cuadrado (m²)' },
  { value: 'aplicacion', label: 'Aplicación' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'lote', label: 'Lote' },
  { value: 'rollo', label: 'Rollo' },
  { value: 'par', label: 'Par' },
  { value: 'set', label: 'Set' }
];

const UNIT_ALIASES = {
  g: 'g', gr: 'g', gramo: 'g', gramos: 'g',
  kg: 'kg', kilo: 'kg', kilos: 'kg', kilogramo: 'kg', kilogramos: 'kg',
  ml: 'ml', mililitro: 'ml', mililitros: 'ml',
  l: 'l', lt: 'l', litro: 'l', litros: 'l',
  pza: 'pieza', pzas: 'pieza', pieza: 'pieza', piezas: 'pieza',
  pliego: 'pliego', pliegos: 'pliego',
  hoja: 'hoja', hojas: 'hoja',
  m: 'm', metro: 'm', metros: 'm',
  cm: 'cm', centimetro: 'cm', centimetros: 'cm',
  m2: 'm2', 'm²': 'm2', metro2: 'm2', metros2: 'm2',
  aplicacion: 'aplicacion', aplicaciones: 'aplicacion',
  servicio: 'servicio', servicios: 'servicio',
  lote: 'lote', lotes: 'lote',
  rollo: 'rollo', rollos: 'rollo',
  par: 'par', pares: 'par',
  set: 'set', sets: 'set'
};

export function normalizeUnit(value) {
  const text = String(value || '').toLowerCase().trim();
  return UNIT_ALIASES[text] || text;
}

function parsePackage(material = {}) {
  const packageQuantity = Number(material.packageQuantity);
  const packageMeasurement = material.packageMeasurement;
  if (packageQuantity > 0 && packageMeasurement) {
    return {
      quantity: packageQuantity,
      measurement: normalizeUnit(packageMeasurement)
    };
  }

  const name = String(material.name || '');
  const unitText = String(material.unit || '');

  // Sets de tintas: "Set 4x100ml" => 400 ml.
  const volumeSet = name.match(/(\d+)\s*[x×]\s*([\d.,]+)\s*(ml|l)\b/i);
  if (volumeSet) {
    return {
      quantity: Number(volumeSet[1]) * Number(String(volumeSet[2]).replace(',', '.')),
      measurement: normalizeUnit(volumeSet[3])
    };
  }

  // Rollos con largo por rollo: "3 rollos" + "33m" => 99 m.
  const rollCount = unitText.match(/\((\d+)\s*rollos?\)/i) || name.match(/\((\d+)\s*rollos?\)/i);
  const rollLength = name.match(/(\d+(?:[.,]\d+)?)\s*m\b(?!m)/i);
  if (rollCount && rollLength) {
    return {
      quantity: Number(rollCount[1]) * Number(String(rollLength[1]).replace(',', '.')),
      measurement: 'm'
    };
  }

  const match = unitText.match(/\(([\d.,]+)\s*([^)]+)\)/);
  if (match) {
    return {
      quantity: Number(String(match[1]).replace(',', '.')) || 1,
      measurement: normalizeUnit(match[2])
    };
  }

  const simple = unitText.match(/([\d.,]+)\s*(pzas?|piezas?|hojas?|pliegos?|rollos?|servicios?|aplicaciones?|lotes?|pares?|sets?)/i);
  if (simple) {
    return {
      quantity: Number(String(simple[1]).replace(',', '.')) || 1,
      measurement: normalizeUnit(simple[2])
    };
  }

  return { quantity: 1, measurement: normalizeUnit(material.unit || 'pieza') };
}

function baseUnitsPerTarget(baseUnit, targetUnit) {
  const base = normalizeUnit(baseUnit);
  const target = normalizeUnit(targetUnit);
  if (base === target) return 1;
  if (base === 'kg' && target === 'g') return 0.001;
  if (base === 'g' && target === 'kg') return 1000;
  if (base === 'l' && target === 'ml') return 0.001;
  if (base === 'ml' && target === 'l') return 1000;
  if (base === 'm' && target === 'cm') return 0.01;
  if (base === 'cm' && target === 'm') return 100;
  if (base === 'pieza' && target === 'pieza') return 1;
  return null;
}

export function preferredUnitForMaterial(material) {
  if (!material) return 'pieza';
  const pkg = parsePackage(material);
  const unit = normalizeUnit(pkg.measurement);
  return UNIT_OPTIONS.some(option => option.value === unit) ? unit : 'pieza';
}

export function compatibleUnitsForMaterial(material) {
  if (!material) return UNIT_OPTIONS.map(option => option.value);
  const pkg = parsePackage(material);
  const base = normalizeUnit(pkg.measurement);
  const groups = {
    g: ['g', 'kg'],
    kg: ['g', 'kg'],
    ml: ['ml', 'l'],
    l: ['ml', 'l'],
    m: ['m', 'cm'],
    cm: ['m', 'cm'],
    hoja: ['hoja', 'pieza'],
    pliego: ['pliego', 'pieza'],
    pieza: ['pieza'],
    rollo: ['rollo'],
    lote: ['lote'],
    par: ['par'],
    set: ['set'],
    servicio: ['servicio'],
    aplicacion: ['aplicacion']
  };
  return groups[base] || [base, 'pieza'];
}

export function materialUnitCostFor(material, targetUnit) {
  if (!material) return 0;
  const packageCost = Number(material.costPerUnit ?? material.packageCost ?? 0);
  const pkg = parsePackage(material);
  const baseCost = packageCost / (pkg.quantity || 1);
  const factor = baseUnitsPerTarget(pkg.measurement, targetUnit);
  if (factor === null) return baseCost;
  return baseCost * factor;
}

export function packageUnitsForQuantity(material, requiredQuantity, requiredUnit) {
  if (!material) return 0;
  const pkg = parsePackage(material);
  const quantity = Number(requiredQuantity) || 0;
  const factor = baseUnitsPerTarget(pkg.measurement, requiredUnit);
  const baseUnits = factor === null ? quantity : quantity * factor;
  return baseUnits / (pkg.quantity || 1);
}

export function formatUnitCost(value) {
  const number = Number(value) || 0;
  if (number === 0) return '0';
  if (number < 0.01) return number.toFixed(4);
  if (number < 1) return number.toFixed(3);
  return number.toFixed(2);
}
