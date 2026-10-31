import React, { useState } from 'react';
import {
  ArrowLeft, Users, Sparkles, TrendingUp, DollarSign,
  ShieldCheck, Package, CheckCircle2, MessageCircle, HelpCircle,
  Share2, Camera, Award, ArrowRight
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AffiliatesPage({ onBack, settings }) {
  const [salesEstimate, setSalesEstimate] = useState(25); // piezas al mes proyectadas
  const avgTicketPerPiece = 180; // precio promedio producto
  const estimatedRevenue = salesEstimate * avgTicketPerPiece;
  const affiliateCommission = Math.round(estimatedRevenue * 0.10);
  const wholesaleMargin = Math.round(estimatedRevenue * 0.40);

  const phone = (settings?.whatsappNumber || '5215500000000').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    'Hola Artesano Digital! Me interesa unirme al Programa de Revendedores / Afiliados y solicitar mi código personalizado.'
  )}`;

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-gray-900 pb-20">
      {/* Barra superior de navegación */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </button>
          <BrandLogo size="sm" showTagline={false} />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D4F3E] hover:bg-[#20392C] text-white text-xs font-black transition-colors shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solicitar código</span>
          </a>
        </div>
      </header>

      {/* Hero Principal */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-[#1F2421] to-[#2D4F3E] text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-black uppercase tracking-wider border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Programa Ganar - Ganar</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Gana dinero revendiendo productos personalizados de nuestro taller
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Sin mínimos obligatorios ni inversiones forzosas. Vende piezas de corte láser, impresión 3D, sublimación y placas inteligentes con el respaldo de nuestro taller.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-sm transition-all shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Solicitar mi código por WhatsApp</span>
            </a>
            <a
              href="#modalidades"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20"
            >
              <span>Ver cómo funciona</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Las 2 Modalidades de Trabajo */}
      <section id="modalidades" className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Modalidad 1: Afiliado con Código */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Opción 1: Cero Inversión
              </span>
              <h3 className="font-heading font-black text-xl text-gray-900 mt-2">
                Afiliado Digital (Tu Código)
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Ideal si tienes redes sociales, amigos o clientes y quieres recomendar sin encargarte de envíos ni cobros.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Te creamos tu <strong>código exclusivo</strong> (ej. <code>TU-NOMBRE10</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Tu cliente recibe <strong>5% de descuento</strong> de cortesía.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Tú cobras <strong>10% de comisión en efectivo</strong> por cada venta que use tu código.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Nosotros fabricamos, empacamos y entregamos.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 hover:text-emerald-950 underline"
              >
                Pedir mi código de afiliado &rarr;
              </a>
            </div>
          </div>

          {/* Modalidad 2: Mayorista / Revendedor con Stock */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Opción 2: Máxima Ganancia
              </span>
              <h3 className="font-heading font-black text-xl text-gray-900 mt-2">
                Mayorista / Revendedor con Stock
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Ideal para tiendas de regalos, organizadores de eventos, bazares o quienes hacen entregas directas en su zona.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>15% de descuento automático</strong> comprando desde 12 piezas.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Tú fijas tu precio de reventa final con márgenes del <strong>35% al 60%</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Acceso a <strong>fotos en alta resolución</strong> listas para publicar en tus redes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Tiempos de producción preferenciales para tus pedidos por lote.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 hover:text-amber-950 underline"
              >
                Cotizar lote de mayoreo &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador de Ganancias */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Simulador interactivo
            </span>
            <h3 className="font-heading font-black text-2xl text-gray-900">
              ¿Cuánto puedes ganar al mes?
            </h3>
            <p className="text-xs text-gray-600">
              Mueve la barra para calcular tus ingresos según las piezas vendidas.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
              <span>Piezas colocadas al mes:</span>
              <span className="text-base font-black text-emerald-800">{salesEstimate} piezas</span>
            </div>
            <input
              type="range"
              min="6"
              max="150"
              step="1"
              value={salesEstimate}
              onChange={(e) => setSalesEstimate(Number(e.target.value))}
              className="w-full accent-[#2D4F3E] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>6 pzas (iniciando)</span>
              <span>50 pzas</span>
              <span>150 pzas (distribuidor activo)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Como Afiliado Digital (10%)</span>
              <div className="font-heading font-black text-xl sm:text-2xl text-emerald-800">
                ${affiliateCommission.toLocaleString('es-MX')} MXN
              </div>
              <p className="text-[10px] text-gray-500">Sin empacar ni enviar nada</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Como Mayorista Directo (~40%)</span>
              <div className="font-heading font-black text-xl sm:text-2xl text-amber-800">
                ${wholesaleMargin.toLocaleString('es-MX')} MXN
              </div>
              <p className="text-[10px] text-gray-500">Revendiendo en tu negocio/zona</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios de trabajar con nosotros */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16">
        <h3 className="font-heading font-black text-xl sm:text-2xl text-gray-900 text-center mb-8">
          ¿Por qué revender productos de Artesano Digital?
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-black text-sm text-gray-900">Fotos listas para tus redes</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Te compartimos fotos y videos limpios sin marcas de agua para que los subas directo a tu Instagram, TikTok o catálogo de WhatsApp.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-black text-sm text-gray-900">Calidad garantizada</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Cada pieza pasa por inspección de taller antes de salir. Tu cliente final siempre recibe un producto bien terminado.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-black text-sm text-gray-900">Personalización total</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Podemos grabar nombres, logos corporativos, fechas o adaptar piezas especiales que tus clientes te pidan.
            </p>
          </div>
        </div>
      </section>

      {/* Llamado a la acción final */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1F2421] to-[#2D4F3E] text-white space-y-4 shadow-xl">
          <h3 className="font-heading font-black text-2xl sm:text-3xl">
            ¿Listo para empezar a ganar con nosotros?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Mándanos un mensaje por WhatsApp con tu nombre y dinos cómo te gustaría que se llame tu código de revendedor.
          </p>
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Platicar por WhatsApp con el Taller</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
