// lesson-fun.js — section ⑧ "Zavq bilan / Fun English" (04 §4.3 ⑧ + behavior 9; §5.9;
// §9 blocked/error fallback). A click-to-load YouTube FACADE: the section fetches
// 0 bytes from YouTube / ytimg / any Google host UNTIL the learner taps play — the
// single biggest first-paint win (03 §7, 03 §8 "YouTube (pre-tap) = 0 KB").
//
// The pre-tap poster is a pure CSS-GRADIENT box (never an img.youtube.com / ytimg
// thumbnail — that would itself be a YouTube byte); the youtube-nocookie iframe is
// injected ONLY on tap, and that tap is the ONLY point any YouTube byte is fetched.
//
// The video pick is DATA, never code: it reads l.funEnglish[0]; the id is NEVER
// hardcoded here (a dead video is a JSON fix, 04 §4.3 behavior 9 / 02 §4). Three shapes:
//   • id present  → tap ▶ injects the iframe, moves focus in, marks the `fun` step.
//   • id === null → uncurated lesson (most lessons today): the play control becomes a
//                   "YouTube'da qidirish / Search on YouTube" link (never a dead button,
//                   04 §9) + a small "Koʻrdim / Watched" honor acknowledge so 2★ stays
//                   reachable on uncurated lessons.
//   • iframe blocked/failed → an "Open on YouTube" link surfaces; the watch-task stays.
//
// Lazily imported by lesson.js ONLY on the lesson route (03 §4), alongside
// lesson-episodes.js / lesson-speak.js. Leaf imports only (core.js); the step callback
// (markFun) is INJECTED via ctx, mirroring markEp/markSix — so no import cycle.

import { el, icon, t, tf } from "./core.js";

const YT_NOCOOKIE = "https://www.youtube-nocookie.com/embed/";
const YT_WATCH = "https://www.youtube.com/watch?v=";
const YT_SEARCH = "https://www.youtube.com/results?search_query=";

// The title/channel caption — shared by the play button (id present) and the search
// link (id null); English content carries lang="en" (a11y §8 / 02 §9).
function caption(title, channel) {
  return el("span", { class: "fun__cap" },
    el("span", { class: "fun__title", lang: "en" }, title),
    channel ? el("span", { class: "fun__chan", lang: "en" }, channel) : null);
}

// The tiny watch-task (02 §2 ⑧: a prompt, no test) — stays visible in every state.
function watchTask() {
  return el("p", { class: "fun__task" },
    el("span", { class: "fun__task-ic", "aria-hidden": "true" }, "📺 "), t("lesson.fun.watchTask"));
}

// ── Public entry: build the section ⑧ card ───────────────────────────────────────────
export function funSection(id, l, ctx) {
  const f = (Array.isArray(l.funEnglish) && l.funEnglish[0]) || {};
  const vid = (typeof f.id === "string" && f.id) ? f.id : null;   // NEVER a code constant — from JSON
  const title = f.title || "";
  const channel = f.channel || "";
  const card = el("div", { class: "card fun" });

  // Uzbek framing line — sets the relaxed-watching intent (02 §2 ⑧, 02 §9).
  card.append(el("p", { class: "fun__frame" }, t("lesson.fun.body")));

  const facade = el("div", { class: "fun__facade" });
  card.append(facade);

  if (vid) {
    // ── Curated pick: a CSS-gradient poster whose ▶ injects the iframe on tap ──────
    const play = el("button", { class: "fun__stage", type: "button", "aria-label": tf("lesson.fun.playAria", title) },
      el("span", { class: "fun__glyph", "aria-hidden": "true", html: icon("play") }),
      caption(title, channel));
    play.addEventListener("click", () => injectVideo(facade, vid, title, ctx));
    facade.append(play);
    card.append(watchTask());
  } else {
    // ── Uncurated (id:null): search link + honor "Koʻrdim" (2★ stays reachable) ────
    const search = el("a", { class: "fun__stage", href: YT_SEARCH + encodeURIComponent(title),
      target: "_blank", rel: "noopener noreferrer", "aria-label": tf("lesson.fun.searchAria", title) },
      el("span", { class: "fun__glyph", "aria-hidden": "true" }, "🔍"),
      caption(title, channel),
      el("span", { class: "fun__searchlab", "aria-hidden": "true" }, t("lesson.fun.search"), " ↗"));
    facade.append(search);
    card.append(watchTask());

    const fb = el("p", { class: "fun__fb", "aria-live": "polite" });
    const watched = el("button", { class: "btn btn--soft fun__watched", type: "button", "aria-pressed": "false" },
      el("span", { "aria-hidden": "true" }, "✓ "), t("check.funWatch"));
    watched.addEventListener("click", () => {
      watched.classList.add("is-done"); watched.disabled = true; watched.setAttribute("aria-pressed", "true");
      fb.textContent = t("lesson.fun.watchedMsg");
      ctx.markFun();                                            // acknowledge marks the `fun` step (→ 2★)
    });
    card.append(watched, fb);
  }
  return card;
}

// ── On tap: inject the ONE youtube-nocookie iframe (the ONLY YouTube byte) ────────────
function injectVideo(facade, vid, title, ctx) {
  const iframe = el("iframe", {
    class: "fun__iframe",
    src: YT_NOCOOKIE + encodeURIComponent(vid) + "?autoplay=1&rel=0",
    title: title || t("lesson.sec.8"),                          // the video title; never empty (a11y §8)
    allow: "autoplay; encrypted-media; picture-in-picture",
    allowfullscreen: "", loading: "lazy", frameborder: "0",
    referrerpolicy: "strict-origin-when-cross-origin",
  });
  const embed = el("div", { class: "fun__embed" }, iframe);

  // §9 fallback — always offer "Open on YouTube": it covers an embed that loads a
  // "video unavailable" page (cross-origin, so JS-undetectable) AND is the visible
  // action if the iframe hard-fails below. The watch-task above stays untouched.
  const blockedMsg = el("p", { class: "fun__blocked-msg", hidden: "" }, t("lesson.fun.blocked"));
  const openLink = el("a", { class: "fun__escape", href: YT_WATCH + encodeURIComponent(vid),
    target: "_blank", rel: "noopener noreferrer" },
    t("lesson.fun.open"), el("span", { "aria-hidden": "true" }, " ↗"));
  iframe.addEventListener("error", () => { embed.classList.add("is-blocked"); blockedMsg.hidden = false; });

  facade.replaceWith(embed);
  embed.after(blockedMsg, openLink);
  ctx.markFun();                                                // tapping play satisfies `fun` (→ 2★)
  try { iframe.focus(); } catch { /* focus is a nicety, never fatal */ }
}
