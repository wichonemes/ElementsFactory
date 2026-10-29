import React, { useState } from 'react';
import { Tag, Sparkles, CheckCircle2, MessageCircle, ArrowRight, Layers, Percent, Gift, ShoppingBag, Calculator } from 'lucide-react';

export default function PromotionsSection({
  promotions = [],
  activeWorld = 'all',
  onSelectProduct,
  onAddToCart,
  onOpenCalculator,
  settings
}) {
  const [selectedWorldTab, setSelectedWorldTab] = useState('all');

  const whatsappNumber = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');

  // Filter promotions based on context:
  // If activeWorld is specified (e.g. 'hogar', 'negocios', 'eventos'), only show that world.
  // If activeWorld is 'all', allow user to filter via local tabs.
  const effectiveWorld = activeWorld !== 'all' ? activeWorld : selectedWorldTab;

  const displayPromos = promotions.filter(p => {
    if (!p.isBundle) return false;
    if (effectiveWorld === 'all') return true;
    return p.worlds?.includes(effectiveWorld);
  });

  if (displayPromos.length === 0) return null;

  const worldHeadings = {
    all: {
      tag: "Paquetes Coordinados & Descuentos",
      title: "Paquetes y Promociones Especiales",
      desc: "Ahorra adquiriendo kits completos diseÃ±ados para armonizar tus espacios, equipar tu negocio o celebrar en grande."
    },
    hogar: {
      tag: "Combos de Ahorro para el Hogar",
      title: "Promociones y Paquetes para tu Casa",
      desc: "Kits de bienvenida, home office y consentido para mascotas listos para transformar tu vida diaria con descuento especial."
    },
    negocios: {
      tag: "Paquetes Comerciales por Giro",
      title: "Promociones y Starter Packs para Negocios",
      desc: "Equipa tu cafeterÃ­a, restaurante, barberÃ­a o mostrador con seÃ±alÃ©tica, cÃ³digos QR, NFC y regalos con tu logotipo incluido."
    },
    eventos: {
      tag: "Combos Todo Incluido para Celebraciones",
      title: "Paquetes Nupciales, Fiesta y Graduaciones",
      desc: "Coordina la suite de preparaciÃ³n, la bienvenida, el brindis, kits anticruda y la experiencia del Patch Bar en vivo con precio especial."
    }
  };

  const currentHeading = worldHeadings[activeWorld] || worldHeadings.all;

  const handleWhatsAppQuote = (promo) => {
    let msg = `*COTIZACIÃ“N DE PAQUETE PROMOCIONAL â€” ARTESANO DIGITAL*\n`;
    msg += `--------------------------------------------------\n`;
    msg += `Â¡Hola! Me interesa aprovechar la siguiente promociÃ³n:\n\n`;
    msg += `â€¢ *[${promo.code}] ${promo.name}*\n`;
    msg += `â€¢ Precio especial: *$${promo.price} MXN* (Ahorro de $${promo.savings} MXN)\n`;
    if (promo.includedItems && promo.includedItems.length > 0) {
      msg += `â€¢ Piezas de interÃ©s:\n  - ${promo.includedItems.join('\n  - ')}\n`;
    }
    msg += `\n_Â¿Tienen disponibilidad y tiempos de entrega para este combo?_`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-12 sm:py-16 bg-[#F5F2EB]/70 border-b border-[#E8E4DA] relative overflow-hidden">
      
      {/* Subtle Background Craft Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1F2421_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D82B6E]/10 text-[#D82B6E] text-xs font-black uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              <span>{currentHeading.tag}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F2421] font-heading tracking-tight">
              {currentHeading.title}
            </h2>
            
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {currentHeading.desc}
            </p>
          </div>

          {/* World Filter Tabs (only when on Home / All view) */}
          {activeWorld === 'all' && (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E8E4DA] shadow-xs self-start md:self-auto overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'hogar', label: 'Hogar' },
                { id: 'negocios', label: 'Negocios' },
                { id: 'eventos', label: 'Eventos' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedWorldTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedWorldTab === tab.id
                      ? 'bg-[#2D4F3E] text-white shadow-xs'
                      : 'text-gray-600 hover:text-[#1F2421] hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Promo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayPromos.map(promo => {
            return (
              <div
                key={promo.id}
                className="bg-white rounded-3xl border border-[#E8E4DA] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-[#2D4F3E]/40 transition-all duration-300 group"
              >
                {/* Photo Container */}
                <div
                  onClick={() => onSelectProduct(promo)}
                  className="relative h-60 sm:h-64 overflow-hidden bg-gray-50 cursor-pointer select-none"
                >
                  <img loading="lazy"
                    src={promo.whiteBgImage || promo.primaryImage}
                    alt={promo.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-104 transition-transform duration-500 bg-white"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md bg-[#1F2421]/80 backdrop-blur-md text-white text-xs font-mono font-bold tracking-wider shadow-xs">
                      {promo.code}
                    </span>

                    {/* Savings Pill */}
                    <span className="px-3 py-1 rounded-full bg-[#D82B6E] text-white text-xs font-black shadow-md flex items-center gap-1">
                      <Percent className="w-3 h-3 stroke-[3]" />
                      <span>Ahorra ${promo.savings} MXN</span>
                    </span>
                  </div>

                  {/* Bottom Multi-Photo indicator */}
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white shadow-xs">
                      <Layers className="w-3 h-3" />
                      <span>{promo.gallery?.length || 4} fotos Mercado Libre</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        {promo.badge || 'COMBO AHORRO'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {promo.priceUnit}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(promo)}
                      className="font-extrabold text-[#1F2421] text-base sm:text-lg hover:text-[#2D4F3E] cursor-pointer transition-colors leading-snug font-heading"
                    >
                      {promo.name}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {promo.shortDescription}
                    </p>
                  </div>

                  {/* Included Items Checklist */}
                  {promo.includedItems && promo.includedItems.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E4DA] space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                        Piezas coordinadas incluidas:
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-gray-700 font-medium">
                        {promo.includedItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-tight">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pricing Comparison */}
                  <div className="pt-3 border-t border-[#E8E4DA] flex items-baseline justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 line-through font-semibold">
                          ${promo.regularPrice} MXN
                        </span>
                        <span className="text-[10px] font-bold text-[#D82B6E] bg-[#FFF0F5] px-1.5 py-0.2 rounded">
                          -{promo.discountPercent}%
                        </span>
                      </div>
                      <div className="text-2xl font-black text-[#2D4F3E] font-heading">
                        ${promo.price} <span className="text-xs font-normal text-gray-500">MXN</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProduct(promo)}
                      className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-[#2D4F3E] text-[#1F2421] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <span>Ver fotos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dual Action Buttons: Agregar al carrito & Hacer cotizaciÃ³n */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => onAddToCart ? onAddToCart({ product: promo, quantity: 1, selectedVariants: {}, customText: '' }) : onSelectProduct(promo)}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 border border-[#E8E4DA] text-[#1F2421] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:border-gray-400 active:scale-95"
                      title="Agregar paquete al carrito"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#2D4F3E]" />
                      <span>Al carrito</span>
                    </button>

                    <button
                      onClick={() => onOpenCalculator ? onOpenCalculator(promo) : handleWhatsAppQuote(promo)}
                      className="py-2.5 px-3 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                      title="Calcular cotizaciÃ³n personalizada"
                    >
                      <Calculator className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Hacer cotizaciÃ³n</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

