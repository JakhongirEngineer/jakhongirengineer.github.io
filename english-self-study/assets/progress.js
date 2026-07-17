// progress.js — the localStorage progress surface the lesson page needs NOW.
// S3 does NOT build the progress engine (S5 owns the star model, gate enforcement,
// streak/minutes). This module only *records what the ★ gate will later read*, using
// the canonical ess.progress.v1 field names (03 §6.3):
//   • lessons.<id>.listens.{main|ms|pov}  — repeat-listen counters (bumped at ~90%)
//   • lessons.<id>.msAnswersAloud         — mini-story spoken reps (+ metrics.speakingReps rollup)
//   • lessons.<id>.audio.<key>.{posSec,done} — resume position + done flag
//   • lessons.<id>.steps.record + metrics.recordings — Speak-It flag/count (S4; the audio
//                                            blob itself lives in IndexedDB, 02 §8.2, §6.3)
//   • lastLessonId, lessons.<id>.{status,startedAt}
// Everything is wrapped so private-mode / quota failures degrade silently (04 §9).

import { lsGetObj, lsSetObj } from "./core.js";

const now = () => Date.now();
const today = () => new Date().toISOString().slice(0, 10);

// key (lesson JSON audio.* / englishpod.audio.* / sixmin.audio.*) → the listens.*
// field that backs the ★ rules (02 §8.1). EnglishPod `dg` feeds `ep`; the 6ME main
// feeds `sixmin`. pr/rv are explanation/recap — not listen-counted.
const LISTEN_FIELD = { main: "main", ministory: "ms", pov: "pov", dg: "ep", sixmin: "sixmin" };

function ensure(o) {
  o.schemaVersion = 1;
  if (typeof o.settings !== "object" || !o.settings) o.settings = {};
  if (!o.metrics || typeof o.metrics !== "object")
    o.metrics = { listeningMinutes: 0, speakingReps: 0, recordings: 0, xp: 0 };
  if (!o.lessons || typeof o.lessons !== "object") o.lessons = {};
  if (!o.startedAt) o.startedAt = today();
  return o;
}

// The curriculum-redefinition step set (03 §6.3, no version bump): grammar split
// into grammarA/grammarB, ep/sixmin folded in, supp dropped. Any absent step key
// reads as false, so legacy dev data (a lone `grammar`, an orphan `supp`) is simply
// ignored; the new default carries the current shape.
function defaultLesson() {
  return {
    status: "none", stars: 0,
    steps: { grammarA: false, grammarB: false, vocab: false, main: false, ministory: false,
             pov: false, ep: false, sixmin: false, fun: false, record: false },
    listens: { main: 0, ms: 0, pov: 0, ep: 0, sixmin: 0 },
    msAnswersAloud: 0,
    startedAt: null, completedAt: null, reviewDue: null, audio: {},
  };
}

function ensureLesson(o, id) {
  if (!o.lessons[id]) o.lessons[id] = defaultLesson();
  const L = o.lessons[id];
  if (!L.listens) L.listens = { main: 0, ms: 0, pov: 0, ep: 0, sixmin: 0 };
  else for (const k of ["main", "ms", "pov", "ep", "sixmin"]) if (typeof L.listens[k] !== "number") L.listens[k] = 0;
  if (!L.steps || typeof L.steps !== "object") L.steps = {};  // S4 reads/writes steps.record
  if (!L.audio) L.audio = {};
  if (typeof L.msAnswersAloud !== "number") L.msAnswersAloud = 0;
  return L;
}

// read → ensure shape → mutate → write, all guarded. Returns the object.
function update(fn) {
  const o = ensure(lsGetObj());
  fn(o);
  o.updatedAt = now();
  lsSetObj(o);
  return o;
}

// ---- Reads ------------------------------------------------------------------
export function snapshot(id) {
  const o = ensure(lsGetObj());
  return ensureLesson(o, id); // shape guaranteed; NOT written back (pure read)
}
export function getPos(id, key) {
  const a = snapshot(id).audio[key];
  return (a && typeof a.posSec === "number") ? a.posSec : 0;
}

// ---- Writes -----------------------------------------------------------------
// Mark this lesson the "continue" target + as started (lightweight, not the engine).
export function openLesson(id) {
  update((o) => {
    const L = ensureLesson(o, id);
    o.lastLessonId = id;
    if (!L.startedAt) { L.startedAt = now(); if (L.status === "none") L.status = "inProgress"; }
  });
}

// Throttled by the caller (~5 s, 04 §5.1). Stores resume position.
export function savePos(id, key, posSec) {
  update((o) => {
    const L = ensureLesson(o, id);
    L.audio[key] = { ...(L.audio[key] || {}), posSec: Math.max(0, posSec || 0) };
  });
}

// A track crossed ~90% (04 §5.1) → mark done + bump the repeat-listen counter that
// feeds the ★ gate. Returns the new listen count for that component (for the dots).
export function markListen(id, key) {
  const field = LISTEN_FIELD[key];
  let count = 0;
  update((o) => {
    const L = ensureLesson(o, id);
    L.audio[key] = { ...(L.audio[key] || {}), done: true };
    if (field) { L.listens[field] = (L.listens[field] || 0) + 1; count = L.listens[field]; }
  });
  return count;
}

// A mini-story pair was self-checked ✓ aloud (04 §5.6). Bumps this lesson's reps and
// the metrics.speakingReps rollup (03 §6.3). Returns the new per-lesson total.
export function bumpMsAnswer(id) {
  let total = 0;
  update((o) => {
    const L = ensureLesson(o, id);
    L.msAnswersAloud = (L.msAnswersAloud || 0) + 1;
    o.metrics.speakingReps = (o.metrics.speakingReps || 0) + 1;
    total = L.msAnswersAloud;
  });
  return total;
}

// ---- Speak-It recordings (S4, 03 §6.3 / 02 §8.2) ----------------------------
// The audio BLOB lives in IndexedDB (keyed by lesson id, in lesson-speak.js). Here we
// keep ONLY the lightweight per-lesson `steps.record` flag + the `metrics.recordings`
// count. metrics.recordings = the number of lessons that currently hold a saved
// recording (re-recording a lesson replaces its blob, so the count is unchanged); the
// L1↔L30 comparison (02 §6/§8.4) needs recordings from two different lessons.

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
  });
  return count;
}

// This lesson's recording was deleted. Decrements the count only if it was set (floor 0).
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
