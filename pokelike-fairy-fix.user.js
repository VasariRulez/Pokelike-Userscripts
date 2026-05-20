// ==UserScript==
// @name         Pokelike Fairy Fix
// @namespace    https://pokelike.xyz/
// @version      0.1.0
// @description  Adds missing Fairy type effectiveness data to Pokelike only when needed
// @author       VasariRulez
// @match        https://pokelike.xyz/*
// @match        https://www.pokelike.xyz/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-fairy-fix.user.js
// @updateURL    https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-fairy-fix.user.js
// ==/UserScript==

(function () {
  'use strict';

  if (window.__pokelikeFairyFixInstalled) return;
  window.__pokelikeFairyFixInstalled = true;

  const ALL_TYPES = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
    'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
  ];

  function hasFairySupport(chart) {
    if (!chart || typeof chart !== 'object') return false;
    if (!chart.Fairy || typeof chart.Fairy !== 'object') return false;
    if (!chart.Dragon || !chart.Poison || !chart.Steel) return false;

    return (
      chart.Fairy.Dragon === 2 &&
      chart.Fairy.Dark === 2 &&
      chart.Fairy.Fighting === 2 &&
      chart.Fairy.Fire === 0.5 &&
      chart.Fairy.Poison === 0.5 &&
      chart.Fairy.Steel === 0.5 &&
      chart.Dragon.Fairy === 0 &&
      chart.Poison.Fairy === 2 &&
      chart.Steel.Fairy === 2 &&
      chart.Fighting.Fairy === 0.5 &&
      chart.Dark.Fairy === 0.5 &&
      chart.Bug.Fairy === 0.5
    );
  }

  function patchFairy(chart) {
    for (const atk of ALL_TYPES) {
      if (!chart[atk] || typeof chart[atk] !== 'object') {
        chart[atk] = {};
      }
      for (const def of ALL_TYPES) {
        if (chart[atk][def] === undefined) {
          chart[atk][def] = 1;
        }
      }
    }

    chart.Normal.Fairy = 1;
    chart.Fire.Fairy = 1;
    chart.Water.Fairy = 1;
    chart.Electric.Fairy = 1;
    chart.Grass.Fairy = 1;
    chart.Ice.Fairy = 1;
    chart.Fighting.Fairy = 0.5;
    chart.Poison.Fairy = 2;
    chart.Ground.Fairy = 1;
    chart.Flying.Fairy = 1;
    chart.Psychic.Fairy = 1;
    chart.Bug.Fairy = 0.5;
    chart.Rock.Fairy = 1;
    chart.Ghost.Fairy = 1;
    chart.Dragon.Fairy = 0;
    chart.Dark.Fairy = 0.5;
    chart.Steel.Fairy = 2;

    chart.Fairy = {
      Normal: 1,
      Fire: 0.5,
      Water: 1,
      Electric: 1,
      Grass: 1,
      Ice: 1,
      Fighting: 2,
      Poison: 0.5,
      Ground: 1,
      Flying: 1,
      Psychic: 1,
      Bug: 1,
      Rock: 1,
      Ghost: 1,
      Dragon: 2,
      Dark: 2,
      Steel: 0.5,
      Fairy: 1
    };
  }

  function tryPatch() {
    try {
      if (typeof TYPE_CHART === 'undefined' || !TYPE_CHART || typeof TYPE_CHART !== 'object') {
        return false;
      }

      if (hasFairySupport(TYPE_CHART)) {
        console.log('[Pokelike Fairy Fix] Fairy support already present, no patch needed.');
        return true;
      }

      patchFairy(TYPE_CHART);

      if (hasFairySupport(TYPE_CHART)) {
        console.log('[Pokelike Fairy Fix] Fairy patch applied.');
        return true;
      }

      console.warn('[Pokelike Fairy Fix] Patch attempted, but Fairy support still looks incomplete.');
      return true;
    } catch (err) {
      console.warn('[Pokelike Fairy Fix] Patch retrying...', err);
      return false;
    }
  }

  let tries = 0;
  const maxTries = 50;

  const timer = setInterval(() => {
    tries += 1;
    const done = tryPatch();
    if (done || tries >= maxTries) {
      clearInterval(timer);
      if (!done) {
        console.warn('[Pokelike Fairy Fix] TYPE_CHART not found.');
      }
    }
  }, 200);
})();
