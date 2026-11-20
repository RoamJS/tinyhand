import {
  handArtwork,
  pointerStyles,
  tapSound,
  type PointerStyle,
} from "~/pointerStyles";
import { drawHand, drawLaser, drawStroke, type Stroke } from "./draw";
import { movedToDraw, type Point } from "./stroke";

export type PointerOptions = { style: PointerStyle; sound: boolean };

type PointerSurface = {
  clear: () => void;
  update: (options: PointerOptions) => void;
  dispose: () => void;
};

type Gesture = {
  pointerId: number;
  stroke: Stroke;
  start: Point;
  drawing: boolean;
};

const TAP_MS = 240;

const eventPoint = (e: PointerEvent): Point => ({
  x: e.clientX,
  y: e.clientY,
});

export const createPointerSurface = ({
  ink,
  surface,
  initialOptions,
}: {
  ink: HTMLCanvasElement;
  surface: HTMLCanvasElement;
  initialOptions: PointerOptions;
}): PointerSurface => {
  const inkContext = ink.getContext("2d");
  const context = surface.getContext("2d");
  if (!inkContext || !context) throw new Error("TinyHand requires Canvas 2D");

  const events = new AbortController();
  const { signal } = events;
  const audio = new Audio(tapSound);
  const hands = new Map<keyof typeof handArtwork, HTMLImageElement>();
  const strokes: Stroke[] = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let options = initialOptions;
  let pointer: Point | undefined;
  let gesture: Gesture | undefined;
  let pulse: { position: Point; color: string; start: number } | undefined;
  let frame = 0;
  let width = 0;
  let height = 0;

  const render = (now: number): void => {
    frame = 0;
    context.clearRect(0, 0, width, height);
    if (gesture?.drawing) drawStroke(context, gesture.stroke);
    if (pulse) {
      const progress = Math.min(1, (now - pulse.start) / TAP_MS);
      if (progress === 1) {
        pulse = undefined;
      } else {
        context.save();
        context.globalAlpha = 1 - progress;
        context.strokeStyle = pulse.color;
        context.lineWidth = 3;
        context.beginPath();
        context.arc(
          pulse.position.x,
          pulse.position.y,
          reducedMotion.matches ? 12 : 6 + 14 * progress,
          0,
          2 * Math.PI,
        );
        context.stroke();
        context.restore();
        scheduleRender();
      }
    }
    if (!pointer) return;

    const { style } = options;
    if (style === "laser") {
      drawLaser(context, pointer, Boolean(gesture));
    } else {
      const bitmap = hands.get(style);
      if (bitmap?.complete && bitmap.naturalWidth) {
        drawHand({
          ctx: context,
          hand: { ...handArtwork[style], bitmap },
          point: pointer,
          width,
          height,
          pressed: Boolean(gesture),
        });
      } else {
        drawLaser(context, pointer, Boolean(gesture));
      }
    }
  };

  const scheduleRender = (): void => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const update = (next: PointerOptions): void => {
    options = next;
    const { style } = options;
    if (style !== "laser" && !hands.has(style)) {
      const image = new Image();
      image.addEventListener("load", scheduleRender, { signal });
      hands.set(style, image);
      image.src = handArtwork[style].image;
    }
    scheduleRender();
  };

  const resize = (): void => {
    width = surface.clientWidth;
    height = surface.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    for (const canvas of [ink, surface]) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    inkContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    strokes.forEach((stroke) => drawStroke(inkContext, stroke));
    scheduleRender();
  };

  const endGesture = (): void => {
    const id = gesture?.pointerId;
    gesture = undefined;
    if (id !== undefined && surface.hasPointerCapture(id)) {
      surface.releasePointerCapture(id);
    }
    scheduleRender();
  };

  const clear = (): void => {
    endGesture();
    strokes.length = 0;
    pulse = undefined;
    inkContext.clearRect(0, 0, width, height);
  };

  const trackGesture = (event: PointerEvent): void => {
    if (!gesture) return;
    const point = eventPoint(event);
    const { stroke, start } = gesture;
    stroke.arrow = event.metaKey || event.ctrlKey;
    gesture.drawing ||= movedToDraw(start, point);
    const previous = stroke.points.at(-1);
    if (
      gesture.drawing &&
      (point.x !== previous?.x || point.y !== previous.y)
    ) {
      stroke.points.push(point);
    }

    // Pointer Events can report a button release as a move when another button is held.
    if (event.buttons & 1) return;
    pointer = event.pointerType === "touch" ? undefined : point;
    if (gesture.drawing) {
      strokes.push(stroke);
      drawStroke(inkContext, stroke);
    } else {
      pulse = {
        position: point,
        start: performance.now(),
        color: stroke.color,
      };
      if (options.sound) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    }
    endGesture();
  };

  surface.addEventListener(
    "pointerdown",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!event.isPrimary || event.button !== 0 || gesture) return;
      pointer = eventPoint(event);
      gesture = {
        pointerId: event.pointerId,
        start: pointer,
        drawing: false,
        stroke: {
          color: pointerStyles[options.style].ink,
          points: [pointer],
          arrow: event.metaKey || event.ctrlKey,
        },
      };
      surface.setPointerCapture(event.pointerId);
      scheduleRender();
    },
    { signal },
  );

  surface.addEventListener(
    "pointermove",
    (event) => {
      if (
        !event.isPrimary ||
        (gesture && gesture.pointerId !== event.pointerId)
      )
        return;
      pointer = eventPoint(event);
      trackGesture(event);
      scheduleRender();
    },
    { signal },
  );

  surface.addEventListener(
    "pointerup",
    (event) => {
      event.stopPropagation();
      if (gesture?.pointerId === event.pointerId) trackGesture(event);
    },
    { signal },
  );

  const cancelGesture = (event: PointerEvent): void => {
    if (gesture?.pointerId !== event.pointerId) return;
    pointer = undefined;
    endGesture();
  };
  surface.addEventListener("pointercancel", cancelGesture, { signal });
  surface.addEventListener("lostpointercapture", cancelGesture, { signal });
  surface.addEventListener(
    "pointerleave",
    () => {
      if (gesture) return;
      pointer = undefined;
      scheduleRender();
    },
    { signal },
  );

  const updateModifier = (event: KeyboardEvent): void => {
    if (!gesture) return;
    gesture.stroke.arrow = event.metaKey || event.ctrlKey;
    scheduleRender();
  };
  window.addEventListener("keydown", updateModifier, { capture: true, signal });
  window.addEventListener("keyup", updateModifier, { capture: true, signal });
  window.addEventListener(
    "blur",
    () => {
      pointer = undefined;
      endGesture();
    },
    { signal },
  );
  window.addEventListener("resize", resize, { signal });

  const consume = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
  };
  for (const type of [
    "click",
    "auxclick",
    "contextmenu",
    "dblclick",
    "wheel",
  ]) {
    surface.addEventListener(type, consume, { passive: false, signal });
  }

  resize();
  update(initialOptions);

  return {
    clear,
    update,
    dispose: () => {
      events.abort();
      window.cancelAnimationFrame(frame);
      audio.pause();
    },
  };
};
