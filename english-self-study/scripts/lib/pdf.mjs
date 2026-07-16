// scripts/lib/pdf.mjs — PDF text extraction via pdfjs-dist (dev-only, 03 §4/§5.1).
// The app NEVER parses a PDF at runtime; this runs offline only. Extraction is
// deterministic (pure function of the PDF bytes), which the twice-identical
// re-run guarantee (S1 "Done when") relies on.

import { readFileSync } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Curly punctuation / non-breaking hyphens the AJ PDFs use; keep typographic
// quotes (valid UTF-8, render fine) but fold the odd hyphen variants to ASCII.
function tidy(s) {
  return s
    .replace(/[‐‑]/g, "-")   // ‐ ‑ → -
    .replace(/ /g, " ")            // nbsp
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Low-level: pages → items ({str, font, eol}) and reconstructed lines ({text, font}). */
export async function readPdf(path) {
  const data = new Uint8Array(readFileSync(path));
  const doc = await getDocument({ data, isEvalSupported: false, verbosity: 0 }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const items = tc.items.map((it) => ({ str: it.str, font: it.fontName, eol: !!it.hasEOL }));
    // reconstruct lines: accumulate until an EOL; dominant font = most chars.
    const lines = [];
    let buf = "", tally = new Map();
    const flush = () => {
      const text = tidy(buf);
      if (text) {
        let font = null, best = -1;
        for (const [f, n] of tally) if (n > best) { best = n; font = f; }
        lines.push({ text, font });
      }
      buf = ""; tally = new Map();
    };
    for (const it of items) {
      buf += it.str;
      if (it.str.trim()) tally.set(it.font, (tally.get(it.font) || 0) + it.str.length);
      if (it.eol) flush();
    }
    flush();
    pages.push({ items, lines });
    page.cleanup();
  }
  return { numPages: doc.numPages, pages };
}

/** Faithful plain text: one PDF line per output line, pages blank-line separated. */
export async function pdfPlainText(path) {
  const { pages } = await readPdf(path);
  return pages.map((pg) => pg.lines.map((l) => l.text).join("\n")).join("\n\n");
}

/** Page-1 text only (for the 6ME slug-from-title derivation, 03 §5.3). */
export async function pdfPageOneText(path) {
  const { pages } = await readPdf(path);
  return pages[0] ? pages[0].lines.map((l) => l.text).join("\n") : "";
}

const isSeparator = (t) => /\*/.test(t) && /^[\s*.]+$/.test(t);
const endsQuestion = (t) => /\?\s*["”']?$/.test(t);

/**
 * Parse an AJ MINI_STORY into {q,a} pairs (02 §2, the highest-value feature).
 *
 * Structure (aj-hoge.md §1): a spoken intro, then the story bracketed by
 * `* * * * *` markers — bold narrative STATEMENTS (one font) interleaved with
 * QUESTION (another font) → short ANSWER (a third, "italic") loops — then an
 * outro. We detect the answer by pdfjs per-span font (03 §5.1): merge same-font
 * runs into blocks, isolate the story region between the first/last separator
 * (heuristic intro/outro strip as fallback), then pair each block that ENDS in
 * "?" with the immediately following block of a DIFFERENT font (the answer).
 */
export function parseMiniStoryBlocks(pages) {
  const lines = pages.flatMap((p) => p.lines);
  // merge consecutive same-font lines into blocks.
  const blocks = [];
  for (const ln of lines) {
    const last = blocks[blocks.length - 1];
    if (last && last.font === ln.font) last.text += " " + ln.text;
    else blocks.push({ font: ln.font, text: ln.text });
  }
  for (const b of blocks) b.text = tidy(b.text);

  // story region: between the first and last "* * * * *" separators.
  const seps = blocks.map((b, i) => (isSeparator(b.text) ? i : -1)).filter((i) => i >= 0);
  let region;
  if (seps.length >= 2) region = blocks.slice(seps[0] + 1, seps[seps.length - 1]);
  else {
    // fallback: strip a leading AJ intro + trailing outro by keyword.
    const introRe = /this is AJ|mini-?story|smil|physiolog|let'?s get started|are you ready|shoulders back/i;
    const outroRe = /that is the end|deep learning|see you next time|next lesson|point of view lesson/i;
    let s = 0, e = blocks.length;
    while (s < e && introRe.test(blocks[s].text)) s++;
    while (e > s && outroRe.test(blocks[e - 1].text)) e--;
    region = blocks.slice(s, e);
  }
  region = region.filter((b) => !isSeparator(b.text));

  const pairs = [];
  const statements = [];
  for (let i = 0; i < region.length; i++) {
    const b = region[i];
    const next = region[i + 1];
    if (endsQuestion(b.text) && next && next.font !== b.font && !endsQuestion(next.text)) {
      pairs.push({ q: b.text, a: next.text });
      i++; // consume the answer
    } else if (!endsQuestion(b.text)) {
      statements.push(b.text);
    }
  }
  return { pairs, statements, blockCount: blocks.length };
}

export async function parseMiniStory(path) {
  const { pages } = await readPdf(path);
  return parseMiniStoryBlocks(pages);
}
