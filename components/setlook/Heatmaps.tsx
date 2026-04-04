"use client"

import { useMemo } from "react"
import { InventoryRecord } from "./helper"

interface HeatmapsProps {
  inventory: InventoryRecord[]
}

// Staple × Hotness thresholds
const STAPLE_THRESHOLDS = [0.5, 1] // Low: 0-0.5, Med: 0.5-1, High: 1+
const HOTNESS_THRESHOLDS = [0.5, 1] // Low: 0-0.5, Med: 0.5-1, High: 1+

function getStapleIndex(staple: number): number {
  if (staple < STAPLE_THRESHOLDS[0]) return 0
  if (staple < STAPLE_THRESHOLDS[1]) return 1
  return 2
}

function getHotnessIndex(hotness: number): number {
  if (hotness < HOTNESS_THRESHOLDS[0]) return 0
  if (hotness < HOTNESS_THRESHOLDS[1]) return 1
  return 2
}

// Color intensity based on cell importance (staple + hotness combined)
function getDemandCellColor(stapleIdx: number, hotnessIdx: number): string {
  const score = stapleIdx + hotnessIdx // 0-4
  // Colors from red (avoid) to green (priority)
  const colors = [
    "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200", // 0 - Low/Low
    "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200", // 1
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200", // 2 - Mid
    "bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200", // 3
    "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200", // 4 - High/High
  ]
  return colors[score]
}

export default function Heatmaps({ inventory }: HeatmapsProps) {
  // Filter to parts only (exclude minifigs for demand heatmap)
  const parts = useMemo(
    () => inventory.filter((i) => i.ItemType !== "MINIFIG"),
    [inventory]
  )

  // Staple × Hotness grid data
  const demandGrid = useMemo(() => {
    // 3x3 grid: [stapleIdx][hotnessIdx] = { lots, pieces, value }
    const grid: { lots: number; pieces: number; value: number }[][] = Array.from(
      { length: 3 },
      () => Array.from({ length: 3 }, () => ({ lots: 0, pieces: 0, value: 0 }))
    )

    for (const part of parts) {
      const staple = parseFloat(part.Staple ?? "0") || 0
      const hotness = parseFloat(part.Hotness ?? "0") || 0
      const value = parseFloat(part.TotalValue ?? "0") || 0
      const quantity = part.Quantity || 0

      const sIdx = getStapleIndex(staple)
      const hIdx = getHotnessIndex(hotness)

      grid[sIdx][hIdx].lots += 1
      grid[sIdx][hIdx].pieces += quantity
      grid[sIdx][hIdx].value += value
    }

    return grid
  }, [parts])

  if (parts.length === 0) return null

  return (
    <div className="mb-6">
      {/* Staple × Hotness Heatmap */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Demand Analysis (Staple × Hotness)
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[320px]">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-1 mb-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center"></div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                Low Hotness
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                Med Hotness
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                High Hotness
              </div>
            </div>

            {/* Grid rows (reversed so High Staple is at top) */}
            {[2, 1, 0].map((stapleIdx) => (
              <div key={stapleIdx} className="grid grid-cols-4 gap-1 mb-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end pr-2 font-medium">
                  {stapleIdx === 2 ? "High" : stapleIdx === 1 ? "Med" : "Low"} Staple
                </div>
                {[0, 1, 2].map((hotnessIdx) => {
                  const cell = demandGrid[stapleIdx][hotnessIdx]
                  return (
                    <div
                      key={hotnessIdx}
                      className={`rounded p-2 text-center ${getDemandCellColor(
                        stapleIdx,
                        hotnessIdx
                      )}`}
                    >
                      <div className="text-sm font-bold">
                        ${cell.value.toFixed(0)}
                      </div>
                      <div className="text-xs opacity-80">
                        {cell.pieces} pcs / {cell.lots} lots
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
