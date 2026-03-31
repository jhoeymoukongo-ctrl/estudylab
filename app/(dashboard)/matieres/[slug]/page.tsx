import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

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
    .select("id, titre, slug, description, ordre")
    .eq("subject_id", matiere.id)
    .eq("statut", "published")
    .order("ordre");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/matieres"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> Matieres
        </Link>
        <h1 className="font-display text-2xl font-bold">{matiere.nom}</h1>
        {matiere.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {matiere.description}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {chapitres?.map((ch, i) => (
          <Link key={ch.id} href={`/matieres/${slug}/${ch.slug}`}>
            <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    backgroundColor: `${matiere.couleur}15`,
                    color: matiere.couleur ?? undefined,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold">{ch.titre}</h3>
                  {ch.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {ch.description}
                    </p>
                  )}
                </div>
                <BookOpen size={18} className="shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}

        {(!chapitres || chapitres.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Aucun chapitre disponible pour cette matiere.
          </p>
        )}
      </div>
    </div>
  );
}
