// src/backend/handlers/regenerate-script.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { regenerateScriptPrompt } from "../lib/ai/prompts";
import { generateScript } from "../lib/ai/script-generator";
import { RegenerateScriptRequest } from "../lib/types";

export async function handleRegenerateScript(
  id: string,
  req: Request
): Promise<NextResponse> {
  let body: RegenerateScriptRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { feedback } = body;

  if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
    return NextResponse.json({ error: "feedback is required" }, { status: 400 });
  }

  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "script_draft") {
    return NextResponse.json(
      { error: `Cannot regenerate script in status "${comic.status}"` },
      { status: 409 }
    );
  }
  if (!comic.script) {
    return NextResponse.json(
      { error: "No existing script to regenerate from" },
      { status: 409 }
    );
  }

  const prompt = regenerateScriptPrompt(
    comic.prompt,
    comic.artStyle,
    comic.pageCount,
    comic.script,
    feedback.trim(),
    comic.followUpAnswers
  );

  const script = await generateScript(prompt, comic.pageCount);

  comic.script = script;
  // Keep status as script_draft
  comic.updatedAt = new Date().toISOString();

  await storage.saveComic(comic);

  return NextResponse.json({ script });
}
