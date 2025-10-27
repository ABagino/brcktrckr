"use client"

import { useState } from "react"
import NavMenu from "@/components/NavMenu"
import confetti from "canvas-confetti"
import { supabase } from "@/utils/supabase/client"

export default function ContactPage() {
  const [category, setCategory] = useState("Missing set?")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // 🪤 Check honeypot field
    const form = e.currentTarget
    const website = (form.elements.namedItem("website") as HTMLInputElement)?.value
    if (website) {
      console.warn("🪤 Bot detected — submission ignored.")
      return
    }

    try {
      const timestamp = new Date().toISOString().split("T").join(" ").slice(0, 19)

      const { error } = await supabase.from("feedback").insert([
        {
          category,
          message,
          email: email || null,
          submitted_at: timestamp,
        },
      ])

      if (error) throw error

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
        setError("Something went wrong — please try again.")
      } else {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred — please try again.")
      }
  }
}



  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-gray-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="flex justify-end py-4">
          <NavMenu />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md w-full rounded-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/70 shadow-2xl p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              Thank you!
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Your feedback has been received. We&apos;ll look into it shortly 🥳.
            </p>
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
        <div className="max-w-5xl w-full rounded-2xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/70 shadow-2xl p-10">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-gray-100">
            Contact Us
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3"
              >
                <option>Missing set?</option>
                <option>Visual error?</option>
                <option>Strange pricing data?</option>
                <option>Need help with something (anything) else!</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Message:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                maxLength={350}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3"
                placeholder="Describe the issue or your question..."
              />
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>Max 350 characters</span>
                <span className={message.length >= 350 ? "text-red-500" : ""}>
                  {message.length} / 350
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email (optional; I may contact you if required!):
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            {/* 🪤 Honeypot field (hidden from real users) */}
            <input
              type="text"
              name="website"            // arbitrary field name (bots will fill it)
              tabIndex={-1}
              autoComplete="off"
              className="hidden"        // visually hidden with Tailwind
            />


            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
