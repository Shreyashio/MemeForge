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
  "Designing suspiciously professional pitch deck...",
  "Generating buzzword density...",
  "Scheduling moon date...",
  "Printing team hoodies...",
  "Filing SEC exemptions ironically...",
];

const FLOATING_WORDS = [
  "HODL", "WEN MOON", "LFG", "TO THE MOON", "DYOR",
  "WAGMI", "NGMI", "GM", "BASED", "BULLISH", "FUD",
  "APE IN", "DIAMOND HANDS", "PAPER HANDS", "REKT",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [floatingWords] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      word: FLOATING_WORDS[i % FLOATING_WORDS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      size: 0.65 + Math.random() * 0.6,
    }))
  );
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) {
      textareaRef.current?.focus();
      return;
    }
    setError(null);
    setIsGenerating(true);

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
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
      setError(e.message || "Something went wrong. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060612] text-white overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 text-center space-y-8 px-4">
          {/* Spinning logo */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl">
              ⚗️
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-2xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent transition-all duration-500">
              {LOADING_MESSAGES[messageIndex]}
            </p>
            <p className="text-sm text-gray-500">Building your empire of nonsense...</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060612] text-white overflow-hidden relative flex flex-col">
      {/* Floating crypto words in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {floatingWords.map((fw, i) => (
          <span
            key={i}
            className="absolute text-white/[0.04] font-bold uppercase tracking-widest animate-float"
            style={{
              left: `${fw.x}%`,
              top: `${fw.y}%`,
              fontSize: `${fw.size}rem`,
              animationDuration: `${fw.duration}s`,
              animationDelay: `${fw.delay}s`,
            }}
          >
            {fw.word}
          </span>
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-pink-900/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-indigo-900/10 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 uppercase tracking-widest font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Satire · Testnet Only · Not Financial Advice
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                MemeForge
              </span>
            </h1>
            <p className="text-xl text-gray-400 font-medium">
              Dumb coins.{" "}
              <span className="text-white">Taken seriously.</span>
            </p>
          </div>

          {/* Input area */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 group-focus-within:opacity-60 blur transition duration-500" />
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                onKeyDown={handleKeyDown}
                placeholder={"What's your dumb coin idea?\n\ne.g. \"A cryptocurrency backed by the vibes of sleepy cats\""}
                className="w-full h-40 p-5 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none text-base leading-relaxed"
                maxLength={500}
              />
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                <span className="text-xs text-gray-600">{charCount}/500 · Ctrl+Enter to generate</span>
                <button
                  onClick={handleGenerate}
                  disabled={!idea.trim()}
                  className="relative group/btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: idea.trim()
                      ? "linear-gradient(135deg, #9333ea, #ec4899)"
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  <span>Generate</span>
                  <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Examples */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-gray-600 font-medium">
              Need inspiration? Try one of these:
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {EXAMPLE_IDEAS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(ex)}
                  className="group relative text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-200 text-sm text-gray-400 hover:text-gray-200"
                >
                  <span className="absolute top-3 right-3 text-xs text-gray-700 group-hover:text-purple-400 transition-colors">↗</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-gray-700 py-6 px-4">
        Satire. Testnet only. Not financial advice. &nbsp;·&nbsp; MemeForge 2026
      </footer>
    </div>
  );
}
