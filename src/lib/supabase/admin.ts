import { createClient } from '@supabase/supabase-js'

// Only use server-side, never expose to client
// Returns a new client each call — env vars are available at runtime (not build time)
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Convenience alias
export { getSupabaseAdmin as supabaseAdmin }
