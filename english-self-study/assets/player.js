// player.js — the ONE persistent <audio preload="none"> (03 §7) + its docked bar
// (04 §5.1). Lives outside <main>, so it survives every route change and keeps
// playing while the learner browses. Inline section triggers (Vocab/MAIN/Mini-story/
// POV) all drive this single element; only one source plays at a time.
//
// Emits a document "yp:player" CustomEvent on every discrete state change so the
// lesson page can reflect playing state (aria-pressed + equalizer) and the
// repeat-listen dots without this module knowing anything about the page.

import { el, icon, t, loadSettings, saveSetting, fmtTime } from "./core.js";
import { mediaUrl } from "../config.js";
import { savePos, getPos, markListen, addListeningMinutes } from "./progress.js";

const RATES = [0.75, 1, 1.25];
let audio = null;          // the persistent element
let region = null;         // #player (role=region, labelled in index.html)
let dock = null;           // built lazily on first track
let refs = {};             // cached dock sub-elements
let cur = null;            // { key, path, title, lessonId, durationSec }
let expanded = false;
let doneLatched = false;    // one listen counted per ~90% crossing
let lastSaved = 0;         // throttle posSec writes (~5 s)
let pendingSeek = 0;       // restore-position applied after loadedmetadata
let scrubbing = false;

// ---- Real listening minutes (03 §6.3 note) — wall-clock while actually playing --
// We accumulate elapsed ms between timeupdate ticks ONLY while playing & not scrubbing,
// capping any single delta at ~2 s so a backgrounded tab or a seek can't inflate it.
// Whole crossed minutes flush to the engine (progress.addListeningMinutes); this is
// SEPARATE from markListen (which drives the ~90% repeat-listen star dots).
let listenAccumMs = 0;     // active-playback ms not yet flushed as whole minutes
let listenLastTs = 0;      // Date.now() of the last accrual tick; 0 = clock stopped
const MIN_MS = 60000, DELTA_CAP = 2000;
function accrueListen() {   // called from timeupdate while playing
  const ts = Date.now();
  if (listenLastTs > 0 && audio && !audio.paused && !scrubbing) {
    listenAccumMs += Math.min(ts - listenLastTs, DELTA_CAP);   // cap defeats tab-stall / seek inflation
  }
  listenLastTs = ts;
  flushListenMinutes();
}
function pauseAccrual() {   // called on pause/ended: bank the final sliver, stop the clock
  if (listenLastTs > 0 && audio && !scrubbing) listenAccumMs += Math.min(Date.now() - listenLastTs, DELTA_CAP);
  listenLastTs = 0;
  flushListenMinutes();
}
function flushListenMinutes() {
  if (listenAccumMs >= MIN_MS) {
    const mins = Math.floor(listenAccumMs / MIN_MS);
    listenAccumMs -= mins * MIN_MS;
    addListeningMinutes(mins);
  }
}

function state(extra) {
  return { key: cur?.key ?? null, lessonId: cur?.lessonId ?? null,
           playing: !!(cur && audio && !audio.paused), ...extra };
}
function broadcast(extra) {
  document.dispatchEvent(new CustomEvent("yp:player", { detail: state(extra) }));
}
function announce(msg) { if (refs.status) refs.status.textContent = msg; }
const rate = () => (audio && RATES.includes(audio.playbackRate)) ? audio.playbackRate : 1;

// ---- Boot: create the audio element, restore the saved rate (03 §7) ---------
export function initPlayer() {
  region = document.getElementById("player");
  audio = el("audio", { preload: "none" });     // preload=none: 0 bytes until play (P4)
  document.body.appendChild(audio);              // OUTSIDE <main>
  audio.addEventListener("play", () => { listenLastTs = Date.now(); syncPlayBtns(); announce(t("player.playing") + " " + (cur?.title || "")); broadcast(); });
  audio.addEventListener("pause", () => { syncPlayBtns(); pauseAccrual(); flushSave(); broadcast(); });
  audio.addEventListener("loadedmetadata", onMeta);
  audio.addEventListener("timeupdate", onTime);
  audio.addEventListener("ended", onEnded);
  audio.addEventListener("ratechange", () => { if (refs.rate) refs.rate.textContent = rate() + "×"; });
  audio.addEventListener("error", onError);
  const s = loadSettings();
  audio.playbackRate = RATES.includes(s.rate) ? s.rate : 1;
}

// ---- Public: load+play a track, or toggle if it is the current one ----------
export function playTrack({ key, path, title, lessonId, durationSec }) {
  if (cur && cur.key === key && cur.lessonId === lessonId) {   // same track → toggle
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
    return;
  }
  flushSave();
  cur = { key, path, title, lessonId, durationSec };
  doneLatched = false;
  pendingSeek = 0;
  if (!dock) buildDock();
  region.hidden = false;
  document.body.classList.add("yp-has-dock");   // reserve bottom space in <main>
  audio.src = mediaUrl(path);
  audio.playbackRate = rate();
  const pos = getPos(lessonId, key);
  if (pos > 2 && (!durationSec || pos < durationSec * 0.95)) pendingSeek = pos; // restore (04 §5.1)
  audio.load();
  audio.play().catch(() => {});   // autoplay after a user tap is allowed
  paintTrack();
  broadcast();
}

export function getState() { return state(); }
export function refreshText() { if (dock) { relabel(); paintTrack(); } }  // on UZ|EN toggle

// ---- Audio event handlers ---------------------------------------------------
function onMeta() {
  if (pendingSeek > 0) { try { audio.currentTime = pendingSeek; } catch {} pendingSeek = 0; }
  const dur = audio.duration || cur?.durationSec || 0;
  if (refs.seek) { refs.seek.max = Math.max(1, Math.floor(dur)); }
  if (refs.total) refs.total.textContent = fmtTime(dur);
  paintProgress();
}
function onTime() {
  if (scrubbing) return;
  const dur = audio.duration || cur?.durationSec || 0;
  paintProgress();
  // Repeat-listen: count once per ~90% crossing; re-arm after a restart (04 §5.1).
  if (dur > 0) {
    const frac = audio.currentTime / dur;
    if (frac >= 0.9 && !doneLatched) { doneLatched = true; recordListen(); }
    if (frac < 0.1 && doneLatched) doneLatched = false;
  }
  accrueListen();   // bank real listening time (whole minutes flush to the engine)
  const now = Date.now();
  if (now - lastSaved > 5000) { lastSaved = now; savePos(cur.lessonId, cur.key, audio.currentTime); }
}
function onEnded() {
  if (!doneLatched) { doneLatched = true; recordListen(); }
  syncPlayBtns();
  announce(t("player.ended"));
  pauseAccrual();
  flushSave();
  broadcast();
}
function onError() {
  if (!cur) return;
  announce(t("player.error"));
  if (refs.label) refs.label.textContent = t("player.error");
  broadcast({ error: true });
}
function recordListen() {
  const count = markListen(cur.lessonId, cur.key);
  broadcast({ listen: true, count });   // lesson page refreshes the repeat dots
}
function flushSave() { if (cur && audio && audio.currentTime > 0) { lastSaved = Date.now(); savePos(cur.lessonId, cur.key, audio.currentTime); } }

// ---- Docked bar (collapsed ↔ expanded, 04 §5.1) -----------------------------
function iconBtn(name, label, cls, onClick) {
  return el("button", { class: "iconbtn " + (cls || ""), type: "button", "aria-label": label, title: label, html: icon(name), onclick: onClick });
}
function buildDock() {
  const play = iconBtn("play", t("player.play"), "dock__play", togglePlay);
  const playBig = iconBtn("play", t("player.play"), "dock__play dock__play--big", togglePlay);
  const label = el("span", { class: "dock__label" });
  const bar = el("div", { class: "dock__mini" }, el("i", { class: "dock__mini-fill" }));
  const time = el("span", { class: "dock__time" }, "0:00");
  const expand = iconBtn("expand", t("player.expand"), "dock__expand", toggleExpand);

  const seek = el("input", { type: "range", class: "dock__seek", min: "0", max: "1", value: "0", step: "1", "aria-label": t("player.seek") });
  seek.addEventListener("input", () => { scrubbing = true; if (refs.cur) refs.cur.textContent = fmtTime(+seek.value); seek.setAttribute("aria-valuetext", fmtTime(+seek.value)); });
  seek.addEventListener("change", () => { try { audio.currentTime = +seek.value; } catch {} scrubbing = false; });
  const curT = el("span", { class: "dock__t" }, "0:00");
  const totT = el("span", { class: "dock__t" }, "0:00");
  const back = iconBtn("replay10", t("player.back10"), "", () => nudge(-10));
  const fwd = iconBtn("forward15", t("player.fwd15"), "", () => nudge(15));
  const rateChip = el("button", { class: "dock__rate", type: "button", "aria-label": t("player.rate"), onclick: cycleRate }, rate() + "×");
  const status = el("span", { class: "visually-hidden", "aria-live": "polite" });

  const row = el("div", { class: "dock__row" }, play, el("div", { class: "dock__meta" }, label, bar), time, expand);
  const panel = el("div", { class: "dock__panel" },
    el("div", { class: "dock__seekrow" }, curT, seek, totT),
    el("div", { class: "dock__controls" }, back, playBig, fwd, rateChip));
  dock = el("div", { class: "dock" }, row, panel, status);
  region.replaceChildren(dock);
  refs = { play, playBig, label, fill: bar.firstChild, time, expand, seek, cur: curT, total: totT, rate: rateChip, status };
  relabel();
}
function relabel() {
  if (!refs.play) return;
  refs.expand.setAttribute("aria-label", expanded ? t("player.collapse") : t("player.expand"));
  refs.rate.setAttribute("aria-label", t("player.rate"));
  syncPlayBtns();
}
function paintTrack() {
  if (!refs.label) return;
  refs.label.textContent = cur ? cur.title : "";
  const dur = (audio.duration && Number.isFinite(audio.duration)) ? audio.duration : (cur?.durationSec || 0);
  if (refs.total) refs.total.textContent = fmtTime(dur);
  refs.seek.max = Math.max(1, Math.floor(dur));
  paintProgress();
  syncPlayBtns();
}
function paintProgress() {
  const dur = audio.duration || cur?.durationSec || 0;
  const cT = audio.currentTime || 0;
  if (!scrubbing && refs.seek) { refs.seek.value = Math.floor(cT); refs.seek.setAttribute("aria-valuetext", fmtTime(cT)); }
  if (refs.cur) refs.cur.textContent = fmtTime(cT);
  if (refs.time) refs.time.textContent = `${fmtTime(cT)} / ${fmtTime(dur)}`;
  if (refs.fill) refs.fill.style.width = dur ? (100 * cT / dur) + "%" : "0%";
}
function syncPlayBtns() {
  const playing = audio && !audio.paused;
  for (const b of [refs.play, refs.playBig]) {
    if (!b) continue;
    b.innerHTML = icon(playing ? "pause" : "play");
    const lab = playing ? t("player.pause") : t("player.play");
    b.setAttribute("aria-label", lab); b.title = lab; b.setAttribute("aria-pressed", String(!!playing));
  }
}
function togglePlay() { if (!cur) return; audio.paused ? audio.play().catch(() => {}) : audio.pause(); }
function toggleExpand() { expanded = !expanded; dock.classList.toggle("is-expanded", expanded); refs.expand.innerHTML = icon(expanded ? "collapse" : "expand"); relabel(); }
function nudge(sec) { if (!cur) return; const d = audio.duration || cur.durationSec || 0; try { audio.currentTime = Math.max(0, Math.min(d || audio.currentTime + sec, audio.currentTime + sec)); } catch {} }
function cycleRate() {
  const next = RATES[(RATES.indexOf(rate()) + 1) % RATES.length];
  audio.playbackRate = next; refs.rate.textContent = next + "×"; saveSetting("rate", next);
}
