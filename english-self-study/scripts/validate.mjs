#!/usr/bin/env node
// scripts/validate.mjs — schema check for data/lessons/*.json (03 §6.2) and
// data/index.json (03 §6.1). Programmatic gate for the S1 "Done when": both
// validate against the schema. Exits non-zero on any violation.

import { join } from "node:path";
import { existsSync } from "node:fs";
import {
  DATA_DIR, LESSONS_DIR, curatedLessonIds, readJson, step, ok, warn, fail, log,
} from "./lib/util.mjs";

const LEVELS = ["A2", "A2-B1", "B1", "B1-B2"];
const SOURCES = ["aj-hoge", "6min", "englishpod"];  // source stays "aj-hoge" on every weekly lesson (03 §6.1)
const TRACKS = ["core", "supp"];                    // track stays "core"; "supp" kept for back-compat only
const GRAMMAR_SLOTS = ["A", "B"];

function makeChecker(scope) {
  const errs = [];
  const isStr = (v) => typeof v === "string" && v.length > 0;
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isBool = (v) => typeof v === "boolean";
  const isInt = (v) => Number.isInteger(v);
  const c = (cond, msg) => { if (!cond) errs.push(`${scope}: ${msg}`); };
  return { errs, isStr, isNum, isBool, isInt, c };
}

// One media-audio node: { path, durationSec, bytes, transcriptKey? } (03 §6.2).
function checkAudioNode(c, isStr, isNum, a, where, { requireTranscriptKey = false } = {}) {
  c(a && typeof a === "object", `${where} must be an object`);
  if (!a || typeof a !== "object") return;
  c(isStr(a.path), `${where}.path must be a string key`);
  c(isNum(a.durationSec) && a.durationSec >= 0, `${where}.durationSec must be a number`);
  c(isNum(a.bytes) && a.bytes >= 0, `${where}.bytes must be a number`);
  if (requireTranscriptKey || "transcriptKey" in a)
    c(a.transcriptKey === null || isStr(a.transcriptKey), `${where}.transcriptKey must be string|null`);
}

// One grammar topic (03 §6.2 v2: grammar is an array of exactly two of these).
function checkGrammarTopic(c, isStr, isInt, g, where) {
  c(g && typeof g === "object", `${where} must be an object`);
  if (!g || typeof g !== "object") return;
  c(GRAMMAR_SLOTS.includes(g.slot), `${where}.slot must be "A" or "B" (got "${g.slot}")`);
  c(isStr(g.unit), `${where}.unit must be a non-empty string`);
  c(isStr(g.titleUz), `${where}.titleUz must be a non-empty string`);
  c(isStr(g.titleEn), `${where}.titleEn must be a non-empty string`);
  c(isStr(g.bandLifter), `${where}.bandLifter tag must be a non-empty string (02 §2/§4)`);
  c(isStr(g.cefrCanDo), `${where}.cefrCanDo tag must be a non-empty string (02 §2/§4)`);
  c(isStr(g.bodyHtml) && /<\w+>/.test(g.bodyHtml), `${where}.bodyHtml must be compiled HTML (precompiled + sanitized) — run compile-grammar`);
  c(!/<(script|style|iframe|on\w+=)/i.test(g.bodyHtml || ""), `${where}.bodyHtml must not contain script/style/iframe/handlers (sanitized)`);
  c(isStr(g.contrastUz), `${where}.contrastUz must be a non-empty string (L1 contrast)`);
  c(isStr(g.errorFixUz), `${where}.errorFixUz must be a non-empty string (Xato tuzatish card)`);
  c(Array.isArray(g.examples) && g.examples.length > 0 && g.examples.every((e) => isStr(e.en) && isStr(e.uz)),
    `${where}.examples must be a non-empty array of {en, uz}`);
  c(Array.isArray(g.exercises) && g.exercises.length > 0 && g.exercises.every((x) => isStr(x.type)),
    `${where}.exercises must be a non-empty array with a type on each`);
  // exercise-type sanity: options[] (if present) must be strings; say-true carries answer:null.
  (Array.isArray(g.exercises) ? g.exercises : []).forEach((x, i) => {
    if ("options" in x) c(Array.isArray(x.options) && x.options.every(isStr), `${where}.exercises[${i}].options must be an array of strings`);
    if (x.type === "say-true") c(x.answer === null, `${where}.exercises[${i}] (say-true) must have answer:null`);
  });
  // reference is OPTIONAL (Murphy is download-only); validate only when present.
  if (g.reference !== undefined)
    c(g.reference && isStr(g.reference.book) && isInt(g.reference.unit) && isStr(g.reference.downloadPath),
      `${where}.reference (optional) must be {book, unit:int, downloadPath}`);
}

// EnglishPod block — object-or-null (null gates the section off on L15/L22, 03 §6.2).
function checkEnglishPod(c, isStr, isNum, ep) {
  if (ep === null) return;                     // gated off — valid
  c(ep && typeof ep === "object", "englishpod must be an object or null");
  if (!ep || typeof ep !== "object") return;
  c(isStr(ep.id), "englishpod.id must be a string");
  c(isStr(ep.title) && isStr(ep.titleUz), "englishpod.title + titleUz required");
  c(ep.warmup && isStr(ep.warmup.uz) && isStr(ep.warmup.en), "englishpod.warmup must have {uz, en}");
  c(ep.audio && typeof ep.audio === "object", "englishpod.audio must be an object");
  for (const s of ["dg", "pr", "rv"]) if (ep.audio && ep.audio[s] !== undefined) checkAudioNode(c, isStr, isNum, ep.audio[s], `englishpod.audio.${s}`);
  c(ep.audio && ep.audio.dg, "englishpod.audio.dg (the ~1-min dialogue) is required");
  c(Array.isArray(ep.dialogue) && ep.dialogue.length > 0 && ep.dialogue.every((d) => isStr(d.speaker) && isStr(d.en)),
    "englishpod.dialogue must be a non-empty array of {speaker, en}");
  c(Array.isArray(ep.keyVocab) && ep.keyVocab.length > 0 && ep.keyVocab.every((v) => isStr(v.en) && isStr(v.uz)),
    "englishpod.keyVocab must be a non-empty array of {en, uz} (Uzbek gloss added)");
}

// 6 Minute English block — present on ALL 30 lessons (03 §6.2).
function checkSixMin(c, isStr, isNum, isInt, sm) {
  c(sm && typeof sm === "object", "sixmin block is required (present on all 30 lessons)");
  if (!sm || typeof sm !== "object") return;
  c(isStr(sm.date), "sixmin.date must be a string (YYMMDD)");
  c(isStr(sm.title) && isStr(sm.titleUz), "sixmin.title + titleUz required");
  c(sm.audio && sm.audio.main, "sixmin.audio.main is required");
  if (sm.audio && sm.audio.main) checkAudioNode(c, isStr, isNum, sm.audio.main, "sixmin.audio.main", { requireTranscriptKey: true });
  c(Array.isArray(sm.quiz) && sm.quiz.length > 0, "sixmin.quiz must be a non-empty array");
  (Array.isArray(sm.quiz) ? sm.quiz : []).forEach((q, i) => {
    c(isStr(q.q), `sixmin.quiz[${i}].q must be a string`);
    c(Array.isArray(q.options) && q.options.length >= 2 && q.options.every(isStr), `sixmin.quiz[${i}].options must be ≥2 strings`);
    c(isInt(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < (q.options || []).length, `sixmin.quiz[${i}].answerIndex must index options`);
    c(isStr(q.explanationUz), `sixmin.quiz[${i}].explanationUz must be a non-empty Uzbek string`);
  });
  c(Array.isArray(sm.vocab) && sm.vocab.length > 0 && sm.vocab.every((v) => isStr(v.en) && isStr(v.uz)),
    "sixmin.vocab must be a non-empty array of {en, uz} (6-word pack + Uzbek gloss)");
}

function validateLesson(id, l) {
  const { errs, isStr, isNum, isInt, c } = makeChecker(id);

  c(l.schemaVersion === 2, `schemaVersion must be 2 — the v2 weekly shape (got ${l.schemaVersion})`);
  c(l.id === id, `id must equal filename ("${id}", got "${l.id}")`);
  c(TRACKS.includes(l.track), `track must be one of ${TRACKS} (got "${l.track}")`);
  c(SOURCES.includes(l.source), `source must be one of ${SOURCES} (got "${l.source}")`);
  c(isInt(l.order) && l.order >= 1, `order must be a positive integer (got ${l.order})`);
  c(isStr(l.slug), "slug must be a non-empty string");
  c(isStr(l.title), "title must be a non-empty string");
  c(isStr(l.titleUz), "titleUz must be a non-empty string");
  c(LEVELS.includes(l.level), `level must be one of ${LEVELS} (got "${l.level}")`);
  c(Array.isArray(l.tags) && l.tags.every(isStr), "tags must be an array of strings");
  c(l.intro && isStr(l.intro.uz) && isStr(l.intro.en), "intro must have non-empty {uz, en}");
  c(l.canDo && isStr(l.canDo.uz) && isStr(l.canDo.en), "canDo must have non-empty {uz, en} (section ⓿ goal)");

  // grammar — ARRAY of exactly TWO original topics (03 §6.2 v2)
  c(Array.isArray(l.grammar) && l.grammar.length === 2, `grammar must be an array of exactly 2 topics (got ${Array.isArray(l.grammar) ? l.grammar.length : typeof l.grammar})`);
  if (Array.isArray(l.grammar)) {
    l.grammar.forEach((g, i) => checkGrammarTopic(c, isStr, isInt, g, `grammar[${i}]`));
    if (l.grammar[0]) c(l.grammar[0].slot === "A", "grammar[0].slot must be \"A\" (Days 1–2)");
    if (l.grammar[1]) c(l.grammar[1].slot === "B", "grammar[1].slot must be \"B\" (Days 3–4)");
  }

  // audio — keys nullable; present ones fully specified (03 §6.2)
  c(l.audio && typeof l.audio === "object", "audio object is required");
  if (l.audio) for (const [k, a] of Object.entries(l.audio)) {
    if (a === null) continue; // null encodes an inventory gap (e.g. L01–08/L19 pov)
    checkAudioNode(c, isStr, isNum, a, `audio.${k}`, { requireTranscriptKey: true });
  }

  // transcripts — arrays of paragraph strings; sixmin read-along required (03 §6.2)
  if (l.transcripts) for (const [k, arr] of Object.entries(l.transcripts))
    c(Array.isArray(arr) && arr.every(isStr), `transcripts.${k} must be an array of strings`);
  c(l.transcripts && Array.isArray(l.transcripts.sixmin) && l.transcripts.sixmin.length > 0,
    "transcripts.sixmin (6ME read-along) is required");

  // ministory (AJ core)
  if (l.ministory !== null && l.ministory !== undefined) {
    c(isStr(l.ministory.audioKey), "ministory.audioKey must be a string");
    c(Array.isArray(l.ministory.pairs) && l.ministory.pairs.length > 0 &&
      l.ministory.pairs.every((p) => isStr(p.q) && isStr(p.a)), "ministory.pairs must be non-empty {q,a} array");
  }
  c(Array.isArray(l.vocab) && l.vocab.every((v) => isStr(v.en) && isStr(v.uz)),
    "vocab must be an array of at least {en, uz}");

  // v2 folded-in sections (03 §6.2): englishpod{} | null, sixmin{}
  c("englishpod" in l, "englishpod key must be present (object or null)");
  checkEnglishPod(c, isStr, isNum, l.englishpod);
  checkSixMin(c, isStr, isNum, isInt, l.sixmin);
  // the retired top-level supp shapes must be gone (they now live inside englishpod/sixmin)
  c(!("dialogue" in l), "top-level dialogue must be removed (now englishpod.dialogue)");
  c(!("quiz" in l), "top-level quiz must be removed (now sixmin.quiz)");

  c(Array.isArray(l.funEnglish) && l.funEnglish.every((f) => isStr(f.provider) && (f.id === null || isStr(f.id)) && isStr(f.title) && isStr(f.channel)),
    "funEnglish must be an array of {provider, id:string|null, title, channel}");

  // speakingPrompt — the section ⑨ Speak-It prompt (04 §4.3 ⑨/behavior 10, S4). Present on
  // all 30 lessons; IELTS-style English prompt + Uzbek instruction (uses the week's 2 grammar
  // topics). targetSec is OPTIONAL (~60-sec guidance; the renderer defaults to 60).
  c(l.speakingPrompt && isStr(l.speakingPrompt.uz) && isStr(l.speakingPrompt.en),
    "speakingPrompt must have non-empty {uz, en} (section ⑨ Speak-It prompt, 04 §4.3)");
  if (l.speakingPrompt && "targetSec" in l.speakingPrompt)
    c(isNum(l.speakingPrompt.targetSec) && l.speakingPrompt.targetSec > 0, "speakingPrompt.targetSec must be a positive number");
  c(Array.isArray(l.downloads) && l.downloads.length > 0 &&
    l.downloads.every((d) => isStr(d.labelUz) && isStr(d.kind) && isStr(d.path) && isNum(d.bytes)),
    "downloads must be a non-empty array of {labelUz, kind, path, bytes}");

  // source-specific sanity — a weekly lesson is always aj-hoge with a mini-story
  if (l.source === "aj-hoge") {
    c(l.ministory && l.ministory.pairs, "aj-hoge lesson must carry a ministory");
    if (l.order >= 9) c(l.audio && (l.audio.pov !== undefined), "aj-hoge L09–30 must declare audio.pov (mp3 or null for L19)");
  }
  return errs;
}

function validateIndex(idx, curatedIds) {
  const { errs, isStr, isNum, isBool, isInt, c } = makeChecker("index.json");
  c(idx.schemaVersion === 1, `schemaVersion must be 1 (got ${idx.schemaVersion})`);
  c(/^\d{4}-\d{2}-\d{2}$/.test(idx.generated || ""), `generated must be YYYY-MM-DD (got "${idx.generated}")`);
  c(Array.isArray(idx.lessons) && idx.lessons.length > 0, "lessons must be a non-empty array");
  const seen = new Set();
  for (const [i, e] of (idx.lessons || []).entries()) {
    const at = `lessons[${i}] (${e.id})`;
    c(isStr(e.id), `${at}: id must be a string`);
    c(!seen.has(e.id), `${at}: duplicate id`); seen.add(e.id);
    c(curatedIds.includes(e.id), `${at}: no data/lessons/${e.id}.json`);
    c(TRACKS.includes(e.track), `${at}: bad track "${e.track}"`);
    c(SOURCES.includes(e.source), `${at}: bad source "${e.source}"`);
    c(isInt(e.order) && e.order >= 1, `${at}: order must be positive int`);
    c(isStr(e.slug) && isStr(e.title) && isStr(e.titleUz), `${at}: slug/title/titleUz required`);
    c(LEVELS.includes(e.level), `${at}: bad level "${e.level}"`);
    c(isInt(e.phase) && e.phase >= 1 && e.phase <= 3, `${at}: phase must be 1|2|3 (03 §6.1)`);
    c(Array.isArray(e.tags), `${at}: tags must be array`);
    c(Array.isArray(e.grammarUnits) && e.grammarUnits.length === 2 && e.grammarUnits.every(isStr),
      `${at}: grammarUnits must be the TWO topic slugs (03 §6.1)`);
    // grammarTitlesUz — OPTIONAL (added S5 for the map); when present, the TWO Uzbek topic titles.
    if ("grammarTitlesUz" in e)
      c(Array.isArray(e.grammarTitlesUz) && e.grammarTitlesUz.length === 2 && e.grammarTitlesUz.every(isStr),
        `${at}: grammarTitlesUz (optional) must be a 2-string array (03 §6.1)`);
    c(isNum(e.durationSec) && e.durationSec >= 0, `${at}: durationSec must be number`);
    c(isBool(e.hasPov) && isBool(e.hasEnglishPod), `${at}: hasPov/hasEnglishPod must be booleans (03 §6.1)`);
    c(isInt(e.youtubeCount) && e.youtubeCount >= 0, `${at}: youtubeCount must be non-negative int`);
  }
  return errs;
}

function main() {
  step("validate — data/lessons/*.json (03 §6.2) + data/index.json (03 §6.1)");
  const ids = curatedLessonIds();
  if (!ids.length) return fail("validate: nothing to validate");
  let allErrs = [];

  for (const id of ids) {
    const errs = validateLesson(id, readJson(join(LESSONS_DIR, `${id}.json`)));
    if (errs.length) allErrs.push(...errs); else ok(`${id}.json valid (03 §6.2)`);
  }

  const idxPath = join(DATA_DIR, "index.json");
  if (!existsSync(idxPath)) allErrs.push("index.json: missing (run build-index)");
  else {
    const errs = validateIndex(readJson(idxPath), ids);
    if (errs.length) allErrs.push(...errs); else ok(`index.json valid (03 §6.1)`);
  }

  if (allErrs.length) {
    log("");
    for (const e of allErrs) warn(e);
    return fail(`validate FAILED: ${allErrs.length} schema violation(s)`);
  }
  ok("validate passed: all lesson JSON + index.json conform to the schema");
}

main();
