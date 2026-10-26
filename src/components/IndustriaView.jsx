import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  Wrench,
  Cpu,
  Package,
  Boxes,
  RotateCcw,
  MessageCircle,
  UploadCloud,
  ChevronDown,
  MapPin,
  ShoppingBag,
  Sliders,
  Check,
  CheckCircle2,
  AlertCircle,
  Car,
  Factory,
  Activity,
  Utensils,
  Truck,
  Palette
} from 'lucide-react';
import { getFilamentColor } from '../utils/colorUtils';

export default function IndustriaView({
  settings,
  onGoHome,
  onOpenCalculator
}) {
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Estado de la Pestaña Desplegable de Colores por Material
  const [showColorsDrawer, setShowColorsDrawer] = useState(false);
  const [colorDrawerMaterial, setColorDrawerMaterial] = useState('petg');

  // Estado para desplegar información técnica en las 4 Aplicaciones
  const [expandedApp, setExpandedApp] = useState(null);

  // Estado para desplegar información completa en Información Clave
  const [expandedInfo, setExpandedInfo] = useState(null);

  // Catálogo Ampliado de Colores Técnicos por Polímero
  const INDUSTRIAL_COLORS_BY_MATERIAL = {
    petg: {
      materialName: 'PETG Técnico',
      tag: 'Mecánico & Refacciones',
      colors: [
        { name: 'Negro Ónix Mate', desc: 'Acabado antirreflejo para carcasas y componentes mecánicos', finish: 'Satinado Técnico' },
        { name: 'Negro Carbón', desc: 'Negro profundo de alta resistencia química y al desgaste', finish: 'Brillante Mecánico' },
        { name: 'Blanco Puro', desc: 'Ductos de aire e interiores limpios de maquinaria', finish: 'Sólido' },
        { name: 'Blanco Marfil', desc: 'Tono neutro cálido para inspección visual de ensambles', finish: 'Sólido Técnico' },
        { name: 'Gris Plomo Titán', desc: 'Tono maquinaria neutro que disimula polvo y grasa', finish: 'Industrial' },
        { name: 'Gris Perla', desc: 'Gris claro institucional para gabinetes y carcasas', finish: 'Neutro' },
        { name: 'Plata Metálico', desc: 'Símil de aluminio pulido para maquetas ejecutivas', finish: 'Seda Metálica' },
        { name: 'Azul Marino Medianoche', desc: 'Gabinetes, cajas y soportes corporativos', finish: 'Sólido Corporativo' },
        { name: 'Azul Cobalto', desc: 'Identificación de líneas neumáticas y piezas activas', finish: 'Señalización' },
        { name: 'Azul Cielo', desc: 'Galgas de verificación visual y codificación rápida', finish: 'Alta Visibilidad' },
        { name: 'Rojo Carmesí', desc: 'Guardas de seguridad, topes y paros de emergencia', finish: 'Seguridad' },
        { name: 'Naranja Cálido', desc: 'Galgas de advertencia y poka-yoke visual en celda', finish: 'Advertencia' },
        { name: 'Mostaza Colonial', desc: 'Zonas de precaución y señalética industrial de planta', finish: 'Precaución' },
        { name: 'Verde Olivo Táctico', desc: 'Tono mate sobrio sin reflejos plásticos', finish: 'Mate Táctico' },
        { name: 'Verde Esmeralda', desc: 'Identificación de piezas aptas o verificadas', finish: 'Aprobación' },
        { name: 'Translúcido Cristal', desc: 'Visor de flujo de líquidos o difusor de luz LED', finish: 'Translúcido' }
      ]
    },
    tpu: {
      materialName: 'TPU 95A Elastómero',
      tag: 'Flexible & Antirrayón',
      colors: [
        { name: 'Negro Ónix Mate', desc: 'Aspecto de caucho vulcanizado para amortiguadores', finish: 'Goma Flexible' },
        { name: 'Negro Carbón', desc: 'Protecciones de impacto para esquinas y fixtures', finish: 'Goma Densa' },
        { name: 'Blanco Puro', desc: 'Topes y ventosas limpias que no manchan piezas de vista', finish: 'Goma Limpia' },
        { name: 'Gris Plomo Titán', desc: 'Apoyos y bases elásticas para estaciones de ensamble', finish: 'Amortiguador' },
        { name: 'Rojo Carmesí', desc: 'Topes de final de carrera y parachoques visuales', finish: 'Impacto Visual' },
        { name: 'Naranja Cálido', desc: 'Protecciones de arista y juntas visibles para operario', finish: 'Flexible Señal' },
        { name: 'Mostaza Colonial', desc: 'Galgas flexibles para comprobación de tolerancias', finish: 'Precaución' },
        { name: 'Azul Cobalto', desc: 'Mordazas suaves para robots y nidos de ensamble', finish: 'Sujeción Suave' },
        { name: 'Verde Olivo', desc: 'Sellos y fuelles de protección en maquinaria pesada', finish: 'Goma Industrial' },
        { name: 'Translúcido Cristal', desc: 'Sellos, fuelles y empaques semi-transparentes', finish: 'Goma Translúcida' }
      ]
    },
    plaplus: {
      materialName: 'PLA+ Pro Alta Rigidez',
      tag: 'Prototipos & Pruebas DFM',
      colors: [
        { name: 'Negro Ónix Mate', desc: 'Máxima definición geométrica y comprobación de holguras', finish: 'Ultra Precisión' },
        { name: 'Negro Carbón', desc: 'Alta rigidez para ensambles mecánicos de prueba', finish: 'Sólido' },
        { name: 'Blanco Puro', desc: 'Excelente contraste para revisión de cotas y maquetas', finish: 'Mate Puro' },
        { name: 'Blanco Marfil', desc: 'Verificación de ensambles con tornillería y roscas', finish: 'Satinado' },
        { name: 'Gris Plomo Titán', desc: 'Símil visual de pieza maquinada en bloque de aluminio', finish: 'Neutro' },
        { name: 'Gris Perla', desc: 'Plantillas de inspección visual y maquetas de volumen', finish: 'Técnico' },
        { name: 'Plata Metálico', desc: 'Reflejo metálico fino para presentaciones ejecutivas', finish: 'Seda Metálica' },
        { name: 'Terracota', desc: 'Arcilla cálida con alta visibilidad de detalle y curvatura', finish: 'Satinado' },
        { name: 'Rojo Carmesí', desc: 'Identificación de puntos críticos de interferencia', finish: 'Contraste Alto' },
        { name: 'Naranja Cálido', desc: 'Validación de ergonomía y agarre manual', finish: 'Ergonómico' },
        { name: 'Mostaza Colonial', desc: 'Comprobación de perfiles y soportes de sensor', finish: 'Inspección' },
        { name: 'Verde Olivo Táctico', desc: 'Tono mate insignia del taller para prototipos maestros', finish: 'Mate Táctico' },
        { name: 'Verde Menta', desc: 'Estudios de usabilidad y piezas de concepto estético', finish: 'Pastel Técnico' },
        { name: 'Azul Marino Medianoche', desc: 'Maquetas corporativas y ensambles estructurales', finish: 'Sólido' },
        { name: 'Azul Cobalto', desc: 'Piezas maestras de calibración dimensional', finish: 'Vibrante' },
        { name: 'Lavanda / Violeta', desc: 'Diferenciación de versiones y prototipos de prueba', finish: 'Diferencial' }
      ]
    },
    abs: {
      materialName: 'ABS / ASA Industrial',
      tag: 'Resistencia Térmica & UV',
      colors: [
        { name: 'Negro Ónix Mate', desc: 'Protección UV exterior y resistencia a temperatura continua', finish: 'Térmico Exterior' },
        { name: 'Negro Carbón', desc: 'Chasis robustos y carcasas de protección eléctrica', finish: 'Industrial' },
        { name: 'Blanco Puro', desc: 'Reflexión solar y baja absorción de calor en intemperie', finish: 'Intemperie Solar' },
        { name: 'Gris Plomo Titán', desc: 'Reemplazos técnicos y cubiertas de bombas o motores', finish: 'Industrial' },
        { name: 'Gris Perla', desc: 'Gabinetes de control para líneas de automatización', finish: 'Control' },
        { name: 'Rojo Carmesí', desc: 'Guardas térmicas y tapas de zonas calientes en planta', finish: 'Alerta Térmica' },
        { name: 'Azul Marino Medianoche', desc: 'Cajas de distribución y tableros bajo intemperie', finish: 'Exterior' },
        { name: 'Naranja Cálido', desc: 'Carcasas visibles en ambientes con riesgo de impacto', finish: 'Señalización' }
      ]
    }
  };

  // Material Interactivo Seleccionado
  const [selectedMaterialTab, setSelectedMaterialTab] = useState('petg');

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    correo: '',
    whatsapp: '',
    aplicacion: 'Prototipos funcionales (desde 24 a 72 hrs)',
    material: 'PETG Técnico (Tenaz)',
    colorSeleccionado: 'Negro Ónix Mate (Estándar)',
    cantidad: '1',
    urgencia: 'Desde 24 a 72 hrs',
    detalles: '',
    requiereNda: false,
    archivoNombre: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, archivoNombre: e.target.files[0].name }));
    }
  };

  const handleSubmitWhatsApp = (e) => {
    if (e) e.preventDefault();
    
    const text = `🏭 *ORDEN TÉCNICA DE COTIZACIÓN INDUSTRIAL · ARTESANO DIGITAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Contacto:* ${formData.nombre || 'No especificado'}
🏢 *Empresa / Planta:* ${formData.empresa || 'Particular / Taller'}
📧 *Correo Corporativo:* ${formData.correo || 'Pendiente'}
📱 *Tel/WhatsApp:* ${formData.whatsapp || 'Mismo número'}

⚙️ *PARÁMETROS DE MANUFACTURA:*
• *Aplicación:* ${formData.aplicacion}
• *Polímero sugerido:* ${formData.material}
• *Color / Acabado:* ${formData.colorSeleccionado || 'Negro Ónix Mate (Estándar)'}
• *Cantidad:* ${formData.cantidad} pieza(s)
• *Tiempo de entrega:* ${formData.urgencia}
• *Archivo 3D / Plano:* ${formData.archivoNombre ? `Archivo: ${formData.archivoNombre}` : 'Muestra física / foto con cotas'}
• *Convenio NDA:* ${formData.requiereNda ? 'SÍ (Requiero firma previa de confidencialidad)' : 'No necesario'}

📝 *Requerimientos funcionales / Notas:*
${formData.detalles || 'Sin requerimientos especiales de temperatura o tracción.'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 *San Luis Potosí, S.L.P. · Entrega local en planta*`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setFormSubmitted(true);
  };

  // Diccionario de Materiales Técnicos Calibrados a la Maquinaria del Taller
  const materialsData = {
    petg: {
      id: 'petg',
      name: 'PETG Técnico Industrial',
      tag: 'USO MECÁNICO GENERAL · ALTA TENACIDAD',
      temp: '75°C - 80°C',
      impact: 'Alto (Tenaz sin fractura frágil)',
      chemical: 'Resistente a lubricantes, agua y alcoholes',
      tensile: '50 MPa',
      density: '1.27 g/cm³',
      summary: 'El caballo de batalla del taller. Excelente unión interlaminar, alta durabilidad y absorción de impacto sin romperse. Producido con máxima precisión dimensional para refacciones y piezas mecánicas.',
      apps: ['Guardas de seguridad de maquinaria', 'Ductos de aire y ventilación', 'Cajas de componentes electrónicos', 'Soportes de montaje y fijación']
    },
    tpu: {
      id: 'tpu',
      name: 'TPU 95A Poliuretano Elastómero',
      tag: 'AMORTIGUACIÓN & IMPACTO · FLEXIBLE',
      temp: '85°C',
      impact: 'Ultra Alto (Elastomérico indestructible)',
      chemical: 'Excelente contra aceites minerales y grasas',
      tensile: '35 MPa (Elongación >450%)',
      density: '1.21 g/cm³',
      summary: 'Caucho técnico con memoria de forma y altísima resistencia al desgarro. No marca ni raya superficies pulidas o pintadas en línea de ensamble.',
      apps: ['Topes de final de carrera', 'Nidos para piezas delicadas / sin rayones', 'Sellos, empaques y juntas', 'Mordazas flexibles de sujeción']
    },
    plaplus: {
      id: 'plaplus',
      name: 'PLA+ Pro Alta Rigidez',
      tag: 'VALIDACIÓN DIMENSIONAL RÁPIDA · ALTA PRECISIÓN',
      temp: '60°C',
      impact: 'Medio-Alto (Rígido)',
      chemical: 'Estable en ambientes secos de oficina o ensamble',
      tensile: '55 MPa (Módulo de alta rigidez)',
      density: '1.24 g/cm³',
      summary: 'Máxima precisión geométrica y definición de aristas para comprobaciones de holgura, pruebas de ensamble con tornillos y prototipos entregados en 24 a 72 horas.',
      apps: ['Maquetas de ensamble rápido', 'Galgas de comprobación visual', 'Modelos ergonómicos de prueba', 'Piezas de ajuste pre-mecanizado']
    },
    abs: {
      id: 'abs',
      name: 'ABS / ASA Industrial',
      tag: 'CABINA CERRADA AISLADA · TÉRMICO',
      temp: '90°C - 95°C',
      impact: 'Alto con ductilidad térmica',
      chemical: 'Resistencia a intemperie UV (ASA) y calor',
      tensile: '42 MPa',
      density: '1.06 g/cm³',
      summary: 'Procesado en cabina cerrada para retener temperatura y evitar corrientes de aire. Recomendado para piezas de tamaño pequeño a mediano con requerimientos de calor o intemperie.',
      apps: ['Gabinetes y carcasas para intemperie', 'Refacciones bajo temperatura', 'Plantillas de verificación térmica', 'Piezas sometidas a calor moderado']
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E11] text-[#E9E6DD] font-sans selection:bg-[#5BB8FF] selection:text-[#0A0E11]">
      
      {/* ========================================================
          1. HEADER TÉCNICO COMPACTO CON LOGO OFICIAL NEÓN
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0A0E11]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center">
            {/* Isotipo Oficial Neón sin bordes cuadrados */}
            <div onClick={onGoHome} className="flex items-center gap-2 cursor-pointer group" title="Ir a la tienda principal">
              <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-[#5BB8FF] drop-shadow-[0_0_12px_rgba(91,184,255,0.6)] flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 238.98 284.35" fill="currentColor" className="w-full h-full">
                  <path d="M180.24,153.33s-6.44-6.53-6.44-6.54c-.92-1.02-.25-1.99-.13-2.15l6.53-6.43c.54-.53,.55-1.4,.02-1.94l-5.8-5.9c-.53-.54-1.4-.55-1.94-.02l-5.95,5.86c-.36,.36-.95,.35-1.3-.01l-14.32-14.57c-.6-.61-1.57-.62-2.18-.02l-23.16,22.79c-.61,.6-.61,1.57-.02,2.18l22.79,23.16c.6,.61,1.57,.61,2.18,.02l14.83-14.59c.36-.35,.93-.35,1.28,.01l5.77,5.87c.53,.54,1.4,.55,1.94,.02l5.89-5.8c.54-.53,.55-1.4,.02-1.94Z"/>
                  <path d="M58.91,138.1s6.44,6.53,6.44,6.54c.92,1.02,.25,1.99,.13,2.15l-6.53,6.43c-.54,.53-.55,1.4-.02,1.94l5.8,5.9c.53,.54,1.4,.55,1.94,.02l5.95-5.86c.36-.36,.95-.35,1.3,.01l14.32,14.57c.6,.61,1.57,.62,2.18,.02l23.16-22.79c.61-.6,.61-1.57,.02-2.18l-22.79-23.16c-.6-.61-1.57-.61-2.18-.02l-14.83,14.59c-.36,.35-.93,.35-1.28-.01l-5.77-5.87c-.53-.54-1.4-.55-1.94-.02l-5.89,5.8c-.54,.53-.55,1.4-.02,1.94Z"/>
                  <path d="M55.82,85.25l27.29,27.73c.92,.94,.91,2.44-.03,3.37l-8.08,7.95c-.94,.92-2.44,.91-3.37-.03l-6.16-6.26c-1.07-1.09-2.82-1.1-3.9-.03l-6.67,6.56c-1.01,.99-2.63,.98-3.62-.03l-16.11-16.23v-7.53l16.39-15.56c1.2-1.15,3.09-1.12,4.26,.06Z"/>
                  <path d="M56.04,206.99l28.55-28.2c.96-.95,.97-2.51,.02-3.47l-8.22-8.32c-.95-.96-2.51-.97-3.47-.02l-6.79,6.71c-.93,.92-2.42,.91-3.34-.02l-7.12-7.21c-1.03-1.04-2.7-1.05-3.74-.02l-16.76,16.5v7.77l16.47,16.29c1.22,1.2,3.17,1.2,4.39,0Z"/>
                  <path d="M181.8,206.43l-27.29-27.73c-.92-.94-.91-2.44,.03-3.37l8.08-7.95c.94-.92,2.44-.91,3.37,.03l6.16,6.26c1.07,1.09,2.82,1.1,3.9,.03l6.67-6.56c1.01-.99,2.63-.98,3.62,.03l17.46,17.72v4.49l-17.75,17.1c-1.2,1.15-3.09,1.12-4.26-.06Z"/>
                  <path d="M184.77,87.15l-26.62,26.29c-.9,.89-.91,2.34-.02,3.24l7.66,7.76c.89,.9,2.34,.91,3.24,.02l6.33-6.25c.86-.85,2.26-.85,3.11,.02l6.64,6.72c.96,.97,2.52,.98,3.48,.02l15.2-15v-8.04l-14.93-14.77c-1.13-1.12-2.96-1.12-4.09,0Z"/>
                  <path d="M176.93,210.65l-26.23-26.67c-.93-.95-2.45-.96-3.4-.03l-8.15,8.02c-.95,.93-.96,2.45-.03,3.4l5.89,6c.54,.55,.53,1.43-.02,1.97l-7.72,7.59c-1.02,1-1.03,2.64-.03,3.66l13.69,13.95h12.6l13.38-13.6c1.18-1.19,1.18-3.1,0-4.3Z"/>
                  <path d="M111.46,207.92s6.64-6.54,6.64-6.54c1.03-.93,2.02-.26,2.18-.13l6.53,6.64c.54,.55,1.42,.56,1.97,.02l5.99-5.89c.55-.54,.56-1.42,.02-1.97l-5.95-6.05c-.36-.37-.36-.96,.01-1.32l14.81-14.55c.62-.61,.62-1.6,.02-2.21l-23.15-23.53c-.61-.62-1.6-.62-2.21-.02l-23.53,23.15c-.62,.61-.62,1.6-.02,2.21l14.83,15.07c.36,.36,.35,.94-.01,1.3l-5.96,5.86c-.55,.54-.56,1.42-.02,1.97l5.89,5.99c.54,.55,1.42,.56,1.97,.02Z"/>
                  <path d="M62.61,209.01l25.49-25.16c.89-.88,2.32-.87,3.19,.02l7.08,7.17c.88,.89,.87,2.32-.02,3.19l-5.89,5.81c-.62,.61-.63,1.61-.01,2.23l7.44,7.54c.94,.96,.93,2.5-.02,3.44l-15.37,15.29h-7.15l-14.8-15.49c-1.09-1.13-1.07-2.93,.05-4.04Z"/>
                  <path d="M58.13,79.53l29.98,30.5c1.08,1.09,2.84,1.11,3.93,.03l9.44-9.29c1.09-1.08,1.11-2.84,.03-3.93l-5.63-5.75c-1.07-1.09-1.05-2.83,.03-3.9l8.12-7.99c1.18-1.16,1.19-3.05,.03-4.23l-18.65-19.16h-8.8l-18.48,18.75c-1.37,1.38-1.37,3.59-.01,4.97Z"/>
                  <path d="M183.73,78.89l-31.23,30.73c-1.06,1.04-2.75,1.02-3.79-.03l-8.95-9.1c-1.04-1.06-1.02-2.75,.03-3.79l7.43-7.31c1.01-1,1.03-2.63,.03-3.64l-7.76-7.88c-1.12-1.14-1.1-2.96,.03-4.08l18.27-17.98h8.48l17.52,18.3c1.29,1.35,1.27,3.48-.07,4.79Z"/>
                  <path d="M114.18,84.86c-.67-.68-1.77-.69-2.45-.02l-6.27,6.17c-.68,.67-.69,1.77-.02,2.45l5.4,5.49c.34,.34,.35,.89,0,1.23-2.77,2.78-14.22,14.1-14.22,14.1-.59,.58-.6,1.54-.02,2.13l22.28,22.65c.58,.59,1.54,.6,2.13,.02l22.65-22.28c.59-.58,.6-1.54,.02-2.13l-29.51-29.8Z"/>
                  <rect x="125.77" y="80.53" width="14.03" height="14.03" rx="2.88" ry="2.88" transform="translate(102.06 -68.51) rotate(45.46)"/>
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase font-display group-hover:text-[#5BB8FF] transition-colors">
                  ARTESANO DIGITAL
                </div>
                <div className="font-mono text-[9.5px] sm:text-[10.5px] text-[#5BB8FF] tracking-wider uppercase font-semibold">
                  FABRICACIÓN 3D · SLP
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono tracking-widest text-[#8FB99B] border border-[#8FB99B]/30 bg-[#8FB99B]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FB99B] animate-pulse" />
              SLP · ZONA INDUSTRIAL
            </span>
            <a
              href="#cotizar-industria"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5BB8FF] hover:bg-[#8AD2FF] text-[#0A0E11] font-bold text-xs tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(91,184,255,0.3)] cursor-pointer"
            >
              <span>Cotizar Pieza</span>
            </a>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. BANNER HERO INDUSTRIAL CON PLANO VECTORIAL (CONSERVADO)
          ======================================================== */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#10171D] via-[#0A0E11] to-[#0A0E11] pt-6 sm:pt-10 pb-8 sm:pb-14">
        {/* Rejilla milimétrica sutil de fondo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto Principal */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF]">
                <span className="w-5 h-px bg-[#5BB8FF] inline-block" />
                Manufactura Aditiva Industrial · San Luis Potosí
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.06]">
                Que una refacción no detenga <span className="text-[#5BB8FF] drop-shadow-[0_0_20px_rgba(91,184,255,0.4)]">tu línea.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#C4CCD0] max-w-xl leading-relaxed">
                Taller local de manufactura bajo demanda para empresas de SLP. Prototipado funcional rápido, utillaje de ensamble, refacciones descatalogadas y lotes cortos en polímeros técnicos de grado ingeniería.
              </p>




            </div>

            {/* Ficha Técnica Blueprint Vectorial (Desktop / Pantallas grandes) */}
            <div className="lg:col-span-5 mt-4 lg:mt-0">
              <div className="rounded-2xl border border-white/15 bg-[#10161A] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-[10px]">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#5BB8FF]" />
                    DWG-REF // SLP-IND-2026
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#8FB99B]/15 text-[#8FB99B] border border-[#8FB99B]/30 font-bold flex items-center gap-1 text-[9px] sm:text-[9.5px]">
                      <ShieldCheck className="w-3 h-3" />
                      <span>NDA DISPONIBLE</span>
                    </span>
                    <span className="text-[#5BB8FF] font-bold">REVISIÓN TÉCNICA</span>
                  </div>
                </div>

                <div className="my-3 rounded-xl bg-[#080C0E] border border-white/10 p-3 relative">
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-[#8FB99B] bg-[#8FB99B]/10 px-2 py-0.5 rounded border border-[#8FB99B]/20">
                    TOLERANCIA ±0.15 mm
                  </div>

                  <svg viewBox="0 0 400 240" className="w-full h-auto">
                    <defs>
                      <pattern id="grid-blueprint" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M20 0H0V20" fill="none" stroke="#FFFFFF" strokeOpacity="0.045" strokeWidth="1" />
                      </pattern>
                      <marker id="arrow-cad" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                        <path d="M0 0 L6 3 L0 6 Z" fill="#5BB8FF" />
                      </marker>
                    </defs>
                    <rect width="400" height="240" fill="url(#grid-blueprint)" />

                    {/* Geometría funcional en corte */}
                    <path
                      d="M60 80 H150 V130 L220 170 H340 V200 H60 Z"
                      fill="#141E24"
                      stroke="#5BB8FF"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path d="M150 130 L220 170" stroke="#8AD2FF" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Nervadura de refuerzo */}
                    <line x1="150" y1="80" x2="150" y2="130" stroke="#ffffff25" strokeWidth="1" />
                    <line x1="220" y1="170" x2="220" y2="200" stroke="#ffffff25" strokeWidth="1" />

                    {/* Barrenos avellanados para tornillería M6 */}
                    <circle cx="100" cy="110" r="7" fill="#080C0E" stroke="#E9E6DD" strokeWidth="1.5" />
                    <circle cx="100" cy="180" r="8" fill="#080C0E" stroke="#E9E6DD" strokeWidth="1.5" />
                    <circle cx="270" cy="185" r="8" fill="#080C0E" stroke="#E9E6DD" strokeWidth="1.5" />
                    <circle cx="315" cy="185" r="6" fill="#080C0E" stroke="#E9E6DD" strokeWidth="1.5" />

                    {/* Líneas de cota */}
                    <g stroke="#5BB8FF" strokeWidth="1" opacity="0.8">
                      <line x1="60" y1="222" x2="340" y2="222" markerStart="url(#arrow-cad)" markerEnd="url(#arrow-cad)" />
                      <line x1="60" y1="205" x2="60" y2="228" />
                      <line x1="340" y1="205" x2="340" y2="228" />
                      <line x1="42" y1="80" x2="42" y2="200" markerStart="url(#arrow-cad)" markerEnd="url(#arrow-cad)" />
                      <line x1="36" y1="80" x2="55" y2="80" />
                      <line x1="36" y1="200" x2="55" y2="200" />
                    </g>
                    <text x="200" y="217" fill="#5BB8FF" textAnchor="middle" fontSize="9.5" fontFamily="monospace">
                      280.0 mm
                    </text>
                    <text x="32" y="145" fill="#5BB8FF" textAnchor="middle" transform="rotate(-90 32 145)" fontSize="9.5" fontFamily="monospace">
                      120.0 mm
                    </text>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono text-[10px]">
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="block text-gray-400 text-[8px] uppercase">Polímeros Taller</span>
                    <strong className="text-white">PETG / ABS / TPU</strong>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="block text-gray-400 text-[8px] uppercase">Precisión</span>
                    <strong className="text-[#8FB99B]">±0.15 mm</strong>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="block text-gray-400 text-[8px] uppercase">Capacidad</span>
                    <strong className="text-[#5BB8FF]">1 a 500+ pzs</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECCIÓN 01: 4 SOLUCIONES EN 4 CUADROS (GRID 2x2 COMPACTO)
          ======================================================== */}
      <section className="py-7 sm:py-12 border-b border-white/10 bg-[#0E1317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="mb-4 sm:mb-7">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
              <span className="w-5 h-px bg-[#5BB8FF]" />
              01 / Aplicaciones
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
              Cuatro problemas de planta. Una respuesta local.
            </h2>
          </div>

          {/* Grid de 4 Cuadros / Rectángulos (2x2 en celular y escritorio para evitar scroll excesivo) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-5">
            
            {/* Cuadro 1: Prototipos Funcionales */}
            <div
              className={`rounded-xl sm:rounded-2xl border transition-all duration-200 bg-[#12181C] shadow-md flex flex-col justify-between overflow-hidden ${
                expandedApp === 'proto'
                  ? 'border-[#5BB8FF] ring-1 ring-[#5BB8FF]/40 bg-[#141C22]'
                  : 'border-white/10 hover:border-[#5BB8FF]/50'
              }`}
            >
              <div
                onClick={() => setExpandedApp(expandedApp === 'proto' ? null : 'proto')}
                className="p-3 sm:p-5 cursor-pointer space-y-2 flex-1"
              >
                <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="text-[#5BB8FF] font-bold">PROTO-01</span>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline text-gray-300">Entrega 24 a 72 hrs</span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 font-sans font-semibold ${
                      expandedApp === 'proto' ? 'bg-[#5BB8FF] text-black' : 'bg-white/5 text-gray-300'
                    }`}>
                      {expandedApp === 'proto' ? 'Cerrar' : '+ Info'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedApp === 'proto' ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#5BB8FF]/10 border border-[#5BB8FF]/20 flex items-center justify-center shrink-0 text-[#5BB8FF]">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-white leading-snug">
                      Prototipos funcionales
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-300 leading-snug mt-1">
                      Prueba ajustes, interferencias de ensamble y holguras imprimiendo directamente tu archivo 3D antes de mandar a fabricar en serie o invertir en moldes.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1 text-[8.5px] sm:text-[9.5px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">±0.15 mm</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#5BB8FF]/10 text-[#5BB8FF] border border-[#5BB8FF]/20">PETG · PLA+</span>
                </div>
              </div>

              {expandedApp === 'proto' && (
                <div className="p-3 sm:p-4 bg-[#090D10] border-t border-white/10 text-[10.5px] sm:text-xs space-y-2 animate-fadeIn">
                  <p className="text-gray-300 leading-relaxed">
                    Permite comprobar ensamble con tornillería estándar, holguras con rodamientos y prueba ergonómica en mano del operario antes de invertir en herramentales permanentes.
                  </p>
                  <div className="pt-1 flex items-center justify-between border-t border-white/5">
                    <span className="text-[9.5px] text-[#5BB8FF] font-mono">Formatos: .STEP, .STP, .STL</span>
                    <a
                      href="#cotizar-industria"
                      onClick={() => setFormData(prev => ({ ...prev, aplicacion: 'Prototipos funcionales (desde 24 a 72 hrs)', urgencia: 'Desde 24 a 72 hrs' }))}
                      className="px-2.5 py-1 rounded bg-[#5BB8FF] text-black font-bold text-[10px] sm:text-xs inline-flex items-center gap-1"
                    >
                      <span>Cotizar</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Cuadro 2: Utillaje y Herramentales */}
            <div
              className={`rounded-xl sm:rounded-2xl border transition-all duration-200 bg-[#12181C] shadow-md flex flex-col justify-between overflow-hidden ${
                expandedApp === 'jig'
                  ? 'border-[#8FB99B] ring-1 ring-[#8FB99B]/40 bg-[#141C22]'
                  : 'border-white/10 hover:border-[#8FB99B]/50'
              }`}
            >
              <div
                onClick={() => setExpandedApp(expandedApp === 'jig' ? null : 'jig')}
                className="p-3 sm:p-5 cursor-pointer space-y-2 flex-1"
              >
                <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="text-[#8FB99B] font-bold">JIG-02</span>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline text-gray-300">Herramental a medida</span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 font-sans font-semibold ${
                      expandedApp === 'jig' ? 'bg-[#8FB99B] text-black' : 'bg-white/5 text-gray-300'
                    }`}>
                      {expandedApp === 'jig' ? 'Cerrar' : '+ Info'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedApp === 'jig' ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#8FB99B]/10 border border-[#8FB99B]/20 flex items-center justify-center shrink-0 text-[#8FB99B]">
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-white leading-snug">
                      Utillaje y herramentales
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-300 leading-snug mt-1">
                      Fabricamos con las medidas exactas de tu archivo nidos de apoyo, plantillas para operarios y mordazas protectoras que no rayan piezas terminadas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1 text-[8.5px] sm:text-[9.5px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Ajuste fiel</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#8FB99B]/10 text-[#8FB99B] border border-[#8FB99B]/20">TPU 95A · PETG</span>
                </div>
              </div>

              {expandedApp === 'jig' && (
                <div className="p-3 sm:p-4 bg-[#090D10] border-t border-white/10 text-[10.5px] sm:text-xs space-y-2 animate-fadeIn">
                  <p className="text-gray-300 leading-relaxed">
                    Nidos de apoyo para atornilladores, galgas Poka-Yoke de paso/no-paso e insertos en elastómero TPU que evitan marcas en piezas pulidas o pintadas.
                  </p>
                  <div className="pt-1 flex items-center justify-between border-t border-white/5">
                    <span className="text-[9.5px] text-[#8FB99B] font-mono">Superficie antirrayón</span>
                    <a
                      href="#cotizar-industria"
                      onClick={() => setFormData(prev => ({ ...prev, aplicacion: 'Utillaje y herramentales', urgencia: 'A medida' }))}
                      className="px-2.5 py-1 rounded bg-[#8FB99B] text-black font-bold text-[10px] sm:text-xs inline-flex items-center gap-1"
                    >
                      <span>Cotizar</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Cuadro 3: Refacciones y Obsoletos */}
            <div
              className={`rounded-xl sm:rounded-2xl border transition-all duration-200 bg-[#12181C] shadow-md flex flex-col justify-between overflow-hidden ${
                expandedApp === 'spare'
                  ? 'border-amber-400 ring-1 ring-amber-400/40 bg-[#141C22]'
                  : 'border-white/10 hover:border-amber-400/50'
              }`}
            >
              <div
                onClick={() => setExpandedApp(expandedApp === 'spare' ? null : 'spare')}
                className="p-3 sm:p-5 cursor-pointer space-y-2 flex-1"
              >
                <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="text-amber-400 font-bold">SPARE-03</span>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline text-gray-300">Sustitución directa</span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 font-sans font-semibold ${
                      expandedApp === 'spare' ? 'bg-amber-400 text-black' : 'bg-white/5 text-gray-300'
                    }`}>
                      {expandedApp === 'spare' ? 'Cerrar' : '+ Info'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedApp === 'spare' ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 text-amber-300">
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-white leading-snug">
                      Refacciones y obsoletos
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-300 leading-snug mt-1">
                      ¿Se rompió una pieza y el fabricante tarda semanas o ya no existe? Con tu archivo 3D o plano con medidas exactas, te la imprimimos en polímero técnico resistente.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1 text-[8.5px] sm:text-[9.5px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Con tus cotas</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">PETG · ABS/ASA</span>
                </div>
              </div>

              {expandedApp === 'spare' && (
                <div className="p-3 sm:p-4 bg-[#090D10] border-t border-white/10 text-[10.5px] sm:text-xs space-y-2 animate-fadeIn">
                  <p className="text-gray-300 leading-relaxed">
                    Replicamos en polímero industrial componentes mecánicos rotos: engranes, poleas sincronizadas, levas, manetas de ajuste, bujes y tapas de maquinaria descatalogada.
                  </p>
                  <div className="pt-1 flex items-center justify-between border-t border-white/5">
                    <span className="text-[9.5px] text-amber-300 font-mono">Desde 1 sola pieza</span>
                    <a
                      href="#cotizar-industria"
                      onClick={() => setFormData(prev => ({ ...prev, aplicacion: 'Refacciones y obsoletos', urgencia: 'Sustitución directa' }))}
                      className="px-2.5 py-1 rounded bg-amber-400 text-black font-bold text-[10px] sm:text-xs inline-flex items-center gap-1"
                    >
                      <span>Cotizar</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Cuadro 4: Lotes Cortos y Preseries */}
            <div
              className={`rounded-xl sm:rounded-2xl border transition-all duration-200 bg-[#12181C] shadow-md flex flex-col justify-between overflow-hidden ${
                expandedApp === 'batch'
                  ? 'border-purple-400 ring-1 ring-purple-400/40 bg-[#141C22]'
                  : 'border-white/10 hover:border-purple-400/50'
              }`}
            >
              <div
                onClick={() => setExpandedApp(expandedApp === 'batch' ? null : 'batch')}
                className="p-3 sm:p-5 cursor-pointer space-y-2 flex-1"
              >
                <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="text-purple-400 font-bold">BATCH-04</span>
                  <div className="flex items-center gap-1.5">
                    <span className="hidden sm:inline text-gray-300">Bajo demanda</span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 font-sans font-semibold ${
                      expandedApp === 'batch' ? 'bg-purple-400 text-black' : 'bg-white/5 text-gray-300'
                    }`}>
                      {expandedApp === 'batch' ? 'Cerrar' : '+ Info'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedApp === 'batch' ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0 text-purple-300">
                    <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-white leading-snug">
                      Lotes Cortos y Preseries
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-300 leading-snug mt-1">
                      Producción continua de varias piezas bajo demanda para arranques, reemplazos o preseries sin tener que pagar matrices ni herramentales costosos.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1 text-[8.5px] sm:text-[9.5px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Sin matriz</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20">1 a 500+ pzs</span>
                </div>
              </div>

              {expandedApp === 'batch' && (
                <div className="p-3 sm:p-4 bg-[#090D10] border-t border-white/10 text-[10.5px] sm:text-xs space-y-2 animate-fadeIn">
                  <p className="text-gray-300 leading-relaxed">
                    Producciones de 10 a 500 piezas sin la inversión de un molde permanente. Puedes iterar y modificar el diseño entre lote y lote sin costos de remaquinado.
                  </p>
                  <div className="pt-1 flex items-center justify-between border-t border-white/5">
                    <span className="text-[9.5px] text-purple-300 font-mono">Entrega en SLP</span>
                    <a
                      href="#cotizar-industria"
                      onClick={() => setFormData(prev => ({ ...prev, aplicacion: 'Lotes Cortos y Preseries', urgencia: 'Bajo demanda' }))}
                      className="px-2.5 py-1 rounded bg-purple-400 text-black font-bold text-[10px] sm:text-xs inline-flex items-center gap-1"
                    >
                      <span>Cotizar</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          4. SECCIÓN 02: MATERIALES Y CAPACIDAD TÉCNICA DINÁMICA
          ======================================================== */}
      <section id="materiales-taller" className="py-8 sm:py-14 border-b border-white/10 bg-[#0A0E11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="mb-5 sm:mb-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
              <span className="w-5 h-px bg-[#5BB8FF]" />
              02 / Materiales & Capacidad
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Polímeros de ingeniería calibrados en taller.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* Selector Dinámico de Polímeros */}
            <div className="lg:col-span-7 bg-[#11171B] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
              
              {/* Botones de selección de material */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'petg', label: 'PETG' },
                  { id: 'tpu', label: 'TPU 95A' },
                  { id: 'plaplus', label: 'PLA+ Pro' },
                  { id: 'abs', label: 'ABS / ASA' }
                ].map(mat => (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMaterialTab(mat.id)}
                    className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                      selectedMaterialTab === mat.id
                        ? 'bg-[#5BB8FF] text-[#0A0E11] border-[#5BB8FF] shadow-[0_0_12px_rgba(91,184,255,0.35)]'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {mat.label}
                  </button>
                ))}
              </div>

              {/* Ficha técnica del material activo */}
              {(() => {
                const cur = materialsData[selectedMaterialTab];
                return (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#5BB8FF] block">
                          {cur.tag}
                        </span>
                        <h4 className="text-lg font-bold text-white">{cur.name}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-white/5 font-mono text-xs text-gray-300 border border-white/10">
                        {cur.temp}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      {cur.summary}
                    </p>

                    {/* Matriz de Parámetros Mecánicos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px] pt-1">
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="block text-gray-500 text-[8px] uppercase">Tracción</span>
                        <strong className="text-white text-xs">{cur.tensile}</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="block text-gray-500 text-[8px] uppercase">Resistencia Impacto</span>
                        <strong className="text-[#8FB99B] text-xs">{cur.impact}</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 col-span-2 sm:col-span-1">
                        <span className="block text-gray-500 text-[8px] uppercase">Químicos</span>
                        <strong className="text-amber-300 text-[10px] leading-tight block">{cur.chemical}</strong>
                      </div>
                    </div>

                    {/* Aplicaciones Típicas en Planta */}
                    <div className="pt-2">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2">
                        Aplicaciones Recomendadas en Línea:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-300">
                        {cur.apps.map((app, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5BB8FF]" />
                            <span>{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Asidero de Capacidad y Especificaciones de Taller */}
            <div className="lg:col-span-5 bg-[#12181C] border border-white/15 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5BB8FF]" />
                  <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                    Capacidad y especificaciones
                  </h3>
                </div>
                <span className="font-mono text-[9px] text-[#5BB8FF]">PLANTA SLP</span>
              </div>

              <div className="divide-y divide-white/10 text-xs font-mono">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400 font-sans">Volumen monobloque</span>
                  <span className="font-bold text-white">Hasta 500 × 500 × 500 mm</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400 font-sans">Resolución de capa</span>
                  <span className="font-bold text-[#5BB8FF]">0.12 a 0.28 mm</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400 font-sans">Materiales en stock</span>
                  <span className="font-bold text-[#8FB99B]">PETG · TPU 95A · PLA+ Pro</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400 font-sans">Térmico / Intemperie</span>
                  <span className="font-bold text-amber-300">ABS / ASA (Cabina aislada)</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400 font-sans">Capacidad de lote</span>
                  <span className="font-bold text-white">1 a 500+ piezas</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-gray-400 font-sans">Acabado final</span>
                  <span className="font-bold text-gray-300">Retiro limpio de soportes</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#C4CCD0] leading-relaxed">
                <strong className="text-white block font-sans mb-1">Capacidad de Gran Formato:</strong>
                Fabricamos piezas de hasta 500 mm en una sola pieza sin uniones, o ensambles seccionados siguiendo las especificaciones de tu modelo 3D.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECCIÓN 03: CÓMO TRABAJAMOS (4 PASOS EN BLOQUE 2x2)
          ======================================================== */}
      <section className="py-7 sm:py-12 border-b border-white/10 bg-[#0E1317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="mb-4 sm:mb-7">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
              <span className="w-5 h-px bg-[#5BB8FF]" />
              03 / Cómo trabajamos
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
              De tu archivo a la pieza en 4 pasos claros.
            </h2>
          </div>

          {/* Bloque de 4 cuadros (2x2 en celular, 4 en línea en escritorio para evitar scroll) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            
            {/* Paso 1 */}
            <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-[#12181C] space-y-2 relative group hover:border-[#5BB8FF]/40 transition-colors">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#5BB8FF] font-black text-sm">01</span>
                <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] text-[#5BB8FF] font-semibold bg-[#5BB8FF]/10 px-2 py-0.5 rounded">
                  Paso 1 <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#5BB8FF] shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">Archivo / Medidas</h4>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Nos compartes tu archivo 3D (.step, .stl, .obj) o un croquis con las medidas exactas de tu pieza.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-[#12181C] space-y-2 relative group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-amber-400 font-black text-sm">02</span>
                <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">
                  Paso 2 <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">Cotización Rápida</h4>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Revisamos la geometría, elegimos el polímero ideal y te cotizamos de inmediato sin compromiso.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-[#12181C] space-y-2 relative group hover:border-emerald-400/40 transition-colors">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-400 font-black text-sm">03</span>
                <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] text-emerald-300 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded">
                  Paso 3 <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">Fabricación Técnica</h4>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Impresión 3D en polímero técnico con tolerancias controladas y retiro limpio de soportes.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-[#12181C] space-y-2 relative group hover:border-[#8FB99B]/40 transition-colors">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#8FB99B] font-black text-sm">04</span>
                <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] text-[#8FB99B] font-semibold bg-[#8FB99B]/10 px-2 py-0.5 rounded">
                  Paso 4 <Check className="w-3 h-3 inline" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8FB99B] shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">Entrega en Planta</h4>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Entrega personal acordada en San Luis Potosí o retiro directo en taller en 24 a 72 horas.
              </p>
            </div>

          </div>

          {/* Nota de Preparación */}
          <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl border border-[#5BB8FF]/30 bg-[#5BB8FF]/5 flex items-center gap-2.5 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#5BB8FF] shrink-0" />
            <span>
              <strong className="text-white">¿Qué necesitas para cotizar?</strong> Tu archivo digital en formato .step, .stl u .obj, o las medidas exactas de tu pieza. Nosotros nos encargamos de que la manufactura quede exacta.
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================
          6. SECCIÓN 04: SECTORES INDUSTRIALES
          ======================================================== */}
      <section className="py-8 sm:py-12 border-b border-white/10 bg-[#0E1317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-5 sm:mb-7">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <span className="w-5 h-px bg-[#5BB8FF]" />
                04 / Sectores
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
                Hecho para la zona industrial.
              </h2>
            </div>
            <p className="text-xs text-gray-400 max-w-sm">
              Suministro ágil bajo demanda para líneas productivas y talleres.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {[
              { name: 'Automotriz', icon: Car, color: 'text-[#5BB8FF]' },
              { name: 'Mantenimiento', icon: Wrench, color: 'text-amber-400' },
              { name: 'Empaques', icon: Package, color: 'text-purple-400' },
              { name: 'Médico', icon: Activity, color: 'text-rose-400' },
              { name: 'Alimentos', icon: Utensils, color: 'text-emerald-400' },
              { name: 'Logística', icon: Truck, color: 'text-cyan-400' }
            ].map((sector) => {
              const IconComp = sector.icon;
              return (
                <div
                  key={sector.name}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 bg-[#12181C] hover:border-[#5BB8FF]/40 transition-colors group"
                >
                  <IconComp className={`w-4 h-4 sm:w-5 sm:h-5 ${sector.color} shrink-0 group-hover:scale-110 transition-transform`} />
                  <span className="font-semibold text-xs sm:text-sm text-gray-200 group-hover:text-white transition-colors">
                    {sector.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECCIÓN 05: INFORMACIÓN CLAVE (GRID 2x2, TEXTO COMPLETO SIN PUNTOS SUSPENSIVOS)
          ======================================================== */}
      <section className="py-7 sm:py-12 border-b border-white/10 bg-[#0A0E11]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="mb-4 sm:mb-7">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
              <span className="w-5 h-px bg-[#5BB8FF]" />
              05 / Información Clave
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
              Lo que necesitas saber.
            </h2>
          </div>

          {/* Grid de 4 Cuadros (2x2 en celular y escritorio) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            
            {/* Cuadro 1: ¿Qué necesitas? */}
            <div
              onClick={() => setExpandedInfo(expandedInfo === 'archivo' ? null : 'archivo')}
              className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer bg-[#12181C] space-y-1.5 ${
                expandedInfo === 'archivo'
                  ? 'border-[#5BB8FF] bg-[#141C22]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[10.5px] sm:text-xs text-white font-bold">
                  <FileText className="w-3.5 h-3.5 text-[#5BB8FF] shrink-0" />
                  <span>¿Qué necesitas?</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  expandedInfo === 'archivo' ? 'bg-[#5BB8FF] text-black font-bold' : 'bg-white/5 text-gray-400'
                }`}>
                  {expandedInfo === 'archivo' ? 'Cerrar' : '+ Info'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-snug">
                Tu archivo 3D en formato .step o .stl, o un croquis con las cotas exactas. La cotización es inmediata.
              </p>
              {expandedInfo === 'archivo' && (
                <div className="pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-gray-300 space-y-1 animate-fadeIn">
                  <p>• Aceptamos archivos .step, .stp, .stl, .3mf y .obj exportados de cualquier software CAD.</p>
                  <p>• Si no tienes modelo 3D, envíanos fotos con regla y las medidas principales de tu pieza.</p>
                </div>
              )}
            </div>

            {/* Cuadro 2: Confidencialidad */}
            <div
              onClick={() => setExpandedInfo(expandedInfo === 'nda' ? null : 'nda')}
              className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer bg-[#12181C] space-y-1.5 ${
                expandedInfo === 'nda'
                  ? 'border-[#8FB99B] bg-[#141C22]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[10.5px] sm:text-xs text-white font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8FB99B] shrink-0" />
                  <span>Confidencialidad</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  expandedInfo === 'nda' ? 'bg-[#8FB99B] text-black font-bold' : 'bg-white/5 text-gray-400'
                }`}>
                  {expandedInfo === 'nda' ? 'Cerrar' : '+ Info'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-snug">
                Firmamos acuerdo de confidencialidad (NDA) antes de que envíes planos reservados de tu empresa.
              </p>
              {expandedInfo === 'nda' && (
                <div className="pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-gray-300 space-y-1 animate-fadeIn">
                  <p>• Tus diseños y planos no se comparten con terceros ni se difunden en redes sociales.</p>
                  <p>• Podemos firmar el convenio formal de tu departamento legal o proveer nuestro formato estándar.</p>
                </div>
              )}
            </div>

            {/* Cuadro 3: Sin Mínimos */}
            <div
              onClick={() => setExpandedInfo(expandedInfo === 'minimos' ? null : 'minimos')}
              className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer bg-[#12181C] space-y-1.5 ${
                expandedInfo === 'minimos'
                  ? 'border-purple-400 bg-[#141C22]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[10.5px] sm:text-xs text-white font-bold">
                  <Boxes className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Sin Mínimos</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  expandedInfo === 'minimos' ? 'bg-purple-400 text-black font-bold' : 'bg-white/5 text-gray-400'
                }`}>
                  {expandedInfo === 'minimos' ? 'Cerrar' : '+ Info'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-snug">
                Desde 1 sola pieza para sustitución urgente, hasta lotes de 1 a 500 piezas sin costo de moldes.
              </p>
              {expandedInfo === 'minimos' && (
                <div className="pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-gray-300 space-y-1 animate-fadeIn">
                  <p>• Cero gastos de apertura de matriz, lo que ahorra costos fijos para pruebas de ajuste.</p>
                  <p>• Posibilidad de corregir holguras de una pieza a la siguiente sin penalización económica.</p>
                </div>
              )}
            </div>

            {/* Cuadro 4: Entrega Rápida */}
            <div
              onClick={() => setExpandedInfo(expandedInfo === 'entrega' ? null : 'entrega')}
              className={`p-3 sm:p-4 rounded-xl border transition-all cursor-pointer bg-[#12181C] space-y-1.5 ${
                expandedInfo === 'entrega'
                  ? 'border-amber-400 bg-[#141C22]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[10.5px] sm:text-xs text-white font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Entrega Rápida</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  expandedInfo === 'entrega' ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-gray-400'
                }`}>
                  {expandedInfo === 'entrega' ? 'Cerrar' : '+ Info'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-snug">
                Prototipos listos desde 24 a 72 horas. Entrega directa y trato personalizado en San Luis Potosí.
              </p>
              {expandedInfo === 'entrega' && (
                <div className="pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-gray-300 space-y-1 animate-fadeIn">
                  <p>• Atención inmediata para emergencias de piezas rotas que tienen detenida una máquina.</p>
                  <p>• Coordinamos entrega directa en tu planta de la Zona Industrial de San Luis Potosí.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          8. SECCIÓN 06: TERMINAL DE COTIZACIÓN INDUSTRIAL B2B
          ======================================================== */}
      <section id="cotizar-industria" className="py-8 sm:py-14 bg-[#0E1317]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="p-4 sm:p-8 rounded-2xl border border-white/15 bg-[#12181C] shadow-2xl space-y-4 sm:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-[#5BB8FF] opacity-50 hidden sm:block">
              TERMINAL // COTIZACIÓN RÁPIDA
            </div>

            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <span className="w-5 h-px bg-[#5BB8FF]" />
                06 / Cotizador B2B
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                ¿Tienes una pieza detenida en planta?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                Completa los datos de tu pieza para revisar tiempos de impresión y enviarte cotización directa por WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmitWhatsApp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tu Nombre o Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Carlos Martínez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#5BB8FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Empresa / Planta *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Taller Mecánico / Planta SLP"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#5BB8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@empresa.com"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#5BB8FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="444 000 0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#5BB8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Aplicación</label>
                  <select
                    value={formData.aplicacion}
                    onChange={(e) => {
                      const val = e.target.value;
                      let urg = 'Desde 24 a 72 hrs';
                      if (val.includes('Utillaje')) urg = 'A medida';
                      else if (val.includes('Refacciones')) urg = 'Sustitución directa';
                      else if (val.includes('Lotes')) urg = 'Bajo demanda';
                      setFormData({ ...formData, aplicacion: val, urgencia: urg });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white focus:outline-none focus:border-[#5BB8FF]"
                  >
                    <option value="Prototipos funcionales (desde 24 a 72 hrs)">Prototipos funcionales (desde 24 a 72 hrs)</option>
                    <option value="Utillaje y herramentales">Utillaje y herramentales</option>
                    <option value="Refacciones y obsoletos">Refacciones y obsoletos</option>
                    <option value="Lotes Cortos y Preseries">Lotes Cortos y Preseries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Polímero Sugerido</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white focus:outline-none focus:border-[#5BB8FF]"
                  >
                    <option>PETG Técnico (Tenaz)</option>
                    <option>TPU 95A (Flexible / Antirrayón)</option>
                    <option>PLA+ Pro (Estudio dimensional rápido)</option>
                    <option>ABS / ASA (Piezas medianas / térmico)</option>
                    <option>Recomiéndenme uno según mi pieza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Cantidad de Piezas</label>
                  <input
                    type="text"
                    placeholder="Ej. 1, 10, 50"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#5BB8FF]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-black/30 shrink-0 shadow-sm"
                    style={{
                      background: getFilamentColor(formData.colorSeleccionado)?.css || '#111',
                      borderColor: getFilamentColor(formData.colorSeleccionado)?.border || '#444'
                    }}
                  />
                  <span className="text-gray-300 text-xs">
                    Color seleccionado: <strong className="text-white">{formData.colorSeleccionado}</strong>
                  </span>
                </div>
                <a
                  href="#consulta-colores-industria"
                  onClick={() => {
                    setShowColorsDrawer(true);
                    if (formData.material.includes('TPU')) setColorDrawerMaterial('tpu');
                    else if (formData.material.includes('PLA')) setColorDrawerMaterial('plaplus');
                    else if (formData.material.includes('ABS')) setColorDrawerMaterial('abs');
                    else setColorDrawerMaterial('petg');
                  }}
                  className="text-[#5BB8FF] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Ver catálogo de colores abajo ↓</span>
                </a>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Archivo CAD o Foto de Referencia</label>
                <div className="border border-dashed border-white/20 hover:border-[#5BB8FF] rounded-xl p-4 text-center cursor-pointer bg-[#0A0E11]/60 transition-colors">
                  <input
                    type="file"
                    id="archivo-industria-upgraded"
                    accept=".step,.stp,.stl,.3mf,.pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="archivo-industria-upgraded" className="cursor-pointer block space-y-1">
                    <UploadCloud className="w-6 h-6 text-[#5BB8FF] mx-auto" />
                    <span className="block font-semibold text-gray-200">
                      {formData.archivoNombre ? `Seleccionado: ${formData.archivoNombre}` : 'Seleccionar archivo (.step, .stp, .stl, .pdf o foto)'}
                    </span>
                    <span className="block text-[10px] text-gray-400">
                      También puedes arrastrarlo o adjuntarlo en el chat de WhatsApp al cotizar.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="nda-checkbox-b2b"
                  checked={formData.requiereNda}
                  onChange={(e) => setFormData({ ...formData, requiereNda: e.target.checked })}
                  className="rounded border-white/20 bg-[#0A0E11] text-[#5BB8FF] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="nda-checkbox-b2b" className="text-gray-300 text-xs cursor-pointer select-none">
                  Requiero firma de convenio de confidencialidad (NDA) antes de compartir planos reservados.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enviar Orden de Cotización a Taller por WhatsApp</span>
                </button>
              </div>
            </form>

            {formSubmitted && (
              <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  ¡Tu solicitud se abrió en WhatsApp con la orden formateada! Si no abrió, pulsa nuevamente el botón verde.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      
      {/* ========================================================
          7. PESTAÑA / DRAWER: CARTA TÉCNICA DE ACABADOS (UX MOBILE-FIRST)
          ======================================================== */}
      <section id="consulta-colores-industria" className="py-6 sm:py-10 bg-[#0A0E11] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-3 sm:px-6">
          <div className="rounded-2xl border border-white/15 bg-[#12181C] overflow-hidden shadow-2xl transition-all">
            
            {/* Header / Botón Pestaña Desplegable (Optimizado Mobile) */}
            <button
              type="button"
              onClick={() => setShowColorsDrawer(!showColorsDrawer)}
              className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-2.5 text-left bg-gradient-to-r from-white/[0.04] to-transparent hover:bg-white/[0.08] active:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#5BB8FF]/10 border border-[#5BB8FF]/30 flex items-center justify-center text-[#5BB8FF] shrink-0">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[9px] sm:text-[10px] text-[#5BB8FF] uppercase tracking-wider font-bold">
                      Carta Técnica
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      En stock
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-base font-bold text-white truncate">
                    Consulta colores dependiendo tu material
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mini preview del color seleccionado actual */}
                <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/10">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                    style={{
                      background: getFilamentColor(formData.colorSeleccionado)?.css || '#111',
                      borderColor: getFilamentColor(formData.colorSeleccionado)?.border || '#555'
                    }}
                  />
                  <span className="text-[10px] text-gray-300 font-mono truncate max-w-[80px] sm:max-w-[120px]">
                    {formData.colorSeleccionado}
                  </span>
                </div>

                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showColorsDrawer ? 'rotate-180 text-[#5BB8FF]' : ''}`} />
                </div>
              </div>
            </button>

            {/* Contenido desplegable */}
            {showColorsDrawer && (
              <div className="p-3.5 sm:p-6 border-t border-white/10 space-y-4 bg-[#0D1216]">
                
                {/* 1. Selector de Polímero: Segmented Bar táctil de 4 botones sin scroll */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                  {[
                    { id: 'petg', short: 'PETG', name: 'PETG', count: 9 },
                    { id: 'tpu', short: 'TPU', name: 'TPU 95A', count: 6 },
                    { id: 'plaplus', short: 'PLA+', name: 'PLA+ Pro', count: 7 },
                    { id: 'abs', short: 'ABS', name: 'ABS / ASA', count: 3 }
                  ].map(mat => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setColorDrawerMaterial(mat.id)}
                      className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        colorDrawerMaterial === mat.id
                          ? 'bg-[#5BB8FF] text-black font-extrabold shadow-md scale-[1.02]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 font-semibold'
                      }`}
                    >
                      <div className="text-[11px] sm:text-xs leading-none truncate">
                        <span className="sm:hidden">{mat.short}</span>
                        <span className="hidden sm:inline">{mat.name}</span>
                      </div>
                      <div className={`text-[8.5px] sm:text-[9.5px] font-mono leading-none mt-1 opacity-80 ${
                        colorDrawerMaterial === mat.id ? 'text-black' : 'text-gray-500'
                      }`}>
                        {mat.count} tonos
                      </div>
                    </button>
                  ))}
                </div>

                {/* Info rápida del material activo */}
                <div className="flex items-center justify-between text-[10.5px] sm:text-xs font-mono text-gray-400 px-1 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#5BB8FF] shrink-0" />
                    <span className="truncate">
                      Polímero: <strong className="text-white">{INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.materialName}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8FB99B] shrink-0">
                    {INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.tag}
                  </span>
                </div>

                {/* 2. Paleta de Swatches Circulares Táctiles (Mobile First) */}
                <div className="p-3 sm:p-4 rounded-xl bg-[#090D10] border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>Toca una muestra para seleccionarla:</span>
                    <span className="text-[#5BB8FF]">{INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.colors.length} tonos en stock</span>
                  </div>

                  {/* Swatches circulares estilo tienda */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 py-1">
                    {INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.colors.map((color) => {
                      const filament = getFilamentColor(color.name);
                      const isSelected = formData.colorSeleccionado === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, colorSeleccionado: color.name }));
                          }}
                          className={`group/c relative p-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'ring-2 ring-[#5BB8FF] ring-offset-2 ring-offset-[#090D10] scale-110 shadow-[0_0_12px_rgba(91,184,255,0.4)]'
                              : 'hover:scale-110 hover:ring-1 hover:ring-white/40'
                          }`}
                          title={`${color.name} (${color.finish})`}
                        >
                          <span
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-transform shadow-md"
                            style={{
                              background: filament?.css || '#333',
                              borderColor: filament?.border || '#555',
                              boxShadow: filament?.glow ? `0 0 10px ${filament.border}` : '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                          >
                            {isSelected && (
                              <Check className={`w-4 h-4 stroke-[3] ${filament?.isDark ? 'text-white' : 'text-black'}`} />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Ficha Táctil del Color Activo Seleccionado */}
                {(() => {
                  const activeColorObj = INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.colors.find(
                    c => c.name === formData.colorSeleccionado
                  ) || INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.colors[0];
                  
                  const activeFilament = getFilamentColor(activeColorObj?.name);
                  const isCurSelected = formData.colorSeleccionado === activeColorObj?.name;

                  return (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-[#5BB8FF]/30 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border shadow-sm shrink-0"
                            style={{
                              background: activeFilament?.css || '#111',
                              borderColor: activeFilament?.border || '#444',
                              boxShadow: activeFilament?.glow ? `0 0 8px ${activeFilament.border}` : undefined
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                                {activeColorObj?.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#5BB8FF]/15 text-[#5BB8FF] border border-[#5BB8FF]/30">
                                {activeColorObj?.finish}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-gray-300 mt-0.5 leading-snug">
                              {activeColorObj?.desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeColorObj) {
                              setFormData(prev => ({ ...prev, colorSeleccionado: activeColorObj.name }));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCurSelected
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#5BB8FF] text-black hover:bg-[#8AD2FF]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCurSelected ? 'Color seleccionado para tu orden' : 'Seleccionar este color'}</span>
                        </button>

                        <a
                          href="#cotizar-industria"
                          className="text-[11px] text-[#5BB8FF] hover:underline font-mono inline-flex items-center gap-1 shrink-0 font-bold"
                        >
                          <span>Subir al formulario ↑</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Pie informativo */}
                <div className="text-[10px] text-gray-400 font-mono flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <span>¿Color corporativo o RAL especial? Lo surtimos para tu lote.</span>
                  <span className="text-gray-500">Taller SLP</span>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. SECCIÓN: REGRESO A LA TIENDA PRINCIPAL
          ======================================================== */}
      <section className="py-12 border-t border-white/10 bg-[#0A0E11] text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5BB8FF]">
            Artesano Digital · Catálogo General
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            ¿Buscas artículos de regalo o decoración?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Regresa a la tienda principal para explorar lámparas modernas, figuras coleccionables y llaveros personalizados.
          </p>
          <div className="pt-2">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#0A0E11] font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda Principal</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-white/5 text-center font-mono text-[11px] text-gray-500 space-y-1">
        <div><strong>Artesano Digital · Manufactura Aditiva & Prototipado</strong> · San Luis Potosí, S.L.P.</div>
        <div className="text-[10px] text-gray-600">Prototipos funcionales · Utillaje & Jigs · Refacciones · Preseries B2B</div>
      </footer>

    </div>
  );
}
