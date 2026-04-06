import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase/server'
import MatieresEleveClient from './MatieresEleveClient'
import type { NiveauAvecMatieres } from '@/types'

export default async function MatieresPage() {
  const supabase = await creerClientServeur()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Profil utilisateur
  const { data: profil } = await supabase
    .from('user_profiles')
    .select('plan, niveau_scolaire')
    .eq('user_id', user.id)
    .single()

  const isPremium = profil?.plan === 'premium'
  const quotaMax  = isPremium ? 10 : 5

  // Quota utilisé aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  const { count: quotaUtilise } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00.000Z`)

  const quotaLeft = Math.max(0, quotaMax - (quotaUtilise ?? 0))

  // Arborescence directement depuis Supabase (pas de fetch interne)
  const { data: niveaux } = await supabase
    .from('education_levels')
    .select('id, nom, ordre')
    .order('ordre')

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, nom, slug, icon, couleur, education_level_id')
    .eq('statut', 'published')

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, titre, slug, ordre, subject_id')
    .eq('statut', 'published')
    .order('ordre')

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, titre, slug, niveau_difficulte, duree_minutes, chapter_id, ordre, statut')
    .eq('statut', 'published')
    .is('deleted_at', null)
    .order('ordre')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, chapter_id')
    .eq('statut', 'published')
    .is('deleted_at', null)

  // Construire l'arborescence
  const arborescence: NiveauAvecMatieres[] = (niveaux ?? []).map(niveau => ({
    id: niveau.id,
    nom: niveau.nom,
    ordre: niveau.ordre,
    matieres: (subjects ?? [])
      .filter(s => s.education_level_id === niveau.id)
      .map(matiere => ({
        id: matiere.id,
        nom: matiere.nom,
        slug: matiere.slug,
        icon: matiere.icon ?? '📚',
        couleur: matiere.couleur ?? '#1E3A5F',
        chapitres: (chapters ?? [])
          .filter(c => c.subject_id === matiere.id)
          .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
          .map((chapitre, idx) => ({
            id: chapitre.id,
            num: idx + 1,
            titre: chapitre.titre,
            slug: chapitre.slug,
            ordre: chapitre.ordre ?? idx,
            subject_id: matiere.id,
            quiz_id: (quizzes ?? []).find(q => q.chapter_id === chapitre.id)?.id ?? null,
            ressources: (lessons ?? [])
              .filter(l => l.chapter_id === chapitre.id)
              .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
              .map(l => ({
                id: l.id,
                type: 'lecon' as const,
                titre: l.titre,
                ext: null,
                ordre: l.ordre ?? 0,
                statut: l.statut as 'published',
                chapter_id: chapitre.id,
                created_at: '',
              })),
          })),
      }))
      .filter(m => m.chapitres.length > 0),
  })).filter(n => n.matieres.length > 0)

  return (
    <MatieresEleveClient
      arborescence={arborescence}
      isPremium={isPremium}
      quotaLeft={quotaLeft}
      quotaMax={quotaMax}
    />
  )
}
