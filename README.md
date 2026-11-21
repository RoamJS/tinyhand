# TinyHand for Roam

<a href="https://roamjs.com/">
  <img src="https://avatars.githubusercontent.com/u/138642184" alt="RoamJS" align="right" height="60" />
</a>

**Point at anything in your Roam tab with a tiny hand on a stick, and draw over the page while you present.**

[![RoamJS](https://roamjs.com/badges/website.svg)](https://roamjs.com/) [![Slack](https://roamjs.com/badges/slack.svg)](https://roamresearch.slack.com/archives/C016N2B66JU)

## Use TinyHand

1. Open Roam’s command palette and select **TinyHand: Start pointing**. You can assign it a shortcut in Roam’s Hotkeys settings.
2. Move your pointer to aim. Click to tap, or drag to draw. Hold **Cmd** on macOS or **Ctrl** on Windows and Linux while dragging to add an arrowhead.
3. Choose a hand or the laser dot in the bottom toolbar. Tap sound starts muted. Roam remembers your pointer and sound choices in this browser.
4. Use **Undo** or **Cmd/Ctrl+Z** to remove the last mark. Choose **Clear** to erase all the ink and keep pointing.
5. Press **Escape** or choose **Exit** to remove the overlay and return to editing.

While pointing, you can tap a link or underline a block without opening it. Exit pointing mode to follow a link, scroll the page, or edit. Ink stays in the tab until you undo it, clear it, or exit. Each new presentation starts with a blank overlay.

## Load a development build

Run `npm ci` and `npm run build:roam`, then load the `dist` folder in Roam’s Developer Extensions. Run `npm test` and `npm run typecheck` locally with Node.js 24.

## Credit

TinyHand for Roam is based on [TinyHand for macOS](https://github.com/nilbuild/tinyhand) by Kamran Ahmed (nilbuild). This port reuses adapted versions of the original Lavender toy, Cursor glove, Coral vinyl, Plush, and Robot artwork, plus its Pop tap sound. These assets are distributed under the [MIT license](https://github.com/nilbuild/tinyhand/blob/da98f98d529971297487b0ec6ef07dc549555686/LICENSE) and come from [upstream commit da98f98](https://github.com/nilbuild/tinyhand/tree/da98f98d529971297487b0ec6ef07dc549555686/assets).

This extension also includes code from [roamjs-components](https://github.com/RoamJS/roamjs-components), copyright (c) 2021 David Vargas, under the same MIT license.

<details>
<summary>MIT license and copyright notice</summary>

```text
MIT License

Copyright (c) RoamJS
Copyright (c) 2026 Kamran Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

</details>
