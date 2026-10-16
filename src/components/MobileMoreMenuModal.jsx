import React from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  FileText, 
  Calculator, 
  Gamepad2, 
  Gift, 
  Shield, 
  MapPin, 
  ExternalLink, 
  ChevronRight,
  Home,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function MobileMoreMenuModal({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenArcade,
  onOpenCalculator,
  onOpenWhatsApp,
  onSelectPackages,
  settings
}) {
  if (!isOpen) return null;

  const catalogPdfUrl = settings?.mobileCatalogConfig?.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf';
  const catalogPdfName = settings?.mobileCatalogConfig?.fileName || 'Catalogo_Movil_Artesano_Digital.pdf';
  const isCatalogEnabled = settings?.mobileCatalogConfig?.enabled !== false;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn select-none">
      {/* 1. Cabecera estilo Mercado Libre (Captura 2) */}
      <div className="bg-[#17251E] text-white p-4 flex items-center justify-between border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 p-1 flex items-center justify-center">
              <img
                src="/brand/artesano_isotipo_transparente.png"
                alt="Artesano Digital"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight">Artesano Digital</div>
              <div className="text-[11px] text-[#D4A359] font-medium flex items-center gap-1">
                <span>Si lo piensas, se hace</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjeta de Estado del Taller */}
      <div className="p-3 bg-[#FAF9F5] border-b border-[#E8E4DA]">
        <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-900">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2D4F3E]" />
              <span>Taller Activo en San Luis Potosí</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Envíos Nacionales
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-snug">
            Cotizamos y fabricamos piezas personalizadas sin mínimos forzados.
          </p>
        </div>
      </div>

      {/* 3. Lista de Accesos estilo Menú Más de Mercado Libre (Captura 2) */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {/* WhatsApp Directo */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenWhatsApp) onOpenWhatsApp();
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">WhatsApp de Taller</div>
              <div className="text-[10px] text-gray-500">Asesoría directa y resolución de dudas</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Catálogo Móvil PDF */}
        {isCatalogEnabled && (
          <a
            href={catalogPdfUrl}
            download={catalogPdfName}
            onClick={onClose}
            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">
                  {settings?.mobileCatalogConfig?.buttonText || 'Catálogo Móvil PDF (9:16)'}
                </div>
                <div className="text-[10px] text-gray-500">Formato vertical para celular con enlaces MakerWorld</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
        )}

        {/* Calculadora Cotizadora */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenCalculator) onOpenCalculator();
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Calculadora de Cotizaciones</div>
              <div className="text-[10px] text-gray-500">Estima costos según técnica y medidas</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Arcade del Taller & Cupones */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenArcade) onOpenArcade('play');
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Arcade &amp; Canje de Cupones</div>
              <div className="text-[10px] text-gray-500">Juega y obtén descuentos para tus pedidos</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Paquetes y Combos */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onSelectPackages) onSelectPackages();
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Paquetes y Combos Listos</div>
              <div className="text-[10px] text-gray-500">Kits para hogar, negocios y eventos con descuento</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Panel de Administración */}
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenAdmin) onOpenAdmin();
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-amber-50/50 active:bg-amber-100/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Panel de Administración</div>
              <div className="text-[10px] text-amber-800/80">Acceso exclusivo para el taller</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700" />
        </button>
      </div>
    </div>
  );
}
