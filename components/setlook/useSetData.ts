"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import { SetRecord, InventoryRecord } from "./helper"

export function useSetData(searchValue: string) {
  const [matchedSet, setMatchedSet] = useState<SetRecord | null>(null)
  const [parsedInventory, setParsedInventory] = useState<InventoryRecord[]>([])
  const [isNotFound, setIsNotFound] = useState(false)
  const [totals, setTotals] = useState({ total: 0, parts: 0, minifigs: 0 })
  const [counts, setCounts] = useState({ parts: 0, minifigs: 0 })

  useEffect(() => {
    if (!searchValue) return
    let cancelled = false

    const loadData = async () => {
      // 🧹 Reset state before loading
      setIsNotFound(false)
      setMatchedSet(null)
      setParsedInventory([])
      setTotals({ total: 0, parts: 0, minifigs: 0 })
      setCounts({ parts: 0, minifigs: 0 })

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
        enriched = enriched.map((item) => {
          const soldTotal = parseFloat(item.SoldTotalQuantity ?? "0") || 0
          const stockTotal = parseFloat(item.StockTotalQuantity ?? "0") || 0
          const soldUnit = parseFloat(item.SoldUnitQuantity ?? "0") || 0
          const stockUnit = parseFloat(item.StockUnitQuantity ?? "0") || 0
          const price = parseFloat(item.SoldAvgPrice ?? "0") || 0
          const quantity = item.Quantity || 0

          const staple = stockTotal ? soldTotal / stockTotal : 0
          const hotness = stockUnit ? soldUnit / stockUnit : 0

          // 🔹 Apply both type-specific and global caps (10 max)
          const typeCap = item.ItemType === "MINIFIG" ? 9 : 20
          const pieceTimeValueRaw = Math.min(staple * hotness, typeCap, 10)
          const pieceTimeValue = price * pieceTimeValueRaw
          const totalValue = quantity * pieceTimeValue

          return {
            ...item,
            Staple: staple.toFixed(3),
            Hotness: hotness.toFixed(3),
            ValueMultiply: pieceTimeValueRaw.toFixed(3),
            PieceTimeValue: pieceTimeValue.toFixed(3),
            TotalValue: totalValue.toFixed(3),
          }
        })




        // 5️⃣ Compute totals + counts
        const total = enriched.reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)
        const parts = enriched
          .filter((i) => i.ItemType === "PART")
          .reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)
        const minifigs = enriched
          .filter((i) => i.ItemType === "MINIFIG")
          .reduce((s, i) => s + parseFloat(i.TotalValue ?? "0"), 0)

        setParsedInventory(enriched)
        setTotals({ total, parts, minifigs })
        setCounts({
          parts: enriched.filter((i) => i.ItemType === "PART").length,
          minifigs: enriched.filter((i) => i.ItemType === "MINIFIG").length,
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
