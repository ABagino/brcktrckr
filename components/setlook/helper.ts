export interface SetRecord {
  SetNumber: string
  SetName: string
  ThemeName: string
}

export interface InventoryRecord {
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
  BulkDemand?: string | null
  StoreMagnetism?: string | null
  GeneralSellability?: string | null
  ValueMultiply?: string | null
  PieceTimeValue?: string | null
  TotalValue?: string | null
  ItemType: string
}

export type SortableKey = keyof InventoryRecord

export const columnWidths: Partial<Record<SortableKey, string>> = {
  ItemNumber: "10%",
  Name: "16%",
  Quantity: "5%",
  SoldAvgPrice: "6%",
  SoldTotalQuantity: "6%",
  SoldUnitQuantity: "6%",
  StockAvgPrice: "6%",
  StockTotalQuantity: "6%",
  StockUnitQuantity: "6%",
  BulkDemand: "5%",
  StoreMagnetism: "5%",
  GeneralSellability: "5%",
  ValueMultiply: "5%",
  PieceTimeValue: "5%",
  TotalValue: "5%",
}

export const columnWidthsSmall: Partial<Record<SortableKey, string>> = {
  ItemNumber: "12%",
  Name: "22%",
  Quantity: "8%",
  SoldAvgPrice: "12%",
  ValueMultiply: "12%",
  PieceTimeValue: "12%",
  TotalValue: "12%",
  ColourName: "10%",
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Round a number to 3 decimal places */
function round3(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** Safe divide to avoid division by zero */
function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  return denominator === 0 ? fallback : numerator / denominator
}

/**
 * Bulk Demand: "Do buyers commonly buy large real-world quantities of this part across a deep, proven market?"
 *
 * Much more aggressive scoring — most parts should score well below 1.
 * Only genuinely strong builder/bulk parts should exceed 1.
 * Elite bulk parts can still reach 4–5.
 *
 * Range: 0–5
 */
export function calculateBulkDemand(soldUnitQty: number, soldTotalQty: number): number {
  // BulkVolumeScore: rewards high sold unit volume (stricter threshold)
  const bulkVolumeScore = clamp(Math.log(1 + soldUnitQty) / Math.log(1 + 3000), 0, 1)

  // BulkProofScore: rewards many sold lots (stricter threshold for proven market depth)
  const bulkProofScore = clamp(Math.log(1 + soldTotalQty) / Math.log(1 + 50000), 0, 1)

  // BasketScore: rewards high units per lot
  const unitsPerLot = safeDivide(soldUnitQty, Math.max(soldTotalQty, 1))
  const basketScore = clamp(unitsPerLot / 0.10, 0, 1)

  // Final Bulk Demand: aggressive exponents compress scores heavily
  const bulkDemand =
    5 *
    Math.pow(bulkVolumeScore, 1.6) *
    Math.pow(bulkProofScore, 1.8) *
    (0.80 + 0.20 * basketScore)

  return round3(clamp(bulkDemand, 0, 5))
}

/**
 * Store Magnetism: "Does this part seem understocked relative to demand?"
 * High when demand is proven but stock is low — stocking it could attract buyers.
 * Range: 0–5
 */
export function calculateStoreMagnetism(soldTotalQty: number, stockTotalQty: number): number {
  const demandDepth = Math.log(1 + soldTotalQty) / Math.log(1 + 1000)
  const shortageRatio = safeDivide(soldTotalQty, Math.max(stockTotalQty, 1))
  const magnetism = 5 * Math.pow(Math.min(demandDepth, 1), 0.8) * Math.pow(Math.min(shortageRatio / 2, 1), 0.7)
  return parseFloat(clamp(magnetism, 0, 5).toFixed(3))
}

/**
 * General Sellability: "Does this part reliably sell in general?"
 *
 * Much more aggressive scoring — most parts should score well below 1.
 * Only strong, widely used parts should exceed 1.
 * Elite parts can reach 3–5.
 *
 * Range: 0–5
 */
export function calculateGeneralSellability(soldTotalQty: number, stockTotalQty: number): number {
  // SellDepth: rewards deep sales history (stricter threshold)
  const sellDepth = clamp(Math.log(1 + soldTotalQty) / Math.log(1 + 20000), 0, 1)

  // SellBalance: rewards healthy sell-through ratio
  const sellBalance = clamp(safeDivide(soldTotalQty, Math.max(stockTotalQty, 1)), 0, 1)

  // Final Sellability: aggressive exponents compress scores heavily
  const sellability = 5 * Math.pow(sellDepth, 2.2) * Math.pow(sellBalance, 1.5)

  return round3(clamp(sellability, 0, 5))
}

export function enrichInventory(items: InventoryRecord[]): InventoryRecord[] {
  return items.map((item) => {
    const soldTotal = parseFloat(item.SoldTotalQuantity ?? "0") || 0
    const stockTotal = parseFloat(item.StockTotalQuantity ?? "0") || 0
    const soldUnit = parseFloat(item.SoldUnitQuantity ?? "0") || 0
    const price = parseFloat(item.SoldAvgPrice ?? "0") || 0
    const quantity = item.Quantity || 0

    const bulkDemand = calculateBulkDemand(soldUnit, soldTotal)
    const storeMagnetism = calculateStoreMagnetism(soldTotal, stockTotal)
    const generalSellability = calculateGeneralSellability(soldTotal, stockTotal)

    const pieceTimeValueRaw = Math.min(Math.max(generalSellability, bulkDemand, storeMagnetism), 5)
    const pieceTimeValue = price * pieceTimeValueRaw
    const totalValue = quantity * pieceTimeValue

    return {
      ...item,
      BulkDemand: bulkDemand.toFixed(3),
      StoreMagnetism: storeMagnetism.toFixed(3),
      GeneralSellability: generalSellability.toFixed(3),
      ValueMultiply: pieceTimeValueRaw.toFixed(3),
      PieceTimeValue: pieceTimeValue.toFixed(3),
      TotalValue: totalValue.toFixed(3),
    }
  })
}
