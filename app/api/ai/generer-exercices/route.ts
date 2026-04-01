import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_GENERER_EXERCICES } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorise", { status: 401 });

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!profil || !["admin", "moderateur"].includes(profil.role)) {
    return new Response("Acces refuse", { status: 403 });
  }

  const { notion, matiere, niveau, type, count } = await request.json();
  if (!notion) return new Response("Notion requise", { status: 400 });

  const nombre = count ?? 3;
  const typeExo = type ?? "probleme";

  const systemPrompt = `${PROMPT_GENERER_EXERCICES}\nMatiere : ${matiere ?? "non precisee"}\nNiveau : ${niveau ?? "moyen"}\nType d'exercice : ${typeExo}`;
  const userPrompt = `Genere ${nombre} exercice(s) de type "${typeExo}" sur : "${notion}"`;

  const reponse = await appellerClaude(systemPrompt, userPrompt);

  try {
    const jsonMatch = reponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Pas de JSON trouve");
    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Erreur de parsing JSON IA", raw: reponse }, { status: 500 });
  }
}
