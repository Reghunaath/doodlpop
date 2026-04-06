// Simple static file server for generated comic assets (local dev only).
// Serves files directly from generated/{id}/{filename} on disk.

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; filename: string[] }> }
) {
  const { id, filename } = await params;
  const filePath = path.join(process.cwd(), "generated", id, filename.join("/"));

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buf = fs.readFileSync(filePath);
    return new Response(buf as unknown as BodyInit, {
      headers: { "Content-Type": "image/png" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
