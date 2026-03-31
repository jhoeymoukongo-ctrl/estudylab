import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Formater une date relative ("il y a 3 jours")
export function formatDateRelative(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

// Formater une date complete
export function formatDate(date: string): string {
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

// Formater un pourcentage
export function formatPourcentage(value: number): string {
  return `${Math.round(value)}%`
}

// Formater une duree en minutes/secondes
export function formatDuree(secondes: number): string {
  const min = Math.floor(secondes / 60)
  const sec = secondes % 60
  if (min === 0) return `${sec}s`
  return sec > 0 ? `${min}min ${sec}s` : `${min}min`
}
