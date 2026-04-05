"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SURPRISE_PROMPTS = [
  "A retired superhero opens a bakery, but villains keep showing up for free samples.",
  "Two rival robots fall in love at a recycling plant.",
  "A medieval knight discovers a smartphone in a dragon's hoard.",
  "A tiny alien crash-lands in a kindergarten classroom.",
  "The last librarian on Earth guards books from a government that banned reading.",
];

export default function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = prompt.trim();
    router.push(q ? `/create?prompt=${encodeURIComponent(q)}` : "/create");
  };

  const handleSurpriseMe = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(random);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4">
      {/* Speech bubble — wraps the form so the external CTA button can submit it */}
      <form id="story-form" onSubmit={handleSubmit}>
        <div className="bg-surface-white ink-border ink-shadow p-8 md:p-10 relative speech-bubble-tail">
          {/* Label badge */}
          <div className="absolute -top-5 left-6 bg-secondary-bg ink-border px-4 py-1">
            <label
              htmlFor="story-prompt"
              className="font-headline text-black font-black uppercase tracking-widest text-sm cursor-pointer"
            >
              WRITE YOUR STORY...
            </label>
          </div>

          {/* Textarea */}
          <textarea
            id="story-prompt"
            className="w-full bg-transparent border-none outline-none ring-0 font-body text-xl md:text-2xl placeholder:text-on-surface-muted/50 italic min-h-[180px] resize-none mt-2 text-on-surface leading-relaxed"
            placeholder="In a world where robots dream of becoming artists, one malfunctioning unit discovers a hidden paintbrush..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Surprise Me — badge on bottom-right border */}
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="absolute -bottom-5 right-6 bg-tertiary ink-border px-4 py-1 font-headline text-on-tertiary font-black uppercase tracking-widest text-sm cursor-pointer hover:bg-tertiary-dim transition-colors flex items-center gap-1.5"
            style={{ transform: "rotate(2deg)" }}
          >
            <span className="text-base leading-none">✦</span>
            Surprise Me!
          </button>
        </div>
      </form>
    </div>
  );
}