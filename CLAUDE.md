# CLAUDE.md — Doodlpop

## 1. Tech Stack

- **Framework:** Next.js 15 (App Router). Single repo for frontend and backend.
- **Language:** TypeScript. Strict mode enabled.
- **Frontend:** React 19, Tailwind CSS 4. shadcn/ui is acceptable if needed.
- **Text AI:** Google Gemini (`gemini-2.5-flash`) via `@google/genai` SDK. Used for script generation, follow-up questions, and random idea generation.
- **Image AI:** Nano Banana Pro (`gemini-3-pro-image-preview`) via the same SDK. Used for comic page image generation.
- **Storage:** Upstash Redis (`@upstash/redis`) for comic metadata (JSON), Vercel Blob for generated images. In-memory fallback for local dev (see `STORAGE_BACKEND` env var). Upstash Redis is created via the Vercel dashboard — env vars `KV_REST_API_URL` and `KV_REST_API_TOKEN` are auto-populated when linked.
- **PDF Export:** `jspdf` client-side.
- **Package Manager:** pnpm.
- **Deployment:** Vercel.

## 2. Project Structure

Next.js App Router. Single repo. `src/` is split into three areas: `app/` (Next.js routing), `backend/` (API logic, AI pipeline, storage, types), and `frontend/` (React components).

- **`src/app/`** — Next.js routing only. Page files owned by the frontend developer. API route files (`src/app/api/`) are thin handlers that import and call logic from `src/backend/`.
- **`src/backend/`** — All backend logic. Owned by the backend developer.
  - `src/backend/lib/types.ts` — Shared TypeScript types (source of truth for both devs).
  - `src/backend/lib/constants.ts` — App-wide constants.
  - `src/backend/lib/storage.ts` — Storage abstraction (KV + Blob / in-memory).
  - `src/backend/lib/ai/` — Gemini client, prompts, script generator, image generator.
  - `src/backend/handlers/` — Actual request handler logic, one file per route group.
- **`src/frontend/`** — All React components. Owned by the frontend developer.
  - Organized by feature: `landing/`, `wizard/`, `library/`, `comic-viewer/`, `ui/`.
- The `@google/genai` SDK is used server-side only (`src/backend/`). Never import it in `src/frontend/` or client components.

## 3. Technical PRD Is the Source of Truth

The file `doodlpop-technical-prd.md` in the project root contains all technical requirements: architecture, data models, API contracts, AI pipeline details, prompt templates, and development epics.

**Reference that file for:** API request/response shapes, data model definitions, prompt strategies, endpoint behavior, storage layer design, and the exact scope of each epic.

⚠️ **IMPORTANT:** Follow the PRD exactly. Do not add features, screens, API routes, or UI elements not described in the PRD or the current epic being worked on.

⚠️ **IMPORTANT:** If you need to deviate from the PRD for any reason (technical limitation, ambiguity, better approach), STOP and inform me in highlighted text before proceeding. Do not silently deviate.

⚠️ **IMPORTANT:** If any requirement in the PRD is unclear or missing detail, ASK a clarifying question before implementing. Do not guess.

⚠️ **IMPORTANT:** If the user decides to deviate from the PRD or this CLAUDE.md at any point (changing a feature, swapping a technology, altering the API contract, adjusting scope), update BOTH `doodlpop-technical-prd.md` and `CLAUDE.md` to reflect the change BEFORE writing any implementation code. These documents must always describe the current plan, not the original plan. Stale docs are worse than no docs.

## 4. Code Quality

- All code must be TypeScript. No `.js` files.
- No `any` types unless absolutely necessary and documented with a comment explaining why.
- Use interfaces/types from `src/lib/types.ts` for all API request/response shapes, data models, and component props. Do not duplicate type definitions.
- Keep components small and focused. One component per file.
- Use custom hooks for shared logic (API calls, polling, localStorage management).
- Use concise variable names in dense logic but descriptive names for props, state, and functions.
- All API route handlers should validate inputs before processing. Return `{ error: string }` with appropriate HTTP status codes on failure.
- All Gemini calls that expect JSON responses must wrap `JSON.parse()` in try/catch and retry once on parse failure.

## 5. UI/UX Rules

- Desktop-first, but must be usable on mobile.
- Generous whitespace. Do not crowd elements.
- Border radius: 6–8px on cards, inputs, and badges.
- Minimal shadows. Prefer borders.
- Font: Inter or system sans-serif stack.
- Every screen must handle four states: loading, error, empty, and populated.
- Image generation is slow. All generation steps must show clear progress indicators with contextual messages (not just a spinner).
- The wizard flow must feel linear and guided. The user should always know what step they're on and what comes next.
- Do not use emojis in the UI unless they are part of comic content.

## 6. API and Data

- All API routes prefixed with `/api/comic/`.
- Use UUIDv4 for all comic IDs (generated server-side).
- Comic metadata stored as JSON in Vercel KV under the key pattern `comic:{id}`.
- Generated images uploaded to Vercel Blob under the path pattern `comics/{comicId}/page-{pageNumber}-v{versionIndex}.png`.
- All image URLs returned by the API must be publicly accessible Blob URLs (no auth required) so shared comics work.
- No authentication. No cookies. No sessions. Comic ownership is tracked client-side via localStorage only.

## 7. AI Integration Rules

- The `@google/genai` SDK must only be instantiated once via a singleton in `src/backend/lib/ai/gemini-client.ts`.
- All prompt templates live in `src/backend/lib/ai/prompts.ts` as exported functions that accept comic data and return prompt strings. Do not inline prompts in route handlers.
- For text generation (scripts, questions, ideas): use `gemini-2.5-flash`. Always request JSON output and include "Respond with ONLY valid JSON" in the system prompt.
- For image generation: use `gemini-3-pro-image-preview` with `responseModalities: ["IMAGE"]`, `aspectRatio: "2:3"`, and `imageSize: "1K"`.
- Never call the Gemini API or Nano Banana Pro from client-side code. All AI calls go through API routes.
- Image generation responses return base64 data in `part.inlineData.data`. Convert to a Buffer and upload to Vercel Blob. Do not store base64 strings in KV.
- Generate pages sequentially, not in parallel. This avoids rate limit issues and keeps resource usage predictable.

## 8. Build Order

Development is split into three epics. Each epic produces a working, demoable product. Full details for each epic are in Section 16 of `doodlpop-technical-prd.md`.

⚠️ **IMPORTANT:** Complete the current epic fully before starting the next. After completing each epic, STOP and inform me what was done. Wait for my approval before starting the next epic.

⚠️ **IMPORTANT:** Do not build features from a future epic. If a component references something that doesn't exist yet (like the share button in Epic 1), omit it entirely rather than adding a placeholder.

**Epic 1 — Core Generation Loop**
Idea input → script generation → automated generation → comic viewer. Straight-line happy path only. No follow-up questions, no script editing, no supervised mode, no library, no sharing, no export.

**Epic 2 — Creative Control**
Random idea generator, follow-up questions, script editing and regeneration, supervised mode with page regeneration and version selection. The full creation experience.

**Epic 3 — Library, Sharing, and Export**
Library page, share via public link, PDF export, production storage (Vercel KV + Blob).

## 9. Do NOT Build

- User accounts, authentication, or login
- Dark mode
- Settings page
- Collaborative or multi-user features
- Community feed or public gallery
- Post-generation panel or dialogue editing
- Animation or sound in the comic reader
- Mobile native app (web only)
- Social login or OAuth
- Analytics or tracking
- Comments or reactions on shared comics
- Anything not explicitly described in the PRD or current epic

## 10. Storage Rules

- **Local dev:** Use `STORAGE_BACKEND=memory` env var to enable in-memory storage (Map-based). This works because `next dev` runs a persistent Node process.
- **Production (Vercel):** Use `STORAGE_BACKEND=vercel` to enable Vercel KV + Blob. This is required for deployment since serverless functions are stateless.
- The storage abstraction in `src/backend/lib/storage.ts` must expose a clean interface. Route handlers import from storage.ts and never call KV or Blob directly.
- Save comic state to KV after every mutation (page generated, status change, version selected). Do not batch saves or defer them.
- After each page is generated in automated mode, save progress immediately. This ensures partial state survives if the serverless function times out.

## 11. Environment Variables

```env
GEMINI_API_KEY=               # Google AI Studio API key
STORAGE_BACKEND=memory        # "memory" for local dev, "vercel" for production
KV_REST_API_URL=              # Vercel KV (auto-set when linked in Vercel dashboard)
KV_REST_API_TOKEN=            # Vercel KV (auto-set when linked)
BLOB_READ_WRITE_TOKEN=        # Vercel Blob (auto-set when linked)
NEXT_PUBLIC_BASE_URL=         # e.g. http://localhost:3000 or https://doodlpop.vercel.app
```

`.env.example` must list all variables with placeholder values. `.env.local` is gitignored.

## 12. Git Workflow

⚠️ **IMPORTANT:** Always ask for confirmation before making any `git commit` or `git push`. Do not commit or push automatically after completing changes. Show what will be committed and wait for explicit approval.

## 13. File Management

- Keep `README.md` updated with setup instructions, how to run locally, and how to deploy.
- `doodlpop-technical-prd.md` in the project root is the technical spec. Do not modify it without explicit approval.
- `.gitignore`: `node_modules/`, `.next/`, `.env.local`, `.vercel/`.
