import { creerClientServeur } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChapitresParNiveau from "@/components/chapitres-par-niveau";

export default async function MatierePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await creerClientServeur();

  const { data: matiere } = await supabase
    .from("subjects")
    .select("id, nom, slug, description, couleur")
    .eq("slug", slug)
    .eq("statut", "published")
    .single();

  if (!matiere) notFound();

  const { data: chapitres } = await supabase
    .from("chapters")
    .select("id, titre, slug, description, ordre, niveau_scolaire")
    .eq("subject_id", matiere.id)
    .eq("statut", "published")
    .order("ordre");

  return (
    <ChapitresParNiveau matiere={matiere} chapitres={chapitres ?? []} />
  );
}
