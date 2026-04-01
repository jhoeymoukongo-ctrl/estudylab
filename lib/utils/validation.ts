import { z } from 'zod'

// Schemas de validation partages

export const schemaInscription = z.object({
  prenom: z.string().min(2, 'Prénom trop court').max(50),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Minimum 8 caracteres'),
  confirmation: z.string(),
}).refine((data) => data.motDePasse === data.confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmation'],
})

export const schemaConnexion = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
})

export const schemaRequeteIA = z.object({
  notion: z.string().min(1, 'Notion requise').max(500),
  matiere: z.string().optional(),
  chapitre: z.string().optional(),
  niveauDifficulte: z.enum(['facile', 'moyen', 'difficile', 'expert']).optional(),
})

export const schemaMessage = z.object({
  message: z.string().min(1).max(2000),
  action: z.enum(['explication', 'quiz', 'fiche', 'correction', 'plan']).optional(),
  matiere: z.string().optional(),
})
