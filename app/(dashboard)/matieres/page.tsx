import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function MatièresPage() {
  const supabase = await creerClientServeur();

  const { data: matieres } = await supabase
    .from("subjects")
    .select("id, nom, slug, description, icon, couleur")
    .eq("statut", "published")
    .order("nom");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Matières</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore les matières disponibles et commence à apprendre
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matieres?.map((m) => (
          <Link key={m.id} href={`/matieres/${m.slug}`}>
            <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${m.couleur}15` }}
                >
                  {m.icon ?? "📚"}
                </div>
                <h3 className="font-display text-lg font-semibold">{m.nom}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {m.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {(!matieres || matieres.length === 0) && (
          <p className="col-span-full text-sm text-muted-foreground">
            Aucune matière disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
