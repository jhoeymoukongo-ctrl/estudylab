"use client";

import { useState } from "react";
import { X, Sparkles, FileText, HelpCircle, PenTool } from "lucide-react";
import type { RessourceContenu } from "@/types";

interface Props {
  open: boolean;
  ressource: RessourceContenu | null;
  quotaLeft: number;
  isPremium: boolean;
  onClose: () => void;
  onGenerate: (action: "quiz" | "fiche" | "expliquer" | "exercices") => void;
}

const OPTIONS = [
  { key: "quiz" as const, label: "Générer un quiz", icon: Sparkles, couleur: "#FFD966" },
  { key: "fiche" as const, label: "Générer une fiche", icon: FileText, couleur: "#4CAF82" },
  { key: "expliquer" as const, label: "Expliquer le contenu", icon: HelpCircle, couleur: "#3B82F6" },
  { key: "exercices" as const, label: "Générer des exercices", icon: PenTool, couleur: "#A855F7" },
];

export default function ModaleIA({ open, ressource, quotaLeft, isPremium, onClose, onGenerate }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleClick = (action: "quiz" | "fiche" | "expliquer" | "exercices") => {
    setLoading(action);
    onGenerate(action);
    // Le parent gère la fermeture
  };

  const quotaEpuise = quotaLeft <= 0 && !isPremium;

  if (!open || !ressource) return null;

  return (
    <div className="modale-ia-overlay" onClick={onClose}>
      <div className="modale-ia" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modale-ia-header">
          <div>
            <span className="modale-ia-titre">Générer avec Eli</span>
            <span className="modale-ia-ressource">{ressource.titre}</span>
          </div>
          <button onClick={onClose} className="modale-ia-close" aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {/* Quota badge */}
        <div className="modale-ia-quota">
          {isPremium ? (
            <span className="modale-ia-quota-badge modale-ia-quota-badge--premium">
              Premium — Illimité
            </span>
          ) : (
            <span className={`modale-ia-quota-badge ${quotaEpuise ? "modale-ia-quota-badge--epuise" : ""}`}>
              {quotaLeft} génération{quotaLeft > 1 ? "s" : ""} restante{quotaLeft > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Options */}
        <div className="modale-ia-options">
          {OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                className="modale-ia-option"
                onClick={() => handleClick(opt.key)}
                disabled={quotaEpuise || loading !== null}
                style={{ "--accent": opt.couleur } as React.CSSProperties}
              >
                <Icon size={16} style={{ color: opt.couleur }} />
                <span>{opt.label}</span>
                {loading === opt.key && <span className="modale-ia-spinner" />}
              </button>
            );
          })}
        </div>

        {quotaEpuise && (
          <div className="modale-ia-cta">
            Quota épuisé — <a href="/parametres">Passer en Premium</a>
          </div>
        )}
      </div>

      <style>{`
        .modale-ia-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modale-ia {
          width: 340px;
          max-width: 90vw;
          background: #162030;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .modale-ia-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 18px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .modale-ia-titre {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #F0F4F8;
        }
        .modale-ia-ressource {
          display: block;
          font-size: 11px;
          color: #7A90A8;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 240px;
        }
        .modale-ia-close {
          background: none;
          border: none;
          color: #7A90A8;
          cursor: pointer;
          padding: 4px;
        }
        .modale-ia-quota {
          padding: 10px 18px;
        }
        .modale-ia-quota-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(76,175,130,0.1);
          color: #4CAF82;
        }
        .modale-ia-quota-badge--premium {
          background: rgba(76,175,130,0.15);
          color: #4CAF82;
        }
        .modale-ia-quota-badge--epuise {
          background: rgba(239,68,68,0.1);
          color: #EF4444;
        }
        .modale-ia-options {
          padding: 4px 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .modale-ia-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #F0F4F8;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          text-align: left;
        }
        .modale-ia-option:hover:not(:disabled) {
          background: rgba(255,255,255,0.06);
          border-color: var(--accent);
        }
        .modale-ia-option:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .modale-ia-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spinIA 0.6s linear infinite;
          margin-left: auto;
        }
        @keyframes spinIA {
          to { transform: rotate(360deg); }
        }
        .modale-ia-cta {
          padding: 12px 18px;
          font-size: 12px;
          color: #FFD966;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .modale-ia-cta a {
          color: #FFD966;
          text-decoration: underline;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
