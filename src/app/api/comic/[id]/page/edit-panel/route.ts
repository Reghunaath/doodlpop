import { handleEditPanel } from "@/backend/handlers/edit-panel-page";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleEditPanel(id, req);
}
