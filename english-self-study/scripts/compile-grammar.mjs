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
// Returns the html string, or null when the file is absent. Throws a plain Error
// (caught per-lesson by the batch loop) when the file exists but compiles empty —
// so one bad topic never aborts a full-course (all-30) compile run.
function compileTopic(mdPath) {
  if (!existsSync(mdPath)) return null;
  const html = renderGrammarMarkdown(readText(mdPath));
  if (!html) throw new Error(`grammar Markdown compiled to empty HTML (${mdPath})`);
  return html;
}

// Compile ONE lesson's grammar[].bodyHtml in place. Only the grammar block is
// touched — the folded-in englishpod{}/sixmin{} blocks (and every other field) are
// round-tripped untouched by readJson→writeJson, so S13 can re-run this at any point
// while authoring the EP/6ME sections. Returns "written" | "unchanged" | "skipped".
function compileLesson(id, gdir) {
  const jsonPath = join(LESSONS_DIR, `${id}.json`);
  if (!existsSync(jsonPath)) { warn(`${id}: no lesson JSON, skipping`); return "skipped"; }
  const lesson = readJson(jsonPath);
  if (!lesson.grammar) { warn(`${id}: JSON has no "grammar" to fill, skipping`); return "skipped"; }

  // v2: grammar is an ARRAY of two topics (03 §6.2). Each element `grammar[i]`
  // (slot A/B) reads authoring/grammar/<id>-a.md and <id>-b.md respectively.
  // v1 fallback: a single grammar object reads authoring/grammar/<id>.md.
  if (Array.isArray(lesson.grammar)) {
    const slots = ["a", "b"];
    let touched = 0;
    lesson.grammar.forEach((topic, i) => {
      const slot = (topic.slot || slots[i] || String(i)).toLowerCase();
      const html = compileTopic(join(gdir, `${id}-${slot}.md`));
      if (html == null) {
        if (!topic.bodyHtml) warn(`${id} [${slot}]: no authoring/grammar/${id}-${slot}.md and empty bodyHtml`);
        return;
      }
      topic.bodyHtml = html;
      info(`${id} [${slot}]: bodyHtml ${html.length} chars`);
      touched++;
    });
    if (!touched) return "skipped";
    const changed = writeJson(jsonPath, lesson);   // preserves englishpod/sixmin + all other fields
    info(`${id}: ${touched} topic(s) ${changed ? "written" : "unchanged"}`);
    return changed ? "written" : "unchanged";
  }
  const html = compileTopic(join(gdir, `${id}.md`));
  if (html == null) { if (!lesson.grammar.bodyHtml) warn(`${id}: no authoring/grammar/${id}.md and empty bodyHtml`); return "skipped"; }
  lesson.grammar.bodyHtml = html;
  const changed = writeJson(jsonPath, lesson);
  info(`${id}: bodyHtml ${html.length} chars ${changed ? "(updated)" : "(unchanged)"}`);
  return changed ? "written" : "unchanged";
}

function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const targets = ids.length ? ids : curatedLessonIds();
  if (!targets.length) return fail("compile-grammar: no lessons to compile");
  step(`compile-grammar → grammar[].bodyHtml  (markdown-it + sanitize)`);

  const gdir = join(AUTHORING_DIR, "grammar");
  let compiled = 0;
  const failures = [];
  // Per-lesson isolation: a single lesson's error is collected and the batch
  // continues, then we fail once at the end (like validate.mjs) — so authoring the
  // remaining lessons of the 30 isn't blocked by one in-progress lesson.
  for (const id of targets) {
    try {
      const result = compileLesson(id, gdir);
      if (result === "written" || result === "unchanged") compiled++;
    } catch (e) {
      failures.push(`${id}: ${e.message}`);
      warn(`${id}: ${e.message}`);
    }
  }
  if (failures.length) return fail(`compile-grammar: ${failures.length} lesson(s) failed:\n  - ${failures.join("\n  - ")}`);
  ok(`compile-grammar done: ${compiled} lesson${compiled === 1 ? "" : "s"}`);
}

main();
