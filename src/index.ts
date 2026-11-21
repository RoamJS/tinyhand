import React from "react";
import ReactDOM from "react-dom";
import renderToast from "roamjs-components/components/Toast";
import runExtension from "roamjs-components/util/runExtension";
import { TinyHand } from "~/components/TinyHand";
import { createPreferences } from "~/preferences";

const POINTING = "TinyHand: Toggle pointing";
const TOOLBAR = "TinyHand: Toggle toolbar";

export default runExtension(async ({ extensionAPI }) => {
  let mount: HTMLDivElement | undefined;
  let active = true;
  const preferences = createPreferences();

  let toolbarVisible = true;
  let initial = { ...preferences };

  const close = (): void => {
    if (!mount) return;
    ReactDOM.unmountComponentAtNode(mount);
    mount.remove();
    mount = undefined;
  };

  const render = (): void => {
    if (!mount) return;
    ReactDOM.render(
      React.createElement(TinyHand, {
        toolbarVisible,
        initialStyle: initial.style,
        initialSound: initial.sound,
        initialChoice: initial.choice,
        onChoiceChange: preferences.setChoice,
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
        label: POINTING,
        callback: () => {
          if (!active) return;
          if (mount) return close();
          initial = { ...preferences };
          mount = document.createElement("div");
          document.body.append(mount);
          render();
        },
      });
      if (!active) return;
      await extensionAPI.ui.commandPalette.addCommand({
        label: TOOLBAR,
        callback: () => {
          toolbarVisible = !toolbarVisible;
          render();
        },
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
