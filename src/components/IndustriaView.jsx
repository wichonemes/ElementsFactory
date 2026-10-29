import React, { useState } from 'react';
import {
import ImageOptimized from './ImageOptimized';
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
  Palette,
  Share2,
  Copy,
  Mail,
  Building2,
  Cog,
  Send
} from 'lucide-react';
import { getFilamentColor } from '../utils/colorUtils';

export default function IndustriaView({
  settings,
  onGoHome,
  onOpenCalculator
}) {
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Estado de feedback al copiar enlace
  const [copiedLink, setCopiedLink] = useState(false);

  // URL canÃ³nica para compartir el portal industrial
  const sharePortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')}/?area=industria`
    : 'https://wichonemes.github.io/artesano/?area=industria';

  // Mensaje natural para compartir entre colegas (sin tono de venta agresiva)
  const sharePortalText = `Que una refacciÃ³n no te detenga: servicio de manufactura e impresiÃ³n 3D tÃ©cnica en SLP para piezas mecÃ¡nicas, utillaje y prototipos: ${sharePortalUrl}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(sharePortalText)}`, '_blank');
  };

  const handleCopyShareLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sharePortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Que una refacciÃ³n no te detenga // ImpresiÃ³n 3D TÃ©cnica SLP',
        text: 'Servicio de manufactura e impresiÃ³n 3D en SLP para refacciones mecÃ¡nicas, utillajes y piezas a medida.',
        url: sharePortalUrl
      }).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  const mailToB2B = `mailto:?subject=${encodeURIComponent('Contacto tÃ©cnico: ImpresiÃ³n 3D y refacciones mecÃ¡nicas en SLP')}&body=${encodeURIComponent(
    `Hola:\n\nTe paso el dato de este taller en San Luis PotosÃ­ de manufactura aditiva y servicio de impresiÃ³n 3D para refacciones mecÃ¡nicas, piezas a medida y utillaje sin moldes ni mÃ­nimos:\n\n${sharePortalUrl}\n\nSaludos.`
  )}`;

  // Estado de la PestaÃ±a Desplegable de Colores por Material
  const [showColorsDrawer, setShowColorsDrawer] = useState(false);
  const [colorDrawerMaterial, setColorDrawerMaterial] = useState('petg');

  // Estado para desplegar informaciÃ³n tÃ©cnica en las 4 Aplicaciones
  const [expandedApp, setExpandedApp] = useState(null);

  // Estado para desplegar informaciÃ³n completa en InformaciÃ³n Clave
  const [expandedInfo, setExpandedInfo] = useState(null);

  // CatÃ¡logo Ampliado de Colores TÃ©cnicos por PolÃ­mero
  const INDUSTRIAL_COLORS_BY_MATERIAL = {
    petg: {
      materialName: 'PETG TÃ©cnico',
      tag: 'MecÃ¡nico & Refacciones',
      colors: [
        { name: 'Negro Ã“nix Mate', desc: 'Acabado antirreflejo para carcasas y componentes mecÃ¡nicos', finish: 'Satinado TÃ©cnico' },
        { name: 'Negro CarbÃ³n', desc: 'Negro profundo de alta resistencia quÃ­mica y al desgaste', finish: 'Brillante MecÃ¡nico' },
        { name: 'Blanco Puro', desc: 'Ductos de aire e interiores limpios de maquinaria', finish: 'SÃ³lido' },
        { name: 'Blanco Marfil', desc: 'Tono neutro cÃ¡lido para inspecciÃ³n visual de ensambles', finish: 'SÃ³lido TÃ©cnico' },
        { name: 'Gris Plomo TitÃ¡n', desc: 'Tono maquinaria neutro que disimula polvo y grasa', finish: 'Industrial' },
        { name: 'Gris Perla', desc: 'Gris claro institucional para gabinetes y carcasas', finish: 'Neutro' },
        { name: 'Plata MetÃ¡lico', desc: 'SÃ­mil de aluminio pulido para maquetas ejecutivas', finish: 'Seda MetÃ¡lica' },
        { name: 'Azul Marino Medianoche', desc: 'Gabinetes, cajas y soportes corporativos', finish: 'SÃ³lido Corporativo' },
        { name: 'Azul Cobalto', desc: 'IdentificaciÃ³n de lÃ­neas neumÃ¡ticas y piezas activas', finish: 'SeÃ±alizaciÃ³n' },
        { name: 'Azul Cielo', desc: 'Galgas de verificaciÃ³n visual y codificaciÃ³n rÃ¡pida', finish: 'Alta Visibilidad' },
        { name: 'Rojo CarmesÃ­', desc: 'Guardas de seguridad, topes y paros de emergencia', finish: 'Seguridad' },
        { name: 'Naranja CÃ¡lido', desc: 'Galgas de advertencia y poka-yoke visual en celda', finish: 'Advertencia' },
        { name: 'Mostaza Colonial', desc: 'Zonas de precauciÃ³n y seÃ±alÃ©tica industrial de planta', finish: 'PrecauciÃ³n' },
        { name: 'Verde Olivo TÃ¡ctico', desc: 'Tono mate sobrio sin reflejos plÃ¡sticos', finish: 'Mate TÃ¡ctico' },
        { name: 'Verde Esmeralda', desc: 'IdentificaciÃ³n de piezas aptas o verificadas', finish: 'AprobaciÃ³n' },
        { name: 'TranslÃºcido Cristal', desc: 'Visor de flujo de lÃ­quidos o difusor de luz LED', finish: 'TranslÃºcido' }
      ]
    },
    tpu: {
      materialName: 'TPU 95A ElastÃ³mero',
      tag: 'Flexible & AntirrayÃ³n',
      colors: [
        { name: 'Negro Ã“nix Mate', desc: 'Aspecto de caucho vulcanizado para amortiguadores', finish: 'Goma Flexible' },
        { name: 'Negro CarbÃ³n', desc: 'Protecciones de impacto para esquinas y fixtures', finish: 'Goma Densa' },
        { name: 'Blanco Puro', desc: 'Topes y ventosas limpias que no manchan piezas de vista', finish: 'Goma Limpia' },
        { name: 'Gris Plomo TitÃ¡n', desc: 'Apoyos y bases elÃ¡sticas para estaciones de ensamble', finish: 'Amortiguador' },
        { name: 'Rojo CarmesÃ­', desc: 'Topes de final de carrera y parachoques visuales', finish: 'Impacto Visual' },
        { name: 'Naranja CÃ¡lido', desc: 'Protecciones de arista y juntas visibles para operario', finish: 'Flexible SeÃ±al' },
        { name: 'Mostaza Colonial', desc: 'Galgas flexibles para comprobaciÃ³n de tolerancias', finish: 'PrecauciÃ³n' },
        { name: 'Azul Cobalto', desc: 'Mordazas suaves para robots y nidos de ensamble', finish: 'SujeciÃ³n Suave' },
        { name: 'Verde Olivo', desc: 'Sellos y fuelles de protecciÃ³n en maquinaria pesada', finish: 'Goma Industrial' },
        { name: 'TranslÃºcido Cristal', desc: 'Sellos, fuelles y empaques semi-transparentes', finish: 'Goma TranslÃºcida' }
      ]
    },
    plaplus: {
      materialName: 'PLA+ Pro Alta Rigidez',
      tag: 'Prototipos & Pruebas DFM',
      colors: [
        { name: 'Negro Ã“nix Mate', desc: 'MÃ¡xima definiciÃ³n geomÃ©trica y comprobaciÃ³n de holguras', finish: 'Ultra PrecisiÃ³n' },
        { name: 'Negro CarbÃ³n', desc: 'Alta rigidez para ensambles mecÃ¡nicos de prueba', finish: 'SÃ³lido' },
        { name: 'Blanco Puro', desc: 'Excelente contraste para revisiÃ³n de cotas y maquetas', finish: 'Mate Puro' },
        { name: 'Blanco Marfil', desc: 'VerificaciÃ³n de ensambles con tornillerÃ­a y roscas', finish: 'Satinado' },
        { name: 'Gris Plomo TitÃ¡n', desc: 'SÃ­mil visual de pieza maquinada en bloque de aluminio', finish: 'Neutro' },
        { name: 'Gris Perla', desc: 'Plantillas de inspecciÃ³n visual y maquetas de volumen', finish: 'TÃ©cnico' },
        { name: 'Plata MetÃ¡lico', desc: 'Reflejo metÃ¡lico fino para presentaciones ejecutivas', finish: 'Seda MetÃ¡lica' },
        { name: 'Terracota', desc: 'Arcilla cÃ¡lida con alta visibilidad de detalle y curvatura', finish: 'Satinado' },
        { name: 'Rojo CarmesÃ­', desc: 'IdentificaciÃ³n de puntos crÃ­ticos de interferencia', finish: 'Contraste Alto' },
        { name: 'Naranja CÃ¡lido', desc: 'ValidaciÃ³n de ergonomÃ­a y agarre manual', finish: 'ErgonÃ³mico' },
        { name: 'Mostaza Colonial', desc: 'ComprobaciÃ³n de perfiles y soportes de sensor', finish: 'InspecciÃ³n' },
        { name: 'Verde Olivo TÃ¡ctico', desc: 'Tono mate insignia del taller para prototipos maestros', finish: 'Mate TÃ¡ctico' },
        { name: 'Verde Menta', desc: 'Estudios de usabilidad y piezas de concepto estÃ©tico', finish: 'Pastel TÃ©cnico' },
        { name: 'Azul Marino Medianoche', desc: 'Maquetas corporativas y ensambles estructurales', finish: 'SÃ³lido' },
        { name: 'Azul Cobalto', desc: 'Piezas maestras de calibraciÃ³n dimensional', finish: 'Vibrante' },
        { name: 'Lavanda / Violeta', desc: 'DiferenciaciÃ³n de versiones y prototipos de prueba', finish: 'Diferencial' }
      ]
    },
    abs: {
      materialName: 'ABS / ASA Industrial',
      tag: 'Resistencia TÃ©rmica & UV',
      colors: [
        { name: 'Negro Ã“nix Mate', desc: 'ProtecciÃ³n UV exterior y resistencia a temperatura continua', finish: 'TÃ©rmico Exterior' },
        { name: 'Negro CarbÃ³n', desc: 'Chasis robustos y carcasas de protecciÃ³n elÃ©ctrica', finish: 'Industrial' },
        { name: 'Blanco Puro', desc: 'ReflexiÃ³n solar y baja absorciÃ³n de calor en intemperie', finish: 'Intemperie Solar' },
        { name: 'Gris Plomo TitÃ¡n', desc: 'Reemplazos tÃ©cnicos y cubiertas de bombas o motores', finish: 'Industrial' },
        { name: 'Gris Perla', desc: 'Gabinetes de control para lÃ­neas de automatizaciÃ³n', finish: 'Control' },
        { name: 'Rojo CarmesÃ­', desc: 'Guardas tÃ©rmicas y tapas de zonas calientes en planta', finish: 'Alerta TÃ©rmica' },
        { name: 'Azul Marino Medianoche', desc: 'Cajas de distribuciÃ³n y tableros bajo intemperie', finish: 'Exterior' },
        { name: 'Naranja CÃ¡lido', desc: 'Carcasas visibles en ambientes con riesgo de impacto', finish: 'SeÃ±alizaciÃ³n' }
      ]
    }
  };

  // Material Interactivo Seleccionado (Desplegable y ocultable al click)
  const [selectedMaterialTab, setSelectedMaterialTab] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    correo: '',
    whatsapp: '',
    aplicacion: 'Prototipos funcionales (desde 24 a 72 hrs)',
    material: 'PETG TÃ©cnico (Tenaz)',
    colorSeleccionado: 'Negro Ã“nix Mate (EstÃ¡ndar)',
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
    
    const text = `ðŸ­ *ORDEN TÃ‰CNICA DE COTIZACIÃ“N INDUSTRIAL Â· ARTESANO DIGITAL*
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ‘¤ *Contacto:* ${formData.nombre || 'No especificado'}
ðŸ¢ *Empresa / Planta:* ${formData.empresa || 'Particular / Taller'}
ðŸ“§ *Correo Corporativo:* ${formData.correo || 'Pendiente'}
ðŸ“± *Tel/WhatsApp:* ${formData.whatsapp || 'Mismo nÃºmero'}

âš™ï¸ *PARÃMETROS DE MANUFACTURA:*
â€¢ *AplicaciÃ³n:* ${formData.aplicacion}
â€¢ *PolÃ­mero sugerido:* ${formData.material}
â€¢ *Color / Acabado:* ${formData.colorSeleccionado || 'Negro Ã“nix Mate (EstÃ¡ndar)'}
â€¢ *Cantidad:* ${formData.cantidad} pieza(s)
â€¢ *Tiempo de entrega:* ${formData.urgencia}
â€¢ *Archivo 3D:* ${formData.archivoNombre ? `Archivo: ${formData.archivoNombre}` : 'Archivo digital por WhatsApp'}
â€¢ *Convenio NDA:* ${formData.requiereNda ? 'SÃ (Requiero firma previa de confidencialidad)' : 'No necesario'}

ðŸ“ *Requerimientos funcionales / Notas:*
${formData.detalles || 'Sin requerimientos especiales de temperatura o tracciÃ³n.'}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“ *San Luis PotosÃ­, S.L.P. Â· Entrega local en planta*`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setFormSubmitted(true);
  };

  // Diccionario de Materiales TÃ©cnicos Calibrados a la Maquinaria del Taller
  const materialsData = {
    petg: {
      id: 'petg',
      name: 'PETG TÃ©cnico Industrial',
      tag: 'USO MECÃNICO GENERAL Â· ALTA TENACIDAD',
      temp: '75Â°C - 80Â°C',
      impact: 'Alto (Tenaz sin fractura frÃ¡gil)',
      chemical: 'Resistente a lubricantes, agua y alcoholes',
      tensile: '50 MPa',
      density: '1.27 g/cmÂ³',
      summary: 'El caballo de batalla del taller. Excelente uniÃ³n interlaminar, alta durabilidad y absorciÃ³n de impacto sin romperse. Producido con mÃ¡xima precisiÃ³n dimensional para refacciones y piezas mecÃ¡nicas.',
      apps: ['Guardas de seguridad de maquinaria', 'Ductos de aire y ventilaciÃ³n', 'Cajas de componentes electrÃ³nicos', 'Soportes de montaje y fijaciÃ³n']
    },
    tpu: {
      id: 'tpu',
      name: 'TPU 95A Poliuretano ElastÃ³mero',
      tag: 'AMORTIGUACIÃ“N & IMPACTO Â· FLEXIBLE',
      temp: '85Â°C',
      impact: 'Ultra Alto (ElastomÃ©rico indestructible)',
      chemical: 'Excelente contra aceites minerales y grasas',
      tensile: '35 MPa (ElongaciÃ³n >450%)',
      density: '1.21 g/cmÂ³',
      summary: 'Caucho tÃ©cnico con memoria de forma y altÃ­sima resistencia al desgarro. No marca ni raya superficies pulidas o pintadas en lÃ­nea de ensamble.',
      apps: ['Topes de final de carrera', 'Nidos para piezas delicadas / sin rayones', 'Sellos, empaques y juntas', 'Mordazas flexibles de sujeciÃ³n']
    },
    plaplus: {
      id: 'plaplus',
      name: 'PLA+ Pro Alta Rigidez',
      tag: 'VALIDACIÃ“N DIMENSIONAL RÃPIDA Â· ALTA PRECISIÃ“N',
      temp: '60Â°C',
      impact: 'Medio-Alto (RÃ­gido)',
      chemical: 'Estable en ambientes secos de oficina o ensamble',
      tensile: '55 MPa (MÃ³dulo de alta rigidez)',
      density: '1.24 g/cmÂ³',
      summary: 'MÃ¡xima precisiÃ³n geomÃ©trica y definiciÃ³n de aristas para comprobaciones de holgura, pruebas de ensamble con tornillos y prototipos entregados en 24 a 72 horas.',
      apps: ['Maquetas de ensamble rÃ¡pido', 'Galgas de comprobaciÃ³n visual', 'Modelos ergonÃ³micos de prueba', 'Piezas de ajuste pre-mecanizado']
    },
    abs: {
      id: 'abs',
      name: 'ABS / ASA Industrial',
      tag: 'CABINA CERRADA AISLADA Â· TÃ‰RMICO',
      temp: '90Â°C - 95Â°C',
      impact: 'Alto con ductilidad tÃ©rmica',
      chemical: 'Resistencia a intemperie UV (ASA) y calor',
      tensile: '42 MPa',
      density: '1.06 g/cmÂ³',
      summary: 'Procesado en cabina cerrada para retener temperatura y evitar corrientes de aire. Recomendado para piezas de tamaÃ±o pequeÃ±o a mediano con requerimientos de calor o intemperie.',
      apps: ['Gabinetes y carcasas para intemperie', 'Refacciones bajo temperatura', 'Plantillas de verificaciÃ³n tÃ©rmica', 'Piezas sometidas a calor moderado']
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E11] text-[#E9E6DD] font-sans selection:bg-[#5BB8FF] selection:text-[#0A0E11]">
      
      {/* ========================================================
          1. BANNER HERO INDUSTRIAL CON PLANO VECTORIAL (CONDENSADO MOBILE)
          ======================================================== */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#10171D] via-[#0A0E11] to-[#0A0E11] pt-1.5 sm:pt-8 pb-2 sm:pb-10">
        {/* Rejilla milimÃ©trica sutil de fondo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 sm:gap-6 lg:gap-12 items-center">
            
            {/* Texto Principal */}
            <div className="lg:col-span-7 space-y-2 sm:space-y-4">
              <h1 className="text-lg sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                Que una refacciÃ³n no detenga <span className="text-[#5BB8FF] drop-shadow-[0_0_20px_rgba(91,184,255,0.4)]">tu lÃ­nea.</span>
              </h1>

              <p className="text-[10.5px] sm:text-base text-[#C4CCD0] max-w-xl leading-snug sm:leading-relaxed">
                Taller local de manufactura bajo demanda para empresas de SLP. Prototipado funcional rÃ¡pido, utillaje de ensamble, refacciones descatalogadas y lotes cortos en polÃ­meros tÃ©cnicos de grado ingenierÃ­a.
              </p>

              {/* BotÃ³n en Desktop (en mÃ³vil se integra directamente bajo el plano para eliminar scroll) */}
              <div className="hidden lg:block pt-1">
                <a
                  href="#cotizar-industria"
                  className="px-6 py-3 rounded-2xl bg-[#5BB8FF] hover:bg-[#8AD2FF] text-[#0A0E11] font-extrabold text-xs sm:text-sm tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(91,184,255,0.3)] active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Cotizar Pieza Industrial</span>
                </a>
              </div>
            </div>

            {/* Plano Vectorial TÃ©cnico Integrado (Compacto en mÃ³vil) */}
            <div className="lg:col-span-5 relative mt-0.5 sm:mt-0 flex flex-col justify-center">
              
              {/* Anotaciones TÃ©cnicas Superiores tipo HUD */}
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-gray-400 pb-1">
                <span className="flex items-center gap-1.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5BB8FF] animate-pulse" />
                  <span>DWG-REF // SLP-IND-2026</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[#8FB99B] font-bold text-[8.5px] sm:text-[9.5px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>NDA DISPONIBLE</span>
                  </span>
                  <span className="text-[#5BB8FF] text-[8.5px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#5BB8FF]/10 border border-[#5BB8FF]/20">
                    Â±0.15 mm
                  </span>
                </div>
              </div>

              {/* BotÃ³n Integrado en MÃ³vil (UbicaciÃ³n exacta seÃ±alada por el usuario para eliminar scroll) */}
              <div className="block lg:hidden pt-1 pb-1.5">
                <a
                  href="#cotizar-industria"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#5BB8FF] hover:bg-[#8AD2FF] text-[#0A0E11] font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(91,184,255,0.3)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Cotizar Pieza Industrial</span>
                </a>
              </div>

              {/* Dibujo Vectorial CAD Integrado directamente */}
              <div className="relative py-0.5 flex items-center justify-center">
                <svg viewBox="20 68 340 165" className="w-full h-auto max-h-28 sm:max-h-56 filter drop-shadow-[0_0_20px_rgba(91,184,255,0.18)]">
                  <defs>
                    <pattern id="grid-blueprint" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M20 0H0V20" fill="none" stroke="#FFFFFF" strokeOpacity="0.04" strokeWidth="1" />
                    </pattern>
                    <marker id="arrow-cad" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                      <path d="M0 0 L6 3 L0 6 Z" fill="#5BB8FF" />
                    </marker>
                  </defs>
                  <rect width="400" height="240" fill="url(#grid-blueprint)" />

                  {/* GeometrÃ­a funcional en corte */}
                  <path
                    d="M60 80 H150 V130 L220 170 H340 V200 H60 Z"
                    fill="#10171D"
                    fillOpacity="0.85"
                    stroke="#5BB8FF"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M150 130 L220 170" stroke="#8AD2FF" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Nervadura de refuerzo */}
                  <line x1="150" y1="80" x2="150" y2="130" stroke="#ffffff25" strokeWidth="1" />
                  <line x1="220" y1="170" x2="220" y2="200" stroke="#ffffff25" strokeWidth="1" />

                  {/* Barrenos avellanados para tornillerÃ­a M6 */}
                  <circle cx="100" cy="110" r="7" fill="#0A0E11" stroke="#E9E6DD" strokeWidth="1.5" />
                  <circle cx="100" cy="180" r="8" fill="#0A0E11" stroke="#E9E6DD" strokeWidth="1.5" />
                  <circle cx="270" cy="185" r="8" fill="#0A0E11" stroke="#E9E6DD" strokeWidth="1.5" />
                  <circle cx="315" cy="185" r="6" fill="#0A0E11" stroke="#E9E6DD" strokeWidth="1.5" />

                  {/* LÃ­neas de cota */}
                  <g stroke="#5BB8FF" strokeWidth="1" opacity="0.85">
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

              {/* Indicadores de Taller estilizados */}
              <div className="flex items-center justify-between text-center font-mono text-[9px] sm:text-[10px] text-gray-400 pt-1 border-t border-white/10">
                <div>
                  <span className="block text-[7.5px] uppercase text-gray-500">Materiales</span>
                  <strong className="text-white">PETG / ABS / TPU</strong>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div>
                  <span className="block text-[7.5px] uppercase text-gray-500">Tolerancia</span>
                  <strong className="text-[#8FB99B]">Â±0.15 mm</strong>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div>
                  <span className="block text-[7.5px] uppercase text-gray-500">Capacidad</span>
                  <strong className="text-[#5BB8FF]">1 a 500+ pzs</strong>
                </div>
              </div>



            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECCIÃ“N 01: 4 SOLUCIONES (2X2 EN MÃ“VIL, 4 EN FILA EN PC)
          ======================================================== */}
      <section id="soluciones-industriales" className="py-7 sm:py-14 border-b border-white/10 bg-[#0E1317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 sm:mb-8">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <Cog className="w-4 h-4 text-[#5BB8FF] animate-[spin_10s_linear_infinite] shrink-0" />
                <span className="w-5 h-px bg-[#5BB8FF]" />
                <span>01 / Aplicaciones Industriales</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
                Cuatro problemas de planta. Una respuesta local.
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden md:block max-w-sm text-right">
              Haz clic en cualquier aplicaciÃ³n para desplegar sus parÃ¡metros de tolerancia, materiales y cotizaciÃ³n directa.
            </p>
          </div>

          {/* Diccionario de Aplicaciones con CÃ³digos de Color Distintivos */}
          {(() => {
            const parseCardBg = (cardVal, fallbackUrl) => {
              if (!cardVal) return { url: fallbackUrl, enabled: false };
              if (typeof cardVal === 'string') return { url: cardVal, enabled: false };
              return {
                url: cardVal.url || fallbackUrl,
                enabled: Boolean(cardVal.enabled)
              };
            };

            const protoBg = parseCardBg(settings?.categoryBackgroundPhotos?.industria?.proto, './uploads/catalog-v2-ind1-context-oficial.webp');
            const jigBg = parseCardBg(settings?.categoryBackgroundPhotos?.industria?.jig, './uploads/catalog-v2-ind2-context-oficial.webp');
            const spareBg = parseCardBg(settings?.categoryBackgroundPhotos?.industria?.spare, './uploads/industria_portada_oficial_ingenieria.webp');
            const batchBg = parseCardBg(settings?.categoryBackgroundPhotos?.industria?.batch, './uploads/catalog-v2-ind1-detail-oficial.webp');

            const applicationsData = [
              {
                id: 'proto',
                code: 'PROTO-01',
                title: 'Prototipos funcionales',
                icon: Layers,
                accentColor: '#5BB8FF',
                borderClass: 'border-[#5BB8FF]',
                ringClass: 'ring-[#5BB8FF]/40',
                glowBorderClass: 'border-[#5BB8FF] ring-2 ring-[#5BB8FF]/40 shadow-[0_0_20px_rgba(91,184,255,0.25)]',
                underlineClass: 'bg-[#5BB8FF]',
                neonPillClass: 'bg-[#5BB8FF] text-[#0A0E11]',
                badgePillClass: 'bg-[#5BB8FF]/20 text-[#5BB8FF] border-[#5BB8FF]/40',
                bgActive: 'bg-[#5BB8FF]/10',
                textAccent: 'text-[#5BB8FF]',
                btnBg: 'bg-[#5BB8FF]',
                tag: 'VALIDACIÃ“N RÃPIDA Â· DESDE 24 A 72 HRS',
                badge: 'Formatos .step / .stl',
                bgImage: protoBg.url,
                showPhoto: protoBg.enabled,
                shortDesc: 'ValidaciÃ³n rÃ¡pida de cotas, holguras y ensamble desde archivo 3D.',
                desc: 'Prueba ajustes, interferencias de ensamble y holguras imprimiendo directamente tu archivo 3D antes de mandar a fabricar en serie o invertir en moldes.',
                specs: [
                  { label: 'Tolerancia', val: 'Â±0.15 mm en cotas crÃ­ticas' },
                  { label: 'Materiales', val: 'PETG TÃ©cnico y PLA+ Pro' },
                  { label: 'Entrega', val: 'Desde 24 a 72 horas' },
                  { label: 'Formatos CAD', val: 'STEP, STL, IGES, SLDPRT' }
                ],
                quoteApp: 'Prototipos funcionales (desde 24 a 72 hrs)',
                urgencia: 'Desde 24 a 72 hrs'
              },
              {
                id: 'jig',
                code: 'JIG-02',
                title: 'Utillaje y herramentales',
                icon: Wrench,
                accentColor: '#8FB99B',
                borderClass: 'border-[#8FB99B]',
                ringClass: 'ring-[#8FB99B]/40',
                glowBorderClass: 'border-[#8FB99B] ring-2 ring-[#8FB99B]/40 shadow-[0_0_20px_rgba(143,185,155,0.25)]',
                underlineClass: 'bg-[#8FB99B]',
                neonPillClass: 'bg-[#8FB99B] text-[#0A0E11]',
                badgePillClass: 'bg-[#8FB99B]/20 text-[#8FB99B] border-[#8FB99B]/40',
                bgActive: 'bg-[#8FB99B]/10',
                textAccent: 'text-[#8FB99B]',
                btnBg: 'bg-[#8FB99B]',
                tag: 'LÃNEA DE PRODUCCIÃ“N & ENSAMBLE',
                badge: 'Ajuste fiel a cota',
                bgImage: jigBg.url,
                showPhoto: jigBg.enabled,
                shortDesc: 'Galgas de control, nidos Poka-Yoke y mordazas que no rayan piezas.',
                desc: 'Fabricamos con las medidas exactas de tu archivo nidos de apoyo, plantillas para operarios y mordazas protectoras que no rayan piezas terminadas.',
                specs: [
                  { label: 'AplicaciÃ³n', val: 'Poka-Yoke, guÃ­as y mordazas' },
                  { label: 'Materiales', val: 'TPU 95A antirrayÃ³n y PETG' },
                  { label: 'FabricaciÃ³n', val: 'A partir de tu archivo 3D' },
                  { label: 'ProtecciÃ³n', val: 'Cero fricciÃ³n sobre piezas pulidas' }
                ],
                quoteApp: 'Utillaje y herramentales',
                urgencia: 'A medida'
              },
              {
                id: 'spare',
                code: 'SPARE-03',
                title: 'Refacciones y obsoletos',
                icon: RotateCcw,
                accentColor: '#FBBF24',
                borderClass: 'border-amber-400',
                ringClass: 'ring-amber-400/40',
                glowBorderClass: 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
                underlineClass: 'bg-amber-400',
                neonPillClass: 'bg-amber-400 text-[#0A0E11]',
                badgePillClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
                bgActive: 'bg-amber-400/10',
                textAccent: 'text-amber-400',
                btnBg: 'bg-amber-400',
                tag: 'SUSTITUCIÃ“N DIRECTA SIN MOLDES',
                badge: 'Desde 1 sola pieza',
                bgImage: spareBg.url,
                showPhoto: spareBg.enabled,
                shortDesc: 'SustituciÃ³n de bujes, poleas y piezas descontinuadas desde 1 pieza.',
                desc: 'Â¿Se rompiÃ³ una pieza y el fabricante tarda semanas o ya no existe? Con tu archivo 3D (.stl, .step), te la imprimimos en polÃ­mero tÃ©cnico resistente.',
                specs: [
                  { label: 'Piezas', val: 'Engranes, poleas, levas y tapas' },
                  { label: 'Materiales', val: 'PETG industrial y ABS / ASA' },
                  { label: 'Disponibilidad', val: 'Desde 1 sola pieza sin mÃ­nimos' },
                  { label: 'Resistencia', val: 'Cargas mecÃ¡nicas e impacto continuo' }
                ],
                quoteApp: 'Refacciones y obsoletos',
                urgencia: 'SustituciÃ³n directa'
              },
              {
                id: 'batch',
                code: 'BATCH-04',
                title: 'Lotes Cortos y Preseries',
                icon: Boxes,
                accentColor: '#C084FC',
                borderClass: 'border-purple-400',
                ringClass: 'ring-purple-400/40',
                glowBorderClass: 'border-purple-400 ring-2 ring-purple-400/40 shadow-[0_0_20px_rgba(192,132,252,0.25)]',
                underlineClass: 'bg-purple-400',
                neonPillClass: 'bg-purple-400 text-[#0A0E11]',
                badgePillClass: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
                bgActive: 'bg-purple-400/10',
                textAccent: 'text-purple-400',
                btnBg: 'bg-purple-400',
                tag: 'VOLUMEN FLEXIBLE BAJO DEMANDA',
                badge: 'Escalable 10 a 500+ pzs',
                bgImage: batchBg.url,
                showPhoto: batchBg.enabled,
                shortDesc: 'ProducciÃ³n continua de 10 a 500 piezas sin costo de apertura de molde.',
                desc: 'ProducciÃ³n continua de varias piezas bajo demanda para arranques, reemplazos o preseries sin tener que pagar matrices ni herramentales costosos.',
                specs: [
                  { label: 'Tirajes', val: 'De 10 a 500 piezas escalables' },
                  { label: 'Ventaja', val: 'Cero costo de apertura de molde' },
                  { label: 'Entrega', val: 'Entrega local programada en SLP' },
                  { label: 'Repetibilidad', val: 'ImpresiÃ³n en paralelo en granja' }
                ],
                quoteApp: 'Lotes Cortos y Preseries',
                urgencia: 'Bajo demanda'
              }
            ];

            const curApp = applicationsData.find(a => a.id === expandedApp);

            return (
              <div className="space-y-4">
                {/* CuadrÃ­cula Adaptativa: 2x2 en Celular, 4 Columnas en PC con foto desenfocada de referencia */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                  {applicationsData.map(app => {
                    const isSelected = expandedApp === app.id;
                    const IconComp = app.icon;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setExpandedApp(isSelected ? null : app.id)}
                        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 p-3 sm:p-5 cursor-pointer select-none flex flex-col justify-between hover:-translate-y-0.5 min-h-[170px] sm:min-h-[195px] ${
                          isSelected
                            ? `${app.glowBorderClass} bg-[#060A0D]`
                            : 'border-white/10 bg-[#0B0F13] hover:border-white/25 active:scale-[0.98] shadow-md'
                        }`}
                      >
                        {/* Foto desenfocada de fondo con opacidad visible (individualmente activable o desactivable) */}
                        {app.showPhoto && (
                          <>
                            <ImageOptimized loading="lazy"
                              src={app.bgImage}
                              alt=""
                              aria-hidden="true"
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 filter blur-[0.6px] pointer-events-none select-none scale-105 group-hover:scale-110 ${
                                isSelected ? 'opacity-65' : 'opacity-45 group-hover:opacity-60'
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#060A0D] via-[#060A0D]/70 to-[#060A0D]/25 pointer-events-none" />
                          </>
                        )}

                        {/* Fila superior: CÃ³digo con lÃ­nea decorativa estilo referencia y Estado */}
                        <div className="relative z-10 flex items-start justify-between w-full">
                          <div>
                            <span className="font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-white drop-shadow-sm">
                              {app.code}
                            </span>
                            {/* LÃ­nea decorativa estilo referencia */}
                            <div className={`w-7 h-0.5 mt-1 rounded-full ${app.underlineClass}`} />
                          </div>

                          <span
                            className={`text-[8.5px] sm:text-[9.5px] font-heading font-black px-2 sm:px-2.5 py-0.5 rounded-full transition-all tracking-wider uppercase flex items-center gap-1 ${
                              isSelected
                                ? `${app.neonPillClass} shadow-md`
                                : 'text-stone-300 bg-black/60 border border-white/15'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                <span>Activa</span>
                                <ChevronDown className="w-3 h-3 text-black rotate-180" />
                              </>
                            ) : (
                              <>
                                <span>Ver ficha</span>
                                <ChevronDown className="w-3 h-3 text-stone-400" />
                              </>
                            )}
                          </span>
                        </div>

                        {/* SecciÃ³n inferior: Icono en caja redondeada, Badge tÃ©cnico, TÃ­tulo Futura y DescripciÃ³n */}
                        <div className="relative z-10 pt-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform ${
                                isSelected
                                  ? `${app.bgActive} ${app.textAccent} ${app.borderClass} scale-105 shadow-md`
                                  : 'bg-black/60 border-white/15 ' + app.textAccent
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>

                            <span
                              className={`inline-block text-[7.5px] sm:text-[8.5px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                isSelected
                                  ? app.badgePillClass
                                  : 'bg-black/50 text-stone-300 border-white/10'
                              }`}
                            >
                              {app.badge}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-heading font-black text-white text-xs sm:text-sm md:text-base leading-snug tracking-tight">
                              {app.title}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-stone-300/90 leading-tight mt-0.5 line-clamp-2 font-normal">
                              {app.shortDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ficha TÃ©cnica Completa Desplegada Hasta Abajo (Estilo Materiales TÃ©cnicos) */}
                {curApp && (() => {
                  const IconComp = curApp.icon;
                  return (
                    <div
                      className={`rounded-2xl border ${curApp.borderClass} bg-[#0A0E11] p-4 sm:p-6 shadow-2xl relative overflow-hidden animate-fadeIn`}
                    >
                      {/* Cabecera de la Ficha TÃ©cnica */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${curApp.bgActive} border border-white/10 flex items-center justify-center ${curApp.textAccent} shrink-0`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <span className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-wider block font-bold ${curApp.textAccent}`}>
                              {curApp.code} Â· {curApp.tag}
                            </span>
                            <h4 className="text-base sm:text-xl font-bold text-white">
                              {curApp.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="px-2.5 py-1 rounded bg-white/5 font-mono text-[10px] sm:text-xs text-gray-300 border border-white/10">
                            {curApp.badge}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedApp(null)}
                            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 text-xs cursor-pointer"
                            title="Cerrar detalle"
                          >
                            âœ•
                          </button>
                        </div>
                      </div>

                      {/* DescripciÃ³n Completa */}
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-3">
                        {curApp.desc}
                      </p>

                      {/* Matriz de ParÃ¡metros y Especificaciones */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 font-mono text-[10px] sm:text-[11px]">
                        {curApp.specs.map((sp, idx) => (
                          <div key={idx} className="p-2 sm:p-2.5 rounded-lg bg-[#11171B] border border-white/5">
                            <span className="block text-gray-400 text-[8px] uppercase tracking-wider">
                              {sp.label}
                            </span>
                            <strong className="text-white text-[11px] block mt-0.5 leading-snug">
                              {sp.val}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {/* Barra de AcciÃ³n con CÃ³digo de Color */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${curApp.btnBg}`} />
                          <span>FabricaciÃ³n bajo demanda con cotizaciÃ³n y trato local.</span>
                        </div>

                        <a
                          href="#cotizar-industria"
                          onClick={() => setFormData(prev => ({ ...prev, aplicacion: curApp.quoteApp, urgencia: curApp.urgencia }))}
                          className={`px-4 py-2 rounded-xl text-black font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all ${curApp.btnBg}`}
                        >
                          <span>Cotizar {curApp.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ========================================================
          4. SECCIÃ“N 02: MATERIALES TÃ‰CNICOS DINÃMICOS
          ======================================================== */}
      <section id="materiales-taller" className="py-7 sm:py-14 border-b border-white/10 bg-[#0A0E11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 sm:mb-8">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <span className="w-5 h-px bg-[#5BB8FF]" />
                02 / Materiales TÃ©cnicos Calibrados
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
                PolÃ­meros de ingenierÃ­a calibrados en taller.
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden md:block max-w-sm text-right">
              Perfiles tÃ©rmicos y mecÃ¡nicos optimizados para garantizar resistencia a impacto, tracciÃ³n y fluidos de mÃ¡quina.
            </p>
          </div>

          {/* Selector DinÃ¡mico de PolÃ­meros (Desplegable y Ocultable al Click) */}
          <div className="bg-[#11171B] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
            
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-gray-400">
                Selecciona un polÃ­mero para ver ficha tÃ©cnica:
              </span>
              {selectedMaterialTab && (
                <button
                  type="button"
                  onClick={() => setSelectedMaterialTab(null)}
                  className="text-[10px] text-[#5BB8FF] font-mono hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Ocultar especificaciones</span>
                  <ChevronDown className="w-3 h-3 rotate-180" />
                </button>
              )}
            </div>

            {/* Botones de selecciÃ³n de material */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'petg', label: 'PETG', tag: 'MecÃ¡nico', color: '#5BB8FF' },
                { id: 'tpu', label: 'TPU 95A', tag: 'Flexible', color: '#8FB99B' },
                { id: 'plaplus', label: 'PLA+ Pro', tag: 'RÃ­gido', color: '#FBBF24' },
                { id: 'abs', label: 'ABS / ASA', tag: 'TÃ©rmico', color: '#C084FC' }
              ].map(mat => {
                const isSelected = selectedMaterialTab === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedMaterialTab(isSelected ? null : mat.id)}
                    className={`py-2 px-2.5 sm:px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-[#5BB8FF] text-[#0A0E11] border-[#5BB8FF] shadow-[0_0_12px_rgba(91,184,255,0.35)]'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 active:scale-95'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold">{mat.label}</div>
                      <div className={`text-[8.5px] uppercase font-sans ${isSelected ? 'text-[#0A0E11]/80 font-bold' : 'text-gray-400'}`}>
                        {mat.tag}
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
            </div>

            {/* Ficha tÃ©cnica del material activo (Desplegable / Ocultable al click) */}
            {selectedMaterialTab && (() => {
              const cur = materialsData[selectedMaterialTab];
              if (!cur) return null;
              return (
                <div className="space-y-4 pt-2 border-t border-white/10 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#5BB8FF] block">
                        {cur.tag}
                      </span>
                      <h4 className="text-lg font-bold text-white">{cur.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-white/5 font-mono text-xs text-gray-300 border border-white/10">
                        {cur.temp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedMaterialTab(null)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 text-xs cursor-pointer"
                        title="Cerrar especificaciones"
                      >
                        âœ•
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {cur.summary}
                  </p>

                  {/* Matriz de ParÃ¡metros MecÃ¡nicos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px] pt-1">
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="block text-gray-500 text-[8px] uppercase">TracciÃ³n</span>
                      <strong className="text-white text-xs">{cur.tensile}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                      <span className="block text-gray-500 text-[8px] uppercase">Resistencia Impacto</span>
                      <strong className="text-[#8FB99B] text-xs">{cur.impact}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 col-span-2 sm:col-span-1">
                      <span className="block text-gray-500 text-[8px] uppercase">QuÃ­micos</span>
                      <strong className="text-amber-300 text-[10px] leading-tight block">{cur.chemical}</strong>
                    </div>
                  </div>

                  {/* Aplicaciones TÃ­picas en Planta */}
                  <div className="pt-2">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-2">
                      Aplicaciones Recomendadas en LÃ­nea:
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
        </div>
      </section>

      {/* ========================================================
          5. SECCIÃ“N 03: CÃ“MO TRABAJAMOS (PROCESO ÃGIL)
          ======================================================== */}
      <section id="proceso-industria" className="py-7 sm:py-14 border-b border-white/10 bg-[#0E1317]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 sm:mb-8">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <span className="w-5 h-px bg-[#5BB8FF]" />
                03 / Proceso TÃ©cnico de FabricaciÃ³n
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
                De tu archivo a la pieza en 4 pasos claros.
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden md:block max-w-sm text-right">
              Flujo directo sin intermediarios ni demoras burocrÃ¡ticas para dar respuesta Ã¡gil a paros de lÃ­nea.
            </p>
          </div>

          {/* Bloque de 4 cuadros (2x2 en celular, 4 en lÃ­nea en escritorio) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            
            {/* Paso 1 */}
            <div className="p-3.5 sm:p-6 rounded-2xl border border-white/10 bg-[#12181C] space-y-3 relative group hover:border-[#5BB8FF]/50 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[#5BB8FF] font-black text-2xl sm:text-4xl font-mono">01</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#5BB8FF]/10 flex items-center justify-center text-[#5BB8FF]">
                  <UploadCloud className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-bold text-xs sm:text-base text-white leading-tight">Archivo 3D</h4>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Nos compartes tu archivo 3D (.step, .stl, .obj) listo para impresiÃ³n.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-3.5 sm:p-6 rounded-2xl border border-white/10 bg-[#12181C] space-y-3 relative group hover:border-amber-400/50 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-black text-2xl sm:text-4xl font-mono">02</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-bold text-xs sm:text-base text-white leading-tight">CotizaciÃ³n RÃ¡pida</h4>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Revisamos la geometrÃ­a, elegimos el polÃ­mero ideal y te cotizamos de inmediato sin compromiso.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-3.5 sm:p-6 rounded-2xl border border-white/10 bg-[#12181C] space-y-3 relative group hover:border-emerald-400/50 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-black text-2xl sm:text-4xl font-mono">03</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-bold text-xs sm:text-base text-white leading-tight">FabricaciÃ³n TÃ©cnica</h4>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                ImpresiÃ³n 3D en polÃ­mero tÃ©cnico con tolerancias controladas y retiro limpio de soportes.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="p-3.5 sm:p-6 rounded-2xl border border-white/10 bg-[#12181C] space-y-3 relative group hover:border-[#8FB99B]/50 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[#8FB99B] font-black text-2xl sm:text-4xl font-mono">04</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8FB99B]/10 flex items-center justify-center text-[#8FB99B]">
                  <Truck className="w-5 h-5" />
                </div>
              </div>
              <h4 className="font-bold text-xs sm:text-base text-white leading-tight">Entrega en Planta</h4>
              <p className="text-[10px] sm:text-xs text-gray-300 leading-relaxed">
                Entrega personal acordada en San Luis PotosÃ­ o retiro directo en taller en 24 a 72 horas.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          6. SECCIÃ“N 04: SECTORES INDUSTRIALES
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
              Suministro Ã¡gil bajo demanda para lÃ­neas productivas y talleres.
            </p>
          </div>

          {/* Tira Minimalista de Sectores Industriales (Sin globitos) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-2 border-t border-white/10">
            {[
              { name: 'Automotriz', icon: Car, color: 'text-[#5BB8FF]' },
              { name: 'Mantenimiento', icon: Wrench, color: 'text-amber-400' },
              { name: 'Empaques', icon: Package, color: 'text-purple-400' },
              { name: 'MÃ©dico', icon: Activity, color: 'text-rose-400' },
              { name: 'Alimentos', icon: Utensils, color: 'text-emerald-400' },
              { name: 'LogÃ­stica', icon: Truck, color: 'text-cyan-400' }
            ].map((sector) => {
              const IconComp = sector.icon;
              return (
                <div
                  key={sector.name}
                  className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <IconComp className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${sector.color} shrink-0`} />
                  <span className="font-semibold">{sector.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECCIÃ“N 05: INFORMACIÃ“N CLAVE (2X2 EN MÃ“VIL, 4 EN FILA EN PC)
          ======================================================== */}
      <section id="info-clave-industria" className="py-7 sm:py-14 border-b border-white/10 bg-[#0A0E11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 sm:mb-8">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <span className="w-5 h-px bg-[#5BB8FF]" />
                05 / InformaciÃ³n Clave para Empresas
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1.5">
                Lo que necesitas saber.
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden md:block max-w-sm text-right">
              PolÃ­ticas claras de confidencialidad, formatos recibidos y tiempos garantizados de entrega local.
            </p>
          </div>

          {(() => {
            const keyInfoData = [
              {
                id: 'archivos',
                title: 'Â¿QuÃ© necesitas?',
                subtitle: 'Formatos y archivos 3D',
                icon: FileText,
                accentColor: '#5BB8FF',
                borderClass: 'border-[#5BB8FF]',
                ringClass: 'ring-[#5BB8FF]/40',
                textAccent: 'text-[#5BB8FF]',
                bgActive: 'bg-[#5BB8FF]/10',
                badge: 'Formatos CAD',
                desc: 'EnvÃ­anos tu archivo 3D en formato STL, STEP u OBJ listo para manufactura aditiva. Revisamos la viabilidad de impresiÃ³n y te cotizamos segÃºn el material y volumen requerido.',
                highlights: [
                  'Formatos recibidos: .stl, .step, .obj, .iges',
                  'ImpresiÃ³n directa a partir de tu archivo digital',
                  'AtenciÃ³n y cotizaciÃ³n personalizada por WhatsApp'
                ]
              },
              {
                id: 'nda',
                title: 'Confidencialidad',
                subtitle: 'Acuerdo NDA previo',
                icon: ShieldCheck,
                accentColor: '#8FB99B',
                borderClass: 'border-[#8FB99B]',
                ringClass: 'ring-[#8FB99B]/40',
                textAccent: 'text-[#8FB99B]',
                bgActive: 'bg-[#8FB99B]/10',
                badge: 'NDA Garantizado',
                desc: 'Protegemos tu propiedad intelectual y desarrollos. Firmamos acuerdos de confidencialidad (NDA) antes de la recepciÃ³n de archivos o proyectos sensibles para garantizar la total privacidad.',
                highlights: [
                  'Contrato NDA firmado previo al envÃ­o de archivos',
                  'Archivos almacenados en servidor seguro no pÃºblico',
                  'EliminaciÃ³n de datos o entrega de archivo segÃºn solicites'
                ]
              },
              {
                id: 'minimos',
                title: 'Sin MÃ­nimos',
                subtitle: 'Volumen flexible',
                icon: Boxes,
                accentColor: '#C084FC',
                borderClass: 'border-purple-400',
                ringClass: 'ring-purple-400/40',
                textAccent: 'text-purple-400',
                bgActive: 'bg-purple-400/10',
                badge: '1 a 500+ piezas',
                desc: 'Desde una sola refacciÃ³n para solucionar un paro de mÃ¡quina no programado, hasta lotes cortos de 10 a 500 piezas seriadas. Cero costo de apertura de molde o troquel y con entregas progresivas.',
                highlights: [
                  'Sin cantidades mÃ­nimas forzadas ni sobrecostos',
                  'Ideal para arranques de lÃ­nea y validaciones previas',
                  'Capacidad de escalar volumen en granja de impresiÃ³n'
                ]
              },
              {
                id: 'entrega',
                title: 'Entrega RÃ¡pida',
                subtitle: 'Desde 24 a 72 horas',
                icon: Clock,
                accentColor: '#FBBF24',
                borderClass: 'border-amber-400',
                ringClass: 'ring-amber-400/40',
                textAccent: 'text-amber-400',
                bgActive: 'bg-amber-400/10',
                badge: 'Entrega Local',
                desc: 'Tiempos de fabricaciÃ³n desde 24 a 72 horas para requerimientos de alta prioridad. El plazo estimado final dependerÃ¡ del volumen de piezas solicitadas y la complejidad geomÃ©trica de tu modelo.',
                highlights: [
                  'Plazos desde 24 a 72 horas segÃºn volumen y complejidad de la pieza',
                  'Entrega local acordada en zona industrial o retiro en taller',
                  'Seguimiento directo por WhatsApp durante la fabricaciÃ³n'
                ]
              }
            ];

            const curInfo = keyInfoData.find(k => k.id === expandedInfo);

            return (
              <div className="space-y-4">
                {/* CuadrÃ­cula Adaptativa: 2x2 en Celular, 4 Columnas en PC */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                  {keyInfoData.map(item => {
                    const isSelected = expandedInfo === item.id;
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setExpandedInfo(isSelected ? null : item.id)}
                        className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between hover:-translate-y-0.5 ${
                          isSelected
                            ? `${item.borderClass} ring-2 ${item.ringClass} bg-[#141C22] shadow-xl`
                            : 'border-white/10 bg-[#12181C] hover:border-white/25 active:scale-[0.98]'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-[9px] sm:text-[10px]">
                          <span className={`font-bold ${isSelected ? item.textAccent : 'text-gray-400'}`}>
                            {item.subtitle}
                          </span>
                          <span className={`text-[8.5px] sm:text-[9.5px] font-sans font-medium flex items-center gap-0.5 ${
                            isSelected ? item.textAccent : 'text-gray-400'
                          }`}>
                            <span>{isSelected ? 'Ocultar' : 'Ver detalle'}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isSelected ? 'rotate-180' : ''}`} />
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 pt-3">
                          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                            isSelected ? `${item.bgActive} ${item.textAccent} scale-105` : `bg-white/5 ${item.textAccent}`
                          }`}>
                            <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm lg:text-base font-bold text-white leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-mono hidden lg:block mt-0.5 line-clamp-1">
                              {item.badge}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detalle Desplegado de la InformaciÃ³n Clave (Hasta abajo del grid) */}
                {curInfo && (() => {
                  const IconComp = curInfo.icon;
                  return (
                    <div
                      className={`rounded-xl sm:rounded-2xl border ${curInfo.borderClass} bg-[#080C0E] p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-fadeIn`}
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${curInfo.bgActive} border border-white/10 flex items-center justify-center ${curInfo.textAccent} shrink-0`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-wider block font-bold ${curInfo.textAccent}`}>
                              {curInfo.subtitle}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              {curInfo.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[9.5px] text-gray-300 border border-white/10">
                            {curInfo.badge}
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedInfo(null)}
                            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 text-xs cursor-pointer"
                            title="Ocultar detalle"
                          >
                            âœ•
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pt-3">
                        {curInfo.desc}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 font-mono text-[10.5px] text-gray-300">
                        {curInfo.highlights.map((hl, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${curInfo.textAccent.replace('text-', 'bg-')}`} />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

        </div>
      </section>

      {/* ========================================================
          8. SECCIÃ“N 06: TERMINAL DE COTIZACIÃ“N INDUSTRIAL B2B
          ======================================================== */}
      <section id="cotizar-industria" className="py-8 sm:py-16 bg-[#0E1317]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="p-4 sm:p-10 rounded-2xl border border-white/15 bg-[#12181C] shadow-2xl space-y-5 sm:space-y-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-5 font-mono text-[9px] text-[#5BB8FF] opacity-60 hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5BB8FF] animate-pulse" />
              <span>TERMINAL // COTIZACIÃ“N DIRECTA B2B</span>
            </div>

            <div className="max-w-2xl">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#5BB8FF] flex items-center gap-2">
                <span className="w-5 h-px bg-[#5BB8FF]" />
                06 / Cotizador B2B
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Â¿Tienes una pieza detenida en planta?
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
                Completa los datos tÃ©cnicos de tu requerimiento. Revisamos viabilidad geomÃ©trica, cubicaciÃ³n y tiempos de impresiÃ³n para enviarte respuesta directa por WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmitWhatsApp} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tu Nombre o Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Carlos MartÃ­nez"
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
                    placeholder="Ej. Taller MecÃ¡nico / Planta SLP"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#5BB8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Correo ElectrÃ³nico *</label>
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
                  <label className="block text-gray-300 font-semibold mb-1">WhatsApp / TelÃ©fono *</label>
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
                  <label className="block text-gray-300 font-semibold mb-1">AplicaciÃ³n</label>
                  <select
                    value={formData.aplicacion}
                    onChange={(e) => {
                      const val = e.target.value;
                      let urg = 'Desde 24 a 72 hrs';
                      if (val.includes('Utillaje')) urg = 'A medida';
                      else if (val.includes('Refacciones')) urg = 'SustituciÃ³n directa';
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
                  <label className="block text-gray-300 font-semibold mb-1">PolÃ­mero Sugerido</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E11] border border-white/15 text-white focus:outline-none focus:border-[#5BB8FF]"
                  >
                    <option>PETG TÃ©cnico (Tenaz)</option>
                    <option>TPU 95A (Flexible / AntirrayÃ³n)</option>
                    <option>PLA+ Pro (Estudio dimensional rÃ¡pido)</option>
                    <option>ABS / ASA (Piezas medianas / tÃ©rmico)</option>
                    <option>RecomiÃ©ndenme uno segÃºn mi pieza</option>
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
                  <span>Ver catÃ¡logo de colores abajo â†“</span>
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
                      TambiÃ©n puedes arrastrarlo o adjuntarlo en el chat de WhatsApp al cotizar.
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
                  Requiero firma de convenio de confidencialidad (NDA) antes de compartir archivos reservados.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enviar Orden de CotizaciÃ³n a Taller por WhatsApp</span>
                </button>
              </div>
            </form>

            {formSubmitted && (
              <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Â¡Tu solicitud se abriÃ³ en WhatsApp con la orden formateada! Si no abriÃ³, pulsa nuevamente el botÃ³n verde.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      
      {/* ========================================================
          7. PESTAÃ‘A / DRAWER: CARTA TÃ‰CNICA DE ACABADOS (UX MOBILE-FIRST)
          ======================================================== */}
      <section id="consulta-colores-industria" className="py-6 sm:py-10 bg-[#0A0E11] border-t border-white/10">
        <div className="max-w-4xl mx-auto px-3 sm:px-6">
          <div className="rounded-2xl border border-white/15 bg-[#12181C] overflow-hidden shadow-2xl transition-all">
            
            {/* Header / BotÃ³n PestaÃ±a Desplegable (Optimizado Mobile) */}
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
                      Carta TÃ©cnica
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
                
                {/* 1. Selector de PolÃ­mero: Segmented Bar tÃ¡ctil de 4 botones sin scroll */}
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

                {/* Info rÃ¡pida del material activo */}
                <div className="flex items-center justify-between text-[10.5px] sm:text-xs font-mono text-gray-400 px-1 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#5BB8FF] shrink-0" />
                    <span className="truncate">
                      PolÃ­mero: <strong className="text-white">{INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.materialName}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8FB99B] shrink-0">
                    {INDUSTRIAL_COLORS_BY_MATERIAL[colorDrawerMaterial]?.tag}
                  </span>
                </div>

                {/* 2. Paleta de Swatches Circulares TÃ¡ctiles (Mobile First) */}
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

                {/* 3. Ficha TÃ¡ctil del Color Activo Seleccionado */}
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
                          <span>Subir al formulario â†‘</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Pie informativo */}
                <div className="text-[10px] text-gray-400 font-mono pt-1.5 border-t border-white/5 text-center sm:text-left">
                  <span>Â¿Requieres un tono especÃ­fico fuera de catÃ¡logo? Validamos disponibilidad con nuestros distribuidores de filamento antes de confirmar.</span>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. SECCIÃ“N: COMPARTIR ESTE PORTAL CON EQUIPOS INDUSTRIALES / PLANTAS
          ======================================================== */}
      <section className="py-8 sm:py-14 border-t border-white/10 bg-gradient-to-b from-[#0A0E11] via-[#10171D] to-[#0A0E11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-[#5BB8FF]/30 bg-[#0E151A] p-4 sm:p-7 shadow-2xl relative overflow-hidden">
            
            {/* Rejilla tÃ©cnica de fondo */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative space-y-5">
              
              {/* Encabezado B2B de ComunicaciÃ³n Directa */}
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#5BB8FF]">
                  <Building2 className="w-3.5 h-3.5 text-[#5BB8FF]" />
                  <span>Que una refacciÃ³n no te detenga</span>
                </div>
                
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Â¿Conoces a un colega de Mantenimiento, Compras o IngenierÃ­a?
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
                  Comparte este contacto con tu equipo de planta. Una opciÃ³n de servicio de impresiÃ³n 3D tÃ©cnica en San Luis PotosÃ­ para fabricar refacciones mecÃ¡nicas, utillaje de ensamble y piezas a la medida sin requerir moldes.
                </p>
              </div>

              {/* Ficha Visual de Vista Previa del Enlace */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#070B0D] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono overflow-hidden">
                <div className="space-y-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-[#5BB8FF] text-[9.5px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5BB8FF]" />
                    <span>ARTESANO DIGITAL Â· INDUSTRIA</span>
                  </div>
                  <div className="text-white font-sans font-semibold text-xs sm:text-sm truncate">
                    Servicio de ImpresiÃ³n 3D TÃ©cnica y Refacciones
                  </div>
                  <div className="text-gray-400 text-[10.5px] truncate font-mono">
                    {sharePortalUrl}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-[#8FB99B]/15 text-[#8FB99B] border border-[#8FB99B]/30 text-[9.5px] shrink-0 font-bold self-start sm:self-auto">
                  NDA Confidencial Â· Sin MÃ­nimos
                </span>
              </div>

              {/* Botones de AcciÃ³n para Compartir */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
                
                {/* 1. Compartir por WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black text-transparent" />
                  <span>Compartir por WhatsApp</span>
                </button>

                {/* 2. Copiar Enlace Directo con feedback */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`w-full py-2.5 sm:py-3 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    copiedLink
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/10'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Â¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#5BB8FF]" />
                      <span>Copiar enlace directo</span>
                    </>
                  )}
                </button>

                {/* 3. Compartir en Celular (Nativo) o Enviar a Compras */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-[#5BB8FF] hover:bg-[#4aa3e6] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg sm:hidden"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir desde tu celular</span>
                </button>

                <a
                  href={mailToB2B}
                  className="hidden sm:inline-flex w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-bold items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  <Mail className="w-4 h-4 text-[#5BB8FF]" />
                  <span>Enviar a Compras / Planta</span>
                </a>

              </div>

              {/* Mensaje de cortesÃ­a para equipos de planta */}
              <div className="text-[10px] sm:text-[10.5px] text-gray-400 font-mono text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-1 pt-2 border-t border-white/5">
                <span>AtenciÃ³n directa y confidencial para parques industriales y talleres mecÃ¡nicos.</span>
                <span className="text-[#8FB99B] font-bold">San Luis PotosÃ­ Â· EnvÃ­os nacionales</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. SECCIÃ“N: REGRESO A LA TIENDA PRINCIPAL
          ======================================================== */}
      <section className="py-12 border-t border-white/10 bg-[#0A0E11] text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5BB8FF]">
            Artesano Digital Â· CatÃ¡logo General
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Â¿Buscas artÃ­culos de regalo o decoraciÃ³n?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Regresa a la tienda principal para explorar lÃ¡mparas modernas, figuras coleccionables y llaveros personalizados.
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
        <div><strong>Artesano Digital Â· Manufactura Aditiva & Prototipado</strong> Â· San Luis PotosÃ­, S.L.P.</div>
        <div className="text-[10px] text-gray-600">Prototipos funcionales Â· Utillaje & Jigs Â· Refacciones Â· Preseries B2B</div>
      </footer>

    </div>
  );
}

