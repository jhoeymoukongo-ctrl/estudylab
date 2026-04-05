import { creerClientServeur } from "@/lib/supabase/server";
import MatieresParNiveau from "@/components/matieres-par-niveau";

export default async function MatièresPage() {
  const supabase = await creerClientServeur();

  const { data: matieres } = await supabase
    .from("subjects")
    .select("id, nom, slug, description, icon, couleur")
    .eq("statut", "published")
    .order("nom");

  const { data: chapitres } = await supabase
    .from("chapters")
    .select("id, subject_id, niveau_scolaire")
    .eq("statut", "published");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Matières</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore les matières disponibles et commence à apprendre
        </p>
      </div>

      <MatieresParNiveau
        matieres={matieres ?? []}
        chapitres={chapitres ?? []}
      />
    </div>
  );
}
