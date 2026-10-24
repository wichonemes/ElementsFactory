import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Layers,
  Heart,
  Package,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Gift,
  HelpCircle,
  Clock,
  Palette
} from 'lucide-react';

export default function CustomProductsSection({
  settings,
  onGoHome,
  onSelectProduct,
  onAddToCart,
  onOpenCalculator
}) {
  const [activeItem, setActiveItem] = useState('funko'); // 'funko' | 'dibujo'
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  const handleSendFunkoWhatsApp = (style = 'General') => {
    const text = `Hola Artesano Digital,
Me interesa cotizar una *Figura Estilo Funko Personalizada*:

• *Modelo / Ocasión:* ${style}
• Cuento con fotos de referencia para diseñar la figura y su caja POP! Custom.
¿Podrían darme informes sobre tiempos de entrega y costo?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendDrawingWhatsApp = () => {
    const text = `Hola Artesano Digital,
Tengo un *Dibujo* y me encantaría convertirlo en una *Figura 3D Física*.

• Tengo la foto del dibujo lista para enviárselas.
¿Podrían apoyarme con la cotización de digitalización e impresión 3D?`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#FAF9F5] text-stone-900 min-h-screen">
      
      {/* 1. HERO INSTITUCIONAL DE PRODUCTO PERSONALIZADO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#101215] via-[#171a1f] to-[#1F2421] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        
        {/* Glow decorativo */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#e8b84f]">
            <Sparkles className="w-3.5 h-3.5 text-[#e8b84f]" />
            <span>Taller de Creaciones Únicas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.08] text-white">
            Productos <br className="sm:hidden" />
            <span className="text-[#e8b84f]">Personalizados</span>
          </h1>

          <p className="text-xs sm:text-base text-stone-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Convertimos tus fotografías más especiales y los dibujos de tus pequeños en figuras tridimensionales reales, coleccionables y listas para regalar.
          </p>

          {/* Selector de Pestaña Principal (Móvil Primero) */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveItem('funko')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md ${
                activeItem === 'funko'
                  ? 'bg-[#e8b84f] text-[#121519] ring-2 ring-white/20'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              Figuras Estilo Funko
            </button>
            <button
              type="button"
              onClick={() => setActiveItem('dibujo')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md ${
                activeItem === 'dibujo'
                  ? 'bg-[#38bdf8] text-[#121519] ring-2 ring-white/20'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              De Dibujo a Figura 3D
            </button>
          </div>

        </div>

      </section>

      {/* 2. BARRA DE NAVEGACIÓN COMPACTA */}
      <div className="sticky top-20 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 py-2">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveItem('funko')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeItem === 'funko'
                  ? 'bg-[#17251E] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Figuras Funko
            </button>

            <button
              type="button"
              onClick={() => setActiveItem('dibujo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeItem === 'dibujo'
                  ? 'bg-[#17251E] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              De Dibujo a Figura 3D
            </button>
          </div>

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="text-xs text-stone-500 hover:text-stone-900 font-medium shrink-0 ml-auto cursor-pointer"
            >
              ← Tienda
            </button>
          )}

        </div>
      </div>

      {/* 3. CONTENIDO SEGÚN PRODUCTO SELECCIONADO */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">

        {/* ================= PRODUCTO 1: FIGURAS FUNKO PERSONALIZADAS ================= */}
        {activeItem === 'funko' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Tarjeta Principal de Presentación */}
            <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Imagen del Póster Oficial */}
              <div className="lg:col-span-7 bg-[#101215] flex items-center justify-center p-2 sm:p-4">
                <img
                  src="/uploads/personalizados-figuras-funko.jpg"
                  alt="Figuras Funko Personalizadas - Artesano Digital"
                  className="w-full h-auto max-h-[640px] object-contain rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/brand/og_artesano_preview.jpg';
                  }}
                />
              </div>

              {/* Información Comercial y Acción Inmediata */}
              <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-3">
                  <div className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider">
                    POP! Custom 01 · Taller 3D
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-heading text-stone-900 leading-tight">
                    Figuras Funko <br />
                    <span className="text-amber-600">Personalizadas</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    Convierte a tus personas favoritas, a tu pareja o a tus mascotas en figuras 3D estilo Funko con su <strong>caja personalizada con ventana</strong> y nombres.
                  </p>

                  {/* 4 Pasos del Proceso */}
                  <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/80 space-y-2 mt-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-stone-800">
                      ¿Cómo funciona? (4 Pasos):
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-stone-700">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span><strong>Envíanos tu foto o idea:</strong> En pareja, familia, amigos o mascotas.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span><strong>Creamos el diseño 3D:</strong> Te mostramos el modelo digital previo.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span><strong>Imprimimos en 3D:</strong> Alta precisión y acabados duraderos.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                        <span><strong>Recibes tu figura:</strong> Lista para presumir, regalar o coleccionar.</span>
                      </div>
                    </div>
                  </div>

                  {/* Opciones Disponibles en Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Estilos más solicitados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Parejas', desc: 'Amor en cada detalle' },
                        { label: 'Familias', desc: 'Juntos siempre' },
                        { label: 'Amigos', desc: 'Las mejores aventuras' },
                        { label: 'Mascotas', desc: 'Ellos también son familia' },
                        { label: 'Individual', desc: 'Porque eres único' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendFunkoWhatsApp(item.label)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 text-xs font-bold transition-colors cursor-pointer border border-stone-200 text-left"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón de Cotización Directa */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleSendFunkoWhatsApp('General')}
                    className="w-full py-4 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Cotizar mi Figura Funko por WhatsApp</span>
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] text-stone-500 font-medium">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3 text-[#2D4F3E]" /> Incluye caja personalizada</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[#2D4F3E]" /> Envíos a todo México</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= PRODUCTO 2: DE DIBUJO A FIGURA 3D ================= */}
        {activeItem === 'dibujo' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Tarjeta Principal de Presentación */}
            <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Imagen del Póster Oficial */}
              <div className="lg:col-span-7 bg-[#101215] flex items-center justify-center p-2 sm:p-4">
                <img
                  src="/uploads/personalizados-de-dibujo-a-figura-3d.jpg"
                  alt="De Dibujo a Figura 3D - Artesano Digital"
                  className="w-full h-auto max-h-[640px] object-contain rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/brand/og_artesano_preview.jpg';
                  }}
                />
              </div>

              {/* Información Comercial y Acción Inmediata */}
              <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between space-y-6">
                
                <div className="space-y-3">
                  <div className="inline-block px-2.5 py-1 rounded-md bg-sky-100 text-sky-900 font-black text-[10px] uppercase tracking-wider">
                    Creatividad Infantil &amp; Colección
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-heading text-stone-900 leading-tight">
                    ¿Tienes un dibujo? <br />
                    <span className="text-sky-600">Lo convertimos en Figura 3D</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    ¡El dibujo de tu pequeño, ahora en volumen! Hacemos que su imaginación cobre vida en una escultura tridimensional que atesorarán para siempre.
                  </p>

                  {/* 4 Pasos del Proceso */}
                  <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-stone-200/80 space-y-2 mt-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-stone-800">
                      Paso a paso:
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-stone-700">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span><strong>Tu dibujo:</strong> Nos mandas foto del dibujo de tu hijo (a mano o digital).</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span><strong>Lo digitalizamos:</strong> Modelado 3D respetando cada trazo y su esencia.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span><strong>Imprimimos en 3D:</strong> Tecnología de alta definición y volumen real.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                        <span><strong>¡Tu figura real!:</strong> Lista para decorar, regalar o coleccionar.</span>
                      </div>
                    </div>
                  </div>

                  {/* Ejemplos de lo que se puede crear */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Ejemplos que creamos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Personajes favoritos',
                        'Mascotas',
                        'Videojuegos',
                        'Personajes originales',
                        'Autos y naves'
                      ].map((ex, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón de Cotización Directa */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleSendDrawingWhatsApp}
                    className="w-full py-4 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Enviar mi Dibujo por WhatsApp</span>
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] text-stone-500 font-medium">
                    <span className="flex items-center gap-1"><Palette className="w-3 h-3 text-[#2D4F3E]" /> Muestra previa digital</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[#2D4F3E]" /> Entrega en todo México</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}