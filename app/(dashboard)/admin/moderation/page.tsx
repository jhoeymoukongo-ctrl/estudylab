"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";
import { Toast, useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, CheckCircle, XCircle, Eye } from "lucide-react";

interface ModerationItem {
  id: string;
  entity_type: string;
  entity_id: string;
  statut: string;
  soumis_par: string | null;
  created_at: string;
}

export default function AdminModerationPage() {
  const supabase = creerClientSupabase();
  const { toast, afficherToast, fermerToast } = useToast();

  const [items, setItems] = useState<ModerationItem[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState<"pending" | "all">("pending");
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [previewContenu, setPreviewContenu] = useState<string | null>(null);

  useEffect(() => {
    chargerModeration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  async function chargerModeration() {
    setChargement(true);
    let query = supabase
      .from("moderation_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (filtre === "pending") {
      query = query.eq("statut", "pending");
    }

    const { data, error } = await query;
    if (error) {
      afficherToast("Erreur lors du chargement", "error");
    } else {
      setItems(data ?? []);
    }
    setChargement(false);
  }

  async function moderer(itemId: string, action: "approved" | "rejected") {
    setActionEnCours(itemId);
    const { data: { user } } = await supabase.auth.getUser();

    // Mettre à jour le statut dans la queue
    const { error: errQueue } = await supabase
      .from("moderation_queue")
      .update({ statut: action, assigne_a: user?.id })
      .eq("id", itemId);

    if (errQueue) {
      afficherToast("Erreur : " + errQueue.message, "error");
      setActionEnCours(null);
      return;
    }

    // Enregistrer l'action de modération
    await supabase.from("moderation_actions").insert({
      queue_id: itemId,
      moderateur_id: user?.id,
      action,
      motif: null,
    });

    // Si approuvé, publier l'entité
    const item = items.find((i) => i.id === itemId);
    if (action === "approved" && item) {
      const tableMap: Record<string, string> = {
        lesson: "lessons",
        quiz: "quizzes",
        revision_sheet: "revision_sheets",
      };
      const table = tableMap[item.entity_type];
      if (table) {
        await supabase.from(table).update({ statut: "published" }).eq("id", item.entity_id);
      }
    }

    afficherToast(action === "approved" ? "Contenu approuvé et publié" : "Contenu rejeté");
    chargerModeration();
    setActionEnCours(null);
  }

  async function voirContenu(entityType: string, entityId: string) {
    const tableMap: Record<string, { table: string; champ: string }> = {
      lesson: { table: "lessons", champ: "contenu_markdown" },
      quiz: { table: "quizzes", champ: "description" },
      revision_sheet: { table: "revision_sheets", champ: "contenu_markdown" },
    };
    const config = tableMap[entityType];
    if (!config) { setPreviewContenu("Type non pris en charge"); return; }

    const { data } = await supabase
      .from(config.table)
      .select(`titre, ${config.champ}`)
      .eq("id", entityId)
      .single();

    if (data) {
      const d = data as unknown as Record<string, string>;
      setPreviewContenu(`# ${d.titre}\n\n${d[config.champ] ?? "Pas de contenu"}`);
    } else {
      setPreviewContenu("Contenu introuvable");
    }
  }

  const labelType: Record<string, string> = {
    lesson: "Leçon",
    quiz: "Quiz",
    revision_sheet: "Fiche de révision",
  };

  const couleurStatut: Record<string, string> = {
    pending: "bg-brand-jaune/10 text-brand-jaune",
    approved: "bg-brand-vert/10 text-brand-vert",
    rejected: "bg-brand-rouge/10 text-brand-rouge",
    published: "bg-brand-bleu/10 text-brand-bleu",
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-vert" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <ShieldCheck size={24} className="text-brand-jaune" />
          Modération
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} élément{items.length > 1 ? "s" : ""} {filtre === "pending" ? "en attente" : "au total"}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filtre === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltre("pending")}
        >
          En attente
        </Button>
        <Button
          variant={filtre === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltre("all")}
        >
          Tous
        </Button>
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <Card className="border-dark-border bg-dark-card">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Aucun élément en attente de modération.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-dark-border bg-dark-card">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {labelType[item.entity_type] ?? item.entity_type}
                    </span>
                    <Badge variant="secondary" className={couleurStatut[item.statut] ?? ""}>
                      {item.statut}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Soumis le {new Date(item.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => voirContenu(item.entity_type, item.entity_id)}
                  >
                    <Eye size={14} /> Voir
                  </Button>

                  {item.statut === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-brand-vert hover:bg-brand-vert/90"
                        disabled={actionEnCours === item.id}
                        onClick={() => moderer(item.id, "approved")}
                      >
                        {actionEnCours === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-brand-rouge hover:text-brand-rouge"
                        disabled={actionEnCours === item.id}
                        onClick={() => moderer(item.id, "rejected")}
                      >
                        <XCircle size={14} />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal preview */}
      {previewContenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewContenu(null)} />
          <Card className="relative z-10 w-full max-w-2xl max-h-[80vh] border-dark-border bg-dark-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">Aperçu du contenu</h3>
                <Button variant="ghost" size="sm" onClick={() => setPreviewContenu(null)}>
                  Fermer
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] rounded-lg border border-dark-border bg-dark-elevated p-4 prose prose-invert prose-sm">
                <div className="whitespace-pre-wrap text-sm">{previewContenu}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={fermerToast} />}
    </div>
  );
}
