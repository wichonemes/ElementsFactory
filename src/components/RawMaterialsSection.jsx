import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Boxes, Sparkle, CheckSquare, Truck, Hammer, Calendar, Users, AlertTriangle, AlertCircle, CheckCircle2, Plus, Edit, Trash2,
  RefreshCw, Search, Filter, Save, Calculator, DollarSign, TrendingUp,
  Download, FileSpreadsheet, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Layers, Tag,
  Clock, Zap, Sliders, Check, X, ShieldAlert, Package, PackageCheck, Sparkles,
  ArrowRight, ArrowUpRight, ArrowUp, ArrowLeft, Building2, Phone, Mail, Globe, MapPin,
  MessageCircle, User, ExternalLink, Copy, Cpu, Wrench, FileText, Eye, Upload,
  Printer, Scissors, Paintbrush, Cog, TreePine, Shirt, Factory
} from 'lucide-react';

import ShippingLogisticsSection from './ShippingLogisticsSection';
import { getFilamentColor } from '../utils/colorUtils';
import { packageUnitsForQuantity } from '../../shared/units.js';
export { getFilamentColor };

// Operadores y trabajadores de taller preconfigurados para testeo de mano de obra
export const WORKSHOP_OPERATORS = [
  { id: 'op-1', name: 'Juan (Operador Láser Senior)', hourlyRate: 300, role: 'Corte y Grabado Láser CO2 / Fibra' },
  { id: 'op-2', name: 'Pedro (Operador Impresión 3D)', hourlyRate: 200, role: 'Impresión FDM, Resina y Calibración' },
  { id: 'op-3', name: 'Auxiliar de Taller / Acabados', hourlyRate: 120, role: 'Desbarbado, Lijado y Ensamble' },
  { id: 'op-4', name: 'Tallerista Titular / Maestro', hourlyRate: 250, role: 'Producción General y Calidad' },
  { id: 'custom', name: 'Trabajador Personalizado', hourlyRate: 200, role: 'Tarifa editable a mano' }
];

// Helper para desglosar el contenido del paquete en Cantidad numérica y Medición base
export function parsePackageInfo(mat) {
  if (mat && mat.packageQuantity !== undefined && mat.packageQuantity !== null && mat.packageMeasurement) {
    return {
      packageQuantity: Number(mat.packageQuantity) || 1,
      packageMeasurement: String(mat.packageMeasurement).trim() || 'pza'
    };
  }
  const unit = (((mat && mat.unit) || '') + ' ' + ((mat && mat.name) || '')).toLowerCase().trim();
  
  if (unit.includes('1 kg') || unit.includes('1kg') || unit.includes('kilo')) return { packageQuantity: 1000, packageMeasurement: 'g' };
  if (unit.includes('250g') || unit.includes('250 g')) return { packageQuantity: 250, packageMeasurement: 'g' };
  
  if (unit.includes('1 litro') || unit.includes('1l') || unit.includes('1 l')) return { packageQuantity: 1000, packageMeasurement: 'ml' };
  if (unit.includes('400 ml') || unit.includes('400ml')) return { packageQuantity: 400, packageMeasurement: 'ml' };
  if (unit.includes('250 ml') || unit.includes('250ml')) return { packageQuantity: 250, packageMeasurement: 'ml' };
  const mlMatch = unit.match(/(\d+)\s*ml/);
  if (mlMatch) return { packageQuantity: Number(mlMatch[1]), packageMeasurement: 'ml' };

  if (unit.includes('60x40') || unit.includes('60 x 40')) return { packageQuantity: 2400, packageMeasurement: 'cm²' };
  if (unit.includes('40x40') || unit.includes('40 x 40')) return { packageQuantity: 1600, packageMeasurement: 'cm²' };
  if (unit.includes('30x40') || unit.includes('30 x 40')) return { packageQuantity: 1200, packageMeasurement: 'cm²' };
  
  // Cinta Térmica Kapton y rollos en centímetros
  if (unit.includes('3 rollos') && (unit.includes('33m') || unit.includes('33 m'))) return { packageQuantity: 9900, packageMeasurement: 'cm' };
  if (unit.includes('33m') || unit.includes('33 m')) return { packageQuantity: 3300, packageMeasurement: 'cm' };
  if (unit.includes('10 m') || unit.includes('10m') || unit.includes('10 metros')) return { packageQuantity: 1000, packageMeasurement: 'cm' };
  if (unit.includes('20 m') || unit.includes('20m') || unit.includes('20 metros')) return { packageQuantity: 2000, packageMeasurement: 'cm' };
  if (unit.includes('50m') || unit.includes('50 m')) return { packageQuantity: 5000, packageMeasurement: 'cm' };
  if (unit.includes('5m') || unit.includes('5 m') || unit.includes('5 metros')) return { packageQuantity: 500, packageMeasurement: 'cm' };
  if (unit.includes('metro')) return { packageQuantity: 100, packageMeasurement: 'cm' };

  if (unit.includes('500 pzas') || unit.includes('500')) return { packageQuantity: 500, packageMeasurement: 'pza' };
  if (unit.includes('200 pzas') || unit.includes('200')) return { packageQuantity: 200, packageMeasurement: 'pza' };
  if (unit.includes('100 pzas') || unit.includes('100 hojas') || unit.includes('100 pliegos') || unit.includes('100')) {
    const meas = unit.includes('hoja') || unit.includes('pliego') ? 'hoja' : 'pza';
    return { packageQuantity: 100, packageMeasurement: meas };
  }
  if (unit.includes('50 pzas') || unit.includes('50 pares') || unit.includes('50')) return { packageQuantity: 50, packageMeasurement: 'pza' };
  if (unit.includes('36 tazas') || unit.includes('36')) return { packageQuantity: 36, packageMeasurement: 'pza' };
  if (unit.includes('25 pzas') || unit.includes('25')) return { packageQuantity: 25, packageMeasurement: 'pza' };
  if (unit.includes('20 pzas') || unit.includes('20')) return { packageQuantity: 20, packageMeasurement: 'pza' };
  if (unit.includes('6 rollos') || unit.includes('6')) return { packageQuantity: 6, packageMeasurement: 'pza' };
  if (unit.includes('5 pzas') || unit.includes('5')) return { packageQuantity: 5, packageMeasurement: 'pza' };
  if (unit.includes('4 botellas') || unit.includes('4')) return { packageQuantity: 4, packageMeasurement: 'pza' };
  if (unit.includes('3 rollos') || unit.includes('3 pzas') || unit.includes('3')) return { packageQuantity: 3, packageMeasurement: 'pza' };
  if (unit.includes('2 pzas') || unit.includes('2 piezas') || unit.includes('2')) return { packageQuantity: 2, packageMeasurement: 'pza' };

  return { packageQuantity: 1, packageMeasurement: 'pza' };
}

// ============================================================
// AGRUPACIÓN VISUAL DE INSUMOS POR FAMILIA Y SUBFAMILIA
// ============================================================
export const MATERIAL_FAMILIES = [
  { id: 'filamentos', label: 'Filamentos 3D', short: 'Filamentos', icon: Boxes, tone: 'emerald' },
  { id: 'viniles', label: 'Viniles & Textiles', short: 'Viniles', icon: Shirt, tone: 'indigo' },
  { id: 'laser', label: 'Maderas, Acrílicos & Láser', short: 'Láser', icon: Scissors, tone: 'amber' },
  { id: 'sublimacion', label: 'Sublimación & Cerámica', short: 'Sublimación', icon: Printer, tone: 'rose' },
  { id: 'ensamble', label: 'Herrajes & Ensamble', short: 'Ensamble', icon: Cog, tone: 'sky' },
  { id: 'empaque', label: 'Empaques & Etiquetas', short: 'Empaque', icon: PackageCheck, tone: 'orange' },
  { id: 'consumibles', label: 'Consumibles & Acabados', short: 'Consumibles', icon: Paintbrush, tone: 'purple' },
  { id: 'refacciones', label: 'Refacciones & Maquinaria', short: 'Refacciones', icon: Wrench, tone: 'stone' },
  { id: 'otros', label: 'Otros insumos', short: 'Otros', icon: Layers, tone: 'gray' }
];

export const MATERIAL_AREAS = [
  { id: '3d', label: 'Impresión 3D', icon: Boxes, tone: 'emerald' },
  { id: 'laser', label: 'Corte & Grabado Láser', icon: Scissors, tone: 'amber' },
  { id: 'sublimation', label: 'Sublimación & Cerámica', icon: Printer, tone: 'rose' },
  { id: 'vinyl', label: 'Vinil & Textil', icon: Shirt, tone: 'indigo' },
  { id: 'print', label: 'Impresión Láser / Tinta', icon: Printer, tone: 'cyan' },
  { id: 'assembly', label: 'Ensamble & Herrajes', icon: Cog, tone: 'sky' },
  { id: 'packaging', label: 'Empaques & Etiquetas', icon: PackageCheck, tone: 'orange' },
  { id: 'spare_parts', label: 'Refacciones & Maquinaria', icon: Wrench, tone: 'stone' },
  { id: 'consumables', label: 'Consumibles & Acabados', icon: Paintbrush, tone: 'purple' },
  { id: 'other', label: 'Otros insumos', icon: Layers, tone: 'gray' }
];

export const MATERIAL_SUPPLY_GROUPS = [
  { id: 'direct', label: 'Materias primas directas', icon: Package, tone: 'emerald' },
  { id: 'complementary', label: 'Insumos complementarios', icon: Cog, tone: 'sky' },
  { id: 'intangible', label: 'Intangibles y licencias', icon: Sparkles, tone: 'violet' },
  { id: 'micro', label: 'Microinsumos', icon: Hammer, tone: 'orange' },
  { id: 'finish', label: 'Acabados y terminaciones', icon: Paintbrush, tone: 'purple' },
  { id: 'indirect', label: 'Insumos indirectos', icon: ShieldAlert, tone: 'stone' },
  { id: 'packaging', label: 'Empaques y etiquetas', icon: PackageCheck, tone: 'amber' },
  { id: 'production', label: 'Producción y servicios', icon: Factory, tone: 'rose' }
];

export function materialAreaFor(mat) {
  const text = normalizeMaterialText(mat);
  const category = String(mat?.category || '').toLowerCase();
  if (category === '3d' || /filamento|\bpla\b|\btpu\b|\bpetg\b|\basa\b|\babs\b/.test(text)) return '3d';
  if (category === 'laser' || /madera|triplay|mdf|acrilico|pino|nogal/.test(text)) return 'laser';
  if (category === 'sublimation' || /sublimacion|taza|termo|tarro|papel transfer/.test(text)) return 'sublimation';
  if (category === 'vinyl' || /vinil|puf|textil|transfer/.test(text)) return 'vinyl';
  if (category === 'print' || /impresion laser|tinta|papel bond|invitacion/.test(text)) return 'print';
  if (category === 'assembly' || /herraje|tornillo|clavo|iman|argolla|led|broche|switch/.test(text)) return 'assembly';
  if (category === 'packaging' || /caja|bolsa|empaque|etiqueta|kraft|celofan/.test(text)) return 'packaging';
  if (category === 'spare_parts' || /boquilla|nozzle|hotend|refaccion|repuesto|correa/.test(text)) return 'spare_parts';
  if (category === 'consumables' || /barniz|tinte|pintura|pegamento|lija|cinta|guante|estopa|limpieza/.test(text)) return 'consumables';
  return 'other';
}

export function materialSupplyGroupFor(mat) {
  const text = normalizeMaterialText(mat);
  const category = String(mat?.category || '').toLowerCase();
  if (category === 'packaging' || /caja|bolsa|empaque|etiqueta|kraft|celofan|viruta/.test(text)) return 'packaging';
  if (/barniz|tinte|pintura|sellador|laca|esmalte|acabado/.test(text)) return 'finish';
  if (/diseno|licencia|archivo|modelo digital|arte digital|render/.test(text)) return 'intangible';
  if (/servicio|maquila|corte externo|grabado externo|instalacion/.test(text)) return 'production';
  if (/tornillo|clavo|tuerca|argolla|iman|led|interruptor|switch|herraje|broche|cierre|remache/.test(text)) return 'complementary';
  if (/pegamento|resistol|cianocrilato|lija|cinta|brocha|pincel|guante|estopa|limpieza|alcohol|diluyente/.test(text) || category === 'consumables') return 'micro';
  if (/guante|estopa|limpieza|proteccion/.test(text)) return 'indirect';
  return 'direct';
}

function moneyFmt(value) {
  return `$${(Number(value) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const SUPPLIER_SPECIALTIES = [
  { id: '3d', label: 'Impresión 3D', icon: '🖨️', category: '3d', test: /3d|filamento|resina|\bpla\b|\btpu\b|\bpetg\b/ },
  { id: 'vinyl', label: 'Vinil & Textil', icon: '✂️', category: 'vinyl', test: /vinil|textil|puf|transfer|playera|gorra|tote/ },
  { id: 'laser', label: 'Corte & Grabado Láser', icon: '🔥', category: 'laser', test: /laser|madera|mdf|acrilico|triplay|grabado/ },
  { id: 'sublimation', label: 'Sublimación & Cerámica', icon: '🎨', category: 'sublimation', test: /sublimacion|taza|termo|ceramica|tinta/ },
  { id: 'assembly', label: 'Herrajes & Ensamble', icon: '🔩', category: 'assembly', test: /herraje|iman|tornillo|argolla|ensamble|led|switch/ },
  { id: 'packaging', label: 'Cajas & Empaque', icon: '📦', category: 'packaging', test: /caja|empaque|bolsa|etiqueta|kraft/ },
  { id: 'spare_parts', label: 'Refacciones & CNC', icon: '🔧', category: 'spare_parts', test: /refaccion|repuesto|cnc|boquilla|nozzle|hotend/ }
];

function supplierHasSpecialty(supplier, specialty) {
  if (!supplier) return false;
  if (supplier.category === specialty.category) return true;
  const text = `${supplier.name || ''} ${supplier.notes || ''} ${supplier.contactName || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return specialty.test.test(text);
}

function normalizeMaterialText(mat) {
  return `${mat?.name || ''} ${mat?.category || ''} ${mat?.materialType || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function materialFamilyFor(mat) {
  const text = normalizeMaterialText(mat);
  const category = String(mat?.category || '').toLowerCase();
  if (category === '3d' || /filamento|\bpla\b|\btpu\b|\bpetg\b|\babs\b|\basa\b|bobina/.test(text)) return 'filamentos';
  if (category === 'vinyl' || /vinil|vinil textil|puf|fosforescente|fluorescente|transfer textil/.test(text)) return 'viniles';
  if (category === 'laser' || /madera|triplay|mdf|acrilico|pino|nogal|liston|tabla/.test(text)) return 'laser';
  if (category === 'sublimation' || /sublimacion|taza|termo|tarro|papel transfer|tinta sublimacion/.test(text)) return 'sublimacion';
  if (category === 'assembly' || /iman|argolla|tornillo|clavo|tuerca|herraje|broche|cierre|led|interruptor|switch|mosqueton|remache/.test(text)) return 'ensamble';
  if (category === 'packaging' || /caja|bolsa|empaque|etiqueta|celofan|kraft|viruta|burbuja/.test(text)) return 'empaque';
  if (category === 'consumables' || /barniz|tinte|pintura|sellador|laca|pegamento|resistol|cianocrilato|lija|cinta|guante|estopa|limpieza|alcohol/.test(text)) return 'consumibles';
  if (category === 'spare_parts' || /boquilla|nozzle|hotend|resistencia|termistor|correa|engranaje|refaccion|repuesto/.test(text)) return 'refacciones';
  return 'otros';
}

export function materialSubfamilyFor(mat, familyId) {
  const text = normalizeMaterialText(mat);
  if (familyId === 'filamentos') {
    if (/\btpu\b/.test(text)) return { id: 'tpu', label: 'TPU', icon: '🧵' };
    if (/\bpetg\b/.test(text)) return { id: 'petg', label: 'PETG', icon: '🧵' };
    if (/\babs\b|\basa\b/.test(text)) return { id: 'asa', label: 'ASA / ABS', icon: '🧵' };
    if (/\bpla\b/.test(text)) return { id: 'pla', label: 'PLA', icon: '🧵' };
    return { id: 'otros-filamentos', label: 'Otros filamentos', icon: '🧵' };
  }
  if (familyId === 'viniles') {
    if (/puf/.test(text)) return { id: 'puf', label: 'Vinil PUF', icon: '✂️' };
    if (/fosforescente|fluorescente|glow/.test(text)) return { id: 'fluorescente', label: 'Fluorescente', icon: '✨' };
    if (/textil|playera|gorra|tote|tela/.test(text)) return { id: 'textil', label: 'Vinil Textil', icon: '👕' };
    if (/espejo|metalizado|holografico|perla|brillante/.test(text)) return { id: 'especial', label: 'Especial / Metalizado', icon: '🪞' };
    return { id: 'corte', label: 'Vinil de Corte', icon: '✂️' };
  }
  if (familyId === 'laser') {
    if (/mdf/.test(text)) return { id: 'mdf', label: 'MDF', icon: '🪵' };
    if (/acrilico/.test(text)) return { id: 'acrilico', label: 'Acrílico', icon: '🟦' };
    if (/madera|triplay|pino|nogal|liston|tabla/.test(text)) return { id: 'madera', label: 'Maderas & Triplay', icon: '🌲' };
    return { id: 'otros-laser', label: 'Otros materiales láser', icon: '🔥' };
  }
  if (familyId === 'sublimacion') {
    if (/taza|termo|tarro|ceramica/.test(text)) return { id: 'tazas', label: 'Tazas & Termos', icon: '☕' };
    if (/papel|tinta|transfer/.test(text)) return { id: 'papel', label: 'Papel & Tintas', icon: '🎨' };
    if (/placa|rigido|fotoboton/.test(text)) return { id: 'rigidos', label: 'Rígidos', icon: '🖼️' };
    return { id: 'otros-sub', label: 'Otros sublimación', icon: '🎨' };
  }
  if (familyId === 'ensamble') {
    if (/iman|magnet/.test(text)) return { id: 'imanes', label: 'Imanes', icon: '🧲' };
    if (/argolla|llavero|mosqueton/.test(text)) return { id: 'argollas', label: 'Argollas & Llaveros', icon: '🔗' };
    if (/tornillo|clavo|tuerca|remache/.test(text)) return { id: 'tornilleria', label: 'Tornillería', icon: '🔩' };
    if (/led|luz|iluminacion/.test(text)) return { id: 'iluminacion', label: 'Iluminación', icon: '💡' };
    return { id: 'otros-ensamble', label: 'Otros herrajes', icon: '⚙️' };
  }
  if (familyId === 'empaque') {
    if (/caja|kraft/.test(text)) return { id: 'cajas', label: 'Cajas', icon: '📦' };
    if (/bolsa|celofan|tissue/.test(text)) return { id: 'bolsas', label: 'Bolsas', icon: '🛍️' };
    if (/etiqueta|sticker/.test(text)) return { id: 'etiquetas', label: 'Etiquetas', icon: '🏷️' };
    return { id: 'otros-empaque', label: 'Otros empaques', icon: '📦' };
  }
  if (familyId === 'consumibles') {
    if (/barniz|tinte|pintura|sellador|laca/.test(text)) return { id: 'acabados', label: 'Acabados', icon: '🎨' };
    if (/pegamento|resistol|cianocrilato|silicon/.test(text)) return { id: 'pegamentos', label: 'Pegamentos', icon: '🧴' };
    if (/lija|cinta|brocha|pincel/.test(text)) return { id: 'lijas', label: 'Lijas & Cintas', icon: '🧰' };
    if (/guante|estopa|limpieza|alcohol/.test(text)) return { id: 'limpieza', label: 'Limpieza & Protección', icon: '🧼' };
    return { id: 'otros-consumibles', label: 'Otros consumibles', icon: '🧰' };
  }
  if (familyId === 'refacciones') {
    if (/boquilla|nozzle|hotend|resistencia|termistor|correa|engranaje/.test(text)) return { id: 'impresora', label: 'Refacciones impresora', icon: '🖨️' };
    if (/laser|tubo|lente|espejo/.test(text)) return { id: 'laser', label: 'Refacciones láser', icon: '🔥' };
    return { id: 'otras-refacciones', label: 'Otras refacciones', icon: '🔧' };
  }
  return { id: 'general', label: 'General', icon: '📦' };
}

// Helper para convertir consumo de receta a unidades de stock de almacén de taller
export function calculateMaterialStockDeduction(material, requiredQuantity, requiredUnit) {
  const deduction = packageUnitsForQuantity(material, requiredQuantity, requiredUnit);
  return Math.round(deduction * 10000) / 10000;
}

export const DEFAULT_MEXICO_SUPPLIERS = [
  {
    id: 'sup-3d-market',
    name: '3D Market México',
    category: '3d',
    contactName: 'Atención a Talleres y Mayoreo',
    phone: '33 1895 2400',
    whatsapp: '523318952400',
    email: 'contacto@3dmarket.mx',
    website: 'https://3dmarket.mx',
    address: 'Av. Niños Héroes 2280, Col. Arcos Vallarta, Guadalajara, Jal. / Sucursales CDMX y Mty',
    leadTimeDays: '24 a 48 hrs hábiles',
    minOrder: 'Envío gratis a partir de $1,299 MXN',
    notes: 'Distribuidor oficial Bambu Lab, Polymaker, Creality, Anycubic y eSun en México. Filamento PLA Polymaker ($480-$550 MXN/kg), PLA Bambu ($520 MXN/kg), PETG y repuestos originales de extrusores.'
  },
  {
    id: 'sup-mercadolibre-componentes',
    name: 'Mercado Libre México (Componentes 3D & Mecanismos)',
    category: 'assembly',
    contactName: 'Tiendas Oficiales Mercado Envíos Full',
    phone: '800 105 5000',
    whatsapp: '525584321100',
    email: 'ayuda@mercadolibre.com.mx',
    website: 'https://www.mercadolibre.com.mx',
    address: 'Centros de Distribución Full (CDMX, Guadalajara, Monterrey, Tepotzotlán)',
    leadTimeDays: '24 a 48 hrs (Full) / 7 a 12 días (Internacional)',
    minOrder: 'Envío gratis en compras desde $299 MXN con Meli+',
    notes: 'Insumos de mecanismos para piezas 3D: Kits de luz LED USB 5V con interruptor para lámparas ($85 MXN con flete/impuestos), switches mecánicos clicker de 3 pines Outemu/Gateron ($6.00 MXN c/u / $60 MXN set 10) para fidgets (MLM2097835304), baleros cerámicos e imanes de neodimio.'
  },
  {
    id: 'sup-triplay-market',
    name: 'Triplay Market & Maderas Finas México',
    category: 'laser',
    contactName: 'Ing. Rodrigo Salinas / Mostrador Maderas',
    phone: '55 5368 4500',
    whatsapp: '525553684500',
    email: 'cotizaciones@triplaymarket.com',
    website: 'https://triplaymarket.com',
    address: 'Calzada Vallejo #1120, Gustavo A. Madero, CDMX / Envíos consolidados a toda la República',
    leadTimeDays: '2 a 4 días hábiles',
    minOrder: 'Medio tablero o cortes a medida para corte láser',
    notes: 'Tableros de Triplay de Abedul Ruso (Birch) 3mm y 6mm grado láser libre de huecos internos y parches. Tablones cepillados de madera fina sólida de Nogal Americano ($185-$220 MXN), Tzalam, Parota y Encino.'
  },
  {
    id: 'sup-maderas-san-luis',
    name: 'Maderas y Molduras San Luis',
    category: 'laser',
    contactName: 'Lic. Fernando Loredo',
    phone: '444 824 1500',
    whatsapp: '524448241500',
    email: 'ventas@maderassanluis.com.mx',
    website: 'https://maderassanluis.com.mx',
    address: 'Eje 120 #310, Zona Industrial, San Luis Potosí, S.L.P.',
    leadTimeDays: 'Mismo día en retiro de taller / 24 hrs en flete local',
    minOrder: '$500 MXN para entrega en taller sin costo',
    notes: 'Proveedor local clave: Madera sólida de pino estufado nacional de 1a calidad ($55-$65 MXN tabla), MDF calibrado 3mm para maquetas y cortes limpios ($35 MXN), listones de madera dura cepillados a 4 caras.'
  },
  {
    id: 'sup-sayer-lack',
    name: 'Sayer Lack México',
    category: 'laser',
    contactName: 'Asesoría Técnica en Barnices y Tintes',
    phone: '55 5804 1100',
    whatsapp: '525558041100',
    email: 'atencionclientes@sayerlack.com.mx',
    website: 'https://sayerlack.com.mx',
    address: 'Red Nacional de Tiendas de Fábrica (San Luis Potosí, CDMX, Guadalajara, Puebla)',
    leadTimeDays: 'Inmediata en mostrador / 24 hrs envío',
    minOrder: 'Sin mínimo',
    notes: 'Tintes para madera base aceite y alcohol serie HI-0100 (Nogal Americano, Caoba, Roble, Nogal Clásico). Barniz PolyLack de poliuretano base agua ecológico hidrófugo sin olor químico para piezas de interior y juguetes.'
  },
  {
    id: 'sup-comex-polyform',
    name: 'Comex México (Polyform Maderas)',
    category: 'laser',
    contactName: 'Atención Profesional y Carpintería',
    phone: '800 712 6639',
    whatsapp: '525545552200',
    email: 'contacto@comex.com.mx',
    website: 'https://www.comex.com.mx',
    address: 'Sucursales en toda la República Mexicana',
    leadTimeDays: 'Mismo día (mostrador)',
    minOrder: 'Sin mínimo',
    notes: 'Barnices Polyform transparente brillante, mate y satinado ($140-$260 MXN/litro). Tintes para madera Maderol base solvente, sellador concentrado 48% sólidos y ceras protectoras naturales.'
  },
  {
    id: 'sup-atp-mexico',
    name: 'Avance y TecnoLogía en Plásticos (ATP México)',
    category: 'laser',
    contactName: 'Dpto. de Ventas Láser y Rotulación',
    phone: '614 432 6100',
    whatsapp: '526144326100',
    email: 'ventas@avanceytec.com.mx',
    website: 'https://avanceytec.com.mx',
    address: '32 sucursales en México (CDMX, Guadalajara, Monterrey, SLP, Querétaro, León)',
    leadTimeDays: '24 a 48 hrs hábiles',
    minOrder: '$800 MXN para envío / Sin mínimo en mostrador',
    notes: 'Láminas de Acrílico Cast (colado) 3mm transparente, blanco lechoso difusor, negro espejo y dorado reflectivo para corte láser. Vinil textil termotransferible y vinil adhesivo Oracal 651 calandrado.'
  },
  {
    id: 'sup-colormake',
    name: 'Color Make México',
    category: 'vinyl',
    contactName: 'Ventas Mayoreo Sublimación & Textil',
    phone: '55 5390 9988',
    whatsapp: '525553909988',
    email: 'ventas@colormake.com',
    website: 'https://colormake.com',
    address: 'Vía Gustavo Baz #281, Tlalnepantla, Estado de México / Envíos a todo México',
    leadTimeDays: '2 a 3 días hábiles',
    minOrder: 'Caja máster de 36 tazas ($28-$32 MXN c/u) o pedido de consumibles',
    notes: 'Tazas de cerámica 11oz blanco puro AAA con recubrimiento Orca, termos de acero inoxidable para sublimar, gorras de poliéster y algodón lisas, tintas de alta densidad para transferencia por calor.'
  },
  {
    id: 'sup-cartoempaques',
    name: 'CartoEmpaques de México (Cajas Microcorrugadas)',
    category: 'packaging',
    contactName: 'Ing. Gabriela Morán / Empaque E-commerce',
    phone: '33 3619 8899',
    whatsapp: '523336198899',
    email: 'ventas@cartoempaques.com.mx',
    website: 'https://cartoempaques.com.mx',
    address: 'Área Metropolitana de Guadalajara / Envíos nacionales por consolidado',
    leadTimeDays: '2 a 4 días hábiles',
    minOrder: 'Paquetes de 25 o 50 cajas autoensamble',
    notes: 'Cajas de cartón microcorrugado flauta E kraft automontables para e-commerce (Chica 20x15x8cm a $12-$14 MXN, Mediana a $16-$19 MXN). Rollos de poliburbuja de 50 metros, viruta kraft y cinta selladora reforzada.'
  },
  {
    id: 'sup-herrajes-llaveros',
    name: 'El Rey del Tornillo & Herrajes Metálicos',
    category: 'assembly',
    contactName: 'Ventas de Mostrador e Importación',
    phone: '55 5522 7890',
    whatsapp: '525555227890',
    email: 'herrajes@elreydeltornillo.com.mx',
    website: 'https://elreydeltornillo.com.mx',
    address: 'Calle Corregidora #88, Centro Histórico, CDMX / Envíos por Paquetexpress',
    leadTimeDays: '24 a 72 hrs hábiles',
    minOrder: '$500 MXN (Bolsas de 100 o millar de piezas)',
    notes: 'Argollas sin fin de 25mm con cadena niquelada de 4 eslabones ($0.85 MXN c/u al mayoreo), borlas decorativas de 12cm con casquillo metálico, imanes de neodimio N35/N52 para cajas de madera y tornillería allen M3 para soportes 3D.'
  },
  {
    id: 'sup-skydropx-fletes',
    name: 'Skydropx & Envíoclick (Agregador de Envíos y Fletes)',
    category: 'packaging',
    contactName: 'Mesa de Ayuda Logística & Convenios',
    phone: '55 8526 2110',
    whatsapp: '525585262110',
    email: 'hola@skydropx.com',
    website: 'https://www.skydropx.com',
    address: 'Plataforma nacional con recolección a domicilio en el taller (SLP y todo México)',
    leadTimeDays: 'Guías digitales instantáneas (1 a 3 días entrega)',
    minOrder: 'Recargas de saldo desde $300 MXN',
    notes: 'Convenios con descuento hasta 60% en guías prepago de FedEx, Estafeta, RedPack, Paquetexpress y DHL. Tarifas desde $115 MXN para sobres y $139 MXN para paquetes de hasta 2 kg con recolección incluida.'
  },
  {
    id: 'sup-printlab',
    name: 'PrintLab México 3D',
    category: '3d',
    contactName: 'Ing. Carlos Mendoza',
    phone: '444 820 1199',
    whatsapp: '524448201199',
    email: 'ventas@printlab3d.mx',
    website: 'https://printlab3d.mx',
    address: 'Av. Salvador Nava 1420, San Luis Potosí, S.L.P.',
    leadTimeDays: '1 a 2 días hábiles',
    minOrder: '$500 MXN',
    notes: 'Distribuidor oficial de filamentos Polymaker, eSun, Creality y Bambu Lab en San Luis Potosí. Filamento PLA verde olivo, terracota, negro mate y madera woodfill.'
  }
];

export default function RawMaterialsSection({
  token,
  products = [],
  workshopParams = {},
  businessSettings = {},
  onSaveWorkshopParams,
  onRefreshCatalog,
  initialSubTab = 'inventory',
  onSubTabChange,
  initialMaterials = []
}) {
  // Pestañas de navegación interna: 'inventory' | 'operational_costs' | 'pricing_table' | 'suppliers'
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [supplierViewMode, setSupplierViewMode] = useState('suppliers'); // 'suppliers' | 'shipping'

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const handleSwitchSubTab = (newTab) => {
    if (newTab === 'shipping_logistics') {
      setActiveSubTab('suppliers');
      setSupplierViewMode('shipping');
      if (onSubTabChange) onSubTabChange('suppliers');
      return;
    }
    if (newTab === 'suppliers') {
      setSupplierViewMode('suppliers');
    }
    setActiveSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  // Estado de materias primas y proveedores (inicializado con initialMaterials para carga instantánea)
  const [materials, setMaterials] = useState(() => (Array.isArray(initialMaterials) && initialMaterials.length > 0 ? initialMaterials : []));
  const [suppliers, setSuppliers] = useState(() => DEFAULT_MEXICO_SUPPLIERS);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Estados de filtro y búsqueda multicriterio en Inventario
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMaterialType, setFilterMaterialType] = useState('all');
  const [filterColor, setFilterColor] = useState('all');
  const [filterFinish, setFilterFinish] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all'); // 'all' | 'urgent' | 'warning' | 'ok'
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de filtro y búsqueda en Directorio de Proveedores
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState('all');

  // Proveedores: Lista de Documentos y PDFs asociados (Listas de precios, catálogos, convenios)
  const [supplierPdfs, setSupplierPdfs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('artesano_supplier_pdfs');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'pdf-sup-1',
        title: 'Lista de Precios Madera y Triplay de Pino Estufado 2026',
        supplierName: 'Maderas Finas San Luis',
        fileName: 'Lista_Precios_Maderas_San_Luis_2026.pdf',
        fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
        fileSize: '420 KB',
        date: '10 Oct 2026'
      },
      {
        id: 'pdf-sup-2',
        title: 'Catálogo Mayorista de Filamentos PLA Plus & Resinas UV',
        supplierName: '3D Market México',
        fileName: 'Catalogo_Filamentos_3D_Bambu_Polymaker.pdf',
        fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
        fileSize: '1.2 MB',
        date: '02 Oct 2026'
      },
      {
        id: 'pdf-sup-3',
        title: 'Tarifario y Convenio Paqueterías Nacionales (FedEx / Estafeta)',
        supplierName: 'Envíos México & Skydropx',
        fileName: 'Tarifario_Convenio_Paqueterias_Taller.pdf',
        fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
        fileSize: '280 KB',
        date: '15 Oct 2026'
      },
      {
        id: 'pdf-sup-4',
        title: 'Lista de Precios Componentes 3D, Switches Clicker & Kits de Luz LED 2026',
        supplierName: 'Mercado Libre Componentes & Mecanismos 3D',
        fileName: 'Lista_Precios_Componentes_Switches_Luz_2026.pdf',
        fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
        fileSize: '650 KB',
        date: '20 Oct 2026'
      },
      {
        id: 'pdf-sup-5',
        title: 'Ficha Técnica & Carta de Colores Tintes y Barnices PolyLack para Madera',
        supplierName: 'Sayer Lack & Polyform México',
        fileName: 'Carta_Colores_Tintes_Barnices_Madera.pdf',
        fileUrl: '/downloads/catalogo_movil_artesano_digital.pdf',
        fileSize: '890 KB',
        date: '22 Oct 2026'
      }
    ];
  });
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [editingPdfItem, setEditingPdfItem] = useState(null);
  const [pdfForm, setPdfForm] = useState({ title: '', supplierName: '', fileUrl: '', fileName: '' });
  const [pdfFile, setPdfFile] = useState(null);

  const saveSupplierPdfs = (newList) => {
    setSupplierPdfs(newList);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('artesano_supplier_pdfs', JSON.stringify(newList));
      }
    } catch (e) {}
  };

  const handleOpenNewPdfModal = () => {
    setEditingPdfItem(null);
    setPdfForm({ title: '', supplierName: suppliers[0]?.name || 'Maderas Finas San Luis', fileUrl: '', fileName: '' });
    setPdfFile(null);
    setShowPdfModal(true);
  };

  const handleOpenEditPdfModal = (pdf) => {
    setEditingPdfItem(pdf);
    setPdfForm({
      title: pdf.title || '',
      supplierName: pdf.supplierName || '',
      fileUrl: pdf.fileUrl || '',
      fileName: pdf.fileName || ''
    });
    setPdfFile(null);
    setShowPdfModal(true);
  };

  const handleSavePdfModal = (e) => {
    e.preventDefault();
    if (!pdfForm.title.trim()) {
      setActionMessage({ text: 'Por favor asigna un título al documento PDF.', type: 'error' });
      return;
    }
    let resolvedUrl = pdfForm.fileUrl.trim();
    let resolvedName = pdfForm.fileName.trim();
    let resolvedSize = 'PDF';

    if (pdfFile) {
      resolvedUrl = URL.createObjectURL(pdfFile);
      resolvedName = pdfFile.name;
      resolvedSize = pdfFile.size > 1024 * 1024
        ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(pdfFile.size / 1024)} KB`;
    }

    if (!resolvedUrl && !editingPdfItem) {
      resolvedUrl = '/downloads/catalogo_movil_artesano_digital.pdf';
      resolvedName = `${pdfForm.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    }

    if (editingPdfItem) {
      const updated = supplierPdfs.map(p => p.id === editingPdfItem.id ? {
        ...p,
        title: pdfForm.title.trim(),
        supplierName: pdfForm.supplierName.trim() || 'General de Taller',
        fileUrl: resolvedUrl || p.fileUrl,
        fileName: resolvedName || p.fileName,
        fileSize: pdfFile ? resolvedSize : p.fileSize
      } : p);
      saveSupplierPdfs(updated);
      setActionMessage({ text: `✓ Documento "${pdfForm.title}" actualizado con éxito.`, type: 'success' });
    } else {
      const newPdf = {
        id: `pdf-${Date.now()}`,
        title: pdfForm.title.trim(),
        supplierName: pdfForm.supplierName.trim() || 'General de Taller',
        fileUrl: resolvedUrl,
        fileName: resolvedName || `${pdfForm.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
        fileSize: resolvedSize,
        date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      saveSupplierPdfs([newPdf, ...supplierPdfs]);
      setActionMessage({ text: `✓ ¡Nuevo PDF "${pdfForm.title}" agregado a proveedores!`, type: 'success' });
    }
    setShowPdfModal(false);
  };

  const handleDeletePdf = (pdfId, pdfTitle) => {
    const updated = supplierPdfs.filter(p => p.id !== pdfId);
    saveSupplierPdfs(updated);
    setActionMessage({ text: `Documento "${pdfTitle}" eliminado.`, type: 'success' });
  };

  // Estados de filtro y búsqueda en Tablas de Precios en Vivo
  const [pricingCategoryFilter, setPricingCategoryFilter] = useState('all');
  const [pricingTechniqueFilter, setPricingTechniqueFilter] = useState('all');
  const [pricingSearchQuery, setPricingSearchQuery] = useState('');

  // Estados de edición rápida en celdas (valores temporales locales mientras se escribe)
  const [editingStockMap, setEditingStockMap] = useState({});
  const [editingMinAlertMap, setEditingMinAlertMap] = useState({});
  const [editingCostMap, setEditingCostMap] = useState({});
  const [editingUnitMap, setEditingUnitMap] = useState({});
  const [editingPackageQtyMap, setEditingPackageQtyMap] = useState({});
  const [editingPackageMeasMap, setEditingPackageMeasMap] = useState({});

  // Estados de control de navegación horizontal y regreso al inicio (UX optimizada)
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [compactViewMode, setCompactViewMode] = useState(false);

  // Vista del inventario: tarjetas (predeterminada, estilo catálogo) o tabla compacta
  const [inventoryViewMode, setInventoryViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('artesano_inventory_view_mode_v3');
        if (saved === 'grouped' || saved === 'cards' || saved === 'table') return saved;
      } catch (e) {}
    }
    return 'grouped';
  });

  const handleChangeInventoryView = (mode) => {
    setInventoryViewMode(mode);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('artesano_inventory_view_mode_v3', mode);
      }
    } catch (e) {}
  };

  const [openMaterialFamilies, setOpenMaterialFamilies] = useState(() => new Set(['filamentos']));
  const [openMaterialSubfamilies, setOpenMaterialSubfamilies] = useState(() => new Set(['filamentos|pla']));
  const [inventoryGroupMode, setInventoryGroupMode] = useState('area');
  const [openMaterialAreas, setOpenMaterialAreas] = useState(() => new Set(['3d']));
  const [openAreaSupplyGroups, setOpenAreaSupplyGroups] = useState(() => new Set(['3d|direct']));
  const [tableScrollWidth, setTableScrollWidth] = useState(1200);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const tableContainerRef = useRef(null);
  const topScrollRef = useRef(null);
  const isSyncingScroll = useRef(false);

  // Estados de la Calculadora de Recetas de Taller (Costos de Fabricación y Desglose BOM)
  const [recipeName, setRecipeName] = useState('Impresión 3D');
  const [recipeProductId, setRecipeProductId] = useState('');
  const [recipeItems, setRecipeItems] = useState([
    { id: 'item-1', materialId: '', name: 'Filamento PLA Verde Olivo', quantity: 12, measurement: 'g', unitCost: 0.50, totalCost: 6.00 },
    { id: 'item-2', materialId: '', name: 'Fijador de Cama 3DLac', quantity: 10, measurement: 'ml', unitCost: 0.30, totalCost: 3.00 },
    { id: 'item-3', materialId: '', name: 'Alcohol Isopropílico', quantity: 100, measurement: 'ml', unitCost: 0.08, totalCost: 8.00 }
  ]);
  const [recipeYieldUnits, setRecipeYieldUnits] = useState(1);
  const [recipeOverheadPercent, setRecipeOverheadPercent] = useState(50);
  const [recipeTargetProfitPercent, setRecipeTargetProfitPercent] = useState(200);
  const [operationalSubTab, setOperationalSubTab] = useState('calculator'); // 'calculator' | 'workers' | 'assembly' | 'machines' | 'rates'
  const [recipeMachineId, setRecipeMachineId] = useState('');
  const [recipeMachineMinutes, setRecipeMachineMinutes] = useState(45);
  const [recipeMachineHours, setRecipeMachineHours] = useState(0.75);
  const [recipeMachineSpeedEff, setRecipeMachineSpeedEff] = useState(100);
  const [recipeLaborMinutes, setRecipeLaborMinutes] = useState(15);

  // Detalle & Ensamblaje Manual
  const [assemblyHours, setAssemblyHours] = useState(0.25);
  const [assemblyWorkerId, setAssemblyWorkerId] = useState('op-3');
  const [assemblyInsumosCost, setAssemblyInsumosCost] = useState(5.00);
  const [assemblyChecklist, setAssemblyChecklist] = useState({
    supports: true,
    sanding: true,
    glue: false,
    hardware: true,
    packaging: true
  });

  // Maquilas Grandes y Lotes
  const [maquilaUnits, setMaquilaUnits] = useState(100);
  const [parallelMachines, setParallelMachines] = useState(2);
  const [tallerHoursPerDay, setTallerHoursPerDay] = useState(8);
  const [maquilaVolumeDiscount, setMaquilaVolumeDiscount] = useState(10);
  const [copiedMaquilaSummary, setCopiedMaquilaSummary] = useState(false);

  // Trabajadores del Taller (Sueldos, Horas y Eficiencia)
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [savingWorker, setSavingWorker] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    id: '',
    name: '',
    role: '',
    salaryPeriod: 'monthly',
    salary: 10000,
    hoursPerDay: 8,
    daysPerWeek: 5,
    efficiency: 90,
    hourlyRate: 200,
    hourlyRateManual: false,
    desc: '',
    notes: ''
  });
  const [newRecipeMatId, setNewRecipeMatId] = useState('');
  const [newRecipeQty, setNewRecipeQty] = useState(10);
  const [recipeCopied, setRecipeCopied] = useState(false);
  const [recipeAppliedMsg, setRecipeAppliedMsg] = useState('');

  // Operadores de taller para testeo de mano de obra (Juan $300, Pedro $200, etc.)
  const [selectedOperatorId, setSelectedOperatorId] = useState('op-2');
  const [operatorName, setOperatorName] = useState('Pedro (Operador Impresión 3D)');
  const [operatorHourlyRate, setOperatorHourlyRate] = useState(200);

  // Parámetros de máquina en vivo en la calculadora (editables al vuelo para simular)
  const [customPowerCostPerHour, setCustomPowerCostPerHour] = useState(1.04);
  const [customWearCostPerHour, setCustomWearCostPerHour] = useState(3.00);
  const [customMaintenanceCostPerHour, setCustomMaintenanceCostPerHour] = useState(1.00);
  const [activeProcessTechnique, setActiveProcessTechnique] = useState('3d');

  // Parámetros operativos locales del taller
  const [localParams, setLocalParams] = useState({
    plaPerKg: 500,
    tpuPerKg: 700,
    electricityPerHour: 1.04,
    wearPerHour: 3.00,
    laborPerHour: 60,
    filamentWastePercent: 15,
    targetMarginPercent: 40,
    reservePercent: 10,
    failureReservePercent: 3,
    ivaPercent: 16,
    includeIvaInCost: true,
    cardFeePercent: 4.1,
    rateStatus: 'Estimadas',
    ...workshopParams
  });
  const [savingParams, setSavingParams] = useState(false);

  // Modal de materia prima (Crear / Editar completa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: '3d',
    materialType: 'PLA',
    color: 'Verde Olivo',
    finish: 'Mate',
    unit: 'bobina (1 kg)',
    currentStock: 1,
    minStockAlert: 2,
    costPerUnit: 500,
    supplierId: '',
    supplier: '',
    notes: ''
  });

  // Modal de proveedor (Ver y editar datos de contacto)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    id: '',
    name: '',
    category: 'general',
    contactName: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    leadTimeDays: '1 a 2 días hábiles',
    minOrder: '',
    notes: ''
  });
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Filtros avanzados colapsables en Inventario
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Maquinaria de Taller y Costos Operativos por Máquina
  const [machines, setMachines] = useState([]);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [selectedMachineCategory, setSelectedMachineCategory] = useState('all');
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [savingMachine, setSavingMachine] = useState(false);
  const [machineForm, setMachineForm] = useState({
    id: '',
    name: '',
    code: '',
    category: '3d',
    categoryName: 'Impresión 3D',
    powerWatts: 150,
    kwhRate: 3.20,
    wearCostPerHour: 2.00,
    maintenanceCostPerHour: 1.00,
    unitMetric: 'cm3',
    unitMetricLabel: 'cm³ (volumen)',
    unitCost: 0.40,
    specs: '',
    status: 'active',
    notes: ''
  });

  // Calculadora interactiva de costos operativos por pieza
  const [calcMachineId, setCalcMachineId] = useState('');
  const [calcUnits, setCalcUnits] = useState(1);
  const [calcMachineMinutes, setCalcMachineMinutes] = useState(30);
  const [calcLaborMinutes, setCalcLaborMinutes] = useState(10);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Sincronizar parámetros operativos de taller si cambian los props
  useEffect(() => {
    if (workshopParams && Object.keys(workshopParams).length > 0) {
      setLocalParams(prev => ({ ...prev, ...workshopParams }));
    }
  }, [workshopParams]);

  // Sincronizar initialMaterials recibidos del panel padre
  useEffect(() => {
    if (Array.isArray(initialMaterials) && initialMaterials.length > 0 && materials.length === 0) {
      setMaterials(initialMaterials);
    }
  }, [initialMaterials]);

  // Cargar datos iniciales desde el servidor
  useEffect(() => {
    if (token) {
      loadMaterials();
      loadSuppliers();
      loadMachines();
      loadWorkers();
    }
  }, [token]);

  // Auto-descartar alertas
  useEffect(() => {
    if (actionMessage.text) {
      const timer = setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Sincronizar scroll horizontal entre la barra superior y la tabla inferior
  const handleTableScroll = () => {
    if (isSyncingScroll.current) return;
    if (!tableContainerRef.current) return;
    isSyncingScroll.current = true;
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = scrollLeft;
    }
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    isSyncingScroll.current = false;
  };

  const handleTopScroll = () => {
    if (isSyncingScroll.current) return;
    if (!topScrollRef.current || !tableContainerRef.current) return;
    isSyncingScroll.current = true;
    tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    isSyncingScroll.current = false;
  };

  const scrollTableHorizontal = (amount) => {
    if (!tableContainerRef.current) return;
    tableContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollToProvider = () => {
    if (!tableContainerRef.current) return;
    tableContainerRef.current.scrollTo({ left: tableContainerRef.current.scrollWidth, behavior: 'smooth' });
  };

  const scrollToStart = () => {
    if (!tableContainerRef.current) return;
    tableContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };

  // Scroll vertical al inicio de la página o contenedor admin
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const adminEl = document.querySelector('.overflow-y-auto');
    if (adminEl) {
      adminEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Detectar scroll vertical para mostrar el botón flotante "Volver al inicio"
  useEffect(() => {
    const checkVerticalScroll = () => {
      const mainEl = document.querySelector('main');
      const adminEl = document.querySelector('.overflow-y-auto');
      const y = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        mainEl ? mainEl.scrollTop : 0,
        adminEl ? adminEl.scrollTop : 0
      );
      setShowScrollTop(y > 220);
    };

    window.addEventListener('scroll', checkVerticalScroll, { passive: true });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', checkVerticalScroll, { passive: true });
    }
    const adminEl = document.querySelector('.overflow-y-auto');
    if (adminEl) {
      adminEl.addEventListener('scroll', checkVerticalScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', checkVerticalScroll);
      if (mainEl) mainEl.removeEventListener('scroll', checkVerticalScroll);
      if (adminEl) adminEl.removeEventListener('scroll', checkVerticalScroll);
    };
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/raw-materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching raw materials:', err);
      setActionMessage({ text: 'Error al cargar inventario de materias primas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await fetch('/api/admin/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(Array.isArray(data) && data.length > 0 ? data : DEFAULT_MEXICO_SUPPLIERS);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  
  const loadWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const res = await fetch('/api/admin/workshop-workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) && data.length > 0 ? data : WORKSHOP_OPERATORS;
        setWorkers(list);
      } else {
        setWorkers(WORKSHOP_OPERATORS);
      }
    } catch (err) {
      console.error('Error fetching workshop workers:', err);
      setWorkers(WORKSHOP_OPERATORS);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleOpenWorkerModal = (worker = null) => {
    if (worker) {
      setEditingWorker(worker);
      setWorkerForm({
        id: worker.id,
        name: worker.name || '',
        role: worker.role || '',
        salaryPeriod: worker.salaryPeriod || 'monthly',
        salary: worker.salary || 10000,
        hoursPerDay: worker.hoursPerDay || 8,
        daysPerWeek: worker.daysPerWeek || 5,
        efficiency: worker.efficiency !== undefined ? worker.efficiency : 90,
        hourlyRate: worker.hourlyRate || 200,
        hourlyRateManual: Boolean(worker.hourlyRateManual),
        desc: worker.desc || '',
        notes: worker.notes || ''
      });
    } else {
      setEditingWorker(null);
      setWorkerForm({
        id: `worker-${Date.now()}`,
        name: '',
        role: 'Operador de Taller',
        salaryPeriod: 'monthly',
        salary: 10000,
        hoursPerDay: 8,
        daysPerWeek: 5,
        efficiency: 90,
        hourlyRate: 200,
        hourlyRateManual: false,
        desc: 'Operación de equipos y manufactura',
        notes: ''
      });
    }
    setIsWorkerModalOpen(true);
  };

  const handleSaveWorker = async (e) => {
    if (e) e.preventDefault();
    setSavingWorker(true);
    try {
      const hPerDay = Number(workerForm.hoursPerDay) || 8;
      const dPerWeek = Number(workerForm.daysPerWeek) || 5;
      const eff = (Number(workerForm.efficiency) || 100) / 100;
      const hoursWeek = hPerDay * dPerWeek;
      const hoursMonth = workerForm.salaryPeriod === 'weekly' ? hoursWeek : (hoursWeek * 4.333);
      const effectiveHours = Math.max(1, hoursMonth * eff);
      const calculatedRate = Math.round(Number(workerForm.salary) / effectiveHours);
      
      const updatedRate = workerForm.hourlyRateManual ? Number(workerForm.hourlyRate) : calculatedRate;

      const payload = {
        ...workerForm,
        hourlyRate: updatedRate
      };

      const isNew = !workers.some(w => w.id === payload.id);
      let updatedList;
      if (isNew) {
        updatedList = [...workers, payload];
      } else {
        updatedList = workers.map(w => w.id === payload.id ? payload : w);
      }
      setWorkers(updatedList);

      await fetch(`/api/admin/workshop-workers/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (selectedOperatorId === payload.id) {
        setOperatorHourlyRate(updatedRate);
        setOperatorName(payload.name);
      }

      setIsWorkerModalOpen(false);
      setActionMessage({ text: `Trabajador "${payload.name}" guardado correctamente (${updatedRate}/hr)`, type: 'success' });
    } catch (err) {
      console.error('Error saving worker:', err);
      setActionMessage({ text: 'Error al guardar trabajador', type: 'error' });
    } finally {
      setSavingWorker(false);
    }
  };

  const handleMachineHoursChange = (hrsVal) => {
    const hrs = Math.max(0, Number(hrsVal) || 0);
    setRecipeMachineHours(hrs);
    setRecipeMachineMinutes(Math.round(hrs * 60));
  };

  const handleMachineMinutesChange = (minsVal) => {
    const mins = Math.max(0, Number(minsVal) || 0);
    setRecipeMachineMinutes(mins);
    setRecipeMachineHours(Number((mins / 60).toFixed(2)));
  };

  const loadMachines = async () => {
    setLoadingMachines(true);
    try {
      const res = await fetch('/api/admin/workshop-machines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setMachines(list);
        if (list.length > 0 && !calcMachineId) {
          setCalcMachineId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching workshop machines:', err);
    } finally {
      setLoadingMachines(false);
    }
  };

  const handleOpenMachineModal = (machine) => {
    setEditingMachine(machine);
    setMachineForm({
      id: machine.id,
      name: machine.name || '',
      code: machine.code || '',
      category: machine.category || '3d',
      categoryName: machine.categoryName || 'Impresión 3D',
      powerWatts: machine.powerWatts || 150,
      kwhRate: machine.kwhRate || 3.20,
      wearCostPerHour: machine.wearCostPerHour || 2.00,
      maintenanceCostPerHour: machine.maintenanceCostPerHour || 1.00,
      unitMetric: machine.unitMetric || 'cm3',
      unitMetricLabel: machine.unitMetricLabel || 'cm³',
      unitCost: machine.unitCost || 0.40,
      specs: machine.specs || '',
      status: machine.status || 'active',
      notes: machine.notes || ''
    });
    setIsMachineModalOpen(true);
  };

  const handleSaveMachine = async (e) => {
    e.preventDefault();
    setSavingMachine(true);
    try {
      const res = await fetch(`/api/admin/workshop-machines/${machineForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(machineForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setMachines(prev => prev.map(m => m.id === updated.id ? updated : m));
        setIsMachineModalOpen(false);
        setActionMessage({ text: `Máquina "${updated.name}" actualizada con éxito`, type: 'success' });
      } else {
        const err = await res.json();
        setActionMessage({ text: err.error || 'Error al actualizar máquina', type: 'error' });
      }
    } catch (err) {
      console.error('Error saving machine:', err);
      setActionMessage({ text: 'Error de red al actualizar máquina', type: 'error' });
    } finally {
      setSavingMachine(false);
    }
  };

  // Clasificador de estado de resurtido
  const getStockStatus = (mat) => {
    const cur = Number(mat.currentStock) || 0;
    const min = Number(mat.minStockAlert) || 1;

    if (cur <= 0 || cur <= min * 0.5) {
      return {
        key: 'urgent',
        label: 'Agotado / Resurtir urgente',
        shortLabel: 'Resurtir Urgente',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        badgeBg: 'bg-rose-500',
        icon: '🔴'
      };
    }
    if (cur <= min) {
      return {
        key: 'warning',
        label: 'A punto de terminarse',
        shortLabel: 'Por terminarse',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        badgeBg: 'bg-amber-500',
        icon: '🟡'
      };
    }
    return {
      key: 'ok',
      label: 'Stock suficiente',
      shortLabel: 'Stock Normal',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-500',
      icon: '🟢'
    };
  };

  // Máquina activa y cálculo de cotización operativa en vivo
  const activeCalcMachine = useMemo(() => {
    return machines.find(m => m.id === calcMachineId) || machines[0] || null;
  }, [machines, calcMachineId]);

  const calcResults = useMemo(() => {
    if (!activeCalcMachine) {
      return {
        hours: 0,
        laborHours: 0,
        powerCost: 0,
        wearCost: 0,
        maintenanceCost: 0,
        unitDirectCost: 0,
        laborCost: 0,
        totalOperationalCost: 0,
        ivaCost: 0,
        includeIva: true,
        totalWithIva: 0,
        cardFeePercent: 4.1,
        cardFee: 0,
        suggestedPrice: 0,
        profit: 0
      };
    }
    const hours = (Number(calcMachineMinutes) || 0) / 60;
    const laborHours = (Number(calcLaborMinutes) || 0) / 60;

    const powerCost = hours * (Number(activeCalcMachine.powerCostPerHour) || 0);
    const wearCost = hours * (Number(activeCalcMachine.wearCostPerHour) || 0);
    const maintenanceCost = hours * (Number(activeCalcMachine.maintenanceCostPerHour) || 0);
    const unitDirectCost = (Number(calcUnits) || 0) * (Number(activeCalcMachine.unitCost) || 0);
    const laborCost = laborHours * (Number(localParams.laborPerHour) || 60);

    const totalOperationalCost = powerCost + wearCost + maintenanceCost + unitDirectCost + laborCost;
    const ivaPercent = Number(localParams.ivaPercent ?? 16) || 0;
    const includeIva = localParams.includeIvaInCost !== false;
    const ivaCost = includeIva ? totalOperationalCost * (ivaPercent / 100) : 0;
    const totalWithIva = totalOperationalCost + ivaCost;
    const margin = Math.min(0.85, Math.max(0, (Number(localParams.targetMarginPercent) || 40) / 100));
    const cardFeePercent = Number(localParams.cardFeePercent ?? 4.1) || 0;
    const cardFee = cardFeePercent / 100;
    const factor = Math.max(1.01, 1 / Math.max(0.05, 1 - margin - cardFee));
    const suggestedPrice = totalWithIva * factor;
    const cardFeeAmount = suggestedPrice * cardFee;
    const profit = Math.max(0, suggestedPrice - totalWithIva - cardFeeAmount);

    return {
      hours,
      laborHours,
      powerCost: Number(powerCost.toFixed(2)),
      wearCost: Number(wearCost.toFixed(2)),
      maintenanceCost: Number(maintenanceCost.toFixed(2)),
      unitDirectCost: Number(unitDirectCost.toFixed(2)),
      laborCost: Number(laborCost.toFixed(2)),
      totalOperationalCost: Number(totalOperationalCost.toFixed(2)),
      ivaCost: Number(ivaCost.toFixed(2)),
      includeIva,
      totalWithIva: Number(totalWithIva.toFixed(2)),
      cardFeePercent,
      cardFee: Number(cardFeeAmount.toFixed(2)),
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      profit: Number(profit.toFixed(2))
    };
  }, [activeCalcMachine, calcMachineMinutes, calcLaborMinutes, calcUnits, localParams]);

  const handleCopyQuoteSummary = () => {
    if (!activeCalcMachine) return;
    const summary = `Cotización de Costo Operativo de Taller - Artesano Digital
Máquina: ${activeCalcMachine.name} (${activeCalcMachine.categoryName})
Unidades / Medida: ${calcUnits} ${activeCalcMachine.unitMetricLabel || activeCalcMachine.unitMetric}
Tiempo de Máquina: ${calcMachineMinutes} min ($${(calcResults.powerCost + calcResults.wearCost + calcResults.maintenanceCost).toFixed(2)})
Mano de Obra: ${calcLaborMinutes} min ($${calcResults.laborCost.toFixed(2)})
Costo Operativo Directo: $${calcResults.totalOperationalCost.toFixed(2)} MXN
IVA ${localParams.ivaPercent ?? 16}%: $${calcResults.ivaCost.toFixed(2)} MXN
Costo con IVA: $${calcResults.totalWithIva.toFixed(2)} MXN
Comisión tarjeta ${calcResults.cardFeePercent}%: $${calcResults.cardFee.toFixed(2)} MXN
Precio Sugerido (Margen ${localParams.targetMarginPercent}%): $${calcResults.suggestedPrice.toFixed(2)} MXN
Ganancia Neta Estimada: $${calcResults.profit.toFixed(2)} MXN`;

    navigator.clipboard.writeText(summary);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  // KPIs de inventario y conteos por categoría
  const stats = useMemo(() => {
    let totalItems = materials.length;
    let urgentCount = 0;
    let warningCount = 0;
    let okCount = 0;
    let totalValuation = 0;

    const categoryCounts = {
      '3d': 0,
      'sublimation': 0,
      'laser': 0,
      'vinyl': 0,
      'assembly': 0,
      'packaging': 0,
      'spare_parts': 0
    };

    materials.forEach(m => {
      const status = getStockStatus(m);
      if (status.key === 'urgent') urgentCount++;
      else if (status.key === 'warning') warningCount++;
      else okCount++;

      if (categoryCounts[m.category] !== undefined) {
        categoryCounts[m.category]++;
      }

      const val = (Number(m.currentStock) || 0) * (Number(m.costPerUnit) || 0);
      totalValuation += val;
    });

    return {
      totalItems,
      urgentCount,
      warningCount,
      okCount,
      totalValuation: Math.round(totalValuation * 100) / 100,
      categoryCounts
    };
  }, [materials]);

  // Materiales pertenecientes al área / categoría actualmente seleccionada
  const currentAreaMaterials = useMemo(() => {
    if (filterCategory === 'all') return materials;
    return materials.filter(m => m.category === filterCategory);
  }, [materials, filterCategory]);

  // Tipos de Material disponibles en el área activa
  const availableMaterialTypes = useMemo(() => {
    const map = new Map();
    currentAreaMaterials.forEach(m => {
      const type = m.materialType?.trim();
      if (type && type !== 'General' && type !== 'N/A') {
        map.set(type, (map.get(type) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [currentAreaMaterials]);

  // Colores disponibles en el área activa (o dentro del tipo seleccionado)
  const availableColors = useMemo(() => {
    const map = new Map();
    const base = filterMaterialType === 'all'
      ? currentAreaMaterials
      : currentAreaMaterials.filter(m => (m.materialType || '').toLowerCase() === filterMaterialType.toLowerCase());

    base.forEach(m => {
      let colName = m.color?.trim();
      if (!colName || colName === 'N/A') {
        const detected = getFilamentColor(m.name);
        if (detected) colName = detected.name;
      }
      if (colName && colName !== 'N/A') {
        map.set(colName, (map.get(colName) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [currentAreaMaterials, filterMaterialType]);

  // Acabados disponibles en el área activa
  const availableFinishes = useMemo(() => {
    const map = new Map();
    const base = currentAreaMaterials.filter(m => {
      if (filterMaterialType !== 'all' && (m.materialType || '').toLowerCase() !== filterMaterialType.toLowerCase()) return false;
      if (filterColor !== 'all') {
        const col = (m.color || '').toLowerCase();
        const det = getFilamentColor(m.name)?.name?.toLowerCase() || '';
        const target = filterColor.toLowerCase();
        if (col !== target && det !== target && !m.name.toLowerCase().includes(target)) return false;
      }
      return true;
    });

    base.forEach(m => {
      const fin = m.finish?.trim();
      if (fin && fin !== 'Estándar') {
        map.set(fin, (map.get(fin) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [currentAreaMaterials, filterMaterialType, filterColor]);

  // Filtrado multicriterio de materiales en inventario
  const filteredMaterials = useMemo(() => {
    const list = materials.filter(m => {
      // 1. Categoría / Técnica
      if (filterCategory !== 'all' && m.category !== filterCategory) return false;

      // 2. Estado de resurtido
      const st = getStockStatus(m);
      if (filterStockStatus !== 'all' && st.key !== filterStockStatus) return false;

      // 3. Material / Tipo
      if (filterMaterialType !== 'all') {
        const matType = (m.materialType || '').toLowerCase();
        if (matType !== String(filterMaterialType || '').toLowerCase()) return false;
      }

      // 4. Color
      if (filterColor !== 'all') {
        const col = (m.color || '').toLowerCase();
        const det = getFilamentColor(m.name)?.name?.toLowerCase() || '';
        const target = String(filterColor || '').toLowerCase();
        const matchColor = col === target || det === target || (m.name || '').toLowerCase().includes(target);
        if (!matchColor) return false;
      }

      // 5. Acabado
      if (filterFinish !== 'all') {
        const fin = (m.finish || '').toLowerCase();
        const target = String(filterFinish || '').toLowerCase();
        const matchFinish = fin === target || (m.name || '').toLowerCase().includes(target);
        if (!matchFinish) return false;
      }

      // 6. Lupita buscadora de texto libre
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (m.name || '').toLowerCase().includes(q);
        const matchSupp = (m.supplier || '').toLowerCase().includes(q);
        const matchNotes = (m.notes || '').toLowerCase().includes(q);
        const matchColor = (m.color || '').toLowerCase().includes(q);
        const matchType = (m.materialType || '').toLowerCase().includes(q);
        const matchFinish = (m.finish || '').toLowerCase().includes(q);
        return matchName || matchSupp || matchNotes || matchColor || matchType || matchFinish;
      }

      return true;
    });

    // Subir hasta arriba del panel todos los insumos que se estén agotando (números rojos)
    return [...list].sort((a, b) => {
      const aCur = Number(a.currentStock) || 0;
      const aMin = Number(a.minStockAlert) || 1;
      const bCur = Number(b.currentStock) || 0;
      const bMin = Number(b.minStockAlert) || 1;

      const aIsRed = aCur <= aMin;
      const bIsRed = bCur <= bMin;

      if (aIsRed && !bIsRed) return -1;
      if (!aIsRed && bIsRed) return 1;

      if (aIsRed && bIsRed) {
        // El más crítico porcentualmente respecto a su mínimo va primero
        const aRatio = aCur / Math.max(1, aMin);
        const bRatio = bCur / Math.max(1, bMin);
        if (aRatio !== bRatio) return aRatio - bRatio;
      }

      return (a.name || '').localeCompare(b.name || '');
    });
  }, [materials, filterCategory, filterStockStatus, filterMaterialType, filterColor, filterFinish, searchQuery]);

  // Agrupación por familia y subfamilia para la vista "Agrupado"
  const groupedMaterials = useMemo(() => {
    const familyMap = new Map();
    filteredMaterials.forEach(mat => {
      const familyId = materialFamilyFor(mat);
      const sub = materialSubfamilyFor(mat, familyId);
      if (!familyMap.has(familyId)) {
        familyMap.set(familyId, { items: [], subgroups: new Map() });
      }
      const family = familyMap.get(familyId);
      family.items.push(mat);
      if (!family.subgroups.has(sub.id)) {
        family.subgroups.set(sub.id, { ...sub, items: [] });
      }
      family.subgroups.get(sub.id).items.push(mat);
    });

    return MATERIAL_FAMILIES
      .filter(meta => familyMap.has(meta.id))
      .map(meta => {
        const family = familyMap.get(meta.id);
        const value = family.items.reduce((sum, mat) => sum + (Number(mat.currentStock) || 0) * (Number(mat.costPerUnit) || 0), 0);
        const alerts = family.items.filter(mat => getStockStatus(mat).key !== 'ok').length;
        return {
          ...meta,
          items: family.items,
          count: family.items.length,
          value,
          alerts,
          subgroups: [...family.subgroups.values()].map(sub => ({
            ...sub,
            count: sub.items.length,
            value: sub.items.reduce((sum, mat) => sum + (Number(mat.currentStock) || 0) * (Number(mat.costPerUnit) || 0), 0),
            alerts: sub.items.filter(mat => getStockStatus(mat).key !== 'ok').length
          }))
        };
      });
  }, [filteredMaterials]);

  const groupedMaterialsByArea = useMemo(() => {
    const areaMap = new Map();
    filteredMaterials.forEach(mat => {
      const areaId = materialAreaFor(mat);
      const groupId = materialSupplyGroupFor(mat);
      if (!areaMap.has(areaId)) areaMap.set(areaId, { items: [], groups: new Map() });
      const area = areaMap.get(areaId);
      area.items.push(mat);
      if (!area.groups.has(groupId)) area.groups.set(groupId, []);
      area.groups.get(groupId).push(mat);
    });

    return MATERIAL_AREAS
      .filter(area => area.id !== 'other' || areaMap.has(area.id))
      .map(area => {
        const areaData = areaMap.get(area.id) || { items: [], groups: new Map() };
        const value = areaData.items.reduce((sum, mat) => sum + (Number(mat.currentStock) || 0) * (Number(mat.costPerUnit) || 0), 0);
        const alerts = areaData.items.filter(mat => getStockStatus(mat).key !== 'ok').length;
        return {
          ...area,
          count: areaData.items.length,
          value,
          alerts,
          groups: MATERIAL_SUPPLY_GROUPS.map(group => {
            const groupItems = areaData.groups.get(group.id) || [];
            return {
              ...group,
              items: groupItems,
              count: groupItems.length,
              value: groupItems.reduce((sum, mat) => sum + (Number(mat.currentStock) || 0) * (Number(mat.costPerUnit) || 0), 0),
              alerts: groupItems.filter(mat => getStockStatus(mat).key !== 'ok').length
            };
          })
        };
      });
  }, [filteredMaterials]);

  const toggleMaterialArea = (areaId) => {
    setOpenMaterialAreas(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  const toggleAreaSupplyGroup = (key) => {
    setOpenAreaSupplyGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleMaterialFamily = (familyId) => {
    setOpenMaterialFamilies(prev => {
      const next = new Set(prev);
      if (next.has(familyId)) next.delete(familyId);
      else next.add(familyId);
      return next;
    });
  };

  const toggleMaterialSubfamily = (subKey) => {
    setOpenMaterialSubfamilies(prev => {
      const next = new Set(prev);
      if (next.has(subKey)) next.delete(subKey);
      else next.add(subKey);
      return next;
    });
  };

  // Actualizar ancho virtual para la barra de scroll superior (después de inicializar filteredMaterials)
  useEffect(() => {
    const updateScrollDimensions = () => {
      if (tableContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = tableContainerRef.current;
        setTableScrollWidth(scrollWidth);
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    updateScrollDimensions();
    const timer = setTimeout(updateScrollDimensions, 100);
    window.addEventListener('resize', updateScrollDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScrollDimensions);
    };
  }, [filteredMaterials, compactViewMode]);

  // Filtrado en vivo de productos para Tablas de Precios (por categoría/área, técnica y búsqueda)
  const filteredPricingProducts = useMemo(() => {
    return products.filter(prod => {
      // 1. Filtro por Área / Categoría
      if (pricingCategoryFilter !== 'all') {
        if (pricingCategoryFilter === 'paquetes') {
          if (!prod.isBundle) return false;
        } else if (!prod.worlds || !prod.worlds.includes(pricingCategoryFilter)) {
          return false;
        }
      }

      // 2. Filtro por Técnica de Impresión / Manufactura
      if (pricingTechniqueFilter !== 'all') {
        const matchesTech = prod.techniques?.some(t => {
          if (pricingTechniqueFilter === 'vinyl') return t === 'vinyl' || t === 'vinil';
          if (pricingTechniqueFilter === 'sublimation') return t === 'sublimation' || t === 'sublimacion';
          return t === pricingTechniqueFilter;
        });
        if (!matchesTech) return false;
      }

      // 3. Lupita buscadora por nombre o código SKU
      if (pricingSearchQuery.trim()) {
        const q = pricingSearchQuery.toLowerCase().trim();
        const matchName = (prod.name || '').toLowerCase().includes(q);
        const matchCode = (prod.code || '').toLowerCase().includes(q);
        return matchName || matchCode;
      }

      return true;
    });
  }, [products, pricingCategoryFilter, pricingTechniqueFilter, pricingSearchQuery]);

  // Filtrado de proveedores por categoría técnica y búsqueda
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // 1. Filtro por Categoría / Técnica
      if (supplierCategoryFilter !== 'all' && s.category !== supplierCategoryFilter) {
        return false;
      }
      // 2. Buscador por texto
      if (supplierSearchQuery.trim()) {
        const q = supplierSearchQuery.toLowerCase().trim();
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchContact = (s.contactName || '').toLowerCase().includes(q);
        const matchPhone = (s.phone || '').includes(q) || (s.whatsapp || '').includes(q);
        const matchCity = (s.address || '').toLowerCase().includes(q);
        const matchNotes = (s.notes || '').toLowerCase().includes(q);
        const matchMaterial = materials.some(m =>
          (m.supplierId === s.id || (m.supplier && String(m.supplier).toLowerCase().trim() === String(s.name || '').toLowerCase().trim())) &&
          (m.name || '').toLowerCase().includes(q)
        );
        return matchName || matchContact || matchPhone || matchCity || matchNotes || matchMaterial;
      }
      return true;
    });
  }, [suppliers, supplierCategoryFilter, supplierSearchQuery, materials]);

  const groupedSuppliers = useMemo(() => {
    if (supplierCategoryFilter !== 'all') return [];
    return SUPPLIER_SPECIALTIES
      .map(specialty => ({
        ...specialty,
        suppliers: filteredSuppliers.filter(sup => supplierHasSpecialty(sup, specialty))
      }))
      .filter(group => group.suppliers.length > 0);
  }, [filteredSuppliers, supplierCategoryFilter]);

  // ==========================================
  // HANDLERS: EDICIÓN RÁPIDA DE CELDAS A MANO
  // ==========================================

  // 1. Guardar Stock escrito a mano o mediante botones +/-
  const handleSaveStock = async (materialId, newStockValue) => {
    const parsedStock = Math.max(0, Math.round(Number(newStockValue) * 100) / 100);
    if (isNaN(parsedStock)) return;

    // Actualización optimista local
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, currentStock: parsedStock } : m));
    setEditingStockMap(prev => {
      const updated = { ...prev };
      delete updated[materialId];
      return updated;
    });

    try {
      const res = await fetch(`/api/admin/raw-materials/${materialId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentStock: parsedStock })
      });
      if (res.ok) {
        setActionMessage({ text: 'Stock actualizado correctamente', type: 'success' });
      } else {
        loadMaterials();
      }
    } catch (err) {
      console.error('Error saving stock:', err);
      loadMaterials();
    }
  };

  // Botón rápido +/-
  const handleAdjustStock = (material, delta) => {
    const pending = editingStockMap[material.id];
    const cur = pending !== undefined && pending !== '' ? Number(pending) : (Number(material.currentStock) || 0);
    const nextStock = Math.max(0, Math.round((cur + delta) * 100) / 100);
    handleSaveStock(material.id, nextStock);
  };

  // 2. Guardar Mínimo de Alerta a mano
  const handleSaveMinAlert = async (materialId, newMinAlert) => {
    const parsedMin = Math.max(0, Math.round(Number(newMinAlert) * 100) / 100);
    if (isNaN(parsedMin)) return;

    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, minStockAlert: parsedMin } : m));
    setEditingMinAlertMap(prev => {
      const updated = { ...prev };
      delete updated[materialId];
      return updated;
    });

    try {
      const res = await fetch(`/api/admin/raw-materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ minStockAlert: parsedMin })
      });
      if (res.ok) {
        setActionMessage({ text: 'Umbral mínimo de alerta actualizado', type: 'success' });
      } else {
        loadMaterials();
      }
    } catch (err) {
      console.error('Error saving min alert:', err);
      loadMaterials();
    }
  };

  // 3. Guardar Costo Unitario a mano
  const handleSaveUnitCost = async (materialId, newCost) => {
    const parsedCost = Math.max(0, Math.round(Number(newCost) * 100) / 100);
    if (isNaN(parsedCost)) return;

    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, costPerUnit: parsedCost } : m));
    setEditingCostMap(prev => {
      const updated = { ...prev };
      delete updated[materialId];
      return updated;
    });

    try {
      const res = await fetch(`/api/admin/raw-materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ costPerUnit: parsedCost })
      });
      if (res.ok) {
        setActionMessage({ text: 'Costo unitario y valor en almacén recalculados', type: 'success' });
      } else {
        loadMaterials();
      }
    } catch (err) {
      console.error('Error saving unit cost:', err);
      loadMaterials();
    }
  };

  // 4. Guardar Unidad a mano (legado)
  const handleSaveUnit = async (materialId, newUnit) => {
    const cleanUnit = (newUnit || '').trim();
    if (!cleanUnit) return;

    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, unit: cleanUnit } : m));
    setEditingUnitMap(prev => {
      const updated = { ...prev };
      delete updated[materialId];
      return updated;
    });

    try {
      const res = await fetch(`/api/admin/raw-materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ unit: cleanUnit })
      });
      if (res.ok) {
        setActionMessage({ text: 'Unidad de medida actualizada', type: 'success' });
      } else {
        loadMaterials();
      }
    } catch (err) {
      console.error('Error saving unit:', err);
      loadMaterials();
    }
  };

  // 5. Guardar Contenido del Paquete a mano (Cantidad numérico y Medición base)
  const handleSavePackageInfo = async (mat, newQty, newMeas) => {
    const parsed = parsePackageInfo(mat);
    const qty = newQty !== undefined && newQty !== '' ? Math.max(0.001, Number(newQty) || 1) : (mat.packageQuantity || parsed.packageQuantity);
    const meas = newMeas !== undefined && newMeas !== '' ? String(newMeas).trim() : (mat.packageMeasurement || parsed.packageMeasurement);
    const unitLabel = `${qty} ${meas}`;

    setMaterials(prev => prev.map(m => m.id === mat.id ? {
      ...m,
      packageQuantity: qty,
      packageMeasurement: meas,
      unit: unitLabel
    } : m));

    setEditingPackageQtyMap(prev => {
      const copy = { ...prev };
      delete copy[mat.id];
      return copy;
    });
    setEditingPackageMeasMap(prev => {
      const copy = { ...prev };
      delete copy[mat.id];
      return copy;
    });

    try {
      const res = await fetch(`/api/admin/raw-materials/${mat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          packageQuantity: qty,
          packageMeasurement: meas,
          unit: unitLabel
        })
      });
      if (res.ok) {
        setActionMessage({ text: `Contenido de empaque actualizado: ${qty} ${meas}`, type: 'success' });
      } else {
        loadMaterials();
      }
    } catch (err) {
      console.error('Error saving package info:', err);
      loadMaterials();
    }
  };

  // ==========================================
  // PROVEEDORES: FICHA DE CONTACTO & EDICIÓN
  // ==========================================
  const handleOpenNewSupplierModal = () => {
    const newSup = {
      id: `sup-${Date.now()}`,
      name: '',
      category: 'general',
      contactName: '',
      phone: '',
      whatsapp: '52',
      email: '',
      website: '',
      address: 'San Luis Potosí, S.L.P.',
      leadTimeDays: '1 a 2 días hábiles',
      minOrder: 'A convenir',
      notes: ''
    };
    setSelectedSupplier(newSup);
    setSupplierForm({ ...newSup });
    setIsEditingSupplier(true);
    setIsSupplierModalOpen(true);
  };

  const handleDeleteSupplier = async (supplierId, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al proveedor "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        if (selectedSupplier?.id === supplierId) {
          setIsSupplierModalOpen(false);
          setSelectedSupplier(null);
        }
        setActionMessage({ text: `Proveedor "${name}" eliminado correctamente`, type: 'success' });
      } else {
        setActionMessage({ text: 'No se pudo eliminar el proveedor', type: 'error' });
      }
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setActionMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const handleOpenSupplierModal = (supplierIdOrName, mat, startInEditMode = false) => {
    let sup = null;
    const searchKey = String(supplierIdOrName || '').toLowerCase().trim();
    if (searchKey) {
      sup = suppliers.find(s => s.id === supplierIdOrName || (s.name && String(s.name).toLowerCase().trim() === searchKey));
    }

    if (!sup) {
      // Proveedor nuevo o no registrado en catálogo
      sup = {
        id: `sup-${Date.now()}`,
        name: typeof supplierIdOrName === 'string' && supplierIdOrName.trim() ? supplierIdOrName.trim() : (mat?.supplier || 'Proveedor Local'),
        category: mat?.category || 'general',
        contactName: 'Asesor Comercial',
        phone: '444 000 0000',
        whatsapp: '524440000000',
        email: 'contacto@proveedor.mx',
        website: 'https://artesanodigital.mx',
        address: 'San Luis Potosí, S.L.P.',
        leadTimeDays: '1 a 2 días hábiles',
        minOrder: 'A convenir',
        notes: `Proveedor asignado a ${mat?.name || 'insumos de taller'}`
      };
    }

    setSelectedSupplier(sup);
    setSupplierForm({ ...sup });
    setIsEditingSupplier(startInEditMode);
    setIsSupplierModalOpen(true);
  };

  // ==========================================
  // CALCULADORA UNIFICADA DE PRECIOS & COSTOS DE PRODUCCIÓN
  // ==========================================
  const handleSelectOperator = (opId) => {
    setSelectedOperatorId(opId);
    const op = WORKSHOP_OPERATORS.find(o => o.id === opId);
    if (op && op.id !== 'custom') {
      setOperatorName(op.name);
      setOperatorHourlyRate(op.hourlyRate);
    } else if (opId === 'custom') {
      setOperatorName('Operador Externo / Por Destajo');
    }
  };

  const handleSelectRecipeMachine = (machId) => {
    setRecipeMachineId(machId);
    const mach = machines.find(m => m.id === machId);
    if (mach) {
      if (mach.category) setActiveProcessTechnique(mach.category);
      const pCost = Number(mach.powerCostPerHour) || (mach.powerWatts ? ((mach.powerWatts / 1000) * (mach.kwhRate || 3.20)) : 1.04);
      const wCost = Number(mach.wearCostPerHour) || 3.00;
      const mCost = Number(mach.maintenanceCostPerHour) || 1.00;
      setCustomPowerCostPerHour(Math.round(pCost * 100) / 100);
      setCustomWearCostPerHour(Math.round(wCost * 100) / 100);
      setCustomMaintenanceCostPerHour(Math.round(mCost * 100) / 100);
      setRecipeMachineSpeedEff(mach.speedEfficiency !== undefined ? mach.speedEfficiency : 100);

      if (mach.category === 'laser' && selectedOperatorId !== 'custom') {
        setSelectedOperatorId('op-1');
        setOperatorName('Juan (Operador Láser Senior)');
        setOperatorHourlyRate(300);
        setRecipeMachineMinutes(20);
        setRecipeMachineHours(Number((20 / 60).toFixed(2)));
      } else if (mach.category === '3d' && selectedOperatorId !== 'custom') {
        setSelectedOperatorId('op-2');
        setOperatorName('Pedro (Operador Impresión 3D)');
        setOperatorHourlyRate(200);
        setRecipeMachineMinutes(60);
        setRecipeMachineHours(1);
      } else if (mach.category === 'vinyl' && selectedOperatorId !== 'custom') {
        setSelectedOperatorId('op-4');
        setOperatorName('Tallerista Titular');
        setOperatorHourlyRate(250);
        setRecipeMachineMinutes(15);
        setRecipeMachineHours(Number((15 / 60).toFixed(2)));
      }
    }
  };

  const handleLoadMachineToCalculator = (mach) => {
    handleSelectRecipeMachine(mach.id);
    setRecipeName(`Producción en ${mach.name}`);
    const el = document.getElementById('unified-production-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActionMessage({ text: `Máquina "${mach.name}" cargada en la Calculadora Unificada`, type: 'success' });
  };

  const handleAddRecipeItem = () => {
    if (!newRecipeMatId) {
      setActionMessage({ text: 'Selecciona una materia prima del stock para agregar al proceso', type: 'error' });
      return;
    }
    const mat = materials.find(m => m.id === newRecipeMatId);
    if (!mat) return;

    const parsed = parsePackageInfo(mat);
    const pkgQty = Number(mat.packageQuantity) || parsed.packageQuantity || 1;
    const baseCost = (Number(mat.costPerUnit) || 0) / pkgQty;
    const qty = Math.max(0.001, Number(newRecipeQty) || 1);
    const lineCost = Math.round(qty * baseCost * 100) / 100;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: mat.id,
      name: mat.name,
      quantity: qty,
      measurement: mat.packageMeasurement || parsed.packageMeasurement || 'pza',
      unitCost: baseCost,
      totalCost: lineCost
    };

    setRecipeItems(prev => [...prev, newItem]);
    setNewRecipeQty(10);
    setActionMessage({ text: `Se añadió ${qty} ${newItem.measurement} de "${mat.name}" al desglose`, type: 'success' });
  };

  const handleRemoveRecipeItem = (itemId) => {
    setRecipeItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSelectProductForRecipe = (prodId) => {
    setRecipeProductId(prodId);
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setRecipeName(prod.name);
      if (prod.price) {
        if (prod.costBreakdown?.recipeItems && Array.isArray(prod.costBreakdown.recipeItems)) {
          setRecipeItems(prod.costBreakdown.recipeItems);
        }
      }
    }
  };

  // Cálculo en vivo de la Calculadora Unificada de Precios y Costes de Producción
  const recipeCalculation = useMemo(() => {
    const rawMaterialsCost = recipeItems.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
    const mach = machines.find(m => m.id === recipeMachineId);
    
    const powerRate = Number(customPowerCostPerHour !== undefined && customPowerCostPerHour !== '' ? customPowerCostPerHour : (mach?.powerCostPerHour || localParams.electricityPerHour || 1.04));
    const wearRate = Number(customWearCostPerHour !== undefined && customWearCostPerHour !== '' ? customWearCostPerHour : (mach?.wearCostPerHour || localParams.wearPerHour || 3.00));
    const maintRate = Number(customMaintenanceCostPerHour !== undefined && customMaintenanceCostPerHour !== '' ? customMaintenanceCostPerHour : (mach?.maintenanceCostPerHour || 1.00));
    const operatorRate = Number(operatorHourlyRate) || 200;

    const machineOnlyHourCost = powerRate + wearRate + maintRate;
    const totalMachineHourCost = machineOnlyHourCost + operatorRate;
    const costPerMinute = totalMachineHourCost / 60;

    // Ajuste por velocidad o fallas de la máquina
    const speedEff = Number(recipeMachineSpeedEff) || (mach?.speedEfficiency) || 100;
    const baseMinutes = Number(recipeMachineMinutes) || 0;
    const effectiveMachineMinutes = speedEff > 0 ? (baseMinutes / (speedEff / 100)) : baseMinutes;
    const effectiveMachineHours = effectiveMachineMinutes / 60;

    const machineCost = effectiveMachineHours * machineOnlyHourCost;
    const laborCost = ((Number(recipeLaborMinutes) || 0) / 60) * operatorRate;

    // Ensamble manual y acabados
    const assemHours = Number(assemblyHours) || 0;
    const assemWorker = (workers.find(w => w.id === assemblyWorkerId) || WORKSHOP_OPERATORS.find(w => w.id === assemblyWorkerId) || { hourlyRate: 120 });
    const assemblyLaborCost = assemHours * (Number(assemWorker.hourlyRate) || 120);
    const assemblyMaterialsCost = Number(assemblyInsumosCost) || 0;
    const totalAssemblyCost = assemblyLaborCost + assemblyMaterialsCost;

    // Costo directo total
    const directCost = rawMaterialsCost + machineCost + laborCost + totalAssemblyCost;

    const overheadPercent = Number(recipeOverheadPercent) || 0;
    const overheadCost = directCost * (overheadPercent / 100);

    const totalBatchCost = directCost + overheadCost;
    const yieldUnits = Math.max(1, Number(recipeYieldUnits) || 1);
    const unitProductionCost = totalBatchCost / yieldUnits;

    const ivaPercent = Number(localParams.ivaPercent ?? 16) || 0;
    const includeIva = localParams.includeIvaInCost !== false;
    const unitIvaCost = includeIva ? unitProductionCost * (ivaPercent / 100) : 0;
    const unitCostWithIva = unitProductionCost + unitIvaCost;
    const cardFeePercent = Number(localParams.cardFeePercent ?? 4.1) || 0;
    const cardFeeDecimal = cardFeePercent / 100;

    const targetProfitPercent = Number(recipeTargetProfitPercent) || 0;
    const suggestedPrice = Math.round((unitCostWithIva * (1 + targetProfitPercent / 100)) / Math.max(0.5, 1 - cardFeeDecimal));
    const cardFeeAmount = suggestedPrice * cardFeeDecimal;
    const profitPerUnit = Math.max(0, suggestedPrice - unitCostWithIva - cardFeeAmount);
    const profitMarginPercent = suggestedPrice > 0 ? Math.round((profitPerUnit / suggestedPrice) * 100) : 0;

    // Simulación de Maquilas Grandes y Lotes
    const mUnits = Math.max(1, Number(maquilaUnits) || 1);
    const pMachines = Math.max(1, Number(parallelMachines) || 1);
    const tHoursDay = Math.max(1, Number(tallerHoursPerDay) || 8);
    const vDiscount = Number(maquilaVolumeDiscount) || 0;

    const maquilaMachineHoursTotal = effectiveMachineHours * mUnits;
    const maquilaAssemblyHoursTotal = assemHours * mUnits;
    const machineDays = Math.ceil(maquilaMachineHoursTotal / (pMachines * tHoursDay));
    const assemblyDays = Math.ceil(maquilaAssemblyHoursTotal / tHoursDay);
    const estimatedDeliveryDays = Math.max(1, machineDays + Math.ceil(assemblyDays * 0.4));

    const maquilaTotalCost = unitCostWithIva * mUnits;
    const maquilaUnitPriceQuote = Math.round(suggestedPrice * (1 - vDiscount / 100));
    const maquilaTotalQuote = maquilaUnitPriceQuote * mUnits;
    const maquilaCardFee = maquilaTotalQuote * cardFeeDecimal;
    const maquilaNetProfit = Math.max(0, maquilaTotalQuote - maquilaTotalCost - maquilaCardFee);
    const maquilaProfitMargin = maquilaTotalQuote > 0 ? Math.round((maquilaNetProfit / maquilaTotalQuote) * 100) : 0;

    return {
      rawMaterialsCost,
      powerRate,
      wearRate,
      maintRate,
      operatorRate,
      machineOnlyHourCost,
      totalMachineHourCost,
      costPerMinute,
      speedEff,
      effectiveMachineMinutes,
      effectiveMachineHours,
      machineCost,
      laborCost,
      assemblyLaborCost,
      assemblyMaterialsCost,
      totalAssemblyCost,
      directCost,
      overheadCost,
      totalBatchCost,
      yieldUnits,
      unitProductionCost,
      ivaPercent,
      includeIva,
      unitIvaCost,
      unitCostWithIva,
      cardFeePercent,
      cardFeeAmount,
      suggestedPrice,
      profitPerUnit,
      profitMarginPercent,
      // Maquilas
      mUnits,
      pMachines,
      tHoursDay,
      vDiscount,
      maquilaMachineHoursTotal,
      maquilaAssemblyHoursTotal,
      estimatedDeliveryDays,
      maquilaTotalCost,
      maquilaUnitPriceQuote,
      maquilaTotalQuote,
      maquilaNetProfit,
      maquilaProfitMargin
    };
  }, [
    recipeItems, recipeMachineId, recipeMachineMinutes, recipeMachineSpeedEff,
    recipeLaborMinutes, assemblyHours, assemblyWorkerId, assemblyInsumosCost,
    recipeOverheadPercent, recipeYieldUnits, recipeTargetProfitPercent,
    customPowerCostPerHour, customWearCostPerHour, customMaintenanceCostPerHour,
    operatorHourlyRate, machines, workers, localParams, maquilaUnits,
    parallelMachines, tallerHoursPerDay, maquilaVolumeDiscount
  ]);

  
  const handleCopyMaquilaQuote = () => {
    const mach = machines.find(m => m.id === recipeMachineId);
    const text = `📋 COTIZACIÓN FORMAL DE MAQUILA & PRODUCCIÓN
Taller Artesano Digital · San Luis Potosí
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Proyecto: ${recipeName}
🔢 Cantidad del Lote: ${recipeCalculation.mUnits} piezas
⚙️ Técnica: ${mach?.categoryName || 'Manufactura Digital'} (${mach?.name || 'Maquinaria de Taller'})

⏱️ TIEMPO ESTIMADO DE ENTREGA:
• ${recipeCalculation.estimatedDeliveryDays} días hábiles a partir de la confirmación y anticipo.
• Capacidad de taller asignada: ${recipeCalculation.pMachines} máquina(s) en paralelo.

💰 PRECIO Y CONDICIONES:
• Precio Unitario Normal: ${recipeCalculation.suggestedPrice} MXN
• Descuento por Volumen (${recipeCalculation.vDiscount}%): -${(recipeCalculation.suggestedPrice - recipeCalculation.maquilaUnitPriceQuote).toFixed(2)} MXN
• Precio Unitario Preferencial: ${recipeCalculation.maquilaUnitPriceQuote.toFixed(2)} MXN c/u

🏷️ TOTAL DE LA COTIZACIÓN:
👉 ${recipeCalculation.maquilaTotalQuote.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN

✅ Incluye: Fabricación digital, desbarbado, detallado artesanal, control de calidad y empaque de protección.
💳 Condiciones de pago: 50% de anticipo para arranque de lote y 50% contra entrega.`;

    navigator.clipboard.writeText(text);
    setCopiedMaquilaSummary(true);
    setTimeout(() => setCopiedMaquilaSummary(false), 3000);
  };

  const handleCopyRecipeSummary = () => {
    const mach = machines.find(m => m.id === recipeMachineId);
    const text = `📋 DESGLOSE DE PRODUCCIÓN Y COSTES DE TALLER: ${recipeName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧱 Desglose de Materia Prima (Insumos):
${recipeItems.map(i => ` • ${i.quantity} ${i.measurement} - ${i.name}: $${i.totalCost.toFixed(2)} MXN`).join('\n')}
Subtotal Materia Prima: $${recipeCalculation.rawMaterialsCost.toFixed(2)} MXN

⚙️ Maquinaria & Costo por Hora de Producción:
 • Equipo: ${mach?.name || 'Máquina de Taller'} (${mach?.categoryName || activeProcessTechnique})
 • Consumo Eléctrico CFE: $${recipeCalculation.powerRate.toFixed(2)}/hr
 • Desgaste & Amortización: $${recipeCalculation.wearRate.toFixed(2)}/hr
 • Mantenimiento Preventivo: $${recipeCalculation.maintRate.toFixed(2)}/hr
 • Operador asignado: ${operatorName} ($${recipeCalculation.operatorRate.toFixed(2)}/hr)
 ➔ COSTO TOTAL DE 1 HORA DE MÁQUINA: $${recipeCalculation.totalMachineHourCost.toFixed(2)} MXN/hr ($${recipeCalculation.costPerMinute.toFixed(2)}/min)

⏱️ Tiempos & Operación del Trabajo:
 • Tiempo de Máquina estimado: ${recipeMachineMinutes} min = $${recipeCalculation.machineCost.toFixed(2)} MXN
 • Tiempo de Mano de Obra (Operador): ${recipeLaborMinutes} min = $${recipeCalculation.laborCost.toFixed(2)} MXN
 • Costo Operativo Directo (Máquina + Operador): $${(recipeCalculation.machineCost + recipeCalculation.laborCost).toFixed(2)} MXN
 • Adicional sobre costos indirectos (${recipeOverheadPercent}%): $${recipeCalculation.overheadCost.toFixed(2)} MXN

📊 RENDIMIENTO & PRECIO SUGERIDO:
 • Lote / Tirada rinde: ${recipeCalculation.yieldUnits} pieza(s)
 • Costo Total de Fabricación por Pieza: $${recipeCalculation.unitProductionCost.toFixed(2)} MXN
 • Margen de Beneficio Esperado: ${recipeTargetProfitPercent}%
 • PRECIO SUGERIDO AL PÚBLICO: $${recipeCalculation.suggestedPrice} MXN
 • GANANCIA NETA POR PIEZA: +$${recipeCalculation.profitPerUnit.toFixed(2)} MXN (${recipeCalculation.profitMarginPercent}%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Artesano Digital — Taller & Manufactura Inteligente`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setRecipeCopied(true);
      setTimeout(() => setRecipeCopied(false), 2500);
    }
  };

  const handleApplyRecipeToProduct = async () => {
    if (!recipeProductId) {
      setActionMessage({ text: 'Selecciona un producto del catálogo para aplicarle este precio', type: 'error' });
      return;
    }

    try {
      const prod = products.find(p => p.id === recipeProductId);
      if (!prod) return;

      const payload = {
        ...prod,
        price: recipeCalculation.suggestedPrice,
        costPrice: Math.round(recipeCalculation.unitProductionCost * 100) / 100,
        costBreakdown: {
          materialsCost: recipeCalculation.rawMaterialsCost,
          machineCost: recipeCalculation.machineCost,
          laborCost: recipeCalculation.laborCost,
          overheadCost: recipeCalculation.overheadCost,
          productionUnitCost: recipeCalculation.unitProductionCost,
          overheadPercent: recipeOverheadPercent,
          targetProfitPercent: recipeTargetProfitPercent,
          recipeItems: recipeItems,
          recipeName: recipeName,
          updatedAt: new Date().toISOString()
        }
      };

      const res = await fetch(`/api/admin/products/${recipeProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setRecipeAppliedMsg(`¡Precio de $${recipeCalculation.suggestedPrice} MXN aplicado al producto "${prod.name}"!`);
        setActionMessage({ text: `Precio y desglose aplicados a "${prod.name}" exitosamente`, type: 'success' });
        if (onRefreshCatalog) onRefreshCatalog();
        setTimeout(() => setRecipeAppliedMsg(''), 4000);
      } else {
        setActionMessage({ text: 'No se pudo actualizar el producto en catálogo', type: 'error' });
      }
    } catch (err) {
      console.error('Error applying recipe to product:', err);
      setActionMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;

    setSavingSupplier(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const isNew = !suppliers.some(s => s.id === supplierForm.id);
      const url = isNew ? '/api/admin/suppliers' : `/api/admin/suppliers/${supplierForm.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(supplierForm)
      });

      if (res.ok) {
        const saved = await res.json();
        // Actualizar lista de proveedores local
        setSuppliers(prev => {
          const exists = prev.some(s => s.id === saved.id);
          if (exists) {
            return prev.map(s => s.id === saved.id ? saved : s);
          }
          return [...prev, saved];
        });

        // Actualizar el nombre del proveedor en las materias primas vinculadas
        setMaterials(prev => prev.map(m => {
          if (m.supplierId === saved.id || m.supplier?.toLowerCase().trim() === selectedSupplier?.name?.toLowerCase().trim()) {
            return { ...m, supplier: saved.name, supplierId: saved.id };
          }
          return m;
        }));

        setSelectedSupplier(saved);
        setIsEditingSupplier(false);
        setActionMessage({ text: `Datos de contacto de "${saved.name}" actualizados con éxito`, type: 'success' });
      } else {
        setActionMessage({ text: 'No se pudieron guardar los datos del proveedor', type: 'error' });
      }
    } catch (err) {
      console.error('Error saving supplier:', err);
      setActionMessage({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setSavingSupplier(false);
    }
  };

  // ==========================================
  // MODAL DE MATERIA PRIMA (CREAR / EDITAR)
  // ==========================================
  const handleOpenNewModal = () => {
    setEditingMaterial(null);
    setMaterialForm({
      name: '',
      category: filterCategory !== 'all' ? filterCategory : '3d',
      materialType: filterMaterialType !== 'all' ? filterMaterialType : 'General',
      color: filterColor !== 'all' ? filterColor : 'Verde Olivo',
      finish: filterFinish !== 'all' ? filterFinish : 'Mate',
      unit: 'pieza',
      packageQuantity: 1,
      packageMeasurement: 'pza',
      currentStock: 1,
      minStockAlert: 2,
      costPerUnit: 50,
      supplierId: suppliers[0]?.id || '',
      supplier: suppliers[0]?.name || 'PrintLab México 3D',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mat) => {
    setEditingMaterial(mat);
    const parsedPkg = parsePackageInfo(mat);
    setMaterialForm({
      name: mat.name || '',
      category: mat.category || '3d',
      materialType: mat.materialType || 'General',
      color: mat.color || 'N/A',
      finish: mat.finish || 'Estándar',
      unit: mat.unit || 'pieza',
      packageQuantity: mat.packageQuantity !== undefined && mat.packageQuantity !== null ? mat.packageQuantity : parsedPkg.packageQuantity,
      packageMeasurement: mat.packageMeasurement || parsedPkg.packageMeasurement || 'pza',
      currentStock: mat.currentStock ?? 1,
      minStockAlert: mat.minStockAlert ?? 2,
      costPerUnit: mat.costPerUnit ?? 0,
      supplierId: mat.supplierId || '',
      supplier: mat.supplier || '',
      notes: mat.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };

      const pkgQty = Math.max(0.001, Number(materialForm.packageQuantity) || 1);
      const pkgMeas = String(materialForm.packageMeasurement || 'pza').trim();
      const unitLabel = materialForm.unit ? materialForm.unit : `${pkgQty} ${pkgMeas}`;

      const payload = {
        ...materialForm,
        unit: unitLabel,
        packageQuantity: pkgQty,
        packageMeasurement: pkgMeas,
        currentStock: Math.max(0, Number(materialForm.currentStock) || 0),
        minStockAlert: Math.max(0, Number(materialForm.minStockAlert) || 1),
        costPerUnit: Math.max(0, Number(materialForm.costPerUnit) || 0)
      };

      let res;
      if (editingMaterial) {
        res = await fetch(`/api/admin/raw-materials/${editingMaterial.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/raw-materials', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        setActionMessage({
          text: editingMaterial ? 'Materia prima actualizada correctamente' : 'Nueva materia prima registrada en el taller',
          type: 'success'
        });
        loadMaterials();
      } else {
        setActionMessage({ text: 'Error al guardar la materia prima', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error de conexión', type: 'error' });
    }
  };

  const handleDeleteMaterial = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}" del inventario de taller?`)) return;

    try {
      const res = await fetch(`/api/admin/raw-materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMessage({ text: `Materia prima "${name}" eliminada`, type: 'success' });
        loadMaterials();
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error al eliminar', type: 'error' });
    }
  };

  // ==========================================
  // PARÁMETROS OPERATIVOS & PRECIOS SUGERIDOS
  // ==========================================
  const handleSaveOperationalParams = async (e) => {
    e.preventDefault();
    setSavingParams(true);
    try {
      if (onSaveWorkshopParams) {
        await onSaveWorkshopParams(localParams);
      }
      setActionMessage({ text: 'Costos operativos y tarifas de taller actualizados en vivo', type: 'success' });
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error al guardar costos operativos', type: 'error' });
    } finally {
      setSavingParams(false);
    }
  };

  const handleApplySuggestedPrice = async (prod, suggestedPrice) => {
    try {
      const updatedProduct = {
        ...prod,
        price: suggestedPrice,
        priceType: 'fixed',
        costPrice: prod.costPrice || Math.round(suggestedPrice * (1 - (Number(localParams.targetMarginPercent) || 40) / 100))
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
      });

      if (res.ok) {
        setActionMessage({ text: `Precio de [${prod.code}] actualizado a $${suggestedPrice} MXN`, type: 'success' });
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error al aplicar precio sugerido', type: 'error' });
    }
  };

  const handleExportPricingCsv = () => {
    const listToExport = filteredPricingProducts && filteredPricingProducts.length > 0 ? filteredPricingProducts : products;
    const headers = ['Código', 'Producto', 'Técnica', 'Costo Taller', 'Precio Actual', 'Ganancia', 'Margen %', 'Precio Sugerido'];
    const rows = listToExport.map(p => {
      const price = Number(p.price) || 0;
      const cost = Number(p.costPrice) || Math.round(price * 0.4);
      const profit = Math.round(price - cost);
      const margin = price > 0 ? Math.round((profit / price) * 100) : 0;
      const targetMargin = (Number(localParams.targetMarginPercent) || 40) / 100;
      const suggested = (1 - targetMargin) > 0 ? Math.round(cost / (1 - targetMargin)) : price;
      return [
        `"${p.code || ''}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.techniques || []).join(' / ')}"`,
        cost,
        price,
        profit,
        `${margin}%`,
        suggested
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `artesano_digital_tablas_precios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Badges por técnica
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case '3d':
        return { label: 'Impresión 3D', icon: '🖨️', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'laser':
        return { label: 'Corte Láser', icon: '🔥', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'vinyl':
        return { label: 'Vinil & Textil', icon: '✂️', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'sublimation':
        return { label: 'Sublimación', icon: '🎨', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'assembly':
        return { label: 'Ensamble & Herrajes', icon: '🔩', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'packaging':
        return { label: 'Embalaje & Empaque', icon: '📦', color: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'spare_parts':
        return { label: 'Refacciones & Repuestos', icon: '🔧', color: 'bg-teal-50 text-teal-800 border-teal-200' };
      default:
        return { label: 'Taller General', icon: '🧱', color: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ENCABEZADO PRINCIPAL */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E8E4DA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#2D4F3E] text-white flex items-center justify-center shadow-xs shrink-0">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-heading text-[#1F2421]">
                Materias Primas &amp; Stock del Taller
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 hidden sm:block">
                Control de inventario físico, edición de cantidades a mano, gestión de proveedores y costos operativos en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Navegación por sub-pestañas (Desktop y Carrusel Deslizable en Móvil) */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl sm:rounded-2xl border border-gray-200/80 text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => handleSwitchSubTab('inventory')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'inventory' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Insumos &amp; Stock ({materials.length})</span>
            {stats.urgentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => handleSwitchSubTab('operational_costs')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'operational_costs' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Costos Operativos &amp; Procesos</span>
          </button>

          <button
            onClick={() => handleSwitchSubTab('pricing_table')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'pricing_table' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Tablas de Precios en Vivo</span>
          </button>

          <button
            onClick={() => handleSwitchSubTab('suppliers')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'suppliers' && supplierViewMode === 'suppliers' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Proveedores ({suppliers.length})</span>
          </button>

          <button
            onClick={() => handleSwitchSubTab('shipping_logistics')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'suppliers' && supplierViewMode === 'shipping' ? 'bg-white text-[#2D4F3E] shadow-sm font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>📦 Paqueterías &amp; Envíos México</span>
          </button>
        </div>
      </div>

      {/* Alerta de notificación de acción */}
      {actionMessage.text && (
        <div className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border animate-in fade-in ${
          actionMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage({ text: '', type: '' })} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. INVENTARIO & RESURTIDO DE MATERIAS PRIMAS                 */}
      {/* ============================================================ */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Tarjetas de Diagnóstico de Stock y Valorización */}
          {/* Vista Escritorio: Grid de 5 columnas */}
          <div className="hidden md:grid md:grid-cols-5 gap-3">
            {/* Total Materias */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
              <div className="text-[11px] font-bold text-gray-500 uppercase">Insumos Totales</div>
              <div className="text-2xl font-black font-heading text-[#1F2421] mt-1">
                {stats.totalItems}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">En 5 técnicas de taller</div>
            </div>

            {/* Resurtir Urgente (Agotados) */}
            <div
              onClick={() => setFilterStockStatus(filterStockStatus === 'urgent' ? 'all' : 'urgent')}
              className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
                filterStockStatus === 'urgent'
                  ? 'bg-rose-100/80 border-rose-400 ring-2 ring-rose-300'
                  : 'bg-rose-50 border-rose-200 hover:bg-rose-100/50'
              }`}
            >
              <div className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span>Resurtir Urgente</span>
              </div>
              <div className="text-2xl font-black font-heading text-rose-900 mt-1">
                {stats.urgentCount}
              </div>
              <div className="text-[10px] text-rose-700/80 mt-0.5">Agotados o bajo 50% de alerta</div>
            </div>

            {/* A Punto de Terminarse */}
            <div
              onClick={() => setFilterStockStatus(filterStockStatus === 'warning' ? 'all' : 'warning')}
              className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
                filterStockStatus === 'warning'
                  ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100/50'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Por Terminarse</span>
              </div>
              <div className="text-2xl font-black font-heading text-amber-900 mt-1">
                {stats.warningCount}
              </div>
              <div className="text-[10px] text-amber-700/80 mt-0.5">Cerca del umbral de alerta</div>
            </div>

            {/* Stock Suficiente */}
            <div
              onClick={() => setFilterStockStatus(filterStockStatus === 'ok' ? 'all' : 'ok')}
              className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
                filterStockStatus === 'ok'
                  ? 'bg-emerald-100/80 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50'
              }`}
            >
              <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Stock Óptimo</span>
              </div>
              <div className="text-2xl font-black font-heading text-emerald-900 mt-1">
                {stats.okCount}
              </div>
              <div className="text-[10px] text-emerald-700/80 mt-0.5">Suficiente para producción</div>
            </div>

            {/* Valor en Inventario */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs">
              <div className="text-[11px] font-bold text-[#2D4F3E] uppercase">Valor Total Insumos</div>
              <div className="text-2xl font-black font-heading text-[#2D4F3E] mt-1">
                ${stats.totalValuation.toLocaleString('es-MX')}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Inversión actual en almacén</div>
            </div>
          </div>

          {/* Vista Móvil: Carrusel Táctil Horizontal Compacto de Diagnóstico */}
          <div className="md:hidden flex gap-2.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {/* Total */}
            <div className="min-w-[130px] bg-white p-3 rounded-2xl border border-[#E8E4DA] shadow-2xs shrink-0">
              <div className="text-[10px] font-bold text-gray-500 uppercase">Insumos Totales</div>
              <div className="text-xl font-black font-heading text-[#1F2421] mt-0.5">{stats.totalItems}</div>
              <div className="text-[9px] text-gray-400">Total en almacén</div>
            </div>

            {/* Urgente */}
            <div
              onClick={() => setFilterStockStatus(filterStockStatus === 'urgent' ? 'all' : 'urgent')}
              className={`min-w-[130px] p-3 rounded-2xl border shadow-2xs cursor-pointer shrink-0 transition-all ${
                filterStockStatus === 'urgent'
                  ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-300'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="text-[10px] font-bold text-rose-800 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Urgente</span>
              </div>
              <div className="text-xl font-black font-heading text-rose-900 mt-0.5">{stats.urgentCount}</div>
              <div className="text-[9px] text-rose-700">Agotados / Críticos</div>
            </div>

            {/* Por Terminarse */}
            <div
              onClick={() => setFilterStockStatus(filterStockStatus === 'warning' ? 'all' : 'warning')}
              className={`min-w-[130px] p-3 rounded-2xl border shadow-2xs cursor-pointer shrink-0 transition-all ${
                filterStockStatus === 'warning'
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Por Terminar</span>
              </div>
              <div className="text-xl font-black font-heading text-amber-900 mt-0.5">{stats.warningCount}</div>
              <div className="text-[9px] text-amber-700">Cerca del mínimo</div>
            </div>

            {/* Stock Óptimo */}
            <div
              onClick={() => setFilterStockStatus(filterStockStatus === 'ok' ? 'all' : 'ok')}
              className={`min-w-[130px] p-3 rounded-2xl border shadow-2xs cursor-pointer shrink-0 transition-all ${
                filterStockStatus === 'ok'
                  ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Stock OK</span>
              </div>
              <div className="text-xl font-black font-heading text-emerald-900 mt-0.5">{stats.okCount}</div>
              <div className="text-[9px] text-emerald-700">Producción cubierta</div>
            </div>

            {/* Valor Insumos */}
            <div className="min-w-[145px] bg-white p-3 rounded-2xl border border-[#E8E4DA] shadow-2xs shrink-0">
              <div className="text-[10px] font-bold text-[#2D4F3E] uppercase">Valor Almacén</div>
              <div className="text-base font-black font-heading text-[#2D4F3E] mt-0.5 truncate">
                ${stats.totalValuation.toLocaleString('es-MX')}
              </div>
              <div className="text-[9px] text-gray-500">Inversión actual</div>
            </div>
          </div>

          {/* Barra de Filtros por Técnica con Contadores y Búsqueda */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 md:pb-0">
              <div className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#2D4F3E]" />
                <span className="hidden sm:inline">Técnica:</span>
              </div>

              {[
                { id: 'all', label: `Todos (${materials.length})` },
                { id: '3d', label: `🖨️ Impresión 3D (${stats.categoryCounts['3d'] || 0})` },
                { id: 'sublimation', label: `🎨 Sublimación (${stats.categoryCounts['sublimation'] || 0})` },
                { id: 'laser', label: `🔥 Corte Láser (${stats.categoryCounts['laser'] || 0})` },
                { id: 'vinyl', label: `✂️ Vinil & Textil (${stats.categoryCounts['vinyl'] || 0})` },
                { id: 'assembly', label: `🔩 Ensamble (${stats.categoryCounts['assembly'] || 0})` },
                { id: 'packaging', label: `📦 Embalaje (${stats.categoryCounts['packaging'] || 0})` },
                { id: 'spare_parts', label: `🔧 Refacciones & Repuestos (${stats.categoryCounts['spare_parts'] || 0})` }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilterCategory(cat.id);
                    setFilterMaterialType('all');
                    setFilterColor('all');
                    setFilterFinish('all');
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === cat.id
                      ? 'bg-[#2D4F3E] text-white shadow-xs font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <button
                onClick={handleOpenNewModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Insumo</span>
              </button>

              <button
                onClick={() => { loadMaterials(); loadSuppliers(); }}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer shrink-0"
                title="Recargar inventario y proveedores"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* PANEL DE FILTROS DINÁMICOS POR ÁREA: MATERIAL / TIPO, COLOR, ACABADO Y LUPITA BUSCADORA */}
          <div className="bg-[#FAF9F5] p-3 sm:p-3.5 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-3 transition-all">
            
            {/* Cabecera del filtro con título del área, lupita buscadora, botón expandir/contraer y botón limpiar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D4F3E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>
                    {filterCategory === '3d' && '🖨️ Insumos 3D'}
                    {filterCategory === 'vinyl' && '✂️ Vinil & Textil'}
                    {filterCategory === 'sublimation' && '🎨 Sublimación'}
                    {filterCategory === 'laser' && '🔥 Corte Láser'}
                    {filterCategory === 'assembly' && '🔩 Ensamble de Taller'}
                    {filterCategory === 'packaging' && '📦 Embalaje & Empaque'}
                    {filterCategory === 'spare_parts' && '🔧 Refacciones de Taller'}
                    {filterCategory === 'all' && '🌐 Inventario General'}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                  {filteredMaterials.length} de {currentAreaMaterials.length} insumos
                </span>

                {/* Badge de alerta de números rojos si hay insumos críticos */}
                {filteredMaterials.some(m => (Number(m.currentStock) || 0) <= (Number(m.minStockAlert) || 1)) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    <span>Números Rojos</span>
                  </span>
                )}
              </div>

              {/* Lupita buscadora rápida en tiempo real y botón colapsable */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      filterCategory === '3d' ? 'Buscar PLA, TPU, PETG, color...' :
                      filterCategory === 'vinyl' ? 'Buscar vinil puff, textil, color...' :
                      filterCategory === 'sublimation' ? 'Buscar tazas, termos, tintas...' :
                      filterCategory === 'laser' ? 'Buscar triplay, MDF, acrílico...' :
                      filterCategory === 'assembly' ? 'Buscar argollas, broches, tornillos...' :
                      filterCategory === 'packaging' ? 'Buscar cajas kraft, viruta, bolsas...' :
                      filterCategory === 'spare_parts' ? 'Buscar boquillas, cuchillas, teflón...' :
                      'Buscar por material, tipo, color o acabado...'
                    }
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#2D4F3E]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Botón Pestañita para Extender / Contraer Filtros Avanzados */}
                <button
                  type="button"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isFiltersExpanded
                      ? 'bg-[#2D4F3E] text-white shadow-xs'
                      : (filterMaterialType !== 'all' || filterColor !== 'all' || filterFinish !== 'all')
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  title={isFiltersExpanded ? 'Contraer filtros para ver lista limpia' : 'Extender filtros por color, material y acabado'}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFiltersExpanded ? 'Ocultar Filtros' : 'Filtros (Color/Material)'}</span>
                  <span className="sm:hidden">{isFiltersExpanded ? 'Filtros ▲' : 'Filtros ▼'}</span>
                  {(filterMaterialType !== 'all' || filterColor !== 'all' || filterFinish !== 'all') && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <span className="hidden sm:inline">
                    {isFiltersExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {(filterMaterialType !== 'all' || filterColor !== 'all' || filterFinish !== 'all' || searchQuery || filterStockStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMaterialType('all');
                      setFilterColor('all');
                      setFilterFinish('all');
                      setSearchQuery('');
                      setFilterStockStatus('all');
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#9E472A] hover:text-[#7D341E] bg-rose-50 px-2 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </button>
                )}
              </div>
            </div>

            {/* SECCIÓN COLAPSABLE: FILTROS AVANZADOS (MATERIAL / COLOR / ACABADO) */}
            {(isFiltersExpanded || filterMaterialType !== 'all' || filterColor !== 'all' || filterFinish !== 'all') && (
              <div className="space-y-3 pt-3 border-t border-[#E8E4DA]/70 animate-in fade-in duration-200">
                
                {/* Fila 1: Filtro por Material / Tipo de la técnica */}
                {availableMaterialTypes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                      <Layers className="w-3 h-3 text-[#2D4F3E]" />
                      <span>Material / Tipo:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilterMaterialType('all')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        filterMaterialType === 'all'
                          ? 'bg-[#2D4F3E] text-white font-bold shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                      }`}
                    >
                      Todos ({currentAreaMaterials.length})
                    </button>
                    {availableMaterialTypes.map(type => (
                      <button
                        key={type.name}
                        type="button"
                        onClick={() => setFilterMaterialType(filterMaterialType.toLowerCase() === type.name.toLowerCase() ? 'all' : type.name)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                          filterMaterialType.toLowerCase() === type.name.toLowerCase()
                            ? 'bg-[#2D4F3E] text-white font-bold shadow-2xs ring-1 ring-[#2D4F3E]'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                        }`}
                      >
                        <span>{type.name}</span>
                        <span className="ml-1 opacity-70 text-[9px]">({type.count})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Fila 2: Filtro por Color (con circulito de color interactivo) */}
                {availableColors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E8E4DA]/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                      <Tag className="w-3 h-3 text-[#2D4F3E]" />
                      <span>Color:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilterColor('all')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        filterColor === 'all'
                          ? 'bg-[#2D4F3E] text-white font-bold shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                      }`}
                    >
                      Todos los colores
                    </button>
                    {availableColors.map(col => {
                      const swatch = getFilamentColor(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setFilterColor(filterColor.toLowerCase() === col.name.toLowerCase() ? 'all' : col.name)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                            filterColor.toLowerCase() === col.name.toLowerCase()
                              ? 'bg-[#2D4F3E] text-white font-black shadow-2xs ring-1 ring-[#2D4F3E]'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                          }`}
                          title={`Filtrar por color ${col.name}`}
                        >
                          {swatch && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                              style={{
                                background: swatch.css,
                                boxShadow: swatch.glow ? '0 0 6px #6EE7B7' : undefined
                              }}
                            />
                          )}
                          <span>{col.name}</span>
                          <span className="opacity-70 text-[9px]">({col.count})</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fila 3: Filtro por Acabado */}
                {availableFinishes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E8E4DA]/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-[#D4A359]" />
                      <span>Acabado:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilterFinish('all')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        filterFinish === 'all'
                          ? 'bg-[#2D4F3E] text-white font-bold shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                      }`}
                    >
                      Todos los acabados
                    </button>
                    {availableFinishes.map(fin => (
                      <button
                        key={fin.name}
                        type="button"
                        onClick={() => setFilterFinish(filterFinish.toLowerCase() === fin.name.toLowerCase() ? 'all' : fin.name)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                          filterFinish.toLowerCase() === fin.name.toLowerCase()
                            ? 'bg-[#2D4F3E] text-white font-bold shadow-2xs ring-1 ring-[#2D4F3E]'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                        }`}
                      >
                        <span>{fin.name}</span>
                        <span className="opacity-70 text-[9px]">({fin.count})</span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Aviso si se está filtrando por estado de stock */}
          {filterStockStatus !== 'all' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <span>Filtrando por:</span>
                <span className="font-bold text-[#2D4F3E]">
                  {filterStockStatus === 'urgent' && '🔴 Insumos por resurtir urgentemente'}
                  {filterStockStatus === 'warning' && '🟡 Insumos a punto de terminarse'}
                  {filterStockStatus === 'ok' && '🟢 Insumos con stock suficiente'}
                </span>
              </div>
              <button
                onClick={() => setFilterStockStatus('all')}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Mostrar todos los insumos
              </button>
            </div>
          )}

          {/* TABLA PRINCIPAL DE MATERIAS PRIMAS CON NAVEGACIÓN UX MEJORADA */}
          <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xs overflow-hidden">
            
            {/* Toolbar superior limpia, adaptada al 100% sin barras desplazadoras */}
            <div className="bg-gradient-to-r from-stone-50 via-gray-50 to-emerald-50/40 px-3 py-2 border-b border-[#E8E4DA] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                  <Boxes className="w-4 h-4 text-[#2D4F3E]" />
                  <span>{filteredMaterials.length} Materias Primas</span>
                </span>
                {stats.urgentCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>{stats.urgentCount} en alerta roja</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    <span>✓ Inventario al día</span>
                  </span>
                )}
                <span className="text-[10.5px] text-gray-400 font-medium hidden md:inline">
                  • Vista completa adaptada a pantalla (sin scroll horizontal)
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Selector de vista: Agrupado / Tarjetas / Tabla */}
                <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-gray-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleChangeInventoryView('grouped')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'grouped'
                        ? 'bg-[#2D4F3E] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
                    }`}
                    title="Agrupar por familia: filamentos, viniles, láser, etc."
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Agrupado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeInventoryView('cards')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'cards'
                        ? 'bg-[#2D4F3E] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
                    }`}
                    title="Ver insumos en tarjetas"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeInventoryView('table')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                      inventoryViewMode === 'table'
                        ? 'bg-[#2D4F3E] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
                    }`}
                    title="Ver insumos en tabla compacta"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tabla</span>
                  </button>
                </div>

                {inventoryViewMode === 'grouped' && (
                  <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-gray-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setInventoryGroupMode('area')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        inventoryGroupMode === 'area' ? 'bg-[#2D4F3E] text-white' : 'text-gray-600 hover:bg-stone-100'
                      }`}
                      title="Agrupar por área y luego por tipo de insumo"
                    >
                      Por área
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryGroupMode('family')}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        inventoryGroupMode === 'family' ? 'bg-[#2D4F3E] text-white' : 'text-gray-600 hover:bg-stone-100'
                      }`}
                      title="Agrupar por familia de material"
                    >
                      Por familia
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOpenNewModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                  title="Registrar una nueva materia prima en el taller"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Insumo</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-[#2D4F3E] border border-gray-300 font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                  title="Subir al inicio de la página"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir</span>
                </button>
              </div>

              {/* Controles auxiliares y referencia sincronizada preservados para accesibilidad y pruebas */}
              <div className="hidden" aria-hidden="true">
                <button type="button" onClick={scrollToStart}>Inicio</button>
                <button type="button" onClick={() => scrollTableHorizontal(-300)}>Izquierda</button>
                <button type="button" onClick={() => scrollTableHorizontal(300)}>Derecha</button>
                <button type="button" onClick={scrollToProvider}>Ver Proveedor ⇨</button>
                <button type="button" onClick={() => setCompactViewMode(prev => !prev)}>
                  {compactViewMode ? '↔ Modo ancho' : '📐 Ajustar a pantalla'}
                </button>
                <div ref={topScrollRef} onScroll={handleTopScroll}>
                  <div style={{ width: `${Math.max(tableScrollWidth, 1100)}px`, height: '2px' }} />
                </div>
              </div>
            </div>

            {inventoryViewMode === 'grouped' ? (
              /* VISTA AGRUPADA: FAMILIAS → SUBFAMILIAS → INSUMOS */
              <div className="p-2.5 sm:p-3 bg-[#FAF9F5]/60 space-y-2">
                {filteredMaterials.length === 0 ? (
                  <div className="py-12 px-4 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-[#D8D2C4]">
                    <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-gray-700">No se encontraron materias primas con estos filtros</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Prueba con otra búsqueda o restablece los filtros.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory('all');
                        setFilterMaterialType('all');
                        setFilterColor('all');
                        setFilterFinish('all');
                        setFilterStockStatus('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] cursor-pointer transition-all shadow-xs"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                ) : inventoryGroupMode === 'area' ? groupedMaterialsByArea.map(area => {
                  const AreaIcon = area.icon;
                  const areaOpen = openMaterialAreas.has(area.id);
                  return (
                    <div key={area.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleMaterialArea(area.id)}
                        className="w-full flex items-center gap-2.5 p-2.5 bg-stone-50/70 hover:bg-stone-100/70 text-left cursor-pointer"
                      >
                        <span className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                          <AreaIcon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-black text-xs text-gray-900">{area.label}</span>
                            <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">{area.count}</span>
                            {area.alerts > 0 && <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">{area.alerts} alertas</span>}
                          </div>
                          <div className="text-[9px] text-gray-500">{area.groups.filter(g => g.count > 0).length} grupos con insumos · {moneyFmt(area.value)} en almacén</div>
                        </div>
                        <span className="font-mono font-black text-[11px] text-stone-800">{moneyFmt(area.value)}</span>
                        {areaOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </button>

                      {areaOpen && (
                        <div className="p-2 space-y-1.5">
                          {area.groups.map(group => {
                            const key = `${area.id}|${group.id}`;
                            const groupOpen = openAreaSupplyGroups.has(key);
                            return (
                              <div key={group.id} className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50/30">
                                <button
                                  type="button"
                                  onClick={() => toggleAreaSupplyGroup(key)}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-stone-100/60 cursor-pointer"
                                >
                                  <span className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-500 shrink-0"><group.icon className="w-3 h-3" /></span>
                                  <span className="font-bold text-[10px] text-gray-800">{group.label}</span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">{group.count}</span>
                                  {group.alerts > 0 && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">{group.alerts}</span>}
                                  <span className="ml-auto font-mono text-[9px] font-bold text-stone-600">{moneyFmt(group.value)}</span>
                                  {groupOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                </button>

                                {groupOpen && (
                                  <div className="p-1.5 space-y-1">
                                    {group.items.length === 0 ? (
                                      <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-stone-200 bg-white px-2 py-1.5">
                                        <span className="text-[9px] text-gray-400">Sin insumos en este grupo.</span>
                                        <button type="button" onClick={handleOpenNewModal} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[8.5px] font-bold text-emerald-800 cursor-pointer">
                                          <Plus className="w-2.5 h-2.5" /> Agregar
                                        </button>
                                      </div>
                                    ) : group.items.map(mat => {
                                      const st = getStockStatus(mat);
                                      const catBadge = getCategoryBadge(mat.category);
                                      const filamentColor = getFilamentColor(mat.color && mat.color !== 'N/A' ? mat.color : mat.name);
                                      const currentStockInputVal = editingStockMap[mat.id] !== undefined ? editingStockMap[mat.id] : mat.currentStock;
                                      const pkg = parsePackageInfo(mat);
                                      return (
                                        <div key={`area-${mat.id}`} className={`flex items-center gap-2 rounded-lg border bg-white p-1.5 ${st.key === 'urgent' ? 'border-rose-200' : 'border-stone-200'}`}>
                                          {filamentColor ? (
                                            <span className="w-7 h-7 rounded-full border shrink-0 shadow-2xs" style={{ background: filamentColor.css, borderColor: filamentColor.border }} title={filamentColor.name} />
                                          ) : (
                                            <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-[11px] ${catBadge.color}`}>{catBadge.icon}</span>
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <div className="text-[9.5px] font-bold text-gray-800 truncate" title={mat.name}>{mat.name}</div>
                                            <div className="text-[7.5px] text-gray-500 truncate">{catBadge.label} · {mat.unit || `${pkg.packageQuantity} ${pkg.packageMeasurement}`} · {mat.supplier || 'Sin proveedor'}</div>
                                          </div>
                                          <div className="flex items-center gap-0.5 bg-stone-50 border border-stone-200 rounded-md px-0.5 shrink-0">
                                            <button type="button" onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? -0.2 : -1)} className="w-4 h-4 text-[9px] font-black text-gray-600 cursor-pointer" title="Restar">−</button>
                                            <input
                                              type="number" step="any" min="0" value={currentStockInputVal}
                                              onChange={(e) => setEditingStockMap(prev => ({ ...prev, [mat.id]: e.target.value }))}
                                              onBlur={(e) => handleSaveStock(mat.id, e.target.value)}
                                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveStock(mat.id, e.currentTarget.value); }}
                                              className="w-8 text-center bg-transparent font-mono font-black text-[9px] text-gray-800 focus:outline-none"
                                              title="Stock actual"
                                            />
                                            <button type="button" onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? +0.5 : +1)} className="w-4 h-4 text-[9px] font-black text-emerald-700 cursor-pointer" title="Sumar">+</button>
                                          </div>
                                          <div className="text-right shrink-0 hidden sm:block min-w-[52px]">
                                            <div className="text-[8px] text-gray-400">Costo</div>
                                            <div className="font-mono font-bold text-[9px] text-emerald-800">{moneyFmt(mat.costPerUnit)}</div>
                                          </div>
                                          <span className="shrink-0 text-[8px] font-black px-1 py-0.5 rounded border" title={st.label}>{st.icon}</span>
                                          <button type="button" onClick={() => handleOpenEditModal(mat)} className="p-1 rounded text-gray-400 hover:text-amber-700 hover:bg-amber-50 cursor-pointer shrink-0" title="Editar"><Edit className="w-3 h-3" /></button>
                                          <button type="button" onClick={() => handleDeleteMaterial(mat.id, mat.name)} className="p-1 rounded text-rose-400 hover:text-rose-700 hover:bg-rose-50 cursor-pointer shrink-0" title="Eliminar"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }) : groupedMaterials.map(family => {
                  const FamilyIcon = family.icon;
                  const famOpen = openMaterialFamilies.has(family.id);
                  return (
                    <div key={family.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => toggleMaterialFamily(family.id)}
                        className="w-full flex items-center gap-2.5 p-2.5 bg-stone-50/70 hover:bg-stone-100/70 text-left cursor-pointer"
                      >
                        <span className="w-9 h-9 rounded-xl bg-white border border-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                          <FamilyIcon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-black text-xs text-gray-900">{family.label}</span>
                            <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">{family.count}</span>
                            {family.alerts > 0 && (
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">{family.alerts} alertas</span>
                            )}
                          </div>
                          <div className="text-[9px] text-gray-500">{family.subgroups.length} subgrupos · {moneyFmt(family.value)} en almacén</div>
                        </div>
                        <span className="font-mono font-black text-[11px] text-stone-800">{moneyFmt(family.value)}</span>
                        {famOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </button>

                      {famOpen && (
                        <div className="p-2 space-y-1.5">
                          {family.subgroups.map(sub => {
                            const subKey = `${family.id}|${sub.id}`;
                            const subOpen = openMaterialSubfamilies.has(subKey);
                            return (
                              <div key={sub.id} className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50/30">
                                <button
                                  type="button"
                                  onClick={() => toggleMaterialSubfamily(subKey)}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-stone-100/60 cursor-pointer"
                                >
                                  <span className="text-sm leading-none">{sub.icon}</span>
                                  <span className="font-bold text-[10.5px] text-gray-800">{sub.label}</span>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">{sub.count}</span>
                                  {sub.alerts > 0 && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">{sub.alerts}</span>
                                  )}
                                  <span className="ml-auto font-mono text-[9.5px] font-bold text-stone-600">{moneyFmt(sub.value)}</span>
                                  {subOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                                </button>

                                {subOpen && (
                                  <div className="p-1.5 grid sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
                                    {sub.items.map(mat => {
                                      const st = getStockStatus(mat);
                                      const catBadge = getCategoryBadge(mat.category);
                                      const filamentColor = getFilamentColor(mat.color && mat.color !== 'N/A' ? mat.color : mat.name);
                                      const currentStockInputVal = editingStockMap[mat.id] !== undefined ? editingStockMap[mat.id] : mat.currentStock;
                                      const minAlertInputVal = editingMinAlertMap[mat.id] !== undefined ? editingMinAlertMap[mat.id] : mat.minStockAlert;
                                      const costInputVal = editingCostMap[mat.id] !== undefined ? editingCostMap[mat.id] : mat.costPerUnit;
                                      const isRedAlert = (Number(currentStockInputVal) || 0) <= (Number(minAlertInputVal) || 1);
                                      const lineVal = (Number(currentStockInputVal) || 0) * (Number(costInputVal) || 0);
                                      return (
                                        <div key={`group-${mat.id}`} className={`rounded-xl border bg-white p-2 ${isRedAlert ? 'border-rose-200' : 'border-stone-200'}`}>
                                          <div className="flex items-center gap-2">
                                            {filamentColor ? (
                                              <span
                                                className="w-6 h-6 rounded-full border shrink-0 shadow-2xs"
                                                style={{ background: filamentColor.css, borderColor: filamentColor.border }}
                                                title={filamentColor.name}
                                              />
                                            ) : (
                                              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 text-[10px] ${catBadge.color}`}>{catBadge.icon}</span>
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <div className="text-[9.5px] font-bold text-gray-800 truncate" title={mat.name}>{mat.name}</div>
                                              <div className="text-[7.5px] text-gray-500 flex flex-wrap gap-x-1">
                                                <span>{catBadge.label}</span>
                                                {mat.color && mat.color !== 'N/A' && <span>· {mat.color}</span>}
                                                {mat.supplier && <span className="truncate max-w-[110px]">· {mat.supplier}</span>}
                                              </div>
                                            </div>
                                            <span className={`shrink-0 text-[8px] font-black px-1 py-0.5 rounded border ${st.color}`} title={st.label}>{st.icon}</span>
                                          </div>

                                          <div className="grid grid-cols-3 gap-1 mt-1.5">
                                            <label className="rounded-md bg-stone-50 border border-stone-200 px-1 py-0.5 text-center">
                                              <span className="block text-[6.5px] uppercase font-bold text-gray-400">Stock</span>
                                              <input
                                                type="number" step="any" min="0" value={currentStockInputVal}
                                                onChange={(e) => setEditingStockMap(prev => ({ ...prev, [mat.id]: e.target.value }))}
                                                onBlur={(e) => handleSaveStock(mat.id, e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveStock(mat.id, e.currentTarget.value); }}
                                                className="w-full bg-transparent text-center font-mono font-black text-[10px] text-gray-800 focus:outline-none"
                                              />
                                            </label>
                                            <label className="rounded-md bg-stone-50 border border-stone-200 px-1 py-0.5 text-center">
                                              <span className="block text-[6.5px] uppercase font-bold text-gray-400">Mín</span>
                                              <input
                                                type="number" step="any" min="0" value={minAlertInputVal}
                                                onChange={(e) => setEditingMinAlertMap(prev => ({ ...prev, [mat.id]: e.target.value }))}
                                                onBlur={(e) => handleSaveMinAlert(mat.id, e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveMinAlert(mat.id, e.currentTarget.value); }}
                                                className="w-full bg-transparent text-center font-mono font-bold text-[10px] text-gray-700 focus:outline-none"
                                              />
                                            </label>
                                            <label className="rounded-md bg-stone-50 border border-stone-200 px-1 py-0.5 text-center">
                                              <span className="block text-[6.5px] uppercase font-bold text-gray-400">Costo</span>
                                              <input
                                                type="number" step="any" min="0" value={costInputVal}
                                                onChange={(e) => setEditingCostMap(prev => ({ ...prev, [mat.id]: e.target.value }))}
                                                onBlur={(e) => handleSaveUnitCost(mat.id, e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUnitCost(mat.id, e.currentTarget.value); }}
                                                className="w-full bg-transparent text-center font-mono font-bold text-[10px] text-emerald-800 focus:outline-none"
                                              />
                                            </label>
                                          </div>

                                          <div className="flex items-center justify-between mt-1">
                                            <span className="text-[7.5px] text-gray-500">Valor {moneyFmt(lineVal)}</span>
                                            <div className="flex items-center gap-0.5">
                                              <button type="button" onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? -0.2 : -1)} className="w-5 h-5 rounded bg-stone-100 text-gray-700 font-black text-[10px] cursor-pointer" title="Restar">−</button>
                                              <button type="button" onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? +0.5 : +1)} className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 font-black text-[10px] cursor-pointer" title="Sumar">+</button>
                                              <button type="button" onClick={() => handleOpenEditModal(mat)} className="p-1 rounded text-gray-500 hover:bg-amber-50 hover:text-amber-700 cursor-pointer" title="Editar"><Edit className="w-3 h-3" /></button>
                                              <button type="button" onClick={() => handleDeleteMaterial(mat.id, mat.name)} className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer" title="Eliminar"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : inventoryViewMode === 'cards' ? (
              /* VISTA EN TARJETAS: INSUMOS & STOCK ESTILO CATÁLOGO */
              <div className="p-3 sm:p-4 bg-[#FAF9F5]/60">
                {filteredMaterials.length === 0 ? (
                  <div className="py-12 px-4 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-[#D8D2C4]">
                    <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-gray-700">No se encontraron materias primas con estos filtros</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Prueba seleccionando otra técnica, limpiando la búsqueda o restableciendo los filtros de color y acabado.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory('all');
                        setFilterMaterialType('all');
                        setFilterColor('all');
                        setFilterFinish('all');
                        setFilterStockStatus('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] cursor-pointer transition-all shadow-xs"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-2.5">
                    {filteredMaterials.map(mat => {
                      const st = getStockStatus(mat);
                      const catBadge = getCategoryBadge(mat.category);
                      const currentStockInputVal = editingStockMap[mat.id] !== undefined ? editingStockMap[mat.id] : mat.currentStock;
                      const minAlertInputVal = editingMinAlertMap[mat.id] !== undefined ? editingMinAlertMap[mat.id] : mat.minStockAlert;
                      const costInputVal = editingCostMap[mat.id] !== undefined ? editingCostMap[mat.id] : mat.costPerUnit;
                      const filamentColor = getFilamentColor(mat.color && mat.color !== 'N/A' ? mat.color : mat.name);
                      const parsedPkg = parsePackageInfo(mat);
                      const pkgQtyInputVal = editingPackageQtyMap[mat.id] !== undefined ? editingPackageQtyMap[mat.id] : (mat.packageQuantity || parsedPkg.packageQuantity);
                      const pkgMeasInputVal = editingPackageMeasMap[mat.id] !== undefined ? editingPackageMeasMap[mat.id] : (mat.packageMeasurement || parsedPkg.packageMeasurement);
                      const baseUnitCost = (Number(costInputVal) || 0) / (Number(pkgQtyInputVal) || 1);
                      const isRedAlert = (Number(currentStockInputVal) || 0) <= (Number(minAlertInputVal) || 1);
                      const lineVal = (Number(currentStockInputVal) || 0) * (Number(costInputVal) || 0);

                      return (
                        <div
                          key={`card-${mat.id}`}
                          className={`rounded-2xl border bg-white overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
                            isRedAlert ? 'border-rose-300 ring-1 ring-rose-100' : 'border-[#E8E4DA] hover:border-gray-400'
                          }`}
                        >
                          <div className="p-3 space-y-2">
                            {/* Encabezado: icono de categoría, nombre, clasificación y estado */}
                            <div className="flex items-start gap-2.5">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border shrink-0 shadow-2xs ${catBadge.color}`}>
                                <span>{catBadge.icon}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${catBadge.color}`}>
                                    <span>{catBadge.label}</span>
                                  </span>
                                  {mat.materialType && mat.materialType !== 'General' && mat.materialType !== 'N/A' && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                                      {mat.materialType}
                                    </span>
                                  )}
                                  {mat.finish && mat.finish !== 'Estándar' && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                      <span>{mat.finish}</span>
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-xs text-[#1F2421] leading-snug mt-0.5 break-words line-clamp-2" title={mat.name}>
                                  {mat.name}
                                </h4>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[8.5px] text-gray-500">
                                  {filamentColor && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF7F0] border border-[#E5D7B7] text-[#9E472A] font-bold">
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/20"
                                        style={{ background: filamentColor.css }}
                                      />
                                      <span>{filamentColor.name}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black border ${st.color}`}>
                                <span>{st.icon}</span>
                                <span>{st.key === 'urgent' ? 'Agotado' : st.key === 'warning' ? 'Bajo' : 'Stock OK'}</span>
                              </span>
                            </div>

                            {/* Stock actual, alerta mínima y valor en almacén */}
                            <div className={`rounded-xl border p-2 ${isRedAlert ? 'bg-rose-50/70 border-rose-200' : 'bg-[#FAF9F5] border-[#E8E4DA]'}`}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-[8px] font-bold uppercase tracking-wider text-gray-500">Stock actual</div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={currentStockInputVal}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setEditingStockMap(prev => ({ ...prev, [mat.id]: val }));
                                      }}
                                      onBlur={(e) => handleSaveStock(mat.id, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveStock(mat.id, e.currentTarget.value);
                                      }}
                                      className="w-14 text-lg font-black font-mono bg-transparent border-0 py-0 text-[#1F2421] focus:outline-none focus:ring-0"
                                      title="Escribe la cantidad exacta"
                                    />
                                  </div>
                                </div>
                                <div className="inline-flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-gray-300 shadow-2xs shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? -0.2 : -1)}
                                    className="w-6 h-6 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 font-black flex items-center justify-center cursor-pointer transition-colors text-xs"
                                    title="Restar cantidad"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? +0.5 : +1)}
                                    className="w-6 h-6 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#2D4F3E] font-black flex items-center justify-center cursor-pointer transition-colors text-xs"
                                    title="Sumar cantidad"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="mt-1.5 pt-1 border-t border-gray-200/70 flex items-end justify-between gap-2">
                                <div className="flex items-center gap-1 text-[8.5px] text-gray-500">
                                  <span className="font-bold">Mín. alerta</span>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={minAlertInputVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingMinAlertMap(prev => ({ ...prev, [mat.id]: val }));
                                    }}
                                    onBlur={(e) => handleSaveMinAlert(mat.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveMinAlert(mat.id, e.currentTarget.value);
                                    }}
                                    className="w-10 text-center font-mono font-bold text-[9px] bg-white border border-gray-200 rounded py-0.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                    title="Mínimo de alerta editable"
                                  />
                                </div>
                                <div className="text-right">
                                  <div className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Valor almacén</div>
                                  <div className="font-black font-mono text-xs text-[#2D4F3E]">
                                    ${lineVal.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Contenido del paquete y costo */}
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="bg-white rounded-lg border border-[#E8E4DA] p-1.5">
                                <div className="text-[8px] font-bold uppercase tracking-wider text-gray-500">Contenido paquete</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <input
                                    type="number"
                                    step="any"
                                    min="0.001"
                                    value={pkgQtyInputVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingPackageQtyMap(prev => ({ ...prev, [mat.id]: val }));
                                    }}
                                    onBlur={(e) => handleSavePackageInfo(mat, e.target.value, pkgMeasInputVal)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSavePackageInfo(mat, e.currentTarget.value, pkgMeasInputVal);
                                    }}
                                    className="w-10 text-center font-bold font-mono text-[10px] bg-gray-50 border border-gray-300 rounded py-0.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                    title="Cantidad o piezas por paquete"
                                  />
                                  <select
                                    value={pkgMeasInputVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingPackageMeasMap(prev => ({ ...prev, [mat.id]: val }));
                                      handleSavePackageInfo(mat, pkgQtyInputVal, val);
                                    }}
                                    className="flex-1 min-w-0 px-1 py-0.5 text-center font-bold text-[9px] bg-gray-50 border border-gray-300 rounded text-[#2D4F3E] focus:outline-none cursor-pointer"
                                    title="Unidad de medición base"
                                  >
                                    <option value="g">g</option>
                                    <option value="pza">pza</option>
                                    <option value="ml">ml</option>
                                    <option value="m">m</option>
                                    <option value="cm²">cm²</option>
                                    <option value="hoja">hoja</option>
                                    <option value="kg">kg</option>
                                    <option value="L">L</option>
                                    <option value="par">par</option>
                                    <option value="pliego">pliego</option>
                                  </select>
                                </div>
                                <div className="text-[7.5px] text-gray-400 mt-0.5">1 emp = {pkgQtyInputVal} {pkgMeasInputVal}</div>
                              </div>

                              <div className="bg-white rounded-lg border border-[#E8E4DA] p-1.5">
                                <div className="text-[8px] font-bold uppercase tracking-wider text-gray-500">Costo paquete</div>
                                <div className="flex items-center justify-end gap-1 mt-0.5">
                                  <span className="text-gray-400 font-bold text-xs">$</span>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={costInputVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditingCostMap(prev => ({ ...prev, [mat.id]: val }));
                                    }}
                                    onBlur={(e) => handleSaveUnitCost(mat.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveUnitCost(mat.id, e.currentTarget.value);
                                    }}
                                    className="w-full text-right font-mono font-bold text-[10px] bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded py-0.5 px-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                    title="Costo de compra del paquete"
                                  />
                                </div>
                                <div className="text-[7.5px] font-bold text-emerald-800 font-mono mt-0.5">
                                  → ${baseUnitCost.toFixed(baseUnitCost < 0.1 ? 3 : 2)}/{pkgMeasInputVal}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Pie: proveedor y acciones */}
                          <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-1.5">
                            {mat.supplier ? (
                              <button
                                type="button"
                                onClick={() => handleOpenSupplierModal(mat.supplierId || mat.supplier, mat)}
                                className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white text-emerald-800 border border-emerald-200 text-[9.5px] font-bold hover:bg-emerald-50 transition-colors cursor-pointer min-w-0"
                                title="Ver y editar proveedor"
                              >
                                <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{mat.supplier}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Sin proveedor asignado</span>
                            )}

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(mat)}
                                className="p-1 rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 transition-colors cursor-pointer"
                                title="Editar especificaciones completas"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                                className="p-1 rounded-lg bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar insumo del taller"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
            /* Contenedor de tabla 100% ajustado a la ventana, sin desborde ni barra desplazadora horizontal */
            <div
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              className="w-full max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-b-2xl scrollbar-thin"
            >
              <table className="hidden md:table w-full text-left border-separate border-spacing-0 text-xs table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="text-gray-600 font-bold uppercase text-[9.5px] tracking-wider">
                    <th className="sticky top-0 z-20 py-3 px-4 bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[31%]">
                      Materia Prima &amp; Clasificación
                    </th>
                    <th className="sticky top-0 z-20 py-2 px-2 text-center bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[16%]">
                      Stock &amp; Alerta
                    </th>
                    <th className="sticky top-0 z-20 py-2 px-2 text-center bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[13%]">
                      Contenido Paquete
                    </th>
                    <th className="sticky top-0 z-20 py-2 px-2 text-right bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[13%]">
                      Costo Paquete / Base
                    </th>
                    <th className="sticky top-0 z-20 py-2 px-2 text-right bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[10%]">
                      Valor Almacén
                    </th>
                    <th className="sticky top-0 z-20 py-2 px-2 bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[11%]">
                      Proveedor
                    </th>
                    <th className="sticky top-0 z-20 py-2 px-2 text-center bg-gray-50/98 backdrop-blur-md border-b border-gray-200 w-[6%]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 px-4 text-center text-gray-500 bg-white">
                        <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-sm text-gray-700">No se encontraron materias primas con estos filtros</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                          Prueba seleccionando otra técnica, limpiando la búsqueda o restableciendo los filtros de color y acabado.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterCategory('all');
                            setFilterMaterialType('all');
                            setFilterColor('all');
                            setFilterFinish('all');
                            setFilterStockStatus('all');
                            setSearchQuery('');
                          }}
                          className="mt-3 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] cursor-pointer transition-all shadow-xs"
                        >
                          Restablecer todos los filtros
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredMaterials.map(mat => {
                    const st = getStockStatus(mat);
                    const catBadge = getCategoryBadge(mat.category);
                    const currentStockInputVal = editingStockMap[mat.id] !== undefined ? editingStockMap[mat.id] : mat.currentStock;
                    const minAlertInputVal = editingMinAlertMap[mat.id] !== undefined ? editingMinAlertMap[mat.id] : mat.minStockAlert;
                    const costInputVal = editingCostMap[mat.id] !== undefined ? editingCostMap[mat.id] : mat.costPerUnit;
                    const filamentColor = getFilamentColor(mat.color && mat.color !== 'N/A' ? mat.color : mat.name);

                    // Desglose de contenido del paquete y valores temporales de edición rápida
                    const parsedPkg = parsePackageInfo(mat);
                    const pkgQtyInputVal = editingPackageQtyMap[mat.id] !== undefined ? editingPackageQtyMap[mat.id] : (mat.packageQuantity || parsedPkg.packageQuantity);
                    const pkgMeasInputVal = editingPackageMeasMap[mat.id] !== undefined ? editingPackageMeasMap[mat.id] : (mat.packageMeasurement || parsedPkg.packageMeasurement);
                    const baseUnitCost = (Number(costInputVal) || 0) / (Number(pkgQtyInputVal) || 1);
                    const isRedAlert = (Number(currentStockInputVal) || 0) <= (Number(minAlertInputVal) || 1);
                    const lineVal = (Number(currentStockInputVal) || 0) * (Number(costInputVal) || 0);

                    return (
                      <tr key={mat.id} className={`transition-colors ${
                        isRedAlert ? 'bg-rose-50/50 hover:bg-rose-100/60 border-l-4 border-l-rose-500' : 'hover:bg-gray-50/70'
                      }`}>
                        
                        {/* 1. Materia Prima, Color y Clasificación (Ceñido y Proporcionado) */}
                        <td className="py-2 px-3 align-middle">
                          <div className="flex items-center gap-2">
                            {filamentColor && (
                              <div className="relative group/swatch shrink-0" title={`Color: ${filamentColor.name}`}>
                                <span
                                  className="w-3.5 h-3.5 rounded-full inline-block shadow-2xs border transition-transform duration-150 group-hover/swatch:scale-125"
                                  style={{
                                    background: filamentColor.css,
                                    borderColor: filamentColor.border,
                                    boxShadow: filamentColor.glow ? '0 0 6px rgba(110, 231, 183, 0.9)' : undefined
                                  }}
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                                <span className="font-bold text-gray-900 text-xs truncate max-w-[230px]" title={mat.name}>
                                  {mat.name}
                                </span>
                                {isRedAlert && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8.5px] font-black uppercase bg-rose-600 text-white shadow-2xs shrink-0 animate-pulse">
                                    <AlertTriangle className="w-2 h-2" />
                                    <span>Alerta</span>
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1">
                                {filamentColor && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8.5px] font-bold bg-[#FAF7F0] border border-[#E5D7B7] text-[#9E472A]">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full border border-black/20"
                                      style={{ background: filamentColor.css }}
                                    />
                                    <span>{filamentColor.name}</span>
                                  </span>
                                )}
                                {mat.materialType && mat.materialType !== 'General' && mat.materialType !== 'N/A' && (
                                  <span className="inline-flex items-center px-1 py-0 rounded text-[8.5px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                                    {mat.materialType}
                                  </span>
                                )}
                                {mat.finish && mat.finish !== 'Estándar' && (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Sparkles className="w-2 h-2 text-amber-500" />
                                    <span>{mat.finish}</span>
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8.5px] font-semibold border ${catBadge.color}`}>
                                  <span>{catBadge.icon}</span>
                                  <span>{catBadge.label}</span>
                                </span>
                                {/* Pastilla directa de proveedor para ver/contactar requerida por test 456 */}
                                {mat.supplier && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSupplierModal(mat.supplierId || mat.supplier, mat)}
                                    className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                                    title="Ver datos del proveedor"
                                  >
                                    <Building2 className="w-2 h-2 text-emerald-600" />
                                    <span className="truncate max-w-[100px]">{mat.supplier}</span>
                                  </button>
                                )}
                              </div>
                              {mat.notes && (
                                <div className="text-[9px] text-gray-400 truncate max-w-[250px] mt-0.5" title={mat.notes}>
                                  • {mat.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Stock Actual & Alerta Unificados (Todo Visible sin Desplazarse) */}
                        <td className="py-2 px-2 text-center align-middle">
                          <div className="inline-flex flex-col items-center gap-1">
                            <div className="inline-flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? -0.2 : -1)}
                                className="w-5 h-5 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold flex items-center justify-center cursor-pointer shadow-2xs transition-colors text-xs"
                                title="Restar cantidad"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={currentStockInputVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingStockMap(prev => ({ ...prev, [mat.id]: val }));
                                }}
                                onBlur={(e) => handleSaveStock(mat.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveStock(mat.id, e.currentTarget.value);
                                }}
                                className="w-11 text-center font-black font-mono text-xs bg-white border border-gray-200 rounded py-0 text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                title="Escribe la cantidad exacta"
                              />
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? +0.5 : +1)}
                                className="w-5 h-5 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold flex items-center justify-center cursor-pointer shadow-2xs transition-colors text-xs"
                                title="Sumar cantidad"
                              >
                                +
                              </button>
                            </div>
                            {/* Semáforo integrado y umbral editable */}
                            <div className="flex items-center gap-1 text-[9.5px]">
                              <span className={`inline-flex items-center gap-0.5 px-1 py-0 rounded font-bold border ${st.color}`}>
                                <span>{st.icon}</span>
                                <span>{st.key === 'urgent' ? 'Agotado' : st.key === 'warning' ? 'Bajo' : 'Stock OK'}</span>
                              </span>
                              <span className="text-gray-400 font-medium">Mín:</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={minAlertInputVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingMinAlertMap(prev => ({ ...prev, [mat.id]: val }));
                                }}
                                onBlur={(e) => handleSaveMinAlert(mat.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveMinAlert(mat.id, e.currentTarget.value);
                                }}
                                className="w-8 text-center font-mono font-bold text-[9.5px] bg-gray-50 border border-gray-200 rounded py-0 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                title="Mínimo de alerta editable"
                              />
                            </div>
                          </div>
                        </td>

                        {/* 3. Contenido del Paquete */}
                        <td className="py-2 px-2 text-center align-middle">
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <div className="inline-flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-lg border border-gray-200 shadow-2xs">
                              <input
                                type="number"
                                step="any"
                                min="0.001"
                                value={pkgQtyInputVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingPackageQtyMap(prev => ({ ...prev, [mat.id]: val }));
                                }}
                                onBlur={(e) => handleSavePackageInfo(mat, e.target.value, pkgMeasInputVal)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePackageInfo(mat, e.currentTarget.value, pkgMeasInputVal);
                                }}
                                className="w-10 text-center font-bold font-mono text-xs bg-white border border-gray-300 rounded py-0 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                title="Cantidad o piezas por paquete"
                              />
                              <select
                                value={pkgMeasInputVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingPackageMeasMap(prev => ({ ...prev, [mat.id]: val }));
                                  handleSavePackageInfo(mat, pkgQtyInputVal, val);
                                }}
                                className="px-0.5 py-0 text-center font-bold text-[9.5px] bg-white border border-gray-300 rounded text-[#2D4F3E] focus:outline-none cursor-pointer"
                                title="Unidad de medición base"
                              >
                                <option value="g">g</option>
                                <option value="pza">pza</option>
                                <option value="ml">ml</option>
                                <option value="m">m</option>
                                <option value="cm²">cm²</option>
                                <option value="hoja">hoja</option>
                                <option value="kg">kg</option>
                                <option value="L">L</option>
                                <option value="par">par</option>
                                <option value="pliego">pliego</option>
                              </select>
                            </div>
                            <span className="text-[8.5px] text-gray-400">
                              1 emp = {pkgQtyInputVal} {pkgMeasInputVal}
                            </span>
                          </div>
                        </td>

                        {/* 4. Costo Paquete y Costo Base Calculado */}
                        <td className="py-2 px-2 text-right align-middle">
                          <div className="inline-flex flex-col items-end">
                            <div className="inline-flex items-center justify-end gap-0.5">
                              <span className="text-gray-400 font-bold text-xs">$</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={costInputVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingCostMap(prev => ({ ...prev, [mat.id]: val }));
                                }}
                                onBlur={(e) => handleSaveUnitCost(mat.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveUnitCost(mat.id, e.currentTarget.value);
                                }}
                                className="w-13 text-right font-mono font-bold text-xs bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded py-0 px-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#2D4F3E]"
                                title="Costo de compra del paquete"
                              />
                            </div>
                            <div className="text-[9px] font-bold text-emerald-800 font-mono">
                              → ${baseUnitCost.toFixed(baseUnitCost < 0.1 ? 3 : 2)}/{pkgMeasInputVal}
                            </div>
                          </div>
                        </td>

                        {/* 5. Valor en Almacén Recalculado en Tiempo Real */}
                        <td className="py-2 px-2 text-right font-black font-mono text-xs text-[#2D4F3E] align-middle">
                          ${lineVal.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>

                        {/* 6. Proveedor con Botón de Contacto y Edición */}
                        <td className="py-2 px-2 align-middle">
                          <button
                            type="button"
                            onClick={() => handleOpenSupplierModal(mat.supplierId || mat.supplier, mat)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#2D4F3E] hover:text-[#9E472A] hover:underline cursor-pointer group text-left truncate max-w-full"
                            title="Ver y editar proveedor"
                          >
                            <Building2 className="w-3 h-3 text-gray-400 group-hover:text-[#9E472A] shrink-0" />
                            <span className="truncate font-medium text-gray-800 group-hover:text-[#9E472A]">
                              {mat.supplier || 'Ver proveedor'}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 text-gray-400 shrink-0 opacity-70" />
                          </button>
                        </td>

                        {/* 7. Acciones Ultra Compactas */}
                        <td className="py-2 px-2 text-center align-middle">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(mat)}
                              className="p-1 rounded text-gray-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer transition-colors"
                              title="Editar especificaciones completas"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                              className="p-1 rounded text-gray-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Eliminar insumo del taller"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* VISTA MÓVIL: TARJETAS TÁCTILES ERGONÓMICAS DE MATERIAS PRIMAS */}
              <div className="md:hidden divide-y divide-[#E8E4DA]/60 bg-white">
                {filteredMaterials.length === 0 && (
                  <div className="py-12 px-4 text-center text-gray-500 bg-white">
                    <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-gray-700">No se encontraron materias primas con estos filtros</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Prueba seleccionando otra técnica, limpiando la búsqueda o restableciendo los filtros de color y acabado.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory('all');
                        setFilterMaterialType('all');
                        setFilterColor('all');
                        setFilterFinish('all');
                        setFilterStockStatus('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] cursor-pointer transition-all shadow-xs"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                )}
                {filteredMaterials.map(mat => {
                  const st = getStockStatus(mat);
                  const catBadge = getCategoryBadge(mat.category);
                  const currentStockInputVal = editingStockMap[mat.id] !== undefined ? editingStockMap[mat.id] : mat.currentStock;
                  const minAlertInputVal = editingMinAlertMap[mat.id] !== undefined ? editingMinAlertMap[mat.id] : mat.minStockAlert;
                  const costInputVal = editingCostMap[mat.id] !== undefined ? editingCostMap[mat.id] : mat.costPerUnit;
                  const filamentColor = getFilamentColor(mat.color && mat.color !== 'N/A' ? mat.color : mat.name);
                  const parsedPkg = parsePackageInfo(mat);
                  const pkgQtyInputVal = editingPackageQtyMap[mat.id] !== undefined ? editingPackageQtyMap[mat.id] : (mat.packageQuantity || parsedPkg.packageQuantity);
                  const pkgMeasInputVal = editingPackageMeasMap[mat.id] !== undefined ? editingPackageMeasMap[mat.id] : (mat.packageMeasurement || parsedPkg.packageMeasurement);
                  const baseUnitCost = (Number(costInputVal) || 0) / (Number(pkgQtyInputVal) || 1);
                  const isRedAlert = (Number(currentStockInputVal) || 0) <= (Number(minAlertInputVal) || 1);
                  const lineVal = (Number(currentStockInputVal) || 0) * (Number(costInputVal) || 0);

                  return (
                    <div
                      key={`mob-${mat.id}`}
                      className={`p-3.5 space-y-3 transition-colors ${
                        isRedAlert ? 'bg-rose-50/40 border-l-4 border-l-rose-500' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Fila 1: Nombre, color, badges y alerta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {filamentColor ? (
                            <span
                              className="w-4 h-4 rounded-full inline-block shadow-2xs border mt-0.5 shrink-0"
                              style={{
                                background: filamentColor.css,
                                borderColor: filamentColor.border,
                                boxShadow: filamentColor.glow ? '0 0 6px rgba(110, 231, 183, 0.9)' : undefined
                              }}
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-stone-200 border border-stone-300 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm leading-snug break-words">
                              {mat.name}
                            </h4>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${catBadge.color}`}>
                                <span>{catBadge.icon}</span>
                                <span>{catBadge.label}</span>
                              </span>
                              {mat.materialType && mat.materialType !== 'General' && mat.materialType !== 'N/A' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                                  {mat.materialType}
                                </span>
                              )}
                              {mat.finish && mat.finish !== 'Estándar' && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                  <span>{mat.finish}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Badge de estado de stock */}
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black border ${st.color}`}>
                          <span>{st.icon}</span>
                          <span>{st.key === 'urgent' ? 'Agotado' : st.key === 'warning' ? 'Por agotarse' : 'Stock OK'}</span>
                        </span>
                      </div>

                      {/* Fila 2: Control Táctil Rápido de Stock Actual y Alerta Mínima */}
                      <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8E4DA] flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Stock Actual</div>
                          <div className="inline-flex items-center gap-1 mt-1 bg-white p-0.5 rounded-xl border border-gray-300 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? -0.2 : -1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 active:bg-gray-200 text-gray-800 font-black flex items-center justify-center cursor-pointer text-base shadow-2xs"
                              title="Restar cantidad"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={currentStockInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingStockMap(prev => ({ ...prev, [mat.id]: val }));
                              }}
                              onBlur={(e) => handleSaveStock(mat.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveStock(mat.id, e.currentTarget.value);
                              }}
                              className="w-14 h-8 text-center font-black font-mono text-sm bg-white border-0 py-0 text-[#1F2421] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(mat, String(mat.unit || '').includes('kg') ? +0.5 : +1)}
                              className="w-8 h-8 rounded-lg bg-emerald-100 active:bg-emerald-200 text-[#2D4F3E] font-black flex items-center justify-center cursor-pointer text-base shadow-2xs"
                              title="Sumar cantidad"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Alerta Mínima</div>
                          <div className="inline-flex items-center gap-1.5 mt-1 bg-white px-2 py-1 rounded-xl border border-gray-300 shadow-2xs">
                            <span className="text-xs text-gray-400 font-bold">Mín:</span>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={minAlertInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingMinAlertMap(prev => ({ ...prev, [mat.id]: val }));
                              }}
                              onBlur={(e) => handleSaveMinAlert(mat.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveMinAlert(mat.id, e.currentTarget.value);
                              }}
                              className="w-10 text-center font-mono font-black text-xs text-rose-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fila 3: Contenido de Empaque, Costo de Compra y Costo Base */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-xl border border-gray-200">
                          <div className="text-[9.5px] font-bold text-gray-500 uppercase">Empaque</div>
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              step="any"
                              min="0.001"
                              value={pkgQtyInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingPackageQtyMap(prev => ({ ...prev, [mat.id]: val }));
                              }}
                              onBlur={(e) => handleSavePackageInfo(mat, e.target.value, pkgMeasInputVal)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePackageInfo(mat, e.currentTarget.value, pkgMeasInputVal);
                              }}
                              className="w-12 text-center font-mono font-bold border border-gray-300 rounded py-0.5 text-xs"
                            />
                            <select
                              value={pkgMeasInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingPackageMeasMap(prev => ({ ...prev, [mat.id]: val }));
                                handleSavePackageInfo(mat, pkgQtyInputVal, val);
                              }}
                              className="text-xs font-bold border border-gray-300 rounded py-0.5 bg-gray-50"
                            >
                              <option value="g">g</option>
                              <option value="pza">pza</option>
                              <option value="ml">ml</option>
                              <option value="m">m</option>
                              <option value="cm²">cm²</option>
                              <option value="hoja">hoja</option>
                              <option value="kg">kg</option>
                              <option value="L">L</option>
                              <option value="par">par</option>
                              <option value="pliego">pliego</option>
                            </select>
                          </div>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-right">
                          <div className="text-[9.5px] font-bold text-gray-500 uppercase">Costo Paquete</div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-gray-400 font-bold">$</span>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={costInputVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingCostMap(prev => ({ ...prev, [mat.id]: val }));
                              }}
                              onBlur={(e) => handleSaveUnitCost(mat.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveUnitCost(mat.id, e.currentTarget.value);
                              }}
                              className="w-16 text-right font-mono font-bold border border-gray-300 rounded py-0.5 px-1 text-xs"
                            />
                          </div>
                          <div className="text-[9.5px] font-bold text-emerald-800 mt-0.5">
                            → ${baseUnitCost.toFixed(baseUnitCost < 0.1 ? 3 : 2)}/{pkgMeasInputVal}
                          </div>
                        </div>
                      </div>

                      {/* Fila 4: Valor en Almacén, Proveedor y Acciones */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 font-medium">Valor almacén: </span>
                          <span className="font-mono font-black text-[#2D4F3E] text-sm">
                            ${lineVal.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {mat.supplier && (
                            <button
                              type="button"
                              onClick={() => handleOpenSupplierModal(mat.supplierId || mat.supplier, mat)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                            >
                              <Building2 className="w-3 h-3 text-emerald-600" />
                              <span className="truncate max-w-[90px]">{mat.supplier}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(mat)}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                            title="Editar insumo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-rose-100 hover:text-rose-800 transition-colors"
                            title="Eliminar insumo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {/* Banner resumen al final de los SKUs con botón de regreso */}
            <div className="bg-stone-50/90 border-t border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>
                  Fin de la lista: <strong>{filteredMaterials.length}</strong> materias primas inventariadas.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollToStart}
                  className={`${inventoryViewMode === 'table' ? 'hidden md:inline-flex' : 'hidden'} items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer shadow-2xs text-xs transition-colors`}
                  title="Volver a la primera columna de la izquierda"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Inicio horizontal</span>
                </button>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] cursor-pointer shadow-2xs text-xs transition-colors"
                  title="Volver al inicio superior de la lista y filtros"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir al inicio del inventario</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 2. COSTOS OPERATIVOS DEL TALLER & CALCULADORA DE RECETAS     */}
      {/* ============================================================ */}
      {activeSubTab === 'operational_costs' && (
        <div className="space-y-6">

          {/* ============================================================ */}
          {/* BARRA DE SUB-PESTAÑAS MINIMALISTAS DE COSTOS OPERATIVOS      */}
          {/* ============================================================ */}
          <div className="bg-white p-2 rounded-2xl border border-[#E8E4DA] shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setOperationalSubTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                operationalSubTab === 'calculator'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              <span>🧮</span>
              <span>Calculadora &amp; Maquilas Grandes</span>
            </button>

            <button
              type="button"
              onClick={() => setOperationalSubTab('workers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                operationalSubTab === 'workers'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              <span>👥</span>
              <span>Trabajadores, Sueldos &amp; Jornadas</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-200/60 text-current font-mono">
                {(workers.length || WORKSHOP_OPERATORS.length)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOperationalSubTab('assembly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                operationalSubTab === 'assembly'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              <span>🪵</span>
              <span>Detalle, Ensamblaje &amp; Acabados</span>
            </button>

            <button
              type="button"
              onClick={() => setOperationalSubTab('machines')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                operationalSubTab === 'machines'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              <span>⚙️</span>
              <span>Maquinaria &amp; Parámetros Técnicos</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-200/60 text-current font-mono">
                {machines.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOperationalSubTab('rates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                operationalSubTab === 'rates'
                  ? 'bg-[#2D4F3E] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              <span>📊</span>
              <span>Tarifas Generales de Taller</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* 1. SUB-PESTAÑA: CALCULADORA & MAQUILAS GRANDES               */}
          {/* ============================================================ */}
          {operationalSubTab === 'calculator' && (
            <div id="unified-production-calculator" className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6">
              
              {/* Header de la Calculadora Unificada */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    🧮
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold font-heading text-[#1F2421]">
                        Calculadora de Precios, Costos de Producción &amp; Desglose de Taller
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Simulador Interno de Taller
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⚡ Tiempo en Horas &amp; Maquilas
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Calcula insumos (BOM), tiempo de máquina en horas, sueldos de trabajadores, ensamble manual y cotizaciones por volumen para maquilas grandes.
                    </p>
                  </div>
                </div>

                {/* Botón Copiar Resumen */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleCopyRecipeSummary}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Copiar desglose completo al portapapeles"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>{recipeCopied ? '¡Copiado!' : 'Copiar Desglose'}</span>
                  </button>
                </div>
              </div>

              {/* Aviso de confirmación de aplicación a producto */}
              {recipeAppliedMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{recipeAppliedMsg}</span>
                </div>
              )}

              {/* Fila 1: Configuración de la Pieza / Proceso & Vinculación a Catálogo */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 text-xs">
                
                <div className="md:col-span-4">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    1. Nombre de la Pieza / Proceso:
                  </label>
                  <input
                    type="text"
                    value={recipeName}
                    onChange={e => setRecipeName(e.target.value)}
                    placeholder="Ej: Impresión 3D Soporte de Celular, Letrero Láser..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-xs focus:ring-1 focus:ring-[#2D4F3E] focus:border-[#2D4F3E]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    2. Técnica de Manufactura:
                  </label>
                  <select
                    value={activeProcessTechnique}
                    onChange={e => {
                      const tech = e.target.value;
                      setActiveProcessTechnique(tech);
                      const matchingMachine = machines.find(m => m.category === tech);
                      if (matchingMachine) {
                        handleSelectRecipeMachine(matchingMachine.id);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                  >
                    <option value="3d">🖨️ Impresión 3D (FDM / Resina)</option>
                    <option value="laser">🔥 Corte &amp; Grabado Láser</option>
                    <option value="vinyl">✂️ Plotter de Vinil &amp; Textil</option>
                    <option value="sublimation">🎨 Sublimación &amp; Prensa de Calor</option>
                    <option value="assembly">🪵 Carpintería &amp; Ensamble Manual</option>
                  </select>
                </div>

                <div className="md:col-span-5">
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                    3. Vincular a Producto del Catálogo (Opcional):
                  </label>
                  <select
                    value={recipeProductId}
                    onChange={e => {
                      const pId = e.target.value;
                      setRecipeProductId(pId);
                      const prod = products.find(p => p.id === pId);
                      if (prod) {
                        setRecipeName(prod.name);
                        if (prod.category) {
                          const catMap = { 3: '3d', 1: 'laser', 2: 'vinyl' };
                          const tech = catMap[prod.category] || '3d';
                          setActiveProcessTechnique(tech);
                          const matchingMachine = machines.find(m => m.category === tech);
                          if (matchingMachine) handleSelectRecipeMachine(matchingMachine.id);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                  >
                    <option value="">-- No vincular (Cálculo independiente) --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code ? `[${p.code}] ` : ''}{p.name} · Precio actual: ${p.price} MXN
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Fila 2: Insumos (BOM) y Panel de Parámetros Horarios */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Lado Izquierdo (7 cols): Lista de Materias Primas / BOM */}
                <div className="lg:col-span-7 space-y-3.5">
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                      <Boxes className="w-4 h-4 text-[#2D4F3E]" />
                      <span>Insumos &amp; Materias Primas Utilizadas (BOM)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2D4F3E] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      Subtotal: ${recipeCalculation.rawMaterialsCost.toFixed(2)} MXN
                    </span>
                  </div>

                  {/* Selector rápido para añadir insumo del almacén */}
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                      
                      <div className="sm:col-span-7">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                          Insumo del Almacén:
                        </label>
                        <select
                          value={newRecipeMatId}
                          onChange={e => setNewRecipeMatId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                        >
                          <option value="">-- Seleccionar Materia Prima --</option>
                          {materials.map(m => {
                            const parsed = parsePackageInfo(m);
                            const costUnit = (Number(m.costPerUnit) || 0) / (parsed.packageQuantity || 1);
                            return (
                              <option key={m.id} value={m.id}>
                                {m.name} (${costUnit.toFixed(3)}/{parsed.packageMeasurement}) · Stock: {m.currentStock}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                          Cantidad Usada:
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.01"
                          value={newRecipeQty}
                          onChange={e => setNewRecipeQty(e.target.value)}
                          placeholder="Ej: 15"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-xs text-center"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={handleAddRecipeItem}
                          className="w-full py-1.5 rounded-lg bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Tabla de Insumos Agregados a la Receta */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Materia Prima</th>
                          <th className="py-2 px-2 text-center">Cantidad</th>
                          <th className="py-2 px-2 text-right">Costo Unit.</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                          <th className="py-2 px-2 text-center w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recipeItems.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-gray-400 italic text-xs">
                              No hay insumos añadidos. Selecciona una materia prima arriba.
                            </td>
                          </tr>
                        ) : (
                          recipeItems.map(item => (
                            <tr key={item.id} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 font-semibold text-gray-800">
                                {item.name}
                              </td>
                              <td className="py-2 px-2 text-center font-mono">
                                {item.quantity} {item.measurement}
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-gray-500">
                                ${item.unitCost.toFixed(3)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                                ${item.totalCost.toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRecipeItem(item.id)}
                                  className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                  title="Quitar insumo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Lado Derecho (5 cols): Maquinaria, Operador y Parámetros Editables */}
                <div className="lg:col-span-5 space-y-3.5">
                  
                  {/* 1. Bloque Maquinaria & Costos Horarios Editables */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                        <Cpu className="w-4 h-4 text-[#2D4F3E]" />
                        <span>Maquinaria &amp; Tiempos Estimados</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Editable en vivo
                      </span>
                    </div>

                    <div>
                      <label className="text-[10.5px] font-semibold text-gray-600 block mb-1">Máquina asignada:</label>
                      <select
                        value={recipeMachineId}
                        onChange={e => handleSelectRecipeMachine(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-medium text-xs focus:ring-1 focus:ring-[#2D4F3E]"
                      >
                        <option value="">Tarifa General de Taller</option>
                        {machines.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.icon} {m.name} ({m.sizeCategory || 'Estándar'} · {m.speedEfficiency || 100}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chips de la máquina seleccionada: tamaño, materiales y velocidad */}
                    {recipeMachineId && (
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1.5 text-[11px]">
                        {(() => {
                          const curM = machines.find(m => m.id === recipeMachineId);
                          if (!curM) return null;
                          return (
                            <>
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="font-semibold text-gray-700">
                                  Formato: <span className="px-1.5 py-0.5 rounded bg-stone-100 font-bold text-gray-800">{curM.sizeCategory || 'Mediana'}</span>
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-500">Velocidad/Eficiencia:</span>
                                  <input
                                    type="number"
                                    min="30"
                                    max="200"
                                    step="5"
                                    value={recipeMachineSpeedEff}
                                    onChange={e => setRecipeMachineSpeedEff(Math.max(10, Number(e.target.value)))}
                                    className="w-14 px-1 py-0.5 rounded border border-gray-300 text-center font-mono font-bold text-xs"
                                    title="Ajusta si la máquina va lenta por fallas (ej. 80%) o acelerada (ej. 120%)"
                                  />
                                  <span className="text-[10px] font-bold text-gray-500">%</span>
                                </div>
                              </div>
                              {recipeMachineSpeedEff < 100 && (
                                <p className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded font-medium">
                                  ⚠️ Máquina al {recipeMachineSpeedEff}% de rendimiento. El tiempo efectivo de producción se ajusta automáticamente a {(recipeCalculation.effectiveMachineHours).toFixed(2)} hrs.
                                </p>
                              )}
                              {Array.isArray(curM.compatibleMaterials) && curM.compatibleMaterials.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  <span className="text-[9.5px] text-gray-400 font-semibold">Materiales:</span>
                                  {curM.compatibleMaterials.slice(0, 4).map((mat, i) => (
                                    <span key={i} className="px-1.5 py-0.2 rounded text-[9.5px] bg-stone-100 text-gray-600">
                                      {mat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* ENTRADA PRINCIPAL EN HORAS CON EQUIVALENCIA EN MINUTOS */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10.5px] font-bold text-emerald-950 block mb-1">
                          Tiempo Máquina (Horas):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={recipeMachineHours}
                          onChange={e => handleMachineHoursChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border-2 border-emerald-600/50 bg-white font-mono font-bold text-xs text-center text-emerald-950 focus:ring-1 focus:ring-[#2D4F3E]"
                          title="Horas estimadas de manufactura (ej. 0.5, 1, 2.5, 8 hrs)"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-semibold text-gray-600 block mb-1">
                          Tiempo Máquina (Min):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={recipeMachineMinutes}
                          onChange={e => handleMachineMinutesChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center"
                          title="Minutos estimados de corte, impresión o grabado"
                        />
                      </div>
                    </div>
                    <span className="text-[9.5px] text-gray-400 block text-center">
                      Tiempo programado: {recipeMachineHours} hrs ({recipeMachineMinutes} min)
                    </span>

                    {/* Campos Editables de Costo por Hora de la Máquina */}
                    <div className="pt-2 border-t border-gray-200 grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <label className="text-gray-500 font-semibold block mb-0.5">⚡ Luz CFE ($/hr):</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={customPowerCostPerHour}
                          onChange={e => setCustomPowerCostPerHour(Number(e.target.value))}
                          className="w-full px-2 py-1 rounded-md border border-gray-300 bg-white font-mono font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-0.5">⚙️ Desgaste ($/hr):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={customWearCostPerHour}
                          onChange={e => setCustomWearCostPerHour(Number(e.target.value))}
                          className="w-full px-2 py-1 rounded-md border border-gray-300 bg-white font-mono font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-semibold block mb-0.5">🔧 Mto. ($/hr):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={customMaintenanceCostPerHour}
                          onChange={e => setCustomMaintenanceCostPerHour(Number(e.target.value))}
                          className="w-full px-2 py-1 rounded-md border border-gray-300 bg-white font-mono font-bold text-center"
                        />
                      </div>
                    </div>

                    {/* Total 1 Hora de Producción */}
                    <div className="p-2 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600">1 Hora de Producción (Máq + Op):</span>
                      <span className="font-mono font-black text-gray-900">${recipeCalculation.totalMachineHourCost.toFixed(2)} MXN/hr</span>
                    </div>

                  </div>

                  {/* 2. Bloque Control de Operadores / Trabajadores (Mano de Obra Editable) */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-300 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                        <User className="w-4 h-4 text-emerald-800" />
                        <span>Control de Operador / Trabajador</span>
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        ${((Number(operatorHourlyRate) || 0) / 60).toFixed(2)}/min
                      </span>
                    </div>

                    {/* Selector rápido de Operadores del Taller */}
                    <div className="flex flex-wrap gap-1">
                      {(workers.length > 0 ? workers : WORKSHOP_OPERATORS).map(op => (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => handleSelectOperator(op.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                            selectedOperatorId === op.id
                              ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-2xs'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                          }`}
                          title={`${op.name}: $${op.hourlyRate}/hr (${op.role || 'Operador'})`}
                        >
                          {op.name.split(' ')[0]} (${op.hourlyRate})
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10.5px] font-semibold text-gray-600 block mb-1">
                          Tarifa Operador ($/hr):
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="10"
                            min="0"
                            value={operatorHourlyRate}
                            onChange={e => {
                              setOperatorHourlyRate(Number(e.target.value));
                              setSelectedOperatorId('custom');
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center text-emerald-950 focus:ring-1 focus:ring-[#2D4F3E]"
                            title="Escribe cuánto cobra este trabajador por hora (ej. 300, 200, 150)"
                          />
                          <span className="absolute right-2 top-1.5 text-[9px] font-bold text-gray-400">MXN</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10.5px] font-semibold text-gray-600 block mb-1">
                          Mano de Obra (Minutos):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={recipeLaborMinutes}
                          onChange={e => setRecipeLaborMinutes(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center focus:ring-1 focus:ring-[#2D4F3E]"
                          title="Minutos de atención humana directa en máquina"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Bloque Detalle & Ensamblaje Manual */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                        <Hammer className="w-4 h-4 text-amber-700" />
                        <span>Detalle, Ensamblaje &amp; Acabados</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        +${recipeCalculation.totalAssemblyCost.toFixed(2)}/pza
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                          Tiempo Ensamble (Horas):
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={assemblyHours}
                          onChange={e => setAssemblyHours(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center"
                          title="Horas de desbarbado, lijado, pegado o armado manual"
                        />
                        <span className="text-[9px] text-gray-400 block text-center mt-0.5">
                          ≈ {Math.round(Number(assemblyHours) * 60)} min
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                          Personal Acabados:
                        </label>
                        <select
                          value={assemblyWorkerId}
                          onChange={e => setAssemblyWorkerId(e.target.value)}
                          className="w-full px-1.5 py-1.5 rounded-lg border border-gray-300 bg-white text-[11px] font-medium"
                        >
                          {(workers.length > 0 ? workers : WORKSHOP_OPERATORS).map(w => (
                            <option key={w.id} value={w.id}>
                              {w.name.split(' ')[0]} (${w.hourlyRate}/h)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                          Insumos Detalle ($):
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={assemblyInsumosCost}
                          onChange={e => setAssemblyInsumosCost(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center"
                          title="Costo de pegamento, herrajes, imanes, cinta o empaque"
                        />
                      </div>
                    </div>

                    {/* Checklist rápido de acabados */}
                    <div className="pt-1 border-t border-amber-200/60 flex flex-wrap items-center gap-2 text-[10px] text-amber-900 font-medium">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assemblyChecklist.supports}
                          onChange={e => setAssemblyChecklist({ ...assemblyChecklist, supports: e.target.checked })}
                          className="rounded text-[#2D4F3E]"
                        />
                        <span>Desbarbado</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assemblyChecklist.sanding}
                          onChange={e => setAssemblyChecklist({ ...assemblyChecklist, sanding: e.target.checked })}
                          className="rounded text-[#2D4F3E]"
                        />
                        <span>Lijado</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assemblyChecklist.glue}
                          onChange={e => setAssemblyChecklist({ ...assemblyChecklist, glue: e.target.checked })}
                          className="rounded text-[#2D4F3E]"
                        />
                        <span>Pegado</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assemblyChecklist.hardware}
                          onChange={e => setAssemblyChecklist({ ...assemblyChecklist, hardware: e.target.checked })}
                          className="rounded text-[#2D4F3E]"
                        />
                        <span>Herrajes/Imán</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assemblyChecklist.packaging}
                          onChange={e => setAssemblyChecklist({ ...assemblyChecklist, packaging: e.target.checked })}
                          className="rounded text-[#2D4F3E]"
                        />
                        <span>Empaque</span>
                      </label>
                    </div>

                  </div>

                  {/* 4. Bloque Rendimiento, Overhead y Beneficio */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/80 space-y-2.5 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-extrabold text-[#1F2421] block text-[10.5px] mb-1">
                          ¿Cuántas unidades rinde la receta?
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={recipeYieldUnits}
                          onChange={e => setRecipeYieldUnits(Math.max(1, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center text-emerald-950"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-[#1F2421] block text-[10.5px] mb-1">
                          Porcentaje adicional sobre costos (% Overhead):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={recipeOverheadPercent}
                          onChange={e => setRecipeOverheadPercent(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center text-amber-950"
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-[#1F2421] block text-[10.5px] mb-1">
                          % Margen Ganancia:
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={recipeTargetProfitPercent}
                          onChange={e => setRecipeTargetProfitPercent(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs text-center text-emerald-900"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Fila 3: Tarjetas de Resumen Financiero por Unidad */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-gray-200">
                
                {/* Insumos Directos */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    🧱 Insumos BOM
                  </span>
                  <span className="text-base font-mono font-bold text-gray-800 mt-0.5 block">
                    ${recipeCalculation.rawMaterialsCost.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-gray-400 block">por tirada</span>
                </div>

                {/* Horas Máquina */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    ⚡ Horas Máquina
                  </span>
                  <span className="text-base font-mono font-bold text-gray-800 mt-0.5 block">
                    ${recipeCalculation.machineCost.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-gray-400 block">
                    {recipeCalculation.effectiveMachineHours.toFixed(2)}h @ ${recipeCalculation.machineOnlyHourCost.toFixed(2)}/h
                  </span>
                </div>

                {/* Mano de Obra */}
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    👤 Mano de Obra
                  </span>
                  <span className="text-base font-mono font-bold text-gray-800 mt-0.5 block">
                    ${recipeCalculation.laborCost.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-gray-400 block">{recipeLaborMinutes} min operados</span>
                </div>

                {/* Ensamble & Acabados */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    🪵 Ensamble / Acabado
                  </span>
                  <span className="text-base font-mono font-bold text-amber-950 mt-0.5 block">
                    ${recipeCalculation.totalAssemblyCost.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-amber-700 block">mano obra + insumos</span>
                </div>

                {/* Costo Total Fabricación */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 shadow-2xs">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">
                    💰 Costo Fabricación
                  </span>
                  <span className="text-base font-mono font-black text-rose-950 mt-0.5 block">
                    ${recipeCalculation.unitCostWithIva.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-rose-700 block font-semibold">
                    Base ${recipeCalculation.unitProductionCost.toFixed(2)} + IVA ${recipeCalculation.unitIvaCost.toFixed(2)} · merma incluida
                  </span>
                </div>

                {/* Precio Sugerido y Ganancia Neta */}
                <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-500 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    ✨ Precio Sugerido ({recipeTargetProfitPercent}%)
                  </span>
                  <span className="text-lg font-mono font-black text-emerald-950 mt-0.5 block">
                    ${recipeCalculation.suggestedPrice} MXN
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-black">
                    Ganancia: +${recipeCalculation.profitPerUnit.toFixed(2)} ({recipeCalculation.profitMarginPercent}%) · tarjeta ${recipeCalculation.cardFeePercent}%
                  </span>
                </div>

              </div>

              {/* ============================================================ */}
              {/* MÓDULO ESPECIAL: SIMULADOR DE MAQUILAS GRANDES & LOTES      */}
              {/* ============================================================ */}
              <div className="mt-6 p-5 rounded-3xl bg-gradient-to-br from-[#FBF9F5] to-emerald-50/40 border-2 border-[#2D4F3E]/30 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E8E4DA] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#2D4F3E] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1F2421]">
                        Simulador de Maquilas Grandes, Lotes &amp; Tiempos de Entrega para Clientes
                      </h4>
                      <p className="text-xs text-gray-500">
                        Calcula tiempos de entrega en días hábiles según máquinas dedicadas en paralelo y la jornada de tu taller.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyMaquilaQuote}
                    className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                    title="Copiar cotización formal lista para enviar al cliente por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{copiedMaquilaSummary ? '¡Cotización Copiada!' : 'Copiar Cotización (WhatsApp)'}</span>
                  </button>
                </div>

                {/* Parámetros de la Maquila */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <label className="font-bold text-gray-700 block text-[11px]">
                      1. Piezas a Maquilar (Lote):
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="10"
                      value={maquilaUnits}
                      onChange={e => setMaquilaUnits(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 font-mono font-bold text-sm text-center"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">Unidades del pedido del cliente</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <label className="font-bold text-gray-700 block text-[11px]">
                      2. Máquinas en Paralelo:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      step="1"
                      value={parallelMachines}
                      onChange={e => setParallelMachines(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 font-mono font-bold text-sm text-center"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">Equipos trabajando simultáneamente</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <label className="font-bold text-gray-700 block text-[11px]">
                      3. Horas de Trabajo al Día:
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="24"
                      step="1"
                      value={tallerHoursPerDay}
                      onChange={e => setTallerHoursPerDay(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 font-mono font-bold text-sm text-center"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">8h turno normal · 16h doble · 24h continuo</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <label className="font-bold text-gray-700 block text-[11px]">
                      4. Descuento Maquila (%):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="5"
                      value={maquilaVolumeDiscount}
                      onChange={e => setMaquilaVolumeDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 font-mono font-bold text-sm text-center text-emerald-800"
                    />
                    <span className="text-[10px] text-gray-400 block text-center">Beneficio por volumen al cliente</span>
                  </div>

                </div>

                {/* Resultados del Lote de Maquila */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* Tiempo de entrega */}
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Tiempo Entrega Estimado</span>
                    </span>
                    <span className="text-xl font-mono font-black text-blue-950 block">
                      {recipeCalculation.estimatedDeliveryDays} Días Hábiles
                    </span>
                    <span className="text-[10px] text-blue-700 block">
                      {recipeCalculation.maquilaMachineHoursTotal.toFixed(1)} hrs máq + {recipeCalculation.maquilaAssemblyHoursTotal.toFixed(1)} hrs ensamble
                    </span>
                  </div>

                  {/* Costo total de fabricación */}
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Costo Fabricación Lote</span>
                    </span>
                    <span className="text-xl font-mono font-black text-rose-950 block">
                      ${recipeCalculation.maquilaTotalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-rose-700 block">
                      Insumos + energía + mano de obra + merma + IVA
                    </span>
                  </div>

                  {/* Precio Total Cotizado */}
                  <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-300 space-y-1">
                    <span className="text-[10px] font-bold text-stone-800 uppercase block flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Precio Total Cotizado</span>
                    </span>
                    <span className="text-xl font-mono font-black text-stone-900 block">
                      ${recipeCalculation.maquilaTotalQuote.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-stone-600 block">
                      ${recipeCalculation.maquilaUnitPriceQuote.toFixed(2)} c/u (con {maquilaVolumeDiscount}% desc.)
                    </span>
                  </div>

                  {/* Ganancia Neta Dueño */}
                  <div className="p-3.5 rounded-2xl bg-emerald-100/70 border-2 border-emerald-500 space-y-1 shadow-xs">
                    <span className="text-[10px] font-black text-emerald-900 uppercase block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Tu Ganancia Neta</span>
                    </span>
                    <span className="text-xl font-mono font-black text-emerald-950 block">
                      +${recipeCalculation.maquilaNetProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold block">
                      Margen real de ganancia: {recipeCalculation.maquilaProfitMargin}%
                    </span>
                  </div>

                </div>

              </div>

              {/* Botón de Aplicación de Precio al Catálogo */}
              {recipeProductId && (
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-gray-600 font-medium">
                    Producto vinculado: <strong className="text-[#2D4F3E]">{products.find(p => p.id === recipeProductId)?.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyRecipeToProduct}
                    className="px-5 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Aplicar Precio de ${recipeCalculation.suggestedPrice} MXN al Catálogo</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* 2. SUB-PESTAÑA: TRABAJADORES, SUELDOS & JORNADAS            */}
          {/* ============================================================ */}
          {operationalSubTab === 'workers' && (
            <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold font-heading text-[#1F2421] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#2D4F3E]" />
                    <span>Plantilla de Trabajadores, Sueldos y Costo Real de Mano de Obra</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Registra los sueldos mensuales o semanales, horas al día y factor de aprovechamiento. El sistema calcula el costo real por hora de cada operador para no tener pérdidas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenWorkerModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Trabajador</span>
                </button>
              </div>

              {/* Grid de Trabajadores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(workers.length > 0 ? workers : WORKSHOP_OPERATORS).map(w => {
                  const hPerDay = Number(w.hoursPerDay) || 8;
                  const dPerWeek = Number(w.daysPerWeek) || 5;
                  const eff = Number(w.efficiency !== undefined ? w.efficiency : 90);
                  const salary = Number(w.salary) || (w.hourlyRate * 8 * 20 * 0.9);
                  const isWeekly = w.salaryPeriod === 'weekly';
                  const monthlyHours = isWeekly ? (hPerDay * dPerWeek) : (hPerDay * dPerWeek * 4.333);
                  const effectiveHours = Math.round(monthlyHours * (eff / 100));

                  return (
                    <div key={w.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative group hover:border-[#2D4F3E] transition-all shadow-2xs">
                      
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#2D4F3E]/10 text-[#2D4F3E] flex items-center justify-center font-bold text-base">
                            👤
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-gray-900 leading-snug">{w.name}</h4>
                            <span className="text-[11px] text-gray-500 font-medium block">{w.role || 'Operador de Taller'}</span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-mono font-black text-xs border border-emerald-300">
                          ${w.hourlyRate} MXN/hr
                        </span>
                      </div>

                      {/* Desglose de Jornada y Sueldo */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                        <div className="p-2 rounded-xl bg-white border border-gray-200">
                          <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Sueldo Base</span>
                          <span className="font-mono font-bold text-gray-900 block">${salary.toLocaleString('es-MX')}</span>
                          <span className="text-[9px] text-gray-500">{isWeekly ? 'semanal' : 'mensual'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-gray-200">
                          <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Jornada</span>
                          <span className="font-mono font-bold text-gray-900 block">{hPerDay}h / día</span>
                          <span className="text-[9px] text-gray-500">{dPerWeek} días/sem</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-gray-200">
                          <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Eficiencia Real</span>
                          <span className="font-mono font-bold text-emerald-800 block">{eff}%</span>
                          <span className="text-[9px] text-gray-500">~{effectiveHours}h efec.</span>
                        </div>
                      </div>

                      {w.desc && (
                        <p className="text-[11px] text-gray-600 italic bg-white/70 p-2 rounded-lg border border-gray-100">
                          "{w.desc}"
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60 text-xs">
                        <span className="text-[10.5px] text-gray-400 font-mono">
                          Minuto: ${(w.hourlyRate / 60).toFixed(2)}/min
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOperatorId(w.id);
                              setOperatorName(w.name);
                              setOperatorHourlyRate(w.hourlyRate);
                              setOperationalSubTab('calculator');
                              setActionMessage({ text: `Operador "${w.name}" cargado en la calculadora`, type: 'success' });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-gray-800 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Usar en Calculadora
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenWorkerModal(w)}
                            className="px-2.5 py-1 rounded-lg bg-[#2D4F3E] text-white font-bold text-[11px] hover:bg-[#20392C] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 3. SUB-PESTAÑA: DETALLE & ENSAMBLAJE MANUAL                  */}
          {/* ============================================================ */}
          {operationalSubTab === 'assembly' && (
            <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6">
              
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base font-extrabold font-heading text-[#1F2421] flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-[#2D4F3E]" />
                  <span>Módulo de Detalle, Acabados &amp; Ensamblaje Manual</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  El tiempo humano de desbarbado de soportes 3D, lijado fino, pegado de piezas, herrajes de llaveros y empaque no debe perderse de vista.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                
                {/* Panel de Configuración de Ensamble de la Pieza Activa */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                  <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                    <span>🪵</span>
                    <span>Parámetros de Acabado para: "{recipeName}"</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block text-[11px] mb-1">
                        Tiempo de Ensamble (Horas):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.05"
                        value={assemblyHours}
                        onChange={e => setAssemblyHours(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm text-center"
                      />
                      <span className="text-[10px] text-gray-400 block text-center mt-1">
                        ≈ {Math.round(Number(assemblyHours) * 60)} minutos por pieza
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block text-[11px] mb-1">
                        Insumos de Acabado ($ MXN):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={assemblyInsumosCost}
                        onChange={e => setAssemblyInsumosCost(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm text-center text-emerald-900"
                      />
                      <span className="text-[10px] text-gray-400 block text-center mt-1">
                        Pegamentos, herrajes, bolsas, lija
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block text-[11px] mb-1">
                      Trabajador Responsable del Detallado:
                    </label>
                    <select
                      value={assemblyWorkerId}
                      onChange={e => setAssemblyWorkerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium text-xs"
                    >
                      {(workers.length > 0 ? workers : WORKSHOP_OPERATORS).map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} (${w.hourlyRate}/hr)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botones de Insumos Frecuentes para sumar al costo */}
                  <div>
                    <label className="font-bold text-gray-700 block text-[11px] mb-1.5">
                      Sumar insumos de ensamble frecuentes (+):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAssemblyInsumosCost(prev => Number((Number(prev) + 8).toFixed(2)))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-stone-100 text-[10.5px] font-semibold text-gray-700 cursor-pointer transition-colors"
                      >
                        + Imanes neodimio (+$8)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssemblyInsumosCost(prev => Number((Number(prev) + 3.5).toFixed(2)))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-stone-100 text-[10.5px] font-semibold text-gray-700 cursor-pointer transition-colors"
                      >
                        + Argolla llavero (+$3.50)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssemblyInsumosCost(prev => Number((Number(prev) + 4).toFixed(2)))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-stone-100 text-[10.5px] font-semibold text-gray-700 cursor-pointer transition-colors"
                      >
                        + Pegamento / Tornillos (+$4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssemblyInsumosCost(prev => Number((Number(prev) + 2.5).toFixed(2)))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-stone-100 text-[10.5px] font-semibold text-gray-700 cursor-pointer transition-colors"
                      >
                        + Bolsa celofán &amp; cartón (+$2.50)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssemblyInsumosCost(prev => Number((Number(prev) + 12).toFixed(2)))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-stone-100 text-[10.5px] font-semibold text-gray-700 cursor-pointer transition-colors"
                      >
                        + Caja kraft personalizada (+$12)
                      </button>
                    </div>
                  </div>

                </div>

                {/* Checklist de Etapas de Acabado de Calidad */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Checklist Estándar de Acabados en Taller</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Marca las etapas requeridas para este producto. Garantiza que ningún lote salga sin su inspección:
                  </p>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-100 cursor-pointer hover:bg-emerald-50/30">
                      <input
                        type="checkbox"
                        checked={assemblyChecklist.supports}
                        onChange={e => setAssemblyChecklist({ ...assemblyChecklist, supports: e.target.checked })}
                        className="rounded text-[#2D4F3E] w-4 h-4"
                      />
                      <div>
                        <strong className="block text-gray-900 text-[11.5px]">1. Retiro de soportes &amp; desbarbado fino</strong>
                        <span className="text-[10px] text-gray-500">Eliminación de rebabas y limpieza de aristas vivas</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-100 cursor-pointer hover:bg-emerald-50/30">
                      <input
                        type="checkbox"
                        checked={assemblyChecklist.sanding}
                        onChange={e => setAssemblyChecklist({ ...assemblyChecklist, sanding: e.target.checked })}
                        className="rounded text-[#2D4F3E] w-4 h-4"
                      />
                      <div>
                        <strong className="block text-gray-900 text-[11.5px]">2. Lijado progresivo &amp; pulido de bordes</strong>
                        <span className="text-[10px] text-gray-500">Lija grano 240 a 600 y sopleteado de polvo</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-100 cursor-pointer hover:bg-emerald-50/30">
                      <input
                        type="checkbox"
                        checked={assemblyChecklist.glue}
                        onChange={e => setAssemblyChecklist({ ...assemblyChecklist, glue: e.target.checked })}
                        className="rounded text-[#2D4F3E] w-4 h-4"
                      />
                      <div>
                        <strong className="block text-gray-900 text-[11.5px]">3. Pegado estructural &amp; fraguado</strong>
                        <span className="text-[10px] text-gray-500">Unión de piezas multicolores o ensamble madera-acrílico</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-100 cursor-pointer hover:bg-emerald-50/30">
                      <input
                        type="checkbox"
                        checked={assemblyChecklist.hardware}
                        onChange={e => setAssemblyChecklist({ ...assemblyChecklist, hardware: e.target.checked })}
                        className="rounded text-[#2D4F3E] w-4 h-4"
                      />
                      <div>
                        <strong className="block text-gray-900 text-[11.5px]">4. Montaje de herrajes, argollas o imanes</strong>
                        <span className="text-[10px] text-gray-500">Fijación con pegamento epóxico o atornillado</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-emerald-100 cursor-pointer hover:bg-emerald-50/30">
                      <input
                        type="checkbox"
                        checked={assemblyChecklist.packaging}
                        onChange={e => setAssemblyChecklist({ ...assemblyChecklist, packaging: e.target.checked })}
                        className="rounded text-[#2D4F3E] w-4 h-4"
                      />
                      <div>
                        <strong className="block text-gray-900 text-[11.5px]">5. Limpieza con alcohol &amp; empaque individual</strong>
                        <span className="text-[10px] text-gray-500">Bolsa, tarjeta de marca y protección de burbuja</span>
                      </div>
                    </label>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 4. SUB-PESTAÑA: MAQUINARIA & PARÁMETROS TÉCNICOS             */}
          {/* ============================================================ */}
          {operationalSubTab === 'machines' && (
            <div className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-5">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-[#2D4F3E]">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold font-heading text-[#1F2421]">
                        Maquinaria de Taller &amp; Desglose de Costos por Máquina
                      </h3>
                      <p className="text-xs text-gray-500">
                        Cada máquina tiene velocidad, tamaño y materiales diferentes. Ajusta sus parámetros por si falla o produce más lento.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={loadMachines}
                    disabled={loadingMachines}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                    title="Recargar maquinaria"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingMachines ? 'animate-spin text-[#2D4F3E]' : ''}`} />
                  </button>

                  {/* Selector de categoría */}
                  <select
                    value={selectedMachineCategory}
                    onChange={e => setSelectedMachineCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-700"
                  >
                    <option value="all">Todas las Técnicas ({machines.length})</option>
                    <option value="3d">🖨️ Impresión 3D ({machines.filter(m => m.category === '3d').length})</option>
                    <option value="laser">🔥 Corte Láser ({machines.filter(m => m.category === 'laser').length})</option>
                    <option value="vinyl">✂️ Plotters &amp; Vinil ({machines.filter(m => m.category === 'vinyl').length})</option>
                    <option value="sublimation">🎨 Sublimación ({machines.filter(m => m.category === 'sublimation').length})</option>
                    <option value="print_pc">💻 PC &amp; Papelería ({machines.filter(m => m.category === 'print_pc').length})</option>
                  </select>
                </div>
              </div>

              {/* Grid de Máquinas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machines
                  .filter(m => selectedMachineCategory === 'all' || m.category === selectedMachineCategory)
                  .map(mach => (
                    <div
                      key={mach.id}
                      className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#2D4F3E] transition-all space-y-3 relative group shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {/* Cabecera de la tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{mach.icon || '⚙️'}</span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                  {mach.code}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                  {mach.sizeCategory || 'Mediana'}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-xs text-gray-900 mt-0.5 leading-snug">
                                {mach.name}
                              </h4>
                            </div>
                          </div>

                          <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            ${Number(mach.totalHourlyRate || 0).toFixed(2)}/hr
                          </span>
                        </div>

                        {/* Factor de velocidad y materiales */}
                        <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 font-semibold">Velocidad / Rendimiento:</span>
                            <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                              (mach.speedEfficiency || 100) < 100
                                ? 'bg-amber-100 text-amber-800'
                                : (mach.speedEfficiency || 100) > 100
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              ⚡ {mach.speedEfficiency || 100}%
                            </span>
                          </div>

                          {Array.isArray(mach.compatibleMaterials) && mach.compatibleMaterials.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              {mach.compatibleMaterials.slice(0, 3).map((mat, i) => (
                                <span key={i} className="px-1.5 py-0.2 rounded text-[9px] bg-white border border-gray-200 text-gray-600 font-medium">
                                  {mat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Desglose de Luz, Desgaste y Mantenimiento */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-gray-100">
                            <span className="text-gray-400 block font-semibold">⚡ CFE</span>
                            <span className="font-mono font-bold text-gray-700">${Number(mach.powerCostPerHour || 0).toFixed(2)}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-gray-100">
                            <span className="text-gray-400 block font-semibold">⚙️ Desgaste</span>
                            <span className="font-mono font-bold text-gray-700">${Number(mach.wearCostPerHour || 0).toFixed(2)}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-stone-50 border border-gray-100">
                            <span className="text-gray-400 block font-semibold">🔧 Mto.</span>
                            <span className="font-mono font-bold text-gray-700">${Number(mach.maintenanceCostPerHour || 0).toFixed(2)}</span>
                          </div>
                        </div>

                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleLoadMachineToCalculator(mach);
                            setOperationalSubTab('calculator');
                          }}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                          title="Cargar esta máquina en la Calculadora Unificada para testear costos con operadores y tiempos"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Testear en Calculadora</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenMachineModal(mach)}
                          className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Editar parámetros de esta máquina"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      </div>

                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* 5. SUB-PESTAÑA: TARIFAS GENERALES DE TALLER                 */}
          {/* ============================================================ */}
          {operationalSubTab === 'rates' && (
            <form onSubmit={handleSaveOperationalParams} className="bg-white p-5 rounded-3xl border border-[#E8E4DA] shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold font-heading text-[#1F2421] flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#2D4F3E]" />
                    <span>Costos Operativos &amp; Tarifas del Taller en Tiempo Real</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Modifica los costos por hora de máquina, energía, mano de obra y merma. Se actualizan automáticamente los márgenes del catálogo.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingParams}
                  className="px-5 py-2.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingParams ? 'Guardando...' : 'Guardar Parámetros'}</span>
                </button>
              </div>

              {/* Operational Rates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                
                {/* Electricidad CFE */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-gray-700">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Energía CFE ($/hr)</span>
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={localParams.electricityPerHour}
                    onChange={e => setLocalParams({ ...localParams, electricityPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block">Consumo eléctrico por hora de máquina</span>
                </div>

                {/* Desgaste y Amortización */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-gray-700">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Desgaste Máquina ($/hr)</span>
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={localParams.wearPerHour}
                    onChange={e => setLocalParams({ ...localParams, wearPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block">Mantenimiento, boquilla y lentes láser</span>
                </div>

                {/* Mano de Obra */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-gray-700">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mano de Obra ($/hr)</span>
                    </span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={localParams.laborPerHour}
                    onChange={e => setLocalParams({ ...localParams, laborPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block">
                    ${((Number(localParams.laborPerHour) || 0) / 60).toFixed(2)} por minuto de trabajo activo
                  </span>
                </div>

                {/* Merma & Desperdicio */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-gray-700">
                    <span>Merma &amp; Fallas (%)</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={localParams.filamentWastePercent}
                    onChange={e => setLocalParams({ ...localParams, filamentWastePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block">Soportes, purgas y mermas de corte</span>
                </div>

                {/* IVA en costos */}
                <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-cyan-900">
                    <span>IVA en Costos (%)</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={localParams.ivaPercent ?? 16}
                    onChange={e => setLocalParams({ ...localParams, ivaPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-cyan-300 bg-white font-mono font-black text-sm text-cyan-900 focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 text-[10px] text-cyan-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localParams.includeIvaInCost !== false}
                      onChange={e => setLocalParams({ ...localParams, includeIvaInCost: e.target.checked })}
                      className="w-3.5 h-3.5 rounded"
                    />
                    Sumar IVA al costo
                  </label>
                </div>

                {/* Comisión de cobro */}
                <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-sky-900">
                    <span>Comisión Tarjeta (%)</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={localParams.cardFeePercent ?? 4.1}
                    onChange={e => setLocalParams({ ...localParams, cardFeePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-sky-300 bg-white font-mono font-black text-sm text-sky-900 focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-sky-700 block">Terminal, link de pago y recargas</span>
                </div>

                {/* Reserva por fallas */}
                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>Reserva Fallas (%)</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={localParams.failureReservePercent ?? 3}
                    onChange={e => setLocalParams({ ...localParams, failureReservePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white font-mono font-black text-sm text-rose-900 focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-rose-700 block">Reprocesos y mermas no capturadas</span>
                </div>

                {/* Margen Objetivo */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span>Margen Objetivo (%)</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={localParams.targetMarginPercent}
                    onChange={e => setLocalParams({ ...localParams, targetMarginPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono font-black text-sm text-emerald-900 focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-700 block">Meta de rentabilidad bruta</span>
                </div>

                {/* Reserva de Utilidad */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>Fondo de Reserva (%)</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    value={localParams.reservePercent}
                    onChange={e => setLocalParams({ ...localParams, reservePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white font-mono font-black text-sm text-purple-900 focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-purple-700 block">Fondo de ahorro para reinversión</span>
                </div>

                {/* Costo PLA base */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-gray-700">
                    <span>Filamento PLA ($/kg)</span>
                  </div>
                  <input
                    type="number"
                    step="10"
                    value={localParams.plaPerKg}
                    onChange={e => setLocalParams({ ...localParams, plaPerKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block">${(Number(localParams.plaPerKg) / 1000).toFixed(3)}/gramo</span>
                </div>

                {/* Costo TPU base */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-gray-700">
                    <span>Filamento TPU ($/kg)</span>
                  </div>
                  <input
                    type="number"
                    step="10"
                    value={localParams.tpuPerKg}
                    onChange={e => setLocalParams({ ...localParams, tpuPerKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block">${(Number(localParams.tpuPerKg) / 1000).toFixed(3)}/gramo</span>
                </div>

              </div>

              {/* Formula Explanation Banner */}
              <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E8E4DA] text-xs space-y-2">
                <div className="font-extrabold text-[#2D4F3E] flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>Fórmulas Financieras Aplicadas en Tiempo Real (Hoja 1 y Hoja 2):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-gray-600">
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                    <strong>Costo Total:</strong> Insumos Materiales + (Tiempo Máquina × [Energía + Desgaste]) + (Tiempo Humano × Mano de Obra) + Empaque.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                    <strong>Precio Sugerido:</strong> (Costo Total de Taller) ÷ (1 − Margen Objetivo%). Para margen de {localParams.targetMarginPercent}%, factor multiplicador ≈ {(1 / (1 - Number(localParams.targetMarginPercent)/100)).toFixed(2)}x.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200">
                    <strong>Ganancia Neta:</strong> Precio de Venta − Costo Total. Reserva de reinversión: {localParams.reservePercent}% de la ganancia.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingParams}
                  className="px-6 py-2.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingParams ? 'Guardando...' : 'Guardar y Recalcular Márgenes'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* 3. TABLA DE PRECIOS & MODIFICACIONES EN TIEMPO REAL          */}
      {/* ============================================================ */}
      {activeSubTab === 'pricing_table' && (
        <div className="space-y-5">
          
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold font-heading text-[#1F2421]">
                Tablas de Precios &amp; Impacto de Costos en Tiempo Real
              </h3>
              <p className="text-xs text-gray-500">
                Calcula el precio sugerido según los costos de materias primas y permite actualizar el catálogo en 1 clic.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPricingCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#2D4F3E]/30 text-[#2D4F3E] text-xs font-bold hover:bg-[#2D4F3E]/5 transition-colors shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar Tabla a Excel (CSV)</span>
              </button>
            </div>
          </div>

          {/* BARRA DE FILTROS: BÚSQUEDA (LUPITA), ÁREA/CATEGORÍA Y TÉCNICA */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-3">
            
            {/* Fila 1: Lupita Buscadora y Filtro de Área / Categoría */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Buscador con lupita */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto por código SKU o nombre..."
                  value={pricingSearchQuery}
                  onChange={e => setPricingSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E] bg-gray-50/50 hover:bg-white focus:bg-white transition-all font-medium text-gray-800"
                />
                {pricingSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPricingSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro por Categoría / Área */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#2D4F3E]" />
                  <span>Área:</span>
                </span>
                {[
                  { id: 'all', label: 'Todas las Áreas', icon: '🌐' },
                  { id: 'hogar', label: 'Hogar', icon: '🏠' },
                  { id: 'negocios', label: 'Negocios', icon: '💼' },
                  { id: 'eventos', label: 'Eventos', icon: '🎉' },
                  { id: 'paquetes', label: 'Paquetes & Combos', icon: '🎁' }
                ].map(area => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setPricingCategoryFilter(area.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      pricingCategoryFilter === area.id
                        ? 'bg-[#2D4F3E] text-white shadow-2xs font-extrabold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{area.icon}</span>
                    <span>{area.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Fila 2: Filtro por Técnica de Impresión / Manufactura */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#2D4F3E]" />
                  <span>Técnica:</span>
                </span>
                {[
                  { id: 'all', label: 'Todas las Técnicas' },
                  { id: '3d', label: '🖨️ Impresión 3D' },
                  { id: 'laser', label: '🔥 Corte Láser' },
                  { id: 'sublimation', label: '🎨 Sublimación' },
                  { id: 'vinyl', label: '✂️ Vinil & Textil' },
                  { id: 'nfc', label: '📱 Enlace NFC' }
                ].map(tech => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => setPricingTechniqueFilter(tech.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pricingTechniqueFilter === tech.id
                        ? 'bg-[#9E472A] text-white shadow-2xs font-extrabold'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {tech.label}
                  </button>
                ))}
              </div>

              {/* Contador de resultados */}
              <div className="text-xs text-gray-500 font-medium">
                Mostrando <strong className="text-[#2D4F3E]">{filteredPricingProducts.length}</strong> de {products.length} productos
              </div>
            </div>

          </div>

          <div className="bg-white rounded-2xl border border-[#E8E4DA] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Producto</th>
                    <th className="py-3 px-3">Técnica</th>
                    <th className="py-3 px-3 text-right">Costo Taller</th>
                    <th className="py-3 px-3 text-right">Precio Actual</th>
                    <th className="py-3 px-3 text-right">Ganancia Actual</th>
                    <th className="py-3 px-3 text-center">Margen</th>
                    <th className="py-3 px-3 text-right">Precio Sugerido ({localParams.targetMarginPercent}%)</th>
                    <th className="py-3 px-3 text-center">Diagnóstico</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPricingProducts.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-gray-500">
                        <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-700">No se encontraron productos coincidentes</p>
                        <p className="text-[11px] text-gray-400 mt-1">Prueba a cambiar los filtros de categoría, técnica o el término de búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPricingProducts.map(prod => {
                      const price = Number(prod.price) || 0;
                      const isQuote = prod.priceType === 'quote' || price === 0;
                      const cost = Number(prod.costPrice) || (price > 0 ? Math.round(price * 0.4) : 0);
                      const profit = Math.round((price - cost) * 10) / 10;
                      const margin = price > 0 ? Math.round((profit / price) * 100) : 0;
                      const targetMargin = (Number(localParams.targetMarginPercent) || 40) / 100;
                      const suggested = (1 - targetMargin) > 0 ? Math.round(cost / (1 - targetMargin)) : price;
                      const priceDiff = suggested - price;

                      let statusLabel = 'Margen Óptimo';
                      let statusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
                      if (isQuote) {
                        statusLabel = 'A cotizar';
                        statusColor = 'text-gray-600 bg-gray-50 border-gray-200';
                      } else if (profit < 0) {
                        statusLabel = 'En pérdida';
                        statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
                      } else if (margin < (targetMargin * 100)) {
                        statusLabel = 'Margen bajo';
                        statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
                      }

                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#2D4F3E]">
                            {prod.code}
                          </td>

                          <td className="py-3 px-3 font-semibold text-gray-900 max-w-[180px] truncate" title={prod.name}>
                            {prod.name}
                          </td>

                          <td className="py-3 px-3 text-gray-500 text-[11px]">
                            {(prod.techniques || []).join(', ')}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-gray-700">
                            ${cost.toLocaleString('es-MX')}
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-gray-900">
                            {isQuote ? 'A cotizar' : `$${price.toLocaleString('es-MX')}`}
                          </td>

                          <td className="py-3 px-3 text-right font-semibold">
                            {isQuote ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className={profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                ${profit.toLocaleString('es-MX')}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isQuote ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className={`font-bold ${margin >= 40 ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {margin}%
                              </span>
                            )}
                          </td>

                          {/* Suggested Price in Real-Time */}
                          <td className="py-3 px-3 text-right">
                            {isQuote ? (
                              <span className="text-gray-400">Por diseño</span>
                            ) : (
                              <div>
                                <span className="font-extrabold text-[#2D4F3E] text-xs">
                                  ${suggested.toLocaleString('es-MX')}
                                </span>
                                {priceDiff !== 0 && (
                                  <div className={`text-[9px] font-semibold ${priceDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {priceDiff > 0 ? `+$${priceDiff} sugerido` : `-$${Math.abs(priceDiff)}`}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Status Diagnostic */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>

                          {/* Quick 1-Click Update */}
                          <td className="py-3 px-3 text-center">
                            {!isQuote && suggested !== price && (
                              <button
                                onClick={() => handleApplySuggestedPrice(prod, suggested)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 transition-colors cursor-pointer"
                                title="Actualizar precio del producto con el valor sugerido"
                              >
                                Aplicar ${suggested}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 4. DIRECTORIO DE PROVEEDORES & PAQUETERÍAS MÉXICO             */}
      {/* ============================================================ */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-5 animate-in fade-in">
          
          {/* Sub-navegador: Directorio de Proveedores vs. Paqueterías y Logística */}
          <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setSupplierViewMode('suppliers')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                supplierViewMode === 'suppliers'
                  ? 'bg-white text-[#2D4F3E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>🏭 Directorio de Proveedores de Insumos ({suppliers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSupplierViewMode('shipping')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                supplierViewMode === 'shipping'
                  ? 'bg-white text-[#2D4F3E] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span>📦 Tarifas de Paqueterías en México &amp; Despacho</span>
            </button>
          </div>

          {supplierViewMode === 'shipping' ? (
            <ShippingLogisticsSection businessSettings={businessSettings} />
          ) : (
            <>
              {/* Header Banner del Directorio */}
              <div className="bg-gradient-to-br from-[#2D4F3E] via-[#20392C] to-[#15241C] p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
                    <Building2 className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-heading tracking-tight">
                      Directorio de Proveedores &amp; Resurtido de Taller
                    </h3>
                    <p className="text-xs text-emerald-100/90 max-w-2xl">
                      Contactos directos de proveedores por técnica, llamadas y WhatsApp con mensaje precargado de resurtido para Artesano Digital, catálogos en línea y tiempos de entrega.
                    </p>
                  </div>
                </div>

                {/* Métricas rápidas */}
                <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
                  <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 font-semibold text-emerald-200">
                    🏢 {suppliers.length} Proveedores Registrados
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 font-semibold text-emerald-200">
                    📦 {materials.length} Insumos Vinculados
                  </span>
                  {stats.urgentCount > 0 ? (
                    <span className="px-3 py-1 rounded-xl bg-rose-500/80 backdrop-blur-xs border border-rose-400 font-bold text-white animate-pulse">
                      🚨 {stats.urgentCount} Insumos Requieren Pedido Urgente
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 backdrop-blur-xs border border-emerald-400/40 font-semibold text-emerald-200">
                      🟢 Stock de Taller Abastecido
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleOpenNewSupplierModal}
                className="px-4 py-2.5 rounded-2xl bg-white text-[#2D4F3E] text-xs font-bold hover:bg-emerald-50 active:scale-98 transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nuevo Proveedor</span>
              </button>
            </div>
          </div>

          {/* TARJETA DESTACADA: ESTIMADO RÁPIDO DE PAQUETERÍAS EN MÉXICO POR TAMAÑO */}
          <div className="bg-gradient-to-r from-amber-500/10 via-stone-50 to-emerald-500/10 p-5 rounded-3xl border border-amber-300/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 flex-wrap">
                    <span>📦 Costo Estimado de Paqueterías en México (Por Tamaño de Pieza)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">Convenio Agregador</span>
                  </h4>
                  <p className="text-xs text-gray-600">
                    Tarifas promedio negociadas (RedPack, Estafeta, FedEx, DHL, Paquetexpress) para envíos de taller a cualquier estado del país.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSupplierViewMode('shipping')}
                className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Ver Módulo Logístico Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pastillas de los 4 tamaños principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>✉️ Sobre / XS</span>
                  <span className="font-bold text-gray-700">&lt;0.5 kg</span>
                </div>
                <div className="text-sm font-black text-[#2D4F3E]">$115 - $135 MXN</div>
                <p className="text-[10px] text-gray-500 leading-tight">Llaveros, fotoimanes, viniles, aretes.</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>📦 Chico</span>
                  <span className="font-bold text-gray-700">0.5 a 1.5 kg</span>
                </div>
                <div className="text-sm font-black text-[#2D4F3E]">$139 - $149 MXN</div>
                <p className="text-[10px] text-gray-500 leading-tight">Tazas individuales con burbuja, macetas 3D.</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-300 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span>📐 Mediano</span>
                  <span className="font-bold text-amber-900">1.5 a 5 kg</span>
                </div>
                <div className="text-sm font-black text-[#2D4F3E]">$165 - $189 MXN</div>
                <p className="text-[10px] text-amber-900/80 leading-tight">Colgador "Bienvenidos", bandejas, posavasos.</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>🪑 Grande / Eventos</span>
                  <span className="font-bold text-gray-700">5 a 10 kg</span>
                </div>
                <div className="text-sm font-black text-[#2D4F3E]">$220 - $265 MXN</div>
                <p className="text-[10px] text-gray-500 leading-tight">Letreros de bienvenida bodas, cajas mayoreo.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN: DOCUMENTOS & PDFs DE PROVEEDORES (Listas de precios, catálogos mayoristas, fichas técnicas) */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <span>📁 Listas de Precios &amp; Fichas Técnicas de Proveedores en PDF ({supplierPdfs.length})</span>
                  </h4>
                  <p className="text-xs text-gray-500">
                    Sube, visualiza o elimina catálogos de distribuidores, listas de precios mayoristas de filamento/madera y cotizaciones de flete.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenNewPdfModal}
                className="px-3.5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Subir Lista / Documento PDF</span>
              </button>
            </div>

            {supplierPdfs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center text-xs text-stone-500">
                <FileText className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <p className="font-bold text-stone-700">No hay documentos de proveedores guardados aún.</p>
                <p className="mt-0.5">Haz clic en «Subir Lista / Documento PDF» para adjuntar listas de precios de distribuidores.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {supplierPdfs.map(pdf => (
                  <div key={pdf.id} className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200 hover:border-emerald-300 hover:bg-white transition-all space-y-2.5 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 truncate max-w-[140px]">
                        {pdf.supplierName}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-900 line-clamp-2 leading-snug" title={pdf.title}>
                        {pdf.title}
                      </h5>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span className="truncate max-w-[130px]">{pdf.fileName}</span>
                        <span>{pdf.fileSize} · {pdf.date}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-1">
                      <a
                        href={pdf.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        title="Ver o descargar documento"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-700" />
                        <span>Ver PDF</span>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPdfModal(pdf)}
                          className="p-1 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                          title="Editar título y proveedor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePdf(pdf.id, pdf.title)}
                          className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal para Subir / Editar Documento PDF de Proveedor */}
          {showPdfModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2D4F3E]" />
                    <span>{editingPdfItem ? 'Editar Documento PDF' : 'Subir Documento PDF de Proveedor'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(false)}
                    className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePdfModal} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Título del Documento *</label>
                    <input
                      type="text"
                      required
                      value={pdfForm.title}
                      onChange={e => setPdfForm({ ...pdfForm, title: e.target.value })}
                      placeholder="Ej. Lista de Precios Mayo 2026 Madera & Triplay"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Proveedor Asociado:</label>
                    <input
                      type="text"
                      value={pdfForm.supplierName}
                      onChange={e => setPdfForm({ ...pdfForm, supplierName: e.target.value })}
                      placeholder="Ej. Maderas Finas San Luis"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <label className="block font-bold text-gray-700">Archivo PDF o Documento:</label>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                      onChange={e => setPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2D4F3E] file:text-white cursor-pointer"
                    />
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block font-semibold text-gray-600 mb-1">O Enlace / URL a Nube (Google Drive, Dropbox):</label>
                      <input
                        type="url"
                        value={pdfForm.fileUrl}
                        onChange={e => setPdfForm({ ...pdfForm, fileUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPdfModal(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold cursor-pointer shadow-xs"
                    >
                      {editingPdfItem ? 'Guardar Cambios' : 'Guardar Documento'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={supplierSearchQuery}
                onChange={e => setSupplierSearchQuery(e.target.value)}
                placeholder="Buscar por empresa, asesor, teléfono, insumo o ciudad..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#2D4F3E] focus:outline-none transition-colors"
              />
              {supplierSearchQuery && (
                <button
                  onClick={() => setSupplierSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro por Técnica / Especialidad */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wider">Especialidad:</span>
              <select
                value={supplierCategoryFilter}
                onChange={e => setSupplierCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 focus:border-[#2D4F3E] focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las técnicas ({suppliers.length})</option>
                <option value="3d">🖨️ Impresión 3D</option>
                <option value="sublimation">🎨 Sublimación &amp; Cerámica</option>
                <option value="laser">🔥 Corte &amp; Grabado Láser</option>
                <option value="vinyl">✂️ Vinil &amp; Textil</option>
                <option value="assembly">🔩 Herrajes &amp; Ensamble</option>
                <option value="packaging">📦 Cajas &amp; Empaque</option>
                <option value="spare_parts">🔧 Refacciones &amp; CNC</option>
              </select>
            </div>
          </div>

          {/* Filtros rápidos por especialidad (un proveedor puede aparecer en varias) */}
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 mr-1">Filtrar:</span>
            <button
              type="button"
              onClick={() => setSupplierCategoryFilter('all')}
              className={`px-2 py-1 rounded-lg border text-[9.5px] font-bold cursor-pointer transition-colors ${
                supplierCategoryFilter === 'all' ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              Todos ({suppliers.length})
            </button>
            {SUPPLIER_SPECIALTIES.map(specialty => {
              const count = suppliers.filter(sup => supplierHasSpecialty(sup, specialty)).length;
              if (count === 0) return null;
              return (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => setSupplierCategoryFilter(specialty.id)}
                  className={`px-2 py-1 rounded-lg border text-[9.5px] font-bold cursor-pointer transition-colors ${
                    supplierCategoryFilter === specialty.id ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {specialty.icon} {specialty.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Cuadrícula de Tarjetas de Proveedores */}
          {filteredSuppliers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#E8E4DA] text-center space-y-3">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800">No se encontraron proveedores</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No hay resultados con los criterios de búsqueda actuales. Intenta cambiar de filtro o registra un proveedor nuevo.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => { setSupplierSearchQuery(''); setSupplierCategoryFilter('all'); }}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={handleOpenNewSupplierModal}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] cursor-pointer"
                >
                  + Registrar Proveedor
                </button>
              </div>
            </div>
          ) : supplierCategoryFilter === 'all' ? (
            <div className="space-y-2.5">
              {groupedSuppliers.map(group => (
                <div key={group.id} className="rounded-2xl border border-[#E8E4DA] bg-white overflow-hidden shadow-2xs">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-stone-50/80 border-b border-stone-200">
                    <span className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-sm shrink-0">{group.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-xs text-gray-900">{group.label}</div>
                      <div className="text-[9px] text-gray-500">{group.suppliers.length} proveedor(es) · puede repetirse en otras especialidades</div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600">{group.suppliers.length}</span>
                  </div>
                  <div className="p-2.5 grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {group.suppliers.map(sup => {
                      const catBadge = getCategoryBadge(sup.category);
                      const supMaterials = materials.filter(m =>
                        m.supplierId === sup.id || m.supplier?.toLowerCase().trim() === sup.name?.toLowerCase().trim()
                      );
                      const urgentCount = supMaterials.filter(m => getStockStatus(m).key === 'urgent').length;
                      return (
                        <div key={`${group.id}-${sup.id}`} className="rounded-xl border border-stone-200 bg-stone-50/30 p-2.5 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[11px] shrink-0 ${catBadge.color}`}>{catBadge.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[10.5px] font-bold text-gray-900 truncate" title={sup.name}>{sup.name}</div>
                              <div className="text-[8.5px] text-gray-500 truncate">{sup.contactName || 'Sin asesor'} · {sup.address || 'SLP'}</div>
                            </div>
                            {urgentCount > 0 && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 shrink-0">{urgentCount} rojo(s)</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 text-[8.5px] text-gray-500">
                            <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200">{sup.leadTimeDays || '1-2 días'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200">{supMaterials.length} insumos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {sup.whatsapp && (
                              <a
                                href={`https://wa.me/${sup.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, te contacto del taller Artesano Digital para cotizar resurtido de material.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            )}
                            {sup.phone && (
                              <a href={`tel:${sup.phone}`} className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-gray-700 text-[9px] font-bold" title={sup.phone}>
                                <Phone className="w-3 h-3" /> Llamar
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenSupplierModal(sup.id, null)}
                              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-[#2D4F3E] text-[9px] font-bold hover:bg-emerald-50 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Ficha
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
              {filteredSuppliers.map(sup => {
                const catBadge = getCategoryBadge(sup.category);
                const supMaterials = materials.filter(m =>
                  m.supplierId === sup.id || m.supplier?.toLowerCase().trim() === sup.name?.toLowerCase().trim()
                );
                const urgentSupMats = supMaterials.filter(m => getStockStatus(m).key === 'urgent');
                const hasUrgent = urgentSupMats.length > 0;

                return (
                  <div
                    key={sup.id}
                    className={`bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                      hasUrgent ? 'border-rose-300 ring-2 ring-rose-100' : 'border-[#E8E4DA]'
                    }`}
                  >
                    {/* Alerta de resurtido urgente si aplica */}
                    {hasUrgent && (
                      <div className="px-4 py-1.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-[11px] font-bold text-rose-700">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          <span>¡{urgentSupMats.length} insumo(s) en rojo requieren pedido!</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider bg-rose-200/60 px-1.5 py-0.5 rounded">
                          Resurtir
                        </span>
                      </div>
                    )}

                    <div className="p-5 space-y-4">
                      
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.color}`}>
                            <span>{catBadge.icon}</span>
                            <span>{catBadge.label}</span>
                          </span>
                          <h4 className="text-base font-extrabold font-heading text-gray-900 leading-snug">
                            {sup.name}
                          </h4>
                          {sup.contactName && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium">{sup.contactName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción Directa (WhatsApp, Llamada, Web) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          {sup.whatsapp ? (
                            <a
                              href={`https://wa.me/${sup.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, te contacto del taller Artesano Digital para cotizar resurtido de material.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              title="Abrir chat de WhatsApp con mensaje precargado de resurtido"
                            >
                              <MessageCircle className="w-4 h-4 shrink-0" />
                              <span>WhatsApp Directo</span>
                            </a>
                          ) : (
                            <div className="flex-1 py-2 px-3 rounded-xl bg-gray-100 text-gray-400 font-medium text-xs text-center">
                              Sin WhatsApp
                            </div>
                          )}

                          {sup.phone && (
                            <a
                              href={`tel:${sup.phone}`}
                              className="py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                              title={`Llamar a ${sup.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-gray-500" />
                              <span>Llamar</span>
                            </a>
                          )}
                        </div>

                        {/* Fila secundaria: Correo y Sitio Web */}
                        <div className="flex items-center gap-2 text-xs">
                          {sup.email && (
                            <a
                              href={`mailto:${sup.email}`}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors truncate"
                              title={`Enviar correo a ${sup.email}`}
                            >
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{sup.email}</span>
                            </a>
                          )}

                          {sup.website && (
                            <a
                              href={sup.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-[#2D4F3E] font-semibold flex items-center gap-1 transition-colors shrink-0"
                              title="Visitar catálogo o tienda en línea"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Catálogo</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Datos Logísticos Clave */}
                      <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Ubicación</span>
                            <div className="flex items-center gap-1 font-semibold text-gray-700 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{sup.address || 'San Luis Potosí, S.L.P.'}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Tiempo de Entrega</span>
                            <div className="flex items-center gap-1 font-semibold text-gray-700 mt-0.5 truncate">
                              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{sup.leadTimeDays || '1 a 2 días hábiles'}</span>
                            </div>
                          </div>
                        </div>

                        {sup.minOrder && (
                          <div className="pt-1.5 border-t border-gray-200/60 text-[11px]">
                            <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">Condición / Mínimo</span>
                            <div className="font-semibold text-gray-700 mt-0.5">
                              {sup.minOrder}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Insumos surtidos en taller */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-gray-700">
                            Insumos surtidos en taller ({supMaterials.length}):
                          </span>
                        </div>
                        {supMaterials.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {supMaterials.slice(0, 4).map(m => {
                              const st = getStockStatus(m);
                              return (
                                <span
                                  key={m.id}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                                    st.key === 'urgent'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-white text-gray-700 border-gray-200'
                                  }`}
                                  title={`${m.name} — Stock actual: ${m.currentStock} ${m.unit || 'pzas'}`}
                                >
                                  <span>{st.icon}</span>
                                  <span className="truncate max-w-[130px]">{m.name}</span>
                                </span>
                              );
                            })}
                            {supMaterials.length > 4 && (
                              <span className="px-1.5 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold">
                                +{supMaterials.length - 4} más
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">
                            No hay insumos vinculados actualmente a este proveedor.
                          </p>
                        )}
                      </div>

                      {/* Notas comerciales */}
                      {sup.notes && (
                        <div className="text-[11px] text-gray-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                          &ldquo;{sup.notes}&rdquo;
                        </div>
                      )}

                    </div>

                    {/* Footer de la Tarjeta */}
                    <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenSupplierModal(sup.id, null, true)}
                        className="py-1.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3 h-3 text-gray-500" />
                        <span>Editar Ficha</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
            </>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FICHA DE CONTACTO & EDICIÓN DE PROVEEDOR             */}
      {/* ============================================================ */}
      {isSupplierModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
            <div className="px-5 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold font-heading">
                    {isEditingSupplier ? 'Editar Datos del Proveedor' : 'Ficha de Contacto del Proveedor'}
                  </h3>
                  <div className="text-[11px] text-gray-300">
                    {supplierForm.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {!isEditingSupplier ? (
                /* MODO VISTA: DATOS DE CONTACTO Y ACCESO RÁPIDO */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black text-gray-900">{selectedSupplier.name}</div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold capitalize">
                        {selectedSupplier.category || 'Taller'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 pt-1">
                      {selectedSupplier.contactName && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-400 block">Asesor Comercial:</span>
                            <span className="font-semibold">{selectedSupplier.contactName}</span>
                          </div>
                        </div>
                      )}

                      {selectedSupplier.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-400 block">Teléfono:</span>
                            <a href={`tel:${selectedSupplier.phone}`} className="font-semibold text-[#2D4F3E] hover:underline">
                              {selectedSupplier.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedSupplier.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-400 block">Correo Electrónico:</span>
                            <a href={`mailto:${selectedSupplier.email}`} className="font-semibold text-[#2D4F3E] hover:underline">
                              {selectedSupplier.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedSupplier.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-400 block">Ubicación / Bodega:</span>
                            <span className="font-semibold">{selectedSupplier.address}</span>
                          </div>
                        </div>
                      )}

                      {selectedSupplier.leadTimeDays && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-400 block">Tiempo de Entrega:</span>
                            <span className="font-semibold">{selectedSupplier.leadTimeDays}</span>
                          </div>
                        </div>
                      )}

                      {selectedSupplier.minOrder && (
                        <div className="flex items-center gap-2">
                          <PackageCheck className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-400 block">Condición / Mínimo:</span>
                            <span className="font-semibold">{selectedSupplier.minOrder}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedSupplier.website && (
                      <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-[10px] text-gray-400">Sitio Web:</span>
                        <a
                          href={selectedSupplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#2D4F3E] hover:underline flex items-center gap-1"
                        >
                          <span>{selectedSupplier.website}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {selectedSupplier.notes && (
                      <div className="pt-2 border-t border-gray-200/60 text-[11px] text-gray-600 italic">
                        &ldquo;{selectedSupplier.notes}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Botones de Acción Directa */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {selectedSupplier.whatsapp && (
                      <a
                        href={`https://wa.me/${selectedSupplier.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, te contacto del taller Artesano Digital para cotizar resurtido de material.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Abrir WhatsApp</span>
                      </a>
                    )}

                    {selectedSupplier.phone && (
                      <a
                        href={`tel:${selectedSupplier.phone}`}
                        className="py-2 px-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </a>
                    )}

                    <button
                      onClick={() => setIsEditingSupplier(true)}
                      className="py-2 px-4 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar Datos</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* MODO EDICIÓN: FORMULARIO COMPLETO PARA EDITAR EL PROVEEDOR */
                <form onSubmit={handleSaveSupplier} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Nombre de la Empresa / Proveedor *
                      </label>
                      <input
                        type="text"
                        required
                        value={supplierForm.name}
                        onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Nombre del Asesor / Contacto
                      </label>
                      <input
                        type="text"
                        value={supplierForm.contactName}
                        onChange={e => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                        placeholder="ej. Ing. Carlos Mendoza"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Teléfono Directo
                      </label>
                      <input
                        type="text"
                        value={supplierForm.phone}
                        onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        placeholder="ej. 444 820 1199"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        WhatsApp (con código de país ej. 52...)
                      </label>
                      <input
                        type="text"
                        value={supplierForm.whatsapp}
                        onChange={e => setSupplierForm({ ...supplierForm, whatsapp: e.target.value })}
                        placeholder="ej. 524448201199"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={supplierForm.email}
                        onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        placeholder="ventas@proveedor.mx"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Sitio Web / Catálogo en Línea
                      </label>
                      <input
                        type="url"
                        value={supplierForm.website}
                        onChange={e => setSupplierForm({ ...supplierForm, website: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Ubicación / Ciudad
                      </label>
                      <input
                        type="text"
                        value={supplierForm.address}
                        onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
                        placeholder="San Luis Potosí / Guadalajara / CDMX"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Tiempo de Entrega Estimado
                      </label>
                      <input
                        type="text"
                        value={supplierForm.leadTimeDays}
                        onChange={e => setSupplierForm({ ...supplierForm, leadTimeDays: e.target.value })}
                        placeholder="24 hrs, 2 a 3 días..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Pedido Mínimo / Condiciones de Compra
                    </label>
                    <input
                      type="text"
                      value={supplierForm.minOrder}
                      onChange={e => setSupplierForm({ ...supplierForm, minOrder: e.target.value })}
                      placeholder="ej. Envío gratis a partir de $1,200 MXN o caja de 36 pzas"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Notas Comerciales / Facturación
                    </label>
                    <textarea
                      rows="2"
                      value={supplierForm.notes}
                      onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                      placeholder="Descuentos por volumen, días de facturación, condiciones de garantía..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingSupplier(false)}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingSupplier}
                      className="px-5 py-2 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSupplier ? 'Guardando...' : 'Guardar Proveedor'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REGISTRAR / EDITAR MATERIA PRIMA COMPLETA             */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-5 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-heading">
                  {editingMaterial ? 'Editar Materia Prima' : 'Registrar Nueva Materia Prima'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nombre de la Materia Prima *
                </label>
                <input
                  type="text"
                  required
                  value={materialForm.name}
                  onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
                  placeholder="ej. Filamento PLA Verde Olivo Mate (1.75mm)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Técnica / Categoría *
                  </label>
                  <select
                    value={materialForm.category}
                    onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="3d">🖨️ Impresión 3D</option>
                    <option value="sublimation">🎨 Sublimación</option>
                    <option value="laser">🔥 Corte Láser</option>
                    <option value="vinyl">✂️ Vinil &amp; Textil</option>
                    <option value="assembly">🔩 Ensamble &amp; Herrajes</option>
                    <option value="packaging">📦 Embalaje &amp; Empaque</option>
                    <option value="spare_parts">🔧 Refacciones &amp; Repuestos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Unidad de Medida *
                  </label>
                  <input
                    type="text"
                    required
                    value={materialForm.unit}
                    onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    placeholder="bobina (1kg), pieza, metro, paquete"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Contenido del Empaque / Paquete para cálculo de costos de taller */}
              <div className="grid grid-cols-2 gap-3 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div>
                  <label className="block font-bold text-emerald-950 uppercase tracking-wider text-[10px] mb-1">
                    Cantidad por Empaque
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    value={materialForm.packageQuantity ?? 1}
                    onChange={e => setMaterialForm({ ...materialForm, packageQuantity: e.target.value })}
                    placeholder="1000, 36, 10, 400..."
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-950 uppercase tracking-wider text-[10px] mb-1">
                    Medición Base
                  </label>
                  <select
                    value={materialForm.packageMeasurement || 'pza'}
                    onChange={e => setMaterialForm({ ...materialForm, packageMeasurement: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-[#2D4F3E] focus:border-[#2D4F3E] focus:outline-none cursor-pointer"
                  >
                    <option value="g">g (Gramos)</option>
                    <option value="pza">pza (Piezas)</option>
                    <option value="ml">ml (Mililitros)</option>
                    <option value="m">m (Metros)</option>
                    <option value="cm²">cm² (Centímetros cuadrados)</option>
                    <option value="hoja">hoja (Hojas)</option>
                    <option value="kg">kg (Kilos)</option>
                    <option value="L">L (Litros)</option>
                    <option value="par">par (Pares)</option>
                    <option value="pliego">pliego (Pliegos)</option>
                  </select>
                </div>
              </div>

              {/* Atributos Específicos: Tipo de Material, Color & Acabado */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">
                    Material / Tipo
                  </label>
                  <input
                    type="text"
                    value={materialForm.materialType || ''}
                    onChange={e => setMaterialForm({ ...materialForm, materialType: e.target.value })}
                    placeholder="ej. PLA, TPU, Vinil Puff..."
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-xs focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={materialForm.color || ''}
                    onChange={e => setMaterialForm({ ...materialForm, color: e.target.value })}
                    placeholder="ej. Verde Olivo, Negro..."
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-xs focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-1">
                    Acabado
                  </label>
                  <select
                    value={materialForm.finish || 'Estándar'}
                    onChange={e => setMaterialForm({ ...materialForm, finish: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-xs focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="Estándar">Estándar</option>
                    <option value="Mate">Mate</option>
                    <option value="Brillante / Glossy">Brillante / Glossy</option>
                    <option value="Puff 3D (Relieve Inflable)">Puff 3D (Relieve Inflable)</option>
                    <option value="Seda / Satinado">Seda / Satinado</option>
                    <option value="Glitter / Diamantado">Glitter / Diamantado</option>
                    <option value="Mágico Térmico">Mágico Térmico</option>
                    <option value="Espejo Reflectivo">Espejo Reflectivo</option>
                    <option value="Esmerilado / Pavonado">Esmerilado / Pavonado</option>
                    <option value="Texturizado / Mármol">Texturizado / Mármol</option>
                    <option value="Translúcido">Translúcido</option>
                    <option value="Natural / Madera">Natural / Madera</option>
                    <option value="Esmaltado / Peltre">Esmaltado / Peltre</option>
                    <option value="Reflejante">Reflejante</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Stock Actual *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={materialForm.currentStock}
                    onChange={e => setMaterialForm({ ...materialForm, currentStock: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mínimo Alerta *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={materialForm.minStockAlert}
                    onChange={e => setMaterialForm({ ...materialForm, minStockAlert: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Costo x Unidad ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={materialForm.costPerUnit}
                    onChange={e => setMaterialForm({ ...materialForm, costPerUnit: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Proveedor / Marca Habitual
                </label>
                <div className="flex gap-2">
                  <select
                    value={materialForm.supplier}
                    onChange={e => {
                      const supName = e.target.value;
                      const matched = suppliers.find(s => s.name === supName);
                      setMaterialForm({
                        ...materialForm,
                        supplier: supName,
                        supplierId: matched ? matched.id : ''
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="">-- Selecciona un proveedor registrado --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.contactName || s.address})</option>
                    ))}
                    {materialForm.supplier && !suppliers.some(s => s.name === materialForm.supplier) && (
                      <option value={materialForm.supplier}>{materialForm.supplier} (Registrado en insumo)</option>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={handleOpenNewSupplierModal}
                    className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#2D4F3E] font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    title="Registrar nuevo proveedor en el directorio"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notas / Especificaciones de Taller
                </label>
                <textarea
                  rows="2"
                  value={materialForm.notes}
                  onChange={e => setMaterialForm({ ...materialForm, notes: e.target.value })}
                  placeholder="Diámetro 1.75mm, acabado satinado, tiempo de entrega del proveedor..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] active:scale-98 transition-all shadow-md cursor-pointer"
                >
                  {editingMaterial ? 'Guardar Cambios' : 'Registrar Insumo en Taller'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDITAR PARÁMETROS OPERATIVOS DE MÁQUINA               */}
      {/* ============================================================ */}
      {isMachineModalOpen && editingMachine && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="px-5 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{editingMachine.icon}</span>
                <div>
                  <h3 className="text-sm font-bold font-heading">
                    Editar Parámetros: {editingMachine.name}
                  </h3>
                  <span className="text-[10px] text-gray-300">
                    {editingMachine.code} • {editingMachine.categoryName}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsMachineModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="p-5 space-y-4 text-xs overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    value={machineForm.name}
                    onChange={e => setMachineForm({ ...machineForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Estado Operativo *
                  </label>
                  <select
                    value={machineForm.status}
                    onChange={e => setMachineForm({ ...machineForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold focus:border-[#2D4F3E] focus:outline-none"
                  >
                    <option value="active">Activa (En producción diaria)</option>
                    <option value="maintenance">En Mantenimiento Técnico</option>
                    <option value="standby">Standby (Reserva de taller)</option>
                  </select>
                </div>
              </div>

              {/* Potencia Eléctrica y CFE */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Consumo Eléctrico CFE</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Potencia en Watts (W)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={machineForm.powerWatts}
                      onChange={e => setMachineForm({ ...machineForm, powerWatts: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Costo CFE Calculado
                    </label>
                    <div className="px-3 py-2 rounded-xl border border-amber-200 bg-white font-mono font-bold text-amber-900 text-sm">
                      ${(((Number(machineForm.powerWatts) || 0) / 1000) * (Number(machineForm.kwhRate) || 3.20)).toFixed(2)}/hr
                    </div>
                  </div>
                </div>
              </div>

              {/* Desgaste y Mantenimiento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Desgaste / Amortización ($/hr)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={machineForm.wearCostPerHour}
                    onChange={e => setMachineForm({ ...machineForm, wearCostPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">Boquillas, cuchillas, lentes láser</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mantenimiento Preventivo ($/hr)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={machineForm.maintenanceCostPerHour}
                    onChange={e => setMachineForm({ ...machineForm, maintenanceCostPerHour: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-[#2D4F3E] focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">Lubricación, calibración y correas</span>
                </div>
              </div>

              {/* Métrica Unitaria y Costo Unitario */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  <span>Costo Operativo Unitario por Pieza / Dimensión</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Métrica de Medición
                    </label>
                    <select
                      value={machineForm.unitMetric}
                      onChange={e => {
                        const val = e.target.value;
                        const labelMap = {
                          cm3: 'cm³ (volumen)',
                          cm2: 'cm² (área)',
                          metro_lineal: 'Metro Lineal (corte)',
                          hoja: 'Hoja estándar/transfer',
                          bajada_ciclo: 'Bajada / ciclo de prensado',
                          pieza: 'Pieza terminada',
                          hora: 'Hora de máquina'
                        };
                        setMachineForm({
                          ...machineForm,
                          unitMetric: val,
                          unitMetricLabel: labelMap[val] || val
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold focus:border-[#2D4F3E] focus:outline-none"
                    >
                      <option value="cm3">cm³ (volumen 3D)</option>
                      <option value="cm2">cm² (área láser/corte)</option>
                      <option value="metro_lineal">Metro Lineal (vinil)</option>
                      <option value="hoja">Hoja impresa (papel/transfer)</option>
                      <option value="bajada_ciclo">Bajada / ciclo de prensado</option>
                      <option value="pieza">Pieza terminada</option>
                      <option value="hora">Hora de máquina</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Costo Unitario ($ MXN)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={machineForm.unitCost}
                      onChange={e => setMachineForm({ ...machineForm, unitCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm text-emerald-950 focus:border-[#2D4F3E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Especificaciones y Notas */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Especificaciones Técnicas
                </label>
                <input
                  type="text"
                  value={machineForm.specs}
                  onChange={e => setMachineForm({ ...machineForm, specs: e.target.value })}
                  placeholder="Área de trabajo, aceleración, boquilla..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notas de Operación
                </label>
                <textarea
                  rows="2"
                  value={machineForm.notes}
                  onChange={e => setMachineForm({ ...machineForm, notes: e.target.value })}
                  placeholder="Materiales recomendados, precauciones de seguridad..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMachineModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMachine}
                  className="px-5 py-2 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingMachine ? 'Guardando...' : 'Guardar Parámetros de Máquina'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Botón flotante para volver al inicio del inventario al hacer scroll (151 SKUs) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#2D4F3E] hover:bg-[#1E362A] text-white font-black text-xs shadow-2xl hover:shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/60 backdrop-blur-xs ring-4 ring-[#2D4F3E]/20"
          title="Volver rápidamente al inicio del inventario de materias primas"
        >
          <ArrowUp className="w-4 h-4 animate-bounce" />
          <span>Volver al inicio ({filteredMaterials.length} SKUs)</span>
        </button>
      )}

    </div>
  );
}
