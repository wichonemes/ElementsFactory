import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame, Zap, Clock, Tag, Sparkles, Copy, Check,
  ChevronRight, ChevronLeft, Gift, ArrowDown, Award, Percent, TrendingUp,
  ArrowRight
} from 'lucide-react';
import SeasonalAtmosphere from './SeasonalAtmosphere';

/**
 * Mapa de Paletas TemÃ¡ticas para MonthlyEventBanner
 * Armoniza los colores, degradados, sellos y badges con la paleta de la tienda
 * y con la temporada activa (ClÃ¡sico Taller Verde Bosque / Oro, Navidad, OtoÃ±o, etc.)
 */
export const EVENT_THEMES = {
  // ==========================================
  // PALETAS CLARAS Y VIVAS DE ALTA SATURACIÃ“N (Colores ricos con brillo calibrado, sin blancos planos)
  // ==========================================
  arena_lino: {
    name: 'Arena Dorada & Lino Artesanal (Saturada)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#DCAC66] via-[#C99447] to-[#A8722B] border-amber-800/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#E2B777] via-[#D1A056] to-[#B37F39] border-amber-900/70 text-stone-950 font-semibold',
    glowMajor: 'bg-[#B45309]',
    glowMid: 'bg-[#D97706]',
    tabMajorActive: 'bg-[#244231] text-white',
    tabMidActive: 'bg-[#823B17] text-white',
    badgeMajor: 'bg-gradient-to-r from-[#244231] to-[#365D46] text-white shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#823B17] to-[#A34B20] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#244231] via-[#365D46] to-[#D4A359] border-[#244231] text-white',
    heroSealMid: 'bg-gradient-to-br from-[#823B17] via-[#A34B20] to-[#D4A359] border-[#823B17] text-white',
    heroGlowMajor: 'bg-gradient-to-r from-[#D4A359] via-amber-300 to-[#2D4F3E]',
    heroGlowMid: 'bg-gradient-to-r from-[#9E472A] via-amber-400 to-[#2D4F3E]',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#244231] text-white',
    couponBorder: 'border-amber-900/60',
    couponBtn: 'bg-[#244231] hover:bg-[#1B3326] text-white',
    progressBar: 'bg-gradient-to-r from-[#244231] via-[#D4A359] to-[#823B17]'
  },
  salvia_menta: {
    name: 'Verde Salvia Matcha & Menta BotÃ¡nica (Saturada)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#72BA8F] via-[#54A576] to-[#3B895C] border-emerald-700/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#7FC39B] via-[#63B184] to-[#459567] border-teal-700/70 text-stone-950 font-semibold',
    glowMajor: 'bg-emerald-600',
    glowMid: 'bg-teal-600',
    tabMajorActive: 'bg-[#135431] text-white shadow-xs',
    tabMidActive: 'bg-[#115E59] text-white shadow-xs',
    badgeMajor: 'bg-gradient-to-r from-[#135431] to-[#115E59] text-white shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#115E59] to-[#135431] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#65A30D] border-emerald-600 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#064E3B] via-[#0D9488] to-[#059669] border-teal-600 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600',
    heroGlowMid: 'bg-gradient-to-r from-teal-600 via-emerald-500 to-lime-500',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#135431] text-white',
    couponBorder: 'border-emerald-800/60',
    couponBtn: 'bg-[#135431] hover:bg-[#0E3E24] text-white',
    progressBar: 'bg-gradient-to-r from-[#166534] via-[#0D9488] to-[#15803D]'
  },
  terracota_claro: {
    name: 'Terracota Vivo & Arcilla Cocida (CÃ¡lida)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#DC7E61] via-[#C86445] to-[#A64528] border-orange-800/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#E38E73] via-[#D17255] to-[#B55134] border-orange-900/70 text-stone-950 font-semibold',
    glowMajor: 'bg-orange-600',
    glowMid: 'bg-amber-600',
    tabMajorActive: 'bg-[#8C3317] text-white',
    tabMidActive: 'bg-[#A84525] text-white',
    badgeMajor: 'bg-gradient-to-r from-[#8C3317] to-[#B44B29] text-white shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#A84525] to-[#C95B36] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#8C3317] via-[#B44B29] to-[#D4A359] border-amber-500 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#EA580C] border-orange-400 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-[#9E472A] via-[#D4A359] to-orange-400',
    heroGlowMid: 'bg-gradient-to-r from-orange-400 via-amber-400 to-[#9E472A]',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#8C3317] text-white',
    couponBorder: 'border-orange-900/60',
    couponBtn: 'bg-[#8C3317] hover:bg-[#722710] text-white',
    progressBar: 'bg-gradient-to-r from-[#8C3317] via-[#D4A359] to-amber-500'
  },
  marfil_oro: {
    name: 'Oro Artesanal Radiante & Ãmbar (Luminosa)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#E6BE4D] via-[#D4A532] to-[#B88719] border-amber-800/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#EBC65F] via-[#DBB042] to-[#C29328] border-amber-900/70 text-stone-950 font-semibold',
    glowMajor: 'bg-[#B45309]',
    glowMid: 'bg-amber-500',
    tabMajorActive: 'bg-[#17251E] text-[#F5D061]',
    tabMidActive: 'bg-[#2D4F3E] text-amber-200',
    badgeMajor: 'bg-gradient-to-r from-[#17251E] to-[#2D4F3E] text-[#F5D061] border border-[#D4A359]/40 shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#2D4F3E] to-[#1F3D2E] text-amber-200 shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#17251E] via-[#2D4F3E] to-[#D4A359] border-[#D4A359] text-white',
    heroSealMid: 'bg-gradient-to-br from-[#2D4F3E] via-[#3D6652] to-[#F5D061] border-amber-300 text-stone-900',
    heroGlowMajor: 'bg-gradient-to-r from-[#D4A359] via-amber-400 to-[#17251E]',
    heroGlowMid: 'bg-gradient-to-r from-amber-400 via-[#D4A359] to-emerald-500',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#17251E] text-[#D4A359]',
    couponBorder: 'border-amber-900/60',
    couponBtn: 'bg-[#17251E] hover:bg-[#20392C] text-[#F5D061]',
    progressBar: 'bg-gradient-to-r from-[#17251E] via-[#D4A359] to-amber-400'
  },
  cielo_verano: {
    name: 'Azul Brisa Marina & OcÃ©ano Claro (Saturada)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#54AEE6] via-[#3594D1] to-[#1B77B3] border-sky-800/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#68B8EA] via-[#48A1DC] to-[#2B86C2] border-sky-900/70 text-stone-950 font-semibold',
    glowMajor: 'bg-sky-600',
    glowMid: 'bg-cyan-600',
    tabMajorActive: 'bg-[#0369A1] text-white',
    tabMidActive: 'bg-[#0E7490] text-white',
    badgeMajor: 'bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#0E7490] to-[#06B6D4] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#0C4A6E] via-[#0284C7] to-[#38BDF8] border-sky-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#164E63] via-[#0891B2] to-[#22D3EE] border-cyan-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600',
    heroGlowMid: 'bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-500',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#0369A1] text-white',
    couponBorder: 'border-sky-900/60',
    couponBtn: 'bg-[#0369A1] hover:bg-[#075985] text-white',
    progressBar: 'bg-gradient-to-r from-[#0369A1] via-sky-400 to-cyan-300'
  },
  cempasuchil_sol: {
    name: 'CempasÃºchil & Sol de MediodÃ­a (Amarillo Flor)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] border-amber-800/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] border-orange-800/70 text-stone-950 font-semibold',
    glowMajor: 'bg-amber-600',
    glowMid: 'bg-orange-600',
    tabMajorActive: 'bg-[#78350F] text-amber-100',
    tabMidActive: 'bg-[#9A3412] text-amber-100',
    badgeMajor: 'bg-gradient-to-r from-[#78350F] to-[#9A3412] text-amber-100 shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#9A3412] to-[#C2410C] text-amber-100 shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#78350F] via-[#B45309] to-[#F59E0B] border-amber-400 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#EA580C] border-orange-400 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400',
    heroGlowMid: 'bg-gradient-to-r from-orange-500 via-amber-400 to-red-500',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#78350F] text-amber-100',
    couponBorder: 'border-amber-900/60',
    couponBtn: 'bg-[#78350F] hover:bg-[#5C2B0B] text-amber-100',
    progressBar: 'bg-gradient-to-r from-[#78350F] via-[#F59E0B] to-[#FBBF24]'
  },
  lavanda_lila: {
    name: 'Lavanda AromÃ¡tica & Amatista (Floral Saturado)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#A78BFA] via-[#8B5CF6] to-[#6D28D9] border-purple-800/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#C4B5FD] via-[#A78BFA] to-[#7C3AED] border-indigo-800/70 text-stone-950 font-semibold',
    glowMajor: 'bg-purple-600',
    glowMid: 'bg-violet-600',
    tabMajorActive: 'bg-[#4C1D95] text-white',
    tabMidActive: 'bg-[#5B21B6] text-white',
    badgeMajor: 'bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#A78BFA] border-purple-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#C4B5FD] border-indigo-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500',
    heroGlowMid: 'bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-400',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#4C1D95] text-white',
    couponBorder: 'border-purple-900/60',
    couponBtn: 'bg-[#4C1D95] hover:bg-[#3B1578] text-white',
    progressBar: 'bg-gradient-to-r from-[#4C1D95] via-[#8B5CF6] to-[#C4B5FD]'
  },
  durazno_coral: {
    name: 'Durazno Dulce & Coral Floral (Frutal CÃ¡lido)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#FB923C] via-[#EA580C] to-[#C2410C] border-orange-900/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#FDBA74] via-[#FB923C] to-[#EA580C] border-red-800/70 text-stone-950 font-semibold',
    glowMajor: 'bg-orange-600',
    glowMid: 'bg-red-500',
    tabMajorActive: 'bg-[#7C2D12] text-white',
    tabMidActive: 'bg-[#9A3412] text-white',
    badgeMajor: 'bg-gradient-to-r from-[#7C2D12] to-[#C2410C] text-white shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#9A3412] to-[#EA580C] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#FB923C] border-amber-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#9A3412] via-[#EA580C] to-[#FDBA74] border-orange-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400',
    heroGlowMid: 'bg-gradient-to-r from-red-500 via-orange-400 to-amber-300',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#7C2D12] text-white',
    couponBorder: 'border-orange-950/60',
    couponBtn: 'bg-[#7C2D12] hover:bg-[#60230E] text-white',
    progressBar: 'bg-gradient-to-r from-[#7C2D12] via-[#EA580C] to-[#FDBA74]'
  },
  menta_glaciar: {
    name: 'Menta Glaciar & Turquesa Fresco (AromÃ¡tico)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#2DD4BF] via-[#0D9488] to-[#115E59] border-teal-900/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#5EEAD4] via-[#14B8A6] to-[#0F766E] border-teal-800/70 text-stone-950 font-semibold',
    glowMajor: 'bg-teal-600',
    glowMid: 'bg-emerald-500',
    tabMajorActive: 'bg-[#042F2E] text-teal-200',
    tabMidActive: 'bg-[#115E59] text-white',
    badgeMajor: 'bg-gradient-to-r from-[#042F2E] to-[#115E59] text-teal-200 shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#115E59] to-[#0D9488] text-white shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#042F2E] via-[#0D9488] to-[#2DD4BF] border-teal-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#115E59] via-[#14B8A6] to-[#5EEAD4] border-emerald-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400',
    heroGlowMid: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#042F2E] text-teal-200',
    couponBorder: 'border-teal-950/60',
    couponBtn: 'bg-[#042F2E] hover:bg-[#02201F] text-teal-200',
    progressBar: 'bg-gradient-to-r from-[#042F2E] via-[#0D9488] to-[#5EEAD4]'
  },
  canela_caramelo: {
    name: 'Canela Tostada & Miel de Taller (CÃ¡lida Artesanal)',
    isLight: true,
    majorBg: 'bg-gradient-to-br from-[#C2824D] via-[#A66735] to-[#804820] border-amber-950/80 text-stone-950 font-semibold',
    midBg: 'bg-gradient-to-br from-[#D29461] via-[#B87742] to-[#915428] border-amber-900/70 text-stone-950 font-semibold',
    glowMajor: 'bg-amber-700',
    glowMid: 'bg-yellow-600',
    tabMajorActive: 'bg-[#3D1E0B] text-amber-200',
    tabMidActive: 'bg-[#542B10] text-amber-200',
    badgeMajor: 'bg-gradient-to-r from-[#3D1E0B] to-[#542B10] text-amber-200 shadow-xs',
    badgeMid: 'bg-gradient-to-r from-[#542B10] to-[#804820] text-amber-200 shadow-xs',
    heroSealMajor: 'bg-gradient-to-br from-[#3D1E0B] via-[#804820] to-[#C2824D] border-amber-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#542B10] via-[#915428] to-[#D29461] border-yellow-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500',
    heroGlowMid: 'bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-500',
    countdownText: 'text-stone-950 font-black',
    countdownSecs: 'bg-[#3D1E0B] text-amber-200',
    couponBorder: 'border-amber-950/60',
    couponBtn: 'bg-[#3D1E0B] hover:bg-[#271307] text-amber-200',
    progressBar: 'bg-gradient-to-r from-[#3D1E0B] via-[#A66735] to-[#D29461]'
  },

  // ==========================================
  // PALETAS PROFUNDAS & NOCTURNAS (Noche / Gala)
  // ==========================================
  clasico: {
    name: 'Taller Artesanal ClÃ¡sico (Verde Bosque & Oro)',
    majorBg: 'bg-gradient-to-br from-[#17251E] via-[#22382B] to-[#121A15] border-[#D4A359]/70 text-white',
    midBg: 'bg-gradient-to-br from-[#1B2C24] via-[#1E3A2F] to-[#16251E] border-emerald-400/60 text-white',
    glowMajor: 'bg-[#D4A359]',
    glowMid: 'bg-emerald-500',
    tabMajorActive: 'bg-[#D4A359] text-stone-950',
    tabMidActive: 'bg-emerald-400 text-stone-950',
    badgeMajor: 'bg-gradient-to-r from-[#D4A359] to-[#F5D061] text-stone-950',
    badgeMid: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-[#9E472A] via-[#B85D38] to-[#D4A359] border-amber-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#1F4E3B] via-[#2D6A50] to-[#10B981] border-emerald-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-[#D4A359] via-amber-400 to-[#9E472A]',
    heroGlowMid: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500',
    countdownText: 'text-amber-300',
    countdownSecs: 'bg-[#D4A359] text-stone-950',
    couponBorder: 'border-amber-400/60',
    couponBtn: 'bg-[#D4A359] hover:bg-[#c2924a] text-stone-950',
    progressBar: 'bg-gradient-to-r from-[#D4A359] via-amber-400 to-emerald-400'
  },
  navidad: {
    name: 'Navidad Festiva (Rojo & Pino)',
    majorBg: 'bg-gradient-to-br from-[#2B0E14] via-[#1F2C24] to-[#151D18] border-red-500/70 text-white',
    midBg: 'bg-gradient-to-br from-[#162A20] via-[#1B3629] to-[#2B1015] border-amber-400/70 text-white',
    glowMajor: 'bg-red-500',
    glowMid: 'bg-emerald-400',
    tabMajorActive: 'bg-red-500 text-white',
    tabMidActive: 'bg-emerald-500 text-white',
    badgeMajor: 'bg-gradient-to-r from-red-600 to-rose-500 text-white',
    badgeMid: 'bg-gradient-to-r from-emerald-500 to-green-400 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-red-800 via-red-600 to-amber-500 border-amber-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 border-amber-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400',
    heroGlowMid: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300',
    countdownText: 'text-amber-300',
    countdownSecs: 'bg-red-500 text-white',
    couponBorder: 'border-red-400/60',
    couponBtn: 'bg-red-500 hover:bg-red-600 text-white',
    progressBar: 'bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400'
  },
  otono: {
    name: 'OtoÃ±o & Cosecha (Naranja & Ãmbar)',
    majorBg: 'bg-gradient-to-br from-[#2D1608] via-[#241C16] to-[#181F1A] border-orange-500/70 text-white',
    midBg: 'bg-gradient-to-br from-[#241A10] via-[#2C2114] to-[#1A1D1A] border-amber-400/60 text-white',
    glowMajor: 'bg-orange-600',
    glowMid: 'bg-amber-500',
    tabMajorActive: 'bg-orange-500 text-stone-950',
    tabMidActive: 'bg-amber-400 text-stone-950',
    badgeMajor: 'bg-gradient-to-r from-orange-600 to-amber-500 text-stone-950',
    badgeMid: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#EA580C] border-amber-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#854D0E] via-[#CA8A04] to-[#EAB308] border-orange-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400',
    heroGlowMid: 'bg-gradient-to-r from-amber-500 via-orange-400 to-red-400',
    countdownText: 'text-amber-300',
    countdownSecs: 'bg-orange-500 text-stone-950',
    couponBorder: 'border-orange-400/60',
    couponBtn: 'bg-orange-500 hover:bg-orange-400 text-stone-950',
    progressBar: 'bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400'
  },
  sanvalentin: {
    name: 'San ValentÃ­n & Amor (RubÃ­ & Rosa)',
    majorBg: 'bg-gradient-to-br from-[#2D0F1B] via-[#221820] to-[#171E1A] border-rose-400/70 text-white',
    midBg: 'bg-gradient-to-br from-[#25101E] via-[#261622] to-[#181D1A] border-pink-400/60 text-white',
    glowMajor: 'bg-pink-600',
    glowMid: 'bg-rose-500',
    tabMajorActive: 'bg-rose-500 text-white',
    tabMidActive: 'bg-pink-400 text-stone-950',
    badgeMajor: 'bg-gradient-to-r from-rose-600 to-pink-500 text-white',
    badgeMid: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white',
    heroSealMajor: 'bg-gradient-to-br from-[#881337] via-[#BE123C] to-[#E11D48] border-pink-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#831843] via-[#DB2777] to-[#F43F5E] border-rose-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-rose-600 via-pink-500 to-red-400',
    heroGlowMid: 'bg-gradient-to-r from-pink-500 via-rose-400 to-purple-400',
    countdownText: 'text-pink-300',
    countdownSecs: 'bg-rose-500 text-white',
    couponBorder: 'border-rose-400/60',
    couponBtn: 'bg-rose-500 hover:bg-rose-400 text-white',
    progressBar: 'bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300'
  },
  primavera: {
    name: 'Primavera & BotÃ¡nica (Verde Selva)',
    majorBg: 'bg-gradient-to-br from-[#12281A] via-[#1A3825] to-[#141F18] border-emerald-400/70 text-white',
    midBg: 'bg-gradient-to-br from-[#163020] via-[#1F3D2A] to-[#132219] border-teal-400/60 text-white',
    glowMajor: 'bg-emerald-500',
    glowMid: 'bg-lime-400',
    tabMajorActive: 'bg-emerald-400 text-stone-950',
    tabMidActive: 'bg-lime-400 text-stone-950',
    badgeMajor: 'bg-gradient-to-r from-emerald-500 to-green-400 text-stone-950',
    badgeMid: 'bg-gradient-to-r from-teal-400 to-lime-400 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-[#064E3B] via-[#059669] to-[#10B981] border-emerald-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#84CC16] border-lime-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-400',
    heroGlowMid: 'bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400',
    countdownText: 'text-emerald-300',
    countdownSecs: 'bg-emerald-400 text-stone-950',
    couponBorder: 'border-emerald-400/60',
    couponBtn: 'bg-emerald-400 hover:bg-emerald-300 text-stone-950',
    progressBar: 'bg-gradient-to-r from-emerald-400 via-green-400 to-amber-300'
  },
  verano: {
    name: 'Verano CÃ¡lido & OcÃ©ano (Azul Profundo)',
    majorBg: 'bg-gradient-to-br from-[#0F2834] via-[#16384A] to-[#142322] border-cyan-400/70 text-white',
    midBg: 'bg-gradient-to-br from-[#10303E] via-[#164354] to-[#122728] border-amber-400/60 text-white',
    glowMajor: 'bg-cyan-500',
    glowMid: 'bg-amber-400',
    tabMajorActive: 'bg-cyan-400 text-stone-950',
    tabMidActive: 'bg-amber-400 text-stone-950',
    badgeMajor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-stone-950',
    badgeMid: 'bg-gradient-to-r from-amber-400 to-orange-400 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-[#0E7490] via-[#0284C7] to-[#2563EB] border-cyan-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#B45309] via-[#D97706] to-[#F59E0B] border-amber-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500',
    heroGlowMid: 'bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400',
    countdownText: 'text-cyan-300',
    countdownSecs: 'bg-cyan-400 text-stone-950',
    couponBorder: 'border-cyan-400/60',
    couponBtn: 'bg-cyan-400 hover:bg-cyan-300 text-stone-950',
    progressBar: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400'
  },
  buenfin: {
    name: 'Buen Fin & Black Friday (Dorado & Ã“nix)',
    majorBg: 'bg-gradient-to-br from-[#1A1412] via-[#221B16] to-[#121A15] border-amber-400/80 text-white',
    midBg: 'bg-gradient-to-br from-[#1C1717] via-[#241E1C] to-[#141C18] border-red-500/70 text-white',
    glowMajor: 'bg-amber-500',
    glowMid: 'bg-red-500',
    tabMajorActive: 'bg-amber-400 text-stone-950',
    tabMidActive: 'bg-red-500 text-white',
    badgeMajor: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950',
    badgeMid: 'bg-gradient-to-r from-red-600 to-rose-500 text-white',
    heroSealMajor: 'bg-gradient-to-br from-[#991B1B] via-[#DC2626] to-[#D97706] border-yellow-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#7F1D1D] via-[#B91C1C] to-[#DC2626] border-amber-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-red-500',
    heroGlowMid: 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400',
    countdownText: 'text-amber-300',
    countdownSecs: 'bg-amber-400 text-stone-950',
    couponBorder: 'border-amber-400/70',
    couponBtn: 'bg-amber-400 hover:bg-amber-300 text-stone-950',
    progressBar: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-red-500'
  },
  cyber_neon: {
    name: 'Cyber Taller & NeÃ³n Turquesa (Ciberpunk)',
    majorBg: 'bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0D1B2A] border-cyan-400/80 text-white',
    midBg: 'bg-gradient-to-br from-[#0D1F2D] via-[#1D2D44] to-[#0A1128] border-teal-400/70 text-white',
    glowMajor: 'bg-cyan-400',
    glowMid: 'bg-teal-400',
    tabMajorActive: 'bg-cyan-400 text-stone-950',
    tabMidActive: 'bg-teal-400 text-stone-950',
    badgeMajor: 'bg-gradient-to-r from-cyan-400 to-teal-400 text-stone-950 font-black',
    badgeMid: 'bg-gradient-to-r from-teal-400 to-emerald-400 text-stone-950 font-black',
    heroSealMajor: 'bg-gradient-to-br from-[#005F73] via-[#0A9396] to-[#94D2BD] border-cyan-300 text-stone-950',
    heroSealMid: 'bg-gradient-to-br from-[#0A9396] via-[#94D2BD] to-[#E9D8A6] border-teal-300 text-stone-950',
    heroGlowMajor: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400',
    heroGlowMid: 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400',
    countdownText: 'text-cyan-300 font-black',
    countdownSecs: 'bg-cyan-400 text-stone-950',
    couponBorder: 'border-cyan-400/70',
    couponBtn: 'bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-black',
    progressBar: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400'
  },
  retro_arcade: {
    name: 'Retro Arcade NeÃ³n (PÃºrpura & Fucsia 80s)',
    majorBg: 'bg-gradient-to-br from-[#1E0528] via-[#2F0743] to-[#12001F] border-fuchsia-500/80 text-white',
    midBg: 'bg-gradient-to-br from-[#270335] via-[#380E4F] to-[#1A002C] border-pink-500/70 text-white',
    glowMajor: 'bg-fuchsia-500',
    glowMid: 'bg-pink-500',
    tabMajorActive: 'bg-fuchsia-500 text-white font-black',
    tabMidActive: 'bg-pink-500 text-white font-black',
    badgeMajor: 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-black',
    badgeMid: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black',
    heroSealMajor: 'bg-gradient-to-br from-[#701A75] via-[#A21CAF] to-[#E879F9] border-fuchsia-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#831843] via-[#BE185D] to-[#F472B6] border-pink-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600',
    heroGlowMid: 'bg-gradient-to-r from-pink-500 via-fuchsia-400 to-indigo-500',
    countdownText: 'text-fuchsia-300 font-black',
    countdownSecs: 'bg-fuchsia-500 text-white',
    couponBorder: 'border-fuchsia-400/70',
    couponBtn: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black',
    progressBar: 'bg-gradient-to-r from-fuchsia-500 via-pink-400 to-yellow-400'
  },
  chocolate_cafe: {
    name: 'Espresso Tostado & Madera Nogal (CÃ¡lida Profunda)',
    majorBg: 'bg-gradient-to-br from-[#1F130E] via-[#2E1C15] to-[#150D0A] border-amber-600/70 text-white',
    midBg: 'bg-gradient-to-br from-[#251711] via-[#352119] to-[#1A100C] border-amber-700/60 text-white',
    glowMajor: 'bg-amber-600',
    glowMid: 'bg-orange-700',
    tabMajorActive: 'bg-amber-600 text-stone-950 font-black',
    tabMidActive: 'bg-[#D4A359] text-stone-950 font-black',
    badgeMajor: 'bg-gradient-to-r from-amber-600 to-orange-500 text-stone-950',
    badgeMid: 'bg-gradient-to-r from-[#D4A359] to-amber-400 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-[#451A03] via-[#78350F] to-[#D97706] border-amber-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#D4A359] border-orange-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-amber-600 via-[#D4A359] to-orange-500',
    heroGlowMid: 'bg-gradient-to-r from-[#D4A359] via-amber-500 to-yellow-400',
    countdownText: 'text-amber-300 font-black',
    countdownSecs: 'bg-amber-600 text-stone-950',
    couponBorder: 'border-amber-600/60',
    couponBtn: 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-black',
    progressBar: 'bg-gradient-to-r from-[#78350F] via-[#D4A359] to-amber-400'
  },
  medianoche_zafiro: {
    name: 'Zafiro Real & Medianoche GalÃ¡ctico (Azul Marino)',
    majorBg: 'bg-gradient-to-br from-[#061226] via-[#0E2044] to-[#040C1A] border-blue-400/80 text-white',
    midBg: 'bg-gradient-to-br from-[#0A1A36] via-[#142A58] to-[#071328] border-indigo-400/70 text-white',
    glowMajor: 'bg-blue-500',
    glowMid: 'bg-indigo-500',
    tabMajorActive: 'bg-blue-500 text-white font-black',
    tabMidActive: 'bg-indigo-400 text-stone-950 font-black',
    badgeMajor: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
    badgeMid: 'bg-gradient-to-r from-indigo-500 to-blue-400 text-white',
    heroSealMajor: 'bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#60A5FA] border-blue-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#312E81] via-[#4F46E5] to-[#818CF8] border-indigo-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500',
    heroGlowMid: 'bg-gradient-to-r from-indigo-500 via-blue-400 to-teal-400',
    countdownText: 'text-blue-300 font-black',
    countdownSecs: 'bg-blue-500 text-white',
    couponBorder: 'border-blue-400/70',
    couponBtn: 'bg-blue-500 hover:bg-blue-400 text-white font-black',
    progressBar: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400'
  },
  carbon_minimal: {
    name: 'Grafito TitÃ¡n & Cobre Industrial (Minimalista)',
    majorBg: 'bg-gradient-to-br from-[#121417] via-[#1E232A] to-[#0E1012] border-stone-400/60 text-white',
    midBg: 'bg-gradient-to-br from-[#181C22] via-[#242A33] to-[#121518] border-orange-400/60 text-white',
    glowMajor: 'bg-stone-400',
    glowMid: 'bg-orange-500',
    tabMajorActive: 'bg-stone-200 text-stone-950 font-black',
    tabMidActive: 'bg-orange-500 text-stone-950 font-black',
    badgeMajor: 'bg-gradient-to-r from-stone-400 to-stone-200 text-stone-950 font-black',
    badgeMid: 'bg-gradient-to-r from-orange-500 to-amber-400 text-stone-950 font-black',
    heroSealMajor: 'bg-gradient-to-br from-[#292524] via-[#44403C] to-[#A8A29E] border-stone-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#FB923C] border-orange-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-stone-400 via-stone-300 to-orange-400',
    heroGlowMid: 'bg-gradient-to-r from-orange-500 via-amber-400 to-stone-400',
    countdownText: 'text-stone-300 font-black',
    countdownSecs: 'bg-stone-200 text-stone-950',
    couponBorder: 'border-stone-400/60',
    couponBtn: 'bg-stone-200 hover:bg-white text-stone-950 font-black',
    progressBar: 'bg-gradient-to-r from-stone-400 via-orange-500 to-amber-400'
  },
  vino_borgona: {
    name: 'Vino Tinto BorgoÃ±a & Oro Real (Elegancia Nocturna)',
    majorBg: 'bg-gradient-to-br from-[#26050C] via-[#3D0A16] to-[#170207] border-rose-500/70 text-white',
    midBg: 'bg-gradient-to-br from-[#300812] via-[#4A0E1C] to-[#1F0309] border-amber-400/60 text-white',
    glowMajor: 'bg-rose-600',
    glowMid: 'bg-amber-500',
    tabMajorActive: 'bg-rose-600 text-white font-black',
    tabMidActive: 'bg-[#D4A359] text-stone-950 font-black',
    badgeMajor: 'bg-gradient-to-r from-rose-700 to-pink-600 text-white',
    badgeMid: 'bg-gradient-to-r from-[#D4A359] to-amber-300 text-stone-950',
    heroSealMajor: 'bg-gradient-to-br from-[#4C0519] via-[#881337] to-[#BE123C] border-rose-300 text-white',
    heroSealMid: 'bg-gradient-to-br from-[#78350F] via-[#B45309] to-[#F59E0B] border-amber-300 text-white',
    heroGlowMajor: 'bg-gradient-to-r from-rose-600 via-pink-500 to-amber-400',
    heroGlowMid: 'bg-gradient-to-r from-amber-400 via-[#D4A359] to-rose-500',
    countdownText: 'text-rose-300 font-black',
    countdownSecs: 'bg-rose-600 text-white',
    couponBorder: 'border-rose-400/60',
    couponBtn: 'bg-rose-600 hover:bg-rose-500 text-white font-black',
    progressBar: 'bg-gradient-to-r from-rose-700 via-pink-500 to-amber-400'
  }
};

/**
 * Resolver de tema segÃºn seasonalEffect o activeTheme
 */
function resolveEventThemeKey(activeTheme, seasonalEffect, eventsConfig) {
  if (activeTheme && EVENT_THEMES[activeTheme]) return activeTheme;
  if (eventsConfig?.theme && EVENT_THEMES[eventsConfig.theme]) return eventsConfig.theme;
  if (eventsConfig?.accentTheme && EVENT_THEMES[eventsConfig.accentTheme]) return eventsConfig.accentTheme;

  // DetecciÃ³n automÃ¡tica por efecto estacional
  if (seasonalEffect) {
    if (['snow', 'snow_blizzard', 'christmas_lights', 'santa_sleigh', 'pine_needles'].includes(seasonalEffect)) {
      return 'navidad';
    }
    if (['leaves', 'cempasuchil', 'ghosts', 'bats', 'halloween_pumpkins', 'sparkle_dust'].includes(seasonalEffect)) {
      return 'otono';
    }
    if (['hearts', 'roses', 'love_confetti', 'ribbons'].includes(seasonalEffect)) {
      return 'sanvalentin';
    }
    if (['sakura', 'cherry_blossoms', 'butterflies', 'fireflies', 'gentle_rain', 'spores'].includes(seasonalEffect)) {
      return 'primavera';
    }
    if (['sunbeams', 'bubbles', 'sand_dust', 'golden_sparkles'].includes(seasonalEffect)) {
      return 'verano';
    }
    if (['confetti', 'gold_coins', 'fireworks', 'stars'].includes(seasonalEffect)) {
      return 'buenfin';
    }
  }

  return 'clasico';
}

/**
 * Helper para formatear fechas de eventos de forma amigable en espaÃ±ol (ej. "15 de octubre")
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const day = parseInt(parts[2], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const month = months[monthIndex] || parts[1];
      return `${day} de ${month}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const DEFAULT_SEASONAL_SLIDES = [
  {
    id: 'hogar-estilo',
    image: './uploads/img_001.jpg',
    categoryTag: 'Hogar & Estilo',
    badge: 'Novedad de Temporada',
    title: 'ColecciÃ³n Hogar y Estilo',
    description: 'LÃ¡mpara moderna T38 Â· Maceta espiral T6 Â· Colgador Bienvenidos L14',
    worldId: 'hogar'
  },
  {
    id: 'branding-comercial',
    image: './uploads/pack_barberia_boutique_contexto.jpg',
    categoryTag: 'Negocios & Marcas',
    badge: 'Temporada Comercial',
    title: 'Branding Comercial & Mostrador',
    description: 'Soportes verticales QR Â· Enlaces NFC inteligentes Â· Letreros 3D',
    worldId: 'negocios'
  },
  {
    id: 'bodas-eventos',
    image: './uploads/bienvenida_ceremonia_boda.jpg',
    categoryTag: 'Bodas & Eventos',
    badge: 'EdiciÃ³n Especial Ceremonias',
    title: 'ColecciÃ³n Bodas & Celebraciones',
    description: 'Letreros de bienvenida Â· Copas grabadas Â· Recuerdos en madera',
    worldId: 'eventos'
  },
  {
    id: 'setup-gamer',
    image: './uploads/kit_home_office_gamer_contexto.jpg',
    categoryTag: 'Setup & Gaming',
    badge: 'Lanzamiento de Taller',
    title: 'Setup Gamer & Home Office',
    description: 'Smart Deck Â· Soporte para audÃ­fonos Â· Organizador modular 3D',
    worldId: 'hogar'
  },
  {
    id: 'linea-termica',
    image: './uploads/sublimacion_taza_tarro_contexto.jpg',
    categoryTag: 'SublimaciÃ³n & Textil',
    badge: 'Novedad TÃ©rmica',
    title: 'LÃ­nea TÃ©rmica & Personalizada',
    description: 'Tazas mÃ¡gicas de revelado tÃ©rmico Â· Tarros cerveceros Â· Termos lÃ¡ser',
    worldId: 'personalizados'
  }
];

/**
 * MonthlyEventBanner - Banner comercial interactivo de eventos mensuales
 * Estilo eventos de alta conversiÃ³n (Temu, Mercado Libre, AliExpress).
 * Incluye:
 * - Paletas temÃ¡ticas armonizadas con la tienda artesanal y la temporada activa
 * - Badge de Descuento Gigante de Alto Impacto ("el chiste es que luzca la promociÃ³n")
 * - Carrusel dinÃ¡mico para alternar entre Evento Grande, Quincena Flash y CarÃ¡tula de Novedades
 * - AtmÃ³sfera de partÃ­culas estacionales embebida
 * - Cuenta regresiva en vivo (Countdown)
 * - Barra de cuota / demanda apartada con urgencia
 * - Copiado de cupÃ³n en 1 clic
 */
export default function MonthlyEventBanner({
  eventsConfig = null,
  seasonalEffect = null,
  activeTheme = null,
  onExploreClick = null,
  onOpenWorld = null,
  showShowcaseTab = true,
  showcaseSlides = null,
  textColorMode = 'auto',
  initialTab = 'major',
  className = ''
}) {
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'major'); // 'major' | 'mid' | 'showcase'
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  const seasonalSlides = showcaseSlides || eventsConfig?.showcaseSlides || DEFAULT_SEASONAL_SLIDES;
  const effectiveTextColorMode = textColorMode !== 'auto' ? textColorMode : (eventsConfig?.textColorMode || 'auto');

  const major = eventsConfig?.majorEvent;
  const mid = eventsConfig?.midMonthEvent;
  const flash = eventsConfig?.flashSpecial;

  // Regla del usuario: el evento grande del mes o la quincena relÃ¡mpago: "o es uno o es otro".
  // Si baseEventMode es 'mid' o si major estÃ¡ inactivo y mid activo, el evento base es 'mid'.
  // De lo contrario, es 'major'.
  const isMidMode = eventsConfig?.baseEventMode === 'mid' || (major?.active === false && mid?.active !== false);
  const activeBaseKey = isMidMode ? 'mid' : 'major';
  const baseEvent = isMidMode ? mid : major;

  const hasMajor = Boolean(major && major.active !== false && !isMidMode);
  const hasMid = Boolean(mid && mid.active !== false && isMidMode);
  const hasBase = hasMajor || hasMid;
  const hasFlash = Boolean(flash && flash.active === true);

  // Lista ordenada de pestaÃ±as activas (mÃ¡ximo 1 base + 1 flash si estÃ¡ encendido + 1 showcase si estÃ¡ activo)
  const availableTabs = useMemo(() => {
    const list = [];
    if (hasBase) list.push(activeBaseKey);
    if (hasFlash) list.push('flash');
    if (showShowcaseTab) list.push('showcase');
    return list.length > 0 ? list : ['major'];
  }, [hasBase, activeBaseKey, hasFlash, showShowcaseTab]);

  // Si la pestaÃ±a activa actual deja de estar disponible (ej. al apagar flash), ajustar automÃ¡ticamente
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'major');
    }
  }, [availableTabs, activeTab]);

  // Evento actualmente seleccionado para la lÃ³gica de cupones, descuentos y fechas
  const currentEvent = activeTab === 'flash' && hasFlash
    ? flash
    : (activeTab === 'mid' && hasMid ? mid : (major || baseEvent || mid));

  // Obtener la paleta temÃ¡tica resuelta
  const themeKey = resolveEventThemeKey(activeTheme, seasonalEffect, eventsConfig);
  const theme = EVENT_THEMES[themeKey] || EVENT_THEMES.clasico;

  // RotaciÃ³n tipo carrusel suave si hay mÃ¡s de 1 pestaÃ±a y no hay interacciÃ³n del mouse
  useEffect(() => {
    if (availableTabs.length <= 1 || isHovered || isSlidePaused) return;
    const timer = setInterval(() => {
      setActiveTab(prev => {
        const idx = availableTabs.indexOf(prev);
        return availableTabs[(idx + 1) % availableTabs.length];
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [availableTabs, isHovered, isSlidePaused]);

  // RotaciÃ³n automÃ¡tica de imÃ¡genes dentro de la carÃ¡tula si la pestaÃ±a showcase estÃ¡ activa
  useEffect(() => {
    if (activeTab !== 'showcase' || isSlidePaused || seasonalSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % seasonalSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeTab, isSlidePaused, seasonalSlides.length]);

  // Helper para verificar el estado temporal de cualquier evento (upcoming, live o ended)
  const getEventTiming = (evt) => {
    if (!evt || evt.active === false) return { status: 'none', isUpcoming: false, isLive: false, isEnded: false, days: 0 };
    const now = new Date();

    if (evt.startDate) {
      const start = new Date(`${evt.startDate}T00:00:00`);
      if (now.getTime() < start.getTime()) {
        const diff = start.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return {
          status: 'upcoming',
          isUpcoming: true,
          isLive: false,
          isEnded: false,
          days,
          targetDate: start,
          formattedStartDate: formatFriendlyDate(evt.startDate)
        };
      }
    }

    if (evt.endDate) {
      const end = new Date(`${evt.endDate}T23:59:59`);
      if (now.getTime() > end.getTime()) {
        return {
          status: 'ended',
          isUpcoming: false,
          isLive: false,
          isEnded: true,
          days: 0,
          targetDate: end,
          formattedEndDate: formatFriendlyDate(evt.endDate)
        };
      }
      return {
        status: 'live',
        isUpcoming: false,
        isLive: true,
        isEnded: false,
        days: 0,
        targetDate: end,
        formattedEndDate: formatFriendlyDate(evt.endDate)
      };
    }

    return {
      status: 'live',
      isUpcoming: false,
      isLive: true,
      isEnded: false,
      days: 0,
      targetDate: null
    };
  };

  const majorTiming = getEventTiming(major);
  const midTiming = getEventTiming(mid);
  const flashTiming = getEventTiming(flash);
  const currentTiming = getEventTiming(currentEvent);

  // CÃ¡lculo de cuenta regresiva dinÃ¡mica en vivo (hacia startDate si es upcoming, o endDate si es live)
  useEffect(() => {
    if (!currentEvent) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      let targetDate;

      // Si el evento aÃºn no inicia (fecha futura), la cuenta regresiva apunta al inicio (00:00:00)
      if (currentEvent.startDate) {
        const start = new Date(`${currentEvent.startDate}T00:00:00`);
        if (now.getTime() < start.getTime()) {
          targetDate = start;
        }
      }

      // Si ya iniciÃ³ o no tiene startDate, la cuenta regresiva apunta a la fecha de fin (23:59:59)
      if (!targetDate) {
        if (currentEvent.endDate) {
          targetDate = new Date(`${currentEvent.endDate}T23:59:59`);
        } else {
          // Fallback: fin de la semana en curso
          targetDate = new Date();
          targetDate.setHours(23, 59, 59, 999);
          targetDate.setDate(targetDate.getDate() + 2);
        }
      }

      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [Boolean(currentEvent), currentEvent?.startDate, currentEvent?.endDate, currentEvent?.id]);

  const handleCopyCoupon = (code) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 3000);
    } catch (e) {
      console.warn('No se pudo copiar automÃ¡ticamente:', e);
      setCopiedCoupon(code);
    }
  };

  // Formateo del nÃºmero de descuento para el badge hero gigante
  const discountInfo = useMemo(() => {
    const raw = (currentEvent?.discountText || '15% OFF').trim();
    const match = raw.match(/(\d+%\s*OFF|\d+%|\d+)/i);
    let number = '15%';
    let suffix = 'OFF';

    if (match) {
      number = match[0].replace(/off/i, '').trim();
      if (!number.includes('%')) number += '%';
      suffix = raw.toUpperCase().includes('OFF') ? 'OFF' : 'DESCUENTO';
    } else {
      number = raw;
      suffix = 'PROMO';
    }

    return { number, suffix, full: raw };
  }, [currentEvent?.discountText]);

  // Mantener todos los hooks activos mientras llega la configuraciÃ³n.
  if (!currentEvent) return null;

  const isFlashTab = activeTab === 'flash';
  const isMidTab = activeTab === 'mid';
  const isMajorTab = activeTab === 'major' || activeTab === 'showcase';

  const bannerBgClass = isFlashTab
    ? 'bg-gradient-to-br from-[#2D0D02] via-[#210901] to-[#140501] border-amber-400/90 text-white'
    : (isMidTab ? theme.midBg : theme.majorBg);

  const bannerGlow1 = isFlashTab ? 'bg-orange-500' : (isMidTab ? theme.glowMid : theme.glowMajor);
  const bannerGlow2 = isFlashTab ? 'bg-amber-400' : (isMajorTab ? 'bg-[#9E472A]' : theme.glowMajor);

  const progressPercent = Math.min(Math.max(Number(currentEvent?.progressPercent) || 78, 15), 98);

  const toggleEvent = () => {
    if (availableTabs.length <= 1) return;
    setActiveTab(prev => {
      const idx = availableTabs.indexOf(prev);
      return availableTabs[(idx + 1) % availableTabs.length];
    });
  };

  const prevTab = () => {
    if (availableTabs.length <= 1) return;
    setActiveTab(prev => {
      const idx = availableTabs.indexOf(prev);
      return availableTabs[(idx - 1 + availableTabs.length) % availableTabs.length];
    });
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? seasonalSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % seasonalSlides.length);
  };

  const effectiveBannerImage = eventsConfig?.bannerImage || currentEvent?.bannerImage || major?.bannerImage || mid?.bannerImage;

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl border-2 transition-all shadow-xl group/banner min-h-[460px] sm:min-h-[480px] lg:min-h-[500px] flex flex-col justify-between ${bannerBgClass} ${className}`}
    >
      {/* Fondo fotogrÃ¡fico de temporada suave y armonizado con la paleta */}
      {effectiveBannerImage && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img loading="lazy"
            src={effectiveBannerImage}
            alt=""
            className={`w-full h-full object-cover mix-blend-overlay ${theme.isLight ? 'opacity-20' : 'opacity-30'}`}
          />
          <div className={`absolute inset-0 ${theme.isLight ? 'bg-gradient-to-t from-white/75 via-transparent to-white/40' : 'bg-gradient-to-t from-black/75 via-black/25 to-black/45'}`} />
        </div>
      )}

      {/* AtmÃ³sfera de temporada flotando sobre el banner */}
      {seasonalEffect && seasonalEffect !== 'none' && (
        <SeasonalAtmosphere
          effect={seasonalEffect}
          showToggle={false}
          className="opacity-70"
        />
      )}

      {/* Brillo ambiental de fondo armonizado */}
      <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 ${bannerGlow1}`} />
      <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-25 ${bannerGlow2}`} />

      {/* PestaÃ±as de selector y controles de carrusel (RotaciÃ³n automÃ¡tica & PestaÃ±as de Inicio) */}
      {availableTabs.length > 1 && (
        <div className={`flex items-center justify-between backdrop-blur-md px-4 sm:px-6 pt-2.5 pb-0 gap-2 ${
          theme.isLight ? 'border-b border-black/10 bg-black/[0.04]' : 'border-b border-white/10 bg-black/30'
        }`}>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {/* 1. PestaÃ±a de Evento Base (O Gran Bazar O Quincena, nunca ambos) */}
            {hasMajor && (
              <button
                type="button"
                onClick={() => setActiveTab('major')}
                className={`px-3.5 py-1.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'major'
                    ? `${theme.tabMajorActive} shadow-md scale-102`
                    : (theme.isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-black/[0.06]' : 'text-gray-300 hover:text-white hover:bg-white/10')
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{major.title ? major.title.slice(0, 24) + '...' : 'Evento Grande del Mes'}</span>
                <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded-md font-black ${
                  majorTiming.isUpcoming ? 'bg-amber-400 text-stone-950' : 'bg-stone-950/20'
                }`}>
                  {majorTiming.isUpcoming
                    ? (majorTiming.days > 0 ? `Inicia en ${majorTiming.days}d` : 'Inicia hoy')
                    : (major.discountText || '15% OFF')}
                </span>
              </button>
            )}

            {hasMid && (
              <button
                type="button"
                onClick={() => setActiveTab('mid')}
                className={`px-3.5 py-1.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'mid'
                    ? `${theme.tabMidActive} shadow-md scale-102`
                    : (theme.isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-black/[0.06]' : 'text-gray-300 hover:text-white hover:bg-white/10')
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{mid.title ? mid.title.slice(0, 24) + '...' : 'Quincena RelÃ¡mpago'}</span>
                <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded-md font-black ${
                  midTiming.isUpcoming ? 'bg-amber-400 text-stone-950' : 'bg-stone-950/20'
                }`}>
                  {midTiming.isUpcoming
                    ? (midTiming.days > 0 ? `Inicia en ${midTiming.days}d` : 'Inicia hoy')
                    : (mid.discountText || '10% OFF')}
                </span>
              </button>
            )}

            {/* 2. PestaÃ±a de Especial Oferta RelÃ¡mpago de Fin de Semana & LiquidaciÃ³n */}
            {hasFlash && (
              <button
                type="button"
                onClick={() => setActiveTab('flash')}
                className={`px-3.5 py-1.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'flash'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-stone-950 shadow-md scale-102 ring-1 ring-amber-300'
                    : (theme.isLight ? 'text-amber-900 hover:text-amber-950 hover:bg-amber-400/20' : 'text-amber-300 hover:text-white hover:bg-amber-500/20')
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{flash.title ? flash.title.slice(0, 24) + '...' : 'Oferta RelÃ¡mpago Finde'}</span>
                <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded-md font-black ${
                  flashTiming.isUpcoming ? 'bg-amber-400 text-stone-950' : 'bg-red-600 text-white animate-pulse'
                }`}>
                  {flashTiming.isUpcoming
                    ? (flashTiming.days > 0 ? `Faltan ${flashTiming.days}d` : 'Inicia hoy')
                    : (flash.discountText || '15% OFF')}
                </span>
              </button>
            )}

            {/* 3. PestaÃ±a de Novedades & CarÃ¡tula */}
            {showShowcaseTab && (
              <button
                type="button"
                onClick={() => setActiveTab('showcase')}
                className={`px-3.5 py-1.5 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'showcase'
                    ? 'bg-[#D4A359] text-stone-950 shadow-md scale-102'
                    : (theme.isLight ? 'text-stone-700 hover:text-stone-950 hover:bg-black/[0.06]' : 'text-gray-300 hover:text-white hover:bg-white/10')
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Novedades & CarÃ¡tula</span>
                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded-md font-black bg-stone-950/20 text-stone-950">
                  {seasonalSlides.length} Fotos
                </span>
              </button>
            )}
          </div>

          {/* Flechitas para rotar entre pestaÃ±as tipo carrusel */}
          <div className="flex items-center gap-1 pb-1 shrink-0">
            <button
              type="button"
              onClick={prevTab}
              title="PestaÃ±a anterior"
              className={`p-1 rounded-lg text-xs transition-all cursor-pointer ${
                theme.isLight ? 'bg-black/5 hover:bg-black/10 text-stone-800' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleEvent}
              title="Siguiente pestaÃ±a"
              className={`p-1 rounded-lg text-xs transition-all cursor-pointer ${
                theme.isLight ? 'bg-black/5 hover:bg-black/10 text-stone-800' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO SEGÃšN LA PESTAÃ‘A ACTIVA: CARÃTULA O EVENTO (MISMO TAMAÃ‘O UNIFORME) */}
      {activeTab === 'showcase' ? (
        <div className="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 relative z-10 flex-1 flex flex-col justify-between min-h-[420px] sm:min-h-[440px]">
          
          {/* Fila Superior: Badges e Identificador */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-[#D4A359] to-[#F5D061] text-stone-950 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                <span>ColecciÃ³n Oficial &amp; GalerÃ­a de Taller</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 font-bold text-xs border border-white/15">
                {seasonalSlides[currentSlide]?.badge || 'Novedad de Temporada'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono font-bold text-white/90 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full shadow-2xs">
                {currentSlide + 1} / {seasonalSlides.length}
              </div>
            </div>
          </div>

          {/* Cuerpo Central de la CarÃ¡tula */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Foto de la CarÃ¡tula con Crossfade y Controles */}
            <div className="lg:col-span-7 relative">
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-[#121A15] group/slide select-none h-[280px] sm:h-[340px]"
                onMouseEnter={() => setIsSlidePaused(true)}
                onMouseLeave={() => setIsSlidePaused(false)}
              >
                <div className="absolute inset-0 overflow-hidden">
                  {seasonalSlides.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        <img loading="lazy"
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover object-center transform group-hover/slide:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-20 p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>{seasonalSlides[currentSlide]?.badge}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#17251E] text-[11px] font-black shadow-md border border-white/60">
                    {seasonalSlides[currentSlide]?.categoryTag}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-all shadow-md active:scale-95 cursor-pointer border border-white/20"
                  aria-label="Diapositiva anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-all shadow-md active:scale-95 cursor-pointer border border-white/20"
                  aria-label="Siguiente diapositiva"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-center gap-2">
                  {seasonalSlides.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${
                          isActive ? 'w-8 bg-[#D4A359] shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detalles de la ColecciÃ³n */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1.5">
                <span className={`text-[11px] font-black uppercase tracking-widest ${
                  theme.isLight ? 'text-[#855E42]' : 'text-[#D4A359]'
                }`}>
                  âœ¦ Destacado de Temporada
                </span>
                <h3 className={`text-2xl sm:text-3xl font-black font-heading leading-tight ${
                  effectiveTextColorMode === 'black' ? 'text-[#1F2421]' : effectiveTextColorMode === 'white' ? 'text-white' : (theme.isLight ? 'text-[#1F2421]' : 'text-white')
                }`}>
                  {seasonalSlides[currentSlide]?.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  effectiveTextColorMode === 'black' ? 'text-stone-900 font-semibold' : effectiveTextColorMode === 'white' ? 'text-gray-100 font-normal' : (theme.isLight ? 'text-stone-800 font-medium' : 'text-gray-200 font-normal')
                }`}>
                  {seasonalSlides[currentSlide]?.description}
                </p>
              </div>

              {/* Selector RÃ¡pido de las 5 Colecciones */}
              <div className="space-y-1.5 pt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  theme.isLight ? 'text-stone-800' : 'text-stone-300'
                }`}>
                  Explorar colecciones de taller:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {seasonalSlides.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all text-left truncate cursor-pointer ${
                          isActive
                            ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300/60 shadow-sm'
                            : (theme.isLight
                                ? 'bg-black/5 text-stone-800 hover:bg-black/10 hover:text-stone-950 font-semibold'
                                : 'bg-white/10 text-gray-200 hover:bg-white/20 hover:text-white')
                        }`}
                      >
                        {slide.title.replace('ColecciÃ³n ', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones de AcciÃ³n */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenWorld && onOpenWorld(seasonalSlides[currentSlide]?.worldId)}
                  className="px-6 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#c28e38] text-stone-950 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Ver esta colecciÃ³n</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onExploreClick && (
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className={`px-4 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      theme.isLight
                        ? 'bg-black/5 hover:bg-black/10 text-stone-900 border border-black/15'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <span>Explorar catÃ¡logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fila Inferior: Beneficios */}
          <div className={`pt-2.5 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] ${
            theme.isLight ? 'border-t border-black/10 text-stone-800 font-medium' : 'border-t border-white/10 text-gray-200'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸšš</span> EnvÃ­o prioritario a todo MÃ©xico
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸª™</span> 2X Monedas para el Arcade
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸŽ</span> Grabado lÃ¡ser de nombres sin costo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸ›¡ï¸</span> GarantÃ­a artesanal de satisfacciÃ³n
            </span>
          </div>

        </div>
      ) : (
        /* Contenido Principal del Evento (Mismo tamaÃ±o uniforme) */
        <div className="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 relative z-10 flex-1 flex flex-col justify-between min-h-[420px] sm:min-h-[440px]">
        
        {/* Fila Superior: Badges & Estado en Vivo/PrÃ³ximamente & Countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
              isFlashTab
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-stone-950 shadow-md ring-1 ring-amber-300'
                : (isMajorTab ? theme.badgeMajor : theme.badgeMid)
            }`}>
              {isFlashTab ? <Zap className="w-3.5 h-3.5 fill-current text-stone-950" /> : (isMajorTab ? <Flame className="w-3.5 h-3.5 fill-current" /> : <Zap className="w-3.5 h-3.5 fill-current" />)}
              <span>{currentEvent.badge || (isFlashTab ? 'âš¡ OFERTA RELÃMPAGO DE FIN DE SEMANA' : (isMajorTab ? 'ðŸ”¥ EVENTO GRANDE DEL MES' : 'âš¡ QUINCENA ARTESANAL FLASH'))}</span>
            </span>

            {currentTiming.isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[11px] font-black animate-pulse shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>PRÃ“XIMAMENTE</span>
                <span className="px-1.5 py-0.2 rounded-md bg-stone-950/40 text-amber-200 text-[10px] font-black">
                  {timeLeft.days > 0 ? `Faltan ${timeLeft.days} ${timeLeft.days === 1 ? 'dÃ­a' : 'dÃ­as'}` : 'Inicia hoy'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                <span>EN VIVO AHORA</span>
              </span>
            )}
          </div>

          {/* Temporizador Digital Countdown */}
          <div className={`flex items-center gap-2 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border ${
            theme.isLight ? 'bg-black/5 border-black/10' : 'bg-black/40 border-white/15'
          }`}>
            <Clock className={`w-4 h-4 shrink-0 ${theme.isLight ? 'text-amber-800' : 'text-amber-400'}`} />
            <span className={`text-[11px] font-bold hidden sm:inline ${
              theme.isLight ? 'text-stone-800' : 'text-gray-200'
            }`}>
              {currentTiming.isUpcoming ? 'Inicia en:' : 'Termina en:'}
            </span>
            <div className={`flex items-center gap-1 font-mono text-xs font-black ${theme.countdownText}`}>
              <span className={`px-1.5 py-0.5 rounded-md min-w-[24px] text-center ${
                theme.isLight ? 'bg-black/5 text-stone-900' : 'bg-white/10'
              }`}>
                {String(timeLeft.days).padStart(2, '0')}d
              </span>
              <span>:</span>
              <span className={`px-1.5 py-0.5 rounded-md min-w-[24px] text-center ${
                theme.isLight ? 'bg-black/5 text-stone-900' : 'bg-white/10'
              }`}>
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className={`px-1.5 py-0.5 rounded-md min-w-[24px] text-center ${
                theme.isLight ? 'bg-black/5 text-stone-900' : 'bg-white/10'
              }`}>
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className={`${theme.countdownSecs} px-1.5 py-0.5 rounded-md min-w-[24px] text-center animate-pulse`}>
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* Banner Destacado de PrÃ³ximamente (Visible cuando startDate es en fecha futura) */}
        {currentTiming.isUpcoming && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-orange-500/20 border-2 border-amber-300/80 p-3.5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center font-black text-base shrink-0 shadow-md">
                â³
              </div>
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wide flex flex-wrap items-center gap-1.5 font-heading">
                  <span>Â¡Evento PrÃ³ximamente!</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-black shadow-xs">
                    {timeLeft.days > 0
                      ? `Faltan ${timeLeft.days} ${timeLeft.days === 1 ? 'dÃ­a' : 'dÃ­as'} para que inicie`
                      : 'Â¡Inicia hoy a la medianoche!'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-100 leading-snug">
                  Apertura programada para el <strong>{currentTiming.formattedStartDate || currentEvent.startDate}</strong>. Puedes ir explorando y preparando tus productos favoritos en el carrito.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-950 bg-amber-300 px-2.5 py-1 rounded-lg shadow-sm">
                Estreno
              </span>
            </div>
          </div>
        )}

        {/* Fila Central: Sello Gigante de Descuento + TÃ­tulo + CupÃ³n */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          
          {/* LADO IZQUIERDO / CENTRO: HERO BADGE GIGANTE DEL DESCUENTO Y TEXTOS */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            
            {/* BADGE GIGANTE DE DESCUENTO (Llamativo, Bold, Estilo Temu / Mercado Libre) */}
            <div className="relative group/seal shrink-0 self-center sm:self-auto">
              {/* Resplandor pulsante detrÃ¡s del badge */}
              <div className={`absolute -inset-1.5 rounded-3xl blur-md opacity-75 animate-pulse transition-all ${
                isFlashTab
                  ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400'
                  : (isMajorTab ? theme.heroGlowMajor : theme.heroGlowMid)
              }`} />
              
              {/* Placa Hero del Descuento */}
              <div className={`relative px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl border-2 shadow-2xl flex flex-col items-center justify-center text-center transform group-hover/seal:scale-105 transition-transform ${
                isFlashTab
                  ? 'bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#F59E0B] border-amber-300 text-white'
                  : (isMajorTab ? theme.heroSealMajor : theme.heroSealMid)
              }`}>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-yellow-200 drop-shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  <span>{currentTiming.isUpcoming ? 'ESTRENO' : 'AHORRO'}</span>
                </span>
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tighter leading-none text-yellow-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] my-0.5">
                  {discountInfo.number}
                </span>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full text-white border border-white/20">
                  {currentTiming.isUpcoming ? 'PRÃ“XIMO' : discountInfo.suffix}
                </span>
              </div>
            </div>

            {/* Textos del Evento */}
            <div className="space-y-2 flex-1">
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-black font-heading tracking-tight leading-tight ${effectiveTextColorMode === 'black' ? 'text-[#1F2421]' : effectiveTextColorMode === 'white' ? 'text-white' : (theme.isLight ? 'text-[#1F2421]' : 'text-white')}`}>
                {currentEvent.title || 'Gran Venta Especial de Taller'}
              </h2>

              <p className={`text-xs sm:text-sm leading-relaxed font-normal ${effectiveTextColorMode === 'black' ? 'text-stone-900 font-semibold' : effectiveTextColorMode === 'white' ? 'text-gray-100' : (theme.isLight ? 'text-stone-700 font-medium' : 'text-gray-200')}`}>
                {currentEvent.subtitle || 'Aprovecha beneficios exclusivos en paquetes y combos del taller con envoltura de regalo de cortesÃ­a y grabado lÃ¡ser personalizado.'}
              </p>

              {/* Beneficio destacado en cÃ¡psula */}
              {currentEvent.benefitText && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold ${theme.isLight ? 'bg-black/5 border border-black/10 text-[#2D4F3E]' : 'bg-white/10 border border-white/15 text-amber-200'}`}>
                  <Sparkles className={`w-3.5 h-3.5 ${theme.isLight ? 'text-[#9E472A]' : 'text-amber-300'} shrink-0`} />
                  <span>{currentEvent.benefitText}</span>
                </div>
              )}
            </div>
          </div>

          {/* LADO DERECHO: CUPÃ“N DE 1 CLIC */}
          <div className="lg:col-span-4 flex flex-col items-stretch sm:items-end justify-center gap-2.5">
            {currentEvent.couponCode ? (
              <div className={`${theme.isLight ? 'bg-black/15 shadow-md border-black/25' : 'bg-white/10'} backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border-2 border-dashed ${theme.couponBorder} w-full sm:max-w-xs space-y-2`}>
                <div className={`flex items-center justify-between text-[11px] ${theme.isLight ? 'text-stone-900 font-bold' : 'text-gray-200'}`}>
                  <span className="flex items-center gap-1 font-bold">
                    <Tag className={`w-3 h-3 ${theme.isLight ? 'text-[#9E472A]' : 'text-amber-400'}`} />{' '}
                    {currentTiming.isUpcoming ? 'CupÃ³n Preventa' : 'CupÃ³n del Evento'}
                  </span>
                  <span className={`${theme.isLight ? 'text-[#9E472A]' : 'text-amber-300'} font-black text-xs`}>{discountInfo.full}</span>
                </div>

                <div className={`flex items-center justify-between gap-2 p-2 rounded-xl border ${theme.isLight ? 'bg-black/20 border-black/30 shadow-2xs' : 'bg-black/40 border-white/10'}`}>
                  <span className={`font-mono font-black text-sm sm:text-base tracking-wider ${theme.isLight ? 'text-stone-950 font-black' : 'text-amber-300'}`}>
                    {currentEvent.couponCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(currentEvent.couponCode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      copiedCoupon === currentEvent.couponCode
                        ? 'bg-emerald-500 text-white'
                        : theme.couponBtn
                    }`}
                  >
                    {copiedCoupon === currentEvent.couponCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Â¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{currentTiming.isUpcoming ? 'Guardar' : 'Copiar'}</span>
                      </>
                    )}
                  </button>
                </div>
                {copiedCoupon === currentEvent.couponCode && (
                  <p className="text-[10px] text-emerald-300 text-center font-bold animate-fade-in">
                    {currentTiming.isUpcoming
                      ? `âœ“ CÃ³digo listo en portapapeles. VÃ¡lido a partir del ${currentTiming.formattedStartDate || currentEvent.startDate}.`
                      : 'âœ“ CÃ³digo listo en portapapeles. AplÃ­calo al tramitar tu pedido.'}
                  </p>
                )}
                {currentTiming.isUpcoming && copiedCoupon !== currentEvent.couponCode && (
                  <p className="text-[10px] text-amber-200/90 text-center font-medium">
                    ðŸ“… VÃ¡lido a partir del {currentTiming.formattedStartDate || currentEvent.startDate}
                  </p>
                )}
              </div>
            ) : null}

            {onExploreClick && (
              <button
                type="button"
                onClick={onExploreClick}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  theme.isLight
                    ? 'bg-black/5 hover:bg-black/10 text-stone-900 border border-black/15'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                }`}
              >
                <span>{currentTiming.isUpcoming ? 'Ver Paquetes en Preventa' : 'Ver Paquetes Participantes'}</span>
                <ArrowDown className={`w-3.5 h-3.5 ${theme.isLight ? 'text-amber-800' : 'text-amber-300'}`} />
              </button>
            )}
          </div>
        </div>

        {/* Fila Inferior: Barra de Urgencia & Demanda estilo Temu/AliExpress */}
        <div className={`pt-2.5 space-y-2.5 ${
          theme.isLight ? 'border-t border-black/10' : 'border-t border-white/10'
        }`}>
          {/* Barra de progreso de demanda */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium flex items-center gap-1.5 ${
                theme.isLight ? 'text-stone-800' : 'text-gray-200'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${theme.isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                <span>
                  {currentTiming.isUpcoming ? 'Lista de espera y pre-registro: ' : 'Demanda del evento: '}
                  <strong>{progressPercent}% de cupos apartados</strong>
                </span>
              </span>
              <span className={`text-[11px] font-black uppercase ${
                theme.isLight ? 'text-amber-900' : 'text-amber-300'
              }`}>
                {currentTiming.isUpcoming
                  ? 'Â¡Aparta tu lugar!'
                  : (progressPercent > 80 ? 'Â¡Pocos lugares disponibles!' : 'Cupos disponibles')}
              </span>
            </div>

            {/* Track de la barra */}
            <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 border ${
              theme.isLight ? 'bg-black/10 border-black/10' : 'bg-black/40 border-white/15'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${theme.progressBar}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Pastillas de Beneficios */}
          <div className={`flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] ${
            theme.isLight ? 'text-stone-800 font-medium' : 'text-gray-200'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸšš</span> EnvÃ­o prioritario a todo MÃ©xico
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸª™</span> 2X Monedas para el Arcade
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸŽ</span> Grabado lÃ¡ser de nombres sin costo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-500">ðŸ›¡ï¸</span> GarantÃ­a artesanal de satisfacciÃ³n
            </span>
          </div>
        </div>

      </div>
      )}
    </section>
  );
}

