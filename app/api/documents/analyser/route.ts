import { creerClientServeur } from "@/lib/supabase/server";
import { appellerClaude } from "@/lib/ai/claude";
import { PROMPT_ANALYSER_DOCUMENT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  // Vérifier le plan — seuls les utilisateurs premium peuvent analyser des documents
  const { data: profil } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  if (!profil || profil.plan === "free") {
    return Response.json(
      { error: "L'analyse de documents est réservée aux utilisateurs premium." },
      { status: 403 }
    );
  }

  try {
    const { contenu, type } = await request.json();
    if (!contenu) {
      return new Response("Le contenu du document est requis", { status: 400 });
    }

    const systemPrompt = `${PROMPT_ANALYSER_DOCUMENT}\nType de document indiqué : ${type ?? "non précisé"}`;
    const userPrompt = `Analyse le document suivant :\n\n${contenu}`;

    const reponse = await appellerClaude(systemPrompt, userPrompt);

    // Tenter d'extraire le JSON de la réponse
    try {
      const jsonMatch = reponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Pas de JSON trouvé");
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
