// app/api/ai/generer-exercices/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appellerEli } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";
import { PROMPT_GENERER_EXERCICES } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!profil || !["admin", "moderateur"].includes(profil.role)) {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  try {
    await verifierEtIncrementerQuota(user.id, "exercice");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  const { notion, matiere, niveau, type, count } = await request.json();
  if (!notion) return NextResponse.json({ erreur: "Notion requise" }, { status: 400 });

  const nombre = count ?? 3;
  const typeExo = type ?? "probleme";

  const prompt = `${PROMPT_GENERER_EXERCICES}\nMatiere : ${matiere ?? "non precisee"}\nNiveau : ${niveau ?? "moyen"}\nType d'exercice : ${typeExo}\n\nGenere ${nombre} exercice(s) de type "${typeExo}" sur : "${notion}"`;

  const { contenu } = await appellerEli(prompt, {
    matiere,
    niveauScolaire: niveau,
  }, 3000);

  const jsonPropre = contenu.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const jsonMatch = jsonPropre.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Pas de JSON trouvé");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ erreur: "Erreur de parsing JSON IA", brut: contenu }, { status: 500 });
  }
}
