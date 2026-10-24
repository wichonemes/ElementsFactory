import React, { useState } from 'react';
import { Flame, Sparkles, CheckCircle2, MessageCircle, ArrowRight, Clock, Users, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function PatchBarShowcase({ onOpenPatchBarProduct, settings }) {
  const [activeTab, setActiveTab] = useState('completo'); // 'completo' | 'parches' | 'infografia'

  const whatsappNumber = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');
  const patchBarWhatsAppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    '¡Hola Artesano Digital! Me interesa cotizar el Servicio de Patch Bar en Vivo para mi evento (boda / fiesta / corporativo). ¿Podrían darme informes de paquetes y disponibilidad?'
  )}`;

  const tabs = [
    {
      id: 'completo',
      label: 'Estación en madera',
      image: '/uploads/patch_bar_servicio_en_vivo.jpg',
      caption: 'Mobiliario de madera artesanal con repisas para gorras, charolas de parches y prensa térmica industrial.'
    },
    {
      id: 'parches',
      label: 'Muestrario de parches',
      image: '/uploads/angle_patch_bar.jpg',
      caption: 'Parches y stickers textiles de alta durabilidad: iniciales, frases de celebración y monogramas personalizados.'
    },
    {
      id: 'infografia',
      label: 'Medidas y capacidad',
      image: '/uploads/info_patch_bar.jpg',
      caption: 'Estación de 160 x 80 cm, apta para salones y jardines, con capacidad de 50 a 300+ invitados.'
    }
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section className="py-8 sm:py-12 bg-[#0B0D11] border-y border-white/10 overflow-hidden text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5" />
            <span>Experiencia en Vivo · Activación para Eventos</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
            Servicio Patch Bar en Vivo
          </h2>
          
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            La dinámica más divertida para <strong>bodas, XV años, cumpleaños y eventos empresariales</strong>. Llevamos nuestro stand de madera artesanal y tus invitados personalizan y planchan su propia gorra o tote bag al instante.
          </p>
        </div>

        {/* 3 Step Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          
          {/* Paso 1 */}
          <div className="bg-[#131622] rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-emerald-500/50 shadow-lg transition-all relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm mb-4 shadow-sm">
              1
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 font-heading">
              Elige tu base favorita
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Tus invitados escogen entre gorras estilo <strong>trucker</strong> (varios colores neutros con malla fresca) o <strong>tote bags</strong> de manta 100% algodón crudo.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-emerald-300">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">Gorras trucker</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">Tote bags manta</span>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-[#131622] rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-pink-500/50 shadow-lg transition-all relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-[#D82B6E] text-white flex items-center justify-center font-black text-sm mb-4 shadow-sm">
              2
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 font-heading">
              Selecciona tus parches
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Charolas con diseños exclusivos del evento: <strong>iniciales de los novios o festejado</strong>, frases icónicas de fiesta, flores botánicas y stickers textiles.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-pink-300">
              <span className="px-2.5 py-0.5 rounded-lg bg-pink-500/15 border border-pink-500/30">Parches temáticos</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-pink-500/15 border border-pink-500/30">Monogramas D&amp;A</span>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-[#131622] rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-amber-500/50 shadow-lg transition-all relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm mb-4 shadow-sm">
              3
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 font-heading">
              ¡Planchado en vivo!
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Nuestro operador calificado aplica cada parche con <strong>prensa térmica de alta presión</strong> en menos de 45 segundos. Listo para usarse durante la fiesta.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-amber-300">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30">&lt; 45 segundos</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30">Fijación lavable</span>
            </div>
          </div>

        </div>

        {/* Visual Showcase with Interactive Tabs */}
        <div className="bg-[#131622] rounded-3xl border border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left / Top: Interactive Photo Display */}
          <div className="lg:col-span-7 bg-[#0D1017] p-5 sm:p-8 flex flex-col justify-between relative min-h-[380px] sm:min-h-[460px]">
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap gap-2 z-10 mb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#D82B6E] to-[#FF2D78] text-white shadow-md scale-102'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Displayed Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 border border-white/10 relative my-2">
              <img
                src={currentTabObj.image}
                alt={currentTabObj.label}
                className="w-full h-full object-contain max-h-[420px] transition-all duration-500"
              />
            </div>

            {/* Caption */}
            <p className="text-xs text-stone-300 mt-3 z-10 leading-relaxed">
              {currentTabObj.caption}
            </p>
          </div>

          {/* Right / Bottom: Specifications & Actions */}
          <div className="lg:col-span-5 p-5 sm:p-8 flex flex-col justify-between space-y-6 bg-[#161B27]">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold">
                  EV-PATCHBAR
                </span>
                <span className="text-xs font-bold text-stone-400">
                  Servicio Integral Todo Incluido
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                ¿Qué incluye nuestro servicio?
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Mobiliario artesanal de madera:</strong> Repisas de exhibición, charolas organizadoras y letrero tallado.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Gorras o Totes personalizables:</strong> Paquetes desde 50 hasta 300+ piezas para tus invitados.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Parches exclusivos de tu evento:</strong> Diseños a medida (monogramas, fechas, frases divertidas de fiesta o logotipos).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Prensa térmica industrial &amp; Operador:</strong> Personal uniformado que asiste a tus invitados durante 3 horas.</span>
                </li>
              </ul>
            </div>

            {/* Pricing Reference & Guarantees */}
            <div className="bg-[#0D1017] rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase">Paquete de Inicio</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-pink-400 font-heading">Desde $6,500</span>
                  <span className="text-xs text-stone-400 block font-mono">MXN (hasta 50 invitados)</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 leading-tight">
                * El costo final se ajusta al número de invitados, tipo de prendas y horas de servicio requeridas.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <a
                href={patchBarWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>Cotizar Patch Bar por WhatsApp</span>
              </a>

              {onOpenPatchBarProduct && (
                <button
                  onClick={onOpenPatchBarProduct}
                  className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ver ficha técnica y agregar a cotización</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
