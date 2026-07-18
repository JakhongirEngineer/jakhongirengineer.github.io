// core.js — shared primitives for the whole app (03 §7 conventions).
// DOM helper, inline-SVG icons, flat-dict i18n, and the localStorage access that
// every module funnels through. app.js (shell/router), player.js, progress.js and
// lesson.js all import from here so there is ONE t(), ONE el(), ONE storage path —
// no forked patterns as S4/S7/S8/S13 extend the lesson page. Zero dependencies.

// Data URLs resolve against THIS module's location so every fetch is correct under
// the /english-self-study/ subpath regardless of the hash route.
export const DATA_BASE = new URL("../data/", import.meta.url);
export const LS_KEY = "ess.progress.v1"; // canonical key; settings at .settings (03 §6.3)

// ---- Tiny DOM helper (avoids innerHTML for dynamic/user-facing text) ---------
// attrs.html is reserved for TRUSTED static strings only (our inline SVG, and the
// build-time precompiled + sanitized grammar.bodyHtml — validated in validate.mjs).
export function el(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (attrs[k] == null) continue;
    if (k === "class") node.className = attrs[k];
    else if (k === "html") node.innerHTML = attrs[k];
    else if (k.startsWith("on") && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
    else node.setAttribute(k, attrs[k]);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    node.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return node;
}

// ---- Icons: inline SVG line icons (04 §7.6), 0 KB, currentColor --------------
export const ICONS = {
  menu:     '<path d="M4 7h16M4 12h16M4 17h16"/>',
  back:     '<path d="M15 5l-7 7 7 7"/>',
  home:     '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
  lessons:  '<path d="M5 5h14M5 12h14M5 19h9"/>',
  progress: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  more:     '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  play:     '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  pause:    '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>',
  replay10: '<path d="M11 7V3L6 7l5 4V8a5 5 0 11-5 5"/><text x="12.5" y="19" font-size="7" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">10</text>',
  forward15:'<path d="M13 7V3l5 4-5 4V8a5 5 0 105 5" transform="translate(24,0) scale(-1,1)"/><text x="11.5" y="19" font-size="7" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">15</text>',
  download: '<path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14"/>',
  doc:      '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  sound:    '<path d="M5 9v6h3l4 4V5L8 9z" fill="currentColor" stroke="none"/><path d="M16 9a3 3 0 010 6M18.5 7a6 6 0 010 10" fill="none"/>',
  check:    '<path d="M5 12l4 4L19 6"/>',
  close:    '<path d="M6 6l12 12M18 6L6 18"/>',
  expand:   '<path d="M6 15l6-6 6 6"/>',
  collapse: '<path d="M6 9l6 6 6-6"/>',
  retry:    '<path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7L4 9"/><path d="M4 4v5h5"/>',
};
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

// ---- Raw localStorage access (private-mode / quota safe, 03 §6.3, 04 §9) -----
export function lsGetObj() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch { return {}; }
}
export function lsSetObj(obj) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); return true; } catch { return false; }
}

// ---- Settings (touch ONLY .settings; forward-compatible with the S5 engine) --
export function loadSettings() {
  const o = lsGetObj();
  return (o && typeof o.settings === "object" && o.settings) || {};
}
export function saveSetting(key, value) {
  const o = lsGetObj();
  if (typeof o.settings !== "object" || !o.settings) o.settings = {};
  o.settings[key] = value;
  o.updatedAt = Date.now();
  lsSetObj(o);
}

// ---- i18n — a lookup function, not a library (03 §7). Uzbek is the default. --
const dicts = {};
let _lang = "uz";
export const lang = () => _lang;
export function setLangState(l) { _lang = l; }
export async function loadDict(l) {
  if (dicts[l]) return dicts[l];
  try {
    const res = await fetch(new URL(`i18n/ui.${l}.json`, DATA_BASE));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dicts[l] = await res.json();
  } catch (err) {
    console.warn(`i18n: could not load ui.${l}.json`, err);
    dicts[l] = {}; // t() then falls back to the raw key rather than crashing
  }
  return dicts[l];
}
export const t = (key) => {
  const d = dicts[_lang] || {};
  return key in d ? d[key] : key;
};
// t() with positional {0},{1}… interpolation for counters/labels.
export const tf = (key, ...args) => {
  let s = t(key);
  args.forEach((a, i) => { s = s.replace(new RegExp("\\{" + i + "\\}", "g"), String(a)); });
  return s;
};

// ---- Catalogue: data/index.json fetched ONCE, cached (03 §6.1) ---------------
// Shared by the code-split Home (home.js) + Curriculum Map (lessons.js) so the map
// renders with no per-lesson fetch. Failures reject (caller shows the fallback);
// a failure is not cached, so a later navigation can retry.
let _indexCache = null;
export async function loadIndex() {
  if (_indexCache) return _indexCache;
  const res = await fetch(new URL("index.json", DATA_BASE));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  _indexCache = await res.json();
  return _indexCache;
}

// ---- Star cluster (04 §5.2) — 0–3 tier, never color-only -----------------------
// role="img" + a resolved (active-language) aria-label; a review-due lesson adds 🔁.
// Reused by the map card, Home Continue card, and the Lesson Check readout.
export function starCluster(stars, { review = false } = {}) {
  const n = Math.max(0, Math.min(3, Math.floor(stars) || 0));
  const label = tf("map.starAria", n) + (review ? ` · ${t("map.reviewDue")}` : "");
  const span = el("span", { class: "stars" + (review ? " stars--review" : ""), role: "img", "aria-label": label });
  for (let i = 1; i <= 3; i++)
    span.append(el("i", { class: "star" + (i <= n ? " star--on" : ""), "aria-hidden": "true" }, i <= n ? "⭐" : "☆"));
  if (review) span.append(el("i", { class: "stars__rv", "aria-hidden": "true" }, "🔁"));
  return span;
}

// ---- Small format helpers ----------------------------------------------------
export function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
export function fmtMB(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
