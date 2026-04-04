import { handleExportPdf } from "@/backend/handlers/export-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleExportPdf(id);
}
