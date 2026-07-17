// lesson-episodes.js — the two folded-in in-lesson sections (04 §4.3 ⑥/⑦, §4.4):
//   ⑥ EnglishPod — the SPEAKING half (warm-up → dg cold → transcript + Uzbek-glossed
//      Key Vocabulary → pr → shadow → role-play (hide a role) → rv), and
//   ⑦ 6 Minute English — the LISTENING/IELTS half (pre-listening MCQ → predict → gist
//      listen → reveal + self-check → 6-word pack + Uzbek gloss → re-listen w/ INSERT).
//
// Lazily imported by lesson.js ONLY on the lesson route (03 §4 — keeps every module
// within budget and Home/Map first paint free of it). Shared component builders
// (trackTrigger / downloadBtn / transcriptBlock / findDl) are INJECTED via `ctx` so
// this module imports only leaf primitives — no import cycle with lesson.js.

import { el, icon, t, tf } from "./core.js";

// ── ⑥ EnglishPod — Conversation (the speaking half) ──────────────────────────
export function englishPodSection(id, l, ctx) {
  const ep = l.englishpod;
  const A = ep.audio || {};
  const card = el("div", { class: "card ep" });

  // ① Warm-up (bilingual, 2 lines + prediction) — ties to the AJ theme (02 §3.1).
  card.append(el("div", { class: "ep-warmup" },
    el("p", { class: "l-about" }, el("span", { class: "l-about__k", lang: "uz" }, t("lesson.ep.warmup") + ": "), el("span", { lang: "uz" }, ep.warmup?.uz || "")),
    ep.warmup?.en ? el("p", { class: "ep-warmup__en", lang: "en" }, ep.warmup.en) : null,
    el("p", { class: "ep-note", lang: "uz" }, "🔮 " + t("lesson.ep.predict"))));

  // ② Listen to dg cold (~1 min).
  if (A.dg) {
    const row = el("div", { class: "trg-row" }, ctx.trackTrigger(id, "dg", A.dg, "lesson.audio.dg", { key: "ep", max: 1 }));
    const dl = ctx.findDl(l, A.dg.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.ep.listenCold")));
  }

  // ③ Dialogue transcript + role-play (hide a role) + shadow (04 §5.8).
  card.append(dialogueBlock(ep.dialogue || [], ctx));

  // Key Vocabulary + our added Uzbek gloss (02 §3.3).
  if (Array.isArray(ep.keyVocab) && ep.keyVocab.length) {
    card.append(el("h4", { class: "gpanel__sub" }, "🔑 " + t("lesson.ep.keyVocab")));
    card.append(glossList(ep.keyVocab));
  }

  // ④ pr explanation (skippable on Sprint) + ⑦ rv recap.
  if (A.pr) {
    const row = el("div", { class: "trg-row" }, ctx.trackTrigger(id, "pr", A.pr, "lesson.audio.pr"));
    const dl = ctx.findDl(l, A.pr.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.ep.explain")));
  }
  if (A.rv) {
    const row = el("div", { class: "trg-row" }, ctx.trackTrigger(id, "rv", A.rv, "lesson.audio.rv"));
    const dl = ctx.findDl(l, A.rv.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.ep.recap")));
  }
  return card;
}

// Dialogue block: shadow + role-play. A "show dialogue" toggle reveals the lines and
// the hide-role controls (blank one speaker's lines so the learner speaks them aloud).
function dialogueBlock(lines, ctx) {
  const list = el("div", { class: "ep-dialogue" });
  lines.forEach((ln) => {
    const line = el("div", { class: "ep-line", "data-role": ln.speaker },
      el("span", { class: "ep-line__who", "aria-hidden": "true" }, ln.speaker),
      el("span", { class: "ep-line__en", lang: "en" }, ln.en),
      el("span", { class: "ep-line__blank", "aria-hidden": "true" }, "· · ·  (siz gapiring)"));
    list.append(line);
  });

  // role-play controls
  let hideRole = null;
  const apply = () => {
    list.classList.toggle("is-roleplay", !!hideRole);
    list.querySelectorAll(".ep-line").forEach((n) => n.classList.toggle("is-hidden", !!hideRole && n.dataset.role === hideRole));
    ctx.markEp();
  };
  const mk = (role, key) => {
    const b = el("button", { class: "btn btn--soft ep-role", type: "button", "aria-pressed": "false" }, t(key));
    b.addEventListener("click", () => {
      hideRole = hideRole === role ? null : role;
      controls.querySelectorAll(".ep-role").forEach((x) => x.setAttribute("aria-pressed", "false"));
      if (hideRole) b.setAttribute("aria-pressed", "true");
      apply();
    });
    return b;
  };
  const hideA = mk("A", "lesson.ep.hideA");
  const hideB = mk("B", "lesson.ep.hideB");
  const controls = el("div", { class: "ep-rolectl" }, hideA, hideB);

  const inner = el("div", { class: "ep-dialogue-wrap", hidden: "" },
    el("p", { class: "ep-note", lang: "uz" }, "🗣️ " + t("lesson.ep.shadowHint")),
    el("p", { class: "ep-note", lang: "uz" }, "🎭 " + t("lesson.ep.roleplayHint")),
    controls, list);

  const toggle = el("button", { class: "tr__toggle", type: "button", "aria-expanded": "false" },
    el("span", { class: "tr__ic", html: icon("doc") }), el("span", null, t("lesson.ep.dialogue")));
  toggle.addEventListener("click", () => {
    const open = inner.hidden;
    inner.hidden = !open; toggle.setAttribute("aria-expanded", String(open));
    if (open) ctx.markEp();
  });
  return el("div", { class: "ep-dialogue-block" }, toggle, inner);
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

  // ① Pre-listening MCQ (predict first) — 04 §5.10.
  card.append(el("p", { class: "ep-note", lang: "uz" }, "❓ " + t("lesson.six.quizLead")));
  (sm.quiz || []).forEach((q, i) => card.append(quizMcq(q, i, ctx)));

  // ③ Gist listen (~6 min).
  if (A.main) {
    const row = el("div", { class: "trg-row trg-row--big" }, ctx.trackTrigger(id, "sixmin", A.main, "lesson.audio.sixmin", { key: "sixmin", max: 1 }));
    const dl = ctx.findDl(l, A.main.path); if (dl) row.append(ctx.downloadBtn(dl));
    card.append(row, el("p", { class: "ep-note", lang: "uz" }, t("lesson.six.listen")));
  }

  // ⑤ 6-word pack + Uzbek gloss (02 §3.5).
  if (Array.isArray(sm.vocab) && sm.vocab.length) {
    card.append(el("h4", { class: "gpanel__sub" }, "📻 " + t("lesson.six.vocab")));
    card.append(glossList(sm.vocab));
  }

  // ⑥ Re-listen with transcript; flag the INSERT vox-pop stretch (02 §3/§7).
  if (A.main && A.main.transcriptKey && Array.isArray(T[A.main.transcriptKey])) {
    card.append(el("p", { class: "ep-note", lang: "uz" }, t("lesson.six.transcript")));
    card.append(ctx.transcriptBlock(T[A.main.transcriptKey], true));
    card.append(el("p", { class: "six-insert", lang: "uz" }, t("lesson.six.insert")));
  }

  // ⑦ Feeds the Speak-It 60-sec recording (⑨).
  card.append(el("p", { class: "ep-note ep-note--feed", lang: "uz" }, "→ " + t("lesson.six.speakit")));
  return card;
}

// Quiz MCQ: single-select (predict) → Reveal → correct ✓ green / chosen-wrong amber ✗
// + Uzbek explanation (04 §5.10; never harsh red; icon + text, not colour alone).
function quizMcq(q, idx, ctx) {
  const wrap = el("div", { class: "quiz" });
  if (q.qUz) wrap.append(el("p", { class: "quiz__q quiz__q--uz", lang: "uz" }, q.qUz));
  wrap.append(el("p", { class: "quiz__q", lang: "en" }, q.q));
  const feedback = el("p", { class: "quiz__fb", lang: "uz", "aria-live": "polite" });
  let chosen = -1, revealed = false;

  const group = el("div", { class: "quiz__opts", role: "radiogroup", "aria-label": q.q });
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

  const reveal = el("button", { class: "btn btn--soft quiz__reveal", type: "button" }, t("quiz.reveal"));
  reveal.addEventListener("click", () => {
    if (revealed) return;
    revealed = true; reveal.disabled = true;
    ctx.markSix();
    opts.forEach((o, i) => {
      o.disabled = true;
      if (i === q.answerIndex) { o.classList.add("is-correct"); o.querySelector(".quiz__mark").textContent = "✓"; }
      else if (i === chosen) { o.classList.add("is-wrong"); o.querySelector(".quiz__mark").textContent = "✗"; }
    });
    const right = chosen === q.answerIndex;
    feedback.className = "quiz__fb " + (right ? "is-right" : "is-wrong");
    feedback.textContent = (right ? t("quiz.correct") + " ✓ — " : "") + (q.explanationUz || "");
  });

  wrap.append(group, reveal, feedback);
  return wrap;
}
