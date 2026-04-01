-- ══════════════════════════════════════════════
-- E-StudyLab — Migration 006
-- Correction : réinsertion des matières manquantes
-- (Maths, SVT, Physique-Chimie supprimées par CASCADE
--  lors du DELETE FROM education_levels en migration 005)
-- ══════════════════════════════════════════════

-- 1. Supprimer la contrainte FK vers education_levels sur subjects
-- (cette colonne n'est plus utilisée, on utilise chapters.niveau_scolaire)
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_education_level_id_fkey;
ALTER TABLE subjects DROP COLUMN IF EXISTS education_level_id;

-- 2. Réinsérer les 3 matières manquantes (idempotent)
INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Mathématiques', 'mathematiques',
  'Algèbre, géométrie, analyse, probabilités et statistiques',
  '🧮', '#8B6FE8', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'mathematiques');

INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Sciences de la Vie et de la Terre', 'svt',
  'Biologie, géologie, écologie et environnement',
  '🌿', '#4CAF82', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'svt');

INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Physique-Chimie', 'physique-chimie',
  'Mécanique, électricité, optique, chimie organique et minérale',
  '⚛️', '#FF9A3C', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'physique-chimie');

-- 3. Mettre à jour les icônes des matières existantes (emoji au lieu de Lucide)
UPDATE subjects SET icon = '🧮' WHERE slug = 'mathematiques' AND icon IN ('Calculator', 'calculator');
UPDATE subjects SET icon = '🌿' WHERE slug = 'svt' AND icon IN ('Leaf', 'leaf');
UPDATE subjects SET icon = '⚛️' WHERE slug = 'physique-chimie' AND icon IN ('Atom', 'atom');
UPDATE subjects SET icon = '📖' WHERE slug = 'francais' AND icon IN ('BookOpen', 'bookopen');
UPDATE subjects SET icon = '🌍' WHERE slug = 'histoire-geo' AND icon IN ('Globe', 'globe');
-- Aussi le vieux slug
UPDATE subjects SET icon = '🌍' WHERE slug = 'histoire-geographie' AND icon IN ('Globe', 'globe');

-- 4. Réinsérer les chapitres pour les matières restaurées (si manquants)
-- Mathématiques
WITH math AS (SELECT id FROM subjects WHERE slug = 'mathematiques' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT math.id, t.titre, t.slug, t.description, t.ordre, t.niveau, 'published'
FROM math, (VALUES
  ('Nombres et calculs', 'nombres-et-calculs', 'Opérations, fractions, puissances et racines', 1, '6ème'),
  ('Algèbre', 'algebre', 'Équations, inéquations et systèmes', 2, '3ème'),
  ('Géométrie', 'geometrie', 'Figures, théorèmes et transformations', 3, '4ème'),
  ('Fonctions', 'fonctions', 'Fonctions affines, linéaires et polynomiales', 4, '2nde Générale'),
  ('Statistiques et probabilités', 'statistiques-probabilites', 'Moyennes, médianes, probabilités', 5, '1ère Générale')
) AS t(titre, slug, description, ordre, niveau)
WHERE NOT EXISTS (
  SELECT 1 FROM chapters WHERE subject_id = math.id AND slug = t.slug
);

-- SVT
WITH svt AS (SELECT id FROM subjects WHERE slug = 'svt' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT svt.id, t.titre, t.slug, t.description, t.ordre, t.niveau, 'published'
FROM svt, (VALUES
  ('Le vivant et son évolution', 'vivant-evolution', 'Biodiversité, évolution et génétique', 1, '6ème'),
  ('Le corps humain et la santé', 'corps-humain-sante', 'Nutrition, système immunitaire, reproduction', 2, '3ème'),
  ('La planète Terre', 'planete-terre', 'Géologie, climat et écosystèmes', 3, '5ème')
) AS t(titre, slug, description, ordre, niveau)
WHERE NOT EXISTS (
  SELECT 1 FROM chapters WHERE subject_id = svt.id AND slug = t.slug
);

-- Physique-Chimie
WITH pc AS (SELECT id FROM subjects WHERE slug = 'physique-chimie' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT pc.id, t.titre, t.slug, t.description, t.ordre, t.niveau, 'published'
FROM pc, (VALUES
  ('Organisation de la matière', 'organisation-matiere', 'Atomes, molécules, mélanges', 1, '4ème'),
  ('Mouvements et interactions', 'mouvements-interactions', 'Forces, vitesse, gravitation', 2, '3ème'),
  ('Énergie et conversions', 'energie-conversions', 'Formes d''énergie, circuits électriques', 3, '5ème'),
  ('Signaux et capteurs', 'signaux-capteurs', 'Son, lumière, signaux électriques', 4, '4ème')
) AS t(titre, slug, description, ordre, niveau)
WHERE NOT EXISTS (
  SELECT 1 FROM chapters WHERE subject_id = pc.id AND slug = t.slug
);

-- 5. Corriger la RLS policy sur subjects pour accepter aussi les non-authentifiés en lecture
-- (optionnel, mais la policy actuelle est suffisante pour les utilisateurs connectés)
-- La policy existante "subjects_select_published" fait déjà :
--   FOR SELECT TO authenticated USING (statut = 'published' OR is_admin())
-- C'est correct.

-- 6. S'assurer que tous les subjects ont statut = 'published'
UPDATE subjects SET statut = 'published' WHERE statut IS NULL OR statut = 'draft';
