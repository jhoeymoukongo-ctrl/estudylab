import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(requete: NextRequest) {
  let reponse = NextResponse.next({ request: requete })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return requete.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => requete.cookies.set(name, value))
          reponse = NextResponse.next({ request: requete })
          cookiesToSet.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = requete.nextUrl.pathname

  // Routes protegees : dashboard
  const estDashboard = [
    '/tableau-de-bord', '/matieres', '/quiz', '/fiches',
    '/assistant-ia', '/scan', '/progression', '/profil',
  ].some((route) => pathname.startsWith(route))

  const estAdmin = pathname.startsWith('/admin')

  // Redirect vers connexion si non authentifie
  if ((estDashboard || estAdmin) && !user) {
    const url = requete.nextUrl.clone()
    url.pathname = '/connexion'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Verification role admin
  if (estAdmin && user) {
    const { data: profil } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profil || !['admin', 'moderateur'].includes(profil.role)) {
      return NextResponse.redirect(new URL('/tableau-de-bord', requete.url))
    }
  }

  // Redirect / vers dashboard si connecte
  if (pathname === '/' && user) {
    return NextResponse.redirect(new URL('/tableau-de-bord', requete.url))
  }

  // Redirect pages auth vers dashboard si deja connecte
  const estAuth = ['/connexion', '/inscription'].some((r) => pathname.startsWith(r))
  if (estAuth && user) {
    return NextResponse.redirect(new URL('/tableau-de-bord', requete.url))
  }

  // Verification onboarding pour les routes protegees
  if (estDashboard && user && !pathname.startsWith('/onboarding')) {
    const { data: profil } = await supabase
      .from('user_profiles')
      .select('niveau_scolaire')
      .eq('user_id', user.id)
      .single()

    if (profil && !profil.niveau_scolaire) {
      return NextResponse.redirect(new URL('/onboarding', requete.url))
    }
  }

  return reponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\..*).*)'],
}
