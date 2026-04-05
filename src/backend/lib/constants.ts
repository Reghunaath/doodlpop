// src/backend/lib/constants.ts

export const MAX_PAGES = 15;
export const MIN_PAGES = 1;
export const MAX_PANELS_PER_PAGE = 6;
export const MIN_PANELS_PER_PAGE = 2;
export const MAX_PAGE_REGENERATIONS = 3; // 3 regens = 4 total versions
export const MAX_FOLLOW_UP_QUESTIONS = 5;
export const MAX_BATCH_IDS = 50;

export const ART_STYLE_PRESETS = {
  manga: {
    label: "Manga",
    description: "Japanese manga style with expressive characters and dynamic compositions",
    promptFragment:
      "Japanese manga ink style: high contrast black-and-white, clean lineart with variable stroke width, screentone shading for midtones, speed lines for motion, expressive oversized eyes, sharp angular shadows, dramatic camera angles, no color",
  },
  western_comic: {
    label: "Western Comic",
    description: "Bold American comic book style with vivid colors",
    promptFragment:
      "American superhero comic style: bold black outlines with consistent line weight, vivid saturated colors, dynamic foreshortened poses, halftone dot shading, dramatic rim lighting, strong color holds, expressive action lines",
  },
  watercolor_storybook: {
    label: "Watercolor Storybook",
    description: "Soft, dreamy watercolor illustrations",
    promptFragment:
      "Soft watercolor storybook style: gentle pastel color palette, flowing wet-on-wet brushstrokes, soft diffused lighting, visible paper texture, delicate linework, warm dreamy atmosphere, subtle color bleeding at edges",
  },
  minimalist_flat: {
    label: "Minimalist / Flat",
    description: "Clean, simple flat illustrations with limited colors",
    promptFragment:
      "Minimalist flat illustration style: simple geometric shapes, strictly limited color palette of 4-5 colors, clean uniform line weight, no gradients or textures, flat solid fills, generous negative space, modern graphic design aesthetic",
  },
  vintage_newspaper: {
    label: "Vintage Newspaper",
    description: "Retro newspaper comic strip aesthetic",
    promptFragment:
      "Vintage newspaper comic strip style: muted desaturated colors, prominent Ben-Day dot pattern, retro hand-lettered text style, yellowed paper texture, thick brush-stroke outlines, simple mid-century character designs, warm sepia undertones",
  },
} as const;

export const IMAGE_ASPECT_RATIO = "2:3";  // Portrait for comic pages
export const IMAGE_RESOLUTION = "1K";     // Balance of quality and speed

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
export const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";
