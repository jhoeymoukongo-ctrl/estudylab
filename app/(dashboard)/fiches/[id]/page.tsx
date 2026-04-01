import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default async function FichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();

  const { data: fiche } = await supabase
    .from("revision_sheets")
    .select("*, chapters(titre, subjects(nom, couleur))")
    .eq("id", id)
    .single();

  if (!fiche) notFound();

  const chapitre = fiche.chapters as {
    titre: string;
    subjects: { nom: string; couleur: string } | null;
  } | null;

  const matiere = chapitre?.subjects ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/fiches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> Fiches de revision
        </Link>

        {(matiere || chapitre) && (
          <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
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
            {matiere && chapitre && <span>/</span>}
            {chapitre && <span>{chapitre.titre}</span>}
          </p>
        )}

        <h1 className="font-display text-2xl font-bold flex items-center gap-3">
          <BookOpen size={24} className="shrink-0 text-muted-foreground" />
          {fiche.titre}
        </h1>
      </div>

      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-6">
          <div
            className="text-sm text-muted-foreground leading-relaxed"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {fiche.contenu_markdown}
          </div>
        </CardContent>
      </Card>

      <Link
        href="/tableau-de-bord"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Retour au tableau de bord
      </Link>
    </div>
  );
}
