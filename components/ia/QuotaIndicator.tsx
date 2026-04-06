"use client";

import { useEffect, useState } from "react";
import { Zap, Crown, X, AlertTriangle } from "lucide-react";

interface QuotaData {
  quotaUtilise: number;
  quotaMax: number;
  quotaRestant: number;
  estPremium: boolean;
}

interface QuotaIndicatorProps {
  // Appelé par le parent pour rafraîchir après chaque message envoyé
  refreshTrigger?: number;
  // Callback pour désactiver l'input du chat quand quota = 0
  onQuotaEpuise?: (epuise: boolean) => void;
}

export default function QuotaIndicator({
  refreshTrigger = 0,
  onQuotaEpuise,
}: QuotaIndicatorProps) {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [bannerFerme, setBannerFerme] = useState(false);

  // Recharger à chaque message envoyé
  useEffect(() => {
    let annule = false;
    async function chargerQuota() {
      try {
        const res = await fetch("/api/quota");
        if (!res.ok || annule) return;
        const data: QuotaData = await res.json();
        if (annule) return;
        setQuota(data);
        onQuotaEpuise?.(data.quotaRestant === 0);
      } catch {
        // Silencieux — ne pas bloquer l'UI si l'API quota échoue
      }
    }
    chargerQuota();
    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  if (!quota) return null;

  const pourcentageRestant = (quota.quotaRestant / quota.quotaMax) * 100;
  const estEpuise = quota.quotaRestant === 0;
  const estBas = quota.quotaRestant <= 1 && !estEpuise;

  // ── Banner quota épuisé ───────────────────────────────────────────────────
  if (estEpuise && !bannerFerme) {
    return (
      <div className="quota-banner-epuise">
        <div className="quota-banner-inner">
          <div className="quota-banner-left">
            <span className="quota-banner-icon">
              <AlertTriangle size={16} />
            </span>
            <span className="quota-banner-texte">
              Tu as utilisé tes <strong>{quota.quotaMax} messages</strong> du jour.
              Reviens demain ou passe à Premium.
            </span>
          </div>
          <div className="quota-banner-actions">
            <a href="/profil" className="quota-btn-premium">
              <Crown size={13} />
              Passer à Premium
            </a>
            <button
              className="quota-banner-fermer"
              onClick={() => setBannerFerme(true)}
              aria-label="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <style>{`
          .quota-banner-epuise {
            position: sticky;
            top: 0;
            z-index: 50;
            background: linear-gradient(135deg, #1a0f00 0%, #2d1800 100%);
            border-bottom: 1px solid rgba(255, 217, 102, 0.3);
            padding: 10px 16px;
            animation: slideDown 0.3s ease;
          }
          .quota-banner-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            max-width: 800px;
            margin: 0 auto;
          }
          .quota-banner-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .quota-banner-icon {
            color: #FFD966;
            display: flex;
            flex-shrink: 0;
          }
          .quota-banner-texte {
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            color: rgba(255, 217, 102, 0.9);
            line-height: 1.4;
          }
          .quota-banner-texte strong {
            color: #FFD966;
            font-weight: 600;
          }
          .quota-banner-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }
          .quota-btn-premium {
            display: flex;
            align-items: center;
            gap: 5px;
            background: #FFD966;
            color: #0F1923;
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            transition: opacity 0.15s;
            white-space: nowrap;
          }
          .quota-btn-premium:hover { opacity: 0.85; }
          .quota-banner-fermer {
            background: transparent;
            border: none;
            color: rgba(255, 217, 102, 0.5);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            transition: color 0.15s;
          }
          .quota-banner-fermer:hover { color: #FFD966; }
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── Badge compact (affiché en haut du chat) ───────────────────────────────
  return (
    <div className="quota-badge-wrapper">
      <div className={`quota-badge ${estBas ? "quota-badge--bas" : ""} ${quota.estPremium ? "quota-badge--premium" : ""}`}>
        {quota.estPremium ? (
          <>
            <Crown size={12} className="quota-badge-icon quota-badge-icon--crown" />
            <span className="quota-badge-label">Illimité</span>
          </>
        ) : (
          <>
            <Zap size={12} className="quota-badge-icon" />
            <span className="quota-badge-label">
              {quota.quotaRestant}/{quota.quotaMax} messages
            </span>
            {/* Barre de progression miniature */}
            <div className="quota-barre-fond">
              <div
                className="quota-barre-remplie"
                style={{ width: `${pourcentageRestant}%` }}
              />
            </div>
          </>
        )}
      </div>

      <style>{`
        .quota-badge-wrapper {
          display: flex;
          justify-content: center;
          padding: 8px 0 4px;
        }
        .quota-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(30, 45, 64, 0.8);
          border: 1px solid rgba(120, 144, 168, 0.2);
          border-radius: 20px;
          padding: 5px 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #7A90A8;
          transition: all 0.2s;
        }
        .quota-badge--bas {
          border-color: rgba(255, 217, 102, 0.3);
          color: #FFD966;
          background: rgba(255, 217, 102, 0.05);
        }
        .quota-badge--premium {
          border-color: rgba(76, 175, 130, 0.3);
          color: #4CAF82;
          background: rgba(76, 175, 130, 0.05);
        }
        .quota-badge-icon { flex-shrink: 0; }
        .quota-badge-icon--crown { color: #4CAF82; }
        .quota-badge-label { white-space: nowrap; }
        .quota-barre-fond {
          width: 40px;
          height: 3px;
          background: rgba(120, 144, 168, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }
        .quota-barre-remplie {
          height: 100%;
          border-radius: 2px;
          background: ${estBas ? "#FFD966" : "#4CAF82"};
          transition: width 0.4s ease;
        }
      `}</style>
    </div>
  );
}
