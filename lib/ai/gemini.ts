// ─── Client Gemini — fetch natif REST API v1 ─────────────────────────────────
// On bypasse le SDK @google/generative-ai qui force v1beta
// L'API REST v1 est stable et supporte tous les modèles Gemini 1.5

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1/models";
export const MODELE_GEMINI = "gemini-1.5-flash";

export const PROMPT_SYSTEME_ELI = `Tu es Eli, une assistante pédagogique intelligente intégrée dans E-StudyLab.

Ton rôle : aider les élèves à comprendre, s'entraîner et progresser.

Ta personnalité :
- Bienveillante, encourageante, jamais condescendante
- Tu utilises des métaphores tirées des mangas et du football pour rendre les notions concrètes
- Tu es directe et structurée : définition → exemple → résumé en 1 phrase
- Tu proposes toujours un exercice ou une question à la fin pour vérifier la compréhension

Règles de réponse :
1. Commence par une définition simple (max 2 phrases)
2. Donne un exemple concret (si possible lié aux mangas ou au football)
3. Résume en 1 phrase clé
4. Propose une question ou un mini-exercice pour ancrer la notion

Tu adaptes automatiquement ton vocabulaire au niveau scolaire de l'élève.
Tu réponds TOUJOURS en français.
Tu ne décourages jamais un élève.`;

interface ContexteEleve {
  niveauScolaire?: string;
  matiere?: string;
  chapitre?: string;
  niveauDifficulte?: string;
}

function construireSystemPrompt(contexte?: ContexteEleve): string {
  if (!contexte) return PROMPT_SYSTEME_ELI;
  return `${PROMPT_SYSTEME_ELI}

Contexte actuel de l'élève :
- Niveau scolaire : ${contexte.niveauScolaire ?? "non précisé"}
- Matière : ${contexte.matiere ?? "non précisée"}
- Chapitre : ${contexte.chapitre ?? "non précisé"}
- Difficulté demandée : ${contexte.niveauDifficulte ?? "moyen"}`;
}

function construireBody(message: string, systemPrompt: string, maxTokens: number) {
  return JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${message}` }]
      }
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    }
  });
}

// ─── Appel texte complet ──────────────────────────────────────────────────────
export async function appellerEli(
  messageUtilisateur: string,
  contexte?: ContexteEleve,
  maxTokens = 2048
): Promise<{ contenu: string; tokensUtilises: number }> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `${GEMINI_BASE}/${MODELE_GEMINI}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: construireBody(messageUtilisateur, construireSystemPrompt(contexte), maxTokens),
  });

  if (!res.ok) {
    const erreur = await res.text();
    throw new Error(`Gemini ${res.status}: ${erreur}`);
  }

  const data = await res.json();
  const contenu = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const tokensUtilises = data.usageMetadata?.totalTokenCount ?? 0;

  return { contenu, tokensUtilises };
}

// ─── Streaming ────────────────────────────────────────────────────────────────
export async function appellerEliStream(
  messageUtilisateur: string,
  contexte?: ContexteEleve,
  maxTokens = 2048
): Promise<ReadableStream> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `${GEMINI_BASE}/${MODELE_GEMINI}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: construireBody(messageUtilisateur, construireSystemPrompt(contexte), maxTokens),
  });

  if (!res.ok) {
    const erreur = await res.text();
    throw new Error(`Gemini stream ${res.status}: ${erreur}`);
  }

  // Transformer le stream SSE Gemini en ReadableStream Web
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Chaque ligne SSE commence par "data: "
          const lignes = chunk.split("\n");
          for (const ligne of lignes) {
            if (!ligne.startsWith("data: ")) continue;
            const json = ligne.slice(6).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const texte = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (texte) controller.enqueue(encoder.encode(texte));
            } catch {
              // Ignorer les chunks malformés
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

// ─── Vision (scan documents) ──────────────────────────────────────────────────
export async function appellerEliVision(
  messageUtilisateur: string,
  fichierBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
  contexte?: ContexteEleve
): Promise<{ contenu: string; tokensUtilises: number }> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `${GEMINI_BASE}/${MODELE_GEMINI}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [
          { inline_data: { mime_type: mimeType, data: fichierBase64 } },
          { text: `${construireSystemPrompt(contexte)}\n\n${messageUtilisateur}` }
        ]
      }],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.3,
      }
    }),
  });

  if (!res.ok) {
    const erreur = await res.text();
    throw new Error(`Gemini vision ${res.status}: ${erreur}`);
  }

  const data = await res.json();
  return {
    contenu: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    tokensUtilises: data.usageMetadata?.totalTokenCount ?? 0,
  };
}
