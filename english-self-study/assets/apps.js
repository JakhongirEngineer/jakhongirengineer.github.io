// apps.js — the Principia Forge "You*" family cross-promo (post-launch). ONE registry
// powers three surfaces: the #/apps page, a Home teaser strip, and contextual callouts
// on #/ielts (YouWrite + YouScore) and #/method (YouPlan). Emoji monograms only — 0 KB,
// no image fetch, on-brand with the site's emoji-forward look. Play links open in a new
// tab and are UTM-tagged so the owner can attribute installs in Play Console; this is
// store-referral attribution, NOT on-site tracking (the learner's privacy is untouched).
// Adding a future app = one entry in APPS; every surface updates. Zero deps beyond core.js.

import { el, t, lang } from "./core.js";

// Store-referral attribution (Play Console), not on-site analytics.
const UTM = "utm_source=youstudy&utm_medium=cross-app";
const withUtm = (url) => (url ? url + (url.includes("?") ? "&" : "?") + UTM : url);

// The family. `current: true` marks THIS site (rendered as a "you're here" chip, no link).
// Taglines are content (inline bilingual), so they live here rather than in the i18n dict.
export const APPS = [
  { id: "youstudy", name: "YouStudy - English", emoji: "🎧", current: true,
    taglineUz: "Ingliz tilida gapirishni oʻrganing",
    taglineEn: "Learn to speak English",
    url: "", tags: ["english", "ielts"] },
  { id: "youwrite", name: "YouWrite", emoji: "✍️",
    taglineUz: "IELTS yozma nutq — toʻliq kurs, oʻyinlar, aqlli takror",
    taglineEn: "IELTS Writing — full course, games, smart review",
    url: "https://play.google.com/store/apps/details?id=com.principiaforge.ieltswriting",
    tags: ["ielts", "writing"] },
  { id: "youscore", name: "YouScore", emoji: "📊",
    taglineUz: "IELTS ball kalkulyatori va natija kuzatuvi",
    taglineEn: "IELTS score calculator & progress tracker",
    url: "https://play.google.com/store/apps/details?id=com.principiaforge.youscore",
    tags: ["ielts", "score"] },
  { id: "youplan", name: "YouPlan", emoji: "⏱️",
    taglineUz: "Pomodoro, odatlar va mahsuldorlik",
    taglineEn: "Pomodoro, habits & productivity",
    url: "https://play.google.com/store/apps/details?id=com.principiaforge.maqsad",
    tags: ["habit", "productivity"] },
];

export const appById = (id) => APPS.find((a) => a.id === id) || null;

// One card: emoji + name + active-language tagline + a Play button (or, for THIS site,
// a calm "you're here" chip). The name stays lang="en" (a brand); the tagline follows UI lang.
export function appCard(app) {
  const tagline = lang() === "en" ? app.taglineEn : app.taglineUz;
  const card = el("div", { class: "appcard" + (app.current ? " appcard--here" : "") },
    el("span", { class: "appcard__ic", "aria-hidden": "true" }, app.emoji),
    el("div", { class: "appcard__body" },
      el("p", { class: "appcard__name", lang: "en" }, app.name),
      el("p", { class: "appcard__tag" }, tagline)));
  if (app.current) {
    card.append(el("span", { class: "chip appcard__here-tag" }, t("apps.here")));
  } else {
    card.append(el("a", {
      class: "btn btn--soft appcard__cta", href: withUtm(app.url),
      target: "_blank", rel: "noopener noreferrer",
      "aria-label": app.name + " — " + t("apps.open"),
    }, el("span", { class: "appcard__play", "aria-hidden": "true" }, "▶ "), t("apps.open")));
  }
  return card;
}

// A ready-made promo block for embedding on other pages. `ids` picks which apps (in order);
// omit for the whole family. Current app is excluded from embeds by default (shown only on
// the dedicated #/apps page). `heading`/`lead` are already-resolved strings (caller's t()/L()).
export function appsBlock(ids, { heading, lead, excludeCurrent = true } = {}) {
  const chosen = (ids ? ids.map(appById).filter(Boolean) : APPS)
    .filter((a) => !(excludeCurrent && a.current));
  const wrap = el("section", { class: "apps-block" });
  if (heading) wrap.append(el("p", { class: "apps-block__h" }, heading));
  if (lead) wrap.append(el("p", { class: "apps-block__lead" }, lead));
  const grid = el("div", { class: "apps-grid" });
  chosen.forEach((a) => grid.append(appCard(a)));
  wrap.append(grid);
  return wrap;
}

// ---- Public route entry: #/apps (the family home) ---------------------------
export async function renderApps(main, seq, alive) {
  if (alive && !alive()) return;
  const sec = el("section", { class: "screen doc apps-page" });
  sec.append(el("h1", { class: "screen__title" }, t("apps.pageTitle")));
  sec.append(el("p", { class: "doc__lead" }, t("apps.lead")));
  const grid = el("div", { class: "apps-grid" });
  APPS.forEach((a) => grid.append(appCard(a)));   // include THIS site (shows "you're here")
  sec.append(grid);
  if (alive && !alive()) return;
  main.replaceChildren(sec);
}
