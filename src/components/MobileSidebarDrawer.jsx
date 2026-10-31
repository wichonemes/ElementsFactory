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
  ArrowRight,
  Lock,
  TrendingUp,
  Heart,
  HelpCircle,
  Users,
  Award,
  Camera,
  Home
} from 'lucide-react';

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenArcade,
  onOpenCalculator,
  onOpenWhatsApp,
  onSelectWorld,
  onGoHome,
  onOpenCart,
  onOpenCatalog,
  onOpenAffiliates,
  onOpenAbout,
  onOpenFaq,
  onOpenLoyalty,
  cartCount = 0,
  settings
}) {
  if (!isOpen) return null;

  const catalogPdfUrl = settings?.mobileCatalogConfig?.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf';
  const isCatalogEnabled = settings?.mobileCatalogConfig?.enabled !== false;
  const whatsappNum = (settings?.whatsappNumber || '524442818795').replace(/[^0-9]/g, '');

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
        className="fixed top-0 bottom-0 left-0 w-[86%] max-w-[340px] bg-white shadow-2xl flex flex-col z-50 animate-slideRight"
      >
        {/* 1. CABECERA DEL DRAWER (Verde Taller + Logo + Cierre) */}
        <div className="bg-[#17251E] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div 
            onClick={() => {
              onClose();
              if (onGoHome) onGoHome();
            }}
            className="flex items-center gap-3 min-w-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
              <img 
                loading="lazy"
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
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. ESTADO EN VIVO DEL TALLER */}
        <div className="px-4 py-2 bg-[#FAF9F5] border-b border-[#E8E4DA] shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-800">
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#2D4F3E] shrink-0" />
              <span>San Luis Potosí, México</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-black shrink-0">
              Taller Activo
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
            Manufactura 3D, Corte Láser y Sublimación sin intermediarios.
          </p>
        </div>

        {/* 3. LISTA DE ACCESOS Y HERRAMIENTAS (Scrollable) */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          
          {/* GRUPO DESTACADO: NOVEDADES & GANANCIAS */}
          <div className="p-2 space-y-1 bg-gradient-to-b from-amber-50/40 to-transparent">
            <div className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Novedades &amp; Beneficios</span>
            </div>

            {/* Gana Dinero / Mayoreo y Afiliados */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAffiliates) onOpenAffiliates();
                else window.location.href = '/afiliados';
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:bg-amber-100/60 active:bg-amber-200/50 transition-all text-left group cursor-pointer border border-amber-300/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                    <span>Gana Dinero: Mayoreo &amp; Afiliados</span>
                    <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-full">Nuevo</span>
                  </div>
                  <div className="text-[10.5px] text-amber-900 font-medium">Gana comisiones y descuentos por volumen</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Club Artesano: Tarjeta de Lealtad (Sellos) */}
            {onOpenLoyalty && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLoyalty();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 active:bg-emerald-100/50 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>Club Artesano</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">Sellos</span>
                    </div>
                    <div className="text-[10px] text-gray-500">Junta sellos con tus pedidos y gana regalos</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Facebook Oficial & Premio por Foto */}
            <a
              href="/facebook"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 active:bg-blue-100/50 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Facebook Oficial</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">5% a 10% OFF</span>
                  </div>
                  <div className="text-[10px] text-gray-500">10% hasta $300 o 5% mayores · No acumulable</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* GRUPO: HERRAMIENTAS DE TALLER */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Herramientas de Taller
            </div>

            {/* Ir al Catálogo Principal */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onGoHome) onGoHome();
                else if (onSelectWorld) onSelectWorld('all');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Catálogo Completo</div>
                  <div className="text-[10px] text-gray-500">Ver todas las piezas y colecciones</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

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
                  <div className="text-xs font-bold text-gray-900">Cotizador &amp; Calculadora</div>
                  <div className="text-[10px] text-gray-500">Calcula piezas en 3D, láser o vinil</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Arcade del Taller */}
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

            {/* Catálogo Móvil en PDF */}
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
                    <div className="text-[10px] text-gray-500">Descarga catálogos de temporada</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Ver Ofertas Relámpago */}
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
                  <Flame className="w-5 h-5 fill-orange-500 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Ver Productos en Oferta</div>
                  <div className="text-[10px] text-gray-500">Descuentos de taller activos</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Centro de Servicios Especializados */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSelectWorld) onSelectWorld('servicios');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/50 active:bg-amber-100/50 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-[#D4A359]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <span>Servicios</span>
                    <span className="text-[9px] bg-[#17251E] text-[#D4A359] px-1.5 py-0.2 rounded-full font-bold">B2B</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Diseño, Publicidad &amp; Industria</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* GRUPO: CONOCE EL TALLER & AYUDA */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Conoce el Taller &amp; Ayuda
            </div>

            {/* Sobre Nosotros */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAbout) onOpenAbout();
                else window.location.href = '/nosotros';
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 active:bg-emerald-100/50 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Sobre el Taller (Nosotros)</div>
                  <div className="text-[10px] text-gray-500">Quiénes somos, valores y cómo trabajamos</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Preguntas Frecuentes (FAQ) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenFaq) onOpenFaq();
                else window.location.href = '/faq';
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Preguntas Frecuentes (FAQ)</div>
                  <div className="text-[10px] text-gray-500">Tiempos, envíos, cotizaciones y materiales</div>
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
                else window.open(`https://wa.me/${whatsappNum}?text=Hola%20Artesano%20Digital,%20tengo%20una%20consulta.`, '_blank');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">WhatsApp con el Artesano</div>
                  <div className="text-[10px] text-gray-500">Atención personalizada y cotizaciones</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

        {/* 4. FOOTER DEL DRAWER */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenAdmin) onOpenAdmin();
            }}
            className="text-[9px] text-gray-400/40 hover:text-gray-600 flex items-center gap-1 cursor-pointer transition-opacity select-none py-0.5 px-1 rounded hover:bg-gray-200/50"
            title="Taller"
            aria-label="Taller"
          >
            <Lock className="w-2.5 h-2.5 opacity-50" />
            <span className="text-[8.5px]">taller</span>
          </button>
          <span className="text-gray-400 select-none">Artesano Digital · Hecho en México</span>
        </div>
      </aside>
    </div>
  );
}
