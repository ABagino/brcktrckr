"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import NavMenu from "@/components/NavMenu"
import {
  getSetValueRows,
  getSetValueThemes,
  RankedSetValueRow,
  SetValueMode,
} from "@/utils/supabase/setValueMv"

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6">
      <div className="flex justify-end mb-4">
        <NavMenu />
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Set Rank</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          Pick a year range, choose your favorite themes, and discover which sets come out on top.
        </p>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="mode" className="block text-sm font-medium mb-1">
              Ranking Style:
            </label>
            <select
              id="mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as SetValueMode)}
              className="w-full p-2.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            >
              <option value="most_pieces">Rank by piece count</option>
              <option value="highest_part_value">Rank by part value</option>
              <option value="highest_minifig_value">Rank by minifigure value</option>
              <option value="highest_total_value">Rank by total value</option>
              <option value="multiplicative_effect">Rank by multiplicative effect</option>
            </select>
          </div>

          <div>
            <label htmlFor="startYear" className="block text-sm font-medium mb-1">
              Start Year:
            </label>
            <input
              id="startYear"
              type="number"
              min={MIN_LEGO_YEAR}
              max={currentYear}
              value={startYearInput}
              onChange={(event) => setStartYearInput(event.target.value)}
              className="w-full p-2.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              placeholder={`e.g. ${MIN_LEGO_YEAR}`}
            />
          </div>

          <div>
            <label htmlFor="endYear" className="block text-sm font-medium mb-1">
              End Year:
            </label>
            <input
              id="endYear"
              type="number"
              min={MIN_LEGO_YEAR}
              max={currentYear}
              value={endYearInput}
              onChange={(event) => setEndYearInput(event.target.value)}
              className="w-full p-2.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              placeholder={`e.g. ${currentYear}`}
            />
          </div>

          <div className="relative">
            <label htmlFor="themeSearch" className="block text-sm font-medium mb-1">
              Themes: <span className="italic">(multi-select)</span>
            </label>
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
              className="w-full p-2.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
              placeholder="Type to find themes"
            />

            {showThemeOptions && filteredThemeOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
                {filteredThemeOptions.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      addTheme(theme)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                className="px-3 py-1.5 rounded-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {theme} ×
              </button>
            ))}
          </div>
        )}

        {mode === "multiplicative_effect" && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Multiplicative effect = <strong>total_value / raw_part_value</strong>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            {loading ? "Loading results..." : `Showing ${pageStart}-${pageEnd} of ${sortedRows.length} set(s)`}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="text-left p-3">
                    <button type="button" onClick={() => handleSortClick("set_num")} className="font-semibold hover:underline">
                      Set # | Name
                      {sortLabel("set_num")}
                    </button>
                  </th>
                  <th className="text-left p-3">Theme</th>
                  <th className="text-right p-3">Year</th>
                  <th className="text-right p-3">
                    <button type="button" onClick={() => handleSortClick("piece_qty")} className="font-semibold hover:underline">
                      Pieces
                      {sortLabel("piece_qty")}
                    </button>
                  </th>
                  <th className="text-right p-3">
                    <button type="button" onClick={() => handleSortClick("part_value_indexed")} className="font-semibold hover:underline">
                      Part Value
                      {sortLabel("part_value_indexed")}
                    </button>
                  </th>
                  <th className="text-right p-3">
                    <button type="button" onClick={() => handleSortClick("minifig_value_indexed")} className="font-semibold hover:underline">
                      Minifig Value
                      {sortLabel("minifig_value_indexed")}
                    </button>
                  </th>
                  <th className="text-right p-3">
                    <button type="button" onClick={() => handleSortClick("total_value")} className="font-semibold hover:underline">
                      Total Value
                      {sortLabel("total_value")}
                    </button>
                  </th>
                  <th className="text-right p-3">
                    <button type="button" onClick={() => handleSortClick("value_per_piece")} className="font-semibold hover:underline">
                      Value / Piece
                      {sortLabel("value_per_piece")}
                    </button>
                  </th>
                  <th className="text-right p-3">
                    <button type="button" onClick={() => handleSortClick("multiplicative_effect")} className="font-semibold hover:underline">
                      Multiplier
                      {sortLabel("multiplicative_effect")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && sortedRows.length === 0 && !error && (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No sets found for this filter.
                    </td>
                  </tr>
                )}

                {paginatedRows.map((row) => (
                  <tr key={row.set_num} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-3">
                      <Link
                        href={`/set-look?q=${encodeURIComponent(row.set_num)}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {row.set_num}
                      </Link>
                      <div className="text-gray-600 dark:text-gray-400">{row.set_name}</div>
                    </td>
                    <td className="p-3">{row.theme_name}</td>
                    <td className="p-3 text-right">{row.year}</td>
                    <td className="p-3 text-right">{numberFormat(row.piece_qty)}</td>
                    <td className="p-3 text-right">{currency(row.part_value_indexed)}</td>
                    <td className="p-3 text-right">{currency(Math.max(row.minifig_value_indexed, row.minifig_part_value_indexed))}</td>
                    <td className="p-3 text-right">{currency(row.total_value)}</td>
                    <td className="p-3 text-right">{currency(row.value_per_piece)}</td>
                    <td className="p-3 text-right">{row.multiplicative_effect.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && sortedRows.length > PAGE_SIZE && (
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                {visiblePageNumbers.map((pageNumber, index) => {
                  const previousPage = visiblePageNumbers[index - 1]
                  const shouldShowGap = previousPage !== undefined && pageNumber - previousPage > 1

                  return (
                    <div key={pageNumber} className="flex items-center gap-1 sm:gap-2">
                      {shouldShowGap && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 px-1">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-9 px-2 py-2 rounded border text-sm ${
                          pageNumber === currentPage
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 dark:border-gray-600"
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
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}