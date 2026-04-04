"use client"

import { useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { InventoryRecord } from "./helper"

// Types
type QuadrantRole = "Goldmine" | "Magnet" | "Staple" | "Dead Stock"

interface ChartDataPoint {
  itemNumber: string
  name: string
  colorName: string
  generalSellability: number
  storeMagnetism: number
  bulkDemand: number
  totalValue: number
  role: QuadrantRole
  z: number
}

interface PartQuadrantMapProps {
  inventory: InventoryRecord[]
}

// Role logic
function getQuadrantRole(sellability: number, magnetism: number): QuadrantRole {
  if (sellability >= 2.5 && magnetism >= 2.5) return "Goldmine"
  if (sellability < 2.5 && magnetism >= 2.5) return "Magnet"
  if (sellability >= 2.5 && magnetism < 2.5) return "Staple"
  return "Dead Stock"
}

// Color mapping
const ROLE_COLORS: Record<QuadrantRole, string> = {
  Goldmine: "#22c55e",
  Magnet: "#a855f7",
  Staple: "#3b82f6",
  "Dead Stock": "#9ca3af",
}

// Custom tooltip component
interface CustomTooltipPayload {
  itemNumber: string
  name: string
  colorName: string
  generalSellability: number
  storeMagnetism: number
  bulkDemand: number
  totalValue: number
  role: QuadrantRole
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CustomTooltipPayload }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm max-w-xs">
      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {data.name}
      </div>
      <div className="text-gray-500 dark:text-gray-400 text-xs mb-2">
        {data.colorName} • #{data.itemNumber}
      </div>
      <div className="space-y-1 text-gray-700 dark:text-gray-300">
        <div className="flex justify-between gap-4">
          <span>Sellability:</span>
          <span className="font-medium">{data.generalSellability.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Magnetism:</span>
          <span className="font-medium">{data.storeMagnetism.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Bulk Demand:</span>
          <span className="font-medium">{data.bulkDemand.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Total Value:</span>
          <span className="font-medium">${data.totalValue.toFixed(2)}</span>
        </div>
      </div>
      <div
        className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 font-semibold"
        style={{ color: ROLE_COLORS[data.role] }}
      >
        {data.role}
      </div>
    </div>
  )
}

export default function PartQuadrantMap({ inventory }: PartQuadrantMapProps) {
  // Transform and filter data
  const chartData = useMemo(() => {
    return inventory
      .filter((item) => item.ItemType !== "MINIFIG")
      .map((item): ChartDataPoint => {
        const generalSellability = parseFloat(item.GeneralSellability ?? "0") || 0
        const storeMagnetism = parseFloat(item.StoreMagnetism ?? "0") || 0
        const bulkDemand = parseFloat(item.BulkDemand ?? "0") || 0
        const totalValue = parseFloat(item.TotalValue ?? "0") || 0

        return {
          itemNumber: item.ItemNumber,
          name: item.Name ?? "",
          colorName: item.ColourName ?? "",
          generalSellability,
          storeMagnetism,
          bulkDemand,
          totalValue,
          role: getQuadrantRole(generalSellability, storeMagnetism),
          z: 40 + bulkDemand * 60,
        }
      })
      .filter((point) => point.totalValue > 0.1)
  }, [inventory])

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Part Opportunity Map
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          X = Sellability, Y = Magnetism, Bubble size = Bulk Demand
        </p>
      </div>

      <div className="h-[400px] md:h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            <XAxis
              type="number"
              dataKey="generalSellability"
              name="Sellability"
              domain={[0, 5]}
              tickCount={6}
              label={{
                value: "General Sellability",
                position: "bottom",
                offset: 20,
                style: { fill: "#6b7280", fontSize: 12 },
              }}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />
            
            <YAxis
              type="number"
              dataKey="storeMagnetism"
              name="Magnetism"
              domain={[0, 5]}
              tickCount={6}
              label={{
                value: "Store Magnetism",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fill: "#6b7280", fontSize: 12, textAnchor: "middle" },
              }}
              tick={{ fill: "#6b7280", fontSize: 11 }}
            />

            {/* Quadrant reference lines */}
            <ReferenceLine x={2.5} stroke="#9ca3af" strokeDasharray="5 5" />
            <ReferenceLine y={2.5} stroke="#9ca3af" strokeDasharray="5 5" />

            <ZAxis
              type="number"
              dataKey="z"
              range={[40, 400]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              data={chartData}
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={ROLE_COLORS[entry.role]}
                  fillOpacity={0.7}
                  stroke={ROLE_COLORS[entry.role]}
                  strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        {(Object.keys(ROLE_COLORS) as QuadrantRole[]).map((role) => (
          <div key={role} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: ROLE_COLORS[role] }}
            />
            <span className="text-gray-600 dark:text-gray-400">{role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
