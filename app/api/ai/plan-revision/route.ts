import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_PLAN_REVISION } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autoris\u00e9", { status: 401 });

  try {
    const { matiere, niveau, objectif, duree_jours } = await request.json();
    if (!matiere || !niveau) {
      return new Response("La mati\u00e8re et le niveau sont requis", { status: 400 });
    }

    const duree = duree_jours && Number(duree_jours) > 0 ? Number(duree_jours) : 14;

    const systemPrompt = `${PROMPT_PLAN_REVISION}\nDur\u00e9e du plan : ${duree} jours`;
    const userPrompt = `Mati\u00e8re : ${matiere}\nNiveau : ${niveau}\nObjectif : ${objectif ?? "R\u00e9visions g\u00e9n\u00e9rales"}`;

    const plan = await appellerClaude(systemPrompt, userPrompt);

    return Response.json({ plan });
  } catch (error) {
    console.error("Erreur plan de r\u00e9vision IA :", error);
    return Response.json(
      { error: "Erreur lors de la g\u00e9n\u00e9ration du plan de r\u00e9vision" },
      { status: 500 }
    );
  }
}
