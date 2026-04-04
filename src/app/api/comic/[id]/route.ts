import { handleGetComic } from "@/backend/handlers/get-comic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetComic(id);
}
