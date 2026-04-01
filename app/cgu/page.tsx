export default function CGUPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-8">
        Conditions générales d&apos;utilisation
      </h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Acceptation des conditions
          </h2>
          <p>
            En utilisant E-StudyLab, vous acceptez les présentes conditions
            générales d&apos;utilisation.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Description du service
          </h2>
          <p>
            E-StudyLab est une plateforme éducative proposant des cours, quiz,
            fiches de révision et un assistant IA. Le service est proposé en
            version gratuite et premium.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Compte utilisateur
          </h2>
          <p>
            Vous êtes responsable de la confidentialité de votre compte et de
            votre mot de passe. Vous vous engagez à ne pas partager vos
            identifiants.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Contenu généré par IA
          </h2>
          <p>
            Le contenu généré par l&apos;intelligence artificielle est fourni à
            titre indicatif et pédagogique. Il ne se substitue pas à
            l&apos;enseignement d&apos;un professeur qualifié.
          </p>
        </section>
      </div>
    </div>
  );
}
