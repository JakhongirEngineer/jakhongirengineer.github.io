// ielts.js — the IELTS & CEFR alignment page (#/ielts, 04 §4.7, 02 §7), code-split.
// Bilingual and HONEST up front: this course builds the underlying spoken competence
// IELTS *measures* — it is not a cram course. Surfaces the Phase→CEFR→IELTS map, the
// IELTS-Speaking-criterion→course-feature map, a plain "Am I ready for a mock?" self-check,
// and the Interview-Skills bridge note (the six EnglishPod Interview Skills dialogues woven
// through L04/18/19/26/27/29, climaxing at the L30 capstone → a real/paid mock). One <h1>.
// No catalogue fetch — this is static guidance; it just links out to the coverage grid.
//
// lang policy: switchable UI strings from t() carry NO lang attribute — they inherit the
// active UI language from <html lang> (the shell keeps it in sync). Only fixed-language
// tokens (here: none beyond the neutral CEFR/band values) get an explicit lang.

import { el, icon, t } from "./core.js";

// Phase → CEFR → IELTS map (02 §7). CEFR/band cells are language-neutral (kept inline);
// the phase name reuses the map.* keys and the built-competence cells are translated.
const PHASE_ROWS = [
  { name: "map.phase1", range: "L01–10", cefr: "A2 → B1", band: "3.5–4.5", sp: "ielts.p1Speaking", ls: "ielts.p1Listening" },
  { name: "map.phase2", range: "L11–20", cefr: "B1", band: "4.5–5.5", sp: "ielts.p2Speaking", ls: "ielts.p2Listening" },
  { name: "map.phase3", range: "L21–30", cefr: "B1 → B2", band: "5.5–6.5", sp: "ielts.p3Speaking", ls: "ielts.p3Listening" },
];

// IELTS Speaking criterion → where it is built (02 §7). The criterion label is switchable
// (the UZ mirror keeps the English band term in parentheses, 02 §6 convention).
const CRITERIA = [
  { name: "ielts.critFluency", where: "ielts.critFluencyWhere" },
  { name: "ielts.critLexical", where: "ielts.critLexicalWhere" },
  { name: "ielts.critGrammar", where: "ielts.critGrammarWhere" },
  { name: "ielts.critPron", where: "ielts.critPronWhere" },
];

const READY = ["ielts.ready1", "ielts.ready2", "ielts.ready3", "ielts.ready4", "ielts.ready5"];

function callout(variant, ic, titleKey, bodyKey) {
  return el("div", { class: "callout callout--" + variant },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, ic),
    el("div", {}, el("strong", {}, t(titleKey)), el("p", {}, t(bodyKey))));
}

function phaseTable() {
  const table = el("table", { class: "tbl" });
  table.append(el("thead", {}, el("tr", {},
    el("th", { scope: "col" }, t("ielts.colPhase")),
    el("th", { scope: "col" }, "CEFR"),
    el("th", { scope: "col" }, t("ielts.colBand")),
    el("th", { scope: "col" }, t("ielts.colSpeaking")),
    el("th", { scope: "col" }, t("ielts.colListening")))));
  const body = el("tbody");
  PHASE_ROWS.forEach((r) => {
    body.append(el("tr", {},
      el("th", { scope: "row" },
        el("span", { class: "tbl__ph" }, t(r.name)),
        el("span", { class: "tbl__sub" }, r.range)),
      el("td", {}, r.cefr),
      el("td", {}, r.band),
      el("td", {}, t(r.sp)),
      el("td", {}, t(r.ls))));
  });
  table.append(body);
  return el("div", { class: "tbl-wrap", role: "region", "aria-label": t("ielts.mapTitle"), tabindex: "0" }, table);
}

// ---- Public entry -----------------------------------------------------------
export async function renderIelts(main, seq, alive) {
  if (alive && !alive()) return;
  const sec = el("section", { class: "screen doc" });
  sec.append(el("h1", { class: "screen__title" }, t("route.ielts.title")));
  sec.append(el("p", { class: "doc__lead" }, t("ielts.lead")));

  // Honest framing — up front (02 §7).
  sec.append(callout("info", "🎯", "ielts.honestTitle", "ielts.honestBody"));

  // Phase → CEFR → IELTS map.
  sec.append(el("h2", { class: "doc__h" }, t("ielts.mapTitle")));
  sec.append(phaseTable());

  // Speaking criterion → course feature.
  sec.append(el("h2", { class: "doc__h" }, t("ielts.criteriaTitle")));
  const crits = el("div", { class: "crit-list" });
  CRITERIA.forEach((c) => {
    crits.append(el("div", { class: "card crit" },
      el("p", { class: "crit__name" }, t(c.name)),
      el("p", { class: "crit__where" }, t(c.where))));
  });
  sec.append(crits);

  // "Am I ready for a mock?" plain self-check.
  sec.append(el("h2", { class: "doc__h" }, t("ielts.readyTitle")));
  sec.append(el("p", { class: "doc__p" }, t("ielts.readyLead")));
  const list = el("ul", { class: "chk" });
  READY.forEach((k) => list.append(el("li", { class: "chk__i" },
    el("span", { class: "chk__box", "aria-hidden": "true", html: icon("check") }), t(k))));
  sec.append(list);

  // Interview-Skills bridge (02 §5).
  sec.append(callout("bridge", "🗣️", "ielts.bridgeTitle", "ielts.bridgeBody"));

  // CEFR badges note + coverage-grid link.
  sec.append(el("p", { class: "doc__p" }, t("ielts.badgesNote")));
  sec.append(el("a", { class: "btn btn--soft doc__cta", href: "#/progress" },
    el("span", { class: "set-ic", "aria-hidden": "true" }, "🎯"), t("ielts.coverageLink")));

  if (alive && !alive()) return;
  main.replaceChildren(sec);
}
