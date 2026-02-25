import { supabase } from "./client"

export interface SetValueRow {
  set_num: string
  set_name: string
  year: number
  theme_id: number
  theme_name: string
  num_parts: number
  img_url: string | null
  piece_qty: number
  piece_lots: number
  minifig_count: number
  raw_part_value: number
  part_value_indexed: number
  raw_minifig_value: number
  minifig_value_indexed: number
  raw_minifig_part_value: number
  minifig_part_value_indexed: number
  total_value: number
}

export type SetValueMode =
  | "most_pieces"
  | "highest_part_value"
  | "highest_minifig_value"
  | "highest_total_value"
  | "multiplicative_effect"

export interface SetValueQueryOptions {
  mode: SetValueMode
  startYear?: number
  endYear?: number
  themeNames?: string[]
}

export interface RankedSetValueRow extends SetValueRow {
  multiplicative_effect: number
  value_per_piece: number
}

const QUERY_LIMIT = 10000

function withDerivedMetrics(row: SetValueRow): RankedSetValueRow {
  const pieceQty = Number(row.piece_qty ?? 0)
  const rawPartValue = Number(row.raw_part_value ?? 0)
  const totalValue = Number(row.total_value ?? 0)

  return {
    ...row,
    multiplicative_effect: rawPartValue > 0 ? totalValue / rawPartValue : 0,
    value_per_piece: pieceQty > 0 ? totalValue / pieceQty : 0,
  }
}

export async function getSetValueRows(
  options: SetValueQueryOptions
): Promise<RankedSetValueRow[]> {
  const { mode, startYear, endYear, themeNames } = options

  const baseColumns = [
    "set_num",
    "set_name",
    "year",
    "theme_id",
    "theme_name",
    "num_parts",
    "img_url",
    "piece_qty",
    "piece_lots",
    "minifig_count",
    "raw_part_value",
    "part_value_indexed",
    "raw_minifig_value",
    "minifig_value_indexed",
    "raw_minifig_part_value",
    "minifig_part_value_indexed",
    "total_value",
  ].join(",")

  let query = supabase.from("set_value_mv").select(baseColumns)

  if (startYear !== undefined) {
    query = query.gte("year", startYear)
  }

  if (endYear !== undefined) {
    query = query.lte("year", endYear)
  }

  if (themeNames && themeNames.length > 0) {
    query = query.in("theme_name", themeNames)
  }

  if (mode === "most_pieces") {
    query = query.order("piece_qty", { ascending: false }).limit(QUERY_LIMIT)
  } else if (mode === "highest_part_value") {
    query = query.order("part_value_indexed", { ascending: false }).limit(QUERY_LIMIT)
  } else if (mode === "highest_minifig_value") {
    query = query.order("minifig_value_indexed", { ascending: false }).limit(QUERY_LIMIT)
  } else if (mode === "highest_total_value") {
    query = query.order("total_value", { ascending: false }).limit(QUERY_LIMIT)
  } else if (mode === "multiplicative_effect") {
    query = query.limit(QUERY_LIMIT)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error querying set_value_mv:", error)
    throw error
  }

  const rows = (data ?? []) as unknown as SetValueRow[]
  const rowsWithMetrics = rows.map(withDerivedMetrics)

  if (mode === "multiplicative_effect") {
    return rowsWithMetrics
      .filter((row) => row.raw_part_value > 0)
      .sort((a, b) => b.multiplicative_effect - a.multiplicative_effect)
  }

  return rowsWithMetrics
}

export async function getSetValueThemes(): Promise<string[]> {
  const pageSize = 1000
  let from = 0
  const allThemeNames: string[] = []

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from("set_value_mv")
      .select("theme_name")
      .order("theme_name", { ascending: true })
      .range(from, to)

    if (error) {
      console.error("Error loading themes from set_value_mv:", error)
      throw error
    }

    const page = (data ?? []) as Array<{ theme_name: string | null }>
    allThemeNames.push(...page.map((row) => row.theme_name ?? "").filter(Boolean))

    if (page.length < pageSize) {
      break
    }

    from += pageSize
  }

  return Array.from(new Set(allThemeNames)).sort((left, right) => left.localeCompare(right))
}