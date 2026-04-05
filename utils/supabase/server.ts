import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client for use in Server Components and Route Handlers
// This client runs on the server where environment variables are available directly
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
