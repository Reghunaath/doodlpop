// ============================================================
// Core Types — src/backend/lib/types.ts
// Owned by the backend developer. Both developers import from here.
// ============================================================

export type ComicStatus =
  | "input"           // Comic created, awaiting follow-up answers or skip
  | "script_pending"  // Follow-ups submitted, script not yet generated
  | "script_draft"    // Script generated, awaiting user review
  | "script_approved" // Script approved, generation mode selected
  | "generating"      // Image generation in progress
  | "complete";       // All pages generated

export type GenerationMode = "supervised" | "automated";

export type ArtStylePreset =
  | "manga"
  | "western_comic"
  | "watercolor_storybook"
  | "minimalist_flat"
  | "vintage_newspaper"
  | "custom";

export interface Comic {
  id: string;                              // UUIDv4
  status: ComicStatus;
  createdAt: string;                       // ISO 8601
  updatedAt: string;                       // ISO 8601

  // User input
  prompt: string;
  artStyle: ArtStylePreset;
  customStylePrompt?: string;              // Only when artStyle === "custom"
  pageCount: number;                       // 1–15

  // Follow-up questions
  followUpQuestions?: FollowUpQuestion[];
  followUpAnswers?: Record<string, string>; // questionId -> answer

  // Script
  script?: Script;

  // Generation
  generationMode?: GenerationMode;
  pages: Page[];
  currentPageIndex: number;               // Tracks progress in supervised mode

  // Character reference sheet (generated before pages for consistency)
  characterSheetUrl?: string;
}

export interface FollowUpQuestion {
  id: string;       // e.g. "q1", "q2"
  question: string;
}

export interface CharacterDescription {
  name: string;
  appearance: string;   // Physical traits: height, build, hair, skin, distinguishing features
  clothing: string;     // Default outfit
  personality: string;  // Key traits (informs expressions/poses in images)
}

export interface Script {
  title: string;
  synopsis: string;
  characters?: CharacterDescription[];
  pages: ScriptPage[];
}

export interface ScriptPage {
  pageNumber: number;  // 1-indexed
  panels: ScriptPanel[];
}

export interface ScriptPanel {
  panelNumber: number; // 1-indexed within the page
  description: string; // Visual description (used for image gen prompt)
  dialogue: DialogueLine[];
  caption?: string | null; // Narrator text
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface Page {
  pageNumber: number;
  versions: PageVersion[];         // Max 4 (original + 3 regenerations)
  selectedVersionIndex: number;    // Which version the user picked
}

export interface PageVersion {
  imageUrl: string;     // Vercel Blob URL
  generatedAt: string;  // ISO 8601
}

// ============================================================
// API Request / Response Types
// ============================================================

export interface CreateComicRequest {
  prompt: string;
  artStyle: ArtStylePreset;
  customStylePrompt?: string | null;
  pageCount: number;
}

export interface CreateComicResponse {
  comicId: string;
  followUpQuestions: FollowUpQuestion[];
}

export interface RefineComicRequest {
  answers: Record<string, string>;
}

export interface GenerateScriptResponse {
  script: Script;
}

export interface RegenerateScriptRequest {
  feedback: string;
}

export interface ApproveComicRequest {
  script: Script;
  generationMode: GenerationMode;
}

export interface GeneratePageRequest {
  pageNumber: number;
}

export interface GeneratePageResponse {
  page: Page;
}

export interface SelectPageVersionRequest {
  pageNumber: number;
  versionIndex: number;
}

export interface GenerateAllResponse {
  comic: Comic;
}

export interface ComicSummary {
  id: string;
  status: ComicStatus;
  createdAt: string;
  updatedAt: string;
  title: string | null;
  artStyle: ArtStylePreset;
  customStylePrompt?: string;
  pageCount: number;
  thumbnailUrl: string | null;
}

export interface BatchComicsRequest {
  ids: string[];
}

export interface BatchComicsResponse {
  comics: ComicSummary[];
}

export interface RandomIdeaResponse {
  idea: string;
}

export interface ErrorResponse {
  error: string;
}
