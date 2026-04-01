"use client";

import { useState, useEffect } from "react";

interface QuotaData {
  utilise: number;
  limite: number;
}

export default function QuotaIndicator() {
  const [quota, setQuota] = useState<QuotaData | null>(null);

  useEffect(() => {
    async function chargerQuota() {
      try {
        const res = await fetch("/api/quota");
        if (!res.ok) return;
        const data = await res.json();
        setQuota({ utilise: data.utilise ?? data.used ?? 0, limite: data.limite ?? data.limit ?? 50 });
      } catch {
        // Echec silencieux
      }
    }
    chargerQuota();
  }, []);

  if (!quota) return null;

  const pourcentage = Math.round((quota.utilise / quota.limite) * 100);
  const estEleve = pourcentage > 80;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-dark-elevated">
        <div
          className={`h-full rounded-full transition-all ${
            estEleve ? "bg-brand-orange" : "bg-brand-vert"
          }`}
          style={{ width: `${Math.min(pourcentage, 100)}%` }}
        />
      </div>
      <span
        className={`text-xs ${
          estEleve ? "text-brand-orange" : "text-muted-foreground"
        }`}
      >
        {quota.utilise}/{quota.limite} requ\u00eates IA utilis\u00e9es
      </span>
    </div>
  );
}
