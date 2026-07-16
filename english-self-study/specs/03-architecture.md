# Technical Architecture — Free English Self-Study Site for Uzbek Learners

**Status:** decided. This is the synthesis of two independent proposals (simplicity-first vs. rich-experience-first), judged and merged into one decisive spec. Where the proposals disagreed on facts, the disagreement was resolved by measuring the content and verifying free-tier terms on the web (July 2026); those resolutions are noted inline.

**One-sentence framing:** the site is a *static content catalogue* (60 lesson JSON files + a fixed renderer) with a little local state (audio position, progress, language). All heavy media (~1.7–2.9 GB) lives off-repo on a zero-egress object store behind one swappable URL constant. No backend, no login, no build step in the deploy path.

---

## 0. Proposal scoring (why this synthesis)

Measured/verified facts settled the two genuine factual disputes; the framework/deploy choice is a judgement call decided on solo-dev maintainability.

| Criterion | Proposal 1 — vanilla, buildless | Proposal 2 — SvelteKit, CI |
|---|---|---|
| **All requirements met** (stream + download 2–3 GB @ $0, no backend, free deploy) | Yes | Yes |
| **Simplicity / maintainability (solo dev)** | **Excellent** — buildless, identical to the 4 sibling apps, no CI, no PAT, no separate repo | Weaker — CI + `PAGES_PAT` + second repo + `appDir`/`.nojekyll` Jekyll workarounds; more failure modes |
| **Performance on cheap Android / slow network** | **Excellent** — can ship 0 KB fonts, minimal JS, no hydration cost | Very good — compile-away + prerender, but still ships a framework runtime + font subset |
| **Risk (free-tier changes, rate limits, facts)** | Low — **got the GitHub Releases CORS fact right** | Low on infra — **got the Netlify credit-model fact right** — but **wrong that Releases send CORS headers** |

**Verdict:** adopt **Proposal 1's backbone** (buildless vanilla SPA, deploy-from-branch, hash routing, single `MEDIA_BASE`, download-buttons-first) because "lessons are *data*, not code" means the app never grows as the catalogue goes 30 → 60+ lessons, and it matches the owner's four existing hand-authored static apps. Fold in **Proposal 2's best specifics**: a single persistent audio element that survives navigation, a lean app-shell PWA (phase 2), an optional per-lesson "save offline", the clean media **key scheme**, and **Backblaze B2 + Cloudflare** as the first fallback. Reject Proposal 2's CI/two-repo deploy (disproportionate for a solo dev) and its prerender-every-lesson stance (it would bake copyrighted transcripts into crawlable, search-indexed HTML — the worst option for this content; see §9).

---

## 1. Decisions summary

| # | Decision | Choice | Why (one line) |
|---|----------|--------|----------------|
| 1 | Media hosting (~1.7–2.9 GB mp3/pdf) | **Cloudflare R2** + custom domain `media.principiaforge.com` | 10 GB free, **$0 egress forever**, HTTP Range streaming, configurable CORS, edge-cached |
| 1a | Media fallback #1 | **Backblaze B2 behind Cloudflare** | Bandwidth Alliance = free egress; same CORS abilities → literal `MEDIA_BASE` swap |
| 1b | Media escape hatch | **GitHub Releases** (separate `ess-media` repo) | No card, no DNS; streaming + `<a download>` both work (assets send `Content-Disposition`); flat-key variant of the resolver |
| 2 | App hosting | **GitHub Pages**, subfolder `principiaforge.com/english-self-study/` | Repo, custom domain, and 4 sibling apps already live here; app is a few hundred KB once media is offloaded |
| 3 | Deploy pipeline | **Buildless deploy-from-branch** — commit app files, `git push` publishes | Zero CI, matches sibling apps, no PAT/second repo/Jekyll workarounds |
| 4 | Framework | **None — vanilla ES-module SPA** (hash router, native `<audio>`, localStorage) | Lessons are data; smallest possible JS is the winning move for cheap Androids on slow networks |
| 5 | Content pipeline | **Offline Node scripts**: PDF → curated per-lesson JSON (committed); media staged + uploaded once | PDFs are clean selectable text; author layers Uzbek on top; app never parses PDFs at runtime |
| 6 | Media URL config | Single **`MEDIA_BASE`** constant + `mediaUrl(path)`; JSON stores relative keys | One-line swap between R2 / B2 / Releases |
| 7 | Offline | **Download buttons now**; lean **app-shell + JSON** service worker as phase 2; optional per-lesson "save audio offline" | Meets "download content"; never auto-caches ~1 GB of audio on cheap phones |
| 8 | i18n | Tiny `t(key)` over `ui.uz.json` / `ui.en.json`, **Uzbek default**; lesson content stays English | Two flat dictionaries don't need a library |
| 9 | Progress | Versioned `localStorage["ess.progress.v1"]`, debounced writes, `migrate()` on load | Accountless, resilient, forward-compatible |
| 10 | Fonts | **System font stack (0 KB)** | Kills the sibling apps' render-blocking Google-Fonts `@import`; renders Uzbek `oʻ`/`gʻ` fine |

---

## 2. Media hosting & CDN — Cloudflare R2

### 2.1 Payload reality (measured, not estimated)

`du`/`find` over `content/` (READ-ONLY source):

| Source | On disk | Website-needed payload | Files kept |
|--------|--------:|----------------------:|-----------|
| AJ Hoge Power English | 1.4 GB | **~940 MB** | 111 mp3 (30 MAIN + 30 VOCAB + 30 MINI_STORY + 21 POV) + 112 PDF |
| EnglishPod (`listening/`) | 487 MB | **~487 MB** | 84 mp3 (28× dg/pr/rv) + 28 PDF |
| 6 Minute English | 1.5 GB | **~250–1500 MB** | ~30 curated episodes (~250 MB) → all 143 unique (~1.5 GB) both fit |
| Essential Grammar in Use | 16 MB | **~16 MB** | 1 PDF (download-only) |
| **Total curated** | — | **≈ 1.7 GB** | — |
| **Total everything** | 3.3 GB | **≈ 2.9 GB** | — |

**Excluded junk (~400 MB, do not upload):** `23_Excitement/The 4 Hour Work Week Audiobook…mp3` (221 MB), `09_Kaizen/full 7- hour audiobook` (121 MB, headerless MP4), `09_Kaizen/Kaizen Theory Full AudioBook.mp4` (57 MB), the two copyrighted book PDFs, a personal `.doc`, and all `BBThumbs.dat`/`.DS_Store`/album-art. All needed audio is already `.mp3` — **no transcoding required**.

> **Fact resolved:** Proposal 1 said "~2 GB", Proposal 2 said "~1.7 GB curated / ~2.9 GB full". Measurement confirms Proposal 2's numbers. **Either fits inside R2's 10 GB free tier**, so we are never forced to curate for cost — only for pedagogy.

### 2.2 Verified free-tier facts (July 2026)

| Option | Free storage | Egress | Ops (free/mo) | CORS | Verdict |
|--------|-------------:|--------|---------------|------|---------|
| **Cloudflare R2** ✅ **primary** | **10 GB** | **$0, uncapped, no expiry** | 1 M Class A (writes) + **10 M Class B (reads)** | Configurable | Zero egress + Range + custom domain + CDN. Needs a card on file (not charged in-tier) and a Cloudflare DNS zone. |
| **Backblaze B2 + Cloudflare** ✅ **fallback #1** | 10 GB | **$0 via Cloudflare** (Bandwidth Alliance, verified active 2026) | — | via CF | Same key scheme + same CORS abilities → `MEDIA_BASE` swap. Must be fronted by Cloudflare (direct B2 egress is capped/$0.01·GB). |
| **GitHub Releases** ✅ **escape hatch** | no total cap | **$0, no bandwidth limit** | — | **None** | 2 GiB/file (largest kept file ≈ 43 MB), ≤1000 assets/release. No card, no DNS. See CORS note below. |
| Internet Archive | free | free | — | none | Public + search-indexed → maximal DMCA exposure for copyrighted audio; not production-grade streaming. ❌ |
| Netlify (host media) | — | ~15 GB/mo then **suspended** | — | yes | **New accounts (post 4 Sep 2025) are on the 300-credit model** (bandwidth 20 credits/GB → ~15 GB, hard stop). Only pre-Sep-2025 legacy accounts keep 100 GB. Audio blows this instantly. ❌ |
| GitHub Pages / Git-LFS for media | ~1 GB / LFS 1 GB | LFS bills fast | — | — | Exactly what the constraints forbid. ❌ |

R2 free-tier numbers confirmed against Cloudflare's pricing page: 10 GB Standard storage, 1 M Class A, 10 M Class B, **$0 egress including via r2.dev / S3 API / Workers**, no 12-month expiry, storage overage $0.015/GB·mo.

**Read-limit sanity check:** Cloudflare's edge caches each `immutable` object after first fetch; **cache hits never touch the bucket** and don't consume Class B ops. Pessimistic model: 50,000 plays/mo × ~4 Range requests × 20% miss rate ≈ 40k origin reads/mo — ~250× under the 10 M free ceiling, egress $0 regardless. R2 is comfortably non-binding into tens-of-thousands of MAU.

### 2.3 The CORS / download fact (resolved)

> **Fact resolved:** Proposal 1 said GitHub Release assets send **no** CORS headers; Proposal 2 said they're "permissive". **Proposal 1 is correct** — release-asset downloads send no `Access-Control-Allow-Origin`, and the pre-signed redirect breaks the CORS preflight. This drives concrete, host-specific download handling:

| Action | Mechanism | R2 / B2 (CORS + our headers) | GitHub Releases (no CORS) |
|--------|-----------|------------------------------|---------------------------|
| **Stream** | `<audio preload="none" src=…>` | ✅ works (media loads never trigger CORS) | ✅ works |
| **Seek/scrub** | HTTP `Range` GET | ✅ (R2 honours Range) | ✅ (asset backend honours Range) |
| **Download** | `<a href download>` | opens inline unless forced → use `fetch→blob` (needs CORS, R2/B2 have it) for one-click + filename + progress | ✅ plain `<a>` downloads (assets ship `Content-Disposition: attachment`); `fetch→blob` would fail but is not needed |
| **JSON fetch** | `fetch()` | same-origin on Pages → never cross-origin | same-origin on Pages |

**Download implementation:** `<a href={mediaUrl(path)} download>` is the baseline. On R2/B2 (primary path) enhance to one-click-with-progress via a ~15-line `fetch(url) → response.body reader → Blob → objectURL → click` helper, guarded by `try/catch` with the plain `<a>` as fallback; acceptable in memory for our ≤43 MB files on modern Android. On the Releases escape hatch the plain `<a>` already downloads correctly.

### 2.4 R2 bucket configuration

```jsonc
// R2 CORS policy — enables the fetch→blob download + optional PWA "save offline"
[{
  "AllowedOrigins": ["https://principiaforge.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["Range"],
  "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"],
  "MaxAgeSeconds": 86400
}]
```
```
Cache-Control: public, max-age=31536000, immutable   // media keys are content-stable
```

**Custom domain is mandatory** — the managed `*.r2.dev` URL is explicitly "not for production" and rate-throttled (429s under load). Attach `media.principiaforge.com` as an R2 custom domain, which serves through Cloudflare's CDN with no throttle. This requires the `principiaforge.com` DNS zone to sit on Cloudflare — a **free one-time move that does not disturb GitHub Pages**: keep the apex `A`/`AAAA`/`CNAME` records pointing at Pages (DNS-only / grey-cloud is safest) and add the `media` subdomain alongside.

### 2.5 Upload procedure (one-time / occasional, `content/` stays read-only)

```bash
# 1) Stage into clean keys (never mutates content/) — see §5.2 for the normaliser
node scripts/stage-media.mjs           # content/  ->  _media_staging/<clean-key>

# 2) Bulk upload to R2 (S3-compatible), resumable, with immutable caching
rclone copy ./_media_staging r2:ess-media \
  --transfers=8 --s3-no-check-bucket \
  --header-upload "Cache-Control: public, max-age=31536000, immutable"

# 3) Validate every path referenced by lesson JSON exists in the bucket
node scripts/manifest.mjs              # fails the build on any missing/typo'd key
```

Clean key scheme (identical across all hosts; Releases flattens `/` → `__`):
```
aj-hoge/09/main.mp3   aj-hoge/09/vocab.mp3   aj-hoge/09/ministory.mp3   aj-hoge/09/pov.mp3
aj-hoge/09/main.pdf   …
sixmin/180315/audio.mp3          sixmin/180315/transcript.pdf
englishpod/0004/dg.mp3  …/pr.mp3  …/rv.mp3   englishpod/0004/transcript.pdf
grammar/essential-grammar-in-use.pdf
```

---

## 3. App hosting & deploy pipeline

**Host:** GitHub Pages, served at `https://principiaforge.com/english-self-study/`, beside the existing `maqsad`, `ielts-writing`, `youscore`, and `wedding-invitation` apps in the `jakhongirengineer.github.io` repo (`CNAME` → `principiaforge.com`). Pages' soft limits (100 GB bandwidth/mo, 1 GB site) are irrelevant because all heavy media is off-repo; the app is a few hundred KB. Serving lesson JSON from the same origin as the app means **no CORS for data fetches**.

**Pipeline — buildless, deploy-from-branch (no CI):**
```bash
git add english-self-study
git commit -m "english-self-study: lessons 01–10"
git push                # classic Pages branch deploy publishes in ~1 min
```

> **Rejected (Proposal 2):** a SvelteKit CI job that builds in a second repo and pushes the static output into this repo's subfolder via a `PAGES_PAT`, needing `appDir:'app'` + root `.nojekyll` to survive Jekyll. That is real engineering and several new failure modes for zero benefit here — the four sibling apps already ship as plain committed files, and this app should too.

**Jekyll note:** the vanilla app uses only `assets/` and `data/` (no underscore-prefixed dirs), so Jekyll strips nothing. Optionally drop an empty root `.nojekyll` to skip Jekyll entirely — one-time, zero cost.

**Repo layout** (only static files are served; dev tooling and source media are git-ignored / non-served):
```
english-self-study/                 # → principiaforge.com/english-self-study/
  index.html                        # SPA shell + hash router; critical CSS inlined
  config.js                         # MEDIA_BASE constant + mediaUrl()
  assets/  app.js  styles.css       # the entire "framework" (vanilla ES modules)
  data/
    index.json                      # generated lean catalogue (committed)
    lessons/  core-01.json … supp-6min-180315.json … supp-pod-0004.json   (committed)
    i18n/  ui.uz.json  ui.en.json
  sw.js  manifest.webmanifest       # PHASE 2 (app-shell PWA)
  scripts/  extract.mjs  stage-media.mjs  build-index.mjs  manifest.mjs    # dev-only Node
  content/                          # READ-ONLY source — .gitignored, NEVER deployed
  package.json  .gitignore
```
(`content/` is already git-ignored per the app `.gitignore`.)

---

## 4. Framework & key libraries

**Runtime framework: none.** One `index.html`, one `assets/app.js` (ES module, target ≤35 KB gzip), one `assets/styles.css`, and the `data/` JSON. The dynamic surface is small and bounded — an audio player, the mini-story reveal drill, a quiz, localStorage progress, a language toggle, hash routing — and **all 60 lessons are JSON, not code**, so "add a lesson" never touches the app and the JS footprint stays flat as the catalogue doubles. Shipping almost no JS is the single best lever for "loads fast on a cheap Android over a slow Uzbek network".

**Runtime dependencies: zero.** No React/Vue (40–120 KB runtime for a catalogue), no Svelte (reintroduces a build + compiler), no router lib (hash routing is ~20 lines), no audio lib (native `HTMLAudioElement`), no i18n lib (two flat dicts), no date/util libs (native `Intl`), no icon font (inline SVG / emoji).

**Dev-only libraries (never in the request path), versions current as of mid-2026:**

| Tool | Version | Role |
|------|---------|------|
| Node.js | 20 LTS or 22 LTS | run the offline scripts |
| `pdfjs-dist` | ≥ 4.x | extract selectable text from PDFs → draft JSON |
| `markdown-it` | ≥ 14.x | precompile authored Uzbek grammar Markdown → **sanitized HTML at build time** (so runtime ships zero markdown code) |
| `rclone` | ≥ 1.6x (CLI) | resumable bulk media upload to R2/B2 |

> Grammar prose is authored in a restricted Markdown subset and precompiled to sanitized HTML stored in the lesson JSON (`grammar.bodyHtml`). This keeps runtime dependencies at zero and removes any client-side markdown/XSS surface.

**Alternative (one line):** if first-paint/SEO ever outranks minimal moving parts, pre-render with **Eleventy** (no client runtime) — but note the licensing caveat in §9 against prerendering copyrighted transcript text.

---

## 5. Content build pipeline

All stages are **offline**; `content/` is read-only; the app never parses a PDF at runtime. The inventories confirm every PDF has a clean selectable text layer (no OCR).

### 5.1 Stages
1. **Extract** — `scripts/extract.mjs` (`pdfjs-dist`) pulls text per PDF into `data/raw/<id>.txt`. It **globs by numeric prefix / keyword, never hardcoded filenames** (the inventories document heavy irregularity — see §5.3).
2. **Curate (the human/AI value-add)** — turn raw text into `data/lessons/<id>.json`: strip the AJ Hoge copyright/logo boilerplate header; split MINI_STORY into `{q,a}` pairs (detect the italic answer via `pdfjs` per-span font names, regex fallback); pull VOCAB terms and **author Uzbek glosses**; write **original Uzbek grammar prose** (never reproduce Murphy's pages); pick YouTube IDs; author 6-Minute quiz MCQs from the built-in `a)/b)/c)` + revealed answer.
3. **Stage media** — `scripts/stage-media.mjs` copies `content/` → `_media_staging/` under the clean key scheme (§2.5), resolving all filename chaos.
4. **Build index** — `scripts/build-index.mjs` emits the lean `data/index.json` catalogue from the per-lesson files.
5. **Validate** — `scripts/manifest.mjs` asserts every `path` in every lesson JSON resolves to a staged/uploaded key; fails loudly on typos before deploy.

### 5.2 Base-URL config (the one knob that makes the bucket interchangeable)
```js
// config.js
export const MEDIA_BASE = "https://media.principiaforge.com";      // R2 custom domain (primary)
// fallback #1 (B2 behind Cloudflare): "https://media.principiaforge.com"  // same — just re-point DNS/origin
// escape hatch (GitHub Releases, flat keys):
//   const REL = "https://github.com/<user>/ess-media/releases/download/media-v1";
//   export const mediaUrl = (k) => `${REL}/${k.replaceAll("/", "__")}`;
export const mediaUrl = (path) => `${MEDIA_BASE}/${path}`;         // path = lesson JSON "path"
```
Every lesson stores **relative keys** (`"aj-hoge/01/main.mp3"`); streaming and download share the same key (one upload, two uses). R2 ↔ B2 is a zero-code DNS/origin change; Releases is the flat-key resolver variant above.

### 5.3 Filename normalisation (must-handle, from the inventories)
- **AJ Hoge:** glob audio by prefix `1_`/`2_`/`3_`/`4_` (MAIN/VOCAB/MS/POV) and PDFs by keyword; handle missing `_MAIN`/`_VOCAB` suffixes (05,07,08,19,20), double extensions (`.mp3.mp3` on 24 MS, 27 VOCAB; `..mp3` on 11), case drift (`MINI_Story`), per-lesson text-folder names, and the two PDF naming regimes (01–18 mixed-case vs 19–30 ALL-CAPS, `Exitement`/`Excitement` typo). **POV exists only for 09–30; lesson 19 has POV *text* but no POV *audio*** → encode as `pov: null` / `transcriptKey`-present.
- **6 Minute English:** key by `YYMMDD` (100% reliable); derive the topic slug from the PDF's page-1 title, not the filename (series token varies `6min`/`6_min`/`6_minute`, typos, spaces). **Dedupe** the 3 ` (1)` duplicates (`161215`, `180322`, `181220`).
- **EnglishPod:** strip the trailing `" u"` from 9 folder names → clean topic; PDF is always `englishpod_B{ID}.pdf` but mp3s carry the `B` prefix in only 10 of 28 folders → probe both `…B{ID}{dg|pr|rv}.mp3` and `…{ID}{…}.mp3`; ignore album-art jpgs.

---

## 6. Data model

### 6.1 `data/index.json` — lean catalogue (loaded once; budget ≤40 KB for 60 lessons)
```jsonc
{
  "schemaVersion": 1,
  "generated": "2026-07-16",
  "lessons": [
    {
      "id": "core-01",            // stable primary key
      "track": "core",            // "core" (AJ Hoge) | "supp" (6min/EnglishPod)
      "source": "aj-hoge",        // "aj-hoge" | "6min" | "englishpod"
      "order": 1,
      "slug": "intro",
      "title": "Introduction",
      "titleUz": "Kirish",
      "level": "A2",              // "A2" | "A2-B1" | "B1" | "B1-B2"
      "tags": ["mindset", "method"],
      "grammarUnit": "present-simple",  // links §6.2 grammar; null if none
      "durationSec": 2652,        // sum of this lesson's audio
      "hasPov": false,
      "hasQuiz": false,
      "hasDialogue": false,
      "youtubeCount": 1
    }
  ]
}
```

### 6.2 `data/lessons/<id>.json` — full lesson (lazy-loaded on navigation; budget ≤25 KB)
Covers every owner-required section. Blocks are optional per source and the UI renders only those present (AJ Hoge → `ministory`/`vocab`/`pov`; EnglishPod → `dialogue`; 6 Minute → `quiz`).
```jsonc
{
  "schemaVersion": 1,
  "id": "core-09", "track": "core", "source": "aj-hoge", "order": 9,
  "slug": "kaizen", "title": "Kaizen", "titleUz": "Kayzen — kichik qadamlar",
  "level": "A2-B1", "tags": ["mindset", "habits"],
  "intro": { "uz": "Bu darsda …", "en": "In this lesson …" },

  "grammar": {                                    // explained in Uzbek where it helps
    "unit": "past-simple",
    "titleUz": "Oʻtgan oddiy zamon (Past Simple)",
    "bodyHtml": "<p>…</p>",                       // precompiled from Markdown, sanitized (§4)
    "contrastUz": "Oʻzbekcha -di qoʻshimchasi bilan solishtiring …",
    "examples": [ { "en": "I worked yesterday.", "uz": "Men kecha ishladim." } ],
    "exercises": [
      { "type": "gap-fill", "prompt": "I ___ (go) home.", "answer": "went", "hintUz": "irregular: go→went" }
    ],
    "reference": { "book": "Essential Grammar in Use", "unit": 11,
                   "downloadPath": "grammar/essential-grammar-in-use.pdf" }
  },

  "audio": {                                      // AJ Hoge components; nulls encode inventory gaps
    "main":      { "path": "aj-hoge/09/main.mp3",      "durationSec": 1290, "bytes": 33000000, "transcriptKey": "main" },
    "vocab":     { "path": "aj-hoge/09/vocab.mp3",     "durationSec": 620,  "bytes": 9900000,  "transcriptKey": "vocab" },
    "ministory": { "path": "aj-hoge/09/ministory.mp3", "durationSec": 900,  "bytes": 14000000, "transcriptKey": null },
    "pov":       { "path": "aj-hoge/09/pov.mp3",       "durationSec": 430,  "bytes": 6900000,  "transcriptKey": "pov" }
    // pov: null for lessons 01–08; lesson 19 has pov TEXT only → pov:null but transcripts.pov present
  },

  "transcripts": {                                // READ-ALONG, not time-synced (PDFs carry no timestamps)
    "main":  ["para 1 …", "para 2 …"],
    "vocab": ["…"],
    "pov":   ["…"]
  },

  "ministory": {                                  // the core speaking drill (AJ Hoge)
    "audioKey": "ministory",
    "pairs": [ { "q": "Did Hiro want to change?", "a": "Yes, he wanted to change." } ]
  },

  "vocab": [
    { "en": "improve", "pos": "v", "uz": "yaxshilamoq",
      "defEn": "to make better", "example": "I want to improve my English." }
  ],

  "dialogue": null,                               // EnglishPod: [{ "speaker":"A", "en":"…", "uz":"" }]  (shadowing / role-play)
  "quiz": null,                                   // 6 Minute: [{ "q":"…", "options":["a","b","c"], "answerIndex":1, "explanationUz":"…" }]

  "funEnglish": [
    { "provider": "youtube", "id": "XXXXXXXXXXX",
      "title": "Kaizen for kids", "channel": "@EnglishSingsing" }
  ],

  "downloads": [                                  // same key as streaming — one upload, two uses
    { "labelUz": "Asosiy audio (MP3)", "kind": "audio", "path": "aj-hoge/09/main.mp3", "bytes": 33000000 },
    { "labelUz": "Matn (PDF)",         "kind": "pdf",   "path": "aj-hoge/09/main.pdf", "bytes": 214563 }
  ]
}
```
**Supplementary shapes:** `source:"6min"` lessons key by `YYMMDD` (`supp-6min-180315`), use `audio.main` = the episode mp3, carry a `quiz` block, and omit `ministory`/`pov`. `source:"englishpod"` lessons key by ID (`supp-pod-0004`), expose `audio.dg`/`audio.pr`/`audio.rv`, carry a `dialogue` block, and omit `ministory`/`pov`.

### 6.3 localStorage progress — `ess.progress.v1` (the CANONICAL schema; versioned, debounced, migratable)

> **This block is the single source of truth for the progress model — when any other spec's excerpt disagrees, this wins.** It is the *union* of every field the product surfaces: the hero metrics (02 §1/§8, 04 §4.1/§6), the 1★/2★/3★ star model + mandatory mini-story speaking gate (02 §8.1, 04 §5.7), streak / weekly-goal / badges (02 §8.3), the IELTS-topic coverage grid (04 §4.6), and the 1-3-7-14 spaced review. The 02 §8.2 JSON is an illustrative excerpt that **defers to this section**. Recordings are **not** stored here — audio blobs live in IndexedDB keyed by lesson id (02 §8.2); localStorage keeps only the per-lesson `steps.record` flag + the `metrics.recordings` count.

```jsonc
{
  "schemaVersion": 1,                              // bump + migrate() on load; safe schema evolution
  "updatedAt": 1752624000000,                      // last write (ms epoch); also shown in the export diff-preview
  "startedAt": "2026-07-16",                       // first-run date (ISO) — "learning since"
  "settings": {                                    // everything the Settings sheet controls (04 §2.1) — persists to settings.*
    "uiLang": "uz",                                //   "uz" | "en"   (03 §7 t(); "ru" drops in later, no code change)
    "pace":   "effortless",                        //   "effortless" | "sprint" | "gentle"   (02 §2; first-run 04 §4.1)
    "rate":   1.0,                                 //   0.75 | 1 | 1.25   (persistent player, 04 §5.1)
    "theme":  "auto"                               //   "auto" | "light" | "dark"   (04 §7.5)
  },
  "lastLessonId": "core-09",                       // powers the Home "Continue" card (04 §4.1)

  "metrics": {                                     // the HERO numbers (02 §1/§8, 04 §4.1/§6) — reward volume, not speed
    "listeningMinutes": 0,                         //   biggest number on the site
    "speakingReps":     0,                         //   Σ mini-story answers spoken aloud (= Σ lessons.*.msAnswersAloud)
    "recordings":       0,                         //   Σ Speak-It recordings saved (the blobs themselves are in IndexedDB)
    "xp":               0                          //   +points per checked step — ambient positive feedback
  },

  "streak": {                                      // 02 §8.3 — tuned not to punish real life
    "count":               4,                      //   current run of study-days
    "longest":             20,                     //   best-ever run
    "lastActiveDate":      "2026-07-16",           //   ISO date of the last study-day (study-day defined in 02 §8.3)
    "freezesLeftThisWeek": 1                       //   1 free skip-day/week, auto-applied
  },
  "weeklyGoal": { "target": 5, "activeDaysThisWeek": 3 },      // forgiving 5/7 ring (02 §8.3, 04 §4.1)

  "badges":      ["first-step", "streak-7", "a2-foundation"],  // earned badge ids (02 §8.3 table) → gallery + earn-toast
  "ieltsTopics": { "family": 1, "food": 2 },       // per-topic practice counts → the ~20-cell coverage grid (04 §4.6)

  "lessons": {                                     // ONE map, keyed by the real lesson id from index.json (03 §6.1) — core AND supp
    "core-09": {                                   // ── CORE entry (full shape) ──
      "status":         "complete",                //   "none" | "inProgress" | "complete" | "mastered"   (04 §5.2)
      "stars":          1,                          //  0–3 — the 1★/2★/3★ tier (02 §8.1)
      "steps": {                                    //  the Lesson-Check checklist — 8 keys (04 §5.7); rows absent in a lesson just stay false
        "grammar":   true,  "vocab":     true,
        "main":      true,  "ministory": true,      //  ministory = the MANDATORY speaking GATE (02 §8.1): no ★ can be earned while this is false
        "pov":       false, "fun":       false,
        "record":    false, "supp":      false      //  record → unlocks 2★ ; supp (paired lesson done) → unlocks 3★
      },
      "listens":        { "main": 3, "ms": 2, "pov": 0 },   //  listen counts backing the "MAIN ×3 / MS ×2" 1★ rule (02 §8.1)
      "msAnswersAloud": 45,                         //  this lesson's spoken reps (rolls up into metrics.speakingReps)
      "startedAt":      1752000000000,              //  first opened (ms) → status:inProgress
      "completedAt":    1752100000000,              //  1★ reached (ms); null until the gate + the 1★ minimum are met
      "reviewDue":      "2026-07-19",               //  spaced review, +1/3/7/14 from completedAt (02 §8.3); Home surfaces it when ≤ today
      "audio": {                                    //  resume position per component; keys mirror the lesson JSON audio.* (03 §6.2)
        "main":      { "posSec": 300.4, "done": true },     //  done past ~90% → bumps listens + feeds the ★ gate
        "ministory": { "posSec": 0,     "done": false }
      }
    },
    "supp-pod-0004": {                             // ── SUPPLEMENTARY entry (single-star done model, 02 §8.1) ──
      "status":      "complete",                    //  supp tops out at "complete" (max 1★). Key = the REAL supp id (03 §6.1) — never "supp-01"
      "stars":       1,
      "steps":       { "dg": true, "vocab": true, "shadow": true, "roleplay": true },  // keys match the template — EnglishPod here; 6ME = {listen,quiz,vocab,record} (02 §3/§8.1)
      "completedAt": 1752200000000,
      "reviewDue":   null,
      "audio":       { "dg": { "posSec": 0, "done": true } }
    }
  }
}
```
Read on load; if `schemaVersion` ≠ current, run `migrate(prev)` (or discard gracefully → a clean default object). All reads/writes wrapped in `try/catch` (private mode / quota exceeded); `timeupdate` position writes debounced (~5 s). Import (04 §4.6) validates `schemaVersion`, attempts `migrate()`, and shows a diff-preview before it overwrites.

---

## 7. Client architecture

**Routing — hash-based.** `#/`, `#/lesson/core-09`, `#/grammar/past-simple`, `#/about`. Hash routing needs **zero server config**, works under the `/english-self-study/` subpath, and needs no 404-rewrite trick on static hosting. ~20 lines listening to `hashchange`.

**Shell + persistent audio (Proposal 2's best idea, simpler in vanilla).** `index.html` holds a persistent shell: header, a content `<main>` that the router re-renders, and a **docked mini-player wrapping one `<audio preload="none">` placed *outside* `<main>`**, so it survives route changes with no teardown to fight — audio keeps playing as the learner moves between lessons/tabs. Player features for learners:
- play/pause, seek bar (works via R2 Range), current/total time;
- **playback rate 0.75× / 1× / 1.25×** (essential at A2);
- **−10 s / −15 s replay** button for shadowing;
- position saved to localStorage on throttled `timeupdate`, restored on return; marks `done` past ~90%.

**Mini-story drill — the core speaking feature.** Renders `ministory.pairs` as tap-to-reveal cards beside the ministory audio: hear the question → answer aloud → tap to check. Directly implements AJ Hoge's ask-answer loop.

**EnglishPod dialogue / 6-Minute quiz.** `dialogue` → shadowing + role-play (hide one speaker's lines); `quiz` → comprehension MCQ with Uzbek explanation on reveal.

**Fun English — YouTube facade.** Render a thumbnail + play button; inject the `youtube-nocookie.com` iframe only on tap (each eager iframe is ~1 MB+ — this is the single biggest first-paint win).

**i18n — a lookup function, not a library.** UI chrome **Uzbek by default** with an English toggle; lesson content stays English (that's the point). `t(key)` reads the active flat dict (`ui.uz.json`/`ui.en.json`); choice persists in `settings.uiLang`. Uzbek text uses the proper modifier letters `oʻ`/`gʻ` (U+02BB/U+02BC), which the system font stack renders correctly. Russian (`ui.ru.json`) drops in later with no code change.

**Offline stance.**
- **Now (v1):** `<a download>` buttons straight to the bucket per §2.3, so learners keep exactly what they want for offline listening. Meets the "download content" requirement with zero extra machinery.
- **Phase 2 (recommended, deferrable):** a ~40-line hand-written service worker that precaches the **app shell + all lesson JSON + icons** (a few hundred KB) — cache-first for immutable assets, stale-while-revalidate for JSON — plus a `manifest.webmanifest` for "Add to Home Screen". Instant repeat loads + offline text/UI.
- **Optional:** a per-lesson "save audio offline" tap that stores just that lesson's tracks via the Cache API. **Never** auto-cache the ~1 GB library.

---

## 8. Performance budget

**Target:** first meaningful view ≤ ~100 KB transferred, interactive < 3 s on throttled 3G / low-end Android.

| Asset | Budget (gzip) | How |
|-------|---------------|-----|
| `index.html` shell | ≤ 12 KB | hand-written, critical CSS inlined |
| `styles.css` | ≤ 15 KB | one file, no CSS framework |
| `app.js` | ≤ 35 KB | vanilla, zero runtime deps |
| `index.json` | ≤ 40 KB | lean fields only; full lesson lazy-loaded |
| per-lesson JSON | ≤ 25 KB | fetched on navigation |
| Web fonts | **0 KB** | **system font stack** (no Google Fonts `@import`) |
| YouTube (pre-tap) | **0 KB** | facade thumbnail → iframe only on click |

**Tactics:** system fonts (kill the sibling apps' render-blocking third-party font request); YouTube facade; `<audio preload="none">`; lazy per-lesson fetch + `loading="lazy"` images; inline SVG / emoji (no icon font); `immutable` long-cache on media (R2) + manual `?v=N` cache-bust on `app.js`; host-applied gzip/brotli (JSON compresses ~5–8×). Because content is JSON and the renderer is fixed, JS stays flat from 30 → 60+ lessons.

---

## 9. Risks & fallbacks

**Licensing / copyright — the owner's responsibility, and the reason for the swappable-bucket design.**
- **AJ Hoge *Power English* / Effortless English and EnglishPod (Praxis Language Ltd.) are commercial products; *Essential Grammar in Use* is Cambridge University Press copyright; 6 Minute English is BBC copyright.** Redistributing their audio/PDFs publicly requires rights the owner **must independently secure** — this is a legal decision, not an architecture one.
- The architecture minimises exposure and makes takedown trivial: **all media lives in an owner-controlled bucket behind a single `MEDIA_BASE`**, so any source can be **swapped or removed in one edit** (or deleted from the bucket) without touching the app. Media sits behind a **custom domain, not a public search-indexed archive** (a concrete reason we reject Internet Archive). Grammar sections are **original Uzbek prose**, never reproductions of Murphy's pages; the book PDF is offered only as an optional download. Transcripts are **client-rendered from JSON, never prerendered into crawlable HTML** — which is *why* we reject Proposal 2's prerender-every-lesson stance, since that would bake copyrighted text into search-indexed static pages.

**Infra risks & mitigations:**
- **R2 requires a credit card on file + a Cloudflare DNS zone.** Mitigation: set a $0 usage alert; the DNS move is free and doesn't disturb Pages. If the owner refuses both, the **GitHub Releases escape hatch** needs neither — a one-line resolver swap (flat keys), with the §2.3 download behaviour (plain `<a>` works; `fetch→blob` does not).
- **`r2.dev` is rate-throttled / "not for production".** Mitigation: always use the `media.principiaforge.com` custom domain (mandatory, §2.4).
- **Free-tier changes.** R2's 10 GB / $0-egress terms verified July 2026 (no expiry). B2+Cloudflare Bandwidth Alliance verified active 2026. **Netlify is disqualified for new accounts** (post-4-Sep-2025 credit model ≈ 15 GB/mo then suspended) — do not use it for media or as the app host on a fresh account.
- **PDF extraction needs human review** (italic-answer detection, boilerplate stripping, filename chaos) — but it's a one-time 60-lesson pass the author must touch anyway to add Uzbek.

**Fallback ladder (one-line switches):** R2 → **B2 behind Cloudflare** (`MEDIA_BASE` re-point, same CORS) → **GitHub Releases** (flat-key resolver, no card/DNS). App host stays GitHub Pages throughout.

---

## Sources (free-tier numbers verified July 2026)
- Cloudflare R2 pricing & free tier (10 GB, 1M Class A, 10M Class B, $0 egress, no expiry) — developers.cloudflare.com/r2/pricing/
- R2 public buckets (`r2.dev` throttling, custom-domain-must-be-a-zone) — developers.cloudflare.com/r2/buckets/public-buckets/
- GitHub Releases (2 GiB/file, ≤1000 assets, no bandwidth limit) — docs.github.com/…/about-releases
- GitHub release-asset **no-CORS** confirmation — github.com/orgs/community/discussions/45446 ; corsfix.com/blog/fetch-github-release
- Backblaze B2 + Cloudflare Bandwidth Alliance (free egress, active 2026) — cloudflare.com/partners/technology-partners/backblaze/
- Netlify credit-based pricing for new accounts (from 4 Sep 2025; ~15 GB then hard stop; legacy = 100 GB) — docs.netlify.com/…/credit-based-pricing-plans/ ; netlify.com/pricing/
