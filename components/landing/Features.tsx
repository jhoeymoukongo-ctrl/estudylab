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
    title: "Cours structures",
    description:
      "Des lecons claires organisees par matiere, chapitre et notion. Contenu adapte du college a la licence.",
    color: "text-brand-vert",
    bg: "bg-brand-vert/10",
  },
  {
    icon: Brain,
    title: "Quiz interactifs IA",
    description:
      "Des quiz generes par intelligence artificielle qui s'adaptent a ton niveau et identifient tes lacunes.",
    color: "text-brand-violet",
    bg: "bg-brand-violet/10",
  },
  {
    icon: FileText,
    title: "Fiches de revision",
    description:
      "Fiches synthetiques generees automatiquement a partir de tes cours. L'essentiel en un coup d'oeil.",
    color: "text-brand-jaune",
    bg: "bg-brand-jaune/10",
  },
  {
    icon: ScanLine,
    title: "Scan de documents",
    description:
      "Importe tes cours en photo ou PDF. L'IA extrait le contenu, genere des quiz et des fiches de revision.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10",
  },
  {
    icon: BarChart3,
    title: "Suivi de progression",
    description:
      "Tableau de bord complet avec statistiques, objectifs et recommandations personnalisees.",
    color: "text-brand-bleu",
    bg: "bg-brand-bleu/10",
  },
  {
    icon: MessageSquare,
    title: "Assistant IA",
    description:
      "Pose tes questions a l'assistant pedagogique. Il explique, corrige et t'aide a comprendre etape par etape.",
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
            Tout pour reussir tes etudes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des outils pedagogiques puissants, propulses par l&apos;IA
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
