import { handleListComics } from "@/backend/handlers/list-comics";

export async function GET() {
  return handleListComics();
}
