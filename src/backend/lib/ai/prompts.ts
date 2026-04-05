// src/backend/lib/ai/prompts.ts
// All prompt template functions. Accept comic data, return prompt strings.

import { ArtStylePreset, CharacterDescription, Script, ScriptPage } from "../types";
import { ART_STYLE_PRESETS, IMAGE_ASPECT_RATIO } from "../constants";

function getArtStyleDescription(
  artStyle: ArtStylePreset,
  customStylePrompt?: string
): string {
  if (artStyle === "custom") {
    return customStylePrompt ?? "custom illustration style";
  }
  return ART_STYLE_PRESETS[artStyle].promptFragment;
}

// ---- Stage 1: Follow-Up Question Generation ----

export function followUpQuestionsPrompt(
  prompt: string,
  artStyle: ArtStylePreset,
  pageCount: number
): string {
  return `You are a creative comic book editor. Given a user's comic idea, generate up to 5 short follow-up questions that would help personalize the story. Focus on character details, setting specifics, tone, and plot preferences. Do NOT ask about art style or length — those are already decided.

Respond with ONLY a JSON array of objects with "id" and "question" fields. No other text.

Example:
[
  {"id": "q1", "question": "What's the main character's personality like?"},
  {"id": "q2", "question": "Should the ending be happy, bittersweet, or a cliffhanger?"}
]

User's idea: "${prompt}"
Art style: "${artStyle}"
Number of pages: ${pageCount}`;
}

// ---- Stage 2: Random Idea Generation ----

export function randomIdeaPrompt(): string {
  return `Generate a single creative, fun, and specific comic book premise in one to two sentences. Be imaginative and varied — mix genres, settings, and characters. Do not repeat common tropes. Return ONLY the premise text, nothing else.`;
}

// ---- Stage 3: Script Generation ----

export function generateScriptPrompt(
  prompt: string,
  artStyle: ArtStylePreset,
  pageCount: number,
  followUpAnswers?: Record<string, string>
): string {
  const formattedAnswers =
    followUpAnswers && Object.keys(followUpAnswers).length > 0
      ? Object.entries(followUpAnswers)
          .map(([, answer]) => `- ${answer}`)
          .join("\n")
      : "No additional details provided.";

  return `You are a professional comic book writer. Write a complete comic script based on the user's input.

Rules:
- The script MUST have exactly ${pageCount} pages.
- Each page MUST have between 2 and 6 panels.
- Each panel MUST include a "description" field with a detailed visual description suitable for an AI image generator. Include character appearances, poses, expressions, camera angles, lighting, and background details.
- Dialogue should be natural and fit the genre.
- Captions are optional narrator text.
- The story must have a clear beginning, middle, and end.
- Include a "characters" array listing every named character in the story with detailed, consistent visual descriptions. These descriptions will be used as reference for image generation, so be very specific about visual details.
- Respond with ONLY valid JSON matching this exact structure, no other text:

{
  "title": "string",
  "synopsis": "string (2-3 sentences)",
  "characters": [
    {
      "name": "Character Name",
      "appearance": "Detailed physical description: age, height, build, hair color and style, eye color, skin tone, distinguishing features",
      "clothing": "Default outfit: specific garments, colors, accessories",
      "personality": "2-3 key personality traits that affect expressions and body language"
    }
  ],
  "pages": [
    {
      "pageNumber": 1,
      "panels": [
        {
          "panelNumber": 1,
          "description": "Detailed visual description...",
          "dialogue": [{"speaker": "Name", "text": "What they say"}],
          "caption": "Optional narrator text or null"
        }
      ]
    }
  ]
}

User's idea: "${prompt}"
Art style: "${artStyle}"
Number of pages: ${pageCount}
Additional details from the user:
${formattedAnswers}`;
}

// ---- Stage 4: Script Regeneration ----

export function regenerateScriptPrompt(
  prompt: string,
  artStyle: ArtStylePreset,
  pageCount: number,
  currentScript: Script,
  feedback: string,
  followUpAnswers?: Record<string, string>
): string {
  const base = generateScriptPrompt(prompt, artStyle, pageCount, followUpAnswers);
  return `${base}

Here is the current script that the user wants revised:
${JSON.stringify(currentScript, null, 2)}

The user's feedback on what to change:
"${feedback}"

Rewrite the script incorporating this feedback while keeping the same structure requirements.`;
}

// ---- Character Sheet Generation ----

export function characterSheetPrompt(
  script: Script,
  artStyle: ArtStylePreset,
  customStylePrompt?: string
): string {
  const artStyleDescription = getArtStyleDescription(artStyle, customStylePrompt);

  let characterBlock: string;

  if (script.characters && script.characters.length > 0) {
    // Use rich descriptions from script generation
    characterBlock = script.characters
      .map((char, i) => {
        const details = [
          `Appearance: ${char.appearance}`,
          char.clothing ? `Clothing: ${char.clothing}` : null,
          char.personality ? `Personality (inform expressions): ${char.personality}` : null,
        ]
          .filter(Boolean)
          .join("\n   ");
        return `${i + 1}. ${char.name}\n   ${details}\n   Show: front view, side view, and one expressive pose. Label clearly.`;
      })
      .join("\n");
  } else {
    // Fallback: extract from dialogue speakers (backward compat)
    const characterNames = new Set<string>();
    for (const page of script.pages) {
      for (const panel of page.panels) {
        for (const line of panel.dialogue) {
          if (line.speaker && line.speaker.trim()) {
            characterNames.add(line.speaker.trim());
          }
        }
      }
    }
    characterBlock = Array.from(characterNames)
      .map(
        (name, i) =>
          `${i + 1}. ${name} — show front view, side view, and one expressive pose. Label each character clearly.`
      )
      .join("\n");
  }

  return `Generate a character reference sheet in ${artStyleDescription} style.

This sheet will be used as a visual reference for generating comic book pages. Draw each character clearly on a clean background.

Characters to include:
${characterBlock}

Important:
- Clean white or neutral background.
- Show each character at full body scale.
- Make character designs distinct and memorable.
- Style must be: ${artStyleDescription}
- This is a reference sheet, not a comic page — no panels, no speech bubbles, no story.`;
}

// ---- Stage 5: Panel Image Generation ----

export function generatePageImagePrompt(
  scriptPage: ScriptPage,
  artStyle: ArtStylePreset,
  comicTitle: string,
  totalPages: number,
  customStylePrompt?: string,
  hasCharacterSheet?: boolean,
  hasPreviousPage?: boolean,
  characters?: CharacterDescription[]
): string {
  const artStyleDescription = getArtStyleDescription(artStyle, customStylePrompt);
  const panelCount = scriptPage.panels.length;

  const panelDescriptions = scriptPage.panels
    .map((panel) => {
      const dialogueLines =
        panel.dialogue.length > 0
          ? panel.dialogue
              .map((d) => `  Speech bubble — ${d.speaker}: "${d.text}"`)
              .join("\n")
          : "  No dialogue.";
      const caption = panel.caption
        ? `  Caption box: "${panel.caption}"`
        : "";
      return `Panel ${panel.panelNumber}:
  Visual: ${panel.description}
${dialogueLines}${caption ? "\n" + caption : ""}`;
    })
    .join("\n\n");

  // Build reference image instructions
  const refInstructions: string[] = [];
  if (hasCharacterSheet) {
    refInstructions.push(
      "- The FIRST attached reference image is a CHARACTER REFERENCE SHEET. You MUST use it to keep every character's design (face, body, outfit, colors, proportions) exactly consistent. Do NOT deviate from the character designs shown in the sheet."
    );
  }
  if (hasPreviousPage) {
    refInstructions.push(
      `- The ${hasCharacterSheet ? "SECOND" : "FIRST"} attached reference image is the PREVIOUS comic page. Match the art style, color palette, character appearances, and visual tone from that page to ensure visual continuity across the comic.`
    );
  }
  const refBlock =
    refInstructions.length > 0
      ? `\nReference images provided:\n${refInstructions.join("\n")}\n`
      : "";

  // Build character description block for textual reinforcement
  let characterBlock = "";
  if (characters && characters.length > 0) {
    const pageText = scriptPage.panels
      .map((p) => [p.description, ...p.dialogue.map((d) => d.speaker)].join(" "))
      .join(" ")
      .toLowerCase();

    const relevantChars = characters.filter((c) =>
      pageText.includes(c.name.toLowerCase())
    );

    if (relevantChars.length > 0) {
      characterBlock = `\nCharacter appearance reference (maintain these designs exactly):\n${relevantChars
        .map((c) => {
          const parts = [`- ${c.name}: ${c.appearance}`];
          if (c.clothing) parts.push(`  Outfit: ${c.clothing}`);
          return parts.join("\n");
        })
        .join("\n")}\n`;
    }
  }

  return `Create a single comic book page illustration in ${artStyleDescription} style.

This is page ${scriptPage.pageNumber} of ${totalPages} in a comic called "${comicTitle}".
${refBlock}${characterBlock}
The page has ${panelCount} panels arranged in a comic book layout:

${panelDescriptions}

Important instructions:
- Render this as a SINGLE comic book page with clearly defined panel borders.
- Include speech bubbles with the dialogue text inside each panel.
- Include caption boxes for narrator text where specified.
- Keep character appearances EXACTLY consistent across all panels and with any provided reference images.
- The overall style must be: ${artStyleDescription}
- Use a ${IMAGE_ASPECT_RATIO} aspect ratio.`;
}
