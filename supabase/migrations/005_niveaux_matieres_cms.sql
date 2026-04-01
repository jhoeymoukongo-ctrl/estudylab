-- ══════════════════════════════════════════════
-- E-StudyLab — Migration 005
-- Niveaux scolaires complets + nouvelles matières + CMS
-- ══════════════════════════════════════════════

-- ── 1. Niveaux scolaires complets ──────────────
ALTER TABLE education_levels ADD COLUMN IF NOT EXISTS categorie TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS niveau_scolaire TEXT;

DELETE FROM education_levels;

INSERT INTO education_levels (nom, ordre, categorie) VALUES
  ('6ème', 1, 'college'),
  ('5ème', 2, 'college'),
  ('4ème', 3, 'college'),
  ('3ème', 4, 'college'),
  ('2nde Générale', 5, 'lycee_general'),
  ('1ère Générale', 6, 'lycee_general'),
  ('Terminale Générale', 7, 'lycee_general'),
  ('Terminale — Maths', 8, 'lycee_general'),
  ('Terminale — Physique-Chimie', 9, 'lycee_general'),
  ('Terminale — SVT', 10, 'lycee_general'),
  ('1ère STI2D', 11, 'lycee_techno'),
  ('Terminale STI2D', 12, 'lycee_techno'),
  ('1ère STMG', 13, 'lycee_techno'),
  ('Terminale STMG', 14, 'lycee_techno'),
  ('BTS 1ère année', 15, 'bts_but'),
  ('BTS 2ème année', 16, 'bts_but'),
  ('BUT 1ère année', 17, 'bts_but'),
  ('BUT 2ème année', 18, 'bts_but'),
  ('BUT 3ème année', 19, 'bts_but'),
  ('Licence 1', 20, 'licence'),
  ('Licence 2', 21, 'licence'),
  ('Licence 3', 22, 'licence');

-- ── 2. Nouvelles matières ──────────────────────
-- Only insert if not already present
INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Français', 'francais',
  'Littérature, grammaire, expression écrite et orale',
  '📖', '#E74C3C', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'francais');

INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Histoire-Géographie', 'histoire-geo',
  'Histoire contemporaine, géographie et géopolitique mondiale',
  '🌍', '#E67E22', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'histoire-geo');

INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Anglais', 'anglais',
  'Compréhension écrite et orale, expression, vocabulaire et grammaire',
  '🇬🇧', '#3498DB', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'anglais');

INSERT INTO subjects (nom, slug, description, icon, couleur, statut)
SELECT 'Espagnol', 'espagnol',
  'Compréhension, expression, civilisation hispanophone',
  '🇪🇸', '#F39C12', 'published'
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE slug = 'espagnol');

-- Update existing Français entry if it has old description
UPDATE subjects SET
  description = 'Littérature, grammaire, expression écrite et orale',
  icon = '📖',
  couleur = '#E74C3C'
WHERE slug = 'francais' AND icon = 'BookOpen';

-- Update existing Histoire-Géographie if it has old slug
UPDATE subjects SET
  nom = 'Histoire-Géographie',
  slug = 'histoire-geo',
  description = 'Histoire contemporaine, géographie et géopolitique mondiale',
  icon = '🌍',
  couleur = '#E67E22'
WHERE slug = 'histoire-geographie';

-- ── 3. Chapitres pour Français ─────────────────
WITH fr AS (SELECT id FROM subjects WHERE slug = 'francais' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT id, t.titre, t.slug, t.desc, t.ordre, t.niveau, 'published'
FROM fr, (VALUES
  ('Le roman et le récit', 'roman-et-recit', 'Étude des genres narratifs', 1, 'Terminale Générale'),
  ('La poésie', 'poesie', 'Versification, figures de style et analyse poétique', 2, '1ère Générale'),
  ('Le théâtre', 'theatre', 'Comédie, tragédie et mise en scène', 3, '1ère Générale'),
  ('L''argumentation et l''essai', 'argumentation-essai', 'Techniques d''argumentation et dissertation', 4, 'Terminale Générale'),
  ('Grammaire et orthographe', 'grammaire-orthographe', 'Règles grammaticales et orthographiques essentielles', 5, '3ème'),
  ('Expression écrite — La dissertation', 'dissertation', 'Méthodologie de la dissertation littéraire', 6, 'Terminale Générale')
) AS t(titre, slug, desc, ordre, niveau)
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE slug = 'roman-et-recit');

-- ── 4. Chapitres pour Histoire-Géographie ──────
WITH hg AS (SELECT id FROM subjects WHERE slug = 'histoire-geo' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT id, t.titre, t.slug, t.desc, t.ordre, t.niveau, 'published'
FROM hg, (VALUES
  ('La Première Guerre mondiale', 'premiere-guerre-mondiale', 'Causes, déroulement et conséquences de la Grande Guerre', 1, '3ème'),
  ('La Seconde Guerre mondiale', 'seconde-guerre-mondiale', 'Le conflit mondial de 1939-1945', 2, '3ème'),
  ('La Guerre Froide', 'guerre-froide', 'Affrontement Est-Ouest de 1947 à 1991', 3, 'Terminale Générale'),
  ('Géopolitique du monde contemporain', 'geopolitique-contemporaine', 'Enjeux géopolitiques actuels', 4, 'Terminale Générale'),
  ('La mondialisation', 'mondialisation', 'Processus et acteurs de la mondialisation', 5, '1ère Générale'),
  ('Les territoires dans la mondialisation', 'territoires-mondialisation', 'Inégalités territoriales et intégration mondiale', 6, 'Terminale Générale')
) AS t(titre, slug, desc, ordre, niveau)
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE slug = 'premiere-guerre-mondiale');

-- ── 5. Chapitres pour Anglais ──────────────────
WITH ang AS (SELECT id FROM subjects WHERE slug = 'anglais' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT id, t.titre, t.slug, t.desc, t.ordre, t.niveau, 'published'
FROM ang, (VALUES
  ('Grammaire essentielle', 'grammaire-essentielle', 'Temps, modaux, structures grammaticales', 1, '2nde Générale'),
  ('Vocabulaire thématique', 'vocabulaire-thematique', 'Vocabulaire par thèmes courants', 2, '2nde Générale'),
  ('Compréhension de l''oral', 'comprehension-oral', 'Stratégies d''écoute et compréhension', 3, '1ère Générale'),
  ('Expression écrite — Essays', 'expression-ecrite-essays', 'Rédaction d''essais en anglais', 4, 'Terminale Générale'),
  ('Civilisation britannique et américaine', 'civilisation-anglo-saxonne', 'Culture et société anglophone', 5, 'Terminale Générale'),
  ('Préparation au Bac oral', 'preparation-bac-oral', 'Entraînement à l''épreuve orale', 6, 'Terminale Générale')
) AS t(titre, slug, desc, ordre, niveau)
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE slug = 'grammaire-essentielle');

-- ── 6. Chapitres pour Espagnol ─────────────────
WITH esp AS (SELECT id FROM subjects WHERE slug = 'espagnol' LIMIT 1)
INSERT INTO chapters (subject_id, titre, slug, description, ordre, niveau_scolaire, statut)
SELECT id, t.titre, t.slug, t.desc, t.ordre, t.niveau, 'published'
FROM esp, (VALUES
  ('Grammaire espagnole', 'grammaire-espagnole', 'Conjugaison, syntaxe et règles grammaticales', 1, '2nde Générale'),
  ('Vocabulaire courant', 'vocabulaire-courant', 'Vocabulaire du quotidien et expressions', 2, '2nde Générale'),
  ('Civilisation hispanique', 'civilisation-hispanique', 'Culture et histoire du monde hispanophone', 3, '1ère Générale'),
  ('Expression écrite en espagnol', 'expression-ecrite-espagnol', 'Rédaction et argumentation en espagnol', 4, 'Terminale Générale')
) AS t(titre, slug, desc, ordre, niveau)
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE slug = 'grammaire-espagnole');

-- ── 7. Table CMS site_content ──────────────────
-- (table already exists, just insert initial data if empty)
INSERT INTO site_content (cle, valeur, description, section, type)
SELECT v.cle, v.valeur, v.description, v.section, v.type
FROM (VALUES
  ('hero_titre', 'Apprends plus intelligemment avec l''IA', 'Titre principal de la landing page', 'landing_hero', 'text'),
  ('hero_sous_titre', 'Cours interactifs, quiz adaptatifs, fiches de révision et assistant IA pédagogique.', 'Sous-titre du hero', 'landing_hero', 'textarea'),
  ('hero_cta_principal', 'Commencer gratuitement', 'Bouton CTA principal', 'landing_hero', 'text'),
  ('hero_cta_secondaire', 'Découvrir comment ça marche', 'Bouton CTA secondaire', 'landing_hero', 'text'),
  ('hero_social_proof', 'Rejoint par 2 000+ étudiants · 100% gratuit pour démarrer', 'Texte social proof sous les CTA', 'landing_hero', 'text'),
  ('features_titre', 'Tout ce dont tu as besoin', 'Titre de la section fonctionnalités', 'landing_features', 'text'),
  ('features_sous_titre', 'Une plateforme complète pour comprendre, s''entraîner et réussir', 'Sous-titre fonctionnalités', 'landing_features', 'text'),
  ('pricing_titre', 'Tarifs simples et transparents', 'Titre section tarifs', 'landing_pricing', 'text'),
  ('pricing_sous_titre', 'Commence gratuitement, passe au niveau supérieur quand tu veux', 'Sous-titre tarifs', 'landing_pricing', 'text'),
  ('pricing_premium_prix', '9,99€', 'Prix du plan premium par mois', 'landing_pricing', 'text'),
  ('dashboard_titre', 'Tableau de bord', 'Titre du dashboard', 'dashboard', 'text'),
  ('dashboard_sous_titre', 'Retrouve tes statistiques et reprends tes cours', 'Sous-titre du dashboard', 'dashboard', 'text'),
  ('dashboard_aide_titre', 'Besoin d''aide ?', 'Titre du bloc aide', 'dashboard', 'text'),
  ('dashboard_aide_texte', 'Pose tes questions à l''assistant IA, il est là pour t''aider !', 'Texte du bloc aide', 'dashboard', 'text'),
  ('app_nom', 'E-StudyLab', 'Nom de l''application', 'global', 'text'),
  ('app_tagline', 'Apprends plus intelligemment avec l''IA', 'Tagline de l''application', 'global', 'text'),
  ('footer_copyright', '© 2025 E-StudyLab — Fait avec ❤️ pour les élèves français', 'Texte copyright du footer', 'global', 'text')
) AS v(cle, valeur, description, section, type)
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE cle = 'hero_titre');
