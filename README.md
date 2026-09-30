# kami-ai-skill

A portable skill for AI coding agents: scaffold
a **production-ready Next.js editor for App Store and Google Play marketing
screenshots** in one step.

Not a template gallery — a working studio. Solo developers and creators drop
in raw app captures, get ad-style slides with big readable copy over real
device frames, and export pixel-exact PNG bundles for every required store
size.

## What it builds

- **Connected canvas** — view the whole screenshot strip at once, drag
  elements across screen boundaries, export each screen as a precise crop.
- **Isolated mode** — legacy decks keep offscreen elements from leaking into
  neighboring exports.
- **Screen sidebar** — add, select, drag-to-reorder with live thumbnails.
- **Inspector** — layout, labels, headlines, screenshots, stacking, and
  transforms from the right panel, with a **Copy ideas** menu that drops in
  proven headline formulas.
- **Theme picker** — 18 named visual styles, one preset each in the toolbar.
- **Platform switcher** — iOS, Mac, and Android decks side by side, one
  workflow.
- **Devices** — iPhone, iPad, Apple TV, Apple Watch, CarPlay under iOS;
  Android phone/tablet + Play feature graphic; a 16:10 Mac deck.
- **Autosave** — writes through `/api/project` to
  `app-store-screenshots.json`, mirrors to localStorage, and refuses to
  clobber newer disk revisions (multi-tab / multi-agent safe).
- **Export bundle** — one ZIP organized by platform, device, resolution, and
  locale.

## Usage (agent)

Point your coding agent at this directory and ask for App Store screenshots.
The contract in [SKILL.md](SKILL.md) drives everything:

```bash
cp -r templates/. my-screenshots-app/
cd my-screenshots-app && npm install && npm run dev
```

## References

| Doc | Contents |
| --- | --- |
| [references/store-specs.md](references/store-specs.md) | Every accepted size/aspect for App Store, Mac, TV, Watch, Play — verified 2026-09 |
| [references/styles.md](references/styles.md) | 18 named styles with full specs + connected-canvas rules |
| [references/headlines.md](references/headlines.md) | Headline/caption formula library |
| [references/architecture.md](references/architecture.md) | Data model, save protocol, export pipeline |
| [references/localization.md](references/localization.md) | Locales, RTL guidance |

## Tips for solo developers

- Capture from the **6.1-inch iPhone simulator** (1170×2532) — least manual
  adjustment inside frames; capture 6.9" (1320×2868) for the primary export.
- 3–6 screens beats 10. First three carry the highest-intent features.
- The project file (`app-store-screenshots.json`) is git-trackable — commit
  it and you can resume any deck weeks later.
