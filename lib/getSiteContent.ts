import { creerClientServeur } from "@/lib/supabase/server";

// Valeurs par défaut (duplicated from useSiteContent for server-side)
const DEFAULTS: Record<string, string> = {
  hero_titre: "Apprends plus intelligemment avec l'IA",
  hero_sous_titre: "Cours interactifs, quiz adaptatifs, fiches de révision et assistant IA pédagogique.",
  hero_cta_principal: "Commencer gratuitement",
  hero_cta_secondaire: "Découvrir comment ça marche",
  hero_social_proof: "Rejoint par 2 000+ étudiants · 100% gratuit pour démarrer",
  features_titre: "Tout ce dont tu as besoin",
  features_sous_titre: "Une plateforme complète pour comprendre, s'entraîner et réussir",
  pricing_titre: "Tarifs simples et transparents",
  pricing_sous_titre: "Commence gratuitement, passe au niveau supérieur quand tu veux",
  pricing_premium_prix: "9,99€",
  dashboard_titre: "Tableau de bord",
  dashboard_sous_titre: "Retrouve tes statistiques et reprends tes cours",
  dashboard_aide_titre: "Besoin d'aide ?",
  dashboard_aide_texte: "Pose tes questions à l'assistant IA, il est là pour t'aider !",
  app_nom: "E-StudyLab",
  app_tagline: "Apprends plus intelligemment avec l'IA",
  footer_copyright: "© 2025 E-StudyLab — Fait avec ❤️ pour les élèves français",
};

/**
 * Fonction serveur pour charger un texte CMS (pour les Server Components).
 */
export async function getSiteContent(cle: string): Promise<string> {
  try {
    const supabase = await creerClientServeur();
    const { data } = await supabase
      .from("site_content")
      .select("valeur")
      .eq("cle", cle)
      .single();
    return data?.valeur ?? DEFAULTS[cle] ?? cle;
  } catch {
    return DEFAULTS[cle] ?? cle;
  }
}
