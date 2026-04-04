// src/backend/handlers/select-page.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { SelectPageVersionRequest } from "../lib/types";

export async function handleSelectPage(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: SelectPageVersionRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pageNumber, versionIndex } = body;

  if (typeof pageNumber !== "number" || pageNumber < 1) {
    return NextResponse.json({ error: "Invalid pageNumber" }, { status: 400 });
  }
  if (typeof versionIndex !== "number" || versionIndex < 0) {
    return NextResponse.json({ error: "Invalid versionIndex" }, { status: 400 });
  }

  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }

  const page = comic.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) {
    return NextResponse.json(
      { error: `Page ${pageNumber} not found` },
      { status: 404 }
    );
  }
  if (versionIndex >= page.versions.length) {
    return NextResponse.json(
      { error: `Version index ${versionIndex} does not exist` },
      { status: 400 }
    );
  }

  page.selectedVersionIndex = versionIndex;

  // If all pages have been generated and this was the last selection, mark complete
  const allPagesGenerated = comic.pages.length === comic.pageCount;
  if (allPagesGenerated) {
    comic.status = "complete";
  }

  comic.updatedAt = new Date().toISOString();
  await storage.saveComic(comic);

  return NextResponse.json({ success: true });
}
