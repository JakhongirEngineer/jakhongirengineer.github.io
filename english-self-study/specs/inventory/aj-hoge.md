# AJ Hoge — Power English: Content Inventory

Source: `content/AJ_Hoge_Power_English/` (READ-ONLY). This is the **core** of the course: 30 lessons, one lesson per folder, using AJ Hoge's *Effortless English / Power English* method.

> All figures below are measured (Bash `find`/`du`, `ffprobe` v8.0.1). Durations sampled with ffprobe on every mp3; sizes are on-disk (`du`).

## 1. Method / component model (from sampled transcripts)

Each lesson is a **set** of 3–4 audio tracks, each with a matching PDF transcript. The learner listens to the whole set daily for ~1 week ("deep learning"). Components:

| Component | Prefix | Role | Typical length | Transcript structure |
|-----------|--------|------|----------------|----------------------|
| **MAIN** | `1_` | Motivational/psychology lecture; the theme talk | ~9–25 min (avg 14.7) | Continuous prose, conversational, A2–B1. Opens with copyright notice + "The Effortless English Club" logo image. |
| **VOCAB** | `2_` | AJ explains difficult words from the MAIN | ~6–16 min (avg 10.3) | Prose, word-by-word definitions with examples ("linguistic means…"). Ideal for building a glossary. |
| **MINI_STORY** | `3_` | Ask-and-answer story loop — the core speaking driver | ~10–25 min (avg 14.6) | Bold statement lines, then rapid Q&A (question / italic short answer). Perfect for interactive "answer out loud" UI. |
| **POV** | `4_` | Same mini-story retold in different tenses for grammar intuition | ~3–15 min (avg 7.3) | Method intro + story retold (past/future/etc.). Lessons 09–30 only (and 19 has POV text but **no** POV audio). |

**Suitability for web extraction: excellent.** All PDFs contain real selectable text (not scanned images — the embedded picture on each page is just a render of the same text). Language is deliberately simple and repetitive. Transcripts are verbatim to the audio, so they double as synchronized captions. The only cleanup needed: strip the boilerplate copyright/"illegal copy" notice and the club logo from the top of MAIN/VOCAB/MS files.

## 2. Global totals (website-needed files only)

| Metric | Value |
|--------|-------|
| Lesson folders | 30 |
| Needed audio files (mp3) | **111** (30 MAIN + 30 VOCAB + 30 MINI_STORY + 21 POV) |
| Needed transcript PDFs | **112** (30×MAIN + 30×VOCAB + 30×MS + 22×POV) |
| Total needed audio duration | **~22.4 hours** (1,347 min) |
| Total needed audio size | ~925 MB |
| Total needed PDF size | ~12 MB |
| **Total website payload (AJ Hoge)** | **~940 MB** |
| On-disk folder size incl. junk | 1.4 GB |

Note the POV asymmetry: **21 POV audio files** but **22 POV PDFs**. Lesson 19 ships a POV transcript with no POV mp3; lessons 01–08 have neither POV audio nor POV text.

## 3. Files to EXCLUDE (junk / oversized extras / copyright-heavy)

| Path | Type | Size | Why exclude |
|------|------|------|-------------|
| `*/BBThumbs.dat` (17 files) | thumbnail junk | tiny | Windows/media-player cruft |
| `25_/`, `26_/`, `28_/.DS_Store` (3) | macOS junk | tiny | filesystem cruft |
| `09_Kaizen/full 7- hour audiobook` | MP4 (no ext) | 121 MB | full commercial audiobook, not a lesson |
| `09_Kaizen/Kaizen Theory Full AudioBook.mp4` | MP4 | 57 MB | full audiobook |
| `09_Kaizen/Robert-Maurer-The-Kaizen-Way-PDF.pdf` | book PDF | 704 KB | copyrighted book |
| `23_Excitement/The 4 Hour Work Week Audiobook - by Timothy Ferriss.mp3` | mp3 | 221 MB | copyrighted audiobook |
| `26_Search_for_Meaning/Mans_Search_for_Meaning.78114942.pdf` | book PDF | 320 KB | copyrighted book |
| `27_Be_a_Champion/Фарход Ш..doc` | Word doc | 156 KB | personal/unrelated file |

Excluded extras total ~400 MB (mostly the two audiobooks). **Excluding these is what brings the payload from 1.4 GB down to ~940 MB.**

## 4. Filename irregularities (must be handled by any ingestion script)

The naming is *mostly* regular (`N_<Theme>_<COMPONENT>.mp3`) but has real inconsistencies:

- **Missing `_MAIN`/`_VOCAB` suffix on MAIN track** (just `1_<Theme>.mp3`): lessons 05, 07, 08, 19, 20.
- **Lesson 05**: VOCAB is `2_Thought_Mastery.mp3` (no `_VOCAB`).
- **Double extension**: `11` MS = `..mp3`; `24` MS = `3_Adventure_MINI_STORY.mp3.mp3`; `27` VOCAB = `2_Be_a_Champion_VOCAB.mp3.mp3`.
- **Case/format drift**: `18` MS = `MINI_Story`; MS suffix varies (`MINI_STORY` vs `MINI Story`).
- **Text-subfolder name is per-lesson** (e.g. `01 Intro Text`, not `text`); folder `03` is misspelled `03 Emotional Master 2 Text`.
- **PDF naming has two regimes**: lessons 01–18 use `<Theme> Main/MS/POV/Vocab Text.pdf` (varied: "Vocab"/"Vocabulary", "MS"/"Mini-Story"/"MiniStory"); lessons 19–30 use ALL-CAPS `<Theme> MAIN/MINI STORY/POV/VOCAB.pdf`. Lesson 23 has typo `Exitement MAIN.pdf`.

Do **not** hardcode filenames — glob by numeric prefix (`1_`, `2_`, `3_`, `4_`) for audio and by keyword (MAIN/VOCAB/MS/MINI/POV) for PDFs.

## 5. Per-lesson inventory

Legend: M=MAIN, V=VOCAB, S=MINI_STORY, P=POV. ✓=audio+text, T=text only, —=absent.

| # | Folder | M | V | S | P | Audio (min) | Needed size |
|---|--------|---|---|---|---|-------------|-------------|
| 01 | Intro | ✓ | ✓ | ✓ | — | 44.2 | 30.5 MB |
| 02 | Emotional_Mastery | ✓ | ✓ | ✓ | — | 47.9 | 33.1 MB |
| 03 | Emotional_Mastery_2 | ✓ | ✓ | ✓ | — | 37.3 | 25.8 MB |
| 04 | Beliefs | ✓ | ✓ | ✓ | — | 44.6 | 30.8 MB |
| 05 | Thought_Mastery | ✓ | ✓ | ✓ | — | 42.2 | 29.2 MB |
| 06 | Models | ✓ | ✓ | ✓ | — | 44.3 | 30.6 MB |
| 07 | Repetition | ✓ | ✓ | ✓ | — | 50.3 | 34.7 MB |
| 08 | Identity | ✓ | ✓ | ✓ | — | 43.6 | 30.1 MB |
| 09 | Kaizen | ✓ | ✓ | ✓ | ✓ | 48.4 | 33.5 MB |
| 10 | Reading_Power | ✓ | ✓ | ✓ | ✓ | 45.2 | 31.3 MB |
| 11 | Unlimited | ✓ | ✓ | ✓ | ✓ | 38.7 | 30.0 MB |
| 12 | Healthy_100 | ✓ | ✓ | ✓ | ✓ | 40.3 | 27.9 MB |
| 13 | Walden | ✓ | ✓ | ✓ | ✓ | 37.4 | 25.9 MB |
| 14 | Superior_Man | ✓ | ✓ | ✓ | ✓ | 49.5 | 34.3 MB |
| 15 | Taoism | ✓ | ✓ | ✓ | ✓ | 48.6 | 33.6 MB |
| 16 | Big_Picture | ✓ | ✓ | ✓ | ✓ | 47.2 | 32.7 MB |
| 17 | Small_is_Beautiful | ✓ | ✓ | ✓ | ✓ | 38.8 | 26.9 MB |
| 18 | Slow_Burn | ✓ | ✓ | ✓ | ✓ | 48.0 | 33.2 MB |
| 19 | Leaders_Make_Mistakes | ✓ | ✓ | ✓ | **T** | 41.6 | 29.2 MB |
| 20 | Attractor_Factor | ✓ | ✓ | ✓ | ✓ | 36.3 | 25.6 MB |
| 21 | Healthy_Heart | ✓ | ✓ | ✓ | ✓ | 60.1 | 42.2 MB |
| 22 | Art_of_Power | ✓ | ✓ | ✓ | ✓ | 47.1 | 33.0 MB |
| 23 | Excitement | ✓ | ✓ | ✓ | ✓ | 50.2 | 35.1 MB |
| 24 | Adventure | ✓ | ✓ | ✓ | ✓ | 39.7 | 27.9 MB |
| 25 | Plateaus | ✓ | ✓ | ✓ | ✓ | 49.6 | 34.7 MB |
| 26 | Search_for_Meaning | ✓ | ✓ | ✓ | ✓ | 39.3 | 27.6 MB |
| 27 | Be_a_Champion | ✓ | ✓ | ✓ | ✓ | 41.0 | 28.8 MB |
| 28 | No_Failure | ✓ | ✓ | ✓ | ✓ | 38.5 | 27.0 MB |
| 29 | Break_Rules | ✓ | ✓ | ✓ | ✓ | 44.1 | 30.9 MB |
| 30 | Tribes | ✓ | ✓ | ✓ | ✓ | 61.7 | 43.0 MB |

Every lesson has all 3–4 transcript PDFs present (19 even has a POV PDF without POV audio). No lesson is missing a MAIN, VOCAB, or MS transcript or audio.

## 6. Lesson themes

The 30 lessons are a psychology-of-success curriculum (AJ Hoge draws on Tony Robbins, Kiyosaki, Krashen, etc.). English learning is the vehicle; each MAIN talk teaches a mindset/success principle, and each mini-story dramatizes it comically.

| # | Theme | What it's about |
|---|-------|-----------------|
| 01 | Intro | How to use the course: daily ritual, peak emotional state, deep listening, why psychology is 80% of success. (MS: Sophie vs Tiger Woods golf.) |
| 02 | Emotional Mastery | Managing emotions to learn faster; controlling your state. |
| 03 | Emotional Mastery 2 | Continuation — deeper techniques for emotional control. |
| 04 | Beliefs | How beliefs about yourself and English shape success. |
| 05 | Thought Mastery | Controlling negative/self-talk; directing thoughts. |
| 06 | Models | Learning from role models; modeling successful people. |
| 07 | Repetition | Why deep repetition beats cramming; spaced practice. |
| 08 | Identity | Seeing yourself as an English speaker; identity-level change. |
| 09 | Kaizen | Continuous small improvements (Japanese kaizen); tiny daily steps. |
| 10 | Reading Power | Extensive reading for vocabulary and fluency. |
| 11 | Unlimited | Removing self-imposed limits; unlimited potential. |
| 12 | Healthy at 100 | Health/longevity habits; energy for learning. |
| 13 | Walden | Simplicity and focus (Thoreau's *Walden*). |
| 14 | Superior Man | Purpose, discipline, direction (David Deida themes). |
| 15 | Taoism | Effortless action (wu wei); going with the flow in learning. |
| 16 | Big Picture | Vision and long-term thinking. |
| 17 | Small is Beautiful | Value of small, focused, sustainable effort. |
| 18 | Slow Burn | Steady, gradual, sustainable progress over quick fixes. |
| 19 | Leaders Make Mistakes | Mistakes are essential to growth; leadership through failure. |
| 20 | Attractor Factor | Attitude/attraction; Joe Vitale's law-of-attraction ideas. |
| 21 | Healthy Heart | Cardiovascular health; well-being as a foundation. (Longest set, ~60 min.) |
| 22 | Art of Power | Thich Nhat Hanh's mindful power; inner strength. |
| 23 | Excitement | Passion and enthusiasm as fuel (references *4-Hour Work Week*). |
| 24 | Adventure | Living boldly; taking risks and embracing new experiences. |
| 25 | Plateaus | Pushing through learning plateaus when progress stalls. |
| 26 | Search for Meaning | Purpose and resilience (Viktor Frankl's *Man's Search for Meaning*). |
| 27 | Be a Champion | Champion mindset; commitment and performance. |
| 28 | No Failure | Reframing failure as feedback; there is no failure only results. |
| 29 | Break Rules | Questioning conventional (school) rules of language learning. |
| 30 | Tribes | Community and peer group (Seth Godin's *Tribes*); learning with others. (Longest set, ~62 min.) |

## 7. Recommendations for the build

- **Extract transcripts to structured JSON/HTML** at build time (text is clean and selectable). Split MS transcripts into `{prompt, answer}` pairs to power an interactive "listen → answer aloud → reveal" speaking drill — this is the highest-value interactive feature and maps directly to the site's speaking goal.
- **Strip boilerplate** (copyright notice + logo) from the top of MAIN/VOCAB/MS transcripts.
- **Build a per-lesson glossary** from the VOCAB transcripts (each defines ~3–6 words); pair with Uzbek translations for the vocabulary section.
- **Host the 111 mp3 + 112 PDF (~940 MB) off-repo** (R2/CDN); reference by numeric-prefix glob, never hardcoded names, because of the filename irregularities in §4.
- **POV is a grammar feature** — surface it only for lessons 09–30 (20 with audio+text, 19 text-only), and gate the UI on presence.
