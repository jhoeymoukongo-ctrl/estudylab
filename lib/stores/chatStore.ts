import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MessageEli {
  id: string
  role: 'user' | 'assistant'
  contenu: string
  timestamp: number
}

interface ChatStore {
  messages: MessageEli[]
  ajouterMessage: (msg: Omit<MessageEli, 'id' | 'timestamp'>) => void
  mettreAJourDernier: (contenu: string) => void
  viderConversation: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],

      ajouterMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...msg,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      // Met a jour le contenu du dernier message (pour le streaming)
      mettreAJourDernier: (contenu) =>
        set((state) => {
          const msgs = [...state.messages]
          if (msgs.length > 0) {
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], contenu }
          }
          return { messages: msgs }
        }),

      viderConversation: () => set({ messages: [] }),
    }),
    {
      name: 'eli-conversation',
      partialize: (state) => ({
        messages: state.messages.slice(-50),
      }),
    }
  )
)
