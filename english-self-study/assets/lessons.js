// lessons.js — the Curriculum Map (04 §4.2 / §5.3), code-split like lesson.js.
// Three phases (Poydevor / Sur'at / Ravonlik) as fixed constants, each with a header
// (Uzbek name + CEFR tag + "by the end I can…" line + progress bar) and a lesson CARD
// for every index.json lesson whose phase matches. Cards read the star tier from the
// engine (snapshot) and everything else from index.json — NO per-lesson fetch. Soft
// locks only: the recommended-next lesson gets a ring + one gentle pulse; nothing is
// ever disabled (free-study ethos). Phases with no authored lessons yet show a calm
// "being prepared" note — we never fabricate entries (the full 30 populate in S13).

import { el, icon, t, tf, loadIndex, starCluster } from "./core.js";
import { snapshot, reviewDueToday } from "./progress.js";

// Phase constants (02 §1 / 04 §4.2). Accents: Poydevor=teal · Sur'at=indigo · Ravonlik=amber (04 §7.2).
const PHASES = [
  { phase: 1, key: "map.phase1", cefr: "A2 → B1", range: "01–10", accent: "teal" },
  { phase: 2, key: "map.phase2", cefr: "B1", range: "11–20", accent: "indigo" },
  { phase: 3, key: "map.phase3", cefr: "B1 → B2", range: "21–30", accent: "amber" },
];

function skeleton() {
  const s = el("div", { class: "lesson-skel", "aria-hidden": "true" });
  for (let i = 0; i < 4; i++) s.append(el("div", { class: "skel-card" }));
  return s;
}
function errorScreen() {
  return el("section", { class: "screen" },
    el("h1", { class: "screen__title" }, t("route.lessons.title")),
    el("p", { class: "placeholder" }, t("map.loadError")));
}

// ---- Public entry -----------------------------------------------------------
export async function renderMap(main, seq, alive) {
  main.replaceChildren(skeleton());
  let index;
  try { index = await loadIndex(); }
  catch (err) {
    if (alive && !alive()) return;
    console.warn("lessons: index.json failed to load", err);
    main.replaceChildren(errorScreen());
    return;
  }
  if (alive && !alive()) return;

  const lessons = [...(index.lessons || [])].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  // Recommended-next = the lowest-order authored lesson not yet complete (stars < 1).
  const recId = (lessons.find((l) => (snapshot(l.id).stars || 0) < 1) || {}).id || null;
  const dueSet = new Set(reviewDueToday(lessons.map((l) => l.id)));

  const sec = el("section", { class: "screen map" });
  sec.append(el("h1", { class: "screen__title" }, t("route.lessons.title")));
  PHASES.forEach((p) => sec.append(phaseBlock(p, lessons, recId, dueSet)));
  main.replaceChildren(sec);
}

function phaseBlock(p, lessons, recId, dueSet) {
  const block = el("section", { class: "phase phase--" + p.accent, "aria-labelledby": "ph-" + p.phase });
  block.append(el("div", { class: "phase__head" },
    el("span", { class: "phase__badge", "aria-hidden": "true" }),
    el("div", { class: "phase__heads" },
      el("h2", { class: "phase__name", id: "ph-" + p.phase }, tf("map.phaseNum", p.phase) + " · " + t(p.key)),
      el("div", { class: "phase__tags" },
        el("span", { class: "chip phase__cefr" }, p.cefr),
        el("span", { class: "phase__range" }, p.range)))));
  block.append(el("p", { class: "phase__cando" }, t("map.canDo" + p.phase)));

  const inPhase = lessons.filter((l) => l.phase === p.phase);
  if (!inPhase.length) {                               // honest, calm — never fabricate (S13 populates)
    block.append(el("p", { class: "phase__coming" },
      el("span", { "aria-hidden": "true" }, "🌱 "), t("map.comingSoon")));
    return block;
  }
  const done = inPhase.filter((l) => (snapshot(l.id).stars || 0) >= 1).length;
  const frac = inPhase.length ? done / inPhase.length : 0;
  block.append(el("div", { class: "phase__bar", role: "img", "aria-label": tf("map.progress", done, inPhase.length) },
    el("i", { class: "phase__bar-fill", style: `width:${Math.round(frac * 100)}%` })));
  block.append(el("p", { class: "phase__count" }, tf("map.progress", done, inPhase.length)));

  const cards = el("div", { class: "phase__cards" });
  inPhase.forEach((l) => cards.append(lessonCard(l, p.accent, l.id === recId, dueSet.has(l.id))));
  block.append(cards);
  return block;
}

function lessonCard(l, accent, isNext, review) {
  const stars = snapshot(l.id).stars || 0;
  // Prefer the readable Uzbek grammar titles (build-index grammarTitlesUz); fall back to slugs.
  const titlesUz = Array.isArray(l.grammarTitlesUz) && l.grammarTitlesUz.length ? l.grammarTitlesUz : null;
  const titles = titlesUz || (Array.isArray(l.grammarUnits) ? l.grammarUnits : []);

  const head = el("div", { class: "lcard__head" },
    starCluster(stars, { review }),
    el("span", { class: "lcard__order" }, String(l.order)),
    el("span", { class: "lcard__title", lang: "en" }, l.title),
    el("span", { class: "chip lcard__level" }, l.level));
  if (isNext) head.append(el("span", { class: "lcard__next" }, t("map.next")));

  const gram = el("p", { class: "lcard__grammar" },
    el("span", { class: "lcard__grammar-k" }, t("map.grammarPrefix") + ": "),
    el("span", { lang: titlesUz ? "uz" : "en" }, titles.join(" · ")));

  const badges = el("div", { class: "lcard__badges" });
  if (l.hasEnglishPod) badges.append(el("span", { class: "lcard__badge" }, "🎙️ EnglishPod"));
  badges.append(el("span", { class: "lcard__badge" }, "📻 6 Minute"));

  // The WHOLE card is one tap target (04 §5.3); soft locks are hints, never disabled.
  // Fold state into the accessible name — an explicit aria-label overrides child name
  // computation, so the star cluster / next / review-due text would otherwise be silent.
  const nameParts = [tf("home.lessonLine", l.order, l.title), tf("map.starAria", stars)];
  if (review) nameParts.push(t("map.reviewDue"));
  if (isNext) nameParts.push(t("map.next"));
  return el("a", { class: "lcard lcard--" + accent + (isNext ? " lcard--next" : "") + (review ? " lcard--review" : ""),
    href: "#/lesson/" + l.id, "aria-label": nameParts.join(" · ") },
    el("span", { class: "lcard__accent", "aria-hidden": "true" }),
    el("div", { class: "lcard__body" }, head, gram, badges));
}
