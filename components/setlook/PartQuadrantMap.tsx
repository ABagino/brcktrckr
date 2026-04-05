"use client"

import { useMemo } from "react"
import { InventoryRecord } from "./helper"

// Threshold for considering a metric "high"
const HIGH_THRESHOLD = 1.0

// Set classification types
type SetClassification = "Goldmine" | "Magnet Set" | "Staple Set" | "Dead Stock"

// Colors for each classification
const CLASSIFICATION_COLORS: Record<SetClassification, string> = {
  Goldmine: "#22c55e",
  "Magnet Set": "#a855f7",
  "Staple Set": "#3b82f6",
  "Dead Stock": "#9ca3af",
}

const CLASSIFICATION_DESCRIPTIONS: Record<SetClassification, string> = {
  Goldmine: "Great mix of bulk, magnetism, and sellability - a well-rounded investment",
  "Magnet Set": "Draws buyers in to complete collections - good for store traffic",
  "Staple Set": "Reliable bulk/sellable parts - bread-and-butter builder stock",
  "Dead Stock": "Limited demand across all metrics - may be hard to move",
}

interface PartQuadrantMapProps {
  inventory: InventoryRecord[]
}

interface ValueDriverStats {
  totalValuableParts: number
  bulkDriven: number
  magnetismDriven: number
  sellabilityDriven: number
  multiDriver: number // Parts driven by 2+ factors
}

function getValueDriverStats(inventory: InventoryRecord[]): ValueDriverStats {
  const parts = inventory.filter((item) => item.ItemType !== "MINIFIG")

  let totalValuableParts = 0
  let bulkDriven = 0
  let magnetismDriven = 0
  let sellabilityDriven = 0
  let multiDriver = 0

  for (const item of parts) {
    const valueMultiply = parseFloat(item.ValueMultiply ?? "0") || 0
    if (valueMultiply < HIGH_THRESHOLD) continue

    totalValuableParts++

    const bulk = parseFloat(item.BulkDemand ?? "0") || 0
    const magnetism = parseFloat(item.StoreMagnetism ?? "0") || 0
    const sellability = parseFloat(item.GeneralSellability ?? "0") || 0

    const highBulk = bulk >= HIGH_THRESHOLD
    const highMagnetism = magnetism >= HIGH_THRESHOLD
    const highSellability = sellability >= HIGH_THRESHOLD

    const driverCount = [highBulk, highMagnetism, highSellability].filter(Boolean).length

    if (highBulk) bulkDriven++
    if (highMagnetism) magnetismDriven++
    if (highSellability) sellabilityDriven++
    if (driverCount >= 2) multiDriver++
  }

  return { totalValuableParts, bulkDriven, magnetismDriven, sellabilityDriven, multiDriver }
}

// Minimum percentage of valuable parts needed to escape Dead Stock
const MIN_VALUABLE_PCT = 0.45

function classifySet(stats: ValueDriverStats, totalParts: number): SetClassification {
  const { totalValuableParts, bulkDriven, magnetismDriven, sellabilityDriven, multiDriver } = stats

  if (totalValuableParts === 0) return "Dead Stock"

  // Primary check: must have enough valuable parts to be worth anything
  const valuablePct = totalParts > 0 ? totalValuableParts / totalParts : 0
  if (valuablePct < MIN_VALUABLE_PCT) return "Dead Stock"

  // Calculate driver percentages
  const multiDriverPct = multiDriver / totalValuableParts
  const magnetismPct = magnetismDriven / totalValuableParts
  const bulkSellPct = (bulkDriven + sellabilityDriven) / (2 * totalValuableParts)

  // Goldmine: good mix - many parts driven by multiple factors
  if (multiDriverPct >= 0.4) return "Goldmine"

  // Magnet Set: magnetism is the dominant driver
  if (magnetismPct >= 0.5 && magnetismPct > bulkSellPct) return "Magnet Set"

  // Staple Set: bulk/sellability are dominant
  if (bulkSellPct >= 0.3) return "Staple Set"

  // Default to Dead Stock if nothing stands out
  return "Dead Stock"
}

export default function PartQuadrantMap({ inventory }: PartQuadrantMapProps) {
  const stats = useMemo(() => getValueDriverStats(inventory), [inventory])
  const totalParts = inventory.filter((item) => item.ItemType !== "MINIFIG").length
  const classification = useMemo(() => classifySet(stats, totalParts), [stats, totalParts])

  const valuablePct = totalParts > 0 ? Math.round((stats.totalValuableParts / totalParts) * 100) : 0

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Set Profile
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Parts with Value Multiply above 1.0 and what drives their scores
        </p>
      </div>

      {/* Key Metric: Valuable Parts */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
              {valuablePct}%
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              Valuable Parts
            </div>
          </div>
          <div className="text-amber-600 dark:text-amber-400 text-2xl">•</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
              {stats.totalValuableParts}
            </div>
            <div className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              of {totalParts} parts
            </div>
          </div>
        </div>
        <div className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
          Parts with Value Multiply above 1.0 - need 45%+ to escape Dead Stock
        </div>
      </div>

      {/* Classification Badge */}
      <div className="mb-6 flex flex-col items-center">
        <div
          className="px-6 py-3 rounded-xl text-white font-bold text-xl shadow-lg"
          style={{ backgroundColor: CLASSIFICATION_COLORS[classification] }}
        >
          {classification}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center max-w-md">
          {CLASSIFICATION_DESCRIPTIONS[classification]}
        </p>
      </div>

      {/* Stats Grid - Driver Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.bulkDriven}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            out of {totalParts} parts
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Bulk Driven
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.magnetismDriven}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            out of {totalParts} parts
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Magnet Driven
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.sellabilityDriven}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            out of {totalParts} parts
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Sellability Driven
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.multiDriver}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            out of {totalParts} parts
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Multi-Driver
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
          Set Classifications
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {(Object.keys(CLASSIFICATION_COLORS) as SetClassification[]).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CLASSIFICATION_COLORS[type] }}
              />
              <span className="text-gray-600 dark:text-gray-400">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
