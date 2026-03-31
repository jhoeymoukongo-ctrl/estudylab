-- ══════════════════════════════════════════════
-- E-StudyLab — Row Level Security (RLS)
-- ══════════════════════════════════════════════

-- ── Fonction helper : verifier admin ──────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Fonction helper : verifier moderateur ou admin ──
CREATE OR REPLACE FUNCTION is_moderateur_ou_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderateur')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════
-- Activer RLS sur toutes les tables
-- ══════════════════════════════════════════════
ALTER TABLE education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exam_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_key_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_generated_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════
-- CATALOGUE PUBLIC (lecture pour tous les authentifies)
-- ══════════════════════════════════════════════

-- education_levels : lecture pour tous
CREATE POLICY "education_levels_select" ON education_levels
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "education_levels_admin" ON education_levels
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- subjects : lecture contenu publie, admin gere tout
CREATE POLICY "subjects_select_published" ON subjects
  FOR SELECT TO authenticated USING (statut = 'published' OR is_admin());
CREATE POLICY "subjects_admin" ON subjects
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- chapters : lecture contenu publie via matiere publiee
CREATE POLICY "chapters_select_published" ON chapters
  FOR SELECT TO authenticated
  USING (
    statut = 'published'
    AND EXISTS (SELECT 1 FROM subjects WHERE id = chapters.subject_id AND statut = 'published')
    OR is_admin()
  );
CREATE POLICY "chapters_admin" ON chapters
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- topics : lecture si chapitre publie
CREATE POLICY "topics_select_published" ON topics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chapters c
      JOIN subjects s ON s.id = c.subject_id
      WHERE c.id = topics.chapter_id AND c.statut = 'published' AND s.statut = 'published'
    )
    OR is_admin()
  );
CREATE POLICY "topics_admin" ON topics
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ══════════════════════════════════════════════
-- CONTENU PEDAGOGIQUE (lecture publie, admin gere)
-- ══════════════════════════════════════════════

-- lessons : lecture si publie et pas supprime
CREATE POLICY "lessons_select_published" ON lessons
  FOR SELECT TO authenticated
  USING (
    (statut = 'published' AND deleted_at IS NULL)
    OR is_admin()
  );
CREATE POLICY "lessons_admin" ON lessons
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- lesson_sections : lecture si lecon publiee
CREATE POLICY "lesson_sections_select" ON lesson_sections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons WHERE id = lesson_sections.lesson_id
      AND statut = 'published' AND deleted_at IS NULL
    )
    OR is_admin()
  );
CREATE POLICY "lesson_sections_admin" ON lesson_sections
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- lesson_key_points : lecture si lecon publiee
CREATE POLICY "lesson_key_points_select" ON lesson_key_points
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons WHERE id = lesson_key_points.lesson_id
      AND statut = 'published' AND deleted_at IS NULL
    )
    OR is_admin()
  );
CREATE POLICY "lesson_key_points_admin" ON lesson_key_points
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- lesson_examples : lecture si lecon publiee
CREATE POLICY "lesson_examples_select" ON lesson_examples
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons WHERE id = lesson_examples.lesson_id
      AND statut = 'published' AND deleted_at IS NULL
    )
    OR is_admin()
  );
CREATE POLICY "lesson_examples_admin" ON lesson_examples
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ══════════════════════════════════════════════
-- FICHES DE REVISION
-- ══════════════════════════════════════════════

-- Fiches : propres fiches OU fiches systeme publiees (user_id IS NULL)
CREATE POLICY "revision_sheets_select" ON revision_sheets
  FOR SELECT TO authenticated
  USING (
    (user_id = auth.uid())
    OR (user_id IS NULL AND statut = 'published' AND deleted_at IS NULL)
    OR is_admin()
  );
CREATE POLICY "revision_sheets_insert" ON revision_sheets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "revision_sheets_update" ON revision_sheets
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "revision_sheets_delete" ON revision_sheets
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_admin());

-- ══════════════════════════════════════════════
-- QUIZ
-- ══════════════════════════════════════════════

-- quizzes : lecture si publie
CREATE POLICY "quizzes_select_published" ON quizzes
  FOR SELECT TO authenticated
  USING (
    (statut = 'published' AND deleted_at IS NULL)
    OR is_admin()
  );
CREATE POLICY "quizzes_admin" ON quizzes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- quiz_questions : lecture si quiz parent publie
CREATE POLICY "quiz_questions_select" ON quiz_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes WHERE id = quiz_questions.quiz_id
      AND statut = 'published' AND deleted_at IS NULL
    )
    OR is_admin()
  );
CREATE POLICY "quiz_questions_admin" ON quiz_questions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- quiz_choices : lecture si quiz parent publie
CREATE POLICY "quiz_choices_select" ON quiz_choices
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON q.id = qq.quiz_id
      WHERE qq.id = quiz_choices.question_id
      AND q.statut = 'published' AND q.deleted_at IS NULL
    )
    OR is_admin()
  );
CREATE POLICY "quiz_choices_admin" ON quiz_choices
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ══════════════════════════════════════════════
-- DONNEES UTILISATEUR (isolation stricte par auth.uid())
-- ══════════════════════════════════════════════

-- user_profiles
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_profiles_insert_trigger" ON user_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- user_preferences
CREATE POLICY "user_preferences_select_own" ON user_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_preferences_update_own" ON user_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_preferences_insert" ON user_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- user_exam_goals
CREATE POLICY "user_exam_goals_select_own" ON user_exam_goals
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_exam_goals_insert" ON user_exam_goals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_exam_goals_update" ON user_exam_goals
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_exam_goals_delete" ON user_exam_goals
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- quiz_attempts : isolation par user_id
CREATE POLICY "quiz_attempts_select_own" ON quiz_attempts
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "quiz_attempts_insert" ON quiz_attempts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- quiz_attempt_answers : isolation via parent attempt
CREATE POLICY "quiz_attempt_answers_select_own" ON quiz_attempt_answers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts WHERE id = quiz_attempt_answers.attempt_id
      AND user_id = auth.uid()
    )
    OR is_admin()
  );
CREATE POLICY "quiz_attempt_answers_insert" ON quiz_attempt_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts WHERE id = quiz_attempt_answers.attempt_id
      AND user_id = auth.uid()
    )
  );

-- user_progress
CREATE POLICY "user_progress_select_own" ON user_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_progress_insert" ON user_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_progress_update" ON user_progress
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- user_lesson_progress
CREATE POLICY "user_lesson_progress_select_own" ON user_lesson_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_lesson_progress_insert" ON user_lesson_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_lesson_progress_update" ON user_lesson_progress
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- user_topic_mastery
CREATE POLICY "user_topic_mastery_select_own" ON user_topic_mastery
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_topic_mastery_insert" ON user_topic_mastery
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_topic_mastery_update" ON user_topic_mastery
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- user_activity_logs
CREATE POLICY "user_activity_logs_select_own" ON user_activity_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_activity_logs_insert" ON user_activity_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- user_saved_content
CREATE POLICY "user_saved_content_select_own" ON user_saved_content
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_saved_content_insert" ON user_saved_content
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_saved_content_delete" ON user_saved_content
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ══════════════════════════════════════════════
-- IA ET DOCUMENTS (isolation par user_id)
-- ══════════════════════════════════════════════

-- ai_prompt_templates : lecture pour tous, admin gere
CREATE POLICY "ai_prompt_templates_select" ON ai_prompt_templates
  FOR SELECT TO authenticated USING (actif = true OR is_admin());
CREATE POLICY "ai_prompt_templates_admin" ON ai_prompt_templates
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ai_generation_requests
CREATE POLICY "ai_requests_select_own" ON ai_generation_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "ai_requests_insert" ON ai_generation_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ai_generation_outputs : via parent request
CREATE POLICY "ai_outputs_select_own" ON ai_generation_outputs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_generation_requests WHERE id = ai_generation_outputs.request_id
      AND user_id = auth.uid()
    )
    OR is_admin()
  );
CREATE POLICY "ai_outputs_insert" ON ai_generation_outputs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_generation_requests WHERE id = ai_generation_outputs.request_id
      AND user_id = auth.uid()
    )
  );

-- uploaded_documents
CREATE POLICY "uploaded_documents_select_own" ON uploaded_documents
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "uploaded_documents_insert" ON uploaded_documents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "uploaded_documents_update" ON uploaded_documents
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "uploaded_documents_delete" ON uploaded_documents
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- document_analysis_results : via parent document
CREATE POLICY "doc_analysis_select_own" ON document_analysis_results
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM uploaded_documents WHERE id = document_analysis_results.document_id
      AND user_id = auth.uid()
    )
    OR is_admin()
  );

-- document_generated_outputs : via parent document
CREATE POLICY "doc_outputs_select_own" ON document_generated_outputs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM uploaded_documents WHERE id = document_generated_outputs.document_id
      AND user_id = auth.uid()
    )
    OR is_admin()
  );

-- ══════════════════════════════════════════════
-- MODERATION (admin/moderateur full access)
-- ══════════════════════════════════════════════

-- moderation_queue
CREATE POLICY "moderation_queue_staff" ON moderation_queue
  FOR ALL TO authenticated USING (is_moderateur_ou_admin()) WITH CHECK (is_moderateur_ou_admin());
CREATE POLICY "moderation_queue_soumetteur" ON moderation_queue
  FOR SELECT TO authenticated USING (soumis_par = auth.uid());

-- moderation_actions
CREATE POLICY "moderation_actions_staff" ON moderation_actions
  FOR ALL TO authenticated USING (is_moderateur_ou_admin()) WITH CHECK (is_moderateur_ou_admin());

-- moderation_flags : signaler pour tous, voir pour staff
CREATE POLICY "moderation_flags_insert" ON moderation_flags
  FOR INSERT TO authenticated WITH CHECK (signale_par = auth.uid());
CREATE POLICY "moderation_flags_select_staff" ON moderation_flags
  FOR SELECT TO authenticated USING (is_moderateur_ou_admin() OR signale_par = auth.uid());
CREATE POLICY "moderation_flags_update_staff" ON moderation_flags
  FOR UPDATE TO authenticated USING (is_moderateur_ou_admin());

-- ══════════════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════════════
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ══════════════════════════════════════════════
-- FEEDBACK
-- ══════════════════════════════════════════════
CREATE POLICY "user_feedback_insert" ON user_feedback
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_feedback_select_own" ON user_feedback
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "user_feedback_admin" ON user_feedback
  FOR UPDATE TO authenticated USING (is_admin());

-- ══════════════════════════════════════════════
-- STORAGE : bucket "documents"
-- ══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Upload : uniquement dans son dossier user_id/
CREATE POLICY "documents_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read : uniquement ses propres fichiers
CREATE POLICY "documents_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete : uniquement ses propres fichiers
CREATE POLICY "documents_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
