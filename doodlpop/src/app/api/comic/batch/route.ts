import { handleBatchComics } from "@/backend/handlers/batch-comics";

export async function POST(req: Request) {
  return handleBatchComics(req);
}
