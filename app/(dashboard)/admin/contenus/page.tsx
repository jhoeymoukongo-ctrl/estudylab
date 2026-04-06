"use client";

import { useState, useEffect, useCallback } from "react";
import type { NiveauAvecMatieres, TypeRessource, RessourceContenu } from "@/types";
import { useArborescence } from "@/hooks/useArborescence";
import SidebarArborescente from "@/components/contenus/SidebarArborescente";
import TableauContenu from "@/components/contenus/TableauContenu";
import ModaleUpload from "@/components/contenus/ModaleUpload";
import ModaleIA from "@/components/contenus/ModaleIA";
import ToastReorder from "@/components/contenus/ToastReorder";

export default function AdminContenusPage() {
  const [initialData, setInitialData] = useState<NiveauAvecMatieres[] | null>(null);

  // Charger l'arborescence initiale
  useEffect(() => {
    fetch("/api/contenus/arborescence?role=admin")
      .then(res => res.json())
      .then(data => setInitialData(data))
      .catch(() => setInitialData([]));
  }, []);

  if (!initialData) {
    return (
      <div className="admin-contenus-loading">
        <div className="admin-contenus-spinner" />
        <span>Chargement de l&apos;arborescence...</span>
        <style>{`
          .admin-contenus-loading {
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
          .admin-contenus-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: #4CAF82;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return <AdminContenusInner initialData={initialData} />;
}

function AdminContenusInner({ initialData }: { initialData: NiveauAvecMatieres[] }) {
  const {
    data,
    selectedChapId,
    setSelectedChapId,
    reorder,
    selectedChapitre,
    removeRessource,
    addRessource,
    error,
  } = useArborescence({ initialData, role: "admin" });

  // Modale upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<TypeRessource>("lecon");

  // Modale IA
  const [iaOpen, setIaOpen] = useState(false);
  const [iaRessource, setIaRessource] = useState<RessourceContenu | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Handlers
  const handleReorderChapitres = useCallback((_matId: string, items: { id: string; ordre: number }[]) => {
    reorder({ type: "chapitre", items });
    setToastMsg("Ordre des chapitres mis à jour");
  }, [reorder]);

  const handleReorderRessources = useCallback((items: { id: string; ordre: number }[]) => {
    reorder({ type: "ressource", items });
    setToastMsg("Ordre des ressources mis à jour");
  }, [reorder]);

  const handleDeleteRessource = useCallback(async (id: string, type: TypeRessource) => {
    if (type === "quiz") return; // Quiz géré séparément
    if (!confirm("Supprimer cette ressource ?")) return;

    const res = await fetch(`/api/contenus/ressource/${id}`, { method: "DELETE" });
    if (res.ok) {
      removeRessource(id);
      setToastMsg("Ressource supprimée");
    }
  }, [removeRessource]);

  const handleOpenUpload = useCallback((type: TypeRessource) => {
    setUploadType(type);
    setUploadOpen(true);
  }, []);

  const handleOpenIA = useCallback((ressource: RessourceContenu) => {
    setIaRessource(ressource);
    setIaOpen(true);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenQuizEditor = useCallback((_chapitreId: string) => {
    // TODO: intégrer l'éditeur de quiz IA
    setToastMsg("Éditeur de quiz — bientôt disponible");
  }, []);

  const handleUploaded = useCallback((uploaded: {
    id: string;
    type: TypeRessource;
    titre: string;
    ext: string;
    ordre: number;
    chapter_id: string;
  }) => {
    addRessource({
      id: uploaded.id,
      type: uploaded.type,
      titre: uploaded.titre,
      ext: uploaded.ext as RessourceContenu["ext"],
      ordre: uploaded.ordre,
      url: undefined,
      chapter_id: uploaded.chapter_id,
      statut: "published",
      created_at: new Date().toISOString(),
    });
    setToastMsg("Ressource ajoutée");
  }, [addRessource]);

  const handleGenerate = useCallback((action: "quiz" | "fiche" | "expliquer" | "exercices") => {
    setIaOpen(false);
    // TODO: déclencher la génération IA selon l'action
    setToastMsg(`Génération "${action}" lancée`);
  }, []);

  const handleToastDone = useCallback(() => setToastMsg(null), []);

  return (
    <div className="admin-contenus-page">
      {/* Sidebar arborescente */}
      <SidebarArborescente
        niveaux={data}
        selectedChapId={selectedChapId}
        onSelectChap={setSelectedChapId}
        mode="admin"
        onReorderChapitres={handleReorderChapitres}
      />

      {/* Zone principale */}
      <main className="admin-contenus-main">
        <div className="admin-contenus-main-header">
          <h1 className="admin-contenus-titre">Gestion des contenus</h1>
          {error && <div className="admin-contenus-erreur">{error}</div>}
        </div>

        <div className="admin-contenus-main-body">
          {selectedChapitre ? (
            <TableauContenu
              chapitre={selectedChapitre}
              mode="admin"
              quotaLeft={9999}
              isPremium={true}
              onReorderRessources={handleReorderRessources}
              onDeleteRessource={handleDeleteRessource}
              onOpenUpload={handleOpenUpload}
              onOpenIA={handleOpenIA}
              onOpenQuizEditor={handleOpenQuizEditor}
            />
          ) : (
            <div className="admin-contenus-vide">
              <span>Sélectionne un chapitre dans l&apos;arborescence</span>
            </div>
          )}
        </div>
      </main>

      {/* Modales */}
      {selectedChapitre && (
        <ModaleUpload
          open={uploadOpen}
          type={uploadType}
          chapitreId={selectedChapitre.id}
          onClose={() => setUploadOpen(false)}
          onUploaded={handleUploaded}
        />
      )}

      <ModaleIA
        open={iaOpen}
        ressource={iaRessource}
        quotaLeft={9999}
        isPremium={true}
        onClose={() => setIaOpen(false)}
        onGenerate={handleGenerate}
      />

      <ToastReorder message={toastMsg} onDone={handleToastDone} />

      <style>{`
        .admin-contenus-page {
          display: flex;
          height: 100%;
          overflow: hidden;
        }
        .admin-contenus-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .admin-contenus-main-header {
          padding: 20px 24px 0;
        }
        .admin-contenus-titre {
          font-family: 'Fredoka One', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #F0F4F8;
          margin: 0;
        }
        .admin-contenus-erreur {
          margin-top: 8px;
          padding: 8px 14px;
          border-radius: 8px;
          background: rgba(239,68,68,0.1);
          color: #EF4444;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
        }
        .admin-contenus-main-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .admin-contenus-vide {
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
          .admin-contenus-main-header { padding: 16px 16px 0; }
          .admin-contenus-main-body { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
