import React, { useState } from 'react';
import {
  Sparkles,
  Dog,
  Heart,
  GraduationCap,
  Users,
  Smile,
  Palette,
  Package,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  X,
  ArrowRight,
  Clock,
  Layers,
  Camera
} from 'lucide-react';

export default function CustomProductsSection({
  settings,
  onGoHome,
  onSelectProduct,
  onAddToCart,
  onOpenCalculator
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'mascotas' | 'parejas' | 'profesiones' | 'amigos' | 'familia' | 'dibujo'
  const [expandedId, setExpandedId] = useState(null); // id of expanded card details
  const [lightboxPoster, setLightboxPoster] = useState(null); // 'funko' | 'dibujo' | null
  
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // 6 Productos Personalizados Individuales con enfoque comercial de taller
  const customProducts = [
    {
      id: 'mascotas',
      category: 'mascotas',
      icon: Dog,
      badge: 'POP! Custom · Peludos & Compañeros',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      accentColor: 'border-amber-400/50',
      title: 'Figura Funko Custom — Mascotas',
      tagline: 'Tu perrito, gatito o animal de compañía en volumen 3D',
      priceEstimate: 'Desde $650 MXN',
      leadTime: '3 a 5 días de elaboración',
      image: '/uploads/personalizados-figuras-funko.jpg',
      posterType: 'funko',
      shortDesc: 'Inmortalizamos a tu mejor amigo de cuatro patas con sus manchas, pelaje, collar con placa y sus rasgos únicos, acompañado de su caja POP! Custom con ventana transparente y su nombre.',
      idealFor: 'Perritos, gatitos, conejos, aves y recuerdos entrañables de vida.',
      steps: [
        '1. Envíanos fotos claras de tu mascota (frente, lomo y collar).',
        '2. Modelamos la figura en 3D respetando sus manchas y fisionomía.',
        '3. Imprimimos en 3D con alta definición y aplicamos acabados a color.',
        '4. Diseñamos la caja POP! con su nombre y te entregamos la pieza lista para presumir.'
      ],
      includes: [
        'Figura 3D personalizada de tu mascota',
        'Caja POP! Custom con ventana transparente y nombre',
        'Acabado protegido para exhibición duradera',
        'Asesoría directa de taller durante todo el proceso'
      ],
      whatsappText: `Hola Artesano Digital,
Me interesa cotizar una *Figura Estilo Funko Personalizada para mi Mascota*:
• Tipo de mascota (perro, gato, otro):
• Nombre de mi mascota:
• Cuento con fotos de referencia para su modelado y su caja POP! Custom.
¿Podrían darme informes sobre tiempos de entrega y costo?`
    },
    {
      id: 'parejas',
      category: 'parejas',
      icon: Heart,
      badge: 'POP! Custom · Amor & Aniversarios',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      accentColor: 'border-rose-400/50',
      title: 'Figura Funko Custom — Parejas',
      tagline: 'El regalo más romántico, original y memorable para dos',
      priceEstimate: 'Desde $1,250 MXN (Set Doble)',
      leadTime: '4 a 6 días de elaboración',
      image: '/uploads/personalizados-figuras-funko.jpg',
      posterType: 'funko',
      shortDesc: 'Set de figuras personalizadas para novios, esposos o aniversarios. Reproducimos sus outfits favoritos, peinados, poses cómplices y caja conmemorativa doble o individual.',
      idealFor: 'Aniversarios, bodas, novios, San Valentín y fechas inolvidables.',
      steps: [
        '1. Envíanos fotos de la pareja y la vestimenta que desean recrear.',
        '2. Diseñamos el modelo 3D digital con los rasgos y poses elegidas.',
        '3. Fabricamos en 3D con materiales de alta durabilidad.',
        '4. Entregamos las figuras en su caja personalizada con sus nombres y fecha.'
      ],
      includes: [
        'Set de 2 figuras 3D personalizadas (o figura doble)',
        'Caja de colección con nombres, fecha o dedicatoria',
        'Vestimenta y peinados personalizados según tus fotos',
        'Envío seguro a cualquier parte de la República'
      ],
      whatsappText: `Hola Artesano Digital,
Me interesa cotizar una *Figura Estilo Funko Personalizada de Pareja*:
• Ocasión: (Aniversario / Boda / Cumpleaños / Regalo especial)
• Cuento con fotos de ambos para los outfits y peinados.
¿Podrían darme informes sobre opciones y tiempos de entrega?`
    },
    {
      id: 'profesiones',
      category: 'profesiones',
      icon: GraduationCap,
      badge: 'POP! Custom · Éxito & Vocación',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      accentColor: 'border-emerald-400/50',
      title: 'Figura Funko Custom — Profesiones & Graduaciones',
      tagline: 'Celebra su vocación profesional, graduación o ascenso',
      priceEstimate: 'Desde $680 MXN',
      leadTime: '3 a 5 días de elaboración',
      image: '/uploads/personalizados-figuras-funko.jpg',
      posterType: 'funko',
      shortDesc: 'Médicos con bata y estetoscopio, ingenieros con casco y planos, enfermeros, abogados, maestros, veterinarios, chefs o deportistas con uniforme oficial y caja conmemorativa.',
      idealFor: 'Graduaciones universitarias, ascensos, médicos, ingenieros, maestros y oficios.',
      steps: [
        '1. Envíanos foto de la persona y del uniforme o vestimenta profesional.',
        '2. Modelamos los accesorios clave (estetoscopio, birrete, herramientas, etc.).',
        '3. Impresión 3D y detallado cuidadoso de taller.',
        '4. Empaque en caja POP! con su título profesional y dedicatoria.'
      ],
      includes: [
        'Figura 3D con uniforme y accesorios profesionales',
        'Caja POP! Custom con título, profesión y nombre',
        'Muestra digital previa para tu confirmación',
        'Acabado resistente listo para escritorio o consultorio'
      ],
      whatsappText: `Hola Artesano Digital,
Me interesa cotizar una *Figura Estilo Funko Personalizada de Profesión*:
• Profesión / Especialidad:
• Ocasión: (Graduación / Titulación / Regalo de trabajo)
• Cuento con fotos de referencia del uniforme y accesorios.
¿Podrían orientarme sobre tiempos y costo?`
    },
    {
      id: 'amigos',
      category: 'amigos',
      icon: Users,
      badge: 'POP! Custom · Amistad & Aventuras',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      accentColor: 'border-blue-400/50',
      title: 'Figura Funko Custom — Amigos & Cumpleaños',
      tagline: 'Para ese amigo o amiga que siempre está ahí',
      priceEstimate: 'Desde $650 MXN',
      leadTime: '3 a 5 días de elaboración',
      image: '/uploads/personalizados-figuras-funko.jpg',
      posterType: 'funko',
      shortDesc: 'Inmortaliza anécdotas, vestimentas icónicas, gustos musicales o pasatiempos de tu mejor amigo(a). Un regalo entrañable que nadie más podrá darle.',
      idealFor: 'Cumpleaños de mejores amigos, despedidas, intercambios y reuniones épicas.',
      steps: [
        '1. Envíanos fotos de tu amigo(a) y platícanos sus hobbies o accesorios favoritos.',
        '2. Creamos la pose y vestimenta digital característica.',
        '3. Imprimimos con filamento de alta resistencia.',
        '4. Recibes la pieza con su caja personalizada lista para regalar.'
      ],
      includes: [
        'Figura 3D estilo Funko con accesorios de pasatiempos',
        'Caja POP! Custom con apodos, frases o dedicatoria',
        'Diseño simpático y coleccionable',
        'Envío cuidadoso a todo México'
      ],
      whatsappText: `Hola Artesano Digital,
Me interesa cotizar una *Figura Estilo Funko Personalizada para mi Amigo(a)*:
• Motivo / Ocasión: (Cumpleaños / Agradecimiento / Recuerdo)
• Cuento con fotos de sus outfits y detalles característicos.
¿Podrían darme informes de cotización?`
    },
    {
      id: 'familia',
      category: 'familia',
      icon: Smile,
      badge: 'POP! Custom · Familia & Hogar',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      accentColor: 'border-purple-400/50',
      title: 'Figura Funko Custom — Familia & Abuelitos',
      tagline: 'El detalle más entrañable para papás, mamás o abuelitos',
      priceEstimate: 'Desde $680 MXN',
      leadTime: '3 a 5 días de elaboración',
      image: '/uploads/personalizados-figuras-funko.jpg',
      posterType: 'funko',
      shortDesc: 'El regalo más conmovedor para el Día del Padre, Día de la Madre o Navidad. Figuras que capturan la ternura de tus padres, abuelitos o hijos con todo el cariño de manufactura de taller.',
      idealFor: 'Día del Padre, Día de la Madre, Navidad, cumpleaños de abuelos y retratos familiares.',
      steps: [
        '1. Envíanos fotos de tus familiares (papás, abuelitos o hijos).',
        '2. Modelamos los rasgos, lentes, peinados y su ropa favorita.',
        '3. Fabricamos en 3D con colores fieles y ensamble firme.',
        '4. Empacamos en caja conmemorativa para un momento inolvidable.'
      ],
      includes: [
        'Figura 3D familiar personalizada con rasgos distintivos',
        'Caja de colección con dedicatoria familiar emotiva',
        'Material duradero y seguro para exhibición en sala o recámara',
        'Asesoría personalizada en cada detalle'
      ],
      whatsappText: `Hola Artesano Digital,
Me interesa cotizar una *Figura Estilo Funko Personalizada de Familia*:
• Familiar a personalizar: (Mamá / Papá / Abuelito(a) / Hijo(a))
• Cuento con fotos de referencia para diseñar su figura y caja.
¿Podrían darme informes sobre tiempos de elaboración?`
    },
    {
      id: 'dibujo-nino',
      category: 'dibujo',
      icon: Palette,
      badge: 'Creatividad Infantil · De Boceto a 3D',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      accentColor: 'border-sky-500 ring-2 ring-sky-400/30',
      isSpecialDrawing: true,
      title: 'Crea tu Personaje 3D desde un Dibujo Infantil',
      tagline: '¡El dibujo o boceto de tu pequeño, ahora en volumen real!',
      priceEstimate: 'Desde $580 MXN',
      leadTime: '3 a 6 días de elaboración',
      image: '/uploads/personalizados-dibujo-figura-3d.jpg',
      posterType: 'dibujo',
      shortDesc: '¿Tienes un dibujo de tu pequeño? Nosotros lo convertimos en una figura 3D física única. Dragones, monstruos, superhéroes, autos, mascotas o personajes fantásticos con los colores y trazos fieles a su imaginación.',
      idealFor: 'Niños, papás coleccionistas, cumpleaños y conservar la etapa más creativa de tus hijos.',
      steps: [
        '1. Tu dibujo: Nos mandas la foto del dibujo de tu hijo (a mano o digital).',
        '2. Lo digitalizamos: Nuestro equipo lo convierte en modelo 3D respetando cada trazo.',
        '3. Imprimimos en 3D: Tecnología de alta precisión para darle volumen y forma.',
        '4. ¡Tu figura real!: Escultura física terminada, lista para decorar, coleccionar o regalar.'
      ],
      includes: [
        'Digitalización y modelado 3D profesional a partir del dibujo',
        'Impresión 3D de alta definición en volumen real',
        'Acabados a color respetando la paleta original del niño',
        'Pieza única e irrepetible que atesorarán para siempre'
      ],
      whatsappText: `Hola Artesano Digital,
Tengo un *Dibujo / Boceto de mi hijo* y me encantaría convertirlo en una *Figura 3D Física*:
• Tengo la foto del dibujo lista para enviárselas.
¿Podrían apoyarme con la cotización de digitalización e impresión 3D?`
    }
  ];

  const filteredProducts = activeFilter === 'all'
    ? customProducts
    : customProducts.filter(p => p.category === activeFilter);

  const handleSendWhatsApp = (product) => {
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(product.whatsappText)}`;
    window.open(url, '_blank');
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#FAF9F5] text-stone-900 min-h-screen">
      
      {/* 1. HERO INSTITUCIONAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#101215] via-[#171a1f] to-[#1F2421] text-white pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        
        {/* Glow de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#e8b84f]">
            <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
            <span>Taller de Creaciones Únicas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.08] text-white">
            Productos <span className="text-[#e8b84f]">Personalizados</span>
          </h1>

          <p className="text-xs sm:text-base text-stone-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Convertimos tus fotografías más queridas y los bocetos de tus pequeños en figuras tridimensionales reales, coleccionables y listas para presumir o regalar.
          </p>

          <div className="inline-flex items-center gap-2 pt-1 text-[11px] font-bold text-amber-300/90 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/20">
            <span>6 Categorías Exclusivas de Taller</span>
          </div>

        </div>

      </section>

      {/* 2. BARRA DE PESTAÑAS / FILTROS (Móvil Primero - Desplazable) */}
      <div className="sticky top-20 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 py-2">
          
          {/* Categorías Deslizables */}
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'all', label: 'Todos (6)' },
              { id: 'mascotas', label: 'Mascotas' },
              { id: 'parejas', label: 'Parejas' },
              { id: 'profesiones', label: 'Profesiones' },
              { id: 'amigos', label: 'Amigos' },
              { id: 'familia', label: 'Familia' },
              { id: 'dibujo', label: 'Dibujo a 3D' }
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs text-stone-500 hover:text-stone-900 font-medium shrink-0 ml-2 cursor-pointer hidden sm:block"
            >
              ← Volver a Tienda
            </button>
          )}

        </div>
      </div>

      {/* 3. CATÁLOGO DE PRODUCTOS PERSONALIZADOS SEPARADOS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

        {/* Encabezado de Sección */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-stone-900">
              {activeFilter === 'all' ? 'Modelos y Servicios Personalizados' : `Categoría: ${activeFilter.toUpperCase()}`}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Cada proyecto se elabora desde cero con fotos o bocetos de referencia.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'modelo' : 'modelos'}
          </span>
        </div>

        {/* Grid de Productos Individuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const IconComponent = prod.icon;
            const isExpanded = expandedId === prod.id;
            const isDrawing = prod.category === 'dibujo';

            return (
              <div
                key={prod.id}
                className={`rounded-3xl bg-white border overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isDrawing
                    ? 'border-sky-400 ring-2 ring-sky-300/40'
                    : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                {/* Parte Superior: Imagen de Muestra + Badge */}
                <div>
                  <div className="relative aspect-[4/3] bg-[#101215] overflow-hidden group cursor-pointer"
                       onClick={() => setLightboxPoster(prod.posterType)}
                       title="Toca para ver el póster en alta resolución">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/brand/og_artesano_preview.jpg';
                      }}
                    />

                    {/* Botón de Zoom / Lightbox */}
                    <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-md transition-all shadow-md">
                      <ZoomIn className="w-4 h-4" />
                    </div>

                    {/* Badge de Categoría */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${prod.badgeColor}`}>
                        {prod.badge}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-4 sm:p-5 space-y-3">
                    
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded-xl bg-stone-100 text-[#17251E] shrink-0 mt-0.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 leading-snug">
                          {prod.title}
                        </h3>
                        <p className="text-xs text-amber-700 font-bold mt-0.5">
                          {prod.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-normal">
                      {prod.shortDesc}
                    </p>

                    {/* Precios y Plazos */}
                    <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200">
                      <div>
                        <span className="text-stone-400 block text-[9.5px] uppercase font-bold">Inversión</span>
                        <span className="font-black font-mono text-[#17251E] text-xs sm:text-sm">{prod.priceEstimate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-400 block text-[9.5px] uppercase font-bold">Producción</span>
                        <span className="font-bold text-stone-700 text-xs flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-stone-400 inline" />
                          <span>{prod.leadTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Desplegable de Pasos y Qué incluye (Pestaña compacta para celular) */}
                    <div className="border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleExpand(prod.id)}
                        className="w-full px-3 py-2 text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-stone-500" />
                          <span>{isExpanded ? 'Ocultar proceso y detalles' : 'Ver cómo se hace y qué incluye'}</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-white space-y-3 text-xs border-t border-stone-200 animate-fadeIn">
                          <div>
                            <span className="font-bold text-stone-900 block mb-1">Paso a paso de taller:</span>
                            <ul className="space-y-1 text-stone-600 text-[11px]">
                              {prod.steps.map((st, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full bg-stone-200 text-stone-800 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span>{st}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2 border-t border-stone-100">
                            <span className="font-bold text-stone-900 block mb-1">Tu pedido incluye:</span>
                            <ul className="space-y-1 text-stone-600 text-[11px]">
                              {prod.includes.map((inc, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{inc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Parte Inferior: Botón de WhatsApp Directo */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(prod)}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Cotizar este modelo por WhatsApp</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* 4. BANNER INFORMATIVO DE PROCESO DE TALLER */}
        <div className="rounded-3xl bg-gradient-to-r from-[#17251E] to-[#223d2e] text-white p-6 sm:p-8 border border-white/10 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e8b84f] bg-white/10 px-3 py-1 rounded-full">
                Garantía de Satisfacción Artesano
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-white">
                Muestra Digital Previa a la Impresión
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                Antes de mandar tu pieza a fabricar, te enviamos la vista 3D por WhatsApp para confirmar rasgos, detalles y colores. ¡Cero sorpresas!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setLightboxPoster('funko')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Ver Póster Funko</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxPoster('dibujo')}
                className="px-4 py-2.5 rounded-xl bg-[#e8b84f] hover:bg-[#d8a83f] text-[#121519] text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Ver Póster Dibujo a 3D</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* 5. MODAL LIGHTBOX EN ALTA RESOLUCIÓN */}
      {lightboxPoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setLightboxPoster(null)}
        >
          <div
            className="relative bg-[#101215] rounded-3xl overflow-hidden max-w-3xl w-full border border-white/20 shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Lightbox */}
            <div className="p-3 sm:p-4 bg-black/60 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xs sm:text-sm text-white">
                  {lightboxPoster === 'funko' ? 'Póster Oficial: Figuras Estilo Funko' : 'Póster Oficial: ¿Tienes un dibujo? Lo convertimos en Figura 3D'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPoster(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagen en gran formato */}
            <div className="p-2 sm:p-4 flex items-center justify-center bg-black/95 max-h-[75vh] overflow-auto">
              <img
                src={lightboxPoster === 'funko' ? '/uploads/personalizados-figuras-funko.jpg' : '/uploads/personalizados-dibujo-figura-3d.jpg'}
                alt="Póster en alta resolución"
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            {/* Footer con Acción */}
            <div className="p-3 sm:p-4 bg-[#17251E] border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-stone-300 hidden sm:inline">
                Resolución oficial de taller · Envía tu imagen para iniciar
              </span>
              <button
                type="button"
                onClick={() => {
                  const target = customProducts.find(p => p.posterType === lightboxPoster) || customProducts[0];
                  handleSendWhatsApp(target);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ml-auto"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Cotizar este servicio por WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
