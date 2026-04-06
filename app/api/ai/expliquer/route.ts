// app/api/ai/expliquer/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { appellerEliStream } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";

const schemaExpliquer = z.object({
  notion: z.string().min(1).max(500),
  matiere: z.string().optional(),
  chapitre: z.string().optional(),
  niveauScolaire: z.string().optional(),
  niveauDifficulte: z.enum(["facile", "moyen", "difficile", "expert"]).optional(),
});

export async function POST(request: NextRequest) {
  // 1. Vérifier l'authentification
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  // 2. Valider le body
  const body = await request.json();
  const parse = schemaExpliquer.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  // 3. Vérifier et incrémenter le quota
  try {
    await verifierEtIncrementerQuota(user.id, "explication");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  // 4. Appeler Eli en streaming
  const stream = await appellerEliStream(
    `Explique-moi cette notion : ${parse.data.notion}`,
    {
      niveauScolaire: parse.data.niveauScolaire,
      matiere: parse.data.matiere,
      chapitre: parse.data.chapitre,
      niveauDifficulte: parse.data.niveauDifficulte,
    }
  );

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
