import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client Supabase pour les Server Components et Route Handlers
export async function creerClientServeur() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore — cookies lecture seule dans les Server Components
          }
        },
      },
    }
  )
}
