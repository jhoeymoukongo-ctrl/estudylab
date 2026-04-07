// GET /api/contenus/ressource/[id]/url — URL signée pour preview document
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;

  // Chercher dans les 3 tables possibles
  const tables = ["lessons", "exercises", "revision_sheets"];
  let storagePath: string | null = null;
  let mimeType: string | null = null;
  let titre = "";

  for (const table of tables) {
    const { data } = await supabaseAdmin
      .from(table)
      .select("storage_path, mime_type, titre")
      .eq("id", id)
      .single();
    if (data?.storage_path) {
      storagePath = data.storage_path;
      mimeType = data.mime_type ?? null;
      titre = data.titre ?? "";
      break;
    }
  }

  if (!storagePath) {
    return NextResponse.json(
      { error: "Aucun fichier associé" },
      { status: 404 }
    );
  }

  // URL signée valable 1 heure
  const { data: signedUrl, error } = await supabaseAdmin.storage
    .from("contenus-admin")
    .createSignedUrl(storagePath, 3600);

  if (error || !signedUrl) {
    return NextResponse.json(
      { error: "Impossible de générer l'URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: signedUrl.signedUrl,
    mimeType,
    titre,
  });
}
