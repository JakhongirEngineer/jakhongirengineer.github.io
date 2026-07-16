#!/usr/bin/env node
// scripts/manifest.mjs — Stage 5 of the pipeline (03 §5.1, §5.5).
//
// Asserts every media `path` referenced by every lesson JSON (audio.*.path,
// downloads[].path, grammar.reference.downloadPath) resolves to a real file in
// _media_staging/. FAILS LOUDLY on the first missing/typo'd key so a bad
// reference never reaches deploy/upload. Read-only check.

import { join } from "node:path";
import { existsSync, statSync } from "node:fs";
import {
  STAGING_DIR, LESSONS_DIR, curatedLessonIds, readJson, step, ok, info, warn, fail, log,
} from "./lib/util.mjs";

function referencedKeys(lesson) {
  const refs = []; // {key, where}
  if (lesson.audio) for (const [k, a] of Object.entries(lesson.audio)) if (a && a.path) refs.push({ key: a.path, where: `audio.${k}.path` });
  if (Array.isArray(lesson.downloads)) lesson.downloads.forEach((d, i) => { if (d.path) refs.push({ key: d.path, where: `downloads[${i}].path` }); });
  if (lesson.grammar?.reference?.downloadPath) refs.push({ key: lesson.grammar.reference.downloadPath, where: "grammar.reference.downloadPath" });
  return refs;
}

function main() {
  const ids = curatedLessonIds();
  if (!ids.length) return fail("manifest: no curated lessons (data/lessons/*.json)");
  step(`manifest — verifying media keys resolve in _media_staging/  (${ids.length} lesson${ids.length > 1 ? "s" : ""})`);

  if (!existsSync(STAGING_DIR)) return fail(`manifest: _media_staging/ does not exist — run stage-media first`);

  const missing = [];
  let checked = 0;
  for (const id of ids) {
    const lesson = readJson(join(LESSONS_DIR, `${id}.json`));
    for (const { key, where } of referencedKeys(lesson)) {
      checked++;
      const dest = join(STAGING_DIR, key);
      if (!existsSync(dest)) { missing.push(`${id}: ${where} → "${key}" NOT staged`); continue; }
      if (statSync(dest).size === 0) { missing.push(`${id}: ${where} → "${key}" is 0 bytes`); continue; }
      info(`${id}  ${key}  ✓`);
    }
  }

  if (missing.length) {
    log("");
    for (const m of missing) warn(m);
    return fail(`manifest FAILED: ${missing.length} of ${checked} referenced key(s) missing/empty`);
  }
  ok(`manifest passed: all ${checked} referenced media keys resolve in _media_staging/`);
}

main();
