// ============================================================
//  COLLISIONS — damagePlayer(), handleCollisions()
// ============================================================

import G from './state.js';
import {
  TIER_COUNT, TIER_RADIUS, TIER_NAMES, TIER_THRESHOLDS, TIER_POINTS,
  PRESTIGE_EXTRA_EATS, EAT_FEEDBACK, SCORE_MILESTONES, MAX_PARTICLES,
  OXYGEN_REFILL_PER_TIER, TIERUP_FREEZE_DURATION,
} from './constants.js';
import {
  haptic, playEat, playHurt, playBonk, playMilestone, playTierUp,
  startFestinDrone, stopFestinDrone, playFrenzy, playDeathDramatic,
} from './audio.js';
import { spawnEatParticles, spawnBubble, spawnFloatingText } from './particles.js';
import { getFishColors, getZoneForTier, triggerZoneTransition } from './zones.js';
import { revealSizeBar, revealBoostBar } from './player.js';

// ---- Consolidated damage function ----
// Replaces 3 copy-pasted blocks (predator, jellyfish, ambush)
export function damagePlayer(attackerX, attackerY, opts = {}) {
  const player = G.player;
  const {
    eatenPenalty = 'reset',  // 'reset' or number to subtract
    slowDuration = 0,        // jellyfish slow
    particleColor = '#ff4444',
    removeIndex = -1,        // index in ambushFish to remove
  } = opts;

  player.invincible = 1.5;

  if (eatenPenalty === 'reset') {
    player.eaten = 0;
  } else {
    player.eaten = Math.max(0, player.eaten - eatenPenalty);
  }

  if (slowDuration > 0) {
    G.playerSlowTimer = slowDuration;
  }

  G.timeSinceLastHit = 0;
  G.adaptiveDangerSpawned = false;

  // Death check
  if (player.tier <= 1) {
    G.deathImpactAngle = Math.atan2(player.y - attackerY, player.x - attackerX);
    triggerDeathAnim();
    if (removeIndex >= 0) G.ambushFish.splice(removeIndex, 1);
    return true; // player died
  }

  // Tier down
  player.tier--;
  player.radius = TIER_RADIUS[player.tier] * G.radiusScale;
  player.targetRadius = player.radius;
  G.shakeIntensity = 12;
  spawnEatParticles(player.x, player.y, particleColor, 15);

  // Knockback
  const kAngle = Math.atan2(player.y - attackerY, player.x - attackerX);
  player.x += Math.cos(kAngle) * 40;
  player.y += Math.sin(kAngle) * 40;

  haptic(50);
  playHurt();
  const vignetteEl = document.getElementById('vignette');
  if (vignetteEl) {
    vignetteEl.style.opacity = '1';
    setTimeout(() => vignetteEl.style.opacity = '0', 200);
  }

  if (removeIndex >= 0) G.ambushFish.splice(removeIndex, 1);
  return false; // survived
}

// ---- Death animation ----
export function triggerDeathAnim() {
  G.deathAnimActive = true;
  G.deathAnimTimer = 1.2; // extended for dramatic camera zoom
  G.deathZoomTimer = 1.2;
  G.deathSkeletonAlpha = 0;
  G.slowmoScale = 0.15; // more dramatic slow-mo
  G.shakeIntensity = 15;
  haptic([30, 20, 60]);
  playDeathDramatic();
  stopFestinDrone();

  // Fish-shaped disintegration particles
  const player = G.player;
  if (player) {
    const c = getFishColors(player.tier, G.currentZone);
    const bodyLen = player.radius * 2.2;
    const bodyH = player.radius * 1.1;
    const cosA = Math.cos(player.angle);
    const sinA = Math.sin(player.angle);
    for (let i = 0; i < 40 && G.particles.length < MAX_PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2;
      const rx = bodyLen * 0.45 * Math.cos(a);
      const ry = bodyH * Math.sin(a);
      const px = player.x + rx * cosA - ry * sinA;
      const py = player.y + rx * sinA + ry * cosA;
      const pAngle = Math.atan2(py - player.y, px - player.x) + (Math.random() - 0.5) * 0.5;
      const speed = 1 + Math.random() * 2;
      G.particles.push({
        x: px, y: py,
        vx: Math.cos(pAngle) * speed,
        vy: Math.sin(pAngle) * speed,
        life: 1, decay: 0.008 + Math.random() * 0.008,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.4 ? c.body : '#ff4444',
        magnetic: false, magnetTimer: 0,
      });
    }
    // Bone-like white particles for skeleton effect
    for (let i = 0; i < 12 && G.particles.length < MAX_PARTICLES; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1;
      G.particles.push({
        x: player.x, y: player.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 1, decay: 0.006,
        size: 1 + Math.random() * 2,
        color: '#ffffff',
        magnetic: false, magnetTimer: 0,
      });
    }
  }
  const vignetteEl = document.getElementById('vignette');
  if (vignetteEl) vignetteEl.style.opacity = '1';
}

// ---- Frenzy check ----
function checkFrenzy() {
  const now = G.gameTime;
  while (G.recentEats.length > 0 && now - G.recentEats[0] > 3.0) {
    G.recentEats.shift();
  }
  if (G.recentEats.length >= 5 && !G.frenzyActive) {
    G.frenzyActive = true;
    G.frenzyTimer = 4;
    G.frenzyCount = G.recentEats.length;
    G.bestFrenzy = Math.max(G.bestFrenzy, G.frenzyCount);
    G.festinPointsAccum = 0;
    G.slowmoScale = 0.3;
    G.saturationFlash = 1;
    playFrenzy();
    startFestinDrone();
    haptic([20, 10, 20, 10, 40]);
    if (!G.firstFestinTriggered) {
      G.firstFestinTriggered = true;
      spawnFloatingText(G.W / 2, G.H / 3, 'FESTIN !', '#ffd700', true, 42);
      spawnFloatingText(G.W / 2, G.H / 3 + 36, 'Mange vite pour doubler !', '#ffd700', true, 22);
    } else {
      spawnFloatingText(G.W / 2, G.H / 3, `FESTIN ×${G.frenzyCount}`, '#ffd700', true, 42);
    }
    G.shakeIntensity = 10;
    G.recentEats = [];
  }
}

// ---- Player-fish collisions ----
export function handleCollisions() {
  const player = G.player;
  if (!player || !player.alive || G.deathAnimActive) return;

  for (let i = G.fishes.length - 1; i >= 0; i--) {
    const f = G.fishes[i];
    if (!f.alive) continue;

    const dx = player.x - f.x, dy = player.y - f.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const eatOverlap = f.tier === 0 ? 0.9 : 0.8;
    const canEat = f.tier < player.tier && dist < (player.radius + f.radius) * eatOverlap;
    const canHurt = f.tier > player.tier && dist < (player.radius + f.radius) * 0.55;
    const canBump = f.tier === player.tier && dist < (player.radius + f.radius) * 0.65;

    if (!canEat && !canHurt && !canBump) continue;

    if (canEat) {
      handleEat(f, i);
    } else if (canBump && player.invincible <= 0) {
      handleBump(f);
    } else if (canHurt && player.invincible <= 0) {
      if (damagePlayer(f.x, f.y)) return; // died
    }
  }

  // --- Jellyfish collisions ---
  if (G.currentZone === 'twilight' || G.currentZone === 'abyss') {
    for (const j of G.jellyfish) {
      if (player.invincible > 0) continue;
      const jdx = player.x - j.x, jdy = player.y - j.y;
      const jdist = Math.sqrt(jdx * jdx + jdy * jdy);
      if (jdist < player.radius + j.radius * 0.6) {
        if (damagePlayer(j.x, j.y, { eatenPenalty: 2, slowDuration: 0.5, particleColor: '#bb55ff' })) return;
      }
    }
  }

  // --- Ambush fish collisions ---
  for (let i = G.ambushFish.length - 1; i >= 0; i--) {
    const a = G.ambushFish[i];
    if (!a.activated || player.invincible > 0) continue;
    const dToPlayer = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
    if (dToPlayer < (player.radius + a.radius) * 0.55) {
      if (damagePlayer(a.x, a.y, { removeIndex: i })) return;
    }
  }
}

function handleEat(f, fishIndex) {
  const player = G.player;
  f.alive = false;

  if (!G.hasEverEaten) { G.hasEverEaten = true; revealSizeBar(); }

  // Combo
  if (G.comboTimer > 0) { G.comboCount++; } else { G.comboCount = 1; }
  G.comboTimer = 2;
  G.comboPulseScale = 1.4;
  G.comboPitch = 1 + (G.comboCount - 1) * 0.1;

  // Score
  let pointValue = TIER_POINTS[f.tier] || 1;
  if (G.frenzyActive) pointValue *= 2;
  pointValue *= G.scoreMultiplier;
  G.score += pointValue;
  if (G.frenzyActive) G.festinPointsAccum += pointValue;
  G.totalFishEaten++;
  G.fishEatenByTier[f.tier]++;
  player.totalEaten++;
  player.eaten++;
  player.mouthOpen = 1;

  // Oxygen
  G.oxygen = Math.min(100, G.oxygen + (OXYGEN_REFILL_PER_TIER[f.tier] || 5));

  // Frenzy tracking
  G.recentEats.push(G.gameTime);
  checkFrenzy();

  // Feedback
  const fb = EAT_FEEDBACK[Math.min(f.tier, EAT_FEEDBACK.length - 1)];
  const isMagnetic = f.tier >= 2;
  spawnEatParticles(f.x, f.y, getFishColors(f.tier, G.currentZone).body, fb.particles, isMagnetic);
  if (f.tier > 0) spawnBubble(f.x, f.y);
  G.shakeIntensity = Math.max(G.shakeIntensity, fb.shake);
  G.playerScaleBump = fb.scaleBump;

  const scoreText = G.frenzyActive ? `+${pointValue}!` : `+${pointValue}`;
  spawnFloatingText(f.x, f.y, scoreText,
    G.frenzyActive ? '#ffd700' : getFishColors(f.tier, G.currentZone).body,
    pointValue >= 10, fb.textSize);

  haptic(fb.haptic);
  playEat(G.comboPitch);

  // Milestones
  while (G.nextMilestoneIdx < SCORE_MILESTONES.length && G.score >= SCORE_MILESTONES[G.nextMilestoneIdx]) {
    playMilestone();
    spawnFloatingText(G.W / 2, G.H / 4, `${SCORE_MILESTONES[G.nextMilestoneIdx]} !`, '#80e0ff', true, 28);
    G.nextMilestoneIdx++;
  }

  // In-game record
  if (!G.inGameRecordBeaten && G.highScore > 0 && G.score > G.highScore) {
    G.inGameRecordBeaten = true;
    spawnFloatingText(G.W / 2, G.H / 4, 'NOUVEAU RECORD !', '#ffd700', true, 36);
    G.highscorePulseTimer = 2;
    playMilestone();
    haptic([20, 10, 30]);
  }

  // Tier-up check
  if (player.tier < TIER_COUNT - 1 && player.eaten >= TIER_THRESHOLDS[player.tier]) {
    handleTierUp(f);
  } else if (player.tier === TIER_COUNT - 1) {
    G.prestigeEats++;
    if (G.prestigeEats >= PRESTIGE_EXTRA_EATS) {
      // Prestige is triggered from difficulty.js
      G._triggerPrestige = true;
    }
  }

  // Post-eat predator push
  for (const pf of G.fishes) {
    if (!pf.alive || pf.tier <= player.tier) continue;
    const pdx = pf.x - player.x, pdy = pf.y - player.y;
    const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
    if (pdist < 120 && pdist > 0) {
      pf.x += (pdx / pdist) * 30;
      pf.y += (pdy / pdist) * 30;
    }
  }
}

function handleTierUp(eatenFish) {
  const player = G.player;
  const oldTier = player.tier;
  const oldTierColor = getFishColors(oldTier, G.currentZone).body;
  player.tier++;
  player.eaten = 0;
  G.hasFirstTierUp = true;
  player.targetRadius = TIER_RADIUS[player.tier] * G.radiusScale;
  G.maxTierReached = Math.max(G.maxTierReached, player.tier);
  const newTierColor = getFishColors(player.tier, getZoneForTier(player.tier)).body;

  // Shockwave rings
  G.tierUpRings[0] = { radius: player.radius, alpha: 0.8, color: '#ffffff', age: 0, delay: 0 };
  G.tierUpRings[1] = { radius: player.radius, alpha: 0.7, color: oldTierColor, age: 0, delay: 0.1 };
  G.tierUpRings[2] = { radius: player.radius, alpha: 0.6, color: newTierColor, age: 0, delay: 0.2 };
  G.tierUpRingColor = newTierColor;
  G.tierUpRingRadius = player.radius;
  G.tierUpRingAlpha = 0.7;

  playTierUp();
  G.tierUpFreezeTimer = TIERUP_FREEZE_DURATION;
  G.tierUpSizeLerpTimer = 0.3;
  G.tierUpSizeLerpFrom = player.radius;
  G.tierUpFlashTimer = 0.3;

  spawnEatParticles(player.x, player.y, oldTierColor, 25, false, 2, 10);
  spawnEatParticles(player.x, player.y, newTierColor, 25, false, 2, 10);

  G.tierUpZoomTimer = 1.0;
  G.tierUpTextTimer = 1.5;
  G.tierUpTextName = TIER_NAMES[player.tier];
  G.tierUpTextColor = newTierColor;
  G.tierUpTextAlpha = 1;
  G.tierUpTextY = 0;

  haptic([30, 15, 30, 15, 50, 20, 80]);
  G.shakeIntensity = 15;
  G.graceTimer = 3;

  const newZone = getZoneForTier(player.tier);
  if (newZone !== G.currentZone) {
    triggerZoneTransition(newZone);
  }
}

function handleBump(f) {
  const player = G.player;
  const bumpAngle = Math.atan2(player.y - f.y, player.x - f.x);
  player.x += Math.cos(bumpAngle) * 30;
  player.y += Math.sin(bumpAngle) * 30;
  f.x -= Math.cos(bumpAngle) * 30;
  f.y -= Math.sin(bumpAngle) * 30;
  G.playerStunTimer = 0.4;
  player.invincible = 0.5;
  G.timeSinceLastHit = 0;
  G.adaptiveDangerSpawned = false;
  G.shakeIntensity = Math.max(G.shakeIntensity, 5);
  haptic(15);
  playBonk();

  // Yellow flash on both fish
  G.sameTierBumpTooltip.active = true;
  G.sameTierBumpTooltip.x = (player.x + f.x) / 2;
  G.sameTierBumpTooltip.y = (player.y + f.y) / 2;
  G.sameTierBumpTooltip.timer = 2.0;
  if (!G.sameTierBumpShown) {
    G.sameTierBumpShown = true;
    G.sameTierBumpTooltip.text = 'Même taille ! Pas mangeable';
  } else {
    G.sameTierBumpTooltip.text = '';
  }
}
