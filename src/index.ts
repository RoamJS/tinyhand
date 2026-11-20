import React from "react";
import ReactDOM from "react-dom";
import runExtension from "roamjs-components/util/runExtension";
import { TinyHand } from "~/components/TinyHand";
import { type PointerStyle } from "~/pointerStyles";

const COMMAND = "TinyHand: Start pointing";

export default runExtension(async ({ extensionAPI }) => {
  let mount: HTMLDivElement | undefined;
  let pointerStyle: PointerStyle = "lavender";
  let sound = false;

  const close = (): void => {
    if (!mount) return;
    ReactDOM.unmountComponentAtNode(mount);
    mount.remove();
    mount = undefined;
  };

  const open = (): void => {
    if (mount) return;
    mount = document.createElement("div");
    document.body.append(mount);
    ReactDOM.render(
      React.createElement(TinyHand, {
        initialStyle: pointerStyle,
        initialSound: sound,
        onStyleChange: (style) => {
          pointerStyle = style;
        },
        onSoundChange: (enabled) => {
          sound = enabled;
        },
        onClose: close,
      }),
      mount,
    );
  };

  extensionAPI.ui.commandPalette.addCommand({ label: COMMAND, callback: open });
  return { unload: close };
});
