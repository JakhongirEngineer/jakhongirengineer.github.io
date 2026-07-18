// settings.js — the Settings screen (04 §2.1), code-split like the other route modules
// (app.js shows screenSkeleton() then dynamic-imports this on #/settings). Consolidates
// the five knobs the spec names: language · pace track · theme · playback rate · data
// (export / import / reset). Rendered as a normal screen in <main> styled as a settings
// panel (routing simplicity, 04 §2.1) — one <h1>.
//
// Ownership: this module NEVER writes shared files. For live-applied settings it dispatches
// a document CustomEvent "yp:setting" {detail:{key,value}} that the shell (app.js) turns
// into the real side effect — uiLang→setLang (re-renders), theme→applyTheme+save+button,
// rate→saveSetting (the player reads settings.rate). `pace` has no shell involvement so it
// is persisted here directly via saveSetting(). DATA uses the S6 progress.js contract
// (exportProgress/previewImport/applyImport/resetProgress) — built to the contract, never
// edited here. Everything degrades quietly if storage/clipboard is unavailable (04 §9).

import { el, icon, t, tf, lang, loadSettings, saveSetting } from "./core.js";
import { exportProgress, previewImport, applyImport, resetProgress } from "./progress.js";

const PACES = ["effortless", "sprint", "gentle"];
const THEMES = ["auto", "light", "dark"];
const RATES = [0.75, 1, 1.25];
const today = () => new Date().toISOString().slice(0, 10);

// Fire the shell hook. app.js owns turning this into the actual live change (see header).
function emit(key, value) {
  document.dispatchEvent(new CustomEvent("yp:setting", { detail: { key, value } }));
}

// ---- A labelled radio group as a card (fieldset + legend = the group's a11y name) ----
// options: [{ value, label:(node|string), sub?:string }]. onPick(value) runs on change.
function radioGroup(name, legendText, options, current, onPick) {
  const fs = el("fieldset", { class: "card set-grp" }, el("legend", { class: "set-grp__h" }, legendText));
  const opts = el("div", { class: "set-opts" });
  options.forEach((o) => {
    const input = el("input", { type: "radio", name, value: String(o.value) });
    if (String(o.value) === String(current)) input.checked = true;
    const body = el("span", { class: "set-opt__body" },
      el("span", { class: "set-opt__lab" }, o.label));
    if (o.sub) body.append(el("span", { class: "set-opt__sub" }, o.sub));
    opts.append(el("label", { class: "set-opt" }, input, body));
  });
  opts.addEventListener("change", (e) => {
    const r = e.target.closest(`input[name="${name}"]`);
    if (r && r.checked) onPick(r.value);
  });
  fs.append(opts);
  return fs;
}

// ---- Public entry -----------------------------------------------------------
export async function renderSettings(main, seq, alive) {
  if (alive && !alive()) return;
  const s = loadSettings();
  const curLang = lang();                                   // authoritative live UI language
  const curPace = PACES.includes(s.pace) ? s.pace : "effortless";
  const curTheme = THEMES.includes(s.theme) ? s.theme : "auto";
  const curRate = RATES.includes(s.rate) ? s.rate : 1;

  const sec = el("section", { class: "screen doc set" });
  sec.append(el("h1", { class: "screen__title" }, t("route.settings.title")));
  sec.append(el("p", { class: "doc__lead" }, t("set.lead")));

  // 1 — Language (live via the shell → re-renders the whole app in the new language)
  sec.append(radioGroup("set-lang", t("set.lang"), [
    { value: "uz", label: el("span", { lang: "uz" }, "Oʻzbekcha") },
    { value: "en", label: el("span", { lang: "en" }, "English") },
  ], curLang, (v) => emit("uiLang", v)));

  // 2 — Pace track (persisted directly; no shell side effect)
  sec.append(radioGroup("set-pace", t("set.pace"), [
    { value: "effortless", label: t("home.onboarding.paceEffortless") },
    { value: "sprint", label: t("home.onboarding.paceSprint") },
    { value: "gentle", label: t("home.onboarding.paceGentle") },
  ], curPace, (v) => { if (PACES.includes(v)) saveSetting("pace", v); }));

  // 3 — Theme (live via the shell: applyTheme + save + top-bar button label)
  sec.append(radioGroup("set-theme", t("theme.toggle"), [
    { value: "auto", label: t("theme.auto") },
    { value: "light", label: t("theme.light") },
    { value: "dark", label: t("theme.dark") },
  ], curTheme, (v) => { if (THEMES.includes(v)) emit("theme", v); }));

  // 4 — Playback rate (live via the shell: saveSetting so the persistent player picks it up)
  sec.append(radioGroup("set-rate", t("set.rate"), [
    { value: 0.75, label: "0.75×", sub: t("set.rateSlow") },
    { value: 1, label: "1×", sub: t("set.rateNormal") },
    { value: 1.25, label: "1.25×", sub: t("set.rateFast") },
  ], curRate, (v) => { const n = Number(v); if (RATES.includes(n)) emit("rate", n); }));

  // 5 — Data (export / import / reset) — the only backend-free way to move devices (02 §8.2)
  sec.append(dataSection());

  if (alive && !alive()) return;
  main.replaceChildren(sec);
}

// ---- Data section -----------------------------------------------------------
function dataSection() {
  const wrap = el("section", { class: "card set-grp set-data" });
  wrap.append(el("h2", { class: "set-grp__h" }, t("set.data")));
  wrap.append(el("p", { class: "set-data__lead" }, t("set.dataLead")));

  // one shared, polite status line for copy/export/error feedback
  const status = el("p", { class: "set-status", role: "status", "aria-live": "polite" });
  const say = (msg, tone) => { status.textContent = msg || ""; status.dataset.tone = tone || ""; };

  // --- Export: download + copy, plus a progressive-disclosure raw view ---
  const dl = el("button", { class: "btn btn--soft", type: "button" },
    el("span", { class: "set-ic", html: icon("download") }), t("set.export"));
  dl.addEventListener("click", () => {
    let data;
    try { data = exportProgress(); } catch { say(t("set.exportFail"), "err"); return; }
    try {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = el("a", { href: url, download: `youspeak-progress-${today()}.json` });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      say(t("set.exported"), "ok");
    } catch { say(t("set.exportFail"), "err"); }
  });

  const rawArea = el("textarea", { class: "set-io", readonly: "", rows: "6", "aria-label": t("set.showJson") });
  const rawDetails = el("details", { class: "set-raw" }, el("summary", {}, t("set.showJson")), rawArea);
  let rawFilled = false;
  rawDetails.addEventListener("toggle", () => {
    if (!rawDetails.open || rawFilled) return;
    try { rawArea.value = exportProgress(); rawFilled = true; } catch { rawArea.value = ""; }
  });

  const copy = el("button", { class: "btn btn--soft", type: "button" }, "📋 " + t("set.copy"));
  copy.addEventListener("click", async () => {
    let data;
    try { data = exportProgress(); } catch { say(t("set.exportFail"), "err"); return; }
    try {
      await navigator.clipboard.writeText(data);
      say(t("set.copied"), "ok");
    } catch {
      // No clipboard permission/API → reveal the raw view + select it for a manual copy.
      rawArea.value = data; rawFilled = true; rawDetails.open = true;
      rawArea.focus(); rawArea.select();
      say(t("set.copyFail"), "err");
    }
  });

  wrap.append(el("div", { class: "set-actions" }, dl, copy), rawDetails);

  // --- Import: file OR paste → previewImport → confirm → applyImport → reload ---
  wrap.append(el("hr", { class: "set-rule" }));
  wrap.append(el("h3", { class: "set-sub" }, t("set.import")));
  wrap.append(el("p", { class: "set-data__lead" }, t("set.importLead")));

  const importArea = el("textarea", { class: "set-io", rows: "5",
    placeholder: t("set.importPlaceholder"), "aria-label": t("set.import") });

  const file = el("input", { type: "file", id: "set-file", accept: ".json,application/json", class: "set-file" });
  const fileLbl = el("label", { class: "btn btn--soft", for: "set-file" },
    el("span", { class: "set-ic", html: icon("doc") }), t("set.chooseFile"));
  file.addEventListener("change", () => {
    const f = file.files && file.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { importArea.value = String(reader.result || ""); say("", ""); };
    reader.onerror = () => say(t("set.fileFail"), "err");
    reader.readAsText(f);
  });

  const importBtn = el("button", { class: "btn btn--primary", type: "button" }, t("set.importBtn"));
  // the confirm/preview panel lives here; rebuilt each attempt, cleared after
  const panel = el("div", { class: "set-panel" });
  const clearPanel = () => panel.replaceChildren();

  importBtn.addEventListener("click", () => {
    clearPanel(); say("", "");
    const text = importArea.value.trim();
    if (!text) { say(t("set.importEmpty"), "err"); return; }
    let res;
    try { res = previewImport(text); } catch { res = { ok: false }; }
    if (!res || !res.ok) { say(res && res.error ? res.error : t("set.importInvalid"), "err"); return; }
    panel.append(importConfirm(text, res.preview, clearPanel, say));
  });

  // file input BEFORE its label so `.set-file:focus-visible + label` can show a focus ring
  wrap.append(el("div", { class: "set-actions" }, file, fileLbl, importBtn), importArea, panel);

  // --- Reset: two-step inline confirm → resetProgress → reload ---
  wrap.append(el("hr", { class: "set-rule" }));
  wrap.append(el("h3", { class: "set-sub set-sub--danger" }, t("set.reset")));
  wrap.append(el("p", { class: "set-data__lead" }, t("set.resetLead")));
  const resetHost = el("div", { class: "set-reset" });
  const resetBtn = el("button", { class: "btn btn--danger", type: "button" },
    el("span", { class: "set-ic", html: icon("close") }), t("set.reset"));
  resetBtn.addEventListener("click", () => resetHost.replaceChildren(resetConfirm(resetHost, resetBtn, say)));
  resetHost.append(resetBtn);
  wrap.append(resetHost);

  wrap.append(status);
  return wrap;
}

// A best-effort human summary of the incoming data. Prefers S6's `preview` when it looks
// like the canonical shape; otherwise reads the raw parsed JSON — so this stays correct
// whatever exact preview shape S6 returns (03 §6.3 is the schema either way).
function summarize(preview, text) {
  let src = (preview && typeof preview === "object" && (preview.metrics || preview.lessons)) ? preview : null;
  if (!src) { try { const o = JSON.parse(text); if (o && typeof o === "object") src = o; } catch { /* noop */ } }
  if (!src) return [];
  const m = (src.metrics && typeof src.metrics === "object") ? src.metrics : {};
  const st = (src.streak && typeof src.streak === "object") ? src.streak : {};
  const lessons = (src.lessons && typeof src.lessons === "object") ? Object.keys(src.lessons).length : 0;
  const badges = Array.isArray(src.badges) ? src.badges.length : 0;
  const rows = [];
  rows.push(tf("set.sumLessons", lessons));
  if (Number.isFinite(m.listeningMinutes)) rows.push(tf("set.sumListening", m.listeningMinutes | 0));
  if (Number.isFinite(m.speakingReps)) rows.push(tf("set.sumSpeaking", m.speakingReps | 0));
  if (Number.isFinite(st.count)) rows.push(tf("set.sumStreak", st.count | 0));
  if (Number.isFinite(m.xp)) rows.push(tf("set.sumXp", m.xp | 0));
  rows.push(tf("set.sumBadges", badges));
  return rows;
}

function importConfirm(text, preview, clearPanel, say) {
  const box = el("div", { class: "set-confirm callout callout--warn" });
  box.append(el("span", { class: "callout__ic", "aria-hidden": "true" }, "⚠️"));
  const body = el("div", {});
  body.append(el("strong", {}, t("set.previewTitle")));
  const rows = summarize(preview, text);
  if (rows.length) {
    const ul = el("ul", { class: "set-sum" });
    rows.forEach((r) => ul.append(el("li", {}, r)));
    body.append(ul);
  }
  body.append(el("p", { class: "set-warn" }, t("set.previewWarn")));
  const go = el("button", { class: "btn btn--primary", type: "button" }, t("set.confirmImport"));
  const cancel = el("button", { class: "btn", type: "button" }, t("set.cancel"));
  cancel.addEventListener("click", () => { clearPanel(); });
  go.addEventListener("click", () => {
    go.disabled = true; cancel.disabled = true;
    let res;
    try { res = applyImport(text); } catch { res = { ok: false }; }
    if (res && res.ok) { say(t("set.imported"), "ok"); setTimeout(() => location.reload(), 350); }
    else { clearPanel(); say(res && res.error ? res.error : t("set.importFail"), "err"); }
  });
  body.append(el("div", { class: "set-actions" }, go, cancel));
  box.append(body);
  requestAnimationFrame(() => cancel.focus());   // draw attention; safe default for a destructive step
  return box;
}

function resetConfirm(host, resetBtn, say) {
  const box = el("div", { class: "set-confirm callout callout--error" });
  box.append(el("span", { class: "callout__ic", "aria-hidden": "true" }, "🗑️"));
  const body = el("div", {});
  body.append(el("strong", {}, t("set.resetAsk")));
  const go = el("button", { class: "btn btn--danger", type: "button" }, t("set.resetConfirm"));
  const cancel = el("button", { class: "btn", type: "button" }, t("set.cancel"));
  cancel.addEventListener("click", () => host.replaceChildren(resetBtn));
  go.addEventListener("click", () => {
    go.disabled = true; cancel.disabled = true;
    try { resetProgress(); } catch { /* even if it throws, reload gives a clean read */ }
    say(t("set.resetDone"), "ok");
    setTimeout(() => location.reload(), 350);
  });
  body.append(el("div", { class: "set-actions" }, go, cancel));
  box.append(body);
  requestAnimationFrame(() => cancel.focus());   // the Delete button was removed — don't lose focus
  return box;
}
