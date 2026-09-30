"use client";

import { useCallback, useEffect, useRef } from "react";
import { renderDeckStrip } from "./CanvasRenderer";
import { canvasSize } from "@/lib/devices";
import { elementBox } from "@/lib/render";
import { safeMargin } from "@/lib/themes";
import type { Deck, ProjectState } from "@/lib/types";

interface Props {
  deck: Deck;
  state: ProjectState;
  locale: string;
  screenIndex: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveElement: (elId: string, x: number, y: number) => void;
}

/**
 * Shows the whole strip (connected mode) or one screen (isolated mode).
 * Elements are dragged in canvas coordinates; x/y are strip coordinates, so
 * elements glide across screen boundaries naturally.
 */
export default function Canvas({ deck, state, locale, screenIndex, selectedId, onSelect, onMoveElement }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ id: string; startPX: number; startPY: number; elX: number; elY: number; raf: number } | null>(null);

  const { w: screenW, h: screenH } = canvasSize(deck.deviceId, deck.orientation);
  const connected = state.mode === "connected";
  const stripW = connected ? screenW * Math.max(1, deck.screens.length) : screenW;
  const displayH = 620;
  const scale = displayH / screenH;
  const displayW = Math.round(stripW * scale);
  const coordOffset = connected ? 0 : screenIndex * screenW;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const strip = stripRef.current;
    if (!canvas || !strip) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(strip, 0, 0, canvas.width, canvas.height);

    // screen separators (connected preview only)
    if (connected) {
      ctx.strokeStyle = "rgba(124,146,255,0.30)";
      ctx.lineWidth = 1 * dpr;
      for (let i = 1; i < deck.screens.length; i++) {
        const x = Math.round(i * screenW * scale * dpr);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }

    // selected screen outline
    const selScreenX = (connected ? screenIndex * screenW : 0) * scale * dpr;
    ctx.strokeStyle = "rgba(124,146,255,0.85)";
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(selScreenX + 1, 1, screenW * scale * dpr - 2, canvas.height - 2);

    // selection box for the selected element
    const margin = safeMargin(screenW);
    const screen = deck.screens[screenIndex];
    const sel = screen?.elements.find((e) => e.id === selectedId);
    if (sel) {
      const box = elementBox(sel, screenW, margin);
      const x = (box.x - coordOffset) * scale * dpr;
      const y = box.y * scale * dpr;
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeRect(x, y, box.w * scale * dpr, box.h * scale * dpr);
    }
  }, [deck, state, screenIndex, selectedId, connected, screenW, displayW, displayH, scale, coordOffset]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const strip = await renderDeckStrip(deck, state, locale, connected ? undefined : screenIndex);
      if (cancelled) return;
      stripRef.current = strip;
      draw();
    })();
    return () => {
      cancelled = true;
    };
  }, [deck, state, locale, screenIndex, connected, draw]);

  // redraw on dpr/resize
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  function toStripCoords(e: React.PointerEvent): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * stripW + coordOffset,
      y: ((e.clientY - rect.top) / rect.height) * screenH,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = toStripCoords(e);
    const screen = deck.screens[screenIndex];
    if (!screen) return;
    const margin = safeMargin(screenW);
    const hit = [...screen.elements]
      .sort((a, b) => b.z - a.z)
      .find((el) => {
        const b = elementBox(el, screenW, margin);
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
      });
    if (hit) {
      onSelect(hit.id);
      dragRef.current = { id: hit.id, startPX: x, startPY: y, elX: hit.x, elY: hit.y, raf: 0 };
      e.currentTarget.setPointerCapture(e.pointerId);
    } else {
      onSelect(null);
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const { x, y } = toStripCoords(e);
    const nx = Math.round(drag.elX + (x - drag.startPX));
    const ny = Math.round(drag.elY + (y - drag.startPY));
    if (drag.raf) cancelAnimationFrame(drag.raf);
    drag.raf = requestAnimationFrame(() => onMoveElement(drag.id, nx, ny));
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (drag) {
      if (drag.raf) cancelAnimationFrame(drag.raf);
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div className="canvas-wrap" style={{ overflowX: "auto" }}>
      <canvas
        ref={canvasRef}
        style={{ cursor: dragRef.current ? "grabbing" : "default", display: "block", margin: "0 auto" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
