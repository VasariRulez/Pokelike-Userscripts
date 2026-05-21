// ==UserScript==
// @name         Pokelike Team Slot Edit Nickname Button
// @namespace    https://pokelike.xyz/
// @version      1.1.0
// @description  Adds a small ✎ button to each team slot to edit pokemon nickname.
// @author       VasariRulez
// @match        https://pokelike.xyz/*
// @match        https://www.pokelike.xyz/*
// @grant        none
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-pokemon-nickname-edit.user.js
// @updateURL    https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-pokemon-nickname-edit.user.js
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ID = 'tm-edit-slot-style';
  const BTN_CLASS = 'tm-edit-slot-btn';
  const OVERLAY_ID = 'tm-edit-slot-overlay';
  const MODAL_ID = 'tm-edit-slot-modal';

  function getState() {
    return state || null;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .team-slot {
        position: relative;
      }

      .${BTN_CLASS} {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        z-index: 20;
        pointer-events: auto;
        touch-action: manipulation;
        cursor: pointer !important;
        user-select: none;
        -webkit-user-select: none;
        border: 1px solid rgba(24,20,16,0.9);
        background: #e8e4d8;
        color: #181410;
        font-family: monospace;
        font-size: 12px;
        line-height: 1;
        box-shadow: 1px 1px 0 0 #181410;
      }

      .${BTN_CLASS}:hover {
        background: #d8d4c8;
      }

      .${BTN_CLASS}:active {
        transform: translate(1px, 1px);
        box-shadow: none;
      }

      body.dark-mode .${BTN_CLASS} {
        background: #252118;
        color: #e0dcd0;
        border-color: #4a4438;
        box-shadow: 1px 1px 0 0 #000;
      }

      body.dark-mode .${BTN_CLASS}:hover {
        background: #2e2820;
      }

      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.82);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      #${MODAL_ID} {
        width: min(92vw, 360px);
        background: #e8e4d8;
        color: #181410;
        border: 3px solid #181410;
        box-shadow: 0 0 0 2px #000, 4px 4px 0 0 #181410;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      body.dark-mode #${MODAL_ID} {
        background: #252118;
        color: #e0dcd0;
        border-color: #4a4438;
        box-shadow: 0 0 0 2px #000, 4px 4px 0 0 #000;
      }

      #${MODAL_ID} .tm-title {
        font-family: 'Press Start 2P', monospace;
        font-size: 9px;
        line-height: 1.7;
      }

      #${MODAL_ID} .tm-sub {
        font-size: 11px;
        color: #504c3c;
        line-height: 1.5;
      }

      body.dark-mode #${MODAL_ID} .tm-sub {
        color: #908878;
      }

      #${MODAL_ID} .tm-input {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #181410;
        background: #f7f3e8;
        color: #181410;
        font-size: 14px;
        outline: none;
      }

      body.dark-mode #${MODAL_ID} .tm-input {
        background: #1e1c14;
        color: #e0dcd0;
        border-color: #4a4438;
      }

      #${MODAL_ID} .tm-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      #${MODAL_ID} .tm-btn {
        min-width: 88px;
        padding: 9px 12px;
        border: 2px solid #181410;
        background: #d8d4c8;
        color: #181410;
        cursor: pointer;
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        box-shadow: 2px 2px 0 0 #181410;
      }

      #${MODAL_ID} .tm-btn:hover {
        background: #c8c4b8;
      }

      #${MODAL_ID} .tm-btn:active {
        transform: translate(1px, 1px);
        box-shadow: 1px 1px 0 0 #181410;
      }

      #${MODAL_ID} .tm-btn.primary {
        background: #e8e4d8;
      }

      body.dark-mode #${MODAL_ID} .tm-btn {
        background: #2e2820;
        color: #e0dcd0;
        border-color: #4a4438;
        box-shadow: 2px 2px 0 0 #000;
      }

      body.dark-mode #${MODAL_ID} .tm-btn:hover {
        background: #3a3228;
      }

      body.dark-mode #${MODAL_ID} .tm-btn:active {
        box-shadow: 1px 1px 0 0 #000;
      }
    `;

    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function closeModal() {
    document.getElementById(OVERLAY_ID)?.remove();
  }

  function rerenderTeam() {
    const s = getState();
    if (!s) return;
    if (typeof renderTeamBar === 'function') {
      try {
        renderTeamBar(s.team);
      } catch (_) {}
    }
  }

  function saveNickname(teamIndex, value) {
    const s = getState();
    if (!s?.team?.[teamIndex]) return;

    const raw = String(value || '').trim();
    s.team[teamIndex].nickname = raw || null;

    rerenderTeam();
    closeModal();
  }

  function openRenameModal(teamIndex, pokemon) {
    closeModal();

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div id="${MODAL_ID}" role="dialog" aria-modal="true" aria-label="Rename Pokémon">
        <div class="tm-title">Rename Pokémon</div>
        <div class="tm-sub">Choose a nickname for <strong>${escapeHtml(pokemon.nickname || pokemon.name || 'Pokémon')}</strong>.</div>
        <input
          class="tm-input"
          type="text"
          maxlength="20"
          value="${escapeHtml(pokemon.nickname || '')}"
          placeholder="Leave empty to use species name"
        >
        <div class="tm-actions">
          <button class="tm-btn" data-action="clear" type="button">CLEAR</button>
          <button class="tm-btn" data-action="cancel" type="button">CANCEL</button>
          <button class="tm-btn primary" data-action="save" type="button">SAVE</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.body.appendChild(overlay);

    const input = overlay.querySelector('.tm-input');

    overlay.querySelector('[data-action="clear"]').addEventListener('click', () => {
      input.value = '';
      input.focus();
    });

    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);

    overlay.querySelector('[data-action="save"]').addEventListener('click', () => {
      saveNickname(teamIndex, input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveNickname(teamIndex, input.value);
      if (e.key === 'Escape') closeModal();
    });

    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  }

  function swallowEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function protectButton(btn) {
    if (btn.dataset.tmProtected === '1') return;
    btn.dataset.tmProtected = '1';

    const blocker = (e) => {
      swallowEvent(e);
    };

    btn.addEventListener('pointerdown', blocker, true);
    btn.addEventListener('mousedown', blocker, true);
    btn.addEventListener('touchstart', blocker, true);

    btn.addEventListener('click', (e) => {
      swallowEvent(e);

      const slot = btn.closest('.team-slot');
      if (!slot) return;

      const bar = document.getElementById('team-bar');
      if (!bar) return;

      const slots = [...bar.querySelectorAll('.team-slot')];
      const index = slots.indexOf(slot);
      if (index < 0) return;

      const s = getState();
      const pokemon = s?.team?.[index];
      if (!pokemon) return;

      openRenameModal(index, pokemon);
    }, true);
  }

  function attachButtons() {
    injectStyles();

    const bar = document.getElementById('team-bar');
    const s = getState();
    if (!bar || !s?.team?.length) return;

    const slots = [...bar.querySelectorAll('.team-slot')];

    slots.forEach((slot, index) => {
      if (!s.team[index]) return;

      let btn = slot.querySelector(`.${BTN_CLASS}`);
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = BTN_CLASS;
        btn.textContent = '✎';
        slot.appendChild(btn);
      }

      const pokemon = s.team[index];
      const labelName = pokemon.nickname || pokemon.name || 'Pokémon';
      btn.title = `Rename ${labelName}`;
      btn.setAttribute('aria-label', `Rename ${labelName}`);

      protectButton(btn);
    });
  }

  const observer = new MutationObserver(() => {
    attachButtons();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachButtons, { once: true });
  } else {
    attachButtons();
  }
})();