import React from 'react';
import { ArrowLeft, MessageCircle, Sparkles, Boxes, Scissors, Printer, Nfc, CheckCircle2, Ruler, Truck } from 'lucide-react';
import BrandLogo from './BrandLogo';

const TECHNIQUES = [
  {
    icon: Boxes,
    title: 'Impresión 3D',
    text: 'Piezas en PLA, PETG y TPU con tolerancias cuidadas: figuras, soportes, organizadores y refacciones.'
  },
  {
    icon: Scissors,
    title: 'Corte y grabado láser',
    text: 'Madera natural, acrílico y otros sustratos. Grabado botánico, letreros, señalización y detalles finos.'
  },
  {
    icon: Printer,
    title: 'Sublimación',
    text: 'Tazas, termos y textiles con imagen fotográfica de alta definición que no se despega ni se agrieta.'
  },
  {
    icon: Ruler,
    title: 'Vinil textil y de corte',
    text: 'Playeras, gorras y tote bags con vinil HD, más rotulación para escaparates y vehículos.'
  },
  {
    icon: Nfc,
    title: 'Tecnología NFC',
    text: 'Chapitas, tarjetas y soportes con chip programable: abre tu menú, redes o ficha de mascota con un toque.'
  }
];

const STEPS = [
  { n: '01', title: 'Nos cuentas tu idea', text: 'Por WhatsApp, con la foto o referencia que tengas. No necesitas un diseño terminado.' },
  { n: '02', title: 'Diseño y cotización', text: 'Te proponemos materiales, medidas y precio claro. Sin compromiso y sin sorpresas.' },
  { n: '03', title: 'Producción cuidada', text: 'Fabricamos en taller y te compartimos avances reales antes de cerrar el pedido.' },
  { n: '04', title: 'Entrega o envío', text: 'Entrega local en San Luis Potosí o envío a toda la República con paquetería segura.' }
];

export default function AboutPage({ onBack, onExplore, settings }) {
  const whatsapp = (settings?.whatsappNumber || '').replace(/[^0-9]/g, '');
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola Artesano Digital, me gustaría cotizar un producto personalizado.')}`
    : '#';

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#FBF9F5] pb-24">
      <div className="sticky top-0 z-10 border-b border-[#E8E4DA] bg-[#FBF9F5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
              else window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2DCCD] bg-white px-3 py-2 text-sm font-semibold text-[#1F2421] transition hover:border-[#2D4F3E] hover:text-[#2D4F3E] cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al catálogo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
              else window.location.href = '/';
            }}
            className="cursor-pointer"
          >
            <BrandLogo showTagline={false} />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D4F3E]">
            Nosotros
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#1F2421] sm:text-4xl">
            Detrás de cada pieza hay una idea que se volvió real.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#4B504B]">
            Artesano Digital es un taller de diseño y fabricación digital con base en San Luis Potosí.
            Nacimos con una idea simple: que cualquier persona, negocio o evento pueda tener un objeto
            hecho a su medida, con calidad de taller y trato directo, sin pedidos mínimos imposibles
            ni intermediarios.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#4B504B]">
            Trabajamos para <strong>empresas</strong> que necesitan imagen y detalles de marca, para{' '}
            <strong>hogares</strong> que buscan piezas útiles y bonitas, y para{' '}
            <strong>eventos</strong> donde cada recuerdo cuenta. Combinamos impresión 3D, corte láser,
            sublimación, vinil y tecnología NFC según lo que cada proyecto necesite.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-[#1F2421]">Lo que hacemos en el taller</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECHNIQUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-[#E8E4DA] bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D4F3E]/10 text-[#2D4F3E]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-[15px] font-bold text-[#1F2421]">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B5F5A]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-[#1F2421]">Cómo trabajamos</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {STEPS.map(step => (
              <div key={step.n} className="flex gap-4 rounded-2xl bg-white p-5 border border-[#E8E4DA]">
                <span className="text-2xl font-extrabold text-[#2D4F3E]/25">{step.n}</span>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1F2421]">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#5B5F5A]">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-[#1F2421] p-6 text-white sm:p-9">
          <div className="flex items-center gap-2 text-[#A7C4B2]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Nuestro compromiso</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              'Materiales honestos: maderas naturales libres de MDF cuando el producto lo permite.',
              'Fotografía real: cada producto se muestra con sus cuatro vistas antes de publicarse.',
              'Precios claros: te decimos qué incluye y qué no antes de producir.',
              'Trato directo: hablas con el taller, no con un centro de llamadas.'
            ].map(item => (
              <div key={item} className="flex gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7FB79A]" />
                <p className="text-[13px] leading-relaxed text-gray-300">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" />
              Cotizar por WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                if (onExplore) onExplore();
                else if (onBack) onBack();
                else window.location.href = '/';
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer active:scale-95"
            >
              Ver catálogo completo
            </button>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 border border-[#E8E4DA]">
            <Truck className="mt-0.5 h-5 w-5 text-[#2D4F3E]" />
            <div>
              <h3 className="text-sm font-bold text-[#1F2421]">Envíos y entrega</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5B5F5A]">
                {settings?.serviceZone || 'Envíos a toda la República Mexicana y entregas locales.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 border border-[#E8E4DA]">
            <MessageCircle className="mt-0.5 h-5 w-5 text-[#2D4F3E]" />
            <div>
              <h3 className="text-sm font-bold text-[#1F2421]">Horario de atención</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5B5F5A]">
                {settings?.businessHours || 'Lunes a Viernes de 9:00 a 18:00 hrs.'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
