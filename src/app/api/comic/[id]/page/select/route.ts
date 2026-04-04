import { handleSelectPage } from "@/backend/handlers/select-page";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleSelectPage(id, req);
}
