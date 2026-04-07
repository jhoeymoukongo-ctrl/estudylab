"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown, GripVertical, X } from "lucide-react";
import type { NiveauAvecMatieres } from "@/types";

interface Props {
  niveaux: NiveauAvecMatieres[];
  selectedChapId: string | null;
  onSelectChap: (id: string) => void;
  mode: "admin" | "eleve";
  onReorderChapitres: (matId: string, items: { id: string; ordre: number }[]) => void;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** Badge coloré selon le nom du niveau */
function getBadgeStyle(nom: string): { bg: string; text: string } {
  const n = nom.toLowerCase();
  if (n.includes("terminale")) return { bg: "rgba(30,58,95,0.35)", text: "#5B9BD5" };
  if (n.includes("1ère") || n.includes("1ere")) return { bg: "rgba(76,175,130,0.15)", text: "#4CAF82" };
  if (n.includes("2nde")) return { bg: "rgba(255,217,102,0.15)", text: "#FFD966" };
  if (n.includes("3ème") || n.includes("3eme")) return { bg: "rgba(168,85,247,0.15)", text: "#A855F7" };
  if (n.includes("bts")) return { bg: "rgba(239,68,68,0.12)", text: "#EF4444" };
  if (n.includes("but")) return { bg: "rgba(251,146,60,0.12)", text: "#FB923C" };
  if (n.includes("licence")) return { bg: "rgba(56,189,248,0.12)", text: "#38BDF8" };
  return { bg: "rgba(255,255,255,0.06)", text: "#7A90A8" };
}

/** Nom court pour le badge (ex: "Terminale Générale" → "Term. G") */
function getNomCourt(nom: string): string {
  const n = nom.toLowerCase();
  if (n.includes("terminale") && n.includes("générale")) return "Term. G";
  if (n.includes("terminale") && n.includes("sti2d")) return "Term. STI2D";
  if (n.includes("terminale") && n.includes("stmg")) return "Term. STMG";
  if (n.includes("terminale")) return "Term.";
  if (n.includes("1ère") && n.includes("générale")) return "1ère G";
  if (n.includes("1ère") && n.includes("sti2d")) return "1ère STI2D";
  if (n.includes("1ère") && n.includes("stmg")) return "1ère STMG";
  if (n.includes("1ère") || n.includes("1ere")) return "1ère";
  if (n.includes("2nde")) return "2nde";
  if (n.includes("3ème") || n.includes("3eme")) return "3ème";
  if (n.includes("bts 1")) return "BTS 1";
  if (n.includes("bts 2")) return "BTS 2";
  return nom.length > 12 ? nom.slice(0, 12) + "…" : nom;
}

/* ── Composant ───────────────────────────────────────────────────────────── */

export default function SidebarArborescente({
  niveaux,
  selectedChapId,
  onSelectChap,
  mode,
  onReorderChapitres,
}: Props) {
  // Ouvrir le premier niveau + première matière par défaut
  const [niveauxOuverts, setNiveauxOuverts] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (niveaux.length > 0) set.add(niveaux[0].id);
    return set;
  });

  const [matieresOuvertes, setMatieresOuvertes] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (niveaux.length > 0 && niveaux[0].matieres.length > 0) {
      set.add(niveaux[0].matieres[0].id);
    }
    return set;
  });

  const [drawerOuvert, setDrawerOuvert] = useState(false);

  // Drag & drop
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

  // ── Drag & Drop (admin only) ──────────────────────────────────────────
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

  const handleDrop = useCallback(
    (matId: string, chapitres: { id: string; ordre: number }[], targetId: string) => {
      setDragOverId(null);
      if (!draggedId.current || draggedId.current === targetId) return;

      const ids = chapitres.map(c => c.id);
      const fromIdx = ids.indexOf(draggedId.current);
      const toIdx = ids.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      const reordered = [...ids];
      reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, draggedId.current);

      const items = reordered.map((id, idx) => ({ id, ordre: idx }));
      onReorderChapitres(matId, items);
      draggedId.current = null;
    },
    [onReorderChapitres]
  );

  const handleDragEnd = useCallback(() => {
    draggedId.current = null;
    setDragOverId(null);
  }, []);

  const handleSelectChap = (id: string) => {
    onSelectChap(id);
    setDrawerOuvert(false);
  };

  // ── Styles inline ─────────────────────────────────────────────────────
  const S = {
    scroll: {
      height: "100%",
      overflowY: "auto" as const,
      padding: "14px 0",
    },
    header: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.08em",
      color: "#556B82",
      padding: "0 16px 10px",
    },
    niveau: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      padding: "9px 16px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      fontWeight: 600,
      color: "#F0F4F8",
      background: "none",
      border: "none",
      cursor: "pointer",
      textAlign: "left" as const,
    },
    badge: (nom: string) => {
      const { bg, text } = getBadgeStyle(nom);
      return {
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 5,
        background: bg,
        color: text,
        lineHeight: "16px",
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
      };
    },
    niveauNom: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
      flex: 1,
    },
    chevron: (ouvert: boolean) => ({
      color: "#556B82",
      transition: "transform 0.15s",
      transform: ouvert ? "rotate(0deg)" : "rotate(-90deg)",
      flexShrink: 0,
    }),
    matiere: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      width: "100%",
      padding: "6px 16px 6px 30px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12,
      fontWeight: 500,
      color: "#7A90A8",
      background: "none",
      border: "none",
      cursor: "pointer",
      textAlign: "left" as const,
    },
    matiereIcon: { fontSize: 13 },
    matiereNom: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
      flex: 1,
    },
    chapitres: { padding: "2px 0 6px" },
    chapitre: (isActif: boolean, isDragOver: boolean) => ({
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 12px 5px 42px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 12,
      color: isActif ? "#F0F4F8" : "#7A90A8",
      fontWeight: isActif ? 600 : 400,
      background: isActif ? "rgba(30,58,95,0.5)" : "transparent",
      borderLeft: isActif ? "2px solid #4CAF82" : "2px solid transparent",
      borderTop: isDragOver ? "2px solid #4CAF82" : "2px solid transparent",
      cursor: mode === "admin" ? "grab" : "pointer",
      userSelect: "none" as const,
      transition: "all 0.12s",
    }),
    dot: (couleur: string) => ({
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: couleur,
      flexShrink: 0,
    }),
    chapTitre: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    },
    grip: {
      color: "#556B82",
      opacity: 0.4,
      flexShrink: 0,
    },
    hint: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 10,
      color: "#556B82",
      padding: "2px 16px 4px 46px",
      opacity: 0.6,
    },
  };

  // ── Rendu arbre ───────────────────────────────────────────────────────
  const arbre = (
    <div style={S.scroll}>
      <div style={S.header}>Arborescence</div>

      {niveaux.map(niveau => {
        const nOuvert = niveauxOuverts.has(niveau.id);
        return (
          <div key={niveau.id}>
            {/* Niveau */}
            <button
              style={S.niveau}
              onClick={() => toggleNiveau(niveau.id)}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
            >
              <span style={S.badge(niveau.nom)}>{getNomCourt(niveau.nom)}</span>
              <span style={S.niveauNom}>{niveau.nom}</span>
              <ChevronDown size={14} style={S.chevron(nOuvert)} />
            </button>

            {nOuvert && niveau.matieres.map(matiere => {
              const mOuvert = matieresOuvertes.has(matiere.id);
              return (
                <div key={matiere.id}>
                  {/* Matière */}
                  <button
                    style={S.matiere}
                    onClick={() => toggleMatiere(matiere.id)}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#F0F4F8"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#7A90A8"; }}
                  >
                    <ChevronDown size={11} style={S.chevron(mOuvert)} />
                    <span style={S.matiereIcon}>{matiere.icon}</span>
                    <span style={S.matiereNom}>{matiere.nom}</span>
                  </button>

                  {mOuvert && (
                    <div style={S.chapitres}>
                      {mode === "admin" && matiere.chapitres.length > 1 && (
                        <div style={S.hint}>Glisse pour réordonner</div>
                      )}

                      {matiere.chapitres.map(ch => {
                        const isActif = selectedChapId === ch.id;
                        const isDragOver = dragOverId === ch.id;

                        return (
                          <div
                            key={ch.id}
                            style={S.chapitre(isActif, isDragOver)}
                            draggable={mode === "admin"}
                            onDragStart={() => handleDragStart(ch.id)}
                            onDragOver={e => handleDragOver(e, ch.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={() => handleDrop(matiere.id, matiere.chapitres, ch.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleSelectChap(ch.id)}
                            onMouseEnter={e => {
                              if (!isActif) {
                                (e.currentTarget as HTMLDivElement).style.background = "rgba(30,45,64,0.6)";
                                (e.currentTarget as HTMLDivElement).style.color = "#F0F4F8";
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isActif) {
                                (e.currentTarget as HTMLDivElement).style.background = "transparent";
                                (e.currentTarget as HTMLDivElement).style.color = "#7A90A8";
                              }
                            }}
                          >
                            {mode === "admin" && (
                              <GripVertical size={12} style={S.grip} />
                            )}
                            <span style={S.dot(matiere.couleur)} />
                            <span style={S.chapTitre}>
                              Ch.{ch.num} — {ch.titre.length > 22 ? ch.titre.slice(0, 22) + "…" : ch.titre}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        className="sidebar-arbo-mobile-btn"
        onClick={() => setDrawerOuvert(true)}
        aria-label="Ouvrir l&apos;arborescence"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Sidebar desktop */}
      <aside style={{
        width: 250,
        minWidth: 250,
        height: "100%",
        background: "#131D2A",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }} className="sidebar-arbo-desktop">
        {arbre}
      </aside>

      {/* Drawer mobile */}
      {drawerOuvert && (
        <div
          className="sidebar-arbo-overlay"
          onClick={() => setDrawerOuvert(false)}
        >
          <aside
            className="sidebar-arbo-drawer"
            onClick={e => e.stopPropagation()}
            style={{
              width: 290,
              height: "100%",
              background: "#131D2A",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              animation: "slideIn 0.2s ease",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#F0F4F8",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span>Arborescence</span>
              <button
                onClick={() => setDrawerOuvert(false)}
                aria-label="Fermer"
                style={{ background: "none", border: "none", color: "#7A90A8", cursor: "pointer", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>
            {arbre}
          </aside>
        </div>
      )}

      {/* Styles résiduels pour responsive + animations */}
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
        .sidebar-arbo-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0,0,0,0.5);
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 767px) {
          .sidebar-arbo-desktop { display: none !important; }
          .sidebar-arbo-mobile-btn { display: flex; }
          .sidebar-arbo-overlay { display: block; }
        }
      `}</style>
    </>
  );
}
