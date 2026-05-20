// ==UserScript==
// @name         Pokelike Move Tier Hover
// @namespace    https://pokelike.xyz/
// @version      0.1.2
// @description  Shows current move tier inside the move box of the Pokelike hover popup
// @author       Moose
// @match        https://pokelike.xyz/*
// @match        https://www.pokelike.xyz/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-move-tier-info.user.js
// @updateURL    https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-move-tier-info.user.js
// ==/UserScript==

(function () {
    'use strict';

    if (window.__pokelikeMoveTierHoverInstalled) return;
    window.__pokelikeMoveTierHoverInstalled = true;

    let popupObserver = null;
    let bootObserver = null;
    let refreshScheduled = false;

    function injectStyles() {
        if (document.getElementById('tm-pokelike-move-tier-hover-styles')) return;

        const style = document.createElement('style');
        style.id = 'tm-pokelike-move-tier-hover-styles';
        style.textContent = `
      .poke-move-tier-inline {
        display: block;
        margin-top: 4px;
        color: #b8afa2;
        font-family: 'Press Start 2P', monospace;
        font-size: 6px;
        line-height: 1.5;
      }
    `;
        document.head.appendChild(style);
    }

    function getPopup() {
        return document.getElementById('team-hover-card');
    }

    function getCurrentRun() {
        try {
            const raw = localStorage.getItem('poke_current_run');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (err) {
            return null;
        }
    }

    function getTeam() {
        const run = getCurrentRun();
        return Array.isArray(run?.team) ? run.team : [];
    }

    function normalizeName(name) {
        return String(name || '')
            .trim()
            .toLowerCase()
            .replace(/[.'’:\-\s]/g, '');
    }

    function extractCardName(cardEl) {
        if (!cardEl) return null;

        const selectors = [
            '.poke-name',
            '.poke-card-name',
            '.poke-header-name',
            'h3',
            'h4'
        ];

        for (const selector of selectors) {
            const el = cardEl.querySelector(selector);
            const text = (el?.textContent || '').trim();
            if (text) return text;
        }

        const text = (cardEl.textContent || '').trim();
        if (!text) return null;

        const match = text.match(/^[A-Z][A-Za-z0-9 .'\-??:]+/);
        return match ? match[0].trim() : null;
    }

    function findTeamMemberByName(name) {
        if (!name) return null;

        const target = normalizeName(name);
        return getTeam().find(member =>
            normalizeName(member?.name) === target ||
            normalizeName(member?.nickname) === target
        ) || null;
    }

    function getMoveTier(member) {
        if (!member || typeof member !== 'object') return null;
        if (typeof member.moveTier === 'number') return member.moveTier;
        if (typeof member.currentMoveTier === 'number') return member.currentMoveTier;
        if (typeof member.moveTier === 'number') return member.moveTier;
        return null;
    }

    function formatMoveTier(member) {
        const raw = getMoveTier(member);
        if (raw == null || Number.isNaN(raw)) return '?/?';

        if (typeof member?.moveTier === 'number') {
            const clamped = Math.max(0, Math.min(2, raw));
            return `${clamped + 1}/3`;
        }

        return String(raw);
    }

    function findMoveBox(card) {
        const selectors = [
            '.poke-move',
            '.move-box',
            '.poke-card-move',
            '.move-section',
            '.pokemon-move'
        ];

        for (const selector of selectors) {
            const el = card.querySelector(selector);
            if (el) return el;
        }

        return null;
    }

    function injectMoveTier() {
        const popup = getPopup();
        if (!popup || popup.style.display === 'none' || !popup.innerHTML.trim()) return;

        const card = popup.querySelector('.poke-card');
        if (!card) return;

        card.querySelector('.poke-move-tier-inline')?.remove();

        const moveBox = findMoveBox(card);
        if (!moveBox) return;

        const name = extractCardName(card);
        const member = findTeamMemberByName(name);
        if (!member) return;

        const el = document.createElement('div');
        el.className = 'poke-move-tier-inline';
        el.textContent = `Move tier: ${formatMoveTier(member)}`;
        moveBox.appendChild(el);
    }

    function scheduleRefresh() {
        if (refreshScheduled) return;
        refreshScheduled = true;

        requestAnimationFrame(() => {
            refreshScheduled = false;
            injectMoveTier();
        });
    }

    function installPopupObserver() {
        const popup = getPopup();
        if (!popup || popupObserver) return;

        popupObserver = new MutationObserver(() => {
            scheduleRefresh();
        });

        popupObserver.observe(popup, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    function bootstrap() {
        injectStyles();
        installPopupObserver();
        scheduleRefresh();
    }

    bootstrap();

    bootObserver = new MutationObserver(() => {
        bootstrap();
    });

    if (document.body) {
        bootObserver.observe(document.body, { childList: true, subtree: true });
    }

    console.log('Pokelike Move Tier Hover active');
})();