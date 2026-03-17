// ============================================================
//  MAIN — game init, game loop, resize, start/restart, title
// ============================================================

import G from './state.js';
import { canvas, ctx } from './dom.js';
import {
  BOOST_MAX, OXYGEN_MAX, TIER_RADIUS, REF_SCREEN, SHAKE_DECAY,
  TIERUP_FREEZE_DURATION, TIERUP_SLOWMO_DURATION,
} from './constants.js';
import { ensureAudio, startAmbientAudio, stopAmbientAudio, stopFestinDrone, playGameOver } from './audio.js';
import { createPlayer } from './player.js';
import { updatePlayerMovement } from './player.js';
import { createFish, updateFishAI, updateFishFishEating, processRespawns, spawnNewFish, spawnAdaptiveDanger } from './fishAI.js';
import { handleCollisions } from './collisions.js';
import { updateDifficulty } from './difficulty.js';
import { updateParticles, updateBubbles, updateFloatingTexts } from './particles.js';
import { generateZoneDecor, updateReefCurrents, updateAmbushFish } from './zones.js';
import { render, renderTitle, drawPlancton } from './rendering.js';
import { setupInput } from './input.js';
import { updateHUD, gameOver } from './ui.js';

// ---- Resize ----
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  G.W = window.innerWidth;
  G.H = window.innerHeight;
  canvas.width = G.W * dpr;
  canvas.height = G.H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (G.W < 400) {
    G.radiusScale = 0.75;
  } else if (G.W < 500) {
    G.radiusScale = 0.75 + ((G.W - 400) / 100) * 0.25;
  } else {
    G.radiusScale = Math.max(0.6, Math.min(1, Math.min(G.W, G.H) / REF_SCREEN));
  }

  G.gameAreaHeight = G.H * 0.72;
  G.controlAreaTop = G.gameAreaHeight;

  const orientHintEl = document.getElementById('orient-hint');
  if (orientHintEl) {
    const isMobileSize = Math.min(G.W, G.H) < 500;
    const isLandscape = G.W > G.H * 1.2;
    orientHintEl.classList.toggle('visible', isMobileSize && isLandscape);
  }
  if (G.zoneDecor) generateZoneDecor();
}

// ---- Game init ----
function initGame() {
  G.player = createPlayer();
  G.fishes = [];
  G.particles = [];
  G.bubbles = [];
  G.jellyfish = [];
  G.floatingTexts = [];
  G.score = 0;
  G.gameTime = 0;
  G.boostFuel = BOOST_MAX;
  G.shakeIntensity = 0;
  G.frameCount = 0;
  G.lastFishEatTime = 0;
  G.lastHUDTime = 0;
  G.playerScaleBump = 0;
  G.pendingRespawns = [];
  G.oxygen = OXYGEN_MAX;
  G.reefCurrents = [];
  G.ambushFish = [];
  G.playerStunTimer = 0;
  G.playerSlowTimer = 0;
  G.playerBounceVx = 0;
  G.playerBounceVy = 0;

  // Prestige
  G.depthLevel = 1;
  G.maxDepthReached = 1;
  G.scoreMultiplier = 1;
  G.prestigeEats = 0;
  G.inPrestige = false;
  G.prestigeTimer = 0;

  // Frenzy
  G.recentEats = [];
  G.frenzyActive = false;
  G.frenzyTimer = 0;
  G.frenzyCount = 0;
  G.bestFrenzy = 0;
  G.slowmoScale = 1;
  G.saturationFlash = 0;

  // Tier-up
  G.tierUpRingRadius = 0;
  G.tierUpRingAlpha = 0;
  G.tierUpFlashTimer = 0;
  G.tierUpSlowmoTimer = 0;
  G.tierUpFreezeTimer = 0;
  for (let i = 0; i < 3; i++) {
    G.tierUpRings[i] = { radius: 0, alpha: 0, color: '#fff', age: 0, delay: 0 };
  }
  G.tierUpZoomScale = 1;
  G.tierUpZoomTimer = 0;
  G.tierUpTextScale = 0;
  G.tierUpTextTimer = 0;
  G.tierUpTextAlpha = 0;
  G.tierUpTextY = 0;
  G.tierUpSizeLerpTimer = 0;
  G.tierUpSizeLerpFrom = 0;

  // Combo
  G.comboCount = 0;
  G.comboTimer = 0;
  G.comboPulseScale = 1;
  G.comboPitch = 1;

  // Festin
  G.festinPointsAccum = 0;
  stopFestinDrone();

  // Zone
  G.zoneWaveY = -1;
  G.zoneSlowmoTimer = 0;
  G.zoneTransitionTimer = 0;
  G.lastZone = 'surface';
  G.currentZone = 'surface';
  const zoneTextEl = document.getElementById('zone-text');
  if (zoneTextEl) zoneTextEl.classList.remove('visible');

  // Milestones
  G.nextMilestoneIdx = 0;
  G.inGameRecordBeaten = false;
  G.highscorePulseTimer = 0;

  // Death
  G.deathImpactAngle = 0;
  G.deathAnimActive = false;
  G.deathAnimTimer = 0;
  G.deathZoomTimer = 0;
  G.deathSkeletonAlpha = 0;

  // HUD
  G.hasEverEaten = false;
  G.hasEverBoosted = false;
  G.hasEverLowOxygen = false;
  const sizeGroupEl = document.getElementById('size-group');
  const boostGroupEl = document.getElementById('boost-group');
  const oxygenGroupEl = document.getElementById('oxygen-group');
  if (sizeGroupEl) sizeGroupEl.classList.remove('revealed');
  if (boostGroupEl) boostGroupEl.classList.remove('revealed');
  if (oxygenGroupEl) oxygenGroupEl.classList.remove('revealed');

  // Input
  G.moveTouchId = -1;
  G.boosting = false;
  G.joystick.active = false;
  G.joystick.touchId = -1;
  G.joystick.dx = 0;
  G.joystick.dy = 0;
  G.joystick.tilt = 0;
  G.joystick.releaseAnimT = 0;
  G.joystick.cooldownIndicator = 0;
  G.playerInertiaVx = 0;
  G.playerInertiaVy = 0;
  G.playerInertiaTimer = 0;
  G.tailFlickActive = false;
  G.tailFlickTimer = 0;
  G.tailFlickCooldown = 0;
  G.tailFlickSquash = 0;
  G.swimHapticTimer = 0;
  G.cameraZoom = 1;
  G.cameraZoomTarget = 1;

  // Difficulty
  G.graceTimer = 0;
  G.timeSinceLastHit = 0;
  G.adaptiveDangerSpawned = false;
  G.difficultyWave = 1;

  // Stats
  G.hasFirstTierUp = false;
  G.maxTierReached = 1;
  G.totalFishEaten = 0;
  G.startTime = performance.now();
  G.deathReason = 'predator';
  G.fishEatenByTier = [0, 0, 0, 0, 0, 0];
  G.firstFestinTriggered = false;

  // Pause
  G.paused = false;
  G.pauseOverlayVisible = false;
  const pauseOverlayEl = document.getElementById('pause-overlay');
  if (pauseOverlayEl) pauseOverlayEl.classList.remove('visible');

  // Apply depth retry if retrying at a higher depth
  if (G.retryDepthLevel > 0 && G.depthRetryCount <= 3) {
    G.depthLevel = G.retryDepthLevel;
    G.maxDepthReached = G.retryDepthLevel;
    G.scoreMultiplier = G.retryDepthLevel;
  }

  generateZoneDecor();

  // Spawn initial population
  const planctonCount = 12 + Math.floor(Math.random() * 6);
  for (let i = 0; i < planctonCount; i++) {
    G.fishes.push(createFish(0, false, true));
  }
  const fryCount = 6 + Math.floor(Math.random() * 5);
  for (let i = 0; i < fryCount; i++) {
    G.fishes.push(createFish(1, true));
  }

  updateHUD();
  startAmbientAudio();
}

// ---- Update (main orchestrator) ----
function update(dt) {
  if (!G.running || !G.player) return;

  // Pause
  if (G.paused) return;

  // Death animation countdown
  if (G.deathAnimActive) {
    G.deathAnimTimer -= dt;
    if (G.deathAnimTimer <= 0) {
      G.deathAnimActive = false;
      G.slowmoScale = 1;
      G.player.alive = false;
      G.running = false;
      playGameOver();
      const vignetteEl = document.getElementById('vignette');
      if (vignetteEl) vignetteEl.style.opacity = '0';
      gameOver();
      initTitleAmbient();
      G.titleLastTime = performance.now();
      G.titleRafId = requestAnimationFrame(titleLoop);
      return;
    }
    G.gameTime += dt * 0.2;
    G.player.flashTimer += dt * 15;
    if (G.shakeIntensity > 0.5) {
      G.shakeX = Math.cos(G.deathImpactAngle) * G.shakeIntensity * (0.5 + Math.random() * 0.5);
      G.shakeY = Math.sin(G.deathImpactAngle) * G.shakeIntensity * (0.5 + Math.random() * 0.5);
      G.shakeIntensity *= SHAKE_DECAY;
    } else {
      G.shakeX = G.shakeY = 0;
    }
    return;
  }

  // Apply slow-mo
  const effectiveDt = dt * G.slowmoScale;
  G.gameTime += effectiveDt;
  G.frameCount++;

  // Subsystems
  const freeze = updateDifficulty(dt, effectiveDt);
  if (freeze) return;

  updatePlayerMovement(effectiveDt);
  updateFishAI(effectiveDt);
  handleCollisions();
  updateFishFishEating();
  processRespawns();
  spawnNewFish();
  spawnAdaptiveDanger();
  updateReefCurrents(effectiveDt);
  updateAmbushFish(effectiveDt);

  // Jellyfish spawning & update
  updateJellyfish(effectiveDt);

  updateParticles(effectiveDt);
  updateBubbles(effectiveDt);
  updateFloatingTexts();

  // HUD (throttled)
  if (G.gameTime - G.lastHUDTime > 0.1) {
    G.lastHUDTime = G.gameTime;
    updateHUD();
  }
}

function updateJellyfish(effectiveDt) {
  const W = G.W, H = G.H;
  if (G.currentZone === 'twilight' || G.currentZone === 'abyss') {
    const targetCount = G.currentZone === 'abyss' ? 5 : 3;
    if (G.jellyfish.length < targetCount && Math.random() < effectiveDt * 0.3) {
      G.jellyfish.push({
        x: Math.random() * W,
        y: H + 30,
        radius: 15 + Math.random() * 15,
        vy: -0.3 - Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        tentaclePhase: Math.random() * Math.PI * 2,
      });
    }
    for (let i = G.jellyfish.length - 1; i >= 0; i--) {
      const j = G.jellyfish[i];
      j.y += j.vy * 60 * effectiveDt;
      j.x += Math.sin(j.phase) * 0.3;
      j.phase += effectiveDt * 1.5;
      j.tentaclePhase += effectiveDt * 3;
      if (j.y < -50) G.jellyfish.splice(i, 1);
    }
  } else {
    G.jellyfish = [];
  }
}

// ---- Game loop ----
function loop(timestamp) {
  G.rafId = requestAnimationFrame(loop);
  const dt = Math.min((timestamp - G.lastTime) / 1000, 0.05);
  G.lastTime = timestamp;

  update(dt);
  render();
}

function startLoop() {
  G.lastTime = performance.now();
  if (G.rafId) cancelAnimationFrame(G.rafId);
  G.rafId = requestAnimationFrame(loop);

  if (G.safetyInterval) clearInterval(G.safetyInterval);
  G.safetyInterval = setInterval(() => {
    if (G.running && !document.hidden) {
      G.lastTime = performance.now();
      if (G.rafId) cancelAnimationFrame(G.rafId);
      G.rafId = requestAnimationFrame(loop);
    }
  }, 2000);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && G.running) {
    G.lastTime = performance.now();
    if (G.rafId) cancelAnimationFrame(G.rafId);
    G.rafId = requestAnimationFrame(loop);
  }
});

// ---- Title screen ambient ----
function initTitleAmbient() {
  G.titleBubbles = [];
  G.titlePlancton = [];
  for (let i = 0; i < 8; i++) {
    G.titleBubbles.push({
      x: Math.random() * G.W, y: Math.random() * G.H,
      vy: -0.3 - Math.random() * 0.8,
      size: 1 + Math.random() * 3,
      life: Math.random(), decay: 0.002 + Math.random() * 0.003,
    });
  }
  for (let i = 0; i < 10; i++) {
    G.titlePlancton.push({
      x: Math.random() * G.W, y: Math.random() * G.H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      radius: 3 + Math.random() * 3, phase: Math.random() * Math.PI * 2,
    });
  }
}

function titleLoop(timestamp) {
  if (G.running) return;
  G.titleRafId = requestAnimationFrame(titleLoop);
  const dt = Math.min((timestamp - G.titleLastTime) / 1000, 0.05);
  G.titleLastTime = timestamp;

  for (let i = G.titleBubbles.length - 1; i >= 0; i--) {
    const b = G.titleBubbles[i];
    b.y += b.vy; b.x += Math.sin(b.y * 0.05) * 0.2;
    b.life -= b.decay;
    if (b.life <= 0) { b.x = Math.random() * G.W; b.y = G.H + 5; b.life = 1; }
  }
  for (const p of G.titlePlancton) {
    p.x += p.vx; p.y += p.vy; p.phase += dt * 2;
    if (p.x < 0) p.vx = Math.abs(p.vx);
    if (p.x > G.W) p.vx = -Math.abs(p.vx);
    if (p.y < 0) p.vy = Math.abs(p.vy);
    if (p.y > G.H) p.vy = -Math.abs(p.vy);
  }

  renderTitle();
}

// ---- Start / restart ----
const playBtn = document.getElementById('play-btn');

playBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (G.btnCooldown) return;
  G.btnCooldown = true;
  setTimeout(() => G.btnCooldown = false, 500);

  ensureAudio();
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.add('hidden');

  if (G.titleRafId) cancelAnimationFrame(G.titleRafId);
  G.titleRafId = null;

  initGame();
  G.running = true;
  startLoop();
});

playBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  playBtn.click();
}, { passive: false });

// ---- Bootstrap ----
window.addEventListener('resize', resize);
resize();
setupInput();
generateZoneDecor();

const highScoreEl = document.getElementById('highscore');
if (highScoreEl && G.highScore > 0) highScoreEl.textContent = `Record : ${G.highScore}`;

initTitleAmbient();
G.titleLastTime = performance.now();
G.titleRafId = requestAnimationFrame(titleLoop);

// ---- Tests ----
if (new URLSearchParams(window.location.search).has('test')) {
  import('./tests.js').then(m => m.runTests());
}

// Export for tests
export { initGame, initTitleAmbient, resize };
