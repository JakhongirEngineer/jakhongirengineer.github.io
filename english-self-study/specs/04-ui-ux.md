# 04 — UI / UX Specification (Final)
### The interface layer for the free, no-login, frontend-only English self-study site for Uzbek learners

This spec turns the pedagogy of [`02-curriculum.md`](02-curriculum.md) and the technology of [`03-architecture.md`](03-architecture.md) into a concrete, buildable interface. **Nothing here contradicts those two documents; where they made a decision, this spec renders it.** Cross-references are cited inline as *(02 §N)* / *(03 §N)*.

**One-sentence framing:** a warm, low-bandwidth, mobile-first reading-and-listening surface whose entire visual hierarchy is engineered to funnel the learner to one act — *hear a question, answer out loud* — inside a forgiving progress system that celebrates listening minutes and speaking reps, never speed.

**The non-negotiable inheritance from 03:** one `index.html` shell + hash router, **zero runtime framework**, **0 KB web fonts (system stack)**, a **single persistent `<audio>` element outside `<main>`**, YouTube as a **click-to-load facade**, progress in `localStorage["ess.progress.v1"]`, recordings in **IndexedDB**, media behind one swappable `MEDIA_BASE`. Every UI pattern below is chosen to be implementable within that envelope and within the performance budget (first view ≤ ~100 KB, interactive < 3 s on throttled 3G).

---

## 1. Design principles

Seven principles, in priority order. When two conflict, the higher one wins.

### P1 — Mobile-first for a cheap Android on a slow network
The design target is a **360–414 px-wide budget Android** on 3G, held in one hand, possibly in bright sunlight, possibly with mobile data the learner is paying for by the megabyte. Everything follows:
- **Single-column layouts** at every breakpoint; desktop is the single column centered with wider margins (max content width ~720 px reading measure), never a multi-pane dashboard.
- **Primary actions live in the thumb zone** — bottom of the viewport (docked player, bottom nav, sticky "answer aloud" / "mark done" buttons), not the top-right corner.
- **Test rig:** Moto-G-class device, Chrome, `Slow 3G` + `4× CPU` throttle. If it isn't pleasant there, it isn't done.

### P2 — Large, forgiving tap targets
- **Minimum 44 × 44 px, target 48 × 48 px** for every interactive element (WCAG 2.5.5 / 2.5.8); primary controls (play, reveal answer, record, mark done) are **56 px** tall and full-width or near-full-width.
- **≥ 8 px gap** between adjacent targets so a shaky tap never hits the wrong control.
- No hover-only affordances — everything works on touch first; hover is decoration.

### P3 — Readable bilingual Latin-script typography
The whole product is two scripts of the **same Latin alphabet** — Uzbek Latin (where both `oʻ` and `gʻ` use the modifier letter U+02BB, and the tutuq belgisi apostrophe — `surʼat`, `maʼlumot` — is U+02BC) as scaffolding, English as target — often **stacked in the same card**. Legibility is the product.
- **17 px base body**, `line-height 1.6` for paragraphs, **max line length ~66 characters** (`max-width: 66ch`).
- **Uzbek and English are visually differentiated but equal-legible** in bilingual pairs: English (the target) gets the stronger weight/size; Uzbek gloss/instruction sits beneath in a slightly smaller, muted-but-AA-compliant tone (never grey-on-grey). Convention codified in §7.
- **System font stack renders `oʻ`/`gʻ` correctly** (verified in 03 §7) — no font download, so no FOIT/FOUT flash, no layout shift, no bandwidth cost.
- **No ALL-CAPS for reading** (it slows non-native readers and mangles diacritics); reserve small-caps/uppercase for tiny labels only. Left-aligned, never justified.

### P4 — Low-bandwidth-friendly by construction
- **0 KB fonts** (system stack, 03 §8); **YouTube facade** (thumbnail → iframe only on tap, saves ~1 MB per embed, 03 §7); **`<audio preload="none">`** so no byte of a 15-minute MAIN downloads until the learner presses play.
- **Nothing autoplays.** Audio and video are always learner-initiated (also an a11y + data-cost win).
- **Skeleton placeholders**, not spinners, while lesson JSON (≤ 25 KB) loads; images `loading="lazy"`; inline SVG / emoji icons (no icon font).
- **Download-first ethos:** the MAIN talk is ~15 min; the UI actively nudges *"download it, listen on your commute"* (02 §2) so active data is spent once, not per replay.

### P5 — Warm and encouraging, never childish
The audience is **adults** who were failed by grammar-translation schooling and feel they "can't speak." The tone is a calm, competent coach, not a cartoon.
- Warm neutrals (cream/stone, not clinical white/blue-grey), **one friendly teal action color**, honey-amber reserved for achievement.
- **Rounded but restrained** (12–16 px radii), soft warm-tinted shadows — approachable, not bubbly. **No mascot, no confetti storms, no baby-talk.**
- Celebration is **tasteful and brief** (a star fills, a gentle rise, one line of Uzbek praise) and always respects `prefers-reduced-motion`.
- Encouraging, honest microcopy in Uzbek: *"Sekin, lekin har kuni"* — never a guilt trip, never a fake urgency.

### P6 — Content-first, distraction-free
The audio and the spoken answer are the stars. Chrome recedes: quiet header, no ads, no popups, no notification nags beyond the one gentle daily banner (02 §8.3). One clear next action per screen.

### P7 — Predictable & consistent
The **eleven lesson sections appear in the same fixed order every time** (02 §2); the same control means the same thing on every page; the docked player behaves identically everywhere. Predictability lets a lone A2 learner build a habit without re-learning the UI each week.

---

## 2. Information architecture & routes

Hash routing (03 §7) — zero server config, works under the `/english-self-study/` subpath. All content is client-rendered from JSON; **no transcript is ever prerendered into crawlable HTML** (03 §9 licensing).

### 2.1 Route table

| Route (hash) | Screen | Task-brief name | Primary job |
|---|---|---|---|
| `#/` | **Home / Dashboard** | home/landing | Continue where you left off; hero metrics; today's review; start here (first run) |
| `#/method` | **How to Study** | how-to-study | The methodology page (02 §6) — Uzbek-primary, the lone learner's manual |
| `#/lessons` | **Curriculum Map** | lesson list/curriculum map | The 3-phase path; all **30 weekly lessons**; pick a lesson |
| `#/lesson/core-09` | **Weekly lesson** | lesson page | The **eleven-section** weekly lesson — one whole AJ Hoge lesson + 2 grammar topics + EnglishPod + 6 Minute English (the centerpiece) |
| `#/progress` | **Progress** | (part of home/landing) | Badges, CEFR ladder, IELTS-topic coverage grid, streak calendar, export/import |
| `#/ielts` | **IELTS & CEFR** | (from 02 §7) | Honest alignment + "am I ready for a mock?" |
| `#/grammar` · `#/grammar/past-simple` | **Grammar Reference** | (from 03 routing) | Read-only index of Grammar Sparks + irregular-verb / spelling cards |
| `#/about` | **About** | about | What this is, who made it, honest framing, credits, contact |
| `#/settings` | **Settings screen (styled as a panel)** | — | Language, pace track, theme, playback rate, export/import, reset |

Unknown hash → **redirect to `#/`** (never a hard 404 on a static SPA).

> **S10 (as shipped):** Settings is a **routed full screen** at `#/settings` (rendered in `<main>`, styled as a settings panel) — **not** a bottom sheet. The sheet mechanism stays reserved for the sections menu. **Shell hook:** `settings.js` requests live shell changes by dispatching a document `CustomEvent "yp:setting" {detail:{key:"uiLang"|"theme"|"rate", value}}`; `app.js` applies it (uiLang→`setLang`; theme→`applyTheme`+`saveSetting`+`updateThemeBtn`; rate→`saveSetting`, the persistent player reads `settings.rate`). `pace` has no shell involvement and is persisted directly by `settings.js` via `saveSetting`. This is the canonical way a non-shell screen requests a live shell setting change.

### 2.2 Text sitemap

```
english-self-study/  (principiaforge.com/english-self-study/)
│
├─ #/  Home / Dashboard
│   ├─ (first run) Welcome + pick pace + "Start Lesson 1"
│   ├─ Continue card  → deep-links to last lesson + suggested day-focus
│   ├─ Hero metrics: listening minutes • speaking reps • streak
│   ├─ Weekly goal ring (5/7) + Review-today cards
│   └─ Phase path preview  → #/lessons
│
├─ #/method  How to Study  (Uzbek-primary; UZ/EN toggle)
│   ├─ How this course works · The 7 rules · The golden rule
│   ├─ The daily habit (7-day cycle) · Choose your pace (+ backward-plan table)
│   ├─ Speaking techniques you can do ALONE · Deep listening · Peak state
│   ├─ Vocabulary · Pronunciation self-check · Top-10 Uzbek mistakes (→ links into lessons)
│   ├─ What to do when you struggle · FAQ
│
├─ #/lessons  Curriculum Map
│   ├─ Phase 1 — Poydevor (A2→B1)   L01–L10
│   ├─ Phase 2 — Sur'at (B1)        L11–L20
│   ├─ Phase 3 — Ravonlik (B1→B2)   L21–L30
│   └─ each card → #/lesson/core-NN  (one weekly lesson; EP+6ME live inside it)
│
├─ #/lesson/core-NN  Weekly Lesson  (11 sections, fixed order — see §4.3)
│   0 Lesson Home & Can-Do Goal     1 Grammar Spark — 2 topics (UZ)   2 Vocabulary
│   3 Deep Listening — MAIN          4 Mini-Story Loop ★    5 POV Story (L09–30)
│   6 EnglishPod — Conversation (L15/L22 gated off)   7 6 Minute English
│   8 Fun English (YouTube facade)   9 Speak It Yourself (mic)   10 Lesson Check
│
├─ #/progress   Badges · CEFR ladder · IELTS-topic grid · Streak calendar · Export/Import
├─ #/ielts      IELTS & CEFR alignment (honest framing)
├─ #/grammar    Grammar Reference index  → #/grammar/<unit>
├─ #/about      About · credits · contact
└─ #/settings   (routed screen / panel) language · pace · theme · rate · data
```

---

## 3. Global shell & navigation

The shell (03 §7) is painted once; the router only re-renders `<main>`. Three persistent regions live **outside** `<main>` so they survive navigation: the **top bar**, the **docked audio player**, and (mobile) the **bottom nav**.

```
┌───────────────────────────────────────────┐
│ [☰]  English Self-Study        [UZ|EN] [◐] │  top bar (56px, sticky)
├───────────────────────────────────────────┤
│                                             │
│               <main>                        │  router paints here;
│         (scrolls independently)             │  scroll position reset
│                                             │  on route change
│                                             │
├───────────────────────────────────────────┤
│ ▷ Lesson 9 · Deep Listening   0:42 ▓▓░░ ⋯  │  DOCKED PLAYER (hidden until
│                                             │  a track is loaded) — persists
├───────────────────────────────────────────┤
│  ⌂ Bosh   ▤ Darslar   ◎ Natija   ⋯ Ko'proq │  bottom nav (mobile only)
└───────────────────────────────────────────┘
```

- **Top bar (56 px, sticky):** left = menu/back (`☰` on top-level screens, `←` back on a lesson); center = current context (app name on Home, "Dars 9 / Lesson 9" on a lesson); right = **global UZ|EN toggle** (02 §9 — the "graduation" control) and **theme toggle** `◐` (auto/light/dark, 03 §6.3). Keep it to these; overflow → menu.
- **Bottom nav (mobile ≤ 720 px only):** 4 thumb-reachable destinations with bilingual micro-labels — **Bosh sahifa / Home (⌂)**, **Darslar / Lessons (▤)**, **Natija / Progress (◎)**, **Ko'proq / More (⋯ → method, ielts, grammar, about, settings)**. Active item uses the phase/brand accent + label; ≥ 48 px tall. On desktop the bottom nav is replaced by links in the top bar.
- **Docked audio player:** the single persistent `<audio preload="none">` UI (§5.1). Renders **above** the bottom nav when a track is loaded; keeps playing across route changes so a learner can browse the map while a MAIN talk plays. Collapsed by default (one line); tap to expand to full transport.
- **Skip link** ("Asosiy kontentga o'tish / Skip to content") is the first focusable element (a11y §8).

---

## 4. Page-by-page wireframes

ASCII sketches are drawn at ~phone width. `[ ]` = button, `( )` = radio/toggle, `▓░` = progress fill, `⭐` = earned star, `☆` = empty star, `▷/❚❚` = play/pause.

### 4.1 Home / Dashboard — `#/`

**Returning learner** (the 90% case — optimize for "one tap back into the habit"):

```
┌───────────────────────────────────────────┐
│  Assalomu alaykum! 👋                       │
│  Bugungi maqsad: 1 ta ovozli mashq          │  (kind, specific)
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ DAVOM ETTIRISH / CONTINUE           │   │  ← the hero CTA
│  │ Lesson 9 · Kaizen                   │   │
│  │ 4-kun: Gapirish kuni ⭐              │   │  ← today's rotation (02 §2)
│  │ ▓▓▓▓▓▓░░░░  ⭐⭐☆                    │   │
│  │                    [ Davom etish → ]│   │  56px, full-width
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌── Bugungi natija ─────────────────────┐ │
│  │  🎧 1 240      🗣️ 312       🔥 12      │ │  HERO METRICS (02 §8)
│  │  daqiqa       ovozli javob   kun ketma │ │  listening min = biggest
│  │  tinglash                    -ket      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Haftalik maqsad  ◔ 3/5 kun                 │  weekly goal ring (forgiving)
│                                             │
│  ┌── Takrorlash / Review today ──────────┐ │  spaced review 1-3-7-14
│  │  🔁 Lesson 6 · takrorlash vaqti  [→]  │ │  (02 §8.3)
│  └───────────────────────────────────────┘ │
│                                             │
│  Sizning yo'lingiz →                        │
│  ● Poydevor  ○ Sur'at  ○ Ravonlik           │  phase path preview
│  [ Barcha darslar / All lessons ]           │  → #/lessons
└───────────────────────────────────────────┘
```

- **Continue card** is the single loudest element (03 §6.3 `lastLessonId`). It restores not just the lesson but the **suggested day-of-cycle focus** (02 §2 7-day rotation) so the learner always knows *what to actually do today*.
- **Hero metrics** put **listening minutes first and biggest** — the deliberate "reward volume, not speed" stance (02 §1, §8). Speaking reps second; streak third with the flame.
- **Review-today** cards appear only when a lesson's `reviewDue` ≤ today (02 §8.3); absent otherwise (no empty box).

> **S5 (as shipped).** `home.js` `renderHome()` is code-split like `lesson.js` (skeleton → dynamic import → `alive()` guard) and reads `progress.getGlobal()`. The **first-run vs returning** split is `getGlobal().hasProgress` (lastLessonId set, or any metric > 0, or any lesson started/complete). **First-run "Start" targets the first AUTHORED lesson** — `index.lessons` sorted by `order`, `[0]`, labelled with that lesson's number+title — **not** a hardcoded "Lesson 1", because the authored set currently begins at **core-09**. The pace picker persists to `settings.pace`. On the returning view, if `lastLessonId` points at a lesson **not in `index.json`** (unauthored), the Continue card **falls back to the first authored lesson**. The Continue card's day-of-cycle focus is derived from the lesson's `startedAt` (the same `dayOfCycle` as `lesson.js`).

**First run (no progress)** — the same route detects an empty `ess.progress.v1` and renders onboarding instead:

```
┌───────────────────────────────────────────┐
│         🎧🗣️                                │
│  Ingliz tilida GAPIRISHNI o'rganing         │
│  Grammatika testini emas.                   │  the honest promise (02 §6.1)
│                                             │
│  Bu kurs bepul. Ro'yxatdan o'tish yo'q.     │
│                                             │
│  Sur'atingizni tanlang / Choose your pace:  │
│  (•) Effortless — 1 dars / hafta  (tavsiya) │  default (02 §2)
│  ( ) Sprint — 1 dars / 3–4 kun              │
│  ( ) Gentle — 1 dars / 10–14 kun            │
│                                             │
│  [   1-darsni boshlash / Start Lesson 1   ] │  56px primary
│  [ Avval usulni o'qish / Read the method  ] │  → #/method
└───────────────────────────────────────────┘
```

### 4.2 Curriculum Map — `#/lessons`

> **Slice:** built in **S5** (progress engine + map) — shipped in `lessons.js` `renderMap()` (code-split like `lesson.js`). Each card's **EnglishPod / 6 Minute English availability badges** read from `index.json` (`hasEnglishPod`, §6.1 / 03 §6.1); those sections *inside* the lesson are built in **S7**.
> **S5 (as shipped).** The map renders the **three phases as fixed constants** (Poydevor teal · Sur'at indigo · Ravonlik amber — 04 §7.2) with each phase's Uzbek name + CEFR tag + "by the end I can…" line + a progress bar (**completed authored lessons in phase / authored lessons in phase**). Within each phase it renders a card for **every `index.json` lesson whose `phase` matches** — the two grammar topics come from **`grammarTitlesUz`** (falling back to `grammarUnits` slugs), the star cluster from `snapshot(id).stars`. The **recommended-next** ring marks the lowest-order authored lesson not yet complete (one gentle pulse; none under reduced-motion). **Soft locks are hints only — never disabled** (free-study ethos). A phase with **no authored lessons yet** shows a calm *"Darslar tayyorlanmoqda / Lessons are being prepared"* note — the map never fabricates entries. Because the authored catalogue is currently just **core-09**, phase 1 shows that one card and phases 2–3 show the note; the **full 30-lesson population lands in S13** as `build-index.mjs` regenerates `index.json`.

The 3-phase "path" (02 §8.3 visualization). Vertical, scroll-down = progress-forward. **No hard locks** (free-study ethos, learner autonomy) — but the *recommended next* lesson is highlighted and the speaking-gate rule is stated inline so learners self-pace honestly.

```
┌───────────────────────────────────────────┐
│  Darslar xaritasi / Curriculum Map          │
│                                             │
│  ▁▁▁ 1-BOSQICH · POYDEVOR · A2→B1 ▁▁▁       │  phase header (phase color)
│  "O'zim, oilam va kunlik hayotim haqida"    │  the phase can-do
│  ▓▓▓▓▓▓▓░░░  7/10 dars                       │  phase progress bar
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ ⭐⭐⭐  01 · Intro / Kirish        [B1] │ │  lesson card (§5.3)
│  │        Grammatika: present simple ·     │ │  the week's TWO grammar topics
│  │        chastota ravishlari              │ │
│  │        🎙️ EnglishPod   📻 6 Minute      │ │  in-lesson section badges (02 §2)
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ ⭐⭐☆  02 · Emotional Mastery    [B1] │ │
│  │        Grammatika: present cont. vs     │ │
│  │        simple · -ed/-ing sifatlari      │ │
│  │        🎙️ EnglishPod   📻 6 Minute      │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ ◔ ‹next› 09 · Kaizen             [B1] │ │  ← recommended-next ring
│  │        Grammatika: present perfect ·    │ │    (pulses gently once)
│  │        bosqichma-bosqich · POV debut    │ │
│  │        🎙️ EnglishPod   📻 6 Minute      │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ ○  15 · Taoism                   [B1] │ │  not started (empty ring)
│  │        Grammatika: might/may · passive 1│ │
│  │        📻 6 Minute  (EnglishPod yo'q)    │ │  ← EP gated off (englishPod:null)
│  └───────────────────────────────────────┘ │
│                                             │
│  ▁▁▁ 2-BOSQICH · SUR'AT · B1 ▁▁▁            │
│  🔒→ soft: "9-darsni tugating" hint only    │  no hard lock, gentle guidance
│  … (L11–L20) …                              │
│                                             │
│  ▁▁▁ 3-BOSQICH · RAVONLIK · B1→B2 ▁▁▁        │
│  … (L21–L30) …   🏁 30: re-record L1!        │  the growth-proof motivator
└───────────────────────────────────────────┘
```

- Each phase carries its **Uzbek name, CEFR tag, "by the end I can…" line, and a progress bar** (02 §1).
- **CEFR badges** (A2 ✓ / B1 ✓ / B2 in progress) render at phase boundaries as the learner crosses them (02 §7).
- Each card shows the week's **two grammar topics** (the day-1/day-3 hooks) and small **🎙️ EnglishPod / 📻 6 Minute** badges for the in-lesson sections (02 §2). On **L15 & L22** the EnglishPod badge is absent (`hasEnglishPod:false`, §6.1) — there is no separate supplementary list anymore; every asset lives inside its weekly lesson.

### 4.3 Weekly Lesson Page — `#/lesson/core-NN` — THE CENTERPIECE

One page = one **whole weekly AJ Hoge lesson** wrapped with two grammar topics + EnglishPod + 6 Minute English (02 §2). The **eleven sections** render **top-to-bottom in the fixed pedagogical order 0→10**. The shipped S3 look & feel is **approved and extended, not redesigned** — this adds a second Grammar-Spark card (①) and the EnglishPod (⑥) + 6 Minute English (⑦) sections; nothing is removed and no existing section is re-styled. The page is long and scrollable; a **sticky section-progress strip** under the top bar lets the learner jump, and the **docked player** rides along at the bottom. Section ❹ (Mini-Story) is the visually elevated "heart"; ⑤ (POV) stays elevated as the grammar-acquisition engine.

```
┌───────────────────────────────────────────┐
│ ←  Dars 9 / Lesson 9              [UZ|EN]   │  top bar
├───────────────────────────────────────────┤
│ ⓿①②③❹⑤⑥⑦⑧⑨❿  Bugun: 4-kun ⭐         │  sticky section strip (11) +
│  (done sections filled; tap = scroll-to)    │  today's day-focus chip
╞═════════════════════════════════════════════╡

  ⓿  BU DARSDA / IN THIS LESSON
  ┌───────────────────────────────────────┐
  │ Kaizen — kichik qadamlar bilan katta   │
  │ o'zgarish.                             │  theme, bilingual
  │                                        │
  │ 🎯 Dars oxirida ayta olasiz:           │  CAN-DO GOAL (measurable)
  │ "Did you change?" — to'xtamasdan javob │
  │ By the end: answer without pausing.    │
  │                                        │
  │ ⏱️ ~35 daqiqa   ·   💪 Turing, jilmayi │  time + peak-state ritual
  │    -ng, ovozingizni baland qiling!     │  (stand, smile, big voice)
  └───────────────────────────────────────┘

  ①  GRAMMATIKA (o'zbekcha) — A va B / GRAMMAR SPARK — 2 topics
  ┌───────────────────────────────────────┐
  │ [ A ]  [ B ]    ← two tabs/cards (§5.11)│  grammar[0]=A (kun 1–2), grammar[1]=B (3–4)
  ├───────────────────────────────────────┤
  │ A · Present perfect: since / How long  │  UZBEK explanation (grammar[0])
  │ 🏷️ IELTS Part 1 · B1 can-do            │  band-lifter / CEFR tag (02 §2/§4)
  │ [ prose … bodyHtml, sanitized ]        │
  │                                        │
  │ ⚠️ Xato tuzatish: Oʻzbekcha '-gan' har │  per-topic L1-contrast + error-fix
  │ doim ham present perfect emas …        │  (the spaced micro-card seed)
  │                                        │
  │  Mashq 1/3:  I ___ English since 2020. │  interactive drill
  │   [ have studied ] [ studied ] [ study]│  tap-to-answer → instant ✓/✗
  │                                        │
  │  ✍️ Oʻzingiz haqingizda rost gap ayting│  "say a true sentence" drill
  │     (ovoz chiqarib): "I have … since …"│
  │                                        │
  │  📄 Murphy Unit 16 (PDF)  [ Yuklash ]  │  OPTIONAL reference download only
  └───────────────────────────────────────┘
  (Tab B → grammar[1]: "bosqichma-bosqich   │  identical card shape for topic B;
   oʻzgarish", its own band-lifter tag,     │  its own Xato tuzatish + drills +
   drills, say-true, optional download.)    │  "say a true sentence"

  ②  SO'ZLAR / VOCABULARY
  ┌───────────────────────────────────────┐
  │  ▷ Vocab audio (6:20)      [ Yuklash ] │  section player trigger
  │                                        │
  │  ┌──────────┐  ┌──────────┐            │  VOCAB FLIP-CARDS (§5.4)
  │  │ improve  │  │ tiny step│  … swipe → │  front: EN chunk + 🔊
  │  │   🔊     │  │   🔊     │            │  tap → flips to UZ gloss
  │  └──────────┘  └──────────┘            │  + EN example
  │  6/12 ko'rildi   [ Hammasini ko'rish ] │
  └───────────────────────────────────────┘

  ③  CHUQUR TINGLASH — MAIN / DEEP LISTENING
  ┌───────────────────────────────────────┐
  │  Nima haqida: Kichik odatlar katta     │  2-line UZ "what it's about"
  │  natijaga olib keladi.                 │
  │                                        │
  │  ┌─────────────────────────────────┐  │
  │  │ ▷  MAIN talk        15:04       │  │  big section player
  │  │    Tinglangan: ●●○ (2/3)        │  │  repeat-listen counter (→ ★ gate)
  │  └─────────────────────────────────┘  │
  │  [ ⬇ Yuklab oling — yo'lda tinglang ] │  DOWNLOAD nudge (03 §2.3)
  │                                        │
  │  ▤ Matn / Transcript      [ Ko'rsat ] │  read-along, collapsed by default
  │  ┌─────────────────────────────────┐  │  (English only, lang="en")
  │  │ Today I want to talk about…     │  │  tap a paragraph = highlight
  │  │ …small changes, big results…    │  │  your place; use ⟲10s to replay
  │  └─────────────────────────────────┘  │
  └───────────────────────────────────────┘

  ❹  GAPIRISH / MINI-STORY SPEAKING LOOP   ★ THE ENGINE
  ┌═══════════════════════════════════════┐   (elevated: accent border,
  ║  Savolni eshiting → OVOZ CHIQARIB      ║    subtle tinted background)
  ║  javob bering → tekshiring.            ║
  ║                                        ║
  ║  ┌─────────────────────────────────┐  ║
  ║  │ ▷  Mini-story audio    9:00     │  ║
  ║  └─────────────────────────────────┘  ║
  ║                                        ║
  ║  Savol 3/24                            ║   MINI-STORY DRILL (§5.6)
  ║  ┌─────────────────────────────────┐  ║
  ║  │ Did Hiro want to change?        │  ║   question (EN)
  ║  │                                 │  ║
  ║  │   ⏱️ Hoziroq javob bering!      │  ║   2–3s "answer NOW" beat (UZ)
  ║  │   [ Javobni ko'rsatish ]        │  ║   tap-to-reveal
  ║  └─────────────────────────────────┘  ║
  ║  (revealed:) "Yes, he wanted to        ║   italic answer (EN)
  ║   change."  →  Men aytdim: [✓] [✗]     ║   honor self-check → next
  ║                                        ║
  ║  🗣️ Bugun ovoz chiqarib: 18 marta      ║   live rep counter (dopamine)
  ┕═══════════════════════════════════════┙

  ⑤  GRAMMATIKA JONLI / POV STORY   (L09–30 only)
  ┌───────────────────────────────────────┐   • hidden entirely for L01–08
  │  ▷ POV audio   7:10   +  ▤ Matn        │   • L19: text-only (optional TTS),
  │  Qaysi zamon o'zgardi: hozirgi → o'tgan │     no audio player shown
  │  (same story, past tense)              │   (gated on presence, 03 §5.3)
  └───────────────────────────────────────┘

  ⑥  SUHBAT / ENGLISHPOD — CONVERSATION   (L15 & L22: hidden — englishPod:null)
  ┌───────────────────────────────────────┐   ← the SPEAKING half (02 §2/§3; §4.4)
  │  Mavzu (2 satr) + taxmin savoli         │   bilingual warm-up
  │  ▷ Dialog (dg · ~1 min) — avval matnsiz │   listen cold for gist
  │  ▤ Matn + Key Vocabulary (EN + UZ gloss)│   we ADD the Uzbek gloss (02 §3.3)
  │    resolution — "vaʼda / niyat"          │
  │  ▷ Izoh (pr · ~10 min)  [Sprint: skip]  │   hosts' explanation
  │  🗣️ Shadow — qatorma-qator takrorlang    │   shadowing (§5.8)
  │  🎭 Rol o'yin: A → B (ovoz chiqarib)     │   role-play = the speaking win
  │    [ hide A ] [ hide B ]  (opt. record)  │
  │  ▷ Takror (rv) + o'z-o'zini tekshirish  │   review recap
  └───────────────────────────────────────┘

  ⑦  TINGLASH MASHQI / 6 MINUTE ENGLISH    (all 30 — the B1→B2 stretch)
  ┌───────────────────────────────────────┐   ← the LISTENING/IELTS half (02 §2/§3)
  │  Oldindan savol (MCQ) — bilingual        │   pre-listening quiz Q (§5.10)
  │    "How much …?"  ( )a ( )b ( )c         │
  │  🔮 Taxmin → ▷ ~6 min (matnsiz)          │   predict + gist listen, hidden
  │  ✅ Javobni ochish + o'zini tekshirish   │   reveal + self-check
  │  So'zlar: 6 ta target + Uzbek gloss      │   6-word pack + UZ (02 §3.5)
  │  ▷ Qayta tinglang + ▤ matn               │   again WITH transcript
  │    ⭐ INSERT bo'laklariga e'tibor bering  │   vox-pops = the B2 accent stretch
  │  → Speak-It (⑨) uchun ozuqa              │   feeds the 60-sec recording
  └───────────────────────────────────────┘

  ⑧  ZAVQ BILAN / FUN ENGLISH
  ┌───────────────────────────────────────┐
  │  ┌─────────────────────────────────┐  │   YOUTUBE FACADE (§5.9)
  │  │      [css-gradient]  ▶           │  │   CSS-gradient poster + ▶ glyph;
  │  │   Kaizen for kids · @EnglishSing │  │   iframe injected ONLY on tap
  │  └─────────────────────────────────┘  │   (youtube-nocookie; 0 YT bytes pre-tap)
  │  📺 Watch-task: 3 ta yangi so'zni yozing│   one tiny task, no test
  └───────────────────────────────────────┘

  ⑨  O'ZINGNI SINAB KO'R / SPEAK IT YOURSELF
  ┌───────────────────────────────────────┐
  │  Vazifa: "Have you ever wanted to      │   IELTS-style prompt
  │  change a habit?" — 60 soniya gapiring, │
  │  shu haftaning 2 grammatikasidan foyd. │   USE this week's two grammar topics
  │                                        │
  │      ●  [ Yozib olish / Record ]       │   mic → IndexedDB (03 §6, local)
  │      (nothing is uploaded — faqat siz)  │   privacy reassurance, UZ
  │                                        │
  │  Saqlangan / Saved:  ▷ 0:58  🗑        │   playback + delete
  │  💡 1-darsdagi yozuvingizni 30-darsda   │   re-record-L1-at-L30 hook
  │     qayta eshiting!                    │
  └───────────────────────────────────────┘

  ❿  DARSNI YAKUNLASH / LESSON CHECK
  ┌───────────────────────────────────────┐
  │  ☑ Grammatika A                        │   CHECKLIST → STARS (§5.7)
  │  ☑ Grammatika B                        │
  │  ☑ So'zlar ko'rildi                    │
  │  ☑ MAIN ×3 tinglandi                   │
  │  ☑ Mini-story ×2 OVOZ CHIQARIB  ← GATE │   mandatory speaking gate (02 §8)
  │  ☐ POV ×2                              │   (omitted L01–08)
  │  ☐ EnglishPod (shadow + rol)           │   → 2★  (auto ✓ on L15/L22)
  │  ☐ 6 Minute English (MCQ + so'zlar)    │   → 3★
  │  ☐ Fun English                         │   → 2★
  │  ☐ Yozib oldim (recording)             │   → 2★ (2nd recording → 3★)
  │                                        │
  │  Hozirgi daraja:  ⭐⭐☆  (Strong)      │   live star state
  │  +40 XP · 🎧 +34 daqiqa · 🔥 12-kun    │   what this session earned
  │                                        │
  │  [   ⭐ 1-yulduzni olish (Complete)   ]│   disabled until GATE ✓ ;
  │  Keyingi takrorlash: 3 kundan keyin     │   schedules reviewDue +1/3/7/14
  └───────────────────────────────────────┘
```

**Lesson-page behaviors — the load-bearing details:**

1. **Section order is fixed and never reordered** (02 §2). Sections gate on *presence of data*, not on a config toggle: **POV** renders only when `audio.pov` (or a POV transcript) exists (03 §5.3, §6.2) — for L01–08 the section is **absent, not greyed** (no dead UI); for L19 it renders as text-only with an optional TTS "read aloud" button and **no audio transport**. **EnglishPod (⑥)** gates the same way — rendered only when `englishpod` is present; on **L15 & L22** (`englishPod:null`) the whole section is **absent, not greyed** (02 §5), and its Lesson-Check step auto-satisfies. **6 Minute English (⑦)** is present on all 30 lessons.
2. **Sticky section strip** (`⓿①②③❹⑤⑥⑦⑧⑨❿` — eleven glyphs) sits directly under the top bar; on an EnglishPod-gated lesson the ⑥ glyph is dropped so the strip stays contiguous. Filled glyphs = sections whose checklist step is done; the current section highlights on scroll (IntersectionObserver); tapping a glyph smooth-scrolls to it. It doubles as an at-a-glance completion readout. The **day-of-cycle chip** ("Bugun: 4-kun") is a soft suggestion, not a constraint — it just tells the learner which sections to prioritize *today* per the 7-day rotation (02 §2).
3. **Sticky / docked audio player behavior (the key interaction):**
   - Each audio section (Vocab, MAIN, Mini-story, POV, **EnglishPod `dg`/`pr`/`rv`, 6 Minute English**) shows an **inline "section player" trigger** — a labelled play button + duration + repeat-counter. Tapping it **loads that track into the one persistent `<audio>`** (03 §7) and starts playback.
   - The **docked player** (bottom) then reveals, showing the active track's title, scrubber, time, and transport. **It persists across route changes** — the learner can scroll away, open the map, even open another lesson, and the MAIN keeps playing (the "download-and-listen-passively" behavior, in-app).
   - Only **one track plays at a time**; loading a new section's audio replaces the current source and the previously-active inline trigger returns to its idle state. The active section's inline trigger shows a **playing state** (animated equalizer glyph, `aria-pressed`).
   - Position is saved to `localStorage` on throttled `timeupdate` (~5 s) and restored on return; a track passing ~90% marks `done` and **increments the repeat-listen counter** feeding the ★ gate (03 §6.3, 02 §8.1).
   - **Transcript is read-along, not time-synced** — an honest, consistent resolution of *02's "tap a line to replay"* against *03's "PDFs carry no timestamps"* (03 §6.2). The learner taps a paragraph to **highlight/keep their place**; audio re-listening uses the player's **⟲10 s / ⟲15 s replay** (the shadowing control, 03 §7), not per-line seek. This ships now with zero fake precision; if word-level timing data is ever authored, line-seek becomes a pure enhancement.
4. **Transcript display:** collapsed by default (bandwidth + focus — 02 §2 wants ears before eyes); a `[Ko'rsat / Show]` toggle reveals it. Rendered **English-only, `lang="en"`** (immersion, 02 §9), comfortable measure (66ch), 1.6 line-height, generous paragraph spacing. A small "what it's about" 2-line **Uzbek** summary sits above it for orientation (02 §9).
5. **Vocab cards with Uzbek:** flip-cards (§5.4) — front = English chunk + a 🔊 (Web Speech API TTS, 0 KB, graceful fallback to the VOCAB section player where TTS is unavailable); back = Uzbek gloss + English example sentence. Chunks/collocations, never bare words (02 §2). A "seen" toggle feeds the vocab-reviewed checklist step.
6. **Grammar panel (Uzbek) — TWO topics (①):** a two-card / two-tab panel over the `grammar[]` array (A = `grammar[0]`, Days 1–2; B = `grammar[1]`, Days 3–4, §5.11). Each card renders the Uzbek prose (`grammar[i].bodyHtml`, precompiled + sanitized, 03 §4), a **🏷️ band-lifter / CEFR can-do tag** (`bandLifter`/`cefrCanDo`, 02 §2/§4), an explicit **L1-contrast callout**, its own **⚠️ "Xato tuzatish" error-fix card** (`grammar[i].errorFixUz` — the L1-trap that also recurs as a spaced micro-card, 02 §2/§6), 2–3 **interactive drills** with instant ✓/✗ and an Uzbek hint on wrong — a gap-fill with an `options[]` array renders as a **tap-to-answer MCQ** (green ✓ / amber-not-red wrong + `hintUz`); a gap-fill without options falls back to a **reveal + honor self-check**; `say-true` is a spoken honor-check (no text input anywhere) *(the `options[]` field is optional, 03 §6.2)* — a closing **"say a true sentence about yourself" spoken** prompt, and an **optional Murphy-unit PDF download** when `reference` is present (Murphy is reference-only, never the drill-to-mastery treatment — comprehension only, 02 §1/§4). Both cards (`grammarA` + `grammarB`) must be reviewed for the 1★ minimum (02 §8.1).
7. **EnglishPod section (⑥) — the SPEAKING half** *(built S7; reuses §5.8)*: warm-up → `dg` cold listen → transcript + **Key Vocabulary with our added Uzbek gloss** → `pr` explanation *(skippable on Sprint)* → **shadow** line-by-line → **role-play** Role A then B (a `dialogue` role-play line with a "hide this role" toggle, §5.8) → `rv` recap. Rendered only when `englishpod` is present (gated off L15/L22, behavior 1). The full 8-beat flow is specified in §4.4.
8. **6 Minute English section (⑦) — the LISTENING/IELTS half** *(built S7; reuses §5.10)*: pre-listening **MCQ** (from `sixmin.quiz`, §5.10) → predict → gist listen (transcript hidden) → reveal answer + self-check → the **6 target words with Uzbek gloss** → re-listen with `transcripts.sixmin` shown, flagging the **`INSERT` vox-pop** clips as the hardest B2 accent stretch → feeds the Speak-It 60-sec recording (⑨). The full 8-beat flow is specified in §4.4.
9. **YouTube embed (⑧):** click-to-load facade (§5.9, 03 §7) — a **CSS-gradient poster** (not a thumbnail fetch — that would be a YouTube byte) + play glyph + title/channel + the tiny watch-task; the `youtube-nocookie.com` iframe is injected only on tap (the only YouTube byte, → marks the `fun` step + moves focus in). Never hardcode a video ID in code — it comes from lesson JSON (`funEnglish[].id`) so a dead video is a data fix, not a code change (02 §4). **`id:null`** → a "Search on YouTube" link + a "Koʻrdim / Watched" honor acknowledge (never a dead button; 2★ stays reachable); **blocked/failed** → an "Open on YouTube" link with the watch-task still shown (§9). *(Shipped as the lazy `lesson-fun.js`, S8 — see §5.9.)*
10. **Speak-It (⑨):** the IELTS-style prompt explicitly asks the learner to **use this week's two grammar topics** in a 60-sec recording (02 §2); mic → IndexedDB, nothing uploaded (built S4).
11. **Download buttons per asset:** every playable/readable asset (AJ set + EnglishPod `dg`/`pr`/`rv` + 6ME) carries a **download control** wired to the lesson JSON `downloads[]` (03 §6.2). Baseline is `<a href download>`; on the R2/B2 path it upgrades to one-click-with-progress via `fetch→blob` (03 §2.3), showing states **Download → 37% → Saved ✓ (offline)**. Labels are Uzbek + a size hint (e.g., *"Asosiy audio · MP3 · 33 MB"*) so a learner on metered data decides consciously.
12. **Mark-complete control:** the **Lesson Check** checklist (§5.7). Steps are honor-system checkboxes (02 §8.1); the **speaking gate is enforced in the UI** — the *"Complete / earn ★1"* button is **disabled with a clear Uzbek reason** (*"Avval mini-story savollariga ovoz chiqarib javob bering"*) until the mini-story-aloud step is checked. 1★ needs both grammar topics + vocab + MAIN×3 + the gate; **EnglishPod + Fun + a recording lift to 2★; 6 Minute English + a second recording lift to 3★** (02 §8.1). Completing awards stars, logs listening minutes + speaking reps + XP, updates streak/badges, and schedules `reviewDue` (02 §8, 03 §6.3).

### 4.4 In-lesson EnglishPod & 6 Minute English sections (rendered inside §4.3, ⑥ & ⑦)

> **These are sections *inside* the weekly lesson, not separate pages** — there is no `#/lesson/supp-*` route anymore; every `#/lesson/:id` is a weekly lesson. Completion is **not** a separate star: the EnglishPod flow satisfies `steps.ep` and the 6ME flow satisfies `steps.sixmin` in the *same lesson's* Lesson-Check (§5.7, 02 §8.1). Both reuse the weekly lesson's shell, docked player, and download/transcript components.

> **Slice:** built in **S7** (both section flows + quiz MCQ §5.10 + role-play §5.8), lazily imported as `lesson-episodes.js` (03 §4); authored across all 30 lessons in **S13**. **Not part of S3** — until S7, sections ⑥/⑦ render as honest S-tagged placeholders inside the lesson page.

**EnglishPod section — the SPEAKING half (7 beats; present unless `englishPod:null`, i.e. hidden on L15 & L22).** Consolidates the week's AJ theme with a real conversation; no new grammar (02 §3):

```
  ⑥  SUHBAT / ENGLISHPOD — CONVERSATION
┌───────────────────────────────────────────┐
│ ① Mavzu / Warm-up (bilingual, 2 lines + a   │
│    prediction question tied to the AJ theme)│
│ ② ▷ Dialog (dg · ~1 min) — avval matnsiz    │  listen cold for gist
│ ③ ▤ Matn + Key Vocabulary (EN + UZ gloss)   │  we ADD the Uzbek gloss
│    understaffed — "yetarli xodim yo'q"       │  (02 §3, verified) — englishpod.keyVocab
│ ④ ▷ Izoh (pr · ~10 min)  [Sprint'da skip]   │  hosts' explanation
│ ⑤ 🗣️ Shadow — qatorma-qator takrorlang      │  shadowing (§5.8)
│ ⑥ 🎭 Rol o'yin: A → B  (ovoz chiqarib)      │  role-play = the speaking win
│    [ hide A ] [ hide B ]  (optional record) │  (§5.8 dialogue role-play line)
│ ⑦ ▷ Takror (rv) + o'z-o'zini tekshirish     │  review recap
└───────────────────────────────────────────┘
   → completing shadow + one role played sets steps.ep (→ 2★, §5.7)
```

**6 Minute English section — the LISTENING/IELTS half (7 beats; on all 30 lessons).** BBC accents + built-in quiz; the B1→B2 stretch (02 §3):

```
  ⑦  TINGLASH MASHQI / 6 MINUTE ENGLISH
┌───────────────────────────────────────────┐
│ ① Mavzu + oldindan savol (MCQ) — bilingual  │  pre-listening quiz Q (sixmin.quiz)
│    "How much sugar…?"  ( )a ( )b ( )c        │
│ ② 🔮 Taxmin qiling (predict)                │
│ ③ ▷ Bir marta tinglang (~6 min) — matnsiz   │  gist, transcript hidden
│ ④ ✅ Javobni ochish → o'zini tekshirish     │  reveal + self-check
│ ⑤ So'zlar: 6 ta target + Uzbek gloss        │  6-word pack + UZ (sixmin.vocab)
│ ⑥ ▷ Qayta tinglang + ▤ matn                 │  again WITH transcripts.sixmin;
│    ⭐ INSERT bo'laklariga e'tibor bering     │  flag vox-pop = B2 accent stretch
│ ⑦ 🗣️ → Speak-It (⑨): 60s IELTS-savoliga (●) │  feeds the weekly recording
└───────────────────────────────────────────┘
   → quiz answered + 6-word pack reviewed (honor) sets steps.sixmin — OR the gist-listen
     counter listens.sixmin≥1 does (the S5 OR-gate) (→ 3★, §5.7)
```

- The **quiz MCQ** (§5.10) shows options, locks a choice, then on ④ reveals the answer with an **Uzbek explanation** (`explanationUz`, 03 §6.2) — trains "listen for a specific answer" (02 §7).
- The **`INSERT` vox-pop** stretch is explicitly flagged in ⑥ as the hardest, most IELTS-like audio (02 §3, §7).

> **S7 (as shipped).** The two sections render from a lazily-imported `lesson-episodes.js` (`englishPodSection(id,l,ctx)` / `sixMinSection(id,l,ctx)`; ctx carries `trackTrigger/downloadBtn/transcriptBlock/findDl/markEp/markSix`). Refinements over the wireframe:
> - **EnglishPod ⑥:** the `pr` beat ④ shows a **"skip on Sprint"** chip for Sprint-pace learners; each dialogue line offers an **optional per-line 🔊 replay via Web Speech TTS** (transcripts carry no timestamps per 03 §6.2, so TTS is the honest per-line replay — rendered only when available, no dead control otherwise); role-play **hide-toggles are derived per *distinct speaker*** (robust to named speakers, not hard-coded A/B), and the say-button is hidden on the currently-hidden role. `steps.ep` flips only after **both** shadow **and** one role are played (previously fired on merely opening the dialogue).
> - **6ME ⑦:** the quiz is split into a **head** (options, shown at the prediction beat ②) and a **tail** (reveal, shown *after* the gist listen ③) so the reveal genuinely follows listening; the 6-word pack gets a **"reviewed" honor check**; `steps.sixmin` flips after quiz-answered **and** pack-reviewed (OR the gist-listen counter). **INSERT vox-pop paragraphs are visually highlighted** in the re-listen transcript, not merely noted.
- **Interview-Skills bridge:** the six EnglishPod *Interview Skills* dialogues are woven into the self-presentation lessons' ⑥ sections (**L04, L18, L19, L26, L27, L29**) and climax at the **L30 capstone**, forming the IELTS-interview bridge; the `#/ielts` page (§4.7) surfaces the *"this bridges to a real/paid mock"* guidance (02 §0.5/§5).

### 4.5 How to Study — `#/method`

The lone learner's manual. **Uzbek-primary** (02 §6, §9). Long, scannable, card-per-rule; the global UZ|EN toggle swaps to the English mirror.

```
┌───────────────────────────────────────────┐
│  Qanday o'rganish kerak / How to Study      │
│  📌 Va'da: siz GAPIRISHNI o'rganasiz.       │  the honest promise
│                                             │
│  Ichidagilar / Contents  (jump links)       │  sticky mini-TOC
│  1 Kurs qanday ishlaydi  2 7 qoida …        │
│                                             │
│  ┌── 7 QOIDA ────────────────────────────┐ │  one card per rule,
│  │ 1 · So'z emas, IBORA o'rganing         │ │  bilingual + 1-line "why"
│  │    Learn phrases, not words.           │ │
│  └───────────────────────────────────────┘ │
│  … cards 2–7 …                              │
│                                             │
│  ⭐ OLTIN QOIDA: har kuni OVOZ CHIQARIB     │  the golden rule, emphasized
│                                             │
│  Kunlik odat (30–45 daq) — 7 kunlik tsikl:  │  the 7-day cycle as a checklist
│   ▢ 1 Grammatika  ▢ 2 Chuqur tinglash  …    │
│                                             │
│  Sur'atni tanlang  [Effortless][Sprint][…]  │  pace + backward-plan table
│                                             │
│  🗣️ YOLG'IZ gapirish mashqlari:             │  the heart of the page
│   • Mini-story javob • Shadowing • Yozib ol │
│   • POV retelling • Self-talk               │
│                                             │
│  Talaffuz: /v/–/w/, /θ/–/s/ …               │  pronunciation self-check
│  Eng ko'p 10 xato → [har biri darsga link]  │  10 L1 clusters → deep-links
│  FAQ  ▸ …                                    │
└───────────────────────────────────────────┘
```

Every one of 02 §6's 13 blocks is a section here; the **Top-10-mistakes** block deep-links each cluster into the core lesson that fixes it (02 §6.11).

> **S9 (as shipped).** `method.js` `renderMethod(main, seq, alive)` is code-split like `lesson.js` (`app.js` shows `screenSkeleton()`, then dynamic-imports it under an `alive()` guard). All 13 blocks of 02 §6 are authored as **inline bilingual `{uz,en}` pairs inside `method.js`** (not in the shell `ui.*.json` dicts), so the always-loaded dictionary stays lean and the prose downloads only on `#/method`. The page is **Uzbek-primary and renders the active language only**; the global UZ|EN toggle swaps to the English mirror by re-rendering (`setLang → render()` re-invokes `renderMethod`), rather than showing both languages at once. Each text node's `lang` follows the active content; **English demo/example lines** (technique demos, minimal pairs, sample sentences) stay `lang="en"` in both modes (immersion, 02 §9). Only `t("route.method.title")` is used for the single `<h1>`; everything else is inline. The sticky mini-TOC is **13 numbered jump *buttons*** (buttons + smooth-scroll that respects `prefers-reduced-motion`, not `#hash` anchors — so the hash router is never disturbed). **Block 11** deep-links each of the 10 L1 clusters to `#/lesson/core-NN` (articles→core-04, dropped copula→core-01, 3rd-person -s→core-01, do/does→core-23, present perfect→core-09, prepositions→core-02, he/she/it gender→core-01, word order→core-01, have/have got→core-12, plurals/countability→core-10); the 4 below-B1-floor clusters (dropped copula, 3rd-person -s, he/she/it gender, have/have got) are additionally badged as recurring **"Xato tuzatish"** micro-cards. Today only core-09 resolves; the rest show the graceful not-found card until S13 authors them. **Block 13 (FAQ)** is a native `<details>/<summary>` accordion (5 Q&A).

### 4.6 Progress — `#/progress`

Everything the accountless system knows about the learner, made visible and **portable** (02 §8, 03 §6.3). Framed as growth, never deficit.

```
┌───────────────────────────────────────────┐
│  Sizning natijangiz / Your Progress         │
│                                             │
│  🎧 1 240 daqiqa   🗣️ 312 javob   ● 4 yozuv│  the hero counters again
│                                             │
│  CEFR bosqichlari:                          │
│  [A2 ✓] [B1 ◔ jarayonda] [B2 ○]             │  CEFR ladder (02 §7)
│                                             │
│  🔥 Ketma-ketlik / Streak — 12 kun          │
│  ┌─ Iyul ──────────────────────────────┐   │  streak calendar (month)
│  │ M T W T F S S                        │   │  ● active · ❄ freeze-used
│  │ ● ● ● ❄ ● ● ●  ● ● ● ● ● ○ ○         │   │  · ○ upcoming
│  └───────────────────────────────────────┘   │
│  Eng uzun: 20 kun · Bu hafta: ◔ 3/5          │
│                                             │
│  🏅 Nishonlar / Badges                      │  badge gallery
│  [🥇First][🔥7d][🎧Listener][🔒Speaker 62/100]│  earned bright; locked
│                                             │  greyed + progress hint
│  🎯 IELTS mavzular / Topic coverage         │  coverage grid (~20 cells)
│  ┌─┬─┬─┬─┬─┐  yashil = mashq qilingan       │  fills as topics practiced
│  │▓│▓│░│▓│░│  family food home study …      │
│  └─┴─┴─┴─┴─┘                                │
│                                             │
│  🎙️ O'sishni eshiting: L1 ▷ vs L30 ▷        │  re-record comparison player
│                                             │
│  💾 Ma'lumot / Your data                    │
│  [ Eksport (JSON) ] [ Import ] [ Nusxa 📋 ] │  export/import (03 §6, 02 §8.2)
│  [ Hammasini o'chirish ]  (confirm)         │
└───────────────────────────────────────────┘
```

- **Export / Import JSON is prominent** — the *only* safe way to move devices / survive a cache-clear without accounts (02 §8.2, 03 §6). Includes copy-to-clipboard. Import validates `schemaVersion` and shows a diff-preview before overwrite.
- The **L1-vs-L30 recording comparison** (02 §6, §8.4) is a two-button player that appears once both recordings exist — the emotional payoff of the whole course.

> **S6 (as shipped).** `progress-page.js` `renderProgress(main, seq, alive)` is code-split (skeleton → dynamic import → `alive()` guard). Sections in order: **(1)** hero counters reusing `.hmetrics` (listening minutes biggest, speaking reps, **recordings**); **(2)** CEFR ladder [A2/B1/B2] derived from index phase completion — a rung is *reached* when all **authored** lessons of that phase are ≥1★, else *in progress* / *not yet* (phase 1 is always at least in-progress); **(3)** month streak calendar — because the schema logs no per-day history, the run is an **honest approximation** from the streak fields (the last `count` days up to `lastActiveDate` render ● active, a freeze used this ISO-week shows one ❄ just before the run, future days ○ upcoming — never over-claims); **(4)** badge gallery — 15 badges, earned bright / locked greyed + an "n/target" hint (`role="img"`, bilingual aria); **(5)** IELTS coverage grid — a **fixed 20-topic set** filled by mapping each **completed** lesson's index tags/theme/slug to topics via keyword matchers, reconciled into `ieltsTopics` via `setTopicCoverage` (max-merge, persisted); **(6)** L1↔L30 comparison — reads IndexedDB (`ess-recordings/recordings`), two mini players (earliest vs latest lesson by index order) only when ≥2 recordings exist, else a "record to start" hint; **(7)** Data block — Export (JSON download) · Copy (clipboard, textarea fallback) · Import (paste **or** file → Preview[before-vs-incoming diff] → Confirm overwrite) · Reset all (inline confirm). **Reset keeps settings** (uiLang/theme/pace/rate) and also clears the IndexedDB recordings store so `metrics.recordings` can't resurrect. Badge earn dispatches a shell `"yp:badge"` toast (the `app.js` listener maps ids→labels and shows one brief toast per new id).

### 4.7 IELTS & CEFR — `#/ielts`  ·  4.8 Grammar Reference — `#/grammar`  ·  4.9 About — `#/about`

- **`#/ielts`** (bilingual, 02 §7): the honest "this builds the competence IELTS measures; it is *not* a cram course" statement up front; the Phase→CEFR→IELTS table; the Speaking-criterion→feature map; a plain "**Am I ready for a mock?**" checklist (finished Phase 3, comfortable with the woven Interview-Skills EnglishPod conversations that climax at the L30 capstone, 02 §5). Links to the coverage grid.
- **`#/grammar`** (03 routing): a read-only **index of all Grammar Sparks** grouped **by phase (Poydevor / Surʼat / Ravonlik)**, each linking to its lesson; plus standalone **irregular-verbs** and **spelling** reference cards. The cards are **original, re-authored bilingual cards** (forms + Uzbek gloss / neutral examples) — **never reproductions** of Murphy App 2/3/5 (03 §9). Not a drill surface — a lookup.
- **`#/about`**: what this is; the Effortless-English method credit; the **honest free/no-login promise**; the **licensing note** (media is the owner's responsibility, sits in a single swappable `MEDIA_BASE` bucket, on-site grammar is original Uzbek prose, source materials remain their owners' property — 03 §9 / 00 §6); an **attributed sources list** (AJ Hoge / Effortless English · EnglishPod/Praxis · BBC 6 Minute English · Cambridge/Murphy); contact (`principiaforge@gmail.com`); link back to the Principia Forge family.

> **S10 (as shipped).** `#/ielts`, `#/grammar`, `#/about` are code-split route modules (`renderIelts`/`renderGrammar`/`renderAbout`, each `(main, seq, alive)`, one `<h1>` per screen). `#/ielts` is static (honest framing + Phase→CEFR→IELTS table + criterion→feature map + **"Am I ready for a mock?"** checklist + **Interview-Skills bridge** callout — this satisfies S7's "surface the bridges-to-a-real/paid-mock note on `#/ielts`"). `#/grammar` awaits `loadIndex()` (on failure it still renders the reference cards) and groups the Grammar-Sparks index by `phase` (index.json exposes only `phase` 1/2/3 per lesson, 03 §6.1 — not a 4-tier field); it reads an optional `#/grammar/<unit>` from `location.hash` to scroll+highlight the matching topic row (`id="g-<slug>"`). The index renders whatever `loadIndex()` returns (only core-09 today; empty phases show a calm "being prepared" note) and grows as S13 authors.

---

## 5. Component inventory

Reusable pieces, each with its states and the data/behavior contract. The five the brief names (audio player, progress ring, lesson card, vocab flip-card, checklist) are specified in full; the rest are summarized.

### 5.1 Audio player (the one persistent `<audio>`, 03 §7) — states

**Docked bar (collapsed):** one line — `▷/❚❚` · track label · mini scrubber · `time / total` · `⋯` expand.
**Expanded sheet:** full scrubber, `⟲10s`, `❚❚`, `⟳15s`, **rate chip `0.75× · 1× · 1.25×`** (03 §7 — essential at A2), a `⬇ save offline` toggle, current lesson link.

| State | Trigger | Visual | Notes |
|---|---|---|---|
| **Idle / empty** | no track loaded | docked bar hidden | app opens here |
| **Loading / buffering** | source set, not yet playable | shimmer on scrubber; play → spinner | `preload="none"` means this is the first byte fetched |
| **Playing** | play | `❚❚` shown; inline section trigger shows equalizer glyph + `aria-pressed=true` | position saved every ~5 s |
| **Paused** | pause | `▷` shown; position retained | |
| **Seeking** | scrub drag | time preview follows thumb | Range GET (R2 honors it, 03 §2.3) |
| **Rate-changed** | tap rate chip | chip cycles 0.75→1→1.25; persists to `settings.rate` | |
| **Ended (~90%+)** | track end | marks `done`, bumps repeat counter, offers "next step" | feeds ★ gate |
| **Offline-saved** | save-offline toggle on | `⬇✓` filled; plays from Cache API | per-lesson only, never bulk (03 §7) |
| **Error / unreachable** | network / CORS / 404 | inline: *"Audio yuklanmadi"* + `[Qayta / Retry]` + `[⬇ Yuklab olishga urinish]`; transcript stays visible | degrade gracefully (03 §9); §9 below |

### 5.2 Progress ring / star cluster
Wraps a lesson's completion. **Ring** = fraction of checklist steps done; **stars** = the 1★/2★/3★ tier (02 §8.1).

| State | Glyph | Meaning |
|---|---|---|
| Not started | `○` empty ring | `status: none` |
| In progress | `◔ ◑ ◕` partial ring | `inProgress` — any step done, gate not yet met |
| Complete | `⭐☆☆` full ring, 1 gold star | `complete` — gate met, advances |
| Strong | `⭐⭐☆` | + EnglishPod done + Fun English + 1 recording |
| Mastered | `⭐⭐⭐` gold-filled ring | + 6 Minute English done + 2nd recording |
| Review due | ring + `🔁` badge | `reviewDue ≤ today` |

`role="img"` with an Uzbek+English `aria-label` (e.g., *"2 yulduzdan 3, kuchli / 2 of 3 stars, strong"*) — never color-only (P5, a11y §8).

### 5.3 Lesson card (curriculum map)
```
┌───────────────────────────────────────┐
│ ⭐⭐☆  02 · Emotional Mastery    [B1] │  ← stars · number · title · level chip
│        Grammatika: present cont. vs     │  ← the week's TWO grammar topics
│        simple · -ed/-ing sifatlari      │     (from index.json grammarUnits[])
│        🎙️ EnglishPod   📻 6 Minute      │  ← in-lesson section badges
└───────────────────────────────────────┘
```
- Left accent bar in the **phase color**. Whole card is one 48px+ tap target → `#/lesson/core-NN`.
- The two **grammar topics** come from `grammarUnits[]` and the **🎙️/📻 badges** from `hasEnglishPod`/(6ME always present) (index.json, 03 §6.1) — no per-lesson fetch needed to render the map. On **L15 & L22** the 🎙️ badge is omitted (`hasEnglishPod:false`).
- Variants: **recommended-next** (pulses once, `‹next›` tag), **review-due** (`🔁`), **locked-soft** (never disabled — a gentle hint line, taps still work).

### 5.4 Vocab flip-card
```
   FRONT (tap to flip)        BACK
  ┌──────────────┐          ┌──────────────┐
  │  give me a   │   ⇄      │ "yordam ber" │
  │   hand   🔊  │          │ Can you give │
  │              │          │ me a hand?   │
  └──────────────┘          └──────────────┘
```
- **Front:** English chunk (`lang="en"`) + 🔊 (Web Speech API `en-*`; fallback = VOCAB section player). **Back:** Uzbek gloss (`lang="uz"`) + English example. Flip on tap/Enter/Space; `aria-expanded` announces both faces.
- A **"bilaman / known" toggle** (long-press or a corner dot) feeds the vocab-reviewed step. Cards are swipeable on touch, arrow-key navigable on keyboard. States: front, back, known, audio-playing.

### 5.5 Lesson Check checklist / mark-complete → see §5.7.

### 5.6 Mini-story drill (the core speaking component)
Renders `ministory.pairs` (03 §6.2). Per pair: show question (EN) → **2–3 s "answer NOW" beat** (a subtle countdown, UZ label) → `[Javobni ko'rsatish]` reveal → italic answer (EN) → **self-check `[✓] [✗]`** → auto-advance. A **live "spoken aloud today" counter** and a progress `n/total`. **No text input anywhere** (typing kills automaticity, 02 §2). Reveal is `aria-live="polite"`. The `✓` increments `speakingReps` / `msAnswersAloud`.

### 5.7 Lesson Check (checklist + star award + mark-complete)
- **Checkbox rows** for the 10 steps (03 §6.3): `grammarA`, `grammarB`, `vocab`, `main`, `ministory`, `pov`, `ep`, `sixmin`, `fun`, `record`. Rows absent in a lesson are **omitted, not greyed** — **POV** on L01–08, **EnglishPod** on L15/L22 (where `ep` auto-satisfies, 02 §8.1). Each row: label (bilingual) + state; the **Mini-Story-aloud row is marked `← GATE`** and styled as required.
- **Star tiers** (02 §8.1): **1★** = `grammarA`+`grammarB`+`vocab`+MAIN×3+ministory×2 (gate)+POV×2 (if present); **2★** = +`ep`+`fun`+one recording; **3★** = +`sixmin`. **Live star readout** updates as boxes tick.
- **Primary "earn ★" button** is **disabled with a visible Uzbek reason** until the gate row is checked (02 §8.1). On tap: writes `stars`/`status`/`steps`, logs `listeningMinutes`+`speakingReps`+`xp`, updates `streak`+`badges`, sets `reviewDue` (+1/3/7/14). A brief, reduced-motion-safe celebration (star fills + one praise line).

> **S5 implementation (as shipped).** The per-lesson star model above is the one enforced in `lesson.js` `lessonCheck()` + `progress.js` `completeLesson()`:
> - **1★** = `grammarA` && `grammarB` && vocab-seen && MAIN listened ×3 && **mini-story answered aloud ×2 (the GATE)** && (POV absent **or** POV ×2). **2★** = 1★ + EnglishPod done (`ep` — **auto-satisfied when the section is absent**, L15/L22) + Fun watched + one Speak-It recording. **3★** = 2★ + 6 Minute English done (`sixmin`).
> - **The 3★ tier does NOT gate on a *second* recording here.** The L1↔L30 "record again at the end" growth-proof comparison is a **Progress-page surface built in S6** (02 §6/§8.4), not a per-lesson 3★ requirement — a lone learner must be able to master any single lesson without having reached L30. (This narrows the earlier "3★ = +sixmin + a second recording" line to what a per-lesson check can honestly award.)
> - The **earn button** is disabled with `t("check.gateReason")` until the gate is met, then with `t("check.needMore")` when the gate is met but the other 1★ rows aren't; it enables at tier ≥ 1. Earning **never downgrades** `stars` (`max(old, new)`), and if the live tier later **exceeds** the earned floor the button re-enables to earn the higher tier. On reload the earned floor is seeded from `snapshot(id).stars`, so a completed lesson shows its star + a "next review" date immediately.
> - **Fun English (S8, as shipped):** the `fun` step is driven by the real YouTube facade (`assets/lesson-fun.js`, §5.9) — **tapping play** (curated `id`) or the **"Koʻrdim / Watched"** honor acknowledge (uncurated `id:null`) sets it via the `ctx.markFun` callback. The S5 interim honor toggle was **removed** (one fun mechanism, no competing control); `check.funWatch` now labels the id:null acknowledge.

### 5.8 Other components (summarized)
- **Streak flame 🔥** — count + subtle flicker (off under reduced-motion); freeze `❄` marker.
- **Weekly-goal ring** — 5/7 forgiving ring (02 §8.3).
- **Badge chip** — earned (bright, phase/gold) vs locked (greyed + "62/100" progress hint); tap → what-it-means tooltip. Bilingual labels (02 §8.3 table).
- **CEFR ladder** — `[A2✓][B1◔][B2○]`.
- **Coverage-grid cell** — one of ~20 IELTS topics; empty→filled as `ieltsTopics` increments (02 §8.3).
- **Quiz MCQ (§5.10)** — options as 48px rows; select → lock → reveal correct (green ✓) / chosen-wrong (amber, never harsh red) + Uzbek explanation; icon+text, not color-only.
- **Dialogue role-play line** — speaker tag + line; **one "hide this role" toggle per *distinct speaker*** (blanks that speaker's lines for role-play, robust to named speakers — not hard-coded A/B); optional **per-line replay via Web Speech TTS** (no fake timestamps, since transcripts have none — 03 §6.2), and the say-button is **hidden on the currently-hidden role** so you don't hear the line you should speak (S7).
- **YouTube facade (§5.9).**
- **Download button** — states Download → progress% → Saved✓/offline; size + type label.
- **Record button** — idle `●` → recording (timer + waveform) → saved (playback + delete); "nothing uploaded" reassurance.
- **Day-focus chip** — "Bugun: 4-kun · Gapirish" (7-day rotation hint).
- **Banner** — dismissible, kind (re-engagement / storage-warning / media-down); never modal.
- **Skeleton** — grey blocks matching final layout while JSON loads.
- **Toast** — brief bottom confirmation (XP earned, saved, exported).
- **Bottom sheet** — settings, "all vocab", confirm-destructive.

### 5.9 YouTube facade
Static thumbnail (`<img loading="lazy">`, or a CSS-gradient placeholder if the thumbnail host is also to be avoided) + centered `▶` + title/channel caption. On tap → inject a `youtube-nocookie.com` iframe with `title`, `loading="lazy"`, and focus moved into it. Saves ~1 MB/embed pre-tap (03 §7). Fallback if the iframe fails/blocked: a plain "Open on YouTube" link.

> **S8 (as shipped).** Built as the lazily-imported `assets/lesson-fun.js` (`funSection(id,l,ctx)`, imported by `lesson.js` in the same `Promise.all` as `lesson-episodes.js`/`lesson-speak.js`; the step callback `ctx.markFun` mirrors `markEp`/`markSix`). The pre-tap poster is a **pure CSS-gradient box** (teal→indigo, themed via tokens) — deliberately **not** an `img.youtube.com`/`ytimg` thumbnail, because a thumbnail fetch is itself a YouTube byte; this makes the section fetch **0 bytes from YouTube / ytimg / any Google host until tap** (03 §8's "YouTube (pre-tap) = 0 KB"). The poster carries the centered `▶`, the video `title` (`lang="en"`), the channel, an Uzbek framing line, and the tiny watch-task (a prompt, no test). **On tap — the only point any YouTube byte is fetched —** it injects one `youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` iframe (`title`, `allow="autoplay; encrypted-media; picture-in-picture"`, `allowfullscreen`, `loading="lazy"`), **moves focus into it**, and marks the `fun` step. The `<id>` is read from `funEnglish[]` — **never a code constant** (behavior 9). **`id:null` (uncurated — most lessons today):** the play control becomes a **"YouTube'da qidirish / Search on YouTube"** link (`youtube.com/results?search_query=<title>`, new tab) so it is never a dead button (§9), plus a small **"Koʻrdim / Watched"** honor acknowledge that marks the `fun` step so 2★ stays reachable. **Blocked/failed iframe (§9):** a persistent **"YouTube'da ochish / Open on YouTube"** link (`youtube.com/watch?v=<id>`) is offered and, on a hard `error`, the broken iframe is hidden with a short note — the watch-task stays visible throughout.

### 5.10 Quiz MCQ (6 Minute English)
`sixmin.quiz[]` (03 §6.2): stem (bilingual framing allowed, options `lang="en"`), single-select, reveal-on-command with `answerIndex` and `explanationUz`. Correct = green ✓ + label; chosen-wrong = amber outline + ✗ + the Uzbek explanation. Rendered inside the weekly lesson's 6ME section (§4.4 ⑦); feeds the `sixmin` step. **S7:** the component exposes a **head** (question + options) and a **tail** (reveal + feedback) as separate mounts, so the 6ME flow can place the options at the prediction beat ② and the reveal *after* the gist listen ③ (§4.4).

### 5.11 Grammar two-topic panel (§4.3 ①)
Renders the `grammar[]` array (exactly two topics, 03 §6.2) as **two tabs / stacked cards** — **A** (`grammar[0]`, the Days 1–2 topic) and **B** (`grammar[1]`, Days 3–4). Each card is identical in shape: `bodyHtml` (sanitized), a **🏷️ band-lifter / CEFR-can-do tag** (`bandLifter`/`cefrCanDo`), the L1-contrast callout, its own **⚠️ "Xato tuzatish"** error-fix card (`errorFixUz`), the 2–3 interactive drills (gap-fill MCQ / reveal + honor / `say-true` spoken), and an **optional** Murphy-PDF download when `reference` is present. Ticking a card feeds its `grammarA` / `grammarB` step (§5.7); **both** are needed for 1★. On mobile the two collapse into an accordion so the page stays single-column (P1).

---

## 6. Progress & gamification UI (what localStorage looks like on screen)

The storage model is the **canonical `ess.progress.v1` union in 03 §6.3** (localStorage; recordings in IndexedDB) — every `Backing field(s)` path in the table below is a field of that schema. This section is purely how it *surfaces*. Guiding rule (02 §8): **reward volume and reps; make speed invisible.**

| On-screen element | Backing field(s) | Where it shows |
|---|---|---|
| **Listening-minutes hero counter** | `metrics.listeningMinutes` | Home + Progress — biggest number on the site |
| **Speaking-reps tally** | `metrics.speakingReps` / `lessons.*.msAnswersAloud` | Home + Progress + live in the mini-story drill |
| **Recordings count** | `metrics.recordings` | Progress; enables the L1↔L30 comparison |
| **Continue-where-you-left-off** | `lastLessonId` (+ derived day-of-cycle) | Home hero card — the #1 return path |
| **Stars per lesson** | `lessons.*.stars` / `status` | Lesson cards, section strip, Lesson Check |
| **Streak flame + calendar** | `streak.count` / `longest` / `lastActiveDate` / `freezesLeftThisWeek` | Home (count) + Progress (calendar with ❄ freeze) |
| **Weekly-goal ring** | `weeklyGoal.target` / `activeDaysThisWeek` | Home + Progress (forgiving 5/7) |
| **Badges** | `badges[]` | Progress gallery; a toast on earn |
| **CEFR ladder** | derived from phase completion | Progress + phase headers on the map |
| **IELTS-topic coverage grid** | `ieltsTopics{}` | Progress + `#/ielts` |
| **Review-today cards** | `lessons.*.reviewDue` | Home (only when due) |
| **XP** | `metrics.xp` | small, ambient (per-step +XP toasts) |

**Motivational surfaces & their kindness rules:**
- **Re-engagement banner** (localStorage-driven, 02 §8.3): *"Bugun hali o'qimadingiz / You haven't studied today"* — appears once/day, **dismissible, never modal, never guilt.** Optional Notification API + "Add to Home Screen" (phase-2 PWA, 03 §7).
- **Comeback badge** greets a return after a 7+ day gap — *celebration, not scolding* (02 §8.3).
- **Streak freeze** auto-applies (1/week) and is shown as a calm `❄` on the calendar, so a missed day doesn't read as failure (02 §8.3).
- **Celebrations** (star fill, badge earn, phase cross → CEFR badge) are brief and **`prefers-reduced-motion`-gated**.
- **First-run** shows all counters at 0 with encouraging copy and empty-but-hinted badge slots (§9), never a barren dashboard.

> **S6 (as shipped).** The **re-engagement banner** lives on the **Home returning dashboard only** (`home.js`): once-per-day, dismissible, non-modal, kind copy that never guilts, driven by `progress.shouldReengage()` / `dismissReengage()` (the latter writes `reengageDismissed`, an ISO date, 03 §6.3). The **Comeback badge** is awarded on a ≥7-day-gap return (detected in `registerStudyDay`). **Badge-earn toast:** the engine dispatches a document `"yp:badge" {ids:[]}` from the mutating study paths and from the Progress page's `awardPhaseBadges`; the `app.js` shell listener maps each id to its bilingual label and shows one brief, non-focus-stealing toast per new id (reduced-motion collapses it to instant). Count-based badges toast immediately from the lesson page; **phase/CEFR badges** (A2/B1/B2) are index-aware and awarded when the user next opens Progress after completing a phase's last authored lesson.

---

## 7. Visual design system

### 7.1 Brand bridge & the deliberate divergence
This app belongs to the **Principia Forge** family (siblings: YouPlan, YouWrite, YouScore — dark, teal→indigo→purple gradient, DM Sans). It **keeps the teal brand DNA** but makes two principled departures the architecture demands:
1. **System fonts, not DM Sans** — the siblings load a render-blocking Google-Fonts `@import`; 03 §1/§8 kills it here for a **0 KB system stack** (cheap Android, slow network). Non-negotiable.
2. **Light-first, warm** — the siblings are dark-only "productivity" surfaces; a *learning* surface used in daylight on cheap screens by anxious adults reads better **warm and light by default**, with a full dark mode. Dark mode is where the app visually "rejoins" the family (teal brightens to the family's `#2DD4BF`).

*(Naming is the owner's call, but a family-consistent candidate is **"YouSpeak"** — the speaking-first thesis in the "You\*" pattern.)*

### 7.2 Palette (WCAG-verified — ratios measured, not guessed)

**Light mode (default):**
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--bg` | `#FFFDF9` | page (warm cream, not clinical white) | — |
| `--surface` | `#FFFFFF` | cards | — |
| `--ink` | `#1C1917` | headings | 17.2:1 on bg — AAA |
| `--text` | `#292524` | body | 14.9:1 — AAA |
| `--muted` | `#6F675E` | Uzbek gloss, captions, meta | 5.5:1 — AA |
| `--border` | `#E7E5E4` | hairlines (non-text); interactive borders darken to `#D6D3D1`+ | decorative |
| `--teal` (action) | `#0F766E` | buttons, links, active nav | 5.4:1 on bg; white-on-teal 5.5:1 — AA |
| `--teal-bright` | `#0E9384` | focus ring (2px + offset), today-cell / strip-active outline | 3.7:1 on bg — UI ≥3:1 ✓ *(S11: was `#14B8A6` at **2.5:1**, which failed the ≥3:1 focus rule; darkened)* |
| `--indigo` | `#4F46E5` | grammar / "learn" accents | 6.2:1 — AA |
| `--amber` | `#A24B08` | achievement text (streak, XP), chips | 5.8:1 on bg; ≥4.5:1 on its own 10–18% tint — AA *(S11: darkened from `#B45309`, which was 4.9:1 on bg but dropped to ~3.9–4.2:1 on its own tint)* |
| `--amber-bright` | `#D97706` | stars/flame fills; is-wrong borders (large/UI) | 3.1:1 (large/UI-only) |
| `--green` | `#137337` | correct / done | 5.8:1 on bg; ≥4.5:1 on its own 9–16% tint — AA *(S11: darkened from `#15803D`)* |
| `--red` | `#C42222` | errors, destructive (used sparingly, kindly) | 5.8:1 on bg; ≥4.5:1 on its own 8–14% tint — AA *(S11: darkened from `#DC2626`)* |

**Dark mode (warm-dark, not pure black; rejoins the family teal):**
| Token | Hex | Contrast |
|---|---|---|
| `--bg` | `#1A1816` | — |
| `--surface` | `#242019` | — |
| `--text` | `#F5F3EF` | 16.0:1 — AAA |
| `--muted` | `#A8A29E` | 7.0:1 — AAA |
| `--teal` | `#2DD4BF` (family teal) | 9.5:1 — AAA; button text is ink `#0B1211` (10.2:1) |
| `--amber` | `#FBBF24` | 10.6:1 — AAA |
| `--green` | `#4ADE80` | 10.2:1 — AAA |
| `--indigo` | `#A5B4FC` | 8.9:1 — AAA |

**Phase accents** (map + badges): Poydevor = teal, Sur'at = indigo, Ravonlik = amber — a warm climb from calm→energised. Each is paired with an icon/label so meaning never rests on hue alone.

> **S11 contrast audit (measured, not guessed — `scripts`-style WCAG 2.1 formula over all 58 token pairs, both themes).** Every body pair meets ≥4.5:1 and every UI/large pair ≥3:1 in **both** themes, including the tricky **coloured-text-on-its-own-`color-mix` tint** states (chip, `gx`/`quiz` correct/wrong, `btn--danger`, `complete__b2`, `six-insert`, `cov--on`, CEFR/streak tints). The audit caught and fixed three real light-mode regressions: the **focus ring** (`--teal-bright #14B8A6` was 2.5:1 on bg — under the ≥3:1 focus rule — now `#0E9384` at 3.7:1) and **amber/green/red text on their own tints** (3.9–4.4:1 — fixed by darkening the three tokens; each is ≥4.5:1 on tints up to 18/16/14% and 5.8:1 on plain bg). Dark-mode tint states pass with 4.7–8.6:1 headroom (bright tokens on dark tints), so only the **light** tokens moved; dark tokens are unchanged. **Two documented non-issues remain (not WCAG failures):** (1) `--teal-bright` measures 1.4:1 *directly on a solid teal fill*, but the focus ring's `outline-offset:2px` always renders it over the light page background (3.7:1) — the on-teal number is a non-adjacency artifact; (2) the empty ☆ star (`--border-strong`, ~1.5:1) is shape-distinct from the filled ★ (amber, ≥3:1 large) and the earned count is carried by the filled stars + an `aria-label`, so the faint empty slot (the universal rating convention) conveys no colour-only information. `--border-strong` is left unchanged so hairlines/borders across the system are not disturbed.

### 7.3 Type scale (system stack, 0 KB)
```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, "Noto Sans", sans-serif;
```
Renders `oʻ`/`gʻ` (U+02BB/02BC) correctly (03 §7). *(S11: this stack is stored once as the `--font` custom property on `:root` and consumed by `body` and by every `font:` shorthand in `styles.css` — a bare `inherit` is not a legal `<font-family>` inside the `font` shorthand and silently voids the whole declaration.)* Scale (~1.2 modular, **17 px base**):

| Token | Size / line-height | Use |
|---|---|---|
| `display` | 30 / 1.2, 700 | first-run headline, page H1 |
| `h1` | 24 / 1.25, 700 | screen titles |
| `h2` | 20 / 1.3, 600 | section headers |
| `h3` | 18 / 1.35, 600 | card titles |
| `body` | **17 / 1.6**, 400 | paragraphs, transcript (max 66ch) |
| `body-sm` | 15 / 1.5 | Uzbek gloss, secondary |
| `caption` | 13 / 1.4 | meta, sizes, timestamps |
| `label` | 12 / 1.3, 600, +0.02em | tiny chips (sparing) |

Bilingual pairing convention: **target English = `body`/`h3` weight**; **Uzbek scaffold = `body-sm` in `--muted`**, stacked beneath. Numerals for metrics may use `font-variant-numeric: tabular-nums` for steady counters.

### 7.4 Spacing, radius, elevation
- **Spacing scale (4 px base):** 4, 8, 12, 16, 24, 32, 48, 64. Section padding 16 (mobile) / 24 (≥720). Card gap 12.
- **Radii:** 8 (chips/inputs), 12 (cards), 16 (sheets/hero), 999 (pills/rings). Rounded-but-restrained (P5).
- **Elevation:** two soft, warm-tinted shadows only — `sm` `0 1px 2px rgba(28,25,23,.06)` (cards), `md` `0 6px 20px rgba(28,25,23,.10)` (docked player, sheets). Dark mode uses border-emphasis over shadow.
- **Breakpoints:** base (mobile-first, 360+), `≥720px` (bottom nav → top-bar links, wider margins), `≥1024px` (centered single column, generous gutters). **Never a multi-column dashboard** (P1).

### 7.5 Dark-mode stance
- **Default = `auto`**, following `prefers-color-scheme` (03 §6.3 `theme: "auto"`); manual override (`light`/`dark`) via the `◐` top-bar toggle, persisted to `settings.theme`.
- Warm-dark (never `#000`) to stay in the encouraging family (P5); dark mode is where the teal returns to the family's bright `#2DD4BF`.
- Implemented as a `[data-theme]` attribute on `<html>` plus a `prefers-color-scheme` media fallback, so first paint matches system with no flash.

### 7.6 Iconography & motion
- **Inline SVG line icons** (1.75px stroke, rounded caps) for UI (play, download, back, nav) + **a small, consistent emoji set for warmth**: 🎧 listen · 🗣️ speak · ⭐ stars · 🔥 streak · 🎯 goal · 🔁 review · 🎭 role-play · ⚠️ error-fix · 💪 peak-state. Used consistently, **never as decoration clutter** — warm, adult, not a sticker sheet. No icon font (bandwidth + a11y).
- **Motion:** 150–250 ms ease-out; transitions on opacity/transform only (cheap on low-end GPUs). Card flip, star fill, equalizer, streak flicker, toast rise. **All motion is disabled under `prefers-reduced-motion: reduce`** (a11y §8) — celebrations degrade to an instant state change. *(S11: the global reduced-motion block is the **last rule** in `styles.css`, after all cluster CSS, and neutralises `animation-duration`/`-delay`/`-iteration-count` + `transition-duration`/`-delay` + `scroll-behavior` via `!important` on `*`, so it wins over every animation including the S11-merged banners/toast/celebration/beat/equalizer/flip/next-pulse/gref-flash/sheet-up/skeleton.)*

---

## 8. Accessibility checklist

Target **WCAG 2.1 AA**. The bilingual dimension makes correct `lang` handling load-bearing, not optional.

*Status: all items below verified in the S11 hardening pass (a11y audit + measured contrast). The one deliberate divergence — a persistent chrome `<footer>` — is annotated inline.*

**Structure & keyboard**
- [x] Semantic landmarks: `<header>`, `<nav>` (top links + bottom nav + sections sheet), `<main>`. *(S11: no **persistent chrome `<footer>`** — the bottom-nav + docked player own that zone on mobile; a global footer would be empty clutter (P1/P5). `<footer>` is reserved for page-level footer content; the About tagline is the only such content and can adopt `<footer>` when it grows. Landmarks are used correctly for the content that exists.)* One `<h1>` per screen + ordered heading levels verified on all routes (incl. both Home faces + both error screens).
- [x] **Skip-to-content** link is the first focusable element ("Asosiy kontentga oʻtish"); targets `#main`. *(S11: the global banner region `#ypBanners` is inserted **before** `#main`, so the skip link still skips over it.)*
- [x] Every interactive element is a real `<button>`/`<a>`/`<input>` — reachable by Tab in logical order, no keyboard traps (sections-sheet trap wraps + restores focus; the YouTube iframe has an "open on YouTube" escape link placed after it).
- [x] **Visible focus indicator** everywhere: 2px `--teal-bright` outline + 2px offset, ≥3:1 against its background; never `outline:none` without a replacement (the only `outline:none` is the `:focus:not(:focus-visible)` mouse-focus guard). *(S11: `--teal-bright` darkened to `#0E9384` so the light-mode ring clears ≥3:1 — see §7.2.)*
- [x] Tap targets ≥ 44px (target 48) with ≥8px separation (P2, WCAG 2.5.5/2.5.8). *(S11: vocab 🔊 40→44, vocab "known" dot + section-strip glyphs get 44px `::before` hit areas with widened gaps, docked seek → 44px.)*
- [x] Tap-to-reveal (mini-story), flip-cards, accordions operate via Enter/Space and expose `aria-expanded`.

**Audio player ARIA (03 §7's persistent player)**
- [x] Player container `role="region"` + `aria-label="Audio pleer / Audio player"`.
- [x] Play/pause: `<button>` with `aria-label` that reflects state (*"Ijro / Play"* ↔ *"Toʻxtatish / Pause"*) and `aria-pressed`.
- [x] Seek bar: native `<input type=range>` with implicit `aria-valuemin/max/now` and `aria-valuetext` as **spoken** time (*"1 daqiqa 30 soniya"* / *"1 min 30 sec"*, kept in sync on paint + input). *(S11 fix.)*
- [x] Rate control exposes its current value (`aria-label = "Tezlik: 1× / Speed: 1×"`). *(S11 fix: the label previously read only "Speed", hiding the value from SRs.)* `⟲10s/⟳15s` have explicit labels.
- [x] Status changes (loading/error/ended) announced via a single `aria-live="polite"` + `aria-atomic` region — **not** per-second time updates. *(S11: loading now announced too.)*
- [x] Inline section triggers announce which track and playing state (`aria-pressed`).

**Bilingual language attributes (critical, 02 §9)**
- [x] `<html lang>` follows the UI toggle: `uz` or `en` (set pre-paint in `index.html`, kept in sync by `app.js setLang`).
- [x] **Within an Uzbek UI, English content is wrapped `lang="en"`** (transcripts, vocab English, mini-story Q&A, dialogue, quiz options) and genuine Uzbek lesson content stays `lang="uz"`. **S11 app-wide fix (WCAG 3.1.2): the static `lang="uz"` was DROPPED from all `t()`-driven UI strings** (home/lessons/lesson/lesson-fun/lesson-episodes/lesson-speak/method/progress-page/… ~55+ sites) so chrome now follows the toggle instead of mislabelling English as Uzbek in EN mode. A few genuinely-always-Uzbek literals (e.g. "Oʻzbekcha", verb glosses, mixed-content callouts dominated by authored Uzbek) intentionally keep `lang="uz"`.
- [x] Uzbek uses proper `oʻ`/`gʻ` (U+02BB/02BC), not ASCII apostrophes, in letters. *(All S11-added dict keys verified apostrophe-clean; the handful of ASCII `'` in existing values are quotation marks around English terms, not Uzbek letters.)*

**Perception & robustness**
- [x] Contrast AA verified (§7.2): body ≥4.5:1, large/UI ≥3:1 — **every** token pair measured in both themes, incl. coloured-text-on-own-tint states (S11 audit; three light-mode regressions fixed).
- [x] **Never color-alone:** stars have shape (☆/★) + aria count; correct/incorrect carry ✓/✗ icon + text; phase = color + label; progress = ring + number. *(S11: grammar MCQ wrong answer gained a ✗ to mirror the ✓.)*
- [x] `prefers-reduced-motion: reduce` disables all non-essential animation incl. celebrations, equalizer, streak flicker, banners, toast, card flip. *(S11: the global rule is the **last** declaration in `styles.css`, so it wins over every merged animation.)*
- [x] Reflows to 320px width and to 200% zoom with no horizontal scroll (mobile-first single column, `max-width` measures; wide tables scroll inside their own `overflow-x:auto` wrappers). *(S11: added `img,svg,video{max-width:100%}` + `body{overflow-wrap:break-word}` safety net.)*
- [x] Images/thumbnails have `alt`; decorative emoji are `aria-hidden` where they duplicate adjacent text. *(The Fun English facade is a CSS gradient — 0 image bytes — so there is no thumbnail to alt.)*
- [x] YouTube facade → the injected iframe carries a non-empty `title` (falls back to the section name); provide the "open on YouTube" fallback when blocked.
- [x] Recording UI has clear labels + a `role=status` text region; playback is keyboard-operable; mic-permission-denied shows an Uzbek how-to-enable note + keeps the shadow/answer-aloud alternatives (never a dead button).
- [x] Forms/toggles have programmatic labels; error text is surfaced in an associated live/`status` region (import errors now show a **translated** reason, not a raw error code — S11 fix).

---

## 9. Empty / edge / error states

Every one degrades gracefully — **the lesson never becomes a dead screen** (03 §9).

> **S11 status: every row below is implemented and verified.** Highlights added/hardened in S11 — media-host-down **global banner** (`#ypBanners`, dismiss-suppressed until recovery, raised only after ≥2 distinct tracks fail); **per-track** inline error panel (⚠️ + Retry + download-attempt, transcript/vocab/grammar/mini-story stay usable) *and* a docked-bar Retry/download affordance; localStorage-unavailable + IndexedDB-unavailable non-blocking notices; **import** now version-tiers (v1 accepted · missing/legacy → `migrate()` attempt · higher/non-numeric → refused `badVersion`) and always returns a **translated** reason (fixing Settings, which previously showed the raw code); **course-complete (L30)** ships on the Progress page. *Note on the L30 badge:* the celebration renders a distinct **"B2 — in progress"** badge (per this row + §4.6), even though the reused `cefrLadder()` marks B2 "reached ✓" once Phase 3 completes — the ladder is left as-is (its CEFR derivation is used elsewhere); the course-complete card is the authoritative "B2 in progress" surface.

| State | Trigger | UI response |
|---|---|---|
| **First run, no progress** | empty `ess.progress.v1` | Home renders onboarding (§4.1): pick pace + "Start Lesson 1"; counters show 0 with encouraging copy; badge slots empty-but-hinted; map shows L01 as recommended-next, rest as `○`. |
| **Media host unreachable** (per-track) | fetch/CORS/timeout on an audio src | Inline in that section: *"Audio hozircha yuklanmadi / Couldn't load audio right now"* + `[Qayta urinish / Retry]` + `[⬇ Yuklab olishga urinish]`. **Transcript, vocab, grammar, mini-story text all stay usable** — the lesson still teaches. |
| **Media host down (global)** | several media requests fail | A single dismissible top banner: *"Audio serveriga ulanib bo'lmadi. Matnlar ishlaydi; keyinroq urinib ko'ring."* App stays fully navigable; all text content works; downloads that were already saved offline still play. |
| **YouTube blocked / fails** | iframe error / network | Facade falls back to *"YouTube'da ochish"* link; the watch-task text remains. |
| **localStorage unavailable** | private mode / quota | Non-blocking banner: *"Natijangiz bu qurilmada saqlanmaydi (brauzer sozlamasi). Darslar baribir ishlaydi."* Lessons and audio work; only tracking pauses (03 §6.3, 02 §8.2). |
| **IndexedDB unavailable** | private mode / unsupported | Recording section shows: recording works in-session but *"bu qurilmada saqlab bo'lmadi"*; offers to keep it only for this session; never blocks the lesson. |
| **Mic permission denied** | user/OS denies getUserMedia | Speak-It shows an Uzbek how-to-enable note + keeps the shadow/answer-aloud (no-mic) alternatives visible; not a dead button. |
| **Streamed vs downloaded** | per-asset | Download button reflects state: **Download** (cloud icon) → **37%** (progress) → **Saved ✓ · offline** (filled). A track available offline shows an `⬇✓` chip in its section and in the docked player; playback then silently prefers the cached copy. |
| **No recordings yet** | `metrics.recordings === 0` | Speak-It shows the record button + the "nothing is uploaded" reassurance; Progress hides the L1↔L30 comparison until two recordings exist, with a one-line "record Lesson 1 to start" hint. |
| **POV absent / text-only** | L01–08 (none) / L19 (text) | L01–08: section not rendered at all (no dead UI). L19: renders transcript + optional TTS, **no audio transport** (03 §5.3). |
| **Slow network** | any fetch in flight | Skeleton blocks matching final layout; `preload="none"` so audio never preloads; images lazy. No blocking spinner on first paint. |
| **Lesson JSON 404 / malformed** | bad id or parse error | Friendly "dars topilmadi / lesson not found" card + `[Darslarga qaytish]`; log to console; never a white screen. |
| **Import file invalid** | bad/older JSON on import | Validation message + `migrate()` attempt for older `schemaVersion`; refuse with a clear reason rather than corrupting current progress (03 §6.3). |
| **Course complete (L30)** | Phase 3 done | Celebration: B2-in-progress CEFR badge, printable "30 Lessons" certificate, and the **re-record-Lesson-1** prompt with the L1↔L30 comparison player (02 §8.3, §6). |

---

## 10. Bilingual & microcopy conventions (implementation notes)

- **Pattern:** target-language (English) leads visually; Uzbek scaffold follows in `--muted` `body-sm`. In running UI chrome, Uzbek leads (Uzbek-primary UI, 02 §9) with English after a `/` — *"Davom etish / Continue"*.
- **The UZ|EN global toggle** swaps only *chrome + instructions + glosses*; **English content (transcripts, Q&A, dialogue, quiz options) never translates** — that is the immersion principle and the point of the product (02 §9). Hiding Uzbek is the "graduation" reward.
- **Tone:** coach, not examiner. Praise is specific and honest; nudges are gentle; the word "failed"/"wrong" is avoided in favor of *"qayta urinib ko'ring"* and amber (not red) for quiz misses.
- **`t(key)` dictionaries** (`ui.uz.json` / `ui.en.json`, 03 §8) hold all chrome strings; **Russian drops in later** with no code change (03 §7). Lesson content strings live in the lesson JSON, not the dictionaries.

---

### One-line summary
A **warm, light-first, mobile-first single-column UI** — system-font, 0 KB, thumb-zone controls — built on one persistent audio player and a fixed eleven-section weekly lesson page (one whole AJ Hoge lesson + two grammar topics + EnglishPod + 6 Minute English) whose entire hierarchy funnels the learner to *answer out loud*, wrapped in a forgiving stars/streak/coverage progress layer that celebrates **listening minutes and speaking reps** (never speed), rendered bilingually with load-bearing `lang` attributes, AA-contrast tokens in both themes, and graceful degradation on every media/storage failure — all implementable inside the buildless, framework-free, `MEDIA_BASE`-swappable envelope fixed by `03-architecture.md`.
