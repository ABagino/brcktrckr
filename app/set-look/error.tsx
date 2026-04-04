"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function SetLookError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Set lookup error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold mb-3">Set Lookup Failed</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          We couldn&apos;t load the set data. This might be due to:
        </p>
        <ul className="text-gray-600 dark:text-gray-400 text-sm mb-6 text-left list-disc list-inside">
          <li>Network connectivity issues</li>
          <li>The set number doesn&apos;t exist</li>
          <li>Our data service is temporarily unavailable</li>
        </ul>
        {error.digest && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-3 rounded-md bg-[rgb(242,142,46)] text-white hover:bg-[rgb(220,125,35)] transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/set-look"
            className="px-5 py-3 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            New Search
          </Link>
          <Link
            href="/"
            className="px-5 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
