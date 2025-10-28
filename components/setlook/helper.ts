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

// export const enrichInventory = (items: InventoryRecord[]) => {
//   return items.map((item) => {
//     const soldTotal = parseFloat(item.SoldTotalQuantity ?? "0") || 0
//     const stockTotal = parseFloat(item.StockTotalQuantity ?? "0") || 0
//     const soldUnit = parseFloat(item.SoldUnitQuantity ?? "0") || 0
//     const stockUnit = parseFloat(item.StockUnitQuantity ?? "0") || 0
//     const price = parseFloat(item.SoldAvgPrice ?? "0") || 0
//     const quantity = item.Quantity || 0
//     const staple = stockTotal ? soldTotal / stockTotal : 0
//     const hotness = stockUnit ? soldUnit / stockUnit : 0
//     const pieceTimeValue = price * staple * hotness
//     const totalValue = quantity * pieceTimeValue

//     return {
//       ...item,
//       Staple: staple.toFixed(3),
//       Hotness: hotness.toFixed(3),
//       ValueMultiply: (staple * hotness).toFixed(4),
//       PieceTimeValue: pieceTimeValue.toFixed(4),
//       TotalValue: totalValue.toFixed(4),
//     }
//   })
// }
