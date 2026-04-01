"use client";

import { Sparkles, Lightbulb } from "lucide-react";

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

const actions = [
  { texte: "Explique-moi les fractions", icone: "sparkles" },
  { texte: "Aide-moi avec un exercice", icone: "lightbulb" },
  { texte: "Cr\u00e9e un quiz sur l\u2019histoire", icone: "sparkles" },
  { texte: "R\u00e9sume ce chapitre", icone: "lightbulb" },
  { texte: "Corrige ma r\u00e9daction", icone: "sparkles" },
  { texte: "Donne-moi des astuces de r\u00e9vision", icone: "lightbulb" },
] as const;

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.texte}
          onClick={() => onSelect(action.texte)}
          className="flex items-center gap-2 rounded-full border border-dark-border bg-dark-elevated px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand-violet hover:text-brand-violet"
        >
          {action.icone === "sparkles" ? (
            <Sparkles size={14} className="shrink-0" />
          ) : (
            <Lightbulb size={14} className="shrink-0" />
          )}
          <span className="truncate">{action.texte}</span>
        </button>
      ))}
    </div>
  );
}
