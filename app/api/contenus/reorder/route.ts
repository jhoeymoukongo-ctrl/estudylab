// POST /api/contenus/reorder
// Réordonne les chapitres OU les ressources d'un chapitre
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { z } from "zod";

const schemaReorder = z.object({
  type: z.enum(["chapitre", "ressource"]),
  items: z.array(z.object({
    id: z.string().uuid(),
    ordre: z.number().int(),
  })),
});

// Client admin pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // 1. Auth + vérifier admin
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profil?.role !== "admin") {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  // 2. Valider le body
  const body = await request.json();
  const parse = schemaReorder.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  const { type, items } = parse.data;

  // 3. Appliquer le réordonnancement
  if (type === "chapitre") {
    for (const item of items) {
      await supabaseAdmin
        .from("chapters")
        .update({ ordre: item.ordre })
        .eq("id", item.id);
    }
  } else {
    // Ressource : détecter la table par id
    for (const item of items) {
      // Tenter chaque table
      const { data: lecon } = await supabaseAdmin
        .from("lessons")
        .select("id")
        .eq("id", item.id)
        .single();

      if (lecon) {
        await supabaseAdmin.from("lessons").update({ ordre: item.ordre }).eq("id", item.id);
        continue;
      }

      const { data: exercice } = await supabaseAdmin
        .from("exercises")
        .select("id")
        .eq("id", item.id)
        .single();

      if (exercice) {
        await supabaseAdmin.from("exercises").update({ ordre: item.ordre }).eq("id", item.id);
        continue;
      }

      // Sinon c'est une fiche
      await supabaseAdmin.from("revision_sheets").update({ ordre: item.ordre }).eq("id", item.id);
    }
  }

  return NextResponse.json({ success: true, updated: items.length });
}
