// src/frontend/lib/api.ts
// Centralized API client for all frontend-to-backend communication.

import type {
  CreateComicRequest,
  CreateComicResponse,
  RefineComicRequest,
  GenerateScriptResponse,
  RegenerateScriptRequest,
  ApproveComicRequest,
  GeneratePageRequest,
  GeneratePageResponse,
  EditPanelRequest,
  SelectPageVersionRequest,
  GenerateAllResponse,
  RandomIdeaResponse,
  BatchComicsResponse,
  Comic,
  ErrorResponse,
} from "@/backend/lib/types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body: ErrorResponse = await res.json();
      if (body.error) message = body.error;
    } catch {
      // Use default message
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

// POST /api/comic
export function createComic(req: CreateComicRequest): Promise<CreateComicResponse> {
  return apiFetch("/api/comic", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// GET /api/comic/[id]
export function getComic(id: string): Promise<{ comic: Comic }> {
  return apiFetch(`/api/comic/${id}`);
}

// POST /api/comic/[id]/refine
export function refineComic(id: string, req: RefineComicRequest): Promise<{ success: true }> {
  return apiFetch(`/api/comic/${id}/refine`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// POST /api/comic/[id]/script/generate
export function generateScript(id: string): Promise<GenerateScriptResponse> {
  return apiFetch(`/api/comic/${id}/script/generate`, {
    method: "POST",
  });
}

// POST /api/comic/[id]/script/regenerate
export function regenerateScript(
  id: string,
  req: RegenerateScriptRequest
): Promise<GenerateScriptResponse> {
  return apiFetch(`/api/comic/${id}/script/regenerate`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// PUT /api/comic/[id]/approve
export function approveComic(id: string, req: ApproveComicRequest): Promise<{ success: true }> {
  return apiFetch(`/api/comic/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

// POST /api/comic/[id]/page/generate
export function generatePage(id: string, req: GeneratePageRequest): Promise<GeneratePageResponse> {
  return apiFetch(`/api/comic/${id}/page/generate`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// POST /api/comic/[id]/page/regenerate
export function regeneratePage(
  id: string,
  req: GeneratePageRequest
): Promise<GeneratePageResponse> {
  return apiFetch(`/api/comic/${id}/page/regenerate`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// PUT /api/comic/[id]/page/select
export function selectPageVersion(
  id: string,
  req: SelectPageVersionRequest
): Promise<{ success: true }> {
  return apiFetch(`/api/comic/${id}/page/select`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

// POST /api/comic/[id]/page/edit-panel
export function editPanel(
  id: string,
  req: EditPanelRequest
): Promise<GeneratePageResponse> {
  return apiFetch(`/api/comic/${id}/page/edit-panel`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// POST /api/comic/[id]/generate-all
export function generateAll(id: string): Promise<GenerateAllResponse> {
  return apiFetch(`/api/comic/${id}/generate-all`, {
    method: "POST",
  });
}

// POST /api/comic/batch
export function batchComics(ids: string[]): Promise<BatchComicsResponse> {
  return apiFetch("/api/comic/batch", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// GET /api/comic/random-idea
export async function getRandomIdea(): Promise<string> {
  const data = await apiFetch<RandomIdeaResponse>("/api/comic/random-idea");
  return data.idea;
}
