"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const NIVEAUX = ["2nde", "Terminale", "Terminale STI2D"] as const;

const SLUGS_MATIERES_PAR_NIVEAU: Record<string, string[]> = {
  "2nde": ["mathematiques", "physique-chimie"],
  "Terminale": ["mathematiques", "physique-chimie", "svt", "francais"],
  "Terminale STI2D": ["mathematiques", "physique-chimie", "svt", "francais"],
};

interface Matiere {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  icon: string | null;
  couleur: string | null;
}

interface ChapitreInfo {
  id: string;
  subject_id: string;
  niveau_scolaire: string | null;
}

function matchNiveau(chapNiveau: string | null, tabNiveau: string): boolean {
  if (!chapNiveau) return false;
  if (tabNiveau === "Terminale STI2D") return chapNiveau.includes("STI2D");
  if (tabNiveau === "Terminale")
    return chapNiveau.includes("Terminale") && !chapNiveau.includes("STI2D");
  if (tabNiveau === "2nde") return chapNiveau.includes("2nde");
  return false;
}

export default function MatieresParNiveau({
  matieres,
  chapitres,
}: {
  matieres: Matiere[];
  chapitres: ChapitreInfo[];
}) {
  const [niveau, setNiveau] = useState<string>(NIVEAUX[0]);

  const slugsAutorisees = SLUGS_MATIERES_PAR_NIVEAU[niveau] ?? [];
  const matieresFiltrees = matieres.filter(
    (m) =>
      slugsAutorisees.includes(m.slug) &&
      chapitres.some(
        (ch) => ch.subject_id === m.id && matchNiveau(ch.niveau_scolaire, niveau)
      )
  );

  return (
    <div className="space-y-6">
      {/* Onglets niveaux */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {NIVEAUX.map((n) => {
          const count = matieres.filter((m) =>
            chapitres.some(
              (ch) =>
                ch.subject_id === m.id && matchNiveau(ch.niveau_scolaire, n)
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

      {/* Grille matières */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matieresFiltrees.map((m) => {
          const nbChapitres = chapitres.filter(
            (ch) =>
              ch.subject_id === m.id && matchNiveau(ch.niveau_scolaire, niveau)
          ).length;
          return (
            <Link key={m.id} href={`/matieres/${m.slug}`}>
              <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: `${m.couleur}15` }}
                  >
                    {m.icon ?? "📚"}
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {m.nom}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nbChapitres} chapitre{nbChapitres > 1 ? "s" : ""} en{" "}
                    {niveau}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {m.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {matieresFiltrees.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucune matière disponible pour le niveau {niveau}.
        </p>
      )}
    </div>
  );
}
