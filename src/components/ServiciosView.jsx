import React, { useState, useEffect } from 'react';
import {
  Palette,
  Cog,
  ArrowLeft,
  Sparkles,
  Building2,
  ChevronRight,
  Home
} from 'lucide-react';
import PublicidadDesarrolloView from './PublicidadDesarrolloView';
import IndustriaView from './IndustriaView';

export default function ServiciosView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld,
  initialTab = 'diseno'
}) {
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab === 'industria' || initialTab === 'manufactura') return 'industria';
    return 'diseno';
  });

  // Sincronizar si cambia initialTab desde el padre
  useEffect(() => {
    if (initialTab === 'industria' || initialTab === 'manufactura') {
      setActiveTab('industria');
    } else if (initialTab === 'diseno' || initialTab === 'publicidad-desarrollo' || initialTab === 'publicidad') {
      setActiveTab('diseno');
    }
  }, [initialTab]);

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-white flex flex-col animate-fadeIn select-none">
      
      {/* Barra de Control y Navegación de Servicios */}
      <header className="sticky top-0 z-40 bg-[#0E1218]/95 backdrop-blur-md border-b border-stone-800 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            
            {/* Lado izquierdo: Volver a la tienda y Título */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onGoHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-bold text-stone-300 hover:text-white border border-white/10 transition-all cursor-pointer shadow-xs"
                title="Volver al catálogo principal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#e8b84f]" />
                <span className="hidden sm:inline">Volver a la</span>
                <span>Tienda</span>
              </button>

              <div className="h-5 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white font-heading">
                  Centro de Servicios
                </span>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-mono hidden lg:inline">
                  Artesano Digital
                </span>
              </div>
            </div>

            {/* Lado derecho: Selector de las 2 Pestañas Maestras */}
            <div className="flex items-center p-1 bg-[#141821] rounded-2xl border border-stone-700/80 shadow-inner w-full md:w-auto">
              
              {/* Pestaña 1: Diseño y Publicidad */}
              <button
                type="button"
                onClick={() => handleTabSwitch('diseno')}
                className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'diseno'
                    ? 'bg-gradient-to-r from-[#e8b84f] to-[#d4a359] text-[#0A0D11] shadow-lg shadow-amber-500/25 ring-1 ring-[#e8b84f]/50'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  activeTab === 'diseno'
                    ? 'bg-black/20 text-[#0A0D11] border-black/20'
                    : 'bg-[#e8b84f]/15 text-[#e8b84f] border-[#e8b84f]/30'
                }`}>
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <span>Diseño y Publicidad</span>
              </button>

              {/* Pestaña 2: Industria y Manufactura (Engrane ampliado y unido al texto) */}
              <button
                type="button"
                onClick={() => handleTabSwitch('industria')}
                className={`flex-1 md:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'industria'
                    ? 'bg-gradient-to-r from-[#5BB8FF] to-[#3B82F6] text-[#0A0E11] shadow-lg shadow-sky-500/25 ring-1 ring-[#5BB8FF]/50'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                  activeTab === 'industria'
                    ? 'bg-black/20 text-[#0A0E11] border-black/20'
                    : 'bg-[#5BB8FF]/15 text-[#5BB8FF] border-[#5BB8FF]/30'
                }`}>
                  <Cog className="w-4.5 h-4.5 animate-[spin_12s_linear_infinite]" />
                </div>
                <span>Industria y Manufactura</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Renderizado Condicional del Sub-Apartado Activo */}
      <main className="flex-1">
        {activeTab === 'diseno' ? (
          <PublicidadDesarrolloView
            settings={settings}
            onGoHome={onGoHome}
            onOpenCalculator={onOpenCalculator}
            onSelectWorld={onSelectWorld}
          />
        ) : (
          <IndustriaView
            settings={settings}
            onGoHome={onGoHome}
            onOpenCalculator={onOpenCalculator}
          />
        )}
      </main>

    </div>
  );
}
