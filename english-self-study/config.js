// config.js — the single media knob (03 §5.2).
// Lesson JSON stores RELATIVE keys (e.g. "aj-hoge/09/main.mp3"); mediaUrl() turns a
// key into a full URL. Swapping the object store is a one-line change HERE, never in
// the app: R2 -> Backblaze B2 (same MEDIA_BASE, re-point DNS) -> GitHub Releases.
//
// Not imported yet — media arrives in S2/S3. Present now so the layout (03 §3) is complete.

export const MEDIA_BASE = "https://media.principiaforge.com"; // R2 custom domain, primary (03 §2.4)

// Fallback #1 — Backblaze B2 behind Cloudflare: same key scheme + CORS, so keep
//   MEDIA_BASE identical and just re-point the origin/DNS (03 §2, decision 1a).
// Escape hatch — GitHub Releases (no card/DNS): flat keys, one-line resolver swap (03 §2.3):
//   const REL = "https://github.com/<user>/ess-media/releases/download/media-v1";
//   export const mediaUrl = (k) => `${REL}/${k.replaceAll("/", "__")}`;

export const mediaUrl = (path) => `${MEDIA_BASE}/${path}`;
