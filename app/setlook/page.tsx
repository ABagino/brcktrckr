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
  { key: "TotalValue", label: "Total Value" }
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
  const [partCount, setPartCount] = useState(0)
  const [minifigCount, setMinifigCount] = useState(0)
  const [setNotFound, setSetNotFound] = useState(false)
  const [inventoryMissing, setInventoryMissing] = useState(false)
  const [sortConfigMinifig, setSortConfigMinifig] = useState<{
  key: SortableKey | null
  direction: "asc" | "desc"
}>({
  key: null,
  direction: "asc",
})

const [sortConfigParts, setSortConfigParts] = useState<{
  key: SortableKey | null
  direction: "asc" | "desc"
}>({
  key: null,
  direction: "asc",
})

  const [viewMode, setViewMode] = useState<"basic" | "advanced">("advanced")

  const handleGoClick = () => {
    let query = inputValue.trim()
    if (!query.endsWith("-1")) {
      query = query + "-1"
    }
    setSearchValue(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleGoClick()
  }

  useEffect(() => {
    if (!searchValue) return
    setMatchedSet(null)
    setParsedInventory([])
    setTotalValueSum(0)
    setSetNotFound(false)
    setInventoryMissing(false)

    const loadData = async () => {
      try {
        const { data: setData, error: setError } = await supabase.rpc("get_set", {
          search_number: searchValue,
        })
        console.log("get_set response:", { setData, setError })
        
        if (setError) {
          // console.error("Supabase get_set error:", setError)
          console.error("Error details:", JSON.stringify(setError, null, 2))
          throw setError
        }

        if (!setData || setData.length === 0) {
          console.log("No set data found for:", searchValue)
          setSetNotFound(true)
          return
        }
        const foundSet = setData[0] as SetRecord
        console.log("Found set:", foundSet)
        setMatchedSet(foundSet)

        const { data: inventory, error: invError } = await supabase.rpc(
          "get_inventory",
          { set_number: foundSet.SetNumber }
        )
        console.log("get_inventory response:", { inventory, invError })
        
        if (invError) {
          console.error("Supabase get_inventory error:", invError)
          console.error("Error details:", JSON.stringify(invError, null, 2))
          throw invError
        }
        if (!inventory || inventory.length === 0) {
          setInventoryMissing(true)
          return
        }

        const enriched: InventoryRecord[] = (inventory as InventoryRecord[]).map(
          (item) => {
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
          }
        )

        setParsedInventory(enriched)
        setTotalValueSum(
          enriched.reduce((sum, i) => sum + parseFloat(i.TotalValue ?? "0"), 0)
        )
        // Count total parts and minifigs

        const totalParts = enriched
          .filter((i) => i.ItemType === "PART")
          .reduce((sum, i) => sum + (i.Quantity ?? 0), 0)

        const totalMinifigs = enriched
          .filter((i) => i.ItemType === "MINIFIG")
          .reduce((sum, i) => sum + (i.Quantity ?? 0), 0)

        setPartCount(totalParts)
        setMinifigCount(totalMinifigs)

      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error caught:", err);
          console.error("Error type:", typeof err);
          console.error("Error keys:", Object.keys(err));
          console.error("Error stringified:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        } else {
          console.error("Unknown error:", err);
        }

        setSetNotFound(true);
      }
    }
    loadData()
  }, [searchValue])

  const sortedMinifigs = useMemo(() => {
    const filtered = parsedInventory.filter((item) => item.ItemType === "MINIFIG")
    const { key, direction } = sortConfigMinifig
    if (!key) return filtered
    return [...filtered].sort((a, b) => {
      const cmp =
        key === "ItemNumber" || key === "Name" || key === "ColourName"
          ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""))
          : (parseFloat(a[key] as string) || 0) - (parseFloat(b[key] as string) || 0)
      return direction === "asc" ? cmp : -cmp
    })
  }, [parsedInventory, sortConfigMinifig])

  const sortedParts = useMemo(() => {
    const filtered = parsedInventory.filter((item) => item.ItemType !== "MINIFIG")
    const { key, direction } = sortConfigParts
    if (!key) return filtered
    return [...filtered].sort((a, b) => {
      const cmp =
        key === "ItemNumber" || key === "Name" || key === "ColourName"
          ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""))
          : (parseFloat(a[key] as string) || 0) - (parseFloat(b[key] as string) || 0)
      return direction === "asc" ? cmp : -cmp
    })
  }, [parsedInventory, sortConfigParts])


  const handleSortMinifig = (key: SortableKey) =>
    setSortConfigMinifig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))

  const handleSortParts = (key: SortableKey) =>
    setSortConfigParts((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))

  const renderSortArrowMinifig = (key: SortableKey) =>
    sortConfigMinifig.key === key
      ? sortConfigMinifig.direction === "asc"
        ? " ↑"
        : " ↓"
      : ""

const renderSortArrowParts = (key: SortableKey) =>
  sortConfigParts.key === key
    ? sortConfigParts.direction === "asc"
      ? " ↑"
      : " ↓"
    : ""


  const activeHeaders = viewMode === "basic" ? basicHeaders : headers

return (
  <div className="font-sans p-5 min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    {/* Search + Toggle + Menu row */}
    <div className="mb-5 flex items-center justify-between gap-4">
      {/* Left: Search */}
      <div>
        <input
          type="text"
          placeholder="Enter Set Number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="p-2.5 border border-gray-300 dark:border-gray-600 rounded mr-2 w-52 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleGoClick}
          className="px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Go
        </button>
      </div>

      {/* Right side: Segmented toggle + menu */}
      <div className="flex items-center gap-3">
        {/* Segmented button */}
        <div className="inline-flex rounded-md shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => setViewMode("basic")}
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === "basic"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setViewMode("advanced")}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 ${
              viewMode === "advanced"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Hamburger NavMenu */}
        <NavMenu />
      </div>
    </div>

      {setNotFound && (
        <div className="text-red-600 dark:text-red-400 mb-6 space-y-3">
          <p className="font-semibold">
            Set &apos;{searchValue}&apos; not found!
          </p>

          <div className="space-y-2">
            <p>Some potential reasons for this:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                The set&apos;s inventory is toooo new, and BrickLink has not confirmed an
                inventory for it yet -- just have to wait!
              </li>
              <li>
                The set is prior to 2024; the current version of BrckTrcker only has
                memory for 2024 sets -- but we&apos;re working on expanding this!
              </li>
              <li>
                Something went wrong! This interaction has been logged, so if this set
                number keeps appearing, we will take a look!
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              If you think there&apos;s an error here, please feel free to give us a heads up via our{" "}
              <a
                href="/contact"
                className="inline-block ml-1 px-3 py-1 text-sm font-semibold border border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-md hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-black transition-colors duration-200"
              >
              CONTACT PAGE
              </a>
            </p>
          </div>
        </div>
      )}


      {matchedSet && !setNotFound && (
        <div className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow mb-5">
          {/* Left column: Set info */}
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

          {/* Right column: Totals */}
          <div className="text-right space-y-1">
            <div className="text-2xl font-bold">
              Total Value: ${totalValueSum.toFixed(2)}
            </div>

            <div className="flex items-center justify-end gap-2 text-sm text-gray-700 dark:text-gray-300">
              {/* Parts badge */}
              <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-medium">
                Parts: {partCount}
              </div>

              {/* Minifigs badge */}
              <div className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-medium">
                Minifigures: {minifigCount}
              </div>
            </div>
          </div>
        </div>
      )}


      {inventoryMissing && matchedSet && (
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          No inventory found; queued for update.
        </p>
      )}

{/* --- 🧍‍♂️ Minifigures Table (only if > 0) --- */}
{minifigCount > 0 && (
  <div>
    <h2 className="inline-block text-2xl px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-md font-semibold shadow-sm mb-4">
      Minifigures
    </h2>
    <div className="w-full overflow-x-auto">
      {/** Prepare filtered headers for minifigs **/}
      {(() => {
        const minifigHeaders = activeHeaders.filter(
          ({ key }) => key !== "ColourName" // completely remove Colour Name
        )

        return (
          <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow">
            <thead>
              <tr>
                {minifigHeaders.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSortMinifig(key)}
                    className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-3 text-left cursor-pointer"
                  >
                    {label}
                    {renderSortArrowMinifig(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedMinifigs.map((item, i) => (
                <tr
                  key={`minifig-${item.ItemNumber}-${item.ColourID}`}
                  className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""}
                >
                  {minifigHeaders.map(({ key }) => (
                    <td
                      key={key}
                      className="p-3 border-b border-gray-200 dark:border-gray-700 align-middle"
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
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                              }}
                            />
                          </div>
                          <span className="ml-auto text-right">{item.ItemNumber}</span>
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
        )
      })()}
    </div>
    {/* 👇 Divider line before the next table */}
     <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
  </div>
)}



    {/* --- 🧱 Parts & Others Table --- */}
    <div>
      <h2 className="inline-block text-2xl px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-md font-semibold shadow-sm mb-4">
        Parts
      </h2>
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow">
          <thead>
            <tr>
              {activeHeaders.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSortParts(key)}
                  className="sticky top-0 bg-gray-800 dark:bg-gray-700 text-white p-3 text-left cursor-pointer"
                >
                  {label}
                  {renderSortArrowParts(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedParts.map((item, i) => (
              <tr
                key={`part-${item.ItemNumber}-${item.ColourID}`}
                className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/40" : ""}
              >
                {activeHeaders.map(({ key }) => (
                  <td
                    key={key}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 align-middle"
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
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                            }}
                          />
                        </div>
                        <span className="ml-auto text-right">{item.ItemNumber}</span>
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
    </div>
  </div>
)}
//     </div>
//   )
// }