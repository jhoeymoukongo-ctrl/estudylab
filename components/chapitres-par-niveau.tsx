"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

const NIVEAUX = ["2nde", "Terminale", "Terminale STI2D"] as const;

interface Matiere {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  couleur: string | null;
}

interface Chapitre {
  id: string;
  titre: string;
  slug: string;
  description: string | null;
  ordre: number;
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

export default function ChapitresParNiveau({
  matiere,
  chapitres,
}: {
  matiere: Matiere;
  chapitres: Chapitre[];
}) {
  // Niveaux disponibles pour cette matière
  const niveauxDisponibles = NIVEAUX.filter((n) =>
    chapitres.some((ch) => matchNiveau(ch.niveau_scolaire, n))
  );

  const [niveau, setNiveau] = useState<string>(
    niveauxDisponibles[0] ?? NIVEAUX[0]
  );

  const chapitresFiltres = chapitres
    .filter((ch) => matchNiveau(ch.niveau_scolaire, niveau))
    .sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <Link
          href="/matieres"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} /> Matières
        </Link>
        <h1 className="font-display text-2xl font-bold">{matiere.nom}</h1>
        {matiere.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {matiere.description}
          </p>
        )}
      </div>

      {/* Onglets niveaux */}
      {niveauxDisponibles.length > 1 && (
        <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
          {niveauxDisponibles.map((n) => {
            const count = chapitres.filter((ch) =>
              matchNiveau(ch.niveau_scolaire, n)
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
      )}

      {/* Si un seul niveau, afficher un badge */}
      {niveauxDisponibles.length === 1 && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-vert/10 px-3 py-1 text-sm font-medium text-brand-vert">
            {niveauxDisponibles[0]}
          </span>
          <span className="text-xs text-muted-foreground">
            {chapitresFiltres.length} chapitre
            {chapitresFiltres.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Liste des chapitres */}
      <div className="space-y-3">
        {chapitresFiltres.map((ch, i) => (
          <Link key={ch.id} href={`/matieres/${matiere.slug}/${ch.slug}`}>
            <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    backgroundColor: `${matiere.couleur}15`,
                    color: matiere.couleur ?? undefined,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold">{ch.titre}</h3>
                  {ch.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {ch.description}
                    </p>
                  )}
                </div>
                <BookOpen
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
              </CardContent>
            </Card>
          </Link>
        ))}

        {chapitresFiltres.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun chapitre disponible pour le niveau {niveau}.
          </p>
        )}
      </div>
    </div>
  );
}
