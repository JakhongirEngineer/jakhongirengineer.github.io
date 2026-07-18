// grammar.js — the Grammar Reference (#/grammar, 04 §4.7/§4.8, 02 §10), code-split.
// A LOOKUP surface, never a drill: every grammar topic is authored & taught inside its
// weekly lesson, so this page is (1) a read-only INDEX of all Grammar Sparks grouped by
// phase, each linking to its lesson (catalogue via loadIndex() → grammarTitlesUz/grammarUnits,
// no per-lesson fetch), plus (2) two standalone quick-reference cards — irregular verbs &
// spelling rules — RE-AUTHORED as original bilingual cards (Murphy App 2/3/5 are copyrighted
// and never reproduced, 02 §10 / 03 §9). Only core-09 is in the index today; the sparks list
// grows as S13 authors — we render whatever loadIndex() returns. One <h1>.
//
// #/grammar/<unit> deep-links: each topic row carries id="g-<slug>"; on load we scroll to
// and briefly highlight the matching row (the unit segment is read from the hash so the
// module keeps the shared (main,seq,alive) signature).

import { el, icon, t, tf, loadIndex } from "./core.js";

const PHASES = [
  { phase: 1, key: "map.phase1", cefr: "A2 → B1", range: "L01–10", accent: "teal" },
  { phase: 2, key: "map.phase2", cefr: "B1", range: "L11–20", accent: "indigo" },
  { phase: 3, key: "map.phase3", cefr: "B1 → B2", range: "L21–30", accent: "amber" },
];

// ---- Irregular verbs — an ORIGINAL selection, grouped by an original 4-pattern pedagogy
// (the grouping IS the teaching; forms are language-neutral facts, the gloss is Uzbek). ----
const IRREG = [
  { h: "gref.irregG1", note: "gref.irregG1Note", rows: [
    ["cut", "cut", "cut", "kesmoq"], ["put", "put", "put", "qoʻymoq"],
    ["let", "let", "let", "ruxsat bermoq"], ["set", "set", "set", "oʻrnatmoq"],
    ["hit", "hit", "hit", "urmoq"], ["shut", "shut", "shut", "yopmoq"],
    ["cost", "cost", "cost", "(narx) turmoq"], ["hurt", "hurt", "hurt", "ogʻritmoq"],
    ["quit", "quit", "quit", "tashlamoq"], ["read", "read", "read", "oʻqimoq"],
  ] },
  { h: "gref.irregG2", note: "gref.irregG2Note", rows: [
    ["make", "made", "made", "qilmoq, yasamoq"], ["say", "said", "said", "aytmoq"],
    ["pay", "paid", "paid", "toʻlamoq"], ["buy", "bought", "bought", "sotib olmoq"],
    ["bring", "brought", "brought", "olib kelmoq"], ["think", "thought", "thought", "oʻylamoq"],
    ["teach", "taught", "taught", "oʻrgatmoq"], ["find", "found", "found", "topmoq"],
    ["tell", "told", "told", "aytib bermoq"], ["keep", "kept", "kept", "saqlamoq"],
    ["leave", "left", "left", "tark etmoq"], ["lose", "lost", "lost", "yoʻqotmoq"],
    ["feel", "felt", "felt", "his qilmoq"], ["sleep", "slept", "slept", "uxlamoq"],
    ["have", "had", "had", "ega boʻlmoq"],
  ] },
  { h: "gref.irregG3", note: "gref.irregG3Note", rows: [
    ["begin", "began", "begun", "boshlamoq"], ["drink", "drank", "drunk", "ichmoq"],
    ["swim", "swam", "swum", "suzmoq"], ["sing", "sang", "sung", "kuylamoq"],
    ["drive", "drove", "driven", "haydamoq"], ["write", "wrote", "written", "yozmoq"],
    ["ride", "rode", "ridden", "minmoq"], ["speak", "spoke", "spoken", "gapirmoq"],
    ["break", "broke", "broken", "sindirmoq"], ["take", "took", "taken", "olmoq"],
    ["give", "gave", "given", "bermoq"], ["know", "knew", "known", "bilmoq"],
    ["grow", "grew", "grown", "oʻsmoq"], ["throw", "threw", "thrown", "uloqtirmoq"],
  ] },
  { h: "gref.irregG4", note: "gref.irregG4Note", rows: [
    ["be", "was / were", "been", "boʻlmoq"], ["go", "went", "gone", "bormoq"],
    ["do", "did", "done", "qilmoq"], ["get", "got", "got / gotten", "olmoq, erishmoq"],
    ["come", "came", "come", "kelmoq"], ["see", "saw", "seen", "koʻrmoq"],
    ["eat", "ate", "eaten", "yemoq"], ["become", "became", "become", "aylanmoq"],
    ["run", "ran", "run", "yugurmoq"], ["fall", "fell", "fallen", "yiqilmoq"],
    ["understand", "understood", "understood", "tushunmoq"],
  ] },
];

// ---- Spelling rules — original cards (title + rule bilingual; examples language-neutral). ----
const SPELLING = [
  { t: "gref.sp1Title", b: "gref.sp1Body", ex: ["cats", "boxes", "watches", "goes", "baby → babies", "city → cities", "boy → boys"] },
  { t: "gref.sp2Title", b: "gref.sp2Body", ex: ["make → making", "run → running", "sit → sitting", "begin → beginning", "die → dying"] },
  { t: "gref.sp3Title", b: "gref.sp3Body", ex: ["work → worked", "like → liked", "study → studied", "stop → stopped", "play → played"] },
  { t: "gref.sp4Title", b: "gref.sp4Body", ex: ["fast → faster → fastest", "nice → nicer", "happy → happier", "big → bigger → biggest", "more careful"] },
  { t: "gref.sp5Title", b: "gref.sp5Body", ex: ["try → tries / tried", "happy → happily", "playing", "buying"] },
];

function currentUnit() {
  const segs = location.hash.replace(/^#/, "").split("/").filter(Boolean);
  return (segs[0] === "grammar" && segs[1]) ? decodeURIComponent(segs[1]) : null;
}

function skeleton() {
  const s = el("div", { class: "lesson-skel", "aria-hidden": "true" });
  for (let i = 0; i < 3; i++) s.append(el("div", { class: "skel-card" }));
  return s;
}

// ---- Public entry -----------------------------------------------------------
export async function renderGrammar(main, seq, alive) {
  main.replaceChildren(skeleton());
  let index = null;
  try { index = await loadIndex(); }
  catch { index = null; }                     // sparks section shows a calm note; the reference cards still render
  if (alive && !alive()) return;

  const sec = el("section", { class: "screen doc gref" });
  sec.append(el("h1", { class: "screen__title" }, t("route.grammar.title")));
  sec.append(el("p", { class: "doc__lead" }, t("gref.lead")));

  // (1) Grammar Sparks index, grouped by phase.
  sec.append(el("h2", { class: "doc__h" }, t("gref.sparksTitle")));
  sec.append(sparksIndex(index));

  // (2) Re-authored quick-reference cards.
  sec.append(el("h2", { class: "doc__h" }, t("gref.refTitle")));
  sec.append(irregularCard());
  sec.append(spellingCard());

  main.replaceChildren(sec);

  // Deep-link: scroll to + briefly highlight the requested unit row.
  const unit = currentUnit();
  if (unit) requestAnimationFrame(() => {
    const target = document.getElementById("g-" + unit);
    if (target) { target.scrollIntoView({ block: "center", behavior: "smooth" }); target.classList.add("is-target"); }
  });
}

function sparksIndex(index) {
  if (!index) {
    return el("p", { class: "callout callout--error" },
      el("span", { class: "callout__ic", "aria-hidden": "true" }, "⚠️"), t("map.loadError"));
  }
  const lessons = [...(index.lessons || [])].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const wrap = el("div", { class: "gref-phases" });
  PHASES.forEach((p) => {
    const block = el("section", { class: "gref-ph gref-ph--" + p.accent, "aria-labelledby": "gph-" + p.phase });
    block.append(el("div", { class: "gref-ph__head" },
      el("h3", { class: "gref-ph__name", id: "gph-" + p.phase }, tf("map.phaseNum", p.phase) + " · " + t(p.key)),
      el("span", { class: "chip gref-ph__cefr" }, p.cefr),
      el("span", { class: "gref-ph__range" }, p.range)));

    const inPhase = lessons.filter((l) => l.phase === p.phase);
    if (!inPhase.length) {
      block.append(el("p", { class: "gref-ph__coming" },
        el("span", { "aria-hidden": "true" }, "🌱 "), t("map.comingSoon")));
    } else {
      const list = el("div", { class: "gref-lessons" });
      inPhase.forEach((l) => list.append(sparkRow(l)));
      block.append(list);
    }
    wrap.append(block);
  });
  return wrap;
}

function sparkRow(l) {
  const titlesUz = Array.isArray(l.grammarTitlesUz) && l.grammarTitlesUz.length ? l.grammarTitlesUz : null;
  const slugs = Array.isArray(l.grammarUnits) ? l.grammarUnits : [];
  const titles = titlesUz || slugs;

  const topics = el("ul", { class: "gref-topics" });
  titles.forEach((title, i) => {
    const slug = slugs[i];
    topics.append(el("li", { class: "gref-topic", id: slug ? "g-" + slug : null },
      el("span", { class: "gref-topic__tag", "aria-hidden": "true" }, i === 0 ? "A" : "B"),
      el("span", { lang: titlesUz ? "uz" : "en" }, title)));
  });

  return el("a", { class: "card gref-lesson", href: "#/lesson/" + l.id,
    "aria-label": tf("home.lessonLine", l.order, l.title) + " — " + titles.join("; ") },
    el("div", { class: "gref-lesson__head" },
      el("span", { class: "gref-lesson__order" }, String(l.order)),
      el("span", { class: "gref-lesson__title", lang: "en" }, l.title),
      el("span", { class: "chip gref-lesson__level" }, l.level)),
    topics,
    el("span", { class: "gref-lesson__go", "aria-hidden": "true", html: icon("back") }));
}

function irregularCard() {
  const card = el("section", { class: "card gref-ref" });
  card.append(el("h3", { class: "gref-ref__h" },
    el("span", { "aria-hidden": "true" }, "🔤 "), t("gref.irregTitle")));
  card.append(el("p", { class: "gref-ref__lead" }, t("gref.irregLead")));
  IRREG.forEach((g) => {
    card.append(el("h4", { class: "gref-grp__h" }, t(g.h)));
    if (g.note) card.append(el("p", { class: "gref-grp__note" }, t(g.note)));
    const table = el("table", { class: "tbl tbl--verbs" });
    table.append(el("thead", {}, el("tr", {},
      el("th", { scope: "col" }, t("gref.colBase")),
      el("th", { scope: "col" }, t("gref.colPast")),
      el("th", { scope: "col" }, t("gref.colPart")),
      el("th", { scope: "col" }, t("gref.colMeaning")))));
    const body = el("tbody");
    g.rows.forEach((r) => body.append(el("tr", {},
      el("th", { scope: "row", lang: "en" }, r[0]),
      el("td", { lang: "en" }, r[1]),
      el("td", { lang: "en" }, r[2]),
      el("td", { lang: "uz" }, r[3]))));
    table.append(body);
    card.append(el("div", { class: "tbl-wrap", tabindex: "0", role: "region", "aria-label": t(g.h) }, table));
  });
  return card;
}

function spellingCard() {
  const card = el("section", { class: "card gref-ref" });
  card.append(el("h3", { class: "gref-ref__h" },
    el("span", { "aria-hidden": "true" }, "✍️ "), t("gref.spellTitle")));
  card.append(el("p", { class: "gref-ref__lead" }, t("gref.spellLead")));
  SPELLING.forEach((s) => {
    const item = el("div", { class: "gref-spell" });
    item.append(el("h4", { class: "gref-spell__h" }, t(s.t)));
    item.append(el("p", { class: "gref-spell__body" }, t(s.b)));
    const ex = el("p", { class: "gref-spell__ex" },
      el("span", { class: "gref-spell__exk" }, t("gref.examples") + ": "));
    s.ex.forEach((e, i) => {
      if (i) ex.append(el("span", { class: "gref-spell__sep", "aria-hidden": "true" }, " · "));
      ex.append(el("span", { lang: "en" }, e));
    });
    item.append(ex);
    card.append(item);
  });
  return card;
}
