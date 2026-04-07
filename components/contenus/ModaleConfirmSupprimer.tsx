"use client";

interface Props {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ModaleConfirmSupprimer({
  isOpen,
  message,
  onConfirm,
  onClose,
  loading,
}: Props) {
  if (!isOpen) return null;

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
          border: "0.5px solid rgba(239,154,154,0.3)",
          borderRadius: 12,
          padding: 20,
          width: 320,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#F0F4F8",
            marginBottom: 8,
          }}
        >
          Confirmer la suppression
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "#7A90A8",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
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
            onClick={onConfirm}
            disabled={loading}
            style={{
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: "#B71C1C",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
