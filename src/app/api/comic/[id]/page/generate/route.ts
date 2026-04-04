import { handleGeneratePage } from "@/backend/handlers/generate-page";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGeneratePage(id, req);
}
