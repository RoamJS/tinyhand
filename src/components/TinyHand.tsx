import React, { useLayoutEffect, useRef, useState } from "react";
import { Button, HTMLSelect } from "@blueprintjs/core";
import { pointerStyles, type PointerStyle } from "~/preferences";
import { createPointerSurface } from "~/utils/pointerSurface";

type Props = {
  initialStyle: PointerStyle;
  initialSound: boolean;
  onStyleChange: (style: PointerStyle) => void;
  onSoundChange: (enabled: boolean) => void;
  onClose: () => void;
};

export const TinyHand = ({
  initialStyle,
  initialSound,
  onStyleChange,
  onSoundChange,
  onClose,
}: Props): React.ReactElement => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const drawingRef = useRef<ReturnType<typeof createPointerSurface>>();
  const [style, setStyle] = useState(initialStyle);
  const [sound, setSound] = useState(initialSound);
  const [strokeCount, setStrokeCount] = useState(0);
  const modifier = /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
    ? "Cmd"
    : "Ctrl";

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const ink = inkRef.current;
    const surface = canvasRef.current;
    if (!dialog || !ink || !surface) return;

    dialog.showModal();
    const drawing = createPointerSurface({
      ink,
      surface,
      initialOptions: { style: initialStyle, sound: initialSound },
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
      drawing.dispose();
      dialog.close();
    };
  }, [initialStyle, initialSound, onClose]);

  useLayoutEffect(() => {
    drawingRef.current?.update({ style, sound });
  }, [style, sound]);

  return (
    <dialog
      ref={dialogRef}
      className="roamjs-tinyhand"
      aria-label="TinyHand presentation overlay"
      aria-describedby="roamjs-tinyhand-help"
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
    >
      <canvas ref={inkRef} aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="roamjs-tinyhand-surface"
        aria-hidden="true"
      />
      <div className="roamjs-tinyhand-controls">
        <div
          className="roamjs-tinyhand-actions flex flex-wrap items-center"
          role="group"
          aria-label="Presentation controls"
        >
          <HTMLSelect
            elementRef={selectRef}
            aria-label="Pointer style"
            value={style}
            onChange={(event) => {
              const next = event.currentTarget.value as PointerStyle;
              setStyle(next);
              onStyleChange(next);
            }}
            options={Object.entries(pointerStyles).map(
              ([value, { label }]) => ({
                value,
                label,
              }),
            )}
          />
          <Button
            aria-label="Tap sound"
            aria-pressed={sound}
            title={sound ? "Mute tap sound" : "Enable tap sound"}
            active={sound}
            icon={sound ? "volume-up" : "volume-off"}
            minimal
            onClick={() => {
              setSound(!sound);
              onSoundChange(!sound);
            }}
          />
          <Button
            minimal
            data-ink-action=""
            text="Undo"
            title={`Undo last mark (${modifier}+Z)`}
            aria-keyshortcuts="Meta+Z Control+Z"
            disabled={strokeCount === 0}
            onClick={() => drawingRef.current?.undo()}
          />
          <Button
            minimal
            data-ink-action=""
            text="Clear"
            title="Clear all marks"
            disabled={strokeCount === 0}
            onClick={() => drawingRef.current?.clear()}
          />
          <Button
            minimal
            text="Exit"
            title="Exit pointing (Esc)"
            onClick={onClose}
          />
        </div>
        <p id="roamjs-tinyhand-help" className="roamjs-tinyhand-help">
          <span>Click to tap.</span> <span>Drag to draw.</span>{" "}
          <span>
            <kbd>{modifier}</kbd> + drag for an arrow.
          </span>{" "}
          <span>
            <kbd>Esc</kbd> to exit.
          </span>
        </p>
      </div>
    </dialog>
  );
};
