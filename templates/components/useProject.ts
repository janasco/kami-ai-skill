"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectState, SavePayload } from "@/lib/types";

const LS_KEY = "kami-project-mirror";

export type SaveStatus = "loading" | "ready" | "conflict" | "error";

/**
 * Loads the project (disk first, localStorage as fallback/mirror), autosaves
 * debounced edits through /api/project, and refuses to overwrite a newer
 * disk revision (another tab or agent may have saved).
 */
export function useProject() {
  const [state, setState] = useState<ProjectState | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [dirty, setDirty] = useState(false);
  const [conflictRevision, setConflictRevision] = useState<number | null>(null);
  const revisionRef = useRef(0);
  const conflictRef = useRef<number | null>(null);
  const stateRef = useRef<ProjectState | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/project");
        const data = (await res.json()) as { state: ProjectState };
        let s = data.state;
        try {
          const cached = localStorage.getItem(LS_KEY);
          if (cached) {
            const mirror = JSON.parse(cached) as { state?: ProjectState };
            // disk has no file yet but a local mirror exists — adopt it
            if (mirror.state && s.revision === 0 && mirror.state.revision > 0) s = mirror.state;
          }
        } catch { /* ignore bad mirror */ }
        if (!alive) return;
        revisionRef.current = s.revision;
        stateRef.current = s;
        setState(s);
        setStatus("ready");
      } catch {
        if (alive) setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((fn: (s: ProjectState) => ProjectState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = fn(structuredClone(prev));
      stateRef.current = next;
      return next;
    });
    setDirty(true);
  }, []);

  const save = useCallback(async (): Promise<"ok" | "conflict" | "error"> => {
    const s = stateRef.current;
    if (!s) return "error";
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // after a conflict, "retry" intentionally saves on top of the disk
        // revision the user chose to keep
        body: JSON.stringify({
          state: s,
          clientRevision: Math.max(revisionRef.current, conflictRef.current ?? 0),
        } satisfies SavePayload),
      });
      if (res.status === 409) {
        const data = (await res.json()) as { diskRevision?: number };
        conflictRef.current = data.diskRevision ?? null;
        setConflictRevision(data.diskRevision ?? null);
        setStatus("conflict");
        return "conflict";
      }
      if (!res.ok) {
        setStatus("error");
        return "error";
      }
      const data = (await res.json()) as { state: ProjectState };
      conflictRef.current = null;
      revisionRef.current = data.state.revision;
      stateRef.current = data.state;
      setState(data.state);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ state: data.state }));
      } catch { /* quota — mirror is best-effort */ }
      setDirty(false);
      setConflictRevision(null);
      setStatus("ready");
      return "ok";
    } catch {
      setStatus("error");
      return "error";
    }
  }, []);

  const reloadFromDisk = useCallback(async () => {
    try {
      const res = await fetch("/api/project");
      const data = (await res.json()) as { state: ProjectState };
      conflictRef.current = null;
      revisionRef.current = data.state.revision;
      stateRef.current = data.state;
      setState(data.state);
      setDirty(false);
      setConflictRevision(null);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // debounced autosave
  useEffect(() => {
    if (!dirty || status !== "ready") return;
    const t = setTimeout(() => {
      void save();
    }, 800);
    return () => clearTimeout(t);
  }, [state, dirty, status, save]);

  // warn before losing unsaved edits
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return { state, status, dirty, conflictRevision, update, save, reloadFromDisk };
}
