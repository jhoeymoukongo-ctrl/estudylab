"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Brain, PenLine, ClipboardList,
  Plus, Pencil, Trash2, ChevronRight, ChevronDown, Bot,
} from "lucide-react";

// ── Types locaux ────────────────────────────
interface Matiere {
  id: string; nom: string; slug: string; description: string | null;
  icon: string | null; couleur: string | null; statut: string;
}
interface Chapitre {
  id: string; subject_id: string; titre: string; slug: string;
  description: string | null; ordre: number; niveau_scolaire: string | null; statut: string;
}
interface Lecon {
  id: string; chapter_id: string; titre: string; statut: string;
}
interface QuizItem {
  id: string; chapter_id: string | null; titre: string; statut: string;
}
interface Exercice {
  id: string; chapter_id: string; titre: string; type: string; statut: string;
}
interface Fiche {
  id: string; titre: string; statut: string; lesson_id: string | null;
}

type ContentType = "matiere" | "chapitre" | "lecon" | "quiz" | "exercice" | "fiche";

// ── Niveaux affichés en onglets ──
const NIVEAUX = ["2nde", "Terminale", "Terminale STI2D"] as const;

// ── Matières affichées par niveau ──
const SLUGS_MATIERES_PAR_NIVEAU: Record<string, string[]> = {
  "2nde": ["mathematiques", "physique-chimie"],
  "Terminale": ["mathematiques", "physique-chimie", "svt", "francais"],
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

// ── Props ────────────────────────────────────
interface ArborescenceProps {
  matieres: Matiere[];
  chapitres: Chapitre[];
  lecons: Lecon[];
  quizzes: QuizItem[];
  exercices: Exercice[];
  fiches: Fiche[];
  leconsParChapitre: (chapitreId: string) => Lecon[];
  quizParChapitre: (chapitreId: string) => QuizItem[];
  exercicesParChapitre: (chapitreId: string) => Exercice[];
  fichesParChapitre: (chapitreId: string) => Fiche[];
  onCreate: (type: ContentType, defaults?: Record<string, string>) => void;
  onEdit: (type: ContentType, id: string) => void;
  onDelete: (type: ContentType, id: string, nom: string) => void;
  onOpenIA: (type: "lecon" | "quiz" | "exercice" | "fiche") => void;
}

export default function ArborescenceContenu({
  matieres, chapitres,
  leconsParChapitre, quizParChapitre, exercicesParChapitre, fichesParChapitre,
  onCreate, onEdit, onDelete, onOpenIA,
}: ArborescenceProps) {
  const [niveau, setNiveau] = useState<string>(NIVEAUX[0]);
  const [matiereOuverte, setMatiereOuverte] = useState<string | null>(null);
  const [chapitreOuvert, setChapitreOuvert] = useState<string | null>(null);

  // ── Filtrage par niveau ──────────────
  const chapitresNiveau = chapitres.filter((c) =>
    matchNiveau(c.niveau_scolaire, niveau)
  );

  const slugsAutorisees = SLUGS_MATIERES_PAR_NIVEAU[niveau] ?? [];
  const matieresNiveau = matieres.filter(
    (m) =>
      slugsAutorisees.includes(m.slug) &&
      chapitresNiveau.some((c) => c.subject_id === m.id)
  );

  function chapitresDeMatiere(subjectId: string) {
    return chapitresNiveau
      .filter((c) => c.subject_id === subjectId)
      .sort((a, b) => a.ordre - b.ordre);
  }

  // ── Compteurs par niveau ─────────────
  function countForNiveau(n: string) {
    return chapitres.filter((c) => matchNiveau(c.niveau_scolaire, n)).length;
  }

  // ── Rendu principal ─────────────────
  return (
    <div className="space-y-4">
      {/* Onglets niveaux */}
      <div className="flex gap-1 rounded-lg border border-dark-border bg-dark-card p-1">
        {NIVEAUX.map((n) => (
          <button
            key={n}
            onClick={() => {
              setNiveau(n);
              setMatiereOuverte(null);
              setChapitreOuvert(null);
            }}
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
              ({countForNiveau(n)})
            </span>
          </button>
        ))}
      </div>

      {/* Bouton créer chapitre */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">
          {niveau}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {matieresNiveau.length} matière{matieresNiveau.length > 1 ? "s" : ""} · {chapitresNiveau.length} chapitre{chapitresNiveau.length > 1 ? "s" : ""}
          </span>
        </h3>
        <Button size="sm" className="gap-1" onClick={() => onCreate("chapitre")}>
          <Plus size={14} /> Nouveau chapitre
        </Button>
      </div>

      {/* Arbre : Matière → Chapitre → Contenu */}
      <div className="space-y-3">
        {matieresNiveau.map((m) => {
          const mOuverte = matiereOuverte === m.id;
          const mChapitres = chapitresDeMatiere(m.id);

          return (
            <Card key={m.id} className="border-dark-border bg-dark-card">
              <CardContent className="p-0">
                {/* En-tête matière */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-dark-elevated/50 transition-colors"
                  onClick={() => {
                    setMatiereOuverte(mOuverte ? null : m.id);
                    setChapitreOuvert(null);
                  }}
                >
                  {mOuverte ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="text-xl">{m.icon ?? "📚"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{m.nom}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {mChapitres.length} chap.
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit("matiere", m.id)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete("matiere", m.id, m.nom)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Chapitres de la matière */}
                {mOuverte && (
                  <div className="border-t border-dark-border">
                    {mChapitres.map((ch) => {
                      const ouvert = chapitreOuvert === ch.id;
                      const chLecons = leconsParChapitre(ch.id);
                      const chQuiz = quizParChapitre(ch.id);
                      const chExo = exercicesParChapitre(ch.id);
                      const chFiches = fichesParChapitre(ch.id);

                      return (
                        <div key={ch.id} className="border-b border-dark-border/50 last:border-b-0">
                          {/* En-tête chapitre */}
                          <div
                            className="flex items-center gap-3 px-6 py-2.5 cursor-pointer hover:bg-dark-elevated/30 transition-colors"
                            onClick={() => setChapitreOuvert(ouvert ? null : ch.id)}
                          >
                            {ouvert ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-mono">#{ch.ordre}</span>
                                <span className="font-medium text-sm">{ch.titre}</span>
                                <Badge variant="secondary" className="text-[10px]">{ch.statut}</Badge>
                              </div>
                              {ch.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{ch.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{chLecons.length}L</span>
                              <span>{chQuiz.length}Q</span>
                              <span>{chExo.length}E</span>
                              <span>{chFiches.length}F</span>
                            </div>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon-sm" onClick={() => onEdit("chapitre", ch.id)}>
                                <Pencil size={12} />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => onDelete("chapitre", ch.id, ch.titre)}>
                                <Trash2 size={12} className="text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {/* Contenu du chapitre */}
                          {ouvert && (
                            <div className="bg-dark-elevated/20 divide-y divide-dark-border/30">
                              {/* Leçons */}
                              <ContentSection
                                icon={<FileText size={16} className="text-brand-vert" />}
                                label="Leçons"
                                count={chLecons.length}
                                onAdd={() => onCreate("lecon", { chapter_id: ch.id, subject_id: m.id })}
                                onIA={() => onOpenIA("lecon")}
                              >
                                {chLecons.map((l) => (
                                  <ContentItem key={l.id} nom={l.titre} statut={l.statut}
                                    onEdit={() => onEdit("lecon", l.id)}
                                    onDelete={() => onDelete("lecon", l.id, l.titre)}
                                  />
                                ))}
                              </ContentSection>

                              {/* Quiz */}
                              <ContentSection
                                icon={<Brain size={16} className="text-brand-violet" />}
                                label="Quiz"
                                count={chQuiz.length}
                                onAdd={() => onCreate("quiz", { chapter_id: ch.id })}
                                onIA={() => onOpenIA("quiz")}
                              >
                                {chQuiz.map((q) => (
                                  <ContentItem key={q.id} nom={q.titre} statut={q.statut}
                                    onEdit={() => onEdit("quiz", q.id)}
                                    onDelete={() => onDelete("quiz", q.id, q.titre)}
                                  />
                                ))}
                              </ContentSection>

                              {/* Exercices */}
                              <ContentSection
                                icon={<PenLine size={16} className="text-brand-orange" />}
                                label="Exercices"
                                count={chExo.length}
                                onAdd={() => onCreate("exercice", { chapter_id: ch.id })}
                                onIA={() => onOpenIA("exercice")}
                              >
                                {chExo.map((ex) => (
                                  <ContentItem key={ex.id} nom={ex.titre} statut={ex.statut} extra={ex.type}
                                    onEdit={() => onEdit("exercice", ex.id)}
                                    onDelete={() => onDelete("exercice", ex.id, ex.titre)}
                                  />
                                ))}
                              </ContentSection>

                              {/* Fiches */}
                              <ContentSection
                                icon={<ClipboardList size={16} className="text-brand-bleu" />}
                                label="Fiches de révision"
                                count={chFiches.length}
                                onAdd={() => onCreate("fiche", { chapter_id: ch.id })}
                                onIA={() => onOpenIA("fiche")}
                              >
                                {chFiches.map((f) => (
                                  <ContentItem key={f.id} nom={f.titre} statut={f.statut}
                                    onEdit={() => onEdit("fiche", f.id)}
                                    onDelete={() => onDelete("fiche", f.id, f.titre)}
                                  />
                                ))}
                              </ContentSection>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {mChapitres.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun chapitre pour cette matière en {niveau}.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {matieresNiveau.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun contenu pour le niveau {niveau}.
        </p>
      )}
    </div>
  );
}

// ── Sous-composants ───────────────────────
function ContentSection({
  icon, label, count, onAdd, onIA, children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  onAdd: () => void;
  onIA: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="px-8 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
          <Badge variant="secondary" className="text-[10px]">{count}</Badge>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={onIA}>
            <Bot size={12} /> IA
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={onAdd}>
            <Plus size={12} /> Ajouter
          </Button>
        </div>
      </div>
      <div className="space-y-1 ml-6">
        {children}
        {count === 0 && (
          <p className="text-xs text-muted-foreground italic">Aucun contenu</p>
        )}
      </div>
    </div>
  );
}

function ContentItem({
  nom, statut, extra, onEdit, onDelete,
}: {
  nom: string;
  statut: string;
  extra?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-dark-elevated/50 transition-colors group">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm truncate">{nom}</span>
        {extra && <Badge variant="secondary" className="text-[10px]">{extra}</Badge>}
        <Badge variant="secondary" className="text-[10px]">{statut}</Badge>
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-xs" onClick={onEdit}>
          <Pencil size={12} />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onDelete}>
          <Trash2 size={12} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}
