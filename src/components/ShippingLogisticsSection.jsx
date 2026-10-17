import React, { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Scale,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Info,
  Navigation,
  FileText,
  ChevronRight,
  Sparkles,
  Calculator,
  ArrowRight,
  Layers,
  Box,
  Building2,
  Phone,
  User,
  Compass,
  MessageCircle
} from 'lucide-react';

export default function ShippingLogisticsSection({ businessSettings = {} }) {
  // Pestaña activa interna: 'sizes' (Costos por tamaño) | 'local_vs_national' (Desglose Local vs Foráneo) | 'calculator' (Calculadora Volumétrica) | 'labels' (Generador & Etiquetas)
  const [activeTab, setActiveTab] = useState('sizes');

  // Tamaño seleccionado para inspección rápida
  const [selectedSizeId, setSelectedSizeId] = useState('chico');

  // Calculadora Volumétrica State
  const [calcLength, setCalcLength] = useState(25);
  const [calcWidth, setCalcWidth] = useState(20);
  const [calcHeight, setCalcHeight] = useState(15);
  const [calcWeight, setCalcWeight] = useState(1.2);
  const [calcInsuredValue, setCalcInsuredValue] = useState(450);

  // Formulario de Etiqueta Rápida
  const [labelForm, setLabelForm] = useState({
    recipientName: 'Sofía Martínez Hernández',
    recipientPhone: '444 812 3456',
    street: 'Av. Venustiano Carranza #1520 Int. 3B',
    colony: 'Tequisquiapan',
    postalCode: '78230',
    city: 'San Luis Potosí',
    state: 'San Luis Potosí',
    references: 'Fachada blanca con portón café, timbre derecho.',
    contentDescription: 'Artesanía de madera personalizada y piezas en polímero',
    orderNumber: `AD-${Date.now().toString().slice(-5)}`,
    declaredWeight: '1.2 kg'
  });

  const [copiedState, setCopiedState] = useState(false);

  // Catálogo de tamaños y tarifas estimadas en México (vía agregadores: Skydropx, Envíoclick)
  const packageSizes = [
    {
      id: 'sobre',
      name: '1. Sobre / Extra Chico',
      weightLimit: 'Hasta 0.5 kg',
      dimensions: '20 × 15 × 3 cm',
      icon: '✉️',
      examples: 'Llaveros grabados de madera o acrílico, plaquitas de mascota, fotoimanes, calcomanías de vinil, aretes.',
      aggregatorPrice: '$115 - $135 MXN',
      counterPrice: '$195 - $240 MXN',
      estimatedSavings: '45%',
      options: [
        { courier: 'RedPack Eco', price: 115, days: '2 a 4 días', badge: 'Más Económico' },
        { courier: 'Estafeta Terrestre', price: 118, days: '2 a 3 días', badge: 'Recomendado' },
        { courier: '99 Minutos', price: 125, days: '1 a 2 días', badge: 'Exprés Urbano' },
        { courier: 'FedEx Express Saver', price: 135, days: 'Día siguiente / 2 días', badge: 'Alta Cobertura' }
      ]
    },
    {
      id: 'chico',
      name: '2. Chico (Caja Estándar)',
      weightLimit: '0.5 a 1.5 kg',
      dimensions: '22 × 18 × 12 cm',
      icon: '📦',
      examples: 'Tazas sublimadas en caja individual con burbuja, macetas geométricas 3D chicas, letreros de escritorio compactos.',
      aggregatorPrice: '$139 - $149 MXN',
      counterPrice: '$220 - $280 MXN',
      estimatedSavings: '43%',
      isPopular: true,
      options: [
        { courier: 'FedEx Nacional Express', price: 139, days: '1 a 2 días', badge: 'Más Popular' },
        { courier: 'Estafeta Terrestre', price: 142, days: '2 a 3 días', badge: 'Confiable' },
        { courier: 'Paquetexpress', price: 148, days: '2 a 3 días', badge: 'Trato Cuidadoso' },
        { courier: 'DHL Express', price: 165, days: '1 día hábil', badge: 'Super Exprés' }
      ]
    },
    {
      id: 'mediano',
      name: '3. Mediano (Taller & Hogar)',
      weightLimit: '1.5 a 5.0 kg',
      dimensions: '35 × 25 × 15 cm',
      icon: '📐',
      examples: 'Colgador de llaves "Bienvenidos", bandejas vaciabolsillos, sets de 4 posavasos en estuche, combos de 2 a 3 piezas.',
      aggregatorPrice: '$165 - $189 MXN',
      counterPrice: '$280 - $350 MXN',
      estimatedSavings: '46%',
      options: [
        { courier: 'Paquetexpress Nacional', price: 165, days: '2 a 4 días', badge: 'Mejor Relación Costo' },
        { courier: 'FedEx Terrestre', price: 175, days: '2 a 4 días', badge: 'Recomendado' },
        { courier: 'Estafeta Terrestre', price: 185, days: '3 a 5 días', badge: 'Estándar' },
        { courier: 'DHL Express', price: 215, days: '1 a 2 días', badge: 'Prioridad' }
      ]
    },
    {
      id: 'grande',
      name: '4. Grande (Bodas & Eventos)',
      weightLimit: '5.0 a 10.0 kg',
      dimensions: '45 × 35 × 25 cm',
      icon: '🪑',
      examples: 'Lámparas de madera con pantallas 3D, letreros de bienvenida para bodas (40-50 cm), lotes de 15 a 25 tazas.',
      aggregatorPrice: '$220 - $265 MXN',
      counterPrice: '$380 - $480 MXN',
      estimatedSavings: '48%',
      options: [
        { courier: 'Paquetexpress Cargo', price: 220, days: '3 a 5 días', badge: 'Ideal para Artesanías' },
        { courier: 'FedEx Cargo Terrestre', price: 238, days: '2 a 4 días', badge: 'Rastreo Avanzado' },
        { courier: 'Estafeta Carga', price: 265, days: '3 a 5 días', badge: 'Resistente' }
      ]
    },
    {
      id: 'mayoreo',
      name: '5. Volumétrico / Lote Mayoreo',
      weightLimit: '>10.0 kg o Volumétrico',
      dimensions: '>50 × 40 × 35 cm',
      icon: '🚛',
      examples: 'Cajas de mayoreo (50 a 100 tazas, 20-30 letreros), estands de madera desarmables para bazares.',
      aggregatorPrice: '$350 - $550+ MXN',
      counterPrice: '$650 - $950+ MXN',
      estimatedSavings: '50%',
      options: [
        { courier: 'Paquetexpress / Castores', price: 350, days: '3 a 6 días', badge: 'Base hasta 15 kg' },
        { courier: 'FedEx Freight Terrestre', price: 420, days: '3 a 5 días', badge: 'Con Recolección' },
        { courier: 'Kilo adicional en sobrepeso', price: 22, days: 'N/A', badge: '~$18 - $24 MXN/kg' }
      ]
    }
  ];

  // Cálculos dinámicos de la Calculadora Volumétrica
  const volumetricCalculations = useMemo(() => {
    const l = Math.max(1, Number(calcLength) || 1);
    const w = Math.max(1, Number(calcWidth) || 1);
    const h = Math.max(1, Number(calcHeight) || 1);
    const actualW = Math.max(0.1, Number(calcWeight) || 0.1);
    const insuredVal = Math.max(0, Number(calcInsuredValue) || 0);

    // Fórmula IATA oficial paqueterías México: (L x W x H) / 5000
    const volWeight = Number(((l * w * h) / 5000).toFixed(2));
    const billableWeight = Math.max(actualW, volWeight);
    const isPenalizedByVolume = volWeight > actualW;

    // Tarifa base estimada según peso facturable
    let baseShippingRate = 139;
    if (billableWeight <= 0.5) baseShippingRate = 118;
    else if (billableWeight <= 1.5) baseShippingRate = 139;
    else if (billableWeight <= 3.0) baseShippingRate = 165;
    else if (billableWeight <= 5.0) baseShippingRate = 185;
    else if (billableWeight <= 10.0) baseShippingRate = 238;
    else {
      const extraKg = Math.ceil(billableWeight - 10);
      baseShippingRate = 350 + (extraKg * 22);
    }

    // Costo de embalaje de taller estándar
    const workshopPackagingCost = 20;

    // Seguro (1.5% del valor declarado, mínimo $15 MXN)
    const insuranceCost = insuredVal > 0 ? Math.max(15, Math.round(insuredVal * 0.015)) : 0;

    const totalLandedShipping = baseShippingRate + workshopPackagingCost + insuranceCost;

    return {
      volWeight,
      actualWeight: actualW,
      billableWeight,
      isPenalizedByVolume,
      baseShippingRate,
      workshopPackagingCost,
      insuranceCost,
      totalLandedShipping
    };
  }, [calcLength, calcWidth, calcHeight, calcWeight, calcInsuredValue]);

  // Copiar dirección formateada en 1 Clic para Skydropx / Envíoclick
  const handleCopyFormattedAddress = () => {
    const text = `
DESTINATARIO:
Nombre: ${labelForm.recipientName}
Teléfono: ${labelForm.recipientPhone}
Dirección: ${labelForm.street}
Colonia: ${labelForm.colony}
Código Postal: ${labelForm.postalCode}
Ciudad/Municipio: ${labelForm.city}
Estado: ${labelForm.state}
Referencias: ${labelForm.references}
Contenido: ${labelForm.contentDescription}
Peso Estimado: ${labelForm.declaredWeight}
Pedido/Ref Taller: ${labelForm.orderNumber}
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 3000);
  };

  // Enviar datos de la guía formateada directamente por WhatsApp
  const handleShareViaWhatsApp = () => {
    const text = `📦 *SOLICITUD DE GUÍA / ENVÍO - ARTESANO DIGITAL*\n\n` +
      `👤 *Destinatario:* ${labelForm.recipientName}\n` +
      `📱 *Teléfono:* ${labelForm.recipientPhone}\n` +
      `📍 *Dirección:* ${labelForm.street}, Col. ${labelForm.colony}\n` +
      `📮 *CP:* ${labelForm.postalCode} - ${labelForm.city}, ${labelForm.state}\n` +
      `🏠 *Referencias:* ${labelForm.references}\n` +
      `📦 *Contenido:* ${labelForm.contentDescription}\n` +
      `⚖️ *Peso:* ${labelForm.declaredWeight}\n` +
      `🏷️ *Ref. Taller:* ${labelForm.orderNumber}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Imprimir Etiqueta Térmica
  const handlePrintThermalLabel = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Banner Principal Informativo */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1E3A2B] via-[#2D4F3E] to-[#1E3529] p-6 sm:p-8 text-white shadow-lg border border-emerald-950/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-bold tracking-wide">
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>LOGÍSTICA &amp; PAQUETERÍAS MÉXICO 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Tarifas por Tamaño, Envíos Locales vs. Nacionales &amp; Despacho de Etiquetas
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Consulta cuánto cobran realmente las paqueterías en México (FedEx, Estafeta, DHL, Paquetexpress), 
              calcula el peso volumétrico para no regalar dinero en envíos y simplifica el pedido de tus guías de taller.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs space-y-2 shrink-0">
            <span className="font-bold text-amber-300 block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Tip de Oro para el Taller:
            </span>
            <p className="text-emerald-100 text-[11px] max-w-xs leading-normal">
              <strong>Nunca compres en ventanilla de sucursal.</strong> En plataformas como Skydropx o Envíoclick 
              obtienes la misma guía con <span className="text-amber-300 font-bold">40% a 60% de descuento</span> sobre precio mostrador.
            </p>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas del Módulo */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-100 border border-stone-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sizes'
              ? 'bg-white text-[#2D4F3E] shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Box className="w-4 h-4 text-amber-600" />
          <span>1. Tarifas por Tamaño (México)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('local_vs_national')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'local_vs_national'
              ? 'bg-white text-[#2D4F3E] shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>2. Desglose Local vs. Nacional</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-white text-[#2D4F3E] shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-blue-600" />
          <span>3. Calculadora Volumétrica IATA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('labels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'labels'
              ? 'bg-white text-[#2D4F3E] shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Printer className="w-4 h-4 text-purple-600" />
          <span>4. Generador de Etiquetas &amp; Despacho</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. TARIFAS POR TAMAÑO DE PRODUCTO EN MÉXICO                  */}
      {/* ============================================================ */}
      {activeTab === 'sizes' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>📦 Tabla Comparativa de Tarifas de Paquetería en México</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Tarifas Vigentes 2026
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Precios promedio negociados a través de plataformas agregadoras (Skydropx / Envíoclick) con recolección incluida en San Luis Potosí.
                </p>
              </div>
            </div>

            {/* Píldoras de selección de tamaño */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {packageSizes.map((sz) => {
                const isSelected = selectedSizeId === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setSelectedSizeId(sz.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF9F5] border-[#2D4F3E] shadow-xs ring-2 ring-[#2D4F3E]/20'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-lg mb-1">
                      <span>{sz.icon}</span>
                      {sz.isPopular && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-xs text-gray-900 block truncate">
                      {sz.name.split('.')[1] || sz.name}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {sz.weightLimit}
                    </span>
                    <span className="text-xs font-black text-[#2D4F3E] mt-1 block">
                      {sz.aggregatorPrice.split('-')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tarjeta Detallada del Tamaño Seleccionado */}
            {(() => {
              const current = packageSizes.find(s => s.id === selectedSizeId) || packageSizes[1];
              return (
                <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-5 animate-in fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-2xl shadow-2xs">
                        {current.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                          <span>{current.name}</span>
                          <span className="text-xs font-normal text-gray-500">({current.dimensions})</span>
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          <strong>Piezas de ejemplo:</strong> {current.examples}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Costo con Convenio</span>
                        <span className="text-lg font-black text-emerald-700">{current.aggregatorPrice}</span>
                      </div>
                      <div className="h-8 w-px bg-stone-300"></div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider line-through">Mostrador Directo</span>
                        <span className="text-xs font-bold text-gray-400 line-through">{current.counterPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparativa de Paqueterías para este tamaño */}
                  <div>
                    <h5 className="font-bold text-xs text-gray-800 mb-3 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>Opciones de Paquetería Disponibles en Plataforma:</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {current.options.map((opt, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900">{opt.courier}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-700">
                              {opt.badge}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1">
                            <span className="text-base font-black text-[#2D4F3E]">
                              ${opt.price} <span className="text-[10px] font-semibold text-gray-500">MXN</span>
                            </span>
                            <span className="text-[11px] text-gray-500">{opt.days}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. DESGLOSE LOCAL VS. FORÁNEO / NACIONAL                     */}
      {/* ============================================================ */}
      {activeTab === 'local_vs_national' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta Envíos Locales (San Luis Potosí) */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Envíos Locales (San Luis Potosí)</h3>
                <p className="text-xs text-gray-500">Zona urbana y conurbada metropolitana</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Opción 1: Taller */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                    <span>🏪 Recogida en Taller (Pick-up)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">Gratis</span>
                  </span>
                  <p className="text-[11px] text-gray-500">
                    El cliente recoge en el taller artesanal con cita previa. Cero costo de flete.
                  </p>
                </div>
                <span className="text-base font-black text-emerald-700 shrink-0">$0 MXN</span>
              </div>

              {/* Opción 2: Punto Medio */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                    <span>🚶 Punto de Entrega Convenido</span>
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Plaza Fundadores, Parque Tangamanga o Carranza. Cubre pasaje / combustible urbano del artesano.
                  </p>
                </div>
                <span className="text-base font-black text-[#2D4F3E] shrink-0">$25 MXN</span>
              </div>

              {/* Opción 3: Didi / Uber Flash Moto */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                    <span>🛵 Didi Entrega / Uber Flash Moto</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">Mismo Día</span>
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Entrega exprés en 30-45 minutos en perímetro urbano (Lomas, Centro, Himno Nacional).
                  </p>
                </div>
                <span className="text-base font-black text-[#2D4F3E] shrink-0">$45 - $65 MXN</span>
              </div>

              {/* Opción 4: Zona Conurbada */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                    <span>🚗 Zona Conurbada Extensa (Uber Flash Auto)</span>
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Soledad Centro, Villa de Pozos, Zona Industrial WTC / Parque Logistik.
                  </p>
                </div>
                <span className="text-base font-black text-[#2D4F3E] shrink-0">$75 - $95 MXN</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Envíos Nacionales / Foráneos */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Envíos Foráneos / Nacionales (México)</h3>
                <p className="text-xs text-gray-500">Desglose de costo por paquete estándar</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Partida 1: Guía Base */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block">
                    1. Guía Nacional Estándar (1 a 5 kg)
                  </span>
                  <p className="text-[11px] text-gray-500">
                    FedEx, Estafeta o Paquetexpress con recolección a domicilio vía convenio digital.
                  </p>
                </div>
                <span className="text-base font-black text-[#2D4F3E] shrink-0">$149 MXN</span>
              </div>

              {/* Partida 2: Embalaje Seguro */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                    <span>2. Insumos de Embalaje Seguro de Taller</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">Protección</span>
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Caja kraft corrugada ($11) + burbuja bicapa ($5.50) + cinta filamento y esquineros ($3.50).
                  </p>
                </div>
                <span className="text-base font-black text-[#2D4F3E] shrink-0">$20 MXN</span>
              </div>

              {/* Partida 3: Seguro Opcional */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-900 block">
                    3. Seguro contra Robo y Rotura (Opcional)
                  </span>
                  <p className="text-[11px] text-gray-500">
                    1.5% del valor declarado (mínimo $15 MXN). Cubre el 100% ante siniestro o extravío.
                  </p>
                </div>
                <span className="text-base font-black text-gray-700 shrink-0">~$15 MXN</span>
              </div>

              {/* Partida 4: Zona Extendida */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                    <span>4. Cargo por Zona Extendida (Reexpedición)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-rose-100 text-rose-800">Condicional</span>
                  </span>
                  <p className="text-[11px] text-rose-700">
                    Aplica solo si el CP destino es rural o de difícil acceso donde la paquetería va 1 vez por semana.
                  </p>
                </div>
                <span className="text-base font-black text-rose-800 shrink-0">+$95 a $120 MXN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CALCULADORA DE PESO VOLUMÉTRICO IATA                      */}
      {/* ============================================================ */}
      {activeTab === 'calculator' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <span>Calculadora de Peso Volumétrico Oficial (Fórmula IATA)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Las paqueterías en México cobran sobre el peso que resulte MAYOR: el peso físico en báscula o el peso volumétrico.
              </p>
            </div>
            <div className="text-xs font-mono bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 font-bold shrink-0">
              (Largo × Ancho × Alto) ÷ 5000
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inputs de dimensiones del paquete */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <span>Dimensiones de la Caja Exterior (cm):</span>
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Largo (cm):</label>
                  <input
                    type="number"
                    min="1"
                    value={calcLength}
                    onChange={(e) => setCalcLength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ancho (cm):</label>
                  <input
                    type="number"
                    min="1"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Alto (cm):</label>
                  <input
                    type="number"
                    min="1"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Peso en Báscula (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valor Declarado ($ MXN):</label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={calcInsuredValue}
                    onChange={(e) => setCalcInsuredValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>
              </div>
            </div>

            {/* Resultado y diagnóstico volumétrico */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <span className="text-xs font-bold text-gray-700">Diagnóstico de Peso Facturable:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    volumetricCalculations.isPenalizedByVolume
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {volumetricCalculations.isPenalizedByVolume ? '⚠️ Penalizado por Volumen' : '✓ Peso Óptimo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-3">
                  <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Peso Físico</span>
                    <span className="text-lg font-black text-gray-900">{volumetricCalculations.actualWeight} kg</span>
                  </div>
                  <div className={`p-3 rounded-xl border text-center ${
                    volumetricCalculations.isPenalizedByVolume ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Peso Volumétrico</span>
                    <span className="text-lg font-black text-gray-900">{volumetricCalculations.volWeight} kg</span>
                  </div>
                </div>

                {volumetricCalculations.isPenalizedByVolume && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-normal">
                    La paquetería te cobrará <strong>{volumetricCalculations.billableWeight} kg</strong> porque la caja ocupa mucho espacio. 
                    Recomendación: Recorta la altura de la caja para pagar menos en la guía.
                  </p>
                )}
              </div>

              {/* Resumen de Costo Aterrizado de Logística */}
              <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Guía base estimada ({volumetricCalculations.billableWeight} kg):</span>
                  <span className="font-bold text-gray-800">${volumetricCalculations.baseShippingRate} MXN</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Insumos de embalaje de taller:</span>
                  <span className="font-bold text-gray-800">${volumetricCalculations.workshopPackagingCost} MXN</span>
                </div>
                {volumetricCalculations.insuranceCost > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Seguro de mercancía (${calcInsuredValue}):</span>
                    <span className="font-bold text-gray-800">${volumetricCalculations.insuranceCost} MXN</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-sm font-black text-[#2D4F3E]">
                  <span>Total Aterrizado de Envío:</span>
                  <span>${volumetricCalculations.totalLandedShipping} MXN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. GENERADOR DE ETIQUETAS & RECOMENDACIÓN DE PEDIDO          */}
      {/* ============================================================ */}
      {activeTab === 'labels' && (
        <div className="space-y-6">
          {/* Recomendaciones Clave para Simplificar Etiquetas */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>¿Cómo Simplificar el Pedido de Etiquetas en el Taller?</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">1</span>
                  <span>Crea cuenta en Skydropx / Envíoclick</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  No necesitas contrato forzoso ni volumen mínimo. Cargas $300 o $500 pesos de saldo vía SPEI o tarjeta cuando tengas pedidos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">2</span>
                  <span>Copia los Datos en 1 Clic</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Usa nuestro formulario rápido de abajo para tener nombre, CP, colonia y teléfono formateados y pegarlos directamente sin teclear.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">3</span>
                  <span>Imprime tu Etiqueta de Taller 4x6"</span>
                </span>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Puedes imprimir en impresora térmica de rollo (o media carta adhesiva) con la advertencia de <strong>FRÁGIL: ARTESANÍA EN MADERA</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Formulario Rápido + Vista Previa de Etiqueta Térmica */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulario de captura rápida de datos */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>Datos del Destinatario (Cliente):</span>
                </h4>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleShareViaWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    title="Enviar datos formateados por WhatsApp para solicitar guía"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pedir por WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyFormattedAddress}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {copiedState ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedState ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      value={labelForm.recipientName}
                      onChange={(e) => setLabelForm({ ...labelForm, recipientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Teléfono (10 dígitos):</label>
                    <input
                      type="text"
                      value={labelForm.recipientPhone}
                      onChange={(e) => setLabelForm({ ...labelForm, recipientPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Calle y Número Exterior / Interior:</label>
                  <input
                    type="text"
                    value={labelForm.street}
                    onChange={(e) => setLabelForm({ ...labelForm, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Colonia:</label>
                    <input
                      type="text"
                      value={labelForm.colony}
                      onChange={(e) => setLabelForm({ ...labelForm, colony: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Código Postal (CP):</label>
                    <input
                      type="text"
                      value={labelForm.postalCode}
                      onChange={(e) => setLabelForm({ ...labelForm, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Ciudad / Estado:</label>
                    <input
                      type="text"
                      value={labelForm.city}
                      onChange={(e) => setLabelForm({ ...labelForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Entre Calles y Referencias:</label>
                  <input
                    type="text"
                    value={labelForm.references}
                    onChange={(e) => setLabelForm({ ...labelForm, references: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Descripción del Contenido:</label>
                    <input
                      type="text"
                      value={labelForm.contentDescription}
                      onChange={(e) => setLabelForm({ ...labelForm, contentDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Peso Declarado:</label>
                    <input
                      type="text"
                      value={labelForm.declaredWeight}
                      onChange={(e) => setLabelForm({ ...labelForm, declaredWeight: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#2D4F3E]"
                    />
                  </div>
                </div>

                {/* Accesos directos a plataformas de guías */}
                <div className="pt-2.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                  <span className="font-semibold text-gray-700">Abrir portal de guías en 1 clic:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://app.skydropx.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Skydropx</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </a>
                    <a
                      href="https://ship.envia.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>Envia.com</span>
                      <ExternalLink className="w-3 h-3 text-stone-500" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista Previa de Etiqueta Térmica de Despacho 4x6" */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-purple-600" />
                  <span>Vista Previa: Etiqueta Térmica de Taller (Formato 4x6")</span>
                </span>

                <button
                  type="button"
                  onClick={handlePrintThermalLabel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Etiqueta</span>
                </button>
              </div>

              {/* Contenedor Imprimible de la Etiqueta */}
              <div 
                id="printable-shipping-label"
                className="bg-white p-5 rounded-2xl border-2 border-dashed border-gray-400 text-gray-900 shadow-sm space-y-4 font-mono text-[11px] leading-tight select-none"
              >
                {/* Cabecera Remitente */}
                <div className="flex items-start justify-between pb-3 border-b-2 border-black">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-sans">REMITENTE (ORIGEN):</span>
                    <strong className="text-xs font-black block font-sans text-gray-900">TALLER ARTESANO DIGITAL</strong>
                    <span className="text-[10px] text-gray-600 block">San Luis Potosí, S.L.P., C.P. 78000</span>
                    <span className="text-[10px] text-gray-600 block">WhatsApp: +52 444 800 1234</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] px-2 py-0.5 rounded font-black bg-black text-white block uppercase">DESPACHO TALLER</span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Ref: {labelForm.orderNumber}</span>
                  </div>
                </div>

                {/* Gran Bloque de Destinatario */}
                <div className="p-3 rounded-xl bg-stone-100 border border-stone-300 space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-sans">DESTINATARIO (ENTREGA):</span>
                  <div className="text-sm font-black uppercase text-black font-sans">{labelForm.recipientName}</div>
                  <div className="text-xs font-bold text-gray-800">{labelForm.street}</div>
                  <div className="text-xs text-gray-700">Col. {labelForm.colony} · C.P. {labelForm.postalCode}</div>
                  <div className="text-xs font-black text-black">{labelForm.city}, {labelForm.state}</div>
                  <div className="text-[10px] text-gray-600 pt-1">Tel: {labelForm.recipientPhone}</div>
                  {labelForm.references && (
                    <div className="text-[10px] text-gray-500 italic pt-0.5">Ref: {labelForm.references}</div>
                  )}
                </div>

                {/* Sello de Advertencia FRÁGIL */}
                <div className="p-2.5 rounded-lg border-2 border-black bg-amber-50 text-center space-y-0.5">
                  <span className="text-xs font-black tracking-widest text-black block">
                    ⚠️ FRÁGIL: ARTESANÍA EN MADERA &amp; CERÁMICA ⚠️
                  </span>
                  <span className="text-[9px] font-sans font-bold text-gray-700 block uppercase">
                    MANÉJESE CON SUMO CUIDADO · NO GOLPEAR · NO ESTIBAR PESADO
                  </span>
                </div>

                {/* Ficha técnica y Código de Barras Simulado */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-[10px]">
                  <div>
                    <span>Contenido: {labelForm.contentDescription}</span>
                    <span className="block text-gray-500">Peso: {labelForm.declaredWeight}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tracking-widest font-black text-xs">||||| | |||| || ||| ||||</div>
                    <span className="text-[9px] text-gray-500 font-mono">{labelForm.orderNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
