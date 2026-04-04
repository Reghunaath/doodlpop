import { handleCreateComic } from "@/backend/handlers/create-comic";

export async function POST(req: Request) {
  return handleCreateComic(req);
}
