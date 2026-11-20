import { arrowhead, type Point } from "./stroke";

export type Stroke = {
  color: string;
  points: Point[];
  arrow: boolean;
};

export const drawStroke = (
  ctx: CanvasRenderingContext2D,
  { color, points, arrow }: Stroke,
): void => {
  const first = points[0];
  const end = points.at(-1);
  if (!first || !end) return;

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const point = points[i];
    ctx.quadraticCurveTo(
      previous.x,
      previous.y,
      (previous.x + point.x) / 2,
      (previous.y + point.y) / 2,
    );
  }
  ctx.lineTo(end.x, end.y);

  const head = arrow ? arrowhead(points) : undefined;
  if (head) {
    ctx.moveTo(head[0].x, head[0].y);
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(head[1].x, head[1].y);
  }
  ctx.stroke();
};

type Hand = {
  bitmap: HTMLImageElement;
  tipX: number;
  tipY: number;
  wrist: number;
};

export const drawHand = ({
  ctx,
  hand,
  point,
  width,
  height,
  pressed,
}: {
  ctx: CanvasRenderingContext2D;
  hand: Hand;
  point: Point;
  width: number;
  height: number;
  pressed: boolean;
}): void => {
  const { bitmap, tipX, tipY, wrist } = hand;
  const handHeight = Math.max(45, Math.min(88, height * 0.13));
  const scale = (handHeight / wrist) * (pressed ? 0.94 : 1);
  const gripX = Math.min(width * 1.05, point.x + width * 0.3);
  const gripY = height * 1.12;
  const angle = Math.atan2(gripY - point.y, gripX - point.x);
  const rodLength = Math.hypot(gripX - point.x, gripY - point.y);
  const sourceWidth = bitmap.naturalWidth;
  const sourceRodLength = bitmap.naturalHeight - wrist;
  const x = -tipX * scale;
  const y = -tipY * scale;

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(angle - Math.PI / 2);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 4;
  ctx.drawImage(
    bitmap,
    0,
    wrist,
    sourceWidth,
    sourceRodLength,
    x,
    y + wrist * scale - 1,
    sourceWidth * scale,
    rodLength,
  );
  ctx.drawImage(
    bitmap,
    0,
    0,
    sourceWidth,
    wrist,
    x,
    y,
    sourceWidth * scale,
    wrist * scale,
  );
  ctx.restore();
};

export const drawLaser = (
  ctx: CanvasRenderingContext2D,
  point: Point,
  pressed: boolean,
): void => {
  ctx.save();
  ctx.shadowColor = "#ff4137";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#f72c24";
  ctx.beginPath();
  ctx.arc(point.x, point.y, pressed ? 6 : 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffe0d9";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
};
