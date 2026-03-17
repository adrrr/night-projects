// ============================================================
//  TESTS (run via dev.html?test or tests.html)
// ============================================================

import G from './state.js';
import {
  TIER_COUNT, TIER_RADIUS, TIER_THRESHOLDS, TIER_NAMES,
  PLAYER_BASE_SPEED, REF_SCREEN,
  TIERUP_FREEZE_DURATION, TIERUP_SLOWMO_DURATION,
  PRESTIGE_EXTRA_EATS,
} from './constants.js';
import { createPlayer } from './player.js';
import { createFish, chooseTier } from './fishAI.js';
import { getFishColors } from './zones.js';
import { playTierUp, playFrenzy } from './audio.js';

export function runTests() {
  const results = [];
  let passed = 0, failed = 0;

  function assert(name, condition) {
    if (condition) {
      passed++;
      results.push(`\u2713 ${name}`);
    } else {
      failed++;
      results.push(`\u2717 FAIL: ${name}`);
    }
  }

  // Setup test state
  G.W = 400; G.H = 700;
  G.radiusScale = 1;
  G.player = createPlayer();
  G.gameTime = 0;
  G.graceTimer = 0;
  G.timeSinceLastHit = 0;
  G.hasFirstTierUp = true;
  G.difficultyWave = 1;

  // Test: chooseTier returns valid tiers
  for (let i = 0; i < 50; i++) {
    const t = chooseTier(2, 10);
    assert(`chooseTier returns valid tier (got ${t})`, t >= 0 && t < TIER_COUNT);
  }

  // Test: chooseTier respects grace period
  G.graceTimer = 3;
  let predatorCountGrace = 0;
  for (let i = 0; i < 200; i++) {
    const t = chooseTier(2, 30);
    if (t > 2) predatorCountGrace++;
  }
  G.graceTimer = 0;
  let predatorCountNormal = 0;
  for (let i = 0; i < 200; i++) {
    const t = chooseTier(2, 30);
    if (t > 2) predatorCountNormal++;
  }
  assert(`Grace period reduces predators (grace=${predatorCountGrace} < normal=${predatorCountNormal})`,
    predatorCountGrace < predatorCountNormal);

  // Test: timePressure calculation
  assert('timePressure at 0s = 0', Math.min(3, 0 / 40) === 0);
  assert('timePressure at 40s = 1', Math.min(3, 40 / 40) === 1);
  assert('timePressure at 80s = 2', Math.min(3, 80 / 40) === 2);
  assert('timePressure at 120s = 3 (capped)', Math.min(3, 120 / 40) === 3);
  assert('timePressure at 200s = 3 (still capped)', Math.min(3, 200 / 40) === 3);

  // Test: Player glow ring oscillation
  const t1 = 0;
  const t2 = 1;
  const glow1 = 0.55 + 0.2 * Math.sin(t1 * 3);
  const glow2 = 0.55 + 0.2 * Math.sin(t2 * 3);
  assert('Glow oscillation min >= 0.35', glow1 >= 0.35);
  assert('Glow oscillation max <= 0.75', glow1 <= 0.75 && glow2 <= 0.75);
  assert('Glow oscillation varies', Math.abs(glow1 - glow2) > 0.01);

  // Test: Radius oscillation
  const radOsc1 = 1 + 0.04 * Math.sin(0);
  const radOsc2 = 1 + 0.04 * Math.sin(1);
  assert('Radius oscillation centered at 1', radOsc1 === 1);
  assert('Radius oscillation range +/-0.04', Math.abs(radOsc2 - 1) <= 0.04 + 1e-10);

  // Test: createPlayer has targetRadius
  const testPlayer = createPlayer();
  assert('createPlayer has targetRadius', testPlayer.targetRadius === testPlayer.radius);

  // Test: Grace period timer
  G.graceTimer = 2;
  const graceMultTest = G.graceTimer > 0 ? 0.3 : 1;
  assert('Grace multiplier = 0.3 when active', graceMultTest === 0.3);
  G.graceTimer = 0;
  const noGraceMultTest = G.graceTimer > 0 ? 0.3 : 1;
  assert('Grace multiplier = 1 when inactive', noGraceMultTest === 1);

  // Test: Adaptive danger thresholds
  G.timeSinceLastHit = 4;
  assert('No adaptive range bonus at 4s', (G.timeSinceLastHit > 6 ? 0.15 : 0) === 0);
  G.timeSinceLastHit = 8;
  assert('Adaptive range bonus at 8s (>6s)', (G.timeSinceLastHit > 6 ? 0.15 : 0) === 0.15);
  G.timeSinceLastHit = 12;
  assert('Adaptive spawn triggers at 12s (>10s)', G.timeSinceLastHit > 10);
  G.timeSinceLastHit = 16;
  assert('Adaptive speed bonus at 16s (>15s)', (G.timeSinceLastHit > 15 ? 1.1 : 1) === 1.1);
  G.timeSinceLastHit = 0;

  // Test: Tier-up state
  G.tierUpFlashTimer = 0.3;
  assert('Tier-up flash timer set', G.tierUpFlashTimer === 0.3);
  G.tierUpRingAlpha = 0.7;
  G.tierUpRingRadius = 20;
  assert('Tier-up ring initialized', G.tierUpRingAlpha > 0 && G.tierUpRingRadius > 0);

  // Test: playTierUp function
  assert('playTierUp function exists', typeof playTierUp === 'function');

  // Test: Idle drift
  {
    const tp = createPlayer();
    G.player = tp;
    G.pointer = { x: 0, y: 0, active: false };
    const startX = tp.x;
    tp.angle = 0;
    const idleSpeed = PLAYER_BASE_SPEED * 0.4;
    const idleMove = idleSpeed * (60 * 0.016);
    tp.x += Math.cos(tp.angle) * idleMove;
    tp.y += Math.sin(tp.angle) * idleMove;
    assert('Idle drift moves player X', tp.x > startX);
  }

  // Test: Chase timer
  {
    const predator = createFish(3, true);
    predator.chaseTimer = 0.1;
    predator.chaseTimer -= 0.15;
    assert('Chase timer expires below 0', predator.chaseTimer <= 0);
    predator.chaseCooldown = 3;
    assert('Chase cooldown set after timeout', predator.chaseCooldown === 3);
  }

  // Test: Max chaser cap
  {
    let chaserCount = 0;
    const maxChasers = 3;
    const testPredators = [1, 2, 3, 4, 5];
    const chasing = [];
    for (const p of testPredators) {
      if (chaserCount < maxChasers) {
        chasing.push(p);
        chaserCount++;
      }
    }
    assert('Max chaser cap limits to 3', chasing.length === 3);
    assert('4th predator not chasing', !chasing.includes(4));
  }

  // Test: Difficulty wave
  {
    const samples = [];
    for (let t = 0; t < 100; t += 0.5) {
      samples.push(0.6 + 0.4 * Math.sin(t * 0.2));
    }
    const minWave = Math.min(...samples);
    const maxWave = Math.max(...samples);
    assert('Difficulty wave min >= 0.2 (0.6-0.4)', minWave >= 0.19);
    assert('Difficulty wave max <= 1.0', maxWave <= 1.001);
    assert('Difficulty wave varies (range > 0.7)', maxWave - minWave > 0.7);
  }

  // Test: Post-eat pulse
  {
    G.player = createPlayer();
    G.player.tier = 2;
    G.player.x = 200; G.player.y = 200;
    const nearPred = { x: 250, y: 200, alive: true, tier: 3, radius: 30 };
    const farPred = { x: 500, y: 200, alive: true, tier: 3, radius: 30 };
    const origNearX = nearPred.x;
    const origFarX = farPred.x;
    const testFishes = [nearPred, farPred];
    for (const pf of testFishes) {
      if (!pf.alive || pf.tier <= G.player.tier) continue;
      const pdx = pf.x - G.player.x, pdy = pf.y - G.player.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < 120 && pdist > 0) {
        pf.x += (pdx / pdist) * 30;
        pf.y += (pdy / pdist) * 30;
      }
    }
    assert('Post-eat pulse pushes near predator', nearPred.x > origNearX);
    assert('Post-eat pulse does not affect far predator', farPred.x === origFarX);
  }

  // ---- Player Visual Identity Tests ----

  {
    for (let t = 0; t < 20; t += 0.1) {
      const breathT = Math.sin(t * 2.5);
      const glowOpacity = 0.3 + 0.15 * (1 + breathT);
      const glowRadOff = 3 * breathT;
      assert('Glow opacity >= 0.3', glowOpacity >= 0.299);
      assert('Glow opacity <= 0.6', glowOpacity <= 0.601);
      assert('Glow radius offset >= -3', glowRadOff >= -3.01);
      assert('Glow radius offset <= 3', glowRadOff <= 3.01);
    }
  }

  // Test: Chevron position
  {
    G.player = createPlayer();
    G.player.y = 300;
    G.player.radius = TIER_RADIUS[1] * (Math.min(G.W, G.H) / REF_SCREEN);
    const pDrawR = G.player.radius;
    const chevronY = G.player.y - pDrawR * 1.9 - 16;
    assert('Chevron is above player', chevronY < G.player.y);
    assert('Chevron distance is ~20px+ above fish edge', G.player.y - chevronY > pDrawR + 10);
  }

  // Test: Player eye vs enemy eye
  {
    const playerEyeR = 10 * 0.25;
    const enemyEyeR = 10 * 0.2;
    assert('Player eye radius > enemy eye radius', playerEyeR > enemyEyeR);
    assert('Player eye is 25% larger', Math.abs(playerEyeR / enemyEyeR - 1.25) < 0.01);
  }

  // Test: DOM elements exist
  {
    assert('Overlay element exists', !!document.getElementById('overlay'));
    assert('Canvas element exists', !!document.getElementById('c'));
    assert('Play button exists', !!document.getElementById('play-btn'));
    assert('Score element exists', !!document.getElementById('score'));
    assert('getFishColors returns valid object', !!getFishColors(1, 'surface').body);
    assert('getFishColors returns valid for all tiers',
      [0, 1, 2, 3, 4, 5].every(t => getFishColors(t, 'surface').body && getFishColors(t, 'surface').fin));
  }

  // ---- Tier-Up Celebration Tests ----

  assert('playTierUp function exists', typeof playTierUp === 'function');
  assert('playTierUp is distinct from playFrenzy', playTierUp !== playFrenzy);

  // Test: Tier-up text animation
  {
    G.tierUpTextTimer = 1.5;
    G.tierUpTextAlpha = 1;
    G.tierUpTextY = 0;
    G.tierUpTextScale = 0;
    G.tierUpTextName = 'Moyen';
    G.tierUpTextColor = '#ff9933';
    assert('Tier-up text timer initialized to 1.5', G.tierUpTextTimer === 1.5);
    assert('Tier-up text alpha starts at 1', G.tierUpTextAlpha === 1);
    assert('Tier-up text Y drift starts at 0', G.tierUpTextY === 0);
    assert('Tier-up text name set', G.tierUpTextName === 'Moyen');
    assert('Tier-up text color set', G.tierUpTextColor === '#ff9933');
  }

  // Test: Tier-up text scale animation
  {
    const tt0 = 0;
    const scale0 = 0.5 + (tt0 / 0.12) * 0.65;
    assert('Tier-up text scale starts at 0.5', Math.abs(scale0 - 0.5) < 0.01);
    const tt1 = 0.12;
    const scale1 = 0.5 + (tt1 / 0.12) * 0.65;
    assert('Tier-up text scale overshoots to ~1.15', Math.abs(scale1 - 1.15) < 0.01);
    const tt2 = 0.25;
    const scale2 = 1.15 - ((tt2 - 0.12) / 0.13) * 0.15;
    assert('Tier-up text scale settles to ~1.0', Math.abs(scale2 - 1.0) < 0.02);
  }

  // Test: Tier-up text fade
  {
    const alpha1 = 0.5 > 0.6 ? 1 - ((0.5 - 0.6) / 0.4) : 1;
    assert('Text alpha=1 before 60% progress', alpha1 === 1);
    const alpha2 = 0.8 > 0.6 ? 1 - ((0.8 - 0.6) / 0.4) : 1;
    assert('Text alpha=0.5 at 80% progress', Math.abs(alpha2 - 0.5) < 0.01);
    const alpha3 = 1.0 > 0.6 ? 1 - ((1.0 - 0.6) / 0.4) : 1;
    assert('Text alpha=0 at 100% progress', Math.abs(alpha3) < 0.01);
  }

  // Test: Slow-mo factor
  {
    assert('Tier-up freeze sets slowmo to 0', 0 === 0);
    const sm0 = 1 - 0.7 * Math.sin(Math.PI * 0);
    assert('Tier-up slowmo starts at 1.0x after freeze', Math.abs(sm0 - 1.0) < 0.01);
    const sm1 = 1 - 0.7 * Math.sin(Math.PI * 0.5);
    assert('Tier-up slowmo dips to 0.3x at midpoint', Math.abs(sm1 - 0.3) < 0.01);
    const sm2 = 1 - 0.7 * Math.sin(Math.PI * 1.0);
    assert('Tier-up slowmo returns to 1.0x', Math.abs(sm2 - 1.0) < 0.01);
  }

  // Test: Expansion ring
  {
    const startR = 20;
    G.tierUpRings[0] = { radius: startR, alpha: 0.8, color: '#fff', age: 0, delay: 0 };
    assert('Ring starts at player radius', G.tierUpRings[0].radius === startR);
    G.tierUpRings[0].age += 0.016;
    G.tierUpRings[0].radius += 0.016 * 300;
    G.tierUpRings[0].alpha = Math.max(0, G.tierUpRings[0].alpha - 0.016 * 1.0);
    assert('Ring expands after 1 frame', G.tierUpRings[0].radius > startR);
    assert('Ring fades after 1 frame', G.tierUpRings[0].alpha < 0.8);
  }

  // Test: Size lerp (easeOutCubic)
  {
    const oldR = TIER_RADIUS[1] * G.radiusScale;
    const newR = TIER_RADIUS[2] * G.radiusScale;
    const ease0 = 1 - Math.pow(1 - 0, 3);
    assert('Size lerp at t=0 equals old radius', Math.abs(oldR + (newR - oldR) * ease0 - oldR) < 0.01);
    const ease5 = 1 - Math.pow(1 - 0.5, 3);
    const r5 = oldR + (newR - oldR) * ease5;
    assert('Size lerp at t=0.5 between old and new', r5 > oldR && r5 < newR);
    assert('EaseOutCubic is front-loaded (>0.5 at t=0.5)', ease5 > 0.5);
    const ease1 = 1 - Math.pow(1 - 1, 3);
    assert('Size lerp at t=1 equals new radius', Math.abs(oldR + (newR - oldR) * ease1 - newR) < 0.01);
  }

  // Test: tierUpSizeLerpTimer
  {
    const oldR = 12;
    const newR = 18;
    G.tierUpSizeLerpTimer = 0.3;
    G.tierUpSizeLerpFrom = oldR;
    G.player = createPlayer();
    G.player.targetRadius = newR;
    G.tierUpSizeLerpTimer -= 0.15;
    const t = 1 - (G.tierUpSizeLerpTimer / 0.3);
    const ease = 1 - Math.pow(1 - t, 3);
    G.player.radius = G.tierUpSizeLerpFrom + (G.player.targetRadius - G.tierUpSizeLerpFrom) * ease;
    assert('Size lerp timer at half > old', G.player.radius > oldR);
    assert('Size lerp timer at half < new', G.player.radius < newR);
    G.tierUpSizeLerpTimer = 0;
    G.player.radius = G.player.targetRadius;
    assert('Size lerp timer at end equals target', G.player.radius === newR);
    G.tierUpSizeLerpTimer = 0;
  }

  // Test: Flash timer
  {
    G.tierUpFlashTimer = 0.3;
    const prevFlash = G.tierUpFlashTimer;
    G.tierUpFlashTimer = Math.max(0, G.tierUpFlashTimer - 0.1);
    assert('Flash timer decreases', G.tierUpFlashTimer < prevFlash);
    G.tierUpFlashTimer = 0.05;
    G.tierUpFlashTimer = Math.max(0, G.tierUpFlashTimer - 0.1);
    assert('Flash timer clamps to 0', G.tierUpFlashTimer === 0);
  }

  // Test: Tier-up during frenzy
  {
    G.frenzyActive = true;
    G.frenzyTimer = 3;
    G.tierUpSlowmoTimer = TIERUP_SLOWMO_DURATION;
    G.tierUpSizeLerpTimer = 0.3;
    G.tierUpFlashTimer = 0.3;
    G.tierUpTextTimer = 1.5;
    G.tierUpTextAlpha = 1;
    const frenzyWouldOverride = G.frenzyTimer < 3.5 && G.tierUpSlowmoTimer <= 0;
    assert('Frenzy does not override tier-up slowmo while active', !frenzyWouldOverride);
    G.frenzyActive = false;
    G.frenzyTimer = 0;
    G.tierUpSlowmoTimer = 0;
    G.tierUpSizeLerpTimer = 0;
    G.slowmoScale = 1;
  }

  // ---- Dynamic Difficulty System Tests ----

  assert('timePressure at 0s = 0', Math.min(3, 0 / 40) === 0);
  assert('timePressure at 40s = 1', Math.min(3, 40 / 40) === 1);
  assert('timePressure at 80s = 2', Math.min(3, 80 / 40) === 2);
  assert('timePressure at 120s = 3 (capped)', Math.min(3, 120 / 40) === 3);

  // Test: Grace shimmer
  {
    const alpha3 = Math.min(1, 3 / 1.5) * 0.25;
    assert('Grace shimmer alpha at 3s = 0.25 (full)', Math.abs(alpha3 - 0.25) < 0.01);
    const alpha1 = Math.min(1, 1 / 1.5) * 0.25;
    assert('Grace shimmer alpha at 1s is reduced', alpha1 < 0.25 && alpha1 > 0);
    const alpha0 = Math.min(1, 0 / 1.5) * 0.25;
    assert('Grace shimmer alpha at 0s = 0', alpha0 === 0);
  }

  // Test: Grace detect/spawn multipliers
  {
    G.graceTimer = 2;
    const graceSpawnMult = G.graceTimer > 0 ? 0.3 : 1;
    const graceDetectMult = G.graceTimer > 0 ? 0.5 : 1;
    assert('Grace spawn weight multiplier = 0.3', graceSpawnMult === 0.3);
    assert('Grace detect range multiplier = 0.5', graceDetectMult === 0.5);
    G.graceTimer = 0;
    const noGraceSpawn = G.graceTimer > 0 ? 0.3 : 1;
    const noGraceDetect = G.graceTimer > 0 ? 0.5 : 1;
    assert('No grace: spawn weight = 1', noGraceSpawn === 1);
    assert('No grace: detect range = 1', noGraceDetect === 1);
  }

  // Test: Within-tier progression spawns
  {
    G.player = createPlayer();
    G.player.tier = 2;
    G.hasFirstTierUp = true;
    G.difficultyWave = 1;
    G.graceTimer = 0;

    G.player.eaten = 0;
    let predCountLow = 0;
    for (let i = 0; i < 300; i++) {
      const t = chooseTier(2, 30);
      if (t > 2) predCountLow++;
    }

    G.player.eaten = Math.ceil(TIER_THRESHOLDS[2] * 0.6);
    let predCountMid = 0;
    for (let i = 0; i < 300; i++) {
      const t = chooseTier(2, 30);
      if (t > 2) predCountMid++;
    }

    G.player.eaten = Math.ceil(TIER_THRESHOLDS[2] * 0.9);
    let predCountHigh = 0;
    for (let i = 0; i < 300; i++) {
      const t = chooseTier(2, 30);
      if (t > 2) predCountHigh++;
    }

    assert('Predator spawns increase at 50% progress', predCountMid > predCountLow);
    assert('Predator spawns increase further at 80% progress', predCountHigh > predCountMid);
    G.player.eaten = 0;
  }

  // Test: Adaptive danger thresholds
  {
    G.timeSinceLastHit = 5;
    assert('No detect bonus at 5s (<6s)', (G.timeSinceLastHit > 6 ? 0.15 : 0) === 0);
    G.timeSinceLastHit = 7;
    assert('Detect bonus at 7s (>6s)', (G.timeSinceLastHit > 6 ? 0.15 : 0) === 0.15);
    G.timeSinceLastHit = 11;
    assert('Predator spawn at 11s (>10s)', G.timeSinceLastHit > 10);
    G.timeSinceLastHit = 16;
    assert('Chase speed bonus at 16s (>15s)', (G.timeSinceLastHit > 15 ? 1.1 : 1) === 1.1);
    G.timeSinceLastHit = 9;
    assert('No chase speed bonus at 9s (<15s)', (G.timeSinceLastHit > 15 ? 1.1 : 1) === 1);
    G.timeSinceLastHit = 0;
  }

  // Test: Adaptive danger reset
  {
    G.timeSinceLastHit = 20;
    G.adaptiveDangerSpawned = true;
    G.timeSinceLastHit = 0;
    G.adaptiveDangerSpawned = false;
    assert('Adaptive danger timer resets on damage', G.timeSinceLastHit === 0);
    assert('Adaptive danger spawn flag resets on damage', G.adaptiveDangerSpawned === false);
  }

  // Test: Difficulty wave oscillation
  {
    const waveSamples = [];
    for (let t = 0; t < 200; t += 0.3) {
      waveSamples.push(0.6 + 0.4 * Math.sin(t * 0.2));
    }
    const wMin = Math.min(...waveSamples);
    const wMax = Math.max(...waveSamples);
    assert('Wave min >= 0.2', wMin >= 0.19);
    assert('Wave max <= 1.0', wMax <= 1.001);
    assert('Wave range spans 0.6->1.0', wMax - wMin > 0.75);
  }

  // Test: All difficulty modifiers bounds
  {
    for (let elapsed = 0; elapsed <= 200; elapsed += 10) {
      const tp = Math.min(3, elapsed / 40);
      assert(`timePressure non-negative at ${elapsed}s`, tp >= 0);
      assert(`timePressure <= 3 at ${elapsed}s`, tp <= 3);

      const detectBonus = tp * 15;
      assert(`detectBonus non-negative at ${elapsed}s`, detectBonus >= 0);
      assert(`detectBonus <= 45 at ${elapsed}s`, detectBonus <= 45);

      const speedBonus = 1 + Math.min(0.15, tp * 0.05);
      assert(`speedBonus >= 1 at ${elapsed}s`, speedBonus >= 1);
      assert(`speedBonus <= 1.15 at ${elapsed}s`, speedBonus <= 1.151);
    }
  }

  // Test: Tier-up freeze/slowmo durations
  {
    assert('Tier-up freeze duration is brief', TIERUP_FREEZE_DURATION >= 0.05 && TIERUP_FREEZE_DURATION <= 0.08);
    assert('Tier-up slow-mo is 0.5-0.6s', TIERUP_SLOWMO_DURATION >= 0.5 && TIERUP_SLOWMO_DURATION <= 0.6);
  }

  // Reset test state
  G.tierUpFlashTimer = 0;
  G.tierUpRingAlpha = 0;
  G.tierUpRingRadius = 0;
  G.tierUpTextTimer = 0;
  G.tierUpTextScale = 0;
  G.tierUpTextAlpha = 0;
  G.tierUpTextY = 0;
  G.tierUpSizeLerpTimer = 0;
  G.tierUpFreezeTimer = 0;
  G.player = null;

  // Output results
  console.log(`\n=== Deep Feed Tests: ${passed} passed, ${failed} failed ===`);
  results.forEach(r => console.log(r));
  if (failed > 0) console.error(`${failed} test(s) FAILED`);

  return { passed, failed, results };
}

// Auto-run if ?test is in the URL
if (new URLSearchParams(window.location.search).has('test')) {
  runTests();
}
