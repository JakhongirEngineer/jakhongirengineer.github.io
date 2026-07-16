# 01 — Content Inventory (Index)

Short index of the raw content library that the course is built from. All figures are **measured** (Bash `find`/`du`, `ffprobe`, `pdftotext` on samples), not estimated. The source tree at `content/` is **READ-ONLY** — nothing under it is ever modified; the build pipeline only reads and copies it (see [03-architecture.md](03-architecture.md) §5).

Each section below is a one-paragraph summary + a stats table; the linked file carries the full per-item detail, filename quirks, and build recommendations.

**Library at a glance**

| Area | Files (website-needed) | Payload | Role in the course | Detail |
|---|---|---|---|---|
| AJ Hoge Power English | 111 mp3 + 112 pdf | ~940 MB | **Core spine** (30 lessons) | [inventory/aj-hoge.md](inventory/aj-hoge.md) |
| EnglishPod | 84 mp3 + 28 pdf | ~487 MB | Supplementary — speaking half | [inventory/englishpod.md](inventory/englishpod.md) |
| 6 Minute English | ~30–143 mp3+pdf pairs | ~250 MB–1.5 GB | Supplementary — listening/IELTS half | [inventory/6-minute-english.md](inventory/6-minute-english.md) |
| Essential Grammar in Use | 1 pdf | ~15.5 MB | Grammar reference (download only) | [inventory/grammar-book.md](inventory/grammar-book.md) |
| **Curated total** | — | **≈ 1.7 GB** | fits R2's 10 GB free tier | — |
| **Everything** | — | **≈ 2.9 GB** | also fits (~400 MB junk excluded) | — |

Both the curated and full payloads fit inside the primary host's free tier, so curation is a **pedagogical** choice, not a cost one (see [03-architecture.md](03-architecture.md) §2.1).

---

## AJ Hoge — Power English → [inventory/aj-hoge.md](inventory/aj-hoge.md)

The **core of the course**: 30 lessons under `content/AJ_Hoge_Power_English/`, one lesson per folder (`01_Intro … 30_Tribes`), each a set of 3–4 audio tracks with matching PDF transcripts — **MAIN** (motivational talk), **VOCAB** (word explanations), **MINI_STORY** (the ask-and-answer speaking driver), and **POV** (same story retold in other tenses, lessons 09–30 only; 19 is text-only). All PDFs carry a clean, selectable text layer (no OCR), so transcripts double as read-along captions after the copyright/logo boilerplate is stripped. Naming is *mostly* regular but has real irregularities (missing `_MAIN`/`_VOCAB` suffixes, `.mp3.mp3` double extensions, case drift, per-lesson text-folder names, two PDF naming regimes) — so any ingestion must **glob by numeric prefix / keyword, never hardcode filenames**. Roughly ~400 MB of junk (two full audiobooks, copyrighted book PDFs, `.dat`/`.DS_Store`/album-art) is excluded.

| Metric | Value |
|---|---|
| Lesson folders | 30 |
| Needed audio (mp3) | 111 (30 MAIN + 30 VOCAB + 30 MINI_STORY + 21 POV) |
| Needed transcripts (pdf) | 112 (30 MAIN + 30 VOCAB + 30 MS + 22 POV) |
| POV asymmetry | 21 POV audio vs 22 POV pdf (L19 text-only; L01–08 have none) |
| Total audio duration | ~22.4 hours (1,347 min) |
| Website payload | ~940 MB (on disk incl. junk: 1.4 GB) |

## EnglishPod → [inventory/englishpod.md](inventory/englishpod.md)

The **speaking-focused supplementary half**: 28 self-contained episodes under `content/listening/`, grouped into 12 topic folders. Each episode has 1 PDF (dialogue + Key Vocabulary + Supplementary Vocabulary) and 3 mp3s — `dg` (short ~1-min dialogue, ideal for shadowing/role-play), `pr` (~10-min hosted explanation), and `rv` (~6-min review). Level is A2–B1 with authentic conversational register; vocabulary is defined in plain English only, so **Uzbek glosses must be added by us**. Two path quirks must be handled: 9 of 12 folder names carry a junk trailing `" u"` (map raw dir → clean topic; URL-encode the space), and the `B` prefix is on **all PDFs** but only **10 of 28 folders' mp3s** — so probe both `englishpod_B{ID}{suf}.mp3` and `englishpod_{ID}{suf}.mp3`. The *Interview Skills 3–9* arc (work/education episodes) maps ~1:1 onto IELTS Speaking and powers the curriculum's mock-interview climax.

| Metric | Value |
|---|---|
| Topic folders / episodes | 12 / 28 |
| Files | 84 mp3 (28× dg/pr/rv) + 28 pdf |
| Total size | 487 MB |
| Level | CEFR A2–B1 |
| Publisher | EnglishPod / Praxis Language Ltd. (© 2008) |
| Key quirks | trailing `" u"` folder junk; `B`-prefix on mp3s in only 10/28 folders |

## 6 Minute English → [inventory/6-minute-english.md](inventory/6-minute-english.md)

The **listening/IELTS-oriented supplementary half**: BBC Learning English episodes under `content/6_minute_english/`, each a ~6-min mp3 + a 4–5 page PDF transcript with a highly consistent, cleanly extractable layout (two-presenter scripted dialogue, a ready-made 3-option quiz with the answer revealed near the end, 6 target vocabulary items, and `INSERT` vox-pop clips of authentic accents — the closest free analogue to real IELTS Section 4 audio). Level is B1–B2, harder than the A2 core, so these slot in later and as Day-7 rewards. The `YYMMDD` filename prefix is a 100%-reliable primary key; the middle segment is inconsistent (series-token variants, typos, dropped `english`), so derive the topic slug from the PDF's page-1 title and pair PDF+MP3 by date prefix, not exact stem. The inventory tags ~20 "Yes" core picks (concrete, IELTS Part 1/2 topics) plus reserves and flags abstract episodes to avoid.

| Metric | Value |
|---|---|
| Files | 146 pdf + 146 mp3 |
| Unique episodes | 143 (3 ` (1)` duplicates deduped: 161215, 180322, 181220) |
| Date range | 2016-07-28 → 2019-04-25 |
| Level | CEFR B1–B2 |
| Curriculum use | ~20 "Yes" core picks; ~30 curated (~250 MB) or all 143 (~1.5 GB) both fit R2 |
| Key quirk | key by `YYMMDD`; slug from PDF title, not filename |

## Essential Grammar in Use → [inventory/grammar-book.md](inventory/grammar-book.md)

The **grammar reference source**: Raymond Murphy's *Essential Grammar in Use* (2nd ed., "with answers", Cambridge University Press), a single ~15.5 MB, ~300-page PDF at `content/grammar_book/`. 114 self-contained units organized by grammatical category, not difficulty — the author explicitly invites re-sequencing, which the curriculum does (units re-ordered by *spoken frequency* into ~40 priority units across 6 tiers, one focus per core lesson). It is **copyrighted**: pages are **not** reproduced on the site — we author our own original Uzbek-explained grammar prose and exercises, offer the whole PDF only as an optional download, and reuse just the appendices (irregular verbs, spelling rules) as interactive reference tables. The inventory also documents the **10 L1-interference error clusters** for Uzbek speakers (articles, dropped copula, 3rd-person -s, do-support, present perfect, prepositions, he/she/it gender, SOV word order, have got, plurals/countability) that the Uzbek Grammar Spark sections target explicitly.

| Metric | Value |
|---|---|
| File | 1 pdf, ~15.5 MB, ~300 pages |
| Units | 114 (re-sequenced to ~40 priority units, 6 tiers) |
| Level | Elementary (A1-late → A2, into low B1) |
| On-site use | original Uzbek prose only; PDF = optional download; appendices → reference tables |
| Copyright | Cambridge University Press — never reproduce pages verbatim |
