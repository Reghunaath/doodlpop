import { handleExportPdfUrl } from "@/backend/handlers/export-pdf-url";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleExportPdfUrl(id);
}
