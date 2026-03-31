-- ══════════════════════════════════════════════
-- E-StudyLab — Schema de base de donnees complet
-- ══════════════════════════════════════════════

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Niveaux scolaires ──────────────────────────
CREATE TABLE education_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  ordre INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Profils utilisateurs ───────────────────────
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  niveau_scolaire TEXT,
  bio TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderateur')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- ── Preferences utilisateur ────────────────────
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  matieres_favorites UUID[] DEFAULT '{}',
  style_apprentissage TEXT CHECK (style_apprentissage IN ('visuel', 'lecture', 'pratique')),
  langue TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- ── Objectifs d'examen ─────────────────────────
CREATE TABLE user_exam_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_date DATE,
  objectif TEXT,
  niveau_estime TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Matieres ───────────────────────────────────
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  couleur TEXT,
  education_level_id UUID REFERENCES education_levels(id),
  statut TEXT DEFAULT 'published' CHECK (statut IN ('draft','submitted','review_pending','approved','published','archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- ── Chapitres ──────────────────────────────────
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  ordre INT NOT NULL DEFAULT 0,
  statut TEXT DEFAULT 'published' CHECK (statut IN ('draft','submitted','review_pending','approved','published','archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE(subject_id, slug)
);

-- ── Topics ─────────────────────────────────────
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Lecons ─────────────────────────────────────
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id),
  titre TEXT NOT NULL,
  slug TEXT NOT NULL,
  contenu_markdown TEXT,
  niveau_difficulte TEXT DEFAULT 'moyen' CHECK (niveau_difficulte IN ('facile','moyen','difficile','expert')),
  duree_minutes INT,
  statut TEXT DEFAULT 'draft' CHECK (statut IN ('draft','submitted','review_pending','approved','published','archived')),
  source_type TEXT DEFAULT 'interne' CHECK (source_type IN ('interne','ia','utilisateur','externe')),
  auteur_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  UNIQUE(chapter_id, slug)
);

-- ── Sections de lecon ──────────────────────────
CREATE TABLE lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  titre TEXT,
  contenu TEXT NOT NULL,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Points cles ────────────────────────────────
CREATE TABLE lesson_key_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  contenu TEXT NOT NULL,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Exemples ───────────────────────────────────
CREATE TABLE lesson_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  titre TEXT,
  contenu TEXT NOT NULL,
  explication TEXT,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Fiches de revision ─────────────────────────
CREATE TABLE revision_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id),
  user_id UUID REFERENCES auth.users(id),
  titre TEXT NOT NULL,
  contenu_markdown TEXT NOT NULL,
  source TEXT DEFAULT 'ia' CHECK (source IN ('ia','manuel')),
  statut TEXT DEFAULT 'draft' CHECK (statut IN ('draft','published','archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- ── Quiz ───────────────────────────────────────
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  lesson_id UUID REFERENCES lessons(id),
  titre TEXT NOT NULL,
  description TEXT,
  niveau_difficulte TEXT DEFAULT 'moyen' CHECK (niveau_difficulte IN ('facile','moyen','difficile','expert')),
  duree_minutes INT,
  statut TEXT DEFAULT 'draft' CHECK (statut IN ('draft','submitted','review_pending','approved','published','archived')),
  source_type TEXT DEFAULT 'interne' CHECK (source_type IN ('interne','ia','utilisateur')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- ── Questions de quiz ──────────────────────────
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  enonce TEXT NOT NULL,
  explication_reponse TEXT,
  ordre INT NOT NULL DEFAULT 0,
  points INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Choix de reponse ───────────────────────────
CREATE TABLE quiz_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  contenu TEXT NOT NULL,
  est_correcte BOOLEAN NOT NULL DEFAULT false,
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Tentatives de quiz ─────────────────────────
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) NOT NULL,
  score INT DEFAULT 0,
  nb_bonnes_reponses INT DEFAULT 0,
  nb_questions INT DEFAULT 0,
  duree_secondes INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Reponses d'une tentative ───────────────────
CREATE TABLE quiz_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) NOT NULL,
  choice_id UUID REFERENCES quiz_choices(id),
  est_correcte BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Progression par matiere ────────────────────
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  pourcentage INT DEFAULT 0 CHECK (pourcentage BETWEEN 0 AND 100),
  derniere_activite TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, subject_id)
);

-- ── Progression par lecon ──────────────────────
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) NOT NULL,
  statut TEXT DEFAULT 'not_started' CHECK (statut IN ('not_started','in_progress','completed')),
  temps_passe INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- ── Maitrise par topic ─────────────────────────
CREATE TABLE user_topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) NOT NULL,
  niveau_maitrise INT DEFAULT 0 CHECK (niveau_maitrise BETWEEN 0 AND 100),
  derniere_evaluation TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- ── Logs d'activite ────────────────────────────
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type_action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Contenu sauvegarde ─────────────────────────
CREATE TABLE user_saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- ── Templates de prompts IA ────────────────────
CREATE TABLE ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz','fiche','explication','correction','plan','adaptation')),
  prompt_systeme TEXT NOT NULL,
  prompt_utilisateur TEXT NOT NULL,
  version INT DEFAULT 1,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- ── Requetes IA ────────────────────────────────
CREATE TABLE ai_generation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES ai_prompt_templates(id),
  type TEXT NOT NULL CHECK (type IN ('quiz','fiche','explication','correction','plan','adaptation')),
  contexte JSONB DEFAULT '{}',
  parametres JSONB DEFAULT '{}',
  statut TEXT DEFAULT 'pending' CHECK (statut IN ('pending','processing','done','error')),
  tokens_utilises INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Sorties IA ─────────────────────────────────
CREATE TABLE ai_generation_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES ai_generation_requests(id) ON DELETE CASCADE NOT NULL,
  contenu_genere TEXT NOT NULL,
  validated BOOLEAN DEFAULT false,
  entity_type_lie TEXT,
  entity_id_lie UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Documents uploades ─────────────────────────
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom_fichier TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  taille_bytes INT,
  statut_analyse TEXT DEFAULT 'pending' CHECK (statut_analyse IN ('pending','processing','done','error')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- ── Resultats d'analyse de document ───────────
CREATE TABLE document_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES uploaded_documents(id) ON DELETE CASCADE NOT NULL,
  texte_extrait TEXT,
  resume TEXT,
  notions_detectees TEXT[] DEFAULT '{}',
  exercices_detectes JSONB DEFAULT '[]',
  questions_detectees JSONB DEFAULT '[]',
  quiz_genere JSONB,
  fiche_generee TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Sorties generees depuis un document ────────
CREATE TABLE document_generated_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES uploaded_documents(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz','correction','fiche','resume')),
  contenu JSONB NOT NULL,
  request_id UUID REFERENCES ai_generation_requests(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── File de moderation ─────────────────────────
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  statut TEXT DEFAULT 'pending' CHECK (statut IN ('pending','approved','rejected','needs_changes','published','archived')),
  soumis_par UUID REFERENCES auth.users(id),
  assigne_a UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- ── Actions de moderation ──────────────────────
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES moderation_queue(id) ON DELETE CASCADE NOT NULL,
  moderateur_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved','rejected','needs_changes','published','archived')),
  motif TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Signalements ───────────────────────────────
CREATE TABLE moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  signale_par UUID REFERENCES auth.users(id) NOT NULL,
  motif TEXT NOT NULL,
  statut TEXT DEFAULT 'pending' CHECK (statut IN ('pending','reviewed','dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Notifications ──────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Feedback utilisateur ───────────────────────
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('bug','suggestion','contenu','autre')),
  contenu TEXT NOT NULL,
  statut TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════
-- Index
-- ══════════════════════════════════════════════
CREATE INDEX idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX idx_lessons_statut ON lessons(statut);
CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_chapters_slug ON chapters(slug);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_ai_requests_user_id ON ai_generation_requests(user_id);
CREATE INDEX idx_ai_requests_created_at ON ai_generation_requests(created_at);
CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);
CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX idx_moderation_queue_statut ON moderation_queue(statut);
CREATE INDEX idx_revision_sheets_lesson_id ON revision_sheets(lesson_id);
CREATE INDEX idx_revision_sheets_user_id ON revision_sheets(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ══════════════════════════════════════════════
-- Trigger : creer profil + preferences apres inscription
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION creer_profil_utilisateur()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_creer_profil
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION creer_profil_utilisateur();
