// scripts/lib/util.mjs — shared helpers for the OFFLINE content pipeline.
// Dev-only. Nothing here is served (03 §5). Node 20+ / ESM.

import { fileURLToPath } from "node:url";
import { dirname, join, resolve, basename, relative } from "node:path";
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

// ── Paths ────────────────────────────────────────────────────────────────
// this file: <root>/scripts/lib/util.mjs  →  root is two levels up.
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const CONTENT_DIR   = join(ROOT, "content");
export const AJ_DIR        = join(CONTENT_DIR, "AJ_Hoge_Power_English");
export const LISTENING_DIR = join(CONTENT_DIR, "listening");            // EnglishPod
export const SIXMIN_DIR    = join(CONTENT_DIR, "6_minute_english");
export const GRAMMAR_SRC   = join(CONTENT_DIR, "grammar_book");         // Murphy PDF (download-only)

export const DATA_DIR      = join(ROOT, "data");
export const LESSONS_DIR   = join(DATA_DIR, "lessons");
export const RAW_DIR       = join(DATA_DIR, "raw");                     // gitignored intermediate
export const STAGING_DIR   = join(ROOT, "_media_staging");             // gitignored copy target
export const AUTHORING_DIR = join(ROOT, "authoring");                  // committed authoring source

// ── Small formatting helpers ──────────────────────────────────────────────
export const pad2 = (n) => String(n).padStart(2, "0");

// ── Console logging (offline tools; plain, greppable) ──────────────────────
const C = { gray: "\x1b[90m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", reset: "\x1b[0m", bold: "\x1b[1m" };
export const log  = (...a) => console.log(...a);
export const info = (...a) => console.log(C.gray + "·" + C.reset, ...a);
export const ok   = (...a) => console.log(C.green + "✓" + C.reset, ...a);
export const warn = (...a) => console.warn(C.yellow + "!" + C.reset, ...a);
export const step = (s) => console.log("\n" + C.bold + s + C.reset);
export function fail(msg) {
  console.error(C.red + "✗ " + msg + C.reset);
  process.exitCode = 1;
  throw new Error(msg);
}

// ── Filesystem helpers ─────────────────────────────────────────────────────
export function listDir(dir) {
  try { return readdirSync(dir, { withFileTypes: true }); }
  catch { return []; }
}

/** Recursively collect file paths under `dir` (absolute). */
export function walkFiles(dir) {
  const out = [];
  for (const ent of listDir(dir)) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkFiles(p));
    else if (ent.isFile()) out.push(p);
  }
  return out;
}

export function ensureDir(dir) { mkdirSync(dir, { recursive: true }); }
export function fileSize(p) { return statSync(p).size; }
export function readText(p) { return readFileSync(p, "utf8"); }
export function readJson(p) { return JSON.parse(readFileSync(p, "utf8")); }

/**
 * Deterministic write: 2-space JSON + trailing newline, and skip the write
 * entirely when the on-disk bytes already match (keeps mtimes + git stable,
 * and guarantees byte-identical re-runs). Returns true if it changed.
 */
export function writeJson(p, obj) {
  const next = JSON.stringify(obj, null, 2) + "\n";
  if (existsSync(p) && readFileSync(p, "utf8") === next) return false;
  ensureDir(dirname(p));
  writeFileSync(p, next);
  return true;
}

/** Deterministic text write with the same skip-if-identical guarantee. */
export function writeTextFile(p, text) {
  const next = text.endsWith("\n") ? text : text + "\n";
  if (existsSync(p) && readFileSync(p, "utf8") === next) return false;
  ensureDir(dirname(p));
  writeFileSync(p, next);
  return true;
}

export function relRoot(p) { return relative(ROOT, p); }
export { basename, join, existsSync };

/**
 * Reflow raw extracted PDF text (one PDF line per input line) into read-along
 * paragraphs (03 §6.2 transcripts). Deterministic: rejoins wrapped lines,
 * packs sentences up to ~maxChars, breaks on blank lines (page gaps) and on the
 * AJ story separator `* * * * *`. Optionally drops a leading title line (the
 * only "boilerplate" in the text layer — the copyright/logo is an image, 02 §10).
 */
export function reflowParagraphs(raw, { dropTitle = true, maxChars = 340 } = {}) {
  let lines = raw.replace(/\r/g, "").split("\n");
  if (dropTitle && lines.length && lines[0].trim()) lines = lines.slice(1);

  // group into blocks separated by blank lines; the `* * * * *` marker is its own block.
  const blocks = [];
  let cur = [];
  const flush = () => { if (cur.length) { blocks.push(cur.join(" ")); cur = []; } };
  for (const raw1 of lines) {
    const l = raw1.trim();
    if (!l) { flush(); continue; }
    if (/^[\s*.]*\*[\s*.]*$/.test(l)) { flush(); continue; } // drop separators
    cur.push(l);
  }
  flush();

  // within each block, pack sentences into ≤maxChars paragraphs.
  const out = [];
  for (const block of blocks) {
    const text = block.replace(/[ \t]+/g, " ").trim();
    if (!text) continue;
    const sentences = text.match(/[^.!?]+[.!?]+["”']?|\S[^.!?]*$/g) || [text];
    let para = "";
    for (const sRaw of sentences) {
      const s = sRaw.trim();
      if (!s) continue;
      if (para && (para.length + 1 + s.length) > maxChars) { out.push(para); para = s; }
      else para = para ? `${para} ${s}` : s;
    }
    if (para) out.push(para);
  }
  return out;
}

// ── Lesson id ↔ source mapping (03 §6.1 ids ↔ §5.3 sources) ────────────────
// core-NN            → AJ Hoge lesson NN          → key prefix aj-hoge/NN
// supp-pod-XXXX      → EnglishPod episode XXXX     → key prefix englishpod/XXXX
// supp-6min-YYMMDD   → 6 Minute English episode    → key prefix sixmin/YYMMDD
export function parseLessonId(id) {
  let m;
  if ((m = /^core-(\d{2})$/.exec(id)))
    return { id, track: "core", source: "aj-hoge", ajNumber: Number(m[1]), keyPrefix: `aj-hoge/${m[1]}` };
  if ((m = /^supp-pod-(\d{4})$/.exec(id)))
    return { id, track: "supp", source: "englishpod", epId: m[1], keyPrefix: `englishpod/${m[1]}` };
  if ((m = /^supp-6min-(\d{6})$/.exec(id)))
    return { id, track: "supp", source: "6min", sixDate: m[1], keyPrefix: `sixmin/${m[1]}` };
  throw new Error(`Unrecognised lesson id: ${id}`);
}

/** ids of every curated lesson (a data/lessons/<id>.json exists). Sorted, deterministic. */
export function curatedLessonIds() {
  return listDir(LESSONS_DIR)
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => e.name.replace(/\.json$/, ""))
    .sort();
}
