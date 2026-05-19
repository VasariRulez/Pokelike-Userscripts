# Pokelike Userscripts

A collection of userscripts for improving the experience on [pokelike.xyz](https://pokelike.xyz). These scripts are intended to run with **Tampermonkey** in the browser.

## Requirements

Before using any script in this repository, make sure the following requirements are met:

- A Chromium-based browser such as **Google Chrome**, **Brave**, **Microsoft Edge**, or another browser that supports Tampermonkey.
- The **Tampermonkey** browser extension installed and enabled.
- Access to the supported website, currently **https://pokelike.xyz/**.
- Permission to run custom userscripts in the browser through Tampermonkey.

## Prerequisites

Before installing a script from this repository:

1. Install **Tampermonkey** from the browser extension store.
2. Open the Tampermonkey dashboard and make sure the extension is active in the browser.
3. Download or copy the userscript file you want to use from this repository.
4. Verify that the script's `@match` metadata includes `https://pokelike.xyz/*`, so it runs only on the intended site.

## Installation

Follow these steps to install and run a script from this repository:

1. Install and enable Tampermonkey in the browser.
2. You can click on the link in the Scripts section to install it directly and skip to step 8, or continue from step 3.
3. Open the Tampermonkey dashboard.
4. Click **Create a new script**.
5. Delete the default template code.
6. Paste the content of the selected `.js` file from this repository.
7. Save the script.
8. Open or reload [pokelike.xyz](https://pokelike.xyz/).
9. Tampermonkey will inject the script automatically when the page URL matches the script metadata.

## Updating a Script

The script should update automatically through Tampermonkey, or Tampermonkey should prompt you when an update is available.

If that does not happen, or if you installed the script manually without the auto-update metadata, follow these steps:

1. Reinstall the script using the direct `.user.js` install link, confirm the overwrite when prompted, and then skip to step 6. Alternatively, continue with step 2.
2. Open Tampermonkey.
3. Open the installed script.
4. Replace its content with the latest version from this repository.
5. Save the script.
6. Reload the page.

## Troubleshooting

If a script does not run correctly, check the following:

- Tampermonkey is enabled in the browser.
- The script is enabled in the Tampermonkey dashboard.
- The script `@match` metadata points to `https://pokelike.xyz/*`.
- The page has been fully reloaded after saving the script.
- The target DOM elements used by the script still exist, since site updates can break selectors.

## Scripts

### pokelike-weakness-panel.user.js

Adds a weakness and resistance panel to the existing Pokelike interface on `pokelike.xyz`.

Current behavior:

- Extends the existing `team-hover-card` popup with a type effectiveness panel.
- Shows all **non-neutral** matchups, meaning weaknesses, resistances, and immunities different from `1x`.
- Adds a fixed inline panel in trade rows next to the trade member info, so matchup data is always visible without hover.
- Includes anti-refresh logic to avoid unnecessary DOM rebuilds when the interface updates.
- Preserves the native popup visibility behavior controlled by the page JavaScript.
#### Install directly

Click the link below to install the script in Tampermonkey:

- [Install Pokelike Weakness Panel](https://raw.githubusercontent.com/VasariRulez/Pokelike-Userscripts/main/pokelike-weakness-panel.user.js)

If Tampermonkey does not open the install page automatically, open the script URL manually from the browser or use **Tampermonkey → Dashboard → Utilities → Import from URL** and paste the same link.
## Notes

These scripts are unofficial browser-side enhancements. They only modify the page locally in the current browser session and do not change the website for other users.
