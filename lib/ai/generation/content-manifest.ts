import type { ChapterSpec } from "./types";

// ═══════════════════════════════════════════
// Manifeste des 12 chapitres à générer
// ═══════════════════════════════════════════

export const CONTENT_MANIFEST: ChapterSpec[] = [
  // ── MATHÉMATIQUES ────────────────────────
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "fonctions",
    chapterTitre: "Fonctions",
    niveauScolaire: "Terminale Générale",
    lessons: [
      {
        titre: "Qu'est-ce qu'une fonction ? Définition et représentation graphique",
        topic: "Définition d'une fonction, domaine de définition, image, antécédent, courbe représentative. Exemples concrets (vitesse, température, prix).",
      },
      {
        titre: "La dérivée — définition, interprétation et calcul",
        topic: "Nombre dérivé, taux de variation, tangente, fonction dérivée, formules de dérivation (somme, produit, quotient), applications à l'étude de variations.",
      },
    ],
    quizTheme: "Fonctions et dérivées — 10 QCM de difficulté progressive",
    exercises: [
      { theme: "Calcul de dérivées simples avec corrigé détaillé pas à pas", type: "calcul" },
      { theme: "Étude complète de variations d'une fonction polynomiale", type: "probleme" },
    ],
    ficheTheme: "Fonctions et dérivées — Résumé complet Terminale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "algebre",
    chapterTitre: "Algèbre",
    niveauScolaire: "2nde Générale",
    lessons: [
      {
        titre: "Résoudre une équation du second degré — méthode complète",
        topic: "Forme ax²+bx+c=0, discriminant Δ, formules des racines, cas Δ>0, Δ=0, Δ<0, factorisation, exemples résolus.",
      },
      {
        titre: "Systèmes d'équations linéaires — substitution et combinaison",
        topic: "Système 2×2, méthode de substitution, méthode de combinaison linéaire, interprétation graphique, exemples concrets (mélange, vitesse).",
      },
    ],
    quizTheme: "Équations et systèmes — 10 QCM",
    exercises: [
      { theme: "Résolution d'équations du second degré avec discriminant", type: "calcul" },
      { theme: "Résolution de systèmes 2×2 par substitution et combinaison", type: "calcul" },
    ],
    ficheTheme: "Algèbre — Équations et systèmes",
  },

  // ── SVT ──────────────────────────────────
  {
    subjectSlug: "svt",
    subjectNom: "Sciences de la Vie et de la Terre",
    chapterSlug: "vivant-evolution",
    chapterTitre: "Le vivant et son évolution",
    niveauScolaire: "Terminale Générale",
    lessons: [
      {
        titre: "L'ADN — structure, rôle et transmission de l'information génétique",
        topic: "Structure en double hélice, bases azotées (A-T, G-C), gène, allèle, code génétique, réplication, transcription, traduction. Analogie avec un livre de recettes.",
      },
      {
        titre: "Les mutations génétiques — causes, types et conséquences",
        topic: "Mutation ponctuelle (substitution, insertion, délétion), agents mutagènes, mutations neutres/bénéfiques/délétères, lien avec l'évolution et la sélection naturelle.",
      },
    ],
    quizTheme: "Génétique et ADN — 10 QCM",
    exercises: [
      { theme: "Analyse d'un arbre généalogique pour déterminer le mode de transmission d'un caractère", type: "probleme" },
      { theme: "Schéma commenté des étapes de la mitose", type: "redaction" },
    ],
    ficheTheme: "Génétique — L'essentiel à savoir",
  },
  {
    subjectSlug: "svt",
    subjectNom: "Sciences de la Vie et de la Terre",
    chapterSlug: "planete-terre",
    chapterTitre: "La planète Terre",
    niveauScolaire: "3ème",
    lessons: [
      {
        titre: "Les écosystèmes — définition, composantes et interactions",
        topic: "Biotope et biocénose, chaîne alimentaire, réseau trophique, producteurs/consommateurs/décomposeurs, flux de matière et d'énergie. Exemple : écosystème d'une mare.",
      },
      {
        titre: "La biodiversité — enjeux et menaces actuelles",
        topic: "Définition (génétique, spécifique, écosystémique), causes de l'érosion (déforestation, pollution, changement climatique), services écosystémiques, actions de protection.",
      },
    ],
    quizTheme: "Écosystèmes et biodiversité — 10 QCM",
    exercises: [
      { theme: "Analyse d'une chaîne alimentaire : identifier producteurs, consommateurs et décomposeurs", type: "probleme" },
      { theme: "Étude d'un écosystème local : description et interactions", type: "redaction" },
    ],
    ficheTheme: "Le vivant et son environnement",
  },

  // ── PHYSIQUE-CHIMIE ──────────────────────
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "mouvements-interactions",
    chapterTitre: "Mouvements et interactions",
    niveauScolaire: "Terminale Générale",
    lessons: [
      {
        titre: "Les lois de Newton — principe d'inertie et relation fondamentale",
        topic: "1ère loi (inertie), 2ème loi (ΣF = ma), 3ème loi (action-réaction), référentiels galiléens, exemples : freinage, chute libre, satellite.",
      },
      {
        titre: "Les forces — poids, réaction, tension et frottement",
        topic: "Force gravitationnelle (P=mg), réaction du support, tension d'un fil, frottements solides et fluides, bilan des forces, diagramme objet-interaction.",
      },
    ],
    quizTheme: "Mécanique et lois de Newton — 10 QCM",
    exercises: [
      { theme: "Calcul de forces et accélérations avec la 2ème loi de Newton", type: "calcul" },
      { theme: "Étude d'un mouvement rectiligne uniforme et uniformément accéléré", type: "probleme" },
    ],
    ficheTheme: "Mécanique — Les lois de Newton",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "organisation-matiere",
    chapterTitre: "Organisation de la matière",
    niveauScolaire: "1ère Générale",
    lessons: [
      {
        titre: "Les groupes fonctionnels — alcool, aldéhyde, cétone, acide",
        topic: "Chimie organique, groupes fonctionnels principaux (-OH, -CHO, -CO-, -COOH), nomenclature IUPAC, identification sur une formule semi-développée, propriétés caractéristiques.",
      },
      {
        titre: "Les réactions d'estérification et hydrolyse",
        topic: "Synthèse d'un ester (acide + alcool), équation-bilan, catalyse, réversibilité, hydrolyse, rendement, applications (arômes, parfums, médicaments).",
      },
    ],
    quizTheme: "Chimie organique et groupes fonctionnels — 10 QCM",
    exercises: [
      { theme: "Identifier et nommer des molécules organiques à partir de formules", type: "probleme" },
      { theme: "Équilibrer une réaction d'estérification et calculer un rendement", type: "calcul" },
    ],
    ficheTheme: "Chimie organique — Groupes fonctionnels",
  },

  // ── FRANÇAIS ─────────────────────────────
  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "grammaire-expression",
    chapterTitre: "Grammaire et expression",
    niveauScolaire: "1ère Générale",
    lessons: [
      {
        titre: "Analyser un texte narratif — narrateur, point de vue, temps",
        topic: "Types de narrateur (interne, externe, omniscient), focalisation, temps du récit (passé simple, imparfait), rythme narratif (ellipse, scène, sommaire, pause), exemple avec extrait de Maupassant.",
      },
      {
        titre: "Les procédés stylistiques — figures de style essentielles",
        topic: "Métaphore, comparaison, personnification, hyperbole, litote, oxymore, anaphore, chiasme, gradation. Pour chaque figure : définition + exemple littéraire + effet produit.",
      },
    ],
    quizTheme: "Le roman et la narration — 10 QCM",
    exercises: [
      { theme: "Analyse d'un extrait de roman : identifier narrateur, focalisation et temps", type: "redaction" },
      { theme: "Rédiger un paragraphe de commentaire de texte avec citations", type: "redaction" },
    ],
    ficheTheme: "Le roman — Notions essentielles pour le Bac",
  },
  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "litterature-analyse",
    chapterTitre: "Littérature et analyse",
    niveauScolaire: "1ère Générale",
    lessons: [
      {
        titre: "La dissertation — méthode et structure en 5 étapes",
        topic: "Analyse du sujet, problématique, plan (thèse/antithèse/synthèse ou thématique), rédaction de l'introduction et conclusion, transitions, exemples littéraires. Méthode pas à pas.",
      },
      {
        titre: "Les genres de l'argumentation — essai, discours, pamphlet",
        topic: "Argumentation directe vs indirecte, essai (Montaigne), discours (Hugo), pamphlet (Voltaire), fable (La Fontaine), conte philosophique. Stratégies argumentatives : convaincre, persuader, délibérer.",
      },
    ],
    quizTheme: "L'argumentation — 10 QCM",
    exercises: [
      { theme: "Construire un plan de dissertation détaillé à partir d'un sujet donné", type: "redaction" },
      { theme: "Rédiger une introduction de dissertation complète", type: "redaction" },
    ],
    ficheTheme: "La dissertation — méthode complète",
  },

  // ── HISTOIRE-GÉOGRAPHIE ──────────────────
  {
    subjectSlug: "histoire-geo",
    subjectNom: "Histoire-Géographie",
    chapterSlug: "premiere-guerre-mondiale",
    chapterTitre: "La Première Guerre mondiale",
    niveauScolaire: "3ème",
    lessons: [
      {
        titre: "Les causes et le déclenchement de la Grande Guerre (1914)",
        topic: "Tensions européennes (nationalisme, impérialisme, alliances), attentat de Sarajevo, engrenage des alliances (Triple-Entente vs Triple-Alliance), mobilisation générale, guerre de mouvement.",
      },
      {
        titre: "La guerre des tranchées — vie des soldats et bilan humain",
        topic: "Guerre de position 1915-1917, conditions de vie dans les tranchées, batailles de Verdun et de la Somme, nouvelles armes (gaz, chars, avions), bilan : 10 millions de morts, gueules cassées, traumatisme.",
      },
    ],
    quizTheme: "La Première Guerre mondiale — 10 QCM",
    exercises: [
      { theme: "Analyse d'un document historique : affiche de propagande de 1914-1918", type: "redaction" },
      { theme: "Rédiger un paragraphe argumenté sur la vie des Poilus dans les tranchées", type: "redaction" },
    ],
    ficheTheme: "La Première Guerre mondiale — Dates et repères clés",
  },

  // ── ANGLAIS ──────────────────────────────
  {
    subjectSlug: "anglais",
    subjectNom: "Anglais",
    chapterSlug: "grammaire-conjugaison",
    chapterTitre: "Grammaire et conjugaison",
    niveauScolaire: "2nde Générale",
    lessons: [
      {
        titre: "Les temps en anglais — présent simple vs présent continu",
        topic: "Formation du present simple (I work, he works) et present continuous (I am working), emplois respectifs (habitude vs action en cours), marqueurs temporels, erreurs fréquentes des francophones.",
      },
      {
        titre: "Le prétérit — formes régulières et irrégulières",
        topic: "Prétérit simple (I worked, I went), formation régulière (-ed) et irrégulière (liste des 50 verbes les plus courants), emplois, marqueurs temporels (yesterday, last week, ago), questions et négations.",
      },
    ],
    quizTheme: "Les temps anglais (present simple, present continuous, past simple) — 10 QCM",
    exercises: [
      { theme: "Conjuguer des verbes au bon temps (present simple, continuous, past simple)", type: "calcul" },
      { theme: "Traduire 10 phrases du français à l'anglais en utilisant le bon temps", type: "redaction" },
    ],
    ficheTheme: "Les temps anglais — Tableau de référence",
  },

  // ── ESPAGNOL ─────────────────────────────
  {
    subjectSlug: "espagnol",
    subjectNom: "Espagnol",
    chapterSlug: "grammaire-espagnole",
    chapterTitre: "Grammaire espagnole",
    niveauScolaire: "2nde Générale",
    lessons: [
      {
        titre: "Le présent de l'indicatif en espagnol — verbes réguliers et irréguliers",
        topic: "Conjugaison des 3 groupes (-ar, -er, -ir), verbes irréguliers courants (ser, estar, ir, tener, hacer, poder, querer), diphtongue (e→ie, o→ue), affaiblissement (e→i). Différence ser/estar.",
      },
      {
        titre: "Le passé composé (pretérito perfecto) — formation et usage",
        topic: "Auxiliaire haber + participe passé, participes réguliers et irréguliers (hecho, dicho, visto, escrito), emplois (action récente, expérience), marqueurs (hoy, esta semana, ya, todavía), comparaison avec le français.",
      },
    ],
    quizTheme: "Grammaire espagnole (présent et passé composé) — 10 QCM",
    exercises: [
      { theme: "Conjuguer des verbes au présent de l'indicatif (réguliers et irréguliers)", type: "calcul" },
      { theme: "Traduire des phrases au passé composé du français vers l'espagnol", type: "redaction" },
    ],
    ficheTheme: "Grammaire espagnole — Les temps essentiels",
  },

  // ── MATHÉMATIQUES — Géométrie ───────────────
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "geometrie",
    chapterTitre: "Géométrie — Vecteurs et transformations",
    niveauScolaire: "2nde Générale",
    lessons: [
      {
        titre: "Les vecteurs dans le plan",
        topic: "Définition d'un vecteur, coordonnées, addition de vecteurs, multiplication par un scalaire, colinéarité",
      },
      {
        titre: "Translations et homothéties",
        topic: "Translation par un vecteur, homothétie de centre et de rapport, propriétés et constructions géométriques",
      },
    ],
    quizTheme: "Vecteurs et transformations géométriques en 2nde",
    exercises: [
      { theme: "Coordonnées de vecteurs, norme, addition et colinéarité", type: "calcul" },
      { theme: "Appliquer une translation et une homothétie à une figure géométrique", type: "probleme" },
    ],
    ficheTheme: "Vecteurs et transformations géométriques — 2nde",
  },

  // ── HISTOIRE-GÉOGRAPHIE — Seconde Guerre mondiale ──
  {
    subjectSlug: "histoire-geo",
    subjectNom: "Histoire-Géographie",
    chapterSlug: "seconde-guerre-mondiale",
    chapterTitre: "La Seconde Guerre mondiale (1939-1945)",
    niveauScolaire: "Terminale Générale",
    lessons: [
      {
        titre: "Causes et déclenchement de la Seconde Guerre mondiale",
        topic: "Montée des totalitarismes, politique d'apaisement, pacte germano-soviétique, invasion de la Pologne, déclaration de guerre",
      },
      {
        titre: "Une guerre totale : génocides et crimes contre l'humanité",
        topic: "Shoah, génocide des Tziganes, crimes de guerre japonais, bombardements de populations civiles, conférence de Wannsee",
      },
    ],
    quizTheme: "La Seconde Guerre mondiale — causes, déroulement et conséquences",
    exercises: [
      { theme: "Analyser un discours ou une affiche de propagande de la période 1939-1945", type: "redaction" },
      { theme: "Replacer dans l'ordre les événements majeurs : Blitzkrieg, Barbarossa, Pearl Harbor, Débarquement, capitulations", type: "probleme" },
    ],
    ficheTheme: "La Seconde Guerre mondiale — repères chronologiques et notions clés",
  },
];
