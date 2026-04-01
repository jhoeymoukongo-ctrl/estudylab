import type {
  GeneratedLesson,
  GeneratedQuiz,
  GeneratedExercise,
  GeneratedFiche,
} from "./types";

// ═══════════════════════════════════════════
// Parsing robuste des réponses Claude
// ═══════════════════════════════════════════

/**
 * Extrait du JSON depuis une réponse Claude qui peut contenir
 * du texte autour, des backticks markdown, etc.
 */
export function extractJson(raw: string): unknown {
  // 1. Tenter un parse direct
  try {
    return JSON.parse(raw);
  } catch {
    // continue
  }

  // 2. Extraire le contenu entre ```json ... ``` ou ``` ... ```
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue
    }
  }

  // 3. Trouver le premier { ... } ou [ ... ] complet
  const firstBrace = raw.indexOf("{");
  const firstBracket = raw.indexOf("[");
  const start = firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket)
    ? firstBrace
    : firstBracket;

  if (start >= 0) {
    const openChar = raw[start];
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < raw.length; i++) {
      const c = raw[i];
      if (escape) { escape = false; continue; }
      if (c === "\\") { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === openChar) depth++;
      if (c === closeChar) depth--;
      if (depth === 0) {
        try {
          return JSON.parse(raw.substring(start, i + 1));
        } catch {
          break;
        }
      }
    }
  }

  throw new Error(`Impossible d'extraire du JSON valide de la réponse (${raw.substring(0, 200)}...)`);
}

// ── Validation des structures ─────────────

export function parseLesson(raw: string): GeneratedLesson {
  const data = extractJson(raw) as Record<string, unknown>;

  if (!data.titre || !data.contenu_markdown) {
    throw new Error("Leçon invalide : titre et contenu_markdown sont requis");
  }

  const keyPoints = Array.isArray(data.key_points) ? data.key_points : [];
  const examples = Array.isArray(data.examples) ? data.examples : [];

  return {
    titre: String(data.titre),
    slug: String(data.slug || slugify(String(data.titre))),
    contenu_markdown: String(data.contenu_markdown),
    duree_minutes: Number(data.duree_minutes) || 20,
    niveau_difficulte: String(data.niveau_difficulte || "moyen"),
    key_points: keyPoints.map(String).slice(0, 5),
    examples: examples.slice(0, 3).map((ex: Record<string, unknown>) => ({
      titre: String(ex.titre || "Exemple"),
      contenu: String(ex.contenu || ""),
      explication: String(ex.explication || ""),
    })),
  };
}

export function parseQuiz(raw: string): GeneratedQuiz {
  const data = extractJson(raw) as Record<string, unknown>;

  if (!data.titre || !Array.isArray(data.questions)) {
    throw new Error("Quiz invalide : titre et questions[] sont requis");
  }

  const questions = (data.questions as Record<string, unknown>[]).map((q) => {
    const choix = Array.isArray(q.choix) ? q.choix : [];
    const hasCorrect = choix.some((c: Record<string, unknown>) => c.est_correcte === true);

    // S'assurer qu'il y a exactement 1 bonne réponse
    const normalizedChoix = choix.slice(0, 4).map((c: Record<string, unknown>, i: number) => ({
      contenu: String(c.contenu || `Choix ${i + 1}`),
      est_correcte: Boolean(c.est_correcte),
    }));

    if (!hasCorrect && normalizedChoix.length > 0) {
      normalizedChoix[0].est_correcte = true;
    }

    return {
      enonce: String(q.enonce || ""),
      explication_reponse: String(q.explication_reponse || q.explication || ""),
      choix: normalizedChoix,
    };
  });

  return {
    titre: String(data.titre),
    description: String(data.description || ""),
    questions,
  };
}

export function parseExercise(raw: string): GeneratedExercise {
  const data = extractJson(raw) as Record<string, unknown>;

  if (!data.titre || !data.enonce) {
    throw new Error("Exercice invalide : titre et enonce sont requis");
  }

  return {
    titre: String(data.titre),
    enonce: String(data.enonce),
    corrige: String(data.corrige || ""),
    type: String(data.type || "probleme"),
    duree_minutes: Number(data.duree_minutes) || 15,
  };
}

export function parseFiche(raw: string): GeneratedFiche {
  const data = extractJson(raw) as Record<string, unknown>;

  if (!data.titre || !data.contenu_markdown) {
    throw new Error("Fiche invalide : titre et contenu_markdown sont requis");
  }

  return {
    titre: String(data.titre),
    contenu_markdown: String(data.contenu_markdown),
  };
}

// ── Utilitaire slug ───────────────────────

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
