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
function registerStudyDay(o) {
  const s = o.streak;
  const td = today();
  const wk = mondayOf(td);
  if (s.weekStart !== wk) {              // a NEW ISO week → reset the weekly counters BEFORE applying today
    s.weekStart = wk;
    s.freezesLeftThisWeek = 1;
    o.weeklyGoal.activeDaysThisWeek = 0;
  }
  if (s.lastActiveDate === td) return;   // already counted today — noop
  let counted = false;
  if (!s.lastActiveDate) {
    s.count = 1; counted = true;                                   // first ever
  } else {
    const gap = daysBetween(s.lastActiveDate, td);
    if (gap === 1) { s.count += 1; counted = true; }               // consecutive day
    else if (gap === 2 && s.freezesLeftThisWeek > 0) {             // exactly one missing day → auto-freeze
      s.freezesLeftThisWeek -= 1; s.count += 1; counted = true;
    } else if (gap >= 2) { s.count = 1; counted = true; }          // missed day(s) with no freeze → reset to 1
    // gap <= 0 (clock skew / earlier date): leave the streak untouched
  }
  if (counted) {
    s.lastActiveDate = td;
    if (s.count > s.longest) s.longest = s.count;
    o.weeklyGoal.activeDaysThisWeek = Math.min((o.weeklyGoal.activeDaysThisWeek || 0) + 1, 7);
  }
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
  let count = 0;
  update((o) => {
    const L = ensureLesson(o, id);
    L.audio[key] = { ...(L.audio[key] || {}), done: true };
    if (field) { L.listens[field] = (L.listens[field] || 0) + 1; count = L.listens[field]; }
    registerStudyDay(o);
  });
  return count;
}

// A mini-story pair was self-checked ✓ aloud (04 §5.6). Bumps this lesson's reps and
// the metrics.speakingReps rollup (03 §6.3). Counts as a study-day. Returns the total.
export function bumpMsAnswer(id) {
  let total = 0;
  update((o) => {
    const L = ensureLesson(o, id);
    L.msAnswersAloud = (L.msAnswersAloud || 0) + 1;
    o.metrics.speakingReps = (o.metrics.speakingReps || 0) + 1;
    total = L.msAnswersAloud;
    registerStudyDay(o);
  });
  return total;
}

// Real listening time flushed by player.js as whole minutes accrue (03 §6.3 note).
// n is whole minutes (≥1); counts as a study-day (≥5 min is the 02 §8.3 threshold —
// the streak logic itself is idempotent per day, so bumping earlier is harmless).
export function addListeningMinutes(n) {
  const k = Math.floor(n);
  if (!(k >= 1)) return;
  update((o) => {
    o.metrics.listeningMinutes = (o.metrics.listeningMinutes || 0) + k;
    registerStudyDay(o);
  });
}

// The star-award path (04 §5.7 / 02 §8.1). `stars` is the tier the Lesson Check
// derived (1|2|3); `present` is the 10-boolean steps snapshot. Never downgrades.
// Returns the updated lesson object.
export function completeLesson(id, { stars, present } = {}) {
  let result = null;
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
    registerStudyDay(o);
    result = L;
  });
  return result;
}

// ---- Speak-It recordings (S4, 03 §6.3 / 02 §8.2) ----------------------------
// The audio BLOB lives in IndexedDB (keyed by lesson id, in lesson-speak.js). Here we
// keep ONLY the lightweight per-lesson `steps.record` flag + the `metrics.recordings`
// count. A recording is a real action → counts as a study-day (setRecording only).

// A recording was persisted for this lesson. Idempotent: only the FIRST save for a
// lesson bumps the count (a replace/re-record doesn't double-count). Returns the count.
export function setRecording(id) {
  let count = 0;
  update((o) => {
    const L = ensureLesson(o, id);
    if (L.steps.record !== true) {
      L.steps.record = true;
      o.metrics.recordings = (o.metrics.recordings || 0) + 1;
    }
    count = o.metrics.recordings || 0;
    registerStudyDay(o);
  });
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
