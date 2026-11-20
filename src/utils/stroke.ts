export type Point = { x: number; y: number };

export const movedToDraw = (start: Point, end: Point): boolean =>
  Math.hypot(end.x - start.x, end.y - start.y) >= 4;

export const arrowhead = (
  points: readonly Point[],
): [Point, Point] | undefined => {
  const end = points.at(-1);
  const start = points[0];
  if (!end || !start) return;

  const size = 14;
  const back =
    points.findLast(
      (point) => Math.hypot(end.x - point.x, end.y - point.y) >= size * 1.2,
    ) ?? start;
  const length = Math.hypot(end.x - back.x, end.y - back.y);
  if (length < 1) return;

  const angle = Math.atan2(back.y - end.y, back.x - end.x);
  const wingLength = Math.min(size, length * 0.8);
  const wing = (spread: number): Point => ({
    x: end.x + Math.cos(angle + spread) * wingLength,
    y: end.y + Math.sin(angle + spread) * wingLength,
  });
  return [wing(-Math.PI / 7), wing(Math.PI / 7)];
};
