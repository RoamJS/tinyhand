import React, { useLayoutEffect, useRef, useState } from "react";
import { Button, HTMLSelect, Popover } from "@blueprintjs/core";
import {
  pointerStyles,
  type PointerStyle,
  soundNames,
  type SoundChoice,
} from "~/preferences";
import { createPointerSurface } from "~/utils/pointerSurface";

import artwork from "~/assets/tinyhand.json";

type Props = {
  toolbarVisible: boolean;
  initialChoice: SoundChoice;
  onChoiceChange: (value: SoundChoice) => void;
  initialStyle: PointerStyle;
  initialSound: boolean;
  onStyleChange: (style: PointerStyle) => void;
  onSoundChange: (enabled: boolean) => void;
  onClose: () => void;
};

export const TinyHand = ({
  toolbarVisible,
  initialChoice,
  onChoiceChange,
  initialStyle,
  initialSound,
  onStyleChange,
  onSoundChange,
  onClose,
}: Props): React.ReactElement => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);
  const drawingRef = useRef<ReturnType<typeof createPointerSurface>>();
  const [style, setStyle] = useState(initialStyle);
  const [sound, setSound] = useState(initialSound);
  const [strokeCount, setStrokeCount] = useState(0);
  const [panel, setPanel] = useState<"help" | "sound" | null>(null);
  const [choice, setChoice] = useState(initialChoice);
  const modifier = /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
    ? "Cmd"
    : "Ctrl";

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const ink = inkRef.current;
    const surface = canvasRef.current;
    if (!dialog || !ink || !surface) return;

    dialog.show();
    dialog.focus();
    const drawing = createPointerSurface({
      ink,
      surface,
      initialOptions: {
        style: initialStyle,
        sound: initialSound,
        choice: initialChoice,
      },
      onStrokeCountChange: (count) => {
        if (
          !count &&
          dialog.contains(document.activeElement) &&
          document.activeElement?.hasAttribute("data-ink-action")
        ) {
          selectRef.current?.focus();
        }
        setStrokeCount(count);
      },
    });
    drawingRef.current = drawing;
    const setPassThrough = (enabled: boolean): void => {
      dialog.classList.toggle("roamjs-tinyhand-pass", enabled);
    };
    const keyboard = (event: KeyboardEvent): void => {
      setPassThrough(event.altKey);
      if (event.type !== "keydown" || event.key !== "Escape") return;
      if (document.querySelector(".rm-command-palette")) return;
      if (helpRef.current?.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        event.stopPropagation();
        setPanel(null);
        helpRef.current.focus({ preventScroll: true });
        return;
      }
      if (document.querySelector(".bp3-overlay-open:not(.bp3-toast-container)"))
        return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    const resetPassThrough = (): void => setPassThrough(false);
    window.addEventListener("keydown", keyboard, true);
    window.addEventListener("keyup", keyboard, true);
    window.addEventListener("blur", resetPassThrough);
    const handleUndo = (event: KeyboardEvent): void => {
      if (
        !(event.target instanceof Node && dialog.contains(event.target)) ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.isComposing ||
        event.key.toLowerCase() !== "z"
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      drawing.undo();
    };
    const cancel = (event: Event): void => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", cancel);
    window.addEventListener("keydown", handleUndo, true);
    return () => {
      window.removeEventListener("keydown", handleUndo, true);
      dialog.removeEventListener("cancel", cancel);
      window.removeEventListener("keydown", keyboard, true);
      window.removeEventListener("keyup", keyboard, true);
      window.removeEventListener("blur", resetPassThrough);
      drawing.dispose();
      dialog.close();
    };
  }, [initialStyle, initialSound, initialChoice, onClose]);

  useLayoutEffect(() => {
    drawingRef.current?.update({ style, sound, choice });
  }, [style, sound, choice]);

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    if (!toolbarVisible) setPanel(null);
    if (!toolbarVisible && toolbar.contains(document.activeElement)) {
      dialogRef.current?.focus({ preventScroll: true });
    }
    toolbar.hidden = !toolbarVisible;
  }, [toolbarVisible]);

  return (
    <dialog
      ref={dialogRef}
      className="roamjs-tinyhand"
      aria-label="TinyHand presentation overlay"
      aria-describedby={panel === "help" ? "roamjs-tinyhand-help" : undefined}
      tabIndex={-1}
    >
      <canvas ref={inkRef} aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="roamjs-tinyhand-surface"
        aria-hidden="true"
      />
      <div className="roamjs-tinyhand-controls" ref={toolbarRef}>
        <div
          className="roamjs-tinyhand-actions flex flex-wrap items-center"
          role="group"
          aria-label="Presentation controls"
        >
          {(Object.keys(pointerStyles) as PointerStyle[]).map((id) => (
            <button
              key={id}
              type="button"
              ref={id === style ? selectRef : undefined}
              className="roamjs-tinyhand-style"
              title={pointerStyles[id].label}
              aria-label={pointerStyles[id].label}
              aria-pressed={style === id}
              onClick={() => {
                setStyle(id);
                onStyleChange(id);
                setPanel(null);
              }}
            >
              {id === "laser" ? (
                <span className="roamjs-tinyhand-dot" />
              ) : (
                <img
                  alt=""
                  className={
                    id === "lavender" ? "roamjs-tinyhand-lavender" : undefined
                  }
                  src={artwork.hands[id].image}
                />
              )}
            </button>
          ))}
          <Button
            minimal
            icon={sound ? "volume-up" : "volume-off"}
            aria-label="Tap sound settings"
            title="Tap sound settings"
            aria-expanded={panel === "sound"}
            onClick={() => setPanel(panel === "sound" ? null : "sound")}
          />
          <Button
            minimal
            data-ink-action=""
            icon="undo"
            aria-label="Undo"
            title={`Undo last mark (${modifier}+Z)`}
            aria-keyshortcuts="Meta+Z Control+Z"
            disabled={strokeCount === 0}
            onClick={() => drawingRef.current?.undo()}
          />
          <Button
            minimal
            data-ink-action=""
            icon="eraser"
            aria-label="Clear"
            title="Clear all marks"
            disabled={strokeCount === 0}
            onClick={() => drawingRef.current?.clear()}
          />
          <Popover
            placement="top-end"
            modifiers={{
              flip: { enabled: false },
              preventOverflow: { boundariesElement: "viewport", padding: 8 },
            }}
            portalContainer={dialogRef.current ?? undefined}
            isOpen={toolbarVisible && panel === "help"}
            onInteraction={(open) =>
              setPanel((current) =>
                open ? "help" : current === "help" ? null : current,
              )
            }
            autoFocus={false}
            enforceFocus={false}
            content={
              <section
                id="roamjs-tinyhand-help"
                className="roamjs-tinyhand-guide"
                aria-label="Gesture guide"
              >
                <h2>Gesture guide</h2>
                <dl>
                  {[
                    ["Tap", "Click"],
                    ["Draw", "Drag"],
                    ["Draw an arrow", modifier + " + drag"],
                    ["Erase ink", "Right-drag"],
                    [
                      "Interact with Roam",
                      (modifier === "Cmd" ? "Option" : "Alt") + " + click",
                    ],
                    ["Exit pointing", "Esc"],
                  ].map(([action, gesture]) => (
                    <React.Fragment key={action}>
                      <dt>{action}</dt>
                      <dd>{gesture}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </section>
            }
          >
            <Button
              minimal
              elementRef={helpRef}
              icon="help"
              title="Gesture guide"
              aria-label="Gesture guide"
              aria-expanded={panel === "help"}
              aria-controls={
                panel === "help" ? "roamjs-tinyhand-help" : undefined
              }
            />
          </Popover>
          <Button
            minimal
            text="Exit"
            title="Exit pointing (Esc)"
            onClick={onClose}
          />
        </div>
        {panel === "sound" && (
          <label className="roamjs-tinyhand-sounds">
            Tap sound{" "}
            <HTMLSelect
              aria-label="Tap sound"
              value={sound ? choice : "off"}
              options={[
                { value: "off", label: "Off" },
                ...Object.entries(soundNames).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
              onChange={(event) => {
                const value = event.currentTarget.value;
                const enabled = value !== "off";
                if (enabled) {
                  setChoice(value as SoundChoice);
                  onChoiceChange(value as SoundChoice);
                }
                setSound(enabled);
                onSoundChange(enabled);
              }}
            />
          </label>
        )}
      </div>
    </dialog>
  );
};
