// src/backend/handlers/random-idea.ts

import { NextResponse } from "next/server";
import { ai } from "../lib/ai/gemini-client";
import { randomIdeaPrompt } from "../lib/ai/prompts";
import { GEMINI_TEXT_MODEL } from "../lib/constants";

export async function handleRandomIdea(): Promise<NextResponse> {
  const response = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: randomIdeaPrompt(),
  });

  const idea = (response.text ?? "").trim();

  if (!idea) {
    return NextResponse.json(
      { error: "Failed to generate idea" },
      { status: 500 }
    );
  }

  return NextResponse.json({ idea });
}
