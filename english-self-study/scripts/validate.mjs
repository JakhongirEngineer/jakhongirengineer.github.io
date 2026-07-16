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
const SOURCES = ["aj-hoge", "6min", "englishpod"];
const TRACKS = ["core", "supp"];

function makeChecker(scope) {
  const errs = [];
  const isStr = (v) => typeof v === "string" && v.length > 0;
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isBool = (v) => typeof v === "boolean";
  const isInt = (v) => Number.isInteger(v);
  const c = (cond, msg) => { if (!cond) errs.push(`${scope}: ${msg}`); };
  return { errs, isStr, isNum, isBool, isInt, c };
}

function validateLesson(id, l) {
  const { errs, isStr, isNum, isInt, c } = makeChecker(id);

  c(l.schemaVersion === 1, `schemaVersion must be 1 (got ${l.schemaVersion})`);
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

  // grammar (03 §6.2)
  const g = l.grammar;
  if (!g) c(false, "grammar object is required");
  else {
    c(isStr(g.unit), "grammar.unit must be a non-empty string");
    c(isStr(g.titleUz), "grammar.titleUz must be a non-empty string");
    c(isStr(g.bodyHtml) && /<\w+>/.test(g.bodyHtml), "grammar.bodyHtml must be compiled HTML (precompiled + sanitized)");
    c(!/<(script|style|iframe|on\w+=)/i.test(g.bodyHtml || ""), "grammar.bodyHtml must not contain script/style/iframe/handlers (sanitized)");
    c(isStr(g.contrastUz), "grammar.contrastUz must be a non-empty string (L1 contrast)");
    c(isStr(g.errorFixUz), "grammar.errorFixUz must be a non-empty string (Xato tuzatish card)");
    c(Array.isArray(g.examples) && g.examples.length > 0 && g.examples.every((e) => isStr(e.en) && isStr(e.uz)),
      "grammar.examples must be a non-empty array of {en, uz}");
    c(Array.isArray(g.exercises) && g.exercises.length > 0 && g.exercises.every((x) => isStr(x.type)),
      "grammar.exercises must be a non-empty array with a type on each");
    c(g.reference && isStr(g.reference.book) && isInt(g.reference.unit) && isStr(g.reference.downloadPath),
      "grammar.reference must be {book, unit:int, downloadPath}");
  }

  // audio — keys nullable; present ones fully specified (03 §6.2)
  c(l.audio && typeof l.audio === "object", "audio object is required");
  if (l.audio) for (const [k, a] of Object.entries(l.audio)) {
    if (a === null) continue; // null encodes an inventory gap (e.g. L01–08/L19 pov)
    c(isStr(a.path), `audio.${k}.path must be a string key`);
    c(isNum(a.durationSec) && a.durationSec >= 0, `audio.${k}.durationSec must be a number`);
    c(isNum(a.bytes) && a.bytes >= 0, `audio.${k}.bytes must be a number`);
    c(a.transcriptKey === null || isStr(a.transcriptKey), `audio.${k}.transcriptKey must be string|null`);
  }

  // transcripts — arrays of paragraph strings
  if (l.transcripts) for (const [k, arr] of Object.entries(l.transcripts))
    c(Array.isArray(arr) && arr.every(isStr), `transcripts.${k} must be an array of strings`);

  // ministory (AJ core), dialogue (EnglishPod), quiz (6ME) — presence per source
  if (l.ministory !== null && l.ministory !== undefined) {
    c(isStr(l.ministory.audioKey), "ministory.audioKey must be a string");
    c(Array.isArray(l.ministory.pairs) && l.ministory.pairs.length > 0 &&
      l.ministory.pairs.every((p) => isStr(p.q) && isStr(p.a)), "ministory.pairs must be non-empty {q,a} array");
  }
  c(Array.isArray(l.vocab) && l.vocab.every((v) => isStr(v.en) && isStr(v.uz)),
    "vocab must be an array of at least {en, uz}");
  c(l.dialogue === null || Array.isArray(l.dialogue), "dialogue must be null or an array");
  c(l.quiz === null || Array.isArray(l.quiz), "quiz must be null or an array");
  c(Array.isArray(l.funEnglish) && l.funEnglish.every((f) => isStr(f.provider) && (f.id === null || isStr(f.id)) && isStr(f.title) && isStr(f.channel)),
    "funEnglish must be an array of {provider, id:string|null, title, channel}");
  c(Array.isArray(l.downloads) && l.downloads.length > 0 &&
    l.downloads.every((d) => isStr(d.labelUz) && isStr(d.kind) && isStr(d.path) && isNum(d.bytes)),
    "downloads must be a non-empty array of {labelUz, kind, path, bytes}");

  // source-specific sanity (03 §6.2 supplementary shapes)
  if (l.source === "aj-hoge") {
    c(l.dialogue === null, "aj-hoge lesson must have dialogue:null");
    c(l.quiz === null, "aj-hoge lesson must have quiz:null");
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
    c(Array.isArray(e.tags), `${at}: tags must be array`);
    c(e.grammarUnit === null || isStr(e.grammarUnit), `${at}: grammarUnit must be string|null`);
    c(isNum(e.durationSec) && e.durationSec >= 0, `${at}: durationSec must be number`);
    c(isBool(e.hasPov) && isBool(e.hasQuiz) && isBool(e.hasDialogue), `${at}: hasPov/hasQuiz/hasDialogue must be booleans`);
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
