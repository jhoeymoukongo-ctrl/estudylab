import { creerClientServeur } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export default async function FichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();

  const { data: fiche, error } = await supabase
    .from("revision_sheets")
    .select(
      "id, titre, contenu_markdown, source, statut, created_at, fichier_url, lessons(titre, chapter_id, chapters(titre, slug, subject_id, subjects(nom, slug, couleur)))"
    )
    .eq("id", id)
    .single();

  if (error) console.error("[fiche] erreur:", error.message);
  if (!fiche) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonRaw = fiche.lessons as any;
  const lesson = lessonRaw as {
    titre: string;
    chapter_id: string;
    chapters: {
      titre: string;
      slug: string;
      subject_id: string;
      subjects: { nom: string; slug: string; couleur: string | null };
    };
  } | null;

  const chapitre = lesson?.chapters ?? null;
  const matiere = chapitre?.subjects ?? null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/fiches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> Fiches de revision
        </Link>

        {(matiere || chapitre) && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {matiere && (
              <span
                className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${matiere.couleur}15`,
                  color: matiere.couleur ?? undefined,
                }}
              >
                {matiere.nom}
              </span>
            )}
            {chapitre && (
              <Link
                href={`/matieres/${matiere?.slug}/${chapitre.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {chapitre.titre}
              </Link>
            )}
          </div>
        )}

        <h1 className="font-display text-2xl font-bold flex items-center gap-3">
          <BookOpen size={24} className="shrink-0 text-muted-foreground" />
          {fiche.titre}
        </h1>

        <div className="mt-2 flex items-center gap-3">
          <Badge variant="secondary" className="text-xs capitalize">
            {fiche.source}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(fiche.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Contenu markdown */}
      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-brand-vert prose-code:bg-dark-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown>{fiche.contenu_markdown ?? ""}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Fichier joint */}
      {fiche.fichier_url && (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-lg">📎</span>
            <a
              href={fiche.fichier_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-vert hover:underline"
            >
              Telecharger le fichier joint
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
