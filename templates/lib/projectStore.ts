import { promises as fs } from "fs";
import path from "path";
import { migrate, CURRENT_SCHEMA_VERSION } from "./migrations";
import type { ProjectState, SavePayload } from "./types";

export const PROJECT_FILE = "app-store-screenshots.json";

function projectPath(): string {
  return path.join(process.cwd(), PROJECT_FILE);
}

export async function readProject(): Promise<ProjectState | null> {
  try {
    const raw = JSON.parse(await fs.readFile(projectPath(), "utf8")) as Record<string, unknown>;
    return migrate(raw);
  } catch {
    return null; // no file yet or unreadable — caller decides defaults
  }
}

export async function writeProject(payload: SavePayload): Promise<
  { ok: true; state: ProjectState } | { ok: false; reason: "revision-conflict"; diskRevision: number }
> {
  const disk = await readProject();
  const diskRevision = disk?.revision ?? 0;
  if (payload.clientRevision >= 0 && payload.clientRevision < diskRevision) {
    return { ok: false, reason: "revision-conflict", diskRevision };
  }
  const state: ProjectState = {
    ...payload.state,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: diskRevision + 1,
    updatedAt: new Date().toISOString(),
  };
  const tmp = projectPath() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(state, null, 2) + "\n", "utf8");
  await fs.rename(tmp, projectPath()); // atomic swap
  return { ok: true, state };
}

/** Fresh scaffold state with one starter deck per platform. */
export function emptyState(): ProjectState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: 0,
    updatedAt: new Date().toISOString(),
    appName: "My App",
    fallbackLocale: "en-US",
    locales: ["en-US"],
    defaultStyleId: "midnight-glow",
    mode: "isolated",
    decks: [],
    assets: [],
  };
}
