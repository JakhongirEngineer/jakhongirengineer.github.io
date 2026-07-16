// app.js — the persistent shell: i18n bootstrap, hash router, top bar, nav, and the
// sections sheet. Shared primitives (el/icon/t/storage) live in core.js; the docked
// audio player lives in player.js (both part of the shell). The core lesson page
// (lesson.js) and its helpers (progress.js) are dynamically imported only on the
// #/lesson/:id route, so Home/Map first paint never pays for them. Zero deps (03 §4).

import { el, icon, t, lang, setLangState, loadDict, loadSettings, saveSetting } from "./core.js";
import { initPlayer, refreshText as refreshPlayerText } from "./player.js";

// ---- Routes (04 §2.1) — `lesson`/`grammar` take an optional trailing segment ----
const ROUTES = {
  home:     { title: "route.home.title" },
  lessons:  { title: "route.lessons.title" },
  lesson:   { title: "route.lesson.title" },
  method:   { title: "route.method.title" },
  progress: { title: "route.progress.title" },
  ielts:    { title: "route.ielts.title" },
  grammar:  { title: "route.grammar.title" },
  about:    { title: "route.about.title" },
  settings: { title: "route.settings.title" },
};
const MENU_ORDER = ["home", "lessons", "method", "progress", "ielts", "grammar", "about", "settings"];
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
    case "about":    return segs.length === 1 ? { route: "about", params: {} } : null;
    case "settings": return segs.length === 1 ? { route: "settings", params: {} } : null;
    default:         return null;
  }
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
  } else {
    main.replaceChildren(buildScreen(route, params));
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

// ---- Wiring -----------------------------------------------------------------
function wireEvents() {
  window.addEventListener("hashchange", render);
  navBtn.addEventListener("click", () => (navBtn.dataset.mode === "back" ? goBack() : openMenu(navBtn)));
  langToggle.addEventListener("click", () => setLang(lang() === "uz" ? "en" : "uz"));
  themeToggle.addEventListener("click", cycleTheme);

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
  render();               // paint the first screen
  booted = true;
}
init();
