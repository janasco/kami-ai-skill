// Low-level canvas drawing helpers. CanvasRenderer composes these; both the
// live preview and the export pipeline use them, so preview === export.

import type { Theme } from "./themes";
import type { ScreenElement } from "./types";

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Paint a theme background into a box (screen-sized in isolated, strip-sized in connected). */
export function paintBackground(ctx: CanvasRenderingContext2D, theme: Theme, w: number, h: number) {
  const { bg } = theme;
  const from = bg.from ?? "#ffffff";
  const to = bg.to ?? from;
  if (bg.type === "solid" || !bg.to) {
    ctx.fillStyle = from;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (bg.type === "radial") {
    const g = ctx.createRadialGradient(w / 2, h * 0.32, 0, w / 2, h * 0.32, Math.max(w, h) * 0.75);
    if (bg.stops && bg.stops.length > 1) bg.stops.forEach((s) => g.addColorStop(s.at, s.color));
    else {
      g.addColorStop(0, from);
      g.addColorStop(1, to);
    }
    ctx.fillStyle = g;
  } else {
    // CSS angle convention: 0deg = to top, 90deg = to right, 180deg = to bottom
    const rad = ((bg.angle ?? 180) * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const cx = w / 2;
    const cy = h / 2;
    const len = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
    const g = ctx.createLinearGradient(cx - dx * len, cy - dy * len, cx + dx * len, cy + dy * len);
    if (bg.stops && bg.stops.length > 1) bg.stops.forEach((s) => g.addColorStop(s.at, s.color));
    else {
      g.addColorStop(0, from);
      g.addColorStop(1, to);
    }
    ctx.fillStyle = g;
  }
  ctx.fillRect(0, 0, w, h);
}

/** Decorative motif inside a screen box. Element-level motifs (glass,
 *  editorial, brutal) are no-ops here — they style elements, not bg. */
export function paintMotif(ctx: CanvasRenderingContext2D, theme: Theme, x: number, y: number, w: number, h: number) {
  const a = theme.accent;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  switch (theme.motif) {
    case "glow": {
      const g = ctx.createRadialGradient(x + w / 2, y + h * 0.55, 0, x + w / 2, y + h * 0.55, w * 0.6);
      g.addColorStop(0, a + "44");
      g.addColorStop(1, a + "00");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      break;
    }
    case "sun":
      ctx.fillStyle = a + "66";
      ctx.beginPath();
      ctx.arc(x + w * 0.85, y + h * 0.12, w * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "dots":
      ctx.fillStyle = a + "55";
      for (let gy = y + w * 0.03; gy < y + h * 0.2; gy += w * 0.036)
        for (let gx = x + w * 0.05; gx < x + w * 0.95; gx += w * 0.036) {
          ctx.beginPath();
          ctx.arc(gx, gy, w * 0.004, 0, Math.PI * 2);
          ctx.fill();
        }
      break;
    case "waves":
      ctx.strokeStyle = a + "18";
      ctx.lineWidth = w * 0.02;
      for (let r = w * 0.2; r < w * 0.9; r += w * 0.09) {
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 1.15, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case "grid":
      ctx.strokeStyle = a + "0d";
      ctx.lineWidth = Math.max(1, w / 1320);
      for (let gx = x; gx <= x + w; gx += w * 0.03) {
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx, y + h);
        ctx.stroke();
      }
      for (let gy = y; gy <= y + h; gy += w * 0.03) {
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.lineTo(x + w, gy);
        ctx.stroke();
      }
      break;
    case "blobs":
      ctx.fillStyle = a + "55";
      ctx.beginPath();
      ctx.arc(x + w * 0.12, y + h * 0.88, w * 0.17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff44";
      ctx.beginPath();
      ctx.arc(x + w * 0.88, y + h * 0.08, w * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "neon":
    case "mist":
    case "aurora": {
      const g = ctx.createLinearGradient(x, y + h, x, y + (theme.motif === "aurora" ? 0 : h * 0.6));
      g.addColorStop(0, a + (theme.motif === "neon" ? "22" : "22"));
      g.addColorStop(1, a + "00");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      break;
    }
    case "halftone":
      ctx.fillStyle = a + "66";
      for (let gy = y + h * 0.86; gy < y + h; gy += w * 0.014)
        for (let gx = x + w * 0.7; gx < x + w; gx += w * 0.014) {
          ctx.beginPath();
          ctx.arc(gx, gy, w * 0.003, 0, Math.PI * 2);
          ctx.fill();
        }
      break;
    case "grain":
      ctx.fillStyle = a + "18";
      for (let gy = y; gy < y + h; gy += w * 0.006)
        for (let gx = x; gx < x + w; gx += w * 0.006) {
          ctx.fillRect(gx, gy, w * 0.0015, w * 0.0015);
        }
      break;
    default:
      break; // divider, underline, panels, arches, glass, editorial, brutal
  }
  ctx.restore();
}

const FONT_STACK = `ui-sans-serif, -apple-system, "Segoe UI", Roboto, Inter, sans-serif`;

/** Word-wrapped text. Returns total height drawn. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  el: ScreenElement,
  opts: { theme: Theme; screenW: number; margin: number; rtl: boolean },
): number {
  const text = el.text ?? "";
  if (!text) return 0;
  const size = el.fontSize ?? 96;
  const weight = el.weight ?? 700;
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textBaseline = "top";
  ctx.direction = opts.rtl ? "rtl" : "ltr";

  let align = el.align ?? "center";
  if (opts.rtl && align !== "center") align = align === "left" ? "right" : "left";
  ctx.textAlign = align;

  ctx.fillStyle = !el.color || el.color === "#inherit" ? opts.theme.text : el.color;

  const boxW = el.w ?? opts.screenW - opts.margin * 2;
  // anchor: center/left/right relative to box
  const anchorX = el.x + (align === "center" ? boxW / 2 : align === "right" ? boxW : 0);

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= boxW || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  const maxLines = el.maxLines ?? 3;
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) shown[maxLines - 1] = shown[maxLines - 1].replace(/\s*\S*$/, "") + "\u2026";

  const lineHeight = size * 1.15;
  shown.forEach((l, i) => ctx.fillText(l, anchorX, el.y + i * lineHeight));
  return shown.length * lineHeight;
}

/** Element bounding box in strip coordinates (for hit boxes and crops). */
export function elementBox(el: ScreenElement, screenW: number, margin: number): { x: number; y: number; w: number; h: number } {
  if (el.kind === "device") {
    return { x: el.x, y: el.y, w: el.w ?? screenW * 0.62, h: el.h ?? screenW * 1.27 };
  }
  if (el.kind === "shape" || el.kind === "image") {
    return { x: el.x, y: el.y, w: el.w ?? 200, h: el.h ?? 200 };
  }
  return { x: el.x, y: el.y, w: el.w ?? screenW - margin * 2, h: (el.fontSize ?? 96) * 1.3 };
}
