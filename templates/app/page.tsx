"use client";

import { useEffect, useState } from "react";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import Inspector from "@/components/Inspector";
import ExportDialog from "@/components/ExportDialog";
import { useProject } from "@/components/useProject";
import { canvasSize, devicesWithLandscape, getDevice } from "@/lib/devices";
import { defaultDeckConfig, makeDeck, makeTextElement, newId, starterScreen } from "@/lib/factory";
import { HEADLINE_FORMULAS } from "@/lib/headlines";
import type { Deck, EditorMode, PlatformId, Screen, ScreenElement, UploadedAsset } from "@/lib/types";

export default function Page() {
  const { state, status, dirty, conflictRevision, update, save, reloadFromDisk } = useProject();
  const [platform, setPlatform] = useState<PlatformId>("ios");
  const [screenIndex, setScreenIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locale, setLocale] = useState("en-US");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (state) setLocale(state.fallbackLocale);
  }, [state?.revision === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "loading") return <main style={{ padding: 40 }}>Loading project…</main>;
  if (status === "error")
    return (
      <main style={{ padding: 40 }}>
        <p>Could not load the project.</p>
        <button onClick={() => location.reload()}>Retry</button>
      </main>
    );
  if (!state) return null;

  const deck = state.decks.find((d) => d.platform === platform) ?? null;
  const screen: Screen | null = deck?.screens[Math.min(screenIndex, deck.screens.length - 1)] ?? null;
  const deckDevice = deck ? getDevice(deck.deviceId) : null;

  function createDeck(p: PlatformId) {
    const cfg = defaultDeckConfig(p);
    const seeds = HEADLINE_FORMULAS.slice(0, 3).map((f) => ({ headline: f.example, caption: "Say the benefit, not the feature." }));
    const d = makeDeck(p, cfg.deviceId, cfg.styleId, seeds);
    update((s) => ({ ...s, defaultStyleId: cfg.styleId, decks: [...s.decks.filter((x) => x.platform !== p), d] }));
    setScreenIndex(0);
    setSelectedId(null);
  }

  function patchDeck(fn: (d: Deck) => Deck) {
    if (!deck) return;
    update((s) => ({
      ...s,
      decks: s.decks.map((d) => (d.id === deck.id ? fn(structuredClone(d)) : d)),
    }));
  }

  function patchScreen(fn: (sc: Screen) => Screen) {
    if (!deck || !screen) return;
    patchDeck((d) => ({
      ...d,
      screens: d.screens.map((sc, i) => (i === screenIndex ? fn(structuredClone(sc)) : sc)),
    }));
  }

  const handlers = {
    onPlatform: (p: PlatformId) => {
      setPlatform(p);
      setScreenIndex(0);
      setSelectedId(null);
    },
    onDevice: (deviceId: string) => {
      if (!deck) return;
      const oldW = canvasSize(deck.deviceId, deck.orientation).w;
      const newW = canvasSize(deviceId, deck.orientation).w;
      const k = newW / oldW;
      const orient = devicesWithLandscape(deviceId) ? deck.orientation : "portrait";
      patchDeck((d) => ({
        ...d,
        deviceId,
        orientation: orient,
        // rescale every element proportionally so layouts survive device swaps
        screens: d.screens.map((sc) => ({
          ...sc,
          elements: sc.elements.map((el) => ({
            ...el,
            x: Math.round(el.x * k),
            y: Math.round(el.y * k),
            w: el.w ? Math.round(el.w * k) : undefined,
            h: el.h ? Math.round(el.h * k) : undefined,
            fontSize: el.fontSize ? Math.round(el.fontSize * k) : undefined,
          })),
        })),
      }));
    },
    onStyle: (styleId: string) => {
      update((s) => ({
        ...s,
        defaultStyleId: styleId,
        decks: s.decks.map((d) => (d.platform === platform ? { ...d, styleId } : d)),
      }));
    },
    onMode: (mode: EditorMode) => update((s) => ({ ...s, mode })),
    onLocale: setLocale,
    onExport: () => setShowExport(true),
    onSave: () => void save(),
  };

  const screenHandlers = {
    onSelect: setSelectedId,
    onMoveElement: (elId: string, x: number, y: number) => {
      patchScreen((sc) => ({
        ...sc,
        elements: sc.elements.map((el) => (el.id === elId ? { ...el, x, y } : el)),
      }));
    },
    onUpdateScreen: (patch: Partial<Screen>) => patchScreen((sc) => ({ ...sc, ...patch })),
    onUpdateElement: (id: string, patch: Partial<ScreenElement>) => {
      patchScreen((sc) => ({
        ...sc,
        elements: sc.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
      }));
      if (patch.text && screen) {
        const el = screen.elements.find((e) => e.id === id);
        if (el?.role === "headline") patchScreen((sc) => ({ ...sc, headline: patch.text }));
        if (el?.role === "caption") patchScreen((sc) => ({ ...sc, caption: patch.text }));
      }
    },
    onAddElement: (kind: ScreenElement["kind"]) => {
      if (!deck || !screen) return;
      const { w: cw } = canvasSize(deck.deviceId, deck.orientation);
      let el: ScreenElement;
      if (kind === "text") {
        el = makeTextElement("subhead", "New text", Math.round(cw * 0.1), Math.round(cw * 0.5), cw, "#inherit");
        el.id = newId("text");
      } else if (kind === "device") {
        const fw = Math.round(cw * 0.45);
        el = { id: newId("device"), kind: "device", x: Math.round(cw * 0.55), y: Math.round(cw * 0.45), w: fw, h: Math.round(fw * 2.05), z: 2, deviceId: deck.deviceId };
      } else {
        el = { id: newId("shape"), kind: "shape", x: Math.round(cw * 0.6), y: Math.round(cw * 0.1), w: Math.round(cw * 0.25), h: Math.round(cw * 0.25), z: 0, shape: "ellipse", opacity: 0.5 };
      }
      patchScreen((sc) => ({ ...sc, elements: [...sc.elements, el] }));
      setSelectedId(el.id);
    },
    onDeleteElement: (id: string) => {
      patchScreen((sc) => ({ ...sc, elements: sc.elements.filter((el) => el.id !== id) }));
      if (selectedId === id) setSelectedId(null);
    },
    onAddAsset: (asset: UploadedAsset) => update((s) => ({ ...s, assets: [...s.assets.filter((a) => a.id !== asset.id), asset] })),
    onAdd: () => {
      if (!deck) return;
      const seed = HEADLINE_FORMULAS[deck.screens.length % HEADLINE_FORMULAS.length];
      patchDeck((d) => ({ ...d, screens: [...d.screens, starterScreen(d, { headline: seed.example, caption: "Say the benefit, not the feature." })] }));
      setScreenIndex(deck.screens.length);
    },
    onReorder: (from: number, to: number) => {
      patchDeck((d) => {
        const screens = [...d.screens];
        const [moved] = screens.splice(from, 1);
        screens.splice(to, 0, moved);
        return { ...d, screens };
      });
      setScreenIndex(to);
    },
    onDuplicate: (index: number) => {
      patchDeck((d) => {
        const src = d.screens[index];
        const copy: Screen = {
          ...structuredClone(src),
          id: newId("screen"),
          elements: src.elements.map((el) => ({ ...structuredClone(el), id: newId(el.kind) })),
        };
        const screens = [...d.screens];
        screens.splice(index + 1, 0, copy);
        return { ...d, screens };
      });
      setScreenIndex(index + 1);
    },
    onDelete: (index: number) => {
      if (!deck || deck.screens.length <= 1) return;
      patchDeck((d) => ({ ...d, screens: d.screens.filter((_, i) => i !== index) }));
      setScreenIndex((i) => Math.max(0, Math.min(i, deck.screens.length - 2)));
      setSelectedId(null);
    },
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh", gap: 10, padding: 10 }}>
      <div className="spread">
        <div className="row">
          <strong style={{ fontSize: 16 }}>Kami AI</strong>
          <input
            value={state.appName}
            onChange={(e) => update((s) => ({ ...s, appName: e.target.value }))}
            style={{ width: 200 }}
            title="App name"
          />
        </div>
        <div className="row" style={{ fontSize: 12, color: "var(--text-dim)" }}>
          {deckDevice && (
            <span>
              {deckDevice.label} · exports {deckDevice.exportSize.portrait.w}×{deckDevice.exportSize.portrait.h}
            </span>
          )}
          <span>rev {state.revision}</span>
        </div>
      </div>

      {conflictRevision !== null && (
        <div className="panel" style={{ padding: "10px 14px", borderColor: "var(--danger)" }}>
          <strong>Save conflict.</strong> Disk has revision {conflictRevision} (saved from another tab or agent).
          Reloading discards unsaved edits; retrying saves on top.
          <div className="row" style={{ marginTop: 8 }}>
            <button className="primary" onClick={() => void reloadFromDisk()}>Load disk version</button>
            <button onClick={() => void save()}>Retry save</button>
          </div>
        </div>
      )}

      <Toolbar
        state={state}
        platform={platform}
        deviceId={deck?.deviceId ?? defaultDeckConfig(platform).deviceId}
        mode={state.mode}
        locale={locale}
        dirty={dirty}
        status={status}
        {...handlers}
      />

      {deck && screen ? (
        <div style={{ display: "flex", gap: 10, flex: 1, minHeight: 0 }}>
          <Sidebar
            deck={deck}
            state={state}
            locale={locale}
            screenIndex={screenIndex}
            onSelect={(i) => {
              setScreenIndex(i);
              setSelectedId(null);
            }}
            onReorder={screenHandlers.onReorder}
            onAdd={screenHandlers.onAdd}
            onDuplicate={screenHandlers.onDuplicate}
            onDelete={screenHandlers.onDelete}
          />
          <div className="panel" style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <Canvas
              deck={deck}
              state={state}
              locale={locale}
              screenIndex={screenIndex}
              selectedId={selectedId}
              onSelect={screenHandlers.onSelect}
              onMoveElement={screenHandlers.onMoveElement}
            />
            <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 12 }}>
              {state.mode === "connected"
                ? "Connected canvas — drag elements across screen boundaries; exports crop each screen."
                : "Isolated mode — elements are clipped to their own screen on export."}
            </p>
          </div>
          <Inspector
            deck={deck}
            state={state}
            locale={locale}
            screen={screen}
            selectedId={selectedId}
            {...screenHandlers}
          />
        </div>
      ) : (
        <div className="panel" style={{ flex: 1, display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p>No {platform.toUpperCase()} deck yet.</p>
            <button className="primary" onClick={() => createDeck(platform)}>
              Create {platform === "ios" ? "iOS" : platform === "mac" ? "Mac" : "Android"} deck
            </button>
          </div>
        </div>
      )}

      {showExport && <ExportDialog state={state} onClose={() => setShowExport(false)} />}
    </main>
  );
}
