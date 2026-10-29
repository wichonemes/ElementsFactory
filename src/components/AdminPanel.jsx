import React, { useState, useEffect, useMemo } from 'react';
import {
import ImageOptimized from './ImageOptimized';
  X, Shield, Lock, LogOut, Plus, Edit, Copy, Trash2, Eye,
  BarChart3, Package, FolderTree, Settings, Upload, Check, AlertTriangle,
  ExternalLink, Search, RefreshCw, KeyRound, Sparkles,
  Flame, Clock, Zap, Percent, Image as ImageIcon, Layers, Tag, HelpCircle,
  TrendingUp, CheckCircle2, ArrowRight,
  Sliders, DollarSign, Calculator, Boxes, Minus, ChevronDown, ChevronUp, FileSpreadsheet,
  Home, Briefcase, PartyPopper, Printer, Palette, Scissors, Radio, Filter,
  Megaphone, Truck, MapPin, Calendar, Power, AlertCircle, Gift, Building2,
  Database, Save, Download, Gamepad2, Smartphone, Camera, Wrench, Hammer,
  Link2, HardDrive, Globe, ShoppingCart
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import SalesMarketingSection from './SalesMarketingSection';
import MobileCatalogAdminSection from './MobileCatalogAdminSection';
import RawMaterialsSection, { parsePackageInfo, calculateMaterialStockDeduction } from './RawMaterialsSection';
import FlashDealsControlSection from './FlashDealsControlSection';
import CampaignsAdminSection from './CampaignsAdminSection';
import ArcadeAdminSection from './ArcadeAdminSection';
import AreaBannersAdminSection from './AreaBannersAdminSection';
import ProductWorkshopTab from './ProductWorkshopTab';
import PackagesAdminSection from './PackagesAdminSection';
import CouponsAdminSection from './CouponsAdminSection';
import AdminConfirmSaveModal from './AdminConfirmSaveModal';
import ProductPhotoStudioModal from './ProductPhotoStudioModal';
import {
  DEFAULT_SERVICE_STATUS,
  formatServiceDate,
  getDatePlusDays,
  getNextMondayDate,
  getNextMonthFirstDay,
  getServiceStatusSummary
} from '../utils/serviceStatus';
import { getFilamentColor, getProductColorOptions } from '../utils/colorUtils';
import {
  SKU_AREAS,
  SKU_TECHNIQUES,
  SKU_MATERIALS,
  SKU_FINISHES,
  buildSku,
  parseSku,
  suggestSkuForProduct
} from '../utils/skuHelper';
import {
  DEFAULT_WORKSHOP_PARAMS,
  MAX_DISCOUNT_PERCENT,
  clampDiscountPercent,
  computeRecipeCost,
  applySummaryToRecipe,
  buildRecipeFromProduct,
  buildCostBreakdownFromSummary,
  repairProductCosts,
  auditProductCost,
  num
} from '../../shared/costing.js';

// Helper para generar una receta de manufactura (BOM) inicial realista segÃºn la tÃ©cnica
// Helper para generar una receta de manufactura (BOM) inicial realista segÃºn la tÃ©cnica
export function getPresetItemsForTechnique(tech, rawMaterials = []) {
  const findMat = (id, fallbackQ) => {
    const byId = rawMaterials.find(m => m.id === id);
    if (byId) return byId;
    return rawMaterials.find(m => (m.name || '').toLowerCase().includes(fallbackQ.toLowerCase())) || null;
  };

  if (tech === '3d') {
    const plaMat = findMat('mat-pla-olivo', 'pla verde olivo') || rawMaterials.find(m => m.category === '3d') || {
      id: 'mat-pla-olivo', name: 'Filamento PLA Verde Olivo Mate (1.75mm)', costPerUnit: 500, packageQuantity: 1000, packageMeasurement: 'g', unit: 'bobina (1 kg)'
    };
    const sprayMat = findMat('mat-spray-3dlac', '3dlac') || {
      id: 'mat-spray-3dlac', name: 'Spray Fijador de Cama 3DLac (400 ml)', costPerUnit: 250, packageQuantity: 400, packageMeasurement: 'ml', unit: 'lata (400 ml)'
    };
    return [
      {
        id: `item-3d-${Date.now()}-1`,
        materialId: plaMat.id,
        name: plaMat.name,
        category: '3d',
        supplyType: 'direct',
        netQuantity: 48,
        wasteQuantity: 16,
        wasteType: 'supports_and_purge',
        totalQuantity: 64,
        unit: 'g',
        unitCost: Math.round(((Number(plaMat.costPerUnit) || 500) / 1000) * 100) / 100,
        totalCost: Math.round(64 * 0.50 * 100) / 100
      },
      {
        id: `item-3d-${Date.now()}-2`,
        materialId: sprayMat.id,
        name: sprayMat.name,
        category: '3d',
        supplyType: 'indirect',
        netQuantity: 4,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 4,
        unit: 'ml',
        unitCost: Math.round(((Number(sprayMat.costPerUnit) || 250) / 400) * 100) / 100,
        totalCost: Math.round(4 * 0.625 * 100) / 100
      }
    ];
  }

  if (tech === '3d_resina') {
    const resinaMat = findMat('mat-resina-uv-405nm', 'resina') || {
      id: 'mat-resina-uv-405nm', name: 'Resina FotopolÃ­mero UV 405nm Gris/Negro (1000g)', costPerUnit: 650, packageQuantity: 1000, packageMeasurement: 'g', unit: 'botella (1 kg)'
    };
    const alcoholMat = findMat('mat-alcohol-isopropilico', 'isopropilico') || {
      id: 'mat-alcohol-isopropilico', name: 'Alcohol IsopropÃ­lico 99.9% para Lavado de Piezas (1000 ml)', costPerUnit: 120, packageQuantity: 1000, packageMeasurement: 'ml', unit: 'litro'
    };
    const lacaMat = findMat('mat-laca-spray', 'laca') || {
      id: 'mat-laca-spray', name: 'Laca Protectora Selladora Mate UV en Spray (400 ml)', costPerUnit: 120, packageQuantity: 400, packageMeasurement: 'ml', unit: 'lata (400 ml)'
    };
    return [
      {
        id: `item-res-${Date.now()}-1`,
        materialId: resinaMat.id,
        name: resinaMat.name,
        category: '3d',
        supplyType: 'direct',
        netQuantity: 36,
        wasteQuantity: 8,
        wasteType: 'supports_and_purge',
        totalQuantity: 44,
        unit: 'g',
        unitCost: Math.round(((Number(resinaMat.costPerUnit) || 650) / 1000) * 100) / 100,
        totalCost: Math.round(44 * 0.65 * 100) / 100
      },
      {
        id: `item-res-${Date.now()}-2`,
        materialId: lacaMat.id,
        name: lacaMat.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 2,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 2,
        unit: 'ml',
        unitCost: Math.round(((Number(lacaMat.costPerUnit) || 120) / 400) * 100) / 100,
        totalCost: Math.round(2 * 0.30 * 100) / 100
      },
      {
        id: `item-res-${Date.now()}-3`,
        materialId: alcoholMat.id,
        name: alcoholMat.name,
        category: 'consumables',
        supplyType: 'indirect',
        netQuantity: 15,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 15,
        unit: 'ml',
        unitCost: 0.12,
        totalCost: 1.80
      }
    ];
  }

  if (tech === 'laser' || tech === 'laser_madera') {
    const maderaMat = findMat('mat-madera-abedul-3mm', 'abedul') || findMat('mat-madera-triplay-3mm', 'triplay') || {
      id: 'mat-madera-triplay-3mm', name: 'Madera Triplay / Contrachapada Pino 3mm Calidad LÃ¡ser (60x40 cm)', costPerUnit: 45, packageQuantity: 2400, packageMeasurement: 'cmÂ²', unit: 'placa (60x40 cm)'
    };
    const barnizMat = findMat('mat-barniz-poliuretano-transparente', 'barniz poliuretano') || findMat('mat-barniz-poliuretano-spray', 'barniz spray') || findMat('mat-laca-spray', 'laca') || {
      id: 'mat-barniz-poliuretano-spray', name: 'Barniz Poliuretano Transparente Satinado en Spray (400 ml)', costPerUnit: 135, packageQuantity: 400, packageMeasurement: 'ml', unit: 'lata (400 ml)'
    };
    const pegamentoMat = findMat('mat-pegamento-resistol-850', 'resistol') || {
      id: 'mat-pegamento-resistol-850', name: 'Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)', costPerUnit: 85, packageQuantity: 500, packageMeasurement: 'ml', unit: 'bote (500 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    const sierraMat = findMat('mat-desgaste-corte-sierra-laser', 'desgaste corte') || {
      id: 'mat-desgaste-corte-sierra-laser', name: 'Consumible Indirecto de Corte (Desgaste Hoja Sierra / Tubo LÃ¡ser CO2)', costPerUnit: 1.5, packageQuantity: 1, packageMeasurement: 'corte', unit: 'corte'
    };
    const estopaMat = findMat('mat-estopa-limpieza-taller', 'estopa') || {
      id: 'mat-estopa-limpieza-taller', name: 'Estopa de AlgodÃ³n Fino y PaÃ±os para Barnizado y Limpieza (1 kg)', costPerUnit: 45, packageQuantity: 50, packageMeasurement: 'paÃ±o', unit: 'paquete'
    };
    return [
      {
        id: `item-las-${Date.now()}-1`,
        materialId: maderaMat.id,
        name: maderaMat.name,
        category: 'laser',
        supplyType: 'direct',
        netQuantity: 380,
        wasteQuantity: 60,
        wasteType: 'cut_remnants',
        totalQuantity: 440,
        unit: 'cmÂ²',
        unitCost: Math.round(((Number(maderaMat.costPerUnit) || 45) / 2400) * 10000) / 10000,
        totalCost: Math.round(440 * 0.01875 * 100) / 100
      },
      {
        id: `item-las-${Date.now()}-2`,
        materialId: barnizMat.id,
        name: barnizMat.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 4,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 4,
        unit: 'ml',
        unitCost: Math.round(((Number(barnizMat.costPerUnit) || 135) / 400) * 100) / 100,
        totalCost: Math.round(4 * 0.3375 * 100) / 100
      },
      {
        id: `item-las-${Date.now()}-3`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.08,
        wasteQuantity: 0.02,
        wasteType: 'manual',
        totalQuantity: 0.1,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 1.40
      },
      {
        id: `item-las-${Date.now()}-4`,
        materialId: pegamentoMat.id,
        name: pegamentoMat.name,
        category: 'assembly',
        supplyType: 'indirect',
        netQuantity: 6,
        wasteQuantity: 1,
        wasteType: 'manual',
        totalQuantity: 7,
        unit: 'gotas',
        unitCost: 0.0085,
        totalCost: 0.06
      },
      {
        id: `item-las-${Date.now()}-5`,
        materialId: sierraMat.id,
        name: sierraMat.name,
        category: 'consumables',
        supplyType: 'indirect',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'corte',
        unitCost: 1.5,
        totalCost: 1.50
      },
      {
        id: `item-las-${Date.now()}-6`,
        materialId: estopaMat.id,
        name: estopaMat.name,
        category: 'consumables',
        supplyType: 'indirect',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'paÃ±o',
        unitCost: 0.8,
        totalCost: 0.80
      }
    ];
  }

  if (tech === 'laser_llavero') {
    const maderaMat = findMat('mat-madera-abedul-3mm', 'abedul') || findMat('mat-madera-triplay-3mm', 'triplay') || {
      id: 'mat-madera-triplay-3mm', name: 'Madera Triplay / Contrachapada Pino 3mm Calidad LÃ¡ser (60x40 cm)', costPerUnit: 45, packageQuantity: 2400, packageMeasurement: 'cmÂ²', unit: 'placa (60x40 cm)'
    };
    const barnizMat = findMat('mat-barniz-poliuretano-transparente', 'barniz poliuretano') || findMat('mat-barniz-poliuretano-spray', 'barniz') || {
      id: 'mat-barniz-poliuretano-spray', name: 'Barniz Poliuretano Transparente Satinado en Spray (400 ml)', costPerUnit: 135, packageQuantity: 400, packageMeasurement: 'ml', unit: 'lata (400 ml)'
    };
    const argollaMat = findMat('mat-argollas-llavero', 'argollas') || {
      id: 'mat-argollas-llavero', name: 'Argollas MetÃ¡licas Niqueladas con Cadena y EslabÃ³n (100 pzas)', costPerUnit: 120, packageQuantity: 100, packageMeasurement: 'pza', unit: 'paquete (100 pzas)'
    };
    const pegamentoMat = findMat('mat-pegamento-resistol-850', 'resistol') || {
      id: 'mat-pegamento-resistol-850', name: 'Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)', costPerUnit: 85, packageQuantity: 500, packageMeasurement: 'ml', unit: 'bote (500 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    const sierraMat = findMat('mat-desgaste-corte-sierra-laser', 'desgaste corte') || {
      id: 'mat-desgaste-corte-sierra-laser', name: 'Consumible Indirecto de Corte (Desgaste Hoja Sierra / Tubo LÃ¡ser CO2)', costPerUnit: 1.5, packageQuantity: 1, packageMeasurement: 'corte', unit: 'corte'
    };
    return [
      {
        id: `item-lasllav-${Date.now()}-1`,
        materialId: maderaMat.id,
        name: maderaMat.name,
        category: 'laser',
        supplyType: 'direct',
        netQuantity: 65,
        wasteQuantity: 15,
        wasteType: 'cut_remnants',
        totalQuantity: 80,
        unit: 'cmÂ²',
        unitCost: Math.round(((Number(maderaMat.costPerUnit) || 45) / 2400) * 10000) / 10000,
        totalCost: Math.round(80 * 0.01875 * 100) / 100
      },
      {
        id: `item-lasllav-${Date.now()}-2`,
        materialId: argollaMat.id,
        name: argollaMat.name,
        category: 'laser',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'pza',
        unitCost: Math.round(((Number(argollaMat.costPerUnit) || 120) / 100) * 100) / 100,
        totalCost: Math.round(1 * 1.20 * 100) / 100
      },
      {
        id: `item-lasllav-${Date.now()}-3`,
        materialId: barnizMat.id,
        name: barnizMat.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 2,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 2,
        unit: 'ml',
        unitCost: Math.round(((Number(barnizMat.costPerUnit) || 135) / 400) * 100) / 100,
        totalCost: Math.round(2 * 0.3375 * 100) / 100
      },
      {
        id: `item-lasllav-${Date.now()}-4`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.05,
        wasteQuantity: 0.01,
        wasteType: 'manual',
        totalQuantity: 0.06,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 0.84
      },
      {
        id: `item-lasllav-${Date.now()}-5`,
        materialId: pegamentoMat.id,
        name: pegamentoMat.name,
        category: 'assembly',
        supplyType: 'indirect',
        netQuantity: 4,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 4,
        unit: 'gotas',
        unitCost: Math.round(((Number(pegamentoMat.costPerUnit) || 85) / 10000) * 10000) / 10000,
        totalCost: Math.round(4 * 0.0085 * 100) / 100
      },
      {
        id: `item-lasllav-${Date.now()}-6`,
        materialId: sierraMat.id,
        name: sierraMat.name,
        category: 'consumables',
        supplyType: 'indirect',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'corte',
        unitCost: 1.5,
        totalCost: 1.50
      }
    ];
  }

  if (tech === 'laser_mdf') {
    const mdfMat = findMat('mat-mdf-3mm', 'mdf') || {
      id: 'mat-mdf-3mm', name: 'Placas MDF Natural Calibrado 3mm (60x40 cm)', costPerUnit: 35, packageQuantity: 2400, packageMeasurement: 'cmÂ²', unit: 'placa (60x40 cm)'
    };
    const lacaMat = findMat('mat-laca-spray', 'laca') || {
      id: 'mat-laca-spray', name: 'Laca Protectora Selladora Mate Spray (400 ml)', costPerUnit: 120, packageQuantity: 400, packageMeasurement: 'ml', unit: 'lata (400 ml)'
    };
    const sierraMat = findMat('mat-desgaste-corte-sierra-laser', 'desgaste corte') || {
      id: 'mat-desgaste-corte-sierra-laser', name: 'Consumible Indirecto de Corte (Desgaste Hoja Sierra / Tubo LÃ¡ser CO2)', costPerUnit: 1.5, packageQuantity: 1, packageMeasurement: 'corte', unit: 'corte'
    };
    return [
      {
        id: `item-lasmdf-${Date.now()}-1`,
        materialId: mdfMat.id,
        name: mdfMat.name,
        category: 'laser',
        supplyType: 'direct',
        netQuantity: 380,
        wasteQuantity: 60,
        wasteType: 'cut_remnants',
        totalQuantity: 440,
        unit: 'cmÂ²',
        unitCost: Math.round(((Number(mdfMat.costPerUnit) || 35) / 2400) * 10000) / 10000,
        totalCost: Math.round(440 * 0.0146 * 100) / 100
      },
      {
        id: `item-lasmdf-${Date.now()}-2`,
        materialId: lacaMat.id,
        name: lacaMat.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 3,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 3,
        unit: 'ml',
        unitCost: Math.round(((Number(lacaMat.costPerUnit) || 120) / 400) * 100) / 100,
        totalCost: Math.round(3 * 0.30 * 100) / 100
      },
      {
        id: `item-lasmdf-${Date.now()}-3`,
        materialId: sierraMat.id,
        name: sierraMat.name,
        category: 'consumables',
        supplyType: 'indirect',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'corte',
        unitCost: 1.5,
        totalCost: 1.50
      }
    ];
  }

  if (tech === 'sublimation') {
    const tazaMat = findMat('mat-tazas-blancas-11oz', 'taza blanca') || {
      id: 'mat-tazas-blancas-11oz', name: 'Tazas CerÃ¡mica Blanco Puro Grado A+ (11 oz)', costPerUnit: 28, packageQuantity: 1, packageMeasurement: 'pza', unit: 'pieza'
    };
    const papelSubMat = findMat('mat-papel-sublimacion', 'papel sublimacion') || {
      id: 'mat-papel-sublimacion', name: 'Papel SublimaciÃ³n Secado RÃ¡pido A4 (100 hojas)', costPerUnit: 180, packageQuantity: 100, packageMeasurement: 'hoja', unit: 'paquete (100 hojas)'
    };
    const kaptonMat = findMat('mat-cinta-termica-kapton', 'cinta termica') || {
      id: 'mat-cinta-termica-kapton', name: 'Cinta TÃ©rmica Kapton 10mm x 33m (3 rollos)', costPerUnit: 90, packageQuantity: 9900, packageMeasurement: 'cm', unit: 'paquete (3 rollos)'
    };
    const tintaMat = findMat('mat-tintas-sublimacion-cmyk', 'tintas sublimacion') || {
      id: 'mat-tintas-sublimacion-cmyk', name: 'Tintas de SublimaciÃ³n CMYK (Set 4x100ml)', costPerUnit: 480, packageQuantity: 400, packageMeasurement: 'ml', unit: 'set (4 botellas)'
    };
    return [
      {
        id: `item-sub-${Date.now()}-1`,
        materialId: tazaMat.id,
        name: tazaMat.name,
        category: 'sublimation',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'pza',
        unitCost: Number(tazaMat.costPerUnit) || 28.00,
        totalCost: Number(tazaMat.costPerUnit) || 28.00
      },
      {
        id: `item-sub-${Date.now()}-2`,
        materialId: papelSubMat.id,
        name: papelSubMat.name,
        category: 'sublimation',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0.1,
        wasteType: 'cut_remnants',
        totalQuantity: 1.1,
        unit: 'hoja',
        unitCost: Math.round(((Number(papelSubMat.costPerUnit) || 180) / 100) * 100) / 100,
        totalCost: Math.round(1.1 * 1.80 * 100) / 100
      },
      {
        id: `item-sub-${Date.now()}-3`,
        materialId: tintaMat.id,
        name: tintaMat.name,
        category: 'sublimation',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0.2,
        wasteType: 'printer_purge',
        totalQuantity: 1.2,
        unit: 'ml',
        unitCost: Math.round(((Number(tintaMat.costPerUnit) || 480) / 400) * 100) / 100,
        totalCost: Math.round(1.2 * 1.20 * 100) / 100
      },
      {
        id: `item-sub-${Date.now()}-4`,
        materialId: kaptonMat.id,
        name: kaptonMat.name,
        category: 'sublimation',
        supplyType: 'indirect',
        netQuantity: 20,
        wasteQuantity: 5,
        wasteType: 'tape_scrap',
        totalQuantity: 25,
        unit: 'cm',
        unitCost: Math.round(((Number(kaptonMat.costPerUnit) || 90) / 9900) * 10000) / 10000,
        totalCost: Math.round(25 * 0.0091 * 100) / 100
      }
    ];
  }

  if (tech === 'dtf') {
    const playeraMat = findMat('mat-playera-poliester-blanca', 'playera') || {
      id: 'mat-playera-poliester-blanca', name: 'Playera Blanca Spun PoliÃ©ster / Tacto AlgodÃ³n', costPerUnit: 65, packageQuantity: 1, packageMeasurement: 'pza', unit: 'pieza'
    };
    const dtfFilm = findMat('mat-dtf-film-pet', 'dtf film') || {
      id: 'mat-dtf-film-pet', name: 'Film PET Transfer DTF Rollo 30cm x 100m', costPerUnit: 1650, packageQuantity: 10000, packageMeasurement: 'cm', unit: 'rollo (30cm x 100m)'
    };
    const dtfTinta = findMat('mat-dtf-tinta-cmykw', 'tintas textiles dtf') || {
      id: 'mat-dtf-tinta-cmykw', name: 'Tintas Textiles DTF CMYK + Blanco (Set 5 botellas)', costPerUnit: 1250, packageQuantity: 1250, packageMeasurement: 'ml', unit: 'set (5 botellas)'
    };
    const dtfPolvo = findMat('mat-dtf-poliamida-polvo', 'polvo poliamida') || {
      id: 'mat-dtf-poliamida-polvo', name: 'Polvo Poliamida Termofusible Hot-Melt DTF (1 kg)', costPerUnit: 450, packageQuantity: 1000, packageMeasurement: 'g', unit: 'bolsa (1 kg)'
    };
    return [
      {
        id: `item-dtf-${Date.now()}-1`,
        materialId: playeraMat.id,
        name: playeraMat.name,
        category: 'vinyl',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'pza',
        unitCost: Number(playeraMat.costPerUnit) || 65,
        totalCost: Number(playeraMat.costPerUnit) || 65
      },
      {
        id: `item-dtf-${Date.now()}-2`,
        materialId: dtfFilm.id,
        name: dtfFilm.name,
        category: 'vinyl',
        supplyType: 'direct',
        netQuantity: 28,
        wasteQuantity: 4,
        wasteType: 'cut_remnants',
        totalQuantity: 32,
        unit: 'cm',
        unitCost: Math.round(((Number(dtfFilm.costPerUnit) || 1650) / 10000) * 10000) / 10000,
        totalCost: Math.round(32 * 0.165 * 100) / 100
      },
      {
        id: `item-dtf-${Date.now()}-3`,
        materialId: dtfTinta.id,
        name: dtfTinta.name,
        category: 'vinyl',
        supplyType: 'direct',
        netQuantity: 2,
        wasteQuantity: 0.3,
        wasteType: 'printer_purge',
        totalQuantity: 2.3,
        unit: 'ml',
        unitCost: Math.round(((Number(dtfTinta.costPerUnit) || 1250) / 1250) * 100) / 100,
        totalCost: Math.round(2.3 * 1.00 * 100) / 100
      },
      {
        id: `item-dtf-${Date.now()}-4`,
        materialId: dtfPolvo.id,
        name: dtfPolvo.name,
        category: 'vinyl',
        supplyType: 'direct',
        netQuantity: 8,
        wasteQuantity: 2,
        wasteType: 'powder_waste',
        totalQuantity: 10,
        unit: 'g',
        unitCost: Math.round(((Number(dtfPolvo.costPerUnit) || 450) / 1000) * 100) / 100,
        totalCost: Math.round(10 * 0.45 * 100) / 100
      }
    ];
  }

  if (tech === 'carpinteria_cnc') {
    const maderaCnc = findMat('mat-madera-pino-solido-18mm', 'pino solido') || findMat('mat-madera-abedul-3mm', 'madera') || {
      id: 'mat-madera-pino-solido-18mm', name: 'Madera Natural Pino Estufado Macizo Primera 18mm (60x30 cm)', costPerUnit: 140, packageQuantity: 1800, packageMeasurement: 'cmÂ²', unit: 'tablero'
    };
    const barnizNogal = findMat('mat-tinte-nogal-americano', 'nogal') || {
      id: 'mat-tinte-nogal-americano', name: 'Tinte y Barniz Nogal Americano Base Aceite para Madera (250 ml)', costPerUnit: 110, packageQuantity: 250, packageMeasurement: 'ml', unit: 'bote (250 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    const fresaMat = findMat('mat-desgaste-fresa-cnc', 'fresa') || {
      id: 'mat-desgaste-fresa-cnc', name: 'Consumible de Desgaste (Fresa de Carburo de Tungsteno CNC / Sierra)', costPerUnit: 3.5, packageQuantity: 1, packageMeasurement: 'corte', unit: 'corte'
    };
    const resistolMat = findMat('mat-pegamento-resistol-850', 'resistol') || {
      id: 'mat-pegamento-resistol-850', name: 'Resistol 850 Pegamento Blanco para Madera Extra Fuerte (Bote 500g)', costPerUnit: 85, packageQuantity: 500, packageMeasurement: 'ml', unit: 'bote (500 ml)'
    };
    return [
      {
        id: `item-cnc-${Date.now()}-1`,
        materialId: maderaCnc.id,
        name: maderaCnc.name,
        category: 'laser',
        supplyType: 'direct',
        netQuantity: 450,
        wasteQuantity: 50,
        wasteType: 'cut_remnants',
        totalQuantity: 500,
        unit: 'cmÂ²',
        unitCost: Math.round(((Number(maderaCnc.costPerUnit) || 140) / 1800) * 10000) / 10000,
        totalCost: Math.round(500 * 0.0778 * 100) / 100
      },
      {
        id: `item-cnc-${Date.now()}-2`,
        materialId: barnizNogal.id,
        name: barnizNogal.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 8,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 8,
        unit: 'ml',
        unitCost: Math.round(((Number(barnizNogal.costPerUnit) || 110) / 250) * 100) / 100,
        totalCost: Math.round(8 * 0.44 * 100) / 100
      },
      {
        id: `item-cnc-${Date.now()}-3`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.15,
        wasteQuantity: 0.05,
        wasteType: 'manual',
        totalQuantity: 0.2,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 2.80
      },
      {
        id: `item-cnc-${Date.now()}-4`,
        materialId: fresaMat.id,
        name: fresaMat.name,
        category: 'consumables',
        supplyType: 'indirect',
        netQuantity: 1,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 1,
        unit: 'corte',
        unitCost: 3.5,
        totalCost: 3.50
      },
      {
        id: `item-cnc-${Date.now()}-5`,
        materialId: resistolMat.id,
        name: resistolMat.name,
        category: 'assembly',
        supplyType: 'indirect',
        netQuantity: 10,
        wasteQuantity: 2,
        wasteType: 'manual',
        totalQuantity: 12,
        unit: 'gotas',
        unitCost: 0.0085,
        totalCost: 0.10
      }
    ];
  }

  if (tech === 'impresion_laser') {
    const papelMat = findMat('mat-papel-couche-300g', 'couche') || findMat('mat-cartulina-opalina', 'opalina') || {
      id: 'mat-papel-couche-300g', name: 'Papel CouchÃ© Brillante 300g A4 (100 hojas)', costPerUnit: 160, packageQuantity: 100, packageMeasurement: 'hoja', unit: 'paquete (100 hojas)'
    };
    const tonerMat = findMat('mat-toner-click-laser', 'toner') || {
      id: 'mat-toner-click-laser', name: 'TÃ³ner LÃ¡ser Digital Color A4 (500 impresiones)', costPerUnit: 450, packageQuantity: 500, packageMeasurement: 'pza', unit: 'paquete (500 pzas)'
    };
    const foilMat = findMat('mat-foil-reactivo-oro', 'foil') || {
      id: 'mat-foil-reactivo-oro', name: 'Foil Reactivo al TÃ³ner LÃ¡ser Oro (Rollo 30cm x 15m)', costPerUnit: 220, packageQuantity: 1500, packageMeasurement: 'cm', unit: 'rollo (30cm x 15m)'
    };
    return [
      {
        id: `item-prn-${Date.now()}-1`,
        materialId: papelMat.id,
        name: papelMat.name,
        category: 'sublimation',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0.1,
        wasteType: 'cut_remnants',
        totalQuantity: 1.1,
        unit: 'hoja',
        unitCost: Math.round(((Number(papelMat.costPerUnit) || 160) / 100) * 100) / 100,
        totalCost: Math.round(1.1 * 1.60 * 100) / 100
      },
      {
        id: `item-prn-${Date.now()}-2`,
        materialId: tonerMat.id,
        name: tonerMat.name,
        category: 'sublimation',
        supplyType: 'direct',
        netQuantity: 1,
        wasteQuantity: 0.1,
        wasteType: 'printer_purge',
        totalQuantity: 1.1,
        unit: 'click',
        unitCost: Math.round(((Number(tonerMat.costPerUnit) || 450) / 500) * 100) / 100,
        totalCost: Math.round(1.1 * 0.90 * 100) / 100
      },
      {
        id: `item-prn-${Date.now()}-3`,
        materialId: foilMat.id,
        name: foilMat.name,
        category: 'sublimation',
        supplyType: 'finish',
        netQuantity: 20,
        wasteQuantity: 5,
        wasteType: 'foil_remnants',
        totalQuantity: 25,
        unit: 'cm',
        unitCost: Math.round(((Number(foilMat.costPerUnit) || 220) / 1500) * 10000) / 10000,
        totalCost: Math.round(25 * 0.1467 * 100) / 100
      }
    ];
  }

  if (tech === 'vinyl') {
    const vinilMat = findMat('mat-vinil-textil-blanco', 'vinil textil') || findMat('mat-vinil-negro', 'vinil adhesivo') || {
      id: 'mat-vinil-textil-blanco', name: 'Vinil Textil TÃ©rmico HTV BÃ¡sico Blanco (Metro lineal)', costPerUnit: 130, packageQuantity: 100, packageMeasurement: 'cm', unit: 'metro lineal (50 cm ancho)'
    };
    const transferMat = findMat('mat-papel-transfer', 'transfer') || {
      id: 'mat-papel-transfer', name: 'Cinta Transportadora Transfer con CuadrÃ­cula (10m)', costPerUnit: 160, packageQuantity: 1000, packageMeasurement: 'cm', unit: 'rollo (30 cm x 10 m)'
    };
    return [
      {
        id: `item-vin-${Date.now()}-1`,
        materialId: vinilMat.id,
        name: vinilMat.name,
        category: 'vinyl',
        supplyType: 'direct',
        netQuantity: 25,
        wasteQuantity: 5,
        wasteType: 'weeding_scrap',
        totalQuantity: 30,
        unit: 'cm',
        unitCost: Math.round(((Number(vinilMat.costPerUnit) || 130) / 100) * 100) / 100,
        totalCost: Math.round(30 * 1.30 * 100) / 100
      },
      {
        id: `item-vin-${Date.now()}-2`,
        materialId: transferMat.id,
        name: transferMat.name,
        category: 'vinyl',
        supplyType: 'indirect',
        netQuantity: 25,
        wasteQuantity: 3,
        wasteType: 'tape_scrap',
        totalQuantity: 28,
        unit: 'cm',
        unitCost: Math.round(((Number(transferMat.costPerUnit) || 160) / 1000) * 100) / 100,
        totalCost: Math.round(28 * 0.16 * 100) / 100
      }
    ];
  }

  if (tech === 'finish_nogal') {
    const barnizNogal = findMat('mat-tinte-nogal-americano', 'nogal') || {
      id: 'mat-tinte-nogal-americano', name: 'Tinte y Barniz Nogal Americano Base Aceite para Madera (250 ml)', costPerUnit: 110, packageQuantity: 250, packageMeasurement: 'ml', unit: 'bote (250 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    return [
      {
        id: `item-fin-${Date.now()}-1`,
        materialId: barnizNogal.id,
        name: barnizNogal.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 5,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 5,
        unit: 'ml',
        unitCost: 0.44,
        totalCost: 2.20
      },
      {
        id: `item-fin-${Date.now()}-2`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.08,
        wasteQuantity: 0.02,
        wasteType: 'manual',
        totalQuantity: 0.1,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 1.40
      }
    ];
  }

  if (tech === 'finish_transparente') {
    const barnizTransp = findMat('mat-barniz-poliuretano-spray', 'barniz spray') || {
      id: 'mat-barniz-poliuretano-spray', name: 'Barniz Poliuretano Transparente Satinado en Spray (400 ml)', costPerUnit: 135, packageQuantity: 400, packageMeasurement: 'ml', unit: 'lata (400 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    return [
      {
        id: `item-fin-${Date.now()}-1`,
        materialId: barnizTransp.id,
        name: barnizTransp.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 4,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 4,
        unit: 'ml',
        unitCost: 0.3375,
        totalCost: 1.35
      },
      {
        id: `item-fin-${Date.now()}-2`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.08,
        wasteQuantity: 0.02,
        wasteType: 'manual',
        totalQuantity: 0.1,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 1.40
      }
    ];
  }

  if (tech === 'finish_verde') {
    const tinteVerde = findMat('mat-tinte-verde-bosque', 'verde') || {
      id: 'mat-tinte-verde-bosque', name: 'Tinte para Madera Verde Bosque / Olivo RÃºstico (250 ml)', costPerUnit: 115, packageQuantity: 250, packageMeasurement: 'ml', unit: 'bote (250 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    return [
      {
        id: `item-fin-${Date.now()}-1`,
        materialId: tinteVerde.id,
        name: tinteVerde.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 5,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 5,
        unit: 'ml',
        unitCost: 0.46,
        totalCost: 2.30
      },
      {
        id: `item-fin-${Date.now()}-2`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.08,
        wasteQuantity: 0.02,
        wasteType: 'manual',
        totalQuantity: 0.1,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 1.40
      }
    ];
  }

  if (tech === 'finish_azul') {
    const tinteAzul = findMat('mat-tinte-azul-colonial', 'azul') || {
      id: 'mat-tinte-azul-colonial', name: 'Tinte para Madera Azul Colonial Vintage (250 ml)', costPerUnit: 115, packageQuantity: 250, packageMeasurement: 'ml', unit: 'bote (250 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    return [
      {
        id: `item-fin-${Date.now()}-1`,
        materialId: tinteAzul.id,
        name: tinteAzul.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 5,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 5,
        unit: 'ml',
        unitCost: 0.46,
        totalCost: 2.30
      },
      {
        id: `item-fin-${Date.now()}-2`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.08,
        wasteQuantity: 0.02,
        wasteType: 'manual',
        totalQuantity: 0.1,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 1.40
      }
    ];
  }

  if (tech === 'finish_caoba') {
    const tinteCaoba = findMat('mat-tinte-caoba-clasico', 'caoba') || {
      id: 'mat-tinte-caoba-clasico', name: 'Tinte para Madera Caoba ClÃ¡sico Rojizo (250 ml)', costPerUnit: 115, packageQuantity: 250, packageMeasurement: 'ml', unit: 'bote (250 ml)'
    };
    const lijaMat = findMat('mat-lija-madera-fina-220', 'lija') || {
      id: 'mat-lija-madera-fina-220', name: 'Lija de Madera Fina Grano 220 para Pulido y Cantos Suaves (Pliego)', costPerUnit: 14, packageQuantity: 1, packageMeasurement: 'pliego', unit: 'pliego'
    };
    return [
      {
        id: `item-fin-${Date.now()}-1`,
        materialId: tinteCaoba.id,
        name: tinteCaoba.name,
        category: 'laser',
        supplyType: 'finish',
        netQuantity: 5,
        wasteQuantity: 0,
        wasteType: 'none',
        totalQuantity: 5,
        unit: 'ml',
        unitCost: 0.46,
        totalCost: 2.30
      },
      {
        id: `item-fin-${Date.now()}-2`,
        materialId: lijaMat.id,
        name: lijaMat.name,
        category: 'consumables',
        supplyType: 'finish',
        netQuantity: 0.08,
        wasteQuantity: 0.02,
        wasteType: 'manual',
        totalQuantity: 0.1,
        unit: 'pliego',
        unitCost: 14,
        totalCost: 1.40
      }
    ];
  }

  if (tech === 'ensamble' || tech === 'ensamble_resistol') {
    const resistolMat = findMat('mat-pegamento-resistol-850', 'resistol') || {
      id: 'mat-pegamento-resistol-850', name: 'Resistol 850 Pegamento Blanco para Madera Extra Fuerte (500 ml)', costPerUnit: 85, packageQuantity: 500, packageMeasurement: 'ml', unit: 'bote (500 ml)'
    };
    const cianoMat = findMat('mat-pegamento-cianocrilato-gotas', 'cianoacrilato') || {
      id: 'mat-pegamento-cianocrilato-gotas', name: 'Pegamento InstantÃ¡neo Cianocrilato Grado Taller (50g)', costPerUnit: 110, packageQuantity: 50, packageMeasurement: 'g', unit: 'frasco (50g)'
    };
    return [
      {
        id: `item-ens-${Date.now()}-1`,
        materialId: resistolMat.id,
        name: resistolMat.name,
        category: 'assembly',
        supplyType: 'indirect',
        netQuantity: 10,
        wasteQuantity: 2,
        wasteType: 'glue_residue',
        totalQuantity: 12,
        unit: 'gotas',
        unitCost: Math.round(((Number(resistolMat.costPerUnit) || 85) / 10000) * 10000) / 10000,
        totalCost: Math.round(12 * 0.0085 * 100) / 100
      },
      {
        id: `item-ens-${Date.now()}-2`,
        materialId: cianoMat.id,
        name: cianoMat.name,
        category: 'assembly',
        supplyType: 'indirect',
        netQuantity: 4,
        wasteQuantity: 1,
        wasteType: 'glue_residue',
        totalQuantity: 5,
        unit: 'gotas',
        unitCost: Math.round(((Number(cianoMat.costPerUnit) || 110) / 1000) * 1000) / 1000,
        totalCost: Math.round(5 * 0.11 * 100) / 100
      }
    ];
  }

  return [];
}

export function generateDefaultRecipeForProduct(prod, rawMaterials = [], workshopParams = DEFAULT_WORKSHOP_PARAMS) {
  // Si el producto ya existe y tiene ficha de costos, reconstruimos desde su receta real.
  if (prod?.id && prod?.costBreakdown) {
    const recipe = buildRecipeFromProduct(prod, rawMaterials, workshopParams);
    const summary = computeRecipeCost(recipe, prod, rawMaterials, workshopParams);
    return applySummaryToRecipe(recipe, summary);
  }

  const techs = Array.isArray(prod?.techniques) ? prod.techniques : ['3d'];
  const code = (prod?.code || '').toUpperCase();
  const name = (prod?.name || '').toLowerCase();

  let mainTech = techs[0] || '3d';
  if (techs.includes('dtf') || name.includes('playera dtf')) mainTech = 'dtf';
  else if (techs.includes('impresion_laser') || name.includes('invitacion') || name.includes('tarjeta')) mainTech = 'impresion_laser';
  else if (techs.includes('sublimation') || name.includes('taza') || name.includes('termo') || name.includes('lata') || code.startsWith('S')) mainTech = 'sublimation';
  else if (techs.includes('laser') || code.startsWith('L') || name.includes('madera') || name.includes('letrero')) mainTech = 'laser';
  else if (techs.includes('vinyl') || name.includes('vinil')) mainTech = 'vinyl';
  else if (techs.includes('ensamble')) mainTech = 'ensamble';

  // Si tiene mÃºltiples tÃ©cnicas, recopilar los insumos de todas las tÃ©cnicas seleccionadas
  let items = [];
  techs.forEach(t => {
    const presetItems = getPresetItemsForTechnique(t, rawMaterials);
    items = [...items, ...presetItems];
  });

  if (items.length === 0) {
    items = getPresetItemsForTechnique(mainTech, rawMaterials);
  }

  // Tiempos y potencias de taller segÃºn tÃ©cnica principal
  let manufacturingTimeMinutes = 60;
  let machinePowerWatts = 250;
  let laborTimeMinutes = 10;
  let laborRatePerHour = 100;

  if (techs.includes('3d')) {
    manufacturingTimeMinutes = 180;
    machinePowerWatts = 250;
    laborTimeMinutes = 8;
  } else if (techs.includes('sublimation')) {
    manufacturingTimeMinutes = 8;
    machinePowerWatts = 1800;
    laborTimeMinutes = 6;
  } else if (techs.includes('dtf')) {
    manufacturingTimeMinutes = 12;
    machinePowerWatts = 1800;
    laborTimeMinutes = 10;
  } else if (techs.includes('laser')) {
    manufacturingTimeMinutes = 15;
    machinePowerWatts = 350;
    laborTimeMinutes = 10;
  } else if (techs.includes('impresion_laser')) {
    manufacturingTimeMinutes = 5;
    machinePowerWatts = 450;
    laborTimeMinutes = 8;
  } else if (techs.includes('vinyl')) {
    manufacturingTimeMinutes = 10;
    machinePowerWatts = 60;
    laborTimeMinutes = 15;
  }

  const kwhCost = 3.50; // $3.50 MXN estÃ¡ndar comercial CFE
  const energyCost = Math.round(((machinePowerWatts / 1000) * (manufacturingTimeMinutes / 60) * kwhCost) * 100) / 100;
  const laborCost = Math.round(((laborTimeMinutes / 60) * laborRatePerHour) * 100) / 100;

  const totalMaterialCost = Math.round(items.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
  const totalWasteCost = Math.round(items.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
  const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

  return {
    technique: mainTech,
    yieldUnits: 1,
    items,
    totalMaterialCost,
    totalWasteCost,
    wastePercentAverage,
    manufacturingTimeMinutes,
    machinePowerWatts,
    kwhCost,
    energyCost,
    laborTimeMinutes,
    laborRatePerHour,
    laborCost,
    packagingAndShipping: {
      enabled: false,
      packagingType: 'caja-kraft-chica',
      packagingCost: 12,
      shippingCost: 0,
      notes: ''
    }
  };
}

export default function AdminPanel({ isOpen, onClose, onRefreshCatalog, flashDeal = null }) {
  if (!isOpen) return null;

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('artesano_admin_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('artesano_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('products'); // 'stats' | 'products' | 'categories' | 'settings'
  const [rawMaterialsSubTab, setRawMaterialsSubTab] = useState('inventory');
  const [mobileNavGroup, setMobileNavGroup] = useState('catalog'); // 'catalog' | 'workshop' | 'sales' | 'business'

  useEffect(() => {
    if (['products', 'packages', 'categories', 'area-banners'].includes(activeTab)) {
      setMobileNavGroup('catalog');
    } else if (['raw-materials', 'margins'].includes(activeTab)) {
      setMobileNavGroup('workshop');
    } else if (['flash-deals', 'campaigns', 'coupons', 'sales', 'catalog-mobile'].includes(activeTab)) {
      setMobileNavGroup('sales');
    } else if (['stats', 'settings', 'arcade'].includes(activeTab)) {
      setMobileNavGroup('business');
    }
  }, [activeTab]);

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Product Filter State
  const [productSearch, setProductSearch] = useState('');
  const [filterWorld, setFilterWorld] = useState('all'); // 'all' | 'hogar' | 'negocios' | 'eventos'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // 'all' | 'in_stock' | 'made_to_order'
  const [filterTechnique, setFilterTechnique] = useState('all');
  const [productViewMode, setProductViewMode] = useState('grid'); // 'grid' (estilo paquetes) | 'table'
  const [productSort, setProductSort] = useState('newest'); // 'newest' | 'oldest' | 'sku_asc' | 'sku_desc' | 'name_asc' | 'price_desc' | 'price_asc'

  // Cost & Margins (Workshop Parameters & Calculations)
  const [workshopParams, setWorkshopParams] = useState({
    plaPerKg: 500,
    tpuPerKg: 700,
    electricityPerHour: 1.04,
    wearPerHour: 3.00,
    laborPerHour: 60,
    filamentWastePercent: 15,
    targetMarginPercent: 40,
    reservePercent: 10,
    rateStatus: 'Estimadas'
  });
  const [savingParams, setSavingParams] = useState(false);
  const [paramsSaveMsg, setParamsSaveMsg] = useState('');
  const [showWorkshopParams, setShowWorkshopParams] = useState(false);
  const [marginsSearch, setMarginsSearch] = useState('');
  const [marginsWorld, setMarginsWorld] = useState('all');
  const [marginsTechnique, setMarginsTechnique] = useState('all');
  const [marginsStatus, setMarginsStatus] = useState('all'); // 'all' | 'optimal' | 'low' | 'loss' | 'missing'
  const [marginSalesChannel, setMarginSalesChannel] = useState('direct'); // 'direct' | 'mercadolibre' | 'custom'
  const [customCommission, setCustomCommission] = useState(16);
  const [customFixedFee, setCustomFixedFee] = useState(25);

  // Category Filter & Technique Audit State
  const [categoryWorld, setCategoryWorld] = useState('all');
  const [categoryTechnique, setCategoryTechnique] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');

  // Detailed Cost Breakdown Modal State (Recipe Calculator)
  const [breakdownModalProduct, setBreakdownModalProduct] = useState(null);
  const [breakdownForm, setBreakdownForm] = useState(null);
  const [rawMaterialsList, setRawMaterialsList] = useState([]);
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false);
  const [recipeSelectedMatId, setRecipeSelectedMatId] = useState('');
  const [recipeCustomMatName, setRecipeCustomMatName] = useState('');
  const [recipeNewMatQty, setRecipeNewMatQty] = useState(12);
  const [recipeNewMatUnit, setRecipeNewMatUnit] = useState('g');
  const [recipeCustomUnitCost, setRecipeCustomUnitCost] = useState(0.8);
  const [recipeMatSearch, setRecipeMatSearch] = useState('');

  // Product Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  // Confirm Delete Product Modal & Session Mutation Review
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);
  const [sessionChanges, setSessionChanges] = useState({ deleted: [], edited: [], added: [] });
  const [showExitReviewModal, setShowExitReviewModal] = useState(false);

  const [editorForm, setEditorForm] = useState(null);
  const [editorActiveTab, setEditorActiveTab] = useState('general'); // 'general' | 'taller' | 'packaging' | 'pricing'
  const [editorNewItemSupplyType, setEditorNewItemSupplyType] = useState('direct'); // 'direct' | 'indirect'
  const [editorRecipeCategoryFilter, setEditorRecipeCategoryFilter] = useState('all'); // 'all' | 'direct' | 'indirect'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorMessage, setEditorMessage] = useState({ text: '', type: '' });
  const [customColorInput, setCustomColorInput] = useState('');
  const [newIncludedItemInput, setNewIncludedItemInput] = useState('');
  const [editorActiveSlot, setEditorActiveSlot] = useState(0); // 0: Portada/Contexto, 1: Fondo blanco, 2: Detalle, 3: Medidas/Escala
  const [editorSkuAccordion, setEditorSkuAccordion] = useState(false);
  const [editorColorsAccordion, setEditorColorsAccordion] = useState(false);
  const [editorFlashAccordion, setEditorFlashAccordion] = useState(false);
  const [editorRecipeAccordion, setEditorRecipeAccordion] = useState(true);
  const [editorRecipeMatSearch, setEditorRecipeMatSearch] = useState('');
  const [editorRecipeSelectedMatId, setEditorRecipeSelectedMatId] = useState('');
  const [editorRecipeNetQty, setEditorRecipeNetQty] = useState(45);
  const [editorRecipeWasteQty, setEditorRecipeWasteQty] = useState(15);
  const [editorRecipeWasteType, setEditorRecipeWasteType] = useState('supports_purge');
  const [editorRecipeUnit, setEditorRecipeUnit] = useState('g');
  const [editorRecipeCustomName, setEditorRecipeCustomName] = useState('');
  const [editorRecipeCustomCost, setEditorRecipeCustomCost] = useState(0.5);
  const [recipeSimulateUnits, setRecipeSimulateUnits] = useState(1);
  const [recipeSimulationModal, setRecipeSimulationModal] = useState(null);
  const [recipeDeductLoading, setRecipeDeductLoading] = useState(false);
  const [editorActiveWorkshopTech, setEditorActiveWorkshopTech] = useState('laser'); // 'laser' | '3d' | 'sublimation' | 'vinyl'
  const [editorSpecialSuppliesAccordion, setEditorSpecialSuppliesAccordion] = useState(false);
  const [editorSpecialSearch, setEditorSpecialSearch] = useState('');

  // Photo Studio Modal State (Estudio FotogrÃ¡fico IA / 4 Fotos)
  const [isPhotoStudioOpen, setIsPhotoStudioOpen] = useState(false);
  const [photoStudioProductId, setPhotoStudioProductId] = useState(null);

  const handleOpenPhotoStudio = (productId = null) => {
    if (productId === 'new' || (!productId && isEditorOpen && !editingProduct)) {
      setPhotoStudioProductId('new');
    } else if (productId) {
      setPhotoStudioProductId(productId);
    } else if (editingProduct?.id) {
      setPhotoStudioProductId(editingProduct.id);
    } else {
      setPhotoStudioProductId(products[0]?.id ?? 'new');
    }
    setIsPhotoStudioOpen(true);
  };

  const handleProductUpdatedFromStudio = (updatedProduct) => {
    if (!updatedProduct) return;
    if (updatedProduct.id === 'new' || updatedProduct.isNew || !editingProduct) {
      // Applied directly to the new product form in progress!
      setEditorForm(prev => {
        if (!prev) return prev;
        const newGal = Array.isArray(updatedProduct.gallery) ? [...updatedProduct.gallery] : prev.gallery;
        return {
          ...prev,
          name: updatedProduct.name && (!prev.name || prev.name === 'Nuevo Producto de CatÃ¡logo') ? updatedProduct.name : prev.name,
          sku: updatedProduct.sku || prev.sku,
          code: updatedProduct.sku || prev.code,
          primaryImage: newGal[0] || prev.primaryImage,
          whiteBgImage: newGal[1] || prev.whiteBgImage,
          detailImage: newGal[2] || prev.detailImage,
          measureImage: newGal[3] || prev.measureImage,
          gallery: newGal,
          specifications: {
            ...prev.specifications,
            ...(updatedProduct.specifications || {})
          }
        };
      });
      setIsEditorOpen(true);
      return;
    }

    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (editingProduct?.id === updatedProduct.id) {
      setEditingProduct(updatedProduct);
      setEditorForm(prev => prev ? ({
        ...prev,
        primaryImage: updatedProduct.primaryImage,
        whiteBgImage: updatedProduct.whiteBgImage,
        detailImage: updatedProduct.detailImage,
        measureImage: updatedProduct.measureImage,
        gallery: updatedProduct.gallery || prev.gallery
      }) : null);
    }
  };

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [serviceStatusMsg, setServiceStatusMsg] = useState({ text: '', type: '' });

  // Backups State
  const [backupsList, setBackupsList] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState({ text: '', type: '' });

  // Modal de ConfirmaciÃ³n y Desglose de Cambios
  const [adminConfirmModal, setAdminConfirmModal] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    badge: '',
    confirmText: 'Confirmar y Guardar',
    changes: [],
    onConfirm: null
  });

  // Mantiene la receta y el desglose de costos sincronizados en tiempo real.
  useEffect(() => {
    if (!isEditorOpen || !editorForm?.manufacturingRecipe) return;
    const currentRecipe = editorForm.manufacturingRecipe;
    const summary = computeRecipeCost(currentRecipe, editorForm, rawMaterialsList, workshopParams);
    const nextRecipe = applySummaryToRecipe(currentRecipe, summary);
    const keys = ['totalMaterialCost', 'totalWasteCost', 'wastePercentAverage', 'energyCost', 'wearCost', 'laborCost', 'failureReserveCost', 'fixedOverheadCost'];
    const totalsChanged = keys.some(key => Math.abs(Number(nextRecipe[key]) - Number(currentRecipe[key])) > 0.009);
    const itemsChanged = JSON.stringify(nextRecipe.items) !== JSON.stringify(currentRecipe.items);
    if (!totalsChanged && !itemsChanged) return;
    setEditorForm(prev => {
      if (!prev?.manufacturingRecipe) return prev;
      const prevSummary = computeRecipeCost(prev.manufacturingRecipe, prev, rawMaterialsList, workshopParams);
      const prevNext = applySummaryToRecipe(prev.manufacturingRecipe, prevSummary);
      return {
        ...prev,
        manufacturingRecipe: prevNext,
        costBreakdown: buildCostBreakdownFromSummary(prevSummary, prevNext, prev.costBreakdown)
      };
    });
  }, [isEditorOpen, editorForm?.manufacturingRecipe, rawMaterialsList, workshopParams]);

  // Load Data when token is present
  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      let dataProd = null;
      let dataCat = null;
      let dataStats = null;
      let dataSett = null;
      let dataMats = [];

      try {
        const [resProd, resCat, resStats, resSett, resMats] = await Promise.all([
          fetch('/api/admin/products', { headers }).catch(() => null),
          fetch('/api/admin/categories', { headers }).catch(() => null),
          fetch('/api/admin/analytics', { headers }).catch(() => null),
          fetch('/api/admin/settings', { headers }).catch(() => null),
          fetch('/api/admin/raw-materials', { headers }).catch(() => null)
        ]);

        if (resProd && resProd.status === 401) {
          handleLogout();
          return;
        }

        if (resProd && resProd.ok) dataProd = await resProd.json().catch(() => null);
        if (resCat && resCat.ok) dataCat = await resCat.json().catch(() => null);
        if (resStats && resStats.ok) dataStats = await resStats.json().catch(() => null);
        if (resSett && resSett.ok) dataSett = await resSett.json().catch(() => null);
        if (resMats && resMats.ok) dataMats = await resMats.json().catch(() => []);
      } catch (e) {
        console.warn('API admin endpoints no disponibles, usando datos estÃ¡ticos:', e);
      }

      // Fallback al catÃ¡logo administrativo completo (costos, recetas y materias primas)
      // cuando GitHub Pages no tiene backend /api/* activo.
      const missingAdminData = !dataProd || !Array.isArray(dataProd) || dataProd.length === 0 || !Array.isArray(dataMats) || dataMats.length === 0 || !dataSett;
      if (missingAdminData) {
        try {
          const res = await fetch('./api/admin-catalog.json');
          if (res.ok) {
            const adminCatalog = await res.json();
            if (Array.isArray(adminCatalog.products) && adminCatalog.products.length) dataProd = adminCatalog.products;
            if (Array.isArray(adminCatalog.categories) && adminCatalog.categories.length) dataCat = adminCatalog.categories;
            if (adminCatalog.settings && typeof adminCatalog.settings === 'object') dataSett = adminCatalog.settings;
            if (Array.isArray(adminCatalog.rawMaterials) && adminCatalog.rawMaterials.length) dataMats = adminCatalog.rawMaterials;
          }
        } catch {}
      }

      // Fallback a archivos estÃ¡ticos pÃºblicos si el catÃ¡logo administrativo no existe.
      if (!dataProd || !Array.isArray(dataProd) || dataProd.length === 0) {
        try {
          const res = await fetch('./api/products.json');
          if (res.ok) dataProd = await res.json();
        } catch {}
      }
      if (!dataCat || !Array.isArray(dataCat) || dataCat.length === 0) {
        try {
          const res = await fetch('./api/categories.json');
          if (res.ok) dataCat = await res.json();
        } catch {}
      }
      if (!dataSett || typeof dataSett !== 'object') {
        try {
          const res = await fetch('./api/settings.json');
          if (res.ok) dataSett = await res.json();
        } catch {}
      }

      loadBackups();

      // Persistencia local del modo estÃ¡tico (GitHub Pages): si el usuario
      // activÃ³ fotos o guardÃ³ ajustes en este dispositivo, no los perdemos al
      // recargar aunque /api/admin/settings no exista.
      try {
        const cachedSettings = JSON.parse(localStorage.getItem('artesano_settings_cache') || 'null');
        if (cachedSettings && typeof cachedSettings === 'object') {
          dataSett = {
            ...(dataSett || {}),
            ...cachedSettings,
            categoryBackgroundPhotos: {
              ...(dataSett?.categoryBackgroundPhotos || {}),
              ...(cachedSettings.categoryBackgroundPhotos || {})
            },
            workshopParams: {
              ...(dataSett?.workshopParams || {}),
              ...(cachedSettings.workshopParams || {})
            }
          };
        }
      } catch {}

      setProducts(dataProd || []);
      setCategories(dataCat || []);
      setAnalytics(dataStats || { visits: 0, views: 0, orders: 0 });
      setBusinessSettings(dataSett || null);
      if (dataSett?.workshopParams) {
        setWorkshopParams(dataSett.workshopParams);
      }
      setRawMaterialsList(Array.isArray(dataMats) ? dataMats : []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const inputUser = (loginForm.username || '').trim().toLowerCase();
    const inputPass = loginForm.password || '';

    // 1. Intentar con backend real si responde
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('artesano_admin_token', data.token);
        localStorage.setItem('artesano_admin_user', JSON.stringify(data.user));
        return;
      }
      if (res.status === 400 || res.status === 401) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || 'Credenciales incorrectas');
        return;
      }
    } catch (err) {
      // Backend no disponible (GitHub Pages estÃ¡tico o Render suspendido/offline)
    }

    // 2. Acceso administrativo local/offline si el servidor no estÃ¡ en lÃ­nea
    const validUsers = [
      'admin',
      'contactoartesanodigital@gmail.com',
      'wichonemes@gmail.com',
      'wichonemes'
    ];
    const isMasterPassword = inputPass === 'Artesano2026!' || inputPass === 'admin' || inputPass === 'artesano2026';

    if (validUsers.includes(inputUser) && isMasterPassword) {
      const offlineUser = {
        id: 'admin-1',
        username: 'admin',
        name: 'Administrador Artesano Digital',
        email: inputUser.includes('@') ? inputUser : 'contactoartesanodigital@gmail.com',
        role: 'superadmin'
      };
      const offlineToken = 'offline-session-token-' + Date.now();
      setToken(offlineToken);
      setCurrentUser(offlineUser);
      localStorage.setItem('artesano_admin_token', offlineToken);
      localStorage.setItem('artesano_admin_user', JSON.stringify(offlineUser));
      setLoginLoading(false);
      return;
    }

    setLoginError('Credenciales incorrectas o servidor no disponible.');
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('artesano_admin_token');
    localStorage.removeItem('artesano_admin_user');
  };

  // Backups Handlers
  const loadBackups = async () => {
    try {
      const res = await fetch('/api/admin/backups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data || []);
      }
    } catch (e) {
      console.error('Error al cargar respaldos:', e);
    }
  };

  const handleCreateBackup = async (label = 'manual') => {
    setBackupLoading(true);
    setBackupMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/backups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ label })
      });
      if (res.ok) {
        const data = await res.json();
        setBackupMsg({ text: `âœ“ Respaldo generado con Ã©xito (${data.sizeKb} KB)`, type: 'success' });
        loadBackups();
      } else {
        setBackupMsg({ text: 'Error al generar respaldo', type: 'error' });
      }
    } catch (e) {
      setBackupMsg({ text: e.message, type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`Â¿EstÃ¡s seguro de restaurar el respaldo "${filename}"? Los datos actuales se reemplazarÃ¡n por esta copia.`)) {
      return;
    }
    setBackupLoading(true);
    setBackupMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        setBackupMsg({ text: 'âœ“ Base de datos restaurada correctamente', type: 'success' });
        loadAllData();
        loadBackups();
      } else {
        const err = await res.json();
        setBackupMsg({ text: err.error || 'Error al restaurar respaldo', type: 'error' });
      }
    } catch (e) {
      setBackupMsg({ text: e.message, type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  // Product Actions
  const handleOpenNewProduct = (initialOpts = {}) => {
    setEditingProduct(null);
    const seq = String((products?.length || 0) + 1).padStart(3, '0');
    const isBundle = Boolean(initialOpts.isBundle || initialOpts.worlds?.includes('paquetes'));
    const initialSku = buildSku({
      area: isBundle ? 'PAQ' : 'HOG',
      technique: '3D',
      material: 'PLA',
      finish: 'MAT',
      sequence: seq
    });
    setEditorForm({
      code: initialSku,
      sku: initialSku,
      skuArea: isBundle ? 'PAQ' : 'HOG',
      skuTechnique: '3D',
      skuMaterial: 'PLA',
      skuFinish: 'MAT',
      skuSequence: seq,
      name: '',
      priceType: 'starting_at',
      price: isBundle ? 499 : 199,
      priceUnit: isBundle ? 'combo' : 'pieza',
      status: 'published',
      featured: false,
      isBundle,
      regularPrice: isBundle ? 649 : 249,
      savings: isBundle ? 150 : 50,
      includedItems: [],
      tiers: [],
      worlds: initialOpts.worlds || (isBundle ? ['paquetes'] : ['hogar']),
      categories: [],
      techniques: ['3d'],
      primaryImage: '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      whiteBgImage: '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      detailImage: '',
      measureImage: '',
      gallery: [
        '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
        '',
        '',
        ''
      ],
      flashDealConfig: {
        enabled: false,
        durationMinutes: 120,
        discountPercent: 15
      },
      shortDescription: '',
      fullDescription: '',
      specifications: {
        dimensions: '',
        material: 'PolÃ­mero PLA / Madera / AcrÃ­lico',
        finish: 'Satinado mate',
        includes: isBundle ? 'Set coordinado de taller' : 'Pieza terminada en taller',
        minQuantity: 1,
        estimatedLeadTime: '2 a 4 dÃ­as hÃ¡biles',
        careNotes: 'Limpieza con paÃ±o seco y suave.'
      },
      variants: [],
      customizationOptions: ['Grabado personalizado'],
      availability: 'in_stock',
      stockQuantity: 10,
      costPrice: isBundle ? 180 : 65,
      costBreakdown: {
        plaGrams: 60,
        tpuGrams: 0,
        otherMaterialsCost: 10,
        machineHours: 2.5,
        otherEquipCost: 0,
        manualWorkMin: 6,
        prepCost: 0,
        packagingCost: 4,
        additionalFailuresCost: 0,
        fixedOverheadCost: 0,
        shippingCost: 0,
        costStatus: 'Estimado'
      },
      manufacturingRecipe: generateDefaultRecipeForProduct({
        techniques: ['3d'],
        code: 'HOG-3D-PLA-001',
        name: 'Nuevo Producto'
      }, rawMaterialsList),
      privateNotes: '',
      repository: {
        platform: 'makerworld',
        makerworldUrl: '',
        makerworldModelId: '',
        author: '',
        license: 'Comercial / Libre',
        localPath: '',
        cloudUrl: '',
        slicerNotes: '',
        additionalLinks: []
      },
      manufacturingTimes: {
        machineHours: 1,
        machineMinutes: 30,
        postProcessingMinutes: 10,
        leadTimeDays: '2 a 4 dÃ­as hÃ¡biles'
      }
    });
    setNewIncludedItemInput('');
    setEditorActiveTab('general');
    setEditorNewItemSupplyType('direct');
    setEditorActiveSlot(0);
    setEditorSkuAccordion(false);
    setEditorColorsAccordion(false);
    setEditorFlashAccordion(false);
    setEditorRecipeAccordion(true);
    setEditorActiveWorkshopTech('3d');
    setEditorSpecialSuppliesAccordion(false);
    setEditorMessage({ text: '', type: '' });
    setIsEditorOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    if (!prod) return;
    setEditingProduct(prod);
    setEditorActiveTab('general');
    setEditorNewItemSupplyType('direct');
    setEditorActiveSlot(0);
    setEditorSkuAccordion(false);
    setEditorColorsAccordion(false);
    setEditorFlashAccordion(false);
    const prodTech = (prod.techniques && prod.techniques[0]) || (prod.skuBreakdown?.technique === 'LAS' || prod.code?.startsWith('L') ? 'laser' : '3d');
    setEditorActiveWorkshopTech(['3d', 'laser', 'sublimation', 'vinyl'].includes(prodTech) ? prodTech : 'laser');
    setEditorSpecialSuppliesAccordion(false);
    setNewIncludedItemInput('');

    const gal = prod.gallery && prod.gallery.length > 0 ? [...prod.gallery] : [
      prod.primaryImage || '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      prod.whiteBgImage || '',
      prod.detailImage || '',
      prod.measureImage || ''
    ];
    while (gal.length < 4) gal.push('');

    const resolvedSku = prod.sku || suggestSkuForProduct(prod, products);
    const parsed = parseSku(resolvedSku);

    const isBundle = Boolean(
      prod.isBundle ||
      prod.category === 'paquetes' ||
      prod.code?.startsWith('PROMO') ||
      prod.code?.includes('PATCH') ||
      prod.worlds?.includes('paquetes') ||
      prod.worlds?.includes('paquetes-servicios')
    );

    const regularPrice = prod.regularPrice || (prod.price ? Math.round(prod.price * 1.25) : 0);
    const savings = prod.savings || (regularPrice && prod.price ? Math.max(0, regularPrice - prod.price) : 0);

    const recipeSeed = prod.manufacturingRecipe?.items?.length
      ? prod.manufacturingRecipe
      : buildRecipeFromProduct(prod, rawMaterialsList, workshopParams);
    const recipeSummary = computeRecipeCost(recipeSeed, prod, rawMaterialsList, workshopParams);
    const resolvedRecipe = applySummaryToRecipe(recipeSeed, recipeSummary);


    const repo = prod.repository || {};
    const mwUrl = repo.makerworldUrl || prod.makerWorldModel || prod.makerworldUrl || prod.repositoryUrl || '';
    const mwId = repo.makerworldModelId || prod.makerWorldProfileId || prod.makerworldId || (mwUrl.match(/models\/(\d+)/)?.[1] || '');
    const mwAuthor = repo.author || prod.makerWorldAuthor || prod.author || prod.designer || '';
    const localP = repo.localPath || prod.localPath || prod.localFilesPath || '';
    const cloudU = repo.cloudUrl || prod.cloudUrl || '';
    const sNotes = repo.slicerNotes || prod.slicerNotes || prod.privateNotes || '';
    const addLinks = Array.isArray(repo.additionalLinks) ? [...repo.additionalLinks] : [];

    const mHoursVal = Number(prod.costBreakdown?.machineHours) || 
                      (Number(resolvedRecipe?.manufacturingTimeMinutes) ? (Number(resolvedRecipe.manufacturingTimeMinutes) / 60) : 1.5);
    const mH = Math.floor(mHoursVal);
    const mM = Math.round((mHoursVal - mH) * 60);
    const postProcMin = Number(prod.postProcessingTimeMinutes) || 
                        Number(prod.costBreakdown?.manualWorkMin) || 
                        Number(resolvedRecipe?.laborTimeMinutes) || 15;
    const leadTime = prod.specifications?.estimatedLeadTime || '2 a 4 dÃ­as hÃ¡biles';

    setEditorForm({
      ...prod,
      id: prod.id,
      name: prod.name || '',
      code: prod.code || resolvedSku,
      sku: resolvedSku,
      skuArea: prod.skuBreakdown?.area || parsed.area?.code || (isBundle ? 'PAQ' : 'HOG'),
      skuTechnique: prod.skuBreakdown?.technique || parsed.tech?.code || '3D',
      skuMaterial: prod.skuBreakdown?.material || parsed.mat?.code || 'PLA',
      skuFinish: prod.skuBreakdown?.finish || parsed.fin?.code || 'MAT',
      skuSequence: prod.skuBreakdown?.sequence || parsed.sequence || (prod.code?.match(/\d+/)?.[0]?.padStart(3, '0') || '001'),
      primaryImage: prod.primaryImage || gal[0] || '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg',
      whiteBgImage: prod.whiteBgImage || gal[1] || '',
      detailImage: prod.detailImage || gal[2] || '',
      measureImage: prod.measureImage || gal[3] || '',
      gallery: gal,
      isBundle,
      regularPrice,
      savings,
      includedItems: Array.isArray(prod.includedItems) ? [...prod.includedItems] : [],
      tiers: Array.isArray(prod.tiers) ? [...prod.tiers] : [],
      price: prod.price ?? '',
      priceUnit: prod.priceUnit || (isBundle ? 'combo' : 'pieza'),
      priceType: prod.priceType || 'starting_at',
      status: prod.status || 'published',
      featured: Boolean(prod.featured),
      worlds: Array.isArray(prod.worlds) ? [...prod.worlds] : (isBundle ? ['paquetes'] : ['hogar']),
      techniques: Array.isArray(prod.techniques) ? [...prod.techniques] : ['3d'],
      categories: Array.isArray(prod.categories) ? [...prod.categories] : [],
      shortDescription: prod.shortDescription || '',
      fullDescription: prod.fullDescription || '',
      availability: prod.availability || 'made_to_order',
      stockQuantity: prod.stockQuantity ?? (prod.availability === 'in_stock' ? 10 : 0),
      costPrice: prod.costPrice ?? (prod.price ? Math.round(prod.price * 0.4) : 0),
      costBreakdown: prod.costBreakdown || {},
      manufacturingRecipe: resolvedRecipe,
      flashDealConfig: prod.flashDealConfig || {
        enabled: false,
        durationMinutes: 120,
        discountPercent: 15
      },
      specifications: prod.specifications || {},
      variants: Array.isArray(prod.variants) ? [...prod.variants] : [],
      customizationOptions: Array.isArray(prod.customizationOptions) ? [...prod.customizationOptions] : [],
      repository: {
        platform: repo.platform || (mwUrl ? 'makerworld' : 'local'),
        makerworldUrl: mwUrl,
        makerworldModelId: mwId,
        author: mwAuthor,
        license: repo.license || prod.license || 'Comercial Autorizado',
        localPath: localP,
        cloudUrl: cloudU,
        slicerNotes: sNotes,
        additionalLinks: addLinks
      },
      manufacturingTimes: prod.manufacturingTimes || {
        machineHours: mH,
        machineMinutes: mM,
        postProcessingMinutes: postProcMin,
        leadTimeDays: leadTime
      }
    });
    setEditorRecipeAccordion(true);
    setEditorMessage({ text: '', type: '' });
    setIsEditorOpen(true);
  };

  const handleEditProduct = handleOpenEditProduct;

  // Handlers para administraciÃ³n de componentes de paquetes y combos
  const handleAddIncludedItem = () => {
    if (!newIncludedItemInput.trim()) return;
    setEditorForm(prev => ({
      ...prev,
      includedItems: [...(prev.includedItems || []), newIncludedItemInput.trim()]
    }));
    setNewIncludedItemInput('');
  };

  const handleRemoveIncludedItem = (idx) => {
    setEditorForm(prev => ({
      ...prev,
      includedItems: (prev.includedItems || []).filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateIncludedItem = (idx, text) => {
    setEditorForm(prev => {
      const items = [...(prev.includedItems || [])];
      items[idx] = text;
      return { ...prev, includedItems: items };
    });
  };

  // Handlers para administraciÃ³n de Recetas de Manufactura (BOM) e Insumos
  const handleAddEditorRecipeItem = () => {
    if (!editorRecipeSelectedMatId && !editorRecipeCustomName.trim()) return;

    let selMat = null;
    let name = editorRecipeCustomName.trim();
    let unit = editorRecipeUnit;
    let unitCost = Number(editorRecipeCustomCost) || 0;
    let category = 'general';

    if (editorRecipeSelectedMatId) {
      selMat = rawMaterialsList.find(m => m.id === editorRecipeSelectedMatId);
      if (selMat) {
        name = selMat.name;
        category = selMat.category || 'general';
        const pkg = parsePackageInfo(selMat);
        const pkgCost = Number(selMat.costPerUnit || selMat.packageCost || 0);
        const pkgQty = Number(pkg.packageQuantity) || 1;
        const pkgMeas = (pkg.packageMeasurement || 'pza').toLowerCase().trim();
        const reqUnit = (editorRecipeUnit || pkgMeas).toLowerCase().trim();

        unitCost = pkgCost / pkgQty;
        if ((reqUnit === 'g' || reqUnit === 'gr') && (pkgMeas === 'kg' || pkgMeas === 'kilo')) {
          unitCost = pkgCost / (pkgQty * 1000);
        } else if ((reqUnit === 'kg' || reqUnit === 'kilo') && (pkgMeas === 'g' || pkgMeas === 'gr')) {
          unitCost = (pkgCost / pkgQty) * 1000;
        } else if ((reqUnit === 'cm') && (pkgMeas === 'm' || pkgMeas === 'metro')) {
          unitCost = pkgCost / (pkgQty * 100);
        } else if ((reqUnit === 'm') && (pkgMeas === 'cm')) {
          unitCost = (pkgCost / pkgQty) * 100;
        } else if ((reqUnit === 'ml') && (pkgMeas === 'l' || pkgMeas === 'litro')) {
          unitCost = pkgCost / (pkgQty * 1000);
        }
      }
    }

    const netQty = Math.max(0, Number(editorRecipeNetQty) || 0);
    const wasteQty = Math.max(0, Number(editorRecipeWasteQty) || 0);
    const totalQty = Math.round((netQty + wasteQty) * 100) / 100;
    const totalCost = Math.round(totalQty * unitCost * 100) / 100;

    const newItem = {
      id: `item-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      materialId: editorRecipeSelectedMatId || '',
      name,
      category,
      supplyType: editorNewItemSupplyType || (name.toLowerCase().includes('barniz') || name.toLowerCase().includes('tinte') || name.toLowerCase().includes('laca') || name.toLowerCase().includes('sellador') ? 'finish' : (category === 'consumables' || name.toLowerCase().includes('lija') || name.toLowerCase().includes('sierra') || name.toLowerCase().includes('estopa') || name.toLowerCase().includes('cinta') ? 'indirect' : 'direct')),
      netQuantity: netQty,
      wasteQuantity: wasteQty,
      wasteType: editorRecipeWasteType,
      totalQuantity: totalQty,
      unit,
      unitCost: Math.round(unitCost * 10000) / 10000,
      totalCost
    };

    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    const updatedItems = [...(currentRecipe.items || []), newItem];
    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage
      }
    });

    setEditorRecipeCustomName('');
    setEditorRecipeSelectedMatId('');
  };

  const handleToggleItemSupplyType = (itemId) => {
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    const updatedItems = (currentRecipe.items || []).map(it => {
      if (it.id !== itemId) return it;
      let nextType = 'direct';
      if (it.supplyType === 'direct') nextType = 'finish';
      else if (it.supplyType === 'finish') nextType = 'indirect';
      else nextType = 'direct';
      return {
        ...it,
        supplyType: nextType
      };
    });
    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems
      }
    });
  };

  const handleSetItemSupplyType = (itemId, newType) => {
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    const updatedItems = (currentRecipe.items || []).map(it => {
      if (it.id !== itemId) return it;
      return {
        ...it,
        supplyType: newType
      };
    });
    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems
      }
    });
  };

  const handleRemoveEditorRecipeItem = (itemId) => {
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    const updatedItems = (currentRecipe.items || []).filter(it => it.id !== itemId);
    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage
      }
    });
  };

  const handleUpdateEditorRecipeItem = (itemId, field, value) => {
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    const updatedItems = (currentRecipe.items || []).map(it => {
      if (it.id !== itemId) return it;
      const updated = { ...it, [field]: value };
      const net = field === 'netQuantity' ? Number(value) : (Number(updated.netQuantity) || 0);
      const waste = field === 'wasteQuantity' ? Number(value) : (Number(updated.wasteQuantity) || 0);
      updated.totalQuantity = Math.round((net + waste) * 100) / 100;
      updated.totalCost = Math.round(updated.totalQuantity * (Number(updated.unitCost) || 0) * 100) / 100;
      return updated;
    });

    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage
      }
    });
  };

  const handleToggleProductTechnique = (techId) => {
    if (!editorForm) return;
    const currentTechs = editorForm.techniques || [];
    let updated = [];
    const isCurrentlyActive = currentTechs.includes(techId) || (techId === 'laser' && currentTechs.some(t => t.startsWith('laser')));

    if (isCurrentlyActive) {
      if (currentTechs.length > 1) {
        updated = currentTechs.filter(t => t !== techId && !(techId === 'laser' && t.startsWith('laser')));
      } else {
        updated = [];
      }
    } else {
      updated = [...currentTechs, techId];
    }

    const techProfiles = {
      laser: { watts: 450, mins: 15, laborMins: 10 },
      '3d': { watts: 250, mins: 120, laborMins: 8 },
      sublimation: { watts: 1800, mins: 5, laborMins: 6 },
      impresion_laser: { watts: 900, mins: 5, laborMins: 7 },
      print: { watts: 900, mins: 5, laborMins: 7 },
      vinyl: { watts: 50, mins: 12, laborMins: 12 }
    };

    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    let newWatts = currentRecipe.machinePowerWatts || 250;
    let newMins = currentRecipe.manufacturingTimeMinutes || 30;
    let newLaborMins = currentRecipe.laborTimeMinutes || 15;

    if (!isCurrentlyActive && techProfiles[techId]) {
      newWatts = techProfiles[techId].watts;
      newMins = techProfiles[techId].mins;
      newLaborMins = techProfiles[techId].laborMins;
    }

    const kwhRate = Number(currentRecipe.kwhCost) || 3.50;
    const laborRate = Number(currentRecipe.laborRatePerHour) || 75;
    const energyCost = Math.round(((newWatts / 1000) * (newMins / 60) * kwhRate) * 100) / 100;
    const laborCost = Math.round(((newLaborMins / 60) * laborRate) * 100) / 100;

    setEditorForm({
      ...editorForm,
      techniques: updated,
      manufacturingRecipe: {
        ...currentRecipe,
        technique: updated[0] || techId,
        machinePowerWatts: newWatts,
        manufacturingTimeMinutes: newMins,
        laborTimeMinutes: newLaborMins,
        energyCost,
        laborCost
      }
    });
    setEditorActiveWorkshopTech(techId);
  };

  const handleAddDirectMaterialFromPreset = (matId, defaultNetQty, defaultWasteQty, defaultUnit, wasteType = 'kerf_cut') => {
    if (!editorForm) return;
    const mat = rawMaterialsList.find(m => m.id === matId) || rawMaterialsList.find(m => (m.name || '').toLowerCase().includes(matId.toLowerCase()));
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };
    const existingIndex = (currentRecipe.items || []).findIndex(it => it.materialId === matId || (mat && it.materialId === mat.id));

    if (existingIndex >= 0) {
      setEditorMessage({ text: `â„¹ï¸ El insumo "${mat?.name || matId}" ya estÃ¡ en la receta. Puedes editar sus cantidades abajo.`, type: 'info' });
      setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
      return;
    }

    const pkg = mat ? parsePackageInfo(mat) : { packageMeasurement: defaultUnit };
    const unit = defaultUnit || pkg.packageMeasurement || 'g';
    let unitCost = 0.5;
    if (mat) {
      const packageCost = Number(mat.costPerUnit) || 0;
      const packageQty = Number(mat.packageQuantity) || 1000;
      unitCost = packageQty > 0 ? (packageCost / packageQty) : packageCost;
    }

    const totalQty = defaultNetQty + defaultWasteQty;
    const totalCost = Math.round(totalQty * unitCost * 100) / 100;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: mat ? mat.id : matId,
      name: mat ? mat.name : matId,
      category: mat?.category || editorActiveWorkshopTech,
      supplyType: 'direct',
      netQuantity: defaultNetQty,
      wasteQuantity: defaultWasteQty,
      wasteType,
      totalQuantity: totalQty,
      unit,
      unitCost: Math.round(unitCost * 10000) / 10000,
      totalCost
    };

    const updatedItems = [...(currentRecipe.items || []), newItem];
    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage
      }
    });

    setEditorMessage({ text: `âœ“ Insumo "${newItem.name}" agregado como Directo a la receta.`, type: 'success' });
    setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
  };

  const handleAddIndirectPreset = (matId, defaultNetQty, defaultUnit, customName) => {
    if (!editorForm) return;
    const mat = rawMaterialsList.find(m => m.id === matId) || rawMaterialsList.find(m => (m.name || '').toLowerCase().includes(matId.toLowerCase()));
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };

    let unitCost = 1;
    if (mat) {
      const packageCost = Number(mat.costPerUnit) || 0;
      const packageQty = Number(mat.packageQuantity) || 1;
      unitCost = packageQty > 0 ? (packageCost / packageQty) : packageCost;
    }

    const totalQty = defaultNetQty;
    const totalCost = Math.round(totalQty * unitCost * 100) / 100;

    const newItem = {
      id: `item-ind-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: mat ? mat.id : matId,
      name: mat ? mat.name : (customName || matId),
      category: mat?.category || 'consumables',
      supplyType: 'indirect',
      netQuantity: defaultNetQty,
      wasteQuantity: 0,
      wasteType: 'none',
      totalQuantity: totalQty,
      unit: defaultUnit,
      unitCost: Math.round(unitCost * 10000) / 10000,
      totalCost
    };

    const updatedItems = [...(currentRecipe.items || []), newItem];
    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage
      }
    });

    setEditorMessage({ text: `âœ“ Consumible "${newItem.name}" agregado a Indirectos.`, type: 'success' });
    setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
  };

  const handleAddFinishPreset = (matId, defaultNetQty, defaultUnit, customName) => {
    if (!editorForm) return;
    const mat = rawMaterialsList.find(m => m.id === matId) || rawMaterialsList.find(m => (m.name || '').toLowerCase().includes(matId.toLowerCase()));
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };

    let unitCost = 0.40;
    if (mat) {
      const packageCost = Number(mat.costPerUnit) || 0;
      const packageQty = Number(mat.packageQuantity) || 1;
      unitCost = packageQty > 0 ? (packageCost / packageQty) : packageCost;
    }

    const totalQty = defaultNetQty;
    const totalCost = Math.round(totalQty * unitCost * 100) / 100;

    const newItem = {
      id: `item-fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialId: mat ? mat.id : matId,
      name: mat ? mat.name : (customName || matId),
      category: 'finishing',
      supplyType: 'finish',
      netQuantity: defaultNetQty,
      wasteQuantity: 0,
      wasteType: 'none',
      totalQuantity: totalQty,
      unit: defaultUnit,
      unitCost: Math.round(unitCost * 10000) / 10000,
      totalCost
    };

    const updatedItems = [...(currentRecipe.items || []), newItem];
    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage
      }
    });

    setEditorMessage({ text: `âœ“ Acabado "${newItem.name}" agregado a Terminaciones de taller.`, type: 'success' });
    setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
  };

  const handleApplyRecipePreset = (presetType, append = false) => {
    const presetItems = getPresetItemsForTechnique(presetType, rawMaterialsList);
    const currentRecipe = editorForm.manufacturingRecipe || { items: [] };

    let updatedItems = [];
    if (append) {
      updatedItems = [...(currentRecipe.items || []), ...presetItems];
    } else {
      updatedItems = presetItems;
    }

    const totalMaterialCost = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
    const totalWasteCost = Math.round(updatedItems.reduce((acc, it) => acc + ((Number(it.wasteQuantity) || 0) * (Number(it.unitCost) || 0)), 0) * 100) / 100;
    const wastePercentAverage = totalMaterialCost > 0 ? Math.round((totalWasteCost / totalMaterialCost) * 1000) / 10 : 0;

    const currentTechs = editorForm.techniques || [];
    const isSpecialFinishOrGlue = presetType.startsWith('finish_') || presetType.startsWith('ensamble');
    const updatedTechs = isSpecialFinishOrGlue
      ? currentTechs
      : (currentTechs.includes(presetType) ? currentTechs : [...currentTechs, presetType]);

    // ParÃ¡metros de mÃ¡quina predefinidos por tÃ©cnica
    const techMachineProfiles = {
      '3d': { watts: 250, mins: 180, laborMins: 8 },
      '3d_resina': { watts: 60, mins: 90, laborMins: 12 },
      'laser': { watts: 450, mins: 15, laborMins: 10 },
      'laser_madera': { watts: 450, mins: 15, laborMins: 10 },
      'laser_llavero': { watts: 450, mins: 8, laborMins: 6 },
      'laser_mdf': { watts: 450, mins: 12, laborMins: 8 },
      'sublimation': { watts: 1800, mins: 5, laborMins: 6 },
      'dtf': { watts: 1800, mins: 10, laborMins: 10 },
      'carpinteria_cnc': { watts: 800, mins: 35, laborMins: 20 },
      'impresion_laser': { watts: 600, mins: 3, laborMins: 6 },
      'vinyl': { watts: 50, mins: 12, laborMins: 12 }
    };

    const profile = techMachineProfiles[presetType];
    let newWatts = currentRecipe.machinePowerWatts || 250;
    let newMins = currentRecipe.manufacturingTimeMinutes || 30;
    let newLaborMins = currentRecipe.laborTimeMinutes || 15;
    let laborRate = Number(currentRecipe.laborRatePerHour) || 75;
    let kwhRate = Number(currentRecipe.kwhCost) || 3.50;

    if (!append && profile) {
      newWatts = profile.watts;
      newMins = profile.mins;
      newLaborMins = profile.laborMins;
    }

    const energyCost = Math.round(((newWatts / 1000) * (newMins / 60) * kwhRate) * 100) / 100;
    const laborCost = Math.round(((newLaborMins / 60) * laborRate) * 100) / 100;

    setEditorForm({
      ...editorForm,
      techniques: updatedTechs,
      manufacturingRecipe: {
        ...currentRecipe,
        technique: updatedTechs[0] || currentRecipe.technique || presetType,
        items: updatedItems,
        totalMaterialCost,
        totalWasteCost,
        wastePercentAverage,
        machinePowerWatts: newWatts,
        manufacturingTimeMinutes: newMins,
        laborTimeMinutes: newLaborMins,
        energyCost,
        laborCost
      }
    });

    setEditorMessage({
      text: append ? `âœ“ Insumos agregados a la receta.` : `âœ“ Receta inicializada con tÃ©cnica de ${presetType.toUpperCase()} (${newMins} min mÃ¡quina / ${newWatts}W).`,
      type: 'success'
    });
    setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
  };

  const handleUpdateRecipeField = (field, value) => {
    const rec = editorForm.manufacturingRecipe || {};
    const updatedRec = { ...rec, [field]: value };

    const watts = field === 'machinePowerWatts' ? Number(value) : (Number(updatedRec.machinePowerWatts) || 0);
    const mins = field === 'manufacturingTimeMinutes' ? Number(value) : (Number(updatedRec.manufacturingTimeMinutes) || 0);
    const kwh = field === 'kwhCost' ? Number(value) : (Number(updatedRec.kwhCost) || 3.50);
    updatedRec.energyCost = Math.round(((watts / 1000) * (mins / 60) * kwh) * 100) / 100;

    const laborMins = field === 'laborTimeMinutes' ? Number(value) : (Number(updatedRec.laborTimeMinutes) || 0);
    const laborRate = field === 'laborRatePerHour' ? Number(value) : (Number(updatedRec.laborRatePerHour) || 0);
    updatedRec.laborCost = Math.round(((laborMins / 60) * laborRate) * 100) / 100;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: updatedRec
    });
  };

  const handleUpdatePackagingField = (field, value) => {
    const currentRecipe = editorForm.manufacturingRecipe || {};
    const currentPkg = currentRecipe.packagingAndShipping || {
      enabled: true,
      boxType: 'caja_mediana',
      boxCost: 12,
      bubbleWrapCost: 3.5,
      cushioningCost: 2.5,
      labelTapeCost: 2,
      packagingCost: 20,
      shippingCarrier: 'nacional_estandar',
      shippingCost: 149,
      includeShippingInPrice: false,
      notes: ''
    };

    const updatedPkg = { ...currentPkg, [field]: value };

    // Si cambiÃ³ el tipo de caja predefinida, sugerir su costo
    if (field === 'boxType') {
      if (value === 'caja_chica') updatedPkg.boxCost = 8;
      else if (value === 'caja_mediana') updatedPkg.boxCost = 12;
      else if (value === 'caja_grande') updatedPkg.boxCost = 18;
      else if (value === 'taza') updatedPkg.boxCost = 9;
      else if (value === 'luxury') updatedPkg.boxCost = 25;
      else if (value === 'sobre_rigido') updatedPkg.boxCost = 6;
      else if (value === 'bolsa_celofan') updatedPkg.boxCost = 3.5;
    }

    // Si cambiÃ³ la paqueterÃ­a predefinida, sugerir su costo de flete
    if (field === 'shippingCarrier') {
      if (value === 'nacional_estandar') updatedPkg.shippingCost = 149;
      else if (value === 'nacional_express') updatedPkg.shippingCost = 220;
      else if (value === 'local_slp') updatedPkg.shippingCost = 0;
      else if (value === 'local_domicilio') updatedPkg.shippingCost = 45;
    }

    // Recalcular costo total de embalaje
    const box = Number(updatedPkg.boxCost) || 0;
    const bubble = Number(updatedPkg.bubbleWrapCost) || 0;
    const cushion = Number(updatedPkg.cushioningCost) || 0;
    const labelTape = Number(updatedPkg.labelTapeCost) || 0;
    updatedPkg.packagingCost = Math.round((box + bubble + cushion + labelTape) * 100) / 100;

    setEditorForm({
      ...editorForm,
      manufacturingRecipe: {
        ...currentRecipe,
        packagingAndShipping: updatedPkg
      }
    });
  };

  const handleApplyTargetMargin = (marginPercent) => {
    const cost = Number(editorForm.costPrice) || 0;
    if (cost <= 0) {
      setEditorMessage({ text: 'âš ï¸ Primero sincroniza o ingresa el costo de producciÃ³n para calcular el precio.', type: 'error' });
      setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
      return;
    }
    const targetMarginRatio = marginPercent / 100;
    const calculatedPvp = Math.ceil(cost / (1 - targetMarginRatio));
    setEditorForm({
      ...editorForm,
      price: calculatedPvp
    });
    setEditorMessage({
      text: `âœ“ Precio ajustado a $${calculatedPvp} MXN para obtener ${marginPercent}% de margen de utilidad (Ganancia: $${(calculatedPvp - cost).toFixed(1)} MXN).`,
      type: 'success'
    });
    setTimeout(() => setEditorMessage({ text: '', type: '' }), 3500);
  };

  const handleSyncRecipeToCostPrice = () => {
    const rec = editorForm.manufacturingRecipe || {};
    const summary = computeRecipeCost(rec, editorForm, rawMaterialsList, workshopParams);
    const recipe = applySummaryToRecipe(rec, summary);
    const totalCost = summary.totalCost;
    if (totalCost > 0) {
      setEditorForm({
        ...editorForm,
        costPrice: totalCost,
        manufacturingRecipe: recipe,
        costBreakdown: buildCostBreakdownFromSummary(summary, recipe, editorForm.costBreakdown)
      });
      setEditorMessage({
        text: `Costo sincronizado a $${totalCost.toFixed(2)} MXN (Insumos: $${summary.materialCost.toFixed(1)} + Luz: $${summary.energyCost.toFixed(1)} + Desgaste: $${summary.wearCost.toFixed(1)} + Mano de obra: $${summary.laborCost.toFixed(1)} + Embalaje: $${summary.packagingCost.toFixed(1)} + Reserva: $${summary.failureReserveCost.toFixed(1)}).`,
        type: 'success'
      });
      setTimeout(() => setEditorMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleSimulateProduction = async (units = 1) => {
    try {
      const res = await fetch('/api/admin/production/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: editingProduct?.id || 'simulated-preview',
          units,
          customRecipe: editorForm.manufacturingRecipe
        })
      });
      const data = await res.json();
      setRecipeSimulationModal(data);
    } catch (err) {
      console.error('Error simulating production:', err);
    }
  };

  const handleDeductStockNow = async (units = 1) => {
    if (!window.confirm(`Â¿Confirmas que deseas descontar del almacÃ©n de taller los insumos para fabricar ${units} pieza(s)?`)) return;
    setRecipeDeductLoading(true);
    try {
      const res = await fetch('/api/admin/production/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: editingProduct?.id || 'direct-workshop-prod',
          units,
          productName: editorForm.name || 'Producto',
          productCode: editorForm.code || '',
          reason: `FabricaciÃ³n directa de stock desde el editor (${units} pzas)`,
          customRecipe: editorForm.manufacturingRecipe
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditorMessage({
          text: `âœ“ Â¡Insumos descontados de almacÃ©n exitosamente para ${units} unidad(es)!`,
          type: 'success'
        });
        await loadAllData();
      } else {
        setEditorMessage({
          text: data.error || 'Error al descontar insumos',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error deducting stock:', err);
    } finally {
      setRecipeDeductLoading(false);
    }
  };

  // Quick 1-click toggle for Stock / Availability from table
  const handleToggleStock = async (prod, e) => {
    if (e) e.stopPropagation();
    const isCurrentlyInStock = prod.availability === 'in_stock';
    const newAvailability = isCurrentlyInStock ? 'made_to_order' : 'in_stock';
    const newStockQty = newAvailability === 'in_stock'
      ? (prod.stockQuantity && Number(prod.stockQuantity) > 0 ? Number(prod.stockQuantity) : 10)
      : 0;

    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, availability: newAvailability, stockQuantity: newStockQty } : p));

    try {
      const res = await fetch(`/api/admin/products/${prod.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availability: newAvailability,
          stockQuantity: newStockQty
        })
      });

      if (!res.ok) {
        await loadAllData();
      } else {
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error toggling stock:', err);
      await loadAllData();
    }
  };

  // Quick 1-click toggle for Published / Draft status from cards or table
  const handleToggleStatus = async (prod, e) => {
    if (e) e.stopPropagation();
    const nextStatus = prod.status === 'published' ? 'draft' : 'published';
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, status: nextStatus } : p));

    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          status: nextStatus
        })
      });
      if (!res.ok) {
        await loadAllData();
      } else {
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      await loadAllData();
    }
  };

  // Quick adjustment of physical stock count (+1 / -1)
  const handleAdjustStockQuantity = async (prod, delta, e) => {
    if (e) e.stopPropagation();
    const currentQty = Number(prod.stockQuantity) || 0;
    const newQty = Math.max(0, currentQty + delta);
    const newAvailability = newQty > 0 ? 'in_stock' : 'made_to_order';

    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, availability: newAvailability, stockQuantity: newQty } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availability: newAvailability,
          stockQuantity: newQty
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error adjusting stock qty:', err);
      await loadAllData();
    }
  };

  // Save Workshop Parameters (PLA $/kg, TPU $/kg, Electricity, Wear, Labor, Margin, Reserve)
  const handleSaveWorkshopParams = (e) => {
    if (e) e.preventDefault();
    const changes = [
      {
        icon: 'ðŸ§µ',
        label: 'Costo Filamento PLA',
        detail: `$${workshopParams.plaCostPerKg || 350} MXN por kg`,
        badge: 'PLA'
      },
      {
        icon: 'ðŸª¡',
        label: 'Costo Filamento TPU',
        detail: `$${workshopParams.tpuCostPerKg || 550} MXN por kg`,
        badge: 'TPU'
      },
      {
        icon: 'âš¡',
        label: 'Tarifa ElÃ©ctrica del Taller',
        detail: `$${workshopParams.electricityKwhRate || 3.5} MXN por kWh (${workshopParams.printerKw || 0.15} kW de impresora)`
      },
      {
        icon: 'â±ï¸',
        label: 'Mano de Obra & Desgaste',
        detail: `$${workshopParams.hourlyLaborCost || 80} MXN/h labor humana Â· $${workshopParams.wearRatePerHour || 1.8} MXN/h depreciaciÃ³n mÃ¡quina`
      },
      {
        icon: 'ðŸ“ˆ',
        label: 'Margen de Utilidad & Reserva',
        detail: `${workshopParams.defaultMarkupPercent || 150}% margen de utilidad deseado Â· ${workshopParams.failureReservePercent || 10}% reserva por fallos`
      }
    ];

    setAdminConfirmModal({
      isOpen: true,
      title: 'Confirmar ParÃ¡metros de Costo de Taller',
      subtitle: 'Â¿Deseas aplicar estos nuevos costos y parÃ¡metros a todas las estimaciones y cÃ¡lculos automÃ¡ticos del taller?',
      badge: 'Costos de Taller',
      confirmText: 'SÃ­, Guardar ParÃ¡metros',
      changes,
      onConfirm: async () => {
        setAdminConfirmModal(prev => ({ ...prev, isOpen: false }));
        await executeSaveWorkshopParams();
      }
    });
  };

  const executeSaveWorkshopParams = async () => {
    setSavingParams(true);
    setParamsSaveMsg('');
    try {
      const res = await fetch('/api/admin/workshop-params', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workshopParams)
      });
      if (res.ok) {
        setParamsSaveMsg('âœ“ ParÃ¡metros guardados y sincronizados');
        setTimeout(() => setParamsSaveMsg(''), 3000);
        await loadAllData();
      }
    } catch (err) {
      console.error('Error saving workshop params:', err);
    } finally {
      setSavingParams(false);
    }
  };

  // Inline update of product unit cost from the Margins table
  const handleUpdateProductCost = async (prod, newCost) => {
    const cost = parseFloat(newCost);
    if (isNaN(cost) || cost < 0) return;

    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, costPrice: cost } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          costPrice: cost
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error updating cost price:', err);
    }
  };

  // Inline update of product sale price from the Margins table or Products table
  const handleUpdateProductPrice = async (prod, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;

    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, price: price, priceType: 'starting_at' } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          price: price,
          priceType: 'starting_at'
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error updating sale price:', err);
    }
  };

  // Inline update of product price unit (e.g. pieza, lote, paquete, etc.)
  const handleUpdateProductUnit = async (prod, newUnit) => {
    const unit = (newUnit || '').trim();
    if (!unit) return;

    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, priceUnit: unit } : p));

    try {
      await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          priceUnit: unit
        })
      });
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err) {
      console.error('Error updating product unit:', err);
    }
  };

  // Convierte la calculadora visual al formato de la receta compartida.
  const buildCostingRecipeFromBreakdownForm = (product, form) => {
    if (!product || !form) return null;
    let items = (Array.isArray(form.recipeItems) ? form.recipeItems : []).map((item, index) => {
      const materialId = item.rawMaterialId || item.materialId || '';
      const material = rawMaterialsList.find(m => m.id === materialId);
      const itemName = item.name || material?.name || 'Insumo';
      const category = item.category || material?.category || (/empaque|caja|bolsa|etiqueta|viruta|burbuja/i.test(itemName) ? 'packaging' : /lija|cinta|estopa|guante|brocha/i.test(itemName) ? 'consumables' : 'materials');
      const supplyType = item.supplyType || (category === 'packaging' || category === 'consumables' ? 'indirect' : 'direct');
      return {
        id: item.id || `item-${index + 1}`,
        materialId,
        name: itemName,
        category,
        supplyType,
        netQuantity: Number(item.quantity ?? item.netQuantity ?? item.totalQuantity) || 0,
        wasteQuantity: Number(item.wasteQuantity) || 0,
        unit: item.unit || 'pieza',
        unitCost: Number(item.unitCost) || 0
      };
    });
    const otherCost = Number(form.otherMaterialsCost) || 0;
    const hasNonFilamentItem = items.some(item =>
      item.category !== 'packaging' && !/filamento|\bpla\b|\btpu\b|\bpetg\b/i.test(item.name)
    );
    if (otherCost > 0 && !hasNonFilamentItem && !items.some(item => /insumo directo|base|otros materiales/i.test(item.name))) {
      items.push({ id: 'item-otros-materiales', materialId: '', name: 'Insumos directos y materiales base', category: 'materials', supplyType: 'direct', netQuantity: 1, wasteQuantity: 0, unit: 'lote', unitCost: otherCost });
    }
    const packagingCost = Number(form.packagingCost) || 0;
    const shippingCost = Number(form.shippingCost) || 0;
    return {
      ...(product.manufacturingRecipe || {}),
      items,
      yieldUnits: Math.max(1, Number(form.yieldUnits) || 1),
      manufacturingTimeMinutes: (Number(form.machineHours) || 0) * 60,
      machinePowerWatts: Number(product.manufacturingRecipe?.machinePowerWatts) || 250,
      laborTimeMinutes: Number(form.manualWorkMin) || 0,
      laborRatePerHour: Number(workshopParams.laborPerHour) || 60,
      failureReservePercent: Number(form.additionalFailuresCost) > 0 ? 0 : (Number(workshopParams.failureReservePercent) || 3),
      failureReserveCost: Number(form.additionalFailuresCost) || 0,
      fixedOverheadCost: (Number(form.fixedOverheadCost) || 0) + (Number(form.otherEquipCost) || 0) + (Number(form.prepCost) || 0),
      kwhCost: Number(workshopParams.kwhCost) || 3.5,
      packagingAndShipping: { enabled: packagingCost > 0, packagingCost, shippingIncludedInPrice: shippingCost > 0, shippingCost }
    };
  };

  // Open Detailed Cost Breakdown Modal for product
  const handleOpenCostBreakdown = (prod) => {
    setBreakdownModalProduct(prod);
    const cb = prod.costBreakdown || {};

    // Construcciâ”œâ”‚n de items iniciales de la receta estilo app mâ”œâ”‚vil
    let initialRecipeItems = [];
    if (cb.recipeItems && Array.isArray(cb.recipeItems) && cb.recipeItems.length > 0) {
      initialRecipeItems = cb.recipeItems.map(item => ({
        id: item.id,
        rawMaterialId: item.rawMaterialId || item.materialId || '',
        name: item.name,
        quantity: Number(item.quantity ?? item.netQuantity ?? item.totalQuantity) || 0,
        wasteQuantity: Number(item.wasteQuantity) || 0,
        unit: item.unit || 'pieza',
        unitCost: Number(item.unitCost) || 0,
        lineTotal: Number(item.lineTotal ?? item.totalCost) || 0
      }));
    } else if (Array.isArray(prod.manufacturingRecipe?.items) && prod.manufacturingRecipe.items.length > 0) {
      initialRecipeItems = prod.manufacturingRecipe.items.map(item => ({
        id: item.id,
        rawMaterialId: item.rawMaterialId || item.materialId || '',
        name: item.name,
        quantity: Number(item.quantity ?? item.netQuantity ?? item.totalQuantity) || 0,
        wasteQuantity: Number(item.wasteQuantity) || 0,
        unit: item.unit || 'pieza',
        unitCost: Number(item.unitCost) || 0,
        lineTotal: Number(item.lineTotal ?? item.totalCost) || 0
      }));
    } else {
      const plaKg = Number(workshopParams.plaPerKg) || 500;
      const plaGrams = Number(cb.plaGrams || (prod.techniques?.includes('3d') ? 12 : 0));
      if (plaGrams > 0) {
        initialRecipeItems.push({
          id: `rec-pla-${Date.now()}`,
          rawMaterialId: 'mat-pla-olivo',
          name: 'Pla',
          quantity: plaGrams,
          unit: 'g',
          unitCost: Math.round((plaKg / 1000) * 100) / 100,
          lineTotal: Math.round(((plaGrams * plaKg) / 1000) * 100) / 100
        });
      }
      const tpuKg = Number(workshopParams.tpuPerKg) || 700;
      const tpuGrams = Number(cb.tpuGrams || 0);
      if (tpuGrams > 0) {
        initialRecipeItems.push({
          id: `rec-tpu-${Date.now()}`,
          rawMaterialId: 'mat-tpu-negro',
          name: 'Tpu Flexible',
          quantity: tpuGrams,
          unit: 'g',
          unitCost: Math.round((tpuKg / 1000) * 100) / 100,
          lineTotal: Math.round(((tpuGrams * tpuKg) / 1000) * 100) / 100
        });
      }
      const otherCost = Number(cb.otherMaterialsCost || 0);
      if (otherCost > 0) {
        initialRecipeItems.push({
          id: `rec-other-${Date.now()}`,
          name: 'Insumo Directo / Base',
          quantity: 1,
          unit: 'pza',
          unitCost: otherCost,
          lineTotal: otherCost
        });
      }
      const packagingCost = Number(cb.packagingCost || 0);
      if (packagingCost > 0) {
        initialRecipeItems.push({
          id: `rec-pack-${Date.now()}`,
          name: 'Empaque & Embalaje',
          quantity: 1,
          unit: 'pza',
          unitCost: packagingCost,
          lineTotal: packagingCost
        });
      }
    }

    setBreakdownForm({
      salePrice: prod.price ?? (prod.priceType === 'quote' ? 0 : 199),
      recipeName: cb.recipeName || prod.name || 'Impresiâ”œâ”‚n 3d',
      recipeItems: initialRecipeItems,
      yieldUnits: Number(cb.yieldUnits) || 1,
      targetMarginPercent: cb.targetMarginPercent !== undefined ? Number(cb.targetMarginPercent) : (Number(workshopParams.targetMarginPercent) || 40),
      recipeNotes: cb.recipeNotes || '',
      plaGrams: cb.plaGrams || 0,
      tpuGrams: cb.tpuGrams || 0,
      otherMaterialsCost: cb.otherMaterialsCost ?? (prod.techniques?.includes('3d') ? 0 : prod.costPrice || 0),
      machineHours: cb.machineHours || 0,
      otherEquipCost: cb.otherEquipCost || 0,
      manualWorkMin: cb.manualWorkMin || 0,
      prepCost: cb.prepCost || 0,
      packagingCost: cb.packagingCost || 0,
      additionalFailuresCost: cb.additionalFailuresCost || 0,
      fixedOverheadCost: cb.fixedOverheadCost || 0,
      shippingCost: cb.shippingCost || 0,
      costStatus: cb.costStatus || 'Verificado'
    });
    setShowAddQuantityModal(false);
  };

  // Helper para aâ”œâ–’adir item de materia prima a la receta
  const handleAddRecipeItemFromModal = (e) => {
    if (e) e.preventDefault();
    if (!breakdownForm) return;

    let newItem = null;
    if (recipeSelectedMatId) {
      const mat = rawMaterialsList.find(m => m.id === recipeSelectedMatId);
      if (mat) {
        const pkgInfo = parsePackageInfo(mat);
        const pkgCost = Number(mat.costPerUnit || mat.packageCost || 0);
        const pkgQty = Number(pkgInfo.packageQuantity) || 1;
        const pkgUnit = (pkgInfo.packageMeasurement || 'pza').toLowerCase().trim();
        const reqUnit = (recipeNewMatUnit || pkgUnit).toLowerCase().trim();
        const numQty = Number(recipeNewMatQty) || 0;

        let unitCost = pkgCost / pkgQty;
        if ((reqUnit === 'g' || reqUnit === 'gr') && (pkgUnit === 'kg' || pkgUnit === 'kilo')) {
          unitCost = pkgCost / (pkgQty * 1000);
        } else if ((reqUnit === 'kg' || reqUnit === 'kilo') && (pkgUnit === 'g' || pkgUnit === 'gr')) {
          unitCost = (pkgCost / pkgQty) * 1000;
        } else if ((reqUnit === 'ml' || reqUnit === 'mililitro') && (pkgUnit === 'l' || pkgUnit === 'litro')) {
          unitCost = pkgCost / (pkgQty * 1000);
        } else if ((reqUnit === 'l' || reqUnit === 'litro') && (pkgUnit === 'ml' || pkgUnit === 'mililitro')) {
          unitCost = (pkgCost / pkgQty) * 1000;
        }

        const lineTotal = Math.round(numQty * unitCost * 100) / 100;
        newItem = {
          id: `rec-item-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          rawMaterialId: mat.id,
          name: mat.name,
          quantity: numQty,
          unit: recipeNewMatUnit,
          unitCost: Math.round(unitCost * 100) / 100,
          lineTotal
        };
      }
    } else if (recipeCustomMatName.trim()) {
      const numQty = Number(recipeNewMatQty) || 0;
      const numUnitCost = Number(recipeCustomUnitCost) || 0;
      const lineTotal = Math.round(numQty * numUnitCost * 100) / 100;
      newItem = {
        id: `rec-item-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        name: recipeCustomMatName.trim(),
        quantity: numQty,
        unit: recipeNewMatUnit,
        unitCost: numUnitCost,
        lineTotal
      };
    }

    if (newItem) {
      setBreakdownForm(prev => ({
        ...prev,
        recipeItems: [...(prev.recipeItems || []), newItem]
      }));
      setShowAddQuantityModal(false);
      setRecipeSelectedMatId('');
      setRecipeCustomMatName('');
    }
  };

  const handleRemoveRecipeItem = (itemId) => {
    setBreakdownForm(prev => ({
      ...prev,
      recipeItems: (prev.recipeItems || []).filter(i => i.id !== itemId)
    }));
  };

  // Save Cost Breakdown from modal and apply to product
  const handleSaveCostBreakdown = async () => {
    if (!breakdownModalProduct || !breakdownForm) return;

    const recipe = buildCostingRecipeFromBreakdownForm(breakdownModalProduct, breakdownForm);
    if (!recipe) return;
    const summary = computeRecipeCost(recipe, breakdownModalProduct, rawMaterialsList, workshopParams);
    const yieldUnits = Math.max(1, Number(breakdownForm.yieldUnits) || 1);
    const targetMargin = Math.max(1, Math.min(85, Number(breakdownForm.targetMarginPercent ?? workshopParams.targetMarginPercent) || 40)) / 100;
    const recipeSuggestedPrice = summary.totalCost > 0 ? Math.round(summary.totalCost / (1 - targetMargin)) : 0;
    const totalCalculated = summary.totalCost;
    const updatedPrice = breakdownForm.salePrice !== undefined && breakdownForm.salePrice !== '' && !isNaN(Number(breakdownForm.salePrice))
      ? Number(breakdownForm.salePrice)
      : (recipeSuggestedPrice > 0 ? recipeSuggestedPrice : breakdownModalProduct.price);
    const recipeForSave = applySummaryToRecipe(recipe, summary);

    const costBreakdownPayload = {
      ...breakdownForm,
      ...buildCostBreakdownFromSummary(summary, recipeForSave, breakdownForm),
      recipeName: breakdownForm.recipeName || breakdownModalProduct.name || 'ImpresiÃ³n 3D',
      recipeItems: recipeForSave.items,
      yieldUnits,
      rawMaterialsCost: summary.materialCost,
      overheadCost: summary.fixedOverheadCost,
      recipeTotalUnitCost: summary.totalCost,
      recipeSuggestedPrice,
      costStatus: 'Calculado de Taller'
    };

    try {
      if (isEditorOpen) {
        setEditorForm(prev => ({
          ...prev,
          costPrice: totalCalculated,
          price: updatedPrice,
          manufacturingRecipe: recipeForSave,
          costBreakdown: costBreakdownPayload
        }));
      }

      if (breakdownModalProduct.id) {
        const res = await fetch(`/api/admin/products/${breakdownModalProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...breakdownModalProduct,
            costPrice: totalCalculated,
            price: updatedPrice,
            priceType: updatedPrice > 0 ? 'starting_at' : breakdownModalProduct.priceType,
            manufacturingRecipe: recipeForSave,
            costBreakdown: costBreakdownPayload
          })
        });
        if (res.ok) {
          await loadAllData();
          if (onRefreshCatalog) onRefreshCatalog();
        }
      }
      setBreakdownModalProduct(null);
    } catch (err) {
      console.error('Error saving cost breakdown:', err);
    }
  };

  // Quick 1-click toggle for Flash Deal from table
  const handleToggleProductFlash = async (prod, e) => {
    if (e) e.stopPropagation();
    try {
      const currentConfig = prod.flashDealConfig || { enabled: false, durationMinutes: 120, discountPercent: 15 };
      const newEnabled = !currentConfig.enabled;
      const updatedConfig = {
        ...currentConfig,
        enabled: newEnabled,
        startedAt: newEnabled ? Date.now() : null,
        expiresAt: newEnabled ? Date.now() + (currentConfig.durationMinutes || 120) * 60 * 1000 : null
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: updatedConfig
        })
      });

      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error toggling flash deal:', err);
    }
  };

  // Change flash deal duration and settings directly
  const handleSetFlashDuration = async (prod, durationMinutes, discountPercent = 15) => {
    try {
      const currentConfig = prod.flashDealConfig || {};
      const updatedConfig = {
        ...currentConfig,
        enabled: true,
        durationMinutes,
        discountPercent,
        startedAt: Date.now(),
        expiresAt: Date.now() + durationMinutes * 60 * 1000
      };

      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          flashDealConfig: updatedConfig
        })
      });

      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error('Error updating flash deal duration:', err);
    }
  };

  // Live active flash deals (combining manual enabled products and hook cyclical deals)
  const activeFlashList = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Manual flash deals from admin products state
    products.forEach(p => {
      if (p.flashDealConfig?.enabled) {
        seenIds.add(p.id);
        const timerInfo = flashDeal?.getTimeForProduct ? flashDeal.getTimeForProduct(p.id) : null;
        list.push({
          product: p,
          isManual: true,
          durationMinutes: p.flashDealConfig.durationMinutes || 120,
          discountPercent: p.flashDealConfig.discountPercent || 15,
          timerInfo
        });
      }
    });

    // 2. Cyclical active flash deals from flashDeal engine
    if (flashDeal?.activeFlashProducts) {
      flashDeal.activeFlashProducts.forEach(p => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          const timerInfo = flashDeal?.getTimeForProduct ? flashDeal.getTimeForProduct(p.id) : null;
          list.push({
            product: p,
            isManual: false,
            durationMinutes: timerInfo?.cycleDuration ? Math.round(timerInfo.cycleDuration / 60) : 120,
            discountPercent: timerInfo?.discountPercent || 15,
            timerInfo
          });
        }
      });
    }

    return list;
  }, [products, flashDeal]);

  // Service status & workshop availability
  const activeServiceStatus = useMemo(() => {
    return businessSettings?.serviceStatus || DEFAULT_SERVICE_STATUS;
  }, [businessSettings]);

  const serviceSummary = useMemo(() => {
    return getServiceStatusSummary(activeServiceStatus);
  }, [activeServiceStatus]);

  // Area flash limits statistics based on strict user rules
  const areaLimitsStats = useMemo(() => {
    const hogarProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('hogar'));
    const negociosProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('negocios'));
    const eventosProds = products.filter(p => p.status === 'published' && !p.isBundle && p.worlds?.includes('eventos'));
    const paquetesProds = products.filter(p => p.status === 'published' && (p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes')));

    const hogarActive = activeFlashList.filter(item => item.product.worlds?.includes('hogar')).length;
    const negociosActive = activeFlashList.filter(item => item.product.worlds?.includes('negocios')).length;
    const eventosActive = activeFlashList.filter(item => item.product.worlds?.includes('eventos')).length;
    const paquetesActive = activeFlashList.filter(item => {
      const p = item.product;
      return p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes');
    }).length;

    // Hogar: Solo entre 2 y 3 oferta flash activa cada 13 productos
    const hogarTarget = Math.min(hogarProds.length, Math.max(2, Math.round(hogarProds.length * (2.5 / 13))));
    // Negocios: Solo 2 y 3 oferta flash activa cada 10 productos
    const negociosTarget = Math.min(negociosProds.length, Math.max(2, Math.round(negociosProds.length * (2.5 / 10))));
    // Eventos Especiales: MÃ¡ximo 4 a 5 ofertas flash activas cada 13 productos
    const eventosTarget = Math.min(5, Math.max(4, Math.round(eventosProds.length * (4.5 / 13))));
    // Paquetes & Servicios: 1 a 2 ofertas promocionales activas
    const paquetesTarget = Math.min(3, Math.max(1, Math.round(paquetesProds.length * (2 / 10))));

    return {
      hogar: {
        id: 'hogar',
        name: 'Hogar & DecoraciÃ³n',
        icon: 'ðŸ ',
        rule: 'Solo entre 2 y 3 oferta flash activa cada 13 productos',
        shortRule: '2 a 3 por cada 13 productos',
        total: hogarProds.length,
        active: hogarActive,
        target: hogarTarget
      },
      negocios: {
        id: 'negocios',
        name: 'Negocios & Marca',
        icon: 'ðŸ’¼',
        rule: 'Solo 2 y 3 oferta flash activa cada 10 productos',
        shortRule: '2 a 3 por cada 10 productos',
        total: negociosProds.length,
        active: negociosActive,
        target: negociosTarget
      },
      eventos: {
        id: 'eventos',
        name: 'Eventos Especiales',
        icon: 'ðŸŽ‰',
        rule: 'MÃ¡ximo 4 a 5 ofertas flash activas cada 13 productos',
        shortRule: 'MÃ¡ximo 4 a 5 por cada 13 productos',
        total: eventosProds.length,
        active: eventosActive,
        target: eventosTarget
      },
      paquetes: {
        id: 'paquetes',
        name: 'Paquetes & Servicios',
        icon: 'ðŸŽ',
        rule: 'Combos y paquetes con oferta blitz activa',
        shortRule: '1 a 2 paquetes en oferta flash',
        total: paquetesProds.length,
        active: paquetesActive,
        target: paquetesTarget
      }
    };
  }, [products, activeFlashList]);

  const handleDuplicateProduct = async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = (productOrId) => {
    const prod = typeof productOrId === 'object' && productOrId !== null
      ? productOrId
      : (products.find(p => p.id === productOrId) || { id: productOrId, name: 'Producto #' + productOrId });
    setConfirmDeleteProduct(prod);
  };

  const handleConfirmDeleteExecution = async () => {
    if (!confirmDeleteProduct) return;
    const target = confirmDeleteProduct;
    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSessionChanges(prev => ({
          ...prev,
          deleted: [...prev.deleted.filter(x => x.id !== target.id), {
            id: target.id,
            name: target.name || 'Producto',
            sku: target.sku || target.code || '',
            time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          }]
        }));
        setConfirmDeleteProduct(null);
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'No se pudo eliminar el producto del catÃ¡logo.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error de conexiÃ³n al eliminar el producto.');
    }
  };

  const handleRequestCloseAdmin = () => {
    const hasChanges = (sessionChanges.deleted.length > 0) || (sessionChanges.edited.length > 0) || (sessionChanges.added.length > 0);
    if (hasChanges) {
      setShowExitReviewModal(true);
    } else {
      onClose();
    }
  };

  // Upload handler for specific image slot ('portada' | 'blanco' | 'detalle' | 'escala' | number | 'extra')
  const handleUploadSlot = async (slotKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(slotKey);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setEditorForm(prev => {
          const updated = { ...prev };
          const gal = [...(prev.gallery || [])];
          while (gal.length < 4) gal.push('');

          if (slotKey === 'portada') {
            updated.primaryImage = data.url;
            gal[0] = data.url;
          } else if (slotKey === 'blanco') {
            updated.whiteBgImage = data.url;
            gal[1] = data.url;
          } else if (slotKey === 'detalle') {
            updated.detailImage = data.url;
            gal[2] = data.url;
          } else if (slotKey === 'escala') {
            updated.measureImage = data.url;
            gal[3] = data.url;
          } else if (typeof slotKey === 'number') {
            gal[slotKey] = data.url;
          } else if (slotKey === 'extra') {
            gal.push(data.url);
          }

          updated.gallery = gal;
          return updated;
        });
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar para subir archivo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateSlotUrl = (slotKey, newUrl) => {
    setEditorForm(prev => {
      const updated = { ...prev };
      const gal = [...(prev.gallery || [])];
      while (gal.length < 4) gal.push('');

      if (slotKey === 'portada') {
        updated.primaryImage = newUrl;
        gal[0] = newUrl;
      } else if (slotKey === 'blanco') {
        updated.whiteBgImage = newUrl;
        gal[1] = newUrl;
      } else if (slotKey === 'detalle') {
        updated.detailImage = newUrl;
        gal[2] = newUrl;
      } else if (slotKey === 'escala') {
        updated.measureImage = newUrl;
        gal[3] = newUrl;
      } else if (typeof slotKey === 'number') {
        gal[slotKey] = newUrl;
      }

      updated.gallery = gal;
      return updated;
    });
  };

  const handleRemoveExtraImage = (index) => {
    setEditorForm(prev => {
      const gal = [...(prev.gallery || [])];
      gal.splice(index, 1);
      return {
        ...prev,
        gallery: gal
      };
    });
  };

  const handleAddExtraImage = () => {
    setEditorForm(prev => {
      const gal = [...(prev.gallery || [])];
      while (gal.length < 4) gal.push('');
      gal.push('/uploads/img_002.jpg');
      return {
        ...prev,
        gallery: gal
      };
    });
  };

  // Material and Color customization helpers
  const WORKSHOP_MATERIALS = [
    'PLA Biodegradable (ImpresiÃ³n 3D)',
    'PETG / TPU Flexible (ImpresiÃ³n 3D)',
    'Madera Natural / Triplay / MDF (Corte LÃ¡ser)',
    'AcrÃ­lico Ã“ptico (Cristalino / Negro / Humo)',
    'Cuero y Curpiel Genuino',
    'Vinil Adhesivo Permanente (Cameo)',
    'Vinil Textil TÃ©rmico (Cameo)',
    'Papel y Cartulina Especial',
    'A convenir / Especial'
  ];

  const STANDARD_WOOD_VARNISHES = [
    'Barniz Natural Transparente',
    'Nogal Americano',
    'Verde Bosque RÃºstico',
    'Azul Colonial Vintage',
    'Caoba ClÃ¡sico',
    'Roble Claro NÃ³rdico'
  ];

  const STANDARD_PALETTE_COLORS = [
    'Blanco Marfil / Ãrtico',
    'Negro CarbÃ³n / Grafito',
    'Verde Olivo / Bosque',
    'Terracota / Ladrillo',
    'Arena / Crema / Beige',
    'Gris Espacial / Perla',
    'Dorado / Cobre Seda',
    'Textura Madera PLA',
    'Azul Cobalto',
    'Amarillo Mostaza',
    'Rojo Escarlata',
    'Rosa Pastel',
    'ðŸŽ¨ Otro color a elegir (A convenir)'
  ];

  const handleToggleMaterial = (mat) => {
    setEditorForm(prev => {
      const current = prev.specifications?.material || '';
      let parts = current.split('/').map(s => s.trim()).filter(Boolean);
      const key = mat.split(' ')[0].toLowerCase();
      const exists = parts.some(p => p.toLowerCase().includes(key));
      if (exists) {
        parts = parts.filter(p => !p.toLowerCase().includes(key));
      } else {
        parts.push(mat);
      }
      return {
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          material: parts.join(' / ')
        }
      };
    });
  };

  const getColorVariant = () => {
    if (!editorForm?.variants) return null;
    return editorForm.variants.find(v => 
      v?.name?.toLowerCase().includes('color') ||
      v?.name?.toLowerCase().includes('barniz') ||
      v?.name?.toLowerCase().includes('tono') ||
      v?.name?.toLowerCase().includes('madera') ||
      v?.name?.toLowerCase().includes('acabado') ||
      v?.name?.toLowerCase().includes('estructura') ||
      v?.name?.toLowerCase().includes('marco') ||
      v?.name?.toLowerCase().includes('base') ||
      v?.name?.toLowerCase().includes('acento')
    ) || null;
  };

  const handleToggleColorOption = (colorName, forcedVariantName = null) => {
    setEditorForm(prev => {
      const variants = [...(prev.variants || [])];
      let colorVar = variants.find(v => 
        v?.name?.toLowerCase().includes('color') ||
        v?.name?.toLowerCase().includes('barniz') ||
        v?.name?.toLowerCase().includes('tono') ||
        v?.name?.toLowerCase().includes('madera') ||
        v?.name?.toLowerCase().includes('acabado') ||
        v?.name?.toLowerCase().includes('estructura') ||
        v?.name?.toLowerCase().includes('marco') ||
        v?.name?.toLowerCase().includes('base') ||
        v?.name?.toLowerCase().includes('acento')
      );

      if (!colorVar) {
        const isWoodItem = (prev.techniques || []).includes('laser') || 
          ((prev.specifications?.material || '') + ' ' + (prev.name || '')).toLowerCase().includes('madera');
        colorVar = { name: forcedVariantName || (isWoodItem ? 'Tono de Barniz y Acabado' : 'Color'), options: [] };
        variants.push(colorVar);
      }

      const options = [...(colorVar.options || [])];
      const idx = options.findIndex(opt => opt.toLowerCase() === colorName.toLowerCase());
      if (idx >= 0) {
        options.splice(idx, 1);
      } else {
        options.push(colorName);
      }
      colorVar.options = options;

      return {
        ...prev,
        variants
      };
    });
  };

  const handleAddCustomColor = (color) => {
    const trimmed = (color || '').trim();
    if (!trimmed) return;
    handleToggleColorOption(trimmed);
    setCustomColorInput('');
  };

  const handleRemoveColorOption = (colorName) => {
    setEditorForm(prev => {
      const variants = [...(prev.variants || [])];
      const colorVar = variants.find(v => 
        v?.name?.toLowerCase().includes('color') ||
        v?.name?.toLowerCase().includes('estructura') ||
        v?.name?.toLowerCase().includes('marco') ||
        v?.name?.toLowerCase().includes('base') ||
        v?.name?.toLowerCase().includes('acento')
      );
      if (colorVar) {
        colorVar.options = (colorVar.options || []).filter(opt => opt !== colorName);
      }
      return { ...prev, variants };
    });
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();

    if (!editorForm?.name || !editorForm.name.trim()) {
      setEditorMessage({ text: 'Por favor ingresa el nombre del producto o paquete.', type: 'error' });
      return;
    }

    setEditorMessage({ text: 'Guardando...', type: 'info' });

    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...editorForm };

      // Limpiar includedItems si es paquete
      if (payload.isBundle && Array.isArray(payload.includedItems)) {
        payload.includedItems = payload.includedItems.filter(item => typeof item === 'string' && item.trim().length > 0);
      }
      
      // Sincronizar SKU estructurado y ficha tÃ©cnica de taller para personal interno
      const finalSku = payload.sku || payload.code || (isEdit ? editingProduct.code : 'HOG-3D-PLA-MAT-001');
      const parsed = parseSku(finalSku);
      payload.sku = finalSku;
      payload.code = payload.code || finalSku;
      payload.skuBreakdown = {
        standardSku: finalSku,
        legacyCode: payload.code,
        area: editorForm.skuArea || parsed.area?.code || (payload.isBundle ? 'PAQ' : 'HOG'),
        technique: editorForm.skuTechnique || parsed.tech?.code || '3D',
        material: editorForm.skuMaterial || parsed.mat?.code || 'PLA',
        finish: editorForm.skuFinish || parsed.fin?.code || 'MAT',
        sequence: editorForm.skuSequence || parsed.sequence || '001',
        instructionsForStaff: parsed.explanation
      };

      // Sync gallery slots
      const gal = [...(payload.gallery || [])];
      while (gal.length < 4) gal.push('');
      if (payload.primaryImage) gal[0] = payload.primaryImage;
      if (payload.whiteBgImage) gal[1] = payload.whiteBgImage;
      if (payload.detailImage) gal[2] = payload.detailImage;
      if (payload.measureImage) gal[3] = payload.measureImage;
      payload.gallery = gal;

      // Sync flash deal config timestamp if enabled (mÃ¡ximo 15% de descuento)
      if (payload.flashDealConfig) {
        payload.flashDealConfig.discountPercent = clampDiscountPercent(payload.flashDealConfig.discountPercent);
        if (payload.flashDealConfig.enabled) {
          payload.flashDealConfig.startedAt = payload.flashDealConfig.startedAt || Date.now();
          payload.flashDealConfig.expiresAt = Date.now() + (payload.flashDealConfig.durationMinutes || 120) * 60 * 1000;
        }
      }

      // Recalcular la receta completa antes de guardar para que el costo nunca quede desfasado.
      if (payload.manufacturingRecipe) {
        const summary = computeRecipeCost(payload.manufacturingRecipe, payload, rawMaterialsList, workshopParams);
        payload.manufacturingRecipe = applySummaryToRecipe(payload.manufacturingRecipe, summary);
        payload.costPrice = summary.totalCost;
        payload.costBreakdown = buildCostBreakdownFromSummary(summary, payload.manufacturingRecipe, payload.costBreakdown || {});
      }

      // Sincronizar repositorio, archivos 3D y tiempos de manufactura
      if (editorForm.repository) {
        payload.repository = editorForm.repository;
        payload.makerWorldModel = editorForm.repository.makerworldUrl || editorForm.makerWorldModel || '';
        payload.makerworldUrl = payload.makerWorldModel;
        payload.makerWorldAuthor = editorForm.repository.author || editorForm.makerWorldAuthor || '';
        payload.localPath = editorForm.repository.localPath || editorForm.localPath || '';
        payload.localFilesPath = payload.localPath;
      }
      if (editorForm.manufacturingTimes) {
        payload.manufacturingTimes = editorForm.manufacturingTimes;
        const totalMachineMins = (Number(editorForm.manufacturingTimes.machineHours) || 0) * 60 + (Number(editorForm.manufacturingTimes.machineMinutes) || 0);
        const postProcMins = Number(editorForm.manufacturingTimes.postProcessingMinutes) || 0;
        payload.manufacturingTimeMinutes = totalMachineMins;
        payload.postProcessingTimeMinutes = postProcMins;
        if (!payload.costBreakdown) payload.costBreakdown = {};
        payload.costBreakdown.machineHours = Number((totalMachineMins / 60).toFixed(2));
        payload.costBreakdown.manualWorkMin = postProcMins;
        if (payload.manufacturingRecipe) {
          payload.manufacturingRecipe.manufacturingTimeMinutes = totalMachineMins;
          payload.manufacturingRecipe.laborTimeMinutes = postProcMins;
        }
        if (!payload.specifications) payload.specifications = {};
        payload.specifications.estimatedLeadTime = editorForm.manufacturingTimes.leadTimeDays || payload.specifications.estimatedLeadTime || '2 a 4 dÃ­as hÃ¡biles';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.status === 401) {
        setEditorMessage({ text: 'Tu sesiÃ³n expirÃ³. Por favor cierra sesiÃ³n y vuelve a ingresar.', type: 'error' });
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setEditorMessage({ text: data.error || 'Error al guardar cambios', type: 'error' });
        return;
      }

      setEditorMessage({ text: 'Â¡Cambios guardados y sincronizados exitosamente!', type: 'success' });
      await loadAllData();
      if (onRefreshCatalog) onRefreshCatalog();
      setTimeout(() => setIsEditorOpen(false), 800);
    } catch (err) {
      console.error('Error saving product:', err);
      setEditorMessage({ text: 'Error de conexiÃ³n con el servidor de taller', type: 'error' });
    }
  };

  // Save Business Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const changes = [
      {
        icon: 'ðŸ¢',
        label: 'Datos de la Tienda y Contacto',
        detail: `Nombre: "${businessSettings?.businessName || 'Artesano Digital'}" Â· WhatsApp: ${businessSettings?.whatsappNumber || 'Sin configurar'}`
      },
      {
        icon: 'ðŸ“',
        label: 'UbicaciÃ³n y Entregas',
        detail: `${businessSettings?.address || 'DirecciÃ³n de taller registrada'}`
      },
      {
        icon: 'ðŸšš',
        label: 'Tarifas de EnvÃ­o',
        detail: `Local: $${businessSettings?.shipping?.localPrice || 0} MXN Â· Nacional: $${businessSettings?.shipping?.nationalPrice || 0} MXN Â· EnvÃ­o gratis desde: $${businessSettings?.shipping?.freeShippingMinOrder || 0} MXN`
      }
    ];

    setAdminConfirmModal({
      isOpen: true,
      title: 'Confirmar Ajustes del Negocio',
      subtitle: 'Â¿Deseas guardar las modificaciones en la informaciÃ³n de contacto y envÃ­os de la tienda?',
      badge: 'Ajustes Tienda',
      confirmText: 'SÃ­, Guardar Ajustes',
      changes,
      onConfirm: async () => {
        setAdminConfirmModal(prev => ({ ...prev, isOpen: false }));
        await executeSaveSettings();
      }
    });
  };

  const executeSaveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(businessSettings)
      });
      if (res.ok) {
        setServiceStatusMsg({ text: 'ConfiguraciÃ³n guardada exitosamente.', type: 'success' });
        setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 4000);
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Service Status (Local, National, Paused until date)
  const handleUpdateServiceStatus = async (partialStatus) => {
    const current = businessSettings?.serviceStatus || DEFAULT_SERVICE_STATUS;
    const updatedServiceStatus = { ...current, ...partialStatus };
    const updatedSettings = {
      ...businessSettings,
      serviceStatus: updatedServiceStatus
    };
    setBusinessSettings(updatedSettings);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setServiceStatusMsg({ text: 'Disponibilidad y estado de servicio actualizados', type: 'success' });
        setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 4000);
        if (onRefreshCatalog) onRefreshCatalog();
      } else {
        setServiceStatusMsg({ text: 'Error al guardar en el servidor', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating service status:', err);
      setServiceStatusMsg({ text: 'Error al conectar con el servidor', type: 'error' });
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ text: 'ContraseÃ±a cambiada con Ã©xito.', type: 'success' });
        setPasswordForm({ currentPassword: '', newPassword: '' });
      } else {
        setPasswordMsg({ text: data.error || 'Error al cambiar contraseÃ±a', type: 'error' });
      }
    } catch (err) {
      setPasswordMsg({ text: 'Error de servidor', type: 'error' });
    }
  };

  // Toggle Category Hidden
  const handleToggleCategory = async (cat) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isHidden: !cat.isHidden })
      });
      if (res.ok) {
        await loadAllData();
        if (onRefreshCatalog) onRefreshCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time stock counts grouped by Area (All 8 areas + Todas)
  const stockAreaStats = useMemo(() => {
    const getStats = (wKey) => {
      const list = wKey === 'all'
        ? products
        : wKey === 'paquetes'
          ? products.filter(p => p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes') || p.worlds?.includes('paquetes-servicios'))
          : (wKey === 'publicidad-desarrollo' || wKey === 'publicidad')
            ? products.filter(p => p.worlds && (p.worlds.includes('publicidad-desarrollo') || p.worlds.includes('publicidad')))
            : products.filter(p => p.worlds && p.worlds.includes(wKey));

      const inStock = list.filter(p => p.availability === 'in_stock');
      const madeToOrder = list.filter(p => p.availability === 'made_to_order' || !p.availability);
      const outOfStock = list.filter(p => p.availability === 'out_of_stock');
      const totalUnits = inStock.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0);

      return {
        total: list.length,
        inStock: inStock.length,
        madeToOrder: madeToOrder.length,
        outOfStock: outOfStock.length,
        totalUnits
      };
    };

    return {
      all: getStats('all'),
      hogar: getStats('hogar'),
      negocios: getStats('negocios'),
      juguetes: getStats('juguetes'),
      personalizados: getStats('personalizados'),
      eventos: getStats('eventos'),
      paquetes: getStats('paquetes'),
      industria: getStats('industria'),
      'publicidad-desarrollo': getStats('publicidad-desarrollo')
    };
  }, [products]);

  // Financial analysis (Excel Sheet 1 & Sheet 2 formulas)
  const marginsStats = useMemo(() => {
    const targetMargin = (Number(workshopParams.targetMarginPercent) || 40) / 100;
    const reservePct = (Number(workshopParams.reservePercent) || 10) / 100;

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalReserve = 0;
    let itemsCounted = 0;
    let optimalCount = 0;
    let lowMarginCount = 0;
    let lossCount = 0;
    let missingCostCount = 0;
    let quoteCount = 0;

    const rows = products.map(p => {
      const price = Number(p.price) || 0;
      const isQuote = p.priceType === 'quote' || price === 0;
      const hasCost = p.costPrice !== undefined && p.costPrice !== null && p.costPrice !== '';
      const cost = hasCost ? Number(p.costPrice) : 0;
      
      // Canal de Venta & Deducciones de Plataforma (Mercado Libre / Directo)
      let commission = 0;
      let fixedFee = 0;
      if (marginSalesChannel === 'mercadolibre') {
        commission = 0.16; // 16% promedio de comisiÃ³n ML por categorÃ­a
        fixedFee = price < 299 && price > 0 ? 25 : 0; // Cargo fijo por unidad en ventas < $299 MXN
      } else if (marginSalesChannel === 'custom') {
        commission = (Number(customCommission) || 0) / 100;
        fixedFee = Number(customFixedFee) || 0;
      }
      const platformFee = Math.round((price * commission + fixedFee) * 10) / 10;

      let profit = 0;
      let margin = 0;
      let markup = 0;
      let maxCost = 0;
      let targetPrice = 0;
      let reserve = 0;
      let available = 0;
      let statusLabel = '';
      let statusColor = '';

      if (isQuote) {
        statusLabel = 'A cotizar';
        statusColor = 'gray';
        quoteCount++;
      } else if (!hasCost) {
        statusLabel = 'Faltan costos';
        statusColor = 'blue';
        missingCostCount++;
        maxCost = Math.round(price * (1 - targetMargin) * 10) / 10;
      } else {
        profit = Math.round((price - platformFee - cost) * 10) / 10;
        margin = price > 0 ? (profit / price) : 0;
        markup = cost > 0 ? (profit / cost) : 0;
        maxCost = Math.round((price * (1 - commission - targetMargin) - fixedFee) * 10) / 10;
        targetPrice = (1 - commission - targetMargin) > 0 
          ? Math.round(((cost + fixedFee) / (1 - commission - targetMargin)) * 10) / 10 
          : 0;
        reserve = profit > 0 ? Math.round((profit * reservePct) * 10) / 10 : 0;
        available = Math.round((profit - reserve) * 10) / 10;

        totalRevenue += price;
        totalCost += cost;
        totalProfit += profit;
        totalReserve += reserve;
        itemsCounted++;

        if (profit < 0) {
          statusLabel = 'En pÃ©rdida';
          statusColor = 'rose';
          lossCount++;
        } else if (margin < targetMargin) {
          statusLabel = 'Bajo objetivo (<40%)';
          statusColor = 'amber';
          lowMarginCount++;
        } else {
          statusLabel = 'Margen Ã³ptimo (â‰¥40%)';
          statusColor = 'emerald';
          optimalCount++;
        }
      }

      return {
        product: p,
        price,
        isQuote,
        cost,
        hasCost,
        commission,
        fixedFee,
        platformFee,
        profit,
        marginPct: Math.round(margin * 1000) / 10,
        markupPct: Math.round(markup * 1000) / 10,
        maxCost,
        targetPrice,
        reserve,
        available,
        statusLabel,
        statusColor
      };
    });

    const avgMargin = itemsCounted > 0 && totalRevenue > 0 
      ? Math.round((totalProfit / totalRevenue) * 1000) / 10 
      : 0;

    return {
      rows,
      totalRevenue: Math.round(totalRevenue * 10) / 10,
      totalCost: Math.round(totalCost * 10) / 10,
      totalProfit: Math.round(totalProfit * 10) / 10,
      totalReserve: Math.round(totalReserve * 10) / 10,
      totalAvailable: Math.round((totalProfit - totalReserve) * 10) / 10,
      avgMargin,
      optimalCount,
      lowMarginCount,
      lossCount,
      missingCostCount,
      quoteCount
    };
  }, [products, workshopParams, marginSalesChannel, customCommission, customFixedFee]);

  // Technique List & Definitions for Filtering and Audits
  const techniqueList = [
    { id: 'all', label: 'Todas las TÃ©cnicas', shortLabel: 'Todas', icon: 'âš¡' },
    { id: '3d', label: 'ImpresiÃ³n 3D', shortLabel: '3D (PLA/TPU)', icon: 'ðŸ–¨ï¸' },
    { id: 'laser', label: 'Corte & Grabado LÃ¡ser', shortLabel: 'LÃ¡ser', icon: 'ðŸ”¥' },
    { id: 'sublimation', label: 'SublimaciÃ³n', shortLabel: 'SublimaciÃ³n', icon: 'ðŸŽ¨' },
    { id: 'print', label: 'Impresi\u00f3n L\u00e1ser / Tinta', shortLabel: 'Impresi\u00f3n', icon: '\u{1F5A8}\uFE0F' },
    { id: 'vinyl', label: 'Corte de Vinil', shortLabel: 'Vinil', icon: 'âœ‚ï¸' },
    { id: 'nfc', label: 'Enlace NFC / Smart', shortLabel: 'NFC', icon: 'ðŸ“¡' }
  ];

  // Helper: Match product with selected technique
  const checkProductMatchesTechnique = (p, tech) => {
    if (!tech || tech === 'all') return true;
    const list = p?.techniques || [];
    if (tech === '3d') return list.includes('3d');
    if (tech === 'laser') return list.includes('laser');
    if (tech === 'sublimation') return list.includes('sublimation') || list.includes('sublimacion');
    if (tech === 'vinyl') return list.includes('vinyl') || list.includes('vinil');
    if (tech === 'print') return list.includes('print') || list.includes('impresion_laser');
    if (tech === 'nfc') return list.includes('nfc');
    return list.includes(tech);
  };

  // Real-time product counts by technique
  const techniqueCounts = useMemo(() => {
    const counts = { all: products.length, '3d': 0, laser: 0, sublimation: 0, vinyl: 0, print: 0, nfc: 0 };
    products.forEach(p => {
      const t = p.techniques || [];
      if (t.includes('3d')) counts['3d']++;
      if (t.includes('laser')) counts.laser++;
      if (t.includes('sublimation') || t.includes('sublimacion')) counts.sublimation++;
      if (t.includes('vinyl') || t.includes('vinil')) counts.vinyl++;
      if (t.includes('print') || t.includes('impresion_laser')) counts.print++;
      if (t.includes('nfc')) counts.nfc++;
    });
    return counts;
  }, [products]);

  // Filtered & Sorted Products for Table and Grid
  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      if (filterWorld === 'paquetes') {
        const isBundleOrService = p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes') || p.worlds?.includes('paquetes-servicios');
        if (!isBundleOrService) return false;
      } else if (filterWorld === 'publicidad-desarrollo' || filterWorld === 'publicidad') {
        const isPub = p.worlds && (p.worlds.includes('publicidad-desarrollo') || p.worlds.includes('publicidad'));
        if (!isPub) return false;
      } else if (filterWorld !== 'all' && (!p.worlds || !p.worlds.includes(filterWorld))) {
        return false;
      }
      if (filterTechnique !== 'all' && !checkProductMatchesTechnique(p, filterTechnique)) {
        return false;
      }
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterStock === 'in_stock' && p.availability !== 'in_stock') return false;
      if (filterStock === 'made_to_order' && p.availability === 'in_stock') return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCode = p.code?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        return matchName || matchCode || matchSku;
      }
      return true;
    });

    const getProductTime = (p) => {
      if (p.createdAt) {
        const t = new Date(p.createdAt).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
      if (p.updatedAt) {
        const t = new Date(p.updatedAt).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
      // DetecciÃ³n automÃ¡tica por prefijo de adiciÃ³n de catÃ¡logo
      if (p.code && p.code.startsWith('CUST-DIBUJO')) {
        return new Date('2026-10-24T19:35:00Z').getTime();
      }
      if (p.code && p.code.startsWith('IND')) {
        return new Date('2026-10-24T12:00:00Z').getTime();
      }
      if (p.code && p.code.startsWith('J')) {
        return new Date('2026-10-24T12:00:00Z').getTime();
      }
      if (p.code && p.code.startsWith('CUST-FUNKO-')) {
        return new Date('2026-10-24T15:00:00Z').getTime();
      }
      const idx = products.indexOf(p);
      return idx >= 0 ? (new Date('2026-10-14T00:00:00Z').getTime() + idx * 60000) : 0;
    };

    return list.sort((a, b) => {
      if (productSort === 'newest') {
        return getProductTime(b) - getProductTime(a);
      }
      if (productSort === 'oldest') {
        return getProductTime(a) - getProductTime(b);
      }
      if (productSort === 'sku_asc') {
        return (a.sku || a.code || '').localeCompare(b.sku || b.code || '');
      }
      if (productSort === 'sku_desc') {
        return (b.sku || b.code || '').localeCompare(a.sku || a.code || '');
      }
      if (productSort === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (productSort === 'price_desc') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      if (productSort === 'price_asc') {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      return getProductTime(b) - getProductTime(a);
    });
  }, [products, filterWorld, filterTechnique, filterStatus, filterStock, productSearch, productSort]);

  // Filtered Margins Rows for Margins Tab
  const filteredMarginsRows = useMemo(() => {
    return marginsStats.rows.filter(item => {
      const p = item.product;
      if (marginsWorld === 'paquetes') {
        const isBundleOrService = p.isBundle || p.category === 'paquetes' || p.category === 'servicios' || p.code?.startsWith('PROMO') || p.code?.includes('PATCH') || p.worlds?.includes('paquetes') || p.worlds?.includes('paquetes-servicios');
        if (!isBundleOrService) return false;
      } else if (marginsWorld === 'publicidad-desarrollo' || marginsWorld === 'publicidad') {
        const isPub = p.worlds && (p.worlds.includes('publicidad-desarrollo') || p.worlds.includes('publicidad'));
        if (!isPub) return false;
      } else if (marginsWorld !== 'all' && (!p.worlds || !p.worlds.includes(marginsWorld))) {
        return false;
      }
      if (marginsTechnique !== 'all' && !checkProductMatchesTechnique(p, marginsTechnique)) {
        return false;
      }
      if (marginsStatus === 'optimal' && item.statusColor !== 'emerald') return false;
      if (marginsStatus === 'low' && item.statusColor !== 'amber') return false;
      if (marginsStatus === 'loss' && item.statusColor !== 'rose') return false;
      if (marginsStatus === 'missing' && (item.hasCost || item.isQuote)) return false;
      if (marginsSearch.trim()) {
        const q = marginsSearch.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCode = p.code?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        return matchName || matchCode || matchSku;
      }
      return true;
    });
  }, [marginsStats.rows, marginsWorld, marginsTechnique, marginsStatus, marginsSearch]);

  // Dynamic Margins Financial Summary for the active filters (Area + Technique + Search)
  const activeMarginsSummary = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;
    let reserve = 0;
    let itemsCounted = 0;
    let optimalCount = 0;
    let lowMarginCount = 0;
    let lossCount = 0;
    let missingCostCount = 0;
    let quoteCount = 0;

    filteredMarginsRows.forEach(item => {
      if (item.isQuote) {
        quoteCount++;
        return;
      }
      if (!item.hasCost) {
        missingCostCount++;
        return;
      }

      revenue += item.price;
      cost += item.cost;
      profit += item.profit;
      reserve += item.reserve;
      itemsCounted++;

      if (item.profit < 0) {
        lossCount++;
      } else if (item.statusColor === 'amber') {
        lowMarginCount++;
      } else if (item.statusColor === 'emerald') {
        optimalCount++;
      }
    });

    const avgMargin = itemsCounted > 0 && revenue > 0
      ? Math.round((profit / revenue) * 1000) / 10
      : 0;

    return {
      revenue: Math.round(revenue * 10) / 10,
      cost: Math.round(cost * 10) / 10,
      profit: Math.round(profit * 10) / 10,
      reserve: Math.round(reserve * 10) / 10,
      available: Math.round((profit - reserve) * 10) / 10,
      avgMargin,
      optimalCount,
      lowMarginCount,
      lossCount,
      missingCostCount,
      quoteCount,
      totalItems: filteredMarginsRows.length
    };
  }, [filteredMarginsRows]);

  // Technique Overview for Categories Tab ("CuÃ¡nto estoy haciendo de cada cosa")
  const techniqueOverview = useMemo(() => {
    const map = {
      '3d': { id: '3d', label: 'ImpresiÃ³n 3D', shortLabel: '3D', icon: 'ðŸ–¨ï¸', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'emerald' },
      laser: { id: 'laser', label: 'Corte & Grabado LÃ¡ser', shortLabel: 'LÃ¡ser', icon: 'ðŸ”¥', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'amber' },
      sublimation: { id: 'sublimation', label: 'SublimaciÃ³n', shortLabel: 'SublimaciÃ³n', icon: 'ðŸŽ¨', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'blue' },
      print: { id: 'print', label: 'Impresi\u00f3n L\u00e1ser / Tinta', shortLabel: 'Impresi\u00f3n', icon: '\u{1F5A8}\uFE0F', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'cyan' },
      vinyl: { id: 'vinyl', label: 'Corte de Vinil', shortLabel: 'Vinil', icon: 'âœ‚ï¸', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'purple' },
      nfc: { id: 'nfc', label: 'Enlace NFC / Smart', shortLabel: 'NFC', icon: 'ðŸ“¡', count: 0, catalogValue: 0, categoriesCount: new Set(), color: 'rose' }
    };

    products.forEach(p => {
      const price = typeof p.price === 'number' ? p.price : 0;
      const cIds = p.categories || (p.category ? [p.category] : []);
      const t = p.techniques || [];

      if (t.includes('3d')) {
        map['3d'].count++;
        map['3d'].catalogValue += price;
        cIds.forEach(cid => map['3d'].categoriesCount.add(cid));
      }
      if (t.includes('laser')) {
        map.laser.count++;
        map.laser.catalogValue += price;
        cIds.forEach(cid => map.laser.categoriesCount.add(cid));
      }
      if (t.includes('sublimation') || t.includes('sublimacion')) {
        map.sublimation.count++;
        map.sublimation.catalogValue += price;
        cIds.forEach(cid => map.sublimation.categoriesCount.add(cid));
      }
      if (t.includes('vinyl') || t.includes('vinil')) {
        map.vinyl.count++;
        map.vinyl.catalogValue += price;
        cIds.forEach(cid => map.vinyl.categoriesCount.add(cid));
      }
      if (t.includes('print') || t.includes('impresion_laser')) {
        map.print.count++;
        map.print.catalogValue += price;
        cIds.forEach(cid => map.print.categoriesCount.add(cid));
      }
      if (t.includes('nfc')) {
        map.nfc.count++;
        map.nfc.catalogValue += price;
        cIds.forEach(cid => map.nfc.categoriesCount.add(cid));
      }
    });

    return Object.values(map).map(item => ({
      ...item,
      categoriesCount: item.categoriesCount.size,
      percentOfCatalog: products.length > 0 ? Math.round((item.count / products.length) * 100) : 0
    }));
  }, [products]);

  // Enriched Categories with Per-Technique Counts & Financial Value
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const categoryProducts = products.filter(p => {
        const cIds = p.categories || (p.category ? [p.category] : []);
        return cIds.includes(cat.id);
      });

      const techCounts = {
        '3d': 0,
        laser: 0,
        sublimation: 0,
        vinyl: 0,
        print: 0,
        nfc: 0
      };

      let categoryTotalValue = 0;
      categoryProducts.forEach(p => {
        categoryTotalValue += (typeof p.price === 'number' ? p.price : 0);
        const t = p.techniques || [];
        if (t.includes('3d')) techCounts['3d']++;
        if (t.includes('laser')) techCounts.laser++;
        if (t.includes('sublimation') || t.includes('sublimacion')) techCounts.sublimation++;
        if (t.includes('vinyl') || t.includes('vinil')) techCounts.vinyl++;
        if (t.includes('print') || t.includes('impresion_laser')) techCounts.print++;
        if (t.includes('nfc')) techCounts.nfc++;
      });

      const matchingProducts = categoryTechnique === 'all'
        ? categoryProducts
        : categoryProducts.filter(p => checkProductMatchesTechnique(p, categoryTechnique));

      let matchingValue = 0;
      matchingProducts.forEach(p => {
        matchingValue += (typeof p.price === 'number' ? p.price : 0);
      });

      return {
        ...cat,
        actualProductCount: categoryProducts.length,
        matchingProductCount: matchingProducts.length,
        techCounts,
        categoryTotalValue,
        matchingValue
      };
    });
  }, [categories, products, categoryTechnique]);

  // Filtered Categories based on World, Technique, and Search
  const filteredCategories = useMemo(() => {
    return enrichedCategories.filter(cat => {
      if (categoryWorld !== 'all' && cat.worldId !== categoryWorld) {
        return false;
      }
      if (categoryTechnique !== 'all' && cat.matchingProductCount === 0) {
        return false;
      }
      if (categorySearch.trim()) {
        const q = categorySearch.toLowerCase();
        const matchName = cat.name?.toLowerCase().includes(q);
        const matchId = cat.id?.toLowerCase().includes(q);
        return matchName || matchId;
      }
      return true;
    });
  }, [enrichedCategories, categoryWorld, categoryTechnique, categorySearch]);

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div
          className="w-full max-w-[97vw] 2xl:max-w-7xl h-full sm:h-[95vh] bg-[#FBF9F5] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-[#E8E4DA]"
          onClick={e => e.stopPropagation()}
        >
        
        {/* Top Header */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-white/10 text-emerald-400 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold font-heading flex items-center gap-1.5 sm:gap-2">
                <span className="truncate">Panel Privado Artesano</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 sm:px-2 py-0.2 rounded-full border border-emerald-700 shrink-0">
                  Activo
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 truncate">
                {currentUser ? `${currentUser.name} (${currentUser.username})` : 'Acceso Restringido'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-900/60 text-gray-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Cerrar sesiÃ³n"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar sesiÃ³n</span>
              </button>
            )}
            <button
              onClick={handleRequestCloseAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Salir a la Tienda"
              title="Salir a la Tienda"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs">Salir a la Tienda</span>
            </button>
          </div>
        </div>

        {/* Not Logged In Screen */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E8E4DA] shadow-xl space-y-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center pb-2">
                  <BrandLogo showTagline={true} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D4F3E]/10 text-[#2D4F3E] text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso de AdministraciÃ³n</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#1F2421] font-heading">
                  Iniciar SesiÃ³n de Administrador
                </h3>
                <p className="text-xs text-gray-500">
                  Ingresa las credenciales autorizadas para gestionar el catÃ¡logo, precios y fotos.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="admin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                    ContraseÃ±a
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#2D4F3E] focus:outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#2D4F3E] text-white text-sm font-bold hover:bg-[#20392C] active:scale-98 transition-all shadow-md disabled:opacity-60"
                >
                  {loginLoading ? 'Verificando...' : 'Acceder al Panel'}
                </button>
              </form>

              <div className="text-[11px] text-gray-500 text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                Acceso exclusivo para la administraciÃ³n de Artesano Digital.
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard & Tabs */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0 min-h-0">
            
            {/* NavegaciÃ³n MÃ³vil TÃ¡ctil Dedicada: selector superior segmentado con sub-chips (Estilo FiltersBar) */}
            <div className="md:hidden bg-white border-b border-[#E8E4DA] p-2.5 shrink-0 shadow-2xs space-y-2">
              {/* Selector de Pilares Principales: 4 Secciones Limpias */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-[#F4F0E8] rounded-xl border border-[#E8E4DA]">
                {[
                  { id: 'catalog', label: 'CatÃ¡logo', icon: 'ðŸ“¦' },
                  { id: 'workshop', label: 'Taller', icon: 'ðŸ§±' },
                  { id: 'sales', label: 'Ventas', icon: 'âš¡' },
                  { id: 'business', label: 'Negocio', icon: 'âš™ï¸' }
                ].map(group => {
                  const isCurrent = mobileNavGroup === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setMobileNavGroup(group.id);
                        if (group.id === 'catalog' && !['products', 'packages', 'categories', 'area-banners'].includes(activeTab)) {
                          setActiveTab('products');
                        } else if (group.id === 'workshop' && !['raw-materials', 'margins'].includes(activeTab)) {
                          setActiveTab('raw-materials');
                        } else if (group.id === 'sales' && !['flash-deals', 'campaigns', 'coupons', 'sales', 'catalog-mobile'].includes(activeTab)) {
                          setActiveTab('flash-deals');
                        } else if (group.id === 'business' && !['stats', 'settings', 'arcade'].includes(activeTab)) {
                          setActiveTab('stats');
                        }
                      }}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#2D4F3E] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xs">{group.icon}</span>
                      <span className="truncate">{group.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-chips tÃ¡ctiles para la secciÃ³n activa (limpio, scroll suave horizontal) */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar">
                {(
                  mobileNavGroup === 'catalog' ? [
                    { id: 'products', label: 'Productos & SKUs', icon: 'ðŸ“¦', count: products.length },
                    { id: 'packages', label: 'Paquetes & Kits', icon: 'ðŸŽ', count: products.filter(p => p.isBundle).length },
                    { id: 'categories', label: 'CategorÃ­as', icon: 'ðŸ“', count: categories.length },
                    { id: 'area-banners', label: 'Banners de Ãreas', icon: 'ðŸ–¼ï¸', count: 3 }
                  ] : mobileNavGroup === 'workshop' ? [
                    { id: 'margins', label: 'Costos & MÃ¡rgenes', icon: 'ðŸ“ˆ', count: `${marginsStats.avgMargin}%` },
                    { id: 'raw-materials-inventory', label: 'Stock & Insumos', icon: 'ðŸ§±' },
                    { id: 'raw-materials-costs', label: 'Costos Operativos', icon: 'âš™ï¸' },
                    { id: 'raw-materials-pricing', label: 'Tablas de Precios', icon: 'ðŸ“Š' },
                    { id: 'raw-materials-suppliers', label: 'Proveedores & Fletes', icon: 'ðŸ¢' }
                  ] : mobileNavGroup === 'sales' ? [
                    { id: 'flash-deals', label: 'Ofertas Flash', icon: 'âš¡', count: activeFlashList.length },
                    { id: 'campaigns', label: 'Temporadas', icon: 'âœ¨' },
                    { id: 'coupons', label: 'Cupones', icon: 'ðŸŽŸï¸' },
                    { id: 'sales', label: 'Ventas & ROI', icon: 'ðŸ“¢' },
                    { id: 'catalog-mobile', label: 'CatÃ¡logos PDF', icon: 'ðŸ“±' }
                  ] : [
                    { id: 'stats', label: 'MÃ©tricas', icon: 'ðŸ“Š' },
                    { id: 'settings', label: 'Ajustes & Taller', icon: 'âš™ï¸' },
                    { id: 'arcade', label: 'Arcade', icon: 'ðŸŽ®' }
                  ]
                ).map(item => {
                  const isCurrent = (item.id === 'raw-materials-inventory' && activeTab === 'raw-materials' && rawMaterialsSubTab === 'inventory')
                    || (item.id === 'raw-materials-costs' && activeTab === 'raw-materials' && rawMaterialsSubTab === 'operational_costs')
                    || (item.id === 'raw-materials-pricing' && activeTab === 'raw-materials' && rawMaterialsSubTab === 'pricing_table')
                    || (item.id === 'raw-materials-suppliers' && activeTab === 'raw-materials' && rawMaterialsSubTab === 'suppliers')
                    || (activeTab === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.id === 'raw-materials-inventory') {
                          setRawMaterialsSubTab('inventory');
                          setActiveTab('raw-materials');
                        } else if (item.id === 'raw-materials-costs') {
                          setRawMaterialsSubTab('operational_costs');
                          setActiveTab('raw-materials');
                        } else if (item.id === 'raw-materials-pricing') {
                          setRawMaterialsSubTab('pricing_table');
                          setActiveTab('raw-materials');
                        } else if (item.id === 'raw-materials-suppliers') {
                          setRawMaterialsSubTab('suppliers');
                          setActiveTab('raw-materials');
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#2D4F3E] text-white shadow-xs'
                          : 'bg-[#F4F0E8] text-gray-700 hover:bg-[#EBE5D9]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {item.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-white text-gray-700 border border-gray-200'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Navigation para Escritorio: DiseÃ±o Moderno y Limpio estilo Studio */}
            <aside className="hidden md:flex md:w-64 bg-white border-r border-[#E8E4DA] p-3 flex-col justify-between shrink-0 overflow-y-auto scrollbar-thin">
              <div className="space-y-4">
                {/* Cabecera del Taller */}
                <div className="p-3 rounded-2xl bg-[#F7F5EE] border border-[#E8E4DA] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2D4F3E] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      AD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1F2421]">Artesano Digital</div>
                      <div className="text-[10px] text-gray-500 font-medium">Panel de Taller</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    En LÃ­nea
                  </span>
                </div>

                <nav className="flex flex-col gap-3 w-full">
                  {/* GRUPO 1: CATÃLOGO & PRODUCTOS */}
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      CatÃ¡logo &amp; Productos
                    </div>

                    <button
                      onClick={() => setActiveTab('products')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'products' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Productos &amp; SKUs</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {products.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('packages')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'packages' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#D4A359]" />
                        <span>Paquetes &amp; Combos</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'packages' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {products.filter(p => p.isBundle).length} kits
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('categories')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'categories' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4" />
                        <span>CategorÃ­as</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {categories.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('area-banners')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'area-banners' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Banners de Ãreas</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'area-banners' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        3 Ãreas
                      </span>
                    </button>
                  </div>

                  {/* GRUPO 2: TALLER & MANUFACTURA */}
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Taller &amp; Manufactura
                    </div>

                    <button
                      onClick={() => setActiveTab('margins')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'margins' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>Costos &amp; MÃ¡rgenes</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'margins' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {marginsStats.avgMargin}%
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setRawMaterialsSubTab('inventory');
                        setActiveTab('raw-materials');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'inventory' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Stock &amp; Insumos</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {rawMaterialsList.length} mats
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setRawMaterialsSubTab('operational_costs');
                        setActiveTab('raw-materials');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'operational_costs' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-amber-600" />
                        <span>Costos Operativos</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'operational_costs' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
                      }`}>
                        CFE &amp; Hrs
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setRawMaterialsSubTab('pricing_table');
                        setActiveTab('raw-materials');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'pricing_table' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                        <span>Tablas de Precios</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'pricing_table' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                      }`}>
                        Listas
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setRawMaterialsSubTab('suppliers');
                        setActiveTab('raw-materials');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'suppliers' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-600" />
                        <span>Proveedores &amp; Fletes</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'raw-materials' && rawMaterialsSubTab === 'suppliers' ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700'
                      }`}>
                        {new Set(rawMaterialsList.map(m => m.supplier).filter(Boolean)).size} prov
                      </span>
                    </button>
                  </div>

                  {/* GRUPO 3: VENTAS & PROMOCIONES */}
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Ventas &amp; Promociones
                    </div>

                    <button
                      onClick={() => setActiveTab('flash-deals')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'flash-deals' ? 'bg-[#9E472A] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#9E472A] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${activeTab === 'flash-deals' ? 'text-white fill-white' : 'text-[#9E472A] fill-[#9E472A]'}`} />
                        <span>Ofertas Flash &amp; Cupos</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'flash-deals' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {activeFlashList.length} activas
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'campaigns' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Temporadas &amp; Eventos</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'campaigns' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'
                      }`}>
                        Especial
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('coupons')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'coupons' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Cupones de Descuento</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'coupons' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        ðŸŽŸï¸ Cupones
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('sales')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'sales' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        <span>Ventas &amp; ROI</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'sales' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        ROI
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('catalog-mobile')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'catalog-mobile' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>CatÃ¡logos MÃ³viles PDF</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'catalog-mobile'
                          ? 'bg-white/20 text-white'
                          : (businessSettings?.mobileCatalogConfig?.enabled !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200')
                      }`}>
                        {businessSettings?.mobileCatalogConfig?.enabled !== false ? 'Activo' : 'Oculto'}
                      </span>
                    </button>
                  </div>

                  {/* GRUPO 4: NEGOCIO & CONTROL */}
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Negocio &amp; Control
                    </div>

                    <button
                      onClick={() => setActiveTab('stats')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'stats' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>MÃ©tricas &amp; TrÃ¡fico</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'settings' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Datos del Taller</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${
                        activeTab === 'settings' ? 'bg-white/20 text-white border-white/20' : serviceSummary.color
                      }`}>
                        {serviceSummary.badge}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('arcade')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        activeTab === 'arcade' ? 'bg-[#2D4F3E] text-white shadow-xs font-bold' : 'text-gray-700 hover:bg-[#F4F0E8] hover:text-[#2D4F3E] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-amber-500" />
                        <span>Arcade FidelizaciÃ³n</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeTab === 'arcade' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        10 Juegos
                      </span>
                    </button>
                  </div>
                </nav>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F5EE] border border-[#E8E4DA] text-[11px] text-gray-600 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-[#2D4F3E]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SincronizaciÃ³n activa</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                  Los cambios se guardan y reflejan inmediatamente en la tienda.
                </p>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-6">
              
              {/* TAB: CATÃLOGO MÃ“VIL & ARCHIVO DE DESCARGAS */}
              {activeTab === 'catalog-mobile' && (
                <MobileCatalogAdminSection
                  token={token}
                  businessSettings={businessSettings}
                  onUpdateSettings={(updated) => setBusinessSettings(updated)}
                  onRefreshCatalog={onRefreshCatalog}
                />
              )}

              {/* TAB: VENTAS Y PUBLICACIONES */}
              {activeTab === 'sales' && (
                <SalesMarketingSection
                  token={token}
                  products={products}
                  settings={businessSettings}
                  onRefreshCatalog={onRefreshCatalog}
                />
              )}

              {/* TAB: MATERIAS PRIMAS DEL TALLER & COSTOS OPERATIVOS */}
              {activeTab === 'raw-materials' && (
                <RawMaterialsSection
                  token={token}
                  products={products}
                  workshopParams={workshopParams}
                  businessSettings={businessSettings}
                  onSaveWorkshopParams={(updated) => {
                    setWorkshopParams(updated);
                    loadAllData();
                  }}
                  onRefreshCatalog={onRefreshCatalog}
                  initialSubTab={rawMaterialsSubTab}
                  onSubTabChange={setRawMaterialsSubTab}
                  initialMaterials={rawMaterialsList}
                />
              )}

              {/* TAB: OFERTAS FLASH & CUPOS POR ÃREA */}
              {activeTab === 'flash-deals' && (
                <FlashDealsControlSection
                  products={products}
                  settings={businessSettings}
                  flashDeal={flashDeal}
                  token={token}
                  onRefreshCatalog={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                  onEditProduct={handleOpenEditProduct}
                />
              )}

              {/* TAB: TEMPORADAS, EFECTOS & EVENTOS */}
              {activeTab === 'campaigns' && (
                <CampaignsAdminSection
                  token={token}
                  products={products}
                  onEditProduct={handleOpenEditProduct}
                  onOpenCreateProduct={handleOpenNewProduct}
                  onRefreshCatalog={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                />
              )}

              {/* TAB: ARCADE DEL TALLER & MINI-JUEGOS (MÃ“DULO INDEPENDIENTE) */}
              {activeTab === 'arcade' && (
                <ArcadeAdminSection token={token} />
              )}

              {/* TAB: BANNERS DE ÃREAS (HOGAR, NEGOCIOS, EVENTOS) Y TARJETAS DE SELECCIÃ“N */}
              {activeTab === 'area-banners' && (
                <AreaBannersAdminSection
                  token={token}
                  businessSettings={businessSettings}
                  onUpdateSettings={(updated) => setBusinessSettings(updated)}
                  onWorldsUpdated={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                />
              )}

              {/* TAB: PAQUETES & COMBOS DE TALLER */}
              {activeTab === 'packages' && (
                <PackagesAdminSection
                  token={token}
                  products={products}
                  onEditProduct={handleOpenEditProduct}
                  onOpenCreateProduct={handleOpenNewProduct}
                  onRefreshCatalog={async () => {
                    await loadAllData();
                    if (onRefreshCatalog) onRefreshCatalog();
                  }}
                />
              )}

              {/* TAB: CUPONES & CÃ“DIGOS DE DESCUENTO (ARCADE & TIENDA) */}
              {activeTab === 'coupons' && (
                <CouponsAdminSection token={token} />
              )}

              {/* TAB 1: PRODUCTOS */}
              {/* TAB 1: PRODUCTOS CON DIVISIÃ“N POR ÃREAS Y SWITCH DE STOCK */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* BARRA DE ÃREAS Y AUDITORÃA: DISEÃ‘O LIMPIO ESTILO CATÃLOGO */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#2D4F3E]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-heading">
                          Ãreas del CatÃ¡logo
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          8 Ã¡reas oficiales
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {filterWorld === 'all' ? `Mostrando ${products.length} productos en total` : `${stockAreaStats[filterWorld]?.total || 0} piezas en esta Ã¡rea`}
                      </span>
                    </div>

                    {/* Selector de Ãreas: Pills limpios y espaciados sin amontonar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-stone-300 no-scrollbar">
                      {[
                        { id: 'all', label: 'Todas las Ãreas', icon: 'ðŸŒ', stats: stockAreaStats.all },
                        { id: 'hogar', label: 'Hogar', icon: 'ðŸ ', stats: stockAreaStats.hogar },
                        { id: 'negocios', label: 'Negocios', icon: 'ðŸ’¼', stats: stockAreaStats.negocios },
                        { id: 'juguetes', label: 'Juguetes', icon: 'ðŸ§¸', stats: stockAreaStats.juguetes },
                        { id: 'personalizados', label: 'Personalizados', icon: 'âœ¨', stats: stockAreaStats.personalizados },
                        { id: 'eventos', label: 'Eventos', icon: 'ðŸŽ‰', stats: stockAreaStats.eventos },
                        { id: 'paquetes', label: 'Paquetes', icon: 'ðŸŽ', stats: stockAreaStats.paquetes },
                        { id: 'industria', label: 'Industria', icon: 'âš™ï¸', stats: stockAreaStats.industria },
                        { id: 'publicidad-desarrollo', label: 'Publicidad', icon: 'ðŸŽ¨', stats: stockAreaStats['publicidad-desarrollo'] }
                      ].map(area => {
                        const isSelected = filterWorld === area.id;
                        const stats = area.stats || { total: 0, inStock: 0, madeToOrder: 0 };
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => setFilterWorld(area.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                              isSelected
                                ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-sm'
                                : 'bg-[#FAF9F5] text-gray-700 border-[#E8E4DA] hover:bg-[#F4F0E8] hover:border-gray-300'
                            }`}
                          >
                            <span>{area.icon}</span>
                            <span>{area.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-700 border border-gray-200 shadow-2xs'
                            }`}>
                              {stats.total}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Resumen Compacto de Stock en una Tira Horizontal Limpia */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase text-emerald-800 leading-tight">En Existencia</div>
                          <div className="text-xs font-black text-emerald-950 font-mono">
                            {stockAreaStats[filterWorld]?.inStock || 0} modelos
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/70 border border-blue-200/60">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase text-blue-800 leading-tight">Bajo Pedido</div>
                          <div className="text-xs font-black text-blue-950 font-mono">
                            {stockAreaStats[filterWorld]?.madeToOrder || 0} modelos
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0"></span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase text-gray-600 leading-tight">Agotados / Pausados</div>
                          <div className="text-xs font-black text-gray-800 font-mono">
                            {stockAreaStats[filterWorld]?.outOfStock || 0} modelos
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F4F0E8] border border-[#E8E4DA]">
                        <Package className="w-3.5 h-3.5 text-[#2D4F3E] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase text-[#2D4F3E] leading-tight">Bodega Taller</div>
                          <div className="text-xs font-black text-[#1F2421] font-mono">
                            {stockAreaStats[filterWorld]?.totalUnits || 0} pzs fÃ­sicas
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE FILTROS Y ACCIÃ“N */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8E4DA]">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar cÃ³digo o nombre..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>

                      {/* Technique / Service filter */}
                      <select
                        value={filterTechnique}
                        onChange={e => setFilterTechnique(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white font-medium"
                      >
                        <option value="all">âš¡ Todas las tÃ©cnicas</option>
                        <option value="3d">ðŸ–¨ï¸ ImpresiÃ³n 3D ({techniqueCounts['3d'] || 0})</option>
                        <option value="laser">ðŸ”¥ Corte & Grabado LÃ¡ser ({techniqueCounts.laser || 0})</option>
                        <option value="sublimation">ðŸŽ¨ SublimaciÃ³n ({techniqueCounts.sublimation || 0})</option>
                        <option value="print">{'\u{1F5A8}\uFE0F Impresi\u00f3n L\u00e1ser / Tinta'} ({techniqueCounts.print || 0})</option>
                        <option value="vinyl">âœ‚ï¸ Corte de Vinil ({techniqueCounts.vinyl || 0})</option>
                        <option value="nfc">ðŸ“¡ Enlace NFC ({techniqueCounts.nfc || 0})</option>
                      </select>

                      {/* Stock filter */}
                      <select
                        value={filterStock}
                        onChange={e => setFilterStock(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="all">Todas las existencias</option>
                        <option value="in_stock">âœ“ Solo en existencia</option>
                        <option value="made_to_order">â³ Solo bajo pedido</option>
                      </select>

                      {/* Status filter */}
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="all">Todos los Estados</option>
                        <option value="published">Publicados</option>
                        <option value="draft">Borradores</option>
                        <option value="archived">Archivados</option>
                      </select>

                      {/* Criterio de ordenamiento: Ãšltimo artÃ­culo subido al mÃ¡s viejo */}
                      <select
                        value={productSort}
                        onChange={e => setProductSort(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-emerald-300 bg-emerald-50/50 font-bold text-[#2D4F3E] cursor-pointer"
                        title="Ordenar lista de productos y SKUs (Por defecto: del Ãºltimo artÃ­culo subido al mÃ¡s viejo)"
                      >
                        <option value="newest">ðŸ•’ Ãšltimos subidos (mÃ¡s recientes primero)</option>
                        <option value="oldest">ðŸ“… Primeros subidos (mÃ¡s antiguos)</option>
                        <option value="sku_asc">ðŸ”¤ SKU / CÃ³digo (A â†’ Z)</option>
                        <option value="sku_desc">ðŸ”¤ SKU / CÃ³digo (Z â†’ A)</option>
                        <option value="name_asc">ðŸ·ï¸ Nombre (A â†’ Z)</option>
                        <option value="price_desc">ðŸ’° Mayor precio</option>
                        <option value="price_asc">ðŸª™ Menor precio</option>
                      </select>

                      {/* Selector de modo de vista: Tarjetas (estilo paquetes) vs Tabla */}
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setProductViewMode('grid')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            productViewMode === 'grid'
                              ? 'bg-[#2D4F3E] text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Vista de cuadrÃ­cula en tarjetas (estilo Paquetes)"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tarjetas</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductViewMode('table')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            productViewMode === 'table'
                              ? 'bg-[#2D4F3E] text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Vista en tabla compacta"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tabla</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPhotoStudio()}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 min-h-[40px] rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer touch-manipulation"
                        title="Abrir Estudio FotogrÃ¡fico para generar las 4 tomas de catÃ¡logo con IA"
                      >
                        <Camera className="w-4 h-4 text-amber-200" />
                        <span>Estudio 4 Fotos IA</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenNewProduct}
                        className="flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] active:scale-95 transition-all shadow-sm cursor-pointer touch-manipulation"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Nuevo Producto</span>
                      </button>
                    </div>
                  </div>

                  {/* BARRA MÃ“VIL DE ACCIONES RÃPIDAS (BOTONES GRANDES PARA DEDO) */}
                  <div className="md:hidden grid grid-cols-2 gap-2.5 p-2 bg-[#F4F0E8] rounded-2xl border border-[#E8E4DA]">
                    <button
                      type="button"
                      onClick={handleOpenNewProduct}
                      className="min-h-[48px] w-full px-3 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer touch-manipulation"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Agregar Producto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPhotoStudio('new')}
                      className="min-h-[48px] w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer touch-manipulation"
                    >
                      <Camera className="w-4 h-4 text-amber-200" />
                      <span>Estudio 4 Fotos IA</span>
                    </button>
                  </div>

                  {productViewMode === 'grid' ? (
                    /* VISTA EN CUADRÃCULA DE TARJETAS (ESTILO PAQUETES - FÃCIL EDICIÃ“N) */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredProducts.map(p => (
                        <div
                          key={p.id}
                          className="rounded-3xl border border-[#E8E4DA] hover:border-gray-400 bg-white transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md relative"
                        >
                          <div className="p-4 sm:p-5 space-y-3.5">
                            {/* Encabezado: Foto, SKU y Nombre */}
                            <div className="flex items-start gap-3">
                              <ImageOptimized loading="lazy"
                                src={p.primaryImage || p.gallery?.[0] || p.whiteBgImage}
                                alt={p.name}
                                className="w-16 h-16 rounded-2xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-bold text-[10.5px] text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-300 inline-flex items-center gap-1.5 shadow-2xs">
                                    <span>{p.sku || p.code}</span>
                                    {Boolean((p.createdAt && new Date(p.createdAt).getTime() >= new Date('2026-10-24T00:00:00Z').getTime()) || (p.code && (p.code.startsWith('CUST-DIBUJO') || p.code.startsWith('IND') || p.code.startsWith('J') || (p.code.startsWith('CUST-FUNKO-') && p.code !== 'CUST-FUNKO')))) && (
                                      <span className="bg-emerald-600 text-white text-[8px] font-black px-1 py-0.2 rounded leading-none uppercase">
                                        Nuevo
                                      </span>
                                    )}
                                  </span>
                                  {p.worlds?.map(w => (
                                    <span
                                      key={w}
                                      className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9.5px] font-bold border border-emerald-200 capitalize"
                                    >
                                      {w}
                                    </span>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleStatus(p, e)}
                                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border transition-colors cursor-pointer ${
                                      p.status === 'published'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                        : p.status === 'draft'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}
                                    title="Clic para alternar entre Publicado y Borrador"
                                  >
                                    {p.status === 'published' ? 'â— Publicado' : p.status === 'draft' ? 'â—‹ Borrador' : 'Archivado'}
                                  </button>
                                </div>

                                <h4 className="font-bold text-xs sm:text-sm text-[#1F2421] truncate mt-1" title={p.name}>
                                  {p.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                  {p.shortDescription || 'Sin descripciÃ³n corta.'}
                                </p>

                                {/* Badges Grid de Tiempo de FabricaciÃ³n & Repositorio */}
                                {(() => {
                                  const mHoursVal = Number(p.costBreakdown?.machineHours) || 
                                                    (Number(p.manufacturingRecipe?.manufacturingTimeMinutes) ? (Number(p.manufacturingRecipe.manufacturingTimeMinutes) / 60) : 0);
                                  const pMinsVal = Number(p.postProcessingTimeMinutes) || Number(p.costBreakdown?.manualWorkMin) || 0;
                                  const totalMins = Math.round(mHoursVal * 60) + pMinsVal;
                                  const h = Math.floor(totalMins / 60);
                                  const m = totalMins % 60;
                                  const timeStr = totalMins > 0 ? (h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`) : null;
                                  const repoUrl = p.repository?.makerworldUrl || p.makerWorldModel || p.makerworldUrl || p.repositoryUrl;
                                  const hasLocal = Boolean(p.repository?.localPath || p.localPath);
                                  const mwId = p.repository?.makerworldModelId || p.makerWorldProfileId || (repoUrl?.match(/models\/(\d+)/)?.[1]);

                                  if (!timeStr && !repoUrl && !hasLocal) return null;

                                  return (
                                    <div className="flex flex-wrap items-center gap-1 mt-1 text-[9px]">
                                      {timeStr && (
                                        <span
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-mono font-bold"
                                        >
                                          <span>â±ï¸</span>
                                          <span>{timeStr}</span>
                                        </span>
                                      )}
                                      {repoUrl && (
                                        <a
                                          href={repoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition-colors cursor-pointer"
                                        >
                                          <span>ðŸŒ</span>
                                          <span>{repoUrl.includes('makerworld') ? `MW${mwId ? ` #${mwId}` : ''}` : 'Fuente'}</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                      {hasLocal && (
                                        <span
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-mono"
                                        >
                                          <span>ðŸ’» PC</span>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Precios y Existencia */}
                            <div className="p-2.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Precio</div>
                                <div className="font-black text-sm sm:text-base text-[#2D4F3E] font-mono">
                                  {p.priceType === 'quote' ? 'A cotizar' : `$${p.price}`}
                                  <span className="text-[10px] font-normal text-gray-500 ml-1">
                                    {p.priceUnit || 'MXN'}
                                  </span>
                                </div>
                              </div>

                              {/* Switch de Stock & Ajuste RÃ¡pido */}
                              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleStock(p, e)}
                                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    p.availability === 'in_stock' ? 'bg-emerald-600' : 'bg-gray-300'
                                  }`}
                                  title={p.availability === 'in_stock' ? 'En existencia. Clic para cambiar a Bajo Pedido' : 'Bajo pedido. Clic para activar Stock'}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      p.availability === 'in_stock' ? 'translate-x-3' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className={`text-[10px] font-bold ${
                                  p.availability === 'in_stock' ? 'text-emerald-700' : 'text-gray-500'
                                }`}>
                                  {p.availability === 'in_stock' ? `${p.stockQuantity || 0} pzs` : 'Bajo pedido'}
                                </span>
                                {p.availability === 'in_stock' && (
                                  <div className="flex items-center gap-0.5 ml-1 border-l border-gray-200 pl-1">
                                    <button
                                      type="button"
                                      onClick={(e) => handleAdjustStockQuantity(p, -1, e)}
                                      className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                                      title="Restar 1 unidad"
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleAdjustStockQuantity(p, 1, e)}
                                      className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                                      title="Sumar 1 unidad"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* TÃ©cnicas y Oferta Flash */}
                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10.5px]">
                              <div className="flex items-center gap-1 flex-wrap">
                                {p.techniques?.map(t => (
                                  <span key={t} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-bold uppercase">
                                    {t}
                                  </span>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => handleToggleProductFlash(p, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  p.flashDealConfig?.enabled
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                }`}
                              >
                                <Zap className={`w-3 h-3 ${p.flashDealConfig?.enabled ? 'fill-amber-500 text-amber-600' : 'text-gray-400'}`} />
                                <span>{p.flashDealConfig?.enabled ? 'Flash Activa' : 'Sin Flash'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Barra de Acciones */}
                          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDuplicateProduct(p.id)}
                                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold transition-colors cursor-pointer"
                                title="Duplicar como plantilla"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPhotoStudio(p.id);
                                }}
                                className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                title="Generar 4 tomas de catÃ¡logo con IA"
                              >
                                <Camera className="w-3.5 h-3.5 text-amber-700" />
                                <span>4 Fotos IA</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditProduct(p);
                                }}
                                className="py-1.5 px-4 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                                title="Editar producto"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* VISTA EN TABLA (MODO COMPACTO) */
                    <>
{/* VISTA MÃ“VIL: Tarjetas de Producto TÃ¡ctiles y Adaptadas */}
                  <div className="md:hidden space-y-3">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl p-3.5 border border-[#E8E4DA] shadow-xs space-y-3"
                      >
                        {/* Encabezado de la tarjeta: Toca cualquier parte para Editar */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenEditProduct(p)}
                          className="flex items-start gap-3 cursor-pointer group active:opacity-75 transition-opacity touch-manipulation"
                          title="Toca para editar este producto"
                        >
                          <ImageOptimized loading="lazy"
                            src={p.primaryImage}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[10.5px] border border-gray-300 inline-flex items-center gap-1">
                                <span>{p.sku || p.code}</span>
                                {Boolean((p.createdAt && new Date(p.createdAt).getTime() >= new Date('2026-10-24T00:00:00Z').getTime()) || (p.code && (p.code.startsWith('CUST-DIBUJO') || p.code.startsWith('IND') || p.code.startsWith('J') || (p.code.startsWith('CUST-FUNKO-') && p.code !== 'CUST-FUNKO')))) && (
                                  <span className="bg-emerald-600 text-white text-[7.5px] font-black px-1 py-0.2 rounded leading-none uppercase">
                                    Nuevo
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(p, e)}
                                className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border transition-colors cursor-pointer ${
                                  p.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    : p.status === 'draft'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}
                                title="Clic para alternar entre Publicado y Borrador"
                              >
                                {p.status === 'published' ? 'â— Publicado' : p.status === 'draft' ? 'â—‹ Borrador' : 'Archivado'}
                              </button>
                            </div>

                            <h4 className="font-bold text-sm text-[#1F2421] group-hover:text-[#2D4F3E] truncate mt-1 transition-colors">
                              {p.name}
                            </h4>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-black text-[#2D4F3E] text-sm">
                                ${p.price} <span className="text-[10px] font-normal text-gray-500">{p.unit || 'MXN'}</span>
                              </span>
                              {p.isBundle && (
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold text-[9.5px]">
                                  ðŸŽ Kit
                                </span>
                              )}
                              {p.skuBreakdown && (
                                <span className="text-[10px] text-gray-500 font-sans tracking-tight bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 inline-flex items-center gap-1 shrink-0" title={`Ãrea: ${p.skuBreakdown.area} | TÃ©cnica: ${p.skuBreakdown.technique}`}>
                                  <span>{SKU_AREAS[p.skuBreakdown.area]?.icon || 'ðŸ“¦'}</span>
                                  <span className="font-semibold">{SKU_AREAS[p.skuBreakdown.area]?.label || p.skuBreakdown.area}</span>
                                  <span className="text-gray-300">â€¢</span>
                                  <span>{SKU_TECHNIQUES[p.skuBreakdown.technique]?.short || p.skuBreakdown.technique}</span>
                                </span>
                              )}
                            </div>

                            {/* Badges MÃ³vil de Tiempo de FabricaciÃ³n & Repositorio */}
                            {(() => {
                              const mHoursVal = Number(p.costBreakdown?.machineHours) || 
                                                (Number(p.manufacturingRecipe?.manufacturingTimeMinutes) ? (Number(p.manufacturingRecipe.manufacturingTimeMinutes) / 60) : 0);
                              const pMinsVal = Number(p.postProcessingTimeMinutes) || Number(p.costBreakdown?.manualWorkMin) || 0;
                              const totalMins = Math.round(mHoursVal * 60) + pMinsVal;
                              const h = Math.floor(totalMins / 60);
                              const m = totalMins % 60;
                              const timeStr = totalMins > 0 ? (h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`) : null;
                              const repoUrl = p.repository?.makerworldUrl || p.makerWorldModel || p.makerworldUrl || p.repositoryUrl;
                              const hasLocal = Boolean(p.repository?.localPath || p.localPath);
                              const mwId = p.repository?.makerworldModelId || p.makerWorldProfileId || (repoUrl?.match(/models\/(\d+)/)?.[1]);

                              if (!timeStr && !repoUrl && !hasLocal) return null;

                              return (
                                <div className="flex flex-wrap items-center gap-1 mt-1 text-[9px]">
                                  {timeStr && (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-mono font-bold"
                                    >
                                      <span>â±ï¸</span>
                                      <span>{timeStr}</span>
                                    </span>
                                  )}
                                  {repoUrl && (
                                    <a
                                      href={repoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition-colors cursor-pointer"
                                    >
                                      <span>ðŸŒ</span>
                                      <span>{repoUrl.includes('makerworld') ? `MW${mwId ? ` #${mwId}` : ''}` : 'Fuente'}</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {hasLocal && (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-mono"
                                    >
                                      <span>ðŸ’» PC</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Fila de Controles RÃ¡pidos: Switch de Stock y Oferta Flash */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                          {/* Control de Stock */}
                          <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                            <button
                              type="button"
                              onClick={(e) => handleToggleStock(p, e)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                p.availability === 'in_stock' ? 'bg-emerald-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                                  p.availability === 'in_stock' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`text-[11px] font-bold ${
                              p.availability === 'in_stock' ? 'text-emerald-700' : 'text-gray-500'
                            }`}>
                              {p.availability === 'in_stock' ? `${p.stockQuantity || 0} pz` : 'Pedido'}
                            </span>
                            {p.availability === 'in_stock' && (
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleAdjustStockQuantity(p, -1, e)}
                                  className="w-6 h-6 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center text-xs font-black shadow-2xs active:scale-90"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleAdjustStockQuantity(p, 1, e)}
                                  className="w-6 h-6 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center text-xs font-black shadow-2xs active:scale-90"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Control de Oferta Flash */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleProductFlash(p, e)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                              p.flashDealConfig?.enabled
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            <Zap className={`w-3.5 h-3.5 ${p.flashDealConfig?.enabled ? 'fill-amber-500 text-amber-600' : 'text-gray-400'}`} />
                            <span>{p.flashDealConfig?.enabled ? 'Flash Activa' : 'Sin Flash'}</span>
                          </button>
                        </div>

                        {/* Fila de Botones de AcciÃ³n TÃ¡ctiles y Accesibles */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicateProduct(p.id)}
                              className="min-h-[38px] flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer touch-manipulation"
                              title="Duplicar como plantilla"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Duplicar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="min-h-[38px] flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer touch-manipulation"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Borrar</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPhotoStudio(p.id);
                              }}
                              className="min-h-[42px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-colors cursor-pointer active:scale-95 touch-manipulation"
                              title="Generar 4 tomas de catÃ¡logo con IA"
                            >
                              <Camera className="w-4 h-4 text-amber-700" />
                              <span>4 Fotos IA</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditProduct(p);
                              }}
                              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                              title="Editar producto"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TABLA DE PRODUCTOS CON SWITCH DE STOCK (ESCRITORIO) */}
                  <div className="hidden md:block bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs min-w-0">
                    <div className="w-full">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-2">Foto &amp; CÃ³digo</th>
                            <th className="py-1.5 px-2">Producto</th>
                            <th className="py-1.5 px-1.5">Ãreas / TÃ©cnicas</th>
                            <th className="py-1.5 px-1.5">Precio &amp; Unidad</th>
                            <th className="py-1.5 px-1.5 text-center">Existencia / Stock</th>
                            <th className="py-1.5 px-1.5 text-center">Oferta Flash</th>
                            <th className="py-1.5 px-1.5">Estado</th>
                            <th className="py-1.5 px-2 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-1 px-2">
                                <div className="flex items-center gap-1.5">
                                  <ImageOptimized loading="lazy"
                                    src={p.primaryImage}
                                    alt=""
                                    className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                                  />
                                  <div className="flex flex-col gap-0 min-w-0">
                                    <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1 py-0 rounded text-[10px] border border-gray-300 w-fit inline-flex items-center gap-1">
                                      <span>{p.sku || p.code}</span>
                                      {Boolean((p.createdAt && new Date(p.createdAt).getTime() >= new Date('2026-10-24T00:00:00Z').getTime()) || (p.code && (p.code.startsWith('CUST-DIBUJO') || p.code.startsWith('IND') || p.code.startsWith('J') || (p.code.startsWith('CUST-FUNKO-') && p.code !== 'CUST-FUNKO')))) && (
                                        <span className="bg-emerald-600 text-white text-[7px] font-black px-1 rounded leading-none uppercase">
                                          Nuevo
                                        </span>
                                      )}
                                    </span>
                                    {p.skuBreakdown && (
                                      <span className="text-[9px] text-gray-500 font-sans tracking-tight bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200/80 inline-flex items-center gap-1 w-fit mt-0.5" title={`Ãrea: ${p.skuBreakdown.area} | TÃ©cnica: ${p.skuBreakdown.technique} | Material: ${p.skuBreakdown.material}`}>
                                        <span>{SKU_AREAS[p.skuBreakdown.area]?.icon || 'ðŸ“¦'}</span>
                                        <span className="font-semibold">{SKU_AREAS[p.skuBreakdown.area]?.label || p.skuBreakdown.area}</span>
                                        <span className="text-gray-300">â€¢</span>
                                        <span>{SKU_TECHNIQUES[p.skuBreakdown.technique]?.short || p.skuBreakdown.technique}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-1 px-2">
                                <div className="font-bold text-[#1F2421] text-xs leading-snug">{p.name}</div>
                                <div className="text-[10px] text-gray-400 line-clamp-1">{p.shortDescription}</div>
                                {/* Circulitos de color del producto compactos */}
                                {(() => {
                                  const colorOpts = getProductColorOptions(p);
                                  if (colorOpts.length === 0) return null;
                                  return (
                                    <div className="flex items-center gap-1 select-none mt-0.5" title={`${colorOpts.length} colores: ${colorOpts.join(', ')}`}>
                                      <div className="flex items-center gap-0.5">
                                        {colorOpts.slice(0, 6).map((c, idx) => {
                                          const sw = getFilamentColor(c);
                                          return (
                                            <span
                                              key={idx}
                                              className="w-2.5 h-2.5 rounded-full border border-black/25 shadow-2xs inline-block shrink-0"
                                              style={{
                                                background: sw?.css || '#D1D5DB',
                                                borderColor: sw?.border || '#9CA3AF'
                                              }}
                                              title={c}
                                            />
                                          );
                                        })}
                                      </div>
                                      {colorOpts.length > 6 && (
                                        <span className="text-[8.5px] font-bold text-gray-400">+{colorOpts.length - 6}</span>
                                      )}
                                      <span className="text-[8.5px] text-gray-400 font-medium">
                                        ({colorOpts.length} col.)
                                      </span>
                                    </div>
                                  );
                                })()}

                                {/* Badges de Tiempo de FabricaciÃ³n & Repositorio */}
                                {(() => {
                                  const mHoursVal = Number(p.costBreakdown?.machineHours) || 
                                                    (Number(p.manufacturingRecipe?.manufacturingTimeMinutes) ? (Number(p.manufacturingRecipe.manufacturingTimeMinutes) / 60) : 0);
                                  const pMinsVal = Number(p.postProcessingTimeMinutes) || Number(p.costBreakdown?.manualWorkMin) || 0;
                                  const totalMins = Math.round(mHoursVal * 60) + pMinsVal;
                                  const h = Math.floor(totalMins / 60);
                                  const m = totalMins % 60;
                                  const timeStr = totalMins > 0 ? (h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`) : null;
                                  const repoUrl = p.repository?.makerworldUrl || p.makerWorldModel || p.makerworldUrl || p.repositoryUrl;
                                  const hasLocal = Boolean(p.repository?.localPath || p.localPath);
                                  const mwId = p.repository?.makerworldModelId || p.makerWorldProfileId || (repoUrl?.match(/models\/(\d+)/)?.[1]);

                                  if (!timeStr && !repoUrl && !hasLocal) return null;

                                  return (
                                    <div className="flex flex-wrap items-center gap-1 mt-1 text-[9px]">
                                      {timeStr && (
                                        <span
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-mono font-bold"
                                          title={`Tiempo total de taller: ${timeStr} (${mHoursVal.toFixed(1)}h mÃ¡quina + ${pMinsVal}m acabado)`}
                                        >
                                          <span>â±ï¸</span>
                                          <span>{timeStr}</span>
                                        </span>
                                      )}
                                      {repoUrl && (
                                        <a
                                          href={repoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition-colors cursor-pointer"
                                          title={`Ver en repositorio: ${repoUrl}`}
                                        >
                                          <span>ðŸŒ</span>
                                          <span>{repoUrl.includes('makerworld') ? `MW${mwId ? ` #${mwId}` : ''}` : 'Fuente'}</span>
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                      {hasLocal && (
                                        <span
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-mono"
                                          title={`Archivo local: ${p.repository?.localPath || p.localPath}`}
                                        >
                                          <span>ðŸ’»</span>
                                          <span>PC</span>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>

                              <td className="py-1 px-1.5">
                                <div className="flex flex-wrap gap-0.5">
                                  {p.isBundle && (
                                    <span className="px-1 py-0 rounded bg-purple-100 text-purple-800 text-[9px] font-bold flex items-center gap-0.5">
                                      <span>ðŸŽ</span>
                                      <span>Paquete</span>
                                    </span>
                                  )}
                                  {(p.code?.includes('PATCH') || p.category === 'servicios') && (
                                    <span className="px-1 py-0 rounded bg-amber-100 text-amber-800 text-[9px] font-bold flex items-center gap-0.5">
                                      <span>âš¡</span>
                                      <span>Servicio</span>
                                    </span>
                                  )}
                                  {p.worlds?.map(w => (
                                    <span key={w} className="px-1 py-0 rounded bg-gray-100 text-gray-600 text-[9px] font-medium capitalize">
                                      {w}
                                    </span>
                                  ))}
                                  {p.techniques?.map(t => (
                                    <span key={t} className="px-1 py-0 rounded bg-emerald-50 text-emerald-800 text-[9px] font-medium uppercase">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-1 px-1.5">
                                <div className="flex flex-col gap-0">
                                  <span className="font-bold text-gray-900 font-mono text-xs leading-none">
                                    {p.priceType === 'quote' ? (
                                      <span className="text-gray-400 font-sans font-medium text-[11px]">A cotizar</span>
                                    ) : (
                                      `$${p.price}`
                                    )}
                                  </span>
                                  <select
                                    value={p.priceUnit || 'pieza'}
                                    onChange={(e) => handleUpdateProductUnit(p, e.target.value)}
                                    className="text-[9.5px] font-bold text-[#2D4F3E] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded px-1 py-0 cursor-pointer focus:outline-none w-fit transition-colors mt-0.5"
                                    title="Haz clic para cambiar el tipo de unidad"
                                  >
                                    <option value="pieza">/ pieza</option>
                                    <option value="pza">/ pza</option>
                                    <option value="lote">/ lote</option>
                                    <option value="paquete">/ paquete</option>
                                    <option value="docena">/ docena</option>
                                    <option value="juego">/ juego</option>
                                    <option value="par">/ par</option>
                                    <option value="metro">/ m</option>
                                    <option value="combo">/ combo</option>
                                    <option value="servicio">/ servicio</option>
                                  </select>
                                </div>
                              </td>

                              {/* SWITCH DE STOCK INTERACTIVO DE 1 CLIC COMPACTO */}
                              <td className="py-1 px-1.5 text-center">
                                <div className="inline-flex flex-col items-center gap-0.5">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleStock(p, e)}
                                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        p.availability === 'in_stock' ? 'bg-emerald-600' : 'bg-gray-300'
                                      }`}
                                      title={p.availability === 'in_stock' ? 'En existencia. Clic para desactivar' : 'Sin stock inmediato. Clic para activar existencia'}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          p.availability === 'in_stock' ? 'translate-x-3' : 'translate-x-0'
                                        }`}
                                      />
                                    </button>
                                    <span className={`text-[9.5px] font-bold ${
                                      p.availability === 'in_stock' ? 'text-emerald-700' : 'text-gray-500'
                                    }`}>
                                      {p.availability === 'in_stock' ? 'En exist.' : (p.availability === 'out_of_stock' ? 'Agotado' : 'Pedido')}
                                    </span>
                                  </div>

                                  {p.availability === 'in_stock' && (
                                    <div className="flex items-center gap-0.5 bg-gray-100 px-1 py-0 rounded text-[9.5px]">
                                      <span className="text-gray-600 font-semibold">
                                        <strong>{p.stockQuantity || 0}</strong> pz
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleAdjustStockQuantity(p, -1, e)}
                                        className="w-3 h-3 rounded bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-black shadow-2xs cursor-pointer"
                                        title="Restar 1 pieza"
                                      >
                                        -
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleAdjustStockQuantity(p, 1, e)}
                                        className="w-3 h-3 rounded bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-black shadow-2xs cursor-pointer"
                                        title="Sumar 1 pieza"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-1 px-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleProductFlash(p, e)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                    p.flashDealConfig?.enabled
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-2xs'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                  }`}
                                  title={p.flashDealConfig?.enabled ? "Oferta activa. Clic para desactivar" : "Clic para activar oferta en este producto"}
                                >
                                  <Zap className={`w-3 h-3 ${p.flashDealConfig?.enabled ? 'fill-amber-500 text-amber-600' : 'text-gray-400'}`} />
                                  <span>
                                    {p.flashDealConfig?.enabled 
                                      ? `${p.flashDealConfig.durationMinutes <= 15 ? 'âš¡ 15M' : `${p.flashDealConfig.durationMinutes || 120}m`}`
                                      : 'Off'}
                                  </span>
                                </button>
                              </td>

                              <td className="py-1 px-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleStatus(p, e)}
                                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border transition-colors cursor-pointer ${
                                    p.status === 'published'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : p.status === 'draft'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}
                                  title="Clic para alternar entre Publicado y Borrador"
                                >
                                  {p.status === 'published' ? 'â— Publicado' : p.status === 'draft' ? 'â—‹ Borrador' : 'Archivado'}
                                </button>
                              </td>

                              <td className="py-1 px-2 text-right">
                                <div className="flex items-center justify-end gap-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPhotoStudio(p.id);
                                    }}
                                    className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded cursor-pointer"
                                    title="Estudio FotogrÃ¡fico (4 Fotos IA)"
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditProduct(p);
                                    }}
                                    className="p-1 text-gray-500 hover:text-[#2D4F3E] hover:bg-gray-100 rounded cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateProduct(p.id)}
                                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded cursor-pointer"
                                    title="Duplicar como plantilla"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded cursor-pointer"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
                </div>
              )}

              {/* TAB: COSTOS DE PRODUCCIÃ“N & MÃRGENES DE GANANCIA (EXCEL MODEL) */}
              {activeTab === 'margins' && (
                <div className="space-y-5 min-w-0">
                  {/* CABECERA & GUÃA FINANCIERA */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D4F3E] to-[#1F2421] text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-[#1F2421] font-heading">
                            Costos de ProducciÃ³n, MÃ¡rgenes & Ganancias
                          </h4>
                          <p className="text-xs text-gray-500">
                            FÃ³rmulas financieras en vivo: Ganancia = Venta âˆ’ Costo Â· Margen % = Ganancia / Venta Â· Objetivo: {workshopParams.targetMarginPercent}%.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRawMaterialsSubTab('inventory');
                            setActiveTab('raw-materials');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 hover:border-[#2D4F3E] bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition-all cursor-pointer shadow-2xs"
                          title="Ir al apartado de Materias Primas del Taller"
                        >
                          <Boxes className="w-3.5 h-3.5 text-[#2D4F3E]" />
                          <span>Materias Primas del Taller</span>
                          <ArrowRight className="w-3 h-3 text-[#2D4F3E]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowWorkshopParams(!showWorkshopParams)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#2D4F3E] bg-gray-50 hover:bg-white text-xs font-bold text-gray-700 transition-all cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#2D4F3E]" />
                          <span>Tarifas RÃ¡pidas</span>
                          {showWorkshopParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* ACORDEÃ“N DE PARÃMETROS DEL TALLER (CONFIGURACIÃ“N EXCEL) */}
                    {showWorkshopParams && (
                      <form onSubmit={handleSaveWorkshopParams} className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E8E4DA] space-y-4 animate-fade-in min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
                          <div className="text-xs font-bold text-[#1F2421] uppercase tracking-wider flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-[#2D4F3E]" />
                            <span>Tarifas Base de Taller &amp; Materias Primas</span>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            Modifica cualquier tarifa y se recalcularÃ¡n los mÃ¡rgenes de todo el catÃ¡logo
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 text-xs">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Filamento PLA ($/kg)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.plaPerKg}
                              onChange={e => setWorkshopParams({ ...workshopParams, plaPerKg: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">${(workshopParams.plaPerKg / 1000).toFixed(3)}/g</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Filamento TPU ($/kg)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.tpuPerKg}
                              onChange={e => setWorkshopParams({ ...workshopParams, tpuPerKg: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">${(workshopParams.tpuPerKg / 1000).toFixed(3)}/g</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">EnergÃ­a 3D ($/hora)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.electricityPerHour}
                              onChange={e => setWorkshopParams({ ...workshopParams, electricityPerHour: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Consumo elÃ©ctrico CFE</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Desgaste 3D ($/hora)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.wearPerHour}
                              onChange={e => setWorkshopParams({ ...workshopParams, wearPerHour: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Mantenimiento de boquilla</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Mano de Obra ($/hora)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.laborPerHour}
                              onChange={e => setWorkshopParams({ ...workshopParams, laborPerHour: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">${(workshopParams.laborPerHour / 60).toFixed(2)}/min de trabajo</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Merma Filamento (%)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.filamentWastePercent}
                              onChange={e => setWorkshopParams({ ...workshopParams, filamentWastePercent: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Soportes, purgas y fallas</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Margen Objetivo (%)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.targetMarginPercent}
                              onChange={e => setWorkshopParams({ ...workshopParams, targetMarginPercent: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Meta de rentabilidad mÃ­nima</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Reserva de Utilidad (%)</label>
                            <input
                              type="number"
                              step="any"
                              value={workshopParams.reservePercent}
                              onChange={e => setWorkshopParams({ ...workshopParams, reservePercent: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Fondo de ahorro/taller</span>
                          </div>

                          <div className="col-span-1 sm:col-span-2 flex items-end gap-2">
                            <button
                              type="submit"
                              disabled={savingParams}
                              className="px-4 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {savingParams ? 'Guardando...' : 'Guardar ParÃ¡metros de Taller'}
                            </button>
                            {paramsSaveMsg && (
                              <span className="text-xs font-bold text-emerald-700">
                                {paramsSaveMsg}
                              </span>
                            )}
                          </div>
                        </div>
                      </form>
                    )}

                    {/* 4 KPIS SUPERIORES DE SALUD FINANCIERA (CALCULADOS EN TIEMPO REAL SEGÃšN ÃREA Y TÃ‰CNICA) */}
                    <div className="space-y-2">
                      {/* BARRA DE CANAL DE VENTA / GASTOS DE MERCADO LIBRE */}
                      <div className="bg-[#FAF8F5] p-3 sm:p-3.5 rounded-xl border border-[#E8E4DA] flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <ShoppingCart className="w-4 h-4 text-[#2D4F3E]" />
                            <span>Canal de Venta:</span>
                          </span>
                          <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setMarginSalesChannel('direct')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                marginSalesChannel === 'direct'
                                  ? 'bg-[#2D4F3E] text-white shadow-xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              ðŸª Taller / Web Oficial (0% comisiones)
                            </button>
                            <button
                              type="button"
                              onClick={() => setMarginSalesChannel('mercadolibre')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                                marginSalesChannel === 'mercadolibre'
                                  ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              title="Mercado Libre MÃ©xico: 16% comisiÃ³n de categorÃ­a + $25 cargo fijo en productos menores a $299 MXN"
                            >
                              <span>ðŸ’›</span>
                              <span>Mercado Libre MÃ©xico (16% + $25 fijo)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMarginSalesChannel('custom')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                marginSalesChannel === 'custom'
                                  ? 'bg-purple-700 text-white shadow-xs'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              âœï¸ Personalizado
                            </button>
                          </div>
                        </div>

                        {marginSalesChannel === 'mercadolibre' && (
                          <div className="text-[11px] text-amber-900 font-semibold bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1.5 animate-fade-in">
                            <span className="text-sm">âš ï¸</span>
                            <span>Comisiones ML aplicadas: <strong>16% comisiÃ³n</strong> + <strong>$25 MXN fijos</strong> por unidad vendida (&lt;$299 MXN).</span>
                          </div>
                        )}

                        {marginSalesChannel === 'custom' && (
                          <div className="flex items-center gap-2.5 text-xs animate-fade-in">
                            <div className="flex items-center gap-1">
                              <label className="font-bold text-gray-600 text-[11px]">ComisiÃ³n %:</label>
                              <input
                                type="number"
                                value={customCommission}
                                onChange={e => setCustomCommission(Number(e.target.value))}
                                className="w-14 px-2 py-0.5 rounded border border-gray-300 bg-white font-bold text-center"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="font-bold text-gray-600 text-[11px]">Cargo Fijo $:</label>
                              <input
                                type="number"
                                value={customFixedFee}
                                onChange={e => setCustomFixedFee(Number(e.target.value))}
                                className="w-14 px-2 py-0.5 rounded border border-gray-300 bg-white font-bold text-center"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {(marginsTechnique !== 'all' || marginsWorld !== 'all' || marginsSearch.trim()) && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="font-bold text-amber-800">Filtrado activo:</span>
                            <span>{marginsWorld === 'all' ? 'Todas las Ã¡reas' : `Ãrea: ${marginsWorld}`}</span>
                            <span>â€¢</span>
                            <span>{techniqueList.find(t => t.id === marginsTechnique)?.label || 'Todas las tÃ©cnicas'}</span>
                            {marginsSearch.trim() && <span>â€¢ BÃºsqueda: "{marginsSearch}"</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMarginsWorld('all');
                              setMarginsTechnique('all');
                              setMarginsSearch('');
                              setMarginsStatus('all');
                            }}
                            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                          >
                            Restablecer todos
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1 min-w-0">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                            Margen Promedio {marginsTechnique !== 'all' ? `(${techniqueList.find(t => t.id === marginsTechnique)?.shortLabel})` : 'del CatÃ¡logo'}
                          </div>
                          <div className="text-2xl font-black text-emerald-900 mt-1">
                            {activeMarginsSummary.avgMargin}%
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1.5">
                            <span>Objetivo: {workshopParams.targetMarginPercent}%</span>
                            <span className="font-bold">
                              {activeMarginsSummary.avgMargin >= workshopParams.targetMarginPercent ? 'âœ“ Meta superada' : 'âš ï¸ Por afinar'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-blue-800">
                            Ganancia Neta {marginsTechnique !== 'all' ? `(${techniqueList.find(t => t.id === marginsTechnique)?.shortLabel})` : 'Proyectada'}
                          </div>
                          <div className="text-2xl font-black text-blue-900 mt-1">
                            ${activeMarginsSummary.profit.toLocaleString('es-MX')} MXN
                          </div>
                          <div className="text-[11px] text-blue-700 mt-1.5">
                            Suma si se vende 1 unidad ({activeMarginsSummary.totalItems} productos)
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
                            Costo vs Venta {marginsTechnique !== 'all' ? `(${techniqueList.find(t => t.id === marginsTechnique)?.shortLabel})` : 'de SelecciÃ³n'}
                          </div>
                          <div className="text-lg font-black text-amber-900 mt-1">
                            ${activeMarginsSummary.cost.toLocaleString('es-MX')} / ${activeMarginsSummary.revenue.toLocaleString('es-MX')}
                          </div>
                          <div className="text-[11px] text-amber-700 mt-1.5">
                            Costo es el {activeMarginsSummary.revenue > 0 ? Math.round((activeMarginsSummary.cost / activeMarginsSummary.revenue) * 100) : 0}% de la venta
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200">
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-purple-800">
                            Reserva ({workshopParams.reservePercent}%) &amp; Libre
                          </div>
                          <div className="text-lg font-black text-purple-900 mt-1">
                            ${activeMarginsSummary.reserve.toLocaleString('es-MX')} / ${activeMarginsSummary.available.toLocaleString('es-MX')}
                          </div>
                          <div className="text-[11px] text-purple-700 mt-1.5">
                            Reserva contingencia / Libre retiro
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEMÃFORO DE SALUD DE RENTABILIDAD DINÃMICO */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-500 font-semibold text-[11px]">Filtrar por rentabilidad:</span>
                      <button
                        type="button"
                        onClick={() => setMarginsStatus(marginsStatus === 'optimal' ? 'all' : 'optimal')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          marginsStatus === 'optimal' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        âœ“ {activeMarginsSummary.optimalCount} Margen Ã“ptimo (â‰¥40%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarginsStatus(marginsStatus === 'low' ? 'all' : 'low')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          marginsStatus === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        âš ï¸ {activeMarginsSummary.lowMarginCount} Bajo Objetivo (&lt;40%)
                      </button>
                      {activeMarginsSummary.lossCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setMarginsStatus(marginsStatus === 'loss' ? 'all' : 'loss')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            marginsStatus === 'loss' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          âœ• {activeMarginsSummary.lossCount} En PÃ©rdida
                        </button>
                      )}
                      {activeMarginsSummary.missingCostCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setMarginsStatus(marginsStatus === 'missing' ? 'all' : 'missing')}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            marginsStatus === 'missing' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          ðŸ“‹ {activeMarginsSummary.missingCostCount} Faltan Costos
                        </button>
                      )}
                      <span className="text-[11px] text-gray-400 ml-auto">
                        âš™ï¸ {activeMarginsSummary.quoteCount} CotizaciÃ³n abierta
                      </span>
                    </div>
                  </div>

                  {/* FILTROS DE ÃREA, TÃ‰CNICA Y BÃšSQUEDA */}
                  <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-[#E8E4DA] min-w-0">
                    {/* Fila 1: Filtro por Ãrea y Buscador */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 py-0.5">Ãrea:</span>
                          {[
                            { id: 'all', label: 'Todas', icon: 'ðŸŒ' },
                            { id: 'hogar', label: 'Hogar', icon: 'ðŸ ' },
                            { id: 'negocios', label: 'Negocios', icon: 'ðŸ’¼' },
                            { id: 'juguetes', label: 'Juguetes', icon: 'ðŸ§¸' },
                            { id: 'personalizados', label: 'Personalizados', icon: 'âœ¨' },
                            { id: 'eventos', label: 'Eventos', icon: 'ðŸŽ‰' },
                            { id: 'paquetes', label: 'Paquetes', icon: 'ðŸŽ' },
                            { id: 'industria', label: 'Industria', icon: 'âš™ï¸' },
                            { id: 'publicidad-desarrollo', label: 'DiseÃ±o & Pub.', icon: 'ðŸŽ¨' }
                          ].map(area => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => setMarginsWorld(area.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                marginsWorld === area.id
                                  ? 'bg-white text-[#2D4F3E] shadow-2xs font-extrabold'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <span>{area.icon}</span>
                              <span>{area.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="relative flex-1 min-w-[180px] max-w-xs">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar SKU o nombre..."
                            value={marginsSearch}
                            onChange={e => setMarginsSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-medium shrink-0">
                        Mostrando <strong>{filteredMarginsRows.length}</strong> de {products.length} productos
                      </div>
                    </div>

                    {/* Fila 2: Filtro por Servicio / TÃ©cnica de FabricaciÃ³n */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-[#2D4F3E]" />
                        <span>TÃ©cnica / Servicio:</span>
                      </span>
                      {techniqueList.map(tech => {
                        const isSelected = marginsTechnique === tech.id;
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => setMarginsTechnique(tech.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D4F3E] text-white shadow-2xs scale-102'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <span>{tech.icon}</span>
                            <span>{tech.shortLabel}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {techniqueCounts[tech.id] || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* TABLA DE COSTOS, MÃRGENES Y GANANCIAS (100% AJUSTADA A LA VENTANA) */}
                  <div className="bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs">
                    <div className="w-full">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-2">SKU &amp; Producto</th>
                            <th className="py-1.5 px-2 text-right">P. Venta &amp; Unidad</th>
                            <th className="py-1.5 px-2 text-right">Costo Unit.</th>
                            <th className="py-1.5 px-2 text-right">Ganancia &amp; Margen</th>
                            <th className="py-1.5 px-2 text-right">Utilidad &amp; Reserva</th>
                            <th className="py-1.5 px-2 text-center">Estado &amp; Desglose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredMarginsRows.map(row => {
                            const p = row.product;
                            return (
                              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-1 px-2">
                                  <div className="flex items-center gap-1.5">
                                    <ImageOptimized loading="lazy"
                                      src={p.primaryImage}
                                      alt=""
                                      className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1 py-0 rounded text-[9.5px] border border-gray-200">
                                          {p.sku || p.code}
                                        </span>
                                        <span className="font-bold text-[#1F2421] text-xs truncate max-w-[200px]" title={p.name}>
                                          {p.name}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                        {(p.techniques || []).map(tKey => {
                                          const norm = tKey.replace('sublimacion', 'sublimation').replace('vinil', 'vinyl');
                                          const techInfo = techniqueList.find(t => t.id === norm);
                                          return (
                                            <span
                                              key={tKey}
                                              className={`text-[8.5px] font-bold px-1 py-0 rounded ${
                                                norm === '3d' ? 'bg-emerald-100 text-emerald-800' :
                                                norm === 'laser' ? 'bg-amber-100 text-amber-800' :
                                                norm === 'sublimation' ? 'bg-blue-100 text-blue-800' :
                                                norm === 'vinyl' ? 'bg-purple-100 text-purple-800' :
                                                norm === 'nfc' ? 'bg-rose-100 text-rose-800' :
                                                'bg-gray-100 text-gray-700'
                                              }`}
                                            >
                                              {techInfo?.shortLabel || tKey}
                                            </span>
                                          );
                                        })}
                                        <span className="text-[8.5px] text-gray-400">Â· {p.worlds?.join(', ')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Precio de Venta & Unidad (Editable en Vivo) */}
                                <td className="py-1 px-2 text-right">
                                  <div className="inline-flex flex-col items-end gap-0.5">
                                    <div className="inline-flex items-center justify-end gap-0.5 bg-emerald-50/70 border border-emerald-300 rounded px-1 py-0 focus-within:ring-1 focus-within:ring-[#2D4F3E]">
                                      <span className="text-emerald-700 text-[10px] font-black">$</span>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={p.price ?? ''}
                                        onChange={(e) => handleUpdateProductPrice(p, e.target.value)}
                                        placeholder="0.00"
                                        className="w-14 text-right text-xs font-mono font-black text-gray-900 bg-transparent focus:outline-none py-0"
                                        title="Haz clic para editar el precio de venta en catÃ¡logo"
                                      />
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                      <select
                                        value={p.priceUnit || 'pieza'}
                                        onChange={(e) => handleUpdateProductUnit(p, e.target.value)}
                                        className="text-[9px] font-bold text-gray-600 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-900 border border-gray-200 rounded px-1 py-0 cursor-pointer focus:outline-none transition-colors"
                                        title="Haz clic para cambiar el tipo de unidad (pieza, lote, paquete, etc.)"
                                      >
                                        <option value="pieza">/ pieza</option>
                                        <option value="pza">/ pza</option>
                                        <option value="lote">/ lote</option>
                                        <option value="paquete">/ paquete</option>
                                        <option value="docena">/ docena</option>
                                        <option value="juego">/ juego</option>
                                        <option value="par">/ par</option>
                                        <option value="metro">/ metro</option>
                                        <option value="cmÂ²">/ cmÂ²</option>
                                        <option value="combo">/ combo</option>
                                        <option value="servicio">/ servicio</option>
                                      </select>
                                      {row.platformFee > 0 && (
                                        <span className="text-[8.5px] font-bold text-amber-900 bg-amber-100/90 px-1 py-0 rounded border border-amber-300 whitespace-nowrap" title={`DeducciÃ³n de plataforma: $${row.platformFee} ($${(row.price * row.commission).toFixed(1)} com. + $${row.fixedFee} fijo)`}>
                                          -${row.platformFee} ML
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Costo Unitario de ProducciÃ³n (Editable en Vivo) */}
                                <td className="py-1 px-2 text-right">
                                  <div className="inline-flex flex-col items-end gap-0.5">
                                    <div className="inline-flex items-center justify-end gap-0.5 bg-amber-50/70 border border-amber-300 rounded px-1 py-0 focus-within:ring-1 focus-within:ring-[#2D4F3E]">
                                      <span className="text-amber-800 text-[10px] font-black">$</span>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={p.costPrice ?? ''}
                                        onChange={(e) => handleUpdateProductCost(p, e.target.value)}
                                        placeholder="0.00"
                                        className="w-14 text-right text-xs font-mono font-bold text-gray-900 bg-transparent focus:outline-none py-0"
                                        title="Haz clic para editar el costo de producciÃ³n"
                                      />
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-mono" title={`Costo mÃ¡ximo sugerido para 40% margen: $${row.maxCost}`}>
                                      {row.hasCost ? `Obj: $${row.maxCost}` : 'Sin costear'}
                                    </span>
                                  </div>
                                </td>

                                {/* Ganancia & Margen % */}
                                <td className="py-1 px-2 text-right">
                                  {row.isQuote ? (
                                    <span className="text-gray-300 font-mono">-</span>
                                  ) : (
                                    <div className="inline-flex flex-col items-end">
                                      <span className={`font-mono font-black text-xs ${row.profit < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        {row.profit < 0 ? `-$${Math.abs(row.profit)}` : `+$${row.profit}`}
                                      </span>
                                      {row.hasCost && (
                                        <span className={`inline-block px-1 py-0 rounded font-black text-[9px] mt-0.5 ${
                                          row.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                          row.statusColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                                          'bg-rose-100 text-rose-800'
                                        }`}>
                                          {row.marginPct}%
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Utilidad Disponible & Reserva 10% */}
                                <td className="py-1 px-2 text-right">
                                  {row.isQuote || row.profit <= 0 ? (
                                    <span className="text-gray-300 font-mono">-</span>
                                  ) : (
                                    <div className="inline-flex flex-col items-end text-[10px]">
                                      <span className="font-bold text-emerald-800 font-mono" title="Utilidad neta disponible libre de reserva">
                                        Disp: ${row.available}
                                      </span>
                                      <span className="text-purple-700 font-mono text-[9px]" title="Reserva del 10% para imprevistos de taller">
                                        Res: ${row.reserve}
                                      </span>
                                      <span className="text-gray-400 font-mono text-[8.5px]" title={`Recargo / Markup: ${row.markupPct}%`}>
                                        {row.markupPct}% rec.
                                      </span>
                                    </div>
                                  )}
                                </td>

                                {/* Estado & BotÃ³n Desglose */}
                                <td className="py-1 px-2 text-center">
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                      row.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                      row.statusColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                                      row.statusColor === 'rose' ? 'bg-rose-100 text-rose-800' :
                                      row.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {row.statusLabel}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCostBreakdown(p)}
                                      className="px-1.5 py-0 rounded border border-gray-200 text-gray-600 hover:text-[#2D4F3E] hover:border-[#2D4F3E] hover:bg-emerald-50/50 transition-all text-[9.5px] font-bold inline-flex items-center gap-0.5 cursor-pointer"
                                      title="Abrir calculadora detallada de filamento, mÃ¡quina y mano de obra"
                                    >
                                      <Calculator className="w-2.5 h-2.5 text-[#2D4F3E]" />
                                      <span>Desglose</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CATEGORÃAS & AUDITORÃA DE PRODUCCIÃ“N POR TÃ‰CNICA */}
              {activeTab === 'categories' && (
                <div className="space-y-5">
                  {/* PANEL DE AUDITORÃA: Â¿CUÃNTO ESTOY HACIENDO DE CADA COSA? */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E4DA] shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#2D4F3E]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 font-heading">
                          AuditorÃ­a de FabricaciÃ³n por TÃ©cnica ("Â¿CuÃ¡nto estoy haciendo de cada cosa?")
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Haz clic en una tarjeta para filtrar automÃ¡ticamente las ramas de esa tecnologÃ­a
                      </span>
                    </div>

                    {/* 5 Tarjetas Resumen por TÃ©cnica */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {techniqueOverview.map(tInfo => {
                        const isSelected = categoryTechnique === tInfo.id;
                        return (
                          <button
                            key={tInfo.id}
                            type="button"
                            onClick={() => setCategoryTechnique(isSelected ? 'all' : tInfo.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#2D4F3E] text-white border-[#2D4F3E] shadow-sm scale-102 ring-2 ring-[#2D4F3E]/20'
                                : 'bg-gray-50/90 hover:bg-white hover:border-gray-300 text-gray-800 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <span className="text-base">{tInfo.icon}</span>
                                <span className="truncate">{tInfo.shortLabel}</span>
                              </span>
                              <span className={`text-[10.5px] font-black px-1.5 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                              }`}>
                                {tInfo.count}
                              </span>
                            </div>

                            <div className="space-y-0.5 pt-1 border-t border-gray-200/60">
                              <div className={`text-sm font-black ${isSelected ? 'text-white' : 'text-[#1F2421]'}`}>
                                ${tInfo.catalogValue.toLocaleString('es-MX')} <span className="text-[10px] font-normal">MXN</span>
                              </div>
                              <div className={`text-[10px] flex items-center justify-between ${
                                isSelected ? 'text-emerald-200' : 'text-gray-500'
                              }`}>
                                <span>{tInfo.percentOfCatalog}% catÃ¡logo</span>
                                <span>{tInfo.categoriesCount} ramas</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BARRA DE FILTROS PARA CATEGORÃAS */}
                  <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-[#E8E4DA] min-w-0">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Filtro por TÃ©cnica */}
                      <div className="flex flex-wrap items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1 mr-1">
                          <Filter className="w-3 h-3 text-[#2D4F3E]" />
                          <span>TÃ©cnica:</span>
                        </span>
                        {techniqueList.map(tech => {
                          const isSelected = categoryTechnique === tech.id;
                          return (
                            <button
                              key={tech.id}
                              type="button"
                              onClick={() => setCategoryTechnique(tech.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#2D4F3E] text-white shadow-2xs font-extrabold'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <span>{tech.icon}</span>
                              <span>{tech.shortLabel}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                              }`}>
                                {techniqueCounts[tech.id] || 0}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Buscador de SubcategorÃ­as */}
                      <div className="relative min-w-[200px] max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar categorÃ­a..."
                          value={categorySearch}
                          onChange={e => setCategorySearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>
                    </div>

                    {/* Fila secundaria: Selector de Ãrea y Contador */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-1">Ãrea:</span>
                        {[
                          { id: 'all', label: 'Todas las Ã¡reas', icon: 'ðŸŒ' },
                          { id: 'hogar', label: 'Hogar', icon: 'ðŸ ' },
                          { id: 'negocios', label: 'Negocios', icon: 'ðŸ’¼' },
                          { id: 'juguetes', label: 'Juguetes', icon: 'ðŸ§¸' },
                          { id: 'personalizados', label: 'Personalizados', icon: 'âœ¨' },
                          { id: 'eventos', label: 'Eventos', icon: 'ðŸŽ‰' },
                          { id: 'paquetes', label: 'Paquetes', icon: 'ðŸŽ' },
                          { id: 'industria', label: 'Industria', icon: 'âš™ï¸' },
                          { id: 'publicidad-desarrollo', label: 'DiseÃ±o & Publicidad', icon: 'ðŸŽ¨' }
                        ].map(area => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => setCategoryWorld(area.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                              categoryWorld === area.id
                                ? 'bg-gray-800 text-white font-bold'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <span>{area.icon}</span>
                            <span>{area.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-gray-500 font-medium">
                        Mostrando <strong>{filteredCategories.length}</strong> de {categories.length} categorÃ­as
                        {categoryTechnique !== 'all' && (
                          <span className="ml-1 text-[#2D4F3E] font-bold">
                            (con {techniqueList.find(t => t.id === categoryTechnique)?.shortLabel})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TABLA DETALLADA DE CATEGORÃAS CON DESGLOSE DE TÃ‰CNICAS */}
                  <div className="bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F7F2] border-b border-[#E8E4DA] text-gray-600 uppercase font-bold text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-3">SubcategorÃ­a &amp; Clave</th>
                            <th className="py-1.5 px-2">Ãrea</th>
                            <th className="py-1.5 px-2">TÃ©cnicas que se fabrican</th>
                            <th className="py-1.5 px-2 text-center">Piezas en CatÃ¡logo</th>
                            <th className="py-1.5 px-2 text-right">Valor Acumulado</th>
                            <th className="py-1.5 px-2">Visibilidad</th>
                            <th className="py-1.5 px-3 text-right">AcciÃ³n</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredCategories.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-gray-400">
                                No se encontraron categorÃ­as con los filtros seleccionados.
                              </td>
                            </tr>
                          ) : (
                            filteredCategories.map(cat => {
                              const hasTechs = Object.values(cat.techCounts).some(v => v > 0);
                              return (
                                <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                                  <td className="py-1.5 px-3 font-bold text-[#1F2421]">
                                    <div>{cat.name}</div>
                                    <div className="text-[9.5px] text-gray-400 font-mono font-normal">{cat.id}</div>
                                  </td>

                                  <td className="py-1.5 px-2 text-gray-600 capitalize">
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                      cat.worldId === 'hogar' ? 'bg-amber-100 text-amber-800' :
                                      cat.worldId === 'negocios' ? 'bg-blue-100 text-blue-800' :
                                      cat.worldId === 'eventos' ? 'bg-purple-100 text-purple-800' :
                                      cat.worldId === 'juguetes' ? 'bg-pink-100 text-pink-800' :
                                      cat.worldId === 'personalizados' ? 'bg-fuchsia-100 text-fuchsia-800' :
                                      cat.worldId === 'industria' ? 'bg-slate-200 text-slate-800' :
                                      cat.worldId === 'paquetes' || cat.worldId === 'paquetes-servicios' ? 'bg-emerald-100 text-emerald-800' :
                                      cat.worldId === 'publicidad-desarrollo' ? 'bg-indigo-100 text-indigo-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {cat.worldId}
                                    </span>
                                  </td>

                                  {/* Badges de TÃ©cnicas de FabricaciÃ³n presentes */}
                                  <td className="py-1.5 px-2">
                                    <div className="flex flex-wrap items-center gap-1">
                                      {cat.techCounts['3d'] > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                                          <span>ðŸ–¨ï¸</span> <span>3D: {cat.techCounts['3d']}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.laser > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9.5px] font-bold">
                                          <span>ðŸ”¥</span> <span>LÃ¡ser: {cat.techCounts.laser}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.sublimation > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9.5px] font-bold">
                                          <span>ðŸŽ¨</span> <span>SublimaciÃ³n: {cat.techCounts.sublimation}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.vinyl > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9.5px] font-bold">
                                          <span>âœ‚ï¸</span> <span>Vinil: {cat.techCounts.vinyl}</span>
                                        </span>
                                      )}
                                      {cat.techCounts.nfc > 0 && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9.5px] font-bold">
                                          <span>ðŸ“¡</span> <span>NFC: {cat.techCounts.nfc}</span>
                                        </span>
                                      )}
                                      {!hasTechs && (
                                        <span className="text-[9.5px] text-gray-400 italic">Sin piezas asignadas</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Conteo de Piezas Activas */}
                                  <td className="py-1.5 px-2 text-center">
                                    {categoryTechnique !== 'all' ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#2D4F3E] text-white">
                                          {cat.matchingProductCount} con {techniqueList.find(t => t.id === categoryTechnique)?.shortLabel}
                                        </span>
                                        <span className="text-[9px] text-gray-400 mt-0.5">
                                          de {cat.actualProductCount} totales
                                        </span>
                                      </div>
                                    ) : (
                                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                        cat.actualProductCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                                      }`}>
                                        {cat.actualProductCount} productos
                                      </span>
                                    )}
                                  </td>

                                  {/* Valor en CatÃ¡logo */}
                                  <td className="py-1.5 px-2 text-right font-mono font-bold text-[#1F2421]">
                                    ${(categoryTechnique !== 'all' ? cat.matchingValue : cat.categoryTotalValue).toLocaleString('es-MX')}
                                  </td>

                                  {/* Visibilidad */}
                                  <td className="py-1.5 px-2">
                                    {cat.isHidden ? (
                                      <span className="text-gray-400 font-medium text-[10px]">Oculta manualmente</span>
                                    ) : cat.actualProductCount === 0 ? (
                                      <span className="text-amber-600 font-medium text-[10px]">Oculta (vacÃ­a)</span>
                                    ) : (
                                      <span className="text-emerald-700 font-medium text-[10px] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span>Visible</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-1.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleCategory(cat)}
                                      className="px-2 py-0.5 rounded border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {cat.isHidden ? 'Mostrar' : 'Ocultar'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong>Regla de catÃ¡logo automÃ¡tico:</strong> Las subcategorÃ­as sin productos publicados permanecen ocultas en la navegaciÃ³n pÃºblica de la tienda. Al asignarles un producto y publicarlo, se activarÃ¡n de inmediato.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MÃ‰TRICAS REALES */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Total Productos</div>
                      <div className="text-2xl font-black text-[#1F2421] mt-1">{analytics?.totalProducts || 0}</div>
                      <div className="text-[11px] text-emerald-600 mt-1">{analytics?.publishedProducts || 0} publicados</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Visitas a la Web</div>
                      <div className="text-2xl font-black text-[#2D4F3E] mt-1">{analytics?.pageViews || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Interacciones reales registradas</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Clics a WhatsApp</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">{analytics?.whatsappClicks || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Solicitudes de cotizaciÃ³n abiertas</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs">
                      <div className="text-xs font-bold uppercase text-gray-400">Carritos Iniciados</div>
                      <div className="text-2xl font-black text-[#D82B6E] mt-1">{analytics?.quotesStarted || 0}</div>
                      <div className="text-[11px] text-gray-500 mt-1">Productos aÃ±adidos a cotizaciÃ³n</div>
                    </div>
                  </div>

                  {/* Top viewed products */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E8E4DA] space-y-3">
                    <h4 className="text-sm font-bold text-[#1F2421]">
                      Productos mÃ¡s consultados
                    </h4>
                    <div className="space-y-2">
                      {analytics?.productViews && Object.entries(analytics.productViews).map(([id, views]) => {
                        const prod = products.find(p => p.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-none">
                            <span className="font-semibold text-gray-800">
                              {prod ? `[${prod.code}] ${prod.name}` : id}
                            </span>
                            <span className="font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                              {views} consultas
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* APARTADO: DELIMITADORES Y CONTROL DE OFERTAS FLASH POR ÃREA */}
                  <FlashDealsControlSection
                    products={products}
                    settings={businessSettings}
                    flashDeal={flashDeal}
                    token={token}
                    onRefreshCatalog={async () => {
                      await loadAllData();
                      if (onRefreshCatalog) onRefreshCatalog();
                    }}
                    onEditProduct={handleOpenEditProduct}
                  />
                </div>
              )}

              {/* TAB 4: DATOS DEL NEGOCIO */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* CARD DE GESTIÃ“N: DISPONIBILIDAD & COBERTURA DE SERVICIO (LOCAL, NACIONAL Y PAUSA) */}
                  <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-[#1F2421] font-heading">
                              Disponibilidad &amp; Cobertura de Servicio del Taller
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${serviceSummary.color}`}>
                              {serviceSummary.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Controla si aceptas entregas locales, envÃ­os nacionales a toda la RepÃºblica o si el taller estÃ¡ en pausa temporal hasta cierta fecha.
                          </p>
                        </div>
                      </div>

                      {serviceStatusMsg.text && (
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in shrink-0 ${
                          serviceStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{serviceStatusMsg.text}</span>
                        </div>
                      )}
                    </div>

                    {/* 2 Columnas de Cobertura: Servicio Local y Servicio Nacional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. SERVICIO LOCAL */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        activeServiceStatus.localService
                          ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                          : 'bg-gray-50/70 border-gray-200 opacity-80'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeServiceStatus.localService ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'
                            }`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">
                                Servicio &amp; Entregas Locales
                              </div>
                              <div className="text-[10.5px] text-gray-500">
                                Entregas y recolecciÃ³n en taller / zona metropolitana
                              </div>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleUpdateServiceStatus({ localService: !activeServiceStatus.localService })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                              activeServiceStatus.localService ? 'bg-[#2D4F3E]' : 'bg-gray-300'
                            }`}
                            title={activeServiceStatus.localService ? 'Desactivar servicio local' : 'Activar servicio local'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                activeServiceStatus.localService ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-gray-600">Estado en Tienda:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              activeServiceStatus.localService ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {activeServiceStatus.localService ? 'â— Activo en Tienda' : 'â—‹ Pausado / Desactivado'}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Detalles de entrega local (opcional):
                            </label>
                            <input
                              type="text"
                              value={activeServiceStatus.localDetails || ''}
                              onChange={(e) => setBusinessSettings({
                                ...businessSettings,
                                serviceStatus: {
                                  ...activeServiceStatus,
                                  localDetails: e.target.value
                                }
                              })}
                              onBlur={(e) => handleUpdateServiceStatus({ localDetails: e.target.value })}
                              placeholder="Ej. Entregas en taller o punto acordado en zona metropolitana"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. SERVICIO NACIONAL */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        activeServiceStatus.nationalService
                          ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                          : 'bg-gray-50/70 border-gray-200 opacity-80'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeServiceStatus.nationalService ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-500'
                            }`}>
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">
                                Servicio &amp; EnvÃ­os Nacionales
                              </div>
                              <div className="text-[10.5px] text-gray-500">
                                EnvÃ­os por paqueterÃ­a a toda la RepÃºblica Mexicana
                              </div>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleUpdateServiceStatus({ nationalService: !activeServiceStatus.nationalService })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                              activeServiceStatus.nationalService ? 'bg-[#2D4F3E]' : 'bg-gray-300'
                            }`}
                            title={activeServiceStatus.nationalService ? 'Desactivar servicio nacional' : 'Activar servicio nacional'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                activeServiceStatus.nationalService ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-gray-600">Estado en Tienda:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              activeServiceStatus.nationalService ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {activeServiceStatus.nationalService ? 'â— Activo en Tienda' : 'â—‹ Pausado / Desactivado'}
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                              Detalles de envÃ­o forÃ¡neo (opcional):
                            </label>
                            <input
                              type="text"
                              value={activeServiceStatus.nationalDetails || ''}
                              onChange={(e) => setBusinessSettings({
                                ...businessSettings,
                                serviceStatus: {
                                  ...activeServiceStatus,
                                  nationalDetails: e.target.value
                                }
                              })}
                              onBlur={(e) => handleUpdateServiceStatus({ nationalDetails: e.target.value })}
                              placeholder="Ej. EnvÃ­os con guÃ­a rastreable vÃ­a DHL, FedEx o Estafeta"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. MODO PAUSA TEMPORAL / NO HAY SERVICIO HASTA X DÃA */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      activeServiceStatus.isPaused
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-gray-50/60 border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            activeServiceStatus.isPaused ? 'bg-amber-500 text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                              <span>Modo SuspensiÃ³n Temporal de Taller</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                activeServiceStatus.isPaused ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {activeServiceStatus.isPaused ? 'â¸ï¸ TALLER EN PAUSA' : 'ðŸŸ¢ TALLER OPERANDO'}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Activa este interruptor cuando no haya servicio hasta cierta fecha (vacaciones, mantenimiento o saturaciÃ³n de pedidos).
                            </div>
                          </div>
                        </div>

                        {/* Switch de Pausa */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <span className="text-xs font-bold text-gray-700">
                            {activeServiceStatus.isPaused ? 'Pausa Activada' : 'Pausar Taller'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateServiceStatus({ isPaused: !activeServiceStatus.isPaused })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                              activeServiceStatus.isPaused ? 'bg-amber-600' : 'bg-gray-300'
                            }`}
                            title={activeServiceStatus.isPaused ? 'Reanudar taller' : 'Pausar servicio de taller'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                activeServiceStatus.isPaused ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Campos condicionales cuando la pausa estÃ¡ activa */}
                      <div className={`mt-4 space-y-4 text-xs ${!activeServiceStatus.isPaused ? 'opacity-60 pointer-events-none' : ''}`}>
                        
                        {/* Selector de Fecha */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              ðŸ“… No hay servicio hasta el dÃ­a:
                            </label>
                            <input
                              type="date"
                              value={activeServiceStatus.pausedUntilDate || ''}
                              onChange={(e) => handleUpdateServiceStatus({ pausedUntilDate: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-[#1F2421] focus:ring-1 focus:ring-[#2D4F3E]"
                            />
                            {activeServiceStatus.pausedUntilDate && (
                              <p className="text-[11px] font-bold text-[#9E472A] mt-1">
                                ReanudaciÃ³n: {formatServiceDate(activeServiceStatus.pausedUntilDate)}
                              </p>
                            )}
                          </div>

                          {/* Accesos RÃ¡pidos de Fecha */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">
                              Atajos rÃ¡pidos de fecha:
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {[
                                { label: '+2 dÃ­as', fn: () => getDatePlusDays(2) },
                                { label: '+3 dÃ­as', fn: () => getDatePlusDays(3) },
                                { label: '+1 semana', fn: () => getDatePlusDays(7) },
                                { label: 'PrÃ³ximo lunes', fn: () => getNextMondayDate() },
                                { label: 'Primer dÃ­a prÃ³ximo mes', fn: () => getNextMonthFirstDay() }
                              ].map((btn, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleUpdateServiceStatus({ pausedUntilDate: btn.fn() })}
                                  className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-[11px] cursor-pointer shadow-2xs"
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Motivo de la Pausa con botones rÃ¡pidos */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-gray-700">
                            Motivo principal del receso:
                          </label>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              { id: 'vacaciones', label: 'ðŸ–ï¸ Vacaciones de taller' },
                              { id: 'mantenimiento', label: 'ðŸ”§ Mantenimiento preventivo de maquinaria' },
                              { id: 'surtido', label: 'ðŸ“¦ Resurtido de filamentos y materias primas' },
                              { id: 'saturacion', label: 'âš¡ SaturaciÃ³n de pedidos / Cupo completo' }
                            ].map(preset => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  const reasonText = preset.label;
                                  const dateText = activeServiceStatus.pausedUntilDate
                                    ? `el ${formatServiceDate(activeServiceStatus.pausedUntilDate)}`
                                    : 'prÃ³ximamente';
                                  const customMsg = `Aviso de taller: Estamos en periodo de ${preset.label.slice(2).toLowerCase()}. No hay servicio de producciÃ³n ni entregas hasta ${dateText}. Puedes dejar tu cotizaciÃ³n y se agendarÃ¡ por orden de llegada.`;
                                  handleUpdateServiceStatus({
                                    pausedReason: reasonText,
                                    pausedCustomMessage: customMsg
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                  activeServiceStatus.pausedReason === preset.label
                                    ? 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold shadow-2xs'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mensaje pÃºblico personalizado para clientes */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Mensaje pÃºblico visible en el banner de la tienda y cotizador:
                          </label>
                          <textarea
                            rows={2}
                            value={activeServiceStatus.pausedCustomMessage || ''}
                            onChange={(e) => setBusinessSettings({
                              ...businessSettings,
                              serviceStatus: {
                                ...activeServiceStatus,
                                pausedCustomMessage: e.target.value
                              }
                            })}
                            onBlur={(e) => handleUpdateServiceStatus({ pausedCustomMessage: e.target.value })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                            placeholder="Describe el aviso que verÃ¡n los clientes en la tienda..."
                          />
                        </div>

                        {/* Vista previa en vivo del banner */}
                        {activeServiceStatus.isPaused && (
                          <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-black text-amber-800 block">
                              Vista Previa de cÃ³mo lo verÃ¡n tus clientes en la tienda:
                            </span>
                            <div className="font-bold flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>
                                â¸ï¸ Aviso del Taller: No hay servicio hasta el {formatServiceDate(activeServiceStatus.pausedUntilDate) || '[Fecha seleccionada]'}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-900">
                              {activeServiceStatus.pausedCustomMessage || 'Reanudamos servicio en esa fecha. Las cotizaciones se agendan en orden de llegada.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business info form */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E4DA] space-y-4">
                    <h4 className="text-sm font-bold text-[#1F2421] font-heading">
                      ConfiguraciÃ³n de Contacto & CotizaciÃ³n
                    </h4>
                    {businessSettings && (
                      <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            WhatsApp del Negocio (con lada de paÃ­s) *
                          </label>
                          <input
                            type="text"
                            value={businessSettings.whatsappNumber || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, whatsappNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                            placeholder="5215500000000"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            A este nÃºmero llegarÃ¡n todos los mensajes automÃ¡ticos preparados por los clientes.
                          </p>
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Correo ElectrÃ³nico
                          </label>
                          <input
                            type="email"
                            value={businessSettings.businessEmail || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, businessEmail: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Zona de Servicio / Cobertura
                          </label>
                          <input
                            type="text"
                            value={businessSettings.serviceZone || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, serviceZone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Horario de AtenciÃ³n
                          </label>
                          <input
                            type="text"
                            value={businessSettings.businessHours || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, businessHours: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-gray-700 block mb-1">
                            Nota fija de cotizaciÃ³n
                          </label>
                          <textarea
                            rows={2}
                            value={businessSettings.quoteNoteDefault || ''}
                            onChange={e => setBusinessSettings({ ...businessSettings, quoteNoteDefault: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C]"
                        >
                          Guardar ConfiguraciÃ³n
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Security / Password form */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E4DA] space-y-4">
                    <h4 className="text-sm font-bold text-[#1F2421] font-heading flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Cambio de ContraseÃ±a de Administrador</span>
                    </h4>

                    {passwordMsg.text && (
                      <div className={`p-3 rounded-xl text-xs font-medium ${
                        passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {passwordMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          ContraseÃ±a Actual
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-gray-700 block mb-1">
                          Nueva ContraseÃ±a (mÃ­nimo 12 caracteres)
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          minLength={12}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F3E]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
                      >
                        Actualizar ContraseÃ±a
                      </button>
                    </form>
                  </div>

                  {/* CARD DE GESTIÃ“N: FOTOGRAFÃAS DE FONDO EN TARJETAS DE DISEÃ‘O E INDUSTRIA */}
                  <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DA] shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-[#1F2421] font-heading">
                              Fotos de Fondo en Tarjetas (DiseÃ±o e Industria)
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              businessSettings?.showCategoryBackgroundPhotos
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {businessSettings?.showCategoryBackgroundPhotos ? 'â— Fotos Activadas' : 'â—‹ Desactivadas por defecto (Modo Oscuro)'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Decide si deseas mostrar imÃ¡genes con desenfoque detrÃ¡s de las tarjetas o mantener el estilo oscuro minimalista de alta definiciÃ³n. TambiÃ©n puedes personalizar o sustituir las fotos de cada tarjeta.
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const newStatus = !businessSettings?.showCategoryBackgroundPhotos;
                            const updated = {
                              ...businessSettings,
                              showCategoryBackgroundPhotos: newStatus
                            };
                            setBusinessSettings(updated);
                            try {
                              await fetch('/api/admin/settings', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify(updated)
                              });
                            } catch (e) {}
                            localStorage.setItem('artesano_settings_cache', JSON.stringify(updated));
                            setServiceStatusMsg({
                              text: newStatus ? 'Fotos de fondo activadas en la tienda.' : 'Fotos de fondo desactivadas (Modo oscuro activo).',
                              type: 'success'
                            });
                            setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 3500);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                            businessSettings?.showCategoryBackgroundPhotos ? 'bg-[#2D4F3E]' : 'bg-gray-300'
                          }`}
                          title="Activar o desactivar fotos de fondo"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              businessSettings?.showCategoryBackgroundPhotos ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Editor de FotografÃ­as (Tarjetas de DiseÃ±o e Industria) */}
                    <div className="space-y-6">
                      {/* 1. SECTOR DISEÃ‘O & PUBLICIDAD */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <Palette className="w-4 h-4 text-amber-600" />
                            <span>Tarjetas de DiseÃ±o & Publicidad (4 Secciones)</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">BRAND-01, PRINT-02, DEV-03, EDIT-04</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { key: 'branding', label: 'BRAND-01: Identidad & Marca', defaultUrl: './portafolio/assets/artesano-cover.webp' },
                            { key: 'publicidad', label: 'PRINT-02: Lonas & Gran Formato', defaultUrl: './portafolio/assets/civil-shirts.webp' },
                            { key: 'web', label: 'DEV-03: Web & Tienda', defaultUrl: './interfaces/assets/ui-01.jpg' },
                            { key: 'editorial', label: 'EDIT-04: CatÃ¡logos & Redes', defaultUrl: './portafolio/assets/popol-spread.webp' }
                          ].map(card => {
                            const currentVal = businessSettings?.categoryBackgroundPhotos?.diseno?.[card.key] ?? card.defaultUrl;
                            return (
                              <div key={card.key} className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2">
                                <div className="text-[11px] font-bold text-gray-800 truncate" title={card.label}>
                                  {card.label}
                                </div>
                                <div className="w-full h-20 rounded-lg overflow-hidden bg-black/80 relative border border-gray-200">
                                  <img loading="lazy"
                                    src={currentVal}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = card.defaultUrl; }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9.5px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                    Ruta o URL de la foto:
                                  </label>
                                  <input
                                    type="text"
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updated = {
                                        ...businessSettings,
                                        categoryBackgroundPhotos: {
                                          ...(businessSettings?.categoryBackgroundPhotos || {}),
                                          diseno: {
                                            ...((businessSettings?.categoryBackgroundPhotos?.diseno) || {}),
                                            [card.key]: val
                                          }
                                        }
                                      };
                                      setBusinessSettings(updated);
                                    }}
                                    placeholder="./uploads/tu_foto.jpg"
                                    className="w-full px-2 py-1 text-[11px] rounded border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. SECTOR INDUSTRIA & MANUFACTURA */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                            <Wrench className="w-4 h-4 text-sky-600" />
                            <span>Tarjetas de Industria & Manufactura (4 Soluciones)</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">PROTO-01, JIG-02, SPARE-03, BATCH-04</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { key: 'proto', label: 'PROTO-01: Prototipos funcionales', defaultUrl: './uploads/catalog-v2-ind1-context-oficial.webp' },
                            { key: 'jig', label: 'JIG-02: Utillaje y herramentales', defaultUrl: './uploads/catalog-v2-ind2-context-oficial.webp' },
                            { key: 'spare', label: 'SPARE-03: Refacciones y obsoletos', defaultUrl: './uploads/industria_portada_oficial_ingenieria.webp' },
                            { key: 'batch', label: 'BATCH-04: Lotes Cortos y Preseries', defaultUrl: './uploads/catalog-v2-ind1-detail-oficial.webp' }
                          ].map(card => {
                            const currentVal = businessSettings?.categoryBackgroundPhotos?.industria?.[card.key] ?? card.defaultUrl;
                            return (
                              <div key={card.key} className="p-3 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2">
                                <div className="text-[11px] font-bold text-gray-800 truncate" title={card.label}>
                                  {card.label}
                                </div>
                                <div className="w-full h-20 rounded-lg overflow-hidden bg-black/80 relative border border-gray-200">
                                  <img loading="lazy"
                                    src={currentVal}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = card.defaultUrl; }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9.5px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                    Ruta o URL de la foto:
                                  </label>
                                  <input
                                    type="text"
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updated = {
                                        ...businessSettings,
                                        categoryBackgroundPhotos: {
                                          ...(businessSettings?.categoryBackgroundPhotos || {}),
                                          industria: {
                                            ...((businessSettings?.categoryBackgroundPhotos?.industria) || {}),
                                            [card.key]: val
                                          }
                                        }
                                      };
                                      setBusinessSettings(updated);
                                    }}
                                    placeholder="./uploads/tu_foto.jpg"
                                    className="w-full px-2 py-1 text-[11px] rounded border border-gray-300 bg-white focus:outline-none focus:border-[#2D4F3E]"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Botones de acciÃ³n */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...businessSettings,
                              categoryBackgroundPhotos: {
                                diseno: {
                                  branding: './portafolio/assets/artesano-cover.webp',
                                  publicidad: './portafolio/assets/civil-shirts.webp',
                                  web: './interfaces/assets/ui-01.jpg',
                                  editorial: './portafolio/assets/popol-spread.webp'
                                },
                                industria: {
                                  proto: './uploads/catalog-v2-ind1-context-oficial.webp',
                                  jig: './uploads/catalog-v2-ind2-context-oficial.webp',
                                  spare: './uploads/industria_portada_oficial_ingenieria.webp',
                                  batch: './uploads/catalog-v2-ind1-detail-oficial.webp'
                                }
                              }
                            };
                            setBusinessSettings(updated);
                            setServiceStatusMsg({ text: 'Rutas restauradas a valores predeterminados.', type: 'success' });
                            setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 3000);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                        >
                          Restablecer Rutas Predeterminadas
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await fetch('/api/admin/settings', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify(businessSettings)
                              });
                            } catch (e) {}
                            localStorage.setItem('artesano_settings_cache', JSON.stringify(businessSettings));
                            setServiceStatusMsg({ text: 'ConfiguraciÃ³n y fotos guardadas exitosamente.', type: 'success' });
                            setTimeout(() => setServiceStatusMsg({ text: '', type: '' }), 4000);
                          }}
                          className="px-5 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar Fotos y Preferencias</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

      </div>
    </div>

      {/* FULL PRODUCT & PACKAGE EDITOR MODAL (Top-Level Viewport Overlay z-[70]) */}
      {isEditorOpen && editorForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-6xl max-h-[94vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E8E4DA]"
            onClick={e => e.stopPropagation()}
          >
            {/* Editor Header */}
            <div className="px-5 py-3.5 bg-[#FBF9F5] border-b border-[#E8E4DA] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 rounded-xl bg-[#2D4F3E] text-white shrink-0">
                  <Package className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1F2421] font-heading truncate">
                      {editingProduct
                        ? (editorForm.isBundle ? `Editar Paquete: ${editorForm.name || 'Combo'}` : `Editar Producto: ${editorForm.name || 'Producto'}`)
                        : (editorForm.isBundle ? 'Crear Nuevo Paquete / Combo' : 'Crear Nuevo Producto')}
                    </h3>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-[#2D4F3E]/10 text-[#2D4F3E] border border-[#2D4F3E]/20 shrink-0">
                      {editorForm.code || editorForm.sku || 'NUEVO-PRODUCTO'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {editorForm.name || 'Sin tÃ­tulo especificado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                  editorForm.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {editorForm.status === 'published' ? 'â— Publicado en Tienda' : 'â—‹ En Borrador'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TABS DE NAVEGACIÃ“N UX ERGONÃ“MICOS (MÃ³vil y Escritorio) */}
            <div className="bg-[#FAF9F5] border-b border-[#E8E4DA] px-3 sm:px-5 py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => setEditorActiveTab('general')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  editorActiveTab === 'general'
                    ? 'bg-[#2D4F3E] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>ðŸ“‹</span>
                <span>1. Datos &amp; GalerÃ­a</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('taller')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  editorActiveTab === 'taller'
                    ? 'bg-[#2D4F3E] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>ðŸªµ</span>
                <span>2. Taller &amp; Insumos (Escandallo)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  editorActiveTab === 'taller' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {(editorForm.manufacturingRecipe?.items || []).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('packaging')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  editorActiveTab === 'packaging'
                    ? 'bg-[#2D4F3E] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>ðŸ“¦</span>
                <span>3. Embalaje &amp; Flete Nacional</span>
                {editorForm.manufacturingRecipe?.packagingAndShipping?.enabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('pricing')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  editorActiveTab === 'pricing'
                    ? 'bg-[#2D4F3E] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>ðŸ’°</span>
                <span>4. Precios, Margen &amp; Descuentos</span>
                {editorForm.price && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    editorActiveTab === 'pricing' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
                  }`}>
                    ${editorForm.price}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('repo')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  editorActiveTab === 'repo'
                    ? 'bg-[#2D4F3E] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>5. Repositorio &amp; FabricaciÃ³n</span>
                {(editorForm.repository?.makerworldUrl || editorForm.makerWorldModel || editorForm.repository?.localPath) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Formulario ErgonÃ³mico por PestaÃ±as */}
            <form onSubmit={handleSaveProduct} noValidate className="flex-1 overflow-y-auto flex flex-col">
              
              {editorMessage.text && (
                <div className={`mx-4 sm:mx-6 mt-4 p-3 rounded-xl font-medium text-xs ${
                  editorMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {editorMessage.text}
                </div>
              )}

              {/* ======================================================== */}
              {/* PESTAÃ‘A 1: DATOS GENERALES, FOTOS Y VARIANTES            */}
              {/* ======================================================== */}
              {editorActiveTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6">
                  
                  {/* COLUMNA IZQUIERDA: VISOR FOTOGRÃFICO Y MINIATURAS (5 col) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    
                    {/* Visor Grande de la FotografÃ­a Activa */}
                    {(() => {
                      let activeImgUrl = '';
                      let slotName = 'ðŸŒ¿ Toma 1 â€¢ Portada en Ambiente Real';
                      let slotKey = 'portada';

                      if (editorActiveSlot === 0) {
                        activeImgUrl = editorForm.primaryImage || editorForm.gallery?.[0] || '';
                        slotName = 'ðŸŒ¿ Toma 1 â€¢ En Ambiente Real';
                        slotKey = 'portada';
                      } else if (editorActiveSlot === 1) {
                        activeImgUrl = editorForm.whiteBgImage || editorForm.gallery?.[1] || '';
                        slotName = 'ðŸ“¦ Toma 2 â€¢ Fondo Blanco Puro (#FFFFFF)';
                        slotKey = 'blanco';
                      } else if (editorActiveSlot === 2) {
                        activeImgUrl = editorForm.detailImage || editorForm.gallery?.[2] || '';
                        slotName = 'ðŸ” Toma 3 â€¢ Detalle y Macro';
                        slotKey = 'detalle';
                      } else if (editorActiveSlot === 3) {
                        activeImgUrl = editorForm.measureImage || editorForm.gallery?.[3] || '';
                        slotName = 'ðŸ“ Toma 4 â€¢ Medidas y Escala';
                        slotKey = 'escala';
                      } else {
                        activeImgUrl = editorForm.gallery?.[editorActiveSlot] || '';
                        slotName = `âœ¨ Toma Adicional #${editorActiveSlot + 1}`;
                        slotKey = editorActiveSlot;
                      }

                      const fallbackImg = '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg';

                      return (
                        <div className="space-y-3">
                          <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200 bg-stone-100 aspect-square shadow-md group flex items-center justify-center">
                            <ImageOptimized loading="lazy"
                              src={activeImgUrl || fallbackImg}
                              alt="FotografÃ­a activa del producto"
                              className="w-full h-full object-contain p-2 bg-white"
                            />

                            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold shadow-sm pointer-events-none flex items-center gap-1.5">
                              <span>{slotName}</span>
                            </div>

                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                              <label className="px-3.5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center gap-1.5 active:scale-95">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingImage === slotKey ? 'Subiendo...' : 'Subir foto'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleUploadSlot(slotKey, e)}
                                  disabled={uploadingImage === slotKey}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-200">
                            <span className="text-[10px] font-bold text-stone-500 uppercase shrink-0">Ruta:</span>
                            <input
                              type="text"
                              value={activeImgUrl}
                              onChange={e => handleUpdateSlotUrl(slotKey, e.target.value)}
                              placeholder="/uploads/... o https://..."
                              className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-gray-200 bg-white"
                            />
                            {activeImgUrl && (
                              <button
                                type="button"
                                onClick={() => handleUpdateSlotUrl(slotKey, '')}
                                className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                                title="Limpiar imagen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* BotÃ³n para abrir Estudio FotogrÃ¡fico IA */}
                    <button
                      type="button"
                      onClick={() => handleOpenPhotoStudio(editingProduct?.id || 'new')}
                      className="w-full py-3 px-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/20 transition active:scale-98 cursor-pointer touch-manipulation"
                    >
                      <Camera className="w-4 h-4 text-slate-950" />
                      <span>ðŸ“¸ Generar las 4 Fotos con IA (Frente, Arriba, Costado, Detalle)</span>
                    </button>

                    {/* 4 Miniaturas TÃ¡ctiles del EstÃ¡ndar Oficial */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>EstÃ¡ndar Oficial de 4 FotografÃ­as:</span>
                        <span className="text-[10px] text-gray-400">Toca para ver</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { idx: 0, key: 'portada', label: '1. Portada Real', shortLabel: 'En contexto', icon: 'ðŸŒ¿', src: editorForm.primaryImage || editorForm.gallery?.[0] },
                          { idx: 1, key: 'blanco', label: '2. Fondo Blanco', shortLabel: 'Fondo blanco', icon: 'ðŸ“„', src: editorForm.whiteBgImage || editorForm.gallery?.[1] },
                          { idx: 2, key: 'detalle', label: '3. Detalle Macro', shortLabel: 'Detalle', icon: 'ðŸ”', src: editorForm.detailImage || editorForm.gallery?.[2] },
                          { idx: 3, key: 'escala', label: '4. Medidas y Escala', shortLabel: 'Medidas', icon: 'ðŸ“', src: editorForm.measureImage || editorForm.gallery?.[3] }
                        ].map(slot => {
                          const isSelected = editorActiveSlot === slot.idx;
                          const hasImg = Boolean(slot.src);
                          return (
                            <div key={slot.idx} className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => setEditorActiveSlot(slot.idx)}
                                className={`p-1.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 text-center relative w-full ${
                                  isSelected
                                    ? 'border-[#2D4F3E] bg-[#FAF9F5] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                                    : 'border-stone-200 bg-white hover:border-stone-300'
                                }`}
                              >
                                <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-100">
                                  {hasImg ? (
                                    <ImageOptimized loading="lazy" src={slot.src} alt={slot.label} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-sm opacity-50">{slot.icon}</span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-bold line-clamp-1 ${
                                  isSelected ? 'text-[#2D4F3E]' : 'text-gray-600'
                                }`}>
                                  {slot.shortLabel}
                                </span>
                                {hasImg && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 border border-white" />
                                )}
                              </button>

                              <label className="text-[9.5px] font-semibold text-center text-[#2D4F3E] hover:underline cursor-pointer block truncate">
                                <span>Subir</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => handleUploadSlot(slot.key, e)}
                                  disabled={uploadingImage === slot.key}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FotografÃ­as adicionales ilimitadas */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">
                          Fotos Adicionales Ilimitadas (Kits / Combos):
                        </span>
                        <button
                          type="button"
                          onClick={handleAddExtraImage}
                          className="px-2.5 py-1 rounded-lg bg-[#2D4F3E] text-white text-[11px] font-bold hover:bg-[#20392C] transition-colors cursor-pointer"
                        >
                          + Agregar foto
                        </button>
                      </div>

                      {editorForm.gallery && editorForm.gallery.length > 4 ? (
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {editorForm.gallery.slice(4).map((extraUrl, idx) => {
                            const actualIndex = 4 + idx;
                            return (
                              <div
                                key={actualIndex}
                                onClick={() => setEditorActiveSlot(actualIndex)}
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${
                                  editorActiveSlot === actualIndex ? 'border-[#2D4F3E] ring-2 ring-[#2D4F3E]/20' : 'border-stone-200'
                                }`}
                              >
                                <ImageOptimized loading="lazy" src={extraUrl || '/uploads/bandeja_vaciabolsillos_ovalada_white.jpg'} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveExtraImage(actualIndex); }}
                                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-rose-600 text-white cursor-pointer"
                                  title="Eliminar foto adicional"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">
                          Solo tiene las 4 fotos base. Pulsa "+ Agregar foto" para sumar mÃ¡s tomas de este paquete o servicio.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: CAMPOS ESENCIALES DEL PRODUCTO (7 col) */}
                  <div className="lg:col-span-7 flex flex-col gap-4 text-xs">
                    
                    {/* Nombre y PublicaciÃ³n */}
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-3">
                      <div>
                        <label className="font-bold text-gray-800 block mb-1 text-xs">Nombre del Producto o Paquete *</label>
                        <input
                          type="text"
                          required
                          value={editorForm.name}
                          onChange={e => setEditorForm({ ...editorForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-bold text-sm text-gray-900 bg-white focus:ring-1 focus:ring-[#2D4F3E]"
                          placeholder="Ej. Colgador de llaves Bienvenidos con percheros de madera"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1 text-[11px]">Estado de PublicaciÃ³n en Tienda</label>
                          <select
                            value={editorForm.status}
                            onChange={e => setEditorForm({ ...editorForm, status: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold"
                          >
                            <option value="published">ðŸŸ¢ Publicado (visible en tienda)</option>
                            <option value="draft">ðŸŸ¡ Borrador (oculto en tienda)</option>
                            <option value="archived">âšª Archivado</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-3 sm:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 select-none">
                            <input
                              type="checkbox"
                              checked={!!editorForm.featured}
                              onChange={e => setEditorForm({ ...editorForm, featured: e.target.checked })}
                              className="w-4 h-4 rounded text-[#2D4F3E] focus:ring-0 cursor-pointer"
                            />
                            <span>â­ Destacar en Inicio &amp; CatÃ¡logo Principal</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900 select-none bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                            <input
                              type="checkbox"
                              checked={!!editorForm.isBundle}
                              onChange={e => {
                                const checked = e.target.checked;
                                const worlds = editorForm.worlds || [];
                                const newWorlds = checked
                                  ? (worlds.includes('paquetes') ? worlds : [...worlds, 'paquetes'])
                                  : worlds;
                                setEditorForm({
                                  ...editorForm,
                                  isBundle: checked,
                                  worlds: newWorlds,
                                  priceUnit: checked ? 'combo' : (editorForm.priceUnit === 'combo' ? 'pieza' : editorForm.priceUnit)
                                });
                              }}
                              className="w-4 h-4 rounded text-purple-700 focus:ring-0 cursor-pointer"
                            />
                            <span>ðŸŽ Es un Paquete o Combo Promocional</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Delimitador de Ãreas de ActivaciÃ³n y TÃ©cnicas */}
                    <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#1F2421] text-xs uppercase tracking-wider font-heading flex items-center gap-1.5">
                          <span>ðŸ·ï¸</span>
                          <span>Ãreas del CatÃ¡logo donde se exhibirÃ¡ *</span>
                        </label>
                        <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                          {(editorForm.worlds?.length || 0)} de 8 Ã¡reas activadas
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'hogar', label: 'Hogar', icon: 'ðŸ ' },
                          { id: 'negocios', label: 'Negocios', icon: 'ðŸ’¼' },
                          { id: 'juguetes', label: 'Juguetes', icon: 'ðŸ§¸' },
                          { id: 'personalizados', label: 'Personalizados', icon: 'âœ¨' },
                          { id: 'eventos', label: 'Eventos', icon: 'ðŸŽ‰' },
                          { id: 'paquetes', label: 'Paquetes', icon: 'ðŸŽ' },
                          { id: 'industria', label: 'Industria', icon: 'âš™ï¸' },
                          { id: 'publicidad-desarrollo', label: 'DiseÃ±o & Pub.', icon: 'ðŸŽ¨' }
                        ].map(w => {
                          const isChecked = editorForm.worlds?.includes(w.id);
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => {
                                const curr = editorForm.worlds || [];
                                const updated = isChecked ? curr.filter(x => x !== w.id) : [...curr, w.id];
                                setEditorForm({
                                  ...editorForm,
                                  worlds: updated,
                                  isBundle: updated.includes('paquetes') ? true : editorForm.isBundle
                                });
                              }}
                              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                                isChecked
                                  ? 'bg-white border-[#2D4F3E] text-[#2D4F3E] ring-1 ring-[#2D4F3E]/20 shadow-xs'
                                  : 'bg-stone-50 border-stone-200 text-gray-500 hover:bg-white'
                              }`}
                            >
                              <span className="font-bold text-xs flex items-center gap-1">
                                <span>{w.icon}</span>
                                <span>{w.label}</span>
                              </span>
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black ${
                                isChecked ? 'bg-[#2D4F3E] text-white' : 'border border-gray-300'
                              }`}>
                                {isChecked && 'âœ“'}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* TÃ©cnicas de FabricaciÃ³n Combinables */}
                      <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">TÃ©cnicas:</span>
                        {[
                          { id: '3d', label: 'ImpresiÃ³n 3D' },
                          { id: 'laser', label: 'Corte/Grabado LÃ¡ser' },
                          { id: 'sublimation', label: 'SublimaciÃ³n' },
                          { id: 'vinyl', label: 'Vinil Textil/Corte' },
                          { id: 'impresion_laser', label: 'Impresi?n L?ser / Tinta (Invitaciones)' },
                          { id: 'dtf', label: 'DTF Textil' },
                          { id: 'ensamble', label: 'Armado/Pegado' },
                          { id: 'nfc', label: 'NFC' }
                        ].map(tech => {
                          const isChecked = editorForm.techniques?.includes(tech.id);
                          return (
                            <button
                              key={tech.id}
                              type="button"
                              onClick={() => {
                                const curr = editorForm.techniques || [];
                                const updated = isChecked ? curr.filter(x => x !== tech.id) : [...curr, tech.id];
                                setEditorForm({ ...editorForm, techniques: updated });
                              }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-stone-200 text-gray-500 hover:border-stone-300'
                              }`}
                            >
                              {isChecked ? 'âœ“ ' : '+ '}
                              {tech.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Descripciones Breve y Completa */}
                    <div className="space-y-2">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-[11px]">DescripciÃ³n Breve (1 lÃ­nea para catÃ¡logo)</label>
                        <input
                          type="text"
                          value={editorForm.shortDescription || ''}
                          onChange={e => setEditorForm({ ...editorForm, shortDescription: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                          placeholder="Resumen atractivo en una lÃ­nea..."
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-[11px]">DescripciÃ³n Completa (para la ficha tÃ©cnica del producto)</label>
                        <textarea
                          rows={2}
                          value={editorForm.fullDescription || ''}
                          onChange={e => setEditorForm({ ...editorForm, fullDescription: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                          placeholder="Detalles sobre maderas, acabados, resistencia y personalizaciÃ³n..."
                        />
                      </div>
                    </div>

                    {/* Medidas y Tiempos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-1 text-[11px]">Medidas / Dimensiones (cm)</label>
                        <input
                          type="text"
                          value={editorForm.specifications?.dimensions || ''}
                          onChange={e => setEditorForm({
                            ...editorForm,
                            specifications: { ...editorForm.specifications, dimensions: e.target.value }
                          })}
                          placeholder="Ej: 28 x 14 x 1.8 cm"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-gray-700 block mb-1 text-[11px]">Tiempo de FabricaciÃ³n Estimado</label>
                        <input
                          type="text"
                          value={editorForm.specifications?.estimatedLeadTime || ''}
                          onChange={e => setEditorForm({
                            ...editorForm,
                            specifications: { ...editorForm.specifications, estimatedLeadTime: e.target.value }
                          })}
                          placeholder="Ej: 2 a 3 dÃ­as hÃ¡biles"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Paleta de Colores, Barnices y Acabados */}
                    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
                      <div
                        onClick={() => setEditorColorsAccordion(prev => !prev)}
                        className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-purple-600" />
                          <div>
                            <h5 className="font-heading font-bold text-xs text-[#1F2421]">
                              Tintes, Barnices y Colores de Acabado ({getColorVariant()?.options?.length || 0} asignados)
                            </h5>
                            <span className="text-[10.5px] text-gray-500">
                              Paleta elegible por el cliente (barnices para madera: Nogal, Roble, Azul, Verde, etc.)
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editorColorsAccordion ? 'rotate-180' : ''}`} />
                      </div>

                      {editorColorsAccordion && (
                        <div className="p-3.5 pt-0 border-t border-stone-100 space-y-3">
                          {/* Colores Activos */}
                          {(() => {
                            const colorVar = getColorVariant();
                            const currentColors = colorVar?.options || [];
                            return (
                              <div className="space-y-1.5 pt-2">
                                <span className="text-[10px] font-bold text-gray-600 uppercase block">Opciones asignadas actualmente ({colorVar?.name || 'Color'}):</span>
                                {currentColors.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-stone-50 border border-stone-200">
                                    {currentColors.map(color => {
                                      const sw = getFilamentColor(color);
                                      return (
                                        <span
                                          key={color}
                                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-stone-200 text-[11px] font-semibold text-gray-800 shadow-2xs"
                                        >
                                          <span
                                            className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                            style={{ background: sw?.css || '#D1D5DB' }}
                                          />
                                          <span>{color}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveColorOption(color)}
                                            className="text-gray-400 hover:text-rose-600 font-bold ml-0.5 cursor-pointer"
                                          >
                                            Ã—
                                          </button>
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-gray-400 italic">Sin colores o acabados asignados.</p>
                                )}
                              </div>
                            );
                          })()}

                          {/* Paleta RÃ¡pida de Tintes y Barnices para Madera */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                              <span>ðŸªµ</span>
                              <span>Tintes &amp; Barnices para Madera (LÃ¡ser y CarpinterÃ­a):</span>
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-50/60 rounded-xl border border-amber-200/70">
                              {STANDARD_WOOD_VARNISHES.map(varnish => {
                                const colorVar = getColorVariant();
                                const isSelected = (colorVar?.options || []).some(opt => opt.toLowerCase() === varnish.toLowerCase());
                                const sw = getFilamentColor(varnish);
                                return (
                                  <button
                                    key={varnish}
                                    type="button"
                                    onClick={() => handleToggleColorOption(varnish, 'Tono de Barniz y Acabado')}
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer shadow-2xs ${
                                      isSelected 
                                        ? 'bg-amber-900 text-white ring-2 ring-amber-700 ring-offset-1 scale-102' 
                                        : 'bg-white text-stone-800 border border-amber-200/90 hover:bg-amber-100/50'
                                    }`}
                                    title={`Asignar ${varnish}`}
                                  >
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                      style={{ background: sw?.css || '#A27B5C' }}
                                    />
                                    <span>{varnish}</span>
                                    {isSelected && <span className="font-black text-amber-200 text-xs leading-none">âœ“</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Paleta RÃ¡pida de Filamentos PLA y PolÃ­meros */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block">ðŸ–¨ï¸ Paleta de filamentos 3D (PLA / PETG):</span>
                            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                              {STANDARD_PALETTE_COLORS.map(color => {
                                const colorVar = getColorVariant();
                                const isSelected = (colorVar?.options || []).some(opt => opt.toLowerCase() === color.toLowerCase());
                                const sw = getFilamentColor(color);
                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleToggleColorOption(color, 'Color')}
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-2xs ${
                                      isSelected ? 'ring-2 ring-[#2D4F3E] ring-offset-1 scale-105' : 'border-black/20'
                                    }`}
                                    style={{ background: sw?.css || '#D1D5DB' }}
                                    title={color}
                                  >
                                    {isSelected && <span className="text-[9px] font-black text-white drop-shadow-sm">âœ“</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Agregar color libre */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customColorInput}
                              onChange={e => setCustomColorInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomColor(customColorInput);
                                }
                              }}
                              placeholder="Escribe otro color o acabado personalizado..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomColor(customColorInput)}
                              className="px-3 py-1.5 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold hover:bg-[#20392C] transition-colors cursor-pointer"
                            >
                              + Agregar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NAVEGACIÃ“N UX INFERIOR PESTAÃ‘A 1 */}
                    <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
                      <span className="text-[11px] text-gray-500">
                        Paso 1 de 4: InformaciÃ³n comercial y fotos de catÃ¡logo
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditorActiveTab('pricing')}
                          className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          ðŸ’° Ir a Precios &amp; Margen
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorActiveTab('taller')}
                          className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <span>Continuar a: 2. Taller &amp; Insumos ðŸªµ</span>
                          <span>âž¡ï¸</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* PESTAÃ‘A 2: TALLER & INSUMOS (ESCANDALLO DIRECTO/INDIRECTO)*/}
              {/* ======================================================== */}
              {/* PESTA?A 2: TALLER, INSUMOS Y PRODUCTOS VINCULADOS */}
              {editorActiveTab === 'taller' && (
                <ProductWorkshopTab
                  editorForm={editorForm}
                  setEditorForm={setEditorForm}
                  rawMaterialsList={rawMaterialsList}
                  products={products}
                  workshopParams={workshopParams}
                  onToggleTechnique={handleToggleProductTechnique}
                  onSetSupplyType={handleSetItemSupplyType}
                  onRemoveItem={handleRemoveEditorRecipeItem}
                  onUpdateItem={handleUpdateEditorRecipeItem}
                  onUpdateRecipeField={handleUpdateRecipeField}
                  onSyncCost={handleSyncRecipeToCostPrice}
                  onSimulateProduction={handleSimulateProduction}
                  onDeductStockNow={handleDeductStockNow}
                  onNavigate={setEditorActiveTab}
                  editorMessage={editorMessage}
                />
              )}

              {/* ======================================================== */}
              {editorActiveTab === 'packaging' && (() => {
                const pkg = editorForm.manufacturingRecipe?.packagingAndShipping || {
                  enabled: true,
                  boxType: 'caja_mediana',
                  boxCost: 12,
                  bubbleWrapCost: 3.5,
                  cushioningCost: 2.5,
                  labelTapeCost: 2,
                  packagingCost: 20,
                  shippingCarrier: 'nacional_estandar',
                  shippingCost: 149,
                  includeShippingInPrice: false,
                  notes: ''
                };

                const packagingTotal = Number(pkg.packagingCost) || 0;
                const shippingTotal = Number(pkg.shippingCost) || 0;
                const totalLogistica = packagingTotal + (pkg.includeShippingInPrice ? shippingTotal : 0);

                // Costo marginal de embalaje por pieza adicional en el mismo paquete
                const marginalExtraCost = 18; // Caja mayor o viruta extra

                return (
                  <div className="p-4 sm:p-6 space-y-5 text-xs">
                    
                    {/* Header de Resumen LogÃ­stico */}
                    <div className="p-3.5 bg-gradient-to-r from-purple-900 via-[#1C2721] to-[#141615] rounded-2xl text-white shadow-md border border-purple-800/50 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                          <Truck className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="font-heading font-black text-sm text-white">
                            Embalaje &amp; EnvÃ­o a Toda la RepÃºblica Mexicana
                          </h4>
                          <span className="text-[10.5px] text-gray-300">
                            CotizaciÃ³n exacta de cajas microcorrugadas, protecciones internas y flete nacional
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Total Empaque + Flete (1 pza):</span>
                          <span className="font-mono font-black text-base text-purple-200">
                            ${(packagingTotal + shippingTotal).toFixed(2)} MXN
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSyncRecipeToCostPrice}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Sincronizar costo total aterrizado al producto"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Sincronizar a Costo</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD 1: EMBALAJE Y EMPAQUE DE TALLER */}
                    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
                            <Package className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-xs text-gray-900">
                              Embalaje &amp; Protecciones de Taller
                            </h4>
                            <p className="text-[10.5px] text-gray-500">
                              Cajas de cartÃ³n microcorrugado, plÃ¡stico burbuja de alta densidad y relleno de viruta kraft.
                            </p>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 select-none">
                          <input
                            type="checkbox"
                            checked={!!pkg.enabled}
                            onChange={e => handleUpdatePackagingField('enabled', e.target.checked)}
                            className="w-4 h-4 rounded text-purple-700 cursor-pointer"
                          />
                          <span>Activar Costo de Embalaje</span>
                        </label>
                      </div>

                      {pkg.enabled && (
                        <div className="space-y-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Selector de Caja */}
                            <div>
                              <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                                Caja o PresentaciÃ³n de Empaque:
                              </label>
                              <select
                                value={pkg.boxType || 'caja_mediana'}
                                onChange={e => handleUpdatePackagingField('boxType', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
                              >
                                <option value="caja_chica">ðŸ“¦ Caja Microcorrugado Chica (15x15x8 cm) â€” $8.00</option>
                                <option value="caja_mediana">ðŸ“¦ Caja Microcorrugado Mediana (25x20x10 cm) â€” $12.00</option>
                                <option value="caja_grande">ðŸ“¦ Caja Microcorrugado Grande (35x28x15 cm) â€” $18.00</option>
                                <option value="taza">â˜• Caja Especial para Taza con Ventana â€” $9.00</option>
                                <option value="luxury">ðŸŽ Caja RÃ­gida Luxury con MoÃ±o Satinado â€” $25.00</option>
                                <option value="sobre_rigido">âœ‰ï¸ Sobre RÃ­gido Antidoblado PapelerÃ­a Fina â€” $6.00</option>
                                <option value="bolsa_celofan">ðŸ›ï¸ Bolsa CelofÃ¡n con Cenefa y Sticker â€” $3.50</option>
                                <option value="custom">âœï¸ Empaque a Convenir / Personalizado</option>
                              </select>
                            </div>

                            {/* Costo Caja */}
                            <div>
                              <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                                Costo Base de la Caja ($ MXN):
                              </label>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={pkg.boxCost ?? 12}
                                onChange={e => handleUpdatePackagingField('boxCost', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-xs"
                              />
                            </div>
                          </div>

                          {/* Protecciones Internas */}
                          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                            <span className="font-bold text-gray-700 block text-[10.5px] uppercase">
                              Insumos de ProtecciÃ³n Interna para EnvÃ­os:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                                  PlÃ¡stico Burbuja Alta Densidad:
                                </label>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 font-bold">$</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={pkg.bubbleWrapCost ?? 3.5}
                                    onChange={e => handleUpdatePackagingField('bubbleWrapCost', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs"
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400">ProtecciÃ³n antigolpes</span>
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                                  Relleno Viruta Kraft / CojÃ­n:
                                </label>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 font-bold">$</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={pkg.cushioningCost ?? 2.5}
                                    onChange={e => handleUpdatePackagingField('cushioningCost', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs"
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400">Amortiguador ecolÃ³gico</span>
                              </div>

                              <div>
                                <label className="text-[10px] text-gray-500 font-bold block mb-0.5">
                                  Etiqueta TÃ©rmica &amp; Cinta FrÃ¡gil:
                                </label>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 font-bold">$</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={pkg.labelTapeCost ?? 2}
                                    onChange={e => handleUpdatePackagingField('labelTapeCost', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-xs"
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400">GuÃ­a y sellado de seguridad</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                              <span className="font-bold text-gray-600 text-[11px]">Costo Total de Embalaje por Pieza:</span>
                              <span className="font-mono font-black text-xs text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                                ${packagingTotal.toFixed(2)} MXN
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD 2: COTIZADOR DE ENVÃO A TODA LA REPÃšBLICA */}
                    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-blue-100 text-blue-800">
                            <Truck className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-xs text-gray-900">
                              Cotizador de EnvÃ­o a Toda la RepÃºblica Mexicana
                            </h4>
                            <p className="text-[10.5px] text-gray-500">
                              Tarifas estÃ¡ndar FedEx, Estafeta, DHL Express o entrega local en San Luis PotosÃ­.
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                          Flete: ${shippingTotal.toFixed(2)} MXN
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                            PaqueterÃ­a / Modalidad de EnvÃ­o:
                          </label>
                          <select
                            value={pkg.shippingCarrier || 'nacional_estandar'}
                            onChange={e => handleUpdatePackagingField('shippingCarrier', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
                          >
                            <option value="nacional_estandar">ðŸšš EnvÃ­o Nacional EstÃ¡ndar (FedEx / Estafeta / DHL, 3-5 dÃ­as) â€” $149.00</option>
                            <option value="nacional_express">âš¡ EnvÃ­o Nacional Express AÃ©reo (DÃ­a Siguiente a todo MÃ©xico) â€” $220.00</option>
                            <option value="local_slp">ðŸ“ Entrega Local en SLP (Punto de Entrega Taller) â€” $0.00</option>
                            <option value="local_domicilio">ðŸ›µ Entrega Local en SLP a Domicilio â€” $45.00</option>
                            <option value="custom">âœï¸ Tarifa Personalizada</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                            Costo de Flete Estimado ($ MXN):
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={pkg.shippingCost ?? 149}
                            onChange={e => handleUpdatePackagingField('shippingCost', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      {/* SWITCH INTELIGENTE: Â¿INCLUIR FLETE EN EL PRECIO DE VENTA? */}
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        pkg.includeShippingInPrice ? 'bg-emerald-50 border-emerald-300 shadow-2xs' : 'bg-stone-50 border-stone-200'
                      }`}>
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!pkg.includeShippingInPrice}
                            onChange={e => handleUpdatePackagingField('includeShippingInPrice', e.target.checked)}
                            className="w-4 h-4 rounded text-[#2D4F3E] focus:ring-0 mt-0.5 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block text-xs">
                              Â¿Incluir costo de envÃ­o en el precio de venta (Ofrecer "EnvÃ­o Gratis a todo MÃ©xico" al cliente)?
                            </span>
                            <span className="text-[10.5px] text-gray-500 leading-tight block mt-0.5">
                              {pkg.includeShippingInPrice ? (
                                <strong className="text-emerald-800">
                                  âœ“ Activado: Los ${shippingTotal} MXN del envÃ­o se suman al costo base del producto para que el margen de ganancia cubra el flete sin pÃ©rdidas ni dÃ©ficit de costos.
                                </strong>
                              ) : (
                                'El producto se venderÃ¡ sin envÃ­o incluido. La paqueterÃ­a se cobrarÃ¡ aparte en la orden al momento de la compra.'
                              )}
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Notas de Empaque y LogÃ­stica */}
                      <div>
                        <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                          Instrucciones y Notas de LogÃ­stica para el Personal:
                        </label>
                        <input
                          type="text"
                          value={pkg.notes || ''}
                          onChange={e => handleUpdatePackagingField('notes', e.target.value)}
                          placeholder="Ej: Envolver percheros de madera en plÃ¡stico burbuja individual para evitar fricciÃ³n..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs"
                        />
                      </div>
                    </div>

                    {/* CARD 3: DELIMITACIÃ“N DE ENVÃOS (1 PIEZA VS PAQUETE CONSOLIDADO) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 border-2 border-blue-200 space-y-3.5 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-blue-600 text-white shadow-2xs">
                            <Boxes className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-xs text-blue-950">
                              DelimitaciÃ³n de EnvÃ­os: 1 Pieza ($169) vs. Paquete Consolidado ($18-$20 marginal)
                            </h4>
                            <p className="text-[10.5px] text-gray-600">
                              En MÃ©xico la guÃ­a nacional cubre hasta 1 a 5 kg. Al comprar 2 o mÃ¡s piezas no se duplica la guÃ­a, solo se agrega el empaque individual.
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-300">
                          Ahorro por Volumen
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2 text-[11px]">
                        <p className="text-gray-700 leading-relaxed">
                          ðŸ’¡ <strong>Regla logÃ­stica de Artesano Digital:</strong> Si un cliente compra <strong>1 sola pieza</strong>, el costo logÃ­stico absorbe la guÃ­a completa (${shippingTotal} MXN flete + ${packagingTotal} MXN empaque = <strong>${shippingTotal + packagingTotal} MXN</strong>). Pero si compra <strong>2, 3 o 5 piezas</strong> en el mismo carrito, la guÃ­a nacional es fija y cada pieza extra solo aÃ±ade ~${marginalExtraCost} MXN de volumen/burbuja.
                        </p>

                        {/* Tabla comparativa de piezas y ahorro */}
                        <div className="overflow-x-auto pt-1">
                          <table className="w-full text-left border-collapse text-[10.5px]">
                            <thead>
                              <tr className="bg-blue-50/70 border-b border-blue-200 text-blue-900 font-bold">
                                <th className="p-2 rounded-l-lg">Piezas en el Pedido</th>
                                <th className="p-2">Flete GuÃ­a</th>
                                <th className="p-2">Embalaje Total</th>
                                <th className="p-2 font-mono">Total Paquete</th>
                                <th className="p-2 font-mono text-emerald-800">Costo / Pieza</th>
                                <th className="p-2 rounded-r-lg text-right">Ahorro LogÃ­stico</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                              {[
                                { qty: 1, label: '1 pieza (EnvÃ­o unitario)', extra: 0 },
                                { qty: 2, label: '2 piezas (Doble pedido)', extra: 1 },
                                { qty: 3, label: '3 piezas (Trio / Mayoreo)', extra: 2 },
                                { qty: 5, label: '5 piezas (Pack Familiar)', extra: 4 },
                                { qty: 10, label: '10 piezas (Distribuidor / Mayoreo)', extra: 9 },
                              ].map(row => {
                                const totalEmpaque = packagingTotal + (row.extra * marginalExtraCost);
                                const totalFleteYEmpaque = shippingTotal + totalEmpaque;
                                const costPerPiece = totalFleteYEmpaque / row.qty;
                                const baseUnitCost = shippingTotal + packagingTotal;
                                const savingsPercent = Math.max(0, Math.round(((baseUnitCost - costPerPiece) / baseUnitCost) * 100));

                                return (
                                  <tr key={row.qty} className={row.qty === 1 ? 'bg-stone-50/70' : 'hover:bg-blue-50/30'}>
                                    <td className="p-2 font-bold text-gray-900">{row.label}</td>
                                    <td className="p-2 font-mono text-gray-600">${shippingTotal.toFixed(0)}</td>
                                    <td className="p-2 font-mono text-gray-600">${totalEmpaque.toFixed(0)}</td>
                                    <td className="p-2 font-mono font-bold text-gray-900">${totalFleteYEmpaque.toFixed(2)}</td>
                                    <td className="p-2 font-mono font-black text-emerald-800 bg-emerald-50/50">
                                      ${costPerPiece.toFixed(2)} / pza
                                    </td>
                                    <td className="p-2 text-right">
                                      {row.qty === 1 ? (
                                        <span className="text-gray-400 font-semibold">Base (100%)</span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9.5px] border border-emerald-300">
                                          Â¡Ahorra {savingsPercent}%!
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-100 text-[10px] text-gray-500">
                          <span>âœ“ Argumento comercial para ventas: Usa este desglose para ofrecer combos o descuentos en la 2da y 3ra pieza sin perder margen.</span>
                        </div>
                      </div>
                    </div>

                    {/* NAVEGACIÃ“N UX INFERIOR PESTAÃ‘A 3 */}
                    <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 p-3.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setEditorActiveTab('taller')}
                        className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>â¬…ï¸</span>
                        <span>Volver a: 2. Taller &amp; Insumos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditorActiveTab('pricing')}
                        className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <span>ðŸ’° Continuar a: 4. Precios, Margen &amp; Descuentos</span>
                        <span>âž¡ï¸</span>
                      </button>
                    </div>

                  </div>
                );
              })()}

              {/* ======================================================== */}
              {/* PESTAÃ‘A 4: PRECIOS, MARGEN DE UTILIDAD & DESCUENTOS      */}
              {/* ======================================================== */}
              {editorActiveTab === 'pricing' && (() => {
                const rec = editorForm.manufacturingRecipe || {};
                const costSummary = computeRecipeCost(rec, editorForm, rawMaterialsList, workshopParams);
                const matCost = costSummary.materialCost;
                const energyCost = costSummary.energyCost;
                const wearCost = costSummary.wearCost;
                const laborCost = costSummary.laborCost;
                const packagingCost = costSummary.packagingCost;
                const shippingCost = costSummary.shippingCost;
                const failureReserveCost = costSummary.failureReserveCost;
                const overheadCost = costSummary.fixedOverheadCost;
                const calculatedLandedCost = costSummary.totalCost;
                const savedCost = Number(editorForm.costPrice) || 0;
                const currentCost = calculatedLandedCost > 0 ? calculatedLandedCost : savedCost;
                const currentPrice = Number(editorForm.price) || 0;
                const profitAmount = currentPrice > 0 ? (currentPrice - currentCost) : 0;
                const marginPercent = currentPrice > 0 ? Math.round((profitAmount / currentPrice) * 100) : 0;

                return (
                  <div className="p-4 sm:p-6 space-y-5 text-xs">
                    
                    {/* TARJETA DE FÃ“RMULA DE COSTO ATERRIZADO TOTAL */}
                    <div className="p-4 bg-gradient-to-r from-emerald-50 via-[#FAF9F5] to-emerald-50 rounded-2xl border-2 border-emerald-300/80 space-y-3 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-emerald-700 text-white shadow-2xs">
                            <Calculator className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-xs text-emerald-950">
                              Escandallo Minucioso &amp; FÃ³rmula de Costo Total Aterrizado
                            </h4>
                            <span className="text-[10.5px] text-gray-500">
                              Insumos + Luz CFE + Desgaste + Mano de obra + Embalaje + Flete + Reserva de fallas + Overhead = Costo Total sin Fugas</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSyncRecipeToCostPrice}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Sincronizar la suma exacta al campo Costo de ProducciÃ³n"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Sincronizar Costo (${calculatedLandedCost.toFixed(2)})</span>
                        </button>
                      </div>

                      {/* Desglose visual de la fÃ³rmula */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-9 gap-2 text-center text-[10px]">
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">1. Insumos</span>
    <span className="font-mono font-black text-gray-800 text-xs mt-0.5">$${matCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">2. Luz CFE</span>
    <span className="font-mono font-black text-amber-900 text-xs mt-0.5">$${energyCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">3. Desgaste</span>
    <span className="font-mono font-black text-orange-900 text-xs mt-0.5">$${wearCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">4. Mano de obra</span>
    <span className="font-mono font-black text-purple-900 text-xs mt-0.5">$${laborCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">5. Embalaje</span>
    <span className="font-mono font-black text-purple-800 text-xs mt-0.5">$${packagingCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">6. Flete</span>
    <span className="font-mono font-black text-blue-900 text-xs mt-0.5">$${shippingCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">7. Reserva fallas</span>
    <span className="font-mono font-black text-rose-800 text-xs mt-0.5">$${failureReserveCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-white border border-emerald-200">
    <span className="text-gray-400 font-bold block uppercase text-[9px]">8. Overhead</span>
    <span className="font-mono font-black text-stone-800 text-xs mt-0.5">$${overheadCost.toFixed(1)}</span>
  </div>
  <div className="p-2 rounded-xl bg-emerald-800 text-white font-bold">
    <span className="text-emerald-200 block uppercase text-[9px]">Costo Total</span>
    <span className="font-mono font-black text-xs mt-0.5">$${calculatedLandedCost.toFixed(2)}</span>
  </div>
</div>
{savedCost > 0 && Math.abs(savedCost - calculatedLandedCost) > 1 && (
  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-[10.5px] font-semibold flex flex-wrap items-center justify-between gap-2">
    <span>âš ï¸ El costo guardado ($${savedCost.toFixed(2)}) no coincide con la receta ($${calculatedLandedCost.toFixed(2)}).</span>
    <button type="button" onClick={handleSyncRecipeToCostPrice} className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer">
      Sincronizar ahora
    </button>
  </div>
)}
                    </div>

                    {/* PRECIO DE VENTA, MARGEN RÃPIDO Y STOCK */}
                    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        
                        {/* Costo de ProducciÃ³n */}
                        <div>
                          <label className="font-bold text-gray-800 block mb-1 text-[11px]">
                            Costo de ProducciÃ³n / Aterrizado ($ MXN)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={editorForm.costPrice ?? ''}
                              onChange={e => setEditorForm({ ...editorForm, costPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
                              className="w-full pl-6 pr-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-xs text-gray-800"
                              placeholder="0.00"
                            />
                          </div>
                          <span className="text-[9.5px] text-gray-400">Insumos + Luz + Desgaste + Mano de obra + Empaque + Reserva</span>
                        </div>

                        {/* Precio de Venta */}
                        <div>
                          <label className="font-bold text-gray-800 block mb-1 text-[11px]">
                            Precio de Venta al PÃºblico (PVP $ MXN) *
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editorForm.price ?? ''}
                              onChange={e => setEditorForm({ ...editorForm, price: e.target.value ? Number(e.target.value) : null })}
                              className="w-full px-3 py-2 rounded-xl border-2 border-[#2D4F3E] bg-white font-black text-sm text-[#2D4F3E]"
                              placeholder="249"
                            />
                            <select
                              value={['pieza', 'lote', 'paquete', 'docena', 'combo'].includes(editorForm.priceUnit) ? editorForm.priceUnit : 'custom'}
                              onChange={e => {
                                if (e.target.value !== 'custom') {
                                  setEditorForm({ ...editorForm, priceUnit: e.target.value });
                                }
                              }}
                              className="px-2 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
                            >
                              <option value="pieza">/ pza</option>
                              <option value="combo">/ combo</option>
                              <option value="paquete">/ paq</option>
                              <option value="lote">/ lote</option>
                              <option value="docena">/ docena</option>
                            </select>
                          </div>
                        </div>

                        {/* Stock FÃ­sico */}
                        <div>
                          <label className="font-bold text-gray-800 block mb-1 text-[11px] flex items-center justify-between">
                            <span>Piezas FÃ­sicas (Stock)</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              editorForm.availability === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {editorForm.availability === 'in_stock' ? 'Inmediato' : 'Bajo Pedido'}
                            </span>
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                const currentQty = Math.max(0, (Number(editorForm.stockQuantity) || 0) - 1);
                                setEditorForm({
                                  ...editorForm,
                                  stockQuantity: currentQty,
                                  availability: currentQty > 0 ? 'in_stock' : 'made_to_order'
                                });
                              }}
                              className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={editorForm.stockQuantity ?? 0}
                              onChange={e => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setEditorForm({
                                  ...editorForm,
                                  stockQuantity: val,
                                  availability: val > 0 ? 'in_stock' : 'made_to_order'
                                });
                              }}
                              className="w-full text-center font-mono font-bold text-xs text-gray-800 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentQty = (Number(editorForm.stockQuantity) || 0) + 1;
                                setEditorForm({
                                  ...editorForm,
                                  stockQuantity: currentQty,
                                  availability: 'in_stock'
                                });
                              }}
                              className="px-2.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* BOTONES DE MARGEN RÃPIDO */}
                      <div className="space-y-1.5 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-700 text-[10.5px] uppercase">
                            Calcular Precio de Venta Sugerido segÃºn Margen Objetivo:
                          </span>
                          <span className="text-[10px] text-gray-400">FÃ³rmula: PVP = Costo / (1 - Margen%)</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { percent: 30, label: '30% Margen', sub: 'Mayoreo / EconÃ³mico' },
                            { percent: 40, label: '40% Margen', sub: 'EstÃ¡ndar de Taller' },
                            { percent: 50, label: '50% Margen', sub: 'Recomendado Artesanal' },
                            { percent: 60, label: '60% Margen', sub: 'Alta PersonalizaciÃ³n' }
                          ].map(m => {
                            const suggested = currentCost > 0 ? Math.ceil(currentCost / (1 - m.percent / 100)) : 0;
                            return (
                              <button
                                key={m.percent}
                                type="button"
                                onClick={() => handleApplyTargetMargin(m.percent)}
                                className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all cursor-pointer shadow-2xs group"
                              >
                                <div className="font-bold text-xs text-gray-800 group-hover:text-[#2D4F3E] flex items-center justify-between">
                                  <span>{m.label}</span>
                                  <span className="font-mono text-emerald-800 font-black">${suggested}</span>
                                </div>
                                <span className="text-[9.5px] text-gray-400 block mt-0.5">{m.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Resumen de Margen de Ganancia */}
                      <div className="p-3 rounded-xl bg-[#FAF9F5] border border-stone-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-gray-700">Margen financiero de la pieza:</span>
                        {currentPrice > 0 && currentCost > 0 ? (
                          <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                            marginPercent >= 40
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            Ganancia Neta: ${profitAmount.toFixed(1)} MXN ({marginPercent}% margen)
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            ðŸ’¡ Asigna Costo y PVP arriba para calcular la ganancia real en vivo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ======================================================== */}
                    {/* SIMULADOR DE DESCUENTOS & CONTROL DE MARGEN DE PRECIOS   */}
                    {/* ======================================================== */}
                    {(() => {
                      const effectiveCost = currentCost > 0 ? currentCost : (calculatedLandedCost > 0 ? calculatedLandedCost : 65);
                      const effectivePrice = currentPrice > 0 ? currentPrice : Math.ceil(effectiveCost / 0.5);
                      const isSimulatedPreview = currentPrice <= 0 || currentCost <= 0;
                      const effProfit = effectivePrice - effectiveCost;
                      const effMargin = effectivePrice > 0 ? Math.round((effProfit / effectivePrice) * 100) : 0;

                      const floorPrice = Math.round(effectiveCost * 1.05 * 100) / 100;
                      const maxSafeDiscountPercent = Math.max(0, Math.floor(((effectivePrice - floorPrice) / effectivePrice) * 100));

                      const discountLevels = [5, 10, 15];
                      if (editorForm.flashDealConfig?.enabled && !discountLevels.includes(editorForm.flashDealConfig.discountPercent)) {
                        discountLevels.push(editorForm.flashDealConfig.discountPercent);
                        discountLevels.sort((a, b) => a - b);
                      }

                      const hasDeficitAt50 = Math.round(effectivePrice * 0.5) < floorPrice;

                      return (
                        <div className="space-y-4">
                          {/* CARD: SIMULADOR DE DESCUENTOS */}
                          <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600/30 space-y-3.5 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                                  <Percent className="w-4 h-4" />
                                </span>
                                <div>
                                  <h4 className="font-heading font-black text-xs text-gray-900 flex items-center gap-1.5">
                                    <span>Simulador de Descuentos &amp; Control de Margen de Taller</span>
                                    <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                                      AnÃ¡lisis Financiero
                                    </span>
                                  </h4>
                                  <p className="text-[10.5px] text-gray-500">
                                    Conoce con exactitud quÃ© ganancia en pesos y quÃ© porcentaje de margen neto te deja cada nivel de oferta antes de aplicarla.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isSimulatedPreview && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                                    SimulaciÃ³n Estimada
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-gray-500">
                                  PVP Base: <strong className="text-gray-900 font-mono text-xs">${effectivePrice} MXN</strong>
                                </span>
                              </div>
                            </div>

                            {/* Tabla Interactiva de Descuentos */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-[11px]">
                                <thead>
                                  <tr className="bg-stone-50 border-b border-stone-200 text-gray-700 font-bold">
                                    <th className="p-2.5 rounded-l-xl">Descuento</th>
                                    <th className="p-2.5">Precio Oferta</th>
                                    <th className="p-2.5">Ahorro Cliente</th>
                                    <th className="p-2.5">Ganancia Neta</th>
                                    <th className="p-2.5">Margen Neto</th>
                                    <th className="p-2.5 rounded-r-xl text-right">Viabilidad</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                  {discountLevels.map(pct => {
                                    const discPrice = Math.round(effectivePrice * (1 - pct / 100));
                                    const clientSavings = effectivePrice - discPrice;
                                    const netProfit = discPrice - effectiveCost;
                                    const netMargin = discPrice > 0 ? Math.round((netProfit / discPrice) * 100) : 0;
                                    const isDeficit = discPrice < floorPrice || netProfit <= 0;
                                    const isFlash = editorForm.flashDealConfig?.enabled && editorForm.flashDealConfig.discountPercent === pct;

                                    let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                    let badgeText = 'ðŸŸ¢ Saludable';
                                    if (isDeficit) {
                                      badgeColor = 'bg-rose-100 text-rose-900 border-rose-300 font-black animate-pulse';
                                      badgeText = 'ðŸ”´ DÃ‰FICIT / PÃ‰RDIDA';
                                    } else if (netMargin < 20) {
                                      badgeColor = 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
                                      badgeText = 'ðŸŸ  MÃ­nimo';
                                    } else if (netMargin < 35) {
                                      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                                      badgeText = 'ðŸŸ¡ Moderado';
                                    }

                                    return (
                                      <tr key={pct} className={`hover:bg-stone-50/60 transition-colors ${isDeficit ? 'bg-rose-50/30' : ''}`}>
                                        <td className="p-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                                          <span>-{pct}%</span>
                                          {isFlash && (
                                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-black text-[9px] uppercase">
                                              Flash
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-2.5 font-mono font-bold text-gray-900">${discPrice} MXN</td>
                                        <td className="p-2.5 font-mono text-gray-500">-${clientSavings} MXN</td>
                                        <td className={`p-2.5 font-mono font-black ${netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700 font-black'}`}>
                                          {netProfit >= 0 ? `+$${netProfit.toFixed(1)}` : `-$${Math.abs(netProfit).toFixed(1)}`} MXN
                                        </td>
                                        <td className="p-2.5 font-mono font-bold">
                                          <span className={netMargin >= 35 ? 'text-emerald-700' : netMargin >= 20 ? 'text-amber-700' : 'text-rose-700'}>
                                            {netMargin}%
                                          </span>
                                        </td>
                                        <td className="p-2.5 text-right">
                                          <span className={`px-2 py-0.5 rounded-full border text-[9.5px] inline-block ${badgeColor}`}>
                                            {badgeText}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* CARD: UMBRAL DE LIQUIDACIÃ“N MÃXIMA & PRECIO PISO */}
                          <div className={`p-4 rounded-2xl border-2 space-y-3 transition-all ${
                            hasDeficitAt50 
                              ? 'bg-gradient-to-r from-amber-50 via-white to-rose-50 border-amber-300' 
                              : 'bg-stone-50 border-stone-200'
                          }`}>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-2xs">
                                  <AlertTriangle className="w-4 h-4" />
                                </span>
                                <div>
                                  <h5 className="font-heading font-black text-xs text-gray-900">
                                    Umbral de LiquidaciÃ³n MÃ¡xima &amp; Precio de Piso de Seguridad
                                  </h5>
                                  <span className="text-[10px] text-gray-500">
                                    LÃ­mite estricto de taller para no subsidiar piezas con dinero propio
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-[10px] text-gray-500">Precio Piso Seguro:</span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                                  ${floorPrice.toFixed(2)} MXN
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                                <span className="text-gray-500 font-bold block text-[10px] uppercase">
                                  Descuento MÃ¡ximo de LiquidaciÃ³n Permitido:
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-mono text-xl font-black text-amber-700">
                                    {maxSafeDiscountPercent}%
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    (Cualquier descuento mayor entra en pÃ©rdidas de taller)
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight pt-1">
                                  CÃ¡lculo: Recupera el 100% de materiales directos, acabados, consumibles, luz CFE y mano de obra con 5% de contingencia para comisiones.
                                </p>
                              </div>

                              <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                                <div>
                                  <span className="text-gray-500 font-bold block text-[10px] uppercase">
                                    Regla de LiquidaciÃ³n:
                                  </span>
                                  <p className="text-[10.5px] text-gray-600 leading-relaxed mt-0.5">
                                    Si necesitas rematar inventario estancado, puedes aplicar hasta un <strong>{maxSafeDiscountPercent}% de descuento</strong> para recuperar el capital de taller sin perder dinero.
                                  </p>
                                </div>

                                {maxSafeDiscountPercent < 30 && (
                                  <div className="mt-2 p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                    <span>Â¡AtenciÃ³n! No aplicar 30% ni 50% de descuento en este SKU porque generarÃ¡ dÃ©ficit directo.</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* CARD: RESUMEN EJECUTIVO DETALLADO DEL COSTE DETRÃS DEL PRODUCTO */}
                          {(() => {
                            const allRecipeItems = rec.items || [];
                            const recDirectCost = Math.round(allRecipeItems.filter(it => it && (it.supplyType === 'direct' || (!it.supplyType && it.supplyType !== 'finish' && it.supplyType !== 'indirect'))).reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
                            const recFinishCost = Math.round(allRecipeItems.filter(it => it && it.supplyType === 'finish').reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;
                            const recIndirectCost = Math.round(allRecipeItems.filter(it => it && it.supplyType === 'indirect').reduce((acc, it) => acc + (Number(it.totalCost) || 0), 0) * 100) / 100;

                            const directShown = allRecipeItems.length > 0 ? recDirectCost : (matCost * 0.75);
                            const finishShown = allRecipeItems.length > 0 ? recFinishCost : (matCost * 0.15);
                            const indirectShown = allRecipeItems.length > 0 ? recIndirectCost : (matCost * 0.10);

                            return (
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 via-[#1C2721] to-[#121413] text-white space-y-3.5 shadow-md border border-emerald-900/60">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                                      <FileSpreadsheet className="w-4 h-4" />
                                    </span>
                                    <div>
                                      <h4 className="font-heading font-black text-xs text-white flex items-center gap-1.5">
                                        <span>RadiografÃ­a Completa del Coste DetrÃ¡s del Producto</span>
                                        <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9.5px] font-bold">
                                          Resumen Ejecutivo
                                        </span>
                                      </h4>
                                      <p className="text-[10px] text-gray-400">
                                        Desglose transparente y fÃ¡cil de leer para entender cada centavo que compone este SKU
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[9.5px] text-gray-400 block uppercase">InversiÃ³n Total Aterrizada:</span>
                                    <span className="font-mono text-base font-black text-emerald-300">
                                      ${calculatedLandedCost.toFixed(2)} MXN
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px]">
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-emerald-400 font-bold block uppercase text-[9px]">1. Material Base</span>
                                    <span className="font-mono font-black text-sm text-white mt-0.5 block">${directShown.toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-400">Madera / PLA / Blanks</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-purple-500/20">
                                    <span className="text-purple-300 font-bold block uppercase text-[9px]">2. Acabados</span>
                                    <span className="font-mono font-black text-sm text-purple-200 mt-0.5 block">${finishShown.toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-400">Tintes, Barniz &amp; Lija</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-amber-500/20">
                                    <span className="text-amber-300 font-bold block uppercase text-[9px]">3. Consumibles</span>
                                    <span className="font-mono font-black text-sm text-amber-200 mt-0.5 block">${indirectShown.toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-400">Resistol, Sierra &amp; Estopa</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-amber-400/20">
                                    <span className="text-amber-400 font-bold block uppercase text-[9px]">4. Luz CFE</span>
                                    <span className="font-mono font-black text-sm text-amber-300 mt-0.5 block">${energyCost.toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-400">MÃ¡quina digital</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-emerald-300 font-bold block uppercase text-[9px]">5. Mano de Obra</span>
                                    <span className="font-mono font-black text-sm text-emerald-200 mt-0.5 block">${laborCost.toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-400">Armado y entintado</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-white/5 border border-blue-400/20">
                                    <span className="text-blue-300 font-bold block uppercase text-[9px]">6. Embalaje / EnvÃ­o</span>
                                    <span className="font-mono font-black text-sm text-blue-200 mt-0.5 block">${(packagingCost + shippingCost).toFixed(2)}</span>
                                    <span className="text-[9px] text-gray-400">Caja, burbuja y flete</span>
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>
                                      Vendiendo al PVP de <strong>${effectivePrice} MXN</strong> obtienes una <strong>ganancia neta de ${effProfit.toFixed(1)} MXN ({effMargin}% margen)</strong> por cada unidad.
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSyncRecipeToCostPrice}
                                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[10px] transition-colors cursor-pointer"
                                  >
                                    âš¡ Actualizar Costo de ProducciÃ³n
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}

                    {/* CONFIGURACIÃ“N EXCLUSIVA DE PAQUETE O COMBO PROMOCIONAL */}
                    {editorForm.isBundle && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-[#FAF9F5] to-amber-50/50 border-2 border-purple-300/90 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                              <Boxes className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="font-heading font-extrabold text-xs text-purple-950 flex items-center gap-1.5">
                                <span>Cualidades de Paquete &amp; Combo Promocional</span>
                                <span className="px-2 py-0.2 rounded-full bg-purple-200 text-purple-900 text-[9.5px] font-bold">
                                  Combo Activo
                                </span>
                              </h4>
                              <p className="text-[10.5px] text-gray-500">
                                Define el precio regular de lista, el ahorro y quÃ© piezas contiene
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                              Precio Regular de Lista ($ MXN)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editorForm.regularPrice ?? ''}
                              onChange={e => {
                                const reg = e.target.value ? Number(e.target.value) : 0;
                                const curPrice = Number(editorForm.price) || 0;
                                setEditorForm({
                                  ...editorForm,
                                  regularPrice: reg,
                                  savings: Math.max(0, reg - curPrice)
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono font-bold text-xs text-gray-800"
                              placeholder="Ej: 649"
                            />
                            <span className="text-[9.5px] text-gray-400">Suma del precio individual de las piezas</span>
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1 text-[11px]">
                              Ahorro para el Cliente ($ MXN)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editorForm.savings ?? ''}
                              onChange={e => setEditorForm({ ...editorForm, savings: e.target.value ? Number(e.target.value) : 0 })}
                              className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/50 font-mono font-bold text-xs text-emerald-800"
                              placeholder="Ej: 150"
                            />
                            <span className="text-[9.5px] text-emerald-700 font-semibold">
                              {editorForm.regularPrice && editorForm.price
                                ? `-${Math.round((((Number(editorForm.regularPrice) - Number(editorForm.price)) / Number(editorForm.regularPrice)) * 100))}% de descuento aplicado`
                                : 'Descuento visible'}
                            </span>
                          </div>
                        </div>

                        {/* Piezas incluidas */}
                        <div className="space-y-2 pt-1 border-t border-purple-100">
                          <label className="font-bold text-purple-950 text-[11px] uppercase tracking-wider block">
                            Componentes y Piezas Incluidas ({(editorForm.includedItems || []).length} piezas):
                          </label>

                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {(editorForm.includedItems || []).length === 0 ? (
                              <p className="text-[11px] text-gray-400 italic p-2 bg-white rounded-xl border border-dashed border-gray-200">
                                Sin piezas agregadas. Usa el campo de abajo para agregar las piezas que incluye el combo.
                              </p>
                            ) : (
                              (editorForm.includedItems || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-stone-200 shadow-2xs">
                                  <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {idx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={e => handleUpdateIncludedItem(idx, e.target.value)}
                                    className="flex-1 px-2 py-1 text-xs rounded-lg border border-transparent hover:border-gray-300 focus:border-[#2D4F3E] bg-transparent focus:bg-white font-medium"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIncludedItem(idx)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                                    title="Eliminar pieza del paquete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              value={newIncludedItemInput}
                              onChange={e => setNewIncludedItemInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddIncludedItem();
                                }
                              }}
                              placeholder="Ej: 1 Bandeja vaciabolsillos curva ergonÃ³mica (18 x 12 cm)..."
                              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddIncludedItem}
                              className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agregar Pieza</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OFERTA FLASH & RELÃMPAGO */}
                    <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/50 via-stone-50 to-amber-50/30 overflow-hidden shadow-2xs">
                      <div
                        onClick={() => setEditorFlashAccordion(prev => !prev)}
                        className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <div>
                            <h4 className="font-heading font-extrabold text-xs text-gray-900 flex items-center gap-2">
                              <span>Control de Oferta Flash &amp; RelÃ¡mpago</span>
                              {editorForm.flashDealConfig?.enabled && (
                                <span className="px-2 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9.5px] font-black uppercase">
                                  ACTIVA (-{editorForm.flashDealConfig.discountPercent || 15}%)
                                </span>
                              )}
                            </h4>
                            <span className="text-[10.5px] text-gray-500">
                              Descuento con temporizador de cuenta regresiva visible en catÃ¡logo (tope 15%)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(editorForm.flashDealConfig?.enabled)}
                            onChange={e => {
                              e.stopPropagation();
                              setEditorForm({
                                ...editorForm,
                                flashDealConfig: {
                                  ...(editorForm.flashDealConfig || {}),
                                  enabled: e.target.checked,
                                  durationMinutes: editorForm.flashDealConfig?.durationMinutes || 120,
                                  discountPercent: Math.min(15, editorForm.flashDealConfig?.discountPercent || 15)
                                }
                              });
                            }}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                          />
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editorFlashAccordion ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {editorFlashAccordion && editorForm.flashDealConfig?.enabled && (
                        <div className="p-3.5 pt-0 border-t border-amber-200/60 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="text-[11px] font-bold text-gray-700 block mb-1">DuraciÃ³n de la Oferta</label>
                              <select
                                value={editorForm.flashDealConfig.durationMinutes || 120}
                                onChange={e => setEditorForm({
                                  ...editorForm,
                                  flashDealConfig: {
                                    ...editorForm.flashDealConfig,
                                    durationMinutes: Number(e.target.value)
                                  }
                                })}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                              >
                                <option value={15}>âš¡ 15 Minutos (Blitz RelÃ¡mpago)</option>
                                <option value={60}>1 Hora</option>
                                <option value={120}>2 Horas (EstÃ¡ndar)</option>
                                <option value={360}>6 Horas</option>
                                <option value={1440}>24 Horas (1 DÃ­a)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-700 block mb-1">Porcentaje de Descuento (MÃ¡x 15%)</label>
                              <select
                                value={editorForm.flashDealConfig.discountPercent || 15}
                                onChange={e => setEditorForm({
                                  ...editorForm,
                                  flashDealConfig: {
                                    ...editorForm.flashDealConfig,
                                    discountPercent: Math.min(15, Number(e.target.value))
                                  }
                                })}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                              >
                                <option value={5}>5% de descuento</option>
                                <option value={10}>10% de descuento</option>
                                <option value={15}>15% de descuento (Tope MÃ¡ximo Taller)</option>
                              </select>
                            </div>
                          </div>

                          {editorForm.price && (
                            <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
                              <span className="text-gray-500">Precio normal: <strong className="line-through">${editorForm.price}</strong></span>
                              <span className="text-[#2D4F3E] font-black text-sm">
                                Precio Flash: ${Math.round(editorForm.price * (1 - (editorForm.flashDealConfig.discountPercent || 15) / 100))} MXN
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SISTEMA ESTANDARIZADO DE SKU DE TALLER */}
                    <div className="rounded-2xl border border-[#D4A359]/60 bg-gradient-to-r from-stone-50 via-[#FAF9F5] to-amber-50/30 overflow-hidden shadow-2xs">
                      <div
                        onClick={() => setEditorSkuAccordion(prev => !prev)}
                        className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#2D4F3E]" />
                          <div>
                            <h4 className="font-heading font-black text-xs text-[#1F2421] flex items-center gap-2">
                              <span>Sistema Estandarizado de SKU de Taller</span>
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {editorForm.sku || editorForm.code}
                              </span>
                            </h4>
                            <span className="text-[10.5px] text-gray-500">
                              Cualidades de maquinaria, material y acabado para bodega y operadores
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const auto = suggestSkuForProduct(editorForm, products);
                              const parsed = parseSku(auto);
                              setEditorForm({
                                ...editorForm,
                                code: auto,
                                sku: auto,
                                skuArea: parsed.area?.code || 'HOG',
                                skuTechnique: parsed.tech?.code || '3D',
                                skuMaterial: parsed.mat?.code || 'PLA',
                                skuFinish: parsed.fin?.code || 'MAT',
                                skuSequence: parsed.sequence || '001'
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#D4A359] to-amber-500 text-[#17251E] font-black text-[11px] hover:brightness-105 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Calcular automÃ¡ticamente el SKU Ã³ptimo"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Autogenerar SKU</span>
                          </button>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editorSkuAccordion ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {editorSkuAccordion && (
                        <div className="p-3.5 pt-0 border-t border-[#E8E4DA] space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                            <div>
                              <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">1. Ãrea</label>
                              <select
                                value={editorForm.skuArea || 'HOG'}
                                onChange={e => {
                                  const val = e.target.value;
                                  const newSku = buildSku({
                                    area: val,
                                    technique: editorForm.skuTechnique || '3D',
                                    material: editorForm.skuMaterial || 'PLA',
                                    finish: editorForm.skuFinish || 'MAT',
                                    sequence: editorForm.skuSequence || '001'
                                  });
                                  setEditorForm({ ...editorForm, skuArea: val, code: newSku, sku: newSku });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                              >
                                {Object.values(SKU_AREAS).map(a => (
                                  <option key={a.code} value={a.code}>{a.icon} {a.label} ({a.code})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">2. TÃ©cnica</label>
                              <select
                                value={editorForm.skuTechnique || '3D'}
                                onChange={e => {
                                  const val = e.target.value;
                                  const newSku = buildSku({
                                    area: editorForm.skuArea || 'HOG',
                                    technique: val,
                                    material: editorForm.skuMaterial || 'PLA',
                                    finish: editorForm.skuFinish || 'MAT',
                                    sequence: editorForm.skuSequence || '001'
                                  });
                                  setEditorForm({ ...editorForm, skuTechnique: val, code: newSku, sku: newSku });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                              >
                                {Object.values(SKU_TECHNIQUES).map(t => (
                                  <option key={t.code} value={t.code}>{t.short || t.label} ({t.code})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">3. Material</label>
                              <select
                                value={editorForm.skuMaterial || 'PLA'}
                                onChange={e => {
                                  const val = e.target.value;
                                  const newSku = buildSku({
                                    area: editorForm.skuArea || 'HOG',
                                    technique: editorForm.skuTechnique || '3D',
                                    material: val,
                                    finish: editorForm.skuFinish || 'MAT',
                                    sequence: editorForm.skuSequence || '001'
                                  });
                                  setEditorForm({ ...editorForm, skuMaterial: val, code: newSku, sku: newSku });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                              >
                                {Object.values(SKU_MATERIALS).map(m => (
                                  <option key={m.code} value={m.code}>{m.label} ({m.code})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">4. Acabado</label>
                              <select
                                value={editorForm.skuFinish || 'MAT'}
                                onChange={e => {
                                  const val = e.target.value;
                                  const newSku = buildSku({
                                    area: editorForm.skuArea || 'HOG',
                                    technique: editorForm.skuTechnique || '3D',
                                    material: editorForm.skuMaterial || 'PLA',
                                    finish: val,
                                    sequence: editorForm.skuSequence || '001'
                                  });
                                  setEditorForm({ ...editorForm, skuFinish: val, code: newSku, sku: newSku });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-[11px]"
                              >
                                {Object.values(SKU_FINISHES).map(f => (
                                  <option key={f.code} value={f.code}>{f.label} ({f.code})</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">5. Serie</label>
                              <input
                                type="text"
                                value={editorForm.skuSequence || '001'}
                                onChange={e => {
                                  const val = e.target.value;
                                  const newSku = buildSku({
                                    area: editorForm.skuArea || 'HOG',
                                    technique: editorForm.skuTechnique || '3D',
                                    material: editorForm.skuMaterial || 'PLA',
                                    finish: editorForm.skuFinish || 'MAT',
                                    sequence: val
                                  });
                                  setEditorForm({ ...editorForm, skuSequence: val, code: newSku, sku: newSku });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-[11px] text-center"
                                placeholder="001"
                              />
                            </div>

                            <div>
                              <label className="text-[9.5px] font-bold text-gray-700 uppercase block mb-1">SKU Final *</label>
                              <input
                                type="text"
                                value={editorForm.code || ''}
                                onChange={e => {
                                  const val = e.target.value.toUpperCase();
                                  setEditorForm({ ...editorForm, code: val, sku: val });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg border-2 border-[#2D4F3E] bg-white font-mono font-black text-[11px] text-[#2D4F3E]"
                                placeholder="HOG-LAS-MAD-BAR-001"
                              />
                            </div>
                          </div>

                          {/* Ficha TÃ©cnica Interna */}
                          {(() => {
                            const activeSku = editorForm.code || editorForm.sku || 'HOG-LAS-MAD-BAR-001';
                            const breakdown = parseSku(activeSku);
                            return (
                              <div className="p-3 rounded-xl bg-white border border-[#2D4F3E]/30 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                                  <span className="text-[11px] font-bold text-gray-600 uppercase">Ficha TÃ©cnica Interna:</span>
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    âœ“ GuÃ­a de PreparaciÃ³n de Taller
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="font-bold text-gray-400 uppercase text-[9px]">ðŸ­ Destino / Ãrea</div>
                                    <div className="font-bold text-gray-800 mt-0.5">{breakdown?.explanation?.destino || 'Ãrea general'}</div>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="font-bold text-gray-400 uppercase text-[9px]">âš™ï¸ Maquinaria / Proceso</div>
                                    <div className="font-bold text-emerald-800 mt-0.5">{breakdown?.explanation?.maquinaria || 'Proceso estÃ¡ndar'}</div>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="font-bold text-gray-400 uppercase text-[9px]">ðŸªµ Materia Prima</div>
                                    <div className="font-bold text-amber-800 mt-0.5">{breakdown?.explanation?.materiaPrima || 'Materia prima oficial'}</div>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="font-bold text-gray-400 uppercase text-[9px]">âœ¨ Acabado Taller</div>
                                    <div className="font-bold text-purple-800 mt-0.5">{breakdown?.explanation?.acabadoTaller || 'Acabado artesanal'}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* NOTAS PRIVADAS DE MANUFACTURA */}
                    <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-1.5">
                      <label className="font-bold text-gray-800 block text-[11px]">
                        Notas Privadas de Manufactura y Proveedores (Solo taller, confidencial):
                      </label>
                      <input
                        type="text"
                        value={editorForm.privateNotes || ''}
                        onChange={e => setEditorForm({ ...editorForm, privateNotes: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                        placeholder="Proveedor especial de madera, temperatura de boquilla, pegamento especial..."
                      />
                    </div>

                    {/* NAVEGACIÃ“N UX INFERIOR PESTAÃ‘A 4 */}
                    <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditorActiveTab('packaging')}
                          className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>â¬…ï¸</span>
                          <span>Volver a: 3. Embalaje &amp; Flete</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditorActiveTab('taller')}
                          className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>ðŸªµ Revisar Insumos</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditorActiveTab('repo')}
                        className="px-4 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <span>Continuar a: 5. Repositorio &amp; FabricaciÃ³n</span>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>âž¡ï¸</span>
                      </button>
                    </div>

                  </div>
                );
              })()}

              {/* ======================================================== */}
              {/* PESTAÃ‘A 5: REPOSITORIO, ARCHIVOS 3D & FABRICACIÃ“N         */}
              {/* ======================================================== */}
              {editorActiveTab === 'repo' && (() => {
                const repo = editorForm.repository || {};
                const times = editorForm.manufacturingTimes || {
                  machineHours: Math.floor(Number(editorForm.costBreakdown?.machineHours) || 1),
                  machineMinutes: Math.round(((Number(editorForm.costBreakdown?.machineHours) || 1.5) % 1) * 60),
                  postProcessingMinutes: Number(editorForm.costBreakdown?.manualWorkMin) || 10,
                  leadTimeDays: editorForm.specifications?.estimatedLeadTime || '2 a 4 dÃ­as hÃ¡biles'
                };

                const updateRepo = (patch) => {
                  setEditorForm(prev => {
                    const nextRepo = { ...(prev.repository || {}), ...patch };
                    return {
                      ...prev,
                      repository: nextRepo,
                      makerWorldModel: nextRepo.makerworldUrl || prev.makerWorldModel,
                      makerworldUrl: nextRepo.makerworldUrl || prev.makerworldUrl,
                      makerWorldAuthor: nextRepo.author || prev.makerWorldAuthor,
                      localPath: nextRepo.localPath || prev.localPath
                    };
                  });
                };

                const updateTimes = (patch) => {
                  setEditorForm(prev => {
                    const nextTimes = { ...(prev.manufacturingTimes || times), ...patch };
                    const mH = Number(nextTimes.machineHours) || 0;
                    const mM = Number(nextTimes.machineMinutes) || 0;
                    const totalMachineMins = (mH * 60) + mM;
                    const postProcMins = Number(nextTimes.postProcessingMinutes) || 0;
                    return {
                      ...prev,
                      manufacturingTimes: nextTimes,
                      manufacturingTimeMinutes: totalMachineMins,
                      postProcessingTimeMinutes: postProcMins,
                      costBreakdown: {
                        ...(prev.costBreakdown || {}),
                        machineHours: Number((totalMachineMins / 60).toFixed(2)),
                        manualWorkMin: postProcMins
                      },
                      specifications: {
                        ...(prev.specifications || {}),
                        estimatedLeadTime: nextTimes.leadTimeDays || prev.specifications?.estimatedLeadTime || '2 a 4 dÃ­as hÃ¡biles'
                      }
                    };
                  });
                };

                const mH = Number(times.machineHours || 0);
                const mM = Number(times.machineMinutes || 0);
                const postM = Number(times.postProcessingMinutes || 0);
                const totalMins = (mH * 60) + mM + postM;
                const totalH = Math.floor(totalMins / 60);
                const totalRemM = totalMins % 60;

                const handleAddLink = () => {
                  const links = Array.isArray(repo.additionalLinks) ? [...repo.additionalLinks] : [];
                  links.push({ title: 'Otro repositorio', url: '' });
                  updateRepo({ additionalLinks: links });
                };

                const handleUpdateLink = (idx, field, val) => {
                  const links = Array.isArray(repo.additionalLinks) ? [...repo.additionalLinks] : [];
                  if (links[idx]) {
                    links[idx] = { ...links[idx], [field]: val };
                    updateRepo({ additionalLinks: links });
                  }
                };

                const handleRemoveLink = (idx) => {
                  const links = (repo.additionalLinks || []).filter((_, i) => i !== idx);
                  updateRepo({ additionalLinks: links });
                };

                return (
                  <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
                    
                    {/* ENCABEZADO EXPLICATIVO */}
                    <div className="bg-gradient-to-r from-emerald-900 to-[#1F3327] rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/20">
                            Control de Taller &amp; Origen
                          </span>
                          <span className="font-mono text-xs text-emerald-200 font-bold">
                            {editorForm.sku || editorForm.code}
                          </span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight">
                          5. Repositorio, Archivos 3D &amp; Tiempos de FabricaciÃ³n
                        </h3>
                        <p className="text-xs text-emerald-100/80 mt-0.5 max-w-xl">
                          Registra dÃ³nde se encuentra el modelo 3D (enlace MakerWorld, ruta local en tu PC o nube) y define con precisiÃ³n los tiempos de impresiÃ³n y acabado.
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 text-center min-w-[170px] shrink-0">
                        <span className="text-[10px] font-semibold text-emerald-200 block">Tiempo Total en Taller:</span>
                        <div className="text-xl font-black font-mono text-white mt-0.5">
                          â±ï¸ {totalH > 0 ? `${totalH}h ` : ''}{totalRemM}m
                        </div>
                        <span className="text-[10px] text-emerald-300 block font-medium">
                          ({(mH * 60 + mM)}m maq. + {postM}m manual)
                        </span>
                      </div>
                    </div>

                    {/* BLOQUE 1: REPOSITORIO Y FUENTE DEL MODELO 3D */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DA] p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-800">
                              Repositorio Web del Modelo (MakerWorld, Printables, etc.)
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              Enlace directo para descargar el archivo, consultar la ficha del autor o actualizar perfiles de impresiÃ³n.
                            </p>
                          </div>
                        </div>

                        {repo.makerworldUrl && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Vinculado</span>
                          </span>
                        )}
                      </div>

                      {/* Input Principal URL MakerWorld */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                          <span>URL / Enlace del Modelo en MakerWorld u otra web:</span>
                          {repo.makerworldUrl && (
                            <span className="text-[10.5px] text-gray-400 font-normal">
                              Haz clic en 'Probar Enlace' para verificar
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="url"
                              value={repo.makerworldUrl || ''}
                              onChange={e => updateRepo({ makerworldUrl: e.target.value })}
                              placeholder="https://makerworld.com/es/models/1804162 o URL del repositorio..."
                              className="w-full pl-3 pr-8 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:border-[#2D4F3E] focus:outline-hidden"
                            />
                            {repo.makerworldUrl && (
                              <button
                                type="button"
                                onClick={() => updateRepo({ makerworldUrl: '' })}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                                title="Borrar"
                              >
                                âœ•
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={!repo.makerworldUrl}
                            onClick={() => {
                              if (repo.makerworldUrl) {
                                window.open(repo.makerworldUrl, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              repo.makerworldUrl
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                            title="Abrir enlace en nueva pestaÃ±a"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Probar Enlace</span>
                          </button>

                          <button
                            type="button"
                            disabled={!repo.makerworldUrl}
                            onClick={() => {
                              if (repo.makerworldUrl) {
                                navigator.clipboard.writeText(repo.makerworldUrl);
                                setEditorMessage({ text: 'Â¡Enlace de MakerWorld copiado al portapapeles!', type: 'success' });
                                setTimeout(() => setEditorMessage({ text: '', type: '' }), 3000);
                              }
                            }}
                            className="p-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-gray-700 text-xs font-bold cursor-pointer transition-colors"
                            title="Copiar enlace"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metadatos adicionales de la fuente */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-gray-600 block mb-1">
                            ID / CÃ³digo del Modelo:
                          </label>
                          <input
                            type="text"
                            value={repo.makerworldModelId || ''}
                            onChange={e => updateRepo({ makerworldModelId: e.target.value })}
                            placeholder="Ej: 1804162"
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-600 block mb-1">
                            Autor / DiseÃ±ador Original:
                          </label>
                          <input
                            type="text"
                            value={repo.author || ''}
                            onChange={e => updateRepo({ author: e.target.value })}
                            placeholder="Ej: Mesmar / CrazyModding / Taller"
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-600 block mb-1">
                            Licencia de Uso / Comercial:
                          </label>
                          <select
                            value={repo.license || 'Comercial Autorizado'}
                            onChange={e => updateRepo({ license: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white cursor-pointer"
                          >
                            <option value="Comercial Autorizado">Comercial Autorizado</option>
                            <option value="Maker's Club / MembresÃ­a">Maker's Club / MembresÃ­a</option>
                            <option value="Standard Digital File License">Standard Digital File License</option>
                            <option value="Creative Commons (CC BY-NC)">Creative Commons (CC BY-NC)</option>
                            <option value="Creative Commons (CC BY)">Creative Commons (CC BY)</option>
                            <option value="DiseÃ±o Exclusivo Artesano Digital">DiseÃ±o Exclusivo Artesano Digital</option>
                            <option value="Dominio PÃºblico / Libre">Dominio PÃºblico / Libre</option>
                          </select>
                        </div>
                      </div>

                      {/* Enlace en la nube o Drive */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-bold text-gray-600 block">
                          Carpeta o Backup en la Nube (Google Drive, Dropbox, OneDrive, GitHub):
                        </label>
                        <input
                          type="url"
                          value={repo.cloudUrl || ''}
                          onChange={e => updateRepo({ cloudUrl: e.target.value })}
                          placeholder="https://drive.google.com/drive/folders/... (Opcional)"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* BLOQUE 2: UBICACIÃ“N DE ARCHIVOS EN TU COMPUTADORA (LOCAL PC) */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DA] p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                            <HardDrive className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-800">
                              UbicaciÃ³n de Archivos en tu Computadora (PC Local / Taller)
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              Ruta de la carpeta o archivo .3mf / .stl en tu equipo para abrirlo directamente en Bambu Studio, Cura o PrusaSlicer.
                            </p>
                          </div>
                        </div>

                        {repo.localPath && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                            ðŸ’» Guardado en PC
                          </span>
                        )}
                      </div>

                      {/* Input de Ruta Local */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 block">
                          Ruta completa del archivo o carpeta en tu disco duro:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={repo.localPath || ''}
                            onChange={e => updateRepo({ localPath: e.target.value })}
                            placeholder="C:\Users\OEM\Modelos3D\Nombre_Producto\archivo.3mf"
                            className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:border-[#2D4F3E] focus:outline-hidden"
                          />

                          <button
                            type="button"
                            disabled={!repo.localPath}
                            onClick={() => {
                              if (repo.localPath) {
                                navigator.clipboard.writeText(repo.localPath);
                                setEditorMessage({ text: 'Â¡Ruta local copiada! Puedes pegarla en el Explorador de Windows o tu laminador.', type: 'success' });
                                setTimeout(() => setEditorMessage({ text: '', type: '' }), 3500);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              repo.localPath
                                ? 'bg-[#2D4F3E] hover:bg-[#20392C] text-white shadow-xs'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                            title="Copiar ruta para el Explorador de Windows"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Ruta PC</span>
                          </button>
                        </div>
                      </div>

                      {/* Notas TÃ©cnicas de Rebanado (Slicer) */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-bold text-gray-600 block">
                          Notas de Rebanador / ParÃ¡metros de ImpresiÃ³n (Boquilla, Relleno, Capas, Soportes):
                        </label>
                        <input
                          type="text"
                          value={repo.slicerNotes || ''}
                          onChange={e => updateRepo({ slicerNotes: e.target.value })}
                          placeholder="Ej: Boquilla 0.4mm, capa 0.20mm, 15% giroide, soportes tipo Ã¡rbol activados..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* BLOQUE 3: TIEMPOS ESTIMADOS DE FABRICACIÃ“N Y DESPACHO */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DA] p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-800">
                              Tiempos Estimados de FabricaciÃ³n &amp; Entrega
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              Define el tiempo de uso de maquinaria, post-procesado manual y el plazo prometido de despacho al cliente.
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-xs">
                          â±ï¸ Total: {totalH > 0 ? `${totalH}h ` : ''}{totalRemM}m
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* 1. Tiempo de Maquinaria */}
                        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-xs text-gray-800 flex items-center gap-1">
                              <span>ðŸ–¨ï¸ Tiempo de MÃ¡quina:</span>
                            </label>
                            <span className="text-[10px] font-mono text-gray-500">ImpresiÃ³n / LÃ¡ser</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-500 block mb-0.5">Horas:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={times.machineHours ?? 0}
                                onChange={e => updateTimes({ machineHours: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white text-center"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block mb-0.5">Minutos:</span>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                value={times.machineMinutes ?? 0}
                                onChange={e => updateTimes({ machineMinutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white text-center"
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 block text-center">
                            Subtotal: {(mH * 60) + mM} minutos de mÃ¡quina
                          </span>
                        </div>

                        {/* 2. Tiempo de Post-Procesado */}
                        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-xs text-gray-800 flex items-center gap-1">
                              <span>ðŸ§¤ Post-procesado Manual:</span>
                            </label>
                            <span className="text-[10px] font-mono text-gray-500">Mano de obra</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-500 block mb-0.5">Minutos de acabado / ensamble:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="600"
                                value={times.postProcessingMinutes ?? 10}
                                onChange={e => updateTimes({ postProcessingMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white text-center"
                              />
                              <span className="text-xs font-bold text-gray-600">min</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 block text-center">
                            Retiro soportes, lijado, argolla, empaque
                          </span>
                        </div>

                        {/* 3. Plazo de Entrega al Cliente */}
                        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-xs text-gray-800 flex items-center gap-1">
                              <span>ðŸšš Despacho al Cliente:</span>
                            </label>
                            <span className="text-[10px] font-mono text-gray-500">Promesa de entrega</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-500 block mb-0.5">Plazo visible en ficha tÃ©cnica:</span>
                            <select
                              value={times.leadTimeDays || '2 a 4 dÃ­as hÃ¡biles'}
                              onChange={e => updateTimes({ leadTimeDays: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white cursor-pointer font-bold text-gray-700"
                            >
                              <option value="Mismo dÃ­a (en stock)">Mismo dÃ­a (en stock)</option>
                              <option value="1 a 2 dÃ­as hÃ¡biles">1 a 2 dÃ­as hÃ¡biles (rÃ¡pido)</option>
                              <option value="2 a 4 dÃ­as hÃ¡biles">2 a 4 dÃ­as hÃ¡biles (estÃ¡ndar)</option>
                              <option value="3 a 5 dÃ­as hÃ¡biles">3 a 5 dÃ­as hÃ¡biles (personalizado)</option>
                              <option value="5 a 7 dÃ­as hÃ¡biles">5 a 7 dÃ­as hÃ¡biles (bajo pedido)</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={times.leadTimeDays || ''}
                            onChange={e => updateTimes({ leadTimeDays: e.target.value })}
                            placeholder="O escribe plazo personalizado..."
                            className="w-full px-2 py-1 rounded-lg border border-stone-300 text-[11px] bg-white mt-1"
                          />
                        </div>

                      </div>
                    </div>

                    {/* BLOQUE 4: ENLACES ADICIONALES (OPCIONAL) */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DA] p-4 sm:p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-gray-800">
                            Enlaces Adicionales de Referencia (Videos, BOM externa, datasheets):
                          </h4>
                          <p className="text-[10.5px] text-gray-500">
                            Agrega enlaces complementarios de ensamble, componentes o recursos del producto.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar Enlace</span>
                        </button>
                      </div>

                      {Array.isArray(repo.additionalLinks) && repo.additionalLinks.length > 0 ? (
                        <div className="space-y-2 pt-1">
                          {repo.additionalLinks.map((link, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                              <input
                                type="text"
                                value={link.title || ''}
                                onChange={e => handleUpdateLink(idx, 'title', e.target.value)}
                                placeholder="Nombre (ej: Video de ensamble)"
                                className="w-1/3 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                              />
                              <input
                                type="url"
                                value={link.url || ''}
                                onChange={e => handleUpdateLink(idx, 'url', e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono bg-white"
                              />
                              {link.url && (
                                <button
                                  type="button"
                                  onClick={() => window.open(link.url, '_blank')}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 cursor-pointer"
                                  title="Abrir"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(idx)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">
                          No hay enlaces adicionales registrados para este producto.
                        </p>
                      )}
                    </div>

                    {/* NAVEGACIÃ“N UX INFERIOR PESTAÃ‘A 5 */}
                    <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditorActiveTab('pricing')}
                          className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>â¬…ï¸ Volver a: 4. Precios &amp; Margen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditorActiveTab('general')}
                          className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>ðŸ“‹ Ver GalerÃ­a &amp; Datos</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveProduct}
                        className="px-5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Producto Ahora</span>
                      </button>
                    </div>

                  </div>
                );
              })()}

              {/* FOOTER FIJO (MÃ“VIL Y ESCRITORIO) CON RESUMEN FINANCIERO Y ACCIONES */}
              <div className="p-3.5 sm:p-4 px-4 sm:px-6 bg-[#FBF9F5] border-t border-[#E8E4DA] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 mt-auto sticky bottom-0 z-20 shadow-lg">
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Costo Aterrizado:</span>
                    <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                      ${Number(editorForm.costPrice || 0).toFixed(2)} MXN
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 font-semibold">Precio Venta:</span>
                    <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ${Number(editorForm.price || 0)} MXN
                    </span>
                  </div>
                  {editorForm.price > 0 && editorForm.costPrice > 0 && (
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      (Number(editorForm.price) - Number(editorForm.costPrice)) / Number(editorForm.price) >= 0.4
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      Ganancia: ${(Number(editorForm.price) - Number(editorForm.costPrice)).toFixed(1)} ({Math.round(((Number(editorForm.price) - Number(editorForm.costPrice)) / Number(editorForm.price)) * 100)}%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-[#2D4F3E] text-white font-bold text-xs hover:bg-[#20392C] transition-all cursor-pointer shadow-md active:scale-98"
                  >
                    Guardar Cambios del Producto
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de SimulaciÃ³n Detallada de Disponibilidad de Taller */}
      {recipeSimulationModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-[#FBF9F5] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-[#E8E4DA] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading flex items-center gap-2">
                    <span>Resultado de SimulaciÃ³n de Taller</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      recipeSimulationModal.feasible
                        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                        : 'bg-rose-900/60 text-rose-300 border-rose-700'
                    }`}>
                      {recipeSimulationModal.feasible ? 'âœ“ Stock Suficiente' : 'âš ï¸ Stock Insuficiente'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    SimulaciÃ³n para: <strong className="text-white">{recipeSimulationModal.requestedUnits || 1} pieza(s)</strong> â€¢ Capacidad mÃ¡x. actual: <strong className="text-amber-300 font-mono">{recipeSimulationModal.maxPossibleUnits} piezas</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecipeSimulationModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Banner de Estado */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                recipeSimulationModal.feasible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {recipeSimulationModal.feasible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {recipeSimulationModal.feasible
                      ? `Â¡Excelente! Tienes suficiente stock en bodega para fabricar ${recipeSimulationModal.requestedUnits} pieza(s).`
                      : `AtenciÃ³n: No hay suficiente stock de algunos insumos para fabricar ${recipeSimulationModal.requestedUnits} pieza(s).`}
                  </h4>
                  <p className="text-xs mt-0.5 text-gray-600">
                    Costo estimado en insumos: <strong className="font-mono text-gray-900">${recipeSimulationModal.totalEstimatedCost} MXN</strong> (Neto: ${recipeSimulationModal.totalNetCost} â€¢ Merma/Purga: ${recipeSimulationModal.totalWasteCost} - {recipeSimulationModal.wastePercentAverage}%)
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-gray-700 font-mono text-[11px]">
                      Insumos: <b>${recipeSimulationModal.totalEstimatedCost} MXN</b>
                    </span>
                    {Number(recipeSimulationModal.energyCost || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px]">
                        âš¡ Luz CFE: <b>${recipeSimulationModal.energyCost} MXN</b>
                      </span>
                    )}
                    {Number(recipeSimulationModal.laborCost || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[11px]">
                        â±ï¸ Mano de Obra: <b>${recipeSimulationModal.laborCost} MXN</b>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-stone-900 text-white font-mono font-bold text-[11px]">
                      Total ProducciÃ³n: ${recipeSimulationModal.grandTotalCost || recipeSimulationModal.totalEstimatedCost} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista Detallada de Insumos */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Impacto en el inventario de materias primas:
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(recipeSimulationModal.items || []).map((it, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                        it.sufficient
                          ? 'bg-white border-stone-200'
                          : 'bg-rose-50/50 border-rose-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                          <span>{it.name}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            it.sufficient ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {it.sufficient ? 'âœ“ Disponible' : `Faltan ${it.missingStock} ${it.stockUnit}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Consumo: <strong className="text-gray-800 font-mono">{it.totalRequired} {it.unit}</strong> (Neto: {it.netQuantity * (recipeSimulationModal.requestedUnits || 1)} + Merma: {it.wasteQuantity * (recipeSimulationModal.requestedUnits || 1)}) â€¢ Stock actual: <span className="font-mono">{it.currentStock} {it.stockUnit}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-gray-400">Stock resultante:</div>
                        <div className={`font-mono font-bold text-xs ${it.sufficient ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {it.remainingStock} {it.stockUnit}
                        </div>
                        <div className="text-[9.5px] text-gray-400">LÃ­nea: ${it.lineCost} MXN</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-gray-500">
                Capacidad mÃ¡xima de producciÃ³n con stock actual: <strong>{recipeSimulationModal.maxPossibleUnits} piezas</strong>
              </span>
              <button
                type="button"
                onClick={() => setRecipeSimulationModal(null)}
                className="px-5 py-2 rounded-xl bg-[#2D4F3E] text-white font-bold text-xs hover:bg-[#20392C] transition-colors cursor-pointer"
              >
                Cerrar SimulaciÃ³n
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Cost Breakdown Modal (Excel Formulas & 3D Workshop Calculation) */}
      {breakdownModalProduct && breakdownForm && (() => {
        const costingRecipe = buildCostingRecipeFromBreakdownForm(breakdownModalProduct, breakdownForm);
        const costSummary = costingRecipe
          ? computeRecipeCost(costingRecipe, breakdownModalProduct, rawMaterialsList, workshopParams)
          : null;

        const recipeItems = Array.isArray(breakdownForm.recipeItems) ? breakdownForm.recipeItems : [];
        const yieldUnits = Math.max(1, Number(breakdownForm.yieldUnits) || 1);
        const targetMarginPercent = Math.max(1, Math.min(85, Number(breakdownForm.targetMarginPercent ?? workshopParams.targetMarginPercent) || 40));
        const targetMargin = targetMarginPercent / 100;
        const rawMaterialsPerUnit = costSummary?.materialCost || 0;
        const recipeRawMaterialsCost = rawMaterialsPerUnit * yieldUnits;
        const overheadCostPerUnit = costSummary?.fixedOverheadCost || 0;
        const recipeTotalUnitCost = costSummary?.totalCost || 0;
        const suggestedPriceFromRecipe = recipeTotalUnitCost > 0 ? Math.round(recipeTotalUnitCost / (1 - targetMargin)) : 0;
        const profitFromRecipe = Math.max(0, suggestedPriceFromRecipe - recipeTotalUnitCost);

        // Componentes reales del motor compartido de costos.
        const machineSubtotal = (costSummary?.energyCost || 0) + (costSummary?.wearCost || 0);
        const laborSubtotal = costSummary?.laborCost || 0;
        const liveTotalCost = recipeTotalUnitCost;

        const salePrice = breakdownForm.salePrice !== undefined && breakdownForm.salePrice !== '' && !isNaN(Number(breakdownForm.salePrice))
          ? Number(breakdownForm.salePrice)
          : (suggestedPriceFromRecipe > 0 ? suggestedPriceFromRecipe : (Number(breakdownModalProduct.price) || 0));

        const liveProfit = salePrice > 0 ? Math.round((salePrice - liveTotalCost) * 10) / 10 : 0;
        const liveMargin = salePrice > 0 ? Math.round((liveProfit / salePrice) * 1000) / 10 : 0;
        const liveMarkup = liveTotalCost > 0 ? Math.round((liveProfit / liveTotalCost) * 1000) / 10 : 0;
        const liveTargetPrice = suggestedPriceFromRecipe > 0 ? suggestedPriceFromRecipe : Math.round((liveTotalCost / (1 - targetMargin)) * 10) / 10;
        const reservePercent = Math.max(0, Number(workshopParams.reservePercent) || 10) / 100;
        const liveReserve = liveProfit > 0 ? Math.round((liveProfit * reservePercent) * 10) / 10 : 0;
        const liveFreeProfit = Math.round((liveProfit - liveReserve) * 10) / 10;

        // Filtrado de materiales para el selector
        const filteredMaterialsForRecipe = rawMaterialsList.filter(m => {
          if (!recipeMatSearch.trim()) return true;
          const q = recipeMatSearch.toLowerCase();
          return (m.name || '').toLowerCase().includes(q) || (m.materialType || '').toLowerCase().includes(q) || (m.color || '').toLowerCase().includes(q);
        });

        // Preview del costo en el modal de aÃ±adir cantidades
        let previewCalculatedPrice = 0;
        if (recipeSelectedMatId) {
          const selMat = rawMaterialsList.find(m => m.id === recipeSelectedMatId);
          if (selMat) {
            const pkg = parsePackageInfo(selMat);
            const cost = Number(selMat.costPerUnit || selMat.packageCost || 0);
            const pkgQty = Number(pkg.packageQuantity) || 1;
            const pkgUnit = (pkg.packageMeasurement || 'pza').toLowerCase().trim();
            const reqUnit = (recipeNewMatUnit || pkgUnit).toLowerCase().trim();
            const qty = Number(recipeNewMatQty) || 0;
            let unitC = cost / pkgQty;
            if ((reqUnit === 'g' || reqUnit === 'gr') && (pkgUnit === 'kg' || pkgUnit === 'kilo')) unitC = cost / (pkgQty * 1000);
            else if ((reqUnit === 'kg' || reqUnit === 'kilo') && (pkgUnit === 'g' || pkgUnit === 'gr')) unitC = (cost / pkgQty) * 1000;
            else if ((reqUnit === 'ml' || reqUnit === 'mililitro') && (pkgUnit === 'l' || pkgUnit === 'litro')) unitC = cost / (pkgQty * 1000);
            else if ((reqUnit === 'l' || reqUnit === 'litro') && (pkgUnit === 'ml' || pkgUnit === 'mililitro')) unitC = (cost / pkgQty) * 1000;
            previewCalculatedPrice = Math.round(qty * unitC * 100) / 100;
          }
        } else if (recipeCustomMatName.trim()) {
          previewCalculatedPrice = Math.round((Number(recipeNewMatQty) || 0) * (Number(recipeCustomUnitCost) || 0) * 100) / 100;
        }

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div
              className="bg-[#FBF9F5] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E8E4DA] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#1F2421] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading flex items-center gap-2">
                      <span>Calculadora de Costos &amp; MÃ¡rgenes</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-bold border border-emerald-700">
                        FÃ³rmulas de Taller 3D
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Producto: <strong className="text-white">{breakdownModalProduct.name}</strong> â€¢ CÃ³digo: <span className="font-mono text-emerald-300">{breakdownModalProduct.code || 'S/C'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBreakdownModalProduct(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

                {/* Banner de Tarifas Aplicadas */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-emerald-900">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Tarifas activas: PLA <strong>${plaKg}/kg</strong> â€¢ TPU <strong>${tpuKg}/kg</strong> â€¢ Merma <strong>{workshopParams.filamentWastePercent || 15}%</strong> â€¢ Luz+Desgaste <strong>${(electHour + wearHour).toFixed(2)}/h</strong> â€¢ Mano de obra <strong>${laborHour}/h</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-emerald-800 font-bold border border-emerald-200">
                    Auto-sincronizado con Excel
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* COLUMNA 1: Calculadora de Costos Recetas (Estilo App MÃ³vil Beauty Tools Apps) */}
                  <div className="bg-[#141615] text-white p-4 sm:p-5 rounded-2xl border-2 border-[#EA580C] shadow-xl space-y-4 flex flex-col justify-between">
                    
                    {/* Header de la Receta */}
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#EA580C] font-black text-lg">â†</span>
                          <h4 className="text-base font-black text-white font-heading tracking-wide">
                            Receta
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#EA580C]/20 text-[#FF7A00] text-[10px] font-bold border border-[#EA580C]/40">
                            Calculadora de Taller
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Feedback tÃ¡ctil al recalcular
                            const btn = document.getElementById('btn-recipe-calc-action');
                            if (btn) {
                              btn.classList.add('text-amber-400');
                              setTimeout(() => btn.classList.remove('text-amber-400'), 500);
                            }
                          }}
                          id="btn-recipe-calc-action"
                          className="text-white hover:text-[#FF7A00] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                          <span>CALCULAR</span>
                        </button>
                      </div>

                      {/* Nombre de la Receta */}
                      <div className="mt-3 space-y-1">
                        <label className="block text-xs font-bold text-gray-300">
                          Nombre de la receta
                        </label>
                        <input
                          type="text"
                          value={breakdownForm.recipeName || ''}
                          onChange={e => setBreakdownForm({ ...breakdownForm, recipeName: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#222524] border border-gray-700 text-white font-bold text-xs focus:border-[#EA580C] focus:outline-none transition-all"
                          placeholder="ImpresiÃ³n 3d"
                        />
                      </div>

                      {/* BotÃ³n Naranja Central: AÃ‘ADIR CANTIDADES */}
                      <div className="my-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setRecipeSelectedMatId('');
                            setRecipeCustomMatName('');
                            setRecipeNewMatQty(12);
                            setRecipeNewMatUnit('g');
                            setShowAddQuantityModal(true);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] active:scale-[0.98] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>AÃ‘ADIR CANTIDADES</span>
                        </button>
                      </div>

                      {/* Lista de Cantidades de Materiales (Borde Naranja) */}
                      <div className="rounded-xl border-2 border-[#EA580C] bg-[#1C1F1E] p-3 space-y-2.5 max-h-52 overflow-y-auto">
                        {recipeItems.length === 0 ? (
                          <div className="py-4 px-2 text-center text-xs font-medium text-gray-400">
                            Receta sin cantidades de material
                          </div>
                        ) : (
                          recipeItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between border-b border-gray-800/80 pb-2 last:border-b-0 last:pb-0"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-black text-white truncate">
                                  {item.quantity} {item.unit} - {item.name}
                                </div>
                                <div className="text-[11px] font-bold text-gray-300">
                                  Precio: <span className="font-mono text-amber-300">${Number(item.lineTotal || 0).toFixed(2)}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipeItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Eliminar de la receta"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* ParÃ¡metros de la Receta (Borde Naranja) */}
                      <div className="rounded-xl border-2 border-[#EA580C] bg-[#1C1F1E] p-3.5 space-y-3 mt-3">
                        {/* Rendimiento */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200">
                            Â¿CuÃ¡ntas unidades rinde la receta?
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={breakdownForm.yieldUnits ?? 1}
                            onChange={e => setBreakdownForm({ ...breakdownForm, yieldUnits: Math.max(1, parseFloat(e.target.value) || 1) })}
                            className="w-24 px-3 py-1.5 rounded-lg bg-[#141615] border border-gray-700 text-white font-mono font-bold text-xs focus:border-[#EA580C] focus:outline-none"
                            placeholder="1"
                          />
                        </div>

                        {/* Overhead fijo por pieza */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200 leading-tight">
                            Overhead fijo por pieza (agua, renta, consumibles indirectos)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={breakdownForm.fixedOverheadCost ?? 0}
                              onChange={e => setBreakdownForm({ ...breakdownForm, fixedOverheadCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                              className="w-24 px-3 py-1.5 rounded-lg bg-[#141615] border border-gray-700 text-white font-mono font-bold text-xs focus:border-[#EA580C] focus:outline-none"
                              placeholder="0.00"
                            />
                            <span className="text-[10px] font-bold text-[#FF7A00]">MXN</span>
                          </div>
                        </div>

                        {/* Margen objetivo sobre precio de venta */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200">
                            Margen objetivo sobre precio de venta
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={breakdownForm.targetMarginPercent ?? workshopParams.targetMarginPercent ?? 40}
                              onChange={e => setBreakdownForm({ ...breakdownForm, targetMarginPercent: Math.max(1, Math.min(85, parseFloat(e.target.value) || 40)) })}
                              className="w-24 px-3 py-1.5 rounded-lg bg-[#141615] border border-gray-700 text-white font-mono font-bold text-xs focus:border-[#EA580C] focus:outline-none"
                              placeholder="40"
                            />
                            <span className="text-sm font-black text-[#FF7A00]">%</span>
                          </div>
                        </div>
                      </div>

                      {/* Notas de la Receta */}
                      <div className="mt-3 space-y-1">
                        <label className="block text-xs font-bold text-gray-300">
                          Notas
                        </label>
                        <textarea
                          rows={2}
                          value={breakdownForm.recipeNotes || ''}
                          onChange={e => setBreakdownForm({ ...breakdownForm, recipeNotes: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#222524] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none resize-none"
                          placeholder="Notas opcionales de preparaciÃ³n o taller..."
                        />
                      </div>
                    </div>

                    {/* Resumen Financiero Directo de la Receta con botÃ³n para aplicar precio */}
                    <div className="pt-2 border-t border-gray-800 space-y-2">
                      <div className="p-3 rounded-xl bg-[#0F1110] border border-gray-800 text-[11px] space-y-1 text-gray-300">
                        <div className="flex justify-between">
                          <span>Materia Prima ({yieldUnits > 1 ? `Lote $${recipeRawMaterialsCost.toFixed(2)}` : 'unidad'}):</span>
                          <strong className="font-mono text-white">${rawMaterialsPerUnit.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Overhead fijo por pieza:</span>
                          <strong className="font-mono text-amber-300">+${overheadCostPerUnit.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between font-bold text-white border-t border-gray-800 pt-1">
                          <span>Costo FabricaciÃ³n Unidad:</span>
                          <span className="font-mono text-emerald-400">${recipeTotalUnitCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[#FF7A00] font-bold">
                          <span>Margen objetivo ({targetMarginPercent}%):</span>
                          <span className="font-mono">+${profitFromRecipe.toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBreakdownForm({ ...breakdownForm, salePrice: suggestedPriceFromRecipe })}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#FF7A00] hover:from-[#C2410C] hover:to-[#EA580C] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-4 h-4 fill-black" />
                        <span>Aplicar Precio Sugerido: ${suggestedPriceFromRecipe} MXN</span>
                      </button>
                    </div>

                  </div>

                  {/* COLUMNA 2: Tiempos de MÃ¡quina y Mano de Obra */}
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-[#E8E4DA]">
                    <h4 className="font-bold text-sm text-[#1F2421] border-b pb-2 flex items-center gap-2">
                      <span>âš¡ 2. Tiempo de MÃ¡quina &amp; Mano de Obra</span>
                    </h4>

                    {/* Horas MÃ¡quina */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700">Horas de ImpresiÃ³n 3D / MÃ¡quina</label>
                        <span className="font-mono font-bold text-emerald-700">${machineSubtotal.toFixed(2)} MXN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={breakdownForm.machineHours ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, machineHours: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold"
                          placeholder="2.5"
                        />
                        <span className="text-gray-400 font-medium">hrs</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Calculado a ${electHour}/h luz + ${wearHour}/h amortizaciÃ³n y boquilla.</p>
                    </div>

                    {/* Minutos Mano de Obra */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700">Mano de Obra / Acabado (Minutos)</label>
                        <span className="font-mono font-bold text-emerald-700">${laborSubtotal.toFixed(2)} MXN</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={breakdownForm.manualWorkMin ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, manualWorkMin: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold"
                          placeholder="6"
                        />
                        <span className="text-gray-400 font-medium">min</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Post-proceso, retiro de soportes, ensamblado manual (${laborHour}/h = $1/min).</p>
                    </div>

                    {/* Costos Indirectos / Varios */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">DiseÃ±o / STL ($)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={breakdownForm.prepCost ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, prepCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-mono"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Fallas / Merma ($)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={breakdownForm.additionalFailuresCost ?? 0}
                          onChange={e => setBreakdownForm({ ...breakdownForm, additionalFailuresCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-mono"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Estado de Costeo */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="font-bold text-gray-700 block mb-1">Estado de VerificaciÃ³n de Costo</label>
                      <select
                        value={breakdownForm.costStatus || 'Verificado'}
                        onChange={e => setBreakdownForm({ ...breakdownForm, costStatus: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium"
                      >
                        <option value="Verificado">âœ… Verificado (Basado en piezas reales)</option>
                        <option value="Estimado">âš ï¸ Estimado (Pendiente de pesar)</option>
                        <option value="En cotizaciÃ³n">ðŸ’¬ En cotizaciÃ³n especial</option>
                      </select>
                    </div>

                    {/* Subtotal Tiempos */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-700">Subtotal Taller &amp; Trabajo:</span>
                      <span className="font-mono font-black text-gray-900 text-sm">
                        ${(machineSubtotal + laborSubtotal + Number(breakdownForm.prepCost || 0) + Number(breakdownForm.additionalFailuresCost || 0)).toFixed(2)} MXN
                      </span>
                    </div>

                  </div>

                </div>

                {/* Resumen Financiero Completo en Vivo */}
                <div className="p-5 rounded-2xl bg-[#1F2421] text-white space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>AnÃ¡lisis de Rentabilidad Resultante</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      liveProfit < 0
                        ? 'bg-rose-900 text-rose-200'
                        : liveMargin >= 40
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-amber-900 text-amber-200'
                    }`}>
                      {liveProfit < 0 ? 'En PÃ©rdida' : liveMargin >= 40 ? 'Margen Ã“ptimo (â‰¥40%)' : 'Bajo Objetivo (<40%)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Costo Total</div>
                      <div className="text-lg font-black font-mono text-white mt-0.5">${liveTotalCost.toFixed(1)}</div>
                      <div className="text-[10px] text-gray-400">filamento + mÃ¡quina + mo</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col justify-center items-center">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                        <span>Precio de Venta</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">Editable</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={breakdownForm.salePrice !== undefined ? breakdownForm.salePrice : (breakdownModalProduct.price || '')}
                          onChange={e => {
                            const val = e.target.value;
                            setBreakdownForm({ ...breakdownForm, salePrice: val === '' ? '' : parseFloat(val) });
                          }}
                          className="w-24 px-1.5 py-0.5 text-center text-lg font-black font-mono text-emerald-400 bg-white/10 border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white/20 transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">se guardarÃ¡ en catÃ¡logo</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Ganancia Neta</div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${liveProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                        ${liveProfit.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-gray-400">libre de costos</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Margen s/ Venta</div>
                      <div className={`text-lg font-black font-mono mt-0.5 ${liveMargin >= 40 ? 'text-emerald-300' : liveProfit < 0 ? 'text-rose-400' : 'text-amber-300'}`}>
                        {liveMargin}%
                      </div>
                      <div className="text-[10px] text-gray-400">Markup: {liveMarkup}%</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
                    <div className="flex items-center gap-4">
                      <span>Reserva taller ({Math.round(reservePercent * 100)}%): <strong className="text-amber-300 font-mono">${liveReserve.toFixed(1)} MXN</strong></span>
                      <span>Utilidad de bolsillo: <strong className="text-emerald-300 font-mono">${liveFreeProfit.toFixed(1)} MXN</strong></span>
                    </div>
                    <div>
                      <span>Precio sugerido (para {targetMarginPercent}% margen): <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">${liveTargetPrice.toFixed(1)} MXN</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setBreakdownModalProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCostBreakdown}
                  className="px-6 py-2.5 rounded-xl bg-[#2D4F3E] text-white font-bold hover:bg-[#20392C] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Costo (${liveTotalCost.toFixed(1)}) y Precio (${salePrice > 0 ? `${salePrice}` : '0'} MXN)</span>
                </button>
              </div>

              {/* Modal Flotante: AÃ‘ADIR CANTIDADES (Estilo App Beauty Tools Apps) */}
              {showAddQuantityModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div
                    className="bg-[#18181B] text-white rounded-3xl max-w-md w-full p-5 sm:p-6 border-2 border-[#EA580C] shadow-2xl space-y-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-[#EA580C]/20 text-[#FF7A00]">
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-white font-heading">
                            AÃ±adir Cantidades a la Receta
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            Selecciona del inventario de taller o ingresa un insumo libre
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddQuantityModal(false)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Buscador de Insumos */}
                      <div>
                        <label className="block text-gray-300 font-bold mb-1">
                          Insumos del Taller ({rawMaterialsList.length} disponibles)
                        </label>
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Buscar insumo (ej. PLA, fijador, alcohol, madera, taza)..."
                            value={recipeMatSearch}
                            onChange={e => setRecipeMatSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#27272A] border border-gray-700 text-white placeholder-gray-500 text-xs focus:border-[#EA580C] focus:outline-none"
                          />
                        </div>

                        <select
                          value={recipeSelectedMatId}
                          onChange={e => {
                            const id = e.target.value;
                            setRecipeSelectedMatId(id);
                            if (id) {
                              const mat = rawMaterialsList.find(m => m.id === id);
                              if (mat) {
                                const pkg = parsePackageInfo(mat);
                                setRecipeNewMatUnit(pkg.packageMeasurement || 'g');
                              }
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none"
                        >
                          <option value="">-- Seleccionar de inventario ({filteredMaterialsForRecipe.length} opciones) --</option>
                          {filteredMaterialsForRecipe.slice(0, 100).map(mat => (
                            <option key={mat.id} value={mat.id}>
                              {mat.name} ({mat.unit || 'unidad'}) â€” ${mat.costPerUnit || mat.packageCost || 0}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* O Insumo Personalizado */}
                      {!recipeSelectedMatId && (
                        <div className="p-3 bg-white/5 rounded-xl border border-gray-700/70 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            O ingresa un insumo personalizado:
                          </span>
                          <input
                            type="text"
                            placeholder="Nombre del insumo (ej. Laca fijadora, alcohol, argolla)"
                            value={recipeCustomMatName}
                            onChange={e => setRecipeCustomMatName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#27272A] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none"
                          />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Costo unitario ($ MXN):</span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1 text-gray-500 font-bold">$</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={recipeCustomUnitCost}
                                onChange={e => setRecipeCustomUnitCost(parseFloat(e.target.value) || 0)}
                                className="w-24 pl-6 pr-2 py-1 rounded bg-[#27272A] border border-gray-700 text-white text-xs font-mono font-bold focus:border-[#EA580C] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cantidad y Unidad */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-gray-300 font-bold mb-1">Cantidad Usada</label>
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={recipeNewMatQty}
                            onChange={e => setRecipeNewMatQty(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-gray-700 text-white font-mono font-bold text-sm focus:border-[#EA580C] focus:outline-none"
                            placeholder="12"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 font-bold mb-1">Unidad de Medida</label>
                          <select
                            value={recipeNewMatUnit}
                            onChange={e => setRecipeNewMatUnit(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#27272A] border border-gray-700 text-white text-xs focus:border-[#EA580C] focus:outline-none font-bold"
                          >
                            <option value="g">Gramos (g)</option>
                            <option value="kg">Kilogramos (kg)</option>
                            <option value="mL">Mililitros (mL)</option>
                            <option value="L">Litros (L)</option>
                            <option value="pza">Piezas (pza)</option>
                            <option value="cmÂ²">CentÃ­metrosÂ² (cmÂ²)</option>
                            <option value="m">Metros (m)</option>
                            <option value="hoja">Hojas (hoja)</option>
                          </select>
                        </div>
                      </div>

                      {/* Vista previa en vivo del precio calculado */}
                      <div className="p-3 bg-[#FF7A00]/10 rounded-xl border border-[#FF7A00]/40 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-gray-400">Precio estimado del insumo:</div>
                          <div className="text-[10px] text-gray-500">
                            {recipeNewMatQty} {recipeNewMatUnit}
                          </div>
                        </div>
                        <span className="font-mono font-black text-amber-400 text-lg">
                          ${previewCalculatedPrice.toFixed(2)} MXN
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => setShowAddQuantityModal(false)}
                        className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddRecipeItemFromModal}
                        disabled={!recipeSelectedMatId && !recipeCustomMatName.trim()}
                        className="px-5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>AÃ±adir a la receta</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Modal General de ConfirmaciÃ³n y Desglose de Cambios del Panel Administrador */}
      <AdminConfirmSaveModal
        isOpen={adminConfirmModal.isOpen}
        title={adminConfirmModal.title}
        subtitle={adminConfirmModal.subtitle}
        badge={adminConfirmModal.badge}
        confirmText={adminConfirmModal.confirmText}
        changes={adminConfirmModal.changes}
        onConfirm={adminConfirmModal.onConfirm}
        onCancel={() => setAdminConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

{/* Modal de ConfirmaciÃ³n para Eliminar Producto (Sin bloqueos de window.confirm) */}
      {confirmDeleteProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 space-y-5 text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950 font-heading">Â¿Eliminar producto del catÃ¡logo?</h3>
                <p className="text-xs text-rose-600 font-medium">Esta acciÃ³n quitarÃ¡ el producto de la tienda y del catÃ¡logo activo.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <img loading="lazy"
                src={confirmDeleteProduct.primaryImage || './brand/artesano_isotipo_transparente.png'}
                alt={confirmDeleteProduct.name}
                className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0 bg-white"
                onError={(e) => { e.target.src = './brand/artesano_isotipo_transparente.png'; }}
              />
              <div className="min-w-0 flex-1 text-xs">
                <h4 className="font-bold text-stone-900 truncate">{confirmDeleteProduct.name}</h4>
                <p className="text-stone-500 font-mono text-[11px]">SKU: {confirmDeleteProduct.sku || confirmDeleteProduct.code || 'N/A'}</p>
                <p className="text-emerald-700 font-extrabold mt-0.5">${confirmDeleteProduct.price} MXN</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExecution}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>SÃ­, Eliminar Producto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal al Salir de Admin: Resumen de Cambios Realizados y Pregunta de Guardar */}
      {showExitReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8E4DA] shadow-2xl p-6 space-y-5 text-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 font-heading">Â¿Deseas guardar los cambios realizados?</h3>
                <p className="text-xs text-stone-500">Se registraron modificaciones durante esta sesiÃ³n en el panel:</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {sessionChanges.deleted.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Productos eliminados ({sessionChanges.deleted.length}):</span>
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-rose-800">
                    {sessionChanges.deleted.map((item, idx) => (
                      <li key={idx} className="font-medium">
                        <span className="font-bold">{item.name}</span> {item.sku && <span className="font-mono text-[10.5px]">({item.sku})</span>} <span className="text-stone-400 text-[10px]">Â· {item.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sessionChanges.edited.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Productos editados ({sessionChanges.edited.length}):</span>
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-amber-800">
                    {sessionChanges.edited.map((item, idx) => (
                      <li key={idx} className="font-medium">
                        <span className="font-bold">{item.name}</span> {item.sku && <span className="font-mono text-[10.5px]">({item.sku})</span>} <span className="text-stone-400 text-[10px]">Â· {item.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sessionChanges.added.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nuevos productos creados ({sessionChanges.added.length}):</span>
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-emerald-800">
                    {sessionChanges.added.map((item, idx) => (
                      <li key={idx} className="font-medium">
                        <span className="font-bold">{item.name}</span> {item.sku && <span className="font-mono text-[10.5px]">({item.sku})</span>} <span className="text-stone-400 text-[10px]">Â· {item.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setShowExitReviewModal(false);
                  setSessionChanges({ deleted: [], edited: [], added: [] });
                  loadAllData();
                  onClose();
                }}
                className="w-full sm:w-auto text-center text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline py-1.5 cursor-pointer"
              >
                Descartar cambios y salir
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowExitReviewModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer transition-all"
                >
                  Seguir Editando
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitReviewModal(false);
                    setSessionChanges({ deleted: [], edited: [], added: [] });
                    if (onRefreshCatalog) onRefreshCatalog();
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black shadow-md active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar y Salir a Tienda</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estudio FotogrÃ¡fico de CatÃ¡logo (4 Fotos con Sharp / IA) */}
      <ProductPhotoStudioModal
        isOpen={isPhotoStudioOpen}
        onClose={() => setIsPhotoStudioOpen(false)}
        products={products}
        initialProductId={photoStudioProductId}
        onProductUpdated={handleProductUpdatedFromStudio}
      />
    </>
  );
}

