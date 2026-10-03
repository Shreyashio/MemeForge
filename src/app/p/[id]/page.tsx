"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MemeProject } from "@/lib/schema";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import {
  useAccount, useConnect, useSwitchChain,
  useWriteContract, useWaitForTransactionReceipt,
} from "wagmi";
import { injected } from "@wagmi/core";
import { baseSepolia } from "wagmi/chains";
import { computeWhitepaperHash } from "@/lib/utils";
import { TOKEN_FACTORY_ABI } from "@/lib/contracts";
import { parseEventLogs } from "viem";

/* Greyscale pie colours — vivid enough to distinguish, still B&W palette */
const PIE_COLORS = ["#ffffff", "#aaaaaa", "#666666", "#333333", "#111111"];

const FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

/* ── Tooltip ── */
function BwTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 bg-white text-black text-xs font-mono border border-black">
        <p className="font-bold">{payload[0].name}</p>
        <p>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
}

/* ── Section header ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/30">{children}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

/* ── Deploy panel ── */
function DeployPanel({
  project, id, deployedAddress, onDeployed,
}: {
  project: MemeProject; id: string;
  deployedAddress: string | null; onDeployed: (a: string) => void;
}) {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({ hash });
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    if (isConfirmed && receipt && !deployedAddress) {
      try {
        const logs = parseEventLogs({ abi: TOKEN_FACTORY_ABI, logs: receipt.logs });
        for (const log of logs) {
          if (log.eventName === "TokenCreated") {
            const addr = (log.args as any).token as string;
            onDeployed(addr);
            fetch(`/api/projects/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ deployedAddress: addr }),
            }).catch(console.error);
          }
        }
      } catch (e) { console.error(e); }
    }
  }, [isConfirmed, receipt, deployedAddress, id, onDeployed]);

  const handleDeploy = async () => {
    setDeployError(null);
    if (FACTORY_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setDeployError("Factory not deployed. Set NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS in .env.local.");
      return;
    }
    if (chain?.id !== baseSepolia.id) {
      try { await switchChain({ chainId: baseSepolia.id }); } catch {
        setDeployError("Switch to Base Sepolia in your wallet.");
      }
      return;
    }
    const whitepaperHash = computeWhitepaperHash(project.whitepaper);
    const supply = BigInt(1_000_000_000) * BigInt(10 ** 18);
    try {
      await writeContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: TOKEN_FACTORY_ABI,
        functionName: "createToken",
        args: [project.name, project.ticker, supply, whitepaperHash],
      });
    } catch (e: any) { setDeployError(e.shortMessage || e.message); }
  };

  if (deployedAddress) {
    return (
      <div className="border border-white/20 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-black text-sm uppercase tracking-widest">Token Live</span>
        </div>
        <p className="text-xs text-white/40 font-mono">Your meme coin exists on-chain. Congrats.</p>
        <a
          href={`https://sepolia.basescan.org/token/${deployedAddress}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs font-mono text-white/60 hover:text-white underline underline-offset-2 break-all block transition-colors"
        >
          {deployedAddress} ↗
        </a>
      </div>
    );
  }

  return (
    <div className="border border-white/15 p-6 space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Base Sepolia · Testnet
        </span>
      </div>
      <p className="text-sm text-white/60">
        Deploy <span className="text-white font-bold">${project.ticker}</span> as a real ERC-20.
        1,000,000,000 tokens will be minted to your wallet.
      </p>

      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          className="w-full py-3 border border-white/20 text-xs font-mono uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-150"
        >
          Connect Wallet →
        </button>
      ) : chain?.id !== baseSepolia.id ? (
        <button
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          className="w-full py-3 border border-white/40 text-white/60 text-xs font-mono uppercase tracking-[0.2em] hover:border-white hover:text-white transition-all duration-150"
        >
          ⚠ Switch to Base Sepolia
        </button>
      ) : (
        <button
          onClick={handleDeploy}
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-white/80 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPending ? "Confirm in wallet..." : isConfirming ? "Mining..." : `Deploy $${project.ticker}`}
        </button>
      )}

      {isConnected && (
        <p className="text-[10px] text-white/20 font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)} · Base Sepolia
        </p>
      )}
      {(writeError || deployError) && (
        <p className="text-xs font-mono text-white/40 border border-white/10 p-3">
          ERR / {deployError || writeError?.message}
        </p>
      )}
      {hash && !isConfirmed && (
        <p className="text-[10px] font-mono text-white/30">
          TX / {hash.slice(0, 12)}...{hash.slice(-8)}
        </p>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function ProjectPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<MemeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [fakeHolders, setFakeHolders] = useState(42069);
  const [fakeMcap, setFakeMcap] = useState(6942000);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => { setProject(d); if (d.deployedAddress) setDeployedAddress(d.deployedAddress); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const hi = setInterval(() => setFakeHolders(p => Math.max(1, p + Math.floor(Math.random() * 13) - 5)), 2500);
    const mi = setInterval(() => setFakeMcap(p => Math.max(1000, p + Math.floor(Math.random() * 10000) - 4000)), 1800);
    return () => { clearInterval(hi); clearInterval(mi); };
  }, []);

  const handleDeployed = useCallback((addr: string) => setDeployedAddress(addr), []);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-white/20 font-mono text-xs uppercase tracking-widest animate-pulse">Loading...</span>
    </div>
  );

  /* ── Error ── */
  if (error || !project) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4 font-mono">
        <p className="text-4xl font-black">404</p>
        <p className="text-xs text-white/40 uppercase tracking-widest">{error || "Project not found"}</p>
        <Link href="/" className="inline-block text-xs border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
          ← Back
        </Link>
      </div>
    </div>
  );

  const pieData = project.tokenomics.map(t => ({ name: t.label, value: t.percent }));

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-50 bg-black border-b border-white/10 px-6 sm:px-10 py-3 flex items-center justify-between">
        <Link href="/" className="text-[10px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-widest">
          ← MemeForge
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest hidden sm:block">
            {project.name}
          </span>
          <span className="border border-white/20 px-3 py-1 text-[10px] font-mono font-black uppercase tracking-widest">
            ${project.ticker}
          </span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="border-b border-white/10 px-6 sm:px-10 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* Logo + emoji */}
            <div className="flex items-center gap-4">
              {project.logo_svg ? (
                <div
                  className="w-16 h-16 border border-white/15 flex items-center justify-center overflow-hidden bg-white/3"
                  dangerouslySetInnerHTML={{ __html: project.logo_svg }}
                />
              ) : (
                <div className="w-16 h-16 border border-white/15 flex items-center justify-center text-3xl bg-white/3">
                  {project.emoji}
                </div>
              )}
              <div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Meme Coin</p>
                <p className="font-black text-sm uppercase tracking-widest">${project.ticker}</p>
              </div>
            </div>

            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-none tracking-tighter">
              {project.name}
            </h1>
            <p className="text-base text-white/50 leading-relaxed max-w-sm">
              {project.tagline}
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {project.hero.headline}
            </p>
            <p className="text-sm text-white/40 leading-relaxed">
              {project.hero.subtext}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-white/80 transition-all">
                {project.hero.cta}
              </button>
              <Link
                href={`/p/${id}/whitepaper`}
                className="px-6 py-3 border border-white/20 text-xs font-mono uppercase tracking-[0.2em] text-white/60 hover:border-white hover:text-white transition-all text-center"
              >
                Whitepaper →
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-px bg-white/8">
            {[
              { label: "Holders", value: fakeHolders.toLocaleString(), note: "fake" },
              { label: "Market Cap", value: `$${fakeMcap.toLocaleString()}`, note: "fake" },
              { label: "Total Supply", value: "1,000,000,000", note: "real (testnet)" },
              { label: "Network", value: "Base Sepolia", note: "testnet" },
            ].map((s, i) => (
              <div key={i} className="bg-black px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{s.label}</p>
                  <p className="font-black text-xl mt-1">{s.value}</p>
                </div>
                <span className="text-[9px] font-mono text-white/15 uppercase tracking-widest border border-white/10 px-2 py-0.5">
                  {s.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 space-y-24">

        {/* ── Features ── */}
        <section>
          <SectionLabel>01 — Features</SectionLabel>
          <div className="grid md:grid-cols-3 gap-px bg-white/8">
            {project.features.map((f, i) => (
              <div key={i} className="bg-black p-8 space-y-3 hover:bg-white/3 transition-colors group">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  F-0{i + 1}
                </span>
                <h3 className="font-black text-base leading-tight group-hover:text-white transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tokenomics ── */}
        <section>
          <SectionLabel>02 — Tokenomics</SectionLabel>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<BwTooltip />} />
                  <Legend
                    formatter={(v) => (
                      <span className="text-[10px] font-mono text-white/40 uppercase">{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {project.tokenomics.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/6 group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-white/60 font-mono">{t.label}</span>
                  </div>
                  <span className="font-black text-sm">{t.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roadmap ── */}
        <section>
          <SectionLabel>03 — Roadmap</SectionLabel>
          <div className="grid md:grid-cols-3 gap-px bg-white/8">
            {project.roadmap.map((r, i) => (
              <div key={i} className="bg-black p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">{r.phase}</span>
                  <span className="text-[10px] font-mono text-white/10 border border-white/10 px-2 py-0.5">
                    {["DONE", "IN PROGRESS", "PENDING"][i]}
                  </span>
                </div>
                <h3 className="font-black text-sm uppercase tracking-wide">{r.title}</h3>
                <ul className="space-y-2">
                  {r.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-white/40 font-mono">
                      <span className="text-white/20 shrink-0 mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section>
          <SectionLabel>04 — Leadership</SectionLabel>
          <div className="grid md:grid-cols-3 gap-px bg-white/8">
            {project.team.map((m, i) => (
              <div key={i} className="bg-black p-8 space-y-4 hover:bg-white/3 transition-colors">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-2xl bg-white/3">
                  {["🧙", "🦊", "🤖"][i]}
                </div>
                <div>
                  <p className="font-black text-sm">{m.name}</p>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Deploy ── */}
        <section>
          <SectionLabel>05 — Deploy</SectionLabel>
          <div className="max-w-lg">
            <DeployPanel
              project={project} id={id}
              deployedAddress={deployedAddress}
              onDeployed={handleDeployed}
            />
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
          Satire. Testnet only. Not financial advice.
        </p>
        <p className="text-[10px] font-mono text-white/15">
          {project.name} ({project.ticker}) is entirely fictional. All data is parody.
        </p>
      </footer>
    </div>
  );
}
