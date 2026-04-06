// src/backend/handlers/share-pdf.ts

import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getStorage } from "../lib/storage";

export async function handleSharePdf(id: string): Promise<NextResponse> {
  const storage = await getStorage();
  const comic = await storage.getComic(id);

  if (!comic) {
    return NextResponse.json({ error: "Comic not found" }, { status: 404 });
  }
  if (comic.status !== "complete") {
    return NextResponse.json(
      { error: "Comic is not complete yet" },
      { status: 409 }
    );
  }
  if (comic.pages.length === 0) {
    return NextResponse.json({ error: "No pages found" }, { status: 409 });
  }

  // Generate PDF
  const pdfDoc = await PDFDocument.create();

  for (const page of comic.pages) {
    const version = page.versions[page.selectedVersionIndex];
    if (!version) continue;

    const imageBuffer = await storage.getImageBuffer(version.imageUrl);
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

  // Upload to Vercel Blob
  try {
    const { put } = await import("@vercel/blob");
    const title = comic.script?.title ?? "comic";
    const filename = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const blob = await put(
      `comics/${id}/${filename}.pdf`,
      pdfBuffer,
      { access: "public", contentType: "application/pdf" }
    );

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[share-pdf] Blob upload failed:", err);
    return NextResponse.json(
      { error: `Blob upload failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
