import { creerClientServeur } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import CorrigeCollapsible from "./corrige-collapsible";

export const dynamic = "force-dynamic";

const niveauColors: Record<string, string> = {
  facile: "bg-brand-vert/10 text-brand-vert",
  moyen: "bg-brand-jaune/10 text-brand-jaune",
  difficile: "bg-brand-orange/10 text-brand-orange",
  expert: "bg-brand-rouge/10 text-brand-rouge",
};

const typeLabels: Record<string, string> = {
  calcul: "Calcul",
  redaction: "Redaction",
  "rédaction": "Redaction",
  probleme: "Probleme",
  "problème": "Probleme",
  qcm: "QCM",
  autre: "Autre",
};

export default async function ExercicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();

  const { data: exercice, error } = await supabase
    .from("exercises")
    .select(
      "id, titre, enonce, contenu_markdown, corrige, type, niveau_difficulte, duree_minutes, chapter_id, chapters(titre, slug, subject_id, subjects(nom, slug, couleur))"
    )
    .eq("id", id)
    .single();

  if (error) console.error("[exercice] erreur:", error.message);
  if (!exercice) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapRaw = exercice.chapters as any;
  const chapitre = chapRaw as {
    titre: string;
    slug: string;
    subject_id: string;
    subjects: { nom: string; slug: string; couleur: string | null };
  } | null;

  const matiere = chapitre?.subjects ?? null;
  const couleur = matiere?.couleur ?? "#10b981";

  // Contenu : privilegier contenu_markdown, sinon enonce
  const contenu = exercice.contenu_markdown || exercice.enonce || "";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/exercices"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> Exercices
        </Link>

        {(matiere || chapitre) && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            {matiere && (
              <span
                className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${couleur}15`,
                  color: couleur,
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
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${couleur}15` }}
          >
            <PenLine size={20} style={{ color: couleur }} />
          </div>
          {exercice.titre}
        </h1>

        {/* Metadonnees */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {exercice.type && (
            <Badge variant="secondary" className="text-xs">
              {typeLabels[exercice.type] ?? exercice.type}
            </Badge>
          )}
          {exercice.niveau_difficulte && (
            <Badge
              variant="secondary"
              className={niveauColors[exercice.niveau_difficulte] ?? ""}
            >
              {exercice.niveau_difficulte}
            </Badge>
          )}
          {exercice.duree_minutes && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={14} /> {exercice.duree_minutes} min
            </span>
          )}
        </div>
      </div>

      {/* Enonce */}
      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold mb-4">Enonce</h2>
          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-brand-vert prose-code:bg-dark-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown>{contenu}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Corrige (collapsible) */}
      {exercice.corrige && (
        <CorrigeCollapsible corrige={exercice.corrige} couleur={couleur} />
      )}
    </div>
  );
}
