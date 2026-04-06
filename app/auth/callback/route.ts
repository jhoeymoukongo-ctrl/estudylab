import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // OAuth error from Supabase/provider
  if (error) {
    console.error("[auth/callback] OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/connexion?erreur=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code) {
    console.error("[auth/callback] No code in callback URL");
    return NextResponse.redirect(`${origin}/connexion?erreur=no_code`);
  }

  const supabase = await creerClientServeur();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[auth/callback] exchangeCodeForSession error:", exchangeError.message);
    return NextResponse.redirect(`${origin}/connexion?erreur=callback`);
  }

  // Check if user has completed onboarding (has niveau_scolaire set)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profil } = await supabase
      .from("user_profiles")
      .select("niveau_scolaire")
      .eq("user_id", user.id)
      .single();

    // Existing user with completed profile → dashboard
    if (profil?.niveau_scolaire) {
      return NextResponse.redirect(`${origin}/tableau-de-bord`);
    }
  }

  // New user or incomplete profile → onboarding
  return NextResponse.redirect(`${origin}/onboarding`);
}
