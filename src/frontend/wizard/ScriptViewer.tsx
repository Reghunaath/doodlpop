"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Script, GenerationMode } from "@/backend/lib/types";
import ModeToggle from "./ModeToggle";

// ── Hardcoded script ───────────────────────────────────────────────────────

const HARDCODED_SCRIPT: Script = {
  title: "INSPECTOR WHISKERS AND THE STOLEN STAR",
  synopsis:
    "In the neon-drenched streets of Neo-Furropolis, grumpy feline detective Inspector Whiskers is pulled out of retirement when the city's legendary Star Diamond goes missing. With a wisecracking robot sidekick and zero patience for nonsense, he'll claw his way to the truth — one sarcastic remark at a time.",
  pages: [
    {
      pageNumber: 1,
      panels: [
        {
          panelNumber: 1,
          description:
            "Wide establishing shot of Neo-Furropolis at dusk. Towering chrome skyscrapers stretch into a violet sky. Holographic billboards flicker. In the foreground, a single dimly lit office window reads 'WHISKERS & CO. — PRIVATE INVESTIGATIONS'.",
          dialogue: [],
          caption: "Neo-Furropolis. The city that never sleeps — mostly because the coffee is terrible.",
        },
        {
          panelNumber: 2,
          description:
            "Interior of the detective office. Inspector Whiskers — a stocky orange tabby in a rumpled trench coat — sits behind a paper-avalanche desk. He wears a tiny monocle. His robot sidekick, BOLT-7, stands by the window polishing its chrome torso.",
          dialogue: [
            { speaker: "BOLT-7", text: "Boss, we've had zero clients this month." },
            { speaker: "WHISKERS", text: "Exactly how I like it." },
          ],
          caption: null,
        },
        {
          panelNumber: 3,
          description:
            "The office door bursts open. A well-dressed Persian cat — DUCHESS FLUFFINGTON — stands in the doorway, clutching a jewelled handbag, eyes wide with panic.",
          dialogue: [
            { speaker: "DUCHESS", text: "Inspector! The Star Diamond — it's GONE!" },
          ],
          caption: null,
        },
      ],
    },
    {
      pageNumber: 2,
      panels: [
        {
          panelNumber: 1,
          description:
            "Close-up on Whiskers' face. One eyebrow raised, monocle gleaming, coffee mug halfway to his lips. He looks profoundly inconvenienced.",
          dialogue: [
            { speaker: "WHISKERS", text: "Gone. Right. And you need ME why?" },
            { speaker: "DUCHESS", text: "Because the police are useless and you're... cheaper." },
          ],
          caption: null,
        },
        {
          panelNumber: 2,
          description:
            "Whiskers and BOLT-7 stand outside the Furropolis Museum of Glittery Things. Police tape everywhere. A flustered bulldog cop talks into a walkie-talkie. The display case inside is visibly empty.",
          dialogue: [
            { speaker: "BOLT-7", text: "Records indicate the diamond is worth 40 million." },
            { speaker: "WHISKERS", text: "Records indicate you talk too much." },
          ],
          caption: "Scene of the crime. Or as Whiskers called it: Scene of the mildly interesting inconvenience.",
        },
        {
          panelNumber: 3,
          description:
            "Whiskers crouches, examining a tiny paw print near the empty display case with a magnifying glass. BOLT-7 scans the room with laser eyes. A small suspicious shadow lurks in the background vent.",
          dialogue: [
            { speaker: "WHISKERS", text: "Whoever did this… has very small feet." },
            { speaker: "BOLT-7", text: "Or very stylish boots." },
          ],
          caption: null,
        },
      ],
    },
    {
      pageNumber: 3,
      panels: [
        {
          panelNumber: 1,
          description:
            "Rooftop chase scene. Whiskers sprints across a rain-slicked rooftop in pursuit of a hooded figure clutching a glowing diamond. Neon lights reflect in puddles below. BOLT-7 flies alongside using jet-boots.",
          dialogue: [
            { speaker: "WHISKERS", text: "STOP! I'm too old for this!" },
          ],
          caption: null,
        },
        {
          panelNumber: 2,
          description:
            "The hooded figure trips on a satellite dish. The diamond flies into the air, spinning, scattering brilliant light across the rooftop. Both Whiskers and the thief dive for it simultaneously.",
          dialogue: [],
          caption: "Time seemed to slow. For about half a second.",
        },
        {
          panelNumber: 3,
          description:
            "Whiskers holds the recovered diamond triumphantly. The thief — revealed to be a tiny, embarrassed hamster in an oversized coat — sits in handcuffs nearby. BOLT-7 takes a photo. The city glitters behind them.",
          dialogue: [
            { speaker: "WHISKERS", text: "A hamster. The culprit was a hamster." },
            { speaker: "BOLT-7", text: "To be fair, very stylish boots." },
            { speaker: "WHISKERS", text: "I'm going back to retirement." },
          ],
          caption: "Case closed. Again.",
        },
      ],
    },
  ],
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ScriptViewer() {
  const router = useRouter();
  const [script, setScript] = useState<Script>(HARDCODED_SCRIPT);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set([1]));
  const [mode, setMode] = useState<GenerationMode>("automated");

  const togglePage = (pageNum: number) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  const updateTitle = (val: string) => setScript((s) => ({ ...s, title: val }));
  const updateSynopsis = (val: string) => setScript((s) => ({ ...s, synopsis: val }));

  const updatePanelField = (
    pageIdx: number,
    panelIdx: number,
    field: "description" | "caption",
    val: string
  ) => {
    setScript((s) => {
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
                "THIS IS YOUR MASTERPIECE IN THE MAKING! EDIT ANY PANEL, ANY LINE — THEN HIT GENERATE!"
              </p>
            </div>

            {/* Script stats */}
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
          </aside>

          {/* ── SCRIPT CANVAS ────────────────────────── */}
          <section className="lg:col-span-9 space-y-6">

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
                  onClick={() => router.push(`/comic?mode=${mode}`)}
                  className="relative bg-tertiary ink-border px-16 py-6 font-headline text-3xl font-black italic uppercase text-on-tertiary tracking-wide hover:-translate-y-1 hover:-translate-x-0.5 transition-transform duration-75 cursor-pointer"
                >
                  GENERATE COMIC →
                </button>
              </div>
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
