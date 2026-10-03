"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_IDEAS = [
  "A coin for people who forget their crypto password",
  "Microtransactions for apologizing to your houseplants",
  "Blockchain-powered artisanal lettuce tracking",
  "Proof-of-Sitting: earn tokens for being sedentary",
];

const LOADING_MESSAGES = [
  "Hiring fake team...",
  "Inventing tokenomics...",
  "Burning imaginary tokens...",
  "Consulting fictional VCs...",
  "Designing pitch deck...",
  "Generating buzzword density...",
  "Scheduling moon date...",
  "Printing team hoodies...",
  "Filing SEC exemptions ironically...",
];

const TICKER_ITEMS = [
  "DYOR", "HODL", "WEN MOON", "NOT FINANCIAL ADVICE", "LFG", "WAGMI",
  "TO THE MOON", "BASED", "BULLISH", "DIAMOND HANDS", "APE IN", "NGMI",
  "REKT", "GM", "SATIRE ONLY", "TESTNET", "FUD", "PAPER HANDS",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  const handleGenerate = async () => {
    if (!idea.trim()) { textareaRef.current?.focus(); return; }
    setError(null);
    setIsGenerating(true);
    const interval = setInterval(() => {
      setMessageIndex(p => (p + 1) % LOADING_MESSAGES.length);
    }, 900);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      clearInterval(interval);
      router.push(`/p/${data.id}`);
    } catch (e: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setError(e.message || "Something went wrong. Try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
  };

  /* ── LOADING SCREEN ── */
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        {/* Top ticker */}
        <div className="fixed top-0 left-0 right-0 border-b border-white/10 overflow-hidden bg-black">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} className="px-6 py-2 text-xs font-mono uppercase tracking-[0.2em] text-white/30">
                {t} <span className="text-white/10 mx-2">·</span>
              </span>
            ))}
          </div>
        </div>

        <div className="text-center space-y-8 px-4">
          {/* ASCII spinner */}
          <div className="font-mono text-6xl font-black tracking-tighter">
            {["⬛", "⬜", "◼", "◻"][messageIndex % 4]}
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold tracking-tight">
              {LOADING_MESSAGES[messageIndex]}
              <span className={`ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`}>_</span>
            </p>
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono">
              Building your empire of nonsense
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-48 h-px bg-white/10 mx-auto overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-700"
              style={{ width: `${((messageIndex + 1) / LOADING_MESSAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── HOME ── */
  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* ── Ticker tape ── */}
      <div className="border-b border-white/10 overflow-hidden shrink-0">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="px-6 py-2.5 text-[10px] font-mono uppercase tracking-[0.25em] text-white/25">
              {t} <span className="text-white/10 mx-2">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/8 shrink-0">
        <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
          MemeForge / v1.0
        </span>
        <span className="text-xs font-mono text-white/20 uppercase tracking-widest hidden sm:block">
          Satire · Testnet · Not Financial Advice
        </span>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      </nav>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-12 animate-slide-up">

          {/* Headline */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/30">
              Meme Coin Generator — Base Sepolia
            </p>
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black leading-none tracking-tighter">
              MEME
              <br />
              <span className="text-black [-webkit-text-stroke:2px_white]">FORGE</span>
            </h1>
            <p className="text-base text-white/50 max-w-sm leading-relaxed">
              Type a dumb coin idea. Get back a full crypto project, whitepaper &amp; a real testnet token.
            </p>
          </div>

          {/* Input block */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 block">
              Your idea →
            </label>
            <div className="relative border border-white/15 hover:border-white/40 focus-within:border-white transition-colors duration-200">
              {/* Corner accents */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

              <textarea
                ref={textareaRef}
                value={idea}
                onChange={e => { setIdea(e.target.value); setCharCount(e.target.value.length); }}
                onKeyDown={handleKeyDown}
                placeholder={`"A cryptocurrency for people who still use Myspace"`}
                className="w-full h-36 p-4 bg-transparent text-white placeholder-white/20 focus:outline-none resize-none text-sm leading-relaxed font-mono"
                maxLength={500}
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/8">
                <span className="text-[10px] text-white/20 font-mono">{charCount}/500</span>
                <span className="text-[10px] text-white/20 font-mono hidden sm:block">⌘↵ to generate</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!idea.trim()}
              className="group w-full py-4 px-6 border border-white/20 font-black text-sm uppercase tracking-[0.2em] transition-all duration-150 relative overflow-hidden
                         hover:bg-white hover:text-black hover:border-white disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Generate Project →</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="border border-white/20 p-4 font-mono text-xs text-white/60">
              <span className="text-white font-bold">ERR /</span> {error}
            </div>
          )}

          {/* Examples */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">
              Examples →
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {EXAMPLE_IDEAS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(ex)}
                  className="group text-left p-4 border border-white/8 hover:border-white/30 hover:bg-white/3 transition-all duration-150"
                >
                  <span className="text-white/20 font-mono text-[10px] mr-2">0{i + 1}</span>
                  <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">{ex}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 px-6 sm:px-10 py-4 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
          Satire. Testnet only. Not financial advice.
        </span>
        <span className="text-[10px] font-mono text-white/15">
          MemeForge © 2026
        </span>
      </footer>
    </div>
  );
}
