// lesson-episodes.js — the two folded-in in-lesson sections (04 §4.3 ⑥/⑦, §4.4):
//   ⑥ EnglishPod — the SPEAKING half. 7 beats (04 §4.4): warm-up + prediction →
//      dg cold listen → transcript + Uzbek-glossed Key Vocabulary → pr explanation
//      (Sprint-skippable) → shadow line-by-line → role-play (hide a role, out loud)
//      → rv recap. steps.ep is satisfied by shadow + one role played (02 §8.1).
//   ⑦ 6 Minute English — the LISTENING/IELTS half. 7 beats (04 §4.4): pre-listen MCQ
//      (predict) → gist listen (transcript hidden) → reveal + self-check → 6-word
//      pack + Uzbek gloss → re-listen WITH transcript, flagging the INSERT vox-pops
//      → feeds Speak-It. steps.sixmin is satisfied by quiz answered + pack reviewed.
//
// Lazily imported by lesson.js ONLY on the lesson route (03 §4 — keeps every module
// within budget and Home/Map first paint free of it). Shared component builders
// (trackTrigger / downloadBtn / transcriptBlock / findDl) and the step callbacks
// (markEp / markSix) are INJECTED via `ctx`, so this module imports only leaf
// primitives from core.js — no import cycle with lesson.js.

import { el, icon, t, tf, loadSettings } from "./core.js";

// ── Web Speech TTS for optional per-line dialogue replay (04 §5.8) ───────────
// 0 KB, graceful: the per-line 🔊 button is only rendered when TTS is available,
// so there is never a dead control (04 §8/§9). Transcripts carry no timestamps
// (03 §6.2), so a spoken model line is the honest analogue of "per-line replay".
const ttsOk = () => typeof window !== "undefined" && "speechSynthesis" in window;
function speakLine(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}
// The pr explanation is "skippable on Sprint" (02 §3, 04 §4.4 ④) — surfaced as a
// hint chip only for Sprint learners; everyone else just sees the normal note.
const isSprint = () => { try { return loadSettings().pace === "sprint"; } catch { return false; } };

// ── ⑥ EnglishPod — Conversation (the speaking half) ──────────────────────────
export function englishPodSection(id, l, ctx) {
  const ep = l.englishpod;
  const A = ep.audio || {};
  const card = el("div", { class: "card ep" });

  // steps.ep = shadow + one role played (04 §4.4). Both are one-tap honor actions;
  // markEp is idempotent in lesson.js, so calling once both are done is enough. The
  // dg-listen counter (listens.ep) independently satisfies the step in the check.
  const eDone = { shadow: false, role: false };
  let epStatus = null;
  const maybeMarkEp = () => {
    if (!(eDone.shadow && eDone.role)) return;
    ctx.markEp();
    if (epStatus) { epStatus.textContent = "✓ " + t("lesson.ep.epDone"); epStatus.classList.add("is-done"); }
  };

  // ① Warm-up (bilingual, 2 lines + a prediction) — ties to the AJ theme (02 §3.1).
  card.append(el("div", { class: "ep-warmup" },
    el("p", { class: "l-about" },
      el("span", { class: "l-about__k", lang: "uz" }, t("lesson.ep.warmup") + ": "),
      el("span", { lang: "uz" }, ep.warmup?.uz || "")),
    ep.warmup?.en ? el("p", { class: "ep-warmup__en", lang: "en" }, ep.warmup.en) : null,
    el("p", { class: "ep-note", lang: "uz" }, "🔮 " + t("lesson.ep.predict"))));

  // ② Listen to dg cold (~1 min) — get the gist before reading anything.
  if (A.dg) {
    const row = el("div", { class: "trg-row" }, ctx.trackTrigger(id, "dg", A.dg, "lesson.audio.dg", { key: "ep", max: 1 }));
    const dl = ctx.findDl(l, A.dg.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.ep.listenCold")));
  }

  // Build the dialogue ONCE — the transcript (③), shadow (⑤) and role-play (⑥)
  // beats all operate on this same node.
  const list = dialogueList(ep.dialogue || []);
  list.hidden = true;
  const transToggle = el("button", { class: "tr__toggle", type: "button", "aria-expanded": "false" },
    el("span", { class: "tr__ic", html: icon("doc") }), el("span", null, t("lesson.ep.dialogue")));
  const showDialogue = (on) => { list.hidden = !on; transToggle.setAttribute("aria-expanded", String(on)); };
  transToggle.addEventListener("click", () => showDialogue(list.hidden));

  // ③ Transcript (read-along) + Key Vocabulary with our added Uzbek gloss (02 §3.3).
  card.append(el("div", { class: "ep-transcript" },
    el("p", { class: "ep-note", lang: "uz" }, "▤ " + t("lesson.ep.transcriptHint")),
    transToggle, list));
  if (Array.isArray(ep.keyVocab) && ep.keyVocab.length) {
    card.append(el("h4", { class: "gpanel__sub" }, "🔑 " + t("lesson.ep.keyVocab")));
    card.append(glossList(ep.keyVocab));
  }

  // ④ pr explanation (skippable on Sprint).
  if (A.pr) {
    const row = el("div", { class: "trg-row" }, ctx.trackTrigger(id, "pr", A.pr, "lesson.audio.pr"));
    const dl = ctx.findDl(l, A.pr.path); if (dl) row.append(ctx.downloadBtn(dl));
    if (isSprint()) row.append(el("span", { class: "ep-skip", lang: "uz" }, "⏩ " + t("lesson.ep.sprintSkip")));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.ep.explain")));
  }

  // ⑤ Shadow line-by-line (04 §5.8) — an honor check; reveals the transcript to shadow along.
  {
    const fb = el("p", { class: "ep-stepfb", lang: "uz", "aria-live": "polite" });
    const btn = el("button", { class: "btn btn--soft ep-shadow", type: "button" },
      el("span", { "aria-hidden": "true" }, "✓ "), t("lesson.ep.shadowDo"));
    btn.addEventListener("click", () => {
      if (eDone.shadow) return;
      eDone.shadow = true;
      btn.classList.add("is-done"); btn.disabled = true;
      showDialogue(true);
      fb.textContent = t("lesson.ep.shadowDoneMsg");
      maybeMarkEp();
    });
    card.append(el("p", { class: "ep-note", lang: "uz" }, "🗣️ " + t("lesson.ep.shadowHint")), btn, fb);
  }

  // ⑥ Role-play — hide a role's lines and speak them aloud (04 §5.8). Hiding a role
  // reveals the transcript and counts as "one role played".
  card.append(rolePlayControls(ep.dialogue || [], list, () => {
    showDialogue(true);
    if (!eDone.role) { eDone.role = true; maybeMarkEp(); }
  }));

  // ⑦ rv recap.
  if (A.rv) {
    const row = el("div", { class: "trg-row" }, ctx.trackTrigger(id, "rv", A.rv, "lesson.audio.rv"));
    const dl = ctx.findDl(l, A.rv.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.ep.recap")));
  }

  // Step guidance → flips to a "done" confirmation once shadow + a role are done.
  epStatus = el("p", { class: "ep-note ep-note--feed", lang: "uz", "aria-live": "polite" }, "→ " + t("lesson.ep.stepHint"));
  card.append(epStatus);
  return card;
}

// The dialogue as read-along lines: speaker chip + English line + (optional) a
// per-line 🔊 replay + a "you say" blank used by the role-play beat (04 §5.8).
function dialogueList(lines) {
  const list = el("div", { class: "ep-dialogue" });
  lines.forEach((ln) => {
    const line = el("div", { class: "ep-line", "data-role": ln.speaker },
      el("span", { class: "ep-line__who", "aria-hidden": "true" }, ln.speaker),
      el("span", { class: "ep-line__en", lang: "en" }, ln.en),
      el("span", { class: "ep-line__blank", "aria-hidden": "true" }, "· · ·  (" + t("lesson.ep.youSay") + ")"));
    if (ttsOk()) {
      const say = el("button", { class: "ep-line__say iconbtn", type: "button", "aria-label": t("lesson.ep.playLine"), html: icon("sound") });
      say.addEventListener("click", () => speakLine(ln.en));
      line.append(say);
    }
    list.append(line);
  });
  return list;
}

// Role-play controls (04 §5.8): one "hide this role" toggle per distinct speaker
// (blanks that speaker's lines so the learner speaks them aloud). Robust to named
// speakers, not just A/B. `onPlayed` fires the first time a role is hidden.
function rolePlayControls(lines, list, onPlayed) {
  const speakers = [...new Set(lines.map((l) => l.speaker))].filter(Boolean);
  let hideRole = null;
  const apply = () => {
    list.classList.toggle("is-roleplay", !!hideRole);
    list.querySelectorAll(".ep-line").forEach((n) => n.classList.toggle("is-hidden", !!hideRole && n.dataset.role === hideRole));
  };
  const controls = el("div", { class: "ep-rolectl" });
  speakers.forEach((role) => {
    const b = el("button", { class: "btn btn--soft ep-role", type: "button", "aria-pressed": "false" }, tf("lesson.ep.hideRole", role));
    b.addEventListener("click", () => {
      hideRole = hideRole === role ? null : role;
      controls.querySelectorAll(".ep-role").forEach((x) => x.setAttribute("aria-pressed", "false"));
      if (hideRole) { b.setAttribute("aria-pressed", "true"); onPlayed(); }
      apply();
    });
    controls.append(b);
  });
  return el("div", { class: "ep-roleplay" },
    el("p", { class: "ep-note", lang: "uz" }, "🎭 " + t("lesson.ep.roleplayHint")),
    controls);
}

// A glossed word list — English chunk (bold) + Uzbek gloss (muted) + English definition.
// Shared shape for EnglishPod Key Vocab and the 6ME 6-word pack (02 §3.3/§3.5).
function glossList(items) {
  const ul = el("ul", { class: "glosslist" });
  items.forEach((v) => {
    ul.append(el("li", { class: "glossrow" },
      el("span", { class: "glossrow__en", lang: "en" }, v.en),
      el("span", { class: "glossrow__uz", lang: "uz" }, v.uz),
      v.defEn ? el("span", { class: "glossrow__def", lang: "en" }, v.defEn) : null));
  });
  return ul;
}

// ── ⑦ 6 Minute English — Listening Stretch (the listening/IELTS half) ─────────
export function sixMinSection(id, l, ctx) {
  const sm = l.sixmin;
  const A = sm.audio || {};
  const T = l.transcripts || {};
  const card = el("div", { class: "card six" });

  const quizzes = Array.isArray(sm.quiz) ? sm.quiz : [];
  const hasVocab = Array.isArray(sm.vocab) && sm.vocab.length > 0;

  // steps.sixmin = quiz answered + 6-word pack reviewed (04 §4.4). A section with no
  // quiz / no pack auto-satisfies that half; the gist-listen counter (listens.sixmin)
  // independently satisfies the step in the check. markSix is idempotent (lesson.js).
  const sState = { quiz: quizzes.length === 0, pack: !hasVocab };
  let sixStatus = null;
  const maybeMarkSix = () => {
    if (!(sState.quiz && sState.pack)) return;
    ctx.markSix();
    if (sixStatus) { sixStatus.textContent = "✓ " + t("lesson.six.sixDone"); sixStatus.classList.add("is-done"); }
  };

  // ①② Pre-listening MCQ — options first (predict), transcript hidden (04 §5.10).
  card.append(el("p", { class: "ep-note", lang: "uz" }, "❓ " + t("lesson.six.quizLead")));
  const controllers = quizzes.map((q, i) => quizMcq(q, i, () => {
    if (controllers.every((c) => c.isRevealed())) { sState.quiz = true; maybeMarkSix(); }
  }));
  controllers.forEach((c) => card.append(c.head));
  if (quizzes.length) card.append(el("p", { class: "ep-note", lang: "uz" }, "🔮 " + t("lesson.six.predictCue")));

  // ③ Gist listen (~6 min) — transcript still hidden.
  if (A.main) {
    const row = el("div", { class: "trg-row trg-row--big" }, ctx.trackTrigger(id, "sixmin", A.main, "lesson.audio.sixmin", { key: "sixmin", max: 1 }));
    const dl = ctx.findDl(l, A.main.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.six.listen")));
  }

  // ④ Reveal answer + self-check (placed AFTER the gist listen, per the 7-beat order).
  if (quizzes.length) {
    card.append(el("p", { class: "ep-note", lang: "uz" }, "✅ " + t("lesson.six.revealLead")));
    controllers.forEach((c) => card.append(c.tail));
  }

  // ⑤ 6-word pack + Uzbek gloss (02 §3.5) + a "reviewed" honor check.
  if (hasVocab) {
    card.append(el("h4", { class: "gpanel__sub" }, "📻 " + t("lesson.six.vocab")));
    card.append(glossList(sm.vocab));
    const fb = el("p", { class: "ep-stepfb", lang: "uz", "aria-live": "polite" });
    const btn = el("button", { class: "btn btn--soft six-pack", type: "button" },
      el("span", { "aria-hidden": "true" }, "✓ "), t("lesson.six.packReviewed"));
    btn.addEventListener("click", () => {
      if (sState.pack) return;
      sState.pack = true;
      btn.classList.add("is-done"); btn.disabled = true;
      fb.textContent = t("lesson.six.packReviewedMsg");
      maybeMarkSix();
    });
    card.append(btn, fb);
  }

  // ⑥ Re-listen with transcript; the INSERT vox-pops are highlighted as the B2 stretch.
  if (A.main && A.main.transcriptKey && Array.isArray(T[A.main.transcriptKey])) {
    card.append(el("p", { class: "ep-note", lang: "uz" }, t("lesson.six.transcript")));
    const tb = ctx.transcriptBlock(T[A.main.transcriptKey], true);
    flagInsertParagraphs(tb);
    card.append(tb);
    card.append(el("p", { class: "six-insert", lang: "uz" }, t("lesson.six.insert")));
  }

  // Step guidance → flips to "done" once quiz + pack are done.
  sixStatus = el("p", { class: "ep-note six-status", lang: "uz", "aria-live": "polite" }, "→ " + t("lesson.six.stepHint"));
  card.append(sixStatus);

  // ⑦ Feeds the Speak-It 60-sec recording (⑨).
  card.append(el("p", { class: "ep-note ep-note--feed", lang: "uz" }, "→ " + t("lesson.six.speakit")));
  return card;
}

// Quiz MCQ (04 §5.10): single-select → reveal → correct ✓ green / chosen-wrong ✗
// amber (never harsh red) + Uzbek explanation; icon + text, not colour alone.
// Returns { head, tail, isRevealed } so the 6ME flow can put the OPTIONS at the top
// (predict, beats ①②) and the REVEAL after the gist listen (beat ④).
function quizMcq(q, idx, onReveal) {
  const head = el("div", { class: "quiz" });
  if (q.qUz) head.append(el("p", { class: "quiz__q quiz__q--uz", lang: "uz" }, q.qUz));
  head.append(el("p", { class: "quiz__q", lang: "en" }, q.q));
  const group = el("div", { class: "quiz__opts", role: "radiogroup", "aria-label": q.q });
  head.append(group);

  let chosen = -1, revealed = false;
  const opts = (q.options || []).map((opt, i) => {
    const b = el("button", { class: "quiz__opt", type: "button", role: "radio", "aria-checked": "false", lang: "en" },
      el("span", { class: "quiz__mark", "aria-hidden": "true" }), el("span", null, opt));
    b.addEventListener("click", () => {
      if (revealed) return;
      chosen = i;
      opts.forEach((o) => o.setAttribute("aria-checked", "false"));
      b.setAttribute("aria-checked", "true");
    });
    group.append(b);
    return b;
  });

  const feedback = el("p", { class: "quiz__fb", lang: "uz", "aria-live": "polite" });
  const reveal = el("button", { class: "btn btn--soft quiz__reveal", type: "button" }, t("quiz.reveal"));
  reveal.addEventListener("click", () => {
    if (revealed) return;
    revealed = true; reveal.disabled = true;
    opts.forEach((o, i) => {
      o.disabled = true;
      if (i === q.answerIndex) { o.classList.add("is-correct"); o.querySelector(".quiz__mark").textContent = "✓"; }
      else if (i === chosen) { o.classList.add("is-wrong"); o.querySelector(".quiz__mark").textContent = "✗"; }
    });
    const right = chosen === q.answerIndex;
    feedback.className = "quiz__fb " + (right ? "is-right" : "is-wrong");
    feedback.textContent = (right ? t("quiz.correct") + " ✓ — " : "") + (q.explanationUz || "");
    onReveal();
  });

  const tail = el("div", { class: "quiz__revealwrap" }, reveal, feedback);
  return { head, tail, isRevealed: () => revealed };
}

// Highlight the INSERT vox-pop paragraphs so the B2 accent stretch is visible, not
// just noted (04 §4.4 ⑥ / 02 §7). Decorates the shared ctx.transcriptBlock output.
function flagInsertParagraphs(node) {
  node.querySelectorAll(".tr__p").forEach((p) => {
    if (/\bINSERT\b/.test(p.textContent || "")) p.classList.add("is-insert");
  });
}
