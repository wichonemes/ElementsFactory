import React, { useState } from 'react';
import {
  Palette,
  Globe,
  Box,
  Printer,
  Film,
  MessageCircle,
  ChevronDown
} from 'lucide-react';

export default function PublicidadDesarrolloView({
  settings,
  onGoHome,
  onOpenCalculator,
  onSelectWorld
}) {
  // Pestañas cerradas por defecto: el cliente abre las que le interesen
  const [expandedService, setExpandedService] = useState(null);
  const whatsappPhone = (settings?.whatsappNumber || '5214440000000').replace(/[^0-9]/g, '');

  // Catálogo de Servicios de Diseño y Publicidad
  const servicesList = [
    {
      id: 'branding',
      icon: Palette,
      tag: 'Identidad Visual',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      activeBorder: 'border-amber-400/80 ring-2 ring-amber-400/25',
      accentBar: 'bg-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      title: 'Diseño Gráfico & Branding Corporativo',
      summary: 'Construcción de marcas memorables con voz propia, manual de identidad y aplicaciones comerciales completas.',
      deliverables: [
        'Logotipo principal, versiones alternativas e isotipo',
        'Manual de identidad de marca (paleta de color, tipografía y retícula)',
        'Papelería comercial: tarjetas, membretes y firmas de correo',
        'Diseño de empaques, etiquetas y sellos de producto',
        'Archivos vectoriales maestros (.AI, .PDF, .SVG, .PNG transparentes)'
      ],
      idealFor: 'Negocios nuevos, franquicias, pymes que buscan profesionalizar su imagen o rediseño de marca.'
    },
    {
      id: 'publicidad',
      icon: Printer,
      tag: 'Gran Formato & Rotulación',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      activeBorder: 'border-rose-400/80 ring-2 ring-rose-400/25',
      accentBar: 'bg-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      title: 'Publicidad Comercial, Lonas & Vinil',
      summary: 'Impacto visual físico para tu local o negocio: lonas de alta resistencia, rotulación en vinil y señalética arquitectónica.',
      deliverables: [
        'Lonas frontlite de 13oz con acabado perimetral y ojillos reforzados',
        'Lona mesh microperforada para exteriores de alto viento',
        'Vinil microperforado para cristales, aparadores y fachadas',
        'Corte de vinil automotriz y comercial (rotulación vehicular)',
        'Señalética en Trovicel y Acrílico con corte y grabado láser'
      ],
      idealFor: 'Comercios locales, oficinas, talleres, eventos y publicidad exterior de alto tráfico.'
    },
    {
      id: 'web',
      icon: Globe,
      tag: 'E-Commerce & Digital',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeBorder: 'border-emerald-400/80 ring-2 ring-emerald-400/25',
      accentBar: 'bg-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      title: 'Desarrollo Web & Tiendas Online',
      summary: 'Plataformas interactivas rápidas, responsivas y optimizadas para convertir visitantes en clientes reales.',
      deliverables: [
        'Sitios web corporativos modernos y ultra responsivos (móvil y PC)',
        'Catálogos digitales dinámicos con pedidos directos a WhatsApp',
        'Tiendas en línea completas con carrito y cálculo de envíos',
        'Páginas de aterrizaje (Landing Pages) de alta conversión',
        'Integración con redes sociales, SEO local y Google Maps'
      ],
      idealFor: 'Marcas que necesitan vender por internet, mostrar su catálogo 24/7 o automatizar sus cotizaciones.'
    },
    {
      id: 'modelado',
      icon: Box,
      tag: 'Prototipado & 3D',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      activeBorder: 'border-sky-400/80 ring-2 ring-sky-400/25',
      accentBar: 'bg-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      title: 'Modelado 3D & Renderizado Técnico',
      summary: 'De la idea al render fotorrealista y a la manufactura física mediante impresión 3D aditiva FDM.',
      deliverables: [
        'Diseño CAD paramétrico y modelado orgánico/técnico',
        'Renders fotorrealistas de producto para catálogos y publicidad',
        'Prototipos funcionales y piezas mecánicas a medida',
        'Carcasas y gabinetes para electrónica y proyectos especiales',
        'Producción en serie corta en filamentos técnicos (PLA, PETG, ABS)'
      ],
      idealFor: 'Emprendedores de producto físico, ingenieros, inventores y fabricantes de piezas personalizadas.'
    },
    {
      id: 'audiovisual',
      icon: Film,
      tag: 'Contenido & Editorial',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeBorder: 'border-purple-400/80 ring-2 ring-purple-400/25',
      accentBar: 'bg-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      title: 'Producción Audiovisual & Editorial',
      summary: 'Animación en movimiento, fotografía comercial de producto y maquetación editorial de catálogos y folletos.',
      deliverables: [
        'Fotografía de producto en estudio con iluminación profesional',
        'Motion graphics y animación 2D/3D para reels, TikTok y anuncios',
        'Maquetación editorial de catálogos de producto para impresión y PDF',
        'Folletos trípticos, dípticos y manuales de usuario ilustrados'
      ],
      idealFor: 'Campañas de lanzamiento, catálogos de temporada y presencia visual en redes.'
    }
  ];

  return (
    <div className="bg-[#0B0D11] text-stone-100 min-h-screen selection:bg-[#e8b84f] selection:text-[#0B0D11]">
      
      {/* 1. HERO INSTITUCIONAL */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#080A0D] via-[#101319] to-[#0D1015] text-white pt-6 pb-8 sm:pt-10 sm:pb-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800/80">
        <div className="max-w-4xl mx-auto relative z-10 space-y-2.5 sm:space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.08]">
            Diseño &amp; <br />
            <span className="text-[#e8b84f]">Publicidad</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed max-w-xl">
            Identidad visual, lonas de gran formato, rotulación en vinil, desarrollo web interactivo y modelado 3D de taller.
          </p>
        </div>
      </section>

      {/* 2. CONTENIDO PRINCIPAL: ACORDEÓN DE SERVICIOS */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        
        <div className="space-y-3 animate-fadeIn">
          {servicesList.map(srv => {
            const isExpanded = expandedService === srv.id;
            const Icon = srv.icon;

            return (
              <div
                key={srv.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? `bg-[#12161D] ${srv.activeBorder} shadow-2xl ring-1 ring-white/10`
                    : 'bg-[#0F1218] border-stone-800 hover:border-stone-700 shadow-md'
                }`}
              >
                {/* Barra Superior con Acento de Color si está desplegado */}
                {isExpanded && <div className={`h-1.5 w-full ${srv.accentBar}`} />}

                {/* Cabecera Tocable */}
                <button
                  type="button"
                  onClick={() => setExpandedService(isExpanded ? null : srv.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${srv.iconBg} ${
                      isExpanded ? 'scale-105' : ''
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${srv.badgeColor}`}>
                          {srv.tag}
                        </span>
                      </div>
                      <h3 className="font-heading font-black text-sm text-white mt-0.5 truncate">
                        {srv.title}
                      </h3>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-400 hidden sm:inline">
                      {isExpanded ? 'Ocultar' : 'Ver lo que incluye'}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-transform ${
                      isExpanded ? 'bg-[#e8b84f] text-[#0B0D11] rotate-180 border-[#e8b84f]' : 'bg-[#181D26] text-stone-300 border-stone-700'
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* Contenido Desplegable Completo del Servicio */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 border-t border-stone-800/80 space-y-3.5 animate-fadeIn">
                    
                    <p className="text-xs text-stone-300 leading-relaxed font-normal">
                      {srv.summary}
                    </p>

                    {/* Entregables incluidos en el servicio */}
                    <div className="bg-[#080A0E] p-3.5 sm:p-4 rounded-2xl border border-stone-800 space-y-2.5 shadow-inner">
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#e8b84f] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e8b84f]" />
                        <span>Servicios y entregables incluidos:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {srv.deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-stone-200 font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e8b84f] mt-1.5 shrink-0" />
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón Directo para Cotizar este Servicio por WhatsApp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="text-[11px] text-stone-400 italic">
                        <strong className="text-stone-200">Ideal para:</strong> {srv.idealFor}
                      </div>

                      <a
                        href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                          `Hola Wicho / Artesano Digital, me interesa cotizar el servicio de *${srv.title}*. ¿Podemos platicar sobre este proyecto?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Cotizar por WhatsApp</span>
                      </a>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>

    </div>
  );
}
