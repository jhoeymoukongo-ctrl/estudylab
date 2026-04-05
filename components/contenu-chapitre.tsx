"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Brain, PenLine, BookOpen, Clock } from "lucide-react";

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

interface Lecon {
  id: string;
  titre: string;
  slug: string;
  niveau_difficulte: string;
  duree_minutes: number | null;
}

interface Quiz {
  id: string;
  titre: string;
  niveau_difficulte: string;
  duree_minutes: number | null;
}

interface Exercice {
  id: string;
  titre: string;
  type: string;
  niveau_difficulte: string;
  duree_minutes: number | null;
}

interface Fiche {
  id: string;
  titre: string;
  source: string;
  created_at: string;
}

interface ContenuChapitreProps {
  slug: string;
  chapitreSlug: string;
  couleur: string | null;
  lecons: Lecon[];
  quizzes: Quiz[];
  exercices: Exercice[];
  fiches: Fiche[];
  progressionLecons: Record<string, string>;
}

type Onglet = "lecons" | "quiz" | "exercices" | "fiches";

const ONGLETS: { key: Onglet; label: string; icon: typeof FileText }[] = [
  { key: "lecons", label: "Lecons", icon: FileText },
  { key: "quiz", label: "Quiz", icon: Brain },
  { key: "exercices", label: "Exercices", icon: PenLine },
  { key: "fiches", label: "Fiches", icon: BookOpen },
];

export default function ContenuChapitre({
  slug,
  chapitreSlug,
  couleur,
  lecons,
  quizzes,
  exercices,
  fiches,
  progressionLecons,
}: ContenuChapitreProps) {
  const [onglet, setOnglet] = useState<Onglet>("lecons");

  const counts: Record<Onglet, number> = {
    lecons: lecons.length,
    quiz: quizzes.length,
    exercices: exercices.length,
    fiches: fiches.length,
  };

  return (
    <div className="space-y-4">
      {/* Onglets de contenu */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {ONGLETS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setOnglet(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              onglet === key
                ? "bg-brand-vert text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-dark-elevated"
            }`}
          >
            <Icon size={14} />
            {label}
            <span className={`text-xs ${onglet === key ? "text-white/70" : "text-muted-foreground"}`}>
              ({counts[key]})
            </span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="space-y-3">
        {onglet === "lecons" && (
          <>
            {lecons.map((lecon) => {
              const statut = progressionLecons[lecon.id];
              return (
                <Link key={lecon.id} href={`/matieres/${slug}/${chapitreSlug}/${lecon.slug}`}>
                  <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${couleur}15` }}>
                        <FileText size={20} style={{ color: couleur ?? undefined }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold">{lecon.titre}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          {lecon.niveau_difficulte && (
                            <Badge variant="secondary" className={niveauColors[lecon.niveau_difficulte] ?? ""}>{lecon.niveau_difficulte}</Badge>
                          )}
                          {lecon.duree_minutes && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} /> {lecon.duree_minutes} min</span>
                          )}
                          {statut === "completed" && <Badge className="bg-brand-vert/10 text-brand-vert">Terminee</Badge>}
                          {statut === "in_progress" && <Badge className="bg-brand-jaune/10 text-brand-jaune">En cours</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            {lecons.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucune lecon disponible.</p>}
          </>
        )}

        {onglet === "quiz" && (
          <>
            {quizzes.map((q) => (
              <Link key={q.id} href="/quiz">
                <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${couleur}15` }}>
                      <Brain size={20} style={{ color: couleur ?? undefined }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold">{q.titre}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className={niveauColors[q.niveau_difficulte] ?? ""}>{q.niveau_difficulte}</Badge>
                        {q.duree_minutes && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} /> {q.duree_minutes} min</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {quizzes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun quiz disponible.</p>}
          </>
        )}

        {onglet === "exercices" && (
          <>
            {exercices.map((ex) => (
              <Link key={ex.id} href={`/exercices/${ex.id}`}>
                <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${couleur}15` }}>
                      <PenLine size={20} style={{ color: couleur ?? undefined }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold">{ex.titre}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{typeLabels[ex.type] ?? ex.type}</Badge>
                        <Badge variant="secondary" className={niveauColors[ex.niveau_difficulte] ?? ""}>{ex.niveau_difficulte}</Badge>
                        {ex.duree_minutes && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock size={12} /> {ex.duree_minutes} min</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {exercices.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun exercice disponible.</p>}
          </>
        )}

        {onglet === "fiches" && (
          <>
            {fiches.map((f) => (
              <Link key={f.id} href={`/fiches/${f.id}`}>
                <Card className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${couleur}15` }}>
                      <BookOpen size={20} style={{ color: couleur ?? undefined }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold">{f.titre}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{f.source}</span>
                        <span>&middot;</span>
                        <span>{new Date(f.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {fiches.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucune fiche disponible.</p>}
          </>
        )}
      </div>
    </div>
  );
}
