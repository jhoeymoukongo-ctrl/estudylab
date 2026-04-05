"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function CorrigeCollapsible({
  corrige,
  couleur,
}: {
  corrige: string;
  couleur: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <Card className="border-dark-border bg-dark-card">
      <CardContent className="p-0">
        <Button
          variant="ghost"
          onClick={() => setOuvert(!ouvert)}
          className="w-full flex items-center justify-between px-6 py-4 h-auto rounded-none hover:bg-dark-elevated"
        >
          <span className="flex items-center gap-2 font-display font-semibold">
            <CheckCircle size={18} style={{ color: couleur }} />
            Voir le corrige
          </span>
          {ouvert ? (
            <ChevronUp size={18} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={18} className="text-muted-foreground" />
          )}
        </Button>

        {ouvert && (
          <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-dark-border pt-4">
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-brand-vert prose-code:bg-dark-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown>{corrige}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
