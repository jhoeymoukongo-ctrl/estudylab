import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_GENERER_FICHE } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!profil || !["admin", "moderateur"].includes(profil.role)) {
    return new Response("Accès refusé", { status: 403 });
  }

  const { notion, matiere, niveau, format } = await request.json();
  if (!notion) return new Response("Notion requise", { status: 400 });

  const formatInstr = format === "resume-court" ? "Génère un résumé court et concis (bullet points, 300 mots max)."
    : format === "memo-express" ? "Génère un mémo express ultra-condensé (formules clés, dates clés, définitions essentielles uniquement)."
    : "Génère une fiche de révision complète et détaillée.";

  const systemPrompt = `${PROMPT_GENERER_FICHE}\n${formatInstr}\nMatière : ${matiere ?? "non précisée"}\nNiveau : ${niveau ?? "non précisé"}`;
  const userPrompt = `Génère une fiche de révision sur : "${notion}"`;

  const contenu = await appellerClaude(systemPrompt, userPrompt);

  return Response.json({ contenu });
}
