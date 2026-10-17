import React from 'react';
import { 
  X, 
  MessageCircle, 
  FileText, 
  Calculator, 
  Gamepad2, 
  Gift, 
  Shield, 
  MapPin, 
  ChevronRight,
  Flame,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenArcade,
  onOpenCalculator,
  onOpenWhatsApp,
  onSelectWorld,
  onOpenCart,
  onOpenCatalog,
  cartCount = 0,
  settings
}) {
  if (!isOpen) return null;

  const catalogPdfUrl = settings?.mobileCatalogConfig?.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf';
  const catalogPdfName = settings?.mobileCatalogConfig?.fileName || 'Catalogo_Movil_Artesano_Digital.pdf';
  const isCatalogEnabled = settings?.mobileCatalogConfig?.enabled !== false;

  return (
    <div className="md:hidden fixed inset-0 z-50 select-none">
      {/* Fondo oscuro traslúcido con cierre al tocar */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Panel lateral deslizable desde la izquierda */}
      <aside 
        aria-label="Menú lateral de taller y herramientas"
        className="fixed top-0 bottom-0 left-0 w-[84%] max-w-[330px] bg-white shadow-2xl flex flex-col z-50 animate-slideRight"
      >
        {/* 1. CABECERA DEL DRAWER (Verde Taller + Logo + Cierre) */}
        <div className="bg-[#17251E] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
              <img
                src="/brand/artesano_isotipo_transparente.png"
                alt="Artesano Digital"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-black text-sm tracking-tight truncate text-white">
                Artesano Digital
              </h2>
              <div className="text-[11px] text-[#D4A359] font-medium truncate flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4A359]" />
                <span>Si lo piensas, se hace</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            title="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. ESTADO EN VIVO DEL TALLER */}
        <div className="px-4 py-2.5 bg-[#FAF9F5] border-b border-[#E8E4DA] shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-800">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#2D4F3E] shrink-0" />
              <span>San Luis Potosí, México</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">
              Activo
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
            Manufactura 3D, Corte Láser y Sublimación sin intermediarios.
          </p>
        </div>

        {/* 3. LISTA DE ACCESOS Y HERRAMIENTAS (Scrollable) */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          
          {/* GRUPO: HERRAMIENTAS DE TALLER */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Herramientas de Taller
            </div>

            {/* Cotizador & Calculadora Multi-Material */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCalculator) onOpenCalculator();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Cotizador & Calculadora</div>
                  <div className="text-[10px] text-gray-500">Calcula piezas en 3D, láser o vinil</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Arcade del Taller (¡Aquí vive el Arcade, sin repetirse arriba!) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenArcade) onOpenArcade();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Arcade del Taller</span>
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">Cupones</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Juega y gana descuentos reales</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Catálogo Móvil en PDF (Si está activo) */}
            {isCatalogEnabled && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenCatalog) onOpenCatalog();
                  else window.open(catalogPdfUrl, '_blank');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{settings?.mobileCatalogConfig?.buttonText || 'Catálogo Móvil PDF'}</span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded">9:16</span>
                    </div>
                    <div className="text-[10px] text-gray-500">Descarga o consulta catálogos de temporada</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Ver Ofertas Relámpago (Filtro sutil) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSelectWorld) onSelectWorld('flash');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5 fill-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Ver Productos en Oferta</div>
                  <div className="text-[10px] text-gray-500">Descuentos de taller activos</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Paquetes y Combos */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSelectWorld) onSelectWorld('paquetes-servicios');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Paquetes & Combos</div>
                  <div className="text-[10px] text-gray-500">Kits para eventos, marcas y hogar</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* GRUPO: ATENCIÓN DIRECTA */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Atención Directa
            </div>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenWhatsApp) onOpenWhatsApp();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">WhatsApp con el Artesano</div>
                  <div className="text-[10px] text-gray-500">Atención personalizada y dudas</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* GRUPO: ADMINISTRACIÓN */}
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAdmin) onOpenAdmin();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group text-gray-600 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Administrador de Taller</div>
                  <div className="text-[10px] text-gray-400">Panel de control de precios y catálogo</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* 4. FOOTER DEL DRAWER */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-400 shrink-0">
          Artesano Digital · Hecho en México
        </div>
      </aside>
    </div>
  );
}
