export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-8">Mentions legales</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Editeur du site</h2>
          <p>
            E-StudyLab est une plateforme educative editee a titre de projet
            personnel. Pour toute question, contactez-nous via la page de
            contact.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Hebergement</h2>
          <p>
            Le site est heberge par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, USA. La base de donnees est hebergee par Supabase Inc.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Propriete intellectuelle
          </h2>
          <p>
            L&apos;ensemble du contenu du site (textes, images, logos) est
            protege par le droit de la propriete intellectuelle. Toute
            reproduction non autorisee est interdite.
          </p>
        </section>
      </div>
    </div>
  );
}
