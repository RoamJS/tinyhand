import React from "react";
import ReactDOM from "react-dom";
import renderToast from "roamjs-components/components/Toast";
import runExtension from "roamjs-components/util/runExtension";
import { TinyHand } from "~/components/TinyHand";
import { createPreferences } from "~/preferences";

const COMMAND = "TinyHand: Start pointing";

export default runExtension(async ({ extensionAPI }) => {
  let mount: HTMLDivElement | undefined;
  let active = true;
  const preferences = createPreferences();

  const close = (): void => {
    if (!mount) return;
    ReactDOM.unmountComponentAtNode(mount);
    mount.remove();
    mount = undefined;
  };

  const open = (): void => {
    if (!active || mount) return;
    mount = document.createElement("div");
    document.body.append(mount);
    ReactDOM.render(
      React.createElement(TinyHand, {
        initialStyle: preferences.style,
        initialSound: preferences.sound,
        onStyleChange: preferences.setStyle,
        onSoundChange: preferences.setSound,
        onClose: close,
      }),
      mount,
    );
  };

  const registerCommand = async (): Promise<void> => {
    try {
      await extensionAPI.ui.commandPalette.addCommand({
        label: COMMAND,
        callback: open,
      });
    } catch (error) {
      if (!active) return;
      console.error("TinyHand could not register its pointing command.", error);
      renderToast({
        id: "tinyhand-registration-error",
        content:
          "TinyHand could not add its command. Reload Roam to try again.",
        intent: "danger",
      });
    }
  };
  void registerCommand();
  return {
    unload: () => {
      active = false;
      close();
    },
  };
});
