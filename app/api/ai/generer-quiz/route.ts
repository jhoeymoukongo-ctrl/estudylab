import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_GENERER_QUIZ } from "@/lib/ai/prompts";

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

  const { notion, matiere, niveau } = await request.json();
  if (!notion) return new Response("Notion requise", { status: 400 });

  const systemPrompt = `${PROMPT_GENERER_QUIZ}\nMatière : ${matiere ?? "non précisée"}\nNiveau : ${niveau ?? "moyen"}`;
  const userPrompt = `Génère un quiz de 10 questions sur : "${notion}"`;

  const reponse = await appellerClaude(systemPrompt, userPrompt);

  // Extraire le JSON de la réponse
  try {
    const jsonMatch = reponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Pas de JSON trouvé");
    const quiz = JSON.parse(jsonMatch[0]);
    return Response.json(quiz);
  } catch {
    return Response.json({ error: "Erreur de parsing JSON IA", raw: reponse }, { status: 500 });
  }
}
