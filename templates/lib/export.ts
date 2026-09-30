// Export pipeline. The strip is rendered offscreen once at full size, then
// each screen is cropped to its exact store resolution. Client-side only.

import { canvasSize, getDevice } from "./devices";
import type { Deck, Orientation, ProjectState } from "./types";

export interface ExportTarget {
  deckId: string;
  deviceId: string;
  orientation: Orientation;
  width: number;
  height: number;
}

export function exportTargets(state: ProjectState): ExportTarget[] {
  const targets: ExportTarget[] = [];
  for (const deck of state.decks) {
    const portrait = canvasSize(deck.deviceId, "portrait");
    targets.push({ deckId: deck.id, deviceId: deck.deviceId, orientation: "portrait", width: portrait.w, height: portrait.h });
    const landscape = canvasSize(deck.deviceId, "landscape");
    if (landscape && deck.orientation === "landscape") {
      targets.push({ deckId: deck.id, deviceId: deck.deviceId, orientation: "landscape", width: landscape.w, height: landscape.h });
    }
  }
  return targets;
}

/** Zip path: platform/device/resolution/locale/screenNN.png */
export function exportPath(state: ProjectState, deck: Deck, orientation: Orientation, index: number, total: number): string {
  const device = getDevice(deck.deviceId);
  const size = canvasSize(deck.deviceId, orientation);
  const platform = deck.platform === "ios" ? "app-store" : deck.platform === "mac" ? "mac-app-store" : "google-play";
  return [platform, device.id, `${size.w}x${size.h}`, state.fallbackLocale, `screen${String(index + 1).padStart(2, "0")}-of-${total}.png`].join("/");
}

export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Screen N's crop from the full strip in deck canvas coordinates. */
export function screenCrop(deck: Deck, index: number): Crop {
  const { w } = canvasSize(deck.deviceId, deck.orientation);
  return { x: index * w, y: 0, w, h: canvasSize(deck.deviceId, deck.orientation).h };
}

/**
 * Render every screen of a deck as full-res PNG blobs.
 * Renders the connected strip once (so spanning elements appear in every
 * crop they touch), or each screen separately in isolated mode.
 */
export async function renderDeckPngs(
  deck: Deck,
  state: ProjectState,
  locale: string,
  opts: { scale?: number } = {},
): Promise<{ name: string; blob: Blob }[]> {
  const { renderDeckStrip } = await import("@/components/CanvasRenderer");
  const strip = await renderDeckStrip(deck, state, locale, undefined, { scale: opts.scale });
  const out: { name: string; blob: Blob }[] = [];
  for (let i = 0; i < deck.screens.length; i++) {
    const crop = screenCrop(deck, i);
    const size = canvasSize(deck.deviceId, deck.orientation);
    const c = document.createElement("canvas");
    c.width = size.w;
    c.height = size.h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    if (state.mode === "connected") {
      ctx.drawImage(strip, crop.x, crop.y, crop.w, crop.h, 0, 0, size.w, size.h);
    } else {
      // isolated: re-render this screen alone so offscreen elements never leak
      const single = await renderDeckStrip(deck, { ...state, mode: "isolated" }, locale, i);
      ctx.drawImage(single, 0, 0, single.width, single.height, 0, 0, size.w, size.h);
    }
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
    if (!blob) throw new Error("png encode failed");
    out.push({ name: exportPath(state, deck, deck.orientation, i, deck.screens.length), blob });
  }
  return out;
}
