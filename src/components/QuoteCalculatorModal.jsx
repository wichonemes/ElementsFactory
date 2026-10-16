import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Calculator, MessageCircle, ShoppingBag,
  TreePine, Printer3d, Sparkles, Shirt, Radio,
  Ruler, MapPin, Truck, PartyPopper, Check, Copy, ArrowRight,
  Palette, Layers, Scissors, Flame, AlertTriangle, Box, FileText,
  Tag, PlusCircle, SprayCan, Type
} from 'lucide-react';
import { playCoinSound, playMarioPowerDownSound } from '../utils/soundEffects';

export default function QuoteCalculatorModal({
  isOpen,
  onClose,
  product,
  allProducts = [],
  settings,
  onAddToCart
}) {
  if (!isOpen) return null;

  const currentProduct = product || null;

  // 1. Materiales de Fabricación (8 opciones cuadradas exactas para cuadrícula 4x2 perfecta)
  const materialsList = [
    { id: 'madera_natural', label: 'Madera y MDF', delta: 0, icon: TreePine },
    { id: 'impresion_3d', label: 'Impresión 3D (PLA)', delta: 0, icon: Printer3d },
    { id: 'papel_cartulina', label: 'Papel y Cartulina', delta: 0, icon: FileText },
    { id: 'vinil_material', label: 'Vinil Adhesivo / Textil', delta: 15, icon: Scissors },
    { id: 'acrilico', label: 'Acrílico', delta: 35, icon: Sparkles },
    { id: 'manta_algodon', label: 'Manta y Textiles', delta: 25, icon: Shirt },
    { id: 'cuero_curpiel', label: 'Cuero y Curpiel', delta: 30, icon: Tag },
    { id: 'otros_materiales', label: 'Otros', delta: 0, icon: PlusCircle, isCustom: true }
  ];

  // 2. Técnicas de Impresión & Fabricación (láser diodo Sculpfun S9, Silhouette Cameo/Portrait, impresión 3D Bambu/FlashForge, DTF, hoja láser)
  const techniquesList = [
    { id: 'laser_corte', label: 'Corte Láser', cost: 20, icon: Flame },
    { id: 'impresion_3d_tech', label: 'Impresión 3D', cost: 20, icon: Printer3d },
    { id: 'vinil_textil_rot', label: 'Corte de Vinil', cost: 20, icon: Scissors },
    { id: 'sublimacion_full', label: 'Sublimación Textil', cost: 25, icon: Palette },
    { id: 'dtf_textil', label: 'Impresión DTF', cost: 25, icon: Shirt },
    { id: 'impresion_hoja_laser', label: 'Impresión Hoja Láser', cost: 15, icon: FileText }
  ];

  // 3. Acabados Artesanales & Funcionales
  const finishesList = [
    { id: 'laca_base', label: 'Laca Base', cost: 20, icon: SprayCan },
    { id: 'pintado_mano', label: 'Pintado a Mano', cost: 45, icon: Palette },
    { id: 'resina_epoxica', label: 'Resina Epóxica', cost: 55, icon: Sparkles },
    { id: 'lijado_biselado', label: 'Biselado Fino', cost: 15, icon: Box },
    { id: 'nfc_encoding', label: 'Enlace NFC', cost: 45, icon: Radio },
    { id: 'logotipo_letras', label: 'Logotipo o Letras', cost: 35, icon: Type }
  ];

  // 4. Medidas y Tamaños Predefinidos (Ancho x Largo x Alto)
  const sizePresets = [
    { id: 'chico', label: 'Chico (S)', width: 10, length: 10, height: 5, multiplier: 0.85 },
    { id: 'mediano', label: 'Mediano (M)', width: 20, length: 15, height: 10, multiplier: 1.0 },
    { id: 'grande', label: 'Grande (L)', width: 35, length: 25, height: 15, multiplier: 1.30 },
    { id: 'especial', label: 'Especial (XL)', width: 50, length: 40, height: 25, multiplier: 1.55 }
  ];

  // 5. Servicios de Envío
  const shippingOptions = [
    { id: 'local_slp', label: 'Entrega en Taller (San Luis Potosí)', cost: 0, sublabel: '$0 MXN', icon: MapPin },
    { id: 'envio_nacional', label: 'Envío Estándar Nacional', cost: 350, sublabel: 'Desde $350 MXN', icon: Truck },
    { id: 'envio_express', label: 'Envío Exprés Prioritario', cost: 480, sublabel: '$480 MXN', icon: PartyPopper }
  ];

  // Nombre del Producto / Objeto editable (para clientes que traen su STL o pieza propia)
  const [customProductName, setCustomProductName] = useState(() => {
    if (product?.name) return product.name;
    return 'Servicio de Impresión';
  });

  // Estados de Selección Múltiple
  const [selectedMaterials, setSelectedMaterials] = useState(() => {
    if (!product) return ['impresion_3d'];
    const techs = product.techniques || [];
    const list = [];
    if (techs.includes('vinil') || techs.includes('vinyl')) list.push('vinil_material');
    if (techs.includes('textil') || techs.includes('sublimacion') || techs.includes('sublimation')) list.push('manta_algodon');
    if (techs.includes('papel') || techs.includes('paper') || techs.includes('hoja_laser')) list.push('papel_cartulina');
    if (techs.includes('cuero') || techs.includes('piel')) list.push('cuero_curpiel');
    if (techs.includes('3d')) list.push('impresion_3d');
    if (techs.includes('laser')) list.push('madera_natural');
    return list.length > 0 ? list : ['impresion_3d'];
  });

  const [selectedTechniques, setSelectedTechniques] = useState(() => {
    if (!product) return ['impresion_3d_tech'];
    const techs = product.techniques || [];
    const list = [];
    if (techs.includes('laser')) list.push('laser_corte');
    if (techs.includes('3d')) list.push('impresion_3d_tech');
    if (techs.includes('vinil') || techs.includes('vinyl')) list.push('vinil_textil_rot');
    if (techs.includes('sublimacion') || techs.includes('sublimation')) list.push('sublimacion_full');
    if (techs.includes('dtf')) list.push('dtf_textil');
    if (techs.includes('hoja_laser') || techs.includes('papel') || techs.includes('paper')) list.push('impresion_hoja_laser');
    return list.length > 0 ? list : ['impresion_3d_tech'];
  });

  const [selectedFinishes, setSelectedFinishes] = useState(() => {
    const list = ['laca_base'];
    if (product?.techniques?.includes('nfc')) list.push('nfc_encoding');
    return list;
  });

  // Estado de Dimensiones
  const [activeSizePreset, setActiveSizePreset] = useState('mediano');
  const [dimensions, setDimensions] = useState({ width: 20, length: 15, height: 10 });

  // Envío, Cantidad y Personalización
  const [selectedShipping, setSelectedShipping] = useState('envio_nacional');
  const [quantity, setQuantity] = useState(() => product?.specifications?.minQuantity || 1);
  const [personalizationText, setPersonalizationText] = useState('');

  // Sincronizar estado cuando se abre o cambia el producto objetivo
  useEffect(() => {
    if (product) {
      setCustomProductName(product.name || 'Servicio de Impresión');
      const techs = product.techniques || [];
      const mList = [];
      if (techs.includes('vinil') || techs.includes('vinyl')) mList.push('vinil_material');
      if (techs.includes('textil') || techs.includes('sublimacion') || techs.includes('sublimation')) mList.push('manta_algodon');
      if (techs.includes('papel') || techs.includes('paper') || techs.includes('hoja_laser')) mList.push('papel_cartulina');
      if (techs.includes('cuero') || techs.includes('piel')) mList.push('cuero_curpiel');
      if (techs.includes('3d')) mList.push('impresion_3d');
      if (techs.includes('laser')) mList.push('madera_natural');
      setSelectedMaterials(mList.length > 0 ? mList : ['impresion_3d']);

      const tList = [];
      if (techs.includes('laser')) tList.push('laser_corte');
      if (techs.includes('3d')) tList.push('impresion_3d_tech');
      if (techs.includes('vinil') || techs.includes('vinyl')) tList.push('vinil_textil_rot');
      if (techs.includes('sublimacion') || techs.includes('sublimation')) tList.push('sublimacion_full');
      if (techs.includes('dtf')) tList.push('dtf_textil');
      if (techs.includes('hoja_laser') || techs.includes('papel') || techs.includes('paper')) tList.push('impresion_hoja_laser');
      setSelectedTechniques(tList.length > 0 ? tList : ['impresion_3d_tech']);

      const fList = ['laca_base'];
      if (techs.includes('nfc')) fList.push('nfc_encoding');
      setSelectedFinishes(fList);

      setQuantity(product.specifications?.minQuantity || 1);
    } else {
      setCustomProductName('Servicio de Impresión');
      setSelectedMaterials(['impresion_3d']);
      setSelectedTechniques(['impresion_3d_tech']);
      setQuantity(1);
    }
  }, [product, isOpen]);

  // Toggle helpers para selección múltiple
  const toggleMaterial = (id) => {
    setSelectedMaterials(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const toggleTechnique = (id) => {
    setSelectedTechniques(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const toggleFinish = (id) => {
    setSelectedFinishes(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectSizePreset = (preset) => {
    setActiveSizePreset(preset.id);
    setDimensions({ width: preset.width, length: preset.length, height: preset.height });
  };

  const handleCustomDimensionChange = (key, val) => {
    setActiveSizePreset('custom');
    const num = Math.max(1, parseInt(val) || 1);
    setDimensions(prev => ({ ...prev, [key]: num }));
  };

  const volumeDiscountPercent = useMemo(() => {
    if (quantity >= 100) return 32;
    if (quantity >= 50) return 25;
    if (quantity >= 20) return 18;
    if (quantity >= 6) return 10;
    return 0;
  }, [quantity]);

  // Cálculo de presupuesto
  const calculation = useMemo(() => {
    const baseProductPrice = (product?.price && product.price > 0) ? product.price : 150;
    
    const preset = sizePresets.find(s => s.id === activeSizePreset);
    let scaleMultiplier = preset ? preset.multiplier : 1.0;
    if (activeSizePreset === 'custom') {
      const vol = dimensions.width * dimensions.length * dimensions.height;
      const baseVol = 20 * 15 * 10;
      scaleMultiplier = Math.max(0.7, Math.min(2.5, Math.pow(vol / baseVol, 0.4)));
    }

    const materialsCost = selectedMaterials.reduce((acc, id) => {
      const found = materialsList.find(m => m.id === id);
      return acc + (found ? found.delta : 0);
    }, 0);

    const techniquesCost = selectedTechniques.reduce((acc, id, idx) => {
      if (idx === 0) return acc;
      const found = techniquesList.find(t => t.id === id);
      return acc + (found ? found.cost : 0);
    }, 0);

    const finishesCost = selectedFinishes.reduce((acc, id) => {
      const found = finishesList.find(f => f.id === id);
      return acc + (found ? found.cost : 0);
    }, 0);

    const rawUnitPrice = Math.round((baseProductPrice * scaleMultiplier) + materialsCost + techniquesCost + finishesCost);
    const unitDiscount = Math.round(rawUnitPrice * (volumeDiscountPercent / 100));
    const finalUnitPrice = rawUnitPrice - unitDiscount;

    const subtotalPieces = finalUnitPrice * quantity;
    const totalVolumeSavings = unitDiscount * quantity;

    const shippingObj = shippingOptions.find(s => s.id === selectedShipping) || shippingOptions[1];
    const shippingCost = shippingObj.cost;

    const estimatedTotal = subtotalPieces + shippingCost;

    return {
      rawUnitPrice,
      unitDiscount,
      finalUnitPrice,
      subtotalPieces,
      totalVolumeSavings,
      shippingCost,
      shippingObj,
      estimatedTotal,
      scaleMultiplier
    };
  }, [product, activeSizePreset, dimensions, selectedMaterials, selectedTechniques, selectedFinishes, selectedShipping, quantity, volumeDiscountPercent]);

  const selectedMaterialsLabels = selectedMaterials.map(id => {
    const found = materialsList.find(m => m.id === id);
    if (id === 'otros_materiales') return 'Otros (a convenir)';
    return found?.label;
  }).filter(Boolean);
  const selectedTechniquesLabels = selectedTechniques.map(id => techniquesList.find(t => t.id === id)?.label).filter(Boolean);
  const selectedFinishesLabels = selectedFinishes.map(id => finishesList.find(f => f.id === id)?.label).filter(Boolean);

  const handleSendDetailedWhatsApp = () => {
    const phone = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');
    const productNameToSend = customProductName.trim() || product?.name || 'Servicio de Impresión';

    let msg = `🛠️ *COTIZACIÓN ARTESANO DIGITAL*\n`;
    msg += `=========================================\n`;
    msg += `📦 *Producto:* ${productNameToSend}\n`;
    if (product?.sku || product?.code) msg += `🔖 *SKU / Código:* ${product.sku || product.code}\n`;
    msg += `🔢 *Cantidad:* ${quantity} pza${quantity > 1 ? 's' : ''}\n\n`;

    msg += `✨ *CONFIGURACIÓN SELECCIONADA:*\n`;
    msg += `• *Materiales:* ${selectedMaterialsLabels.join(' + ')}\n`;
    msg += `• *Técnicas de Impresión:* ${selectedTechniquesLabels.join(' + ')}\n`;
    if (selectedFinishesLabels.length > 0) {
      msg += `• *Acabados:* ${selectedFinishesLabels.join(' + ')}\n`;
    }
    msg += `• *Medidas:* ${dimensions.width} cm ancho × ${dimensions.length} cm largo × ${dimensions.height} cm alto\n`;
    msg += `• *Envío:* ${calculation.shippingObj.label}\n`;

    if (personalizationText.trim()) {
      msg += `• *Detalles:* "${personalizationText.trim()}"\n`;
    }

    msg += `\n💰 *DESGLOSE DE COSTOS:*\n`;
    msg += `• Precio unitario: $${calculation.finalUnitPrice} MXN`;
    if (volumeDiscountPercent > 0) {
      msg += ` (con -${volumeDiscountPercent}% por volumen)\n`;
    } else {
      msg += `\n`;
    }
    msg += `• Subtotal producción: $${calculation.subtotalPieces.toLocaleString('es-MX')} MXN\n`;
    msg += `• Envío: $${calculation.shippingCost} MXN\n`;
    msg += `*TOTAL ESTIMADO:* $${calculation.estimatedTotal.toLocaleString('es-MX')} MXN\n`;
    msg += `=========================================\n`;
    msg += `_Hola Artesano Digital, me gustaría confirmar disponibilidad y tiempos para este proyecto._`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleAddCalculatedToCart = () => {
    if (!onAddToCart) return;

    const productNameToSave = customProductName.trim() || product?.name || 'Servicio de Impresión';

    const customCartItem = {
      product: {
        ...(product || allProducts[0] || {}),
        id: product?.id ? product.id : `custom-${Date.now()}`,
        code: product?.sku || product?.code || 'SERV-IMP',
        name: productNameToSave,
        price: calculation.finalUnitPrice,
        calculatedTotal: calculation.estimatedTotal
      },
      quantity: quantity,
      selectedVariants: {
        "Producto": productNameToSave,
        "Materiales": selectedMaterialsLabels.join(' + '),
        "Técnicas de Impresión": selectedTechniquesLabels.join(' + '),
        "Acabados": selectedFinishesLabels.length > 0 ? selectedFinishesLabels.join(' + ') : 'Estándar',
        "Medidas": `${dimensions.width}x${dimensions.length}x${dimensions.height} cm`,
        "Envío": calculation.shippingObj.label
      },
      customText: personalizationText.trim()
        ? `${personalizationText.trim()} | Total: $${calculation.estimatedTotal} MXN`
        : `Medidas ${dimensions.width}x${dimensions.length}x${dimensions.height} cm | Total: $${calculation.estimatedTotal} MXN`
    };

    onAddToCart(customCartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E4DA] overflow-hidden my-6 transition-all"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header limpio y elegante */}
        <div className="bg-[#17251E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4A359]/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A359] to-[#9E472A] flex items-center justify-center text-white shadow-md">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D4A359]/20 text-[#E5C378] font-bold">
                  {product?.sku || product?.code || 'COTIZADOR'}
                </span>
                <span className="text-xs text-gray-300 font-medium">Calculadora Cotizadora</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                {customProductName || product?.name || 'Servicio de Impresión'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar calculadora"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body — Limpio, visual y sin saturación de texto */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* APARTADO PREVIO: PRODUCTO / OBJETO A COTIZAR */}
          <div className="space-y-2 p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8E4DA] shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <Box className="w-4 h-4 text-[#2D4F3E]" />
                <span>Producto</span>
                <span className="text-[10px] font-normal text-gray-500 lowercase">(objeto o archivo a fabricar)</span>
              </label>
              <span className="text-[10px] font-semibold text-[#2D4F3E] bg-white border border-[#E8E4DA] px-2.5 py-0.5 rounded-full shadow-2xs">
                Escribe tu pieza
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                placeholder="Escribe el nombre del producto o pieza (ej. Soporte para audífonos, Engranaje STL, Letrero...)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CEBF] bg-white text-xs sm:text-sm font-bold text-[#1F2421] placeholder-gray-400 focus:outline-none focus:border-[#2D4F3E] focus:ring-2 focus:ring-[#2D4F3E]/20 shadow-2xs transition-all"
              />
            </div>

            <p className="text-[11px] text-[#7A5B28] flex items-center gap-1.5 leading-snug">
              <span>💡</span>
              <span>¿Traes tu propio archivo o diseño? Escribe aquí el nombre de tu objeto para cotizar el servicio de impresión o manufactura.</span>
            </p>
          </div>

          {/* PASO 1: MATERIALES (Iconos grandes, selección múltiple, texto mínimo) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>Materiales</span>
                <span className="text-[10px] font-semibold text-gray-400 lowercase">(suma 2 o más)</span>
              </label>
              <span className="text-[11px] font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                {selectedMaterials.length} elegido{selectedMaterials.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {materialsList.map(mat => {
                const Icon = mat.icon;
                const isSelected = selectedMaterials.includes(mat.id);
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => toggleMaterial(mat.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 cursor-pointer relative ${
                      isSelected
                        ? 'border-[#2D4F3E] bg-[#FAF7F0] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                        : 'border-[#E8E4DA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isSelected ? 'bg-[#2D4F3E] text-white' : 'border border-gray-200 text-transparent'
                    }`}>
                      ✓
                    </span>

                    {/* Icono Grande */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isSelected ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">
                        {mat.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#9E472A] mt-0.5 block">
                        {mat.id === 'otros_materiales' ? 'A convenir' : (mat.delta > 0 ? `+$${mat.delta}` : 'Base')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: TÉCNICAS (Iconos grandes) */}
          <div className="space-y-2 pt-2 border-t border-[#E8E4DA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">2</span>
                <span>Técnicas de Impresión</span>
                <span className="text-[10px] font-semibold text-gray-400 lowercase">(suma 2 o más)</span>
              </label>
              <span className="text-[11px] font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                {selectedTechniques.length} elegida{selectedTechniques.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {techniquesList.map(tech => {
                const Icon = tech.icon;
                const isSelected = selectedTechniques.includes(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechnique(tech.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 cursor-pointer relative ${
                      isSelected
                        ? 'border-[#2D4F3E] bg-[#FAF7F0] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                        : 'border-[#E8E4DA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isSelected ? 'bg-[#2D4F3E] text-white' : 'border border-gray-200 text-transparent'
                    }`}>
                      ✓
                    </span>

                    {/* Icono Grande */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isSelected ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">
                        {tech.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 3: ACABADOS (Iconos grandes) */}
          <div className="space-y-2 pt-2 border-t border-[#E8E4DA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">3</span>
                <span>Acabados</span>
                <span className="text-[10px] font-semibold text-gray-400 lowercase">(opcional)</span>
              </label>
              <span className="text-[11px] font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                {selectedFinishes.length} elegido{selectedFinishes.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {finishesList.map(fin => {
                const Icon = fin.icon;
                const isSelected = selectedFinishes.includes(fin.id);
                return (
                  <button
                    key={fin.id}
                    type="button"
                    onClick={() => toggleFinish(fin.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 cursor-pointer relative ${
                      isSelected
                        ? 'border-[#2D4F3E] bg-[#FAF7F0] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                        : 'border-[#E8E4DA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isSelected ? 'bg-[#2D4F3E] text-white' : 'border border-gray-200 text-transparent'
                    }`}>
                      ✓
                    </span>

                    {/* Icono Grande */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isSelected ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">
                        {fin.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#9E472A] mt-0.5 block">
                        +${fin.cost}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 4: DIMENSIONES */}
          <div className="space-y-2.5 pt-2 border-t border-[#E8E4DA]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">4</span>
              <span>Dimensiones (cm)</span>
            </label>

            {/* Presets compactos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sizePresets.map(preset => {
                const isSelected = activeSizePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectSizePreset(preset)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2D4F3E] bg-[#FAF7F0] ring-2 ring-[#2D4F3E]/20 font-bold text-[#2D4F3E]'
                        : 'border-[#E8E4DA] bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs block font-bold">{preset.label}</span>
                    <span className="text-[10px] text-gray-500 block">
                      {preset.width}×{preset.length}×{preset.height} cm
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inputs directos */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#F8F7F2] border border-[#E8E4DA]">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-600 block text-center">Ancho</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={dimensions.width}
                  onChange={e => handleCustomDimensionChange('width', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs font-bold text-[#1F2421] text-center focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-600 block text-center">Largo</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={dimensions.length}
                  onChange={e => handleCustomDimensionChange('length', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs font-bold text-[#1F2421] text-center focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-gray-600 block text-center">Alto</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={dimensions.height}
                  onChange={e => handleCustomDimensionChange('height', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl border border-[#E8E4DA] bg-white text-xs font-bold text-[#1F2421] text-center focus:border-[#2D4F3E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PASO 5: SERVICIO DE ENVÍO */}
          <div className="space-y-2 pt-2 border-t border-[#E8E4DA]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">5</span>
              <span>Servicio de Envío</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {shippingOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = selectedShipping === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedShipping(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#2D4F3E] bg-[#FAF7F0] ring-2 ring-[#2D4F3E]/20 shadow-xs'
                        : 'border-[#E8E4DA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">{opt.label}</span>
                      <span className="text-xs font-extrabold text-[#9E472A] block mt-0.5">{opt.sublabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Acotación oficial breve */}
            <p className="text-[10.5px] text-[#7A5B28] bg-[#FFFBF0] border border-[#E5D7B7] rounded-xl px-3 py-1.5 flex items-center gap-1.5 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C28E38] shrink-0" />
              <span>* Envío nacional desde $350 MXN. Piezas de gran formato o volumen especial se cotizan según peso final.</span>
            </p>
          </div>

          {/* PASO 6 & 7: CANTIDAD & DETALLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E4DA]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">6</span>
                  <span>Cantidad</span>
                </span>
                {volumeDiscountPercent > 0 && (
                  <span className="text-[10px] font-bold text-white bg-[#9E472A] px-2 py-0.2 rounded-full">
                    -{volumeDiscountPercent}%
                  </span>
                )}
              </label>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[#E8E4DA] rounded-xl bg-white shadow-2xs p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (quantity > 1) {
                        playMarioPowerDownSound();
                        setQuantity(q => q - 1);
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer"
                    title="Disminuir cantidad"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      if (val > quantity) playCoinSound();
                      else if (val < quantity) playMarioPowerDownSound();
                      setQuantity(val);
                    }}
                    className="w-12 text-center font-bold text-xs text-[#1F2421] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playCoinSound();
                      setQuantity(q => q + 1);
                    }}
                    className="w-8 h-8 rounded-lg bg-[#2D4F3E] hover:bg-[#20392C] text-white font-black text-sm flex items-center justify-center cursor-pointer"
                    title="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-1">
                  {[6, 20, 50, 100].map(tier => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        if (tier > quantity) playCoinSound();
                        else if (tier < quantity) playMarioPowerDownSound();
                        setQuantity(tier);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                        quantity >= tier
                          ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]'
                          : 'bg-white text-gray-600 border-[#E8E4DA]'
                      }`}
                    >
                      {tier}+
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">7</span>
                <span>Personalización (opcional)</span>
              </label>
              <input
                type="text"
                value={personalizationText}
                onChange={e => setPersonalizationText(e.target.value)}
                placeholder="Nombres, logo o dedicatoria..."
                className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white text-xs text-[#1F2421] placeholder-gray-400 focus:outline-none focus:border-[#2D4F3E]"
              />
            </div>
          </div>

          {/* RESUMEN COMPACTO */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5D7B7] space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-[#E8E4DA]">
                <span className="text-[9px] text-gray-400 block font-bold uppercase">Unitario</span>
                <span className="font-extrabold text-[#1F2421]">${calculation.finalUnitPrice} MXN</span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-[#E8E4DA]">
                <span className="text-[9px] text-gray-400 block font-bold uppercase">Piezas</span>
                <span className="font-extrabold text-[#1F2421]">{quantity} pzas</span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-[#E8E4DA]">
                <span className="text-[9px] text-gray-400 block font-bold uppercase">Envío</span>
                <span className="font-extrabold text-[#9E472A]">${calculation.shippingCost} MXN</span>
              </div>

              <div className="p-2 rounded-xl bg-[#2D4F3E] text-white">
                <span className="text-[9px] text-emerald-200 block font-bold uppercase">Total Estimado</span>
                <span className="font-extrabold text-sm sm:text-base">${calculation.estimatedTotal.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAddCalculatedToCart}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 border border-[#E8E4DA] text-[#1F2421] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs hover:border-gray-400 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#2D4F3E]" />
              <span>Guardar en carrito</span>
            </button>

            <button
              type="button"
              onClick={handleSendDetailedWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Cotizar por WhatsApp</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
