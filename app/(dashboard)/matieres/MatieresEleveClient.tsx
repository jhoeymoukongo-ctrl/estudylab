'use client'

import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
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
  quotaMax,
}: Props) {
  const premierChapId = arborescence
    .flatMap(n => n.matieres)
    .flatMap(m => m.chapitres)[0]?.id ?? null

  const [selectedChapId, setSelectedChapId] = useState<string | null>(premierChapId)
  const [quotaLeft, setQuotaLeft] = useState(initialQuota)
  const [quotaTotal, setQuotaTotal] = useState(quotaMax)
  const [modalIA, setModalIA] = useState<RessourceContenu | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Modale résultat IA
  const [resultatIA, setResultatIA] = useState<{ titre: string; contenu: string } | null>(null)
  const [generationEnCours, setGenerationEnCours] = useState(false)

  // Correction exercice : réponse élève
  const [reponseEleve, setReponseEleve] = useState("")
  const [attenteReponse, setAttenteReponse] = useState<RessourceContenu | null>(null)

  // Modale upgrade quota
  const [modaleUpgrade, setModaleUpgrade] = useState(false)

  function findSelection() {
    if (!selectedChapId) return null
    for (const n of arborescence)
      for (const m of n.matieres)
        for (const c of m.chapitres)
          if (c.id === selectedChapId)
            return { chapitre: c, matiereSlug: m.slug, chapitreSlug: c.slug, subjectId: m.id }
    return null
  }
  const selection = findSelection()
  const chapitreSelectionne = selection?.chapitre ?? null

  // Rafraîchir le quota depuis le serveur
  const refreshQuota = useCallback(async () => {
    try {
      const res = await fetch('/api/quota')
      if (res.ok) {
        const data = await res.json()
        setQuotaLeft(data.quotaRestant)
        setQuotaTotal(data.quotaMax)
      }
    } catch {
      // silently fail
    }
  }, [])

  // Handler : générer du contenu IA
  const handleGenerate = useCallback(async (action: "quiz" | "fiche" | "exercices") => {
    const ressource = modalIA ?? attenteReponse
    if (!ressource) return

    // Pour "exercices" (correction), on doit d'abord demander la réponse élève
    if (action === 'exercices' && !attenteReponse) {
      setAttenteReponse(modalIA)
      setModalIA(null)
      return
    }

    // Vérifier quota côté client
    if (quotaLeft <= 0 && !isPremium) {
      setModalIA(null)
      setAttenteReponse(null)
      setModaleUpgrade(true)
      return
    }

    setModalIA(null)
    setAttenteReponse(null)
    setGenerationEnCours(true)

    try {
      let endpoint = ''
      let body: Record<string, unknown> = {}
      let isStream = false

      switch (action) {
        case 'fiche':
          endpoint = '/api/ai/generer-fiche'
          body = { notion: ressource.titre, lessonId: null }
          break
        case 'exercices':
          endpoint = '/api/ai/corriger'
          body = { enonce: ressource.titre, reponseEleve }
          isStream = true
          break
        case 'quiz':
          endpoint = '/api/ai/generer-quiz'
          body = { notion: ressource.titre, nbQuestions: 5 }
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 429) {
        setGenerationEnCours(false)
        setModaleUpgrade(true)
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const msg = errData.erreur?.fieldErrors
          ? Object.values(errData.erreur.fieldErrors).flat().join(', ')
          : errData.erreur ?? 'Erreur de génération'
        setToast(typeof msg === 'string' ? msg : 'Erreur de génération')
        return
      }

      const titreResultat = action === 'fiche' ? 'Fiche de révision'
        : action === 'exercices' ? 'Correction / Aide'
        : 'Quiz généré'

      if (isStream) {
        // Lire le stream texte progressivement
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let texte = ''

        if (reader) {
          setResultatIA({ titre: titreResultat, contenu: '' })
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            texte += decoder.decode(value, { stream: true })
            setResultatIA({ titre: titreResultat, contenu: texte })
          }
        }
      } else {
        const data = await res.json()

        // Extraire le contenu selon la réponse
        let contenu = ''
        if (data.fiche) contenu = data.fiche
        else if (data.explication) contenu = data.explication
        else if (data.quiz) contenu = typeof data.quiz === 'string' ? data.quiz : JSON.stringify(data.quiz, null, 2)
        else if (data.contenu) contenu = data.contenu
        else if (data.error) contenu = `Erreur : ${data.error}`
        else contenu = JSON.stringify(data, null, 2)

        setResultatIA({ titre: titreResultat, contenu })
      }

      setReponseEleve('')
      setToast('Contenu généré avec succès')

      // Rafraîchir le quota
      await refreshQuota()
    } catch {
      setToast('Erreur de génération')
    } finally {
      setGenerationEnCours(false)
    }
  }, [modalIA, attenteReponse, reponseEleve, quotaLeft, isPremium, refreshQuota])

  return (
    <div className="matieres-eleve-page">
      <SidebarArborescente
        niveaux={arborescence}
        selectedChapId={selectedChapId}
        onSelectChap={setSelectedChapId}
        mode="eleve"
      />

      <main className="matieres-eleve-main">
        <div className="matieres-eleve-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="matieres-eleve-titre">Mes matières</h1>
            <span style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: quotaLeft > 0 ? '#4CAF82' : '#EF4444',
              background: quotaLeft > 0 ? 'rgba(76,175,130,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '4px 10px',
              borderRadius: 20,
              fontWeight: 500,
            }}>
              ✦ {quotaTotal - quotaLeft}/{quotaTotal} utilisées
            </span>
          </div>
        </div>

        <div className="matieres-eleve-body">
          {chapitreSelectionne ? (
            <TableauContenu
              chapitre={chapitreSelectionne}
              matiereSlug={selection?.matiereSlug}
              chapitreSlug={selection?.chapitreSlug}
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

      {/* Modale saisie réponse élève (correction exercice) */}
      {attenteReponse && (
        <div
          onClick={() => { setAttenteReponse(null); setReponseEleve(''); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 60, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#162030', border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12, width: '90vw', maxWidth: 500,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '14px 18px',
              borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F4F8', fontFamily: "'DM Sans', sans-serif" }}>
                ✦ Correction : {attenteReponse.titre}
              </span>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 13, color: '#7A90A8', fontFamily: "'DM Sans', sans-serif" }}>
                Écris ta réponse ci-dessous, puis clique sur Corriger :
              </label>
              <textarea
                value={reponseEleve}
                onChange={e => setReponseEleve(e.target.value)}
                placeholder="Écris ta réponse ici..."
                rows={6}
                style={{
                  width: '100%', background: '#0F1923', border: '0.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: 12, color: '#F0F4F8', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", resize: 'vertical', outline: 'none',
                }}
              />
            </div>
            <div style={{
              padding: '12px 18px', borderTop: '0.5px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'flex-end', gap: 8,
            }}>
              <button
                onClick={() => { setAttenteReponse(null); setReponseEleve(''); }}
                style={{
                  fontSize: 12, padding: '6px 16px', borderRadius: 8,
                  border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent',
                  color: '#7A90A8', cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => handleGenerate('exercices')}
                disabled={!reponseEleve.trim()}
                style={{
                  fontSize: 12, padding: '6px 16px', borderRadius: 8,
                  border: 'none', background: reponseEleve.trim() ? '#4CAF82' : '#1E3A5F',
                  color: 'white', cursor: reponseEleve.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600, opacity: reponseEleve.trim() ? 1 : 0.5,
                }}
              >
                Corriger ma réponse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader génération */}
      {generationEnCours && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60,
        }}>
          <div style={{
            background: '#162030', borderRadius: 12, padding: 30,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: '#4CAF82', borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />
            <span style={{ fontSize: 13, color: '#7A90A8', fontFamily: "'DM Sans', sans-serif" }}>
              Génération en cours...
            </span>
          </div>
        </div>
      )}

      {/* Modale résultat IA */}
      {resultatIA && (
        <div
          onClick={() => setResultatIA(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 60, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#162030', border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12, width: '90vw', maxWidth: 700, maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F4F8', fontFamily: "'DM Sans', sans-serif" }}>
                ✦ {resultatIA.titre}
              </span>
              <button
                onClick={() => setResultatIA(null)}
                style={{ background: 'none', border: 'none', color: '#7A90A8', cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-code:text-brand-vert">
                <ReactMarkdown>{resultatIA.contenu}</ReactMarkdown>
              </div>
            </div>
            <div style={{
              padding: '12px 18px', borderTop: '0.5px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setResultatIA(null)}
                style={{
                  fontSize: 12, padding: '6px 16px', borderRadius: 8,
                  border: 'none', background: '#1E3A5F', color: 'white',
                  cursor: 'pointer', fontWeight: 500,
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale upgrade quota */}
      {modaleUpgrade && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60,
        }}>
          <div style={{
            background: '#162030', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 24, width: 360, textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F0F4F8', marginBottom: 8 }}>
              Limite atteinte
            </h3>
            <p style={{ fontSize: 13, color: '#7A90A8', marginBottom: 20, lineHeight: 1.5 }}>
              Tu as utilisé tes {quotaTotal} générations du jour.
              Passe au plan Premium pour 20 générations par jour !
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={() => setModaleUpgrade(false)}
                style={{
                  fontSize: 12, padding: '8px 16px', borderRadius: 8,
                  border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent',
                  color: '#7A90A8', cursor: 'pointer',
                }}
              >
                Rester gratuit
              </button>
              <button
                onClick={() => { setModaleUpgrade(false); window.location.href = '/profil'; }}
                style={{
                  fontSize: 12, padding: '8px 16px', borderRadius: 8,
                  border: 'none', background: '#4CAF82', color: 'white',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                Passer Premium
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale génération IA (choix quiz/fiche/exercices) */}
      <ModaleIA
        open={modalIA !== null}
        ressource={modalIA}
        quotaLeft={quotaLeft}
        isPremium={isPremium}
        onClose={() => setModalIA(null)}
        onGenerate={handleGenerate}
      />

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
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .matieres-eleve-header { padding: 16px 16px 0; }
          .matieres-eleve-body { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
