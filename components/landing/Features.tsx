import {
  BookOpen,
  Brain,
  FileText,
  ScanLine,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Cours structurés",
    description:
      "Des leçons claires organisées par matière, chapitre et notion. Contenu adapté du collège à la licence.",
    color: "text-brand-vert",
    bg: "bg-brand-vert/10",
  },
  {
    icon: Brain,
    title: "Quiz interactifs IA",
    description:
      "Des quiz générés par intelligence artificielle qui s'adaptent à ton niveau et identifient tes lacunes.",
    color: "text-brand-violet",
    bg: "bg-brand-violet/10",
  },
  {
    icon: FileText,
    title: "Fiches de révision",
    description:
      "Fiches synthétiques générées automatiquement à partir de tes cours. L'essentiel en un coup d'œil.",
    color: "text-brand-jaune",
    bg: "bg-brand-jaune/10",
  },
  {
    icon: ScanLine,
    title: "Scan de documents",
    description:
      "Importe tes cours en photo ou PDF. L'IA extrait le contenu, génère des quiz et des fiches de révision.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: BarChart3,
    title: "Suivi de progression",
    description:
      "Tableau de bord complet avec statistiques, objectifs et recommandations personnalisées.",
    color: "text-brand-bleu",
    bg: "bg-brand-bleu/10",
  },
  {
    icon: MessageSquare,
    title: "Assistant IA",
    description:
      "Pose tes questions à l'assistant pédagogique. Il explique, corrige et t'aide à comprendre étape par étape.",
    color: "text-brand-rouge",
    bg: "bg-brand-rouge/10",
  },
];

export default function Features() {
  return (
    <section
      id="fonctionnalites"
      className="py-20 sm:py-28 bg-dark-card/50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Tout pour réussir tes études
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des outils pédagogiques puissants, propulsés par l&apos;IA
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-dark-border bg-dark-card hover:bg-dark-elevated transition-colors"
            >
              <CardContent className="p-6">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}
                >
                  <f.icon size={24} className={f.color} />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
