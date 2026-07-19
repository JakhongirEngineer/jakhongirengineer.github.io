#!/usr/bin/env node
// scripts/assemble-lesson.mjs — Stage 2c of the pipeline (03 §5.1, §6.2 v2).
//
// Assembles data/lessons/core-NN.json by MERGING two sources:
//   1. the FAITHFUL, source-derived scaffold (deterministic) — transcripts,
//      mini-story {q,a} pairs, the EnglishPod dialogue, the 6ME quiz question,
//      and every audio/download node with its ffprobe'd duration + real bytes.
//      These come straight from data/raw/<id>/ + media.probe.json and are NEVER
//      paraphrased — the English input a learner acquires must match the audio.
//   2. the AUTHORED overlay authoring/lessons/<id>.overlay.json (committed) —
//      the Uzbek scaffolding + pedagogy the course adds: titles, intro/can-do,
//      the two Grammar-Spark topics' metadata + drills, vocab glosses, the
//      EnglishPod Key-Vocab Uzbek glosses + warm-up, the 6ME answer +
//      explanation + 6-word pack, the Fun-English pick, the Speak-It prompt.
//
// grammar[].bodyHtml is left empty here and filled by compile-grammar from
// authoring/grammar/<id>-a.md / -b.md (03 §4). Run order: assemble → compile-
// grammar → build-index → validate → stage-media → manifest. Deterministic;
// skip-write-if-identical. content/ is only READ (via the raw drafts + probe).
//
//   node scripts/assemble-lesson.mjs                 # every lesson with an overlay
//   node scripts/assemble-lesson.mjs core-01 …       # explicit ids

import { join } from "node:path";
import { existsSync } from "node:fs";
import {
  RAW_DIR, AUTHORING_DIR, LESSONS_DIR, readJson, readText, writeJson,
  reflowParagraphs, pad2, step, ok, info, warn, fail,
} from "./lib/util.mjs";

const OVERLAY_DIR = join(AUTHORING_DIR, "lessons");

// ── faithful transcript cleanup (02 §10 boilerplate is an image; the text layer
// carries only the anti-piracy notice + the per-page site/page header) ──────────
const AJ_NOTICE = [
  /These lessons are sold only on our website,?\s*/gi,
  /If you (?:bought|buy) these lessons somewhere else,? you have an illegal copy\.?\s*/gi,
  /Please notify us and we will take (?:immediate )?legal action against the seller\.?\s*(?:Thank you\.?\s*)?/gi,
  /EffortlessEnglishClub\.?\s*com\.?(?:\s*\d+)?\s*/gi,   // site + optional page number header
];
function cleanAjParagraph(p) {
  let t = p;
  for (const re of AJ_NOTICE) t = t.replace(re, " ");
  return t.replace(/\s{2,}/g, " ").trim();
}
// AJ transcript (monologue) → paragraphs, notice stripped, empties dropped.
function ajTranscript(id, component) {
  const path = join(RAW_DIR, id, `${component}.para.json`);
  if (!existsSync(path)) return null;
  return readJson(path).paragraphs.map(cleanAjParagraph).filter(Boolean);
}

// ── 6 Minute English transcript → speaker turns (faithful; BBC boilerplate is
// per-page header/footer + the title block; speaker names sit alone on a line) ──
const SIX_BOILER =
  /^(BBC LEARNING ENGLISH|6 Minute English(\s*©.*)?|This is not a word-for-word.*|©?\s*British Broadcasting.*|bbclearningenglish\.com.*|Page \d+ of \d+.*)$/i;
// a line that is JUST a speaker label: 1–3 Titlecase words, or INSERT (vox-pop).
const SIX_SPEAKER = /^(INSERT\b.*|[A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z.'-]+){0,2})$/;
function sixMinTranscript(id) {
  const path = join(RAW_DIR, id, "sixmin.txt");
  if (!existsSync(path)) return [];
  const rawLines = readText(path).replace(/\r/g, "").split("\n").map((l) => l.trim());
  // drop boilerplate + the leading title block (everything up to the first speaker).
  const lines = rawLines.filter((l) => l && !SIX_BOILER.test(l));
  const turns = [];
  let cur = null;
  for (const l of lines) {
    if (SIX_SPEAKER.test(l) && l.length <= 40) {          // new speaker turn
      if (cur) turns.push(cur);
      cur = { who: l, text: [] };
    } else if (cur) {
      cur.text.push(l);
    } // lines before the first speaker (stray title fragments) are ignored
  }
  if (cur) turns.push(cur);
  return turns
    .map((t) => `${t.who}: ${t.text.join(" ").replace(/\s{2,}/g, " ").trim()}`)
    .filter((s) => !/:\s*$/.test(s));                     // drop a label with no speech
}

// ── mini-story {q,a} pairs — keep faithful; drop empties + exact-duplicate q ─────
function miniStoryPairs(id) {
  const path = join(RAW_DIR, id, "ministory.pairs.json");
  if (!existsSync(path)) return [];
  const seen = new Set();
  return readJson(path).pairs
    .filter((p) => p && typeof p.q === "string" && typeof p.a === "string" && p.q.trim() && p.a.trim())
    .filter((p) => { const k = p.q.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .map((p) => ({ q: p.q.trim(), a: p.a.trim() }));
}

// de-hyphenate a PDF line-wrap artifact ("con- verse" → "converse") in dialogue.
const deHyphen = (s) => s.replace(/([a-z])-\s+([a-z])/g, "$1$2").replace(/\s{2,}/g, " ").trim();

// ── audio / download node builders (numbers come from the probe) ────────────────
const audioFromProbe = (node, transcriptKey) =>
  node ? { path: node.path, durationSec: node.durationSec, bytes: node.bytes, ...(transcriptKey !== undefined ? { transcriptKey } : {}) } : null;

const DL_LABEL = {
  "main.mp3": "Asosiy audio (MP3)", "main.pdf": "Asosiy matn (PDF)",
  "vocab.mp3": "Soʻzlar audio (MP3)", "ministory.mp3": "Mini-hikoya audio (MP3)",
  "pov.mp3": "POV audio (MP3)", "pov.pdf": "POV matn (PDF)",
  "ep.dg": "EnglishPod dialog (MP3)", "ep.pdf": "EnglishPod matn (PDF)",
  "six.mp3": "6 Minute English (MP3)", "six.pdf": "6 Minute English matn (PDF)",
  "grammar": "Grammatika kitobi — Murphy (PDF)",
};
function buildDownloads(probe) {
  const d = [];
  const add = (label, kind, node) => { if (node) d.push({ labelUz: label, kind, path: node.path, bytes: node.bytes }); };
  add(DL_LABEL["main.mp3"], "audio", probe.audio.main);
  add(DL_LABEL["main.pdf"], "pdf", probe.pdf.main);
  add(DL_LABEL["vocab.mp3"], "audio", probe.audio.vocab);
  add(DL_LABEL["ministory.mp3"], "audio", probe.audio.ministory);
  add(DL_LABEL["pov.mp3"], "audio", probe.audio.pov);          // null on L01–08 & L19
  add(DL_LABEL["pov.pdf"], "pdf", probe.pdf.pov);              // present on L09–30 (incl. L19)
  if (probe.englishpod) {
    add(DL_LABEL["ep.dg"], "audio", probe.englishpod.audio.dg);
    add(DL_LABEL["ep.pdf"], "pdf", probe.englishpod.pdf);
  }
  add(DL_LABEL["six.mp3"], "audio", probe.sixmin.audio.main);
  add(DL_LABEL["six.pdf"], "pdf", probe.sixmin.pdf);
  if (probe.grammarBook) d.push({ labelUz: DL_LABEL["grammar"], kind: "pdf", path: probe.grammarBook.path, bytes: probe.grammarBook.bytes });
  return d;
}

// ── grammar topic: authored metadata + drills; bodyHtml filled by compile-grammar
function grammarTopic(o, slot, probe) {
  const g = {
    slot,
    unit: o.unit,
    titleUz: o.titleUz,
    titleEn: o.titleEn,
    bandLifter: o.bandLifter,
    cefrCanDo: o.cefrCanDo,
    bodyHtml: o.bodyHtml || "",            // compile-grammar overwrites from <id>-<slot>.md
    contrastUz: o.contrastUz,
    errorFixUz: o.errorFixUz,
    examples: o.examples,
    exercises: o.exercises,
  };
  if (o.reference && probe.grammarBook)
    g.reference = { book: o.reference.book, unit: o.reference.unit, downloadPath: probe.grammarBook.path };
  return g;
}

function assembleLesson(id) {
  const n = Number(/^core-(\d{2})$/.exec(id)?.[1]);
  if (!Number.isFinite(n)) return warn(`${id}: not a core-NN id, skipping`);

  const overlayPath = join(OVERLAY_DIR, `${id}.overlay.json`);
  if (!existsSync(overlayPath)) { warn(`${id}: no overlay (${overlayPath}) — skipping`); return "skipped"; }
  const probePath = join(RAW_DIR, id, "media.probe.json");
  if (!existsSync(probePath)) { warn(`${id}: no media.probe.json — run probe-media`); return "skipped"; }

  const o = readJson(overlayPath);
  const probe = readJson(probePath);
  const epDraft = existsSync(join(RAW_DIR, id, "englishpod.draft.json")) ? readJson(join(RAW_DIR, id, "englishpod.draft.json")) : null;

  // transcripts (faithful) — pov only where a POV transcript exists (L09–30).
  const transcripts = { main: ajTranscript(id, "main"), vocab: ajTranscript(id, "vocab") };
  const pov = ajTranscript(id, "pov");
  if (pov && pov.length) transcripts.pov = pov;
  transcripts.sixmin = o.sixmin?.transcript || sixMinTranscript(id);

  // EnglishPod block — null on L15 & L22 (section gated off, 02 §5).
  let englishpod = null;
  if (probe.englishpod) {
    const dialogue = (o.englishpod?.dialogue || (epDraft?.dialogue ?? [])).map((d) => ({ speaker: d.speaker, en: deHyphen(d.en) }));
    englishpod = {
      id: probe.englishpod.id,
      title: o.englishpod?.title || epDraft?.title || "",
      titleUz: o.englishpod?.titleUz || "",
      warmup: o.englishpod?.warmup || { uz: "", en: "" },
      audio: {
        dg: audioFromProbe(probe.englishpod.audio.dg),
        pr: audioFromProbe(probe.englishpod.audio.pr),
        rv: audioFromProbe(probe.englishpod.audio.rv),
      },
      dialogue,
      keyVocab: o.englishpod?.keyVocab || [],
    };
  }

  // 6ME block — present on all 30.
  const sixmin = {
    date: probe.sixmin.date,
    title: o.sixmin?.title || "",
    titleUz: o.sixmin?.titleUz || "",
    audio: { main: audioFromProbe(probe.sixmin.audio.main, "sixmin") },
    quiz: o.sixmin?.quiz || [],
    vocab: o.sixmin?.vocab || [],
  };

  const lesson = {
    schemaVersion: 2,
    id,
    track: "core",
    source: "aj-hoge",
    order: n,
    slug: o.slug,
    title: o.title,
    titleUz: o.titleUz,
    level: o.level,
    tags: o.tags || [],
    intro: o.intro,
    canDo: o.canDo,
    grammar: [grammarTopic(o.grammar[0], "A", probe), grammarTopic(o.grammar[1], "B", probe)],
    audio: {
      main: audioFromProbe(probe.audio.main, "main"),
      vocab: audioFromProbe(probe.audio.vocab, "vocab"),
      ministory: audioFromProbe(probe.audio.ministory, null),
      pov: audioFromProbe(probe.audio.pov, "pov"),      // null on L01–08 & L19 (declared null, 03 §6.2)
    },
    transcripts,
    ministory: { audioKey: "ministory", pairs: miniStoryPairs(id) },
    vocab: o.vocab,
    englishpod,
    sixmin,
    funEnglish: o.funEnglish,
    speakingPrompt: o.speakingPrompt,
    downloads: buildDownloads(probe),
  };

  const changed = writeJson(join(LESSONS_DIR, `${id}.json`), lesson);
  info(`${id}  ms:${lesson.ministory.pairs.length} main:${transcripts.main.length}p 6ME:${transcripts.sixmin.length}turns ep:${englishpod ? englishpod.id : "null"}  ${changed ? "written" : "unchanged"}`);
  return changed ? "written" : "unchanged";
}

function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  let targets = ids;
  if (!targets.length) {                 // default: every lesson that has an overlay
    targets = Array.from({ length: 30 }, (_, i) => `core-${pad2(i + 1)}`)
      .filter((id) => existsSync(join(OVERLAY_DIR, `${id}.overlay.json`)));
  }
  if (!targets.length) return fail("assemble-lesson: no overlays found in authoring/lessons/");
  step(`assemble-lesson → data/lessons/*.json  (${targets.length} lesson${targets.length > 1 ? "s" : ""})`);
  let n = 0;
  for (const id of targets) if (["written", "unchanged"].includes(assembleLesson(id))) n++;
  ok(`assemble-lesson done: ${n} lesson${n === 1 ? "" : "s"}`);
}

main();
