// src/backend/handlers/generate-all.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { generatePageImagePrompt, characterSheetPrompt } from "../lib/ai/prompts";
import { generatePageImage, generateCharacterSheet } from "../lib/ai/image-generator";
import { Page, PageVersion } from "../lib/types";

export async function handleGenerateAll(id: string): Promise<NextResponse> {
  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "script_approved") {
    return NextResponse.json(
      { error: `Cannot generate all pages in status "${comic.status}"` },
      { status: 409 }
    );
  }
  if (comic.generationMode !== "automated") {
    return NextResponse.json(
      { error: "This endpoint is for automated mode only" },
      { status: 409 }
    );
  }
  if (!comic.script) {
    return NextResponse.json({ error: "No script found" }, { status: 409 });
  }

  comic.status = "generating";
  comic.updatedAt = new Date().toISOString();
  await storage.saveComic(comic);

  // Step 1: Generate character reference sheet
  let characterSheetBuffer: Buffer | null = null;
  try {
    const sheetPrompt = characterSheetPrompt(
      comic.script,
      comic.artStyle,
      comic.customStylePrompt
    );
    characterSheetBuffer = await generateCharacterSheet(sheetPrompt);
    const sheetUrl = await storage.uploadCharacterSheet(id, characterSheetBuffer);
    comic.characterSheetUrl = sheetUrl;
    comic.updatedAt = new Date().toISOString();
    await storage.saveComic(comic);
    console.log(`[generate-all] Character sheet generated for comic ${id}`);
  } catch (err) {
    // Non-fatal — proceed without character sheet
    console.warn(`[generate-all] Character sheet generation failed: ${err}`);
  }

  // Step 2: Generate pages sequentially
  // Pass character sheet + previous page as visual references for consistency
  let prevPageBuffer: Buffer | null = null;

  for (const scriptPage of comic.script.pages) {
    // Build reference buffers: character sheet first, then previous page
    const refs: Buffer[] = [];
    const hasCharacterSheet = !!characterSheetBuffer;
    const hasPreviousPage = !!prevPageBuffer;
    if (characterSheetBuffer) refs.push(characterSheetBuffer);
    if (prevPageBuffer) refs.push(prevPageBuffer);

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
    prevPageBuffer = imageBuffer;

    const versionIndex = 0;
    const imageUrl = await storage.uploadImage(
      id,
      scriptPage.pageNumber,
      versionIndex,
      imageBuffer
    );

    const version: PageVersion = {
      imageUrl,
      generatedAt: new Date().toISOString(),
    };

    const page: Page = {
      pageNumber: scriptPage.pageNumber,
      versions: [version],
      selectedVersionIndex: 0,
    };

    comic.pages.push(page);
    comic.updatedAt = new Date().toISOString();

    // Save after each page so partial progress survives timeout
    await storage.saveComic(comic);
    console.log(`[generate-all] Page ${scriptPage.pageNumber}/${comic.pageCount} done`);
  }

  comic.status = "complete";
  comic.updatedAt = new Date().toISOString();
  await storage.saveComic(comic);

  return NextResponse.json({ comic });
}
