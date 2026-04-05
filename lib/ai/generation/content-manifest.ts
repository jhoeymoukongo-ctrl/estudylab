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

  // ═══════════════════════════════════════════════════════════════
  // MATHÉMATIQUES — 2nde (4 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "ensembles-nombres-2nde",
    chapterTitre: "Ensembles de nombres et calcul numérique",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Les ensembles de nombres : N, Z, D, Q, R", topic: "Entiers naturels, relatifs, décimaux, rationnels et réels. Inclusions, valeur absolue, intervalles, notation scientifique, ordre de grandeur" },
      { titre: "Calcul numérique et priorités opératoires", topic: "Priorités opératoires, puissances et racines carrées, fractions et pgcd, développement et factorisation simples" },
    ],
    quizTheme: "Ensembles de nombres et calcul numérique en 2nde",
    exercises: [
      { theme: "Classer et comparer des nombres — placer des nombres dans les bons ensembles, comparer avec valeur absolue et intervalles", type: "calcul" },
      { theme: "Calculs avec priorités et puissances — appliquer les priorités opératoires, calculer avec des puissances et des racines", type: "calcul" },
    ],
    ficheTheme: "Ensembles de nombres et calcul numérique — 2nde",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "fonctions-affines-2nde",
    chapterTitre: "Fonctions : généralités et fonctions affines",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Notion de fonction et représentation graphique", topic: "Définition d une fonction, image et antécédent, courbe représentative, lecture graphique, variations et extrema" },
      { titre: "Fonctions affines et linéaires", topic: "Définition f(x)=ax+b, coefficient directeur, ordonnée à l origine, croissance et décroissance, intersection de droites" },
    ],
    quizTheme: "Fonctions générales et fonctions affines en 2nde",
    exercises: [
      { theme: "Lecture graphique et images — lire image et antécédent sur une courbe, déterminer intervalles de variations", type: "calcul" },
      { theme: "Équations de droites — déterminer l équation d une droite, trouver intersection, modéliser une situation réelle", type: "probleme" },
    ],
    ficheTheme: "Fonctions et fonctions affines — 2nde",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "statistiques-2nde",
    chapterTitre: "Statistiques descriptives",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Indicateurs de position et de dispersion", topic: "Moyenne, médiane, quartiles Q1 et Q3, écart interquartile, étendue, diagramme en boîte" },
      { titre: "Représentations graphiques en statistiques", topic: "Histogramme, diagramme en bâtons, diagramme circulaire, courbe des fréquences cumulées, lecture et interprétation" },
    ],
    quizTheme: "Statistiques descriptives en 2nde",
    exercises: [
      { theme: "Calculer moyenne, médiane et quartiles à partir d une série de données et tracer la boîte à moustaches", type: "calcul" },
      { theme: "Lire et interpréter un histogramme de fréquences, calculer les indicateurs, commenter la distribution", type: "probleme" },
    ],
    ficheTheme: "Statistiques descriptives — 2nde",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "probabilites-2nde",
    chapterTitre: "Probabilités et expériences aléatoires",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Expériences aléatoires et probabilités", topic: "Univers, événements, probabilité, propriétés (0≤P≤1, somme=1), événement contraire, réunion et intersection" },
      { titre: "Fréquences, probabilités et loi des grands nombres", topic: "Fréquences relatives, stabilisation vers la probabilité, loi des grands nombres, simulations, équiprobabilité" },
    ],
    quizTheme: "Probabilités et expériences aléatoires en 2nde",
    exercises: [
      { theme: "Calculer des probabilités simples — construire l univers, calculer P(A), P(non A), P(A∪B) et P(A∩B)", type: "calcul" },
      { theme: "Simulation et loi des grands nombres — interpréter une simulation, relier fréquences observées et probabilités théoriques", type: "probleme" },
    ],
    ficheTheme: "Probabilités et expériences aléatoires — 2nde",
  },

  // ═══════════════════════════════════════════════════════════════
  // MATHÉMATIQUES — Terminale Générale (7 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "suites-numeriques-terminale",
    chapterTitre: "Suites numériques",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Suites arithmétiques et géométriques", topic: "Définition explicite et par récurrence, raison, terme général, somme des termes, applications financières" },
      { titre: "Convergence et raisonnement par récurrence", topic: "Limite d une suite, suite monotone bornée, raisonnement par récurrence, initialisation et hérédité" },
    ],
    quizTheme: "Suites numériques en Terminale générale",
    exercises: [
      { theme: "Calculer termes et sommes de suites — trouver le terme général, calculer S_n d une suite arithmétique ou géométrique", type: "calcul" },
      { theme: "Démonstration par récurrence — rédiger une démonstration complète avec initialisation et hérédité", type: "redaction" },
    ],
    ficheTheme: "Suites numériques — Terminale générale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "limites-continuite-terminale",
    chapterTitre: "Limites et continuité",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Limites de fonctions et de suites", topic: "Limite finie et infinie, limites en l infini, formes indéterminées, opérations sur les limites, théorème des gendarmes" },
      { titre: "Continuité et théorème des valeurs intermédiaires", topic: "Fonction continue sur un intervalle, TVI, existence de racines, asymptotes horizontales et verticales" },
    ],
    quizTheme: "Limites et continuité en Terminale générale",
    exercises: [
      { theme: "Calculer des limites — lever des formes indéterminées, utiliser les limites de référence", type: "calcul" },
      { theme: "Appliquer le TVI — montrer l existence d une solution, encadrer une racine par dichotomie", type: "probleme" },
    ],
    ficheTheme: "Limites et continuité — Terminale générale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "derivation-convexite-terminale",
    chapterTitre: "Dérivation et convexité",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Dérivée et tableaux de variations", topic: "Dérivées usuelles, règles de dérivation, signe de f prime, tableau de variations, extrema locaux et globaux" },
      { titre: "Convexité et primitives", topic: "Dérivée seconde, convexité, concavité, point d inflexion, primitives d une fonction, notation" },
    ],
    quizTheme: "Dérivation et convexité en Terminale générale",
    exercises: [
      { theme: "Étude complète d une fonction — calculer f prime, dresser le tableau de signes et de variations, trouver les extrema", type: "calcul" },
      { theme: "Problème d optimisation — modéliser une situation, trouver le maximum ou minimum d une fonction sur un intervalle", type: "probleme" },
    ],
    ficheTheme: "Dérivation et convexité — Terminale générale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "logarithme-exponentielle-terminale",
    chapterTitre: "Fonctions logarithme et exponentielle",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Fonction logarithme népérien", topic: "Définition de ln, propriétés algébriques (ln(ab), ln(a/b), ln(a^n)), dérivée, variations, courbe, équations et inéquations" },
      { titre: "Fonction exponentielle", topic: "Définition de exp, propriétés (exp(a+b), réciproque de ln), dérivée, croissance comparée, modèles exponentiel et logarithmique" },
    ],
    quizTheme: "Fonctions logarithme et exponentielle en Terminale générale",
    exercises: [
      { theme: "Équations et inéquations avec ln et exp — résoudre des équations et inéquations faisant intervenir ln et exp", type: "calcul" },
      { theme: "Modèle de croissance exponentielle — modéliser une population ou une désintégration radioactive, calculer un temps de demi-vie", type: "probleme" },
    ],
    ficheTheme: "Fonctions logarithme et exponentielle — Terminale générale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "calcul-integral-terminale",
    chapterTitre: "Calcul intégral",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Intégrale : définition et calcul", topic: "Définition de l intégrale, lien avec les primitives, théorème fondamental, calcul d intégrales simples, intégration par parties" },
      { titre: "Applications de l intégrale", topic: "Aire entre deux courbes, valeur moyenne d une fonction, applications en physique et en probabilités" },
    ],
    quizTheme: "Calcul intégral en Terminale générale",
    exercises: [
      { theme: "Calculer des intégrales à l aide de primitives et d intégrations par parties simples", type: "calcul" },
      { theme: "Aire entre deux courbes — trouver les intersections, calculer l aire d une surface délimitée par deux courbes", type: "probleme" },
    ],
    ficheTheme: "Calcul intégral — Terminale générale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "probabilites-loi-normale-terminale",
    chapterTitre: "Probabilités — loi binomiale et loi normale",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Variables aléatoires et loi binomiale", topic: "Variable aléatoire discrète, espérance, variance, loi de Bernoulli, loi binomiale B(n,p), calcul de probabilités" },
      { titre: "Loi normale et estimation", topic: "Loi normale N(μ,σ²), propriétés, intervalle de fluctuation, estimation d une proportion, prise de décision" },
    ],
    quizTheme: "Loi binomiale et loi normale en Terminale générale",
    exercises: [
      { theme: "Calculer avec la loi binomiale — identifier un schéma de Bernoulli, calculer P(X=k), P(X≤k), espérance et variance", type: "calcul" },
      { theme: "Estimation et intervalle de confiance — construire un intervalle de fluctuation, tester une hypothèse, prendre une décision statistique", type: "probleme" },
    ],
    ficheTheme: "Loi binomiale et loi normale — Terminale générale",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "nombres-complexes-terminale",
    chapterTitre: "Nombres complexes",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Forme algébrique des nombres complexes", topic: "Définition de i, partie réelle et imaginaire, conjugué, module, opérations algébriques, résolution d équations du 2nd degré" },
      { titre: "Forme trigonométrique et exponentielle", topic: "Argument d un complexe, forme trigonométrique, formule d Euler, puissances et racines n-ièmes, représentation dans le plan" },
    ],
    quizTheme: "Nombres complexes en Terminale générale",
    exercises: [
      { theme: "Calculs en forme algébrique — effectuer additions, multiplications, divisions de complexes, calculer module et conjugué", type: "calcul" },
      { theme: "Forme trigonométrique et géométrie — convertir en forme trigonométrique, calculer une puissance, interpréter géométriquement", type: "probleme" },
    ],
    ficheTheme: "Nombres complexes — Terminale générale",
  },

  // ═══════════════════════════════════════════════════════════════
  // MATHÉMATIQUES — Terminale STI2D (6 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "suites-sti2d",
    chapterTitre: "Suites arithmétiques et géométriques",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Suites arithmétiques et géométriques — définitions", topic: "Suite arithmétique (raison r), suite géométrique (raison q), terme général, applications : intérêts composés, amortissement" },
      { titre: "Somme des termes et applications technologiques", topic: "Calcul de S_n pour suites arithmétiques et géométriques, applications en électronique (charges capacitives) et en économie" },
    ],
    quizTheme: "Suites arithmétiques et géométriques en Terminale STI2D",
    exercises: [
      { theme: "Calculer termes et sommes — trouver terme général et somme S_n, identifier le type de suite", type: "calcul" },
      { theme: "Application aux intérêts composés — modéliser un placement financier ou un amortissement avec une suite géométrique", type: "probleme" },
    ],
    ficheTheme: "Suites arithmétiques et géométriques — Terminale STI2D",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "fonctions-exponentielles-logarithme-sti2d",
    chapterTitre: "Fonctions exponentielles et logarithme décimal",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Fonctions exponentielles de base a", topic: "f(x)=a^x avec a>0, propriétés, dérivée, croissance et décroissance, applications : croissance démographique, charge de condensateur" },
      { titre: "Fonction logarithme décimal", topic: "log₁₀(x), propriétés, relation avec log décibels, pH, magnitude sismique, résolution d équations exponentielles" },
    ],
    quizTheme: "Fonctions exponentielles et logarithme décimal en STI2D",
    exercises: [
      { theme: "Résoudre des équations exponentielles — utiliser log pour résoudre a^x = b, comparer des croissances", type: "calcul" },
      { theme: "Niveaux sonores en décibels — calculer des niveaux sonores avec la formule L = 10·log(I/I₀), interpréter des résultats", type: "probleme" },
    ],
    ficheTheme: "Fonctions exponentielles et logarithme décimal — STI2D",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "variables-aleatoires-loi-binomiale-sti2d",
    chapterTitre: "Variables aléatoires et loi binomiale",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Variables aléatoires discrètes — espérance et variance", topic: "Variable aléatoire, loi de probabilité, espérance E(X), variance V(X), écart-type, applications au contrôle qualité" },
      { titre: "Loi binomiale et applications industrielles", topic: "Schéma de Bernoulli, loi binomiale B(n,p), calcul de P(X=k), P(X≤k), contrôle par échantillonnage" },
    ],
    quizTheme: "Variables aléatoires et loi binomiale en STI2D",
    exercises: [
      { theme: "Calculer espérance et variance à partir d un tableau de loi", type: "calcul" },
      { theme: "Contrôle qualité par échantillonnage — modéliser un contrôle qualité avec B(n,p), calculer la probabilité d accepter un lot", type: "probleme" },
    ],
    ficheTheme: "Variables aléatoires et loi binomiale — STI2D",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "probabilites-conditionnelles-sti2d",
    chapterTitre: "Probabilités conditionnelles",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Probabilité conditionnelle et indépendance", topic: "P(A|B) = P(A∩B)/P(B), événements indépendants, tableaux de contingence, arbres de probabilités" },
      { titre: "Formule des probabilités totales", topic: "Partition de l univers, formule des probabilités totales, formule de Bayes, applications à la fiabilité industrielle" },
    ],
    quizTheme: "Probabilités conditionnelles en Terminale STI2D",
    exercises: [
      { theme: "Calculer des probabilités conditionnelles — utiliser un arbre ou un tableau pour calculer P(A|B) et vérifier l indépendance", type: "calcul" },
      { theme: "Fiabilité d un système industriel — calculer la probabilité de bon fonctionnement d un système en série ou en parallèle", type: "probleme" },
    ],
    ficheTheme: "Probabilités conditionnelles — Terminale STI2D",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "primitives-equations-differentielles-sti2d",
    chapterTitre: "Primitives et équations différentielles",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Primitives d une fonction", topic: "Définition d une primitive, primitives des fonctions usuelles, constante d intégration, calcul d intégrales simples" },
      { titre: "Équations différentielles du 1er ordre", topic: "Équation y' = ay, solution générale et particulière, constante de temps τ, modélisation : circuit RC, refroidissement de Newton" },
    ],
    quizTheme: "Primitives et équations différentielles en STI2D",
    exercises: [
      { theme: "Calculer des primitives — trouver la primitive d une fonction usuelle ou composée, déterminer la constante", type: "calcul" },
      { theme: "Charge d un condensateur (circuit RC) — résoudre l équation différentielle du circuit RC, tracer u_C(t), calculer la constante de temps", type: "probleme" },
    ],
    ficheTheme: "Primitives et équations différentielles — STI2D",
  },
  {
    subjectSlug: "mathematiques",
    subjectNom: "Mathématiques",
    chapterSlug: "series-statistiques-deux-variables-sti2d",
    chapterTitre: "Séries statistiques à deux variables",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Nuage de points et corrélation", topic: "Représentation d une série bivariée, point moyen G, coefficient de corrélation linéaire r, interprétation" },
      { titre: "Droite de régression et ajustement", topic: "Méthode des moindres carrés, équation de la droite y=ax+b, coefficient a et b, interpolation et extrapolation, limites du modèle" },
    ],
    quizTheme: "Séries statistiques à deux variables en STI2D",
    exercises: [
      { theme: "Calculer le coefficient de corrélation à partir d un tableau de données et interpréter la liaison linéaire", type: "calcul" },
      { theme: "Droite de régression et prévisions — déterminer la droite de régression, l utiliser pour faire des prévisions, évaluer la fiabilité", type: "probleme" },
    ],
    ficheTheme: "Séries statistiques à deux variables — STI2D",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHYSIQUE-CHIMIE — 2nde (4 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "constitution-matiere-2nde",
    chapterTitre: "Constitution et transformations de la matière",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Atomes, molécules et ions", topic: "Structure de l atome, tableau périodique, électronégativité, ions monoatomiques et polyatomiques, liaison covalente" },
      { titre: "Transformations physiques et chimiques", topic: "Dissolution, mélanges, corps purs, réactions chimiques, conservation de la matière, équation bilan" },
    ],
    quizTheme: "Constitution et transformations de la matière en 2nde",
    exercises: [
      { theme: "Identifier et nommer atomes et ions — déterminer la configuration électronique, trouver la charge d un ion, nommer une molécule", type: "calcul" },
      { theme: "Équilibrer une équation bilan — écrire et équilibrer une réaction chimique, vérifier la conservation de la matière", type: "probleme" },
    ],
    ficheTheme: "Constitution et transformations de la matière — 2nde",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "mouvement-interactions-2nde",
    chapterTitre: "Mouvement et interactions",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Description d un mouvement", topic: "Référentiel, trajectoire (rectiligne, circulaire), vecteur vitesse, vitesse scalaire, mouvement uniforme et non uniforme" },
      { titre: "Forces et gravitation universelle", topic: "Force gravitationnelle (loi de Newton), poids, réaction normale, forces de contact, principe des actions réciproques" },
    ],
    quizTheme: "Mouvement et interactions en 2nde",
    exercises: [
      { theme: "Calculer une vitesse moyenne — calculer vitesse et durée, convertir des unités, décrire une trajectoire", type: "calcul" },
      { theme: "Forces gravitationnelles dans le système solaire — appliquer la loi de Newton, comparer poids sur différentes planètes", type: "probleme" },
    ],
    ficheTheme: "Mouvement et interactions — 2nde",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "energie-transferts-2nde",
    chapterTitre: "Énergie et transferts thermiques",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Énergie : formes et conversions", topic: "Énergie cinétique, potentielle, chimique, électrique, thermique, conservation de l énergie, rendement" },
      { titre: "Transferts thermiques", topic: "Conduction, convection, rayonnement, bilan thermique, isolation, effet de serre, puissance thermique" },
    ],
    quizTheme: "Énergie et transferts thermiques en 2nde",
    exercises: [
      { theme: "Calculer énergie et rendement — calculer Ec, Ep, énergie électrique (P×t), rendement d un dispositif", type: "calcul" },
      { theme: "Bilan thermique d un logement — calculer les pertes thermiques, comparer des isolants, estimer une consommation énergétique", type: "probleme" },
    ],
    ficheTheme: "Énergie et transferts thermiques — 2nde",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "ondes-signaux-2nde",
    chapterTitre: "Ondes et signaux",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Ondes mécaniques et lumière", topic: "Ondes transversales et longitudinales, célérité, fréquence, longueur d onde, spectre de la lumière visible" },
      { titre: "Signaux périodiques et son", topic: "Période, fréquence, amplitude, son et ultrasons, hauteur et timbre d un son, signaux numériques vs analogiques" },
    ],
    quizTheme: "Ondes et signaux en 2nde",
    exercises: [
      { theme: "Relation entre célérité, fréquence et longueur d onde — appliquer v = λ·f, calculer la longueur d onde d une couleur", type: "calcul" },
      { theme: "Analyser un signal sonore — lire un oscillogramme, déterminer période et fréquence, distinguer hauteur et timbre", type: "probleme" },
    ],
    ficheTheme: "Ondes et signaux — 2nde",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHYSIQUE-CHIMIE — Terminale Générale (7 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "transformations-acide-base-terminale",
    chapterTitre: "Transformations acide-base",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "pH, acides et bases", topic: "Théorie de Brønsted, couples acide-base, constante Ka et pKa, pH des solutions acides/basiques fortes et faibles" },
      { titre: "Dosages acide-base", topic: "Titrage, point équivalent, courbe de titrage, indicateurs colorés, titrage pH-métrique, applications analytiques" },
    ],
    quizTheme: "Transformations acide-base en Terminale générale",
    exercises: [
      { theme: "Calculer le pH d une solution — pH d un acide fort, d un acide faible (avec Ka), d une base faible", type: "calcul" },
      { theme: "Exploiter une courbe de titrage — identifier le point équivalent, calculer la concentration inconnue, choisir l indicateur", type: "probleme" },
    ],
    ficheTheme: "Transformations acide-base — Terminale générale",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "oxydoreduction-piles-terminale",
    chapterTitre: "Oxydoréduction — Piles et électrolyse",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Réactions d oxydoréduction", topic: "Oxydant, réducteur, couples Ox/Red, demi-équations électroniques, réaction d oxydoréduction, bilan électronique" },
      { titre: "Piles électrochimiques et électrolyse", topic: "Constitution d une pile (électrodes, pont salin), f.é.m., électrolyse, loi de Faraday, applications (galvanoplastie, accumulateurs)" },
    ],
    quizTheme: "Oxydoréduction, piles et électrolyse en Terminale générale",
    exercises: [
      { theme: "Écrire et équilibrer une réaction redox — identifier oxydant et réducteur, écrire les demi-équations et les combiner", type: "calcul" },
      { theme: "Analyser le fonctionnement d une pile — identifier anode et cathode, écrire les réactions d électrodes, calculer la f.é.m.", type: "probleme" },
    ],
    ficheTheme: "Oxydoréduction, piles et électrolyse — Terminale générale",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "cinetique-chimique-terminale",
    chapterTitre: "Cinétique chimique",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Vitesse de réaction et facteurs cinétiques", topic: "Vitesse de formation et de disparition, concentration, température, surface de contact, influence sur la cinétique" },
      { titre: "Catalyse", topic: "Catalyse homogène et hétérogène, catalyse enzymatique, mécanisme d action, applications industrielles (Haber, pot catalytique)" },
    ],
    quizTheme: "Cinétique chimique en Terminale générale",
    exercises: [
      { theme: "Calculer une vitesse de réaction à partir d un tableau de données", type: "calcul" },
      { theme: "Analyser l effet d un catalyseur — comparer des expériences avec et sans catalyseur, interpréter les profils énergétiques", type: "probleme" },
    ],
    ficheTheme: "Cinétique chimique — Terminale générale",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "chimie-organique-terminale",
    chapterTitre: "Chimie organique",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Groupes fonctionnels et isomérie", topic: "Alcools, aldéhydes, cétones, acides carboxyliques, esters, amines, isomérie de constitution et stéréoisomérie" },
      { titre: "Réactions en chimie organique", topic: "Substitution, addition, élimination, estérification et hydrolyse, synthèse peptidique, polymérisation, chimie verte" },
    ],
    quizTheme: "Chimie organique en Terminale générale",
    exercises: [
      { theme: "Identifier et nommer des molécules organiques selon la nomenclature IUPAC, identifier les groupes fonctionnels", type: "calcul" },
      { theme: "Concevoir une synthèse organique — choisir les réactifs, les conditions, écrire les équations, calculer le rendement", type: "probleme" },
    ],
    ficheTheme: "Chimie organique — Terminale générale",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "mecanique-newtonienne-terminale",
    chapterTitre: "Mécanique newtonienne",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Lois de Newton et équations du mouvement", topic: "Deuxième loi de Newton (ΣF=ma), vecteur accélération, équations horaires, champ gravitationnel" },
      { titre: "Mouvements dans un champ uniforme", topic: "Chute libre, tir parabolique, mouvement dans un champ électrique uniforme, satellites et planètes" },
    ],
    quizTheme: "Mécanique newtonienne en Terminale générale",
    exercises: [
      { theme: "Appliquer la 2ème loi de Newton — bilan des forces, calcul de l accélération, équations horaires v(t) et x(t)", type: "calcul" },
      { theme: "Étudier un tir parabolique — décomposer le mouvement en x et y, trouver portée et hauteur maximale", type: "probleme" },
    ],
    ficheTheme: "Mécanique newtonienne — Terminale générale",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "optique-geometrique-terminale",
    chapterTitre: "Optique géométrique",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Réfraction et loi de Snell-Descartes", topic: "Indice de réfraction, loi de Snell-Descartes (n₁sinθ₁=n₂sinθ₂), réflexion totale interne, fibres optiques" },
      { titre: "Lentilles convergentes et instruments optiques", topic: "Lentille mince convergente, foyer, vergence, relation conjuguée, grandissement, œil, loupe, lunette astronomique" },
    ],
    quizTheme: "Optique géométrique en Terminale générale",
    exercises: [
      { theme: "Appliquer la loi de Snell-Descartes — calculer l angle de réfraction, l angle limite de réflexion totale interne", type: "calcul" },
      { theme: "Construction d une image par une lentille — trouver la position et la taille de l image, calculer le grandissement", type: "probleme" },
    ],
    ficheTheme: "Optique géométrique — Terminale générale",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "induction-electromagnetique-terminale",
    chapterTitre: "Induction électromagnétique",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Flux magnétique et loi de Faraday", topic: "Flux magnétique Φ, loi de Faraday (e=-dΦ/dt), loi de Lenz, force électromotrice induite" },
      { titre: "Alternateur et courant alternatif", topic: "Principe de l alternateur, tension sinusoïdale u(t)=U_max·cos(ωt), valeur efficace, fréquence, transport de l énergie électrique" },
    ],
    quizTheme: "Induction électromagnétique en Terminale générale",
    exercises: [
      { theme: "Calculer une f.é.m. induite — calculer la variation de flux et la f.é.m. induite, déterminer le sens du courant", type: "calcul" },
      { theme: "Analyser un signal alternatif sinusoïdal — identifier U_max, T, f, ω, calculer U_eff, lire un oscillogramme", type: "probleme" },
    ],
    ficheTheme: "Induction électromagnétique — Terminale générale",
  },

  // ═══════════════════════════════════════════════════════════════
  // PHYSIQUE-CHIMIE — Terminale STI2D (11 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "acide-base-sti2d",
    chapterTitre: "Acide-Base et pH",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "pH et mesure de l acidité", topic: "Définition du pH, acides et bases selon Brønsted, couples acide-base, produit ionique de l eau Ke" },
      { titre: "Applications industrielles du pH", topic: "Dosages simples, pH-métrie, contrôle qualité en industrie alimentaire et pharmaceutique" },
    ],
    quizTheme: "Acide-base et pH en Terminale STI2D",
    exercises: [
      { theme: "Calculer le pH d une solution — pH d un acide fort, d une base forte, interpréter une mesure de pH", type: "calcul" },
      { theme: "Dosage par étalonnage — utiliser une courbe d étalonnage pour déterminer une concentration inconnue", type: "probleme" },
    ],
    ficheTheme: "Acide-Base et pH — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "changements-etat-sti2d",
    chapterTitre: "Changements d état et thermodynamique",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Changements d état et chaleur latente", topic: "Fusion, solidification, vaporisation, condensation, chaleur latente L, bilan enthalpique" },
      { titre: "Bilan thermique d un système", topic: "Capacité thermique massique, bilan Q=mcΔT, pertes thermiques, isolation, applications au bâtiment" },
    ],
    quizTheme: "Changements d état et thermodynamique en STI2D",
    exercises: [
      { theme: "Calculer l énergie d un changement d état — appliquer Q=mL, calculer l énergie pour faire fondre ou vaporiser une masse m", type: "calcul" },
      { theme: "Bilan thermique d un bâtiment — calculer les pertes par conduction, comparer des matériaux isolants, estimer la consommation", type: "probleme" },
    ],
    ficheTheme: "Changements d état et thermodynamique — STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "piles-electrochimie-sti2d",
    chapterTitre: "Piles et électrochimie",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Fonctionnement d une pile électrochimique", topic: "Oxydant, réducteur, demi-équations, anode et cathode, f.é.m., capacité énergétique en Wh" },
      { titre: "Accumulateurs et électrolyseurs", topic: "Accumulateur Li-ion, Ni-MH, électrolyse, loi de Faraday, applications : EV, stockage d énergie" },
    ],
    quizTheme: "Piles et électrochimie en Terminale STI2D",
    exercises: [
      { theme: "Analyser une pile Daniell — écrire les demi-équations, identifier anode et cathode, calculer la capacité électrique", type: "calcul" },
      { theme: "Calculs d électrolyse — appliquer la loi de Faraday, calculer la masse déposée ou le volume de gaz produit", type: "probleme" },
    ],
    ficheTheme: "Piles et électrochimie — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "combustions-sti2d",
    chapterTitre: "Combustions et énergie chimique",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Réactions de combustion", topic: "Combustion complète et incomplète, équation bilan, pouvoir calorifique inférieur et supérieur (PCI, PCS)" },
      { titre: "Bilan énergétique et impact environnemental", topic: "Énergie libérée par combustion, rendement d une chaudière, CO₂ émis, comparaison des combustibles fossiles et renouvelables" },
    ],
    quizTheme: "Combustions et énergie chimique en STI2D",
    exercises: [
      { theme: "Calculer l énergie d une combustion — calculer Q = m × PCI, déterminer la masse de CO₂ émise", type: "calcul" },
      { theme: "Rendement d une chaudière à gaz — calculer le rendement, comparer gaz naturel, fioul et bois, estimer les économies", type: "probleme" },
    ],
    ficheTheme: "Combustions et énergie chimique — STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "energie-puissance-sti2d",
    chapterTitre: "Énergie et puissance",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Énergie et puissance : définitions et unités", topic: "Joule, Watt, kWh, énergie mécanique (cinétique + potentielle), énergie électrique P=UI, rendement η" },
      { titre: "Conversions et pertes énergétiques", topic: "Chaînes énergétiques, pertes par effet Joule, pertes mécaniques, diagramme de Sankey, bilan énergétique global" },
    ],
    quizTheme: "Énergie et puissance en Terminale STI2D",
    exercises: [
      { theme: "Calculer puissance et énergie — P=UI, E=Pt, rendement η=P_utile/P_absorbée, convertir entre J et kWh", type: "calcul" },
      { theme: "Bilan énergétique d un moteur électrique — tracer le diagramme de Sankey, identifier les pertes, calculer le rendement global", type: "probleme" },
    ],
    ficheTheme: "Énergie et puissance — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "conduction-thermique-sti2d",
    chapterTitre: "Conduction thermique",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Flux thermique et résistance thermique", topic: "Flux thermique Φ (W), résistance thermique R_th = e/(λS), analogie électrique, paroi composite" },
      { titre: "Isolation thermique et bilan d un bâtiment", topic: "Coefficient U (W/m²K), DPE, calcul des déperditions, choix de l isolant, réglementation thermique RT2020" },
    ],
    quizTheme: "Conduction thermique en Terminale STI2D",
    exercises: [
      { theme: "Calculer une résistance thermique d une paroi simple et d une paroi composite (résistances en série)", type: "calcul" },
      { theme: "Déperditions thermiques d une maison — calculer le flux thermique total, estimer la puissance de chauffage nécessaire", type: "probleme" },
    ],
    ficheTheme: "Conduction thermique — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "puissance-electrique-sti2d",
    chapterTitre: "Puissance électrique et circuits",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Courant alternatif sinusoïdal", topic: "Tension u(t)=U_max·cos(ωt+φ), valeur efficace, fréquence, période, représentation temporelle et spectrale" },
      { titre: "Puissance active, réactive et facteur de puissance", topic: "Puissance active P (W), puissance réactive Q (VAR), puissance apparente S (VA), facteur de puissance cos φ, compensation" },
    ],
    quizTheme: "Puissance électrique et circuits en STI2D",
    exercises: [
      { theme: "Analyser un signal alternatif — lire U_max, T, f, ω, calculer U_eff = U_max/√2 depuis un oscillogramme", type: "calcul" },
      { theme: "Améliorer le facteur de puissance — calculer cos φ, déterminer la capacité de compensation", type: "probleme" },
    ],
    ficheTheme: "Puissance électrique et circuits — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "lumiere-optique-sti2d",
    chapterTitre: "Lumière et optique",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Propagation de la lumière et réfraction", topic: "Indice de réfraction, loi de Snell-Descartes, réflexion totale interne, fibres optiques, applications télécoms" },
      { titre: "Photons et photodétecteurs", topic: "Énergie d un photon E=hf, photodiode, photorésistance, cellule photovoltaïque, LED, applications optoélectroniques" },
    ],
    quizTheme: "Lumière et optique en Terminale STI2D",
    exercises: [
      { theme: "Calculer angles de réfraction — appliquer Snell-Descartes, calculer l angle limite de réflexion totale, débit d une fibre", type: "calcul" },
      { theme: "Cellule photovoltaïque — calculer l énergie de photons, la puissance d une cellule, le rendement d un panneau solaire", type: "probleme" },
    ],
    ficheTheme: "Lumière et optique — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "signaux-ondes-sti2d",
    chapterTitre: "Signaux et ondes",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Ondes mécaniques et sons", topic: "Ondes transversales et longitudinales, célérité, fréquence, longueur d onde, décibels, ultrasons, contrôle non destructif" },
      { titre: "Signaux numériques vs analogiques", topic: "Numérisation, fréquence d échantillonnage, quantification, débit binaire, transmission de données, CAN/CNA" },
    ],
    quizTheme: "Signaux et ondes en Terminale STI2D",
    exercises: [
      { theme: "Calculer avec les ondes sonores — calculer λ = v/f, niveau sonore en dB, distance par écho ultrasonique", type: "calcul" },
      { theme: "Numériser un signal audio — calculer la fréquence d échantillonnage minimale (Nyquist), le débit binaire, la taille d un fichier", type: "probleme" },
    ],
    ficheTheme: "Signaux et ondes — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "mecanique-sti2d",
    chapterTitre: "Mécanique et mouvements",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Lois de Newton et applications", topic: "Bilan des forces, ΣF=ma, poids, réaction normale, frottements, équilibre et PFD, chute libre" },
      { titre: "Travail, puissance et énergie mécanique", topic: "Travail d une force W=F·d·cosα, puissance P=F·v, énergie cinétique et potentielle, théorème travail-énergie" },
    ],
    quizTheme: "Mécanique et mouvements en Terminale STI2D",
    exercises: [
      { theme: "Bilan des forces et accélération — identifier toutes les forces, appliquer ΣF=ma, calculer l accélération et la vitesse", type: "calcul" },
      { theme: "Puissance d un moteur de voiture — calculer le travail des forces, la puissance nécessaire, le rendement du moteur", type: "probleme" },
    ],
    ficheTheme: "Mécanique et mouvements — Terminale STI2D",
  },
  {
    subjectSlug: "physique-chimie",
    subjectNom: "Physique-Chimie",
    chapterSlug: "radioactivite-sti2d",
    chapterTitre: "Radioactivité et physique nucléaire",
    niveauScolaire: "Terminale STI2D",
    lessons: [
      { titre: "Radioactivité et loi de désintégration", topic: "Noyaux atomiques, rayonnements α, β, γ, loi de désintégration N(t)=N₀·e^(-λt), demi-vie, activité" },
      { titre: "Énergie nucléaire et applications", topic: "Défaut de masse, énergie de liaison, fission et fusion, réacteur nucléaire, applications médicales, radioprotection" },
    ],
    quizTheme: "Radioactivité et physique nucléaire en STI2D",
    exercises: [
      { theme: "Calculer la demi-vie et l activité — appliquer N(t)=N₀·e^(-λt), calculer t₁/₂, l activité A=λN, le pourcentage restant", type: "calcul" },
      { theme: "Énergie libérée par fission — calculer le défaut de masse, l énergie E=Δm·c², comparer avec la combustion", type: "probleme" },
    ],
    ficheTheme: "Radioactivité et physique nucléaire — STI2D",
  },

  // ═══════════════════════════════════════════════════════════════
  // SVT — 2nde (3 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "evolution-vivant-2nde",
    chapterTitre: "La Terre, la vie et l évolution du vivant",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Biodiversité et parentés entre espèces", topic: "Biodiversité spécifique et génétique, arbre phylogénétique, caractères homologues et analogues, classification" },
      { titre: "Évolution et sélection naturelle", topic: "Mécanismes de l évolution (mutations, sélection, dérive), fossiles, preuve de l évolution, exemples concrets" },
    ],
    quizTheme: "Évolution du vivant en 2nde",
    exercises: [
      { theme: "Construire un arbre phylogénétique — identifier les caractères partagés, regrouper les espèces par parentés, lire un cladogramme", type: "probleme" },
      { theme: "Analyser la résistance aux antibiotiques — expliquer l apparition de bactéries résistantes par sélection naturelle", type: "redaction" },
    ],
    ficheTheme: "La Terre, la vie et l évolution du vivant — 2nde",
  },
  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "corps-humain-sante-2nde",
    chapterTitre: "Le corps humain et la santé",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Immunité et défense de l organisme", topic: "Immunité innée et adaptative, lymphocytes T et B, anticorps, mémoire immunitaire, vaccination" },
      { titre: "Alimentation, microbiote et santé", topic: "Microbiote intestinal, rôle des nutriments, dysbiose, comportements à risques, addictions, neurosciences" },
    ],
    quizTheme: "Corps humain et santé en 2nde",
    exercises: [
      { theme: "Analyser une réponse immunitaire — schématiser la réponse immunitaire adaptative, expliquer le principe de la vaccination", type: "probleme" },
      { theme: "Rôle du microbiote dans la santé — expliquer comment le microbiote influence l immunité et la santé globale", type: "redaction" },
    ],
    ficheTheme: "Corps humain et santé — 2nde",
  },
  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "enjeux-planete-2nde",
    chapterTitre: "Enjeux contemporains de la planète",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Agrosystèmes et sols vivants", topic: "Agrosystème vs écosystème naturel, biodiversité des sols, humus, pratiques agricoles durables, pesticides" },
      { titre: "Développement durable et impact humain", topic: "Réchauffement climatique, cycle du carbone, érosion de la biodiversité, ressources en eau, solutions durables" },
    ],
    quizTheme: "Enjeux contemporains de la planète en 2nde",
    exercises: [
      { theme: "Comparer agrosystème et écosystème — analyser les flux de matière et d énergie, identifier l impact humain sur la biodiversité", type: "redaction" },
      { theme: "Analyser des données climatiques — lire des graphiques de températures et de CO₂, relier les deux et identifier les causes", type: "probleme" },
    ],
    ficheTheme: "Enjeux contemporains de la planète — 2nde",
  },

  // ═══════════════════════════════════════════════════════════════
  // SVT — Terminale Générale (5 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "mecanismes-evolution-terminale",
    chapterTitre: "Mécanismes de l évolution",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Sélection naturelle et dérive génétique", topic: "Variabilité génétique, allèles, fréquences alléliques, pression de sélection, dérive génétique, effet fondateur" },
      { titre: "Spéciation et phylogenèse", topic: "Spéciation allopatrique et sympatrique, isolement reproducteur, cladistique, construction de cladogrammes" },
    ],
    quizTheme: "Mécanismes de l évolution en Terminale générale",
    exercises: [
      { theme: "Calculer des fréquences alléliques et génotypiques, appliquer Hardy-Weinberg", type: "calcul" },
      { theme: "Expliquer une spéciation — décrire les étapes d une spéciation allopatrique à partir d un exemple concret", type: "redaction" },
    ],
    ficheTheme: "Mécanismes de l évolution — Terminale générale",
  },
  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "genetique-expression-genome-terminale",
    chapterTitre: "Génétique et expression du génome",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "ADN, transcription et traduction", topic: "Structure de l ADN, réplication, transcription (ARNm), traduction (ribosomes, ARNt, code génétique), protéine" },
      { titre: "Mutations et régulation de l expression génique", topic: "Types de mutations, conséquences, régulation (promoteurs, facteurs de transcription, épigénétique), OGM, CRISPR" },
    ],
    quizTheme: "Génétique et expression du génome en Terminale générale",
    exercises: [
      { theme: "Décoder un message génétique — à partir d une séquence ADN, déduire ARNm puis la séquence d acides aminés", type: "calcul" },
      { theme: "Analyser l effet d une mutation — identifier le type de mutation, prévoir son effet sur la protéine et le phénotype", type: "redaction" },
    ],
    ficheTheme: "Génétique et expression du génome — Terminale générale",
  },
  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "immunologie-terminale",
    chapterTitre: "Immunologie",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Immunité innée et adaptative", topic: "Barrières physiques, phagocytose, inflammation, lymphocytes T (LT4, LT8) et B, réponse humorale et cellulaire" },
      { titre: "Vaccins, greffes et SIDA", topic: "Principe et types de vaccins, compatibilité HLA, rejet de greffe, immunosuppression, VIH et SIDA, trithérapie" },
    ],
    quizTheme: "Immunologie en Terminale générale",
    exercises: [
      { theme: "Schématiser la réponse immunitaire — décrire les étapes de la réponse adaptative humorale lors d une infection bactérienne", type: "redaction" },
      { theme: "Analyser l évolution de la charge virale — interpréter des courbes de charge virale et de LT4, relier à la progression de la maladie", type: "probleme" },
    ],
    ficheTheme: "Immunologie — Terminale générale",
  },
  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "neurone-influx-nerveux-terminale",
    chapterTitre: "Neurone et influx nerveux",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Potentiel d action et synapse", topic: "Potentiel de repos, potentiel d action, propagation, synapse chimique, neurotransmetteurs, inhibition et excitation" },
      { titre: "Cerveau, comportements et addictions", topic: "Plasticité synaptique, circuits de récompense, dopamine, mécanisme des addictions, effets des drogues" },
    ],
    quizTheme: "Neurone et influx nerveux en Terminale générale",
    exercises: [
      { theme: "Analyser un potentiel d action — lire un électroencéphalogramme, identifier les phases, mesurer l amplitude et la durée", type: "probleme" },
      { theme: "Fonctionnement d une synapse — décrire les étapes de la transmission synaptique, expliquer l effet d un médicament ou d une drogue", type: "redaction" },
    ],
    ficheTheme: "Neurone et influx nerveux — Terminale générale",
  },
  {
    subjectSlug: "svt",
    subjectNom: "SVT",
    chapterSlug: "tectonique-plaques-terminale",
    chapterTitre: "Tectonique des plaques et géologie",
    niveauScolaire: "Terminale",
    lessons: [
      { titre: "Dorsales et subduction", topic: "Accrétion océanique aux dorsales, subduction (fosses, plans de Bénioff), volcanisme associé, séismes, cycle de Wilson" },
      { titre: "Géologie et ressources minérales", topic: "Formation des roches magmatiques et métamorphiques, gisements métallifères, ressources pétrolières, enjeux économiques" },
    ],
    quizTheme: "Tectonique des plaques en Terminale générale",
    exercises: [
      { theme: "Analyser des données sismiques — localiser un foyer sismique, relier au contexte tectonique, calculer une vitesse de propagation", type: "probleme" },
      { theme: "Reconstituer l histoire d un océan — décrire les étapes du cycle de Wilson à partir de données géologiques et géophysiques", type: "redaction" },
    ],
    ficheTheme: "Tectonique des plaques et géologie — Terminale générale",
  },

  // ═══════════════════════════════════════════════════════════════
  // FRANÇAIS — 2nde (5 chapitres)
  // ═══════════════════════════════════════════════════════════════

  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "poesie-2nde",
    chapterTitre: "La poésie — formes et figures",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Versification et formes poétiques", topic: "Vers, strophe, rime (embrassée, croisée, plate), mètre (alexandrin, octosyllabe), poème fixe (sonnet, ode, ballade)" },
      { titre: "Figures de style et registres lyriques", topic: "Métaphore, comparaison, personnification, anaphore, hyperbole, registres lyrique, épique et satirique" },
    ],
    quizTheme: "Poésie, versification et figures de style en 2nde",
    exercises: [
      { theme: "Analyser la versification d un poème — identifier le mètre, les rimes, les strophes et le schéma rimique", type: "redaction" },
      { theme: "Identifier et commenter des figures de style — relever et analyser les principales figures d un extrait poétique", type: "redaction" },
    ],
    ficheTheme: "La poésie — formes et figures de style — 2nde",
  },
  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "roman-recit-2nde",
    chapterTitre: "Le roman et le récit",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Narration et points de vue narratifs", topic: "Narrateur (interne, externe, omniscient), focalisation, temps du récit (analepse, prolepse, ellipse), rythme narratif" },
      { titre: "Personnages, incipit et excipit", topic: "Construction du personnage, portrait, discours direct et indirect, incipit et excipit : fonctions et enjeux" },
    ],
    quizTheme: "Le roman et le récit en 2nde",
    exercises: [
      { theme: "Identifier le point de vue narratif — analyser la focalisation d un extrait, justifier avec des indices textuels précis", type: "redaction" },
      { theme: "Commenter un incipit de roman — dégager les fonctions de l incipit, analyser la présentation des personnages et du cadre", type: "redaction" },
    ],
    ficheTheme: "Le roman et le récit — 2nde",
  },
  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "theatre-2nde",
    chapterTitre: "Le théâtre",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Genres dramatiques et structure d une pièce", topic: "Tragédie, comédie, drame, actes et scènes, exposition, nœud, dénouement, règles des trois unités (classicisme)" },
      { titre: "Dialogue dramatique et mise en scène", topic: "Répliques, tirades, didascalies, quiproquo, aparté, double énonciation, tension dramatique, rôle du metteur en scène" },
    ],
    quizTheme: "Le théâtre en 2nde",
    exercises: [
      { theme: "Analyser la structure d une pièce — identifier exposition, nœud et dénouement, analyser la tension dramatique", type: "redaction" },
      { theme: "Commenter un dialogue théâtral — analyser les enjeux, la caractérisation des personnages, les procédés comiques ou tragiques", type: "redaction" },
    ],
    ficheTheme: "Le théâtre — 2nde",
  },
  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "argumentation-2nde",
    chapterTitre: "L argumentation",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Thèse, arguments et exemples", topic: "Thèse, antithèse, argument, exemple, illustration, concession, réfutation, structure d un texte argumentatif" },
      { titre: "Essai, discours et dialogue philosophique", topic: "Genres de l argumentation (essai, pamphlet, lettre ouverte, conte philosophique), registres polémique et didactique" },
    ],
    quizTheme: "L argumentation en 2nde",
    exercises: [
      { theme: "Analyser un texte argumentatif — identifier thèse, arguments et procédés argumentatifs dans un extrait d essai ou de discours", type: "redaction" },
      { theme: "Écrire un paragraphe argumenté — rédiger un paragraphe avec thèse, argument, exemple et conclusion partielle", type: "redaction" },
    ],
    ficheTheme: "L argumentation — 2nde",
  },
  {
    subjectSlug: "francais",
    subjectNom: "Français",
    chapterSlug: "methodes-commentaire-dissertation-2nde",
    chapterTitre: "Méthodes — commentaire et dissertation",
    niveauScolaire: "2nde",
    lessons: [
      { titre: "Méthode du commentaire composé", topic: "Lecture du texte, recherche d axes, construction d un plan, introduction (accroche, situation, thèse, annonce), développement, conclusion" },
      { titre: "Méthode de la dissertation littéraire", topic: "Analyse du sujet, problématique, plan (thèse/antithèse/synthèse ou analytique), rédaction des parties, transitions" },
    ],
    quizTheme: "Méthodes du commentaire et de la dissertation en 2nde",
    exercises: [
      { theme: "Rédiger une introduction de commentaire — écrire une introduction complète avec accroche, situation du texte, thèse et annonce du plan", type: "redaction" },
      { theme: "Construire un plan de dissertation — analyser un sujet, formuler une problématique, proposer un plan détaillé en 3 parties", type: "redaction" },
    ],
    ficheTheme: "Méthodes commentaire et dissertation — 2nde",
  },
];
