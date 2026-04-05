"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/utils/supabase/client"
import { InventoryRecord, SortableKey, columnWidths, columnWidthsSmall, enrichInventory } from "./helper"

interface Props {
  title: string
  records: InventoryRecord[]
  activeHeaders: { key: SortableKey; label: string }[]
  sortConfig: { key: SortableKey | null; direction: "asc" | "desc" }
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: SortableKey | null; direction: "asc" | "desc" }>
  >
  imagePath: (item: InventoryRecord) => string
  viewMode: "basic" | "advanced"
}

export default function InventoryTable({
  title,
  records,
  activeHeaders,
  sortConfig,
  setSortConfig,
  imagePath,
  viewMode,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [minifigParts, setMinifigParts] = useState<Record<string, InventoryRecord[]>>({})
  const [minifigTotals, setMinifigTotals] = useState<Record<string, number>>({})
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const headers = title.includes("Mini")
    ? activeHeaders.filter(({ key }) => key !== "ColourName")
    : activeHeaders

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    if (!records || records.length === 0) return

    const fetchMinifigTotals = async () => {
      const minifigs = records.filter((r) => r.ItemType === "MINIFIG")

      // only fetch those not already cached
      const toFetch = minifigs
        .map((m) => m.ItemNumber)
        .filter((num) => !minifigTotals[num])

      if (toFetch.length === 0) return

      try {
        // run RPCs in parallel and avoid failing everything if one fails
        const settled = await Promise.allSettled(
          toFetch.map((num) =>
            supabase.rpc("get_minifigure_inventory", { minifig_number: num })
          )
        )

        const partsMap: Record<string, InventoryRecord[]> = {}
        const totalsMap: Record<string, number> = {}

        for (let idx = 0; idx < toFetch.length; idx++) {
          const itemNo = toFetch[idx]
          const result = settled[idx]

          if (result.status === "rejected") {
            console.error(`⚠️ Batch fetch failed for ${itemNo}:`, result.reason)
            continue
          }

          const { data, error } = result.value as {
            data: InventoryRecord[] | null
            error: unknown
          }
          if (error) {
            console.error(`⚠️ RPC error for ${itemNo}:`, error)
            continue
          }

          let parts = (data as InventoryRecord[]) ?? []

          // compute metrics using shared helper
          parts = enrichInventory(parts)

          const totalValueSum = parts.reduce(
            (sum, part) => sum + (parseFloat(part.TotalValue ?? "0") || 0),
            0
          )

          partsMap[itemNo] = parts
          totalsMap[itemNo] = totalValueSum
        }

        // single state updates to avoid repeated re-renders
        setMinifigParts((prev) => ({ ...prev, ...partsMap }))
        setMinifigTotals((prev) => ({ ...prev, ...totalsMap }))
      } catch (err) {
        console.error("⚠️ Error batch fetching minifig totals:", err)
      }
    }

    fetchMinifigTotals()
  }, [records, minifigTotals])

  const toggleExpanded = async (itemNo: string) => {
    setExpanded((prev) => ({ ...prev, [itemNo]: !prev[itemNo] }))

    if (minifigParts[itemNo]) return // already preloaded

    try {
      const { data, error } = await supabase.rpc("get_minifigure_inventory", {
        minifig_number: itemNo,
      })
      if (error) throw error
      setMinifigParts((prev) => ({
        ...prev,
        [itemNo]: enrichInventory((data as InventoryRecord[]) ?? []),
      }))
    } catch (err) {
      console.error("❌ Error fetching minifig parts on expand:", err)
    }
  }

  return (
    <>
      <h2
        className={`inline-block text-2xl px-3 py-1 ${title.includes("Mini")
          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300"
          : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
          } rounded-md font-semibold mb-4`}
      >
        {title}
      </h2>

      <div className="w-full overflow-x-auto mb-6">
        <table className={`w-full border-collapse bg-white dark:bg-gray-800 shadow text-base ${viewMode === "advanced" ? "min-w-[1200px]" : "min-w-[800px]"}`}>
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
                  className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-2 md:p-3 text-left cursor-pointer font-medium break-words text-wrap text-xs md:text-base"
                  style={{
                    width: (isSmallScreen && viewMode === "basic" ? columnWidthsSmall[key] : columnWidths[key]) || `${100 / headers.length}%`,
                    whiteSpace: "normal",
                  }}
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
                  <tr className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""}>
                    {headers.map(({ key }) => {
                      switch (key) {
                        case "ItemNumber":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle">
                              <div
                                className={`flex items-center ${isSmallScreen ? "justify-center" : "justify-between"} w-full gap-1 md:gap-2 ${!isSmallScreen && item.ItemNumber.length > 7 ? "flex-col text-center" : "flex-row"
                                  }`}
                              >
                                <div className="flex items-center justify-center max-h-[35px] md:max-h-[50px] max-w-[50px] md:max-w-[70px] mx-auto">
                                  <Image
                                    src={imagePath(item)}
                                    alt={item.ItemNumber}
                                    width={70}
                                    height={50}
                                    className="object-contain"
                                    style={{ height: 'auto', width: 'auto', maxHeight: '35px', maxWidth: '50px' }}
                                    loading="lazy"
                                    decoding="async"
                                    unoptimized
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                    }}
                                  />
                                </div>
                                {!isSmallScreen && (
                                  <span
                                    className={`font-sans text-xs md:text-base ${item.ItemNumber.length > 7 ? "text-center mt-1" : "ml-auto text-right"
                                      }`}
                                  >
                                    {item.ItemNumber}
                                  </span>
                                )}
                              </div>
                            </td>
                          )

                        case "Name":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle">
                              <div className="flex flex-col">
                                <span className="font-sans text-xs md:text-base">{item.Name}</span>
                                {isSmallScreen && (
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    #{item.ItemNumber}
                                  </span>
                                )}
                                {title.includes("Mini") && (
                                  <button
                                    onClick={() => toggleExpanded(item.ItemNumber)}
                                    className={`mt-1 md:mt-2 self-start inline-flex items-center justify-center px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-semibold rounded-md border transition-all duration-200
                  ${expanded[item.ItemNumber]
                                        ? "bg-white text-blue-700 border-blue-700 hover:bg-blue-50 dark:bg-white dark:text-blue-700 dark:border-blue-700 dark:hover:bg-blue-200"
                                        : "bg-blue-200 text-black border-blue-600 hover:bg-blue-400 dark:bg-blue-400 dark:hover:bg-blue-200"
                                      }`}
                                  >
                                    {minifigTotals[item.ItemNumber] !== undefined ? (
                                      <span className="hidden md:inline">{`${expanded[item.ItemNumber] ? "Hide Parts" : "Expand Parts"}: $${minifigTotals[
                                        item.ItemNumber
                                      ].toFixed(2)}`}</span>
                                    ) : (
                                      <span className="inline-flex items-center">
                                        <span className="hidden md:inline">{expanded[item.ItemNumber] ? "Hide Parts:" : "Expand Parts:"}</span>
                                        <span className="md:hidden">{expanded[item.ItemNumber] ? "Hide" : "Expand"}</span>
                                        <svg
                                          className="animate-spin ml-1 md:ml-2 h-3 md:h-4 w-3 md:w-4 text-blue-700"
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
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                          ></path>
                                        </svg>
                                      </span>
                                    )}
                                    {minifigTotals[item.ItemNumber] !== undefined && (
                                      <span className="md:hidden">${minifigTotals[item.ItemNumber].toFixed(2)}</span>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          )

                        case "BulkDemand":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle text-xs md:text-base">
                              {item.BulkDemand ?? "—"}
                            </td>
                          )

                        case "StoreMagnetism":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle text-xs md:text-base">
                              {item.StoreMagnetism ?? "—"}
                            </td>
                          )
                        case "GeneralSellability":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle text-xs md:text-base">
                              {item.GeneralSellability ?? "—"}
                            </td>
                          )
                        case "SoldAvgPrice":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle text-gray-900 dark:text-gray-100 break-words text-wrap text-xs md:text-base" style={{ whiteSpace: "normal" }}>
                              {item.SoldAvgPrice ? `${(parseFloat(item.SoldAvgPrice) || 0).toFixed(2)}` : "—"}
                            </td>
                          )

                        case "StockAvgPrice":
                          return (
                            <td key={key} className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle text-gray-900 dark:text-gray-100 break-words text-wrap text-xs md:text-base" style={{ whiteSpace: "normal" }}>
                              {item.StockAvgPrice ? `${(parseFloat(item.StockAvgPrice) || 0).toFixed(2)}` : "—"}
                            </td>
                          )

                        default:
                          return (
                            <td
                              key={key}
                              className="p-1.5 md:p-3 border-b border-gray-200 dark:border-gray-700 align-middle text-gray-900 dark:text-gray-100 break-words text-wrap text-xs md:text-base"
                              style={{ whiteSpace: "normal" }}
                            >
                              {item[key] ?? "—"}
                            </td>
                          )
                      }
                    })}
                  </tr>
                  {/* 🧱 Expanded Minifig Parts */}
                  {isExpanded && minifigParts[item.ItemNumber] && (
                    <tr className="bg-gray-50 dark:bg-gray-900/30">
                      <td colSpan={headers.length} className="p-0">
                        <div className="border-2 border-blue-300 dark:border-blue-600 rounded-md overflow-hidden mt-2 mb-2 shadow-sm transition-all duration-200">
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed border-collapse bg-white dark:bg-gray-800 text-base">
                              <thead>
                                <tr>
                                  {activeHeaders.map(({ key, label }) => (
                                    <th
                                      key={key}
                                      className="p-1.5 md:p-3 text-left bg-blue-100 dark:bg-blue-900/40 font-medium break-words text-wrap text-xs md:text-base"
                                      style={{
                                        width:
                                          (isSmallScreen && viewMode === "basic" ? columnWidthsSmall[key] : columnWidths[key]) ||
                                          `${100 / activeHeaders.length}%`,
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      {label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {minifigParts[item.ItemNumber]
                                  .sort((a, b) => {
                                    const valA = parseFloat(a.PieceTimeValue ?? "0") || 0
                                    const valB = parseFloat(b.PieceTimeValue ?? "0") || 0
                                    return valB - valA // Sort descending (highest first)
                                  })
                                  .map((part, j) => (
                                  <tr
                                    key={`${item.ItemNumber}-part-${j}`}
                                    className={j % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""}
                                  >
                                    {activeHeaders.map(({ key }) => {
                                      switch (key) {
                                        case "ItemNumber":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3">
                                              <div
                                                className={`flex items-center ${isSmallScreen ? "justify-center" : "justify-between"} w-full gap-1 md:gap-2 ${!isSmallScreen && part.ItemNumber.length > 7 ? "flex-col text-center" : "flex-row"
                                                  }`}
                                              >
                                                <div className="flex items-center justify-center max-h-[30px] md:max-h-[45px] max-w-[45px] md:max-w-[70px] mx-auto">
                                                  <Image
                                                    src={`https://img.bricklink.com/ItemImage/PN/${part.ColourID}/${part.ItemNumber}.png`}
                                                    alt={part.ItemNumber}
                                                    width={70}
                                                    height={45}
                                                    className="object-contain"
                                                    style={{ height: 'auto', width: 'auto', maxHeight: '30px', maxWidth: '45px' }}
                                                    loading="lazy"
                                                    decoding="async"
                                                    unoptimized
                                                    onError={(e) => {
                                                      e.currentTarget.style.display = "none"
                                                    }}
                                                  />
                                                </div>
                                                {!isSmallScreen && (
                                                  <span
                                                    className={`font-sans text-xs md:text-base ${part.ItemNumber.length > 7
                                                      ? "text-center mt-1"
                                                      : "ml-auto text-right"
                                                      }`}
                                                  >
                                                    {part.ItemNumber}
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                          )
                                        case "ValueMultiply":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3 text-xs md:text-base">
                                              {part.ValueMultiply ?? "—"}
                                            </td>
                                          )
                                        case "PieceTimeValue":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3 text-xs md:text-base">
                                              {part.PieceTimeValue ? part.PieceTimeValue : "—"}
                                            </td>
                                          )
                                        case "TotalValue":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3 text-xs md:text-base">
                                              {part.TotalValue ? part.TotalValue : "—"}
                                            </td>
                                          )
                                        case "SoldAvgPrice":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3 align-middle text-gray-900 dark:text-gray-100 break-words text-wrap text-xs md:text-base" style={{ whiteSpace: "normal" }}>
                                              {part.SoldAvgPrice ? `${(parseFloat(part.SoldAvgPrice) || 0).toFixed(2)}` : "—"}
                                            </td>
                                          )

                                        case "StockAvgPrice":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3 align-middle text-gray-900 dark:text-gray-100 break-words text-wrap text-xs md:text-base" style={{ whiteSpace: "normal" }}>
                                              {part.StockAvgPrice ? `${(parseFloat(part.StockAvgPrice) || 0).toFixed(2)}` : "—"}
                                            </td>
                                          )

                                        case "Name":
                                          return (
                                            <td key={key} className="p-1.5 md:p-3">
                                              <div className="flex flex-col">
                                                <span className="font-sans text-xs md:text-base">{part.Name}</span>
                                                {isSmallScreen && (
                                                  <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    #{part.ItemNumber}
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                          )

                                        default:
                                          return (
                                            <td
                                              key={key}
                                              className="p-1.5 md:p-3 align-middle text-gray-900 dark:text-gray-100 break-words text-wrap text-xs md:text-base"
                                              style={{ whiteSpace: "normal" }}
                                            >
                                              {part[key] ?? "—"}
                                            </td>
                                          )
                                      }
                                    })}
                                  </tr>
                                ))}
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
