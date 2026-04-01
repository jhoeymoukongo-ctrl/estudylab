import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase admin avec SUPABASE_SERVICE_ROLE_KEY.
 * Bypass RLS — uniquement pour scripts et API admin.
 */
export function creerClientAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
