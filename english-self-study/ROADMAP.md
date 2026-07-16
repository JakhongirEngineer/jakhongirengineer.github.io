# ROADMAP — English Self-Study (working name: **YouSpeak**)

Spec-Driven Development (SDD) progress tracker. We build the site one **slice** at a time.
This file is the single running checklist — **update it every session** (tick deliverables, set the board row, move the *Current slice* pointer).

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

## Current slice → **S1**

## Status board (the at-a-glance rollup — set the row when the slice's *Done when* passes)

| Slice | Title | Status |
|---|---|---|
| **S0** | Scaffold + hello-world deploy | **DONE** |
| S1 | Content pipeline & data model (prove on 1 lesson) | TODO |
| S2 | Media hosting — R2 + custom domain + fallback ladder | TODO |
| S3 | Core lesson page with audio (the centerpiece) | TODO |
| S4 | Speak It Yourself — recording + IndexedDB | TODO |
| S5 | Progress engine + Home dashboard + Curriculum map | TODO |
| S6 | Progress page + gamification + export/import JSON | TODO |
| S7 | Supplementary lessons (EnglishPod + 6 Minute English) | TODO |
| S8 | Fun English embeds (YouTube facade + curation) | TODO |
| S9 | How to Study (methodology) page | TODO |
| S10 | Secondary pages — IELTS/CEFR · Grammar · About · Settings | TODO |
| S11 | Polish, accessibility & performance pass | TODO |
| S12 | PWA / offline (phase 2) | DEFERRED |
| S13 | Content authoring completion + launch checklist | TODO |

---

## S0 — Scaffold + hello-world deploy

**Goal:** the empty app shell is live at `principiaforge.com/english-self-study/`, painted once, with a working hash router — proving the buildless deploy-from-branch path before any feature exists.
**Specs:** `03 §3` (host/deploy/repo layout), `03 §4` (framework: none), `03 §5.2` (`config.js` / `MEDIA_BASE`), `03 §7` (shell + hash router), `03 §8` (perf budget, 0 KB fonts), `04 §3` (global shell & nav), `04 §7.3` (system-font stack), `04 §7.5` (theme).

- [x] Repo layout per `03 §3`: `index.html` (shell + inlined critical CSS), `config.js` (`MEDIA_BASE` + `mediaUrl()`), `assets/app.js` (ES module), `assets/styles.css`, empty `data/` dirs; optional root `.nojekyll`.
- [x] Persistent shell **outside** `<main>`: sticky top bar (menu/back · context · **UZ|EN toggle** · **theme `◐`**), mobile bottom nav (Bosh / Darslar / Natija / Ko'proq), docked-player mount (hidden), skip-to-content link first (`04 §3`).
- [x] Hash router (`#/`, `#/lessons`, `#/lesson/:id`, `#/method`, `#/progress`, `#/ielts`, `#/grammar`, `#/about`, `#/settings`); unknown hash → redirect `#/` (`04 §2.1`). Renders placeholder screens.
- [x] `t(key)` i18n over `ui.uz.json` / `ui.en.json`, **Uzbek default**; `<html lang>` follows the toggle; proper `oʻ`/`gʻ` (U+02BB) (`03 §8`, `04 §8`).
- [x] **0 KB fonts** (system stack), theme = `auto` via `prefers-color-scheme` + `[data-theme]` override, no flash (`04 §7.5`).
- [x] Committed + pushed; loads under the `/english-self-study/` subpath beside the sibling apps.

**Done when:** the shell deploys to `principiaforge.com/english-self-study/`, hash routes swap `<main>`, UZ/EN + theme toggles persist across reload, and first view is ≤ ~100 KB with no web-font request.

## S1 — Content pipeline & data model (prove it on one full lesson)

**Goal:** offline Node scripts turn the messy source PDFs/filenames into one **validated** lesson JSON + the lean catalogue — de-risking PDF extraction, filename chaos, and the data model before any authoring at scale.
**Specs:** `03 §5` (stages), `03 §5.3` (filename normalisation), `03 §6.1`–`§6.2` (index + lesson schema), `02 §10` (build notes), `02 §2` (mini-story `{prompt,answer}` parsing), `01` + `inventory/*`.

- [ ] `scripts/extract.mjs` (`pdfjs-dist`) → `data/raw/<id>.txt`, globbing by numeric prefix/keyword — **never hardcoded filenames** (`03 §5.1`, `03 §5.3`).
- [ ] Filename normaliser handles the documented chaos: AJ `1_/2_/3_/4_` prefixes, missing `_MAIN`/`_VOCAB` (05,07,08,19,20), `.mp3.mp3`/`..mp3` (11,24,27), case drift (`MINI_Story`), ALL-CAPS PDF regime 19–30, `Exitement` typo; EP trailing `" u"` + `B`-prefix probe (both `B{ID}` and `{ID}`); 6ME key-by-`YYMMDD` + slug-from-title + dedupe `(1)` (`03 §5.3`, `02 §10`).
- [ ] Curate one core lesson to `data/lessons/core-09.json` (has POV): strip boilerplate; MINI_STORY → `{prompt,answer}` pairs; VOCAB → chunks; **original Uzbek** Grammar Spark (`grammar.bodyHtml`, precompiled + sanitized); `pov` present; nulls encode gaps (`03 §6.2`).
- [ ] `scripts/stage-media.mjs` → `_media_staging/<clean-key>` (`aj-hoge/09/main.mp3` …); `scripts/build-index.mjs` → `data/index.json`; `scripts/manifest.mjs` fails on any missing/typo'd key (`03 §5.1`).
- [ ] `package.json` (Node 20/22, dev-only deps `pdfjs-dist`, `markdown-it`); `content/`, `_media_staging/`, `data/raw/` git-ignored / non-served.

**Done when:** `core-09.json` + `index.json` validate against the schema, the manifest passes for that lesson's keys, and re-running the scripts is deterministic and leaves `content/` untouched.

## S2 — Media hosting: R2 + custom domain + fallback ladder

**Goal:** lesson media streams (with seek) **and** downloads at **$0 egress** from a swappable single-URL store — the infrastructure the whole delivery model rests on.
**Specs:** `03 §2` (all), `03 §2.3` (CORS/download matrix), `03 §2.4` (bucket config + custom domain), `03 §2.5` (upload), `03 §9` (fallback ladder), `00 §6` (infra risks & mitigations).
**Precondition (owner):** Cloudflare R2 needs a card on file + the `principiaforge.com` DNS zone on Cloudflare (free move, doesn't disturb Pages). If refused → drop to the GitHub Releases escape hatch (no card/DNS). Mark **BLOCKED** if neither is available.

- [ ] R2 bucket `ess-media`; CORS policy + `Cache-Control: public, max-age=31536000, immutable` per `03 §2.4`.
- [ ] Custom domain `media.principiaforge.com` attached (never ship `r2.dev` — throttled, `03 §2.4`); `config.js` `MEDIA_BASE` points at it.
- [ ] Upload S1's staged media via `rclone copy … --header-upload "Cache-Control:…immutable"` (`03 §2.5`).
- [ ] Verify in browser: `<audio>` **streams** + **seeks** (HTTP Range) and **downloads** (baseline `<a download>`; R2 `fetch→blob` progress upgrade) (`03 §2.3`).
- [ ] Set a $0 usage alert; document the one-line fallback ladder R2 → **B2+Cloudflare** (`MEDIA_BASE` re-point) → **GitHub Releases** (flat-key resolver) (`03 §9`).

**Done when:** a MAIN track streams and scrubs from `media.principiaforge.com`, downloads to disk, egress reads $0, and switching `MEDIA_BASE` is proven to be a one-line change.

## S3 — Core lesson page with audio (THE CENTERPIECE)

**Goal:** the nine-section AJ Hoge lesson renders end-to-end and funnels the learner to *hear a question → answer out loud*, on the one persistent audio player.
**Specs:** `04 §4.3` (page + load-bearing behaviors), `02 §2` (9 sections, fixed order), `03 §7` (persistent audio), `04 §5.1` (player states), `04 §5.4` (vocab flip-card), `04 §5.6` (mini-story drill), `03 §6.2` (lesson JSON), `03 §2.3` (downloads).

- [ ] Render sections 0–8 **top-to-bottom in fixed order**; gate on data presence (POV hidden L01–08, text-only + optional TTS for L19 — no dead UI) (`04 §4.3.1`, `03 §5.3`).
- [ ] One persistent `<audio preload="none">` outside `<main>` + docked player (collapsed↔expanded): rate `0.75/1/1.25`, `⟲10s`/`⟳15s`, position save (~5 s debounce) + restore, `done` at ~90% → repeat-listen counter feeding the ★ gate (`03 §7`, `04 §5.1`).
- [ ] Inline section-player triggers (Vocab/MAIN/POV) load the single `<audio>`; only one plays; active trigger shows playing state + `aria-pressed`; player persists across route changes (`04 §4.3.3`).
- [ ] **Mini-Story drill** (elevated): Q (EN) → 2–3 s "answer NOW" beat (UZ) → tap-reveal answer → self-check `✓/✗` → advance; live rep counter; **no text input** anywhere (`02 §2`, `04 §5.6`).
- [ ] Transcript read-along (collapsed, English-only `lang="en"`, tap-paragraph-to-highlight; replay via `⟲10s`, not fake line-seek) + 2-line Uzbek "what it's about" (`04 §4.3.4`).
- [ ] Vocab flip-cards (front EN chunk + 🔊 Web Speech TTS w/ fallback; back UZ gloss + EN example) + "seen" toggle (`04 §5.4`).
- [ ] Grammar Spark panel: sanitized `bodyHtml` + L1-contrast + "Xato tuzatish" error-fix card + 2–3 interactive drills (instant ✓/✗, UZ hint) + "say a true sentence" spoken prompt + optional Murphy-PDF download (`04 §4.3.6`).
- [ ] Per-asset download buttons wired to `downloads[]`; sticky section strip (`⓿①②③❹⑤⑥⑦⑧`) + day-focus chip w/ scroll-spy. Sections **6 (Fun English)** and **7 (Speak It)** render as placeholders (built in S8 / S4).

**Done when:** `#/lesson/core-09` renders every present section; MAIN streams with seek + rate + replay and keeps playing across a route change; the mini-story drill increments the live rep counter; vocab/grammar/transcript/downloads all work on the throttled rig.

## S4 — Speak It Yourself: recording + IndexedDB

**Goal:** learners record a 60-sec spoken response locally (nothing uploaded), replay/delete it, and the data feeds the star model and the L1↔L30 growth proof.
**Specs:** `04 §4.3` ⑦, `04 §5.8` (record button states), `02 §8.2` (blobs → IndexedDB), `03 §6` (storage split), `02 §6` (re-record L1 @ L30), `04 §9` (mic-denied / IndexedDB-unavailable).

- [ ] Section 7 "O'zingni sinab ko'r": IELTS-style prompt + `MediaRecorder` → **IndexedDB** (keyed by lesson id); localStorage holds only the `record:true` flag + count (`02 §8.2`, `03 §6`).
- [ ] Record button states idle `●` → recording (timer/waveform) → saved (playback + `🗑` delete) (`04 §5.8`).
- [ ] "Nothing is uploaded — faqat siz" privacy reassurance (UZ); re-record-L1-at-L30 hook copy.
- [ ] Graceful degradation: mic-permission-denied → Uzbek how-to-enable note + keep the shadow/answer-aloud alternatives (not a dead button); IndexedDB unavailable → in-session only, never blocks the lesson (`04 §9`).

**Done when:** a recording captures, saves to IndexedDB, survives reload, plays back and deletes; denying the mic leaves the section usable; a saved recording bumps the `recordings` count.

## S5 — Progress engine + Home dashboard + Curriculum map

**Goal:** the app tracks and navigates — completing a lesson (with the **mandatory speaking gate**) awards a star, updates the hero metrics/streak, and the map + Home reflect it, all accountless in `localStorage`.
**Specs:** `02 §8` (progress/completion model), `03 §6.3` (`ess.progress.v1` schema + `migrate()`), `02 §1` (metrics = minutes & reps), `02 §2` (7-day cycle / day-focus), `04 §4.1` (Home), `04 §4.2` (map), `04 §5.2`/`§5.3`/`§5.7` (ring / card / checklist).

- [ ] `ess.progress.v1` read/write in `try/catch`, debounced, versioned with `migrate()` on load; graceful degrade if storage unavailable (`03 §6.3`, `04 §9`).
- [ ] **Star model + gate** (`04 §5.7`, `02 §8.1`): Lesson Check checklist → 1★/2★/3★; the **"earn ★" button is disabled with a clear Uzbek reason until the mini-story-aloud step is checked**; completing logs listening-minutes + speaking-reps + XP, sets `reviewDue` (+1/3/7/14).
- [ ] Streak (study-day = any real action; speaking streak; **1 free freeze/week**; forgiving **5/7 weekly goal**) (`02 §8.3`).
- [ ] Home: first-run onboarding (pick pace + "Start Lesson 1") vs returning (**Continue card** restoring lesson + day-of-cycle focus; **hero metrics — listening minutes biggest**; weekly ring; Review-today cards only when due) (`04 §4.1`).
- [ ] Curriculum map: 3 phases (Poydevor/Sur'at/Ravonlik) with Uzbek name + CEFR tag + can-do + progress bar; lesson cards (stars · number · title · level · grammar · paired supp chip); **recommended-next ring**; **soft locks only** (hint, never disabled) (`04 §4.2`, `§5.3`).

**Done when:** completing `core-09` (gate enforced) awards a star, Home's Continue + minutes + streak update, the map card shows the star, and all of it survives a reload.

## S6 — Progress page + gamification + export/import JSON

**Goal:** everything the accountless system knows is visible, motivating, and **portable** — the only safe device-move / cache-clear backup without accounts.
**Specs:** `04 §4.6` (progress page), `04 §6` (gamification surfaces), `02 §8.2` (export/import), `02 §8.3` (badges/streak/goals), `02 §7` (CEFR ladder + coverage), `03 §6.3`.

- [ ] Progress page: hero counters, **CEFR ladder** (A2✓/B1◔/B2○), **streak calendar** (with `❄` freeze), badge gallery (earned bright / locked greyed + progress hint), **IELTS-topic coverage grid** (`04 §4.6`, `§6`).
- [ ] Badge triggers wired (First Step, streaks, Deep Listener, Speaker, Voice, Grammar Guru, phase/CEFR badges, Explorer, Comeback) with toast-on-earn (`02 §8.3`).
- [ ] **Export / Import / Copy JSON** prominent: import validates `schemaVersion`, attempts `migrate()`, shows a diff-preview before overwrite; "reset all" with confirm (`02 §8.2`, `03 §6.3`).
- [ ] Re-engagement banner (localStorage-driven, once/day, dismissible, **never modal/guilt**) + Comeback badge on 7+ day return (`02 §8.3`, `04 §6`).
- [ ] L1↔L30 recording comparison player appears once two recordings exist (`04 §4.6`, `02 §6`).

**Done when:** the Progress page shows live metrics/badges/coverage/streak; exporting then importing JSON on a "fresh" browser restores progress exactly; a mis-versioned import is refused without corrupting current data.

## S7 — Supplementary lessons (EnglishPod + 6 Minute English)

**Goal:** the Day-7 reward lessons ship — EnglishPod (speaking: shadow + role-play) and 6 Minute English (listening: quiz + INSERT stretch) — as single-star, single-sitting pages.
**Specs:** `02 §3` (supp templates), `02 §5` (30-lesson supp table + on-disk filenames), `04 §4.4` (supp pages), `04 §5.10` (quiz MCQ), `04 §5.8` (dialogue role-play), `03 §6.2` (supp JSON shapes), `02 §7` (INSERT / listening map).

- [ ] Extend the pipeline to emit `supp-pod-*` (`dg/pr/rv` + `dialogue`) and `supp-6min-*` (`audio.main` + `quiz`) JSON per the verified filenames (`02 §5`, `03 §6.2`).
- [ ] EnglishPod template (8 steps): warm-up → `dg` cold → transcript + **Key Vocab with added Uzbek gloss** → `pr` → shadow → **role-play (hide a role)** → `rv` self-quiz → mark complete (`02 §3`, `04 §4.4`).
- [ ] 6ME template (8 steps): MCQ pre-listen → predict → gist listen (hidden) → reveal + self-check → 6-word vocab + UZ gloss → re-listen with transcript (**flag `INSERT` vox-pop as the B2 stretch**) → 60-sec record → mark complete (`02 §3`, `02 §7`).
- [ ] Quiz MCQ component (select → lock → reveal ✓ / amber-not-red wrong + `explanationUz`) + dialogue role-play component (`04 §5.10`, `§5.8`).
- [ ] Single-star done model wired to progress; paired chip on the map links correctly; **S29–S30 stitch multiple Interview-Skills dialogues into a mock-interview flow** with the "bridges to a real mock" note (`02 §5`, `04 §4.4`).

**Done when:** one EnglishPod and one 6ME supplementary lesson play and complete end-to-end (quiz + role-play + record where applicable), and their Day-7 chips update on the map.

## S8 — Fun English embeds (YouTube facade + curation)

**Goal:** section 6 shows a zero-byte-until-tapped YouTube facade, and each lesson's video pick is data, not code.
**Specs:** `03 §7` (facade = the biggest first-paint win), `04 §5.9` (facade component), `04 §4.3` ⑥, `02 §4` (theme → channel per lesson).

- [ ] Facade component: lazy thumbnail (or CSS-gradient placeholder) + `▶` + title/channel; inject `youtube-nocookie.com` iframe **only on tap**, move focus in, `title` set (`04 §5.9`).
- [ ] Reads `funEnglish[]` from lesson JSON — **never hardcode a video ID** (a dead video is a JSON fix) (`04 §4.3.7`); one tiny watch-task, no test.
- [ ] Fallback: iframe blocked/failed → "YouTube'da ochish" link; watch-task text stays (`04 §9`).
- [ ] Curate the video picks per the `02 §4` channel/theme map (owner supplies exact IDs → data).

**Done when:** a lesson's Fun English shows a facade that fetches **0 bytes** of YouTube pre-tap, injects a working nocookie iframe on tap, and falls back to a link when blocked.

## S9 — How to Study (methodology) page

**Goal:** the lone learner's manual — **Uzbek-primary**, complete, so nobody gets stuck and quits.
**Specs:** `02 §6` (13-block outline), `04 §4.5` (layout), `02 §9` (bilingual policy), `02 §2` (7-day cycle + pace tracks).

- [ ] All 13 blocks (`02 §6`): how it works · 7 rules · golden rule · daily habit (7-day cycle checklist) · choose your pace (+ backward-planning table) · **speaking-alone techniques** · deep listening · peak state · vocabulary · pronunciation self-check · **top-10 Uzbek mistakes** · what to do when you struggle · FAQ.
- [ ] Uzbek-primary with English mirror via the global UZ|EN toggle; sticky mini-TOC jump links (`04 §4.5`).
- [ ] Top-10-mistakes block deep-links each L1 cluster into the core lesson that fixes it (`02 §6.11`).

**Done when:** `#/method` renders all 13 blocks bilingually, the UZ/EN toggle swaps the mirror, and every mistake link jumps to the right lesson.

## S10 — Secondary pages: IELTS/CEFR · Grammar Reference · About · Settings

**Goal:** the remaining routed surfaces that complete the app.
**Specs:** `04 §4.7` (ielts/grammar/about), `02 §7` (IELTS/CEFR alignment), `04 §2.1` (settings sheet), `03 §9` + `00 §6` (licensing note), `02 §10` (grammar appendices).

- [ ] `#/ielts`: honest "builds the competence IELTS measures, *not* a cram course" framing up front + Phase→CEFR→IELTS table + criterion→feature map + "Am I ready for a mock?" checklist (`02 §7`).
- [ ] `#/grammar`: read-only index of all Grammar Sparks (by the 4-tier grouping) linking to lessons + re-authored irregular-verb / spelling reference cards (`04 §4.7`, `02 §10`).
- [ ] `#/about`: what it is · Effortless-English credit · honest free/no-login promise · **licensing note (media = owner's responsibility, swappable bucket)** · contact `principiaforge@gmail.com` (`04 §4.7`, `03 §9`).
- [ ] Settings bottom-sheet consolidating language · pace track · theme · playback rate · export/import · reset (persists to `settings.*`) (`04 §2.1`).

**Done when:** all four routes render correctly, the IELTS framing is unmistakably honest, and settings changes persist across reload.

## S11 — Polish, accessibility & performance pass

**Goal:** the whole site meets WCAG 2.1 AA, degrades gracefully on every failure, and hits the performance budget on a cheap Android.
**Specs:** `04 §1` (P1–P7), `04 §7` (visual system / tokens both themes), `04 §8` (a11y checklist), `04 §9` (empty/edge/error matrix), `03 §8` (perf budget).

- [ ] A11y (`04 §8`): landmarks + one `<h1>`/screen · skip link first · visible focus everywhere · ≥44px targets (+8px gap) · full **player ARIA** · **bilingual `lang` attributes** (English content `lang="en"` inside Uzbek UI — the load-bearing detail) · never color-alone · `prefers-reduced-motion` disables all celebrations/equalizer/flicker · reflow at 320px & 200% zoom.
- [ ] Every empty/edge/error state from `04 §9` implemented: media-unreachable (per-track + global banner, **text still teaches**), YouTube blocked, localStorage/IndexedDB unavailable, mic denied, POV absent/text-only, slow-network skeletons (not spinners), lesson 404/malformed, invalid import, course-complete (L30 cert + re-record prompt).
- [ ] Visual tokens finalised in **both** themes with measured AA contrast (`04 §7.2`); type scale, spacing, radii, two warm shadows, phase accents (`04 §7.3`–`§7.6`).
- [ ] Perf budget met on `Slow 3G` + `4× CPU` (`03 §8`): first view ≤ ~100 KB, interactive < 3 s; per-asset budgets (`index.html` ≤12 KB, `styles.css` ≤15 KB, `app.js` ≤35 KB, `index.json` ≤40 KB, lesson JSON ≤25 KB); 0 KB fonts; YouTube 0 KB pre-tap; `?v=N` cache-bust on `app.js`.

**Done when:** an automated a11y check is clean (contrast/labels/lang), every error state in `04 §9` degrades without a dead screen, and the budget + interactive-time targets pass on the throttled rig.

## S12 — PWA / offline (phase 2) · DEFERRED

**Goal:** instant repeat loads, offline text/UI, add-to-home — the optional resilience layer. Deferrable per `03 §7`; ship only after S11.
**Specs:** `03 §7` (offline stance / app-shell SW), `02 §8.3` (re-engagement / Notification / add-to-home).

- [ ] ~40-line hand-written service worker: precache app shell + all lesson JSON + icons; cache-first for `immutable` assets, stale-while-revalidate for JSON (`03 §7`).
- [ ] `manifest.webmanifest` + icons → "Add to Home Screen".
- [ ] Optional **per-lesson "save audio offline"** via Cache API — **never** auto-cache the ~1 GB library (`03 §7`).
- [ ] Optional Notification API for the daily re-engagement nudge (opt-in) (`02 §8.3`).

**Done when:** a repeat visit loads instantly and works offline for text/UI, add-to-home installs, and one lesson's audio is savable offline — with no regression to the S11 budget.

## S13 — Content authoring completion + launch checklist

**Goal:** all 60 lessons authored and validated, full media uploaded, privacy honoured, and the site launched at $0 recurring cost.
**Specs:** `02 §4` (30 core) + `02 §5` (30 supp), `02 §6`/`§9` (Uzbek prose & policy), `03 §2.5` (full upload), `03 §9` + `00 §6` (licensing), `00 §5` (success criteria), `00 §4` (non-goals incl. no identifying analytics), `03 §8` (final budget check).
**Precondition (owner):** the media **licensing decision** is the owner's to make (`00 §6`, `03 §9`). Architecture keeps takedown trivial (swappable bucket); this slice ships the app, not legal clearance.

- [ ] Author all 30 core lessons: original Uzbek Grammar Spark prose, chunk glosses, mini-story pairs, POV gating (09–30; L19 text-only), Fun-English picks (`02 §4`).
- [ ] Author all 30 supplementary lessons with added Uzbek glosses + 6ME quiz MCQs + the S29–S30 Interview-Skills mock (`02 §5`).
- [ ] Stage + upload the **full** media payload to R2; `scripts/manifest.mjs` passes with **zero missing keys** (`03 §2.5`, `03 §5.1`).
- [ ] Privacy/analytics: **no PII / no identifying analytics** (`00 §4`); if any, a cookieless privacy-friendly counter only. `robots`/no-prerender confirms **no transcript is baked into crawlable HTML** (`03 §9`).
- [ ] Launch QA: cross-device export/import smoke test; full run-through on a real budget Android; licensing note live on About; final deploy + budget re-check (`00 §5`, `03 §8`).

**Done when:** all 60 lessons are complete and manifest-validated, media is fully uploaded and streaming/downloading at $0, no analytics identifies a person, and the site is live and pleasant on a cheap Android over slow 3G.

---

### Backlog / later layers (not slices yet)
- **Test-Day Skills page** + timed IELTS mocks / Writing-Reading practice (post-B1 optional layer, `02 §7`).
- **B2 / IELTS-Writing extension pack**; deprioritised grammar as optional "Extension" cards (`02 §4`).
- **Russian UI** (`ui.ru.json`) — drops in with no code change (`03 §7`).
- Promote **reserve** EnglishPod / 6ME episodes if a pick underperforms (`02 §5`).
