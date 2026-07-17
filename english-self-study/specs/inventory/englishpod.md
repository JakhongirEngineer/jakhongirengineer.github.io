# Inventory: EnglishPod (`content/listening/`)

Definitive inventory of the EnglishPod listening library. Source is **READ-ONLY** — never modify anything under `content/`.

- Root: `/mnt/development/00_startups/jakhongirengineer.github.io/english-self-study/content/listening/`
- **12 topic folders, 28 episodes, 84 mp3 files, 28 pdf files**
- Total size: **487 MB** (mp3 ≈ 483.7 MB, pdf ≈ 2.45 MB; plus 2 junk album-art jpgs in `work/0004`)
- Publisher: EnglishPod / Praxis Language Ltd. (© 2008). Content dated Aug 2011.

---

## 1. Topic folders — the `' u'` suffix

9 of the 12 folder names carry a trailing `" u"` (space + u), which is **junk in the directory name** (an artifact, not a topic). 3 folders are clean. The clean topic is the word before `" u"`.

| Raw folder name | Clean topic | Episodes |
|---|---|---|
| `animals u`    | animals    | 1 (0240) |
| `economy u`    | economy    | 1 (0014) |
| `education u`  | education  | 2 (0110, 0241) |
| `finance u`    | finance    | 1 (0176) |
| `food u`       | food       | 3 (0026, 0052, 0200) |
| `hometown u`   | hometown   | 1 (0185) |
| `music`        | music      | 1 (0154) |
| `people u`     | people     | 6 (0039, 0250, 0253, 0261, 0263, 0350) |
| `shopping`     | shopping   | 1 (0051) |
| `technology`   | technology | 3 (0007, 0140, 0203) |
| `weather u`    | weather    | 1 (0228) |
| `work u`       | work       | 7 (0004, 0188, 0195, 0197, 0244, 0247, 0259) |

Any code/manifest MUST map raw dir → clean topic (strip trailing `" u"`). The URL-encoded space in `"work u"` etc. also needs handling when building media paths.

---

## 2. File naming — decoded

Each episode folder (named by 4-digit ID, e.g. `0004`) contains **1 PDF + 3 MP3s**:

| File | Pattern | Content | Typical size | Duration |
|---|---|---|---|---|
| PDF | `englishpod_B{ID}.pdf` | Transcript: dialogue + Key Vocabulary + Supplementary Vocabulary | ~85–97 KB | 3 pages |
| `dg` mp3 | `englishpod_[B]{ID}dg.mp3` | **Dialogue** — the raw conversation clip only | ~0.4–0.9 MB @ 68 kbps | ~67–69 s |
| `pr` mp3 | `englishpod_[B]{ID}pr.mp3` | **Program / main lesson** — hosts play the dialogue and explain it line-by-line, teach vocabulary & usage | ~9–15 MB @ 128 kbps | **~9.5–10 min** |
| `rv` mp3 | `englishpod_[B]{ID}rv.mp3` | **Review** — vocabulary drill / expansion recap track | ~1.8–8.5 MB @ 128 kbps | **~5.5–7 min** |

Confirmed by reading `work/0004` and `food/0026` PDFs and probing their audio durations (dg 67–69 s; pr 570–591 s; rv 330–404 s).

### `B` prefix inconsistency (IMPORTANT for path building)
- **PDF is ALWAYS** `englishpod_B{ID}.pdf` (B present in all 28).
- **MP3 prefix varies per folder**: 10 folders use the B prefix on mp3s (`englishpod_B0004dg.mp3`), 18 folders do NOT (`englishpod_0240dg.mp3`).
  - **With B mp3s (10):** economy/0014, education/0110, food/0026, food/0052, people/0039, shopping/0051, technology/0007, technology/0140, work/0004 — plus PDF-only-B logic. (dg-check count = 1)
  - **Without B mp3s (18):** everything else.
- A manifest cannot assume one pattern. Either store the exact filenames per episode, or probe both `englishpod_B{ID}{suf}.mp3` and `englishpod_{ID}{suf}.mp3`.

### The `B` letter and the `(C####)` title code
- The `B` prefix denotes EnglishPod's **difficulty tier** — this collection is the **elementary/lower tier** (labeled B in these filenames). Dialogues are short, everyday, high-frequency language.
- Each PDF title carries a category + a `(C{ID})` code, e.g. `The Office - I need an assistant! (C0004)`, `Daily Life - New Year's Resolution (C0026)`. The leading phrase ("The Office", "Daily Life") is EnglishPod's own **series label** and is a nice human title for the lesson.

### Junk files
- `work u/0004/` also contains `AlbumArtSmall.jpg` (7.9 KB) and `Folder.jpg` (31.9 KB) — media-player album art. Ignore.

---

## 3. PDF transcript structure & level

Every transcript follows the same 3-part layout:
1. **Dialogue** — a short, natural A/B (sometimes C) conversation, ~8–10 turns. Real spoken register with contractions, idioms, hesitations ("Yeah, I guess you're right...", "Oh... hi... I'm Tony...").
2. **Key Vocabulary** — the words/phrases used in the dialogue, each with part-of-speech and a plain-English definition (e.g. *understaffed — Adjective — not enough people to do the job*; *give me a hand — phrase — help*).
3. **Supplementary Vocabulary** — extra related words/phrases for expansion (e.g. *recruit, overworked, cut costs*).

**Level:** CEFR ~**A2–B1**. Everyday themes (office/hiring, dieting & food, daily life). Vocabulary is defined in simple English — no L1 gloss, so **Uzbek translations must be added by us** for this project. Grammar is natural but not explained in the PDF.

---

## 4. Full episode index

| Topic | ID | PDF title (series) | mp3 prefix |
|---|---|---|---|
| animals | 0240 | (Animals) | no-B |
| economy | 0014 | (Economy) | B |
| education | 0110 | (Education) | B |
| education | 0241 | (Education) | no-B |
| finance | 0176 | (Finance) | no-B |
| food | 0026 | Daily Life - New Year's Resolution | B |
| food | 0052 | (Food) | B |
| food | 0200 | (Food) | no-B |
| hometown | 0185 | (Hometown) | no-B |
| music | 0154 | (Music) | no-B |
| people | 0039 | (People) | B |
| people | 0250 | (People) | no-B |
| people | 0253 | (People) | no-B |
| people | 0261 | (People) | no-B |
| people | 0263 | (People) | no-B |
| people | 0350 | (People) | no-B |
| shopping | 0051 | (Shopping) | B |
| technology | 0007 | (Technology) | B |
| technology | 0140 | (Technology) | B |
| technology | 0203 | (Technology) | no-B |
| weather | 0228 | (Weather) | no-B |
| work | 0004 | The Office - I need an assistant! | B |
| work | 0188 | (Work) | no-B |
| work | 0195 | (Work) | no-B |
| work | 0197 | (Work) | no-B |
| work | 0244 | (Work) | no-B |
| work | 0247 | (Work) | no-B |
| work | 0259 | (Work) | no-B |

(Titles in parentheses are the topic category; exact titles are inside each PDF's first line and should be read at content-authoring time.)

---

## 5. Mapping into the weekly lesson (the EnglishPod section ⑥)

**One EnglishPod episode = the EnglishPod section (⑥) of one weekly lesson — NOT a separate lesson.** The redefined curriculum has **no separate supplementary lessons**: EnglishPod folds *inside* each weekly lesson page as its **speaking half**, paired with a 6 Minute English section as the listening half (see `specs/02-curriculum.md` §2–§3 and the fixed weave in §5). Each episode is already a self-contained micro-unit (dialogue + key vocab + supplementary vocab + 3 audio tracks) that drops cleanly into that one section. The **28 episodes map onto the 30 weekly lessons, each used exactly once**; the two most abstract "inner-power" weeks — **L15 (Taoism) and L22 (Art of Power)** — carry `englishPod: null` and the section is **hidden by data-presence gating** (the same mechanism that already gates POV on L01–08).

**Grouping / selection:** topics are uneven (work=7, people=6, food=3; but animals/economy/finance/hometown/music/shopping/weather=1 each), so topic is used only as a **tag/filter**, never to bundle episodes — each episode is placed on the single week whose AJ theme it best resonates with (the *Interview Skills 3–9* arc clusters into the self-presentation weeks and the L30 capstone).

**Value for SPEAKING (the site's core need):**
- The `dg` track is a short (~1 min), natural, two-speaker conversation — ideal for **shadowing** (listen-and-repeat) and **role-play** (learner reads role A or B). This is the single most speaking-useful asset in the whole content library after AJ Hoge's mini-stories.
- The dialogues model real conversational moves: making suggestions, disagreeing politely, small talk — directly transferable to speaking practice and interview/CEFR-style tasks.
- **In-lesson section flow (⑥):** (1) listen to `dg` cold, (2) read transcript + Uzbek-glossed Key Vocabulary, (3) listen to `pr` for explanation *(skippable on Sprint)*, (4) shadow the `dg` line-by-line, (5) role-play Role A then Role B, (6) `rv` as vocab review. Pair with the AJ Hoge mini-story answer-aloud technique for automatic speaking.

## 6. Hosting note
487 MB of mp3 cannot live in the git repo / GitHub Pages. EnglishPod media must be hosted externally (R2 / other free host) and streamed + offered for download, same as the rest of `content/`.
