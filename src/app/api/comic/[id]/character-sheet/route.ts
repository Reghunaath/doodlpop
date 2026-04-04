// Serves character sheet from in-memory storage during local development.
// In production, character sheets are served directly from Vercel Blob URLs.

import { getStorage } from "@/backend/lib/storage";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/comic/${id}/character-sheet`;

  try {
    const storage = await getStorage();
    const buffer = await storage.getImageBuffer(url);
    return new Response(buffer as unknown as BodyInit, {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return NextResponse.json({ error: "Character sheet not found" }, { status: 404 });
  }
}
