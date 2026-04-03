"use client"

import { useEffect, useState } from "react"

type ThemePreference = "light" | "dark" | "system"

export default function ThemeFooter() {
  const THEME_KEY = "theme-preference"
  const [themePreference, setThemePreference] = useState<ThemePreference>("system")
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === "light" || saved === "dark" || saved === "system") {
      setThemePreference(saved)
    }
    setThemeLoaded(true)
  }, [])

  useEffect(() => {
    if (!themeLoaded) return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      const dark = themePreference === "dark" || (themePreference === "system" && mq.matches)
      document.documentElement.classList.toggle("dark", dark)
    }
    apply()
    localStorage.setItem(THEME_KEY, themePreference)
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [themePreference, themeLoaded])

  return (
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
  )
}