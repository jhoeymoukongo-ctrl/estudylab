"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Parfait pour decouvrir la plateforme",
    features: [
      "Acces a 2 matieres",
      "10 requetes IA par jour",
      "Quiz illimites sur les matieres accessibles",
      "Fiches de revision basiques",
      "Suivi de progression",
    ],
    cta: "Commencer gratuitement",
    href: "/inscription",
    popular: false,
  },
  {
    name: "Premium",
    price: "9.99€",
    period: "/mois",
    description: "Pour ceux qui veulent aller plus loin",
    features: [
      "Toutes les matieres sans limite",
      "Requêtes IA illimitées",
      "Assistant IA avance avec streaming",
      "Scan de documents illimite",
      "Fiches de revision avancees",
      "Plan de revision personnalise",
      "Support prioritaire",
    ],
    cta: "Passer en Premium",
    href: "/inscription?plan=premium",
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section id="tarifs" className="py-20 sm:py-28 bg-dark-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Commence gratuitement, passe en premium quand tu es pret
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-dark-border bg-dark-card ${
                plan.popular ? "ring-2 ring-brand-vert" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-vert px-4 py-1 text-xs font-semibold text-white">
                  Le plus populaire
                </div>
              )}
              <CardContent className="p-8">
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-brand-vert"
                      />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: plan.popular ? "default" : "outline",
                      size: "lg",
                    }),
                    "mt-8 w-full"
                  )}
                >
                  {plan.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
