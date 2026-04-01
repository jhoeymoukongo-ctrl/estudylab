"use client";

import { useState, useEffect } from "react";
import { creerClientSupabase } from "@/lib/supabase/client";

// Cache mémoire partagée entre tous les composants
const cache: Record<string, string> = {};
let cacheLoaded = false;
let loadingPromise: Promise<void> | null = null;

// Valeurs par défaut (fallback si Supabase indisponible)
export const SITE_CONTENT_DEFAULTS: Record<string, string> = {
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

async function chargerContenu() {
  if (cacheLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const supabase = creerClientSupabase();
      const { data } = await supabase
        .from("site_content")
        .select("cle, valeur");

      if (data) {
        for (const row of data) {
          cache[row.cle] = row.valeur;
        }
      }
    } catch {
      // Silently fallback to defaults
    }
    cacheLoaded = true;
    loadingPromise = null;
  })();

  return loadingPromise;
}

/**
 * Hook pour accéder aux textes du CMS.
 * Charge les textes depuis Supabase une seule fois, puis sert le cache.
 * Retourne les valeurs par défaut pendant le chargement.
 */
export function useSiteContent() {
  const [ready, setReady] = useState(cacheLoaded);

  useEffect(() => {
    if (cacheLoaded) return;
    let mounted = true;
    chargerContenu().then(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  function t(cle: string): string {
    if (ready && cache[cle] !== undefined) return cache[cle];
    return SITE_CONTENT_DEFAULTS[cle] ?? cle;
  }

  return { t, ready };
}
