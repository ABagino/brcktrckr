"use client"

import { useState, useRef } from "react"
import NavMenu from "@/components/NavMenu"
import confetti from "canvas-confetti"
import { supabase } from "@/utils/supabase/client"

// Constants
const MAX_MESSAGE_LENGTH = 350
const MIN_MESSAGE_LENGTH = 10
const RATE_LIMIT_MS = 3000 // 3 seconds between submissions

// Types
interface FormData {
  category: string
  message: string
  email: string | null
  submitted_at: string
}

export default function ContactPage() {
  const [category, setCategory] = useState("Missing set?")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSubmitTime = useRef<number>(0)

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
    return "text-gray-500 dark:text-gray-400"
  }



  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-gray-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="flex justify-end py-4">
          <NavMenu />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-5xl w-full rounded-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/70 shadow-2xl p-10 transition-all duration-500 ease-in-out">
            <div className="text-center animate-in fade-in duration-700">
              <div className="text-6xl mb-4" role="img" aria-label="Success">
                ✅
              </div>
              <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                Thank you!
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                Your feedback has been received. We&apos;ll look into it shortly 🥳
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
              >
                Submit Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-gray-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="flex justify-end py-4">
        <NavMenu />
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-5xl w-full rounded-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/70 shadow-2xl p-10 transition-all duration-500 ease-in-out">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-gray-100">
            Contact Us
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Category:
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <option>Missing set?</option>
                <option>Visual error?</option>
                <option>Strange pricing data?</option>
                <option>Need help with something (anything) else!</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Message: <span className="text-red-500">*</span>
              </label>
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
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
                placeholder="Describe the issue or your question..."
              />
              <div id="message-hint" className="flex justify-between text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  Min {MIN_MESSAGE_LENGTH}, max {MAX_MESSAGE_LENGTH} characters
                </span>
                <span className={getCharacterCountColor()}>
                  {message.length} / {MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Email <span className="text-gray-500 text-xs">(optional; for follow-up)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="example@email.com"
                aria-describedby="email-hint"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
              <p id="email-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We&apos;ll only use this to follow up on your feedback if needed.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-in fade-in duration-300"
              >
                <span className="text-red-600 dark:text-red-400 text-xl" aria-hidden="true">
                  ⚠️
                </span>
                <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
              </div>
            )}

            {/* 🪤 Honeypot field (hidden from real users) */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: "1px",
                height: "1px",
                opacity: 0,
              }}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || message.trim().length < MIN_MESSAGE_LENGTH}
              className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
