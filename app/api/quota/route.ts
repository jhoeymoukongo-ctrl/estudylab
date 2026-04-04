import { creerClientServeur } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const LIMITE_QUOTIDIENNE = 10;

export async function GET() {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  try {
    const aujourdhui = new Date().toISOString().split("T")[0];

    const { count } = await supabase
      .from("ai_generation_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("statut", "done")
      .gte("created_at", `${aujourdhui}T00:00:00.000Z`)
      .lt("created_at", `${aujourdhui}T23:59:59.999Z`);

    const used = count ?? 0;
    const remaining = Math.max(0, LIMITE_QUOTIDIENNE - used);

    return NextResponse.json({ used, limit: LIMITE_QUOTIDIENNE, remaining });
  } catch (error) {
    console.error("Erreur vérification quota :", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du quota" },
      { status: 500 }
    );
  }
}
