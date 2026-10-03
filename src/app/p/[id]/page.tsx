"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MemeProject } from "@/lib/schema";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { injected } from "@wagmi/core";
import { baseSepolia } from "wagmi/chains";
import { computeWhitepaperHash } from "@/lib/utils";
import { TOKEN_FACTORY_ABI } from "@/lib/contracts";
import { parseEventLogs } from "viem";

const PIE_COLORS = ["#a855f7", "#ec4899", "#f97316", "#3b82f6", "#10b981"];

const FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

// ------------------------------------------------------------------
// Custom tooltip for the recharts pie
// ------------------------------------------------------------------
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg bg-black/80 border border-white/10 text-sm text-white">
        <p className="font-bold">{payload[0].name}</p>
        <p>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
}

// ------------------------------------------------------------------
// Stat badge (fake live counter)
// ------------------------------------------------------------------
function FakeStat({
  label,
  value,
  primaryColor,
}: {
  label: string;
  value: string;
  primaryColor: string;
}) {
  return (
    <div
      className="text-center px-8 py-4 rounded-2xl border backdrop-blur-sm"
      style={{
        borderColor: primaryColor + "30",
        background: primaryColor + "10",
      }}
    >
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm opacity-60 mt-1">
        {label}{" "}
        <span className="text-xs opacity-50 italic">(fake)</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Deploy panel
// ------------------------------------------------------------------
function DeployPanel({
  project,
  id,
  deployedAddress,
  onDeployed,
  primaryColor,
  secondaryColor,
  mood,
}: {
  project: MemeProject;
  id: string;
  deployedAddress: string | null;
  onDeployed: (addr: string) => void;
  primaryColor: string;
  secondaryColor: string;
  mood: "dark" | "light";
}) {
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });
  const [deployError, setDeployError] = useState<string | null>(null);
  const textColor = mood === "dark" ? "white" : "black";

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
      } catch (e) {
        console.error(e);
      }
    }
  }, [isConfirmed, receipt, deployedAddress, id, onDeployed]);

  const handleDeploy = async () => {
    if (!project || !address) return;
    setDeployError(null);
    if (FACTORY_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setDeployError(
        "Factory not deployed yet. Set NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS in .env.local and restart."
      );
      return;
    }
    if (chain?.id !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (e: any) {
        setDeployError("Please switch to Base Sepolia manually in your wallet.");
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
    } catch (e: any) {
      setDeployError(e.shortMessage || e.message);
    }
  };

  const panelBg = mood === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const borderStyle = primaryColor + "30";

  if (deployedAddress) {
    return (
      <div
        className="p-6 rounded-2xl border space-y-3"
        style={{ borderColor: "#10b98130", background: "#10b98110" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <p className="font-bold text-green-400 text-lg">Token Deployed! 🎉</p>
        </div>
        <p className="text-sm opacity-70">Your meme coin lives on the blockchain. Congrats.</p>
        <a
          href={`https://sepolia.basescan.org/token/${deployedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-mono text-blue-400 hover:text-blue-300 break-all underline underline-offset-2"
        >
          {deployedAddress}
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-2xl border space-y-4"
      style={{ borderColor: borderStyle, background: panelBg }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: primaryColor + "20" }}
        >
          🚀
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: primaryColor }}>
            Deploy this token
          </h3>
          <p className="text-xs opacity-50">Base Sepolia testnet · Real transaction, fake value</p>
        </div>
      </div>

      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          className="w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white" }}
        >
          Connect Wallet
        </button>
      ) : chain?.id !== baseSepolia.id ? (
        <button
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          className="w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", color: "white" }}
        >
          ⚠️ Switch to Base Sepolia
        </button>
      ) : (
        <button
          onClick={handleDeploy}
          disabled={isPending || isConfirming}
          className="w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: textColor }}
        >
          {isPending
            ? "⏳ Confirm in wallet..."
            : isConfirming
            ? "⛏️ Mining..."
            : `🪙 Deploy $${project.ticker}`}
        </button>
      )}

      {isConnected && (
        <p className="text-xs opacity-40 text-center font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)} · Base Sepolia
        </p>
      )}

      {(writeError || deployError) && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          {deployError || writeError?.message}
        </div>
      )}

      {hash && !isConfirmed && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
          Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Main page
// ------------------------------------------------------------------
export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<MemeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [fakeHolders, setFakeHolders] = useState(42069);
  const [fakeMcap, setFakeMcap] = useState(6942000);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();
        setProject(data);
        if (data.deployedAddress) setDeployedAddress(data.deployedAddress);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  useEffect(() => {
    const hi = setInterval(
      () => setFakeHolders((p) => Math.max(1, p + Math.floor(Math.random() * 13) - 5)),
      2500
    );
    const mi = setInterval(
      () => setFakeMcap((p) => Math.max(1000, p + Math.floor(Math.random() * 10000) - 4000)),
      1800
    );
    return () => { clearInterval(hi); clearInterval(mi); };
  }, []);

  const handleDeployed = useCallback((addr: string) => {
    setDeployedAddress(addr);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060612]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          <p className="text-gray-500 text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060612] text-red-400">
        <div className="text-center space-y-3">
          <div className="text-5xl">💀</div>
          <p className="text-xl font-bold">Project not found</p>
          <p className="text-sm opacity-70">{error}</p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition">
            ← Back to MemeForge
          </Link>
        </div>
      </div>
    );
  }

  const { theme } = project;
  const isDark = theme.mood === "dark";
  const textColor = isDark ? "white" : "#111";
  const subtleTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const cardBorder = theme.secondary + "25";
  const pieData = project.tokenomics.map((t) => ({ name: t.label, value: t.percent }));

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.background, color: textColor }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b flex items-center justify-between px-6 py-3"
        style={{ borderColor: theme.secondary + "20", background: theme.background + "dd" }}
      >
        <Link
          href="/"
          className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          ← MemeForge
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-black tracking-widest uppercase px-3 py-1 rounded-full"
            style={{ background: theme.primary + "20", color: theme.primary }}
          >
            ${project.ticker}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <header
        className="relative text-center py-24 px-4 overflow-hidden"
        style={{ background: `radial-gradient(ellipse at center, ${theme.primary}15 0%, transparent 70%)` }}
      >
        {/* Logo SVG */}
        {project.logo_svg && (
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden flex items-center justify-center border"
            style={{ borderColor: theme.secondary + "30", background: theme.primary + "15" }}
            dangerouslySetInnerHTML={{ __html: project.logo_svg }}
          />
        )}

        <div className="text-6xl mb-4">{project.emoji}</div>

        <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tight" style={{ color: theme.primary }}>
          {project.name}
        </h1>
        <p className="text-xl sm:text-2xl mb-3 font-medium" style={{ color: theme.secondary }}>
          {project.tagline}
        </p>
        <p className="text-lg mb-2 max-w-2xl mx-auto" style={{ color: subtleTextColor }}>
          {project.hero.headline}
        </p>
        <p className="text-base max-w-xl mx-auto mb-8" style={{ color: subtleTextColor, opacity: 0.7 }}>
          {project.hero.subtext}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
          <button
            className="px-8 py-3.5 rounded-xl font-bold text-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              color: isDark ? "#000" : "#fff",
            }}
          >
            {project.hero.cta}
          </button>
          <Link
            href={`/p/${id}/whitepaper`}
            className="px-6 py-3.5 rounded-xl font-semibold text-base border transition-all hover:opacity-80"
            style={{ borderColor: theme.secondary + "40", color: theme.secondary }}
          >
            📄 Read Whitepaper
          </Link>
        </div>

        {/* Fake stats */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <FakeStat
            label="Holders"
            value={fakeHolders.toLocaleString()}
            primaryColor={theme.primary}
          />
          <FakeStat
            label="Market Cap"
            value={`$${fakeMcap.toLocaleString()}`}
            primaryColor={theme.primary}
          />
          <FakeStat
            label="Total Supply"
            value="1,000,000,000"
            primaryColor={theme.primary}
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-24">
        {/* Features */}
        <section>
          <h2
            className="text-3xl font-black text-center mb-12 uppercase tracking-wider"
            style={{ color: theme.primary }}
          >
            Why {project.name}?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {project.features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border group hover:scale-[1.02] transition-transform duration-200"
                style={{ borderColor: cardBorder, background: cardBg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: theme.primary + "20" }}
                >
                  {["🔥", "💎", "🌙"][i]}
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: theme.secondary }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: subtleTextColor }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tokenomics */}
        <section>
          <h2
            className="text-3xl font-black text-center mb-12 uppercase tracking-wider"
            style={{ color: theme.primary }}
          >
            Tokenomics
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: subtleTextColor, fontSize: 12 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {project.tokenomics.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{ borderColor: PIE_COLORS[i % PIE_COLORS.length] + "30", background: PIE_COLORS[i % PIE_COLORS.length] + "10" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="font-medium text-sm">{t.label}</span>
                  </div>
                  <span
                    className="font-black text-lg"
                    style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}
                  >
                    {t.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <h2
            className="text-3xl font-black text-center mb-12 uppercase tracking-wider"
            style={{ color: theme.primary }}
          >
            Roadmap
          </h2>
          <div className="relative">
            {/* Connecting line */}
            <div
              className="hidden md:block absolute top-8 left-0 right-0 h-0.5 mx-[16.67%]"
              style={{ background: `linear-gradient(90deg, ${theme.primary}40, ${theme.secondary}40)` }}
            />
            <div className="grid md:grid-cols-3 gap-6">
              {project.roadmap.map((r, i) => (
                <div
                  key={i}
                  className="relative p-6 rounded-2xl border"
                  style={{ borderColor: cardBorder, background: cardBg }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm mb-4 mx-auto md:mx-0"
                    style={{ background: theme.primary, color: isDark ? "#000" : "#fff" }}
                  >
                    {r.phase}
                  </div>
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: theme.secondary }}
                  >
                    {r.title}
                  </h3>
                  <ul className="space-y-2">
                    {r.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: subtleTextColor }}
                      >
                        <span style={{ color: theme.primary }} className="mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2
            className="text-3xl font-black text-center mb-12 uppercase tracking-wider"
            style={{ color: theme.primary }}
          >
            The Team
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {project.team.map((m, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-2xl border hover:scale-[1.02] transition-transform duration-200"
                style={{ borderColor: cardBorder, background: cardBg }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border"
                  style={{ borderColor: theme.secondary + "30", background: theme.secondary + "15" }}
                >
                  {["🧙", "🦊", "🤖"][i]}
                </div>
                <h3 className="font-black text-lg">{m.name}</h3>
                <p className="text-sm mt-1" style={{ color: theme.secondary }}>
                  {m.role}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Deploy panel */}
        <section>
          <h2
            className="text-3xl font-black text-center mb-8 uppercase tracking-wider"
            style={{ color: theme.primary }}
          >
            Deployment
          </h2>
          <div className="max-w-xl mx-auto">
            <DeployPanel
              project={project}
              id={id}
              deployedAddress={deployedAddress}
              onDeployed={handleDeployed}
              primaryColor={theme.primary}
              secondaryColor={theme.secondary}
              mood={theme.mood}
            />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer
        className="text-center text-xs py-10 px-4 mt-16 border-t"
        style={{ borderColor: theme.secondary + "20", color: subtleTextColor }}
      >
        <p className="mb-1 font-medium">Satire. Testnet only. Not financial advice.</p>
        <p className="opacity-50">
          {project.name} ({project.ticker}) is a parody project. All data is fictional.
        </p>
      </footer>
    </div>
  );
}
