"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import confetti from "canvas-confetti"
import { supabase } from "@/utils/supabase/client"
import { Manrope, Space_Grotesk } from "next/font/google"

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
})

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

// Constants
const MAX_MESSAGE_LENGTH = 350
const MIN_MESSAGE_LENGTH = 10
const RATE_LIMIT_MS = 3000

// Types
interface FormData {
  category: string
  message: string
  email: string | null
  submitted_at: string
}

export default function ContactPage() {
  const pathname = usePathname()
  const [category, setCategory] = useState("Missing set?")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSubmitTime = useRef<number>(0)

  type ThemePreference = "light" | "dark" | "system"
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Rate limiting check
    const now = Date.now()
    if (now - lastSubmitTime.current < RATE_LIMIT_MS) {
      setError("Please wait a few seconds before submitting again.")
      return
    }

    // 🪤 Check honeypot field
    const form = e.currentTarget
    const website = (form.elements.namedItem("website") as HTMLInputElement)?.value
    if (website) {
      console.warn("🪤 Bot detected — submission ignored.")
      return
    }

    // Trim and validate inputs
    const trimmedMessage = message.trim()
    const trimmedEmail = email.trim()

    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      setError(`Message must be at least ${MIN_MESSAGE_LENGTH} characters.`)
      return
    }

    setIsSubmitting(true)

    try {
      const timestamp = new Date().toISOString()

      const formData: FormData = {
        category,
        message: trimmedMessage,
        email: trimmedEmail || null,
        submitted_at: timestamp,
      }

      const { error: supabaseError } = await supabase
        .from("feedback")
        .insert([formData])

      if (supabaseError) {
        if (supabaseError.message.includes("network")) {
          throw new Error("Network error — please check your connection.")
        }
        throw supabaseError
      }

      lastSubmitTime.current = now

      confetti({
        particleCount: 120,
        spread: 120,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#9333ea", "#facc15", "#10b981"],
      })

      setSubmitted(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error submitting feedback:", err.message)
        setError(err.message || "Something went wrong — please try again.")
      } else {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred — please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setCategory("Missing set?")
    setMessage("")
    setEmail("")
    setError(null)
  }

  const getCharacterCountColor = () => {
    const length = message.length
    if (length >= MAX_MESSAGE_LENGTH) return "text-red-500"
    if (length >= MAX_MESSAGE_LENGTH * 0.85) return "text-orange-500"
    if (length >= MAX_MESSAGE_LENGTH * 0.7) return "text-yellow-600"
    return "text-neutral-500 dark:text-neutral-400"
  }

  return (
    <div className={`${bodyFont.className} min-h-screen text-[#1e1e1e] dark:text-gray-100 bg-[rgb(251,249,247)] bg-[radial-gradient(circle_at_20%_0%,rgba(242,142,46,0.06)_0%,rgba(242,142,46,0)_40%),radial-gradient(circle_at_80%_10%,rgba(30,30,30,0.03)_0%,rgba(30,30,30,0)_45%)] dark:bg-gray-900 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(242,142,46,0.12)_0%,rgba(242,142,46,0)_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%)]`}>
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

        {submitted ? (
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-3xl border border-[#efebe7] dark:border-gray-700 bg-white dark:bg-gray-800 p-12 shadow-[0_20px_60px_rgba(23,23,23,0.08)] max-w-lg w-full">
              <div className="text-6xl mb-6" role="img" aria-label="Success">✅</div>
              <h1 className={`${headingFont.className} text-3xl font-bold mb-3 dark:text-gray-100`}>Thank you!</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Your feedback has been received. We&apos;ll look into it shortly 🥳
              </p>
              <button
                onClick={handleReset}
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
              >
                Submit Another Message
              </button>
            </div>
          </section>
        ) : (
          <section className="flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <div className="mb-8">
                <h1 className={`${headingFont.className} text-4xl font-bold mb-2 dark:text-gray-100`}>Contact Us</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Have a question or found an issue? Let us know below.</p>
              </div>

              <div className="rounded-3xl border border-[#efebe7] dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-[0_20px_60px_rgba(23,23,23,0.08)]">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Category
                    </label>
                    <div className="rounded-xl border border-neutral-200 dark:border-gray-600 overflow-hidden">
                      <select
                        id="category"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-transparent px-3 py-3 text-base font-medium outline-none dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option>Missing set?</option>
                        <option>Visual error?</option>
                        <option>Strange pricing data?</option>
                        <option>Need help with something (anything) else!</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <div className="rounded-xl border border-neutral-200 dark:border-gray-600 p-3">
                      <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        minLength={MIN_MESSAGE_LENGTH}
                        maxLength={MAX_MESSAGE_LENGTH}
                        disabled={isSubmitting}
                        aria-invalid={message.length > 0 && message.trim().length < MIN_MESSAGE_LENGTH}
                        aria-describedby="message-hint"
                        className="w-full bg-transparent text-base font-medium outline-none dark:text-gray-100 dark:placeholder-gray-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Describe the issue or your question..."
                      />
                      <div id="message-hint" className="flex justify-between text-xs mt-1">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          Min {MIN_MESSAGE_LENGTH} characters
                        </span>
                        <span className={getCharacterCountColor()}>
                          {message.length} / {MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Email <span className="text-neutral-400 text-xs font-normal">(optional)</span>
                    </label>
                    <div className="rounded-xl border border-neutral-200 dark:border-gray-600 p-3">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="example@email.com"
                        aria-describedby="email-hint"
                        className="w-full bg-transparent text-base font-medium outline-none dark:text-gray-100 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p id="email-hint" className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      We&apos;ll only use this to follow up on your feedback if needed.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="flex items-start gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <span className="text-red-600 dark:text-red-400 text-lg" aria-hidden="true">⚠️</span>
                      <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
                    </div>
                  )}

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
                  />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || message.trim().length < MIN_MESSAGE_LENGTH}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
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
  )
}
