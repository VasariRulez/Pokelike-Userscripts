// ==UserScript==
// @name         Pokelike Weakness Panel
// @namespace    https://pokelike.xyz/
// @version      1.2.3
// @description  Adds weakness/resistance panels to Pokelike hover cards and trade rows
// @author       VasariRulez
// @match        https://pokelike.xyz/*
// @match        https://www.pokelike.xyz/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-weakness-panel.user.js
// @updateURL    https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-weakness-panel.user.js
// ==/UserScript==

(function () {
  'use strict';

  if (window.__pokelikeWeaknessPatchInstalled) return;
  window.__pokelikeWeaknessPatchInstalled = true;

  function getLiveTypeChart() {
    try {
      if (typeof window.TYPE_CHART !== 'undefined' && window.TYPE_CHART && typeof window.TYPE_CHART === 'object') {
        return window.TYPE_CHART;
      }
      if (typeof globalThis.TYPE_CHART !== 'undefined' && globalThis.TYPE_CHART && typeof globalThis.TYPE_CHART === 'object') {
        return globalThis.TYPE_CHART;
      }
      if (typeof TYPE_CHART !== 'undefined' && TYPE_CHART && typeof TYPE_CHART === 'object') {
        return TYPE_CHART;
      }
    } catch (err) {}
    return null;
  }

  function hasFairySupport(chart) {
    if (!chart || typeof chart !== 'object') return false;
    if (!Object.hasOwn(chart, 'Fairy') || !chart.Fairy || typeof chart.Fairy !== 'object') return false;
    if (!Object.hasOwn(chart, 'Dragon') || !chart.Dragon || typeof chart.Dragon !== 'object') return false;
    if (!Object.hasOwn(chart, 'Poison') || !chart.Poison || typeof chart.Poison !== 'object') return false;
    if (!Object.hasOwn(chart, 'Steel') || !chart.Steel || typeof chart.Steel !== 'object') return false;

    return (
      chart.Fairy.Dragon === 2 &&
      chart.Dragon.Fairy === 0 &&
      chart.Poison.Fairy === 2 &&
      chart.Steel.Fairy === 2
    );
  }

  function resolveTypeChartState() {
    const liveChart = getLiveTypeChart();

    if (liveChart) {
      const fairyReady = hasFairySupport(liveChart);
      console.log('[Pokelike Weakness Panel] Live TYPE_CHART found. Fairy support:', fairyReady);
      return {
        chart: liveChart,
        fairyReady,
        source: 'page'
      };
    }
  }

  let TYPE_CHART_STATE = resolveTypeChartState();
  let ACTIVE_TYPE_CHART = TYPE_CHART_STATE.chart;

  if (!TYPE_CHART_STATE.fairyReady) {
    console.warn('[Pokelike Weakness Panel] Fairy is not fully supported in the active chart. Install or enable the Fairy fix script if needed.');
  }

  const getAttackTypes = () => Object.keys(ACTIVE_TYPE_CHART);
  const getDefenderTypes = () => Object.keys(ACTIVE_TYPE_CHART);

  let popup = null;
  let popupRefreshScheduled = false;
  let tradeRefreshScheduled = false;
  let activePopupAnchor = null;
  let popupHideTimer = null;
  let tradeObserver = null;
  let popupObserver = null;

  function normalizeType(t) {
    return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : null;
  }

  function getPopup() {
    popup = document.getElementById('team-hover-card');
    return popup;
  }

  function renderTypeBadges(types, extraClass = '') {
    return `
      <span class="weakness-type-badges ${extraClass}">
        ${types.map(type => `<span class="type-badge type-${type.toLowerCase()}">${type}</span>`).join('')}
      </span>
    `;
  }

  function calcDefenseEffectiveness(defenderTypes) {
    return getAttackTypes().map(attacking => {
      let mult = 1;
      defenderTypes.forEach(def => {
        mult *= ACTIVE_TYPE_CHART[attacking]?.[normalizeType(def)] ?? 1;
      });
      return { attacking, mult };
    }).sort((a, b) => b.mult - a.mult);
  }

  function calcAttackMatchups(moveType) {
    const atk = normalizeType(moveType);
    if (!atk || !ACTIVE_TYPE_CHART[atk]) return [];
    return getDefenderTypes().map(def => ({
      defending: def,
      mult: ACTIVE_TYPE_CHART[atk]?.[def] ?? 1
    }))
      .filter(r => r.mult !== 1)
      .sort((a, b) => {
        if (b.mult !== a.mult) return b.mult - a.mult;
        return a.defending.localeCompare(b.defending);
      });
  }

  function weaknessMultColor(mult) {
    if (mult === 0) return '#9ca3af';
    if (mult >= 4) return '#ff4d4f';
    if (mult === 2) return '#ffb020';
    if (mult === 0.5) return '#34d399';
    if (mult <= 0.25) return '#10b981';
    return '#d1d5db';
  }

  function moveMatchupMultColor(mult) {
    if (mult === 0) return '#9ca3af';
    if (mult >= 4) return '#10b981';
    if (mult === 2) return '#34d399';
    if (mult === 0.5) return '#ffb020';
    if (mult <= 0.25) return '#ff4d4f';
    return '#d1d5db';
  }

  function bucketLabel(mult) {
    if (mult === 0) return 'Struggle';
    if (mult > 1) return 'Weak';
    if (mult < 1) return 'Resist';
    return 'Neutral';
  }

  function moveBucketLabel(mult) {
    if (mult === 0) return 'Struggle';
    if (mult > 1) return 'Strong';
    if (mult < 1) return 'Weak';
    return 'Neutral';
  }

  function clearPopupHideTimer() {
    if (popupHideTimer) {
      clearTimeout(popupHideTimer);
      popupHideTimer = null;
    }
  }

  function scheduleHidePopup() {
    clearPopupHideTimer();
    popupHideTimer = setTimeout(() => {
      const p = getPopup();
      if (!p) return;
      const hovered = document.querySelector(':hover');
      const stillOnAnchor = activePopupAnchor && activePopupAnchor.matches(':hover');
      const stillOnPopup = p.matches(':hover') || (hovered && p.contains(hovered));

      if (!stillOnAnchor && !stillOnPopup) {
        hidePopup();
        activePopupAnchor = null;
      }
    }, 80);
  }

  function injectStyles() {
  if (document.getElementById('tm-pokelike-weakness-styles')) return;

  const style = document.createElement('style');
  style.id = 'tm-pokelike-weakness-styles';
  style.textContent = `
  #team-hover-card.weakness-layout-ready {
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 10px !important;
    width: auto !important;
    max-width: min(92vw, 560px) !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    z-index: 99999 !important;
  }

  #team-hover-card.matchup-only {
    width: 220px !important;
    max-width: 220px !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
    z-index: 99999 !important;
  }

  #team-hover-card .poke-card {
    width: 180px !important;
    flex: 0 0 180px !important;
    margin: 0 !important;
  }

  .weakness-side-panel {
    width: 220px;
    flex: 0 0 220px;
    background: var(--bg-card, #e0dcd0);
    border: 2px solid var(--border, #3a3a3a);
    border-radius: 8px;
    box-shadow: 3px 3px 0 0 #181410;
    padding: 8px 9px;
    color: var(--text-main, #181410);
    font-family: 'Press Start 2P', monospace;
  }

  body.dark-mode .weakness-side-panel {
    color: var(--text-main, #e0dcd0);
    box-shadow: 3px 3px 0 0 #000;
  }

  .weakness-title {
    font-size: 8px;
    line-height: 1.6;
    color: var(--accent, #c89820);
    margin-bottom: 6px;
  }

  .weakness-subtitle {
    font-size: 6px;
    line-height: 1.6;
    color: var(--text-dim, #909080);
    margin-bottom: 8px;
  }

  .weakness-section + .weakness-section {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border, #3a3a3a);
  }

  .weakness-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .weakness-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .weakness-row-left {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  .weakness-side-panel .type-badge {
    font-size: 7px !important;
    padding: 2px 5px !important;
    min-width: 56px;
    text-align: center;
  }

  .weakness-type-badges {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    vertical-align: middle;
  }

  .weakness-subtitle .weakness-type-badges {
    margin-left: 4px;
  }

  .weakness-bucket {
    font-size: 6px;
    color: var(--text-dim, #909080);
    white-space: nowrap;
  }

  .weakness-mult {
    font-family: 'Press Start 2P', monospace;
    font-size: 7px;
    min-width: 28px;
    text-align: right;
  }

  .weakness-empty {
    font-size: 6px;
    line-height: 1.6;
    color: var(--text-dim, #909080);
  }

  .trade-member-row {
    display: grid !important;
    grid-template-columns: auto minmax(120px, 180px) minmax(220px, 1fr) auto !important;
    align-items: center !important;
    column-gap: 12px !important;
  }

  .trade-member-info {
    min-width: 0;
  }

  .trade-member-fixed-weaknesses {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-width: 220px;
  }

  .trade-member-fixed-weaknesses .weakness-side-panel {
    width: 100%;
    max-width: 320px;
    padding: 7px 8px;
    background: color-mix(in srgb, var(--bg-card, #e0dcd0) 88%, transparent);
    border-color: color-mix(in srgb, var(--border, #3a3a3a) 92%, transparent);
    box-shadow: 2px 2px 0 0 #181410;
  }

  body.dark-mode .trade-member-fixed-weaknesses .weakness-side-panel {
    box-shadow: 2px 2px 0 0 #000;
  }

  .trade-member-fixed-weaknesses .weakness-title,
  .trade-member-fixed-weaknesses .weakness-subtitle {
    display: none;
  }

  .trade-member-fixed-weaknesses .weakness-section {
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
  }

  .trade-member-fixed-weaknesses .weakness-list {
    gap: 3px;
  }

  .trade-member-fixed-weaknesses .weakness-row {
    gap: 4px;
  }

  .trade-member-fixed-weaknesses .weakness-row-left {
    gap: 4px;
  }

  .trade-member-fixed-weaknesses .type-badge {
    min-width: 50px;
    font-size: 6px !important;
    padding: 2px 4px !important;
  }

  .trade-member-fixed-weaknesses .weakness-bucket {
    font-size: 5px;
  }

  .trade-member-fixed-weaknesses .weakness-mult {
    font-size: 6px;
    min-width: 24px;
  }

  @media (max-width: 900px) {
    .trade-member-row {
      grid-template-columns: auto 1fr auto !important;
      align-items: start !important;
    }

    .trade-member-fixed-weaknesses {
      grid-column: 2 / 4;
      margin-top: 6px;
      min-width: 0;
    }

    .trade-member-fixed-weaknesses .weakness-side-panel {
      max-width: 100%;
    }
  }
  `;
  document.head.appendChild(style);
}

  function extractTypesFromCard(cardEl) {
    return [...cardEl.querySelectorAll('.poke-types .type-badge')]
      .map(el => (el.textContent || '').trim())
      .filter(Boolean)
      .map(normalizeType);
  }

  function extractMoveTypeFromCard(cardEl) {
    const moveHeaderBadges = [...cardEl.querySelectorAll('.poke-move .type-badge')];
    if (!moveHeaderBadges.length) return null;
    return normalizeType((moveHeaderBadges[moveHeaderBadges.length - 1].textContent || '').trim());
  }

  function extractTypesFromEnemyPrepSlot(slotEl) {
    return [...slotEl.querySelectorAll('.type-badge')]
      .map(el => (el.textContent || '').trim())
      .filter(Boolean)
      .map(normalizeType);
  }

  function extractTypesFromTradeRow(rowEl) {
    return [...rowEl.querySelectorAll('.trade-member-types .type-badge')]
      .map(el => (el.textContent || '').trim())
      .filter(Boolean)
      .map(normalizeType);
  }

  function renderRows(rows, keyName, colorFn) {
    return rows.map(r => {
      const rightText = r.mult === 0 ? '50PWR' : `${r.mult}×`;
      return `
        <div class="weakness-row">
          <div class="weakness-row-left">
            <span class="type-badge type-${String(r[keyName]).toLowerCase()}">${r[keyName]}</span>
            <span class="weakness-bucket">${r.label}</span>
          </div>
          <span class="weakness-mult" style="color:${colorFn(r.mult)}">${rightText}</span>
        </div>
      `;
    }).join('');
  }

  function buildWeaknessOnlyPanel(types, moveType = null) {
    const defenseRows = calcDefenseEffectiveness(types)
      .filter(r => r.mult !== 1)
      .map(r => ({ attacking: r.attacking, mult: r.mult, label: bucketLabel(r.mult) }));

    const moveRows = moveType
      ? calcAttackMatchups(moveType).map(r => ({ defending: r.defending, mult: r.mult, label: moveBucketLabel(r.mult) }))
      : [];

    const panel = document.createElement('div');
    panel.className = 'weakness-side-panel';
    panel.innerHTML = `
      <div class="weakness-section">
        <div class="weakness-title">Weaknesses</div>
        <div class="weakness-subtitle">Defender: ${renderTypeBadges(types)}</div>
        <div class="weakness-list">
          ${defenseRows.length ? renderRows(defenseRows, 'attacking', weaknessMultColor) : `<div class="weakness-empty">No non-neutral matchups</div>`}
        </div>
      </div>
      <div class="weakness-section">
        <div class="weakness-title">Move Matchups</div>
        <div class="weakness-subtitle">Move: ${moveType ? renderTypeBadges([moveType]) : 'Unknown'}</div>
        <div class="weakness-list">
          ${moveType
            ? (moveRows.length ? renderRows(moveRows, 'defending', moveMatchupMultColor) : `<div class="weakness-empty">Only neutral targets</div>`)
            : `<div class="weakness-empty">Move type not found</div>`}
        </div>
      </div>
    `;
    return panel;
  }

  function buildWeaknessPanel(types, moveType) {
    return buildWeaknessOnlyPanel(types, moveType);
  }

  function buildTradeFixedWeaknessPanel(types) {
    const defenseRows = calcDefenseEffectiveness(types)
      .filter(r => r.mult !== 1)
      .map(r => ({ attacking: r.attacking, mult: r.mult, label: bucketLabel(r.mult) }));

    const wrap = document.createElement('div');
    wrap.className = 'trade-member-fixed-weaknesses';

    const panel = document.createElement('div');
    panel.className = 'weakness-side-panel';
    panel.innerHTML = `
      <div class="weakness-section">
        <div class="weakness-list">
          ${defenseRows.length ? renderRows(defenseRows, 'attacking', weaknessMultColor) : `<div class="weakness-empty">No non-neutral matchups</div>`}
        </div>
      </div>
    `;
    wrap.appendChild(panel);
    return wrap;
  }

  function placePopup(anchorEl) {
    const p = getPopup();
    if (!p || !anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const popupW = p.offsetWidth || 240;
    const popupH = p.offsetHeight || 260;

    let left = rect.right + 8;
    let top = rect.top;

    if (left + popupW > window.innerWidth - 8) left = rect.left - popupW - 8;
    if (left < 8) left = 8;
    if (top + popupH > window.innerHeight - 8) top = Math.max(8, window.innerHeight - popupH - 8);
    if (top < 8) top = 8;

    p.style.left = `${left}px`;
    p.style.top = `${top}px`;
  }

  function applyPopupModeStyles(mode) {
    const p = getPopup();
    if (!p) return;

    p.style.flexDirection = '';
    p.style.alignItems = '';
    p.style.gap = '';
    p.style.width = '';
    p.style.maxWidth = '';

    if (mode === 'full') {
      p.style.display = 'flex';
      p.style.flexDirection = 'row';
      p.style.alignItems = 'flex-start';
      p.style.gap = '10px';
      p.style.width = 'auto';
      p.style.maxWidth = 'min(92vw, 560px)';
    } else {
      p.style.display = 'block';
      p.style.width = '220px';
      p.style.maxWidth = '220px';
    }
  }

  function ensurePopupLayout(mode) {
    const p = getPopup();
    if (!p) return;

    p.classList.remove('weakness-layout-ready', 'matchup-only');

    if (mode === 'full') p.classList.add('weakness-layout-ready');
    else p.classList.add('matchup-only');

    applyPopupModeStyles(mode);
  }

  function enhanceTradeRowsFixed() {
    const rows = document.querySelectorAll('#trade-screen .trade-member-row');

    rows.forEach(row => {
      const types = extractTypesFromTradeRow(row);
      const sig = JSON.stringify(types);
      const existing = row.querySelector('.trade-member-fixed-weaknesses');

      if (!types.length) {
        existing?.remove();
        delete row.dataset.tradeWeaknessSignature;
        return;
      }

      if (existing && row.dataset.tradeWeaknessSignature === sig) return;

      existing?.remove();

      const fixedPanel = buildTradeFixedWeaknessPanel(types);
      const arrow = row.querySelector('.trade-member-arrow');
      if (arrow) row.insertBefore(fixedPanel, arrow);
      else row.appendChild(fixedPanel);

      row.dataset.tradeWeaknessSignature = sig;
    });
  }

  function scheduleTradeRefresh() {
    if (tradeRefreshScheduled) return;
    tradeRefreshScheduled = true;
    requestAnimationFrame(() => {
      tradeRefreshScheduled = false;
      enhanceTradeRowsFixed();
    });
  }

  function renderFullPopupFromCard(cardEl, anchorEl) {
    const p = getPopup();
    if (!p) return;

    activePopupAnchor = anchorEl;
    clearPopupHideTimer();

    const cardHtml = cardEl.outerHTML;
    const currentHtml = p.querySelector('.poke-card')?.outerHTML || '';

    if (currentHtml !== cardHtml || p.classList.contains('matchup-only')) {
      p.innerHTML = cardHtml;
    }

    ensurePopupLayout('full');

    const types = extractTypesFromCard(p);
    const moveType = extractMoveTypeFromCard(p);

    const existingPanel = p.querySelector('.weakness-side-panel');
    existingPanel?.remove();

    if (types.length) {
      p.appendChild(buildWeaknessPanel(types, moveType));
    }

    placePopup(anchorEl);
  }

  function renderMatchupOnlyFromCard(cardEl, anchorEl) {
    const p = getPopup();
    if (!p) return;

    activePopupAnchor = anchorEl;
    clearPopupHideTimer();

    const types = extractTypesFromCard(cardEl);
    const moveType = extractMoveTypeFromCard(cardEl);
    if (!types.length) return;

    p.innerHTML = '';
    ensurePopupLayout('matchup-only');
    p.appendChild(buildWeaknessOnlyPanel(types, moveType));
    placePopup(anchorEl);
  }

  function renderEliteEnemyWeaknessOnly(slotEl, anchorEl) {
    const p = getPopup();
    if (!p) return;

    activePopupAnchor = anchorEl;
    clearPopupHideTimer();

    const types = extractTypesFromEnemyPrepSlot(slotEl);
    if (!types.length) return;

    p.innerHTML = '';
    ensurePopupLayout('matchup-only');
    p.appendChild(buildWeaknessOnlyPanel(types, null));
    placePopup(anchorEl);
  }

  function renderTeamPopupWithWeaknesses() {
    const p = getPopup();
    if (!p || p.style.display === 'none' || !p.innerHTML.trim()) return;
    if (p.classList.contains('matchup-only')) return;

    const types = extractTypesFromCard(p);
    const moveType = extractMoveTypeFromCard(p);
    if (!types.length) return;

    ensurePopupLayout('full');

    const existingPanel = p.querySelector('.weakness-side-panel');
    existingPanel?.remove();
    p.appendChild(buildWeaknessPanel(types, moveType));
  }

  function hidePopup() {
    const p = getPopup();
    if (!p) return;

    clearPopupHideTimer();
    p.classList.remove('weakness-layout-ready', 'matchup-only');
    p.style.display = 'none';
    p.style.flexDirection = '';
    p.style.alignItems = '';
    p.style.gap = '';
    p.style.width = '';
    p.style.maxWidth = '';
  }

  function getSpecialCardContext(target) {
    const starterCard = target.closest('#starter-choices .poke-card');
    if (starterCard) return { card: starterCard, mode: 'matchup-only' };

    const catchCard = target.closest('#catch-choices .poke-card');
    if (catchCard) return { card: catchCard, mode: 'matchup-only' };

    const shinyCard = target.closest('#shiny-content .poke-card');
    if (shinyCard) return { card: shinyCard, mode: 'matchup-only' };

    const swapChoiceCard = target.closest('#swap-choices .poke-card');
    if (swapChoiceCard) return { card: swapChoiceCard, mode: 'matchup-only' };

    const swapIncomingCard = target.closest('#swap-incoming .poke-card');
    if (swapIncomingCard) return { card: swapIncomingCard, mode: 'matchup-only' };

    const winScreenCard = target.closest('#win-team .poke-card');
    if (winScreenCard) return { card: winScreenCard, mode: 'matchup-only' };

    const eliteEnemy = target.closest('#elite-prep-enemy-team .elite-prep-enemy-slot');
    if (eliteEnemy) return { card: eliteEnemy, mode: 'elite-enemy' };

    const genericPopupCard = target.closest('.poke-card');
    if (genericPopupCard) return { card: genericPopupCard, mode: 'full' };

    return null;
  }

  function schedulePopupRefresh() {
    if (popupRefreshScheduled) return;
    popupRefreshScheduled = true;
    requestAnimationFrame(() => {
      popupRefreshScheduled = false;
      renderTeamPopupWithWeaknesses();
    });
  }

  function installObservers() {
    const tradeScreen = document.getElementById('trade-screen');
    if (tradeScreen && !tradeObserver) {
      tradeObserver = new MutationObserver(() => scheduleTradeRefresh());
      tradeObserver.observe(tradeScreen, { childList: true, subtree: true });
    }

    const p = getPopup();
    if (p && !popupObserver) {
      popupObserver = new MutationObserver(() => {
        if (p.style.display === 'none' || !p.innerHTML.trim()) return;
        schedulePopupRefresh();
      });

      popupObserver.observe(p, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });

      p.addEventListener('mouseenter', clearPopupHideTimer, true);
      p.addEventListener('mouseleave', scheduleHidePopup, true);
    }
  }

  function installEvents() {
    document.addEventListener('mouseover', (e) => {
      const ctx = getSpecialCardContext(e.target);
      if (!ctx) return;

      if (ctx.mode === 'matchup-only') {
        renderMatchupOnlyFromCard(ctx.card, ctx.card);
        return;
      }

      if (ctx.mode === 'elite-enemy') {
        renderEliteEnemyWeaknessOnly(ctx.card, ctx.card);
        return;
      }

      if (ctx.mode === 'full') {
        if (ctx.card.closest('#team-hover-card')) return;
        renderFullPopupFromCard(ctx.card, ctx.card);
      }
    }, true);

    document.addEventListener('mousemove', (e) => {
      const p = getPopup();
      const ctx = getSpecialCardContext(e.target);
      if (!ctx || !p) return;

      if ((ctx.mode === 'matchup-only' || ctx.mode === 'elite-enemy') && p.classList.contains('matchup-only')) {
        placePopup(ctx.card);
        return;
      }

      if (ctx.mode === 'full' && p.style.display !== 'none' && !p.classList.contains('matchup-only')) {
        if (ctx.card.closest('#team-hover-card')) return;
        placePopup(ctx.card);
      }
    }, true);

    document.addEventListener('mouseout', (e) => {
      const p = getPopup();
      const ctx = getSpecialCardContext(e.target);
      if (!ctx || !p) return;

      const related = e.relatedTarget;
      if (related && (ctx.card.contains(related) || p.contains(related))) return;

      scheduleHidePopup();
    }, true);

    document.addEventListener('click', (e) => {
      const p = getPopup();
      const ctx = getSpecialCardContext(e.target);
      if (!p) return;

      if (!ctx && p.style.display !== 'none' && !p.contains(e.target)) {
        hidePopup();
        activePopupAnchor = null;
      }
    }, true);
  }

  function bootstrap() {
    injectStyles();
    getPopup();
    installObservers();
    enhanceTradeRowsFixed();
  }

  installEvents();
  bootstrap();

  const bootObserver = new MutationObserver(() => {
    bootstrap();
  });

  bootObserver.observe(document.body, { childList: true, subtree: true });

  console.log('Pokelike Weakness Panel active');
})();