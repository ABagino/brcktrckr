"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/utils/supabase/client"
import Image from "next/image"
import NavMenu from "@/components/NavMenu"

interface SetRecord {
  SetNumber: string
  SetName: string
  ThemeName: string
}

interface InventoryRecord {
  ItemNumber: string
  Name: string
  ColourID: number
  ColourName: string
  Quantity: number
  SoldAvgPrice: string | null
  SoldTotalQuantity: string | null
  SoldUnitQuantity: string | null
  StockAvgPrice: string | null
  StockTotalQuantity: string | null
  StockUnitQuantity: string | null
  Staple?: string
  Hotness?: string
  ValueMultiply?: string
  PieceTimeValue?: string
  TotalValue?: string
  ItemType: string
}

type SortableKey = keyof InventoryRecord

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

const headers: { key: SortableKey; label: string }[] = [
  { key: "ItemNumber", label: "Item Number" },
  { key: "Name", label: "Name" },
  { key: "ColourName", label: "Colour Name" },
  { key: "Quantity", label: "Quantity" },
  { key: "SoldAvgPrice", label: "Sold Avg Price" },
  { key: "SoldTotalQuantity", label: "Sold Total Quantity" },
  { key: "SoldUnitQuantity", label: "Sold Unit Quantity" },
  { key: "StockAvgPrice", label: "Stock Avg Price" },
  { key: "StockTotalQuantity", label: "Stock Total Quantity" },
  { key: "StockUnitQuantity", label: "Stock Unit Quantity" },
  { key: "Staple", label: "Staple" },
  { key: "Hotness", label: "Hotness" },
  { key: "ValueMultiply", label: "Value Multiply" },
  { key: "PieceTimeValue", label: "Piece Time Value" },
  { key: "TotalValue", label: "Total Value" },
]

export default function SetPage() {
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [matchedSet, setMatchedSet] = useState<SetRecord | null>(null)
  const [parsedInventory, setParsedInventory] = useState<InventoryRecord[]>([])
  const [totalValueSum, setTotalValueSum] = useState(0)
  const [partValueSum, setPartValueSum] = useState(0)
  const [minifigValueSum, setMinifigValueSum] = useState(0)

  const [partCount, setPartCount] = useState(0)
  const [minifigCount, setMinifigCount] = useState(0)
  const [setNotFound, setSetNotFound] = useState(false)
  const [inventoryMissing, setInventoryMissing] = useState(false)
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("advanced")

  const [sortConfigMinifig, setSortConfigMinifig] = useState<{
    key: SortableKey | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  const [sortConfigParts, setSortConfigParts] = useState<{
    key: SortableKey | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  const handleGoClick = () => {
    let query = inputValue.trim()
    if (!query.endsWith("-1")) query = query + "-1"
    setSearchValue(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGoClick()
  }

  // 🔹 Helper to update totals
  const updateValueSums = (records: InventoryRecord[]) => {
    const totalValue = records.reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)
    const partValue = records
      .filter((i) => i.ItemType === "PART")
      .reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)
    const minifigValue = records
      .filter((i) => i.ItemType === "MINIFIG")
      .reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)

    setTotalValueSum(totalValue)
    setPartValueSum(partValue)
    setMinifigValueSum(minifigValue)
  }

  useEffect(() => {
    if (!searchValue) return
    let cancelled = false

    setSetNotFound(false)
    setMatchedSet(null)
    setParsedInventory([])
    setInventoryMissing(false)
    setTotalValueSum(0)
    setPartCount(0)
    setMinifigCount(0)

    const loadData = async () => {
      try {
        // 1️⃣ Fetch Set
        const { data: setData, error: setError } = await supabase.rpc("get_set", {
          search_number: searchValue,
        })
        if (cancelled) return
        if (setError) throw setError

        if (!setData || setData.length === 0) {
          console.warn("No set found:", searchValue)
          setSetNotFound(true)
          return
        }

        const foundSet = setData[0] as SetRecord
        setMatchedSet(foundSet)

        // 2️⃣ Fetch Inventory
        const { data: inventory, error: invError } = await supabase.rpc("get_inventory", {
          set_number: foundSet.SetNumber,
        })
        if (cancelled) return
        if (invError) throw invError

        if (!inventory || inventory.length === 0) {
          setInventoryMissing(true)
          return
        }

        // 3️⃣ Enrich
        let enriched: InventoryRecord[] = (inventory as InventoryRecord[]).map((item) => {
          const soldTotal = parseFloat(item.SoldTotalQuantity ?? "0") || 0
          const stockTotal = parseFloat(item.StockTotalQuantity ?? "0") || 0
          const soldUnit = parseFloat(item.SoldUnitQuantity ?? "0") || 0
          const stockUnit = parseFloat(item.StockUnitQuantity ?? "0") || 0
          const price = parseFloat(item.SoldAvgPrice ?? "0") || 0
          const quantity = item.Quantity || 0
          const staple = stockTotal ? soldTotal / stockTotal : 0
          const hotness = stockUnit ? soldUnit / stockUnit : 0
          const pieceTimeValue = price * staple * hotness
          const totalValue = quantity * pieceTimeValue
          return {
            ...item,
            Staple: staple.toFixed(4),
            Hotness: hotness.toFixed(4),
            ValueMultiply: (staple * hotness).toFixed(4),
            PieceTimeValue: pieceTimeValue.toFixed(4),
            TotalValue: totalValue.toFixed(4),
          }
        })

        setParsedInventory(enriched)
        setPartCount(enriched.filter((i) => i.ItemType === "PART").reduce((s, i) => s + (i.Quantity ?? 0), 0))
        setMinifigCount(enriched.filter((i) => i.ItemType === "MINIFIG").reduce((s, i) => s + (i.Quantity ?? 0), 0))
        updateValueSums(enriched) // ✅ update sums after first enrichment

        // 4️⃣ Fetch Latest Minifig Prices
        const minifigItems = enriched.filter((i) => i.ItemType === "MINIFIG").map((i) => i.ItemNumber)
        if (minifigItems.length > 0) {
          const { data: latestData, error: priceError } = await supabase.rpc(
            "get_latest_minifig_prices",
            { item_list: minifigItems }
          )
          if (cancelled) return
          if (priceError) throw priceError

          interface PriceData {
            item: string
            sold_avg_price?: number | string | null
            sold_total_quantity?: number | string | null
            sold_unit_quantity?: number | string | null
            stock_avg_price?: number | string | null
            stock_total_quantity?: number | string | null
            stock_unit_quantity?: number | string | null
          }

          const priceMap: Record<string, PriceData> = {}

          for (const rec of latestData ?? []) {
            priceMap[rec.item] = rec
          }

          // Merge updated price data for minifigs
          enriched = enriched.map((item) => {
            if (item.ItemType !== "MINIFIG") return item
            const price = priceMap[item.ItemNumber]
            if (!price) return item
            return {
              ...item,
              SoldAvgPrice: price.sold_avg_price?.toString() ?? item.SoldAvgPrice,
              SoldTotalQuantity: price.sold_total_quantity?.toString() ?? item.SoldTotalQuantity,
              SoldUnitQuantity: price.sold_unit_quantity?.toString() ?? item.SoldUnitQuantity,
              StockAvgPrice: price.stock_avg_price?.toString() ?? item.StockAvgPrice,
              StockTotalQuantity: price.stock_total_quantity?.toString() ?? item.StockTotalQuantity,
              StockUnitQuantity: price.stock_unit_quantity?.toString() ?? item.StockUnitQuantity,
            }
          })

          // 🔁 Recalculate Staple / Hotness / ValueMultiply / PieceTimeValue / TotalValue
          enriched = enriched.map((item) => {
            const soldTotal = parseFloat(item.SoldTotalQuantity ?? "0") || 0
            const stockTotal = parseFloat(item.StockTotalQuantity ?? "0") || 0
            const soldUnit = parseFloat(item.SoldUnitQuantity ?? "0") || 0
            const stockUnit = parseFloat(item.StockUnitQuantity ?? "0") || 0
            const price = parseFloat(item.SoldAvgPrice ?? "0") || 0
            const quantity = item.Quantity || 0
            const staple = stockTotal ? soldTotal / stockTotal : 0
            const hotness = stockUnit ? soldUnit / stockUnit : 0
            const cap = item.ItemType === "MINIFIG" ? 9 : 20
            const pieceTimeValueRaw = Math.min(staple * hotness, cap)
            const pieceTimeValue = price * pieceTimeValueRaw
            const totalValue = quantity * pieceTimeValue
            return {
              ...item,
              Staple: staple.toFixed(4),
              Hotness: hotness.toFixed(4),
              ValueMultiply: pieceTimeValueRaw.toFixed(4),
              PieceTimeValue: pieceTimeValue.toFixed(4),
              TotalValue: totalValue.toFixed(4),
            }
          })

          setParsedInventory(enriched)
          updateValueSums(enriched) // ✅ update sums after minifig recalculation
        }
      } catch (err) {
        if (!cancelled) {
          console.error("❌ Error loading set:", err)
          setSetNotFound(true)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [searchValue])

  // --- Sorting ---
  const sortedMinifigs = useMemo(() => {
    const filtered = parsedInventory.filter((i) => i.ItemType === "MINIFIG")
    const { key, direction } = sortConfigMinifig
    if (!key) return filtered
    return [...filtered].sort((a, b) => {
      const cmp =
        ["ItemNumber", "Name", "ColourName"].includes(key)
          ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""))
          : (parseFloat(a[key] as string) || 0) - (parseFloat(b[key] as string) || 0)
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
          : (parseFloat(a[key] as string) || 0) - (parseFloat(b[key] as string) || 0)
      return direction === "asc" ? cmp : -cmp
    })
  }, [parsedInventory, sortConfigParts])

  const activeHeaders = viewMode === "basic" ? basicHeaders : headers

  return (
    <div className="font-sans p-5 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 🔍 Search Bar */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <input
            type="text"
            placeholder="Enter Set Number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2.5 border border-gray-300 dark:border-gray-600 rounded mr-2 w-52 bg-white dark:bg-gray-800"
          />
          <button
            onClick={handleGoClick}
            className="px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Go
          </button>
        </div>

        {/* View Mode + Menu */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("basic")}
              className={`px-4 py-2 text-sm font-medium ${viewMode === "basic"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Basic
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              className={`px-4 py-2 text-sm font-medium border-l ${viewMode === "advanced"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              Advanced
            </button>
          </div>
          <NavMenu />
        </div>
      </div>

      {/* ❌ Set Not Found */}
      {setNotFound && (
        <div className="text-red-600 dark:text-red-400 mb-6 space-y-3">
          <p className="font-semibold">
            Set &apos;{searchValue}&apos; not found!
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>The set&apos;s inventory may not exist on BrickLink yet.</li>
            <li>Older sets (pre-2024) might not be loaded in BrickTrcker yet.</li>
            <li>Something went wrong while fetching data.</li>
          </ul>
        </div>
      )}

      {/* 🧾 Set Info Bar */}
      {matchedSet && !setNotFound && (
        <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow mb-5">
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

          <div className="text-right space-y-1">
            <div className="text-2xl font-bold">
              Total Value: ${totalValueSum.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-medium">
                Parts: {partCount} (${partValueSum.toFixed(2)})
              </div>
              <div className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-medium">
                Minifigs: {minifigCount} (${minifigValueSum.toFixed(2)})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👇 Inventory Tables */}
      {minifigCount > 0 && (
        <>
          <h2 className="inline-block text-2xl px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-semibold mb-4">
            Minifigures
          </h2>
          <div className="w-full overflow-x-auto mb-6">
            <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow">
              <thead>
                <tr>
                  {activeHeaders
                    .filter(({ key }) => key !== "ColourName")
                    .map(({ key, label }) => (
                      <th
                        key={key}
                        className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-3 text-left cursor-pointer"
                        onClick={() =>
                          setSortConfigMinifig((p) => ({
                            key,
                            direction:
                              p.key === key && p.direction === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                      >
                        {label}
                        {sortConfigMinifig.key === key
                          ? sortConfigMinifig.direction === "asc"
                            ? " ↑"
                            : " ↓"
                          : ""}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {sortedMinifigs.map((item, i) => (
                  <tr
                    key={`minifig-${item.ItemNumber}-${item.ColourID}`}
                    className={
                      i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""
                    }
                  >
                    {activeHeaders
                      .filter(({ key }) => key !== "ColourName")
                      .map(({ key }) => (
                        <td
                          key={key}
                          className="p-3 border-b border-gray-200 dark:border-gray-700"
                        >
                          {key === "ItemNumber" ? (
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex items-center justify-center max-h-[45px] max-w-[70px]">
                                <Image
                                  src={`https://img.bricklink.com/ItemImage/MN/0/${item.ItemNumber}.png`}
                                  alt={item.ItemNumber}
                                  height={60}
                                  width={0}
                                  className="h-[60px] w-auto object-contain"
                                  unoptimized
                                  onError={(e) =>
                                  ((e.target as HTMLImageElement).style.display =
                                    "none")
                                  }
                                />
                              </div>
                              <span className="ml-auto text-right">
                                {item.ItemNumber}
                              </span>
                            </div>
                          ) : (
                            item[key] ?? ""
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {partCount > 0 && (
        <>
          <h2 className="inline-block text-2xl px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-semibold mb-4">
            Parts
          </h2>

          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow">
              <thead>
                <tr>
                  {activeHeaders.map(({ key, label }) => (
                    <th
                      key={key}
                      className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-3 text-left cursor-pointer"
                      onClick={() =>
                        setSortConfigParts((p) => ({
                          key,
                          direction:
                            p.key === key && p.direction === "asc"
                              ? "desc"
                              : "asc",
                        }))
                      }
                    >
                      {label}
                      {sortConfigParts.key === key
                        ? sortConfigParts.direction === "asc"
                          ? " ↑"
                          : " ↓"
                        : ""}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedParts.map((item, i) => (
                  <tr
                    key={`part-${item.ItemNumber}-${item.ColourID}`}
                    className={
                      i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""
                    }
                  >
                    {activeHeaders.map(({ key }) => (
                      <td
                        key={key}
                        className="p-3 border-b border-gray-200 dark:border-gray-700"
                      >
                        {key === "ItemNumber" ? (
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center justify-center max-h-[35px] max-w-[70px]">
                              <Image
                                src={`https://img.bricklink.com/ItemImage/PN/${item.ColourID}/${item.ItemNumber}.png`}
                                alt={item.ItemNumber}
                                height={50}
                                width={0}
                                className="h-[50px] w-auto object-contain"
                                unoptimized
                                onError={(e) =>
                                ((e.target as HTMLImageElement).style.display =
                                  "none")
                                }
                              />
                            </div>
                            <span className="ml-auto text-right">
                              {item.ItemNumber}
                            </span>
                          </div>
                        ) : (
                          item[key] ?? ""
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
