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
  FileText,
  Key,
  Lightbulb,
  Coffee,
  Headphones,
  QrCode,
  Smartphone,
  Tag,
  Utensils,
  Award,
  ToyBrick,
  Smile,
  User,
  Users,
  Heart,
  PenTool,
  GraduationCap,
  Image as ImageIcon,
  PartyPopper,
  Crown,
  Wine,
  Shirt,
  Store,
  Laptop
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
      id: 'tecnicas',
      name: 'Técnicas de\nTaller',
      icon: Wrench,
      accentColor: '#2D4F3E',
      borderClass: 'border-l-[#2D4F3E]',
      textClass: 'text-[#2D4F3E]'
    }
  ];

  // Elementos interactivos con código de color respectivo por disciplina (100% iconos vectoriales)
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
      { id: 'hogar-organizacion', name: 'Llaveros y Perchas', icon: Key, catId: 'hogar-organizacion', iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-50' },
      { id: 'hogar-decoracion', name: 'Lámparas 3D', icon: Lightbulb, catId: 'hogar-decoracion', iconBg: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-amber-50' },
      { id: 'hogar-organizacion-2', name: 'Bandejas y Bowls', icon: Box, catId: 'hogar-organizacion', iconBg: 'bg-stone-50 text-stone-700 border border-stone-200 shadow-stone-50' },
      { id: 'hogar-mascotas', name: 'Portabolsas Mascota', icon: Heart, catId: 'hogar-mascotas', iconBg: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-50' },
      { id: 'hogar-gamer', name: 'Soportes Gamer', icon: Headphones, catId: 'hogar-gamer', iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-indigo-50' },
      { id: 'hogar-cocina', name: 'Posavasos Madera', icon: Coffee, catId: 'hogar-cocina', iconBg: 'bg-amber-50 text-amber-800 border border-amber-200 shadow-amber-50' },
      { id: 'juguetes-articulados', name: 'Juguetes Articulados', icon: ToyBrick, catId: 'juguetes-articulados', iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-indigo-50' },
      { id: 'juguetes-fidget', name: 'Juguetes & Fidget', icon: Smile, catId: 'juguetes-fidget', iconBg: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-amber-50' },
      { id: 'pack-hogar', name: 'Combos & Paquetes Hogar', icon: Gift, isBundle: true, worldId: 'hogar', iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-50' }
    ],
    negocios: [
      { id: 'negocios-mostrador', name: 'Placas QR Mostrador', icon: QrCode, catId: 'negocios-mostrador', iconBg: 'bg-slate-50 text-slate-800 border border-slate-200 shadow-slate-50' },
      { id: 'negocios-smart', name: 'Paneles Smart NFC', icon: Smartphone, catId: 'negocios-smart', iconBg: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sky-50' },
      { id: 'negocios-senales', name: 'Letreros con Nombre', icon: Tag, catId: 'negocios-senales', iconBg: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-amber-50' },
      { id: 'negocios-restaurantes', name: 'Menús y Números', icon: Utensils, catId: 'negocios-restaurantes', iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-50' },
      { id: 'negocios-corporativo', name: 'Identificadores 3D', icon: Award, catId: 'negocios-corporativo', iconBg: 'bg-purple-50 text-purple-700 border border-purple-200 shadow-purple-50' },
      { id: 'pack-negocios', name: 'Kits & Starter Packs', icon: Gift, isBundle: true, worldId: 'negocios', iconBg: 'bg-amber-50 text-amber-800 border border-amber-200 shadow-amber-50' }
    ],
    personalizados: [
      { id: 'personalizados-individual', name: 'Retrato Individual', icon: User, catId: 'personalizados-individual', iconBg: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sky-50' },
      { id: 'personalizados-dibujo', name: 'De Dibujo a 3D', icon: PenTool, catId: 'personalizados-dibujo', iconBg: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-amber-50' },
      { id: 'personalizados-mascotas', name: 'Mascotas Custom', icon: Heart, catId: 'personalizados-mascotas', iconBg: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-50' },
      { id: 'personalizados-parejas', name: 'Parejas & Boda', icon: Users, catId: 'personalizados-parejas', iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-50' },
      { id: 'personalizados-profesiones', name: 'Profesiones', icon: GraduationCap, catId: 'personalizados-profesiones', iconBg: 'bg-purple-50 text-purple-700 border border-purple-200 shadow-purple-50' },
      { id: 'personalizados-amigos', name: 'Set Dúo Amigos', icon: Sparkles, catId: 'personalizados-amigos', iconBg: 'bg-pink-50 text-pink-600 border border-pink-200 shadow-pink-50' }
    ],
    eventos: [
      { id: 'eventos-bodas', name: 'Letreros Bienvenida', icon: PartyPopper, catId: 'eventos-bodas', iconBg: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-amber-50' },
      { id: 'eventos-recuerdos', name: 'Fotoimanes Bautizo', icon: ImageIcon, catId: 'eventos-recuerdos', iconBg: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sky-50' },
      { id: 'eventos-patchbar', name: 'Servicio Patch Bar', icon: Shirt, catId: 'eventos-patchbar', iconBg: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-rose-50' },
      { id: 'eventos-xvanos', name: 'Souvenirs XV Años', icon: Crown, catId: 'eventos-xvanos', iconBg: 'bg-purple-50 text-purple-700 border border-purple-200 shadow-purple-50' },
      { id: 'eventos-copas', name: 'Copas Brindis Láser', icon: Wine, catId: 'eventos-copas', iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-50' },
      { id: 'pack-eventos', name: 'Paquetes de Boda y Fiestas', icon: Gift, isBundle: true, worldId: 'eventos', iconBg: 'bg-pink-50 text-pink-700 border border-pink-200 shadow-pink-50' }
    ],
    tecnicas: [
      { id: 'tech-3d', name: 'Impresión 3D (PLA/TPU)', icon: Printer, techniqueId: '3d', iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-50' },
      { id: 'tech-laser', name: 'Corte y Grabado Láser', icon: Flame, techniqueId: 'laser', iconBg: 'bg-orange-50 text-orange-700 border border-orange-200 shadow-orange-50' },
      { id: 'tech-sublimation', name: 'Sublimación Térmica', icon: Palette, techniqueId: 'sublimation', iconBg: 'bg-purple-50 text-purple-700 border border-purple-200 shadow-purple-50' },
      { id: 'tech-vinyl', name: 'Vinil y DTF Textil', icon: Scissors, techniqueId: 'vinyl', iconBg: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-rose-50' },
      { id: 'tech-nfc', name: 'Enlaces Smart NFC', icon: Radio, techniqueId: 'nfc', iconBg: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sky-50' }
    ]
  };

  const currentItems = categoryItemsByArea[activeAreaTab] || categoryItemsByArea['publicidad-desarrollo'];

  const handleItemClick = (item) => {
    if (item.techniqueId) {
      if (onSelectTechnique) onSelectTechnique(item.techniqueId);
      if (onSelectWorld) onSelectWorld('all');
    } else if (item.isBundle) {
      if (onSelectWorld) onSelectWorld(item.worldId || activeAreaTab);
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
                if (activeAreaTab === 'publicidad-desarrollo') {
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
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform ${
                  item.iconBg ? item.iconBg : 'bg-gray-100 border border-gray-200 text-gray-700'
                }`}>
                  {item.icon && typeof item.icon !== 'string' ? (
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
