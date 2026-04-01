"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Loader2 } from "lucide-react";

interface AnalysisResultProps {
  analyse: string | null;
  loading: boolean;
}

export default function AnalysisResult({ analyse, loading }: AnalysisResultProps) {
  const [copie, setCopie] = useState(false);

  async function copierAnalyse() {
    if (!analyse) return;
    try {
      await navigator.clipboard.writeText(analyse);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Echec silencieux
    }
  }

  if (loading) {
    return (
      <Card className="border-dark-border bg-dark-card">
        <CardContent className="flex items-center justify-center gap-3 p-8">
          <Loader2 size={20} className="animate-spin text-brand-violet" />
          <span className="text-sm text-muted-foreground">
            Analyse en cours...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!analyse) return null;

  // D\u00e9couper en sections si le texte contient des lignes commen\u00e7ant par # ou **
  const lignes = analyse.split("\n");
  const elements: React.ReactNode[] = [];
  let paragraphe: string[] = [];

  function viderParagraphe(index: number) {
    if (paragraphe.length > 0) {
      elements.push(
        <p key={`p-${index}`} className="whitespace-pre-wrap text-sm leading-relaxed">
          {paragraphe.join("\n")}
        </p>
      );
      paragraphe = [];
    }
  }

  lignes.forEach((ligne, i) => {
    const headerMatch = ligne.match(/^(#{1,3})\s+(.+)/);
    if (headerMatch) {
      viderParagraphe(i);
      const niveau = headerMatch[1].length;
      const taille =
        niveau === 1
          ? "text-lg font-bold"
          : niveau === 2
          ? "text-base font-semibold"
          : "text-sm font-semibold";
      elements.push(
        <h3 key={`h-${i}`} className={`font-display ${taille} mt-4 first:mt-0`}>
          {headerMatch[2]}
        </h3>
      );
    } else {
      paragraphe.push(ligne);
    }
  });
  viderParagraphe(lignes.length);

  return (
    <Card className="border-dark-border bg-dark-card">
      <CardContent className="relative p-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copierAnalyse}
          className="absolute top-4 right-4"
          title="Copier l'analyse"
        >
          {copie ? (
            <Check size={14} className="text-brand-vert" />
          ) : (
            <Copy size={14} className="text-muted-foreground" />
          )}
        </Button>
        <div className="space-y-2 pr-8">{elements}</div>
      </CardContent>
    </Card>
  );
}
