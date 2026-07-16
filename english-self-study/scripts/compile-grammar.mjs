#!/usr/bin/env node
// scripts/compile-grammar.mjs — precompile the authored Uzbek Grammar-Spark
// Markdown → sanitized HTML into each lesson's grammar.bodyHtml (03 §4, §6.2).
//
// Source of truth: authoring/grammar/<id>.md (committed, restricted Markdown).
// Output: data/lessons/<id>.json's grammar.bodyHtml (the served artifact carries
// only the compiled HTML — runtime ships zero markdown code). Idempotent: same
// Markdown → same HTML → skip-write-if-identical, so pipeline re-runs are stable.

import { join } from "node:path";
import { existsSync } from "node:fs";
import {
  AUTHORING_DIR, LESSONS_DIR, curatedLessonIds, readText, readJson, writeJson,
  step, ok, info, warn, fail,
} from "./lib/util.mjs";
import { renderGrammarMarkdown } from "./lib/markdown.mjs";

function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = ids.length ? ids : curatedLessonIds();
  if (!targets.length) return fail("compile-grammar: no lessons to compile");
  step(`compile-grammar → grammar.bodyHtml  (markdown-it + sanitize)`);

  let compiled = 0;
  for (const id of targets) {
    const mdPath = join(AUTHORING_DIR, "grammar", `${id}.md`);
    const jsonPath = join(LESSONS_DIR, `${id}.json`);
    if (!existsSync(jsonPath)) { warn(`${id}: no lesson JSON, skipping`); continue; }
    if (!existsSync(mdPath)) {
      const l = readJson(jsonPath);
      if (l.grammar && !l.grammar.bodyHtml) warn(`${id}: grammar present but no authoring/grammar/${id}.md and empty bodyHtml`);
      continue;
    }
    const html = renderGrammarMarkdown(readText(mdPath));
    if (!html) return fail(`${id}: grammar Markdown compiled to empty HTML`);
    const lesson = readJson(jsonPath);
    if (!lesson.grammar) return fail(`${id}: JSON has no "grammar" object to fill`);
    lesson.grammar.bodyHtml = html;
    const changed = writeJson(jsonPath, lesson);
    info(`${id}: bodyHtml ${html.length} chars ${changed ? "(updated)" : "(unchanged)"}`);
    compiled++;
  }
  ok(`compile-grammar done: ${compiled} lesson${compiled === 1 ? "" : "s"}`);
}

main();
