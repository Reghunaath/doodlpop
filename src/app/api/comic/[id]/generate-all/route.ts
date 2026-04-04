import { handleGenerateAll } from "@/backend/handlers/generate-all";

export const maxDuration = 300; // 5 min on Vercel Pro; set to 60 on Hobby plan

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGenerateAll(id);
}
