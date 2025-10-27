"use client"

import React, { useState } from "react"
import Image from "next/image"
import { supabase } from "@/utils/supabase/client"
import { InventoryRecord, SortableKey } from "./helper"

interface Props {
  title: string
  records: InventoryRecord[]
  activeHeaders: { key: SortableKey; label: string }[]
  excludeColour?: boolean
  sortConfig: { key: SortableKey | null; direction: "asc" | "desc" }
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: SortableKey | null; direction: "asc" | "desc" }>
  >
  imagePath: (item: InventoryRecord) => string
}

export default function InventoryTable({
  title,
  records,
  activeHeaders,
  excludeColour,
  sortConfig,
  setSortConfig,
  imagePath,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [minifigParts, setMinifigParts] = useState<Record<string, InventoryRecord[]>>({})

  if (!records.length) return null

  // 👇 Exclude "ColourName" column automatically for Minifigure tables
  const headers = title.includes("Mini")
    ? activeHeaders.filter(({ key }) => key !== "ColourName")
    : activeHeaders


  const toggleExpanded = async (itemNo: string) => {
    setExpanded((prev) => ({ ...prev, [itemNo]: !prev[itemNo] }))

    if (!minifigParts[itemNo]) {
      try {
        const { data, error } = await supabase.rpc("get_minifigure_inventory", {
          minifig_number: itemNo,
        })
        if (error) throw error
        setMinifigParts((prev) => ({
          ...prev,
          [itemNo]: (data as InventoryRecord[]) ?? [],
        }))
      } catch (err: any) {
        console.error("❌ Error fetching minifig parts:", err?.message || err)
      }
    }
  }

  return (
    <>
      <h2
        className={`inline-block text-2xl px-3 py-1 ${
          title.includes("Mini")
            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
            : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
        } rounded-md font-semibold mb-4`}
      >
        {title}
      </h2>

      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full table-fixed border-collapse bg-white dark:bg-gray-800 shadow text-base">
          <thead>
            <tr>
              {headers.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() =>
                    setSortConfig((p) => ({
                      key,
                      direction:
                        p.key === key && p.direction === "asc" ? "desc" : "asc",
                    }))
                  }
                  className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-3 text-left cursor-pointer font-medium break-words text-wrap"
                  style={{ width: `${100 / headers.length}%`, whiteSpace: "normal" }}
                >
                  {label}
                  {sortConfig.key === key
                    ? sortConfig.direction === "asc"
                      ? " ↑"
                      : " ↓"
                    : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {records.map((item, i) => {
              const isExpanded = expanded[item.ItemNumber]

              return (
                <React.Fragment key={`${title}-${item.ItemNumber}-${item.ColourID}`}>
                  <tr
                    className={
                      i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""
                    }
                  >
                    {headers.map(({ key }) => (
                      <td
                        key={key}
                        className="p-3 border-b border-gray-200 dark:border-gray-700 align-top text-gray-900 dark:text-gray-100"
                      >
                        {key === "ItemNumber" ? (
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center justify-center max-h-[50px] max-w-[70px]">
                              <Image
                                src={imagePath(item)}
                                alt={item.ItemNumber}
                                height={50}
                                width={0}
                                className="h-[50px] w-auto object-contain"
                                unoptimized
                                onError={(e) =>
                                  ((e.target as HTMLImageElement).style.display = "none")
                                }
                              />
                            </div>
                            <span className="ml-auto text-right font-sans">
                              {item.ItemNumber}
                            </span>
                          </div>
                        ) : key === "Name" ? (
                          <div className="flex flex-col">
                            <span className="font-sans">{item.Name}</span>
                            {title.includes("Mini") && (
                              <button
                                onClick={() => toggleExpanded(item.ItemNumber)}
                                className={`mt-2 w-full py-1.5 text-sm font-semibold rounded-md border transition-all duration-200
                                  ${
                                    isExpanded
                                      ? "bg-white text-blue-700 border-blue-700 hover:bg-blue-50 dark:bg-white dark:text-blue-700 dark:border-blue-700 dark:hover:bg-blue-200"
                                      : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                  }`}
                              >
                                {isExpanded ? "Hide Parts" : "Expand Parts"}
                              </button>
                            )}
                          </div>
                        ) : (
                          item[key] ?? ""
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* 🧱 Expanded Minifig Parts */}
                  {isExpanded && minifigParts[item.ItemNumber] && (
                    <tr className="bg-gray-50 dark:bg-gray-900/30">
                      <td colSpan={headers.length} className="p-0">
                        <div className="border border-gray-100 dark:border-gray-800 rounded-md overflow-hidden mt-2 mb-2">
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed border-collapse bg-white dark:bg-gray-800 text-base">
                              <thead>
                                <tr>
                                  {activeHeaders.map(({ key, label }) => (
                                    <th
                                      key={key}
                                      className="p-3 text-left bg-blue-100 dark:bg-blue-900/40 font-medium break-words text-wrap"
                                      style={{ width: `${100 / activeHeaders.length}%`, whiteSpace: "normal" }}
                                    >
                                      {label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {minifigParts[item.ItemNumber].map((part, j) => {
                                  const soldTotal = parseFloat(part.SoldTotalQuantity ?? "0") || 0
                                  const stockTotal = parseFloat(part.StockTotalQuantity ?? "0") || 0
                                  const soldUnit = parseFloat(part.SoldUnitQuantity ?? "0") || 0
                                  const stockUnit = parseFloat(part.StockUnitQuantity ?? "0") || 0
                                  const price = parseFloat(part.SoldAvgPrice ?? "0") || 0
                                  const quantity = part.Quantity || 0
                                  const staple = stockTotal ? soldTotal / stockTotal : 0
                                  const hotness = stockUnit ? soldUnit / stockUnit : 0
                                  const valueMultiply = staple * hotness
                                  const pieceTimeValue = price * valueMultiply
                                  const totalValue = quantity * pieceTimeValue

                                  return (
                                    <tr
                                      key={`${item.ItemNumber}-part-${j}`}
                                      className={
                                        j % 2 === 0
                                          ? "bg-gray-50 dark:bg-gray-900/40"
                                          : ""
                                      }
                                    >
                                      {activeHeaders.map(({ key }) => {
                                        switch (key) {
                                          case "ItemNumber":
                                            return (
                                              <td key={key} className="p-3">
                                                <div className="flex items-center justify-between w-full gap-2">
                                                  <div className="flex items-center justify-center max-h-[45px] max-w-[70px]">
                                                    <Image
                                                      src={`https://img.bricklink.com/ItemImage/PN/${part.ColourID}/${part.ItemNumber}.png`}
                                                      alt={part.ItemNumber}
                                                      height={45}
                                                      width={0}
                                                      className="h-[45px] w-auto object-contain"
                                                      unoptimized
                                                      onError={(e) =>
                                                        ((e.target as HTMLImageElement).style.display =
                                                          "none")
                                                      }
                                                    />
                                                  </div>
                                                  <span className="ml-auto text-right font-sans">
                                                    {part.ItemNumber}
                                                  </span>
                                                </div>
                                              </td>
                                            )
                                          case "Staple":
                                            return <td key={key} className="p-3">{staple.toFixed(4)}</td>
                                          case "Hotness":
                                            return <td key={key} className="p-3">{hotness.toFixed(4)}</td>
                                          case "ValueMultiply":
                                            return <td key={key} className="p-3">{valueMultiply.toFixed(4)}</td>
                                          case "PieceTimeValue":
                                            return (
                                              <td key={key} className="p-3">
                                                {pieceTimeValue
                                                  ? `$${pieceTimeValue.toFixed(4)}`
                                                  : "—"}
                                              </td>
                                            )
                                          case "TotalValue":
                                            return (
                                              <td key={key} className="p-3">
                                                {totalValue
                                                  ? `$${totalValue.toFixed(2)}`
                                                  : "—"}
                                              </td>
                                            )
                                          default:
                                            return (
                                              <td
                                                key={key}
                                                className="p-3 align-top text-gray-900 dark:text-gray-100 break-words text-wrap"
                                                style={{ whiteSpace: "normal" }}
                                              >
                                                {part[key] ?? "—"}
                                              </td>
                                            )
                                        }
                                      })}
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
