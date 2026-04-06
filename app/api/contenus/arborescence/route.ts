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
    // Récupérer subjects, chapters, lessons, quizzes en parallèle
    const [subjectsRes, chaptersRes, lessonsRes, quizzesRes] = await Promise.all([
      supabase
        .from('subjects')
        .select('id, nom, slug, icon, couleur, statut, education_level_id')
        .order('nom'),
      supabase
        .from('chapters')
        .select('id, titre, slug, ordre, subject_id, statut')
        .order('ordre'),
      supabase
        .from('lessons')
        .select('id, titre, slug, niveau_difficulte, duree_minutes, chapter_id, statut, ordre')
        .is('deleted_at', null)
        .order('ordre'),
      supabase
        .from('quizzes')
        .select('id, titre, chapter_id, statut')
        .is('deleted_at', null),
    ])

    const subjects  = subjectsRes.data  ?? []
    const chapters  = chaptersRes.data  ?? []
    const lessons   = lessonsRes.data   ?? []
    const quizzes   = quizzesRes.data   ?? []

    // Filtrer selon le rôle
    const subjectsVis = isAdmin ? subjects : subjects.filter(s => s.statut === 'published')
    const chaptersVis = isAdmin ? chapters : chapters.filter(c => c.statut === 'published')
    const lessonsVis  = isAdmin ? lessons  : lessons.filter(l => l.statut === 'published')

    // Construire les chapitres avec ressources
    const chapitresAvecRessources = chaptersVis.map((chap, idx) => {
      const ressources = lessonsVis
        .filter(l => l.chapter_id === chap.id)
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
        .map(l => ({
          id: l.id,
          type: 'lecon' as const,
          titre: l.titre,
          ext: null,
          ordre: l.ordre ?? 0,
          statut: l.statut,
          chapter_id: chap.id,
          created_at: '',
        }))

      const quizLie = quizzes.find(
        q => q.chapter_id === chap.id && q.statut === 'published'
      )

      return {
        id: chap.id,
        num: idx + 1,
        titre: chap.titre,
        slug: chap.slug,
        ordre: chap.ordre ?? idx,
        subject_id: chap.subject_id,
        quiz_id: quizLie?.id ?? null,
        ressources,
      }
    })

    // Construire les matières avec chapitres
    const matieresAvecChapitres = subjectsVis.map(sub => ({
      id: sub.id,
      nom: sub.nom,
      slug: sub.slug,
      icon: sub.icon ?? '📚',
      couleur: sub.couleur ?? '#1E3A5F',
      education_level_id: sub.education_level_id,
      chapitres: chapitresAvecRessources
        .filter(c => c.subject_id === sub.id)
        .sort((a, b) => a.ordre - b.ordre),
    }))

    // ─── Stratégie d'arborescence ─────────────────────────────────────────
    // Si les subjects ont des education_level_id → grouper par niveau
    // Sinon → afficher les matières directement sous un pseudo-niveau

    const subjectsAvecNiveau = matieresAvecChapitres.filter(m => m.education_level_id)
    const subjectsSansNiveau = matieresAvecChapitres.filter(m => !m.education_level_id)

    if (subjectsAvecNiveau.length > 0) {
      // Cas normal : grouper par niveau
      const { data: niveaux } = await supabase
        .from('education_levels')
        .select('id, nom, ordre')
        .order('ordre')

      const arborescence = (niveaux ?? []).map(niveau => ({
        id: niveau.id,
        nom: niveau.nom,
        ordre: niveau.ordre,
        matieres: matieresAvecChapitres
          .filter(m => m.education_level_id === niveau.id)
          .filter(m => isAdmin || m.chapitres.length > 0),
      })).filter(n => isAdmin || n.matieres.length > 0)

      // Ajouter les matières sans niveau dans un groupe "Autres"
      if (subjectsSansNiveau.length > 0) {
        arborescence.push({
          id: 'sans-niveau',
          nom: 'Autres matières',
          ordre: 999,
          matieres: subjectsSansNiveau,
        })
      }

      return NextResponse.json(arborescence)

    } else {
      // Cas de secours : aucune matière n'a de education_level_id
      // Chaque matière devient un pseudo-niveau
      const arborescence = matieresAvecChapitres
        .filter(m => isAdmin || m.chapitres.length > 0)
        .map(m => ({
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

      return NextResponse.json(arborescence)
    }

  } catch (error) {
    console.error('[arborescence] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    )
  }
}
