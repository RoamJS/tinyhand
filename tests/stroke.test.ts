import assert from "node:assert/strict";
import test from "node:test";
import { arrowhead, movedToDraw } from "../src/utils/stroke.ts";

test("keeps click jitter a tap and recognizes a deliberate drag", () => {
  const start = { x: 10, y: 10 };
  assert.equal(movedToDraw(start, { x: 12, y: 12 }), false);
  assert.equal(movedToDraw(start, { x: 14, y: 10 }), true);
  assert.equal(movedToDraw(start, { x: 7, y: 7 }), true);
});

test("aims an arrow along the final stretch and ignores a last-pixel wobble", () => {
  const points = [
    { x: 5, y: 20 },
    { x: 22, y: 20 },
    { x: 39, y: 18 },
    { x: 40, y: 20 },
  ];
  const head = arrowhead(points);
  assert.ok(head);
  const [upper, lower] = head.sort((a, b) => a.y - b.y);
  assert.ok(upper.x < 40 && upper.y < 20);
  assert.ok(lower.x < 40 && lower.y > 20);
  assert.ok(Math.abs(upper.x - lower.x) < 1e-9);
});

test("scales down short arrows and skips degenerate paths", () => {
  assert.equal(arrowhead([]), undefined);
  assert.equal(
    arrowhead([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]),
    undefined,
  );
  const head = arrowhead([
    { x: 0, y: 0 },
    { x: 4, y: 0 },
  ]);
  assert.ok(head?.every((point) => point.x > 0 && point.x < 4));
});
