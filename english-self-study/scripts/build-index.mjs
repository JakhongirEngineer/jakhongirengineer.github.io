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

// order → phase (02 §1): 1 Poydevor (01–10) · 2 Sur'at (11–20) · 3 Ravonlik (21–30).
const phaseFor = (order) => (order <= 10 ? 1 : order <= 20 ? 2 : 3);

// Sum every audio node the weekly lesson carries: the AJ set (audio.*) + the
// EnglishPod dg/pr/rv + the 6ME main (03 §6.1 durationSec).
function totalDurationSec(l) {
  let s = 0;
  if (l.audio) for (const a of Object.values(l.audio)) if (a && a.durationSec) s += a.durationSec;
  if (l.englishpod && l.englishpod.audio) for (const a of Object.values(l.englishpod.audio)) if (a && a.durationSec) s += a.durationSec;
  if (l.sixmin && l.sixmin.audio) for (const a of Object.values(l.sixmin.audio)) if (a && a.durationSec) s += a.durationSec;
  return s;
}

function catalogueEntry(l) {
  const hasPov = !!(l.audio && l.audio.pov) ||
    !!(l.transcripts && Array.isArray(l.transcripts.pov) && l.transcripts.pov.length);
  // grammarUnits — the TWO topic slugs (was single grammarUnit); [] never null (03 §6.1).
  const grammarUnits = Array.isArray(l.grammar) ? l.grammar.map((g) => g && g.unit).filter(Boolean) : [];
  return {
    id: l.id,
    track: l.track,               // always "core" (the supp track is retired, 03 §6.1)
    source: l.source,             // always "aj-hoge"
    order: l.order,
    slug: l.slug,
    title: l.title,
    titleUz: l.titleUz,
    level: l.level,
    phase: phaseFor(l.order),
    tags: Array.isArray(l.tags) ? l.tags : [],
    grammarUnits,
    durationSec: totalDurationSec(l),
    hasPov,
    hasEnglishPod: l.englishpod != null,     // false where englishpod:null (L15 & L22)
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
