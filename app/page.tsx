"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavMenu from "@/components/NavMenu";
import { Search, TrendingUp, Package, BarChart3 } from "lucide-react";

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/setlook?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: "Set Explorer",
      description: "Search any LEGO set instantly and view detailed part inventories with real-time pricing data.",
      link: "/setlook",
      linkText: "Start Searching",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Value Analysis",
      description: "Identify which parts and sets offer the best value with smart calculations and market insights.",
      link: "/setlook",
      linkText: "Analyze Values",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Market Trends",
      description: "Track price movements over time and benchmark your collection against current market data.",
      link: "/setlook",
      linkText: "COMING SOON...",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <div className="p-4 flex justify-end">
        <NavMenu />
      </div>

      {/* Hero Section */}
      <header className="text-center py-8 md:py-16 px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 bg-clip-text text-transparent">
          BrckTrckr
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          The free analytics tool for BrickLinkers to evaluate part values, track prices, and discover top-performing sets.
        </p>

        {/* Quick Search Bar */}
        <form onSubmit={handleQuickSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter set # (eg. 10375)..."
              className="w-full px-6 py-4 pr-14 text-lg rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Primary CTA Button */}
        <Link
          href="/setlook"
          className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
        >
          Start Set Searching →
        </Link>
      </header>

      {/* Feature Cards */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          Everything You Need to Track LEGO Values
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.link}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:-translate-y-2"
            >
              {/* Gradient Border on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-sm`}></div>
              
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-4 shadow-md`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* Link */}
              <span className={`inline-flex items-center text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient} font-semibold group-hover:gap-2 transition-all`}>
                {feature.linkText}
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12 text-center shadow-lg border border-yellow-200 dark:border-gray-600">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Why BrckTrckr?
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Built by BrickLinkers, for BrickLinkers. We combine BrickLink data with powerful analytics to help you make smarter buying and selling decisions. All features are completely free.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-700 dark:text-gray-300">Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-700 dark:text-gray-300">Real-Time Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-700 dark:text-gray-300">Community-Driven</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-12">
        <p>© {new Date().getFullYear()} BrckTrckr · Built for BrickLinkers Worldwide</p>
        <p className="mt-2">
          <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Contact Us
          </Link>
        </p>
      </footer>
    </div>
  );
}
