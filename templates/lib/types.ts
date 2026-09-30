// Project schema — everything persisted in app-store-screenshots.json.
// If you change this schema, add a migration in lib/migrations.ts.

export type PlatformId = "ios" | "mac" | "android";
export type Orientation = "portrait" | "landscape";
export type EditorMode = "connected" | "isolated";

/** All geometry is in canvas pixels (the deck's export resolution).
 *  Element x/y are STRIP coordinates: x spans the whole screen strip
 *  (screenIndex * canvasWidth + localX), so elements can cross screen
 *  boundaries in connected mode. */
export interface ScreenElement {
  id: string;
  kind: "device" | "text" | "shape" | "image";
  /** text kind: kicker | headline | subhead | caption | badge | sticker */
  role?: "kicker" | "headline" | "subhead" | "caption" | "badge" | "sticker";
  x: number;
  y: number;
  w?: number; // shapes/images; text auto-sizes from style
  h?: number;
  rotation?: number; // degrees, clockwise
  opacity?: number; // 0..1
  z: number;

  // device
  deviceId?: string; // defaults to deck device
  screenshotId?: string; // UploadedAsset id
  screenScale?: number; // zoom of capture inside frame (1 = cover fit)
  screenOffsetX?: number; // pan inside frame, normalized -1..1
  screenOffsetY?: number;

  // text
  text?: string; // fallback locale
  locales?: Record<string, string>; // per-locale overrides
  fontSize?: number; // overrides theme ramp
  weight?: number;
  align?: "left" | "center" | "right";
  color?: string; // overrides theme
  maxLines?: number;

  // shape / motif
  shape?: "rect" | "ellipse" | "ring" | "blob";
  fill?: string;
  radius?: number;
  motif?: string; // named theme motif the renderer switches on
}

export interface Screen {
  id: string;
  headline?: string; // convenience mirror of the headline element
  caption?: string;
  elements: ScreenElement[];
  notes?: string;
}

export interface Deck {
  id: string;
  platform: PlatformId;
  deviceId: string;
  orientation: Orientation;
  styleId: string; // theme preset id from lib/themes.ts
  screens: Screen[];
}

export interface UploadedAsset {
  id: string; // short content hash
  file: string; // "public/screenshots/uploaded/<hash>.<ext>"
  width: number;
  height: number;
  addedAt: string; // ISO
  label?: string;
}

export interface ProjectState {
  schemaVersion: number; // lib/migrations.ts
  revision: number; // bumped on every successful save
  updatedAt: string;
  appName: string;
  fallbackLocale: string;
  locales: string[]; // export set
  defaultStyleId: string;
  mode: EditorMode;
  decks: Deck[];
  assets: UploadedAsset[];
}

/** Body sent to POST /api/project */
export interface SavePayload {
  state: ProjectState;
  /** the revision the client last saw; save is rejected if disk is newer */
  clientRevision: number;
}
