# 02 — Curriculum Specification (Final)
### Free, no-login, frontend-only English self-study for Uzbek learners (CEFR A2 → B1 → B2, on the road to IELTS/CEFR)

This is the single, implementable curriculum spec. It is a synthesis of three proposals, judged and merged below. Every lesson, grammar unit, and episode named here has been cross-checked against `specs/inventory/*.md` **and** the actual files on disk.

---

## 0. How this spec was chosen (judging + synthesis)

Three proposals were scored on four fitness criteria (1 = weak, 5 = excellent).

| Criterion | P1 Pedagogy-first | P2 Outcome-first (IELTS) | P3 Engagement-first |
|---|---|---|---|
| **Speaking outcomes** | 5 — mini-story "answer aloud" engineered as the single peak behaviour; metric = speaking reps | 5 — frames the mini-story loop as IELTS Speaking Part 1 automaticity; speaking step mandatory | 4 — loop preserved, "no typing", but speaking is one of several optional stars |
| **Uzbek elementary+ audience** | 4.5 — precise bilingual policy; Grammar Spark contrasts English vs Uzbek structure | 4.5 — maps the 10 L1-interference error clusters to specific lessons | 4.5 — UZ/EN toggle, Uzbek phase names, spaced "error-fix" micro-cards |
| **Self-study without a teacher** | 4.5 — 1-3-7-14 spaced review, streak kindness, solo speaking techniques | 4 — strong self-assessment, but exam framing can intimidate a pure A2 learner | 5 — its entire thesis; quit-risk→mechanic design, XP, forgiving streaks, re-engagement |
| **Feasibility with actual library** | 4.5 — best build notes (glob by prefix, gate POV, off-repo host); minor episode slip (0185) | 5 — most accurate: extracted **real** EnglishPod titles; correctly routes audio to IndexedDB | 3.5 — admits most titles are guessed; mislabels 0185 as "hometown" |
| **Overall** | **4.6** | **4.6** | **4.3** |

**Winner / spine: Proposal 1 (pedagogy-first).** It most faithfully optimizes the owner's #1 stated problem — SPEAKING — through the method the owner explicitly chose (AJ Hoge's Effortless English), with the soundest learning architecture (*meaning before form, input before output, emotion throughout*) and the most build-ready content notes. P1 and P2 scored equal; P1 wins the spine because for an A2–B1 audience whose need is "speak fluently and *eventually* take IELTS," a fluency-first foundation is more robust than an exam-first one — and P2's exam value grafts on cleanly as a layer.

**Grafted from P2 (outcome-first):** measurable **can-do goals** per lesson; the **IELTS-criterion → feature map**; the **10 L1-error-cluster** targeting; the verified **real EnglishPod episode titles** and the **Interview Skills mock-interview climax** (S29–S30); the technically-correct **IndexedDB-for-audio / localStorage-for-flags** split; prominent **export/import JSON**; honest "*this is not an exam cram course*" framing.

**Grafted from P3 (engagement-first):** the **"repeat the content, vary the daily activity"** 7-day rotation (each day a distinct named win); **star-based completion** (1★/2★/3★); **XP**; the **re-record Lesson-1 audio at Lesson-30** motivator; the global **UZ/EN toggle** ("graduation"); **Uzbek phase names**; forgiving **streak-freeze + 5/7 weekly goal**; the **gentle re-engagement banner**; the quit-risk→mechanic **engagement cheat-sheet**.

**Contradictions resolved (the decisions that make this one coherent curriculum, not a compromise):**
1. **Completion model** — P1's *mandatory speaking gate* is nested *inside* P3's *star system*: you cannot earn even 1★ without answering the mini-story aloud, but stars (not a binary) reward going deeper. (§8)
2. **Recording storage** — P2 is correct: audio blobs → **IndexedDB**; localStorage holds only lightweight flags/counts. (§8)
3. **Grammar sequence** — one continuous spine (§5). Articles get a dedicated home at **L24 Adventure** (travel makes a/an/the concrete) *and* run as spaced "error-fix" micro-cards from L01 (they are the #1 Uzbek error and need both). First conditional + connectors bundle at **L28 No Failure** (cause/effect ↔ "no failure, only results"); relative clauses + review capstone at **L30 Tribes** ("a friend who…"). Every one of the inventory's ~40 priority units is placed.
4. **Methodology page language** — **Uzbek-primary** (a lone learner must fully understand it) with an English mirror via the UZ/EN toggle. (§7)
5. **Supplementary picks** — rebuilt on P2's verified titles. **0185 is "Farm Animals," not hometown** — self-intro slot now uses **0263 "Global View – Nationalities"** instead. (§6)
6. **Phases** — 3 learner-facing phases (P3's Uzbek names, mapping to CEFR A2/B1/B2); the 4-tier grammar grouping is an internal design layer.
7. **Supplementary placement** — **Day 7 of each core week** (P3): the fresh, easy listening lesson is the reward on the day motivation dips most. 30 core weeks = 30 supplementary slots.

---

## 1. Goals & audience

**Who:** Uzbek self-learners, elementary+ (CEFR ~A2, reaching B1). They have usually studied English at school (grammar-translation) and can read a little, but **cannot speak** — the school method failed them at exactly the skill they want most. Many aim, eventually, at IELTS or a CEFR certificate.

**The one behaviour we engineer:** *hear a question → answer OUT LOUD, fast, without translating.* Everything else serves this. Fluency is automaticity, and automaticity is built by retrieval practice under mild time pressure — which is exactly what AJ Hoge's mini-story "listen-and-answer" loop is.

**Method:** AJ Hoge's **Effortless English**, read through a Second-Language-Acquisition lens (Krashen comprehensible input + retrieval practice). Seven working rules, shown to learners bilingually on the methodology page:
1. Learn **phrases/chunks**, not single words.
2. Grammar is for **comprehension**, not drilling (see the reconciliation below).
3. Learn with your **ears**, not your eyes — listening volume is the headline metric.
4. Learn **deeply** — one core lesson = one week, heard many times.
5. **POV stories** teach grammar intuitively (same story, different tenses).
6. Use **real English** (AJ Hoge, EnglishPod, BBC — all authentic).
7. **Listen and ANSWER** (not repeat) — the mini-story is the speaking engine.
Plus AJ Hoge's psychology layer: practise in a **peak emotional/physical state** (stand, smile, move, big voice).

**Reconciling "grammar explained in Uzbek" (owner's requirement) with AJ Hoge's "don't study grammar rules."** They only seem to conflict. Our resolution: the **Grammar Spark** is short (5–8 min), in **Uzbek**, framed as *"so the story makes sense"* — it contrasts English with Uzbek structure to remove confusion fast (Uzbek learners need one conscious "aha" because the English structure is alien to L1), then gets out of the way. **Real acquisition happens through the POV stories and mini-story repetition** — implicit, spoken. We front-load *explanation* (fast, in L1) and back-load *acquisition* (slow, in English, through volume).

**Macro-shape:** **30 AJ Hoge core lessons** (the spine, one per folder `01_Intro … 30_Tribes`) + **30 supplementary listening lessons** (EnglishPod + 6 Minute English) + one **grammar spine** (Murphy units re-sequenced by spoken frequency, taught briefly in Uzbek). Organised into 3 phases:

| Phase | Uzbek name | Core lessons | CEFR target | "By the end I can…" |
|---|---|---|---|---|
| **1 — Foundation** | *Poydevor* | 01–10 | A2 (consolidate) | talk about myself, my family and my routine |
| **2 — Momentum** | *Sur'at* | 11–20 | A2 → B1 | tell stories, make plans, give advice, talk about experiences |
| **3 — Fluency** | *Ravonlik* | 21–30 | B1 → B2 | discuss, compare, and hold an opinion with reasons |

**Headline success metrics** (what the dashboard celebrates): **total listening minutes** and **total speaking reps** — *not* lesson count. This is deliberate: we accept slower *visible* progress to protect real acquisition and to stop a rush-to-finish instinct.

---

## 2. Lesson template — CORE (one AJ Hoge lesson = one week)

The lesson page shows the **same nine sections in the same fixed order**. The order encodes the pedagogy: *a little grammar + key words make the talk comprehensible → deep listening installs the input → the mini-story forces spoken output → POV makes grammar automatic → fun lowers the affective filter → free production → review*. Sections 4–5 are the daily-repeated heart.

| # | Section (UZ / EN label) | Source asset | Language | Job |
|---|---|---|---|---|
| **0** | **Lesson Home & Can-Do Goal** — *"Bu darsda / In this lesson"* | authored | **Bilingual** | Theme in one line + a measurable can-do goal (*"Dars oxirida ayta olasiz: 'What do you do?' savoliga to'xtamasdan javob berish / By the end you can answer 'What do you do?' without pausing"*). Peak-state ritual prompt. Time estimate. |
| **1** | **Grammar Spark** — *"Grammatika (o'zbekcha)"* | authored from Murphy unit | **Uzbek** (+ English examples) | Fast, contrastive, comprehension-only. Explicit L1 contrast (e.g. *"Uzbekcha `Men talaba` — 'is' yo'q; English requires am/is/are"*). 2–3 interactive drills (tap-to-answer, gap-fill, then **"say a true sentence about yourself"**). Ends with a 20-sec **"Xato tuzatish"** card for this unit's top Uzbek-L1 trap. Links the Murphy PDF as an optional download. NOT drilled to mastery here. |
| **2** | **Vocabulary** — *"So'zlar"* | VOCAB mp3 + authored glossary | **English chunk + Uzbek gloss + English example** | Pre-teach words so MAIN is comprehensible (Krashen i+1). **Phrases/collocations, not isolated words** ("give me a hand", "weight off my shoulders"). Flashcards + audio-per-word. |
| **3** | **Deep Listening — MAIN** — *"Chuqur tinglash"* | MAIN mp3 + synced transcript | **English only** (+ 2-line Uzbek "what it's about") | High-volume comprehensible input; the motivational talk. Tap a transcript line to replay. Repeat-listen counter. Download button (encourage passive listening on commute/chores). |
| **4** | **Mini-Story Speaking Loop** ★ — *"Gapirish"* | MINI_STORY mp3, parsed into `{prompt, answer}` pairs | **English** content, **Uzbek** instructions | **THE speaking engine.** Per pair: play/show question → 2–3 s *"Ovoz chiqarib javob ber! / Answer out loud NOW"* beat → tap to reveal the italic answer → self-check → next. **No typing** (typing kills automaticity). Peak-state nudge shown in Uzbek. |
| **5** | **POV Grammar Story** — *"Grammatika jonli"* *(lessons 09–30 only; L19 = text-only)* | POV mp3 + transcript | **English** (+ short Uzbek "which tense changed & why") | Same story retold in another tense → intuitive grammar + spaced tense review. UI **gated on presence**: hidden for 01–08; text-only (optional TTS) for 19. |
| **6** | **Fun English** — *"Zavq bilan"* | embedded YouTube (themed) | English video, **Uzbek** framing | Lower the affective filter; extra input in a different voice/accent. One tiny watch-task, no test. |
| **7** | **Speak It Yourself** — *"O'zingni sinab ko'r"* | authored prompts + browser mic | **English** task, **Uzbek** instructions | Output: shadow the MAIN, answer mini-story Qs from memory, and **record a 60-sec response** to an IELTS-style prompt. All local; nothing uploaded. |
| **8** | **Lesson Check** — *"Darsni yakunlash"* | localStorage / IndexedDB | **Bilingual** | Check off steps, award stars, log listening minutes + reps, update streak/badges, schedule the 1-3-7-14 spaced review. |

**The Mini-Story Loop (highest-value feature).** Confirmed transcript structure (aj-hoge.md §1): a **bold statement** then rapid **question → italic short-answer** loops. The build parses each MS PDF into `{prompt, answer}` pairs to power the answer-aloud drill. Answering is **spoken and honor-checked** (*"Men ovoz chiqarib gapirdim ✓"*) — no backend can or should verify it.

### The 7-day cycle — same content, a different win each day (default *Effortless* track, ~30–45 min/day)

Listening to the set is the daily *constant*; the focused *task* rotates so it never feels repetitive (P3's key insight). MAIN averages ~15 min — tell learners to **download it and listen passively** during commute/chores so it doesn't eat the active budget.

| Day | Name (UZ / EN) | Focus | Speaking reps |
|---|---|---|---|
| **1** | *Grammatika / Grammar Day* | Section 0 → 1 (Grammar Spark + drills) → 2 (Vocab ×1); first MAIN listen | 0 (input) |
| **2** | *Chuqur tinglash / Deep Listen* | Vocab review → **MAIN ×2** with transcript | 0 |
| **3** | *So'zlar / Vocabulary* | Glossary + flashcards → MAIN ×1 → **Mini-Story ×1 (answer aloud)** | ~15 |
| **4** | *Gapirish kuni / Speaking Day* ⭐ | **Mini-Story ×2 (fast, aloud)** → POV ×1 | ~30 |
| **5** | *Grammatika jonli / POV Day* | POV ×1 → MAIN ×1 → Fun English | ~15 |
| **6** | *Mashq zali / Speaking Gym* ⭐ | Shadow a passage → **Speak It: record a 60-sec response** | 1 recording + shadow |
| **7** | *Yakun / Review + Reward* | Mini-Story from memory (no audio) → **the paired Supplementary lesson** → Lesson Check → celebrate | ~15 + self-review |

> **POV caveat (L09–30 only):** POV exists only for **lessons 09–30** (L19 is text-only, no mp3). For **L01–08** — which have no POV — replace each *POV ×1* on **Days 4 and 5** with an extra **Mini-Story** repetition (answer aloud), so the day's speaking reps still land.

**The sequence within a lesson never changes** — you may not skip the MAIN (3) or the Mini-Story (4). Faster tracks compress the days; they never drop these two.

### Pace tracks (learner picks one, switchable anytime)

| Track | Pace | Time/day | Full course | For whom |
|---|---|---|---|---|
| **Effortless** (default) | 1 lesson / week | 30–45 min | ~7–8 months | Most learners; AJ Hoge's own method; deepest retention |
| **Sprint** | 1 lesson / 3–4 days (combine days 1–2, 3–4, 5–6) | 45–60 min | ~4 months | A deadline / high motivation / already solid A2 |
| **Gentle** | 1 lesson / 10–14 days | ~20 min | ~10–12 months | Very busy; wants extra repetition |

Rule stated bluntly on the methodology page: **never advance until you can answer the mini-story questions automatically.** Speed is not the goal; automaticity is. A **backward-planning table** (weeks-until-exam → which track) helps exam-daters choose.

---

## 3. Lesson template — SUPPLEMENTARY (~20–30 min, single sitting, Day-7 reward)

Two lighter templates. **EnglishPod = the SPEAKING half** (short natural dialogues → shadow + role-play). **6 Minute English = the LISTENING/IELTS half** (BBC accents, built-in quiz + 6-word vocab pack; harder, slotted later). No new grammar is taught — supplementary lessons consolidate the spine and add listening *volume*.

**EnglishPod template (speaking-focused):**
1. Topic warm-up — **bilingual**, 2 lines + a prediction question.
2. Listen to **`dg`** dialogue cold (~1 min) — get the gist.
3. Read transcript + **Key Vocabulary with Uzbek gloss added** (the PDF defines in English only; we add O'zbekcha — e.g. verified in 0004: *understaffed = "yetarli xodim yo'q"*, *give me a hand = "yordam ber"*).
4. Listen to **`pr`** for the hosts' line-by-line explanation *(skippable on Sprint)*.
5. **Shadow** the dialogue line-by-line.
6. **Role-play** Role A, then Role B, out loud (optional self-record). ← the speaking win.
7. **`rv`** review track as vocab recap; self-quiz.
8. Mark complete.

**6 Minute English template (listening-focused):**
1. Topic intro + the pre-listening **quiz question** — **bilingual** framing (the PDF ships a ready-made 3-option MCQ; answer revealed near the end).
2. Predict the answer.
3. Listen once for gist (~6 min), transcript hidden.
4. Reveal quiz answer + self-check.
5. **Vocabulary**: the 6 target items, **Uzbek gloss added**.
6. Listen again with transcript; pay special attention to the **`INSERT`** vox-pop clips (authentic accents — the hardest, best B2 stretch; the closest free analogue to real IELTS audio).
7. **Speak It**: record a 60-sec answer to a related IELTS-style question.
8. Mark complete.

*Bilingual split identical to core: instructions + glosses in Uzbek; all audio, transcripts, and prompts in English.*

---

## 4. Core lesson table — all 30

`AJ folder` = actual directory under `content/AJ_Hoge_Power_English/`. `Grammar` = unit number(s) in *Essential Grammar in Use* (Murphy), per `grammar-book.md`. `POV`: ✓ = audio+text, T = text-only (no mp3), — = absent (UI hides the section). Fun English gives a **theme + suggested free channel**; the owner picks the exact video (never hardcode a video ID — they die). The **"Xato tuzatish"** L1-trap that recurs as a spaced micro-card is noted where relevant.

### Phase 1 — *Poydevor* / Foundation · A2 · present-tense survival core (no POV in L01–08; POV debuts at L09)

| L | AJ folder | Grammar (Murphy) | Vocab focus (chunks) | Fun English theme → channel | POV |
|---|---|---|---|---|---|
| 01 | `01_Intro` | **U1** am/is/are *(fix dropped copula — #1 Uzbek error)* | self-intro: "my goal is…", "I'm from…", learning words | Greetings & self-introduction → **English Singsing** | — |
| 02 | `02_Emotional_Mastery` | **U2** am/is/are questions + **U39** short answers | feelings: happy, nervous, excited; "I feel…" | Emotions / "How are you?" → **English Singsing** | — |
| 03 | `03_Emotional_Mastery_2` | **U9** have / have got *(Uzbek `bor`/`yo'q`)* | family & relatives; body/state; "I've got…" | Family members → **BBC Learning English** | — |
| 04 | `04_Beliefs` | **U5** present simple *(stress 3rd-person -s)* | believe/think/know/feel; daily routine; "she believe**s**" | Daily routine / telling time → **mmmEnglish** | — |
| 05 | `05_Thought_Mastery` | **U6** present simple negative (don't/doesn't) *(do-support)* | positive vs negative self-talk; food likes; "I don't worry" | Food & drink → **Papa Teach Me** | — |
| 06 | `06_Models` | **U7** Do you…? questions *(do-support)* | describing people: kind, smart; jobs; "Do you know…?" | Describing people / jobs → **English Singsing** | — |
| 07 | `07_Repetition` | **U3 + U4** present continuous (+ questions) | routine/practice verbs; "I'm listening", "right now" | "What are you doing?" → **Bob the Canadian** | — |
| 08 | `08_Identity` | **U8** present continuous vs present simple | identity & personality adjectives; hobbies | Routines vs now → **mmmEnglish** | — |
| 09 | `09_Kaizen` | **U10** was/were *(POV debut retells story in past)* | improvement/habits: harsh, rude, tiny steps | Past-tense storytime → **Learn English With TV Series** | ✓ |
| 10 | `10_Reading_Power` | **U11** past simple + irregular verbs (App. 2/3) | reading/learning verbs: went, read, learned | Irregular-verbs song → **English Singsing** | ✓ |

### Phase 2 — *Sur'at* / Momentum · A2→B1 · past, future, modals, present-perfect gateway

| L | AJ folder | Grammar (Murphy) | Vocab focus | Fun English theme → channel | POV |
|---|---|---|---|---|---|
| 11 | `11_Unlimited` | **U12** past negatives & questions (didn't / Did you?) | limits/ability: couldn't; "Did you ever…?" | Past questions → **mmmEnglish** | ✓ |
| 12 | `12_Healthy_100` | **U27** going to (plans) | health/lifestyle: diet, exercise; "I'm going to…" | Healthy habits → **Speak English With Vanessa** | ✓ |
| 13 | `13_Walden` | **U28** will/shall + **U26** present continuous for future | nature/simple living: calm, simple; "I'll…" | Weather & predictions → **Bob the Canadian** | ✓ |
| 14 | `14_Superior_Man` | **U31** can & could *(ability/requests)* | purpose/discipline/skills; "I can…" | "Can you…?" abilities → **English With Lucy** | ✓ |
| 15 | `15_Taoism` | **U33** should + **U30** might *(advice & possibility; light consolidation)* | balance/flow; giving advice; "you should…" | Giving advice → **Speak English With Vanessa** | ✓ |
| 16 | `16_Big_Picture` | **U34** have to + **U32** must / mustn't / needn't | goals/vision/rules; "I have to…" | School/work rules → **BBC Learning English** | ✓ |
| 17 | `17_Small_is_Beautiful` | **U35** would like / I'd like *(offers, politeness, ordering)* | preferences; restaurant & café; "I'd like…" | Ordering at a café → **Easy English** | ✓ |
| 18 | `18_Slow_Burn` | **U15** present perfect (I have done) — *the B1 gateway; "slow burn" = progress over time* | progress/patience; "I have…" | Present perfect intro → **mmmEnglish** | ✓ |
| 19 | `19_Leaders_Make_Mistakes` | **U17** Have you ever…? *(experiences; "have you ever made a mistake")* | mistakes/leadership/learning; "Have you ever…?" | "Have you ever…?" street interviews → **Easy English** | **T** |
| 20 | `20_Attractor_Factor` | **U16** I've just / already / …yet *(recent past)* | attitude/positivity; recent news | just / already / yet → **BBC Learning English** | ✓ |

### Phase 3 — *Ravonlik* / Fluency · B1→B2 · perfect contrast, questions, accuracy & range

| L | AJ folder | Grammar (Murphy) | Vocab focus | Fun English theme → channel | POV |
|---|---|---|---|---|---|
| 21 | `21_Healthy_Heart` | **U19** for / since / ago *(duration; "how long have you…")* | heart/blood/exercise; time expressions | for vs since → **Rachel's English** | ✓ |
| 22 | `22_Art_of_Power` | **U20** present perfect vs past simple *(the hard contrast)* | mindful/power/calm; life story | Perfect vs past → **BBC Learning English** | ✓ |
| 23 | `23_Excitement` | **U46** What/Which/How + **U44** subject vs object questions | passion/energy; interview & wh-words | Question words → **Papa Teach Me** | ✓ |
| 24 | `24_Adventure` | **U64 / U68 / U69** articles a/an/the *(travel makes them concrete; #1 Uzbek trap → also a spaced micro-card from L01)* | travel/risk/experience nouns | Travel vlog (slow) + "the" reduction → **Bob the Canadian / Rachel's English** | ✓ |
| 25 | `25_Plateaus` | **U65** plurals + **U66/67** countable/uncountable + **U82** much/many + **U75** some/any *(quantity; "plateau" = lighter consolidation)* | progress & quantity words; food quantities | Countable/uncountable → **English With Lucy** | ✓ |
| 26 | `26_Search_for_Meaning` | **U58/59** pronouns & possessives *(fix he/she/it gender — Uzbek `u` = he/she/it)* | meaning/purpose/people; he/she/it, my/his/their | he/she/it + possessives → **Papa Teach Me** | ✓ |
| 27 | `27_Be_a_Champion` | **U86 / U87 / U89** comparatives & superlatives | sport/competition; better/best/faster | Comparatives in sport → **BBC Learning English** | ✓ |
| 28 | `28_No_Failure` | **U109** and/but/or/so/because + **U111** first conditional (if…) *(cause/effect ↔ "no failure, only results")* | success/failure; connectors; "if…then…" | Linking words & conditionals → **mmmEnglish** | ✓ |
| 29 | `29_Break_Rules` | **U96 + U99–101** prepositions in/at/on (time & place) *(taught as chunks — "break rules" = the unlearnable-by-rule prepositions)* | places/school; at 8 / on Monday / in April | Prepositions of place & time → **English With Lucy** | ✓ |
| 30 | `30_Tribes` | **U113/114** relative clauses (a person who…) + **U93** adverbs of frequency + **FINAL REVIEW** *(range capstone)* | community/relationships; "a friend who…" | "Your community" + course celebration → **Easy English** | ✓ |

**Every priority unit from `grammar-book.md` (Tiers 1–6, ~40 units) is placed above.** *Deprioritised* (per the inventory): passive (U21–22), used-to (U25), reported speech (U49), 2nd conditional (U112), phrasal verbs (U107–108), reflexives (U62). These are **not** in the core; they surface as optional **"Extension"** cards and in an optional **B2 / IELTS-Writing pack** later.

---

## 5. Supplementary lesson table — 30 (with real, on-disk filenames)

Difficulty-ramped: **EnglishPod-heavy early** (easier, speaking, close to core level), **6ME-heavy late** (harder, listening, IELTS Part 3). Each is paired to the core lesson whose grammar/topic it recycles, and placed on **Day 7** of that core week. Titles/filenames below are **verified against disk** (`pdftotext` on every EnglishPod PDF; `ls` on 6ME).

**Path conventions.** EnglishPod: `content/listening/<folder>/englishpod_[B]{ID}{suf}.{ext}` where `<folder>` keeps its raw name (many carry a trailing `" u"` that is junk — map to the clean topic), and the `B` prefix is **present on every PDF** but **varies on the mp3s** (probe both `englishpod_B{ID}dg.mp3` and `englishpod_{ID}dg.mp3`). Suffixes: `dg` (dialogue ~1 min), `pr` (program ~10 min), `rv` (review ~6 min).

| S | Source · ID/date | Real title / slug (verified) | Files on disk | Recycles core | IELTS skill | Level |
|---|---|---|---|---|---|---|
| 01 | EP · 0263 | **Global View – Nationalities** | `listening/people u/0263/englishpod_B0263.pdf` + `englishpod_0263{dg,pr,rv}.mp3` | L01 (be, "I'm from…") | Speaking P1 personal info | A2 |
| 02 | EP · 0350 | **Daily Life – Talking About Relatives** | `listening/people u/0350/englishpod_B0350.pdf` + `englishpod_0350{dg,pr,rv}.mp3` | L03 (have got, family) | P1 family | A2 |
| 03 | EP · 0026 | **Daily Life – New Year's Resolution** | `listening/food u/0026/englishpod_B0026.pdf` + `englishpod_B0026{dg,pr,rv}.mp3` | L04/L12 (present simple, goals) | P1 habits/goals | A2 |
| 04 | EP · 0200 | **Daily Life – Junk Food** | `listening/food u/0200/englishpod_B0200.pdf` + `englishpod_0200{dg,pr,rv}.mp3` | L05 (don't/doesn't, food) | P1 food/health | A2 |
| 05 | EP · 0261 | **Daily Life – Describing Someone's Face** | `listening/people u/0261/englishpod_B0261.pdf` + `englishpod_0261{dg,pr,rv}.mp3` | L06 (present-simple Qs, adjectives) | P2 describe a person | A2–B1 |
| 06 | EP · 0240 | **Daily Life – Getting A Pet** | `listening/animals u/0240/englishpod_B0240.pdf` + `englishpod_0240{dg,pr,rv}.mp3` | L07 (present continuous) | P1 pets/home | A2–B1 |
| 07 | EP · 0039 | **Daily Life – My New Boyfriend** | `listening/people u/0039/englishpod_B0039.pdf` + `englishpod_B0039{dg,pr,rv}.mp3` | L08 (simple vs continuous) | P1 friends | A2–B1 |
| 08 | EP · 0052 | **Daily Life – Pizza Delivery** | `listening/food u/0052/englishpod_B0052.pdf` + `englishpod_B0052{dg,pr,rv}.mp3` | L17 (would like / ordering) | Listening S1 (transactional) | A2–B1 |
| 09 | EP · 0014 | **Daily Life – I'm in Debt** | `listening/economy u/0014/englishpod_B0014.pdf` + `englishpod_B0014{dg,pr,rv}.mp3` | L09–11 (past simple, money) | P1 money/shopping | B1 |
| 10 | 6ME · 160825 | domestic chores | `6_minute_english/160825_6min_english_domestic_chores.pdf` + `..._download.mp3` | L11 (past, routines) | Listening S2 + housework P1 | A2–B1 |
| 11 | EP · 0228 | **The Weekend – Going to the Beach** | `listening/weather u/0228/englishpod_B0228.pdf` + `englishpod_0228{dg,pr,rv}.mp3` | L13 (future plans, weather) | P1 weather/holidays | A2–B1 |
| 12 | EP · 0154 | **The Weekend – Rock Band** | `listening/music/0154/englishpod_B0154.pdf` + `englishpod_0154{dg,pr,rv}.mp3` | L14 (can / abilities, music) | P1 music/hobbies | A2–B1 |
| 13 | 6ME · 160818 | food & exercise (calories) | `6_minute_english/160818_6min_english_food_exercise.pdf` + `..._download.mp3` | L12 (health, going to) | Listening S2 + food vocab | B1 |
| 14 | EP · 0110 | **Daily Life – Registering for University** | `listening/education u/0110/englishpod_B0110.pdf` + `englishpod_B0110{dg,pr,rv}.mp3` | L16 (have to / procedures) | P1 study | B1 |
| 15 | EP · 0051 | **The Weekend – What a Bargain!** | `listening/shopping/0051/englishpod_B0051.pdf` + `englishpod_B0051{dg,pr,rv}.mp3` | L17/L27 (would like + comparatives) | P1 shopping | A2–B1 |
| 16 | 6ME · 171026 | sugar | `6_minute_english/171026_6min_english_sugar.pdf` + `..._download.mp3` | L15/L21 (should/advice, health) | P3 health opinions | B1 |
| 17 | 6ME · 170316 | lunch | `6_minute_english/170316_6min_lunch.pdf` + `170316_6min_english_lunch_download.mp3` *(note: pdf slug drops "english")* | L17 (food & meals) | Listening S2 + food vocab | B1 |
| 18 | 6ME · 171116 | coffee | `6_minute_english/171116_6min_english_coffee.pdf` + `..._download.mp3` | L18 (present perfect, drinks) | P1 café | B1 |
| 19 | 6ME · 180322 | microadventures | `6_minute_english/180322_6min_eng_microadventures.pdf` + `180322_6min_english_microadventures_download.mp3` *(dedupe the ` (1)` copies)* | L19 (Have you ever…?, travel) | P2 describe a trip | B1 |
| 20 | 6ME · 170126 | family history | `6_minute_english/170126_6min_english_family_history.pdf` + `..._download.mp3` | L22 (perfect vs past, family) | P2 describe a family member | B1 |
| 21 | 6ME · 171005 | adult exercise | `6_minute_english/171005_6min_english_adult_exercise.pdf` + `..._download.mp3` | L21 (for/since, sport) | P3 fitness discussion | B1 |
| 22 | EP · 0004 | **The Office – I need an assistant!** | `listening/work u/0004/englishpod_B0004.pdf` + `englishpod_B0004{dg,pr,rv}.mp3` *(ignore album-art jpgs)* | L23 (questions, work) | Workplace / functional | B1 |
| 23 | 6ME · 180830 | street food | `6_minute_english/180830_6min_street_food.pdf` + `180830_6min_english_street_food_download.mp3` *(pdf slug drops "english")* | L24 (prepositions/places, travel+food) | P2 describe a place to eat | B1 |
| 24 | EP · 0140 | **Daily Life – Buying a Computer** | `listening/technology/0140/englishpod_B0140.pdf` + `englishpod_B0140{dg,pr,rv}.mp3` | L25/L27 (comparatives, tech) | P1 technology | B1 |
| 25 | 6ME · 170928 | computers | `6_minute_english/170928_6min_english_computers.pdf` + `..._download.mp3` | L25 (comparatives, tech) | Listening S4 + P3 technology | B1–B2 |
| 26 | 6ME · 180621 | gaming | `6_minute_english/180621_6min_english_gaming.pdf` + `..._download.mp3` | L26 (hobbies) | P3 leisure opinions | B1–B2 |
| 27 | 6ME · 180614 | the World Cup | `6_minute_english/180614_6min_english_world_cup.pdf` + `180614_6_min_english_world_cup_download.mp3` *(note mp3 `6_min`)* | L27 (comparatives/frequency, sport) | P2 describe an event | B1–B2 |
| 28 | 6ME · 170413 | multiple careers | `6_minute_english/170413_6min_english_multiple_careers.pdf` + `..._download.mp3` | L28 (connectors, work) | P3 work opinions | B1–B2 |
| 29 | EP · 0241 + 0244 | **Interview Skills 3 – Education Background** + **4 – Talking About Work Experience** | `listening/education u/0241/englishpod_B0241.*` (no-B mp3) + `listening/work u/0244/englishpod_B0244.*` (no-B mp3) | L29 + interview | **Mock Speaking P1/P2** | B1–B2 |
| 30 | EP · 0250 + 0253 + 0259 + 6ME · 180426 | **Interview Skills 6 – Describing Strengths** + **7 – Describing Weaknesses** + **9 – Asking About the Position**; + "the internet" | `listening/people u/0250`, `people u/0253`, `work u/0259` (all no-B mp3, B pdf) + `6_minute_english/180426_6min_english_internet.pdf`+`..._download.mp3` | L30 + full mock | **Full mock interview + P3** | B2 |

**Why the Interview Skills climax (S29–S30).** EnglishPod's *Interview Skills 3–9* arc (0241/0244/0247/0250/0253/0259 — all verified) maps almost 1:1 onto IELTS Speaking's examiner–candidate format: a coherent, real capstone that bridges to a paid/official mock exam.

**Reserves (verified real; promote if any pick underperforms).** EnglishPod: 0007 *The Office – Virus!*, 0203 *Daily Life – Calling Tech Support*, 0176 *Daily Life – Heating*, 0185 *The Weekend – Farm Animals*, 0188 *The Office – Asking For A Raise*, 0195 *Global View – Job Hunting*, 0197 *Global View – Calling 911*, 0247 *Interview Skills 5 – Discussing Reasons*. 6ME (from the inventory's "Yes"/reserve list): 161110 bicycles, 170105 driving, 170525 veganism, 170907 uniforms, 170921 hair, 180315 learning a language *(mp3 slug `learn_a_language` vs pdf `learning_a_language`)*, 180712 smartphone addiction, 181011 plastic addiction, 190221 food allergies, 171123 getting fitter.

> ⚠️ **0185 is "Farm Animals," not a hometown lesson** — despite living in the `hometown u` folder. Do not use it for self-introduction. There is **no** true "hometown" dialogue in the library; the self-intro slot (S01) uses **0263 Nationalities** instead.

---

## 6. Study Methodology page — content outline

**Language: Uzbek-primary** (this page is meta-instruction — a lone learner must understand it completely, or the whole method fails), with English key terms in parentheses and a full English mirror behind the UZ/EN toggle. Sections:

1. **Bu kurs qanday ishlaydi / How this course works** — the Effortless English idea in plain Uzbek: *ko'p tinglash* (deep listening), *hissiyot bilan* (with emotion), *ovoz chiqarib javob berish* (answering aloud), *takrorlash* (repetition). The promise: *"You will learn to SPEAK, not to pass grammar tests."* Set expectations: slow, deep, and it works.
2. **The 7 rules** — one card each, bilingual, one line of "why."
3. **Oltin qoida: har kuni OVOZ CHIQARIB gapiring / The golden rule: speak aloud every day** — plain-Uzbek SLA explainer: comprehensible input + retrieval practice = automatic speech. Contrast with school grammar-testing (which they tried, and it failed). IELTS scores Fluency and Pronunciation — the two things you cannot pass by silent study.
4. **Kunlik odat / The daily habit (30–45 min)** — the 7-day cycle (§2) as a checklist; a sample peak-state day (stand, smile, move → listen → answer aloud → shadow). **Faol vaqt vs passiv vaqt**: download the MAIN, listen while commuting/cooking — this multiplies your hours without touching the 45-min active budget. Listening minutes are the #1 metric.
5. **Sur'atni tanlang / Choose your pace** — Effortless / Sprint / Gentle (§2) with honest trade-offs and a **backward-planning-from-exam-date** table. *"Sekin, lekin har kuni"* (slow but daily) beats *"tez, lekin tashlab ketish"* (fast but quitting). Rule: never advance until the mini-story is automatic.
6. **Yolg'iz gapirish mashqlari / Speaking techniques you can do ALONE** (the heart of the page — no partner needed):
   - **Answering mini-story questions aloud** — the #1 technique; shout the answer before the reveal, even one word. Speed > perfection.
   - **Shadowing (soya qilish)** — play audio, speak ~0.5 s behind, copy the *melody*; use EnglishPod `dg` and AJ Hoge MAIN.
   - **Self-recording (o'zingni yozib ol)** — record → play back → compare to the model → note one fix → repeat. **Keep your Lesson-1 recording and re-record it at Lesson 30 to *hear* your progress.** Browser mic only, nothing uploaded.
   - **POV retelling** — retell the story yourself in past, then future.
   - **Self-talk / narration** — narrate your day using the week's grammar.
7. **Chuqur tinglash / Deep listening** — listen many times *before* reading; use the transcript on later passes; never translate word-by-word; tolerate ambiguity.
8. **Kuchli holat / Peak state** — stand, move, smile, big voice; emotion locks in memory (AJ's L01 theme; ~80% of success is psychology).
9. **So'z boyligi / How to learn vocabulary** — learn **chunks**, use the Uzbek gloss once, then drop it and think in English examples.
10. **Talaffuzni o'zingiz tekshirish / Pronunciation self-check** — record + compare; drill the sounds Uzbek speakers miss: /v/–/w/, /θ/–/s/ (*think/sink*), final voiced consonants, vowel length, and **word stress**.
11. **O'zbek o'quvchilarning eng ko'p xatolari / Top mistakes for Uzbek speakers** — the **10 L1-interference clusters** (dropped copula, missing articles, 3rd-person -s, do-support, present perfect, prepositions, he/she/it gender, SVO word order, have vs have got, plurals/countability) and **which lesson fixes each** (links into the core table).
12. **Adashsangiz nima qilish kerak / What to do when you struggle** — plateaus are normal (ties to L25): re-listen to an old lesson; it'll feel easy — proof you improved. "Don't break the chain"; use your weekly freeze if life happens.
13. **FAQ** — bilingual, honest: *Do I really study one lesson a whole week? Why not translate everything? Do I need a partner? Is this enough for IELTS? When am I ready for a mock test?*

---

## 7. IELTS / CEFR alignment

**Honest framing (bilingual, stated up front):** this curriculum builds the *underlying spoken competence* for A2→B2. It is **not** an IELTS cram course. What we build is the fluency, vocabulary, grammar, and listening that IELTS then *measures*. At B1+ a learner adds task-specific practice (timing, band descriptors, full timed mocks, Writing/Reading) — a short **"Test-Day Skills"** page is recommended later, and the Interview Skills mock (S29–S30) is the bridge to a paid/official mock.

### Phase → CEFR → IELTS map

| Phase (core + supp) | CEFR | Rough IELTS | Speaking built | Listening built |
|---|---|---|---|---|
| **1 — Poydevor** · L01–10 + S01–09 | **A2** | 3.5–4.5 | **Part 1 foundations**: self, family, home, study, routine, food (present tense); no-hesitation short answers | **Section 1**: everyday social/transactional (EnglishPod dialogues) |
| **2 — Sur'at** · L11–20 + S10–19 | **A2→B1** | 4.5–5.5 | Extended **Part 1** + entry to **Part 2**: narrate the past, state plans, give advice, talk about experiences | **Section 2**: monologue on everyday topics (EP programs + first 6ME) |
| **3 — Ravonlik** · L21–30 + S20–30 | **B1→B2** | 5.5–6.5 | Full **Part 2** long turn + **Part 3** discussion: range & accuracy (articles, comparatives, conditionals, relative clauses); **full mock interviews** | **Sections 3–4**: multi-speaker + academic monologue, fast/varied accents (6ME `INSERT` clips) |

### IELTS Speaking criterion → course feature (the outcome map)

| Band criterion | Where it is built |
|---|---|
| **Fluency & Coherence** | Mini-story **answer-aloud** (automaticity) → connectors **L28** → self-recorded 60-sec talks |
| **Lexical Resource** | VOCAB glossaries + EnglishPod Key Vocab + 6ME 6-word packs, all as **chunks + Uzbek gloss** |
| **Grammatical Range & Accuracy** | The re-sequenced Murphy spine → **POV** intuition → "say a true sentence about yourself" drills |
| **Pronunciation** | **Shadowing** (EP `dg` + AJ Hoge MAIN) + Rachel's English Fun-English + minimal-pair self-check (§6.10) |

**Listening mapping.** EnglishPod dialogues ≈ **Section 1** (transactional); EP programs + scripted 6ME ≈ **Section 2/3**; 6ME **`INSERT`** vox-pops ≈ authentic **Section 4** speed/accents; the 6ME built-in MCQ trains listening-for-a-specific-answer. Phase 3 adds transcript-hidden, exam-paced full listens.

**CEFR badges** unlock at each phase boundary (A2 ✓ → B1 ✓ → B2 in progress) so learners *see* themselves climb the exam ladder.

---

## 8. Progress & completion model (localStorage + IndexedDB, no accounts)

**Philosophy:** reward *volume and reps*, not speed. Headline dashboard numbers are **total listening minutes** and **total speaking reps**; completion % is secondary.

### 8.1 What "complete" means — stars, with a mandatory speaking gate

A core lesson earns **stars** (achievable *and* replayable). The mini-story spoken rep is a **hard gate** — no star without it.

- **⭐ 1★ — Complete** (the honest minimum; advances the course): Grammar Spark done + Vocabulary reviewed + **MAIN listened ×3** + **Mini-Story answered aloud ×2** *(required gate; self-attested)* + POV ×2 *(only if present, L09–30)*.
- **⭐⭐ 2★ — Strong:** + Fun English watched + **one Speak-It recording saved**.
- **⭐⭐⭐ 3★ — Mastered** (gold): + paired **Supplementary lesson** done + a **second recording** kept (enables the Lesson-1-vs-Lesson-30 comparison).

**Supplementary lessons** are single-star (done / not done). *EnglishPod:* `dg` heard + Key Vocab reviewed + shadowed + one role played. *6ME:* listened ×1 + quiz answered + vocab reviewed + 60-sec response recorded. Speaking steps are **honor-system** (*"Men ovoz chiqarib gapirdim ✓"*) — framed as a promise to yourself; no backend can or should verify.

### 8.2 Storage (technically correct split)

- **Self-recordings are audio blobs → IndexedDB.** localStorage's ~5 MB cap cannot hold audio.
- **localStorage holds only lightweight flags/counts/dates** (progress, streak, badges, settings).
- **Export / Import JSON** button, surfaced prominently (+ copy-to-clipboard backup) — the only safe way to move devices or survive a cache-clear without accounts.
- Everything **degrades gracefully**: if storage is unavailable, lessons still play; only tracking pauses.

**The canonical `ess.progress.v1` schema (every field, with types + which UI reads it) lives in `03 §6.3` and is authoritative** — the excerpt below is illustrative and defers to it. It shows only the curriculum-relevant shape (the star/gate/metrics model); core **and** supplementary progress share one `lessons` map keyed by the real lesson id (`core-09`, `supp-pod-0004`, `supp-6min-180315` — never `supp-01`).

```jsonc
// Illustrative excerpt — full field list + comments in 03 §6.3 (authoritative):
{
  "schemaVersion": 1,
  "startedAt": "2026-07-16",
  "settings":  { "uiLang": "uz", "pace": "effortless", "rate": 1.0, "theme": "auto" },
  "lastLessonId": "core-09",
  "metrics":  { "listeningMinutes": 0, "speakingReps": 0, "recordings": 0, "xp": 0 },
  "streak":   { "count": 12, "longest": 20, "lastActiveDate": "2026-07-16", "freezesLeftThisWeek": 1 },
  "weeklyGoal": { "target": 5, "activeDaysThisWeek": 3 },
  "badges":   ["first-step", "streak-7", "a2-foundation"],
  "ieltsTopics": { "family": 1, "food": 2 },   // fills the coverage grid
  "lessons": {                                 // core AND supplementary — one map, keyed by the real lesson id
    "core-09": {
      "status": "complete",                    // none | inProgress | complete | mastered
      "stars": 1,                              // the 1★/2★/3★ tier (§8.1)
      "steps": { "grammar": true, "vocab": true, "main": true, "ministory": true,   // ministory = the mandatory speaking GATE
                 "pov": false, "fun": false, "record": false, "supp": false },
      "listens": { "main": 3, "ms": 2, "pov": 0 },
      "msAnswersAloud": 45,
      "completedAt": 1752100000000, "reviewDue": "2026-07-19"   // 1-3-7-14 spacing
    },
    "supp-pod-0004": {                          // supplementary = single-star (done / not done)
      "status": "complete", "stars": 1,
      "steps": { "dg": true, "vocab": true, "shadow": true, "roleplay": true }
    }
  }
}
```
*(Audio blobs live in IndexedDB, keyed by lesson id; localStorage stores only the `steps.record` flag and the `metrics.recordings` count.)*

### 8.3 Streaks, goals, badges (dopamine, tuned not to punish real life)

- **A "study day"** = any real action today (≥5 listening min OR ≥1 mini-story drill OR ≥1 recording). Deliberately achievable.
- **Speaking streak** ⭐ = *recorded or answered aloud today* — the headline habit.
- **Streak freeze:** 1 free skip-day per week, auto-applied, so one busy day doesn't nuke a long streak. **Weekly goal:** a forgiving "5 active days this week" ring (not all 7).
- **Spaced review:** completing a lesson schedules `reviewDue` at +1/+3/+7/+14 days; the home screen surfaces "Review today" cards.
- **Gentle re-engagement (frontend-only):** a localStorage-driven *"Bugun hali o'qimadingiz / You haven't studied today"* banner; optional Notification API + "Add to Home Screen". A **"Comeback"** badge (never a guilt message) greets returns after a break.
- **XP:** every checked step adds points — cheap, constant positive feedback with no backend.

| Badge (UZ / EN) | Trigger |
|---|---|
| Birinchi qadam / First Step | complete Lesson 01 |
| Olov / On Fire · To'xtovsiz / Unstoppable | 7 / 30 / 100-day streak |
| Tinglovchi / Deep Listener | 100 / 500 / 1000 total listening minutes |
| Notiq / Speaker | 100 mini-story answers spoken |
| Ovoz / Voice | 10 recordings saved |
| Grammatika ustasi / Grammar Guru | 20 grammar drill sets |
| Poydevor / A2 Foundation | finish Phase 1 (L10) + CEFR A2 badge |
| Sur'at / B1 Momentum | finish Phase 2 (L20) + CEFR B1 badge |
| Ravonlik / B2 Fluency | finish Phase 3 (L30) + CEFR B2-in-progress + printable "30 Core Lessons" certificate |
| Sayohatchi / Explorer | 10 supplementary lessons complete |
| Comeback | return after a 7+ day gap (kindness, not punishment) |

**Visualizations:** a phase "path" (Poydevor → Sur'at → Ravonlik), phase progress bars, a **listening-minutes counter as the hero number**, a speaking-reps tally, a streak calendar, and an **IELTS-topic coverage grid** (~20 Part 1/2 topics fill as practised).

### 8.4 Engagement cheat-sheet (why a lone learner stays)

| Risk of quitting | Mechanic that fights it |
|---|---|
| "It feels like no progress" | Daily checkbox + streak + XP + stars + CEFR badges; re-record L1 audio at L30 to *hear* growth |
| "It's boring / repetitive" | Content repeats, activity rotates daily; Day-7 fresh supplementary reward; varied Fun English |
| "Speaking alone is scary" | Honor-system aloud checks; private self-record (nothing uploaded); "stand up & shout" peak-state framing |
| "I got confused and gave up" | Uzbek scaffold on every explanation; spaced L1 error-fix cards |
| "I missed a day, why bother" | Weekly streak-freeze + forgiving 5/7 goal + Comeback badge |
| "Too slow / too fast" | Three self-chosen pace tracks, switchable anytime |

---

## 9. Uzbek language policy — exactly what is bilingual

**Principle:** *Uzbek is the scaffolding; English is the target.* Everything *about* learning is bilingual (Uzbek primary); everything *to be acquired* is English-only (immersion). A global **UZ / EN toggle** lets a confident learner hide the Uzbek later — a "graduation" feeling and an engagement win.

| Element | Language | Rationale |
|---|---|---|
| UI, navigation, buttons, labels | **Bilingual (Uzbek primary)** | usability |
| Lesson can-do goals | **Bilingual** | learners must know the measurable target |
| **Grammar Spark** explanation + L1 contrast + error-fix cards | **Uzbek** (English examples) | fastest comprehension; contrastive with Uzbek structure |
| **Vocabulary** glossary | **English chunk + Uzbek gloss + English example** | phrase acquisition with L1 support |
| MAIN / POV "what it's about" summary | **Bilingual, 2 lines** | orientation only |
| **MAIN, MINI_STORY, POV transcripts** | **English only** | immersion; the input to be acquired |
| **Mini-story Q&A drill** (the drill itself) | **English only** (bilingual instructions; optional Uzbek hint on hard items) | speaking must happen in English |
| EnglishPod / 6ME dialogue & transcript | **English only** (Key Vocab gets **Uzbek gloss**) | authentic input |
| Fun English videos | **English** (Uzbek framing note + watch-task) | real listening |
| Instructions / study tips / "how to do this step" | **Uzbek** | a lone learner must never get stuck |
| Common-mistake warnings (10 L1 clusters) | **Uzbek** | targeted L1 remediation |
| **Study Methodology page** | **Uzbek-primary** (English mirror via toggle) | critical instructions |
| IELTS/CEFR page | **Bilingual** | expectations & guidance |
| Progress, badges, streak messages | **Bilingual labels** | motivation must land |
| Comprehension-check *answer options* | **English** (question stems may be bilingual) | tests English, not translation |

---

## 10. Content & build notes (feasibility — carried from the inventories)

- **Extract transcripts to structured JSON at build time.** Split each MINI_STORY into `{prompt, answer}` pairs (the highest-value feature). Strip the copyright/logo boilerplate from the top of MAIN/VOCAB/MS.
- **Glob by numeric prefix and keyword, never hardcode filenames.** AJ Hoge audio: `1_`=MAIN, `2_`=VOCAB, `3_`=MINI_STORY, `4_`=POV. PDFs by keyword (MAIN/VOCAB/MS/MINI/POV). Naming is irregular: missing `_MAIN` suffix (05, 07, 08, 19, 20), double extensions (`11`, `24`, `27` = `.mp3.mp3`), case drift (`18` = `MINI_Story`), per-lesson text folders (`03` misspelled "Emotional Master 2 Text"), ALL-CAPS PDF regime for 19–30, `23` typo "Exitement MAIN.pdf".
- **Gate POV on presence:** hide for 01–08; text-only (optional TTS) for 19; audio+text for the rest (21 POV mp3, 22 POV PDF).
- **Host all media off-repo** (Cloudflare R2 free tier or similar) — stream + offer download. Payload: ~940 MB AJ Hoge (111 mp3 + 112 PDF) + 487 MB EnglishPod + 6ME. GitHub Pages cannot hold it (>1 GB, and single audiobooks exceed 100 MB). **Exclude ~400 MB junk**: the two Kaizen audiobooks, the 4-Hour Work Week mp3 (221 MB), copyrighted book PDFs, `.dat`/`.DS_Store`/album-art.
- **Grammar book is copyrighted** — author our own Uzbek Grammar Spark prose; offer the Murphy PDF only as an optional download; reuse App 2/3 (irregular verbs) and App 5 (spelling) as interactive reference cards.
- **EnglishPod path quirks:** strip trailing `" u"` from 9 folder names (URL-encode the space when building media paths); the `B` prefix is on **all PDFs** but only **10/28 folders' mp3s** — probe both `englishpod_B{ID}{suf}.mp3` and `englishpod_{ID}{suf}.mp3`, or store exact names. Ignore `work u/0004`'s album-art jpgs.
- **6ME quirks:** key by `YYMMDD`; derive the slug from the PDF title line, not the filename; pair PDF+MP3 by **date prefix**, not exact stem (slug typos: `lunch`/`street_food` pdfs drop "english"; `world_cup` mp3 uses `6_min`; `learn_a_language` mp3 vs `learning_a_language` pdf). **Dedupe** the three ` (1)` duplicates (`161215`, `180322`, `181220`).

---

### One-line summary
A **30-week spoken-first spine** — 30 AJ Hoge core lessons (present tense → tenses/modals/present-perfect → accuracy & range, each grounded in a real Murphy unit taught briefly in Uzbek then *acquired* through POV + answer-aloud mini-stories), interleaved with **30 verified EnglishPod + 6 Minute English supplementary lessons** (climaxing in a real Interview-Skills mock interview) — engineered around one behaviour (*answer out loud, fast*), measured by listening minutes and speaking reps inside a forgiving star/streak system, and aligned honestly to CEFR A2→B2 and IELTS Speaking Parts 1–3 / Listening Sections 1–4.
