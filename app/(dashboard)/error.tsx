"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={40} className="mb-4 text-brand-rouge" />
      <h2 className="font-display text-xl font-bold">Une erreur est survenue</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Quelque chose s&apos;est mal passe. Reessaie.
      </p>
      <Button className="mt-6" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
