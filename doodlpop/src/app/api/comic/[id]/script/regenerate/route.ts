import { handleRegenerateScript } from "@/backend/handlers/regenerate-script";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleRegenerateScript(id, req);
}
