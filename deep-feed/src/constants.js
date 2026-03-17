// ============================================================
//  CONSTANTS & CONFIG
// ============================================================

export const TIER_COUNT = 6;
export const TIER_NAMES = ['Plancton', 'Alevin', 'Petit', 'Moyen', 'Grand', 'Énorme'];
export const ZONE_NAMES = ['Surface', 'Surface', 'Récif', 'Crépusculaire', 'Abysses', 'Abysses'];

export const TIER_COLORS = [
  { body: '#88ffff', fin: '#88ffff', eye: '#fff' },
  { body: '#66ee66', fin: '#44cc44', eye: '#fff' },
  { body: '#44aaff', fin: '#2288dd', eye: '#fff' },
  { body: '#ff9933', fin: '#dd7711', eye: '#fff' },
  { body: '#ff4444', fin: '#cc2222', eye: '#fff' },
  { body: '#bb55ff', fin: '#9933dd', eye: '#ff0' },
];

export const ZONE_PALETTES = {
  surface: [
    { body: '#88ffff', fin: '#88ffff', eye: '#fff' },
    { body: '#77ff77', fin: '#55dd55', eye: '#fff' },
    { body: '#55bbff', fin: '#3399dd', eye: '#fff' },
    { body: '#ff9933', fin: '#dd7711', eye: '#fff' },
    { body: '#ff4444', fin: '#cc2222', eye: '#fff' },
    { body: '#bb55ff', fin: '#9933dd', eye: '#ff0' },
  ],
  reef: [
    { body: '#66ffaa', fin: '#44dd88', eye: '#fff' },
    { body: '#ffaa44', fin: '#dd8822', eye: '#fff' },
    { body: '#ff66aa', fin: '#dd4488', eye: '#fff' },
    { body: '#44dddd', fin: '#22bbbb', eye: '#fff' },
    { body: '#ff5555', fin: '#dd3333', eye: '#fff' },
    { body: '#cc66ff', fin: '#aa44dd', eye: '#ff0' },
  ],
  twilight: [
    { body: '#aaddff', fin: '#88bbdd', eye: '#ddf' },
    { body: '#8899bb', fin: '#667799', eye: '#ddf' },
    { body: '#aa88cc', fin: '#886aaa', eye: '#ddf' },
    { body: '#77aaaa', fin: '#558888', eye: '#ddf' },
    { body: '#cc6666', fin: '#aa4444', eye: '#ddf' },
    { body: '#9966cc', fin: '#7744aa', eye: '#ff0' },
  ],
  abyss: [
    { body: '#00ffcc', fin: '#00ddaa', eye: '#0ff' },
    { body: '#334455', fin: '#223344', eye: '#0ff' },
    { body: '#443355', fin: '#332244', eye: '#f0f' },
    { body: '#224455', fin: '#113344', eye: '#0ff' },
    { body: '#553333', fin: '#442222', eye: '#f44' },
    { body: '#442255', fin: '#331144', eye: '#ff0' },
  ],
};

export const TIER_RADIUS = [8, 12, 18, 26, 36, 48];

// Joystick
export const JOYSTICK_DEAD_ZONE = 15;
export const JOYSTICK_MAX_RADIUS = 60;
export const JOYSTICK_BASE_RADIUS = 40;
export const JOYSTICK_KNOB_RADIUS = 18;

// Inertia
export const INERTIA_FRICTION = 0.85;
export const INERTIA_DURATION = 0.3;

// Tail flick
export const TAIL_FLICK_VELOCITY_THRESHOLD = 8;
export const TAIL_FLICK_SPEED_MULT = 1.5;
export const TAIL_FLICK_DURATION = 0.15;
export const TAIL_FLICK_COOLDOWN = 0.8;

// Camera
export const CAMERA_ZOOM_T4 = 0.92;
export const CAMERA_ZOOM_T5 = 0.85;

// Progression
export const TIER_THRESHOLDS = [5, 3, 6, 10, 15];
export const TIER_POINTS = [1, 3, 8, 15, 25, 40];

// Eat feedback
export const EAT_FEEDBACK = [
  { particles: 3, shake: 0.5, scaleBump: 0.05, textSize: 16, haptic: 5 },
  { particles: 6, shake: 2, scaleBump: 0.15, textSize: 20, haptic: 10 },
  { particles: 10, shake: 4, scaleBump: 0.25, textSize: 26, haptic: 15 },
  { particles: 15, shake: 7, scaleBump: 0.35, textSize: 32, haptic: [10,5,20] },
  { particles: 25, shake: 12, scaleBump: 0.5, textSize: 38, haptic: [15,10,30] },
];

export const SCORE_MILESTONES = [50, 100, 250, 500, 1000];
export const ENEMY_SPEED = [0.5, 0.7, 0.65, 0.55, 0.5, 0.4];

// Predator
export const PREDATOR_DETECT_RANGE = 200;
export const PREDATOR_CHASE_SPEED_RATIO = 0.70;
export const PREDATOR_DEPTH_DETECT_BONUS = 30;
export const DESKTOP_PREDATOR_BUFF = 1.15;

// Oxygen
export const OXYGEN_MAX = 100;
export const OXYGEN_DRAIN_RATE = 1.2;
export const OXYGEN_DEPTH_DRAIN_MULT = 0.15;
export const OXYGEN_REFILL_PER_TIER = [8, 15, 20, 25, 30, 35];

// Prestige
export const PRESTIGE_EXTRA_EATS = 8;
export const PRESTIGE_SPEED_BUFF = 0.12;

// Frenzy
export const FRENZY_WINDOW = 3.0;
export const FRENZY_THRESHOLD = 5;
export const FRENZY_SLOWMO_DURATION = 0.5;
export const FRENZY_SLOWMO_SCALE = 0.3;

// Plancton / fish counts
export const PLANCTON_TARGET_COUNT = 15;
export const MAX_PLANCTON = 25;
export const MAX_FISH = 60;
export const MAX_PARTICLES = 120;
export const MAX_BUBBLES = 40;
export const MIN_VISIBLE = 24;
export const MAX_FLOATING_TEXTS = 30;

// Fish-fish eating
export const FISH_EAT_CHECK_INTERVAL = 10;
export const FISH_EAT_GLOBAL_COOLDOWN = 1.0;
export const FISH_EAT_PER_FISH_COOLDOWN = 4;

// Player
export const PLAYER_BASE_SPEED = 4.5;
export const BOOST_MULT = 1.7;
export const BOOST_MAX = 100;
export const BOOST_DRAIN = 1.2;
export const BOOST_REGEN = 0.35;
export const SHAKE_DECAY = 0.88;
export const REF_SCREEN = 900;
export const TOUCH_OFFSET_Y = 80;
export const MAX_CHASERS = 3;

// Tier-up timing
export const TIERUP_FREEZE_DURATION = 0.06;
export const TIERUP_SLOWMO_DURATION = 0.55;

// Zone backgrounds
export const ZONE_BG = {
  surface: { top: '#1a6090', mid: '#0d4070', bot: '#062848', rayColor: '#aaddff', rayAlpha: 0.07 },
  reef: { top: '#0d5a6a', mid: '#0a3a50', bot: '#042030', rayColor: '#66ccbb', rayAlpha: 0.05 },
  twilight: { top: '#0a1a30', mid: '#06102a', bot: '#030818', rayColor: '#5566aa', rayAlpha: 0.025 },
  abyss: { top: '#020610', mid: '#010408', bot: '#000204', rayColor: '#223355', rayAlpha: 0.01 },
};

export const ZONE_DISPLAY_NAMES = {
  surface: '🌊 Surface',
  reef: '🐠 Récif corallien',
  twilight: '🌑 Zone crépusculaire',
  abyss: '⬛ Abysses',
};
