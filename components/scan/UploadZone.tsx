"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelected: (content: string) => void;
}

function formatTaille(bytes: number): string {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

const extensionsTexte = [".txt", ".md", ".csv", ".json"];

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [fichier, setFichier] = useState<{ nom: string; taille: number } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const extensionsAutorisees = [".pdf", ".jpg", ".jpeg", ".png", ".txt", ".md", ".csv"];

  const validerFichier = useCallback(
    (file: File): string | null => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!extensionsAutorisees.includes(ext)) {
        return `Format non autoris\u00e9. Formats accept\u00e9s : PDF, images, texte`;
      }
      if (file.size > 10 * 1024 * 1024) {
        return "Fichier trop volumineux (max 10 Mo)";
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function traiterFichier(file: File) {
    const validation = validerFichier(file);
    if (validation) {
      setErreur(validation);
      return;
    }

    setChargement(true);
    setErreur(null);

    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (extensionsTexte.includes(ext)) {
      // Fichier texte : lire le contenu directement
      const reader = new FileReader();
      reader.onload = (e) => {
        const contenu = e.target?.result as string;
        setFichier({ nom: file.name, taille: file.size });
        setChargement(false);
        onFileSelected(contenu);
      };
      reader.onerror = () => {
        setErreur("Impossible de lire le fichier.");
        setChargement(false);
      };
      reader.readAsText(file);
    } else {
      // PDF ou image : signaler l'upload (traitement c\u00f4t\u00e9 serveur)
      setFichier({ nom: file.name, taille: file.size });
      setChargement(false);
      onFileSelected(`[Fichier upload\u00e9 : ${file.name} (${formatTaille(file.size)})]`);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) traiterFichier(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) traiterFichier(file);
    e.target.value = "";
  }

  function reinitialiser() {
    setFichier(null);
    setErreur(null);
  }

  // Etat : fichier d\u00e9j\u00e0 upload\u00e9
  if (fichier) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dark-border bg-dark-elevated px-4 py-3">
        <FileText size={20} className="shrink-0 text-brand-vert" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fichier.nom}</p>
          <p className="text-xs text-muted-foreground">
            {formatTaille(fichier.taille)}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={reinitialiser}>
          <X size={14} className="text-destructive" />
        </Button>
      </div>
    );
  }

  // Etat : chargement en cours
  if (chargement) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dark-border bg-dark-elevated px-4 py-8">
        <Loader2 size={20} className="animate-spin text-brand-vert" />
        <span className="text-sm text-muted-foreground">
          Lecture du fichier...
        </span>
      </div>
    );
  }

  // Etat : zone vide
  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
          dragOver
            ? "border-brand-vert bg-brand-vert/5"
            : "border-dark-border bg-dark-elevated hover:border-muted-foreground"
        }`}
      >
        <Upload size={24} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          D\u00e9pose ton document ici ou{" "}
          <span className="text-brand-vert font-medium">
            clique pour parcourir
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, JPG, PNG, TXT — max 10 Mo
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.txt,.md,.csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      {erreur && <p className="mt-2 text-xs text-destructive">{erreur}</p>}
    </div>
  );
}
