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

// ── EnglishPod PDF → curation drafts (03 §5.1) ───────────────────────────────
// The EnglishPod PDFs repeat a fixed boilerplate on every page (title line,
// copyright, the "Visit the Online Review…" footer). Strip it so the dialogue +
// Key-Vocab drafts are clean for ANY of the 28 episodes S13 will author.
const EP_BOILER = /^(visit the online review|.*praxis language ltd|.*\bc©|\(text version\)\.?$)/i;
const EP_SECTION = /^(key vocabulary|supplementary vocabulary|language takeaway|vocabulary|discussion|expansion|grammar)\b/i;

const epCleanLines = (text) =>
  text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter((l) => l && !EP_BOILER.test(l));

const firstMeaningfulLine = (text) => (text.replace(/\r/g, "").split("\n").map((l) => l.trim()).find(Boolean)) || "";
// EnglishPod title = the PDF's first line minus its trailing "(C0026)" id tag.
const epTitleFrom = (text) => firstMeaningfulLine(text).replace(/\s*\([Cc]?\d{3,4}\)\s*$/, "").trim();

// Best-effort speaker split for the EnglishPod dialogue draft (a curation aid,
// 03 §5.1). The dg transcript lines start with a role tag ("A:", "B:", "Jerry:")
// — we take the region between the "Dialog"/"Dialogue" header (when present) and
// the first vocab/section header, with boilerplate already stripped. A line with
// no role tag is a wrap of the previous line. Curation refines this by hand.
function splitEnglishPodDialogue(text) {
  const lines = epCleanLines(text);
  const startAt = lines.findIndex((l) => /^dialog(ue)?\b/i.test(l));
  const endAt = lines.findIndex((l) => EP_SECTION.test(l));
  const region = lines.slice(startAt >= 0 ? startAt + 1 : 0, endAt >= 0 ? endAt : lines.length);
  const out = [];
  for (const l of region) {
    const m = /^([A-Za-z][\w .'’-]{0,24}?):\s*(.+)$/.exec(l);
    if (m) out.push({ speaker: m[1].trim(), en: m[2].trim() });
    else if (out.length) out[out.length - 1].en += " " + l;   // wrapped line
  }
  return out;
}

// The "Key Vocabulary" region as cleaned, de-hyphenated lines (02 §3.3). EnglishPod
// PDFs typeset it as a term|POS|definition table that pdf-to-text mangles (POS tokens
// interleaved, hyphenated wraps like "sin-"+"gular"), so we emit the RAW cleaned
// region — deterministic and honest — rather than a fragile auto-structured array.
// S13 curates each entry into {en, uz, defEn}, ADDING the Uzbek gloss (the whole point).
function englishPodKeyVocabRaw(text) {
  const raw = text.replace(/\r/g, "").split("\n").map((l) => l.trim());
  const start = raw.findIndex((l) => /^key vocabulary\b/i.test(l));
  if (start < 0) return [];
  let end = raw.findIndex((l, i) => i > start && /^(supplementary|language takeaway|discussion|expansion|grammar)\b/i.test(l));
  if (end < 0) end = raw.length;
  const region = raw.slice(start + 1, end).filter((l) => l && !EP_BOILER.test(l));
  // de-hyphenate line-wraps ("sin-\ngular" → "singular"), keep one line per PDF row.
  return region.join("\n").replace(/-\n/g, "").split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
}

// ── 6 Minute English PDF → curation drafts (03 §5.1) ─────────────────────────
// 6ME title = the page-1 line after the "6 Minute English" header (02 §5/§10).
function sixTitleFrom(text) {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const i = lines.findIndex((l) => /6\s*minute\s*english/i.test(l));
  return (i >= 0 ? lines.slice(i + 1) : lines).find((l) => l && !/^bbc/i.test(l) && !/not a word-for-word/i.test(l)) || "";
}

// The pre-listening MCQ (04 §5.10): the "a) … b) … c) …" block + the question stem
// just before it. answerIndex/explanationUz are NOT in the transcript as data (the
// answer is revealed in prose) → left null for the author to fill from the re-listen.
function parseSixMinQuiz(text) {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim());
  const optIdx = lines.map((l, i) => (/^[a-c]\)\s*\S/i.test(l) ? i : -1)).filter((i) => i >= 0);
  if (optIdx.length < 2) return [];
  const options = optIdx.map((i) =>
    lines[i].replace(/^[a-c]\)\s*/i, "").replace(/\s+(or|and)\s*$/i, "").replace(/[?,.]+$/, "").trim());
  // question = up to ~4 non-blank lines before the first option, cut to the interrogative core.
  let q = "";
  for (let i = optIdx[0] - 1; i >= 0 && i >= optIdx[0] - 4; i--) { if (!lines[i]) break; q = lines[i] + " " + q; }
  q = q.replace(/\s+/g, " ").trim();
  // cut to the interrogative core — prefer a wh-word start over a leading auxiliary
  // ("…you can tell me, how many…" → "how many…").
  const m = q.match(/((?:how|what|which|where|when|why)\b.*)$/i) || q.match(/((?:is it|does|do|are|will|can)\b.*)$/i);
  if (m) q = m[1].trim();
  q = q.replace(/\bis it…?\s*$/i, "").replace(/[\s…]+$/, "").trim();
  return [{ q, options, answerIndex: null, explanationUz: "" }];
}

// The vocabulary-discussion region (from "…talk through the vocabulary…" to the end)
// as cleaned lines. The 6 target words are named inconsistently (some quoted, some
// not — 02 §10), so we emit the raw region for the author to pick the 6 + add glosses,
// rather than mis-extract. Deterministic.
function sixMinVocabRegion(text) {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim());
  const start = lines.findIndex((l) => /talk through the vocabulary|vocabulary items we heard|now.{0,12}vocabulary/i.test(l));
  if (start < 0) return [];
  return lines.slice(start).filter((l) => l && !/^(6 minute english ©|bbclearningenglish\.com)/i.test(l));
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
  // resolveCoreEpisodes is the deterministic source of truth for the weave and
  // returns englishpod:null on L15 & L22 (section gated off). We emit, into the same
  // data/raw/<id>/ dir, the curation drafts S13 turns into the lesson JSON
  // englishpod{}/sixmin{} blocks. This runs for ANY aj-hoge id, not only curated ones.
  if (meta.source === "aj-hoge") {
    const { englishpod, sixmin } = resolveCoreEpisodes(meta.ajNumber);
    if (englishpod?.pdf) {
      const epText = await pdfPlainText(englishpod.pdf.src);
      writeTextFile(join(outDir, "englishpod.txt"), epText);
      // englishpod.draft.json mirrors the lesson JSON englishpod{} shape: reliable
      // parts filled (id/title/dialogue), the Uzbek-gloss fields left as scaffolds
      // + the raw Key-Vocab region to curate them from (02 §3.3).
      writeJson(join(outDir, "englishpod.draft.json"), {
        id: englishpod.id,
        title: epTitleFrom(epText),
        titleUz: "",
        warmup: { uz: "", en: "" },
        dialogue: splitEnglishPodDialogue(epText),
        keyVocabRaw: englishPodKeyVocabRaw(epText),
        keyVocab: [],                                  // author fills {en, uz, defEn} from keyVocabRaw
        _note: "audio durations/bytes come from stage-media → manifest; add Uzbek gloss to keyVocab (02 §3.3)",
      });
      info(`${id}/englishpod.draft.json  ←  ${relRoot(englishpod.pdf.src)}  (EP ${englishpod.id}, ${splitEnglishPodDialogue(epText).length} lines)`);
    } else if (englishpod === null) {
      writeJson(join(outDir, "englishpod.draft.json"), null);   // deterministic null gate (L15/L22, 02 §5)
      info(`${id}: EnglishPod gated off (englishpod:null per 02 §5)`);
    }
    if (sixmin?.pdf) {
      const sixText = await pdfPlainText(sixmin.pdf.src);
      writeTextFile(join(outDir, "sixmin.txt"), sixText);
      writeJson(join(outDir, "sixmin.para.json"), { date: sixmin.date, paragraphs: reflowParagraphs(sixText) });
      // sixmin.draft.json mirrors the lesson JSON sixmin{} shape: the pre-listening
      // MCQ (question + options; answerIndex/explanationUz to fill) + the raw
      // vocab-discussion region to pick the 6-word pack (+ Uzbek gloss) from (02 §3.5).
      writeJson(join(outDir, "sixmin.draft.json"), {
        date: sixmin.date,
        title: sixTitleFrom(sixText),
        titleUz: "",
        quiz: parseSixMinQuiz(sixText),
        vocabRegion: sixMinVocabRegion(sixText),
        vocab: [],                                     // author picks 6 {en, uz, defEn} from vocabRegion
        _note: "set quiz.answerIndex + explanationUz from the transcript; add Uzbek gloss to the 6 vocab (02 §3.5)",
      });
      info(`${id}/sixmin.draft.json  ←  ${relRoot(sixmin.pdf.src)}  (6ME ${sixmin.date}, quiz:${parseSixMinQuiz(sixText).length})`);
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
