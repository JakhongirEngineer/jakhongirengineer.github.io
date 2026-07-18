// about.js — the About page (#/about, 04 §4.7), code-split. Bilingual. Says plainly what
// YouSpeak is, credits the Effortless English method it is built on, states the honest
// free / no-login / nothing-uploaded promise, and carries the LICENSING note (media is the
// owner's responsibility and lives in a swappable bucket behind one MEDIA_BASE; grammar is
// original prose; source materials belong to their owners — 03 §9 / 00 §6). Contact
// principiaforge@gmail.com; links back to the Principia Forge family. One <h1>. No fetch.
//
// lang policy: switchable t() strings carry NO lang (they inherit <html lang>); only fixed
// English tokens (source works/owners, the email) get an explicit lang="en".

import { el, t } from "./core.js";

const CONTACT_EMAIL = "principiaforge@gmail.com";

// Honest source attribution (00 §6 / 03 §9) — proper nouns kept as-is; each line is a
// {owner, work} the on-site experience adapts or links to, never redistributes freely.
const SOURCES = [
  { work: "Power English / Effortless English", owner: "AJ Hoge" },
  { work: "EnglishPod", owner: "Praxis Language Ltd." },
  { work: "6 Minute English", owner: "BBC" },
  { work: "Essential Grammar in Use", owner: "Cambridge University Press (Raymond Murphy)" },
];

const PROMISES = ["about.free1", "about.free2", "about.free3", "about.free4"];

function block(titleKey, bodyKey) {
  return el("section", { class: "about-blk" },
    el("h2", { class: "doc__h" }, t(titleKey)),
    el("p", { class: "doc__p" }, t(bodyKey)));
}

// ---- Public entry -----------------------------------------------------------
export async function renderAbout(main, seq, alive) {
  if (alive && !alive()) return;
  const sec = el("section", { class: "screen doc about" });
  sec.append(el("h1", { class: "screen__title" }, t("route.about.title")));

  sec.append(el("p", { class: "about-hero", "aria-hidden": "true" }, "🎧🗣️"));
  sec.append(el("p", { class: "doc__lead" }, t("about.lead")));

  // What this is
  sec.append(block("about.whatTitle", "about.whatBody"));

  // Method credit
  sec.append(block("about.methodTitle", "about.methodBody"));

  // Free / no-login promise — as a scannable list
  sec.append(el("h2", { class: "doc__h" }, t("about.freeTitle")));
  const ul = el("ul", { class: "about-promise" });
  PROMISES.forEach((k) => ul.append(el("li", {},
    el("span", { class: "about-promise__ic", "aria-hidden": "true" }, "✓"), t(k))));
  sec.append(ul);

  // Licensing note (the honest, load-bearing part)
  sec.append(el("h2", { class: "doc__h" }, t("about.licenseTitle")));
  sec.append(el("div", { class: "callout callout--contrast" },
    el("span", { class: "callout__ic", "aria-hidden": "true" }, "⚖️"),
    el("div", {}, el("strong", {}, t("about.licenseHead")), el("p", {}, t("about.licenseBody")))));
  sec.append(el("p", { class: "doc__p about-src__lead" }, t("about.sourcesLead")));
  const src = el("ul", { class: "about-src" });
  SOURCES.forEach((s) => src.append(el("li", {},
    el("span", { class: "about-src__work", lang: "en" }, s.work),
    el("span", { class: "about-src__sep", "aria-hidden": "true" }, " — "),
    el("span", { class: "about-src__owner", lang: "en" }, s.owner))));
  sec.append(src);

  // Contact
  sec.append(el("h2", { class: "doc__h" }, t("about.contactTitle")));
  sec.append(el("p", { class: "doc__p" }, t("about.contactBody")));
  sec.append(el("a", { class: "btn btn--soft about-contact", href: "mailto:" + CONTACT_EMAIL },
    el("span", { "aria-hidden": "true" }, "✉️ "),
    el("span", { lang: "en" }, CONTACT_EMAIL)));

  // Principia Forge family
  sec.append(block("about.familyTitle", "about.familyBody"));
  sec.append(el("p", { class: "about-foot" }, t("about.foot")));

  if (alive && !alive()) return;
  main.replaceChildren(sec);
}
