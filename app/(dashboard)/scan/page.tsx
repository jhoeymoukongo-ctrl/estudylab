"use client";

import { useState } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLine, Upload, Loader2, FileText, CheckCircle } from "lucide-react";

export default function ScanPage() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [chargement, setChargement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleUpload() {
    if (!fichier) return;

    setChargement(true);
    setErreur(null);
    setSucces(false);

    const supabase = creerClientSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErreur("Session expiree. Reconnecte-toi.");
      setChargement(false);
      return;
    }

    const ext = fichier.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(path, fichier);

    if (uploadError) {
      setErreur("Echec de l'upload. Reessaie.");
      setChargement(false);
      return;
    }

    const { error: dbError } = await supabase.from("uploaded_documents").insert({
      user_id: user.id,
      nom_fichier: fichier.name,
      mime_type: fichier.type,
      storage_path: path,
      taille_bytes: fichier.size,
      statut_analyse: "pending",
    });

    if (dbError) {
      setErreur("Erreur lors de l'enregistrement.");
      setChargement(false);
      return;
    }

    setSucces(true);
    setFichier(null);
    setChargement(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Scan de documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importe tes cours en photo ou PDF pour generer des quiz et fiches
        </p>
      </div>

      <Card className="border-dark-border bg-dark-card">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            {succes ? (
              <>
                <CheckCircle size={48} className="mb-4 text-brand-vert" />
                <h3 className="font-display text-lg font-semibold">
                  Document importe !
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  L&apos;analyse est en cours. Tu recevras une notification quand
                  les resultats seront prets.
                </p>
                <Button className="mt-6" onClick={() => setSucces(false)}>
                  Importer un autre document
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10">
                  <ScanLine size={32} className="text-brand-orange" />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  Importe ton document
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Formats acceptes : PDF, JPG, PNG (max 10 Mo)
                </p>

                <label className="mt-6 flex w-full max-w-sm cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-dark-border p-8 transition-colors hover:border-brand-vert/30">
                  <Upload size={24} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {fichier ? fichier.name : "Clique ou glisse ton fichier ici"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                  />
                </label>

                {fichier && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText size={16} />
                    {fichier.name} ({(fichier.size / 1024 / 1024).toFixed(1)} Mo)
                  </div>
                )}

                {erreur && (
                  <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {erreur}
                  </div>
                )}

                <Button
                  className="mt-6"
                  onClick={handleUpload}
                  disabled={!fichier || chargement}
                >
                  {chargement && <Loader2 size={16} className="animate-spin" />}
                  {chargement ? "Import en cours..." : "Analyser le document"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
