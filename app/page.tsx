"use client";

import MagicBento from "@/components/MagicBento";
import NavMenu from "@/components/NavMenu";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Nav in corner */}
      <div className="p-4 flex justify-end">
        <NavMenu />
      </div>

      {/* Hero text */}
      <header className="text-center py-12 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 bg-clip-text text-transparent">
          BrckTrckr
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Helping BrickLinkers evaluate part values, track price movements, 
          and discover top-performing sets — all in one free analytics tool.
        </p>
      </header>

      {/* Magic Bento Grid */}
      <main className="flex-1 flex justify-center items-start px-6">
        <MagicBento
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="255, 205, 0" // LEGO yellow glow
        />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} BrckTrckr · Built for Bricklinkers Worldwide
      </footer>
    </div>
  );
}
