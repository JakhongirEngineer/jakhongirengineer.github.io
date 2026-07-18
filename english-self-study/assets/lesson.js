// lesson.js — the WEEKLY lesson page (04 §4.3): eleven sections in fixed order 0→10 (02 §2),
// each gated on data PRESENCE (never dead UI). Heavy folded-in sections load lazily (03 §4):
// EnglishPod ⑥ + 6ME ⑦ in lesson-episodes.js, the Speak-It recorder ⑨ in lesson-speak.js.

import { el, icon, t, tf, fmtTime, fmtMB, DATA_BASE } from "./core.js";
import { playTrack } from "./player.js";
import { snapshot, openLesson, bumpMsAnswer, completeLesson } from "./progress.js";
import { mediaUrl } from "../config.js";

const cache = {};                 // fetched lesson JSON, keyed by id (avoids refetch on UZ|EN)
let currentLessonId = null;
let observer = null;              // scroll-spy IntersectionObserver
const seenVocab = new Set();      // in-memory "seen" flags for the current lesson (S5 persists steps)
const grammarTouched = new Set(); // slots ("A"/"B") whose drills were attempted this session
let epTouched = false;            // any EnglishPod affordance used (dialogue shown / role hidden)
let sixTouched = false;           // 6ME quiz answer revealed
let recordSaved = false;          // a Speak-It recording is saved for this lesson (S4)
let funWatched = false;           // Fun English honor "watched" toggle (INTERIM until S8 builds the facade)
const live = {};                  // per-render refreshers (dots / checklist), called by refreshLive()

// ---- Web Speech TTS for vocab / POV read-aloud (0 KB, graceful fallback) -----
const ttsOk = () => typeof window !== "undefined" && "speechSynthesis" in window;
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.95;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}

// ---- Downloads (03 §2.3): baseline <a download>, upgraded to fetch→blob+progress -
function findDl(l, path) { return (l.downloads || []).find((d) => d.path === path); }
function downloadBtn(dl, variant) {
  if (!dl) return null;
  const url = mediaUrl(dl.path);
  const name = dl.path.split("/").pop();
  const size = fmtMB(dl.bytes);
  const state = el("span", { class: "dlbtn__state" });
  const a = el("a", { class: "dlbtn " + (variant || ""), href: url, download: name, rel: "noopener" },
    el("span", { class: "dlbtn__ic", html: icon("download") }),
    el("span", { class: "dlbtn__lab" }, dl.labelUz, size ? el("span", { class: "dlbtn__size" }, ` · ${dl.kind.toUpperCase()} · ${size}`) : null),
    state);
  a.addEventListener("click", (e) => onDownload(e, a, url, name, state));
  return a;
}
async function onDownload(e, a, url, name, state) {
  e.preventDefault();
  if (a.dataset.busy) return;
  a.dataset.busy = "1"; a.classList.add("is-busy"); state.textContent = "0%";
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error("HTTP " + res.status);
    const total = +res.headers.get("content-length") || 0;
    const reader = res.body.getReader();
    const chunks = []; let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value); got += value.length;
      state.textContent = total ? Math.round((100 * got) / total) + "%" : t("dl.downloading");
    }
    const obj = URL.createObjectURL(new Blob(chunks));
    const tmp = el("a", { href: obj, download: name }); document.body.appendChild(tmp); tmp.click(); tmp.remove();
    setTimeout(() => URL.revokeObjectURL(obj), 15000);
    state.textContent = t("dl.saved"); a.classList.add("is-done");
  } catch {
    state.textContent = ""; window.open(url, "_blank", "noopener");   // fallback: plain download
  } finally {
    a.classList.remove("is-busy"); delete a.dataset.busy;
  }
}

// ---- Inline section-player trigger (04 §4.3.3) -------------------------------
// key = the lesson JSON audio.* key; only one plays at a time (player enforces).
function trackTrigger(id, key, aObj, labelKey, dots) {
  const glyph = el("span", { class: "trg__glyph", html: icon("play") });
  const eq = el("span", { class: "trg__eq", "aria-hidden": "true" }, el("i"), el("i"), el("i"));
  const btn = el("button", { class: "trg", type: "button", "data-track": key, "data-lesson": id, "aria-pressed": "false" },
    glyph, eq,
    el("span", { class: "trg__body" },
      el("span", { class: "trg__label" }, t(labelKey)),
      el("span", { class: "trg__dur" }, fmtTime(aObj.durationSec))));
  if (dots) btn.append(el("span", { class: "dots", "data-dots": dots.key, "data-dots-max": dots.max, role: "img" }));
  btn.addEventListener("click", () => playTrack({ key, path: aObj.path, title: t(labelKey), lessonId: id, durationSec: aObj.durationSec }));
  return btn;
}

// ---- Transcript read-along (collapsed; tap-paragraph highlight; ⟲10s replay) --
function transcriptBlock(paras, replayNote) {
  const body = el("div", { class: "tr__body", lang: "en", hidden: "" });
  paras.forEach((p) => {
    const para = el("p", { class: "tr__p", tabindex: "0" }, p);
    const mark = () => { body.querySelectorAll(".tr__p.is-here").forEach((n) => n.classList.remove("is-here")); para.classList.add("is-here"); };
    para.addEventListener("click", mark);
    para.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mark(); } });
    body.append(para);
  });
  const toggle = el("button", { class: "tr__toggle", type: "button", "aria-expanded": "false" },
    el("span", { class: "tr__ic", html: icon("doc") }), el("span", null, t("lesson.transcript.show")));
  toggle.addEventListener("click", () => {
    const open = body.hidden;
    body.hidden = !open; toggle.setAttribute("aria-expanded", String(open));
    toggle.lastChild.textContent = open ? t("lesson.transcript.hide") : t("lesson.transcript.show");
  });
  return el("div", { class: "tr" }, toggle,
    replayNote ? el("p", { class: "tr__note" }, el("span", { "aria-hidden": "true" }, "⟲ "), t("lesson.transcript.replay")) : null,
    body);
}

// ---- Vocab flip-cards (04 §5.4) ---------------------------------------------
function vocabCards(id, vocab, vocabAudio) {
  const seenLabel = el("span", { class: "vocab__seen" });
  const setSeen = () => { seenLabel.textContent = tf("lesson.vocab.seen", seenVocab.size, vocab.length); };
  const grid = el("div", { class: "vocab__grid" });
  vocab.forEach((v, idx) => {
    const front = el("div", { class: "vcard__face vcard__front", lang: "en" }, el("span", { class: "vcard__chunk" }, v.en));
    const back = el("div", { class: "vcard__face vcard__back" },
      el("span", { class: "vcard__gloss", lang: "uz" }, v.uz),
      v.example ? el("span", { class: "vcard__ex", lang: "en" }, v.example) : null);
    const card = el("div", { class: "vcard", role: "button", tabindex: "0", "aria-expanded": "false", "aria-label": v.en },
      el("div", { class: "vcard__inner" }, front, back));
    const flip = () => { const f = !card.classList.contains("is-flipped"); card.classList.toggle("is-flipped", f); card.setAttribute("aria-expanded", String(f)); };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    // 🔊 TTS (front) — fallback to the VOCAB section audio when speechSynthesis is missing
    const sound = el("button", { class: "vcard__sound iconbtn", type: "button", "aria-label": tf("lesson.vocab.say", v.en), html: icon("sound") });
    sound.addEventListener("click", (e) => { e.stopPropagation(); if (!(ttsOk() && speak(v.en)) && vocabAudio) playTrack({ key: "vocab", path: vocabAudio.path, title: t("lesson.audio.vocab"), lessonId: id, durationSec: vocabAudio.durationSec }); });
    front.append(sound);
    // "seen / bilaman" toggle (corner dot) → feeds the vocab-reviewed step (04 §5.4)
    const dot = el("button", { class: "vcard__dot", type: "button", "aria-pressed": "false", "aria-label": t("lesson.vocab.know") });
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = !seenVocab.has(idx);
      on ? seenVocab.add(idx) : seenVocab.delete(idx);
      dot.setAttribute("aria-pressed", String(on)); card.classList.toggle("is-seen", on);
      setSeen(); refreshLive();
    });
    card.append(dot);
    grid.append(card);
  });
  setSeen();
  return el("div", { class: "vocab" }, grid, el("div", { class: "vocab__foot" }, seenLabel));
}

// ---- Grammar Spark drills (04 §4.3.6) — slot ("A"/"B") flags the topic touched -
function grammarExercise(x, n, slot) {
  const wrap = el("div", { class: "gx" });
  const head = el("p", { class: "gx__n" }, tf("lesson.grammar.exN", n));
  const feedback = el("p", { class: "gx__fb", "aria-live": "polite" });
  const touched = () => { if (!grammarTouched.has(slot)) { grammarTouched.add(slot); refreshLive(); } };

  if (x.type === "say-true") {                                   // spoken honor-check
    wrap.append(head, el("p", { class: "gx__prompt", lang: "uz" }, el("span", { "aria-hidden": "true" }, "🗣️ "), x.promptUz || t("lesson.grammar.sayTrue")));
    const say = el("button", { class: "btn btn--soft", type: "button" }, "✓ ", t("lesson.grammar.iSaid"));
    say.addEventListener("click", () => { say.classList.add("is-done"); say.disabled = true; feedback.textContent = t("lesson.grammar.nice"); touched(); });
    wrap.append(say, x.hintUz ? el("p", { class: "gx__hint", lang: "uz" }, x.hintUz) : null, feedback);
    return wrap;
  }

  wrap.append(head, el("p", { class: "gx__prompt", lang: "en" }, x.prompt || ""));
  const opts = Array.isArray(x.options) && x.options.length ? x.options : null;
  if (opts) {                                                    // tap-to-answer MCQ
    const row = el("div", { class: "gx__opts" });
    opts.forEach((opt) => {
      const b = el("button", { class: "gx__opt", type: "button", lang: "en" }, opt);
      b.addEventListener("click", () => {
        touched();
        const right = String(opt).toLowerCase() === String(x.answer).toLowerCase();
        if (right) {
          row.querySelectorAll(".gx__opt").forEach((o) => { o.disabled = true; o.classList.remove("is-wrong"); });
          b.classList.add("is-right"); b.append(" ", el("span", { "aria-hidden": "true" }, "✓"));
          feedback.textContent = t("lesson.grammar.correct"); feedback.className = "gx__fb is-right";
        } else {
          b.classList.add("is-wrong"); b.disabled = true;
          feedback.textContent = (x.hintUz ? x.hintUz : t("lesson.grammar.tryAgain")); feedback.className = "gx__fb is-wrong";
        }
      });
      row.append(b);
    });
    wrap.append(row, feedback);
  } else {                                                       // gap-fill reveal + honor self-check
    const ansEl = el("p", { class: "gx__answer", lang: "en", hidden: "" }, el("strong", null, x.answer || ""));
    const reveal = el("button", { class: "btn btn--soft", type: "button" }, t("lesson.grammar.check"));
    const checkRow = el("div", { class: "gx__self", hidden: "" });
    const ok = el("button", { class: "gx__ok", type: "button", "aria-label": t("drill.right") }, "✓");
    const no = el("button", { class: "gx__no", type: "button", "aria-label": t("drill.wrong") }, "✗");
    ok.addEventListener("click", () => { feedback.textContent = t("lesson.grammar.correct"); feedback.className = "gx__fb is-right"; });
    no.addEventListener("click", () => { feedback.textContent = x.hintUz || t("lesson.grammar.tryAgain"); feedback.className = "gx__fb is-wrong"; });
    checkRow.append(el("span", { class: "gx__self-lab", lang: "uz" }, t("drill.selfcheck")), ok, no);
    reveal.addEventListener("click", () => { touched(); ansEl.hidden = false; reveal.hidden = true; checkRow.hidden = false; });
    wrap.append(reveal, ansEl, checkRow, x.hintUz ? el("p", { class: "gx__hint", lang: "uz" }, x.hintUz) : null, feedback);
  }
  return wrap;
}

// One grammar topic card (03 §6.2 v2 grammar[] element) — §5.11.
function grammarTopicCard(id, l, g, i) {
  const slot = g.slot || (i === 0 ? "A" : "B");
  const body = el("div", { class: "gcard__body" });
  // 🏷️ band-lifter / CEFR can-do tags (02 §2/§4)
  const tags = el("div", { class: "gtags" });
  if (g.bandLifter) tags.append(el("span", { class: "gtag gtag--band" }, el("span", { "aria-hidden": "true" }, "🏷️ "), g.bandLifter));
  if (g.cefrCanDo) tags.append(el("span", { class: "gtag gtag--cefr" }, g.cefrCanDo));
  if (tags.children.length) body.append(tags);
  body.append(el("div", { class: "prose", lang: "uz", html: g.bodyHtml })); // precompiled + sanitized (validate.mjs)
  if (g.contrastUz) body.append(el("div", { class: "callout callout--contrast", lang: "uz" },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "🔀"),
    el("div", null, el("strong", null, t("lesson.grammar.contrast")), el("p", null, g.contrastUz))));
  if (g.errorFixUz) body.append(el("div", { class: "callout callout--error", lang: "uz" },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "⚠️"),
    el("div", null, el("strong", null, t("lesson.grammar.errorFix")), el("p", null, g.errorFixUz))));
  if (Array.isArray(g.exercises) && g.exercises.length) {
    body.append(el("h4", { class: "gpanel__sub" }, t("lesson.grammar.drills")));
    g.exercises.forEach((x, k) => body.append(grammarExercise(x, k + 1, slot)));
  }
  // Optional Murphy-unit PDF download (reference only, 02 §4)
  const dl = g.reference && findDl(l, g.reference.downloadPath);
  if (dl) body.append(el("div", { class: "gpanel__ref" },
    el("p", { class: "gpanel__ref-lab" }, `📄 ${g.reference.book}${g.reference.unit ? " · Unit " + g.reference.unit : ""}`), downloadBtn(dl, "dlbtn--wide")));

  // Accordion header (A open by default; both single-column on mobile, 04 §5.11).
  const open = i === 0;
  const chev = el("span", { class: "gcard__chev", html: icon(open ? "collapse" : "expand") });
  const head = el("button", { class: "gcard__head", type: "button", "aria-expanded": String(open) },
    el("span", { class: "gcard__slot" }, slot),
    el("span", { class: "gcard__titles" },
      el("span", { class: "gcard__title", lang: "uz" }, g.titleUz),
      el("span", { class: "gcard__days" }, t(slot === "A" ? "lesson.grammar.slotDaysA" : "lesson.grammar.slotDaysB"))),
    chev);
  if (!open) body.hidden = true;
  head.addEventListener("click", () => {
    const show = body.hidden;
    body.hidden = !show; head.setAttribute("aria-expanded", String(show));
    chev.innerHTML = icon(show ? "collapse" : "expand");
  });
  return el("div", { class: "gcard" }, head, body);
}

function grammarPanels(id, l) {
  const panel = el("div", { class: "gpanel" });
  (Array.isArray(l.grammar) ? l.grammar : []).forEach((g, i) => panel.append(grammarTopicCard(id, l, g, i)));
  return panel;
}

// ---- Mini-story drill (04 §5.6) — hear Q → answer NOW → reveal → self-check ---
function ministoryDrill(id, pairs) {
  const total = pairs.length;
  let i = 0;
  const counter = el("p", { class: "drill__count" });
  const qText = el("p", { class: "drill__q", lang: "en", "aria-live": "polite" });
  const beat = el("div", { class: "drill__beat" },
    el("span", { class: "drill__beat-lab", lang: "uz" }, el("span", { "aria-hidden": "true" }, "⏱️ "), t("drill.beat")),
    el("span", { class: "drill__beat-bar", "aria-hidden": "true" }));
  const reveal = el("button", { class: "btn btn--primary drill__reveal", type: "button" }, t("drill.reveal"));
  const answer = el("p", { class: "drill__a", lang: "en", "aria-live": "polite", hidden: "" });
  const ok = el("button", { class: "drill__ok", type: "button", "aria-label": t("drill.right") }, "✓");
  const no = el("button", { class: "drill__no", type: "button", "aria-label": t("drill.wrong") }, "✗");
  const check = el("div", { class: "drill__check", hidden: "" },
    el("span", { class: "drill__check-lab", lang: "uz" }, t("drill.selfcheck")), ok, no);
  const live_ = el("div", { class: "drill__live" }, qText, beat, reveal, answer, check);
  const end = el("div", { class: "drill__end", hidden: "" });
  const card = el("div", { class: "drill__card" }, live_, end);

  const repsN = el("strong", { "data-ms-counter": "" }, String(snapshot(id).msAnswersAloud));
  const reps = el("p", { class: "drill__reps" }, el("span", { "aria-hidden": "true" }, "🗣️ "),
    el("span", { lang: "uz" }, t("drill.repsPre") + " "), repsN, el("span", { lang: "uz" }, " " + t("drill.repsPost")));
  const restart = el("button", { class: "btn btn--soft", type: "button" }, t("drill.restart"));

  function show(move) {
    if (i >= total) { live_.hidden = true; end.hidden = false; if (move) restart.focus(); return; }
    counter.textContent = tf("drill.count", i + 1, total);
    qText.textContent = pairs[i].q;                 // aria-live announces the new question to SR
    answer.textContent = pairs[i].a; answer.hidden = true;
    check.hidden = true; reveal.hidden = false; beat.hidden = false;
    beat.classList.remove("is-run"); void beat.offsetWidth; beat.classList.add("is-run"); // restart the 2.5s beat
    if (move) reveal.focus();                        // next Q: land on the reveal control
  }
  reveal.addEventListener("click", () => { answer.hidden = false; reveal.hidden = true; beat.hidden = true; check.hidden = false; ok.focus(); });
  ok.addEventListener("click", () => { repsN.textContent = String(bumpMsAnswer(id)); refreshLive(); i++; show(true); });
  no.addEventListener("click", () => { i++; show(true); });
  restart.addEventListener("click", () => { i = 0; end.hidden = true; live_.hidden = false; show(true); });
  end.append(el("p", { class: "drill__done", lang: "uz" }, "✅ ", t("drill.done")), restart);
  show();
  return el("div", { class: "drill" }, counter, card, reps);
}

// ---- Section shell ----------------------------------------------------------
function section(num, titleKey, opts = {}) {
  const sec = el("section", { class: "lsec" + (opts.elevated ? " lsec--heart" : ""), id: "sec-" + num, "aria-labelledby": "h-" + num });
  sec.append(el("h2", { class: "lsec__h", id: "h-" + num },
    el("span", { class: "lsec__num", "aria-hidden": "true" }, String(num)),
    el("span", null, t(titleKey))));
  return sec;
}

// ---- Sticky section strip + day-focus chip + scroll-spy (04 §4.3.2) ----------
function dayOfCycle(id) {
  const L = snapshot(id);
  if (!L.startedAt) return 1;
  const t0 = Number(L.startedAt);                 // guard a hand-edited/imported non-numeric startedAt (S6)
  if (!Number.isFinite(t0)) return 1;             // → avoid day=NaN leaking "lesson.day.NaN" to the DOM
  const days = Math.floor((Date.now() - t0) / 86400000);
  return (days % 7) + 1;
}
function sectionStrip(id, presentNums) {
  const glyphs = el("div", { class: "strip__glyphs" });
  presentNums.forEach((n) => {
    const b = el("button", { class: "strip__g" + (n === 4 ? " strip__g--heart" : ""), type: "button", "data-goto": "sec-" + n, "data-sec": String(n), "aria-label": tf("lesson.strip.go", n) },
      el("span", { "aria-hidden": "true" }, String(n)));
    glyphs.append(b);
  });
  const day = dayOfCycle(id);
  const star = (day === 4 || day === 6) ? " ⭐" : "";
  const chip = el("span", { class: "strip__day chip" }, el("span", { class: "chip__k", lang: "uz" }, t("lesson.today") + ": "), t("lesson.day." + day) + star);
  const strip = el("nav", { class: "strip", "aria-label": t("nav.section") }, glyphs, chip);
  glyphs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]"); if (!b) return;
    const target = document.getElementById(b.dataset.goto);
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - (56 + strip.offsetHeight + 8);
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });
  return strip;
}

// ---- Live refreshers (repeat dots, strip done-state, checklist) --------------
function dots(n, max) {
  const out = [];
  for (let k = 0; k < max; k++) out.push(el("i", { class: "dot" + (k < n ? " dot--on" : "") }));
  return out;
}
function computeDone(L, present) {
  const d = { 0: true, 3: (L.listens.main || 0) >= 1, 4: (L.msAnswersAloud || 0) >= 1 };
  if (present.has(1)) d[1] = grammarTouched.has("A") && grammarTouched.has("B");
  if (present.has(2)) d[2] = seenVocab.size > 0;
  if (present.has(5)) d[5] = (L.listens.pov || 0) >= 1;
  if (present.has(6)) d[6] = epTouched || (L.listens.ep || 0) >= 1;
  if (present.has(7)) d[7] = sixTouched || (L.listens.sixmin || 0) >= 1;
  if (present.has(8)) d[8] = funWatched;
  if (present.has(9)) d[9] = recordSaved;
  return d;
}
function refreshLive() {
  if (!currentLessonId) return;
  const L = snapshot(currentLessonId);
  document.querySelectorAll("#main [data-dots]").forEach((elm) => {
    const key = elm.dataset.dots, max = +elm.dataset.dotsMax;
    const n = L.listens[key] || 0;                 // key is a listens.* field (main|ms|pov|ep|sixmin)
    elm.replaceChildren(...dots(Math.min(n, max), max));
    elm.setAttribute("aria-label", tf("lesson.listened", Math.min(n, max), max));
  });
  document.querySelectorAll("#main [data-ms-counter]").forEach((s) => { s.textContent = String(L.msAnswersAloud || 0); });
  if (live.present) {
    const done = computeDone(L, live.present);
    document.querySelectorAll("#main [data-sec]").forEach((g) => { g.classList.toggle("is-done", !!done[g.dataset.sec]); });
  }
  if (live.refreshCheck) live.refreshCheck(L);
}
// ctx callbacks for the lazy sections: EP/6ME/record actions light the strip + checklist.
function markEp()  { if (!epTouched)  { epTouched  = true; refreshLive(); } }
function markSix() { if (!sixTouched) { sixTouched = true; refreshLive(); } }
function markRecord(saved) { recordSaved = !!saved; refreshLive(); }  // Speak-It save/delete (S4)

// ---- Section 10: Lesson Check — star award + mandatory speaking gate (04 §5.7, 02 §8.1) --
// 1★ = grammarA+B + vocab + MAIN×3 + ministory×2 (GATE) + POV×2 (if present); 2★ = 1★ + ep
// (auto-true when the section is absent, L15/L22) + fun-watched + one recording; 3★ = 2★ + sixmin.
// The L1↔L30 "second recording" comparison is an S6 Progress surface, not a per-lesson 3★ gate;
// the Fun "watched" toggle is an interim honor affordance until S8 builds the facade.
function lessonCheck(id, l, present) {
  const body = el("div", { class: "check__body" });
  let justEarned = false;                     // one-shot: celebrate on the earning render only

  const epDone  = (L) => present.has(6) ? (epTouched || (L.listens.ep || 0) >= 1) : true; // ep auto-satisfies when absent
  const sixDone = (L) => sixTouched || (L.listens.sixmin || 0) >= 1;
  const gateMet = (L) => (L.msAnswersAloud || 0) >= 2;
  const oneStar = (L) =>
    grammarTouched.has("A") && grammarTouched.has("B") && seenVocab.size > 0 &&
    (L.listens.main || 0) >= 3 && gateMet(L) && (!present.has(5) || (L.listens.pov || 0) >= 2);
  function starTier(L) {
    if (!oneStar(L)) return 0;
    if (!(epDone(L) && funWatched && recordSaved)) return 1;   // 2★ needs ep + fun + one recording
    return sixDone(L) ? 3 : 2;                                  // 3★ adds 6ME
  }
  // The 10-boolean steps snapshot completeLesson persists (03 §6.3) so a reload shows what was done.
  function stepsSnapshot(L) {
    return {
      grammarA: grammarTouched.has("A"), grammarB: grammarTouched.has("B"),
      vocab: seenVocab.size > 0, main: (L.listens.main || 0) >= 3,
      ministory: gateMet(L),
      pov: present.has(5) ? (L.listens.pov || 0) >= 2 : false,
      ep: epDone(L), sixmin: sixDone(L), fun: funWatched, record: recordSaved,
    };
  }
  function rowsFor(L) {
    const rows = [
      ["grammarA", t("check.grammarA"), grammarTouched.has("A")],
      ["grammarB", t("check.grammarB"), grammarTouched.has("B")],
      ["vocab", t("check.vocab"), seenVocab.size > 0],
      ["main", tf("check.main", L.listens.main || 0), (L.listens.main || 0) >= 3],
      ["ministory", tf("check.ministory", L.msAnswersAloud || 0), gateMet(L), true], // GATE
    ];
    if (present.has(5)) rows.push(["pov", tf("check.pov", L.listens.pov || 0), (L.listens.pov || 0) >= 2]);
    if (present.has(6)) rows.push(["ep", t("check.ep"), epTouched || (L.listens.ep || 0) >= 1]);
    rows.push(["sixmin", t("check.sixmin"), sixDone(L)]);
    rows.push(["fun", t("check.fun"), funWatched], ["record", t("check.record"), recordSaved]);
    return rows;
  }

  function earn() {
    const fresh = snapshot(id);
    const tier = starTier(fresh);
    if (tier < 1) return;                                       // gate/tier safety
    completeLesson(id, { stars: tier, present: stepsSnapshot(fresh) });
    justEarned = true;
    refreshLive();                                             // re-renders the check (celebration) + strip done-state
    justEarned = false;                                        // consumed — later refreshes don't re-celebrate
  }

  function render(L) {
    const tier = starTier(L);                                  // live derived tier (this session)
    const earned = L.stars || 0;                               // persisted floor (seeded from snapshot → survives reload)
    const shown = Math.max(earned, tier);                      // cluster previews the tier, never below the earned floor

    // Derived checklist (live) — the GATE row keeps its required styling.
    const list = el("ul", { class: "check__list" });
    rowsFor(L).forEach(([, label, done, gate]) => {
      list.append(el("li", { class: "check__row" + (done ? " is-done" : "") + (gate ? " check__row--gate" : "") },
        el("span", { class: "check__box", "aria-hidden": "true", html: done ? icon("check") : "" }),
        el("span", { class: "check__lab" }, label),
        gate ? el("span", { class: "check__gate" }, t("check.gateTag")) : null));
    });
    const stars = el("p", { class: "check__stars" + (justEarned ? " check__stars--pop" : ""), role: "img",
      "aria-label": tf("map.starAria", shown) },
      shown >= 1 ? "⭐" : "☆", shown >= 2 ? "⭐" : "☆", shown >= 3 ? "⭐" : "☆");
    const nodes = [list, stars];

    if (earned >= 1) {
      // COMPLETED state — earned tier + next-review date; re-enable ONLY to earn a HIGHER tier.
      nodes.push(el("p", { class: "check__done", lang: "uz" },
        el("span", { class: "check__done-ic", "aria-hidden": "true", html: icon("check") }), tf("check.earned", earned)));
      if (L.reviewDue) nodes.push(el("p", { class: "check__next", lang: "uz" }, tf("check.nextReview", L.reviewDue)));
      if (justEarned) nodes.push(el("p", { class: "check__praise", lang: "uz", "aria-live": "polite" }, t("check.praise")));
      if (tier > earned) {
        const up = el("button", { class: "btn btn--primary check__earn", type: "button" },
          el("span", { "aria-hidden": "true" }, "⭐ "), tf("check.earnN", tier));
        up.addEventListener("click", earn);
        nodes.push(up);
      }
    } else {
      // NOT YET EARNED — gate first (t("check.gateReason")); gate met but tier<1 → t("check.needMore").
      const enabled = tier >= 1;
      const earnLabel = tier === 1 ? t("check.earn") : tf("check.earnN", tier); // singular for 1★, plural for 2/3
      const btn = el("button", { class: "btn btn--primary check__earn", type: "button" },
        el("span", { "aria-hidden": "true" }, "⭐ "), enabled ? earnLabel : t("check.earn"));
      if (enabled) btn.addEventListener("click", earn); else btn.disabled = true;
      // Name the FIRST unmet 1★ requirement (priority grammarA→grammarB→vocab→MAIN×3→POV×2),
      // never a step already done. Gate-not-met stays the gate reason; generic key is the fallback.
      let reasonKey = null;
      if (!gateMet(L)) reasonKey = "check.gateReason";
      else if (tier < 1) {
        reasonKey =
          (!grammarTouched.has("A") || !grammarTouched.has("B")) ? "check.need.grammar" :
          !(seenVocab.size > 0) ? "check.need.vocab" :
          !((L.listens.main || 0) >= 3) ? "check.need.main" :
          (present.has(5) && (L.listens.pov || 0) < 2) ? "check.need.pov" :
          "check.needMore";
      }
      nodes.push(btn);
      if (reasonKey) {
        const reason = el("p", { class: "check__reason", lang: "uz", id: "check-reason-" + id }, t(reasonKey));
        btn.setAttribute("aria-describedby", reason.id);
        nodes.push(reason);
      }
    }
    body.replaceChildren(...nodes);
  }
  live.refreshCheck = render;
  render(snapshot(id));
  return body;
}

// ---- Fun English (⑧) + Speak It (⑨): honest S3 placeholders (S8 / S4) --------
function placeholder(bodyKey, tagKey, extra) {
  return el("div", { class: "phold" },
    el("p", { class: "phold__body", lang: "uz" }, t(bodyKey)),
    extra || null,
    el("p", { class: "phold__tag" }, t(tagKey)));
}

// ---- Skeleton / not-found ----------------------------------------------------
function skeleton() {
  const s = el("div", { class: "lesson-skel", "aria-hidden": "true" });
  for (let i = 0; i < 4; i++) s.append(el("div", { class: "skel-card" }));
  return s;
}
function notFound(main) {
  main.replaceChildren(el("section", { class: "screen" },
    el("h1", { class: "screen__title" }, t("lesson.notfound.title")),
    el("p", { class: "placeholder" }, t("lesson.notfound.body")),
    el("a", { class: "btn btn--primary", href: "#/lessons", style: "margin-top:16px;display:inline-flex" }, t("lesson.notfound.back"))));
}

// ---- Public entry: render #/lesson/:id --------------------------------------
export async function renderLesson(main, id, token, alive) {
  // Teardown any previous lesson's scroll-spy so observers don't stack.
  if (observer) { observer.disconnect(); observer = null; }
  if (id !== currentLessonId) { seenVocab.clear(); grammarTouched.clear(); epTouched = false; sixTouched = false; funWatched = false; }
  live.refreshCheck = null; live.present = null;

  main.replaceChildren(skeleton());

  let l = cache[id];
  if (!l) {
    try {
      const res = await fetch(new URL(`lessons/${id}.json`, DATA_BASE));
      if (!res.ok) throw new Error("HTTP " + res.status);
      l = await res.json();
      cache[id] = l;
    } catch (err) {
      if (alive && !alive()) return;
      console.warn("lesson: could not load", id, err);
      notFound(main);
      return;
    }
  }
  // Load the lazy folded-in sections (EnglishPod ⑥ + 6ME ⑦ + Speak-It ⑨) in PARALLEL
  // (03 §4); a failure degrades — that section is skipped/falls back, page never breaks.
  const [episodes, speak] = await Promise.all([
    import("./lesson-episodes.js").catch((err) => (console.warn("lesson-episodes: failed to load", err), null)),
    import("./lesson-speak.js").catch((err) => (console.warn("lesson-speak: failed to load", err), null)),
  ]);

  if (alive && !alive()) return;   // navigated away while fetching — abandon
  currentLessonId = id;
  openLesson(id);                  // lastLessonId + started (lightweight, not the S5 engine)
  recordSaved = snapshot(id).steps.record === true;  // persisted flag; lesson-speak reconciles w/ IndexedDB

  const A = l.audio || {};
  const T = l.transcripts || {};
  const povMode = A.pov ? "audio" : (T.pov ? "text" : null);
  const hasEp = episodes && l.englishpod != null;
  const hasSix = episodes && l.sixmin != null;
  const present = new Set([0]);
  if (Array.isArray(l.grammar) && l.grammar.length && l.grammar.every((g) => g.bodyHtml)) present.add(1);
  if (Array.isArray(l.vocab) && l.vocab.length) present.add(2);
  if (A.main) present.add(3);
  if (l.ministory && Array.isArray(l.ministory.pairs) && l.ministory.pairs.length) present.add(4);
  if (povMode) present.add(5);
  if (hasEp) present.add(6);
  if (hasSix) present.add(7);
  if (Array.isArray(l.funEnglish) && l.funEnglish.length) present.add(8);
  present.add(9); present.add(10);
  live.present = present;

  const ctx = { trackTrigger, downloadBtn, transcriptBlock, findDl, markEp, markSix };

  const frag = document.createDocumentFragment();
  // One <h1> per screen (a11y §8); the visible title rides in the top bar.
  frag.append(el("h1", { class: "visually-hidden" }, `${t("route.lesson.title")} ${l.order} · ${l.title}`));
  frag.append(sectionStrip(id, [...present].sort((a, b) => a - b)));

  // ⓿ Lesson Home & Can-Do goal
  {
    const s = section(0, "lesson.sec.0");
    const audios = [A.main, A.vocab, A.ministory, A.pov,
      l.englishpod?.audio?.dg, l.englishpod?.audio?.pr, l.englishpod?.audio?.rv, l.sixmin?.audio?.main];
    const totalMin = Math.round(audios.filter(Boolean).reduce((m, a) => m + (a.durationSec || 0), 0) / 60);
    s.append(el("div", { class: "card" },
      el("p", { class: "l-intro", lang: "uz" }, l.intro?.uz || l.titleUz),
      l.intro?.en ? el("p", { class: "l-intro-en", lang: "en" }, l.intro.en) : null,
      el("div", { class: "l-cando" },
        el("p", { class: "l-cando__k" }, el("span", { "aria-hidden": "true" }, "🎯 "), t("lesson.canDo")),
        el("p", { class: "l-cando__uz", lang: "uz" }, l.canDo?.uz || ""),
        l.canDo?.en ? el("p", { class: "l-cando__en", lang: "en" }, l.canDo.en) : null),
      el("p", { class: "l-meta" },
        el("span", null, "⏱️ ~" + (totalMin || "?") + " " + t("lesson.min")),
        el("span", { class: "l-meta__peak", lang: "uz" }, "💪 " + t("lesson.peak")))));
    frag.append(s);
  }

  // ① Grammar Spark — TWO topics (A + B)
  if (present.has(1)) { const s = section(1, "lesson.sec.1"); s.append(el("div", { class: "card" }, grammarPanels(id, l))); frag.append(s); }

  // ② Vocabulary
  if (present.has(2)) {
    const s = section(2, "lesson.sec.2");
    const card = el("div", { class: "card" });
    if (A.vocab) { const row = el("div", { class: "trg-row" }, trackTrigger(id, "vocab", A.vocab, "lesson.audio.vocab")); const dl = findDl(l, A.vocab.path); if (dl) row.append(downloadBtn(dl)); card.append(row); }
    card.append(vocabCards(id, l.vocab, A.vocab));
    s.append(card); frag.append(s);
  }

  // ③ Deep Listening — MAIN
  if (present.has(3)) {
    const s = section(3, "lesson.sec.3");
    const card = el("div", { class: "card" });
    card.append(el("p", { class: "l-about" }, el("span", { class: "l-about__k", lang: "uz" }, t("lesson.about") + ": "), el("span", { lang: "uz" }, l.intro?.uz || "")));
    card.append(el("div", { class: "trg-row trg-row--big" }, trackTrigger(id, "main", A.main, "lesson.audio.main", { key: "main", max: 3 })));
    const dlMain = findDl(l, A.main.path);
    if (dlMain) { const nudge = downloadBtn(dlMain, "dlbtn--wide dlbtn--nudge"); nudge.querySelector(".dlbtn__lab").firstChild.textContent = t("lesson.downloadNudge"); card.append(nudge); }
    if (A.main.transcriptKey && T[A.main.transcriptKey]) card.append(transcriptBlock(T[A.main.transcriptKey], true));
    s.append(card); frag.append(s);
  }

  // ❹ Mini-Story Speaking Loop ★ (the engine — elevated)
  if (present.has(4)) {
    const s = section(4, "lesson.sec.4", { elevated: true });
    const card = el("div", { class: "card card--heart" });
    card.append(el("p", { class: "heart__lead", lang: "uz" }, t("lesson.ministoryLead")));
    if (A.ministory) card.append(el("div", { class: "trg-row" }, trackTrigger(id, "ministory", A.ministory, "lesson.audio.ministory", { key: "ms", max: 2 })));
    card.append(ministoryDrill(id, l.ministory.pairs));
    s.append(card); frag.append(s);
  }

  // ⑤ POV Grammar Story (L09–30; L19 text-only)
  if (present.has(5)) {
    const s = section(5, "lesson.sec.5");
    const card = el("div", { class: "card" });
    card.append(el("p", { class: "l-about", lang: "uz" }, el("span", { class: "l-about__k" }, t("lesson.pov.tense") + ": "), t("lesson.pov.tenseVal")));
    if (povMode === "audio") {
      const row = el("div", { class: "trg-row" }, trackTrigger(id, "pov", A.pov, "lesson.audio.pov", { key: "pov", max: 2 }));
      const dl = findDl(l, A.pov.path); if (dl) row.append(downloadBtn(dl));
      card.append(row);
      if (A.pov.transcriptKey && T[A.pov.transcriptKey]) card.append(transcriptBlock(T[A.pov.transcriptKey], true));
    } else {                                   // text-only (L19): TTS read-aloud, NO audio transport
      const para = (T.pov || []).join(" ");
      const readBtn = el("button", { class: "btn btn--soft", type: "button", html: icon("sound") });
      readBtn.append(" ", t("lesson.pov.read"));
      readBtn.addEventListener("click", () => { if (!speak(para)) readBtn.disabled = true; });
      if (ttsOk()) card.append(readBtn); else card.append(el("p", { class: "phold__tag" }, t("lesson.pov.noTts")));
      card.append(transcriptBlock(T.pov || [], false));
    }
    s.append(card); frag.append(s);
  }

  // ⑥ EnglishPod — Conversation (the speaking half; hidden when englishpod:null)
  if (present.has(6)) {
    const s = section(6, "lesson.sec.6");
    s.append(episodes.englishPodSection(id, l, ctx));
    frag.append(s);
  }

  // ⑦ 6 Minute English — Listening Stretch (all 30 lessons)
  if (present.has(7)) {
    const s = section(7, "lesson.sec.7");
    s.append(episodes.sixMinSection(id, l, ctx));
    frag.append(s);
  }

  // ⑧ Fun English — honest placeholder (S8 builds the facade) + an INTERIM "watched" honor toggle
  if (present.has(8)) {
    const s = section(8, "lesson.sec.8");
    const f = l.funEnglish[0];
    const teaser = f ? el("p", { class: "phold__teaser" }, el("span", { lang: "en" }, f.title), f.channel ? el("span", { class: "phold__chan", lang: "en" }, " · " + f.channel) : null) : null;
    const card = el("div", { class: "card" }, placeholder("lesson.fun.body", "lesson.fun.tag", teaser));
    // Honor toggle (marks the `fun` step → feeds 2★). Interim until S8's real facade auto-marks it.
    const watch = el("button", { class: "btn btn--soft phold__watch", type: "button", "aria-pressed": String(funWatched) },
      el("span", { "aria-hidden": "true" }, "✓ "), t("check.funWatch"));
    if (funWatched) { watch.classList.add("is-done"); watch.disabled = true; }
    watch.addEventListener("click", () => {
      funWatched = true;
      watch.classList.add("is-done"); watch.disabled = true; watch.setAttribute("aria-pressed", "true");
      refreshLive();
    });
    card.append(watch);
    s.append(card); frag.append(s);
  }

  // ⑨ Speak It Yourself — record → IndexedDB, nothing uploaded (S4); lazy, answer-aloud fallback.
  {
    const s = section(9, "lesson.sec.9");
    if (speak) s.append(speak.speakSection(id, l, { markRecord }));
    else s.append(el("div", { class: "card speak" },
      el("p", { class: "speak__task-en", lang: "en" }, l.speakingPrompt?.en || ""),
      el("p", { class: "speak__aloud", lang: "uz" }, "🗣️ " + t("speak.answerAloud"))));
    frag.append(s);
  }

  // ❿ Lesson Check — summary preview (S5 owns star award + gate enforcement)
  {
    const s = section(10, "lesson.sec.10");
    s.append(el("div", { class: "card" }, lessonCheck(id, l, present)));
    frag.append(s);
  }

  if (alive && !alive()) return;
  main.replaceChildren(frag);
  document.getElementById("ctx").textContent = `${t("route.lesson.title")} ${l.order}`;

  // Scroll-spy: highlight the section crossing the upper third (04 §4.3.2).
  observer = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) {
      const n = en.target.id.replace("sec-", "");
      document.querySelectorAll("#main [data-sec]").forEach((g) => g.classList.toggle("is-active", g.dataset.sec === n));
    }
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
  main.querySelectorAll(".lsec").forEach((sec) => observer.observe(sec));

  refreshLive();
}

// Reflect player state on the inline triggers + refresh counters (one listener).
document.addEventListener("yp:player", (e) => {
  const { key, lessonId, playing } = e.detail;
  document.querySelectorAll("#main [data-track]").forEach((btn) => {
    const on = btn.dataset.track === key && btn.dataset.lesson === lessonId && !!playing;
    btn.setAttribute("aria-pressed", String(on));
    btn.classList.toggle("is-playing", on);
    const g = btn.querySelector(".trg__glyph"); if (g) g.innerHTML = icon(on ? "pause" : "play");
  });
  if (e.detail.listen) refreshLive();
});
