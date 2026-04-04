// src/backend/handlers/generate-script.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { generateScriptPrompt } from "../lib/ai/prompts";
import { generateScript } from "../lib/ai/script-generator";

export async function handleGenerateScript(id: string): Promise<NextResponse> {
  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "script_pending") {
    return NextResponse.json(
      { error: `Cannot generate script in status "${comic.status}"` },
      { status: 409 }
    );
  }

  const prompt = generateScriptPrompt(
    comic.prompt,
    comic.artStyle,
    comic.pageCount,
    comic.followUpAnswers
  );

  const script = await generateScript(prompt, comic.pageCount);

  comic.script = script;
  comic.status = "script_draft";
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ script });
}
