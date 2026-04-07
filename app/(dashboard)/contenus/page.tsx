"use client";

import { useState, useEffect, useCallback } from "react";
import type { NiveauAvecMatieres, RessourceContenu } from "@/types";
import { useArborescence } from "@/hooks/useArborescence";
import SidebarArborescente from "@/components/contenus/SidebarArborescente";
import TableauContenu from "@/components/contenus/TableauContenu";
import ModaleIA from "@/components/contenus/ModaleIA";
import ToastReorder from "@/components/contenus/ToastReorder";

export default function EleveContenusPage() {
  const [initialData, setInitialData] = useState<NiveauAvecMatieres[] | null>(null);
  const [quota, setQuota] = useState({ left: 5, isPremium: false });

  useEffect(() => {
    fetch("/api/contenus/arborescence?role=eleve")
      .then(res => res.json())
      .then(data => setInitialData(data))
      .catch(() => setInitialData([]));

    fetch("/api/quota")
      .then(res => res.json())
      .then(data => {
        setQuota({
          left: data.restant ?? 5,
          isPremium: data.plan === "premium",
        });
      })
      .catch(() => {});
  }, []);

  if (!initialData) {
    return (
      <div className="eleve-contenus-loading">
        <div className="eleve-contenus-spinner" />
        <span>Chargement...</span>
        <style>{`
          .eleve-contenus-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            height: 60vh;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            color: #7A90A8;
          }
          .eleve-contenus-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: #4CAF82;
            border-radius: 50%;
            animation: spinE 0.6s linear infinite;
          }
          @keyframes spinE { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return <EleveContenusInner initialData={initialData} quota={quota} />;
}

function EleveContenusInner({
  initialData,
  quota,
}: {
  initialData: NiveauAvecMatieres[];
  quota: { left: number; isPremium: boolean };
}) {
  const {
    data,
    selectedChapId,
    setSelectedChapId,
    selectedChapitre,
  } = useArborescence({ initialData, role: "eleve" });

  // Modale IA
  const [iaOpen, setIaOpen] = useState(false);
  const [iaRessource, setIaRessource] = useState<RessourceContenu | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenIA = useCallback((ressource: RessourceContenu) => {
    setIaRessource(ressource);
    setIaOpen(true);
  }, []);

  const handleGenerate = useCallback((action: "quiz" | "fiche" | "exercices") => {
    setIaOpen(false);
    // TODO: déclencher la génération IA selon l'action
    setToastMsg(`Génération "${action}" lancée`);
  }, []);

  const handleToastDone = useCallback(() => setToastMsg(null), []);

  // No-op handlers for student mode (not used but required by props)
  const noop = useCallback(() => {}, []);
  const noopItems = useCallback(() => {}, []);

  return (
    <div className="eleve-contenus-page">
      <SidebarArborescente
        niveaux={data}
        selectedChapId={selectedChapId}
        onSelectChap={setSelectedChapId}
        mode="eleve"
        onReorderChapitres={noop as never}
      />

      <main className="eleve-contenus-main">
        <div className="eleve-contenus-main-header">
          <h1 className="eleve-contenus-titre">Mes contenus</h1>
        </div>

        <div className="eleve-contenus-main-body">
          {selectedChapitre ? (
            <TableauContenu
              chapitre={selectedChapitre}
              mode="eleve"
              quotaLeft={quota.left}
              isPremium={quota.isPremium}
              onReorderRessources={noopItems as never}
              onDeleteRessource={noop as never}
              onOpenUpload={noop as never}
              onOpenIA={handleOpenIA}
              onOpenQuizEditor={noop as never}
            />
          ) : (
            <div className="eleve-contenus-vide">
              <span>Sélectionne un chapitre pour voir les ressources</span>
            </div>
          )}
        </div>
      </main>

      <ModaleIA
        open={iaOpen}
        ressource={iaRessource}
        quotaLeft={quota.left}
        isPremium={quota.isPremium}
        onClose={() => setIaOpen(false)}
        onGenerate={handleGenerate}
      />

      <ToastReorder message={toastMsg} onDone={handleToastDone} />

      <style>{`
        .eleve-contenus-page {
          display: flex;
          height: 100%;
          overflow: hidden;
        }
        .eleve-contenus-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .eleve-contenus-main-header {
          padding: 20px 24px 0;
        }
        .eleve-contenus-titre {
          font-family: 'Fredoka One', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #F0F4F8;
          margin: 0;
        }
        .eleve-contenus-main-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .eleve-contenus-vide {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #7A90A8;
          background: #0F1923;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
        }
        @media (max-width: 767px) {
          .eleve-contenus-main-header { padding: 16px 16px 0; }
          .eleve-contenus-main-body { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
