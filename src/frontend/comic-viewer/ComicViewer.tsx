"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Placeholder images (all from lh3.googleusercontent.com — already whitelisted) ──

// From view.html
const IMG_SPLASH =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBevTzAZfXVATcRXxmFL0VMdhCCPH__KGk-VM14EH2FKohdBoOnDjJpqNs5tz3PNV_SUspP8cFUlC-sr4tf_j5qyxd6sXBmCuMSofRPhS7WNcfbiGGCxM4IEZDnRpgqqcI7PX3UuJIvqMEaxSx5KrkfTS2EXCJ8U8zey4vC5irwk6TLMJXtoLgG2uP8n4wpM0iSlE-kLb9XwXWPHKyHKsufNqgycYaCkPcAsR4biaziwWD73yZA5dsNXVua_QuCPJPh3xusljAUT6zM";
const IMG_EYE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD-LLiZ0kEQi5rxUtJxqIRKnikQjMPHj_P0lenTyGtRBPKw9U2hEFxuyclr6vh9RvMOGLhLJ-aX_mxyv67T7-SJlN0ckG1Dq5UFxFYe1G5I5Zj7kURVrhlKy2RjQSGf1OMa-SspRd-5KgcF73qlFmoiyN-a-YYdxhRDAk0Y4hKnUMy4EI2Fv1bMkMG6nIJDFS50BoaSDCsja4wqwRIvUaE6amxCtkFrJUJ6yYr3XJDYAMTpFWOBrktxMalX1TtPU3pTXBqzYuJ5hWdt";
const IMG_GAUNTLET =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClNefjOSuGWspvlKQpckoRWFWvDDXQQvvi0PKd7u_n2OvVN7WlKaWQCd5jJuMR5uQ6AAMoKrdqWceFt9QftG9a3e59HTutljZOP-hdvzBiU15Adk54Heg6hKeG5wuD8EFGS1G0yHm7RdzOJVVcGmeMruoFHG8WsSPVd7Vuwv65UOfjo9IJNToRkuAeDv2trXUOz2uSdNSAexj_nIzt_EuHh86oTBsF0yuMGHx7yGiu9EmLXQxETWSPt4miuvCILWA5cHfnAawjVsi9";
const IMG_LEAP =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBRjHJmjHEs4eaYo7tuGR0l5s9Q0RFovaCIAn8fBLaFVLvPoaoFgrn2MT4y56qbbYDbDQ-npKiFbDZspf25MOdep_VRaoPYhC3OdiWdBjOj1JkQmaCnxY5cIff4YRQVpYj_UHyOlA1-yNBVEZJMH49-3yAPeyBtR0zV_NRMSIfrscdBpuGCoJasHYeUlJQHQ8vJhAK_mr3lRxxqQeCKVV_u1wND_ftGMEl19JT7ZBeJw_1kaYDAy3QX43ktYuXAZ3B6sVVFjV";

// From supervise.html
const IMG_CITY =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaXOS-OMDzDs4FZHgTEFidk6Rnn0cFp1fLk2UoXTEeh8QSJbDDjpeaXivgklHmtM3g3nQfrhyYlPy9NYkJKrdRBxieX1Kf6WPw7AuARRx-F1G-NVIvuG-cA0Q1gW6FYgv_tsFs2magLVa0CRNpoYsCpXc3UkQhYIQDet39_G8cS3rOGDL2cbC8LMCh20bwGa77kvqEGqM0D2J4utoLIgosNnb8iQRRBXscCZK73p2W5J4zUz8LnCdea80LGgmD6rDODkLfAECZ-tvy";
const IMG_WIDE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBP6nBTNYC10nEXTbuA_NpgMZa45ur15qZyIcDg6KSDIAymX1YxdPOqv6yhco_c6FNyUIPMu2BTajRLgXo0fBUOgIZCTtY6_kfAiNco7Pt4xojpJ3pQ_ACtoDJaCE85z5en2-iuJIwCkm5T_linoAfMzEp5JD3nMa_6kX92dM0W-fP8MMz_T4-TUGh35uNtdqjlhDysz_Fe2_gnfqHRdKhevkz-i03muu3sctgD121Uzb2wGlLRnyrNjVTnUrqLxbYsMPhvmjgJMzmc";

// ── Hardcoded comic pages ──────────────────────────────────────────────────

const PAGES = [
  {
    pageNumber: 1,
    caption: "MEANWHILE...",
    sfx: "WHOOM!",
    badge: "THREAT LEVEL: OMEGA",
    quote: "THE CITY CRIED OUT FOR A CHAMPION... BUT ALL THEY GOT WAS ME.",
    // [splash, action, detail, strip]
    panels: [IMG_SPLASH, IMG_EYE, IMG_GAUNTLET, IMG_LEAP],
  },
  {
    pageNumber: 2,
    caption: "THE CHASE BEGINS!",
    sfx: "KRAKK!",
    badge: "SPEED: MAXIMUM",
    quote: "RUNNING WAS NEVER AN OPTION. NEITHER WAS LOSING.",
    panels: [IMG_CITY, IMG_EYE, IMG_GAUNTLET, IMG_WIDE],
  },
  {
    pageNumber: 3,
    caption: "THE FINAL SHOWDOWN!",
    sfx: "BOOM!",
    badge: "CRITICAL HIT!",
    quote: "IN THE END, ALL THAT REMAINED WAS THE TRUTH — AND THE TRUTH HURT.",
    panels: [IMG_WIDE, IMG_LEAP, IMG_SPLASH, IMG_CITY],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function ComicViewer() {
  const [pageIdx, setPageIdx] = useState(0);
  const page = PAGES[pageIdx];
  const isFirst = pageIdx === 0;
  const isLast = pageIdx === PAGES.length - 1;

  const prev = () => setPageIdx((i) => Math.max(0, i - 1));
  const next = () => setPageIdx((i) => Math.min(PAGES.length - 1, i + 1));

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

        <div className="bg-secondary-bg ink-border px-4 py-1 font-headline text-xs font-black uppercase" style={{ transform: "rotate(1deg)" }}>
          INSPECTOR WHISKERS AND THE STOLEN STAR
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main className="flex-1 pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">

        {/* Page navigation row */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* PREVIOUS */}
          <button
            onClick={prev}
            disabled={isFirst}
            className="bg-primary text-white ink-border px-8 py-4 font-headline font-black text-xl italic uppercase tracking-tight ink-shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ transform: "rotate(-2deg)" }}
          >
            ← PREVIOUS PAGE
          </button>

          {/* Page counter */}
          <div
            className="bg-secondary-bg ink-border px-10 py-4 ink-shadow flex flex-col items-center"
            style={{ transform: "rotate(1deg)" }}
          >
            <span className="font-headline text-black text-xs tracking-widest mb-1 uppercase">
              Inspector Whiskers — The Stolen Star
            </span>
            <span className="font-headline font-black text-2xl italic text-black uppercase">
              PAGE {page.pageNumber} OF {PAGES.length}
            </span>
          </div>

          {/* NEXT */}
          <button
            onClick={next}
            disabled={isLast}
            className="bg-primary text-white ink-border px-8 py-4 font-headline font-black text-xl italic uppercase tracking-tight ink-shadow hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ transform: "rotate(2deg)" }}
          >
            NEXT PAGE →
          </button>
        </div>

        {/* ── COMIC CANVAS ───────────────────────────────── */}
        <div className="bg-white ink-border p-3 md:p-5 ink-shadow-lg mb-8">
          {/*
            Bento grid — 12 cols, 6 rows:
            [1] Splash   → cols 1-8,  rows 1-4   (big, left)
            [2] Action   → cols 9-12, rows 1-2   (top right)
            [3] Detail   → cols 9-12, rows 3-4   (mid right)
            [4] Strip    → cols 1-4,  rows 5-6   (bottom left)
            [5] Narrative→ cols 5-12, rows 5-6   (bottom right, text)
          */}
          <div
            className="grid grid-cols-12 grid-rows-6 gap-3"
            style={{ minHeight: "680px" }}
          >
            {/* [1] Splash panel — large hero scene */}
            <div className="col-span-8 row-span-4 border-4 border-black relative overflow-hidden group">
              <Image
                src={page.panels[0]}
                alt="Comic splash panel"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Caption badge */}
              <div
                className="absolute top-4 left-4 z-10 bg-secondary-bg ink-border px-4 py-2 font-headline italic font-black text-base ink-shadow-sm"
                style={{ transform: "rotate(-3deg)" }}
              >
                {page.caption}
              </div>
            </div>

            {/* [2] Action panel — close-up with SFX */}
            <div className="col-span-4 row-span-2 border-4 border-black relative overflow-hidden bg-tertiary-container">
              <Image
                src={page.panels[1]}
                alt="Comic action panel"
                fill
                className="object-cover"
                style={{ filter: "grayscale(30%) contrast(1.4) mix-blend-multiply" }}
              />
              <div
                className="absolute bottom-3 right-3 bg-white ink-border px-3 py-1 font-headline italic font-black text-2xl rotate-3 text-primary"
                style={{ boxShadow: "3px 3px 0px 0px #000" }}
              >
                {page.sfx}
              </div>
            </div>

            {/* [3] Detail panel — tech/object close-up */}
            <div className="col-span-4 row-span-2 border-4 border-black overflow-hidden relative">
              <Image
                src={page.panels[2]}
                alt="Comic detail panel"
                fill
                className="object-cover"
              />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary ink-border px-4 py-1 text-white font-headline text-xs font-black uppercase"
                style={{ transform: "translateX(-50%) translateY(-50%) rotate(-12deg)" }}
              >
                {page.badge}
              </div>
            </div>

            {/* [4] Dynamic strip — action image */}
            <div className="col-span-4 row-span-2 border-4 border-black overflow-hidden relative group">
              <Image
                src={page.panels[3]}
                alt="Comic strip panel"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* [5] Narrative box — text panel */}
            <div className="col-span-8 row-span-2 border-4 border-black bg-surface-low p-6 flex flex-col justify-center gap-4 ben-day-dots">
              <div className="w-12 h-1 bg-black" />
              <p className="font-headline italic text-2xl md:text-3xl font-black leading-tight text-on-surface">
                &ldquo;{page.quote}&rdquo;
              </p>
              <div className="flex justify-end">
                <div className="w-6 h-6 border-2 border-black bg-secondary-bg" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FIXED BOTTOM NAV ────────────────────────────── */}

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
