# Plan: Panel Editing Strategy for Doodlpop

## Context

The user wants to edit a **specific panel** within a generated comic page image, rather than regenerating the entire page. The file `reference/panel_edit.txt` lists 4 approaches. This plan analyses each against the actual backend pipeline and recommends the best fit.

---

## How the System Currently Works

| Fact | Detail |
|------|--------|
| Model | `gemini-3-pro-image-preview` (Nano Banana Pro) via `@google/genai` SDK |
| Granularity | **One image per PAGE** — all panels composited into a single image |
| Prompt | "Render this as a SINGLE comic book page with clearly defined panel borders" |
| Reference images | Already supported — `generatePageImage(prompt, referenceBuffers[])` sends character sheet + previous page as inline data |
| Panel coordinates | **Not stored.** The model decides layout. Only `ScriptPanel.panelNumber` + `description` exist in data |
| Existing edit path | User can regenerate a full page (stored as a new version in `Page.versions[]`) |

Key files:
- `src/backend/lib/ai/image-generator.ts` — `generatePageImage()`
- `src/backend/lib/ai/prompts.ts` — `generatePageImagePrompt()`, `characterSheetPrompt()`
- `src/backend/handlers/generate-page.ts` — supervised single-page generation
- `src/backend/handlers/generate-all.ts` — automated batch generation

---

## Analysis of the 4 Approaches

### 1. Canvas-Mask (Inpainting) — NOT RECOMMENDED

- The `editImage()` API exists in the SDK but uses **Imagen 3** (`imagen-3.0-capability-001`), a completely different model than the one generating pages.
- **Fatal flaw: model mismatch.** The inpainted region would look stylistically different from surrounding panels because it's rendered by a different model.
- Also requires panel coordinates (which we don't have).

### 2. Crop-and-Stitch — NOT RECOMMENDED

- Requires panel coordinates (not stored — would need user selection or auto-detection).
- Cropping isolates the panel from page context, losing narrative flow.
- Stitching introduces seam artifacts (border widths, text rendering differences).
- Individual panel aspect ratios vary, but API is fixed at `2:3`.

### 3. Layers & Compositional UI — NOT RECOMMENDED (now)

- Requires complete pipeline restructure: generate each panel individually, composite client-side.
- 2–6x more API calls per page (cost + latency).
- Current prompt holistically manages layout, gutter spacing, and speech bubbles — splitting panels apart loses this.
- Appropriate for a v2, not a feature addition.

### 4. Reference-Guided Regeneration — PARTIALLY SUITABLE

- Already how the system works (character sheet + prev page references).
- But regenerates ALL panels, not just the target one. Unchanged panels shift due to model non-determinism.
- Users will notice panels they approved have changed.

---

## Recommendation: Approach 5 — Prompt-Guided Page Regeneration (Hybrid of 1 + 4)

A **fifth approach** not listed in the file, but the best fit for this system:

> Send the **current page image** as a visual reference alongside a modified prompt that explicitly tells the model to preserve all panels except the target one.

### Why This Wins

| Criterion | Score | Reason |
|-----------|-------|--------|
| API compatible | Yes | Uses the same `generateContent()` with `responseModalities: ["IMAGE"]` — zero new API methods |
| Needs coordinates | **No** | User selects by panel number (from script data). Model understands "Panel 3" spatially by looking at the reference image |
| Model consistent | Yes | Same `gemini-3-pro-image-preview` that created the page also edits it |
| Code changes | Low | `generatePageImage(prompt, refs)` doesn't change. Only a new prompt template + handler |
| Reuses existing infra | Yes | Version mechanism (`Page.versions[]`, `selectedVersionIndex`) handles undo/compare |

### How It Works

1. User picks a panel by **number** (buttons/dropdown from `scriptPage.panels[]` — no coordinate detection needed)
2. User provides a new description (or modifies existing dialogue/caption)
3. Backend builds a modified prompt: standard `generatePageImagePrompt()` output + prepended instruction:
   > *"This is a revision of an existing page. The reference image shows the current version. Keep Panels 1, 2, 4 IDENTICAL to the reference image. Only regenerate Panel 3 with the following change: [new description]. Maintain the exact same art style, character designs, panel layout, and borders."*
4. Sends `[currentPageImage, characterSheet]` as `referenceBuffers` to `generatePageImage()`
5. Result stored as a new version on the `Page` object (up to 4 versions, same as current regeneration)
6. If user accepts, optionally update `ScriptPanel.description` in stored script

### Honest Limitation

The model may subtly alter "unchanged" panels since it regenerates the full image. Mitigated by:
- Providing the actual page image as a strong visual reference (unlike Approach 4)
- Explicit preservation language in the prompt
- Version mechanism lets user compare/reject if changes are too large

---

## Implementation (if proceeding)

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/backend/lib/ai/prompts.ts` | Add `regeneratePanelPrompt()` function |
| `src/backend/lib/types.ts` | Add `RegeneratePanelRequest` type |
| `src/backend/handlers/regenerate-panel.ts` | New handler (pattern from `regenerate-page.ts`) |
| `src/app/api/comic/[id]/panel/regenerate/route.ts` | New API route |
| `src/frontend/comic-viewer/SupervisedViewer.tsx` | Add panel selection UI (numbered buttons + description editor) |

### New Prompt Template (sketch)

```typescript
export function regeneratePanelPrompt(
  scriptPage: ScriptPage,
  targetPanelNumber: number,
  newDescription: string,
  artStyle: ArtStylePreset,
  comicTitle: string,
  totalPages: number,
  customStylePrompt?: string
): string {
  // Build the standard page prompt BUT flag the target panel's new description
  // Prepend: "A reference image of the current page is provided.
  //           Keep all panels IDENTICAL to the reference except Panel {N}."
  // For target panel: use newDescription instead of original
  // For other panels: append "(KEEP IDENTICAL TO REFERENCE)"
}
```

### Handler Flow (sketch)

```
1. Load comic from storage
2. Validate: status is "generating" or "script_approved", page exists
3. Fetch current page image buffer from storage (the version being edited)
4. Fetch character sheet buffer from storage
5. Build prompt via regeneratePanelPrompt()
6. Call generatePageImage(prompt, [currentPageBuffer, characterSheetBuffer])
7. Upload new image to blob storage
8. Add as new version to Page.versions[]
9. Save comic state
10. Return the new PageVersion
```

---

## Verification

1. Type check: `npx tsc --noEmit`
2. Test manually: call `POST /api/comic/{id}/panel/regenerate` with `{ pageNumber: 1, panelNumber: 2, newDescription: "..." }`
3. Compare the returned image against the original — panels 1, 3+ should be visually identical; panel 2 should reflect the new description
4. Verify the version is added to `Page.versions[]` and selectable in supervised viewer
