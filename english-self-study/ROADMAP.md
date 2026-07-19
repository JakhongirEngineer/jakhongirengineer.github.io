# ROADMAP — English Self-Study (working name: **YouSpeak**)

Spec-Driven Development (SDD) progress tracker. We build the site one **slice** at a time.
This file is the single running checklist — **update it every session** (tick deliverables, set the board row, move the *Current slice* pointer).

> ### Design change — 2026-07-17 · owner curriculum redefinition
> The owner **redefined the curriculum** (`specs/02-curriculum.md` fully rewritten). The elementary Murphy *Essential Grammar in Use* ladder is **retired** — anyone who can follow AJ Hoge is past `am/is/are`; Murphy is now an **optional download only**, and on-site grammar is **original**, authored B1→B2 for this audience. The **lesson shape changed:** each of the **30 weekly lessons** is now *one whole AJ Hoge lesson (MAIN + VOCAB + MINI_STORY + POV — **never divided/cropped**) + two original grammar topics + one EnglishPod episode + one 6 Minute English episode*, all rendered as sections **inside one lesson page** (a week's worth of study). **There are no separate supplementary lessons and no `supp-*` routes** — EnglishPod & 6ME fold in as sections ⑥/⑦; EnglishPod is `null`-gated on L15 & L22. Lesson ids/routes are unchanged (`core-NN`); the shipped lesson-page **look & feel is approved and extended, not redesigned**.
> **Specs amended in place:** `02` (rewritten by the owner), `03` (§6.1 index, §6.2 lesson JSON → schemaVersion **2**, §6.3 progress steps, §5 pipeline, §3 layout, §4 module note, §8 budget), `04` (§2 routes, §4.2 map, §4.3 eleven-section page, §4.4 EP/6ME section flows, §5 components), `00` (§4/§7), `01`. `content/` untouched. The `data/lessons/core-09.json` + `data/index.json` exemplar has since been rebuilt to the v2 shape as a design-review artifact (see the "Exemplar rebuild" note below); authoring the remaining 29 weekly lessons + regenerating the full index stays scoped to **S13**.
> **Re-scoped below:** **S7** (was "Supplementary lesson pages") → *EnglishPod + 6ME in-lesson sections at scale + quiz/role-play components*; **S13** (author 30 weekly lessons incl. **60 original grammar topics**); **S5** map deliverable adjusted. *This amendment is **pre-S4** work — the Current-slice pointer stays **S4**.*

> ### Exemplar rebuild — 2026-07-17 · L09 end-to-end design-review artifact (NOT a slice sign-off)
> To let the owner review the redefined weekly lesson end-to-end, the **`core-09` exemplar was rebuilt to the v2 shape** ahead of the slices that own this work. This is a **review artifact, not S7/S13 completion** — those boxes stay **TODO** (they cover all 30 lessons / 60 grammar topics / full media). What landed for L09 only:
> - **Original grammar** (retired the elementary `was/were`): `authoring/grammar/core-09-a.md` (present-perfect first-contact — since/for/How long, B1) + `-b.md` (gradual change — better and better / get + comparative, B1→B2), each with L1-contrast, "Xato tuzatish", band-lifter/CEFR tags, options[] MCQ drills + a say-true prompt.
> - **Pipeline (v2):** episode weave added to `normalise.mjs`; `extract.mjs` now emits the paired EP+6ME; `compile-grammar.mjs` fills `grammar[0/1].bodyHtml` from `-a/-b.md`; `data/lessons/core-09.json` regenerated in the v2 schema (grammar array of 2, `englishpod{}`, `sixmin{}`); `validate.mjs`/`build-index.mjs`/`stage-media.mjs`/`manifest.mjs` updated for v2 — deterministic, validate + manifest pass.
> - **Media:** L09's EnglishPod **0026** (dg/pr/rv + transcript) and 6ME **171123** *(Getting fitter)* audio+transcript uploaded to R2 with the immutable `Cache-Control`; serve `200` + `206` Range from `media.principiaforge.com`.
> - **Lesson page:** `lesson.js` extended to the eleven-section order with a two-topic Grammar accordion; the EnglishPod (⑥) + 6ME (⑦) sections live in a lazily-imported `lesson-episodes.js` (shadow/role-play + quiz MCQ). Verified in headless Chrome (mobile 360×800): all sections render, EP/6ME stream from R2, both grammar exercise sets + the quiz work, drill + player unaffected, **zero console errors**. Budgets (gzip) hold: first-paint JS ~9.3 KB, `lesson.js` 10.3 KB lazy, `lesson-episodes.js` 3.0 KB lazy, `styles.css` 6.2 KB, `core-09.json` 14.5 KB.

---

## How we work (the SDD loop)

- **`specs/` is the source of truth.** `00-overview` · `01-content-inventory` · `02-curriculum` · `03-architecture` · `04-ui-ux` (+ `inventory/*`). Every reference below reads **`NN §S`** = spec file `NN`, section `S` (e.g. `03 §2.4`, `02 §8.1`, `04 §4.3`).
- **When reality disagrees with a spec, amend the spec — never silently bypass it.** Wrong on-disk filename, an impossible layout, a genuinely better pattern? **Edit the relevant spec in the same commit, then implement.** The specs must always describe what we actually shipped. A slice that contradicts a spec without amending it is not done.
- **Per-slice loop, every time:**
  1. **Read** the referenced spec sections.
  2. **Implement** the deliverables.
  3. **Verify in the browser** on the throttled test rig — Moto-G-class, Chrome, `Slow 3G` + `4× CPU` (`04 §1`). If it isn't pleasant there, it isn't done.
  4. **Check off** the deliverables and set the board row.
  5. **Commit** — `english-self-study: Sx <short title>` (buildless deploy-from-branch; `git push` publishes in ~1 min, `03 §3`).
- **Slices are independently shippable and risk-ordered** — deploy → content → media → core UX → progress → the rest. Every slice leaves the deployed site working; none breaks a prior slice.
- **Guardrails (`00 §4`) — out of scope by definition:** no backend, no login, no payments/ads, **no build step in the deploy path**, no framework runtime, **media never in the git repo**, and **`content/` is READ-ONLY** (the pipeline only reads/copies it). If a task needs a server, an account, a payment, or CI, stop.

## Status legend

`TODO` not started · `WIP` in progress · `DONE` verified-in-browser + committed · `BLOCKED` waiting on an external dependency · `DEFERRED` intentionally later (phase 2)

## Current slice → **— all slices complete & LAUNCHED**  *(S0–S11 + S13 DONE; S12 DEFERRED to phase 2). Media published to R2 (381 objects, streaming live) + all 30 Fun-English videos populated & oEmbed-verified. Only remaining owner item: a real budget-Android run-through.*

## Status board (the at-a-glance rollup — set the row when the slice's *Done when* passes)

| Slice | Title | Status |
|---|---|---|
| **S0** | Scaffold + hello-world deploy | **DONE** |
| S1 | Content pipeline & data model (prove on 1 lesson) | DONE |
| S2 | Media hosting — R2 + custom domain + fallback ladder | **DONE** |
| S3 | Core lesson page with audio (the centerpiece) | **DONE** |
| S4 | Speak It Yourself — recording + IndexedDB | **DONE** |
| S5 | Progress engine + Home dashboard + Curriculum map | **DONE** |
| S6 | Progress page + gamification + export/import JSON | **DONE** |
| S7 | EnglishPod + 6 Minute English in-lesson sections (+ quiz / role-play) | **DONE** (section flows + quiz/role-play + step wiring + pipeline emission mechanism; 30-lesson authoring in S13) |
| S8 | Fun English embeds (YouTube facade + curation) | **DONE** (facade in `lesson-fun.js` + CSS-gradient poster = 0 YouTube bytes pre-tap + id:null/blocked fallbacks + verified `core-09` exemplar; 30-lesson curation = owner data in S13) |
| S9 | How to Study (methodology) page | **DONE** |
| S10 | Secondary pages — IELTS/CEFR · Grammar · Settings *(About page removed post-launch)* | **DONE** |
| S11 | Polish, accessibility & performance pass | **DONE** |
| S12 | PWA / offline (phase 2) | DEFERRED |
| S13 | Content authoring completion + launch checklist | **DONE & LAUNCHED** (all 30 lessons authored+validated+audited; media published to R2 & streaming; all 30 Fun-English videos live & oEmbed-verified; only owner item left = real-device pass) |

---

## S0 — Scaffold + hello-world deploy

**Goal:** the empty app shell is live at `principiaforge.com/english-self-study/`, painted once, with a working hash router — proving the buildless deploy-from-branch path before any feature exists.
**Specs:** `03 §3` (host/deploy/repo layout), `03 §4` (framework: none), `03 §5.2` (`config.js` / `MEDIA_BASE`), `03 §7` (shell + hash router), `03 §8` (perf budget, 0 KB fonts), `04 §3` (global shell & nav), `04 §7.3` (system-font stack), `04 §7.5` (theme).

- [x] Repo layout per `03 §3`: `index.html` (shell + inlined critical CSS), `config.js` (`MEDIA_BASE` + `mediaUrl()`), `assets/app.js` (ES module), `assets/styles.css`, empty `data/` dirs; optional root `.nojekyll`.
- [x] Persistent shell **outside** `<main>`: sticky top bar (menu/back · context · **UZ|EN toggle** · **theme `◐`**), mobile bottom nav (Bosh / Darslar / Natija / Ko'proq), docked-player mount (hidden), skip-to-content link first (`04 §3`).
- [x] Hash router (`#/`, `#/lessons`, `#/lesson/:id`, `#/method`, `#/progress`, `#/ielts`, `#/grammar`, `#/settings`); unknown hash → redirect `#/` (`04 §2.1`). Renders placeholder screens. *(`#/about` was part of the original router but the About page was removed post-launch — the hash now redirects to `#/`.)*
- [x] `t(key)` i18n over `ui.uz.json` / `ui.en.json`, **Uzbek default**; `<html lang>` follows the toggle; proper `oʻ`/`gʻ` (U+02BB) (`03 §8`, `04 §8`).
- [x] **0 KB fonts** (system stack), theme = `auto` via `prefers-color-scheme` + `[data-theme]` override, no flash (`04 §7.5`).
- [x] Committed + pushed; loads under the `/english-self-study/` subpath beside the sibling apps.

**Done when:** the shell deploys to `principiaforge.com/english-self-study/`, hash routes swap `<main>`, UZ/EN + theme toggles persist across reload, and first view is ≤ ~100 KB with no web-font request.

## S1 — Content pipeline & data model (prove it on one full lesson)

**Goal:** offline Node scripts turn the messy source PDFs/filenames into one **validated** lesson JSON + the lean catalogue — de-risking PDF extraction, filename chaos, and the data model before any authoring at scale.
**Specs:** `03 §5` (stages), `03 §5.3` (filename normalisation), `03 §6.1`–`§6.2` (index + lesson schema), `02 §10` (build notes), `02 §2` (mini-story `{prompt,answer}` parsing), `01` + `inventory/*`.

- [x] `scripts/extract.mjs` (`pdfjs-dist`) → `data/raw/<id>/<component>.txt` (+ `ministory.pairs.json` / `*.para.json` curation drafts), globbing by numeric prefix/keyword via `scripts/lib/normalise.mjs` — **never hardcoded filenames** (`03 §5.1`, `03 §5.3`).
- [x] Filename normaliser (`scripts/lib/normalise.mjs`, reused by S7/S13) handles the documented chaos: AJ `1_/2_/3_/4_` prefixes, missing `_MAIN`/`_VOCAB` (05,07,08,19,20), `.mp3.mp3`/`..mp3` (11,24,27), case drift (`MINI_Story`), ALL-CAPS PDF regime 19–30, `Exitement` typo; EP trailing `" u"` + `B`-prefix probe (both `B{ID}` and `{ID}`); 6ME key-by-`YYMMDD` + slug-from-title + dedupe `(1)` (`03 §5.3`, `02 §10`). **Proven on all 30 AJ lessons** (audio 30/30/30/21, PDF 30/30/30/22) + 28 EP + 143 6ME via `stage-media.mjs --all --dry-run`.
- [x] Curate one core lesson to `data/lessons/core-09.json` (has POV): boilerplate stripped; MINI_STORY → 36 `{q,a}` pairs; VOCAB → 12 chunks + Uzbek glosses; **original Uzbek** Grammar Spark (**v1 single-object shape** — was/were, Murphy U10, `grammar.bodyHtml` precompiled from `authoring/grammar/core-09.md` via `markdown-it` + sanitized); `pov` present (audio+text); nulls encode gaps (`03 §6.2`). 43 KB raw / 12.8 KB gzip. *(Records the **original v1 S1 delivery**. `core-09.json` has since been **rebuilt to the v2 shape** — a two-topic `grammar[]` (present-perfect + gradual-change) compiled from `core-09-a.md` / `core-09-b.md`, plus folded-in `englishpod`/`sixmin`, 14.5 KB gzip; the single `core-09.md` and the was/were + Murphy-U10 grammar were retired. See the "Exemplar rebuild" note above and S13.)*
- [x] `scripts/stage-media.mjs` → `_media_staging/<clean-key>` (`aj-hoge/09/main.mp3` …, copy not move); `scripts/build-index.mjs` → `data/index.json`; `scripts/manifest.mjs` + `scripts/validate.mjs` fail loudly (exit 1) on any missing/typo'd key or schema violation (`03 §5.1`).
- [x] `package.json` (`type:module`, `engines >=20`, dev-only deps `pdfjs-dist` 4.10.38, `markdown-it` 14.3.0); `content/`, `_media_staging/`, `data/raw/`, `node_modules/` git-ignored / non-served.

**Done when:** `core-09.json` + `index.json` validate against the schema ✓, the manifest passes for that lesson's keys ✓, and re-running the scripts is deterministic (byte-identical 2nd run ✓) and leaves `content/` untouched ✓. *(git commit deferred to the owner; no browser surface in this offline slice.)*

## S2 — Media hosting: R2 + custom domain + fallback ladder

**Goal:** lesson media streams (with seek) **and** downloads at **$0 egress** from a swappable single-URL store — the infrastructure the whole delivery model rests on.
**Specs:** `03 §2` (all), `03 §2.3` (CORS/download matrix), `03 §2.4` (bucket config + custom domain), `03 §2.5` (upload), `03 §9` (fallback ladder), `00 §6` (infra risks & mitigations).
**Precondition (owner):** Cloudflare R2 needs a card on file + the `principiaforge.com` DNS zone on Cloudflare (free move, doesn't disturb Pages). If refused → drop to the GitHub Releases escape hatch (no card/DNS). Mark **BLOCKED** if neither is available.

- [x] R2 bucket `english-self-study` (EEUR, public access); CORS policy (prod + localhost dev origins) set via the Cloudflare REST API + `Cache-Control: public, max-age=31536000, immutable`, per `03 §2.4` — policy read back, and the immutable header verified on the served object.
- [x] Custom domain `media.principiaforge.com` attached & live (never ship `r2.dev` — throttled, `03 §2.4`); `config.js` `MEDIA_BASE` points at it (proven one-line swap).
- [x] Upload S1's staged media (lesson 09 + shared grammar PDF = 9 keys) via `rclone copy … --header-upload "Cache-Control:…immutable"` (`03 §2.5`); remote listing == staged keys and every manifest key for core-09 present.
- [x] Verified in browser (headless Chrome) + curl: `<audio>` **streams** (metadata + playback advances) + **seeks** (scrub to mid-file, playback resumes) via HTTP Range `206 Content-Range`, and **downloads** (baseline `<a download>` + R2 `fetch→blob` cross-origin Blob) (`03 §2.3`); GET is `200` with the immutable `Cache-Control`, and the CORS header + preflight are returned.
- [x] Documented the one-line fallback ladder R2 → **B2+Cloudflare** (`MEDIA_BASE` re-point) → **GitHub Releases** (flat-key resolver), incl. the `r2.dev` emergency-only note (`03 §9`).
- [ ] (owner) Set a $0 / free-tier usage alert in the Cloudflare dashboard — cannot be set with an R2-scoped API token.

**Done when:** a MAIN track streams and scrubs from `media.principiaforge.com`, downloads to disk, egress reads $0, and switching `MEDIA_BASE` is proven to be a one-line change. *(Met 2026-07-17: streams + scrubs + `fetch→blob` download verified in headless Chrome; curl confirms `200`/immutable, `206` Range, CORS + preflight. R2 egress is $0 by design. The git commit and the owner $0-usage-alert are deferred to the owner.)*

## S3 — Core lesson page with audio (THE CENTERPIECE)

**Goal:** the nine-section AJ Hoge lesson renders end-to-end and funnels the learner to *hear a question → answer out loud*, on the one persistent audio player.
**Specs:** `04 §4.3` (page + load-bearing behaviors), `02 §2` (9 sections, fixed order), `03 §7` (persistent audio), `04 §5.1` (player states), `04 §5.4` (vocab flip-card), `04 §5.6` (mini-story drill), `03 §6.2` (lesson JSON), `03 §2.3` (downloads).

- [x] Render sections 0–8 **top-to-bottom in fixed order**; gate on data presence (POV hidden L01–08, text-only + optional TTS for L19 — no dead UI) (`04 §4.3.1`, `03 §5.3`).
- [x] One persistent `<audio preload="none">` outside `<main>` + docked player (collapsed↔expanded): rate `0.75/1/1.25`, `⟲10s`/`⟳15s`, position save (~5 s debounce) + restore, `done` at ~90% → repeat-listen counter feeding the ★ gate (`03 §7`, `04 §5.1`).
- [x] Inline section-player triggers (Vocab/MAIN/POV) load the single `<audio>`; only one plays; active trigger shows playing state + `aria-pressed`; player persists across route changes (`04 §4.3.3`).
- [x] **Mini-Story drill** (elevated): Q (EN) → 2–3 s "answer NOW" beat (UZ) → tap-reveal answer → self-check `✓/✗` → advance; live rep counter; **no text input** anywhere (`02 §2`, `04 §5.6`).
- [x] Transcript read-along (collapsed, English-only `lang="en"`, tap-paragraph-to-highlight; replay via `⟲10s`, not fake line-seek) + 2-line Uzbek "what it's about" (`04 §4.3.4`).
- [x] Vocab flip-cards (front EN chunk + 🔊 Web Speech TTS w/ fallback; back UZ gloss + EN example) + "seen" toggle (`04 §5.4`).
- [x] Grammar Spark panel: sanitized `bodyHtml` + L1-contrast + "Xato tuzatish" error-fix card + 2–3 interactive drills (instant ✓/✗, UZ hint) + "say a true sentence" spoken prompt + optional Murphy-PDF download (`04 §4.3.6`).
- [x] Per-asset download buttons wired to `downloads[]`; sticky section strip (`⓿①②③❹⑤⑥⑦⑧`) + day-focus chip w/ scroll-spy. Sections **6 (Fun English)** and **7 (Speak It)** render as placeholders (built in S8 / S4).

**Out of scope for S3 — deferred, surfaced now as honest placeholders (never a silent gap):** S3 ships **only the core lesson page** (`04 §4.3`). The other two routed screens the UI spec describes (`04 §2.1`), and the engine behind them, belong to later slices and are intentionally *not* built here:
- **Curriculum map** (`#/lessons`, `04 §4.2`/`§5.3`) + the **single-★ award, gate *enforcement/completion*, and the Day-7 supp-chip / star updates on the map** → **S5** (progress engine). S3 renders the §8 Lesson-Check *preview* (checklist + live star-tier + the mini-story **gate row**) with the *"earn ★"* button **disabled and a clear Uzbek reason**; `#/lessons` shows the standard "keyingi bosqichda tayyorlanadi" placeholder.
- **Supplementary lesson page** (`#/lesson/supp-…`, `04 §4.4`; quiz MCQ `§5.10`; role-play `§5.8`), incl. the S29–S30 mock-interview flow → **S7**; its paired content is authored in **S13**. With no supp JSON on disk, `#/lesson/supp-*` correctly returns the `04 §9` "dars topilmadi" not-found card.
- **Recording** (section ⑦) → **S4**; **Fun-English facade** (section ⑥) → **S8** — both are honest, S-tagged placeholders inside the core page.

S3 still **records what those later gates will read** — `lessons.<id>.listens.{main|ms|pov}` (bumped at ≈90 %) + `lessons.<id>.msAnswersAloud` — under the canonical `03 §6.3` field names, so S5's award/map light up with real data. *(This paragraph closes the verification-round-2 "supp page / curriculum map out-of-S3-scope" contract-gap flag; the core lesson page itself is complete.)*

**Done when:** `#/lesson/core-09` renders every present section; MAIN streams with seek + rate + replay and keeps playing across a route change; the mini-story drill increments the live rep counter; vocab/grammar/transcript/downloads all work on the throttled rig.

## S4 — Speak It Yourself: recording + IndexedDB

**Goal:** learners record a 60-sec spoken response locally (nothing uploaded), replay/delete it, and the data feeds the star model and the L1↔L30 growth proof.
**Specs:** `04 §4.3` ⑨ (+ behavior 10), `04 §5.8` (record button states), `02 §8.2` (blobs → IndexedDB), `03 §6` (storage split), `02 §6` (re-record L1 @ L30), `04 §9` (mic-denied / IndexedDB-unavailable).

- [x] Section ⑨ "O'zingni sinab ko'r": IELTS-style prompt (**using the week's two grammar topics**) + `MediaRecorder` → **IndexedDB** (keyed by lesson id); localStorage holds only the `record:true` flag + count (`02 §8.2`, `03 §6`).
- [x] Record button states idle `●` → recording (timer/waveform) → saved (playback + `🗑` delete) (`04 §5.8`).
- [x] "Nothing is uploaded — faqat siz" privacy reassurance (UZ); re-record-L1-at-L30 hook copy.
- [x] Graceful degradation: mic-permission-denied → Uzbek how-to-enable note + keep the shadow/answer-aloud alternatives (not a dead button); IndexedDB unavailable → in-session only, never blocks the lesson (`04 §9`).

**Done when:** a recording captures, saves to IndexedDB, survives reload, plays back and deletes; denying the mic leaves the section usable; a saved recording bumps the `recordings` count.

## S5 — Progress engine + Home dashboard + Curriculum map

**Goal:** the app tracks and navigates — completing a lesson (with the **mandatory speaking gate**) awards a star, updates the hero metrics/streak, and the map + Home reflect it, all accountless in `localStorage`.
**Specs:** `02 §8` (progress/completion model), `03 §6.3` (`ess.progress.v1` schema + `migrate()`), `02 §1` (metrics = minutes & reps), `02 §2` (7-day cycle / day-focus), `04 §4.1` (Home), `04 §4.2` (map), `04 §5.2`/`§5.3`/`§5.7` (ring / card / checklist).

- [x] `ess.progress.v1` read/write in `try/catch`, debounced, versioned with `migrate()` on load; graceful degrade if storage unavailable (`03 §6.3`, `04 §9`). *(Real engine in `assets/progress.js`: `ensure()` full union shape + `migrate()` threaded through the read path — prunes `supp-*`, folds `grammar→grammarA`, keeps FUTURE unknown versions without wiping.)*
- [x] **Star model + gate** (`04 §5.7`, `02 §8.1`): Lesson Check checklist → 1★/2★/3★; the **"earn ★" button is disabled with a clear Uzbek reason until the mini-story-aloud gate (×2) is met** (`check.gateReason`, then `check.needMore` for the rest of 1★); completing logs listening-minutes + speaking-reps + XP, sets `reviewDue` (+1/3/7/14 via `reviewStage`), never downgrades stars, re-enables to earn a higher tier. *(3★ = 2★ + `sixmin`; the L1↔L30 second-recording comparison is an S6 Progress surface — spec amended in `04 §5.7` / `02 §8.1`. Fun "watched" is an interim honor toggle until S8.)*
- [x] Streak (study-day = any real action, **not** merely opening a lesson; **1 free freeze/week** auto-applied; forgiving **5/7 weekly goal**) with an ISO-week anchor (`streak.weekStart`) resetting the weekly counters (`02 §8.3`).
- [x] Home: first-run onboarding (pick pace + Start the **first authored** lesson — not a hardcoded "Lesson 1") vs returning (**Continue card** restoring lesson + day-of-cycle focus; **hero metrics — listening minutes biggest**; weekly ring; Review-today cards only when due) (`04 §4.1`). Listening minutes now accrue from **real playback** (`player.js` → `addListeningMinutes`).
- [x] Curriculum map: 3 phases (Poydevor/Sur'at/Ravonlik) with Uzbek name + CEFR tag + can-do + progress bar; lesson cards (stars · number · title · level · **the week's two grammar topics** from `grammarTitlesUz` · **🎙️ EnglishPod / 📻 6 Minute badges** from `hasEnglishPod`, no separate supp chip); **recommended-next ring** (one gentle pulse); **soft locks only** (hint, never disabled); empty phases show an honest "being prepared" note (`04 §4.2`, `§5.3`).

**Done when:** completing `core-09` (gate enforced) awards a star, Home's Continue + minutes + streak update, the map card shows the star, and all of it survives a reload. *(Met 2026-07-18: `build-index` + `validate` pass; a 53-assertion headless engine harness verifies migrate/streak/freeze/week-reset/`completeLesson`/review-spacing/never-downgrade + year/week boundary math; a 28-check headless-Chrome smoke over CDP renders Home first-run + returning, the map, and the lesson gate/completed states with **zero console errors**; a seeded completed lesson shows its star + next-review after reload. Budgets hold — gzip: `styles.css` 8.8 KB, per-module JS well under 35 KB [`lesson.js` 11.6 KB gzip / 39.5 KB raw, lazy], `index.json` 798 B. Git commit deferred to the owner.)*

## S6 — Progress page + gamification + export/import JSON

**Goal:** everything the accountless system knows is visible, motivating, and **portable** — the only safe device-move / cache-clear backup without accounts.
**Specs:** `04 §4.6` (progress page), `04 §6` (gamification surfaces), `02 §8.2` (export/import), `02 §8.3` (badges/streak/goals), `02 §7` (CEFR ladder + coverage), `03 §6.3`.

- [x] Progress page: hero counters, **CEFR ladder** (A2✓/B1◔/B2○), **streak calendar** (with `❄` freeze), badge gallery (earned bright / locked greyed + progress hint), **IELTS-topic coverage grid** (`04 §4.6`, `§6`).
- [x] Badge triggers wired (First Step, streaks, Deep Listener, Speaker, Voice, Grammar Guru, Conversationalist, phase/CEFR, Comeback) with toast-on-earn (engine dispatches `yp:badge`; shell toast in `app.js`) (`02 §8.3`).
- [x] **Export / Import / Copy JSON** prominent: import validates `schemaVersion`, `migrate()`, diff-preview before overwrite; "reset all" with confirm (`02 §8.2`, `03 §6.3`).
- [x] Re-engagement banner (localStorage-driven, once/day, dismissible, **never modal/guilt**) + Comeback badge on 7+ day return (`02 §8.3`, `04 §6`).
- [x] L1↔L30 recording comparison player appears once two recordings exist (`04 §4.6`, `02 §6`).

**Done when:** the Progress page shows live metrics/badges/coverage/streak; exporting then importing JSON on a "fresh" browser restores progress exactly; a mis-versioned import is refused without corrupting current data.

## S7 — EnglishPod + 6 Minute English in-lesson sections (+ quiz / role-play)

**Goal:** the two authentic-volume sections render **inside** the weekly lesson page — EnglishPod (speaking: shadow + role-play) as section ⑥, 6 Minute English (listening: quiz + INSERT stretch) as section ⑦ — *not* as separate pages. They add reps + volume and lift a lesson to 2★/3★, with EnglishPod `null`-gated (hidden) on L15 & L22.
**Specs:** `02 §3` (in-lesson EP/6ME flows), `02 §5` (episode weave + on-disk filenames), `04 §4.3` ⑥/⑦ (+ behaviors 7–8), `04 §4.4` (the two section flows), `04 §5.10` (quiz MCQ), `04 §5.8` (dialogue role-play), `03 §6.2` (`englishpod{}` / `sixmin{}` blocks), `03 §4` (lazy `lesson-episodes.js`), `02 §7` (INSERT / listening map).

- [~] Extend the pipeline to emit, **inside each `core-NN.json`**, the **`englishpod{}`** block (`dg/pr/rv` + `dialogue` + Uzbek-glossed `keyVocab`; **`null` for L15 & L22**) and the **`sixmin{}`** block (`audio.main` + `quiz` + Uzbek-glossed `vocab` + trimmed `transcripts.sixmin`), per the verified §5 weave filenames — no `supp-*` files (`03 §6.2`, `02 §5`). *(S7: the extract/compile MECHANISM is complete + deterministic — `extract.mjs` emits `englishpod.draft.json`/`sixmin.draft.json` incl. the L15/L22 null-gate; `compile-grammar.mjs` is batch-resilient and round-trips the folded blocks. Authoring the blocks in all 30 `core-NN.json` remains S13, line 243.)*
- [x] EnglishPod section ⑥ (7 beats): warm-up → `dg` cold → transcript + **Key Vocab + added Uzbek gloss** → `pr` (Sprint-skippable) → shadow → **role-play (hide a role)** → `rv`; the whole section is gated off when `englishPod:null` (`02 §3`, `04 §4.4`).
- [x] 6ME section ⑦ (7 beats): MCQ pre-listen → predict → gist listen (hidden) → reveal + self-check → 6-word vocab + UZ gloss → re-listen with transcript (**flag `INSERT` vox-pop as the B2 stretch**) → feeds the Speak-It 60-sec recording (`02 §3`, `02 §7`).
- [x] Quiz MCQ component (select → lock → reveal ✓ / amber-not-red wrong + `explanationUz`) + dialogue role-play component, split into a lazily-imported **`lesson-episodes.js`** so every JS module stays within the ≤35 KB budget — 16 KB raw / 5.1 KB gzip (`04 §5.10`, `§5.8`, `03 §4`).
- [x] Wire `steps.ep` (→ 2★, **auto-true on L15/L22**) and `steps.sixmin` (→ 3★) into the weekly star model + `listens.{ep,sixmin}` (`02 §8.1`, `03 §6.3`); the map's 🎙️/📻 badges reflect availability.
- [ ] **Interview-Skills bridge:** the six EnglishPod *Interview Skills* dialogues sit in the ⑥ sections of **L04/L18/L19/L26/L27/L29** and climax at the **L30 capstone**; surface the "bridges to a real/paid mock" note on `#/ielts` (`02 §5`, `04 §4.4`/`§4.7`). *(S10 shipped the `#/ielts` bridge callout + mock-readiness checklist; placing the six dialogues into L04/18/19/26/27/29 → L30 remains S13 authoring.)*

**Done when:** on one lesson the EnglishPod ⑥ and 6ME ⑦ sections play and complete end-to-end **inside** the lesson page (quiz + role-play + shadowing + record), a `null`-gated lesson (L15/L22) hides ⑥ with `ep` auto-satisfied, and `steps.ep`/`steps.sixmin` lift the star tier.

## S8 — Fun English embeds (YouTube facade + curation)

**Goal:** section 6 shows a zero-byte-until-tapped YouTube facade, and each lesson's video pick is data, not code.
**Specs:** `03 §7` (facade = the biggest first-paint win), `04 §5.9` (facade component), `04 §4.3` ⑧ (+ behavior 9), `02 §4` (theme → channel per lesson).

- [x] Facade component: **CSS-gradient poster** (not a thumbnail fetch — that is a YouTube byte) + `▶` + title/channel; inject `youtube-nocookie.com` iframe **only on tap**, move focus in, `title` set (`04 §5.9`). Lazily imported as `assets/lesson-fun.js` (03 §4), alongside `lesson-episodes.js`/`lesson-speak.js`; drives the `fun` step via `ctx.markFun`.
- [x] Reads `funEnglish[]` from lesson JSON — **never hardcode a video ID** (a dead video is a JSON fix) (`04 §4.3` behavior 9); one tiny watch-task, no test. **`id:null`** → "YouTube'da qidirish / Search on YouTube" link + "Koʻrdim / Watched" honor acknowledge (never a dead button, so 2★ stays reachable on uncurated lessons).
- [x] Fallback: iframe blocked/failed → "YouTube'da ochish / Open on YouTube" link (`youtube.com/watch?v=<id>`); watch-task text stays (`04 §9`).
- [x] Curate the video picks per the `02 §4` channel/theme map (owner supplies exact IDs → data). *(The `core-09` exemplar carries a **verified embeddable pick** — `QlohNbRUltY`, confirmed via YouTube oEmbed — as an owner-swappable placeholder; the remaining 29 picks are owner-supplied data in **S13**.)*

**Done when:** a lesson's Fun English shows a facade that fetches **0 bytes** of YouTube pre-tap, injects a working nocookie iframe on tap, and falls back to a link when blocked. ✅

> **S8 (as shipped).** The facade lives in the lazily-imported `assets/lesson-fun.js` (`funSection(id,l,ctx)`); the S5 interim "watched" honor toggle in `lesson.js` §⑧ was **removed** (one fun mechanism, no competing control) and replaced by the real facade, which drives the `fun` step through the new `ctx.markFun` callback (mirroring `markEp`/`markSix`). The pre-tap poster is a **pure CSS gradient** (both themes) — no `img.youtube.com`/`ytimg` thumbnail — so the section fetches **0 bytes from YouTube/ytimg/any Google host until tap** (03 §8); tap injects one `youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` iframe (`title` + `allow="autoplay; encrypted-media; picture-in-picture"` + `allowfullscreen` + `loading="lazy"`), moves focus in, and marks `fun`. `id:null` → Search-on-YouTube link + "Koʻrdim" acknowledge; blocked → Open-on-YouTube link with the watch-task preserved. i18n keys added to both dicts (`lesson.fun.*`); `check.funWatch` now labels the id:null acknowledge. Budgets held: `lesson-fun.js` ~2.6 KB gzip, `styles.css` ~14.1 KB gzip (≤15), `core-09.json` ~14.4 KB gzip (≤25). Specs amended: `04 §5.9` + §4.3 ⑧/behavior 9 + §5.7 note, `02 §4`, `03 §7`.

## S9 — How to Study (methodology) page

**Goal:** the lone learner's manual — **Uzbek-primary**, complete, so nobody gets stuck and quits.
**Specs:** `02 §6` (13-block outline), `04 §4.5` (layout), `02 §9` (bilingual policy), `02 §2` (7-day cycle + pace tracks).

- [x] All 13 blocks (`02 §6`): how it works · 7 rules · golden rule · daily habit (7-day cycle checklist) · choose your pace (+ backward-planning table) · **speaking-alone techniques** · deep listening · peak state · vocabulary · pronunciation self-check · **top-10 Uzbek mistakes** · what to do when you struggle · FAQ.
- [x] Uzbek-primary with English mirror via the global UZ|EN toggle; sticky mini-TOC jump links (`04 §4.5`).
- [x] Top-10-mistakes block deep-links each L1 cluster into the core lesson that fixes it (`02 §6.11`).

**Done when:** `#/method` renders all 13 blocks bilingually, the UZ/EN toggle swaps the mirror, and every mistake link jumps to the right lesson.

## S10 — Secondary pages: IELTS/CEFR · Grammar Reference · Settings *(About removed post-launch)*

**Goal:** the remaining routed surfaces that complete the app.
**Specs:** `04 §4.7` (ielts/grammar), `02 §7` (IELTS/CEFR alignment), `04 §2.1` (settings sheet), `03 §9` + `00 §6` (licensing note), `02 §10` (grammar appendices).

- [x] `#/ielts`: honest "builds the competence IELTS measures, *not* a cram course" framing up front + Phase→CEFR→IELTS table + criterion→feature map + "Am I ready for a mock?" checklist + **Interview-Skills bridge note** (`02 §7`).
- [x] `#/grammar`: read-only index of all Grammar Sparks (**by phase** — Poydevor / Surʼat / Ravonlik; see spec amendment, index.json exposes only `phase`) linking to lessons + **original re-authored** irregular-verb / spelling reference cards (`04 §4.7`, `02 §10`).
- [x] ~~`#/about`: what it is · Effortless-English credit · honest free/no-login promise · **licensing note (media = owner's responsibility, swappable bucket) + attributed sources** · contact `principiaforge@gmail.com`~~ **— shipped in S10, then removed post-launch at the owner's request** (route + module + i18n keys + CSS deleted; `#/about` now redirects to `#/`).
- [x] Settings **screen (routed, styled as a panel — not a bottom sheet; see spec amendment)** consolidating language · pace track · theme · playback rate · export/import · reset (persists to `settings.*` via the `yp:setting` shell hook) (`04 §2.1`).

**Done when:** all routes render correctly, the IELTS framing is unmistakably honest, and settings changes persist across reload.

## S11 — Polish, accessibility & performance pass

**Goal:** the whole site meets WCAG 2.1 AA, degrades gracefully on every failure, and hits the performance budget on a cheap Android.
**Specs:** `04 §1` (P1–P7), `04 §7` (visual system / tokens both themes), `04 §8` (a11y checklist), `04 §9` (empty/edge/error matrix), `03 §8` (perf budget).

- [x] A11y (`04 §8`): landmarks + one `<h1>`/screen · skip link first · visible focus everywhere · ≥44px targets (+8px gap) · full **player ARIA** · **bilingual `lang` attributes** (English content `lang="en"` inside Uzbek UI — the load-bearing detail; **app-wide fix: drop the static `lang="uz"` on `t()`-driven UI strings** (home/lessons/lesson/lesson-fun/method/progress/…) so they follow the UZ|EN toggle instead of mislabelling English text in EN mode — WCAG 3.1.2, flagged in S8 verification) · never color-alone · `prefers-reduced-motion` disables all celebrations/equalizer/flicker · reflow at 320px & 200% zoom. *(Done: `lang="uz"` swept from ~55+ `t()` sites across all page/lesson modules; player ARIA fixed (spoken-time `aria-valuetext`, rate value exposed, loading announced, single live region); focus ring now ≥3:1 both themes (`--teal-bright`→`#0E9384`); 44px tap targets via classes; reduced-motion rule relocated LAST in `styles.css`; reflow safety net added. See `04 §8` — all boxes ticked.)*
- [x] Every empty/edge/error state from `04 §9` implemented: media-unreachable (per-track + global banner, **text still teaches**), YouTube blocked, localStorage/IndexedDB unavailable, mic denied, POV absent/text-only, slow-network skeletons (not spinners), lesson 404/malformed, invalid import, course-complete (L30 cert + re-record prompt). *(Done across the three clusters; `04 §9` marked implemented for every row.)*
- [x] Visual tokens finalised in **both** themes with measured AA contrast (`04 §7.2`); type scale, spacing, radii, two warm shadows, phase accents (`04 §7.3`–`§7.6`). *(Done: all 58 token pairs measured both themes incl. coloured-text-on-own-tint; 3 light-mode regressions fixed (focus ring + amber/green/red darkened); `04 §7.2` updated with measured ratios.)*
- [x] Perf budget met on `Slow 3G` + `4× CPU` (`03 §8`): first view ≤ ~100 KB, interactive < 3 s; per-asset budgets (`index.html` ≤12 KB, `styles.css` ≤15 KB, `app.js` ≤35 KB, `index.json` ≤40 KB, lesson JSON ≤25 KB); 0 KB fonts; YouTube 0 KB pre-tap; `?v=N` cache-bust on `app.js`. *(Done: measured gzip — html 4.00 · styles 14.95 · app 6.49 · index.json 0.42 · core-09 14.7; first-view Home ~46.5 KB; `?v=3`; 0 KB fonts/YouTube. Interactive-time gate closed in round-2 by **boot-chain resource hints** that flatten the 6-deep serial request waterfall — measured TTI **2.2–2.3 s** at `400 ms`-RTT Slow-3G + `4× CPU` (was 3.9–4.0 s). See `03 §8` S11 note.)*

**Done when:** an automated a11y check is clean (contrast/labels/lang), every error state in `04 §9` degrades without a dead screen, and the budget + interactive-time targets pass on the throttled rig. ✅ *(Met 2026-07-19: measured WCAG audit of all 58 token pairs passes AA both themes after the 3 token fixes; `lang` sweep + full player ARIA landed; all `04 §9` rows implemented; all per-asset gzip budgets + ~46.5 KB first-view hold; the **<3 s interactive** gate — which initially rested on a byte-count argument that a round-2 latency sweep showed was unmet at honest Slow-3G RTT — is now genuinely met via **boot-chain resource hints** (measured TTI **2.2–2.3 s** at `400 ms` RTT + `4× CPU`, was ~4.0 s). `build-index` + `validate` pass; i18n parity 505/505 with no raw-key leak. Git commit deferred to the owner.)*

## S12 — PWA / offline (phase 2) · DEFERRED

**Goal:** instant repeat loads, offline text/UI, add-to-home — the optional resilience layer. Deferrable per `03 §7`; ship only after S11.
**Specs:** `03 §7` (offline stance / app-shell SW), `02 §8.3` (re-engagement / Notification / add-to-home).

- [ ] ~40-line hand-written service worker: precache app shell + all lesson JSON + icons; cache-first for `immutable` assets, stale-while-revalidate for JSON (`03 §7`).
- [ ] `manifest.webmanifest` + icons → "Add to Home Screen".
- [ ] Optional **per-lesson "save audio offline"** via Cache API — **never** auto-cache the ~1 GB library (`03 §7`).
- [ ] Optional Notification API for the daily re-engagement nudge (opt-in) (`02 §8.3`).

**Done when:** a repeat visit loads instantly and works offline for text/UI, add-to-home installs, and one lesson's audio is savable offline — with no regression to the S11 budget.

## S13 — Content authoring completion + launch checklist

**Goal:** all **30 weekly lessons** authored and validated (each = one whole AJ set + **two original grammar topics** + folded EnglishPod + folded 6ME = **60 original grammar topics** total), full media uploaded, privacy honoured, and the site launched at $0 recurring cost.
**Specs:** `02 §4` (30×2 grammar topics) + `02 §5` (episode weave), `02 §6`/`§9` (Uzbek prose & policy), `03 §6.2` (v2 shape), `03 §2.5` (full upload), `03 §9` + `00 §6` (licensing), `00 §5` (success criteria), `00 §4` (non-goals incl. no identifying analytics), `03 §8` (final budget check).
**Precondition (owner):** the media **licensing decision** is the owner's to make (`00 §6`, `03 §9`). Architecture keeps takedown trivial (swappable bucket); this slice ships the app, not legal clearance.

- [x] Author all 30 weekly lessons in the §6.2 **v2** shape: **60 original Uzbek Grammar-Spark topics** (`authoring/grammar/<id>-A.md` + `<id>-B.md`, each with band-lifter/CEFR tag + "Xato tuzatish" card, `02 §4`), chunk glosses, mini-story pairs, POV gating (09–30; L19 text-only), Fun-English picks. *(All 30 validate against `03 §6.2`; per-lesson ≤20.7 KB gzip / `index.json` 4.7 KB — both within `03 §8`. Authored via the overlay pattern + assembler, then adversarially audited: 0 critical, 30 minor findings all fixed. **All 30 Fun-English videos are now populated** — distinct, on-theme TED/TED-Ed/TEDx/educator picks, each independently oEmbed-verified as public + embeddable, `02 §4`/S8.)*
- [x] Author every lesson's folded **EnglishPod** (`dg/pr/rv` + dialogue + Uzbek-glossed Key Vocab; `null` on L15/L22) and **6ME** (quiz MCQ + 6-word Uzbek gloss + trimmed transcript) sections; wire the **Interview-Skills bridge** across L04/18/19/26/27/29 → L30 capstone (`02 §5`). *(EP null-gate verified in-browser on L15/L22 — 10 sections, no EP body/dialogue; the six Interview-Skills EP episodes 0241/0244/0247/0250/0253/0259 sit in exactly L26/18/04/27/19/29 per the §5 weave, bridging to the L30 capstone + the S10 `#/ielts` callout.)*
- [x] **S1 exemplar already migrated to v2** — `data/lessons/core-09.json` + its `data/index.json` entry were rebuilt to the `03 §6.2` v2 shape (grammar[] of 2, `englishpod{}`, `sixmin{}`) ahead of this slice as the design-review artifact (see the top-of-file "Exemplar rebuild" note); the retired `was/were` + Murphy-U10 ref are gone. `data/index.json` is regenerated by `build-index.mjs` over all 30 lessons.
- [x] Stage + **upload** the **full** media payload; `scripts/manifest.mjs` passes with **zero missing keys** (`03 §2.5`, `03 §5.1`). *(All 30 lessons staged — 535 keys, manifest GREEN — then **published to R2 on owner go-ahead**: `scripts/upload-media.mjs --go` uploaded 381 objects / 1673 MB at $0 egress; verified streaming (GET 200 + Range 206) with the immutable Cache-Control. All 30 lessons' audio streams + downloads live from `media.principiaforge.com`. Licensing responsibility is the owner's per `00 §6` / `03 §9`.)*
- [x] Privacy/analytics: **no PII / no identifying analytics** (`00 §4`). *(Verified: no analytics/trackers/beacons in served code; no runtime fetch beyond `MEDIA_BASE` + the tap-gated YouTube facade; no transcript baked into crawlable HTML — the SPA fetches JSON at runtime; `.nojekyll` present, `03 §9`.)*
- [x] Launch QA: export/import smoke (S6-verified); ~~licensing note live on About (S10)~~ *(About page removed post-launch — the in-app licensing note is gone with it)*; final browser render check + budget re-check. *(Render verified across every structural state — no-POV L01–08, EP-null L15/L22, POV-text-only L19, full POV+EP, capstone — h1=1, all sections, zero console errors. **A full run-through on a real budget Android stays an owner step** — emulated throttling is close but physical mic-permission + touch targets deserve a real device.)*

**Done when:** all 30 weekly lessons are complete (incl. the 60 grammar topics + folded EnglishPod/6ME) and manifest-validated, all lesson JSON + `data/index.json` are in the v2 shape, media resolves 1:1 in staging and is one command from R2 at $0, no analytics identifies a person, and the site renders cleanly across all lesson states. ✅ *(Met 2026-07-19: all 30 validate; 0 critical / 30-minor-all-fixed audit; manifest GREEN 535 keys; render + privacy + budgets pass. **Then launched on owner go-ahead: media published to R2 (381 objects, streaming live) + all 30 Fun-English videos populated & oEmbed-verified.** The only remaining owner item is a real budget-Android run-through.)*

> **S13 (as shipped) — faithful-scaffold + authored-overlay pipeline, built and audited at scale.** The 30-lesson build split curation (03 §5 step 2) into a **deterministic assembler** + a small **committed authored overlay**, so the English immersion input stays byte-faithful to the audio while only the Uzbek pedagogy is hand-written. Three pipeline scripts were added (03 §5 "S13 as shipped"): **`probe-media.mjs`** (ffprobe/stat → real `durationSec`/`bytes`), **`assemble-lesson.mjs`** (faithful transcripts w/ AJ/BBC boilerplate stripped + 6ME reconstructed into speaker turns + mini-story pairs + probed media, merged with `authoring/lessons/<id>.overlay.json`), and **`upload-media.mjs`** (dependency-free SigV4 R2 publisher; owner-triggered). Authoring/verification ran as **parallel agent workflows**: 28 authoring agents (1 per lesson) → deterministic `assemble → compile-grammar → build-index → validate` (all 30 green) → **30 adversarial auditors** (independent, source-checked: 6ME answers, invented vocab, gloss accuracy, exercise validity, faithfulness, Uzbek orthography) → **0 critical, 30 minor** findings → 21 targeted fix agents → re-pipeline + orthography sweep + browser render check. Everything in build scope is complete and verified; the only remaining items are the three explicitly owner-reserved triggers above.

---

### Backlog / later layers (not slices yet)
- **Test-Day Skills page** + timed IELTS mocks / Writing-Reading practice (post-B1 optional layer, `02 §7`).
- **B2 / IELTS-Writing extension pack**; deprioritised grammar as optional "Extension" cards (`02 §4`).
- **Russian UI** (`ui.ru.json`) — drops in with no code change (`03 §7`).
- Promote **reserve** EnglishPod / 6ME episodes if a pick underperforms (`02 §5`).
