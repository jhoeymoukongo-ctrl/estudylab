"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronRight, GripVertical, X } from "lucide-react";
import type { NiveauAvecMatieres } from "@/types";

interface Props {
  niveaux: NiveauAvecMatieres[];
  selectedChapId: string | null;
  onSelectChap: (id: string) => void;
  mode: "admin" | "eleve";
  onReorderChapitres: (matId: string, items: { id: string; ordre: number }[]) => void;
}

// ── Sidebar desktop + drawer mobile ──────────────────────────────────────────
export default function SidebarArborescente({
  niveaux,
  selectedChapId,
  onSelectChap,
  mode,
  onReorderChapitres,
}: Props) {
  // Niveaux ouverts/fermés
  const [niveauxOuverts, setNiveauxOuverts] = useState<Set<string>>(() => {
    // Ouvrir le premier niveau par défaut
    const set = new Set<string>();
    if (niveaux.length > 0) set.add(niveaux[0].id);
    return set;
  });

  // Matières ouvertes/fermées
  const [matieresOuvertes, setMatieresOuvertes] = useState<Set<string>>(() => {
    // Ouvrir la première matière du premier niveau
    const set = new Set<string>();
    if (niveaux.length > 0 && niveaux[0].matieres.length > 0) {
      set.add(niveaux[0].matieres[0].id);
    }
    return set;
  });

  // Drawer mobile
  const [drawerOuvert, setDrawerOuvert] = useState(false);

  // Drag & drop state
  const draggedId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const toggleNiveau = (id: string) => {
    setNiveauxOuverts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleMatiere = (id: string) => {
    setMatieresOuvertes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Drag & Drop handlers (admin only) ──────────────────────────────────────
  const handleDragStart = useCallback((chapId: string) => {
    draggedId.current = chapId;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, chapId: string) => {
    e.preventDefault();
    if (draggedId.current && draggedId.current !== chapId) {
      setDragOverId(chapId);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((matId: string, chapitres: { id: string; ordre: number }[], targetId: string) => {
    setDragOverId(null);
    if (!draggedId.current || draggedId.current === targetId) return;

    // Recalculer l'ordre après déplacement
    const ids = chapitres.map(c => c.id);
    const fromIdx = ids.indexOf(draggedId.current);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    // Retirer l'élément et l'insérer à la nouvelle position
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggedId.current);

    const items = reordered.map((id, idx) => ({ id, ordre: idx }));
    onReorderChapitres(matId, items);
    draggedId.current = null;
  }, [onReorderChapitres]);

  const handleDragEnd = useCallback(() => {
    draggedId.current = null;
    setDragOverId(null);
  }, []);

  const handleSelectChap = (id: string) => {
    onSelectChap(id);
    // Fermer le drawer mobile après sélection
    setDrawerOuvert(false);
  };

  // ── Rendu de l'arbre ───────────────────────────────────────────────────────
  const arbre = (
    <div className="sidebar-arbo-scroll">
      <div className="sidebar-arbo-header">Arborescence</div>

      {niveaux.map(niveau => (
        <div key={niveau.id}>
          {/* Niveau */}
          <button
            className="sidebar-arbo-niveau"
            onClick={() => toggleNiveau(niveau.id)}
          >
            <ChevronRight
              size={12}
              className={`sidebar-arbo-fleche ${niveauxOuverts.has(niveau.id) ? "sidebar-arbo-fleche--ouvert" : ""}`}
            />
            <span>{niveau.nom}</span>
          </button>

          {niveauxOuverts.has(niveau.id) && niveau.matieres.map(matiere => (
            <div key={matiere.id}>
              {/* Matière */}
              <button
                className="sidebar-arbo-matiere"
                onClick={() => toggleMatiere(matiere.id)}
              >
                <ChevronRight
                  size={11}
                  className={`sidebar-arbo-fleche ${matieresOuvertes.has(matiere.id) ? "sidebar-arbo-fleche--ouvert" : ""}`}
                />
                <span className="sidebar-arbo-matiere-icon">{matiere.icon}</span>
                <span className="sidebar-arbo-matiere-nom">{matiere.nom}</span>
              </button>

              {matieresOuvertes.has(matiere.id) && (
                <div className="sidebar-arbo-chapitres">
                  {mode === "admin" && matiere.chapitres.length > 1 && (
                    <div className="sidebar-arbo-hint">⠿ Glisse pour réordonner</div>
                  )}

                  {matiere.chapitres.map(ch => (
                    <div
                      key={ch.id}
                      className={`sidebar-arbo-chapitre group ${
                        selectedChapId === ch.id ? "sidebar-arbo-chapitre--actif" : ""
                      } ${dragOverId === ch.id ? "sidebar-arbo-chapitre--dragover" : ""}`}
                      draggable={mode === "admin"}
                      onDragStart={() => handleDragStart(ch.id)}
                      onDragOver={(e) => handleDragOver(e, ch.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(matiere.id, matiere.chapitres, ch.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleSelectChap(ch.id)}
                    >
                      {mode === "admin" && (
                        <GripVertical
                          size={12}
                          className="sidebar-arbo-poignee"
                        />
                      )}
                      <span
                        className="sidebar-arbo-dot"
                        style={{ background: matiere.couleur }}
                      />
                      <span className="sidebar-arbo-chapitre-titre">
                        Ch.{ch.num} — {ch.titre.length > 20 ? ch.titre.slice(0, 20) + "…" : ch.titre}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <style>{`
        .sidebar-arbo-scroll {
          height: 100%;
          overflow-y: auto;
          padding: 12px 0;
        }
        .sidebar-arbo-header {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #7A90A8;
          padding: 0 16px 8px;
        }
        .sidebar-arbo-niveau {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #F0F4F8;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .sidebar-arbo-niveau:hover { background: rgba(255,255,255,0.03); }
        .sidebar-arbo-fleche {
          color: #7A90A8;
          transition: transform 0.15s;
          flex-shrink: 0;
        }
        .sidebar-arbo-fleche--ouvert { transform: rotate(90deg); }
        .sidebar-arbo-matiere {
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
          padding: 6px 16px 6px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: #7A90A8;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .sidebar-arbo-matiere:hover { color: #F0F4F8; }
        .sidebar-arbo-matiere-icon { font-size: 13px; }
        .sidebar-arbo-matiere-nom {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sidebar-arbo-chapitres { padding: 2px 0 4px; }
        .sidebar-arbo-hint {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: #7A90A8;
          padding: 2px 16px 4px 44px;
          opacity: 0.6;
        }
        .sidebar-arbo-chapitre {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px 5px 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #7A90A8;
          cursor: pointer;
          border-left: 2px solid transparent;
          transition: all 0.12s;
          user-select: none;
        }
        .sidebar-arbo-chapitre:hover {
          background: #1E2D40;
          color: #F0F4F8;
        }
        .sidebar-arbo-chapitre--actif {
          background: #1E3A5F;
          color: #F0F4F8;
          font-weight: 500;
          border-left-color: #4CAF82;
        }
        .sidebar-arbo-chapitre--dragover {
          border-top: 2px solid #4CAF82;
        }
        .sidebar-arbo-chapitre[draggable="true"] { cursor: grab; }
        .sidebar-arbo-chapitre[draggable="true"]:active { opacity: 0.3; cursor: grabbing; }
        .sidebar-arbo-poignee {
          color: #7A90A8;
          opacity: 0;
          flex-shrink: 0;
          cursor: grab;
          transition: opacity 0.12s;
        }
        .group:hover .sidebar-arbo-poignee { opacity: 0.5; }
        .sidebar-arbo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .sidebar-arbo-chapitre-titre {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        className="sidebar-arbo-mobile-btn"
        onClick={() => setDrawerOuvert(true)}
        aria-label="Ouvrir l'arborescence"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Sidebar desktop */}
      <aside className="sidebar-arbo-desktop">
        {arbre}
      </aside>

      {/* Drawer mobile */}
      {drawerOuvert && (
        <div className="sidebar-arbo-overlay" onClick={() => setDrawerOuvert(false)}>
          <aside
            className="sidebar-arbo-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="sidebar-arbo-drawer-header">
              <span>Arborescence</span>
              <button onClick={() => setDrawerOuvert(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            {arbre}
          </aside>
        </div>
      )}

      <style>{`
        .sidebar-arbo-mobile-btn {
          display: none;
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 40;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #1E3A5F;
          color: #F0F4F8;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .sidebar-arbo-desktop {
          width: 240px;
          min-width: 240px;
          height: 100%;
          background: #162030;
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .sidebar-arbo-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0,0,0,0.5);
        }
        .sidebar-arbo-drawer {
          width: 280px;
          height: 100%;
          background: #162030;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.2s ease;
        }
        .sidebar-arbo-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #F0F4F8;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sidebar-arbo-drawer-header button {
          background: none;
          border: none;
          color: #7A90A8;
          cursor: pointer;
          padding: 4px;
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 767px) {
          .sidebar-arbo-desktop { display: none; }
          .sidebar-arbo-mobile-btn { display: flex; }
          .sidebar-arbo-overlay { display: block; }
        }
      `}</style>
    </>
  );
}
