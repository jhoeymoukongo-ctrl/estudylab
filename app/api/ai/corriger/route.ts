// app/api/ai/corriger/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { appellerEliStream } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";

const schemaCorrection = z.object({
  enonce: z.string().min(1).max(2000),
  reponseEleve: z.string().min(1).max(2000),
  niveauScolaire: z.string().optional(),
  matiere: z.string().optional(),
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
  const parse = schemaCorrection.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  try {
    await verifierEtIncrementerQuota(user.id, "correction");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  const readableStream = await appellerEliStream(
    `Corrige cette réponse d'élève étape par étape.

Énoncé : ${parse.data.enonce}

Réponse de l'élève : ${parse.data.reponseEleve}

Explique ce qui est correct, ce qui est incorrect, et donne la correction complète.`,
    { niveauScolaire: parse.data.niveauScolaire, matiere: parse.data.matiere }
  );

  return new NextResponse(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
