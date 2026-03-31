export default function CGUPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-8">
        Conditions generales d&apos;utilisation
      </h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Acceptation des conditions
          </h2>
          <p>
            En utilisant E-StudyLab, vous acceptez les presentes conditions
            generales d&apos;utilisation.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Description du service
          </h2>
          <p>
            E-StudyLab est une plateforme educative proposant des cours, quiz,
            fiches de revision et un assistant IA. Le service est propose en
            version gratuite et premium.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Compte utilisateur
          </h2>
          <p>
            Vous etes responsable de la confidentialite de votre compte et de
            votre mot de passe. Vous vous engagez a ne pas partager vos
            identifiants.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Contenu genere par IA
          </h2>
          <p>
            Le contenu genere par l&apos;intelligence artificielle est fourni a
            titre indicatif et pedagogique. Il ne se substitue pas a
            l&apos;enseignement d&apos;un professeur qualifie.
          </p>
        </section>
      </div>
    </div>
  );
}
