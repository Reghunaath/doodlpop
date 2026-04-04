import { handleRandomIdea } from "@/backend/handlers/random-idea";

export async function GET() {
  return handleRandomIdea();
}
