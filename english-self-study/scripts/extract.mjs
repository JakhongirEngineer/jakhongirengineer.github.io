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
import { resolveByLessonMeta, resolveCoreEpisodes } from "./lib/normalise.mjs";
import { pdfPlainText, parseMiniStory } from "./lib/pdf.mjs";

// Best-effort speaker split for the EnglishPod dialogue draft (a curation aid,
// 03 §5.1). The dg transcript lines start with a role tag ("A:", "B:", "Jerry:")
// — we group the region between the "Dialog"/"Dialogue" header and the "Key
// Vocabulary" / "Language Takeaway" section. Curation refines this by hand.
function splitEnglishPodDialogue(text) {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const startAt = lines.findIndex((l) => /^dialog(ue)?\b/i.test(l));
  const endAt = lines.findIndex((l) => /^(key vocabulary|language takeaway|vocabulary|supplementary)/i.test(l));
  const region = lines.slice(startAt >= 0 ? startAt + 1 : 0, endAt >= 0 ? endAt : lines.length);
  const out = [];
  for (const l of region) {
    const m = /^([A-Za-z][\w .'-]{0,24}?):\s*(.+)$/.exec(l);
    if (m) out.push({ speaker: m[1], en: m[2].trim() });
    else if (out.length) out[out.length - 1].en += " " + l;   // wrapped line
  }
  return out;
}

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

  // A weekly core lesson also folds in ONE EnglishPod + ONE 6ME episode (02 §2/§5).
  // Extract their transcript PDFs into the same data/raw/<id>/ dir + curation
  // drafts (englishpod.dialogue.json speaker-split, sixmin.para.json read-along).
  if (meta.source === "aj-hoge") {
    const { englishpod, sixmin } = resolveCoreEpisodes(meta.ajNumber);
    if (englishpod?.pdf) {
      const epText = await pdfPlainText(englishpod.pdf.src);
      writeTextFile(join(outDir, "englishpod.txt"), epText);
      writeJson(join(outDir, "englishpod.dialogue.json"), { id: englishpod.id, lines: splitEnglishPodDialogue(epText) });
      info(`${id}/englishpod.txt  ←  ${relRoot(englishpod.pdf.src)}  (EP ${englishpod.id})`);
    } else if (englishpod === null) {
      info(`${id}: EnglishPod gated off (englishpod:null per 02 §5)`);
    }
    if (sixmin?.pdf) {
      const sixText = await pdfPlainText(sixmin.pdf.src);
      writeTextFile(join(outDir, "sixmin.txt"), sixText);
      writeJson(join(outDir, "sixmin.para.json"), { date: sixmin.date, paragraphs: reflowParagraphs(sixText) });
      info(`${id}/sixmin.txt  ←  ${relRoot(sixmin.pdf.src)}  (6ME ${sixmin.date})`);
    }
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
