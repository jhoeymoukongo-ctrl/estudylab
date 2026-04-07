// POST /api/contenus/chapitre — Créer un nouveau chapitre
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  subject_id: z.string().uuid(),
  titre: z.string().min(1).max(200),
  ordre: z.number().int().min(0).optional(),
});

async function getSupabaseEtVerifierAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profil?.role !== "admin") return { supabase, user: null };
  return { supabase, user };
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getSupabaseEtVerifierAdmin();
  if (!user)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  // Calculer l'ordre max existant
  const { data: dernierChapitre } = await supabase
    .from("chapters")
    .select("ordre")
    .eq("subject_id", parsed.data.subject_id)
    .order("ordre", { ascending: false })
    .limit(1);

  const ordreMax = dernierChapitre?.[0]?.ordre ?? 0;
  const nouvelOrdre = parsed.data.ordre ?? ordreMax + 1;

  const slug =
    parsed.data.titre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now();

  const { data, error } = await supabase
    .from("chapters")
    .insert({
      subject_id: parsed.data.subject_id,
      titre: parsed.data.titre,
      slug,
      ordre: nouvelOrdre,
      statut: "published",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
