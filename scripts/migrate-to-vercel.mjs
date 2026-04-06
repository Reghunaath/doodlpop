/**
 * migrate-to-vercel.mjs
 *
 * One-time migration: uploads all completed local comics to Vercel Blob + Upstash Redis.
 *
 * Usage:
 *   node scripts/migrate-to-vercel.mjs
 *
 * Requires these env vars (loaded from .env.local automatically):
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 *   BLOB_READ_WRITE_TOKEN
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
  console.log("Loaded .env.local\n");
}

// ── Validate env vars ────────────────────────────────────────────────────────
const missing = ["KV_REST_API_URL", "KV_REST_API_TOKEN", "BLOB_READ_WRITE_TOKEN"].filter(
  (k) => !process.env[k]
);
if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  console.error("Add them to .env.local and try again.");
  process.exit(1);
}

// ── Imports (after env is set) ───────────────────────────────────────────────
const { put } = await import("@vercel/blob");
const { Redis } = await import("@upstash/redis");

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// ── Migration ────────────────────────────────────────────────────────────────
const generatedDir = path.join(ROOT, "generated");

if (!fs.existsSync(generatedDir)) {
  console.error("No generated/ folder found.");
  process.exit(1);
}

const entries = fs.readdirSync(generatedDir, { withFileTypes: true }).filter((e) => e.isDirectory());
const completed = entries.filter((e) => {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(generatedDir, e.name, "metadata.json"), "utf-8"));
    return meta.status === "complete";
  } catch { return false; }
});

console.log(`Found ${completed.length} completed comic(s) to migrate.\n`);

let successCount = 0;

for (const entry of completed) {
  const id = entry.name;
  const metadataPath = path.join(generatedDir, id, "metadata.json");
  const comic = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

  console.log(`── ${comic.script?.title ?? id} (${id})`);

  // Upload character sheet
  const sheetPath = path.join(generatedDir, id, "character-sheet.png");
  if (fs.existsSync(sheetPath)) {
    try {
      const blob = await put(
        `comics/${id}/character-sheet.png`,
        fs.readFileSync(sheetPath),
        { access: "public", contentType: "image/png" }
      );
      comic.characterSheetUrl = blob.url;
      console.log(`   ✓ character-sheet.png`);
    } catch (e) {
      console.warn(`   ✗ character-sheet.png failed:`, e.message);
    }
  }

  // Upload page images and update imageUrls
  for (const page of comic.pages) {
    for (let vi = 0; vi < page.versions.length; vi++) {
      const filename = `page-${page.pageNumber}-v${vi}.png`;
      const imgPath = path.join(generatedDir, id, filename);
      if (!fs.existsSync(imgPath)) continue;

      try {
        const blob = await put(
          `comics/${id}/${filename}`,
          fs.readFileSync(imgPath),
          { access: "public", contentType: "image/png" }
        );
        page.versions[vi].imageUrl = blob.url;
        console.log(`   ✓ ${filename}`);
      } catch (e) {
        console.warn(`   ✗ ${filename} failed:`, e.message);
      }
    }
  }

  // Write updated comic to Redis
  try {
    await redis.set(`comic:${id}`, JSON.stringify(comic));
    console.log(`   ✓ Saved to Redis\n`);
    successCount++;
  } catch (e) {
    console.error(`   ✗ Redis write failed:`, e.message);
  }
}

console.log(`Migration complete: ${successCount}/${completed.length} comics migrated.`);
