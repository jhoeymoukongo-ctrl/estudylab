import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_EXPLIQUER } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  // Vérifier rôle admin
  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!profil || !["admin", "moderateur"].includes(profil.role)) {
    return new Response("Accès refusé", { status: 403 });
  }

  const { notion, matiere, niveau, longueur } = await request.json();
  if (!notion) return new Response("Notion requise", { status: 400 });

  const longueurInstr = longueur === "courte" ? "Fais un résumé court (500 mots max)."
    : longueur === "detaillee" ? "Fais un cours très détaillé et approfondi (2000+ mots)."
    : "Fais un cours de longueur moyenne (environ 1000 mots).";

  const systemPrompt = `Tu es un professeur expert. Génère un cours complet en markdown sur la notion demandée. ${longueurInstr} ${PROMPT_EXPLIQUER}`;
  const userPrompt = `Notion : "${notion}"\nMatière : ${matiere ?? "non précisée"}\nNiveau : ${niveau ?? "non précisé"}`;

  const contenu = await appellerClaude(systemPrompt, userPrompt);

  return Response.json({ contenu });
}
