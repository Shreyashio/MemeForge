"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MemeProject } from "@/lib/schema";

export default function WhitepaperPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<MemeProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProject(data);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold">Not found</p>
          <Link href="/" className="text-blue-600 underline text-sm">← Back to MemeForge</Link>
        </div>
      </div>
    );
  }

  const sections = [
    { title: "Abstract", content: project.whitepaper.abstract },
    { title: "Problem Statement", content: project.whitepaper.problem },
    { title: "Solution", content: project.whitepaper.solution },
    { title: "Tokenomics", content: project.whitepaper.tokenomics_text },
    { title: "Risk Factors", content: project.whitepaper.risks },
    { title: "Conclusion", content: project.whitepaper.conclusion },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Screen-only toolbar */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link
          href={`/p/${id}`}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          ← Back to {project.name}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto px-8 py-16 print:py-8 print:px-0">
        {/* Cover */}
        <div className="text-center mb-16 pb-12 border-b-2 border-gray-200">
          {project.logo_svg && (
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: project.theme.primary + "15", border: `2px solid ${project.theme.primary}30` }}
              dangerouslySetInnerHTML={{ __html: project.logo_svg }}
            />
          )}
          <div className="text-5xl mb-4">{project.emoji}</div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{project.name}</h1>
          <p className="text-xl font-bold mb-1" style={{ color: project.theme.primary }}>
            ${project.ticker}
          </p>
          <p className="text-lg text-gray-500 italic">{project.tagline}</p>
          <div className="mt-6 inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-red-200 text-red-500 bg-red-50">
            SATIRE — NOT REAL — NOT FINANCIAL ADVICE
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Version 1.0 · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Table of contents */}
        <div className="mb-12 p-6 rounded-xl bg-gray-50 border border-gray-200 print:bg-white">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Table of Contents</h2>
          <ol className="space-y-2">
            {sections.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{i + 1}. {s.title}</span>
                <span className="text-gray-300">{"·".repeat(10)}</span>
                <span className="text-gray-400 text-xs">{i + 2}</span>
              </li>
            ))}
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{sections.length + 1}. Tokenomics Distribution</span>
              <span className="text-gray-300">{"·".repeat(10)}</span>
              <span className="text-gray-400 text-xs">{sections.length + 3}</span>
            </li>
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={i} className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-gray-100">{i + 1}</span>
                <h2
                  className="text-2xl font-black border-b-2 pb-2 flex-1"
                  style={{ borderColor: project.theme.primary + "40", color: project.theme.primary }}
                >
                  {s.title}
                </h2>
              </div>
              <p className="text-gray-700 leading-8 whitespace-pre-wrap text-base">{s.content}</p>
            </section>
          ))}

          {/* Tokenomics table */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-gray-100">{sections.length + 1}</span>
              <h2
                className="text-2xl font-black border-b-2 pb-2 flex-1"
                style={{ borderColor: project.theme.primary + "40", color: project.theme.primary }}
              >
                Tokenomics Distribution
              </h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: project.theme.primary + "10" }}>
                    <th className="text-left p-4 font-bold" style={{ color: project.theme.primary }}>Allocation</th>
                    <th className="text-right p-4 font-bold" style={{ color: project.theme.primary }}>Percentage</th>
                    <th className="text-right p-4 font-bold" style={{ color: project.theme.primary }}>Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tokenomics.map((t, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="p-4 font-medium">{t.label}</td>
                      <td className="p-4 text-right font-bold" style={{ color: project.theme.primary }}>
                        {t.percent}%
                      </td>
                      <td className="p-4 text-right text-gray-500">
                        {(t.percent * 10_000_000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-black bg-gray-50">
                    <td className="p-4">Total</td>
                    <td className="p-4 text-right">100%</td>
                    <td className="p-4 text-right">1,000,000,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Team */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black text-gray-100">{sections.length + 2}</span>
              <h2
                className="text-2xl font-black border-b-2 pb-2 flex-1"
                style={{ borderColor: project.theme.primary + "40", color: project.theme.primary }}
              >
                Leadership Team
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {project.team.map((m, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-3xl mb-2">{["🧙", "🦊", "🤖"][i]}</div>
                  <p className="font-bold text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center space-y-2">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
            Satire. Testnet only. Not financial advice.
          </p>
          <p className="text-xs text-gray-400">
            {project.name} ({project.ticker}) is a satirical parody project generated by MemeForge.
            No actual financial, investment, or legal advice is provided or implied.
            All team members, tokenomics, roadmap milestones, and technical claims are entirely fictional.
            Any resemblance to real cryptocurrency projects is coincidental and comedic.
          </p>
        </div>
      </div>
    </div>
  );
}
