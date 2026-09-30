"use client";

import { useEffect, useRef, useState } from "react";
import { renderScreenThumb } from "./CanvasRenderer";
import { deckLabel } from "@/lib/devices";
import type { Deck, ProjectState } from "@/lib/types";

interface Props {
  deck: Deck;
  state: ProjectState;
  locale: string;
  screenIndex: number;
  onSelect: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onAdd: () => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function Sidebar({ deck, state, locale, screenIndex, onSelect, onReorder, onAdd, onDuplicate, onDelete }: Props) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const seq = ++seqRef.current;
    let alive = true;
    (async () => {
      const next: Record<string, string> = {};
      for (let i = 0; i < deck.screens.length; i++) {
        const s = deck.screens[i];
        try {
          next[s.id] = await renderScreenThumb(deck, state, locale, i, 120);
        } catch {
          next[s.id] = "";
        }
        if (!alive || seq !== seqRef.current) return;
        setThumbs((t) => ({ ...t, [s.id]: next[s.id] }));
      }
    })();
    return () => {
      alive = false;
    };
  }, [deck, state, locale]);

  return (
    <aside className="panel sidebar">
      <div className="spread" style={{ padding: "10px 12px" }}>
        <strong>{deckLabel(deck.deviceId, deck.orientation)}</strong>
        <button className="primary" onClick={onAdd} title="Add screen">+ Screen</button>
      </div>
      <div style={{ overflowY: "auto", padding: "0 8px 8px" }}>
        {deck.screens.map((screen, i) => (
          <div
            key={screen.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== i) onReorder(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onClick={() => onSelect(i)}
            style={{
              border: `1px solid ${i === screenIndex ? "var(--accent)" : overIndex === i ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 10,
              padding: 6,
              marginBottom: 8,
              cursor: "grab",
              opacity: dragIndex === i ? 0.4 : 1,
              background: overIndex === i && dragIndex !== null && dragIndex !== i ? "var(--panel-2)" : "transparent",
            }}
          >
            {thumbs[screen.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbs[screen.id]} alt={`Screen ${i + 1}`} style={{ width: "100%", borderRadius: 6, display: "block" }} />
            ) : (
              <div style={{ aspectRatio: "9/19", borderRadius: 6, background: "var(--panel-2)" }} />
            )}
            <div className="spread" style={{ marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {i + 1}. {screen.headline?.slice(0, 18) || "Untitled"}
              </span>
              <span>
                <button title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(i); }}>⧉</button>{" "}
                <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(i); }}>✕</button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
