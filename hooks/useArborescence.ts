"use client";

import { useState, useCallback, useRef } from "react";
import type {
  NiveauAvecMatieres,
  ChapitreAvecRessources,
  ReorderPayload,
  RessourceContenu,
} from "@/types";

interface UseArborescenceOptions {
  initialData?: NiveauAvecMatieres[];
  role: "admin" | "eleve";
}

interface UseArborescenceReturn {
  data: NiveauAvecMatieres[];
  loading: boolean;
  error: string | null;
  selectedChapId: string | null;
  setSelectedChapId: (id: string) => void;
  reorder: (payload: ReorderPayload) => Promise<void>;
  refresh: () => Promise<void>;
  // Helpers pour trouver le chapitre sélectionné
  selectedChapitre: ChapitreAvecRessources | null;
  // Mise à jour optimiste après suppression
  removeRessource: (id: string) => void;
  // Mise à jour optimiste après ajout
  addRessource: (ressource: RessourceContenu) => void;
}

export function useArborescence({
  initialData = [],
  role,
}: UseArborescenceOptions): UseArborescenceReturn {
  const [data, setData] = useState<NiveauAvecMatieres[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapId, setSelectedChapId] = useState<string | null>(() => {
    // Sélectionner le premier chapitre par défaut
    for (const niveau of initialData) {
      for (const matiere of niveau.matieres) {
        if (matiere.chapitres.length > 0) {
          return matiere.chapitres[0].id;
        }
      }
    }
    return null;
  });

  // Snapshot pour rollback en cas d'erreur
  const snapshotRef = useRef<NiveauAvecMatieres[]>(initialData);

  // Rafraîchir depuis le serveur
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contenus/arborescence?role=${role}`);
      if (!res.ok) throw new Error("Erreur chargement arborescence");
      const niveaux: NiveauAvecMatieres[] = await res.json();
      setData(niveaux);
      snapshotRef.current = niveaux;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Réordonnancement optimiste
  const reorder = useCallback(async (payload: ReorderPayload) => {
    // Sauvegarder le snapshot pour rollback
    const snapshot = structuredClone(data);
    snapshotRef.current = snapshot;

    // Mise à jour optimiste locale
    const ordreMap = new Map(payload.items.map(i => [i.id, i.ordre]));

    setData(prev => prev.map(niveau => ({
      ...niveau,
      matieres: niveau.matieres.map(matiere => {
        if (payload.type === "chapitre") {
          // Réordonner les chapitres
          const chapitresMisAJour = matiere.chapitres.map(ch => ({
            ...ch,
            ordre: ordreMap.has(ch.id) ? ordreMap.get(ch.id)! : ch.ordre,
          }));
          chapitresMisAJour.sort((a, b) => a.ordre - b.ordre);
          // Recalculer les numéros
          return {
            ...matiere,
            chapitres: chapitresMisAJour.map((ch, idx) => ({ ...ch, num: idx + 1 })),
          };
        } else {
          // Réordonner les ressources dans les chapitres
          return {
            ...matiere,
            chapitres: matiere.chapitres.map(ch => {
              const ressourcesMisAJour = ch.ressources.map(r => ({
                ...r,
                ordre: ordreMap.has(r.id) ? ordreMap.get(r.id)! : r.ordre,
              }));
              ressourcesMisAJour.sort((a, b) => a.ordre - b.ordre);
              return { ...ch, ressources: ressourcesMisAJour };
            }),
          };
        }
      }),
    })));

    // Appel serveur en arrière-plan
    try {
      const res = await fetch("/api/contenus/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde ordre");
    } catch {
      // Rollback
      setData(snapshot);
      setError("Erreur lors de la sauvegarde de l'ordre");
    }
  }, [data]);

  // Supprimer une ressource (optimiste)
  const removeRessource = useCallback((id: string) => {
    setData(prev => prev.map(niveau => ({
      ...niveau,
      matieres: niveau.matieres.map(matiere => ({
        ...matiere,
        chapitres: matiere.chapitres.map(ch => ({
          ...ch,
          ressources: ch.ressources.filter(r => r.id !== id),
        })),
      })),
    })));
  }, []);

  // Ajouter une ressource (optimiste)
  const addRessource = useCallback((ressource: RessourceContenu) => {
    setData(prev => prev.map(niveau => ({
      ...niveau,
      matieres: niveau.matieres.map(matiere => ({
        ...matiere,
        chapitres: matiere.chapitres.map(ch => {
          if (ch.id !== ressource.chapter_id) return ch;
          return {
            ...ch,
            ressources: [...ch.ressources, ressource].sort((a, b) => a.ordre - b.ordre),
          };
        }),
      })),
    })));
  }, []);

  // Trouver le chapitre sélectionné
  let selectedChapitre: ChapitreAvecRessources | null = null;
  if (selectedChapId) {
    for (const niveau of data) {
      for (const matiere of niveau.matieres) {
        const found = matiere.chapitres.find(ch => ch.id === selectedChapId);
        if (found) {
          selectedChapitre = found;
          break;
        }
      }
      if (selectedChapitre) break;
    }
  }

  return {
    data,
    loading,
    error,
    selectedChapId,
    setSelectedChapId,
    reorder,
    refresh,
    selectedChapitre,
    removeRessource,
    addRessource,
  };
}
