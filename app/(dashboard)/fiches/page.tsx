import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function FichesPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: fiches } = await supabase
    .from("revision_sheets")
    .select("id, titre, source, statut, created_at, lessons(titre)")
    .or(`user_id.eq.${user?.id ?? ""},and(user_id.is.null,statut.eq.published)`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Fiches de revision</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tes fiches synthetiques pour reviser efficacement
        </p>
      </div>

      {fiches && fiches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fiches.map((fiche) => (
            <Card
              key={fiche.id}
              className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors"
            >
              <CardContent className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-jaune/10">
                  <FileText size={20} className="text-brand-jaune" />
                </div>
                <h3 className="font-display font-semibold line-clamp-2">
                  {fiche.titre}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{fiche.source}</span>
                  <span>&middot;</span>
                  <span>
                    {new Date(fiche.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-8 text-center">
            <FileText size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune fiche de revision pour le moment. Elles seront generees au
              fur et a mesure de ton apprentissage.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
