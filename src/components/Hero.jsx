import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageCircle, Sparkles, Printer3d, Flame, Layers, Wand2, Shirt } from 'lucide-react';
import MonthlyEventBanner from './MonthlyEventBanner';

export default function Hero({
  onExploreCatalog,
  onOpenWorld,
  settings,
  campaignsConfig: initialCampaignsConfig
}) {
  const [campaignsConfig, setCampaignsConfig] = useState(initialCampaignsConfig || null);

  // Sincronización de campañas o carga fallback desde la API
  useEffect(() => {
    if (initialCampaignsConfig) {
      setCampaignsConfig(initialCampaignsConfig);
    } else {
      fetch('/api/campaigns')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data) setCampaignsConfig(data);
        })
        .catch(() => {});
    }
  }, [initialCampaignsConfig]);

  // 5 Diapositivas de Novedades de Temporada para la pestaña de carátula
  const seasonalSlides = [
    {
      id: 'hogar-estilo',
      image: '/uploads/img_001.jpg',
      categoryTag: 'Hogar & Estilo',
      badge: 'Novedad de Temporada',
      title: 'Colección Hogar y Estilo',
      description: 'Lámpara moderna T38 · Maceta espiral T6 · Colgador Bienvenidos L14',
      worldId: 'hogar'
    },
    {
      id: 'branding-comercial',
      image: '/uploads/pack_barberia_boutique_contexto.jpg',
      categoryTag: 'Negocios & Marcas',
      badge: 'Temporada Comercial',
      title: 'Branding Comercial & Mostrador',
      description: 'Soportes verticales QR · Enlaces NFC inteligentes · Letreros 3D',
      worldId: 'negocios'
    },
    {
      id: 'bodas-eventos',
      image: '/uploads/bienvenida_ceremonia_boda.jpg',
      categoryTag: 'Bodas & Eventos',
      badge: 'Edición Especial Ceremonias',
      title: 'Colección Bodas & Celebraciones',
      description: 'Letreros de bienvenida · Copas grabadas · Recuerdos en madera',
      worldId: 'eventos'
    },
    {
      id: 'setup-gamer',
      image: '/uploads/kit_home_office_gamer_contexto.jpg',
      categoryTag: 'Setup & Gaming',
      badge: 'Lanzamiento de Taller',
      title: 'Setup Gamer & Home Office',
      description: 'Smart Deck · Soporte para audífonos · Organizador modular 3D',
      worldId: 'hogar'
    },
    {
      id: 'linea-termica',
      image: '/uploads/sublimacion_taza_tarro_contexto.jpg',
      categoryTag: 'Sublimación & Textil',
      badge: 'Novedad Térmica',
      title: 'Línea Térmica & Personalizada',
      description: 'Tazas mágicas de revelado térmico · Tarros cerveceros · Termos láser',
      worldId: 'personalizados'
    }
  ];

  const techniques = [
    { name: 'Impresión 3D', icon: Printer3d },
    { name: 'Corte Láser', icon: Flame },
    { name: 'Sublimación', icon: Layers },
    { name: 'Impresión DTF', icon: Shirt },
    { name: 'Vinil & Textil', icon: Wand2 },
    { name: 'Soluciones NFC', icon: Sparkles }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F7F4EC] via-[#FBF9F5] to-[#FBF9F5] border-b border-[#E8E4DA]/80">
      
      {/* Sutil resplandor ambiental orgánico */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4A359]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#2D4F3E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pt-8 lg:pb-16 space-y-9 relative z-10">
        
        {/* 1. BANNER COMERCIAL Y ESCAPARATE DE TEMPORADA COMO CABEZAL PRINCIPAL (SIN TEXTO ENCIMA) */}
        <div>
          <MonthlyEventBanner
            eventsConfig={campaignsConfig?.monthlyEvents}
            seasonalEffect={campaignsConfig?.seasonalEffect}
            activeTheme={campaignsConfig?.accentTheme || campaignsConfig?.seasonalEffect || 'clasico'}
            textColorMode={campaignsConfig?.textColorMode || 'auto'}
            onExploreClick={onExploreCatalog}
            onOpenWorld={onOpenWorld}
            showShowcaseTab={true}
            showcaseSlides={campaignsConfig?.monthlyEvents?.showcaseSlides || campaignsConfig?.showcaseSlides || seasonalSlides}
            className="w-full shadow-2xl"
          />
        </div>

        {/* 2. SECCIÓN EDITORIAL Y PROPUESTA DE VALOR: "Si lo piensas, se hace." (UBICADA DEBAJO DEL BANNER) */}
        <div className="pt-8 border-t border-[#E8E4DA]/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            {/* LADO IZQUIERDO (lg:col-span-7): Propuesta de valor, tipografía editorial y técnicas */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E8E4DA] text-xs font-semibold text-[#17251E] shadow-2xs backdrop-blur-xs font-sans">
                <span className="w-2 h-2 rounded-full bg-[#2D4F3E] animate-pulse shrink-0" />
                <span className="tracking-widest uppercase text-[10px] font-bold text-stone-600 font-heading font-futura">
                  Taller de Diseño &amp; Manufactura
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500 font-medium text-[11px]">San Luis Potosí</span>
              </div>

              {/* Titular Principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17251E] tracking-tight leading-[1.1] font-heading font-futura">
                Si lo piensas,{' '}
                <span className="text-[#2D4F3E] underline decoration-[#D4A359]/60 underline-offset-8">
                  se hace.
                </span>
              </h1>

              {/* Subtítulo Editorial */}
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl font-normal font-sans">
                Diseño, personalización y manufactura de piezas únicas para tu hogar, tu marca comercial o tus eventos más memorables. Sin mínimos forzados y con atención directa de taller.
              </p>

              {/* Barra Curada de Técnicas de Manufactura */}
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline font-sans">
                    Técnicas:
                  </span>
                  {techniques.map(tech => {
                    const Icon = tech.icon;
                    return (
                      <span
                        key={tech.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 border border-[#E8E4DA] text-stone-700 hover:text-[#2D4F3E] hover:border-[#2D4F3E]/40 hover:bg-white transition-all shadow-2xs font-sans"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#2D4F3E]" />
                        <span>{tech.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LADO DERECHO (lg:col-span-5): Botones de Acción Refinados & Puntos de Confianza */}
            <div className="lg:col-span-5 flex flex-col items-stretch sm:items-start lg:items-end justify-center gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#17251E] text-white text-xs sm:text-sm font-bold tracking-wide hover:bg-[#2D4F3E] active:scale-98 transition-all shadow-md shadow-[#17251E]/15 cursor-pointer group font-heading font-futura"
                >
                  <span>Explorar el catálogo</span>
                  <ArrowRight className="w-4 h-4 text-[#D4A359] group-hover:translate-x-1 transition-transform" />
                </button>

                {settings?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hola%20Artesano%20Digital,%20quiero%20cotizar%20un%20proyecto.`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#17251E] border border-[#E8E4DA] text-xs sm:text-sm font-bold hover:bg-stone-50 active:scale-98 transition-all shadow-2xs font-heading font-futura"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Cotizar proyecto</span>
                  </a>
                )}
              </div>

              {/* Puntos de Confianza del Taller */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-stone-500 font-medium font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#D4A359] font-black">✦</span> Sin mínimos forzados
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#D4A359] font-black">✦</span> Envíos a todo México
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#D4A359] font-black">✦</span> Asesoría directa de taller
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
