// src/backend/lib/storage.ts
// Storage abstraction. Toggle via STORAGE_BACKEND env var:
//   "memory"  — in-memory Map (local dev, next dev persistent process)
//   "vercel"  — Vercel KV + Blob (production)

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
  getImageBuffer(url: string): Promise<Buffer>;
}

// ---- In-Memory Implementation ----

const comicsMap = new Map<string, Comic>();
const imagesMap = new Map<string, Buffer>();

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
    // Return an internal URL that the image serve route can handle
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    return `${base}/api/comic/${comicId}/image/${pageNumber}/${versionIndex}`;
  },

  async getImageBuffer(url) {
    // Extract key from URL: /api/comic/{id}/image/{page}/{version}
    const match = url.match(/\/api\/comic\/([^/]+)\/image\/(\d+)\/(\d+)/);
    if (!match) throw new Error(`Cannot resolve image URL: ${url}`);
    const [, comicId, pageNumber, versionIndex] = match;
    const key = `comics/${comicId}/page-${pageNumber}-v${versionIndex}.png`;
    const buf = imagesMap.get(key);
    if (!buf) throw new Error(`Image not found: ${key}`);
    return buf;
  },
};

// ---- Vercel KV + Blob Implementation ----

async function createVercelAdapter(): Promise<StorageAdapter> {
  const { kv } = await import("@vercel/kv");
  const { put } = await import("@vercel/blob");

  return {
    async getComic(id) {
      const data = await kv.get<string>(`comic:${id}`);
      if (!data) return null;
      return typeof data === "string" ? JSON.parse(data) : (data as Comic);
    },

    async getComicsBatch(ids) {
      const results = await Promise.all(
        ids.map((id) => kv.get<string>(`comic:${id}`))
      );
      return results.flatMap((data) => {
        if (!data) return [];
        const comic =
          typeof data === "string" ? (JSON.parse(data) as Comic) : (data as Comic);
        return [comic];
      });
    },

    async saveComic(comic) {
      await kv.set(`comic:${comic.id}`, JSON.stringify(comic));
    },

    async uploadImage(comicId, pageNumber, versionIndex, imageBuffer) {
      const blob = await put(
        `comics/${comicId}/page-${pageNumber}-v${versionIndex}.png`,
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
