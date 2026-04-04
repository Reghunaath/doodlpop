"use client";

import type { GenerationMode } from "@/backend/lib/types";

interface ModeToggleProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  const supervised = value === "supervised";

  return (
    <div className="w-full">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 flex-1 bg-black" />
        <span className="font-headline text-xs font-black uppercase tracking-widest text-on-surface-muted">
          Generation Mode
        </span>
        <div className="h-1 flex-1 bg-black" />
      </div>

      {/* Toggle panels */}
      <div className="flex items-stretch gap-0 relative">

        {/* SUPERVISED panel */}
        <button
          type="button"
          onClick={() => onChange("supervised")}
          className={`relative flex-1 p-5 ink-border text-left transition-all duration-150 cursor-pointer group ${
            supervised
              ? "bg-secondary-bg text-black -translate-y-1 ink-shadow z-10"
              : "bg-surface-card text-on-surface-muted hover:-translate-y-0.5"
          }`}
          style={supervised ? { transform: "rotate(-1deg) translateY(-4px)" } : {}}
        >
          {/* Active indicator starburst */}
          {supervised && (
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary ink-border flex items-center justify-center z-20"
              style={{ clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }}
            >
              <span className="sr-only">active</span>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span
              className={`text-3xl leading-none mt-0.5 transition-transform duration-150 ${
                supervised ? "scale-125" : "opacity-40 group-hover:opacity-70"
              }`}
            >
              ◉
            </span>
            <div>
              <p className="font-headline text-xl font-black uppercase leading-tight">
                You Decide
              </p>
              <p
                className={`font-body text-xs leading-relaxed mt-1 ${
                  supervised ? "text-black/70" : "text-on-surface-muted"
                }`}
              >
                Review &amp; approve each page as it generates. Full creative control.
              </p>
            </div>
          </div>
        </button>

        {/* VS badge — red */}
        <div className="relative z-20 flex items-center justify-center w-0">
          <div
            className="absolute bg-primary ink-border w-9 h-9 flex items-center justify-center"
            style={{ transform: "rotate(12deg)" }}
          >
            <span className="font-headline text-white text-xs font-black uppercase leading-none">
              VS
            </span>
          </div>
        </div>

        {/* AUTO-PILOT panel */}
        <button
          type="button"
          onClick={() => onChange("automated")}
          className={`relative flex-1 p-5 ink-border text-left transition-all duration-150 cursor-pointer group ${
            !supervised
              ? "bg-tertiary text-on-tertiary -translate-y-1 ink-shadow z-10"
              : "bg-surface-card text-on-surface-muted hover:-translate-y-0.5"
          }`}
          style={!supervised ? { transform: "rotate(1deg) translateY(-4px)" } : {}}
        >
          {/* Active indicator starburst */}
          {!supervised && (
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary ink-border flex items-center justify-center z-20"
              style={{ clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)" }}
            >
              <span className="sr-only">active</span>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span
              className={`text-3xl leading-none mt-0.5 transition-transform duration-150 ${
                !supervised ? "scale-125" : "opacity-40 group-hover:opacity-70"
              }`}
            >
              ⚡
            </span>
            <div>
              <p className="font-headline text-xl font-black uppercase leading-tight">
                Auto-Pilot!
              </p>
              <p
                className={`font-body text-xs leading-relaxed mt-1 ${
                  !supervised ? "text-on-tertiary/80" : "text-on-surface-muted"
                }`}
              >
                Sit back. We generate every page end-to-end without stopping.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
