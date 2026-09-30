// 52 complete canvas templates: every template is a full deck of 5–9 screens
// (5, 6, 7, 8, or 9 depending on the story), sequenced across layout
// archetypes with emoji accents. Copy is store-compliant (no CTAs, no
// rank/price claims). Geometry is generated per deck from devices + themes.

import { canvasSize, getDevice } from "./devices";
import { getTheme, safeMargin, TYPE_RAMP } from "./themes";
import { newId } from "./factory";
import type { Deck, Orientation, PlatformId, Screen, ScreenElement } from "./types";

export type LayoutKind =
  | "hero"
  | "split-left"
  | "split-right"
  | "bleed"
  | "duo"
  | "stat"
  | "angled"
  | "bottom-peek"
  | "band"
  | "half-off"
  | "big-type"
  | "stickered";

export interface TemplateSeed {
  layout: LayoutKind;
  kicker?: string;
  headline: string;
  caption: string;
  stat?: string;
  emojis?: string[];
}

export interface DeckTemplate {
  id: string;
  name: string;
  vibe: string;
  platform: PlatformId;
  deviceId: string;
  styleId: string;
  orientation?: Orientation;
  seeds: TemplateSeed[];
}

const DEFAULT_EMOJIS = ["🔥", "⚡️", "💥"];

// ---------- geometry helpers ----------

function textEl(
  role: keyof typeof TYPE_RAMP,
  text: string,
  lx: number,
  ly: number,
  cw: number,
  opts: { align?: ScreenElement["align"]; w?: number; color?: string; maxLines?: number } = {},
): ScreenElement {
  return {
    id: newId(role),
    kind: "text",
    role,
    x: lx,
    y: ly,
    z: 1,
    text,
    align: opts.align ?? "center",
    color: opts.color ?? "#inherit",
    maxLines: opts.maxLines,
    fontSize: Math.round((TYPE_RAMP[role].size * cw) / 1320),
    ...(opts.w !== undefined ? { w: opts.w } : {}),
  };
}

function deviceEl(lx: number, ly: number, fw: number, fh: number, z: number): ScreenElement {
  return { id: newId("device"), kind: "device", x: lx, y: ly, w: fw, h: fh, z };
}

function shapeEl(
  shape: NonNullable<ScreenElement["shape"]>,
  lx: number,
  ly: number,
  w: number,
  h: number,
  fill: string,
  opacity: number,
  z: number,
): ScreenElement {
  return { id: newId("shape"), kind: "shape", shape, x: lx, y: ly, w, h, fill, opacity, z };
}

const PHONE_ASPECT = 2.05;

function phoneBox(cw: number, ch: number, widthFrac: number, maxHFrac: number): { fw: number; fh: number } {
  let fw = Math.round(cw * widthFrac);
  let fh = Math.round(fw * PHONE_ASPECT);
  const maxH = Math.round(ch * maxHFrac);
  if (fh > maxH) {
    fh = maxH;
    fw = Math.round(maxH / PHONE_ASPECT);
  }
  return { fw, fh };
}

function buildScreen(
  seed: TemplateSeed,
  deck: { deviceId: string; styleId: string; orientation: Orientation },
  screenIndex: number,
): Screen {
  const { w: cw, h: ch } = canvasSize(deck.deviceId, deck.orientation);
  const margin = safeMargin(cw);
  const off = screenIndex * cw;
  const theme = getTheme(deck.styleId);
  const A = theme.accent;
  const els: ScreenElement[] = [];
  const frameless = getDevice(deck.deviceId).frame.kind === "none";

  const add = (el: ScreenElement) => els.push(el);
  const H = seed.headline;
  const C = seed.caption;

  if (frameless) {
    add(textEl("headline", H, margin + off, Math.round(ch * 0.12), cw));
    add(textEl("caption", C, margin + off, Math.round(ch * 0.5), cw));
    add(deviceEl(off + margin, Math.round(ch * 0.62), cw - margin * 2, Math.round(ch * 0.26), 2));
  } else
    switch (seed.layout) {
      case "hero": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.05), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.13), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.58, 0.68);
        add(shapeEl("ring", off + cw * 0.72, Math.round(ch * 0.2), Math.round(cw * 0.3), Math.round(cw * 0.3), A, 0.25, 0));
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.22), fw, fh, 2));
        break;
      }
      case "split-left": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.07), cw, { align: "left", w: Math.round(cw * 0.42) }));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.2), cw, { align: "left", w: Math.round(cw * 0.4) }));
        const { fw, fh } = phoneBox(cw, ch, 0.46, 0.7);
        add(deviceEl(off + cw * 0.5, Math.round(ch * 0.16), fw, fh, 2));
        add(shapeEl("ellipse", off + cw * 0.4, Math.round(ch * 0.55), Math.round(cw * 0.45), Math.round(cw * 0.45), A, 0.18, 0));
        break;
      }
      case "split-right": {
        add(textEl("headline", H, margin + off + Math.round(cw * 0.52), Math.round(ch * 0.07), cw, { align: "left", w: Math.round(cw * 0.42) }));
        add(textEl("caption", C, margin + off + Math.round(cw * 0.52), Math.round(ch * 0.2), cw, { align: "left", w: Math.round(cw * 0.42) }));
        const { fw, fh } = phoneBox(cw, ch, 0.46, 0.7);
        add(deviceEl(off + cw * 0.06, Math.round(ch * 0.16), fw, fh, 2));
        add(shapeEl("ellipse", off - cw * 0.08, Math.round(ch * 0.5), Math.round(cw * 0.4), Math.round(cw * 0.4), A, 0.18, 0));
        break;
      }
      case "bleed": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.05), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.13), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.66, 0.72);
        add(deviceEl(off + cw - Math.round(fw * 0.68), Math.round(ch * 0.2), fw, fh, 2));
        break;
      }
      case "duo": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.04), cw));
        const one = phoneBox(cw, ch, 0.33, 0.5);
        const two = phoneBox(cw, ch, 0.33, 0.5);
        add(deviceEl(off + Math.round(cw * 0.07), Math.round(ch * 0.16), one.fw, one.fh, 2));
        add(deviceEl(off + Math.round(cw * 0.54), Math.round(ch * 0.24), two.fw, two.fh, 3));
        add(shapeEl("rect", off + Math.round(cw * 0.1), Math.round(ch * 0.78), Math.round(cw * 0.8), Math.round(cw * 0.02), A, 0.5, 1));
        break;
      }
      case "stat": {
        if (seed.kicker) add(textEl("kicker", seed.kicker, margin + off, Math.round(ch * 0.05), cw, { color: A }));
        add(textEl("headline", H, margin + off, Math.round(ch * 0.1), cw));
        const chipY = Math.round(ch * 0.24);
        add(shapeEl("rect", off + Math.round(cw * 0.08), chipY, Math.round(cw * 0.84), Math.round(cw * 0.14), A, 0.16, 1));
        add(textEl("subhead", seed.stat ?? "3 taps to done", off + Math.round(cw * 0.08), chipY + Math.round(cw * 0.035), cw, { color: A }));
        const { fw, fh } = phoneBox(cw, ch, 0.56, 0.56);
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.42), fw, fh, 2));
        break;
      }
      case "angled": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.06), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.14), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.5, 0.66);
        const dev = deviceEl(off + Math.round(cw * 0.28), Math.round(ch * 0.2), fw, fh, 2);
        dev.rotation = 6;
        add(dev);
        add(shapeEl("ellipse", off + Math.round(cw * 0.55), Math.round(ch * 0.6), Math.round(cw * 0.5), Math.round(cw * 0.5), A, 0.22, 0));
        break;
      }
      case "bottom-peek": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.05), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.12), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.6, 0.56);
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.4), fw, fh, 2));
        add(shapeEl("ellipse", off - Math.round(cw * 0.15), Math.round(ch * 0.88), Math.round(cw * 1.3), Math.round(cw * 0.3), A, 0.3, 0));
        break;
      }
      case "band": {
        add(shapeEl("rect", off, Math.round(ch * 0.18), cw, Math.round(cw * 0.9), A, 0.9, 0));
        add(textEl("headline", H, margin + off, Math.round(ch * 0.04), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.115), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.58, 0.62);
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.22), fw, fh, 2));
        break;
      }
      case "half-off": {
        add(textEl("kicker", seed.kicker ?? "FEATURED", margin + off, Math.round(ch * 0.05), cw, { color: A }));
        add(textEl("headline", H, margin + off, Math.round(ch * 0.09), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.17), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.64, 0.95);
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.62), fw, fh, 2));
        add(shapeEl("ellipse", off - Math.round(cw * 0.2), Math.round(ch * 0.75), Math.round(cw * 1.4), Math.round(cw * 0.5), A, 0.25, 0));
        break;
      }
      case "big-type": {
        const bigH = Math.round(((TYPE_RAMP.headline.size * cw) / 1320) * 1.8);
        const h1 = textEl("headline", H, margin + off, Math.round(ch * 0.1), cw, { maxLines: 4 });
        h1.fontSize = bigH;
        add(h1);
        add(textEl("caption", C, margin + off, Math.round(ch * 0.55), cw, { maxLines: 2 }));
        const { fw, fh } = phoneBox(cw, ch, 0.34, 0.3);
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.66), fw, fh, 2));
        break;
      }
      case "stickered": {
        add(textEl("headline", H, margin + off, Math.round(ch * 0.05), cw));
        add(textEl("caption", C, margin + off, Math.round(ch * 0.13), cw));
        const { fw, fh } = phoneBox(cw, ch, 0.56, 0.64);
        add(deviceEl(off + (cw - fw) / 2, Math.round(ch * 0.22), fw, fh, 2));
        const set = seed.emojis ?? DEFAULT_EMOJIS;
        const places: [number, number][] = [
          [0.12, 0.2],
          [0.82, 0.16],
          [0.86, 0.55],
        ];
        places.forEach(([fx, fy], i) => {
          const st = textEl("sticker", set[i % set.length], off + Math.round(cw * fx), Math.round(ch * fy), cw);
          st.fontSize = Math.round(cw * (i === 1 ? 0.09 : 0.07));
          st.z = 3;
          add(st);
        });
        break;
      }
    }

  return { id: newId("screen"), headline: H, caption: C, elements: els };
}

export function instantiateTemplate(t: DeckTemplate): Deck {
  const deck: Deck = {
    id: newId("deck"),
    platform: t.platform,
    deviceId: t.deviceId,
    orientation: t.orientation ?? "portrait",
    styleId: t.styleId,
    screens: [],
  };
  deck.screens = t.seeds.map((seed, i) => buildScreen(seed, deck, i));
  return deck;
}

// ---------- the 52 complete-canvas templates ----------

export const TEMPLATES: DeckTemplate[] = [
  // ================= expanded originals (now full canvas decks) =================
  {
    id: "midnight-launch", name: "Midnight Launch", vibe: "Seven-screen dark product story",
    platform: "ios", deviceId: "iphone-69", styleId: "midnight-glow",
    seeds: [
      { layout: "hero", headline: "Your day, planned before coffee.", caption: "Schedules that build themselves." },
      { layout: "big-type", headline: "Stop juggling four apps.", caption: "One timeline holds it all." },
      { layout: "split-left", headline: "One timeline for everything.", caption: "Work, life, and the gap between." },
      { layout: "stat", kicker: "FAST", headline: "Reschedule in one drag.", caption: "Plans that move when you do.", stat: "2 seconds per change" },
      { layout: "stickered", headline: "Focus mode that actually focuses.", caption: "Silences everything but the task.", emojis: ["🎯", "⚡️", "🧘"] },
      { layout: "duo", headline: "Today and tomorrow, side by side.", caption: "See the week without scrolling." },
      { layout: "half-off", kicker: "TONIGHT", headline: "Ready by tonight.", caption: "Import your calendar and go." },
    ],
  },
  {
    id: "sunset-social", name: "Sunset Social", vibe: "Eight-screen warm community story",
    platform: "ios", deviceId: "iphone-69", styleId: "sunset-pop",
    seeds: [
      { layout: "hero", headline: "Where your people already are.", caption: "Communities for every interest." },
      { layout: "big-type", headline: "Feels like the group chat.", caption: "But for everything you love." },
      { layout: "bleed", headline: "Scroll less, talk more.", caption: "Threads that stay on topic." },
      { layout: "split-right", headline: "Share the moment, not the link.", caption: "Photos post straight to the thread." },
      { layout: "stat", kicker: "GLOBAL", headline: "Rooms in 40 languages.", caption: "Translate on by default.", stat: "40 languages live" },
      { layout: "stickered", headline: "Nights that end up legendary.", caption: "Voice rooms every evening.", emojis: ["🔥", "🎤", "🌙"] },
      { layout: "duo", headline: "Follows and friends, separated.", caption: "Keep each circle its own." },
      { layout: "bottom-peek", headline: "Join in two taps.", caption: "No profile homework required." },
    ],
  },
  {
    id: "clean-productivity", name: "Clean Productivity", vibe: "Six-screen minimal checklist flow",
    platform: "ios", deviceId: "iphone-69", styleId: "clean-white",
    seeds: [
      { layout: "hero", headline: "Tasks that file themselves.", caption: "Type it, forget it, find it later." },
      { layout: "split-left", headline: "Search that reads your mind.", caption: "Find any note by a fragment." },
      { layout: "duo", headline: "List view or board view.", caption: "Same work, your favorite shape." },
      { layout: "stat", kicker: "OFFLINE", headline: "Works on the subway.", caption: "Everything syncs when you're back.", stat: "100% offline-first" },
      { layout: "band", headline: "Weekly review, built in.", caption: "Fifteen minutes, next week planned." },
      { layout: "bottom-peek", headline: "Free for your first 99 tasks.", caption: "No account needed to start." },
    ],
  },
  {
    id: "mint-health", name: "Mint Health", vibe: "Six-screen fitness and habit deck",
    platform: "ios", deviceId: "iphone-69", styleId: "mint-fresh",
    seeds: [
      { layout: "hero", headline: "Small habits, visible streaks.", caption: "Three minutes a day is enough." },
      { layout: "stat", kicker: "STREAKS", headline: "Never break the chain.", caption: "Gentle reminders, real progress.", stat: "365-day history" },
      { layout: "split-left", headline: "Every workout, one log.", caption: "Strength, cardio, and walks." },
      { layout: "stickered", headline: "Rest days count too.", caption: "Recovery is part of the plan.", emojis: ["🌿", "😴", "💪"] },
      { layout: "duo", headline: "This month vs last month.", caption: "Progress you can actually see." },
      { layout: "bottom-peek", headline: "Start with one push-up.", caption: "The app scales the plan to you." },
    ],
  },
  {
    id: "candy-lifestyle", name: "Candy Lifestyle", vibe: "Seven-screen wardrobe and shopping deck",
    platform: "ios", deviceId: "iphone-69", styleId: "candy-gradient",
    seeds: [
      { layout: "hero", headline: "Your closet, finally organized.", caption: "Every piece, one swipe away." },
      { layout: "big-type", headline: "Nothing to wear? Not anymore.", caption: "Outfits from what you own." },
      { layout: "bleed", headline: "Outfits that plan themselves.", caption: "Weather-aware suggestions daily." },
      { layout: "split-right", headline: "Sell what you never wear.", caption: "List an item in 30 seconds." },
      { layout: "duo", headline: "Mix, match, and save the look.", caption: "Your wardrobe as a puzzle." },
      { layout: "stickered", headline: "Packed for the weekend.", caption: "Suitcase lists from the forecast.", emojis: ["🧳", "☀️", "👗"] },
      { layout: "bottom-peek", headline: "Trend reports every Friday.", caption: "Know what's coming before it lands." },
    ],
  },
  {
    id: "ocean-finance", name: "Ocean Finance", vibe: "Eight-screen banking and budget deck",
    platform: "ios", deviceId: "iphone-69", styleId: "ocean-deep",
    seeds: [
      { layout: "hero", headline: "Every account, one balance.", caption: "Banking, cards, and cash together." },
      { layout: "big-type", headline: "Know where it all goes.", caption: "Automatic categories from day one." },
      { layout: "split-left", headline: "Budgets that bend, not break.", caption: "Rollovers for real life." },
      { layout: "stat", kicker: "SECURE", headline: "Your keys never leave the device.", caption: "Biometric lock on everything.", stat: "Zero-knowledge sync" },
      { layout: "duo", headline: "Spending vs saving, clearly.", caption: "Charts without the jargon." },
      { layout: "band", headline: "Bills predicted before they land.", caption: "Twelve months of pattern learning." },
      { layout: "split-right", headline: "Goals with a finish line.", caption: "Vacation, deposit, or a buffer." },
      { layout: "bottom-peek", headline: "Set it up in one coffee.", caption: "Import from 12,000 banks." },
    ],
  },
  {
    id: "carbon-devtools", name: "Carbon DevTools", vibe: "Seven-screen developer tool deck",
    platform: "ios", deviceId: "iphone-69", styleId: "carbon-pro",
    seeds: [
      { layout: "hero", headline: "Ship from your phone.", caption: "Deploys, logs, and rollbacks on the go." },
      { layout: "split-left", headline: "Every build, one glance.", caption: "Status colors you can read outside." },
      { layout: "stat", kicker: "SPEED", headline: "Incident to rollback in seconds.", caption: "One tap reverts the last deploy.", stat: "9-second rollback" },
      { layout: "duo", headline: "Logs and traces, split view.", caption: "Debug without a laptop." },
      { layout: "big-type", headline: "On-call without the panic.", caption: "Alerts that explain themselves." },
      { layout: "stickered", headline: "Deploy on Friday. Bravely.", caption: "Automatic canaries watch it with you.", emojis: ["🚀", "🛡️", "☕️"] },
      { layout: "bottom-peek", headline: "Connects to your stack in minutes.", caption: "GitHub, Vercel, Cloudflare, and more." },
    ],
  },
  {
    id: "notebook-edu", name: "Notebook Study", vibe: "Six-screen study and notes deck",
    platform: "ios", deviceId: "iphone-69", styleId: "notebook-grid",
    seeds: [
      { layout: "hero", headline: "Notes that quiz you back.", caption: "Turn any page into flashcards." },
      { layout: "split-right", headline: "Handwriting, searchable.", caption: "Scribbles become text." },
      { layout: "stat", kicker: "EXAMS", headline: "Spaced repetition, automatic.", caption: "Reviews scheduled for you.", stat: "7 recall modes" },
      { layout: "duo", headline: "Lecture and summary, together.", caption: "Record while you write." },
      { layout: "band", headline: "Every class, one binder.", caption: "Tags, backlinks, and outlines." },
      { layout: "bottom-peek", headline: "One notebook, every class.", caption: "Import PDFs and slides." },
    ],
  },
  {
    id: "neon-gaming", name: "Neon Arcade", vibe: "Seven-screen high-contrast game deck",
    platform: "ios", deviceId: "iphone-69", styleId: "neon-night",
    seeds: [
      { layout: "hero", headline: "One-thumb play, endless depth.", caption: "Easy to start, hard to master." },
      { layout: "bleed", headline: "Bosses that learn your moves.", caption: "Every run changes the fight." },
      { layout: "stat", kicker: "SEASONS", headline: "New world every month.", caption: "Season passes carry your progress.", stat: "12 monthly worlds" },
      { layout: "stickered", headline: "Chase the leaderboard.", caption: "Weekly tournaments, real prizes.", emojis: ["🏆", "⚡️", "👾"] },
      { layout: "duo", headline: "Solo campaign or couch co-op.", caption: "Two players, one screen." },
      { layout: "big-type", headline: "No wifi. No problem.", caption: "The full game, offline." },
      { layout: "bottom-peek", headline: "No ads between runs.", caption: "Your streak is safe." },
    ],
  },
  {
    id: "corporate-biz", name: "Corporate Suite", vibe: "Six-screen B2B approval deck",
    platform: "ios", deviceId: "iphone-69", styleId: "corporate-sky",
    seeds: [
      { layout: "hero", headline: "Approvals in the elevator.", caption: "Sign off from anywhere." },
      { layout: "split-left", headline: "Every invoice, one inbox.", caption: "Vendors, POs, and receipts." },
      { layout: "stat", kicker: "COMPLIANCE", headline: "Audit trail by default.", caption: "Every action, timestamped.", stat: "SOC 2 ready" },
      { layout: "duo", headline: "Team spend at a glance.", caption: "Budgets per department." },
      { layout: "band", headline: "Reports that write themselves.", caption: "Month-end in an afternoon." },
      { layout: "bottom-peek", headline: "Live in one afternoon.", caption: "Imports from your ERP." },
    ],
  },
  {
    id: "citrus-food", name: "Citrus Kitchen", vibe: "Seven-screen recipe and meal-plan deck",
    platform: "ios", deviceId: "iphone-69", styleId: "citrus-zest",
    seeds: [
      { layout: "hero", headline: "Dinner from what you have.", caption: "Type three ingredients, get a meal." },
      { layout: "split-right", headline: "Shopping list, auto-sorted.", caption: "By aisle, not by recipe." },
      { layout: "stat", kicker: "COOKING", headline: "Step timers built in.", caption: "The app calls out when to stir.", stat: "Hands-free timers" },
      { layout: "stickered", headline: "Meal prep for the week.", caption: "One Sunday, five lunches.", emojis: ["🥗", "🍲", "📋"] },
      { layout: "duo", headline: "Weeknight or weekend.", caption: "Filter by time and effort." },
      { layout: "band", headline: "Family favorites, saved.", caption: "Ratings learn your table." },
      { layout: "bottom-peek", headline: "500 recipes, zero ads.", caption: "New menus every week." },
    ],
  },
  {
    id: "terracotta-travel", name: "Terracotta Travel", vibe: "Seven-screen trip planner deck",
    platform: "ios", deviceId: "iphone-69", styleId: "terracotta-warm",
    seeds: [
      { layout: "hero", headline: "The trip plans itself.", caption: "Flights, stays, and days in one map." },
      { layout: "bleed", headline: "Offline maps for the middle of nowhere.", caption: "Download once, wander freely." },
      { layout: "split-left", headline: "Every booking, one timeline.", caption: "Confirmations become itinerary items." },
      { layout: "stat", kicker: "BUDGET", headline: "Spend tracking per city.", caption: "Know what a day really costs.", stat: "Live currency rates" },
      { layout: "stickered", headline: "Hidden gems from locals.", caption: "Curated lists, not ads.", emojis: ["🗺️", "📸", "🍢"] },
      { layout: "duo", headline: "Before you go, while you're there.", caption: "Checklists for both." },
      { layout: "bottom-peek", headline: "Plan the next one on the way home.", caption: "Duplicate any trip as a template." },
    ],
  },
  {
    id: "forest-mind", name: "Forest Mind", vibe: "Six-screen meditation and sleep deck",
    platform: "ios", deviceId: "iphone-69", styleId: "forest-calm",
    seeds: [
      { layout: "hero", headline: "Five quiet minutes, anywhere.", caption: "Sessions that fit your day." },
      { layout: "stat", kicker: "SLEEP", headline: "Wind down on schedule.", caption: "Stories that fade as you drift.", stat: "180 sleep stories" },
      { layout: "split-right", headline: "Breathe with the circle.", caption: "Visual pacing, no counting." },
      { layout: "duo", headline: "Morning calm, evening calm.", caption: "Two routines, one app." },
      { layout: "band", headline: "Progress without pressure.", caption: "Minutes, not streaks to lose." },
      { layout: "bottom-peek", headline: "Start with a single breath.", caption: "Free starter course included." },
    ],
  },
  {
    id: "rose-media", name: "Rose Editorial", vibe: "Six-screen reading and media deck",
    platform: "ios", deviceId: "iphone-69", styleId: "rose-editorial",
    seeds: [
      { layout: "hero", headline: "Every story, beautifully set.", caption: "Typography that respects the writer." },
      { layout: "split-left", headline: "Read offline, everywhere.", caption: "Syncs your place across devices." },
      { layout: "stat", kicker: "LIBRARY", headline: "Highlights that write themselves.", caption: "Export notes to your notes app.", stat: "One-tap exports" },
      { layout: "duo", headline: "Morning brief, long read.", caption: "Two queues, zero clutter." },
      { layout: "big-type", headline: "The web, minus the noise.", caption: "Reader mode with taste." },
      { layout: "bottom-peek", headline: "Bring your own subscriptions.", caption: "Aggregates feeds you already pay for." },
    ],
  },
  {
    id: "glass-utility", name: "Glass Utilities", vibe: "Six-screen scanner tool deck",
    platform: "ios", deviceId: "iphone-69", styleId: "slate-glass",
    seeds: [
      { layout: "hero", headline: "The scanner in your pocket.", caption: "Documents, QR, and math from photos." },
      { layout: "split-right", headline: "Scan to clean PDF in a second.", caption: "Edges found automatically." },
      { layout: "stat", kicker: "ACCURACY", headline: "OCR in 30 languages.", caption: "Copy text straight off the page.", stat: "30 OCR languages" },
      { layout: "duo", headline: "Batch scan, one share.", caption: "Fifty pages, single PDF." },
      { layout: "band", headline: "Everything, encrypted at rest.", caption: "Face ID on the whole library." },
      { layout: "bottom-peek", headline: "Free tier covers a semester.", caption: "Unlimited scans, watermarked export." },
    ],
  },
  {
    id: "aurora-launch", name: "Aurora Debut", vibe: "Six-screen music app launch deck",
    platform: "android", deviceId: "android-phone", styleId: "aurora-pop",
    seeds: [
      { layout: "hero", headline: "Music that follows your mood.", caption: "Playlists generated by the hour." },
      { layout: "bleed", headline: "Your library travels with you.", caption: "Offline mode for the commute." },
      { layout: "stat", kicker: "DISCOVERY", headline: "New artists every Monday.", caption: "Fresh picks before the algorithm.", stat: "50 discoveries weekly" },
      { layout: "duo", headline: "Lyrics in time with the song.", caption: "Karaoke mode included." },
      { layout: "stickered", headline: "Made for the late shift.", caption: "Wind-down mixes at sunset.", emojis: ["🎧", "🌙", "✨"] },
      { layout: "bottom-peek", headline: "Import your playlists in a tap.", caption: "From every major service." },
    ],
  },
  {
    id: "mint-android-fit", name: "Mint Reps", vibe: "Six-screen Android strength deck",
    platform: "android", deviceId: "android-phone", styleId: "mint-fresh",
    seeds: [
      { layout: "hero", headline: "Strength plans that progress.", caption: "Weights adjust as you improve." },
      { layout: "split-left", headline: "Every rep counted.", caption: "Camera form-check included." },
      { layout: "stat", kicker: "PLANS", headline: "Programs by real coaches.", caption: "Beginner to competition prep.", stat: "40 coached plans" },
      { layout: "duo", headline: "Gym log and body metrics.", caption: "One profile, every gym." },
      { layout: "band", headline: "Plateaus, detected and broken.", caption: "Deload weeks, auto-scheduled." },
      { layout: "bottom-peek", headline: "Works with your watch.", caption: "Wear OS companion included." },
    ],
  },
  {
    id: "ocean-android-finance", name: "Ocean Ledger", vibe: "Six-screen freelancer money deck",
    platform: "android", deviceId: "android-phone", styleId: "ocean-deep",
    seeds: [
      { layout: "hero", headline: "Receipts sorted by themselves.", caption: "Snap, file, and forget." },
      { layout: "bleed", headline: "Tax season without the panic.", caption: "Category totals ready to export." },
      { layout: "split-right", headline: "Mileage tracked automatically.", caption: "Drives logged in the background." },
      { layout: "stat", kicker: "REPORTS", headline: "One-tap PDF for your accountant.", caption: "Monthly summaries, always ready.", stat: "Exports in one tap" },
      { layout: "duo", headline: "Personal and business, separate.", caption: "Swipes, not spreadsheets." },
      { layout: "bottom-peek", headline: "Free for one business.", caption: "Unlimited receipts included." },
    ],
  },
  {
    id: "brutal-indie", name: "Brutal Indie", vibe: "Five-screen loud indie maker deck",
    platform: "android", deviceId: "android-phone", styleId: "mono-brutal",
    seeds: [
      { layout: "big-type", headline: "BUILD IN PUBLIC.", caption: "Changelog posts from a commit." },
      { layout: "stat", kicker: "SHIPPING", headline: "Screenshots without a designer.", caption: "You're looking at one.", stat: "52 templates built in" },
      { layout: "duo", headline: "Roadmap and changelog, synced.", caption: "Voters see progress live." },
      { layout: "split-left", headline: "Feedback lands in your inbox.", caption: "Screenshots attached, sorted." },
      { layout: "bottom-peek", headline: "Ship your landing page tonight.", caption: "Free while in beta." },
    ],
  },
  {
    id: "mac-window", name: "Mac Workspace", vibe: "Five-screen 16:10 Mac utility deck",
    platform: "mac", deviceId: "mac-1610", styleId: "slate-glass", orientation: "landscape",
    seeds: [
      { layout: "hero", headline: "Every window, remembered.", caption: "Workspaces restore with one click." },
      { layout: "split-left", headline: "Snap zones that learn you.", caption: "Layouts adjust per app." },
      { layout: "stat", kicker: "FOCUS", headline: "One key silences the noise.", caption: "Distractions fade on command.", stat: "Single-keystroke focus" },
      { layout: "duo", headline: "Desktops for every hat.", caption: "Work, writing, and the weekend." },
      { layout: "bottom-peek", headline: "Try it with your current setup.", caption: "Free 14-day trial, no card." },
    ],
  },
  {
    id: "plum-ai-chat", name: "Plum Companion", vibe: "Seven-screen AI assistant deck",
    platform: "ios", deviceId: "iphone-69", styleId: "deep-plum",
    seeds: [
      { layout: "big-type", headline: "Ask anything. Get the useful part.", caption: "An assistant that skips the filler." },
      { layout: "hero", headline: "Remembers the whole thread.", caption: "Context that spans every chat." },
      { layout: "stat", kicker: "PRIVACY", headline: "Conversations stay on device.", caption: "Sync is end-to-end encrypted.", stat: "On-device history" },
      { layout: "stickered", headline: "Drafts, summaries, and code.", caption: "One assistant for the messy work.", emojis: ["✨", "⚡️", "💬"] },
      { layout: "split-left", headline: "Your documents, quoted.", caption: "Answers with sources you can tap." },
      { layout: "duo", headline: "Voice or text, your call.", caption: "Hands-free on the move." },
      { layout: "bottom-peek", headline: "Your first 100 chats are free.", caption: "No card, no trial clock." },
    ],
  },
  {
    id: "peach-habits", name: "Peach Habits", vibe: "Six-screen gentle routine deck",
    platform: "ios", deviceId: "iphone-69", styleId: "peachy-cream",
    seeds: [
      { layout: "half-off", kicker: "GENTLE", headline: "Routines without the guilt.", caption: "Miss a day? The plan adapts." },
      { layout: "stat", kicker: "FOCUS", headline: "One task at a time.", caption: "The rest waits its turn.", stat: "Single-task mode" },
      { layout: "split-left", headline: "Streaks that forgive.", caption: "Life happens; momentum stays." },
      { layout: "stickered", headline: "Tiny wins, celebrated.", caption: "Confetti is scientifically required.", emojis: ["🎉", "⭐️", "🫶"] },
      { layout: "duo", headline: "Morning and evening routines.", caption: "Bookends for the day." },
      { layout: "bottom-peek", headline: "Two minutes to set up.", caption: "Pick three habits to start." },
    ],
  },
  {
    id: "lime-tenk", name: "Lime 10K", vibe: "Seven-screen running plan deck",
    platform: "ios", deviceId: "iphone-69", styleId: "electric-lime",
    seeds: [
      { layout: "big-type", headline: "Couch to 10K in nine weeks.", caption: "A plan that runs beside you." },
      { layout: "stat", kicker: "PACE", headline: "Coaching in your ear.", caption: "Splits called out per kilometer.", stat: "Live audio splits" },
      { layout: "band", headline: "Every run, mapped.", caption: "Routes, effort, and weather." },
      { layout: "duo", headline: "Race day and training day.", caption: "Different plans, one app." },
      { layout: "split-right", headline: "Recovery days, respected.", caption: "The plan slows down for you." },
      { layout: "stickered", headline: "Badges for every milestone.", caption: "First 5K deserves a trophy.", emojis: ["🏅", "👟", "🎉"] },
      { layout: "bottom-peek", headline: "Lace up this evening.", caption: "First workout is a 20-minute walk-run." },
    ],
  },
  {
    id: "lavender-match", name: "Lavender Match", vibe: "Seven-screen dating deck",
    platform: "ios", deviceId: "iphone-69", styleId: "lavender-dream",
    seeds: [
      { layout: "hero", headline: "Prompts over pickup lines.", caption: "Conversation starters built in." },
      { layout: "stickered", headline: "Chemistry you can see.", caption: "Voice notes on every profile.", emojis: ["💜", "✨", "😍"] },
      { layout: "split-right", headline: "Video dates, zero pressure.", caption: "In-app calls with a timer." },
      { layout: "stat", kicker: "SAFETY", headline: "Every photo verified.", caption: "Catfishing ends at signup.", stat: "100% selfie-verified" },
      { layout: "duo", headline: "Dealbreakers, stated up front.", caption: "Filter what matters early." },
      { layout: "band", headline: "Dates, planned in-app.", caption: "Suggestions near you both." },
      { layout: "bottom-peek", headline: "One match a day, chosen well.", caption: "Quality over the infinite swipe." },
    ],
  },
  {
    id: "plum-stream", name: "Plum Screens", vibe: "Six-screen streaming catalog deck",
    platform: "ios", deviceId: "iphone-69", styleId: "deep-plum",
    seeds: [
      { layout: "band", headline: "Your queues, one library.", caption: "Every service, one watchlist." },
      { layout: "duo", headline: "Downloads before the flight.", caption: "Automatic, by schedule." },
      { layout: "big-type", headline: "Never spoil the plot again.", caption: "Spoiler-safe summaries." },
      { layout: "split-left", headline: "What to watch, decided.", caption: "Six picks, one tap each." },
      { layout: "half-off", kicker: "SHARING", headline: "Watch parties, synced.", caption: "Reactions stream live." },
      { layout: "bottom-peek", headline: "Track everything free.", caption: "Thirty services supported." },
    ],
  },
  {
    id: "arctic-still", name: "Arctic Still", vibe: "Six-screen quiet soundscape deck",
    platform: "ios", deviceId: "iphone-69", styleId: "arctic-mint",
    seeds: [
      { layout: "hero", headline: "Quiet, on demand.", caption: "Soundscapes for deep work and sleep." },
      { layout: "stat", kicker: "FOCUS", headline: "Drown the open office.", caption: "Adaptive mixes that never loop.", stat: "6-hour non-repeating mixes" },
      { layout: "split-left", headline: "Bedtime that sticks.", caption: "Smart alarms within a window." },
      { layout: "duo", headline: "Rain, fire, and a slow fan.", caption: "Mix and match the layers." },
      { layout: "band", headline: "Automation for every hour.", caption: "Loud mornings, quiet nights." },
      { layout: "bottom-peek", headline: "Ten free sessions, no account.", caption: "Download and go offline." },
    ],
  },
  {
    id: "fade-stage", name: "Fade Stage", vibe: "Six-screen events and tickets deck",
    platform: "ios", deviceId: "iphone-69", styleId: "sunset-fade",
    seeds: [
      { layout: "band", headline: "Every ticket, one wallet.", caption: "Transfers, entry, and set times." },
      { layout: "stickered", headline: "Never miss the opener.", caption: "Reminders from door to encore.", emojis: ["🎤", "⭐️", "🔥"] },
      { layout: "duo", headline: "Plan with the group.", caption: "Split costs, share seats." },
      { layout: "split-left", headline: "Set times, pushed live.", caption: "Stage changes find you first." },
      { layout: "stat", kicker: "MEMORY", headline: "The whole night, saved.", caption: "Photos and setlists archived.", stat: "Auto-setlist logging" },
      { layout: "bottom-peek", headline: "Scan in, phones down.", caption: "Offline tickets work at the gate." },
    ],
  },
  {
    id: "steel-scan", name: "Steel Scan", vibe: "Five-screen precision scanner deck",
    platform: "ios", deviceId: "iphone-69", styleId: "steel-mono",
    seeds: [
      { layout: "hero", headline: "Paper in, order out.", caption: "Scan, name, and file automatically." },
      { layout: "stat", kicker: "SPEED", headline: "A receipt in 1.2 seconds.", caption: "Auto-crop before you let go.", stat: "1.2s capture" },
      { layout: "split-right", headline: "Text comes with the page.", caption: "Searchable from day one." },
      { layout: "duo", headline: "Contracts and receipts, apart.", caption: "Smart folders by content." },
      { layout: "bottom-peek", headline: "Fifty scans free, monthly.", caption: "No watermark on export." },
    ],
  },
  {
    id: "copper-freelance", name: "Copper Invoice", vibe: "Six-screen freelancer business deck",
    platform: "ios", deviceId: "iphone-69", styleId: "charcoal-copper",
    seeds: [
      { layout: "split-left", headline: "Invoice from the job site.", caption: "Hours, expenses, and tax in one." },
      { layout: "stat", kicker: "GETTING PAID", headline: "Reminders that stay polite.", caption: "Nudges on autopilot.", stat: "Paid 9 days faster" },
      { layout: "duo", headline: "Quarterly taxes, pre-counted.", caption: "Set aside as you earn." },
      { layout: "half-off", kicker: "CLIENTS", headline: "Proposals they can sign.", caption: "Send, sign, and start." },
      { layout: "band", headline: "Time tracking that judges nothing.", caption: "Start and stop, that's it." },
      { layout: "bottom-peek", headline: "Your first three invoices free.", caption: "Unlimited clients on trial." },
    ],
  },
  {
    id: "mint-sip", name: "Mint Sip", vibe: "Five-screen hydration deck",
    platform: "android", deviceId: "android-phone", styleId: "arctic-mint",
    seeds: [
      { layout: "stickered", headline: "Your daily eight, made easy.", caption: "Nudges that match your routine.", emojis: ["💧", "🌿", "☀️"] },
      { layout: "stat", kicker: "STREAKS", headline: "Every glass counts.", caption: "Widgets for the home screen.", stat: "Home-screen widgets" },
      { layout: "hero", headline: "Coffee counts too.", caption: "Caffeine-aware hydration goals." },
      { layout: "duo", headline: "Today and this week.", caption: "Trends without the guilt." },
      { layout: "bottom-peek", headline: "Set your bottle size once.", caption: "Everything adapts from there." },
    ],
  },
  {
    id: "lime-lessons", name: "Lime Lessons", vibe: "Six-screen language learning deck",
    platform: "android", deviceId: "android-phone", styleId: "electric-lime",
    seeds: [
      { layout: "big-type", headline: "Five minutes a day. That's the app.", caption: "Micro-lessons that stack." },
      { layout: "duo", headline: "Speak from lesson one.", caption: "Speech scoring, kindly done." },
      { layout: "stat", kicker: "MEMORY", headline: "Reviews right before you forget.", caption: "Spacing tuned per word.", stat: "Adaptive review" },
      { layout: "stickered", headline: "Streaks worth protecting.", caption: "Freeze tokens for busy days.", emojis: ["🔥", "🧊", "📚"] },
      { layout: "split-right", headline: "Real conversations, rehearsed.", caption: "Dialogues for travel and work." },
      { layout: "bottom-peek", headline: "Thirty languages, one streak.", caption: "Switch without losing progress." },
    ],
  },
  {
    id: "steel-desk", name: "Steel Desk", vibe: "Five-screen pro Mac launcher deck",
    platform: "mac", deviceId: "mac-1610", styleId: "steel-mono", orientation: "landscape",
    seeds: [
      { layout: "hero", headline: "The menu bar, finally useful.", caption: "Every tool one keystroke away." },
      { layout: "split-left", headline: "Clipboard with a memory.", caption: "History, search, and pins." },
      { layout: "stat", kicker: "SPEED", headline: "Launch anything in 0.3s.", caption: "Indexed before you type.", stat: "0.3s to launch" },
      { layout: "duo", headline: "Files and actions, one bar.", caption: "Fewer windows, more work." },
      { layout: "bottom-peek", headline: "Free for two weeks.", caption: "Keeps your settings if you stay." },
    ],
  },
  // ================= 20 new complete-canvas templates =================
  {
    id: "noir-podcast", name: "Noir Podcast", vibe: "Eight-screen dark podcast player deck",
    platform: "ios", deviceId: "iphone-69", styleId: "deep-plum",
    seeds: [
      { layout: "hero", headline: "Every show, one queue.", caption: "Subscriptions without the sprawl." },
      { layout: "big-type", headline: "Skip the intro. Every time.", caption: "Chapter-aware playback." },
      { layout: "duo", headline: "Speed and silence, tuned.", caption: "Trim pauses automatically." },
      { layout: "split-right", headline: "Transcripts you can search.", caption: "Find that one sentence." },
      { layout: "stat", kicker: "OFFLINE", headline: "Download the whole back catalog.", caption: "Storage rules keep it tidy.", stat: "Auto-cleanup" },
      { layout: "stickered", headline: "Clips worth sharing.", caption: "Fifteen-second snippets, styled.", emojis: ["🎙️", "✂️", "📢"] },
      { layout: "band", headline: "Sleep timer that tapers.", caption: "Fades before it stops." },
      { layout: "bottom-peek", headline: "Import your feeds in a minute.", caption: "OPML supported." },
    ],
  },
  {
    id: "violet-journal", name: "Violet Journal", vibe: "Six-screen reflective journaling deck",
    platform: "ios", deviceId: "iphone-69", styleId: "lavender-dream",
    seeds: [
      { layout: "hero", headline: "A page a day, kept forever.", caption: "Prompts when the blank wins." },
      { layout: "split-left", headline: "Moods, tracked gently.", caption: "Patterns surface over months." },
      { layout: "stickered", headline: "Photos belong in the story.", caption: "Days become collages.", emojis: ["📸", "💜", "🌾"] },
      { layout: "stat", kicker: "PRIVACY", headline: "Locked with your face.", caption: "Export anytime, plain text.", stat: "On-device only" },
      { layout: "duo", headline: "This year vs last year.", caption: "On this day, resurfaced." },
      { layout: "bottom-peek", headline: "First entry in a minute.", caption: "No signup for the first week." },
    ],
  },
  {
    id: "teal-crypto", name: "Teal Vault", vibe: "Seven-screen portfolio tracking deck",
    platform: "android", deviceId: "android-phone", styleId: "ocean-deep",
    seeds: [
      { layout: "hero", headline: "Every wallet, one view.", caption: "Track without connecting keys." },
      { layout: "big-type", headline: "Your net worth, live.", caption: "Refreshed on every open." },
      { layout: "stat", kicker: "ALERTS", headline: "Moves that matter, pinged.", caption: "Thresholds you set.", stat: "Price + gas alerts" },
      { layout: "split-left", headline: "Taxes, pre-tallied.", caption: "Cost basis across wallets." },
      { layout: "duo", headline: "Coins and NFTs, together.", caption: "The whole portfolio, one screen." },
      { layout: "band", headline: "Watchlists without an account.", caption: "Anonymous by default." },
      { layout: "bottom-peek", headline: "Add a wallet in 20 seconds.", caption: "Public address is all we need." },
    ],
  },
  {
    id: "coral-steps", name: "Coral Steps", vibe: "Six-screen step-by-step cooking coach deck",
    platform: "android", deviceId: "android-phone", styleId: "peachy-cream",
    seeds: [
      { layout: "hero", headline: "Cook with the screen, not against it.", caption: "One step at a time, huge type." },
      { layout: "stat", kicker: "TIMERS", headline: "Timers start themselves.", caption: "Parsed right from the recipe.", stat: "Voice-controlled" },
      { layout: "split-right", headline: "Scale to your pan.", caption: "Servings recalculated live." },
      { layout: "stickered", headline: "Substitutions on the fly.", caption: "No buttermilk? Fine.", emojis: ["🥛", "🍋", "🧈"] },
      { layout: "duo", headline: "Hands busy? Talk to it.", caption: "Next step, out loud." },
      { layout: "bottom-peek", headline: "Cook tonight's dinner free.", caption: "Twelve recipes a month." },
    ],
  },
  {
    id: "indigo-lms", name: "Indigo Coursework", vibe: "Six-screen course platform deck",
    platform: "android", deviceId: "android-phone", styleId: "corporate-sky",
    seeds: [
      { layout: "hero", headline: "Courses that fit the commute.", caption: "Lessons in five-minute arcs." },
      { layout: "split-left", headline: "Notes tied to timestamps.", caption: "Tap a note, hear the moment." },
      { layout: "stat", kicker: "PROGRESS", headline: "Streaks per course.", caption: "Pick up exactly where you left off.", stat: "Resume anywhere" },
      { layout: "duo", headline: "Video or audio only.", caption: "Same lesson, either way." },
      { layout: "band", headline: "Certificates that count.", caption: "Verifiable and shareable." },
      { layout: "bottom-peek", headline: "One course free, forever.", caption: "Yours even if you leave." },
    ],
  },
  {
    id: "mono-todo", name: "Mono Focus", vibe: "Five-screen brutalist minimal todo deck",
    platform: "android", deviceId: "android-phone", styleId: "mono-brutal",
    seeds: [
      { layout: "big-type", headline: "THREE TASKS. NOT THIRTY.", caption: "A list that ends." },
      { layout: "hero", headline: "Pick three, done by dinner.", caption: "The rest can wait." },
      { layout: "stat", kicker: "TRUTH", headline: "Nothing hides in this app.", caption: "Overdue items stare at you.", stat: "No endless backlog" },
      { layout: "split-left", headline: "Type it, it's filed.", caption: "No projects, no tags." },
      { layout: "bottom-peek", headline: "Free. That's the model.", caption: "One tip jar, no lock-ins." },
    ],
  },
  {
    id: "rose-pet", name: "Rose Pet Care", vibe: "Six-screen pet health deck",
    platform: "ios", deviceId: "iphone-69", styleId: "rose-editorial",
    seeds: [
      { layout: "hero", headline: "Every vaccine, one timeline.", caption: "For every pet in the house." },
      { layout: "split-right", headline: "Weight, tracked in grams.", caption: "Trends the vet will love." },
      { layout: "stickered", headline: "Meds on schedule.", caption: "Reminders per pet, per dose.", emojis: ["💊", "🐾", "⏰"] },
      { layout: "duo", headline: "Two pets, no confusion.", caption: "Switch profiles with a tap." },
      { layout: "stat", kicker: "VET DAY", headline: "History in one export.", caption: "Hand the vet a PDF, not a memory.", stat: "One-tap vet report" },
      { layout: "bottom-peek", headline: "Add the whole zoo free.", caption: "Up to five pets." },
    ],
  },
  {
    id: "forest-hike", name: "Forest Trail", vibe: "Seven-screen hiking and outdoors deck",
    platform: "android", deviceId: "android-phone", styleId: "forest-calm",
    seeds: [
      { layout: "hero", headline: "Trails that match your legs.", caption: "Filter by effort, not just miles." },
      { layout: "bleed", headline: "Maps that work on the ridge.", caption: "Offline topography included." },
      { layout: "stat", kicker: "SAFETY", headline: "Check-in pings home.", caption: "If you stop, it notices.", stat: "Live location sharing" },
      { layout: "split-left", headline: "Elevation before you commit.", caption: "Profile every climb." },
      { layout: "stickered", headline: "Summits, collected.", caption: "Badges for peaks and parks.", emojis: ["🏔️", "🥾", "🌲"] },
      { layout: "duo", headline: "Recorded vs planned.", caption: "Compare the route you walked." },
      { layout: "bottom-peek", headline: "Works on day one, offline.", caption: "Download your region first." },
    ],
  },
  {
    id: "cyan-flight", name: "Cyan Flight", vibe: "Six-screen flight deals deck",
    platform: "android", deviceId: "android-phone", styleId: "ocean-deep",
    seeds: [
      { layout: "hero", headline: "Watch a route, not a date.", caption: "Prices land in your pocket." },
      { layout: "stat", kicker: "TIMING", headline: "Book when it dips.", caption: "History tells you when.", stat: "12-month price history" },
      { layout: "split-right", headline: "Nearby airports, compared.", caption: "A train might win." },
      { layout: "duo", headline: "Cash or miles, both priced.", caption: "The cheaper currency wins." },
      { layout: "band", headline: "Layovers you can live with.", caption: "Filter the red-eyes out." },
      { layout: "bottom-peek", headline: "Five routes free, forever.", caption: "Alerts until you fly." },
    ],
  },
  {
    id: "solar-home", name: "Solar Home", vibe: "Five-screen home energy deck",
    platform: "android", deviceId: "android-phone", styleId: "charcoal-copper",
    seeds: [
      { layout: "hero", headline: "Your roof, quantified.", caption: "Production, usage, and export." },
      { layout: "stat", kicker: "TODAY", headline: "Sun up, meter spinning back.", caption: "Live numbers, no refresh.", stat: "Real-time watts" },
      { layout: "split-left", headline: "Batteries, choreographed.", caption: "Charge cheap, burn dear." },
      { layout: "duo", headline: "This month vs last September.", caption: "Seasons, explained." },
      { layout: "bottom-peek", headline: "Works with your inverter.", caption: "Forty brands supported." },
    ],
  },
  {
    id: "blush-vows", name: "Blush Vows", vibe: "Six-screen wedding planner deck",
    platform: "ios", deviceId: "iphone-69", styleId: "rose-editorial",
    seeds: [
      { layout: "hero", headline: "Fourteen months, one plan.", caption: "Countdown with checkpoints." },
      { layout: "split-left", headline: "Every vendor, one thread.", caption: "Quotes, contracts, and balances." },
      { layout: "stickered", headline: "Seating chart, solved.", caption: "Drag until everyone's happy.", emojis: ["💍", "🪑", "🥂"] },
      { layout: "stat", kicker: "BUDGET", headline: "Every deposit, accounted.", caption: "Paid and pending, always visible.", stat: "Balance tracking" },
      { layout: "duo", headline: "His list, her list, merged.", caption: "Shared checklists, synced." },
      { layout: "bottom-peek", headline: "Start with the checklist.", caption: "Fourteen months, pre-planned." },
    ],
  },
  {
    id: "neon-roguelite", name: "Neon Depths", vibe: "Eight-screen atmospheric roguelite deck",
    platform: "android", deviceId: "android-phone", styleId: "neon-night",
    seeds: [
      { layout: "big-type", headline: "Descend. Die. Descend better.", caption: "The dark remembers your runs." },
      { layout: "hero", headline: "One more run.", caption: "Runs end in fifteen minutes." },
      { layout: "bleed", headline: "Builds that stack wild.", caption: "Two hundred relics to combine." },
      { layout: "stat", kicker: "FAIRNESS", headline: "Skill pays, luck assists.", caption: "Every death is readable.", stat: "Deterministic damage" },
      { layout: "duo", headline: "Daily seeds, global board.", caption: "Same dungeon, everyone." },
      { layout: "stickered", headline: "Chaos is a loadout.", caption: "Curse yourself for glory.", emojis: ["☠️", "🎲", "⚡️"] },
      { layout: "band", headline: "Sound built for headphones.", caption: "Binaural horror, mixed right." },
      { layout: "bottom-peek", headline: "Buy it once.", caption: "Every update included." },
    ],
  },
  {
    id: "plum-therapy", name: "Plum Therapy", vibe: "Six-screen mental health companion deck",
    platform: "ios", deviceId: "iphone-69", styleId: "deep-plum",
    seeds: [
      { layout: "hero", headline: "A therapist's toolkit, pocket-sized.", caption: "CBT exercises that take minutes." },
      { layout: "split-right", headline: "Thought records, guided.", caption: "Reframe with structure." },
      { layout: "stat", kicker: "CRISIS", headline: "Help, one tap away.", caption: "Local hotlines, always first.", stat: "One-tap hotline" },
      { layout: "duo", headline: "Mood and meds, logged.", caption: "Patterns your therapist can read." },
      { layout: "band", headline: "Between-session notes.", caption: "Bring the week, not the fog." },
      { layout: "bottom-peek", headline: "Free core, forever.", caption: "Export everything, always." },
    ],
  },
  {
    id: "steel-notes", name: "Steel Notes", vibe: "Seven-screen PKM notes deck",
    platform: "mac", deviceId: "mac-1610", styleId: "steel-mono", orientation: "landscape",
    seeds: [
      { layout: "hero", headline: "Notes that link themselves.", caption: "Type a bracket, find a friend." },
      { layout: "split-left", headline: "Search across everything.", caption: "PDFs, handwriting, and code blocks." },
      { layout: "stat", kicker: "SPEED", headline: "Open a note in 50ms.", caption: "Ten thousand notes, no lag.", stat: "50ms retrieval" },
      { layout: "duo", headline: "Daily note, backlinks pane.", caption: "The ritual that sticks." },
      { layout: "big-type", headline: "Plain text. Forever yours.", caption: "No lock-in, ever." },
      { layout: "band", headline: "Publish to the web.", caption: "One folder becomes a site." },
      { layout: "bottom-peek", headline: "Free for personal use.", caption: "Sync brings your own storage." },
    ],
  },
  {
    id: "fade-delivery", name: "Fade Courier", vibe: "Six-screen food delivery deck",
    platform: "android", deviceId: "android-phone", styleId: "sunset-fade",
    seeds: [
      { layout: "hero", headline: "Dinner, tracked to the door.", caption: "Live map, honest ETAs." },
      { layout: "duo", headline: "Group orders, one cart.", caption: "Everyone pays their own." },
      { layout: "stat", kicker: "FEES", headline: "One fee. Printed at the top.", caption: "No checkout surprises.", stat: "All-in pricing" },
      { layout: "stickered", headline: "Reorder Friday's win.", caption: "Past orders, one tap.", emojis: ["🍔", "🔥", "🛵"] },
      { layout: "split-left", headline: "Schedules for the week.", caption: "Sunday prep, auto-ordered." },
      { layout: "bottom-peek", headline: "First delivery is free.", caption: "Local restaurants, no middle markup." },
    ],
  },
  {
    id: "arctic-breath", name: "Arctic Breath", vibe: "Five-screen breathing exercise deck",
    platform: "ios", deviceId: "iphone-69", styleId: "arctic-mint",
    seeds: [
      { layout: "hero", headline: "Ninety seconds to reset.", caption: "Science-backed breathing patterns." },
      { layout: "stat", kicker: "PATTERNS", headline: "Box, 4-7-8, and coherence.", caption: "Guided by a circle, not a voice.", stat: "6 proven patterns" },
      { layout: "split-right", headline: "Haptics guide the count.", caption: "Eyes closed, still on pace." },
      { layout: "duo", headline: "Morning energy, evening calm.", caption: "Two presets, one button." },
      { layout: "bottom-peek", headline: "Free, no account.", caption: "A tool, not a subscription." },
    ],
  },
  {
    id: "lime-budget", name: "Lime Envelopes", vibe: "Six-screen envelope budgeting deck",
    platform: "android", deviceId: "android-phone", styleId: "electric-lime",
    seeds: [
      { layout: "big-type", headline: "Give every dollar a job.", caption: "Envelope budgeting, modernized." },
      { layout: "split-left", headline: "Overspent? Steal with intent.", caption: "Move money in two taps." },
      { layout: "stat", kicker: "GOALS", headline: "Sinking funds that fill.", caption: "Car repair fund, ready this time.", stat: "Auto-filled envelopes" },
      { layout: "duo", headline: "Monthly and irregular, apart.", caption: "Annual bills stop ambushing you." },
      { layout: "stickered", headline: "Payday routine, scripted.", caption: "Fill envelopes in ninety seconds.", emojis: ["💵", "✅", "📅"] },
      { layout: "bottom-peek", headline: "Free for 30 days.", caption: "Then less than a coffee." },
    ],
  },
  {
    id: "aurora-widgets", name: "Aurora Widgets", vibe: "Seven-screen home-screen customization deck",
    platform: "android", deviceId: "android-phone", styleId: "aurora-pop",
    seeds: [
      { layout: "hero", headline: "A home screen worth staring at.", caption: "Widgets that match your wallpaper." },
      { layout: "duo", headline: "Weather, calendar, battery.", caption: "Every size, every style." },
      { layout: "stickered", headline: "Themes that spread.", caption: "Icons, widgets, and clock, matched.", emojis: ["🎨", "🧩", "✨"] },
      { layout: "stat", kicker: "BATTERY", headline: "Pretty costs nothing.", caption: "Widgets sleep when you do.", stat: "1% daily impact" },
      { layout: "split-right", headline: "Lock screen counts too.", caption: "Progress rings and timers." },
      { layout: "band", headline: "Seasonal drops.", caption: "New packs every month." },
      { layout: "bottom-peek", headline: "Five widgets free.", caption: "Pro unlocks the archive." },
    ],
  },
  {
    id: "glass-vpn", name: "Glass Shield", vibe: "Six-screen privacy and VPN deck",
    platform: "ios", deviceId: "iphone-69", styleId: "slate-glass",
    seeds: [
      { layout: "hero", headline: "One switch, whole-device privacy.", caption: "WireGuard speed, no logs." },
      { layout: "stat", kicker: "SPEED", headline: "940 Mbps through the tunnel.", caption: "Faster than your raw line, sometimes.", stat: "940 Mbps tested" },
      { layout: "split-left", headline: "Per-app rules.", caption: "Bank raw, browse routed." },
      { layout: "duo", headline: "Home and away profiles.", caption: "Trusted networks, auto-switched." },
      { layout: "band", headline: "Trackers blocked upstream.", caption: "Pages load faster, ad-free." },
      { layout: "bottom-peek", headline: "Seven days free.", caption: "Five devices, one plan." },
    ],
  },
  {
    id: "plum-ebook", name: "Plum Library", vibe: "Eight-screen ebook reader deck",
    platform: "android", deviceId: "android-phone", styleId: "deep-plum",
    seeds: [
      { layout: "hero", headline: "Every format, one shelf.", caption: "EPUB, PDF, and comics." },
      { layout: "big-type", headline: "Reads like paper at night.", caption: "True-tone warmth on a schedule." },
      { layout: "split-left", headline: "Highlights that gather.", caption: "Exports to your notes app." },
      { layout: "stat", kicker: "STATS", headline: "Pages, not minutes.", caption: "Progress by chapter and book.", stat: "Reading pace per book" },
      { layout: "duo", headline: "Two books, parallel.", caption: "Fiction and textbook, both open." },
      { layout: "band", headline: "Dictionary built in.", caption: "Long-press any word, 40 languages." },
      { layout: "stickered", headline: "Streaks for pages, not doom.", caption: "A reading habit worth the badge.", emojis: ["📖", "🌙", "🏆"] },
      { layout: "bottom-peek", headline: "Sideload everything.", caption: "No store, no DRM drama." },
    ],
  },
];

// ---------- gallery thumbnails ----------

/**
 * Per-screen previews for the gallery filmstrip: renders the connected strip
 * once, then crops each screen into its own image so the gallery can show
 * them side by side with gaps.
 */
export async function renderTemplateScreens(t: DeckTemplate, outW = 150): Promise<string[]> {
  const { renderDeckStrip } = await import("@/components/CanvasRenderer");
  const deck = instantiateTemplate(t);
  const state = {
    schemaVersion: 2,
    revision: 0,
    updatedAt: new Date().toISOString(),
    appName: t.name,
    fallbackLocale: "en-US",
    locales: ["en-US"],
    defaultStyleId: t.styleId,
    mode: "connected" as const,
    decks: [deck],
    assets: [],
  };
  const strip = await renderDeckStrip(deck, state, "en-US");
  const { w: cw, h: ch } = canvasSize(deck.deviceId, deck.orientation);
  const scale = outW / cw;
  const outH = Math.round(ch * scale);
  const urls: string[] = [];
  for (let i = 0; i < deck.screens.length; i++) {
    const c = document.createElement("canvas");
    c.width = outW;
    c.height = outH;
    c.getContext("2d")?.drawImage(strip, i * cw, 0, cw, ch, 0, 0, outW, outH);
    urls.push(c.toDataURL("image/png"));
  }
  return urls;
}

/** Small preview of a template's first screens (seamless strip) for the gallery card. */
export async function renderTemplateThumb(t: DeckTemplate, width = 240): Promise<string> {
  const { renderDeckStrip } = await import("@/components/CanvasRenderer");
  const deck = instantiateTemplate(t);
  const state = {
    schemaVersion: 2,
    revision: 0,
    updatedAt: new Date().toISOString(),
    appName: t.name,
    fallbackLocale: "en-US",
    locales: ["en-US"],
    defaultStyleId: t.styleId,
    mode: "connected" as const,
    decks: [deck],
    assets: [],
  };
  const strip = await renderDeckStrip(deck, state, "en-US");
  const scale = width / strip.width;
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(strip.width * scale));
  out.height = Math.max(1, Math.round(strip.height * scale));
  out.getContext("2d")?.drawImage(strip, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}
