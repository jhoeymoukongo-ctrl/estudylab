import { creerClientServeur } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const LIMITE_QUOTIDIENNE_PAR_DEFAUT = 20;

export async function GET() {
  const supabase = await creerClientServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Non autoris\u00e9", { status: 401 });

  try {
    const aujourdhui = new Date().toISOString().split("T")[0];

    // Tenter de r\u00e9cup\u00e9rer l'utilisation depuis la table ia_usage
    const { data: usage, error } = await supabase
      .from("ia_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("date", aujourdhui)
      .single();

    // Si la table n'existe pas ou aucune entr\u00e9e, retourner les valeurs par d\u00e9faut
    const used = error || !usage ? 0 : usage.count;
    const limit = LIMITE_QUOTIDIENNE_PAR_DEFAUT;
    const remaining = Math.max(0, limit - used);

    return NextResponse.json({ used, limit, remaining });
  } catch (error) {
    console.error("Erreur v\u00e9rification quota :", error);
    return NextResponse.json(
      { error: "Erreur lors de la v\u00e9rification du quota" },
      { status: 500 }
    );
  }
}
