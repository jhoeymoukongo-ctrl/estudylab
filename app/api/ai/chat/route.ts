import { creerClientServeur } from "@/lib/supabase/server";
import { streamClaude } from "@/lib/ai/claude";
import { PROMPT_SYSTEME_BASE } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Non autorise", { status: 401 });
  }

  const { message, matiere, niveau } = await request.json();
  if (!message || typeof message !== "string") {
    return new Response("Message requis", { status: 400 });
  }

  // Verifier le quota (plan free = 10 requetes/jour)
  const { data: profil } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  if (profil?.plan === "free") {
    const aujourdhui = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("ai_generation_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${aujourdhui}T00:00:00.000Z`)
      .lt("created_at", `${aujourdhui}T23:59:59.999Z`);

    if ((count ?? 0) >= 10) {
      return new Response(
        JSON.stringify({ error: "Limite de 10 requetes IA par jour atteinte. Passe en premium pour un acces illimite !" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Logger la requete
  await supabase.from("ai_generation_requests").insert({
    user_id: user.id,
    type: "explication",
    contexte: { message, matiere, niveau },
    statut: "processing",
  });

  const systemPrompt = PROMPT_SYSTEME_BASE({
    niveauScolaire: niveau ?? "non precise",
    matiere: matiere ?? "non precisee",
    chapitre: "general",
    niveauDifficulte: "moyen",
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamClaude(systemPrompt, message)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("[/api/ai/chat] Erreur streaming Claude :", err);
        // Envoyer un message d'erreur lisible au client avant de fermer
        const msgErreur = err instanceof Error ? err.message : "Erreur inconnue";
        controller.enqueue(encoder.encode(`\n\n[Erreur : ${msgErreur}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
