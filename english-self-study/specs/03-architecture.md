# Technical Architecture — Free English Self-Study Site for Uzbek Learners

**Status:** decided. This is the synthesis of two independent proposals (simplicity-first vs. rich-experience-first), judged and merged into one decisive spec. Where the proposals disagreed on facts, the disagreement was resolved by measuring the content and verifying free-tier terms on the web (July 2026); those resolutions are noted inline.

**One-sentence framing:** the site is a *static content catalogue* (30 weekly-lesson JSON files + a fixed renderer) with a little local state (audio position, progress, language). All heavy media (~1.7–2.9 GB) lives off-repo on a zero-egress object store behind one swappable URL constant. No backend, no login, no build step in the deploy path.

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
| 1b | Media escape hatch | **GitHub Releases** (separate `english-self-study` media repo) | No card, no DNS; streaming + `<a download>` both work (assets send `Content-Disposition`); flat-key variant of the resolver |
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

**Bucket:** `english-self-study` — location `EEUR`, public access enabled. *(The working name in earlier drafts was `ess-media`; the bucket actually provisioned in S2 is `english-self-study`.)* The CORS policy below is applied via the **Cloudflare REST API** (`PUT /accounts/{account_id}/r2/buckets/english-self-study/cors`, R2-scoped bearer token) using its `{ "rules": [{ "allowed": { "origins", "methods", "headers" }, "exposeHeaders", "maxAgeSeconds" }] }` shape; the S3 `PutBucketCors` call (identical policy, the S3 shape shown here) is the equivalent fallback. Localhost dev origins are included so local `fetch→blob` download testing works from `python3 -m http.server 8000`.

```jsonc
// R2 CORS policy — enables the fetch→blob download + optional PWA "save offline"
[{
  "AllowedOrigins": [
    "https://principiaforge.com",       // production (GitHub Pages custom domain)
    "http://localhost:8000",            // local dev (python3 -m http.server 8000)
    "http://127.0.0.1:8000"
  ],
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
rclone copy ./_media_staging r2:english-self-study \
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
    lessons/  core-01.json … core-30.json     # 30 weekly lessons only — no supp-* files (EP+6ME fold in, §6.2) (committed)
    i18n/  ui.uz.json  ui.en.json
  sw.js  manifest.webmanifest       # PHASE 2 (app-shell PWA)
  scripts/                          # dev-only Node pipeline (OFFLINE; NEVER served)
    lib/  util.mjs  normalise.mjs  pdf.mjs  markdown.mjs   # reusable modules (normaliser reused by S7/S13)
    extract.mjs  compile-grammar.mjs  build-index.mjs  stage-media.mjs  manifest.mjs  validate.mjs
  authoring/  grammar/<id>-A.md  grammar/<id>-B.md   # committed source: the two Grammar-Spark topics per lesson (Markdown → grammar[0/1].bodyHtml)
  content/                          # READ-ONLY source — .gitignored, NEVER deployed
  _media_staging/  data/raw/         # generated & .gitignored (staging copies + raw PDF text)
  package.json  .gitignore
```
(`content/` is already git-ignored per the app `.gitignore`.)

---

## 4. Framework & key libraries

**Runtime framework: none.** One `index.html`, `assets/*.js` (ES modules, each ≤35 KB — split noted below), one `assets/styles.css`, and the `data/` JSON. The dynamic surface is small and bounded — an audio player, the mini-story reveal drill, a quiz, localStorage progress, a language toggle, hash routing — and **all 30 weekly lessons are JSON, not code**, so "add a lesson" never touches the app and the JS footprint stays flat as the lessons are authored. Shipping almost no JS is the single best lever for "loads fast on a cheap Android over a slow Uzbek network".

> **S3 amendment — app.js split into ES modules.** When the core lesson page landed (S3), the single `app.js` was split (per the ≤35 KB-per-file budget, not by minifying readability away) into: `core.js` (shared `el`/`icon`/`t`/settings + localStorage primitives), `app.js` (shell + hash router + i18n bootstrap), `player.js` (the one persistent `<audio>` + docked bar), `progress.js` (the `ess.progress.v1` read/write surface), and `lesson.js` (the lesson page). `app.js` statically imports `core`+`player` (the persistent shell) and **dynamically imports `lesson.js` only on the `#/lesson/:id` route**, so Home/Map first paint never pays for the lesson renderer. Measured raw at S3 (the nine-section page then): app 11 KB · core 5.6 KB · player 9.6 KB · progress 4.1 KB · lesson 31 KB (each within budget); first-paint JS ≈ 11 KB gzip, `lesson.js` +9 KB gzip lazy. `styles.css` ≈ 5.2 KB gzip (budget ≤15 KB gzip, §8). *(Curriculum redefinition: the lesson page grows to the eleven-section weekly shape — a second Grammar-Spark card + the EnglishPod and 6ME sections (04 §4.3). Since lesson.js was already near the 35 KB raw ceiling, **S7 splits the two new sections into a lazily-imported `lesson-episodes.js`** (EnglishPod shadow/role-play §5.8 + 6ME quiz §5.10), keeping every module within the ≤35 KB budget.)*

**Runtime dependencies: zero.** No React/Vue (40–120 KB runtime for a catalogue), no Svelte (reintroduces a build + compiler), no router lib (hash routing is ~20 lines), no audio lib (native `HTMLAudioElement`), no i18n lib (two flat dicts), no date/util libs (native `Intl`), no icon font (inline SVG / emoji).

**Dev-only libraries (never in the request path), versions current as of mid-2026:**

| Tool | Version | Role |
|------|---------|------|
| Node.js | 20 / 22 / 24 LTS (`engines: ">=20"`) | run the offline scripts (dev env is Node 24 LTS as of mid-2026; scripts use only Node 20+ ESM/`fs` APIs) |
| `pdfjs-dist` | ≥ 4.x | extract selectable text from PDFs → draft JSON |
| `markdown-it` | ≥ 14.x | precompile authored Uzbek grammar Markdown → **sanitized HTML at build time** (so runtime ships zero markdown code) |
| `rclone` | ≥ 1.6x (CLI) | resumable bulk media upload to R2/B2 |

> Grammar prose is authored in a restricted Markdown subset and precompiled to sanitized HTML stored in the lesson JSON (`grammar.bodyHtml`). This keeps runtime dependencies at zero and removes any client-side markdown/XSS surface.

**Alternative (one line):** if first-paint/SEO ever outranks minimal moving parts, pre-render with **Eleventy** (no client runtime) — but note the licensing caveat in §9 against prerendering copyrighted transcript text.

---

## 5. Content build pipeline

All stages are **offline**; `content/` is read-only; the app never parses a PDF at runtime. The inventories confirm every PDF has a clean selectable text layer (no OCR).

### 5.1 Stages
All filename-chaos resolution lives in one reused module, `scripts/lib/normalise.mjs` (§5.3); every stage globs through it and **never hardcodes a source filename**. The whole pipeline is **deterministic** (skip-write-if-identical, date-stable `generated`) so re-runs are byte-identical and leave `content/` untouched.
1. **Extract** — `scripts/extract.mjs` (`pdfjs-dist`) pulls text per PDF into `data/raw/<id>/<component>.txt`, **one directory per weekly lesson id** that now aggregates all of that week's assets: `main`/`vocab`/`ministory`/`pov` (the AJ set) **+ `englishpod`** (the paired EnglishPod dialogue, from §5's weave) **+ `sixmin`** (the paired 6ME transcript). It also writes curation drafts alongside: `ministory.pairs.json` (the parsed `{q,a}` loop), `englishpod.dialogue.json` (speaker-split lines), and `<component>.para.json` (reflowed read-along paragraphs). Globs by numeric prefix / keyword and resolves the EnglishPod-ID / 6ME-`YYMMDD` picks from the §5 weave (§5.3). `data/raw/` is generated + git-ignored.
2. **Curate (the human/AI value-add)** — produce `data/lessons/<id>.json` in the §6.2 **v2** shape: strip the AJ Hoge copyright/logo boilerplate (in the AJ PDFs this is an *image* with no text layer, so the only text-boilerplate is the title line); embed the extracted `{q,a}` MINI_STORY pairs (the italic answer is detected via `pdfjs` per-span font-run pairing, `?`-boundary heuristic — see §5.3); pull VOCAB terms and **author Uzbek glosses** as chunks; write **two original Uzbek grammar topics** (never reproduce Murphy's pages) as restricted Markdown in **`authoring/grammar/<id>-A.md`** and **`<id>-B.md`**, then **`scripts/compile-grammar.mjs`** renders each via `markdown-it` → **sanitized** `grammar[0].bodyHtml` / `grammar[1].bodyHtml` (03 §4), tagging each topic's `slot`/`bandLifter`/`cefrCanDo`/`errorFixUz` per 02 §4; build the **`englishpod{}`** block (`dialogue` from the split draft + **Uzbek gloss added** to the PDF's Key Vocabulary) — set `englishpod:null` for L15 & L22 (§5); build the **`sixmin{}`** block (the PDF's ready-made MCQ → `quiz`, the 6 target words + **Uzbek gloss**, `transcripts.sixmin` trimmed to hold the §8 budget); pick YouTube IDs (or `id:null` until the owner supplies one).
3. **Stage media** — `scripts/stage-media.mjs` **copies** (never moves) `content/` → `_media_staging/<clean-key>` (§2.5), resolving all filename chaos; `--all --dry-run` resolves & lists every source (proving the normaliser at scale). `_media_staging/` is git-ignored.
4. **Build index** — `scripts/build-index.mjs` emits the lean `data/index.json` catalogue (§6.1) from the per-lesson files — deriving `grammarUnits` (both slots), `phase`, `hasPov`, and `hasEnglishPod` (`false` where `englishpod:null`).
5. **Validate** — `scripts/manifest.mjs` asserts every media `path` in every lesson JSON (AJ + `englishpod.audio.*` + `sixmin.audio.*` + `downloads[]`) resolves to a staged key and fails loudly on typos; `scripts/validate.mjs` checks every `data/lessons/<id>.json` against §6.2 **v2** (grammar is a 2-element array; `englishpod` is an object-or-null; `sixmin` is present) and `data/index.json` against §6.1. Both exit non-zero on any violation, before deploy.

> **S7 (as shipped) — EP/6ME curation drafts + batch-resilient compile.** For **any** `aj-hoge` id, `extract.mjs` now also emits `data/raw/<id>/englishpod.draft.json` (**deterministic `null` on L15 & L22**) and `data/raw/<id>/sixmin.draft.json` — cleaned **speaker-split dialogue** (PDF boilerplate stripped), a de-hyphenated Key-Vocab region (`keyVocabRaw`), the **pre-listen MCQ** (`question` + `options`, with `answerIndex:null` / `explanationUz:""` left for curation), and the raw vocab-discussion region — as S13 curation drafts (the Uzbek gloss + `answerIndex` are hand-authored). These drafts are git-ignored artifacts, not deliverables. `compile-grammar.mjs` is now **batch-resilient** (per-lesson isolation: collect-and-continue, then fail once at the end like `validate.mjs`) and **round-trips the folded `englishpod{}` / `sixmin{}` blocks untouched**. CLI signatures are unchanged; neither script exports a new importable symbol.

### 5.2 Base-URL config (the one knob that makes the bucket interchangeable)
```js
// config.js
export const MEDIA_BASE = "https://media.principiaforge.com";      // R2 custom domain (primary)
// fallback #1 (B2 behind Cloudflare): "https://media.principiaforge.com"  // same — just re-point DNS/origin
// escape hatch (GitHub Releases, flat keys):
//   const REL = "https://github.com/<user>/english-self-study/releases/download/media-v1";
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

### 6.1 `data/index.json` — lean catalogue (loaded once; budget ≤40 KB for 30 lessons)
There are now **30 weekly lessons only** — the separate `supp-*` catalogue entries are retired (EnglishPod & 6ME are sections *inside* each lesson, §6.2). `track` is therefore always `"core"` and `source` always `"aj-hoge"`; both are kept (constant) so existing readers/`validate.mjs` need no field-shape change. **S5 added `grammarTitlesUz`** — the two readable Uzbek grammar-topic titles (`l.grammar[*].titleUz`) emitted by `build-index.mjs` so the Curriculum Map (04 §4.2/§5.3) renders topic names without a per-lesson fetch; like every index field it is **regenerated by the build, never migrated**, and `validate.mjs` checks it (when present) as a 2-string array.
```jsonc
{
  "schemaVersion": 1,             // index is REGENERATED by build-index.mjs, not migrated — fields updated in place (no version bump)
  "generated": "2026-07-17",
  "lessons": [
    {
      "id": "core-01",            // stable primary key
      "track": "core",            // always "core" (the 30 AJ-Hoge weekly lessons; the "supp" track is retired)
      "source": "aj-hoge",        // always "aj-hoge"
      "order": 1,
      "slug": "intro",
      "title": "Introduction",
      "titleUz": "Kirish",
      "level": "B1",              // "A2" | "A2-B1" | "B1" | "B1-B2" (grammar spine now runs B1→B2, 02 §1)
      "phase": 1,                 // 1 Poydevor | 2 Sur'at | 3 Ravonlik — for the map's phase grouping (04 §4.2)
      "tags": ["mindset", "method"],
      "grammarUnits": ["present-simple-habits", "frequency-adverbs"],  // ← the TWO topic slugs (was single grammarUnit); [] never null
      "grammarTitlesUz": ["Hozirgi oddiy zamon: odatlar", "Chastota ravishlari"],  // ← the TWO readable Uzbek topic titles (S5) — the map (04 §5.3) shows names with no per-lesson fetch
      "durationSec": 2652,        // sum of this lesson's audio (AJ set + EnglishPod dg/pr/rv + 6ME)
      "hasPov": false,            // POV present (audio or text) — false for L01–08
      "hasEnglishPod": true,      // EnglishPod section present — false for L15 & L22 (englishPod:null, §6.2)
      "youtubeCount": 1           // 6 Minute English is present on all 30, so no flag is needed
    }
  ]
}
```

### 6.2 `data/lessons/<id>.json` — full lesson (lazy-loaded on navigation; budget ≤25 KB gzip, §8)
One file = one **whole weekly AJ Hoge lesson** (MAIN + VOCAB + MINI_STORY + POV, never divided) wrapped with **two original grammar topics + one EnglishPod episode + one 6 Minute English episode** as in-lesson sections (02 §2). Sections render only when their data is present: POV (audio+text) for L09–30, text-only for L19 (`audio.pov:null`, `transcripts.pov` present); the `englishpod` block is **`null` for L15 & L22** (section gated off — the same data-presence gate used for POV). *(Key casing: the schema keys are lowercase `englishpod` / `sixmin` — matching the R2 media prefixes `englishpod/` `sixmin/` (§2.5) and the progress steps; 02's prose calls these `englishPod` / `sixMinute`, the same blocks.)* **`schemaVersion` is bumped `1 → 2`** for the new shape — see the migration note below.
```jsonc
{
  "schemaVersion": 2,                             // ← bumped from 1 (grammar→array; +englishpod/+sixmin); migrate note below
  "id": "core-09", "track": "core", "source": "aj-hoge", "order": 9,
  "slug": "kaizen", "title": "Kaizen", "titleUz": "Kayzen — kichik qadamlar",
  "level": "B1", "tags": ["mindset", "habits"],
  "intro": { "uz": "Bu darsda …", "en": "In this lesson …" },
  "canDo": { "uz": "Dars oxirida ayta olasiz: …", "en": "By the end you can …" },  // measurable can-do goal, section ⓿ (04 §4.3.1)

  "grammar": [                                    // ← ARRAY of exactly TWO original topics (02 §2/§4). grammar[0]=Grammar A (Days 1–2), grammar[1]=Grammar B (Days 3–4)
    {
      "slot": "A",                                //   "A" | "B" — drives the "Grammatika: A va B" two-card panel (04 §4.3.6)
      "unit": "present-perfect-intro",            //   stable slug → #/grammar/<unit>
      "titleUz": "Present perfect bilan tanishuv: since / How long",
      "titleEn": "Present perfect — first contact",
      "bandLifter": "IELTS Part 1 — talk about what you've done up to now",  // 02 §2/§4 UI tag: the IELTS band-lifter this topic earns
      "cefrCanDo": "B1: I can say how long I have been doing something",      // 02 §2/§4 UI tag: the felt CEFR can-do
      "bodyHtml": "<p>…</p>",                     //   precompiled from authoring/grammar/<id>-A.md, sanitized (§4)
      "contrastUz": "Oʻzbekcha '-gan' bilan solishtiring …",                 // explicit L1 contrast
      "errorFixUz": "❌ … ✅ …",                   //   20-sec "Xato tuzatish" L1-trap card, PER TOPIC (02 §2/§6; 04 §4.3.6; also the spaced micro-card seed)
      "examples": [ { "en": "I have studied since 2020.", "uz": "Men 2020-yildan beri oʻqiyman." } ],
      "exercises": [                              //   type: "gap-fill" (auto-checked) | "say-true" (spoken honor-check, answer:null — 04 §4.3.6)
        // gap-fill: optional "options":[…] renders a tap-to-answer MCQ (instant ✓/✗); when omitted, the UI falls back to a reveal + honor self-check (04 §4.3.6, added S3).
        { "type": "gap-fill", "prompt": "I ___ English since 2020.", "options": ["have studied", "studied", "study"], "answer": "have studied", "hintUz": "since + past point → present perfect" },
        { "type": "say-true", "promptUz": "Oʻzingiz haqingizda rost gap ayting: 'I have … since …'", "answer": null }
      ],
      "reference": { "book": "Essential Grammar in Use", "unit": 16,          // OPTIONAL — Murphy is download-only reference, never the on-site source (02 §4)
                     "downloadPath": "grammar/essential-grammar-in-use.pdf" }
    },
    {
      "slot": "B",
      "unit": "gradual-change",
      "titleUz": "Bosqichma-bosqich oʻzgarish: better and better; get + comparative",
      "titleEn": "Gradual change — comparative-and-comparative",
      "bandLifter": "IELTS Part 2 — describe how something changed over time",
      "cefrCanDo": "B1→B2: I can describe a gradual trend",
      "bodyHtml": "<p>…</p>",                     //   from authoring/grammar/<id>-B.md
      "contrastUz": "…",
      "errorFixUz": "❌ … ✅ …",
      "examples": [ { "en": "My English is getting better and better.", "uz": "Inglizcham tobora yaxshilanmoqda." } ],
      "exercises": [
        { "type": "gap-fill", "prompt": "It gets ___ (good) and ___ (good).", "answer": "better and better", "hintUz": "comparative-and-comparative" },
        { "type": "say-true", "promptUz": "Oʻzingiz haqingizda rost gap ayting …", "answer": null }
      ]
      // "reference" omitted when there is no matching optional Murphy unit
    }
  ],

  "audio": {                                      // AJ Hoge components (the never-divided set); nulls encode inventory gaps
    "main":      { "path": "aj-hoge/09/main.mp3",      "durationSec": 1290, "bytes": 33000000, "transcriptKey": "main" },
    "vocab":     { "path": "aj-hoge/09/vocab.mp3",     "durationSec": 620,  "bytes": 9900000,  "transcriptKey": "vocab" },
    "ministory": { "path": "aj-hoge/09/ministory.mp3", "durationSec": 900,  "bytes": 14000000, "transcriptKey": null },
    "pov":       { "path": "aj-hoge/09/pov.mp3",       "durationSec": 430,  "bytes": 6900000,  "transcriptKey": "pov" }
    // pov: null for lessons 01–08; lesson 19 has pov TEXT only → pov:null but transcripts.pov present
  },

  "transcripts": {                                // READ-ALONG, not time-synced (PDFs carry no timestamps)
    "main":   ["para 1 …", "para 2 …"],
    "vocab":  ["…"],
    "pov":    ["…"],
    "sixmin": ["para 1 …", "para 2 …"]            // the 6ME episode read-along (referenced by sixmin.audio.main.transcriptKey)
    // EnglishPod's transcript IS its structured `englishpod.dialogue` (below), so it needs no entry here
  },

  "ministory": {                                  // the core speaking drill (AJ Hoge) — the mandatory gate
    "audioKey": "ministory",
    "pairs": [ { "q": "Did Hiro want to change?", "a": "Yes, he wanted to change." } ]
  },

  "vocab": [                                      // AJ Hoge VOCAB glossary (chunks + Uzbek gloss)
    { "en": "improve", "pos": "v", "uz": "yaxshilamoq",
      "defEn": "to make better", "example": "I want to improve my English." }
  ],

  "englishpod": {                                 // ← in-lesson SPEAKING section (02 §2 ⑥, §3). `null` for L15 & L22 → section gated OFF (same gate as POV)
    "id": "0026",
    "title": "Daily Life – New Year's Resolution",
    "titleUz": "Kundalik hayot – Yangi yil vaʼdasi",
    "warmup": { "uz": "Mavzu: yangi yil vaʼdalari …", "en": "Topic warm-up + a prediction question" },  // bilingual, 2 lines (02 §3.1)
    "audio": {                                    //   dg=~1-min dialogue (cold + shadow) · pr=~10-min hosts' explanation (skippable on Sprint) · rv=~6-min recap
      "dg": { "path": "englishpod/0026/dg.mp3", "durationSec": 62,  "bytes": 1000000 },
      "pr": { "path": "englishpod/0026/pr.mp3", "durationSec": 600, "bytes": 9600000 },
      "rv": { "path": "englishpod/0026/rv.mp3", "durationSec": 360, "bytes": 5800000 }
    },
    "dialogue": [                                 //   shadow + role-play (hide one role, 04 §5.8); this IS the EnglishPod transcript
      { "speaker": "A", "en": "…" },
      { "speaker": "B", "en": "…" }
    ],
    "keyVocab": [                                 //   PDF "Key Vocabulary" + OUR added Uzbek gloss (02 §3.3)
      { "en": "resolution", "uz": "vaʼda / niyat", "defEn": "a firm decision to do something" }
    ]
  },

  "sixmin": {                                     // ← in-lesson LISTENING/IELTS section (02 §2 ⑦, §3). Present on ALL 30 lessons
    "date": "171123",
    "title": "Getting fitter",
    "titleUz": "Jismonan baquvvatroq boʻlish",
    "audio": { "main": { "path": "sixmin/171123/audio.mp3", "durationSec": 360, "bytes": 5800000, "transcriptKey": "sixmin" } },
    "quiz": [                                     //   the PDF's ready-made pre-listening MCQ (02 §3.1; answer revealed near the end) — 04 §5.10
      // "qUz" is OPTIONAL — the bilingual stem framing (04 §5.10 "stem bilingual framing allowed"); options stay English-only.
      { "q": "…", "qUz": "…", "options": ["a","b","c"], "answerIndex": 1, "explanationUz": "…" }
    ],
    "vocab": [                                    //   the 6 target words + OUR added Uzbek gloss (02 §3.5)
      { "en": "…", "uz": "…", "defEn": "…" }
    ]
  },

  "funEnglish": [
    { "provider": "youtube", "id": "XXXXXXXXXXX",
      "title": "Kaizen for kids", "channel": "@EnglishSingsing" }
  ],

  "speakingPrompt": {                             // ← section ⑨ Speak-It prompt (04 §4.3 ⑨ / behavior 10, S4). Present on all 30 lessons.
    "en": "Have you ever tried to change a habit? …",  //   IELTS-style spoken prompt (English), tied to the lesson theme
    "uz": "~60 soniya gapiring. Bu haftaning ikki grammatikasidan foydalaning …",  //   Uzbek instruction line — cues the week's TWO grammar topics (02 §2)
    "targetSec": 60                               //   OPTIONAL ~60-sec guidance (renderer defaults to 60). The recording is a MediaRecorder blob → IndexedDB keyed by lesson id; nothing uploaded (02 §8.2, §6.3 below)
  },

  "downloads": [                                  // same key as streaming — one upload, two uses (AJ + EnglishPod + 6ME assets)
    { "labelUz": "Asosiy audio (MP3)",      "kind": "audio", "path": "aj-hoge/09/main.mp3",   "bytes": 33000000 },
    { "labelUz": "Matn (PDF)",              "kind": "pdf",   "path": "aj-hoge/09/main.pdf",   "bytes": 214563 },
    { "labelUz": "EnglishPod dialog (MP3)", "kind": "audio", "path": "englishpod/0026/dg.mp3","bytes": 1000000 },
    { "labelUz": "6 Minute English (MP3)",  "kind": "audio", "path": "sixmin/171123/audio.mp3","bytes": 5800000 }
  ]
}
```
**Schema v1 → v2 migration (loader must handle both; validate on load).** Three shape changes only: (1) **`grammar` object → array of two topic objects** — each element keeps the same per-topic shape (`unit`, `titleUz`, `bodyHtml`, `contrastUz`, `errorFixUz`, `examples`, `exercises`, optional `reference`) and adds `slot` + the `bandLifter`/`cefrCanDo` UI tags (02 §2/§4); v1's single `grammar{}` maps to `grammar[0]` (slot "A"), with `grammar[1]` (slot "B") authored fresh. (2) **`englishpod{}` folded in** (was the separate `source:"englishpod"` supp lesson): `audio.{dg,pr,rv}` + `dialogue` + `keyVocab`; `null` gates the section off (L15/L22). (3) **`sixmin{}` folded in** (was the separate `source:"6min"` supp lesson): `audio.main` + `quiz` + `vocab`, with the read-along in `transcripts.sixmin`. The former top-level `dialogue`/`quiz` and `audio.{dg,pr,rv}` are **removed** (they now live inside `englishpod`/`sixmin`). **Separate `supp-*` lesson files no longer exist** — all six asset groups live in one `core-NN.json`. *(The shipped `data/lessons/core-09.json` has already been rebuilt to this v2 shape as the pre-S13 design-review exemplar — a `grammar[]` array of two original topics (`present-perfect-intro` slot A + `gradual-change` slot B), `englishpod{}` (0026) and `sixmin{}` (171123), ~14.5 KB gzip, within the §8 budget; see the ROADMAP "Exemplar rebuild" note. The retired `was/were` object and Murphy-unit-10 reference are gone. The remaining 29 lessons are authored directly in v2 in S13.)*

**Fields added in S1, carried into v2:** `canDo:{uz,en}` (the section-⓿ measurable goal, 04 §4.3.1); the per-topic `errorFixUz` "Xato tuzatish" L1-trap card (now inside each `grammar[]` element, 04 §4.3.6); the `grammar[].exercises[].type:"say-true"` spoken honor-check (`answer:null`).

**Field added in S4:** `speakingPrompt:{en, uz, targetSec?}` — the section-⑨ Speak-It prompt (04 §4.3 ⑨ / behavior 10). The IELTS-style English prompt is tied to the lesson theme and its Uzbek instruction cues the week's two grammar topics; the learner's ~`targetSec`-second response is captured with `MediaRecorder` and stored as a blob in **IndexedDB keyed by lesson id** — **nothing is uploaded** (a hard privacy promise). Per §6.3, localStorage holds only the per-lesson `steps.record` flag + the `metrics.recordings` count, never the blob.

**Budget note (§8).** A v2 weekly lesson carries two grammar topics + an EnglishPod dialogue/keyVocab + a 6ME quiz/vocab/transcript, so the file is larger than a v1 core lesson (core-09 was 12.8 KB gzip with one topic and no EP/6ME). To hold the **≤25 KB gzip** per-lesson budget (§8), the read-along `transcripts.sixmin` (and, if needed, `transcripts.main`) are stored as **trimmed paragraphs**; the *full* transcript stays available as the PDF `downloads[]` entry, never inlined. EnglishPod's `dg` dialogue is short by nature (~1 min) so `englishpod.dialogue` is cheap.

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
  "reengageDismissed": "2026-07-18",               // OPTIONAL (S6) — ISO date the Home re-engage banner was last dismissed; absent until first dismiss

  "badges":      ["first-step", "streak-7", "a2-foundation"],  // earned badge ids (02 §8.3 table) → gallery + earn-toast
  "ieltsTopics": { "family": 1, "food": 2 },       // per-topic practice counts → the ~20-cell coverage grid (04 §4.6)

  "lessons": {                                     // ONE map, keyed by the real lesson id from index.json (03 §6.1) — 30 weekly lessons only (supp-* entries retired)
    "core-09": {                                   // ── WEEKLY-LESSON entry (full shape) ──
      "status":         "complete",                //   "none" | "inProgress" | "complete" | "mastered"   (04 §5.2)
      "stars":          1,                          //  0–3 — the 1★/2★/3★ tier (02 §8.1)
      "steps": {                                    //  the Lesson-Check checklist — 10 keys (04 §5.7); rows absent in a lesson just stay false
        "grammarA":  true,  "grammarB":  true,      //  the TWO original topics (02 §2/§4) — both needed for 1★
        "vocab":     true,  "main":      true,
        "ministory": true,                          //  ministory = the MANDATORY speaking GATE (02 §8.1): no ★ can be earned while this is false
        "pov":       false,                         //  only when present (L09–30)
        "ep":        false, "sixmin":    false,     //  EnglishPod / 6 Minute English — in-lesson sections. ep auto-true on L15/L22 (englishPod:null). ep→2★, sixmin→3★
        "fun":       false, "record":    false      //  fun + record + ep → unlock 2★ ; sixmin + a 2nd recording → unlock 3★ (02 §8.1)
      },
      "listens":        { "main": 3, "ms": 2, "pov": 0, "ep": 0, "sixmin": 0 },  //  listen counts backing the "MAIN ×3 / MS ×2" 1★ rule + EP/6ME done (02 §8.1)
      "msAnswersAloud": 45,                         //  this lesson's spoken reps (rolls up into metrics.speakingReps)
      "startedAt":      1752000000000,              //  first opened (ms) → status:inProgress
      "completedAt":    1752100000000,              //  1★ reached (ms); null until the gate + the 1★ minimum are met
      "reviewDue":      "2026-07-19",               //  spaced review, +1/3/7/14 from completedAt (02 §8.3); Home surfaces it when ≤ today
      "audio": {                                    //  resume position per component; keys mirror the lesson JSON audio.* + englishpod.audio.* + sixmin.audio.* (03 §6.2)
        "main":      { "posSec": 300.4, "done": true },     //  done past ~90% → bumps listens + feeds the ★ gate
        "ministory": { "posSec": 0,     "done": false },
        "dg":        { "posSec": 0,     "done": false },    //  EnglishPod dialogue
        "sixmin":    { "posSec": 0,     "done": false }     //  6ME episode
      }
    }
  }
}
```
Read on load; if `schemaVersion` ≠ current, run `migrate(prev)` (or discard gracefully → a clean default object). All reads/writes wrapped in `try/catch` (private mode / quota exceeded); `timeupdate` position writes debounced (~5 s). Import (04 §4.6) validates `schemaVersion`, attempts `migrate()`, and shows a diff-preview before it overwrites.

> **Curriculum-redefinition note (no version bump).** The step set changed with the redefinition — `grammar` split into `grammarA`/`grammarB`, `ep`/`sixmin` added, `supp` dropped, and the separate `supp-*` lesson entries removed (EnglishPod & 6ME are now sub-steps of their weekly lesson). This stays **`schemaVersion: 1`**: the change predates launch, and the reader already treats any absent step key as `false`, so legacy dev data (a lone `steps.grammar`, an orphan `steps.supp`, or a stray `supp-*` entry) is simply ignored — normalised opportunistically on write (`grammar`→`grammarA`, orphans pruned) rather than via a migration. The 02 §8.2 illustrative excerpt matches this (still `schemaVersion: 1`).

> **S5 — engine ownership (as shipped in `assets/progress.js`).** This block is now the real engine, not a recorder:
> - **`migrate()` runs on every load** (threaded through the read path so `snapshot()`/`getGlobal()`/`update()` all see a normalised object). It prunes retired `supp-*` lesson entries, folds a lone `steps.grammar`→`grammarA`, drops `steps.supp`, and — for a **FUTURE unknown `schemaVersion` (>1)** — **keeps the data and re-normalises rather than wiping** (it never discards user progress). `ensure()` guarantees the full union shape. All reads/writes stay wrapped in `try/catch` (private-mode/quota → silent degrade, 04 §9).
> - **`metrics.listeningMinutes` accumulates REAL playback time.** `player.js` tracks wall-clock ms while the audio is actually playing (not paused, not scrubbing; each inter-tick delta capped at ~2 s so a backgrounded tab or a seek can't inflate it) and flushes **whole minutes** to `progress.addListeningMinutes(k)`. This is separate from `listens.*` (the ~90% repeat-listen counters that drive the ★ dots via `markListen`).
> - **`streak` / `weeklyGoal` are engine-owned** and reset on a new ISO week via a **week anchor** — `streak.weekStart` holds the **Monday (ISO date) of the current week**; crossing it resets `freezesLeftThisWeek → 1` and `weeklyGoal.activeDaysThisWeek → 0` *before* today is applied. A study-day is registered by the real actions (`markListen`, `bumpMsAnswer`, `setRecording`, `addListeningMinutes`, `completeLesson`) — **never by `openLesson`** (opening a page must not bump the streak). Consecutive day → `count+1`; exactly one missed day with a freeze available → auto-freeze (`count+1`, `freezesLeftThisWeek−1`); a missed day with no freeze, or a larger gap → `count = 1`.
> - **Per-lesson `reviewStage` (0..3)** backs the 1-3-7-14 spacing: `completeLesson` sets `reviewDue = today + [1,3,7,14][min(stage,3)]` then advances the stage. `completeLesson` **never downgrades `stars`** (`max(old,new)`), sets `completedAt` once, and adds `40 + 10·tier` XP.

> **S6 — populated fields, import & reset (as shipped in `assets/progress.js` + `assets/progress-page.js`).** `badges[]` is now **populated** (ids per 02 §8.3 "S6 (as shipped)"; count-based badges derived from the union object, phase/CEFR badges awarded index-aware by `awardPhaseBadges`) and `ieltsTopics{}` is **populated** (max-merged from completed lessons' index tags via `setTopicCoverage`/`bumpTopic`, persisted on change). New **optional** top-level field **`reengageDismissed`** (ISO date) written by `dismissReengage()`. `schemaVersion` stays **1**. **Import is strict:** `schemaVersion` must `=== 1` (missing / higher / non-1 → refused `badVersion`), a non-object/array → `invalid`, unparseable → `badJson`; a refused import **never writes or corrupts current data** (`previewImport` is read-only; `applyImport` writes only a validated+migrated object). `resetProgress()` resets progress to default but **preserves `settings`** (the caller clears the IndexedDB recordings store). The study-action exports (`markListen`, `bumpMsAnswer`, `addListeningMinutes`, `completeLesson`, `setRecording`) now also evaluate badges and dispatch document `"yp:badge" {ids:[]}` (guarded by `typeof document`; Node-safe); all prior export signatures/returns are unchanged.

---

## 7. Client architecture

**Routing — hash-based.** `#/`, `#/lesson/core-09`, `#/grammar/past-simple`, `#/about`. Hash routing needs **zero server config**, works under the `/english-self-study/` subpath, and needs no 404-rewrite trick on static hosting. ~20 lines listening to `hashchange`. **All non-first-paint route screens are code-split** — `app.js` shows a `screenSkeleton()` then dynamic-imports the route module under an `alive()` guard (`home`/`lessons`/`lesson`/`progress`/`method`/`ielts`/`grammar`/`about`/`settings`), with a `buildScreen()` fallback on import failure.

**Shell event contract (S6/S10).** Non-shell screens ask the shell to make a live change by dispatching a **document `CustomEvent`**, which `app.js` listens for once at boot: **`"yp:badge" {detail:{ids:string[]}}`** (from `progress.js` study paths + `progress-page.js`) → a brief non-modal, non-focus-stealing badge toast, one per new id (reduced-motion-safe); **`"yp:setting" {detail:{key:"uiLang"|"theme"|"rate", value}}`** (from `settings.js`) → the live setting change (uiLang→`setLang`; theme→`applyTheme`+`saveSetting`+`updateThemeBtn`; rate→`saveSetting`). `pace` is persisted directly by `settings.js` (no event). This keeps screens decoupled from shell internals.

**Shell + persistent audio (Proposal 2's best idea, simpler in vanilla).** `index.html` holds a persistent shell: header, a content `<main>` that the router re-renders, and a **docked mini-player wrapping one `<audio preload="none">` placed *outside* `<main>`**, so it survives route changes with no teardown to fight — audio keeps playing as the learner moves between lessons/tabs. Player features for learners:
- play/pause, seek bar (works via R2 Range), current/total time;
- **playback rate 0.75× / 1× / 1.25×** (essential at A2);
- **−10 s / −15 s replay** button for shadowing;
- position saved to localStorage on throttled `timeupdate`, restored on return; marks `done` past ~90%.

**Mini-story drill — the core speaking feature.** Renders `ministory.pairs` as tap-to-reveal cards beside the ministory audio: hear the question → answer aloud → tap to check. Directly implements AJ Hoge's ask-answer loop.

**EnglishPod dialogue / 6-Minute quiz.** `dialogue` → shadowing + role-play (hide one speaker's lines); `quiz` → comprehension MCQ with Uzbek explanation on reveal.

**Fun English — YouTube facade.** Render a **CSS-gradient poster** + play button (a thumbnail fetch would itself be a YouTube byte, so the poster is gradient-only, never `img.youtube.com`/`ytimg`); inject the `youtube-nocookie.com` iframe only on tap (each eager iframe is ~1 MB+ — this is the single biggest first-paint win). *(Shipped as the lazy `assets/lesson-fun.js`, S8 — **0 YouTube/ytimg bytes until tap**; id:null → search-link + honor acknowledge; blocked → open-on-YouTube link; see 04 §5.9.)*

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
| per-lesson JSON | ≤ 25 KB | fetched on navigation; the v2 weekly shape (2 grammar topics + EnglishPod + 6ME) holds this by trimming inlined read-along transcripts — full text stays PDF-download-only (§6.2) |
| Web fonts | **0 KB** | **system font stack** (no Google Fonts `@import`) |
| YouTube (pre-tap) | **0 KB** | facade thumbnail → iframe only on click |

> **`lesson.js` raw-size note.** The per-file budgets above are **gzip** — the authoritative measure for this section. `assets/lesson.js` is ~39.5 KB *raw*, over the ≤35 KB raw per-file guideline (§4), but only ~11.8 KB gzip and **lazy-loaded solely on `#/lesson/:id`**, so it never touches first-view JS and stays well within the authoritative gzip budget. If it grows further, split the Lesson-Check / earn logic into a lazily-imported module the way `lesson-episodes.js` / `lesson-speak.js` were extracted (§4) — not done now.

> **`method.js` raw-size note.** `assets/method.js` (the bilingual 13-block "How to Study" page) is ~46 KB *raw*, over the ≤35 KB raw per-file guideline (§4), but only ~16 KB gzip and **lazy-loaded solely on `#/method`**, so like `lesson.js` it never touches first-view JS and its gzip transfer is acceptable. The cleaner long-term fix is to move its bilingual prose out of a JS module and into a data file (content-as-data — the project's core architecture philosophy) rather than keep it inline — **deferred** (candidate for S11 or a dedicated content-extraction task); not refactored now.

**Tactics:** system fonts (kill the sibling apps' render-blocking third-party font request); YouTube facade; `<audio preload="none">`; lazy per-lesson fetch + `loading="lazy"` images; inline SVG / emoji (no icon font); `immutable` long-cache on media (R2) + manual `?v=N` cache-bust on `app.js`; host-applied gzip/brotli (JSON compresses ~5–8×). Because content is JSON and the renderer is fixed, JS stays flat as the 30 weekly lessons are authored (and would stay flat past 30).

---

## 9. Risks & fallbacks

**Licensing / copyright — the owner's responsibility, and the reason for the swappable-bucket design.**
- **AJ Hoge *Power English* / Effortless English and EnglishPod (Praxis Language Ltd.) are commercial products; *Essential Grammar in Use* is Cambridge University Press copyright; 6 Minute English is BBC copyright.** Redistributing their audio/PDFs publicly requires rights the owner **must independently secure** — this is a legal decision, not an architecture one.
- The architecture minimises exposure and makes takedown trivial: **all media lives in an owner-controlled bucket behind a single `MEDIA_BASE`**, so any source can be **swapped or removed in one edit** (or deleted from the bucket) without touching the app. Media sits behind a **custom domain, not a public search-indexed archive** (a concrete reason we reject Internet Archive). Grammar sections are **original Uzbek prose**, never reproductions of Murphy's pages; the book PDF is offered only as an optional download. Transcripts are **client-rendered from JSON, never prerendered into crawlable HTML** — which is *why* we reject Proposal 2's prerender-every-lesson stance, since that would bake copyrighted text into search-indexed static pages.

**Infra risks & mitigations:**
- **R2 requires a credit card on file + a Cloudflare DNS zone.** Mitigation: set a $0 usage alert; the DNS move is free and doesn't disturb Pages. If the owner refuses both, the **GitHub Releases escape hatch** needs neither — a one-line resolver swap (flat keys), with the §2.3 download behaviour (plain `<a>` works; `fetch→blob` does not).
- **`r2.dev` is rate-throttled / "not for production".** Mitigation: always use the `media.principiaforge.com` custom domain (mandatory, §2.4). The bucket's managed dev URL — `https://pub-8a5df78f6b1c4d2bb18948845c57c53a.r2.dev` — is recorded here as **emergency-fallback documentation ONLY** (custom-domain-outage triage): it is throttled and 429s under load, and it **must NEVER appear in shipped code or `config.js`** — `MEDIA_BASE` always stays the custom domain.
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
