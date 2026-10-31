import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale, Lock, CheckCircle2 } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F2421] via-[#2D4F3E] to-[#1F2421] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold font-heading text-white tracking-tight">
                Marco Legal y Garantías
              </h3>
              <p className="text-xs text-emerald-200/80">
                Artesano Digital · Taller Oficial México
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#2D4F3E] text-[#2D4F3E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Aviso de Privacidad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#2D4F3E] text-[#2D4F3E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Términos y Condiciones</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('warranty')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'warranty'
                ? 'border-[#2D4F3E] text-[#2D4F3E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Garantía y Envíos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <strong>Cumplimiento Legal:</strong> Este aviso se expide con apego a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) en México.
              </div>

              <h4 className="font-bold text-stone-900 text-sm">1. Identidad y Domicilio del Responsable</h4>
              <p>
                <strong>Artesano Digital</strong>, con taller y domicilio de operaciones en San Luis Potosí, S.L.P., México, es responsable del tratamiento legítimo, controlado e informado de sus datos personales.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Datos Personales Recabados</h4>
              <p>
                Para la elaboración de cotizaciones, diseño personalizado y procesamiento de envíos, podemos recabar:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nombre completo o razón social del cliente.</li>
                <li>Número telefónico y cuenta de WhatsApp para atención y seguimiento.</li>
                <li>Correo electrónico de contacto.</li>
                <li>Dirección de entrega (calle, colonia, código postal y ciudad).</li>
                <li>Archivos gráficos, logotipos o especificaciones para personalización.</li>
              </ul>

              <h4 className="font-bold text-stone-900 text-sm">3. Finalidades del Tratamiento</h4>
              <p>
                Sus datos son utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Elaborar cotizaciones y registrar pedidos en el sistema de producción.</li>
                <li>Coordinar entregas locales y envíos nacionales por paquetería (DHL, FedEx, Estafeta).</li>
                <li>Enviar avances fotográficos de taller y confirmación de guías de rastreo.</li>
                <li>Facturación electrónica en caso de ser solicitada.</li>
              </ul>

              <h4 className="font-bold text-stone-900 text-sm">4. Ejercicio de Derechos ARCO</h4>
              <p>
                Usted tiene derecho a conocer qué datos tenemos de usted, para qué los usamos y las condiciones de uso (Acceso). Asimismo, puede solicitar la corrección (Rectificación), eliminación de nuestros registros (Cancelación) oponerse al uso de sus datos para fines específicos (Oposición). Para ejercer estos derechos, envíe un correo a <strong>contactoartesanodigital@gmail.com</strong> indicando su solicitud.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h4 className="font-bold text-stone-900 text-sm">1. Naturaleza de los Productos</h4>
              <p>
                Los productos elaborados por Artesano Digital son piezas artesanales y de manufactura digital (impresión 3D, corte láser, sublimación y vinil). Cada pieza se fabrica bajo pedido atendiendo las especificaciones acordadas con el cliente.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Aprobación de Diseños y Tolerancias</h4>
              <p>
                En pedidos con personalización (nombres, logotipos o medidas especiales), el cliente aprueba el diseño previo a la fabricación. Debido a la tecnología de manufactura aditiva y corte, existen tolerancias estándar de taller (±0.2 a ±0.5 mm) y variaciones sutiles de veta en madera natural o textura en filamentos que certifican su carácter artesanal.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. Precios y Formas de Pago</h4>
              <p>
                Todos los precios cotizados están expresados en Pesos Mexicanos (MXN). Las órdenes de taller se inician una vez confirmado el anticipo o pago acordado (transferencia SPEI, tarjeta bancaria o efectivo en taller).
              </p>

              <h4 className="font-bold text-stone-900 text-sm">4. Cancelaciones y Cambios</h4>
              <p>
                Por tratarse de productos fabricados a la medida con insumos cortados o impresos de manera exclusiva, las cancelaciones proceden únicamente antes de que el trabajo ingrese a la máquina de producción. Una vez iniciada la manufactura, no aplican cancelaciones sobre productos personalizados.
              </p>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-4">
              <h4 className="font-bold text-stone-900 text-sm">1. Garantía Artesanal de Satisfacción</h4>
              <p>
                Garantizamos que su pieza se fabrica con materiales de primera calidad (PLA de alta tenacidad, MDF de primera, acrílico óptico y viniles de grado comercial).
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Reposición prioritaria:</strong> Si su pedido llega con algún defecto de fabricación evidente o sufre daño comprobable durante el traslado de paquetería, repone el producto sin costo notificando en las primeras 48 horas tras su recepción con fotos de evidencia al WhatsApp oficial.
                </div>
              </div>

              <h4 className="font-bold text-stone-900 text-sm">2. Cobertura de Envíos</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Local (San Luis Potosí):</strong> Entrega en taller o punto acordado en zona metropolitana.</li>
                <li><strong>Nacional:</strong> Envíos a toda la República Mexicana por paqueterías certificadas con número de rastreo oficial.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D4F3E] hover:bg-[#1F2421] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
