// GET /api/contenus/arborescence
// Retourne l'arborescence complète : Niveaux → Matières → Chapitres → Ressources
// Query param : ?role=admin|eleve
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type {
  NiveauAvecMatieres,
  MatiereAvecChapitres,
  ChapitreAvecRessources,
  RessourceContenu,
} from "@/types";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // 1. Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });

  // 2. Profil + rôle
  const { data: profil } = await supabase
    .from("user_profiles")
    .select("role, plan")
    .eq("user_id", user.id)
    .single();

  const role = request.nextUrl.searchParams.get("role") ?? "eleve";

  // 3. Vérifier accès admin
  if (role === "admin" && profil?.role !== "admin") {
    return NextResponse.json({ erreur: "Accès refusé" }, { status: 403 });
  }

  const isAdmin = role === "admin";
  const statutFiltre = isAdmin ? undefined : "published";

  // 4. Récupérer les niveaux
  const { data: niveaux } = await supabase
    .from("education_levels")
    .select("id, nom, ordre")
    .order("ordre");

  if (!niveaux) return NextResponse.json([]);

  // 5. Récupérer les matières
  let matieresQuery = supabase
    .from("subjects")
    .select("id, nom, slug, icon, couleur, education_level_id, statut")
    .order("nom");
  if (statutFiltre) matieresQuery = matieresQuery.eq("statut", statutFiltre);
  const { data: matieres } = await matieresQuery;

  // 6. Récupérer les chapitres
  let chapitresQuery = supabase
    .from("chapters")
    .select("id, titre, slug, ordre, subject_id, statut")
    .order("ordre");
  if (statutFiltre) chapitresQuery = chapitresQuery.eq("statut", statutFiltre);
  const { data: chapitres } = await chapitresQuery;

  // 7. Récupérer toutes les ressources (leçons, exercices, fiches)
  let leconsQuery = supabase
    .from("lessons")
    .select("id, titre, chapter_id, ordre, statut, source_type, created_at")
    .is("deleted_at", null)
    .order("ordre");
  if (statutFiltre) leconsQuery = leconsQuery.eq("statut", statutFiltre);
  const { data: lecons } = await leconsQuery;

  let exercicesQuery = supabase
    .from("exercises")
    .select("id, titre, chapter_id, ordre, statut, source_type, created_at")
    .is("deleted_at", null)
    .order("ordre");
  if (statutFiltre) exercicesQuery = exercicesQuery.eq("statut", statutFiltre);
  const { data: exercices } = await exercicesQuery;

  let fichesQuery = supabase
    .from("revision_sheets")
    .select("id, titre, lesson_id, ordre, statut, source, created_at")
    .is("deleted_at", null)
    .order("ordre");
  if (statutFiltre) fichesQuery = fichesQuery.eq("statut", statutFiltre);
  const { data: fiches } = await fichesQuery;

  // 8. Récupérer les quiz (1 par chapitre max)
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, titre, chapter_id, statut, created_at")
    .is("deleted_at", null);

  // 9. Construire l'arborescence
  // Map leçon_id → chapter_id pour rattacher les fiches
  const leconChapterMap = new Map<string, string>();
  (lecons ?? []).forEach(l => leconChapterMap.set(l.id, l.chapter_id));

  // Quiz par chapitre (premier trouvé)
  const quizParChapitre = new Map<string, { id: string; titre: string; statut: string; created_at: string }>();
  (quizzes ?? []).forEach(q => {
    if (q.chapter_id && !quizParChapitre.has(q.chapter_id)) {
      quizParChapitre.set(q.chapter_id, q);
    }
  });

  // Construire les ressources par chapitre
  const ressourcesParChapitre = new Map<string, RessourceContenu[]>();

  (lecons ?? []).forEach(l => {
    const list = ressourcesParChapitre.get(l.chapter_id) ?? [];
    list.push({
      id: l.id,
      type: "lecon",
      titre: l.titre,
      ext: "md",
      ordre: l.ordre ?? 0,
      statut: l.statut as RessourceContenu["statut"],
      chapter_id: l.chapter_id,
      created_at: l.created_at,
    });
    ressourcesParChapitre.set(l.chapter_id, list);
  });

  (exercices ?? []).forEach(e => {
    const list = ressourcesParChapitre.get(e.chapter_id) ?? [];
    list.push({
      id: e.id,
      type: "exercice",
      titre: e.titre,
      ext: "md",
      ordre: e.ordre ?? 0,
      statut: e.statut as RessourceContenu["statut"],
      chapter_id: e.chapter_id,
      created_at: e.created_at,
    });
    ressourcesParChapitre.set(e.chapter_id, list);
  });

  (fiches ?? []).forEach(f => {
    const chapterId = f.lesson_id ? leconChapterMap.get(f.lesson_id) : null;
    if (!chapterId) return;
    const list = ressourcesParChapitre.get(chapterId) ?? [];
    list.push({
      id: f.id,
      type: "fiche",
      titre: f.titre,
      ext: "md",
      ordre: f.ordre ?? 0,
      statut: f.statut as RessourceContenu["statut"],
      chapter_id: chapterId,
      created_at: f.created_at,
    });
    ressourcesParChapitre.set(chapterId, list);
  });

  // Trier les ressources par ordre
  ressourcesParChapitre.forEach((list) => {
    list.sort((a, b) => a.ordre - b.ordre);
  });

  // Assembler la hiérarchie
  const resultat: NiveauAvecMatieres[] = niveaux.map(niveau => {
    const matieresNiveau = (matieres ?? [])
      .filter(m => m.education_level_id === niveau.id)
      .map(mat => {
        const chapitresMatiere = (chapitres ?? [])
          .filter(c => c.subject_id === mat.id)
          .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
          .map((ch, idx): ChapitreAvecRessources => {
            const quiz = quizParChapitre.get(ch.id);
            return {
              id: ch.id,
              num: idx + 1,
              titre: ch.titre,
              slug: ch.slug,
              ordre: ch.ordre ?? 0,
              subject_id: ch.subject_id,
              quiz_id: quiz?.id ?? null,
              ressources: ressourcesParChapitre.get(ch.id) ?? [],
            };
          });

        return {
          id: mat.id,
          nom: mat.nom,
          slug: mat.slug,
          icon: mat.icon ?? "📘",
          couleur: mat.couleur ?? "#1E3A5F",
          chapitres: chapitresMatiere,
        } as MatiereAvecChapitres;
      });

    return {
      id: niveau.id,
      nom: niveau.nom,
      ordre: niveau.ordre,
      matieres: matieresNiveau,
    };
  });

  return NextResponse.json(resultat);
}
