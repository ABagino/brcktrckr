"use client"

import { useState, useCallback, useRef, useEffect, Suspense } from "react"
import Link from "next/link"
import { Home } from "lucide-react"
import { useSearchParams } from "next/navigation"
import SetLook from "@/components/setlook"

// Default suffix for set numbers
const DEFAULT_SET_SUFFIX = "-1"

function SetLookContent() {
  const searchParams = useSearchParams()
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("advanced")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSetInitialView, setHasSetInitialView] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Set initial view mode based on screen size (only once)
  useEffect(() => {
    if (!hasSetInitialView) {
      const isSmall = window.innerWidth < 768
      if (isSmall) {
        setViewMode("basic")
      }
      setHasSetInitialView(true)
    }
  }, [hasSetInitialView])

  // Populate input from URL query parameter on mount
  useEffect(() => {
    const queryParam = searchParams.get('q')
    if (queryParam) {
      setInputValue(queryParam)
    }
  }, [searchParams])

  const handleGoClick = useCallback(async () => {
    const query = inputValue.trim()
    
    // Validate input
    if (!query) {
      setError("Please enter a set number")
      inputRef.current?.focus()
      return
    }
    
    // Clear previous error
    setError(null)
    
    // Append default suffix if not present
    const fullQuery = query.endsWith(DEFAULT_SET_SUFFIX) ? query : query + DEFAULT_SET_SUFFIX

    setIsLoading(true)

    try {
      // TODO: Replace with actual API call to fetch set data
      // Example: const response = await fetch(`/api/sets/${fullQuery}`)
      // const data = await response.json()
      
      // Simulate network delay for now
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSearchValue(fullQuery)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load set data. Please try again."
      setError(errorMessage)
      console.error("Error loading data:", err)
    } finally {
      setIsLoading(false)
      // Return focus to input after operation
      inputRef.current?.focus()
    }
  }, [inputValue])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGoClick()
  }, [handleGoClick])

  const handleClear = useCallback(() => {
    setInputValue("")
    setSearchValue("")
    setError(null)
    inputRef.current?.focus()
  }, [])

  // Focus input on mount (client-side only)
  useEffect(() => {
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="font-sans p-4 sm:p-6 min-h-screen bg-[rgb(251,249,247)] bg-[radial-gradient(circle_at_20%_0%,rgba(242,142,46,0.06)_0%,rgba(242,142,46,0)_40%),radial-gradient(circle_at_80%_10%,rgba(30,30,30,0.03)_0%,rgba(30,30,30,0)_45%)] dark:bg-gray-900 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(242,142,46,0.12)_0%,rgba(242,142,46,0)_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%)] text-gray-900 dark:text-gray-100">
      {/* 🔍 Search Bar + View Mode + Menu */}
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Search field */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter Set Number (e.g., 10375)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Set number search input"
              aria-describedby={error ? "search-error" : undefined}
              aria-invalid={error ? "true" : "false"}
              className={`p-2.5 border rounded w-full sm:w-64 bg-white dark:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed ${
                error ? "border-red-500 dark:border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {inputValue && !isLoading && (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleGoClick}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Search for set"
            className={`px-4 py-2.5 rounded text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
              !searchValue && !error ? "bg-blue-600 animate-[pulse_2s_ease-in-out_infinite] hover:animate-none" : "bg-blue-600"
            }`}
            style={!searchValue && !error ? {
              animation: 'pulse-orange 2s ease-in-out infinite',
            } : undefined}
          >
            {isLoading ? "Loading..." : "Go"}
          </button>

          <style jsx>{`
            @keyframes pulse-orange {
              0%, 100% {
                background-color: rgb(37, 99, 235); /* blue-600 */
              }
              50% {
                background-color: rgb(249, 115, 22); /* orange-500 */
              }
            }
          `}</style>

          {/* 🔄 Spinner */}
          {isLoading && (
            <div className="flex items-center ml-3 text-blue-600 dark:text-blue-400">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Right: View Mode + Home Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("basic")}
              aria-label="Switch to basic view"
              aria-pressed={viewMode === "basic"}
              className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "basic"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              aria-label="Switch to advanced view"
              aria-pressed={viewMode === "advanced"}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-l transition-colors ${
                viewMode === "advanced"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Advanced
            </button>
          </div>
          <Link
            href="/"
            aria-label="Go to Home"
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div id="search-error" role="alert" className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchValue && !isLoading && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Search for a LEGO Set</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Enter a set number above to view detailed inventory information, pricing data, and value calculations.
          </p>
        </div>
      )}

      {/* Main component */}
      {isLoading && (
        <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading set data">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-5"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      )}
      
      {!isLoading && searchValue && (
        <SetLook searchValue={searchValue} viewMode={viewMode} />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="font-sans p-4 sm:p-6 min-h-screen bg-[rgb(251,249,247)] bg-[radial-gradient(circle_at_20%_0%,rgba(242,142,46,0.06)_0%,rgba(242,142,46,0)_40%),radial-gradient(circle_at_80%_10%,rgba(30,30,30,0.03)_0%,rgba(30,30,30,0)_45%)] dark:bg-gray-900 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(242,142,46,0.12)_0%,rgba(242,142,46,0)_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%)] text-gray-900 dark:text-gray-100">
        <div className="text-center py-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-5 max-w-2xl mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <SetLookContent />
    </Suspense>
  )
}
