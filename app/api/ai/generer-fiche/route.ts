// app/api/ai/generer-fiche/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { appellerEliStream } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";

const schemaFiche = z.object({
  lessonId: z.string().uuid().optional(),
  notion: z.string().min(1).max(500).optional(),
  contenuLecon: z.string().max(5000).optional(),
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
  const parse = schemaFiche.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  try {
    await verifierEtIncrementerQuota(user.id, "fiche");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  const sujet = parse.data.contenuLecon
    ? `ce contenu de cours :\n\n${parse.data.contenuLecon}`
    : `la notion : "${parse.data.notion}"`;

  const readableStream = await appellerEliStream(
    `Génère une fiche de révision claire et structurée sur ${sujet}.
    Utilise du markdown avec des titres, points clés en gras, et un résumé final.`,
    { niveauScolaire: parse.data.niveauScolaire, matiere: parse.data.matiere }
  );

  return new NextResponse(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
