"use client";

// Photoshop-style left tool dock: one slim rail of tool buttons; the active
// tool opens a flyout panel beside it. All creation/editing tools live here,
// freeing the canvas from the old right inspector.

import { useState } from "react";
import { STICKER_SETS, QUICK_SHAPES, STICKER_DEFAULT_SIZE } from "@/lib/stickers";
import { THEMES } from "@/lib/themes";
import ElementProperties from "./ElementProperties";
import ScreenCopyEditor from "./ScreenCopyEditor";
import type { Deck, ProjectState, Screen, ScreenElement, UploadedAsset } from "@/lib/types";

export type ToolId = "screens" | "text" | "stickers" | "media" | "elements" | "style" | "props";

const TOOLS: { id: ToolId; glyph: string; title: string; group: number }[] = [
  { id: "screens", glyph: "📱", title: "Screens", group: 0 },
  { id: "text", glyph: "T", title: "Text & copy", group: 0 },
  { id: "stickers", glyph: "😀", title: "Stickers (emoji)", group: 1 },
  { id: "elements", glyph: "⬒", title: "Elements: devices & shapes", group: 1 },
  { id: "media", glyph: "🖼", title: "Media: captures", group: 1 },
  { id: "style", glyph: "🎨", title: "Style: themes", group: 2 },
  { id: "props", glyph: "⚙", title: "Properties of selection", group: 2 },
];

interface Props {
  tool: ToolId | null;
  onTool: (t: ToolId | null) => void;
  deck: Deck;
  state: ProjectState;
  locale: string;
  screenIndex: number;
  selectedId: string | null;
  screen: Screen;
  onSelect: (id: string | null) => void;
  onScreenSelect: (i: number) => void;
  onScreenAdd: () => void;
  onScreenReorder: (from: number, to: number) => void;
  onScreenDuplicate: (i: number) => void;
  onScreenDelete: (i: number) => void;
  onUpdateScreen: (patch: Partial<Screen>) => void;
  onUpdateElement: (id: string, patch: Partial<ScreenElement>) => void;
  onAddElement: (kind: ScreenElement["kind"]) => void;
  onAddDeviceFrame: () => void;
  onAddShape: (shape: "rect" | "ellipse" | "ring") => void;
  onAddSticker: (emoji: string) => void;
  onDeleteElement: (id: string) => void;
  onAddAsset: (a: UploadedAsset) => void;
  onBindToSelection: (assetId: string) => void;
  onBindDevice: (deviceId: string, assetId: string) => void;
  onStyle: (styleId: string) => void;
}

export default function ToolDock(p: Props) {
  const [uploadRef, setUploadRef] = useState<HTMLInputElement | null>(null);
  const active = TOOLS.find((t) => t.id === p.tool) ?? null;

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const { uploadCapture } = await import("@/lib/assets");
    for (const file of Array.from(files)) {
      const asset = await uploadCapture(file);
      if (!asset) continue;
      p.onAddAsset(asset);
      const target =
        p.screen.elements.find((e) => e.id === p.selectedId && e.kind === "device") ??
        p.screen.elements.find((e) => e.kind === "device");
      if (target) p.onBindDevice(target.id, asset.id);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignSelf: "stretch", minHeight: 0 }}>
      {/* tool rail */}
      <div
        className="panel"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", width: 48 }}
      >
        {TOOLS.map((t, i) => (
          <span key={t.id} style={{ display: "contents" }}>
            {i > 0 && TOOLS[i - 1].group !== t.group && <div style={{ height: 1, width: 22, background: "var(--border)", margin: "4px 0" }} />}
            <button
              title={t.title}
              onClick={() => p.onTool(p.tool === t.id ? null : t.id)}
              style={{
                fontSize: t.glyph.length > 1 ? 17 : 15,
                fontWeight: 700,
                width: 36,
                height: 36,
                padding: 0,
                background: p.tool === t.id ? "var(--accent)" : "var(--panel-2)",
              }}
            >
              {t.glyph}
            </button>
          </span>
        ))}
      </div>

      {/* flyout panel */}
      {active && (
        <aside className="panel" style={{ width: 250, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="spread" style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
            <strong style={{ fontSize: 13 }}>{active.title}</strong>
            <button onClick={() => p.onTool(null)} title="Close panel" style={{ padding: "2px 8px" }}>✕</button>
          </div>
          <div style={{ overflowY: "auto", padding: 12, display: "grid", gap: 10, alignContent: "start" }}>
            {p.tool === "screens" && (
              <>
                <button className="primary" onClick={p.onScreenAdd}>+ Add screen</button>
                {p.deck.screens.map((sc, i) => (
                  <div
                    key={sc.id}
                    className="spread"
                    style={{ border: `1px solid ${i === p.screenIndex ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "6px 8px" }}
                  >
                    <button style={{ border: "none", background: "transparent", padding: 0, textAlign: "left", flex: 1, fontSize: 12 }} onClick={() => p.onScreenSelect(i)}>
                      {i + 1}. {sc.headline?.slice(0, 20) || "Untitled"}
                    </button>
                    <span style={{ display: "flex", gap: 2 }}>
                      <button title="Duplicate" onClick={() => p.onScreenDuplicate(i)}>⧉</button>
                      <button title="Delete" onClick={() => p.onScreenDelete(i)}>✕</button>
                    </span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Reorder by dragging thumbnails on the canvas rail (coming to this panel soon).</div>
              </>
            )}

            {p.tool === "text" && (
              <ScreenCopyEditor
                state={p.state}
                locale={p.locale}
                screen={p.screen}
                onUpdateScreen={p.onUpdateScreen}
                onUpdateElement={p.onUpdateElement}
              />
            )}

            {p.tool === "stickers" && (
              <>
                {STICKER_SETS.map((s) => (
                  <section key={s.id}>
                    <label>{s.label}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
                      {s.items.map((emoji) => (
                        <button key={emoji} title={`Add ${emoji}`} onClick={() => p.onAddSticker(emoji)} style={{ fontSize: 18, padding: "4px 0", background: "var(--panel-2)" }}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Drops at {STICKER_DEFAULT_SIZE}px — resize under ⚙ Properties.</div>
              </>
            )}

            {p.tool === "elements" && (
              <>
                <label>Devices</label>
                <button onClick={p.onAddDeviceFrame}>+ Add device frame</button>
                <label style={{ marginTop: 6 }}>Shapes</label>
                <div className="row" style={{ gap: 4 }}>
                  {QUICK_SHAPES.map((q) => (
                    <button key={q.shape} style={{ flex: 1, fontSize: 12 }} onClick={() => p.onAddShape(q.shape)}>
                      {q.label}
                    </button>
                  ))}
                </div>
                <label style={{ marginTop: 6 }}>Text blocks</label>
                <div className="row" style={{ gap: 4 }}>
                  <button style={{ flex: 1, fontSize: 12 }} onClick={() => p.onAddElement("text")}>+ Text</button>
                  <button style={{ flex: 1, fontSize: 12 }} onClick={() => p.onAddElement("shape")}>+ Shape</button>
                </div>
              </>
            )}

            {p.tool === "media" && (
              <>
                <input ref={setUploadRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => void handleFiles(e.target.files)} />
                <button className="primary" onClick={() => uploadRef?.click()}>⬆ Upload captures</button>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  Uploads auto-bind to the selected device (or the screen's first device). You can also drop files straight onto a frame on the canvas.
                </div>
                <label style={{ marginTop: 6 }}>Library ({p.state.assets.length})</label>
                {p.state.assets.length === 0 && <div style={{ fontSize: 12, color: "var(--text-dim)" }}>No captures yet.</div>}
                {p.state.assets.map((a) => (
                  <div key={a.id} className="spread" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "4px 8px" }}>
                    <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
                      {a.label ?? a.file.split("/").pop()} {a.width ? `· ${a.width}×${a.height}` : ""}
                    </span>
                    <button
                      style={{ fontSize: 11, padding: "2px 6px" }}
                      onClick={() => {
                        const target =
                          p.screen.elements.find((e) => e.id === p.selectedId && (e.kind === "device" || e.kind === "image")) ??
                          p.screen.elements.find((e) => e.kind === "device");
                        if (target) p.onBindDevice(target.id, a.id);
                      }}
                    >
                      Bind →
                    </button>
                  </div>
                ))}
              </>
            )}

            {p.tool === "style" && (
              <>
                <label>Deck theme</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => p.onStyle(t.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        padding: "6px 8px",
                        background: p.deck.styleId === t.id ? "var(--accent)" : "var(--panel-2)",
                      }}
                    >
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: t.bg.from ?? "#fff", border: "1px solid var(--border)", flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {p.tool === "props" && (
              <ElementProperties
                deck={p.deck}
                state={p.state}
                locale={p.locale}
                screen={p.screen}
                selectedId={p.selectedId ?? ""}
                onSelect={p.onSelect}
                onUpdateElement={p.onUpdateElement}
                onDeleteElement={p.onDeleteElement}
              />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
