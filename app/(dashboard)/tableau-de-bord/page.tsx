import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function TableauDeBordPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Recuperer la progression
  const { data: progressions } = await supabase
    .from("user_progress")
    .select("*, subjects(nom, couleur, icon)")
    .eq("user_id", user?.id ?? "")
    .order("derniere_activite", { ascending: false })
    .limit(4);

  // Recuperer les dernieres tentatives de quiz
  const { data: tentatives } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(titre)")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(3);

  // Recuperer les matieres disponibles
  const { data: matieres } = await supabase
    .from("subjects")
    .select("id, nom, slug, description, icon, couleur")
    .eq("statut", "published")
    .order("nom");

  const stats = [
    {
      label: "Matieres en cours",
      valeur: progressions?.length ?? 0,
      icon: BookOpen,
      couleur: "text-brand-violet",
      bg: "bg-brand-violet/10",
    },
    {
      label: "Quiz realises",
      valeur: tentatives?.length ?? 0,
      icon: Brain,
      couleur: "text-brand-vert",
      bg: "bg-brand-vert/10",
    },
    {
      label: "Score moyen",
      valeur: tentatives?.length
        ? `${Math.round(
            tentatives.reduce((acc, t) => acc + (t.score ?? 0), 0) /
              tentatives.length
          )}%`
        : "—",
      icon: TrendingUp,
      couleur: "text-brand-jaune",
      bg: "bg-brand-jaune/10",
    },
    {
      label: "Derniere activite",
      valeur: progressions?.[0]?.derniere_activite
        ? new Date(progressions[0].derniere_activite).toLocaleDateString("fr-FR")
        : "Aucune",
      icon: Clock,
      couleur: "text-brand-orange",
      bg: "bg-brand-orange/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrouve tes statistiques et continue tes cours
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-dark-border bg-dark-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  s.bg
                )}
              >
                <s.icon size={22} className={s.couleur} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.valeur}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matieres */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Matieres</h2>
          <Link
            href="/matieres"
            className="text-sm text-brand-vert hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matieres?.map((m) => (
            <Link key={m.id} href={`/matieres/${m.slug}`}>
              <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${m.couleur}15` }}
                  >
                    <BookOpen size={20} style={{ color: m.couleur ?? undefined }} />
                  </div>
                  <h3 className="font-display font-semibold">{m.nom}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {m.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}

          {(!matieres || matieres.length === 0) && (
            <p className="col-span-full text-sm text-muted-foreground">
              Aucune matiere disponible pour le moment.
            </p>
          )}
        </div>
      </div>

      {/* Derniers quiz */}
      {tentatives && tentatives.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Derniers quiz</h2>
            <Link
              href="/quiz"
              className="text-sm text-brand-vert hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {tentatives.map((t) => (
              <Card key={t.id} className="border-dark-border bg-dark-card">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {(t.quizzes as { titre: string } | null)?.titre ?? "Quiz"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.nb_bonnes_reponses}/{t.nb_questions} bonnes reponses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-vert">
                      {t.score}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dark-border bg-dark-card p-8 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold">
            Besoin d&apos;aide ?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pose tes questions a l&apos;assistant IA, il est la pour t&apos;aider !
          </p>
        </div>
        <Link
          href="/assistant-ia"
          className={cn(buttonVariants(), "gap-2")}
        >
          Ouvrir l&apos;assistant
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
