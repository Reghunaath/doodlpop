import { handleRegeneratePage } from "@/backend/handlers/regenerate-page";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleRegeneratePage(id, req);
}
