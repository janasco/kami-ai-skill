# Visual styles — 18 named presets

Each style is a complete spec: background (solid or gradient stops), text
colors, accent, type ramp, and motif. One toolbar preset per style lives in
`lib/themes.ts` — the specs below are the design intent; the code mirrors
them. When the user's app has a brand color, pick the style closest to it or
re-anchor one style's palette on the brand hue (keep contrast ratios).

Type ramp (scale to export size; ratios stay fixed):

| Token | Size (at 1320px width) | Weight | Tracking | Case |
| --- | --- | --- | --- | --- |
| kicker | 34px | 600 | +0.14em | uppercase |
| headline | 96px | 800 | −0.02em | sentence |
| subhead | 44px | 500 | −0.01em | sentence |
| caption | 34px | 400 | 0 | sentence |
| badge | 28px | 600 | +0.06em | uppercase |

Line-height 1.05 for headlines, 1.35 for captions. Max 2 headline lines.

## The styles

| # | Name | Background | Text | Accent | Motif |
| --- | --- | --- | --- | --- | --- |
| 1 | **midnight-glow** | radial #1B1F3B → #0B0D1A | #F4F6FF | #6C7BFF | soft glow behind device |
| 2 | **sunset-pop** | linear 180° #FF9A62 → #E5484D | #FFF7F0 | #FFD166 | oversized sun circle |
| 3 | **clean-white** | solid #FFFFFF | #111418 | #0A84FF | hairline divider, generous whitespace |
| 4 | **paper-minimal** | solid #F7F5F0 | #1C1B18 | #B4540A | grain texture, serif-friendly |
| 5 | **mint-fresh** | linear 160° #DFF7EC → #A8E6CF | #0E2A20 | #1DB954 | floating leaf dots |
| 6 | **candy-gradient** | linear 135° #FF8AE2 → #8B5CF6 | #FFFFFF | #FFD6F5 | blob shapes, rounded cards |
| 7 | **ocean-deep** | linear 180° #0F3D6E → #071B33 | #EAF4FF | #38BDF8 | wave arcs |
| 8 | **carbon-pro** | solid #16181D | #F2F4F8 | #F5A623 | blueprint grid 5% opacity |
| 9 | **notebook-grid** | solid #FDFDFB + 32px grid #E4E4E0 | #202226 | #3B82F6 | hand-drawn underline |
| 10 | **neon-night** | linear 180° #121016 → #241B2F | #F7EFFF | #C084FC | neon stroke shapes |
| 11 | **corporate-sky** | linear 180° #EFF6FF → #DBEAFE | #0F2745 | #2563EB | rounded rect panels |
| 12 | **citrus-zest** | solid #FFF8E7 | #24310E | #84CC16 | halftone dots corner |
| 13 | **terracotta-warm** | linear 165° #F5E8DC → #E7C6A9 | #3D2B1F | #C05621 | arch shapes |
| 14 | **forest-calm** | linear 180° #12271B → #1D3B2A | #EDF7F0 | #4ADE80 | mist gradient bottom |
| 15 | **rose-editorial** | solid #FBEFF2 | #3A1220 | #D6336C | thin rules, magazine layout |
| 16 | **slate-glass** | linear 180° #20242C → #2C313B | #F1F5F9 | #7DD3FC | frosted-glass cards over frame |
| 17 | **aurora-pop** | linear 120° #7F5CFF → #34D399, 60% overlay #0E1126 | #FFFFFF | #A7F3D0 | diagonal aurora bands |
| 18 | **mono-brutal** | solid #F2F2F0 | #000000 | #FF4D00 | 6px black borders, offset shadows |

Each preset exposes: `bg` (solid or gradient stops + angle), `text`,
`accent`, `kickerColor`, `motif` (id the canvas renderer switches on), and
`dark: boolean` (frame shadow tuning: dark styles use softer, larger shadows).

## Connected canvas rules

- Devices may bleed across screen gaps; keep text **inside one screen's safe
  area** so crops never slice words (export crops at screen bounds).
- Overlap budget: at most ~8% of a device's width may cross the boundary,
  otherwise neighboring headlines crowd.
- Background continuity: with connected mode on, the strip renders as one
  continuous background so the crop edges are invisible. Isolated mode
  renders each screen's background separately.
- Safe margin: 64px (at 1320px width) from every screen edge for text;
  24px for decorative motifs.
- Style consistency: one style per export set. If the user wants per-screen
  accent shifts, keep the background identical and vary accent only.

## Pairing guide

- Finance / productivity → carbon-pro, slate-glass, corporate-sky
- Health / fitness → mint-fresh, forest-calm, clean-white
- Social / dating → candy-gradient, sunset-pop, rose-editorial
- Games / entertainment → neon-night, aurora-pop, midnight-glow
- Developer tools → mono-brutal, carbon-pro, notebook-grid
- Kids / education → citrus-zest, paper-minimal, mint-fresh
