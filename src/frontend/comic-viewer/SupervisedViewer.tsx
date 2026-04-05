"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Comic, Page } from "@/backend/lib/types";
import {
  getComic,
  generatePage,
  regeneratePage,
  selectPageVersion,
} from "@/frontend/lib/api";
import { updateSavedComic } from "@/frontend/lib/local-storage";

interface SupervisedViewerProps {
  comicId: string;
}

export default function SupervisedViewer({ comicId }: SupervisedViewerProps) {
  const [comic, setComic] = useState<Comic | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPage, setIsGeneratingPage] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comic on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { comic: c } = await getComic(comicId);
        if (cancelled) return;
        setComic(c);

        if (c.status === "complete") {
          setIsComplete(true);
          setIsLoading(false);
          return;
        }

        // Figure out which page to work on next
        const generatedPages = c.pages.length;
        const nextPage = generatedPages + 1;
        setCurrentPageNumber(nextPage);

        // If there's already a generated page at this position, show it
        // Otherwise, start generating automatically
        const existingPage = c.pages.find((p) => p.pageNumber === nextPage);
        if (existingPage) {
          setCurrentPage(existingPage);
          setSelectedVersion(existingPage.selectedVersionIndex);
        } else {
          setIsGeneratingPage(true);
          try {
            const res = await generatePage(comicId, { pageNumber: nextPage });
            if (!cancelled) {
              setCurrentPage(res.page);
              setSelectedVersion(res.page.selectedVersionIndex);
            }
          } catch (err) {
            if (!cancelled) {
              setError(err instanceof Error ? err.message : "Failed to generate page");
            }
          } finally {
            if (!cancelled) setIsGeneratingPage(false);
          }
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
  }, [comicId]);

  const totalPages = comic?.pageCount ?? 0;
  const isLastPage = currentPageNumber >= totalPages;

  const handleGeneratePage = useCallback(async () => {
    setIsGeneratingPage(true);
    setError(null);
    try {
      const res = await generatePage(comicId, { pageNumber: currentPageNumber });
      setCurrentPage(res.page);
      setSelectedVersion(res.page.selectedVersionIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate page");
    } finally {
      setIsGeneratingPage(false);
    }
  }, [comicId, currentPageNumber]);

  const handleReink = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const res = await regeneratePage(comicId, { pageNumber: currentPageNumber });
      setCurrentPage(res.page);
      setSelectedVersion(res.page.selectedVersionIndex);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate page");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleContinue = async () => {
    if (!currentPage) return;
    setIsApproving(true);
    setError(null);
    try {
      await selectPageVersion(comicId, {
        pageNumber: currentPageNumber,
        versionIndex: selectedVersion,
      });

      if (isLastPage) {
        setIsComplete(true);
        updateSavedComic(comicId, { status: "complete" });
      } else {
        // Advance to next page and auto-generate
        const nextPageNum = currentPageNumber + 1;
        setCurrentPageNumber(nextPageNum);
        setCurrentPage(null);
        setSelectedVersion(0);
        setNotes("");
        setIsApproving(false);
        setIsGeneratingPage(true);
        try {
          const res = await generatePage(comicId, { pageNumber: nextPageNum });
          setCurrentPage(res.page);
          setSelectedVersion(res.page.selectedVersionIndex);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to generate page");
        } finally {
          setIsGeneratingPage(false);
        }
        return; // Skip the finally below since we already cleared isApproving
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve page");
    } finally {
      setIsApproving(false);
    }
  };

  const currentImageUrl = currentPage
    ? currentPage.versions[selectedVersion]?.imageUrl
    : null;

  const versionsCount = currentPage?.versions.length ?? 0;
  const canRegenerate = versionsCount < 4;

  const bubbleText = isComplete
    ? "MAGNIFICENT! YOUR MASTERPIECE IS COMPLETE! THE SAGA IS WRITTEN IN INK FOREVER!"
    : isGeneratingPage || isRegenerating
    ? "HOLD ON, TRUE BELIEVER! WE'RE INKING A BRAND NEW VERSION RIGHT NOW..."
    : !currentPage
    ? "READY TO BRING THIS PAGE TO LIFE? HIT THAT GENERATE BUTTON!"
    : "REVIEW THIS PAGE! LOVE IT? HIT THE SAGA CONTINUES! NOT HAPPY? GIVE NOTES AND RE-INK!";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface ben-day-dots">
        <div className="bg-secondary-bg ink-border ink-shadow px-12 py-8 animate-pulse">
          <span className="font-headline text-3xl font-black uppercase">LOADING...</span>
        </div>
      </div>
    );
  }

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

        <Link href="/library">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-dim ink-border translate-x-1.5 translate-y-1.5" />
            <span className="relative bg-primary ink-border px-5 py-2 font-headline text-sm font-black uppercase text-white hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer block">
              VIEW LIBRARY
            </span>
          </div>
        </Link>
      </nav>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-black pb-4 gap-4">
          <div className="relative">
            <div
              className="absolute -top-8 -left-2 bg-tertiary text-on-tertiary ink-border px-4 py-1 font-headline text-sm uppercase"
              style={{ transform: "rotate(-3deg)" }}
            >
              ISSUE #4
            </div>
            <h1
              className="font-headline text-5xl md:text-7xl font-black italic uppercase text-on-surface"
              style={{
                transform: "rotate(-1deg)",
                display: "inline-block",
                filter: "drop-shadow(4px 4px 0px rgba(186,0,21,1))",
              }}
            >
              PAGE
              <br />
              REVIEW
            </h1>
          </div>

          <div
            className="bg-secondary-bg p-4 ink-border ink-shadow max-w-xs hidden md:block"
            style={{ transform: "rotate(2deg)" }}
          >
            <p className="font-headline text-xs uppercase leading-tight font-black">
              REVIEW EACH PAGE — APPROVE OR RE-INK BEFORE THE SAGA CONTINUES!
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT SIDEBAR ─────────────────────────── */}
          <aside className="lg:col-span-3 flex flex-col items-center gap-8">
            {/* Editor portrait */}
            <div className="relative w-full">
              <div className="w-full aspect-square ink-border ink-shadow overflow-hidden relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHIAIe6F7HUWdBqByLsrMX2uDXs_bmLMb4fGz37vBLLNTD17bHQ3yIpGQW1fMHmpY9eLFPDJdm-_vhyrRPWOGoypfMMKEfEXKi05Qy-pFTnqf3warTVa_3YXRdBz6MGXw-5CeoHNKLaf08AA3N3rh2zJiiibT8J684BR7s-iyaFaKKOcB0aFrIb6uQFjj8juFPwX_UsDishrxBC6zyll8u12JuxLvVlGp-vLAlYBo8dRcQJn77dHxJ1rERMRC7WCInMc4JWGv7RVs"
                  alt="Classic silver age comic book editor headshot"
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute -bottom-5 left-1/2 bg-secondary-bg ink-border ink-shadow-sm px-4 py-1 whitespace-nowrap"
                style={{ transform: "translateX(-50%) rotate(-5deg)" }}
              >
                <span className="font-headline text-black font-black uppercase text-sm tracking-wide">
                  EDITOR-IN-CHIEF
                </span>
              </div>
            </div>

            {/* Speech bubble */}
            <div className="bg-surface-white ink-border ink-shadow p-5 relative speech-bubble-tail-sm w-full mt-4">
              <p className="font-body font-bold text-center leading-snug text-sm uppercase transition-all duration-300">
                &quot;{bubbleText}&quot;
              </p>
            </div>

            {/* Page progress tracker */}
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 flex-1 bg-black" />
                <span className="font-headline text-xs font-black uppercase tracking-widest text-on-surface-muted whitespace-nowrap">
                  Progress
                </span>
                <div className="h-1 flex-1 bg-black" />
              </div>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const generated = comic?.pages.find((p) => p.pageNumber === pageNum);
                const isApproved = isComplete || (generated && pageNum < currentPageNumber);
                const isCurrent = pageNum === currentPageNumber && !isComplete;
                return (
                  <div
                    key={pageNum}
                    className={`flex items-center gap-3 ink-border px-3 py-2 transition-colors duration-200 ${
                      isApproved
                        ? "bg-primary text-white"
                        : isCurrent
                        ? "bg-secondary-bg text-black"
                        : "bg-surface-card text-on-surface-muted opacity-50"
                    }`}
                  >
                    <span className="font-headline text-2xl font-black w-8 text-center leading-none">
                      {isApproved ? "✓" : isCurrent ? "◉" : String(pageNum).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-headline text-xs font-black uppercase leading-none">
                        Page {pageNum}
                      </p>
                      <p className="font-headline text-[10px] uppercase opacity-70 mt-0.5">
                        {isApproved ? "APPROVED" : isCurrent ? "REVIEWING" : "PENDING"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ── COMIC CANVAS ─────────────────────────── */}
          <section className="lg:col-span-9 space-y-8">

            {isComplete ? (
              /* ── Completion screen ───────────────── */
              <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
                <div className="w-40 h-40 bg-secondary-bg ink-border flex items-center justify-center comic-burst">
                  <span className="font-headline text-5xl font-black text-black">★</span>
                </div>

                <h2
                  className="font-headline text-5xl md:text-6xl font-black italic uppercase"
                  style={{ filter: "drop-shadow(4px 4px 0px rgba(186,0,21,1))" }}
                >
                  YOUR COMIC
                  <br />
                  IS READY!
                </h2>

                <p className="font-body text-on-surface-muted text-sm">
                  All {totalPages} pages approved. Your masterpiece is written in ink forever.
                </p>

                <div className="relative mt-4">
                  <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
                  <Link
                    href={`/comic/${comicId}`}
                    className="relative bg-primary ink-border px-14 py-5 font-headline text-2xl font-black italic uppercase text-white tracking-wide hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 block"
                  >
                    VIEW COMIC →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Error banner */}
                {error && (
                  <div className="bg-primary ink-border px-6 py-2" style={{ transform: "rotate(-1deg)" }}>
                    <p className="font-headline text-sm font-black text-white uppercase">{error}</p>
                  </div>
                )}

                {/* Page indicator */}
                <div className="text-center">
                  <div className="bg-secondary-bg ink-border ink-shadow-sm px-6 py-2 inline-block" style={{ transform: "rotate(1deg)" }}>
                    <span className="font-headline text-lg font-black uppercase">
                      Page {currentPageNumber} of {totalPages}
                    </span>
                  </div>
                </div>

                {/* Generating overlay */}
                {isGeneratingPage && (
                  <div className="flex flex-col items-center justify-center gap-6 py-16">
                    <div className="bg-secondary-bg ink-border ink-shadow px-12 py-8 animate-pulse" style={{ transform: "rotate(-1deg)" }}>
                      <span className="font-headline text-3xl font-black uppercase">
                        GENERATING PAGE {currentPageNumber}...
                      </span>
                    </div>
                    <p className="font-body text-sm text-on-surface-muted italic">
                      Your AI artist is drawing this page. This may take a moment...
                    </p>
                  </div>
                )}

                {/* Generated page image */}
                {currentPage && currentImageUrl && (
                  <>
                    <div className="relative">
                      {/* Comic page frame */}
                      <div className="bg-white ink-border ink-shadow-lg p-3">
                        <div className="relative w-full border-4 border-black overflow-hidden" style={{ aspectRatio: "2/3" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentImageUrl}
                            alt={`Comic page ${currentPageNumber}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Regenerating overlay */}
                      {isRegenerating && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                          <div
                            className="bg-primary ink-border px-10 py-5 text-white font-headline text-3xl font-black italic animate-pulse"
                            style={{ transform: "rotate(-2deg)" }}
                          >
                            RE-INKING...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Version thumbnails */}
                    {versionsCount > 1 && (
                      <div className="flex gap-3 items-center flex-wrap">
                        <span className="font-headline text-xs font-black uppercase text-on-surface-muted">
                          VERSIONS:
                        </span>
                        {currentPage.versions.map((v, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedVersion(i)}
                            className={`w-16 h-24 ink-border overflow-hidden cursor-pointer transition-all ${
                              selectedVersion === i ? "ring-4 ring-primary scale-110" : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={v.imageUrl}
                              alt={`Version ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Director's Notes */}
                    <div className="relative pt-3">
                      <div className="absolute -top-3 left-6 bg-surface-white ink-border px-3 py-1 font-headline text-xs font-black uppercase z-10">
                        DIRECTOR&apos;S NOTES
                      </div>
                      <div className="bg-surface-white ink-border ink-shadow p-6">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          disabled={isRegenerating}
                          rows={3}
                          placeholder="REWRITE THE DESTINY... (e.g. 'More lightning! Make the villain a giant robot!')"
                          className="w-full bg-surface-low ink-border px-4 py-3 font-body text-base outline-none focus:border-primary transition-colors resize-none placeholder:text-on-surface-muted/60 placeholder:italic disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {/* Regeneration count */}
                    {versionsCount > 1 && (
                      <p className="text-center font-headline text-xs font-black uppercase text-on-surface-muted">
                        {versionsCount - 1} of 3 regenerations used
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-center items-center gap-8 pt-2">
                      {/* RE-INK! */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-primary-dim ink-border translate-x-2 translate-y-2 transition-opacity ${!canRegenerate || isRegenerating ? "opacity-30" : ""}`} />
                        <button
                          onClick={handleReink}
                          disabled={!canRegenerate || isRegenerating}
                          className="relative bg-primary text-white ink-border px-10 py-5 font-headline text-3xl font-black italic uppercase tracking-tight hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer"
                        >
                          RE-INK!
                        </button>
                      </div>

                      {/* THE SAGA CONTINUES / WRAP IT UP */}
                      <div className="relative">
                        <div className={`absolute inset-0 bg-on-secondary-container ink-border translate-x-2 translate-y-2 transition-opacity ${isRegenerating || isApproving ? "opacity-30" : ""}`} />
                        <button
                          onClick={handleContinue}
                          disabled={isRegenerating || isApproving}
                          className="relative bg-secondary-bg text-black ink-border px-8 py-5 font-headline text-xl font-black italic uppercase tracking-tight hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer flex items-center gap-3"
                        >
                          {isApproving ? "SAVING..." : isLastPage ? "WRAP IT UP!" : "THE SAGA CONTINUES..."}
                          <span className="text-2xl leading-none">›</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        </div>
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
