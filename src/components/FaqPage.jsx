import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Sparkles, HelpCircle, Truck, PackageCheck, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

const FAQS = [
  {
    q: '¿Qué tipo de productos personalizan?',
    a: 'Impresión 3D (PLA, PETG y TPU), corte y grabado láser (madera, acrílico y otros sustratos), sublimación (tazas, termos y textiles), vinil textil y de corte, placas inteligentes con tecnología NFC, y ensamblaje o refacciones personalizadas.'
  },
  {
    q: '¿Necesito tener el diseño o idea lista?',
    a: 'No. Si tienes una foto, un dibujo, una idea o referencias, nuestro equipo la transforma en un diseño real. Es parte del servicio: primero diseñamos, luego fabricamos.'
  },
  {
    q: '¿Con qué materiales trabajan?',
    a: 'En impresión 3D usamos PLA, PETG y TPU según la resistencia que el proyecto requiera. En láser trabajamos con maderas naturales y acrílicos. En sublimación usamos impresión digital de alta definición sobre cerámica y textiles.'
  },
  {
    q: '¿Tienen mínimo de pieza para hacer un pedido?',
    a: 'No. Fabricamos desde piezas individuales para hogares o negocios, hasta proyectos completos para eventos y marcas (lotes de souvenirs, señalética, etc.).'
  },
  {
    q: '¿Cuánto tarda una producción?',
    a: 'Depende del proyecto. Pedidos simples suelen tardar de 5 a 7 días hábiles; proyectos complejos (diseños grandes, muchos colores o técnicas mixtas) pueden extenderse un poco más. Te lo confirmamos con todo el detalle al cotizar.'
  },
  {
    q: '¿Cómo funciona la cotización?',
    a: 'Cotizas directamente por WhatsApp. Nos cuentas tu idea y, si la tienes, la foto o referencia. En menos de 24 horas te respondemos con materiales, medidas, precio y tiempos. Sin compromiso.'
  },
  {
    q: '¿Hacen envíos?',
    a: 'Sí. Envíos a toda la República Mexicana con paquetería segura, y entregas locales en San Luis Potosí. El costo se calcula según el destino al cotizar.'
  },
  {
    q: '¿Puedo personalizar un producto que ya tienen en el catálogo?',
    a: 'Sí. Nuestro catálogo incluye productos personalizables y también hacemos piezas 100% a medida. Explora el catálogo y si algo te gusta, lo personalizamos a tu medida.'
  },
  {
    q: '¿Qué pasa si después de fabricar quiero cambiar algo?',
    a: 'Revisamos cada pieza antes de cerrar el pedido y te compartimos avances reales por WhatsApp. Una vez en producción, los cambios se evalúan con el taller.'
  }
];

export default function FaqPage({ onBack, onExplore, settings }) {
  const [openIndex, setOpenIndex] = useState(0);
  const whatsapp = (settings?.whatsappNumber || '').replace(/[^0-9]/g, '');
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola Artesano Digital, tengo una pregunta sobre un producto personalizado.')}`
    : '#';

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#FBF9F5]">
      <div className="sticky top-0 z-10 border-b border-[#E8E4DA] bg-[#FBF9F5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onBack) onBack();
              else window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2DCCD] bg-white px-3 py-2 text-sm font-semibold text-[#1F2421] transition hover:border-[#2D4F3E] hover:text-[#2D4F3E] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </a>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onBack) onBack();
              else window.location.href = '/';
            }}
            className="hidden sm:block cursor-pointer"
          >
            <BrandLogo showTagline={false} />
          </a>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D4F3E]">
            Ayuda
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#1F2421] sm:text-4xl">
            Preguntas frecuentes
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#4B504B]">
            Todo lo que normalmente nos preguntan antes de cotizar. Si no está aquí, escríbenos por
            WhatsApp y te respondemos rápido.
          </p>
        </section>

        <section className="mt-10 space-y-3">
          {FAQS.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <div key={item.q} className="overflow-hidden rounded-2xl border border-[#E8E4DA] bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="flex items-center gap-2.5 text-[15px] font-bold text-[#1F2421]">
                    <HelpCircle className="h-5 w-5 shrink-0 text-[#2D4F3E]" />
                    {item.q}
                  </span>
                  <span className="text-xl font-bold text-[#2D4F3E]">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <p className="px-5 pb-5 pl-12 text-[14px] leading-relaxed text-[#5B5F5A]">{item.a}</p>
                )}
              </div>
            );
          })}
        </section>

        <section className="mt-14 rounded-3xl bg-[#1F2421] p-6 text-white sm:p-9">
          <div className="flex items-center gap-2 text-[#A7C4B2]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">No encontraste tu respuesta</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              'Materiales honestos: maderas naturales libres de MDF cuando el producto lo permite.',
              'Fotografía real: cada producto se muestra con sus cuatro vistas antes de publicarse.',
              'Precios claros: te decimos qué incluye y qué no antes de producir.',
              'Trato directo: hablas con el taller, no con un centro de llamadas.'
            ].map(item => (
              <div key={item} className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#7FB79A]" />
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
              onClick={onExplore}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
            <PackageCheck className="mt-0.5 h-5 w-5 text-[#2D4F3E]" />
            <div>
              <h3 className="text-sm font-bold text-[#1F2421]">Soporte</h3>
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
