import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ChapterSpec,
  GeneratedLesson,
  GeneratedQuiz,
  GeneratedExercise,
  GeneratedFiche,
} from "./types";

// ═══════════════════════════════════════════
// Insertions Supabase pour le contenu généré
// ═══════════════════════════════════════════

/**
 * Vérifie que le chapitre existe, le crée si manquant, et retourne son ID.
 */
export async function resolveChapterId(
  supabase: SupabaseClient,
  spec: ChapterSpec
): Promise<{ chapterId: string; subjectId: string }> {
  // Trouver le subject
  const { data: subject, error: subjErr } = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", spec.subjectSlug)
    .single();

  if (subjErr || !subject) {
    throw new Error(`Matière introuvable : ${spec.subjectSlug}`);
  }

  // Trouver le chapitre
  const { data: chapter } = await supabase
    .from("chapters")
    .select("id")
    .eq("subject_id", subject.id)
    .eq("slug", spec.chapterSlug)
    .single();

  if (chapter) {
    return { chapterId: chapter.id, subjectId: subject.id };
  }

  // Créer le chapitre s'il n'existe pas
  console.log(`  📁 Création du chapitre : ${spec.chapterSlug}`);
  const { data: newChapter, error: createErr } = await supabase
    .from("chapters")
    .insert({
      subject_id: subject.id,
      titre: spec.chapterTitre,
      slug: spec.chapterSlug,
      description: `Chapitre ${spec.chapterTitre} — ${spec.subjectNom}`,
      ordre: 0,
      niveau_scolaire: spec.niveauScolaire,
      statut: "published",
    })
    .select("id")
    .single();

  if (createErr || !newChapter) {
    throw new Error(`Impossible de créer le chapitre ${spec.chapterSlug}: ${createErr?.message}`);
  }

  return { chapterId: newChapter.id, subjectId: subject.id };
}

/**
 * Vérifie si un chapitre a déjà du contenu (leçons).
 */
export async function chapterHasContent(
  supabase: SupabaseClient,
  chapterId: string
): Promise<boolean> {
  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId)
    .is("deleted_at", null);

  return (count ?? 0) > 0;
}

/**
 * Insère une leçon avec ses points clés et exemples.
 * Retourne l'ID de la leçon insérée.
 */
export async function insertLesson(
  supabase: SupabaseClient,
  chapterId: string,
  lesson: GeneratedLesson
): Promise<string> {
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      chapter_id: chapterId,
      titre: lesson.titre,
      slug: lesson.slug,
      contenu_markdown: lesson.contenu_markdown,
      niveau_difficulte: lesson.niveau_difficulte,
      duree_minutes: lesson.duree_minutes,
      source_type: "ia",
      statut: "published",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Erreur insertion leçon "${lesson.titre}": ${error?.message}`);
  }

  const lessonId = data.id;

  // Points clés
  if (lesson.key_points.length > 0) {
    const keyPointRows = lesson.key_points.map((contenu, i) => ({
      lesson_id: lessonId,
      contenu,
      ordre: i,
    }));
    const { error: kpErr } = await supabase
      .from("lesson_key_points")
      .insert(keyPointRows);
    if (kpErr) {
      console.warn(`Points clés non insérés pour "${lesson.titre}": ${kpErr.message}`);
    }
  }

  // Exemples
  if (lesson.examples.length > 0) {
    const exampleRows = lesson.examples.map((ex, i) => ({
      lesson_id: lessonId,
      titre: ex.titre,
      contenu: ex.contenu,
      explication: ex.explication,
      ordre: i,
    }));
    const { error: exErr } = await supabase
      .from("lesson_examples")
      .insert(exampleRows);
    if (exErr) {
      console.warn(`Exemples non insérés pour "${lesson.titre}": ${exErr.message}`);
    }
  }

  return lessonId;
}

/**
 * Insère un quiz avec ses questions et choix.
 */
export async function insertQuiz(
  supabase: SupabaseClient,
  chapterId: string,
  quiz: GeneratedQuiz
): Promise<string> {
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      chapter_id: chapterId,
      titre: quiz.titre,
      description: quiz.description,
      niveau_difficulte: "moyen",
      duree_minutes: 15,
      source_type: "ia",
      statut: "published",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Erreur insertion quiz "${quiz.titre}": ${error?.message}`);
  }

  const quizId = data.id;

  // Insérer les questions une par une pour récupérer les IDs
  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];

    const { data: questionData, error: qErr } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        enonce: q.enonce,
        explication_reponse: q.explication_reponse,
        ordre: i,
        points: 1,
      })
      .select("id")
      .single();

    if (qErr || !questionData) {
      console.warn(`Question ${i + 1} non insérée: ${qErr?.message}`);
      continue;
    }

    // Choix
    const choixRows = q.choix.map((c, j) => ({
      question_id: questionData.id,
      contenu: c.contenu,
      est_correcte: c.est_correcte,
      ordre: j,
    }));

    const { error: cErr } = await supabase
      .from("quiz_choices")
      .insert(choixRows);
    if (cErr) {
      console.warn(`Choix Q${i + 1} non insérés: ${cErr.message}`);
    }
  }

  return quizId;
}

/**
 * Insère un exercice.
 */
export async function insertExercise(
  supabase: SupabaseClient,
  chapterId: string,
  exercise: GeneratedExercise
): Promise<string> {
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      chapter_id: chapterId,
      titre: exercise.titre,
      enonce: exercise.enonce,
      contenu_markdown: exercise.enonce,
      corrige: exercise.corrige,
      niveau_difficulte: "moyen",
      duree_minutes: exercise.duree_minutes,
      type: exercise.type,
      source_type: "ia",
      statut: "published",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Erreur insertion exercice "${exercise.titre}": ${error?.message}`);
  }

  return data.id;
}

/**
 * Insère une fiche de révision liée à une leçon.
 */
export async function insertFiche(
  supabase: SupabaseClient,
  lessonId: string | null,
  fiche: GeneratedFiche
): Promise<string> {
  const { data, error } = await supabase
    .from("revision_sheets")
    .insert({
      lesson_id: lessonId,
      titre: fiche.titre,
      contenu_markdown: fiche.contenu_markdown,
      source: "ia",
      statut: "published",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Erreur insertion fiche "${fiche.titre}": ${error?.message}`);
  }

  return data.id;
}
