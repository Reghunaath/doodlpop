// src/backend/handlers/regenerate-page.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { generatePageImagePrompt } from "../lib/ai/prompts";
import { generatePageImage } from "../lib/ai/image-generator";
import { GeneratePageRequest, PageVersion } from "../lib/types";
import { MAX_PAGE_REGENERATIONS } from "../lib/constants";

export async function handleRegeneratePage(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: GeneratePageRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pageNumber, feedback } = body;

  if (typeof pageNumber !== "number" || pageNumber < 1) {
    return NextResponse.json({ error: "Invalid pageNumber" }, { status: 400 });
  }

  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (!comic.script) {
    return NextResponse.json({ error: "No script found" }, { status: 409 });
  }

  const page = comic.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) {
    return NextResponse.json(
      { error: `Page ${pageNumber} has not been generated yet` },
      { status: 404 }
    );
  }

  // Max 4 total versions (original + 3 regenerations)
  if (page.versions.length > MAX_PAGE_REGENERATIONS) {
    return NextResponse.json(
      {
        error: `Maximum regeneration limit (${MAX_PAGE_REGENERATIONS}) reached for this page.`,
      },
      { status: 400 }
    );
  }

  const scriptPage = comic.script.pages.find((p) => p.pageNumber === pageNumber);
  if (!scriptPage) {
    return NextResponse.json(
      { error: `Page ${pageNumber} not found in script` },
      { status: 404 }
    );
  }

  // Build reference buffers for consistency
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

  let prompt = generatePageImagePrompt(
    scriptPage,
    comic.artStyle,
    comic.script.title,
    comic.pageCount,
    comic.customStylePrompt,
    hasCharacterSheet,
    hasPreviousPage,
    comic.script.characters
  );

  if (feedback && feedback.trim()) {
    prompt += `\n\nDIRECTOR'S NOTES (apply these changes to the regenerated page):\n${feedback.trim()}`;
  }

  const imageBuffer = await generatePageImage(prompt, refs);
  const versionIndex = page.versions.length;
  const imageUrl = await storage.uploadImage(id, pageNumber, versionIndex, imageBuffer);

  const newVersion: PageVersion = {
    imageUrl,
    generatedAt: new Date().toISOString(),
  };

  page.versions.push(newVersion);
  page.selectedVersionIndex = versionIndex; // Auto-select the new version
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ page });
}
