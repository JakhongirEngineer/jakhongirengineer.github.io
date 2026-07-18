// progress.js — the CANONICAL `ess.progress.v1` progress ENGINE (03 §6.3).
// S3 shipped a lightweight recorder (listens / msAnswersAloud / resume pos / record
// flag); S5 turns it into the real engine: the FULL union shape, a load-time
// migrate(), the star-award path (completeLesson), real listening minutes, and the
// study-day → streak → weekly-goal machinery (02 §8.3). Everything is wrapped so
// private-mode / quota failures degrade silently (04 §9). `schemaVersion` stays **1**
// — the curriculum-redefinition note in 03 §6.3 forbids a bump; the reader treats any
// absent step key as false and normalises legacy dev data on load instead.
//
// Canonical field names (03 §6.3):
//   metrics{listeningMinutes,speakingReps,recordings,xp}
//   streak{count,longest,lastActiveDate,freezesLeftThisWeek,weekStart}  ← weekStart is the ISO-week anchor
//   weeklyGoal{target,activeDaysThisWeek}
//   badges[] · ieltsTopics{}                       ← kept, populated in S6 (not S5)
//   lessons.<id>.{status,stars,steps,listens,msAnswersAloud,startedAt,completedAt,reviewDue,reviewStage,audio}

import { lsGetObj, lsSetObj } from "./core.js";

const now = () => Date.now();
const today = () => new Date().toISOString().slice(0, 10);   // UTC ISO date (matches everything below)

// ---- ISO-date / ISO-week helpers (all UTC, consistent with today()) ---------
// The #1 bug surface (02 §8.3): month/year boundaries. Doing the arithmetic on a
// UTC Date via setUTCDate() handles every rollover (e.g. 2026-12-31 → +1 → 2027-01-01).
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const isISO = (v) => typeof v === "string" && ISO.test(v);
const asUTC = (iso) => new Date(iso + "T00:00:00Z");
function addDays(iso, days) {
  const d = asUTC(iso); d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {                        // whole days from a → b (b − a); ±across boundaries
  return Math.round((asUTC(b) - asUTC(a)) / 86400000);
}
function mondayOf(iso) {                            // ISO week anchor = Monday of the week containing iso
  const d = asUTC(iso);
  const offset = (d.getUTCDay() + 6) % 7;          // getUTCDay: Sun=0..Sat=6 → Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

// key (lesson JSON audio.* / englishpod.audio.* / sixmin.audio.*) → the listens.*
// field that backs the ★ rules (02 §8.1). EnglishPod `dg` feeds `ep`; the 6ME main
// feeds `sixmin`. pr/rv are explanation/recap — not listen-counted.
const LISTEN_FIELD = { main: "main", ministory: "ms", pov: "pov", dg: "ep", sixmin: "sixmin" };

// ---- Shape guarantee — the FULL union (03 §6.3). Idempotent; never wipes data --
function ensure(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) o = {};
  o.schemaVersion = 1;
  if (typeof o.settings !== "object" || !o.settings) o.settings = {};

  const m = (o.metrics && typeof o.metrics === "object") ? o.metrics : (o.metrics = {});
  for (const k of ["listeningMinutes", "speakingReps", "recordings", "xp"])
    if (typeof m[k] !== "number" || !Number.isFinite(m[k])) m[k] = 0;

  const s = (o.streak && typeof o.streak === "object") ? o.streak : (o.streak = {});
  if (typeof s.count !== "number") s.count = 0;
  if (typeof s.longest !== "number") s.longest = 0;
  if (!isISO(s.lastActiveDate)) s.lastActiveDate = null;
  if (typeof s.freezesLeftThisWeek !== "number") s.freezesLeftThisWeek = 1;
  if (!isISO(s.weekStart)) s.weekStart = null;      // ISO-week anchor (Monday)

  const w = (o.weeklyGoal && typeof o.weeklyGoal === "object") ? o.weeklyGoal : (o.weeklyGoal = {});
  if (typeof w.target !== "number" || w.target <= 0) w.target = 5;   // forgiving 5/7 (02 §8.3)
  if (typeof w.activeDaysThisWeek !== "number") w.activeDaysThisWeek = 0;

  if (!Array.isArray(o.badges)) o.badges = [];       // kept; S6 populates
  if (!o.ieltsTopics || typeof o.ieltsTopics !== "object") o.ieltsTopics = {}; // kept; S6 populates
  if (!o.lessons || typeof o.lessons !== "object") o.lessons = {};
  if (!o.startedAt) o.startedAt = today();
  return o;
}

// ---- Load-time normaliser (03 §6.3 curriculum-redefinition note) -------------
// A real migrate(): prune retired supp-* lesson entries, fold a lone steps.grammar
// into grammarA, drop orphan steps.supp — then ensure() the union shape. A FUTURE
// unknown schemaVersion (>1) is NOT wiped: we keep the data and just normalise.
export function migrate(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return ensure({});
  if (o.lessons && typeof o.lessons === "object") {
    for (const id of Object.keys(o.lessons)) {
      if (id.startsWith("supp-")) { delete o.lessons[id]; continue; }   // retired supp-* entries
      const L = o.lessons[id];
      if (L && typeof L === "object" && L.steps && typeof L.steps === "object") {
        if (L.steps.grammar !== undefined) {                            // lone grammar → grammarA
          if (L.steps.grammarA === undefined) L.steps.grammarA = L.steps.grammar;
          delete L.steps.grammar;
        }
        if (L.steps.supp !== undefined) delete L.steps.supp;            // orphan supp step
      }
    }
  }
  return ensure(o);
}
// Every read funnels through load() so snapshot()/getGlobal()/update() see a
// normalised object (migrate() is idempotent + cheap).
const load = () => migrate(lsGetObj());

// The curriculum-redefinition step set (03 §6.3): grammar split into grammarA/grammarB,
// ep/sixmin folded in, supp dropped. Any absent step key reads as false.
function defaultLesson() {
  return {
    status: "none", stars: 0,
    steps: { grammarA: false, grammarB: false, vocab: false, main: false, ministory: false,
             pov: false, ep: false, sixmin: false, fun: false, record: false },
    listens: { main: 0, ms: 0, pov: 0, ep: 0, sixmin: 0 },
    msAnswersAloud: 0,
    startedAt: null, completedAt: null, reviewDue: null, reviewStage: 0, audio: {},
  };
}

function ensureLesson(o, id) {
  if (!o.lessons[id]) o.lessons[id] = defaultLesson();
  const L = o.lessons[id];
  if (typeof L.stars !== "number") L.stars = 0;
  if (typeof L.status !== "string") L.status = "none";
  if (!L.listens) L.listens = { main: 0, ms: 0, pov: 0, ep: 0, sixmin: 0 };
  else for (const k of ["main", "ms", "pov", "ep", "sixmin"]) if (typeof L.listens[k] !== "number") L.listens[k] = 0;
  if (!L.steps || typeof L.steps !== "object") L.steps = {};  // reads/writes steps.record + the completion snapshot
  if (!L.audio) L.audio = {};
  if (typeof L.msAnswersAloud !== "number") L.msAnswersAloud = 0;
  if (typeof L.reviewStage !== "number") L.reviewStage = 0;
  if (L.completedAt === undefined) L.completedAt = null;
  if (L.reviewDue === undefined) L.reviewDue = null;
  return L;
}

// read → normalise → mutate → write, all guarded. Returns the object.
function update(fn) {
  const o = load();
  fn(o);
  o.updatedAt = now();
  lsSetObj(o);
  return o;
}

// ---- Study-day → streak → weekly goal (02 §8.3) — INTERNAL, mutates o --------
// Called by the ACTIONS (markListen, bumpMsAnswer, setRecording, addListeningMinutes,
// completeLesson) — NOT by openLesson (merely opening must not bump the streak).
// Returns TRUE when this study-day is a "comeback" — the first action after a ≥7-day
// gap (02 §8.3) — so the caller's badge pass can award the Comeback badge (kindness,
// not punishment). Every other case returns false.
function registerStudyDay(o) {
  const s = o.streak;
  const td = today();
  const wk = mondayOf(td);
  if (s.weekStart !== wk) {              // a NEW ISO week → reset the weekly counters BEFORE applying today
    s.weekStart = wk;
    s.freezesLeftThisWeek = 1;
    o.weeklyGoal.activeDaysThisWeek = 0;
  }
  if (s.lastActiveDate === td) return false;   // already counted today — noop
  let counted = false, cameBack = false;
  if (!s.lastActiveDate) {
    s.count = 1; counted = true;                                   // first ever
  } else {
    const gap = daysBetween(s.lastActiveDate, td);
    if (gap === 1) { s.count += 1; counted = true; }               // consecutive day
    else if (gap === 2 && s.freezesLeftThisWeek > 0) {             // exactly one missing day → auto-freeze
      s.freezesLeftThisWeek -= 1; s.count += 1; counted = true;
    } else if (gap >= 2) {                                         // missed day(s) with no freeze → reset to 1
      s.count = 1; counted = true;
      if (gap >= 7) cameBack = true;                              // ≥7-day gap → Comeback (02 §8.3)
    }
    // gap <= 0 (clock skew / earlier date): leave the streak untouched
  }
  if (counted) {
    s.lastActiveDate = td;
    if (s.count > s.longest) s.longest = s.count;
    o.weeklyGoal.activeDaysThisWeek = Math.min((o.weeklyGoal.activeDaysThisWeek || 0) + 1, 7);
  }
  return cameBack;
}

// ---- Badge engine (02 §8.3) — INTERNAL, mutates o.badges, returns the NEW ids ----
// All count-based badges are DERIVED from the union object `o` (no extra counters to
// drift). Phase/CEFR badges need the catalogue (which lessons are in which phase) and
// so are awarded from the Progress page via awardPhaseBadges() (index-aware). Ids match
// the 03 §6.3 examples ("first-step", "streak-7", "a2-foundation", …).
const BADGE = {
  FIRST: "first-step",
  STREAK7: "streak-7", STREAK30: "streak-30", STREAK100: "streak-100",
  LISTEN100: "deep-listener-100", LISTEN500: "deep-listener-500", LISTEN1000: "deep-listener-1000",
  SPEAKER: "speaker", VOICE: "voice", GRAMMAR: "grammar-guru", CONVO: "conversationalist",
  A2: "a2-foundation", B1: "b1-momentum", B2: "b2-fluency", COMEBACK: "comeback",
};
const PHASE_BADGE = { 1: BADGE.A2, 2: BADGE.B1, 3: BADGE.B2 };

function award(o, id, out) {
  if (!id) return;
  if (!Array.isArray(o.badges)) o.badges = [];
  if (!o.badges.includes(id)) { o.badges.push(id); out.push(id); }
}

// Evaluate every derivable badge; `cameBack` is the registerStudyDay comeback signal.
function evaluateBadges(o, cameBack) {
  const out = [];
  const m = o.metrics || {};
  const lessons = o.lessons || {};
  // first-step — any lesson reached ≥1★ (02 §8.3: "complete Lesson 01"; generalised to the first authored lesson)
  if (Object.values(lessons).some((L) => L && (L.status === "complete" || L.status === "mastered" || (L.stars || 0) >= 1)))
    award(o, BADGE.FIRST, out);
  // streaks — a badge, once earned, never un-earns: gate on the best-ever run
  const best = Math.max((o.streak && o.streak.count) || 0, (o.streak && o.streak.longest) || 0);
  if (best >= 7) award(o, BADGE.STREAK7, out);
  if (best >= 30) award(o, BADGE.STREAK30, out);
  if (best >= 100) award(o, BADGE.STREAK100, out);
  // deep listener — 100 / 500 / 1000 total listening minutes
  const min = m.listeningMinutes || 0;
  if (min >= 100) award(o, BADGE.LISTEN100, out);
  if (min >= 500) award(o, BADGE.LISTEN500, out);
  if (min >= 1000) award(o, BADGE.LISTEN1000, out);
  if ((m.speakingReps || 0) >= 100) award(o, BADGE.SPEAKER, out);   // speaker — 100 mini-story answers aloud
  if ((m.recordings || 0) >= 10) award(o, BADGE.VOICE, out);        // voice — 10 recordings saved
  // grammar-guru — 20 grammar drill sets across the 60 topics (each completed topic = one set)
  // + conversationalist — 15 EnglishPod sections done. Both derived from the persisted step snapshot.
  let sets = 0, ep = 0;
  for (const L of Object.values(lessons)) {
    if (!L || !L.steps) continue;
    if (L.steps.grammarA) sets++;
    if (L.steps.grammarB) sets++;
    if (L.steps.ep) ep++;
  }
  if (sets >= 20) award(o, BADGE.GRAMMAR, out);
  if (ep >= 15) award(o, BADGE.CONVO, out);
  if (cameBack) award(o, BADGE.COMEBACK, out);
  return out;
}

// A study action: register the day + evaluate badges in one pass. Returns the new badge
// ids so the caller can dispatch the earn-toast AFTER the write lands.
function studyDay(o) {
  const cameBack = registerStudyDay(o);
  return evaluateBadges(o, cameBack);
}

// Dispatch the shell earn-toast for freshly-earned badges. Guarded so the Node engine
// harness (no `document`) is safe; the detail carries the ids the toast renders.
function emitBadges(ids) {
  if (!ids || !ids.length || typeof document === "undefined") return;
  try { document.dispatchEvent(new CustomEvent("yp:badge", { detail: { ids: ids.slice() } })); } catch { /* noop */ }
}

// ---- Reads (pure — no write) ------------------------------------------------
export function snapshot(id) {
  const o = load();
  return ensureLesson(o, id); // shape guaranteed (stars/status/steps/reviewDue/reviewStage/completedAt); NOT written back
}
export function getPos(id, key) {
  const a = snapshot(id).audio[key];
  return (a && typeof a.posSec === "number") ? a.posSec : 0;
}

// The Home first-run-vs-returning decision + the hero row (04 §4.1). hasProgress =
// ANY real activity (lastLessonId set OR any metric>0 OR any lesson started/complete).
export function getGlobal() {
  const o = load();
  const m = o.metrics;
  const anyMetric = m.listeningMinutes > 0 || m.speakingReps > 0 || m.recordings > 0 || m.xp > 0;
  const anyLesson = Object.values(o.lessons).some(
    (L) => L && (L.startedAt != null || L.status === "inProgress" || L.status === "complete" || L.status === "mastered"));
  return {
    metrics: { ...m },
    streak: { ...o.streak },
    weeklyGoal: { ...o.weeklyGoal },
    lastLessonId: o.lastLessonId || null,
    startedAt: o.startedAt || null,
    hasProgress: !!o.lastLessonId || anyMetric || anyLesson,
  };
}

// The ids whose reviewDue is a valid ISO date ≤ today AND status is complete/mastered
// (Home "Review today" cards, 02 §8.3). ISO date strings compare lexically.
export function reviewDueToday(ids) {
  const o = load();
  const td = today();
  const list = Array.isArray(ids) ? ids : Object.keys(o.lessons);
  return list.filter((id) => {
    const L = o.lessons[id];
    return L && (L.status === "complete" || L.status === "mastered") && isISO(L.reviewDue) && L.reviewDue <= td;
  });
}

// ---- Writes -----------------------------------------------------------------
// Mark this lesson the "continue" target + as started. Deliberately does NOT bump
// the streak (02 §8.3: a study-day needs a real action, not merely opening a page).
export function openLesson(id) {
  update((o) => {
    const L = ensureLesson(o, id);
    o.lastLessonId = id;
    if (!L.startedAt) { L.startedAt = now(); if (L.status === "none") L.status = "inProgress"; }
  });
}

// Throttled by the caller (~5 s, 04 §5.1). Stores resume position. No study-day.
export function savePos(id, key, posSec) {
  update((o) => {
    const L = ensureLesson(o, id);
    L.audio[key] = { ...(L.audio[key] || {}), posSec: Math.max(0, posSec || 0) };
  });
}

// A track crossed ~90% (04 §5.1) → mark done + bump the repeat-listen counter that
// feeds the ★ gate. Counts as a study-day. Returns the new listen count (for the dots).
export function markListen(id, key) {
  const field = LISTEN_FIELD[key];
  let count = 0, newBadges = [];
  update((o) => {
    const L = ensureLesson(o, id);
    L.audio[key] = { ...(L.audio[key] || {}), done: true };
    if (field) { L.listens[field] = (L.listens[field] || 0) + 1; count = L.listens[field]; }
    newBadges = studyDay(o);
  });
  emitBadges(newBadges);
  return count;
}

// A mini-story pair was self-checked ✓ aloud (04 §5.6). Bumps this lesson's reps and
// the metrics.speakingReps rollup (03 §6.3). Counts as a study-day. Returns the total.
export function bumpMsAnswer(id) {
  let total = 0, newBadges = [];
  update((o) => {
    const L = ensureLesson(o, id);
    L.msAnswersAloud = (L.msAnswersAloud || 0) + 1;
    o.metrics.speakingReps = (o.metrics.speakingReps || 0) + 1;
    total = L.msAnswersAloud;
    newBadges = studyDay(o);
  });
  emitBadges(newBadges);
  return total;
}

// Real listening time flushed by player.js as whole minutes accrue (03 §6.3 note).
// n is whole minutes (≥1); counts as a study-day (≥5 min is the 02 §8.3 threshold —
// the streak logic itself is idempotent per day, so bumping earlier is harmless).
export function addListeningMinutes(n) {
  const k = Math.floor(n);
  if (!(k >= 1)) return;
  let newBadges = [];
  update((o) => {
    o.metrics.listeningMinutes = (o.metrics.listeningMinutes || 0) + k;
    newBadges = studyDay(o);
  });
  emitBadges(newBadges);
}

// The star-award path (04 §5.7 / 02 §8.1). `stars` is the tier the Lesson Check
// derived (1|2|3); `present` is the 10-boolean steps snapshot. Never downgrades.
// Returns the updated lesson object.
export function completeLesson(id, { stars, present } = {}) {
  let result = null, newBadges = [];
  update((o) => {
    const L = ensureLesson(o, id);
    const prevTier = Math.max(0, Math.min(3, Math.floor(L.stars || 0))); // stored tier BEFORE this earn
    const tier = Math.max(1, Math.min(3, Math.floor(stars || 0)));
    const newTier = Math.max(prevTier, tier);              // never DOWNGRADE
    L.stars = newTier;
    L.status = L.stars >= 3 ? "mastered" : "complete";
    if (present && typeof present === "object") L.steps = { ...L.steps, ...present };  // final derived snapshot
    if (!L.completedAt) L.completedAt = now();              // set once (first ≥1★)
    // Award only the DELTA so a 1★→3★ upgrade totals a single 3★'s XP, not both awards.
    // xpFor(t) = 40+10*t for a real tier, 0 for tier 0: first completion pays the full 40+10*t,
    // an upgrade pays 10*(newTier−prevTier), a re-earn at the same tier pays nothing.
    const xpFor = (tr) => tr > 0 ? 40 + 10 * tr : 0;
    o.metrics.xp = (o.metrics.xp || 0) + Math.max(0, xpFor(newTier) - xpFor(prevTier)); // ambient positive feedback
    // Spaced review (02 §8.3, 1-3-7-14): reviewDue = today + [1,3,7,14][min(stage,3)], then stage++
    const stage = Math.min(L.reviewStage || 0, 3);
    L.reviewDue = addDays(today(), [1, 3, 7, 14][stage]);
    L.reviewStage = Math.min(stage + 1, 3);
    o.lastLessonId = id;
    newBadges = studyDay(o);
    result = L;
  });
  emitBadges(newBadges);
  return result;
}

// ---- Speak-It recordings (S4, 03 §6.3 / 02 §8.2) ----------------------------
// The audio BLOB lives in IndexedDB (keyed by lesson id, in lesson-speak.js). Here we
// keep ONLY the lightweight per-lesson `steps.record` flag + the `metrics.recordings`
// count. A recording is a real action → counts as a study-day (setRecording only).

// A recording was persisted for this lesson. Idempotent: only the FIRST save for a
// lesson bumps the count (a replace/re-record doesn't double-count). Returns the count.
export function setRecording(id) {
  let count = 0, newBadges = [];
  update((o) => {
    const L = ensureLesson(o, id);
    if (L.steps.record !== true) {
      L.steps.record = true;
      o.metrics.recordings = (o.metrics.recordings || 0) + 1;
    }
    count = o.metrics.recordings || 0;
    newBadges = studyDay(o);
  });
  emitBadges(newBadges);
  return count;
}

// This lesson's recording was deleted. Decrements the count only if it was set (floor 0).
// A delete is not a study action → no study-day bump.
export function clearRecording(id) {
  let count = 0;
  update((o) => {
    const L = ensureLesson(o, id);
    if (L.steps.record === true) {
      L.steps.record = false;
      o.metrics.recordings = Math.max(0, (o.metrics.recordings || 0) - 1);
    }
    count = o.metrics.recordings || 0;
  });
  return count;
}

// Is a recording flagged for this lesson? (the localStorage view — the IndexedDB blob
// is the real store; lesson-speak reconciles the two on load.)
export function hasRecordingFlag(id) {
  return snapshot(id).steps.record === true;
}

// ============================================================================
// S6 — Progress page + gamification + export/import (04 §4.6/§6, 02 §7/§8.2/§8.3)
// ============================================================================

// ---- Phase / CEFR badges (02 §8.3) — index-aware, called by the Progress page ----
// The engine can't see the catalogue, so which lessons belong to which phase (and
// whether a phase is fully complete) is decided by progress-page.js against index.json;
// it passes the finished phase numbers here. Awards a2-foundation / b1-momentum /
// b2-fluency, dispatches the earn-toast, and persists ONLY when something is new
// (so a routine Progress-page visit is not a spurious write). Returns the new ids.
export function awardPhaseBadges(phaseNums) {
  const o = load();
  const out = [];
  (Array.isArray(phaseNums) ? phaseNums : []).forEach((n) => award(o, PHASE_BADGE[n], out));
  if (out.length) { o.updatedAt = now(); lsSetObj(o); emitBadges(out); }
  return out;
}

// The full earned set (Home/Progress read this; the toast reads the event detail).
export function getBadges() {
  return (load().badges || []).slice();
}

// Derived rollups the Progress page needs for the badge-gallery "n/target" hints and the
// hero counters — computed from the whole union so they match the engine's badge rules
// (no index needed; index-derived phase stats are computed on the page).
export function getProgressStats() {
  const o = load();
  const lessons = Object.values(o.lessons || {});
  let completed = 0, stars = 0, grammarSets = 0, epDone = 0;
  for (const L of lessons) {
    if (!L) continue;
    const st = Math.max(0, Math.min(3, Math.floor(L.stars || 0)));
    if (L.status === "complete" || L.status === "mastered" || st >= 1) completed++;
    stars += st;
    if (L.steps) { if (L.steps.grammarA) grammarSets++; if (L.steps.grammarB) grammarSets++; if (L.steps.ep) epDone++; }
  }
  const m = o.metrics || {}, s = o.streak || {};
  return {
    completed, stars, grammarSets, epDone,
    listeningMinutes: m.listeningMinutes || 0,
    speakingReps: m.speakingReps || 0,
    recordings: m.recordings || 0,
    streakBest: Math.max(s.count || 0, s.longest || 0),
  };
}

// ---- IELTS-topic coverage grid (04 §4.6, 02 §8.3) ---------------------------
// Simple + derivable: the Progress page maps each COMPLETED lesson's index tags to the
// ~20 IELTS topics and reconciles the counts here (max-merge, so a manual bumpTopic is
// never lost), persisting only on change. `ieltsTopics{}` then rides along in the export
// and feeds both the coverage grid and the #/ielts page.
export function bumpTopic(topic, n = 1) {
  if (!topic) return;
  update((o) => { o.ieltsTopics[topic] = (o.ieltsTopics[topic] || 0) + Math.max(1, Math.floor(n) || 1); });
}
export function setTopicCoverage(counts) {
  if (!counts || typeof counts !== "object") return {};
  const o = load();
  let changed = false;
  for (const k of Object.keys(counts)) {
    const v = Math.max(0, Math.floor(counts[k]) || 0);
    if (v > (o.ieltsTopics[k] || 0)) { o.ieltsTopics[k] = v; changed = true; }
  }
  if (changed) { o.updatedAt = now(); lsSetObj(o); }
  return { ...o.ieltsTopics };
}

// ---- Export / Import / Reset (02 §8.2, 04 §4.6/§9, 03 §6.3) ------------------
// The only accountless way to move devices / survive a cache-clear. Export is the
// normalised union (pretty-printed). Import is STRICT — a bad/mis-versioned file is
// REFUSED with a clear reason and MUST NOT corrupt current data (04 §9); preview never
// writes, apply writes only a validated + migrated object.
export function exportProgress() {
  return JSON.stringify(load(), null, 2);
}

// Parse + validate + migrate IN MEMORY. Refuse anything we don't understand.
function parseImport(text) {
  let data;
  try { data = JSON.parse(text); } catch { return { ok: false, error: "badJson" }; }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "invalid" };
  // Current schema is 1 (the only version). A missing / higher / non-1 version is refused
  // rather than risk corrupting the live data (a future bump would widen this to ≤ current).
  if (data.schemaVersion !== 1) return { ok: false, error: "badVersion" };
  return { ok: true, data: migrate(data) };
}

// The 4 headline numbers for the diff-preview (before-vs-incoming).
function summarize(o) {
  const lessons = Object.values(o.lessons || {});
  return {
    lessons: lessons.filter((L) => L && (L.status === "complete" || L.status === "mastered" || (L.stars || 0) >= 1)).length,
    stars: lessons.reduce((s, L) => s + Math.max(0, Math.min(3, Math.floor((L && L.stars) || 0))), 0),
    minutes: (o.metrics && o.metrics.listeningMinutes) || 0,
    streak: (o.streak && o.streak.count) || 0,
  };
}

export function previewImport(text) {
  const p = parseImport(text);
  if (!p.ok) return { ok: false, error: p.error };
  const a = summarize(load()), b = summarize(p.data);
  return { ok: true, preview: {
    lessons: { before: a.lessons, incoming: b.lessons },
    stars:   { before: a.stars,   incoming: b.stars },
    minutes: { before: a.minutes, incoming: b.minutes },
    streak:  { before: a.streak,  incoming: b.streak },
  } };
}

export function applyImport(text) {
  const p = parseImport(text);
  if (!p.ok) return { ok: false, error: p.error };
  p.data.updatedAt = now();
  return lsSetObj(p.data) ? { ok: true } : { ok: false, error: "write" };
}

// Wipe progress to a clean default but KEEP the user's settings (uiLang/theme/pace/rate)
// so a reset never flips the UI language mid-session (kindness). The Progress page also
// clears the IndexedDB recordings so the count can't resurrect on the next lesson visit.
export function resetProgress() {
  const prev = load();
  const fresh = ensure({});
  if (prev.settings && typeof prev.settings === "object") fresh.settings = prev.settings;
  fresh.startedAt = today();
  fresh.updatedAt = now();
  lsSetObj(fresh);
}

// ---- Re-engagement banner (02 §8.3, 04 §6) ----------------------------------
// TRUE at most once/day when the user hasn't studied today and hasn't dismissed today —
// driven off streak.lastActiveDate + a stored o.reengageDismissed date. Kind, never guilt.
export function shouldReengage() {
  const o = load();
  const td = today();
  if (o.streak && o.streak.lastActiveDate === td) return false;   // already studied today
  if (o.reengageDismissed === td) return false;                   // already dismissed today
  return true;
}
export function dismissReengage() {
  update((o) => { o.reengageDismissed = today(); });
}
