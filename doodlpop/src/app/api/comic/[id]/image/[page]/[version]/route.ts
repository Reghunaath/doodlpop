// Serves images from in-memory storage during local development.
// In production (Vercel Blob), images are served directly from public Blob URLs
// and this route is never called.

import { getStorage } from "@/backend/lib/storage";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; page: string; version: string }> }
) {
  const { id, page, version } = await params;

  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/comic/${id}/image/${page}/${version}`;

  try {
    const storage = await getStorage();
    const buffer = await storage.getImageBuffer(url);
    return new Response(buffer as unknown as BodyInit, {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
