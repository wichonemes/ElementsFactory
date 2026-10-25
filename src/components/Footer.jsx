import React from 'react';
import { Shield, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer({ onSelectWorld, onOpenAdmin, settings }) {
  return (
    <footer className="bg-[#1F2421] text-gray-300 border-t border-black/20 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo light={true} showTagline={true} />
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Taller mexicano especializado en diseño, personalización y fabricación de productos. Creamos piezas que comunican tu identidad, organizan tus espacios y acompañan tus mejores recuerdos.
            </p>
            <div className="text-gray-400 space-y-1.5 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings?.serviceZone || 'Envíos a todo México'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{settings?.businessHours || 'Lunes a Viernes 9:00 - 18:00 hrs'}</span>
              </div>
            </div>
          </div>

          {/* Áreas Col */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-heading">
              Áreas del Catálogo
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectWorld('all')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Principal (Todo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('hogar')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Hogar &amp; Decoración
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('negocios')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Negocios &amp; Marca
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('juguetes')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Juguetes Articulados
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('personalizados')}
                  className="hover:text-sky-300 transition-colors text-left text-sky-400 font-bold"
                >
                  Personalizados (Funko &amp; 3D)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('eventos')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Eventos Especiales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('paquetes-servicios')}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1 text-[#E5C378] font-bold"
                >
                  <span>Paquetes &amp; Combos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('industria')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Industria &amp; Prototipos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectWorld('publicidad-desarrollo')}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1 text-[#e8b84f] font-bold"
                >
                  <span>Diseño y Publicidad</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Techniques Col */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-heading">
              Técnicas de Fabricación
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>Impresión 3D de alta definición</li>
              <li>Corte y grabado Láser</li>
              <li>Sublimación cerámica y textil</li>
              <li>Vinil de corte y rotulación</li>
              <li>Placas inteligentes con NFC</li>
            </ul>
          </div>

          {/* Contact & Admin Col */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-heading">
              Atención Comercial
            </h4>
            <div className="space-y-2.5">
              {settings?.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hola%20Artesano%20Digital,%20me%20gustar%C3%ADa%20hacer%20una%20consulta.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#25D366] hover:text-white transition-all text-xs font-semibold text-emerald-300"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp de Pedidos</span>
                </a>
              )}
              {settings?.businessEmail && (
                <a
                  href={`mailto:${settings.businessEmail}?subject=Consulta%20-%20Artesano%20Digital`}
                  className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group"
                  title="Enviar correo a Artesano Digital"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400/80 group-hover:text-emerald-400 shrink-0" />
                  <span className="truncate font-medium">{settings.businessEmail}</span>
                </a>
              )}
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
                  title="Gestión de Taller"
                >
                  <Shield className="w-3.5 h-3.5 opacity-60" />
                  <span>Acceso de Taller</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Artesano Digital. Todos los derechos reservados. Hecho en México.
          </div>
          <div className="flex items-center gap-1">
            <span>Diseño sobrio, formal y creativo</span>
            <span className="text-[#D82B6E]">✦</span>
            <span>Si lo piensas, se hace</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
