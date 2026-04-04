// src/backend/lib/ai/image-generator.ts
// Server-side only. Never import in client components.

import { ai } from "./gemini-client";
import { GEMINI_IMAGE_MODEL, IMAGE_ASPECT_RATIO, IMAGE_RESOLUTION } from "../constants";

export async function generatePageImage(prompt: string): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: IMAGE_ASPECT_RATIO,
        imageSize: IMAGE_RESOLUTION,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image returned from image generation model");
}
