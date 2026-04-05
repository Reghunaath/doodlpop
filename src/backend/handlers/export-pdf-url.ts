// src/backend/handlers/export-pdf-url.ts
// Generates the comic PDF, uploads it to public storage, caches + returns the URL.

import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getStorage } from "../lib/storage";

export async function handleExportPdfUrl(id: string): Promise<NextResponse> {
  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "complete") {
    return NextResponse.json({ error: "Comic is not complete yet" }, { status: 409 });
  }
  if (comic.pages.length === 0) {
    return NextResponse.json({ error: "No pages found" }, { status: 409 });
  }

  // Return cached URL if available
  if (comic.pdfUrl) {
    console.log(`[pdf-url] Returning cached URL for comic ${id}: ${comic.pdfUrl}`);
    return NextResponse.json({ url: comic.pdfUrl });
  }

  console.log(`[pdf-url] Building PDF for comic ${id} (${comic.pages.length} pages)...`);
  console.log(`[pdf-url] STORAGE_BACKEND=${process.env.STORAGE_BACKEND ?? "memory"}`);
  console.log(`[pdf-url] NEXT_PUBLIC_BASE_URL=${process.env.NEXT_PUBLIC_BASE_URL ?? "(not set)"}`);

  // Build PDF
  const pdfDoc = await PDFDocument.create();
  const sortedPages = [...comic.pages].sort((a, b) => a.pageNumber - b.pageNumber);

  for (const page of sortedPages) {
    const version = page.versions[page.selectedVersionIndex];
    if (!version) {
      console.log(`[pdf-url] Page ${page.pageNumber}: no version found, skipping`);
      continue;
    }
    console.log(`[pdf-url] Page ${page.pageNumber}: fetching image from ${version.imageUrl}`);
    const imageBuffer = await storage.getImageBuffer(version.imageUrl);
    console.log(`[pdf-url] Page ${page.pageNumber}: image fetched (${imageBuffer.length} bytes)`);
    const isJpeg = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
    const embeddedImage = isJpeg
      ? await pdfDoc.embedJpg(imageBuffer)
      : await pdfDoc.embedPng(imageBuffer);
    const { width, height } = embeddedImage.scale(1);
    const pdfPage = pdfDoc.addPage([width, height]);
    pdfPage.drawImage(embeddedImage, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  console.log(`[pdf-url] PDF built (${pdfBuffer.length} bytes), uploading...`);

  // Upload to public storage and cache the URL
  const pdfUrl = await storage.uploadPdf(id, pdfBuffer);
  console.log(`[pdf-url] Upload complete. Public URL: ${pdfUrl}`);

  comic.pdfUrl = pdfUrl;
  comic.updatedAt = new Date().toISOString();
  await storage.saveComic(comic);

  return NextResponse.json({ url: pdfUrl });
}
