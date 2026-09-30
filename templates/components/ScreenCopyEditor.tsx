"use client";

// Screen copy editor — headline/caption for the current screen, with the
// Copy ideas formula menu. Lives in the Text tool panel.

import { useState } from "react";
import { HEADLINE_FORMULAS, LIMITS } from "@/lib/headlines";
import type { ProjectState, Screen, ScreenElement } from "@/lib/types";

interface Props {
  state: ProjectState;
  locale: string;
  screen: Screen;
  onUpdateScreen: (patch: Partial<Screen>) => void;
  onUpdateElement: (id: string, patch: Partial<ScreenElement>) => void;
}

function copyFor(el: ScreenElement, locale: string, fallback: string): string {
  return el.locales?.[locale] ?? el.text ?? el.locales?.[fallback] ?? "";
}

export default function ScreenCopyEditor({ state, locale, screen, onUpdateScreen, onUpdateElement }: Props) {
  const headlineEl = screen.elements.find((e) => e.kind === "text" && e.role === "headline");
  const captionEl = screen.elements.find((e) => e.kind === "text" && e.role === "caption");
  const [showIdeas, setShowIdeas] = useState(false);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div className="spread">
        <label style={{ marginBottom: 0 }}>
          Headline{" "}
          {headlineEl && <span style={{ opacity: 0.6 }}>({copyFor(headlineEl, locale, state.fallbackLocale).length}/{LIMITS.headline})</span>}
        </label>
        <button onClick={() => setShowIdeas((v) => !v)} title="Copy ideas">💡 Ideas</button>
      </div>
      {showIdeas && (
        <div style={{ border: "1px solid var(--border)", borderRadius: 8, maxHeight: 200, overflowY: "auto" }}>
          {HEADLINE_FORMULAS.map((f) => (
            <button
              key={f.id}
              style={{ display: "block", width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0, padding: "6px 10px" }}
              onClick={() => {
                if (headlineEl) onUpdateElement(headlineEl.id, { text: f.example, locales: { ...headlineEl.locales, [locale]: f.example } });
                onUpdateScreen({ headline: f.example });
                setShowIdeas(false);
              }}
            >
              <strong style={{ fontSize: 12 }}>{f.name}</strong>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{f.example}</div>
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
      <label>
        Caption{" "}
        {captionEl && <span style={{ opacity: 0.6 }}>({copyFor(captionEl, locale, state.fallbackLocale).length}/{LIMITS.caption})</span>}
      </label>
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
      {locale !== state.fallbackLocale && (
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Editing {locale} — falls back to {state.fallbackLocale} when empty.</div>
      )}
    </div>
  );
}
