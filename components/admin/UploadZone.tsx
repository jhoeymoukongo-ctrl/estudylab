"use client";

import { useState, useRef, useCallback } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface UploadZoneProps {
  bucket: string;
  folder: string;
  accept?: string;
  maxSizeMB?: number;
  value: string | null;
  onChange: (url: string | null) => void;
}

function formatTaille(bytes: number): string {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

export default function UploadZone({
  bucket,
  folder,
  accept = ".pdf,.docx,.jpg,.jpeg,.png,.txt",
  maxSizeMB = 10,
  value,
  onChange,
}: UploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomFichier, setNomFichier] = useState<string | null>(null);
  const [tailleFichier, setTailleFichier] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extensionsAutorisees = accept.split(",").map((e) => e.trim().toLowerCase());

  const validerFichier = useCallback(
    (file: File): string | null => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!extensionsAutorisees.includes(ext)) {
        return `Format non autorise. Formats acceptes : ${accept}`;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `Fichier trop volumineux (max ${maxSizeMB} Mo)`;
      }
      return null;
    },
    [extensionsAutorisees, accept, maxSizeMB]
  );

  async function uploadFichier(file: File) {
    const validation = validerFichier(file);
    if (validation) {
      setErreur(validation);
      return;
    }

    setUploading(true);
    setErreur(null);

    const supabase = creerClientSupabase();
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setErreur("Erreur d'upload : " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    setNomFichier(file.name);
    setTailleFichier(file.size);
    onChange(urlData.publicUrl);
    setUploading(false);
  }

  async function supprimerFichier() {
    if (!value) return;
    const supabase = creerClientSupabase();

    // Extraire le path depuis l'URL publique
    const urlParts = value.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length === 2) {
      await supabase.storage.from(bucket).remove([urlParts[1]]);
    }

    setNomFichier(null);
    setTailleFichier(null);
    onChange(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFichier(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFichier(file);
    // Reset input pour permettre le re-upload du meme fichier
    e.target.value = "";
  }

  // Etat : fichier deja upload
  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dark-border bg-dark-elevated px-4 py-3">
        <FileText size={20} className="shrink-0 text-brand-vert" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{nomFichier ?? "Fichier"}</p>
          {tailleFichier && (
            <p className="text-xs text-muted-foreground">{formatTaille(tailleFichier)}</p>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={supprimerFichier}>
          <X size={14} className="text-destructive" />
        </Button>
      </div>
    );
  }

  // Etat : upload en cours
  if (uploading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dark-border bg-dark-elevated px-4 py-8">
        <Loader2 size={20} className="animate-spin text-brand-vert" />
        <span className="text-sm text-muted-foreground">Upload en cours...</span>
      </div>
    );
  }

  // Etat : zone vide (drag & drop)
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
          Glisser-deposer un fichier ici ou <span className="text-brand-vert font-medium">cliquer pour parcourir</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")} — max {maxSizeMB} Mo
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      {erreur && (
        <p className="mt-2 text-xs text-destructive">{erreur}</p>
      )}
    </div>
  );
}
