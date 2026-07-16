// app.js — the entire "framework": i18n, hash router, and the persistent shell.
// Zero runtime dependencies (03 §4). Lessons are data, not code, so this file stays
// flat as the catalogue grows. S0 renders placeholder screens only; later slices fill
// them in. config.js (mediaUrl) is imported when media arrives in S2/S3.

// Data URLs are resolved against THIS module's location, not the document, so every
// fetch is correct under the /english-self-study/ subpath regardless of the hash route.
const DATA_BASE = new URL("../data/", import.meta.url);
const LS_KEY = "ess.progress.v1"; // canonical settings live at .settings (03 §6.3)

// ---- Routes -----------------------------------------------------------------
// The 9 routes of 04 §2.1. `lesson` and `grammar` take an optional trailing segment.
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
// The sections sheet lists every top-level route (not `lesson`, reached from the map).
const MENU_ORDER = ["home", "lessons", "method", "progress", "ielts", "grammar", "about", "settings"];
// Primary nav (bottom nav on mobile, top-bar links on desktop): 3 links + the More opener.
const PRIMARY = [
  { name: "home", icon: "home", label: "nav.home" },
  { name: "lessons", icon: "lessons", label: "nav.lessons" },
  { name: "progress", icon: "progress", label: "nav.progress" },
  { more: true, icon: "more", label: "nav.more" },
];

const routeHash = (name) => (name === "home" ? "#/" : "#/" + name);

// ---- Icons: inline SVG line icons (04 §7.6), 0 KB, currentColor -------------
const ICONS = {
  menu:     '<path d="M4 7h16M4 12h16M4 17h16"/>',
  back:     '<path d="M15 5l-7 7 7 7"/>',
  home:     '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
  lessons:  '<path d="M5 5h14M5 12h14M5 19h9"/>',
  progress: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  more:     '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// ---- DOM refs ---------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const skip = $("skip"), navBtn = $("navBtn"), ctx = $("ctx"), toplinks = $("toplinks");
const langToggle = $("langToggle"), themeToggle = $("themeToggle"), main = $("main");
const player = $("player"), bottomnav = $("bottomnav"), menu = $("menu");
const menuTitle = $("menuTitle"), menuNav = $("menuNav"), menuClose = $("menuClose");
const menuPanel = menu.querySelector(".menu__panel");

// ---- State ------------------------------------------------------------------
const dicts = {};              // { uz: {...}, en: {...} } — lazily fetched, cached
let currentLang = "uz";        // Uzbek is the default (03 §8)
let themeState = "auto";       // "auto" | "light" | "dark"
let booted = false;            // suppresses focus-move on the very first paint
let menuOpener = null;         // element to restore focus to when the sheet closes

// ---- Tiny DOM helper (avoids innerHTML for dynamic/user-facing text) --------
function el(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (attrs[k] == null) continue;
    if (k === "class") node.className = attrs[k];
    else if (k === "html") node.innerHTML = attrs[k]; // only trusted static SVG strings
    else node.setAttribute(k, attrs[k]);
  }
  for (const kid of kids.flat()) {
    if (kid == null) continue;
    node.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return node;
}

// ---- Settings persistence (03 §6.3) -----------------------------------------
// Touch ONLY .settings so we stay forward-compatible with the S5 progress engine.
// All storage access is wrapped so private-mode / quota failures degrade silently
// (the toggles still work for the session; 04 §9).
function loadSettings() {
  try {
    const obj = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return (obj && typeof obj.settings === "object" && obj.settings) || {};
  } catch { return {}; }
}
function saveSetting(key, value) {
  try {
    const obj = JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {};
    if (typeof obj.settings !== "object" || !obj.settings) obj.settings = {};
    obj.settings[key] = value;
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch { /* storage unavailable — non-blocking (03 §6.3, 04 §9) */ }
}

// ---- i18n -------------------------------------------------------------------
async function loadDict(lang) {
  if (dicts[lang]) return dicts[lang];
  try {
    const res = await fetch(new URL(`i18n/ui.${lang}.json`, DATA_BASE));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dicts[lang] = await res.json();
  } catch (err) {
    console.warn(`i18n: could not load ui.${lang}.json`, err);
    dicts[lang] = {}; // t() then falls back to the raw key rather than crashing
  }
  return dicts[lang];
}
const t = (key) => {
  const d = dicts[currentLang] || {};
  return key in d ? d[key] : key;
};

// ---- Theme + language application -------------------------------------------
function applyTheme(theme) {
  // "auto" => no attribute, so prefers-color-scheme drives it (matches the no-flash script).
  if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
  else document.documentElement.removeAttribute("data-theme");
}
const applyLang = (lang) => document.documentElement.setAttribute("lang", lang);

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

async function setLang(lang) {
  currentLang = lang;
  applyLang(lang);
  saveSetting("uiLang", lang);
  await loadDict(lang);
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

// Which primary destination "owns" the current route (for the active indicator).
function primaryKeyFor(route) {
  if (route === "home") return "home";
  if (route === "lessons" || route === "lesson") return "lessons";
  if (route === "progress") return "progress";
  return "more"; // method / ielts / grammar / about / settings
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
// Returns { route, params } or null for an unknown hash (→ redirect to #/).
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

// S0 placeholder screen: one <h1> per screen (a11y §8) + a short note.
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

function render() {
  const match = parseRoute();
  if (!match) { location.replace("#/"); return; } // unknown hash → home (04 §2.1)
  const { route, params } = match;
  closeMenu();
  main.replaceChildren(buildScreen(route, params));
  updateTopbar(route);
  setActive(route);
  window.scrollTo(0, 0); // reset scroll on route change (04 §3)
  if (booted) main.focus({ preventScroll: true }); // move SR focus to the new screen
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
  langToggle.addEventListener("click", () => setLang(currentLang === "uz" ? "en" : "uz"));
  themeToggle.addEventListener("click", cycleTheme);

  const onNavClick = (e) => {
    const more = e.target.closest("[data-more]");
    if (more) { e.preventDefault(); openMenu(more); }
  };
  bottomnav.addEventListener("click", onNavClick);
  toplinks.addEventListener("click", onNavClick);

  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeMenu();
    else if (e.target.closest("a")) closeMenu(); // navigating to the current route won't fire hashchange
  });
}

// ---- Boot -------------------------------------------------------------------
async function init() {
  const s = loadSettings();
  currentLang = s.uiLang === "en" ? "en" : "uz";
  themeState = ["auto", "light", "dark"].includes(s.theme) ? s.theme : "auto";
  applyLang(currentLang);
  applyTheme(themeState); // idempotent with the no-flash script; also normalises "auto"

  await loadDict(currentLang);
  refreshText(); // sets shell text + builds nav in the active language
  wireEvents();
  render();      // paint the first screen
  booted = true;
}

init();
