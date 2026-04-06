import type { SupabaseClient } from "@supabase/supabase-js";
import { appellerEli } from "@/lib/ai/gemini";
import { CONTENT_MANIFEST } from "./content-manifest";
import {
  buildLessonPrompt,
  buildQuizPrompt,
  buildExercisePrompt,
  buildFichePrompt,
} from "./prompts-generation";
import { parseLesson, parseQuiz, parseExercise, parseFiche } from "./parsers";
import {
  resolveChapterId,
  chapterHasContent,
  insertLesson,
  insertQuiz,
  insertExercise,
  insertFiche,
} from "./inserters";
import type {
  ChapterSpec,
  GenerationProgress,
  GenerationError,
  GenerationResult,
} from "./types";

// ═══════════════════════════════════════════
// Orchestrateur de génération de contenu
// ═══════════════════════════════════════════

const DELAY_BETWEEN_CHAPTERS = 2000; // ms
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Appelle Claude avec retry et backoff exponentiel.
 */
async function callWithRetry(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { contenu } = await appellerEli(`${systemPrompt}\n\n${userPrompt}`, undefined, maxTokens);
      return contenu;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  ⚠ Tentative ${attempt + 1}/${MAX_RETRIES} échouée: ${msg}`);
      if (attempt === MAX_RETRIES - 1) throw err;
      await sleep(5000 * Math.pow(3, attempt)); // 5s, 15s, 45s
    }
  }
  throw new Error("Unreachable");
}

/**
 * Génère et insère tout le contenu pour un chapitre.
 * Retourne le nombre d'items insérés.
 */
async function generateChapter(
  supabase: SupabaseClient,
  spec: ChapterSpec,
  onProgress: (step: string) => void
): Promise<{ inserted: number; errors: GenerationError[] }> {
  const errors: GenerationError[] = [];
  let inserted = 0;

  // Résoudre le chapitre
  const { chapterId } = await resolveChapterId(supabase, spec);

  // Vérifier idempotence
  if (await chapterHasContent(supabase, chapterId)) {
    console.log(`  ⏭ Chapitre déjà rempli, skip`);
    return { inserted: 0, errors: [] };
  }

  // ── Phase 1 : Leçons + Quiz + Exercices en parallèle ──
  onProgress("Génération leçons, quiz, exercices...");

  const lesson1Promise = (async () => {
    const prompt = buildLessonPrompt(spec, spec.lessons[0]);
    const raw = await callWithRetry(prompt.systemPrompt, prompt.userPrompt, prompt.maxTokens);
    const parsed = parseLesson(raw);
    return await insertLesson(supabase, chapterId, parsed);
  })();

  const lesson2Promise = (async () => {
    const prompt = buildLessonPrompt(spec, spec.lessons[1]);
    const raw = await callWithRetry(prompt.systemPrompt, prompt.userPrompt, prompt.maxTokens);
    const parsed = parseLesson(raw);
    return await insertLesson(supabase, chapterId, parsed);
  })();

  const quizPromise = (async () => {
    const prompt = buildQuizPrompt(spec);
    const raw = await callWithRetry(prompt.systemPrompt, prompt.userPrompt, prompt.maxTokens);
    const parsed = parseQuiz(raw);
    return await insertQuiz(supabase, chapterId, parsed);
  })();

  const exercise1Promise = (async () => {
    const prompt = buildExercisePrompt(spec, spec.exercises[0]);
    const raw = await callWithRetry(prompt.systemPrompt, prompt.userPrompt, prompt.maxTokens);
    const parsed = parseExercise(raw);
    return await insertExercise(supabase, chapterId, parsed);
  })();

  const exercise2Promise = (async () => {
    const prompt = buildExercisePrompt(spec, spec.exercises[1]);
    const raw = await callWithRetry(prompt.systemPrompt, prompt.userPrompt, prompt.maxTokens);
    const parsed = parseExercise(raw);
    return await insertExercise(supabase, chapterId, parsed);
  })();

  // Attendre tous les résultats (tolérance aux erreurs partielles)
  const results = await Promise.allSettled([
    lesson1Promise,
    lesson2Promise,
    quizPromise,
    exercise1Promise,
    exercise2Promise,
  ]);

  const itemNames = ["Leçon 1", "Leçon 2", "Quiz", "Exercice 1", "Exercice 2"];
  let lesson1Id: string | null = null;

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      inserted++;
      if (i === 0) lesson1Id = r.value;
    } else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      errors.push({ chapter: spec.chapterTitre, item: itemNames[i], error: msg });
      console.error(`  ✗ ${itemNames[i]}: ${msg}`);
    }
  });

  // ── Phase 2 : Fiche de révision (nécessite lesson_id) ──
  onProgress("Génération fiche de révision...");

  try {
    const prompt = buildFichePrompt(spec);
    const raw = await callWithRetry(prompt.systemPrompt, prompt.userPrompt, prompt.maxTokens);
    const parsed = parseFiche(raw);
    await insertFiche(supabase, lesson1Id, parsed);
    inserted++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push({ chapter: spec.chapterTitre, item: "Fiche", error: msg });
    console.error(`  ✗ Fiche: ${msg}`);
  }

  return { inserted, errors };
}

/**
 * Génère tout le contenu pédagogique pour les 12 chapitres du manifeste.
 */
export async function generateAllContent(
  supabase: SupabaseClient,
  onProgress?: (progress: GenerationProgress) => void,
  filterSubjectSlugs?: string[]
): Promise<GenerationResult> {
  const manifest = filterSubjectSlugs?.length
    ? CONTENT_MANIFEST.filter((s) => filterSubjectSlugs.includes(s.subjectSlug))
    : CONTENT_MANIFEST;
  let totalInserted = 0;
  let totalSkipped = 0;
  const allErrors: GenerationError[] = [];
  const totalItems = manifest.length * 6; // 6 items par chapitre

  console.log(`\n🚀 Démarrage de la génération pour ${manifest.length} chapitres\n`);

  for (let i = 0; i < manifest.length; i++) {
    const spec = manifest[i];
    const label = `${spec.subjectNom} — ${spec.chapterTitre}`;
    console.log(`\n📚 [${i + 1}/${manifest.length}] ${label}`);

    const notify = (step: string) => {
      onProgress?.({
        chapterIndex: i,
        totalChapters: manifest.length,
        chapterName: label,
        step,
        itemsDone: totalInserted,
        totalItems,
      });
    };

    try {
      const result = await generateChapter(supabase, spec, notify);

      if (result.inserted === 0 && result.errors.length === 0) {
        totalSkipped++;
      } else {
        totalInserted += result.inserted;
        allErrors.push(...result.errors);
      }

      console.log(`  ✓ ${result.inserted} éléments insérés, ${result.errors.length} erreurs`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      allErrors.push({ chapter: label, item: "global", error: msg });
      console.error(`  ✗ Erreur globale: ${msg}`);
    }

    // Pause entre chapitres pour le rate limiting
    if (i < manifest.length - 1) {
      await sleep(DELAY_BETWEEN_CHAPTERS);
    }
  }

  // Progression finale
  onProgress?.({
    chapterIndex: manifest.length,
    totalChapters: manifest.length,
    chapterName: "Terminé",
    step: "complete",
    itemsDone: totalInserted,
    totalItems,
  });

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ Génération terminée`);
  console.log(`   Insérés : ${totalInserted}`);
  console.log(`   Skippés : ${totalSkipped}`);
  console.log(`   Erreurs : ${allErrors.length}`);
  console.log(`═══════════════════════════════════════\n`);

  return { totalInserted, totalSkipped, errors: allErrors };
}
