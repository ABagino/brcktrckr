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
  Staple?: string | null
  Hotness?: string | null
  ValueMultiply?: string | null
  PieceTimeValue?: string | null
  TotalValue?: string | null
  ItemType: string
}

export type SortableKey = keyof InventoryRecord

export const columnWidths: Partial<Record<SortableKey, string>> = {
  ItemNumber: "10%",
  Name: "18%",
  Quantity: "6%",
  SoldAvgPrice: "7%",
  SoldTotalQuantity: "7%",
  SoldUnitQuantity: "7%",
  StockAvgPrice: "7%",
  StockTotalQuantity: "7%",
  StockUnitQuantity: "7%",
  Staple: "6%",
  Hotness: "6%",
  ValueMultiply: "6%",
  PieceTimeValue: "6%",
  TotalValue: "6%",
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

export function enrichInventory(items: InventoryRecord[]): InventoryRecord[] {
  return items.map((item) => {
    const soldTotal = parseFloat(item.SoldTotalQuantity ?? "0") || 0
    const stockTotal = parseFloat(item.StockTotalQuantity ?? "0") || 0
    const soldUnit = parseFloat(item.SoldUnitQuantity ?? "0") || 0
    const stockUnit = parseFloat(item.StockUnitQuantity ?? "0") || 0
    const price = parseFloat(item.SoldAvgPrice ?? "0") || 0
    const quantity = item.Quantity || 0

    // Progressive discount: high-volume sellers (200+) get up to 25% off denominator
    const volumeDiscount = 0.25 * Math.min(soldTotal / 200, 1)
    const staple = stockTotal ? soldTotal / (stockTotal * (1 - volumeDiscount)) : 0
    const hotness = stockUnit ? soldUnit / stockUnit : 0

    const pieceTimeValueRaw = Math.min(Math.max(staple, hotness), 5)
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
}
