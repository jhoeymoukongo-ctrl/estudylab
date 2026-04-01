"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2 } from "lucide-react";

const NIVEAUX = ["facile", "moyen", "difficile", "expert"];
const TYPES = [
  { value: "calcul", label: "Calcul" },
  { value: "redaction", label: "Redaction" },
  { value: "probleme", label: "Probleme" },
];
const NB_EXERCICES = [1, 2, 3, 4, 5];

interface ExerciceGenere {
  titre: string;
  enonce: string;
  corrige: string;
  type: string;
  duree_minutes?: number;
}

interface ModalIAExerciceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (exercices: ExerciceGenere[]) => void;
}

export default function ModalIAExercice({ open, onOpenChange, onGenerated }: ModalIAExerciceProps) {
  const [notion, setNotion] = useState("");
  const [typeExo, setTypeExo] = useState("probleme");
  const [niveau, setNiveau] = useState("moyen");
  const [count, setCount] = useState(3);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function generer() {
    if (!notion.trim()) { setErreur("Precisez une notion"); return; }
    setChargement(true);
    setErreur(null);

    try {
      const res = await fetch("/api/ai/generer-exercices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notion, niveau, type: typeExo, count }),
      });
      const data = await res.json();
      if (data.exercices) {
        onGenerated(data.exercices);
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
            Generer des exercices avec l&apos;IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Notion travaillee</label>
            <Input value={notion} onChange={(e) => setNotion(e.target.value)} placeholder="Ex: equations du second degre" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select value={typeExo} onChange={(e) => setTypeExo(e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Difficulte</label>
              <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
                {NB_EXERCICES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {erreur && <p className="text-xs text-destructive">{erreur}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={chargement}>Annuler</Button>
          <Button onClick={generer} disabled={chargement} className="gap-1">
            {chargement ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            {chargement ? "Generation..." : `Generer ${count} exercice(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
