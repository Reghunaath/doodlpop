// src/backend/handlers/generate-all.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { generatePageImagePrompt } from "../lib/ai/prompts";
import { generatePageImage } from "../lib/ai/image-generator";
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

  // Generate pages sequentially to avoid rate limits
  for (const scriptPage of comic.script.pages) {
    const prompt = generatePageImagePrompt(
      scriptPage,
      comic.artStyle,
      comic.script.title,
      comic.pageCount,
      comic.customStylePrompt
    );

    const imageBuffer = await generatePageImage(prompt);
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
  }

  comic.status = "complete";
  comic.updatedAt = new Date().toISOString();
  await storage.saveComic(comic);

  return NextResponse.json({ comic });
}
