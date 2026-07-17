#!/usr/bin/env node
// scripts/stage-media.mjs — Stage 3 of the pipeline (03 §5.1, §2.5).
//
// COPIES (never moves — content/ is READ-ONLY) each curated lesson's source
// media into _media_staging/<clean-key> via the shared normaliser, ready for
// `rclone copy` to R2 (03 §2.5). Copies are skipped when the destination is
// already byte-identical, so re-runs are deterministic and touch nothing.
//
//   node scripts/stage-media.mjs                # stage every curated lesson (+ referenced shared assets)
//   node scripts/stage-media.mjs --dry-run      # list what WOULD be staged for curated lessons
//   node scripts/stage-media.mjs --all --dry-run# resolve & list ALL sources (proves the normaliser)

import { copyFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  STAGING_DIR, LESSONS_DIR, curatedLessonIds, parseLessonId, readJson, listDir,
  ensureDir, relRoot, step, ok, info, warn, fail, log,
} from "./lib/util.mjs";
import {
  AJ_COMPONENTS, resolveByLessonMeta, resolveAllAj, listEnglishPodIds, resolveEnglishPod,
  listSixMinDates, resolveSixMin, resolveCoreEpisodes, sharedAssetMap,
} from "./lib/normalise.mjs";

// clean-key → source-path for one EnglishPod episode's dg/pr/rv + transcript.
function addEnglishPodKeys(out, ep) {
  if (!ep) return;
  for (const s of ["dg", "pr", "rv"]) if (ep.audio[s]) out.set(ep.audio[s].key, ep.audio[s].src);
  if (ep.pdf) out.set(ep.pdf.key, ep.pdf.src);
}
// clean-key → source-path for one 6ME episode's audio + transcript.
function addSixMinKeys(out, sm) {
  if (!sm) return;
  if (sm.audio.main) out.set(sm.audio.main.key, sm.audio.main.src);
  if (sm.pdf) out.set(sm.pdf.key, sm.pdf.src);
}

// clean-key → source-path for one resolved lesson's media (all present components).
// A weekly core lesson (aj-hoge) also folds in its paired EnglishPod + 6ME episode
// (02 §2/§5), so their media is staged from the same call (03 §5.1).
function lessonMediaKeys(meta, resolved) {
  const out = new Map();
  if (meta.source === "aj-hoge") {
    for (const c of AJ_COMPONENTS) {
      if (resolved.audio[c]) out.set(resolved.audio[c].key, resolved.audio[c].src);
      if (resolved.pdf[c]) out.set(resolved.pdf[c].key, resolved.pdf[c].src);
    }
    const { englishpod, sixmin } = resolveCoreEpisodes(meta.ajNumber);  // 02 §5 weave
    addEnglishPodKeys(out, englishpod);   // null on L15/L22 → no-op (section gated off)
    addSixMinKeys(out, sixmin);
  } else if (meta.source === "englishpod") {
    addEnglishPodKeys(out, resolved);
  } else if (meta.source === "6min") {
    addSixMinKeys(out, resolved);
  }
  return out;
}

// every media key a lesson JSON points at (03 §6.2 v2): audio.*, englishpod.audio.*,
// sixmin.audio.*, downloads[], and each grammar[].reference.
function referencedKeys(lesson) {
  const keys = new Set();
  if (lesson.audio) for (const a of Object.values(lesson.audio)) if (a && a.path) keys.add(a.path);
  if (lesson.englishpod?.audio) for (const a of Object.values(lesson.englishpod.audio)) if (a && a.path) keys.add(a.path);
  if (lesson.sixmin?.audio) for (const a of Object.values(lesson.sixmin.audio)) if (a && a.path) keys.add(a.path);
  if (Array.isArray(lesson.downloads)) for (const d of lesson.downloads) if (d.path) keys.add(d.path);
  const grammar = Array.isArray(lesson.grammar) ? lesson.grammar : lesson.grammar ? [lesson.grammar] : [];
  for (const g of grammar) if (g?.reference?.downloadPath) keys.add(g.reference.downloadPath);
  return keys;
}

function copyKey(key, src, { dry }) {
  const dest = join(STAGING_DIR, key);
  if (existsSync(dest) && statSync(dest).size === statSync(src).size) { info(`= ${key} (unchanged)`); return "skip"; }
  if (dry) { log(`  would copy  ${key}  ←  ${relRoot(src)}`); return "would"; }
  ensureDir(join(dest, ".."));
  copyFileSync(src, dest);
  info(`+ ${key}  ←  ${relRoot(src)}`);
  return "copied";
}

function stageCurated({ dry }) {
  const ids = curatedLessonIds();
  if (!ids.length) return fail("stage-media: no curated lessons (data/lessons/*.json) to stage");
  step(`stage-media → _media_staging  (${ids.length} lesson${ids.length > 1 ? "s" : ""}${dry ? ", DRY RUN" : ""})`);

  // build the full key→src map (lesson media + referenced shared assets).
  const map = new Map();
  const referenced = new Set();
  for (const id of ids) {
    const meta = parseLessonId(id);
    for (const [k, v] of lessonMediaKeys(meta, resolveByLessonMeta(meta))) map.set(k, v);
    for (const k of referencedKeys(readJson(join(LESSONS_DIR, `${id}.json`)))) referenced.add(k);
  }
  for (const [k, v] of sharedAssetMap()) if (referenced.has(k)) map.set(k, v);

  const counts = { copied: 0, skip: 0, would: 0 };
  for (const [key, src] of [...map].sort()) counts[copyKey(key, src, { dry })]++;

  // flag references we can't resolve to a source (typo in JSON) — manifest is the hard gate.
  for (const k of referenced) if (!map.has(k)) warn(`referenced key has no resolvable source: ${k}`);
  ok(`stage-media ${dry ? "dry-run" : "done"}: ${counts.copied} copied, ${counts.skip} unchanged${dry ? `, ${counts.would} would-copy` : ""}, ${map.size} keys`);
}

// Resolve & list EVERY source (AJ 1–30 + all EnglishPod + all 6ME) without
// copying — proves the normaliser handles the full documented chaos (S1 goal).
function dryAll() {
  step("stage-media --all --dry-run : resolving ALL sources (no copy)");

  log("\nAJ Hoge (core, 30 lessons) — audio globbed by 1_/2_/3_/4_, PDFs by keyword:");
  const ajTotals = { main: 0, vocab: 0, ministory: 0, pov: 0, pdfMain: 0, pdfVocab: 0, pdfMs: 0, pdfPov: 0 };
  for (const r of resolveAllAj()) {
    const a = AJ_COMPONENTS.map((c) => (r.audio[c] ? c[0].toUpperCase() : "·")).join("");
    const p = AJ_COMPONENTS.map((c) => (r.pdf[c] ? c[0].toUpperCase() : "·")).join("");
    for (const c of AJ_COMPONENTS) { if (r.audio[c]) ajTotals[c]++; }
    ajTotals.pdfMain += r.pdf.main ? 1 : 0; ajTotals.pdfVocab += r.pdf.vocab ? 1 : 0;
    ajTotals.pdfMs += r.pdf.ministory ? 1 : 0; ajTotals.pdfPov += r.pdf.pov ? 1 : 0;
    log(`  ${r.key}  audio[${a}] pdf[${p}]`);
  }
  log(`  → audio: main ${ajTotals.main}/30, vocab ${ajTotals.vocab}/30, ministory ${ajTotals.ministory}/30, pov ${ajTotals.pov}/30`);
  log(`  → pdf:   main ${ajTotals.pdfMain}/30, vocab ${ajTotals.pdfVocab}/30, ministory ${ajTotals.pdfMs}/30, pov ${ajTotals.pdfPov}/30`);

  log("\nEnglishPod (supp) — B-prefix probed on mp3s, ' u' stripped from topic:");
  const epIds = listEnglishPodIds();
  let epAudio = 0, epPdf = 0, epBoth = 0;
  for (const id of epIds) {
    const r = resolveEnglishPod(id);
    const have = ["dg", "pr", "rv"].filter((s) => r.audio[s]).length;
    epAudio += have; epPdf += r.pdf ? 1 : 0; if (have === 3) epBoth++;
    log(`  ${r.key}  topic=${r.topic}  mp3B=${r.hasBPrefixMp3 ? "yes" : "no "}  audio ${have}/3  pdf ${r.pdf ? "✓" : "·"}`);
  }
  log(`  → ${epIds.length} episodes, ${epBoth} with all 3 mp3s, ${epAudio} mp3s, ${epPdf} pdfs`);

  log("\n6 Minute English (supp) — keyed by YYMMDD, ' (1)' deduped:");
  const dates = listSixMinDates();
  let sixAudio = 0, sixPdf = 0, sixDup = 0;
  for (const d of dates) {
    const r = resolveSixMin(d);
    sixAudio += r.audio.main ? 1 : 0; sixPdf += r.pdf ? 1 : 0; sixDup += r.hadDuplicate ? 1 : 0;
  }
  log(`  → ${dates.length} unique dates, ${sixAudio} mp3s, ${sixPdf} pdfs, ${sixDup} had a " (1)" duplicate deduped`);
  ok("dry-run resolution complete (nothing copied; content/ untouched)");
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry-run");
  if (args.includes("--all")) return dryAll();
  stageCurated({ dry });
}

main();
