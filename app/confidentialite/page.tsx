export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold mb-8">
        Politique de confidentialité
      </h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Données collectées
          </h2>
          <p>
            Nous collectons uniquement les données nécessaires au
            fonctionnement du service : adresse email, prénom, niveau scolaire
            et données de progression.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Utilisation des données
          </h2>
          <p>
            Vos données sont utilisées exclusivement pour personnaliser votre
            expérience d&apos;apprentissage. Elles ne sont jamais vendues à des
            tiers.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Sécurité
          </h2>
          <p>
            Vos données sont hébergées sur Supabase avec chiffrement au repos
            et en transit. Les mots de passe sont hachés avec bcrypt.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Vos droits
          </h2>
          <p>
            Conformément au RGPD, vous pouvez demander l&apos;accès, la
            modification ou la suppression de vos données à tout moment.
          </p>
        </section>
      </div>
    </div>
  );
}
