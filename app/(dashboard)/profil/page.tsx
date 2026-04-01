"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Loader2, CheckCircle } from "lucide-react";

const niveaux = [
  "6ème", "5ème", "4ème", "3ème", "Seconde",
  "Première", "Terminale", "Licence 1", "Licence 2", "Licence 3",
];

export default function ProfilPage() {
  const [profil, setProfil] = useState<{
    display_name: string;
    niveau_scolaire: string;
    plan: string;
    bio: string;
  }>({ display_name: "", niveau_scolaire: "", plan: "free", bio: "" });
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function charger() {
      const supabase = creerClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("display_name, niveau_scolaire, plan, bio")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfil({
          display_name: data.display_name ?? "",
          niveau_scolaire: data.niveau_scolaire ?? "",
          plan: data.plan ?? "free",
          bio: data.bio ?? "",
        });
      }
      setChargement(false);
    }
    charger();
  }, []);

  async function sauvegarder() {
    setSaving(true);
    const supabase = creerClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_profiles")
      .update({
        display_name: profil.display_name,
        niveau_scolaire: profil.niveau_scolaire,
        bio: profil.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSaving(false);
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 2000);
  }

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gere tes informations personnelles
        </p>
      </div>

      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-vert/10">
              <User size={28} className="text-brand-vert" />
            </div>
            <div>
              <p className="font-display font-semibold text-lg">
                {profil.display_name || "Utilisateur"}
              </p>
              <Badge variant="secondary" className="mt-1">
                {profil.plan === "premium" ? "Premium" : "Gratuit"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <Input
              value={profil.display_name}
              onChange={(e) =>
                setProfil({ ...profil, display_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <Input
              value={profil.bio}
              onChange={(e) => setProfil({ ...profil, bio: e.target.value })}
              placeholder="Quelques mots sur toi..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Niveau scolaire
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {niveaux.map((n) => (
                <button
                  key={n}
                  onClick={() => setProfil({ ...profil, niveau_scolaire: n })}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    profil.niveau_scolaire === n
                      ? "border-brand-vert bg-brand-vert/10 text-brand-vert"
                      : "border-dark-border text-muted-foreground hover:border-brand-vert/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={sauvegarder} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              Sauvegarder
            </Button>
            {sauvegarde && (
              <span className="flex items-center gap-1 text-sm text-brand-vert">
                <CheckCircle size={14} /> Sauvegarde !
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
