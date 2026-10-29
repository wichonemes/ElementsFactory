import React from 'react';
import { Home, Briefcase, CalendarHeart, ArrowRight, Sparkles, Gamepad2, Cog, Gift, Layers } from 'lucide-react';

export default function WorldSelector({ worlds, activeWorld, onSelectWorld, categories }) {
  const worldIcons = {
    hogar: Home,
    negocios: Briefcase,
    juguetes: Gamepad2,
    personalizados: Sparkles,
    eventos: CalendarHeart,
    'paquetes-servicios': Gift,
    servicios: Layers,
    industria: Cog,
    'publicidad-desarrollo': Layers
  };

  const worldNumbers = {
    hogar: '01',
    negocios: '02',
    eventos: '03',
    personalizados: '04'
  };

  const ORDERED_WORLD_IDS = ['hogar', 'negocios', 'eventos', 'personalizados'];

  const displayWorlds = ORDERED_WORLD_IDS.map(id => {
    return worlds.find(w => w.id === id);
  }).filter(Boolean);

  return (
    <section id="areas-section" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      {/* Grid de las 4 Ãreas Maestras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {displayWorlds.map((world, idx) => {
          const Icon = worldIcons[world.id] || Home;
          const isSelected = activeWorld === world.id;
          const subcats = (world.categories || []).slice(0, 5);
          const worldNum = worldNumbers[world.id] || `0${idx + 1}`;

          return (
            <div
              key={world.id}
              onClick={() => onSelectWorld(world.id)}
              className={`cursor-pointer group rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between bg-white ${
                isSelected
                  ? 'border-[#2D4F3E] ring-2 ring-[#2D4F3E]/80 shadow-2xl translate-y-[-4px]'
                  : 'border-[#E8E4DA] hover:border-[#2D4F3E]/40 hover:shadow-xl hover:-translate-y-1.5'
              }`}
            >
              {/* Portada FotogrÃ¡fica */}
              <div className="relative h-60 sm:h-64 overflow-hidden bg-stone-100">
                <img loading="lazy"
                  src={world.image}
                  alt={world.name}
                  className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700"
                />
                
                {/* Degradado CinematogrÃ¡fico */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
                
                {/* Indicador NumÃ©rico y Tag de Ãrea */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-[#17251E] shadow-sm">
                    <Icon className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>{world.name}</span>
                  </span>

                  <span className="font-mono text-xs font-bold text-white/70 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                    {worldNum}
                  </span>
                </div>

                {/* TÃ­tulo y Tagline Inferior sobre la Foto */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-sm">
                    {world.name}
                  </h3>
                  <p className="text-xs text-stone-200 line-clamp-1 mt-0.5 font-normal">
                    {world.tagline}
                  </p>
                </div>
              </div>

              {/* Cuerpo de la Tarjeta */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  {world.description}
                </p>

                {/* SubcategorÃ­as disponibles en chips refinados */}
                {subcats.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Especialidades:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {subcats.map(cat => (
                        <span
                          key={cat.id}
                          className="px-2.5 py-1 rounded-lg bg-[#F7F4EC] border border-[#E8E4DA]/70 text-[#2D4F3E] text-[11px] font-medium"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AcciÃ³n de Entrada al Ãrea */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#17251E] group-hover:text-[#2D4F3E] transition-colors">
                  <span>{isSelected ? 'Ãrea seleccionada' : `Explorar ${world.name}`}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#2D4F3E] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 group-hover:bg-[#17251E] group-hover:text-white'
                  }`}>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

