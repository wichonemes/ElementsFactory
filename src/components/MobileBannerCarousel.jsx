import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ChevronDown, ChevronUp, ArrowRight, Printer, Flame, Layers, Wand2 } from 'lucide-react';

export default function MobileBannerCarousel({
  slides = [],
  onSelectSlide,
  settings
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);

  // Slides por defecto si no vienen del servidor
  const defaultSlides = [
    {
      id: 'slide-1',
      title: 'Colección Hogar & Decoración',
      subtitle: 'Lámparas 3D, maceteros geométricos y percheros',
      badge: 'Novedades de Taller',
      image: '/uploads/img_001.jpg',
      worldId: 'hogar'
    },
    {
      id: 'slide-2',
      title: 'Branding Comercial & Mostrador',
      subtitle: 'Señalética inteligente, QR y enlaces NFC para negocios',
      badge: 'Soluciones para Negocios',
      image: '/uploads/pack_barberia_boutique_contexto.jpg',
      worldId: 'negocios'
    },
    {
      id: 'slide-3',
      title: 'Bodas, XV Años & Recuerdos',
      subtitle: 'Letreros de bienvenida, copas grabadas y souvenirs',
      badge: 'Eventos Especiales',
      image: '/uploads/bienvenida_ceremonia_boda.jpg',
      worldId: 'eventos'
    },
    {
      id: 'slide-4',
      title: 'Setup Gamer & Home Office',
      subtitle: 'Soportes de audífonos, bandejas y organizadores modulares',
      badge: 'Impresión 3D Pro',
      image: '/uploads/kit_home_office_gamer_contexto.jpg',
      worldId: 'hogar'
    }
  ];

  const activeSlides = (slides && slides.length > 0) ? slides : defaultSlides;

  // Auto-rotación cada 4.5 segundos
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % activeSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const activeSlide = activeSlides[currentIdx] || activeSlides[0];

  const techniques = [
    { name: 'Impresión 3D', icon: Printer },
    { name: 'Corte Láser', icon: Flame },
    { name: 'Sublimación', icon: Layers },
    { name: 'Vinil Textil', icon: Wand2 }
  ];

  return (
    <div className="md:hidden px-3 pt-2.5 pb-1 space-y-2">
      {/* 1. Carrusel Compacto estilo Mercado Libre (Altura ~140px a 160px) */}
      <div 
        className="relative h-36 sm:h-44 w-full rounded-2xl overflow-hidden shadow-sm border border-black/10 bg-stone-900 cursor-pointer group"
        onClick={() => {
          if (onSelectSlide && activeSlide?.worldId) {
            onSelectSlide(activeSlide.worldId);
          }
        }}
      >
        {/* Imagen de fondo */}
        <img
          src={activeSlide.image || '/uploads/img_001.jpg'}
          alt={activeSlide.title || 'Artesano Digital'}
          className="w-full h-full object-cover object-center transition-all duration-700 brightness-85"
        />

        {/* Degradado para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        {/* Contenido del Banner */}
        <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-white">
          {/* Badge superior */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4A359] text-[#17251E] font-black text-[10px] shadow-xs uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              <span>{activeSlide.badge || 'Novedad'}</span>
            </span>
            <span className="text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded-full">
              {currentIdx + 1}/{activeSlides.length}
            </span>
          </div>

          {/* Textos del Banner */}
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-extrabold leading-tight text-white drop-shadow-sm font-heading">
              {activeSlide.title}
            </h2>
            <p className="text-[11px] text-stone-200 line-clamp-1 leading-snug">
              {activeSlide.description || activeSlide.subtitle}
            </p>
          </div>
        </div>

        {/* Dots indicadores inferiores */}
        <div className="absolute bottom-1.5 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none">
          {activeSlides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx ? 'w-4 bg-[#D4A359]' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Cortinilla Desplegable / Colapsable ("Conoce nuestro taller ▾") */}
      <div className="rounded-xl border border-[#E8E4DA] bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setIsCurtainOpen(!isCurtainOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[#2D4F3E]">
            <span>✨</span>
            <span>Si lo piensas, se hace · Taller de Manufactura SLP</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
            <span>{isCurtainOpen ? 'Ocultar' : 'Ver más'}</span>
            {isCurtainOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {/* Contenido de la cortinilla que se despliega y se esconde */}
        {isCurtainOpen && (
          <div className="p-3 bg-[#FAF9F5] border-t border-[#E8E4DA] text-xs space-y-2.5 animate-fadeIn">
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Diseño, personalización y manufactura de piezas únicas en <strong>San Luis Potosí</strong> con envíos a todo México. Sin mínimos forzados y con atención directa de taller.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {techniques.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-gray-200 text-[11px] text-gray-700 font-medium">
                    <Icon className="w-3 h-3 text-[#2D4F3E] shrink-0" />
                    <span>{t.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
