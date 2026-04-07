"use client";

import { useRef, useState, useCallback } from "react";
import { GripVertical, Pencil, Trash2, Sparkles, ExternalLink, Play, Plus } from "lucide-react";
import type { ChapitreAvecRessources, RessourceContenu, TypeRessource } from "@/types";

interface Props {
  chapitre: ChapitreAvecRessources;
  matiereSlug?: string;
  chapitreSlug?: string;
  mode: "admin" | "eleve";
  quotaLeft: number;
  isPremium: boolean;
  onReorderRessources: (items: { id: string; ordre: number }[]) => void;
  onDeleteRessource: (id: string, type: TypeRessource) => void;
  onOpenUpload: (type: TypeRessource) => void;
  onOpenIA: (ressource: RessourceContenu) => void;
  onOpenQuizEditor: (chapitreId: string) => void;
  onPreviewRessource?: (ressource: RessourceContenu) => void;
}

// Badge format avec couleur
function BadgeFormat({ ext }: { ext: string | null }) {
  if (!ext) return null;
  const styles: Record<string, string> = {
    pdf: "badge-format--pdf",
    docx: "badge-format--docx",
    md: "badge-format--md",
    png: "badge-format--png",
    lien: "badge-format--lien",
  };
  return (
    <span className={`badge-format ${styles[ext] ?? ""}`}>
      {ext.toUpperCase()}
    </span>
  );
}

// Label type ressource
function labelType(type: TypeRessource): string {
  switch (type) {
    case "lecon": return "Leçon";
    case "exercice": return "Exercice";
    case "fiche": return "Fiche";
    case "quiz": return "Quiz";
  }
}

function getLienRessource(
  r: RessourceContenu,
  matiereSlug: string,
  chapitreSlug: string
): string {
  switch (r.type) {
    case "lecon":
      return r.fichier_url
        ? r.fichier_url
        : `/matieres/${matiereSlug}/${chapitreSlug}/${r.slug ?? r.id}`;
    case "exercice":
      return r.fichier_url ? r.fichier_url : `/exercices/${r.id}`;
    case "fiche":
      return r.fichier_url ? r.fichier_url : `/fiches/${r.id}`;
    case "quiz":
      return `/quiz/${r.quiz_id ?? r.id}`;
    default:
      return "#";
  }
}

export default function TableauContenu({
  chapitre,
  matiereSlug,
  chapitreSlug,
  mode,
  quotaLeft,
  isPremium,
  onReorderRessources,
  onDeleteRessource,
  onOpenUpload,
  onOpenIA,
  onOpenQuizEditor,
  onPreviewRessource,
}: Props) {
  // Drag & drop state
  const draggedRowId = useRef<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const handleDragStart = useCallback((id: string) => {
    draggedRowId.current = id;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedRowId.current && draggedRowId.current !== id) {
      setDragOverRowId(id);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverRowId(null);
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    setDragOverRowId(null);
    if (!draggedRowId.current || draggedRowId.current === targetId) return;

    const ids = chapitre.ressources.map(r => r.id);
    const fromIdx = ids.indexOf(draggedRowId.current);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggedRowId.current);

    const items = reordered.map((id, idx) => ({ id, ordre: idx }));
    onReorderRessources(items);
    draggedRowId.current = null;
  }, [chapitre.ressources, onReorderRessources]);

  const handleDragEnd = useCallback(() => {
    draggedRowId.current = null;
    setDragOverRowId(null);
  }, []);

  const nbRessources = chapitre.ressources.length + (chapitre.quiz_id ? 1 : 0);

  return (
    <div className="tableau-contenu">
      {/* Header chapitre */}
      <div className="tableau-header">
        <span className="tableau-header-titre">
          Ch.{chapitre.num} — {chapitre.titre}
        </span>
        <span className="tableau-header-count">
          {nbRessources} ressource{nbRessources > 1 ? "s" : ""}
        </span>
      </div>

      {/* Hint drag (admin) */}
      {mode === "admin" && chapitre.ressources.length > 1 && (
        <div className="tableau-hint">⠿ Glisse les lignes pour réordonner</div>
      )}

      {/* Table */}
      <div className="tableau-body">
        <table className="tableau-table">
          <thead>
            <tr>
              {mode === "admin" && <th className="tableau-th tableau-th--grip"></th>}
              <th className="tableau-th tableau-th--type">Type</th>
              <th className="tableau-th tableau-th--titre">Titre</th>
              <th className="tableau-th tableau-th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Ressources (leçons, exercices, fiches) */}
            {chapitre.ressources.map((r, idx) => (
              <tr
                key={r.id}
                className={`tableau-row group ${dragOverRowId === r.id ? "tableau-row--dragover" : ""}`}
                draggable={mode === "admin"}
                onDragStart={() => handleDragStart(r.id)}
                onDragOver={(e) => handleDragOver(e, r.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(r.id)}
                onDragEnd={handleDragEnd}
              >
                {mode === "admin" && (
                  <td className="tableau-td tableau-td--grip">
                    <GripVertical size={12} className="tableau-poignee" />
                  </td>
                )}
                <td className="tableau-td tableau-td--type">
                  <span className="tableau-type-label">{labelType(r.type)}</span>
                </td>
                <td className="tableau-td tableau-td--titre">
                  {mode === "eleve" && r.type === "lecon" && matiereSlug && chapitreSlug ? (
                    <a
                      href={`/matieres/${matiereSlug}/${chapitreSlug}/${r.slug ?? r.id}`}
                      className="tableau-titre-lien"
                    >
                      {chapitre.num}.{idx + 1} {r.titre}
                    </a>
                  ) : (
                    <span className="tableau-titre-texte">
                      {chapitre.num}.{idx + 1} {r.titre}
                    </span>
                  )}
                  <BadgeFormat ext={r.ext} />
                </td>
                <td className="tableau-td tableau-td--actions">
                  {mode === "admin" ? (
                    <div className="tableau-actions">
                      {matiereSlug && chapitreSlug && (
                        <a
                          href={getLienRessource(r, matiereSlug, chapitreSlug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tableau-btn tableau-btn--link"
                          title="Visualiser"
                        >
                          <ExternalLink size={13} />
                          <span>Voir</span>
                        </a>
                      )}
                      {onPreviewRessource && (r.url || r.ext) && (
                        <button
                          className="tableau-btn tableau-btn--preview"
                          title="Prévisualiser le document"
                          onClick={() => onPreviewRessource(r)}
                        >
                          👁
                        </button>
                      )}
                      <button
                        className="tableau-btn tableau-btn--edit"
                        title="Modifier"
                        onClick={() => onOpenIA(r)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="tableau-btn tableau-btn--delete"
                        title="Supprimer"
                        onClick={() => onDeleteRessource(r.id, r.type)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="tableau-actions">
                      {/* Si la ressource a un fichier → ouvrir directement */}
                      {r.fichier_url ? (
                        <a
                          href={r.fichier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tableau-btn tableau-btn--voir"
                        >
                          <Play size={13} />
                          <span>{r.type === "lecon" ? "Lire" : "Ouvrir"}</span>
                        </a>
                      ) : r.type === "lecon" && matiereSlug && chapitreSlug ? (
                        <a
                          href={`/matieres/${matiereSlug}/${chapitreSlug}/${r.slug ?? r.id}`}
                          className="tableau-btn tableau-btn--voir"
                        >
                          <Play size={13} />
                          <span>Lire</span>
                        </a>
                      ) : null}
                      {/* Bouton Générer IA — toujours visible */}
                      <button
                        className="tableau-btn tableau-btn--ia"
                        title="Generer avec Eli"
                        onClick={() => onOpenIA(r)}
                        disabled={quotaLeft <= 0 && !isPremium}
                      >
                        <Sparkles size={13} />
                        <span>Générer</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {/* Section Quiz — toujours en dernier, non draggable */}
            {(mode === "admin" || chapitre.quiz_id) && (
              <tr className="tableau-row tableau-row--quiz">
                {mode === "admin" && <td className="tableau-td"></td>}
                <td className="tableau-td tableau-td--type">
                  <span className="tableau-type-label tableau-type-label--quiz">Quiz</span>
                </td>
                <td className="tableau-td tableau-td--titre">
                  {chapitre.quiz_id ? (
                    <span>Quiz ch.{chapitre.num}</span>
                  ) : (
                    <span className="tableau-quiz-vide">Aucun quiz associé</span>
                  )}
                </td>
                <td className="tableau-td tableau-td--actions">
                  {mode === "admin" ? (
                    <div className="tableau-actions">
                      {chapitre.quiz_id && (
                        <a
                          href={`/quiz/${chapitre.quiz_id}`}
                          className="tableau-btn tableau-btn--voir"
                        >
                          → Voir
                        </a>
                      )}
                      <button
                        className="tableau-btn tableau-btn--creer"
                        onClick={() => onOpenQuizEditor(chapitre.id)}
                      >
                        <Plus size={13} />
                        Créer quiz IA
                      </button>
                    </div>
                  ) : (
                    <div className="tableau-actions">
                      {chapitre.quiz_id && (
                        <a
                          href={`/quiz/${chapitre.quiz_id}`}
                          className="tableau-btn tableau-btn--voir"
                        >
                          <Play size={13} />
                          Faire le quiz
                        </a>
                      )}
                      {chapitre.quiz_id && (
                        <button
                          className="tableau-btn tableau-btn--ia"
                          onClick={() => onOpenQuizEditor(chapitre.id)}
                          disabled={quotaLeft <= 0 && !isPremium}
                        >
                          <Sparkles size={13} />
                          Générer
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Boutons ajout (admin only) */}
      {mode === "admin" && (
        <div className="tableau-footer">
          {(["lecon", "exercice", "fiche"] as TypeRessource[]).map(type => (
            <button
              key={type}
              className="tableau-btn-ajout"
              onClick={() => onOpenUpload(type)}
            >
              <Plus size={13} />
              {labelType(type)}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .tableau-contenu {
          background: #0F1923;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          overflow: hidden;
        }
        .tableau-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #1E3A5F;
          font-family: 'DM Sans', sans-serif;
        }
        .tableau-header-titre {
          font-size: 14px;
          font-weight: 700;
          color: #F0F4F8;
        }
        .tableau-header-count {
          font-size: 12px;
          color: rgba(240,244,248,0.6);
        }
        .tableau-hint {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: #7A90A8;
          padding: 6px 20px 2px;
          opacity: 0.6;
        }
        .tableau-body { overflow-x: auto; }
        .tableau-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'DM Sans', sans-serif;
        }
        .tableau-th {
          text-align: left;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          color: #7A90A8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .tableau-th--grip { width: 28px; }
        .tableau-th--type { width: 80px; }
        .tableau-th--actions { width: 140px; text-align: right; }
        .tableau-row {
          transition: background 0.1s;
          cursor: default;
        }
        .tableau-row:hover { background: rgba(255,255,255,0.02); }
        .tableau-row--dragover { border-top: 2px solid #4CAF82; }
        .tableau-row--quiz { background: rgba(30,58,95,0.15); }
        .tableau-row[draggable="true"] { cursor: grab; }
        .tableau-row[draggable="true"]:active { opacity: 0.3; }
        .tableau-td {
          padding: 10px 12px;
          font-size: 13px;
          color: #F0F4F8;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        .tableau-td--grip { width: 28px; }
        .tableau-poignee {
          color: #7A90A8;
          opacity: 0;
          cursor: grab;
          transition: opacity 0.12s;
        }
        .group:hover .tableau-poignee { opacity: 0.5; }
        .tableau-type-label {
          font-size: 11px;
          font-weight: 500;
          color: #7A90A8;
        }
        .tableau-type-label--quiz { color: #FFD966; font-weight: 600; }
        .tableau-td--titre {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tableau-titre-texte {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tableau-titre-lien {
          color: #4CAF82;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
        }
        .tableau-titre-lien:hover { text-decoration: underline; }
        .tableau-quiz-vide {
          font-style: italic;
          color: #7A90A8;
          font-size: 12px;
        }
        .tableau-td--actions { text-align: right; }
        .tableau-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }
        .tableau-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: opacity 0.12s;
          text-decoration: none;
        }
        .tableau-btn:hover { opacity: 0.8; }
        .tableau-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tableau-btn--edit { background: rgba(255,255,255,0.06); color: #7A90A8; }
        .tableau-btn--delete { background: rgba(239,68,68,0.1); color: #EF4444; }
        .tableau-btn--preview { background: rgba(255,255,255,0.06); color: #7A90A8; font-size: 12px; }
        .tableau-btn--link { background: rgba(255,255,255,0.06); color: #7A90A8; }
        .tableau-btn--ia { background: rgba(255,217,102,0.1); color: #FFD966; }
        .tableau-btn--voir { background: rgba(76,175,130,0.1); color: #4CAF82; }
        .tableau-btn--creer { background: #4CAF82; color: #0F1923; }

        .badge-format {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .badge-format--pdf { background: rgba(239,68,68,0.15); color: #EF4444; }
        .badge-format--docx { background: rgba(59,130,246,0.15); color: #3B82F6; }
        .badge-format--md { background: rgba(168,85,247,0.15); color: #A855F7; }
        .badge-format--png { background: rgba(76,175,130,0.15); color: #4CAF82; }
        .badge-format--lien { background: rgba(255,217,102,0.15); color: #FFD966; }

        .tableau-footer {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          border-top: 1px dashed rgba(76,175,130,0.2);
          background: #162030;
          flex-wrap: wrap;
        }
        .tableau-btn-ajout {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #4CAF82;
          background: transparent;
          border: 1px dashed rgba(76,175,130,0.4);
          cursor: pointer;
          transition: all 0.12s;
        }
        .tableau-btn-ajout:hover {
          background: rgba(76,175,130,0.1);
          border-color: #4CAF82;
        }
      `}</style>
    </div>
  );
}
