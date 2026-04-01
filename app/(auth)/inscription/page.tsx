"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { creerClientSupabase } from "@/lib/supabase/client";
import { schemaInscription } from "@/lib/utils/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function InscriptionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    prenom: "",
    email: "",
    motDePasse: "",
    confirmation: "",
  });
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurChamps, setErreurChamps] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setErreurChamps({});

    const result = schemaInscription.safeParse(form);
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
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.motDePasse,
      options: {
        data: { full_name: form.prenom },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <Card className="border-dark-border bg-dark-card">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-brand-vert">
            E-StudyLab
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crée ton compte gratuitement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <Input
              placeholder="Ton prenom"
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
            {erreurChamps.prenom && (
              <p className="mt-1 text-xs text-destructive">{erreurChamps.prenom}</p>
            )}
          </div>

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
              placeholder="Minimum 8 caracteres"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            />
            {erreurChamps.motDePasse && (
              <p className="mt-1 text-xs text-destructive">{erreurChamps.motDePasse}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              placeholder="Confirme ton mot de passe"
              value={form.confirmation}
              onChange={(e) => setForm({ ...form, confirmation: e.target.value })}
            />
            {erreurChamps.confirmation && (
              <p className="mt-1 text-xs text-destructive">
                {erreurChamps.confirmation}
              </p>
            )}
          </div>

          {erreur && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {erreur}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={chargement}>
            {chargement && <Loader2 size={16} className="animate-spin" />}
            {chargement ? "Inscription en cours..." : "Creer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-brand-vert hover:underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
