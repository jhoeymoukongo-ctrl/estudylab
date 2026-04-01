"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Toast, useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

// ── Sections et onglets ──────────────────────
interface SectionTab {
  id: string;
  label: string;
  emoji: string;
  sectionFilter: string;
}

const TABS: SectionTab[] = [
  { id: "hero", label: "Hero", emoji: "🏠", sectionFilter: "landing_hero" },
  { id: "features", label: "Fonctionnalités", emoji: "⚡", sectionFilter: "landing_features" },
  { id: "pricing", label: "Tarifs", emoji: "💰", sectionFilter: "landing_pricing" },
  { id: "dashboard", label: "Dashboard", emoji: "📊", sectionFilter: "dashboard" },
  { id: "global", label: "Global", emoji: "🌐", sectionFilter: "global" },
];

interface SiteContentRow {
  id: string;
  cle: string;
  valeur: string;
  description: string | null;
  section: string;
  type: string;
}

export default function AdminParametresPage() {
  const supabase = creerClientSupabase();
  const { toast, afficherToast, fermerToast } = useToast();

  const [chargement, setChargement] = useState(true);
  const [contenus, setContenus] = useState<SiteContentRow[]>([]);
  const [ongletActif, setOngletActif] = useState("hero");
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [sauvegarde, setSauvegarde] = useState<Record<string, boolean>>({});

  useEffect(() => {
    chargerContenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function chargerContenus() {
    setChargement(true);
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .order("section")
      .order("cle");
    const rows = (data ?? []) as SiteContentRow[];
    setContenus(rows);
    const vals: Record<string, string> = {};
    for (const row of rows) {
      vals[row.cle] = row.valeur;
    }
    setValeurs(vals);
    setChargement(false);
  }

  async function sauvegarderChamp(cle: string) {
    setSauvegarde((s) => ({ ...s, [cle]: true }));
    const { error } = await supabase
      .from("site_content")
      .update({ valeur: valeurs[cle] })
      .eq("cle", cle);

    setSauvegarde((s) => ({ ...s, [cle]: false }));
    if (error) {
      afficherToast("Erreur : " + error.message, "error");
    } else {
      afficherToast("Texte sauvegardé");
    }
  }

  const tabActuel = TABS.find((t) => t.id === ongletActif);
  const contenusFiltres = contenus.filter(
    (c) => c.section === tabActuel?.sectionFilter
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
        <h1 className="font-display text-2xl font-bold">Paramètres du site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifiez les textes de l&apos;interface sans toucher au code
        </p>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOngletActif(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              ongletActif === tab.id
                ? "bg-brand-vert/10 text-brand-vert border border-brand-vert/30"
                : "bg-dark-card border border-dark-border text-muted-foreground hover:text-foreground hover:bg-dark-elevated"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Champs éditables */}
      <div className="space-y-4">
        {contenusFiltres.length === 0 && (
          <Card className="border-dark-border bg-dark-card">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Aucun texte éditable pour cette section.
              Exécutez la migration SQL pour insérer les données initiales.
            </CardContent>
          </Card>
        )}

        {contenusFiltres.map((item) => (
          <Card key={item.cle} className="border-dark-border bg-dark-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">{item.description || item.cle}</label>
                  <p className="text-xs text-muted-foreground font-mono">{item.cle}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => sauvegarderChamp(item.cle)}
                  disabled={sauvegarde[item.cle] || valeurs[item.cle] === item.valeur}
                  className="gap-1"
                >
                  {sauvegarde[item.cle] ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Sauvegarder
                </Button>
              </div>

              {item.type === "textarea" ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <Textarea
                    value={valeurs[item.cle] ?? ""}
                    onChange={(e) =>
                      setValeurs((v) => ({ ...v, [item.cle]: e.target.value }))
                    }
                    rows={4}
                    className="text-sm"
                  />
                  <div className="rounded-lg border border-dark-border bg-dark-elevated p-4 text-sm text-muted-foreground">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Aperçu
                    </p>
                    <p className="whitespace-pre-wrap">{valeurs[item.cle]}</p>
                  </div>
                </div>
              ) : (
                <Input
                  value={valeurs[item.cle] ?? ""}
                  onChange={(e) =>
                    setValeurs((v) => ({ ...v, [item.cle]: e.target.value }))
                  }
                  className="text-sm"
                />
              )}

              {valeurs[item.cle] !== item.valeur && (
                <p className="text-[10px] text-brand-vert">Modification non sauvegardée</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={fermerToast} />}
    </div>
  );
}
