import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = path.join(process.cwd(), "public", "screenshots", "uploaded");
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Small non-crypto hash to name files: <hash>.png keeps paths stable and
 *  git-friendly, and re-uploading the same image is a no-op. */
function hash32(buf: Uint8Array, name: string): string {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < buf.length; i++) {
    h1 = ((h1 << 5) + h1 + buf[i]) | 0;
    h2 = ((h2 << 7) + h2 + buf[i] + i) | 0;
  }
  const n = name.replace(/\.[^.]+$/, "").length + buf.length;
  return `${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}${n.toString(36)}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "expected multipart field 'file'" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `unsupported type: ${file.type}` }, { status: 415 });
  }
  const buf = new Uint8Array(await file.arrayBuffer());
  const hash = hash32(buf, file.name);
  const ext = EXT[file.type];
  const filename = `${hash}.${ext}`;
  const relPath = `public/screenshots/uploaded/${filename}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    await fs.access(path.join(UPLOAD_DIR, filename));
  } catch {
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  }

  return NextResponse.json({
    id: hash,
    file: relPath,
    width: Number(form.get("width")) || 0,
    height: Number(form.get("height")) || 0,
    addedAt: new Date().toISOString(),
  });
}
