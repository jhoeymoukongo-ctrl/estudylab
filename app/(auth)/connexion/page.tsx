"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { creerClientSupabase } from "@/lib/supabase/client";
import { schemaConnexion } from "@/lib/utils/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tableau-de-bord";
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurChamps, setErreurChamps] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setErreurChamps({});

    const result = schemaConnexion.safeParse(form);
    if (!result.success) {
      const champs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        champs[key] = issue.message;
      });
      setErreurChamps(champs);
      return;
    }

    setChargement(true);
    const supabase = creerClientSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.motDePasse,
    });

    if (error) {
      setErreur("Email ou mot de passe incorrect");
      setChargement(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <Card className="border-dark-border bg-dark-card">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-brand-vert">
            E-StudyLab
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connecte-toi a ton compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="ton@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {erreurChamps.email && (
              <p className="mt-1 text-xs text-destructive">{erreurChamps.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mot de passe</label>
            <Input
              type="password"
              placeholder="Ton mot de passe"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            />
            {erreurChamps.motDePasse && (
              <p className="mt-1 text-xs text-destructive">{erreurChamps.motDePasse}</p>
            )}
          </div>

          {erreur && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {erreur}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={chargement}>
            {chargement && <Loader2 size={16} className="animate-spin" />}
            {chargement ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-brand-vert hover:underline">
            Creer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <FormulaireConnexion />
    </Suspense>
  );
}
