import { creerClientServeur } from "@/lib/supabase/server";
import FichesParNiveau from "@/components/fiches-par-niveau";

export default async function FichesPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: fiches } = await supabase
    .from("revision_sheets")
    .select(
      "id, titre, source, statut, created_at, lesson_id, lessons(chapter_id, chapters(niveau_scolaire, subject_id, subjects(nom, slug, icon, couleur)))"
    )
    .or(
      `user_id.eq.${user?.id ?? "00000000-0000-0000-0000-000000000000"},and(user_id.is.null,statut.eq.published)`
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return <FichesParNiveau fiches={(fiches as unknown[]) ?? []} />;
}
