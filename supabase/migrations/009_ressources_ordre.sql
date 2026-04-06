-- Ajout du champ ordre sur les ressources pédagogiques
-- Ce champ permet le réordonnancement drag & drop

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS ordre INT DEFAULT 0;

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS ordre INT DEFAULT 0;

ALTER TABLE revision_sheets
  ADD COLUMN IF NOT EXISTS ordre INT DEFAULT 0;

-- chapters a déjà la colonne ordre dans 001_schema.sql, on s'assure qu'elle existe
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS ordre INT DEFAULT 0;

-- Index pour les tris
CREATE INDEX IF NOT EXISTS idx_lessons_ordre    ON lessons(chapter_id, ordre);
CREATE INDEX IF NOT EXISTS idx_exercises_ordre  ON exercises(chapter_id, ordre);
CREATE INDEX IF NOT EXISTS idx_fiches_ordre     ON revision_sheets(lesson_id, ordre);
CREATE INDEX IF NOT EXISTS idx_chapters_ordre   ON chapters(subject_id, ordre);

-- Initialiser les ordres existants depuis l'ordre d'insertion
UPDATE lessons SET ordre = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY chapter_id ORDER BY created_at) AS rn
  FROM lessons WHERE deleted_at IS NULL
) sub WHERE lessons.id = sub.id;

UPDATE exercises SET ordre = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY chapter_id ORDER BY created_at) AS rn
  FROM exercises WHERE deleted_at IS NULL
) sub WHERE exercises.id = sub.id;

UPDATE revision_sheets SET ordre = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY lesson_id ORDER BY created_at) AS rn
  FROM revision_sheets WHERE deleted_at IS NULL
) sub WHERE revision_sheets.id = sub.id;

UPDATE chapters SET ordre = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY subject_id ORDER BY created_at) AS rn
  FROM chapters
) sub WHERE chapters.id = sub.id;
