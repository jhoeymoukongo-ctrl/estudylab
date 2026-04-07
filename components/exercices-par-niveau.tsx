"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenLine, Clock, FileDown } from "lucide-react";
import Link from "next/link";

const NIVEAUX = ["2nde", "Terminale", "Terminale STI2D"] as const;

// Match par slug de matière : inclut les anciens ET les nouveaux slugs
const SLUGS_MATIERES_PAR_NIVEAU: Record<string, string[]> = {
  "2nde": ["mathematiques", "physique-chimie", "mathematiques-2nde", "physique-chimie-2nde"],
  Terminale: ["mathematiques", "physique-chimie", "svt", "francais", "mathematiques-terminale", "physique-chimie-terminale", "svt-terminale"],
  "Terminale STI2D": ["mathematiques", "physique-chimie", "mathematiques-sti2d", "physique-chimie-sti2d"],
};

function matchNiveau(chapNiveau: string | null, subjectSlug: string, tabNiveau: string): boolean {
  // D'abord essayer via le niveau_scolaire du chapitre
  if (chapNiveau) {
    if (tabNiveau === "Terminale STI2D") return chapNiveau.includes("STI2D");
    if (tabNiveau === "Terminale")
      return chapNiveau.includes("Terminale") && !chapNiveau.includes("STI2D");
    if (tabNiveau === "2nde") return chapNiveau.includes("2nde");
  }
  // Fallback: déduire le niveau depuis le slug de la matière
  if (tabNiveau === "Terminale STI2D") return subjectSlug.includes("sti2d");
  if (tabNiveau === "Terminale")
    return subjectSlug.includes("terminale") && !subjectSlug.includes("sti2d");
  if (tabNiveau === "2nde") return subjectSlug.includes("2nde");
  return false;
}

const niveauColors: Record<string, string> = {
  facile: "bg-brand-vert/10 text-brand-vert",
  moyen: "bg-brand-jaune/10 text-brand-jaune",
  difficile: "bg-brand-orange/10 text-brand-orange",
  expert: "bg-brand-rouge/10 text-brand-rouge",
};

const typeLabels: Record<string, string> = {
  calcul: "Calcul",
  redaction: "Redaction",
  "rédaction": "Redaction",
  probleme: "Probleme",
  "problème": "Probleme",
  qcm: "QCM",
  autre: "Autre",
};

interface ExerciceItem {
  id: string;
  titre: string;
  type: string;
  niveau_difficulte: string;
  duree_minutes: number | null;
  fichier_url: string | null;
  chapters: {
    niveau_scolaire: string | null;
    subject_id: string;
    subjects: { nom: string; slug: string; icon: string | null; couleur: string | null };
  } | null;
}

export default function ExercicesParNiveau({ exercices }: { exercices: unknown[] }) {
  const [niveau, setNiveau] = useState<string>(NIVEAUX[0]);
  const items = exercices as ExerciceItem[];

  const slugsAutorisees = SLUGS_MATIERES_PAR_NIVEAU[niveau] ?? [];
  const filtres = items.filter(
    (ex) =>
      ex.chapters &&
      matchNiveau(ex.chapters.niveau_scolaire, ex.chapters.subjects?.slug ?? "", niveau) &&
      slugsAutorisees.includes(ex.chapters.subjects?.slug ?? "")
  );

  // Grouper par matiere
  const parMatiere = new Map<
    string,
    { nom: string; icon: string | null; couleur: string | null; items: ExerciceItem[] }
  >();
  for (const ex of filtres) {
    const s = ex.chapters!.subjects;
    if (!parMatiere.has(s.slug)) {
      parMatiere.set(s.slug, { nom: s.nom, icon: s.icon, couleur: s.couleur, items: [] });
    }
    parMatiere.get(s.slug)!.items.push(ex);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Exercices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entraine-toi avec des exercices corriges
        </p>
      </div>

      {/* Onglets niveaux */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {NIVEAUX.map((n) => {
          const count = items.filter(
            (ex) =>
              ex.chapters &&
              matchNiveau(ex.chapters.niveau_scolaire, ex.chapters.subjects?.slug ?? "", n) &&
              (SLUGS_MATIERES_PAR_NIVEAU[n] ?? []).includes(ex.chapters.subjects?.slug ?? "")
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
              <span className={`ml-1.5 text-xs ${niveau === n ? "text-white/70" : "text-muted-foreground"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {parMatiere.size === 0 ? (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-8 text-center">
            <PenLine size={40} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aucun exercice disponible pour le niveau {niveau}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {[...parMatiere.entries()].map(([slug, { nom, icon, couleur, items: exosMatiere }]) => (
            <div key={slug}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{icon ?? "📚"}</span>
                <h2 className="font-display text-lg font-semibold">{nom}</h2>
                <Badge variant="secondary" className="text-[10px]">{exosMatiere.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exosMatiere.map((ex) => {
                  const cardContent = (
                    <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer h-full">
                      <CardContent className="p-5">
                        <div
                          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${couleur}15` }}
                        >
                          {ex.fichier_url ? (
                            <FileDown size={20} style={{ color: couleur ?? undefined }} />
                          ) : (
                            <PenLine size={20} style={{ color: couleur ?? undefined }} />
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-sm line-clamp-2">{ex.titre}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {ex.fichier_url && (
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 text-[10px]">PDF</Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px]">
                            {typeLabels[ex.type] ?? ex.type}
                          </Badge>
                          {ex.niveau_difficulte && (
                            <Badge variant="secondary" className={niveauColors[ex.niveau_difficulte] ?? ""}>
                              {ex.niveau_difficulte}
                            </Badge>
                          )}
                          {ex.duree_minutes && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={12} /> {ex.duree_minutes} min
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );

                  return ex.fichier_url ? (
                    <a key={ex.id} href={ex.fichier_url} target="_blank" rel="noopener noreferrer">
                      {cardContent}
                    </a>
                  ) : (
                    <Link key={ex.id} href={`/exercices/${ex.id}`}>
                      {cardContent}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
