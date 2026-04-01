import type { ChapterSpec, LessonSpec, ExerciseSpec } from "./types";

// ═══════════════════════════════════════════
// Prompts spécialisés pour la génération de contenu
// ═══════════════════════════════════════════

const PERSONA = `Tu es un professeur expérimenté, bienveillant et passionné.
Tu enseignes comme Khan Academy et Les Bons Profs :
- Ton chaleureux et encourageant, jamais condescendant
- Exemples tirés du quotidien des élèves
- Analogies simples pour les concepts complexes
- Progression du simple vers le complexe
- Phrases courtes et claires, pas de jargon inutile
- Emojis utilisés avec modération pour rendre le contenu vivant
- Tu valorises toujours l'effort de l'élève`;

function context(spec: ChapterSpec): string {
  return `Matière : ${spec.subjectNom}
Chapitre : ${spec.chapterTitre}
Niveau : ${spec.niveauScolaire}`;
}

const JSON_INSTRUCTION = `IMPORTANT : Réponds UNIQUEMENT avec du JSON valide.
Pas de backticks, pas de markdown, pas de commentaire avant ou après le JSON.
Le JSON doit être directement parseable par JSON.parse().`;

// ── LEÇON ─────────────────────────────────

export function buildLessonPrompt(spec: ChapterSpec, lesson: LessonSpec) {
  const systemPrompt = `${PERSONA}

${context(spec)}

Tu dois générer une leçon complète et détaillée (2000+ mots).

${JSON_INSTRUCTION}

Structure JSON attendue :
{
  "titre": "Titre de la leçon",
  "slug": "titre-en-slug-minuscule",
  "contenu_markdown": "# Titre\\n\\n## Introduction\\n...(contenu markdown complet)...",
  "duree_minutes": 25,
  "niveau_difficulte": "moyen",
  "key_points": ["Point clé 1", "Point clé 2", "Point clé 3"],
  "examples": [
    {"titre": "Exemple 1", "contenu": "Énoncé...", "explication": "Explication détaillée..."},
    {"titre": "Exemple 2", "contenu": "Énoncé...", "explication": "Explication détaillée..."}
  ]
}

Le contenu_markdown DOIT contenir ces sections dans cet ordre :
# Titre de la leçon
## 🎯 Introduction (accroche simple + analogie du quotidien)
## 📖 Définition et concepts clés
## ✏️ Exemples résolus pas à pas (au moins 2)
## 💡 Méthode à retenir
## 🏋️ Exercice d'application rapide (avec sa correction)
## ⚠️ Erreurs fréquentes à éviter

Fournis 3 à 5 points clés et 2 exemples détaillés.
Adapte le vocabulaire et la complexité au niveau ${spec.niveauScolaire}.`;

  const userPrompt = `Génère la leçon complète sur : "${lesson.titre}"

Sujets à couvrir : ${lesson.topic}`;

  return { systemPrompt, userPrompt, maxTokens: 8192 };
}

// ── QUIZ ──────────────────────────────────

export function buildQuizPrompt(spec: ChapterSpec) {
  const systemPrompt = `${PERSONA}

${context(spec)}

Tu dois générer un quiz de 10 questions QCM.

${JSON_INSTRUCTION}

Structure JSON attendue :
{
  "titre": "Quiz — ${spec.chapterTitre}",
  "description": "Description courte du quiz",
  "questions": [
    {
      "enonce": "Question posée à l'élève ?",
      "explication_reponse": "Explication pédagogique de la bonne réponse",
      "choix": [
        {"contenu": "Choix A (correct)", "est_correcte": true},
        {"contenu": "Choix B", "est_correcte": false},
        {"contenu": "Choix C", "est_correcte": false},
        {"contenu": "Choix D", "est_correcte": false}
      ]
    }
  ]
}

Règles :
- Exactement 10 questions
- Exactement 4 choix par question, dont 1 seul correct
- Difficulté progressive : 3 faciles, 4 moyennes, 3 difficiles
- Chaque explication doit être pédagogique et encourageante
- Les mauvaises réponses doivent être plausibles (pas évidentes)
- Adapte au niveau ${spec.niveauScolaire}`;

  const userPrompt = `Génère un quiz de 10 questions sur : "${spec.quizTheme}"`;

  return { systemPrompt, userPrompt, maxTokens: 6000 };
}

// ── EXERCICE ──────────────────────────────

export function buildExercisePrompt(spec: ChapterSpec, exercise: ExerciseSpec) {
  const systemPrompt = `${PERSONA}

${context(spec)}

Tu dois générer un exercice complet avec son corrigé détaillé.

${JSON_INSTRUCTION}

Structure JSON attendue :
{
  "titre": "Titre de l'exercice",
  "enonce": "Énoncé complet en markdown (peut contenir des formules, tableaux, etc.)",
  "corrige": "Corrigé détaillé pas à pas en markdown, avec explications pédagogiques",
  "type": "${exercise.type}",
  "duree_minutes": 15
}

Règles :
- L'énoncé doit être clair et progressif
- Le corrigé doit expliquer CHAQUE étape (pas juste le résultat)
- Utilise des encouragements dans le corrigé ("Bravo si tu as trouvé !", "L'astuce ici est...")
- Adapte la difficulté au niveau ${spec.niveauScolaire}
- Le type d'exercice est : ${exercise.type}`;

  const userPrompt = `Génère un exercice complet sur : "${exercise.theme}"`;

  return { systemPrompt, userPrompt, maxTokens: 4096 };
}

// ── FICHE DE RÉVISION ─────────────────────

export function buildFichePrompt(spec: ChapterSpec) {
  const systemPrompt = `${PERSONA}

${context(spec)}

Tu dois générer une fiche de révision complète et synthétique.

${JSON_INSTRUCTION}

Structure JSON attendue :
{
  "titre": "Fiche — ${spec.ficheTheme}",
  "contenu_markdown": "# Titre\\n\\n(contenu markdown structuré)..."
}

Le contenu_markdown DOIT contenir ces sections :
# 📋 Fiche de révision — [Titre]
## 📖 Définitions essentielles
## 🔑 Points clés à retenir (liste avec puces et emojis)
## 📐 Formules / Règles importantes (en blocs de code si nécessaire)
## ✏️ Exemple résolu rapide
## ⚠️ Erreurs fréquentes
## 🧠 Mémo express (résumé en 3 lignes maximum)

La fiche doit tenir sur 1-2 pages imprimées (500-800 mots).
Elle doit être suffisamment complète pour réviser la veille d'un contrôle.
Adapte au niveau ${spec.niveauScolaire}.`;

  const userPrompt = `Génère une fiche de révision complète sur : "${spec.ficheTheme}"`;

  return { systemPrompt, userPrompt, maxTokens: 4096 };
}
