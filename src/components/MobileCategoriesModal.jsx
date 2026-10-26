import React, { useState } from 'react';
import {
  ArrowLeft,
  Home,
  Briefcase,
  CalendarHeart,
  Gift,
  Wrench,
  Search,
  Sparkles,
  Printer,
  Flame,
  Palette,
  Scissors,
  Radio,
  Gamepad2,
  Cog,
  Globe,
  Box,
  Film,
  FileText
} from 'lucide-react';

export default function MobileCategoriesModal({
  isOpen,
  onClose,
  categories = [],
  worlds = [],
  onSelectWorld,
  onSelectCategory,
  onSelectTechnique
}) {
  if (!isOpen) return null;

  const [activeAreaTab, setActiveAreaTab] = useState('publicidad-desarrollo');

  // Áreas principales con sus códigos de color distintivos de marca
  const masterAreas = [
    {
      id: 'publicidad-desarrollo',
      name: 'Diseño y\nPublicidad',
      icon: Palette,
      accentColor: '#D4A359',
      borderClass: 'border-l-[#D4A359]',
      textClass: 'text-amber-900',
      tagText: 'Estudio Creativo',
      tagClass: 'bg-amber-100 text-amber-900 border border-amber-300'
    },
    {
      id: 'industria',
      name: 'Industria &\nTaller',
      icon: Cog,
      accentColor: '#5BB8FF',
      borderClass: 'border-l-[#5BB8FF]',
      textClass: 'text-sky-900',
      tagText: 'Manufactura B2B',
      tagClass: 'bg-sky-100 text-sky-900 border border-sky-300'
    },
    {
      id: 'hogar',
      name: 'Hogar y\nDecoración',
      icon: Home,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    },
    {
      id: 'negocios',
      name: 'Negocios y\nMarcas',
      icon: Briefcase,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    },
    {
      id: 'juguetes',
      name: 'Juguetes\nArticulados',
      icon: Gamepad2,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    },
    {
      id: 'personalizados',
      name: 'Productos\nPersonalizados',
      icon: Sparkles,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    },
    {
      id: 'eventos',
      name: 'Eventos y\nRecuerdos',
      icon: CalendarHeart,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    },
    {
      id: 'paquetes',
      name: 'Paquetes y\nServicios',
      icon: Gift,
      accentColor: '#D82B6E',
      borderClass: 'border-l-[#D82B6E]',
      textClass: 'text-[#D82B6E]',
      tagText: 'Combos',
      tagClass: 'bg-pink-100 text-pink-800 border border-pink-300'
    },
    {
      id: 'tecnicas',
      name: 'Técnicas de\nTaller',
      icon: Wrench,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    }
  ];

  // Elementos interactivos con código de color respectivo por disciplina
  const categoryItemsByArea = {
    'publicidad-desarrollo': [
      { id: 'pub-branding', name: 'Branding y Logos', icon: Palette, serviceId: 'branding', iconBg: 'bg-amber-50 text-amber-600 border border-amber-300 shadow-amber-100' },
      { id: 'pub-lonas', name: 'Lonas y Vinil', icon: Printer, serviceId: 'publicidad', iconBg: 'bg-rose-50 text-rose-600 border border-rose-300 shadow-rose-100' },
      { id: 'pub-web', name: 'Sitios Web y Tiendas', icon: Globe, serviceId: 'web', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-emerald-100' },
      { id: 'pub-3d', name: 'Modelado y Renders', icon: Box, serviceId: 'modelado', iconBg: 'bg-sky-50 text-sky-600 border border-sky-300 shadow-sky-100' },
      { id: 'pub-audiovisual', name: 'Fotografía y Video', icon: Film, serviceId: 'audiovisual', iconBg: 'bg-purple-50 text-purple-600 border border-purple-300 shadow-purple-100' },
      { id: 'pub-editorial', name: 'Catálogos PDF', icon: FileText, serviceId: 'audiovisual', iconBg: 'bg-amber-50 text-amber-700 border border-amber-300 shadow-amber-100' }
    ],
    industria: [
      { id: 'ind-prototipos', name: 'Prototipos 3D', icon: Box, catId: 'industria', iconBg: 'bg-sky-50 text-[#0284C7] border border-[#5BB8FF] shadow-sky-100' },
      { id: 'ind-jigs', name: 'Utillaje y Jigs', icon: Wrench, catId: 'industria', iconBg: 'bg-emerald-50 text-[#245C33] border border-[#8FB99B] shadow-emerald-100' },
      { id: 'ind-refacciones', name: 'Refacciones', icon: Cog, catId: 'industria', iconBg: 'bg-amber-50 text-amber-700 border border-amber-300 shadow-amber-100' },
      { id: 'ind-lotes', name: 'Lotes Cortos', icon: Printer, catId: 'industria', iconBg: 'bg-purple-50 text-purple-700 border border-purple-300 shadow-purple-100' }
    ],
    hogar: [
      { id: 'hogar-organizacion', name: 'Llaveros y Perchas', image: '/uploads/img_002.jpg', catId: 'hogar-organizacion' },
      { id: 'hogar-decoracion', name: 'Lámparas 3D', image: '/uploads/img_001.jpg', catId: 'hogar-decoracion' },
      { id: 'hogar-organizacion-2', name: 'Bandejas y Bowls', image: '/uploads/img_001.jpg', catId: 'hogar-organizacion' },
      { id: 'hogar-mascotas', name: 'Portabolsas Mascota', image: '/uploads/img_002.jpg', catId: 'hogar-mascotas' },
      { id: 'hogar-gamer', name: 'Soportes Gamer', image: '/uploads/img_001.jpg', catId: 'hogar-gamer' },
      { id: 'hogar-cocina', name: 'Posavasos Madera', image: '/uploads/img_002.jpg', catId: 'hogar-cocina' }
    ],
    negocios: [
      { id: 'negocios-mostrador', name: 'Placas QR Mostrador', image: '/uploads/pack_barberia_boutique_contexto.jpg', catId: 'negocios-mostrador' },
      { id: 'negocios-smart', name: 'Paneles Smart NFC', image: '/uploads/pack_barberia_boutique_contexto.jpg', catId: 'negocios-smart' },
      { id: 'negocios-senales', name: 'Letreros con Nombre', image: '/uploads/pack_barberia_boutique_contexto.jpg', catId: 'negocios-senales' },
      { id: 'negocios-restaurantes', name: 'Menús y Números', image: '/uploads/pack_barberia_boutique_contexto.jpg', catId: 'negocios-restaurantes' },
      { id: 'negocios-corporativo', name: 'Identificadores 3D', image: '/uploads/pack_barberia_boutique_contexto.jpg', catId: 'negocios-corporativo' }
    ],
    juguetes: [
      { id: 'juguetes-articulados', name: 'Jaguar Articulado', image: '/uploads/catalog-v2-j1-context-oficial.webp', catId: 'juguetes-articulados' },
      { id: 'juguetes-fidget', name: 'Zorrito Flexible', image: '/uploads/catalog-v2-j2-context-oficial.webp', catId: 'juguetes-fidget' }
    ],
    personalizados: [
      { id: 'personalizados-individual', name: 'Retrato Individual', image: '/uploads/personalizados-figuras-funko.jpg', catId: 'personalizados-individual' },
      { id: 'personalizados-dibujo', name: 'De Dibujo a 3D', image: '/uploads/personalizados-dibujo-figura-3d.jpg', catId: 'personalizados-dibujo' },
      { id: 'personalizados-mascotas', name: 'Mascotas Custom', image: '/uploads/funko-mascotas-perro-gato.jpg', catId: 'personalizados-mascotas' },
      { id: 'personalizados-parejas', name: 'Parejas & Boda', image: '/uploads/funko-pareja-novios-boda.jpg', catId: 'personalizados-parejas' },
      { id: 'personalizados-profesiones', name: 'Profesiones', image: '/uploads/funko-profesion-graduacion.jpg', catId: 'personalizados-profesiones' },
      { id: 'personalizados-amigos', name: 'Set Dúo Amigos', image: '/uploads/funko-amigos-cumpleanos.jpg', catId: 'personalizados-amigos' }
    ],
    eventos: [
      { id: 'eventos-bodas', name: 'Letreros Bienvenida', image: '/uploads/bienvenida_ceremonia_boda.jpg', catId: 'eventos-bodas' },
      { id: 'eventos-recuerdos', name: 'Fotoimanes Bautizo', image: '/uploads/bienvenida_ceremonia_boda.jpg', catId: 'eventos-recuerdos' },
      { id: 'eventos-patchbar', name: 'Servicio Patch Bar', image: '/uploads/bienvenida_ceremonia_boda.jpg', catId: 'eventos-patchbar' },
      { id: 'eventos-xvanos', name: 'Souvenirs XV Años', image: '/uploads/bienvenida_ceremonia_boda.jpg', catId: 'eventos-xvanos' },
      { id: 'eventos-copas', name: 'Copas Brindis Láser', image: '/uploads/bienvenida_ceremonia_boda.jpg', catId: 'eventos-copas' }
    ],
    paquetes: [
      { id: 'pack-hogar', name: 'Combo Recibidor', image: '/uploads/kit_home_office_gamer_contexto.jpg', isBundle: true, worldId: 'hogar' },
      { id: 'pack-gamer', name: 'Kit Home Office Pro', image: '/uploads/kit_home_office_gamer_contexto.jpg', isBundle: true, worldId: 'hogar' },
      { id: 'pack-negocios', name: 'Pack Barbería & Café', image: '/uploads/pack_barberia_boutique_contexto.jpg', isBundle: true, worldId: 'negocios' },
      { id: 'pack-boda', name: 'Paquete Boda Total', image: '/uploads/bienvenida_ceremonia_boda.jpg', isBundle: true, worldId: 'eventos' }
    ],
    tecnicas: [
      { id: 'tech-3d', name: 'Impresión 3D (PLA/TPU)', icon: Printer, techniqueId: '3d' },
      { id: 'tech-laser', name: 'Corte y Grabado Láser', icon: Flame, techniqueId: 'laser' },
      { id: 'tech-sublimation', name: 'Sublimación Térmica', icon: Palette, techniqueId: 'sublimation' },
      { id: 'tech-vinyl', name: 'Vinil y DTF Textil', icon: Scissors, techniqueId: 'vinyl' },
      { id: 'tech-nfc', name: 'Enlaces Smart NFC', icon: Radio, techniqueId: 'nfc' }
    ]
  };

  const currentItems = categoryItemsByArea[activeAreaTab] || categoryItemsByArea['publicidad-desarrollo'];

  const handleItemClick = (item) => {
    if (item.techniqueId) {
      if (onSelectTechnique) onSelectTechnique(item.techniqueId);
      if (onSelectWorld) onSelectWorld('all');
    } else if (item.isBundle) {
      if (onSelectWorld) onSelectWorld('paquetes-servicios');
    } else if (activeAreaTab === 'publicidad-desarrollo' || item.serviceId) {
      if (onSelectWorld) onSelectWorld('publicidad-desarrollo');
    } else if (activeAreaTab === 'industria') {
      if (onSelectWorld) onSelectWorld('industria');
    } else {
      if (onSelectWorld) onSelectWorld(activeAreaTab);
      if (onSelectCategory && item.catId) onSelectCategory(item.catId);
    }
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn select-none">
      {/* 1. Cabecera estilo Mercado Libre */}
      <div className="bg-[#17251E] text-white px-3 py-3 flex items-center justify-between border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-base font-bold tracking-tight">Categorías</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onSelectWorld) onSelectWorld('all');
            onClose();
          }}
          className="text-xs font-bold text-[#D4A359] hover:underline cursor-pointer"
        >
          Ver todo
        </button>
      </div>

      {/* 2. Cuerpo Master-Detail Dividido en 2 Columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna Izquierda: Lista Vertical de Áreas Maestras con código de color distintivo */}
        <div className="w-[38%] bg-[#F4F0E8]/70 border-r border-[#E8E4DA] overflow-y-auto">
          {masterAreas.map(area => {
            const isSelected = activeAreaTab === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setActiveAreaTab(area.id)}
                className={`w-full text-left p-3 text-xs font-semibold transition-all border-b border-[#E8E4DA]/60 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? `bg-white font-bold border-l-4 shadow-2xs ${area.borderClass} ${area.textClass}`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="whitespace-pre-line leading-tight text-[11px]">
                    {area.name}
                  </div>
                  {area.tagText && (
                    <span className={`inline-block mt-0.5 text-[8px] font-mono px-1 py-0.2 rounded font-bold ${area.tagClass}`}>
                      {area.tagText}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Columna Derecha: Cuadrícula con acentos de color propios de cada disciplina */}
        <div className="w-[62%] p-3 overflow-y-auto bg-white space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <span className={`text-xs font-extrabold uppercase tracking-wide ${
              activeAreaTab === 'publicidad-desarrollo'
                ? 'text-amber-900'
                : activeAreaTab === 'industria'
                ? 'text-sky-900'
                : 'text-gray-800'
            }`}>
              {masterAreas.find(a => a.id === activeAreaTab)?.name.replace('\\n', ' ')}
            </span>
            <button
              type="button"
              onClick={() => {
                if (activeAreaTab === 'paquetes') {
                  if (onSelectWorld) onSelectWorld('paquetes-servicios');
                } else if (activeAreaTab === 'publicidad-desarrollo') {
                  if (onSelectWorld) onSelectWorld('publicidad-desarrollo');
                } else if (activeAreaTab === 'industria') {
                  if (onSelectWorld) onSelectWorld('industria');
                } else if (activeAreaTab !== 'tecnicas') {
                  if (onSelectWorld) onSelectWorld(activeAreaTab);
                }
                onClose();
              }}
              className={`text-[11px] font-bold hover:underline cursor-pointer ${
                activeAreaTab === 'publicidad-desarrollo'
                  ? 'text-amber-800'
                  : activeAreaTab === 'industria'
                  ? 'text-sky-700'
                  : 'text-[#2D4F3E]'
              }`}
            >
              Explorar área &gt;
            </button>
          </div>

          {/* Grid de 3 Columnas Circulares con bordes e iconos temáticos */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
            {currentItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex flex-col items-center gap-1 group active:scale-95 transition-transform cursor-pointer"
              >
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform ${
                  item.iconBg ? item.iconBg : 'bg-gray-100 border border-gray-200'
                }`}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : item.icon && typeof item.icon !== 'string' ? (
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-[#2D4F3E]" />
                  )}
                </div>
                <span className="text-[10px] text-gray-700 font-medium leading-tight line-clamp-2 w-full">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
