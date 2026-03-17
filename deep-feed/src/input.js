// ============================================================
//  INPUT HANDLING — touch, mouse, keyboard
// ============================================================

import G from './state.js';
import {
  JOYSTICK_DEAD_ZONE, JOYSTICK_MAX_RADIUS,
  INERTIA_DURATION, PLAYER_BASE_SPEED,
  TAIL_FLICK_VELOCITY_THRESHOLD, TAIL_FLICK_DURATION, TAIL_FLICK_COOLDOWN,
  TOUCH_OFFSET_Y,
} from './constants.js';
import { ensureAudio, haptic, playTailFlick } from './audio.js';
import { spawnBubble } from './particles.js';
import { canvas } from './dom.js';

function updateJoystickFromTouch(tx, ty) {
  const dx = tx - G.joystick.originX;
  const dy = ty - G.joystick.originY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const clampedDist = Math.min(dist, JOYSTICK_MAX_RADIUS);
  const angle = Math.atan2(dy, dx);

  G.joystick.currentX = G.joystick.originX + Math.cos(angle) * clampedDist;
  G.joystick.currentY = G.joystick.originY + Math.sin(angle) * clampedDist;

  if (dist < JOYSTICK_DEAD_ZONE) {
    G.joystick.dx = 0; G.joystick.dy = 0; G.joystick.tilt = 0;
  } else {
    const effectiveDist = clampedDist - JOYSTICK_DEAD_ZONE;
    const maxEffective = JOYSTICK_MAX_RADIUS - JOYSTICK_DEAD_ZONE;
    G.joystick.tilt = Math.min(1, effectiveDist / maxEffective);
    G.joystick.dx = Math.cos(angle) * G.joystick.tilt;
    G.joystick.dy = Math.sin(angle) * G.joystick.tilt;
  }
  G.joystick.angle = angle;
  G.joystick.glowDir = angle;

  G.joystickVelocity.x = tx - G.joystickPrevPos.x;
  G.joystickVelocity.y = ty - G.joystickPrevPos.y;
  G.joystickPrevPos.x = tx;
  G.joystickPrevPos.y = ty;
}

function releaseJoystick() {
  G.joystick.releaseFromX = G.joystick.currentX - G.joystick.originX;
  G.joystick.releaseFromY = G.joystick.currentY - G.joystick.originY;
  G.joystick.releaseAnimT = 1.0;

  if (G.joystick.tilt > 0.2 && G.player) {
    const speed = PLAYER_BASE_SPEED * G.joystick.tilt;
    G.playerInertiaVx = Math.cos(G.joystick.angle) * speed;
    G.playerInertiaVy = Math.sin(G.joystick.angle) * speed;
    G.playerInertiaTimer = INERTIA_DURATION;
  }

  const swipeVel = Math.sqrt(G.joystickVelocity.x ** 2 + G.joystickVelocity.y ** 2);
  if (swipeVel > TAIL_FLICK_VELOCITY_THRESHOLD && G.tailFlickCooldown <= 0) {
    const flickAngle = Math.atan2(G.joystickVelocity.y, G.joystickVelocity.x);
    G.tailFlickActive = true;
    G.tailFlickTimer = TAIL_FLICK_DURATION;
    G.tailFlickCooldown = TAIL_FLICK_COOLDOWN;
    G.tailFlickDirX = Math.cos(flickAngle);
    G.tailFlickDirY = Math.sin(flickAngle);
    G.tailFlickSquash = 1.0;
    playTailFlick();
    haptic(20);
    if (G.player) {
      for (let i = 0; i < 5; i++) spawnBubble(G.player.x - G.tailFlickDirX * G.player.radius, G.player.y - G.tailFlickDirY * G.player.radius);
    }
  }

  G.joystick.active = false;
  G.joystick.touchId = -1;
  G.joystick.dx = 0; G.joystick.dy = 0; G.joystick.tilt = 0;
  G.pointer.active = false;
}

export function setupInput() {
  const boostBtnEl = document.getElementById('boost-btn');
  const pauseBtnEl = document.getElementById('pause-btn');

  // --- Touch: joystick ---
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!G.running || G.paused) return;
    ensureAudio();
    for (const touch of e.changedTouches) {
      const tx = touch.clientX, ty = touch.clientY;
      if (G.joystick.touchId === -1 && tx < G.W * 0.5 && ty > G.H * 0.4) {
        G.isTouch = true;
        G.joystick.active = true;
        G.joystick.touchId = touch.identifier;
        G.joystick.originX = tx; G.joystick.originY = ty;
        G.joystick.currentX = tx; G.joystick.currentY = ty;
        G.joystick.dx = 0; G.joystick.dy = 0; G.joystick.tilt = 0;
        G.joystick.releaseAnimT = 0;
        G.joystickPrevPos.x = tx; G.joystickPrevPos.y = ty;
        G.joystickVelocity.x = 0; G.joystickVelocity.y = 0;
        G.moveTouchId = touch.identifier;
        G.pointer.active = true;
      } else if (G.moveTouchId === -1 && G.joystick.touchId === -1) {
        G.isTouch = true;
        G.moveTouchId = touch.identifier;
        G.pointer.x = tx; G.pointer.y = ty - TOUCH_OFFSET_Y;
        G.pointer.active = true;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === G.joystick.touchId) {
        updateJoystickFromTouch(touch.clientX, touch.clientY);
      } else if (touch.identifier === G.moveTouchId) {
        G.pointer.x = touch.clientX;
        G.pointer.y = touch.clientY - TOUCH_OFFSET_Y;
        G.pointer.active = true;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === G.joystick.touchId) {
        releaseJoystick();
        G.moveTouchId = -1;
      } else if (touch.identifier === G.moveTouchId) {
        G.moveTouchId = -1;
        G.pointer.active = false;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    if (G.joystick.active) releaseJoystick();
    G.moveTouchId = -1;
    G.pointer.active = false;
  }, { passive: false });

  // --- Boost button ---
  if (boostBtnEl) {
    boostBtnEl.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!G.running || G.paused) return;
      ensureAudio();
      G.boosting = true;
      G.boostTouchId = e.changedTouches[0].identifier;
      boostBtnEl.classList.add('active');
    }, { passive: false });
    boostBtnEl.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      G.boosting = false; G.boostTouchId = -1;
      boostBtnEl.classList.remove('active');
    }, { passive: false });
    boostBtnEl.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      G.boosting = false; G.boostTouchId = -1;
      boostBtnEl.classList.remove('active');
    }, { passive: false });
  }

  // --- Desktop mouse ---
  canvas.addEventListener('mousedown', (e) => {
    G.isTouch = false;
    ensureAudio();
    G.pointer.x = e.clientX; G.pointer.y = e.clientY;
    G.pointer.active = true;
    G.boosting = true;
  });
  canvas.addEventListener('mouseup', () => {
    G.boosting = false;
    G.pointer.active = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    G.isTouch = false;
    G.pointer.x = e.clientX; G.pointer.y = e.clientY;
    G.pointer.active = true;
  });

  // --- Keyboard: Escape/P to pause ---
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && G.running) {
      e.preventDefault();
      togglePause();
    }
  });

  // --- Pause button (mobile) ---
  if (pauseBtnEl) {
    pauseBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      if (G.running) togglePause();
    });
    pauseBtnEl.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (G.running) togglePause();
    }, { passive: false });
  }

  // --- Touch device setup ---
  G.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (G.isTouchDevice) {
    if (boostBtnEl) boostBtnEl.style.display = 'block';
    const controlZoneEl = document.getElementById('control-zone');
    if (controlZoneEl) controlZoneEl.classList.add('visible');
    const controlHintEl = document.getElementById('control-hint');
    if (controlHintEl) controlHintEl.textContent = 'Joystick gauche \u2022 Swipe = Tail Flick \u2022 \u26A1 Boost';
    for (let i = 0; i < 20; i++) {
      G.controlZoneParticles.push({
        x: Math.random() * G.W,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.1,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.15,
      });
    }
  } else {
    const controlHintEl = document.getElementById('control-hint');
    if (controlHintEl) controlHintEl.textContent = 'Move mouse \u2022 Click to boost';
  }
}

export function togglePause() {
  G.paused = !G.paused;
  const pauseOverlayEl = document.getElementById('pause-overlay');
  if (pauseOverlayEl) {
    pauseOverlayEl.classList.toggle('visible', G.paused);
  }
}
