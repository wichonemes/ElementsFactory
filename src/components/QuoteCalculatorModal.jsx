import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Calculator, MessageCircle, ShoppingBag,
  TreePine, Printer3d, Sparkles, Shirt, Radio,
  Ruler, MapPin, Truck, PartyPopper, Check, Copy, ArrowRight,
  Palette, Layers, Scissors, Flame, AlertTriangle, Box, FileText,
  Tag, PlusCircle, SprayCan, Type, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { playCoinSound, playMarioPowerDownSound } from '../utils/soundEffects';

// 1. Las 8 Categorías Principales (Cuadrícula 4x2 simétrica y limpia)
const MATERIAL_CATEGORIES = [
  {
    id: 'madera',
    label: 'Madera & Tableros',
    shortDesc: 'MDF, Pino, Nogal, Tzalam...',
    pricingUnit: 'Costo por m²',
    icon: TreePine
  },
  {
    id: 'impresion_3d',
    label: 'Impresión 3D',
    shortDesc: 'PLA, PETG, TPU, Madera...',
    pricingUnit: 'Costo por 1h de máquina',
    icon: Printer3d
  },
  {
    id: 'acrilico',
    label: 'Acrílico Cast',
    shortDesc: 'Colores, Espejo, CNC / CO2...',
    pricingUnit: 'Costo por m²',
    icon: Sparkles
  },
  {
    id: 'papel',
    label: 'Papel & Papelería',
    shortDesc: 'Couché, Opalina, Kraft, Picado...',
    pricingUnit: 'Costo por m²',
    icon: FileText
  },
  {
    id: 'telas',
    label: 'Textiles & Telas',
    shortDesc: 'Manta, Loneta, Poliéster, Mezclilla...',
    pricingUnit: 'Costo por m²',
    icon: Shirt
  },
  {
    id: 'vinil',
    label: 'Vinil Rotulado',
    shortDesc: 'Oracal 651, Textil Siser, Puff 3D...',
    pricingUnit: 'Costo por m²',
    icon: Scissors
  },
  {
    id: 'cuero',
    label: 'Cuero & Piel',
    shortDesc: 'Piel Vacuna, Carnaza, Curpiel...',
    pricingUnit: 'Costo por m²',
    icon: Layers
  },
  {
    id: 'otros',
    label: 'Otro Material',
    shortDesc: 'Pieza propia o insumo especial',
    pricingUnit: 'A convenir',
    icon: PlusCircle
  }
];

// Subtipos de cada material con costos promedio ya sumando la ganancia del taller (no al costo de fábrica)
const SUB_MATERIALS_CONFIG = {
  madera: [
    { id: 'mdf_3mm', name: 'MDF Calibrado 3mm', unitCost: 190, unitText: '$190/m²', delta: 0, desc: 'Ideal para calado láser fino y ensambles' },
    { id: 'mdf_5_5mm', name: 'MDF Calibrado 5.5mm', unitCost: 270, unitText: '$270/m²', delta: 15, desc: 'Mayor rigidez para bases y cajas reforzadas' },
    { id: 'triplay_abedul', name: 'Triplay Abedul Ruso 3-4mm', unitCost: 440, unitText: '$440/m²', delta: 30, desc: 'Chapa fina sin nudos, veta uniforme para grabado' },
    { id: 'pino_selecto', name: 'Madera Pino Selecto Estufado', unitCost: 590, unitText: '$590/m²', delta: 45, desc: 'Madera sólida natural estufada de primera' },
    { id: 'nogal_americano', name: 'Madera Nogal Americano Fina', unitCost: 1480, unitText: '$1,480/m²', delta: 85, desc: 'Madera noble obscura de lujo con veta profunda' },
    { id: 'tzalam_encino', name: 'Tzalam / Encino Nacional', unitCost: 1150, unitText: '$1,150/m²', delta: 70, desc: 'Dureza alta y tonalidad rojiza artesanal' }
  ],
  impresion_3d: [
    { id: 'pla_mate', name: 'PLA Mate / Standard', unitCost: 38, unitText: '$38/h', delta: 0, desc: 'Acabado suave antirreflejo' },
    { id: 'pla_plus', name: 'PLA Plus Alta Resistencia', unitCost: 44, unitText: '$44/h', delta: 15, desc: 'Mayor tenacidad contra caídas e impacto' },
    { id: 'petg_exterior', name: 'PETG Exterior Resistente', unitCost: 48, unitText: '$48/h', delta: 20, desc: 'Resistente a rayos UV, agua y 75°C' },
    { id: 'tpu_flexible', name: 'TPU Flexible / Goma', unitCost: 58, unitText: '$58/h', delta: 35, desc: 'Elastómero elástico para amortiguar golpes' },
    { id: 'pla_madera', name: 'PLA Madera Woodfill', unitCost: 56, unitText: '$56/h', delta: 30, desc: 'Contiene 20% fibra de madera real y se lija' },
    { id: 'pla_seda', name: 'PLA Seda Oro / Cobre / Plata', unitCost: 52, unitText: '$52/h', delta: 25, desc: 'Brillo metálico satinado muy vistoso' },
    { id: 'pla_marmol', name: 'PLA Mármol Arquitectónico', unitCost: 49, unitText: '$49/h', delta: 20, desc: 'Textura mineral punteada ideal para figuras' },
    { id: 'pla_glow', name: 'PLA Glow Neón Nocturno', unitCost: 60, unitText: '$60/h', delta: 35, desc: 'Fosforescente que recarga con luz y brilla en la noche' }
  ],
  acrilico: [
    { id: 'acrilico_negro', name: 'Acrílico Negro Ónix 3mm', unitCost: 540, unitText: '$540/m²', delta: 30, desc: 'Corte directo en láser diodo', isDiodoCompatible: true },
    { id: 'acrilico_colores', name: 'Acrílico Colores Opacos (Rojo, Azul, Verde, Amarillo)', unitCost: 590, unitText: '$590/m²', delta: 35, desc: 'Corte directo en láser diodo', isDiodoCompatible: true },
    { id: 'acrilico_espejo', name: 'Acrílico Espejo Oro / Plata', unitCost: 720, unitText: '$720/m²', delta: 50, desc: 'Grabado reverso espejo y corte diodo', isDiodoCompatible: true },
    { id: 'acrilico_cristal', name: 'Acrílico Cristal Transparente', unitCost: 620, unitText: '$620/m²', delta: 40, desc: 'Corte en CNC fresadora o Láser CO2 (el diodo no lo corta)', isDiodoCompatible: false },
    { id: 'acrilico_blanco', name: 'Acrílico Blanco Difusor', unitCost: 620, unitText: '$620/m²', delta: 40, desc: 'Corte en CNC fresadora o Láser CO2 (el diodo no lo corta)', isDiodoCompatible: false }
  ],
  papel: [
    { id: 'papel_couche', name: 'Papel Couché 300g (Mate/Brillante)', unitCost: 90, unitText: '$90/m²', delta: 0, desc: 'Ideal para portadas, tarjetas y exhibidores' },
    { id: 'cartulina_opalina', name: 'Cartulina Opalina Holandesa 225g', unitCost: 105, unitText: '$105/m²', delta: 10, desc: 'Blanco puro para diplomas y recuerdos finos' },
    { id: 'cartulina_kraft', name: 'Cartulina Kraft Rústica 280g', unitCost: 85, unitText: '$85/m²', delta: 5, desc: 'Estilo rústico ecológico 100% reciclable' },
    { id: 'papel_picado', name: 'Papel Picado Artesanal Calado', unitCost: 120, unitText: '$120/m²', delta: 15, desc: 'Corte fino de alta precisión para festividades' },
    { id: 'papel_bond', name: 'Papel Bond / Hoja de Máquina', unitCost: 40, unitText: '$40/m²', delta: 0, desc: 'Plantillas y planos técnicos de taller' }
  ],
  telas: [
    { id: 'manta_algodon', name: 'Manta de Algodón Crudo 100%', unitCost: 150, unitText: '$150/m²', delta: 10, desc: 'Tejido artesanal para bolsas tote y cojines' },
    { id: 'loneta_resistente', name: 'Loneta Resistente de Algodón', unitCost: 240, unitText: '$240/m²', delta: 25, desc: 'Alta durabilidad para mochilas, manteles y fundas' },
    { id: 'poliester_sublimable', name: 'Poliéster Sublimable Premium', unitCost: 170, unitText: '$170/m²', delta: 15, desc: 'Fijación de color fotográfico indeleble' },
    { id: 'gabardina_gorras', name: 'Gabardina para Gorras / Mandiles', unitCost: 260, unitText: '$260/m²', delta: 30, desc: 'Textura estructurada para prendas y accesorios' },
    { id: 'mezclilla_gruesa', name: 'Mezclilla Pesada Calibre Alto', unitCost: 290, unitText: '$290/m²', delta: 35, desc: 'Resistencia industrial y aspecto rústico' }
  ],
  vinil: [
    { id: 'vinil_oracal_651', name: 'Vinil Rotulación Oracal 651 Exterior', unitCost: 175, unitText: '$175/m²', delta: 15, desc: 'Adhesivo exterior durabilidad 5+ años' },
    { id: 'vinil_textil_siser', name: 'Vinil Textil Siser Termotransferible', unitCost: 250, unitText: '$250/m²', delta: 25, desc: 'Gran elasticidad y tacto suave en ropa' },
    { id: 'vinil_puff_3d', name: 'Vinil Textil Puff 3D en Relieve', unitCost: 340, unitText: '$340/m²', delta: 40, desc: 'Efecto inflado tridimensional al calor' },
    { id: 'vinil_tornasol', name: 'Vinil Holográfico / Tornasol', unitCost: 310, unitText: '$310/m²', delta: 35, desc: 'Destellos prismáticos según el ángulo de luz' }
  ],
  cuero: [
    { id: 'piel_vacuna_grano', name: 'Piel Vacuna Genuina Grano Entero', unitCost: 890, unitText: '$890/m²', delta: 65, desc: 'Curtido vegetal de primera, gran cuerpo y veta viva' },
    { id: 'carnaza_suave', name: 'Carnaza Suave Curtida al Aceite', unitCost: 510, unitText: '$510/m²', delta: 35, desc: 'Tacto aterciopelado ideal para parches y fundas' },
    { id: 'curpiel_sintetico', name: 'Curpiel Sintético Calidad Automotriz', unitCost: 310, unitText: '$310/m²', delta: 20, desc: 'Lavable, no se cuartea y óptimo para grabado láser' }
  ],
  otros: []
};

// 2. Técnicas de Impresión & Fabricación (100% Opcionales, con cálculo de desgaste de máquina por minuto)
const techniquesList = [
  {
    id: 'laser_corte',
    label: 'Corte / Grabado Láser',
    cost: 20,
    wearPerMinute: '$2.50 / min',
    wearDesc: 'Lente óptica, tubo diodo 455nm y energía',
    icon: Flame
  },
  {
    id: 'impresion_3d_tech',
    label: 'Impresión 3D FDM',
    cost: 20,
    wearPerMinute: '$0.65 / min',
    wearDesc: 'Boquilla de acero, cama caliente y correas',
    icon: Printer3d
  },
  {
    id: 'vinil_textil_rot',
    label: 'Corte Plotter Vinil',
    cost: 20,
    wearPerMinute: '$1.80 / min',
    wearDesc: 'Cuchilla de carburo cementado y tapete',
    icon: Scissors
  },
  {
    id: 'sublimacion_full',
    label: 'Sublimación Textil',
    cost: 25,
    wearPerMinute: '$2.20 / min',
    wearDesc: 'Prensa térmica industrial y tintas especiales',
    icon: Palette
  },
  {
    id: 'dtf_textil',
    label: 'Impresión DTF Textil',
    cost: 25,
    wearPerMinute: '$3.00 / min',
    wearDesc: 'Film polimérico, polvo de poliamida y horno',
    icon: Shirt
  },
  {
    id: 'impresion_hoja_laser',
    label: 'Impresión Hoja Láser',
    cost: 15,
    wearPerMinute: '$1.20 / min',
    wearDesc: 'Tóner electrofotográfico y cilindro tambor',
    icon: FileText
  }
];

// 3. Acabados y Mecanismos con Costo Real (considerando costos de importación de 15%-25%, flete e IVA)
const finishesList = [
  { id: 'laca_base', label: 'Laca Base Selladora', cost: 20, icon: SprayCan, desc: 'Protección selladora antihumedad' },
  { id: 'barniz_mate', label: 'Barniz Mate Hidrófugo', cost: 25, icon: Sparkles, desc: 'Acabado mate sedoso sin reflejos' },
  { id: 'barniz_brillante', label: 'Barniz Brillante PolyLack', cost: 25, icon: Sparkles, desc: 'Brillo tipo cristal automotriz' },
  { id: 'tinte_nogal', label: 'Tinte Madera Nogal / Caoba', cost: 30, icon: SprayCan, desc: 'Resalta la veta natural al aceite' },
  { id: 'cera_abeja', label: 'Cera de Abeja Natural', cost: 20, icon: Box, desc: 'Nutrición orgánica suave al tacto' },
  { id: 'lijado_biselado', label: 'Lijado Fino & Biselado', cost: 18, icon: Scissors, desc: 'Bordes suaves redondeados' },
  { id: 'pintado_mano', label: 'Pintado Artesanal a Mano', cost: 55, icon: Palette, desc: 'Detallado con pincel y acrílicos' },
  { id: 'resina_epoxica', label: 'Resina Epóxica Cristal Relieve', cost: 65, icon: Sparkles, desc: 'Efecto doming brillante grueso' },
  { id: 'nfc_encoding', label: 'Chip NFC Inteligente Programado', cost: 55, icon: Radio, desc: 'Enlace web o menú por proximidad' },
  { id: 'switch_mecanico', label: 'Kit Switch Mecánico Clicker 3 Pines', cost: 65, icon: Radio, desc: 'Interruptor táctil (+20% importación e IVA)' },
  { id: 'kit_luz_led', label: 'Kit Luz LED USB con Interruptor', cost: 110, icon: Sparkles, desc: 'Módulo LED para lámparas (+20% flete e IVA)' },
  { id: 'logotipo_letras', label: 'Logotipo o Letras Grabadas', cost: 40, icon: Type, desc: 'Grabado láser o relieve decorativo' }
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

// Factor de Merma y Desperdicio estándar del taller (+18%)
const MERMA_RATE = 0.18;

export default function QuoteCalculatorModal({
  isOpen,
  onClose,
  product,
  allProducts = [],
  settings,
  onAddToCart
}) {
  if (!isOpen) return null;

  // Pestaña de material activa actualmente para ver sus subtipos
  const [activeMaterialTab, setActiveMaterialTab] = useState('madera');

  // Categorías de materiales seleccionadas en general
  const [selectedMaterialCategories, setSelectedMaterialCategories] = useState(() => {
    if (!product) return ['madera'];
    const techs = product.techniques || [];
    const list = [];
    if (techs.includes('laser')) list.push('madera');
    if (techs.includes('3d')) list.push('impresion_3d');
    if (techs.includes('vinil') || techs.includes('vinyl')) list.push('vinil');
    if (techs.includes('textil') || techs.includes('sublimacion')) list.push('telas');
    if (techs.includes('papel') || techs.includes('paper')) list.push('papel');
    if (techs.includes('cuero') || techs.includes('piel')) list.push('cuero');
    return list.length > 0 ? list : ['madera'];
  });

  // Subtipos de materiales elegidos (IDs de los subtipos específicos)
  const [selectedSubMaterials, setSelectedSubMaterials] = useState(() => {
    if (!product) return ['mdf_3mm'];
    const techs = product.techniques || [];
    if (techs.includes('3d')) return ['pla_mate'];
    if (techs.includes('laser')) return ['mdf_3mm'];
    if (techs.includes('vinil') || techs.includes('vinyl')) return ['vinil_oracal_651'];
    if (techs.includes('textil')) return ['manta_algodon'];
    if (techs.includes('papel')) return ['papel_couche'];
    if (techs.includes('cuero')) return ['piel_vacuna_grano'];
    return ['mdf_3mm'];
  });

  // Campo de texto libre para la categoría "Otros"
  const [customMaterialDesc, setCustomMaterialDesc] = useState('');

  // 2. Técnicas de Impresión (100% Opcionales: el usuario puede tener 0 seleccionadas)
  const [selectedTechniques, setSelectedTechniques] = useState(() => {
    if (!product) return ['laser_corte'];
    const techs = product.techniques || [];
    const list = [];
    if (techs.includes('laser')) list.push('laser_corte');
    if (techs.includes('3d')) list.push('impresion_3d_tech');
    if (techs.includes('vinil') || techs.includes('vinyl')) list.push('vinil_textil_rot');
    if (techs.includes('sublimacion')) list.push('sublimacion_full');
    if (techs.includes('dtf')) list.push('dtf_textil');
    if (techs.includes('hoja_laser') || techs.includes('papel')) list.push('impresion_hoja_laser');
    return list;
  });

  // 3. Acabados
  const [selectedFinishes, setSelectedFinishes] = useState(() => {
    const list = ['laca_base'];
    if (product?.techniques?.includes('nfc')) list.push('nfc_encoding');
    return list;
  });

  // 4. Dimensiones
  const [activeSizePreset, setActiveSizePreset] = useState('mediano');
  const [dimensions, setDimensions] = useState({ width: 20, length: 15, height: 10 });

  // 5. Envío, Cantidad y Personalización
  const [selectedShipping, setSelectedShipping] = useState('envio_nacional');
  const [quantity, setQuantity] = useState(() => product?.specifications?.minQuantity || 1);
  const [personalizationText, setPersonalizationText] = useState('');

  // Nombre del Producto / Objeto editable
  const [customProductName, setCustomProductName] = useState(() => {
    if (product?.name) return product.name;
    return 'Servicio de Fabricación & Personalización';
  });

  // Sincronizar estado cuando se abre o cambia el producto objetivo
  useEffect(() => {
    if (product) {
      setCustomProductName(product.name || 'Servicio de Fabricación & Personalización');
      const techs = product.techniques || [];
      const cats = [];
      const subs = [];

      if (techs.includes('laser')) {
        cats.push('madera');
        subs.push('mdf_3mm');
      }
      if (techs.includes('3d')) {
        cats.push('impresion_3d');
        subs.push('pla_mate');
      }
      if (techs.includes('vinil') || techs.includes('vinyl')) {
        cats.push('vinil');
        subs.push('vinil_oracal_651');
      }
      if (techs.includes('textil') || techs.includes('sublimacion')) {
        cats.push('telas');
        subs.push('manta_algodon');
      }
      if (techs.includes('papel') || techs.includes('paper')) {
        cats.push('papel');
        subs.push('papel_couche');
      }
      if (techs.includes('cuero') || techs.includes('piel')) {
        cats.push('cuero');
        subs.push('piel_vacuna_grano');
      }

      const finalCats = cats.length > 0 ? cats : ['madera'];
      setSelectedMaterialCategories(finalCats);
      setActiveMaterialTab(finalCats[0]);
      setSelectedSubMaterials(subs.length > 0 ? subs : ['mdf_3mm']);

      const tList = [];
      if (techs.includes('laser')) tList.push('laser_corte');
      if (techs.includes('3d')) tList.push('impresion_3d_tech');
      if (techs.includes('vinil') || techs.includes('vinyl')) tList.push('vinil_textil_rot');
      if (techs.includes('sublimacion')) tList.push('sublimacion_full');
      if (techs.includes('dtf')) tList.push('dtf_textil');
      if (techs.includes('hoja_laser') || techs.includes('papel')) tList.push('impresion_hoja_laser');
      setSelectedTechniques(tList);

      const fList = ['laca_base'];
      if (techs.includes('nfc')) fList.push('nfc_encoding');
      setSelectedFinishes(fList);

      setQuantity(product.specifications?.minQuantity || 1);
    }
  }, [product, isOpen]);

  // Selección de pestaña de categoría principal
  const handleCategoryTabClick = (categoryId) => {
    setActiveMaterialTab(categoryId);
    // Si la categoría no estaba en la lista de materiales seleccionados, la añadimos
    setSelectedMaterialCategories(prev => {
      if (!prev.includes(categoryId)) {
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  // Toggle de un subtipo de material
  const toggleSubMaterial = (subId, categoryId) => {
    setSelectedSubMaterials(prev => {
      const isAlready = prev.includes(subId);
      let updated;
      if (isAlready) {
        updated = prev.filter(x => x !== subId);
      } else {
        updated = [...prev, subId];
      }

      // Sincronizar categorías activas: si ya no hay subtipos de esta categoría seleccionados
      const catSubIds = (SUB_MATERIALS_CONFIG[categoryId] || []).map(s => s.id);
      const hasOtherInCat = updated.some(id => catSubIds.includes(id));
      if (!hasOtherInCat && categoryId !== 'otros') {
        setSelectedMaterialCategories(cPrev => cPrev.filter(c => c !== categoryId));
      } else if (!selectedMaterialCategories.includes(categoryId)) {
        setSelectedMaterialCategories(cPrev => [...cPrev, categoryId]);
      }

      return updated;
    });
  };

  // Toggle técnica de impresión (100% OPCIONAL: permite dejar vacía la lista si no quieren impresión)
  const toggleTechnique = (id) => {
    setSelectedTechniques(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id); // Permite 0 técnicas
      }
      return [...prev, id];
    });
  };

  // Toggle acabados
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

  // Descuento por volumen
  const volumeDiscountPercent = useMemo(() => {
    if (quantity >= 100) return 32;
    if (quantity >= 50) return 25;
    if (quantity >= 20) return 18;
    if (quantity >= 6) return 10;
    return 0;
  }, [quantity]);

  // CÁLCULO DE COSTO Y PRESUPUESTO
  const calculation = useMemo(() => {
    const baseProductPrice = (product?.price && product.price > 0) ? product.price : 140;

    // Escala dimensional
    const preset = sizePresets.find(s => s.id === activeSizePreset);
    let scaleMultiplier = preset ? preset.multiplier : 1.0;
    if (activeSizePreset === 'custom') {
      const vol = dimensions.width * dimensions.length * dimensions.height;
      const baseVol = 20 * 15 * 10;
      scaleMultiplier = Math.max(0.7, Math.min(2.5, Math.pow(vol / baseVol, 0.4)));
    }

    // Área en m2 y volumen
    const areaM2 = Math.max(0.01, (dimensions.width * dimensions.length) / 10000);
    const volCm3 = dimensions.width * dimensions.length * dimensions.height;
    const estPrintHours = Math.max(0.5, Math.round((volCm3 / 65) * 10) / 10);

    // Suma de costos de subtipos de materiales seleccionados (con ganancia de taller incluida)
    let rawMaterialsSum = 0;
    selectedSubMaterials.forEach(subId => {
      // Buscar en qué categoría está
      let foundSub = null;
      let foundCat = null;
      Object.keys(SUB_MATERIALS_CONFIG).forEach(catKey => {
        const found = SUB_MATERIALS_CONFIG[catKey].find(s => s.id === subId);
        if (found) {
          foundSub = found;
          foundCat = catKey;
        }
      });

      if (foundSub) {
        if (foundCat === 'impresion_3d') {
          // Costo de impresión por horas estimadas + delta
          rawMaterialsSum += Math.round(foundSub.unitCost * (estPrintHours / 6) + foundSub.delta);
        } else {
          // Costo por m2 de lámina o tela + delta
          rawMaterialsSum += Math.round(foundSub.unitCost * areaM2 + foundSub.delta);
        }
      }
    });

    // Si tiene seleccionado "otros"
    if (selectedMaterialCategories.includes('otros') && customMaterialDesc.trim()) {
      rawMaterialsSum += 35;
    }

    // Si no ha elegido ningún subtipo, base mínima
    if (rawMaterialsSum === 0) {
      rawMaterialsSum = 25;
    }

    // APLICACIÓN DE LA MERMA Y DESPERDICIO (+18% estándar de taller)
    const materialCostWithMerma = Math.round(rawMaterialsSum * (1 + MERMA_RATE));
    const mermaAmount = materialCostWithMerma - rawMaterialsSum;

    // Costo de técnicas de impresión (0 si no se seleccionó ninguna)
    const techniquesCost = selectedTechniques.reduce((acc, id) => {
      const found = techniquesList.find(t => t.id === id);
      return acc + (found ? found.cost : 0);
    }, 0);

    // Costo de acabados y mecanismos (incluye switch mecánico a $65 con flete/importación y kit LED a $110)
    const finishesCost = selectedFinishes.reduce((acc, id) => {
      const found = finishesList.find(f => f.id === id);
      return acc + (found ? found.cost : 0);
    }, 0);

    // Precio Unitario base
    const rawUnitPrice = Math.round((baseProductPrice * scaleMultiplier) + materialCostWithMerma + techniquesCost + finishesCost);
    const unitDiscount = Math.round(rawUnitPrice * (volumeDiscountPercent / 100));
    const finalUnitPrice = Math.max(1, rawUnitPrice - unitDiscount);

    const subtotalPieces = finalUnitPrice * quantity;
    const totalVolumeSavings = unitDiscount * quantity;

    const shippingObj = shippingOptions.find(s => s.id === selectedShipping) || shippingOptions[1];
    const shippingCost = shippingObj.cost;

    const estimatedTotal = subtotalPieces + shippingCost;

    return {
      areaM2,
      volCm3,
      estPrintHours,
      rawMaterialsSum,
      materialCostWithMerma,
      mermaAmount,
      techniquesCost,
      finishesCost,
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
  }, [
    product,
    activeSizePreset,
    dimensions,
    selectedMaterialCategories,
    selectedSubMaterials,
    customMaterialDesc,
    selectedTechniques,
    selectedFinishes,
    selectedShipping,
    quantity,
    volumeDiscountPercent
  ]);

  // Nombres legibles para el reporte
  const selectedSubMaterialsLabels = useMemo(() => {
    const labels = [];
    selectedSubMaterials.forEach(subId => {
      Object.keys(SUB_MATERIALS_CONFIG).forEach(catKey => {
        const found = SUB_MATERIALS_CONFIG[catKey].find(s => s.id === subId);
        if (found) labels.push(`${found.name} (${found.unitText})`);
      });
    });
    if (selectedMaterialCategories.includes('otros') && customMaterialDesc.trim()) {
      labels.push(`Otro: ${customMaterialDesc.trim()}`);
    }
    return labels;
  }, [selectedSubMaterials, selectedMaterialCategories, customMaterialDesc]);

  const selectedTechniquesLabels = selectedTechniques.map(id => techniquesList.find(t => t.id === id)?.label).filter(Boolean);
  const selectedFinishesLabels = selectedFinishes.map(id => finishesList.find(f => f.id === id)?.label).filter(Boolean);

  // Enviar presupuesto formal por WhatsApp
  const handleSendDetailedWhatsApp = () => {
    const phone = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');
    const productNameToSend = customProductName.trim() || product?.name || 'Servicio de Fabricación & Personalización';

    let msg = `🛠️ *COTIZACIÓN ARTESANO DIGITAL*\n`;
    msg += `=========================================\n`;
    msg += `📦 *Proyecto / Producto:* ${productNameToSend}\n`;
    if (product?.sku || product?.code) msg += `🔖 *SKU / Código:* ${product.sku || product.code}\n`;
    msg += `🔢 *Cantidad:* ${quantity} pza${quantity > 1 ? 's' : ''}\n\n`;

    msg += `📐 *DIMENSIONES & RENDIMIENTO:*\n`;
    msg += `• Medidas: ${dimensions.width} cm ancho × ${dimensions.length} cm largo × ${dimensions.height} cm alto\n`;
    msg += `• Superficie estimada: ${calculation.areaM2.toFixed(3)} m²\n`;
    msg += `• Merma de taller considerada: +18% (retazos perimetrales y calibración)\n\n`;

    msg += `🪵 *MATERIALES & SUBTIPOS:*\n`;
    if (selectedSubMaterialsLabels.length > 0) {
      selectedSubMaterialsLabels.forEach(lbl => {
        msg += `• ${lbl}\n`;
      });
    } else {
      msg += `• Material estándar a convenir\n`;
    }

    msg += `\n⚙️ *TÉCNICAS DE FABRICACIÓN:*\n`;
    if (selectedTechniquesLabels.length > 0) {
      selectedTechniquesLabels.forEach(tLbl => {
        const techObj = techniquesList.find(t => t.label === tLbl);
        msg += `• ${tLbl}${techObj ? ` (Desgaste: ${techObj.wearPerMinute})` : ''}\n`;
      });
    } else {
      msg += `• Ninguna (Solo venta de material / corte crudo sin impresión)\n`;
    }

    if (selectedFinishesLabels.length > 0) {
      msg += `\n✨ *ACABADOS & MECANISMOS:*\n`;
      selectedFinishesLabels.forEach(fLbl => {
        msg += `• ${fLbl}\n`;
      });
    }

    msg += `\n🚚 *SERVICIO DE ENTREGA:* ${calculation.shippingObj.label}\n`;

    if (personalizationText.trim()) {
      msg += `\n✍️ *DETALLES DEL CLIENTE:* "${personalizationText.trim()}"\n`;
    }

    msg += `\n💰 *DESGLOSE DE COSTOS ESTIMADOS:*\n`;
    msg += `• Precio unitario: $${calculation.finalUnitPrice} MXN (incluye merma 18% y ganancia del taller)`;
    if (volumeDiscountPercent > 0) {
      msg += ` [-${volumeDiscountPercent}% por volumen]\n`;
    } else {
      msg += `\n`;
    }
    msg += `• Subtotal producción: $${calculation.subtotalPieces.toLocaleString('es-MX')} MXN\n`;
    msg += `• Envío: $${calculation.shippingCost} MXN\n`;
    msg += `*TOTAL ESTIMADO:* $${calculation.estimatedTotal.toLocaleString('es-MX')} MXN\n`;
    msg += `=========================================\n`;
    msg += `_Hola Artesano Digital, me gustaría confirmar los tiempos de entrega y disponibilidad para este proyecto._`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Guardar en Carrito
  const handleAddCalculatedToCart = () => {
    if (!onAddToCart) return;

    const productNameToSave = customProductName.trim() || product?.name || 'Servicio de Fabricación & Personalización';

    const customCartItem = {
      product: {
        ...(product || allProducts[0] || {}),
        id: product?.id ? product.id : `custom-${Date.now()}`,
        code: product?.sku || product?.code || 'SERV-FAB',
        name: productNameToSave,
        price: calculation.finalUnitPrice,
        calculatedTotal: calculation.estimatedTotal
      },
      quantity: quantity,
      selectedVariants: {
        "Producto": productNameToSave,
        "Materiales": selectedSubMaterialsLabels.length > 0 ? selectedSubMaterialsLabels.join(', ') : 'Estándar',
        "Técnicas de Impresión": selectedTechniquesLabels.length > 0 ? selectedTechniquesLabels.join(' + ') : 'Sin impresión',
        "Acabados": selectedFinishesLabels.length > 0 ? selectedFinishesLabels.join(' + ') : 'Estándar',
        "Medidas": `${dimensions.width}×${dimensions.length}×${dimensions.height} cm`,
        "Merma Taller": "+18% calculada",
        "Envío": calculation.shippingObj.label
      },
      customText: personalizationText.trim()
        ? `${personalizationText.trim()} | Total: $${calculation.estimatedTotal} MXN`
        : `Medidas ${dimensions.width}x${dimensions.length}x${dimensions.height} cm | Total: $${calculation.estimatedTotal} MXN`
    };

    onAddToCart(customCartItem);
    onClose();
  };

  const activeCategoryObj = MATERIAL_CATEGORIES.find(c => c.id === activeMaterialTab) || MATERIAL_CATEGORIES[0];
  const activeSubtypes = SUB_MATERIALS_CONFIG[activeMaterialTab] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E8E4DA] overflow-hidden my-4 sm:my-6 transition-all"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Elegante */}
        <div className="bg-[#17251E] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#D4A359]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#D4A359] to-[#9E472A] flex items-center justify-center text-white shadow-md">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D4A359]/20 text-[#E5C378] font-bold">
                  {product?.sku || product?.code || 'COTIZADOR'}
                </span>
                <span className="text-xs text-gray-300 font-medium">Calculadora Cotizadora de Taller</span>
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate max-w-sm sm:max-w-md">
                {customProductName || product?.name || 'Servicio de Fabricación & Personalización'}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* APARTADO PREVIO: PRODUCTO / OBJETO A COTIZAR */}
          <div className="space-y-1.5 p-3 sm:p-4 rounded-2xl bg-[#FAF7F0] border border-[#E8E4DA] shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <Box className="w-4 h-4 text-[#2D4F3E]" />
                <span>Producto o Archivo</span>
                <span className="text-[10px] font-normal text-gray-500 lowercase">(objeto a fabricar o maquilar)</span>
              </label>
              <span className="text-[10px] font-semibold text-[#2D4F3E] bg-white border border-[#E8E4DA] px-2 py-0.5 rounded-full shadow-2xs">
                Personalizable
              </span>
            </div>

            <input
              type="text"
              value={customProductName}
              onChange={(e) => setCustomProductName(e.target.value)}
              placeholder="Escribe el nombre del producto o pieza (ej. Soporte para audífonos, Engranaje STL, Letrero...)"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5CEBF] bg-white text-xs sm:text-sm font-bold text-[#1F2421] placeholder-gray-400 focus:outline-none focus:border-[#2D4F3E] focus:ring-2 focus:ring-[#2D4F3E]/20 shadow-2xs transition-all"
            />

            <p className="text-[11px] text-[#7A5B28] flex items-center gap-1.5 leading-snug">
              <span>💡</span>
              <span>¿Traes tu propio diseño STL, DXF o pieza? Puedes cambiar el nombre aquí para cotizar la maquila exacta.</span>
            </p>
          </div>

          {/* PASO 1: MATERIALES CON PESTAÑAS Y SUBTIPOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>Materiales de Fabricación</span>
                <span className="text-[10px] font-semibold text-gray-400 lowercase">(haz clic en la pestaña para ver sus subtipos)</span>
              </label>
              <span className="text-[11px] font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                {selectedSubMaterials.length} subtipo{selectedSubMaterials.length !== 1 ? 's' : ''} activo{selectedSubMaterials.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Cuadrícula 4x2 simétrica para las 8 categorías */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MATERIAL_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActiveTab = activeMaterialTab === cat.id;
                
                // Contar cuántos subtipos de esta categoría están seleccionados
                const catSubIds = (SUB_MATERIALS_CONFIG[cat.id] || []).map(s => s.id);
                const selectedInThisCat = cat.id === 'otros' 
                  ? (selectedMaterialCategories.includes('otros') && customMaterialDesc.trim() ? 1 : 0)
                  : selectedSubMaterials.filter(id => catSubIds.includes(id)).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryTabClick(cat.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer relative ${
                      isActiveTab
                        ? 'border-[#2D4F3E] bg-[#FAF7F0] ring-2 ring-[#2D4F3E] shadow-sm'
                        : selectedInThisCat > 0
                        ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-[#E8E4DA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* Badge contador de subtipos seleccionados */}
                    {selectedInThisCat > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                        {selectedInThisCat}
                      </span>
                    )}

                    {/* Icono */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isActiveTab
                        ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]'
                        : selectedInThisCat > 0
                        ? 'bg-emerald-100 text-[#2D4F3E] border-emerald-200'
                        : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">
                        {cat.label}
                      </span>
                      <span className="text-[9.5px] text-[#9E472A] font-semibold block mt-0.5">
                        {cat.pricingUnit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PANEL DESPLEGABLE / ACORDEÓN DE LA CATEGORÍA ACTIVA */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F0] border-2 border-[#2D4F3E]/30 space-y-3 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-2">
                <div className="flex items-center gap-2">
                  <activeCategoryObj.icon className="w-4 h-4 text-[#2D4F3E]" />
                  <span className="text-xs font-black text-[#1F2421]">
                    Subtipos de {activeCategoryObj.label}
                  </span>
                  <span className="text-[10px] text-gray-500 hidden sm:inline">
                    ({activeCategoryObj.pricingUnit} con ganancia de taller incluida)
                  </span>
                </div>
                <span className="text-[10px] text-[#9E472A] font-bold">
                  Suma 1 o varios
                </span>
              </div>

              {/* AVISO TÉCNICO EXCLUSIVO PARA ACRÍLICO */}
              {activeMaterialTab === 'acrilico' && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">⚠️ Nota técnica indispensable sobre corte láser de diodo:</span>{' '}
                    El láser de diodo (455 nm) no puede cortar acrílico <strong>transparente ni blanco</strong>, ya que el haz de luz azul los atraviesa sin quemar. Para transparentes y blancos se cotiza con fresado en CNC o láser CO2. Los acrílicos <strong>negro, rojo, azul, verde y espejo</strong> se cortan perfectamente en láser diodo.
                  </div>
                </div>
              )}

              {/* EN CASO DE CATEGORÍA OTROS: CAMPO LIBRE */}
              {activeMaterialTab === 'otros' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1F2421] block">
                    Describe tu material o producto especial:
                  </label>
                  <textarea
                    rows={3}
                    value={customMaterialDesc}
                    onChange={(e) => {
                      setCustomMaterialDesc(e.target.value);
                      if (!selectedMaterialCategories.includes('otros')) {
                        setSelectedMaterialCategories(prev => [...prev, 'otros']);
                      }
                    }}
                    placeholder="Escribe el material que deseas utilizar (ej. Corcho 5mm, placa de aluminio para grabado, resina vaciada, material provisto por el cliente...)"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D5CEBF] bg-white text-[#1F2421] placeholder-gray-400 focus:outline-none focus:border-[#2D4F3E] focus:ring-2 focus:ring-[#2D4F3E]/20"
                  />
                  <p className="text-[10.5px] text-gray-500">
                    * Revisaremos la viabilidad técnica y te daremos cotización exacta de manufactura por WhatsApp.
                  </p>
                </div>
              ) : (
                /* LISTA DE SUBTIPOS DISPONIBLES */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeSubtypes.map(sub => {
                    const isChecked = selectedSubMaterials.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubMaterial(sub.id, activeMaterialTab)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isChecked
                            ? 'border-[#2D4F3E] bg-white ring-2 ring-[#2D4F3E]/30 shadow-xs'
                            : 'border-[#E8E4DA] bg-white/70 hover:bg-white'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[8px] font-black shrink-0 ${
                              isChecked ? 'bg-[#2D4F3E] text-white' : 'border border-gray-300 text-transparent'
                            }`}>
                              ✓
                            </span>
                            <span className="text-xs font-bold text-[#1F2421] leading-tight">
                              {sub.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 pl-5 leading-tight">
                            {sub.desc}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#9E472A] block">
                            {sub.unitText}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">
                            {sub.delta > 0 ? `+$${sub.delta} extra` : 'Base'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* PASO 2: TÉCNICAS DE IMPRESIÓN (100% Opcionales - Permite deseleccionar todas) */}
          <div className="space-y-2 pt-2 border-t border-[#E8E4DA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">2</span>
                <span>Técnicas de Impresión</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full lowercase">
                  (opcional - puedes no elegir ninguna)
                </span>
              </label>
              <span className="text-[11px] font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                {selectedTechniques.length} elegida{selectedTechniques.length !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-[11px] text-gray-500">
              Incluye cálculo de amortización y consumo de máquina por minuto:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {techniquesList.map(tech => {
                const Icon = tech.icon;
                const isSelected = selectedTechniques.includes(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechnique(tech.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer relative ${
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

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isSelected ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">
                        {tech.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#9E472A] mt-0.5 block">
                        Desgaste: {tech.wearPerMinute}
                      </span>
                      <span className="text-[9px] text-gray-400 block leading-tight mt-0.5 line-clamp-1" title={tech.wearDesc}>
                        {tech.wearDesc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 3: ACABADOS & MECANISMOS CON PRECIO REAL */}
          <div className="space-y-2 pt-2 border-t border-[#E8E4DA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">3</span>
                <span>Acabados &amp; Mecanismos</span>
                <span className="text-[10px] font-semibold text-gray-400 lowercase">(opcional)</span>
              </label>
              <span className="text-[11px] font-bold text-[#2D4F3E] bg-[#F4F0E8] px-2.5 py-0.5 rounded-full">
                {selectedFinishes.length} elegido{selectedFinishes.length !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-[11px] text-gray-500">
              * Switches mecánicos y kits de iluminación incluyen 20% de costo de importación, flete aduanal e impuestos.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {finishesList.map(fin => {
                const Icon = fin.icon;
                const isSelected = selectedFinishes.includes(fin.id);
                return (
                  <button
                    key={fin.id}
                    type="button"
                    onClick={() => toggleFinish(fin.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer relative ${
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

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isSelected ? 'bg-[#2D4F3E] text-white border-[#2D4F3E]' : 'bg-[#FAF7F0] text-[#2D4F3E] border-[#E8E4DA]'
                    }`}>
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#1F2421] block leading-tight">
                        {fin.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#9E472A] mt-0.5 block">
                        +${fin.cost} MXN
                      </span>
                      <span className="text-[9px] text-gray-400 block leading-tight mt-0.5 line-clamp-1" title={fin.desc}>
                        {fin.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 4: DIMENSIONES & MERMA DE TALLER (+18%) */}
          <div className="space-y-2.5 pt-2 border-t border-[#E8E4DA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">4</span>
                <span>Dimensiones &amp; Merma de Taller</span>
              </label>
              <span className="text-[10px] font-bold text-[#9E472A] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                +18% merma estándar
              </span>
            </div>

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
                <label className="text-[10px] font-bold text-gray-600 block text-center">Ancho (cm)</label>
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
                <label className="text-[10px] font-bold text-gray-600 block text-center">Largo (cm)</label>
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
                <label className="text-[10px] font-bold text-gray-600 block text-center">Alto (cm)</label>
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

            <div className="bg-[#FAF7F0] border border-[#E5D7B7] rounded-xl px-3 py-2 text-[11px] text-[#7A5B28] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#C28E38] shrink-0" />
                <span>Superficie: <strong>{calculation.areaM2.toFixed(3)} m²</strong> | Volumen: <strong>{calculation.volCm3} cm³</strong></span>
              </span>
              <span className="font-bold text-[#9E472A]">
                Merma calculada: +${calculation.mermaAmount} MXN
              </span>
            </div>
          </div>

          {/* PASO 5: SERVICIO DE ENVÍO */}
          <div className="space-y-2 pt-2 border-t border-[#E8E4DA]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">5</span>
              <span>Servicio de Entrega o Envío</span>
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

            <p className="text-[10.5px] text-[#7A5B28] bg-[#FFFBF0] border border-[#E5D7B7] rounded-xl px-3 py-1.5 flex items-center gap-1.5 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C28E38] shrink-0" />
              <span>* Envío nacional desde $350 MXN con embalaje seguro. Piezas de volumen especial se confirman por peso volumétrico.</span>
            </p>
          </div>

          {/* PASO 6 & 7: CANTIDAD & PERSONALIZACIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E4DA]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4F3E] text-white flex items-center justify-center text-[10px] font-black">6</span>
                  <span>Cantidad</span>
                </span>
                {volumeDiscountPercent > 0 && (
                  <span className="text-[10px] font-bold text-white bg-[#9E472A] px-2 py-0.2 rounded-full">
                    -{volumeDiscountPercent}% mayoreo
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
                <span>Personalización / Notas</span>
              </label>
              <input
                type="text"
                value={personalizationText}
                onChange={e => setPersonalizationText(e.target.value)}
                placeholder="Nombres grabados, logo o detalles especiales..."
                className="w-full px-3 py-2 rounded-xl border border-[#E8E4DA] bg-white text-xs text-[#1F2421] placeholder-gray-400 focus:outline-none focus:border-[#2D4F3E]"
              />
            </div>
          </div>

          {/* RESUMEN COMPACTO & TRANSPARENTE */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E5D7B7] space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-[#E8E4DA]">
                <span className="text-[9px] text-gray-400 block font-bold uppercase">Unitario (c/merma)</span>
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

          {/* LEYENDA DE PRECIOS ESTIMADOS */}
          <div className="px-3.5 py-2 rounded-xl bg-[#FFFBF0] border border-[#E5D7B7] flex items-center justify-center gap-2 text-center text-[11px] text-[#7A5B28] leading-snug">
            <AlertTriangle className="w-4 h-4 text-[#C28E38] shrink-0" />
            <span>
              * Son precios estimados, no reflejan un costo real; puede haber diferencias de precios y variables según las especificaciones finales.
            </span>
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
