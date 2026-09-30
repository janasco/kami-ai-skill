import type { Deck, Orientation, PlatformId } from "./types";

// Sizes mirror references/store-specs.md — update both together.

export interface FrameSpec {
  kind: "phone" | "tablet" | "watch" | "tv" | "mac" | "carplay" | "none";
  cornerRadius: number; // outer, at canvas scale
  bezel: number; // frame border thickness (0 = full-bleed screen)
  notch?: "dynamic-island" | "punch-hole" | "mac-notch" | "none";
}

export interface DeviceSpec {
  id: string;
  platform: PlatformId;
  label: string;
  /** export resolution(s); first entry is the default orientation's size */
  exportSize: { portrait: { w: number; h: number }; landscape?: { w: number; h: number } };
  frame: FrameSpec;
  /** hint for source capture size in the UI */
  captureHint?: string;
}

export const DEVICES: DeviceSpec[] = [
  {
    id: "iphone-69",
    platform: "ios",
    label: "iPhone 6.9\u2033",
    exportSize: { portrait: { w: 1320, h: 2868 }, landscape: { w: 2868, h: 1320 } },
    frame: { kind: "phone", cornerRadius: 128, bezel: 20, notch: "dynamic-island" },
    captureHint: "Capture at 1320\u00D72868 (6.9\u2033 sim) or 1170\u00D72532 (6.1\u2033).",
  },
  {
    id: "ipad-13",
    platform: "ios",
    label: "iPad 13\u2033",
    exportSize: { portrait: { w: 2064, h: 2752 }, landscape: { w: 2752, h: 2064 } },
    frame: { kind: "tablet", cornerRadius: 56, bezel: 32, notch: "none" },
    captureHint: "Capture at 2064\u00D72752 (13\u2033 iPad sim).",
  },
  {
    id: "watch",
    platform: "ios",
    label: "Apple Watch",
    exportSize: { portrait: { w: 416, h: 496 } },
    frame: { kind: "watch", cornerRadius: 96, bezel: 10, notch: "none" },
    captureHint: "Capture 416\u00D7496 (S10) or 396\u00D7484 (S9); keep consistent across locales.",
  },
  {
    id: "apple-tv",
    platform: "ios",
    label: "Apple TV",
    exportSize: { portrait: { w: 3840, h: 2160 }, landscape: { w: 3840, h: 2160 } },
    frame: { kind: "tv", cornerRadius: 24, bezel: 0, notch: "none" },
    captureHint: "Capture at 3840\u00D72160 from the Apple TV 4K simulator.",
  },
  {
    id: "carplay",
    platform: "ios",
    label: "CarPlay",
    exportSize: { portrait: { w: 712, h: 1920 }, landscape: { w: 1920, h: 712 } },
    frame: { kind: "carplay", cornerRadius: 40, bezel: 0, notch: "none" },
    captureHint: "CarPlay section in App Store Connect: 1920\u00D7712 landscape or 712\u00D71920 portrait.",
  },
  {
    id: "mac-1610",
    platform: "mac",
    label: "Mac 16:10",
    exportSize: { portrait: { w: 1600, h: 1000 }, landscape: { w: 2560, h: 1600 } },
    frame: { kind: "mac", cornerRadius: 28, bezel: 24, notch: "mac-notch" },
    captureHint: "Any 16:10 capture (1280\u00D7800 up to 2880\u00D71800); export is 2560\u00D71600.",
  },
  {
    id: "android-phone",
    platform: "android",
    label: "Android phone",
    exportSize: { portrait: { w: 1080, h: 1920 }, landscape: { w: 1920, h: 1080 } },
    frame: { kind: "phone", cornerRadius: 76, bezel: 14, notch: "punch-hole" },
    captureHint: "Capture at 1080\u00D71920 or higher (9:16).",
  },
  {
    id: "android-tablet",
    platform: "android",
    label: "Android tablet",
    exportSize: { portrait: { w: 1600, h: 2560 }, landscape: { w: 2560, h: 1600 } },
    frame: { kind: "tablet", cornerRadius: 48, bezel: 26, notch: "none" },
    captureHint: "16:9/9:16 capture, 1080\u20137680 px per side.",
  },
  {
    id: "feature-graphic",
    platform: "android",
    label: "Play feature graphic",
    exportSize: { portrait: { w: 1024, h: 500 } },
    frame: { kind: "none", cornerRadius: 0, bezel: 0, notch: "none" },
    captureHint: "Exactly 1024\u00D7500, no alpha. Keep the focal point centered \u2014 edges get cut off.",
  },
  {
    id: "wear",
    platform: "android",
    label: "Wear OS",
    exportSize: { portrait: { w: 512, h: 512 } },
    frame: { kind: "none", cornerRadius: 0, bezel: 0, notch: "none" },
    captureHint: "1:1, \u2265384\u00D7384, app UI only \u2014 no frames, no backgrounds, no transparency.",
  },
];

export function getDevice(id: string): DeviceSpec {
  const d = DEVICES.find((d) => d.id === id);
  if (!d) throw new Error(`Unknown device: ${id}`);
  return d;
}

export function devicesForPlatform(platform: PlatformId): DeviceSpec[] {
  return DEVICES.filter((d) => d.platform === platform);
}

/** Canvas size for a deck at its orientation. */
export function canvasSize(deviceId: string, orientation: Orientation) {
  const d = getDevice(deviceId);
  if (orientation === "landscape" && d.exportSize.landscape) return d.exportSize.landscape;
  return d.exportSize.portrait;
}

export function devicesWithLandscape(deviceId: string): boolean {
  return Boolean(getDevice(deviceId).exportSize.landscape);
}

export function deckLabel(deviceId: string, orientation: Orientation): string {
  const d = getDevice(deviceId);
  return orientation === "landscape" ? `${d.label} (landscape)` : d.label;
}
