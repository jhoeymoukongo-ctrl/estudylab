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

// ── Niveaux scolaires complets par catégorie ──
interface CategorieNiveau {
  label: string;
  emoji: string;
  niveaux: string[];
}

const CATEGORIES_NIVEAUX: CategorieNiveau[] = [
  {
    label: "Collège",
    emoji: "📚",
    niveaux: ["6ème", "5ème", "4ème", "3ème"],
  },
  {
    label: "Lycée Général",
    emoji: "🎓",
    niveaux: ["2nde Générale", "1ère Générale", "Terminale Générale", "Terminale — Maths", "Terminale — Physique-Chimie", "Terminale — SVT"],
  },
  {
    label: "Lycée Techno",
    emoji: "🔧",
    niveaux: ["1ère STI2D", "Terminale STI2D", "1ère STMG", "Terminale STMG"],
  },
  {
    label: "BTS/BUT",
    emoji: "📋",
    niveaux: ["BTS 1ère année", "BTS 2ème année", "BUT 1ère année", "BUT 2ème année", "BUT 3ème année"],
  },
  {
    label: "Licence",
    emoji: "🏛️",
    niveaux: ["Licence 1", "Licence 2", "Licence 3"],
  },
];

const TOUS_NIVEAUX = CATEGORIES_NIVEAUX.flatMap((c) => c.niveaux);

type NavState =
  | { level: "subjects" }
  | { level: "niveaux"; subjectId: string }
  | { level: "chapitres"; subjectId: string; niveau: string }

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
  const [nav, setNav] = useState<NavState>({ level: "subjects" });
  const [chapitreOuvert, setChapitreOuvert] = useState<string | null>(null);

  // ── Helpers ──────────────────────────
  function nomMatiere(id: string) {
    return matieres.find((m) => m.id === id)?.nom ?? "";
  }

  function niveauxDisponibles(subjectId: string) {
    const niveaux = new Set(
      chapitres.filter((c) => c.subject_id === subjectId && c.niveau_scolaire).map((c) => c.niveau_scolaire!)
    );
    // Garder l'ordre logique
    const ordered = TOUS_NIVEAUX.filter((n) => niveaux.has(n));
    // Ajouter les niveaux inconnus
    niveaux.forEach((n) => { if (!ordered.includes(n)) ordered.push(n); });
    return ordered;
  }

  function niveauxDisponiblesParCategorie(subjectId: string) {
    const disponibles = new Set(niveauxDisponibles(subjectId));
    return CATEGORIES_NIVEAUX
      .map((cat) => ({
        ...cat,
        niveaux: cat.niveaux.filter((n) => disponibles.has(n)),
      }))
      .filter((cat) => cat.niveaux.length > 0);
  }

  function chapitresFiltres(subjectId: string, niveau: string) {
    if (niveau === "__tous__") {
      return chapitres.filter((c) => c.subject_id === subjectId).sort((a, b) => a.ordre - b.ordre);
    }
    return chapitres
      .filter((c) => c.subject_id === subjectId && c.niveau_scolaire === niveau)
      .sort((a, b) => a.ordre - b.ordre);
  }

  // ── Breadcrumb ──────────────────────
  function renderBreadcrumb() {
    const items: { label: string; onClick?: () => void }[] = [
      { label: "Contenus", onClick: () => setNav({ level: "subjects" }) },
    ];
    if (nav.level === "niveaux" || nav.level === "chapitres") {
      items.push({
        label: nomMatiere(nav.subjectId),
        onClick: nav.level === "chapitres" ? () => setNav({ level: "niveaux", subjectId: nav.subjectId }) : undefined,
      });
    }
    if (nav.level === "chapitres") {
      items.push({ label: nav.niveau === "__tous__" ? "Tous les niveaux" : nav.niveau });
    }

    return (
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} />}
            {item.onClick ? (
              <button onClick={item.onClick} className="hover:text-foreground transition-colors">
                {item.label}
              </button>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  }

  // ── Niveau 1 : Matières ─────────────
  function renderSubjects() {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Matières</h3>
          <Button onClick={() => onCreate("matiere")} size="sm" className="gap-1">
            <Plus size={14} /> Nouvelle matière
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matieres.map((m) => {
            const nbChapitres = chapitres.filter((c) => c.subject_id === m.id).length;
            return (
              <Card
                key={m.id}
                className="border-dark-border bg-dark-card cursor-pointer hover:border-muted-foreground/30 transition-colors group"
                onClick={() => setNav({ level: "niveaux", subjectId: m.id })}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{m.icon ?? "📚"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{m.nom}</p>
                    <p className="text-xs text-muted-foreground">{nbChapitres} chapitre{nbChapitres > 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit("matiere", m.id)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onDelete("matiere", m.id, m.nom)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
        {matieres.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune matière. Commencez par en créer une.</p>
        )}
      </div>
    );
  }

  // ── Niveau 2 : Niveaux scolaires (groupés par catégorie) ────
  function renderNiveaux() {
    if (nav.level !== "niveaux") return null;
    const categoriesAvecNiveaux = niveauxDisponiblesParCategorie(nav.subjectId);
    const chapitresSansNiveau = chapitres.filter((c) => c.subject_id === nav.subjectId && !c.niveau_scolaire);

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{nomMatiere(nav.subjectId)}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit("matiere", nav.subjectId)}>
              <Pencil size={14} /> Modifier
            </Button>
            <Button size="sm" className="gap-1" onClick={() => onCreate("chapitre", { subject_id: nav.subjectId })}>
              <Plus size={14} /> Nouveau chapitre
            </Button>
          </div>
        </div>

        {/* Bouton "Tous" */}
        <div className="mb-4">
          <button
            onClick={() => setNav({ level: "chapitres", subjectId: nav.subjectId, niveau: "__tous__" })}
            className="rounded-full px-4 py-1.5 text-sm font-medium border border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors"
          >
            Tous ({chapitres.filter((c) => c.subject_id === nav.subjectId).length})
          </button>
        </div>

        {/* Niveaux groupés par catégorie avec séparateurs */}
        <div className="space-y-4 mb-6">
          {categoriesAvecNiveaux.map((cat) => (
            <div key={cat.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {cat.emoji} {cat.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.niveaux.map((n) => {
                  const count = chapitres.filter((c) => c.subject_id === nav.subjectId && c.niveau_scolaire === n).length;
                  return (
                    <button
                      key={n}
                      onClick={() => setNav({ level: "chapitres", subjectId: nav.subjectId, niveau: n })}
                      className="rounded-full px-4 py-1.5 text-sm font-medium border border-dark-border bg-dark-card hover:bg-brand-vert/10 hover:text-brand-vert hover:border-brand-vert/30 transition-colors"
                    >
                      {n} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {chapitresSansNiveau.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setNav({ level: "chapitres", subjectId: nav.subjectId, niveau: "__sans_niveau__" })}
              className="rounded-full px-4 py-1.5 text-sm font-medium border border-dashed border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors text-muted-foreground"
            >
              Sans niveau ({chapitresSansNiveau.length})
            </button>
          </div>
        )}

        {categoriesAvecNiveaux.length === 0 && chapitresSansNiveau.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun chapitre pour cette matière. Créez-en un pour commencer.
          </p>
        )}
      </div>
    );
  }

  // ── Niveau 3 : Chapitres + contenu ──
  function renderChapitres() {
    if (nav.level !== "chapitres") return null;

    let liste: typeof chapitres;
    if (nav.niveau === "__sans_niveau__") {
      liste = chapitres.filter((c) => c.subject_id === nav.subjectId && !c.niveau_scolaire).sort((a, b) => a.ordre - b.ordre);
    } else {
      liste = chapitresFiltres(nav.subjectId, nav.niveau);
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">
            {nav.niveau === "__tous__" ? "Tous les chapitres" : nav.niveau === "__sans_niveau__" ? "Chapitres sans niveau" : nav.niveau}
          </h3>
          <Button size="sm" className="gap-1" onClick={() => onCreate("chapitre", { subject_id: nav.subjectId })}>
            <Plus size={14} /> Nouveau chapitre
          </Button>
        </div>

        <div className="space-y-3">
          {liste.map((ch) => {
            const ouvert = chapitreOuvert === ch.id;
            const chLecons = leconsParChapitre(ch.id);
            const chQuiz = quizParChapitre(ch.id);
            const chExo = exercicesParChapitre(ch.id);
            const chFiches = fichesParChapitre(ch.id);

            return (
              <Card key={ch.id} className="border-dark-border bg-dark-card">
                <CardContent className="p-0">
                  {/* En-tête chapitre */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-dark-elevated/50 transition-colors"
                    onClick={() => setChapitreOuvert(ouvert ? null : ch.id)}
                  >
                    {ouvert ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">#{ch.ordre}</span>
                        <span className="font-medium text-sm">{ch.titre}</span>
                        {ch.niveau_scolaire && (
                          <Badge variant="secondary" className="text-[10px]">{ch.niveau_scolaire}</Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px]">{ch.statut}</Badge>
                      </div>
                      {ch.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{ch.description}</p>
                      )}
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

                  {/* Contenu du chapitre (4 sections) */}
                  {ouvert && (
                    <div className="border-t border-dark-border divide-y divide-dark-border/50">
                      {/* Leçons */}
                      <ContentSection
                        icon={<FileText size={16} className="text-brand-vert" />}
                        label="Leçons"
                        count={chLecons.length}
                        onAdd={() => onCreate("lecon", { chapter_id: ch.id, subject_id: nav.subjectId })}
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {liste.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun chapitre pour ce niveau.</p>
        )}
      </div>
    );
  }

  // ── Rendu principal ─────────────────
  return (
    <div>
      {nav.level !== "subjects" && renderBreadcrumb()}
      {nav.level === "subjects" && renderSubjects()}
      {nav.level === "niveaux" && renderNiveaux()}
      {nav.level === "chapitres" && renderChapitres()}
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
    <div className="px-4 py-3">
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
