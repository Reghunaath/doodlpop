"use client";

import { useState } from "react";

const PAGE_MIN = 1;
const PAGE_MAX = 15;

// Fun labels that appear at certain counts
const PAGE_LABELS: Record<number, string> = {
  1:  "Short story!",
  3:  "A quick read.",
  5:  "Getting spicy.",
  8:  "Epic territory.",
  12: "A saga begins...",
  15: "The full epic!",
};

function getLabel(n: number): string {
  // Find nearest label at or below n
  const keys = Object.keys(PAGE_LABELS).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (n >= k) return PAGE_LABELS[k];
  }
  return "";
}

export default function PageSlider() {
  const [pages, setPages] = useState(4);

  return (
    <section className="px-4 pb-20">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-12">
          <h2
            className="font-headline text-4xl md:text-5xl font-black uppercase"
            style={{ transform: "rotate(1deg)", display: "inline-block" }}
          >
            How Many Pages?
          </h2>
        </div>

        {/* Slider card */}
        <div className="bg-surface-white ink-border ink-shadow p-8 md:p-12 relative">

          {/* Page count badge — top-left */}
          <div
            className="absolute -top-5 left-8 bg-primary ink-border px-4 py-1"
            style={{ transform: "rotate(-2deg)" }}
          >
            <span className="font-headline text-white font-black uppercase tracking-widest text-sm">
              Pages
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Big number display */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div
                className="font-headline font-black text-primary leading-none"
                style={{
                  fontSize: "clamp(5rem, 12vw, 8rem)",
                  filter: "drop-shadow(6px 6px 0px rgba(0,0,0,1))",
                  transform: "rotate(-3deg)",
                  display: "inline-block",
                }}
              >
                {pages}
              </div>
              <div
                className="font-headline text-sm font-black uppercase tracking-widest text-on-surface-muted mt-2"
                style={{ transform: "rotate(-1deg)" }}
              >
                {getLabel(pages)}
              </div>
            </div>

            {/* Slider + tick marks */}
            <div className="flex-1 w-full">
              <input
                type="range"
                min={PAGE_MIN}
                max={PAGE_MAX}
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="comic-slider w-full mb-4"
                aria-label="Number of pages"
              />

              {/* Tick labels */}
              <div className="flex justify-between mt-3">
                {[1, 3, 5, 7, 9, 11, 13, 15].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPages(n)}
                    className={`font-headline text-xs font-black transition-colors cursor-pointer ${
                      pages === n ? "text-primary" : "text-on-surface-muted hover:text-on-surface"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Min / Max labels */}
              <div className="flex justify-between mt-1">
                <span className="font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-muted">
                  Min
                </span>
                <span className="font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-muted">
                  Max
                </span>
              </div>
            </div>
          </div>

          {/* Decorative sticker — bottom right */}
          <div
            className="absolute -bottom-5 right-8 bg-secondary-bg ink-border px-3 py-1"
            style={{ transform: "rotate(3deg)" }}
          >
            <span className="font-headline text-black text-xs font-black uppercase tracking-wide">
              {pages === PAGE_MAX ? "MAXIMUM POWER!" : `${PAGE_MAX - pages} pages left to max`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
