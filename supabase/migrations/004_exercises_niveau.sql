-- ══════════════════════════════════════════════
-- Migration 004 — Table exercises + niveau_scolaire sur chapters
-- ══════════════════════════════════════════════

-- 1. Ajout du niveau scolaire sur les chapitres
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS niveau_scolaire TEXT;

-- 2. Table exercices
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id),
  titre TEXT NOT NULL,
  enonce TEXT,
  contenu_markdown TEXT,
  corrige TEXT,
  niveau_difficulte TEXT DEFAULT 'moyen'
    CHECK (niveau_difficulte IN ('facile', 'moyen', 'difficile', 'expert')),
  duree_minutes INT,
  type TEXT DEFAULT 'probleme'
    CHECK (type IN ('calcul', 'redaction', 'qcm', 'probleme', 'autre')),
  source_type TEXT DEFAULT 'interne'
    CHECK (source_type IN ('interne', 'ia', 'utilisateur', 'externe')),
  statut TEXT DEFAULT 'draft'
    CHECK (statut IN ('draft', 'submitted', 'review_pending', 'approved', 'published', 'archived')),
  fichier_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 3. RLS exercices
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises_select_published" ON exercises
  FOR SELECT TO authenticated
  USING (
    (statut = 'published' AND deleted_at IS NULL)
    OR is_admin()
  );

CREATE POLICY "exercises_insert_admin" ON exercises
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "exercises_update_admin" ON exercises
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "exercises_delete_admin" ON exercises
  FOR DELETE TO authenticated
  USING (is_admin());

-- 4. Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_exercises_chapter ON exercises(chapter_id);
CREATE INDEX IF NOT EXISTS idx_exercises_statut ON exercises(statut) WHERE deleted_at IS NULL;

-- NOTE: Créer le bucket "contenus-admin" manuellement dans Supabase Dashboard > Storage
