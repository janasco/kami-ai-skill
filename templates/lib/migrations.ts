import type { ProjectState } from "./types";
import { canvasSize } from "./devices";

// Add a MIGRATION entry whenever lib/types.ts changes shape. Each step
// receives the previous version's state and mutates toward the next version.

export const CURRENT_SCHEMA_VERSION = 2;

type Migration = (state: Record<string, unknown>) => void;

/**
 * v1 → v2: elements moved to strip coordinates. Early v1 files stored
 * screen-local x/y; screens after the first rendered empty. If every
 * element of a screen sits inside the FIRST panel's range, it was never
 * re-anchored — shift it to the screen's own panel.
 */
const migrateV1toV2: Migration = (state) => {
  const decks = (state.decks as Array<Record<string, unknown>> | undefined) ?? [];
  for (const deck of decks) {
    const deviceId = String(deck.deviceId ?? "iphone-69");
    const orientation = deck.orientation === "landscape" ? "landscape" : "portrait";
    let cw: number;
    try {
      cw = canvasSize(deviceId, orientation).w;
    } catch {
      continue; // unknown device id — leave untouched
    }
    const screens = (deck.screens as Array<Record<string, unknown>> | undefined) ?? [];
    screens.forEach((screen, index) => {
      if (index === 0) return; // panel 0 coincides with local coords
      const elements = screen.elements as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(elements) || elements.length === 0) return;
      const allInFirstPanel = elements.every((el) => {
        const x = typeof el.x === "number" ? el.x : 0;
        return x >= 0 && x < cw;
      });
      if (!allInFirstPanel) return;
      for (const el of elements) {
        if (typeof el.x === "number") el.x = el.x + index * cw;
      }
    });
  }
};

const MIGRATIONS: Record<number, Migration> = {
  1: migrateV1toV2,
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
