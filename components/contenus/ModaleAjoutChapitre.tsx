"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  subjectId: string;
  subjectNom: string;
  onClose: () => void;
  onSuccess: (chapitre: {
    id: string;
    titre: string;
    slug: string;
    ordre: number;
  }) => void;
}

export default function ModaleAjoutChapitre({
  isOpen,
  subjectId,
  subjectNom,
  onClose,
  onSuccess,
}: Props) {
  const [titre, setTitre] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!titre.trim()) {
      setErreur("Le titre est obligatoire");
      return;
    }
    setLoading(true);
    setErreur("");

    try {
      const res = await fetch("/api/contenus/chapitre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_id: subjectId, titre: titre.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur serveur");
      }

      const chapitre = await res.json();
      onSuccess(chapitre);
      setTitre("");
      onClose();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
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
          width: 360,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#F0F4F8",
            marginBottom: 4,
          }}
        >
          Ajouter un chapitre
        </h3>
        <p style={{ fontSize: 11, color: "#7A90A8", marginBottom: 16 }}>
          {subjectNom}
        </p>

        <label
          style={{
            fontSize: 11,
            color: "#7A90A8",
            display: "block",
            marginBottom: 4,
          }}
        >
          Titre du chapitre *
        </label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ex : Constitution et transformations de la matière"
          autoFocus
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: 13,
            background: "#0F1923",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#F0F4F8",
            outline: "none",
            marginBottom: erreur ? 6 : 16,
          }}
        />

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
              background: loading ? "#2E7D32" : "#4CAF82",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {loading ? "Création..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
