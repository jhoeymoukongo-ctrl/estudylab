import { createClient } from "@supabase/supabase-js";

// ─── Client Supabase service role (serveur uniquement) ───────────────────────
// On utilise le service role pour bypass le RLS sur cette table de quota
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Limites par plan ────────────────────────────────────────────────────────
export const LIMITES_QUOTA = {
  free: 5,
  premium: 10,
  admin: 9999,
} as const;

export type PlanType = keyof typeof LIMITES_QUOTA;

// ─── Erreur personnalisée pour quota dépassé ──────────────────────────────────
export class QuotaDepasse extends Error {
  constructor(public quotaUtilise: number, public quotaMax: number) {
    super(`Quota journalier atteint : ${quotaUtilise}/${quotaMax}`);
    this.name = "QuotaDepasse";
  }
}

// ─── Obtenir le début de la journée UTC ───────────────────────────────────────
// Important : on utilise UTC pour éviter les dérives selon le fuseau horaire
function debutJourneeUTC(): string {
  const maintenant = new Date();
  const debut = new Date(Date.UTC(
    maintenant.getUTCFullYear(),
    maintenant.getUTCMonth(),
    maintenant.getUTCDate()
  ));
  return debut.toISOString();
}

// ─── Lire le quota actuel d'un utilisateur ───────────────────────────────────
export async function lireQuota(userId: string): Promise<{
  quotaUtilise: number;
  quotaMax: number;
  quotaRestant: number;
  estPremium: boolean;
}> {
  // Récupérer le plan de l'utilisateur
  const { data: profil } = await supabaseAdmin
    .from("user_profiles")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = (profil?.plan ?? "free") as PlanType;
  const quotaMax = LIMITES_QUOTA[plan];

  // Compter les requêtes IA du jour
  const { count } = await supabaseAdmin
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", debutJourneeUTC());

  const quotaUtilise = count ?? 0;

  return {
    quotaUtilise,
    quotaMax,
    quotaRestant: Math.max(0, quotaMax - quotaUtilise),
    estPremium: plan === "premium" || plan === "admin",
  };
}

// ─── Vérifier ET incrémenter le quota ────────────────────────────────────────
// À appeler en début de chaque route IA.
// Lance QuotaDepasse si la limite est atteinte.
// Sinon enregistre la requête et retourne.
export async function verifierEtIncrementerQuota(
  userId: string,
  typeAction: string
): Promise<void> {
  const { quotaUtilise, quotaMax } = await lireQuota(userId);

  if (quotaUtilise >= quotaMax) {
    throw new QuotaDepasse(quotaUtilise, quotaMax);
  }

  // Enregistrer la requête (incrémente le compteur implicitement)
  await supabaseAdmin.from("ai_usage").insert({
    user_id: userId,
    type_action: typeAction,
  });
}
