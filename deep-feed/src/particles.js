// ============================================================
//  PARTICLES, BUBBLES & FLOATING TEXT
// ============================================================

import G from './state.js';
import { MAX_PARTICLES, MAX_BUBBLES, MAX_FLOATING_TEXTS } from './constants.js';

export function spawnEatParticles(x, y, color, count, magnetic, sizeMin, sizeMax) {
  const sMin = sizeMin || 2;
  const sMax = sizeMax || 6;
  for (let i = 0; i < count && G.particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    G.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      size: sMin + Math.random() * (sMax - sMin),
      color,
      magnetic: magnetic || false,
      magnetTimer: magnetic ? 0.3 : 0,
    });
  }
}

export function spawnBubble(x, y) {
  if (G.bubbles.length >= MAX_BUBBLES) return;
  G.bubbles.push({
    x: x + (Math.random() - 0.5) * 10,
    y,
    vy: -0.5 - Math.random() * 1.5,
    size: 1 + Math.random() * 3,
    life: 1,
    decay: 0.005 + Math.random() * 0.005,
  });
}

export function spawnFloatingText(x, y, text, color, big, fontSize) {
  if (G.floatingTexts.length >= MAX_FLOATING_TEXTS) return;
  G.floatingTexts.push({
    x, y, text,
    color: color || '#fff',
    life: 1,
    decay: big ? 0.006 : 0.012,
    big: big || false,
    glow: big || false,
    fontSize: fontSize || (big ? 32 : 20),
  });
}

export function updateParticles(effectiveDt) {
  for (let i = G.particles.length - 1; i >= 0; i--) {
    const p = G.particles[i];
    if (p.magnetic && G.player && G.player.alive) {
      if (p.magnetTimer > 0) {
        p.magnetTimer -= effectiveDt;
      } else {
        const mdx = G.player.x - p.x, mdy = G.player.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist > 2) {
          p.vx += (mdx / mdist) * 12;
          p.vy += (mdy / mdist) * 12;
        }
      }
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life -= p.decay;
    if (p.life <= 0) G.particles.splice(i, 1);
  }
}

export function updateBubbles(effectiveDt) {
  for (let i = G.bubbles.length - 1; i >= 0; i--) {
    const b = G.bubbles[i];
    b.y += b.vy;
    b.x += Math.sin(b.y * 0.05) * 0.3;
    b.life -= b.decay;
    if (b.life <= 0) G.bubbles.splice(i, 1);
  }
  if (Math.random() < effectiveDt * 2) {
    spawnBubble(Math.random() * G.W, G.H + 5);
  }
}

export function updateFloatingTexts() {
  for (let i = G.floatingTexts.length - 1; i >= 0; i--) {
    const ft = G.floatingTexts[i];
    ft.y -= ft.big ? 0.6 : 1.2;
    ft.life -= ft.decay;
    if (ft.life <= 0) G.floatingTexts.splice(i, 1);
  }
}
