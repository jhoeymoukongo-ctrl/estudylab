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

function BoutonsOAuth() {
  const [chargementGoogle, setChargementGoogle] = useState(false);
  const [chargementApple, setChargementApple] = useState(false);

  async function connexionGoogle() {
    setChargementGoogle(true);
    const supabase = creerClientSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function connexionApple() {
    setChargementApple(true);
    const supabase = creerClientSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="space-y-3">
      <button
        onClick={connexionGoogle}
        disabled={chargementGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-dark-border bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {chargementGoogle ? "Connexion..." : "Continuer avec Google"}
      </button>

      <button
        onClick={connexionApple}
        disabled={chargementApple}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-dark-border bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        {chargementApple ? "Connexion..." : "Continuer avec Apple"}
      </button>

      <div className="flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-dark-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-dark-border" />
      </div>
    </div>
  );
}

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/tableau-de-bord";
  const erreurOAuth = searchParams.get("erreur");
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [erreur, setErreur] = useState<string | null>(erreurOAuth ? decodeURIComponent(erreurOAuth) : null);
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
            Connecte-toi à ton compte
          </p>
        </div>

        <BoutonsOAuth />

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
