// ============================================================
//  RENDERING — all drawing code
// ============================================================

import G from './state.js';
import { ctx } from './dom.js';
import {
  TIER_COUNT, TIER_NAMES, TIER_THRESHOLDS, TIER_RADIUS,
  PRESTIGE_EXTRA_EATS, ZONE_BG, BOOST_MAX, PLAYER_BASE_SPEED,
  JOYSTICK_MAX_RADIUS, JOYSTICK_BASE_RADIUS, JOYSTICK_KNOB_RADIUS,
  REF_SCREEN, SHAKE_DECAY,
} from './constants.js';
import { getFishColors, getZoneForTier } from './zones.js';

// ---- Fish drawing ----
export function drawFish(x, y, radius, angle, tier, mouthOpen, tailPhase, isPlayer, zone, bodyRatioW, bodyRatioH) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const c = getFishColors(tier, zone || G.currentZone);
  const r = radius;
  const rawBodyLen = r * 2.2;
  const rawBodyH = r * 1.1;
  const bw = (bodyRatioW || 1) * (tier >= 3 ? 1.1 : 1);
  const bh = (bodyRatioH || 1) * (tier >= 3 ? 0.95 : 1);
  const bodyLen = rawBodyLen * bw;
  const bodyH = rawBodyH * bh;
  const tailWag = Math.sin(tailPhase) * 0.3;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(2, 3, bodyLen * 0.48, bodyH * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fin
  ctx.save();
  ctx.translate(-bodyLen * 0.4, 0);
  ctx.rotate(tailWag);
  ctx.fillStyle = c.fin;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-r * 0.9, -r * 0.7);
  ctx.quadraticCurveTo(-r * 0.5, 0, -r * 0.9, r * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = c.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLen * 0.45, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body shine
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.3, 0, 0, 0, r * 1.2);
  grad.addColorStop(0, 'rgba(255,255,255,0.25)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLen * 0.45, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Player highlights
  if (isPlayer) {
    const playerGrad = ctx.createRadialGradient(-r * 0.15, -r * 0.25, 0, 0, 0, r * 1.2);
    playerGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    playerGrad.addColorStop(0.6, 'rgba(255,255,255,0.07)');
    playerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = playerGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyLen * 0.45, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();

    const shimmerPhase = G.gameTime || 0;
    const shimmer = 0.04 + 0.03 * Math.sin(shimmerPhase * 4);
    ctx.fillStyle = `rgba(255,230,180,${shimmer})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyLen * 0.45, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyLen * 0.46, bodyH * 1.01, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dorsal fin
  ctx.fillStyle = c.fin;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -bodyH * 0.85);
  ctx.quadraticCurveTo(r * 0.1, -bodyH * 1.5, r * 0.4, -bodyH * 0.85);
  ctx.closePath();
  ctx.fill();

  // Pectoral fin
  ctx.fillStyle = c.fin;
  ctx.beginPath();
  ctx.moveTo(r * 0.05, bodyH * 0.6);
  ctx.quadraticCurveTo(r * 0.1, bodyH * 1.3, -r * 0.3, bodyH * 0.9);
  ctx.closePath();
  ctx.fill();

  // Abyss bioluminescence
  if ((zone || G.currentZone) === 'abyss' && !isPlayer) {
    const bioGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    bioGlow.addColorStop(0, 'rgba(100,200,255,0.12)');
    bioGlow.addColorStop(1, 'rgba(100,200,255,0)');
    ctx.fillStyle = bioGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Anglerfish lantern
  if ((zone || G.currentZone) === 'abyss' && tier >= 4 && !isPlayer) {
    ctx.save();
    const lx = bodyLen * 0.5, ly = -bodyH * 1.2;
    ctx.strokeStyle = c.fin;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -bodyH * 0.8);
    ctx.quadraticCurveTo(lx * 0.8, ly * 0.6, lx, ly);
    ctx.stroke();
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 0.8);
    lg.addColorStop(0, 'rgba(255,255,100,0.6)');
    lg.addColorStop(0.5, 'rgba(255,200,50,0.15)');
    lg.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ly, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffaa';
    ctx.beginPath();
    ctx.arc(lx, ly, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Mouth
  if (mouthOpen > 0) {
    ctx.fillStyle = '#331111';
    ctx.beginPath();
    ctx.ellipse(bodyLen * 0.42, 0, r * 0.15, mouthOpen * r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Jaw for tier 4+
  if (tier >= 4 && !isPlayer) {
    ctx.fillStyle = c.fin;
    ctx.beginPath();
    ctx.moveTo(bodyLen * 0.35, bodyH * 0.3);
    ctx.quadraticCurveTo(bodyLen * 0.5, bodyH * 0.65, bodyLen * 0.3, bodyH * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Eye
  const eyeX = r * 0.4, eyeY = -r * 0.25;
  const eyeR = r * (isPlayer ? 0.25 : 0.2);
  ctx.fillStyle = c.eye;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.25, eyeY, eyeR * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.45, eyeY - eyeR * 0.25, eyeR * 0.2, 0, Math.PI * 2);
  ctx.fill();

  if (isPlayer) {
    const glintPhase = G.gameTime || 0;
    const glintAlpha = 0.5 + 0.5 * Math.sin(glintPhase * 4);
    ctx.fillStyle = `rgba(255,255,255,${glintAlpha})`;
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.15, eyeY - eyeR * 0.4, eyeR * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player glow ring
  if (isPlayer) {
    const tierCol = c.body;
    const _tc = parseInt(tierCol.slice(1), 16);
    const _tr = (_tc >> 16) & 0xff, _tg = (_tc >> 8) & 0xff, _tb = _tc & 0xff;
    const glowPhase = G.gameTime || 0;
    const breathT = Math.sin(glowPhase * 2.5);
    const glowOpacity = 0.3 + 0.15 * (1 + breathT);
    const glowRadOff = 3 * breathT;
    ctx.shadowColor = `rgba(${_tr},${_tg},${_tb},0.6)`;
    ctx.shadowBlur = 16 + 4 * breathT;
    ctx.strokeStyle = `rgba(${_tr},${_tg},${_tb},${glowOpacity})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyLen * 0.52 + 6 + glowRadOff, bodyH + 6 + glowRadOff, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(255,255,255,${glowOpacity * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyLen * 0.52 + 2 + glowRadOff * 0.5, bodyH + 2 + glowRadOff * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ---- Plancton ----
export function drawPlancton(x, y, radius, phase, zone) {
  const pulse = 0.7 + 0.3 * Math.sin(phase);
  const glowR = radius * 2.5 * pulse;
  const z = zone || G.currentZone;
  let inner, mid, outer;
  if (z === 'abyss') { inner = 'rgba(0,255,200,0.6)'; mid = 'rgba(0,200,180,0.25)'; outer = 'rgba(0,150,150,0)'; }
  else if (z === 'twilight') { inner = 'rgba(160,180,255,0.5)'; mid = 'rgba(120,140,220,0.2)'; outer = 'rgba(80,100,180,0)'; }
  else if (z === 'reef') { inner = 'rgba(100,255,180,0.5)'; mid = 'rgba(80,220,160,0.2)'; outer = 'rgba(50,180,120,0)'; }
  else { inner = 'rgba(140,255,255,0.5)'; mid = 'rgba(100,220,255,0.2)'; outer = 'rgba(60,180,255,0)'; }
  const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  g.addColorStop(0, inner); g.addColorStop(0.4, mid); g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(220,255,255,${0.6 + 0.4 * pulse})`;
  ctx.beginPath();
  ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Jellyfish ----
export function drawJellyfish(j) {
  const pulse = 0.85 + 0.15 * Math.sin(j.phase);
  const r = j.radius * pulse;
  const glow = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, r * 3);
  glow.addColorStop(0, 'rgba(180,100,255,0.15)');
  glow.addColorStop(1, 'rgba(180,100,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(j.x, j.y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,130,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(j.x, j.y, r * 0.8, r * 0.6, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(220,180,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(j.x, j.y - r * 0.1, r * 0.4, r * 0.3, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,130,255,0.3)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const tx = j.x + (i - 2) * r * 0.3;
    const waveOff = Math.sin(j.tentaclePhase + i * 0.8) * 6;
    ctx.beginPath();
    ctx.moveTo(tx, j.y);
    ctx.quadraticCurveTo(tx + waveOff, j.y + r * 0.8, tx - waveOff * 0.5, j.y + r * 1.5);
    ctx.stroke();
  }
}

// ---- Main render function ----
export function render() {
  const W = G.W, H = G.H;
  const player = G.player;

  ctx.save();
  ctx.translate(G.shakeX, G.shakeY);

  // Death zoom
  let effectiveCamZoom = G.tierUpZoomScale * G.cameraZoom;
  if (G.deathAnimActive && G.deathZoomTimer > 0) {
    const deathZoomProgress = 1 - (G.deathZoomTimer / 1.2);
    effectiveCamZoom *= 1 + deathZoomProgress * 0.3; // zoom in on death
  }
  if (effectiveCamZoom !== 1) {
    ctx.translate(W / 2, H / 2);
    ctx.scale(effectiveCamZoom, effectiveCamZoom);
    ctx.translate(-W / 2, -H / 2);
  }

  // Background
  const bg = ZONE_BG[G.currentZone] || ZONE_BG.surface;
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, bg.top);
  bgGrad.addColorStop(0.5, bg.mid);
  bgGrad.addColorStop(1, bg.bot);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(-10, -10, W + 20, H + 20);

  // Light rays
  ctx.save();
  ctx.globalAlpha = bg.rayAlpha;
  const rayCount = G.currentZone === 'abyss' ? 2 : 5;
  for (let i = 0; i < rayCount; i++) {
    const rx = W * (0.15 + i * (0.7 / rayCount));
    const rw = 40 + i * 20;
    const rayH = G.currentZone === 'abyss' ? H * 0.3 : H * 0.7;
    const rg = ctx.createLinearGradient(rx, 0, rx, rayH);
    rg.addColorStop(0, bg.rayColor);
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(rx - rw / 2, 0);
    ctx.lineTo(rx - rw * 1.5, rayH);
    ctx.lineTo(rx + rw * 1.5, rayH);
    ctx.lineTo(rx + rw / 2, 0);
    ctx.fill();
  }
  ctx.restore();

  // Zone-specific decorations
  renderZoneDecor();

  // Bubbles
  for (const b of G.bubbles) {
    ctx.globalAlpha = b.life * 0.3;
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,230,255,0.3)';
    ctx.beginPath();
    ctx.arc(b.x - b.size * 0.2, b.y - b.size * 0.2, b.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Jellyfish
  for (const j of G.jellyfish) drawJellyfish(j);

  // Enemy fish
  for (const f of G.fishes) {
    if (!f.alive) continue;
    if (f.tier === 0) {
      drawPlancton(f.x, f.y, f.radius, f.tailPhase, G.currentZone);
    } else {
      const r = f.sizeBoost > 0 ? f.radius * (1 + 0.08 * f.sizeBoost) : f.radius;
      if (player && player.alive) {
        if (f.tier < player.tier) {
          const haloGrad = ctx.createRadialGradient(f.x, f.y, r * 0.6, f.x, f.y, r * 2);
          haloGrad.addColorStop(0, 'rgba(80,255,80,0.12)');
          haloGrad.addColorStop(1, 'rgba(80,255,80,0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (f.tier > player.tier) {
          const dangerPulse = 0.08 + 0.04 * Math.sin(G.gameTime * 6 + f.x);
          const haloGrad = ctx.createRadialGradient(f.x, f.y, r * 0.6, f.x, f.y, r * 2.2);
          haloGrad.addColorStop(0, `rgba(255,60,60,${dangerPulse})`);
          haloGrad.addColorStop(1, 'rgba(255,60,60,0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      drawFish(f.x, f.y, r, f.angle, f.tier, f.mouthOpen, f.tailPhase, false, G.currentZone, f.bodyRatioW, f.bodyRatioH);
    }
  }

  // Ambush fish
  for (const a of G.ambushFish) {
    ctx.globalAlpha = a.opacity;
    drawFish(a.x, a.y, a.radius, a.angle, a.tier, a.mouthOpen, a.tailPhase, false, 'abyss', 1, 1);
    if (a.warning && !a.activated) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.gameTime * 25);
      const eyeOffX = Math.cos(a.angle) * a.radius * 0.4;
      const eyeOffY = Math.sin(a.angle) * a.radius * 0.4;
      const eyeGlow = ctx.createRadialGradient(a.x + eyeOffX, a.y + eyeOffY, 0, a.x + eyeOffX, a.y + eyeOffY, a.radius * 0.8);
      eyeGlow.addColorStop(0, 'rgba(255,50,50,0.8)');
      eyeGlow.addColorStop(0.5, 'rgba(255,50,50,0.2)');
      eyeGlow.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(a.x + eyeOffX, a.y + eyeOffY, a.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Player
  if (player && player.alive) {
    renderPlayer();
  }

  // Particles
  for (const p of G.particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating texts
  for (const ft of G.floatingTexts) {
    ctx.globalAlpha = ft.life;
    ctx.textAlign = 'center';
    ctx.font = `bold ${ft.fontSize}px "Segoe UI", system-ui, sans-serif`;
    if (ft.glow) { ctx.shadowColor = ft.color; ctx.shadowBlur = 20; }
    else ctx.shadowBlur = 0;
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;

  // Same-tier bump yellow flash + tooltip
  if (G.sameTierBumpTooltip.active) {
    const bt = G.sameTierBumpTooltip;
    const flashAlpha = Math.min(1, bt.timer) * 0.4;
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.arc(bt.x, bt.y, 40, 0, Math.PI * 2);
    ctx.fill();
    if (bt.text) {
      ctx.globalAlpha = Math.min(1, bt.timer / 0.5);
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(bt.text, bt.x, bt.y - 50);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  // Overlays
  if (G.saturationFlash > 0 && !G.frenzyActive) {
    ctx.globalAlpha = G.saturationFlash * 0.15;
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.globalAlpha = 1;
  }

  if (G.zoneWaveY >= 0 && G.zoneWaveY < H + 50) {
    ctx.globalAlpha = 0.3 * (1 - G.zoneWaveY / H);
    const waveGrad = ctx.createLinearGradient(0, G.zoneWaveY - 30, 0, G.zoneWaveY + 30);
    waveGrad.addColorStop(0, 'transparent');
    waveGrad.addColorStop(0.5, G.zoneWaveColor);
    waveGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = waveGrad;
    ctx.fillRect(-10, G.zoneWaveY - 30, W + 20, 60);
    ctx.globalAlpha = 1;
  }

  // Tier-up text
  if (G.tierUpTextScale > 0 && G.tierUpTextAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = G.tierUpTextAlpha;
    ctx.translate(W / 2, H / 2 + G.tierUpTextY);
    ctx.scale(G.tierUpTextScale, G.tierUpTextScale);
    ctx.textAlign = 'center';
    ctx.font = 'bold 46px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 24;
    ctx.fillText('TIER UP!', 0, -16);
    ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = G.tierUpTextColor;
    ctx.shadowColor = G.tierUpTextColor;
    ctx.shadowBlur = 16;
    ctx.fillText('\u2192 ' + G.tierUpTextName, 0, 22);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  if (G.tierUpFlashTimer > 0) {
    ctx.globalAlpha = (G.tierUpFlashTimer / 0.3) * 0.15;
    ctx.fillStyle = G.tierUpRingColor || '#ffd700';
    ctx.fillRect(-10, -10, W + 20, H + 20);
    ctx.globalAlpha = 1;
  }

  // Joystick
  renderJoystick();

  // Control zone
  renderControlZone();

  // Prestige cinematic
  if (G.inPrestige) renderPrestigeCinematic();

  // Death animation: skeleton fade
  if (G.deathAnimActive && player) {
    G.deathZoomTimer = Math.max(0, G.deathZoomTimer - 0.016);
    G.deathSkeletonAlpha = Math.min(1, G.deathSkeletonAlpha + 0.02);
    // Fading fish with desaturation
    ctx.globalAlpha = Math.max(0.1, 1 - G.deathSkeletonAlpha * 0.8);
    ctx.filter = `grayscale(${Math.min(100, G.deathSkeletonAlpha * 100)}%)`;
    // Player fish fading is handled by the flash in main render
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function renderPlayer() {
  const W = G.W, H = G.H;
  const player = G.player;
  const pDrawR = player.radius * (1 + G.playerScaleBump);

  // Abyss halo
  if (G.currentZone === 'abyss') {
    const haloR = player.radius * 5;
    const halo = ctx.createRadialGradient(player.x, player.y, player.radius * 0.5, player.x, player.y, haloR);
    halo.addColorStop(0, 'rgba(100,200,255,0.12)');
    halo.addColorStop(0.5, 'rgba(60,140,200,0.05)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(player.x, player.y, haloR, 0, Math.PI * 2);
    ctx.fill();
    const darkR = Math.max(W, H);
    const dark = ctx.createRadialGradient(player.x, player.y, haloR * 0.7, player.x, player.y, darkR);
    dark.addColorStop(0, 'rgba(0,2,8,0)');
    dark.addColorStop(0.3, 'rgba(0,2,8,0.4)');
    dark.addColorStop(1, 'rgba(0,2,8,0.7)');
    ctx.fillStyle = dark;
    ctx.fillRect(-10, -10, W + 20, H + 20);
  }

  // Flash when invincible
  if (player.invincible > 0 && Math.sin(player.flashTimer * Math.PI) > 0) ctx.globalAlpha = 0.4;

  // Tail flick squash
  if (G.tailFlickSquash > 0) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    const t = 1 - G.tailFlickSquash;
    const scaleX = t < 0.5 ? 1 - t * 0.3 : 0.85 + (t - 0.5) * 0.5;
    const scaleY = t < 0.5 ? 1 + t * 0.2 : 1.1 - (t - 0.5) * 0.3;
    ctx.scale(scaleX, scaleY);
    ctx.rotate(-player.angle);
    ctx.translate(-player.x, -player.y);
    drawFish(player.x, player.y, pDrawR, player.angle, player.tier, player.mouthOpen, player.tailPhase, true, G.currentZone);
    if (G.tailFlickSquash > 0.5) {
      ctx.globalAlpha = (G.tailFlickSquash - 0.5) * 0.6;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(player.x, player.y, pDrawR * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  } else {
    drawFish(player.x, player.y, pDrawR, player.angle, player.tier, player.mouthOpen, player.tailPhase, true, G.currentZone);
  }
  ctx.globalAlpha = 1;

  // Grace shimmer
  if (G.graceTimer > 0) {
    const graceAlpha = Math.min(1, G.graceTimer / 1.5) * 0.25;
    const shimmerPhase = G.gameTime * 5;
    const shimmerR = pDrawR * 1.6 + Math.sin(shimmerPhase) * 3;
    const shimmerGrad = ctx.createRadialGradient(player.x, player.y, pDrawR * 0.8, player.x, player.y, shimmerR);
    shimmerGrad.addColorStop(0, 'rgba(180,230,255,0)');
    shimmerGrad.addColorStop(0.6, `rgba(180,230,255,${graceAlpha * 0.4})`);
    shimmerGrad.addColorStop(0.85, `rgba(220,255,255,${graceAlpha * 0.6})`);
    shimmerGrad.addColorStop(1, 'rgba(180,230,255,0)');
    ctx.fillStyle = shimmerGrad;
    ctx.beginPath();
    ctx.arc(player.x, player.y, shimmerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${graceAlpha * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, shimmerR - 2, shimmerPhase % (Math.PI * 2), (shimmerPhase % (Math.PI * 2)) + Math.PI * 0.6);
    ctx.stroke();
  }

  // Tier-up flash on body
  if (G.tierUpFlashTimer > 0) {
    ctx.globalAlpha = (G.tierUpFlashTimer / 0.3) * 0.3;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(player.x, player.y, pDrawR * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // XP ring
  {
    const xpRadius = pDrawR * 1.7;
    let xpProgress, xpColor;
    if (player.tier < TIER_COUNT - 1) {
      xpProgress = player.eaten / TIER_THRESHOLDS[player.tier];
      xpColor = getFishColors(player.tier + 1, G.currentZone).body;
    } else {
      xpProgress = G.prestigeEats / PRESTIGE_EXTRA_EATS;
      xpColor = '#ffcc00';
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, xpRadius, 0, Math.PI * 2);
    ctx.stroke();
    if (xpProgress > 0) {
      const startA = -Math.PI / 2;
      const endA = startA + Math.min(1, xpProgress) * Math.PI * 2;
      ctx.strokeStyle = xpColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = xpColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(player.x, player.y, xpRadius, startA, endA);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Chevron
  {
    const chevronY = player.y - pDrawR * 1.9 - 16;
    const chevronSize = 10;
    const chevBreath = Math.sin(G.gameTime * 2.5);
    const chevronAlpha = 0.6 + 0.1 * (1 + chevBreath);
    ctx.globalAlpha = chevronAlpha;
    ctx.shadowColor = 'rgba(255,215,100,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(255,235,200,0.9)';
    ctx.beginPath();
    ctx.moveTo(player.x - chevronSize, chevronY - chevronSize * 0.6);
    ctx.lineTo(player.x + chevronSize, chevronY - chevronSize * 0.6);
    ctx.lineTo(player.x, chevronY + chevronSize * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,215,0,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Combo counter
  if (G.comboCount >= 2) {
    const comboY = player.y - pDrawR * 1.9 - 30;
    let comboColor;
    if (G.frenzyActive) comboColor = '#ffd700';
    else if (G.comboCount >= 7) comboColor = '#ffd700';
    else if (G.comboCount >= 5) comboColor = '#ff4444';
    else if (G.comboCount >= 3) comboColor = '#ffaa00';
    else comboColor = '#ffffff';
    const comboSize = Math.min(36, 20 + G.comboCount * 2) * G.comboPulseScale;
    ctx.font = `bold ${Math.round(comboSize)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = comboColor;
    ctx.globalAlpha = Math.min(1, G.comboTimer / 0.3);
    if (G.comboCount >= 5 || G.frenzyActive) { ctx.shadowColor = comboColor; ctx.shadowBlur = 12; }
    ctx.fillText(`×${G.comboCount}`, player.x, comboY);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Festin overlay
  if (G.frenzyActive && G.frenzyTimer > 0) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.globalAlpha = 1;
    const festinProgress = G.frenzyTimer / 4;
    const arcRadius = pDrawR * 2.2;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(player.x, player.y, arcRadius, -Math.PI / 2, -Math.PI / 2 + festinProgress * Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Build-up near tier-up
  renderBuildUp(pDrawR);

  // Tier-up rings
  if (G.tierUpRingAlpha > 0) {
    ctx.strokeStyle = G.tierUpRingColor;
    ctx.globalAlpha = G.tierUpRingAlpha;
    ctx.lineWidth = 3 * G.tierUpRingAlpha;
    ctx.beginPath();
    ctx.arc(player.x, player.y, G.tierUpRingRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (let ri = 0; ri < 3; ri++) {
    const ring = G.tierUpRings[ri];
    if (ring.alpha <= 0) continue;
    ctx.strokeStyle = ring.color;
    ctx.globalAlpha = ring.alpha;
    ctx.lineWidth = 3 * ring.alpha;
    ctx.shadowColor = ring.color;
    ctx.shadowBlur = 10 * ring.alpha;
    ctx.beginPath();
    ctx.arc(player.x, player.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Jellyfish slow tint
  if (G.playerSlowTimer > 0) {
    ctx.globalAlpha = 0.25 * (G.playerSlowTimer / 0.5);
    ctx.fillStyle = '#9944ff';
    ctx.beginPath();
    ctx.arc(player.x, player.y, pDrawR * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Boost trail
  if (G.boosting && G.boostFuel > 0) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#ffcc44';
    for (let i = 0; i < 3; i++) {
      const bx = player.x - Math.cos(player.angle) * (player.radius + 10 + i * 8) + (Math.random() - 0.5) * 6;
      const by = player.y - Math.sin(player.angle) * (player.radius + 10 + i * 8) + (Math.random() - 0.5) * 6;
      ctx.beginPath();
      ctx.arc(bx, by, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function renderBuildUp(pDrawR) {
  const player = G.player;
  const xpRadiusBU = pDrawR * 1.7;
  let progressBU;
  if (player.tier < TIER_COUNT - 1) progressBU = player.eaten / TIER_THRESHOLDS[player.tier];
  else progressBU = G.prestigeEats / PRESTIGE_EXTRA_EATS;

  if (progressBU >= 0.8) {
    const xpColorBU = player.tier < TIER_COUNT - 1 ? getFishColors(player.tier + 1, G.currentZone).body : '#ffcc00';
    const endAngle = -Math.PI / 2 + Math.min(1, progressBU) * Math.PI * 2;
    const sparkX = player.x + Math.cos(endAngle) * xpRadiusBU;
    const sparkY = player.y + Math.sin(endAngle) * xpRadiusBU;
    const sparkAlpha = 0.4 + 0.4 * Math.sin(G.gameTime * 8);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = sparkAlpha;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    const threshold = player.tier < TIER_COUNT - 1 ? TIER_THRESHOLDS[player.tier] : PRESTIGE_EXTRA_EATS;
    const current = player.tier < TIER_COUNT - 1 ? player.eaten : G.prestigeEats;
    if (current === threshold - 1) {
      if (Math.sin(G.gameTime * 10) > 0) {
        ctx.strokeStyle = xpColorBU;
        ctx.lineWidth = 5;
        ctx.shadowColor = xpColorBU;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(player.x, player.y, xpRadiusBU, -Math.PI / 2, endAngle);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }
  if (player.tier === TIER_COUNT - 1 && G.prestigeEats >= PRESTIGE_EXTRA_EATS * 0.75) {
    const intensity = (G.prestigeEats - PRESTIGE_EXTRA_EATS * 0.75) / (PRESTIGE_EXTRA_EATS * 0.25);
    ctx.globalAlpha = 0.3 * intensity;
    ctx.fillStyle = '#ffd700';
    for (let pi = 0; pi < 6; pi++) {
      const ppx = player.x + Math.sin(G.gameTime * 2 + pi * Math.PI / 3) * (pDrawR + 15);
      const ppy = player.y - ((G.gameTime * 40 + pi * 15) % 60);
      ctx.beginPath();
      ctx.arc(ppx, ppy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function renderZoneDecor() {
  const W = G.W, H = G.H;

  if (G.currentZone === 'surface') {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#aaddff';
    ctx.lineWidth = 2;
    for (let wave = 0; wave < 3; wave++) {
      const wy = 5 + wave * 12;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) {
        const y = wy + Math.sin(x * 0.02 + G.gameTime * (1.5 + wave * 0.3)) * (4 + wave * 2);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 3; i++) {
      const rx = W * (0.25 + i * 0.25) + Math.sin(G.gameTime * 0.3 + i) * 20;
      const rw = 60 + i * 15;
      const rg = ctx.createLinearGradient(rx, 0, rx, H * 0.5);
      rg.addColorStop(0, '#ffffcc');
      rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(rx - rw / 2, 0);
      ctx.lineTo(rx - rw * 2, H * 0.5);
      ctx.lineTo(rx + rw * 2, H * 0.5);
      ctx.lineTo(rx + rw / 2, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  if (G.currentZone === 'twilight' && G.zoneDecor) {
    ctx.save();
    ctx.fillStyle = 'rgba(180,200,220,0.3)';
    for (const s of G.zoneDecor.twilight.snow) {
      const sy = (s.y + G.gameTime * s.speed * 30) % (H + 20) - 10;
      const sx = s.x + Math.sin(G.gameTime * 0.5 + s.drift) * 15;
      ctx.globalAlpha = 0.15 + 0.1 * Math.sin(G.gameTime + s.drift);
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const a of G.zoneDecor.twilight.algae) {
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = '#334455';
      ctx.lineWidth = a.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, H);
      const wave = Math.sin(G.gameTime * 1.2 + a.x * 0.01) * 15;
      ctx.quadraticCurveTo(a.x + wave, H - a.h * 0.5, a.x + wave * 1.5, H - a.h);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Reef currents with animated particle streams
  if (G.currentZone === 'reef') {
    ctx.save();
    for (const c of G.reefCurrents) {
      // Base current lines (increased alpha)
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#66ccbb';
      ctx.lineWidth = 2;
      const halfW = c.width / 2;
      for (let s = -3; s <= 3; s++) {
        const sy = c.y + s * 18;
        ctx.beginPath();
        ctx.moveTo(c.x - halfW, sy);
        ctx.bezierCurveTo(c.x - halfW * 0.3, sy - 5, c.x + halfW * 0.3, sy + 5, c.x + halfW, sy);
        ctx.stroke();
      }
      // Animated particle streams
      if (c.particles) {
        for (const cp of c.particles) {
          ctx.globalAlpha = cp.life * 0.3;
          ctx.fillStyle = '#66ccbb';
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, cp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Direction arrows
      ctx.globalAlpha = 0.12;
      const arrowSpacing = 60;
      for (let ax = c.x - halfW; ax < c.x + halfW; ax += arrowSpacing) {
        const ay = c.y + Math.sin(G.gameTime * 2 + ax * 0.01) * 15;
        ctx.beginPath();
        if (c.dir > 0) {
          ctx.moveTo(ax, ay - 4);
          ctx.lineTo(ax + 10, ay);
          ctx.lineTo(ax, ay + 4);
        } else {
          ctx.moveTo(ax, ay - 4);
          ctx.lineTo(ax - 10, ay);
          ctx.lineTo(ax, ay + 4);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  if (G.currentZone === 'reef' && G.zoneDecor) {
    ctx.save();
    for (const c of G.zoneDecor.reef.corals) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = c.color;
      if (c.type === 0) {
        ctx.beginPath();
        ctx.moveTo(c.x, H); ctx.lineTo(c.x - c.w * 0.3, H - c.h * 0.6);
        ctx.lineTo(c.x - c.w * 0.5, H - c.h); ctx.lineTo(c.x - c.w * 0.1, H - c.h * 0.7);
        ctx.lineTo(c.x + c.w * 0.2, H - c.h * 0.9); ctx.lineTo(c.x + c.w * 0.4, H - c.h * 0.5);
        ctx.lineTo(c.x + c.w * 0.3, H); ctx.fill();
      } else if (c.type === 1) {
        ctx.beginPath();
        ctx.moveTo(c.x - c.w * 0.15, H);
        ctx.lineTo(c.x - c.w * 0.15, H - c.h * 0.6);
        ctx.ellipse(c.x, H - c.h * 0.6, c.w * 0.5, c.h * 0.4, 0, Math.PI, 0);
        ctx.lineTo(c.x + c.w * 0.15, H); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(c.x, H);
        ctx.quadraticCurveTo(c.x - c.w * 0.8, H - c.h * 0.5, c.x - c.w * 0.3, H - c.h);
        ctx.quadraticCurveTo(c.x, H - c.h * 1.1, c.x + c.w * 0.3, H - c.h);
        ctx.quadraticCurveTo(c.x + c.w * 0.8, H - c.h * 0.5, c.x, H);
        ctx.fill();
      }
    }
    for (const a of G.zoneDecor.reef.anemones) {
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 2;
      for (let t = 0; t < a.tentacles; t++) {
        const tx = a.x + (t - a.tentacles / 2) * 6;
        const wave = Math.sin(G.gameTime * 2 + t * 0.7) * 8;
        ctx.beginPath();
        ctx.moveTo(tx, a.y);
        ctx.quadraticCurveTo(tx + wave, a.y - a.len * 0.6, tx + wave * 1.5, a.y - a.len);
        ctx.stroke();
      }
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(a.x, a.y, a.tentacles * 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (G.currentZone === 'abyss' && G.zoneDecor) {
    ctx.save();
    for (const l of G.zoneDecor.abyss.lights) {
      const pulse = 0.3 + 0.7 * Math.sin(G.gameTime * 0.8 + l.phase);
      ctx.globalAlpha = pulse * 0.2;
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.size + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = pulse * 0.06;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.size * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const v of G.zoneDecor.abyss.vents) {
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(v.x - v.w / 2, H);
      ctx.lineTo(v.x - v.w * 0.3, H - v.h);
      ctx.quadraticCurveTo(v.x, H - v.h - 10, v.x + v.w * 0.3, H - v.h);
      ctx.lineTo(v.x + v.w / 2, H);
      ctx.fill();
      ctx.globalAlpha = 0.12;
      for (let b = 0; b < 4; b++) {
        const by = H - v.h - ((G.gameTime * 20 + b * 30) % (v.h + 40));
        const bx = v.x + Math.sin(G.gameTime * 2 + b * 1.5) * 8;
        ctx.fillStyle = 'rgba(200,200,200,0.3)';
        ctx.beginPath();
        ctx.arc(bx, by, 2 + 0.3 * Math.sin(G.gameTime + b), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function renderJoystick() {
  if (!G.isTouchDevice || !G.running || !G.player || !G.player.alive || G.deathAnimActive || G.inPrestige) return;
  const drawIt = G.joystick.active || G.joystick.releaseAnimT > 0;
  if (!drawIt) return;
  ctx.save();
  let knobOffX = 0, knobOffY = 0;
  if (G.joystick.active) {
    knobOffX = G.joystick.currentX - G.joystick.originX;
    knobOffY = G.joystick.currentY - G.joystick.originY;
  } else if (G.joystick.releaseAnimT > 0) {
    const t = 1 - G.joystick.releaseAnimT;
    const elastic = 1 - Math.pow(2, -10 * t) * Math.cos(t * Math.PI * 3);
    knobOffX = G.joystick.releaseFromX * (1 - elastic);
    knobOffY = G.joystick.releaseFromY * (1 - elastic);
  }
  const baseX = G.joystick.originX, baseY = G.joystick.originY;
  const alpha = G.joystick.active ? 0.5 : G.joystick.releaseAnimT * 0.5;
  let joyColor;
  if (G.currentZone === 'abyss') joyColor = 'rgba(0,255,200,';
  else if (G.currentZone === 'twilight') joyColor = 'rgba(120,140,220,';
  else if (G.currentZone === 'reef') joyColor = 'rgba(80,220,160,';
  else joyColor = 'rgba(100,200,255,';
  const ripple1 = 1 + 0.03 * Math.sin(G.joystick.ripplePhase * 2.5);
  const ripple2 = 1 + 0.02 * Math.sin(G.joystick.ripplePhase * 3.7 + 1);
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = joyColor + '0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(baseX, baseY, JOYSTICK_MAX_RADIUS * ripple1, JOYSTICK_MAX_RADIUS * ripple2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = alpha * 0.15;
  ctx.fillStyle = joyColor + '0.1)';
  ctx.beginPath();
  ctx.arc(baseX, baseY, JOYSTICK_BASE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  if (G.joystick.active && G.joystick.tilt > 0.1) {
    const glowX = baseX + Math.cos(G.joystick.glowDir) * JOYSTICK_MAX_RADIUS;
    const glowY = baseY + Math.sin(G.joystick.glowDir) * JOYSTICK_MAX_RADIUS;
    const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 25);
    glowGrad.addColorStop(0, joyColor + (0.4 * G.joystick.tilt) + ')');
    glowGrad.addColorStop(1, joyColor + '0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(glowX, glowY, 25, 0, Math.PI * 2);
    ctx.fill();
  }
  const knobX = baseX + knobOffX, knobY = baseY + knobOffY;
  ctx.globalAlpha = alpha * 0.8;
  const knobGrad = ctx.createRadialGradient(knobX, knobY, 0, knobX, knobY, JOYSTICK_KNOB_RADIUS);
  knobGrad.addColorStop(0, joyColor + '0.5)');
  knobGrad.addColorStop(0.7, joyColor + '0.25)');
  knobGrad.addColorStop(1, joyColor + '0.1)');
  ctx.fillStyle = knobGrad;
  ctx.beginPath();
  ctx.arc(knobX, knobY, JOYSTICK_KNOB_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = joyColor + '0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(knobX, knobY, JOYSTICK_KNOB_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  if (G.joystick.cooldownIndicator > 0) {
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = 'rgba(255,150,50,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(baseX, baseY, JOYSTICK_MAX_RADIUS + 5, -Math.PI / 2, -Math.PI / 2 + G.joystick.cooldownIndicator * Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderControlZone() {
  const controlZoneEl = document.getElementById('control-zone');
  if (!G.isTouchDevice || !G.running || !controlZoneEl || !controlZoneEl.classList.contains('visible')) return;
  ctx.save();
  const W = G.W, H = G.H;
  const czTop = H * 0.72;
  const czHeight = H - czTop;
  let czColor1, czColor2;
  if (G.currentZone === 'abyss') { czColor1 = 'rgba(0,10,20,0.3)'; czColor2 = 'rgba(0,5,15,0.5)'; }
  else if (G.currentZone === 'twilight') { czColor1 = 'rgba(10,15,30,0.25)'; czColor2 = 'rgba(5,10,25,0.4)'; }
  else if (G.currentZone === 'reef') { czColor1 = 'rgba(10,50,50,0.2)'; czColor2 = 'rgba(5,30,35,0.35)'; }
  else { czColor1 = 'rgba(15,50,80,0.15)'; czColor2 = 'rgba(10,35,60,0.3)'; }
  const czGrad = ctx.createLinearGradient(0, czTop, 0, H);
  czGrad.addColorStop(0, czColor1);
  czGrad.addColorStop(1, czColor2);
  ctx.fillStyle = czGrad;
  ctx.fillRect(0, czTop, W, czHeight);
  ctx.globalAlpha = 0.15;
  for (const p of G.controlZoneParticles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = czHeight; if (p.y > czHeight) p.y = 0;
    const py = czTop + p.y;
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = G.currentZone === 'abyss' ? 'rgba(0,255,200,0.3)' : 'rgba(180,200,220,0.4)';
    ctx.beginPath();
    ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderPrestigeCinematic() {
  const W = G.W, H = G.H;
  const totalDur = 3.0;
  const t = 1 - (G.prestigeTimer / totalDur);
  if (t < 0.4 && G.player) {
    const fishY = H / 2 + (t / 0.4) * (H / 2 + 50);
    ctx.globalAlpha = Math.max(0, 1 - t * 2.5);
    drawFish(W / 2, fishY, G.player.radius, Math.PI / 2, G.player.tier, 0, G.gameTime * 10, true, G.currentZone);
    ctx.globalAlpha = 1;
  }
  ctx.globalAlpha = Math.min(0.85, t * 1.2);
  ctx.fillStyle = '#000010';
  ctx.fillRect(-10, -10, W + 20, H + 20);
  ctx.globalAlpha = Math.min(0.8, t * 2);
  for (let bi = 0; bi < 10; bi++) {
    const bx = W * 0.2 + (bi / 10) * W * 0.6 + Math.sin(G.gameTime * 3 + bi) * 20;
    const by = H - ((G.gameTime * 60 + bi * 80) % (H + 40));
    ctx.fillStyle = 'rgba(150,200,255,0.3)';
    ctx.beginPath();
    ctx.arc(bx, by, 3 + Math.sin(G.gameTime + bi) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (t > 0.4) {
    const textT = (t - 0.4) / 0.3;
    const fullText = `PROFONDEUR ${G.depthLevel + 1}`;
    const visChars = Math.min(fullText.length, Math.ceil(textT * fullText.length));
    ctx.globalAlpha = Math.min(1, textT * 2);
    ctx.fillStyle = '#80e0ff';
    ctx.font = 'bold 48px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00aaff';
    ctx.shadowBlur = 20;
    ctx.fillText(fullText.substring(0, visChars), W / 2, H / 2 - 20);
    ctx.shadowBlur = 0;
  }
  if (t > 0.7) {
    const multT = (t - 0.7) / 0.3;
    const pulse = 1 + 0.15 * Math.sin(multT * Math.PI * 6);
    ctx.globalAlpha = Math.min(1, multT * 3);
    ctx.save();
    ctx.translate(W / 2, H / 2 + 30);
    ctx.scale(pulse, pulse);
    ctx.font = 'bold 64px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 25;
    ctx.fillText(`×${G.depthLevel + 1}`, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// Title screen rendering
export function renderTitle() {
  const W = G.W, H = G.H;
  ctx.save();
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#1a6090');
  bgGrad.addColorStop(0.5, '#0d4070');
  bgGrad.addColorStop(1, '#062848');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 5; i++) {
    const rx = W * (0.15 + i * 0.18);
    const rw = 40 + i * 20;
    const rg = ctx.createLinearGradient(rx, 0, rx, H * 0.7);
    rg.addColorStop(0, '#aaddff');
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(rx - rw / 2, 0);
    ctx.lineTo(rx - rw * 1.5, H * 0.7);
    ctx.lineTo(rx + rw * 1.5, H * 0.7);
    ctx.lineTo(rx + rw / 2, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const b of G.titleBubbles) {
    ctx.globalAlpha = b.life * 0.3;
    ctx.strokeStyle = '#88ccff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const p of G.titlePlancton) drawPlancton(p.x, p.y, p.radius, p.phase, 'surface');
  ctx.restore();
}
