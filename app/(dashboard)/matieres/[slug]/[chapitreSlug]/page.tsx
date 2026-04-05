import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ChapitrePage({
  params,
}: {
  params: Promise<{ slug: string; chapitreSlug: string }>;
}) {
  const { slug, chapitreSlug } = await params;
  const supabase = await creerClientServeur();

  // Recuperer la matiere
  const { data: matiere } = await supabase
    .from("subjects")
    .select("id, nom, slug, couleur")
    .eq("slug", slug)
    .single();

  if (!matiere) notFound();

  // Recuperer le chapitre
  const { data: chapitre } = await supabase
    .from("chapters")
    .select("id, titre, slug, description")
    .eq("subject_id", matiere.id)
    .eq("slug", chapitreSlug)
    .single();

  if (!chapitre) notFound();

  // Recuperer les lecons
  const { data: lecons } = await supabase
    .from("lessons")
    .select("id, titre, slug, niveau_difficulte, duree_minutes, statut, contenu_markdown")
    .eq("chapter_id", chapitre.id)
    .eq("statut", "published")
    .is("deleted_at", null)
    .order("created_at");

  // Recuperer la progression de l'utilisateur
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

  const niveauColors: Record<string, string> = {
    facile: "bg-brand-vert/10 text-brand-vert",
    moyen: "bg-brand-jaune/10 text-brand-jaune",
    difficile: "bg-brand-orange/10 text-brand-orange",
    expert: "bg-brand-rouge/10 text-brand-rouge",
  };

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

      <div className="space-y-3">
        {lecons?.map((lecon) => {
          const statut = progressionLecons[lecon.id];
          return (
            <Link key={lecon.id} href={`/matieres/${slug}/${chapitreSlug}/${lecon.slug}`}>
            <Card
              className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${matiere.couleur}15` }}
                >
                  <FileText size={20} style={{ color: matiere.couleur ?? undefined }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold">{lecon.titre}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {lecon.niveau_difficulte && (
                      <Badge
                        variant="secondary"
                        className={
                          niveauColors[lecon.niveau_difficulte] ?? ""
                        }
                      >
                        {lecon.niveau_difficulte}
                      </Badge>
                    )}
                    {lecon.duree_minutes && (
                      <span className="text-xs text-muted-foreground">
                        {lecon.duree_minutes} min
                      </span>
                    )}
                    {statut === "completed" && (
                      <Badge className="bg-brand-vert/10 text-brand-vert">
                        Termine
                      </Badge>
                    )}
                    {statut === "in_progress" && (
                      <Badge className="bg-brand-jaune/10 text-brand-jaune">
                        En cours
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          );
        })}

        {(!lecons || lecons.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Aucune lecon disponible dans ce chapitre pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
