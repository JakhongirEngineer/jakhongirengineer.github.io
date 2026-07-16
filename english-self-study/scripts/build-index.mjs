#!/usr/bin/env node
// scripts/build-index.mjs — Stage 4 of the pipeline (03 §5.1, §6.1).
//
// Emits the lean data/index.json catalogue (loaded once by the app; budget
// ≤40 KB for 60 lessons) from the per-lesson JSON files. Derived fields only —
// the heavy content stays in the lazy-loaded per-lesson JSON. Deterministic:
// lessons sorted by order, stable key order, skip-write-if-identical.

import { join } from "node:path";
import {
  DATA_DIR, LESSONS_DIR, curatedLessonIds, readJson, writeJson, relRoot,
  step, ok, info, fail,
} from "./lib/util.mjs";

function catalogueEntry(l) {
  const durationSec = l.audio
    ? Object.values(l.audio).reduce((s, a) => s + (a && a.durationSec ? a.durationSec : 0), 0)
    : 0;
  const hasPov = !!(l.audio && l.audio.pov) ||
    !!(l.transcripts && Array.isArray(l.transcripts.pov) && l.transcripts.pov.length);
  return {
    id: l.id,
    track: l.track,
    source: l.source,
    order: l.order,
    slug: l.slug,
    title: l.title,
    titleUz: l.titleUz,
    level: l.level,
    tags: Array.isArray(l.tags) ? l.tags : [],
    grammarUnit: l.grammar && l.grammar.unit ? l.grammar.unit : null,
    durationSec,
    hasPov,
    hasQuiz: Array.isArray(l.quiz) && l.quiz.length > 0,
    hasDialogue: Array.isArray(l.dialogue) && l.dialogue.length > 0,
    youtubeCount: Array.isArray(l.funEnglish)
      ? l.funEnglish.filter((f) => f && f.provider === "youtube").length
      : 0,
  };
}

function main() {
  const ids = curatedLessonIds();
  if (!ids.length) return fail("build-index: no curated lessons (data/lessons/*.json)");
  step(`build-index → data/index.json  (${ids.length} lesson${ids.length > 1 ? "s" : ""})`);

  const lessons = ids
    .map((id) => catalogueEntry(readJson(join(LESSONS_DIR, `${id}.json`))))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  const index = {
    schemaVersion: 1,
    generated: new Date().toISOString().slice(0, 10), // date-stable ⇒ identical within a day
    lessons,
  };
  const path = join(DATA_DIR, "index.json");
  const changed = writeJson(path, index);
  for (const l of lessons) info(`${l.id}  order ${l.order}  ${l.durationSec}s  pov=${l.hasPov}`);
  ok(`build-index ${changed ? "wrote" : "unchanged"} ${relRoot(path)} (${lessons.length} lessons)`);
}

main();
