// app/api/ai/generer-quiz/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { appellerEli } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";

const schemaQuiz = z.object({
  notion: z.string().min(1).max(500),
  nbQuestions: z.number().min(3).max(20).default(5),
  niveauDifficulte: z.enum(["facile", "moyen", "difficile", "expert"]).optional(),
  matiere: z.string().optional(),
  niveauScolaire: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const parse = schemaQuiz.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  try {
    await verifierEtIncrementerQuota(user.id, "quiz");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  // Gemini doit retourner du JSON strict
  const promptQuiz = `Génère un quiz de ${parse.data.nbQuestions} questions sur : "${parse.data.notion}".
Niveau : ${parse.data.niveauDifficulte ?? "moyen"}.

Retourne UNIQUEMENT un JSON valide (sans markdown) avec ce format :
{
  "titre": "...",
  "questions": [
    {
      "enonce": "...",
      "choix": [
        {"contenu": "...", "est_correcte": true},
        {"contenu": "...", "est_correcte": false},
        {"contenu": "...", "est_correcte": false},
        {"contenu": "...", "est_correcte": false}
      ],
      "explication": "..."
    }
  ]
}`;

  const { contenu } = await appellerEli(promptQuiz, {
    niveauScolaire: parse.data.niveauScolaire,
    matiere: parse.data.matiere,
    niveauDifficulte: parse.data.niveauDifficulte,
  }, 3000);

  // Nettoyer le JSON si Gemini ajoute des backticks
  const jsonPropre = contenu.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const quiz = JSON.parse(jsonPropre);
    return NextResponse.json(quiz);
  } catch {
    return NextResponse.json({ erreur: "Format de quiz invalide", brut: contenu }, { status: 500 });
  }
}
