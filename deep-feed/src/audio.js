// ============================================================
//  AUDIO (Web Audio API)
// ============================================================

import G from './state.js';

let audioCtx = null;
let ambientGain = null;
let ambientNodes = [];

export function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function getAudioCtx() { return audioCtx; }

// --- Haptic feedback ---
export function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}

// --- Ambient underwater audio (procedural drone) ---
export function startAmbientAudio() {
  if (!audioCtx || ambientGain) return;

  ambientGain = audioCtx.createGain();
  ambientGain.gain.setValueAtTime(0, audioCtx.currentTime);
  ambientGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 2);

  // Low-pass filter for underwater feel
  const lpFilter = audioCtx.createBiquadFilter();
  lpFilter.type = 'lowpass';
  lpFilter.frequency.value = 300;
  lpFilter.Q.value = 1;

  // Deep drone oscillator
  const drone = audioCtx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 55;
  const droneGain = audioCtx.createGain();
  droneGain.gain.value = 0.4;
  drone.connect(droneGain).connect(lpFilter);
  drone.start();
  ambientNodes.push(drone);

  // Sub-harmonic
  const sub = audioCtx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 27.5;
  const subGain = audioCtx.createGain();
  subGain.gain.value = 0.3;
  sub.connect(subGain).connect(lpFilter);
  sub.start();
  ambientNodes.push(sub);

  // Filtered noise for water texture
  const bufSize = audioCtx.sampleRate * 2;
  const noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) noiseData[i] = (Math.random() * 2 - 1);
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuf;
  noiseSource.loop = true;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.value = 0.15;
  const noiseLp = audioCtx.createBiquadFilter();
  noiseLp.type = 'lowpass';
  noiseLp.frequency.value = 200;
  noiseLp.Q.value = 0.5;
  noiseSource.connect(noiseLp).connect(noiseGain).connect(lpFilter);
  noiseSource.start();
  ambientNodes.push(noiseSource);

  // Slow LFO modulation on drone frequency for organic feel
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 5;
  lfo.connect(lfoGain).connect(drone.frequency);
  lfo.start();
  ambientNodes.push(lfo);

  lpFilter.connect(ambientGain).connect(audioCtx.destination);
}

export function stopAmbientAudio() {
  if (ambientGain) {
    ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    const nodes = ambientNodes;
    setTimeout(() => {
      nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    }, 600);
    ambientGain = null;
    ambientNodes = [];
  }
}

// --- Sound effects ---

export function playEat(pitchMult) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const pm = pitchMult || 1;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(250 * pm, t);
  o.frequency.exponentialRampToValueAtTime(120 * pm, t + 0.08);
  o.frequency.exponentialRampToValueAtTime(200 * pm, t + 0.15);
  o.frequency.exponentialRampToValueAtTime(80 * pm, t + 0.2);
  g.gain.setValueAtTime(0.22, t);
  g.gain.linearRampToValueAtTime(0.18, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.2);
  const o2 = audioCtx.createOscillator();
  const g2 = audioCtx.createGain();
  o2.type = 'sine';
  o2.frequency.setValueAtTime(500 * pm, t);
  o2.frequency.exponentialRampToValueAtTime(300 * pm, t + 0.06);
  g2.gain.setValueAtTime(0.1, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o2.connect(g2).connect(audioCtx.destination);
  o2.start(t); o2.stop(t + 0.1);
  const bSize = audioCtx.sampleRate * 0.05;
  const buf = audioCtx.createBuffer(1, bSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bSize; i++) data[i] = (Math.random() * 2 - 1) * 0.2 * (1 - i / bSize);
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.1, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  noise.connect(ng).connect(audioCtx.destination);
  noise.start(t); noise.stop(t + 0.05);
}

export function playHurt() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(300, t);
  o.frequency.exponentialRampToValueAtTime(100, t + 0.25);
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.3);
}

export function playGameOver() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [260, 220, 180, 140].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t + i * 0.2);
    g.gain.setValueAtTime(0.12, t + i * 0.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.3);
    o.connect(g).connect(audioCtx.destination);
    o.start(t + i * 0.2); o.stop(t + i * 0.2 + 0.35);
  });
}

export function playFrenzy() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t + i * 0.06);
    g.gain.setValueAtTime(0.15, t + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.2);
    o.connect(g).connect(audioCtx.destination);
    o.start(t + i * 0.06); o.stop(t + i * 0.06 + 0.25);
  });
}

export function playPrestige() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(800, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.6);
  o.frequency.exponentialRampToValueAtTime(400, t + 1.2);
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 1.5);
  const sub = audioCtx.createOscillator();
  const sg = audioCtx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(50, t);
  sg.gain.setValueAtTime(0.2, t);
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  sub.connect(sg).connect(audioCtx.destination);
  sub.start(t); sub.stop(t + 0.8);
  for (let i = 0; i < 5; i++) {
    const bo = audioCtx.createOscillator();
    const bg = audioCtx.createGain();
    bo.type = 'sine';
    const bt = t + 0.3 + i * 0.15;
    bo.frequency.setValueAtTime(1200 + Math.random() * 800, bt);
    bo.frequency.exponentialRampToValueAtTime(600, bt + 0.05);
    bg.gain.setValueAtTime(0.06, bt);
    bg.gain.exponentialRampToValueAtTime(0.001, bt + 0.06);
    bo.connect(bg).connect(audioCtx.destination);
    bo.start(bt); bo.stop(bt + 0.07);
  }
}

export function playBonk() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.1);
}

export function playTierUp() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    const vol = 0.18 + i * 0.06;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq, t + i * 0.12);
    g.gain.setValueAtTime(vol * 0.5, t + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + (i === 2 ? 0.4 : 0.2));
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    o.connect(lp).connect(g).connect(audioCtx.destination);
    o.start(t + i * 0.12); o.stop(t + i * 0.12 + (i === 2 ? 0.45 : 0.25));
    const o2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(freq, t + i * 0.12);
    g2.gain.setValueAtTime(vol, t + i * 0.12);
    g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + (i === 2 ? 0.4 : 0.2));
    o2.connect(g2).connect(audioCtx.destination);
    o2.start(t + i * 0.12); o2.stop(t + i * 0.12 + (i === 2 ? 0.45 : 0.25));
  });
  const echo = audioCtx.createOscillator();
  const eg = audioCtx.createGain();
  echo.type = 'sine';
  echo.frequency.setValueAtTime(784, t + 0.30);
  eg.gain.setValueAtTime(0.12, t + 0.30);
  eg.gain.exponentialRampToValueAtTime(0.001, t + 0.50);
  echo.connect(eg).connect(audioCtx.destination);
  echo.start(t + 0.30); echo.stop(t + 0.50);
  const sub = audioCtx.createOscillator();
  const sg = audioCtx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60, t);
  sg.gain.setValueAtTime(0.25, t);
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  sub.connect(sg).connect(audioCtx.destination);
  sub.start(t); sub.stop(t + 0.12);
}

export function playZoneSound(zone) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  if (zone === 'reef') {
    [880, 1100, 1320, 880].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.08);
      g.gain.setValueAtTime(0.12, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.2);
    });
  } else if (zone === 'twilight') {
    [440, 392, 330, 294].forEach((freq, i) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, t + i * 0.12);
      g.gain.setValueAtTime(0.1, t + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.35);
    });
  } else if (zone === 'abyss') {
    const drone = audioCtx.createOscillator();
    const dg = audioCtx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(55, t);
    dg.gain.setValueAtTime(0.15, t);
    dg.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    drone.connect(dg).connect(audioCtx.destination);
    drone.start(t); drone.stop(t + 0.8);
    const crystal = audioCtx.createOscillator();
    const cg = audioCtx.createGain();
    crystal.type = 'sine';
    crystal.frequency.setValueAtTime(2000, t + 0.2);
    cg.gain.setValueAtTime(0.08, t + 0.2);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    crystal.connect(cg).connect(audioCtx.destination);
    crystal.start(t + 0.2); crystal.stop(t + 0.7);
  }
}

export function playMilestone() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(2400, t);
  o.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
  g.gain.setValueAtTime(0.1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.25);
}

export function playTailFlick() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const bufSize = Math.floor(audioCtx.sampleRate * 0.12);
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    const env = Math.exp(-i / (bufSize * 0.3)) * (1 - i / bufSize);
    data[i] = (Math.random() * 2 - 1) * env * 0.3;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.exponentialRampToValueAtTime(800, t + 0.1);
  filter.Q.value = 2;
  const ng = audioCtx.createGain();
  ng.gain.setValueAtTime(0.18, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  noise.connect(filter).connect(ng).connect(audioCtx.destination);
  noise.start(t); noise.stop(t + 0.12);
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(400, t);
  o.frequency.exponentialRampToValueAtTime(200, t + 0.1);
  g.gain.setValueAtTime(0.08, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + 0.1);
}

export function playDeathDramatic() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Descending doom chord
  [200, 160, 120, 80].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t + i * 0.15);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + i * 0.15 + 0.6);
    g.gain.setValueAtTime(0.15, t + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.7);
    o.connect(g).connect(audioCtx.destination);
    o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.8);
  });
  // Low rumble
  const rumble = audioCtx.createOscillator();
  const rg = audioCtx.createGain();
  rumble.type = 'sine';
  rumble.frequency.value = 35;
  rg.gain.setValueAtTime(0.2, t);
  rg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  rumble.connect(rg).connect(audioCtx.destination);
  rumble.start(t); rumble.stop(t + 1.2);
}

export function startFestinDrone() {
  if (!audioCtx || G.festinDroneNode) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, audioCtx.currentTime);
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.5);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  G.festinDroneNode = osc;
  G.festinDroneGain = gain;
}

export function stopFestinDrone() {
  if (G.festinDroneNode && G.festinDroneGain) {
    G.festinDroneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    const node = G.festinDroneNode;
    setTimeout(() => { try { node.stop(); } catch(e) {} }, 600);
    G.festinDroneNode = null;
    G.festinDroneGain = null;
  }
}
