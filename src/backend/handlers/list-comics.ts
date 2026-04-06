// src/backend/handlers/list-comics.ts

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { Comic, ComicSummary } from "../lib/types";

function comicToSummary(comic: Comic): ComicSummary {
  // Use the first page's selected version as thumbnail.
  // Prefer Vercel Blob URLs (absolute) as-is; local API URLs are made relative
  // so they work regardless of which port the dev server runs on.
  const firstPage = [...comic.pages].sort((a, b) => a.pageNumber - b.pageNumber)[0];
  let thumbnailUrl: string | null = null;
  if (firstPage) {
    const stored = firstPage.versions[firstPage.selectedVersionIndex]?.imageUrl ?? null;
    if (stored) {
      // Absolute Vercel Blob URL → keep as-is. Local API URL → strip origin.
      thumbnailUrl = stored.startsWith("http")
        ? (stored.includes("vercel-storage.com") || stored.includes("blob.vercel") ? stored : new URL(stored).pathname)
        : stored;
    }
  }
  return {
    id: comic.id,
    status: comic.status,
    createdAt: comic.createdAt,
    updatedAt: comic.updatedAt,
    title: comic.script?.title ?? null,
    artStyle: comic.artStyle,
    customStylePrompt: comic.customStylePrompt,
    pageCount: comic.pageCount,
    thumbnailUrl,
  };
}

// ── Vercel (Redis + Blob) path ───────────────────────────────────────────────

async function listFromRedis(): Promise<NextResponse> {
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  // Scan all comic keys. For a small app this is fine.
  const keys: string[] = await redis.keys("comic:*");
  if (keys.length === 0) return NextResponse.json({ comics: [] });

  const results = await Promise.all(
    keys.map((k) => redis.get<string>(k))
  );

  const comics: ComicSummary[] = [];
  for (const data of results) {
    if (!data) continue;
    try {
      const comic: Comic = typeof data === "string" ? JSON.parse(data) : (data as Comic);
      if (comic.status !== "complete") continue;
      comics.push(comicToSummary(comic));
    } catch {
      // Skip malformed
    }
  }

  comics.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ comics });
}

// ── Local (filesystem) path ──────────────────────────────────────────────────

async function listFromDisk(): Promise<NextResponse> {
  const generatedDir = path.join(process.cwd(), "generated");

  if (!fs.existsSync(generatedDir)) {
    return NextResponse.json({ comics: [] });
  }

  const entries = fs.readdirSync(generatedDir, { withFileTypes: true });
  const comics: ComicSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const id = entry.name;

    if (!fs.existsSync(path.join(generatedDir, id, "page-1-v0.png"))) continue;

    const metadataPath = path.join(generatedDir, id, "metadata.json");
    if (!fs.existsSync(metadataPath)) continue;

    try {
      const comic: Comic = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      if (comic.status !== "complete") continue;

      // Rehydrate in-memory map so /api/comic/:id works after restart
      const comicsMap = (global._doodlpopComics ??= new Map<string, Comic>());
      if (!comicsMap.has(comic.id)) comicsMap.set(comic.id, comic);

      comics.push({
        ...comicToSummary(comic),
        // Always use fresh relative file URL for local thumbnails
        thumbnailUrl: `/api/comic/${id}/file/page-1-v0.png`,
      });
    } catch {
      // Skip malformed metadata
    }
  }

  comics.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ comics });
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function handleListComics(): Promise<NextResponse> {
  if (process.env.STORAGE_BACKEND === "vercel") {
    return listFromRedis();
  }
  return listFromDisk();
}
