"use client";

// The single source of pixel truth: renders a deck's screen strip to canvas.
// The live preview and the export pipeline both call renderDeckStrip, so
// what you see is exactly what ships.

import { canvasSize, getDevice } from "@/lib/devices";
import { getTheme } from "@/lib/themes";
import { drawFitted, assetUrl } from "@/lib/assets";
import { drawText, paintBackground, paintMotif, roundRectPath } from "@/lib/render";
import { resolveText, isRtl } from "@/lib/locales";
import { safeMargin } from "@/lib/themes";
import type { Deck, ProjectState, Screen, ScreenElement } from "@/lib/types";

const imgCache = new Map<string, HTMLImageElement>();

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  const hit = imgCache.get(src);
  if (hit) return hit.complete && hit.naturalWidth > 0 ? hit : null;
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    imgCache.set(src, img);
    return img;
  } catch {
    return null;
  }
}

async function preloadDeck(deck: Deck, state: ProjectState): Promise<void> {
  const urls = new Set<string>();
  for (const screen of deck.screens)
    for (const el of screen.elements) {
      if (el.kind === "device" && el.screenshotId) {
        const asset = state.assets.find((a) => a.id === el.screenshotId);
        if (asset) urls.add(assetUrl(asset.file));
      }
      if (el.kind === "image" && el.screenshotId) {
        const asset = state.assets.find((a) => a.id === el.screenshotId);
        if (asset) urls.add(assetUrl(asset.file));
      }
    }
  await Promise.all([...urls].map(loadImage));
}

function elementText(el: ScreenElement, state: ProjectState, locale: string): string {
  return resolveText(el, locale, state.fallbackLocale);
}

function drawDeviceFrame(
  ctx: CanvasRenderingContext2D,
  el: ScreenElement,
  deck: Deck,
  state: ProjectState,
) {
  const device = getDevice(el.deviceId ?? deck.deviceId);
  const w = el.w ?? 400;
  const h = el.h ?? 800;
  const f = device.frame;

  // drop shadow (softer + larger on dark themes)
  const theme = getTheme(deck.styleId);
  ctx.save();
  ctx.shadowColor = theme.dark ? "rgba(0,0,0,0.55)" : "rgba(15,23,42,0.35)";
  ctx.shadowBlur = theme.dark ? w * 0.09 : w * 0.05;
  ctx.shadowOffsetY = w * 0.03;

  if (f.kind !== "none") {
    ctx.fillStyle = "#0B0D12";
    roundRectPath(ctx, el.x, el.y, w, h, f.cornerRadius);
    ctx.fill();
    ctx.restore();

    // screen area
    const sx = el.x + f.bezel;
    const sy = el.y + f.bezel;
    const sw = w - f.bezel * 2;
    const sh = h - f.bezel * 2;
    ctx.save();
    roundRectPath(ctx, sx, sy, sw, sh, Math.max(4, f.cornerRadius - f.bezel * 0.7));
    ctx.clip();

    const asset = el.screenshotId ? state.assets.find((a) => a.id === el.screenshotId) : undefined;
    if (asset) {
      const img = imgCache.get(assetUrl(asset.file));
      if (img) {
        drawFitted(ctx, img, { x: sx, y: sy, w: sw, h: sh }, el.screenScale ?? 1, el.screenOffsetX ?? 0, el.screenOffsetY ?? 0);
      } else {
        ctx.fillStyle = "#1F2937";
        ctx.fillRect(sx, sy, sw, sh);
      }
    } else {
      // empty frame placeholder
      ctx.fillStyle = getTheme(deck.styleId).dark ? "#27303F" : "#E5E9F0";
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = "#94A3B8";
      ctx.font = `500 ${Math.round(w * 0.05)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("drop screenshot here", sx + sw / 2, sy + sh / 2);
    }

    // notch
    if (f.notch === "dynamic-island") {
      const iw = w * 0.24;
      const ih = Math.max(10, w * 0.06);
      ctx.fillStyle = "#0B0D12";
      roundRectPath(ctx, el.x + (w - iw) / 2, el.y + f.bezel + ih * 0.7, iw, ih, ih / 2);
      ctx.fill();
    } else if (f.notch === "punch-hole") {
      const r = Math.max(6, w * 0.028);
      ctx.fillStyle = "#0B0D12";
      ctx.beginPath();
      ctx.arc(el.x + w / 2, el.y + f.bezel + r * 1.4, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.notch === "mac-notch") {
      const nw = w * 0.12;
      const nh = Math.max(8, h * 0.022);
      ctx.fillStyle = "#0B0D12";
      roundRectPath(ctx, el.x + (w - nw) / 2, el.y + f.bezel, nw, nh, nh / 3);
      ctx.fill();
    }
    ctx.restore();
  } else {
    // frameless decks (feature graphic, wear): draw the capture directly
    const asset = el.screenshotId ? state.assets.find((a) => a.id === el.screenshotId) : undefined;
    if (asset) {
      const img = imgCache.get(assetUrl(asset.file));
      if (img) drawFitted(ctx, img, { x: el.x, y: el.y, w, h }, el.screenScale ?? 1, el.screenOffsetX ?? 0, el.screenOffsetY ?? 0);
    }
    ctx.restore();
  }
}

function drawScreenElements(
  ctx: CanvasRenderingContext2D,
  screen: Screen,
  deck: Deck,
  state: ProjectState,
  locale: string,
  screenW: number,
) {
  const margin = safeMargin(screenW);
  const theme = getTheme(deck.styleId);
  const rtl = isRtl(locale);
  const ordered = [...screen.elements].sort((a, b) => a.z - b.z);
  for (const el of ordered) {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;
    if (el.rotation) {
      const bw = el.w ?? (el.kind === "text" ? screenW : 100);
      const bh = el.h ?? (el.fontSize ?? 96) * 1.3;
      ctx.translate(el.x + bw / 2, el.y + bh / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-(el.x + bw / 2), -(el.y + bh / 2));
    }
    if (el.kind === "device") {
      // element x/y are strip coordinates — draw as-is
      drawDeviceFrame(ctx, el, deck, state);
    } else if (el.kind === "text") {
      drawText(ctx, { ...el, text: elementText(el, state, locale) }, { theme, screenW, margin, rtl });
    } else if (el.kind === "shape") {
      ctx.fillStyle = el.fill ?? theme.accent + "33";
      if (el.shape === "ring") {
        ctx.strokeStyle = el.fill ?? theme.accent;
        ctx.lineWidth = Math.max(2, (el.w ?? 100) * 0.06);
        ctx.beginPath();
        ctx.ellipse(el.x + (el.w ?? 100) / 2, el.y + (el.h ?? 100) / 2, (el.w ?? 100) / 2, (el.h ?? 100) / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.shape === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(el.x + (el.w ?? 100) / 2, el.y + (el.h ?? 100) / 2, (el.w ?? 100) / 2, (el.h ?? 100) / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        roundRectPath(ctx, el.x, el.y, el.w ?? 100, el.h ?? 100, el.radius ?? 24);
        ctx.fill();
      }
    } else if (el.kind === "image") {
      const asset = el.screenshotId ? state.assets.find((a) => a.id === el.screenshotId) : undefined;
      if (asset) {
        const img = imgCache.get(assetUrl(asset.file));
        if (img) {
          ctx.save();
          roundRectPath(ctx, el.x, el.y, el.w ?? 200, el.h ?? 200, el.radius ?? 0);
          ctx.clip();
          drawFitted(ctx, img, { x: el.x, y: el.y, w: el.w ?? 200, h: el.h ?? 200 }, 1, 0, 0);
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }
}

/**
 * Render the deck strip.
 * @param onlyScreenIndex render just one screen (isolated export / thumbnails)
 * @param opts.scale 1 = full export resolution; preview passes its own ratio
 */
export async function renderDeckStrip(
  deck: Deck,
  state: ProjectState,
  locale: string,
  onlyScreenIndex?: number,
  opts: { scale?: number } = {},
): Promise<HTMLCanvasElement> {
  await preloadDeck(deck, state);
  const scale = opts.scale ?? 1;
  const { w: screenW, h: screenH } = canvasSize(deck.deviceId, deck.orientation);
  const theme = getTheme(deck.styleId);
  const connected = state.mode === "connected" && onlyScreenIndex === undefined;

  const stripW = connected ? screenW * Math.max(1, deck.screens.length) : screenW;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(stripW * scale);
  canvas.height = Math.round(screenH * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.scale(scale, scale);

  paintBackground(ctx, theme, stripW, screenH);

  if (connected) {
    for (let i = 0; i < deck.screens.length; i++) {
      paintMotif(ctx, theme, i * screenW, 0, screenW, screenH);
      const screen = deck.screens[i];
      if (screen) drawScreenElements(ctx, screen, deck, state, locale, screenW);
    }
  } else {
    const idx = onlyScreenIndex ?? 0;
    paintMotif(ctx, theme, 0, 0, screenW, screenH);
    const screen = deck.screens[idx];
    if (screen) {
      // elements store strip coords; shift the canvas so screen idx starts at 0.
      // Neighboring screens' elements are never drawn here (isolated semantics).
      ctx.save();
      ctx.translate(-idx * screenW, 0);
      drawScreenElements(ctx, screen, deck, state, locale, screenW);
      ctx.restore();
    }
  }
  return canvas;
}

/** Thumbnails for the sidebar: one small canvas per screen. */
export async function renderScreenThumb(deck: Deck, state: ProjectState, locale: string, index: number, width = 140): Promise<string> {
  const single = await renderDeckStrip(deck, { ...state, mode: "isolated" }, locale, index);
  const { w, h } = canvasSize(deck.deviceId, deck.orientation);
  const scale = width / w;
  const out = document.createElement("canvas");
  out.width = Math.round(w * scale);
  out.height = Math.round(h * scale);
  out.getContext("2d")?.drawImage(single, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}
