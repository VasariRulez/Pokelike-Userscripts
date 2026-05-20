// ==UserScript==
// @name         Pokelike Move Tier Hover
// @namespace    https://pokelike.xyz/
// @version      0.3.1
// @description  Shows current move tier inside the move box of the Pokelike hover popup, styled like the move power badge
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

    if (window.__pokelikeMoveTierHoverInstalled) {
        console.log('[Pokelike Move Tier Hover] Script already installed.');
        return;
    }
    window.__pokelikeMoveTierHoverInstalled = true;

    let popupObserver = null;
    let bootObserver = null;
    let patchApplied = false;
    let refreshScheduled = false;

    function getMoveTierLabel(pokemon) {
        const tier = Math.max(0, Math.min(2, pokemon?.moveTier ?? 1));
        return ['Tier 1', 'Tier 2', 'Mastered'][tier] ?? 'Tier 1';
    }

    function injectStyles() {
        if (document.getElementById('tm-pokelike-move-tier-hover-styles')) {
            console.log('[Pokelike Move Tier Hover] Styles already injected.');
            return;
        }

        const style = document.createElement('style');
        style.id = 'tm-pokelike-move-tier-hover-styles';
        style.textContent = `
      .poke-move {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        text-align: center;
      }

      .poke-move-tier-inline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        min-height: 16px;
        padding: 2px 6px;
        box-sizing: border-box;
        border-radius: 4px;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px;
        line-height: 1;
        letter-spacing: 0;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--text-main, #181410);
        background: var(--bg-light-panel, #dedad0);
        border: 1px solid var(--border, #3a3a3a);
      }

      body.dark-mode .poke-move-tier-inline {
        color: var(--text-main, #e0dcd0);
        background: var(--bg-light-panel, #2a2a2a);
        border-color: var(--border, #3a3a3a);
      }
    `;
        document.head.appendChild(style);
        console.log('[Pokelike Move Tier Hover] Styles injected.');
    }

    function findPokemonFromCard(card) {
        const cardName = card?.querySelector('.poke-name')?.textContent?.trim();
        if (!cardName) return null;

        const team = window.state?.team;
        if (!Array.isArray(team)) return null;

        return team.find(p => (p?.nickname || p?.name) === cardName) || null;
    }

    function ensureTierInExistingCard(card) {
        if (!card) return;
        if (card.querySelector('.poke-move-tier-inline')) return;

        const moveName = card.querySelector('.move-name');
        if (!moveName) return;

        const pokemon = findPokemonFromCard(card);
        if (!pokemon) return;

        moveName.insertAdjacentHTML(
            'afterend',
            `<div class="poke-move-tier-inline">${getMoveTierLabel(pokemon)}</div>`
        );
    }

    function patchRenderPokemonCard() {
        if (patchApplied) {
            console.log('[Pokelike Move Tier Hover] renderPokemonCard already patched.');
            return true;
        }

        if (typeof window.renderPokemonCard !== 'function') {
            console.warn('[Pokelike Move Tier Hover] renderPokemonCard not available yet.');
            return false;
        }

        const originalRenderPokemonCard = window.renderPokemonCard;

        window.renderPokemonCard = function patchedRenderPokemonCard(...args) {
            const html = originalRenderPokemonCard.apply(this, args);
            const pokemon = args[0];
            const tierLabel = getMoveTierLabel(pokemon);

            if (typeof html !== 'string' || !html.includes('class="poke-move"')) {
                return html;
            }

            if (html.includes('poke-move-tier-inline')) {
                return html;
            }

            return html.replace(
                /(<div class="move-name">.*?<\/div>)/,
                `$1<div class="poke-move-tier-inline">${tierLabel}</div>`
            );
        };

        patchApplied = true;
        console.log('[Pokelike Move Tier Hover] renderPokemonCard patched successfully.');
        return true;
    }

    function scheduleRefresh() {
        if (refreshScheduled) return;
        refreshScheduled = true;

        requestAnimationFrame(() => {
            refreshScheduled = false;

            if (typeof window.renderTeamBar === 'function' && window.state?.team) {
                try {
                    window.renderTeamBar(window.state.team);
                } catch (err) {
                    console.warn('[Pokelike Move Tier Hover] Failed to refresh team bar.', err);
                }
            }

            const hover = document.getElementById('team-hover-card');
            if (hover && hover.style.display !== 'none') {
                ensureTierInExistingCard(hover);
            }
        });
    }

    function observeHoverCard() {
        if (popupObserver) {
            console.log('[Pokelike Move Tier Hover] Hover observer already active.');
            return;
        }

        const target = document.body || document.documentElement;
        if (!target) {
            console.warn('[Pokelike Move Tier Hover] Could not attach hover observer.');
            return;
        }

        popupObserver = new MutationObserver(() => {
            const hover = document.getElementById('team-hover-card');
            if (!hover) return;
            if (hover.style.display === 'none') return;
            ensureTierInExistingCard(hover);
        });

        popupObserver.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        console.log('[Pokelike Move Tier Hover] Hover observer attached.');
    }

    function boot() {
        injectStyles();

        if (patchRenderPokemonCard()) {
            observeHoverCard();
            scheduleRefresh();

            if (bootObserver) {
                bootObserver.disconnect();
                bootObserver = null;
                console.log('[Pokelike Move Tier Hover] Boot observer disconnected.');
            }

            console.log('[Pokelike Move Tier Hover] Script is active.');
            return true;
        }

        return false;
    }

    if (!boot()) {
        console.log('[Pokelike Move Tier Hover] Waiting for page functions to become available...');

        bootObserver = new MutationObserver(() => {
            boot();
        });

        bootObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})();