"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Manrope, Space_Grotesk } from "next/font/google"
import {
  getSetValueRows,
  getSetValueThemes,
  RankedSetValueRow,
  SetValueMode,
} from "@/utils/supabase/setValueMv"
import Header from "@/components/Header"

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
})

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const currentYear = new Date().getFullYear()
const MIN_LEGO_YEAR = 2024
const PAGE_SIZE = 100

type SortColumn =
  | "set_num"
  | "piece_qty"
  | "part_value_indexed"
  | "minifig_value_indexed"
  | "total_value"
  | "value_per_piece"
  | "multiplicative_effect"

type SortDirection = "asc" | "desc"

function getDefaultSort(mode: SetValueMode): { column: SortColumn; direction: SortDirection } {
  if (mode === "most_pieces") {
    return { column: "piece_qty", direction: "desc" }
  }

  if (mode === "highest_part_value") {
    return { column: "part_value_indexed", direction: "desc" }
  }

  if (mode === "highest_minifig_value") {
    return { column: "minifig_value_indexed", direction: "desc" }
  }

  if (mode === "highest_total_value") {
    return { column: "total_value", direction: "desc" }
  }

  return { column: "multiplicative_effect", direction: "desc" }
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(value)
}

function numberFormat(value: number): string {
  return new Intl.NumberFormat("en-AU").format(value)
}

export default function SetValuePage() {
  const [mode, setMode] = useState<SetValueMode>("most_pieces")
  const [sortColumn, setSortColumn] = useState<SortColumn>("piece_qty")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [startYearInput, setStartYearInput] = useState<string>(String(MIN_LEGO_YEAR))
  const [endYearInput, setEndYearInput] = useState<string>(String(currentYear))
  const [themeSearch, setThemeSearch] = useState<string>("")
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [themes, setThemes] = useState<string[]>([])
  const [rows, setRows] = useState<RankedSetValueRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const parsedStartYear = useMemo(() => {
    const asNumber = Number(startYearInput)
    return Number.isInteger(asNumber) ? asNumber : undefined
  }, [startYearInput])

  const parsedEndYear = useMemo(() => {
    const asNumber = Number(endYearInput)
    return Number.isInteger(asNumber) ? asNumber : undefined
  }, [endYearInput])

  const filteredThemeOptions = useMemo(() => {
    const query = themeSearch.trim().toLowerCase()
    return themes
      .filter((theme) => !selectedThemes.includes(theme))
      .filter((theme) => (query ? theme.toLowerCase().includes(query) : true))
      .slice(0, 20)
  }, [themeSearch, themes, selectedThemes])

  const addTheme = (theme: string) => {
    if (!theme || selectedThemes.includes(theme)) return
    setSelectedThemes((previous) => [...previous, theme])
    setThemeSearch("")
  }

  const removeTheme = (theme: string) => {
    setSelectedThemes((previous) => previous.filter((item) => item !== theme))
  }

  const handleSortClick = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
    setCurrentPage(1)
  }

  const sortedRows = useMemo(() => {
    const sorted = [...rows]

    sorted.sort((left, right) => {
      if (sortColumn === "set_num") {
        const textCompare = left.set_num.localeCompare(right.set_num, undefined, {
          numeric: true,
          sensitivity: "base",
        })
        return sortDirection === "asc" ? textCompare : -textCompare
      }

      let leftValue: number
      let rightValue: number

      if (sortColumn === "minifig_value_indexed") {
        leftValue = Math.max(Number(left.minifig_value_indexed), Number(left.minifig_part_value_indexed))
        rightValue = Math.max(Number(right.minifig_value_indexed), Number(right.minifig_part_value_indexed))
      } else {
        leftValue = Number(left[sortColumn])
        rightValue = Number(right[sortColumn])
      }

      const numberCompare = leftValue - rightValue
      return sortDirection === "asc" ? numberCompare : -numberCompare
    })

    return sorted
  }, [rows, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return sortedRows.slice(start, end)
  }, [sortedRows, currentPage])

  const pageStart = sortedRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(currentPage * PAGE_SIZE, sortedRows.length)

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages = new Set<number>([1, totalPages])
    for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
      if (page > 1 && page < totalPages) {
        pages.add(page)
      }
    }

    return Array.from(pages).sort((left, right) => left - right)
  }, [currentPage, totalPages])

  const sortLabel = (column: SortColumn): string => {
    if (sortColumn !== column) return ""
    return sortDirection === "asc" ? " ▲" : " ▼"
  }

  useEffect(() => {
    const defaultSort = getDefaultSort(mode)
    setSortColumn(defaultSort.column)
    setSortDirection(defaultSort.direction)
    setCurrentPage(1)
  }, [mode])

  useEffect(() => {
    setCurrentPage(1)
  }, [rows])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const data = await getSetValueThemes()
        setThemes(data)
      } catch {
        setThemes([])
      }
    }

    loadThemes()
  }, [])

  useEffect(() => {
    const loadRows = async () => {
      if (parsedStartYear === undefined || parsedEndYear === undefined) {
        setRows([])
        setError("Enter valid start and end years.")
        return
      }

      if (parsedStartYear < MIN_LEGO_YEAR || parsedEndYear < MIN_LEGO_YEAR) {
        setRows([])
        setError(`Year range should be ${MIN_LEGO_YEAR} or later.`)
        return
      }

      if (parsedStartYear > currentYear || parsedEndYear > currentYear) {
        setRows([])
        setError(`Year range cannot be after ${currentYear}.`)
        return
      }

      if (parsedStartYear > parsedEndYear) {
        setRows([])
        setError("Start year must be less than or equal to end year.")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await getSetValueRows({
          mode,
          startYear: parsedStartYear,
          endYear: parsedEndYear,
          themeNames: selectedThemes,
        })
        setRows(data)
      } catch {
        setRows([])
        setError("Failed to load `set_value_mv` results.")
      } finally {
        setLoading(false)
      }
    }

    loadRows()
  }, [mode, parsedStartYear, parsedEndYear, selectedThemes])

  return (
    <div className={`${bodyFont.className} min-h-screen text-[#1e1e1e] dark:text-gray-100 bg-[rgb(251,249,247)] bg-[radial-gradient(circle_at_20%_0%,rgba(242,142,46,0.06)_0%,rgba(242,142,46,0)_40%),radial-gradient(circle_at_80%_10%,rgba(30,30,30,0.03)_0%,rgba(30,30,30,0)_45%)] dark:bg-gray-900 dark:bg-[radial-gradient(circle_at_15%_0%,rgba(242,142,46,0.12)_0%,rgba(242,142,46,0)_42%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_45%)]`}>
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <Header />

        <div className="mb-8">
          <h1 className={`${headingFont.className} text-4xl font-bold mb-2`}>Set Rank</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Pick a year range, choose your favourite themes, and discover which sets come out on top.
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-[#efebe7] dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-[0_10px_30px_rgba(20,20,20,0.05)] mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="mode" className="mb-1.5 block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Ranking Style
            </label>
            <div className="rounded-xl border border-neutral-200 dark:border-gray-600 overflow-hidden">
              <select
                id="mode"
                value={mode}
                onChange={(event) => setMode(event.target.value as SetValueMode)}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-medium outline-none dark:text-gray-100"
              >
                <option value="most_pieces">Rank by piece count</option>
                <option value="highest_part_value">Rank by part value</option>
                <option value="highest_minifig_value">Rank by minifigure value</option>
                <option value="highest_total_value">Rank by total value</option>
                <option value="multiplicative_effect">Rank by multiplicative effect</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="startYear" className="mb-1.5 block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Start Year
            </label>
            <div className="rounded-xl border border-neutral-200 dark:border-gray-600 px-3 py-2.5">
              <input
                id="startYear"
                type="number"
                min={MIN_LEGO_YEAR}
                max={currentYear}
                value={startYearInput}
                onChange={(event) => setStartYearInput(event.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none dark:text-gray-100 dark:placeholder-gray-500"
                placeholder={`e.g. ${MIN_LEGO_YEAR}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="endYear" className="mb-1.5 block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              End Year
            </label>
            <div className="rounded-xl border border-neutral-200 dark:border-gray-600 px-3 py-2.5">
              <input
                id="endYear"
                type="number"
                min={MIN_LEGO_YEAR}
                max={currentYear}
                value={endYearInput}
                onChange={(event) => setEndYearInput(event.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none dark:text-gray-100 dark:placeholder-gray-500"
                placeholder={`e.g. ${currentYear}`}
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="themeSearch" className="mb-1.5 block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Themes <span className="normal-case font-normal">(multi-select)</span>
            </label>
            <div className="rounded-xl border border-neutral-200 dark:border-gray-600 px-3 py-2.5">
              <input
                id="themeSearch"
                type="text"
                value={themeSearch}
                onChange={(event) => {
                  setThemeSearch(event.target.value)
                  setShowThemeOptions(true)
                }}
                onFocus={() => setShowThemeOptions(true)}
                onBlur={() => {
                  window.setTimeout(() => setShowThemeOptions(false), 120)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredThemeOptions.length > 0) {
                    event.preventDefault()
                    addTheme(filteredThemeOptions[0])
                  }
                }}
                className="w-full bg-transparent text-sm font-medium outline-none dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Type to find themes"
              />
            </div>

            {showThemeOptions && filteredThemeOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-[#efebe7] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_30px_rgba(20,20,20,0.1)]">
                {filteredThemeOptions.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      addTheme(theme)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-gray-700"
                  >
                    {theme}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedThemes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedThemes.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => removeTheme(theme)}
                className="px-3 py-1.5 rounded-full text-sm border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-neutral-50 dark:hover:bg-gray-700"
              >
                {theme} ×
              </button>
            ))}
          </div>
        )}

        {mode === "multiplicative_effect" && (
          <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            Multiplicative effect = <strong>total_value / raw_part_value</strong>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-[#efebe7] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_30px_rgba(20,20,20,0.05)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#efebe7] dark:border-gray-700 text-sm text-neutral-500 dark:text-neutral-400">
            {loading ? "Loading results..." : `Showing ${pageStart}–${pageEnd} of ${sortedRows.length} set(s)`}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-gray-900/40">
                <tr>
                  <th className="text-left px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("set_num")} className="font-semibold hover:underline">
                      Set # | Name{sortLabel("set_num")}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Theme</th>
                  <th className="text-right px-4 py-3 font-semibold">Year</th>
                  <th className="text-right px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("piece_qty")} className="font-semibold hover:underline">
                      Pieces{sortLabel("piece_qty")}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("part_value_indexed")} className="font-semibold hover:underline">
                      Part Value{sortLabel("part_value_indexed")}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("minifig_value_indexed")} className="font-semibold hover:underline">
                      Minifig Value{sortLabel("minifig_value_indexed")}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("total_value")} className="font-semibold hover:underline">
                      Total Value{sortLabel("total_value")}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("value_per_piece")} className="font-semibold hover:underline">
                      Value / Piece{sortLabel("value_per_piece")}
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button type="button" onClick={() => handleSortClick("multiplicative_effect")} className="font-semibold hover:underline">
                      Multiplier{sortLabel("multiplicative_effect")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && sortedRows.length === 0 && !error && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No sets found for this filter.
                    </td>
                  </tr>
                )}

                {paginatedRows.map((row) => (
                  <tr key={row.set_num} className="border-t border-[#efebe7] dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/set-look?q=${encodeURIComponent(row.set_num)}`}
                        className="font-semibold text-[rgb(242,142,46)] hover:underline"
                      >
                        {row.set_num}
                      </Link>
                      <div className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">{row.set_name}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{row.theme_name}</td>
                    <td className="px-4 py-3 text-right">{row.year}</td>
                    <td className="px-4 py-3 text-right">{numberFormat(row.piece_qty)}</td>
                    <td className="px-4 py-3 text-right">{currency(row.part_value_indexed)}</td>
                    <td className="px-4 py-3 text-right">{currency(Math.max(row.minifig_value_indexed, row.minifig_part_value_indexed))}</td>
                    <td className="px-4 py-3 text-right font-medium">{currency(row.total_value)}</td>
                    <td className="px-4 py-3 text-right">{currency(row.value_per_piece)}</td>
                    <td className="px-4 py-3 text-right">{row.multiplicative_effect.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && sortedRows.length > PAGE_SIZE && (
            <div className="px-4 py-3 border-t border-[#efebe7] dark:border-gray-700 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-gray-600 text-sm font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {visiblePageNumbers.map((pageNumber, index) => {
                  const previousPage = visiblePageNumbers[index - 1]
                  const shouldShowGap = previousPage !== undefined && pageNumber - previousPage > 1

                  return (
                    <div key={pageNumber} className="flex items-center gap-1">
                      {shouldShowGap && (
                        <span className="text-sm text-neutral-400 px-1">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-8 px-2 py-1.5 rounded-xl border text-sm font-medium ${
                          pageNumber === currentPage
                            ? "border-black bg-black text-white"
                            : "border-neutral-200 dark:border-gray-600 hover:bg-neutral-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-gray-600 text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
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