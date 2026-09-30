# kami-ai-skill

Hand this skill to an AI coding agent and it stands up a complete screenshot
studio for App Store and Google Play listings — a local Next.js app where raw
simulator captures become polished marketing slides, laid out on a connected
canvas and exported at every store-required pixel size.

```
npx skills add janasco/kami-ai-skill
```

## Why this exists

Marketing screenshots are the chore every launch postpones until the night
before. Store consoles demand exact pixel dimensions per device and locale;
design tools want a subscription and a template hunt. This skill skips both:
your agent assembles a dedicated editor around your real captures, and the
export button emits precisely what the consoles accept — no resizing, no
rejection emails.

## What your agent builds

- **One endless strip.** Screens sit side by side on a single canvas;
  devices and captions can drift across boundaries, and exports slice the
  strip back into exact per-screen crops.
- **A fence for old projects.** Isolated rendering keeps every element
  clipped to its own screen until you deliberately opt into connected crops.
- **A screen rail.** Add, drag to reorder, and jump between screens through
  live thumbnails.
- **A right-hand panel that edits everything** — copy, roles, sizes,
  stacking, transforms, screenshot binding — plus a menu that drafts
  headlines from proven formulas.
- **Eighteen finished looks.** Each ships as a toolbar preset with palette,
  type ramp, and decorative motif already resolved.
- **Three tabs, one workflow.** iOS, Mac, and Android decks live side by
  side; nothing is relearned between them.
- **Frames for every shelf.** iPhone, iPad, Apple TV, Apple Watch, and
  CarPlay; Android phones and tablets; Play feature graphics; a 16:10 Mac.
- **State that survives anything.** Every change lands in
  `app-store-screenshots.json` through a revision-checked save — two tabs or
  two agents can't clobber each other — mirrored to localStorage, with a
  warning before you close unsaved work.
- **One click, one ZIP.** Every required size, sorted
  platform / device / resolution / locale, opaque PNGs, plus a manifest.

## Bring it into your agent

**One command** (Claude Code, Codex, Cursor, OpenCode, and 75+ more):

```bash
npx skills add janasco/kami-ai-skill
```

Variants worth knowing:

```bash
npx skills add janasco/kami-ai-skill --list        # peek before installing
npx skills add janasco/kami-ai-skill -g            # every project, not just this one
npx skills add janasco/kami-ai-skill -a claude-code -a codex -y   # scripted installs
```

Files land in `./<agent>/skills/` (this project) or `~/<agent>/skills/`
(machine-wide). `npx skills update kami-ai-skill` pulls newer versions.

**The manual route:** clone the repo and tell your agent
*"Read SKILL.md and follow it"* — that file is the contract; the rest of the
repo hangs off it. Prefer to skip agents entirely? Copy the studio out and
run it:

```bash
node scripts/scaffold.mjs my-screenshots   # or: cp -r templates/. my-screenshots/
cd my-screenshots && npm install && npm run dev
```

## First run

1. Ask your agent for store screenshots. It reads the contract, copies the
   studio into your project, and starts the dev server.
2. Drop captures into `public/screenshots/uploaded/` (or upload through the
   panel — files are content-hashed, so re-uploads dedupe).
3. Compose: headlines, captions, themes, frames. Elements slide across
   screen edges on the strip; exports cut them apart cleanly.
4. Export. The ZIP mirrors the console's upload dialogs, folder by folder.

The whole project is one JSON file. Commit it, push it, and any deck —
half-finished or shipped — resumes exactly where it stopped.

## Prompts worth stealing

- "Give my habit tracker a five-screen App Store set in the Midnight style,
  sized for 6.9-inch iPhones."
- "I need Google Play assets for my recipe app — phone screenshots plus the
  1024×500 feature graphic."
- "Captures are in public/screenshots/uploaded — build a deck around them
  and draft the headlines."
- "Localize my deck for Germany, then export en-US and de-DE together."
- "Make the hero phone straddle screens 1 and 2 and export connected crops."
- "Recolor everything to #4F46E5 and regenerate the full bundle."

## Sharper prompts, better decks

- **Lead with the platform.** "iPhone 6.9-inch only" trims the export to
  what you'll actually upload.
- **Cap the deck.** Five or six screens; the first three do the selling.
- **Hand over a brand color or icon** and the agent anchors the palette on
  it instead of guessing.
- **Request formulas by name** — "Outcome", "Number proof" — from the copy
  library, so headlines stay varied and concrete.
- **Settle locales before exporting**; the bundle comes out complete in one
  pass.
- **Name the store.** Play policy bans CTAs and rank claims that Apple
  tolerates; saying which store keeps copy compliant.

## What lands on disk

```
my-screenshots/
├── app/                    Next.js App Router: studio page + API routes
│   ├── api/project/        project read/write with revision guard
│   └── api/upload/         capture uploads → public/screenshots/uploaded/
├── components/             Canvas, CanvasRenderer, Sidebar, Inspector,
│                           Toolbar, ExportDialog, useProject
├── lib/                    types, devices, themes, headlines, locales,
│                           factory, migrations, render, export, assets
├── public/screenshots/     your uploaded captures (hash-named, deduped)
└── package.json            Next.js 15 · React 19 · TypeScript · JSZip
```

`npm run dev`, open `http://localhost:3000` — that's the whole ceremony.

## Inside the studio

1. Tabs across the top switch platform; the dropdown beside them picks the
   device. Deck sizes rescale proportionally when devices change.
2. The theme menu restyles the entire deck in one tap.
3. New screens arrive prebuilt: headline, caption, centered frame.
4. Bind captures in the panel, then tune zoom and pan until the pixels sit
   right inside the frame.
5. Draft copy from the idea menu or write your own — per-locale overrides
   attach to every text element, and RTL locales get a built-in checklist.
6. Choose export semantics: **connected** slices one continuous strip;
   **isolated** fences each screen (the safe default for older decks).
7. Export renders at true store resolution and downloads the ZIP with a
   manifest describing every file.

## Under the hood

- **Next.js 15** App Router, **React 19**, strict **TypeScript** — boring on
  purpose, so it runs anywhere.
- **One canvas renderer** feeds both the live preview and the exports: the
  preview is ground truth, not an approximation of it.
- **JSZip** in the browser does the bundling; nothing else runs client-side.
- **No database, no accounts.** Project state is a JSON file you can commit,
  written atomically and guarded by revisions.

## Capture cheat sheet

| You're shipping for | Capture from | Why |
| --- | --- | --- |
| Any iPhone | 6.1″ simulator (1170×2532) | easiest fit, least manual nudging |
| iPhone 6.9″ | 6.9″ simulator (1320×2868) | 1:1 into the frame, zero scaling |
| iPad 13″ | 13″ iPad simulator (2064×2752) | matches the export exactly |
| Apple TV | tvOS 4K simulator (3840×2160) | the required size |

## Deep-dive docs

| Doc | Contents |
| --- | --- |
| [SKILL.md](SKILL.md) | The agent-facing contract — start here |
| [references/store-specs.md](references/store-specs.md) | Every accepted size/aspect, Apple + Google, verified 2026-09 |
| [references/styles.md](references/styles.md) | The 18 style specs and connected-canvas rules |
| [references/headlines.md](references/headlines.md) | Headline/caption formulas and deck pacing |
| [references/architecture.md](references/architecture.md) | Data model, save protocol, export pipeline |
| [references/localization.md](references/localization.md) | Locales, RTL, CJK guidance |
