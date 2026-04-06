// DELETE + PATCH /api/contenus/ressource/[id]
// Supprime (soft delete) ou modifie une ressource
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Détecte dans quelle table se trouve l'id
async function detecterTable(id: string): Promise<string | null> {
  const tables = ["lessons", "exercises", "revision_sheets"];
  for (const table of tables) {
    const { data } = await supabaseAdmin
      .from(table)
      .select("id")
      .eq("id", id)
      .single();
    if (data) return table;
  }
  return null;
}

// Vérifier auth + admin
async function verifierAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profil?.role !== "admin") return null;
  return user;
}

// ── DELETE : soft delete ──────────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifierAdmin();
  if (!user) return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const table = await detecterTable(id);
  if (!table) return NextResponse.json({ erreur: "Ressource introuvable" }, { status: 404 });

  const { error } = await supabaseAdmin
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ erreur: "Erreur suppression : " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id, table });
}

// ── PATCH : modifier titre ou statut ──────────────────────────────────────────
const schemaPatch = z.object({
  titre: z.string().min(1).max(200).optional(),
  statut: z.enum(["draft", "published", "archived"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifierAdmin();
  if (!user) return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parse = schemaPatch.safeParse(body);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  const table = await detecterTable(id);
  if (!table) return NextResponse.json({ erreur: "Ressource introuvable" }, { status: 404 });

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parse.data.titre) updateData.titre = parse.data.titre;
  if (parse.data.statut) updateData.statut = parse.data.statut;

  const { error } = await supabaseAdmin
    .from(table)
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ erreur: "Erreur modification : " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id, table, ...parse.data });
}
