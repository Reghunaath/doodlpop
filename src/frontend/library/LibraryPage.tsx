"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ComicSummary, ComicStatus } from "@/backend/lib/types";
import { batchComics } from "@/frontend/lib/api";
import { getSavedComics, removeSavedComic } from "@/frontend/lib/local-storage";

// ── Status display mapping ───────────────────────────────────────────────

const STATUS_LABEL: Record<ComicStatus, string> = {
  complete: "COMPLETE",
  generating: "GENERATING",
  script_approved: "APPROVED",
  script_draft: "DRAFT",
  script_pending: "DRAFT",
  input: "NEW",
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETE: "bg-tertiary text-on-tertiary",
  GENERATING: "bg-primary text-white",
  DRAFT: "bg-secondary-bg text-black",
  APPROVED: "bg-secondary-bg text-black",
  NEW: "bg-secondary-bg text-black",
};

function getComicLink(comic: ComicSummary): string {
  switch (comic.status) {
    case "complete":
    case "generating":
    case "script_approved":
      return `/comic/${comic.id}`;
    case "script_draft":
      return `/script/${comic.id}`;
    case "input":
    case "script_pending":
      return `/create?id=${comic.id}`;
    default:
      return `/comic/${comic.id}`;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatArtStyle(style: string): string {
  return style.replace(/_/g, " ").toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [comics, setComics] = useState<ComicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, comicId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeSavedComic(comicId);
    setComics((prev) => prev.filter((c) => c.id !== comicId));
  };

  useEffect(() => {
    (async () => {
      try {
        const saved = getSavedComics();
        if (saved.length === 0) {
          setComics([]);
          return;
        }
        const ids = saved.map((s) => s.comicId);
        const res = await batchComics(ids);
        setComics(res.comics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load library");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

        <Link href="/">
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

          {!loading && comics.length > 0 && (
            <div
              className="bg-primary p-4 ink-border ink-shadow max-w-xs hidden md:block"
              style={{ transform: "rotate(2deg)" }}
            >
              <p className="font-headline text-xs uppercase leading-tight font-black text-white">
                {comics.length} COMIC{comics.length !== 1 ? "S" : ""} IN YOUR COLLECTION. KEEP CREATING, TRUE BELIEVER!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="w-16 h-16 border-4 border-black border-t-primary rounded-full animate-spin" />
            <p className="font-headline text-lg font-black uppercase text-on-surface-muted">
              Loading your comics...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="w-28 h-28 bg-surface-card ink-border flex items-center justify-center">
              <span className="font-headline text-4xl font-black text-primary">!</span>
            </div>
            <p className="font-headline text-xl font-black uppercase text-primary">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="font-headline text-sm font-black uppercase text-primary underline cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        ) : comics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <div className="w-28 h-28 bg-surface-card ink-border flex items-center justify-center comic-burst">
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
                href="/"
                className="relative bg-primary ink-border px-10 py-4 font-headline text-xl font-black italic uppercase text-white hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 block"
              >
                CREATE YOUR FIRST COMIC →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
            {comics.map((comic, i) => {
              const rotate = i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-1" : "-rotate-0.5";
              const label = STATUS_LABEL[comic.status] ?? "UNKNOWN";
              return (
                <Link href={getComicLink(comic)} key={comic.id} className="block group">
                  <div className={`relative ink-border ink-shadow bg-surface-white hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-100 ${rotate}`}>

                    {/* Status badge */}
                    <div
                      className={`absolute -top-3 -right-3 z-10 ink-border px-3 py-0.5 font-headline text-xs font-black uppercase ${STATUS_STYLES[label] ?? "bg-surface-card text-on-surface"}`}
                      style={{ transform: "rotate(3deg)" }}
                    >
                      {label}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[3/4] border-b-4 border-black overflow-hidden bg-surface-card">
                      {comic.thumbnailUrl ? (
                        <img
                          src={comic.thumbnailUrl}
                          alt={comic.title ?? "Comic thumbnail"}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-headline text-6xl font-black text-on-surface-muted/20">?</span>
                        </div>
                      )}
                      {/* Issue number overlay */}
                      <div className="absolute top-3 left-3 bg-secondary-bg ink-border px-2 py-0.5 font-headline text-xs font-black text-black uppercase">
                        ISSUE #{String(i + 1).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <p className="font-headline text-xs uppercase font-black text-primary tracking-wide">
                        {formatArtStyle(comic.artStyle)}
                      </p>
                      <h2 className="font-headline text-base font-black uppercase leading-tight text-on-surface line-clamp-2">
                        {comic.title ?? "(Untitled)"}
                      </h2>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-body text-xs text-on-surface-muted">
                          {comic.pageCount} pages · {formatDate(comic.createdAt)}
                        </span>
                        <span className="font-headline text-xs font-black text-primary uppercase">
                          {comic.status === "complete" ? "READ →" : "CONTINUE →"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, comic.id)}
                        className="w-full mt-2 py-1.5 ink-border font-headline text-xs font-black uppercase bg-surface-card text-primary hover:bg-primary hover:text-white transition-colors duration-75 cursor-pointer"
                      >
                        DELETE
                      </button>
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
