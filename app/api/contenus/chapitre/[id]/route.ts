// DELETE + PATCH /api/contenus/chapitre/[id]
// Archiver ou modifier un chapitre
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifierAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profil?.role !== "admin") return null;
  return user;
}

// ── DELETE : archiver le chapitre + ses leçons ──────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifierAdmin();
  if (!user)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;

  // Archiver le chapitre
  const { error } = await supabaseAdmin
    .from("chapters")
    .update({ statut: "archived", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Archiver aussi les leçons du chapitre
  await supabaseAdmin
    .from("lessons")
    .update({
      statut: "archived",
      deleted_at: new Date().toISOString(),
    })
    .eq("chapter_id", id);

  return NextResponse.json({ success: true });
}

// ── PATCH : modifier titre, ordre ou statut ─────────────────────────────────
const schemaPatch = z.object({
  titre: z.string().min(1).max(200).optional(),
  ordre: z.number().int().min(0).optional(),
  statut: z.enum(["draft", "published", "archived"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifierAdmin();
  if (!user)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const parsed = schemaPatch.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  // Recalculer le slug si le titre change
  if (parsed.data.titre) {
    updates.slug = parsed.data.titre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const { data, error } = await supabaseAdmin
    .from("chapters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
