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

test("gives a small closed arrow the direction of its last segment", () => {
  const head = arrowhead([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 0 },
  ]);
  assert.ok(head);
  assert.ok(head.every((point) => point.y > 0));
  assert.ok(head[0].x * head[1].x < 0);
});

test("points a short arrow in the direction of its incoming stroke after a reversal", () => {
  const head = arrowhead([
    { x: 0, y: 0 },
    { x: 14, y: 4 },
    { x: 8, y: 4 },
    { x: 5, y: 4 },
  ]);
  assert.ok(head?.every((point) => point.x > 5));
});

test("keeps a visible arrowhead on a short straight stroke with dense points", () => {
  const head = arrowhead(Array.from({ length: 13 }, (_, x) => ({ x, y: 0 })));
  assert.ok(head?.every((point) => point.x < 6));
});

test("follows a deliberate reversal that is shorter than the full lookback", () => {
  const outbound = Array.from({ length: 61 }, (_, x) => ({ x, y: 40 }));
  const incoming = Array.from({ length: 16 }, (_, i) => ({ x: 59 - i, y: 40 }));
  const head = arrowhead([...outbound, ...incoming]);
  assert.ok(head?.every((point) => point.x > 44));
});
