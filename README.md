# Doodlpop

Turn your ideas into AI-generated comics. Describe a story, pick an art style, and Doodlpop writes the script and draws every panel.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Frontend:** React 19, Tailwind CSS 4
- **Text AI:** Google Gemini (`gemini-2.5-flash`) — script generation, Q&A, random ideas
- **Image AI:** Nano Banana Pro (`gemini-3-pro-image-preview`) — comic panel images
- **Storage:** Upstash Redis (metadata) + Vercel Blob (images). In-memory fallback for local dev.
- **Package Manager:** pnpm

---

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A [Google AI Studio](https://aistudio.google.com/) API key

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_google_ai_studio_key
STORAGE_BACKEND=memory           # use "memory" for local dev
KV_REST_API_URL=                 # leave blank for local dev
KV_REST_API_TOKEN=               # leave blank for local dev
BLOB_READ_WRITE_TOKEN=           # leave blank for local dev
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`STORAGE_BACKEND=memory` enables a Map-based in-memory store. Comics won't persist across server restarts, but no Redis or Blob credentials are needed locally.

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push the repo to GitHub and import it into Vercel.
2. In the Vercel dashboard, add the **Upstash Redis** and **Vercel Blob** integrations — they auto-populate `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `BLOB_READ_WRITE_TOKEN`.
3. Add `GEMINI_API_KEY` and set `STORAGE_BACKEND=vercel` and `NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app` as environment variables.
4. Deploy.

---

## User Flow

### Step 1 — Home (`/`)

The landing page presents a large text area to describe your story idea. Two helpers are available:

- **Surprise Me** — generates a random comic idea via AI (falls back to a local list if the API is unavailable).
- **Art Style** — choose from a set of visual styles (e.g., manga, superhero, watercolor).
- **Page Count** — slide to pick how many pages (panels) the comic will have.

Hit **Create My Comic** to begin.

### Step 2 — Q&A (`/create?id=...`)

The AI asks a short series of follow-up questions to sharpen the story — things like character names, tone, and setting details. Answer them one at a time and advance through the wizard.

### Step 3 — Script Review (`/script/[id]`)

The AI generates a full panel-by-panel script based on your prompt and answers. You can:

- Read through every panel's description and dialogue.
- **Edit** individual panels or regenerate the entire script.
- Choose a generation mode:
  - **Automated** — all pages generate back-to-back without interruption.
  - **Supervised** — review and approve each page before the next one generates.

### Step 4 — Generation

Pages are drawn one at a time (sequential, not parallel). A progress indicator shows which page is being generated and what has completed. Each page may have multiple generated versions to choose from.

- **Automated mode** — generation runs unattended. You land on the comic viewer when all pages are done.
- **Supervised mode** (`/review/[id]`) — after each page renders you can accept it, regenerate it (with an optional extra prompt to guide the re-draw), or pick a different version before moving to the next page.

### Step 5 — Comic Viewer (`/comic/[id]`)

The finished comic is displayed in a full reader. From here you can:

- **Browse** pages.
- **Export to PDF** — downloads a client-side generated PDF of all pages.
- **Share** — generates a public QR code / link that anyone can open, even without an account.

### Library (`/library`)

A gallery of every comic you have created in this browser session (tracked via `localStorage`). Click any comic to reopen its viewer.

---

## Project Structure

```
src/
  app/           # Next.js routing (pages + API routes)
  backend/       # Server-side logic (AI pipeline, storage, handlers)
    handlers/    # One file per API route group
    lib/
      ai/        # Gemini client, prompts, script & image generators
      storage.ts # KV + Blob abstraction (swap memory ↔ vercel via env var)
      types.ts   # Shared TypeScript types
  frontend/      # React components, organized by feature
    landing/
    wizard/
    comic-viewer/
    library/
```

API routes all live under `/api/comic/` and are thin wrappers that call the corresponding handler in `src/backend/handlers/`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build locally |
| `pnpm lint` | Run ESLint |
