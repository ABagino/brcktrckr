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

  const [showPartsTooltip, setShowPartsTooltip] = useState(false)
  const [showMinifigsTooltip, setShowMinifigsTooltip] = useState(false)

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
              <div className="relative inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-medium">
                <span>Parts: {counts.parts}/{counts.partsPieces} (${totals.parts.toFixed(2)})</span>
                <button
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-blue-600 dark:border-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  onMouseEnter={() => setShowPartsTooltip(true)}
                  onMouseLeave={() => setShowPartsTooltip(false)}
                  onClick={() => setShowPartsTooltip(!showPartsTooltip)}
                >
                  <span className="text-[10px] font-bold">?</span>
                </button>
                {showPartsTooltip && (
                  <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg whitespace-normal">
                    Number of Lots / Number of Pieces<br />
                    (Sum of the Part&apos;s &quot;Total Value&quot; column.)
                  </div>
                )}
              </div>
              <div className="relative inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-medium">
                <span>Minifigs: {counts.minifigs > 0 ? `${counts.minifigs}/${counts.minifigPieces}` : "-"}
                  {counts.minifigs > 0 && ` ($${totals.minifigs.toFixed(2)})`}</span>
                {counts.minifigs > 0 && (
                  <>
                    <button
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-yellow-600 dark:border-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                      onMouseEnter={() => setShowMinifigsTooltip(true)}
                      onMouseLeave={() => setShowMinifigsTooltip(false)}
                      onClick={() => setShowMinifigsTooltip(!showMinifigsTooltip)}
                    >
                      <span className="text-[10px] font-bold">?</span>
                    </button>
                    {showMinifigsTooltip && (
                      <div className="absolute z-10 bottom-full mb-2 right-0 w-max max-w-[220px] p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg whitespace-normal">
                        Number of Unique Minifigures / Total Quantity<br />
                        (Sum of higher price per minifigure, between the minifigure&apos;s individual cost vs the minifigure&apos;s parts total cost.)
                      </div>
                    )}
                  </>
                )}
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
