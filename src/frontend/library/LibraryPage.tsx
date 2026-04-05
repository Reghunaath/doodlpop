"use client";

import Link from "next/link";
import Image from "next/image";

// ── Hardcoded comic entries ────────────────────────────────────────────────

const COMICS = [
  {
    id: "1",
    title: "INSPECTOR WHISKERS AND THE STOLEN STAR",
    pages: 3,
    artStyle: "WESTERN COMIC",
    status: "COMPLETE",
    createdAt: "Apr 3, 2026",
  },
  {
    id: "2",
    title: "THE NEON BLITZ",
    pages: 5,
    artStyle: "MANGA",
    status: "COMPLETE",
    createdAt: "Apr 2, 2026",
  },
  {
    id: "3",
    title: "ROBO HEARTS: LOVE IN THE MACHINE AGE",
    pages: 4,
    artStyle: "WATERCOLOR",
    status: "COMPLETE",
    createdAt: "Apr 1, 2026",
  },
];

const STATUS_STYLES: Record<string, string> = {
  COMPLETE: "bg-tertiary text-on-tertiary",
  DRAFT: "bg-secondary-bg text-black",
  GENERATING: "bg-primary text-white",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface ben-day-dots">
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-4 border-b-4 border-black bg-surface">
        <Link href="/">
          <span
            className="font-headline text-3xl font-black italic text-primary select-none cursor-pointer"
            style={{
              transform: "rotate(-2deg)",
              display: "inline-block",
              filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))",
            }}
          >
            DOODLPOP
          </span>
        </Link>

        <Link href="/create">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-dim ink-border translate-x-1.5 translate-y-1.5" />
            <span className="relative bg-primary ink-border px-5 py-2 font-headline text-sm font-black uppercase text-white hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer block">
              + NEW COMIC
            </span>
          </div>
        </Link>
      </nav>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-black pb-4 gap-4">
          <div className="relative">
            <div
              className="absolute -top-8 -left-2 bg-secondary-bg ink-border px-4 py-1 font-headline text-sm uppercase"
              style={{ transform: "rotate(-3deg)" }}
            >
              YOUR COLLECTION
            </div>
            <h1
              className="font-headline text-5xl md:text-7xl font-black italic uppercase text-on-surface"
              style={{
                transform: "rotate(-1deg)",
                display: "inline-block",
                filter: "drop-shadow(4px 4px 0px rgba(186,0,21,1))",
              }}
            >
              THE
              <br />
              LIBRARY
            </h1>
          </div>

          <div
            className="bg-primary p-4 ink-border ink-shadow max-w-xs hidden md:block"
            style={{ transform: "rotate(2deg)" }}
          >
            <p className="font-headline text-xs uppercase leading-tight font-black text-white">
              {COMICS.length} COMICS IN YOUR COLLECTION. KEEP CREATING, TRUE BELIEVER!
            </p>
          </div>
        </div>
      </div>

      {/* ── COMIC GRID ──────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-16">
        {COMICS.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <div
              className="w-28 h-28 bg-surface-card ink-border flex items-center justify-center comic-burst"
            >
              <span className="font-headline text-4xl font-black text-on-surface-muted">?</span>
            </div>
            <p className="font-headline text-2xl font-black uppercase text-on-surface-muted">
              Nothing here yet!
            </p>
            <p className="font-body text-sm text-on-surface-muted">
              Create your first comic to see it in the library.
            </p>
            <div className="relative mt-2">
              <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
              <Link
                href="/create"
                className="relative bg-primary ink-border px-10 py-4 font-headline text-xl font-black italic uppercase text-white hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 block"
              >
                CREATE YOUR FIRST COMIC →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
            {COMICS.map((comic, i) => {
              const rotate = i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-1" : "-rotate-0.5";
              return (
                <Link href="/view" key={comic.id} className="block group">
                  <div className={`relative ink-border ink-shadow bg-surface-white hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-100 ${rotate}`}>

                    {/* Status badge */}
                    <div
                      className={`absolute -top-3 -right-3 z-10 ink-border px-3 py-0.5 font-headline text-xs font-black uppercase ${STATUS_STYLES[comic.status] ?? "bg-surface-card text-on-surface"}`}
                      style={{ transform: "rotate(3deg)" }}
                    >
                      {comic.status}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[3/4] border-b-4 border-black overflow-hidden">
                      <Image
                        src="/cover.png"
                        alt={comic.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Issue number overlay */}
                      <div className="absolute top-3 left-3 bg-primary ink-border px-2 py-0.5 font-headline text-xs font-black text-white uppercase">
                        ISSUE #{String(i + 1).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <p className="font-headline text-xs uppercase font-black text-primary tracking-wide">
                        {comic.artStyle}
                      </p>
                      <h2 className="font-headline text-base font-black uppercase leading-tight text-on-surface line-clamp-2">
                        {comic.title}
                      </h2>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-body text-xs text-on-surface-muted">
                          {comic.pages} pages · {comic.createdAt}
                        </span>
                        <span className="font-headline text-xs font-black text-primary uppercase">
                          READ →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
