// src/backend/lib/ai/image-generator.ts
// Server-side only. Never import in client components.

import { ai } from "./gemini-client";
import { GEMINI_IMAGE_MODEL, IMAGE_ASPECT_RATIO, IMAGE_RESOLUTION } from "../constants";

function detectMimeType(buf: Buffer): string {
  // JPEG: FF D8
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  // WebP: RIFF....WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49) return "image/webp";
  return "image/png";
}

export async function generatePageImage(
  prompt: string,
  referenceBuffers: Buffer[] = []
): Promise<Buffer> {
  // Build multimodal parts: reference images first, then the text prompt
  const parts: object[] = [
    ...referenceBuffers.map((buf) => ({
      inlineData: {
        data: buf.toString("base64"),
        mimeType: detectMimeType(buf),
      },
    })),
    { text: prompt },
  ];

  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: IMAGE_ASPECT_RATIO,
        imageSize: IMAGE_RESOLUTION,
      },
    },
  });

  const responseParts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of responseParts) {
    if ((part as { inlineData?: { data?: string } }).inlineData?.data) {
      return Buffer.from(
        (part as { inlineData: { data: string } }).inlineData.data,
        "base64"
      );
    }
  }

  throw new Error("No image returned from image generation model");
}

export async function generateCharacterSheet(prompt: string): Promise<Buffer> {
  return generatePageImage(prompt, []); // No references for the sheet itself
}
