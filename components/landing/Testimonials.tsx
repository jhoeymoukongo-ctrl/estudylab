import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Amina K.",
    level: "Terminale S",
    content:
      "Les quiz IA m'ont permis d'identifier exactement mes lacunes en maths. J'ai gagne 4 points de moyenne en 2 mois !",
    initials: "AK",
    stars: 5,
  },
  {
    name: "Thomas D.",
    level: "3eme",
    content:
      "L'assistant IA est incroyable. Il explique les concepts de physique-chimie mieux que mon manuel. Et les fiches de revision sont parfaites pour le brevet.",
    initials: "TD",
    stars: 5,
  },
  {
    name: "Sarah M.",
    level: "Licence 1 Bio",
    content:
      "Le scan de documents a change ma vie. Je prends mes cours en photo et E-StudyLab genere automatiquement des quiz pour reviser. Genial !",
    initials: "SM",
    stars: 5,
  },
  {
    name: "Youssef B.",
    level: "Seconde",
    content:
      "J'utilise E-StudyLab tous les jours apres les cours. Les fiches de revision sont claires et le suivi de progression me motive.",
    initials: "YB",
    stars: 4,
  },
  {
    name: "Lea P.",
    level: "1ere",
    content:
      "L'IA m'a aide a preparer mon oral de francais. Elle m'a genere un plan de revision adapte a mes dates d'examen. Top !",
    initials: "LP",
    stars: 5,
  },
  {
    name: "Mamadou S.",
    level: "Terminale ES",
    content:
      "Enfin une appli qui comprend le programme francais ! Les cours sont bien structures et les quiz vraiment pertinents.",
    initials: "MS",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="temoignages" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ils nous font confiance
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des milliers d&apos;etudiants progressent avec E-StudyLab
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="border-dark-border bg-dark-card"
            >
              <CardContent className="p-6">
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < t.stars
                          ? "fill-brand-jaune text-brand-jaune"
                          : "text-dark-elevated"
                      }
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-brand-vert/10 text-brand-vert text-xs font-semibold">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
