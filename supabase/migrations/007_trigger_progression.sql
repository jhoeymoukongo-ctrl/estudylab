-- 007_trigger_progression.sql
-- Trigger : met à jour automatiquement user_progress quand un quiz est terminé
-- ou qu'une leçon est marquée comme lue.

CREATE OR REPLACE FUNCTION mettre_a_jour_progression_matiere()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
  v_total INT;
  v_done INT;
BEGIN
  -- Déterminer user_id et subject_id selon la table source
  IF TG_TABLE_NAME = 'quiz_attempts' THEN
    v_user_id := NEW.user_id;
    SELECT s.id INTO v_subject_id
    FROM quizzes q
    JOIN chapters c ON c.id = q.chapter_id
    JOIN subjects s ON s.id = c.subject_id
    WHERE q.id = NEW.quiz_id;

  ELSIF TG_TABLE_NAME = 'user_lesson_progress' THEN
    v_user_id := NEW.user_id;
    SELECT s.id INTO v_subject_id
    FROM lessons l
    JOIN chapters c ON c.id = l.chapter_id
    JOIN subjects s ON s.id = c.subject_id
    WHERE l.id = NEW.lesson_id;
  END IF;

  IF v_subject_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Compter le total de leçons dans la matière
  SELECT COUNT(*) INTO v_total
  FROM lessons l
  JOIN chapters c ON c.id = l.chapter_id
  WHERE c.subject_id = v_subject_id;

  -- Compter les leçons terminées par l'utilisateur dans cette matière
  SELECT COUNT(DISTINCT ulp.lesson_id) INTO v_done
  FROM user_lesson_progress ulp
  JOIN lessons l ON l.id = ulp.lesson_id
  JOIN chapters c ON c.id = l.chapter_id
  WHERE c.subject_id = v_subject_id
    AND ulp.user_id = v_user_id
    AND ulp.statut = 'completed';

  -- Upsert dans user_progress
  INSERT INTO user_progress (user_id, subject_id, pourcentage, updated_at)
  VALUES (
    v_user_id,
    v_subject_id,
    CASE WHEN v_total > 0 THEN ROUND((v_done::NUMERIC / v_total) * 100) ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, subject_id)
  DO UPDATE SET
    pourcentage = EXCLUDED.pourcentage,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur quiz_attempts (quand un quiz est complété)
DROP TRIGGER IF EXISTS trg_progression_quiz ON quiz_attempts;
CREATE TRIGGER trg_progression_quiz
  AFTER INSERT OR UPDATE ON quiz_attempts
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION mettre_a_jour_progression_matiere();

-- Trigger sur user_lesson_progress (quand une leçon est marquée complète)
DROP TRIGGER IF EXISTS trg_progression_lesson ON user_lesson_progress;
CREATE TRIGGER trg_progression_lesson
  AFTER INSERT OR UPDATE ON user_lesson_progress
  FOR EACH ROW
  WHEN (NEW.statut = 'completed')
  EXECUTE FUNCTION mettre_a_jour_progression_matiere();
