// Curated emoji sticker sets for the left-rail Stickers panel.
// Tap any emoji to drop it onto the current screen as a draggable sticker.

export interface StickerSet {
  id: string;
  label: string;
  items: string[];
}

export const STICKER_SETS: StickerSet[] = [
  {
    id: "reactions",
    label: "Reactions",
    items: ["😀", "😍", "🥳", "😎", "🤩", "😂", "🤔", "🤯", "🙌", "👏", "🔥", "💥", "✨", "💪", "🫶", "👀"],
  },
  {
    id: "objects",
    label: "Objects",
    items: ["📱", "💻", "⌚️", "🎧", "📸", "🎮", "✉️", "📅", "📊", "💰", "🛒", "🎁", "🔑", "📌", "🔒", "⚡️"],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    items: ["🍜", "☕️", "🍕", "🏃", "🧘", "🌊", "🏔️", "✈️", "🗺️", "🌴", "🌙", "☀️", "🌧️", "🌸", "🍀", "🎨"],
  },
  {
    id: "badges",
    label: "Badges",
    items: ["⭐️", "❤️", "🏆", "🥇", "🎯", "✅", "❌", "❗️", "❓", "💯", "🔔", "💬", "🚀", "🛡️", "👑", "💎"],
  },
  {
    id: "arrows",
    label: "Pointers",
    items: ["➡️", "⬅️", "⬆️", "⬇️", "🔄", "↔️", "↕️", "👆", "👇", "👉", "◄", "►", "▲", "▼", "◆", "●"],
  },
];

export const QUICK_SHAPES: { label: string; shape: "rect" | "ellipse" | "ring" }[] = [
  { label: "Circle", shape: "ellipse" },
  { label: "Ring", shape: "ring" },
  { label: "Card", shape: "rect" },
];

/** Emoji are drawn as text glyphs; a sticker's box is square around its size. */
export const STICKER_DEFAULT_SIZE = 200;
