import { canvasSize, getDevice } from "./devices";
import { safeMargin, TYPE_RAMP } from "./themes";
import type { Deck, PlatformId, Screen, ScreenElement } from "./types";

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

export function emptyScreen(): Screen {
  return { id: newId("screen"), elements: [] };
}

export function makeTextElement(
  role: keyof typeof TYPE_RAMP,
  text: string,
  x: number,
  y: number,
  canvasWidth: number,
  themeText: string,
): ScreenElement {
  return {
    id: newId(role),
    kind: "text",
    role,
    x,
    y,
    z: 1,
    text,
    align: "center",
    color: themeText,
    fontSize: Math.round((TYPE_RAMP[role].size * canvasWidth) / 1320),
  };
}

export interface DeckSeed {
  headline: string;
  caption: string;
}

/** A ready-to-edit starter screen: headline + caption + centered device.
 *  Elements use strip coordinates: screenIndex offsets x so the screen's
 *  content lands on its own panel of the connected strip. */
export function starterScreen(deck: Deck, seed: DeckSeed, screenIndex = 0): Screen {
  const { w: cw, h: ch } = canvasSize(deck.deviceId, deck.orientation);
  const margin = safeMargin(cw);
  const off = screenIndex * cw;
  const device = getDevice(deck.deviceId);
  const frameless = device.frame.kind === "none"; // feature graphic / wear
  let frameW = frameless ? cw - margin * 2 : Math.round(cw * 0.62);
  let frameH = frameless ? ch - margin * 2 : Math.round(frameW * 2.05);
  const maxH = ch - margin * 2;
  if (!frameless && frameH > maxH) {
    frameH = maxH;
    frameW = Math.round(maxH / 2.05);
  }
  const els: ScreenElement[] = [
    makeTextElement("headline", seed.headline, margin + off, margin + Math.round(cw * 0.05), cw, "#inherit"),
    makeTextElement("caption", seed.caption, margin + off, margin + Math.round(cw * 0.19), cw, "#inherit"),
    {
      id: newId("device"),
      kind: "device",
      x: (frameless ? margin : Math.round((cw - frameW) / 2)) + off,
      y: frameless ? margin : Math.round(cw * 0.3),
      w: frameW,
      h: frameH,
      z: 2,
      deviceId: deck.deviceId,
      screenScale: 1,
      screenOffsetX: 0,
      screenOffsetY: 0,
    },
  ];
  return { id: newId("screen"), headline: seed.headline, caption: seed.caption, elements: els };
}

export function makeDeck(
  platform: PlatformId,
  deviceId: string,
  styleId: string,
  seeds: DeckSeed[],
): Deck {
  const deck: Deck = {
    id: newId("deck"),
    platform,
    deviceId,
    orientation: "portrait",
    styleId,
    screens: [],
  };
  deck.screens = seeds.length
    ? seeds.map((s, i) => starterScreen(deck, s, i))
    : [starterScreen(deck, { headline: "Your first headline", caption: "Say the benefit, not the feature." }, 0)];
  return deck;
}

export function defaultDeckConfig(platform: PlatformId): { deviceId: string; styleId: string } {
  switch (platform) {
    case "ios":
      return { deviceId: "iphone-69", styleId: "midnight-glow" };
    case "mac":
      return { deviceId: "mac-1610", styleId: "slate-glass" };
    case "android":
      return { deviceId: "android-phone", styleId: "mint-fresh" };
  }
}
