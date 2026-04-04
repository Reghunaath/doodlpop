// src/backend/handlers/batch-comics.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { BatchComicsRequest, Comic, ComicSummary } from "../lib/types";
import { MAX_BATCH_IDS } from "../lib/constants";

function toSummary(comic: Comic): ComicSummary {
  const firstPage = comic.pages[0];
  const thumbnailUrl =
    firstPage?.versions[firstPage.selectedVersionIndex]?.imageUrl ?? null;

  return {
    id: comic.id,
    status: comic.status,
    createdAt: comic.createdAt,
    updatedAt: comic.updatedAt,
    title: comic.script?.title ?? null,
    artStyle: comic.artStyle,
    ...(comic.customStylePrompt ? { customStylePrompt: comic.customStylePrompt } : {}),
    pageCount: comic.pageCount,
    thumbnailUrl,
  };
}

export async function handleBatchComics(req: Request): Promise<NextResponse> {
  let body: BatchComicsRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { ids } = body;

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
  }
  if (ids.length > MAX_BATCH_IDS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BATCH_IDS} IDs per request` },
      { status: 400 }
    );
  }

  const storage = await getStorage();
  const comics = await storage.getComicsBatch(ids);
  const summaries = comics.map(toSummary);

  return NextResponse.json({ comics: summaries });
}
