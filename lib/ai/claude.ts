import Anthropic from '@anthropic-ai/sdk'

// Instance Claude API — jamais instanciee cote client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const MODELE_CLAUDE = 'claude-sonnet-4-20250514'
export const MAX_TOKENS = 4096

// Appel simple (reponse complete)
export async function appellerClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = MAX_TOKENS
): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODELE_CLAUDE,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const contenu = message.content[0]
  if (contenu.type !== 'text') throw new Error('Reponse IA inattendue')
  return contenu.text
}

// Appel avec image (Claude Vision)
export async function appellerClaudeVision(
  systemPrompt: string,
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODELE_CLAUDE,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: imageBase64,
            },
          },
          { type: 'text', text: 'Analyse ce document scolaire.' },
        ],
      },
    ],
  })

  const contenu = message.content[0]
  if (contenu.type !== 'text') throw new Error('Reponse Vision inattendue')
  return contenu.text
}

// Appel streaming (pour le chat IA)
export async function* streamClaude(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const stream = await anthropic.messages.stream({
    model: MODELE_CLAUDE,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}
