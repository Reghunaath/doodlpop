"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtStylePreset } from "@/backend/lib/types";
import { createComic, getRandomIdea } from "@/frontend/lib/api";
import { addSavedComic } from "@/frontend/lib/local-storage";
import PromptForm from "./PromptForm";
import PageSlider from "./PageSlider";

const STYLES: { key: ArtStylePreset; label: string; desc: string; card: string; text: string; descText: string }[] = [
  { key: "manga", label: "Manga", desc: "Screentones, expressive eyes, dynamic action lines.", card: "bg-surface-white", text: "text-primary", descText: "text-on-surface-muted" },
  { key: "western_comic", label: "Western Comic", desc: "Bold outlines, vivid colors, halftone dot shading.", card: "bg-secondary-bg", text: "text-black", descText: "text-black/70" },
  { key: "watercolor_storybook", label: "Watercolor", desc: "Soft brushstrokes, gentle colors, dreamy storybook feel.", card: "bg-tertiary", text: "text-on-tertiary", descText: "text-on-tertiary/80" },
  { key: "minimalist_flat", label: "Minimalist Flat", desc: "Simple shapes, limited palette, clean lines, no gradients.", card: "bg-primary", text: "text-on-primary", descText: "text-on-primary/80" },
  { key: "vintage_newspaper", label: "Vintage Newspaper", desc: "Muted tones, Ben-Day dots, retro lettering, yellowed paper.", card: "bg-surface-card", text: "text-on-surface", descText: "text-on-surface-muted" },
  { key: "custom", label: "Custom Style", desc: "Describe your own art style in your own words.", card: "bg-tertiary-container", text: "text-on-tertiary-container", descText: "text-on-tertiary-container/70" },
];

const ROTATIONS = ["hover:rotate-1", "hover:-rotate-1", "hover:rotate-1", "hover:-rotate-1", "hover:rotate-1", "hover:-rotate-1"];

export default function LandingFormWrapper() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState<ArtStylePreset>("manga");
  const [customStylePrompt, setCustomStylePrompt] = useState("");
  const [pageCount, setPageCount] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const q = prompt.trim();
    if (!q) {
      setError("Please enter a story idea!");
      return;
    }
    if (artStyle === "custom" && !customStylePrompt.trim()) {
      setError("Please describe your custom art style!");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await createComic({
        prompt: q,
        artStyle,
        customStylePrompt: artStyle === "custom" ? customStylePrompt.trim() : undefined,
        pageCount,
      });
      addSavedComic({
        comicId: res.comicId,
        title: "(untitled)",
        createdAt: new Date().toISOString(),
        status: "input",
      });
      router.push(`/create?id=${res.comicId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const handleSurpriseMe = async (): Promise<string> => {
    const idea = await getRandomIdea();
    return idea;
  };

  return (
    <>
      {/* Interactive prompt / speech bubble */}
      <PromptForm
        prompt={prompt}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
        onSurpriseMe={handleSurpriseMe}
      />

      {/* ── PICK YOUR STYLE ────────────────────────────────── */}
      <section className="px-4 pb-20 pt-20 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="font-headline text-4xl md:text-5xl font-black uppercase"
              style={{ transform: "rotate(-1deg)", display: "inline-block" }}
            >
              Pick your style
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STYLES.map((s, i) => {
              const selected = artStyle === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setArtStyle(s.key)}
                  className={`${s.card} ink-border p-7 transition-all duration-150 ${ROTATIONS[i]} text-left cursor-pointer ${
                    selected ? "ink-shadow-lg ring-4 ring-primary scale-105" : "ink-shadow"
                  }`}
                >
                  <div className={`font-headline text-3xl font-black ${s.text} leading-tight mb-1`}>
                    {s.label}
                  </div>
                  <p className={`${s.descText} text-sm leading-relaxed`}>{s.desc}</p>
                  {selected && (
                    <div className="mt-3 bg-primary ink-border px-3 py-1 inline-block">
                      <span className="font-headline text-xs font-black text-white uppercase tracking-wide">
                        SELECTED
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom style input */}
          {artStyle === "custom" && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-surface-white ink-border ink-shadow p-6">
                <label className="font-headline text-xs uppercase font-black text-primary block mb-2">
                  Describe Your Art Style
                </label>
                <textarea
                  value={customStylePrompt}
                  onChange={(e) => setCustomStylePrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Retro 80s neon cyberpunk with pixel art influences..."
                  className="w-full bg-surface-low ink-border px-4 py-3 font-body text-sm leading-relaxed outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PAGE COUNT SLIDER ───────────────────────────── */}
      <PageSlider pages={pageCount} onPagesChange={setPageCount} />

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-4 px-4 pb-24">
        {error && (
          <div className="bg-primary ink-border px-6 py-2" style={{ transform: "rotate(-1deg)" }}>
            <p className="font-headline text-sm font-black text-white uppercase">{error}</p>
          </div>
        )}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="relative inline-flex items-center justify-center bg-primary ink-border px-14 py-5 font-headline text-2xl font-black italic uppercase text-white tracking-wide transition-transform duration-75 hover:-translate-y-1 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "CREATING..." : "CREATE A COMIC"}
          </button>
        </div>
      </section>
    </>
  );
}
