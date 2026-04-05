import {
  getSetValueRowsServer,
  getSetValueThemesServer,
} from "@/utils/supabase/setValueMvServer"
import SetRankClient from "./SetRankClient"

// Cache this page for 60 seconds - reduces serverless function costs
// After 60s, next visitor triggers a background refresh
export const revalidate = 60

const currentYear = new Date().getFullYear()
const MIN_LEGO_YEAR = 2024

// Server component - fetches initial data on the server
export default async function SetValuePage() {
  // Fetch both data sets in parallel on the server
  const [initialRows, initialThemes] = await Promise.all([
    getSetValueRowsServer({
      mode: "most_pieces",
      startYear: MIN_LEGO_YEAR,
      endYear: currentYear,
      themeNames: [],
    }),
    getSetValueThemesServer(),
  ])

  return <SetRankClient initialRows={initialRows} initialThemes={initialThemes} />
}