# Architecture

## Layout

```
templates/
├── app/
│   ├── api/project/route.ts   GET/POST project state (revision guard)
│   ├── api/upload/route.ts    multipart upload → public/screenshots/uploaded/<hash>.<ext>
│   ├── page.tsx               studio shell: wires toolbar/sidebar/canvas/inspector
│   ├── layout.tsx, globals.css
├── components/
│   ├── CanvasRenderer.tsx     pixel-truth strip renderer (preview AND export use it)
│   ├── Canvas.tsx             interactive layer: selection, cross-screen dragging
│   ├── Sidebar.tsx            screen list, live thumbnails, drag-to-reorder
│   ├── Inspector.tsx          element editing, Copy ideas, uploads, RTL hints
│   ├── Toolbar.tsx            platform tabs, device, theme, mode, locale, export
│   ├── ExportDialog.tsx       renders all decks → zip
│   └── useProject.ts          state + autosave + revision guard + unload warning
├── lib/
│   ├── types.ts               schema (source of truth for app-store-screenshots.json)
│   ├── devices.ts             device catalog + export sizes (mirror of store-specs.md)
│   ├── themes.ts              18 presets + type ramp (mirror of styles.md)
│   ├── headlines.ts           formula library for the Copy ideas menu
│   ├── locales.ts             locale registry, RTL/CJK helpers
│   ├── factory.ts             deck/screen/element constructors
│   ├── migrations.ts          schema versioning
│   ├── projectStore.ts        disk I/O + revision guard (server)
│   ├── render.ts              canvas drawing primitives
│   ├── export.ts              crop math + zip paths
│   └── assets.ts              hashing, image probing, cover-fit drawing
└── public/screenshots/uploaded/
```

## Data model

`app-store-screenshots.json` (project root):

```
ProjectState
├── schemaVersion, revision, updatedAt
├── appName, fallbackLocale, locales[], defaultStyleId, mode
├── decks[]            one per platform (ios | mac | android)
│   ├── deviceId, orientation, styleId
│   └── screens[]
│       └── elements[]  device | text | shape | image
└── assets[]           uploaded captures (id = content hash)
```

**Coordinates are strip coordinates**: `x` spans the whole screen strip
(`screenIndex * canvasWidth + localX`). That single decision is what makes the
connected canvas work — an element whose `x` crosses a screen boundary renders
in both screens' exports (connected mode) and each export is a crop of the
shared strip. In isolated mode, screens render alone; offscreen elements never
leak.

## Save protocol (multi-tab / multi-agent safe)

1. Client POSTs `{ state, clientRevision }` to `/api/project`.
2. Server reads disk revision. If `clientRevision < diskRevision` → `409`
   with the disk revision (another tab/agent saved first).
3. Otherwise the server bumps revision, writes `<file>.tmp`, renames —
   an atomic swap so a crash never corrupts the project.
4. Client mirrors the saved state to localStorage as a recovery copy.

Agent rule: to edit the JSON from a script, read → mutate → POST with the
revision you read. Never blind-write while the editor is open.

## Export pipeline

`ExportDialog → renderDeckPngs (lib/export.ts) → CanvasRenderer.renderDeckStrip`

- Connected mode: the strip renders **once** at full resolution (one canvas of
  `screens × width`), then each screen is `drawImage`-cropped to its exact
  store size. Spanning elements appear in every crop they touch, with
  background continuity — crops are seamless.
- Isolated mode: each screen renders alone; element strip coords are shifted
  with a canvas translate so offscreen content is clipped.
- PNG, no alpha, exact pixels from `lib/devices.ts`. Zip paths:
  `platform/device/resolution/locale/screenNN-of-total.png` + `manifest.json`.

## Extending

- **New device**: add a `DeviceSpec` in `lib/devices.ts` (canvas, inspector,
  exporter pick it up automatically) + a row in `references/store-specs.md`.
- **New style**: add to `lib/themes.ts` + `styles.md`; give it a motif id and
  implement any new motif branch in `paintMotif` (lib/render.ts).
- **New headline formula**: `lib/headlines.ts` + `headlines.md`.
- **Schema change**: bump `CURRENT_SCHEMA_VERSION`, add a migration step in
  `lib/migrations.ts`, keep old files loading.
