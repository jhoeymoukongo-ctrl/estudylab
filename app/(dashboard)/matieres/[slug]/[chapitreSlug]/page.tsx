import { creerClientServeur } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ContenuChapitre from "@/components/contenu-chapitre";

export default async function ChapitrePage({
  params,
}: {
  params: Promise<{ slug: string; chapitreSlug: string }>;
}) {
  const { slug, chapitreSlug } = await params;
  const supabase = await creerClientServeur();

  // Matiere
  const { data: matiere } = await supabase
    .from("subjects")
    .select("id, nom, slug, couleur")
    .eq("slug", slug)
    .single();
  if (!matiere) notFound();

  // Chapitre
  const { data: chapitre } = await supabase
    .from("chapters")
    .select("id, titre, slug, description")
    .eq("subject_id", matiere.id)
    .eq("slug", chapitreSlug)
    .single();
  if (!chapitre) notFound();

  // Lecons
  const { data: lecons } = await supabase
    .from("lessons")
    .select("id, titre, slug, niveau_difficulte, duree_minutes")
    .eq("chapter_id", chapitre.id)
    .eq("statut", "published")
    .is("deleted_at", null)
    .order("created_at");

  // Quiz
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, titre, niveau_difficulte, duree_minutes")
    .eq("chapter_id", chapitre.id)
    .eq("statut", "published")
    .is("deleted_at", null)
    .order("created_at");

  // Exercices
  const { data: exercices } = await supabase
    .from("exercises")
    .select("id, titre, type, niveau_difficulte, duree_minutes")
    .eq("chapter_id", chapitre.id)
    .eq("statut", "published")
    .is("deleted_at", null)
    .order("created_at");

  // Fiches (via lecons du chapitre)
  const leconIds = (lecons ?? []).map((l) => l.id);
  let fiches: { id: string; titre: string; source: string; created_at: string }[] = [];
  if (leconIds.length > 0) {
    const { data: fichesData } = await supabase
      .from("revision_sheets")
      .select("id, titre, source, created_at")
      .in("lesson_id", leconIds)
      .eq("statut", "published")
      .is("deleted_at", null)
      .order("created_at");
    fiches = fichesData ?? [];
  }

  // Progression utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let progressionLecons: Record<string, string> = {};
  if (user) {
    const { data: prog } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id, statut")
      .eq("user_id", user.id);
    if (prog) {
      progressionLecons = Object.fromEntries(
        prog.map((p) => [p.lesson_id, p.statut])
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/matieres/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> {matiere.nom}
        </Link>
        <h1 className="font-display text-2xl font-bold">{chapitre.titre}</h1>
        {chapitre.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {chapitre.description}
          </p>
        )}
      </div>

      <ContenuChapitre
        slug={slug}
        chapitreSlug={chapitreSlug}
        couleur={matiere.couleur}
        lecons={lecons ?? []}
        quizzes={quizzes ?? []}
        exercices={exercices ?? []}
        fiches={fiches}
        progressionLecons={progressionLecons}
      />
    </div>
  );
}
