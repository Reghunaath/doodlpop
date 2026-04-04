import { handleApproveComic } from "@/backend/handlers/approve-comic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleApproveComic(id, req);
}
