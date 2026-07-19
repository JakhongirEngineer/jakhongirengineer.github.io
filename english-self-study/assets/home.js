// home.js — the Home / Dashboard (04 §4.1), code-split like lesson.js so first paint
// never pays for it (app.js dynamic-imports it on the home route, shows a skeleton,
// then swaps under an alive() guard). Two faces off ONE route: first-run onboarding
// (empty ess.progress.v1) vs the returning dashboard (Continue card + hero metrics +
// weekly ring + review-today + phase preview). Reads the catalogue once via loadIndex()
// and the engine via getGlobal()/snapshot()/reviewDueToday(). Zero deps.

import { el, icon, t, tf, lang, loadIndex, loadSettings, saveSetting, starCluster } from "./core.js";
import { getGlobal, snapshot, reviewDueToday, shouldReengage, dismissReengage } from "./progress.js";

const STEP_KEYS = ["grammarA", "grammarB", "vocab", "main", "ministory", "pov", "ep", "sixmin", "fun", "record"];
const PACES = ["effortless", "sprint", "gentle"];

// group thousands with a thin space ("1 240") — pairs with tabular-nums.
const groupNum = (n) => String(Math.max(0, Math.floor(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// day-of-cycle from the lesson's first-open time (mirrors lesson.js dayOfCycle, 02 §2).
function dayOfCycle(id) {
  const L = snapshot(id);
  if (!L.startedAt) return 1;
  const t0 = Number(L.startedAt);                 // guard a hand-edited/imported non-numeric startedAt (S6)
  if (!Number.isFinite(t0)) return 1;             // → avoid day=NaN leaking "lesson.day.NaN" to the DOM
  return (Math.floor((Date.now() - t0) / 86400000) % 7) + 1;
}

function skeleton() {
  const s = el("div", { class: "lesson-skel", "aria-hidden": "true" });
  for (let i = 0; i < 3; i++) s.append(el("div", { class: "skel-card" }));
  return s;
}
function errorScreen() {
  return el("section", { class: "screen" },
    el("h1", { class: "screen__title" }, t("route.home.title")),
    el("p", { class: "placeholder" }, t("home.loadError")));
}

// ---- Public entry -----------------------------------------------------------
export async function renderHome(main, seq, alive) {
  main.replaceChildren(skeleton());
  let index;
  try { index = await loadIndex(); }
  catch (err) {
    if (alive && !alive()) return;
    console.warn("home: index.json failed to load", err);
    main.replaceChildren(errorScreen());
    return;
  }
  if (alive && !alive()) return;
  const authored = [...(index.lessons || [])].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const g = getGlobal();
  main.replaceChildren(g.hasProgress ? returning(g, authored, index) : onboarding(authored));
}

// ---- First run — onboarding (04 §4.1 second wireframe) ----------------------
function onboarding(authored) {
  const first = authored[0] || null;
  const cur = (() => { const p = loadSettings().pace; return PACES.includes(p) ? p : "effortless"; })();

  const sec = el("section", { class: "screen home home--first" });
  sec.append(el("p", { class: "home__emoji", "aria-hidden": "true" }, "🎧🗣️"));
  sec.append(el("h1", { class: "home__headline" }, t("home.onboarding.headline")));
  sec.append(el("p", { class: "home__subhead" }, t("home.onboarding.subhead")));
  sec.append(el("p", { class: "home__promise" }, t("home.onboarding.promise")));

  // pace picker → settings.pace (02 §2)
  const paceLabels = { effortless: "home.onboarding.paceEffortless", sprint: "home.onboarding.paceSprint", gentle: "home.onboarding.paceGentle" };
  const fs = el("fieldset", { class: "home__pace" }, el("legend", { class: "home__pace-legend" }, t("home.onboarding.paceLegend")));
  PACES.forEach((p) => {
    const input = el("input", { type: "radio", name: "pace", value: p });
    if (p === cur) input.checked = true;
    fs.append(el("label", { class: "pace__opt" }, input, el("span", { class: "pace__lab" }, t(paceLabels[p]))));
  });
  fs.addEventListener("change", (e) => {
    const r = e.target.closest("input[name=pace]");
    if (r && PACES.includes(r.value)) saveSetting("pace", r.value);
  });
  sec.append(fs);

  // Start → the FIRST AUTHORED lesson (NOT a hardcoded "Lesson 1" — the set starts at core-09).
  if (first) {
    sec.append(el("a", { class: "btn btn--primary home__start", href: "#/lesson/" + first.id },
      tf("home.onboarding.startBtn", first.order, first.title)));
  }
  sec.append(el("a", { class: "btn home__method", href: "#/method" }, t("home.onboarding.readMethod")));
  return sec;
}

// ---- Returning — the dashboard (04 §4.1 first wireframe) --------------------
function returning(g, authored, index) {
  const byId = new Map(authored.map((l) => [l.id, l]));
  const sec = el("section", { class: "screen home" });
  sec.append(el("h1", { class: "home__greeting" }, t("home.greeting")));
  sec.append(el("p", { class: "home__goal" }, t("home.dailyGoal")));

  // Re-engagement banner (S6, 02 §8.3 / 04 §6) — dismissible, non-modal, once/day, never
  // guilt. Only on the returning dashboard; shouldReengage() gates it to a not-studied-today
  // day the user hasn't already dismissed.
  if (shouldReengage()) sec.append(reengageBanner());

  // Continue card — the single loudest element. Fall back to the first authored lesson
  // if lastLessonId points at an unauthored id (04 §4.1 degrade note).
  let cont = g.lastLessonId ? byId.get(g.lastLessonId) : null;
  if (!cont) cont = authored[0] || null;
  if (cont) sec.append(continueCard(cont));

  // Hero metrics — listening minutes FIRST + BIGGEST (02 §1/§8).
  sec.append(heroMetrics(g));

  // Weekly goal ring (forgiving 5/7).
  sec.append(weeklyRing(g.weeklyGoal.activeDaysThisWeek || 0, g.weeklyGoal.target || 5));

  // Review-today cards — ONLY when something is due (no empty box).
  const due = reviewDueToday(authored.map((l) => l.id));
  if (due.length) {
    const wrap = el("div", { class: "home__reviews" }, el("h2", { class: "home__section-h" },
      el("span", { "aria-hidden": "true" }, "🔁 "), t("home.reviewToday")));
    due.forEach((id) => {
      const l = byId.get(id); if (!l) return;
      wrap.append(el("a", { class: "card hreview", href: "#/lesson/" + id },
        el("span", { class: "hreview__ic", "aria-hidden": "true" }, "🔁"),
        el("span", { class: "hreview__body" },
          el("span", { class: "hreview__title" }, tf("home.lessonLine", l.order, l.title)),
          el("span", { class: "hreview__note" }, t("home.reviewNote"))),
        el("span", { class: "hreview__go", "aria-hidden": "true", html: icon("back") })));
    });
    sec.append(wrap);
  }

  // Phase path preview + All-lessons CTA.
  sec.append(phasePreview(cont ? cont.phase : 1));
  sec.append(el("a", { class: "btn home__all", href: "#/lessons" }, t("home.allLessons")));
  return sec;
}

function continueCard(l) {
  const snap = snapshot(l.id);
  const stars = snap.stars || 0;
  const doneCount = STEP_KEYS.filter((k) => snap.steps && snap.steps[k] === true).length;
  const frac = Math.max(doneCount / STEP_KEYS.length, stars / 3);
  const day = dayOfCycle(l.id);
  const dayStar = (day === 4 || day === 6) ? " ⭐" : "";

  const bar = el("div", { class: "hcont__bar", role: "img", "aria-label": tf("home.progressAria", Math.round(frac * 100)) },
    el("i", { class: "hcont__fill", style: `width:${Math.round(frac * 100)}%` }));

  return el("a", { class: "card hcont", href: "#/lesson/" + l.id },
    el("span", { class: "hcont__kicker" }, t("home.continue")),
    el("span", { class: "hcont__title" }, tf("home.lessonLine", l.order, l.title)),
    el("span", { class: "hcont__day chip" }, t("lesson.day." + day) + dayStar),
    el("div", { class: "hcont__meter" }, bar, starCluster(stars)),
    el("span", { class: "btn btn--primary hcont__go" }, t("home.continueBtn")));
}

function heroMetrics(g) {
  const m = g.metrics;
  const tile = (big, emoji, value, label) =>
    el("div", { class: "hmetric" + (big ? " hmetric--big" : "") },
      el("span", { class: "hmetric__ic", "aria-hidden": "true" }, emoji),
      el("span", { class: "hmetric__num" }, groupNum(value)),
      el("span", { class: "hmetric__lab" }, label));
  return el("div", { class: "card hmetrics" },
    tile(true, "🎧", m.listeningMinutes || 0, t("home.heroListening")),
    tile(false, "🗣️", m.speakingReps || 0, t("home.heroSpeaking")),
    tile(false, "🔥", g.streak.count || 0, t("home.heroStreak")));
}

function weeklyRing(active, target) {
  const frac = target > 0 ? Math.min(1, active / target) : 0;
  const ring = el("div", { class: "wring", role: "img", "aria-label": tf("home.weekly", active, target), style: `--deg:${Math.round(frac * 360)}deg` },
    el("span", { class: "wring__num" }, `${active}/${target}`));
  return el("div", { class: "home__weekly" }, ring,
    el("span", { class: "home__weekly-lab" }, t("home.weeklyLabel")));
}

function phasePreview(current) {
  const names = ["map.phase1", "map.phase2", "map.phase3"];
  const row = el("div", { class: "hphase__row" });
  names.forEach((key, i) => {
    const on = (i + 1) <= current;
    row.append(el("span", { class: "hphase__dot" + (on ? " is-on" : "") },
      el("span", { class: "hphase__mark", "aria-hidden": "true" }, on ? "●" : "○"),
      el("span", { class: "hphase__name" }, t(key))));
  });
  return el("div", { class: "home__phase" },
    el("p", { class: "home__section-h" }, t("home.phasePreview")), row);
}

// ---- Re-engagement banner (S6, 02 §8.3 / 04 §6) — kind, dismissible, non-modal --------
function reengageBanner() {
  const banner = el("div", { class: "reengage", role: "note" });
  const close = el("button", { class: "reengage__close", type: "button", "aria-label": t("reengage.dismiss"), html: icon("close") });
  close.addEventListener("click", () => { dismissReengage(); banner.remove(); });
  banner.append(
    el("span", { class: "reengage__ic", "aria-hidden": "true" }, "🎧"),
    el("p", { class: "reengage__body" }, t("reengage.body")),
    close);
  return banner;
}
