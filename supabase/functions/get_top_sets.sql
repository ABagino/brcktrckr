-- Table to store pre-calculated set valuations
-- This table is refreshed periodically (daily/weekly) to avoid expensive real-time calculations
CREATE TABLE IF NOT EXISTS public.top_sets_cache (
  set_number TEXT PRIMARY KEY,
  set_name TEXT,
  theme_name TEXT,
  year_released BIGINT,
  number_of_pieces BIGINT,
  number_of_minifigures BIGINT,
  sum_part_total DOUBLE PRECISION,
  sum_minifigure_total_individual DOUBLE PRECISION,
  sum_minifigure_total_parts DOUBLE PRECISION,
  total_value DOUBLE PRECISION,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_week INTEGER -- Week number for tracking refreshes
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_top_sets_total_value ON public.top_sets_cache(total_value DESC);
CREATE INDEX IF NOT EXISTS idx_top_sets_minifigs ON public.top_sets_cache(number_of_minifigures DESC);
CREATE INDEX IF NOT EXISTS idx_top_sets_pieces ON public.top_sets_cache(number_of_pieces DESC);
CREATE INDEX IF NOT EXISTS idx_top_sets_year ON public.top_sets_cache(year_released DESC);
CREATE INDEX IF NOT EXISTS idx_top_sets_updated ON public.top_sets_cache(last_updated DESC);

-- Function to refresh/calculate all set valuations
-- This should be run periodically (daily or weekly via cron/scheduled job)
CREATE OR REPLACE FUNCTION refresh_top_sets_cache()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  affected_rows INTEGER;
  current_week INTEGER;
BEGIN
  -- Get current ISO week number
  current_week := EXTRACT(WEEK FROM NOW());
  
  -- Truncate and repopulate the cache table
  TRUNCATE public.top_sets_cache;
  
  INSERT INTO public.top_sets_cache (
    set_number,
    set_name,
    theme_name,
    year_released,
    number_of_pieces,
    number_of_minifigures,
    sum_part_total,
    sum_minifigure_total_individual,
    sum_minifigure_total_parts,
    total_value,
    last_updated,
    calculation_week
  )
  WITH set_parts AS (
    -- Calculate total value of all parts in each set (excluding minifigs)
    SELECT 
      si."setNumber",
      SUM(
        COALESCE(pg.sold_qty_avg_price, pg.stock_qty_avg_price, 0) * si.quantity
      ) as parts_value
    FROM "set-Inventory" si
    LEFT JOIN "partsGuide" pg ON (
      pg.item = si.item_no 
      AND pg.colour_id::text = si.colour_id
      AND pg.condition = 'N'
      AND pg.currency = 'USD'
    )
    WHERE si.item_type = 'PART'
      AND si.is_alternate = false
    GROUP BY si."setNumber"
  ),
  set_minifigs AS (
    -- Count minifigures and calculate their value as complete items
    SELECT 
      si."setNumber",
      COUNT(DISTINCT si.item_no) as minifig_count,
      SUM(
        COALESCE(mpg.sold_qty_avg_price, mpg.stock_qty_avg_price, 0) * si.quantity
      ) as minifig_individual_value
    FROM "set-Inventory" si
    LEFT JOIN "minifigPriceGuide" mpg ON (
      mpg.item = si.item_no
      AND mpg.condition = 'N'
      AND mpg.currency = 'USD'
    )
    WHERE si.item_type = 'MINIFIG'
      AND si.is_alternate = false
    GROUP BY si."setNumber"
  ),
  set_minifig_parts AS (
    -- Calculate value of minifigures based on their component parts
    SELECT 
      si."setNumber",
      SUM(
        COALESCE(pg.sold_qty_avg_price, pg.stock_qty_avg_price, 0) 
        * mi.quantity 
        * si.quantity
      ) as minifig_parts_value
    FROM "set-Inventory" si
    INNER JOIN "minifig-Inventory" mi ON mi."minifigNumber" = si.item_no
    LEFT JOIN "partsGuide" pg ON (
      pg.item = mi.item_no
      AND pg.colour_id = mi.colour_id
      AND pg.condition = 'N'
      AND pg.currency = 'USD'
    )
    WHERE si.item_type = 'MINIFIG'
      AND si.is_alternate = false
      AND mi.is_alternate = false
    GROUP BY si."setNumber"
  )
  SELECT 
    sd.set_num,
    sd.name,
    COALESCE(td."themeName", 'Unknown'),
    sd.year,
    sd.num_parts,
    COALESCE(sm.minifig_count, 0),
    COALESCE(sp.parts_value, 0),
    COALESCE(sm.minifig_individual_value, 0),
    COALESCE(smp.minifig_parts_value, 0),
    (
      COALESCE(sp.parts_value, 0) + 
      COALESCE(sm.minifig_individual_value, 0)
    ),
    NOW(),
    current_week
  FROM "setDirectory" sd
  LEFT JOIN "themeDirectory" td ON td."themeID" = sd.theme_id
  LEFT JOIN set_parts sp ON sp."setNumber" = sd.set_num
  LEFT JOIN set_minifigs sm ON sm."setNumber" = sd.set_num
  LEFT JOIN set_minifig_parts smp ON smp."setNumber" = sd.set_num
  WHERE sd.year IS NOT NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the refresh
  INSERT INTO api_logs (context, status, message)
  VALUES (
    'refresh_top_sets_cache',
    'success',
    'Refreshed ' || affected_rows || ' sets for week ' || current_week
  );
  
  RETURN 'Successfully refreshed ' || affected_rows || ' sets for week ' || current_week;
END;
$$;

-- Simple function to get top N sets from the pre-calculated cache
CREATE OR REPLACE FUNCTION get_top_sets(
  limit_count INTEGER DEFAULT 100,
  order_by_column TEXT DEFAULT 'total_value',
  order_direction TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
  set_number TEXT,
  set_name TEXT,
  theme_name TEXT,
  year_released BIGINT,
  number_of_pieces BIGINT,
  number_of_minifigures BIGINT,
  sum_part_total DOUBLE PRECISION,
  sum_minifigure_total_individual DOUBLE PRECISION,
  sum_minifigure_total_parts DOUBLE PRECISION,
  total_value DOUBLE PRECISION,
  last_updated TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tsc.set_number,
    tsc.set_name,
    tsc.theme_name,
    tsc.year_released,
    tsc.number_of_pieces,
    tsc.number_of_minifigures,
    tsc.sum_part_total,
    tsc.sum_minifigure_total_individual,
    tsc.sum_minifigure_total_parts,
    tsc.total_value,
    tsc.last_updated
  FROM top_sets_cache tsc
  ORDER BY 
    CASE 
      WHEN order_by_column = 'total_value' AND order_direction = 'DESC' THEN tsc.total_value
    END DESC,
    CASE 
      WHEN order_by_column = 'total_value' AND order_direction = 'ASC' THEN tsc.total_value
    END ASC,
    CASE 
      WHEN order_by_column = 'number_of_pieces' AND order_direction = 'DESC' THEN tsc.number_of_pieces::double precision
    END DESC,
    CASE 
      WHEN order_by_column = 'number_of_pieces' AND order_direction = 'ASC' THEN tsc.number_of_pieces::double precision
    END ASC,
    CASE 
      WHEN order_by_column = 'number_of_minifigures' AND order_direction = 'DESC' THEN tsc.number_of_minifigures::double precision
    END DESC,
    CASE 
      WHEN order_by_column = 'number_of_minifigures' AND order_direction = 'ASC' THEN tsc.number_of_minifigures::double precision
    END ASC,
    CASE 
      WHEN order_by_column = 'year_released' AND order_direction = 'DESC' THEN tsc.year_released::double precision
    END DESC,
    CASE 
      WHEN order_by_column = 'year_released' AND order_direction = 'ASC' THEN tsc.year_released::double precision
    END ASC
  LIMIT limit_count;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.top_sets_cache TO authenticated, anon;
GRANT EXECUTE ON FUNCTION refresh_top_sets_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_sets TO authenticated, anon;

-- Example usage:
-- Manual refresh: SELECT refresh_top_sets_cache();
-- Query top sets: SELECT * FROM get_top_sets(100, 'total_value', 'DESC');
-- Check last update: SELECT DISTINCT last_updated, calculation_week FROM top_sets_cache;
