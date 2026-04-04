// src/backend/handlers/refine-comic.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { RefineComicRequest } from "../lib/types";

export async function handleRefineComic(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: RefineComicRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { answers } = body;

  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return NextResponse.json(
      { error: "answers must be an object" },
      { status: 400 }
    );
  }

  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "input") {
    return NextResponse.json(
      { error: `Cannot refine comic in status "${comic.status}"` },
      { status: 409 }
    );
  }

  comic.followUpAnswers = answers;
  comic.status = "script_pending";
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ success: true });
}
