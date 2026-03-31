import Link from "next/link";

const footerLinks = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalites", href: "#fonctionnalites" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Mentions legales", href: "/mentions-legales" },
      { label: "Politique de confidentialite", href: "/confidentialite" },
      { label: "CGU", href: "/cgu" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Aide", href: "/aide" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="font-display text-xl font-bold text-brand-vert">
              E-StudyLab
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              La plateforme educative IA pour reussir tes etudes, du college a la licence.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-semibold text-sm">
                {group.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-dark-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} E-StudyLab. Tous droits reserves.
          </p>
          <p className="text-xs text-muted-foreground">
            Fait avec passion pour les etudiants francais
          </p>
        </div>
      </div>
    </footer>
  );
}
