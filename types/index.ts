// ══════════════════════════════════════════════
// Types metier E-StudyLab
// ══════════════════════════════════════════════

// ── Utilisateur ──────────────────────────────
export type Plan = 'free' | 'premium'
export type Role = 'user' | 'admin' | 'moderateur'
export type NiveauScolaire = '6ème' | '5ème' | '4ème' | '3ème' | '2nde' | '1ère' | 'Terminale' | 'Licence 1' | 'Licence 2' | 'Licence 3'

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  niveau_scolaire: NiveauScolaire | null
  bio: string | null
  plan: Plan
  role: Role
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface UserPreferences {
  id: string
  user_id: string
  matieres_favorites: string[]
  style_apprentissage: 'visuel' | 'lecture' | 'pratique' | null
  langue: string
}

export interface UserExamGoal {
  id: string
  user_id: string
  exam_date: string | null
  objectif: string | null
  niveau_estime: string | null
  created_at: string
}

// ── Contenu pedagogique ───────────────────────
export type Statut = 'draft' | 'submitted' | 'review_pending' | 'approved' | 'published' | 'archived'
export type SourceType = 'interne' | 'ia' | 'utilisateur' | 'externe'
export type NiveauDifficulte = 'facile' | 'moyen' | 'difficile' | 'expert'

export interface Subject {
  id: string
  nom: string
  slug: string
  description: string | null
  icon: string | null
  couleur: string | null
  education_level_id: string | null
  statut: Statut
  created_at: string
}

export interface Chapter {
  id: string
  subject_id: string
  titre: string
  slug: string
  description: string | null
  ordre: number
  statut: Statut
  created_at: string
}

export interface Topic {
  id: string
  chapter_id: string
  titre: string
  description: string | null
  ordre: number
}

export interface Lesson {
  id: string
  chapter_id: string
  topic_id: string | null
  titre: string
  slug: string
  contenu_markdown: string | null
  niveau_difficulte: NiveauDifficulte
  duree_minutes: number | null
  statut: Statut
  source_type: SourceType
  auteur_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface LessonSection {
  id: string
  lesson_id: string
  titre: string | null
  contenu: string
  ordre: number
}

export interface LessonKeyPoint {
  id: string
  lesson_id: string
  contenu: string
  ordre: number
}

export interface LessonExample {
  id: string
  lesson_id: string
  titre: string | null
  contenu: string
  explication: string | null
  ordre: number
}

export interface RevisionSheet {
  id: string
  lesson_id: string | null
  user_id: string | null
  titre: string
  contenu_markdown: string
  source: 'ia' | 'manuel'
  statut: Statut
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

// ── Quiz ──────────────────────────────────────
export interface Quiz {
  id: string
  chapter_id: string | null
  lesson_id: string | null
  titre: string
  description: string | null
  niveau_difficulte: NiveauDifficulte
  duree_minutes: number | null
  statut: Statut
  source_type: SourceType
  created_at: string
  updated_at: string | null
  deleted_at: string | null
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  enonce: string
  explication_reponse: string | null
  ordre: number
  points: number
}

export interface QuizChoice {
  id: string
  question_id: string
  contenu: string
  est_correcte: boolean
  ordre: number
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  nb_bonnes_reponses: number
  nb_questions: number
  duree_secondes: number | null
  completed_at: string | null
  created_at: string
}

export interface QuizAttemptAnswer {
  id: string
  attempt_id: string
  question_id: string
  choice_id: string | null
  est_correcte: boolean
  created_at: string
}

// ── Progression ───────────────────────────────
export type StatutLecon = 'not_started' | 'in_progress' | 'completed'

export interface UserProgress {
  id: string
  user_id: string
  subject_id: string
  pourcentage: number
  derniere_activite: string | null
  created_at: string
}

export interface UserLessonProgress {
  id: string
  user_id: string
  lesson_id: string
  statut: StatutLecon
  temps_passe: number
  created_at: string
}

export interface UserTopicMastery {
  id: string
  user_id: string
  topic_id: string
  niveau_maitrise: number
  derniere_evaluation: string | null
}

export interface UserActivityLog {
  id: string
  user_id: string
  type_action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ── IA ────────────────────────────────────────
export type TypeRequeteIA = 'quiz' | 'fiche' | 'explication' | 'correction' | 'plan' | 'adaptation'

export interface AIGenerationRequest {
  id: string
  user_id: string
  template_id: string | null
  type: TypeRequeteIA
  contexte: Record<string, unknown>
  parametres: Record<string, unknown>
  statut: 'pending' | 'processing' | 'done' | 'error'
  tokens_utilises: number | null
  created_at: string
}

export interface AIGenerationOutput {
  id: string
  request_id: string
  contenu_genere: string
  validated: boolean
  entity_type_lie: string | null
  entity_id_lie: string | null
  created_at: string
}

export interface AIPromptTemplate {
  id: string
  nom: string
  type: TypeRequeteIA
  prompt_systeme: string
  prompt_utilisateur: string
  version: number
  actif: boolean
  created_at: string
}

// ── Documents ─────────────────────────────────
export type StatutAnalyse = 'pending' | 'processing' | 'done' | 'error'

export interface UploadedDocument {
  id: string
  user_id: string
  nom_fichier: string
  mime_type: string
  storage_path: string
  taille_bytes: number | null
  statut_analyse: StatutAnalyse
  created_at: string
  deleted_at: string | null
}

export interface DocumentAnalysisResult {
  id: string
  document_id: string
  texte_extrait: string | null
  resume: string | null
  notions_detectees: string[]
  exercices_detectes: Array<{ enonce: string; type: string }>
  questions_detectees: string[]
  quiz_genere: unknown | null
  fiche_generee: string | null
  created_at: string
}

// ── Moderation ────────────────────────────────
export type StatutModeration = 'pending' | 'approved' | 'rejected' | 'needs_changes' | 'published' | 'archived'

export interface ModerationQueue {
  id: string
  entity_type: string
  entity_id: string
  statut: StatutModeration
  soumis_par: string | null
  assigne_a: string | null
  created_at: string
}

export interface ModerationAction {
  id: string
  queue_id: string
  moderateur_id: string
  action: string
  motif: string | null
  created_at: string
}

// ── Notifications ─────────────────────────────
export interface Notification {
  id: string
  user_id: string
  type: string
  titre: string
  message: string | null
  lu: boolean
  created_at: string
}

// ── Types composes ────────────────────────────
export interface QuizQuestionWithChoices extends QuizQuestion {
  choices: QuizChoice[]
}

export interface QuizGenereIA {
  titre: string
  questions: Array<{
    enonce: string
    explication: string
    choix: Array<{ contenu: string; est_correcte: boolean }>
  }>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
