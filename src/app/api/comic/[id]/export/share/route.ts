import { handleSharePdf } from "@/backend/handlers/share-pdf";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleSharePdf(id);
}
