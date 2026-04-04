"use client"

import { useMemo } from "react"
import { InventoryRecord } from "./helper"

interface HeatmapsProps {
  inventory: InventoryRecord[]
}

// Sellability × Bulk Demand thresholds (both metrics range 0–5)
const SELLABILITY_THRESHOLDS = [1.5, 3] // Low: 0-1.5, Med: 1.5-3, High: 3+
const BULK_DEMAND_THRESHOLDS = [1.5, 3] // Low: 0-1.5, Med: 1.5-3, High: 3+

// Value Multiply distribution bins
const VM_BINS = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5]

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

// Color intensity based on cell importance (sellability + bulk demand combined)
function getDemandCellColor(sellabilityIdx: number, bulkDemandIdx: number): string {
  const score = sellabilityIdx + bulkDemandIdx // 0-4
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

  // Sellability × Bulk Demand grid data
  const demandGrid = useMemo(() => {
    // 3x3 grid: [sellabilityIdx][bulkDemandIdx] = { lots, pieces, value }
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

    return grid
  }, [parts])

  // Value Multiply distribution data
  const vmDistribution = useMemo(() => {
    const bins: { binStart: number; pieces: number }[] = VM_BINS.slice(0, -1).map(
      (binStart) => ({ binStart, pieces: 0 })
    )

    for (const part of parts) {
      const vm = parseFloat(part.ValueMultiply ?? "0") || 0
      const quantity = part.Quantity || 0
      // Find the right bin
      for (let i = bins.length - 1; i >= 0; i--) {
        if (vm >= bins[i].binStart) {
          bins[i].pieces += quantity
          break
        }
      }
    }

    return bins
  }, [parts])

  const maxPieces = useMemo(
    () => Math.max(...vmDistribution.map((b) => b.pieces), 1),
    [vmDistribution]
  )

  if (parts.length === 0) return null

  // SVG dimensions
  const chartWidth = 300
  const chartHeight = 140
  const padding = { top: 10, right: 10, bottom: 18, left: 35 }

  return (
    <div className="mb-6 flex flex-col lg:flex-row gap-4">
      {/* Sellability × Bulk Demand Heatmap */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow flex-1">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Demand Analysis (Sellability × Bulk)
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[320px]">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-1 mb-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center"></div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                Low Bulk
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                Med Bulk
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                High Bulk
              </div>
            </div>

            {/* Grid rows (reversed so High Sellability is at top) */}
            {[2, 1, 0].map((sellabilityIdx) => (
              <div key={sellabilityIdx} className="grid grid-cols-4 gap-1 mb-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end pr-2 font-medium">
                  {sellabilityIdx === 2 ? "High" : sellabilityIdx === 1 ? "Med" : "Low"} Sell
                </div>
                {[0, 1, 2].map((bulkIdx) => {
                  const cell = demandGrid[sellabilityIdx][bulkIdx]
                  return (
                    <div
                      key={bulkIdx}
                      className={`rounded p-2 text-center ${getDemandCellColor(
                        sellabilityIdx,
                        bulkIdx
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

      {/* Value Multiply Distribution */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow flex-1">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Value Multiply Distribution
        </h3>
        <div className="flex justify-center">
          <svg
            width={chartWidth + padding.left + padding.right}
            height={chartHeight + padding.top + padding.bottom}
            className="overflow-visible"
          >
            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight + padding.top}
              stroke="currentColor"
              className="text-gray-300 dark:text-gray-600"
              strokeWidth={1}
            />
            {/* X-axis */}
            <line
              x1={padding.left}
              y1={chartHeight + padding.top}
              x2={chartWidth + padding.left}
              y2={chartHeight + padding.top}
              stroke="currentColor"
              className="text-gray-300 dark:text-gray-600"
              strokeWidth={1}
            />

            {/* Dotted line at x=1 */}
            {(() => {
              const xPos = padding.left + (1 / 5) * chartWidth
              return (
                <line
                  x1={xPos}
                  y1={padding.top}
                  x2={xPos}
                  y2={chartHeight + padding.top}
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              )
            })()}

            {/* Distribution curve - filled area */}
            {(() => {
              // Generate points at center of each bin, plus start/end points at 0
              const dataPoints = vmDistribution.map((bin) => {
                const x = padding.left + ((bin.binStart + 0.125) / 5) * chartWidth
                const y = padding.top + chartHeight - (bin.pieces / maxPieces) * chartHeight
                return { x, y }
              })

              // Add start point at x=0
              const points = [
                { x: padding.left, y: dataPoints[0]?.y ?? padding.top + chartHeight },
                ...dataPoints,
              ]

              const baseline = padding.top + chartHeight

              // Catmull-Rom spline to SVG path (clamped to not go below baseline)
              const catmullRomToPath = (pts: { x: number; y: number }[], tension = 0.5) => {
                if (pts.length < 2) return ""
                
                let path = `M ${pts[0].x} ${Math.min(pts[0].y, baseline)}`
                
                for (let i = 0; i < pts.length - 1; i++) {
                  const p0 = pts[Math.max(0, i - 1)]
                  const p1 = pts[i]
                  const p2 = pts[i + 1]
                  const p3 = pts[Math.min(pts.length - 1, i + 2)]
                  
                  // Control points - clamped to baseline
                  const cp1x = p1.x + (p2.x - p0.x) * tension / 6
                  const cp1y = Math.min(p1.y + (p2.y - p0.y) * tension / 6, baseline)
                  const cp2x = p2.x - (p3.x - p1.x) * tension / 6
                  const cp2y = Math.min(p2.y - (p3.y - p1.y) * tension / 6, baseline)
                  
                  path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${Math.min(p2.y, baseline)}`
                }
                
                return path
              }

              const linePath = catmullRomToPath(points, 1)
              const areaPath = `M ${padding.left} ${baseline} L ${points[0].x} ${Math.min(points[0].y, baseline)}` +
                linePath.slice(linePath.indexOf("C")) +
                ` L ${points[points.length - 1].x} ${baseline} Z`

              return (
                <>
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="vmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                      <stop offset="20%" stopColor="#f59e0b" stopOpacity={0.6} />
                      <stop offset="40%" stopColor="#eab308" stopOpacity={0.6} />
                      <stop offset="60%" stopColor="#84cc16" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  {/* Filled area */}
                  <path
                    d={areaPath}
                    fill="url(#vmGradient)"
                  />
                  {/* Curve line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={2}
                    className="dark:stroke-indigo-400"
                  />
                </>
              )
            })()}

            {/* X-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((val) => (
              <text
                key={val}
                x={padding.left + (val / 5) * chartWidth}
                y={chartHeight + padding.top + 15}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400 text-xs"
                fontSize={10}
              >
                {val}
              </text>
            ))}

            {/* Y-axis label */}
            <text
              x={padding.left - 5}
              y={padding.top + 5}
              textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400"
              fontSize={9}
            >
              {maxPieces.toLocaleString()}
            </text>
            <text
              x={padding.left - 5}
              y={chartHeight + padding.top}
              textAnchor="end"
              className="fill-gray-500 dark:fill-gray-400"
              fontSize={9}
            >
              0
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
