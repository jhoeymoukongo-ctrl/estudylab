// ═══════════════════════════════════════════
// Script CLI — Génération de contenu pédagogique
// Usage : npm run seed:contenu
// ═══════════════════════════════════════════

// IMPORTANT : charger les env AVANT tout autre import
// (les imports ESM sont hoistés, donc on utilise require)
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local", override: true });

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  E-StudyLab — Génération de contenu IA");
  console.log("═══════════════════════════════════════════");

  // Vérifier les variables d'environnement
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL manquante");
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY manquante");
    process.exit(1);
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY manquante");
    process.exit(1);
  }

  // Import dynamique APRÈS que les env sont chargées
  const { creerClientAdmin } = await import("../lib/supabase/admin");
  const { generateAllContent } = await import("../lib/ai/generation");

  const supabase = creerClientAdmin();

  // Vérifier la connexion
  const { count, error } = await supabase
    .from("subjects")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("❌ Connexion Supabase échouée:", error.message);
    process.exit(1);
  }

  console.log(`\n✓ Connexion Supabase OK (${count} matières en base)`);
  console.log(`✓ Clé API Gemini configurée (${process.env.GEMINI_API_KEY!.substring(0, 12)}...)\n`);

  const startTime = Date.now();

  // Filtre par matière via argument CLI : npm run seed:contenu -- --matiere physique-chimie
  const args = process.argv.slice(2);
  const matiereIndex = args.indexOf("--matiere");
  const filterSlugs: string[] = [];
  if (matiereIndex !== -1) {
    for (let i = matiereIndex + 1; i < args.length && !args[i].startsWith("--"); i++) {
      filterSlugs.push(args[i]);
    }
    console.log(`🔍 Filtre matières : ${filterSlugs.join(", ")}\n`);
  }

  const result = await generateAllContent(supabase, undefined, filterSlugs.length ? filterSlugs : undefined);

  const duration = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log(`⏱  Durée totale : ${minutes}m ${seconds}s`);

  if (result.errors.length > 0) {
    console.log("\n❌ Erreurs rencontrées :");
    result.errors.forEach((e) => {
      console.log(`   • ${e.chapter} / ${e.item} : ${e.error}`);
    });
  }

  process.exit(result.errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("❌ Erreur fatale:", err);
  process.exit(1);
});
