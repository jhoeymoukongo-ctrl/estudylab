'use client'

import { useState, useMemo } from 'react'
import SidebarArborescente from '@/components/contenus/SidebarArborescente'
import TableauContenu from '@/components/contenus/TableauContenu'
import ModaleIA from '@/components/contenus/ModaleIA'
import ToastReorder from '@/components/contenus/ToastReorder'
import type { NiveauAvecMatieres, RessourceContenu } from '@/types'

interface Props {
  arborescence: NiveauAvecMatieres[]
  isPremium: boolean
  quotaLeft: number
  quotaMax: number
}

export default function MatieresEleveClient({
  arborescence,
  isPremium,
  quotaLeft: initialQuota,
}: Props) {
  // Sélectionner le premier chapitre disponible par défaut
  const premierChapId = arborescence
    .flatMap(n => n.matieres)
    .flatMap(m => m.chapitres)[0]?.id ?? null

  const [selectedChapId, setSelectedChapId] = useState<string | null>(premierChapId)
  const [quotaLeft, setQuotaLeft] = useState(initialQuota)
  const [modalIA, setModalIA] = useState<RessourceContenu | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Trouver le chapitre sélectionné dans l'arborescence
  const chapitreSelectionne = useMemo(() => {
    if (!selectedChapId) return null
    for (const n of arborescence)
      for (const m of n.matieres)
        for (const c of m.chapitres)
          if (c.id === selectedChapId) return c
    return null
  }, [arborescence, selectedChapId])

  const handleGenerate = (action: "quiz" | "fiche" | "expliquer" | "exercices") => {
    if (quotaLeft <= 0 && !isPremium) return
    setQuotaLeft(q => Math.max(0, q - 1))
    setModalIA(null)
    setToast(`Génération "${action}" lancée`)
  }

  return (
    <div className="matieres-eleve-page">
      {/* Sidebar arborescente */}
      <SidebarArborescente
        niveaux={arborescence}
        selectedChapId={selectedChapId}
        onSelectChap={setSelectedChapId}
        mode="eleve"
        onReorderChapitres={() => {}}
      />

      {/* Zone principale */}
      <main className="matieres-eleve-main">
        <div className="matieres-eleve-header">
          <h1 className="matieres-eleve-titre">Mes matières</h1>
        </div>

        <div className="matieres-eleve-body">
          {chapitreSelectionne ? (
            <TableauContenu
              chapitre={chapitreSelectionne}
              mode="eleve"
              quotaLeft={quotaLeft}
              isPremium={isPremium}
              onReorderRessources={() => {}}
              onDeleteRessource={() => {}}
              onOpenUpload={() => {}}
              onOpenIA={(r) => setModalIA(r)}
              onOpenQuizEditor={() => {}}
            />
          ) : (
            <div className="matieres-eleve-vide">
              <span>Sélectionne un chapitre dans la sidebar</span>
            </div>
          )}
        </div>
      </main>

      {/* Modale génération IA */}
      <ModaleIA
        open={modalIA !== null}
        ressource={modalIA}
        quotaLeft={quotaLeft}
        isPremium={isPremium}
        onClose={() => setModalIA(null)}
        onGenerate={handleGenerate}
      />

      {/* Toast confirmation */}
      <ToastReorder message={toast} onDone={() => setToast(null)} />

      <style>{`
        .matieres-eleve-page {
          display: flex;
          height: 100%;
          overflow: hidden;
        }
        .matieres-eleve-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
          background: #0F1923;
        }
        .matieres-eleve-header {
          padding: 20px 24px 0;
        }
        .matieres-eleve-titre {
          font-family: 'Fredoka One', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #F0F4F8;
          margin: 0;
        }
        .matieres-eleve-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .matieres-eleve-vide {
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
          .matieres-eleve-header { padding: 16px 16px 0; }
          .matieres-eleve-body { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
