// ============================================================
//  PLAYER — creation & movement
// ============================================================

import G from './state.js';
import {
  TIER_RADIUS, PLAYER_BASE_SPEED, BOOST_MULT, BOOST_DRAIN, BOOST_MAX, BOOST_REGEN,
  TAIL_FLICK_SPEED_MULT, INERTIA_FRICTION, INERTIA_DURATION,
  TAIL_FLICK_VELOCITY_THRESHOLD, TAIL_FLICK_DURATION, TAIL_FLICK_COOLDOWN,
} from './constants.js';
import { haptic, playTailFlick, ensureAudio } from './audio.js';
import { spawnBubble } from './particles.js';

export function createPlayer() {
  const r = TIER_RADIUS[1] * G.radiusScale;
  const centerY = G.isTouchDevice && G.gameAreaHeight > 0 ? G.gameAreaHeight * 0.45 : G.H / 2;
  return {
    x: G.W / 2, y: centerY,
    angle: 0, tier: 1,
    radius: r, targetRadius: r,
    tailPhase: 0, mouthOpen: 0,
    eaten: 0, totalEaten: 0,
    alive: true, invincible: 0, flashTimer: 0,
  };
}

export function revealSizeBar() {
  const el = document.getElementById('size-group');
  if (!el || el.classList.contains('revealed')) return;
  el.classList.add('revealed');
  const label = el.querySelector('.bar-label');
  if (label) { label.classList.remove('pulse'); void label.offsetWidth; label.classList.add('pulse'); }
}

export function revealBoostBar() {
  const el = document.getElementById('boost-group');
  if (!el || el.classList.contains('revealed')) return;
  el.classList.add('revealed');
  const label = el.querySelector('.bar-label');
  if (label) { label.classList.remove('pulse'); void label.offsetWidth; label.classList.add('pulse'); }
}

export function revealOxygenBar() {
  const el = document.getElementById('oxygen-group');
  if (!el || el.classList.contains('revealed')) return;
  el.classList.add('revealed');
  const label = el.querySelector('.bar-label');
  if (label) { label.classList.remove('pulse'); void label.offsetWidth; label.classList.add('pulse'); }
}

export function updatePlayerMovement(effectiveDt) {
  const player = G.player;
  if (!player || !player.alive) return;

  let hasDirectionalInput = false;
  let playerActualSpeed = 0;

  // --- Joystick input (mobile) ---
  if (G.joystick.active && G.joystick.tilt > 0) {
    hasDirectionalInput = true;
    const targetAngle = G.joystick.angle;
    let angleDiff = targetAngle - player.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    player.angle += angleDiff * Math.min(1, effectiveDt * 12);

    let speed = PLAYER_BASE_SPEED * G.joystick.tilt;
    if (G.frenzyActive) speed *= 1.3;
    if (G.boosting && G.boostFuel > 0) {
      speed *= BOOST_MULT;
      G.boostFuel = Math.max(0, G.boostFuel - BOOST_DRAIN);
      if (!G.hasEverBoosted) { G.hasEverBoosted = true; revealBoostBar(); }
    }
    if (G.playerStunTimer > 0) speed *= 0.6;
    if (G.playerSlowTimer > 0) speed *= 0.6;
    if (G.tailFlickActive) speed *= TAIL_FLICK_SPEED_MULT;

    const move = speed * (60 * effectiveDt);
    player.x += Math.cos(player.angle) * move;
    player.y += Math.sin(player.angle) * move;
    playerActualSpeed = speed;
    G.playerInertiaTimer = 0;

    G.swimHapticTimer += effectiveDt * (1 + playerActualSpeed / PLAYER_BASE_SPEED);
    if (G.swimHapticTimer > 0.3) {
      G.swimHapticTimer = 0;
      if (G.joystick.tilt > 0.4) haptic(3);
    }
  } else if (G.pointer.active && !G.joystick.active) {
    // --- Desktop/fallback pointer ---
    const dx = G.pointer.x - player.x;
    const dy = G.pointer.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      hasDirectionalInput = true;
      const targetAngle = Math.atan2(dy, dx);
      let angleDiff = targetAngle - player.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      player.angle += angleDiff * Math.min(1, effectiveDt * 12);

      let speed = PLAYER_BASE_SPEED;
      if (G.frenzyActive) speed *= 1.3;
      if (G.boosting && G.boostFuel > 0) {
        speed *= BOOST_MULT;
        G.boostFuel = Math.max(0, G.boostFuel - BOOST_DRAIN);
        if (!G.hasEverBoosted) { G.hasEverBoosted = true; revealBoostBar(); }
      }
      if (G.playerStunTimer > 0) speed *= 0.6;
      if (G.playerSlowTimer > 0) speed *= 0.6;
      if (G.tailFlickActive) speed *= TAIL_FLICK_SPEED_MULT;

      const move = Math.min(dist, speed * (60 * effectiveDt));
      player.x += (dx / dist) * move;
      player.y += (dy / dist) * move;
      playerActualSpeed = move / (60 * effectiveDt);
    }
  }

  // --- Inertia ---
  if (!hasDirectionalInput && G.playerInertiaTimer > 0) {
    G.playerInertiaTimer -= effectiveDt;
    const inertiaMove = 60 * effectiveDt;
    player.x += G.playerInertiaVx * inertiaMove;
    player.y += G.playerInertiaVy * inertiaMove;
    G.playerInertiaVx *= INERTIA_FRICTION;
    G.playerInertiaVy *= INERTIA_FRICTION;
    playerActualSpeed = Math.sqrt(G.playerInertiaVx ** 2 + G.playerInertiaVy ** 2);
    if (playerActualSpeed > 0.1) hasDirectionalInput = true;
  }

  // --- Tail flick movement ---
  if (G.tailFlickActive && !G.joystick.active) {
    const flickSpeed = PLAYER_BASE_SPEED * TAIL_FLICK_SPEED_MULT * 60 * effectiveDt;
    player.x += G.tailFlickDirX * flickSpeed;
    player.y += G.tailFlickDirY * flickSpeed;
    hasDirectionalInput = true;
  }

  // --- Idle auto-swim ---
  if (!hasDirectionalInput) {
    let idleSpeed = PLAYER_BASE_SPEED * 0.4;
    if (G.frenzyActive) idleSpeed *= 1.3;
    if (G.playerStunTimer > 0) idleSpeed *= 0.6;
    if (G.playerSlowTimer > 0) idleSpeed *= 0.6;

    // Auto-dodge nearby predators
    let dodgeAngleX = 0, dodgeAngleY = 0;
    for (const f of G.fishes) {
      if (!f.alive || f.tier <= player.tier) continue;
      const ddx = player.x - f.x, ddy = player.y - f.y;
      const dd = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dd < 120 && dd > 0) {
        const strength = (120 - dd) / 120;
        dodgeAngleX += (ddx / dd) * strength;
        dodgeAngleY += (ddy / dd) * strength;
      }
    }
    if (dodgeAngleX !== 0 || dodgeAngleY !== 0) {
      const dodgeTarget = Math.atan2(dodgeAngleY, dodgeAngleX);
      let daDiff = dodgeTarget - player.angle;
      while (daDiff > Math.PI) daDiff -= Math.PI * 2;
      while (daDiff < -Math.PI) daDiff += Math.PI * 2;
      player.angle += daDiff * Math.min(1, effectiveDt * 3);
    }

    const idleMove = idleSpeed * (60 * effectiveDt);
    player.x += Math.cos(player.angle) * idleMove;
    player.y += Math.sin(player.angle) * idleMove;
  }

  // --- Boost regen ---
  if (!G.boosting) {
    G.boostFuel = Math.min(BOOST_MAX, G.boostFuel + BOOST_REGEN);
  }

  // --- Bounce velocity ---
  player.x += G.playerBounceVx;
  player.y += G.playerBounceVy;
  G.playerBounceVx *= 0.85;
  G.playerBounceVy *= 0.85;
  if (Math.abs(G.playerBounceVx) < 0.1) G.playerBounceVx = 0;
  if (Math.abs(G.playerBounceVy) < 0.1) G.playerBounceVy = 0;

  // --- Screen edge bounce ---
  const pr = player.radius;
  if (player.x < pr) { player.x = pr; G.playerBounceVx = 5 + Math.random() * 5; haptic(5); }
  else if (player.x > G.W - pr) { player.x = G.W - pr; G.playerBounceVx = -(5 + Math.random() * 5); haptic(5); }
  if (player.y < pr) { player.y = pr; G.playerBounceVy = 5 + Math.random() * 5; haptic(5); }
  else if (player.y > G.H - pr) { player.y = G.H - pr; G.playerBounceVy = -(5 + Math.random() * 5); haptic(5); }

  // --- Animation ---
  const tailSpeedMult = hasDirectionalInput ? (0.8 + (playerActualSpeed / PLAYER_BASE_SPEED) * 1.5) : 0.5;
  player.tailPhase += effectiveDt * 10 * tailSpeedMult;
  player.mouthOpen = Math.max(0, player.mouthOpen - effectiveDt * 2);

  // --- Smooth radius lerp ---
  if (G.tierUpSizeLerpTimer <= 0) {
    if (Math.abs(player.radius - player.targetRadius) > 0.5) {
      player.radius += (player.targetRadius - player.radius) * Math.min(1, effectiveDt * 8);
    } else {
      player.radius = player.targetRadius;
    }
  }

  if (player.invincible > 0) {
    player.invincible -= effectiveDt;
    player.flashTimer += effectiveDt * 12;
  }
}
