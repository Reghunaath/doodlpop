"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Script, GenerationMode } from "@/backend/lib/types";
import { generateScript, regenerateScript, approveComic } from "@/frontend/lib/api";
import { updateSavedComic } from "@/frontend/lib/local-storage";
import ModeToggle from "./ModeToggle";

interface ScriptViewerProps {
  comicId: string;
}

export default function ScriptViewer({ comicId }: ScriptViewerProps) {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set([1]));
  const [mode, setMode] = useState<GenerationMode>("automated");

  const [isGenerating, setIsGenerating] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showRegenInput, setShowRegenInput] = useState(false);
  const [regenFeedback, setRegenFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generate script on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await generateScript(comicId);
        if (cancelled) return;
        setScript(res.script);
        updateSavedComic(comicId, { title: res.script.title, status: "script_draft" });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to generate script");
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    })();

    return () => { cancelled = true; };
  }, [comicId]);

  const togglePage = (pageNum: number) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  const updateTitle = (val: string) => setScript((s) => s ? { ...s, title: val } : s);
  const updateSynopsis = (val: string) => setScript((s) => s ? { ...s, synopsis: val } : s);

  const updatePanelField = (
    pageIdx: number,
    panelIdx: number,
    field: "description" | "caption",
    val: string
  ) => {
    setScript((s) => {
      if (!s) return s;
      const pages = s.pages.map((p, pi) =>
        pi !== pageIdx
          ? p
          : {
              ...p,
              panels: p.panels.map((pn, pni) =>
                pni !== panelIdx ? pn : { ...pn, [field]: val || null }
              ),
            }
      );
      return { ...s, pages };
    });
  };

  const updateDialogue = (
    pageIdx: number,
    panelIdx: number,
    lineIdx: number,
    field: "speaker" | "text",
    val: string
  ) => {
    setScript((s) => {
      if (!s) return s;
      const pages = s.pages.map((p, pi) =>
        pi !== pageIdx
          ? p
          : {
              ...p,
              panels: p.panels.map((pn, pni) =>
                pni !== panelIdx
                  ? pn
                  : {
                      ...pn,
                      dialogue: pn.dialogue.map((d, di) =>
                        di !== lineIdx ? d : { ...d, [field]: val }
                      ),
                    }
              ),
            }
      );
      return { ...s, pages };
    });
  };

  const handleRegenerate = async () => {
    const feedback = regenFeedback.trim();
    if (!feedback) return;

    setIsRegenerating(true);
    setError(null);
    try {
      const res = await regenerateScript(comicId, { feedback });
      setScript(res.script);
      updateSavedComic(comicId, { title: res.script.title });
      setShowRegenInput(false);
      setRegenFeedback("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate script");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!script) return;

    setIsApproving(true);
    setError(null);
    try {
      await approveComic(comicId, { script, generationMode: mode });
      updateSavedComic(comicId, { status: "script_approved" });
      if (mode === "automated") {
        router.push(`/comic/${comicId}`);
      } else {
        router.push(`/review/${comicId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve script");
      setIsApproving(false);
    }
  };

  const bubbleText = isGenerating
    ? "HOLD TIGHT! I'M WRITING THE GREATEST SCRIPT SINCE SLICED COMICS..."
    : isRegenerating
    ? "RE-WRITING! MAKING IT EVEN MORE EPIC THIS TIME..."
    : error
    ? error
    : "THIS IS YOUR MASTERPIECE IN THE MAKING! EDIT ANY PANEL, ANY LINE — THEN HIT GENERATE!";

  return (
    <div className="min-h-screen flex flex-col bg-surface ben-day-dots">
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="flex items-center px-8 py-4 border-b-4 border-black bg-surface">
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
      </nav>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-black pb-4 gap-4">
          <div className="relative">
            <div
              className="absolute -top-8 -left-2 bg-tertiary text-on-tertiary ink-border px-4 py-1 font-headline text-sm uppercase"
              style={{ transform: "rotate(-3deg)" }}
            >
              ISSUE #3
            </div>
            <h1
              className="font-headline text-5xl md:text-7xl font-black italic uppercase text-on-surface"
              style={{
                transform: "rotate(-1deg)",
                display: "inline-block",
                filter: "drop-shadow(4px 4px 0px rgba(186,0,21,1))",
              }}
            >
              YOUR
              <br />
              SCRIPT
            </h1>
          </div>

          <div
            className="bg-secondary-bg p-4 ink-border ink-shadow max-w-xs hidden md:block"
            style={{ transform: "rotate(2deg)" }}
          >
            <p className="font-headline text-xs uppercase leading-tight font-black">
              EDIT THE SCRIPT BELOW! EVERY PANEL. EVERY LINE. MAKE IT YOURS!
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT SIDEBAR ─────────────────────────── */}
          <aside className="lg:col-span-3 flex flex-col items-center gap-8">
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

            <div className="bg-surface-white ink-border ink-shadow p-5 relative speech-bubble-tail-sm w-full mt-4">
              <p className="font-body font-bold text-center leading-snug text-sm uppercase">
                &quot;{bubbleText}&quot;
              </p>
            </div>

            {/* Script stats */}
            {script && (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-1 flex-1 bg-black" />
                  <span className="font-headline text-xs font-black uppercase tracking-widest text-on-surface-muted whitespace-nowrap">
                    Script Stats
                  </span>
                  <div className="h-1 flex-1 bg-black" />
                </div>
                {[
                  { label: "Pages", value: script.pages.length },
                  {
                    label: "Panels",
                    value: script.pages.reduce((acc, p) => acc + p.panels.length, 0),
                  },
                  {
                    label: "Lines",
                    value: script.pages.reduce(
                      (acc, p) =>
                        acc + p.panels.reduce((a, pn) => a + pn.dialogue.length, 0),
                      0
                    ),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center bg-surface-card ink-border px-4 py-2">
                    <span className="font-headline text-xs uppercase font-black text-on-surface-muted">
                      {label}
                    </span>
                    <span className="font-headline text-2xl font-black text-primary">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* ── SCRIPT CANVAS ────────────────────────── */}
          <section className="lg:col-span-9 space-y-6">

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center gap-6 py-24">
                <div className="bg-secondary-bg ink-border ink-shadow px-12 py-8 animate-pulse" style={{ transform: "rotate(-1deg)" }}>
                  <span className="font-headline text-3xl font-black uppercase">
                    WRITING YOUR SCRIPT...
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface-muted italic">
                  This may take a moment — your AI writer is crafting something special.
                </p>
              </div>
            ) : error && !script ? (
              <div className="flex flex-col items-center justify-center gap-6 py-24">
                <div className="bg-primary ink-border px-8 py-4">
                  <span className="font-headline text-xl font-black text-white uppercase">{error}</span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="font-headline text-sm font-black uppercase text-primary hover:underline cursor-pointer"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : script ? (
              <>
                {/* Error banner */}
                {error && (
                  <div className="bg-primary ink-border px-6 py-2" style={{ transform: "rotate(-1deg)" }}>
                    <p className="font-headline text-sm font-black text-white uppercase">{error}</p>
                  </div>
                )}

                {/* Title */}
                <div className="bg-surface-white ink-border ink-shadow p-6">
                  <label className="font-headline text-xs uppercase font-black text-primary block mb-2">
                    Comic Title
                  </label>
                  <input
                    type="text"
                    value={script.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    className="w-full bg-surface-low ink-border px-4 py-3 font-headline text-xl font-black uppercase outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Synopsis */}
                <div className="bg-surface-white ink-border ink-shadow p-6">
                  <label className="font-headline text-xs uppercase font-black text-primary block mb-2">
                    Synopsis
                  </label>
                  <textarea
                    value={script.synopsis}
                    onChange={(e) => updateSynopsis(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-low ink-border px-4 py-3 font-body text-sm leading-relaxed outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {/* Regenerate with feedback */}
                <div className="flex flex-wrap gap-4 items-center">
                  {!showRegenInput ? (
                    <button
                      type="button"
                      onClick={() => setShowRegenInput(true)}
                      className="bg-surface-card ink-border px-6 py-3 font-headline text-sm font-black uppercase text-on-surface hover:bg-secondary-bg transition-colors cursor-pointer"
                    >
                      REGENERATE SCRIPT
                    </button>
                  ) : (
                    <div className="w-full bg-surface-white ink-border ink-shadow p-6 space-y-3">
                      <label className="font-headline text-xs uppercase font-black text-primary block">
                        What should change?
                      </label>
                      <textarea
                        value={regenFeedback}
                        onChange={(e) => setRegenFeedback(e.target.value)}
                        rows={2}
                        placeholder="e.g. Make the villain more menacing, add a twist ending..."
                        className="w-full bg-surface-low ink-border px-4 py-3 font-body text-sm outline-none focus:border-primary transition-colors resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleRegenerate}
                          disabled={!regenFeedback.trim() || isRegenerating}
                          className="bg-primary ink-border px-6 py-2 font-headline text-sm font-black uppercase text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRegenerating ? "REGENERATING..." : "REGENERATE"}
                        </button>
                        <button
                          onClick={() => { setShowRegenInput(false); setRegenFeedback(""); }}
                          className="font-headline text-xs font-black uppercase text-on-surface-muted hover:text-on-surface cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pages */}
                {script.pages.map((page, pageIdx) => {
                  const isOpen = expandedPages.has(page.pageNumber);
                  return (
                    <div key={page.pageNumber} className="ink-border ink-shadow bg-surface-white overflow-hidden">
                      {/* Page header — clickable accordion toggle */}
                      <button
                        type="button"
                        onClick={() => togglePage(page.pageNumber)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-ink text-white hover:bg-primary transition-colors duration-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-headline text-3xl font-black">
                            {String(page.pageNumber).padStart(2, "0")}
                          </span>
                          <span className="font-headline text-sm uppercase font-black opacity-70">
                            Page {page.pageNumber} — {page.panels.length} panel{page.panels.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="font-headline text-2xl font-black">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {/* Panels */}
                      {isOpen && (
                        <div className="divide-y-4 divide-black">
                          {page.panels.map((panel, panelIdx) => (
                            <div key={panel.panelNumber} className="p-6 space-y-4">
                              {/* Panel header */}
                              <div className="flex items-center gap-3">
                                <div className="bg-primary text-white ink-border w-8 h-8 flex items-center justify-center font-headline text-sm font-black shrink-0">
                                  {panel.panelNumber}
                                </div>
                                <span className="font-headline text-xs uppercase font-black text-on-surface-muted">
                                  Panel {panel.panelNumber}
                                </span>
                              </div>

                              {/* Visual description */}
                              <div>
                                <label className="font-headline text-[10px] uppercase font-black text-on-surface-muted block mb-1">
                                  Visual Description
                                </label>
                                <textarea
                                  value={panel.description}
                                  onChange={(e) =>
                                    updatePanelField(pageIdx, panelIdx, "description", e.target.value)
                                  }
                                  rows={3}
                                  className="w-full bg-surface-low ink-border px-4 py-3 font-body text-sm leading-relaxed outline-none focus:border-primary transition-colors resize-none"
                                />
                              </div>

                              {/* Caption */}
                              {panel.caption !== undefined && (
                                <div>
                                  <label className="font-headline text-[10px] uppercase font-black text-on-surface-muted block mb-1">
                                    Narrator Caption
                                  </label>
                                  <input
                                    type="text"
                                    value={panel.caption ?? ""}
                                    onChange={(e) =>
                                      updatePanelField(pageIdx, panelIdx, "caption", e.target.value)
                                    }
                                    placeholder="(no caption)"
                                    className="w-full bg-surface-low ink-border px-4 py-3 font-body text-sm italic outline-none focus:border-primary transition-colors"
                                  />
                                </div>
                              )}

                              {/* Dialogue lines */}
                              {panel.dialogue.length > 0 && (
                                <div className="space-y-2">
                                  <label className="font-headline text-[10px] uppercase font-black text-on-surface-muted block">
                                    Dialogue
                                  </label>
                                  {panel.dialogue.map((line, lineIdx) => (
                                    <div key={lineIdx} className="flex gap-3 items-start">
                                      <div className="relative shrink-0">
                                        <div className="absolute inset-0 bg-secondary-bg ink-border translate-x-1 translate-y-1" />
                                        <input
                                          type="text"
                                          value={line.speaker}
                                          onChange={(e) =>
                                            updateDialogue(pageIdx, panelIdx, lineIdx, "speaker", e.target.value)
                                          }
                                          className="relative w-28 bg-surface-white ink-border px-2 py-2 font-headline text-xs font-black uppercase outline-none focus:border-primary transition-colors"
                                        />
                                      </div>
                                      <input
                                        type="text"
                                        value={line.text}
                                        onChange={(e) =>
                                          updateDialogue(pageIdx, panelIdx, lineIdx, "text", e.target.value)
                                        }
                                        className="flex-1 bg-surface-low ink-border px-4 py-2 font-body text-sm outline-none focus:border-primary transition-colors"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Mode toggle */}
                <ModeToggle value={mode} onChange={setMode} />

                {/* Generate Comic CTA */}
                <div className="flex justify-center pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-tertiary-dim ink-border translate-x-3 translate-y-3" />
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="relative bg-tertiary ink-border px-16 py-6 font-headline text-3xl font-black italic uppercase text-on-tertiary tracking-wide hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving ? "APPROVING..." : "GENERATE COMIC →"}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
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
