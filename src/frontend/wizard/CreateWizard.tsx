"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ── Hardcoded questions ────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    label: "Question 1: The Protagonist",
    question: "Who leads your story into battle?",
    subtext:
      "Every legendary comic needs an unforgettable face on the cover.",
    options: ["HUMAN", "ROBOT", "ANIMAL", "ALIEN"],
  },
  {
    id: 2,
    label: "Question 2: The Tone",
    question: "What's the mood of your comic?",
    subtext: "Set the atmosphere before the first panel is even drawn.",
    options: ["ACTION!", "COMEDY", "MYSTERY", "DRAMA"],
  },
  {
    id: 3,
    label: "Question 3: The Setting",
    question: "Where does your story unfold?",
    subtext: "The world around your hero shapes every scene.",
    options: ["CITY", "OUTER SPACE", "FANTASY REALM", "WASTELAND"],
  },
  {
    id: 4,
    label: "Question 4: The Motivation",
    question: "What pushes your hero forward?",
    subtext: "A great protagonist always has something to fight for.",
    options: ["JUSTICE!", "LOVE", "REVENGE!", "SURVIVAL"],
  },
];

// Cycles through 4 comic-book colours for option buttons
const OPTION_STYLES = [
  {
    bg: "bg-secondary-bg",
    text: "text-black",
    offset: "bg-on-secondary-container",
    rotate: "rotate-2",
  },
  {
    bg: "bg-tertiary-container",
    text: "text-on-tertiary-container",
    offset: "bg-tertiary-dim",
    rotate: "-rotate-1",
  },
  {
    bg: "bg-primary",
    text: "text-white",
    offset: "bg-primary-dim",
    rotate: "rotate-1",
  },
  {
    bg: "bg-surface-white",
    text: "text-on-surface",
    offset: "bg-surface-card",
    rotate: "-rotate-2",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function CreateWizard() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const done = currentQ >= QUESTIONS.length;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => [...prev, answer]);
    setCurrentQ((prev) => prev + 1);
    setCustomInput("");
  };

  const handleCustomSubmit = () => {
    if (!customInput.trim()) return;
    handleAnswer(customInput.trim().toUpperCase());
  };

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
              <div className="w-full aspect-square ink-border ink-shadow overflow-hidden relative bg-[#c8d8e8]">
                {/* Comic-book editor illustration */}
                <svg
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {/* Background gradient */}
                  <rect width="200" height="200" fill="#b8cfe0" />

                  {/* Ben-Day dots overlay */}
                  <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <circle cx="4" cy="4" r="1.2" fill="#000" opacity="0.08" />
                  </pattern>
                  <rect width="200" height="200" fill="url(#dots)" />

                  {/* Suit / body */}
                  <path d="M 20 200 L 20 145 Q 50 135 70 140 L 80 155 L 100 148 L 120 155 L 130 140 Q 150 135 180 145 L 180 200 Z" fill="#1a2550" stroke="#000" strokeWidth="3" />

                  {/* Tie */}
                  <polygon points="100,148 93,162 100,195 107,162" fill="#cc1122" stroke="#000" strokeWidth="2" />
                  <polygon points="93,148 107,148 104,156 96,156" fill="#aa0011" stroke="#000" strokeWidth="1.5" />

                  {/* Shirt collar */}
                  <polygon points="80,140 100,148 100,156 88,145" fill="#f5f5f5" stroke="#000" strokeWidth="2" />
                  <polygon points="120,140 100,148 100,156 112,145" fill="#f5f5f5" stroke="#000" strokeWidth="2" />

                  {/* Neck */}
                  <rect x="87" y="118" width="26" height="26" rx="4" fill="#e8b87a" stroke="#000" strokeWidth="3" />

                  {/* Head */}
                  <ellipse cx="100" cy="88" rx="52" ry="58" fill="#e8b87a" stroke="#000" strokeWidth="4" />

                  {/* Hair */}
                  <path d="M 50 75 Q 52 38 100 32 Q 148 38 150 75 Q 138 48 100 46 Q 62 48 50 75 Z" fill="#1a1a1a" stroke="#000" strokeWidth="2.5" />
                  <path d="M 50 75 Q 46 85 48 95" fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 150 75 Q 154 85 152 95" fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />

                  {/* Ear left */}
                  <ellipse cx="49" cy="92" rx="9" ry="12" fill="#e8b87a" stroke="#000" strokeWidth="3" />
                  {/* Ear right */}
                  <ellipse cx="151" cy="92" rx="9" ry="12" fill="#e8b87a" stroke="#000" strokeWidth="3" />

                  {/* Glasses frame left */}
                  <rect x="58" y="83" width="34" height="22" rx="4" fill="rgba(40,60,100,0.15)" stroke="#000" strokeWidth="3.5" />
                  {/* Glasses frame right */}
                  <rect x="108" y="83" width="34" height="22" rx="4" fill="rgba(40,60,100,0.15)" stroke="#000" strokeWidth="3.5" />
                  {/* Bridge */}
                  <line x1="92" y1="94" x2="108" y2="94" stroke="#000" strokeWidth="3" />
                  {/* Temple left */}
                  <line x1="58" y1="94" x2="49" y2="90" stroke="#000" strokeWidth="3" />
                  {/* Temple right */}
                  <line x1="142" y1="94" x2="151" y2="90" stroke="#000" strokeWidth="3" />

                  {/* Eyes */}
                  <ellipse cx="75" cy="94" rx="9" ry="7" fill="#2a3575" />
                  <ellipse cx="125" cy="94" rx="9" ry="7" fill="#2a3575" />
                  {/* Eye shine */}
                  <circle cx="79" cy="91" r="2.5" fill="#fff" />
                  <circle cx="129" cy="91" r="2.5" fill="#fff" />

                  {/* Eyebrows */}
                  <path d="M 58 80 Q 75 74 92 80" stroke="#1a1a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <path d="M 108 80 Q 125 74 142 80" stroke="#1a1a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                  {/* Nose */}
                  <path d="M 97 106 Q 93 116 97 120 Q 100 122 103 120 Q 107 116 103 106" stroke="#c09050" strokeWidth="2" fill="none" strokeLinecap="round" />

                  {/* Mouth — slight smirk */}
                  <path d="M 82 132 Q 100 140 118 132" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />

                  {/* Halftone shadow on face */}
                  <pattern id="faceDots" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                    <circle cx="2.5" cy="2.5" r="0.8" fill="#c09050" opacity="0.4" />
                  </pattern>
                  <ellipse cx="100" cy="88" rx="52" ry="58" fill="url(#faceDots)" opacity="0.5" />
                </svg>
              </div>

              {/* EDITOR-IN-CHIEF badge */}
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
                "LISTEN UP, TRUE BELIEVER! WE NEED THE SCOOP ON YOUR NEXT BIG HERO! ANSWER ME TRUTHFULLY!"
              </p>
            </div>
          </aside>

          {/* ── CHAT CANVAS ──────────────────────────── */}
          <section className="lg:col-span-9 space-y-8">

            {/* Previous Q&A pairs */}
            {answers.map((answer, i) => (
              <div key={i} className="space-y-4">
                {/* Question bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-surface-white ink-border ink-shadow p-5">
                    <p className="font-headline text-sm uppercase text-primary mb-1">
                      {QUESTIONS[i].label}
                    </p>
                    <p className="font-body text-base italic text-on-surface">
                      "{QUESTIONS[i].question}"
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
                      Your Choice
                    </span>
                    <p className="font-headline text-2xl font-black uppercase text-on-tertiary-container">
                      {answer}
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
                    {QUESTIONS[currentQ].label}
                  </p>
                  <p className="font-body text-xl font-bold text-on-surface mb-1">
                    "{QUESTIONS[currentQ].question}"
                  </p>
                  <p className="font-body text-sm italic text-on-surface-muted mb-8">
                    {QUESTIONS[currentQ].subtext}
                  </p>

                  {/* Option buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {QUESTIONS[currentQ].options.map((opt, i) => {
                      const s = OPTION_STYLES[i % OPTION_STYLES.length];
                      return (
                        <div key={opt} className="relative">
                          <div
                            className={`absolute inset-0 ${s.offset} ink-border translate-x-2 translate-y-2`}
                          />
                          <button
                            onClick={() => handleAnswer(opt)}
                            className={`relative w-full py-5 px-2 ${s.bg} ${s.text} ink-border font-headline text-lg font-black uppercase tracking-tight transition-transform duration-75 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer ${s.rotate}`}
                          >
                            {opt}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom input */}
                  <div className="relative pt-5 border-t-4 border-dashed border-outline-variant">
                    <label className="font-headline text-[10px] uppercase absolute -top-3 left-4 bg-surface-white px-2 font-black text-on-surface-muted">
                      OR WRITE YOUR OWN...
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
                </div>
              </div>
            ) : (
              /* All done — generate CTA */
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="font-headline text-xl font-black uppercase text-on-surface-muted">
                  Story profile complete!
                </p>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-dim ink-border translate-x-3 translate-y-3" />
                  <button className="relative bg-primary ink-border px-16 py-6 font-headline text-3xl font-black italic uppercase text-white tracking-wide hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer">
                    GENERATE SCRIPT →
                  </button>
                </div>
              </div>
            )}

            {/* ── PROGRESS INDICATOR ───────────────── */}
            <div className="flex items-center justify-center gap-2 pt-6">
              {QUESTIONS.map((q, i) => (
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
                  {i < QUESTIONS.length - 1 && (
                    <div
                      className={`h-1 w-10 transition-colors ${
                        i < currentQ ? "bg-ink" : "bg-outline-variant"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
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
