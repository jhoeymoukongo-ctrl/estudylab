// app/api/documents/analyser/route.ts
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { appellerEliVision } from "@/lib/ai/gemini";
import { verifierEtIncrementerQuota, QuotaDepasse } from "@/lib/ai/quota";

const schemaAnalyse = z.object({
  documentId: z.string().uuid(),
});

const PROMPT_ANALYSE_DOCUMENT = `Analyse ce document scolaire et retourne UNIQUEMENT un JSON valide sans markdown.
Format attendu :
{
  "type_document": "cours | exercice | examen | fiche | autre",
  "matiere_detectee": "...",
  "niveau_detecte": "...",
  "resume": "Résumé en 2-3 phrases",
  "notions_detectees": ["notion1", "notion2"],
  "exercices_detectes": [{"enonce": "...", "type": "calcul | redaction | qcm"}],
  "questions_detectees": ["question1"],
  "texte_extrait": "Texte complet extrait du document"
}`;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  // Guard premium : le scan est réservé aux abonnés
  const { data: profil } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  if (profil?.plan === "free") {
    return NextResponse.json({ erreur: "fonctionnalite_premium" }, { status: 403 });
  }

  const body = await request.json();
  const parse = schemaAnalyse.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  try {
    await verifierEtIncrementerQuota(user.id, "scan");
  } catch (err) {
    if (err instanceof QuotaDepasse) {
      return NextResponse.json(
        { erreur: "quota_atteint", quotaUtilise: err.quotaUtilise, quotaMax: err.quotaMax },
        { status: 429 }
      );
    }
    throw err;
  }

  // Récupérer le document depuis Supabase Storage
  const { data: document } = await supabase
    .from("uploaded_documents")
    .select("*")
    .eq("id", parse.data.documentId)
    .eq("user_id", user.id)
    .single();

  if (!document) return NextResponse.json({ erreur: "Document introuvable" }, { status: 404 });

  await supabase
    .from("uploaded_documents")
    .update({ statut_analyse: "processing" })
    .eq("id", document.id);

  const { data: fichierData } = await supabase.storage
    .from("documents")
    .download(document.storage_path);

  if (!fichierData) return NextResponse.json({ erreur: "Fichier introuvable" }, { status: 404 });

  const arrayBuffer = await fichierData.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const { contenu } = await appellerEliVision(
    PROMPT_ANALYSE_DOCUMENT,
    base64,
    document.mime_type as "image/jpeg" | "image/png" | "image/webp" | "application/pdf"
  );

  const jsonPropre = contenu.replace(/```json\n?|\n?```/g, "").trim();
  const analyse = JSON.parse(jsonPropre);

  await supabase.from("document_analysis_results").insert({
    document_id: document.id,
    texte_extrait: analyse.texte_extrait,
    resume: analyse.resume,
    notions_detectees: analyse.notions_detectees,
    exercices_detectes: analyse.exercices_detectes,
    questions_detectees: analyse.questions_detectees,
  });

  await supabase
    .from("uploaded_documents")
    .update({ statut_analyse: "done" })
    .eq("id", document.id);

  return NextResponse.json(analyse);
}
