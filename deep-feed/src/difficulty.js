// ============================================================
//  DIFFICULTY — frenzy timer, prestige, wave oscillation
// ============================================================

import G from './state.js';
import {
  TIER_COUNT, TIER_RADIUS, TIERUP_SLOWMO_DURATION, TIERUP_FREEZE_DURATION,
  OXYGEN_MAX, OXYGEN_DRAIN_RATE, OXYGEN_DEPTH_DRAIN_MULT, SHAKE_DECAY,
  CAMERA_ZOOM_T4, CAMERA_ZOOM_T5, BOOST_MAX, TAIL_FLICK_COOLDOWN,
  PRESTIGE_EXTRA_EATS,
} from './constants.js';
import { playPrestige, haptic, stopFestinDrone, playGameOver } from './audio.js';
import { spawnFloatingText } from './particles.js';
import { getZoneForTier } from './zones.js';
import { createFish } from './fishAI.js';
import { createPlayer, revealOxygenBar } from './player.js';
import { triggerDeathAnim } from './collisions.js';

export function triggerPrestige() {
  G.inPrestige = true;
  G.prestigeTimer = 3.0;
  playPrestige();
  haptic([50, 30, 50, 30, 100]);
  stopFestinDrone();
  const prestigeFlashEl = document.getElementById('prestige-flash');
  if (prestigeFlashEl) {
    prestigeFlashEl.style.opacity = '0.8';
    setTimeout(() => { prestigeFlashEl.style.opacity = '0'; }, 300);
  }
}

export function completePrestige() {
  G.inPrestige = false;
  G.depthLevel++;
  G.maxDepthReached = Math.max(G.maxDepthReached, G.depthLevel);
  G.scoreMultiplier = G.depthLevel;
  G.prestigeEats = 0;

  G.oxygen = OXYGEN_MAX;
  G.player.tier = 1;
  G.player.eaten = 0;
  G.player.radius = TIER_RADIUS[1] * G.radiusScale;
  G.player.targetRadius = G.player.radius;
  G.player.invincible = 2;
  G.graceTimer = 3;

  G.fishes = [];
  G.jellyfish = [];
  G.ambushFish = [];
  G.reefCurrents = [];
  const planctonCount = 12 + Math.floor(Math.random() * 6);
  for (let i = 0; i < planctonCount; i++) G.fishes.push(createFish(0, false, true));
  const fryCount = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < fryCount; i++) G.fishes.push(createFish(1, true));

  G.currentZone = 'surface';
  spawnFloatingText(G.W / 2, G.H / 2 - 30, `PROFONDEUR ${G.depthLevel}`, '#ffcc00', true);
  spawnFloatingText(G.W / 2, G.H / 2 + 10, `Score x${G.scoreMultiplier}`, '#80e0ff', true);
  G.shakeIntensity = 15;
}

export function updateDifficulty(dt, effectiveDt) {
  // --- Tier-up freeze + slow-mo ---
  if (G.tierUpFreezeTimer > 0) {
    G.tierUpFreezeTimer -= dt;
    G.slowmoScale = 0;
    if (G.tierUpFreezeTimer <= 0) {
      G.tierUpSlowmoTimer = TIERUP_SLOWMO_DURATION;
    }
  } else if (G.tierUpSlowmoTimer > 0) {
    G.tierUpSlowmoTimer -= dt;
    const progress = Math.min(1, 1 - (G.tierUpSlowmoTimer / TIERUP_SLOWMO_DURATION));
    G.slowmoScale = 1 - 0.7 * Math.sin(Math.PI * progress);
    if (G.tierUpSlowmoTimer <= 0 && !G.frenzyActive) G.slowmoScale = 1;
  }

  // --- Tier-up size lerp ---
  if (G.tierUpSizeLerpTimer > 0) {
    G.tierUpSizeLerpTimer = Math.max(0, G.tierUpSizeLerpTimer - dt);
    const t = 1 - (G.tierUpSizeLerpTimer / 0.3);
    const ease = 1 - Math.pow(1 - t, 3);
    G.player.radius = G.tierUpSizeLerpFrom + (G.player.targetRadius - G.tierUpSizeLerpFrom) * ease;
    if (G.tierUpSizeLerpTimer <= 0) G.player.radius = G.player.targetRadius;
  }

  // --- Frenzy timer ---
  if (G.frenzyActive) {
    G.frenzyTimer -= dt;
    if (G.frenzyTimer < 3.5 && G.tierUpSlowmoTimer <= 0) G.slowmoScale = 1;
    G.saturationFlash = Math.max(0.6, G.saturationFlash);
    if (G.frenzyTimer <= 0) {
      G.frenzyActive = false;
      G.slowmoScale = 1;
      G.saturationFlash = 0;
      stopFestinDrone();
      if (G.festinPointsAccum > 0) {
        spawnFloatingText(G.W / 2, G.H / 3, `FESTIN +${G.festinPointsAccum} pts !`, '#ffd700', true, 38);
      }
    }
  }
  if (G.saturationFlash > 0 && !G.frenzyActive) {
    G.saturationFlash = Math.max(0, G.saturationFlash - dt * 3);
  }

  // --- Grace period ---
  if (G.graceTimer > 0) G.graceTimer = Math.max(0, G.graceTimer - dt);

  // --- Tier-up flash ---
  if (G.tierUpFlashTimer > 0) G.tierUpFlashTimer = Math.max(0, G.tierUpFlashTimer - dt);

  // --- Tier-up ring (legacy) ---
  if (G.tierUpRingAlpha > 0) {
    G.tierUpRingRadius += dt * 300;
    G.tierUpRingAlpha = Math.max(0, G.tierUpRingAlpha - dt * 1.4);
  }

  // --- 3-ring tier-up ---
  for (let i = 0; i < 3; i++) {
    const ring = G.tierUpRings[i];
    if (ring.alpha <= 0) continue;
    ring.age += dt;
    if (ring.age > ring.delay) {
      ring.radius += dt * 300;
      ring.alpha = Math.max(0, ring.alpha - dt * 1.0);
    }
  }

  // --- Tier-up zoom ---
  if (G.tierUpZoomTimer > 0) {
    G.tierUpZoomTimer -= dt;
    const zt = 1 - (G.tierUpZoomTimer / 1.0);
    G.tierUpZoomScale = zt < 0.3 ? 1 - (zt / 0.3) * 0.08 : 0.92 + ((zt - 0.3) / 0.7) * 0.08;
    if (G.tierUpZoomTimer <= 0) G.tierUpZoomScale = 1;
  }

  // --- Tier-up text ---
  if (G.tierUpTextTimer > 0) {
    G.tierUpTextTimer -= dt;
    const tt = 1 - (G.tierUpTextTimer / 1.5);
    if (tt < 0.12) G.tierUpTextScale = 0.5 + (tt / 0.12) * 0.65;
    else if (tt < 0.25) G.tierUpTextScale = 1.15 - ((tt - 0.12) / 0.13) * 0.15;
    else G.tierUpTextScale = 1;
    G.tierUpTextY = -tt * 40;
    G.tierUpTextAlpha = tt > 0.6 ? 1 - ((tt - 0.6) / 0.4) : 1;
    if (G.tierUpTextTimer <= 0) { G.tierUpTextScale = 0; G.tierUpTextAlpha = 0; }
  }

  // --- Combo ---
  if (G.comboTimer > 0) {
    G.comboTimer -= effectiveDt;
    if (G.comboTimer <= 0) { G.comboCount = 0; G.comboPitch = 1; }
  }
  if (G.comboPulseScale > 1) G.comboPulseScale = Math.max(1, G.comboPulseScale - effectiveDt * 3);

  // --- Zone wave ---
  if (G.zoneWaveY >= 0) {
    G.zoneWaveY += dt * (G.H / 0.8);
    if (G.zoneWaveY > G.H + 50) G.zoneWaveY = -1;
  }

  // --- Zone slow-mo ---
  if (G.zoneSlowmoTimer > 0) {
    G.zoneSlowmoTimer -= dt;
    if (G.zoneSlowmoTimer <= 0 && G.tierUpSlowmoTimer <= 0 && !G.frenzyActive) G.slowmoScale = 1;
  }

  // --- Highscore pulse ---
  if (G.highscorePulseTimer > 0) {
    G.highscorePulseTimer -= dt;
    const el = document.getElementById('highscore');
    if (el) {
      el.style.color = '#ffd700';
      el.style.textShadow = '0 0 10px rgba(255,200,0,.5)';
      if (G.highscorePulseTimer <= 0) { el.style.color = ''; el.style.textShadow = ''; }
    }
  }

  // --- Adaptive danger ---
  G.timeSinceLastHit += dt;
  G.difficultyWave = 0.6 + 0.4 * Math.sin(G.gameTime * 0.2);

  // --- Zone transition text ---
  if (G.zoneTransitionTimer > 0) {
    G.zoneTransitionTimer -= dt;
    if (G.zoneTransitionTimer <= 0) {
      const el = document.getElementById('zone-text');
      if (el) el.classList.remove('visible');
    }
  }

  // --- Prestige ---
  if (G.inPrestige) {
    G.prestigeTimer -= dt;
    if (G.prestigeTimer <= 0) completePrestige();
    return true; // freeze game
  }

  // --- Prestige trigger from collisions ---
  if (G._triggerPrestige) {
    G._triggerPrestige = false;
    triggerPrestige();
  }

  // --- Zone update ---
  G.currentZone = getZoneForTier(G.player.tier);
  G.maxTierReached = Math.max(G.maxTierReached, G.player.tier);

  // --- Stun/slow ---
  if (G.playerStunTimer > 0) G.playerStunTimer = Math.max(0, G.playerStunTimer - effectiveDt);
  if (G.playerSlowTimer > 0) G.playerSlowTimer = Math.max(0, G.playerSlowTimer - effectiveDt);

  // --- Tail flick cooldown ---
  if (G.tailFlickCooldown > 0) {
    G.tailFlickCooldown -= effectiveDt;
    G.joystick.cooldownIndicator = Math.max(0, G.tailFlickCooldown / TAIL_FLICK_COOLDOWN);
  }
  if (G.tailFlickActive) {
    G.tailFlickTimer -= effectiveDt;
    if (G.tailFlickTimer <= 0) G.tailFlickActive = false;
  }
  if (G.tailFlickSquash > 0) G.tailFlickSquash = Math.max(0, G.tailFlickSquash - effectiveDt * 10);

  // --- Joystick elastic release ---
  if (G.joystick.releaseAnimT > 0) G.joystick.releaseAnimT = Math.max(0, G.joystick.releaseAnimT - effectiveDt * 5);
  G.joystick.ripplePhase += effectiveDt * 3;

  // --- Camera zoom ---
  if (G.player.tier >= 5) G.cameraZoomTarget = CAMERA_ZOOM_T5;
  else if (G.player.tier >= 4) G.cameraZoomTarget = CAMERA_ZOOM_T4;
  else G.cameraZoomTarget = 1;
  G.cameraZoom += (G.cameraZoomTarget - G.cameraZoom) * Math.min(1, effectiveDt * 2);

  // --- Player scale bump ---
  if (G.playerScaleBump > 0) G.playerScaleBump = Math.max(0, G.playerScaleBump - effectiveDt * 1.0);

  // --- Oxygen ---
  if (G.depthLevel >= 2) {
    const oxygenDrain = OXYGEN_DRAIN_RATE * (1 + (G.depthLevel - 1) * OXYGEN_DEPTH_DRAIN_MULT);
    G.oxygen = Math.max(0, G.oxygen - oxygenDrain * effectiveDt);
    const oxygenBarEl = document.getElementById('oxygen-bar');
    if (oxygenBarEl) oxygenBarEl.style.width = (G.oxygen / OXYGEN_MAX * 100) + '%';
    if (G.oxygen < OXYGEN_MAX * 0.92 && !G.hasEverLowOxygen) { G.hasEverLowOxygen = true; revealOxygenBar(); }
    if (G.oxygen <= 0) {
      G.deathReason = 'oxygen';
      G.deathImpactAngle = Math.PI / 2;
      triggerDeathAnim();
      return true;
    }
  } else {
    G.oxygen = OXYGEN_MAX;
  }

  // --- Shake ---
  if (G.shakeIntensity > 0.5) {
    G.shakeX = (Math.random() - 0.5) * G.shakeIntensity;
    G.shakeY = (Math.random() - 0.5) * G.shakeIntensity;
    G.shakeIntensity *= SHAKE_DECAY;
  } else {
    G.shakeX = G.shakeY = 0;
    G.shakeIntensity = 0;
  }

  // --- Same-tier bump tooltip ---
  if (G.sameTierBumpTooltip.active) {
    G.sameTierBumpTooltip.timer -= dt;
    if (G.sameTierBumpTooltip.timer <= 0) G.sameTierBumpTooltip.active = false;
  }

  return false;
}
