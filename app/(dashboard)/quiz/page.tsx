"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";

interface Quiz {
  id: string;
  titre: string;
  niveau_difficulte: string;
  duree_minutes: number | null;
}

interface Question {
  id: string;
  enonce: string;
  explication_reponse: string | null;
  ordre: number;
  points: number;
  choices: { id: string; contenu: string; est_correcte: boolean; ordre: number }[];
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizActif, setQuizActif] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [indexQuestion, setIndexQuestion] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState<string | null>(null);
  const [repondu, setRepondu] = useState(false);
  const [score, setScore] = useState(0);
  const [termine, setTermine] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    async function charger() {
      const supabase = creerClientSupabase();
      const { data } = await supabase
        .from("quizzes")
        .select("id, titre, niveau_difficulte, duree_minutes")
        .eq("statut", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      setQuizzes(data ?? []);
      setChargement(false);
    }
    charger();
  }, []);

  async function lancerQuiz(quizId: string) {
    setChargement(true);
    const supabase = creerClientSupabase();
    const { data: qs } = await supabase
      .from("quiz_questions")
      .select("id, enonce, explication_reponse, ordre, points")
      .eq("quiz_id", quizId)
      .order("ordre");

    if (!qs || qs.length === 0) {
      setChargement(false);
      return;
    }

    const questionsAvecChoix: Question[] = [];
    for (const q of qs) {
      const { data: choix } = await supabase
        .from("quiz_choices")
        .select("id, contenu, est_correcte, ordre")
        .eq("question_id", q.id)
        .order("ordre");
      questionsAvecChoix.push({ ...q, choices: choix ?? [] });
    }

    setQuizActif(quizId);
    setQuestions(questionsAvecChoix);
    setIndexQuestion(0);
    setScore(0);
    setTermine(false);
    setReponseChoisie(null);
    setRepondu(false);
    setChargement(false);
  }

  function validerReponse() {
    if (!reponseChoisie) return;
    const question = questions[indexQuestion];
    const choix = question.choices.find((c) => c.id === reponseChoisie);
    if (choix?.est_correcte) {
      setScore((s) => s + question.points);
    }
    setRepondu(true);
  }

  async function questionSuivante() {
    if (indexQuestion + 1 >= questions.length) {
      setTermine(true);
      // Sauvegarder la tentative
      const supabase = creerClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && quizActif) {
        const totalPoints = questions.reduce((a, q) => a + q.points, 0);
        const pourcent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          quiz_id: quizActif,
          score: pourcent,
          nb_bonnes_reponses: score,
          nb_questions: questions.length,
          completed_at: new Date().toISOString(),
        });
      }
    } else {
      setIndexQuestion((i) => i + 1);
      setReponseChoisie(null);
      setRepondu(false);
    }
  }

  // Liste des quiz
  if (!quizActif) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Quiz</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Teste tes connaissances avec des quiz interactifs
          </p>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="border-dark-border bg-dark-card">
            <CardContent className="p-8 text-center">
              <Brain size={40} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun quiz disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {quizzes.map((q) => (
              <Card
                key={q.id}
                className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors cursor-pointer"
                onClick={() => lancerQuiz(q.id)}
              >
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold">{q.titre}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">{q.niveau_difficulte}</Badge>
                    {q.duree_minutes && (
                      <span className="text-xs text-muted-foreground">
                        {q.duree_minutes} min
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Quiz termine
  if (termine) {
    const totalPoints = questions.reduce((a, q) => a + q.points, 0);
    const pourcent = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="py-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-vert/10">
            <CheckCircle size={40} className="text-brand-vert" />
          </div>
          <h1 className="font-display text-3xl font-bold">{pourcent}%</h1>
          <p className="mt-2 text-muted-foreground">
            {score}/{totalPoints} points — {questions.length} questions
          </p>
        </div>
        <Button onClick={() => setQuizActif(null)} className="gap-2">
          Retour aux quiz <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  // Question en cours
  const question = questions[indexQuestion];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Question {indexQuestion + 1}/{questions.length}
        </p>
        <Badge variant="secondary">{question.points} pt{question.points > 1 ? "s" : ""}</Badge>
      </div>

      {/* Barre de progression */}
      <div className="h-1.5 rounded-full bg-dark-elevated">
        <div
          className="h-full rounded-full bg-brand-vert transition-all"
          style={{ width: `${((indexQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-6">
          <h2 className="font-display text-lg font-semibold mb-6">
            {question.enonce}
          </h2>

          <div className="space-y-3">
            {question.choices.map((choix) => {
              let classes = "border-dark-border bg-dark-elevated hover:border-brand-vert/30";
              if (repondu) {
                if (choix.est_correcte) {
                  classes = "border-brand-vert bg-brand-vert/10";
                } else if (choix.id === reponseChoisie && !choix.est_correcte) {
                  classes = "border-brand-rouge bg-brand-rouge/10";
                }
              } else if (reponseChoisie === choix.id) {
                classes = "border-brand-vert bg-brand-vert/5";
              }

              return (
                <button
                  key={choix.id}
                  onClick={() => !repondu && setReponseChoisie(choix.id)}
                  disabled={repondu}
                  className={`w-full rounded-xl border p-4 text-left text-sm transition-all ${classes}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-1">{choix.contenu}</span>
                    {repondu && choix.est_correcte && (
                      <CheckCircle size={18} className="text-brand-vert shrink-0" />
                    )}
                    {repondu && choix.id === reponseChoisie && !choix.est_correcte && (
                      <XCircle size={18} className="text-brand-rouge shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {repondu && question.explication_reponse && (
            <div className="mt-4 rounded-xl bg-brand-bleu/10 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Explication</p>
              {question.explication_reponse}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {!repondu ? (
          <Button onClick={validerReponse} disabled={!reponseChoisie}>
            Valider
          </Button>
        ) : (
          <Button onClick={questionSuivante} className="gap-2">
            {indexQuestion + 1 >= questions.length ? "Voir les resultats" : "Suivant"}
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
