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

// Compile the Markdown at `mdPath` into sanitized HTML for one topic slot.
// Returns the html string, or null when the file is absent.
function compileTopic(id, mdPath) {
  if (!existsSync(mdPath)) return null;
  const html = renderGrammarMarkdown(readText(mdPath));
  if (!html) return fail(`${id}: grammar Markdown compiled to empty HTML (${mdPath})`);
  return html;
}

function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = ids.length ? ids : curatedLessonIds();
  if (!targets.length) return fail("compile-grammar: no lessons to compile");
  step(`compile-grammar → grammar[].bodyHtml  (markdown-it + sanitize)`);

  const gdir = join(AUTHORING_DIR, "grammar");
  let compiled = 0;
  for (const id of targets) {
    const jsonPath = join(LESSONS_DIR, `${id}.json`);
    if (!existsSync(jsonPath)) { warn(`${id}: no lesson JSON, skipping`); continue; }
    const lesson = readJson(jsonPath);
    if (!lesson.grammar) return fail(`${id}: JSON has no "grammar" to fill`);

    // v2: grammar is an ARRAY of two topics (03 §6.2). Each element `grammar[i]`
    // (slot A/B) reads authoring/grammar/<id>-a.md and <id>-b.md respectively.
    // v1 fallback: a single grammar object reads authoring/grammar/<id>.md.
    if (Array.isArray(lesson.grammar)) {
      const slots = ["a", "b"];
      let touched = 0;
      lesson.grammar.forEach((topic, i) => {
        const slot = (topic.slot || slots[i] || String(i)).toLowerCase();
        const mdPath = join(gdir, `${id}-${slot}.md`);
        const html = compileTopic(id, mdPath);
        if (html == null) {
          if (!topic.bodyHtml) warn(`${id} [${slot}]: no authoring/grammar/${id}-${slot}.md and empty bodyHtml`);
          return;
        }
        topic.bodyHtml = html;
        info(`${id} [${slot}]: bodyHtml ${html.length} chars`);
        touched++;
      });
      if (touched) { const changed = writeJson(jsonPath, lesson); info(`${id}: ${touched} topic(s) ${changed ? "written" : "unchanged"}`); compiled++; }
    } else {
      const html = compileTopic(id, join(gdir, `${id}.md`));
      if (html == null) { if (!lesson.grammar.bodyHtml) warn(`${id}: no authoring/grammar/${id}.md and empty bodyHtml`); continue; }
      lesson.grammar.bodyHtml = html;
      const changed = writeJson(jsonPath, lesson);
      info(`${id}: bodyHtml ${html.length} chars ${changed ? "(updated)" : "(unchanged)"}`);
      compiled++;
    }
  }
  ok(`compile-grammar done: ${compiled} lesson${compiled === 1 ? "" : "s"}`);
}

main();
