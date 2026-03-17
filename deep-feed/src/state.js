// ============================================================
//  GAME STATE — single mutable object shared across modules
// ============================================================

import { BOOST_MAX, OXYGEN_MAX } from './constants.js';

const G = {
  // Screen
  W: 0, H: 0,
  radiusScale: 1,
  gameAreaHeight: 0,
  controlAreaTop: 0,

  // Core
  running: false,
  paused: false,
  gameTime: 0,
  score: 0,
  highScore: parseInt(localStorage.getItem('deepfeed_hi') || '0', 10),
  frameCount: 0,

  // Player
  player: null,

  // Entities
  fishes: [],
  particles: [],
  bubbles: [],
  jellyfish: [],
  ambushFish: [],
  floatingTexts: [],
  reefCurrents: [],
  pendingRespawns: [],

  // Input
  pointer: { x: 0, y: 0, active: false },
  boosting: false,
  boostFuel: BOOST_MAX,
  isTouch: false,
  boostTouchId: -1,
  moveTouchId: -1,
  joystick: {
    active: false,
    originX: 0, originY: 0,
    currentX: 0, currentY: 0,
    dx: 0, dy: 0,
    tilt: 0, angle: 0,
    touchId: -1,
    releaseAnimT: 0,
    releaseFromX: 0, releaseFromY: 0,
    ripplePhase: 0,
    glowDir: 0,
    cooldownIndicator: 0,
  },
  joystickVelocity: { x: 0, y: 0 },
  joystickPrevPos: { x: 0, y: 0 },
  playerInertiaVx: 0,
  playerInertiaVy: 0,
  playerInertiaTimer: 0,
  tailFlickActive: false,
  tailFlickTimer: 0,
  tailFlickCooldown: 0,
  tailFlickDirX: 0,
  tailFlickDirY: 0,
  tailFlickSquash: 0,
  swimHapticTimer: 0,

  // Camera
  cameraZoom: 1,
  cameraZoomTarget: 1,
  shakeX: 0, shakeY: 0,
  shakeIntensity: 0,

  // Oxygen
  oxygen: OXYGEN_MAX,

  // Prestige / Depth
  depthLevel: 1,
  maxDepthReached: 1,
  scoreMultiplier: 1,
  prestigeEats: 0,
  inPrestige: false,
  prestigeTimer: 0,

  // Frenzy
  recentEats: [],
  frenzyActive: false,
  frenzyTimer: 0,
  frenzyCount: 0,
  bestFrenzy: 0,
  slowmoScale: 1,
  saturationFlash: 0,

  // Combo
  comboCount: 0,
  comboTimer: 0,
  comboPulseScale: 1,
  comboPitch: 1,

  // Festin
  festinPointsAccum: 0,
  festinDroneNode: null,
  festinDroneGain: null,

  // Tier-up celebration
  tierUpRingRadius: 0,
  tierUpRingAlpha: 0,
  tierUpRingColor: '#fff',
  tierUpFlashTimer: 0,
  tierUpSlowmoTimer: 0,
  tierUpFreezeTimer: 0,
  tierUpRings: [
    { radius: 0, alpha: 0, color: '#fff', age: 0, delay: 0 },
    { radius: 0, alpha: 0, color: '#fff', age: 0, delay: 0 },
    { radius: 0, alpha: 0, color: '#fff', age: 0, delay: 0 },
  ],
  tierUpZoomScale: 1,
  tierUpZoomTimer: 0,
  tierUpTextScale: 0,
  tierUpTextTimer: 0,
  tierUpTextName: '',
  tierUpTextColor: '#fff',
  tierUpTextAlpha: 1,
  tierUpTextY: 0,
  tierUpSizeLerpTimer: 0,
  tierUpSizeLerpFrom: 0,

  // Zone
  currentZone: 'surface',
  zoneTransition: 0,
  zoneWaveY: -1,
  zoneWaveColor: '#fff',
  zoneSlowmoTimer: 0,
  zoneTransitionTimer: 0,
  zoneTransitionName: '',
  lastZone: 'surface',
  zoneDecor: null,

  // Player status effects
  playerStunTimer: 0,
  playerSlowTimer: 0,
  playerBounceVx: 0,
  playerBounceVy: 0,
  playerScaleBump: 0,

  // HUD
  lastHUDTime: 0,
  hasEverEaten: false,
  hasEverBoosted: false,
  hasEverLowOxygen: false,
  lastFishEatTime: 0,

  // Difficulty
  graceTimer: 0,
  timeSinceLastHit: 0,
  adaptiveDangerSpawned: false,
  difficultyWave: 1,
  hasFirstTierUp: false,

  // Stats
  maxTierReached: 1,
  totalFishEaten: 0,
  startTime: 0,
  deathReason: 'predator',
  fishEatenByTier: [0,0,0,0,0,0],
  firstFestinTriggered: false,

  // Score milestones
  nextMilestoneIdx: 0,
  inGameRecordBeaten: false,
  highscorePulseTimer: 0,

  // Death
  deathAnimTimer: 0,
  deathAnimActive: false,
  deathImpactAngle: 0,
  deathZoomTimer: 0,
  deathSkeletonAlpha: 0,

  // Title screen
  titleBubbles: [],
  titlePlancton: [],

  // Loop timing
  lastTime: 0,
  rafId: null,
  safetyInterval: null,
  titleRafId: null,
  titleLastTime: 0,
  btnCooldown: false,

  // Touch device detection
  isTouchDevice: false,

  // Control zone particles
  controlZoneParticles: [],

  // Same-tier bump tooltip
  sameTierBumpShown: false,
  sameTierBumpTooltip: { active: false, x: 0, y: 0, timer: 0, text: '' },

  // Pause
  pauseOverlayVisible: false,
};

export default G;
