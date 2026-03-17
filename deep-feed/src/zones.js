// ============================================================
//  ZONE HELPERS & DECOR
// ============================================================

import G from './state.js';
import { TIER_COLORS, ZONE_PALETTES, ZONE_DISPLAY_NAMES } from './constants.js';
import { playZoneSound } from './audio.js';

export function getZoneForTier(tier) {
  if (tier <= 2) return 'surface';
  if (tier === 3) return 'reef';
  if (tier === 4) return 'twilight';
  return 'abyss';
}

export function getZonePalette(zone) {
  return ZONE_PALETTES[zone] || ZONE_PALETTES.surface;
}

export function getFishColors(tier, zone) {
  const palette = getZonePalette(zone);
  return palette[tier] || TIER_COLORS[tier];
}

export function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
}

export function generateZoneDecor() {
  const W = G.W, H = G.H;
  G.zoneDecor = {
    surface: { wavePoints: 20 },
    reef: { corals: [], anemones: [] },
    twilight: { snow: [], algae: [] },
    abyss: { lights: [], vents: [] },
  };
  // Reef corals
  for (let i = 0; i < 14; i++) {
    const colors = ['#ff6644','#ff8866','#ffaa44','#ff4488','#cc66aa','#44ccaa'];
    G.zoneDecor.reef.corals.push({
      x: (W / 14) * i + Math.random() * (W / 14),
      type: Math.floor(Math.random() * 3),
      h: 25 + Math.random() * 55,
      w: 12 + Math.random() * 22,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  // Reef anemones
  for (let i = 0; i < 6; i++) {
    G.zoneDecor.reef.anemones.push({
      x: 40 + Math.random() * (W - 80),
      y: H - 10 - Math.random() * 20,
      tentacles: 5 + Math.floor(Math.random() * 4),
      len: 20 + Math.random() * 25,
      color: ['#ff66aa','#ff88cc','#aa44ff','#66ddaa'][Math.floor(Math.random() * 4)],
    });
  }
  // Twilight marine snow
  for (let i = 0; i < 30; i++) {
    G.zoneDecor.twilight.snow.push({
      x: Math.random() * W, y: Math.random() * H,
      speed: 0.2 + Math.random() * 0.4,
      size: 1 + Math.random() * 2,
      drift: Math.random() * Math.PI * 2,
    });
  }
  // Twilight algae
  for (let i = 0; i < 8; i++) {
    G.zoneDecor.twilight.algae.push({
      x: 30 + Math.random() * (W - 60),
      h: 60 + Math.random() * 100,
      w: 4 + Math.random() * 6,
    });
  }
  // Abyss bioluminescent lights
  for (let i = 0; i < 20; i++) {
    G.zoneDecor.abyss.lights.push({
      x: Math.random() * W, y: Math.random() * H,
      color: ['#00ffcc','#ff00ff','#4488ff','#ffff00','#00aaff'][Math.floor(Math.random() * 5)],
      phase: Math.random() * Math.PI * 2,
      size: 1.5 + Math.random() * 2.5,
    });
  }
  // Abyss hydrothermal vents
  for (let i = 0; i < 3; i++) {
    G.zoneDecor.abyss.vents.push({
      x: W * (0.2 + i * 0.3) + (Math.random() - 0.5) * W * 0.1,
      w: 20 + Math.random() * 30,
      h: 40 + Math.random() * 60,
    });
  }
}

export function triggerZoneTransition(zone) {
  const zoneTextEl = document.getElementById('zone-text');
  if (!zoneTextEl) return;
  G.zoneTransitionName = ZONE_DISPLAY_NAMES[zone] || zone;
  zoneTextEl.textContent = G.zoneTransitionName;
  zoneTextEl.classList.add('visible');
  G.zoneTransitionTimer = 2.5;
  playZoneSound(zone);
  G.zoneWaveY = 0;
  G.zoneWaveColor = zone === 'reef' ? '#44ddbb' : zone === 'twilight' ? '#5566aa' : zone === 'abyss' ? '#223355' : '#88ccff';
  G.zoneSlowmoTimer = 0.5;
  if (G.tierUpSlowmoTimer <= 0) G.slowmoScale = 0.5;
}

export function updateReefCurrents(effectiveDt) {
  if (G.currentZone !== 'reef') { G.reefCurrents = []; return; }
  const W = G.W, H = G.H;
  if (G.reefCurrents.length < 3 && Math.random() < effectiveDt * 0.5) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    G.reefCurrents.push({
      x: dir > 0 ? -50 : W + 50,
      y: H * (0.2 + Math.random() * 0.6),
      dir, speed: 1.5 + Math.random() * 1.5,
      width: 150 + Math.random() * 200,
      life: 1,
      particles: [], // animated particle streams
    });
  }
  for (let i = G.reefCurrents.length - 1; i >= 0; i--) {
    const c = G.reefCurrents[i];
    c.x += c.dir * c.speed * 60 * effectiveDt;

    // Spawn current particles for visibility
    if (Math.random() < effectiveDt * 8) {
      c.particles.push({
        x: c.x + (Math.random() - 0.5) * c.width,
        y: c.y + (Math.random() - 0.5) * 100,
        life: 1,
        size: 1 + Math.random() * 2,
      });
    }
    // Update current particles
    for (let j = c.particles.length - 1; j >= 0; j--) {
      const cp = c.particles[j];
      cp.x += c.dir * c.speed * 1.5 * 60 * effectiveDt;
      cp.life -= effectiveDt * 1.5;
      if (cp.life <= 0) c.particles.splice(j, 1);
    }

    // Push player
    const inBandY = Math.abs(G.player.y - c.y) < 80;
    const inBandX = G.player.x > c.x - c.width / 2 && G.player.x < c.x + c.width / 2;
    if (inBandY && inBandX) {
      G.player.x += c.dir * c.speed * 0.7 * 60 * effectiveDt;
      const playerDirX = Math.cos(G.player.angle);
      const alignment = playerDirX * c.dir;
      if (alignment > 0.3) {
        G.player.x += c.dir * c.speed * 0.3 * 60 * effectiveDt;
      }
    }
    // Push fish
    for (const f of G.fishes) {
      if (f.tier === 0) continue;
      const fInY = Math.abs(f.y - c.y) < 80;
      const fInX = f.x > c.x - c.width / 2 && f.x < c.x + c.width / 2;
      if (fInY && fInX) {
        f.x += c.dir * c.speed * 0.5 * 60 * effectiveDt;
      }
    }
    if ((c.dir > 0 && c.x > W + c.width) || (c.dir < 0 && c.x < -c.width)) {
      G.reefCurrents.splice(i, 1);
    }
  }
}

export function updateAmbushFish(effectiveDt) {
  if (G.currentZone !== 'abyss') { G.ambushFish = []; return; }
  const W = G.W, H = G.H;
  const player = G.player;
  const { TIER_COUNT, TIER_RADIUS, PREDATOR_CHASE_SPEED_RATIO, PLAYER_BASE_SPEED } =
    await_constants();

  if (G.ambushFish.length < 4 && Math.random() < effectiveDt * 0.25) {
    let ax, ay;
    do {
      ax = 60 + Math.random() * (W - 120);
      ay = 60 + Math.random() * (H - 120);
    } while (Math.sqrt((ax - player.x) ** 2 + (ay - player.y) ** 2) < 250);
    const ambushTier = Math.min(5, player.tier + 1);
    G.ambushFish.push({
      x: ax, y: ay,
      tier: ambushTier,
      radius: TIER_RADIUS[ambushTier] * G.radiusScale,
      angle: Math.random() * Math.PI * 2,
      tailPhase: Math.random() * Math.PI * 2,
      mouthOpen: 0,
      activated: false,
      warning: false,
      warningTimer: 0,
      opacity: 0.06,
      life: 15 + Math.random() * 10,
    });
  }

  for (let i = G.ambushFish.length - 1; i >= 0; i--) {
    const a = G.ambushFish[i];
    a.tailPhase += effectiveDt * 4;
    a.life -= effectiveDt;
    if (a.life <= 0) { G.ambushFish.splice(i, 1); continue; }
    const dToPlayer = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
    if (!a.activated && !a.warning && dToPlayer < 150) {
      a.warning = true;
      a.warningTimer = 0.3;
    }
    if (a.warning && !a.activated) {
      a.warningTimer -= effectiveDt;
      a.opacity = 0.06 + 0.3 * Math.abs(Math.sin(G.gameTime * 20));
      if (a.warningTimer <= 0) {
        a.activated = true;
        G.shakeIntensity = Math.max(G.shakeIntensity, 5);
      }
    }
    if (a.activated) {
      a.opacity = Math.min(1, a.opacity + effectiveDt * 3);
      const chaseAngle = Math.atan2(player.y - a.y, player.x - a.x);
      let ad = chaseAngle - a.angle;
      while (ad > Math.PI) ad -= Math.PI * 2;
      while (ad < -Math.PI) ad += Math.PI * 2;
      a.angle += ad * Math.min(1, effectiveDt * 5);
      const aSpd = PREDATOR_CHASE_SPEED_RATIO * PLAYER_BASE_SPEED * 0.9 * 60 * effectiveDt;
      a.x += Math.cos(a.angle) * aSpd;
      a.y += Math.sin(a.angle) * aSpd;
      if (a.x < -80 || a.x > W + 80 || a.y < -80 || a.y > H + 80) {
        G.ambushFish.splice(i, 1);
      }
    }
  }
}

// Inline constants helper (avoids circular import)
function await_constants() {
  return { TIER_COUNT: 6, TIER_RADIUS: [8, 12, 18, 26, 36, 48], PREDATOR_CHASE_SPEED_RATIO: 0.70, PLAYER_BASE_SPEED: 4.5 };
}
