// progress-page.js — the Progress screen (04 §4.6 / §6, 02 §7/§8.2/§8.3), code-split
// like lesson.js (skeleton → dynamic import → alive() guard). Everything the accountless
// system knows, made visible and PORTABLE: hero counters, the CEFR ladder, a month streak
// calendar, the badge gallery, the IELTS-topic coverage grid, the L1↔L30 recording
// comparison, and a prominent Export / Import / Reset data block. Framed as growth, never
// deficit. Degrades on every storage/index failure (04 §9). Zero deps beyond core+engine.

import { el, icon, t, tf, lang, loadIndex, fmtTime } from "./core.js";
import {
  getGlobal, getBadges, getProgressStats, snapshot,
  awardPhaseBadges, setTopicCoverage,
  exportProgress, previewImport, applyImport, resetProgress,
} from "./progress.js";

const groupNum = (n) => String(Math.max(0, Math.floor(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const todayISO = () => new Date().toISOString().slice(0, 10);
const asUTC = (iso) => new Date(iso + "T00:00:00Z");
const addDays = (iso, d) => { const x = asUTC(iso); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };
const isISO = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const mondayOf = (iso) => { const d = asUTC(iso); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); };

// ── IndexedDB (mirror lesson-speak.js: same DB/store/version so we never conflict) ──────
const DB_NAME = "ess-recordings", STORE = "recordings";
let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    let req;
    try { if (typeof indexedDB === "undefined") throw new Error("no idb"); req = indexedDB.open(DB_NAME, 1); }
    catch (e) { reject(e); return; }
    req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("idb open failed"));
    req.onblocked = () => reject(new Error("idb blocked"));
  }).catch((e) => { dbPromise = null; throw e; });
  return dbPromise;
}
function idbGetAll() {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const rq = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    rq.onsuccess = () => resolve(rq.result || []);
    rq.onerror = () => reject(rq.error || new Error("idb getAll failed"));
  }));
}
function idbClearAll() {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("idb clear failed"));
  }));
}

// ── Object-URL lifecycle for the comparison clips (revoked on re-render + nav-away) ─────
let objUrls = [];
function revokeUrls() { objUrls.forEach((u) => { try { URL.revokeObjectURL(u); } catch { /* noop */ } }); objUrls = []; }
try { window.addEventListener("hashchange", revokeUrls); } catch { /* noop */ }

// ── The badge catalogue (02 §8.3) — id → emoji + i18n label + a cur/target hint ────────
const BADGES = [
  { id: "first-step",        emoji: "🥇", label: "badge.first",           hint: (s) => [Math.min(s.completed, 1), 1] },
  { id: "streak-7",          emoji: "🔥", label: "badge.streak7",         hint: (s) => [Math.min(s.streakBest, 7), 7] },
  { id: "streak-30",         emoji: "🔥", label: "badge.streak30",        hint: (s) => [Math.min(s.streakBest, 30), 30] },
  { id: "streak-100",        emoji: "🏆", label: "badge.streak100",       hint: (s) => [Math.min(s.streakBest, 100), 100] },
  { id: "deep-listener-100", emoji: "🎧", label: "badge.listener100",     hint: (s) => [Math.min(s.listeningMinutes, 100), 100] },
  { id: "deep-listener-500", emoji: "🎧", label: "badge.listener500",     hint: (s) => [Math.min(s.listeningMinutes, 500), 500] },
  { id: "deep-listener-1000",emoji: "🎧", label: "badge.listener1000",    hint: (s) => [Math.min(s.listeningMinutes, 1000), 1000] },
  { id: "speaker",           emoji: "🗣️", label: "badge.speaker",         hint: (s) => [Math.min(s.speakingReps, 100), 100] },
  { id: "voice",             emoji: "🎙️", label: "badge.voice",           hint: (s) => [Math.min(s.recordings, 10), 10] },
  { id: "grammar-guru",      emoji: "📐", label: "badge.grammar",         hint: (s) => [Math.min(s.grammarSets, 20), 20] },
  { id: "conversationalist", emoji: "💬", label: "badge.conversationalist", hint: (s) => [Math.min(s.epDone, 15), 15] },
  { id: "a2-foundation",     emoji: "🧱", label: "badge.a2",              hint: (s) => phaseHint(s, 1) },
  { id: "b1-momentum",       emoji: "🚀", label: "badge.b1",              hint: (s) => phaseHint(s, 2) },
  { id: "b2-fluency",        emoji: "🎓", label: "badge.b2",              hint: (s) => phaseHint(s, 3) },
  { id: "comeback",          emoji: "💚", label: "badge.comeback",        hint: () => null },
];
function phaseHint(s, n) { const p = (s.phases || []).find((x) => x.n === n); return p ? [p.done, p.authored || 10] : [0, 10]; }

// ── IELTS coverage: 20 canonical Part-1/2 topics + keyword matchers (04 §4.6) ──────────
const TOPICS = [
  { key: "family", kw: ["family", "famil", "oila", "parent", "relativ"] },
  { key: "hometown", kw: ["hometown", "town", "shahar", "region"] },
  { key: "home", kw: ["home", "house", "accommodation", "apartment", "uy"] },
  { key: "work", kw: ["work", "job", "career", "business", "office", "ish"] },
  { key: "study", kw: ["study", "school", "education", "learn", "student", "univers", "kaizen"] },
  { key: "routine", kw: ["routine", "habit", "daily", "morning", "gradual", "time", "kaizen"] },
  { key: "food", kw: ["food", "eat", "meal", "cook", "diet", "drink", "ovqat"] },
  { key: "hobbies", kw: ["hobby", "hobbies", "leisure", "free time", "interest"] },
  { key: "sport", kw: ["sport", "exercise", "fitness", "football", "game"] },
  { key: "music", kw: ["music", "song", "instrument", "musiq"] },
  { key: "travel", kw: ["travel", "trip", "holiday", "tourism", "journey", "sayohat"] },
  { key: "weather", kw: ["weather", "climate", "season", "rain"] },
  { key: "shopping", kw: ["shop", "buy", "market", "money", "xarid"] },
  { key: "friends", kw: ["friend", "social", "relationship", "dost"] },
  { key: "technology", kw: ["tech", "internet", "phone", "computer", "digital", "online", "ai"] },
  { key: "health", kw: ["health", "body", "doctor", "sleep", "salomat", "wellbeing", "mindset"] },
  { key: "environment", kw: ["environment", "nature", "pollution", "green", "tabiat"] },
  { key: "books", kw: ["book", "read", "story", "literatur", "kitob"] },
  { key: "films", kw: ["film", "movie", "cinema", "kino", "series"] },
  { key: "celebrations", kw: ["celebrat", "festival", "tradition", "party", "bayram"] },
];

// ── index-aware derivations: phases + coverage from COMPLETED lessons ───────────────────
function deriveFromIndex(index) {
  const lessons = (index && Array.isArray(index.lessons)) ? index.lessons : [];
  const phases = [1, 2, 3].map((n) => {
    const inPhase = lessons.filter((l) => l.phase === n);
    const done = inPhase.filter((l) => (snapshot(l.id).stars || 0) >= 1).length;
    return { n, authored: inPhase.length, done, complete: inPhase.length > 0 && done === inPhase.length };
  });
  const completePhases = phases.filter((p) => p.complete).map((p) => p.n);
  // Coverage — map each COMPLETED lesson's tags/theme/slug to topics
  const topicCounts = {};
  lessons.forEach((l) => {
    if ((snapshot(l.id).stars || 0) < 1) return;
    const hay = [(l.tags || []).join(" "), l.theme || "", l.slug || "", l.title || ""].join(" ").toLowerCase();
    TOPICS.forEach((tp) => { if (tp.kw.some((k) => hay.includes(k))) topicCounts[tp.key] = (topicCounts[tp.key] || 0) + 1; });
  });
  return { phases, completePhases, topicCounts };
}

// ── Skeleton / building blocks ─────────────────────────────────────────────────────────
function skeleton() {
  const s = el("div", { class: "lesson-skel", "aria-hidden": "true" });
  for (let i = 0; i < 4; i++) s.append(el("div", { class: "skel-card" }));
  return s;
}
const sectionHead = (emoji, key) => el("h2", { class: "prog__h" }, el("span", { "aria-hidden": "true" }, emoji + " "), t(key));

// ── Hero counters (listening min biggest — 02 §1/§8) ───────────────────────────────────
function heroCounters(g) {
  const m = g.metrics;
  const tile = (big, emoji, value, label) =>
    el("div", { class: "hmetric" + (big ? " hmetric--big" : "") },
      el("span", { class: "hmetric__ic", "aria-hidden": "true" }, emoji),
      el("span", { class: "hmetric__num" }, groupNum(value)),
      el("span", { class: "hmetric__lab" }, label));
  return el("div", { class: "card hmetrics" },
    tile(true, "🎧", m.listeningMinutes || 0, t("home.heroListening")),
    tile(false, "🗣️", m.speakingReps || 0, t("home.heroSpeaking")),
    tile(false, "🎙️", m.recordings || 0, t("progress.recordings")));
}

// ── CEFR ladder [A2 ✓ / B1 ◔ / B2 ○] derived from phase completion (02 §7) ─────────────
function cefrLadder(stats) {
  const RUNGS = [{ n: 1, cefr: "A2" }, { n: 2, cefr: "B1" }, { n: 3, cefr: "B2" }];
  const stateOf = (n) => {
    const ph = stats.phases.find((p) => p.n === n) || { done: 0, complete: false };
    if (ph.complete) return "done";
    if (n === 1) return "progress";
    const prev = stats.phases.find((p) => p.n === n - 1);
    if ((prev && prev.complete) || ph.done > 0) return "progress";
    return "locked";
  };
  const MARK = { done: "✓", progress: "◔", locked: "○" };
  const STLAB = { done: "progress.cefr.done", progress: "progress.cefr.inProgress", locked: "progress.cefr.locked" };
  const row = el("div", { class: "cefr" });
  RUNGS.forEach((r) => {
    const st = stateOf(r.n);
    row.append(el("div", { class: "cefr__rung cefr__rung--" + st, role: "img", "aria-label": r.cefr + " — " + t(STLAB[st]) },
      el("span", { class: "cefr__mark", "aria-hidden": "true" }, MARK[st]),
      el("span", { class: "cefr__lvl" }, r.cefr),
      el("span", { class: "cefr__st" }, t(STLAB[st]))));
  });
  return el("div", { class: "card" }, sectionHead("📊", "progress.section.cefr"), row);
}

// ── Streak calendar for the current month (● active / ❄ freeze / ○ upcoming) ───────────
// The schema logs no per-day history, so the run is derived from the streak fields
// (02 §8.3): the last `count` days up to lastActiveDate render active; a freeze used this
// week shows one ❄ just before the run. An honest approximation, never over-claiming.
function streakCard(g) {
  const s = g.streak;
  const td = todayISO();
  const wrap = el("div", { class: "card streakcard" });
  wrap.append(el("div", { class: "streak__head" },
    el("span", { class: "streak__flame", "aria-hidden": "true" }, "🔥"),
    el("span", { class: "streak__count" }, tf("progress.streak.current", s.count || 0))));

  // Build the active set: contiguous `count` days ending at lastActiveDate.
  const active = new Set();
  let freezeDay = null;
  if (isISO(s.lastActiveDate) && (s.count || 0) > 0) {
    let d = s.lastActiveDate;
    for (let i = 0; i < s.count; i++) { active.add(d); d = addDays(d, -1); }
    const earliest = active.size ? [...active].sort()[0] : s.lastActiveDate;
    // A freeze used THIS week → one skipped-but-covered day just before the run.
    if (s.weekStart === mondayOf(td) && (s.freezesLeftThisWeek === 0)) freezeDay = addDays(earliest, -1);
  }

  const y = +td.slice(0, 4), mo = +td.slice(5, 7);
  const monthNames = t("progress.months").split(",");
  const dows = t("progress.weekdays").split(",");
  const first = `${y}-${String(mo).padStart(2, "0")}-01`;
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const leadMon = (asUTC(first).getUTCDay() + 6) % 7;      // Mon=0 offset of the 1st

  const cal = el("div", { class: "cal" });
  cal.append(el("p", { class: "cal__title" }, `${monthNames[mo - 1] || ""} ${y}`));
  const dowRow = el("div", { class: "cal__dow", "aria-hidden": "true" });
  dows.forEach((d) => dowRow.append(el("span", null, d)));
  cal.append(dowRow);

  const grid = el("div", { class: "cal__grid", role: "list", "aria-label": t("progress.section.streak") });
  for (let i = 0; i < leadMon; i++) grid.append(el("span", { class: "cal__cell cal__cell--pad", "aria-hidden": "true" }));
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${y}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    let cls = "off", glyph = "", ariaKey = null;
    if (freezeDay === iso) { cls = "freeze"; glyph = "❄"; ariaKey = "progress.streak.legendFreeze"; }
    else if (active.has(iso)) { cls = "active"; glyph = "●"; ariaKey = "progress.streak.legendActive"; }
    else if (iso === td) { cls = "today"; glyph = "○"; }
    else if (iso > td) { cls = "upcoming"; glyph = "○"; }
    else { glyph = "·"; }
    const cell = el("span", { class: "cal__cell cal__cell--" + cls, role: "listitem",
      "aria-label": day + (ariaKey ? " · " + t(ariaKey) : "") },
      el("span", { class: "cal__mark", "aria-hidden": "true" }, glyph),
      el("span", { class: "cal__day", "aria-hidden": "true" }, String(day)));
    grid.append(cell);
  }
  cal.append(grid);

  // Legend + longest + this-week
  const legend = el("div", { class: "cal__legend" });
  const li = (g2, key) => el("span", { class: "cal__leg" }, el("span", { class: "cal__leg-ic", "aria-hidden": "true" }, g2), t(key));
  legend.append(li("●", "progress.streak.legendActive"), li("❄", "progress.streak.legendFreeze"), li("○", "progress.streak.legendUpcoming"));
  cal.append(legend);
  wrap.append(cal);

  wrap.append(el("p", { class: "streak__stats" },
    el("span", null, tf("progress.streak.longest", s.longest || 0)),
    el("span", { class: "streak__dot", "aria-hidden": "true" }, " · "),
    el("span", null, tf("progress.streak.thisWeek", g.weeklyGoal.activeDaysThisWeek || 0, g.weeklyGoal.target || 5))));
  return wrap;
}

// ── Badge gallery (earned bright / locked greyed + n/target hint) ──────────────────────
function badgeGallery(earned, stats) {
  const set = new Set(earned);
  const grid = el("div", { class: "badges" });
  BADGES.forEach((b) => {
    const got = set.has(b.id);
    const hint = b.hint(stats);
    const name = t(b.label);
    const aria = name + " — " + t(got ? "progress.badge.earned" : "progress.badge.locked") +
      (!got && hint ? ` (${hint[0]}/${hint[1]})` : "");
    const node = el("div", { class: "badge " + (got ? "badge--earned" : "badge--locked"), role: "img", "aria-label": aria },
      el("span", { class: "badge__ic", "aria-hidden": "true" }, b.emoji),
      el("span", { class: "badge__lab" }, name));
    if (got) node.append(el("span", { class: "badge__got", "aria-hidden": "true" }, "✓"));
    else if (hint) node.append(el("span", { class: "badge__hint", "aria-hidden": "true" }, tf("progress.badge.hint", hint[0], hint[1])));
    grid.append(node);
  });
  return el("div", { class: "card" }, sectionHead("🏅", "progress.section.badges"), grid);
}

// ── IELTS-topic coverage grid (~20 cells) ──────────────────────────────────────────────
function coverageGrid(coverage) {
  const grid = el("div", { class: "cov__grid" });
  TOPICS.forEach((tp) => {
    const on = (coverage[tp.key] || 0) > 0;
    grid.append(el("span", { class: "cov__cell" + (on ? " cov__cell--on" : ""), role: "img",
      "aria-label": t("topic." + tp.key) + " — " + t(on ? "progress.coverage.on" : "progress.coverage.off") },
      el("span", { class: "cov__mark", "aria-hidden": "true" }, on ? "▓" : "░"),
      el("span", { class: "cov__lab" }, t("topic." + tp.key))));
  });
  return el("div", { class: "card" }, sectionHead("🎯", "progress.section.coverage"),
    grid,
    el("p", { class: "cov__legend" }, el("span", { class: "cov__legend-sw", "aria-hidden": "true" }), t("progress.coverage.legend")));
}

// ── L1↔L30 recording comparison (only when ≥2 recordings exist) ─────────────────────────
function makeClip(rec, labelText) {
  let url = null;
  try { url = URL.createObjectURL(rec.blob); objUrls.push(url); } catch { url = null; }
  const audio = el("audio", { preload: "metadata" });
  if (url) audio.src = url;
  const play = el("button", { class: "iconbtn clip__play", type: "button", "aria-label": t("speak.play"), html: icon("play") });
  const time = el("span", { class: "clip__time" }, fmtTime(rec.durationSec || 0));
  audio.addEventListener("timeupdate", () => { const d = audio.duration || rec.durationSec || 0; time.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(d); });
  audio.addEventListener("ended", () => { play.innerHTML = icon("play"); play.setAttribute("aria-label", t("speak.play")); });
  play.addEventListener("click", () => {
    if (audio.paused) { audio.play().then(() => { play.innerHTML = icon("pause"); play.setAttribute("aria-label", t("speak.pause")); }).catch(() => {}); }
    else { audio.pause(); play.innerHTML = icon("play"); play.setAttribute("aria-label", t("speak.play")); }
  });
  return el("div", { class: "clip" }, el("span", { class: "clip__lab" }, labelText),
    el("div", { class: "clip__row" }, play, time), audio);
}
function growthCard(recs, index) {
  const card = el("div", { class: "card growth" }, sectionHead("🎙️", "progress.section.growth"));
  if (!recs || recs.length < 2) {
    card.append(el("p", { class: "growth__hint" }, el("span", { "aria-hidden": "true" }, "💡 "), t("progress.growth.hint")));
    return card;
  }
  const byId = new Map((index && index.lessons ? index.lessons : []).map((l) => [l.id, l]));
  const orderOf = (r) => { const l = byId.get(r.id); return l ? l.order : (r.createdAt || 0); };
  const sorted = recs.slice().sort((a, b) => orderOf(a) - orderOf(b) || (a.createdAt || 0) - (b.createdAt || 0));
  const first = sorted[0], last = sorted[sorted.length - 1];
  const labelFor = (r, key) => { const l = byId.get(r.id); return l ? tf(key, l.order) : t("progress.growth.generic"); };
  card.append(el("p", { class: "growth__lead" }, t("progress.growth.lead")));
  card.append(el("div", { class: "growth__row" },
    makeClip(first, labelFor(first, "progress.growth.then")),
    makeClip(last, labelFor(last, "progress.growth.now"))));
  return card;
}

// ── Data block: Export / Copy / Import(preview→confirm) / Reset ─────────────────────────
function storageOk() {
  try { localStorage.setItem("ess.__probe", "1"); localStorage.removeItem("ess.__probe"); return true; } catch { return false; }
}
function download(filename, text) {
  try {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: filename }); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch { /* noop */ }
}
function dataCard(rerender) {
  const card = el("div", { class: "card data" }, sectionHead("💾", "progress.section.data"));
  if (!storageOk()) card.append(el("p", { class: "data__note" }, el("span", { "aria-hidden": "true" }, "⚠️ "), t("progress.noStorage")));

  const msg = el("p", { class: "data__msg", role: "status", "aria-live": "polite" });

  // Export + Copy
  const exportBtn = el("button", { class: "btn btn--primary", type: "button" }, el("span", { "aria-hidden": "true" }, "⬇ "), t("progress.data.export"));
  exportBtn.addEventListener("click", () => { download(`youspeak-progress-${todayISO()}.json`, exportProgress()); msg.textContent = t("progress.data.exported"); msg.className = "data__msg is-ok"; });
  const copyBtn = el("button", { class: "btn btn--soft", type: "button" }, el("span", { "aria-hidden": "true" }, "📋 "), t("progress.data.copy"));
  copyBtn.addEventListener("click", async () => {
    const text = exportProgress();
    let done = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); done = true; } } catch { done = false; }
    if (!done) { try { const ta = el("textarea", { style: "position:fixed;opacity:0" }); ta.value = text; document.body.appendChild(ta); ta.select(); done = document.execCommand("copy"); ta.remove(); } catch { done = false; } }
    msg.textContent = done ? t("progress.data.copied") : t("progress.data.copyFail"); msg.className = "data__msg " + (done ? "is-ok" : "is-err");
  });

  const importBtn = el("button", { class: "btn btn--soft", type: "button", "aria-expanded": "false", "aria-controls": "dataimport-panel" }, el("span", { "aria-hidden": "true" }, "⬆ "), t("progress.data.import"));
  const resetBtn = el("button", { class: "btn btn--danger", type: "button" }, el("span", { "aria-hidden": "true" }, "🗑 "), t("progress.data.reset"));

  const btns = el("div", { class: "data__btns" }, exportBtn, copyBtn, importBtn, resetBtn);
  card.append(btns, msg);

  // Import panel (hidden until "Import" is tapped)
  const panel = el("div", { class: "dataimport", id: "dataimport-panel", hidden: "" });
  const ta = el("textarea", { class: "dataimport__ta", rows: "5", "aria-label": t("progress.data.importHint"), placeholder: t("progress.data.importPlaceholder") });
  const file = el("input", { type: "file", accept: "application/json,.json", class: "dataimport__file", "aria-label": t("progress.data.chooseFile") });
  const previewBtn = el("button", { class: "btn btn--primary", type: "button" }, t("progress.data.preview"));
  const diffBox = el("div", { class: "dataimport__diff" });
  panel.append(
    el("p", { class: "dataimport__hint" }, t("progress.data.importHint")),
    ta, el("div", { class: "dataimport__filerow" }, file), previewBtn, diffBox);
  card.append(panel);

  importBtn.addEventListener("click", () => {
    const open = panel.hidden; panel.hidden = !open;
    importBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) ta.focus();
  });
  file.addEventListener("change", () => {
    const f = file.files && file.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => { ta.value = String(fr.result || ""); doPreview(); };
    fr.onerror = () => { msg.textContent = t("progress.import.fileError"); msg.className = "data__msg is-err"; };
    fr.readAsText(f);
  });

  function row(k, pair) {
    return el("div", { class: "diff__row" },
      el("span", { class: "diff__k" }, t(k)),
      el("span", { class: "diff__before" }, groupNum(pair.before)),
      el("span", { class: "diff__arrow", "aria-hidden": "true" }, "→"),
      el("span", { class: "diff__after" + (pair.incoming !== pair.before ? " is-changed" : "") }, groupNum(pair.incoming)));
  }
  function doPreview() {
    diffBox.replaceChildren();
    const res = previewImport(ta.value);
    if (!res.ok) {
      // Surface the SPECIFIC refusal reason (badVersion / badJson / invalid / write), not a
      // generic one — parseImport returns a machine `code` whose `progress.import.<code>` key exists.
      diffBox.append(el("p", { class: "dataimport__err" }, el("span", { "aria-hidden": "true" }, "⚠️ "), t("progress.import." + (res.code || "invalid"))));
      return;
    }
    const p = res.preview;
    const table = el("div", { class: "diff" },
      el("div", { class: "diff__head" }, el("span"), el("span", null, t("progress.import.current")), el("span"), el("span", null, t("progress.import.incoming"))),
      row("progress.import.lessons", p.lessons), row("progress.import.stars", p.stars),
      row("progress.import.minutes", p.minutes), row("progress.import.streak", p.streak));
    const confirm = el("button", { class: "btn btn--primary", type: "button" }, el("span", { "aria-hidden": "true" }, "⬆ "), t("progress.data.confirmImport"));
    const cancel = el("button", { class: "btn btn--soft", type: "button" }, t("progress.data.cancel"));
    confirm.addEventListener("click", () => {
      const r = applyImport(ta.value);
      if (r.ok) { revokeUrls(); rerender(); }
      else { diffBox.append(el("p", { class: "dataimport__err" }, el("span", { "aria-hidden": "true" }, "⚠️ "), t("progress.import." + (r.code || "invalid")))); }
    });
    cancel.addEventListener("click", () => { panel.hidden = true; importBtn.setAttribute("aria-expanded", "false"); diffBox.replaceChildren(); ta.value = ""; });
    diffBox.append(el("p", { class: "diff__title" }, t("progress.import.title")), table, el("div", { class: "dataimport__confirm" }, confirm, cancel));
  }
  previewBtn.addEventListener("click", doPreview);

  // Reset → inline confirm (never a jarring modal)
  resetBtn.addEventListener("click", () => {
    const q = el("div", { class: "data__confirm", role: "group", "aria-label": t("progress.data.reset") },
      el("p", { class: "data__confirm-q" }, el("span", { "aria-hidden": "true" }, "⚠️ "), t("progress.data.resetConfirm")));
    const yes = el("button", { class: "btn btn--danger", type: "button" }, t("progress.data.resetYes"));
    const no = el("button", { class: "btn btn--soft", type: "button" }, t("progress.data.cancel"));
    yes.addEventListener("click", async () => { try { await idbClearAll(); } catch { /* noop */ } resetProgress(); revokeUrls(); rerender(); });
    no.addEventListener("click", () => q.remove());
    q.append(el("div", { class: "data__confirm-btns" }, yes, no));
    card.append(q); no.focus();
  });

  return card;
}

// ── Course-complete (L30 / Phase 3 done) celebration surface (04 §9, 02 §8.3/§6) ────────
// Gated on Phase 3 complete (implies B2 / L30 reached) AND every AUTHORED phase complete, so
// it can never fire mid-course. Only core-09 (phase 1) is authored today → phase 3 authored=0
// → this never triggers yet; seed all lessons ≥1★ to exercise it. Renders a B2-in-progress
// badge, a print-friendly "30 Lessons" certificate (window.print + @media print isolates
// .cert), and the re-record-Lesson-1 prompt. The L1↔L30 comparison stays in growthCard.
function isCourseComplete(stats) {
  const p3 = (stats.phases || []).find((p) => p.n === 3);
  const everyAuthoredDone = (stats.phases || []).every((p) => p.authored === 0 || p.complete);
  return !!(p3 && p3.complete && everyAuthoredDone);
}

function certificate(g) {
  const m = g.metrics || {};
  // A readable container (NOT role="img" — the title/stats/date are meaningful content a
  // screen reader must reach); the cert__title <h3> gives it an outline slot.
  return el("div", { class: "cert" },
    el("p", { class: "cert__seal", "aria-hidden": "true" }, "🎓"),
    el("p", { class: "cert__kicker" }, t("progress.complete.certLabel")),
    el("h3", { class: "cert__title" }, t("progress.complete.certTitle")),
    el("p", { class: "cert__brand" }, t("progress.complete.certBrand")),
    el("p", { class: "cert__line" }, t("progress.complete.certLine")),
    el("p", { class: "cert__stats" },
      el("span", null, el("span", { "aria-hidden": "true" }, "🎧 "), tf("progress.complete.certMinutes", groupNum(m.listeningMinutes || 0))),
      el("span", { class: "cert__dot", "aria-hidden": "true" }, " · "),
      el("span", null, el("span", { "aria-hidden": "true" }, "🗣️ "), tf("progress.complete.certReps", groupNum(m.speakingReps || 0)))),
    el("p", { class: "cert__date" }, t("progress.complete.certDate") + ": " + todayISO()));
}

function courseCompleteCard(g, firstAuthored) {
  const card = el("div", { class: "card complete" });
  card.append(el("p", { class: "complete__burst", "aria-hidden": "true" }, "🎉"));
  card.append(el("h2", { class: "complete__h" }, t("progress.complete.title")));
  card.append(el("p", { class: "complete__body" }, t("progress.complete.body")));

  // B2-in-progress badge — celebratory, never color-only (glyph + text + aria).
  card.append(el("div", { class: "complete__b2", role: "img", "aria-label": t("progress.complete.b2Aria") },
    el("span", { class: "complete__b2-ic", "aria-hidden": "true" }, "📈"),
    el("span", { class: "complete__b2-lab" }, t("progress.complete.b2Badge"))));

  // Printable "30 Lessons" certificate + a real <button> that calls window.print().
  card.append(certificate(g));
  const printBtn = el("button", { class: "btn btn--primary complete__print", type: "button" },
    el("span", { class: "set-ic", "aria-hidden": "true" }, "🖨"), t("progress.complete.print"));
  printBtn.addEventListener("click", () => { try { window.print(); } catch { /* noop */ } });
  card.append(printBtn);

  // Re-record-Lesson-1 prompt → deep-link to the first authored lesson's Speak-It.
  if (firstAuthored) card.append(el("div", { class: "complete__rerec" },
    el("p", { class: "complete__rerec-t" }, el("span", { "aria-hidden": "true" }, "💡 "), t("progress.complete.rerecord")),
    el("a", { class: "btn btn--soft complete__rerec-cta", href: "#/lesson/" + firstAuthored.id },
      tf("progress.complete.rerecordCta", firstAuthored.order))));
  return card;
}

// ── Public entry ───────────────────────────────────────────────────────────────────────
export async function renderProgress(main, seq, alive) {
  revokeUrls();
  main.replaceChildren(skeleton());

  let index = null;
  try { index = await loadIndex(); } catch { index = null; }
  if (alive && !alive()) return;

  let recs = [];
  try { recs = await idbGetAll(); } catch { recs = []; }
  if (alive && !alive()) return;

  // index-aware writes FIRST (phase badges + coverage) so the gallery/grid below reflect them
  const stats = deriveFromIndex(index);
  if (stats.completePhases.length) awardPhaseBadges(stats.completePhases);
  // Derive coverage from the CURRENT completions, max-merge it into the PERSISTED ieltsTopics
  // union (setTopicCoverage persists only on change), then RENDER from the returned persisted
  // union — NOT the transient recompute. So an imported ieltsTopics entry with no matching local
  // completion still renders as covered (empty topicCounts → no write, full union still returned).
  const coverage = setTopicCoverage(stats.topicCounts);

  const g = getGlobal();
  const rollups = { ...getProgressStats(), phases: stats.phases };
  const earned = getBadges();

  const sec = el("section", { class: "screen prog" });
  sec.append(el("h1", { class: "screen__title" }, t("route.progress.title")));
  // Course-complete celebration leads when Phase 3 is done (04 §9). Won't fire until the
  // full catalogue is authored + completed; graceful + testable by seeding all-complete.
  if (index && isCourseComplete(stats)) {
    const firstAuthored = [...(index.lessons || [])].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))[0] || null;
    sec.append(courseCompleteCard(g, firstAuthored));
  }
  sec.append(heroCounters(g));
  if (index) sec.append(cefrLadder(stats));
  sec.append(streakCard(g));
  sec.append(badgeGallery(earned, rollups));
  if (index) sec.append(coverageGrid(coverage));
  sec.append(growthCard(recs, index));
  sec.append(dataCard(() => renderProgress(main, seq, alive)));

  if (alive && !alive()) { revokeUrls(); return; }
  main.replaceChildren(sec);
}
