// ============================================================
//  UI — HUD update, game over screen, pause overlay
// ============================================================

import G from './state.js';
import {
  TIER_COUNT, TIER_NAMES, ZONE_NAMES, TIER_COLORS,
  TIER_THRESHOLDS, PRESTIGE_EXTRA_EATS, BOOST_MAX,
} from './constants.js';
import { getFishColors } from './zones.js';
import { stopAmbientAudio, playGameOver } from './audio.js';

export function updateHUD() {
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highscore');
  const depthInfoEl = document.getElementById('depth-info');
  const sizeInfoEl = document.getElementById('size-info');
  const sizeBarEl = document.getElementById('size-bar');
  const boostBarEl = document.getElementById('boost-bar');

  const scoreText = String(G.score);
  if (scoreEl && scoreEl.textContent !== scoreText) {
    scoreEl.textContent = scoreText;
    scoreEl.classList.remove('pulse');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('pulse');
  }
  if (highScoreEl && G.highScore > 0) highScoreEl.textContent = `Record : ${G.highScore}`;

  if (depthInfoEl) {
    if (G.depthLevel > 1) {
      depthInfoEl.textContent = `Profondeur ${G.depthLevel} — x${G.scoreMultiplier}`;
      depthInfoEl.style.display = 'block';
    } else {
      depthInfoEl.style.display = 'none';
    }
  }

  if (G.player && sizeInfoEl) {
    const zoneName = ZONE_NAMES[G.player.tier] || 'Surface';
    sizeInfoEl.textContent = `${TIER_NAMES[G.player.tier]} — ${zoneName}`;
    if (sizeBarEl) {
      if (G.player.tier < TIER_COUNT - 1) {
        const progress = (G.player.eaten / TIER_THRESHOLDS[G.player.tier]) * 100;
        sizeBarEl.style.width = Math.min(100, progress) + '%';
        const c1 = getFishColors(G.player.tier, G.currentZone);
        const c2 = getFishColors(G.player.tier + 1, G.currentZone);
        sizeBarEl.style.background = `linear-gradient(90deg, ${c1.body}, ${c2.body})`;
      } else {
        const progress = (G.prestigeEats / PRESTIGE_EXTRA_EATS) * 100;
        sizeBarEl.style.width = Math.min(100, progress) + '%';
        sizeBarEl.style.background = 'linear-gradient(90deg, #bb55ff, #ffcc00)';
      }
    }
  }
  if (boostBarEl) boostBarEl.style.width = (G.boostFuel / BOOST_MAX * 100) + '%';
}

export function gameOver() {
  const finalScore = G.score;
  const isNewRecord = finalScore > G.highScore;

  if (isNewRecord) {
    G.highScore = finalScore;
    localStorage.setItem('deepfeed_hi', String(G.highScore));
  }

  const timeSurvived = ((performance.now() - G.startTime) / 1000).toFixed(1);
  const minutes = Math.floor(timeSurvived / 60);
  const seconds = (timeSurvived % 60).toFixed(0);
  const timeStr = minutes > 0 ? `${minutes}min ${seconds}s` : `${timeSurvived}s`;

  const deathTitle = G.deathReason === 'oxygen'
    ? "Plus d'air ! \u{1FAE7}\u{1F480}"
    : "Tu t'es fait manger ! \u{1F41F}\u{1F480}";

  let html = '';
  html += `<div class="death-title">${deathTitle}</div>`;
  html += `<div class="final-score${isNewRecord ? ' record' : ''}">${finalScore}</div>`;
  if (isNewRecord) {
    html += `<div class="record-badge">\u{1F3C6} Nouveau record !</div>`;
  } else if (G.highScore > 0) {
    html += `<div style="font-size:13px;opacity:.5;margin-bottom:8px">Record : ${G.highScore}</div>`;
  }

  // Fish eaten by tier summary
  let hasFishStats = false;
  let fishHtml = '<div class="fish-summary">';
  for (let t = 0; t < TIER_COUNT; t++) {
    if (G.fishEatenByTier[t] > 0) {
      hasFishStats = true;
      const color = TIER_COLORS[t].body;
      fishHtml += `<div class="fish-summary-item"><span class="fish-dot" style="background:${color}"></span>\u00D7${G.fishEatenByTier[t]}</div>`;
    }
  }
  fishHtml += '</div>';
  if (hasFishStats) html += fishHtml;

  // Progress hint
  if (G.player && G.player.tier < TIER_COUNT - 1) {
    const pointsNeeded = TIER_THRESHOLDS[G.player.tier] - G.player.eaten;
    const progressPct = (G.player.eaten / TIER_THRESHOLDS[G.player.tier]) * 100;
    if (pointsNeeded > 0 && pointsNeeded <= TIER_THRESHOLDS[G.player.tier]) {
      const nextName = TIER_NAMES[G.player.tier + 1];
      html += `<div class="progress-hint">Encore un peu et tu grandissais ! \u{1F41F}\u2192${nextName}</div>`;
      html += `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.min(100, progressPct)}%"></div></div>`;
    }
  }

  // Enhanced stats
  html += '<div id="end-stats-rows">';
  const addStat = (label, value) => {
    html += `<div class="stat-row"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;
  };

  addStat('Taille max', TIER_NAMES[G.maxTierReached]);
  if (G.depthLevel > 1) addStat('Profondeur max', `${G.maxDepthReached}`);

  // Enhanced: fish eaten breakdown with % plankton
  const totalEaten = G.totalFishEaten;
  const planktonEaten = G.fishEatenByTier[0];
  if (totalEaten > 0) {
    const planktonPct = Math.round((planktonEaten / totalEaten) * 100);
    const realFishPct = 100 - planktonPct;
    addStat('Poissons mang\u00E9s', `${totalEaten}`);
    if (planktonEaten > 0 && totalEaten > planktonEaten) {
      addStat('Vrais poissons', `${realFishPct}% (${totalEaten - planktonEaten})`);
    }
  }

  if (G.bestFrenzy > 0) addStat('Meilleur combo', `${G.bestFrenzy} d'affil\u00E9e`);

  // Enhanced: zones reached
  const zonesReached = [];
  if (G.maxTierReached >= 1) zonesReached.push('Surface');
  if (G.maxTierReached >= 3) zonesReached.push('R\u00E9cif');
  if (G.maxTierReached >= 4) zonesReached.push('Cr\u00E9pusculaire');
  if (G.maxTierReached >= 5) zonesReached.push('Abysses');
  if (zonesReached.length > 1) addStat('Zones', zonesReached.join(' \u2192 '));

  addStat('Dur\u00E9e', timeStr);
  html += '</div>';

  // Depth retry system
  let retryRemaining = 0;
  if (G.depthLevel >= 2) {
    // New depth or same depth retry?
    if (G.retryDepthLevel !== G.depthLevel) {
      // First death at this depth — start fresh retry sequence
      G.retryDepthLevel = G.depthLevel;
      G.depthRetryCount = 1;
    } else {
      G.depthRetryCount++;
    }

    if (G.depthRetryCount <= 3) {
      retryRemaining = 3 - G.depthRetryCount;
      html += `<div class="depth-retry-info">Tentative ${G.depthRetryCount}/3 à la Profondeur ${G.depthLevel}</div>`;
    } else {
      // Exhausted retries
      html += `<div class="depth-retry-info exhausted">Retour à la Profondeur 1...</div>`;
      G.retryDepthLevel = 0;
      G.depthRetryCount = 0;
    }
  } else {
    // Died at depth 1 — reset retry state
    G.retryDepthLevel = 0;
    G.depthRetryCount = 0;
  }

  const endStatsEl = document.getElementById('end-stats');
  if (endStatsEl) endStatsEl.innerHTML = html;

  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    if (retryRemaining > 0) {
      playBtn.textContent = `Réessayer (${retryRemaining} restante${retryRemaining > 1 ? 's' : ''})`;
    } else {
      playBtn.textContent = 'Replonger';
    }
  }

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.remove('hidden');

  updateHUD();
  stopAmbientAudio();

  // Save max tier
  const prevMaxTier = parseInt(localStorage.getItem('deepfeed_maxTier') || '1', 10);
  if (G.maxTierReached > prevMaxTier) localStorage.setItem('deepfeed_maxTier', String(G.maxTierReached));
}
