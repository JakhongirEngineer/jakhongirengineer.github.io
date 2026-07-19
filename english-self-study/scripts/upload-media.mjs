#!/usr/bin/env node
// scripts/upload-media.mjs — Stage 6 of the pipeline (03 §2.5, §5.1).
//
// Publishes _media_staging/ → the Cloudflare R2 bucket behind
// media.principiaforge.com, at $0 egress, with the immutable Cache-Control the
// whole delivery model relies on (03 §2.4). DEPENDENCY-FREE: AWS Signature V4 is
// implemented with node:crypto + global fetch — no aws-sdk, no rclone, matching
// the buildless ethos. Reads S3 credentials from .env (NEVER committed/echoed).
//
//   node scripts/upload-media.mjs               # DRY RUN: list what would upload / is already live
//   node scripts/upload-media.mjs --go          # actually upload (skips objects already live with same size)
//   node scripts/upload-media.mjs --go --force  # re-upload everything (ignore the skip check)
//   node scripts/upload-media.mjs --selftest    # signed HEAD on a known object — proves auth without publishing
//
// PRECONDITION (owner): publishing the third-party audio publicly is the owner's
// licensing call (00 §6, 03 §9, ROADMAP S13). This tool ships the mechanism; the
// owner runs `--go` when ready. Re-runs are cheap (skip-if-live) and reversible.

import { createHash, createHmac } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { STAGING_DIR, ROOT, walkFiles, relRoot, step, ok, info, warn, fail, log } from "./lib/util.mjs";

const BUCKET = "english-self-study";
const REGION = "auto";                       // R2 uses "auto"
const PUBLIC_BASE = "https://media.principiaforge.com";
const CACHE_CONTROL = "public, max-age=31536000, immutable";   // 03 §2.4

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync(join(ROOT, ".env"), "utf8").split("\n")) {
      const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* handled by the missing-key check */ }
  return env;
}

const contentType = (key) =>
  key.endsWith(".mp3") ? "audio/mpeg" : key.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";

const sha256hex = (buf) => createHash("sha256").update(buf).digest("hex");
const hmac = (key, data) => createHmac("sha256", key).update(data).digest();
// encode each path segment but keep the "/" separators (S3 canonical URI rule).
const encodeKey = (key) => key.split("/").map((s) => encodeURIComponent(s)).join("/");

// Sign one request (SigV4) and return the headers to send. `method` GET/HEAD/PUT.
function signedHeaders({ method, endpoint, key, body, env }) {
  const url = new URL(`${endpoint}/${BUCKET}/${encodeKey(key)}`);
  const host = url.host;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");   // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256hex(body ?? Buffer.alloc(0));

  const headers = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (method === "PUT") {
    headers["content-type"] = contentType(key);
    headers["cache-control"] = CACHE_CONTROL;
  }
  const signedList = Object.keys(headers).sort();
  const canonicalHeaders = signedList.map((h) => `${h}:${headers[h]}\n`).join("");
  const signedHeadersStr = signedList.join(";");

  const canonicalRequest = [
    method, `/${BUCKET}/${encodeKey(key)}`, "",
    canonicalHeaders, signedHeadersStr, payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(Buffer.from(canonicalRequest))].join("\n");

  const kDate = hmac("AWS4" + env.R2_SECRET_ACCESS_KEY, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  headers.Authorization =
    `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, ` +
    `SignedHeaders=${signedHeadersStr}, Signature=${signature}`;
  return { url: url.toString(), headers };
}

// Is `key` already live on the public domain with the same byte length? (no auth)
async function isLive(key, size) {
  try {
    const r = await fetch(`${PUBLIC_BASE}/${encodeKey(key)}`, { method: "HEAD" });
    return r.ok && Number(r.headers.get("content-length")) === size;
  } catch { return false; }
}

async function putObject(key, src, env) {
  const body = readFileSync(src);
  const { url, headers } = signedHeaders({ method: "PUT", endpoint: env.R2_S3_API_ENDPOINT, key, body, env });
  const r = await fetch(url, { method: "PUT", headers, body });
  if (!r.ok) throw new Error(`PUT ${key} → ${r.status} ${r.statusText}: ${(await r.text()).slice(0, 200)}`);
}

async function selftest(env) {
  step("upload-media --selftest : signed HEAD on aj-hoge/09/main.mp3 (already live from S2)");
  const { url, headers } = signedHeaders({ method: "HEAD", endpoint: env.R2_S3_API_ENDPOINT, key: "aj-hoge/09/main.mp3", env });
  const r = await fetch(url, { method: "HEAD", headers });
  if (r.ok) ok(`SigV4 auth OK — HEAD ${r.status}, content-length ${r.headers.get("content-length")} (uploader is ready; nothing published)`);
  else fail(`selftest HEAD → ${r.status} ${r.statusText} — check .env creds / endpoint`);
}

async function main() {
  const args = process.argv.slice(2);
  const env = loadEnv();
  const missing = ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_S3_API_ENDPOINT"].filter((k) => !env[k]);
  if (missing.length) return fail(`upload-media: .env is missing ${missing.join(", ")}`);

  if (args.includes("--selftest")) return selftest(env);

  const go = args.includes("--go");
  const force = args.includes("--force");
  const files = walkFiles(STAGING_DIR).sort();
  if (!files.length) return fail("upload-media: _media_staging/ is empty — run stage-media first");
  step(`upload-media → R2 (${BUCKET})  ${files.length} objects${go ? (force ? ", FORCE" : "") : ", DRY RUN"}`);

  let uploaded = 0, skipped = 0, wouldUpload = 0, bytes = 0;
  for (const src of files) {
    const key = relRoot(src).replace(/^_media_staging\//, "");
    const size = statSync(src).size;
    if (!force && await isLive(key, size)) { skipped++; info(`= ${key} (already live)`); continue; }
    if (!go) { wouldUpload++; bytes += size; log(`  would upload  ${key}  (${(size / 1048576).toFixed(1)} MB)`); continue; }
    await putObject(key, src, env);
    uploaded++; bytes += size;
    info(`+ ${key}  (${(size / 1048576).toFixed(1)} MB)`);
  }
  if (go) ok(`upload-media done: ${uploaded} uploaded, ${skipped} already live (${(bytes / 1048576).toFixed(0)} MB)`);
  else ok(`dry-run: ${wouldUpload} to upload (${(bytes / 1048576).toFixed(0)} MB), ${skipped} already live. Re-run with --go to publish.`);
}

main().catch((e) => fail(e.message));
