import { creerClientServeur } from "@/lib/supabase/server";
import FichesParNiveau from "@/components/fiches-par-niveau";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FichesPage() {
  const supabase = await creerClientServeur();

  let fiches: unknown[] = [];

  try {
    // RLS gere deja le filtrage : published+user_id IS NULL ou user_id = auth.uid()
    const { data, error } = await supabase
      .from("revision_sheets")
      .select(
        "id, titre, source, statut, created_at, lesson_id, lessons(chapter_id, chapters(niveau_scolaire, subject_id, subjects(nom, slug, icon, couleur)))"
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur chargement fiches:", error.message);
    }
    fiches = (data as unknown[]) ?? [];
  } catch (e) {
    console.error("Erreur fiches page:", e);
  }

  return <FichesParNiveau fiches={fiches} />;
}
