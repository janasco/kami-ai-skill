"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TEMPLATES, renderTemplateScreens, type DeckTemplate } from "@/lib/templates";
import type { PlatformId } from "@/lib/types";

interface Props {
  onPick: (t: DeckTemplate) => void;
  onClose: () => void;
}

const FILTERS: { id: PlatformId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ios", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "mac", label: "Mac" },
];

const THUMB_H = 300; // big slide height
const GAP = 10;

/**
 * Vertical gallery: one template per row as a photo slider — large slides in
 * a scroll-snap strip so neighboring screens peek in from the edges.
 * ‹ › advance one screen; dots jump. Rows lazy-render their slides via
 * IntersectionObserver, one template per pass.
 */
export default function TemplateGallery({ onPick, onClose }: Props) {
  const [filter, setFilter] = useState<PlatformId | "all">("all");
  const [strips, setStrips] = useState<Record<string, string[]>>({});
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(
    () => (filter === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.platform === filter)),
    [filter],
  );

  function markVisible(id: string) {
    setVisible((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      for (const t of list) {
        if (!alive) return;
        if (!visible.has(t.id) || strips[t.id]) continue;
        try {
          const urls = await renderTemplateScreens(t);
          if (!alive) return;
          setStrips((prev) => ({ ...prev, [t.id]: urls }));
        } catch {
          if (!alive) return;
          setStrips((prev) => ({ ...prev, [t.id]: [] }));
        }
        return; // one per pass
      }
    })();
    return () => {
      alive = false;
    };
  }, [list, visible, strips]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 90, display: "grid", placeItems: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{ width: "min(1020px, 96vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spread" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="row">
            <strong style={{ fontSize: 15 }}>Deck templates</strong>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              {TEMPLATES.length} complete canvas designs — slide through every screen
            </span>
          </div>
          <button onClick={onClose}>✕ Close</button>
        </div>

        <div className="row" style={{ padding: "10px 18px", gap: 6 }}>
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? "primary" : ""} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ overflowY: "auto", padding: "4px 18px 18px", display: "grid", gap: 14 }}>
          {list.map((t) => (
            <GalleryRow
              key={t.id}
              t={t}
              screens={strips[t.id]}
              busy={busy === t.id}
              onVisible={markVisible}
              onOpen={() => {
                setBusy(t.id);
                onPick(t);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  t: DeckTemplate;
  screens: string[] | undefined;
  busy: boolean;
  onVisible: (id: string) => void;
  onOpen: () => void;
}

function GalleryRow({ t, screens, busy, onVisible, onOpen }: RowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seenRef.current) {
            seenRef.current = true;
            onVisible(t.id);
            io.disconnect();
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.id]);

  const total = t.seeds.length;
  const idx = Math.min(index, total - 1);

  /** slide pitch = slide width + gap, measured live */
  function pitch(): number {
    const img = trackRef.current?.querySelector("img");
    return img ? img.getBoundingClientRect().width + GAP : 200;
  }

  function goTo(i: number) {
    const clamped = Math.max(0, Math.min(total - 1, i));
    setIndex(clamped);
    trackRef.current?.scrollTo({ left: clamped * pitch(), behavior: "smooth" });
  }

  return (
    <div
      ref={rootRef}
      className="panel"
      style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, cursor: busy ? "wait" : "pointer", minWidth: 0, maxWidth: "100%" }}
      onClick={onOpen}
      role="button"
    >
      <div className="spread">
        <strong style={{ fontSize: 15 }}>{t.name}</strong>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {t.platform === "ios" ? "iOS" : t.platform === "mac" ? "Mac" : "Android"} · {total} screens · {t.vibe}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          title="Previous screen"
          style={{ fontSize: 20, width: 40, height: THUMB_H + 8, maxWidth: 40, padding: 0, flexShrink: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            goTo(idx - 1);
          }}
        >
          ‹
        </button>

        <div
          ref={trackRef}
          onScroll={(e) => {
            const i = Math.round(e.currentTarget.scrollLeft / pitch());
            setIndex(Math.max(0, Math.min(total - 1, i)));
          }}
          style={{
            display: "flex",
            gap: GAP,
            overflowX: "auto",
            flex: 1,
            minWidth: 0, // allow the flex item to shrink below content width
            scrollSnapType: "x mandatory",
            paddingBottom: 4,
            scrollbarWidth: "none",
          }}
        >
          {screens?.length
            ? screens.map((url, i) => (
                <div
                  key={i}
                  style={{ scrollSnapAlign: "start", flexShrink: 0, position: "relative" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${t.name} screen ${i + 1}`}
                    draggable={false}
                    style={{ height: THUMB_H, borderRadius: 8, display: "block", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      fontSize: 10,
                      borderRadius: 6,
                      padding: "1px 6px",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
              ))
            : Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: THUMB_H,
                    aspectRatio: t.platform === "mac" ? "16/10" : "9/19",
                    borderRadius: 8,
                    background: "var(--panel-2)",
                    flexShrink: 0,
                    scrollSnapAlign: "start",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-dim)",
                    fontSize: 13,
                  }}
                >
                  …
                </div>
              ))}
        </div>

        <button
          title="Next screen"
          style={{ fontSize: 20, width: 40, height: THUMB_H + 8, maxWidth: 40, padding: 0, flexShrink: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            goTo(idx + 1);
          }}
        >
          ›
        </button>
      </div>

      <div className="row" style={{ justifyContent: "center", gap: 10 }}>
        <div className="row" style={{ gap: 5 }}>
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              title={`Screen ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              style={{
                width: i === idx ? 22 : 8,
                height: 8,
                padding: 0,
                borderRadius: 4,
                background: i === idx ? "var(--accent)" : "var(--border)",
                transition: "width 120ms",
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
          {idx + 1} / {total}
        </span>
      </div>
    </div>
  );
}
