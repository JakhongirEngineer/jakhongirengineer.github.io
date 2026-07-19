#!/usr/bin/env node
// scripts/probe-media.mjs — Stage 2b of the pipeline (03 §5.1, §6.2).
//
// stage-media COPIES the media and manifest CHECKS it exists, but the lesson JSON
// also carries HONEST { durationSec, bytes } on every audio node + { bytes } on
// every download (03 §6.2). Those numbers must be measured from the real files,
// never guessed. This resolves every media file a core lesson points at (via the
// shared normaliser — the 02 §5 weave included), stat()s each for bytes and
// ffprobe()s each audio for its duration, and emits data/raw/<id>/media.probe.json
// keyed by the SAME clean media keys the lesson JSON uses. content/ is only READ.
//
//   node scripts/probe-media.mjs                 # all 30 core lessons
//   node scripts/probe-media.mjs core-01 …       # explicit ids
//
// The assembler (assemble-lesson.mjs) reads these probes so authors never touch a
// byte count or a duration by hand. Deterministic; skip-write-if-identical.

import { execFileSync } from "node:child_process";
import { join } from "node:path";
import {
  RAW_DIR, fileSize, writeJson, pad2, step, ok, info, warn, fail,
} from "./lib/util.mjs";
import {
  resolveAj, resolveCoreEpisodes, resolveGrammarBook,
} from "./lib/normalise.mjs";

// ffprobe → integer seconds (matches the core-09 exemplar's rounded durations).
function durationSec(src) {
  try {
    const out = execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", src,
    ], { encoding: "utf8" }).trim();
    const d = Number.parseFloat(out);
    return Number.isFinite(d) ? Math.round(d) : 0;
  } catch (e) {
    warn(`ffprobe failed for ${src}: ${e.message}`);
    return 0;
  }
}

// { key → { bytes, durationSec } } for one audio file (both measured).
const audioNode = (m) => (m ? { path: m.key, bytes: fileSize(m.src), durationSec: durationSec(m.src) } : null);
// { key → { bytes } } for one pdf (no duration).
const pdfNode = (m) => (m ? { path: m.key, bytes: fileSize(m.src) } : null);

function probeLesson(id) {
  const n = Number(/^core-(\d{2})$/.exec(id)?.[1]);
  if (!Number.isFinite(n)) return warn(`${id}: not a core-NN id, skipping`);

  const aj = resolveAj(n);
  const { englishpod, sixmin } = resolveCoreEpisodes(n);

  const probe = {
    id,
    audio: {
      main: audioNode(aj.audio.main),
      vocab: audioNode(aj.audio.vocab),
      ministory: audioNode(aj.audio.ministory),
      pov: audioNode(aj.audio.pov),         // null for L01–08 & L19 (no POV audio)
    },
    pdf: {
      main: pdfNode(aj.pdf.main),
      vocab: pdfNode(aj.pdf.vocab),
      ministory: pdfNode(aj.pdf.ministory),
      pov: pdfNode(aj.pdf.pov),
    },
    englishpod: englishpod
      ? {
          id: englishpod.id,
          audio: {
            dg: audioNode(englishpod.audio.dg),
            pr: audioNode(englishpod.audio.pr),
            rv: audioNode(englishpod.audio.rv),
          },
          pdf: pdfNode(englishpod.pdf),
        }
      : null,                                // L15 & L22 (section gated off, 02 §5)
    sixmin: {
      date: sixmin.date,
      audio: { main: audioNode(sixmin.audio.main) },
      pdf: pdfNode(sixmin.pdf),
    },
  };

  // the shared Murphy PDF (optional download from every Grammar Spark, 03 §6.2).
  try { const g = resolveGrammarBook(); probe.grammarBook = { path: g.key, bytes: fileSize(g.src) }; }
  catch { /* optional */ }

  const changed = writeJson(join(RAW_DIR, id, "media.probe.json"), probe);
  const dur = (probe.audio.main?.durationSec || 0) + (probe.englishpod?.audio.dg?.durationSec || 0) + (probe.sixmin.audio.main?.durationSec || 0);
  info(`${id}  main+dg+6ME ≈ ${dur}s  ep=${englishpod ? englishpod.id : "null"}  6ME=${sixmin.date}  ${changed ? "written" : "unchanged"}`);
}

function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = ids.length ? ids : Array.from({ length: 30 }, (_, i) => `core-${pad2(i + 1)}`);
  step(`probe-media → data/raw/<id>/media.probe.json  (${targets.length} lesson${targets.length > 1 ? "s" : ""}, ffprobe + stat)`);
  for (const id of targets) probeLesson(id);
  ok("probe-media complete");
}

main();
