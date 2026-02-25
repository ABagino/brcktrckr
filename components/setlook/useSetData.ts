"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import { SetRecord, InventoryRecord, enrichInventory } from "./helper"

export function useSetData(searchValue: string) {
  const [matchedSet, setMatchedSet] = useState<SetRecord | null>(null)
  const [parsedInventory, setParsedInventory] = useState<InventoryRecord[]>([])
  const [isNotFound, setIsNotFound] = useState(false)
  const [totals, setTotals] = useState({ total: 0, parts: 0, minifigs: 0 })
  const [counts, setCounts] = useState({ parts: 0, minifigs: 0, partsPieces: 0, minifigPieces: 0 })

  useEffect(() => {
    if (!searchValue) return
    let cancelled = false

    const loadData = async () => {
      // 🧹 Reset state before loading
      setIsNotFound(false)
      setMatchedSet(null)
      setParsedInventory([])
      setTotals({ total: 0, parts: 0, minifigs: 0 })
      setCounts({ parts: 0, minifigs: 0, partsPieces: 0, minifigPieces: 0 })

      try {
        // 1️⃣ Fetch Set
        const { data: setData, error: setError } = await supabase.rpc("get_set", {
          search_number: searchValue,
        })
        if (cancelled) return
        if (setError || !setData?.length) {
          setIsNotFound(true)
          return
        }

        const foundSet = setData[0] as SetRecord
        setMatchedSet(foundSet)

        // 2️⃣ Fetch Inventory
        const { data: invData, error: invError } = await supabase.rpc("get_inventory", {
          set_number: foundSet.SetNumber,
        })
        if (cancelled) return
        if (invError || !invData?.length) {
          setIsNotFound(true)
          return
        }

        // 3️⃣ Enrich base inventory
        let enriched: InventoryRecord[] = invData as InventoryRecord[]

        // 4️⃣ Fetch latest minifigure prices
        // 4️⃣ Fetch latest minifigure prices
        const minifigItems = enriched
          .filter((i) => i.ItemType === "MINIFIG")
          .map((i) => i.ItemNumber)

        if (minifigItems.length > 0) {
          const { data: latestData, error: priceError } = await supabase.rpc(
            "get_latest_minifig_prices",
            { item_list: minifigItems }
          )

          if (!cancelled && !priceError && latestData?.length) {
            type PriceRecord = {
              item: string
              sold_avg_price?: number | null
              sold_total_quantity?: number | null
              sold_unit_quantity?: number | null
              stock_avg_price?: number | null
              stock_total_quantity?: number | null
              stock_unit_quantity?: number | null
            }

            const priceMap: Record<string, PriceRecord> = {}
            for (const rec of latestData) priceMap[rec.item] = rec

            // Merge updated price data into minifigs
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
          }
        }

        // ✅ Always run this next section for both parts and minifigs
        enriched = enrichInventory(enriched)

        // 5️⃣ Compute totals + counts
        const parts = enriched
          .filter((i) => i.ItemType === "PART")
          .reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)

        // 🧮 For minifigs: use max(minifig value, sum of its parts)
        const minifigRecords = enriched.filter((i) => i.ItemType === "MINIFIG")
        let minifigs = 0
        let minifigPiecesSum = 0

        for (const minifig of minifigRecords) {
          const minifigValue = parseFloat(minifig.TotalValue ?? "0")
          const minifigQty = Number(minifig.Quantity ?? 1)
          
          // Fetch parts for this minifigure
          const { data: partsData } = await supabase.rpc("get_minifigure_inventory", {
            minifig_number: minifig.ItemNumber,
          })
          
          let partsSum = 0
          if (partsData && partsData.length > 0) {
            const enrichedParts = enrichInventory(partsData as InventoryRecord[])
            partsSum = enrichedParts.reduce(
              (sum, part) => sum + parseFloat(part.TotalValue ?? "0"),
              0
            )
            
            // Calculate total pieces in this minifigure's breakdown
            const piecesInMinifig = enrichedParts.reduce(
              (sum, part) => sum + Number(part.Quantity ?? 0),
              0
            )
            // Multiply by the quantity of this minifigure
            minifigPiecesSum += piecesInMinifig * minifigQty
          }
          
          // Use the higher value
          minifigs += Math.max(minifigValue, partsSum)
        }

        const total = parts + minifigs

        const partsRecords = enriched.filter((i) => i.ItemType === "PART")
        const partsPiecesSum = partsRecords.reduce(
          (sum, part) => sum + Number(part.Quantity ?? 0),
          0
        )

        setParsedInventory(enriched)
        setTotals({ total, parts, minifigs })
        setCounts({
          parts: partsRecords.length,
          minifigs: minifigRecords.length,
          partsPieces: partsPiecesSum,
          minifigPieces: minifigPiecesSum,
        })
      } catch (err: unknown) {
        // ✅ Properly typed error handling
        if (err instanceof Error) {
          console.error("❌ Error loading set:", err.message)
        } else {
          console.error("❌ Unknown error loading set:", err)
        }
        if (!cancelled) setIsNotFound(true)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [searchValue])

  return { matchedSet, parsedInventory, totals, counts, isNotFound }
}
