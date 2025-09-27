"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/utils/supabase/client"

export default function SetPage() {
  const [inputValue, setInputValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [matchedSet, setMatchedSet] = useState<any>(null)
  const [parsedInventory, setParsedInventory] = useState<any[]>([])
  const [totalValueSum, setTotalValueSum] = useState(0)
  const [setNotFound, setSetNotFound] = useState(false)
  const [inventoryMissing, setInventoryMissing] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "",
    direction: "asc",
  })

  const handleGoClick = () => setSearchValue(inputValue)
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
        // 🔹 Look up set
        const { data: setData, error: setError } = await supabase.rpc("get_set", {
          search_number: searchValue,
        })
        if (setError) throw setError
        if (!setData || setData.length === 0) return setSetNotFound(true)

        const foundSet = setData[0]
        setMatchedSet(foundSet)

        // 🔹 Look up inventory
        const { data: inventory, error: invError } = await supabase.rpc("get_inventory", {
          set_number: foundSet.SetNumber,
        })
        if (invError) throw invError
        if (!inventory || inventory.length === 0) return setInventoryMissing(true)

        // 🔹 Enrich rows
        const enriched = inventory.map((item) => {
          const soldTotal = parseFloat(item.SoldTotalQuantity) || 0
          const stockTotal = parseFloat(item.StockTotalQuantity) || 0
          const soldUnit = parseFloat(item.SoldUnitQuantity) || 0
          const stockUnit = parseFloat(item.StockUnitQuantity) || 0
          const price = parseFloat(item.SoldAvgPrice) || 0
          const quantity = parseFloat(item.Quantity) || 0
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
        setTotalValueSum(enriched.reduce((sum, i) => sum + parseFloat(i.TotalValue), 0))
      } catch (err) {
        console.error(err)
        setSetNotFound(true)
      }
    }
    loadData()
  }, [searchValue])

  const sortedInventory = useMemo(() => {
    if (!sortConfig.key) return parsedInventory
    return [...parsedInventory].sort((a, b) => {
      const { key, direction } = sortConfig
      const cmp = ["ItemNumber", "Name", "ColourName"].includes(key)
        ? String(a[key] || "").localeCompare(String(b[key] || ""))
        : (parseFloat(a[key]) || 0) - (parseFloat(b[key]) || 0)
      return direction === "asc" ? cmp : -cmp
    })
  }, [parsedInventory, sortConfig])

  const handleSort = (key: string) =>
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))

  const renderSortArrow = (key: string) =>
    sortConfig.key === key ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""

  return (
    <div className="font-sans p-5 min-h-screen max-w-[95%] mx-auto bg-gray-100">
      {/* Search Bar */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Enter Set Number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="p-2.5 border border-gray-300 rounded mr-2 w-52 outline-none"
        />
        <button
          onClick={handleGoClick}
          className="px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Go
        </button>
      </div>

      {/* Error */}
      {setNotFound && (
        <p className="text-red-600 mb-4">Set &apos;{searchValue}&apos; not found.</p>
      )}

      {/* Info Box */}
      {matchedSet && !setNotFound && (
        <div className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white shadow mb-5">
          <div>
            <p className="my-1">
              <strong>Set Number:</strong> {matchedSet.SetNumber}
            </p>
            <p className="my-1">
              <strong>Set Name:</strong> {matchedSet.SetName}
            </p>
            <p className="my-1">
              <strong>Theme:</strong> {matchedSet.Theme}
            </p>
          </div>
          <div className="text-2xl font-bold text-right">
            Total Value: ${totalValueSum.toFixed(2)}
          </div>
        </div>
      )}

      {/* Inventory Missing */}
      {inventoryMissing && matchedSet && (
        <p className="mt-4">No inventory found; queued for update.</p>
      )}

      {/* Table */}
      {parsedInventory.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse bg-white shadow">
            <thead>
              <tr>
                {[
                  "ItemNumber",
                  "Name",
                  "ColourName",
                  "Quantity",
                  "SoldAvgPrice",
                  "SoldTotalQuantity",
                  "SoldUnitQuantity",
                  "StockAvgPrice",
                  "StockTotalQuantity",
                  "StockUnitQuantity",
                  "Staple",
                  "Hotness",
                  "ValueMultiply",
                  "PieceTimeValue",
                  "TotalValue",
                ].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="sticky top-0 bg-gray-800 text-white p-3 text-left cursor-pointer"
                  >
                    {col}
                    {renderSortArrow(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedInventory.map((item, i) => (
                <tr
                  key={`${item.ItemNumber}-${item.ColourID}`}
                  className={i % 2 === 0 ? "bg-gray-50" : ""}
                >
                  <td className="p-3 border-b border-gray-200 align-middle">
                    <div className="flex items-center gap-2">
                      <img
                        loading="lazy"
                        src={`https://img.bricklink.com/ItemImage/PN/${item.ColourID}/${item.ItemNumber}.png`}
                        alt={item.ItemNumber}
                        width={32}
                        height={32}
                        onError={(e) => e.currentTarget.remove()}
                        className="align-middle"
                      />
                      <span>{item.ItemNumber}</span>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.Name}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.ColourName}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.Quantity}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.SoldAvgPrice}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.SoldTotalQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.SoldUnitQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.StockAvgPrice}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.StockTotalQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.StockUnitQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.Staple}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.Hotness}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.ValueMultiply}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.PieceTimeValue}
                  </td>
                  <td className="p-3 border-b border-gray-200 align-middle">
                    {item.TotalValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
