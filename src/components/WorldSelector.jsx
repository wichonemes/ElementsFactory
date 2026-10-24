import React from 'react';
import { Home, Briefcase, CalendarHeart, ArrowRight, Sparkles, Gamepad2, Cog } from 'lucide-react';

export default function WorldSelector({ worlds, activeWorld, onSelectWorld, categories }) {
  const worldIcons = {
    hogar: Home,
    negocios: Briefcase,
    eventos: CalendarHeart,
    juguetes: Gamepad2,
    industria: Cog
  };

  const worldNumbers = {
    hogar: '01',
    negocios: '02',
    eventos: '03',
    juguetes: '04',
    industria: '05'
  };

  return (
    <section id="areas-section" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
      {/* Grid de las Áreas Maestras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {worlds.map((world, idx) => {
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
              {/* Portada Fotográfica */}
              <div className="relative h-60 sm:h-64 overflow-hidden bg-stone-100">
                <img
                  src={world.image}
                  alt={world.name}
                  className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700"
                />
                
                {/* Degradado Cinematográfico */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
                
                {/* Indicador Numérico y Tag de Área */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-[#17251E] shadow-sm">
                    <Icon className="w-3.5 h-3.5 text-[#2D4F3E]" />
                    <span>{world.name}</span>
                  </span>

                  <span className="font-mono text-xs font-bold text-white/70 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                    {worldNum}
                  </span>
                </div>

                {/* Título y Tagline Inferior sobre la Foto */}
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

                {/* Subcategorías disponibles en chips refinados */}
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

                {/* Acción de Entrada al Área */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#17251E] group-hover:text-[#2D4F3E] transition-colors">
                  <span>{isSelected ? 'Área seleccionada' : `Explorar ${world.name}`}</span>
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

      {/* Banner Especial: Productos Personalizados (Figuras Funko & Dibujos a 3D) */}
      <div
        onClick={() => onSelectWorld('personalizados')}
        className="mt-8 sm:mt-10 rounded-3xl bg-gradient-to-r from-[#17251E] via-[#223d2e] to-[#121519] text-white p-6 sm:p-8 border border-emerald-500/30 shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex -space-x-4 shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-white/30 p-0.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-md">
              <img
                src="/uploads/personalizados-figuras-funko.jpg"
                alt="Figuras Funko Personalizadas"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-sky-400/60 p-0.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-md">
              <img
                src="/uploads/personalizados-dibujo-figura-3d.jpg"
                alt="De Dibujo a Figura 3D"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                Nuevo · 6 Categorías
              </span>
              <span className="text-xs text-stone-300 font-medium">De tu foto o boceto a Figura 3D</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
              Productos Personalizados
            </h3>
            <p className="text-xs text-stone-200 max-w-2xl font-normal leading-relaxed">
              Figuras estilo Funko Pop (Mascotas, Parejas, Profesiones, Amigos, Familia) con caja de colección, y esculturas 3D creadas a partir del dibujo o boceto de tus pequeños.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4A359] text-[#121519] font-black text-xs group-hover:bg-[#e0b26b] transition-colors shadow-md">
          <span>Ver Personalizados</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Banner Especial: Publicidad & Desarrollo Digital */}
      <div
        onClick={() => onSelectWorld('publicidad-desarrollo')}
        className="mt-8 sm:mt-10 rounded-3xl bg-gradient-to-r from-[#121519] via-[#1a1f26] to-[#1F2421] text-white p-6 sm:p-8 border border-[#e8b84f]/40 shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#101215] border border-[#e8b84f]/40 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
            <img
              src="/maquetado-inicio-wicho-v2/assets/marca-wicho.png"
              alt="Wicho Nemes"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/brand/artesano_isotipo_transparente.png'; }}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e8b84f] bg-[#e8b84f]/15 px-2.5 py-0.5 rounded-full border border-[#e8b84f]/30">
                División Especial
              </span>
              <span className="text-xs text-stone-400 font-medium">Diseño, Gran Formato &amp; Código</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
              Publicidad &amp; Desarrollo Digital
            </h3>
            <p className="text-xs text-stone-300 max-w-2xl font-normal leading-relaxed">
              Branding corporativo, lonas de alta resistencia, rotulación en vinil, tiendas online interactivas y modelado 3D. Conoce el portafolio de Wicho Nemes.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#e8b84f] text-[#121519] font-black text-xs group-hover:bg-[#f2c25a] transition-colors shadow-md">
          <span>Ver Servicios &amp; Portafolio</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </section>
  );
}
