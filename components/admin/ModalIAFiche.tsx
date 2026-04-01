"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2 } from "lucide-react";

const FORMATS = [
  { value: "resume-court", label: "Resume court" },
  { value: "fiche-complete", label: "Fiche complete" },
  { value: "memo-express", label: "Memo express" },
];

interface ModalIAFicheProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (contenu: string) => void;
}

export default function ModalIAFiche({ open, onOpenChange, onGenerated }: ModalIAFicheProps) {
  const [notion, setNotion] = useState("");
  const [format, setFormat] = useState("fiche-complete");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function generer() {
    if (!notion.trim()) { setErreur("Precisez une notion"); return; }
    setChargement(true);
    setErreur(null);

    try {
      const res = await fetch("/api/ai/generer-fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notion, format }),
      });
      const data = await res.json();
      if (data.contenu) {
        onGenerated(data.contenu);
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
            Generer une fiche avec l&apos;IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Chapitre ou notion</label>
            <Input value={notion} onChange={(e) => setNotion(e.target.value)} placeholder="Ex: la revolution francaise" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border border-dark-border bg-dark-elevated px-3 py-2 text-sm">
              {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          {erreur && <p className="text-xs text-destructive">{erreur}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={chargement}>Annuler</Button>
          <Button onClick={generer} disabled={chargement} className="gap-1">
            {chargement ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
            {chargement ? "Generation..." : "Generer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
