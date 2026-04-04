"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🧱</div>
        <h1 className="text-3xl font-bold mb-3">Something went wrong!</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Looks like some bricks fell out of place. Don&apos;t worry, we can rebuild.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-3 rounded-md bg-[rgb(242,142,46)] text-white hover:bg-[rgb(220,125,35)] transition-colors font-medium"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-3 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
