"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderDeckStrip } from "./CanvasRenderer";
import { canvasSize } from "@/lib/devices";
import { elementBox } from "@/lib/render";
import { safeMargin } from "@/lib/themes";
import { uploadCapture } from "@/lib/assets";
import type { Deck, ProjectState, ScreenElement, UploadedAsset } from "@/lib/types";

type ViewLayout = "seamless" | "spaced";
type ZoomMode = "fit" | "0.5" | "1";

const GAP = 56; // display px between panels in spaced view
const LS_VIEW = "kami-view";

interface Props {
  deck: Deck;
  state: ProjectState;
  locale: string;
  screenIndex: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMoveElement: (elId: string, x: number, y: number) => void;
  onBindAsset: (elId: string, assetId: string) => void;
  onAddAsset: (asset: UploadedAsset) => void;
}

/**
 * The canvas viewport. Renders the deck strip offscreen (pixel truth) and
 * presents it two ways: seamless (one continuous strip — exactly what
 * connected exports look like) or spaced (gapped panels, easier editing).
 * Spacing is presentation only; exports are unaffected.
 */
export default function Canvas({ deck, state, locale, screenIndex, selectedId, onSelect, onMoveElement, onBindAsset, onAddAsset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ id: string; startPX: number; startPY: number; elX: number; elY: number; raf: number } | null>(null);
  const [dropHover, setDropHover] = useState<string | null>(null);
  const [view, setView] = useState<ViewLayout>("seamless");
  const [zoom, setZoom] = useState<ZoomMode>("fit");
  const [wrapW, setWrapW] = useState(900);

  const { w: screenW, h: screenH } = canvasSize(deck.deviceId, deck.orientation);
  const connected = state.mode === "connected";
  const stripW = connected ? screenW * Math.max(1, deck.screens.length) : screenW;
  const panels = connected ? Math.max(1, deck.screens.length) : 1;
  const gap = view === "spaced" ? GAP : 0;
  const baseScale = 620 / screenH;
  const fitScale = Math.min(1, (wrapW - 32) / ((stripW + gap * (panels - 1)) * baseScale));
  const scale = baseScale * (zoom === "fit" ? fitScale : Number(zoom));
  const screenDisp = screenW * scale;
  const totalW = stripW * scale + gap * (panels - 1);
  const displayH = Math.round(screenH * scale);
  const coordOffset = connected ? 0 : screenIndex * screenW;

  // persist view prefs
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_VIEW) ?? "{}") as { view?: ViewLayout; zoom?: ZoomMode };
      if (saved.view) setView(saved.view);
      if (saved.zoom) setZoom(saved.zoom);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_VIEW, JSON.stringify({ view, zoom }));
    } catch { /* ignore */ }
  }, [view, zoom]);

  // track container width for fit zoom
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWrapW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** display-space x of panel i's left edge (CSS px) */
  const panelX = useCallback((i: number) => i * (screenDisp + gap), [screenDisp, gap]);

  /** strip coords → display coords (CSS px) */
  const stripToDisplay = useCallback(
    (stripX: number, stripY: number) => {
      const i = Math.min(panels - 1, Math.max(0, Math.floor(stripX / screenW)));
      const local = stripX - i * screenW;
      return { x: panelX(i) + local * scale, y: stripY * scale };
    },
    [panels, screenW, panelX, scale],
  );

  /** pointer event → strip coords (inverse of stripToDisplay) */
  function toStripCoords(e: { clientX: number; clientY: number; currentTarget: HTMLCanvasElement }) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const pitch = screenDisp + gap;
    let i = Math.floor(px / pitch);
    i = Math.min(panels - 1, Math.max(0, i));
    const local = px - panelX(i);
    return {
      x: coordOffset + i * screenW + Math.min(Math.max(local, 0), screenDisp) / scale,
      y: py / scale,
    };
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const strip = stripRef.current;
    if (!canvas || !strip) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(totalW * dpr);
    canvas.height = Math.round(displayH * dpr);
    canvas.style.width = `${Math.round(totalW)}px`;
    canvas.style.height = `${displayH}px`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";

    const margin = safeMargin(screenW);
    const screen = deck.screens[screenIndex];

    if (connected && gap > 0) {
      // spaced: draw each screen's slice into its own panel (clipped at edges)
      for (let i = 0; i < panels; i++) {
        const sx = i * screenW * (strip.width / stripW);
        const sw = screenW * (strip.width / stripW);
        const dx = panelX(i) * dpr;
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, 0, screenDisp * dpr, canvas.height);
        ctx.clip();
        ctx.drawImage(strip, sx, 0, sw, strip.height, dx, 0, Math.round(screenDisp * dpr), canvas.height);
        ctx.restore();
        // panel border
        ctx.strokeStyle = "rgba(124,146,255,0.45)";
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeRect(dx + 1, 1, screenDisp * dpr - 2, canvas.height - 2);
      }
    } else {
      ctx.drawImage(strip, 0, 0, canvas.width, canvas.height);
      if (connected) {
        ctx.strokeStyle = "rgba(124,146,255,0.30)";
        ctx.lineWidth = 1 * dpr;
        for (let i = 1; i < deck.screens.length; i++) {
          const x = Math.round(panelX(i) * dpr);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
      }
    }

    // selected screen outline
    const selPanel = connected ? screenIndex : 0;
    ctx.strokeStyle = "rgba(124,146,255,0.85)";
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(panelX(selPanel) * dpr + 1, 1, screenDisp * dpr - 2, canvas.height - 2);

    // selected element box (clipped to its origin panel in strip space)
    const sel = screen?.elements.find((e) => e.id === selectedId);
    if (sel) {
      const box = elementBox(sel, screenW, margin);
      const panelIdx = Math.min(panels - 1, Math.max(0, Math.floor(box.x / screenW)));
      const x0 = Math.max(box.x, panelIdx * screenW);
      const x1 = Math.min(box.x + box.w, (panelIdx + 1) * screenW);
      const tl = stripToDisplay(x0, box.y);
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 1.5 * dpr;
      ctx.strokeRect(tl.x * dpr, tl.y * dpr, (x1 - x0) * scale * dpr, box.h * scale * dpr);
    }

    // drop-target highlight
    if (dropHover) {
      const dev = screen?.elements.find((e) => e.id === dropHover);
      if (dev) {
        const b = elementBox(dev, screenW, margin);
        const tl = stripToDisplay(b.x, b.y);
        ctx.setLineDash([6 * dpr, 4 * dpr]);
        ctx.strokeStyle = "#FFD166";
        ctx.lineWidth = 2.5 * dpr;
        ctx.strokeRect(tl.x * dpr, tl.y * dpr, b.w * scale * dpr, b.h * scale * dpr);
        ctx.setLineDash([]);
        ctx.fillStyle = "#FFD166";
        ctx.font = `${Math.round(13 * dpr)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("drop to bind", tl.x * dpr + (b.w * scale * dpr) / 2, tl.y * dpr + (b.h * scale * dpr) / 2);
      }
    }
  }, [deck, state, screenIndex, selectedId, dropHover, connected, screenW, displayH, scale, gap, panels, totalW, panelX, stripToDisplay, screenIndex]);

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

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  function hitDevice(x: number, y: number): ScreenElement | null {
    const screen = deck.screens[screenIndex];
    if (!screen) return null;
    const margin = safeMargin(screenW);
    return (
      [...screen.elements]
        .sort((a, b) => b.z - a.z)
        .find((el) => {
          if (el.kind !== "device") return false;
          const b = elementBox(el, screenW, margin);
          return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
        }) ?? null
    );
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

  function onDragOverCanvas(e: React.DragEvent<HTMLCanvasElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const { x, y } = toStripCoords(e);
    const dev = hitDevice(x, y);
    if ((dev?.id ?? null) !== dropHover) setDropHover(dev?.id ?? null);
  }

  function onDragLeaveCanvas() {
    setDropHover(null);
  }

  async function onDropCanvas(e: React.DragEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setDropHover(null);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const { x, y } = toStripCoords(e);
    const dev = hitDevice(x, y);
    if (!dev) return;
    const asset = await uploadCapture(file);
    if (!asset) return;
    onAddAsset(asset);
    onBindAsset(dev.id, asset.id);
  }

  const btn = (active: boolean): React.CSSProperties =>
    active ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" } : {};

  return (
    <div ref={wrapRef}>
      <div className="row" style={{ justifyContent: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>View</span>
        <button style={{ fontSize: 12, padding: "3px 10px", ...btn(view === "seamless") }} onClick={() => setView("seamless")} title="Screens flush — exactly what connected exports look like">
          Seamless
        </button>
        <button style={{ fontSize: 12, padding: "3px 10px", ...btn(view === "spaced") }} onClick={() => setView("spaced")} title="Gapped panels for easier editing (visual only)">
          Spaced
        </button>
        <span style={{ width: 12 }} />
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Zoom</span>
        {(["fit", "0.5", "1"] as ZoomMode[]).map((z) => (
          <button key={z} style={{ fontSize: 12, padding: "3px 10px", ...btn(zoom === z) }} onClick={() => setZoom(z)}>
            {z === "fit" ? "Fit" : z === "0.5" ? "50%" : "100%"}
          </button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <canvas
          ref={canvasRef}
          style={{ cursor: dragRef.current ? "grabbing" : "default", display: "block", margin: "0 auto" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDragOver={onDragOverCanvas}
          onDragLeave={onDragLeaveCanvas}
          onDrop={onDropCanvas}
        />
      </div>
    </div>
  );
}
