"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MemeProject } from "@/lib/schema";

export default function WhitepaperPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<MemeProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => setProject(d))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <span className="text-black/20 font-mono text-xs uppercase tracking-widest animate-pulse">Loading...</span>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center font-mono text-xs">
      Not found. <Link href="/" className="ml-2 underline">← Back</Link>
    </div>
  );

  const sections = [
    { label: "Abstract", content: project.whitepaper.abstract },
    { label: "Problem Statement", content: project.whitepaper.problem },
    { label: "Solution", content: project.whitepaper.solution },
    { label: "Tokenomics", content: project.whitepaper.tokenomics_text },
    { label: "Risk Factors", content: project.whitepaper.risks },
    { label: "Conclusion", content: project.whitepaper.conclusion },
  ];

  return (
    <div className="min-h-screen bg-white text-black">

      {/* ── Screen toolbar ── */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-black/10 px-6 sm:px-10 py-3 flex items-center justify-between">
        <Link
          href={`/p/${id}`}
          className="text-[10px] font-mono text-black/40 hover:text-black transition-colors uppercase tracking-widest"
        >
          ← {project.name}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-black/80 transition-colors"
        >
          Download PDF ↓
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16 print:py-8">

        {/* ── Cover ── */}
        <div className="border-b-2 border-black pb-16 mb-16 space-y-6">

          {/* Disclaimer badge */}
          <div className="inline-block border border-black/20 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.3em] text-black/40">
            Satire · Not Financial Advice · Testnet Only
          </div>

          <div className="flex items-start gap-6">
            {project.logo_svg && (
              <div
                className="w-16 h-16 border border-black/10 shrink-0 flex items-center justify-center overflow-hidden"
                dangerouslySetInnerHTML={{ __html: project.logo_svg }}
              />
            )}
            <div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">{project.name}</h1>
              <p className="text-sm font-mono text-black/40 mt-2 uppercase tracking-widest">
                ${project.ticker} · Technical Whitepaper
              </p>
            </div>
          </div>

          <p className="text-base text-black/60 leading-relaxed max-w-xl italic">{project.tagline}</p>

          <div className="flex items-center gap-6 text-[10px] font-mono text-black/30 uppercase tracking-widest">
            <span>Version 1.0</span>
            <span className="text-black/10">·</span>
            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="text-black/10">·</span>
            <span>Satirical Document</span>
          </div>
        </div>

        {/* ── Table of contents ── */}
        <div className="mb-16">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-black/30 mb-4">Contents</p>
          <div className="space-y-1">
            {sections.map((s, i) => (
              <div key={i} className="flex items-baseline justify-between py-1.5 border-b border-black/5">
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] font-mono text-black/20">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-xs text-black/60">{s.label}</span>
                </div>
                <span className="text-[10px] font-mono text-black/20">{i + 2}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between py-1.5 border-b border-black/5">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-mono text-black/20">{String(sections.length + 1).padStart(2, "0")}</span>
                <span className="text-xs text-black/60">Token Distribution</span>
              </div>
              <span className="text-[10px] font-mono text-black/20">{sections.length + 3}</span>
            </div>
          </div>
        </div>

        {/* ── Sections ── */}
        <div className="space-y-14">
          {sections.map((s, i) => (
            <section key={i} className="space-y-4">
              <div className="flex items-baseline gap-4 border-b border-black pb-3">
                <span className="text-5xl font-black text-black/5 leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-black uppercase tracking-wide">{s.label}</h2>
              </div>
              <p className="text-sm text-black/70 leading-8 whitespace-pre-wrap">{s.content}</p>
            </section>
          ))}

          {/* Token distribution table */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-4 border-b border-black pb-3">
              <span className="text-5xl font-black text-black/5 leading-none select-none">
                {String(sections.length + 1).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-black uppercase tracking-wide">Token Distribution</h2>
            </div>
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 text-black/40 uppercase tracking-widest font-medium">Allocation</th>
                  <th className="text-right py-3 text-black/40 uppercase tracking-widest font-medium">%</th>
                  <th className="text-right py-3 text-black/40 uppercase tracking-widest font-medium">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {project.tokenomics.map((t, i) => (
                  <tr key={i} className="border-b border-black/8">
                    <td className="py-3 text-black/70">{t.label}</td>
                    <td className="py-3 text-right font-black">{t.percent}%</td>
                    <td className="py-3 text-right text-black/40">{(t.percent * 10_000_000).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-black font-black">
                  <td className="py-3">Total Supply</td>
                  <td className="py-3 text-right">100%</td>
                  <td className="py-3 text-right">1,000,000,000</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Team */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-4 border-b border-black pb-3">
              <span className="text-5xl font-black text-black/5 leading-none select-none">
                {String(sections.length + 2).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-black uppercase tracking-wide">Leadership</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {project.team.map((m, i) => (
                <div key={i} className="border border-black/10 p-4 space-y-2">
                  <div className="text-2xl">{["🧙", "🦊", "🤖"][i]}</div>
                  <p className="font-black text-sm">{m.name}</p>
                  <p className="text-[10px] font-mono text-black/40 uppercase tracking-wide">{m.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Legal footer ── */}
        <div className="mt-20 pt-8 border-t-2 border-black space-y-3">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em]">
            Satire. Testnet only. Not financial advice.
          </p>
          <p className="text-[10px] font-mono text-black/40 leading-6">
            {project.name} ({project.ticker}) is a satirical parody generated by MemeForge.
            No financial, investment, or legal advice is provided or implied.
            All team members, tokenomics, roadmap milestones, and technical claims are entirely fictional.
            Any resemblance to real cryptocurrency projects is coincidental and comedic.
          </p>
        </div>
      </div>
    </div>
  );
}
