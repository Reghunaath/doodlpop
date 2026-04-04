"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Placeholder images (lh3.googleusercontent.com is whitelisted) ──────────

const IMG_CITY =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaXOS-OMDzDs4FZHgTEFidk6Rnn0cFp1fLk2UoXTEeh8QSJbDDjpeaXivgklHmtM3g3nQfrhyYlPy9NYkJKrdRBxieX1Kf6WPw7AuARRx-F1G-NVIvuG-cA0Q1gW6FYgv_tsFs2magLVa0CRNpoYsCpXc3UkQhYIQDet39_G8cS3rOGDL2cbC8LMCh20bwGa77kvqEGqM0D2J4utoLIgosNnb8iQRRBXscCZK73p2W5J4zUz8LnCdea80LGgmD6rDODkLfAECZ-tvy";
const IMG_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAaInIku4m79ErAUXEZ-NfAmkfQpJNQEctvlEeqjKEtUcnIGAaQgItoGzp1UT_eFaxrfSba71tnI9o77Bqr7_exurj4LcRwas_Hu6rg2yKtEuqlk_ZSYZF_-1UjodLnQyx2RNDLrn20bLfhigQUNcdJxEsFm9ZIWcqrnFiS-wZfak2cu4C8uv43QRwr3TExFcYZFyfUczGxYsgeyxDIKQaK4eO5Chm1CUaKxxaKDwxMOFKSR9FxMUnOL7ogphCMpSqGfj-_Lt9oHMYG";
const IMG_WIDE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBP6nBTNYC10nEXTbuA_NpgMZa45ur15qZyIcDg6KSDIAymX1YxdPOqv6yhco_c6FNyUIPMu2BTajRLgXo0fBUOgIZCTtY6_kfAiNco7Pt4xojpJ3pQ_ACtoDJaCE85z5en2-iuJIwCkm5T_linoAfMzEp5JD3nMa_6kX92dM0W-fP8MMz_T4-TUGh35uNtdqjlhDysz_Fe2_gnfqHRdKhevkz-i03muu3sctgD121Uzb2wGlLRnyrNjVTnUrqLxbYsMPhvmjgJMzmc";

// ── Hardcoded pages ────────────────────────────────────────────────────────

const PAGES = [
  {
    pageNumber: 1,
    caption: "MEANWHILE... IN THE HEART OF NEON CITY!",
    sfx: "WHOOM!",
    panelOneCaption: "The Grid Never Sleeps.",
    dialogue: '"The city never forgives, and neither do I."',
  },
  {
    pageNumber: 2,
    caption: "THE CHASE BEGINS!",
    sfx: "KRAKK!",
    panelOneCaption: "Rooftop. 3 AM. Rain.",
    dialogue: '"You can\'t outrun the truth, Malware!"',
  },
  {
    pageNumber: 3,
    caption: "THE FINAL SHOWDOWN!",
    sfx: "BOOM!",
    panelOneCaption: "End of the line.",
    dialogue: '"This ends HERE! Your reign of binary terror is OVER!"',
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function SupervisedViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [approvedPages, setApprovedPages] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const page = PAGES[currentPage];
  const isLastPage = currentPage >= PAGES.length - 1;

  // Fake 2-second re-ink delay
  useEffect(() => {
    if (!isRegenerating) return;
    const timer = setTimeout(() => setIsRegenerating(false), 2000);
    return () => clearTimeout(timer);
  }, [isRegenerating]);

  const handleReink = () => {
    setIsRegenerating(true);
    setNotes("");
  };

  const handleContinue = () => {
    const next = new Set(approvedPages).add(currentPage);
    setApprovedPages(next);
    if (isLastPage) {
      setIsComplete(true);
    } else {
      setCurrentPage((p) => p + 1);
      setNotes("");
    }
  };

  const bubbleText = isComplete
    ? "MAGNIFICENT! YOUR MASTERPIECE IS COMPLETE! THE SAGA IS WRITTEN IN INK FOREVER!"
    : isRegenerating
    ? "HOLD ON, TRUE BELIEVER! WE'RE INKING A BRAND NEW VERSION RIGHT NOW..."
    : "REVIEW THIS PAGE! LOVE IT? HIT THE SAGA CONTINUES! NOT HAPPY? GIVE NOTES AND RE-INK!";

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
              COMIC
              <br />
              VIEWER
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
                "{bubbleText}"
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

              {PAGES.map((p, i) => {
                const isApproved = approvedPages.has(i) || isComplete;
                const isCurrent = i === currentPage && !isComplete;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 ink-border px-3 py-2 transition-colors duration-200 ${
                      isApproved
                        ? "bg-primary text-white"
                        : isCurrent
                        ? "bg-secondary-bg text-black"
                        : "bg-surface-card text-on-surface-muted opacity-50"
                    }`}
                  >
                    <span className="font-headline text-2xl font-black w-8 text-center leading-none">
                      {isApproved ? "✓" : isCurrent ? "◉" : String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-headline text-xs font-black uppercase leading-none">
                        Page {p.pageNumber}
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
                <div
                  className="w-40 h-40 bg-secondary-bg ink-border flex items-center justify-center comic-burst"
                >
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
                  All {PAGES.length} pages approved. Your masterpiece is written in ink forever.
                </p>

                <div className="relative mt-4">
                  <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
                  <Link
                    href="/"
                    className="relative bg-primary ink-border px-14 py-5 font-headline text-2xl font-black italic uppercase text-white tracking-wide hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 block"
                  >
                    GO TO LIBRARY →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* ── Comic panel frame ─────────────── */}
                <div className="relative mt-6">
                  {/* Caption badge */}
                  <div
                    className="absolute -top-4 -left-2 z-10 bg-secondary-bg ink-border px-4 py-2 font-headline font-black italic text-sm ink-shadow-sm"
                    style={{ transform: "rotate(-2deg)" }}
                  >
                    {page.caption}
                  </div>

                  {/* White comic page frame */}
                  <div className="bg-white ink-border ink-shadow-lg p-3 grid grid-cols-2 gap-3">

                    {/* Panel 1 — top left: establishing shot */}
                    <div className="relative h-52 border-4 border-black overflow-hidden">
                      <Image
                        src={IMG_CITY}
                        alt="Comic panel — establishing shot"
                        fill
                        className="object-cover"
                        style={{ filter: "contrast(1.2) saturate(1.4)" }}
                      />
                      <div className="absolute bottom-3 left-3 bg-white border-2 border-black px-2 py-1 font-headline font-bold text-xs uppercase -rotate-1">
                        {page.panelOneCaption}
                      </div>
                    </div>

                    {/* Panel 2 — top right: action close-up with SFX burst */}
                    <div className="relative h-52 border-4 border-black overflow-hidden">
                      <Image
                        src={IMG_HERO}
                        alt="Comic panel — action close-up"
                        fill
                        className="object-cover"
                        style={{ filter: "contrast(1.25) saturate(1.5)" }}
                      />
                      <div
                        className="absolute top-3 right-3 comic-burst bg-primary text-white font-headline font-black flex items-center justify-center w-20 h-20 text-lg border-4 border-black"
                        style={{ transform: "rotate(-12deg)", boxShadow: "4px 4px 0px 0px #000" }}
                      >
                        {page.sfx}
                      </div>
                    </div>

                    {/* Panel 3 — bottom: wide dramatic shot with dialogue bubble */}
                    <div className="col-span-2 relative h-64 border-4 border-black overflow-hidden">
                      <Image
                        src={IMG_WIDE}
                        alt="Comic panel — wide dramatic shot"
                        fill
                        className="object-cover"
                        style={{ filter: "contrast(1.25) saturate(1.5)" }}
                      />
                      {/* Dialogue speech bubble */}
                      <div className="absolute bottom-5 right-6 max-w-[55%] bg-white border-4 border-black px-4 py-3 font-headline font-bold text-sm text-center rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {page.dialogue}
                      </div>
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

                {/* ── Director's Notes ──────────────── */}
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

                {/* ── Action buttons ────────────────── */}
                <div className="flex flex-wrap justify-center items-center gap-8 pt-2">

                  {/* RE-INK! */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-primary-dim ink-border translate-x-2 translate-y-2 transition-opacity ${!notes.trim() || isRegenerating ? "opacity-30" : ""}`} />
                    <button
                      onClick={handleReink}
                      disabled={!notes.trim() || isRegenerating}
                      className="relative bg-primary text-white ink-border px-10 py-5 font-headline text-3xl font-black italic uppercase tracking-tight hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer"
                    >
                      RE-INK!
                    </button>
                  </div>

                  {/* THE SAGA CONTINUES / WRAP IT UP */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-on-secondary-container ink-border translate-x-2 translate-y-2 transition-opacity ${isRegenerating ? "opacity-30" : ""}`} />
                    <button
                      onClick={handleContinue}
                      disabled={isRegenerating}
                      className="relative bg-secondary-bg text-black ink-border px-8 py-5 font-headline text-xl font-black italic uppercase tracking-tight hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer flex items-center gap-3"
                    >
                      {isLastPage ? "WRAP IT UP!" : "THE SAGA CONTINUES..."}
                      <span className="text-2xl leading-none">›</span>
                    </button>
                  </div>
                </div>
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
