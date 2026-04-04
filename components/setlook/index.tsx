"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useSetData } from "./useSetData"
import InventoryTable from "./invTable"
import Heatmaps from "./Heatmaps"
import { SortableKey } from "./helper"

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
    { key: "Staple", label: "Staple" },
    { key: "Hotness", label: "Hotness" },
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
            </div>
          </div>
        </div>
      )}

      {/* 📊 Heatmaps */}
      {parsedInventory.length > 0 && !isLoading && (
        <Heatmaps inventory={parsedInventory} />
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
