import { creerClientServeur } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BookOpen, Brain, Clock } from "lucide-react";

export default async function ProgressionPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progressions } = await supabase
    .from("user_progress")
    .select("*, subjects(nom, couleur)")
    .eq("user_id", user?.id ?? "")
    .order("pourcentage", { ascending: false });

  const { data: tentatives } = await supabase
    .from("quiz_attempts")
    .select("score, nb_bonnes_reponses, nb_questions, created_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: lessonProgress } = await supabase
    .from("user_lesson_progress")
    .select("statut")
    .eq("user_id", user?.id ?? "");

  const leconsTerminees = lessonProgress?.filter((l) => l.statut === "completed").length ?? 0;
  const leconsEnCours = lessonProgress?.filter((l) => l.statut === "in_progress").length ?? 0;
  const scoreMoyen = tentatives?.length
    ? Math.round(tentatives.reduce((a, t) => a + (t.score ?? 0), 0) / tentatives.length)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Ma progression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suis tes statistiques et identifie tes points a ameliorer
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-vert/10">
              <BookOpen size={22} className="text-brand-vert" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leçons terminées</p>
              <p className="text-lg font-bold">{leconsTerminees}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-violet/10">
              <Brain size={22} className="text-brand-violet" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Score moyen quiz</p>
              <p className="text-lg font-bold">{scoreMoyen}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-jaune/10">
              <Clock size={22} className="text-brand-jaune" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leçons en cours</p>
              <p className="text-lg font-bold">{leconsEnCours}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression par matiere */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4">
          Progression par matiere
        </h2>
        {progressions && progressions.length > 0 ? (
          <div className="space-y-4">
            {progressions.map((p) => {
              const matiere = p.subjects as { nom: string; couleur: string } | null;
              return (
                <Card key={p.id} className="border-dark-border bg-dark-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {matiere?.nom ?? "Matiere"}
                      </span>
                      <span className="text-sm font-bold" style={{ color: matiere?.couleur ?? undefined }}>
                        {p.pourcentage}%
                      </span>
                    </div>
                    <Progress value={p.pourcentage} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dark-border bg-dark-card">
            <CardContent className="p-8 text-center">
              <TrendingUp size={40} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Commence a etudier pour voir ta progression ici !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
