// ==UserScript==
// @name         Pokelike Evolution Level Text
// @namespace    https://pokelike.xyz/
// @version      0.6.0
// @description  Shows centered "Evolves at lvl. X" text on Pokemon cards
// @author       Moose
// @match        https://pokelike.xyz/*
// @match        https://www.pokelike.xyz/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-evolution-level-text.user.js
// @updateURL    https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-evolution-level-text.user.js
// ==/UserScript==

(function () {
    'use strict';

    if (window.__pokelikeEvolutionLevelTextInstalled) return;
    window.__pokelikeEvolutionLevelTextInstalled = true;

    const EVOLUTIONS = {
        1: { into: 2, level: 16, name: 'Ivysaur' }, 2: { into: 3, level: 32, name: 'Venusaur' }, 4: { into: 5, level: 16, name: 'Charmeleon' },
        5: { into: 6, level: 36, name: 'Charizard' }, 7: { into: 8, level: 16, name: 'Wartortle' }, 8: { into: 9, level: 36, name: 'Blastoise' },
        10: { into: 11, level: 7, name: 'Metapod' }, 11: { into: 12, level: 10, name: 'Butterfree' }, 13: { into: 14, level: 7, name: 'Kakuna' },
        14: { into: 15, level: 10, name: 'Beedrill' }, 16: { into: 17, level: 18, name: 'Pidgeotto' }, 17: { into: 18, level: 36, name: 'Pidgeot' },
        19: { into: 20, level: 20, name: 'Raticate' }, 21: { into: 22, level: 20, name: 'Fearow' }, 23: { into: 24, level: 22, name: 'Arbok' },
        25: { into: 26, level: 36, name: 'Raichu' }, 27: { into: 28, level: 22, name: 'Sandslash' }, 29: { into: 30, level: 16, name: 'Nidorina' },
        30: { into: 31, level: 36, name: 'Nidoqueen' }, 32: { into: 33, level: 16, name: 'Nidorino' }, 33: { into: 34, level: 36, name: 'Nidoking' },
        35: { into: 36, level: 36, name: 'Clefable' }, 37: { into: 38, level: 32, name: 'Ninetales' }, 39: { into: 40, level: 36, name: 'Wigglytuff' },
        41: { into: 42, level: 22, name: 'Golbat' }, 42: { into: 169, level: 50, name: 'Crobat' }, 43: { into: 44, level: 21, name: 'Gloom' },
        44: { into: 45, level: 36, name: 'Vileplume' }, 46: { into: 47, level: 24, name: 'Parasect' }, 48: { into: 49, level: 31, name: 'Venomoth' },
        50: { into: 51, level: 26, name: 'Dugtrio' }, 52: { into: 53, level: 28, name: 'Persian' }, 54: { into: 55, level: 33, name: 'Golduck' },
        56: { into: 57, level: 28, name: 'Primeape' }, 58: { into: 59, level: 34, name: 'Arcanine' }, 60: { into: 61, level: 25, name: 'Poliwhirl' },
        61: { into: 62, level: 40, name: 'Poliwrath' }, 63: { into: 64, level: 16, name: 'Kadabra' }, 64: { into: 65, level: 36, name: 'Alakazam' },
        66: { into: 67, level: 28, name: 'Machoke' }, 67: { into: 68, level: 40, name: 'Machamp' }, 69: { into: 70, level: 21, name: 'Weepinbell' },
        70: { into: 71, level: 36, name: 'Victreebel' }, 72: { into: 73, level: 30, name: 'Tentacruel' }, 74: { into: 75, level: 25, name: 'Graveler' },
        75: { into: 76, level: 40, name: 'Golem' }, 77: { into: 78, level: 40, name: 'Rapidash' }, 79: { into: 80, level: 37, name: 'Slowbro' },
        81: { into: 82, level: 30, name: 'Magneton' }, 82: { into: 462, level: 40, name: 'Magnezone' }, 84: { into: 85, level: 31, name: 'Dodrio' },
        86: { into: 87, level: 34, name: 'Dewgong' }, 88: { into: 89, level: 38, name: 'Muk' }, 90: { into: 91, level: 36, name: 'Cloyster' },
        92: { into: 93, level: 25, name: 'Haunter' }, 93: { into: 94, level: 38, name: 'Gengar' }, 95: { into: 208, level: 40, name: 'Steelix' },
        96: { into: 97, level: 26, name: 'Hypno' }, 98: { into: 99, level: 28, name: 'Kingler' }, 100: { into: 101, level: 30, name: 'Electrode' },
        102: { into: 103, level: 36, name: 'Exeggutor' }, 104: { into: 105, level: 28, name: 'Marowak' }, 108: { into: 463, level: 33, name: 'Lickilicky' },
        109: { into: 110, level: 35, name: 'Weezing' }, 111: { into: 112, level: 42, name: 'Rhydon' }, 112: { into: 464, level: 42, name: 'Rhyperior' },
        113: { into: 242, level: 38, name: 'Blissey' }, 114: { into: 465, level: 36, name: 'Tangrowth' }, 116: { into: 117, level: 32, name: 'Seadra' },
        117: { into: 230, level: 40, name: 'Kingdra' }, 118: { into: 119, level: 33, name: 'Seaking' }, 120: { into: 121, level: 36, name: 'Starmie' },
        123: { into: 212, level: 40, name: 'Scizor' }, 125: { into: 466, level: 40, name: 'Electivire' }, 126: { into: 467, level: 40, name: 'Magmortar' },
        129: { into: 130, level: 20, name: 'Gyarados' }, 137: { into: 233, level: 30, name: 'Porygon2' }, 138: { into: 139, level: 40, name: 'Omastar' },
        140: { into: 141, level: 40, name: 'Kabutops' }, 147: { into: 148, level: 30, name: 'Dragonair' }, 148: { into: 149, level: 55, name: 'Dragonite' },
        152: { into: 153, level: 16, name: 'Bayleef' }, 153: { into: 154, level: 32, name: 'Meganium' }, 155: { into: 156, level: 14, name: 'Quilava' },
        156: { into: 157, level: 36, name: 'Typhlosion' }, 158: { into: 159, level: 18, name: 'Croconaw' }, 159: { into: 160, level: 30, name: 'Feraligatr' },
        161: { into: 162, level: 15, name: 'Furret' }, 163: { into: 164, level: 20, name: 'Noctowl' }, 165: { into: 166, level: 18, name: 'Ledian' },
        167: { into: 168, level: 22, name: 'Ariados' }, 170: { into: 171, level: 27, name: 'Lanturn' }, 172: { into: 25, level: 15, name: 'Pikachu' },
        173: { into: 35, level: 15, name: 'Clefairy' }, 174: { into: 39, level: 15, name: 'Jigglypuff' }, 175: { into: 176, level: 15, name: 'Togetic' },
        176: { into: 468, level: 40, name: 'Togekiss' }, 177: { into: 178, level: 25, name: 'Xatu' }, 179: { into: 180, level: 15, name: 'Flaaffy' },
        180: { into: 181, level: 30, name: 'Ampharos' }, 183: { into: 184, level: 18, name: 'Azumarill' }, 187: { into: 188, level: 18, name: 'Skiploom' },
        188: { into: 189, level: 27, name: 'Jumpluff' }, 190: { into: 424, level: 32, name: 'Ambipom' }, 191: { into: 192, level: 30, name: 'Sunflora' },
        193: { into: 469, level: 33, name: 'Yanmega' }, 194: { into: 195, level: 20, name: 'Quagsire' }, 198: { into: 430, level: 36, name: 'Honchkrow' },
        200: { into: 429, level: 36, name: 'Mismagius' }, 204: { into: 205, level: 31, name: 'Forretress' }, 207: { into: 472, level: 40, name: 'Gliscor' },
        209: { into: 210, level: 23, name: 'Granbull' }, 215: { into: 461, level: 40, name: 'Weavile' }, 216: { into: 217, level: 30, name: 'Ursaring' },
        218: { into: 219, level: 38, name: 'Magcargo' }, 220: { into: 221, level: 33, name: 'Piloswine' }, 221: { into: 473, level: 40, name: 'Mamoswine' },
        223: { into: 224, level: 25, name: 'Octillery' }, 228: { into: 229, level: 24, name: 'Houndoom' }, 231: { into: 232, level: 25, name: 'Donphan' },
        238: { into: 124, level: 30, name: 'Jynx' }, 239: { into: 125, level: 30, name: 'Electabuzz' }, 240: { into: 126, level: 30, name: 'Magmar' },
        246: { into: 247, level: 30, name: 'Pupitar' }, 247: { into: 248, level: 55, name: 'Tyranitar' }, 252: { into: 253, level: 16, name: 'Grovyle' },
        253: { into: 254, level: 36, name: 'Sceptile' }, 255: { into: 256, level: 16, name: 'Combusken' }, 256: { into: 257, level: 36, name: 'Blaziken' },
        258: { into: 259, level: 16, name: 'Marshtomp' }, 259: { into: 260, level: 36, name: 'Swampert' }, 261: { into: 262, level: 18, name: 'Mightyena' },
        263: { into: 264, level: 20, name: 'Linoone' }, 265: { into: 266, level: 7, name: 'Silcoon' }, 266: { into: 267, level: 10, name: 'Beautifly' },
        268: { into: 269, level: 10, name: 'Dustox' }, 270: { into: 271, level: 14, name: 'Lombre' }, 271: { into: 272, level: 30, name: 'Ludicolo' },
        273: { into: 274, level: 14, name: 'Nuzleaf' }, 274: { into: 275, level: 30, name: 'Shiftry' }, 276: { into: 277, level: 22, name: 'Swellow' },
        278: { into: 279, level: 25, name: 'Pelipper' }, 280: { into: 281, level: 20, name: 'Kirlia' }, 281: { into: 282, level: 30, name: 'Gardevoir' },
        283: { into: 284, level: 22, name: 'Masquerain' }, 285: { into: 286, level: 23, name: 'Breloom' }, 287: { into: 288, level: 18, name: 'Vigoroth' },
        288: { into: 289, level: 36, name: 'Slaking' }, 290: { into: 291, level: 20, name: 'Ninjask' }, 293: { into: 294, level: 20, name: 'Loudred' },
        294: { into: 295, level: 40, name: 'Exploud' }, 296: { into: 297, level: 24, name: 'Hariyama' }, 298: { into: 183, level: 15, name: 'Marill' },
        299: { into: 476, level: 36, name: 'Probopass' }, 300: { into: 301, level: 30, name: 'Delcatty' }, 304: { into: 305, level: 32, name: 'Lairon' },
        305: { into: 306, level: 42, name: 'Aggron' }, 307: { into: 308, level: 37, name: 'Medicham' }, 309: { into: 310, level: 26, name: 'Manectric' },
        315: { into: 407, level: 40, name: 'Roserade' }, 316: { into: 317, level: 26, name: 'Swalot' }, 318: { into: 319, level: 30, name: 'Sharpedo' },
        320: { into: 321, level: 40, name: 'Wailord' }, 322: { into: 323, level: 33, name: 'Camerupt' }, 325: { into: 326, level: 32, name: 'Grumpig' },
        328: { into: 329, level: 35, name: 'Vibrava' }, 329: { into: 330, level: 45, name: 'Flygon' }, 331: { into: 332, level: 32, name: 'Cacturne' },
        333: { into: 334, level: 35, name: 'Altaria' }, 339: { into: 340, level: 30, name: 'Whiscash' }, 341: { into: 342, level: 30, name: 'Crawdaunt' },
        343: { into: 344, level: 36, name: 'Claydol' }, 345: { into: 346, level: 40, name: 'Cradily' }, 347: { into: 348, level: 40, name: 'Armaldo' },
        349: { into: 350, level: 35, name: 'Milotic' }, 353: { into: 354, level: 37, name: 'Banette' }, 355: { into: 356, level: 37, name: 'Dusclops' },
        356: { into: 477, level: 40, name: 'Dusknoir' }, 360: { into: 202, level: 15, name: 'Wobbuffet' }, 361: { into: 362, level: 42, name: 'Glalie' },
        363: { into: 364, level: 32, name: 'Sealeo' }, 364: { into: 365, level: 44, name: 'Walrein' }, 371: { into: 372, level: 30, name: 'Shelgon' },
        372: { into: 373, level: 50, name: 'Salamence' }, 374: { into: 375, level: 20, name: 'Metang' }, 375: { into: 376, level: 45, name: 'Metagross' },
        387: { into: 388, level: 18, name: 'Grotle' }, 388: { into: 389, level: 32, name: 'Torterra' }, 390: { into: 391, level: 14, name: 'Monferno' },
        391: { into: 392, level: 36, name: 'Infernape' }, 393: { into: 394, level: 16, name: 'Prinplup' }, 394: { into: 395, level: 36, name: 'Empoleon' },
        396: { into: 397, level: 14, name: 'Staravia' }, 397: { into: 398, level: 34, name: 'Staraptor' }, 399: { into: 400, level: 15, name: 'Bibarel' },
        401: { into: 402, level: 10, name: 'Kricketune' }, 403: { into: 404, level: 15, name: 'Luxio' }, 404: { into: 405, level: 30, name: 'Luxray' },
        406: { into: 315, level: 18, name: 'Roselia' }, 408: { into: 409, level: 30, name: 'Rampardos' }, 410: { into: 411, level: 30, name: 'Bastiodon' },
        415: { into: 416, level: 21, name: 'Vespiquen' }, 418: { into: 419, level: 26, name: 'Floatzel' }, 420: { into: 421, level: 25, name: 'Cherrim' },
        422: { into: 423, level: 30, name: 'Gastrodon' }, 425: { into: 426, level: 28, name: 'Drifblim' }, 427: { into: 428, level: 28, name: 'Lopunny' },
        431: { into: 432, level: 38, name: 'Purugly' }, 434: { into: 435, level: 34, name: 'Skuntank' }, 436: { into: 437, level: 33, name: 'Bronzong' },
        438: { into: 185, level: 16, name: 'Sudowoodo' }, 439: { into: 122, level: 18, name: 'Mr. Mime' }, 440: { into: 113, level: 12, name: 'Chansey' },
        443: { into: 444, level: 24, name: 'Gabite' }, 444: { into: 445, level: 48, name: 'Garchomp' }, 446: { into: 143, level: 32, name: 'Snorlax' },
        447: { into: 448, level: 32, name: 'Lucario' }, 449: { into: 450, level: 34, name: 'Hippowdon' }, 451: { into: 452, level: 40, name: 'Drapion' },
        453: { into: 454, level: 37, name: 'Toxicroak' }, 456: { into: 457, level: 31, name: 'Lumineon' }, 458: { into: 226, level: 32, name: 'Mantine' },
        459: { into: 460, level: 40, name: 'Abomasnow' }, 495: { into: 496, level: 17, name: 'Servine' }, 496: { into: 497, level: 36, name: 'Serperior' },
        498: { into: 499, level: 17, name: 'Pignite' }, 499: { into: 500, level: 36, name: 'Emboar' }, 501: { into: 502, level: 17, name: 'Dewott' },
        502: { into: 503, level: 36, name: 'Samurott' }, 504: { into: 505, level: 20, name: 'Watchog' }, 506: { into: 507, level: 16, name: 'Herdier' },
        507: { into: 508, level: 32, name: 'Stoutland' }, 509: { into: 510, level: 20, name: 'Liepard' }, 511: { into: 512, level: 32, name: 'Simisage' },
        513: { into: 514, level: 32, name: 'Simisear' }, 515: { into: 516, level: 32, name: 'Simipour' }, 517: { into: 518, level: 30, name: 'Musharna' },
        519: { into: 520, level: 21, name: 'Tranquill' }, 520: { into: 521, level: 32, name: 'Unfezant' }, 522: { into: 523, level: 27, name: 'Zebstrika' },
        524: { into: 525, level: 25, name: 'Boldore' }, 525: { into: 526, level: 40, name: 'Gigalith' }, 527: { into: 528, level: 32, name: 'Swoobat' },
        529: { into: 530, level: 31, name: 'Excadrill' }, 532: { into: 533, level: 25, name: 'Gurdurr' }, 533: { into: 534, level: 40, name: 'Conkeldurr' },
        535: { into: 536, level: 25, name: 'Palpitoad' }, 536: { into: 537, level: 36, name: 'Seismitoad' }, 540: { into: 541, level: 20, name: 'Swadloon' },
        541: { into: 542, level: 30, name: 'Leavanny' }, 543: { into: 544, level: 22, name: 'Whirlipede' }, 544: { into: 545, level: 30, name: 'Scolipede' },
        546: { into: 547, level: 32, name: 'Whimsicott' }, 548: { into: 549, level: 28, name: 'Lilligant' }, 551: { into: 552, level: 29, name: 'Krokorok' },
        552: { into: 553, level: 40, name: 'Krookodile' }, 554: { into: 555, level: 35, name: 'Darmanitan' }, 557: { into: 558, level: 34, name: 'Crustle' },
        559: { into: 560, level: 39, name: 'Scrafty' }, 562: { into: 563, level: 34, name: 'Cofagrigus' }, 564: { into: 565, level: 37, name: 'Carracosta' },
        566: { into: 567, level: 37, name: 'Archeops' }, 568: { into: 569, level: 36, name: 'Garbodor' }, 570: { into: 571, level: 30, name: 'Zoroark' },
        572: { into: 573, level: 25, name: 'Cinccino' }, 574: { into: 575, level: 32, name: 'Gothorita' }, 575: { into: 576, level: 41, name: 'Gothitelle' },
        577: { into: 578, level: 32, name: 'Duosion' }, 578: { into: 579, level: 41, name: 'Reuniclus' }, 580: { into: 581, level: 35, name: 'Swanna' },
        582: { into: 583, level: 35, name: 'Vanillish' }, 583: { into: 584, level: 47, name: 'Vanilluxe' }, 585: { into: 586, level: 34, name: 'Sawsbuck' },
        588: { into: 589, level: 30, name: 'Escavalier' }, 590: { into: 591, level: 39, name: 'Amoonguss' }, 592: { into: 593, level: 40, name: 'Jellicent' },
        595: { into: 596, level: 36, name: 'Galvantula' }, 597: { into: 598, level: 40, name: 'Ferrothorn' }, 599: { into: 600, level: 38, name: 'Klang' },
        600: { into: 601, level: 49, name: 'Klinklang' }, 602: { into: 603, level: 39, name: 'Eelektrik' }, 603: { into: 604, level: 50, name: 'Eelektross' },
        605: { into: 606, level: 42, name: 'Beheeyem' }, 607: { into: 608, level: 41, name: 'Lampent' }, 608: { into: 609, level: 55, name: 'Chandelure' },
        610: { into: 611, level: 38, name: 'Fraxure' }, 611: { into: 612, level: 48, name: 'Haxorus' }, 613: { into: 614, level: 37, name: 'Beartic' },
        616: { into: 617, level: 30, name: 'Accelgor' }, 619: { into: 620, level: 50, name: 'Mienshao' }, 622: { into: 623, level: 43, name: 'Golurk' },
        624: { into: 625, level: 52, name: 'Bisharp' }, 627: { into: 628, level: 54, name: 'Braviary' }, 629: { into: 630, level: 54, name: 'Mandibuzz' },
        633: { into: 634, level: 50, name: 'Zweilous' }, 634: { into: 635, level: 64, name: 'Hydreigon' }, 636: { into: 637, level: 59, name: 'Volcarona' }
    };

    let observer = null;
    let refreshQueued = false;

    function injectStyles() {
        if (document.getElementById('tm-pokelike-evo-text-styles')) return;

        const style = document.createElement('style');
        style.id = 'tm-pokelike-evo-text-styles';
        style.textContent = `
            .poke-evo-line {
                width: 100%;
                margin-top: 2px;
                text-align: center;
                font-family: "Press Start 2P", monospace;
                font-size: 6px;
                color: var(--text-dim);
                line-height: 1.6;
                align-self: stretch;
                white-space: normal;
                word-break: break-word;
            }
        `;
        document.head.appendChild(style);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function patchRenderPokemonCard() {
        if (typeof window.renderPokemonCard !== 'function') return false;
        if (window.__pokelikeEvolutionRenderPatched) return true;

        const original = window.renderPokemonCard;

        window.renderPokemonCard = function patchedRenderPokemonCard(...args) {
            const pokemon = args[0];
            const html = original.apply(this, args);

            if (typeof html !== 'string' || !pokemon || !html.includes('class="poke-card')) {
                return html;
            }

            if (html.includes('data-evo-species-id=')) {
                return html;
            }

            const speciesId = Number(pokemon.speciesId);
            const level = Number(pokemon.level ?? 0);
            const speciesName = escapeHtml(pokemon.name || '');
            const nickname = escapeHtml(pokemon.nickname || '');

            return html.replace(
                /<div class="poke-card([^"]*)"/,
                `<div class="poke-card$1" data-evo-species-id="${Number.isFinite(speciesId) ? speciesId : ''}" data-evo-level="${Number.isFinite(level) ? level : ''}" data-evo-name="${speciesName}" data-evo-nickname="${nickname}"`
            );
        };

        window.__pokelikeEvolutionRenderPatched = true;
        return true;
    }

    function getSpeciesId(cardEl) {
        const fromData = Number(cardEl?.dataset?.evoSpeciesId);
        if (Number.isFinite(fromData) && fromData > 0) return fromData;

        const spriteSrc = cardEl?.querySelector('.poke-sprite')?.getAttribute('src') || '';
        const match = spriteSrc.match(/\/pokemon\/(\d+)\.png(?:\?|$)/i);
        return match ? Number(match[1]) : null;
    }

    function getLevel(cardEl) {
        const fromData = Number(cardEl?.dataset?.evoLevel);
        if (Number.isFinite(fromData) && fromData > 0) return fromData;

        const text = cardEl?.querySelector('.poke-level')?.textContent || '';
        const match = text.match(/\d+/);
        return match ? Number(match[0]) : null;
    }

    function buildEvolutionText(cardEl) {
        const speciesId = getSpeciesId(cardEl);
        const currentLevel = getLevel(cardEl);
        const evolution = speciesId ? EVOLUTIONS[speciesId] || null : null;

        if (!evolution || typeof evolution.level !== 'number') return null;

        const line = document.createElement('div');
        line.className = 'poke-evo-line';
        line.textContent = `Evolves at lvl. ${evolution.level}`;

        if (typeof currentLevel === 'number' && currentLevel >= evolution.level) {
            line.textContent = `Evolves at lvl. ${evolution.level}`;
        }

        return line;
    }

    function insertEvolutionText(cardEl) {
        if (!cardEl || !(cardEl instanceof Element)) return;

        cardEl.querySelector(':scope > .poke-evo-line')?.remove();

        const line = buildEvolutionText(cardEl);
        if (!line) return;

        const moveBox = cardEl.querySelector(':scope > .poke-move');
        const hpBox = cardEl.querySelector(':scope > .poke-hp');

        if (moveBox) {
            moveBox.insertAdjacentElement('afterend', line);
        } else if (hpBox) {
            hpBox.insertAdjacentElement('afterend', line);
        } else {
            cardEl.appendChild(line);
        }
    }

    function refreshAllCards(root = document) {
        const cards = root.querySelectorAll?.('.poke-card');
        if (!cards?.length) return;
        cards.forEach(insertEvolutionText);
    }

    function queueRefresh(root = document) {
        if (refreshQueued) return;
        refreshQueued = true;

        requestAnimationFrame(() => {
            refreshQueued = false;
            patchRenderPokemonCard();
            refreshAllCards(root);
        });
    }

    function installObserver() {
        if (observer || !document.body) return;

        observer = new MutationObserver((mutations) => {
            let shouldRefresh = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (!(node instanceof Element)) continue;
                        if (node.matches?.('.poke-card') || node.querySelector?.('.poke-card')) {
                            shouldRefresh = true;
                            break;
                        }
                    }
                }

                if (!shouldRefresh && mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target instanceof Element && (target.matches?.('.poke-card') || target.closest?.('.poke-card'))) {
                        shouldRefresh = true;
                    }
                }

                if (shouldRefresh) break;
            }

            if (shouldRefresh) queueRefresh();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function bootstrap() {
        injectStyles();
        patchRenderPokemonCard();
        refreshAllCards();
        installObserver();
    }

    bootstrap();

    const patchTimer = setInterval(() => {
        const patched = patchRenderPokemonCard();
        if (patched) {
            queueRefresh();
            clearInterval(patchTimer);
        }
    }, 500);

    setTimeout(() => clearInterval(patchTimer), 15000);

    console.log('Pokelike Evolution Level Text active');
})();