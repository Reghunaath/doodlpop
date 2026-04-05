import Link from "next/link";
import PromptForm from "@/frontend/landing/PromptForm";
import PageSlider from "@/frontend/landing/PageSlider";


export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface ben-day-dots">
      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-4 border-b-4 border-black bg-surface">
        <span
          className="font-headline text-3xl font-black italic text-primary select-none"
          style={{
            transform: "rotate(-2deg)",
            display: "inline-block",
            filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))",
          }}
        >
          DOODLPOP
        </span>

        <Link href="/library">
          <div className="relative">
            <div className="absolute inset-0 bg-on-secondary-container ink-border translate-x-1.5 translate-y-1.5" />
            <span className="relative bg-secondary-bg ink-border px-5 py-2 font-headline text-sm font-black uppercase text-black hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer block">
              MY LIBRARY
            </span>
          </div>
        </Link>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 pt-14 pb-20">
        {/* Headline block */}
        <div className="relative text-center mb-14">
          {/* Decorative badge — top right */}
          <div
            className="absolute -top-8 -right-4 md:-right-14 bg-secondary-bg ink-border ink-shadow-sm px-3 py-1 z-10"
            style={{ transform: "rotate(10deg)" }}
          >
            <p className="font-headline text-black text-sm font-black uppercase tracking-wide">
              AI&nbsp;Powered
            </p>
          </div>

          {/* Decorative badge — bottom left */}
          <div
            className="absolute -bottom-6 -left-2 md:-left-12 bg-tertiary ink-border ink-shadow-sm px-4 py-1 z-10"
            style={{ transform: "rotate(-5deg)" }}
          >
            <p className="font-headline text-on-tertiary text-xs font-black uppercase italic">
              Free&nbsp;to&nbsp;use
            </p>
          </div>

          <h1
            className="font-headline text-5xl md:text-7xl lg:text-8xl font-black italic text-primary uppercase tracking-tighter leading-none"
            style={{
              transform: "rotate(-2deg)",
              display: "inline-block",
              filter: "drop-shadow(6px 6px 0px rgba(0,0,0,1))",
            }}
          >
            TURN YOUR
            <br />
            IDEAS INTO
            <br />
            COMICS!
          </h1>
        </div>

        {/* Interactive prompt / speech bubble */}
        <PromptForm />
      </main>

      {/* ── PICK YOUR STYLE ────────────────────────────────── */}
      <section className="px-4 pb-20">
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
            <div className="bg-surface-white ink-border ink-shadow p-7 transition-transform duration-150 hover:rotate-1">
              <div className="font-headline text-3xl font-black text-primary leading-tight mb-1">
                Manga
              </div>
              <p className="text-on-surface-muted text-sm leading-relaxed">
                Screentones, expressive eyes, dynamic action lines.
              </p>
            </div>

            <div className="bg-secondary-bg ink-border ink-shadow p-7 transition-transform duration-150 hover:-rotate-1">
              <div className="font-headline text-3xl font-black text-black leading-tight mb-1">
                Western Comic
              </div>
              <p className="text-black/70 text-sm leading-relaxed">
                Bold outlines, vivid colors, halftone dot shading.
              </p>
            </div>

            <div className="bg-tertiary ink-border ink-shadow p-7 transition-transform duration-150 hover:rotate-1">
              <div className="font-headline text-3xl font-black text-on-tertiary leading-tight mb-1">
                Watercolor
              </div>
              <p className="text-on-tertiary/80 text-sm leading-relaxed">
                Soft brushstrokes, gentle colors, dreamy storybook feel.
              </p>
            </div>

            <div className="bg-primary ink-border ink-shadow p-7 transition-transform duration-150 hover:-rotate-1">
              <div className="font-headline text-3xl font-black text-on-primary leading-tight mb-1">
                Minimalist Flat
              </div>
              <p className="text-on-primary/80 text-sm leading-relaxed">
                Simple shapes, limited palette, clean lines, no gradients.
              </p>
            </div>

            <div className="bg-surface-card ink-border ink-shadow p-7 transition-transform duration-150 hover:rotate-1">
              <div className="font-headline text-3xl font-black text-on-surface leading-tight mb-1">
                Vintage Newspaper
              </div>
              <p className="text-on-surface-muted text-sm leading-relaxed">
                Muted tones, Ben-Day dots, retro lettering, yellowed paper.
              </p>
            </div>

            <div className="bg-tertiary-container ink-border ink-shadow p-7 transition-transform duration-150 hover:-rotate-1">
              <div className="font-headline text-3xl font-black text-on-tertiary-container leading-tight mb-1">
                Custom Style
              </div>
              <p className="text-on-tertiary-container/70 text-sm leading-relaxed">
                Describe your own art style in your own words.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAGE COUNT SLIDER ───────────────────────────── */}
      <PageSlider />

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="flex justify-center px-4 pb-24">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
          <button
            type="submit"
            form="story-form"
            className="relative inline-flex items-center justify-center bg-primary ink-border px-14 py-5 font-headline text-2xl font-black italic uppercase text-white tracking-wide transition-transform duration-75 hover:-translate-y-1 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer"
          >
            CREATE A COMIC
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-12 py-5 bg-secondary-bg border-t-4 border-black">
        <span className="font-headline text-sm font-black uppercase text-black tracking-widest">
          © 2026 DOODLPOP
        </span>
        <span className="font-headline text-xs font-black uppercase text-black/50 tracking-widest">
          Make something awesome.
        </span>
      </footer>
    </div>
  );
}
