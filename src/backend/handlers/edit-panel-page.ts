// src/backend/handlers/edit-panel-page.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { panelEditImagePrompt } from "../lib/ai/prompts";
import { generatePageImage } from "../lib/ai/image-generator";
import { EditPanelRequest, PageVersion } from "../lib/types";
import { MAX_PAGE_REGENERATIONS } from "../lib/constants";

export async function handleEditPanel(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: EditPanelRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pageNumber, panelNumber, newDescription } = body;

  if (typeof pageNumber !== "number" || pageNumber < 1) {
    return NextResponse.json({ error: "Invalid pageNumber" }, { status: 400 });
  }
  if (typeof panelNumber !== "number" || panelNumber < 1) {
    return NextResponse.json({ error: "Invalid panelNumber" }, { status: 400 });
  }
  if (!newDescription || typeof newDescription !== "string" || !newDescription.trim()) {
    return NextResponse.json({ error: "newDescription is required" }, { status: 400 });
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

  if (page.versions.length > MAX_PAGE_REGENERATIONS) {
    return NextResponse.json(
      { error: `Maximum version limit (${MAX_PAGE_REGENERATIONS}) reached for this page.` },
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

  if (!scriptPage.panels.find((p) => p.panelNumber === panelNumber)) {
    return NextResponse.json(
      { error: `Panel ${panelNumber} not found on page ${pageNumber}` },
      { status: 404 }
    );
  }

  // Build reference buffers: [characterSheet, currentPageImage]
  const refs: Buffer[] = [];

  if (comic.characterSheetUrl) {
    try {
      refs.push(await storage.getImageBuffer(comic.characterSheetUrl));
    } catch {
      // Non-fatal — generation continues without character sheet
    }
  }

  // Current page image as second reference (model uses it to keep other panels identical)
  const currentImageUrl = page.versions[page.selectedVersionIndex]?.imageUrl;
  if (currentImageUrl) {
    try {
      refs.push(await storage.getImageBuffer(currentImageUrl));
    } catch {
      // Non-fatal
    }
  }

  const prompt = panelEditImagePrompt(
    scriptPage,
    comic.artStyle,
    comic.script.title,
    comic.pageCount,
    panelNumber,
    newDescription.trim(),
    comic.customStylePrompt,
    comic.script.characters
  );

  const imageBuffer = await generatePageImage(prompt, refs);
  const versionIndex = page.versions.length;
  const imageUrl = await storage.uploadImage(id, pageNumber, versionIndex, imageBuffer);

  const newVersion: PageVersion = {
    imageUrl,
    generatedAt: new Date().toISOString(),
  };

  page.versions.push(newVersion);
  page.selectedVersionIndex = versionIndex;
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ page });
}
