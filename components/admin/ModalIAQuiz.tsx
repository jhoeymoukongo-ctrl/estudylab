"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2 } from "lucide-react";

const NIVEAUX = ["facile", "moyen", "difficile", "expert"];
const NB_QUESTIONS = [5, 10, 15, 20];

interface QuestionGeneree {
  enonce: string;
  explication: string;
  choix: { contenu: string; est_correcte: boolean }[];
}

interface ModalIAQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (titre: string, questions: QuestionGeneree[]) => void;
}

export default function ModalIAQuiz({ open, onOpenChange, onGenerated }: ModalIAQuizProps) {
  const [notion, setNotion] = useState("");
  const [niveau, setNiveau] = useState("moyen");
  const [count, setCount] = useState(10);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function generer() {
    if (!notion.trim()) { setErreur("Precisez un sujet"); return; }
    setChargement(true);
    setErreur(null);

    try {
      const res = await fetch("/api/ai/generer-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notion, niveau, count }),
      });
      const data = await res.json();
      if (data.questions) {
        onGenerated(data.titre || `Quiz : ${notion}`, data.questions);
        onOpenChange(false);
        setNotion("");
      } else {
        setErreur(data.error || "Erreur de generation");
      }
    } catch {
      setErreur("Erreur de connexion");
    }
    setChargement(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot size={18} className="text-brand-vert" />
            Generer un quiz avec l&apos;IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Sujet du quiz</label>
            <Input value={notion} onChange={(e) => setNotion(e.target.value)} placeholder="Ex: les fonctions derivees" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre de questions</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
                {NB_QUESTIONS.map((n) => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Difficulte</label>
              <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {erreur && <p className="text-xs text-destructive">{erreur}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={chargement}>Annuler</Button>
          <Button onClick={generer} disabled={chargement} className="gap-1">
            {chargement ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            {chargement ? "Generation..." : `Generer ${count} questions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
