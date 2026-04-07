import { creerClientServeur } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen, CheckCircle2, Lightbulb, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

export default async function LeconPage({
  params,
}: {
  params: Promise<{ slug: string; chapitreSlug: string; leconSlug: string }>;
}) {
  const { slug, chapitreSlug, leconSlug } = await params;
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
    .select("id, titre, slug")
    .eq("subject_id", matiere.id)
    .eq("slug", chapitreSlug)
    .single();
  if (!chapitre) notFound();

  // Lecon
  const { data: lecon } = await supabase
    .from("lessons")
    .select("id, titre, slug, contenu_markdown, niveau_difficulte, duree_minutes, statut, fichier_url")
    .eq("chapter_id", chapitre.id)
    .eq("slug", leconSlug)
    .eq("statut", "published")
    .is("deleted_at", null)
    .single();
  if (!lecon) notFound();

  // Points cles
  const { data: pointsCles } = await supabase
    .from("lesson_key_points")
    .select("contenu")
    .eq("lesson_id", lecon.id)
    .order("ordre");

  // Exemples
  const { data: exemples } = await supabase
    .from("lesson_examples")
    .select("titre, contenu, explication")
    .eq("lesson_id", lecon.id)
    .order("ordre");

  // Progression utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let progression: string | null = null;
  if (user) {
    const { data: prog } = await supabase
      .from("user_lesson_progress")
      .select("statut")
      .eq("user_id", user.id)
      .eq("lesson_id", lecon.id)
      .single();
    progression = prog?.statut ?? null;
  }

  const niveauColors: Record<string, string> = {
    facile: "bg-brand-vert/10 text-brand-vert",
    moyen: "bg-brand-jaune/10 text-brand-jaune",
    difficile: "bg-brand-orange/10 text-brand-orange",
    expert: "bg-brand-rouge/10 text-brand-rouge",
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Fil d'Ariane */}
      <div>
        <Link
          href={`/matieres/${slug}/${chapitreSlug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> {chapitre.titre}
        </Link>
        <h1 className="font-display text-2xl font-bold">{lecon.titre}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {lecon.niveau_difficulte && (
            <Badge
              variant="secondary"
              className={niveauColors[lecon.niveau_difficulte] ?? ""}
            >
              {lecon.niveau_difficulte}
            </Badge>
          )}
          {lecon.duree_minutes && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} /> {lecon.duree_minutes} min
            </span>
          )}
          {progression === "completed" && (
            <Badge className="bg-brand-vert/10 text-brand-vert gap-1">
              <CheckCircle2 size={12} /> Terminee
            </Badge>
          )}
          {progression === "in_progress" && (
            <Badge className="bg-brand-jaune/10 text-brand-jaune gap-1">
              <BookOpen size={12} /> En cours
            </Badge>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      {lecon.fichier_url ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <span className="text-4xl">📄</span>
          <p className="text-sm text-muted-foreground">Ce cours est disponible en PDF.</p>
          <a
            href={lecon.fichier_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-vert px-6 py-3 text-sm font-medium text-white hover:bg-brand-vert/90 transition-colors"
          >
            <FileDown size={16} />
            Ouvrir le PDF
          </a>
        </div>
      ) : lecon.contenu_markdown ? (
        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-brand-vert prose-code:bg-dark-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown>{lecon.contenu_markdown}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <span className="text-4xl">📖</span>
          <p className="text-sm">Contenu en cours de preparation</p>
        </div>
      )}

      {/* Points cles */}
      {pointsCles && pointsCles.length > 0 && (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-6">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-brand-vert" />
              Points cles a retenir
            </h2>
            <ul className="space-y-2">
              {pointsCles.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-vert" />
                  {p.contenu}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Exemples */}
      {exemples && exemples.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Lightbulb size={20} className="text-brand-jaune" />
            Exemples
          </h2>
          {exemples.map((ex, i) => (
            <Card key={i} className="border-dark-border bg-dark-card">
              <CardContent className="p-5 space-y-2">
                {ex.titre && (
                  <h3 className="font-semibold text-sm">{ex.titre}</h3>
                )}
                <div className="text-sm whitespace-pre-wrap">{ex.contenu}</div>
                {ex.explication && (
                  <p className="text-xs text-muted-foreground mt-2 border-t border-dark-border pt-2">
                    {ex.explication}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
