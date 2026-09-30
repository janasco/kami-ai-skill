"use client";

import { useState } from "react";
import JSZip from "jszip";
import { renderDeckPngs } from "@/lib/export";
import type { ProjectState } from "@/lib/types";

interface Props {
  state: ProjectState;
  onClose: () => void;
}

/**
 * One-click bundle: renders every deck × screen at exact store resolution
 * and zips them as platform/device/resolution/locale/screenNN.png.
 */
export default function ExportDialog({ state, onClose }: Props) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    try {
      const zip = new JSZip();
      const deckIds = [...new Set(state.decks.map((d) => d.id))];
      const decks = deckIds.map((id) => state.decks.find((d) => d.id === id)!);
      const perDeck = decks.map((d) => d.screens.length);
      const total = perDeck.reduce((a, b) => a + b, 0);
      let done = 0;
      setProgress({ done, total });

      for (let di = 0; di < decks.length; di++) {
        const deck = decks[di];
        const pngs = await renderDeckPngs(deck, state, state.fallbackLocale);
        for (const png of pngs) {
          zip.file(png.name, png.blob);
          done += 1;
          setProgress({ done, total });
        }
      }

      // manifest helps agents verify sizes without unzipping
      zip.file(
        "manifest.json",
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            mode: state.mode,
            locale: state.fallbackLocale,
            decks: decks.map((d) => ({
              deckId: d.id,
              platform: d.platform,
              device: d.deviceId,
              orientation: d.orientation,
              screens: d.screens.length,
            })),
          },
          null,
          2,
        ),
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `store-screenshots-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "export failed");
    } finally {
      setProgress(null);
    }
  }

  const running = progress !== null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 100 }}
      onClick={() => !running && onClose()}
    >
      <div className="panel" style={{ padding: 20, minWidth: 340 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 8px" }}>Export bundle</h3>
        <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 0 }}>
          Renders {state.decks.reduce((a, d) => a + d.screens.length, 0)} screen(s) across {new Set(state.decks.map((d) => d.deviceId)).size} deck(s)
          at exact store sizes ({state.mode} mode), zipped by platform / device / resolution / locale.
        </p>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onClose} disabled={running}>Close</button>
          <button className="primary" onClick={() => void run()} disabled={running}>
            {running ? `Exporting… ${progress?.done}/${progress?.total}` : "Export ZIP"}
          </button>
        </div>
      </div>
    </div>
  );
}
