import { creerClientServeur } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Brain,
  MessageSquare,
  FileText,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!profil || !["admin", "moderateur"].includes(profil.role)) {
    redirect("/tableau-de-bord");
  }

  // Stats admin
  const [
    { count: nbUsers },
    { count: nbSubjects },
    { count: nbLessons },
    { count: nbQuizzes },
    { count: nbAiRequests },
    { count: nbModeration },
  ] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("subjects").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("quizzes").select("id", { count: "exact", head: true }),
    supabase.from("ai_generation_requests").select("id", { count: "exact", head: true }),
    supabase
      .from("moderation_queue")
      .select("id", { count: "exact", head: true })
      .eq("statut", "pending"),
  ]);

  const stats = [
    { label: "Utilisateurs", valeur: nbUsers ?? 0, icon: Users, couleur: "text-brand-vert", bg: "bg-brand-vert/10" },
    { label: "Matieres", valeur: nbSubjects ?? 0, icon: BookOpen, couleur: "text-brand-violet", bg: "bg-brand-violet/10" },
    { label: "Lecons", valeur: nbLessons ?? 0, icon: FileText, couleur: "text-brand-jaune", bg: "bg-brand-jaune/10" },
    { label: "Quiz", valeur: nbQuizzes ?? 0, icon: Brain, couleur: "text-brand-orange", bg: "bg-brand-orange/10" },
    { label: "Requetes IA", valeur: nbAiRequests ?? 0, icon: MessageSquare, couleur: "text-brand-bleu", bg: "bg-brand-bleu/10" },
    { label: "Moderation en attente", valeur: nbModeration ?? 0, icon: Shield, couleur: "text-brand-rouge", bg: "bg-brand-rouge/10" },
  ];

  // Derniers utilisateurs
  const { data: derniersUsers } = await supabase
    .from("user_profiles")
    .select("id, display_name, plan, role, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // File de moderation
  const { data: moderationItems } = await supabase
    .from("moderation_queue")
    .select("id, entity_type, statut, created_at")
    .eq("statut", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Administration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestion de la plateforme E-StudyLab
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-dark-border bg-dark-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Derniers utilisateurs */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">
            Derniers utilisateurs
          </h2>
          <Card className="border-dark-border bg-dark-card">
            <CardContent className="p-0">
              <div className="divide-y divide-dark-border">
                {derniersUsers?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {u.display_name ?? "Sans nom"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {u.plan}
                      </span>
                      {u.role !== "user" && (
                        <span className="rounded bg-brand-vert/10 px-2 py-0.5 text-xs text-brand-vert">
                          {u.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moderation */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">
            File de moderation
          </h2>
          <Card className="border-dark-border bg-dark-card">
            <CardContent className="p-0">
              {moderationItems && moderationItems.length > 0 ? (
                <div className="divide-y divide-dark-border">
                  {moderationItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {item.entity_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span className="rounded bg-brand-jaune/10 px-2 py-0.5 text-xs text-brand-jaune">
                        {item.statut}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Aucun element en attente de moderation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
