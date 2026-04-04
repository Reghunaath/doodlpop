// src/backend/handlers/get-comic.ts

import { NextResponse } from "next/server";
import { getStorage } from "../lib/storage";

export async function handleGetComic(id: string): Promise<NextResponse> {
  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }

  return NextResponse.json({ comic });
}
