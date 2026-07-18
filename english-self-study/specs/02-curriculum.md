# 02 — Curriculum Specification (Final)
### Free, no-login, frontend-only English self-study for Uzbek learners who can already *follow* AJ Hoge — climbing B1 → B2 in speaking, on the road to IELTS/CEFR

This is the single, implementable curriculum spec. It reflects the **owner's curriculum redefinition**: the elementary *Essential Grammar in Use* (Murphy) ladder is retired; each week is **one whole AJ Hoge lesson + two original grammar topics + one EnglishPod episode + one 6 Minute English episode**, all as sections inside a single weekly lesson page. There are **no separate supplementary lessons**. Lesson ids/routes are unchanged (`core-01 … core-30`). Every grammar topic, episode, and filename named here is cross-checked against `specs/inventory/*.md` **and** the actual files on disk. `content/` is READ-ONLY; the build is buildless; no git commits.

---

## 0. How this syllabus was chosen (judging + synthesis)

Three grammar-syllabus proposals were written under different lenses and scored on four fitness criteria (1 = weak, 5 = excellent). All three agreed on the non-negotiables the owner set — retire Murphy, author **original** B1→B2 topics for learners who can follow AJ Hoge, two grammar topics per AJ lesson, EnglishPod + 6ME folded *inside* each week, the AJ set never divided, the POV as the built-in grammar-acquisition engine, and a *suggested* (never policed) weekly rhythm. They differed in **sequencing philosophy** and specific placements.

| Criterion | P1 — Grew-from-theme | P2 — Progression-first | P3 — Outcome-first (IELTS) |
|---|---|---|---|
| **Fit for AJ-listener level** (B1→B2, no A2-baby content) | 5 — starts above the copula; frames "known" structures as *sharpening a leaky structure* | 5 — every topic pitched at usage/contrast/exception level, forms assumed known | 5 — explicitly lifts the floor A2→B1; retires Murphy outright |
| **Speaking outcomes** | 4.5 — POV-as-acquisition engine, mini-story gate, reps-per-day rhythm | 4.5 — frequency-first (tense/modal/conditional dominate), spiral review of the spoken high-runners | 5 — every topic tagged to an IELTS band-lifter **and** a felt CEFR can-do; outcome ledger |
| **Uzbek learners** (10 L1-interference clusters) | 5 — all 10 clusters mapped; contrastive; ʻ convention | 5 — best pain-point audit; articles start earliest (max runway); prepositions as chunks ×3 | 4.5 — sharp, honest demotion of A2-level *slips* (dropped copula, have-got, 3rd-person -s, he/she/it) to recurring error-fix micro-cards |
| **Feasibility vs real files** | 4.5 — verified paths; honest 28-for-30 gap via null-gating; minor: chose L22/L26 for the two nulls | 5 — real filenames; correct B-prefix probing; Interview-Skills arc clustered late | 4 — accurate filename footnotes; leans on a few "No"-rated abstract 6ME picks (defended, but riskier) |
| **Overall** | **4.75** | **4.9** | **4.6** |

**Spine / winner: P2 (progression-first).** Its spiral-thread rigor and pain-point audit give the soundest backbone: the spoken high-runners (tense/aspect, modals, conditionals) dominate the 60 slots; each hard core is revisited in graded passes rather than taught once; and it starts **articles at L04** — the single biggest Uzbek gap — for the longest possible runway. For an audience whose stated goal is *speak fluently, then take IELTS*, a frequency-ordered fluency spine is more robust than an exam-first or a purely theme-first one, and the other two lenses graft onto it cleanly.

**Grafted from P1 (grew-from-theme):** the "**why it fits**" anchoring — every topic is justified by that AJ lesson's *actual message and language* (e.g. Kaizen's POV literally says *"Since she was a child Jan has been rude"*), so grammar feels native to its week rather than bolted on. This is what makes the syllabus feel authored *for* AJ Hoge, not merely re-sequenced.

**Grafted from P3 (outcome-first):** the **IELTS band-lifter + felt CEFR can-do** framing per topic (surfaced in the UI so learners see *why* a structure matters); the **outcome ledger** that reconnects the spine to the preserved §7; and the honest decision to **demote A2-level Uzbek *slips*** — dropped copula, have/have got, third-person `-s`, he/she/it gender — from standalone topics to **recurring "Xato tuzatish" micro-cards** (they are below the B1 floor for this audience but still leak into speech, so they are *spaced*, not *taught*).

**Contradictions resolved (the decisions that make this one coherent syllabus, not a compromise):**
1. **Grammar floor & trajectory.** No `am/is/are`, no `have got`, no do-support-from-zero. The **grammar spine runs B1 → B2**; the §7 overall/listening/IELTS map (A2→B2) is preserved because *listening* legitimately starts at A2 while *grammatical range* starts at B1. Stated honestly in §1 and §7.
2. **The conditional ladder is progression-correct:** real first — 0/1st at **L03** (every emotional technique is "if I do X, my state changes to Y") → 2nd at **L11** (imagine no limits) → 3rd at **L25** (plateau regret) → mixed at **L28** ("no failure": past failure → present growth). (P1 placed unreal before real; P2/P3's real-first order wins on progression.)
3. **The present-perfect climb** — Uzbek's hardest wall — **debuts intuitively at L09** through the Kaizen POV ("Since she was a child…") exactly as the owner identified, then is taught **formally and late**, once listening stamina is high: L18 simple gateway → L19 experience → L20 just/already/yet → L21 for/since + continuous → **L22 the hard past-vs-perfect contrast** (the climax). Six graded touches.
4. **The EnglishPod 28-for-30 gap** is resolved by **null-gating L15 (Taoism) and L22 (Art of Power)** — the two most abstract "inner / effortless power" lessons, which have no everyday-transactional-dialogue analogue in the 28-episode library. Two of the three proposals chose exactly this pair; it is the most defensible. Both null weeks are carried by their **strongest-fit 6ME** (Taoism → *sighing* = effortless natural release; Art of Power → *mindfulness* = literally Thich Nhat Hanh), plus the two grammar topics and the full AJ set. The EnglishPod section is **hidden by data-presence gating** — the exact pattern already used for POV on L01–08. All 28 episodes are used **exactly once**; no reuse.
5. **Interview-Skills bridge preserved.** EnglishPod's six-part *Interview Skills* arc (0241/0244/0247/0250/0253/0259) is woven into the self-presentation lessons (L04, L18, L19, L26, L27, L29) and climaxes with the L30 capstone — the IELTS-Speaking-format bridge the old spec bolted on at the end, now integrated.
6. **The mini-story speaking gate is untouched.** The one behaviour the whole course engineers — *answer the mini-story questions out loud, fast* — remains the hard gate for even 1★ (§8). EnglishPod and 6ME, formerly separate single-star lessons, now fold into the *same* lesson's 2★/3★ tiers.

**Essential Grammar in Use (Murphy) is demoted to an optional reference download only** — offered alongside the media library the way any asset is, never the source of the on-site grammar. The 60 topics below are **original**, authored for this course.

---

## 1. Goals & audience

**Who:** Uzbek self-learners who can **already follow AJ Hoge's MAIN talk** — comfortable A2+ listeners. They studied English at school (grammar-translation) and typically read a little, but **cannot speak fluently**. They are past the copula and bare present simple; what they lack is *spoken range and accuracy* and the *automaticity* to produce it. Many aim, eventually, at IELTS or a CEFR certificate.

**The one behaviour we engineer:** *hear a question → answer OUT LOUD, fast, without translating.* Everything else serves this. Fluency is automaticity, and automaticity is built by retrieval practice under mild time pressure — which is exactly what AJ Hoge's mini-story "listen-and-answer" loop is.

**Method:** AJ Hoge's **Effortless English**, read through a Second-Language-Acquisition lens (Krashen comprehensible input + retrieval practice). Seven working rules, shown to learners bilingually on the methodology page:
1. Learn **phrases/chunks**, not single words.
2. Grammar is for **comprehension**, not drilling (see the reconciliation below).
3. Learn with your **ears**, not your eyes — listening volume is the headline metric.
4. Learn **deeply** — live with **one whole lesson for a week**, heard many times.
5. **POV stories** teach grammar intuitively (same story, different tenses).
6. Use **real English** (AJ Hoge, EnglishPod, BBC — all authentic).
7. **Listen and ANSWER** (not repeat) — the mini-story is the speaking engine.
Plus AJ Hoge's psychology layer: practise in a **peak emotional/physical state** (stand, smile, move, big voice).

**Reconciling "grammar explained in Uzbek" (owner's requirement) with AJ Hoge's "don't study grammar rules."** They only seem to conflict. Our resolution: each **Grammar Spark** is short (5–8 min), in **Uzbek**, framed as *"so the story makes sense"* — it contrasts English with Uzbek structure to remove confusion fast (Uzbek learners need one conscious "aha" because the English structure is alien to L1), then gets out of the way. **Real acquisition happens through the POV stories and mini-story repetition** — implicit, spoken. We front-load *explanation* (fast, in L1) and back-load *acquisition* (slow, in English, through volume). Because these learners are past the elementary tier, each Spark is pitched at **usage / contrast / exception** level — never at form-teaching level.

**Macro-shape:** **30 weekly lessons** (the AJ Hoge spine, one per folder `01_Intro … 30_Tribes`). **Each week = one whole AJ Hoge lesson (MAIN + VOCAB + MINI_STORY + POV, never divided or cropped) + two original grammar topics + one EnglishPod episode + one 6 Minute English episode + Fun English + Speak-It + Lesson-Check**, all as sections inside a single lesson page. AJ recommends living with one lesson for a week; the site *suggests* a 7-day rhythm and *invites* a second week, but never gates or polices. Organised into 3 phases:

| Phase | Uzbek name | Lessons | Overall CEFR (per §7) | Grammar spine centre of gravity | "By the end I can…" |
|---|---|---|---|---|---|
| **1 — Foundation** | *Poydevor* | 01–10 | A2 → **B1** | present/past aspect sharpened; gerund/infinitive, comparison, defining relatives, articles & prepositions seeded; present perfect meets its intuition in the L09 POV | talk about myself, my routine, and simple stories with more accuracy |
| **2 — Momentum** | *Sur'at* | 11–20 | **B1** | full modal system, three futures, the present-perfect family taught formally, first conditionals, the passive begins | make plans, give advice, talk about experiences, tell fuller stories |
| **3 — Fluency** | *Ravonlik* | 21–30 | **B1 → B2** | present-perfect-vs-past contrast, passive range, reported speech, past perfect/narrative, 3rd & mixed conditionals, cleft/inversion, discourse & hedging + capstone review | discuss, compare, hypothesise, and hold an opinion with reasons |

**Honest CEFR note:** dropping the A2 grammar floor moves the **grammar trajectory to B1 → B2**. The §7 phase → CEFR → IELTS map (A2 → B1 → B2) is preserved and reused as the difficulty ramp, because *listening* competence legitimately starts at A2 (AJ MAIN, EnglishPod dialogues) even as *grammatical range* starts at B1.

**Headline success metrics** (what the dashboard celebrates): **total listening minutes** and **total speaking reps** — *not* lesson count. This is deliberate: we accept slower *visible* progress to protect real acquisition and to stop a rush-to-finish instinct.

---

## 2. Lesson template — one whole AJ Hoge lesson = one week

The lesson page shows the **same sections in the same fixed order**. The order encodes the pedagogy: *a little grammar + key words make the talk comprehensible → deep listening installs the input → the mini-story forces spoken output → POV makes grammar automatic → a real conversation (EnglishPod) and a topical listening stretch (6ME) add authentic volume and speaking → fun lowers the affective filter → free production → review.* The shipped `core-09` lesson-page look and feel is **approved and extended, not redesigned** — this template adds a second Grammar Spark card and the EnglishPod + 6ME sections; nothing is removed.

> **The AJ Hoge lesson is NEVER divided or cropped.** MAIN + VOCAB + MINI_STORY + POV stay intact as one set and are the **daily constant** of the week. The two grammar topics, the EnglishPod episode and the 6ME episode rotate *around* that constant across the week — they never replace or fragment it.

| # | Section (UZ / EN label) | Source asset | Language | Job |
|---|---|---|---|---|
| **0** | **Lesson Home & Can-Do Goal** — *"Bu darsda / In this lesson"* | authored | **Bilingual** | Theme in one line + a measurable can-do goal (*"Dars oxirida … savoliga toʻxtamasdan javob bera olasiz / By the end you can answer … without pausing"*). Peak-state ritual prompt. Time estimate. Shows the week's two grammar topics and both episodes as a checklist. |
| **1** | **Grammar Spark — 2 topics** — *"Grammatika (oʻzbekcha): A va B"* | authored, original | **Uzbek** (+ English examples) | **Two cards, `grammarA` and `grammarB`.** Each: fast, contrastive, comprehension-only; explicit L1 contrast; 2–3 interactive drills (tap-to-answer, gap-fill, then **"say a true sentence about yourself"** aloud); a 20-sec **"Xato tuzatish"** card for this topic's top Uzbek-L1 trap. A UI tag names the **IELTS band-lifter / CEFR can-do** each topic earns. NOT drilled to mastery here. |
| **2** | **Vocabulary** — *"Soʻzlar"* | VOCAB mp3 + authored glossary | **English chunk + Uzbek gloss + English example** | Pre-teach words so MAIN is comprehensible (Krashen i+1). **Phrases/collocations, not isolated words.** Flashcards + audio-per-word. |
| **3** | **Deep Listening — MAIN** — *"Chuqur tinglash"* | MAIN mp3 + synced transcript | **English only** (+ 2-line Uzbek "what it's about") | High-volume comprehensible input; the motivational talk. Tap a transcript line to replay. Repeat-listen counter. Download button (encourage passive listening on commute/chores). |
| **4** | **Mini-Story Speaking Loop** ★ — *"Gapirish"* | MINI_STORY mp3, parsed into `{prompt, answer}` pairs | **English** content, **Uzbek** instructions | **THE speaking engine.** Per pair: play/show question → 2–3 s *"Ovoz chiqarib javob ber! / Answer out loud NOW"* beat → tap to reveal the italic answer → self-check → next. **No typing.** Peak-state nudge in Uzbek. This is the **mandatory gate** (§8). |
| **5** | **POV Grammar Story** — *"Grammatika jonli"* *(lessons 09–30 only; L19 = text-only)* | POV mp3 + transcript | **English** (+ short Uzbek "which tense changed & why") | Same story retold in another tense → intuitive grammar + spaced tense review; the built-in acquisition engine for that week's tense-based topic. UI **gated on presence**: hidden for 01–08; text-only (optional TTS) for 19. |
| **6** | **EnglishPod — Conversation** — *"Suhbat"* | `dg`/`pr`/`rv` mp3 + transcript | **English** (Key Vocab gets **Uzbek gloss**) | The week's **real conversation** — the speaking half. Listen `dg` cold → transcript + Uzbek-glossed Key Vocabulary → `pr` explanation *(skippable on Sprint)* → **shadow** line-by-line → **role-play** Role A then B → `rv` recap. UI **gated on presence**: hidden for **L15 & L22** (`englishPod: null`). |
| **7** | **6 Minute English — Listening Stretch** — *"Tinglash mashqi"* | 6ME mp3 + transcript | **English** (6-word pack gets **Uzbek gloss**) | The week's **B1→B2 listening stretch** — the IELTS half. Pre-listening MCQ (from the PDF) → predict → gist listen (transcript hidden) → reveal answer → 6 target words (Uzbek gloss) → re-listen with transcript, attending to the **`INSERT`** vox-pops (authentic accents = the hardest, best stretch). |
| **8** | **Fun English** — *"Zavq bilan"* | embedded YouTube (themed) | English video, **Uzbek** framing | Lower the affective filter; extra input in a different voice/accent. One tiny watch-task, no test. |
| **9** | **Speak It Yourself** — *"Oʻzingni sinab koʻr"* | authored prompts + browser mic | **English** task, **Uzbek** instructions | Output: shadow the MAIN, answer mini-story Qs from memory, and **record a 60-sec response** to an IELTS-style prompt *using this week's two grammar topics*. All local; nothing uploaded. |
| **10** | **Lesson Check** — *"Darsni yakunlash"* | localStorage / IndexedDB | **Bilingual** | Check off steps, award stars, log listening minutes + reps, update streak/badges, schedule the 1-3-7-14 spaced review. |

**The Mini-Story Loop (highest-value feature).** Confirmed transcript structure (aj-hoge.md §1): a **bold statement** then rapid **question → italic short-answer** loops. The build parses each MS PDF into `{prompt, answer}` pairs (already done for `core-09`) to power the answer-aloud drill. Answering is **spoken and honor-checked** (*"Men ovoz chiqarib gapirdim ✓"*) — no backend can or should verify it.

### The suggested 7-day rhythm — same lesson all week, a different focus each day (default *Effortless* track, ~30–45 min/day)

The whole AJ set is the daily *constant* (MAIN averages ~15 min — tell learners to **download it and listen passively** during commute/chores so it doesn't eat the active budget). The rotating *focus* changes each day so the week never feels repetitive, and the two grammar topics, the EnglishPod episode and the 6ME episode are spaced so each gets a day in the light. **This is a suggestion the site offers — never a gate.**

| Day | Name (UZ / EN) | Focus | Speaking reps |
|---|---|---|---|
| **1** | *Boshlash / Kick-off* | Can-do goal + peak-state ritual → **Vocab** pre-teach → first **MAIN** listen → **Grammar A** + its drills | 0 (input) |
| **2** | *Chuqur tinglash / Deep Listen* | **MAIN ×2** with transcript → Vocab review → finish **Grammar A** ("say a true sentence about yourself", aloud) | a few |
| **3** | *Gapirish / Speaking* | **MAIN ×1** → **Mini-Story ×1** (answer aloud) → **Grammar B** + its drills | ~15 |
| **4** | *Gapirish kuni / Speaking Day* ⭐ | **Mini-Story ×2** (fast, aloud) → **POV ×1** (L09–30) → **Grammar B** "say a true sentence" | ~30 |
| **5** | *Suhbat / EnglishPod Day* | **POV ×1** (feel Grammar B's tense in the story) → **MAIN ×1** → **EnglishPod**: `dg` cold → Key Vocab (Uzbek gloss) → `pr` → **shadow + role-play** A then B | role-play + ~15 |
| **6** | *BBC / 6 Minute Day* | **6 Minute English**: predict → gist listen → MCQ → 6-word pack → re-listen with transcript (`INSERT` clips) → **Fun English** → **Speak-It: record a 60-sec** answer | 1 recording |
| **7** | *Yakun / Review + Reward* | **Mini-Story from memory** (no audio) → re-do both grammar **"Xato tuzatish"** error-fix cards (spiral) → **EnglishPod `rv`** or a 6ME re-listen → **Lesson Check**: stars, listening minutes, reps, streak, celebrate | ~15 + self-review |

> **Presence caveats (all suggestions, so the reps still land):**
> - **No POV (L01–08):** replace each *POV ×1* on **Days 4 and 5** with an extra **Mini-Story** repetition (answer aloud).
> - **No EnglishPod (L15 Taoism, L22 Art of Power):** **Day 5** redirects to an extra **shadowing** pass of the AJ MAIN plus a second **6ME** pass (transcript hidden, then shown); the EnglishPod section simply isn't shown.
> - **POV text-only (L19):** Day 4 reads the POV transcript (optional TTS), then goes straight into extra Mini-Story reps.

**The sequence within a lesson never changes** — you may not skip the MAIN (3) or the Mini-Story (4). Faster tracks compress the days; they never drop these two.

### Pace tracks (learner picks one, switchable anytime)

| Track | Pace | Time/day | Full course | For whom |
|---|---|---|---|---|
| **Effortless** (default) | 1 lesson / week | 30–45 min | ~7–8 months | Most learners; AJ Hoge's own method; deepest retention |
| **Sprint** | 1 lesson / 3–4 days (combine days 1–2, 3–4, 5–6) | 45–60 min | ~4 months | A deadline / high motivation / already solid B1 |
| **Gentle** | 1 lesson / 10–14 days | ~20 min | ~10–12 months | Very busy; wants extra repetition |

Rule stated bluntly on the methodology page: **never advance until you can answer the mini-story questions automatically.** Speed is not the goal; automaticity is. A **backward-planning table** (weeks-until-exam → which track) helps exam-daters choose.

---

## 3. In-lesson EnglishPod & 6 Minute English sections (folded — there are no separate supplementary lessons)

EnglishPod and 6 Minute English are **sections inside each weekly lesson** (template §2, sections 6 and 7), not standalone lessons. They add authentic volume without new grammar: **EnglishPod = the SPEAKING half** (short natural dialogues → shadow + role-play), **6 Minute English = the LISTENING/IELTS half** (BBC accents, built-in quiz + 6-word pack; the B1→B2 stretch). Both consolidate the week's AJ theme; neither introduces a grammar topic of its own.

**EnglishPod section flow (speaking-focused), inside the weekly lesson:**
1. Topic warm-up — **bilingual**, 2 lines + a prediction question (ties to the AJ theme).
2. Listen to **`dg`** dialogue cold (~1 min) — get the gist.
3. Read transcript + **Key Vocabulary with Uzbek gloss added** (the PDF defines in English only; we add Oʻzbekcha — e.g. verified in 0004: *understaffed = "yetarli xodim yoʻq"*, *give me a hand = "yordam ber"*).
4. Listen to **`pr`** for the hosts' line-by-line explanation *(skippable on Sprint)*.
5. **Shadow** the dialogue line-by-line.
6. **Role-play** Role A, then Role B, out loud (optional self-record). ← the speaking win.
7. **`rv`** review track as vocab recap; self-quiz.

**6 Minute English section flow (listening-focused), inside the weekly lesson:**
1. Topic intro + the pre-listening **quiz question** — **bilingual** framing (the PDF ships a ready-made 3-option MCQ; answer revealed near the end).
2. Predict the answer.
3. Listen once for gist (~6 min), transcript hidden.
4. Reveal quiz answer + self-check.
5. **Vocabulary**: the 6 target items, **Uzbek gloss added**.
6. Listen again with transcript; pay special attention to the **`INSERT`** vox-pop clips (authentic accents — the hardest, best B2 stretch; the closest free analogue to real IELTS audio).
7. Feeds the **Speak-It** (template §9): record a 60-sec answer to a related IELTS-style question.

*Bilingual split identical to the rest of the lesson: instructions + glosses in Uzbek; all audio, transcripts, and prompts in English.* **EnglishPod↔AJ fit is inherently loose** (transactional everyday English vs the psychology-of-success talks) — treat the EnglishPod tag as "this week's conversation practice," resonance not equivalence. **6ME↔AJ fit is tighter**; several picks the A2-calibrated inventory rated "No" (abstract psychology/society) are used *deliberately* — the redefined B1→B2 audience can handle them, and the AJ MAIN pre-teaches that week's theme and vocabulary, scaffolding the harder 6ME listen.

> **S7 (as shipped).** The EnglishPod steps 1–7 and 6ME steps 1–7 above match what shipped, with two step-completion refinements from the S5 star model (04 §5.7): **`steps.ep`** is set by **shadow + one role played** (honor checks), with the **`dg`-listen counter (`listens.ep`≥1)** as the alternate satisfier; **`steps.sixmin`** is set by **quiz-answered + the 6-word pack reviewed** (honor checks), with the **gist-listen counter (`listens.sixmin`≥1)** as the alternate satisfier. In the 6ME flow the **quiz reveal (step 4) renders after the gist listen (step 3)** — options are placed at the predict beat, the reveal below the listen. The **`INSERT` vox-pop paragraphs are visually highlighted** in the re-listen transcript (not merely noted). EnglishPod is `null`-gated on L15/L22, where `steps.ep` auto-satisfies.

---

## 4. Grammar syllabus — 30 lessons × 2 original topics (B1 → B2)

The 60 topics are **original**, authored for this course; *Essential Grammar in Use* (Murphy) is **demoted to an optional reference download only** (offered alongside the media library, never the source of on-site grammar). `A` is the topic pitched for Days 1–2, `B` for Days 3–4. **UZ titles use the repo convention** ʻ (U+02BB) for oʻ/gʻ and ʼ (U+02BC) for the glottal in feʼl/maʼno, matching `data/lessons/core-09.json`. Every "why it fits" is anchored to that AJ lesson's actual message. `POV`: ✓ = audio+text, T = text-only, — = absent (§5/aj-hoge.md).

### Phase 1 — *Poydevor* / Foundation · L01–10 · consolidating at B1 (no A2-baby content; POV debuts at L09)

| L · AJ theme | Grammar A (EN — *UZ*) | Grammar B (EN — *UZ*) | Why it fits (theme / POV hook) · POV |
|---|---|---|---|
| **01 Intro** | Present simple for habits & routines, + the 3rd-person `-s` & do/does you still drop *at speaking speed* — *Hozirgi oddiy zamon: odat va tartib (+ 3-shaxs -s)* | Adverbs of frequency & word order (always/usually/rarely/hardly ever) — *Chastota ravishlari va soʻz tartibi* | The course **is** a daily ritual in present simple ("listen every day, always in peak state"); a diagnostic on-ramp that sharpens the errors surviving into B1 speech and the SOV→SVO adverb slip (pain #8). — |
| **02 Emotional Mastery** | Present continuous vs present simple + stative verbs — *Hozirgi davomiy va oddiy zamon; holat feʼllari* | `-ed`/`-ing` adjectives + dependent prepositions of feeling (afraid of, excited about, worried about) — *-ed/-ing sifatlari va bogʻliq predloglar* | Emotions = current state ("I'm feeling") vs general ("I feel"); the stative exception is how you report mood. Kills "I am boring"; drills dependent prepositions (pain #6) in emotional chunks. — |
| **03 Emotional Mastery 2** | Modals of advice: should / ought to / had better / why don't you — *Maslahat modallari: should / ought to / had better* | Zero & first conditional — real cause→effect — *Nol va birinchi shart: haqiqiy sabab-natija* | The techniques are self-coaching advice ("Smile. You should…"); every technique is "if I do X, my state becomes Y." Opens the modality spine **and** the conditional ladder (real first). — |
| **04 Beliefs** | Articles 1 — a/an vs the, first vs known mention — *Artikllar 1: a/an va the — yangi va tanish* | Mental-state verbs + that-clauses (I believe/think/know (that)…) — *Fikr feʼllari va 'that' ergash gapi* | Beliefs are stated with articles ("a belief", "the belief that…") and that-clauses ("I believe that I can speak English" = the target sentence). Starts the #1 Uzbek trap earliest (26-week runway); seeds reported speech. — |
| **05 Thought Mastery** | Gerund vs infinitive 1 (enjoy/keep/stop -ing vs want/decide to; stop/remember + to/-ing) — *Gerundiy va infinitiv 1: enjoy doing / want to do* | Modals of present deduction: must / might / could / can't be — *Hozirgi zamon xulosasi: must / might / can't be* | Self-talk runs on thought verbs ("I keep thinking, decided to change, stopped worrying"); mastering thoughts = evaluating them ("that thought can't be true, it might be fear"). Opens gerund/inf (pain) + the deduction thread. — |
| **06 Models** | Comparatives, superlatives & (not) as … as — *Qiyosiy va orttirma daraja; (not) as … as* | Defining relative clauses (who/that/which/whose) — *Aniqlovchi ergash gap: who / that / which / whose* | Modelling = comparing yourself to admired people ("she speaks more fluently than me, as well as a native") and defining them ("a model is someone who…"). Opens comparison + the relative-clause thread. — |
| **07 Repetition** | `used to` / `would` — past habits & states — *Oʻtmish odatlari: used to / would* | Time & duration prepositions: for / since / during / ago — *Payt predloglari: for / since / during / ago* | Repetition contrasts old cramming you **used to** do with new daily practice; repetition over time = duration ("for years, since 2020"). Delivers the time-preposition chunk set (pain #6). — |
| **08 Identity** | Past simple narrative & sequencing (then/after that/finally; irregulars) — *Oʻtgan zamon hikoyasi va ketma-ketlik* | Expressing change: get / become / turn + adjective — *Oʻzgarishni ifodalash: get / become + sifat* | Identity is a journey from a past self ("I was shy, I studied for years") to who you've **become** ("my English is getting better"). Establishes the past backbone before L09's POV; Part 1 "how has your English changed?" — |
| **09 Kaizen** | Present perfect — first contact: `since` + a past point, `How long…?` (met through the POV) — *Present perfect bilan tanishuv: since / How long (POV orqali)* | Gradual change: comparative-and-comparative, get + comparative — *Bosqichma-bosqich oʻzgarish: better and better; get + comparative* | The POV literally opens present perfect — *"Since she was a child Jan has been rude — How long has Jan been rude?"* — grammar you're already hearing (the **intuitive** debut; the hard contrast waits for L22). Kaizen **is** incremental change: the MAIN says "better and better answers", the POV "nicer and nicer over two years." **✓** |
| **10 Reading Power** | Quantifiers & countability: much/many/a lot of; count vs uncount — *Miqdor va sanaladigan/sanalmaydigan otlar: much / many / a lot of* | Proportional "the more…, the more…" (correlative) — *Mutanosiblik: the more…, the more…* | Reading is measured in volume ("a lot of input, how many books, a little every day") — pain #10; and the reading-power thesis is verbatim "**the more** you read, **the more** you know" — an instant B2 range signal. **✓** |

### Phase 2 — *Sur'at* / Momentum · L11–20 · B1 → B2 · modals, futures, the present-perfect family taught formally

| L · AJ theme | Grammar A (EN — *UZ*) | Grammar B (EN — *UZ*) | Why it fits (theme / POV hook) · POV |
|---|---|---|---|
| **11 Unlimited** | Ability across time: can / could / be able to / manage to — *Qobiliyat: can / could / be able to* | Second conditional — unreal present — *Ikkinchi shart: agar … boʻlsa edi (faraz)* | "Unlimited potential" = what you **can/could/will be able to** do; imagining no limits **is** a hypothetical ("if you had unlimited time, what would you do?"). The biggest Part 3 band-lifter; ladder rung 2. **✓** |
| **12 Healthy at 100** | Obligation & prohibition: must / have to / mustn't / don't have to / need to — *Majburiyat va taqiq: must / have to / mustn't / don't have to* | Lifestyle phrasal verbs: give up, cut down on, take up, work out, get over — *Hayotiy frazaviy feʼllar: give up / cut down on / take up* | Health = rules ("you have to exercise, mustn't smoke, don't have to be perfect") and phrasals ("give up sugar, cut down on coffee"). Modality spiral + the phrasal/verb+prep pain point in a health cluster. **✓** |
| **13 Walden** | Comparatives of reduction: less / fewer / more simply / the least — *Kamayish darajasi: less / fewer / more simply* | Articles 2 — zero / generic article (abstract & uncountable: nature, simplicity, life) — *Artikllar 2: umumiy maʼnoda artiklsiz (nature, life)* | Walden = need **less**, own **fewer** things, live **more simply**, and speak in abstractions ("Simplicity is freedom, Nature teaches us" — all zero article). Fixes less/fewer; second spaced article pass. **✓** |
| **14 Superior Man** | Infinitive of purpose: to / in order to / so as to / so that — *Maqsad infinitivi: to / in order to / so that* | Future forms: will vs going to vs present continuous — *Kelasi zamon shakllari: will / going to / hozirgi davomiy* | Discipline & direction = doing everything **for** a reason ("train in order to grow") and stating your plans ("I'm going to…, I'll…"). A B2 coherence marker + the core future system. **✓** |
| **15 Taoism** *(EnglishPod = null)* | Modals of possibility: might / may / could (tentative, non-forcing) — *Ehtimollik: might / may / could (majburlamaslik)* | Passive voice 1 — is done / was done (agentless) — *Majhul nisbat 1: is done / was done* | Wu wei = allowing not forcing ("maybe it happens, you might just let it flow" — tentative possibility) and effortless agentless action ("things get done by themselves" — the passive removes the doer). Opens the passive thread (band-lifter, Uzbek-hard). **✓** |
| **16 Big Picture** | Future perfect & future continuous: will have done; will be doing — *Kelasi mukammal va davomiy: will have done; will be doing* | Future time clauses: when / as soon as / until / before + present — *Payt ergash gaplari: when / as soon as + hozirgi zamon* | Vision = looking back from the future ("by 2030 I will have reached B2; this time next year I'll be speaking freely") and sequencing long plans ("when I finish…, as soon as I'm fluent…"). Fixes the "will after when" error. **✓** |
| **17 Small is Beautiful** | Small quantities: a little/a few vs little/few; hardly any; only/just — *Kichik miqdorlar: a little/a few va little/few* | Degree & intensifier adverbs (softening): quite / fairly / rather / a bit — *Daraja ravishlari (yumshatish): quite / fairly / a bit* | "Small is beautiful" = **a little** every day beats a lot rarely (a subtle B1→B2 nuance) and the language of moderation ("quite good, fairly small") — which **seeds IELTS hedging**, a Fluency band-lifter. — |
| **18 Slow Burn** | Present perfect simple — the B1 gateway (so far / up to now / yet) — *Present perfect (sodda) — B1 boʻsagʻasi: so far / up to now / yet* | Adverbs of manner & degree for process: gradually / steadily / increasingly / little by little — *Jarayon ravishlari: gradually / steadily / increasingly* | Slow burn = what you **have achieved** up to now, **gradually**. Opens the formal present-perfect climb (Uzbek's #1 tense wall, pain #5), placed once stamina is high; process adverbs spiral L09's gradual-change for trend description. **✓** |
| **19 Leaders Make Mistakes** | Present perfect for experience: Have you ever…? / ever / never — *Tajriba: Have you ever…? / ever / never* | should have / could have (+ needn't have) + past participle — regret/hindsight — *should have / could have (+ needn't have) — afsus* | The hook **is** "Have you ever made a mistake?"; mistakes → "I should have tried; I needn't have worried." Present-perfect pass 2 + the first modal-perfect (a B2 band-lifter). *(POV text-only — reflection is a reading-driven speaking task.)* **T** |
| **20 Attractor Factor** | Present perfect + just / already / yet / still (+ recently/lately) — *Present perfect + just / already / yet / still* | First conditional extended: unless / as long as / provided that / in case — *Kengaytirilgan birinchi shart: unless / as long as / provided* | Attraction = the good things that **have just** started happening **lately** and the conditions that draw them ("unless you believe…, as long as you stay positive…"). Present-perfect pass 3; conditional-ladder spiral with precise connectors. **✓** |

### Phase 3 — *Ravonlik* / Fluency · L21–30 · B2 · perfect-vs-past climax, then the hardest structures

| L · AJ theme | Grammar A (EN — *UZ*) | Grammar B (EN — *UZ*) | Why it fits (theme / POV hook) · POV |
|---|---|---|---|
| **21 Healthy Heart** | for / since / how long + present perfect continuous — *for / since / how long + present perfect continuous* | Causative: have / get something done — *Kausativ: have / get something done (birovga qildirish)* | "**How long have you been** exercising?" = sustained heart-health habits; health = services ("get your heart **checked**, have your blood **tested**"). Present-perfect pass 4 (continuous); extends the passive into everyday causative. **✓** |
| **22 Art of Power** *(EnglishPod = null)* | Present perfect vs past simple — the hard contrast — *Present perfect va oddiy oʻtgan zamon farqi* | Passive voice 2 — full range (has been done / can be done / will be done; get-passive) — *Majhul nisbat 2: has been done / can be done / will be done* | Telling your life-of-power story needs finished-time (past) **and** unfinished-relevance (perfect) — the spiral's **climax**, Uzbek's hardest tense contrast (pain #5). Real power isn't seized, it **is cultivated / has been earned** (passive to B2). **✓** |
| **23 Excitement** | Questions, indirect questions & question tags (subject/object Qs; Can you tell me…?; …, don't you?) — *Savol tuzish, bilvosita savollar va soʻroq qoʻshimchasi* | Verb-pattern consolidation: love doing / want to do / look forward to -ing / gerund as subject — *Feʼl qoliplari: love doing / want to do / look forward to -ing* | Passion interviews you ("What excites you? You love this, don't you?") and is voiced through verb patterns ("I love learning, can't wait to speak, looking forward to this"). Word-order pain #8 + the gerund/infinitive capstone. **✓** |
| **24 Adventure** | Articles 3 — full a/an/the/zero consolidation (unique/known the, fixed phrases, generic) — *Artikllar 3: a/an, the, artiklsiz — toʻliq mustahkamlash* | Narrative tenses: past continuous + past perfect — *Hikoya zamonlari: past continuous va past perfect* | Travel makes articles concrete ("a trip, the airport, ø nature, the mountains") — the decisive strike on pain #1; adventures are STORIES ("I was travelling when… I'd never seen anything like it") — **THE** Part 2 storytelling band-lifter; past perfect at full B2 depth. **✓** |
| **25 Plateaus** | Third conditional — unreal past — *Uchinchi shart: agar … qilganimda edi (oʻtmish farazi)* | wish / if only — regret & unreal desire — *wish / if only — orzu va afsus* | A plateau invites past-regret analysis ("if I had practised more, I wouldn't have plateaued; I wish I could break through; if only I'd started sooner"). Ladder rung 3 (top B2 band-lifter), placed late after stamina builds. **✓** |
| **26 Search for Meaning** | Reported speech — statements & backshift (say/tell; here/now→there/then) — *Oʻzlashtirma gap: bayon va zamon siljishi (backshift)* | Reporting verbs & patterns: suggest / argue / claim / point out + that / -ing / obj+to — *Bayon feʼllari: suggest / argue / claim + qoliplar* | Reflecting on meaning = reporting the wisdom of thinkers ("Frankl **said that** we…, he **argued that**…"). A genuinely hard, Uzbek-alien, late structure; academic-register reporting for Part 3. **✓** |
| **27 Be a Champion** | Advanced comparatives & superlatives: by far / one of the most / the best … ever — *Qiyoslashning yuqori shakllari: by far / one of the most / the best … ever* | Modals of past deduction: must have / might have / can't have + done — *Oʻtmish xulosasi: must have / can't have + V3* | Champions are "**by far** the best, **one of the greatest**, the best I've **ever** done" and they analyse past performance ("I **must have** trained harder; she **can't have** given up"). Comparison capstone + extends L05 deduction into the past (modality spiral complete). **✓** |
| **28 No Failure** | Mixed conditionals — past condition → present result — *Aralash shart: oʻtmish sharti → hozirgi natija* | Cause, result & purpose connectors: because / so / therefore / as a result / in order to / so that — *Sabab, natija, maqsad bogʻlovchilari: so / therefore / in order to* | "No failure, only results" = past 'failure' produced present growth ("if I hadn't failed, I would be…") and pure cause→effect ("I failed, **so** I learned; **therefore** there's no failure"). Ladder summit + a Part 3 argument/coherence set. **✓** |
| **29 Break Rules** | Concession clauses: although / even though / though / despite / in spite of / whereas — *Zidlik ergash gaplari: although / even though / despite / whereas* | Inversion for emphasis: Never have I…; Not only… but also…; Little did I know — *Inversiya (urgʻu): Never have I…; Not only…* | Breaking rules = conceding a contrast ("**although** school taught grammar, you learn by listening") and literally breaking the SVO "rule" ("**Never have I** learned faster"). A marquee band-lifter (concession) + a B2+ range flourish; spirals L05's negative-idea framing. — |
| **30 Tribes** *(capstone)* | Relative clauses capstone — non-defining, reduced & review (…, who…, whose…; people learning together) — *Ergash gaplar yakuni: nodefining, qisqargan va takror* | Emphasis & fluency capstone — cleft (What…is…; It's…that…) + discourse markers & hedging (I'd say, on the whole, sort of) — *Urgʻu va ravonlik yakuni: cleft (What…/It's…that…) + nutq bogʻlovchilari* | A tribe = relationships ("the people **who** get me, my mentor, **who** believed in me") and real group talk ("**What** a tribe gives you **is** belonging; **it's** the people **who** keep you going; I'd say, on the whole…"). Relative-clause + Fluency & Coherence capstone; reviews the whole spine. **✓** |

**Spiral threads (each hard area is revisited, not one-and-done):**

| Thread | Passes (lesson) |
|---|---|
| **Articles** (pain #1) | L04 a/an vs the → L13 zero/generic → **L24 full consolidation** |
| **Present perfect** (pain #5) | L09 intuitive (POV) → L18 simple gateway → L19 experience → L20 just/already/yet → L21 for/since + continuous → **L22 vs past simple** |
| **Conditionals** (band-lifter) | L03 0/1st → L11 2nd → L20 1st-extended → L25 3rd → **L28 mixed** |
| **Modality** | L03 advice → L05 present deduction → L11 ability → L12 obligation → L15 possibility → L27 past deduction |
| **Passive** (band-lifter) | L15 intro → L21 causative → **L22 full range** |
| **Relative clauses** | L06 defining → **L30 non-defining/reduced + review** |
| **Comparison** | L06 basic → L09 gradual → L13 reduction → **L27 advanced** |
| **Gerund / infinitive** (pain) | L05 verb complements → **L23 consolidation** |
| **Prepositions** (pain #6, as chunks) | L02 dependent → L07 time/duration → L12 phrasal |
| **Quantity / countability** (pain #10) | L10 much/many → L17 (a) little/(a) few |
| **Reported speech** | **L26 statements + reporting verbs** |
| **Hedging / discourse** (band-lifter) | L17 degree adverbs → **L30 capstone** |
| **Questions & word order** (pain #8) | L01 adverb order → **L23 questions/tags** |

**Uzbek L1 pain-point coverage (the 10 clusters from `grammar-book.md`):** #1 articles ✓✓✓ (L04/13/24); #5 present-perfect/aspect ✓✓✓✓✓✓ (L09/18–22) + present-continuous-vs-simple (L02); #6 prepositions ✓✓✓ (L02/07/12); #10 plurals/countability ✓✓ (L10/17); #4 do-support at B1+ depth (L01 emphatic/negative, L23 questions); #8 word order (L01, L23). **Deliberately demoted to recurring "Xato tuzatish" micro-cards, not standalone topics** (they sit below the B1 floor for this audience but still leak into speech): #2 dropped copula, #3 third-person `-s`, #7 he/she/it gender, #9 have / have got. They are *spaced*, not *taught*.

**Optional "Extension" cards (documented, not in the core 60):** impersonal report structures (*it is said that…*), participle clauses, reflexive/emphatic pronouns, so/such + exclamations. They surface as optional cards and in a later B2 / IELTS-Writing pack.

---

## 5. Episode weave — one EnglishPod + one 6 Minute English inside every lesson

30 rows below. **All 28 EnglishPod episodes are used exactly once; L15 & L22 carry `englishPod: null`** (EnglishPod section hidden by data-presence gating — the two most abstract inner-power lessons have no everyday-dialogue analogue). All 30 6ME picks are **distinct and verified on disk**.

**EnglishPod path facts (verified on disk).** The transcript PDF is **always** `englishpod_B{ID}.pdf`. The mp3 prefix **varies**: exactly **9 episodes** carry the `B` prefix on mp3s — **0004, 0007, 0014, 0026, 0039, 0051, 0052, 0110, 0140** — the other 19 do not. Suffixes: `dg` (dialogue ~1 min), `pr` (program ~10 min), `rv` (review ~6 min). Nine folders keep a junk trailing `" u"` (URL-encode the space; map to the clean topic). Ignore `work u/0004`'s album-art jpgs. Store exact filenames per episode, or probe both `englishpod_B{ID}{suf}.mp3` and `englishpod_{ID}{suf}.mp3`.

**6ME path facts (verified on disk).** Key by `YYMMDD`; derive the slug from the PDF title line, not the filename; pair PDF+MP3 by **date prefix**, not exact stem. Exact stems below are for grounding, not hardcoding.

| L · AJ theme | EnglishPod (ID · title · folder · mp3 prefix) | 6 Minute English (date · exact mp3 stem) | Fit note |
|---|---|---|---|
| **01 Intro** | **0263** Global View – Nationalities · `people u` · no-B | **180315** `180315_6min_english_learn_a_language_download.mp3` | self-intro / a show literally *about learning a language* ★★ |
| **02 Emotional Mastery** | **0039** Daily Life – My New Boyfriend · `people u` · **B** | **170608** `170608_6min_happiness_download.mp3` | a flood of new feelings / cultivating a positive state |
| **03 Emotional Mastery 2** | **0197** Global View – Calling 911 · `work u` · no-B | **170831** `170831_6min_english_laughing_download.mp3` | staying calm under extreme pressure / an emotional-regulation technique |
| **04 Beliefs** | **0247** Interview Skills 5 – Discussing Reasons · `work u` · no-B | **170706** `170706_6min_english_self_help_download.mp3` | the reasons/beliefs behind your choices / beliefs about self-improvement |
| **05 Thought Mastery** | **0007** The Office – Virus! · `technology` · **B** | **170518** `170518_6min_english_attention_span_download.mp3` | stop the "virus" of negative thoughts / directing mental focus |
| **06 Models** | **0261** Daily Life – Describing Someone's Face · `people u` · no-B | **170629** `170629_6min_english_first_impressions_download.mp3` | describing a person you look up to / how we read others |
| **07 Repetition** | **0052** Daily Life – Pizza Delivery · `food u` · **B** | **190131** `190131_6min_english_memory_download.mp3` | a short everyday script to drill on repeat (shadowing) / repetition builds memory |
| **08 Identity** | **0195** Global View – Job Hunting · `work u` · no-B | **161006** `161006_6min_english_identity_download.mp3` | the professional self you present / literally *identity* ★ |
| **09 Kaizen** | **0026** Daily Life – New Year's Resolution · `food u` · **B** | **171123** `171123_6min_english_getting_fitter_download.mp3` | big resolution vs tiny daily steps / steady incremental gains ★ |
| **10 Reading Power** | **0140** Daily Life – Buying a Computer · `technology` · **B** | **160811** `160811_6min_english_writers_block_download.mp3` | a device for input / the reading-and-writing world |
| **11 Unlimited** | **0188** The Office – Asking For A Raise · `work u` · no-B | **180531** `180531_6_minute_english_risk_download.mp3` | pushing past a limit, asking for more / going beyond the safe limit ★ |
| **12 Healthy at 100** | **0200** Daily Life – Junk Food · `food u` · no-B | **170302** `170302_6min_english_life_expectancy_download.mp3` | diet & willpower / literally *living to 100* ★★ |
| **13 Walden** | **0176** Daily Life – Heating · `finance u` · no-B | **190411** `190411_6min_the_decluttering_trend_download.mp3` | simple living, home basics, using less / simplify & minimalism ★★ |
| **14 Superior Man** | **0110** Daily Life – Registering for University · `education u` · **B** | **170413** `170413_6min_english_multiple_careers_download.mp3` | committing to a disciplined path / purpose & direction in work ★ |
| **15 Taoism** | **— (null, gated off)** | **170420** `170420_6min_sighing_download.mp3` | effortless natural release — the body's own rhythm = wu wei (see gap note) |
| **16 Big Picture** | **0185** The Weekend – Farm Animals · `hometown u` · no-B | **160915** `160915_6min_english_climate_change_download.mp3` | *(loose theme — sound shadowing material)* / the ultimate long-term big picture |
| **17 Small is Beautiful** | **0051** The Weekend – What a Bargain! · `shopping` · **B** | **180322** `180322_6min_english_microadventures_download.mp3` | big value from something small/cheap / small adventures, big payoff ★★ |
| **18 Slow Burn** | **0244** Interview Skills 4 – Talking About Work Experience · `work u` · no-B | **171005** `171005_6min_english_adult_exercise_download.mp3` | a career/skill built gradually over years / steady incremental fitness ★ |
| **19 Leaders Make Mistakes** | **0253** Interview Skills 7 – Describing Weaknesses · `people u` · no-B | **170727** `170727_6min_english_honesty_download.mp3` | owning your flaws / honesty about your mistakes ★★ |
| **20 Attractor Factor** | **0240** Daily Life – Getting A Pet · `animals u` · no-B | **161020** `161020_6min_english_attraction_download.mp3` | welcoming a new positive presence you draw in / literally *attraction* ★ |
| **21 Healthy Heart** | **0004** The Office – I need an assistant! · `work u` · **B** | **160818** `160818_6min_english_food_exercise_download.mp3` | overwork & stress on the heart (get help, don't burn out) / diet+exercise for the heart ★ |
| **22 Art of Power** | **— (null, gated off)** | **170615** `170615_6min_english_mindfulness_download.mp3` | Thich Nhat Hanh's mindful power = literally *mindfulness* (see gap note) ★★ |
| **23 Excitement** | **0154** The Weekend – Rock Band · `music` · no-B | **180621** `180621_6min_english_gaming_download.mp3` | passion for music / high-energy leisure passion ★ |
| **24 Adventure** | **0228** The Weekend – Going to the Beach · `weather u` · no-B | **180830** `180830_6min_english_street_food_download.mp3` | a getaway / trying bold new things while travelling ★★ |
| **25 Plateaus** | **0203** Daily Life – Calling Tech Support · `technology` · no-B | **180726** `180726_6min_english_not_going_out_download.mp3` | frustration & persistence when stuck / being in a rut ★ |
| **26 Search for Meaning** | **0241** Interview Skills 3 – Education Background · `education u` · no-B | **181108** `181108_6min_english_loneliness_download.mp3` | your formative journey / the existential search for connection & meaning |
| **27 Be a Champion** | **0250** Interview Skills 6 – Describing Strengths · `people u` · no-B | **180614** `180614_6_min_english_world_cup_download.mp3` | know your strengths, go for the win / champions & the World Cup ★★ |
| **28 No Failure** | **0014** Daily Life – I'm in Debt · `economy u` · **B** | **170622** `170622_6min_english_built_to_fail_download.mp3` | a setback reframed as a solvable result / literally *built to fail* ★★ |
| **29 Break Rules** | **0259** Interview Skills 9 – Asking About the Position · `work u` · no-B | **160901** `160901_6min_english_slang_download.mp3` | the candidate flips the script & asks / slang breaks "proper" language rules ★★ |
| **30 Tribes** | **0350** Daily Life – Talking About Relatives · `people u` · no-B | **170126** `170126_6min_english_family_history_download.mp3` | family = your first tribe / roots & belonging (capstone) ★★ |

**EnglishPod gap resolution — honest, by data-presence gating.** EnglishPod's 28 dialogues are all everyday/transactional/workplace. AJ's two most interior/contemplative lessons — **L15 Taoism** (wu wei) and **L22 Art of Power** (Thich Nhat Hanh's mindfulness) — have no everyday-dialogue analogue; forcing one in would break the tone. So they get **`englishPod: null`** and the UI **gates the EnglishPod section off** (same mechanism that already gates POV on L01–08). Both null weeks are carried by the **strongest-fit 6ME in the whole weave** (*sighing* → L15, *mindfulness* → L22), their two grammar topics, and the full AJ set. The weakest thematic EnglishPod fits (0052 Pizza→L07, 0185 Farm Animals→L16, 0240 Pet→L20) are placed as **pedagogically sound shadowing/role-play material** even where the theme link is loose, and flagged above. The six **Interview Skills** episodes (0241/0244/0247/0250/0253/0259) cluster into the self-presentation lessons (L04/L18/L19/L26/L27/L29), climaxing at the L30 capstone — the IELTS-interview bridge.

**Reserves (verified on disk; promote if a pick underperforms).** 6ME: `160825 domestic_chores`, `170316 lunch`, `171116 coffee`, `171026 sugar`, `170105 driving`, `170928 computers`, `180426 internet`, `170907 uniforms`, `170525 veganism`, `181011 plastic_addiction`, `180712 smartphone_addiction`, `190124 happiness`, `170914 cultural_differences`. (No EnglishPod reserves remain — all 28 are in play.)

---

## 6. Study Methodology page — content outline

**Language: Uzbek-primary** (this page is meta-instruction — a lone learner must understand it completely, or the whole method fails), with English key terms in parentheses and a full English mirror behind the UZ/EN toggle. Sections:

1. **Bu kurs qanday ishlaydi / How this course works** — the Effortless English idea in plain Uzbek: *koʻp tinglash* (deep listening), *hissiyot bilan* (with emotion), *ovoz chiqarib javob berish* (answering aloud), *takrorlash* (repetition). The promise: *"You will learn to SPEAK, not to pass grammar tests."* Set expectations: **one whole lesson lives with you for a week**; slow, deep, and it works.
2. **The 7 rules** — one card each, bilingual, one line of "why."
3. **Oltin qoida: har kuni OVOZ CHIQARIB gapiring / The golden rule: speak aloud every day** — plain-Uzbek SLA explainer: comprehensible input + retrieval practice = automatic speech. Contrast with school grammar-testing (which they tried, and it failed). IELTS scores Fluency and Pronunciation — the two things you cannot pass by silent study.
4. **Kunlik odat / The daily habit (30–45 min)** — the suggested 7-day rhythm (§2) as a checklist; a sample peak-state day (stand, smile, move → listen → answer aloud → shadow). **Faol vaqt vs passiv vaqt**: download the MAIN, listen while commuting/cooking — this multiplies your hours without touching the 45-min active budget. Listening minutes are the #1 metric.
5. **Sur'atni tanlang / Choose your pace** — Effortless / Sprint / Gentle (§2) with honest trade-offs and a **backward-planning-from-exam-date** table. *"Sekin, lekin har kuni"* (slow but daily) beats *"tez, lekin tashlab ketish"* (fast but quitting). Rule: never advance until the mini-story is automatic.
6. **Yolgʻiz gapirish mashqlari / Speaking techniques you can do ALONE** (the heart of the page — no partner needed):
   - **Answering mini-story questions aloud** — the #1 technique; shout the answer before the reveal, even one word. Speed > perfection.
   - **Shadowing (soya qilish)** — play audio, speak ~0.5 s behind, copy the *melody*; use EnglishPod `dg` and AJ Hoge MAIN.
   - **Self-recording (oʻzingni yozib ol)** — record → play back → compare to the model → note one fix → repeat. **Keep your Lesson-1 recording and re-record it at Lesson 30 to *hear* your progress.** Browser mic only, nothing uploaded.
   - **POV retelling** — retell the story yourself in past, then future.
   - **Role-play** — read Role A then Role B of the week's EnglishPod dialogue aloud.
   - **Self-talk / narration** — narrate your day using the week's two grammar topics.
7. **Chuqur tinglash / Deep listening** — listen many times *before* reading; use the transcript on later passes; never translate word-by-word; tolerate ambiguity. The 6ME `INSERT` clips are the hardest, best stretch.
8. **Kuchli holat / Peak state** — stand, move, smile, big voice; emotion locks in memory (AJ's L01 theme; ~80% of success is psychology).
9. **Soʻz boyligi / How to learn vocabulary** — learn **chunks**, use the Uzbek gloss once, then drop it and think in English examples.
10. **Talaffuzni oʻzingiz tekshirish / Pronunciation self-check** — record + compare; drill the sounds Uzbek speakers miss: /v/–/w/, /θ/–/s/ (*think/sink*), final voiced consonants, vowel length, and **word stress**.
11. **Oʻzbek oʻquvchilarning eng koʻp xatolari / Top mistakes for Uzbek speakers** — the **10 L1-interference clusters** and **which lesson (or spaced error-fix card) fixes each** (links into the grammar syllabus §4). Notes honestly that four of them (dropped copula, third-person `-s`, he/she/it gender, have/have got) are below this course's B1 grammar floor and are handled as **spaced "Xato tuzatish" micro-cards**, not standalone topics.
12. **Adashsangiz nima qilish kerak / What to do when you struggle** — plateaus are normal (ties to L25): re-listen to an old lesson; it'll feel easy — proof you improved. "Don't break the chain"; use your weekly freeze if life happens.
13. **FAQ** — bilingual, honest: *Do I really study one lesson a whole week? Why not translate everything? Do I need a partner? Is this enough for IELTS? When am I ready for a mock test?*

---

## 7. IELTS / CEFR alignment

**Honest framing (bilingual, stated up front):** this curriculum builds the *underlying spoken competence* for A2→B2. It is **not** an IELTS cram course. What we build is the fluency, vocabulary, grammar, and listening that IELTS then *measures*. At B1+ a learner adds task-specific practice (timing, band descriptors, full timed mocks, Writing/Reading) — a short **"Test-Day Skills"** page is recommended later, and the **Interview Skills dialogues woven through L27–L30** are the bridge to a paid/official mock. The **grammar spine specifically runs B1 → B2** (the A2 grammar floor was dropped for this audience); the phase → CEFR → IELTS map below still holds because *listening* competence legitimately starts at A2 even as *grammatical range* starts at B1.

### Phase → CEFR → IELTS map

| Phase | CEFR | Rough IELTS | Speaking built | Listening built |
|---|---|---|---|---|
| **1 — Poydevor** · L01–10 | **A2 → B1** | 3.5–4.5 | **Part 1 foundations**: self, family, routine, food, study (present/past aspect sharpened); no-hesitation short answers | **Section 1**: everyday social/transactional (EnglishPod dialogues, in-lesson) |
| **2 — Sur'at** · L11–20 | **B1** | 4.5–5.5 | Extended **Part 1** + entry to **Part 2**: narrate the past, state plans, give advice, talk about experiences | **Section 2**: monologue on everyday topics (EnglishPod programs + 6ME, in-lesson) |
| **3 — Ravonlik** · L21–30 | **B1 → B2** | 5.5–6.5 | Full **Part 2** long turn + **Part 3** discussion: range & accuracy (articles, conditionals, relative clauses, reported speech, cleft); **Interview-Skills mock bridge** | **Sections 3–4**: multi-speaker + academic monologue, fast/varied accents (6ME `INSERT` clips) |

### IELTS Speaking criterion → course feature (the outcome map)

| Band criterion | Where it is built |
|---|---|
| **Fluency & Coherence** | Mini-story **answer-aloud** (automaticity) → connectors **L21/L28**, concession **L29**, discourse markers + hedging **L17/L30** → self-recorded 60-sec talks |
| **Lexical Resource** | VOCAB glossaries + EnglishPod Key Vocab + 6ME 6-word packs, all as **chunks + Uzbek gloss**; phrasal verbs **L12**, dependent prepositions **L02**, reporting verbs **L26** |
| **Grammatical Range & Accuracy** | The **original B1→B2 grammar spine (two topics per lesson)** → **POV** intuition → "say a true sentence about yourself" drills: narrative tenses **L24**, conditional ladder **L03/11/25/28**, passive **L15/22**, relatives **L06/30**, cleft/inversion **L27/29** (range); articles **L04/13/24**, present-perfect-vs-past **L22** (accuracy) |
| **Pronunciation** | **Shadowing** (EnglishPod `dg` + AJ Hoge MAIN) + role-play + Rachel's-English-style Fun English + minimal-pair self-check (§6.10) |

**Listening mapping.** EnglishPod dialogues ≈ **Section 1** (transactional); EnglishPod programs + scripted 6ME ≈ **Section 2/3**; 6ME **`INSERT`** vox-pops ≈ authentic **Section 4** speed/accents; the 6ME built-in MCQ trains listening-for-a-specific-answer. Phase 3 adds transcript-hidden, exam-paced full listens.

**CEFR badges** unlock at each phase boundary (A2 ✓ → B1 ✓ → B2 in progress) so learners *see* themselves climb the exam ladder.

---

## 8. Progress & completion model (localStorage + IndexedDB, no accounts)

**Philosophy:** reward *volume and reps*, not speed. Headline dashboard numbers are **total listening minutes** and **total speaking reps**; completion % is secondary.

### 8.1 What "complete" means — stars, with a mandatory speaking gate

A lesson earns **stars** (achievable *and* replayable). The mini-story spoken rep is a **hard gate** — no star without it. EnglishPod and 6ME are **no longer separate lessons**; they are steps *inside* the same lesson, rewarded at higher star tiers.

- **⭐ 1★ — Complete** (the honest minimum; advances the course): **Grammar A + Grammar B** reviewed + Vocabulary reviewed + **MAIN listened ×3** + **Mini-Story answered aloud ×2** *(required gate; self-attested)* + POV ×2 *(only if present, L09–30)*.
- **⭐⭐ 2★ — Strong:** + **EnglishPod done** (`dg` heard + Key Vocab reviewed + shadowed + one role played) *(auto-satisfied on L15/L22, where EnglishPod is null — the Day-5 fallback of extra shadowing + a 2nd 6ME pass counts)* + Fun English watched + **one Speak-It recording saved**.
- **⭐⭐⭐ 3★ — Mastered** (gold): + **6 Minute English done** (listened ×1 + quiz answered + 6-word pack reviewed + 60-sec response recorded).

Speaking steps are **honor-system** (*"Men ovoz chiqarib gapirdim ✓"*) — framed as a promise to yourself; no backend can or should verify.

> **S5 implementation note (as shipped).** The per-lesson 3★ tier is **2★ + `sixmin`** — it does **not** gate on a *second* recording. The **Lesson-1-vs-Lesson-30 "record again" growth-proof comparison** (§6, §8.4) is a **Progress-page surface built in S6**, driven by `metrics.recordings` across two different lessons — not a requirement to master a single lesson (a learner must be able to reach 3★ on any one lesson without having reached L30). EnglishPod's `ep` step **auto-satisfies** where `englishPod:null` (L15/L22). The mandatory mini-story-aloud gate (×2) is enforced in the Lesson-Check "earn ★" button before any star is awarded.

### 8.2 Storage (technically correct split)

- **Self-recordings are audio blobs → IndexedDB.** localStorage's ~5 MB cap cannot hold audio.
- **localStorage holds only lightweight flags/counts/dates** (progress, streak, badges, settings).
- **Export / Import JSON** button, surfaced prominently (+ copy-to-clipboard backup) — the only safe way to move devices or survive a cache-clear without accounts.
- Everything **degrades gracefully**: if storage is unavailable, lessons still play; only tracking pauses.

**The canonical `ess.progress.v1` schema (every field, with types + which UI reads it) lives in `03 §6.3` and is authoritative** — the excerpt below is illustrative and defers to it. There is now **one `lessons` map keyed by the real lesson id** (`core-09`, …); the old separate `supp-pod-*` / `supp-6min-*` entries are **removed** — EnglishPod and 6ME are sub-steps of their weekly lesson. *(Both amendments have since been applied: `03 §6.3` now carries the new `steps` set (`grammarA`/`grammarB`, `ep`/`sixmin`, `fun`/`record`) with the `supp-*` ids dropped — matching the `steps`/`listens` shape below — and `data/lessons/core-09.json` has been rebuilt to the v2 `grammar[]` (present-perfect + gradual-change) with folded-in `englishpod`/`sixmin` as the design-review exemplar; the retired `was/were` block + Murphy-unit reference are gone.)*

```jsonc
// Illustrative excerpt — full field list + comments in 03 §6.3 (authoritative):
{
  "schemaVersion": 1,
  "startedAt": "2026-07-17",
  "settings":  { "uiLang": "uz", "pace": "effortless", "rate": 1.0, "theme": "auto" },
  "lastLessonId": "core-09",
  "metrics":  { "listeningMinutes": 0, "speakingReps": 0, "recordings": 0, "xp": 0 },
  "streak":   { "count": 12, "longest": 20, "lastActiveDate": "2026-07-17", "freezesLeftThisWeek": 1 },
  "weeklyGoal": { "target": 5, "activeDaysThisWeek": 3 },
  "badges":   ["first-step", "streak-7", "a2-foundation"],
  "ieltsTopics": { "family": 1, "food": 2 },     // fills the coverage grid
  "lessons": {                                    // one map, keyed by the real lesson id
    "core-09": {
      "status": "complete",                       // none | inProgress | complete | mastered
      "stars": 1,                                 // the 1★/2★/3★ tier (§8.1)
      "steps": {
        "grammarA": true, "grammarB": true,       // the two original topics
        "vocab": true, "main": true,
        "ministory": true,                        // ministory = the mandatory speaking GATE
        "pov": false,                             // only if present (L09–30)
        "ep": false, "sixmin": false,             // EnglishPod / 6ME — in-lesson (ep auto-true on L15/L22)
        "fun": false, "record": false
      },
      "listens": { "main": 3, "ms": 2, "pov": 0, "ep": 0, "sixmin": 0 },
      "msAnswersAloud": 45,
      "completedAt": 1752710400000, "reviewDue": "2026-07-20"   // 1-3-7-14 spacing
    }
  }
}
```
*(Audio blobs live in IndexedDB, keyed by lesson id; localStorage stores only the `steps.record` flag and the `metrics.recordings` count.)*

> **S6 (as shipped) — export/import.** Export writes pretty JSON of the normalized `ess.progress.v1` (download + copy-to-clipboard with a textarea fallback). Import is **strict and read-only until confirmed**: `previewImport(text)` validates and returns a **before-vs-incoming diff-preview** (lessons completed / total stars / listening minutes / streak) without writing; only `applyImport(text)` writes, and only a validated+migrated object. Refusals carry a **clear bilingual reason** — `badVersion` (schemaVersion ≠ 1), `badJson` (unparseable), `invalid` (non-object/array) — and a refused import **never corrupts current data** (matches the S6 *"a mis-versioned import is refused without corrupting current data"* done-when). **Reset** preserves settings (uiLang/theme/pace/rate) and also clears the IndexedDB recordings store.

### 8.3 Streaks, goals, badges (dopamine, tuned not to punish real life)

- **A "study day"** = any real action today — any mini-story answered aloud, any recording saved, any lesson completed, or a completed listen / at least a minute of listening. Deliberately achievable (tuned not to punish real life, not a ≥5-min threshold).
- **Speaking streak** ⭐ = *recorded or answered aloud today* — the headline habit.
- **Streak freeze:** 1 free skip-day per week, auto-applied. **Weekly goal:** a forgiving "5 active days this week" ring (not all 7).
- **Spaced review:** completing a lesson schedules `reviewDue` at +1/+3/+7/+14 days; the home screen surfaces "Review today" cards.
- **Gentle re-engagement (frontend-only):** a localStorage-driven *"Bugun hali oʻqimadingiz / You haven't studied today"* banner; optional Notification API + "Add to Home Screen". A **"Comeback"** badge (never a guilt message) greets returns after a break.
- **XP:** every checked step adds points — cheap, constant positive feedback with no backend.

| Badge (UZ / EN) | Trigger |
|---|---|
| Birinchi qadam / First Step | complete Lesson 01 |
| Olov / On Fire · Toʻxtovsiz / Unstoppable | 7 / 30 / 100-day streak |
| Tinglovchi / Deep Listener | 100 / 500 / 1000 total listening minutes |
| Notiq / Speaker | 100 mini-story answers spoken |
| Ovoz / Voice | 10 recordings saved |
| Grammatika ustasi / Grammar Guru | 20 grammar drill sets (across the 60 topics) |
| Suhbatdosh / Conversationalist | 15 EnglishPod dialogues shadowed + role-played |
| Poydevor / A2 Foundation | finish Phase 1 (L10) + CEFR A2 badge |
| Sur'at / B1 Momentum | finish Phase 2 (L20) + CEFR B1 badge |
| Ravonlik / B2 Fluency | finish Phase 3 (L30) + CEFR B2-in-progress + printable "30 Lessons" certificate |
| Comeback | return after a 7+ day gap (kindness, not punishment) |

**Visualizations:** a phase "path" (Poydevor → Sur'at → Ravonlik), phase progress bars, a **listening-minutes counter as the hero number**, a speaking-reps tally, a streak calendar, and an **IELTS-topic coverage grid** (~20 Part 1/2 topics fill as practised).

> **S6 (as shipped) — badge triggers, by id.** `first-step` (any lesson ≥1★); `streak-7`/`streak-30`/`streak-100` (gate on best-ever run = `max(count, longest)`); `deep-listener-100`/`-500`/`-1000` (listening minutes); `speaker` (≥100 `speakingReps`); `voice` (≥10 recordings); `grammar-guru` (**≥20 grammar drill *sets*** — each completed grammar topic = 1 set, counted from `steps.grammarA`/`grammarB`, i.e. 2 per fully-completed lesson); `conversationalist` (≥15 lessons with `steps.ep`); `a2-foundation`/`b1-momentum`/`b2-fluency` (awarded on the Progress page when a phase's **authored** lessons are all complete — index-aware `awardPhaseBadges`); `comeback` (≥7-day gap detected in `registerStudyDay`). Count-based badges are **derived from the union object** (no drift-prone counters); phase/CEFR badges are index-aware. **Badges never un-earn.** Earning any dispatches a shell `"yp:badge"` toast (04 §6).

### 8.4 Engagement cheat-sheet (why a lone learner stays)

| Risk of quitting | Mechanic that fights it |
|---|---|
| "It feels like no progress" | Daily checkbox + streak + XP + stars + CEFR badges; re-record L1 audio at L30 to *hear* growth |
| "It's boring / repetitive" | Same lesson all week, activity rotates daily; EnglishPod + 6ME add fresh voices; varied Fun English |
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
| **Grammar Spark** explanations (both topics) + L1 contrast + error-fix cards | **Uzbek** (English examples) | fastest comprehension; contrastive with Uzbek structure |
| **Vocabulary** glossary | **English chunk + Uzbek gloss + English example** | phrase acquisition with L1 support |
| MAIN / POV "what it's about" summary | **Bilingual, 2 lines** | orientation only |
| **MAIN, MINI_STORY, POV transcripts** | **English only** | immersion; the input to be acquired |
| **Mini-story Q&A drill** (the drill itself) | **English only** (bilingual instructions; optional Uzbek hint on hard items) | speaking must happen in English |
| EnglishPod / 6ME dialogue & transcript | **English only** (Key Vocab / 6-word pack get **Uzbek gloss**) | authentic input |
| Fun English videos | **English** (Uzbek framing note + watch-task) | real listening |
| Instructions / study tips / "how to do this step" | **Uzbek** | a lone learner must never get stuck |
| Common-mistake warnings (10 L1 clusters) | **Uzbek** | targeted L1 remediation |
| **Study Methodology page** | **Uzbek-primary** (English mirror via toggle) | critical instructions |
| IELTS/CEFR page | **Bilingual** | expectations & guidance |
| Progress, badges, streak messages | **Bilingual labels** | motivation must land |
| Comprehension-check *answer options* | **English** (question stems may be bilingual) | tests English, not translation |

---

## 10. Content & build notes (feasibility — carried from the inventories)

**Authoring one weekly lesson now requires (per lesson):**
- **One AJ Hoge set**, extracted to structured JSON exactly as `core-09` already is: MAIN transcript (boilerplate stripped), VOCAB glossary + Uzbek gloss, MINI_STORY split into `{prompt, answer}` pairs (the highest-value feature), POV transcript (L09–30). The AJ set is **never divided** — it is one asset group.
- **Two original Grammar Spark cards** (`grammarA`, `grammarB`) from §4: short Uzbek prose with explicit L1 contrast, 2–3 drills each ending in a "say a true sentence" aloud prompt, a "Xato tuzatish" trap card, and a band-lifter/can-do tag. **Author our own prose** — do not embed Murphy pages; offer *Essential Grammar in Use* only as an optional download.
- **One EnglishPod episode** (from §5): `dg`/`pr`/`rv` audio + PDF transcript, Key Vocabulary given an added **Uzbek gloss**. `englishPod: null` for L15 & L22 (section gated off).
- **One 6ME episode** (from §5): audio + PDF, the built-in MCQ, the 6 target words given an added **Uzbek gloss**.
- **Fun English** theme + suggested free channel (owner picks the exact video; **never hardcode a video ID** — they die).

**Global ingestion rules:**
- **Glob by pattern, never hardcode filenames.** AJ Hoge audio: `1_`=MAIN, `2_`=VOCAB, `3_`=MINI_STORY, `4_`=POV; PDFs by keyword (MAIN/VOCAB/MS/MINI/POV). Naming is irregular: missing `_MAIN` suffix (05, 07, 08, 19, 20), double extensions (`11`, `24`, `27` = `.mp3.mp3`), case drift (`18` = `MINI_Story`), per-lesson text folders (`03` = "Emotional Master 2 Text"), ALL-CAPS PDF regime for 19–30, `23` typo "Exitement MAIN.pdf".
- **Gate on presence:** POV hidden for 01–08, text-only (optional TTS) for 19; **EnglishPod hidden for 15 & 22** (`englishPod: null`) — same gating mechanism.
- **Host all media off-repo** (Cloudflare R2 free tier or similar) — stream + offer download. **Exclude ~400 MB junk**: the two Kaizen audiobooks, the 4-Hour Work Week mp3 (221 MB), copyrighted book PDFs, `.dat`/`.DS_Store`/album-art.
- **Grammar book is copyrighted** — author our own Uzbek prose; offer the Murphy PDF only as an optional download; reuse App 2/3 (irregular verbs) and App 5 (spelling) as interactive reference cards.
- **EnglishPod path quirks (verified on disk):** the transcript PDF is **always** `englishpod_B{ID}.pdf`; the mp3 `B` prefix is present on **only 9 episodes** — **0004, 0007, 0014, 0026, 0039, 0051, 0052, 0110, 0140** — and absent on the other 19. Store exact filenames per episode, or probe both `englishpod_B{ID}{suf}.mp3` and `englishpod_{ID}{suf}.mp3`. Strip the trailing `" u"` from 9 folder names (URL-encode the space). Ignore `work u/0004`'s album-art jpgs.
- **6ME quirks (verified on disk):** key by `YYMMDD`; derive the slug from the PDF title line, not the filename; pair PDF+MP3 by **date prefix**, not exact stem. Confirmed for picks in §5: `180315` mp3 `learn_a_language` vs pdf `learning_a_language`; `170302` pdf has a literal **space** (`...life expectancy.pdf`); `190411` slug drops "english" (`6min_the_decluttering_trend`); `180322` pdf uses `6min_eng_microadventures` **and ships a ` (1)` duplicate — dedupe on ingest**; `180830` pdf `6min_street_food` (drops "english"); `180614` mp3 `6_min_english_world_cup`; `180531` uses full `6_minute_english_risk`; `170420` `6min_sighing` and `170608` `6min_happiness` drop "english". **Dedupe** the three ` (1)` duplicates (`161215`, `180322`, `181220`).

---

### One-line summary
A **30-week spoken-first spine** — one *whole* AJ Hoge lesson per week (MAIN + VOCAB + MINI_STORY + POV, never divided) wrapped with **two original B1→B2 grammar topics**, **one EnglishPod dialogue**, and **one 6 Minute English episode** as in-lesson sections — engineered around one behaviour (*answer out loud, fast*), building a spiralled original grammar spine (present-perfect debuting in the L09 POV and climaxing at L22; articles L04→13→24; the conditional ladder L03→11→25→28) that maps to IELTS band-lifters and CEFR can-dos, measured by listening minutes and speaking reps inside a forgiving star/streak system, and aligned honestly to CEFR A2→B2 / IELTS Speaking Parts 1–3 and Listening Sections 1–4.


