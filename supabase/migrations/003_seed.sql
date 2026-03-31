-- ══════════════════════════════════════════════
-- E-StudyLab — Donnees initiales (seed)
-- ══════════════════════════════════════════════

-- ── Niveaux scolaires ──────────────────────────
INSERT INTO education_levels (nom, ordre) VALUES
  ('6ème', 1),
  ('5ème', 2),
  ('4ème', 3),
  ('3ème', 4),
  ('Seconde', 5),
  ('Première', 6),
  ('Terminale', 7),
  ('Licence 1', 8),
  ('Licence 2', 9),
  ('Licence 3', 10);

-- ── Matieres par defaut ────────────────────────
INSERT INTO subjects (nom, slug, description, icon, couleur, statut) VALUES
  (
    'Mathematiques',
    'mathematiques',
    'Algebre, geometrie, analyse, probabilites et statistiques',
    'Calculator',
    '#8B6FE8',
    'published'
  ),
  (
    'Sciences de la Vie et de la Terre',
    'svt',
    'Biologie, geologie, ecologie et environnement',
    'Leaf',
    '#4CAF82',
    'published'
  ),
  (
    'Physique-Chimie',
    'physique-chimie',
    'Mecanique, electricite, optique, chimie organique et minerale',
    'Atom',
    '#FF9A3C',
    'published'
  ),
  (
    'Francais',
    'francais',
    'Grammaire, conjugaison, litterature, redaction et analyse de textes',
    'BookOpen',
    '#FFD966',
    'published'
  ),
  (
    'Histoire-Geographie',
    'histoire-geographie',
    'Histoire de France et du monde, geographie physique et humaine',
    'Globe',
    '#1E3A5F',
    'published'
  );

-- ── Chapitres exemples pour Mathematiques ──────
WITH math AS (SELECT id FROM subjects WHERE slug = 'mathematiques')
INSERT INTO chapters (subject_id, titre, slug, description, ordre, statut) VALUES
  ((SELECT id FROM math), 'Nombres et calculs', 'nombres-et-calculs', 'Operations, fractions, puissances et racines', 1, 'published'),
  ((SELECT id FROM math), 'Algebre', 'algebre', 'Equations, inequations et systemes', 2, 'published'),
  ((SELECT id FROM math), 'Geometrie', 'geometrie', 'Figures, theoremes et transformations', 3, 'published'),
  ((SELECT id FROM math), 'Fonctions', 'fonctions', 'Fonctions affines, lineaires et polynomiales', 4, 'published'),
  ((SELECT id FROM math), 'Statistiques et probabilites', 'statistiques-probabilites', 'Moyennes, medianes, probabilites', 5, 'published');

-- ── Chapitres exemples pour SVT ────────────────
WITH svt AS (SELECT id FROM subjects WHERE slug = 'svt')
INSERT INTO chapters (subject_id, titre, slug, description, ordre, statut) VALUES
  ((SELECT id FROM svt), 'Le vivant et son evolution', 'vivant-evolution', 'Biodiversite, evolution et genetique', 1, 'published'),
  ((SELECT id FROM svt), 'Le corps humain et la sante', 'corps-humain-sante', 'Nutrition, systeme immunitaire, reproduction', 2, 'published'),
  ((SELECT id FROM svt), 'La planete Terre', 'planete-terre', 'Geologie, climat et ecosystemes', 3, 'published');

-- ── Chapitres exemples pour Physique-Chimie ────
WITH pc AS (SELECT id FROM subjects WHERE slug = 'physique-chimie')
INSERT INTO chapters (subject_id, titre, slug, description, ordre, statut) VALUES
  ((SELECT id FROM pc), 'Organisation de la matiere', 'organisation-matiere', 'Atomes, molecules, melanges', 1, 'published'),
  ((SELECT id FROM pc), 'Mouvements et interactions', 'mouvements-interactions', 'Forces, vitesse, energie', 2, 'published'),
  ((SELECT id FROM pc), 'L''energie et ses conversions', 'energie-conversions', 'Electricite, circuits, transformations', 3, 'published');

-- ── Templates de prompts IA ────────────────────
INSERT INTO ai_prompt_templates (nom, type, prompt_systeme, prompt_utilisateur, version, actif) VALUES
  (
    'Generation de quiz',
    'quiz',
    'Tu es un professeur pedagogique expert. Genere un quiz au format JSON strict avec des questions a choix multiples adaptees au niveau de l''eleve. Chaque question doit avoir exactement 4 choix dont 1 seul correct. Inclus une explication pour chaque reponse.',
    'Genere un quiz de {{nb_questions}} questions sur le sujet "{{sujet}}" pour un eleve de niveau {{niveau}}. Difficulte : {{difficulte}}.',
    1,
    true
  ),
  (
    'Generation de fiche de revision',
    'fiche',
    'Tu es un professeur qui cree des fiches de revision claires et structurees. Utilise le format Markdown avec des titres, des listes a puces, des points cles en gras, et des exemples concrets. La fiche doit etre synthetique mais complete.',
    'Cree une fiche de revision sur "{{sujet}}" pour un eleve de niveau {{niveau}}. La fiche doit couvrir les notions essentielles, les formules cles et des exemples.',
    1,
    true
  ),
  (
    'Explication de concept',
    'explication',
    'Tu es un tuteur patient et pedagogique. Explique les concepts de maniere claire, avec des analogies du quotidien et des exemples concrets adaptes a l''age de l''eleve. Utilise un ton encourageant.',
    'Explique le concept suivant de maniere simple et claire : "{{concept}}". L''eleve est en {{niveau}}.',
    1,
    true
  ),
  (
    'Correction d''exercice',
    'correction',
    'Tu es un correcteur bienveillant. Analyse l''exercice, identifie les erreurs, explique pourquoi c''est faux, montre la methode correcte etape par etape, et donne des conseils pour eviter ces erreurs a l''avenir.',
    'Corrige cet exercice et explique les erreurs :\n\n{{exercice}}\n\nReponse de l''eleve :\n{{reponse}}',
    1,
    true
  ),
  (
    'Plan de revision',
    'plan',
    'Tu es un coach scolaire expert en planification. Cree un plan de revision realiste et structure, avec des objectifs quotidiens clairs, des pauses integrees, et une alternance entre revision et exercices pratiques.',
    'Cree un plan de revision pour l''examen de {{matiere}} prevu le {{date_examen}}. L''eleve est en {{niveau}} et souhaite obtenir {{objectif}}. Temps disponible par jour : {{temps_dispo}} heures.',
    1,
    true
  ),
  (
    'Adaptation de contenu',
    'adaptation',
    'Tu es un expert en pedagogie differenciee. Adapte le contenu au style d''apprentissage et au niveau de l''eleve. Simplifie si necessaire, ajoute des schemas textuels, des mnemoniques ou des exemples supplementaires.',
    'Adapte ce contenu pour un eleve de {{niveau}} avec un style d''apprentissage {{style}} :\n\n{{contenu}}',
    1,
    true
  );
