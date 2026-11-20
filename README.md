# TinyHand for Roam

<a href="https://roamjs.com/">
  <img src="https://avatars.githubusercontent.com/u/138642184" alt="RoamJS" align="right" height="60" />
</a>

**Point at anything in your Roam tab with a tiny hand on a stick, and draw over the page while you present.**

[![RoamJS](https://roamjs.com/badges/website.svg)](https://roamjs.com/) [![Slack](https://roamjs.com/badges/slack.svg)](https://roamresearch.slack.com/archives/C016N2B66JU)

## Use TinyHand

1. Open Roam’s command palette and select **TinyHand: Start pointing**. You can assign it a shortcut in Roam’s Hotkeys settings.
2. Move your pointer to aim. Click to tap, or drag to draw. Hold **Cmd** on macOS or **Ctrl** on Windows and Linux while dragging to add an arrowhead.
3. Use the bottom toolbar to pick a hand or the laser dot, toggle the tap sound, or clear your drawing.
4. Press **Escape** or choose **Exit** to remove the overlay and return to editing.

The overlay covers the Roam tab and intercepts clicks while active. Annotations last until you clear them or exit, and are never saved to your graph.

## Load a development build

Run `npm ci` and `npm run build:roam`, then load the `dist` folder in Roam’s Developer Extensions. Run `npm test` and `npm run typecheck` locally with Node.js 24.

## Credit

TinyHand for Roam is based on [TinyHand for macOS](https://github.com/nilbuild/tinyhand) by Kamran Ahmed (nilbuild). This port reuses adapted versions of the original Lavender toy, Cursor glove, Coral vinyl, Plush, and Robot artwork, plus its Pop tap sound. These assets are distributed under the [MIT license](LICENSE) and come from [upstream commit da98f98](https://github.com/nilbuild/tinyhand/tree/da98f98d529971297487b0ec6ef07dc549555686/assets).
