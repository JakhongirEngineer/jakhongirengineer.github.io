# 00 — Overview (SDD Root)
### Free, no-login, frontend-only English self-study for Uzbek learners

**Status:** foundational. This is the root of the Specification-Driven Development set for the project. It states *why* the product exists and *what* success looks like; the numbered specs below say *how*. Where this document and a downstream spec appear to differ, the downstream spec (curriculum, architecture) is authoritative on its own subject — this page links them, it does not override them.

**One line:** a 30-week, speaking-first English course built on AJ Hoge's *Effortless English* method, delivered as a static website that costs nothing to run, needs no account, and works on a cheap Android phone over a slow Uzbek network.

---

## 1. Vision

Give Uzbek self-learners a free, private, phone-friendly path from "I studied English at school but I can't speak" to genuine spoken fluency — and, in time, an IELTS or CEFR certificate — by engineering one behaviour above all others: *hear a question and answer out loud, fast, without translating in your head.* The site turns a curated library of authentic audio (AJ Hoge's Power English, EnglishPod dialogues, BBC 6 Minute English) into a guided, bilingual (Uzbek-scaffolded) course that a lone learner can follow every day without a teacher, a partner, a login, or a single tiyin of cost — repetition and answer-aloud drills do the teaching, Uzbek does the explaining, and localStorage remembers the progress.

---

## 2. Target students

The audience is Uzbek self-learners at **elementary+ (CEFR ~A2, reaching B1)** who have usually studied grammar-translation English at school, can read a little, but **cannot speak** — the exact skill they want most. Many aim, eventually, at IELTS or a CEFR certificate. Two representative personas:

- **Dilnoza, 19 — student in Tashkent, on a budget phone.** Preparing for IELTS on a tight timeline and a tighter budget. Studies on a low-end Android over patchy mobile data, often on the metro or in a dormitory. Cannot pay for a course or a tutor, and cannot afford to burn her data allowance on a heavy site. Needs: pages that load fast and cheap, the ability to *download* a lesson's audio once and listen passively offline, a clear "what do I do today" path, and an honest sense of how her practice maps to the IELTS Speaking bands.

- **Bekzod, 34 — working adult who wants to speak fluently.** Has a job and a family; English is for career and travel, not primarily an exam. Gets ~20–45 minutes a day, irregularly, and has quit self-study apps before out of boredom or guilt after missing days. Needs: a forgiving routine (one lesson a week, a distinct small win each day), a private way to practise speaking aloud without embarrassment, motivation that survives a missed day, and everything explained in Uzbek so he never gets stuck and gives up.

Both share the defining traits the whole product optimizes for: **cheap device, slow/metered network, no money to spend, no teacher or partner, and a fragile motivation** that punishing mechanics would destroy.

---

## 3. Product principles

1. **Free forever.** No payments, no ads, no premium tier. Hosting and delivery must fit inside permanent free tiers (see [03-architecture.md](03-architecture.md) for the verified $0 media/hosting stack).
2. **No login, ever.** No accounts, no email, no server-side identity. All progress is local ([08 in 02-curriculum.md](02-curriculum.md); `localStorage` + `IndexedDB`), with prominent **Export / Import JSON** as the accountless backup and device-move path.
3. **Works on cheap phones and slow networks.** First meaningful view ≤ ~100 KB, interactive < 3 s on throttled 3G / low-end Android; 0 KB web fonts (system stack), YouTube facades, `<audio preload="none">`, lazy per-lesson JSON. Every learner can *download* audio to listen offline and to spare mobile data.
4. **Uzbek-friendly by design.** Uzbek is the scaffolding, English is the target: everything *about* learning (UI, instructions, grammar explanations, error-fixes, methodology) is Uzbek-primary; everything *to be acquired* (transcripts, dialogues, the speaking drills) is English-only. A global UZ/EN toggle lets a confident learner hide the Uzbek — a "graduation" moment. Uzbek text uses proper modifier letters (oʻ/gʻ).
5. **Speaking is the point.** The mini-story answer-aloud loop is the engineered peak behaviour; the headline success metrics are *listening minutes* and *speaking reps*, never lesson count. Speed is never the goal — automaticity is.
6. **Simple, not over-engineered.** Lessons are *data* (JSON), not code; the renderer is a small vanilla ES-module SPA with zero runtime dependencies and no build step in the deploy path. Adding lessons never grows the app.
7. **Private and kind.** Self-recordings never leave the device. Streaks forgive missed days; re-engagement is a gentle nudge and a "Comeback" badge, never a guilt message.

---

## 4. Scope / non-goals

**In scope (v1):**
- 30 AJ Hoge core lessons (the spine) + 30 EnglishPod / 6 Minute English supplementary lessons, on one continuous Murphy-based grammar spine taught briefly in Uzbek.
- Per-lesson interactive experience: Grammar Spark, vocabulary with Uzbek glosses, deep-listening MAIN with read-along transcript, the mini-story answer-aloud drill, POV grammar stories (where present), embedded YouTube "Fun English", speak-it-yourself prompts with local mic recording, and a lesson check.
- In-site streaming **and** downloads of all media; accountless progress, stars, streaks, badges; a Study Methodology page and an honest IELTS/CEFR alignment page.

**Non-goals (explicitly out):**
- **No backend / no server.** No application server, database, or serverless functions in the request path; media sits on a static object store, data is static JSON. (Automated speaking assessment is impossible and undesired — speaking is honor-checked.)
- **No accounts, no auth, no user data collection.** No sign-up, no profiles server-side, no analytics that identify a person.
- **No payments, subscriptions, or ads.**
- **Not an IELTS cram course.** It builds the underlying spoken competence IELTS then measures; timed full mocks, band-descriptor drilling, and Writing/Reading task practice are a later, optional layer (the Interview-Skills climax S29–S30 is the bridge).
- **No build step in deploy, no CI, no second repo, no framework runtime** (rejected in [03-architecture.md](03-architecture.md) §3).
- **Media is not in the git repo.** The ~1.7–2.9 GB of audio/PDF lives off-repo (see Risks and 03).

---

## 5. Success criteria

**Product / learning outcomes**
- A committed learner completes the 30-week spine and can hold IELTS Speaking Part 1-style exchanges without translating — measured by *speaking reps* and *listening minutes*, the dashboard's hero numbers, not by lessons "finished".
- The re-record-Lesson-1-at-Lesson-30 feature lets a learner *hear* their own improvement (the core motivation proof).
- Phase badges (A2 → B1 → B2-in-progress) let learners see themselves climb the exam ladder honestly.

**Technical / delivery**
- First meaningful view ≤ ~100 KB transferred; interactive < 3 s on throttled 3G / low-end Android (budget enforced in [03-architecture.md](03-architecture.md) §8).
- All media streams (with seek/scrub via HTTP Range) **and** downloads, at **$0 egress**, from a swappable single-URL media store.
- Everything runs with no backend, no login, no build in the deploy path; total recurring cost = $0.
- Progress survives without accounts: reliable `localStorage`/`IndexedDB` with graceful degradation and JSON export/import.
- The whole UI is usable Uzbek-first, with a working UZ/EN toggle and correct Uzbek typography.

**Non-goals restated as guardrails:** if a proposed feature needs a server, an account, a payment, or a build/CI in the deploy path, it is out of scope by definition.

---

## 6. Risks

**Content licensing — the top risk, and the owner's responsibility.**
The core media is commercial/copyrighted: **AJ Hoge *Power English* / Effortless English and EnglishPod (Praxis Language Ltd.)** are commercial products; **6 Minute English** is **BBC** copyright; ***Essential Grammar in Use*** is **Cambridge University Press** copyright. Redistributing their audio/PDFs publicly requires rights the **owner must independently secure — this is a legal decision, not an architecture one.** The architecture is deliberately built to *minimise exposure and make takedown trivial* (carried from [03-architecture.md](03-architecture.md) §9):
- **All media lives in an owner-controlled bucket behind a single `MEDIA_BASE` constant**, so any source can be swapped or removed in one edit (or deleted from the bucket) without touching the app.
- Media sits behind a **custom domain, not a public search-indexed archive** (the reason the Internet Archive is rejected as a host).
- **Grammar sections are original Uzbek prose**, never reproductions of Murphy's pages; the book PDF is offered only as an optional download.
- **Transcripts are client-rendered from JSON, never prerendered into crawlable HTML** — which is *why* the architecture rejects a prerender-every-lesson approach (it would bake copyrighted text into search-indexed pages).

**Infrastructure / free-tier risks (with mitigations, from 03):**
- **Cloudflare R2 (primary media host) needs a credit card on file and a Cloudflare DNS zone.** Mitigation: $0 usage alert; the DNS move is free and does not disturb GitHub Pages. Fallback ladder needs neither in the last rung: **R2 → Backblaze B2 behind Cloudflare (one-line `MEDIA_BASE` re-point) → GitHub Releases (flat-key resolver, no card/DNS).**
- **`r2.dev` is rate-throttled / "not for production"** → always serve media via the `media.principiaforge.com` custom domain.
- **Free-tier terms can change.** R2 (10 GB, $0 egress, no expiry) and B2+Cloudflare Bandwidth Alliance were verified July 2026; **Netlify is disqualified** for new accounts (post-4-Sep-2025 credit model ≈ 15 GB/mo then suspended).
- **GitHub release assets send no CORS headers** — download uses a plain `<a>` on that fallback; the R2/B2 primary path adds one-click-with-progress download.

**Product / adoption risks (with mitigations, from [02-curriculum.md](02-curriculum.md)):**
- **A lone learner quits** (feels like no progress / boredom / speaking anxiety / confusion / a missed day / wrong pace) → the §8.4 engagement cheat-sheet pairs each quit-risk with a mechanic (stars + streak + XP + CEFR badges; content-repeats-activity-rotates; private honor-system speaking; Uzbek scaffolding everywhere; weekly streak-freeze + Comeback badge; three switchable pace tracks).
- **Exam framing intimidates a pure A2 learner** → IELTS is framed honestly as the *eventual* target the course builds toward, not a cram promise.

**Content-pipeline risk:** the source PDFs need a one-time human/AI curation pass (strip boilerplate, split mini-stories into Q&A pairs, add Uzbek glosses, resolve heavy filename irregularity) — but this is a pass the author must make anyway to add Uzbek, and it happens fully offline (`content/` stays read-only).

---

## 7. Spec map

The `specs/` set is layered root → what → how. Read in order:

| Spec | Covers |
|---|---|
| **[00-overview.md](00-overview.md)** (this file) | SDD root: vision, target students/personas, product principles, scope & non-goals, success criteria, risks (incl. licensing), and this spec map. |
| **[01-content-inventory.md](01-content-inventory.md)** | Short index of the raw content library — one paragraph + a stats table per content area — linking to the four detailed inventories below. The feasibility ground truth everything else is built on. |
| **[02-curriculum.md](02-curriculum.md)** | The learning design: goals & audience, the Effortless-English method + SLA rationale, the 3 phases (Poydevor/Sur'at/Ravonlik), core & supplementary lesson templates, the full 30-lesson core table (AJ folder → Murphy unit → vocab chunks → Fun English channel → POV gating), the 30 supplementary lessons with real on-disk filenames, the 7-day activity cycle, pace tracks, the Study Methodology page outline, IELTS/CEFR alignment, the star/streak/badge progress model, and the exact Uzbek bilingual policy. |
| **[03-architecture.md](03-architecture.md)** | The technical build: media hosting & CDN (Cloudflare R2 + fallback ladder), app hosting & buildless deploy, framework choice (vanilla ES-module SPA, zero runtime deps), the **content build pipeline** (offline PDF→JSON extraction, media staging/upload, filename normalisation), the versioned JSON data model + `localStorage`/`IndexedDB` schemas, client architecture (hash router, persistent audio, mini-story drill, YouTube facade, i18n, offline/PWA), the performance budget, and the risks & fallbacks. |
| `specs/inventory/*.md` | Four detailed content inventories (AJ Hoge, 6 Minute English, EnglishPod, grammar book) — measured file counts, sizes, durations, transcript structure, filename quirks, and per-source build recommendations. Indexed by 01. |

**Note on the content pipeline (05):** there is **no separate `05-content-pipeline.md`**. The architecture spec defines the content pipeline in full ([03-architecture.md](03-architecture.md) §5 — extract → curate → stage media → build index → validate, plus §5.3 filename normalisation), so it is folded into 03 rather than split out, keeping the spec set lean.
