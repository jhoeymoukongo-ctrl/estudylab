// POST /api/contenus/upload
// Upload d'une ressource (fichier ou lien URL) dans un chapitre
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { z } from "zod";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo
const EXTENSIONS_ACCEPTEES = ["pdf", "docx", "md", "png"];

const schemaUpload = z.object({
  chapter_id: z.string().uuid(),
  type: z.enum(["lecon", "exercice", "fiche"]),
  titre: z.string().min(1).max(200),
  ext: z.enum(["pdf", "docx", "md", "png", "lien"]),
  url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  // 1. Auth + admin
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

  // 2. Parser le FormData
  const formData = await request.formData();
  const meta = {
    chapter_id: formData.get("chapter_id") as string,
    type: formData.get("type") as string,
    titre: formData.get("titre") as string,
    ext: formData.get("ext") as string,
    url: (formData.get("url") as string) || undefined,
  };

  const parse = schemaUpload.safeParse(meta);
  if (!parse.success) return NextResponse.json({ erreur: parse.error.flatten() }, { status: 400 });

  const { chapter_id, type, titre, ext, url } = parse.data;
  const file = formData.get("file") as File | null;

  // 3. Calculer l'ordre suivant
  const table = type === "lecon" ? "lessons" : type === "exercice" ? "exercises" : "revision_sheets";
  const colonneParent = table === "revision_sheets" ? "lesson_id" : "chapter_id";

  // Pour les fiches, on a besoin du lesson_id du chapitre
  let parentId = chapter_id;
  if (table === "revision_sheets") {
    const { data: premierLecon } = await supabaseAdmin
      .from("lessons")
      .select("id")
      .eq("chapter_id", chapter_id)
      .is("deleted_at", null)
      .order("ordre")
      .limit(1)
      .single();
    parentId = premierLecon?.id ?? chapter_id;
  }

  const { data: dernierOrdre } = await supabaseAdmin
    .from(table)
    .select("ordre")
    .eq(colonneParent, parentId)
    .order("ordre", { ascending: false })
    .limit(1)
    .single();

  const nouvelOrdre = (dernierOrdre?.ordre ?? 0) + 1;

  // 4. Upload fichier ou insertion lien
  let storagePath: string | null = null;
  let fichierUrl: string | null = null;

  if (ext !== "lien" && file) {
    // Vérifier taille
    if (file.size > TAILLE_MAX) {
      return NextResponse.json({ erreur: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
    }

    // Vérifier extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !EXTENSIONS_ACCEPTEES.includes(fileExt)) {
      return NextResponse.json({ erreur: "Format non accepté" }, { status: 400 });
    }

    // Clé simple : {type_pluriel}/{timestamp}.{extension}
    const typeFolder = type === "lecon" ? "lecons" : type === "exercice" ? "exercices" : "fiches";
    storagePath = `${typeFolder}/${Date.now()}.${fileExt}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("contenus-admin")
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ erreur: "Erreur upload : " + uploadError.message }, { status: 500 });
    }

    // Récupérer l'URL publique
    fichierUrl = supabaseAdmin.storage
      .from("contenus-admin")
      .getPublicUrl(storagePath).data.publicUrl;
  }

  // 5. Insérer dans la table correspondante
  function genererSlug(texte: string): string {
    return texte
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }
  const slug = genererSlug(titre);

  let insertData: Record<string, unknown>;

  if (table === "lessons") {
    insertData = {
      chapter_id,
      titre,
      slug: `${slug}-${Date.now()}`,
      contenu_markdown: url ? `[Lien externe](${url})` : null,
      ordre: nouvelOrdre,
      statut: "published",
      source_type: "externe",
      ...(fichierUrl && { fichier_url: fichierUrl }),
      ...(storagePath && { storage_path: storagePath }),
    };
  } else if (table === "exercises") {
    insertData = {
      chapter_id,
      titre: titre || "Exercice sans titre",
      enonce: url ? `[Lien externe](${url})` : "",
      type: "calcul",
      niveau_difficulte: "moyen",
      ordre: nouvelOrdre,
      statut: "published",
      source_type: "interne",
      ...(fichierUrl && { fichier_url: fichierUrl }),
    };
  } else {
    // revision_sheets
    insertData = {
      lesson_id: parentId,
      titre,
      contenu_markdown: url ? `[Lien externe](${url})` : "Contenu à rédiger",
      ordre: nouvelOrdre,
      statut: "published",
      source: "manuel",
      ...(fichierUrl && { fichier_url: fichierUrl }),
    };
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from(table)
    .insert(insertData)
    .select("id, titre, ordre, statut, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ erreur: "Erreur insertion : " + insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    id: inserted.id,
    type,
    titre: inserted.titre,
    ext,
    ordre: inserted.ordre,
    statut: inserted.statut,
    url: url ?? undefined,
    fichier_url: fichierUrl ?? undefined,
    storage_path: storagePath ?? undefined,
    chapter_id,
    created_at: inserted.created_at,
  });
}
