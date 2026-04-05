// src/backend/lib/storage.ts
// Storage abstraction. Toggle via STORAGE_BACKEND env var:
//   "memory"  — in-memory Map (local dev, next dev persistent process)
//   "vercel"  — Vercel KV + Blob (production)

import fs from "fs";
import path from "path";
import { Comic } from "./types";

export interface StorageAdapter {
  getComic(id: string): Promise<Comic | null>;
  getComicsBatch(ids: string[]): Promise<Comic[]>;
  saveComic(comic: Comic): Promise<void>;
  uploadImage(
    comicId: string,
    pageNumber: number,
    versionIndex: number,
    imageBuffer: Buffer
  ): Promise<string>; // returns public URL
  uploadCharacterSheet(comicId: string, imageBuffer: Buffer): Promise<string>; // returns public URL
  getImageBuffer(url: string): Promise<Buffer>;
}

// ---- In-Memory Implementation ----
// Use global to share state across Next.js route module instances in dev mode.

declare global {
  // eslint-disable-next-line no-var
  var _doodlpopComics: Map<string, Comic> | undefined;
  // eslint-disable-next-line no-var
  var _doodlpopImages: Map<string, Buffer> | undefined;
}

const comicsMap = (global._doodlpopComics ??= new Map<string, Comic>());
const imagesMap = (global._doodlpopImages ??= new Map<string, Buffer>());

const memoryAdapter: StorageAdapter = {
  async getComic(id) {
    return comicsMap.get(id) ?? null;
  },

  async getComicsBatch(ids) {
    return ids.flatMap((id) => {
      const comic = comicsMap.get(id);
      return comic ? [comic] : [];
    });
  },

  async saveComic(comic) {
    comicsMap.set(comic.id, comic);
  },

  async uploadImage(comicId, pageNumber, versionIndex, imageBuffer) {
    const key = `comics/${comicId}/page-${pageNumber}-v${versionIndex}.png`;
    imagesMap.set(key, imageBuffer);

    // Save to disk for local inspection
    try {
      const dir = path.join(process.cwd(), "generated", comicId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `page-${pageNumber}-v${versionIndex}.png`), imageBuffer);
    } catch {
      // Non-fatal
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    return `${base}/api/comic/${comicId}/image/${pageNumber}/${versionIndex}`;
  },

  async uploadCharacterSheet(comicId, imageBuffer) {
    const key = `comics/${comicId}/character-sheet.png`;
    imagesMap.set(key, imageBuffer);

    // Save to disk for local inspection
    try {
      const dir = path.join(process.cwd(), "generated", comicId);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "character-sheet.png"), imageBuffer);
    } catch {
      // Non-fatal
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    return `${base}/api/comic/${comicId}/character-sheet`;
  },

  async getImageBuffer(url) {
    // Character sheet URL: /api/comic/{id}/character-sheet
    const sheetMatch = url.match(/\/api\/comic\/([^/]+)\/character-sheet/);
    if (sheetMatch) {
      const key = `comics/${sheetMatch[1]}/character-sheet.png`;
      const buf = imagesMap.get(key);
      if (!buf) throw new Error(`Character sheet not found: ${key}`);
      return buf;
    }
    // Page image URL: /api/comic/{id}/image/{page}/{version}
    const pageMatch = url.match(/\/api\/comic\/([^/]+)\/image\/(\d+)\/(\d+)/);
    if (!pageMatch) throw new Error(`Cannot resolve image URL: ${url}`);
    const [, comicId, pageNumber, versionIndex] = pageMatch;
    const key = `comics/${comicId}/page-${pageNumber}-v${versionIndex}.png`;
    const buf = imagesMap.get(key);
    if (!buf) throw new Error(`Image not found: ${key}`);
    return buf;
  },
};

// ---- Upstash Redis + Vercel Blob Implementation ----

async function createVercelAdapter(): Promise<StorageAdapter> {
  const { Redis } = await import("@upstash/redis");
  const { put } = await import("@vercel/blob");

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  return {
    async getComic(id) {
      const data = await redis.get<string>(`comic:${id}`);
      if (!data) return null;
      return typeof data === "string" ? JSON.parse(data) : (data as Comic);
    },

    async getComicsBatch(ids) {
      const results = await Promise.all(
        ids.map((id) => redis.get<string>(`comic:${id}`))
      );
      return results.flatMap((data) => {
        if (!data) return [];
        const comic =
          typeof data === "string" ? (JSON.parse(data) as Comic) : (data as Comic);
        return [comic];
      });
    },

    async saveComic(comic) {
      await redis.set(`comic:${comic.id}`, JSON.stringify(comic));
    },

    async uploadImage(comicId, pageNumber, versionIndex, imageBuffer) {
      const blob = await put(
        `comics/${comicId}/page-${pageNumber}-v${versionIndex}.png`,
        imageBuffer,
        { access: "public", contentType: "image/png" }
      );
      return blob.url;
    },

    async uploadCharacterSheet(comicId, imageBuffer) {
      const blob = await put(
        `comics/${comicId}/character-sheet.png`,
        imageBuffer,
        { access: "public", contentType: "image/png" }
      );
      return blob.url;
    },

    async getImageBuffer(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
      return Buffer.from(await res.arrayBuffer());
    },
  };
}

// ---- Singleton ----

let _adapter: StorageAdapter | null = null;

export async function getStorage(): Promise<StorageAdapter> {
  if (_adapter) return _adapter;

  const backend = process.env.STORAGE_BACKEND ?? "memory";

  if (backend === "vercel") {
    _adapter = await createVercelAdapter();
  } else {
    _adapter = memoryAdapter;
  }

  return _adapter;
}
