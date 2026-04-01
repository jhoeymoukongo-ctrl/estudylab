import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_CORRIGER } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autoris\u00e9", { status: 401 });

  try {
    const { exercice, reponse, matiere } = await request.json();
    if (!exercice || !reponse) {
      return new Response("L'exercice et la r\u00e9ponse sont requis", { status: 400 });
    }

    const systemPrompt = `${PROMPT_CORRIGER}\nMati\u00e8re : ${matiere ?? "non pr\u00e9cis\u00e9e"}`;
    const userPrompt = `Exercice :\n${exercice}\n\nR\u00e9ponse de l'\u00e9l\u00e8ve :\n${reponse}`;

    const correction = await appellerClaude(systemPrompt, userPrompt);

    return Response.json({ correction });
  } catch (error) {
    console.error("Erreur correction IA :", error);
    return Response.json(
      { error: "Erreur lors de la correction" },
      { status: 500 }
    );
  }
}
