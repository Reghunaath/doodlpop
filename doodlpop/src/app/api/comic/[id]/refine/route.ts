import { handleRefineComic } from "@/backend/handlers/refine-comic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleRefineComic(id, req);
}
