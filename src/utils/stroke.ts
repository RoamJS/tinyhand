export type Point = { x: number; y: number };

const DRAW_THRESHOLD = 4;

export const movedToDraw = (start: Point, end: Point): boolean =>
  Math.hypot(end.x - start.x, end.y - start.y) >= DRAW_THRESHOLD;

export const arrowhead = (
  points: readonly Point[],
): [Point, Point] | undefined => {
  const end = points.at(-1);
  if (!end) return;

  const size = 14;
  const distanceFromEnd = (point: Point): number =>
    Math.hypot(end.x - point.x, end.y - point.y);
  const incomingIndex = points.findLastIndex((point) =>
    movedToDraw(end, point),
  );
  const fallbackIndex =
    incomingIndex < 0
      ? points.findLastIndex((point) => distanceFromEnd(point) >= 1)
      : incomingIndex;
  if (fallbackIndex < 0) return;

  let back = points[fallbackIndex];
  let length = distanceFromEnd(back);
  const directionX = (back.x - end.x) / length;
  const directionY = (back.y - end.y) / length;
  // Extend the lookback along the incoming stroke, stopping at a reversal.
  for (let index = fallbackIndex - 1; index >= 0; index--) {
    const point = points[index];
    const alongShaft =
      (point.x - end.x) * directionX + (point.y - end.y) * directionY;
    if (alongShaft < length - DRAW_THRESHOLD) break;
    if (alongShaft >= size * 1.2) {
      back = point;
      break;
    }
    length = Math.max(length, alongShaft);
  }
  length = Math.max(length, distanceFromEnd(back));
  const angle = Math.atan2(back.y - end.y, back.x - end.x);
  const wingLength = Math.min(size, length * 0.8);
  const wing = (spread: number): Point => ({
    x: end.x + Math.cos(angle + spread) * wingLength,
    y: end.y + Math.sin(angle + spread) * wingLength,
  });
  return [wing(-Math.PI / 7), wing(Math.PI / 7)];
};
