#!/usr/bin/env node
// Scaffold the screenshot studio into a target directory.
// Usage: node scripts/scaffold.mjs [target-dir]   (default: ./kami-studio)

import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(scriptDir, "..", "templates");
const targetArg = process.argv[2];
const target = resolve(targetArg ?? "kami-studio");

if (!existsSync(templatesDir)) {
  console.error(`templates/ not found at ${templatesDir}`);
  process.exit(1);
}

const existing = existsSync(target) ? readdirSync(target) : [];
const conflicts = existing.filter((f) => f !== ".git" && f !== "node_modules");
if (conflicts.length && !targetArg) {
  console.error(`Refusing to scaffold into non-empty ${target} (pass a target dir explicitly to override).`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
cpSync(templatesDir, target, { recursive: true, dot: true });

console.log(`Scaffolded Kami AI studio → ${target}`);
console.log(`
Next steps:
  cd ${targetArg ?? "kami-studio"}
  npm install
  npm run dev
  → open http://localhost:3000

Drop raw captures into public/screenshots/uploaded/ or upload via the UI.
Project state lives in app-store-screenshots.json (git-trackable).
`);
