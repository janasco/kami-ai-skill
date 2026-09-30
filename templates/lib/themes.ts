// 18 named styles — code mirror of references/styles.md. Update both together.

export interface ThemeGradientStop {
  color: string;
  at: number; // 0..1
}

export interface Theme {
  id: string;
  name: string;
  bg: { type: "solid" | "linear" | "radial"; from?: string; to?: string; stops?: ThemeGradientStop[]; angle?: number };
  text: string;
  accent: string;
  kickerColor: string;
  dark: boolean;
  motif: "glow" | "sun" | "divider" | "grain" | "dots" | "blobs" | "waves" | "grid" | "underline" | "neon" | "panels" | "halftone" | "arches" | "mist" | "editorial" | "glass" | "aurora" | "brutal";
}

export const THEMES: Theme[] = [
  { id: "midnight-glow", name: "Midnight Glow", bg: { type: "radial", from: "#1B1F3B", to: "#0B0D1A" }, text: "#F4F6FF", accent: "#6C7BFF", kickerColor: "#8B98FF", dark: true, motif: "glow" },
  { id: "sunset-pop", name: "Sunset Pop", bg: { type: "linear", from: "#FF9A62", to: "#E5484D", angle: 180 }, text: "#FFF7F0", accent: "#FFD166", kickerColor: "#FFE3B3", dark: true, motif: "sun" },
  { id: "clean-white", name: "Clean White", bg: { type: "solid", from: "#FFFFFF" }, text: "#111418", accent: "#0A84FF", kickerColor: "#0A84FF", dark: false, motif: "divider" },
  { id: "paper-minimal", name: "Paper Minimal", bg: { type: "solid", from: "#F7F5F0" }, text: "#1C1B18", accent: "#B4540A", kickerColor: "#B4540A", dark: false, motif: "grain" },
  { id: "mint-fresh", name: "Mint Fresh", bg: { type: "linear", from: "#DFF7EC", to: "#A8E6CF", angle: 160 }, text: "#0E2A20", accent: "#1DB954", kickerColor: "#1DB954", dark: false, motif: "dots" },
  { id: "candy-gradient", name: "Candy Gradient", bg: { type: "linear", from: "#FF8AE2", to: "#8B5CF6", angle: 135 }, text: "#FFFFFF", accent: "#FFD6F5", kickerColor: "#FFD6F5", dark: true, motif: "blobs" },
  { id: "ocean-deep", name: "Ocean Deep", bg: { type: "linear", from: "#0F3D6E", to: "#071B33", angle: 180 }, text: "#EAF4FF", accent: "#38BDF8", kickerColor: "#7DD3FC", dark: true, motif: "waves" },
  { id: "carbon-pro", name: "Carbon Pro", bg: { type: "solid", from: "#16181D" }, text: "#F2F4F8", accent: "#F5A623", kickerColor: "#F5A623", dark: true, motif: "grid" },
  { id: "notebook-grid", name: "Notebook Grid", bg: { type: "solid", from: "#FDFDFB" }, text: "#202226", accent: "#3B82F6", kickerColor: "#3B82F6", dark: false, motif: "underline" },
  { id: "neon-night", name: "Neon Night", bg: { type: "linear", from: "#121016", to: "#241B2F", angle: 180 }, text: "#F7EFFF", accent: "#C084FC", kickerColor: "#C084FC", dark: true, motif: "neon" },
  { id: "corporate-sky", name: "Corporate Sky", bg: { type: "linear", from: "#EFF6FF", to: "#DBEAFE", angle: 180 }, text: "#0F2745", accent: "#2563EB", kickerColor: "#2563EB", dark: false, motif: "panels" },
  { id: "citrus-zest", name: "Citrus Zest", bg: { type: "solid", from: "#FFF8E7" }, text: "#24310E", accent: "#84CC16", kickerColor: "#65A30D", dark: false, motif: "halftone" },
  { id: "terracotta-warm", name: "Terracotta Warm", bg: { type: "linear", from: "#F5E8DC", to: "#E7C6A9", angle: 165 }, text: "#3D2B1F", accent: "#C05621", kickerColor: "#C05621", dark: false, motif: "arches" },
  { id: "forest-calm", name: "Forest Calm", bg: { type: "linear", from: "#12271B", to: "#1D3B2A", angle: 180 }, text: "#EDF7F0", accent: "#4ADE80", kickerColor: "#4ADE80", dark: true, motif: "mist" },
  { id: "rose-editorial", name: "Rose Editorial", bg: { type: "solid", from: "#FBEFF2" }, text: "#3A1220", accent: "#D6336C", kickerColor: "#D6336C", dark: false, motif: "editorial" },
  { id: "slate-glass", name: "Slate Glass", bg: { type: "linear", from: "#20242C", to: "#2C313B", angle: 180 }, text: "#F1F5F9", accent: "#7DD3FC", kickerColor: "#7DD3FC", dark: true, motif: "glass" },
  { id: "aurora-pop", name: "Aurora Pop", bg: { type: "linear", from: "#7F5CFF", to: "#34D399", angle: 120 }, text: "#FFFFFF", accent: "#A7F3D0", kickerColor: "#A7F3D0", dark: true, motif: "aurora" },
  { id: "mono-brutal", name: "Mono Brutal", bg: { type: "solid", from: "#F2F2F0" }, text: "#000000", accent: "#FF4D00", kickerColor: "#FF4D00", dark: false, motif: "brutal" },
  // premium set — multi-stop gradients and fresh palettes
  { id: "lavender-dream", name: "Lavender Dream", bg: { type: "linear", angle: 160, stops: [{ color: "#C7B9FF", at: 0 }, { color: "#9F8FFF", at: 0.55 }, { color: "#6C4DF0", at: 1 }] }, text: "#FFFFFF", accent: "#FFD6FF", kickerColor: "#EDE7FF", dark: true, motif: "blobs" },
  { id: "peachy-cream", name: "Peachy Cream", bg: { type: "linear", angle: 170, stops: [{ color: "#FFF3E4", at: 0 }, { color: "#FFD9BE", at: 0.55 }, { color: "#FFB088", at: 1 }] }, text: "#4A2415", accent: "#FF6B35", kickerColor: "#E85D2A", dark: false, motif: "sun" },
  { id: "electric-lime", name: "Electric Lime", bg: { type: "solid", from: "#D8F34E" }, text: "#101400", accent: "#101400", kickerColor: "#3A4A00", dark: false, motif: "halftone" },
  { id: "deep-plum", name: "Deep Plum", bg: { type: "linear", angle: 180, stops: [{ color: "#2A0E3F", at: 0 }, { color: "#150722", at: 1 }] }, text: "#F5EBFF", accent: "#C77DFF", kickerColor: "#D8B4FE", dark: true, motif: "neon" },
  { id: "steel-mono", name: "Steel Mono", bg: { type: "linear", angle: 180, stops: [{ color: "#23272E", at: 0 }, { color: "#11141A", at: 1 }] }, text: "#E8EAEE", accent: "#9BA6B5", kickerColor: "#B7C0CC", dark: true, motif: "grid" },
  { id: "sunset-fade", name: "Sunset Fade", bg: { type: "linear", angle: 155, stops: [{ color: "#2D1B69", at: 0 }, { color: "#C33D94", at: 0.6 }, { color: "#FF8A5C", at: 1 }] }, text: "#FFF7F0", accent: "#FFD166", kickerColor: "#FFE3B3", dark: true, motif: "aurora" },
  { id: "arctic-mint", name: "Arctic Mint", bg: { type: "linear", angle: 175, stops: [{ color: "#EAF9F6", at: 0 }, { color: "#CFF2EA", at: 1 }] }, text: "#0B3B32", accent: "#0FA981", kickerColor: "#0C8A6A", dark: false, motif: "dots" },
  { id: "charcoal-copper", name: "Charcoal Copper", bg: { type: "solid", from: "#191714" }, text: "#F2EDE6", accent: "#D98E4A", kickerColor: "#E8B07E", dark: true, motif: "arches" },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Type ramp at 1320px canvas width; scale by canvasWidth/1320 elsewhere. */
export const TYPE_RAMP = {
  kicker: { size: 34, weight: 600, tracking: "0.14em", case: "uppercase" },
  headline: { size: 96, weight: 800, tracking: "-0.02em", case: "none" },
  subhead: { size: 44, weight: 500, tracking: "-0.01em", case: "none" },
  caption: { size: 34, weight: 400, tracking: "0", case: "none" },
  badge: { size: 28, weight: 600, tracking: "0.06em", case: "uppercase" },
  sticker: { size: 200, weight: 400, tracking: "0", case: "none" },
} as const;

export type RampToken = keyof typeof TYPE_RAMP;

/** css background value for a theme */
export function themeBackground(t: Theme): string {
  if (t.bg.type === "solid") return t.bg.from ?? "#ffffff";
  if (t.bg.type === "radial") {
    return t.bg.stops && t.bg.stops.length > 1
      ? `radial-gradient(circle at 50% 30%, ${t.bg.stops.map((s) => `${s.color} ${Math.round(s.at * 100)}%`).join(", ")})`
      : `radial-gradient(circle at 50% 30%, ${t.bg.from}, ${t.bg.to})`;
  }
  const angle = t.bg.angle ?? 180;
  return t.bg.stops && t.bg.stops.length > 1
    ? `linear-gradient(${angle}deg, ${t.bg.stops.map((s) => `${s.color} ${Math.round(s.at * 100)}%`).join(", ")})`
    : `linear-gradient(${angle}deg, ${t.bg.from}, ${t.bg.to})`;
}

/** 64px at 1320 width, scaled */
export function safeMargin(canvasWidth: number): number {
  return Math.round((64 * canvasWidth) / 1320);
}
