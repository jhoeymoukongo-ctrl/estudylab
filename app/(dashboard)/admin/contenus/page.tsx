"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import { Toast, useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, ArrowLeft, Loader2, Save, Check, X, Bot, Rocket,
} from "lucide-react";
import ArborescenceContenu from "@/components/admin/ArborescenceContenu";
import UploadZone from "@/components/admin/UploadZone";
import ModalIALecon from "@/components/admin/ModalIALecon";
import ModalIAQuiz from "@/components/admin/ModalIAQuiz";
import ModalIAExercice from "@/components/admin/ModalIAExercice";
import ModalIAFiche from "@/components/admin/ModalIAFiche";

// ═══════════════════════════════════════════
// Types locaux
// ═══════════════════════════════════════════
interface Matiere {
  id: string; nom: string; slug: string; description: string | null;
  icon: string | null; couleur: string | null; statut: string;
}
interface Chapitre {
  id: string; subject_id: string; titre: string; slug: string;
  description: string | null; ordre: number; niveau_scolaire: string | null; statut: string;
}
interface Lecon {
  id: string; chapter_id: string; titre: string; slug: string;
  contenu_markdown: string | null; niveau_difficulte: string;
  duree_minutes: number | null; source_type: string; statut: string; fichier_url: string | null;
}
interface Quiz {
  id: string; chapter_id: string | null; lesson_id: string | null;
  titre: string; description: string | null; niveau_difficulte: string;
  duree_minutes: number | null; source_type: string; statut: string;
}
interface QuestionQuiz {
  id?: string; enonce: string; explication_reponse: string;
  ordre: number; points: number;
  choix: { contenu: string; est_correcte: boolean }[];
}
interface Exercice {
  id: string; chapter_id: string; lesson_id: string | null;
  titre: string; enonce: string | null; contenu_markdown: string | null;
  corrige: string | null; niveau_difficulte: string; duree_minutes: number | null;
  type: string; source_type: string; statut: string; fichier_url: string | null;
}
interface Fiche {
  id: string; lesson_id: string | null; titre: string;
  contenu_markdown: string; source: string; statut: string; fichier_url: string | null;
}

type ContentType = "matiere" | "chapitre" | "lecon" | "quiz" | "exercice" | "fiche";
type Vue =
  | { mode: "arborescence" }
  | { mode: "form"; type: ContentType; id?: string; defaults?: Record<string, string> };

const STATUTS = ["draft", "published"];
const NIVEAUX_DIFF = ["facile", "moyen", "difficile", "expert"];
const NIVEAUX_SCOLAIRES = [
  "6ème", "5ème", "4ème", "3ème",
  "2nde Générale", "1ère Générale", "Terminale Générale",
  "Terminale — Maths", "Terminale — Physique-Chimie", "Terminale — SVT",
  "1ère STI2D", "Terminale STI2D", "1ère STMG", "Terminale STMG",
  "BTS 1ère année", "BTS 2ème année", "BUT 1ère année", "BUT 2ème année", "BUT 3ème année",
  "Licence 1", "Licence 2", "Licence 3",
];
const TYPES_EXO = ["calcul", "rédaction", "qcm", "problème", "autre"];

// ═══════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════
export default function AdminContenusPage() {
  const supabase = creerClientSupabase();
  const { toast, afficherToast, fermerToast } = useToast();

  const [vue, setVue] = useState<Vue>({ mode: "arborescence" });
  const [chargement, setChargement] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalIA, setModalIA] = useState<"lecon" | "quiz" | "exercice" | "fiche" | null>(null);
  const [generationEnCours, setGenerationEnCours] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 12, chapter: "", step: "", itemsDone: 0, totalItems: 72 });

  // Donnees
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [fiches, setFiches] = useState<Fiche[]>([]);

  // Formulaires
  const [formMatiere, setFormMatiere] = useState<Partial<Matiere>>({});
  const [formChapitre, setFormChapitre] = useState<Partial<Chapitre>>({});
  const [formLecon, setFormLecon] = useState<Partial<Lecon>>({});
  const [pointsCles, setPointsCles] = useState<string[]>([]);
  const [exemples, setExemples] = useState<{ titre: string; contenu: string; explication: string }[]>([]);
  const [matiereLecon, setMatiereLecon] = useState("");
  const [formQuiz, setFormQuiz] = useState<Partial<Quiz>>({});
  const [questions, setQuestions] = useState<QuestionQuiz[]>([]);
  const [matiereQuiz, setMatiereQuiz] = useState("");
  const [formExercice, setFormExercice] = useState<Partial<Exercice>>({});
  const [formFiche, setFormFiche] = useState<Partial<Fiche>>({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { chargerDonnees(); }, []);

  // ─── Chargement ────────────────────────
  async function chargerDonnees() {
    setChargement(true);
    const [m, ch, l, q, ex, f] = await Promise.all([
      supabase.from("subjects").select("*").eq("statut", "published").order("nom", { ascending: true }),
      supabase.from("chapters").select("*").order("ordre"),
      supabase.from("lessons").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("quizzes").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("exercises").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("revision_sheets").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    ]);
    setMatieres(m.data ?? []);
    setChapitres(ch.data ?? []);
    setLecons(l.data ?? []);
    setQuizzes(q.data ?? []);
    setExercices(ex.data ?? []);
    setFiches(f.data ?? []);
    setChargement(false);
  }

  function retourArbo() { setVue({ mode: "arborescence" }); chargerDonnees(); }
  function chapitresParMatiere(matiereId: string) { return chapitres.filter((c) => c.subject_id === matiereId); }

  // ─── Helpers arborescence ─────────────
  function leconsParChapitre(chapitreId: string) { return lecons.filter((l) => l.chapter_id === chapitreId); }
  function quizParChapitre(chapitreId: string) { return quizzes.filter((q) => q.chapter_id === chapitreId); }
  function exercicesParChapitre(chapitreId: string) { return exercices.filter((e) => e.chapter_id === chapitreId); }
  function fichesParChapitre(chapitreId: string) {
    // Fiches liees aux lecons de ce chapitre
    const leconIds = new Set(lecons.filter((l) => l.chapter_id === chapitreId).map((l) => l.id));
    return fiches.filter((f) => f.lesson_id && leconIds.has(f.lesson_id));
  }

  // ─── Suppression ──────────────────────
  async function supprimerAvecConfirm(type: ContentType, id: string, nom: string) {
    if (!confirm(`Supprimer "${nom}" ? Cette action est irréversible.`)) return;
    let erreur;
    if (type === "matiere") { const { error } = await supabase.from("subjects").delete().eq("id", id); erreur = error; }
    else if (type === "chapitre") { const { error } = await supabase.from("chapters").delete().eq("id", id); erreur = error; }
    else if (type === "lecon") { const { error } = await supabase.from("lessons").update({ deleted_at: new Date().toISOString() }).eq("id", id); erreur = error; }
    else if (type === "quiz") { const { error } = await supabase.from("quizzes").update({ deleted_at: new Date().toISOString() }).eq("id", id); erreur = error; }
    else if (type === "exercice") { const { error } = await supabase.from("exercises").update({ deleted_at: new Date().toISOString() }).eq("id", id); erreur = error; }
    else if (type === "fiche") { const { error } = await supabase.from("revision_sheets").update({ deleted_at: new Date().toISOString() }).eq("id", id); erreur = error; }

    if (erreur) { afficherToast("Erreur lors de la suppression", "error"); }
    else { afficherToast("Supprimé avec succès"); chargerDonnees(); }
  }

  // ─── Ouvertures formulaires ───────────
  function ouvrirForm(type: ContentType, id?: string, defaults?: Record<string, string>) {
    if (type === "matiere") {
      const m = id ? matieres.find((x) => x.id === id) : undefined;
      setFormMatiere(m ? { ...m } : { statut: "draft" });
    } else if (type === "chapitre") {
      const c = id ? chapitres.find((x) => x.id === id) : undefined;
      setFormChapitre(c ? { ...c } : { statut: "draft", ordre: 0, subject_id: defaults?.subject_id });
    } else if (type === "lecon") {
      ouvrirFormLecon(id, defaults);
    } else if (type === "quiz") {
      ouvrirFormQuiz(id, defaults);
    } else if (type === "exercice") {
      const ex = id ? exercices.find((x) => x.id === id) : undefined;
      setFormExercice(ex ? { ...ex } : { statut: "draft", niveau_difficulte: "moyen", type: "probleme", source_type: "interne", chapter_id: defaults?.chapter_id });
    } else if (type === "fiche") {
      const f = id ? fiches.find((x) => x.id === id) : undefined;
      setFormFiche(f ? { ...f } : { statut: "draft", source: "manuel", contenu_markdown: "" });
    }
    setVue({ mode: "form", type, id, defaults });
  }

  async function ouvrirFormLecon(id?: string, defaults?: Record<string, string>) {
    const l = id ? lecons.find((x) => x.id === id) : undefined;
    setFormLecon(l ? { ...l } : { statut: "draft", niveau_difficulte: "moyen", source_type: "interne", chapter_id: defaults?.chapter_id });
    setMatiereLecon(defaults?.subject_id ?? "");
    if (l) {
      const [pc, ex] = await Promise.all([
        supabase.from("lesson_key_points").select("contenu").eq("lesson_id", l.id).order("ordre"),
        supabase.from("lesson_examples").select("titre, contenu, explication").eq("lesson_id", l.id).order("ordre"),
      ]);
      setPointsCles(pc.data?.map((p) => p.contenu) ?? []);
      setExemples(ex.data?.map((e) => ({ titre: e.titre ?? "", contenu: e.contenu, explication: e.explication ?? "" })) ?? []);
      const ch = chapitres.find((c) => c.id === l.chapter_id);
      if (ch) setMatiereLecon(ch.subject_id);
    } else { setPointsCles([]); setExemples([]); }
  }

  async function ouvrirFormQuiz(id?: string, defaults?: Record<string, string>) {
    const q = id ? quizzes.find((x) => x.id === id) : undefined;
    setFormQuiz(q ? { ...q } : { statut: "draft", niveau_difficulte: "moyen", source_type: "interne", chapter_id: defaults?.chapter_id });
    setMatiereQuiz("");
    if (q?.id) {
      const { data: qs } = await supabase.from("quiz_questions").select("id, enonce, explication_reponse, ordre, points").eq("quiz_id", q.id).order("ordre");
      const questionsAvecChoix: QuestionQuiz[] = [];
      for (const qItem of qs ?? []) {
        const { data: choix } = await supabase.from("quiz_choices").select("contenu, est_correcte").eq("question_id", qItem.id).order("ordre");
        questionsAvecChoix.push({ ...qItem, explication_reponse: qItem.explication_reponse ?? "", choix: choix ?? [] });
      }
      setQuestions(questionsAvecChoix);
      if (q.chapter_id) { const ch = chapitres.find((c) => c.id === q.chapter_id); if (ch) setMatiereQuiz(ch.subject_id); }
    } else { setQuestions([]); }
  }

  // ═══════════════════════════════════════════
  // SAUVEGARDES
  // ═══════════════════════════════════════════
  async function sauvegarderMatiere() {
    if (!formMatiere.nom) { afficherToast("Le nom est requis", "error"); return; }
    setSaving(true);
    const data = { nom: formMatiere.nom, slug: formMatiere.slug || slugify(formMatiere.nom), description: formMatiere.description || null, icon: formMatiere.icon || null, couleur: formMatiere.couleur || null, statut: formMatiere.statut || "draft" };
    const { error } = formMatiere.id ? await supabase.from("subjects").update(data).eq("id", formMatiere.id) : await supabase.from("subjects").insert(data);
    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(formMatiere.id ? "Matière mise à jour" : "Matière créée");
    retourArbo();
  }

  async function sauvegarderChapitre() {
    if (!formChapitre.titre || !formChapitre.subject_id) { afficherToast("Titre et matière requis", "error"); return; }
    setSaving(true);
    const data = { subject_id: formChapitre.subject_id, titre: formChapitre.titre, slug: formChapitre.slug || slugify(formChapitre.titre), description: formChapitre.description || null, ordre: formChapitre.ordre ?? 0, niveau_scolaire: formChapitre.niveau_scolaire || null, statut: formChapitre.statut || "draft" };
    const { error } = formChapitre.id ? await supabase.from("chapters").update(data).eq("id", formChapitre.id) : await supabase.from("chapters").insert(data);
    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(formChapitre.id ? "Chapitre mis à jour" : "Chapitre créé");
    retourArbo();
  }

  async function sauvegarderLecon(publier = false) {
    if (!formLecon.titre || !formLecon.chapter_id) { afficherToast("Titre et chapitre requis", "error"); return; }
    setSaving(true);
    const data = { chapter_id: formLecon.chapter_id, titre: formLecon.titre, slug: formLecon.slug || slugify(formLecon.titre), contenu_markdown: formLecon.contenu_markdown || null, niveau_difficulte: formLecon.niveau_difficulte || "moyen", duree_minutes: formLecon.duree_minutes || null, source_type: formLecon.source_type || "interne", statut: publier ? "published" : (formLecon.statut || "draft"), fichier_url: formLecon.fichier_url || null };
    let leconId = formLecon.id;
    if (leconId) {
      const { error } = await supabase.from("lessons").update(data).eq("id", leconId);
      if (error) { setSaving(false); afficherToast("Erreur : " + error.message, "error"); return; }
    } else {
      const { data: inserted, error } = await supabase.from("lessons").insert(data).select("id").single();
      if (error || !inserted) { setSaving(false); afficherToast("Erreur : " + (error?.message ?? ""), "error"); return; }
      leconId = inserted.id;
    }
    if (leconId) {
      await supabase.from("lesson_key_points").delete().eq("lesson_id", leconId);
      const points = pointsCles.filter(Boolean).map((contenu, i) => ({ lesson_id: leconId, contenu, ordre: i }));
      if (points.length) await supabase.from("lesson_key_points").insert(points);
      await supabase.from("lesson_examples").delete().eq("lesson_id", leconId);
      const exs = exemples.filter((e) => e.contenu).map((e, i) => ({ lesson_id: leconId, titre: e.titre || null, contenu: e.contenu, explication: e.explication || null, ordre: i }));
      if (exs.length) await supabase.from("lesson_examples").insert(exs);
    }
    setSaving(false);
    afficherToast(publier ? "Leçon publiée" : "Leçon sauvegardée");
    retourArbo();
  }

  async function sauvegarderQuiz(publier = false) {
    if (!formQuiz.titre) { afficherToast("Titre requis", "error"); return; }
    if (questions.length === 0) { afficherToast("Ajoutez au moins une question", "error"); return; }
    setSaving(true);
    const data = { chapter_id: formQuiz.chapter_id || null, lesson_id: formQuiz.lesson_id || null, titre: formQuiz.titre, description: formQuiz.description || null, niveau_difficulte: formQuiz.niveau_difficulte || "moyen", duree_minutes: formQuiz.duree_minutes || null, source_type: formQuiz.source_type || "interne", statut: publier ? "published" : (formQuiz.statut || "draft") };
    let quizId = formQuiz.id;
    if (quizId) {
      const { error } = await supabase.from("quizzes").update(data).eq("id", quizId);
      if (error) { setSaving(false); afficherToast("Erreur : " + error.message, "error"); return; }
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
    } else {
      const { data: inserted, error } = await supabase.from("quizzes").insert(data).select("id").single();
      if (error || !inserted) { setSaving(false); afficherToast("Erreur : " + (error?.message ?? ""), "error"); return; }
      quizId = inserted.id;
    }
    for (const q of questions) {
      const { data: qInserted, error: qErr } = await supabase.from("quiz_questions").insert({ quiz_id: quizId, enonce: q.enonce, explication_reponse: q.explication_reponse, ordre: q.ordre, points: q.points }).select("id").single();
      if (qErr || !qInserted) continue;
      const choix = q.choix.map((c, i) => ({ question_id: qInserted.id, contenu: c.contenu, est_correcte: c.est_correcte, ordre: i }));
      await supabase.from("quiz_choices").insert(choix);
    }
    setSaving(false);
    afficherToast(publier ? "Quiz publié" : "Quiz sauvegardé");
    retourArbo();
  }

  async function sauvegarderExercice(publier = false) {
    if (!formExercice.titre || !formExercice.chapter_id) { afficherToast("Titre et chapitre requis", "error"); return; }
    setSaving(true);
    const data = { chapter_id: formExercice.chapter_id, lesson_id: formExercice.lesson_id || null, titre: formExercice.titre, enonce: formExercice.enonce || null, contenu_markdown: formExercice.contenu_markdown || null, corrige: formExercice.corrige || null, niveau_difficulte: formExercice.niveau_difficulte || "moyen", duree_minutes: formExercice.duree_minutes || null, type: formExercice.type || "probleme", source_type: formExercice.source_type || "interne", statut: publier ? "published" : (formExercice.statut || "draft"), fichier_url: formExercice.fichier_url || null };
    const { error } = formExercice.id ? await supabase.from("exercises").update(data).eq("id", formExercice.id) : await supabase.from("exercises").insert(data);
    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(publier ? "Exercice publié" : "Exercice sauvegardé");
    retourArbo();
  }

  async function sauvegarderFiche(publier = false) {
    if (!formFiche.titre || !formFiche.contenu_markdown) { afficherToast("Titre et contenu requis", "error"); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const data = { user_id: user?.id, lesson_id: formFiche.lesson_id || null, titre: formFiche.titre, contenu_markdown: formFiche.contenu_markdown, source: formFiche.source || "manuel", statut: publier ? "published" : (formFiche.statut || "draft"), fichier_url: formFiche.fichier_url || null };
    const { error } = formFiche.id ? await supabase.from("revision_sheets").update(data).eq("id", formFiche.id) : await supabase.from("revision_sheets").insert(data);
    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(publier ? "Fiche publiée" : "Fiche sauvegardée");
    retourArbo();
  }

  // ─── Génération de contenu initial ──────
  async function lancerGeneration() {
    if (generationEnCours) return;
    if (!confirm("Générer le contenu pédagogique initial pour toutes les matières ?\nCela prendra environ 15-20 minutes.")) return;

    setGenerationEnCours(true);
    setGenerationProgress({ current: 0, total: 12, chapter: "Démarrage...", step: "", itemsDone: 0, totalItems: 72 });

    try {
      const response = await fetch("/api/admin/generer-contenu-initial", { method: "POST" });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur serveur");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Pas de stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "progress") {
              setGenerationProgress({
                current: data.current,
                total: data.total,
                chapter: data.chapter,
                step: data.step,
                itemsDone: data.itemsDone,
                totalItems: data.totalItems,
              });
            } else if (data.type === "complete") {
              afficherToast(`Génération terminée : ${data.totalInserted} éléments créés`);
              chargerDonnees();
            } else if (data.type === "error") {
              afficherToast(`Erreur : ${data.message}`, "error");
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      afficherToast(`Erreur : ${err instanceof Error ? err.message : "Erreur inconnue"}`, "error");
    } finally {
      setGenerationEnCours(false);
    }
  }

  // ═══════════════════════════════════════════
  // FORMULAIRES
  // ═══════════════════════════════════════════
  function renderFormMatiere() {
    return (
      <div className="space-y-4">
        <button onClick={retourArbo} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formMatiere.id ? "Modifier la matière" : "Nouvelle matière"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Nom</label><Input value={formMatiere.nom ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, nom: e.target.value, slug: slugify(e.target.value) })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Slug</label><Input value={formMatiere.slug ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, slug: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium">Description</label><Textarea value={formMatiere.description ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, description: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Icone (emoji)</label><Input value={formMatiere.icon ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, icon: e.target.value })} placeholder="📐" /></div>
          <div><label className="mb-1 block text-sm font-medium">Couleur (hex)</label><Input value={formMatiere.couleur ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, couleur: e.target.value })} placeholder="#8B6FE8" /></div>
          <div><label className="mb-1 block text-sm font-medium">Statut</label><select value={formMatiere.statut ?? "draft"} onChange={(e) => setFormMatiere({ ...formMatiere, statut: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">{STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="flex gap-2"><Button onClick={sauvegarderMatiere} disabled={saving} className="gap-1"><Save size={14} /> {saving ? "Sauvegarde..." : "Sauvegarder"}</Button><Button variant="ghost" onClick={retourArbo}>Annuler</Button></div>
      </div>
    );
  }

  function renderFormChapitre() {
    return (
      <div className="space-y-4">
        <button onClick={retourArbo} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formChapitre.id ? "Modifier le chapitre" : "Nouveau chapitre"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Matière</label><select value={formChapitre.subject_id ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, subject_id: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Sélectionner...</option>{matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Niveau scolaire</label><select value={formChapitre.niveau_scolaire ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, niveau_scolaire: e.target.value || null })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Sélectionner...</option>{NIVEAUX_SCOLAIRES.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Titre</label><Input value={formChapitre.titre ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, titre: e.target.value, slug: slugify(e.target.value) })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Ordre</label><Input type="number" value={formChapitre.ordre ?? 0} onChange={(e) => setFormChapitre({ ...formChapitre, ordre: parseInt(e.target.value) || 0 })} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium">Description</label><Textarea value={formChapitre.description ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, description: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Statut</label><select value={formChapitre.statut ?? "draft"} onChange={(e) => setFormChapitre({ ...formChapitre, statut: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">{STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="flex gap-2"><Button onClick={sauvegarderChapitre} disabled={saving} className="gap-1"><Save size={14} /> {saving ? "Sauvegarde..." : "Sauvegarder"}</Button><Button variant="ghost" onClick={retourArbo}>Annuler</Button></div>
      </div>
    );
  }

  function renderFormLecon() {
    const chapitresFiltres = matiereLecon ? chapitresParMatiere(matiereLecon) : chapitres;
    return (
      <div className="space-y-4">
        <button onClick={retourArbo} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formLecon.id ? "Modifier la leçon" : "Nouvelle leçon"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Matière</label><select value={matiereLecon} onChange={(e) => { setMatiereLecon(e.target.value); setFormLecon({ ...formLecon, chapter_id: undefined }); }} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Toutes</option>{matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Chapitre</label><select value={formLecon.chapter_id ?? ""} onChange={(e) => setFormLecon({ ...formLecon, chapter_id: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Sélectionner...</option>{chapitresFiltres.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Titre</label><Input value={formLecon.titre ?? ""} onChange={(e) => setFormLecon({ ...formLecon, titre: e.target.value, slug: slugify(e.target.value) })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Difficulté</label><select value={formLecon.niveau_difficulte ?? "moyen"} onChange={(e) => setFormLecon({ ...formLecon, niveau_difficulte: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">{NIVEAUX_DIFF.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Durée (min)</label><Input type="number" value={formLecon.duree_minutes ?? ""} onChange={(e) => setFormLecon({ ...formLecon, duree_minutes: parseInt(e.target.value) || null })} /></div>
        </div>
        {/* Contenu markdown */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Contenu (Markdown)</label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setModalIA("lecon")}><Bot size={14} /> Générer avec l&apos;IA</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea value={formLecon.contenu_markdown ?? ""} onChange={(e) => setFormLecon({ ...formLecon, contenu_markdown: e.target.value })} rows={16} className="font-mono text-xs" placeholder="# Titre..." />
            <div className="rounded-lg border border-dark-border bg-dark-elevated p-4 overflow-y-auto max-h-[400px] prose prose-invert prose-sm"><div className="whitespace-pre-wrap text-sm text-muted-foreground">{formLecon.contenu_markdown || "Aperçu..."}</div></div>
          </div>
        </div>
        {/* Fichier joint */}
        <div><label className="mb-1 block text-sm font-medium">Fichier joint</label><UploadZone bucket="contenus-admin" folder="lecons" value={formLecon.fichier_url ?? null} onChange={(url) => setFormLecon({ ...formLecon, fichier_url: url })} /></div>
        {/* Points clés */}
        <div>
          <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Points clés</label><Button variant="ghost" size="sm" onClick={() => setPointsCles([...pointsCles, ""])} className="gap-1"><Plus size={14} /> Ajouter</Button></div>
          <div className="space-y-2">{pointsCles.map((p, i) => (<div key={i} className="flex gap-2"><Input value={p} onChange={(e) => { const copy = [...pointsCles]; copy[i] = e.target.value; setPointsCles(copy); }} placeholder="Point clé..." /><Button variant="ghost" size="icon-sm" onClick={() => setPointsCles(pointsCles.filter((_, j) => j !== i))}><X size={14} /></Button></div>))}</div>
        </div>
        {/* Exemples */}
        <div>
          <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Exemples</label><Button variant="ghost" size="sm" onClick={() => setExemples([...exemples, { titre: "", contenu: "", explication: "" }])} className="gap-1"><Plus size={14} /> Ajouter</Button></div>
          <div className="space-y-3">{exemples.map((ex, i) => (<Card key={i} className="border-dark-border bg-dark-elevated"><CardContent className="p-3 space-y-2"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">Exemple {i + 1}</span><Button variant="ghost" size="icon-xs" onClick={() => setExemples(exemples.filter((_, j) => j !== i))}><X size={12} /></Button></div><Input placeholder="Titre" value={ex.titre} onChange={(e) => { const copy = [...exemples]; copy[i].titre = e.target.value; setExemples(copy); }} /><Textarea placeholder="Contenu" value={ex.contenu} onChange={(e) => { const copy = [...exemples]; copy[i].contenu = e.target.value; setExemples(copy); }} rows={2} /><Input placeholder="Explication" value={ex.explication} onChange={(e) => { const copy = [...exemples]; copy[i].explication = e.target.value; setExemples(copy); }} /></CardContent></Card>))}</div>
        </div>
        <div className="flex gap-2"><Button onClick={() => sauvegarderLecon(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button><Button onClick={() => sauvegarderLecon(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button><Button variant="ghost" onClick={retourArbo}>Annuler</Button></div>
      </div>
    );
  }

  function renderFormQuiz() {
    const chapitresFiltres = matiereQuiz ? chapitresParMatiere(matiereQuiz) : chapitres;
    return (
      <div className="space-y-4">
        <button onClick={retourArbo} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formQuiz.id ? "Modifier le quiz" : "Nouveau quiz"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Matière</label><select value={matiereQuiz} onChange={(e) => { setMatiereQuiz(e.target.value); setFormQuiz({ ...formQuiz, chapter_id: undefined }); }} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Toutes</option>{matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Chapitre</label><select value={formQuiz.chapter_id ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, chapter_id: e.target.value || null })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Aucun</option>{chapitresFiltres.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Titre</label><Input value={formQuiz.titre ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, titre: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Difficulté</label><select value={formQuiz.niveau_difficulte ?? "moyen"} onChange={(e) => setFormQuiz({ ...formQuiz, niveau_difficulte: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">{NIVEAUX_DIFF.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium">Description</label><Textarea value={formQuiz.description ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, description: e.target.value })} /></div>
        </div>
        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Questions ({questions.length})</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setModalIA("quiz")}><Bot size={14} /> Générer IA</Button>
              <Button variant="ghost" size="sm" onClick={() => setQuestions([...questions, { enonce: "", explication_reponse: "", ordre: questions.length, points: 1, choix: [{ contenu: "", est_correcte: true }, { contenu: "", est_correcte: false }, { contenu: "", est_correcte: false }, { contenu: "", est_correcte: false }] }])} className="gap-1"><Plus size={14} /> Question</Button>
            </div>
          </div>
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <Card key={qi} className="border-dark-border bg-dark-elevated"><CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground">Question {qi + 1}</span><Button variant="ghost" size="icon-xs" onClick={() => setQuestions(questions.filter((_, j) => j !== qi))}><X size={14} className="text-destructive" /></Button></div>
                <Textarea placeholder="Enonce" value={q.enonce} onChange={(e) => { const copy = [...questions]; copy[qi].enonce = e.target.value; setQuestions(copy); }} rows={2} />
                <div className="grid gap-2 sm:grid-cols-2">{q.choix.map((c, ci) => (<div key={ci} className="flex items-center gap-2"><input type="radio" name={`q-${qi}`} checked={c.est_correcte} onChange={() => { const copy = [...questions]; copy[qi].choix = copy[qi].choix.map((ch, k) => ({ ...ch, est_correcte: k === ci })); setQuestions(copy); }} className="accent-brand-vert" /><Input value={c.contenu} onChange={(e) => { const copy = [...questions]; copy[qi].choix[ci].contenu = e.target.value; setQuestions(copy); }} placeholder={`Choix ${ci + 1}`} className={c.est_correcte ? "border-brand-vert/50" : ""} /></div>))}</div>
                <Input placeholder="Explication de la bonne réponse" value={q.explication_reponse} onChange={(e) => { const copy = [...questions]; copy[qi].explication_reponse = e.target.value; setQuestions(copy); }} />
              </CardContent></Card>
            ))}
          </div>
        </div>
        <div className="flex gap-2"><Button onClick={() => sauvegarderQuiz(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button><Button onClick={() => sauvegarderQuiz(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button><Button variant="ghost" onClick={retourArbo}>Annuler</Button></div>
      </div>
    );
  }

  function renderFormExercice() {
    return (
      <div className="space-y-4">
        <button onClick={retourArbo} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formExercice.id ? "Modifier l'exercice" : "Nouvel exercice"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Titre</label><Input value={formExercice.titre ?? ""} onChange={(e) => setFormExercice({ ...formExercice, titre: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Type</label><select value={formExercice.type ?? "probleme"} onChange={(e) => setFormExercice({ ...formExercice, type: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">{TYPES_EXO.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Difficulté</label><select value={formExercice.niveau_difficulte ?? "moyen"} onChange={(e) => setFormExercice({ ...formExercice, niveau_difficulte: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">{NIVEAUX_DIFF.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium">Durée (min)</label><Input type="number" value={formExercice.duree_minutes ?? ""} onChange={(e) => setFormExercice({ ...formExercice, duree_minutes: parseInt(e.target.value) || null })} /></div>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Enonce</label><Textarea value={formExercice.enonce ?? ""} onChange={(e) => setFormExercice({ ...formExercice, enonce: e.target.value })} rows={4} placeholder="Énoncé de l'exercice..." /></div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Corrigé</label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setModalIA("exercice")}><Bot size={14} /> Générer avec l&apos;IA</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea value={formExercice.corrige ?? ""} onChange={(e) => setFormExercice({ ...formExercice, corrige: e.target.value })} rows={10} className="font-mono text-xs" placeholder="Correction détaillée..." />
            <div className="rounded-lg border border-dark-border bg-dark-elevated p-4 overflow-y-auto max-h-[300px] prose prose-invert prose-sm"><div className="whitespace-pre-wrap text-sm text-muted-foreground">{formExercice.corrige || "Aperçu du corrigé..."}</div></div>
          </div>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Fichier joint</label><UploadZone bucket="contenus-admin" folder="exercices" value={formExercice.fichier_url ?? null} onChange={(url) => setFormExercice({ ...formExercice, fichier_url: url })} /></div>
        <div className="flex gap-2"><Button onClick={() => sauvegarderExercice(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button><Button onClick={() => sauvegarderExercice(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button><Button variant="ghost" onClick={retourArbo}>Annuler</Button></div>
      </div>
    );
  }

  function renderFormFiche() {
    return (
      <div className="space-y-4">
        <button onClick={retourArbo} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formFiche.id ? "Modifier la fiche" : "Nouvelle fiche de révision"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium">Titre</label><Input value={formFiche.titre ?? ""} onChange={(e) => setFormFiche({ ...formFiche, titre: e.target.value })} /></div>
          <div><label className="mb-1 block text-sm font-medium">Leçon liée (optionnel)</label><select value={formFiche.lesson_id ?? ""} onChange={(e) => setFormFiche({ ...formFiche, lesson_id: e.target.value || null })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm"><option value="">Aucune</option>{lecons.map((l) => <option key={l.id} value={l.id}>{l.titre}</option>)}</select></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Contenu (Markdown)</label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setModalIA("fiche")}><Bot size={14} /> Générer avec l&apos;IA</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea value={formFiche.contenu_markdown ?? ""} onChange={(e) => setFormFiche({ ...formFiche, contenu_markdown: e.target.value })} rows={16} className="font-mono text-xs" placeholder="# Fiche de révision..." />
            <div className="rounded-lg border border-dark-border bg-dark-elevated p-4 overflow-y-auto max-h-[400px] prose prose-invert prose-sm"><div className="whitespace-pre-wrap text-sm text-muted-foreground">{formFiche.contenu_markdown || "Aperçu..."}</div></div>
          </div>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Fichier joint</label><UploadZone bucket="contenus-admin" folder="fiches" value={formFiche.fichier_url ?? null} onChange={(url) => setFormFiche({ ...formFiche, fichier_url: url })} /></div>
        <div className="flex gap-2"><Button onClick={() => sauvegarderFiche(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button><Button onClick={() => sauvegarderFiche(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button><Button variant="ghost" onClick={retourArbo}>Annuler</Button></div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════════════════
  if (chargement) {
    return (<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-vert" size={28} /></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestion du contenu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Arborescence : Niveau → Matière → Chapitre → Contenu</p>
        </div>
        {vue.mode === "arborescence" && (
          <Button onClick={lancerGeneration} disabled={generationEnCours} className="gap-2 shrink-0">
            {generationEnCours ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            {generationEnCours ? "Génération..." : "Générer le contenu initial"}
          </Button>
        )}
      </div>

      {/* Barre de progression */}
      {generationEnCours && (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{generationProgress.chapter}</span>
              <span className="text-muted-foreground">{generationProgress.current}/{generationProgress.total} chapitres</span>
            </div>
            <div className="h-2 rounded-full bg-dark-elevated overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-vert transition-all duration-500"
                style={{ width: `${Math.round((generationProgress.current / generationProgress.total) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{generationProgress.step}</p>
          </CardContent>
        </Card>
      )}

      {/* Arborescence ou formulaire */}
      {vue.mode === "arborescence" && (
        <ArborescenceContenu
          matieres={matieres}
          chapitres={chapitres}
          lecons={lecons}
          quizzes={quizzes}
          exercices={exercices}
          fiches={fiches}
          leconsParChapitre={leconsParChapitre}
          quizParChapitre={quizParChapitre}
          exercicesParChapitre={exercicesParChapitre}
          fichesParChapitre={fichesParChapitre}
          onCreate={(type, defaults) => ouvrirForm(type, undefined, defaults)}
          onEdit={(type, id) => ouvrirForm(type, id)}
          onDelete={supprimerAvecConfirm}
          onOpenIA={(type) => setModalIA(type)}
        />
      )}

      {vue.mode === "form" && vue.type === "matiere" && renderFormMatiere()}
      {vue.mode === "form" && vue.type === "chapitre" && renderFormChapitre()}
      {vue.mode === "form" && vue.type === "lecon" && renderFormLecon()}
      {vue.mode === "form" && vue.type === "quiz" && renderFormQuiz()}
      {vue.mode === "form" && vue.type === "exercice" && renderFormExercice()}
      {vue.mode === "form" && vue.type === "fiche" && renderFormFiche()}

      {/* Modals IA */}
      <ModalIALecon open={modalIA === "lecon"} onOpenChange={(o) => !o && setModalIA(null)} onGenerated={(contenu) => { setFormLecon((f) => ({ ...f, contenu_markdown: contenu, source_type: "ia" })); afficherToast("Contenu généré par l'IA"); }} />
      <ModalIAQuiz open={modalIA === "quiz"} onOpenChange={(o) => !o && setModalIA(null)} onGenerated={(titre, qs) => { const mapped = qs.map((q, i) => ({ enonce: q.enonce, explication_reponse: q.explication || "", ordre: i, points: 1, choix: q.choix || [] })); setQuestions(mapped); setFormQuiz((f) => ({ ...f, titre: f.titre || titre, source_type: "ia" })); afficherToast(`${mapped.length} questions générées`); }} />
      <ModalIAExercice open={modalIA === "exercice"} onOpenChange={(o) => !o && setModalIA(null)} onGenerated={(exos) => { if (exos.length > 0) { setFormExercice((f) => ({ ...f, titre: f.titre || exos[0].titre, enonce: exos[0].enonce, corrige: exos[0].corrige, type: exos[0].type || "probleme", source_type: "ia" })); } afficherToast(`${exos.length} exercice(s) généré(s)`); }} />
      <ModalIAFiche open={modalIA === "fiche"} onOpenChange={(o) => !o && setModalIA(null)} onGenerated={(contenu) => { setFormFiche((f) => ({ ...f, contenu_markdown: contenu, source: "ia" })); afficherToast("Fiche générée par l'IA"); }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={fermerToast} />}
    </div>
  );
}
