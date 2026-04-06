"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Link2 } from "lucide-react";
import type { TypeRessource, FormatFichier } from "@/types";

interface Props {
  open: boolean;
  type: TypeRessource;
  chapitreId: string;
  onClose: () => void;
  onUploaded: (data: {
    id: string;
    type: TypeRessource;
    titre: string;
    ext: FormatFichier;
    ordre: number;
    chapter_id: string;
  }) => void;
}

const EXTENSIONS_ACCEPTEES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/markdown": [".md"],
  "image/png": [".png"],
};

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo

function labelType(type: TypeRessource): string {
  switch (type) {
    case "lecon": return "Leçon";
    case "exercice": return "Exercice";
    case "fiche": return "Fiche";
    case "quiz": return "Quiz";
  }
}

export default function ModaleUpload({ open, type, chapitreId, onClose, onUploaded }: Props) {
  const [onglet, setOnglet] = useState<"fichier" | "lien">("fichier");
  const [titre, setTitre] = useState("");
  const [url, setUrl] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const f = acceptedFiles[0];
    if (f.size > TAILLE_MAX) {
      setErreur("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    setFichier(f);
    setErreur(null);
    // Pré-remplir le titre avec le nom du fichier (sans extension)
    if (!titre) {
      const nom = f.name.replace(/\.[^.]+$/, "");
      setTitre(nom);
    }
  }, [titre]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: EXTENSIONS_ACCEPTEES,
    maxFiles: 1,
    multiple: false,
  });

  const extFromFile = (f: File): FormatFichier => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf" || ext === "docx" || ext === "md" || ext === "png") return ext;
    return "pdf"; // fallback
  };

  const handleSubmit = async () => {
    if (!titre.trim()) {
      setErreur("Le titre est requis");
      return;
    }

    setEnvoi(true);
    setErreur(null);

    try {
      const formData = new FormData();
      formData.append("chapter_id", chapitreId);
      formData.append("type", type);
      formData.append("titre", titre.trim());

      if (onglet === "lien") {
        if (!url.trim()) {
          setErreur("L'URL est requise");
          setEnvoi(false);
          return;
        }
        formData.append("ext", "lien");
        formData.append("url", url.trim());
      } else {
        if (!fichier) {
          setErreur("Sélectionne un fichier");
          setEnvoi(false);
          return;
        }
        formData.append("ext", extFromFile(fichier));
        formData.append("file", fichier);
      }

      const res = await fetch("/api/contenus/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erreur || "Erreur upload");
      }

      const data = await res.json();
      onUploaded(data);
      // Reset
      setTitre("");
      setUrl("");
      setFichier(null);
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setEnvoi(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modale-upload-overlay" onClick={onClose}>
      <div className="modale-upload" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modale-upload-header">
          <span>Ajouter {labelType(type).toLowerCase()}</span>
          <button onClick={onClose} className="modale-upload-close" aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modale-upload-tabs">
          <button
            className={`modale-upload-tab ${onglet === "fichier" ? "modale-upload-tab--actif" : ""}`}
            onClick={() => setOnglet("fichier")}
          >
            <Upload size={13} /> Fichier
          </button>
          <button
            className={`modale-upload-tab ${onglet === "lien" ? "modale-upload-tab--actif" : ""}`}
            onClick={() => setOnglet("lien")}
          >
            <Link2 size={13} /> Lien URL
          </button>
        </div>

        {/* Body */}
        <div className="modale-upload-body">
          {/* Titre */}
          <label className="modale-upload-label">Titre</label>
          <input
            className="modale-upload-input"
            type="text"
            value={titre}
            onChange={e => setTitre(e.target.value)}
            placeholder="Ex : Cours sur les fonctions"
            maxLength={200}
          />

          {onglet === "fichier" ? (
            <>
              <label className="modale-upload-label">Fichier (PDF, DOCX, MD, PNG — max 10 Mo)</label>
              <div
                {...getRootProps()}
                className={`modale-upload-dropzone ${isDragActive ? "modale-upload-dropzone--active" : ""}`}
              >
                <input {...getInputProps()} />
                {fichier ? (
                  <span className="modale-upload-filename">{fichier.name}</span>
                ) : isDragActive ? (
                  <span>Dépose le fichier ici...</span>
                ) : (
                  <span>Glisse un fichier ou clique pour parcourir</span>
                )}
              </div>
            </>
          ) : (
            <>
              <label className="modale-upload-label">URL</label>
              <input
                className="modale-upload-input"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </>
          )}

          {erreur && <div className="modale-upload-erreur">{erreur}</div>}
        </div>

        {/* Footer */}
        <div className="modale-upload-footer">
          <button className="modale-upload-btn-annuler" onClick={onClose}>
            Annuler
          </button>
          <button
            className="modale-upload-btn-valider"
            onClick={handleSubmit}
            disabled={envoi}
          >
            {envoi ? "Envoi..." : "Ajouter"}
          </button>
        </div>
      </div>

      <style>{`
        .modale-upload-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modale-upload {
          width: 360px;
          max-width: 90vw;
          background: #162030;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .modale-upload-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
          color: #F0F4F8;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .modale-upload-close {
          background: none;
          border: none;
          color: #7A90A8;
          cursor: pointer;
          padding: 4px;
        }
        .modale-upload-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .modale-upload-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #7A90A8;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.12s;
        }
        .modale-upload-tab:hover { color: #F0F4F8; }
        .modale-upload-tab--actif {
          color: #4CAF82;
          border-bottom-color: #4CAF82;
        }
        .modale-upload-body {
          padding: 16px 18px;
        }
        .modale-upload-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #7A90A8;
          margin-bottom: 6px;
          margin-top: 12px;
        }
        .modale-upload-label:first-child { margin-top: 0; }
        .modale-upload-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #F0F4F8;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.12s;
        }
        .modale-upload-input:focus {
          border-color: #4CAF82;
        }
        .modale-upload-dropzone {
          padding: 24px 16px;
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 10px;
          text-align: center;
          color: #7A90A8;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .modale-upload-dropzone:hover,
        .modale-upload-dropzone--active {
          border-color: #4CAF82;
          background: rgba(76,175,130,0.05);
          color: #4CAF82;
        }
        .modale-upload-filename {
          color: #F0F4F8;
          font-weight: 500;
        }
        .modale-upload-erreur {
          margin-top: 10px;
          font-size: 12px;
          color: #EF4444;
          background: rgba(239,68,68,0.08);
          padding: 8px 12px;
          border-radius: 6px;
        }
        .modale-upload-footer {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding: 12px 18px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .modale-upload-btn-annuler {
          padding: 8px 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #7A90A8;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
        }
        .modale-upload-btn-valider {
          padding: 8px 20px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #0F1923;
          background: #4CAF82;
          border: none;
          cursor: pointer;
          transition: opacity 0.12s;
        }
        .modale-upload-btn-valider:hover { opacity: 0.85; }
        .modale-upload-btn-valider:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
