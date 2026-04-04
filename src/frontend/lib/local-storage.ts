// src/frontend/lib/local-storage.ts
// Manages the doodlpop_my_comics localStorage key for tracking user's comics.

import type { ComicStatus } from "@/backend/lib/types";

const STORAGE_KEY = "doodlpop_my_comics";

export interface SavedComic {
  comicId: string;
  title: string;
  createdAt: string;
  status: ComicStatus;
}

function readAll(): SavedComic[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedComic[];
  } catch {
    return [];
  }
}

function writeAll(comics: SavedComic[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comics));
}

export function getSavedComics(): SavedComic[] {
  return readAll();
}

export function addSavedComic(comic: SavedComic): void {
  const all = readAll();
  // Avoid duplicates
  if (all.some((c) => c.comicId === comic.comicId)) return;
  all.unshift(comic); // Most recent first
  writeAll(all);
}

export function updateSavedComic(comicId: string, updates: Partial<SavedComic>): void {
  const all = readAll();
  const idx = all.findIndex((c) => c.comicId === comicId);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates };
  writeAll(all);
}

export function removeSavedComic(comicId: string): void {
  const all = readAll().filter((c) => c.comicId !== comicId);
  writeAll(all);
}
