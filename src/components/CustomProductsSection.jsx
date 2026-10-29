import React, { useState } from 'react';
import {
  Sparkles,
  Dog,
  Heart,
  GraduationCap,
  Users,
  Smile,
  Palette,
  Layers,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  X,
  MessageCircle,
  Eye,
  Hammer,
  Home,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function CustomProductsSection({
  settings,
  onGoHome,
  onSelectProduct,
  onAddToCart,
  onOpenCalculator
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState({}); // { [prodId]: 0..3 }
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title }

  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  const customProducts = [
    {
      id: 'mascotas',
      dbId: 'figuras-funko-mascotas',
      category: 'mascotas',
      icon: Dog,
      badge: 'POP! Custom',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      title: 'Funko Custom Mascotas',
      fullTitle: 'Figura Funko Custom â€” Mascotas (Perros, Gatos y Compañeros)',
      tagline: 'Tu perrito, gatito o animal de compañía en volumen 3D',
      priceEstimate: 'Desde $650 MXN',
      priceNumber: 650,
      leadTime: '3 a 5 días',
      images: [
        './uploads/catalog-v2-cust-pets-1.webp',
        './uploads/catalog-v2-cust-pets-2.webp',
        './uploads/catalog-v2-cust-pets-3.webp',
        './uploads/catalog-v2-cust-pets-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Caja y empaque'],
      shortDesc: 'Inmortalizamos a tu mejor amigo con sus manchas, pelaje, collar y rasgos únicos, en su caja POP! Custom con ventana transparente y su nombre.',
      materialsText: '75 g Filamento PLA+ biodegradable / Resina UV técnica Â· Caja POP! Custom en cartón sulfatado con ventana de acetato Â· Acabados a mano con sellador mate UV.',
      costsText: 'Costo directo estimado: $194.50 MXN (Filamento $22.50 + Caja ventana $28.00 + Pintura y sellador $18.00 + Luz y máquina $36.00 + Modelado $90.00). Margen ~70%.',
      timesText: '4.5 horas de máquina FDM Â· 45 min de esculpido digital de fotos y detallado.',
      steps: [
        '1. Envíanos fotos claras de tu mascota (frente, lomo y collar).',
        '2. Modelamos la figura en 3D respetando sus manchas y fisionomía.',
        '3. Imprimimos en 3D con alta definición y aplicamos acabados a color.',
        '4. Diseñamos la caja POP! con su nombre y te entregamos la pieza lista para presumir.'
      ],
      includes: [
        'Figura 3D personalizada de tu mascota (9 a 10 cm)',
        'Caja POP! Custom con ventana transparente y nombre',
        'Acabado protegido para exhibición duradera',
        'Asesoría directa de taller durante todo el proceso'
      ],
      whatsappText: `Hola Artesano Digital,\nMe interesa cotizar una *Figura Estilo Funko Personalizada para mi Mascota*:\nâ€¢ Tipo de mascota (perro, gato, otro):\nâ€¢ Nombre de mi mascota:\nâ€¢ Cuento con fotos de referencia para su modelado y su caja POP! Custom.\n¿Podrían darme informes sobre tiempos de entrega y costo?`
    },
    {
      id: 'parejas',
      dbId: 'figuras-funko-parejas',
      category: 'parejas',
      icon: Heart,
      badge: 'Set Dúo POP!',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      title: 'Funko Custom Parejas',
      fullTitle: 'Figura Funko Custom â€” Parejas (Set Dúo Novios o Esposos)',
      tagline: 'El regalo más romántico y memorable para dos',
      priceEstimate: 'Desde $1,250 MXN',
      priceNumber: 1250,
      leadTime: '4 a 6 días',
      images: [
        './uploads/catalog-v2-cust-parejas-1.webp',
        './uploads/catalog-v2-cust-parejas-2.webp',
        './uploads/catalog-v2-cust-parejas-3.webp',
        './uploads/catalog-v2-cust-parejas-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Caja doble'],
      shortDesc: 'Set de figuras personalizadas para novios, esposos o aniversarios. Reproducimos sus outfits favoritos, peinados, poses cómplices y caja conmemorativa doble.',
      materialsText: '150 g Filamento PLA+ grado ingeniería Â· Caja conmemorativa doble POP! con ventana de acetato Â· Acabados finos de textiles, accesorios y sellador mate.',
      costsText: 'Costo directo estimado: $347.00 MXN (Filamento $45.00 + Caja doble $42.00 + Pintura y acabados $32.00 + Luz y máquina $68.00 + Modelado dúo $160.00). Margen ~72%.',
      timesText: '8.5 horas de máquina FDM Â· 80 min de modelado digital y post-proceso artesanal.',
      steps: [
        '1. Envíanos fotos de la pareja y la vestimenta que desean recrear.',
        '2. Diseñamos el modelo 3D digital con los rasgos y poses elegidas.',
        '3. Fabricamos en 3D con materiales de alta durabilidad.',
        '4. Entregamos las figuras en su caja personalizada con sus nombres y fecha.'
      ],
      includes: [
        'Set de 2 figuras 3D personalizadas (10 a 11 cm)',
        'Caja doble de colección con nombres, fecha o dedicatoria',
        'Vestimenta y peinados personalizados según tus fotos',
        'Envío protegido a cualquier parte de la República'
      ],
      whatsappText: `Hola Artesano Digital,\nMe interesa cotizar una *Figura Estilo Funko Personalizada de Pareja*:\nâ€¢ Ocasión: (Aniversario / Boda / Cumpleaños / Regalo especial)\nâ€¢ Cuento con fotos de ambos para los outfits y peinados.\n¿Podrían darme informes sobre opciones y tiempos de entrega?`
    },
    {
      id: 'profesiones',
      dbId: 'figuras-funko-profesiones',
      category: 'profesiones',
      icon: GraduationCap,
      badge: 'Profesiones',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      title: 'Funko Profesiones & Graduaciones',
      fullTitle: 'Figura Funko Custom â€” Profesiones & Graduaciones',
      tagline: 'Celebra su vocación profesional, graduación o ascenso',
      priceEstimate: 'Desde $680 MXN',
      priceNumber: 680,
      leadTime: '3 a 5 días',
      images: [
        './uploads/catalog-v2-cust-prof-1.webp',
        './uploads/catalog-v2-cust-prof-2.webp',
        './uploads/catalog-v2-cust-prof-3.webp',
        './uploads/catalog-v2-cust-prof-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Caja de título'],
      shortDesc: 'Médicos con bata y estetoscopio, ingenieros con casco y planos, enfermeros, abogados, maestros, chefs o deportistas con uniforme oficial y caja conmemorativa.',
      materialsText: '85 g Filamento PLA+ Â· Accesorios en resina técnica (estetoscopios, cascos, birretes, instrumental) Â· Caja POP! Custom con título profesional grabado.',
      costsText: 'Costo directo estimado: $215.50 MXN (Filamento $25.50 + Caja título $28.00 + Resina/Pintura $22.00 + Máquina $40.00 + Modelado $100.00). Margen ~68%.',
      timesText: '5.0 horas de máquina FDM Â· 50 min modelado de accesorios y ensamble.',
      steps: [
        '1. Envíanos foto de la persona y del uniforme o vestimenta profesional.',
        '2. Modelamos los accesorios clave (estetoscopio, birrete, herramientas, etc.).',
        '3. Impresión 3D y detallado cuidadoso de taller.',
        '4. Empaque en caja POP! con su título profesional y dedicatoria.'
      ],
      includes: [
        'Figura 3D con uniforme y accesorios profesionales (10 a 11 cm)',
        'Caja POP! Custom con título, profesión y nombre',
        'Muestra digital previa para tu confirmación',
        'Acabado resistente listo para escritorio o consultorio'
      ],
      whatsappText: `Hola Artesano Digital,\nMe interesa cotizar una *Figura Estilo Funko Personalizada de Profesión*:\nâ€¢ Profesión / Especialidad:\nâ€¢ Ocasión: (Graduación / Titulación / Regalo de trabajo)\nâ€¢ Cuento con fotos de referencia del uniforme y accesorios.\n¿Podrían orientarme sobre tiempos y costo?`
    },
    {
      id: 'amigos',
      dbId: 'figuras-funko-amigos',
      category: 'amigos',
      icon: Users,
      badge: 'Amigos POP!',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      title: 'Funko Amigos & Cumpleaños',
      fullTitle: 'Figura Funko Custom â€” Amigos & Cumpleaños',
      tagline: 'Para ese amigo o amiga que siempre está ahí',
      priceEstimate: 'Desde $650 MXN',
      priceNumber: 650,
      leadTime: '3 a 5 días',
      images: [
        './uploads/catalog-v2-cust-amigos-1.webp',
        './uploads/catalog-v2-cust-amigos-2.webp',
        './uploads/catalog-v2-cust-amigos-3.webp',
        './uploads/catalog-v2-cust-amigos-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Caja conmemorativa'],
      shortDesc: 'Recrea a tu mejor amigo con sus prendas favoritas, tatuajes, tenis o accesorios característicos (guitarra, videojuegos, libro, taza de café).',
      materialsText: '80 g Filamento PLA+ Â· Accesorios personalizados detallados Â· Caja POP! con dedicatoria o apodo especial.',
      costsText: 'Costo directo estimado: $198.00 MXN (Filamento $24.00 + Caja ventana $28.00 + Pintura $18.00 + Máquina $38.00 + Modelado $90.00). Margen ~70%.',
      timesText: '4.5 horas de máquina FDM Â· 45 min de modelado digital y post-proceso.',
      steps: [
        '1. Envíanos fotos de tu amigo(a) y los elementos que lo definen.',
        '2. Modelamos la figura con sus rasgos, estilo y pose favorita.',
        '3. Imprimimos en 3D con colores vivos y duraderos.',
        '4. Añadimos su apodo y fecha especial a la caja POP! Custom.'
      ],
      includes: [
        'Figura 3D personalizada con accesorios de identidad (10 cm)',
        'Caja POP! Custom con apodo, número de edición y dedicatoria',
        'Acabado sellado contra polvo y decoloración',
        'Empaque de regalo listo para entregar'
      ],
      whatsappText: `Hola Artesano Digital,\nMe interesa cotizar una *Figura Estilo Funko para un Amigo / Cumpleaños*:\nâ€¢ Nombre o apodo del amigo:\nâ€¢ Detalles o accesorios que me gustaría incluir:\n¿Podrían darme informes sobre tiempos y costo?`
    },
    {
      id: 'familia',
      dbId: 'figuras-funko-familia',
      category: 'familia',
      icon: Smile,
      badge: 'Pack Familiar',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      title: 'Funko Pack Familiar',
      fullTitle: 'Figura Funko Custom â€” Pack Familiar (Papá, Mamá e Hijos)',
      tagline: 'El retrato familiar más tierno y divertido en 3D',
      priceEstimate: 'Desde $1,850 MXN (3 piezas)',
      priceNumber: 1850,
      leadTime: '5 a 8 días',
      images: [
        './uploads/catalog-v2-cust-familia-1.webp',
        './uploads/catalog-v2-cust-familia-2.webp',
        './uploads/catalog-v2-cust-familia-3.webp',
        './uploads/catalog-v2-cust-familia-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Caja set familiar'],
      shortDesc: 'Recrea a toda la familia en una composición armoniosa: papás, hijos y bebés con sus alturas proporcionales, en caja exhibidora panorámica con apellido familiar.',
      materialsText: '240 g Filamento PLA+ Â· Base panorámica escalonada Â· Caja triple o cuádruple con ventana acrílica amplia.',
      costsText: 'Costo directo estimado: $520.00 MXN (Filamento $72.00 + Caja panorámica $65.00 + Pintura $45.00 + Máquina $118.00 + Modelado familiar $220.00). Margen ~72%.',
      timesText: '14 horas de máquina FDM Â· 120 min de diseño y ensamble de conjunto.',
      steps: [
        '1. Envíanos una foto familiar reciente o fotos individuales de cada integrante.',
        '2. Modelamos a cada miembro respetando sus alturas y rasgos característicos.',
        '3. Producimos en 3D cuidando la armonía de la paleta de colores.',
        '4. Ensamblamos en caja panorámica con el apellido familiar grabado.'
      ],
      includes: [
        'Set de 3 o más figuras 3D a escala proporcional',
        'Base panorámica escalonada para lucir a todos los miembros',
        'Caja de colección familiar con apellido y dedicatoria',
        'Empaque de protección reforzado para traslado seguro'
      ],
      whatsappText: `Hola Artesano Digital,\nMe interesa cotizar un *Pack Familiar Estilo Funko 3D*:\nâ€¢ Número de integrantes (adultos, niños, bebés, mascotas):\nâ€¢ Apellido familiar para la caja:\n¿Podrían darme informes y opciones de paquetes familiares?`
    },
    {
      id: 'abuelitos',
      dbId: 'figuras-funko-abuelitos',
      category: 'abuelitos',
      icon: Heart,
      badge: 'Homenaje Especial',
      badgeColor: 'bg-warm-100 text-stone-900 border-stone-300',
      title: 'Funko Homenaje a los Abuelitos',
      fullTitle: 'Figura Funko Custom â€” Abuelitos (Homenaje a los Abuelos)',
      tagline: 'Un tributo inolvidable lleno de amor y gratitud',
      priceEstimate: 'Desde $680 MXN (o $1,290 Dúo)',
      priceNumber: 680,
      leadTime: '3 a 5 días',
      images: [
        './uploads/catalog-v2-cust-abuelitos-1.webp',
        './uploads/catalog-v2-cust-abuelitos-2.webp',
        './uploads/catalog-v2-cust-abuelitos-3.webp',
        './uploads/catalog-v2-cust-abuelitos-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Caja conmemorativa'],
      shortDesc: 'Captura la ternura, el peinado, los anteojos y la calidez de los abuelos. El regalo más conmovedor para el Día de los Abuelos, bodas de oro o cumpleaños.',
      materialsText: '80 g Filamento PLA+ Â· Accesorios en resina (anteojos, tejido, bastón) Â· Caja POP! conmemorativa con mensaje de amor de los nietos.',
      costsText: 'Costo directo estimado: $210.00 MXN (Filamento $24.00 + Caja $28.00 + Resina anteojos $20.00 + Máquina $38.00 + Modelado $100.00). Margen ~69%.',
      timesText: '4.5 horas de máquina FDM Â· 55 min de modelado con detalles de ternura.',
      steps: [
        '1. Envíanos fotos de tus abuelitos (individual o en pareja).',
        '2. Modelamos sus rasgos tiernos, anteojos, suéter o prendas queridas.',
        '3. Imprimimos en 3D con máxima fidelidad y suavidad.',
        '4. Diseñamos la caja POP! con dedicatoria de toda la familia.'
      ],
      includes: [
        'Figura 3D personalizada con accesorios de ternura (10 cm)',
        'Caja POP! Custom conmemorativa con dedicatoria especial',
        'Acabado mate de protección UV para exhibir toda la vida',
        'Empaque de regalo con moño y tarjeta dedicatoria'
      ],
      whatsappText: `Hola Artesano Digital,\nMe interesa cotizar una *Figura Estilo Funko en Homenaje a mis Abuelitos*:\nâ€¢ Es para: (Abuelito / Abuelita / Ambos en dúo)\nâ€¢ Cuento con fotos para el modelado.\n¿Podrían apoyarme con tiempos y detalles de empaque con dedicatoria?`
    },
    {
      id: 'dibujo',
      dbId: 'de-dibujo-a-figura-3d',
      category: 'dibujo',
      icon: Palette,
      badge: 'Boceto a 3D',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      isSpecialDrawing: true,
      title: 'De Dibujo Infantil a Escultura 3D',
      fullTitle: 'De Dibujo Infantil a Figura 3D Real (El Arte de tus Pequeños)',
      tagline: '¡El dibujo o boceto de tu pequeño, ahora en volumen real!',
      priceEstimate: 'Desde $580 MXN',
      priceNumber: 580,
      leadTime: '3 a 5 días',
      images: [
        './uploads/catalog-v2-cust-dibujo-1.webp',
        './uploads/catalog-v2-cust-dibujo-2.webp',
        './uploads/catalog-v2-cust-dibujo-3.webp',
        './uploads/catalog-v2-cust-dibujo-4.webp'
      ],
      photoLabels: ['En contexto', 'Fondo blanco', 'Detalle', 'Peana y escala'],
      shortDesc: '¿Tienes un dibujo de tu pequeño? Lo convertimos en una escultura 3D física única. Dragones, monstruos, superhéroes o personajes fieles a sus trazos.',
      materialsText: '95 g Filamento PLA biodegradable no tóxico o resina técnica Â· Base pedestal grabada con nombre del niño y fecha Â· Caja de regalo con viruta kraft.',
      costsText: 'Costo directo estimado: $236.50 MXN (Filamento $28.50 + Base grabada $18.00 + Caja kraft $22.00 + Máquina $48.00 + Esculpido 3D $120.00). Margen ~59%.',
      timesText: '6.0 horas de máquina FDM Â· 60 min de vectorización y escultura digital a partir del dibujo.',
      steps: [
        '1. Tu dibujo: Nos mandas la foto del dibujo de tu hijo (a mano o digital).',
        '2. Lo digitalizamos: Nuestro equipo lo convierte en modelo 3D respetando cada trazo.',
        '3. Imprimimos en 3D: Tecnología de alta precisión para darle volumen y forma.',
        '4. ¡Tu figura real!: Escultura física terminada sobre peana grabada, lista para decorar o regalar.'
      ],
      includes: [
        'Digitalización y modelado 3D profesional a partir del dibujo',
        'Impresión 3D de alta definición en volumen real (10 a 15 cm)',
        'Base pedestal grabada con nombre del pequeño y año',
        'Pieza única e irrepetible que atesorarán para siempre'
      ],
      whatsappText: `Hola Artesano Digital,\nTengo un *Dibujo / Boceto de mi hijo* y me encantaría convertirlo en una *Figura 3D Física*:\nâ€¢ Tengo la foto del dibujo lista para enviárselas.\n¿Podrían apoyarme con la cotización de digitalización e impresión 3D?`
    }
  ];

  const filteredProducts = activeFilter === 'all'
    ? customProducts
    : customProducts.filter(p => p.category === activeFilter);

  const handleSendWhatsApp = (product) => {
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(product.whatsappText)}`;
    window.open(url, '_blank');
  };

  const setPhotoIndex = (prodId, idx, e) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIndex(prev => ({ ...prev, [prodId]: idx }));
  };

  const openProductDetail = (prod) => {
    setSelectedProductForModal(prod);
    setModalPhotoIndex(selectedPhotoIndex[prod.id] || 0);
  };

  return (
    <div className="bg-[#FAF9F5] text-stone-900 min-h-screen">
      
      {/* 1. BANNER ESTANDARIZADO DE ÁREA (Idéntico a Hogar, Negocios y Eventos: Compacto y con texto a la izquierda) */}
      <div className="relative bg-[#1F2421] text-white overflow-hidden py-8 sm:py-12 border-b border-black/20">
        <div className="absolute inset-0 opacity-20">
          <img loading="lazy"
            src="./uploads/personalizados-figuras-funko.jpg"
            alt="Personalizados Artesano Digital"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F2421] via-[#1F2421]/90 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-emerald-400 border border-emerald-400/20">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Colección Oficial de Taller</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Personalizados
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Convertimos tus fotografías más queridas y los dibujos de tus pequeños en figuras tridimensionales reales y coleccionables en filamento ecológico.
          </p>
        </div>
      </div>

      {/* Breadcrumbs Navigation Estandarizada */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={onGoHome}
            className="hover:text-[#1F2421] flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#1F2421] font-bold truncate">Personalizados</span>
        </nav>
      </div>

      {/* 2. BARRA DE PESTAÃ‘AS / FILTROS (Móvil Primero - Desplazable) */}
      <div className="sticky top-20 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 py-2">
          
          {/* Categorías Deslizables */}
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'all', label: 'Todos (7)' },
              { id: 'mascotas', label: 'Mascotas' },
              { id: 'parejas', label: 'Parejas' },
              { id: 'profesiones', label: 'Profesiones' },
              { id: 'amigos', label: 'Amigos' },
              { id: 'familia', label: 'Familia' },
              { id: 'abuelitos', label: 'Abuelitos' },
              { id: 'dibujo', label: 'Dibujo a 3D' }
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#17251E] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full shrink-0 hidden xs:inline-block">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'modelo' : 'modelos'}
          </span>

        </div>
      </div>

      {/* 3. GRID ESTANDARIZADO: 2 COLUMNAS EN CELULAR (grid-cols-2), IGUAL QUE HOGAR, NEGOCIOS Y EVENTOS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((prod) => {
            const isDrawing = prod.category === 'dibujo';
            const currentImgIndex = selectedPhotoIndex[prod.id] || 0;
            const currentImage = prod.images[currentImgIndex] || prod.images[0];

            return (
              <div
                key={prod.id}
                onClick={() => openProductDetail(prod)}
                className={`group rounded-2xl sm:rounded-3xl bg-white border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isDrawing
                    ? 'border-sky-300 hover:border-sky-500 ring-1 ring-sky-300/30'
                    : 'border-stone-200 hover:border-[#2D4F3E]/40'
                }`}
              >
                {/* Imagen del Producto con Vistas y Marca de Agua */}
                <div className="relative aspect-square bg-[#101215] overflow-hidden select-none">
                  <img loading="lazy"
                    src={currentImage}
                    alt={prod.title}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 pointer-events-none select-none"
                    onError={(e) => {
                      e.currentTarget.src = './brand/og_artesano_preview.jpg';
                    }}
                  />

                  {/* Marca de Agua Sutil Oficial */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-[2px] rounded-full bg-black/20 backdrop-blur-2xs text-[7px] font-medium text-white/70 pointer-events-none select-none tracking-tight border border-white/5 shadow-2xs">
                    <img loading="lazy"
                      src="./brand/artesano_isotipo_transparente.png"
                      alt=""
                      className="w-2 h-2 object-contain shrink-0 opacity-80"
                    />
                    <span className="hidden xs:inline">Artesano Digital</span>
                  </div>

                  {/* Badge de Categoría Compacto */}
                  <div className="absolute top-2 left-2 pointer-events-none z-10">
                    <span className={`px-2 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider backdrop-blur-md shadow-2xs ${prod.badgeColor}`}>
                      {prod.badge}
                    </span>
                  </div>

                  {/* Selector de 4 Vistas Mini Táctil en la Base de la Foto */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 bg-black/60 backdrop-blur-md py-1 px-1.5 rounded-lg z-10"
                  >
                    {prod.images.map((_, idx) => {
                      const isCurrent = currentImgIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => setPhotoIndex(prod.id, idx, e)}
                          className={`flex-1 py-0.5 rounded text-[8.5px] sm:text-[9.5px] font-mono font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-300 hover:text-white hover:bg-white/20'
                          }`}
                          title={`Ver vista ${idx + 1}`}
                        >
                          V{idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contenido / Información de la Tarjeta */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-heading font-black text-xs sm:text-sm text-stone-900 leading-snug line-clamp-1 group-hover:text-[#2D4F3E] transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-amber-700 font-semibold line-clamp-1">
                      {prod.tagline}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                    <div>
                      <span className="text-[8.5px] sm:text-[9px] uppercase font-bold text-stone-400 block leading-tight">
                        Inversión
                      </span>
                      <span className="font-black font-mono text-xs sm:text-sm text-[#17251E]">
                        {prod.priceEstimate}
                      </span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-stone-400 inline" />
                      <span>{prod.leadTime}</span>
                    </span>
                  </div>

                  {/* Botones de Acción */}
                  <div className="pt-1 grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductDetail(prod);
                      }}
                      className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      Detalles
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendWhatsApp(prod);
                      }}
                      className="py-1.5 px-2 rounded-xl bg-[#2D4F3E] hover:bg-[#1F2421] text-white text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Cotizar</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* 4. MODAL DETALLADO DE PRODUCTO PERSONALIZADO (Costos, Materiales, Tiempos y 4 Vistas en HD) */}
      {selectedProductForModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedProductForModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 text-stone-900 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${selectedProductForModal.badgeColor}`}>
                  {selectedProductForModal.badge}
                </span>
                <h3 className="text-base sm:text-lg font-black font-heading text-stone-900 mt-0.5">
                  {selectedProductForModal.fullTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              
              {/* Galería Principal de 4 Vistas */}
              <div className="space-y-3">
                <div className="relative aspect-[4/3] rounded-2xl bg-[#101215] overflow-hidden select-none">
                  <img loading="lazy"
                    src={selectedProductForModal.images[modalPhotoIndex] || selectedProductForModal.images[0]}
                    alt={selectedProductForModal.title}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-2xs text-[9px] font-medium text-white/80 border border-white/10">
                    <img loading="lazy" src="./brand/artesano_isotipo_transparente.png" alt="" className="w-3 h-3 object-contain" />
                    <span>Artesano Digital</span>
                  </div>
                </div>

                {/* Selector de 4 Vistas */}
                <div className="grid grid-cols-4 gap-2">
                  {selectedProductForModal.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalPhotoIndex(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        modalPhotoIndex === idx
                          ? 'border-[#2D4F3E] ring-2 ring-[#2D4F3E]/40'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img loading="lazy" src={img} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[8.5px] font-bold text-center py-0.5 rounded backdrop-blur-2xs truncate px-0.5">
                        {selectedProductForModal.photoLabels[idx] || `Vista ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción y Especificaciones */}
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  {selectedProductForModal.shortDesc}
                </p>

                {/* Desglose de Costos de Taller y Materiales Estimados */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#17251E]">
                    <Hammer className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>Materiales y Costes de Manufactura Estimados</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    <strong className="text-stone-800">Materiales:</strong> {selectedProductForModal.materialsText}
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    <strong className="text-stone-800">Coste de producción:</strong> {selectedProductForModal.costsText}
                  </p>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    <strong className="text-stone-800">Tiempos de taller:</strong> {selectedProductForModal.timesText}
                  </p>
                </div>

                {/* Pasos de Personalización */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    ¿Cómo solicitar tu modelo personalizado?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProductForModal.steps.map((st, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
                        {st}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Qué incluye */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    El paquete incluye:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700">
                    {selectedProductForModal.includes.map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Botón de Cotización por WhatsApp */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Precio de Cotización Base</span>
                  <span className="text-lg font-black font-mono text-[#17251E]">{selectedProductForModal.priceEstimate}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(selectedProductForModal)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2D4F3E] hover:bg-[#17251E] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Enviar fotos y cotizar por WhatsApp</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

