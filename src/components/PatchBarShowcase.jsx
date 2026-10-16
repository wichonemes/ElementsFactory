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
      label: '🪵 Estación en madera',
      image: '/uploads/patch_bar_servicio_en_vivo.jpg',
      caption: 'Mobiliario de madera artesanal con repisas para gorras, charolas de parches y prensa térmica industrial.'
    },
    {
      id: 'parches',
      label: '🔍 Muestrario de parches',
      image: '/uploads/angle_patch_bar.jpg',
      caption: 'Parches y stickers textiles de alta durabilidad: iniciales, frases de celebración y monogramas personalizados.'
    },
    {
      id: 'infografia',
      label: '📐 Medidas y capacidad',
      image: '/uploads/info_patch_bar.jpg',
      caption: 'Estación de 160 x 80 cm, apta para salones y jardines, con capacidad de 50 a 300+ invitados.'
    }
  ];

  const currentTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#F4F0E8] to-[#FBF9F5] border-y border-[#E8E4DA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D82B6E]/10 text-[#D82B6E] text-xs font-black uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Experiencia en Vivo · Activación para Eventos</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2421] font-heading tracking-tight">
            Servicio Patch Bar en Vivo
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            La dinámica más divertida para <strong>bodas, XV años, cumpleaños y eventos empresariales</strong>. Llevamos nuestro stand de madera artesanal y tus invitados personalizan y planchan su propia gorra o tote bag al instante.
          </p>
        </div>

        {/* 3 Step Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Paso 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E4DA] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-[#2D4F3E] text-white flex items-center justify-center font-black text-sm mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-[#1F2421] mb-1.5 font-heading">
              Elige tu base favorita
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Tus invitados escogen entre gorras estilo <strong>trucker</strong> (varios colores neutros con malla fresca) o <strong>tote bags</strong> de manta 100% algodón crudo.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#2D4F3E]">
              <span className="px-2 py-0.5 rounded-md bg-[#F4F0E8]">🧢 Gorras trucker</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F0E8]">👜 Tote bags manta</span>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E4DA] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-[#D82B6E] text-white flex items-center justify-center font-black text-sm mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-[#1F2421] mb-1.5 font-heading">
              Selecciona tus parches
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Charolas con diseños exclusivos del evento: <strong>iniciales de los novios o festejado</strong>, frases icónicas de fiesta, flores botánicas y stickers textiles.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#D82B6E]">
              <span className="px-2 py-0.5 rounded-md bg-[#FFF0F5]">✨ Parches temáticos</span>
              <span className="px-2 py-0.5 rounded-md bg-[#FFF0F5]">🏷️ Monogramas D&A</span>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E4DA] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-[#1F2421] text-white flex items-center justify-center font-black text-sm mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-[#1F2421] mb-1.5 font-heading">
              ¡Planchado en vivo!
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Nuestro operador calificado aplica cada parche con <strong>prensa térmica de alta presión</strong> en menos de 45 segundos. Listo para usarse durante la fiesta.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-gray-700">
              <span className="px-2 py-0.5 rounded-md bg-gray-100">⏱️ &lt; 45 segundos</span>
              <span className="px-2 py-0.5 rounded-md bg-gray-100">🔥 Fijación lavable</span>
            </div>
          </div>

        </div>

        {/* Visual Showcase with Interactive Tabs */}
        <div className="bg-white rounded-3xl border border-[#E8E4DA] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left / Top: Interactive Photo Display */}
          <div className="lg:col-span-7 bg-[#1F2421] p-6 sm:p-8 flex flex-col justify-between relative min-h-[380px] sm:min-h-[460px]">
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap gap-2 z-10 mb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#1F2421] shadow-md scale-105'
                      : 'bg-white/15 text-white/80 hover:bg-white/25 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Displayed Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 relative my-2">
              <img
                src={currentTabObj.image}
                alt={currentTabObj.label}
                className="w-full h-full object-contain max-h-[420px] transition-all duration-500"
              />
            </div>

            {/* Caption */}
            <p className="text-xs text-gray-300 mt-3 z-10 leading-relaxed">
              💡 {currentTabObj.caption}
            </p>
          </div>

          {/* Right / Bottom: Specifications & Actions */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#2D4F3E]/10 text-[#2D4F3E] text-xs font-mono font-bold">
                  EV-PATCHBAR
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Servicio Integral Todo Incluido
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#1F2421] font-heading">
                ¿Qué incluye nuestro servicio?
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Mobiliario artesanal de madera:</strong> Repisas de exhibición, charolas organizadoras y letrero tallado.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Gorras o Totes personalizables:</strong> Paquetes desde 50 hasta 300+ piezas para tus invitados.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Parches exclusivos de tu evento:</strong> Diseños a medida (monogramas, fechas, frases divertidas de fiesta o logotipos).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Prensa térmica industrial &amp; Operador:</strong> Personal uniformado que asiste a tus invitados durante 3 horas.</span>
                </li>
              </ul>
            </div>

            {/* Pricing Reference & Guarantees */}
            <div className="bg-[#FBF9F5] rounded-2xl p-4 border border-[#E8E4DA] space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Paquete de Inicio</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#2D4F3E] font-heading">Desde $6,500</span>
                  <span className="text-xs text-gray-500 block">MXN (hasta 50 invitados)</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                * El costo final se ajusta al número de invitados, tipo de prendas y horas de servicio requeridas.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <a
                href={patchBarWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>Cotizar Patch Bar por WhatsApp</span>
              </a>

              {onOpenPatchBarProduct && (
                <button
                  onClick={onOpenPatchBarProduct}
                  className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 text-[#1F2421] font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Ver ficha técnica y agregar a cotización</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
