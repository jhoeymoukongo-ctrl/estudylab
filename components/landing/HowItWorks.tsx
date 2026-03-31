import { UserPlus, BookOpen, Brain, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Cree ton compte",
    description: "Inscris-toi en 30 secondes et choisis ton niveau scolaire.",
    color: "text-brand-vert",
    bg: "bg-brand-vert/10",
  },
  {
    icon: BookOpen,
    title: "Explore les cours",
    description:
      "Parcours des lecons structurees par matiere et chapitre, adaptees a ton programme.",
    color: "text-brand-violet",
    bg: "bg-brand-violet/10",
  },
  {
    icon: Brain,
    title: "Teste-toi avec les quiz",
    description:
      "Quiz interactifs generes par IA pour verifier ta comprehension en temps reel.",
    color: "text-brand-jaune",
    bg: "bg-brand-jaune/10",
  },
  {
    icon: TrendingUp,
    title: "Progresse chaque jour",
    description:
      "Suis tes statistiques, identifie tes points faibles et ameliore-toi continuellement.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
];

export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Comment ca marche ?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            4 etapes simples pour booster tes resultats
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {/* Step number */}
              <div className="mx-auto mb-4 text-5xl font-display font-bold text-dark-elevated">
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Icon */}
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg}`}
              >
                <step.icon size={28} className={step.color} />
              </div>

              <h3 className="font-display text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
