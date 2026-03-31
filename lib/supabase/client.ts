import { createBrowserClient } from '@supabase/ssr'

// Client Supabase pour les composants navigateur
export function creerClientSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
