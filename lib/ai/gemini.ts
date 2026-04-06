import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const MODELE_GEMINI = "gemini-1.5-flash-latest";

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

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function appellerEli(
  messageUtilisateur: string,
  contexte?: ContexteEleve,
  maxTokens = 2048
): Promise<{ contenu: string; tokensUtilises: number }> {
  const model = genAI.getGenerativeModel({
    model: MODELE_GEMINI,
    systemInstruction: construireSystemPrompt(contexte),
    generationConfig: {
      thinkingConfig: { thinkingBudget: 1024 },
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    safetySettings: SAFETY_SETTINGS,
  });

  const result = await model.generateContent(messageUtilisateur);
  const response = result.response;
  return {
    contenu: response.text(),
    tokensUtilises: response.usageMetadata?.totalTokenCount ?? 0,
  };
}

export async function appellerEliStream(
  messageUtilisateur: string,
  contexte?: ContexteEleve,
  maxTokens = 2048
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({
    model: MODELE_GEMINI,
    systemInstruction: construireSystemPrompt(contexte),
    generationConfig: {
      thinkingConfig: { thinkingBudget: 1024 },
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    safetySettings: SAFETY_SETTINGS,
  });

  const streamResult = await model.generateContentStream(messageUtilisateur);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of streamResult.stream) {
        const texte = chunk.text();
        if (texte) controller.enqueue(encoder.encode(texte));
      }
      controller.close();
    },
  });
}

export async function appellerEliVision(
  messageUtilisateur: string,
  fichierBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
  contexte?: ContexteEleve
): Promise<{ contenu: string; tokensUtilises: number }> {
  const model = genAI.getGenerativeModel({
    model: MODELE_GEMINI,
    systemInstruction: construireSystemPrompt(contexte),
    generationConfig: {
      thinkingConfig: { thinkingBudget: 2048 },
      maxOutputTokens: 4096,
      temperature: 0.3,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    safetySettings: SAFETY_SETTINGS,
  });

  const result = await model.generateContent([
    { inlineData: { data: fichierBase64, mimeType } },
    messageUtilisateur,
  ]);

  const response = result.response;
  return {
    contenu: response.text(),
    tokensUtilises: response.usageMetadata?.totalTokenCount ?? 0,
  };
}
