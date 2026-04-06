import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await creerClientServeur()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const role = request.nextUrl.searchParams.get('role') ?? 'eleve'
  const isAdmin = role === 'admin'

  try {
    // Récupérer tout en parallèle
    const [niveauxRes, subjectsRes, chaptersRes, lessonsRes, quizzesRes] = await Promise.all([
      supabase.from('education_levels').select('id, nom, ordre').order('ordre'),
      supabase.from('subjects').select('id, nom, slug, icon, couleur, education_level_id, statut'),
      supabase.from('chapters').select('id, titre, slug, ordre, subject_id, statut').order('ordre'),
      supabase.from('lessons')
        .select('id, titre, slug, niveau_difficulte, duree_minutes, chapter_id, statut, ordre')
        .is('deleted_at', null)
        .order('ordre'),
      supabase.from('quizzes')
        .select('id, titre, chapter_id, statut')
        .is('deleted_at', null),
    ])

    const niveaux   = niveauxRes.data   ?? []
    const subjects  = subjectsRes.data  ?? []
    const chapters  = chaptersRes.data  ?? []
    const lessons   = lessonsRes.data   ?? []
    const quizzes   = quizzesRes.data   ?? []

    // Filtrer selon le rôle
    const subjectsVisibles = isAdmin ? subjects : subjects.filter(s => s.statut === 'published')
    const chaptersVisibles = isAdmin ? chapters : chapters.filter(c => c.statut === 'published')
    const lessonsVisibles  = isAdmin ? lessons  : lessons.filter(l => l.statut === 'published')

    // Construire l'arborescence
    const arborescence = niveaux.map(niveau => {
      const matieresNiveau = subjectsVisibles
        .filter(s => s.education_level_id === niveau.id)
        .map(matiere => {
          const chapitresMatiere = chaptersVisibles
            .filter(c => c.subject_id === matiere.id)
            .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
            .map((chapitre, idx) => {
              const ressources = lessonsVisibles
                .filter(l => l.chapter_id === chapitre.id)
                .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
                .map(l => ({
                  id: l.id,
                  type: 'lecon' as const,
                  titre: l.titre,
                  ext: null as null,
                  ordre: l.ordre ?? 0,
                  statut: l.statut,
                  chapter_id: chapitre.id,
                  created_at: '',
                }))

              const quizLie = quizzes.find(q => q.chapter_id === chapitre.id && q.statut === 'published')

              return {
                id: chapitre.id,
                num: idx + 1,
                titre: chapitre.titre,
                slug: chapitre.slug,
                ordre: chapitre.ordre ?? idx,
                subject_id: matiere.id,
                quiz_id: quizLie?.id ?? null,
                ressources,
              }
            })

          return {
            id: matiere.id,
            nom: matiere.nom,
            slug: matiere.slug,
            icon: matiere.icon ?? '📚',
            couleur: matiere.couleur ?? '#1E3A5F',
            chapitres: chapitresMatiere,
          }
        })

      return {
        id: niveau.id,
        nom: niveau.nom,
        ordre: niveau.ordre,
        matieres: matieresNiveau,
      }
    })

    return NextResponse.json(arborescence)

  } catch (error) {
    console.error('[arborescence] Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
  }
}
