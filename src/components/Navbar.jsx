import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Shield, Phone, Sparkles, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { formatServiceDate } from '../utils/serviceStatus';

export default function Navbar({
  activeWorld,
  onSelectWorld,
  onGoHome,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenArcade,
  searchQuery,
  onSearchChange,
  onOpenCatalog,
  settings
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const worlds = [
    { id: 'hogar', label: 'Hogar' },
    { id: 'negocios', label: 'Negocios' },
    { id: 'eventos', label: 'Eventos Especiales' },
    { id: 'paquetes-servicios', label: 'Paquetes y Servicios', isSpecial: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#E8E4DA] transition-all">
      {/* Top Banner */}
      <div className="bg-[#1F2421] text-xs text-gray-300 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              settings?.serviceStatus?.isPaused
                ? 'bg-amber-400 animate-ping'
                : (settings?.serviceStatus?.localService === false || settings?.serviceStatus?.nationalService === false)
                ? 'bg-amber-300'
                : 'bg-emerald-400 animate-pulse'
            }`}></span>
            <span className="truncate">
              {settings?.serviceStatus?.isPaused ? (
                <span className="text-amber-300 font-bold">
                  ⏸️ Taller en receso técnico hasta el {formatServiceDate(settings.serviceStatus.pausedUntilDate) || 'próximo aviso'} · Cotizaciones abiertas
                </span>
              ) : settings?.serviceStatus?.localService && settings?.serviceStatus?.nationalService === false ? (
                <span className="text-amber-200">
                  📍 Entregas locales y taller activos en SLP · Envíos nacionales en pausa
                </span>
              ) : settings?.serviceStatus?.localService === false && settings?.serviceStatus?.nationalService ? (
                <span className="text-amber-200">
                  📦 Envíos nacionales activos a toda la República · Entregas locales en pausa
                </span>
              ) : settings?.serviceStatus?.localService === false && settings?.serviceStatus?.nationalService === false ? (
                <span className="text-rose-300 font-bold">
                  ⛔ Envíos y entregas temporalmente en pausa · Consultas activas
                </span>
              ) : (
                'Taller mexicano de fabricación & personalización · Impresión 3D · Láser · Sublimación · Vinil Textil'
              )}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-gray-400">
            {settings?.mobileCatalogConfig?.enabled !== false && settings?.mobileCatalogConfig?.showInNavbar !== false && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenCatalog) onOpenCatalog();
                  else window.open(settings?.mobileCatalogConfig?.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf', '_blank');
                }}
                className="hover:text-amber-300 flex items-center gap-1 transition-colors text-amber-200/90 font-medium text-[11px] cursor-pointer"
                title={settings?.mobileCatalogConfig?.title || 'Catálogos Oficiales de Temporada en PDF'}
              >
                <span>📱</span> {settings?.mobileCatalogConfig?.buttonText || 'Catálogo Móvil PDF'}
              </button>
            )}
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hola%20Artesano%20Digital,%20tengo%20una%20consulta.`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp directo
              </a>
            )}
            {onOpenArcade && (
              <button
                onClick={() => onOpenArcade('play')}
                className="hover:text-amber-300 flex items-center gap-1 transition-colors text-amber-300 font-bold cursor-pointer"
                title="Arcade del Taller y Canje de Cupones"
              >
                <span>🕹️</span> Arcade &amp; Cupones
              </button>
            )}
            <button
              onClick={onOpenAdmin}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Panel de Administración"
            >
              <Shield className="w-3 h-3 text-amber-400" /> Administración
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo - Clic manda al inicio */}
          <button
            onClick={() => {
              if (onGoHome) {
                onGoHome();
              } else {
                onSelectWorld('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              setMobileMenuOpen(false);
            }}
            className="text-left focus:outline-none cursor-pointer"
            title="Ir al inicio"
          >
            <BrandLogo showTagline={true} />
          </button>

          {/* Center Navigation - The 3 Worlds & Paquetes y Servicios */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F4F0E8] p-1.5 rounded-full border border-[#E8E4DA]">
            {worlds.map(w => {
              const isActive = activeWorld === w.id;
              if (w.isSpecial) {
                return (
                  <button
                    key={w.id}
                    onClick={() => onSelectWorld(w.id)}
                    className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#9E472A] text-white shadow-sm'
                        : 'text-[#9E472A] hover:bg-[#FAF7F0] font-bold'
                    }`}
                  >
                    <span>{w.label}</span>
                  </button>
                );
              }
              return (
                <button
                  key={w.id}
                  onClick={() => onSelectWorld(w.id)}
                  className={`px-4 xl:px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#2D4F3E] text-white shadow-sm'
                      : 'text-[#4A5568] hover:text-[#1F2421] hover:bg-black/5'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search bar desktop */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código, técnica..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-white border border-[#E8E4DA] focus:border-[#2D4F3E] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="md:hidden p-2 text-gray-600 hover:text-[#1F2421] rounded-full hover:bg-gray-100"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              title="Abrir Carrito"
              aria-label="Abrir Carrito"
              className="relative flex items-center gap-2 bg-[#2D4F3E] text-white px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#22382C] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="bg-[#D82B6E] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#1F2421] rounded-lg"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {showSearchInput && (
          <div className="md:hidden pb-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos, códigos (ej. L14, T38)..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-8 py-2 text-base rounded-xl bg-white border border-[#E8E4DA] focus:border-[#2D4F3E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E4DA] bg-white px-4 pt-3 pb-6 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
            Áreas de Catálogo
          </div>
          <div className="space-y-1">
            {worlds.map(w => {
              const isActive = activeWorld === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    onSelectWorld(w.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? (w.isSpecial ? 'bg-[#9E472A] text-white font-bold' : 'bg-[#2D4F3E] text-white font-semibold')
                      : (w.isSpecial ? 'text-[#9E472A] font-bold hover:bg-[#FAF7F0]' : 'text-gray-700 hover:bg-[#FBF9F5]')
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{w.label}</span>
                  </span>
                  {isActive && <Sparkles className="w-4 h-4 text-amber-200" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            {onOpenArcade && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenArcade('play');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  <span>🕹️</span> Arcade del Taller
                </button>
                <button
                  onClick={() => {
                    onOpenArcade('rewards');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  <span>🎁</span> Canje de Cupones
                </button>
              </div>
            )}

            {settings?.mobileCatalogConfig?.enabled !== false && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCatalog) onOpenCatalog();
                  else window.open(settings?.mobileCatalogConfig?.fileUrl || '/downloads/catalogo_movil_artesano_digital.pdf', '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#2D4F3E]/20 bg-[#FAF9F5] text-[#2D4F3E] text-xs font-bold shadow-2xs cursor-pointer"
                title={settings?.mobileCatalogConfig?.title || 'Catálogos Oficiales de Temporada (PDF 9:16)'}
              >
                <span>📱</span>
                <span>{settings?.mobileCatalogConfig?.buttonText ? `${settings.mobileCatalogConfig.buttonText}` : 'Catálogos Oficiales de Temporada (PDF 9:16)'}</span>
              </button>
            )}

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <button
                type="button"
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-[10px] text-gray-400/60 hover:text-gray-600 flex items-center gap-1 cursor-pointer transition-colors py-0.5 px-1 rounded hover:bg-gray-100"
                title="Gestión de Taller"
                aria-label="Gestión de Taller"
              >
                <Lock className="w-2.5 h-2.5 opacity-50" />
                <span>Taller</span>
              </button>
              <span className="text-gray-400">Artesano Digital</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
