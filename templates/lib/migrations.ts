import type { ProjectState } from "./types";

// Add a MIGRATION entry whenever lib/types.ts changes shape. Each step
// receives the previous version's state and mutates toward the next version.

export const CURRENT_SCHEMA_VERSION = 1;

type Migration = (state: Record<string, unknown>) => void;

const MIGRATIONS: Record<number, Migration> = {
  // 1 → 2 (example): add per-screen notes when it first shipped
  // 2: (s) => { for (const d of s.decks as any[]) for (const sc of d.screens) sc.notes ??= ""; },
};

/**
 * Bring any older project file up to the current schema, in order.
 * Never throws on missing fields — older files may be partial.
 */
export function migrate(raw: Record<string, unknown>): ProjectState {
  let version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 0;
  const state = structuredClone(raw);
  while (version < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (step) step(state);
    version += 1;
  }
  state.schemaVersion = CURRENT_SCHEMA_VERSION;
  if (typeof state.revision !== "number") state.revision = 0;
  return state as unknown as ProjectState;
}
