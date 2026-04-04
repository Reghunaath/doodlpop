// src/backend/handlers/export-pdf.ts

import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getStorage } from "../lib/storage";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function handleExportPdf(id: string): Promise<NextResponse> {
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

  const pdfDoc = await PDFDocument.create();

  for (const page of comic.pages) {
    const version = page.versions[page.selectedVersionIndex];
    if (!version) continue;

    const imageBuffer = await storage.getImageBuffer(version.imageUrl);

    // Detect image type by magic bytes and embed accordingly
    const isJpeg =
      imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
    const embeddedImage = isJpeg
      ? await pdfDoc.embedJpg(imageBuffer)
      : await pdfDoc.embedPng(imageBuffer);
    const { width, height } = embeddedImage.scale(1);

    const pdfPage = pdfDoc.addPage([width, height]);
    pdfPage.drawImage(embeddedImage, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  const title = comic.script?.title ?? "comic";
  const filename = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const pdfBuffer = Buffer.from(pdfBytes);

  // Save to local disk in dev mode only
  if (process.env.STORAGE_BACKEND !== "vercel") {
    const outputDir = join(process.cwd(), "generated-pdfs");
    await mkdir(outputDir, { recursive: true });
    const outputPath = join(outputDir, `${filename}-${id.slice(0, 8)}.pdf`);
    await writeFile(outputPath, pdfBuffer);
    console.log(`[PDF] Saved to ${outputPath}`);
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  });
}
