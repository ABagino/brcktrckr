"use client"

import { useState } from "react"
import SetLook from "@/components/setlook"
import NavMenu from "@/components/NavMenu"

export default function Page() {
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("advanced")
  const [isLoading, setIsLoading] = useState(false)

  const handleGoClick = async () => {
    let query = inputValue.trim()
    if (!query.endsWith("-1")) query += "-1"

    setIsLoading(true)

    try {
      // ⏳ Replace this with your actual data loading logic
      await new Promise((resolve) => setTimeout(resolve, 800))

      setSearchValue(query)
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGoClick()
  }

  return (
    <div className="font-sans p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 🔍 Search Bar + View Mode + Menu */}
      <div className="mb-5 flex items-center justify-between gap-4">
        {/* Left: Search field */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Set Number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded w-52 bg-white dark:bg-gray-800"
          />
          <button
            onClick={handleGoClick}
            disabled={isLoading}
            className="px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Go
          </button>

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

        {/* Right: View Mode + Hamburger Menu */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("basic")}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === "basic"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              className={`px-4 py-2 text-sm font-medium border-l ${
                viewMode === "advanced"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Advanced
            </button>
          </div>
          <NavMenu />
        </div>
      </div>

      {/* Main component */}
      <SetLook searchValue={searchValue} viewMode={viewMode} />
    </div>
  )
}
