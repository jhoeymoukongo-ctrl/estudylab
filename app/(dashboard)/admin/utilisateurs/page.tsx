"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Toast, useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2, Shield, Crown } from "lucide-react";

interface Utilisateur {
  id: string;
  user_id: string;
  display_name: string | null;
  plan: string;
  role: string;
  created_at: string;
}

export default function AdminUtilisateursPage() {
  const supabase = creerClientSupabase();
  const { toast, afficherToast, fermerToast } = useToast();

  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  useEffect(() => {
    chargerUtilisateurs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function chargerUtilisateurs() {
    setChargement(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, user_id, display_name, plan, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      afficherToast("Erreur lors du chargement des utilisateurs", "error");
    } else {
      setUtilisateurs(data ?? []);
    }
    setChargement(false);
  }

  async function changerRole(userId: string, nouveauRole: string) {
    setActionEnCours(userId + "-role");
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: nouveauRole })
      .eq("user_id", userId);

    if (error) {
      afficherToast("Erreur : " + error.message, "error");
    } else {
      afficherToast(`Role mis à jour : ${nouveauRole}`);
      chargerUtilisateurs();
    }
    setActionEnCours(null);
  }

  async function changerPlan(userId: string, nouveauPlan: string) {
    setActionEnCours(userId + "-plan");
    const { error } = await supabase
      .from("user_profiles")
      .update({ plan: nouveauPlan })
      .eq("user_id", userId);

    if (error) {
      afficherToast("Erreur : " + error.message, "error");
    } else {
      afficherToast(`Plan mis à jour : ${nouveauPlan}`);
      chargerUtilisateurs();
    }
    setActionEnCours(null);
  }

  const filtres = utilisateurs.filter((u) =>
    (u.display_name ?? "").toLowerCase().includes(recherche.toLowerCase()) ||
    u.user_id.toLowerCase().includes(recherche.toLowerCase())
  );

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-vert" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Users size={24} className="text-brand-violet" />
          Gestion des utilisateurs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? "s" : ""} inscrits
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste */}
      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-0">
          {/* En-tête tableau */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_140px_180px] gap-4 border-b border-dark-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Utilisateur</span>
            <span>Plan</span>
            <span>Role</span>
            <span>Inscription</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-dark-border">
            {filtres.map((u) => (
              <div key={u.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_100px_140px_180px] gap-2 sm:gap-4 px-4 py-3 sm:items-center">
                {/* Nom */}
                <div>
                  <p className="text-sm font-medium">{u.display_name ?? "Sans nom"}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.user_id}</p>
                </div>

                {/* Plan */}
                <div>
                  <Badge
                    variant="secondary"
                    className={u.plan === "premium"
                      ? "bg-brand-jaune/10 text-brand-jaune border-brand-jaune/20"
                      : ""}
                  >
                    {u.plan === "premium" ? "Premium" : "Free"}
                  </Badge>
                </div>

                {/* Role */}
                <div>
                  <Badge
                    variant="secondary"
                    className={
                      u.role === "admin"
                        ? "bg-brand-rouge/10 text-brand-rouge border-brand-rouge/20"
                        : u.role === "moderateur"
                        ? "bg-brand-violet/10 text-brand-violet border-brand-violet/20"
                        : ""
                    }
                  >
                    {u.role}
                  </Badge>
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="flex gap-1.5 flex-wrap">
                  {u.role !== "admin" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={actionEnCours === u.user_id + "-role"}
                      onClick={() => changerRole(u.user_id, "admin")}
                    >
                      {actionEnCours === u.user_id + "-role" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Shield size={12} />
                      )}
                      Admin
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={actionEnCours === u.user_id + "-role"}
                      onClick={() => changerRole(u.user_id, "user")}
                    >
                      Retirer admin
                    </Button>
                  )}

                  {u.plan !== "premium" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={actionEnCours === u.user_id + "-plan"}
                      onClick={() => changerPlan(u.user_id, "premium")}
                    >
                      {actionEnCours === u.user_id + "-plan" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Crown size={12} />
                      )}
                      Premium
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      disabled={actionEnCours === u.user_id + "-plan"}
                      onClick={() => changerPlan(u.user_id, "free")}
                    >
                      Retirer premium
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filtres.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun utilisateur trouvé.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={fermerToast} />}
    </div>
  );
}
