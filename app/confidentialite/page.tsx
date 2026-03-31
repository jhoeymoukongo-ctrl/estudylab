export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-8">
        Politique de confidentialite
      </h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Donnees collectees
          </h2>
          <p>
            Nous collectons uniquement les donnees necessaires au
            fonctionnement du service : adresse email, prenom, niveau scolaire
            et donnees de progression.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Utilisation des donnees
          </h2>
          <p>
            Vos donnees sont utilisees exclusivement pour personnaliser votre
            experience d&apos;apprentissage. Elles ne sont jamais vendues a des
            tiers.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Securite
          </h2>
          <p>
            Vos donnees sont hebergees sur Supabase avec chiffrement au repos
            et en transit. Les mots de passe sont haches avec bcrypt.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Vos droits
          </h2>
          <p>
            Conformement au RGPD, vous pouvez demander l&apos;acces, la
            modification ou la suppression de vos donnees a tout moment.
          </p>
        </section>
      </div>
    </div>
  );
}
