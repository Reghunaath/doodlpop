// src/backend/handlers/generate-page.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { generatePageImagePrompt, characterSheetPrompt } from "../lib/ai/prompts";
import { generatePageImage, generateCharacterSheet } from "../lib/ai/image-generator";
import { GeneratePageRequest, Page, PageVersion } from "../lib/types";

export async function handleGeneratePage(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: GeneratePageRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pageNumber } = body;

  if (typeof pageNumber !== "number" || pageNumber < 1) {
    return NextResponse.json({ error: "Invalid pageNumber" }, { status: 400 });
  }

  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (
    comic.status !== "script_approved" &&
    comic.status !== "generating"
  ) {
    return NextResponse.json(
      { error: `Cannot generate page in status "${comic.status}"` },
      { status: 409 }
    );
  }
  if (comic.generationMode !== "supervised") {
    return NextResponse.json(
      { error: "This endpoint is for supervised mode only" },
      { status: 409 }
    );
  }
  if (!comic.script) {
    return NextResponse.json({ error: "No script found" }, { status: 409 });
  }

  const scriptPage = comic.script.pages.find((p) => p.pageNumber === pageNumber);
  if (!scriptPage) {
    return NextResponse.json(
      { error: `Page ${pageNumber} not found in script` },
      { status: 404 }
    );
  }

  // Generate character sheet on first page if not already created
  if (!comic.characterSheetUrl) {
    try {
      const sheetPrompt = characterSheetPrompt(
        comic.script,
        comic.artStyle,
        comic.customStylePrompt
      );
      const sheetBuffer = await generateCharacterSheet(sheetPrompt);
      const sheetUrl = await storage.uploadCharacterSheet(id, sheetBuffer);
      comic.characterSheetUrl = sheetUrl;
      comic.updatedAt = new Date().toISOString();
      await storage.saveComic(comic);
      console.log(`[generate-page] Character sheet generated for comic ${id}`);
    } catch (err) {
      // Non-fatal — proceed without character sheet
      console.warn(`[generate-page] Character sheet generation failed: ${err}`);
    }
  }

  // Build reference buffers: character sheet + previous page (if any)
  const refs: Buffer[] = [];
  let hasCharacterSheet = false;
  if (comic.characterSheetUrl) {
    try {
      const sheetBuffer = await storage.getImageBuffer(comic.characterSheetUrl);
      refs.push(sheetBuffer);
      hasCharacterSheet = true;
    } catch {
      // Non-fatal
    }
  }
  let hasPreviousPage = false;
  const prevPage = comic.pages.find((p) => p.pageNumber === pageNumber - 1);
  if (prevPage) {
    try {
      const prevBuffer = await storage.getImageBuffer(
        prevPage.versions[prevPage.selectedVersionIndex].imageUrl
      );
      refs.push(prevBuffer);
      hasPreviousPage = true;
    } catch {
      // Non-fatal
    }
  }

  const prompt = generatePageImagePrompt(
    scriptPage,
    comic.artStyle,
    comic.script.title,
    comic.pageCount,
    comic.customStylePrompt,
    hasCharacterSheet,
    hasPreviousPage
  );

  const imageBuffer = await generatePageImage(prompt, refs);
  const versionIndex = 0;
  const imageUrl = await storage.uploadImage(id, pageNumber, versionIndex, imageBuffer);

  const version: PageVersion = {
    imageUrl,
    generatedAt: new Date().toISOString(),
  };

  const page: Page = {
    pageNumber,
    versions: [version],
    selectedVersionIndex: 0,
  };

  // Add or replace page entry
  const existingIndex = comic.pages.findIndex((p) => p.pageNumber === pageNumber);
  if (existingIndex >= 0) {
    comic.pages[existingIndex] = page;
  } else {
    comic.pages.push(page);
  }

  comic.status = "generating";
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ page });
}
