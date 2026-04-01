import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_ANALYSER_DOCUMENT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autoris\u00e9", { status: 401 });

  try {
    const { contenu, type } = await request.json();
    if (!contenu) {
      return new Response("Le contenu du document est requis", { status: 400 });
    }

    const systemPrompt = `${PROMPT_ANALYSER_DOCUMENT}\nType de document indiqu\u00e9 : ${type ?? "non pr\u00e9cis\u00e9"}`;
    const userPrompt = `Analyse le document suivant :\n\n${contenu}`;

    const reponse = await appellerClaude(systemPrompt, userPrompt);

    // Tenter d'extraire le JSON de la r\u00e9ponse
    try {
      const jsonMatch = reponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Pas de JSON trouv\u00e9");
      const analyse = JSON.parse(jsonMatch[0]);
      return Response.json({ analyse });
    } catch {
      return Response.json({ analyse: reponse });
    }
  } catch (error) {
    console.error("Erreur analyse document IA :", error);
    return Response.json(
      { error: "Erreur lors de l'analyse du document" },
      { status: 500 }
    );
  }
}
