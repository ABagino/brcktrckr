"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useSetData } from "./useSetData"
import InventoryTable from "./invTable"
import { SortableKey } from "./helper"

interface SetLookProps {
  searchValue: string
  viewMode: "basic" | "advanced"
}

export default function SetLook({ searchValue, viewMode }: SetLookProps) {
  const {
    matchedSet,
    parsedInventory,
    totals,
    counts,
    isNotFound,
  } = useSetData(searchValue)

  const [sortConfigMinifig, setSortConfigMinifig] = useState<{
    key: SortableKey | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  const [sortConfigParts, setSortConfigParts] = useState<{
    key: SortableKey | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

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
        <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow mb-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Image
                src={`https://cdn.rebrickable.com/media/sets/${matchedSet.SetNumber}.jpg`}
                alt={`${matchedSet.SetNumber} cover`}
                width={96}
                height={96}
                className="w-24 h-24 object-contain rounded bg-gray-50 dark:bg-gray-900"
                unoptimized
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = "none"
                }}
              />
            </div>

            <div>
              <p className="my-1">
                <strong>Set Number:</strong> {matchedSet.SetNumber}
              </p>
              <p className="my-1">
                <strong>Set Name:</strong> {matchedSet.SetName}
              </p>
              <p className="my-1">
                <strong>Theme:</strong> {matchedSet.ThemeName}
              </p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-2xl font-bold">
              Total Value: ${totals.total.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-medium">
                Parts: {counts.parts} (${totals.parts.toFixed(2)})
              </div>
              <div className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-medium">
                Minifigs: {counts.minifigs}
                  {counts.minifigs > 0 && ` ($${totals.minifigs.toFixed(2)})`}
              </div>
            </div>
          </div>
        </div>
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
        />
      )}
    </div>
  )
}
