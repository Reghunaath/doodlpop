"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { FollowUpQuestion } from "@/backend/lib/types";
import { getComic, refineComic } from "@/frontend/lib/api";

export default function CreateWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const comicId = searchParams.get("id");

  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customInput, setCustomInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no comic ID
  useEffect(() => {
    if (!comicId) {
      router.replace("/");
    }
  }, [comicId, router]);

  // Fetch comic to get follow-up questions
  useEffect(() => {
    if (!comicId) return;
    let cancelled = false;

    (async () => {
      try {
        const { comic } = await getComic(comicId);
        if (cancelled) return;

        const qs = comic.followUpQuestions ?? [];
        setQuestions(qs);

        // If no questions, skip straight to script
        if (qs.length === 0) {
          await refineComic(comicId, { answers: {} });
          router.replace(`/script/${comicId}`);
          return;
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
  }, [comicId, router]);

  const done = questions.length > 0 && currentQ >= questions.length;

  const handleAnswer = (answer: string) => {
    const q = questions[currentQ];
    setAnswers((prev) => ({ ...prev, [q.id]: answer }));
    setCurrentQ((prev) => prev + 1);
    setCustomInput("");
  };

  const handleCustomSubmit = () => {
    if (!customInput.trim()) return;
    handleAnswer(customInput.trim());
  };

  const handleSkipAll = async () => {
    if (!comicId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await refineComic(comicId, { answers: {} });
      router.push(`/script/${comicId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setIsSubmitting(false);
    }
  };

  const handleSubmitAll = async () => {
    if (!comicId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await refineComic(comicId, { answers });
      router.push(`/script/${comicId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setIsSubmitting(false);
    }
  };

  if (!comicId) return null;

  const bubbleText = isLoading
    ? "HOLD ON, TRUE BELIEVER! I'M COOKING UP THE PERFECT QUESTIONS FOR YOUR STORY..."
    : error
    ? error
    : done
    ? "EXCELLENT WORK! YOUR STORY PROFILE IS COMPLETE — LET'S WRITE THAT SCRIPT!"
    : "LISTEN UP, TRUE BELIEVER! WE NEED THE SCOOP ON YOUR NEXT BIG HERO! ANSWER ME TRUTHFULLY!";

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
              className="absolute -top-8 -left-2 bg-primary text-white ink-border px-4 py-1 font-headline text-sm uppercase"
              style={{ transform: "rotate(-3deg)" }}
            >
              ISSUE #2
            </div>
            <h1
              className="font-headline text-5xl md:text-7xl font-black italic uppercase text-on-surface"
              style={{
                transform: "rotate(-1deg)",
                display: "inline-block",
                filter: "drop-shadow(4px 4px 0px rgba(186,0,21,1))",
              }}
            >
              STORY
              <br />
              BUILDER
            </h1>
          </div>

          <div
            className="bg-secondary-bg p-4 ink-border ink-shadow max-w-xs hidden md:block"
            style={{ transform: "rotate(2deg)" }}
          >
            <p className="font-headline text-xs uppercase leading-tight font-black">
              ANSWER THE QUESTIONS TO SHAPE YOUR STORY! ONLY A FEW STEPS AWAY!
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── LEFT SIDEBAR ─────────────────────────── */}
          <aside className="lg:col-span-3 flex flex-col items-center gap-8">
            {/* ── Editor portrait ───────────────────── */}
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

            {/* ── Speech bubble ─────────────────────── */}
            <div className="bg-surface-white ink-border ink-shadow p-5 relative speech-bubble-tail-sm w-full mt-4">
              <p className="font-body font-bold text-center leading-snug text-sm uppercase">
                &quot;{bubbleText}&quot;
              </p>
            </div>

            {/* Skip All button */}
            {!done && !isLoading && questions.length > 0 && (
              <button
                type="button"
                onClick={handleSkipAll}
                disabled={isSubmitting}
                className="w-full bg-surface-card ink-border px-4 py-3 font-headline text-sm font-black uppercase text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
              >
                SKIP ALL QUESTIONS →
              </button>
            )}
          </aside>

          {/* ── CHAT CANVAS ──────────────────────────── */}
          <section className="lg:col-span-9 space-y-8">

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="bg-secondary-bg ink-border ink-shadow px-10 py-6 animate-pulse">
                  <span className="font-headline text-2xl font-black uppercase">
                    LOADING QUESTIONS...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Previous Q&A pairs */}
                {questions.slice(0, currentQ).map((q, i) => (
                  <div key={q.id} className="space-y-4">
                    {/* Question bubble */}
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-surface-white ink-border ink-shadow p-5">
                        <p className="font-headline text-sm uppercase text-primary mb-1">
                          Question {i + 1} of {questions.length}
                        </p>
                        <p className="font-body text-base italic text-on-surface">
                          &quot;{q.question}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Answer bubble */}
                    <div className="flex justify-end">
                      <div
                        className="bg-tertiary-container ink-border ink-shadow-sm px-6 py-3"
                        style={{ transform: "rotate(1deg)" }}
                      >
                        <span className="font-headline text-[10px] uppercase text-on-tertiary-container/60 block mb-0.5">
                          Your Answer
                        </span>
                        <p className="font-headline text-lg font-black text-on-tertiary-container">
                          {answers[q.id]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Active question or done */}
                {!done ? (
                  <div className="flex justify-start">
                    <div className="w-full bg-surface-white ink-border ink-shadow p-8">
                      <p className="font-headline text-lg uppercase text-primary mb-1">
                        Question {currentQ + 1} of {questions.length}
                      </p>
                      <p className="font-body text-xl font-bold text-on-surface mb-1">
                        &quot;{questions[currentQ].question}&quot;
                      </p>
                      <p className="font-body text-sm italic text-on-surface-muted mb-8">
                        Type your answer below, or skip to move on.
                      </p>

                      {/* Text input for answer */}
                      <div className="relative pt-5 border-t-4 border-dashed border-outline-variant">
                        <label className="font-headline text-[10px] uppercase absolute -top-3 left-4 bg-surface-white px-2 font-black text-on-surface-muted">
                          YOUR ANSWER...
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCustomSubmit()
                            }
                            placeholder="Type your answer here..."
                            className="flex-1 bg-surface-low ink-border px-4 py-3 font-body text-base outline-none focus:border-primary transition-colors"
                          />
                          <button
                            onClick={handleCustomSubmit}
                            className="bg-ink text-white ink-border px-5 py-3 font-headline font-black text-lg hover:bg-primary transition-colors cursor-pointer"
                          >
                            ▶
                          </button>
                        </div>
                      </div>

                      {/* Skip this question */}
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentQ((prev) => prev + 1);
                          setCustomInput("");
                        }}
                        className="mt-4 font-headline text-xs font-black uppercase text-on-surface-muted hover:text-primary transition-colors cursor-pointer"
                      >
                        SKIP THIS QUESTION →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* All done — generate CTA */
                  <div className="flex flex-col gap-8 py-4">
                    <p className="font-headline text-lg font-black uppercase text-on-surface-muted text-center">
                      Story profile complete — ready to write your script!
                    </p>

                    <div className="flex justify-center pt-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
                        <button
                          onClick={handleSubmitAll}
                          disabled={isSubmitting}
                          className="relative bg-primary ink-border px-16 py-6 font-headline text-3xl font-black italic uppercase text-white tracking-wide hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "SUBMITTING..." : "GENERATE SCRIPT →"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PROGRESS INDICATOR ───────────────── */}
                {questions.length > 0 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    {questions.map((q, i) => (
                      <div key={q.id} className="flex items-center gap-2">
                        <div
                          className={`w-12 h-12 ink-border flex items-center justify-center font-headline text-xl font-black transition-all ${
                            i < currentQ
                              ? "bg-primary text-white"
                              : i === currentQ
                              ? "bg-secondary-bg text-black"
                              : "bg-surface-card text-on-surface-muted opacity-50"
                          }`}
                        >
                          {i < currentQ ? "✓" : i + 1}
                        </div>
                        {i < questions.length - 1 && (
                          <div
                            className={`h-1 w-10 transition-colors ${
                              i < currentQ ? "bg-ink" : "bg-outline-variant"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
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
