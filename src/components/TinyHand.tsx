import React, { useLayoutEffect, useRef, useState } from "react";
import { Button, HTMLSelect } from "@blueprintjs/core";
import { pointerStyles, type PointerStyle } from "~/pointerStyles";
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
  const drawingRef = useRef<ReturnType<typeof createPointerSurface>>();
  const [style, setStyle] = useState(initialStyle);
  const [sound, setSound] = useState(initialSound);

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
    });
    drawingRef.current = drawing;
    const cancel = (event: Event): void => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", cancel);
    return () => {
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
      <p id="roamjs-tinyhand-help" className="roamjs-tinyhand-help">
        Move to point, click to tap, and drag to draw. Hold Command or Control
        to add an arrowhead. Press Escape to exit.
      </p>
      <canvas ref={inkRef} aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="roamjs-tinyhand-surface"
        aria-hidden="true"
      />
      <div className="roamjs-tinyhand-controls flex flex-wrap items-center gap-2">
        <HTMLSelect
          aria-label="Pointer style"
          value={style}
          onChange={(event) => {
            const next = event.currentTarget.value as PointerStyle;
            setStyle(next);
            onStyleChange(next);
          }}
          options={Object.entries(pointerStyles).map(([value, { label }]) => ({
            value,
            label,
          }))}
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
          text="Clear"
          onClick={() => drawingRef.current?.clear()}
        />
        <Button minimal text="Exit" onClick={onClose} />
      </div>
    </dialog>
  );
};
