// Web Audio API Sound Utility (0 dependencias externas, 100% offline, limpio y reactivo)
let globalAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!globalAudioCtx) {
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

/**
 * Sonido de moneda estilo retro Mario (B5 -> E6)
 * Generado mediante sintetizador de ondas senoidales puro de Web Audio.
 */
export function playCoinSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Nota 1: Si5 (987.77 Hz) durante ~80ms, Nota 2: Mi6 (1318.51 Hz) decayendo
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    // Si el navegador bloquea audio antes de interacción directa, capturar silenciosamente
    console.warn('AudioContext playCoinSound info:', err);
  }
}

/**
 * Sonido suave y elegante para cambio de área (Hogar, Negocios, Eventos)
 * Genera un tono sutil y melodioso (F4 -> C5) con volumen tenue y envolvente delicada.
 */
export function playSoftAreaSwitchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Nota sutil suave: Fa4 (349.23 Hz) que asciende suavemente a Do5 (523.25 Hz)
    osc.frequency.setValueAtTime(349.23, now);
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.08);

    // Volumen suave (0.07) y envolvente delicada para feedback elegante
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  } catch (err) {
    console.warn('AudioContext playSoftAreaSwitchSound info:', err);
  }
}

/**
 * Sonido icónico de Vida Extra (1-Up) de Mario Bros
 * Notas clásicas: Mi6, Sol6, Mi7, Do7, Re7, Sol7
 */
export function playMario1UpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 1318.51, dur: 0.085 }, // E6
      { freq: 1567.98, dur: 0.085 }, // G6
      { freq: 2637.02, dur: 0.085 }, // E7
      { freq: 2093.00, dur: 0.085 }, // C7
      { freq: 2349.32, dur: 0.085 }, // D7
      { freq: 3135.96, dur: 0.22  }  // G7
    ];

    let startTime = ctx.currentTime + 0.01;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.dur);

      startTime += note.dur;
    });
  } catch (err) {
    console.warn('AudioContext playMario1UpSound info:', err);
  }
}

/**
 * Sonido icónico de Hongo / Crecer (Power-Up / Super Mushroom) de Mario Bros
 * Progresión rápida ascendente característica
 */
export function playMarioPowerUpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 329.63, dur: 0.045 }, // E4
      { freq: 392.00, dur: 0.045 }, // G4
      { freq: 659.25, dur: 0.045 }, // E5
      { freq: 523.25, dur: 0.045 }, // C5
      { freq: 587.33, dur: 0.045 }, // D5
      { freq: 783.99, dur: 0.045 }, // G5
      { freq: 659.25, dur: 0.045 }, // E5
      { freq: 783.99, dur: 0.045 }, // G5
      { freq: 1046.50, dur: 0.05 }, // C6
      { freq: 1174.66, dur: 0.05 }, // D6
      { freq: 1318.51, dur: 0.18 }  // E6
    ];

    let startTime = ctx.currentTime + 0.01;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.20, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.dur);

      startTime += note.dur;
    });
  } catch (err) {
    console.warn('AudioContext playMarioPowerUpSound info:', err);
  }
}

/**
 * Alterna aleatoriamente entre Vida Extra (1-Up) y Hacerse Grande (Power-Up)
 * para la confirmación final de pedido
 */
export function playRandomOrderCelebrationSound() {
  if (Math.random() >= 0.5) {
    playMario1UpSound();
  } else {
    playMarioPowerUpSound();
  }
}

/**
 * Sonido cuando Mario pasa de ser grande a chiquito (Power-Down / Shrink)
 * Secuencia escalonada descendente característica al vaciar o eliminar productos
 */
export function playMarioPowerDownSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, dur: 0.04 }, // C5
      { freq: 493.88, dur: 0.04 }, // B4
      { freq: 466.16, dur: 0.04 }, // A#4
      { freq: 440.00, dur: 0.04 }, // A4
      { freq: 415.30, dur: 0.04 }, // G#4
      { freq: 392.00, dur: 0.04 }, // G4
      { freq: 369.99, dur: 0.04 }, // F#4
      { freq: 349.23, dur: 0.04 }, // F4
      { freq: 329.63, dur: 0.05 }, // E4
      { freq: 293.66, dur: 0.05 }, // D4
      { freq: 261.63, dur: 0.12 }  // C4
    ];

    let startTime = ctx.currentTime + 0.01;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + note.dur);

      startTime += note.dur * 0.9;
    });
  } catch (err) {
    console.warn('AudioContext playMarioPowerDownSound info:', err);
  }
}
