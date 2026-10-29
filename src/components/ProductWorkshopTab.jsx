import React, { useMemo, useState } from 'react';
import {
  Wrench, Boxes, Plus, Trash2, ChevronDown, ChevronRight, Link2,
  Calculator, Zap, Clock, DollarSign, Package, Layers, Paintbrush,
  Sparkles, Printer, Scissors, Box, Shirt, Check, AlertCircle, Save,
  ArrowRight, Search, X, Eye, PackageCheck, Factory, Wand2, Info,
  RefreshCw, Cog, Hammer, Leaf, CheckCircle2, Copy, Unlink
} from 'lucide-react';
import {
  computeRecipeCost, applySummaryToRecipe, buildRecipeFromProduct,
  normalizeRecipeItems
} from '../../shared/costing';
import { parsePackageInfo } from './RawMaterialsSection';

const SUPPLY_GROUPS = [
  {
    id: 'direct', label: 'Materias primas directas', short: 'Directos',
    desc: 'Madera, acrÃ­lico, filamento, tela, tazas y piezas que sÃ­ forman el producto.',
    icon: Box, tone: 'emerald'
  },
  {
    id: 'complementary', label: 'Insumos complementarios', short: 'Complementarios',
    desc: 'Herrajes, luces, argollas, imanes, cierres y accesorios que complementan la pieza.',
    icon: Cog, tone: 'sky'
  },
  {
    id: 'intangible', label: 'Intangibles y licencias', short: 'Intangibles',
    desc: 'DiseÃ±o, licencias, modelos, archivos y servicios digitales.',
    icon: Sparkles, tone: 'violet'
  },
  {
    id: 'micro', label: 'Micro insumos', short: 'Micro insumos',
    desc: 'TornillerÃ­a, gotas de pegamento, lijas, cintas y consumibles mÃ­nimos.',
    icon: Hammer, tone: 'orange'
  },
  {
    id: 'finish', label: 'Acabados y terminaciones', short: 'Acabados',
    desc: 'Barnices, tintes, pinturas, selladores y detalles finales.',
    icon: Paintbrush, tone: 'purple'
  },
  {
    id: 'indirect', label: 'Insumos indirectos', short: 'Indirectos',
    desc: 'Guantes, protecciÃ³n, limpieza, empaque y consumibles de operaciÃ³n.',
    icon: Leaf, tone: 'stone'
  },
  {
    id: 'production', label: 'ProducciÃ³n y servicios', short: 'ProducciÃ³n',
    desc: 'Maquila, corte externo, grabado, impresiÃ³n o servicios subcontratados.',
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
    id: 'laser', name: 'Corte & Grabado LÃ¡ser', short: 'LÃ¡ser',
    desc: 'Maderas, MDF, acrÃ­lico y grabado de precisiÃ³n.',
    power: '450 W', icon: Scissors, tone: 'amber'
  },
  {
    id: '3d', name: 'ImpresiÃ³n 3D FDM', short: '3D',
    desc: 'PLA, PETG, TPU, soportes y prototipos.',
    power: '250 W', icon: Boxes, tone: 'emerald'
  },
  {
    id: 'sublimation', name: 'SublimaciÃ³n', short: 'SublimaciÃ³n',
    desc: 'Tazas, termos, fotobotones y rÃ­gidos full color.',
    power: '1,800 W', icon: Layers, tone: 'blue'
  },
  {
    id: 'vinyl', name: 'Corte Cameo & Vinil', short: 'Cameo',
    desc: 'Vinil de corte, textil y transfer.',
    power: '50 W', icon: Wand2, tone: 'purple'
  },
  {
    id: 'print', name: 'ImpresiÃ³n LÃ¡ser / Tinta', short: 'ImpresiÃ³n',
    desc: 'Invitaciones, tarjetas, papelerÃ­a y artes impresas.',
    power: '900 W', icon: Printer, tone: 'cyan'
  }
];

function groupIdFor(item) {
  const type = item?.supplyType;
  if (type && GROUP_MAP[type]) return type;
  if (type === 'component') return 'component';
  return 'direct';
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
    if (isPrintTechnique(technique)) names.add('ImpresiÃ³n LÃ¡ser / Tinta');
    else if (technique.startsWith('laser')) names.add('Corte & Grabado LÃ¡ser');
    else if (technique.startsWith('3d')) names.add('ImpresiÃ³n 3D');
    else if (technique === 'sublimation' || technique === 'sublimacion') names.add('SublimaciÃ³n');
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
  const [openGroups, setOpenGroups] = useState(() => new Set(['direct', 'complementary', 'finish', 'indirect', 'component']));
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

  const materialsByCategory = useMemo(() => {
    const map = new Map();
    const query = materialSearch.trim().toLowerCase();
    rawMaterialsList
      .filter(mat => !query || `${mat.name || ''} ${mat.category || ''}`.toLowerCase().includes(query))
      .forEach(mat => {
        const category = mat.category || 'general';
        if (!map.has(category)) map.set(category, []);
        map.get(category).push(mat);
      });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rawMaterialsList, materialSearch]);

  const selectedMaterial = rawMaterialsList.find(mat => mat.id === selectedMaterialId) || null;
  const linkedProducts = products.filter(product => product?.id && product.id !== editorForm?.id);
  const selectedComponent = linkedProducts.find(product => product.id === selectedComponentId) || null;

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
      const match = String(text || '').match(/^[\d.,]+\s*[Ã—x]\s*(.+)$/);
      if (!match) return true;
      const name = match[1].trim();
      return !previousComponentNames.has(name) && !nextComponentNames.has(name);
    });
    const componentLines = nextComponents.map(item => {
      const quantity = number(item.netQuantity, 1);
      return `${quantity} Ã— ${item.name}`;
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
      notify('Escribe un nombre o elige un insumo del almacÃ©n.', 'error');
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
    notify(`${group.short}: â€œ${name}â€ agregado a la receta.`);
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
      notify(`Se sumaron ${qty} pieza(s) de â€œ${selectedComponent.name}â€.`);
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
    notify(`â€œ${componentName}â€ vinculado. Sus insumos se consultan sin duplicarse.`);
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
      {/* Resumen superior */}
      <div className="rounded-3xl bg-gradient-to-br from-[#20392C] via-[#2D4F3E] to-[#3C6350] p-5 sm:p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute -right-20 -top-24 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
              {editorForm.primaryImage ? (
                <img loading="lazy" src={editorForm.primaryImage} alt={editorForm.name || 'Producto'} className="w-full h-full object-cover" />
              ) : (
                <Wrench className="w-6 h-6 text-white/70" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-black text-lg sm:text-xl leading-tight truncate">
                  {editorForm.name || 'Nuevo producto'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white/10 border border-white/20 text-white/80">
                  {editorForm.sku || editorForm.code || 'SIN SKU'}
                </span>
                {editorForm.isBundle && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-400/20 border border-rose-200/30 text-rose-50">
                    Combo / Pack
                  </span>
                )}
              </div>
              <p className="text-xs text-white/65 mt-1 max-w-2xl">
                Todo lo que cuesta fabricar esta pieza en un solo lugar: Ã¡reas activas, insumos por grupo, productos vinculados y costos de taller.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeAreas.length > 0 ? activeAreas.map(area => (
                  <span key={area.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-[10px] font-bold">
                    <area.icon className="w-3 h-3" /> {area.short}
                  </span>
                )) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-300/15 border border-amber-200/30 text-amber-100 text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3" /> Sin Ã¡rea activa
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 px-3 py-2.5">
              <span className="text-[9px] uppercase tracking-wider text-white/60 font-bold">Insumos</span>
              <div className="text-base font-black font-mono">{money(summary.materialCost)}</div>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 px-3 py-2.5">
              <span className="text-[9px] uppercase tracking-wider text-white/60 font-bold">Luz + desgaste</span>
              <div className="text-base font-black font-mono">{money(summary.energyCost + summary.wearCost)}</div>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 px-3 py-2.5">
              <span className="text-[9px] uppercase tracking-wider text-white/60 font-bold">Mano de obra</span>
              <div className="text-base font-black font-mono">{money(summary.laborCost)}</div>
            </div>
            <div className="rounded-2xl bg-amber-300 text-[#20392C] px-3 py-2.5 shadow-md">
              <span className="text-[9px] uppercase tracking-wider font-black opacity-70">Costo total</span>
              <div className="text-base font-black font-mono">{money(summary.totalCost)}</div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/15">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/70">
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {number(recipe.manufacturingTimeMinutes)} min mÃ¡quina</span>
            <span className="inline-flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {number(recipe.machinePowerWatts)} W</span>
            <span className="inline-flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5" /> {items.length} renglones de receta</span>
          </div>
          <button
            type="button"
            onClick={onSyncCost}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#20392C] hover:bg-amber-50 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sincronizar costo al producto
          </button>
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

      {/* Resumen de grupos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700">Insumos propios</span>
          <div className="text-lg font-black font-mono text-emerald-950">{money(ownCost)}</div>
          <span className="text-[10px] text-emerald-700/70">{items.filter(it => groupIdFor(it) !== 'component').length} conceptos</span>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-700">Productos vinculados</span>
          <div className="text-lg font-black font-mono text-rose-950">{money(componentCost)}</div>
          <span className="text-[10px] text-rose-700/70">{componentGroup?.items.length || 0} producto(s)</span>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-700">EnergÃ­a y desgaste</span>
          <div className="text-lg font-black font-mono text-amber-950">{money(summary.energyCost + summary.wearCost)}</div>
          <span className="text-[10px] text-amber-700/70">{number(recipe.manufacturingTimeMinutes)} min</span>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-3">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-sky-700">Mano de obra</span>
          <div className="text-lg font-black font-mono text-sky-950">{money(summary.laborCost)}</div>
          <span className="text-[10px] text-sky-700/70">{number(recipe.laborTimeMinutes)} min</span>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-3">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-stone-500">Empaque + reserva</span>
          <div className="text-lg font-black font-mono text-stone-900">{money(summary.packagingCost + summary.failureReserveCost)}</div>
          <span className="text-[10px] text-stone-500">flete y merma</span>
        </div>
        <div className="rounded-2xl border border-[#2D4F3E]/30 bg-[#2D4F3E] p-3 text-white">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-white/60">Costo de taller</span>
          <div className="text-lg font-black font-mono">{money(summary.totalCost)}</div>
          <span className="text-[10px] text-white/60">costo por pieza</span>
        </div>
      </div>

      {/* Productos vinculados */}
      <div className="rounded-3xl border border-rose-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
              <Link2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm text-gray-900">Productos vinculados del combo</h4>
              <p className="text-[11px] text-gray-500">
                Vincula productos ya costeados. No se copian sus suministros: se consultan aquÃ­ al desplegar cada producto.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
            {componentGroup?.items.length || 0} vinculado(s)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 p-2.5 rounded-2xl bg-rose-50/50 border border-rose-100">
          <select
            value={selectedComponentId}
            onChange={event => setSelectedComponentId(event.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-rose-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">Elegir producto costeadoâ€¦</option>
            {linkedProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} â€” {money(product.costPrice)} {product.isBundle ? '(combo)' : ''}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-rose-800 whitespace-nowrap">Cantidad</label>
            <input
              type="number"
              min="0.01"
              step="0.25"
              value={componentQty}
              onChange={event => setComponentQty(event.target.value)}
              className="w-20 px-2.5 py-2 rounded-xl border border-rose-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button
              type="button"
              onClick={addLinkedProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Vincular
            </button>
          </div>
        </div>

        {componentGroup?.items.length > 0 ? (
          <div className="space-y-2">
            {componentGroup.items.map(item => {
              const product = products.find(p => p.id === item.linkedProductId) || null;
              const expanded = expandedComponents.has(item.linkedProductId);
              const linkedSummary = componentSummaryFor(product);
              const linkedItems = componentItemsFor(product);
              const linkedAreas = areaNamesForTechniques(product?.techniques || []);
              return (
                <div key={item.id} className="rounded-2xl border border-rose-200 overflow-hidden bg-white">
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-rose-50/80 to-white">
                    <button
                      type="button"
                      onClick={() => setExpandedComponents(prev => {
                        const next = new Set(prev);
                        if (next.has(item.linkedProductId)) next.delete(item.linkedProductId);
                        else next.add(item.linkedProductId);
                        return next;
                      })}
                      className="inline-flex items-center gap-1.5 text-rose-700 hover:text-rose-900 cursor-pointer"
                      title={expanded ? 'Ocultar insumos del producto' : 'Ver insumos del producto'}
                    >
                      {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="font-black text-xs text-gray-900">{item.name}</span>
                    </button>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                      Ya costeado
                    </span>
                    {linkedSummary && (
                      <span className="text-[10px] text-gray-500 font-mono">Costo base: {money(linkedSummary.totalCost)}</span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <label className="text-[9.5px] font-bold text-gray-500">Cantidad</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.25"
                        value={item.netQuantity}
                        onChange={event => updateComponentQty(item.id, event.target.value)}
                        className="w-16 px-2 py-1 rounded-lg border border-rose-200 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                      <span className="font-mono font-black text-xs text-rose-800 min-w-[70px] text-right">{money(item.totalCost)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                        title="Quitar producto vinculado"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="p-3 border-t border-rose-100 bg-white space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                          <Factory className="w-3 h-3" />
                          {linkedAreas.length > 0 ? linkedAreas.join(' Â· ') : 'Sin Ã¡rea activa'}
                        </span>
                        {SUPPLY_GROUPS.filter(group => group.id !== 'component').map(group => {
                          const groupCount = linkedItems.filter(it => groupIdFor(it) === group.id).length;
                          return (
                            <span
                              key={group.id}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold ${
                                groupCount > 0
                                  ? 'bg-stone-50 border-stone-200 text-stone-700'
                                  : 'bg-white border-stone-100 text-stone-400'
                              }`}
                            >
                              <group.icon className="w-3 h-3" /> {group.short}: {groupCount}
                            </span>
                          );
                        })}
                        {linkedItems.length === 0 && (
                          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                            Este producto aÃºn no tiene receta propia. AsÃ­gnale insumos en su editor.
                          </span>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-1.5">
                        {linkedItems.map((linkedItem, index) => {
                          const group = GROUP_MAP[groupIdFor(linkedItem)];
                          return (
                            <div key={`${linkedItem.id || index}-${index}`} className="flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 px-2.5 py-2">
                              <span className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0 text-stone-500">
                                {group ? <group.icon className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10.5px] font-bold text-gray-800 truncate">{linkedItem.name}</div>
                                <div className="text-[9.5px] text-gray-500">
                                  {number(linkedItem.totalQuantity)} {linkedItem.unit} Â· {group?.short}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-stone-700">{money(linkedItem.totalCost)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-4 text-center">
            <Link2 className="w-6 h-6 text-rose-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-rose-800">Este producto todavÃ­a no tiene componentes vinculados.</p>
            <p className="text-[10.5px] text-rose-600 mt-0.5">Si es un combo o pack, elige arriba los productos ya costeados que lo integran.</p>
          </div>
        )}
      </div>

      {/* Ãreas y maquinaria */}
      <div className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-black text-sm text-gray-900 flex items-center gap-2">
              <Factory className="w-4 h-4 text-emerald-700" /> Ãreas y maquinaria activa
            </h4>
            <p className="text-[11px] text-gray-500">Activa las Ã¡reas que participan en esta pieza. La impresiÃ³n lÃ¡ser/tinta es para invitaciones y tarjetas.</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            {activeAreas.length} activa(s)
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {AREAS.map(area => {
            const active = activeAreas.some(item => item.id === area.id);
            const toneClasses = {
              amber: 'border-amber-200 bg-amber-50/60 text-amber-900',
              emerald: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
              blue: 'border-blue-200 bg-blue-50/60 text-blue-900',
              purple: 'border-purple-200 bg-purple-50/60 text-purple-900',
              cyan: 'border-cyan-200 bg-cyan-50/60 text-cyan-900'
            };
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleTechnique(area)}
                className={`relative text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                  active ? toneClasses[area.tone] : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                    active ? 'bg-white/70 border-white text-current' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <area.icon className="w-4 h-4" />
                  </span>
                  <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    active ? 'bg-[#2D4F3E]' : 'bg-stone-300'
                  }`}>
                    <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition ${active ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                </div>
                <div className={`mt-2 font-black text-xs leading-tight ${active ? '' : 'text-gray-800'}`}>{area.name}</div>
                <div className={`text-[9.5px] mt-0.5 leading-snug ${active ? 'opacity-70' : 'text-gray-500'}`}>{area.desc}</div>
                <div className={`mt-1.5 inline-flex items-center gap-1 text-[9px] font-mono font-bold ${active ? 'opacity-70' : 'text-gray-400'}`}>
                  <Zap className="w-2.5 h-2.5" /> {area.power}
                </div>
              </button>
            );
          })}
        </div>
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

        {/* Formulario agregar */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mr-1">Agregar a:</span>
            {SUPPLY_GROUPS.filter(group => group.id !== 'component').map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => setAddGroup(group.id)}
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

          <div className="grid sm:grid-cols-12 gap-2">
            <div className="sm:col-span-4 relative">
              <label className="text-[9.5px] font-bold text-gray-500 uppercase">Insumo de almacÃ©n</label>
              <div className="relative mt-0.5">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={materialSearch}
                  onChange={event => setMaterialSearch(event.target.value)}
                  placeholder="Buscar madera, filamento, tintaâ€¦"
                  className="w-full pl-8 pr-2 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <select
                value={selectedMaterialId}
                onChange={event => chooseMaterial(event.target.value)}
                className="w-full mt-1.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">â€” Elegir insumo del almacÃ©n â€”</option>
                {materialsByCategory.map(([category, materials]) => (
                  <optgroup key={category} label={category}>
                    {materials.map(mat => (
                      <option key={mat.id} value={mat.id}>{mat.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="text"
                value={customName}
                onChange={event => setCustomName(event.target.value)}
                placeholder="O escribe un insumo manualâ€¦"
                className="w-full mt-1.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[9.5px] font-bold text-gray-500 uppercase">Cantidad neta</label>
              <input
                type="number" min="0.01" step="0.01" value={netQty}
                onChange={event => setNetQty(event.target.value)}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9.5px] font-bold text-gray-500 uppercase">Merma</label>
              <input
                type="number" min="0" step="0.01" value={wasteQty}
                onChange={event => setWasteQty(event.target.value)}
                className="w-full mt-0.5 px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-[9.5px] font-bold text-gray-500 uppercase">Unidad</label>
              <input
                type="text" value={unit}
                onChange={event => setUnit(event.target.value)}
                className="w-full mt-0.5 px-2 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[9.5px] font-bold text-gray-500 uppercase">Costo / unidad</label>
              <input
                type="number" min="0" step="0.0001" value={unitCost}
                onChange={event => setUnitCost(event.target.value)}
                placeholder="Auto"
                className="w-full mt-0.5 px-2 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button
                type="button"
                onClick={addItem}
                className="w-full inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>
          {selectedMaterial && (
            <p className="text-[10px] text-emerald-800/80">
              <Info className="w-3 h-3 inline mr-1" />
              {selectedMaterial.name}: paquete de {parsePackageInfo(selectedMaterial).packageQuantity} {parsePackageInfo(selectedMaterial).packageMeasurement} Â· costo ${number(selectedMaterial.costPerUnit).toFixed(2)}.
              El costo unitario se calcula automÃ¡ticamente.
            </p>
          )}
        </div>

        {/* Grupos de receta */}
        <div className="grid lg:grid-cols-2 gap-2.5">
          {groupData.map(group => {
            const isOpen = openGroups.has(group.id);
            const groupIsComponent = group.id === 'component';
            return (
              <div key={group.id} className={`rounded-2xl border overflow-hidden ${groupIsComponent ? 'border-rose-200 lg:col-span-2' : 'border-stone-200'}`}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center gap-2 p-3 text-left cursor-pointer ${groupIsComponent ? 'bg-rose-50/70' : 'bg-stone-50/80'}`}
                >
                  <span className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                    groupIsComponent ? 'bg-white border-rose-200 text-rose-700' : 'bg-white border-stone-200 text-stone-600'
                  }`}>
                    <group.icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-gray-900 truncate">{group.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white border border-stone-200 text-stone-500">{group.items.length}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{group.desc}</p>
                  </div>
                  <span className={`font-mono font-black text-xs ${groupIsComponent ? 'text-rose-800' : 'text-stone-800'}`}>{money(group.cost)}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-2 space-y-1.5 bg-white">
                    {group.items.length === 0 ? (
                      <div className={`text-[10.5px] text-gray-400 border border-dashed rounded-xl p-3 text-center ${groupIsComponent ? 'border-rose-100' : 'border-stone-200'}`}>
                        {groupIsComponent
                          ? 'Sin productos vinculados. Usa la tarjeta rosa de arriba para agregar uno.'
                          : 'Sin insumos en este grupo. Usa el formulario de arriba para agregar uno.'}
                      </div>
                    ) : group.items.map(item => (
                      <div key={item.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-white border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                            {groupIsComponent ? <Link2 className="w-2.5 h-2.5" /> : <Package className="w-2.5 h-2.5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-gray-800 truncate" title={item.name}>{item.name}</div>
                            <div className="text-[9px] text-gray-500">
                              {item.category || 'general'} {item.notes ? `Â· ${item.notes}` : ''}
                            </div>
                          </div>
                          <div className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${
                            groupIsComponent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {group.short}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Quitar de la receta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-1.5">
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-gray-400">Neto</span>
                            <input
                              type="number" min="0" step="0.01" value={item.netQuantity}
                              onChange={event => onUpdateItem(item.id, 'netQuantity', event.target.value)}
                              className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                            />
                          </div>
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-gray-400">Merma</span>
                            <input
                              type="number" min="0" step="0.01" value={item.wasteQuantity}
                              onChange={event => onUpdateItem(item.id, 'wasteQuantity', event.target.value)}
                              className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                            />
                          </div>
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-gray-400">Unidad</span>
                            <input
                              type="text" value={item.unit}
                              onChange={event => onUpdateItem(item.id, 'unit', event.target.value)}
                              className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                            />
                          </div>
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-gray-400">Costo/u</span>
                            <input
                              type="number" min="0" step="0.0001" value={item.unitCost}
                              onChange={event => onUpdateItem(item.id, 'unitCost', event.target.value)}
                              className="w-full px-1.5 py-1 rounded-lg border border-stone-300 bg-white text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-300"
                            />
                          </div>
                          <div>
                            <span className="text-[8.5px] uppercase font-bold text-gray-400">Total</span>
                            <div className="px-1.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px] font-mono font-black text-gray-800">
                              {money(item.totalCost)}
                            </div>
                          </div>
                        </div>

                        {!groupIsComponent && (
                          <div className="flex items-center gap-1 mt-1">
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
                            <span className="text-[9px] text-gray-400 ml-auto">
                              Total {number(item.totalQuantity)} {item.unit} Ã— {money(item.unitCost)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Costos de taller */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm text-gray-900">Tiempos y energÃ­a del taller</h4>
              <p className="text-[11px] text-gray-500">Ajusta la mÃ¡quina y la mano de obra para recalcular el costo.</p>
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
              <span className="text-[9.5px] font-bold text-gray-500 uppercase">Min. mÃ¡quina</span>
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
              ['EnergÃ­a elÃ©ctrica', summary.energyCost],
              ['Desgaste de mÃ¡quina', summary.wearCost],
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

        <div className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm text-gray-900">ProducciÃ³n y almacÃ©n</h4>
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
    </div>
  );
}

