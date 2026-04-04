// src/backend/lib/ai/gemini-client.ts
// Server-side only. Never import this in client components.

import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
