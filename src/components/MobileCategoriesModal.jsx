import React, { useState } from 'react';
import { ArrowLeft, Home, Briefcase, CalendarHeart, Gift, Wrench, Search, Sparkles, Printer, Flame, Palette, Scissors, Radio, Gamepad2, Cog } from 'lucide-react';

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

  const [activeAreaTab, setActiveAreaTab] = useState('hogar');

  // Áreas principales del taller (Columna izquierda)
  const masterAreas = [
    { id: 'hogar', name: 'Hogar y\nDecoración', icon: Home },
    { id: 'negocios', name: 'Negocios y\nMarcas', icon: Briefcase },
    { id: 'juguetes', name: 'Juguetes\nArticulados', icon: Gamepad2 },
    { id: 'personalizados', name: 'Productos\nPersonalizados', icon: Sparkles },
    { id: 'eventos', name: 'Eventos y\nRecuerdos', icon: CalendarHeart },
    { id: 'paquetes', name: 'Paquetes y\nServicios', icon: Gift },
    { id: 'industria', name: 'Industria &\nTaller', icon: Cog },
    { id: 'tecnicas', name: 'Técnicas de\nTaller', icon: Wrench }
  ];

  // Elementos interactivos para la cuadrícula derecha según el área seleccionada
  const categoryItemsByArea = {
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
    industria: [
      { id: 'industria-automotriz', name: 'Toberas & Ductos', image: '/uploads/industria_portada_oficial_ingenieria.webp', catId: 'industria-automotriz' },
      { id: 'industria-calibracion', name: 'Galgas de Medición', image: '/uploads/industria_portada_oficial_ingenieria.webp', catId: 'industria-calibracion' }
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

  const currentItems = categoryItemsByArea[activeAreaTab] || categoryItemsByArea.hogar;

  const handleItemClick = (item) => {
    if (item.techniqueId) {
      if (onSelectTechnique) onSelectTechnique(item.techniqueId);
      if (onSelectWorld) onSelectWorld('all');
    } else if (item.isBundle) {
      if (onSelectWorld) onSelectWorld('paquetes-servicios');
    } else {
      if (onSelectWorld) onSelectWorld(activeAreaTab);
      if (onSelectCategory && item.catId) onSelectCategory(item.catId);
    }
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn select-none">
      {/* 1. Cabecera Amarilla/Artesanal estilo Mercado Libre (Captura 1) */}
      <div className="bg-[#17251E] text-white px-3 py-3 flex items-center justify-between border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
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
          className="text-xs font-bold text-[#D4A359] hover:underline"
        >
          Ver todo
        </button>
      </div>

      {/* 2. Cuerpo Master-Detail Dividido en 2 Columnas (Estilo Captura 1) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna Izquierda: Lista Vertical de Áreas Maestras */}
        <div className="w-[36%] bg-[#F4F0E8]/70 border-r border-[#E8E4DA] overflow-y-auto">
          {masterAreas.map(area => {
            const isSelected = activeAreaTab === area.id;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setActiveAreaTab(area.id)}
                className={`w-full text-left p-3 text-xs font-semibold transition-all border-b border-[#E8E4DA]/60 flex items-center justify-between ${
                  isSelected
                    ? 'bg-white text-[#2D4F3E] font-bold border-l-4 border-l-[#2D4F3E] shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                }`}
              >
                <span className="whitespace-pre-line leading-tight text-[11px]">
                  {area.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Columna Derecha: Cuadrícula de 3 Columnas de Iconos Circulares */}
        <div className="w-[64%] p-3 overflow-y-auto bg-white space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              {masterAreas.find(a => a.id === activeAreaTab)?.name.replace('\n', ' ')}
            </span>
            <button
              type="button"
              onClick={() => {
                if (activeAreaTab === 'paquetes') {
                  if (onSelectWorld) onSelectWorld('paquetes-servicios');
                } else if (activeAreaTab !== 'tecnicas') {
                  if (onSelectWorld) onSelectWorld(activeAreaTab);
                }
                onClose();
              }}
              className="text-[11px] font-bold text-[#2D4F3E] hover:underline"
            >
              Explorar área &gt;
            </button>
          </div>

          {/* Grid de 3 Columnas Circulares estilo Mercado Libre */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {currentItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shadow-2xs group-hover:border-[#2D4F3E]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : item.icon && typeof item.icon !== 'string' ? (
                    <item.icon className="w-6 h-6 text-[#2D4F3E]" />
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
