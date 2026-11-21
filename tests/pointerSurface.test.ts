import assert from "node:assert/strict";
import test from "node:test";
import { buildSync } from "esbuild";

// Bundle the production surface with its normal asset imports for the Node test runner.
const bundle = buildSync({
  entryPoints: ["src/utils/pointerSurface.ts"],
  bundle: true,
  write: false,
  format: "esm",
  logLevel: "silent",
});
const { createPointerSurface } = await import(
  "data:text/javascript;base64," +
    Buffer.from(bundle.outputFiles[0].contents).toString("base64")
);

test("commits slow-to-fast strokes on release, capture loss, and cancellation; erasing is undoable", (t) => {
  const win = Object.assign(new EventTarget(), {
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
  });
  for (const [name, value] of Object.entries({
    window: win,
    Image: EventTarget,
    Audio: class {
      pause() {}
    },
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { value, configurable: true });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const paint: string[] = [];
  const ctx = {
    globalCompositeOperation: "source-over",
    save() {},
    restore() {},
    setTransform() {},
    clearRect() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    beginPath() {},
    stroke() {
      paint.push(this.globalCompositeOperation);
    },
  };
  const canvas = Object.assign(new EventTarget(), {
    getContext: () => ctx,
    clientWidth: 800,
    clientHeight: 600,
    setPointerCapture() {},
    hasPointerCapture: () => false,
  });
  let count = 0;
  const api = createPointerSurface({
    surface: canvas,
    ink: { ...canvas },
    initialOptions: { style: "laser", sound: false, choice: "pop" },
    onStrokeCountChange: (n: number) => {
      count = n;
    },
  });
  function send(type: string, x: number, buttons: number, button = 0) {
    canvas.dispatchEvent(
      Object.assign(new Event(type), {
        clientX: x,
        clientY: 20,
        isPrimary: true,
        pointerId: 1,
        buttons,
        button,
      }),
    );
  }
  for (const [i, ending] of [
    "pointerup",
    "lostpointercapture",
    "pointercancel",
  ].entries()) {
    send("pointerdown", 10, 1);
    send("pointermove", 16, 1);
    send("pointermove", 450, 1);
    send(ending, 460, 0);
    send("lostpointercapture", 460, 0);
    assert.equal(count, i + 1);
  }
  send("pointerdown", 100, 2, 2);
  send("pointermove", 300, 2);
  send("pointerup", 350, 0, 2);
  assert.equal(paint.at(-1), "destination-out");
  assert.equal(count, 4);
  api.undo();
  assert.equal(count, 3);
  assert.equal(paint.at(-1), "source-over");
  api.dispose();
});
