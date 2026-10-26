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
      
      {/* Barra de Control y Navegación de Servicios (Fila única ultra compacta) */}
      <header className="sticky top-0 z-40 bg-[#0E1218]/95 backdrop-blur-md border-b border-stone-800 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          
          {/* Lado izquierdo: Botón Único de Volver a la Tienda */}
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-bold text-stone-200 hover:text-white border border-white/10 transition-all cursor-pointer shadow-xs shrink-0"
            title="Volver a la Tienda Principal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e8b84f]" />
            <span className="hidden sm:inline">Volver a la</span>
            <span>Tienda</span>
          </button>

          {/* Lado central/derecho: Selector de Pestañas directamente en la misma barra superior (sin segunda fila) */}
          <div className="flex items-center p-0.5 sm:p-1 bg-[#141821] rounded-xl sm:rounded-2xl border border-stone-700/80 shadow-inner flex-1 sm:flex-initial justify-end max-w-xl">
            
            {/* Pestaña 1: Diseño y Publicidad */}
            <button
              type="button"
              onClick={() => handleTabSwitch('diseno')}
              className={`flex-1 sm:flex-initial px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
                activeTab === 'diseno'
                  ? 'bg-gradient-to-r from-[#e8b84f] to-[#d4a359] text-[#0A0D11] shadow-md ring-1 ring-[#e8b84f]/50'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                activeTab === 'diseno'
                  ? 'bg-black/20 text-[#0A0D11] border-black/20'
                  : 'bg-[#e8b84f]/15 text-[#e8b84f] border-[#e8b84f]/30'
              }`}>
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="truncate">
                <span className="inline sm:hidden">Diseño</span>
                <span className="hidden sm:inline">Diseño y Publicidad</span>
              </span>
            </button>

            {/* Pestaña 2: Industria y Manufactura (Engrane ampliado y unido al texto) */}
            <button
              type="button"
              onClick={() => handleTabSwitch('industria')}
              className={`flex-1 sm:flex-initial px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
                activeTab === 'industria'
                  ? 'bg-gradient-to-r from-[#5BB8FF] to-[#3B82F6] text-[#0A0E11] shadow-md ring-1 ring-[#5BB8FF]/50'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                activeTab === 'industria'
                  ? 'bg-black/20 text-[#0A0E11] border-black/20'
                  : 'bg-[#5BB8FF]/15 text-[#5BB8FF] border-[#5BB8FF]/30'
              }`}>
                <Cog className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-[spin_12s_linear_infinite]" />
              </div>
              <span className="truncate">
                <span className="inline sm:hidden">Industria</span>
                <span className="hidden sm:inline">Industria y Manufactura</span>
              </span>
            </button>

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
