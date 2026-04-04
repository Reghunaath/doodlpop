// src/backend/handlers/create-comic.ts

import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";
import { ai } from "../lib/ai/gemini-client";
import { followUpQuestionsPrompt } from "../lib/ai/prompts";
import {
  Comic,
  CreateComicRequest,
  CreateComicResponse,
  FollowUpQuestion,
} from "../lib/types";
import {
  MAX_PAGES,
  MIN_PAGES,
  GEMINI_TEXT_MODEL,
  MAX_FOLLOW_UP_QUESTIONS,
} from "../lib/constants";

const VALID_ART_STYLES = [
  "manga",
  "western_comic",
  "watercolor_storybook",
  "minimalist_flat",
  "vintage_newspaper",
  "custom",
];

export async function handleCreateComic(req: Request): Promise<NextResponse> {
  let body: CreateComicRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, artStyle, customStylePrompt, pageCount } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  if (!VALID_ART_STYLES.includes(artStyle)) {
    return NextResponse.json({ error: "Invalid artStyle" }, { status: 400 });
  }
  if (artStyle === "custom" && !customStylePrompt?.trim()) {
    return NextResponse.json(
      { error: "customStylePrompt is required when artStyle is custom" },
      { status: 400 }
    );
  }
  if (
    typeof pageCount !== "number" ||
    pageCount < MIN_PAGES ||
    pageCount > MAX_PAGES
  ) {
    return NextResponse.json(
      { error: `pageCount must be between ${MIN_PAGES} and ${MAX_PAGES}` },
      { status: 400 }
    );
  }

  // Generate follow-up questions via Gemini
  let followUpQuestions: FollowUpQuestion[] = [];
  try {
    const promptText = followUpQuestionsPrompt(prompt, artStyle, pageCount);
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: promptText,
    });
    const raw = (response.text ?? "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(raw) as FollowUpQuestion[];
    followUpQuestions = parsed.slice(0, MAX_FOLLOW_UP_QUESTIONS);
  } catch {
    // Non-fatal: proceed with empty questions
    followUpQuestions = [];
  }

  const now = new Date().toISOString();
  const comic: Comic = {
    id: uuidv4(),
    status: "input",
    createdAt: now,
    updatedAt: now,
    prompt: prompt.trim(),
    artStyle,
    ...(customStylePrompt ? { customStylePrompt } : {}),
    pageCount,
    followUpQuestions,
    pages: [],
    currentPageIndex: 0,
  };

  const storage = await getStorage();
  await storage.saveComic(comic);

  const responseBody: CreateComicResponse = {
    comicId: comic.id,
    followUpQuestions: comic.followUpQuestions ?? [],
  };

  return NextResponse.json(responseBody, { status: 201 });
}
