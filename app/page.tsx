"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Manrope, Space_Grotesk } from "next/font/google";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type ThemePreference = "light" | "dark" | "system";

export default function HomePage() {
  const [setNumber, setSetNumber] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const THEME_KEY = "theme-preference";
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      setThemePreference(saved);
    }
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = themePreference === "dark" || (themePreference === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    localStorage.setItem(THEME_KEY, themePreference);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [themePreference, themeLoaded]);

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
      className={`${bodyFont.className} min-h-screen text-[#1e1e1e] dark:text-gray-100 bg-[rgb(251,249,247)] bg-[radial-gradient(circle_at_20%_0%,rgba(242,142,46,0.06)_0%,rgba(242,142,46,0)_40%),radial-gradient(circle_at_80%_10%,rgba(30,30,30,0.03)_0%,rgba(30,30,30,0)_45%)] dark:bg-gray-900 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(242,142,46,0.12)_0%,rgba(242,142,46,0)_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%)]`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <header className="mb-16 flex items-center justify-between">
          <Link href="/" className={`${headingFont.className} text-2xl font-bold tracking-tight`}>
            BrckTrckr
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400 md:flex">
            <Link href="/" className={pathname === "/" ? "font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white" : "transition-colors hover:text-neutral-900 dark:hover:text-white"}>
              Home
            </Link>
            <Link href="/set-look" className={pathname === "/set-look" ? "font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white" : "transition-colors hover:text-neutral-900 dark:hover:text-white"}>
              Set Search
            </Link>
            <Link href="/set-rank" className={pathname === "/set-rank" ? "font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white" : "transition-colors hover:text-neutral-900 dark:hover:text-white"}>
              Top Sets
            </Link>
            <Link href="/about" className={pathname === "/about" ? "font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white" : "transition-colors hover:text-neutral-900 dark:hover:text-white"}>
              About + FAQ
            </Link>
            <Link href="/contact" className={pathname === "/contact" ? "font-bold text-neutral-900 dark:text-white transition-colors hover:text-neutral-900 dark:hover:text-white" : "transition-colors hover:text-neutral-900 dark:hover:text-white"}>
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
            <h1 className={`${headingFont.className} mb-6 text-5xl font-bold leading-[1.04] md:text-6xl`}>
              See which LEGO parts actually <span className="text-[rgb(242,142,46)]">sell</span> - not just their price.
            </h1>
            <p className="mb-8 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
              Analyse demand, supply, and profitability across every piece in a set. Find the best sets to part out - backed by real BrickLink data.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/set-look" className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white">
                START NOW
              </Link>
              <Link href="/set-rank" className="rounded-xl border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-6 py-3 text-sm font-semibold text-neutral-800">
                VIEW TOP SETS
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#efebe7] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-[0_20px_60px_rgba(23,23,23,0.08)]">
            <h3 className="mb-2 text-lg font-semibold dark:text-gray-100">Search Set</h3>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">Enter a set number to view inventory and value data.</p>
            <form onSubmit={handleSetSearch} className="space-y-3">
              <div className="rounded-xl border border-neutral-200 dark:border-gray-600 p-3">
                <label htmlFor="set-number" className="mb-1 block text-xs text-neutral-500 dark:text-neutral-400">
                  Set number
                </label>
                <input
                  id="set-number"
                  type="text"
                  value={setNumber}
                  onChange={(event) => setSetNumber(event.target.value)}
                  placeholder="eg. 10375"
                  className="w-full bg-transparent text-base font-medium outline-none dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="mt-14">
          <div className="grid grid-cols-2 divide-x divide-y divide-[#ece7e2] dark:divide-gray-700 overflow-hidden rounded-2xl border border-[#ece7e2] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_30px_rgba(20,20,20,0.05)] md:grid-cols-4 md:divide-y-0">
            {[
              { label: "LEGO sets tracked", value: "145K+" },
              { label: "Individual parts tracked", value: "7M+" },
              { label: "Part sale records analysed", value: "Millions" },
              { label: "Completely free?", value: "Always" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-5">
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className={`${headingFont.className} text-3xl font-bold text-[#1e1e1e] dark:text-gray-100`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mt-20">
          <div className="mb-6">
            <h2 className={`${headingFont.className} text-3xl font-bold dark:text-gray-100`}>What BrckTrckr does:</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
                  "Spot high-demand, low-supply pieces. Identify which sets are most profitable to part out - based on what actually sells.",
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
                className="rounded-2xl border border-[#ece7e2] dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-[0_14px_30px_rgba(20,20,20,0.06)]"
              >
                <h3 className={`${headingFont.className} mb-3 text-2xl font-bold dark:text-gray-100`}>{feature.title}</h3>
                <p className="mb-6 text-sm text-neutral-700 dark:text-neutral-400">{feature.description}</p>
                <Link href={feature.href} className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-gray-100">
                  {feature.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <article className="rounded-2xl border border-[rgb(80,200,183)] bg-[rgb(230,247,245)] dark:border-gray-700 dark:bg-gray-800 p-8">
            <h3 className={`${headingFont.className} mb-2 text-3xl font-bold dark:text-gray-100`}>Why BrckTrckr?</h3>
            <p className="mb-6 max-w-3xl text-sm text-neutral-700 dark:text-neutral-400">
              Built by BrickLinkers, for BrickLinkers. We combine BrickLink data with powerful analytics to help you make smarter buying and selling decisions. All features are completely free.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-neutral-800 dark:text-neutral-200">
              <span className="rounded-full bg-white dark:bg-gray-700 px-4 py-2">Free</span>
              <span className="rounded-full bg-white dark:bg-gray-700 px-4 py-2">Real-Time Data</span>
              <span className="rounded-full bg-white dark:bg-gray-700 px-4 py-2">Community-Driven</span>
              <span className="rounded-full bg-white dark:bg-gray-700 px-4 py-2">Trusted by BrickLinkers</span>
            </div>
          </article>
        </section>
      </div>

      <footer className="border-t border-[#ece7e2] dark:border-gray-700 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p>© {new Date().getFullYear()} BrckTrckr · Built for BrickLinkers Worldwide</p>
          <span>|</span>
          <label htmlFor="theme-select" className="text-neutral-600 dark:text-neutral-300">Theme:</label>
          <select
            id="theme-select"
            value={themePreference}
            onChange={(e) => setThemePreference(e.target.value as ThemePreference)}
            className="rounded border border-neutral-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-neutral-700 dark:text-gray-200"
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </footer>
    </div>
  );
}
