"use client"

import { useMemo } from "react"
import Link from "next/link"
import { InventoryRecord } from "./helper"

// Threshold for considering a metric "high"
const HIGH_THRESHOLD = 1.0

// Set classification types
type SetClassification = "Goldmine" | "Crowd Puller" | "Builder's Pack" | "Reliable Return" | "Dead Stock"

// Colors for each classification
const CLASSIFICATION_COLORS: Record<SetClassification, string> = {
  Goldmine: "#22c55e",
  "Crowd Puller": "#a855f7",
  "Builder's Pack": "#3b82f6",
  "Reliable Return": "#f59e0b",
  "Dead Stock": "#9ca3af",
}

const CLASSIFICATION_DESCRIPTIONS: Record<SetClassification, string> = {
  Goldmine: "Great mix of bulk, magnetism, and sellability - a well-rounded investment",
  "Crowd Puller": "Draws buyers in to complete collections - good for store traffic",
  "Builder's Pack": "Reliable bulk/sellable parts - bread-and-butter builder stock",
  "Reliable Return": "Consistently sellable parts - dependable turnover with low friction",
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
const MIN_VALUABLE_PCT = 0.50

function classifySet(stats: ValueDriverStats, totalParts: number): SetClassification {
  const { totalValuableParts, bulkDriven, magnetismDriven, sellabilityDriven, multiDriver } = stats

  if (totalValuableParts === 0) return "Dead Stock"

  // Primary check: must have enough valuable parts to be worth anything
  const valuablePct = totalParts > 0 ? totalValuableParts / totalParts : 0
  if (valuablePct < MIN_VALUABLE_PCT) return "Dead Stock"

  // Classify by whichever driver count is largest
  const scores: [number, SetClassification][] = [
    [multiDriver, "Goldmine"],
    [magnetismDriven, "Crowd Puller"],
    [bulkDriven, "Builder's Pack"],
    [sellabilityDriven, "Reliable Return"],
  ]
  scores.sort((a, b) => b[0] - a[0])
  return scores[0][1]
}

export default function PartQuadrantMap({ inventory }: PartQuadrantMapProps) {
  const stats = useMemo(() => getValueDriverStats(inventory), [inventory])
  const totalParts = inventory.filter((item) => item.ItemType !== "MINIFIG").length
  const classification = useMemo(() => classifySet(stats, totalParts), [stats, totalParts])

  const valuablePct = totalParts > 0 ? Math.round((stats.totalValuableParts / totalParts) * 100) : 0

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Set Profile
        </h3>
        <Link
          href="/about#metrics"
          title="Interested to know how the metrics are calculated? Check out the FAQ"
          className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-400 text-xs font-bold transition-colors"
        >
          ?
        </Link>
      </div>

      {/* Key Metric + Classification: 2 columns */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        {/* Valuable Parts */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-3">
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
            Parts with Value Multiply above 1.0 - need 50%+ to escape Dead Stock
          </div>
        </div>

        {/* Classification Badge */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="px-6 py-3 rounded-xl text-white font-bold text-xl shadow-lg"
            style={{ backgroundColor: CLASSIFICATION_COLORS[classification] }}
          >
            {classification}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
            {CLASSIFICATION_DESCRIPTIONS[classification]}
          </p>
        </div>
      </div>

      {/* Stats Grid - Driver Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-2 text-center">
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

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-2 text-center">
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

        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-2 text-center">
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

        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-2 text-center">
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

    </div>
  )
}
