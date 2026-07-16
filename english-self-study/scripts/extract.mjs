#!/usr/bin/env node
// scripts/extract.mjs — Stage 1 of the pipeline (03 §5.1).
//
// Pulls the selectable text out of each lesson's transcript PDFs into
// data/raw/<id>/<component>.txt, globbing source files by numeric prefix /
// keyword through the shared normaliser — NEVER hardcoded filenames (03 §5.3).
// For AJ mini-stories it also emits a ministory.pairs.json draft (the parsed
// {q,a} loop, 02 §2) as a curation aid. content/ is only READ.
//
//   node scripts/extract.mjs                 # every curated lesson (data/lessons/*.json)
//   node scripts/extract.mjs core-09 …       # explicit ids

import { join } from "node:path";
import {
  RAW_DIR, parseLessonId, curatedLessonIds, writeTextFile, writeJson, reflowParagraphs,
  step, ok, info, warn, fail, relRoot,
} from "./lib/util.mjs";
import { resolveByLessonMeta } from "./lib/normalise.mjs";
import { pdfPlainText, parseMiniStory } from "./lib/pdf.mjs";

// id → ordered list of {component, pdf:{src,key}} for the transcript PDFs.
function transcriptPdfs(meta, resolved) {
  if (meta.source === "aj-hoge")
    return ["main", "vocab", "ministory", "pov"]
      .map((c) => ({ component: c, pdf: resolved.pdf[c] }))
      .filter((x) => x.pdf);
  if (meta.source === "englishpod")
    return resolved.pdf ? [{ component: "transcript", pdf: resolved.pdf }] : [];
  if (meta.source === "6min")
    return resolved.pdf ? [{ component: "transcript", pdf: resolved.pdf }] : [];
  return [];
}

async function extractLesson(id) {
  const meta = parseLessonId(id);
  const resolved = resolveByLessonMeta(meta);
  const outDir = join(RAW_DIR, id);
  const pdfs = transcriptPdfs(meta, resolved);
  if (!pdfs.length) { warn(`${id}: no transcript PDFs resolved`); return; }

  for (const { component, pdf } of pdfs) {
    const text = await pdfPlainText(pdf.src);
    writeTextFile(join(outDir, `${component}.txt`), text);
    // read-along paragraph draft for the prose components (curation aid, 03 §6.2).
    if (component !== "ministory") {
      writeJson(join(outDir, `${component}.para.json`), { paragraphs: reflowParagraphs(text) });
    }
    info(`${id}/${component}.txt  ←  ${relRoot(pdf.src)}`);
  }

  // AJ mini-story: parse {q,a} pairs (the answer-aloud drill source, 02 §2).
  if (meta.source === "aj-hoge" && resolved.pdf.ministory) {
    const parsed = await parseMiniStory(resolved.pdf.ministory.src);
    writeJson(join(outDir, "ministory.pairs.json"), { pairs: parsed.pairs });
    ok(`${id}: ${parsed.pairs.length} mini-story {q,a} pairs, ${parsed.statements.length} statements`);
  }
}

async function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = ids.length ? ids : curatedLessonIds();
  if (!targets.length) return fail("extract: no lesson ids given and no data/lessons/*.json curated yet");

  step(`extract → data/raw  (${targets.length} lesson${targets.length > 1 ? "s" : ""})`);
  for (const id of targets) await extractLesson(id);
  ok("extract complete");
}

main().catch((e) => fail(e.message));
