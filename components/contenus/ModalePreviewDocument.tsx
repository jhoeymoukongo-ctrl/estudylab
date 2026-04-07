"use client";

interface Props {
  isOpen: boolean;
  url: string | null;
  titre: string;
  mimeType?: string;
  onClose: () => void;
}

export default function ModalePreviewDocument({
  isOpen,
  url,
  titre,
  mimeType,
  onClose,
}: Props) {
  if (!isOpen || !url) return null;

  const isPDF =
    mimeType === "application/pdf" || url.toLowerCase().endsWith(".pdf");
  const isImage =
    ["image/jpeg", "image/png", "image/webp"].includes(mimeType ?? "") ||
    /\.(jpg|jpeg|png|webp)$/i.test(url);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#162030",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          width: "90vw",
          maxWidth: 900,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#F0F4F8" }}>
            {titre}
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: "#4CAF82",
                textDecoration: "none",
                border: "0.5px solid #4CAF82",
                borderRadius: 6,
                padding: "3px 8px",
              }}
            >
              Ouvrir ↗
            </a>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#7A90A8",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, overflow: "auto", background: "#0F1923" }}>
          {isPDF ? (
            <iframe
              src={url}
              style={{ width: "100%", height: "70vh", border: "none" }}
              title={titre}
            />
          ) : isImage ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={titre}
                style={{
                  maxWidth: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </div>
          ) : (
            <div
              style={{ padding: 40, textAlign: "center", color: "#7A90A8" }}
            >
              <p style={{ fontSize: 13, marginBottom: 12 }}>
                Ce type de fichier ne peut pas être prévisualisé directement.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: "#4CAF82",
                  textDecoration: "none",
                  border: "0.5px solid #4CAF82",
                  borderRadius: 8,
                  padding: "6px 14px",
                }}
              >
                Télécharger le fichier ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
