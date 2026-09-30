"use client";

// Contextual controls for the selected element — the old right Inspector's
// element section, now living in the left tool dock's Properties panel.

import { isRtl, RTL_RULES } from "@/lib/locales";
import { safeMargin, TYPE_RAMP } from "@/lib/themes";
import { canvasSize, DEVICES } from "@/lib/devices";
import type { Deck, ProjectState, Screen, ScreenElement } from "@/lib/types";

interface Props {
  deck: Deck;
  state: ProjectState;
  locale: string;
  screen: Screen;
  selectedId: string;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<ScreenElement>) => void;
  onDeleteElement: (id: string) => void;
}

export default function ElementProperties({ deck, state, locale, screen, selectedId, onSelect, onUpdateElement, onDeleteElement }: Props) {
  const selected = screen.elements.find((e) => e.id === selectedId) ?? null;
  if (!selected) return null;
  const rtl = isRtl(locale);
  const margin = safeMargin(canvasSize(deck.deviceId, deck.orientation).w);

  function num(value: string): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* stacking order */}
      <section>
        <label>Elements on this screen</label>
        <div style={{ display: "grid", gap: 4 }}>
          {[...screen.elements].sort((a, b) => b.z - a.z).map((el) => (
            <div key={el.id} className="spread" style={{ border: `1px solid ${el.id === selectedId ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "3px 8px" }}>
              <button
                style={{ border: "none", background: "transparent", textAlign: "left", flex: 1, padding: 0, fontSize: 12 }}
                onClick={() => onSelect(el.id)}
              >
                {el.kind === "text"
                  ? `${el.role ?? "text"}: ${(el.role === "sticker" ? (el.text ?? "") : (el.locales?.[locale] ?? el.text ?? "")).slice(0, 18)}`
                  : el.kind === "device"
                    ? `device (${el.deviceId ?? deck.deviceId})`
                    : el.kind === "shape"
                      ? `shape (${el.shape ?? "rect"})`
                      : el.kind}
              </button>
              <span style={{ display: "flex", gap: 2 }}>
                <button title="Raise" onClick={() => onUpdateElement(el.id, { z: el.z + 1 })}>↑</button>
                <button title="Lower" onClick={() => onUpdateElement(el.id, { z: Math.max(0, el.z - 1) })}>↓</button>
                <button title="Delete" onClick={() => onDeleteElement(el.id)}>✕</button>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* selected element controls */}
      <section style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <label>Selected: {selected.kind}{selected.role ? ` (${selected.role})` : ""}</label>

        {(selected.kind === "device" || selected.kind === "image") && (
          <>
            <label>Screenshot</label>
            <select value={selected.screenshotId ?? ""} onChange={(e) => onUpdateElement(selected.id, { screenshotId: e.target.value || undefined })}>
              <option value="">— none —</option>
              {state.assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {(a.label ?? a.file.split("/").pop()) + (a.width ? ` · ${a.width}×${a.height}` : "")}
                </option>
              ))}
            </select>
          </>
        )}

        {selected.kind === "device" && (
          <>
            <label>Device</label>
            <select value={selected.deviceId ?? deck.deviceId} onChange={(e) => onUpdateElement(selected.id, { deviceId: e.target.value })}>
              {DEVICES.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <label style={{ marginTop: 8 }}>Frame zoom ({(selected.screenScale ?? 1).toFixed(2)}×)</label>
            <input type="range" min={0.5} max={2} step={0.01} value={selected.screenScale ?? 1} onChange={(e) => onUpdateElement(selected.id, { screenScale: num(e.target.value) })} />
            <div className="row">
              <div style={{ flex: 1 }}>
                <label>Pan X</label>
                <input type="range" min={-1} max={1} step={0.02} value={selected.screenOffsetX ?? 0} onChange={(e) => onUpdateElement(selected.id, { screenOffsetX: num(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Pan Y</label>
                <input type="range" min={-1} max={1} step={0.02} value={selected.screenOffsetY ?? 0} onChange={(e) => onUpdateElement(selected.id, { screenOffsetY: num(e.target.value) })} />
              </div>
            </div>
          </>
        )}

        {(selected.kind === "device" || selected.kind === "shape" || selected.kind === "image") && (
          <div className="row">
            <div style={{ flex: 1 }}>
              <label>W</label>
              <input type="number" value={selected.w ?? 0} onChange={(e) => onUpdateElement(selected.id, { w: num(e.target.value) })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>H</label>
              <input type="number" value={selected.h ?? 0} onChange={(e) => onUpdateElement(selected.id, { h: num(e.target.value) })} />
            </div>
          </div>
        )}

        {selected.kind === "shape" && (
          <>
            <label>Shape</label>
            <select value={selected.shape ?? "rect"} onChange={(e) => onUpdateElement(selected.id, { shape: e.target.value as ScreenElement["shape"] })}>
              <option value="rect">rect</option>
              <option value="ellipse">ellipse</option>
              <option value="ring">ring</option>
            </select>
            <label style={{ marginTop: 8 }}>Fill</label>
            <input value={selected.fill ?? ""} onChange={(e) => onUpdateElement(selected.id, { fill: e.target.value })} placeholder="theme accent if empty" />
          </>
        )}

        {selected.kind === "text" && selected.role !== "sticker" && (
          <>
            <label>Role</label>
            <select value={selected.role ?? "caption"} onChange={(e) => onUpdateElement(selected.id, { role: e.target.value as ScreenElement["role"] })}>
              {Object.keys(TYPE_RAMP).filter((r) => r !== "sticker").map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <label style={{ marginTop: 8 }}>Align</label>
            <select value={selected.align ?? "center"} onChange={(e) => onUpdateElement(selected.id, { align: e.target.value as ScreenElement["align"] })}>
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
            </select>
            <label style={{ marginTop: 8 }}>Color</label>
            <input value={selected.color ?? ""} onChange={(e) => onUpdateElement(selected.id, { color: e.target.value })} placeholder="theme text if empty" />
          </>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <label>X</label>
            <input type="number" value={selected.x} onChange={(e) => onUpdateElement(selected.id, { x: num(e.target.value) ?? 0 })} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Y</label>
            <input type="number" value={selected.y} onChange={(e) => onUpdateElement(selected.id, { y: num(e.target.value) ?? 0 })} />
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label>Font size</label>
            <input type="number" value={selected.fontSize ?? ""} onChange={(e) => onUpdateElement(selected.id, { fontSize: num(e.target.value) })} placeholder="auto" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Rotation°</label>
            <input type="number" value={selected.rotation ?? 0} onChange={(e) => onUpdateElement(selected.id, { rotation: num(e.target.value) })} />
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label>Opacity</label>
            <input type="number" min={0} max={1} step={0.05} value={selected.opacity ?? 1} onChange={(e) => onUpdateElement(selected.id, { opacity: num(e.target.value) })} />
          </div>
        </div>

        {rtl && (
          <div style={{ fontSize: 11, background: "var(--panel-2)", borderRadius: 8, padding: 8, color: "var(--text-dim)", marginTop: 10 }}>
            <strong style={{ color: "var(--text)" }}>RTL ({locale})</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
              {RTL_RULES.slice(0, 2).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        <p style={{ fontSize: 11, color: "var(--text-dim)" }}>
          Strip coords — arrows nudge (Shift = 40px), Delete removes. Text safe margin: {margin}px.
        </p>
      </section>
    </div>
  );
}
