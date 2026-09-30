import { NextResponse } from "next/server";
import { readProject, writeProject, emptyState } from "@/lib/projectStore";
import type { SavePayload } from "@/lib/types";

export async function GET() {
  const state = (await readProject()) ?? emptyState();
  return NextResponse.json({ state });
}

export async function POST(req: Request) {
  let body: SavePayload;
  try {
    body = (await req.json()) as SavePayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body?.state || typeof body.clientRevision !== "number") {
    return NextResponse.json({ error: "expected { state, clientRevision }" }, { status: 400 });
  }
  const result = await writeProject(body);
  if (!result.ok) {
    return NextResponse.json(
      { error: "revision-conflict", diskRevision: result.diskRevision },
      { status: 409 },
    );
  }
  return NextResponse.json({ state: result.state });
}
