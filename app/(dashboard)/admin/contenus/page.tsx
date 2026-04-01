"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils/slugify";
import { Toast, useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, FileText, Brain, Plus, Pencil, Trash2, ArrowLeft,
  Loader2, Save, Check, X, Bot,
} from "lucide-react";

// ═══════════════════════════════════════════
// Types locaux
// ═══════════════════════════════════════════
interface Matiere {
  id: string; nom: string; slug: string; description: string | null;
  icon: string | null; couleur: string | null; statut: string;
}
interface Chapitre {
  id: string; subject_id: string; titre: string; slug: string;
  description: string | null; ordre: number; statut: string;
}
interface Lecon {
  id: string; chapter_id: string; titre: string; slug: string;
  contenu_markdown: string | null; niveau_difficulte: string;
  duree_minutes: number | null; source_type: string; statut: string;
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
interface Fiche {
  id: string; lesson_id: string | null; titre: string;
  contenu_markdown: string; source: string; statut: string;
}

type Onglet = "matieres" | "lecons" | "quiz" | "fiches";
type Vue = "liste" | "form-matiere" | "form-chapitre" | "form-lecon" | "form-quiz" | "form-fiche";

const STATUTS = ["draft", "published"];
const NIVEAUX = ["facile", "moyen", "difficile", "expert"];

// ═══════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════
export default function AdminContenusPage() {
  const supabase = creerClientSupabase();
  const { toast, afficherToast, fermerToast } = useToast();

  const [onglet, setOnglet] = useState<Onglet>("matieres");
  const [vue, setVue] = useState<Vue>("liste");
  const [chargement, setChargement] = useState(true);
  const [saving, setSaving] = useState(false);

  // Données
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [fiches, setFiches] = useState<Fiche[]>([]);

  // Formulaire matière
  const [formMatiere, setFormMatiere] = useState<Partial<Matiere>>({});
  // Formulaire chapitre
  const [formChapitre, setFormChapitre] = useState<Partial<Chapitre>>({});
  // Formulaire leçon
  const [formLecon, setFormLecon] = useState<Partial<Lecon>>({});
  const [pointsCles, setPointsCles] = useState<string[]>([]);
  const [exemples, setExemples] = useState<{ titre: string; contenu: string; explication: string }[]>([]);
  const [matiereLecon, setMatiereLecon] = useState("");
  // Formulaire quiz
  const [formQuiz, setFormQuiz] = useState<Partial<Quiz>>({});
  const [questions, setQuestions] = useState<QuestionQuiz[]>([]);
  const [matiereQuiz, setMatiereQuiz] = useState("");
  // Formulaire fiche
  const [formFiche, setFormFiche] = useState<Partial<Fiche>>({});
  // Modal IA
  const [modalIA, setModalIA] = useState(false);
  const [iaNotion, setIaNotion] = useState("");
  const [iaMatiere, setIaMatiere] = useState("");
  const [iaNiveau, setIaNiveau] = useState("moyen");
  const [iaChargement, setIaChargement] = useState(false);
  const [iaType, setIaType] = useState<"lecon" | "quiz" | "fiche">("lecon");

  // Charger les données
  async function chargerDonnees() {
    setChargement(true);
    const [m, ch, l, q, f] = await Promise.all([
      supabase.from("subjects").select("*").order("nom"),
      supabase.from("chapters").select("*").order("ordre"),
      supabase.from("lessons").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("quizzes").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("revision_sheets").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    ]);
    setMatieres(m.data ?? []);
    setChapitres(ch.data ?? []);
    setLecons(l.data ?? []);
    setQuizzes(q.data ?? []);
    setFiches(f.data ?? []);
    setChargement(false);
  }

  useEffect(() => { chargerDonnees(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // ─── Helpers ───────────────────────────────
  function retourListe() {
    setVue("liste");
    chargerDonnees();
  }

  function chapitresParMatiere(matiereId: string) {
    return chapitres.filter((c) => c.subject_id === matiereId);
  }

  function nomMatiere(id: string) {
    return matieres.find((m) => m.id === id)?.nom ?? "—";
  }

  // ─── Confirmation suppression ──────────────
  async function supprimerAvecConfirm(type: string, id: string, nom: string) {
    if (!confirm(`Supprimer "${nom}" ? Cette action est irréversible.`)) return;

    let erreur;
    if (type === "matiere") {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      erreur = error;
    } else if (type === "chapitre") {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      erreur = error;
    } else if (type === "lecon") {
      const { error } = await supabase.from("lessons").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      erreur = error;
    } else if (type === "quiz") {
      const { error } = await supabase.from("quizzes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      erreur = error;
    } else if (type === "fiche") {
      const { error } = await supabase.from("revision_sheets").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      erreur = error;
    }

    if (erreur) {
      afficherToast("Erreur lors de la suppression", "error");
    } else {
      afficherToast("Supprimé avec succès");
      chargerDonnees();
    }
  }

  // ═══════════════════════════════════════════
  // SAUVEGARDES
  // ═══════════════════════════════════════════
  async function sauvegarderMatiere() {
    if (!formMatiere.nom) { afficherToast("Le nom est requis", "error"); return; }
    setSaving(true);
    const data = {
      nom: formMatiere.nom,
      slug: formMatiere.slug || slugify(formMatiere.nom),
      description: formMatiere.description || null,
      icon: formMatiere.icon || null,
      couleur: formMatiere.couleur || null,
      statut: formMatiere.statut || "draft",
    };

    const { error } = formMatiere.id
      ? await supabase.from("subjects").update(data).eq("id", formMatiere.id)
      : await supabase.from("subjects").insert(data);

    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(formMatiere.id ? "Matière mise à jour" : "Matière créée");
    retourListe();
  }

  async function sauvegarderChapitre() {
    if (!formChapitre.titre || !formChapitre.subject_id) {
      afficherToast("Titre et matière requis", "error"); return;
    }
    setSaving(true);
    const data = {
      subject_id: formChapitre.subject_id,
      titre: formChapitre.titre,
      slug: formChapitre.slug || slugify(formChapitre.titre),
      description: formChapitre.description || null,
      ordre: formChapitre.ordre ?? 0,
      statut: formChapitre.statut || "draft",
    };

    const { error } = formChapitre.id
      ? await supabase.from("chapters").update(data).eq("id", formChapitre.id)
      : await supabase.from("chapters").insert(data);

    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(formChapitre.id ? "Chapitre mis à jour" : "Chapitre créé");
    retourListe();
  }

  async function sauvegarderLecon(publier = false) {
    if (!formLecon.titre || !formLecon.chapter_id) {
      afficherToast("Titre et chapitre requis", "error"); return;
    }
    setSaving(true);
    const data = {
      chapter_id: formLecon.chapter_id,
      titre: formLecon.titre,
      slug: formLecon.slug || slugify(formLecon.titre),
      contenu_markdown: formLecon.contenu_markdown || null,
      niveau_difficulte: formLecon.niveau_difficulte || "moyen",
      duree_minutes: formLecon.duree_minutes || null,
      source_type: formLecon.source_type || "interne",
      statut: publier ? "published" : (formLecon.statut || "draft"),
    };

    let leconId = formLecon.id;
    if (leconId) {
      const { error } = await supabase.from("lessons").update(data).eq("id", leconId);
      if (error) { setSaving(false); afficherToast("Erreur : " + error.message, "error"); return; }
    } else {
      const { data: inserted, error } = await supabase.from("lessons").insert(data).select("id").single();
      if (error || !inserted) { setSaving(false); afficherToast("Erreur : " + (error?.message ?? ""), "error"); return; }
      leconId = inserted.id;
    }

    // Sauvegarder les points clés
    if (leconId) {
      await supabase.from("lesson_key_points").delete().eq("lesson_id", leconId);
      const points = pointsCles.filter(Boolean).map((contenu, i) => ({
        lesson_id: leconId, contenu, ordre: i,
      }));
      if (points.length) await supabase.from("lesson_key_points").insert(points);

      // Sauvegarder les exemples
      await supabase.from("lesson_examples").delete().eq("lesson_id", leconId);
      const exs = exemples.filter((e) => e.contenu).map((e, i) => ({
        lesson_id: leconId, titre: e.titre || null, contenu: e.contenu,
        explication: e.explication || null, ordre: i,
      }));
      if (exs.length) await supabase.from("lesson_examples").insert(exs);
    }

    setSaving(false);
    afficherToast(publier ? "Leçon publiée" : "Leçon sauvegardée");
    retourListe();
  }

  async function sauvegarderQuiz(publier = false) {
    if (!formQuiz.titre) { afficherToast("Titre requis", "error"); return; }
    if (questions.length === 0) { afficherToast("Ajoutez au moins une question", "error"); return; }
    setSaving(true);

    const data = {
      chapter_id: formQuiz.chapter_id || null,
      lesson_id: formQuiz.lesson_id || null,
      titre: formQuiz.titre,
      description: formQuiz.description || null,
      niveau_difficulte: formQuiz.niveau_difficulte || "moyen",
      duree_minutes: formQuiz.duree_minutes || null,
      source_type: formQuiz.source_type || "interne",
      statut: publier ? "published" : (formQuiz.statut || "draft"),
    };

    let quizId = formQuiz.id;
    if (quizId) {
      const { error } = await supabase.from("quizzes").update(data).eq("id", quizId);
      if (error) { setSaving(false); afficherToast("Erreur : " + error.message, "error"); return; }
      // Supprimer les anciennes questions
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
    } else {
      const { data: inserted, error } = await supabase.from("quizzes").insert(data).select("id").single();
      if (error || !inserted) { setSaving(false); afficherToast("Erreur : " + (error?.message ?? ""), "error"); return; }
      quizId = inserted.id;
    }

    // Insérer les questions et choix
    for (const q of questions) {
      const { data: qInserted, error: qErr } = await supabase
        .from("quiz_questions")
        .insert({ quiz_id: quizId, enonce: q.enonce, explication_reponse: q.explication_reponse, ordre: q.ordre, points: q.points })
        .select("id").single();
      if (qErr || !qInserted) continue;
      const choix = q.choix.map((c, i) => ({
        question_id: qInserted.id, contenu: c.contenu, est_correcte: c.est_correcte, ordre: i,
      }));
      await supabase.from("quiz_choices").insert(choix);
    }

    setSaving(false);
    afficherToast(publier ? "Quiz publié" : "Quiz sauvegardé");
    retourListe();
  }

  async function sauvegarderFiche(publier = false) {
    if (!formFiche.titre || !formFiche.contenu_markdown) {
      afficherToast("Titre et contenu requis", "error"); return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const data = {
      user_id: user?.id,
      lesson_id: formFiche.lesson_id || null,
      titre: formFiche.titre,
      contenu_markdown: formFiche.contenu_markdown,
      source: formFiche.source || "manuel",
      statut: publier ? "published" : (formFiche.statut || "draft"),
    };

    const { error } = formFiche.id
      ? await supabase.from("revision_sheets").update(data).eq("id", formFiche.id)
      : await supabase.from("revision_sheets").insert(data);

    setSaving(false);
    if (error) { afficherToast("Erreur : " + error.message, "error"); return; }
    afficherToast(publier ? "Fiche publiée" : "Fiche sauvegardée");
    retourListe();
  }

  // ─── Génération IA ─────────────────────────
  async function genererAvecIA() {
    if (!iaNotion) { afficherToast("Précisez une notion", "error"); return; }
    setIaChargement(true);

    try {
      if (iaType === "lecon") {
        const res = await fetch("/api/ai/expliquer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notion: iaNotion, matiere: iaMatiere, niveau: iaNiveau }),
        });
        const data = await res.json();
        if (data.contenu) {
          setFormLecon((f) => ({ ...f, contenu_markdown: data.contenu, source_type: "ia" }));
          afficherToast("Contenu généré par l'IA");
        } else {
          afficherToast("Erreur IA", "error");
        }
      } else if (iaType === "quiz") {
        const res = await fetch("/api/ai/generer-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notion: iaNotion, matiere: iaMatiere, niveau: iaNiveau }),
        });
        const data = await res.json();
        if (data.questions) {
          const qs: QuestionQuiz[] = data.questions.map((q: { enonce: string; explication: string; choix: { contenu: string; est_correcte: boolean }[] }, i: number) => ({
            enonce: q.enonce,
            explication_reponse: q.explication || "",
            ordre: i,
            points: 1,
            choix: q.choix || [],
          }));
          setQuestions(qs);
          if (data.titre) setFormQuiz((f) => ({ ...f, titre: f.titre || data.titre, source_type: "ia" }));
          afficherToast(`${qs.length} questions générées par l'IA`);
        } else {
          afficherToast("Erreur IA : " + (data.error || ""), "error");
        }
      } else if (iaType === "fiche") {
        const res = await fetch("/api/ai/generer-fiche", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notion: iaNotion, matiere: iaMatiere, niveau: iaNiveau }),
        });
        const data = await res.json();
        if (data.contenu) {
          setFormFiche((f) => ({ ...f, contenu_markdown: data.contenu, source: "ia" }));
          afficherToast("Fiche générée par l'IA");
        } else {
          afficherToast("Erreur IA", "error");
        }
      }
    } catch {
      afficherToast("Erreur de connexion IA", "error");
    }

    setIaChargement(false);
    setModalIA(false);
  }

  // ═══════════════════════════════════════════
  // OUVERTURE FORMULAIRES
  // ═══════════════════════════════════════════
  function ouvrirFormMatiere(m?: Matiere) {
    setFormMatiere(m ? { ...m } : { statut: "draft" });
    setVue("form-matiere");
  }
  function ouvrirFormChapitre(c?: Chapitre) {
    setFormChapitre(c ? { ...c } : { statut: "draft", ordre: 0 });
    setVue("form-chapitre");
  }
  async function ouvrirFormLecon(l?: Lecon) {
    setFormLecon(l ? { ...l } : { statut: "draft", niveau_difficulte: "moyen", source_type: "interne" });
    setMatiereLecon("");
    if (l) {
      // Charger points clés et exemples
      const [pc, ex] = await Promise.all([
        supabase.from("lesson_key_points").select("contenu").eq("lesson_id", l.id).order("ordre"),
        supabase.from("lesson_examples").select("titre, contenu, explication").eq("lesson_id", l.id).order("ordre"),
      ]);
      setPointsCles(pc.data?.map((p) => p.contenu) ?? []);
      setExemples(ex.data?.map((e) => ({ titre: e.titre ?? "", contenu: e.contenu, explication: e.explication ?? "" })) ?? []);
      // Trouver la matière du chapitre
      const ch = chapitres.find((c) => c.id === l.chapter_id);
      if (ch) setMatiereLecon(ch.subject_id);
    } else {
      setPointsCles([]);
      setExemples([]);
    }
    setVue("form-lecon");
  }
  async function ouvrirFormQuiz(q?: Quiz) {
    setFormQuiz(q ? { ...q } : { statut: "draft", niveau_difficulte: "moyen", source_type: "interne" });
    setMatiereQuiz("");
    if (q?.id) {
      const { data: qs } = await supabase
        .from("quiz_questions")
        .select("id, enonce, explication_reponse, ordre, points")
        .eq("quiz_id", q.id)
        .order("ordre");
      const questionsAvecChoix: QuestionQuiz[] = [];
      for (const qItem of qs ?? []) {
        const { data: choix } = await supabase
          .from("quiz_choices")
          .select("contenu, est_correcte")
          .eq("question_id", qItem.id)
          .order("ordre");
        questionsAvecChoix.push({ ...qItem, explication_reponse: qItem.explication_reponse ?? "", choix: choix ?? [] });
      }
      setQuestions(questionsAvecChoix);
      if (q.chapter_id) {
        const ch = chapitres.find((c) => c.id === q.chapter_id);
        if (ch) setMatiereQuiz(ch.subject_id);
      }
    } else {
      setQuestions([]);
    }
    setVue("form-quiz");
  }
  function ouvrirFormFiche(f?: Fiche) {
    setFormFiche(f ? { ...f } : { statut: "draft", source: "manuel", contenu_markdown: "" });
    setVue("form-fiche");
  }

  // ═══════════════════════════════════════════
  // RENDU — Modal IA
  // ═══════════════════════════════════════════
  function renderModalIA() {
    if (!modalIA) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={() => !iaChargement && setModalIA(false)} />
        <Card className="relative z-10 w-full max-w-md border-dark-border bg-dark-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Bot size={20} className="text-brand-vert" /> Générer avec l&apos;IA
            </h3>
            <div>
              <label className="mb-1 block text-sm font-medium">Notion à traiter</label>
              <Input value={iaNotion} onChange={(e) => setIaNotion(e.target.value)} placeholder="Ex: théorème de Pythagore" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Matière</label>
              <Input value={iaMatiere} onChange={(e) => setIaMatiere(e.target.value)} placeholder="Ex: Mathématiques" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Niveau</label>
              <select value={iaNiveau} onChange={(e) => setIaNiveau(e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalIA(false)} disabled={iaChargement}>Annuler</Button>
              <Button onClick={genererAvecIA} disabled={iaChargement}>
                {iaChargement && <Loader2 size={16} className="animate-spin" />}
                {iaChargement ? "Génération..." : "Générer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDU — Listes
  // ═══════════════════════════════════════════
  function renderListeMatieres() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Matières & Chapitres</h3>
          <div className="flex gap-2">
            <Button onClick={() => ouvrirFormChapitre()} variant="outline" size="sm" className="gap-1"><Plus size={14} /> Chapitre</Button>
            <Button onClick={() => ouvrirFormMatiere()} size="sm" className="gap-1"><Plus size={14} /> Matière</Button>
          </div>
        </div>
        {matieres.map((m) => (
          <Card key={m.id} className="border-dark-border bg-dark-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{m.icon ?? "📚"}</span>
                  <span className="font-semibold">{m.nom}</span>
                  <Badge variant="secondary" className="text-xs">{m.statut}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => ouvrirFormMatiere(m)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => supprimerAvecConfirm("matiere", m.id, m.nom)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </div>
              <div className="ml-6 space-y-1">
                {chapitresParMatiere(m.id).map((ch) => (
                  <div key={ch.id} className="flex items-center justify-between rounded-lg px-3 py-1.5 hover:bg-dark-elevated">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{ch.ordre}</span>
                      <span className="text-sm">{ch.titre}</span>
                      <Badge variant="secondary" className="text-xs">{ch.statut}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={() => ouvrirFormChapitre(ch)}><Pencil size={12} /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => supprimerAvecConfirm("chapitre", ch.id, ch.titre)}><Trash2 size={12} className="text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {chapitresParMatiere(m.id).length === 0 && (
                  <p className="text-xs text-muted-foreground ml-3">Aucun chapitre</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderListeLecons() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Leçons</h3>
          <Button onClick={() => ouvrirFormLecon()} size="sm" className="gap-1"><Plus size={14} /> Leçon</Button>
        </div>
        {lecons.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl border border-dark-border bg-dark-card px-4 py-3">
            <div>
              <p className="text-sm font-medium">{l.titre}</p>
              <p className="text-xs text-muted-foreground">{nomMatiere(chapitres.find((c) => c.id === l.chapter_id)?.subject_id ?? "")} · {l.niveau_difficulte} · <Badge variant="secondary" className="text-xs">{l.statut}</Badge></p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => ouvrirFormLecon(l)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => supprimerAvecConfirm("lecon", l.id, l.titre)}><Trash2 size={14} className="text-destructive" /></Button>
            </div>
          </div>
        ))}
        {lecons.length === 0 && <p className="text-sm text-muted-foreground">Aucune leçon.</p>}
      </div>
    );
  }

  function renderListeQuiz() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Quiz</h3>
          <Button onClick={() => ouvrirFormQuiz()} size="sm" className="gap-1"><Plus size={14} /> Quiz</Button>
        </div>
        {quizzes.map((q) => (
          <div key={q.id} className="flex items-center justify-between rounded-xl border border-dark-border bg-dark-card px-4 py-3">
            <div>
              <p className="text-sm font-medium">{q.titre}</p>
              <p className="text-xs text-muted-foreground">{q.niveau_difficulte} · {q.source_type} · <Badge variant="secondary" className="text-xs">{q.statut}</Badge></p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => ouvrirFormQuiz(q)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => supprimerAvecConfirm("quiz", q.id, q.titre)}><Trash2 size={14} className="text-destructive" /></Button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && <p className="text-sm text-muted-foreground">Aucun quiz.</p>}
      </div>
    );
  }

  function renderListeFiches() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Fiches de révision</h3>
          <Button onClick={() => ouvrirFormFiche()} size="sm" className="gap-1"><Plus size={14} /> Fiche</Button>
        </div>
        {fiches.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl border border-dark-border bg-dark-card px-4 py-3">
            <div>
              <p className="text-sm font-medium">{f.titre}</p>
              <p className="text-xs text-muted-foreground">{f.source} · <Badge variant="secondary" className="text-xs">{f.statut}</Badge></p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => ouvrirFormFiche(f)}><Pencil size={14} /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => supprimerAvecConfirm("fiche", f.id, f.titre)}><Trash2 size={14} className="text-destructive" /></Button>
            </div>
          </div>
        ))}
        {fiches.length === 0 && <p className="text-sm text-muted-foreground">Aucune fiche.</p>}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDU — Formulaires
  // ═══════════════════════════════════════════
  function renderFormMatiere() {
    return (
      <div className="space-y-4">
        <button onClick={retourListe} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formMatiere.id ? "Modifier la matière" : "Nouvelle matière"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <Input value={formMatiere.nom ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, nom: e.target.value, slug: slugify(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <Input value={formMatiere.slug ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, slug: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea value={formMatiere.description ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, description: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Icône (emoji)</label>
            <Input value={formMatiere.icon ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, icon: e.target.value })} placeholder="📐" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Couleur (hex)</label>
            <Input value={formMatiere.couleur ?? ""} onChange={(e) => setFormMatiere({ ...formMatiere, couleur: e.target.value })} placeholder="#8B6FE8" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Statut</label>
            <select value={formMatiere.statut ?? "draft"} onChange={(e) => setFormMatiere({ ...formMatiere, statut: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={sauvegarderMatiere} disabled={saving} className="gap-1"><Save size={14} /> {saving ? "Sauvegarde..." : "Sauvegarder"}</Button>
          <Button variant="ghost" onClick={retourListe}>Annuler</Button>
        </div>
      </div>
    );
  }

  function renderFormChapitre() {
    return (
      <div className="space-y-4">
        <button onClick={retourListe} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formChapitre.id ? "Modifier le chapitre" : "Nouveau chapitre"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Matière</label>
            <select value={formChapitre.subject_id ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, subject_id: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              <option value="">Sélectionner...</option>
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ordre</label>
            <Input type="number" value={formChapitre.ordre ?? 0} onChange={(e) => setFormChapitre({ ...formChapitre, ordre: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Titre</label>
            <Input value={formChapitre.titre ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, titre: e.target.value, slug: slugify(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <Input value={formChapitre.slug ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, slug: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea value={formChapitre.description ?? ""} onChange={(e) => setFormChapitre({ ...formChapitre, description: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Statut</label>
            <select value={formChapitre.statut ?? "draft"} onChange={(e) => setFormChapitre({ ...formChapitre, statut: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={sauvegarderChapitre} disabled={saving} className="gap-1"><Save size={14} /> {saving ? "Sauvegarde..." : "Sauvegarder"}</Button>
          <Button variant="ghost" onClick={retourListe}>Annuler</Button>
        </div>
      </div>
    );
  }

  function renderFormLecon() {
    const chapitresFiltres = matiereLecon ? chapitresParMatiere(matiereLecon) : chapitres;
    return (
      <div className="space-y-4">
        <button onClick={retourListe} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formLecon.id ? "Modifier la leçon" : "Nouvelle leçon"}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Matière</label>
            <select value={matiereLecon} onChange={(e) => { setMatiereLecon(e.target.value); setFormLecon({ ...formLecon, chapter_id: undefined }); }} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              <option value="">Toutes les matières</option>
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Chapitre</label>
            <select value={formLecon.chapter_id ?? ""} onChange={(e) => setFormLecon({ ...formLecon, chapter_id: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              <option value="">Sélectionner...</option>
              {chapitresFiltres.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Titre</label>
            <Input value={formLecon.titre ?? ""} onChange={(e) => setFormLecon({ ...formLecon, titre: e.target.value, slug: slugify(e.target.value) })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <Input value={formLecon.slug ?? ""} onChange={(e) => setFormLecon({ ...formLecon, slug: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulté</label>
            <select value={formLecon.niveau_difficulte ?? "moyen"} onChange={(e) => setFormLecon({ ...formLecon, niveau_difficulte: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Durée (min)</label>
            <Input type="number" value={formLecon.duree_minutes ?? ""} onChange={(e) => setFormLecon({ ...formLecon, duree_minutes: parseInt(e.target.value) || null })} />
          </div>
        </div>

        {/* Contenu markdown avec preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Contenu (Markdown)</label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { setIaType("lecon"); setModalIA(true); }}>
              <Bot size={14} /> Générer avec l&apos;IA
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              value={formLecon.contenu_markdown ?? ""}
              onChange={(e) => setFormLecon({ ...formLecon, contenu_markdown: e.target.value })}
              rows={16}
              className="font-mono text-xs"
              placeholder="# Titre de la leçon..."
            />
            <div className="rounded-lg border border-dark-border bg-dark-elevated p-4 overflow-y-auto max-h-[400px] prose prose-invert prose-sm">
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                {formLecon.contenu_markdown || "Aperçu du contenu..."}
              </div>
            </div>
          </div>
        </div>

        {/* Points clés */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Points clés</label>
            <Button variant="ghost" size="sm" onClick={() => setPointsCles([...pointsCles, ""])} className="gap-1"><Plus size={14} /> Ajouter</Button>
          </div>
          <div className="space-y-2">
            {pointsCles.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Input value={p} onChange={(e) => { const copy = [...pointsCles]; copy[i] = e.target.value; setPointsCles(copy); }} placeholder="Point clé..." />
                <Button variant="ghost" size="icon-sm" onClick={() => setPointsCles(pointsCles.filter((_, j) => j !== i))}><X size={14} /></Button>
              </div>
            ))}
          </div>
        </div>

        {/* Exemples */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Exemples</label>
            <Button variant="ghost" size="sm" onClick={() => setExemples([...exemples, { titre: "", contenu: "", explication: "" }])} className="gap-1"><Plus size={14} /> Ajouter</Button>
          </div>
          <div className="space-y-3">
            {exemples.map((ex, i) => (
              <Card key={i} className="border-dark-border bg-dark-elevated">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Exemple {i + 1}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => setExemples(exemples.filter((_, j) => j !== i))}><X size={12} /></Button>
                  </div>
                  <Input placeholder="Titre" value={ex.titre} onChange={(e) => { const copy = [...exemples]; copy[i].titre = e.target.value; setExemples(copy); }} />
                  <Textarea placeholder="Contenu" value={ex.contenu} onChange={(e) => { const copy = [...exemples]; copy[i].contenu = e.target.value; setExemples(copy); }} rows={2} />
                  <Input placeholder="Explication" value={ex.explication} onChange={(e) => { const copy = [...exemples]; copy[i].explication = e.target.value; setExemples(copy); }} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => sauvegarderLecon(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button>
          <Button onClick={() => sauvegarderLecon(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button>
          <Button variant="ghost" onClick={retourListe}>Annuler</Button>
        </div>
      </div>
    );
  }

  function renderFormQuiz() {
    const chapitresFiltres = matiereQuiz ? chapitresParMatiere(matiereQuiz) : chapitres;
    return (
      <div className="space-y-4">
        <button onClick={retourListe} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formQuiz.id ? "Modifier le quiz" : "Nouveau quiz"}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Matière</label>
            <select value={matiereQuiz} onChange={(e) => { setMatiereQuiz(e.target.value); setFormQuiz({ ...formQuiz, chapter_id: undefined }); }} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              <option value="">Toutes les matières</option>
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Chapitre</label>
            <select value={formQuiz.chapter_id ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, chapter_id: e.target.value || null })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              <option value="">Aucun</option>
              {chapitresFiltres.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Titre</label>
            <Input value={formQuiz.titre ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, titre: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulté</label>
            <select value={formQuiz.niveau_difficulte ?? "moyen"} onChange={(e) => setFormQuiz({ ...formQuiz, niveau_difficulte: e.target.value })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea value={formQuiz.description ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, description: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Durée (min)</label>
            <Input type="number" value={formQuiz.duree_minutes ?? ""} onChange={(e) => setFormQuiz({ ...formQuiz, duree_minutes: parseInt(e.target.value) || null })} />
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Questions ({questions.length})</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => { setIaType("quiz"); setModalIA(true); }}>
                <Bot size={14} /> Générer 10 questions IA
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setQuestions([...questions, { enonce: "", explication_reponse: "", ordre: questions.length, points: 1, choix: [{ contenu: "", est_correcte: true }, { contenu: "", est_correcte: false }, { contenu: "", est_correcte: false }, { contenu: "", est_correcte: false }] }])} className="gap-1">
                <Plus size={14} /> Question
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <Card key={qi} className="border-dark-border bg-dark-elevated">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Question {qi + 1}</span>
                    <Button variant="ghost" size="icon-xs" onClick={() => setQuestions(questions.filter((_, j) => j !== qi))}><X size={14} className="text-destructive" /></Button>
                  </div>
                  <Textarea placeholder="Énoncé de la question" value={q.enonce} onChange={(e) => { const copy = [...questions]; copy[qi].enonce = e.target.value; setQuestions(copy); }} rows={2} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.choix.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={c.est_correcte}
                          onChange={() => {
                            const copy = [...questions];
                            copy[qi].choix = copy[qi].choix.map((ch, k) => ({ ...ch, est_correcte: k === ci }));
                            setQuestions(copy);
                          }}
                          className="accent-brand-vert"
                        />
                        <Input
                          value={c.contenu}
                          onChange={(e) => { const copy = [...questions]; copy[qi].choix[ci].contenu = e.target.value; setQuestions(copy); }}
                          placeholder={`Choix ${ci + 1}`}
                          className={c.est_correcte ? "border-brand-vert/50" : ""}
                        />
                      </div>
                    ))}
                  </div>
                  <Input placeholder="Explication de la bonne réponse" value={q.explication_reponse} onChange={(e) => { const copy = [...questions]; copy[qi].explication_reponse = e.target.value; setQuestions(copy); }} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => sauvegarderQuiz(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button>
          <Button onClick={() => sauvegarderQuiz(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button>
          <Button variant="ghost" onClick={retourListe}>Annuler</Button>
        </div>
      </div>
    );
  }

  function renderFormFiche() {
    return (
      <div className="space-y-4">
        <button onClick={retourListe} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Retour</button>
        <h3 className="font-display text-lg font-bold">{formFiche.id ? "Modifier la fiche" : "Nouvelle fiche de révision"}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Titre</label>
            <Input value={formFiche.titre ?? ""} onChange={(e) => setFormFiche({ ...formFiche, titre: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Leçon liée (optionnel)</label>
            <select value={formFiche.lesson_id ?? ""} onChange={(e) => setFormFiche({ ...formFiche, lesson_id: e.target.value || null })} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              <option value="">Aucune</option>
              {lecons.map((l) => <option key={l.id} value={l.id}>{l.titre}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Contenu (Markdown)</label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { setIaType("fiche"); setModalIA(true); }}>
              <Bot size={14} /> Générer avec l&apos;IA
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              value={formFiche.contenu_markdown ?? ""}
              onChange={(e) => setFormFiche({ ...formFiche, contenu_markdown: e.target.value })}
              rows={16}
              className="font-mono text-xs"
              placeholder="# Fiche de révision..."
            />
            <div className="rounded-lg border border-dark-border bg-dark-elevated p-4 overflow-y-auto max-h-[400px] prose prose-invert prose-sm">
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                {formFiche.contenu_markdown || "Aperçu du contenu..."}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => sauvegarderFiche(false)} disabled={saving} variant="outline" className="gap-1"><Save size={14} /> Brouillon</Button>
          <Button onClick={() => sauvegarderFiche(true)} disabled={saving} className="gap-1"><Check size={14} /> Publier</Button>
          <Button variant="ghost" onClick={retourListe}>Annuler</Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════════════════
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
        <h1 className="font-display text-2xl font-bold">Gestion du contenu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Créer, modifier et publier le contenu pédagogique
        </p>
      </div>

      {/* Onglets */}
      {vue === "liste" && (
        <div className="flex gap-1 rounded-xl border border-dark-border bg-dark-card p-1">
          {([
            { key: "matieres" as Onglet, label: "Matières & Chapitres", icon: BookOpen },
            { key: "lecons" as Onglet, label: "Leçons", icon: FileText },
            { key: "quiz" as Onglet, label: "Quiz", icon: Brain },
            { key: "fiches" as Onglet, label: "Fiches", icon: FileText },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOnglet(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                onglet === tab.key ? "bg-brand-vert/10 text-brand-vert" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Contenu selon la vue */}
      {vue === "liste" && onglet === "matieres" && renderListeMatieres()}
      {vue === "liste" && onglet === "lecons" && renderListeLecons()}
      {vue === "liste" && onglet === "quiz" && renderListeQuiz()}
      {vue === "liste" && onglet === "fiches" && renderListeFiches()}
      {vue === "form-matiere" && renderFormMatiere()}
      {vue === "form-chapitre" && renderFormChapitre()}
      {vue === "form-lecon" && renderFormLecon()}
      {vue === "form-quiz" && renderFormQuiz()}
      {vue === "form-fiche" && renderFormFiche()}

      {/* Modal IA */}
      {renderModalIA()}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={fermerToast} />}
    </div>
  );
}
