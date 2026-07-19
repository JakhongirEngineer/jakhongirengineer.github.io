// lesson-speak.js — section ⑨ "Oʻzingni sinab koʻr / Speak It Yourself" (04 §4.3 ⑨ +
// behavior 10; §5.8 record-button states; §9 degradation). The learner records a ~60-sec
// spoken response to an IELTS-style prompt that USES the week's two grammar topics (02 §2).
// The response is a MediaRecorder blob saved to IndexedDB keyed by lesson id — NOTHING is
// uploaded (a hard privacy promise). localStorage keeps only the steps.record flag + the
// metrics.recordings count (03 §6.3, 02 §8.2), never the blob.
//
// Lazily imported by lesson.js ONLY on the lesson route (03 §4), in parallel with
// lesson-episodes.js, so Home/Map first paint never pays for the recorder. Leaf imports
// only (core.js + progress.js — both already loaded by the shell) → no import cycle;
// lesson.js passes a { markRecord } callback via ctx so a save/delete lights the checklist.
//
// Record-button state machine (04 §5.8): idle ● → recording (timer + live level meter) →
// saved (playback + 🗑 delete). Re-recording replaces after confirm; delete confirms too.
// Graceful degradation (04 §9): mic denied → Uzbek how-to-enable + retry (never a dead
// button); IndexedDB unavailable → in-session-only recording + honest note; MediaRecorder
// unsupported → the button is hidden, the answer-aloud alternative stays. Every storage
// call is try/caught.

import { el, icon, t, tf, fmtTime } from "./core.js";
import { setRecording, clearRecording, hasRecordingFlag } from "./progress.js";

const HARD_MAX_SEC = 180;   // safety cap so a forgotten recording never bloats IndexedDB
const DEFAULT_TARGET = 60;  // ~60-sec guidance (02 §2); overridden by speakingPrompt.targetSec
const reducedMotion = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

// ── IndexedDB: blobs keyed by lesson id (02 §8.2). All calls guarded by callers ──────
const DB_NAME = "ess-recordings";
const STORE = "recordings";
let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    let req;
    try {
      if (typeof indexedDB === "undefined") throw new Error("no indexedDB");
      req = indexedDB.open(DB_NAME, 1);
    } catch (e) { reject(e); return; }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("idb open failed"));
    req.onblocked = () => reject(new Error("idb blocked"));
  }).catch((e) => { dbPromise = null; throw e; });  // allow a later retry after a transient failure
  return dbPromise;
}
function idbGet(id) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const rq = tx.objectStore(STORE).get(id);
    rq.onsuccess = () => resolve(rq.result || null);
    rq.onerror = () => reject(rq.error || new Error("idb get failed"));
  }));
}
function idbPut(rec) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("idb put failed"));
    tx.onabort = () => reject(tx.error || new Error("idb put aborted"));
  }));
}
function idbDelete(id) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("idb delete failed"));
  }));
}

// ── Capability detection ─────────────────────────────────────────────────────────────
function canRecord() {
  return typeof navigator !== "undefined" && navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof window.MediaRecorder === "function";
}
function pickMime() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4", "audio/aac"]) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* keep probing */ }
  }
  return "";
}

// ── Module-scoped instance state (only one Speak-It section exists at a time) ─────────
let objUrl = null;          // current playback object URL
let playbackAudio = null;   // the local <audio> for saved-recording playback
let live = null;            // { recorder, stream, audioCtx, rafId, timerId } while recording
let starting = false;       // in-flight guard: true only during startRecording's async getUserMedia gap (blocks re-entrant double-start → orphaned mic stream)
let generation = 0;         // teardown token, bumped by every stopLive (nav-away hashchange, re-render, renderIdle). startRecording snapshots it before its getUserMedia await and, if it moved, releases the just-acquired mic and bails — the async-gap analogue of lesson.js's alive() guard, closing the mic-outlives-the-lesson leak MID-await

function revokeUrl() {
  if (objUrl) { try { URL.revokeObjectURL(objUrl); } catch { /* noop */ } objUrl = null; }
}
function stopPlayback() {
  if (playbackAudio) { try { playbackAudio.pause(); } catch { /* noop */ } playbackAudio = null; }
}
// Fully release an in-progress recording (mic tracks, meter loop, timer, audio graph).
function stopLive(discard) {
  generation++;             // bump BEFORE the early-return: a nav-away / re-render that fires while startRecording's getUserMedia await is still pending (live not yet set) must still move generation so the post-await guard releases the mic and bails
  if (!live) return;
  const L = live; live = null;
  if (discard && L.recorder) L.discarded = true;
  try { if (L.timerId) clearInterval(L.timerId); } catch { /* noop */ }
  try { if (L.rafId) cancelAnimationFrame(L.rafId); } catch { /* noop */ }
  try { if (L.recorder && L.recorder.state !== "inactive") L.recorder.stop(); } catch { /* noop */ }
  try { if (L.stream) L.stream.getTracks().forEach((tr) => tr.stop()); } catch { /* noop */ }
  try { if (L.audioCtx && L.audioCtx.state !== "closed") L.audioCtx.close(); } catch { /* noop */ }
}
// Called at the top of every render + on navigating away (hashchange) → no leaked mic/URL.
function cleanupInstance() { starting = false; stopLive(true); stopPlayback(); revokeUrl(); }  // reset the in-flight guard too: an abandoned getUserMedia await (nav-away / re-render) must not leave `starting` stuck true, which would make the record button on return look dead (04 §9)
// Navigating to a non-lesson route does NOT re-render the lesson, so guarantee mic release.
try { window.addEventListener("hashchange", cleanupInstance); } catch { /* noop */ }

// ── Public entry: build the section ⑨ card ───────────────────────────────────────────
export function speakSection(id, l, ctx) {
  cleanupInstance();                       // tear down any previous lesson's recorder
  const sp = l.speakingPrompt || {};
  const targetSec = (typeof sp.targetSec === "number" && sp.targetSec > 0) ? sp.targetSec : DEFAULT_TARGET;
  const card = el("div", { class: "card speak" });

  card.append(promptBlock(sp, targetSec));

  // Privacy reassurance (UZ) — "nothing is uploaded — faqat siz" (04 §4.3 ⑨).
  card.append(el("p", { class: "speak__privacy" },
    el("span", { class: "speak__privacy-ic", "aria-hidden": "true" }, "🔒 "), t("speak.privacy")));

  // The state-specific control area (idle / recording / saved / denied / unsupported).
  const area = el("div", { class: "speak__area" });
  // Screen-reader status: one polite live region for state changes (a11y §8).
  const status = el("p", { class: "visually-hidden", role: "status", "aria-live": "polite" });
  card.append(area, status);

  // Always-available no-mic alternative — the section is never a dead end (04 §9).
  card.append(el("p", { class: "speak__aloud" },
    el("span", { "aria-hidden": "true" }, "🗣️ "), t("speak.answerAloud")));
  // re-record-Lesson-1-at-Lesson-30 growth hook (02 §6/§8.4).
  card.append(el("p", { class: "speak__hook" },
    el("span", { "aria-hidden": "true" }, "💡 "), t("speak.hook")));

  const ui = { area, status, targetSec, ctx };

  if (!canRecord()) {                      // MediaRecorder unsupported → hide the button gracefully
    area.append(el("p", { class: "speak__note" },
      el("span", { "aria-hidden": "true" }, "ℹ️ "), t("speak.unsupported")));
    return card;
  }

  renderIdle(id, ui, false);               // paint idle immediately (no focus steal on load)
  // Reconcile with IndexedDB (the real store) → if a blob exists, show the saved state.
  idbGet(id).then((rec) => {
    if (rec && rec.blob) {
      try { setRecording(id); } catch { /* noop */ }   // heal the localStorage flag if it drifted
      ctx.markRecord(true);
      renderSaved(id, ui, rec.blob, rec.durationSec || 0, true, false);
    } else if (hasRecordingFlag(id)) {     // flag set but no blob (IndexedDB was cleared) → reconcile
      try { clearRecording(id); } catch { /* noop */ }
      ctx.markRecord(false);
    }
  }).catch(() => { /* IndexedDB unavailable — stay idle; recording will be in-session only */ });

  return card;
}

// ── Prompt block: IELTS-style English prompt + Uzbek instruction + target chip ───────
function promptBlock(sp, targetSec) {
  const wrap = el("div", { class: "speak__prompt" });
  wrap.append(el("p", { class: "speak__task-lab" }, t("speak.task") + ":"));
  wrap.append(el("p", { class: "speak__task-en", lang: "en" }, sp.en || ""));
  wrap.append(el("p", { class: "speak__task-uz", lang: "uz" }, sp.uz || t("speak.instructionDefault")));
  wrap.append(el("p", { class: "speak__target" },
    el("span", { class: "chip speak__target-chip" }, "⏱️ " + tf("speak.targetChip", targetSec))));
  return wrap;
}

// ── State: idle ● ────────────────────────────────────────────────────────────────────
function renderIdle(id, ui, focus) {
  stopLive(true); stopPlayback(); revokeUrl();
  const btn = el("button", { class: "btn btn--primary speak__rec", type: "button", "aria-label": t("speak.recordAria") },
    el("span", { class: "speak__dot", "aria-hidden": "true" }), el("span", null, t("speak.record")));
  btn.addEventListener("click", () => { btn.disabled = true; startRecording(id, ui); });  // disable on tap → the DOM swallows repeat taps on THIS button (belt to the in-flight guard)
  ui.area.replaceChildren(btn);
  if (focus) btn.focus();
}

// ── State: recording (timer + live level meter) → stop ──────────────────────────────
async function startRecording(id, ui) {
  // getUserMedia is async, so without an in-flight guard a rapid double/triple-tap of the
  // record/retry button (or the re-record confirm — all still clickable during the await)
  // fires startRecording again, each call acquiring its OWN mic stream. `live` would then
  // hold only the LAST one, orphaning the earlier streams: stop()/stopLive()/cleanupInstance()
  // act on `live` alone, so the mic stays ON after Stop AND after leaving the lesson — a
  // resource leak and a privacy/trust violation. Block re-entry, and tear down any
  // pre-existing recording, synchronously BEFORE the await (04 §5.8 / §9).
  if (starting) return;
  starting = true;
  stopLive(true);
  const myGen = generation;   // snapshot AFTER the pre-await teardown; a later stopLive (nav-away hashchange, or a re-render / renderIdle) moves generation past this
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    starting = false;
    const name = err && err.name;
    if (name === "NotAllowedError" || name === "SecurityError") renderDenied(id, ui);
    else renderError(id, ui, name === "NotFoundError" ? "speak.noMic" : "speak.error");
    return;
  }
  starting = false;   // stream acquired; everything below runs synchronously, so no re-entrancy window remains
  // Torn down DURING the async getUserMedia gap (user left the lesson, or the section re-rendered)? `live` was still
  // null when cleanupInstance→stopLive ran, so nothing was torn down and this freshly-acquired stream is untracked.
  // Release it now and bail, or its mic track stays readyState 'live' — recording off-screen with no UI, until the next
  // hashchange — the exact leak the R1 in-flight guard did NOT cover (04 §9 / on-device-mic privacy promise).
  if (generation !== myGen) {
    try { stream.getTracks().forEach((tr) => tr.stop()); } catch { /* noop */ }
    return;
  }

  const mime = pickMime();
  let recorder;
  try { recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
  catch {
    try { recorder = new MediaRecorder(stream); }
    catch (e) {
      stream.getTracks().forEach((tr) => tr.stop());
      renderError(id, ui, "speak.error");
      return;
    }
  }

  const chunks = [];
  const reduced = reducedMotion();
  const timerEl = el("span", { class: "speak__timer", "aria-hidden": "true" }, "0:00");
  const hint = el("p", { class: "speak__hint" }, tf("speak.targetHint", ui.targetSec));
  const meter = buildMeter(reduced);
  const stopBtn = el("button", { class: "btn speak__stop", type: "button", "aria-label": t("speak.stopAria") },
    el("span", { class: "speak__square", "aria-hidden": "true" }), el("span", null, t("speak.stop")));
  const recRow = el("div", { class: "speak__recbar" },
    el("span", { class: "speak__reclab" },
      el("span", { class: "speak__dot speak__dot--live", "aria-hidden": "true" }), t("speak.recording")),
    timerEl);
  ui.area.replaceChildren(recRow, meter.el, hint, stopBtn);
  ui.status.textContent = t("speak.recordingStatus");

  let elapsed = 0;
  const timerId = setInterval(() => {
    elapsed += 1;
    timerEl.textContent = fmtTime(elapsed) + " / ~" + fmtTime(ui.targetSec);
    if (elapsed >= ui.targetSec) { recRow.classList.add("is-enough"); hint.textContent = t("speak.enough"); }
    if (elapsed >= HARD_MAX_SEC) stop();      // safety auto-stop
  }, 1000);

  // Live level meter via an AnalyserNode (waveform/level, 04 §5.8). Skipped under reduced motion.
  let audioCtx = null, rafId = 0;
  if (!reduced) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      const bins = new Uint8Array(analyser.frequencyBinCount);
      const step = Math.max(1, Math.floor(analyser.frequencyBinCount / meter.bars.length));
      const draw = () => {
        analyser.getByteFrequencyData(bins);
        meter.bars.forEach((b, i) => {
          const v = bins[Math.min(bins.length - 1, i * step)] / 255;      // 0..1
          b.style.height = Math.round(12 + v * 88) + "%";
        });
        rafId = requestAnimationFrame(draw);
      };
      rafId = requestAnimationFrame(draw);
    } catch { audioCtx = null; }              // meter is decorative — never block recording
  }

  live = { recorder, stream, audioCtx, rafId, timerId, discarded: false };
  const session = live;   // stable ref: stopLive() nulls module-level `live` synchronously, but the async "stop" event below still needs THIS recording's discarded flag

  recorder.addEventListener("dataavailable", (e) => { if (e.data && e.data.size) chunks.push(e.data); });
  recorder.addEventListener("stop", async () => {
    const wasDiscarded = session.discarded;   // read the captured session, NOT `live` (stopLive already set it to null) — else a nav-away mid-recording wrongly SAVES the abandoned clip + marks the step + bumps the count (02 §8)
    // stopLive may already have run (nav away); make sure the graph/timer are down.
    stopLive(false);
    if (wasDiscarded) return;                 // navigated away mid-recording — drop it
    const type = recorder.mimeType || mime || "audio/webm";
    const blob = new Blob(chunks, { type });
    if (!blob.size) { renderError(id, ui, "speak.error"); return; }
    const persisted = await saveRecording(id, blob, elapsed);
    ui.status.textContent = t("speak.savedStatus");
    if (persisted) ui.ctx.markRecord(true);
    renderSaved(id, ui, blob, elapsed, persisted, true);
  });

  function stop() { if (live && live.recorder && live.recorder.state !== "inactive") { try { live.recorder.stop(); } catch { /* onstop still fires */ } } }
  stopBtn.addEventListener("click", stop);

  try { recorder.start(); } catch { stopLive(true); renderError(id, ui, "speak.error"); return; }
  stopBtn.focus();
}

// A few live level bars (decorative, aria-hidden). Static heights under reduced motion.
function buildMeter(reduced) {
  const wrap = el("div", { class: "speak__meter", "aria-hidden": "true" });
  const bars = [];
  for (let i = 0; i < 7; i++) { const b = el("i"); if (reduced) b.style.height = "45%"; wrap.append(b); bars.push(b); }
  return { el: wrap, bars };
}

// ── Persist the blob to IndexedDB + heal the localStorage flag/count. Returns bool. ──
async function saveRecording(id, blob, durationSec) {
  const rec = { id, blob, mime: blob.type || "", createdAt: Date.now(), durationSec: Math.round(durationSec || 0) };
  try {
    await idbPut(rec);
    try { setRecording(id); } catch { /* localStorage unavailable — blob still saved */ }
    return true;
  } catch (e) {
    console.warn("speak: could not persist recording (in-session only)", e);
    return false;                             // IndexedDB unavailable → in-session only (04 §9)
  }
}

// ── State: saved (playback + delete + re-record) ────────────────────────────────────
function renderSaved(id, ui, blob, durationSec, persisted, focus) {
  stopPlayback(); revokeUrl();
  try { objUrl = URL.createObjectURL(blob); } catch { objUrl = null; }
  const audio = el("audio", { preload: "metadata" });
  if (objUrl) audio.src = objUrl;
  playbackAudio = audio;

  const playBtn = el("button", { class: "iconbtn speak__play", type: "button", "aria-label": t("speak.play"), html: icon("play") });
  const timeEl = el("span", { class: "speak__ptime" }, fmtTime(durationSec || 0));
  audio.addEventListener("loadedmetadata", () => { if (Number.isFinite(audio.duration) && audio.duration > 0) timeEl.textContent = fmtTime(audio.duration); });
  audio.addEventListener("timeupdate", () => { const d = audio.duration || durationSec || 0; timeEl.textContent = fmtTime(audio.currentTime) + " / " + fmtTime(d); });
  audio.addEventListener("ended", () => { playBtn.innerHTML = icon("play"); playBtn.setAttribute("aria-label", t("speak.play")); });
  playBtn.addEventListener("click", () => {
    if (audio.paused) { audio.play().then(() => { playBtn.innerHTML = icon("pause"); playBtn.setAttribute("aria-label", t("speak.pause")); }).catch(() => {}); }
    else { audio.pause(); playBtn.innerHTML = icon("play"); playBtn.setAttribute("aria-label", t("speak.play")); }
  });

  const delBtn = el("button", { class: "iconbtn speak__del", type: "button", "aria-label": t("speak.deleteAria") }, "🗑");
  const reBtn = el("button", { class: "btn btn--soft speak__re", type: "button" }, t("speak.rerecord"));

  const player = el("div", { class: "speak__player" },
    el("span", { class: "speak__saved-lab" }, el("span", { "aria-hidden": "true" }, "✅ "), t("speak.saved")),
    el("div", { class: "speak__playrow" }, playBtn, timeEl, delBtn), audio);
  const actions = el("div", { class: "speak__actions" }, reBtn);
  const nodes = [player, actions];
  if (!persisted) nodes.push(el("p", { class: "speak__note speak__note--warn" },
    el("span", { "aria-hidden": "true" }, "⚠️ "), t("speak.noPersist")));
  ui.area.replaceChildren(...nodes);

  // Delete → inline confirm (no jarring modal) → remove blob + reconcile flag/count.
  delBtn.addEventListener("click", () => {
    inlineConfirm(ui.area, t("speak.confirmDelete"), t("speak.confirmDeleteYes"), "btn--danger",
      async () => {
        try { await idbDelete(id); } catch { /* nothing persisted or unavailable */ }
        let count = null; try { count = clearRecording(id); } catch { /* noop */ }
        ui.ctx.markRecord(false);
        ui.status.textContent = t("speak.deletedStatus");
        stopPlayback(); revokeUrl();
        renderIdle(id, ui, true);
      },
      () => renderSaved(id, ui, blob, durationSec, persisted, true));   // cancel → restore
  });
  // Re-record → confirm (it replaces the old one on save) → straight into recording.
  reBtn.addEventListener("click", () => {
    inlineConfirm(ui.area, t("speak.confirmRerecord"), t("speak.confirmYes"), "btn--primary",
      () => { stopPlayback(); startRecording(id, ui); },
      () => renderSaved(id, ui, blob, durationSec, persisted, true));   // cancel → restore
  });

  if (focus) playBtn.focus();
}

// ── State: mic denied → Uzbek how-to-enable + retry (never a dead button, 04 §9) ─────
function renderDenied(id, ui) {
  ui.status.textContent = t("speak.denied");
  const retry = el("button", { class: "btn btn--primary speak__retry", type: "button" },
    el("span", { class: "speak__ic", "aria-hidden": "true", html: icon("retry") }), t("speak.retry"));
  retry.addEventListener("click", () => { retry.disabled = true; startRecording(id, ui); });  // same double-tap protection on the denied/error retry (04 §9)
  ui.area.replaceChildren(
    el("div", { class: "speak__deny" },
      el("p", { class: "speak__deny-h" }, el("span", { "aria-hidden": "true" }, "🎙️ "), t("speak.denied")),
      el("p", { class: "speak__deny-how" }, t("speak.deniedHow"))),
    retry);
  retry.focus();
}

// ── State: other capture error (no device, construction failure) → note + retry ─────
function renderError(id, ui, msgKey) {
  ui.status.textContent = t(msgKey);
  const retry = el("button", { class: "btn btn--primary speak__retry", type: "button" },
    el("span", { class: "speak__ic", "aria-hidden": "true", html: icon("retry") }), t("speak.retry"));
  retry.addEventListener("click", () => { retry.disabled = true; startRecording(id, ui); });  // same double-tap protection on the denied/error retry (04 §9)
  ui.area.replaceChildren(
    el("p", { class: "speak__note" }, el("span", { "aria-hidden": "true" }, "⚠️ "), t(msgKey)),
    retry);
  retry.focus();
}

// ── Inline destructive-confirm row (accessible; replaces the actions in place) ───────
function inlineConfirm(area, question, yesLabel, yesCls, onYes, onNo) {
  const yes = el("button", { class: "btn " + yesCls, type: "button" }, yesLabel);
  const no = el("button", { class: "btn btn--soft", type: "button" }, t("speak.confirmNo"));
  yes.addEventListener("click", onYes);
  no.addEventListener("click", onNo);
  const row = el("div", { class: "speak__confirm", role: "group", "aria-label": question },
    el("p", { class: "speak__confirm-q" }, question),
    el("div", { class: "speak__confirm-btns" }, yes, no));
  area.replaceChildren(row);
  no.focus();
}
