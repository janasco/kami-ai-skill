"use client";

import { LOCALES } from "@/lib/locales";
import { THEMES } from "@/lib/themes";
import { DEVICES, devicesForPlatform } from "@/lib/devices";
import type { EditorMode, PlatformId, ProjectState } from "@/lib/types";

interface Props {
  state: ProjectState;
  platform: PlatformId;
  deviceId: string;
  mode: EditorMode;
  locale: string;
  onPlatform: (p: PlatformId) => void;
  onDevice: (id: string) => void;
  onStyle: (styleId: string) => void;
  onMode: (m: EditorMode) => void;
  onLocale: (l: string) => void;
  onTemplates: () => void;
  onExport: () => void;
  onSave: () => void;
  dirty: boolean;
  status: string;
}

export default function Toolbar({
  state, platform, deviceId, mode, locale, onPlatform, onDevice, onStyle, onMode, onLocale, onTemplates, onExport, onSave, dirty, status,
}: Props) {
  const devices = devicesForPlatform(platform);
  return (
    <div className="panel" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", flexWrap: "wrap" }}>
      {/* platform tabs */}
      <div className="row">
        {(["ios", "mac", "android"] as PlatformId[]).map((p) => (
          <button key={p} className={p === platform ? "primary" : ""} onClick={() => onPlatform(p)}>
            {p === "ios" ? "iOS" : p === "mac" ? "Mac" : "Android"}
          </button>
        ))}
      </div>

      {/* device selector */}
      <select value={deviceId} onChange={(e) => onDevice(e.target.value)} style={{ width: "auto" }} title="Device">
        {devices.map((d) => (
          <option key={d.id} value={d.id}>{d.label}</option>
        ))}
      </select>

      {/* theme picker */}
      <select value={state.defaultStyleId} onChange={(e) => onStyle(e.target.value)} style={{ width: "auto" }} title="Theme">
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* mode */}
      <div className="row" title="Connected: elements may span screens and exports crop the strip. Isolated: legacy decks clip to their own screen.">
        <button className={mode === "connected" ? "primary" : ""} onClick={() => onMode("connected")}>Connected</button>
        <button className={mode === "isolated" ? "primary" : ""} onClick={() => onMode("isolated")}>Isolated</button>
      </div>

      {/* locale */}
      <select value={locale} onChange={(e) => onLocale(e.target.value)} style={{ width: "auto" }} title="Editing locale">
        {(state.locales.length ? state.locales : LOCALES.map((l) => l.code)).map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      <button onClick={onTemplates} title="Start from a ready-made deck design">✦ Templates</button>

      <span style={{ fontSize: 12, color: dirty ? "var(--danger)" : "var(--text-dim)" }}>
        {status === "conflict" ? "⚠ conflict" : dirty ? "unsaved…" : "saved"}
      </span>
      <button onClick={onSave}>Save</button>
      <button className="primary" onClick={onExport}>Export bundle</button>
    </div>
  );
}

export { DEVICES };
