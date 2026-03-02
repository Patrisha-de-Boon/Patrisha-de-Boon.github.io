import Color from "color";

export const applyAlpha = (
  fill: string,
  opacity?: number
) => {
  return Color(fill).alpha(opacity ?? 1).string();
};

export const getDistance = (x1: number, x2: number, y1: number, y2: number) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};


export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string
) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.closePath();

  // clip drawing area to circle
  ctx.clip();
  ctx.clearRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

  // fill circle
  ctx.fillStyle = color;
  ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

  ctx.restore();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  color: string,
  lineWidth?: number,
) => {
  ctx.save();

  if (lineWidth) {
    ctx.lineWidth = lineWidth;
  }

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = 'white',
  size = 18,
) => {
  ctx.save();

  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  ctx.font = `${size}px "Source Sans 3", sans-serif`;
  ctx.fillText(text, x, y);

  ctx.restore();
};

export const makeRadialGradient = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  startR: number,
  endR: number,
  startColour: string,
  endColour: string
) => {
  const gradient = ctx.createRadialGradient(
    x,
    y,
    startR,
    x,
    y,
    endR
  );
  gradient.addColorStop(0, startColour);
  gradient.addColorStop(0.1, startColour);
  gradient.addColorStop(1, endColour);
  return gradient;
};
