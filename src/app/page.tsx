import Link from "next/link";
import LandingFormWrapper from "@/frontend/landing/LandingFormWrapper";

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
            <div className="absolute inset-0 bg-primary-dim ink-border translate-x-1.5 translate-y-1.5" />
            <span className="relative bg-primary ink-border px-5 py-2 font-headline text-sm font-black uppercase text-white hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer block">
              VIEW LIBRARY
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

        {/* Interactive form — prompt, style, page count, CTA */}
        <LandingFormWrapper />
      </main>

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
