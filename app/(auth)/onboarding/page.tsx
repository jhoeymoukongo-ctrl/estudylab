"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, GraduationCap } from "lucide-react";

const niveaux = [
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "Seconde",
  "Première",
  "Terminale",
  "Licence 1",
  "Licence 2",
  "Licence 3",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [niveauChoisi, setNiveauChoisi] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleValider() {
    if (!niveauChoisi) return;

    setChargement(true);
    setErreur(null);

    const supabase = creerClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErreur("Session expirée. Reconnecte-toi.");
      setChargement(false);
      return;
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({ niveau_scolaire: niveauChoisi })
      .eq("user_id", user.id);

    if (error) {
      setErreur("Une erreur est survenue. Reessaie.");
      setChargement(false);
      return;
    }

    router.push("/tableau-de-bord");
    router.refresh();
  }

  return (
    <Card className="border-dark-border bg-dark-card">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-vert/10">
            <GraduationCap size={28} className="text-brand-vert" />
          </div>
          <h1 className="font-display text-2xl font-bold">
            Quel est ton niveau ?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            On adapte tout le contenu a ton niveau scolaire
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {niveaux.map((niveau) => (
            <button
              key={niveau}
              onClick={() => setNiveauChoisi(niveau)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                niveauChoisi === niveau
                  ? "border-brand-vert bg-brand-vert/10 text-brand-vert"
                  : "border-dark-border bg-dark-elevated hover:border-brand-vert/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {niveau}
            </button>
          ))}
        </div>

        {erreur && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {erreur}
          </div>
        )}

        <Button
          onClick={handleValider}
          className="mt-6 w-full"
          disabled={!niveauChoisi || chargement}
        >
          {chargement && <Loader2 size={16} className="animate-spin" />}
          {chargement ? "Enregistrement..." : "Continuer"}
        </Button>
      </CardContent>
    </Card>
  );
}
