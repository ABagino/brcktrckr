"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Package,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { getSetValueRows, RankedSetValueRow } from "@/utils/supabase/setValueMv";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function numberFormat(value: number): string {
  return new Intl.NumberFormat("en-AU").format(value);
}

function Sparkline({ positive }: { positive: boolean }) {
  const d = positive
    ? "M2 26 C12 18, 18 19, 28 12 C37 8, 42 9, 58 4"
    : "M2 6 C14 12, 20 10, 30 16 C38 20, 44 20, 58 26";

  return (
    <svg viewBox="0 0 60 30" className="h-8 w-20" aria-hidden="true">
      <path d={d} fill="none" stroke={positive ? "#1e1e1e" : "#8a8a8a"} strokeWidth="2" />
    </svg>
  );
}

export default function BlockioStylePreviewPage() {
  const [setNumber, setSetNumber] = useState("");
  const [topPieceRows, setTopPieceRows] = useState<RankedSetValueRow[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadTopPieceRows = async () => {
      try {
        const rows = await getSetValueRows({
          mode: "most_pieces",
          startYear: 2024,
          endYear: new Date().getFullYear(),
        });
        setTopPieceRows(rows.slice(0, 5));
      } catch {
        setTopPieceRows([]);
      }
    };

    loadTopPieceRows();
  }, []);

  const handleSetSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = setNumber.trim();
    if (!normalized) {
      return;
    }
    router.push(`/set-look?q=${encodeURIComponent(normalized)}`);
  };

  return (
    <div
      className={`${bodyFont.className} min-h-screen text-[#1e1e1e]`}
      style={{
        backgroundColor: "rgb(251, 249, 247)",
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(242,142,46,0.06) 0%, rgba(242,142,46,0) 40%), radial-gradient(circle at 80% 10%, rgba(30,30,30,0.03) 0%, rgba(30,30,30,0) 45%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10 md:py-10">
        <header className="mb-16 flex items-center justify-between">
          <Link href="/" className={`${headingFont.className} text-2xl font-bold tracking-tight`}>
            BrckTrckr
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-neutral-600 md:flex">
            <Link href="/set-rank" className="transition-colors hover:text-neutral-900">
              Top Sets
            </Link>
            <Link href="/contact" className="transition-colors hover:text-neutral-900">
              Contact
            </Link>
          </nav>
          <Link
            href="/set-look"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
          >
            SEARCH SETS
          </Link>
        </header>

        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Secure, simple, seamless
            </p>
            <h1 className={`${headingFont.className} mb-6 text-5xl font-bold leading-[1.04] md:text-6xl`}>
              <span className="text-[rgb(242,142,46)]">Fast-track</span> to LEGO value success
            </h1>
            <p className="mb-8 max-w-xl text-lg text-neutral-600">
              Analyze set performance, compare market movement, and make better buy/sell decisions with a cleaner data experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white">
                START NOW
              </button>
              <button className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-800">
                VIEW TOP SETS
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#efebe7] bg-white p-5 shadow-[0_20px_60px_rgba(23,23,23,0.08)]">
            <h3 className="mb-2 text-lg font-semibold">Search Set</h3>
            <p className="mb-4 text-sm text-neutral-600">Enter a set number to view inventory and value data.</p>
            <form onSubmit={handleSetSearch} className="space-y-3">
              <div className="rounded-xl border border-neutral-200 p-3">
                <label htmlFor="set-number" className="mb-1 block text-xs text-neutral-500">
                  Set number
                </label>
                <input
                  id="set-number"
                  type="text"
                  value={setNumber}
                  onChange={(event) => setSetNumber(event.target.value)}
                  placeholder="eg. 10307"
                  className="w-full bg-transparent text-base font-medium outline-none"
                />
              </div>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-4">
          {[
            { label: "Sets tracked", value: "145K+", icon: <BarChart3 className="h-5 w-5" /> },
            { label: "Parts tracked", value: "7 million", icon: <Package className="h-5 w-5" /> },
            { label: "Weekly price updates", value: "35 thousand+", icon: <TrendingUp className="h-5 w-5" /> },
            { label: "Daily checks", value: "920K", icon: <TrendingUp className="h-5 w-5" /> },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-[#ece7e2] bg-white p-5 shadow-[0_10px_30px_rgba(20,20,20,0.05)]"
            >
              <div className="mb-3 inline-flex rounded-lg bg-[#fff4ea] p-2 text-[rgb(242,142,46)]">{stat.icon}</div>
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className={`${headingFont.className} text-3xl font-bold`}>{stat.value}</p>
            </article>
          ))}
        </section>

        <section id="features" className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Set Explorer",
              description:
                "Search any LEGO set instantly and view detailed part inventories with real-time pricing data.",
              cta: "Start Searching",
              href: "/set-look",
            },
            {
              title: "Value Analysis",
              description:
                "Identify which parts and sets offer the best value with smart calculations and market insights.",
              cta: "Analyze Values",
              href: "/set-look",
            },
            {
              title: "Set Value Explorer",
              description:
                "View top sets by piece count, total value, year, theme, and multiplicative effect.",
              cta: "Explore Top Sets",
              href: "/set-rank",
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#ece7e2] bg-white p-6 shadow-[0_14px_30px_rgba(20,20,20,0.06)]"
            >
              <h3 className={`${headingFont.className} mb-3 text-2xl font-bold`}>{feature.title}</h3>
              <p className="mb-6 text-sm text-neutral-700">{feature.description}</p>
              <Link href={feature.href} className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900">
                {feature.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </section>

        <section id="tokens" className="mt-20">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className={`${headingFont.className} text-4xl font-bold`}>Top tokens</h2>
            <div className="flex gap-2 text-sm">
              <button className="rounded-full border border-neutral-300 bg-white px-4 py-2">All themes</button>
              <button className="rounded-full border border-neutral-300 bg-white px-4 py-2">7 days</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#ece7e2] bg-white shadow-[0_15px_35px_rgba(20,20,20,0.05)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f4f0] text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Set</th>
                  <th className="px-4 py-3 font-medium">Piece count</th>
                  <th className="px-4 py-3 font-medium">7D</th>
                  <th className="px-4 py-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {(topPieceRows.length > 0
                  ? topPieceRows.map((row, index) => ({
                      name: `${index + 1}. ${row.set_num}`,
                      pieceCount: numberFormat(Number(row.piece_qty ?? 0)),
                      change: `+${(5.8 - index * 1.1).toFixed(2)}%`,
                      trend: "up" as const,
                    }))
                  : [
                      { name: "1. 10307-1", pieceCount: "10,001", change: "+5.80%", trend: "up" as const },
                      { name: "2. 71799-1", pieceCount: "6,163", change: "+4.70%", trend: "up" as const },
                      { name: "3. 75313-1", pieceCount: "6,785", change: "+3.60%", trend: "up" as const },
                      { name: "4. 10276-1", pieceCount: "9,090", change: "+2.50%", trend: "up" as const },
                      { name: "5. 31203-1", pieceCount: "11,695", change: "+1.40%", trend: "up" as const },
                    ]).map((row) => (
                  <tr key={row.name} className="border-t border-neutral-100">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3">{row.pieceCount}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        row.trend === "up" ? "text-[#d27f2a]" : "text-neutral-500"
                      }`}
                    >
                      {row.change}
                    </td>
                    <td className="px-4 py-3">
                      <Sparkline positive={row.trend === "up"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20">
          <article className="rounded-2xl border border-[rgb(80,200,183)] bg-[rgb(230,247,245)] p-8">
            <h3 className={`${headingFont.className} mb-2 text-3xl font-bold`}>Why BrckTrckr?</h3>
            <p className="mb-6 max-w-3xl text-sm text-neutral-700">
              Built by BrickLinkers, for BrickLinkers. We combine BrickLink data with powerful analytics to help you make smarter buying and selling decisions. All features are completely free.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-neutral-800">
              <span className="rounded-full bg-white px-4 py-2">Free</span>
              <span className="rounded-full bg-white px-4 py-2">Real-Time Data</span>
              <span className="rounded-full bg-white px-4 py-2">Community-Driven</span>
            </div>
          </article>
        </section>

        <section className="mt-20 rounded-3xl border border-[#ece7e2] bg-white p-8 shadow-[0_18px_40px_rgba(20,20,20,0.06)] md:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#f8f4f0] px-3 py-1 text-xs font-semibold text-neutral-600">
                <Shield className="h-3.5 w-3.5" />
                Trusted by BrickLinkers
              </p>
              <h2 className={`${headingFont.className} text-3xl font-bold md:text-4xl`}>
                Analyse sets like a pro.
              </h2>
            </div>
            <Link
              href="/set-look"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Start Set Searching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}