import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useArcadeSession } from '../hooks/useArcadeSession';
import { getDailyArcadeCoupons } from '../utils/couponsHelper';
import { playMario1UpSound } from '../utils/soundEffects';
import {
  X, Trophy, Volume2, VolumeX, Flame, Zap, Award, Gift,
  Sparkles, Check, Copy, ArrowRight, Play, RotateCcw, Clock,
  ChevronRight, Heart, Shield, HelpCircle, Gamepad2, Star,
  Lock, Unlock, Coins, RotateCw, Smartphone, Maximize2, Minimize2
} from 'lucide-react';

// Web Audio API Retro Sound Synthesizer (0 external files)
export class RetroAudioSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'coin') {
        // Tono retro icónico estilo Mario (B5 -> E6)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'stack' || type === 'blip') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(540, now + 0.06);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.setValueAtTime(240, now + 0.1);
        osc.frequency.setValueAtTime(190, now + 0.2);
        osc.frequency.setValueAtTime(130, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);
          subOsc.type = 'square';
          subOsc.frequency.setValueAtTime(freq, now + i * 0.08);
          subGain.gain.setValueAtTime(0.12, now + i * 0.08);
          subGain.gain.linearRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
          subOsc.start(now + i * 0.08);
          subOsc.stop(now + i * 0.08 + 0.15);
        });
      }
    } catch {
      // AudioContext fallback
    }
  }
}

export const soundSynth = new RetroAudioSynth();

// Catálogo expandido de 10 Mini-Juegos completos de Taller
export const GAMES = [
  {
    id: 'dino',
    title: 'Dino Taller Runner',
    subtitle: 'Salta y esquiva virutas y carretes',
    icon: '🦖',
    badge: '★ Carrera',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Toca la pantalla o presiona [Espacio] para saltar soportes y recoger monedas en la cinta transportadora.'
  },
  {
    id: 'stacker',
    title: 'Torre 3D de Precisión',
    subtitle: 'Apila capas perfectas de filamento',
    icon: '🏗️',
    badge: 'Habilidad 3D',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Toca en el momento exacto para alinear cada capa. ¡El sobrante se recortará!'
  },
  {
    id: 'laser',
    title: 'Corte Láser Reflex',
    subtitle: 'Timing perfecto en la mira láser',
    icon: '⚡',
    badge: 'Ritmo & Reflejo',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Toca la pantalla justo cuando el disco de material pase por la mira central del láser.'
  },
  {
    id: 'collector',
    title: 'Atrapa-Piezas de Taller',
    subtitle: 'Recoge llaveros y esquiva viruta',
    icon: '🧺',
    badge: 'Acción Rápida',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Mueve la canasta arrastrando, tocando a los lados o con flechas para atrapar productos terminados.'
  },
  {
    id: 'drone',
    title: 'Flappy Dron Express',
    subtitle: 'Vuelo entre estantes de taller',
    icon: '🛸',
    badge: 'Vuelo Táctico',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Da toques o presiona [Espacio] para impulsar el dron y pasar entre los perfiles de aluminio.'
  },
  {
    id: 'heatpress',
    title: 'Plancha Térmica Rush',
    subtitle: 'Termofijado perfecto DTF y prendas',
    icon: '🔥',
    badge: 'DTF & Sublimación',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Presiona cuando la aguja de temperatura esté en la zona verde (160°-175°C) para estampar prendas.'
  },
  {
    id: 'saw',
    title: 'Sierra Ninja de Taller',
    subtitle: 'Corte de madera y acrílico en el aire',
    icon: '🪚',
    badge: 'Destreza de Corte',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Toca o desliza arrastrando sobre maderas y acrílicos en el aire para cortarlos. ¡No toques tornillos 🔩!'
  },
  {
    id: 'inkmixer',
    title: 'Mezclador de Tintas DTF',
    subtitle: 'Prepara las tintas CMYK a tiempo',
    icon: '🎨',
    badge: 'Colorimetría',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Toca el color de tinta primario solicitado antes de que se agote la barra de tiempo.'
  },
  {
    id: 'nfcchip',
    title: 'Programador Chip NFC',
    subtitle: 'Sintoniza ondas de radiofrecuencia',
    icon: '📡',
    badge: 'Tech & RFID',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Pulsa cuando la onda senoidal coincida con la zona de resonancia verde del microchip.'
  },
  {
    id: 'breaker',
    title: 'Rompe-Bocetos',
    subtitle: 'Demolición con cabezal de fresado',
    icon: '🧱',
    badge: 'Clásico Arcade',
    coinCost: 1,
    costLabel: '1 Moneda',
    instructions: 'Mueve la base con el mouse o toques para rebotar la fresa y romper todos los bloques de material.'
  }
];

/**
 * Calcula deterministamente 2 juegos para el día de hoy según la fecha
 */
export const getDailyGames = (allGames = GAMES) => {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = Number(today) - Number(start);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const idx1 = Math.abs(dayOfYear) % allGames.length;
  let idx2 = Math.abs(dayOfYear * 7 + 3) % allGames.length;
  if (idx2 === idx1) idx2 = (idx1 + 1) % allGames.length;
  return [allGames[idx1].id, allGames[idx2].id];
};

/**
 * Matriz de 16 Temáticas de Época del Arcade:
 * - 4 Temáticas originales preservadas: clasico, neon, pixel, cyber
 * - 12 Temáticas por las épocas y fechas del año: enero a diciembre
 */
export const ARCADE_THEMES = {
  // --- 4 TEMÁTICAS ORIGINALES PRESERVADAS ---
  clasico: {
    id: 'clasico',
    name: 'Taller 1980',
    subtitle: 'Madera cálida & latón artesanal',
    icon: '🪵',
    marqueeTag: '🪵 MÁQUINA CLÁSICA DE TALLER',
    cabinetBg: 'from-[#17251E] via-[#20392C] to-[#121c16]',
    cabinetBorder: 'border-[#D4A359]/80 shadow-[#D4A359]/30',
    marqueeBg: 'from-[#1F2421] via-[#2A3830] to-[#17251E]',
    accentText: 'text-[#F5D061]',
    screenBorder: 'border-[#D4A359]/60 shadow-[#D4A359]/20',
    canvasBgTop: '#17251E',
    canvasBgBottom: '#243B2E',
    gridColor: 'rgba(212, 163, 89, 0.2)',
    particles: ['🪙', '✨', '⚙️', '🌟', '🪵']
  },
  neon: {
    id: 'neon',
    name: 'Synthwave 80s',
    subtitle: 'Neón magenta, violeta y cian retro',
    icon: '🌆',
    marqueeTag: '🌆 EDICIÓN SYNTHWAVE 80s',
    cabinetBg: 'from-[#2b0c38] via-[#1a0a2e] to-[#0d041a]',
    cabinetBorder: 'border-fuchsia-500/80 shadow-fuchsia-500/30',
    marqueeBg: 'from-[#3b0d4d] via-[#4c1d95] to-[#1e1b4b]',
    accentText: 'text-fuchsia-300',
    screenBorder: 'border-cyan-400/70 shadow-cyan-500/30',
    canvasBgTop: '#1a0826',
    canvasBgBottom: '#320b42',
    gridColor: 'rgba(236, 72, 153, 0.25)',
    particles: ['🌆', '⚡', '💖', '🎵', '🕹️']
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel Arcade',
    subtitle: 'Consola retro 16-bits dorada',
    icon: '👾',
    marqueeTag: '👾 GABINETE 16-BITS RETRO',
    cabinetBg: 'from-[#291e0a] via-[#3a280c] to-[#171105]',
    cabinetBorder: 'border-amber-400/80 shadow-amber-500/30',
    marqueeBg: 'from-[#452b0a] via-[#5c3a0d] to-[#241705]',
    accentText: 'text-amber-300',
    screenBorder: 'border-amber-400/70 shadow-amber-500/30',
    canvasBgTop: '#1f1505',
    canvasBgBottom: '#362409',
    gridColor: 'rgba(245, 158, 11, 0.25)',
    particles: ['👾', '⭐', '🪙', '🍄', '✨']
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Taller',
    subtitle: 'Futurismo tecnológico verde esmeralda',
    icon: '⚡',
    marqueeTag: '⚡ TERMINAL CYBER TALLER 2088',
    cabinetBg: 'from-[#052219] via-[#072f23] to-[#02130e]',
    cabinetBorder: 'border-emerald-400/80 shadow-emerald-500/30',
    marqueeBg: 'from-[#063325] via-[#084c36] to-[#031d15]',
    accentText: 'text-emerald-300',
    screenBorder: 'border-emerald-400/70 shadow-emerald-500/30',
    canvasBgTop: '#031a13',
    canvasBgBottom: '#073326',
    gridColor: 'rgba(16, 185, 129, 0.25)',
    particles: ['⚡', '🤖', '🔋', '💎', '🟢']
  },

  // --- 12 TEMÁTICAS ANUALES POR ÉPOCAS DEL AÑO ---
  enero: {
    id: 'enero',
    name: 'Año Nuevo & Oro Blanco',
    subtitle: 'Enero · Inicio de ciclo, escarcha y oro nórdico',
    icon: '❄️',
    marqueeTag: '❄️ ENERO: AÑO NUEVO & ORO BLANCO',
    cabinetBg: 'from-[#0f172a] via-[#1e293b] to-[#0a0f1d]',
    cabinetBorder: 'border-sky-300/80 shadow-sky-400/30',
    marqueeBg: 'from-[#1e293b] via-[#334155] to-[#0f172a]',
    accentText: 'text-sky-200',
    screenBorder: 'border-sky-400/70 shadow-sky-400/25',
    canvasBgTop: '#0c1524',
    canvasBgBottom: '#192b45',
    gridColor: 'rgba(125, 211, 252, 0.2)',
    particles: ['❄️', '⭐', '✨', '🪙', '🥂']
  },
  febrero: {
    id: 'febrero',
    name: 'San Valentín & Neón Amor',
    subtitle: 'Febrero · Amor, amistad y acrílico magenta',
    icon: '💖',
    marqueeTag: '💖 FEBRERO: SAN VALENTÍN & AMOR',
    cabinetBg: 'from-[#3b0a24] via-[#4c1130] to-[#220515]',
    cabinetBorder: 'border-rose-400/80 shadow-rose-500/30',
    marqueeBg: 'from-[#500e33] via-[#6a1544] to-[#2e071c]',
    accentText: 'text-rose-200',
    screenBorder: 'border-rose-400/70 shadow-rose-400/30',
    canvasBgTop: '#240616',
    canvasBgBottom: '#3d0a27',
    gridColor: 'rgba(251, 113, 133, 0.25)',
    particles: ['💖', '💌', '🌸', '🌹', '✨']
  },
  marzo: {
    id: 'marzo',
    name: 'Primavera & Taller Botánico',
    subtitle: 'Marzo · Brotes verdes, flores y calados',
    icon: '🌸',
    marqueeTag: '🌸 MARZO: PRIMAVERA BOTÁNICA',
    cabinetBg: 'from-[#102d1d] via-[#19422b] to-[#091a10]',
    cabinetBorder: 'border-emerald-400/80 shadow-emerald-400/30',
    marqueeBg: 'from-[#194930] via-[#215f3e] to-[#0e2c1c]',
    accentText: 'text-emerald-200',
    screenBorder: 'border-emerald-300/70 shadow-emerald-400/25',
    canvasBgTop: '#0c2216',
    canvasBgBottom: '#173f29',
    gridColor: 'rgba(52, 211, 153, 0.2)',
    particles: ['🌸', '🦋', '🌷', '🌿', '🌱']
  },
  abril: {
    id: 'abril',
    name: 'Pascua & Pastel Festivo',
    subtitle: 'Abril · Tonos pastel, infancia y juego',
    icon: '🐣',
    marqueeTag: '🐣 ABRIL: PASCUA & INFANCIA FESTIVA',
    cabinetBg: 'from-[#2e1d3d] via-[#3d2752] to-[#1c1126]',
    cabinetBorder: 'border-purple-300/80 shadow-purple-400/30',
    marqueeBg: 'from-[#422958] via-[#563874] to-[#261633]',
    accentText: 'text-purple-200',
    screenBorder: 'border-amber-300/70 shadow-purple-300/25',
    canvasBgTop: '#20132b',
    canvasBgBottom: '#3b2250',
    gridColor: 'rgba(192, 132, 252, 0.2)',
    particles: ['🐣', '🐰', '🥚', '🌈', '🍭']
  },
  mayo: {
    id: 'mayo',
    name: 'Día de las Madres & Jardín Cálido',
    subtitle: 'Mayo · Oro rosado, flores y elegancia maternal',
    icon: '💐',
    marqueeTag: '💐 MAYO: DÍA DE LAS MADRES & JARDÍN',
    cabinetBg: 'from-[#381a28] via-[#4a2235] to-[#200e16]',
    cabinetBorder: 'border-pink-400/80 shadow-pink-500/30',
    marqueeBg: 'from-[#4d2238] via-[#632c49] to-[#29111e]',
    accentText: 'text-pink-200',
    screenBorder: 'border-pink-300/70 shadow-pink-400/25',
    canvasBgTop: '#240f1a',
    canvasBgBottom: '#3d1b2c',
    gridColor: 'rgba(244, 114, 182, 0.2)',
    particles: ['💐', '🌷', '🌺', '💎', '✨']
  },
  junio: {
    id: 'junio',
    name: 'Día del Padre & Roble Vintage',
    subtitle: 'Junio · Nogal, cuero café y precisión mecánica',
    icon: '👔',
    marqueeTag: '👔 JUNIO: DÍA DEL PADRE & ROBLE',
    cabinetBg: 'from-[#241a14] via-[#35251c] to-[#140e0b]',
    cabinetBorder: 'border-amber-600/80 shadow-amber-600/30',
    marqueeBg: 'from-[#38261c] via-[#4d3427] to-[#1e140f]',
    accentText: 'text-amber-200',
    screenBorder: 'border-amber-500/70 shadow-amber-600/25',
    canvasBgTop: '#19110d',
    canvasBgBottom: '#2d1e16',
    gridColor: 'rgba(217, 119, 6, 0.2)',
    particles: ['👔', '🪵', '⚙️', '🔧', '⭐']
  },
  julio: {
    id: 'julio',
    name: 'Verano & Neón Tropical',
    subtitle: 'Julio · Turquesa caribeño, sol y creatividad',
    icon: '☀️',
    marqueeTag: '☀️ JULIO: VERANO & NEÓN TROPICAL',
    cabinetBg: 'from-[#0b2938] via-[#103b50] to-[#061821]',
    cabinetBorder: 'border-cyan-400/80 shadow-cyan-400/30',
    marqueeBg: 'from-[#0f445d] via-[#155a7b] to-[#0a2c3d]',
    accentText: 'text-cyan-200',
    screenBorder: 'border-amber-300/70 shadow-cyan-400/25',
    canvasBgTop: '#071f2b',
    canvasBgBottom: '#10394c',
    gridColor: 'rgba(34, 211, 238, 0.25)',
    particles: ['☀️', '🌊', '🌴', '🕶️', '🍹']
  },
  agosto: {
    id: 'agosto',
    name: 'Regreso a Clases & Taller Escolar',
    subtitle: 'Agosto · Azul libreta, regla amarilla y etiquetas',
    icon: '🎒',
    marqueeTag: '🎒 AGOSTO: REGRESO A CLASES & TALLER',
    cabinetBg: 'from-[#132238] via-[#1a304f] to-[#0a1320]',
    cabinetBorder: 'border-blue-400/80 shadow-blue-400/30',
    marqueeBg: 'from-[#193761] via-[#22487e] to-[#0e213b]',
    accentText: 'text-blue-200',
    screenBorder: 'border-yellow-400/70 shadow-blue-400/25',
    canvasBgTop: '#0c1726',
    canvasBgBottom: '#172b47',
    gridColor: 'rgba(96, 165, 250, 0.25)',
    particles: ['🎒', '✏️', '📐', '📓', '⭐']
  },
  septiembre: {
    id: 'septiembre',
    name: 'Fiestas Patrias & Tricolor Mexicano',
    subtitle: 'Septiembre · Verde, blanco y rojo artesanal',
    icon: '🇲🇽',
    marqueeTag: '🇲🇽 SEPTIEMBRE: FIESTAS PATRIAS & TRICOLOR',
    cabinetBg: 'from-[#1a2e1d] via-[#243d28] to-[#121814]',
    cabinetBorder: 'border-red-500/80 shadow-red-500/30',
    marqueeBg: 'from-[#144222] via-[#631818] to-[#144222]',
    accentText: 'text-amber-200',
    screenBorder: 'border-emerald-400/80 shadow-red-500/30',
    canvasBgTop: '#102416',
    canvasBgBottom: '#2d1414',
    gridColor: 'rgba(239, 68, 68, 0.25)',
    particles: ['🇲🇽', '🔔', '🎺', '🪅', '🎆']
  },
  octubre: {
    id: 'octubre',
    name: 'Otoño & Noche de Brujas',
    subtitle: 'Octubre · Calabazas, hojas secas y misterio',
    icon: '🎃',
    marqueeTag: '🎃 OCTUBRE: OTOÑO & NOCHE DE BRUJAS',
    cabinetBg: 'from-[#33180c] via-[#472210] to-[#1d0e06]',
    cabinetBorder: 'border-orange-500/80 shadow-orange-500/30',
    marqueeBg: 'from-[#421d0a] via-[#5c2a11] to-[#240f05]',
    accentText: 'text-orange-300',
    screenBorder: 'border-purple-400/70 shadow-orange-500/25',
    canvasBgTop: '#241007',
    canvasBgBottom: '#3d1b0b',
    gridColor: 'rgba(249, 115, 22, 0.25)',
    particles: ['🎃', '🍂', '🍁', '🦇', '✨']
  },
  noviembre: {
    id: 'noviembre',
    name: 'Día de Muertos & Cempasúchil',
    subtitle: 'Noviembre · Flor cempasúchil, papel picado y ofrenda',
    icon: '💀',
    marqueeTag: '💀 NOVIEMBRE: DÍA DE MUERTOS & TRADICIÓN',
    cabinetBg: 'from-[#2e0e38] via-[#3f134c] to-[#1b0821]',
    cabinetBorder: 'border-amber-400/90 shadow-amber-500/40',
    marqueeBg: 'from-[#471556] via-[#d97706] to-[#471556]',
    accentText: 'text-amber-300',
    screenBorder: 'border-amber-400/80 shadow-amber-400/30',
    canvasBgTop: '#24092c',
    canvasBgBottom: '#3d124b',
    gridColor: 'rgba(245, 158, 11, 0.3)',
    particles: ['💀', '🏵️', '🕯️', '🪅', '✨']
  },
  diciembre: {
    id: 'diciembre',
    name: 'Navidad de Taller & Pino Nevado',
    subtitle: 'Diciembre · Pino nevado, bastón de caramelo y regalos',
    icon: '🎄',
    marqueeTag: '🎄 DICIEMBRE: NAVIDAD DE TALLER & PINO',
    cabinetBg: 'from-[#0e2b1d] via-[#143d29] to-[#081a11]',
    cabinetBorder: 'border-red-500/90 shadow-red-500/40',
    marqueeBg: 'from-[#123825] via-[#7f1d1d] to-[#123825]',
    accentText: 'text-amber-300',
    screenBorder: 'border-amber-300/80 shadow-red-500/30',
    canvasBgTop: '#0a1f15',
    canvasBgBottom: '#183a28',
    gridColor: 'rgba(239, 68, 68, 0.25)',
    particles: ['🎄', '❄️', '⭐', '🎁', '🔔']
  }
};

export default function WorkshopArcadeModal({
  isOpen,
  onClose,
  initialGame = 'dino',
  initialTab = 'play',
  arcadeConfig = null,
  activeTheme = 'clasico'
}) {
  if (!isOpen) return null;

  // Modos de visualización de juegos: 'active' (los del día o manual) vs 'all' (catálogo de 10)
  const [gamesViewMode, setGamesViewMode] = useState('active');

  // Sincronización en vivo con la configuración del servidor
  const [liveArcadeConfig, setLiveArcadeConfig] = useState(arcadeConfig);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Bloquear scroll del fondo en móviles y escritorio
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 2. Soporte para el botón Atrás del celular (Android / Swipe iOS)
    window.history.pushState({ modal: 'arcade' }, '');
    const handlePopState = () => {
      onClose?.();
    };
    window.addEventListener('popstate', handlePopState);

    // 3. Tecla Escape para salir
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/arcade/config')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object') setLiveArcadeConfig(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const effectiveConfig = liveArcadeConfig || arcadeConfig;

  // Determinar los juegos activos: Rotación diaria de 2 juegos vs selección manual desde admin
  const dailyGameIds = getDailyGames(GAMES);
  const isManual = effectiveConfig?.selectionMode === 'manual' && Array.isArray(effectiveConfig?.activeGameIds);
  const activeGameIds = isManual ? (effectiveConfig.activeGameIds || []) : dailyGameIds;

  // Verificador estricto de si un juego está habilitado por el administrador y si el Arcade está encendido
  const isGameActive = useCallback((gameId) => {
    if (effectiveConfig && effectiveConfig.enabled === false) return false;
    return activeGameIds.includes(gameId);
  }, [effectiveConfig, activeGameIds]);

  const currentAvailableGames = gamesViewMode === 'active'
    ? GAMES.filter(g => isGameActive(g.id))
    : GAMES;

  const [activeTab, setActiveTab] = useState(initialTab || 'play'); // 'play' | 'rewards' | 'instructions'

  // Sincronizar activeTab cuando initialTab o isOpen cambien
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Resolver la temática activa con fuerte énfasis visual
  const currentThemeKey = effectiveConfig?.activeTheme || activeTheme || 'clasico';
  const currentTheme = ARCADE_THEMES[currentThemeKey] || ARCADE_THEMES.clasico;

  const [selectedGameId, setSelectedGameId] = useState(() => {
    if (initialGame && isGameActive(initialGame)) return initialGame;
    const firstActive = activeGameIds.find(id => isGameActive(id));
    return firstActive || activeGameIds[0] || 'dino';
  });

  useEffect(() => {
    if (activeGameIds.length > 0 && !isGameActive(selectedGameId)) {
      const firstActive = activeGameIds.find(id => isGameActive(id));
      if (firstActive) setSelectedGameId(firstActive);
    }
  }, [activeGameIds, selectedGameId, isGameActive]);

  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover' | 'victory'
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [noCreditsWarning, setNoCreditsWarning] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(effectiveConfig?.timeLimitSeconds || 180);
  const [lives, setLives] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [rewardConfetti, setRewardConfetti] = useState([]);
  const [isLandscapeMode, setIsLandscapeMode] = useState(false);

  // Toggle de rotación / modo horizontal para optimizar pantalla completa en celular
  const toggleOrientationMode = async () => {
    const nextMode = !isLandscapeMode;
    setIsLandscapeMode(nextMode);

    try {
      if (nextMode) {
        if (typeof window !== 'undefined' && window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        if (typeof window !== 'undefined' && window.screen?.orientation?.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch {
      // Ignorar restricciones de bloqueo en navegadores que no lo soportan
    }
  };

  // Movimiento táctil direccional para Atrapa-Piezas y Rompemuros
  const handleMoveLeft = () => {
    const state = internalStateRef.current;
    if (!state) return;
    if (selectedGameId === 'collector' && state.basket) {
      state.basket.x = Math.max(10, state.basket.x - 50);
    } else if (selectedGameId === 'breaker' && state.paddle) {
      state.paddle.x = Math.max(10, state.paddle.x - 50);
    }
  };

  const handleMoveRight = () => {
    const state = internalStateRef.current;
    if (!state) return;
    if (selectedGameId === 'collector' && state.basket) {
      state.basket.x = Math.min(530, state.basket.x + 50);
    } else if (selectedGameId === 'breaker' && state.paddle) {
      state.paddle.x = Math.min(535, state.paddle.x + 50);
    }
  };

  // Etiquetas táctiles dinámicas por juego
  const getGameActionLabel = (gameId) => {
    switch (gameId) {
      case 'dino':
        return { label: '¡SALTAR VIRUTA!', icon: '🦖' };
      case 'drone':
        return { label: '¡IMPULSAR DRON!', icon: '🛸' };
      case 'stacker':
        return { label: '¡ALINEAR CAPA!', icon: '🏗️' };
      case 'laser':
        return { label: '¡DISPARAR LÁSER!', icon: '⚡' };
      case 'heatpress':
        return { label: '¡TERMOFIJAR DTF!', icon: '🔥' };
      case 'nfcchip':
        return { label: '¡CALIBRAR CHIP!', icon: '📡' };
      default:
        return { label: '¡ACCIÓN DE TALLER!', icon: '🕹️' };
    }
  };

  // Conversión equilibrada de puntos a monedas: 1 moneda cada 50 puntos acumulados
  const lastCoinMilestoneRef = useRef(0);
  useEffect(() => {
    if (gameState === 'ready') {
      lastCoinMilestoneRef.current = 0;
    } else if (gameState === 'playing') {
      const milestone = Math.floor(score / 50);
      if (milestone > lastCoinMilestoneRef.current) {
        const diff = milestone - lastCoinMilestoneRef.current;
        lastCoinMilestoneRef.current = milestone;
        setCoinsEarned(c => c + diff);
      }
    }
  }, [score, gameState]);

  // Hook unificado de créditos y sesión continua en pantalla
  const {
    credits,
    coins: userCoins,
    activeCoupon,
    refillTimeFormatted,
    sessionRemainingSeconds,
    sessionTimeFormatted,
    sessionExpired,
    maxCredits,
    spendCredit,
    exchangeCoinsForCredits,
    addCoins,
    redeemCoupon
  } = useArcadeSession();

  // Configuración de Dificultad Dinámica / Asistida por Monedas
  const [difficultyMode, setDifficultyMode] = useState(() => {
    try {
      return localStorage.getItem('artesano_arcade_difficulty') || 'easy';
    } catch {
      return 'easy';
    }
  });

  const [hasShield, setHasShield] = useState(false);

  const changeDifficultyMode = (mode) => {
    setDifficultyMode(mode);
    try {
      localStorage.setItem('artesano_arcade_difficulty', mode);
    } catch {}
  };

  const getDifficultySettings = useCallback(() => {
    let mode = difficultyMode;
    let scale = 0.65;
    let initialLives = 4;
    let coinsMult = 1;
    let label = '🌟 Fácil / Móvil';
    let badge = '🌟 Fácil';
    let hint = 'Velocidad accesible y 4 vidas. Ideal para pantallas táctiles.';

    if (mode === 'auto_coins') {
      if (userCoins < 15) {
        scale = 0.65;
        initialLives = 4;
        coinsMult = 1;
        label = '🪙 Auto: Asistencia (<15🪙)';
        badge = '🪙 Auto: Fácil';
        hint = 'Velocidad suave y 4 vidas para ayudarte a juntar monedas.';
      } else if (userCoins < 40) {
        scale = 0.90;
        initialLives = 3;
        coinsMult = 1;
        label = '🪙 Auto: Equilibrado (15-40🪙)';
        badge = '🪙 Auto: Normal';
        hint = 'Dificultad estándar balanceada según tu progreso.';
      } else {
        scale = 1.25;
        initialLives = 2;
        coinsMult = 2;
        label = '🪙 Auto: Reto Pro (>40🪙, 2x)';
        badge = '🪙 Auto: Pro x2';
        hint = 'Reto para expertos con monedas x2 al superar retos.';
      }
    } else if (mode === 'easy') {
      scale = 0.65;
      initialLives = 4;
      coinsMult = 1;
      label = '🌟 Fácil / Celular';
      badge = '🌟 Fácil';
      hint = 'Ritmo relajado y 4 vidas. Recomendado para jugar en celular.';
    } else if (mode === 'normal') {
      scale = 0.95;
      initialLives = 3;
      coinsMult = 1;
      label = '⚡ Normal';
      badge = '⚡ Normal';
      hint = 'Velocidad estándar de taller y 3 vidas.';
    } else if (mode === 'pro') {
      scale = 1.30;
      initialLives = 2;
      coinsMult = 2;
      label = '🔥 Pro (x2 🪙)';
      badge = '🔥 Pro x2🪙';
      hint = 'Mayor velocidad y 2 vidas, ¡pero ganas el DOBLE de monedas!';
    }

    return { mode, scale, initialLives, coinsMult, label, badge, hint };
  }, [difficultyMode, userCoins]);

  const diffSettings = getDifficultySettings();

  const canvasRef = useRef(null);
  const internalStateRef = useRef({});

  // Discount tiers con códigos aleatorios rotativos que cambian cada día
  const dailyTiers = useMemo(() => getDailyArcadeCoupons(), []);
  const discountTiers = effectiveConfig?.discountTiers || dailyTiers;

  // Registro de cupones desbloqueados/ganados en la sesión para no exponer códigos antes de ganar
  const [unlockedCoupons, setUnlockedCoupons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('artesano_unlocked_arcade_coupons') || '[]');
    } catch {
      return [];
    }
  });

  // Función reutilizable para cortar piezas de madera y acrílico (Sierra Ninja)
  const slicePiecesAt = useCallback((x, y) => {
    const state = internalStateRef.current;
    if (!state || selectedGameId !== 'saw' || !Array.isArray(state.flyingPieces) || gameState !== 'playing') return;

    state.flyingPieces.forEach(p => {
      if (!p.cut && Math.hypot(p.x - x, p.y - y) < 48) {
        p.cut = true;
        if (p.isObstacle) {
          soundSynth.play('hit');
          setLives(l => {
            const n = l - 1;
            if (n <= 0) handleGameOver();
            return Math.max(0, n);
          });
        } else {
          soundSynth.play('coin');
          setScore(s => s + 20);
          // Calibrado: previamente setCoinsEarned(c => c + 25)
          setCoinsEarned(c => c + 1);
          if (Array.isArray(state.sawdust)) {
            for (let i = 0; i < 8; i++) {
              state.sawdust.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20
              });
            }
          }
        }
      }
    });
  }, [selectedGameId, gameState]);

  // Partículas estacionales para la recompensa según la temporada activa
  const getSeasonalParticles = () => {
    return currentTheme.particles || ['🪙', '✨', '⚙️', '🌟', '🛠️'];
  };

  const handleRedeemCoupon = (tier) => {
    const isAlreadyUnlocked = unlockedCoupons.includes(tier.code);

    if (isAlreadyUnlocked) {
      // Si ya fue desbloqueado previamente, se reactiva en carrito sin volver a cobrar monedas
      try {
        localStorage.setItem('artesano_arcade_coupon', tier.code);
        window.dispatchEvent(new CustomEvent('artesano_arcade_update'));
      } catch {}
      setCopiedCoupon(tier.code);
      soundSynth.play('win');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(tier.code);
      }
      return;
    }

    if (userCoins < tier.coinsRequired) return;
    const res = redeemCoupon(tier.code, tier.coinsRequired);
    if (res.success) {
      setCopiedCoupon(tier.code);
      soundSynth.play('win');
      playMario1UpSound();

      // Guardar en cupones desbloqueados para revelar el código permanentemente
      setUnlockedCoupons(prev => {
        const next = prev.includes(tier.code) ? prev : [...prev, tier.code];
        try {
          localStorage.setItem('artesano_unlocked_arcade_coupons', JSON.stringify(next));
        } catch {}
        return next;
      });

      if (navigator.clipboard) {
        navigator.clipboard.writeText(tier.code);
      }
      // Disparar lluvia de confeti estacional
      const particles = getSeasonalParticles();
      const burst = Array.from({ length: 24 }).map((_, i) => ({
        id: Date.now() + i,
        char: particles[i % particles.length],
        left: `${10 + Math.random() * 80}%`,
        delay: `${Math.random() * 0.4}s`
      }));
      setRewardConfetti(burst);
      setTimeout(() => setRewardConfetti([]), 3000);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundSynth.muted = next;
  };

  // Timer countdown durante la partida
  useEffect(() => {
    let timer = null;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleVictory();
            return 0;
          }
          const elapsed = (arcadeConfig?.timeLimitSeconds || 180) - prev;
          const lvl = Math.min(4, Math.floor(elapsed / 45) + 1);
          setCurrentLevel(lvl);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const handleGameOver = () => {
    setGameState('gameover');
    soundSynth.play('gameover');
    if (coinsEarned > 0) {
      addCoins(coinsEarned);
    }
  };

  const handleVictory = () => {
    setGameState('victory');
    soundSynth.play('win');
    // Calibrado: previamente bonus = 100 y setCoinsEarned(c => c + 25)
    const bonus = 3; // Recompensa equilibrada de 3 monedas por completar los 3 minutos
    addCoins(coinsEarned + bonus);
    setCoinsEarned(c => c + bonus);
  };

  // Iniciar partida gastando 1 ficha
  const startGame = () => {
    if (!isGameActive(selectedGameId)) {
      soundSynth.play('hit');
      return;
    }
    if (credits <= 0) {
      setNoCreditsWarning(true);
      soundSynth.play('hit');
      return;
    }
    const res = spendCredit();
    if (!res.success) {
      setNoCreditsWarning(true);
      soundSynth.play('hit');
      return;
    }
    const activeDiff = getDifficultySettings();
    setNoCreditsWarning(false);
    setScore(0);
    setCoinsEarned(0);
    setLives(activeDiff.initialLives);
    setHasShield(activeDiff.mode === 'easy');
    setCurrentLevel(1);
    setTimeLeft(arcadeConfig?.timeLimitSeconds || 180);
    setGameState('playing');
    soundSynth.play('stack');
    initGameLogic(selectedGameId);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // INICIALIZADOR DE MOTORES DE LOS 10 MINI-JUEGOS
  // -------------------------------------------------------------
  const initGameLogic = useCallback((gameId) => {
    const width = 640;
    const height = 360;

    if (gameId === 'dino') {
      internalStateRef.current = {
        player: { x: 60, y: height - 80, vy: 0, grounded: true, width: 34, height: 44 },
        obstacles: [],
        coins: [],
        spawnTimer: 0,
        coinTimer: 0,
        speed: 4.5,
        floorY: height - 40
      };
    } else if (gameId === 'stacker') {
      internalStateRef.current = {
        layers: [{ x: 170, y: height - 50, width: 300, height: 26, color: '#2D4F3E' }],
        current: { x: 50, y: height - 80, width: 300, height: 26, vx: 5, color: '#D4A359' },
        combos: 0
      };
    } else if (gameId === 'laser') {
      internalStateRef.current = {
        targets: [],
        crosshairX: width / 2,
        spawnTimer: 0,
        sparks: [],
        gameAgeFrames: 0,
        accuracyMessage: '',
        messageTimer: 0
      };
    } else if (gameId === 'collector') {
      internalStateRef.current = {
        basket: { x: width / 2 - 50, y: height - 45, width: 105, height: 22 },
        items: [],
        spawnTimer: 0
      };
    } else if (gameId === 'drone') {
      internalStateRef.current = {
        drone: { x: 100, y: height / 2, vy: 0, width: 34, height: 24, invincibleTimer: 0 },
        pipes: [],
        spawnTimer: 0
      };
    } else if (gameId === 'heatpress') {
      internalStateRef.current = {
        needleAngle: -60,
        needleSpeed: 2.2,
        needleDir: 1,
        garmentX: width / 2 - 40,
        isStamped: false,
        currentGarment: '👕',
        stampFeedback: '',
        feedbackTimer: 0,
        steamParticles: []
      };
    } else if (gameId === 'saw') {
      internalStateRef.current = {
        flyingPieces: [],
        spawnTimer: 0,
        sawdust: [],
        missedGoodPieces: 0
      };
    } else if (gameId === 'inkmixer') {
      const inkOptions = [
        { name: 'CIAN INTENSO (DTF)', key: 'cyan', hex: '#00AEEF' },
        { name: 'MAGENTA VIBRANTE (Tazas)', key: 'magenta', hex: '#EC008C' },
        { name: 'AMARILLO ORO (Textil)', key: 'yellow', hex: '#FFF200' },
        { name: 'NEGRO CARBÓN (Láser)', key: 'black', hex: '#231F20' }
      ];
      const target = inkOptions[Math.floor(Math.random() * inkOptions.length)];
      internalStateRef.current = {
        targetInk: target,
        maxTimer: 100,
        timer: 100,
        options: inkOptions,
        feedback: ''
      };
    } else if (gameId === 'nfcchip') {
      internalStateRef.current = {
        waveX: 80,
        waveDir: 1,
        frequency: 0.05,
        targetCenter: width / 2,
        targetRadius: 42,
        ripples: [],
        feedback: '',
        feedbackTimer: 0
      };
    } else if (gameId === 'breaker') {
      const rows = 3;
      const cols = 8;
      const brickWidth = 60;
      const brickHeight = 18;
      const bricks = [];
      const colors = ['#D4A359', '#10B981', '#3B82F6'];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bricks.push({
            x: 50 + c * (brickWidth + 8),
            y: 40 + r * (brickHeight + 8),
            width: brickWidth,
            height: brickHeight,
            alive: true,
            color: colors[r % colors.length]
          });
        }
      }
      internalStateRef.current = {
        paddle: { x: width / 2 - 45, y: height - 25, width: 95, height: 12 },
        ball: { x: width / 2, y: height - 50, vx: 3.5, vy: -3.5, radius: 7 },
        bricks,
        sparks: []
      };
    }
  }, []);

  // Inicializar estado del motor inmediatamente al montar o cambiar de juego
  useEffect(() => {
    initGameLogic(selectedGameId);
  }, [selectedGameId, initGameLogic]);

  // Manejador central de acciones (Click / Tap / Teclado)
  const handleAction = useCallback((e) => {
    if (gameState === 'ready' || gameState === 'gameover' || gameState === 'victory') {
      if (!isGameActive(selectedGameId)) {
        soundSynth.play('hit');
        return;
      }
      startGame();
      return;
    }

    const state = internalStateRef.current;
    if (!state) return;

    // Multiplicador dinámico de dificultad calibrado por modo y monedas
    const diffMultiplier = Math.max(0.45, (1 + Math.min(1.4, (coinsEarned * 0.02) + (score * 0.002) + (currentLevel - 1) * 0.15)) * diffSettings.scale);

    if (selectedGameId === 'dino') {
      if (state.player && state.player.grounded) {
        state.player.vy = -12.5;
        state.player.grounded = false;
        soundSynth.play('jump');
      }
    } else if (selectedGameId === 'stacker') {
      const top = state.layers[state.layers.length - 1];
      const cur = state.current;
      if (!top || !cur) return;

      const diff = cur.x - top.x;
      const margin = 6;

      if (Math.abs(diff) <= margin) {
        cur.x = top.x;
        state.combos += 1;
        setScore(s => s + 50);
        // Calibrado: previamente setCoinsEarned(c => c + 25)
        setCoinsEarned(c => c + 1);
        soundSynth.play('coin');
      } else if (diff > 0 && diff < top.width) {
        const newWidth = cur.width - diff;
        cur.width = Math.max(10, newWidth);
        setScore(s => s + 20);
        setCoinsEarned(c => c + 1);
        soundSynth.play('stack');
      } else if (diff < 0 && Math.abs(diff) < cur.width) {
        const newWidth = cur.width + diff;
        cur.x = top.x;
        cur.width = Math.max(10, newWidth);
        setScore(s => s + 20);
        setCoinsEarned(c => c + 1);
        soundSynth.play('stack');
      } else {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) handleGameOver();
          return Math.max(0, next);
        });
        soundSynth.play('hit');
        return;
      }

      state.layers.push({ ...cur });
      const palette = ['#2D4F3E', '#9E472A', '#D4A359', '#1E3A8A', '#047857', '#B45309'];
      const nextColor = palette[state.layers.length % palette.length];

      state.current = {
        x: 0,
        y: cur.y - 28,
        width: cur.width,
        height: 26,
        vx: (4 + Math.min(8, state.layers.length * 0.4) + Math.min(4, coinsEarned * 0.05)) * (diffMultiplier * 0.65) * (state.layers.length % 2 === 0 ? 1 : -1),
        color: nextColor
      };

      if (state.current.y < 80) {
        state.layers.forEach(l => l.y += 28);
        state.current.y += 28;
      }
    } else if (selectedGameId === 'laser' && Array.isArray(state.targets) && state.crosshairX !== undefined) {
      const cross = state.crosshairX;
      let hit = false;
      state.targets.forEach(t => {
        if (!t.hit && Math.abs(t.x - cross) < 48) {
          t.hit = true;
          hit = true;
          const dist = Math.abs(t.x - cross);
          if (dist < 15) {
            state.accuracyMessage = '¡CORTE PERFECTO! +25';
            setScore(s => s + 25);
            setCoinsEarned(c => c + 1);
            soundSynth.play('coin');
          } else {
            state.accuracyMessage = '¡BUEN CORTE! +10';
            setScore(s => s + 10);
            setCoinsEarned(c => c + 1);
            soundSynth.play('stack');
          }
          state.messageTimer = 30;
          for (let i = 0; i < 8; i++) {
            state.sparks.push({
              x: cross,
              y: 180,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 20
            });
          }
        }
      });
      // Corrección de penalización: solo penalizar si pasaron > 60 frames y hay blancos cerca
      if (!hit && state.gameAgeFrames > 60) {
        const hasNearby = state.targets.some(t => Math.abs(t.x - cross) < 130);
        if (hasNearby) {
          soundSynth.play('hit');
          setLives(l => {
            const next = l - 1;
            if (next <= 0) handleGameOver();
            return Math.max(0, next);
          });
        }
      }
    } else if (selectedGameId === 'collector') {
      // Corrección: responder a clics / toques directos para reposicionar canasta
      if (state.basket && e && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        if (clientX !== null) {
          const scaleX = 640 / rect.width;
          const pos = (clientX - rect.left) * scaleX;
          state.basket.x = Math.max(0, Math.min(535, pos - state.basket.width / 2));
        }
      }
    } else if (selectedGameId === 'drone') {
      if (state.drone) {
        state.drone.vy = -6.8;
        soundSynth.play('jump');
      }
    } else if (selectedGameId === 'heatpress' && state.needleAngle !== undefined && Array.isArray(state.steamParticles)) {
      // Plancha térmica: estampar al presionar
      if (Math.abs(state.needleAngle) <= 24) {
        state.isStamped = true;
        state.stampFeedback = '¡ESTAMPADO PERFECTO! 🔥 +1🪙';
        state.feedbackTimer = 35;
        setScore(s => s + 25);
        setCoinsEarned(c => c + 1);
        soundSynth.play('coin');
        for (let i = 0; i < 10; i++) {
          state.steamParticles.push({
            x: 320 + (Math.random() - 0.5) * 60,
            y: 180,
            vy: -Math.random() * 3 - 1,
            vx: (Math.random() - 0.5) * 2,
            life: 25,
            alpha: 0.8
          });
        }
        setTimeout(() => {
          if (internalStateRef.current && internalStateRef.current.isStamped !== undefined) {
            internalStateRef.current.isStamped = false;
            const garments = ['👕', '🧢', '👜', '🧥', '🎒'];
            internalStateRef.current.currentGarment = garments[Math.floor(Math.random() * garments.length)];
          }
        }, 700);
      } else {
        state.stampFeedback = state.needleAngle < -24 ? '¡MUY FRÍO!' : '¡SE QUEMÓ! ⚠️';
        state.feedbackTimer = 30;
        soundSynth.play('hit');
        setLives(l => {
          const n = l - 1;
          if (n <= 0) handleGameOver();
          return Math.max(0, n);
        });
      }
    } else if (selectedGameId === 'saw' && Array.isArray(state.flyingPieces)) {
      // Cortar piezas en el aire
      if (canvasRef.current && e) {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
        if (clientX !== null && clientY !== null) {
          const scaleX = 640 / rect.width;
          const scaleY = 360 / rect.height;
          slicePiecesAt((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
        }
      }
    } else if (selectedGameId === 'nfcchip' && state.waveX !== undefined && state.targetCenter !== undefined && Array.isArray(state.ripples)) {
      // Sintonizar chip NFC
      const dist = Math.abs(state.waveX - state.targetCenter);
      const rad = state.targetRadius || 42;
      if (dist <= rad) {
        state.feedback = '¡TAG PROGRAMADO! 📡 +1🪙';
        state.feedbackTimer = 35;
        setScore(s => s + 25);
        setCoinsEarned(c => c + 1);
        soundSynth.play('coin');
        state.ripples.push({ x: state.targetCenter, y: 180, r: 10, maxR: 70, alpha: 1 });
      } else {
        state.feedback = '¡DESFASADO!';
        state.feedbackTimer = 25;
        soundSynth.play('hit');
        setLives(l => {
          const n = l - 1;
          if (n <= 0) handleGameOver();
          return Math.max(0, n);
        });
      }
    } else if (selectedGameId === 'breaker') {
      if (state.paddle && e && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        if (clientX !== null) {
          const scaleX = 640 / rect.width;
          const pos = (clientX - rect.left) * scaleX;
          state.paddle.x = Math.max(0, Math.min(545, pos - state.paddle.width / 2));
        }
      }
    } else if (selectedGameId === 'inkmixer' && e && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX !== null && clientY !== null) {
        const scaleX = 640 / rect.width;
        const scaleY = 360 / rect.height;
        const posX = (clientX - rect.left) * scaleX;
        const posY = (clientY - rect.top) * scaleY;
        if (posY >= 200 && posY <= 290) {
          const btnWidth = 110;
          const gap = 20;
          const startX = 65;
          const keys = ['cyan', 'magenta', 'yellow', 'black'];
          for (let i = 0; i < 4; i++) {
            const bx = startX + i * (btnWidth + gap);
            if (posX >= bx && posX <= bx + btnWidth) {
              handleSelectInk(keys[i]);
              break;
            }
          }
        }
      }
    }
  }, [gameState, selectedGameId, coinsEarned, score, currentLevel, slicePiecesAt]);

  // Manejador específico para el mezclador de tintas
  const handleSelectInk = (inkKey) => {
    const state = internalStateRef.current;
    if (!state || selectedGameId !== 'inkmixer' || gameState !== 'playing') return;

    if (state.targetInk.key === inkKey) {
      soundSynth.play('coin');
      setScore(s => s + 25);
      setCoinsEarned(c => c + 1);
      state.feedback = '¡FÓRMULA CORRECTA! 🎨';
      const available = state.options.filter(o => o.key !== inkKey);
      state.targetInk = available[Math.floor(Math.random() * available.length)];
      state.timer = 100;
    } else {
      soundSynth.play('hit');
      state.feedback = '¡TINTA INCORRECTA!';
      setLives(l => {
        const n = l - 1;
        if (n <= 0) handleGameOver();
        return Math.max(0, n);
      });
    }
  };

  // Keyboard binding
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction();
      }
      if (selectedGameId === 'collector' && internalStateRef.current?.basket) {
        if (e.code === 'ArrowLeft') {
          internalStateRef.current.basket.x = Math.max(10, internalStateRef.current.basket.x - 35);
        } else if (e.code === 'ArrowRight') {
          internalStateRef.current.basket.x = Math.min(530, internalStateRef.current.basket.x + 35);
        }
      }
      if (selectedGameId === 'breaker' && internalStateRef.current?.paddle) {
        if (e.code === 'ArrowLeft') {
          internalStateRef.current.paddle.x = Math.max(10, internalStateRef.current.paddle.x - 35);
        } else if (e.code === 'ArrowRight') {
          internalStateRef.current.paddle.x = Math.min(535, internalStateRef.current.paddle.x + 35);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAction, selectedGameId]);

  // Manejo de mouse y táctil continuo
  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;

    if (selectedGameId === 'collector' && internalStateRef.current?.basket) {
      internalStateRef.current.basket.x = Math.max(0, Math.min(535, clientX - internalStateRef.current.basket.width / 2));
    }
    if (selectedGameId === 'breaker' && internalStateRef.current?.paddle) {
      internalStateRef.current.paddle.x = Math.max(0, Math.min(545, clientX - internalStateRef.current.paddle.width / 2));
    }
    if (selectedGameId === 'saw' && (e.buttons === 1 || e.which === 1)) {
      const scaleY = 360 / rect.height;
      const clientY = (e.clientY - rect.top) * scaleY;
      slicePiecesAt(clientX, clientY);
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (!canvasRef.current || !e.touches[0]) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const clientX = (e.touches[0].clientX - rect.left) * scaleX;

    if (selectedGameId === 'collector' && internalStateRef.current?.basket) {
      internalStateRef.current.basket.x = Math.max(0, Math.min(535, clientX - internalStateRef.current.basket.width / 2));
    }
    if (selectedGameId === 'breaker' && internalStateRef.current?.paddle) {
      internalStateRef.current.paddle.x = Math.max(0, Math.min(545, clientX - internalStateRef.current.paddle.width / 2));
    }
    if (selectedGameId === 'saw') {
      const scaleY = 360 / rect.height;
      const clientY = (e.touches[0].clientY - rect.top) * scaleY;
      slicePiecesAt(clientX, clientY);
    }
  };

  // -------------------------------------------------------------
  // BUCLE PRINCIPAL DE RENDERIZADO CANVAS (640x360 @ 60 FPS)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 640;
    const height = 360;

    let animId;

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Fondo dinámico según la temática estacional activa
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, currentTheme.canvasBgTop || '#17251E');
      bgGrad.addColorStop(1, currentTheme.canvasBgBottom || '#243B2E');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Rejilla de taller isométrica según la temática
      ctx.strokeStyle = currentTheme.gridColor || 'rgba(212, 163, 89, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, height - 40);
        ctx.lineTo(x - 20, height);
        ctx.stroke();
      }

      const state = internalStateRef.current;
      const diffMultiplier = Math.max(0.45, (1 + Math.min(1.4, (coinsEarned * 0.02) + (score * 0.002) + (currentLevel - 1) * 0.15)) * diffSettings.scale);

      // 1. DINO RUNNER
      if (selectedGameId === 'dino' && state.player && Array.isArray(state.obstacles) && Array.isArray(state.coins)) {
        if (gameState === 'playing') {
          state.player.y += state.player.vy;
          state.player.vy += 0.65;
          if (state.player.y >= state.floorY - state.player.height) {
            state.player.y = state.floorY - state.player.height;
            state.player.vy = 0;
            state.player.grounded = true;
          }

          state.spawnTimer++;
          const spawnInterval = Math.max(40, Math.floor(90 / diffMultiplier));
          if (state.spawnTimer > spawnInterval) {
            state.spawnTimer = 0;
            state.obstacles.push({
              x: width + 20,
              y: state.floorY - 32,
              width: 24,
              height: 32,
              type: Math.random() > 0.5 ? 'spool' : 'wood'
            });
          }

          state.coinTimer++;
          if (state.coinTimer > 110) {
            state.coinTimer = 0;
            state.coins.push({
              x: width + 20,
              y: state.floorY - 70 - Math.random() * 30,
              radius: 9,
              collected: false
            });
          }

          const curSpeed = (state.speed + (currentLevel - 1) * 1.1) * diffMultiplier;
          state.obstacles.forEach(obs => {
            obs.x -= curSpeed;
            if (
              state.player.x + state.player.width > obs.x + 4 &&
              state.player.x < obs.x + obs.width - 4 &&
              state.player.y + state.player.height > obs.y + 4
            ) {
              obs.x = -100;
              soundSynth.play('hit');
              setLives(l => {
                const n = l - 1;
                if (n <= 0) handleGameOver();
                return Math.max(0, n);
              });
            }
          });
          state.obstacles = state.obstacles.filter(o => o.x > -50);

          state.coins.forEach(c => {
            c.x -= curSpeed;
            if (!c.collected && Math.hypot(state.player.x + 17 - c.x, state.player.y + 22 - c.y) < 28) {
              c.collected = true;
              setScore(s => s + 15);
              setCoinsEarned(ce => ce + 1);
              soundSynth.play('coin');
            }
          });
          state.coins = state.coins.filter(c => c.x > -30 && !c.collected);
          setScore(s => s + 1);
        }

        ctx.fillStyle = '#17251E';
        ctx.fillRect(0, state.floorY, width, height - state.floorY);
        ctx.fillStyle = '#D4A359';
        ctx.fillRect(0, state.floorY, width, 3);

        ctx.fillStyle = '#FAF7F0';
        ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
        ctx.fillStyle = '#2D4F3E';
        ctx.fillRect(state.player.x + 20, state.player.y + 10, 6, 6);
        ctx.fillStyle = '#D4A359';
        ctx.fillRect(state.player.x + 12, state.player.y + state.player.height, 10, 6);

        state.obstacles.forEach(o => {
          ctx.fillStyle = o.type === 'spool' ? '#9E472A' : '#D4A359';
          ctx.fillRect(o.x, o.y, o.width, o.height);
        });

        state.coins.forEach(c => {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. STACKER
      if (selectedGameId === 'stacker' && Array.isArray(state.layers)) {
        if (gameState === 'playing' && state.current) {
          state.current.x += state.current.vx;
          if (state.current.x <= 20 || state.current.x + state.current.width >= width - 20) {
            state.current.vx *= -1;
          }
        }
        state.layers.forEach(l => {
          ctx.fillStyle = l.color || '#2D4F3E';
          ctx.fillRect(l.x, l.y, l.width, l.height);
          ctx.strokeStyle = '#FFFFFF';
          ctx.strokeRect(l.x, l.y, l.width, l.height);
        });
        if (state.current && gameState === 'playing') {
          ctx.fillStyle = state.current.color || '#D4A359';
          ctx.fillRect(state.current.x, state.current.y, state.current.width, state.current.height);
        }
      }

      // 3. LASER REFLEX
      if (selectedGameId === 'laser' && state.crosshairX !== undefined && Array.isArray(state.targets)) {
        if (gameState === 'playing') {
          state.gameAgeFrames++;
          state.spawnTimer++;
          if (state.spawnTimer > Math.max(30, Math.floor(65 / diffMultiplier))) {
            state.spawnTimer = 0;
            state.targets.push({
              x: width + 30,
              y: 180,
              size: 30,
              hit: false,
              color: Math.random() > 0.5 ? '#10B981' : '#F59E0B'
            });
          }
          const curSpeed = (4.5 + currentLevel * 1.1) * diffMultiplier;
          state.targets.forEach(t => {
            t.x -= curSpeed;
            if (!t.hit && t.x < state.crosshairX - 55) {
              t.hit = true;
              soundSynth.play('hit');
              setLives(l => {
                const n = l - 1;
                if (n <= 0) handleGameOver();
                return Math.max(0, n);
              });
            }
          });
          state.targets = state.targets.filter(t => t.x > -40);
          if (state.messageTimer > 0) state.messageTimer--;
        }

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.crosshairX, 0);
        ctx.lineTo(state.crosshairX, height);
        ctx.stroke();

        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.crosshairX, 180, 26, 0, Math.PI * 2);
        ctx.stroke();

        state.targets.forEach(t => {
          if (!t.hit) {
            ctx.fillStyle = t.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        if (state.messageTimer > 0) {
          ctx.fillStyle = '#FBBF24';
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(state.accuracyMessage, state.crosshairX, 120);
        }
      }

      // 4. COLLECTOR
      if (selectedGameId === 'collector' && state.basket && Array.isArray(state.items)) {
        if (gameState === 'playing') {
          state.spawnTimer++;
          if (state.spawnTimer > Math.max(22, Math.floor(50 / diffMultiplier))) {
            state.spawnTimer = 0;
            const isDanger = Math.random() < 0.28;
            state.items.push({
              x: 40 + Math.random() * (width - 80),
              y: -20,
              isDanger,
              label: isDanger ? '🔥' : (Math.random() > 0.5 ? '🔑' : '☕'),
              vy: (3.2 + currentLevel * 0.8) * diffMultiplier
            });
          }
          state.items.forEach(it => {
            it.y += it.vy;
            if (
              it.y > state.basket.y - 12 &&
              it.y < state.basket.y + state.basket.height &&
              it.x > state.basket.x - 12 &&
              it.x < state.basket.x + state.basket.width + 12
            ) {
              it.y = height + 100;
              if (it.isDanger) {
                soundSynth.play('hit');
                setLives(l => {
                  const n = l - 1;
                  if (n <= 0) handleGameOver();
                  return Math.max(0, n);
                });
              } else {
                soundSynth.play('coin');
                setScore(s => s + 15);
                setCoinsEarned(c => c + 1);
              }
            }
          });
          state.items = state.items.filter(it => it.y < height + 40);
        }

        ctx.fillStyle = '#D4A359';
        ctx.fillRect(state.basket.x, state.basket.y, state.basket.width, state.basket.height);
        ctx.fillStyle = '#2D4F3E';
        ctx.fillRect(state.basket.x + 4, state.basket.y + 4, state.basket.width - 8, state.basket.height - 8);

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        state.items.forEach(it => {
          ctx.fillText(it.label, it.x, it.y);
        });
      }

      // 5. FLAPPY DRON
      if (selectedGameId === 'drone' && state.drone && Array.isArray(state.pipes)) {
        if (gameState === 'playing') {
          state.drone.y += state.drone.vy;
          state.drone.vy += 0.38; // Gravedad suave

          if (state.drone.invincibleTimer > 0) state.drone.invincibleTimer--;

          state.spawnTimer++;
          if (state.spawnTimer > Math.max(65, Math.floor(95 / diffMultiplier))) {
            state.spawnTimer = 0;
            const gapY = 70 + Math.random() * (height - 180);
            const gapHeight = Math.max(90, 125 - currentLevel * 7);
            state.pipes.push({
              x: width + 20,
              topY: gapY,
              bottomY: gapY + gapHeight,
              width: 50,
              passed: false
            });
          }

          const pipeSpeed = (3.2 + currentLevel * 0.6) * diffMultiplier;
          state.pipes.forEach(p => {
            p.x -= pipeSpeed;
            const d = state.drone;
            const pad = 6;
            if (
              state.drone.invincibleTimer === 0 &&
              d.x + d.width - pad > p.x &&
              d.x + pad < p.x + p.width &&
              (d.y + pad < p.topY || d.y + d.height - pad > p.bottomY)
            ) {
              soundSynth.play('hit');
              state.drone.invincibleTimer = 45;
              setLives(l => {
                const n = l - 1;
                if (n <= 0) handleGameOver();
                return Math.max(0, n);
              });
            } else if (!p.passed && p.x + p.width < d.x) {
              p.passed = true;
              setScore(s => s + 20);
              setCoinsEarned(c => c + 1);
              soundSynth.play('coin');
            }
          });
          state.pipes = state.pipes.filter(p => p.x > -60);

          if (state.drone.y < 5) {
            state.drone.y = 5;
            state.drone.vy = 0;
          }
          if (state.drone.y > height - 25) {
            if (state.drone.invincibleTimer === 0) {
              soundSynth.play('hit');
              state.drone.invincibleTimer = 45;
              setLives(l => {
                const n = l - 1;
                if (n <= 0) handleGameOver();
                return Math.max(0, n);
              });
            }
            state.drone.y = height / 2;
            state.drone.vy = 0;
          }
        }

        // Dibujar Dron con parpadeo si tiene inmunidad
        const isBlinking = state.drone.invincibleTimer > 0 && Math.floor(state.drone.invincibleTimer / 4) % 2 === 0;
        if (!isBlinking) {
          ctx.font = '28px sans-serif';
          ctx.fillText('🛸', state.drone.x, state.drone.y + 20);
        }

        state.pipes.forEach(p => {
          ctx.fillStyle = '#D4A359';
          ctx.fillRect(p.x, 0, p.width, p.topY);
          ctx.fillRect(p.x, p.bottomY, p.width, height - p.bottomY);
        });
      }

      // 6. PLANCHA TÉRMICA RUSH (DTF)
      if (selectedGameId === 'heatpress' && state.needleAngle !== undefined && Array.isArray(state.steamParticles)) {
        if (gameState === 'playing') {
          state.needleAngle += state.needleSpeed * diffMultiplier * state.needleDir;
          if (state.needleAngle > 65) state.needleDir = -1;
          if (state.needleAngle < -65) state.needleDir = 1;

          if (state.feedbackTimer > 0) state.feedbackTimer--;

          state.steamParticles.forEach(sp => {
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.life--;
          });
          state.steamParticles = state.steamParticles.filter(sp => sp.life > 0);
        }

        // Manómetro
        ctx.save();
        ctx.translate(width / 2, 140);
        ctx.fillStyle = '#102A1E';
        ctx.beginPath();
        ctx.arc(0, 0, 85, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#D4A359';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Zona Verde de fijación óptima
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 75, -Math.PI / 2 - 0.28, -Math.PI / 2 + 0.28);
        ctx.stroke();

        // Aguja
        const rad = (state.needleAngle * Math.PI) / 180 - Math.PI / 2;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * 70, Math.sin(rad) * 70);
        ctx.stroke();
        ctx.restore();

        // Prenda DTF en la mesa (rotación dinámica de artículos)
        ctx.fillStyle = '#FAF7F0';
        ctx.fillRect(width / 2 - 45, 230, 90, 80);
        ctx.font = '28px sans-serif';
        const garmentIcon = state.currentGarment || '👕';
        ctx.fillText(state.isStamped ? `${garmentIcon}✨` : garmentIcon, width / 2, 270);

        if (state.feedbackTimer > 0) {
          ctx.fillStyle = '#F5D061';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(state.stampFeedback, width / 2, 335);
        }
      }

      // 7. SIERRA NINJA
      if (selectedGameId === 'saw' && Array.isArray(state.flyingPieces)) {
        if (gameState === 'playing') {
          state.spawnTimer++;
          if (state.spawnTimer > Math.max(30, Math.floor(60 / diffMultiplier))) {
            state.spawnTimer = 0;
            const isObstacle = Math.random() < 0.22;
            state.flyingPieces.push({
              x: 80 + Math.random() * (width - 160),
              y: height + 10,
              vx: (Math.random() - 0.5) * 4,
              vy: -11 - Math.random() * 3,
              isObstacle,
              label: isObstacle ? '🔩' : (Math.random() > 0.5 ? '🪵' : '🪞'),
              cut: false
            });
          }

          state.flyingPieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.32; // Gravedad
          });
          state.flyingPieces = state.flyingPieces.filter(p => p.y < height + 40);
        }

        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        state.flyingPieces.forEach(p => {
          if (!p.cut) {
            ctx.fillText(p.label, p.x, p.y);
          } else {
            ctx.fillStyle = '#D4A359';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('¡CORTE!', p.x, p.y);
          }
        });
      }

      // 8. MEZCLADOR DE TINTAS
      if (selectedGameId === 'inkmixer' && state.targetInk && state.timer !== undefined) {
        if (gameState === 'playing') {
          state.timer -= 0.65 * diffMultiplier;
          if (state.timer <= 0) {
            soundSynth.play('hit');
            setLives(l => {
              const n = l - 1;
              if (n <= 0) handleGameOver();
              return Math.max(0, n);
            });
            state.timer = 100;
          }
        }

        // Tinta Objetivo
        ctx.fillStyle = '#FAF7F0';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🎯 MEZCLA SOLICITADA: ${state.targetInk.name}`, width / 2, 60);

        // Muestra de color
        ctx.fillStyle = state.targetInk.hex;
        ctx.fillRect(width / 2 - 35, 78, 70, 70);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(width / 2 - 35, 78, 70, 70);

        // Barra de tiempo
        ctx.fillStyle = '#374151';
        ctx.fillRect(width / 2 - 120, 160, 240, 14);
        ctx.fillStyle = state.timer > 30 ? '#10B981' : '#EF4444';
        ctx.fillRect(width / 2 - 120, 160, (240 * state.timer) / 100, 14);

        // 4 cubetas interactivas de color dibujadas directamente en Canvas
        const potWidth = 110;
        const potGap = 20;
        const startPotX = 65;
        const inkList = [
          { name: 'CIAN', key: 'cyan', hex: '#00AEEF' },
          { name: 'MAGENTA', key: 'magenta', hex: '#EC008C' },
          { name: 'AMARILLO', key: 'yellow', hex: '#FFF200' },
          { name: 'NEGRO', key: 'black', hex: '#111827' }
        ];
        inkList.forEach((ink, idx) => {
          const bx = startPotX + idx * (potWidth + potGap);
          ctx.fillStyle = ink.hex;
          ctx.beginPath();
          ctx.rect(bx, 215, potWidth, 50);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = ink.key === 'yellow' ? '#000000' : '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(ink.name, bx + potWidth / 2, 245);
        });
      }

      // 9. PROGRAMADOR CHIP NFC
      if (selectedGameId === 'nfcchip' && state.targetCenter !== undefined && Array.isArray(state.ripples) && state.waveX !== undefined) {
        if (gameState === 'playing') {
          const dir = state.waveDir || 1;
          state.waveX += 4.2 * dir * diffMultiplier;
          if (state.waveX > width - 60) {
            state.waveX = width - 60;
            state.waveDir = -1;
          } else if (state.waveX < 60) {
            state.waveX = 60;
            state.waveDir = 1;
          }

          if (state.feedbackTimer > 0) state.feedbackTimer--;

          state.ripples.forEach(r => {
            r.r += 2.5;
            r.alpha -= 0.04;
          });
          state.ripples = state.ripples.filter(r => r.alpha > 0);
        }

        // Microchip Central
        ctx.fillStyle = '#1E3A2E';
        ctx.fillRect(state.targetCenter - 45, 140, 90, 80);
        ctx.strokeStyle = '#D4A359';
        ctx.lineWidth = 3;
        ctx.strokeRect(state.targetCenter - 45, 140, 90, 80);

        // Zona de sintonía verde amplia y calibrada
        const radZone = state.targetRadius || 42;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fillRect(state.targetCenter - radZone, 140, radZone * 2, 80);

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📡', state.targetCenter, 188);

        // Pulso senoidal
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(state.waveX, 180, 13, 0, Math.PI * 2);
        ctx.fill();

        if (state.feedbackTimer > 0) {
          ctx.fillStyle = '#F5D061';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(state.feedback, width / 2, 280);
        }
      }

      // 10. ROMPE-BOCETOS (BRICK BREAKER)
      if (selectedGameId === 'breaker' && state.paddle && state.ball && Array.isArray(state.bricks)) {
        if (gameState === 'playing') {
          state.ball.x += state.ball.vx * diffMultiplier * 0.7;
          state.ball.y += state.ball.vy * diffMultiplier * 0.7;

          // Paredes
          if (state.ball.x <= 15 || state.ball.x >= width - 15) state.ball.vx *= -1;
          if (state.ball.y <= 15) state.ball.vy *= -1;

          // Paddle
          if (
            state.ball.y + state.ball.radius >= state.paddle.y &&
            state.ball.x >= state.paddle.x &&
            state.ball.x <= state.paddle.x + state.paddle.width
          ) {
            state.ball.vy = -Math.abs(state.ball.vy);
            soundSynth.play('stack');
          }

          // Bricks
          state.bricks.forEach(b => {
            if (
              b.alive &&
              state.ball.x >= b.x &&
              state.ball.x <= b.x + b.width &&
              state.ball.y >= b.y &&
              state.ball.y <= b.y + b.height
            ) {
              b.alive = false;
              state.ball.vy *= -1;
              soundSynth.play('coin');
              setScore(s => s + 10);
            }
          });

          // Verificar si se rompieron todos los bloques
          const allCleared = state.bricks.length > 0 && state.bricks.every(b => !b.alive);
          if (allCleared) {
            soundSynth.play('win');
            setScore(s => s + 80);
            // Calibrado: vaciar tablero otorga +2 monedas (previamente setCoinsEarned(c => c + 25))
            setCoinsEarned(c => c + 2);
            state.bricks.forEach(b => { b.alive = true; });
            state.ball.x = width / 2;
            state.ball.y = height - 50;
            state.ball.vy = -3.5;
          }

          // Fondo
          if (state.ball.y > height) {
            soundSynth.play('hit');
            setLives(l => {
              const n = l - 1;
              if (n <= 0) handleGameOver();
              return Math.max(0, n);
            });
            state.ball.x = width / 2;
            state.ball.y = height - 50;
            state.ball.vy = -3.5;
          }
        }

        // Draw Paddle & Ball
        ctx.fillStyle = '#D4A359';
        ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height);

        ctx.fillStyle = '#FAF7F0';
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw Bricks
        state.bricks.forEach(b => {
          if (b.alive) {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.width, b.height);
          }
        });
      }

      // HUD de Dificultad Dinámica en Canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(width - 215, 8, 205, 24);
      ctx.fillStyle = diffMultiplier > 1.8 ? '#EF4444' : (diffMultiplier > 1.3 ? '#F59E0B' : '#10B981');
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`🔥 DIFICULTAD: ${diffMultiplier.toFixed(1)}x (${diffSettings.badge})`, width - 18, 24);

      // Overlays de Inicio, Game Over y Victoria
      if (gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, width, height);
        if (!isGameActive(selectedGameId)) {
          ctx.fillStyle = '#EF4444';
          ctx.font = 'bold 20px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🚫 JUEGO DESACTIVADO POR ADMINISTRACIÓN', width / 2, height / 2 - 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Selecciona un juego activo en el catálogo superior para jugar.', width / 2, height / 2 + 14);
        } else {
          ctx.fillStyle = '#F5D061';
          ctx.font = 'bold 22px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('¡TOCA AQUÍ PARA INICIAR!', width / 2, height / 2 - 18);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`🎮 Costo: 1 Moneda de Juego (Tienes: ${credits}/${maxCredits}) · 🪙 ${userCoins} Monedas Ganadas`, width / 2, height / 2 + 14);
          ctx.fillStyle = '#FBBF24';
          ctx.font = '12px sans-serif';
          ctx.fillText(`⏳ Cada 15 min en la página se te genera +1 moneda gratis (Tope: 5)`, width / 2, height / 2 + 38);
        }
      } else if (gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('¡FIN DE LA PARTIDA!', width / 2, height / 2 - 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '15px sans-serif';
        ctx.fillText(`Puntos: ${score} · Monedas Ganadas: 🪙 +${coinsEarned}`, width / 2, height / 2 + 8);
        ctx.fillStyle = '#D4A359';
        ctx.font = '12px sans-serif';
        ctx.fillText('Toca aquí para jugar otra partida', width / 2, height / 2 + 38);
      } else if (gameState === 'victory') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('¡MAESTRO DEL TALLER! (3 MIN)', width / 2, height / 2 - 25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '15px sans-serif';
        ctx.fillText(`Supervivencia completa: Ganaste 🪙 +${coinsEarned} Monedas`, width / 2, height / 2 + 8);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedGameId, gameState, score, coinsEarned, currentLevel, activeTheme]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isLandscapeMode ? 'p-0' : 'p-1.5 sm:p-4'} bg-black/85 backdrop-blur-md animate-fadeIn`}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${isLandscapeMode ? 'h-full max-h-screen max-w-full rounded-none' : 'max-w-4xl max-h-[96vh] rounded-3xl'} bg-gradient-to-br ${currentTheme.cabinetBg} text-white border-2 ${currentTheme.cabinetBorder} shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}
        onClick={e => e.stopPropagation()}
      >
        {/* Lluvia de confeti de recompensa estacional */}
        {rewardConfetti.map(c => (
          <div
            key={c.id}
            style={{ left: c.left, animationDelay: c.delay }}
            className="absolute top-0 text-2xl pointer-events-none animate-bounce z-50 drop-shadow-lg"
          >
            {c.char}
          </div>
        ))}

        {/* Cabecera Retro Arcade Temática con Énfasis de Época */}
        <div className={`flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-white/10 bg-gradient-to-r ${currentTheme.marqueeBg} shrink-0 gap-2`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl animate-bounce shrink-0">{currentTheme.icon || '🕹️'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className={`font-extrabold text-sm sm:text-lg font-heading tracking-wide truncate ${currentTheme.accentText}`}>
                  Arcade del Taller
                </h3>
                <span className="text-[9px] sm:text-[10px] bg-red-600/90 text-white px-1.5 sm:px-2 py-0.2 rounded-full font-mono uppercase tracking-wider font-bold animate-pulse shadow-xs shrink-0">
                  10 JUEGOS
                </span>
              </div>
              <p className="text-[11px] text-gray-300 hidden sm:block truncate">
                {currentTheme.subtitle || 'Rotación de juegos, dificultad dinámica y cupones de descuento canjeables'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Monedas de Juego */}
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/50 border border-emerald-400/50 text-emerald-300 font-mono text-[11px] sm:text-xs font-bold shadow-inner" title="Monedas disponibles para jugar (Costo: 1 por partida)">
              <span>🎮</span>
              <span>{credits}/{maxCredits}</span>
            </div>

            {/* Monedero de Premios Ganados (para cupones) */}
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/40 border border-amber-400/40 text-amber-300 font-mono text-[11px] sm:text-xs font-bold shadow-inner" title="Monedas ganadas para canjear cupones">
              <span>🪙</span>
              <span>{userCoins}</span>
            </div>

            {/* Contador de Vigencia de Sesión de Monedas (1 Hora) - Oculto en móvil pequeño para evitar overflow */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-gray-300 font-mono text-xs font-bold shadow-inner"
              title="Las monedas se restablecen tras 1 hora en la página; ¡canjéalas antes de que concluya tu sesión!"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300">{sessionTimeFormatted}</span>
            </div>

            {/* Toggle de Voltear Pantalla / Modo Horizontal Fullscreen */}
            <button
              type="button"
              onClick={toggleOrientationMode}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                isLandscapeMode
                  ? 'bg-amber-400 text-[#17251E] border-amber-300 ring-2 ring-amber-300/50'
                  : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/20'
              }`}
              title={isLandscapeMode ? "Volver a modo normal" : "Modo horizontal"}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLandscapeMode ? 'text-[#17251E] rotate-90' : 'text-amber-400'}`} />
            </button>

            {/* Audio Toggle (Solo pantallas no diminutas) */}
            <button
              type="button"
              onClick={handleToggleMute}
              className="hidden xs:flex p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title={isMuted ? 'Activar sonido retro' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
            </button>

            {/* BOTÓN SALIR DESTACADO Y GARANTIZADO */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer border border-red-400/50 shrink-0"
              title="Salir y volver a la tienda"
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center justify-between border-b border-[#D4A359]/20 bg-black/30 px-5 shrink-0">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('play')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'play'
                  ? 'border-[#D4A359] text-[#F5D061]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Consola de Juegos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rewards')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rewards'
                  ? 'border-[#D4A359] text-[#F5D061]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Caja de Canje &amp; Cupones</span>
              {userCoins >= 30 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          </div>

          {/* Selector de modo de juegos: Reto del Día vs Ver los 10 */}
          {activeTab === 'play' && gameState !== 'playing' && (
            <div className="flex items-center gap-1 text-[11px] bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setGamesViewMode('active')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  gamesViewMode === 'active'
                    ? 'bg-[#D4A359] text-[#17251E]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⭐ Reto del Día ({activeGameIds.length})
              </button>
              <button
                type="button"
                onClick={() => setGamesViewMode('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  gamesViewMode === 'all'
                    ? 'bg-[#D4A359] text-[#17251E]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎮 Catálogo Completo (10)
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
          {effectiveConfig?.enabled === false && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-center gap-2.5 text-xs font-bold shadow-inner">
              <span className="text-lg">⏸️</span>
              <div>
                <p>El Arcade del Taller se encuentra temporalmente pausado por administración.</p>
                <p className="text-[11px] text-rose-300 font-normal">Los juegos no están disponibles por el momento, pero tus monedas y cupones guardados siguen a salvo.</p>
              </div>
            </div>
          )}

          {activeTab === 'play' && (
            <div className="space-y-2.5 sm:space-y-4">
              {/* Selector Deslizable Compacto para Celular (Ultra compacto ~38px: ¡El juego queda arriba de inmediato!) */}
              <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-bold text-gray-400 shrink-0 font-mono px-1">🕹️ Juegos:</span>
                {currentAvailableGames.map(g => {
                  const isSel = selectedGameId === g.id;
                  const active = isGameActive(g.id);
                  return (
                    <button
                      key={`mob-${g.id}`}
                      type="button"
                      disabled={!active}
                      onClick={() => {
                        if (!active) {
                          soundSynth.play('hit');
                          return;
                        }
                        setSelectedGameId(g.id);
                        initGameLogic(g.id);
                        setGameState('ready');
                        soundSynth.play('stack');
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                        !active
                          ? 'opacity-40 cursor-not-allowed bg-red-950/20 border-red-500/30 text-rose-300'
                          : isSel
                            ? 'bg-[#2D4F3E] border-[#D4A359] text-[#F5D061] ring-2 ring-[#D4A359]/60 shadow-sm'
                            : 'bg-black/40 border-white/15 text-gray-200 hover:bg-white/10'
                      }`}
                      title={!active ? 'Juego inactivo' : g.title}
                    >
                      <span className="text-sm">{g.icon}</span>
                      <span className="text-[11px] font-semibold whitespace-nowrap">{g.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selector de Dificultad Dinámica y Asistida por Monedas */}
              <div className="flex items-center justify-between p-2 rounded-2xl bg-black/40 border border-[#D4A359]/30 text-xs gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-[11px] text-gray-200">Dificultad:</span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  {[
                    { id: 'easy', label: '⭐ Fácil (Móvil)', hint: 'Velocidad suave & 4 vidas' },
                    { id: 'normal', label: '⚡ Normal', hint: 'Velocidad estándar & 3 vidas' },
                    { id: 'pro', label: '🔥 Pro (x2)', hint: 'Mayor velocidad & doble moneda' },
                    { id: 'auto_coins', label: '🪙 Adaptable', hint: 'Se adapta automáticamente a tu saldo de monedas' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => changeDifficultyMode(m.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        difficultyMode === m.id
                          ? 'bg-[#D4A359] text-[#17251E] border-amber-300 shadow-sm font-extrabold ring-1 ring-amber-300/60'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/15'
                      }`}
                      title={m.hint}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-amber-300 font-mono hidden md:flex items-center gap-1 shrink-0">
                  <span>{diffSettings.hint}</span>
                </div>
              </div>

              {/* Selector de Mini-Juegos para Escritorio (Preservado en cuadrícula de 5 columnas) */}
              <div className="hidden sm:grid sm:grid-cols-5 gap-2">
                {currentAvailableGames.map(g => {
                  const isSel = selectedGameId === g.id;
                  const active = isGameActive(g.id);
                  const isFeaturedToday = activeGameIds.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={!active}
                      onClick={() => {
                        if (!active) {
                          soundSynth.play('hit');
                          return;
                        }
                        setSelectedGameId(g.id);
                        initGameLogic(g.id);
                        setGameState('ready');
                        soundSynth.play('stack');
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        !active
                          ? 'opacity-40 cursor-not-allowed bg-red-950/20 border-red-500/20 hover:bg-red-950/20'
                          : isSel
                            ? 'bg-[#2D4F3E] border-[#D4A359] ring-2 ring-[#D4A359]/40 shadow-md scale-[1.02] cursor-pointer'
                            : 'bg-black/30 border-white/10 hover:bg-white/5 cursor-pointer'
                      }`}
                      title={!active ? 'Juego desactivado en el panel de administración' : g.title}
                    >
                      {active && isFeaturedToday && (
                        <div className="absolute top-1 right-1 text-[9px] text-amber-300 font-bold">
                          ⭐
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{g.icon}</span>
                        {active ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold border border-amber-400/30">
                            🪙 1 Moneda
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                            🚫 Inactivo
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <div className="font-extrabold text-xs text-white truncate">{g.title}</div>
                        <div className="text-[10px] text-gray-400 truncate">{g.subtitle}</div>
                        <div className="text-[10px] text-amber-300/90 font-semibold mt-1 flex items-center gap-1">
                          {active ? (
                            <>
                              <span>Requiere:</span>
                              <span className="text-amber-200">1 Moneda</span>
                            </>
                          ) : (
                            <span className="text-rose-400 font-bold">🚫 Desactivado</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* HUD Superior de la Partida */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-2xl bg-black/40 border border-[#D4A359]/30 text-xs font-mono flex-wrap gap-2">
                {/* Vidas Dinámicas */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px]">Vidas:</span>
                  <div className="flex gap-1 text-sm">
                    {Array.from({ length: Math.max(diffSettings.initialLives, lives) }, (_, i) => i + 1).map(heartIdx => (
                      <span key={heartIdx} className={heartIdx <= lives ? 'opacity-100' : 'opacity-25 grayscale'}>
                        ❤️
                      </span>
                    ))}
                    {hasShield && (
                      <span className="text-sm animate-pulse" title="🛡️ Escudo Asistido Activo (absorbe 1 fallo)">
                        🛡️
                      </span>
                    )}
                  </div>
                </div>

                {/* Nivel y Dificultad Dinámica */}
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="font-bold text-[11px] sm:text-xs">
                    Nivel {currentLevel} · {diffSettings.badge} · +{coinsEarned}🪙
                  </span>
                </div>

                {/* Reloj regresivo */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className={`font-bold ${timeLeft < 30 ? 'text-red-400 animate-ping' : 'text-emerald-300'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Puntos y Botón de Giro en Pantalla */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Pts: <strong className="text-white">{score}</strong></span>
                  <button
                    type="button"
                    onClick={toggleOrientationMode}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 text-[11px] flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    title={isLandscapeMode ? "Modo normal" : "Modo horizontal / pantalla completa"}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isLandscapeMode ? 'rotate-90 text-amber-200' : ''}`} />
                    <span className="hidden sm:inline">{isLandscapeMode ? 'Normal' : 'Girar'}</span>
                  </button>
                </div>
              </div>

              {/* PANTALLA CANVAS DEL JUEGO CON BORDE TEMÁTICO */}
              <div
                className={`relative w-full aspect-video ${isLandscapeMode ? 'max-h-[55vh] sm:max-h-[65vh]' : 'max-h-[380px]'} bg-black rounded-3xl overflow-hidden border-2 ${currentTheme.screenBorder} shadow-inner flex items-center justify-center cursor-pointer select-none`}
                onClick={handleAction}
                onMouseMove={handleCanvasMouseMove}
                onTouchMove={handleCanvasTouchMove}
              >
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  className="w-full h-full object-contain"
                />

                {/* OVERLAY INTERACTIVO: PANTALLA DE INICIO CON BOTÓN FÍSICO Y COSTO DE MONEDAS */}
                {gameState === 'ready' && (
                  <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 animate-fadeIn"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="text-4xl sm:text-5xl mb-2 animate-bounce">
                      {GAMES.find(g => g.id === selectedGameId)?.icon || '🕹️'}
                    </div>
                    <h4 className={`text-xl sm:text-2xl font-black font-heading ${currentTheme.accentText} drop-shadow-md`}>
                      {GAMES.find(g => g.id === selectedGameId)?.title}
                    </h4>
                    <p className="text-xs text-gray-200 max-w-md mt-1 mb-4 leading-relaxed font-sans">
                      {GAMES.find(g => g.id === selectedGameId)?.instructions}
                    </p>

                    {credits > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startGame();
                        }}
                        title="Jugar (Costo: 1 Moneda)"
                        className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-[#F5D061] to-amber-500 hover:brightness-110 active:scale-95 text-[#17251E] font-black text-sm sm:text-base transition-all shadow-2xl flex items-center gap-2.5 cursor-pointer border-2 border-white/80 animate-pulse"
                      >
                        <span className="text-xl">🎮</span>
                        <span>JUGAR AHORA · Costo: 1 Moneda</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 max-w-sm">
                        <div className="px-4 py-2.5 rounded-2xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-semibold leading-snug">
                          ⚠️ Te has quedado sin monedas de juego (0/{maxCredits}).
                          <br />
                          <span className="text-[11px] text-gray-300">
                            Recarga pasiva de 1 moneda gratis en <strong>{refillTimeFormatted}</strong>
                          </span>
                        </div>
                        {userCoins >= 2 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const res = exchangeCoinsForCredits(2, 1);
                              if (res.success) {
                                soundSynth.play('coin');
                                playMario1UpSound();
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#17251E] font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <span>🔄 Canjear 2🪙 ganadas por 1🎮 crédito</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-3 text-[11px] text-gray-300 font-mono bg-black/60 px-3.5 py-1.5 rounded-full border border-white/10">
                      <span>Tienes: <strong className="text-amber-300">{credits}/{maxCredits} Monedas</strong></span>
                      <span>·</span>
                      <span>1 Moneda cada 50 pts</span>
                    </div>
                  </div>
                )}

                {/* OVERLAY INTERACTIVO: GAME OVER & RESULTADOS */}
                {(gameState === 'gameover' || gameState === 'victory') && (
                  <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 animate-fadeIn"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="text-4xl mb-1">{gameState === 'victory' ? '🏆' : '💥'}</div>
                    <h4 className={`text-xl sm:text-2xl font-black font-heading ${gameState === 'victory' ? 'text-amber-300' : 'text-rose-400'}`}>
                      {gameState === 'victory' ? '¡VICTORIA EN EL TALLER!' : '¡PARTIDA TERMINADA!'}
                    </h4>
                    <div className="my-2 text-xs text-gray-200 space-y-1">
                      <p>Puntuación lograda: <strong className="text-white text-sm">{score} pts</strong></p>
                      <p>Monedas ganadas para cupones: <strong className="text-amber-300 text-sm">+{coinsEarned} 🪙</strong></p>
                    </div>

                    <div className="flex items-center gap-2.5 mt-3 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startGame();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#F5D061] hover:brightness-110 active:scale-95 text-[#17251E] font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-amber-300/50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>JUGAR OTRA VEZ · 1 Moneda ({credits} disp.)</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('rewards');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/25 cursor-pointer flex items-center gap-1.5"
                      >
                        <Gift className="w-4 h-4 text-amber-300" />
                        <span>Ir a Canjear Cupones</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CONTROLES VIRTUALES COMPLETOS PARA CELULAR (GAMEPAD MÓVIL) */}
              {gameState === 'playing' && (
                <div className="pt-2 pb-1 space-y-2.5 select-none animate-fadeIn">
                  
                  {/* Mezclador de Tintas: 4 botones de selección CMYK táctiles */}
                  {selectedGameId === 'inkmixer' && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[
                        { key: 'cyan', label: '🔵 Cian', hex: 'bg-cyan-600' },
                        { key: 'magenta', label: '🔴 Magenta', hex: 'bg-pink-600' },
                        { key: 'yellow', label: '🟡 Amarillo', hex: 'bg-amber-400 text-black' },
                        { key: 'black', label: '⚫ Negro', hex: 'bg-gray-900 border border-gray-600' }
                      ].map(ink => (
                        <button
                          key={ink.key}
                          type="button"
                          onClick={() => handleSelectInk(ink.key)}
                          className={`py-3 rounded-2xl text-xs font-black text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all text-center ${ink.hex}`}
                        >
                          {ink.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sierra Ninja: Pista táctil interactiva */}
                  {selectedGameId === 'saw' && (
                    <div className="py-2.5 px-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <span className="text-lg">🪚</span>
                      <span>¡Desliza tu dedo sobre la pantalla para cortar las piezas en el aire! Esquiva tornillos 🔩</span>
                    </div>
                  )}

                  {/* Controles de Movimiento Izquierda / Derecha para Atrapa-Piezas y Rompemuros */}
                  {(selectedGameId === 'collector' || selectedGameId === 'breaker') && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleMoveLeft}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleMoveLeft();
                        }}
                        className="h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 hover:bg-white/25 active:bg-[#D4A359] active:text-[#17251E] text-white font-black text-sm flex items-center justify-center gap-2 border-2 border-white/30 shadow-lg active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="text-2xl">◀</span>
                        <span>Mover Izquierda</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleMoveRight}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleMoveRight();
                        }}
                        className="h-14 sm:h-16 rounded-2xl bg-gradient-to-b from-white/20 to-white/10 hover:bg-white/25 active:bg-[#D4A359] active:text-[#17251E] text-white font-black text-sm flex items-center justify-center gap-2 border-2 border-white/30 shadow-lg active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Mover Derecha</span>
                        <span className="text-2xl">▶</span>
                      </button>
                    </div>
                  )}

                  {/* Botón Principal de Acción / Salto / Disparo para Juegos Móviles */}
                  {selectedGameId !== 'inkmixer' && selectedGameId !== 'saw' && (
                    <div>
                      <button
                        type="button"
                        onClick={handleAction}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handleAction();
                        }}
                        className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-amber-400 via-[#F5D061] to-amber-500 hover:brightness-110 active:scale-95 text-[#17251E] font-black text-base transition-all shadow-[0_8px_25px_rgba(245,158,11,0.5)] border-2 border-white/80 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        <span className="text-2xl">{getGameActionLabel(selectedGameId).icon}</span>
                        <span>{getGameActionLabel(selectedGameId).label}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Barra de Instrucciones y Botón Físico Destacado para Jugar (Solo visible antes de iniciar partida) */}
              {gameState !== 'playing' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-300 px-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] text-amber-300 font-bold">
                      CONTROLES:
                    </span>
                    <span className="text-[11px]">
                      {GAMES.find(g => g.id === selectedGameId)?.instructions}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={startGame}
                      disabled={!isGameActive(selectedGameId)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] via-amber-400 to-[#F5D061] hover:brightness-110 active:scale-95 text-[#17251E] font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg border border-amber-300/40"
                      title={`Inicia partida descontando 1 moneda. Tienes ${credits}/${maxCredits} monedas`}
                    >
                      <span className="text-sm">🎮</span>
                      <span>JUGAR AHORA · Costo: 1 Moneda de Juego (Tienes {credits}/{maxCredits})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Catálogo detallado de juegos para móvil (debajo del juego para no empujar el canvas) */}
              {gameState !== 'playing' && (
                <div className="sm:hidden pt-1">
                  <details className="group rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                    <summary className="px-4 py-2 text-xs font-bold text-amber-300 flex items-center justify-between cursor-pointer hover:bg-white/5 select-none">
                      <span>📖 Ver catálogo detallado de juegos ({currentAvailableGames.length})</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="p-2 grid grid-cols-1 gap-1.5 border-t border-white/10 bg-black/20">
                      {currentAvailableGames.map(g => {
                        const isSel = selectedGameId === g.id;
                        const active = isGameActive(g.id);
                        return (
                          <button
                            key={`mob-detail-${g.id}`}
                            type="button"
                            disabled={!active}
                            onClick={() => {
                              if (!active) {
                                soundSynth.play('hit');
                                return;
                              }
                              setSelectedGameId(g.id);
                              initGameLogic(g.id);
                              setGameState('ready');
                              soundSynth.play('stack');
                            }}
                            className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                              !active
                                ? 'opacity-40 cursor-not-allowed bg-red-950/20 border-red-500/20'
                                : isSel
                                  ? 'bg-[#2D4F3E] border-[#D4A359] text-[#F5D061] ring-1 ring-[#D4A359]/60'
                                  : 'bg-black/30 border-white/10 text-gray-200'
                            }`}
                          >
                            <span className="text-xl">{g.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-white truncate">{g.title}</div>
                              <div className="text-[10px] text-gray-400 truncate">{g.subtitle}</div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-mono ${
                              active ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-red-500/20 text-rose-300'
                            }`}>
                              {active ? '1 Moneda' : '🚫 Inactivo'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* TAB: CAJA DE CANJE DE CUPONES */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#20392C] to-[#17251E] border border-[#D4A359]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Tu Bóveda de Taller</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black font-heading text-white">
                    Tienes {userCoins} Monedas Acumuladas
                  </h4>
                  <p className="text-xs text-gray-300">
                    Gana monedas jugando en cada sesión. Los códigos de cupón rotan todos los días y permanecen protegidos con candado hasta que los desbloquees con tus monedas ganadas.
                  </p>
                </div>

                {activeCoupon && (
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-center shrink-0">
                    <div className="text-[10px] text-emerald-300 font-mono uppercase font-bold">Cupón Activo en Carrito:</div>
                    <div className="text-base font-mono font-black text-white">{activeCoupon}</div>
                  </div>
                )}
              </div>

              {/* Lista de Cupones Editables y Canjeables con Códigos Protegidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discountTiers.map(tier => {
                  const isCurrentActive = activeCoupon === tier.code;
                  const isUnlocked = isCurrentActive || unlockedCoupons.includes(tier.code);
                  const canAfford = userCoins >= tier.coinsRequired;

                  return (
                    <div
                      key={tier.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                        isCurrentActive
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                          : isUnlocked
                          ? 'bg-[#1b2b23] border-amber-400/40 shadow-sm'
                          : canAfford
                          ? 'bg-black/30 border-[#D4A359]/40 hover:border-[#D4A359]'
                          : 'bg-black/20 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                            <span>🪙 Requisito: {tier.coinsRequired} Monedas</span>
                            {isUnlocked && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                                Desbloqueado
                              </span>
                            )}
                          </div>
                          <h5 className="text-lg font-black font-heading text-white mt-1">
                            {tier.label}
                          </h5>
                          <p className="text-xs text-gray-400 leading-snug mt-0.5">
                            {tier.description}
                          </p>
                        </div>

                        {/* Código Secreto: Oculto con candado hasta ganar/canjear */}
                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider select-all">
                              {tier.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(tier.code);
                                  setCopiedCoupon(tier.code);
                                  setTimeout(() => setCopiedCoupon(''), 2500);
                                }
                              }}
                              title="Copiar código"
                              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition-colors cursor-pointer"
                            >
                              {copiedCoupon === tier.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-black/40 text-gray-400 border border-dashed border-white/20 select-none"
                            title="Oculto hasta acumular suficientes monedas y canjearlo"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-mono font-bold text-xs tracking-widest text-gray-400">
                              ••••••••
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        {isCurrentActive ? (
                          <div className="w-full py-2.5 rounded-2xl bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Cupón Listo y Activado en Carrito</span>
                          </div>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleRedeemCoupon(tier)}
                            className="w-full py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Reactivar Cupón en Carrito ({tier.code})</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => handleRedeemCoupon(tier)}
                            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                              canAfford
                                ? 'bg-[#D4A359] hover:bg-[#c28e38] text-[#17251E] cursor-pointer ring-2 ring-amber-400/40 animate-pulse'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Gift className="w-4 h-4" />
                            <span>
                              {canAfford
                                ? 'Canjear y Revelar Código Secreto'
                                : `Faltan ${tier.coinsRequired - userCoins} monedas para revelar`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Barra Inferior Fija para Móviles con Salida Garantizada a la Tienda */}
        <div className="sm:hidden px-4 py-2.5 bg-black/80 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all border border-red-400/30 cursor-pointer"
          >
            <span>🏪</span>
            <span>Salir y volver a la Tienda</span>
          </button>
        </div>
      </div>
    </div>
  );
}
