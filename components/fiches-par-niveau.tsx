"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import Link from "next/link";

const NIVEAUX = ["2nde", "Terminale", "Terminale STI2D"] as const;

const SLUGS_MATIERES_PAR_NIVEAU: Record<string, string[]> = {
  "2nde": ["mathematiques", "physique-chimie"],
  Terminale: ["mathematiques", "physique-chimie", "svt", "francais"],
  "Terminale STI2D": ["mathematiques", "physique-chimie", "svt", "francais"],
};

function matchNiveau(chapNiveau: string | null, tabNiveau: string): boolean {
  if (!chapNiveau) return false;
  if (tabNiveau === "Terminale STI2D") return chapNiveau.includes("STI2D");
  if (tabNiveau === "Terminale")
    return chapNiveau.includes("Terminale") && !chapNiveau.includes("STI2D");
  if (tabNiveau === "2nde") return chapNiveau.includes("2nde");
  return false;
}

interface FicheItem {
  id: string;
  titre: string;
  source: string;
  statut: string;
  created_at: string;
  lesson_id: string | null;
  lessons: {
    chapter_id: string;
    chapters: {
      niveau_scolaire: string | null;
      subject_id: string;
      subjects: { nom: string; slug: string; icon: string | null; couleur: string | null };
    };
  } | null;
}

export default function FichesParNiveau({ fiches }: { fiches: unknown[] }) {
  const [niveau, setNiveau] = useState<string>(NIVEAUX[0]);
  const items = fiches as FicheItem[];

  const slugsAutorisees = SLUGS_MATIERES_PAR_NIVEAU[niveau] ?? [];
  const fichesFiltrees = items.filter(
    (f) =>
      f.lessons?.chapters &&
      matchNiveau(f.lessons.chapters.niveau_scolaire, niveau) &&
      slugsAutorisees.includes(f.lessons.chapters.subjects?.slug ?? "")
  );

  // Grouper par matiere
  const parMatiere = new Map<
    string,
    { nom: string; icon: string | null; couleur: string | null; items: FicheItem[] }
  >();
  for (const f of fichesFiltrees) {
    const s = f.lessons!.chapters.subjects;
    if (!parMatiere.has(s.slug)) {
      parMatiere.set(s.slug, { nom: s.nom, icon: s.icon, couleur: s.couleur, items: [] });
    }
    parMatiere.get(s.slug)!.items.push(f);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Fiches de revision</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tes fiches synthetiques pour reviser efficacement
        </p>
      </div>

      {/* Onglets niveaux */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {NIVEAUX.map((n) => {
          const count = items.filter(
            (f) =>
              f.lessons?.chapters &&
              matchNiveau(f.lessons.chapters.niveau_scolaire, n) &&
              (SLUGS_MATIERES_PAR_NIVEAU[n] ?? []).includes(
                f.lessons.chapters.subjects?.slug ?? ""
              )
          ).length;
          return (
            <button
              key={n}
              onClick={() => setNiveau(n)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                niveau === n
                  ? "bg-brand-vert text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-dark-elevated"
              }`}
            >
              {n}
              <span
                className={`ml-1.5 text-xs ${
                  niveau === n ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {parMatiere.size === 0 ? (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-8 text-center">
            <FileText size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucune fiche disponible pour le niveau {niveau}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...parMatiere.entries()].map(([slug, { nom, icon, couleur, items: fichesMatiere }]) => (
            <div key={slug}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{icon ?? "📚"}</span>
                <h2 className="font-display text-lg font-semibold">{nom}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {fichesMatiere.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fichesMatiere.map((fiche) => (
                  <Link key={fiche.id} href={`/fiches/${fiche.id}`}>
                    <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div
                          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${couleur}15` }}
                        >
                          <FileText size={20} style={{ color: couleur ?? undefined }} />
                        </div>
                        <h3 className="font-display font-semibold text-sm line-clamp-2">
                          {fiche.titre}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{fiche.source}</span>
                          <span>&middot;</span>
                          <span>
                            {new Date(fiche.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
