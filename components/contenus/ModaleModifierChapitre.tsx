"use client";

import { useState, useEffect } from "react";

interface ChapitreInfo {
  id: string;
  titre: string;
  num: number;
}

interface Props {
  isOpen: boolean;
  chapitre: ChapitreInfo | null;
  onClose: () => void;
  onSuccess: (id: string, updates: { titre: string; ordre: number; statut: string }) => void;
}

export default function ModaleModifierChapitre({
  isOpen,
  chapitre,
  onClose,
  onSuccess,
}: Props) {
  const [titre, setTitre] = useState("");
  const [ordre, setOrdre] = useState(1);
  const [statut, setStatut] = useState<"draft" | "published" | "archived">(
    "published"
  );
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (chapitre) {
      setTitre(chapitre.titre);
      setOrdre(chapitre.num);
      setStatut("published");
      setErreur("");
    }
  }, [chapitre]);

  if (!isOpen || !chapitre) return null;

  const handleSubmit = async () => {
    if (!titre.trim()) {
      setErreur("Le titre est obligatoire");
      return;
    }
    setLoading(true);
    setErreur("");

    try {
      const res = await fetch(`/api/contenus/chapitre/${chapitre.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: titre.trim(), ordre, statut }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur serveur");
      }

      const updated = await res.json();
      onSuccess(chapitre.id, {
        titre: updated.titre,
        ordre: updated.ordre,
        statut: updated.statut,
      });
      onClose();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    fontSize: 13,
    background: "#0F1923",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#F0F4F8",
    outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "#162030",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: 20,
          width: 380,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#F0F4F8",
            marginBottom: 16,
          }}
        >
          Modifier le chapitre
        </h3>

        <label
          style={{
            fontSize: 11,
            color: "#7A90A8",
            display: "block",
            marginBottom: 4,
          }}
        >
          Titre *
        </label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          style={{ ...inputStyle, marginBottom: 12 }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#7A90A8",
                display: "block",
                marginBottom: 4,
              }}
            >
              Numéro (ordre)
            </label>
            <input
              type="number"
              min={1}
              value={ordre}
              onChange={(e) => setOrdre(parseInt(e.target.value) || 1)}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#7A90A8",
                display: "block",
                marginBottom: 4,
              }}
            >
              Statut
            </label>
            <select
              value={statut}
              onChange={(e) =>
                setStatut(
                  e.target.value as "draft" | "published" | "archived"
                )
              }
              style={inputStyle}
            >
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        {erreur && (
          <p style={{ fontSize: 11, color: "#EF9A9A", marginBottom: 12 }}>
            {erreur}
          </p>
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
        >
          <button
            onClick={onClose}
            style={{
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 8,
              border: "0.5px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#7A90A8",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: "#1E3A5F",
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {loading ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
