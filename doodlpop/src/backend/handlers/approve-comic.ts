// src/backend/handlers/approve-comic.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { ApproveComicRequest, Script } from "../lib/types";
import { MAX_PANELS_PER_PAGE, MIN_PANELS_PER_PAGE } from "../lib/constants";

function validateScript(script: Script, expectedPageCount: number): string | null {
  if (!script?.title || !Array.isArray(script.pages)) {
    return "Invalid script structure";
  }
  if (script.pages.length !== expectedPageCount) {
    return `Script must have exactly ${expectedPageCount} pages`;
  }
  for (const page of script.pages) {
    if (
      !Array.isArray(page.panels) ||
      page.panels.length < MIN_PANELS_PER_PAGE ||
      page.panels.length > MAX_PANELS_PER_PAGE
    ) {
      return `Page ${page.pageNumber} must have ${MIN_PANELS_PER_PAGE}–${MAX_PANELS_PER_PAGE} panels`;
    }
  }
  return null;
}

export async function handleApproveComic(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: ApproveComicRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { script, generationMode } = body;

  if (!["supervised", "automated"].includes(generationMode)) {
    return NextResponse.json(
      { error: "generationMode must be supervised or automated" },
      { status: 400 }
    );
  }

  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "script_draft") {
    return NextResponse.json(
      { error: `Cannot approve comic in status "${comic.status}"` },
      { status: 409 }
    );
  }

  const validationError = validateScript(script, comic.pageCount);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  comic.script = script;
  comic.generationMode = generationMode;
  comic.status = "script_approved";
  comic.pages = [];
  comic.currentPageIndex = 0;
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ success: true });
}
