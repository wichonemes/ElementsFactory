import React, { useState, useMemo } from 'react';
import { EyeOff, Eye } from 'lucide-react';

/**
 * SeasonalAtmosphere - Catálogo de 25 Efectos Estacionales y Eventos para Todo el Año
 * Cubre los 12 meses del calendario mexicano y comercial (San Valentín, Día de las Madres,
 * Día del Niño, Fiestas Patrias, Halloween, Día de Muertos, Buen Fin, Navidad, Año Nuevo, etc.)
 */

export const SEASONAL_EFFECTS_META = {
  none: {
    id: 'none',
    month: 'Todos',
    label: 'Sin Efecto',
    icon: '🚫',
    description: 'Vista limpia sin partículas animadas'
  },
  // ENERO
  new_year_fireworks: {
    id: 'new_year_fireworks',
    month: 'Enero',
    label: 'Chispas de Año Nuevo',
    icon: '🎆',
    description: 'Fuegos artificiales, destellos y chispas doradas'
  },
  three_kings_stars: {
    id: 'three_kings_stars',
    month: 'Enero',
    label: 'Reyes Magos & Estrellas',
    icon: '👑',
    description: 'Coronas de reyes, estrellas de Oriente y regalos'
  },
  // FEBRERO
  valentines: {
    id: 'valentines',
    month: 'Febrero',
    label: 'Corazones de San Valentín',
    icon: '💖',
    description: 'Corazones flotantes rosa y rojo pasión'
  },
  cupid_arrows: {
    id: 'cupid_arrows',
    month: 'Febrero',
    label: 'Cupido & Amor Flechado',
    icon: '💘',
    description: 'Flechas con corazón, cartas y lazos de amor'
  },
  // MARZO
  spring_blossom: {
    id: 'spring_blossom',
    month: 'Marzo',
    label: 'Flores de Primavera',
    icon: '🌸',
    description: 'Pétalos de cerezo y flor de durazno meciéndose'
  },
  lucky_clover: {
    id: 'lucky_clover',
    month: 'Marzo',
    label: 'Tréboles de San Patricio',
    icon: '🍀',
    description: 'Tréboles verdes de 4 hojas y monedas de la suerte'
  },
  // ABRIL
  kids_bubbles: {
    id: 'kids_bubbles',
    month: 'Abril',
    label: 'Burbujas Día del Niño',
    icon: '🫧',
    description: 'Burbujas iridiscentes, dulces y globos coloridos'
  },
  easter_eggs: {
    id: 'easter_eggs',
    month: 'Abril',
    label: 'Pascua & Conejitos',
    icon: '🐰',
    description: 'Huevitos decorados, tulipanes y conejitos alegres'
  },
  // MAYO
  mothers_roses: {
    id: 'mothers_roses',
    month: 'Mayo',
    label: 'Rosas Día de las Madres',
    icon: '🌹',
    description: 'Pétalos de rosa roja de gala y destellos dorados'
  },
  craft_pencils: {
    id: 'craft_pencils',
    month: 'Mayo',
    label: 'Día del Maestro & Taller',
    icon: '✏️',
    description: 'Lápices, reglas, libros y estrellas de sabiduría'
  },
  // JUNIO
  fathers_day: {
    id: 'fathers_day',
    month: 'Junio',
    label: 'Día del Padre & Bigotes',
    icon: '👔',
    description: 'Bigotes clásicos, corbatas y copas de festejo'
  },
  gamer_neon: {
    id: 'gamer_neon',
    month: 'Junio',
    label: 'Gamer Fest & Arcade Neón',
    icon: '🎮',
    description: 'Controles de videojuegos, dados, rayos y píxeles'
  },
  // JULIO
  summer_sun: {
    id: 'summer_sun',
    month: 'Julio',
    label: 'Sol Radiante de Verano',
    icon: '☀️',
    description: 'Soles brillantes, destellos cálidos y chispas doradas'
  },
  tropical_paradise: {
    id: 'tropical_paradise',
    month: 'Julio',
    label: 'Paraíso Tropical & Playa',
    icon: '🌴',
    description: 'Olas de mar, palmeras, flores hawaianas y piñas'
  },
  // AGOSTO
  back_to_school: {
    id: 'back_to_school',
    month: 'Agosto',
    label: 'Regreso a Clases & Estudio',
    icon: '🎒',
    description: 'Mochilas, cuadernos, compases y acuarelas'
  },
  starry_galaxy: {
    id: 'starry_galaxy',
    month: 'Agosto',
    label: 'Noche Estrellada & Galaxia',
    icon: '🌌',
    description: 'Estrellas fugaces, constelaciones y polvo cósmico'
  },
  // SEPTIEMBRE
  mexican_fiesta: {
    id: 'mexican_fiesta',
    month: 'Septiembre',
    label: 'Fiestas Patrias de México',
    icon: '🇲🇽',
    description: 'Banderas de México, rehiletes y sombreros de charro'
  },
  patria_confetti: {
    id: 'patria_confetti',
    month: 'Septiembre',
    label: 'Confeti Patrio Tricolor',
    icon: '🎉',
    description: 'Papelitos festivos verde, blanco y rojo vibrante'
  },
  // OCTUBRE
  halloween_spooky: {
    id: 'halloween_spooky',
    month: 'Octubre',
    label: 'Halloween & Murciélagos',
    icon: '🎃',
    description: 'Calabazas de noche, murciélagos y fantasmas flotantes'
  },
  autumn_leaves: {
    id: 'autumn_leaves',
    month: 'Octubre',
    label: 'Hojas Secas de Otoño',
    icon: '🍂',
    description: 'Hojas de arce en tonos ámbar, cobrizo y terracota'
  },
  // NOVIEMBRE
  day_of_dead: {
    id: 'day_of_dead',
    month: 'Noviembre',
    label: 'Día de Muertos & Cempasúchil',
    icon: '🏵️',
    description: 'Pétalos de cempasúchil, papel picado y calaveritas'
  },
  buen_fin_lightning: {
    id: 'buen_fin_lightning',
    month: 'Noviembre',
    label: 'El Buen Fin & Ofertas Flash',
    icon: '⚡',
    description: 'Rayos dorados de oferta, etiquetas y chispas de compras'
  },
  // DICIEMBRE
  snow: {
    id: 'snow',
    month: 'Diciembre',
    label: 'Nieve Navideña Clásica',
    icon: '❄️',
    description: 'Copos cristalinos de invierno y navidad cayendo'
  },
  christmas_magic: {
    id: 'christmas_magic',
    month: 'Diciembre',
    label: 'Magia Navideña & Cascabeles',
    icon: '🎄',
    description: 'Esferas navideñas, pinos decorados, campanas y regalos'
  },
  // CELEBRACIÓN / TODO EL AÑO
  confetti: {
    id: 'confetti',
    month: 'Todo el año',
    label: 'Confeti Festivo & Bodas',
    icon: '🎊',
    description: 'Tiras multicolores para aniversarios, bodas y fiestas'
  }
};

export default function SeasonalAtmosphere({
  effect = 'snow',
  showToggle = true,
  className = ''
}) {
  const [isPaused, setIsPaused] = useState(false);

  // Generación de partículas deterministas según el efecto
  const particles = useMemo(() => {
    if (!effect || effect === 'none') return [];

    let count = 20;
    let symbols = ['❄', '❅', '✻', '•'];
    let colorPalette = ['#FFFFFF', '#E0F2FE', '#BAE6FD'];
    let isRising = false;
    let dropShadow = 'none';

    switch (effect) {
      // ENERO
      case 'new_year_fireworks':
        count = 22;
        symbols = ['🎆', '✨', '⭐', '🎇', '🌟', '✦'];
        colorPalette = ['#FBBF24', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];
        isRising = true;
        dropShadow = '0 0 6px rgba(251,191,36,0.8)';
        break;

      case 'three_kings_stars':
        symbols = ['👑', '⭐', '🎁', '🌟', '✨', '🪙'];
        colorPalette = ['#F59E0B', '#D97706', '#FCD34D', '#F43F5E', '#8B5CF6'];
        dropShadow = '0 0 4px rgba(245,158,11,0.6)';
        break;

      // FEBRERO
      case 'valentines':
        symbols = ['💖', '💕', '❤️', '✨', '💝', '💓'];
        colorPalette = ['#F43F5E', '#FB7185', '#E11D48', '#FDA4AF'];
        isRising = true;
        dropShadow = '0 0 5px rgba(244,63,94,0.7)';
        break;

      case 'cupid_arrows':
        symbols = ['💘', '💌', '✨', '💓', '🏹', '💕'];
        colorPalette = ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#FFFFFF'];
        break;

      // MARZO
      case 'spring_blossom':
        symbols = ['🌸', '💮', '🌺', '✨', '🍃', '🌸'];
        colorPalette = ['#F472B6', '#FB7185', '#FDA4AF', '#FFFFFF', '#86EFAC'];
        break;

      case 'lucky_clover':
        symbols = ['🍀', '☘️', '🪙', '✨', '🌿', '💚'];
        colorPalette = ['#10B981', '#059669', '#34D399', '#FBBF24'];
        dropShadow = '0 0 4px rgba(16,185,129,0.5)';
        break;

      // ABRIL
      case 'kids_bubbles':
        count = 22;
        symbols = ['🫧', '🎈', '🍭', '🍬', '✨', '🫧'];
        colorPalette = ['#38BDF8', '#818CF8', '#F472B6', '#FBBF24', '#34D399'];
        isRising = true;
        dropShadow = '0 0 4px rgba(56,189,248,0.7)';
        break;

      case 'easter_eggs':
        symbols = ['🥚', '🐰', '🌷', '🐣', '🌸', '🥚'];
        colorPalette = ['#F472B6', '#A78BFA', '#34D399', '#FDE047', '#38BDF8'];
        break;

      // MAYO
      case 'mothers_roses':
        symbols = ['🌹', '💐', '✨', '🥀', '💖', '🌹'];
        colorPalette = ['#E11D48', '#BE123C', '#FB7185', '#F59E0B'];
        dropShadow = '0 0 5px rgba(225,29,72,0.6)';
        break;

      case 'craft_pencils':
        symbols = ['✏️', '📐', '📚', '⭐', '✂️', '📏'];
        colorPalette = ['#F59E0B', '#3B82F6', '#EF4444', '#10B981'];
        break;

      // JUNIO
      case 'fathers_day':
        symbols = ['👔', '🎩', '🕶️', '🍺', '✨', '⌚'];
        colorPalette = ['#1E293B', '#3B82F6', '#D97706', '#64748B'];
        break;

      case 'gamer_neon':
        count = 22;
        symbols = ['🎮', '👾', '🕹️', '⚡', '✨', '🎲'];
        colorPalette = ['#06B6D4', '#A855F7', '#22C55E', '#F43F5E', '#EAB308'];
        isRising = true;
        dropShadow = '0 0 6px rgba(6,182,212,0.8)';
        break;

      // JULIO
      case 'summer_sun':
        symbols = ['☀️', '✨', '⭐', '🌟', '🕶️', '☀️'];
        colorPalette = ['#FCD34D', '#F59E0B', '#FDE047', '#FEF08A'];
        isRising = true;
        dropShadow = '0 0 6px rgba(253,224,71,0.8)';
        break;

      case 'tropical_paradise':
        symbols = ['🌴', '🌊', '🍍', '🌺', '🥥', '🏖️'];
        colorPalette = ['#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];
        break;

      // AGOSTO
      case 'back_to_school':
        symbols = ['🎒', '🎨', '📏', '✏️', '📓', '✂️'];
        colorPalette = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981'];
        break;

      case 'starry_galaxy':
        count = 24;
        symbols = ['🌌', '✨', '🌠', '🪐', '⭐', '✦'];
        colorPalette = ['#818CF8', '#C084FC', '#38BDF8', '#FDE047', '#FFFFFF'];
        isRising = true;
        dropShadow = '0 0 6px rgba(192,132,252,0.8)';
        break;

      // SEPTIEMBRE
      case 'mexican_fiesta':
        symbols = ['🇲🇽', '🎺', '🪅', '🪕', '✨', '🇲🇽'];
        colorPalette = ['#059669', '#DC2626', '#FFFFFF', '#F59E0B'];
        dropShadow = '0 0 4px rgba(220,38,38,0.5)';
        break;

      case 'patria_confetti':
        count = 24;
        symbols = ['🟢', '⚪', '🔴', '🇲🇽', '✦', '★'];
        colorPalette = ['#059669', '#F9FAFB', '#DC2626', '#10B981'];
        break;

      // OCTUBRE
      case 'halloween_spooky':
        symbols = ['🎃', '🦇', '👻', '🕸️', '✨', '🎃'];
        colorPalette = ['#F97316', '#7C3AED', '#10B981', '#F59E0B'];
        dropShadow = '0 0 5px rgba(249,115,22,0.7)';
        break;

      case 'autumn_leaves':
        symbols = ['🍂', '🍁', '🌾', '🍃', '🍂', '🍁'];
        colorPalette = ['#D97706', '#B45309', '#92400E', '#EA580C', '#78350F'];
        break;

      // NOVIEMBRE
      case 'day_of_dead':
        symbols = ['🏵️', '💀', '🌼', '🕯️', '✨', '🏵️'];
        colorPalette = ['#F59E0B', '#D97706', '#FBBF24', '#EC4899', '#8B5CF6'];
        dropShadow = '0 0 5px rgba(245,158,11,0.7)';
        break;

      case 'buen_fin_lightning':
        count = 22;
        symbols = ['⚡', '🔥', '🏷️', '💰', '✨', '⚡'];
        colorPalette = ['#F59E0B', '#EF4444', '#FBBF24', '#E11D48'];
        isRising = true;
        dropShadow = '0 0 6px rgba(245,158,11,0.8)';
        break;

      // DICIEMBRE
      case 'christmas_magic':
        symbols = ['🎄', '🔔', '🎁', '🍬', '✨', '⭐'];
        colorPalette = ['#16A34A', '#DC2626', '#F59E0B', '#F8FAFC'];
        dropShadow = '0 0 5px rgba(22,163,74,0.6)';
        break;

      case 'confetti':
        count = 24;
        symbols = ['🎊', '🎉', '🎈', '✦', '★', '■', '▲'];
        colorPalette = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
        break;

      case 'snow':
      default:
        count = 22;
        symbols = ['❄', '❅', '✻', '•', '❄'];
        colorPalette = ['#FFFFFF', '#E0F2FE', '#BAE6FD'];
        dropShadow = 'drop-shadow(0 0 3px rgba(255,255,255,0.85))';
        break;
    }

    const items = [];
    for (let i = 0; i < count; i++) {
      const left = (i * (100 / count) + (Math.sin(i * 99) * 3.5)) % 100;
      const duration = 5.5 + (Math.sin(i * 13) + 1) * 3.5; // 5.5s a 12.5s
      const delay = (i * 0.35) % 5; // desfase uniforme
      const size = 14 + Math.floor(((Math.cos(i * 33) + 1) / 2) * 16); // 14px a 30px
      const symbol = symbols[i % symbols.length];
      const color = colorPalette[i % colorPalette.length];
      const opacity = 0.5 + ((Math.sin(i * 77) + 1) / 2) * 0.45; // 0.5 a 0.95
      const swayOffset = 18 + (i % 6) * 7; // vaivén controlado

      items.push({
        id: i,
        left: `${left.toFixed(1)}%`,
        duration: `${duration.toFixed(1)}s`,
        delay: `${delay.toFixed(1)}s`,
        size: `${size}px`,
        symbol,
        color,
        opacity,
        swayOffset: `${swayOffset}px`,
        isRising,
        dropShadow
      });
    }

    return items;
  }, [effect]);

  if (!effect || effect === 'none' || particles.length === 0) {
    return null;
  }

  const currentMeta = SEASONAL_EFFECTS_META[effect] || SEASONAL_EFFECTS_META.snow;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Animaciones CSS con límites relativos porcentuales seguros para cualquier contenedor */}
      <style>{`
        @keyframes seasonalFallDirect {
          0% {
            top: -35px;
            opacity: 0;
            transform: translateX(0) rotate(0deg);
          }
          12% {
            opacity: var(--particle-opacity, 0.85);
          }
          88% {
            opacity: var(--particle-opacity, 0.85);
          }
          100% {
            top: calc(100% + 35px);
            opacity: 0;
            transform: translateX(var(--particle-sway, 25px)) rotate(360deg);
          }
        }

        @keyframes seasonalRiseDirect {
          0% {
            bottom: -35px;
            opacity: 0;
            transform: translateX(0) scale(0.7) rotate(0deg);
          }
          12% {
            opacity: var(--particle-opacity, 0.85);
          }
          88% {
            opacity: var(--particle-opacity, 0.85);
          }
          100% {
            bottom: calc(100% + 35px);
            opacity: 0;
            transform: translateX(var(--particle-sway, 20px)) scale(1.15) rotate(180deg);
          }
        }

        .seasonal-fall-anim {
          animation-name: seasonalFallDirect;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: top, transform, opacity;
        }

        .seasonal-rise-anim {
          animation-name: seasonalRiseDirect;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: bottom, transform, opacity;
        }
      `}</style>

      {/* Partículas animadas */}
      {!isPaused && (
        <div className="absolute inset-0">
          {particles.map(p => {
            const animationClass = p.isRising ? 'seasonal-rise-anim' : 'seasonal-fall-anim';
            return (
              <span
                key={p.id}
                className={`absolute ${animationClass}`}
                style={{
                  left: p.left,
                  fontSize: p.size,
                  color: p.color,
                  '--particle-opacity': p.opacity,
                  '--particle-sway': p.swayOffset,
                  animationDuration: p.duration,
                  animationDelay: p.delay,
                  textShadow: '0 2px 6px rgba(0,0,0,0.35)',
                  filter: p.dropShadow !== 'none' ? p.dropShadow : undefined
                }}
              >
                {p.symbol}
              </span>
            );
          })}
        </div>
      )}

      {/* Botón de control de animación */}
      {showToggle && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsPaused(prev => !prev)}
            title={isPaused ? 'Reanudar animación de temporada' : 'Pausar animación de temporada'}
            className="px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/20 text-[11px] font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="text-xs">{currentMeta.icon}</span>
            <span className="hidden sm:inline">
              {isPaused ? 'Activar animación' : currentMeta.label}
            </span>
            {isPaused ? (
              <Eye className="w-3 h-3 text-amber-300" />
            ) : (
              <EyeOff className="w-3 h-3 text-gray-300 opacity-60 hover:opacity-100" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
