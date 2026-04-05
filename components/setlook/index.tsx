"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Image from "next/image"
import { useSetData } from "./useSetData"
import InventoryTable from "./invTable"
import PartQuadrantMap from "./PartQuadrantMap"
import { SortableKey, InventoryRecord } from "./helper"

// Heatmap thresholds (matching Heatmaps.tsx)
const SELLABILITY_THRESHOLDS = [1.5, 3]
const BULK_DEMAND_THRESHOLDS = [1.5, 3]

function getSellabilityIndex(sellability: number): number {
  if (sellability < SELLABILITY_THRESHOLDS[0]) return 0
  if (sellability < SELLABILITY_THRESHOLDS[1]) return 1
  return 2
}

function getBulkDemandIndex(bulkDemand: number): number {
  if (bulkDemand < BULK_DEMAND_THRESHOLDS[0]) return 0
  if (bulkDemand < BULK_DEMAND_THRESHOLDS[1]) return 1
  return 2
}

function escapeCsvField(value: string | number | null | undefined): string {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

interface SetLookProps {
  searchValue: string
  viewMode: "basic" | "advanced"
}

const LOADING_MESSAGES = [
  "Sorting bricks by colour...",
  "Convincing Emmet to hurry up...",
  "Counting 1x1 plates (this takes a while)...",
  "Separating Duplo from the real stuff...",
  "Bribing Benny for spaceship prices...",
  "Checking couch cushions for lost pieces...",
  "Negotiating with Lord Business...",
  "Polishing the chrome minifig...",
  "Stepping on a brick to invoke speed...",
  "Consulting the Master Builders...",
  "Fetching prices from the Ninjago realm...",
  "Assembling data without the instructions...",
]

export default function SetLook({ searchValue, viewMode }: SetLookProps) {
  const {
    matchedSet,
    parsedInventory,
    totals,
    counts,
    isNotFound,
    isLoading,
  } = useSetData(searchValue)

  const [sortConfigMinifig, setSortConfigMinifig] = useState<{
    key: SortableKey | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  const [sortConfigParts, setSortConfigParts] = useState<{
    key: SortableKey | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) return
    setLoadingMsgIndex(Math.floor(Math.random() * LOADING_MESSAGES.length))
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [isLoading])

  // --- Header sets ---
  const basicHeaders: { key: SortableKey; label: string }[] = [
    { key: "ItemNumber", label: "Item Number" },
    { key: "Name", label: "Name" },
    { key: "ColourName", label: "Colour Name" },
    { key: "Quantity", label: "Quantity" },
    { key: "SoldAvgPrice", label: "Sold Avg Price" },
    { key: "ValueMultiply", label: "Value Multiply" },
    { key: "PieceTimeValue", label: "Piece Time Value" },
    { key: "TotalValue", label: "Total Value" },
  ]

  const advancedHeaders: { key: SortableKey; label: string }[] = [
    { key: "ItemNumber", label: "Item Number" },
    { key: "Name", label: "Name" },
    { key: "ColourName", label: "Colour Name" },
    { key: "Quantity", label: "Quantity" },
    { key: "SoldAvgPrice", label: "Sold Avg Price" },
    { key: "SoldTotalQuantity", label: "Sold Total Qty" },
    { key: "SoldUnitQuantity", label: "Sold Unit Qty" },
    { key: "StockAvgPrice", label: "Stock Avg Price" },
    { key: "StockTotalQuantity", label: "Stock Total Qty" },
    { key: "StockUnitQuantity", label: "Stock Unit Qty" },
    { key: "BulkDemand", label: "Bulk Demand" },
    { key: "StoreMagnetism", label: "Magnetism" },
    { key: "GeneralSellability", label: "Sellability" },
    { key: "ValueMultiply", label: "Value Multiply" },
    { key: "PieceTimeValue", label: "Piece Time Value" },
    { key: "TotalValue", label: "Total Value" },
  ]

  const activeHeaders =
    viewMode === "basic" ? basicHeaders : advancedHeaders

  // --- Sorting logic ---
  const sortedMinifigs = useMemo(() => {
    const filtered = parsedInventory.filter((i) => i.ItemType === "MINIFIG")
    const { key, direction } = sortConfigMinifig
    if (!key) return filtered
    return [...filtered].sort((a, b) => {
      const cmp =
        ["ItemNumber", "Name", "ColourName"].includes(key)
          ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""))
          : (parseFloat(a[key] as string) || 0) -
            (parseFloat(b[key] as string) || 0)
      return direction === "asc" ? cmp : -cmp
    })
  }, [parsedInventory, sortConfigMinifig])

  const sortedParts = useMemo(() => {
    const filtered = parsedInventory.filter((i) => i.ItemType !== "MINIFIG")
    const { key, direction } = sortConfigParts
    if (!key) return filtered
    return [...filtered].sort((a, b) => {
      const cmp =
        ["ItemNumber", "Name", "ColourName"].includes(key)
          ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""))
          : (parseFloat(a[key] as string) || 0) -
            (parseFloat(b[key] as string) || 0)
      return direction === "asc" ? cmp : -cmp
    })
  }, [parsedInventory, sortConfigParts])

  // --- CSV Download ---
  const downloadCsv = useCallback(() => {
    if (!matchedSet) return

    const lines: string[] = []

    // Set Info Section
    lines.push("SET INFORMATION")
    lines.push(`Set Number,${escapeCsvField(matchedSet.SetNumber)}`)
    lines.push(`Set Name,${escapeCsvField(matchedSet.SetName)}`)
    lines.push(`Theme,${escapeCsvField(matchedSet.ThemeName)}`)
    lines.push(`Total Value,$${totals.total.toFixed(2)}`)
    lines.push(`Parts Value,$${totals.parts.toFixed(2)}`)
    lines.push(`Minifigs Value,$${totals.minifigs.toFixed(2)}`)
    lines.push(`Part Lots,${counts.parts}`)
    lines.push(`Part Pieces,${counts.partsPieces}`)
    lines.push(`Minifig Count,${counts.minifigs}`)
    lines.push(`Minifig Parts,${counts.minifigPieces}`)
    lines.push("")

    // Heatmap Section
    const parts = parsedInventory.filter((i) => i.ItemType !== "MINIFIG")
    const grid: { lots: number; pieces: number; value: number }[][] = Array.from(
      { length: 3 },
      () => Array.from({ length: 3 }, () => ({ lots: 0, pieces: 0, value: 0 }))
    )
    for (const part of parts) {
      const sellability = parseFloat(part.GeneralSellability ?? "0") || 0
      const bulkDemand = parseFloat(part.BulkDemand ?? "0") || 0
      const value = parseFloat(part.TotalValue ?? "0") || 0
      const quantity = part.Quantity || 0
      const sIdx = getSellabilityIndex(sellability)
      const bIdx = getBulkDemandIndex(bulkDemand)
      grid[sIdx][bIdx].lots += 1
      grid[sIdx][bIdx].pieces += quantity
      grid[sIdx][bIdx].value += value
    }

    lines.push("DEMAND HEATMAP (Sellability x Bulk Demand)")
    lines.push(",Low Bulk,Med Bulk,High Bulk")
    const sellabilityLabels = ["Low Sell", "Med Sell", "High Sell"]
    for (let sIdx = 2; sIdx >= 0; sIdx--) {
      const row = [sellabilityLabels[sIdx]]
      for (let bIdx = 0; bIdx < 3; bIdx++) {
        const cell = grid[sIdx][bIdx]
        row.push(`$${cell.value.toFixed(0)} (${cell.pieces} pcs / ${cell.lots} lots)`)
      }
      lines.push(row.join(","))
    }
    lines.push("")

    // Inventory Headers
    const csvHeaders = [
      "Type",
      "Item Number",
      "Name",
      "Colour ID",
      "Colour Name",
      "Quantity",
      "Sold Avg Price",
      "Sold Total Qty",
      "Sold Unit Qty",
      "Stock Avg Price",
      "Stock Total Qty",
      "Stock Unit Qty",
      "Bulk Demand",
      "Store Magnetism",
      "General Sellability",
      "Value Multiply",
      "Piece Time Value",
      "Total Value",
    ]

    const formatRow = (item: InventoryRecord) => [
      item.ItemType,
      item.ItemNumber,
      escapeCsvField(item.Name),
      item.ColourID,
      escapeCsvField(item.ColourName),
      item.Quantity,
      item.SoldAvgPrice ?? "",
      item.SoldTotalQuantity ?? "",
      item.SoldUnitQuantity ?? "",
      item.StockAvgPrice ?? "",
      item.StockTotalQuantity ?? "",
      item.StockUnitQuantity ?? "",
      item.BulkDemand ?? "",
      item.StoreMagnetism ?? "",
      item.GeneralSellability ?? "",
      item.ValueMultiply ?? "",
      item.PieceTimeValue ?? "",
      item.TotalValue ?? "",
    ].join(",")

    // Minifigs Section
    if (sortedMinifigs.length > 0) {
      lines.push("MINIFIGURES")
      lines.push(csvHeaders.join(","))
      sortedMinifigs.forEach((item) => lines.push(formatRow(item)))
      lines.push("")
    }

    // Parts Section
    if (sortedParts.length > 0) {
      lines.push("PARTS")
      lines.push(csvHeaders.join(","))
      sortedParts.forEach((item) => lines.push(formatRow(item)))
    }

    // Download
    const csvContent = lines.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const today = new Date().toISOString().split("T")[0]
    link.download = `${matchedSet.SetNumber}-${today}-bricktrckr.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [matchedSet, totals, counts, parsedInventory, sortedMinifigs, sortedParts])

  return (
    <div>
      {/* ⏳ Loading Spinner */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-500 dark:text-gray-400">
          <svg
            className="animate-spin h-10 w-10 text-yellow-400"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-sm font-medium animate-pulse">{LOADING_MESSAGES[loadingMsgIndex]}</p>
        </div>
      )}

      {/* ❌ Set Not Found */}
      {isNotFound && (
        <div className="text-red-600 dark:text-red-400 mb-6 space-y-3">
          <p className="font-semibold">Set &apos;{searchValue}&apos; not found!</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>The set&apos;s inventory may not exist on BrickLink yet.</li>
            <li>Older sets (pre-2024) might not be loaded in BrickTrcker yet.</li>
            <li>Something went wrong while fetching data.</li>
          </ul>
        </div>
      )}

      {/* 🧾 Set Info Bar */}
      {matchedSet && (
        <div className="flex flex-col md:flex-row justify-between md:items-center border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 bg-white dark:bg-gray-800 shadow mb-5 gap-3 md:gap-4">
          <div className="flex items-start md:items-center gap-3 md:gap-4">
            <div className="flex-shrink-0">
              <Image
                src={`https://cdn.rebrickable.com/media/sets/${matchedSet.SetNumber}.jpg`}
                alt={`${matchedSet.SetNumber} cover`}
                width={96}
                height={96}
                className="w-16 h-16 md:w-24 md:h-24 object-contain rounded bg-gray-50 dark:bg-gray-900"
                unoptimized
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="my-0.5 md:my-1 text-sm md:text-base">
                <strong>Set Number:</strong> {matchedSet.SetNumber}
              </p>
              <p className="my-0.5 md:my-1 text-sm md:text-base truncate">
                <strong>Set Name:</strong> {matchedSet.SetName}
              </p>
              <p className="my-0.5 md:my-1 text-sm md:text-base">
                <strong>Theme:</strong> {matchedSet.ThemeName}
              </p>
            </div>
          </div>

          <div className="md:text-right space-y-2 md:space-y-1 border-t md:border-t-0 pt-3 md:pt-0">
            <div className="text-xl md:text-2xl font-bold">
              Total Value: ${totals.total.toFixed(2)}
            </div>
            <div className="flex items-center md:justify-end gap-2 text-xs md:text-sm flex-wrap">
              <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-medium">
                {counts.partsPieces} parts / {counts.parts} lots (${totals.parts.toFixed(2)})
              </div>
              <div className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-medium">
                Minifigs: {counts.minifigs}
                  {counts.minifigs > 0 && ` (${counts.minifigPieces} parts) ($${totals.minifigs.toFixed(2)})`}
              </div>
              <button
                onClick={downloadCsv}
                className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-md font-medium hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors cursor-pointer"
                title="Download CSV"
              >
                ⬇ CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Set Profile */}
      {parsedInventory.length > 0 && !isLoading && (
        <PartQuadrantMap inventory={parsedInventory} />
      )}

      {/* 🧱 Tables */}
      {counts.minifigs > 0 && (
        <InventoryTable
          title="Minifigures"
          records={sortedMinifigs}
          activeHeaders={activeHeaders}
          sortConfig={sortConfigMinifig}
          setSortConfig={setSortConfigMinifig}
          imagePath={(i) =>
            `https://img.bricklink.com/ItemImage/MN/0/${i.ItemNumber}.png`
          }
          viewMode={viewMode}
        />
      )}

      {counts.parts > 0 && (
        <InventoryTable
          title="Parts"
          records={sortedParts}
          activeHeaders={activeHeaders}
          sortConfig={sortConfigParts}
          setSortConfig={setSortConfigParts}
          imagePath={(i) =>
            `https://img.bricklink.com/ItemImage/PN/${i.ColourID}/${i.ItemNumber}.png`
          }
          viewMode={viewMode}
        />
      )}
    </div>
  )
}
