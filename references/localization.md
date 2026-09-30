# Localization & RTL

## Where copy lives

Every text element stores:

- `text` — fallback locale copy (also what the canvas shows for the fallback)
- `locales: { [localeCode]: string }` — per-locale overrides

Resolution order (lib/locales.ts `resolveText`): `locales[locale]` →
`text` → `locales[fallbackLocale]` → empty. Missing translations never blank
a slide; they fall back.

## Workflow

1. Set `fallbackLocale` (default `en-US`) and add codes to `state.locales`.
2. Switch the editing locale in the toolbar; the inspector edits that
   locale's copy (fallback shown when no override exists).
3. Export segregates folders by locale:
   `…/1320x2868/en-US/screen01-of-05.png`. Export for additional locales by
   switching the export locale — same layout, translated copy.

## RTL locales (ar, he, fa)

The inspector shows the RTL checklist when the editing locale is RTL
(`isRtl` in lib/locales.ts). Canvas text honors `direction: rtl` and mirrors
left/right alignment. Rules:

- Mirror layout direction; **keep device frames unmirrored** (status bars,
  notch positions are LTR hardware).
- Flip chevrons, progress bars, and directional motifs; center-aligned
  headlines stay centered.
- Keep each headline a single RTL unit — avoid Latin words mid-headline
  (numbers are fine: "٣ خطوات" or "3 خطوات" both render acceptably).
- Store the translated copy per locale; don't rely on bidi auto-mirroring
  for mixed strings.

## CJK locales (ja, ko, zh)

- Budget roughly half the characters vs Latin: a 24-char Latin headline maps
  to ~12 CJK chars. The 40-char headline limit becomes ~20.
- Bump headline size token +8px (at 1320 width) for CJK-only decks — glyphs
  read smaller at equal px due to denser strokes.
- Prefer sentence-per-line wrapping; the renderer word-wraps on spaces, so
  for CJK keep headlines short enough to avoid awkward mid-phrase breaks.

## App Store Connect vs Google Play locale codes

Apple uses locale codes like `ar-SA`, `ca`, `zh-Hans`; Google uses `ar`,
`ca`, `zh-CN`. The export folder name is the project's code — rename folders
when uploading if the console's code differs. Keep a mapping table in your
project notes when shipping both stores.

## What not to localize

- Device frame screens' status-bar times (keep neutral, e.g. 9:41).
- Proper nouns and app names, unless the brand has a localized name.
- Kicker badges are safe to swap (see headlines.md — kickers break first);
  translate the *idea*, not mechanically.
