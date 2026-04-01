// ═══════════════════════════════════════════
// Types pour la génération de contenu IA
// ═══════════════════════════════════════════

export interface LessonSpec {
  titre: string;
  topic: string;
}

export interface ExerciseSpec {
  theme: string;
  type: "calcul" | "redaction" | "probleme";
}

export interface ChapterSpec {
  subjectSlug: string;
  subjectNom: string;
  chapterSlug: string;
  chapterTitre: string;
  niveauScolaire: string;
  lessons: [LessonSpec, LessonSpec];
  quizTheme: string;
  exercises: [ExerciseSpec, ExerciseSpec];
  ficheTheme: string;
}

// ── Résultats parsés ──────────────────────

export interface GeneratedLesson {
  titre: string;
  slug: string;
  contenu_markdown: string;
  duree_minutes: number;
  niveau_difficulte: string;
  key_points: string[];
  examples: { titre: string; contenu: string; explication: string }[];
}

export interface GeneratedQuizQuestion {
  enonce: string;
  explication_reponse: string;
  choix: { contenu: string; est_correcte: boolean }[];
}

export interface GeneratedQuiz {
  titre: string;
  description: string;
  questions: GeneratedQuizQuestion[];
}

export interface GeneratedExercise {
  titre: string;
  enonce: string;
  corrige: string;
  type: string;
  duree_minutes: number;
}

export interface GeneratedFiche {
  titre: string;
  contenu_markdown: string;
}

// ── Progression ───────────────────────────

export interface GenerationProgress {
  chapterIndex: number;
  totalChapters: number;
  chapterName: string;
  step: string;
  itemsDone: number;
  totalItems: number;
}

export interface GenerationError {
  chapter: string;
  item: string;
  error: string;
}

export interface GenerationResult {
  totalInserted: number;
  totalSkipped: number;
  errors: GenerationError[];
}
