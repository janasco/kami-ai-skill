"use client";

import { useRef, useState } from "react";
import { HEADLINE_FORMULAS, LIMITS } from "@/lib/headlines";
import { isRtl, RTL_RULES } from "@/lib/locales";
import { probeImage } from "@/lib/assets";
import { safeMargin, TYPE_RAMP } from "@/lib/themes";
import { canvasSize, DEVICES } from "@/lib/devices";
import type { Deck, ProjectState, Screen, ScreenElement, UploadedAsset } from "@/lib/types";

interface Props {
  deck: Deck;
  state: ProjectState;
  locale: string;
  screen: Screen;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateScreen: (patch: Partial<Screen>) => void;
  onUpdateElement: (id: string, patch: Partial<ScreenElement>) => void;
  onAddElement: (kind: ScreenElement["kind"]) => void;
  onDeleteElement: (id: string) => void;
  onAddAsset: (asset: UploadedAsset) => void;
}

function copyFor(el: ScreenElement, locale: string, fallback: string): string {
  return el.locales?.[locale] ?? el.text ?? el.locales?.[fallback] ?? "";
}

export default function Inspector({ deck, state, locale, screen, selectedId, onSelect, onUpdateScreen, onUpdateElement, onAddElement, onDeleteElement, onAddAsset }: Props) {
  const selected = screen.elements.find((e) => e.id === selectedId) ?? null;
  const headlineEl = screen.elements.find((e) => e.kind === "text" && e.role === "headline");
  const captionEl = screen.elements.find((e) => e.kind === "text" && e.role === "caption");
  const [showIdeas, setShowIdeas] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const rtl = isRtl(locale);
  const margin = safeMargin(canvasSize(deck.deviceId, deck.orientation).w);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const { buf, w, h, hash } = await probeImage(file);
        const fd = new FormData();
        fd.append("file", new Blob([buf], { type: file.type }), file.name);
        fd.append("width", String(w));
        fd.append("height", String(h));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const asset = (await res.json()) as UploadedAsset;
          onAddAsset({ ...asset, width: w, height: h, label: file.name });
        }
      } catch {
        // skip unreadable files
      }
    }
  }

  function num(value: string): number | undefined {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  return (
    <aside className="panel inspector">
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
        <strong>Inspector</strong>
      </div>
      <div style={{ overflowY: "auto", padding: 12, display: "grid", gap: 14 }}>
        {rtl && (
          <div style={{ fontSize: 12, background: "var(--panel-2)", borderRadius: 8, padding: 8, color: "var(--text-dim)" }}>
            <strong style={{ color: "var(--text)" }}>RTL locale ({locale})</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
              {RTL_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Screen copy */}
        <section>
          <div className="spread">
            <label>Headline {headlineEl && <span style={{ opacity: 0.6 }}>({copyFor(headlineEl, locale, state.fallbackLocale).length}/{LIMITS.headline})</span>}</label>
            <button onClick={() => setShowIdeas((v) => !v)} title="Copy ideas">💡 Ideas</button>
          </div>
          {showIdeas && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, marginBottom: 6, maxHeight: 220, overflowY: "auto" }}>
              {HEADLINE_FORMULAS.map((f) => (
                <button
                  key={f.id}
                  style={{ display: "block", width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}
                  onClick={() => {
                    if (headlineEl) onUpdateElement(headlineEl.id, { text: f.example, locales: { ...headlineEl.locales, [locale]: f.example } });
                    onUpdateScreen({ headline: f.example });
                    setShowIdeas(false);
                  }}
                >
                  <strong>{f.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{f.example}</div>
                </button>
              ))}
            </div>
          )}
          <input
            value={headlineEl ? copyFor(headlineEl, locale, state.fallbackLocale) : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (headlineEl) onUpdateElement(headlineEl.id, { text: v, locales: { ...headlineEl.locales, [locale]: v } });
              onUpdateScreen({ headline: v });
            }}
            maxLength={80}
            placeholder="Big benefit, ≤ 40 chars"
          />
          <div style={{ height: 8 }} />
          <label>Caption {captionEl && <span style={{ opacity: 0.6 }}>({copyFor(captionEl, locale, state.fallbackLocale).length}/{LIMITS.caption})</span>}</label>
          <textarea
            rows={2}
            value={captionEl ? copyFor(captionEl, locale, state.fallbackLocale) : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (captionEl) onUpdateElement(captionEl.id, { text: v, locales: { ...captionEl.locales, [locale]: v } });
              onUpdateScreen({ caption: v });
            }}
            maxLength={140}
            placeholder="Supporting line, ≤ 90 chars"
          />
        </section>

        {/* Element stacking */}
        <section>
          <div className="spread">
            <label>Elements</label>
            <span>
              <button onClick={() => onAddElement("text")}>+ Text</button>{" "}
              <button onClick={() => onAddElement("device")}>+ Device</button>{" "}
              <button onClick={() => onAddElement("shape")}>+ Shape</button>
            </span>
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {[...screen.elements].sort((a, b) => b.z - a.z).map((el) => (
              <div key={el.id} className="spread" style={{ border: `1px solid ${el.id === selectedId ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, padding: "4px 8px" }}>
                <button
                  style={{ border: "none", background: "transparent", textAlign: "left", flex: 1, padding: 0 }}
                  onClick={() => onSelect(el.id)}
                >
                  {el.kind === "text" ? `${el.role ?? "text"}: ${(el.locales?.[locale] ?? el.text ?? "").slice(0, 22)}` : el.kind === "device" ? `device (${el.deviceId ?? deck.deviceId})` : el.kind}
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

        {/* Selected element */}
        {selected && (
          <section style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <label>Selected: {selected.kind}{selected.role ? ` (${selected.role})` : ""}</label>

            {(selected.kind === "device" || selected.kind === "image") && (
              <>
                <label>Screenshot</label>
                <select
                  value={selected.screenshotId ?? ""}
                  onChange={(e) => onUpdateElement(selected.id, { screenshotId: e.target.value || undefined })}
                >
                  <option value="">— none —</option>
                  {state.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {(a.label ?? a.file.split("/").pop()) + (a.width ? ` · ${a.width}×${a.height}` : "")}
                    </option>
                  ))}
                </select>
                <div style={{ height: 8 }} />
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
                <div style={{ height: 8 }} />
                <label>Frame zoom ({(selected.screenScale ?? 1).toFixed(2)}×)</label>
                <input type="range" min={0.5} max={2} step={0.01} value={selected.screenScale ?? 1} onChange={(e) => onUpdateElement(selected.id, { screenScale: num(e.target.value) })} />
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <label>Pan X ({selected.screenOffsetX ?? 0})</label>
                    <input type="range" min={-1} max={1} step={0.02} value={selected.screenOffsetX ?? 0} onChange={(e) => onUpdateElement(selected.id, { screenOffsetX: num(e.target.value) })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Pan Y ({selected.screenOffsetY ?? 0})</label>
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
                <div style={{ height: 8 }} />
                <label>Fill</label>
                <input value={selected.fill ?? ""} onChange={(e) => onUpdateElement(selected.id, { fill: e.target.value })} placeholder="theme accent if empty" />
                <div style={{ height: 8 }} />
              </>
            )}

            {selected.kind === "text" && (
              <>
                <label>Role</label>
                <select value={selected.role ?? "caption"} onChange={(e) => onUpdateElement(selected.id, { role: e.target.value as ScreenElement["role"] })}>
                  {Object.keys(TYPE_RAMP).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div style={{ height: 8 }} />
                <label>Font size ({selected.fontSize ?? "auto"})</label>
                <input type="number" value={selected.fontSize ?? ""} onChange={(e) => onUpdateElement(selected.id, { fontSize: num(e.target.value) })} placeholder="theme ramp" />
                <div style={{ height: 8 }} />
                <label>Align</label>
                <select value={selected.align ?? "center"} onChange={(e) => onUpdateElement(selected.id, { align: e.target.value as ScreenElement["align"] })}>
                  <option value="left">left</option>
                  <option value="center">center</option>
                  <option value="right">right</option>
                </select>
                <div style={{ height: 8 }} />
                <label>Color</label>
                <input value={selected.color ?? ""} onChange={(e) => onUpdateElement(selected.id, { color: e.target.value })} placeholder="theme text if empty" />
                <div style={{ height: 8 }} />
              </>
            )}

            <div className="row">
              <div style={{ flex: 1 }}>
                <label>X</label>
                <input type="number" value={selected.x} onChange={(e) => onUpdateElement(selected.id, { x: num(e.target.value) ?? 0 })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Y</label>
                <input type="number" value={selected.y} onChange={(e) => onUpdateElement(selected.id, { y: num(e.target.value) ?? 0 })} />
              </div>
            </div>
            <div style={{ height: 8 }} />
            <div className="row">
              <div style={{ flex: 1 }}>
                <label>Rotation°</label>
                <input type="number" value={selected.rotation ?? 0} onChange={(e) => onUpdateElement(selected.id, { rotation: num(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Opacity</label>
                <input type="number" min={0} max={1} step={0.05} value={selected.opacity ?? 1} onChange={(e) => onUpdateElement(selected.id, { opacity: num(e.target.value) })} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-dim)" }}>
              Strip coords — x &gt; {screen.id && deck.screens.length > 1 ? "one screen width" : "canvas width"} bleeds onto the next screen (connected mode only). Text safe margin: {margin}px.
            </p>
          </section>
        )}

        {/* Uploads */}
        <section style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <label>Upload captures</label>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => void handleFiles(e.target.files)} />
          <button onClick={() => fileRef.current?.click()}>Choose files…</button>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
            Saved to public/screenshots/uploaded/&lt;hash&gt;.png — git-trackable, deduped by content.
          </div>
        </section>
      </div>
    </aside>
  );
}
