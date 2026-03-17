// ============================================================
//  FISH CREATION & AI
// ============================================================

import G from './state.js';
import {
  TIER_COUNT, TIER_RADIUS, ENEMY_SPEED, PRESTIGE_SPEED_BUFF,
  DESKTOP_PREDATOR_BUFF, PREDATOR_DETECT_RANGE, PREDATOR_CHASE_SPEED_RATIO,
  PREDATOR_DEPTH_DETECT_BONUS, PLAYER_BASE_SPEED, TIER_THRESHOLDS,
  PRESTIGE_EXTRA_EATS, MAX_CHASERS, MAX_FISH, PLANCTON_TARGET_COUNT, MIN_VISIBLE,
} from './constants.js';
import { spawnEatParticles, spawnBubble } from './particles.js';
import { getFishColors } from './zones.js';

export function createFish(tier, forceEdge, scatterOnScreen) {
  const W = G.W, H = G.H;
  const r = TIER_RADIUS[tier] * G.radiusScale * (0.85 + Math.random() * 0.3);
  let x, y, angle;

  if (scatterOnScreen) {
    x = r + Math.random() * (W - r * 2);
    y = r + Math.random() * (H - r * 2);
    angle = Math.random() * Math.PI * 2;
  } else if (forceEdge || !G.player) {
    const side = Math.floor(Math.random() * 4);
    const margin = r * 2;
    switch (side) {
      case 0: x = -margin; y = Math.random() * H; break;
      case 1: x = W + margin; y = Math.random() * H; break;
      case 2: x = Math.random() * W; y = -margin; break;
      case 3: x = Math.random() * W; y = H + margin; break;
    }
    const tx = W * (0.2 + Math.random() * 0.6);
    const ty = H * (0.2 + Math.random() * 0.6);
    angle = Math.atan2(ty - y, tx - x);
  } else {
    x = Math.random() * W;
    y = Math.random() * H;
    angle = Math.random() * Math.PI * 2;
  }

  const depthSpeedMult = 1 + (G.depthLevel - 1) * PRESTIGE_SPEED_BUFF;
  const desktopBuff = (!G.isTouch && tier > 0) ? DESKTOP_PREDATOR_BUFF : 1;
  const baseSpeed = (1.2 + Math.random() * 0.8) * ENEMY_SPEED[tier] * depthSpeedMult * desktopBuff;

  return {
    x, y, angle,
    radius: r, tier, speed: baseSpeed,
    tailPhase: Math.random() * Math.PI * 2,
    mouthOpen: 0, alive: true,
    turnTimer: 1 + Math.random() * 3,
    targetAngle: angle,
    fleeing: false, fleeTimer: 0,
    eatCooldown: 0, sizeBoost: 0,
    chaseTimer: 0, chaseCooldown: 0,
    bodyRatioW: 1 + (Math.random() - 0.5) * 0.3,
    bodyRatioH: 1 + (Math.random() - 0.5) * 0.3,
  };
}

export function chooseTier(playerTier, elapsed) {
  const maxSpawnTier = !G.hasFirstTierUp ? 1 : Math.min(TIER_COUNT - 1, playerTier + 1);
  const timePressure = Math.min(3, elapsed / 40);
  const graceMultiplier = G.graceTimer > 0 ? 0.3 : 1;
  const progressRatio = G.player && playerTier < TIER_COUNT - 1
    ? G.player.eaten / TIER_THRESHOLDS[playerTier]
    : G.player ? G.prestigeEats / PRESTIGE_EXTRA_EATS : 0;

  const weights = [];
  for (let t = 0; t < TIER_COUNT; t++) {
    if (t === 0 || t > maxSpawnTier) { weights.push(0); continue; }
    if (t < playerTier) {
      let w = t === playerTier - 1 ? 4 : 2;
      if (progressRatio > 0.5) w *= 0.7;
      if (progressRatio > 0.8) w *= 0.6;
      weights.push(w);
    } else if (t === playerTier) {
      let w = 1.5;
      if (progressRatio > 0.5) w += 1.5;
      if (progressRatio > 0.8) w += 1.0;
      weights.push(w);
    } else {
      let w = (0.5 + timePressure * 0.3) * graceMultiplier * G.difficultyWave;
      if (progressRatio > 0.5) w *= 1.3;
      if (progressRatio > 0.8) w *= 1.8;
      weights.push(w);
    }
  }
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 1;
  let r = Math.random() * total;
  for (let t = 0; t < TIER_COUNT; t++) {
    r -= weights[t];
    if (r <= 0) return t;
  }
  return 1;
}

function distBetween(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function updateFishAI(effectiveDt) {
  const player = G.player;
  const W = G.W, H = G.H;
  let activeChaserCount = 0;

  for (let i = G.fishes.length - 1; i >= 0; i--) {
    const f = G.fishes[i];
    if (!f.alive) { G.fishes.splice(i, 1); continue; }

    if (f.eatCooldown > 0) f.eatCooldown -= effectiveDt;
    if (f.sizeBoost > 0) f.sizeBoost -= effectiveDt;
    if (f.chaseCooldown > 0) f.chaseCooldown -= effectiveDt;
    f.mouthOpen = Math.max(0, f.mouthOpen - effectiveDt * 4);
    f.tailPhase += effectiveDt * (8 + f.speed * 3);

    if (f.tier === 0) {
      // Plancton drift
      f.turnTimer -= effectiveDt;
      if (f.turnTimer <= 0) {
        f.turnTimer = 3 + Math.random() * 4;
        f.targetAngle = f.angle + (Math.random() - 0.5) * 2;
      }
      let aDiff = f.targetAngle - f.angle;
      while (aDiff > Math.PI) aDiff -= Math.PI * 2;
      while (aDiff < -Math.PI) aDiff += Math.PI * 2;
      f.angle += aDiff * Math.min(1, effectiveDt * 1.5);
      const spd = f.speed * 0.5 * 60 * effectiveDt;
      f.x += Math.cos(f.angle) * spd;
      f.y += Math.sin(f.angle) * spd;
      if (f.x < 20) f.targetAngle = 0;
      if (f.x > W - 20) f.targetAngle = Math.PI;
      if (f.y < 20) f.targetAngle = Math.PI / 2;
      if (f.y > H - 20) f.targetAngle = -Math.PI / 2;
      const margin = 150;
      if (f.x < -margin || f.x > W + margin || f.y < -margin || f.y > H + margin) {
        G.fishes.splice(i, 1);
        continue;
      }
    } else {
      // Normal fish AI
      const distToPlayer = distBetween(player, f);
      const timePressure = Math.min(3, G.gameTime / 40);
      const timeDetectBonus = timePressure * 15;
      const adaptiveRangeBonus = G.timeSinceLastHit > 6 ? 0.15 : 0;
      const graceDetectMult = G.graceTimer > 0 ? 0.5 : 1;
      const detectRange = (PREDATOR_DETECT_RANGE + (G.depthLevel - 1) * PREDATOR_DEPTH_DETECT_BONUS + timeDetectBonus) * (1 + adaptiveRangeBonus) * graceDetectMult * G.difficultyWave;
      const isPredator = f.tier > player.tier;

      let isChasing = false;
      if (isPredator && f.chaseCooldown <= 0 && distToPlayer < detectRange) {
        if (f.chaseTimer > 0 || activeChaserCount < MAX_CHASERS) {
          isChasing = true;
          if (f.chaseTimer <= 0) f.chaseTimer = 4;
          f.chaseTimer -= effectiveDt;
          activeChaserCount++;
          if (f.chaseTimer <= 0) {
            isChasing = false;
            f.chaseTimer = 0;
            f.chaseCooldown = 3;
            f.targetAngle = f.angle + (Math.random() - 0.5) * 3;
          }
        }
      } else if (f.chaseTimer > 0 && (!isPredator || distToPlayer >= detectRange)) {
        f.chaseTimer = 0;
      }

      if (isChasing) {
        f.targetAngle = Math.atan2(player.y - f.y, player.x - f.x);
        f.fleeing = false;
      } else {
        f.turnTimer -= effectiveDt;
        if (f.turnTimer <= 0) {
          f.turnTimer = 2 + Math.random() * 4;
          if (player.tier > f.tier && distToPlayer < 250) {
            f.fleeing = true;
            f.fleeTimer = 1.5 + Math.random();
            f.targetAngle = Math.atan2(f.y - player.y, f.x - player.x);
          } else {
            f.targetAngle = f.angle + (Math.random() - 0.5) * 1.5;
          }
        }
      }

      if (f.fleeing) {
        f.fleeTimer -= effectiveDt;
        if (f.fleeTimer <= 0) f.fleeing = false;
        f.targetAngle = Math.atan2(f.y - player.y, f.x - player.x);
      }

      let aDiff = f.targetAngle - f.angle;
      while (aDiff > Math.PI) aDiff -= Math.PI * 2;
      while (aDiff < -Math.PI) aDiff += Math.PI * 2;
      f.angle += aDiff * Math.min(1, effectiveDt * (isChasing ? 5 : 3));

      const timeSpeedBonus = 1 + Math.min(0.15, timePressure * 0.05);
      const adaptiveSpeedBonus = G.timeSinceLastHit > 15 ? 1.1 : 1;
      let spdMult = f.fleeing ? 1.5 : 1;
      let spd;
      if (isChasing) {
        spd = PREDATOR_CHASE_SPEED_RATIO * PLAYER_BASE_SPEED * timeSpeedBonus * adaptiveSpeedBonus * 60 * effectiveDt;
      } else {
        spd = f.speed * spdMult * 60 * effectiveDt;
      }
      f.x += Math.cos(f.angle) * spd;
      f.y += Math.sin(f.angle) * spd;

      const margin = f.radius * 4 + 100;
      if (f.x < -margin || f.x > W + margin || f.y < -margin || f.y > H + margin) {
        G.fishes.splice(i, 1);
        continue;
      }
      if (f.x < f.radius) f.targetAngle = 0;
      if (f.x > W - f.radius) f.targetAngle = Math.PI;
      if (f.y < f.radius) f.targetAngle = Math.PI / 2;
      if (f.y > H - f.radius) f.targetAngle = -Math.PI / 2;
    }
  }
}

export function updateFishFishEating() {
  if (G.frameCount % 10 !== 0 || G.gameTime - G.lastFishEatTime < 1.0) return;
  fishFishEating:
  for (let i = 0; i < G.fishes.length; i++) {
    const a = G.fishes[i];
    if (!a.alive || a.tier <= 0 || a.eatCooldown > 0) continue;
    for (let j = 0; j < G.fishes.length; j++) {
      if (i === j) continue;
      const b = G.fishes[j];
      if (!b.alive || b.tier >= a.tier) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (a.radius + b.radius) * 0.7) {
        b.alive = false;
        a.mouthOpen = 1;
        a.eatCooldown = 4;
        a.sizeBoost = 1.5;
        G.lastFishEatTime = G.gameTime;
        spawnEatParticles(b.x, b.y, getFishColors(b.tier, G.currentZone).body, 5);
        spawnBubble(b.x, b.y);
        G.pendingRespawns.push({ tier: b.tier, time: G.gameTime + 2 + Math.random() });
        break fishFishEating;
      }
    }
  }
}

export function processRespawns() {
  for (let i = G.pendingRespawns.length - 1; i >= 0; i--) {
    if (G.gameTime >= G.pendingRespawns[i].time && G.fishes.length < MAX_FISH) {
      G.fishes.push(createFish(G.pendingRespawns[i].tier, true));
      G.pendingRespawns.splice(i, 1);
    }
  }
}

export function spawnNewFish() {
  const player = G.player;
  const W = G.W, H = G.H;
  let visibleCount = 0, planctonCount = 0;
  for (const f of G.fishes) {
    if (f.tier === 0) { planctonCount++; continue; }
    if (f.x > -50 && f.x < W + 50 && f.y > -50 && f.y < H + 50) visibleCount++;
  }
  while (planctonCount < PLANCTON_TARGET_COUNT && G.fishes.length < MAX_FISH) {
    G.fishes.push(createFish(0, true));
    planctonCount++;
  }
  while (visibleCount < MIN_VISIBLE && G.fishes.length < MAX_FISH) {
    const tier = chooseTier(player.tier, G.gameTime);
    G.fishes.push(createFish(tier, true));
    visibleCount++;
  }
}

export function spawnAdaptiveDanger() {
  if (G.timeSinceLastHit > 10 && !G.adaptiveDangerSpawned && G.fishes.length < MAX_FISH) {
    const spawnDist = 200 + Math.random() * 100;
    const spawnAngle = Math.random() * Math.PI * 2;
    const predTier = Math.min(TIER_COUNT - 1, G.player.tier + 1);
    const predator = createFish(predTier, true);
    predator.x = G.player.x + Math.cos(spawnAngle) * spawnDist;
    predator.y = G.player.y + Math.sin(spawnAngle) * spawnDist;
    predator.x = Math.max(-predator.radius * 2, Math.min(G.W + predator.radius * 2, predator.x));
    predator.y = Math.max(-predator.radius * 2, Math.min(G.H + predator.radius * 2, predator.y));
    predator.targetAngle = Math.atan2(G.player.y - predator.y, G.player.x - predator.x);
    predator.angle = predator.targetAngle;
    G.fishes.push(predator);
    G.adaptiveDangerSpawned = true;
  }
}
