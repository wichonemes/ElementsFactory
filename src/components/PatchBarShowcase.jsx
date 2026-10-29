import React, { useState } from 'react';
import { Flame, Sparkles, CheckCircle2, MessageCircle, ArrowRight, Clock, Users, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function PatchBarShowcase({ onOpenPatchBarProduct, settings }) {
  const [activeTab, setActiveTab] = useState('completo'); // 'completo' | 'parches' | 'infografia'

  const whatsappNumber = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');
  const patchBarWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Â¡Hola Artesano Digital! Me interesa cotizar el Servicio de Patch Bar en Vivo para mi evento (boda / fiesta / corporativo). Â¿PodrÃ­an darme informes de paquetes y disponibilidad?'
  )}`;

  const tabs = [
    {
      id: 'completo',
      label: 'EstaciÃ³n en madera',
      image: './uploads/patch_bar_servicio_en_vivo.jpg',
      caption: 'Mobiliario de madera artesanal con repisas para gorras, charolas de parches y prensa tÃ©rmica industrial.'
    },
    {
      id: 'parches',
      label: 'Muestrario de parches',
      image: './uploads/angle_patch_bar.jpg',
      caption: 'Parches y stickers textiles de alta durabilidad: iniciales, frases de celebraciÃ³n y monogramas personalizados.'
    },
    {
      id: 'infografia',
      label: 'Medidas y capacidad',
      image: './uploads/info_patch_bar.jpg',
      caption: 'EstaciÃ³n de 160 x 80 cm, apta para salones y jardines, con capacidad de 50 a 300+ invitados.'
    }
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-[#F4F0E8] to-[#FBF9F5] rounded-3xl border border-[#E8E4DA] overflow-hidden text-stone-900 my-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D82B6E]/10 text-[#D82B6E] text-xs font-black uppercase tracking-wider shadow-2xs">
            <Flame className="w-3.5 h-3.5" />
            <span>Experiencia en Vivo Â· ActivaciÃ³n para Eventos</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2421] font-heading tracking-tight">
            Servicio Patch Bar en Vivo
          </h2>
          
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            La dinÃ¡mica mÃ¡s divertida para <strong>bodas, XV aÃ±os, cumpleaÃ±os y eventos empresariales</strong>. Llevamos nuestro stand de madera artesanal y tus invitados personalizan y planchan su propia gorra o tote bag al instante.
          </p>
        </div>

        {/* 3 Step Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          
          {/* Paso 1 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4DA] hover:border-[#2D4F3E] shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
            <div className="w-9 h-9 rounded-2xl bg-[#2D4F3E] text-white flex items-center justify-center font-black text-sm mb-3.5 shadow-2xs">
              1
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1F2421] mb-1 font-heading">
              Elige tu base favorita
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Tus invitados escogen entre gorras estilo <strong>trucker</strong> (varios colores neutros con malla fresca) o <strong>tote bags</strong> de manta 100% algodÃ³n crudo.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#2D4F3E]">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">Gorras trucker</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">Tote bags manta</span>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4DA] hover:border-[#D82B6E] shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
            <div className="w-9 h-9 rounded-2xl bg-[#D82B6E] text-white flex items-center justify-center font-black text-sm mb-3.5 shadow-2xs">
              2
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1F2421] mb-1 font-heading">
              Selecciona tus parches
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Charolas con diseÃ±os exclusivos del evento: <strong>iniciales de los novios o festejado</strong>, frases icÃ³nicas de fiesta, flores botÃ¡nicas y stickers textiles.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#D82B6E]">
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-200">Parches temÃ¡ticos</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-200">Monogramas D&amp;A</span>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E4DA] hover:border-[#D4A359] shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
            <div className="w-9 h-9 rounded-2xl bg-[#1F2421] text-white flex items-center justify-center font-black text-sm mb-3.5 shadow-2xs">
              3
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1F2421] mb-1 font-heading">
              Â¡Planchado en vivo!
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Nuestro operador calificado aplica cada parche con <strong>prensa tÃ©rmica de alta presiÃ³n</strong> en menos de 45 segundos. Listo para usarse durante la fiesta.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-stone-700">
              <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 border border-stone-200">&lt; 45 segundos</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 border border-stone-200">FijaciÃ³n lavable</span>
            </div>
          </div>

        </div>

        {/* Visual Showcase with Interactive Tabs */}
        <div className="bg-white rounded-3xl border border-[#E8E4DA] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left / Top: Interactive Photo Display */}
          <div className="lg:col-span-7 bg-[#1F2421] p-5 sm:p-7 flex flex-col justify-between relative min-h-[360px] sm:min-h-[420px]">
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap gap-2 z-10 mb-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-950 shadow-md font-black scale-102'
                      : 'bg-white/15 text-stone-200 hover:bg-white/25 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Displayed Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 relative my-2">
              <img loading="lazy"
                src={currentTabObj.image}
                alt={currentTabObj.label}
                className="w-full h-full object-contain max-h-[380px] transition-all duration-500"
              />
            </div>

            {/* Caption */}
            <p className="text-xs text-stone-300 mt-2 z-10 leading-relaxed">
              {currentTabObj.caption}
            </p>
          </div>

          {/* Right / Bottom: Specifications & Actions */}
          <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-5 bg-white">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#2D4F3E]/10 text-[#2D4F3E] text-xs font-mono font-bold">
                  EV-PATCHBAR
                </span>
                <span className="text-xs font-bold text-stone-500">
                  Servicio Integral Todo Incluido
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F2421] font-heading">
                Â¿QuÃ© incluye nuestro servicio?
              </h3>

              <ul className="space-y-2.5 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D4F3E] shrink-0 mt-0.5" />
                  <span><strong>Mobiliario artesanal de madera:</strong> Repisas de exhibiciÃ³n, charolas organizadoras y letrero tallado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D4F3E] shrink-0 mt-0.5" />
                  <span><strong>Gorras o Totes personalizables:</strong> Paquetes desde 50 hasta 300+ piezas para tus invitados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D4F3E] shrink-0 mt-0.5" />
                  <span><strong>Parches exclusivos de tu evento:</strong> DiseÃ±os a medida (monogramas, fechas, frases divertidas de fiesta o logotipos).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D4F3E] shrink-0 mt-0.5" />
                  <span><strong>Prensa tÃ©rmica industrial &amp; Operador:</strong> Personal uniformado que asiste a tus invitados durante 3 horas.</span>
                </li>
              </ul>
            </div>

            {/* Pricing Reference & Guarantees */}
            <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#E8DFC8] space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase">Paquete de Inicio</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#2D4F3E] font-heading">Desde $6,500</span>
                  <span className="text-[11px] text-stone-500 block font-mono">MXN (hasta 50 invitados)</span>
                </div>
              </div>
              <p className="text-[10.5px] text-stone-500 leading-tight">
                * El costo final se ajusta al nÃºmero de invitados, tipo de prendas y horas de servicio requeridas.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={patchBarWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-white text-[#25D366]" />
                <span>Cotizar Patch Bar por WhatsApp</span>
              </a>

              {onOpenPatchBarProduct && (
                <button
                  onClick={onOpenPatchBarProduct}
                  className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Ver ficha tÃ©cnica y fotos completas</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

