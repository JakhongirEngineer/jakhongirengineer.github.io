// app.js — the persistent shell: i18n bootstrap, hash router, top bar, nav, and the
// sections sheet. Shared primitives (el/icon/t/storage) live in core.js; the docked
// audio player lives in player.js (both part of the shell). The core lesson page
// (lesson.js) and its helpers (progress.js) are dynamically imported only on the
// #/lesson/:id route, so Home/Map first paint never pays for them. Zero deps (03 §4).

import { el, icon, t, tf, lang, setLangState, loadDict, loadSettings, saveSetting } from "./core.js";
import { initPlayer, refreshText as refreshPlayerText } from "./player.js";

// Badge id → i18n label key (ids are NOT the i18n keys). The engine (progress.js) and
// the Progress page (progress-page.js) dispatch document "yp:badge" {ids:[]} on earn;
// the shell shows a brief toast per new id (04 §5.8/§6).
const BADGE_LABEL = {
  "first-step": "badge.first",
  "streak-7": "badge.streak7",
  "streak-30": "badge.streak30",
  "streak-100": "badge.streak100",
  "deep-listener-100": "badge.listener100",
  "deep-listener-500": "badge.listener500",
  "deep-listener-1000": "badge.listener1000",
  "speaker": "badge.speaker",
  "voice": "badge.voice",
  "grammar-guru": "badge.grammar",
  "conversationalist": "badge.conversationalist",
  "a2-foundation": "badge.a2",
  "b1-momentum": "badge.b1",
  "b2-fluency": "badge.b2",
  "comeback": "badge.comeback",
};

// ---- Routes (04 §2.1) — `lesson`/`grammar` take an optional trailing segment ----
const ROUTES = {
  home:     { title: "route.home.title" },
  lessons:  { title: "route.lessons.title" },
  lesson:   { title: "route.lesson.title" },
  method:   { title: "route.method.title" },
  progress: { title: "route.progress.title" },
  ielts:    { title: "route.ielts.title" },
  grammar:  { title: "route.grammar.title" },
  settings: { title: "route.settings.title" },
};
const MENU_ORDER = ["home", "lessons", "method", "progress", "ielts", "grammar", "settings"];
const PRIMARY = [
  { name: "home", icon: "home", label: "nav.home" },
  { name: "lessons", icon: "lessons", label: "nav.lessons" },
  { name: "progress", icon: "progress", label: "nav.progress" },
  { more: true, icon: "more", label: "nav.more" },
];
const routeHash = (name) => (name === "home" ? "#/" : "#/" + name);

// ---- DOM refs ---------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const skip = $("skip"), navBtn = $("navBtn"), ctx = $("ctx"), toplinks = $("toplinks");
const langToggle = $("langToggle"), themeToggle = $("themeToggle"), main = $("main");
const player = $("player"), bottomnav = $("bottomnav"), menu = $("menu");
const menuTitle = $("menuTitle"), menuNav = $("menuNav"), menuClose = $("menuClose");
const menuPanel = menu.querySelector(".menu__panel");

// ---- State ------------------------------------------------------------------
let themeState = "auto";       // "auto" | "light" | "dark"
let booted = false;            // suppresses focus-move on the very first paint
let menuOpener = null;         // element to restore focus to when the sheet closes
let renderSeq = 0;             // guards async lesson renders against fast navigation

// ---- Theme + language application -------------------------------------------
function applyTheme(theme) {
  if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
  else document.documentElement.removeAttribute("data-theme"); // "auto" → prefers-color-scheme
}
const applyLang = (l) => document.documentElement.setAttribute("lang", l);

function updateThemeBtn() {
  const label = `${t("theme.toggle")} — ${t("theme." + themeState)}`;
  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
}
function cycleTheme() {
  const order = ["auto", "light", "dark"];
  themeState = order[(order.indexOf(themeState) + 1) % order.length];
  applyTheme(themeState);
  saveSetting("theme", themeState);
  updateThemeBtn();
}
async function setLang(l) {
  setLangState(l);
  applyLang(l);
  saveSetting("uiLang", l);
  await loadDict(l);
  refreshText();
  render(); // re-render the current screen + shell context in the new language
}

// ---- Shell text + nav (rebuilt on language change) --------------------------
function refreshText() {
  skip.textContent = t("skip");
  menuTitle.textContent = t("menu.title");
  document.title = t("app.title");
  langToggle.setAttribute("aria-label", t("lang.toggle"));
  menuClose.setAttribute("aria-label", t("menu.close"));
  menuPanel.setAttribute("aria-label", t("menu.title"));
  menuNav.setAttribute("aria-label", t("nav.section"));
  bottomnav.setAttribute("aria-label", t("nav.primary"));
  toplinks.setAttribute("aria-label", t("nav.primary"));
  player.setAttribute("aria-label", t("player.label"));
  updateThemeBtn();
  refreshPlayerText();
  // Re-translate any live global banner + its dismiss control on the UZ|EN toggle.
  if (bannersEl) {
    bannersEl.querySelectorAll(".appbanner__text[data-k]").forEach((s) => { s.textContent = t(s.dataset.k); });
    bannersEl.querySelectorAll(".appbanner__close").forEach((b) => { b.setAttribute("aria-label", t("banner.dismiss")); b.title = t("banner.dismiss"); });
  }
  buildNav();
}

function navItem(item, bottom) {
  const cls = bottom ? "bottomnav__item" : "toplink";
  const label = t(item.label);
  const contents = [el("span", { class: "navicon", html: icon(item.icon) }), el("span", { class: "navlabel" }, label)];
  if (item.more) {
    return el("button", { class: cls, type: "button", "data-nav": "more", "data-more": "", "aria-haspopup": "true", "aria-label": label }, contents);
  }
  return el("a", { class: cls, "data-nav": item.name, href: routeHash(item.name) }, contents);
}
function buildNav() {
  bottomnav.replaceChildren(...PRIMARY.map((i) => navItem(i, true)));
  toplinks.replaceChildren(...PRIMARY.map((i) => navItem(i, false)));
  menuNav.replaceChildren(
    ...MENU_ORDER.map((name) =>
      el("a", { class: "menu__link", "data-nav": name, href: routeHash(name) }, t(ROUTES[name].title))
    )
  );
}

function primaryKeyFor(route) {
  if (route === "home") return "home";
  if (route === "lessons" || route === "lesson") return "lessons";
  if (route === "progress") return "progress";
  return "more";
}
function setActive(route) {
  const key = primaryKeyFor(route);
  for (const container of [bottomnav, toplinks]) {
    container.querySelectorAll("[data-nav]").forEach((node) => {
      const on = node.dataset.nav === key;
      node.classList.toggle("is-active", on);
      if (node.tagName === "A") on ? node.setAttribute("aria-current", "page") : node.removeAttribute("aria-current");
    });
  }
  menuNav.querySelectorAll(".menu__link").forEach((a) => {
    const on = a.dataset.nav === route;
    a.classList.toggle("is-active", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
}

// ---- Router (03 §7, 04 §2.1) ------------------------------------------------
function parseRoute() {
  const segs = location.hash.replace(/^#/, "").split("/").filter(Boolean);
  if (segs.length === 0) return { route: "home", params: {} };
  const [head, tail] = segs;
  switch (head) {
    case "lessons":  return segs.length === 1 ? { route: "lessons", params: {} } : null;
    case "lesson":   return segs.length === 2 ? { route: "lesson", params: { id: tail } } : null;
    case "method":   return segs.length === 1 ? { route: "method", params: {} } : null;
    case "progress": return segs.length === 1 ? { route: "progress", params: {} } : null;
    case "ielts":    return segs.length === 1 ? { route: "ielts", params: {} } : null;
    case "grammar":  return segs.length <= 2 ? { route: "grammar", params: { unit: tail || null } } : null;
    case "settings": return segs.length === 1 ? { route: "settings", params: {} } : null;
    default:         return null;
  }
}

// Immediate skeleton for the code-split screens (04 §9 — blocks, not spinners),
// shown before the dynamic import resolves so the route never flashes empty.
function screenSkeleton() {
  const s = el("div", { class: "lesson-skel", "aria-hidden": "true" });
  for (let i = 0; i < 3; i++) s.append(el("div", { class: "skel-card" }));
  return s;
}

// Placeholder screen for the not-yet-built routes (real screens land in later slices).
function buildScreen(route, params) {
  const section = el("section", { class: "screen" },
    el("h1", { class: "screen__title" }, t(ROUTES[route].title)),
    el("p", { class: "placeholder" }, t("placeholder.body"))
  );
  if (route === "lesson") {
    section.append(
      el("p", { class: "placeholder placeholder--meta" }, `${t("placeholder.lesson")}: `,
        el("code", { lang: "en" }, params.id || ""))
    );
  }
  return section;
}

function updateTopbar(route) {
  ctx.textContent = route === "home" ? t("app.name") : t(ROUTES[route].title);
  const isLesson = route === "lesson";
  navBtn.innerHTML = icon(isLesson ? "back" : "menu");
  navBtn.setAttribute("aria-label", t(isLesson ? "action.back" : "menu.open"));
  navBtn.dataset.mode = isLesson ? "back" : "menu";
}

async function render() {
  const match = parseRoute();
  if (!match) { location.replace("#/"); return; } // unknown hash → home (04 §2.1)
  const { route, params } = match;
  const seq = ++renderSeq;
  const alive = () => seq === renderSeq;   // false once a newer navigation started
  closeMenu();
  updateTopbar(route);
  setActive(route);
  window.scrollTo(0, 0);
  if (route === "lesson") {
    try {
      const mod = await import("./lesson.js");   // code-split: only on the lesson route
      if (!alive()) return;
      await mod.renderLesson(main, params.id, seq, alive);
    } catch (err) {
      console.error("lesson module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("lesson", params));
    }
  } else if (route === "home") {
    main.replaceChildren(screenSkeleton());       // skeleton immediately, then swap (S5)
    try {
      const mod = await import("./home.js");       // code-split like lesson.js — off the first-paint path
      if (!alive()) return;
      await mod.renderHome(main, seq, alive);
    } catch (err) {
      console.error("home module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("home", params));
    }
  } else if (route === "lessons") {
    main.replaceChildren(screenSkeleton());
    try {
      const mod = await import("./lessons.js");    // code-split: the curriculum map (S5)
      if (!alive()) return;
      await mod.renderMap(main, seq, alive);
    } catch (err) {
      console.error("lessons module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("lessons", params));
    }
  } else if (route === "progress") {
    main.replaceChildren(screenSkeleton());
    try {
      const mod = await import("./progress-page.js");   // code-split (S6)
      if (!alive()) return;
      await mod.renderProgress(main, seq, alive);
    } catch (err) {
      console.error("progress module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("progress", params));
    }
  } else if (route === "method") {
    main.replaceChildren(screenSkeleton());
    try {
      const mod = await import("./method.js");          // code-split (S9)
      if (!alive()) return;
      await mod.renderMethod(main, seq, alive);
    } catch (err) {
      console.error("method module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("method", params));
    }
  } else if (route === "ielts") {
    main.replaceChildren(screenSkeleton());
    try {
      const mod = await import("./ielts.js");           // code-split (S10)
      if (!alive()) return;
      await mod.renderIelts(main, seq, alive);
    } catch (err) {
      console.error("ielts module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("ielts", params));
    }
  } else if (route === "grammar") {
    main.replaceChildren(screenSkeleton());
    try {
      const mod = await import("./grammar.js");         // code-split (S10); reads #/grammar/<unit> from the hash itself
      if (!alive()) return;
      await mod.renderGrammar(main, seq, alive);
    } catch (err) {
      console.error("grammar module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("grammar", params));
    }
  } else if (route === "settings") {
    main.replaceChildren(screenSkeleton());
    try {
      const mod = await import("./settings.js");        // code-split (S10); imports S6's export/import API
      if (!alive()) return;
      await mod.renderSettings(main, seq, alive);
    } catch (err) {
      console.error("settings module failed to load", err);
      if (alive()) main.replaceChildren(buildScreen("settings", params));
    }
  } else {
    main.replaceChildren(buildScreen(route, params));   // unknown route — defensive fallback
  }
  if (alive() && booted) main.focus({ preventScroll: true });
}

// ---- Sections sheet (menu) with a focus trap (a11y §8) ----------------------
const focusables = () => [...menuPanel.querySelectorAll("a[href], button:not([disabled])")];
function openMenu(opener) {
  if (!menu.hidden) return;
  menuOpener = opener || navBtn;
  menu.hidden = false;
  (focusables()[0] || menuPanel).focus();
  document.addEventListener("keydown", onMenuKey);
}
function closeMenu() {
  if (menu.hidden) return;
  menu.hidden = true;
  document.removeEventListener("keydown", onMenuKey);
  if (menuOpener && document.contains(menuOpener)) menuOpener.focus();
  menuOpener = null;
}
function onMenuKey(e) {
  if (e.key === "Escape") { closeMenu(); return; }
  if (e.key !== "Tab") return;
  const f = focusables();
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function goBack() {
  if (history.length > 1) history.back();
  else location.hash = "#/lessons";
}

// ---- Badge earn-toast (04 §5.8/§6) — non-modal, never steals focus, auto-dismisses.
// Lives outside #main (fixed overlay) so it survives route re-renders. Reduced-motion is
// handled by the global CSS rule (the transition collapses to instant). .toast/.toast.is-show
// come from the merged styles.css.
function toast(text) {
  const node = el("div", { class: "toast", role: "status", "aria-live": "polite", "aria-atomic": "true" }, text);
  document.body.appendChild(node);
  requestAnimationFrame(() => node.classList.add("is-show"));
  setTimeout(() => { node.classList.remove("is-show"); setTimeout(() => node.remove(), 300); }, 3500);
}

// ---- Global banners (04 §9) — media-host-down + localStorage-unavailable ------
// Both live in a region OUTSIDE #main (between <header> and <main>) so they survive route
// re-renders; both are dismissible, non-modal and never steal focus. They only INFORM —
// the app stays fully navigable and all text keeps working (04 §9). Reduced-motion + the
// sticky-under-topbar placement come from the merged CSS (.appbanner*). The text span
// carries data-k so refreshText() re-translates a live banner on the UZ|EN toggle.
let bannersEl = null;
function bannersRegion() {
  if (bannersEl && document.contains(bannersEl)) return bannersEl;
  bannersEl = el("div", { class: "appbanners", id: "ypBanners" });
  main.before(bannersEl);   // main.replaceChildren() only touches main's children, never this sibling
  return bannersEl;
}
function makeBanner(cls, key, { onClose } = {}) {
  const node = el("div", { class: "appbanner " + cls, role: "status", "aria-live": "polite", "aria-atomic": "true" },
    el("span", { class: "appbanner__ic", "aria-hidden": "true" }, "⚠️"),
    el("span", { class: "appbanner__text", "data-k": key }, t(key)),
    el("button", { class: "iconbtn appbanner__close", type: "button", "aria-label": t("banner.dismiss"),
      title: t("banner.dismiss"), html: icon("close"), onclick: () => { node.remove(); if (onClose) onClose(); } }));
  bannersRegion().append(node);
  return node;
}

// localStorage unavailable (private mode / quota): one non-blocking probe at boot (04 §9).
// Lessons + audio still work; only progress tracking pauses.
let storageBanner = null;
function checkStorage() {
  let ok = true;
  try { const k = "ess.probe"; localStorage.setItem(k, "1"); localStorage.removeItem(k); } catch { ok = false; }
  if (!ok && !(storageBanner && document.contains(storageBanner))) storageBanner = makeBanner("appbanner--storage", "banner.storage");
}

// Media host down (global, 04 §9): raise ONE dismissible banner once several DISTINCT tracks
// fail (a single track retried repeatedly is one entry, not "several"). A later successful
// play clears the memory so the banner can return if the host breaks again. Per-track inline
// retry lives in the lesson page + the docked player; this is only the app-wide notice.
const failedTracks = new Set();
let mediaBanner = null, mediaBannerDismissed = false;
function onPlayerSignal(e) {
  const d = (e && e.detail) || {};
  if (d.error) {
    failedTracks.add((d.lessonId || "") + ":" + (d.key || ""));
    if (failedTracks.size >= 2 && !(mediaBanner && document.contains(mediaBanner)) && !mediaBannerDismissed)
      mediaBanner = makeBanner("appbanner--media", "banner.media", { onClose: () => { mediaBanner = null; mediaBannerDismissed = true; } });
  } else if (d.playing) {
    failedTracks.clear();
    mediaBannerDismissed = false;
    if (mediaBanner) { mediaBanner.remove(); mediaBanner = null; }
  }
}

// ---- Wiring -----------------------------------------------------------------
function wireEvents() {
  window.addEventListener("hashchange", render);
  navBtn.addEventListener("click", () => (navBtn.dataset.mode === "back" ? goBack() : openMenu(navBtn)));
  langToggle.addEventListener("click", () => setLang(lang() === "uz" ? "en" : "uz"));
  themeToggle.addEventListener("click", cycleTheme);

  // Player emits "yp:player" on every state change; the shell watches it only to raise the
  // GLOBAL media-down banner (04 §9) — inline per-track handling lives in the player/lesson.
  document.addEventListener("yp:player", onPlayerSignal);

  // Progress engine / page dispatch "yp:badge" {ids:[]} when new badges are earned — show
  // one brief toast per id, lightly staggered (04 §6).
  document.addEventListener("yp:badge", (e) => {
    const ids = (e.detail && e.detail.ids) || [];
    ids.forEach((id, i) => setTimeout(() => toast(tf("toast.badge", t(BADGE_LABEL[id] || id))), i * 400));
  });

  // Settings screen dispatches "yp:setting" {key,value} for shell-applied settings; the shell
  // turns it into the live change (uiLang→setLang; theme→apply+persist; rate→persist). `pace`
  // is persisted by settings.js itself (03 §7 / 04 §2.1).
  document.addEventListener("yp:setting", (e) => {
    const d = e && e.detail;
    if (!d) return;
    if (d.key === "uiLang" && (d.value === "uz" || d.value === "en")) {
      setLang(d.value);
    } else if (d.key === "theme" && ["auto", "light", "dark"].includes(d.value)) {
      themeState = d.value;
      applyTheme(themeState);
      saveSetting("theme", themeState);
      updateThemeBtn();
    } else if (d.key === "rate" && [0.75, 1, 1.25].includes(d.value)) {
      saveSetting("rate", d.value);
    }
  });

  const onNavClick = (e) => {
    const more = e.target.closest("[data-more]");
    if (more) { e.preventDefault(); openMenu(more); }
  };
  bottomnav.addEventListener("click", onNavClick);
  toplinks.addEventListener("click", onNavClick);

  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeMenu();
    else if (e.target.closest("a")) closeMenu();
  });
}

// ---- Boot -------------------------------------------------------------------
async function init() {
  const s = loadSettings();
  setLangState(s.uiLang === "en" ? "en" : "uz");
  themeState = ["auto", "light", "dark"].includes(s.theme) ? s.theme : "auto";
  applyLang(lang());
  applyTheme(themeState); // idempotent with the no-flash script; normalises "auto"

  initPlayer();           // create the persistent <audio> + docked bar (03 §7)
  await loadDict(lang());
  refreshText();          // shell text + nav in the active language
  wireEvents();
  checkStorage();         // non-blocking localStorage-unavailable banner (04 §9), dict now loaded
  render();               // paint the first screen
  booted = true;
}
init();
