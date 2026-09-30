---
name: kami-ai-skill
description: >-
  Scaffolds a production-ready Next.js editor for App Store and Google Play
  marketing screenshots: connected canvas with real device frames, inspector
  controls, git-trackable project state (app-store-screenshots.json), 18
  named visual styles, headline copy library, and one-click export bundles at
  exact store-ready sizes. Use when the user wants to create, edit, or export
  app store screenshots, store listing assets, or feature graphics.
---

# Kami AI — App Store Screenshot Studio

Build a **screenshot editor**, not a one-off image. The end state is a local
Next.js app where a solo developer lays out ad-style slides with big readable
copy over real device frames, sees the whole strip on one connected canvas,
and exports pixel-exact PNG bundles for every required store size.

## When to use

- "Make App Store / Google Play screenshots for my app"
- "I need a feature graphic" or "store listing assets"
- "Build a screenshot editor / marketing page generator for my app"
- User has raw captures (PNG/JPEG) from a simulator or device and wants
  ad-style slides with headlines, captions, and themes.

## Zero-to-running in five steps

### 1. Scaffold

Copy `templates/` into the user's project root (or a fresh directory):

```bash
cp -r <skill_dir>/templates/. <target_dir>/
cd <target_dir> && npm install
```

`templates/` is a complete Next.js 15 App Router + TypeScript project: editor
UI, API routes, PNG/ZIP export, project persistence, and `lib/` specs. Do not
rewrite these files — wire and customize them. If the target already has a
Next.js app, copy `lib/`, `components/`, `app/` paths and merge configs
instead.

### 2. Import the user's captures

Tell the user (or do it directly): place raw screenshots in
`public/screenshots/uploaded/`. Files added through the UI go to the same
place as content-hash PNGs (`<hash>.png`), so the project is git-trackable
and no asset ever dangles. Source captures for iPhone are easiest from the
**6.1-inch simulator** (1170×2532) — it needs the least manual adjustment
inside device frames. For the primary 6.9" export, prefer 6.9" simulator
captures (1320×2868) so downscale is a clean 1:1 into frames.

### 3. Project state

Everything lives in **`app-store-screenshots.json`** at the project root:

- One deck per platform tab (ios / mac / android), one or more screens per
  deck, elements per screen (device frame, headline, caption, badges, shapes).
- Read/write through `lib/projectStore.ts` via `/api/project`. Autosave writes
  to disk, mirrors to localStorage, and **refuses to clobber a newer disk
  revision** (multi-tab / multi-agent safety). Failed saves retry; unsaved
  edits warn on unload.
- The file is the resumable handoff: an agent can reopen it tomorrow, read
  `revision`, and continue. Schema lives in `lib/types.ts`. If you must change
  the schema, add a migration in `lib/migrations.ts` — never break old files.

### 4. Compose like a pro (do this *with* the user)

- First three screens carry the highest-intent features; put the core UI
  front and center there. Headlines ≤ 40 chars, captions ≤ 90, one idea per
  slide. 3–6 screens is the sweet spot (10 is the App Store max).
- Use the **Copy ideas** library (`references/headlines.md`) — proven formula
  patterns the agent can drop in and adapt per feature.
- Choose from **26 named styles** (`references/styles.md`), each with deep
  specs (palette, type ramp, motif, gradient stops). Default to a style whose
  palette matches the user's app icon; pick the rest of the palette from it.
- **Connected canvas**: elements may span screen boundaries; export crops each
  screen from the strip. Keep devices bleeding across gaps for premium decks
  (see `references/styles.md` → "Connected canvas rules").
- **Isolated mode**: older decks keep elements clipped to their own screen.
  Preserve it unless the user opts into connected crops.

### 5. Export

`Export bundle` → ZIP organized `platform/device/resolution/locale/…`. Sizes
and requirements are in `references/store-specs.md` — this is the source of
truth (6.9" iPhone 1320×2868, 13" iPad 2064×2752, Mac 16:10, Apple TV
3840×2160, Watch 396×484, Play phone 1080×1920, feature graphic 1024×500, and
the full matrix). Exports are opaque PNG (no alpha) — stores reject
transparency.

## Localization & RTL

- Per-locale copy lives in each screen's `locales` map; export ZIP segregates
  `locale/` directories. Start with one locale; add more on request.
- For RTL locales (ar, he, fa): mirror the layout direction, flip
  chevrons/progress motifs, keep device frames unmirrored, and swap headline
  alignment. The inspector flags RTL-safety per element
  (`lib/locales.ts` → `isRtl`).

## Store-policy guardrails (hard rules)

Never put in screenshots: rank/award claims ("#1", "Best"), price/promo
language, CTAs ("Download now"), device imagery not matching the store,
or third-party trademarks. Google additionally bans these from *all*
listing assets — including feature graphics. Taglines must stay ≤ 20% of a
Google Play screenshot's area.

## Agent workflow rules

1. **Never edit `app-store-screenshots.json` by hand while the editor is
   open** — bump `revision` atomically or let the UI save; otherwise the
   revision guard will drop your write.
2. When asked for "all sizes", export the full bundle, not just iPhone.
3. Watch the default export: each export set must be one consistent style
   (palette drift across screens reads as sloppy in a strip).
4. Keep total elements per screen ≤ ~12; strips get noisy fast.
5. New device size requests go in `lib/devices.ts` (single source of truth,
   consumed by canvas, inspector, and exporter alike).

## Reference index

| File | Read when |
| --- | --- |
| `references/store-specs.md` | Exporting; any size/aspect/limit question |
| `references/styles.md` | Choosing or building a visual style |
| `references/headlines.md` | Writing or rewriting slide copy |
| `references/architecture.md` | Extending code, adding devices/features |
| `references/localization.md` | Multi-locale or RTL work |

## Troubleshooting

- **Save conflict banner**: another tab/agent saved a higher revision —
  reload from disk before continuing.
- **Blurry exports**: source capture below frame's pixel box → re-capture at
  the export size or enable frame scaling in the inspector.
- **Upload 404**: `/api/upload` writes `public/screenshots/uploaded/`; ensure
  the directory exists (scaffold creates it with `.gitkeep`).
