// app/api/ai/plan-revision/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appellerEliStream } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";
import { PROMPT_PLAN_REVISION } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  try {
    await verifierEtIncrementerQuota(user.id, "plan");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  const { matiere, niveau, objectif, duree_jours } = await request.json();
  if (!matiere || !niveau) {
    return NextResponse.json({ erreur: "La matière et le niveau sont requis" }, { status: 400 });
  }

  const duree = duree_jours && Number(duree_jours) > 0 ? Number(duree_jours) : 14;

  const stream = await appellerEliStream(
    `${PROMPT_PLAN_REVISION}\nDurée du plan : ${duree} jours\n\nMatière : ${matiere}\nNiveau : ${niveau}\nObjectif : ${objectif ?? "Révisions générales"}`,
    { matiere, niveauScolaire: niveau }
  );

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
