import { supabase } from './client';

export interface TopSet {
  set_number: string;
  set_name: string;
  theme_name: string;
  year_released: number;
  number_of_pieces: number;
  number_of_minifigures: number;
  sum_part_total: number;
  sum_minifigure_total_individual: number;
  sum_minifigure_total_parts: number;
  total_value: number;
  last_updated: string; // ISO timestamp
}

export type OrderByColumn = 
  | 'total_value' 
  | 'number_of_pieces' 
  | 'number_of_minifigures' 
  | 'year_released';

/**
 * Get top sets from pre-calculated cache
 * Fast query - reads from materialized table
 */
export async function getTopSets(
  limitCount: number = 100,
  orderByColumn: OrderByColumn = 'total_value',
  orderDirection: 'ASC' | 'DESC' = 'DESC'
): Promise<TopSet[]> {
  const { data, error } = await supabase.rpc('get_top_sets', {
    limit_count: limitCount,
    order_by_column: orderByColumn,
    order_direction: orderDirection
  });

  if (error) {
    console.error('Error fetching top sets:', error);
    throw error;
  }

  return data as TopSet[];
}

/**
 * Manually trigger a refresh of the top sets cache
 * This recalculates all set valuations - expensive operation
 * Should typically be run on a schedule (daily/weekly)
 */
export async function refreshTopSetsCache(): Promise<string> {
  const { data, error } = await supabase.rpc('refresh_top_sets_cache');

  if (error) {
    console.error('Error refreshing top sets cache:', error);
    throw error;
  }

  return data as string;
}

/**
 * Get the last update timestamp from the cache
 */
export async function getTopSetsCacheStatus(): Promise<{
  last_updated: string;
  calculation_week: number;
} | null> {
  const { data, error } = await supabase
    .from('top_sets_cache')
    .select('last_updated, calculation_week')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching cache status:', error);
    return null;
  }

  return data;
}
