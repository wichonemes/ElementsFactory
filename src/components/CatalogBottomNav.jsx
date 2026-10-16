import React from 'react';
import {
  Home, Briefcase, CalendarHeart, Gift, Sparkles,
  ArrowRight, ChevronRight, RotateCw, Layers, CheckCircle2,
  Package, Flame, ShoppingBag
} from 'lucide-react';

export default function CatalogBottomNav({
  activeWorld = 'all',
  currentWorldName,
  onSelectWorld,
  onSelectPackages,
  onScrollToTop
}) {
  // Configuración de las 3 áreas de productos individuales
  const areasConfig = [
    {
      id: 'hogar',
      name: 'Hogar',
      fullName: 'Hogar & Decoración',
      count: 31,
      icon: Home,
      color: 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Organización, decoración y detalles personales'
    },
    {
      id: 'negocios',
      name: 'Negocios',
      fullName: 'Negocios & Marcas',
      count: 29,
      icon: Briefcase,
      color: 'bg-amber-50/70 text-amber-900 border-amber-200 hover:border-amber-500 hover:bg-amber-50',
      badgeColor: 'bg-amber-100 text-amber-800',
      desc: 'Señalética inteligente, QR/NFC e identidad'
    },
    {
      id: 'eventos',
      name: 'Eventos Especiales',
      fullName: 'Eventos & Celebraciones',
      count: 34,
      icon: CalendarHeart,
      color: 'bg-rose-50/70 text-rose-900 border-rose-200 hover:border-rose-500 hover:bg-rose-50',
      badgeColor: 'bg-rose-100 text-rose-800',
      desc: 'Recuerdos de bodas, XV años y graduaciones'
    }
  ];

  // Configuración de los Paquetes por Área (Lo más importante solicitado)
  const packagesConfig = [
    {
      id: 'hogar',
      areaName: 'Hogar & Decoración',
      badge: '3 Combos Listos',
      savings: 'Ahorra hasta $130 MXN',
      title: 'Paquetes de Hogar',
      items: [
        'Combo Recibidor Cálido (4 pzas)',
        'Kit Home Office & Gamer Pro (4 pzas)',
        'Pack Consentido Peludo (Mascotas - 4 pzas)'
      ],
      startingPrice: '$299 MXN',
      icon: Home,
      accentColor: 'text-emerald-400',
      borderHover: 'hover:border-emerald-400'
    },
    {
      id: 'negocios',
      areaName: 'Negocios & Marcas',
      badge: '3 Combos Comerciales',
      savings: 'Ahorra hasta $680 MXN',
      title: 'Paquetes de Negocios',
      items: [
        'Súper Pack Restaurante & Café (16 pzas)',
        'Kit Mostrador Smart QR+NFC (10 pzas)',
        'Starter Pack Barbería & Boutique (27 pzas)'
      ],
      startingPrice: '$780 MXN',
      icon: Briefcase,
      accentColor: 'text-amber-400',
      borderHover: 'hover:border-amber-400'
    },
    {
      id: 'eventos',
      areaName: 'Eventos Especiales',
      badge: '3 Combos + Patch Bar',
      savings: 'Ahorra hasta $1,800 MXN',
      title: 'Paquetes de Eventos',
      items: [
        'Paquete Boda de Ensueño (Todo Incluido)',
        'Combo Fiesta Total (Patch Bar en Vivo)',
        'Set XV Años & Graduaciones (37 pzas)'
      ],
      startingPrice: '$1,750 MXN',
      icon: CalendarHeart,
      accentColor: 'text-rose-400',
      borderHover: 'hover:border-rose-400'
    }
  ];

  // Áreas alternativas para navegar (excluyendo la que está activa actualmente)
  const otherAreas = areasConfig.filter(a => a.id !== activeWorld);

  return (
    <nav 
      aria-label="Navegación entre áreas y paquetes al final del catálogo" 
      className="pt-8 pb-12 space-y-8 mt-8 border-t border-[#E8E4DA]"
    >
      {/* Botón superior de regreso suave al inicio de la colección */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onScrollToTop}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#E8E4DA] hover:border-[#2D4F3E] text-xs font-bold text-[#2D4F3E] hover:bg-[#F4F9F5] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#2D4F3E] group-hover:rotate-180 transition-transform duration-500" />
          <span>Volver al inicio de {currentWorldName || 'esta colección'}</span>
        </button>
      </div>

      {/* SECCIÓN 1: PAQUETES DE CADA ÁREA (Lo más importante solicitado) */}
      <section 
        aria-labelledby="heading-paquetes-por-area" 
        className="rounded-3xl bg-gradient-to-br from-[#17251E] via-[#203328] to-[#121B16] text-white p-5 sm:p-8 shadow-xl border-2 border-[#D4A359]/30 relative overflow-hidden"
      >
        {/* Resplandor decorativo suave */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A359]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Encabezado de la sección de paquetes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A359]/20 text-[#E5C378] text-[11px] font-black uppercase tracking-wider mb-2 border border-[#D4A359]/30">
                <Gift className="w-3.5 h-3.5" />
                <span>Lo más solicitado • Ahorro en volumen</span>
              </div>
              <h3 
                id="heading-paquetes-por-area" 
                className="text-xl sm:text-2xl font-bold font-futura tracking-tight text-white"
              >
                Paquetes y Combos de Cada Área
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                Varios productos coordinados con precio especial de taller, diseño incluido y envío exprés. Selecciona el área para ver sus paquetes listos:
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectPackages('all')}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
            >
              <Layers className="w-4 h-4 text-[#D4A359]" />
              <span>Ver todos los 9 paquetes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tarjetas de Paquetes de las 3 Áreas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packagesConfig.map(pkg => {
              const Icon = pkg.icon;
              const isCurrentArea = activeWorld === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl bg-white/5 border p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg ${
                    isCurrentArea 
                      ? 'border-[#D4A359] ring-2 ring-[#D4A359]/40 bg-white/10 shadow-md' 
                      : `border-white/10 ${pkg.borderHover}`
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#D4A359]/20 border border-[#D4A359]/30 flex items-center justify-center text-[#E5C378]">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-gray-300 block">
                          {pkg.badge}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#E5C378] block mt-0.5">
                          {pkg.savings}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{pkg.title}</span>
                        {isCurrentArea && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4A359] text-[#17251E] font-black uppercase">
                            Área Actual
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Desde <span className="font-bold text-white">{pkg.startingPrice}</span>
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-[11px] text-gray-300">
                      {pkg.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A359] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPackages(pkg.id)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#c28e38] hover:from-[#e5c378] hover:to-[#D4A359] text-[#17251E] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:shadow-lg active:scale-95"
                  >
                    <span>Ver {pkg.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECCIÓN 2: BOTONES PARA VISITAR LOS OTROS APARTADOS (Negocios, Eventos Especiales, Hogar) */}
      <section 
        aria-labelledby="heading-otros-apartados"
        className="bg-[#FAF7F0] border border-[#E8E4DA] rounded-3xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DA] pb-3">
          <div>
            <h4 
              id="heading-otros-apartados" 
              className="text-sm sm:text-base font-bold text-[#1F2421] flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#2D4F3E]" />
              <span>Explorar los Otros Apartados del Catálogo</span>
            </h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Salta directamente a explorar nuestras otras áreas de diseño y manufactura:
            </p>
          </div>

          {activeWorld !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectWorld('all')}
              className="text-xs font-bold text-[#2D4F3E] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Ver todo el catálogo (57 piezas)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Cuadrícula de botones de navegación entre áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {otherAreas.map(area => {
            const Icon = area.icon;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => onSelectWorld(area.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-white ${area.color}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current/20 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block text-[#1F2421] truncate">
                      Área {area.name}
                    </span>
                    <span className="text-[11px] text-gray-500 block leading-tight truncate">
                      {area.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${area.badgeColor}`}>
                    {area.count} prods
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            );
          })}

          {/* Tarjeta de Paquetes en caso de estar en 'all' */}
          {activeWorld === 'all' && (
            <button
              type="button"
              onClick={() => onSelectPackages('all')}
              className="p-3.5 sm:p-4 rounded-2xl border border-[#D4A359]/40 bg-[#FFFDF9] hover:bg-amber-50 text-left transition-all duration-200 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block text-[#1F2421]">
                    Paquetes & Servicios
                  </span>
                  <span className="text-[11px] text-gray-500 block leading-tight">
                    Combos con descuento y Patch Bar
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  9 combos
                </span>
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </div>
            </button>
          )}
        </div>
      </section>
    </nav>
  );
}
