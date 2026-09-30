// Client-side helpers for uploaded captures.
import type { UploadedAsset } from "./types";

/** Short djb2-style hash — enough to dedupe identical uploads. */
export function shortHash(buf: ArrayBuffer, name: string): string {
  const bytes = new Uint8Array(buf);
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < bytes.length; i++) {
    h1 = ((h1 << 5) + h1 + bytes[i]) | 0;
    h2 = ((h2 << 7) + h2 + bytes[i] + i) | 0;
  }
  const n = (name.replace(/\.[^.]+$/, "") + bytes.length).length;
  return `${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}${n.toString(36)}`;
}

export async function probeImage(file: File): Promise<{ buf: ArrayBuffer; w: number; h: number; hash: string }> {
  const buf = await file.arrayBuffer();
  const blob = new Blob([buf], { type: file.type });
  const bmp = await createImageBitmap(blob);
  const hash = shortHash(buf, file.name);
  const out = { buf, w: bmp.width, h: bmp.height, hash };
  bmp.close();
  return out;
}

/** Draw a capture into a frame box with cover-fit + pan/zoom controls. */
export function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  box: { x: number; y: number; w: number; h: number },
  scale = 1,
  offsetX = 0,
  offsetY = 0,
) {
  const cover = Math.max(box.w / img.width, box.h / img.height) * scale;
  const dw = img.width * cover;
  const dh = img.height * cover;
  const dx = box.x + (box.w - dw) / 2 + offsetX * (dw - box.w) * 0.5;
  const dy = box.y + (box.h - dh) / 2 + offsetY * (dh - box.h) * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function assetUrl(file: string): string {
  return "/" + file.replace(/^public\//, "");
}

/** Upload a capture to /api/upload and return the registered asset. */
export async function uploadCapture(file: File): Promise<UploadedAsset | null> {
  try {
    const { buf, w, h } = await probeImage(file);
    const fd = new FormData();
    fd.append("file", new Blob([buf], { type: file.type }), file.name);
    fd.append("width", String(w));
    fd.append("height", String(h));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const uploaded = (await res.json()) as UploadedAsset;
    return { ...uploaded, width: w, height: h, label: file.name };
  } catch {
    return null;
  }
}
