// src/backend/lib/ai/script-generator.ts

import { ai } from "./gemini-client";
import { Script } from "../types";
import { GEMINI_TEXT_MODEL, MAX_PANELS_PER_PAGE, MIN_PANELS_PER_PAGE } from "../constants";

const JSON_RETRY_PROMPT =
  "Your previous response was not valid JSON. Please try again with ONLY valid JSON, no markdown fences or extra text.";

async function callGeminiText(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: prompt,
  });
  return response.text ?? "";
}

function parseScriptJSON(raw: string): Script {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned) as Script;
}

function validateScript(script: Script, expectedPageCount: number): void {
  if (!script.title || typeof script.title !== "string") {
    throw new Error("Script missing title");
  }
  if (!Array.isArray(script.pages)) {
    throw new Error("Script missing pages array");
  }
  if (script.pages.length !== expectedPageCount) {
    throw new Error(
      `Script has ${script.pages.length} pages but expected ${expectedPageCount}`
    );
  }
  for (const page of script.pages) {
    if (!Array.isArray(page.panels)) {
      throw new Error(`Page ${page.pageNumber} missing panels array`);
    }
    if (
      page.panels.length < MIN_PANELS_PER_PAGE ||
      page.panels.length > MAX_PANELS_PER_PAGE
    ) {
      throw new Error(
        `Page ${page.pageNumber} has ${page.panels.length} panels (must be ${MIN_PANELS_PER_PAGE}–${MAX_PANELS_PER_PAGE})`
      );
    }
  }
}

export async function generateScript(
  prompt: string,
  expectedPageCount: number
): Promise<Script> {
  const raw = await callGeminiText(prompt);

  let script: Script;
  try {
    script = parseScriptJSON(raw);
  } catch {
    // Retry once with correction prompt
    const retryRaw = await callGeminiText(JSON_RETRY_PROMPT);
    script = parseScriptJSON(retryRaw);
  }

  validateScript(script, expectedPageCount);
  return script;
}
