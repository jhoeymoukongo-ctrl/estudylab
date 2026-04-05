import { creerClientServeur } from "@/lib/supabase/server";
import ExercicesParNiveau from "@/components/exercices-par-niveau";

export default async function ExercicesPage() {
  const supabase = await creerClientServeur();

  const { data: exercices } = await supabase
    .from("exercises")
    .select(
      "id, titre, type, niveau_difficulte, duree_minutes, statut, chapters(niveau_scolaire, subject_id, subjects(nom, slug, icon, couleur))"
    )
    .eq("statut", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return <ExercicesParNiveau exercices={(exercices as unknown[]) ?? []} />;
}
