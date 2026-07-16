// scripts/lib/markdown.mjs — precompile authored Uzbek Grammar-Spark Markdown to
// SANITIZED HTML at build time (03 §4). The runtime ships ZERO markdown code and
// has no client-side markdown/XSS surface: the lesson JSON stores only the
// finished `grammar.bodyHtml`.

import MarkdownIt from "markdown-it";

// Restricted subset: no raw HTML passthrough, no auto-links, keep the author's
// own punctuation (typographer off — the Uzbek prose already uses U+02BB oʻ/gʻ).
const md = new MarkdownIt({ html: false, linkify: false, typographer: false, breaks: false });

// Tags markdown-it can emit for our subset (headings, paragraphs, emphasis,
// lists, inline code, blockquote, tables). Anything else is dropped.
const ALLOWED = new Set([
  "p", "br", "hr", "em", "strong", "code", "blockquote",
  "ul", "ol", "li", "h2", "h3", "h4", "h5", "h6",
  "table", "thead", "tbody", "tr", "th", "td",
]);

/**
 * Defense-in-depth scrubber. `html` is markdown-it's OWN output (html:false, so
 * any `<`/`>` in the source is already escaped to entities) — a bounded,
 * well-formed tag set. We still enforce the allowlist and strip ALL attributes,
 * so the stored HTML is attribute-free and cannot carry script/style/handlers.
 */
export function sanitizeHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, tag) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return "";                 // drop tag, keep inner text
      return m[1] === "/" ? `</${t}>` : `<${t}>`;     // strip every attribute
    })
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Render a restricted-Markdown string to sanitized HTML for `grammar.bodyHtml`. */
export function renderGrammarMarkdown(src) {
  return sanitizeHtml(md.render(src));
}
