"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Comic } from "@/backend/lib/types";
import { getComic, generateAll, ApiError } from "@/frontend/lib/api";
import { updateSavedComic } from "@/frontend/lib/local-storage";

interface ComicViewerProps {
  comicId: string;
}

export default function ComicViewer({ comicId }: ComicViewerProps) {
  const [comic, setComic] = useState<Comic | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generationTriggered = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchComic = useCallback(async () => {
    const { comic: c } = await getComic(comicId);
    setComic(c);
    return c;
  }, [comicId]);

  // Initial load + trigger automated generation if needed
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const c = await fetchComic();
        if (cancelled) return;

        // Trigger automated generation if status is script_approved
        if (
          c.status === "script_approved" &&
          c.generationMode === "automated" &&
          !generationTriggered.current
        ) {
          generationTriggered.current = true;
          // Fire and forget — catch 409 silently (already generating on refresh)
          generateAll(comicId).catch((err) => {
            if (err instanceof ApiError && err.status === 409) return;
            console.error("[ComicViewer] generate-all error:", err);
          });
        }

        if (c.status === "complete") {
          updateSavedComic(comicId, { status: "complete", title: c.script?.title ?? "(untitled)" });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load comic");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [comicId, fetchComic]);

  // Poll while generating
  useEffect(() => {
    if (!comic) return;
    if (comic.status !== "generating" && comic.status !== "script_approved") return;

    pollRef.current = setInterval(async () => {
      try {
        const c = await fetchComic();
        if (c.status === "complete") {
          if (pollRef.current) clearInterval(pollRef.current);
          updateSavedComic(comicId, { status: "complete", title: c.script?.title ?? "(untitled)" });
        }
      } catch {
        // Swallow poll errors
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [comic?.status, comicId, fetchComic]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface ben-day-dots">
        <div className="bg-secondary-bg ink-border ink-shadow px-12 py-8 animate-pulse">
          <span className="font-headline text-3xl font-black uppercase">LOADING...</span>
        </div>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface ben-day-dots">
        <div className="bg-primary ink-border px-8 py-4">
          <span className="font-headline text-xl font-black text-white uppercase">
            {error ?? "COMIC NOT FOUND"}
          </span>
        </div>
        <Link
          href="/"
          className="font-headline text-sm font-black uppercase text-primary hover:underline"
        >
          BACK TO HOME
        </Link>
      </div>
    );
  }

  const isGenerating = comic.status === "generating" || comic.status === "script_approved";
  const isComplete = comic.status === "complete";
  const title = comic.script?.title ?? "UNTITLED COMIC";
  const pages = comic.pages;
  const totalExpected = comic.pageCount;

  // Sort pages by pageNumber
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  // For complete mode: paginate
  const currentPage = sortedPages[pageIdx];
  const isFirst = pageIdx === 0;
  const isLast = pageIdx >= sortedPages.length - 1;

  const prev = () => setPageIdx((i) => Math.max(0, i - 1));
  const next = () => setPageIdx((i) => Math.min(sortedPages.length - 1, i + 1));

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── FIXED TOP NAV ───────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface border-b-4 border-black ink-shadow flex justify-between items-center px-6 py-4">
        <Link href="/">
          <span
            className="font-headline text-2xl font-black italic text-primary select-none cursor-pointer"
            style={{
              transform: "rotate(-2deg)",
              display: "inline-block",
              filter: "drop-shadow(3px 3px 0px rgba(0,0,0,1))",
            }}
          >
            DOODLPOP
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="font-headline font-black uppercase italic text-on-surface-muted hover:text-primary hover:-rotate-1 transition-all text-sm"
          >
            Home
          </Link>
          <Link
            href="/create"
            className="font-headline font-black uppercase italic text-on-surface-muted hover:text-primary hover:-rotate-1 transition-all text-sm"
          >
            Create
          </Link>
        </div>

        <div className="bg-secondary-bg ink-border px-4 py-1 font-headline text-xs font-black uppercase max-w-xs truncate" style={{ transform: "rotate(1deg)" }}>
          {title}
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main className="flex-1 pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">

        {isGenerating ? (
          /* ── Generating progress ──────────────── */
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2
                className="font-headline text-4xl md:text-5xl font-black italic uppercase"
                style={{ filter: "drop-shadow(4px 4px 0px rgba(186,0,21,1))" }}
              >
                GENERATING YOUR COMIC...
              </h2>
              <p className="font-body text-on-surface-muted text-sm mt-4">
                Page {sortedPages.length} of {totalExpected} complete. Polling every 5 seconds...
              </p>
            </div>

            {/* Show generated pages so far */}
            <div className="space-y-6">
              {sortedPages.map((page) => {
                const imgUrl = page.versions[page.selectedVersionIndex]?.imageUrl;
                return (
                  <div key={page.pageNumber} className="bg-white ink-border ink-shadow p-3 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary ink-border px-3 py-1">
                        <span className="font-headline text-xs font-black text-white uppercase">
                          Page {page.pageNumber}
                        </span>
                      </div>
                      <span className="font-headline text-xs font-black uppercase text-on-surface-muted">
                        ✓ Generated
                      </span>
                    </div>
                    {imgUrl && (
                      <div className="border-4 border-black overflow-hidden" style={{ aspectRatio: "2/3" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt={`Page ${page.pageNumber}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pending pages */}
              {Array.from({ length: totalExpected - sortedPages.length }, (_, i) => (
                <div key={`pending-${i}`} className="bg-surface-card ink-border ink-shadow p-3 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-surface-card ink-border px-3 py-1">
                      <span className="font-headline text-xs font-black text-on-surface-muted uppercase">
                        Page {sortedPages.length + i + 1}
                      </span>
                    </div>
                    <span className="font-headline text-xs font-black uppercase text-on-surface-muted animate-pulse">
                      GENERATING...
                    </span>
                  </div>
                  <div className="border-4 border-dashed border-outline-variant bg-surface-low animate-pulse" style={{ aspectRatio: "2/3" }} />
                </div>
              ))}
            </div>
          </div>
        ) : isComplete && sortedPages.length > 0 ? (
          /* ── Complete comic viewer ──────────────── */
          <>
            {/* Page navigation row */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <button
                onClick={prev}
                disabled={isFirst}
                className="bg-primary text-white ink-border px-8 py-4 font-headline font-black text-xl italic uppercase tracking-tight ink-shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ transform: "rotate(-2deg)" }}
              >
                ← PREVIOUS PAGE
              </button>

              <div
                className="bg-secondary-bg ink-border px-10 py-4 ink-shadow flex flex-col items-center"
                style={{ transform: "rotate(1deg)" }}
              >
                <span className="font-headline text-black text-xs tracking-widest mb-1 uppercase max-w-xs truncate">
                  {title}
                </span>
                <span className="font-headline font-black text-2xl italic text-black uppercase">
                  PAGE {currentPage?.pageNumber ?? 1} OF {sortedPages.length}
                </span>
              </div>

              <button
                onClick={next}
                disabled={isLast}
                className="bg-primary text-white ink-border px-8 py-4 font-headline font-black text-xl italic uppercase tracking-tight ink-shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ transform: "rotate(2deg)" }}
              >
                NEXT PAGE →
              </button>
            </div>

            {/* Comic page */}
            {currentPage && (
              <div className="bg-white ink-border p-3 md:p-5 ink-shadow-lg mb-8 max-w-4xl mx-auto">
                <div className="border-4 border-black overflow-hidden" style={{ aspectRatio: "2/3" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentPage.versions[currentPage.selectedVersionIndex]?.imageUrl}
                    alt={`Comic page ${currentPage.pageNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Action bar */}
            <div className="flex justify-center gap-6 flex-wrap">
              <a
                href={`/api/comic/${comicId}/export/pdf`}
                download
                className="bg-tertiary ink-border px-8 py-4 font-headline font-black text-lg italic uppercase text-on-tertiary tracking-tight ink-shadow hover:scale-105 active:scale-95 transition-all"
                style={{ transform: "rotate(-1deg)" }}
              >
                DOWNLOAD PDF
              </a>
            </div>
          </>
        ) : (
          /* ── Empty / unknown state ─────────────── */
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <div className="bg-surface-card ink-border px-8 py-4">
              <span className="font-headline text-xl font-black uppercase">NO PAGES YET</span>
            </div>
            <Link href="/" className="font-headline text-sm font-black uppercase text-primary hover:underline">
              BACK TO HOME
            </Link>
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
