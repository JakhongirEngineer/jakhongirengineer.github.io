// scripts/lib/normalise.mjs — THE filename normaliser (03 §5.3, 02 §10).
//
// The single source of truth for turning the READ-ONLY `content/` chaos into
// clean media keys (03 §2.5). Every later slice (S7 EnglishPod/6ME, S13 full
// authoring) reuses this module — so it resolves ALL three sources, not just
// the one lesson S1 curates. It NEVER hardcodes a source filename: AJ audio is
// globbed by the numeric prefix (1_/2_/3_/4_), PDFs by keyword, EnglishPod by
// B-probe, 6 Minute English by the YYMMDD date prefix.
//
// Clean key scheme (identical across R2 / B2 / Releases — 03 §2.5):
//   aj-hoge/09/main.mp3  vocab.mp3  ministory.mp3  pov.mp3  + .pdf siblings
//   englishpod/0004/dg.mp3  pr.mp3  rv.mp3  transcript.pdf
//   sixmin/180315/audio.mp3  transcript.pdf
//   grammar/essential-grammar-in-use.pdf

import { join } from "node:path";
import {
  AJ_DIR, LISTENING_DIR, SIXMIN_DIR, GRAMMAR_SRC, listDir, walkFiles, basename, pad2, warn,
} from "./util.mjs";

// The four AJ components, in fixed pedagogical order (02 §2).
export const AJ_COMPONENTS = ["main", "vocab", "ministory", "pov"];
// Numeric audio prefix → component (02 §10: 1_=MAIN 2_=VOCAB 3_=MINI_STORY 4_=POV).
const AJ_AUDIO_PREFIX = { "1": "main", "2": "vocab", "3": "ministory", "4": "pov" };

// ── AJ Hoge ────────────────────────────────────────────────────────────────

/** Find the `NN_Theme` folder for lesson n (globbed by numeric prefix, never hardcoded). */
export function findAjFolder(n, ajDir = AJ_DIR) {
  const pref = pad2(n) + "_";
  const hit = listDir(ajDir).find((e) => e.isDirectory() && e.name.startsWith(pref));
  if (!hit) throw new Error(`AJ lesson ${n}: no folder starting with "${pref}" under ${ajDir}`);
  return join(ajDir, hit.name);
}

/**
 * Classify an AJ PDF by keyword (never by position). Handles both naming
 * regimes — 01–18 mixed-case ("… Main/MS/Vocab/POV Text.pdf") and 19–30
 * ALL-CAPS ("… MAIN/MINI STORY/VOCAB/POV.pdf") — plus the variants
 * Vocab/Vocabulary, MS/Mini-Story/MiniStory/MINI STORY. The `Exitement` typo
 * (23) lives in the THEME, not the component keyword, so it doesn't matter.
 * Returns a component name or null (null ⇒ junk: the copyrighted book PDFs).
 */
export function classifyAjPdf(name) {
  const b = name.replace(/\.pdf$/i, "");
  if (/vocab/i.test(b)) return "vocab";                      // Vocab | Vocabulary | VOCAB
  if (/mini[\s_-]?story/i.test(b) || /\bMS\b/i.test(b)) return "ministory";
  if (/\bPOV\b/i.test(b)) return "pov";
  if (/main/i.test(b)) return "main";
  return null;                                                // Robert-Maurer…, Mans_Search… → excluded
}

/**
 * Resolve one AJ Hoge lesson (1–30) to its source files + clean keys.
 * @returns { number, key, folder, audio:{comp→{src,key}|null}, pdf:{comp→{src,key}|null} }
 */
export function resolveAj(n, ajDir = AJ_DIR) {
  const folder = findAjFolder(n, ajDir);
  const nn = pad2(n);
  const key = `aj-hoge/${nn}`;
  const audio = { main: null, vocab: null, ministory: null, pov: null };
  const pdf = { main: null, vocab: null, ministory: null, pov: null };

  // AUDIO — top-level only; the numeric prefix is the reliable signal. The
  // `\.mp3$` test catches the double-extension chaos too (`.mp3.mp3` on 24/27,
  // `..mp3` on 11), and junk audiobooks ("The 4 Hour…", "full 7- hour…",
  // "*.mp4") never carry a 1_–4_ prefix so they fall out naturally.
  for (const ent of listDir(folder)) {
    if (!ent.isFile() || !/\.mp3$/i.test(ent.name)) continue;
    const m = /^([1-4])[_ ]/.exec(ent.name);
    if (!m) continue;
    const comp = AJ_AUDIO_PREFIX[m[1]];
    if (audio[comp]) { warn(`AJ ${nn}: duplicate ${comp} audio (${ent.name}); keeping ${basename(audio[comp].src)}`); continue; }
    audio[comp] = { src: join(folder, ent.name), key: `${key}/${comp}.mp3` };
  }

  // PDFS — recurse (transcripts live in a per-lesson "NN <Theme> Text/" subfolder
  // whose name drifts: "03 Emotional Master 2 Text" etc.). Classify by keyword;
  // if a slot is contested, prefer the copy inside a "…Text" folder.
  for (const f of walkFiles(folder)) {
    if (!/\.pdf$/i.test(f)) continue;
    const comp = classifyAjPdf(basename(f));
    if (!comp) continue;
    const inTextFolder = /text[\/\\][^\/\\]+$/i.test(f);
    if (pdf[comp]) {
      const prevInText = /text[\/\\][^\/\\]+$/i.test(pdf[comp].src);
      if (inTextFolder && !prevInText) pdf[comp] = { src: f, key: `${key}/${comp}.pdf` };
      else warn(`AJ ${nn}: duplicate ${comp} pdf (${basename(f)}); keeping ${basename(pdf[comp].src)}`);
      continue;
    }
    pdf[comp] = { src: f, key: `${key}/${comp}.pdf` };
  }

  return { number: n, key, folder, audio, pdf };
}

export function resolveAllAj(ajDir = AJ_DIR) {
  const out = [];
  for (let n = 1; n <= 30; n++) out.push(resolveAj(n, ajDir));
  return out;
}

// ── EnglishPod (03 §5.3, englishpod.md) ─────────────────────────────────────

/** Strip the junk trailing " u" from 9 of the 12 topic folder names. */
export const cleanEpTopic = (folder) => folder.replace(/ u$/, "");

/**
 * Resolve one EnglishPod episode by 4-digit id. The PDF is ALWAYS
 * `englishpod_B{ID}.pdf`; the mp3s carry the `B` on only 10/28 folders, so we
 * PROBE both `englishpod_B{ID}{suf}.mp3` and `englishpod_{ID}{suf}.mp3`. Album
 * art (AlbumArtSmall.jpg / Folder.jpg in work/0004) is ignored by construction.
 */
export function resolveEnglishPod(id, listeningDir = LISTENING_DIR) {
  let epDir = null, topicRaw = null;
  for (const ent of listDir(listeningDir)) {
    if (!ent.isDirectory()) continue;
    const cand = join(listeningDir, ent.name, id);
    if (listDir(cand).length) { epDir = cand; topicRaw = ent.name; break; }
  }
  if (!epDir) throw new Error(`EnglishPod ${id}: no episode folder found under ${listeningDir}`);

  const key = `englishpod/${id}`;
  const names = new Set(listDir(epDir).filter((e) => e.isFile()).map((e) => e.name));
  const pick = (...cands) => cands.find((c) => names.has(c)) || null;

  const pdfName = pick(`englishpod_B${id}.pdf`, `englishpod_${id}.pdf`);
  const audio = {};
  for (const suf of ["dg", "pr", "rv"]) {
    const hit = pick(`englishpod_B${id}${suf}.mp3`, `englishpod_${id}${suf}.mp3`);
    audio[suf] = hit ? { src: join(epDir, hit), key: `${key}/${suf}.mp3` } : null;
  }
  return {
    id, key, dir: epDir,
    topic: cleanEpTopic(topicRaw),
    hasBPrefixMp3: names.has(`englishpod_B${id}dg.mp3`),
    pdf: pdfName ? { src: join(epDir, pdfName), key: `${key}/transcript.pdf` } : null,
    audio,
  };
}

/** All EnglishPod episode ids present on disk (sorted). */
export function listEnglishPodIds(listeningDir = LISTENING_DIR) {
  const ids = [];
  for (const topic of listDir(listeningDir)) {
    if (!topic.isDirectory()) continue;
    for (const ep of listDir(join(listeningDir, topic.name)))
      if (ep.isDirectory() && /^\d{4}$/.test(ep.name)) ids.push(ep.name);
  }
  return [...new Set(ids)].sort();
}

// ── 6 Minute English (03 §5.3, 6-minute-english.md) ─────────────────────────

/**
 * Resolve one 6ME episode by its YYMMDD date prefix (the only 100%-reliable
 * key). PDF and MP3 are paired by date, NOT by exact stem (series token drifts:
 * 6min / 6_min / 6_minute / 6min_eng, and slug typos: lunch/street_food drop
 * "english", world_cup mp3 uses "6_min", learn_a_language vs learning_a_language).
 * The three ` (1)` duplicates (161215, 180322, 181220) are DEDUPED here.
 */
export function resolveSixMin(date, sixDir = SIXMIN_DIR) {
  const files = listDir(sixDir).filter((e) => e.isFile()).map((e) => e.name);
  const forDate = (ext) =>
    files.filter((f) => f.startsWith(date) && new RegExp(`\\.${ext}$`, "i").test(f));

  const pdfs = forDate("pdf");
  const mp3s = forDate("mp3");
  // dedupe: drop the " (1)" copies; prefer a "_download" mp3 when several remain.
  const noDup = (list) => list.filter((f) => !/\(\d+\)\./.test(f));
  const pdf = (noDup(pdfs)[0] || pdfs[0]) ?? null;
  const mp3List = noDup(mp3s).length ? noDup(mp3s) : mp3s;
  const mp3 = mp3List.find((f) => /_download\d*\.mp3$/i.test(f)) || mp3List[0] || null;

  if (!pdf && !mp3) throw new Error(`6ME ${date}: no files with that date prefix under ${sixDir}`);
  const key = `sixmin/${date}`;
  return {
    date, key,
    hadDuplicate: pdfs.length > noDup(pdfs).length || mp3s.length > noDup(mp3s).length,
    pdf: pdf ? { src: join(sixDir, pdf), key: `${key}/transcript.pdf` } : null,
    audio: { main: mp3 ? { src: join(sixDir, mp3), key: `${key}/audio.mp3` } : null },
  };
}

/** All unique 6ME dates present on disk (deduped, sorted). */
export function listSixMinDates(sixDir = SIXMIN_DIR) {
  const dates = new Set();
  for (const e of listDir(sixDir))
    if (e.isFile()) { const m = /^(\d{6})/.exec(e.name); if (m) dates.add(m[1]); }
  return [...dates].sort();
}

/**
 * Slug from the 6ME PDF page-1 title (NOT the filename — 02 §10). Pass the
 * already-extracted page-1 text; returns a kebab slug. Used at curate time.
 */
export function sixMinSlugFromTitle(pageOneText) {
  const lines = pageOneText.split("\n").map((s) => s.trim()).filter(Boolean);
  // Header is "BBC LEARNING ENGLISH" / "6 Minute English" / "<title as a question>".
  const i = lines.findIndex((l) => /6\s*minute\s*english/i.test(l));
  const title = (i >= 0 ? lines.slice(i + 1) : lines).find(
    (l) => l && !/^bbc/i.test(l) && !/not a word-for-word/i.test(l)
  ) || "";
  return title
    .toLowerCase()
    .replace(/[’'".,!?:;()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

// ── Shared assets (not lesson-scoped) ───────────────────────────────────────

/**
 * The one Murphy grammar PDF, offered as an optional download from every
 * Grammar Spark (03 §6.2 grammar.reference.downloadPath). Globbed, not
 * hardcoded → clean key grammar/essential-grammar-in-use.pdf.
 */
export function resolveGrammarBook(grammarDir = GRAMMAR_SRC) {
  const pdf = listDir(grammarDir).find((e) => e.isFile() && /\.pdf$/i.test(e.name));
  if (!pdf) throw new Error(`Grammar book: no PDF under ${grammarDir}`);
  return { src: join(grammarDir, pdf.name), key: "grammar/essential-grammar-in-use.pdf" };
}

/** Map clean-key → source path for shared assets referenced by any lesson. */
export function sharedAssetMap() {
  const map = new Map();
  try { const g = resolveGrammarBook(); map.set(g.key, g.src); } catch { /* optional */ }
  return map;
}

// ── Dispatch by lesson id ────────────────────────────────────────────────────
export function resolveByLessonMeta(meta) {
  switch (meta.source) {
    case "aj-hoge":   return resolveAj(meta.ajNumber);
    case "englishpod":return resolveEnglishPod(meta.epId);
    case "6min":      return resolveSixMin(meta.sixDate);
    default: throw new Error(`No resolver for source ${meta.source}`);
  }
}
