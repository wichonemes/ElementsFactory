import React from 'react';
import { Layers, Sparkles, Cpu, Hammer, ArrowRight, MessageSquare } from 'lucide-react';

/**
 * CraftShowcase — Muestra fotográfica del taller, materiales y calidad de fabricación
 * Integra los mockups oficiales de Artesano Digital (madera grabada y acabados de identidad).
 */
export default function CraftShowcase({ settings }) {
  const whatsappNumber = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');
  const customProjectUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    '¡Hola Artesano Digital! Tengo un proyecto especial / personalizado en mente y me gustaría platicarlo con ustedes.'
  )}`;

  return (
    <section className="bg-[#1F2421] text-white py-16 sm:py-24 border-t border-b border-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Hammer className="w-3.5 h-3.5" />
            <span>Taller de Fabricación y Personalización</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            De la idea digital a la materia real
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Combinamos tecnología de precisión digital con el cuidado del detalle artesanal. Cada pieza es diseñada, fabricada y terminada a mano en nuestro taller en México.
          </p>
        </div>

        {/* 2-Column Visual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Madera y Grabado Láser */}
          <div className="group relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 flex flex-col justify-end min-h-[380px] sm:min-h-[440px] shadow-2xl transition-all duration-300 hover:border-emerald-500/40">
            <img 
              src="/brand/mockup_madera.jpg" 
              alt="Grabado y Corte Láser en Madera — Artesano Digital" 
              className="absolute inset-0 w-full h-full object-cover object-center brightness-90 group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F2421] via-[#1F2421]/60 to-transparent"></div>
            
            <div className="relative p-6 sm:p-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Corte y Grabado Láser</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Maderas Nobles, Acrílico y Piel
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                Bases para QR, placas corporativas, señalética para negocios y detalles conmemorativos grabados al milímetro con relieve y contraste natural.
              </p>
            </div>
          </div>

          {/* Card 2: Identidad y Relieve */}
          <div className="group relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 flex flex-col justify-end min-h-[380px] sm:min-h-[440px] shadow-2xl transition-all duration-300 hover:border-pink-500/40">
            <img 
              src="/brand/mockup_tarjeta.jpg" 
              alt="Identidad de Marca y Personalización Premium — Artesano Digital" 
              className="absolute inset-0 w-full h-full object-cover object-center brightness-90 group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F2421] via-[#1F2421]/60 to-transparent"></div>
            
            <div className="relative p-6 sm:p-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 backdrop-blur-md text-pink-300 text-[11px] font-bold uppercase tracking-wider">
                <Layers className="w-3 h-3" />
                <span>Identidad y Personalización</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Presencia de Marca y Texturas Reales
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                Llaveros corporativos, papelería de eventos especiales y recuerdos personalizados que tus clientes o invitados van a querer conservar.
              </p>
            </div>
          </div>

        </div>

        {/* Custom Project Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#1F2421] to-black/40 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-bold font-heading text-white flex items-center justify-center md:justify-start gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              ¿Tienes una idea o requerimiento especial?
            </h4>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Si no encuentras exactamente el producto en el catálogo o requieres medidas, materiales o cantidades de mayoreo, podemos diseñarlo a tu medida.
            </p>
          </div>

          <a
            href={customProjectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#1F2421] font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Platicar mi proyecto por WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
