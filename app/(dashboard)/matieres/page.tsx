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

  // Données
  const [subjectsRes, chaptersRes, lessonsRes, quizzesRes] = await Promise.all([
    supabase
      .from('subjects')
      .select('id, nom, slug, icon, couleur, education_level_id')
      .eq('statut', 'published')
      .order('nom'),
    supabase
      .from('chapters')
      .select('id, titre, slug, ordre, subject_id')
      .eq('statut', 'published')
      .order('ordre'),
    supabase
      .from('lessons')
      .select('id, titre, chapter_id, ordre, statut')
      .eq('statut', 'published')
      .is('deleted_at', null)
      .order('ordre'),
    supabase
      .from('quizzes')
      .select('id, chapter_id')
      .eq('statut', 'published')
      .is('deleted_at', null),
  ])

  const subjects = subjectsRes.data ?? []
  const chapters = chaptersRes.data ?? []
  const lessons  = lessonsRes.data  ?? []
  const quizzes  = quizzesRes.data  ?? []

  // Construire les matières avec chapitres
  const matieresAvecChapitres = subjects.map(sub => ({
    id: sub.id,
    nom: sub.nom,
    slug: sub.slug,
    icon: sub.icon ?? '📚',
    couleur: sub.couleur ?? '#1E3A5F',
    education_level_id: sub.education_level_id,
    chapitres: chapters
      .filter(c => c.subject_id === sub.id)
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map((chap, idx) => ({
        id: chap.id,
        num: idx + 1,
        titre: chap.titre,
        slug: chap.slug,
        ordre: chap.ordre ?? idx,
        subject_id: sub.id,
        quiz_id: quizzes.find(q => q.chapter_id === chap.id)?.id ?? null,
        ressources: lessons
          .filter(l => l.chapter_id === chap.id)
          .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
          .map(l => ({
            id: l.id,
            type: 'lecon' as const,
            titre: l.titre,
            ext: null,
            ordre: l.ordre ?? 0,
            statut: l.statut as 'published',
            chapter_id: chap.id,
            created_at: '',
          })),
      })),
  })).filter(m => m.chapitres.length > 0)

  // Arborescence : grouper par niveau si possible, sinon pseudo-niveaux par matière
  const avecNiveau = matieresAvecChapitres.filter(m => m.education_level_id)
  let arborescence: NiveauAvecMatieres[]

  if (avecNiveau.length > 0) {
    const { data: niveaux } = await supabase
      .from('education_levels')
      .select('id, nom, ordre')
      .order('ordre')

    const sansNiveau = matieresAvecChapitres.filter(m => !m.education_level_id)

    arborescence = (niveaux ?? [])
      .map(niveau => ({
        id: niveau.id,
        nom: niveau.nom,
        ordre: niveau.ordre,
        matieres: matieresAvecChapitres
          .filter(m => m.education_level_id === niveau.id),
      }))
      .filter(n => n.matieres.length > 0)

    if (sansNiveau.length > 0) {
      arborescence.push({
        id: 'sans-niveau',
        nom: 'Autres matières',
        ordre: 999,
        matieres: sansNiveau,
      })
    }
  } else {
    // Fallback : chaque matière = un pseudo-niveau
    arborescence = matieresAvecChapitres.map(m => ({
      id: m.id,
      nom: m.nom,
      ordre: 0,
      matieres: [{
        id: m.id,
        nom: m.nom,
        slug: m.slug,
        icon: m.icon,
        couleur: m.couleur,
        chapitres: m.chapitres,
      }],
    }))
  }

  return (
    <MatieresEleveClient
      arborescence={arborescence}
      isPremium={isPremium}
      quotaLeft={quotaLeft}
      quotaMax={quotaMax}
    />
  )
}
