import React, { useMemo, useState } from 'react';
import {
  Wrench, Boxes, Plus, Trash2, ChevronDown, ChevronRight, Link2,
  Calculator, Zap, Clock, DollarSign, Package, Layers, Paintbrush,
  Sparkles, Printer, Scissors, Box, Shirt, Check, AlertCircle, Save,
  ArrowRight, Search, X, Eye, PackageCheck, Factory, Wand2, Info,
  RefreshCw, Cog, Hammer, Leaf, CheckCircle2, Copy, Unlink,
  Spool, TreePine, Magnet, Lightbulb, PaintBucket, Droplets, Pencil,
  Filter, ArrowDownUp, BadgeCheck
} from 'lucide-react';
import {
  computeRecipeCost, applySummaryToRecipe, buildRecipeFromProduct,
  normalizeRecipeItems, inferSupplyType, enrichRecipeItems, materialUnitCost
} from '../../shared/costing';
import { parsePackageInfo } from './RawMaterialsSection';

const SUPPLY_GROUPS = [
  {
    id: 'direct', label: 'Materias primas directas', short: 'Directos',
    desc: 'Madera, acrílico, filamento, tela, tazas y piezas que sí forman el producto.',
    icon: Box, tone: 'emerald'
  },
  {
    id: 'complementary', label: 'Insumos complementarios', short: 'Complementarios',
    desc: 'Herrajes, luces, argollas, imanes, cierres y accesorios que complementan la pieza.',
    icon: Cog, tone: 'sky'
  },
  {
    id: 'intangible', label: 'Intangibles y licencias', short: 'Intangibles',
    desc: 'Diseño, licencias, modelos, archivos y servicios digitales.',
    icon: Sparkles, tone: 'violet'
  },
  {
    id: 'micro', label: 'Micro insumos', short: 'Micro insumos',
    desc: 'Tornillería, gotas de pegamento, lijas, cintas y consumibles mínimos.',
    icon: Hammer, tone: 'orange'
  },
  {
    id: 'finish', label: 'Acabados y terminaciones', short: 'Acabados',
    desc: 'Barnices, tintes, pinturas, selladores y detalles finales.',
    icon: Paintbrush, tone: 'purple'
  },
  {
    id: 'indirect', label: 'Insumos indirectos', short: 'Indirectos',
    desc: 'Guantes, protección, limpieza, empaque y consumibles de operación.',
    icon: Leaf, tone: 'stone'
  },
  {
    id: 'production', label: 'Producción y servicios', short: 'Producción',
    desc: 'Maquila, corte externo, grabado, impresión o servicios subcontratados.',
    icon: Factory, tone: 'amber'
  },
  {
    id: 'component', label: 'Productos vinculados', short: 'Componentes',
    desc: 'Productos ya costeados que forman parte de este combo o pack.',
    icon: Link2, tone: 'rose'
  }
];

const GROUP_MAP = Object.fromEntries(SUPPLY_GROUPS.map(group => [group.id, group]));

const AREAS = [
  {
    id: 'laser', name: 'Corte & Grabado Láser', short: 'Láser',
    desc: 'Maderas, MDF, acrílico y grabado de precisión.',
    power: '450 W', icon: Scissors, tone: 'amber'
  },
  {
    id: '3d', name: 'Impresión 3D FDM', short: '3D',
    desc: 'PLA, PETG, TPU, soportes y prototipos.',
    power: '250 W', icon: Boxes, tone: 'emerald'
  },
  {
    id: 'sublimation', name: 'Sublimación', short: 'Sublimación',
    desc: 'Tazas, termos, fotobotones y rígidos full color.',
    power: '1,800 W', icon: Layers, tone: 'blue'
  },
  {
    id: 'vinyl', name: 'Corte Cameo & Vinil', short: 'Cameo',
    desc: 'Vinil de corte, textil y transfer.',
    power: '50 W', icon: Wand2, tone: 'purple'
  },
  {
    id: 'print', name: 'Impresión Láser / Tinta', short: 'Impresión',
    desc: 'Invitaciones, tarjetas, papelería y artes impresas.',
    power: '900 W', icon: Printer, tone: 'cyan'
  }
];

function groupIdFor(item) {
  const type = inferSupplyType(item);
  if (type && GROUP_MAP[type]) return type;
  return 'direct';
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function materialVisual(item = {}) {
  const text = normalizeText(`${item.name || ''} ${item.category || ''}`);
  if (/\btpu\b/.test(text)) return { icon: Spool, code: 'TPU', tone: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' };
  if (/\bpetg\b/.test(text)) return { icon: Spool, code: 'PETG', tone: 'bg-sky-50 text-sky-700 border-sky-200' };
  if (/\bpla\b|filamento|bobina/.test(text)) return { icon: Spool, code: 'PLA', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (/madera|triplay|mdf|pino|nogal|pino|liston|tabla/.test(text)) return { icon: TreePine, code: 'MAD', tone: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (/acrilico|acrílico|placa|lamina|policarbonato/.test(text)) return { icon: Layers, code: 'ACR', tone: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  if (/iman|imán|magnet/.test(text)) return { icon: Magnet, code: 'IMÁN', tone: 'bg-rose-50 text-rose-700 border-rose-200' };
  if (/led|luz|iluminacion|iluminación/.test(text)) return { icon: Lightbulb, code: 'LED', tone: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  if (/barniz|tinte|pintura|sellador|laca|esmalte/.test(text)) return { icon: PaintBucket, code: 'ACAB', tone: 'bg-purple-50 text-purple-700 border-purple-200' };
  if (/pegamento|resistol|cianocrilato|adhesivo|silicon/.test(text)) return { icon: Droplets, code: 'GLUE', tone: 'bg-orange-50 text-orange-700 border-orange-200' };
  if (/lija|cinta|brocha|pincel|consumible/.test(text)) return { icon: Wrench, code: 'MICRO', tone: 'bg-stone-100 text-stone-700 border-stone-200' };
  if (/tornillo|clavo|argolla|herraje|inserto|mecanismo|switch|interruptor|broche|cierre|remache|mosqueton/.test(text)) return { icon: Cog, code: 'HER', tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  if (/caja|bolsa|empaque|etiqueta|celofan|viruta|burbuja|kraft|esquinero/.test(text)) return { icon: Package, code: 'PACK', tone: 'bg-orange-50 text-orange-700 border-orange-200' };
  if (/servicio|maquila|corte externo|grabado externo|instalacion|flete|envio/.test(text)) return { icon: Factory, code: 'SERV', tone: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (/diseno|licencia|archivo|modelo digital|arte digital|render|plantilla/.test(text)) return { icon: Sparkles, code: 'DIG', tone: 'bg-violet-50 text-violet-700 border-violet-200' };
  if (/textil|tela|playera|gorra|tote|vinil textil/.test(text)) return { icon: Shirt, code: 'TEXTIL', tone: 'bg-blue-50 text-blue-700 border-blue-200' };
  return { icon: Package, code: 'INS', tone: 'bg-stone-100 text-stone-600 border-stone-200' };
}

function MaterialBadge({ item, material, size = 'md' }) {
  const visual = materialVisual({ ...item, ...material });
  const Icon = visual.icon;
  const box = size === 'sm' ? 'w-8 h-8 rounded-xl' : 'w-10 h-10 rounded-2xl';
  return (
    <span className={`${box} ${visual.tone} border flex items-center justify-center shrink-0 relative`} title={visual.code}>
      <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      <span className="absolute -bottom-1 -right-1 px-1 py-[1px] rounded bg-white/95 border border-current/20 text-[6.5px] font-black leading-none shadow-2xs">
        {visual.code}
      </span>
    </span>
  );
}

function materialForItem(item, rawMaterials = []) {
  if (!item) return null;
  if (item.materialId) {
    const byId = rawMaterials.find(mat => mat.id === item.materialId);
    if (byId) return byId;
  }
  const name = normalizeText(item.name);
  if (!name) return null;
  return rawMaterials.find(mat => {
    const matName = normalizeText(mat.name);
    return matName && (name.includes(matName) || matName.includes(name));
  }) || null;
}

function money(value) {
  const number = Number(value) || 0;
  return `$${number.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isPrintTechnique(value) {
  return value === 'print' || value === 'impresion_laser';
}

function areaNamesForTechniques(techniques = []) {
  const names = new Set();
  (Array.isArray(techniques) ? techniques : []).forEach(value => {
    const technique = String(value || '');
    if (!technique) return;
    if (isPrintTechnique(technique)) names.add('Impresión Láser / Tinta');
    else if (technique.startsWith('laser')) names.add('Corte & Grabado Láser');
    else if (technique.startsWith('3d')) names.add('Impresión 3D');
    else if (technique === 'sublimation' || technique === 'sublimacion') names.add('Sublimación');
    else if (technique === 'vinyl' || technique === 'vinil') names.add('Corte Cameo & Vinil');
    else if (technique === 'nfc') names.add('NFC / Smart');
    else names.add(technique);
  });
  return [...names];
}

export default function ProductWorkshopTab({
  editorForm,
  setEditorForm,
  rawMaterialsList = [],
  products = [],
  workshopParams = {},
  onToggleTechnique,
  onSetSupplyType,
  onRemoveItem,
  onUpdateItem,
  onUpdateRecipeField,
  onSyncCost,
  onSimulateProduction,
  onDeductStockNow,
  onNavigate,
  editorMessage
}) {
  const [openGroups, setOpenGroups] = useState(() => new Set(['direct']));
  const [expandedComponents, setExpandedComponents] = useState(() => new Set());
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [componentQty, setComponentQty] = useState(1);
  const [addGroup, setAddGroup] = useState('direct');
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [customName, setCustomName] = useState('');
  const [netQty, setNetQty] = useState(1);
  const [wasteQty, setWasteQty] = useState(0);
  const [unit, setUnit] = useState('pza');
  const [unitCost, setUnitCost] = useState('');
  const [localMessage, setLocalMessage] = useState(null);
  const [simUnits, setSimUnits] = useState(1);
  const [expandedItemId, setExpandedItemId] = useState('');
  const [showMaterialResults, setShowMaterialResults] = useState(false);

  const recipe = editorForm?.manufacturingRecipe || { items: [] };
  const rawItems = Array.isArray(recipe.items) ? recipe.items : [];
  const items = useMemo(() => normalizeRecipeItems(rawItems, rawMaterialsList), [rawItems, rawMaterialsList]);
  const summary = useMemo(
    () => computeRecipeCost(recipe, editorForm, rawMaterialsList, workshopParams),
    [recipe, editorForm, rawMaterialsList, workshopParams]
  );

  const groupData = useMemo(() => {
    return SUPPLY_GROUPS.map(group => {
      const groupItems = items.filter(item => groupIdFor(item) === group.id);
      return {
        ...group,
        items: groupItems,
        cost: groupItems.reduce((sum, item) => sum + number(item.totalCost), 0)
      };
    });
  }, [items]);

  const ownGroups = groupData.filter(group => group.id !== 'component');
  const ownCost = ownGroups.reduce((sum, group) => sum + group.cost, 0);
  const componentGroup = groupData.find(group => group.id === 'component');
  const componentCost = componentGroup?.cost || 0;

  const selectedMaterial = rawMaterialsList.find(mat => mat.id === selectedMaterialId) || null;
  const linkedProducts = products.filter(product => product?.id && product.id !== editorForm?.id);
  const selectedComponent = linkedProducts.find(product => product.id === selectedComponentId) || null;

  const addGroupCategories = {
    direct: ['3d', 'laser', 'sublimation', 'vinyl', 'print'],
    complementary: ['assembly', 'spare_parts'],
    intangible: [],
    micro: ['consumables', 'assembly'],
    finish: ['laser', 'sublimation', 'vinyl'],
    indirect: ['packaging', 'consumables'],
    production: ['assembly', 'spare_parts']
  };

  const materialResults = useMemo(() => {
    const query = normalizeText(materialSearch.trim());
    const categories = addGroupCategories[addGroup] || [];
    return rawMaterialsList
      .filter(mat => {
        if (!query) return categories.length === 0 || categories.includes(mat.category);
        return normalizeText(`${mat.name || ''} ${mat.category || ''} ${mat.supplier || ''}`).includes(query);
      })
      .slice(0, 12);
  }, [rawMaterialsList, materialSearch, addGroup]);

  const activeAreas = AREAS.filter(area => {
    const techniques = editorForm?.techniques || [];
    if (area.id === 'print') return techniques.some(isPrintTechnique);
    if (area.id === 'laser') return techniques.some(t => String(t).startsWith('laser'));
    return techniques.includes(area.id);
  });

  const notify = (text, type = 'success') => {
    setLocalMessage({ text, type });
    window.setTimeout(() => setLocalMessage(null), 3200);
  };

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const updateRecipe = (nextItems, recipeExtra = {}, formExtra = {}) => {
    const nextRecipe = { ...recipe, items: nextItems, ...recipeExtra };
    const nextSummary = computeRecipeCost(nextRecipe, editorForm, rawMaterialsList, workshopParams);
    const normalizedRecipe = applySummaryToRecipe(nextRecipe, nextSummary);
    const previousComponentNames = new Set(
      rawItems.filter(item => item.supplyType === 'component').map(item => String(item.name || '').trim())
    );
    const nextComponents = nextItems.filter(item => item.supplyType === 'component');
    const nextComponentNames = new Set(nextComponents.map(item => String(item.name || '').trim()));
    const manualIncluded = (editorForm.includedItems || []).filter(text => {
      const match = String(text || '').match(/^[\d.,]+\s*[×x]\s*(.+)$/);
      if (!match) return true;
      const name = match[1].trim();
      return !previousComponentNames.has(name) && !nextComponentNames.has(name);
    });
    const componentLines = nextComponents.map(item => {
      const quantity = number(item.netQuantity, 1);
      return `${quantity} × ${item.name}`;
    });
    const includedItems = [...manualIncluded, ...componentLines];
    setEditorForm(prev => ({
      ...prev,
      ...formExtra,
      includedItems,
      manufacturingRecipe: normalizedRecipe
    }));
    return nextSummary;
  };

  const resetAddForm = () => {
    setSelectedMaterialId('');
    setCustomName('');
    setNetQty(1);
    setWasteQty(0);
    setUnit('pza');
    setUnitCost('');
    setMaterialSearch('');
  };

  const chooseMaterial = (materialId) => {
    setSelectedMaterialId(materialId);
    const mat = rawMaterialsList.find(item => item.id === materialId);
    if (!mat) return;
    const pkg = parsePackageInfo(mat);
    const resolvedUnit = pkg.packageMeasurement || 'pza';
    const packageQty = number(pkg.packageQuantity, 1) || 1;
    const packageCost = number(mat.costPerUnit ?? mat.packageCost, 0);
    setUnit(resolvedUnit);
    setUnitCost(packageCost > 0 ? (packageCost / packageQty).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') : '');
  };

  const addItem = () => {
    const mat = selectedMaterial;
    const name = customName.trim() || mat?.name || '';
    if (!name) {
      notify('Escribe un nombre o elige un insumo del almacén.', 'error');
      return;
    }
    const qty = number(netQty, 0);
    if (qty <= 0) {
      notify('La cantidad neta debe ser mayor a cero.', 'error');
      return;
    }
    const pkg = mat ? parsePackageInfo(mat) : { packageMeasurement: unit || 'pza', packageQuantity: 1 };
    const resolvedUnit = unit || pkg.packageMeasurement || 'pza';
    const resolvedUnitCost = unitCost !== ''
      ? number(unitCost, 0)
      : number(mat?.costPerUnit ?? mat?.packageCost, 0) / (number(pkg.packageQuantity, 1) || 1);
    const totalQty = Math.round((qty + number(wasteQty, 0)) * 100) / 100;
    const totalCost = Math.round(totalQty * resolvedUnitCost * 100) / 100;
    const group = GROUP_MAP[addGroup] || GROUP_MAP.direct;

    const nextItem = {
      id: `item-${addGroup}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      materialId: mat?.id || '',
      name,
      category: mat?.category || (addGroup === 'production' ? 'services' : 'general'),
      supplyType: addGroup,
      manualGroup: true,
      netQuantity: qty,
      wasteQuantity: number(wasteQty, 0),
      wasteType: number(wasteQty, 0) > 0 ? 'trimming' : 'none',
      totalQuantity: totalQty,
      unit: resolvedUnit,
      unitCost: Math.round(resolvedUnitCost * 10000) / 10000,
      totalCost,
      notes: ''
    };

    updateRecipe([...rawItems, nextItem]);
    if (!openGroups.has(addGroup)) {
      setOpenGroups(prev => new Set([...prev, addGroup]));
    }
    resetAddForm();
    notify(`${group.short}: “${name}” agregado a la receta.`);
  };

  const removeItem = (itemId) => {
    const item = rawItems.find(it => it.id === itemId);
    updateRecipe(rawItems.filter(it => it.id !== itemId));
    if (item?.supplyType === 'component') {
      setExpandedComponents(prev => {
        const next = new Set(prev);
        next.delete(item.linkedProductId);
        return next;
      });
    }
  };

  const addLinkedProduct = () => {
    if (!selectedComponent) {
      notify('Elige un producto ya costeado para vincularlo.', 'error');
      return;
    }
    const qty = number(componentQty, 1);
    if (qty <= 0) return;
    const existing = rawItems.find(it => it.supplyType === 'component' && it.linkedProductId === selectedComponent.id);
    if (existing) {
      const updatedItems = rawItems.map(it => {
        if (it !== existing) return it;
        const totalQuantity = Math.round((number(it.netQuantity) + qty) * 100) / 100;
        return {
          ...it,
          netQuantity: totalQuantity,
          totalQuantity,
          totalCost: Math.round(totalQuantity * number(it.unitCost) * 100) / 100
        };
      });
      updateRecipe(updatedItems);
      notify(`Se sumaron ${qty} pieza(s) de “${selectedComponent.name}”.`);
      return;
    }

    const componentRecipe = selectedComponent.manufacturingRecipe?.items?.length
      ? selectedComponent.manufacturingRecipe
      : buildRecipeFromProduct(selectedComponent, rawMaterialsList, workshopParams);
    const componentSummary = computeRecipeCost(componentRecipe, selectedComponent, rawMaterialsList, workshopParams);
    const componentUnitCost = number(selectedComponent.costPrice, 0) > 0
      ? number(selectedComponent.costPrice, 0)
      : componentSummary.totalCost;
    const componentName = selectedComponent.name || 'Producto';
    const nextItem = {
      id: `component-${selectedComponent.id}-${Date.now()}`,
      materialId: '',
      name: componentName,
      category: 'component',
      supplyType: 'component',
      linkedProductId: selectedComponent.id,
      netQuantity: qty,
      wasteQuantity: 0,
      wasteType: 'none',
      totalQuantity: qty,
      unit: 'pza',
      unitCost: Math.round(componentUnitCost * 10000) / 10000,
      totalCost: Math.round(componentUnitCost * qty * 100) / 100,
      notes: 'Producto ya costeado; no duplica sus insumos.'
    };

    updateRecipe([...rawItems, nextItem]);
    setSelectedComponentId('');
    setComponentQty(1);
    setExpandedComponents(prev => new Set([...prev, selectedComponent.id]));
    notify(`“${componentName}” vinculado. Sus insumos se consultan sin duplicarse.`);
  };

  const updateComponentQty = (itemId, qty) => {
    const nextQty = number(qty, 0);
    if (nextQty <= 0) return;
    const updatedItems = rawItems.map(it => {
      if (it.id !== itemId) return it;
      return {
        ...it,
        netQuantity: nextQty,
        totalQuantity: nextQty,
        totalCost: Math.round(nextQty * number(it.unitCost) * 100) / 100
      };
    });
    updateRecipe(updatedItems);
  };

  const completeRecipeData = () => {
    const completed = enrichRecipeItems(rawItems, rawMaterialsList);
    updateRecipe(completed);
    notify('Receta completada: materiales, unidades, costos y proveedores vinculados al almacén.');
  };

  const componentItemsFor = (product) => {
    if (!product) return [];
    const componentRecipe = product.manufacturingRecipe?.items?.length
      ? product.manufacturingRecipe
      : buildRecipeFromProduct(product, rawMaterialsList, workshopParams);
    return normalizeRecipeItems(componentRecipe.items || [], rawMaterialsList);
  };

  const componentSummaryFor = (product) => {
    if (!product) return null;
    const componentRecipe = product.manufacturingRecipe?.items?.length
      ? product.manufacturingRecipe
      : buildRecipeFromProduct(product, rawMaterialsList, workshopParams);
    return computeRecipeCost(componentRecipe, product, rawMaterialsList, workshopParams);
  };

  const toggleTechnique = (area) => {
    const techniqueId = area.id === 'print' ? 'impresion_laser' : area.id;
    if (onToggleTechnique) {
      onToggleTechnique(techniqueId);
      return;
    }
    const current = editorForm.techniques || [];
    const active = techniqueId === 'impresion_laser'
      ? current.some(isPrintTechnique)
      : techniqueId === 'laser'
        ? current.some(t => String(t).startsWith('laser'))
        : current.includes(techniqueId);
    const next = active
      ? current.filter(t => techniqueId === 'impresion_laser' ? !isPrintTechnique(t) : techniqueId === 'laser' ? !String(t).startsWith('laser') : t !== techniqueId)
      : [...current, techniqueId];
    setEditorForm(prev => ({ ...prev, techniques: next }));
  };

  return (
    <div className="space-y-4">
      {/* Resumen compacto */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 sm:p-4">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
              {editorForm.primaryImage ? (
                <img loading="lazy" src={editorForm.primaryImage} alt={editorForm.name || 'Producto'} className="w-full h-full object-cover" />
              ) : (
                <Wrench className="w-5 h-5 text-stone-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-heading font-black text-base sm:text-lg leading-tight truncate">
                  {editorForm.name || 'Nuevo producto'}
                </h3>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600">
                  {editorForm.sku || editorForm.code || 'SIN SKU'}
                </span>
                {editorForm.isBundle && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                    Combo / Pack
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {activeAreas.length > 0 ? activeAreas.map(area => (
                  <span key={area.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-800">
                    <area.icon className="w-2.5 h-2.5" /> {area.short}
                  </span>
                )) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold">
                    <AlertCircle className="w-2.5 h-2.5" /> Sin área activa
                  </span>
                )}
                <span className="text-[9px] text-gray-500">{items.length} insumos · {number(recipe.manufacturingTimeMinutes)} min</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <div className="rounded-xl bg-[#2D4F3E] text-white px-2.5 py-1.5">
              <span className="text-[8px] uppercase tracking-wider text-white/60 font-bold block">Costo taller</span>
              <span className="text-sm font-black font-mono">{money(summary.totalCost)}</span>
            </div>
            <button
              type="button"
              onClick={completeRecipeData}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black text-[10.5px] transition-colors cursor-pointer"
              title="Vincular materiales, unidades, costos y proveedores del almacén"
            >
              <Wand2 className="w-3.5 h-3.5" /> Completar datos
            </button>
            <button
              type="button"
              onClick={onSyncCost}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-[10.5px] shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 px-3 pb-3">
          {[
            ['Insumos', money(summary.materialCost), `${items.length} renglones`, 'bg-emerald-50 border-emerald-200 text-emerald-900'],
            ['Luz + desgaste', money(summary.energyCost + summary.wearCost), `${number(recipe.manufacturingTimeMinutes)} min`, 'bg-amber-50 border-amber-200 text-amber-900'],
            ['Mano de obra', money(summary.laborCost), `${number(recipe.laborTimeMinutes)} min`, 'bg-sky-50 border-sky-200 text-sky-900'],
            ['Costo total', money(summary.totalCost), 'por pieza', 'bg-stone-100 border-stone-300 text-stone-900']
          ].map(([label, value, sub, tone]) => (
            <div key={label} className={`rounded-xl border px-2.5 py-1.5 ${tone}`}>
              <span className="text-[8px] uppercase tracking-wider font-bold opacity-70">{label}</span>
              <div className="text-sm font-black font-mono leading-tight">{value}</div>
              <span className="text-[8.5px] opacity-60">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {(editorMessage?.text || localMessage) && (
        <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-start gap-2 ${
          (localMessage?.type || editorMessage?.type) === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : (localMessage?.type || editorMessage?.type) === 'info'
              ? 'bg-sky-50 border-sky-200 text-sky-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {(localMessage?.type || editorMessage?.type) === 'error'
            ? <AlertCircle className="w-4 h-4 shrink-0" />
            : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{localMessage?.text || editorMessage?.text}</span>
        </div>
      )}

      {/* Grupos de receta en una sola fila compacta */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {groupData.filter(group => group.id !== 'component').map(group => {
          const isOpen = openGroups.has(group.id);
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isOpen ? 'bg-[#2D4F3E] border-[#2D4F3E] text-white shadow-sm' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <group.icon className="w-3.5 h-3.5" />
              <span>{group.short}</span>
              <span className={`px-1 rounded ${isOpen ? 'bg-white/15' : 'bg-stone-100 border border-stone-200'}`}>{group.items.length}</span>
              <span className="font-mono text-[9px] opacity-70">{money(group.cost)}</span>
            </button>
          );
        })}
      </div>

      {/* Áreas y maquinaria en una fila compacta */}
      <div className="rounded-2xl border border-stone-200 bg-white p-2.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-stone-500 mr-1">
          <Factory className="w-3.5 h-3.5 text-emerald-700" /> Áreas
        </span>
        {AREAS.map(area => {
          const active = activeAreas.some(item => item.id === area.id);
          const toneClasses = {
            amber: 'bg-amber-50 border-amber-300 text-amber-900',
            emerald: 'bg-emerald-50 border-emerald-300 text-emerald-900',
            blue: 'bg-blue-50 border-blue-300 text-blue-900',
            purple: 'bg-purple-50 border-purple-300 text-purple-900',
            cyan: 'bg-cyan-50 border-cyan-300 text-cyan-900'
          };
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => toggleTechnique(area)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                active ? toneClasses[area.tone] : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
              }`}
              title={`${area.name} · ${area.power} · ${area.desc}`}
            >
              <area.icon className="w-3.5 h-3.5" />
              <span>{area.short}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-current' : 'bg-stone-300'}`} />
            </button>
          );
        })}
        <span className="ml-auto text-[9px] text-stone-400 font-semibold">{activeAreas.length} activa(s)</span>
      </div>

      {/* Receta editable */}
      <div className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-heading font-black text-sm text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-700" /> Receta de taller e insumos
            </h4>
            <p className="text-[11px] text-gray-500">
              Edita cantidades, merma y costo unitario. Los grupos mantienen el escandallo ordenado y el costo se recalcula solo.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-600 border border-stone-200">{items.length} renglones</span>
            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">{money(summary.materialCost)} insumos</span>
          </div>
        </div>

        {/* Agregar insumo: búsqueda visual + captura rápida */}
        <div id="workshop-add-form" className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mr-1">Agregar a:</span>
            {SUPPLY_GROUPS.filter(group => group.id !== 'component').map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => { setAddGroup(group.id); setShowMaterialResults(true); }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                  addGroup === group.id
                    ? 'bg-[#2D4F3E] border-[#2D4F3E] text-white shadow-sm'
                    : 'bg-white border-stone-200 text-gray-600 hover:border-emerald-300'
                }`}
              >
                <group.icon className="w-3 h-3" /> {group.short}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-[1.5fr_repeat(4,minmax(0,.55fr))_auto] gap-2 items-end">
            <div className="relative col-span-2 md:col-span-1">
              <label className="text-[9px] font-bold text-gray-500 uppercase">Buscar insumo</label>
              <div className="relative mt-0.5">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={materialSearch}
                  onChange={event => { setMaterialSearch(event.target.value); setShowMaterialResults(true); }}
                  onFocus={() => setShowMaterialResults(true)}
                  placeholder="TPU, filamento, madera, imán, caja…"
                  className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase">Cantidad</label>
              <input
                type="number" min="0.01" step="0.01" value={netQty}
                onChange={event => setNetQty(event.target.value)}
                className="w-full mt-0.5 px-2 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase">Merma</label>
              <input
                type="number" min="0" step="0.01" value={wasteQty}
                onChange={event => setWasteQty(event.target.value)}
                className="w-full mt-0.5 px-2 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase">Unidad</label>
              <input
                type="text" value={unit}
                onChange={event => setUnit(event.target.value)}
                className="w-full mt-0.5 px-2 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-500 uppercase">Costo/u</label>
              <input
                type="number" min="0" step="0.0001" value={unitCost}
                onChange={event => setUnitCost(event.target.value)}
                placeholder="Auto"
                className="w-full mt-0.5 px-2 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="col-span-2 md:col-span-1 h-[34px] inline-flex items-center justify-center gap-1 px-3 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>

          {(showMaterialResults || materialSearch) && (
            <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {materialResults.map(mat => {
                const pkg = parsePackageInfo(mat);
                const selected = mat.id === selectedMaterialId;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => { chooseMaterial(mat.id); setShowMaterialResults(false); }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      selected ? 'bg-emerald-100 border-emerald-400 ring-1 ring-emerald-300' : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <MaterialBadge item={mat} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-gray-800 truncate">{mat.name}</div>
                      <div className="text-[8.5px] text-gray-500 truncate">
                        {mat.category || 'general'} · {mat.supplier || 'Sin proveedor'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9.5px] font-mono font-black text-emerald-800">{money(mat.costPerUnit)}</div>
                      <div className="text-[8px] text-gray-400">{pkg.packageQuantity} {pkg.packageMeasurement}</div>
                    </div>
                  </button>
                );
              })}
              {materialResults.length === 0 && (
                <div className="sm:col-span-2 2xl:col-span-3 text-[10px] text-gray-500 bg-white border border-dashed border-stone-200 rounded-xl p-3 text-center">
                  No hay insumos con esa búsqueda. Puedes escribirlo manualmente abajo.
                </div>
              )}
            </div>
          )}

          <input
            type="text"
            value={customName}
            onChange={event => setCustomName(event.target.value)}
            placeholder="O escribe un insumo manual…"
            className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />

          {selectedMaterial && (
            <div className="flex items-center gap-2 rounded-xl bg-white border border-emerald-200 p-2">
              <MaterialBadge item={selectedMaterial} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] font-bold text-gray-800 truncate">{selectedMaterial.name}</div>
                <div className="text-[9px] text-gray-500">
                  Paquete {parsePackageInfo(selectedMaterial).packageQuantity} {parsePackageInfo(selectedMaterial).packageMeasurement} · costo {money(selectedMaterial.costPerUnit)} · {selectedMaterial.supplier || 'sin proveedor'}
                </div>
              </div>
              <button type="button" onClick={resetAddForm} className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer" title="Quitar selección">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Grupos de receta en tarjetas compactas */}
        <div className="grid lg:grid-cols-2 gap-2">
          {groupData.filter(group => group.id !== 'component').map(group => {
            const isOpen = openGroups.has(group.id);
            return (
              <div key={group.id} className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 p-2.5 text-left cursor-pointer bg-stone-50/80 hover:bg-stone-100/70"
                >
                  <span className="w-8 h-8 rounded-xl bg-white border border-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                    <group.icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-[11.5px] text-gray-900 truncate">{group.label}</span>
                      <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">{group.items.length}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 truncate">{group.desc}</p>
                  </div>
                  <span className="font-mono font-black text-[11px] text-stone-800">{money(group.cost)}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-2 space-y-1.5 bg-stone-50/30">
                    {group.items.length === 0 ? (
                      <div className="border border-dashed border-stone-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400">Sin insumos en este grupo.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setAddGroup(group.id);
                            setShowMaterialResults(true);
                            document.getElementById('workshop-add-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-stone-200 text-[9.5px] font-bold text-stone-600 hover:border-emerald-300 hover:text-emerald-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Agregar insumo
                        </button>
                      </div>
                    ) : group.items.map(item => {
                      const material = materialForItem(item, rawMaterialsList);
                      const expanded = expandedItemId === item.id;
                      return (
                        <div key={item.id} className={`rounded-xl border p-2 transition-colors ${expanded ? 'border-emerald-300 bg-emerald-50/30' : 'border-stone-200 bg-white'}`}>
                          <div className="flex items-center gap-2">
                            <MaterialBadge item={item} material={material} size="sm" />
                            <button
                              type="button"
                              onClick={() => setExpandedItemId(expanded ? '' : item.id)}
                              className="min-w-0 flex-1 text-left cursor-pointer"
                            >
                              <div className="text-[10.5px] font-bold text-gray-800 truncate" title={item.name}>{item.name}</div>
                              <div className="text-[8.5px] text-gray-500 flex flex-wrap gap-x-1.5">
                                <span>{number(item.totalQuantity)} {item.unit}</span>
                                <span>· {money(item.unitCost)}/{item.unit}</span>
                                {item.supplier && <span className="truncate max-w-[130px]">· {item.supplier}</span>}
                              </div>
                            </button>
                            <span className="font-mono font-black text-[11px] text-gray-800 shrink-0">{money(item.totalCost)}</span>
                            <button
                              type="button"
                              onClick={() => setExpandedItemId(expanded ? '' : item.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${expanded ? 'bg-emerald-100 text-emerald-800' : 'text-gray-400 hover:bg-stone-100 hover:text-gray-700'}`}
                              title={expanded ? 'Cerrar edición' : 'Editar cantidad, unidad o costo'}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Quitar de la receta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {expanded && (
                            <div className="mt-2 pt-2 border-t border-stone-200 space-y-2">
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                                <div>
                                  <span className="text-[8px] uppercase font-bold text-gray-400">Neto</span>
                                  <input
                                    type="number" min="0" step="0.01" value={item.netQuantity}
                                    onChange={event => onUpdateItem(item.id, 'netQuantity', event.target.value)}
                                    className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[10.5px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] uppercase font-bold text-gray-400">Merma</span>
                                  <input
                                    type="number" min="0" step="0.01" value={item.wasteQuantity}
                                    onChange={event => onUpdateItem(item.id, 'wasteQuantity', event.target.value)}
                                    className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[10.5px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] uppercase font-bold text-gray-400">Unidad</span>
                                  <input
                                    type="text" value={item.unit}
                                    onChange={event => onUpdateItem(item.id, 'unit', event.target.value)}
                                    className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[10.5px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] uppercase font-bold text-gray-400">Costo/u</span>
                                  <input
                                    type="number" min="0" step="0.0001" value={item.unitCost}
                                    onChange={event => onUpdateItem(item.id, 'unitCost', event.target.value)}
                                    className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[10.5px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                                  />
                                </div>
                                <div>
                                  <span className="text-[8px] uppercase font-bold text-gray-400">Total</span>
                                  <div className="px-1.5 py-1 rounded-lg bg-white border border-stone-200 text-[10.5px] font-mono font-black text-gray-800">
                                    {money(item.totalCost)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[8.5px] font-bold text-gray-400 uppercase">Mover a:</span>
                                <select
                                  value={groupIdFor(item)}
                                  onChange={event => onSetSupplyType(item.id, event.target.value)}
                                  className="px-1.5 py-0.5 rounded-md border border-stone-200 bg-white text-[9.5px] font-semibold text-gray-600 focus:outline-none"
                                >
                                  {SUPPLY_GROUPS.filter(g => g.id !== 'component').map(g => (
                                    <option key={g.id} value={g.id}>{g.short}</option>
                                  ))}
                                </select>
                                {material && (
                                  <span className="text-[8.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                                    Almacén: {material.name}
                                  </span>
                                )}
                                <span className="text-[8.5px] text-gray-400 ml-auto">
                                  {number(item.totalQuantity)} {item.unit} × {money(item.unitCost)}
                                </span>
                              </div>
                              {item.supplier && (
                                <div className="text-[8.5px] text-gray-500">Proveedor: {item.supplier}</div>
                              )}
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
      </div>

      {/* Costos de taller */}
      <div className="grid lg:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs text-gray-900">Tiempos y energía del taller</h4>
              <p className="text-[11px] text-gray-500">Ajusta la máquina y la mano de obra para recalcular el costo.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label className="block">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Potencia (W)</span>
              <input
                type="number" min="0" step="10" value={number(recipe.machinePowerWatts)}
                onChange={event => onUpdateRecipeField('machinePowerWatts', Number(event.target.value))}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
            <label className="block">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Min. máquina</span>
              <input
                type="number" min="0" step="1" value={number(recipe.manufacturingTimeMinutes)}
                onChange={event => onUpdateRecipeField('manufacturingTimeMinutes', Number(event.target.value))}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
            <label className="block">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Costo kWh</span>
              <input
                type="number" min="0" step="0.1" value={number(recipe.kwhCost, 3.5)}
                onChange={event => onUpdateRecipeField('kwhCost', Number(event.target.value))}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
            <label className="block">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Min. mano de obra</span>
              <input
                type="number" min="0" step="1" value={number(recipe.laborTimeMinutes)}
                onChange={event => onUpdateRecipeField('laborTimeMinutes', Number(event.target.value))}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
            <label className="block">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Tarifa / hora</span>
              <input
                type="number" min="0" step="1" value={number(recipe.laborRatePerHour, 60)}
                onChange={event => onUpdateRecipeField('laborRatePerHour', Number(event.target.value))}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
            <label className="block">
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Reserva fallas %</span>
              <input
                type="number" min="0" max="100" step="0.5" value={number(recipe.failureReservePercent, 3)}
                onChange={event => onUpdateRecipeField('failureReservePercent', Number(event.target.value))}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
          </div>

          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3 space-y-1.5">
            {[
              ['Insumos propios', ownCost],
              ['Productos vinculados', componentCost],
              ['Energía eléctrica', summary.energyCost],
              ['Desgaste de máquina', summary.wearCost],
              ['Mano de obra', summary.laborCost],
              ['Empaque', summary.packagingCost],
              ['Reserva de fallas', summary.failureReserveCost],
              ['Overhead fijo', summary.fixedOverheadCost]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500">{label}</span>
                <span className="font-mono font-bold text-gray-800">{money(value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <span className="font-black text-xs text-gray-900">Costo total de taller</span>
              <span className="font-mono font-black text-sm text-emerald-800">{money(summary.totalCost)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs text-gray-900">Producción y almacén</h4>
              <p className="text-[11px] text-gray-500">Simula el consumo o descuenta los insumos reales de esta receta.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Piezas a fabricar</label>
            <input
              type="number" min="1" step="1" value={simUnits}
              onChange={event => setSimUnits(Number(event.target.value) || 1)}
              className="w-20 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSimulateProduction(simUnits)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black text-xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Simular consumo
            </button>
            <button
              type="button"
              onClick={() => onDeductStockNow(simUnits)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <PackageCheck className="w-4 h-4" /> Descontar stock
            </button>
          </div>

          <div className="rounded-2xl bg-amber-50/60 border border-amber-200 p-3 text-[10.5px] text-amber-900 leading-relaxed">
            <strong>Consejo de costeo:</strong> los productos vinculados ya incluyen sus propios insumos y mano de obra. No los vuelvas a agregar como materias primas para evitar duplicar el costo del combo.
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('general')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Datos generales
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate?.('packaging')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" /> 3. Embalaje
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('pricing')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" /> 4. Precios y margen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Productos vinculados del combo, al final para no estorbar la receta */}
      <div className="rounded-2xl border border-rose-200 bg-white p-3 sm:p-4 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xs text-gray-900">Productos vinculados del combo</h4>
              <p className="text-[9.5px] text-gray-500">Solo si esta pieza es un combo o pack. No duplica insumos: consulta la receta de cada producto.</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
            {componentGroup?.items.length || 0} vinculado(s)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-1.5 p-2 rounded-xl bg-rose-50/50 border border-rose-100">
          <select
            value={selectedComponentId}
            onChange={event => setSelectedComponentId(event.target.value)}
            className="flex-1 min-w-0 px-2.5 py-2 rounded-xl border border-rose-200 bg-white text-[10.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">Elegir producto costeado…</option>
            {linkedProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} — {money(product.costPrice)} {product.isBundle ? '(combo)' : ''}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <label className="text-[9px] font-bold text-rose-800 whitespace-nowrap">Cant.</label>
            <input
              type="number"
              min="0.01"
              step="0.25"
              value={componentQty}
              onChange={event => setComponentQty(event.target.value)}
              className="w-16 px-2 py-2 rounded-xl border border-rose-200 bg-white text-[10.5px] font-bold focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button
              type="button"
              onClick={addLinkedProduct}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10.5px] transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3" /> Vincular
            </button>
          </div>
        </div>

        {componentGroup?.items.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-1.5">
            {componentGroup.items.map(item => {
              const product = products.find(p => p.id === item.linkedProductId) || null;
              const expanded = expandedComponents.has(item.linkedProductId);
              const linkedSummary = componentSummaryFor(product);
              const linkedItems = componentItemsFor(product);
              const linkedAreas = areaNamesForTechniques(product?.techniques || []);
              return (
                <div key={item.id} className="rounded-xl border border-rose-200 overflow-hidden bg-white">
                  <div className="flex items-center gap-1.5 p-2 bg-rose-50/40">
                    <button
                      type="button"
                      onClick={() => setExpandedComponents(prev => {
                        const next = new Set(prev);
                        if (next.has(item.linkedProductId)) next.delete(item.linkedProductId);
                        else next.add(item.linkedProductId);
                        return next;
                      })}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                      title={expanded ? 'Ocultar insumos' : 'Ver insumos del producto'}
                    >
                      <div className="text-[10.5px] font-bold text-gray-900 truncate">{item.name}</div>
                      <div className="text-[8.5px] text-gray-500">
                        Costo base {linkedSummary ? money(linkedSummary.totalCost) : money(item.unitCost)} · {linkedItems.length} insumos
                      </div>
                    </button>
                    <input
                      type="number"
                      min="0.01"
                      step="0.25"
                      value={item.netQuantity}
                      onChange={event => updateComponentQty(item.id, event.target.value)}
                      className="w-14 px-1.5 py-1 rounded-lg border border-rose-200 text-[10px] font-bold text-center focus:outline-none focus:ring-2 focus:ring-rose-300"
                      title="Cantidad de este producto dentro del combo"
                    />
                    <span className="font-mono font-black text-[10px] text-rose-800 min-w-[52px] text-right">{money(item.totalCost)}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedComponents(prev => {
                        const next = new Set(prev);
                        if (next.has(item.linkedProductId)) next.delete(item.linkedProductId);
                        else next.add(item.linkedProductId);
                        return next;
                      })}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                      title={expanded ? 'Cerrar' : 'Ver insumos'}
                    >
                      {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
                      title="Quitar producto vinculado"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {expanded && (
                    <div className="p-2 border-t border-rose-100 bg-white space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[8.5px] font-bold text-emerald-800">
                          <Factory className="w-2.5 h-2.5" />
                          {linkedAreas.length > 0 ? linkedAreas.join(' · ') : 'Sin área activa'}
                        </span>
                        {SUPPLY_GROUPS.filter(group => group.id !== 'component').map(group => {
                          const groupCount = linkedItems.filter(it => groupIdFor(it) === group.id).length;
                          return (
                            <span
                              key={group.id}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-semibold ${
                                groupCount > 0 ? 'bg-stone-50 border-stone-200 text-stone-700' : 'bg-white border-stone-100 text-stone-400'
                              }`}
                            >
                              <group.icon className="w-2.5 h-2.5" /> {group.short}: {groupCount}
                            </span>
                          );
                        })}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-1">
                        {linkedItems.map((linkedItem, index) => (
                          <div key={`${linkedItem.id || index}-${index}`} className="flex items-center gap-1.5 rounded-lg bg-stone-50 border border-stone-200 px-1.5 py-1">
                            <MaterialBadge item={linkedItem} material={materialForItem(linkedItem, rawMaterialsList)} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="text-[9px] font-bold text-gray-800 truncate">{linkedItem.name}</div>
                              <div className="text-[8px] text-gray-500">{number(linkedItem.totalQuantity)} {linkedItem.unit}</div>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-stone-700">{money(linkedItem.totalCost)}</span>
                          </div>
                        ))}
                      </div>
                      {linkedItems.length === 0 && (
                        <p className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                          Este producto aún no tiene receta propia. Asígnale insumos en su editor.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/30 p-2.5 text-center">
            <p className="text-[10px] font-bold text-rose-800">Sin productos vinculados.</p>
            <p className="text-[9px] text-rose-600 mt-0.5">Si es un combo, agrega arriba los productos ya costeados que lo integran.</p>
          </div>
        )}
      </div>
    </div>
  );
}

